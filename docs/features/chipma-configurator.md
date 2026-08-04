# ChipMa Konfigurator

## Ziel

Der Konfigurator führt Interessenten ohne Anmeldung durch Form, Größe, Farbe,
Motiv, Personalisierung, Extras und Menge. Vorschau und Preis reagieren direkt
auf jede Änderung; die finale Anfrage wird als vorausgefüllte E-Mail an PrintMa
übergeben.

## Funktionsumfang

- sechs Formen inklusive eigener Kontur
- vier Größen und dreizehn Grundfarben
- optionale zweite Farbe
- Text, Logo oder kombinierte Gestaltung
- Prägung, Einzelpersonalisierung und vier Extras
- Staffelpreise von 25 bis 2.000 Stück
- responsive Live-Vorschau und transparente Preisaufschlüsselung
- kopierbare Konfigurationszusammenfassung

## Daten und Sicherheit

Die Konfiguration bleibt ausschließlich im React-State. Es gibt keine API-Route,
keine Datenbank und keine serverseitige Speicherung. Damit ist für den aktuellen
Anfragefluss kein serverseitiges Rate Limiting erforderlich.

User-Input wird begrenzt und bereinigt:

- Chiptexte: Steuerzeichen entfernt, maximal 20 Zeichen
- Menge: auf 25 bis 2.000 Stück begrenzt
- Logo: ausschließlich SVG, PNG, JPEG oder PDF, maximal 5 MB
- Dateiname: vor der Übernahme in die Zusammenfassung bereinigt

Logo-Dateien werden nur über eine lokale Object-URL dargestellt und nicht
übertragen. PDF-Dateien werden akzeptiert, aber aus Sicherheits- und
Kompatibilitätsgründen nicht direkt im Browser gerendert.

## Preislogik

Alle Preisparameter liegen zentral in `app/lib/configurator.ts`. Intern wird in
Cent gerechnet, um Rundungsfehler zu vermeiden. Grundpreis, Aufschläge,
Einmalkosten und Versand werden getrennt ausgewiesen.

Die Werte stammen aus dem ursprünglichen Designentwurf und sind ausdrücklich
eine unverbindliche Platzhalterkalkulation. Vor dem Produktivstart müssen
Staffeln, Mehrwertsteuerbehandlung, Aufschläge und Versand fachlich freigegeben
werden.

## Anfrage

`buildInquirySummary` erzeugt eine reine Textzusammenfassung. Der Client
URL-kodiert diese zusammen mit dem Betreff in einem `mailto:`-Link an
`printmagbr@gmail.com`. Für einen späteren serverseitigen Versand sind
Validierung, Authentifizierung und Rate Limiting verpflichtend nachzurüsten.
