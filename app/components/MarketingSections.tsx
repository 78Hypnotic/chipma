import { PRINTMA_CONTACT } from "../lib/contact";

type Benefit = Readonly<{
  marker: string;
  title: string;
  description: string;
  comparison: string;
}>;

type Application = Readonly<{
  title: string;
  description: string;
}>;

type Specification = Readonly<{
  label: string;
  value: string;
}>;

type ProcessStep = Readonly<{
  title: string;
  description: string;
}>;

type FaqEntry = Readonly<{
  question: string;
  answer: string;
}>;

const benefits = [
  {
    marker: "25+",
    title: "Kleinstauflagen ab 25 Stück",
    description:
      "Sie bestellen die Menge, die Sie für Ihr Fest, Ihren Verein oder Ihr Unternehmen tatsächlich benötigen.",
    comparison:
      "Klassische Fertigungsverfahren rechnen sich häufig erst bei deutlich größeren Stückzahlen.",
  },
  {
    marker: "FORM",
    title: "Freie Formen statt Standardwerkzeug",
    description:
      "Ob Wappen, Herz, Sechseck oder eine Kontur entlang Ihres Logos: Die Außenkante kann passend zu Ihrem Motiv gefertigt werden.",
    comparison:
      "Im FDM-Druck ist für eine neue Kontur kein separates Spritzgusswerkzeug erforderlich.",
  },
  {
    marker: "001",
    title: "Jeder Chip kann ein Einzelstück sein",
    description:
      "Fortlaufende Nummern, Namen oder ein Datum lassen sich innerhalb einer Serie individuell variieren.",
    comparison:
      "Damit können Sie Chips zuordnen, personalisieren oder als Erinnerungsstück gestalten.",
  },
] as const satisfies readonly Benefit[];

const applications = [
  {
    title: "Vereine",
    description:
      "Getränke- und Essensmarken in Vereinsfarben oder als Kontur des Vereinswappens.",
  },
  {
    title: "Feuerwehren",
    description:
      "Nummerierte Marken für Helferteams, Veranstaltungen oder die interne Ausgabe.",
  },
  {
    title: "Hochzeiten",
    description:
      "Herzförmige Getränkemarken mit Namen und Datum, die zugleich als Andenken dienen.",
  },
  {
    title: "Gastronomie",
    description:
      "Wert-, Pfand- oder Treuemarken für Foodtrucks, Cafés und temporäre Ausschankstellen.",
  },
  {
    title: "Festivals",
    description:
      "Farblich getrennte Chipserien für verschiedene Getränke, Bereiche oder Gültigkeiten.",
  },
  {
    title: "Unternehmen",
    description:
      "Gebrandete Marken für Betriebsfeste, Promotions, Einlass oder interne Veranstaltungen.",
  },
] as const satisfies readonly Application[];

const specifications = [
  {
    label: "Kunststoff",
    value:
      "PLA auf Basis nachwachsender Rohstoffe. Das Material ist durchgefärbt und wird nicht nachträglich lackiert.",
  },
  {
    label: "Materialstärke",
    value:
      "Standardmäßig 3 mm; je nach Ausführung sind auch 2 mm oder 4 mm möglich.",
  },
  {
    label: "Reinigung",
    value:
      "Nicht spülmaschinengeeignet. PLA kann sich ab etwa 55 °C verformen. Reinigen Sie die Chips von Hand mit lauwarmem Wasser und Spülmittel.",
  },
  {
    label: "Witterung",
    value:
      "Regen und kurzzeitige Nässe sind unproblematisch. Dauerhafte direkte Sonne und große Hitze, etwa hinter einer Windschutzscheibe, sollten vermieden werden.",
  },
  {
    label: "Lagerung",
    value:
      "Für eine lange Nutzungsdauer sollten die Chips zwischen den Einsätzen trocken und kühl aufbewahrt werden.",
  },
  {
    label: "Entsorgung",
    value:
      "PLA gehört nicht in den Bioabfall. Ohne örtlich verfügbaren industriellen Verwertungsweg wird es über den Restmüll entsorgt.",
  },
  {
    label: "Verfahren",
    value:
      "FDM-Druck mit 0,2 mm Schichthöhe. Die feine, fühlbare Schichtstruktur bleibt sichtbar und unterscheidet das Ergebnis bewusst von Spritzguss.",
  },
] as const satisfies readonly Specification[];

