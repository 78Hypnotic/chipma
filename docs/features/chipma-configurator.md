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

Die laufende Konfiguration bleibt bis zum Absenden im React-State. Das
Anfrageformular sendet Kontaktdaten und Konfiguration über `/api/inquiries` an
eine Supabase Edge Function. Die API-Route und Postgres erzwingen jeweils ein
Limit von fünf Anfragen innerhalb von zehn Minuten.

User-Input wird begrenzt und bereinigt:

- Chiptexte: Steuerzeichen entfernt, maximal 20 Zeichen
- Menge: auf 25 bis 2.000 Stück begrenzt
- Logo: ausschließlich SVG, PNG, JPEG oder PDF, maximal 5 MB
- Dateiname: vor der Übernahme in die Zusammenfassung bereinigt

Logo-Dateien werden nur über eine lokale Object-URL dargestellt und nicht
übertragen. Gespeichert wird nur der bereinigte Dateiname. PDF-Dateien werden
akzeptiert, aber aus Sicherheits- und Kompatibilitätsgründen nicht direkt im
Browser gerendert.

## Preislogik

Alle Preisparameter liegen zentral in `app/lib/configurator.ts`. Intern wird in
Cent gerechnet, um Rundungsfehler zu vermeiden. Grundpreis, Aufschläge,
Einmalkosten und Versand werden getrennt ausgewiesen.

Die Werte stammen aus dem ursprünglichen Designentwurf und sind ausdrücklich
eine unverbindliche Platzhalterkalkulation. Vor dem Produktivstart müssen
Staffeln, Mehrwertsteuerbehandlung, Aufschläge und Versand fachlich freigegeben
werden.

## Anfrage

`validateInquiryPayload` prüft und bereinigt Kontaktdaten sowie jede
Konfigurationsoption. Die Supabase Edge Function ist ausschließlich mit einem
Publishable Key erreichbar und schreibt privilegiert in die Datenbank. Die
Tabelle gewährt weder `anon` noch `authenticated` direkten Zugriff. Ein
Postgres-Trigger berechnet den Preis unabhängig vom Client und speichert statt
der IP-Adresse nur einen SHA-256-Fingerprint zur Missbrauchsprävention.

`buildInquirySummary` erzeugt zusätzlich die Textzusammenfassung für Kopieren
und den weiterhin verfügbaren `mailto:`-Fallback.
