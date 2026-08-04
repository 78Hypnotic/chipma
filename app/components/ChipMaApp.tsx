"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { MarketingSections } from "./MarketingSections";
import {
  Button,
  Card,
  ChoiceCard,
  ColorSwatch,
  Field,
  PriceSummary,
} from "./ui";
import {
  COLORS,
  DEFAULT_CONFIG,
  EMBOSSINGS,
  EXTRAS,
  FONTS,
  MAX_QUANTITY,
  MIN_QUANTITY,
  MOTIFS,
  PERSONALIZATION_TYPES,
  PRICE_TIERS,
  SHAPES,
  SIZES,
  buildInquirySummary,
  calculatePrice,
  clampQuantity,
  formatEuro,
  sanitizeChipText,
  type ChipConfiguration,
  type ColorName,
  type EmbossingId,
  type ExtraId,
  type FontId,
  type MotifId,
  type PersonalizationTypeId,
  type ShapeId,
  type SizeId,
} from "../lib/configurator";

const CONTACT_EMAIL = "printmagbr@gmail.com";
const ALLOWED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "application/pdf",
]);
const MAX_LOGO_BYTES = 5 * 1024 * 1024;

function sanitizeFileName(value: string) {
  return value.replace(/[\u0000-\u001f\u007f\\/]/g, "").slice(0, 120);
}

function getColorHex(name: ColorName) {
  return COLORS.find((color) => color.name === name)?.hex ?? "#b7a024";
}

function LogoMark() {
  return (
    <span className="brand-mark" aria-label="ChipMa by PrintMa">
      <span className="brand-mark__name">
        Chip<span>Ma</span>
      </span>
      <span className="brand-mark__byline">by PrintMa</span>
    </span>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__brand" href="#top" aria-label="ChipMa Startseite">
          <LogoMark />
        </a>
        <nav className="site-nav" aria-label="Hauptnavigation">
          <a href="#konfigurator">Konfigurator</a>
          <a href="#anwendungen">Anwendungen</a>
          <a href="#material">Material</a>
          <a href="#ablauf">Ablauf</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="ui-button ui-button--primary ui-button--medium header-cta" href="#konfigurator">
          Jetzt konfigurieren
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="eyebrow-pill">Pfandchips &amp; Wertmarken aus dem 3D-Drucker</p>
          <h1 id="hero-title">Pfandchips, die niemand wegwirft.</h1>
          <p className="hero__lead">
            Ab 25 Stück statt ab 500. In Ihrer Form, auf Wunsch entlang des
            Vereinslogos – und jeder Chip kann eine eigene Nummer oder einen Namen tragen.
          </p>
          <div className="hero__actions">
            <a className="ui-button ui-button--primary ui-button--large" href="#konfigurator">
              Konfigurator starten
            </a>
            <a className="ui-button ui-button--outline ui-button--large" href={`mailto:${CONTACT_EMAIL}`}>
              Musterbild anfragen
            </a>
          </div>
          <ul className="trust-list" aria-label="Leistungsversprechen">
            <li>Ab 25 Stück</li>
            <li>5–8 Werktage bis 500 Stück</li>
            <li>Fertigung in Engen</li>
            <li>Kostenlose Designprüfung</li>
          </ul>
        </div>
        <div className="hero-art" aria-label="Beispiele individuell geformter Pfandchips">
          <span className="hero-chip hero-chip--hex">FFW</span>
          <span className="hero-chip hero-chip--crest">SV</span>
          <span className="hero-chip hero-chip--round">042</span>
        </div>
      </div>
    </section>
  );
}

interface ChipPreviewProps {
  config: ChipConfiguration;
  logoUrl: string;
}

