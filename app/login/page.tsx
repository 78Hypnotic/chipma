import Link from "next/link";
import { redirect } from "next/navigation";
import { getVerifiedUser, sanitizeNextPath } from "../lib/auth";
import { AuthForms } from "./AuthForms";

export default async function LoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, user] = await Promise.all([searchParams, getVerifiedUser()]);
  if (user) redirect(user.isAdmin ? "/admin/orders" : "/account");

  return (
    <main className="dashboard-shell auth-shell">
      <header className="dashboard-heading auth-heading">
        <div className="auth-heading__bar">
          <Link href="/" className="brand-mark" aria-label="Zur ChipMa-Startseite">
            <span className="brand-mark__name">Chip<span>Ma</span></span>
            <span className="brand-mark__byline">by PrintMa</span>
          </Link>
          <Link href="/" className="auth-back-link">← Zum Konfigurator</Link>
        </div>
        <div className="auth-heading__content">
          <div><p className="section-kicker">Kundenbereich</p><h1>Mein ChipMa</h1><p>Bestellungen speichern, Rechnungsdaten verwalten und den Status verfolgen.</p></div>
          <div className="auth-benefits" aria-label="Vorteile des Kundenkontos">
            <span><strong>01</strong> Bestellstatus im Blick</span>
            <span><strong>02</strong> Rechnungsdaten hinterlegen</span>
            <span><strong>03</strong> Gastbestellungen übernehmen</span>
          </div>
        </div>
      </header>
      <AuthForms nextPath={sanitizeNextPath(next ?? null)} />
    </main>
  );
}
