import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../database.types";

function getAuthConfiguration(): { url: string; publishableKey: string } | null {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_AUTH_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  return url && publishableKey ? { url, publishableKey } : null;
}

export async function createServerSupabaseClient() {
  const configuration = getAuthConfiguration();
  if (!configuration) return null;

  const cookieStore = await cookies();
  return createServerClient<Database>(configuration.url, configuration.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Session refresh is handled by proxy.ts for protected routes.
        }
      },
    },
  });
}
