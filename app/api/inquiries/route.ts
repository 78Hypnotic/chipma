import { validateInquiryPayload } from "../../lib/inquiry";
import { getVerifiedUser } from "../../lib/auth";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function response(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function createFingerprint(request: Request): Promise<string> {
  const address = getClientAddress(request) ?? "unknown";
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? "unknown";
  const bytes = new TextEncoder().encode(`${address}|${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getClientAddress(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip") ??
    forwardedFor ??
    request.headers.get("x-real-ip")
  );
}

function isRateLimited(fingerprint: string, now: number): boolean {
  for (const [key, value] of rateLimits) {
    if (value.resetAt <= now) rateLimits.delete(key);
  }

  const current = rateLimits.get(fingerprint);
  if (!current || current.resetAt <= now) {
    rateLimits.set(fingerprint, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Validates anonymous inquiries, applies a local fast rate limit, and forwards
 * only sanitized data to the key-authenticated Supabase Edge Function. A second
 * persistent rate limit and authoritative price calculation run in Postgres.
 */
export async function POST(request: Request): Promise<Response> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return response({ error: "Anfrage zu groß." }, 413);

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return response({ error: "Anfrage zu groß." }, 413);
  }

  let input: unknown;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return response({ error: "Ungültige Anfrage." }, 400);
  }

  const validation = validateInquiryPayload(input);
  if (!validation.ok) return response({ error: validation.error }, 400);

  const fingerprint = await createFingerprint(request);
  if (isRateLimited(fingerprint, Date.now())) {
    return response({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }, 429);
  }
  if (validation.data.spam) return response({ ok: true }, 202);

  const user = await getVerifiedUser();

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    return response({ error: "Der Anfrage-Service ist derzeit nicht verfügbar." }, 503);
  }

  const backendResponse = await fetch(`${supabaseUrl}/functions/v1/submit-inquiry`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      "Content-Type": "application/json",
      "x-chipma-source-hash": fingerprint,
      "x-chipma-user-agent": request.headers.get("user-agent")?.slice(0, 500) ?? "",
      "x-chipma-origin": request.headers.get("origin")?.slice(0, 255) ?? "",
    },
    body: JSON.stringify({
      name: validation.data.name,
      email: user?.email || validation.data.email,
      userId: user?.id ?? null,
      phone: validation.data.phone,
      company: validation.data.company,
      billingStreet: validation.data.billingStreet,
      billingPostalCode: validation.data.billingPostalCode,
      billingCity: validation.data.billingCity,
      billingCountryCode: validation.data.billingCountryCode,
      vatId: validation.data.vatId,
      message: validation.data.message,
      consent: validation.data.consent,
      configuration: validation.data.configuration,
      quotedTotalCents: Math.round(validation.data.price.total * 100),
    }),
  });

  const result = (await backendResponse.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  if (!backendResponse.ok) {
    const status = backendResponse.status === 429 ? 429 : 502;
    const error =
      status === 429
        ? "Zu viele Anfragen. Bitte versuchen Sie es später erneut."
        : "Die Anfrage konnte nicht gespeichert werden.";
    return response({ error }, status);
  }

  return response(
    {
      ok: true,
      orderId: result?.orderId,
      orderNumber: result?.orderNumber,
      quotedTotalCents: result?.quotedTotalCents,
    },
    201,
  );
}
