import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const MAX_BODY_BYTES = 16_384;
const SOURCE_HASH_PATTERN = /^[a-f0-9]{64}$/;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedString(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function isValidConfiguration(value: unknown): value is UnknownRecord {
  if (!isRecord(value)) return false;

  const extras = value.extras;
  return (
    ["rund", "sechs", "quadrat", "wappen", "herz", "kontur"].includes(String(value.shape)) &&
    ["23", "25", "30", "35"].includes(String(value.size)) &&
    typeof value.primaryColor === "string" &&
    typeof value.secondaryColor === "string" &&
    typeof value.twoTone === "boolean" &&
    ["text", "logo", "beides"].includes(String(value.motif)) &&
    typeof value.text === "string" &&
    value.text.length <= 20 &&
    typeof value.logoName === "string" &&
    value.logoName.length <= 255 &&
    ["sans", "block", "mono"].includes(String(value.font)) &&
    ["erhaben", "vertieft", "keine"].includes(String(value.embossing)) &&
    typeof value.personalization === "boolean" &&
    ["nummer", "namen", "datum"].includes(String(value.personalizationType)) &&
    Array.isArray(extras) &&
    extras.length <= 4 &&
    extras.every((entry) => ["oese", "oeffner", "box", "spender"].includes(String(entry))) &&
    Number.isInteger(value.quantity) &&
    Number(value.quantity) >= 25 &&
    Number(value.quantity) <= 2_000
  );
}

function jsonResponse(body: UnknownRecord, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Accepts only key-authenticated server requests, validates the bounded payload,
 * and persists it through the privileged server client. Database triggers apply
 * authoritative price calculation and the persistent ten-minute rate limit.
 */
const handler = {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (request, context) => {
    if (request.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405);
    }

    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: "payload_too_large" }, 413);
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: "payload_too_large" }, 413);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "invalid_json" }, 400);
    }

    if (!isRecord(payload)) {
      return jsonResponse({ error: "invalid_payload" }, 400);
    }

    const sourceHash = request.headers.get("x-chipma-source-hash") ?? "";
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (
      !SOURCE_HASH_PATTERN.test(sourceHash) ||
      !isBoundedString(payload.name, 1, 80) ||
      !emailIsValid ||
      email.length > 254 ||
      (payload.company !== "" && payload.company != null && !isBoundedString(payload.company, 1, 120)) ||
      (payload.message !== "" && payload.message != null && !isBoundedString(payload.message, 1, 1000)) ||
      payload.consent !== true ||
      !isValidConfiguration(payload.configuration)
    ) {
      return jsonResponse({ error: "invalid_payload" }, 400);
    }

    const { data, error } = await context.supabaseAdmin
      .from("chipma_inquiries")
      .insert({
        name: String(payload.name).trim(),
        email,
        company: typeof payload.company === "string" ? payload.company.trim() || null : null,
        message: typeof payload.message === "string" ? payload.message.trim() || null : null,
        configuration: payload.configuration,
        quoted_total_cents: 0,
        pricing_version: "pending-trigger",
        source_hash: sourceHash,
        user_agent: request.headers.get("x-chipma-user-agent")?.slice(0, 500) ?? null,
        origin: request.headers.get("x-chipma-origin")?.slice(0, 255) ?? null,
        consent_at: new Date().toISOString(),
      })
      .select("id, quoted_total_cents")
      .single();

    if (error) {
      if (error.message.includes("rate_limit_exceeded")) {
        return jsonResponse({ error: "rate_limit_exceeded" }, 429);
      }
      return jsonResponse({ error: "persistence_failed" }, 500);
    }

    return jsonResponse(
      {
        ok: true,
        inquiryId: data.id,
        quotedTotalCents: data.quoted_total_cents,
      },
      201,
    );
  }),
};

export default handler;
