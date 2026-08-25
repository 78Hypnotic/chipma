import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { requireAdmin } from "../../lib/admin-auth";
import { updateAdminSettingsAction } from "../actions";

export default async function AdminSettingsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return null;
  const { data: settings } = await auth.supabase.from("chipma_admin_settings").select("support_email, order_notification_email, default_country_code, analytics_lookback_days, updated_at").eq("id", "general").single();

  return (
    <>
      <header className="admin-page-heading"><div><p className="section-kicker">System</p><h1>Admin-Einstellungen</h1><p>Zentrale Kontakt- und Auswertungsparameter.</p></div></header>
      <form action={updateAdminSettingsAction} className="dashboard-card dashboard-form dashboard-form--narrow">
        <Field label="Support-E-Mail" name="supportEmail" type="email" defaultValue={settings?.support_email ?? "printmagbr@gmail.com"} maxLength={254} required />
        <Field label="Bestellbenachrichtigungen" name="notificationEmail" type="email" defaultValue={settings?.order_notification_email ?? "printmagbr@gmail.com"} maxLength={254} required />
        <Field label="Standard-Ländercode" name="defaultCountryCode" defaultValue={settings?.default_country_code ?? "DE"} minLength={2} maxLength={2} required />
        <Field label="Analytics-Zeitraum in Tagen" name="analyticsLookbackDays" type="number" min={7} max={365} defaultValue={settings?.analytics_lookback_days ?? 90} required />
        <Button type="submit">Einstellungen speichern</Button>
      </form>
    </>
  );
}
