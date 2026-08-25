import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "../auth/actions";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { getVerifiedUser } from "../lib/auth";
import { formatCents, formatDate, formatOrderNumber, ORDER_STATUS_LABELS, type OrderStatus } from "../lib/orders";
import { createServerSupabaseClient } from "../lib/supabase/server";
import { updateProfileAction } from "./actions";

export default async function AccountPage() {
  const user = await getVerifiedUser();
  const supabase = await createServerSupabaseClient();
  if (!user || !supabase) redirect("/login?next=/account");

  const [profileResult, ordersResult] = await Promise.all([
    supabase.from("chipma_profiles").select("full_name, company, phone, billing_street, billing_postal_code, billing_city, billing_country_code, vat_id").eq("id", user.id).maybeSingle(),
    supabase.from("chipma_orders").select("id, order_number, created_at, status, quoted_total_cents, configuration").order("created_at", { ascending: false }).limit(50),
  ]);
  const profile = profileResult.data;
  const orders = ordersResult.data ?? [];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-heading dashboard-heading--row">
        <div><p className="section-kicker">Kundenkonto</p><h1>Hallo {profile?.full_name?.split(" ")[0] ?? user.email}</h1><p>Rechnungsdaten und Bestellungen an einem Ort.</p></div>
        <div className="dashboard-heading__actions">
          {user.isAdmin ? <Link className="ui-button ui-button--outline ui-button--medium" href="/admin/orders">Adminbereich</Link> : null}
          <Link className="ui-button ui-button--ghost ui-button--medium" href="/">Zum Konfigurator</Link>
          <form action={signOutAction}><Button variant="outline">Abmelden</Button></form>
        </div>
      </header>

      <section className="dashboard-grid dashboard-grid--account">
        <form action={updateProfileAction} className="dashboard-card dashboard-form">
          <div><p className="section-kicker">Standardwerte</p><h2>Rechnungsdaten</h2><p>Diese Angaben werden beim nächsten Auftrag vorausgefüllt.</p></div>
          <Field label="Vollständiger Name" name="fullName" defaultValue={profile?.full_name ?? ""} maxLength={120} />
          <Field label="Unternehmen / Verein" name="company" defaultValue={profile?.company ?? ""} maxLength={120} />
          <Field label="Telefon" name="phone" type="tel" defaultValue={profile?.phone ?? ""} maxLength={40} />
          <Field label="Straße und Hausnummer" name="billingStreet" defaultValue={profile?.billing_street ?? ""} maxLength={160} />
          <div className="dashboard-form__row">
            <Field label="PLZ" name="billingPostalCode" defaultValue={profile?.billing_postal_code ?? ""} maxLength={20} />
            <Field label="Ort" name="billingCity" defaultValue={profile?.billing_city ?? ""} maxLength={100} />
          </div>
          <Field label="Ländercode" name="billingCountryCode" defaultValue={profile?.billing_country_code ?? "DE"} minLength={2} maxLength={2} />
          <Field label="USt-IdNr. (optional)" name="vatId" defaultValue={profile?.vat_id ?? ""} maxLength={40} />
          <Button type="submit">Rechnungsdaten speichern</Button>
        </form>

        <section className="dashboard-card dashboard-orders">
          <div><p className="section-kicker">Historie</p><h2>Meine Bestellungen</h2></div>
          {orders.length === 0 ? (
            <div className="dashboard-empty"><p>Noch keine Bestellungen vorhanden.</p><Link href="/#konfigurator">Ersten Chip konfigurieren</Link></div>
          ) : (
            <div className="order-list">
              {orders.map((order) => {
                const configuration = order.configuration as { quantity?: number; shape?: string };
                return (
                  <article className="order-card" key={order.id}>
                    <div><strong>{formatOrderNumber(order.order_number)}</strong><span>{formatDate(order.created_at)}</span></div>
                    <div><span>{configuration.quantity ?? "–"} Stück · {configuration.shape ?? "Konfiguration"}</span><strong>{formatCents(order.quoted_total_cents)}</strong></div>
                    <span className={`status-badge status-badge--${order.status}`}>{ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}</span>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
