import { requireAdmin } from "../../lib/admin-auth";
import { formatCents, ORDER_STATUS_LABELS, type OrderStatus } from "../../lib/orders";

async function getAnalyticsStartDate(lookbackDays: number): Promise<string> {
  return new Date(Date.now() - lookbackDays * 86_400_000).toISOString();
}

export default async function AdminAnalyticsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return null;
  const { data: settings } = await auth.supabase.from("chipma_admin_settings").select("analytics_lookback_days").eq("id", "general").single();
  const lookbackDays = settings?.analytics_lookback_days ?? 90;
  const since = await getAnalyticsStartDate(lookbackDays);
  const { data: orders } = await auth.supabase.from("chipma_orders").select("created_at, status, quoted_total_cents").gte("created_at", since).order("created_at", { ascending: false }).limit(1000);
  const rows = orders ?? [];
  const totalValue = rows.reduce((sum, order) => sum + order.quoted_total_cents, 0);
  const completedValue = rows.filter((order) => order.status === "completed").reduce((sum, order) => sum + order.quoted_total_cents, 0);
  const statusCounts = rows.reduce<Record<string, number>>((counts, order) => ({ ...counts, [order.status]: (counts[order.status] ?? 0) + 1 }), {});
  const months = rows.reduce<Record<string, number>>((counts, order) => { const month = order.created_at.slice(0, 7); counts[month] = (counts[month] ?? 0) + 1; return counts; }, {});

  return (
    <>
      <header className="admin-page-heading"><div><p className="section-kicker">Letzte {lookbackDays} Tage</p><h1>Analytics</h1><p>Begrenzt auf 1.000 Bestellungen im gewählten Zeitraum.</p></div></header>
      <section className="metric-grid"><article className="metric-card"><span>Bestellungen</span><strong>{rows.length}</strong></article><article className="metric-card"><span>Angefragter Wert</span><strong>{formatCents(totalValue)}</strong></article><article className="metric-card"><span>Abgeschlossen</span><strong>{formatCents(completedValue)}</strong></article><article className="metric-card"><span>Ø Bestellwert</span><strong>{formatCents(rows.length ? Math.round(totalValue / rows.length) : 0)}</strong></article></section>
      <section className="dashboard-grid"><article className="dashboard-card"><h2>Statusverteilung</h2><div className="analytics-list">{Object.entries(statusCounts).map(([status, count]) => <div key={status}><span>{ORDER_STATUS_LABELS[status as OrderStatus] ?? status}</span><strong>{count}</strong></div>)}</div></article><article className="dashboard-card"><h2>Bestellungen pro Monat</h2><div className="analytics-list">{Object.entries(months).sort(([a], [b]) => b.localeCompare(a)).map(([month, count]) => <div key={month}><span>{month}</span><strong>{count}</strong></div>)}</div></article></section>
    </>
  );
}
