export const MIN_QUANTITY = 25;
export const MAX_QUANTITY = 2_000;
export const MAX_CHIP_TEXT_LENGTH = 20;

export const SHAPES = [
  { id: "rund", label: "Rund", description: "Klassiker" },
  { id: "sechs", label: "Sechseck", description: "markant" },
  { id: "quadrat", label: "Quadrat", description: "abgerundet" },
  { id: "wappen", label: "Wappen", description: "Vereine" },
  { id: "herz", label: "Herz", description: "Feiern" },
  {
    id: "kontur",
    label: "Eigene Kontur",
    description: "+0,15 € je Chip",
  },
] as const;

export const SIZES = [
  { id: "23", mm: 23, label: "23 mm", description: "Einkaufswagen-Format" },
  { id: "25", mm: 25, label: "25 mm", description: "Getränkemarke, Standard" },
  { id: "30", mm: 30, label: "30 mm", description: "gut greifbar, Logo lesbar" },
  { id: "35", mm: 35, label: "35 mm", description: "Platz für Text und Nummer" },
] as const;

export const COLORS = [
  { name: "Schwarz", hex: "#1c1c1c" },
  { name: "Weiß", hex: "#f2f1ea" },
  { name: "Grau", hex: "#8c8c8c" },
  { name: "Rot", hex: "#c02a24" },
  { name: "Orange", hex: "#e2712a" },
  { name: "Gelb", hex: "#e8c02a" },
  { name: "Hellgrün", hex: "#7cb342" },
  { name: "Dunkelgrün", hex: "#1f7a4d" },
  { name: "Türkis", hex: "#17a2a2" },
  { name: "Blau", hex: "#1f5fbf" },
  { name: "Violett", hex: "#6b4fbb" },
  { name: "Pink", hex: "#d1478c" },
  { name: "Gold", hex: "#b7a024" },
] as const;

export const MOTIFS = [
  { id: "text", label: "Nur Text" },
  { id: "logo", label: "Nur Logo" },
  { id: "beides", label: "Text & Logo" },
] as const;

export const FONTS = [
  { id: "sans", label: "Sans" },
  { id: "block", label: "BLOCKSCHRIFT" },
  { id: "mono", label: "Technisch" },
] as const;

export const EMBOSSINGS = [
  { id: "erhaben", label: "Erhaben" },
  { id: "vertieft", label: "Vertieft" },
  { id: "keine", label: "Ohne Prägung" },
] as const;

export const PERSONALIZATION_TYPES = [
  {
    id: "nummer",
    label: "Fortlaufende Nummer",
    example: "001, 002, 003 …",
  },
  { id: "namen", label: "Namensliste", example: "Anna, Bernd, Clara …" },
  { id: "datum", label: "Datum", example: "14.09.2026" },
] as const;

export const EXTRAS = [
  {
    id: "oese",
    label: "Schlüsselanhänger-Öse",
    priceKind: "perUnit",
    amount: 0.05,
  },
  {
    id: "oeffner",
    label: "Flaschenöffner-Kombination",
    priceKind: "perUnit",
    amount: 0.6,
  },
  {
    id: "box",
    label: "Aufbewahrungsbox",
    priceKind: "fixed",
    amount: 14.9,
  },
  {
    id: "spender",
    label: "Ausgabe-Spender",
    priceKind: "fixed",
    amount: 39,
  },
] as const;

export const PRICE_TIERS = [
  { from: 25, to: 49, price: 1.2 },
  { from: 50, to: 99, price: 0.95 },
  { from: 100, to: 249, price: 0.79 },
  { from: 250, to: 499, price: 0.65 },
  { from: 500, to: 999, price: 0.55 },
  { from: 1_000, to: 2_000, price: 0.45 },
] as const;

export const PRICING = {
  perUnit: {
    customShape: 0.15,
    secondColor: 0.1,
    personalization: 0.25,
    eyelet: 0.05,
    bottleOpener: 0.6,
  },
  designPreparation: 29,
  freeDesignFromQuantity: 250,
  shipping: 4.9,
  freeShippingFromSubtotal: 100,
  personalizationMaxQuantity: 250,
} as const;