const processSteps = [
  {
    title: "Konfigurieren",
    description:
      "Wählen Sie Form, Größe, Farbe, Motiv und Menge direkt im Konfigurator aus.",
  },
  {
    title: "Motiv übermitteln",
    description:
      "Senden Sie Ihr Logo in dem Format, das Ihnen vorliegt. Für eine individuelle Außenkontur wird eine Vektordatei benötigt.",
  },
  {
    title: "Musterbild freigeben",
    description:
      "Vor der Produktion erhalten Sie ein maßstabsgetreues Musterbild und geben den Entwurf ausdrücklich frei.",
  },
  {
    title: "Produktion und Versand",
    description:
      "Nach Ihrer Freigabe werden die Chips in Engen gefertigt und anschließend versendet. Größere Mengen werden terminlich abgestimmt.",
  },
] as const satisfies readonly ProcessStep[];

const faqEntries = [
  {
    question: "Wie viele Chips muss ich mindestens bestellen?",
    answer:
      "Die Mindestmenge beträgt 25 Stück. Mengen oberhalb des im Konfigurator verfügbaren Bereichs können Sie direkt anfragen.",
  },
  {
    question: "Wie lange dauert die Fertigung?",
    answer:
      "Für bis zu 500 Stück sind nach Freigabe des Musterbildes in der Regel 5 bis 8 Werktage vorgesehen. Für größere Mengen erhalten Sie einen abgestimmten Termin.",
  },
  {
    question: "In welchem Format wird mein Logo benötigt?",
    answer:
      "Ideal sind SVG, PDF oder EPS. PNG und JPG können ebenfalls geprüft werden, wenn sie ausreichend groß vorliegen. Für eine individuelle Außenkontur ist eine Vektordatei erforderlich.",
  },
  {
    question: "Sind Sonderformen möglich?",
    answer:
      "Ja. Neben vorbereiteten Formen wie Wappen, Herz und Sechseck kann die Außenkontur an ein geeignetes Logo angepasst werden. Sehr feine Spitzen und Linien müssen dabei für den Gebrauch vereinfacht werden.",
  },
  {
    question: "Dürfen die Chips in die Spülmaschine?",
    answer:
      "Nein. PLA kann sich bei den dort üblichen Temperaturen verformen. Handwäsche mit lauwarmem Wasser und Spülmittel ist die geeignete Reinigung.",
  },
  {
    question: "Kann ich identische Chips später nachbestellen?",
    answer:
      "Ja. Geben Sie bei Ihrer Anfrage an, dass es sich um eine Nachbestellung handelt, damit Druckdaten und Farbauswahl abgeglichen werden können. Zwischen Materialchargen sind geringe Farbabweichungen möglich.",
  },
  {
    question: "Erhalte ich vor der Produktion ein Muster?",
    answer:
      "Sie erhalten vor Produktionsbeginn ein digitales, maßstabsgetreues Musterbild zur Freigabe. Einen gedruckten Musterchip stimmen Sie bitte individuell mit PrintMa ab.",
  },
] as const satisfies readonly FaqEntry[];

/**
 * Renders the static product education, application, material, process, FAQ,
 * and contact sections that complete the ChipMa landing page.
 */
