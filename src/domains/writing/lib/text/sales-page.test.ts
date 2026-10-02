import { test } from "node:test";
import assert from "node:assert/strict";
import { SALES_CLAIM_WORDS, buildSalesPage } from "./sales-page.ts";

const FULL = {
  product: "Meridian Kettle",
  audience: "tea drinkers who weigh their leaves",
  promise: "Brew green tea at the temperature it was grown for, every morning, without a thermometer.",
  problem: "Most kettles boil to one temperature, so delicate tea scalds and turns bitter.",
  mechanism: "Six presets hold the water at the temperature each tea needs and keep it there for the second pot.",
  benefits: "Green tea stops tasting bitter\nFour cups without a refill\nNo thermometer, no guessing",
  proof: "4.7 average from 210 reviews\n1,200 kettles shipped since 2024\nTwo-year guarantee",
  offer: "89 with free returns for 30 days and a two-year guarantee.",
  guarantee: "If the temperature drifts, we replace the kettle within two years.",
  objections: [
    "Is it hard to clean? | The body is stainless steel and the lid lifts off.",
    "Does it hold heat? | Keep-warm holds for 30 minutes.",
    "Is it worth the price? | It replaces a thermometer and a second pot.",
  ].join("\n"),
  cta: "Choose your finish and add to basket.",
};

test("the claim words are the documented set", () => {
  assert.equal(SALES_CLAIM_WORDS.length, 8);
  assert.ok(SALES_CLAIM_WORDS.includes("revolutionary"));
});

test("a complete sales page passes every check", () => {
  const page = buildSalesPage(FULL);
  assert.deepEqual(page.stats, { words: 139, benefits: 3, objections: 3, proofLines: 3 });
  assert.deepEqual(page.checks, []);
  assert.equal(
    page.sections.map((section) => section.id).join(","),
    "headline,problem,mechanism,benefits,proof,offer,guarantee,objections,cta",
  );
  assert.match(page.output, /- Is it hard to clean\? — The body is stainless steel/);
});

test("a promise with nothing behind it is flagged block by block", () => {
  const page = buildSalesPage({ product: "Kettle", promise: "The ultimate kettle!" });
  assert.deepEqual(page.checks, [
    "No problem stated: a page that opens with the product asks the reader to supply the reason to care.",
    "No mechanism: without one the page claims a result without saying how it happens, and the claim is unverifiable.",
    "0 benefits are too few to hold a reader past the promise; three to five is the working range.",
    "No proof: claims without evidence are discounted, however well written.",
    "No offer stated; the reader cannot decide without the price and what is included.",
    "No guarantee; a risk reversal answers the reader's last hesitation.",
    "0 objections answered; the three common ones are price, effort and whether it works for their case.",
    "No close: one action, stated once.",
    "Claiming words detected (ultimate) with no fact anywhere on the page; attach a number or drop the claim.",
  ]);
});

test("an objection with no answer and a long close are named", () => {
  const page = buildSalesPage({
    ...FULL,
    objections: "Is it heavy? |",
    cta: "Choose your finish and add the kettle to your basket before the offer closes on Sunday evening.",
  });
  assert.ok(page.checks.some((check) => check === "1 objection listed without an answer."));
  assert.ok(page.checks.some((check) => check === "1 objection answered; the three common ones are price, effort and whether it works for their case."));
  assert.ok(page.checks.some((check) => check.startsWith("The close runs 17 words")));
});

test("a proof section with a number passes the proof check", () => {
  const page = buildSalesPage({ ...FULL, proof: "Loved by customers everywhere" });
  assert.ok(page.checks.some((check) => check === "No proof line carries a number; counted results are the ones a reader weighs."));
});
