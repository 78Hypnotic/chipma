import { NextResponse, type NextRequest } from "next/server";
import { sanitizeNextPath } from "../../lib/auth";
import { consumeRequestRateLimit, hashRequestIdentity } from "../../lib/request-rate-limit";
import { createServerSupabaseClient } from "../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const fingerprint = await hashRequestIdentity(`auth-callback|${address}`);
  if (!consumeRequestRateLimit(`auth-callback:${fingerprint}`, 20, 10 * 60 * 1000)) {
    return NextResponse.redirect(new URL("/login?error=rate_limited", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const supabase = await createServerSupabaseClient();
  if (!code || !supabase) {
    return NextResponse.redirect(new URL("/login?error=invalid_callback", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=invalid_callback", request.url));

  await supabase.rpc("claim_my_chipma_orders");
  return NextResponse.redirect(new URL(nextPath, request.url));
}
