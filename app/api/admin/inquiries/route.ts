import { requireAdmin } from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function isRateLimited(userId: string, now: number): boolean {
  const current = rateLimits.get(userId);
  if (!current || current.resetAt <= now) {
    rateLimits.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function GET(request: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    const message = auth.status === 403 ? "forbidden" : auth.status === 503 ? "unavailable" : "unauthorized";
    return json({ error: message }, auth.status);
  }
  if (isRateLimited(auth.userId, Date.now())) return json({ error: "rate_limited" }, 429);

  const requestedLimit = Number(new URL(request.url).searchParams.get("limit") ?? DEFAULT_LIMIT);
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > MAX_LIMIT) {
    return json({ error: "invalid_limit" }, 400);
  }

  const { data, error } = await auth.supabase
    .from("chipma_inquiries")
    .select("id, created_at, status, name, email, company, message, configuration, quoted_total_cents, consent_at")
    .order("created_at", { ascending: false })
    .limit(requestedLimit);

  if (error) return json({ error: "query_failed" }, 500);
  return json({ inquiries: data }, 200);
}
