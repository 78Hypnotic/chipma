import type { Metadata } from "next";
import { ChipMaApp, type ChipMaAccount } from "./components/ChipMaApp";
import { getVerifiedUser } from "./lib/auth";
import { createServerSupabaseClient } from "./lib/supabase/server";

export const metadata: Metadata = {
  title: "ChipMa – individuelle Pfandchips ab 25 Stück",
  description:
    "Individuelle Pfandchips und Wertmarken aus dem 3D-Drucker: eigene Form, Farbe, Beschriftung und Personalisierung – gefertigt in Engen.",
};

export default async function Home() {
  const user = await getVerifiedUser();
  let account: ChipMaAccount | null = null;

  if (user) {
    const supabase = await createServerSupabaseClient();
    const profileResult = supabase
      ? await supabase
          .from("chipma_profiles")
          .select("full_name, company, phone, billing_street, billing_postal_code, billing_city, billing_country_code, vat_id")
          .eq("id", user.id)
          .maybeSingle()
      : null;
    const profile = profileResult?.data;
    account = {
      email: user.email,
      isAdmin: user.isAdmin,
      defaults: {
        name: profile?.full_name ?? "",
        company: profile?.company ?? "",
        phone: profile?.phone ?? "",
        billingStreet: profile?.billing_street ?? "",
        billingPostalCode: profile?.billing_postal_code ?? "",
        billingCity: profile?.billing_city ?? "",
        billingCountryCode: profile?.billing_country_code ?? "DE",
        vatId: profile?.vat_id ?? "",
      },
    };
  }

  return <ChipMaApp account={account} />;
}
