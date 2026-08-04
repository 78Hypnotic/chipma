import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_CONFIG,
  PRICE_TIERS,
  buildInquirySummary,
  calculatePrice,
  clampQuantity,
  formatEuro,
  getBasisPrice,
  sanitizeChipText,
} from "../app/lib/configurator.ts";

function configuration(overrides = {}) {
  return { ...DEFAULT_CONFIG, ...overrides };
}

test("clamps and normalizes the quantity input", () => {
  assert.equal(clampQuantity(-1), 25);
  assert.equal(clampQuantity(24), 25);
  assert.equal(clampQuantity(25), 25);
  assert.equal(clampQuantity(99.9), 99);
  assert.equal(clampQuantity(2_000), 2_000);
  assert.equal(clampQuantity(2_001), 2_000);
  assert.equal(clampQuantity(Number.NaN), 25);
  assert.equal(clampQuantity(Number.POSITIVE_INFINITY), 25);
});

test("uses the exact base price at every tier boundary", () => {
  for (const tier of PRICE_TIERS) {
    assert.equal(getBasisPrice(tier.from), tier.price);
    assert.equal(getBasisPrice(tier.to), tier.price);
  }

  assert.equal(getBasisPrice(24), 1.2);
  assert.equal(getBasisPrice(2_001), 0.45);
});

test("calculates a default order including design preparation", () => {
  const result = calculatePrice(DEFAULT_CONFIG);

  assert.equal(result.quantity, 100);
  assert.equal(result.basisPerUnit, 0.79);
  assert.equal(result.perUnitTotal, 0.79);
  assert.equal(result.baseSubtotal, 79);
  assert.deepEqual(
    result.oneTimeItems.map(({ id, amount }) => ({ id, amount })),
    [{ id: "design-preparation", amount: 29 }],
  );
  assert.equal(result.subtotal, 108);
  assert.equal(result.shipping, 0);
  assert.equal(result.total, 108);
});

test("applies all per-unit and fixed surcharges exactly once", () => {
  const result = calculatePrice(
    configuration({
      shape: "kontur",
      twoTone: true,
      personalization: true,
      extras: ["oese", "oeffner", "box", "spender"],
      quantity: 25,
    }),
  );

  assert.equal(result.basisPerUnit, 1.2);
  assert.equal(result.perUnitTotal, 2.35);
  assert.equal(result.baseSubtotal, 30);
  assert.deepEqual(
    result.perUnitItems.map(({ id, unitAmount, amount }) => ({
      id,
      unitAmount,
      amount,
    })),
    [
      { id: "custom-shape", unitAmount: 0.15, amount: 3.75 },
      { id: "second-color", unitAmount: 0.1, amount: 2.5 },
      { id: "personalization", unitAmount: 0.25, amount: 6.25 },
      { id: "eyelet", unitAmount: 0.05, amount: 1.25 },
      { id: "bottle-opener", unitAmount: 0.6, amount: 15 },
    ],
  );
  assert.deepEqual(
    result.oneTimeItems.map(({ id, amount }) => ({ id, amount })),
    [
      { id: "design-preparation", amount: 29 },
      { id: "storage-box", amount: 14.9 },
      { id: "dispenser", amount: 39 },
    ],
  );
  assert.equal(result.subtotal, 141.65);
  assert.equal(result.shipping, 0);
  assert.equal(result.total, 141.65);
});

test("removes the design fee starting at 250 units", () => {
  const belowThreshold = calculatePrice(configuration({ quantity: 249 }));
  const atThreshold = calculatePrice(configuration({ quantity: 250 }));

  assert.equal(belowThreshold.oneTimeItems[0]?.amount, 29);
  assert.equal(atThreshold.oneTimeItems.length, 0);
  assert.equal(atThreshold.basisPerUnit, 0.65);
  assert.equal(atThreshold.total, 162.5);
});

test("charges shipping below 100 euros and waives it at the threshold", () => {
  const belowThreshold = calculatePrice(configuration({ quantity: 50 }));
  const threshold = calculatePrice(configuration({ quantity: 75 }));

  assert.equal(belowThreshold.subtotal, 76.5);
  assert.equal(belowThreshold.shipping, 4.9);
  assert.equal(belowThreshold.total, 81.4);
  assert.equal(threshold.subtotal, 100.25);
  assert.equal(threshold.shipping, 0);
});

test("clamps quantity before selecting a tier and calculating totals", () => {
  const minimum = calculatePrice(configuration({ quantity: 1 }));
  const maximum = calculatePrice(configuration({ quantity: 8_000 }));

  assert.equal(minimum.quantity, 25);
  assert.equal(minimum.basisPerUnit, 1.2);
  assert.equal(minimum.total, 63.9);
  assert.equal(maximum.quantity, 2_000);
  assert.equal(maximum.basisPerUnit, 0.45);
  assert.equal(maximum.total, 900);
});

test("uses cent-accurate arithmetic for large surcharge combinations", () => {
  const result = calculatePrice(
    configuration({
      shape: "kontur",
      twoTone: true,
      personalization: true,
      extras: ["oese", "oeffner"],
      quantity: 2_000,
    }),
  );

  assert.equal(result.perUnitTotal, 1.6);
  assert.equal(result.subtotal, 3_200);
  assert.equal(result.total, 3_200);
});

test("formats euros in German notation", () => {
  assert.equal(formatEuro(0), "0,00 €");
  assert.equal(formatEuro(1.2), "1,20 €");
  assert.equal(formatEuro(1_234.5), "1.234,50 €");
  assert.equal(formatEuro(Number.NaN), "0,00 €");
});

test("sanitizes chip text and limits it to 20 characters", () => {
  assert.equal(sanitizeChipText("SV\u0000 Engen\n1904"), "SV Engen1904");
  assert.equal(sanitizeChipText("12345678901234567890extra"), "12345678901234567890");
});

test("builds a complete, sanitized inquiry summary", () => {
  const summary = buildInquirySummary(
    configuration({
      shape: "wappen",
      size: "35",
      twoTone: true,
      motif: "beides",
      text: "Feuerwehr\nEngen",
      logoName: "wappen.svg",
      personalization: true,
      personalizationType: "namen",
      extras: ["box"],
      quantity: 120,
    }),
  );

  assert.match(summary, /^ChipMa-Konfiguration/m);
  assert.match(summary, /Form: Wappen/);
  assert.match(summary, /Größe: 35 mm/);
  assert.match(summary, /Farbe: Rot \/ Weiß \(zweifarbig\)/);
  assert.match(summary, /Logo: wappen\.svg/);
  assert.match(summary, /Text: "FeuerwehrEngen" \(BLOCKSCHRIFT\)/);
  assert.match(summary, /Personalisierung: ja — Namensliste/);
  assert.match(summary, /Aufbewahrungsbox: 14,90 €/);
  assert.match(summary, /Gesamt: 180,70 €/);
  assert.doesNotMatch(summary, /\nEngen/);
});