export type ShapeId = (typeof SHAPES)[number]["id"];
export type SizeId = (typeof SIZES)[number]["id"];
export type ColorName = (typeof COLORS)[number]["name"];
export type MotifId = (typeof MOTIFS)[number]["id"];
export type FontId = (typeof FONTS)[number]["id"];
export type EmbossingId = (typeof EMBOSSINGS)[number]["id"];
export type PersonalizationTypeId =
  (typeof PERSONALIZATION_TYPES)[number]["id"];
export type ExtraId = (typeof EXTRAS)[number]["id"];

export interface ChipConfiguration {
  shape: ShapeId;
  size: SizeId;
  primaryColor: ColorName;
  secondaryColor: ColorName;
  twoTone: boolean;
  motif: MotifId;
  text: string;
  logoName: string;
  font: FontId;
  embossing: EmbossingId;
  personalization: boolean;
  personalizationType: PersonalizationTypeId;
  extras: readonly ExtraId[];
  quantity: number;
}

export interface PriceItem {
  id: string;
  label: string;
  amount: number;
  unitAmount?: number;
}

export interface PriceResult {
  quantity: number;
  basisPerUnit: number;
  perUnitTotal: number;
  baseSubtotal: number;
  subtotal: number;
  perUnitItems: readonly PriceItem[];
  oneTimeItems: readonly PriceItem[];
  shipping: number;
  total: number;
}

export const DEFAULT_CONFIG: ChipConfiguration = {
  shape: "rund",
  size: "25",
  primaryColor: "Rot",
  secondaryColor: "Weiß",
  twoTone: false,
  motif: "text",
  text: "SV Engen",
  logoName: "",
  font: "block",
  embossing: "erhaben",
  personalization: false,
  personalizationType: "nummer",
  extras: [],
  quantity: 100,
};

const euroFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function fromCents(amount: number): number {
  return amount / 100;
}

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_QUANTITY;
  }

  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(value)));
}

export function sanitizeChipText(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, MAX_CHIP_TEXT_LENGTH);
}

