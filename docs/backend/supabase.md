# Supabase-Backend

## Projekt

Das Backend läuft im Supabase-Projekt `ChipMa` in der europäischen Region
`eu-west-1`. Der Website-Server benötigt ausschließlich folgende
Umgebungsvariablen:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Secret- und Service-Role-Keys liegen nicht im Website-Projekt. Die Edge Function
erhält ihren privilegierten Datenbank-Client ausschließlich innerhalb der
Supabase-Laufzeit.

## Request-Flow

1. Das Frontend sendet Kontaktdaten und Konfiguration an `/api/inquiries`.
2. Die Next-Route begrenzt Payloadgröße und Anfragefrequenz, validiert alle
   Felder und erzeugt einen SHA-256-Fingerprint ohne Speicherung der Roh-IP.
3. Die Route ruft `submit-inquiry` mit dem Publishable Key auf.
4. Die Edge Function validiert den Payload erneut und schreibt über den
   privilegierten Supabase-Client.
5. Ein Postgres-Trigger validiert die Konfiguration, berechnet den Preis und
   erzwingt das persistente Rate Limit von fünf Anfragen je zehn Minuten.

## Datenmodell

`public.chipma_inquiries` speichert Kontakt, Konfiguration, serverseitig
berechneten Platzhalterpreis, Bearbeitungsstatus und Einwilligungszeitpunkt.
Roh-IP-Adressen und Logo-Dateien werden nicht gespeichert.

RLS ist aktiviert und erzwungen. Explizite Deny-Policies sperren `anon` und
`authenticated`; nur `service_role` besitzt Tabellenrechte. Die Trigger- und
Preisfunktionen liegen im nicht exponierten Schema `private`.

## Migration und Function

- Migration: `supabase/migrations/20260804182614_create_chipma_inquiries.sql`
- Edge Function: `supabase/functions/submit-inquiry/index.ts`
- generierte Typen: `app/lib/database.types.ts`

Änderungen an Preisregeln müssen synchron in
`app/lib/configurator.ts` und der Datenbankfunktion
`private.calculate_chipma_total_cents` vorgenommen und mit Grenzwerten getestet
werden.
