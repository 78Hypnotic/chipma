# ChipMa Konfigurator

Öffentliche Produktseite und interaktiver Konfigurator für individuelle
Pfandchips von PrintMa. Das Interface übernimmt das dunkle PrintMa-Designsystem
und ergänzt es um eine Live-Vorschau sowie eine transparente
Platzhalterkalkulation.

## Entwicklung

Voraussetzung ist Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Die lokale Anwendung ist anschließend standardmäßig unter
`http://localhost:3000` erreichbar.

## Qualitätssicherung

```bash
npx tsc --noEmit
npm run lint
npm test
npm audit
```

`npm test` erstellt zuerst den Produktions-Build und führt danach die
Domain-Logik- und SSR-Tests aus.

## Projektstruktur

- `app/components/ChipMaApp.tsx`: Konfigurator, Vorschau und Anfragefluss
- `app/components/MarketingSections.tsx`: Produkt- und Informationsbereiche
- `app/components/ui/`: wiederverwendbare UI-Bausteine
- `app/lib/configurator.ts`: validierte Konfiguration und Preislogik
- `tests/`: Logik- und Renderingtests
- `docs/`: Feature-, Design- und Architekturhinweise

## Anfragefluss

Das Anfrageformular sendet validierte Kontaktdaten und die Konfiguration über
eine gleichnamige Website-API an eine key-authentifizierte Supabase Edge
Function. Postgres berechnet den angezeigten Preis erneut, erzwingt ein
persistentes Rate Limit und speichert die Anfrage in einer per RLS
abgeschotteten Tabelle. Die E-Mail-Anfrage bleibt als Fallback verfügbar.

Für die lokale Entwicklung werden folgende Werte benötigt:

```bash
cp .env.example .env.local
```

Hochgeladene Logos bleiben weiterhin im Browser; gespeichert wird nur der
bereinigte Dateiname. API-Schlüssel und Secrets werden nicht committed.

Die angezeigten Preise sind als Platzhalter gekennzeichnet und müssen vor einem
Produktivstart fachlich freigegeben werden.
