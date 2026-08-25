"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { consumeRequestRateLimit, hashRequestIdentity } from "../lib/request-rate-limit";
import { sanitizeNextPath } from "../lib/auth";
import { createServerSupabaseClient } from "../lib/supabase/server";
import type { AuthActionState } from "./state";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,72}$/;
const AUTH_WINDOW_MS = 10 * 60 * 1000;

async function allowAuthAttempt(scope: string): Promise<boolean> {
  const requestHeaders = await headers();
  const address = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const fingerprint = await hashRequestIdentity(`${scope}|${address}`);
  return consumeRequestRateLimit(`auth:${fingerprint}`, 10, AUTH_WINDOW_MS);
}

function readCredentials(formData: FormData, requireStrongPassword: boolean) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordIsValid = requireStrongPassword
    ? STRONG_PASSWORD_PATTERN.test(password)
    : password.length >= 8 && password.length <= 72;
  if (!EMAIL_PATTERN.test(email) || email.length > 254 || !passwordIsValid) {
    return null;
  }
  return { email, password };
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!(await allowAuthAttempt("sign-in"))) {
    return { status: "error", message: "Zu viele Versuche. Bitte später erneut probieren." };
  }

  const credentials = readCredentials(formData, false);
  if (!credentials) {
    return { status: "error", message: "Bitte gültige Zugangsdaten eingeben." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: "Anmeldung derzeit nicht verfügbar." };

  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) return { status: "error", message: "E-Mail oder Passwort ist nicht korrekt." };

  await supabase.rpc("claim_my_chipma_orders");
  redirect(sanitizeNextPath(formData.get("next")));
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!(await allowAuthAttempt("sign-up"))) {
    return { status: "error", message: "Zu viele Versuche. Bitte später erneut probieren." };
  }

  const credentials = readCredentials(formData, true);
  const fullName = String(formData.get("fullName") ?? "").trim().slice(0, 120);
  const confirmation = String(formData.get("passwordConfirmation") ?? "");
  if (!credentials || !fullName || credentials.password !== confirmation) {
    return { status: "error", message: "Bitte alle Felder vollständig und korrekt ausfüllen." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: "Registrierung derzeit nicht verfügbar." };

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const nextPath = sanitizeNextPath(formData.get("next"));
  const emailRedirectTo = `${protocol}://${host}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: { data: { full_name: fullName }, emailRedirectTo },
  });

  if (error) return { status: "error", message: "Das Konto konnte nicht erstellt werden." };
  if (data.session) {
    await supabase.rpc("claim_my_chipma_orders");
    redirect(nextPath);
  }

  return {
    status: "success",
    message: "Konto angelegt. Bitte bestätige jetzt die E-Mail-Adresse.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
