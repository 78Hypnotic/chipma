import "server-only";

import { hasAdminRole } from "./admin-role";
import { createServerSupabaseClient } from "./supabase/server";

export interface VerifiedUser {
  readonly id: string;
  readonly email: string;
  readonly isAdmin: boolean;
}

export async function getVerifiedUser(): Promise<VerifiedUser | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, unknown> | undefined;
  if (error || !claims || typeof claims.sub !== "string" || claims.sub === "") {
    return null;
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    isAdmin: hasAdminRole(claims),
  };
}

export function sanitizeNextPath(value: FormDataEntryValue | string | null): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }
  return value;
}
