import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "../auth/actions";
import { Button } from "../components/ui/Button";
import { requireAdmin } from "../lib/admin-auth";

export default async function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/login?next=/admin/orders");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="brand-mark" aria-label="ChipMa Startseite"><span className="brand-mark__name">Chip<span>Ma</span></span><span className="brand-mark__byline">Admin</span></Link>
        <nav aria-label="Admin-Navigation">
          <Link href="/admin/orders">Bestellungen</Link>
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/settings">Einstellungen</Link>
        </nav>
        <div className="admin-sidebar__footer"><Link href="/account">Mein Konto</Link><form action={signOutAction}><Button variant="outline" size="small">Abmelden</Button></form></div>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
