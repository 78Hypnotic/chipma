# ChipMa Designsystem

ChipMa übernimmt die visuelle Sprache des PrintMa-Konfigurators, damit beide
Produkte unmittelbar als zusammengehörig erkennbar sind.

## Grundprinzipien

- dunkle, flache Flächen statt dekorativer Effekte
- PrintMa-Gold nur für Fokus, Status und primäre Aktionen
- klare weiße Typografie mit zurückhaltender Sekundärfarbe
- kompakte Controls und niedrige Radien
- technische Produktdarstellung ohne Glassmorphism oder Verläufe

## Tokens

| Token | Wert | Einsatz |
| --- | --- | --- |
| `--background` | `#000000` | Seitenhintergrund |
| `--surface` | `#121212` | große Inhaltsbereiche |
| `--surface-raised` | `#1a1a1a` | Karten und Controls |
| `--border` | `#2a2a2a` | Trennlinien und Eingabefelder |
| `--text` | `#f7f7f7` | primäre Schrift |
| `--muted` | `#a4a4a4` | Hilfs- und Beschreibungstext |
| `--gold` | `#b7a024` | Marke und primäre Interaktion |

Als Schrift wird Inter eingesetzt. Primäre Buttons sind gold mit schwarzer
Schrift, sekundäre Buttons bleiben dunkel mit sichtbarer Kontur. Focus-Ringe
verwenden ebenfalls Gold und bleiben per Tastatur gut erkennbar.

## Responsive Verhalten

Auf Desktop bleibt die Vorschau neben dem Formular sticky. Unterhalb des
Desktop-Breakpoints wird sie vor das Formular gesetzt, damit Nutzer Preis und
Ergebnis früh sehen. Karten, Tabellen und Aktionsflächen wechseln auf schmalen
Geräten in einspaltige Layouts.

## Referenz

Der ursprüngliche Entwurf liegt unter
`docs/design/ChipMa Konfigurator und Platzhalter.zip`.
