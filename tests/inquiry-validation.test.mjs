import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_CONFIG } from "../app/lib/configurator.ts";
import { validateInquiryPayload } from "../app/lib/inquiry.ts";

function inquiry(overrides = {}) {
  return {
    name: "Manuel Mustermann",
    email: "MANUEL@example.de",
    company: "SV Engen",
    message: "Bitte um ein Angebot.",
    consent: true,
    website: "",
    configuration: DEFAULT_CONFIG,
    ...overrides,
  };
}

test("validates, sanitizes and prices an inquiry", () => {
  const result = validateInquiryPayload(
    inquiry({
      name: "  Manuel\u0000 Mustermann  ",
      configuration: { ...DEFAULT_CONFIG, logoName: "wappen<script>.svg" },
    }),
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.name, "Manuel Mustermann");
  assert.equal(result.data.email, "manuel@example.de");
  assert.equal(result.data.configuration.logoName, "wappen_script_.svg");
  assert.equal(result.data.price.total, 108);
  assert.equal(result.data.spam, false);
});

test("rejects malformed contact data and missing consent", () => {
  assert.equal(validateInquiryPayload(inquiry({ email: "invalid" })).ok, false);
  assert.equal(validateInquiryPayload(inquiry({ name: "" })).ok, false);
  assert.equal(validateInquiryPayload(inquiry({ consent: false })).ok, false);
});

test("rejects forged configuration values instead of clamping them", () => {
  assert.equal(
    validateInquiryPayload(
      inquiry({ configuration: { ...DEFAULT_CONFIG, quantity: 20_000 } }),
    ).ok,
    false,
  );
  assert.equal(
    validateInquiryPayload(
      inquiry({ configuration: { ...DEFAULT_CONFIG, shape: "injected-shape" } }),
    ).ok,
    false,
  );
  assert.equal(
    validateInquiryPayload(
      inquiry({ configuration: { ...DEFAULT_CONFIG, extras: ["box", "unknown"] } }),
    ).ok,
    false,
  );
});

test("marks the hidden website field as spam without rejecting the payload", () => {
  const result = validateInquiryPayload(inquiry({ website: "https://spam.invalid" }));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.spam, true);
});
