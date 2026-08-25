"use server";

import { revalidatePath } from "next/cache";
import { getVerifiedUser } from "../lib/auth";
import { consumeRequestRateLimit } from "../lib/request-rate-limit";
import { createServerSupabaseClient } from "../lib/supabase/server";

export async function updateProfileAction(formData: FormData): Promise<void> {
  const user = await getVerifiedUser();
  const supabase = await createServerSupabaseClient();
  if (!user || !supabase || !consumeRequestRateLimit(`profile:${user.id}`, 20, 60_000)) return;

  const countryCode = String(formData.get("billingCountryCode") ?? "DE").trim().toUpperCase();
  const fields = {
    full_name: String(formData.get("fullName") ?? "").trim().slice(0, 120) || null,
    company: String(formData.get("company") ?? "").trim().slice(0, 120) || null,
    phone: String(formData.get("phone") ?? "").trim().slice(0, 40) || null,
    billing_street: String(formData.get("billingStreet") ?? "").trim().slice(0, 160) || null,
    billing_postal_code: String(formData.get("billingPostalCode") ?? "").trim().slice(0, 20) || null,
    billing_city: String(formData.get("billingCity") ?? "").trim().slice(0, 100) || null,
    billing_country_code: /^[A-Z]{2}$/.test(countryCode) ? countryCode : "DE",
    vat_id: String(formData.get("vatId") ?? "").trim().slice(0, 40) || null,
  };

  await supabase.from("chipma_profiles").update(fields).eq("id", user.id);
  revalidatePath("/account");
}