export function MarketingSections() {
  return (
    <>
      <section
        className="marketing-section marketing-section--muted why-section"
        aria-labelledby="warum-chipma-heading"
      >
        <div className="marketing-section__inner">
          <header className="marketing-section__header">
            <p className="marketing-section__eyebrow">Kleine Serie. Große Wirkung.</p>
            <h2 id="warum-chipma-heading">Warum ChipMa</h2>
            <p className="marketing-section__intro">
              Einen einfachen Standardchip finden Sie vielerorts. ChipMa ist für
              individuelle Formen, kleine Mengen und personalisierte Serien
              gemacht.
            </p>
          </header>

          <div className="benefit-grid">
            {benefits.map((benefit) => (
              <article className="benefit-card" key={benefit.title}>
                <span className="benefit-card__marker" aria-hidden="true">
                  {benefit.marker}
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
                <p className="benefit-card__comparison">
                  {benefit.comparison}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="anwendungen"
        className="marketing-section applications-section"
        aria-labelledby="anwendungen-heading"
      >
        <div className="marketing-section__inner">
          <header className="marketing-section__header">
            <p className="marketing-section__eyebrow">Vielseitig einsetzbar</p>
            <h2 id="anwendungen-heading">Anwendungen</h2>
            <p className="marketing-section__intro">
              Pfandchips und Wertmarken lassen sich passend zu Anlass, Ausgabe
              und Organisation gestalten.
            </p>
          </header>

          <div className="application-grid">
            {applications.map((application) => (
              <article className="application-card" key={application.title}>
                <h3>{application.title}</h3>
                <p>{application.description}</p>
              </article>
            ))}
          </div>

          <div className="marketing-section__action">
            <a className="button button--secondary" href="#konfigurator">
              Eigenen Chip konfigurieren
            </a>
          </div>
        </div>
      </section>

      <section
        id="material"
        className="marketing-section marketing-section--muted material-section"
        aria-labelledby="material-heading"
      >
        <div className="marketing-section__inner">
          <header className="marketing-section__header">
            <p className="marketing-section__eyebrow">Transparent erklärt</p>
            <h2 id="material-heading">Material &amp; Verfahren</h2>
            <p className="marketing-section__intro">
              ChipMa wird im FDM-Verfahren aus PLA gefertigt. Hier sehen Sie,
              was das Material kann und wo seine Grenzen liegen.
            </p>
          </header>

          <div className="specification-table-wrap">
            <table className="specification-table">
              <caption>Technische Daten zur Standardausführung</caption>
              <tbody>
                {specifications.map((specification) => (
                  <tr key={specification.label}>
                    <th scope="row">{specification.label}</th>
                    <td>{specification.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        id="ablauf"
        className="marketing-section process-section"
        aria-labelledby="ablauf-heading"
      >
        <div className="marketing-section__inner">
          <header className="marketing-section__header">
            <p className="marketing-section__eyebrow">Von der Idee zum Chip</p>
            <h2 id="ablauf-heading">So läuft es ab</h2>
          </header>

          <ol className="process-list">
            {processSteps.map((step, index) => (
              <li className="process-step" key={step.title}>
                <span className="process-step__number" aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="faq"
        className="marketing-section marketing-section--muted faq-section"
        aria-labelledby="faq-heading"
      >
        <div className="marketing-section__inner marketing-section__inner--narrow">
          <header className="marketing-section__header">
            <p className="marketing-section__eyebrow">Kurz beantwortet</p>
            <h2 id="faq-heading">Häufige Fragen</h2>
          </header>

          <div className="faq-list">
            {faqEntries.map((entry) => (
              <details className="faq-item" key={entry.question}>
                <summary className="faq-item__question">
                  <span>{entry.question}</span>
                  <span className="faq-item__icon" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="faq-item__answer">
                  <p>{entry.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        id="kontakt"
        className="marketing-section contact-section"
        aria-labelledby="kontakt-heading"
      >
        <div className="marketing-section__inner contact-section__inner">
          <div className="contact-section__content">
            <p className="marketing-section__eyebrow">Direkt aus dem Hegau</p>
            <h2 id="kontakt-heading">Ihre Idee. Gefertigt in Engen.</h2>
            <p>
              Sie haben eine Sonderform im Kopf, sind bei der Dateiauswahl
              unsicher oder benötigen eine größere Menge? Beschreiben Sie kurz
              Ihr Vorhaben. Auch eine Anfrage ohne fertiges Logo ist möglich.
            </p>
            <address className="contact-section__location">
              <strong>{PRINTMA_CONTACT.company}</strong>
              <br />
              {PRINTMA_CONTACT.street}, {PRINTMA_CONTACT.postalCode}{" "}
              {PRINTMA_CONTACT.city}
              <br />
              <a href={`mailto:${PRINTMA_CONTACT.email}`}>
                {PRINTMA_CONTACT.email}
              </a>
            </address>
          </div>

          <div className="contact-section__actions" aria-label="Kontaktoptionen">
            <a className="button button--primary" href="#konfigurator">
              Konfigurator starten
            </a>
            <a
              className="button button--secondary"
              href={`mailto:${PRINTMA_CONTACT.email}`}
            >
              Per E-Mail anfragen
            </a>
            <a
              className="button button--secondary"
              href={PRINTMA_CONTACT.websiteUrl}
            >
              Zur PrintMa-Homepage
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default MarketingSections;
