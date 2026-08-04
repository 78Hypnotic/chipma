import {
  COLORS,
  EMBOSSINGS,
  EXTRAS,
  FONTS,
  MAX_QUANTITY,
  MIN_QUANTITY,
  MOTIFS,
  PERSONALIZATION_TYPES,
  SHAPES,
  SIZES,
  calculatePrice,
  sanitizeChipText,
  type ChipConfiguration,
  type PriceResult,
} from "./configurator.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g;

const shapeIds = new Set(SHAPES.map(({ id }) => id));
const sizeIds = new Set(SIZES.map(({ id }) => id));
const colorNames = new Set(COLORS.map(({ name }) => name));
const motifIds = new Set(MOTIFS.map(({ id }) => id));
const fontIds = new Set(FONTS.map(({ id }) => id));
const embossingIds = new Set(EMBOSSINGS.map(({ id }) => id));
const personalizationTypeIds = new Set(PERSONALIZATION_TYPES.map(({ id }) => id));
const extraIds = new Set(EXTRAS.map(({ id }) => id));

type UnknownRecord = Record<string, unknown>;

export interface ValidatedInquiry {
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly message: string;
  readonly consent: true;
  readonly configuration: ChipConfiguration;
  readonly price: PriceResult;
  readonly spam: boolean;
}

export type InquiryValidationResult =
  | { readonly ok: true; readonly data: ValidatedInquiry }
  | { readonly ok: false; readonly error: string };

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  return value.replace(CONTROL_CHARACTERS, "").trim().slice(0, maxLength);
}

function isKnown<T extends string>(value: unknown, values: ReadonlySet<T>): value is T {
  return typeof value === "string" && values.has(value as T);
}

function readConfiguration(value: unknown): ChipConfiguration | null {
  if (!isRecord(value)) return null;
  if (
    !isKnown(value.shape, shapeIds) ||
    !isKnown(value.size, sizeIds) ||
    !isKnown(value.primaryColor, colorNames) ||
    !isKnown(value.secondaryColor, colorNames) ||
    typeof value.twoTone !== "boolean" ||
    !isKnown(value.motif, motifIds) ||
    typeof value.text !== "string" ||
    typeof value.logoName !== "string" ||
    !isKnown(value.font, fontIds) ||
    !isKnown(value.embossing, embossingIds) ||
    typeof value.personalization !== "boolean" ||
    !isKnown(value.personalizationType, personalizationTypeIds) ||
    !Array.isArray(value.extras) ||
    !Number.isInteger(value.quantity) ||
    Number(value.quantity) < MIN_QUANTITY ||
    Number(value.quantity) > MAX_QUANTITY
  ) {
    return null;
  }

  const extras = [...new Set(value.extras)];
  if (extras.length > EXTRAS.length || !extras.every((entry) => isKnown(entry, extraIds))) {
    return null;
  }

  return {
    shape: value.shape,
    size: value.size,
    primaryColor: value.primaryColor,
    secondaryColor: value.secondaryColor,
    twoTone: value.twoTone,
    motif: value.motif,
    text: sanitizeChipText(value.text),
    logoName: value.logoName.replace(CONTROL_CHARACTERS, "").replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120),
    font: value.font,
    embossing: value.embossing,
    personalization: value.personalization,
    personalizationType: value.personalizationType,
    extras,
    quantity: Number(value.quantity),
  };
}

/**
 * Validates and sanitizes an anonymous inquiry before it reaches any backend.
 * Configuration enums are allow-listed and the quoted price is recomputed.
 */
export function validateInquiryPayload(value: unknown): InquiryValidationResult {
  if (!isRecord(value)) return { ok: false, error: "Ungültige Anfrage." };

  const name = cleanText(value.name, 80);
  const email = cleanText(value.email, 254)?.toLowerCase() ?? null;
  const company = cleanText(value.company ?? "", 120);
  const message = cleanText(value.message ?? "", 1000);
  const website = cleanText(value.website ?? "", 200);
  const configuration = readConfiguration(value.configuration);

  if (!name || !email || !EMAIL_PATTERN.test(email) || company === null || message === null) {
    return { ok: false, error: "Bitte prüfen Sie Name und E-Mail-Adresse." };
  }
  if (value.consent !== true) {
    return { ok: false, error: "Bitte bestätigen Sie die Datenschutzhinweise." };
  }
  if (!configuration) {
    return { ok: false, error: "Die Konfiguration ist ungültig." };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      company,
      message,
      consent: true,
      configuration,
      price: calculatePrice(configuration),
      spam: Boolean(website),
    },
  };
}
