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

Die Website speichert keine Kundendaten. Ein Klick auf „Unverbindlich
anfragen“ öffnet das lokale E-Mail-Programm mit einer vorausgefüllten
Konfigurationszusammenfassung. Hochgeladene Logos bleiben für die Vorschau im
Browser und werden nicht an einen Server übertragen.

Die angezeigten Preise sind als Platzhalter gekennzeichnet und müssen vor einem
Produktivstart fachlich freigegeben werden.
