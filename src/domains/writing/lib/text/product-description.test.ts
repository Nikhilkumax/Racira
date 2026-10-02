import { test } from "node:test";
import assert from "node:assert/strict";
import { CLAIM_WORDS, buildProductDescription } from "./product-description.ts";

const FULL = {
  name: "The Meridian Kettle",
  category: "a variable-temperature kettle",
  audience: "tea drinkers who weigh their leaves",
  features: [
    "Six temperature presets | brew green tea at 70 degrees without a thermometer",
    "1.2 litre body | enough for four cups without a refill",
    "Keep-warm hold | the water is ready when the second pot is",
  ].join("\n"),
  specs: "Stainless steel, 1.2 L, 1,800 W",
  proof: "4.7 average from 210 reviews, two-year guarantee",
  offer: "89 with free returns for 30 days",
  cta: "Choose your finish and add to basket.",
};

test("the claiming words list is the documented one", () => {
  assert.ok(CLAIM_WORDS.includes("premium"));
  assert.ok(CLAIM_WORDS.includes("best-in-class"));
});

test("a complete description passes every check", () => {
  const product = buildProductDescription(FULL);
  assert.equal(product.checkCount, 0);
  assert.deepEqual(product.checks, []);
  assert.equal(
    product.sections[0].text,
    "The Meridian Kettle is a variable-temperature kettle for tea drinkers who weigh their leaves.",
  );
  assert.match(product.output, /- Six temperature presets — brew green tea at 70 degrees/);
});

test("features without benefits and missing proof are all named", () => {
  const product = buildProductDescription({
    name: "The Steel Pan",
    category: "a premium pan",
    features: ["Premium steel body", "Even heat | no hot spots", "Light handle | easier plating"].join("\n"),
  });
  assert.equal(product.checkCount, 6);
  assert.deepEqual(product.checks, [
    "No audience named; a description for everyone is a description for no one.",
    "1 feature names no benefit (Premium steel body): add what each one means for the buyer.",
    "No proof line: without a review, a result or a guarantee the description carries only the seller's word.",
    "No price stated; hiding it sends the shopper to find it elsewhere.",
    "No call to action; one action, stated once.",
    "Claiming words detected (premium) with no fact beside them; attach a number or a comparison or drop the claim.",
  ]);
});

test("a proof line with a number passes the proof check", () => {
  const product = buildProductDescription({
    ...FULL,
    features: "One feature | one benefit\nSecond feature | second benefit",
  });
  assert.ok(product.checks.some((check) => check.startsWith("2 benefits listed")));
  assert.equal(product.checks.some((check) => check.startsWith("No proof line")), false);
});