function ChipPreview({ config, logoUrl }: ChipPreviewProps) {
  const size = SIZES.find((entry) => entry.id === config.size) ?? SIZES[1];
  const showText = config.motif !== "logo" && config.text.trim().length > 0;
  const showLogo = config.motif !== "text" && logoUrl.length > 0;
  const previewStyle = {
    "--chip-primary": getColorHex(config.primaryColor),
    "--chip-secondary": getColorHex(config.secondaryColor),
    "--chip-scale": String(0.78 + ((size.mm - 23) / 12) * 0.22),
  } as CSSProperties;

  return (
    <div className="preview-stage" style={previewStyle}>
      <div
        className={`chip-preview chip-preview--${config.shape}${config.twoTone ? " chip-preview--two-tone" : ""}`}
        aria-label={`Vorschau: ${size.label}, ${config.primaryColor}`}
      >
        <div className="chip-preview__content">
          {showLogo ? (
            <Image
              src={logoUrl}
              alt="Hochgeladenes Logo in der Chipvorschau"
              width={140}
              height={140}
              unoptimized
            />
          ) : null}
          {showText ? (
            <span className={`chip-preview__text chip-preview__text--${config.font}`}>
              {config.text}
            </span>
          ) : null}
          {!showLogo && !showText ? <span className="chip-preview__placeholder">ChipMa</span> : null}
        </div>
      </div>
      <div className="preview-dimensions">
        <span>{size.label}</span>
        <span>3 mm Materialstärke</span>
        <span>{config.embossing === "keine" ? "ohne Prägung" : `${config.embossing} geprägt`}</span>
      </div>
    </div>
  );
}

/**
 * Renders the complete client-side configurator and keeps its preview, pricing,
 * upload validation, and inquiry summary synchronized from one configuration.
 */