export function formatEuro(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${euroFormatter.format(safeAmount)} €`;
}

export function getBasisPrice(quantity: number): number {
  const normalizedQuantity = clampQuantity(quantity);
  const tier = PRICE_TIERS.find(
    ({ from, to }) => normalizedQuantity >= from && normalizedQuantity <= to,
  );

  return tier?.price ?? PRICE_TIERS[PRICE_TIERS.length - 1].price;
}

function createPerUnitItem(
  id: string,
  label: string,
  unitAmount: number,
  quantity: number,
): PriceItem {
  return {
    id,
    label,
    unitAmount,
    amount: fromCents(toCents(unitAmount) * quantity),
  };
}

/**
 * Calculates the complete placeholder price in integer cents internally.
 * Quantity is normalized before the tier, fee, and shipping rules are applied.
 */
export function calculatePrice(config: ChipConfiguration): PriceResult {
  const quantity = clampQuantity(config.quantity);
  const basisPerUnit = getBasisPrice(quantity);
  const perUnitItems: PriceItem[] = [];
  const oneTimeItems: PriceItem[] = [];

  if (config.shape === "kontur") {
    perUnitItems.push(
      createPerUnitItem(
        "custom-shape",
        "Individuelle Kontur",
        PRICING.perUnit.customShape,
        quantity,
      ),
    );
  }
  if (config.twoTone) {
    perUnitItems.push(
      createPerUnitItem(
        "second-color",
        "Zweite Farbe",
        PRICING.perUnit.secondColor,
        quantity,
      ),
    );
  }
  if (config.personalization) {
    perUnitItems.push(
      createPerUnitItem(
        "personalization",
        "Personalisierung je Chip",
        PRICING.perUnit.personalization,
        quantity,
      ),
    );
  }
  if (config.extras.includes("oese")) {
    perUnitItems.push(
      createPerUnitItem(
        "eyelet",
        "Schlüsselanhänger-Öse",
        PRICING.perUnit.eyelet,
        quantity,
      ),
    );
  }
  if (config.extras.includes("oeffner")) {
    perUnitItems.push(
      createPerUnitItem(
        "bottle-opener",
        "Flaschenöffner-Kombination",
        PRICING.perUnit.bottleOpener,
        quantity,
      ),
    );
  }

  if (quantity < PRICING.freeDesignFromQuantity) {
    oneTimeItems.push({
      id: "design-preparation",
      label: "Designaufbereitung (einmalig)",
      amount: PRICING.designPreparation,
    });
  }
  if (config.extras.includes("box")) {
    oneTimeItems.push({
      id: "storage-box",
      label: "Aufbewahrungsbox",
      amount: 14.9,
    });
  }
  if (config.extras.includes("spender")) {
    oneTimeItems.push({
      id: "dispenser",
      label: "Ausgabe-Spender",
      amount: 39,
    });
  }

  const basisPerUnitCents = toCents(basisPerUnit);
  const perUnitSurchargeCents = perUnitItems.reduce(
    (sum, item) => sum + toCents(item.unitAmount ?? 0),
    0,
  );
  const baseSubtotalCents = basisPerUnitCents * quantity;
  const perUnitItemsCents = perUnitSurchargeCents * quantity;
  const oneTimeItemsCents = oneTimeItems.reduce(
    (sum, item) => sum + toCents(item.amount),
    0,
  );
  const subtotalCents =
    baseSubtotalCents + perUnitItemsCents + oneTimeItemsCents;
  const shippingCents =
    subtotalCents >= toCents(PRICING.freeShippingFromSubtotal)
      ? 0
      : toCents(PRICING.shipping);

  return {
    quantity,
    basisPerUnit,
    perUnitTotal: fromCents(basisPerUnitCents + perUnitSurchargeCents),
    baseSubtotal: fromCents(baseSubtotalCents),
    subtotal: fromCents(subtotalCents),
    perUnitItems,
    oneTimeItems,
    shipping: fromCents(shippingCents),
    total: fromCents(subtotalCents + shippingCents),
  };
}

function findLabel<T extends { readonly id: string; readonly label: string }>(
  options: readonly T[],
  id: string,
): string {
  return options.find((option) => option.id === id)?.label ?? id;
}

/**
 * Creates the plain-text configuration summary used for an inquiry.
 * User-provided chip text is sanitized and quantity is normalized first.
 */
export function buildInquirySummary(config: ChipConfiguration): string {
  const normalizedConfig: ChipConfiguration = {
    ...config,
    text: sanitizeChipText(config.text),
    quantity: clampQuantity(config.quantity),
  };
  const price = calculatePrice(normalizedConfig);
  const lines = [
    "ChipMa-Konfiguration",
    "",
    `Form: ${findLabel(SHAPES, normalizedConfig.shape)}`,
    `Größe: ${findLabel(SIZES, normalizedConfig.size)}`,
    `Farbe: ${normalizedConfig.primaryColor}${
      normalizedConfig.twoTone
        ? ` / ${normalizedConfig.secondaryColor} (zweifarbig)`
        : ""
    }`,
    `Motiv: ${findLabel(MOTIFS, normalizedConfig.motif)}`,
  ];

  if (normalizedConfig.motif === "logo" || normalizedConfig.motif === "beides") {
    lines.push(`Logo: ${normalizedConfig.logoName || "wird nachgereicht"}`);
  }
  if (normalizedConfig.motif === "text" || normalizedConfig.motif === "beides") {
    lines.push(
      `Text: "${normalizedConfig.text}" (${findLabel(FONTS, normalizedConfig.font)})`,
    );
  }

  lines.push(
    `Prägung: ${findLabel(EMBOSSINGS, normalizedConfig.embossing)}`,
    `Personalisierung: ${
      normalizedConfig.personalization
        ? `ja — ${findLabel(
            PERSONALIZATION_TYPES,
            normalizedConfig.personalizationType,
          )}`
        : "nein"
    }`,
    `Extras: ${
      normalizedConfig.extras.length
        ? normalizedConfig.extras
            .map((id) => findLabel(EXTRAS, id))
            .join(", ")
        : "keine"
    }`,
    `Menge: ${price.quantity} Stück`,
    "",
    "Preis (Platzhalterkalkulation der Website)",
    `Grundpreis je Chip: ${formatEuro(price.basisPerUnit)}`,
  );

  for (const item of price.perUnitItems) {
    lines.push(`${item.label}: ${formatEuro(item.amount)}`);
  }
  for (const item of price.oneTimeItems) {
    lines.push(`${item.label}: ${formatEuro(item.amount)}`);
  }

  lines.push(
    `Versand: ${price.shipping === 0 ? "kostenlos" : formatEuro(price.shipping)}`,
    `Gesamt: ${formatEuro(price.total)}`,
  );

  return lines.join("\n");
}
