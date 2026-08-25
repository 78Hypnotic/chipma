# Supabase-Backend

## Projekt

Das Backend läuft im Supabase-Projekt `ChipMa` in der europäischen Region
`eu-west-1`. Der Website-Server benötigt folgende Umgebungsvariablen:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`: benannter Supabase Secret Key `chipma_site`, nur serverseitig
- `SUPABASE_AUTH_PUBLISHABLE_KEY`: ausschließlich für serverseitige Auth-Sessions

Alle geheimen Werte liegen ausschließlich im Secret Store der Hosting-Plattform.
Die Edge Function erhält ihren privilegierten Datenbank-Client innerhalb der
Supabase-Laufzeit; ein Service-Role-Key wird nicht an die Website ausgegeben.

## Vercel-Deployment

Vercel baut die Anwendung über `npm run build` als natives Next.js-Projekt.
API-Routen laufen in der Region `fra1`. Die drei oben genannten
Variablen müssen getrennt für Production und Preview im Vercel Environment
Store hinterlegt werden; Secret Keys dürfen nicht für den Browser exponiert
werden.

## Request-Flow

1. Das Frontend sendet Rechnungsdaten und Konfiguration an `/api/inquiries`.
2. Die Next-Route begrenzt Payloadgröße und Anfragefrequenz, validiert alle
   Felder und erzeugt einen SHA-256-Fingerprint ohne Speicherung der Roh-IP.
3. Die Route ruft `submit-inquiry` ausschließlich mit dem benannten Secret Key
   `chipma_site` auf. Publishable Keys werden von der Function abgewiesen.
4. Die Edge Function validiert den Payload erneut und schreibt über den
   privilegierten Supabase-Client.
5. Ein Postgres-Trigger validiert die Konfiguration, berechnet den Preis und
   erzwingt atomar das persistente Rate Limit von fünf Anfragen je zehn Minuten.

## Datenmodell

`public.chipma_orders` speichert Rechnungsdaten als unveränderlichen Snapshot,
Konfiguration, serverseitig berechneten Platzhalterpreis, Bearbeitungsstatus und
Einwilligungszeitpunkt. Bei angemeldeten Kunden enthält `user_id` die über
signierte Auth-Claims verifizierte Eigentümer-ID; Gastbestellungen können nach
bestätigter Registrierung ausschließlich über die serverseitige Funktion
`claim_my_chipma_orders()` anhand derselben E-Mail übernommen werden.

`public.chipma_profiles` enthält die kundeneigenen Standard-Rechnungsdaten.
`public.chipma_admin_settings` enthält die zentrale Support-Adresse und den
Analytics-Zeitraum. Roh-IP-Adressen und Logo-Dateien werden nicht gespeichert.

RLS ist auf allen drei Tabellen aktiviert und erzwungen. `anon` besitzt keine
Tabellenrechte. Kunden dürfen nur ihr eigenes Profil und ihre eigenen
Bestellungen lesen. Nutzer erhalten Bestellübersicht, Analytics, Einstellungen
und ein auf die Statusspalte begrenztes Update-Recht nur, wenn der signierte
JWT-Claim `app_metadata.role` exakt `admin` ist. `user_metadata` wird nie zur
Autorisierung verwendet. Die Trigger-, Preis- und Rate-Limit-Funktionen liegen
im nicht exponierten Schema `private`.

## Konto- und Admin-Routen

- `/login`: Anmeldung und Registrierung mit E-Mail-Bestätigung
- `/account`: eigenes Profil und maximal 50 eigene Bestellungen
- `/admin/orders`: maximal 100 aktuelle Bestellungen und Statuspflege
- `/admin/analytics`: aggregierte Auswertung für maximal 1.000 Bestellungen
- `/admin/settings`: zentrale Admin-Einstellungen

Die Next.js-Proxy-Schicht erneuert ausschließlich Auth-Cookies. Autorisierung
erfolgt zusätzlich in jeder Server-Komponente oder Server Action über
`auth.getClaims()` sowie in Postgres über RLS.

Die Supabase-Linter-Warnung für `claim_my_chipma_orders()` ist beabsichtigt:
Die `security definer`-Funktion ist für `authenticated` ausführbar, verwendet
aber keine Parameter und übernimmt ausschließlich Bestellungen, deren
normalisierte E-Mail mit der in `auth.users` bestätigten E-Mail von
`auth.uid()` übereinstimmt. Alle übrigen Rollen besitzen kein Execute-Recht.

## Admin-Auth

Alle Routen unter `/admin/*` und `/api/admin/*` durchlaufen die Supabase-
Session-Aktualisierung. Jede API-Route muss zusätzlich `requireAdmin()` aufrufen;
Middleware allein gilt nicht als Autorisierung. `requireAdmin()` prüft die
signierten Claims mit `auth.getClaims()` und verlangt die Rolle aus
`app_metadata`. Datenbankabfragen laufen anschließend mit dem Benutzer-JWT und
werden zusätzlich durch RLS begrenzt.

Admin-Rollen werden ausschließlich serverseitig gesetzt, zum Beispiel über die
Supabase Admin API:

```ts
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: "admin" },
});
```

Nach einer Rollenänderung muss die Session erneuert werden, damit der neue Claim
im JWT enthalten ist.

## Migration und Function

- Migration: `supabase/migrations/20260804182614_create_chipma_inquiries.sql`
- Security-Migration: `supabase/migrations/20260804203205_security_hardening.sql`
- RLS-Optimierung: `supabase/migrations/20260804204405_optimize_admin_rls.sql`
- Konten und Bestellungen: `supabase/migrations/20260804212500_create_accounts_orders_admin.sql`
- Account-RLS-Optimierung: `supabase/migrations/20260804223000_optimize_accounts_rls.sql`
- Edge Function: `supabase/functions/submit-inquiry/index.ts`
- generierte Typen: `app/lib/database.types.ts`

Änderungen an Preisregeln müssen synchron in
`app/lib/configurator.ts` und der Datenbankfunktion
`private.calculate_chipma_total_cents` vorgenommen und mit Grenzwerten getestet
werden.