export function ChipMaApp() {
  const [config, setConfig] = useState<ChipConfiguration>(DEFAULT_CONFIG);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoError, setLogoError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const price = useMemo(() => calculatePrice(config), [config]);
  const inquirySummary = useMemo(() => buildInquirySummary(config), [config]);
  const mailtoHref = useMemo(() => {
    const subject = `ChipMa Anfrage: ${price.quantity} Chips`;
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${inquirySummary}\n\nBitte senden Sie mir ein unverbindliches Angebot.`)}`;
  }, [inquirySummary, price.quantity]);

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  const update = <Key extends keyof ChipConfiguration>(
    key: Key,
    value: ChipConfiguration[Key],
  ) => setConfig((current) => ({ ...current, [key]: value }));

  const handleLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      setLogoError("Erlaubt sind SVG, PNG, JPG und PDF.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Die Datei darf höchstens 5 MB groß sein.");
      event.target.value = "";
      return;
    }

    const safeName = sanitizeFileName(file.name);
    setLogoError("");
    update("logoName", safeName);
    setLogoUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file.type === "application/pdf" ? "" : URL.createObjectURL(file);
    });
  };

  const toggleExtra = (extra: ExtraId) => {
    update(
      "extras",
      config.extras.includes(extra)
        ? config.extras.filter((entry) => entry !== extra)
        : [...config.extras, extra],
    );
  };

  const copyConfiguration = async () => {
    try {
      await navigator.clipboard.writeText(inquirySummary);
      setCopyStatus("Konfiguration kopiert.");
    } catch {
      setCopyStatus("Kopieren war nicht möglich. Nutzen Sie bitte die E-Mail-Anfrage.");
    }
  };

  const nextTier = PRICE_TIERS.find((tier) => tier.from > price.quantity);
  const priceRows = [
    {
      label: `Grundpreis ${formatEuro(price.basisPerUnit)} × ${price.quantity}`,
      value: formatEuro(price.baseSubtotal),
    },
    ...price.perUnitItems.map((item) => ({ label: item.label, value: `+ ${formatEuro(item.amount)}` })),
    ...price.oneTimeItems.map((item) => ({ label: item.label, value: `+ ${formatEuro(item.amount)}` })),
    {
      label: "Versand",
      value: price.shipping === 0 ? "kostenlos" : `+ ${formatEuro(price.shipping)}`,
      emphasized: price.shipping === 0,
    },
  ];

  return (
    <div id="top" className="site-shell">
      <Header />
      <main>
        <Hero />

        <section id="konfigurator" className="configurator-section" aria-labelledby="configurator-title">
          <div className="section-heading">
            <p className="section-kicker">Direkt kalkulieren</p>
            <h2 id="configurator-title">Ihr ChipMa-Konfigurator</h2>
            <p>
              Sieben klare Schritte, keine Anmeldung. Vorschau und Platzhalterpreis
              aktualisieren sich bei jeder Auswahl.
            </p>
          </div>

          <div className="configurator-layout">
            <div className="configurator-form">
              <Card padding="large">
                <fieldset className="config-fieldset">
                  <legend><span>01</span> Form</legend>
                  <div className="choice-grid choice-grid--shapes" role="radiogroup" aria-label="Chipform">
                    {SHAPES.map((shape) => (
                      <ChoiceCard
                        key={shape.id}
                        active={config.shape === shape.id}
                        onClick={() => update("shape", shape.id as ShapeId)}
                        label={shape.label}
                        description={shape.description}
                        icon={<span className={`shape-icon shape-icon--${shape.id}`} />}
                      />
                    ))}
                  </div>
                  {config.shape === "kontur" ? (
                    <p className="inline-notice">
                      Für die Außenkontur benötigen wir SVG, PDF oder EPS. Linien unter 1,5 mm
                      prüfen wir vor der Produktion gemeinsam mit Ihnen.
                    </p>
                  ) : null}
                </fieldset>
              </Card>

              <Card padding="large">
                <fieldset className="config-fieldset">
                  <legend><span>02</span> Größe</legend>
                  <div className="choice-grid choice-grid--sizes" role="radiogroup" aria-label="Chipgröße">
                    {SIZES.map((size) => (
                      <ChoiceCard
                        key={size.id}
                        active={config.size === size.id}
                        onClick={() => update("size", size.id as SizeId)}
                        label={size.label}
                        description={size.description}
                      />
                    ))}
                  </div>
                </fieldset>
              </Card>

              <Card padding="large">
                <fieldset className="config-fieldset">
                  <legend><span>03</span> Farbe</legend>
                  <div className="swatch-grid" role="radiogroup" aria-label="Grundfarbe">
                    {COLORS.map((color) => (
                      <ColorSwatch
                        key={color.name}
                        active={config.primaryColor === color.name}
                        color={color.hex}
                        label={color.name}
                        onClick={() => update("primaryColor", color.name as ColorName)}
                      />
                    ))}
                  </div>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={config.twoTone}
                      onChange={(event) => update("twoTone", event.target.checked)}
                    />
                    <span>
                      <strong>Zweifarbiger Chip</strong>
                      <small>Innenfläche in einer zweiten Farbe · +0,10 € je Chip</small>
                    </span>
                  </label>
                  {config.twoTone ? (
                    <div className="swatch-grid swatch-grid--secondary" role="radiogroup" aria-label="Zweite Farbe">
                      {COLORS.map((color) => (
                        <ColorSwatch
                          key={color.name}
                          active={config.secondaryColor === color.name}
                          color={color.hex}
                          label={color.name}
                          onClick={() => update("secondaryColor", color.name as ColorName)}
                        />
                      ))}
                    </div>
                  ) : null}
                </fieldset>
              </Card>

              <Card padding="large">
                <fieldset className="config-fieldset">
                  <legend><span>04</span> Motiv</legend>
                  <div className="choice-grid choice-grid--three" role="radiogroup" aria-label="Motivart">
                    {MOTIFS.map((motif) => (
                      <ChoiceCard
                        key={motif.id}
                        active={config.motif === motif.id}
                        onClick={() => update("motif", motif.id as MotifId)}
                        label={motif.label}
                      />
                    ))}
                  </div>

                  {config.motif !== "text" ? (
                    <div className="logo-upload">
                      <Field
                        type="file"
                        label="Logo hochladen"
                        accept=".svg,.png,.jpg,.jpeg,.pdf,image/svg+xml,image/png,image/jpeg,application/pdf"
                        onChange={handleLogo}
                        error={logoError}
                        hint="Max. 5 MB. Die Datei bleibt auf Ihrem Gerät und dient nur der Vorschau."
                      />
                      {config.logoName ? <p className="file-status">Ausgewählt: {config.logoName}</p> : null}
                    </div>
                  ) : null}

                  {config.motif !== "logo" ? (
                    <>
                      <Field
                        label="Text auf dem Chip"
                        value={config.text}
                        maxLength={20}
                        onChange={(event) => update("text", sanitizeChipText(event.target.value))}
                        hint={`${config.text.length}/20 Zeichen`}
                      />
                      <div className="choice-grid choice-grid--three" role="radiogroup" aria-label="Schriftstil">
                        {FONTS.map((font) => (
                          <ChoiceCard
                            key={font.id}
                            active={config.font === font.id}
                            onClick={() => update("font", font.id as FontId)}
                            label={font.label}
                            className={`font-choice font-choice--${font.id}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}

                  <div className="choice-grid choice-grid--three" role="radiogroup" aria-label="Prägung">
                    {EMBOSSINGS.map((embossing) => (
                      <ChoiceCard
                        key={embossing.id}
                        active={config.embossing === embossing.id}
                        onClick={() => update("embossing", embossing.id as EmbossingId)}
                        label={embossing.label}
                      />
                    ))}
                  </div>
                </fieldset>
              </Card>

              <Card padding="large">
                <fieldset className="config-fieldset">
                  <legend><span>05</span> Personalisierung</legend>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={config.personalization}
                      onChange={(event) => update("personalization", event.target.checked)}
                    />
                    <span>
                      <strong>Jeder Chip individuell</strong>
                      <small>Namen, Nummern oder ein Datum · +0,25 € je Chip</small>
                    </span>
                  </label>
                  {config.personalization ? (
                    <div className="choice-grid choice-grid--three" role="radiogroup" aria-label="Art der Personalisierung">
                      {PERSONALIZATION_TYPES.map((type) => (
                        <ChoiceCard
                          key={type.id}
                          active={config.personalizationType === type.id}
                          onClick={() => update("personalizationType", type.id as PersonalizationTypeId)}
                          label={type.label}
                          description={type.example}
                        />
                      ))}
                    </div>
                  ) : null}
                </fieldset>
              </Card>

              <Card padding="large">
                <fieldset className="config-fieldset">
                  <legend><span>06</span> Extras</legend>
                  <div className="extras-grid">
                    {EXTRAS.map((extra) => (
                      <label className="extra-option" key={extra.id}>
                        <input
                          type="checkbox"
                          checked={config.extras.includes(extra.id)}
                          onChange={() => toggleExtra(extra.id as ExtraId)}
                        />
                        <span>
                          <strong>{extra.label}</strong>
                          <small>
                            + {formatEuro(extra.amount)} {extra.priceKind === "perUnit" ? "je Chip" : "einmalig"}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </Card>

              <Card padding="large">
                <fieldset className="config-fieldset">
                  <legend><span>07</span> Menge</legend>
                  <div className="quantity-control">
                    <Button
                      variant="outline"
                      size="small"
                      aria-label="Menge um 25 reduzieren"
                      onClick={() => update("quantity", clampQuantity(config.quantity - 25))}
                    >
                      −25
                    </Button>
                    <Field
                      label="Stückzahl"
                      type="number"
                      min={MIN_QUANTITY}
                      max={MAX_QUANTITY}
                      step={25}
                      value={config.quantity}
                      onChange={(event) => update("quantity", clampQuantity(Number(event.target.value)))}
                    />
                    <Button
                      variant="outline"
                      size="small"
                      aria-label="Menge um 25 erhöhen"
                      onClick={() => update("quantity", clampQuantity(config.quantity + 25))}
                    >
                      +25
                    </Button>
                  </div>
                  {nextTier ? (
                    <p className="tier-hint">
                      Ab {nextTier.from} Stück kostet der Grundchip {formatEuro(nextTier.price)}.
                    </p>
                  ) : (
                    <p className="tier-hint">Bester Staffelpreis erreicht. Größere Mengen kalkulieren wir individuell.</p>
                  )}
                </fieldset>
              </Card>
            </div>

            <aside className="configurator-summary" aria-label="Live-Vorschau und Preis">
              <Card padding="none" className="summary-card">
                <div className="summary-card__header">
                  <span>Live-Vorschau</span>
                  <span>{SHAPES.find((shape) => shape.id === config.shape)?.label}</span>
                </div>
                <ChipPreview config={config} logoUrl={logoUrl} />
                <PriceSummary
                  rows={priceRows}
                  total={formatEuro(price.total)}
                  note="Unverbindliche Platzhalterkalkulation inkl. 19 % MwSt. Der endgültige Preis folgt nach Designprüfung."
                />
                <div className="summary-actions">
                  <a className="ui-button ui-button--primary ui-button--large" href={mailtoHref}>
                    Unverbindlich anfragen
                  </a>
                  <Button variant="ghost" onClick={copyConfiguration}>
                    Konfiguration kopieren
                  </Button>
                  <span className="copy-status" aria-live="polite">{copyStatus}</span>
                </div>
              </Card>
            </aside>
          </div>
        </section>

        <MarketingSections />
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div>
            <LogoMark />
            <p>Individuelle Pfandchips und Wertmarken, gefertigt in Engen im Hegau.</p>
          </div>
          <nav aria-label="Fußnavigation">
            <a href="#konfigurator">Konfigurator</a>
            <a href="#material">Material</a>
            <a href="#faq">FAQ</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>Kontakt</a>
          </nav>
          <p>© 2026 PrintMa GbR · ChipMa ist eine Marke der PrintMa GbR</p>
        </div>
      </footer>
    </div>
  );
}
