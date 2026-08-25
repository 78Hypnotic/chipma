import { requireAdmin } from "../../lib/admin-auth";
import { formatCents, formatDate, formatOrderNumber, ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "../../lib/orders";
import { updateOrderStatusAction } from "../actions";

export default async function AdminOrdersPage({ searchParams }: { readonly searchParams: Promise<{ status?: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return null;
  const { status } = await searchParams;

  let query = auth.supabase.from("chipma_orders").select("id, order_number, created_at, status, customer_name, email, phone, billing_company, billing_street, billing_postal_code, billing_city, billing_country_code, vat_id, configuration, quoted_total_cents, message").order("created_at", { ascending: false }).limit(100);
  if (ORDER_STATUSES.includes(status as OrderStatus)) query = query.eq("status", status as OrderStatus);
  const { data: orders } = await query;

  return (
    <>
      <header className="admin-page-heading"><div><p className="section-kicker">Auftragsverwaltung</p><h1>Bestellungen</h1><p>Maximal 100 aktuelle Datensätze, durch RLS auf Admins begrenzt.</p></div><form className="admin-filter"><label htmlFor="status">Status</label><select id="status" name="status" defaultValue={status ?? ""}><option value="">Alle</option>{ORDER_STATUSES.map((value) => <option key={value} value={value}>{ORDER_STATUS_LABELS[value]}</option>)}</select><button type="submit">Filtern</button></form></header>
      <div className="admin-order-list">
        {(orders ?? []).map((order) => {
          const configuration = order.configuration as { quantity?: number; shape?: string; primaryColor?: string };
          return (
            <article className="dashboard-card admin-order" key={order.id}>
              <header><div><strong>{formatOrderNumber(order.order_number)}</strong><span>{formatDate(order.created_at)}</span></div><span className={`status-badge status-badge--${order.status}`}>{ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}</span></header>
              <div className="admin-order__grid"><div><small>Kunde</small><strong>{order.customer_name}</strong><a href={`mailto:${order.email}`}>{order.email}</a><span>{order.phone ?? "Keine Telefonnummer"}</span></div><div><small>Rechnung</small><strong>{order.billing_company ?? order.customer_name}</strong><span>{order.billing_street}</span><span>{order.billing_postal_code} {order.billing_city} · {order.billing_country_code}</span>{order.vat_id ? <span>USt-IdNr. {order.vat_id}</span> : null}</div><div><small>Konfiguration</small><strong>{configuration.quantity ?? "–"} Stück · {configuration.shape ?? "–"}</strong><span>{configuration.primaryColor ?? "–"}</span><strong>{formatCents(order.quoted_total_cents)}</strong></div></div>
              {order.message ? <p className="admin-order__message">{order.message}</p> : null}
              <form action={updateOrderStatusAction} className="admin-order__status"><input type="hidden" name="orderId" value={order.id} /><label htmlFor={`status-${order.id}`}>Status ändern</label><select id={`status-${order.id}`} name="status" defaultValue={order.status}>{ORDER_STATUSES.map((value) => <option key={value} value={value}>{ORDER_STATUS_LABELS[value]}</option>)}</select><button type="submit">Speichern</button></form>
            </article>
          );
        })}
        {(orders ?? []).length === 0 ? <div className="dashboard-card dashboard-empty"><p>Keine Bestellungen für diesen Filter.</p></div> : null}
      </div>
    </>
  );
}
