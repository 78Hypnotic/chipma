import "server-only";

import { hasAdminRole } from "./admin-role";
import { createServerSupabaseClient } from "./supabase/server";

type AdminAuthResult =
  | {
      readonly ok: true;
      readonly userId: string;
      readonly supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
    }
  | { readonly ok: false; readonly status: 401 | 403 | 503 };

/**
 * Verifies the signed Supabase Auth claims on the server and requires an admin
 * role from app_metadata. Client-provided user_metadata is never authorized.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, status: 503 };

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, unknown> | undefined;
  if (error || !claims) {
    return { ok: false, status: 401 };
  }
  if (!hasAdminRole(claims)) return { ok: false, status: 403 };

  return { ok: true, userId: claims.sub, supabase };
}
