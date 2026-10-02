import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLandingPage } from "./landing-page.ts";

const FULL = {
  product: "Northwind",
  headline: "Cut first-response time in half",
  audience: "support teams",
  benefits: [
    "Route every ticket to the right person",
    "See the queue before it builds",
    "Report on response time without spreadsheets",
  ],
  proof: "Teams cut response time 40% in the first month.",
  cta: "Start a two-week trial",
};

test("buildLandingPage assembles the hero, benefits, proof and next step", () => {
  const draft = buildLandingPage(FULL);
  assert.equal(draft.words, 54);
  assert.equal(draft.sections, 5);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.page.startsWith("Cut first-response time in half\n\nFor support teams."));
  assert.ok(draft.page.includes("1. Route every ticket to the right person"));
  assert.ok(draft.page.includes("Why it holds up\nTeams cut response time 40% in the first month."));
  assert.ok(draft.page.endsWith("About Northwind"));
});

test("buildLandingPage flags each missing block", () => {
  const draft = buildLandingPage({ product: "", headline: "", audience: "", benefits: [], proof: "", cta: "" });
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), [
    "audience",
    "benefits",
    "cta",
    "headline",
    "product",
    "proof",
  ]);
});

test("buildLandingPage caps the hero line and the benefit count", () => {
  const draft = buildLandingPage({
    ...FULL,
    headline: "one two three four five six seven eight nine ten eleven twelve thirteen",
    benefits: ["a", "b", "c", "d", "e", "f", "g", "h"],
  });
  assert.ok(draft.checks.some((check) => check.id === "headline-long" && check.message.includes("13 words")));
  assert.ok(draft.checks.some((check) => check.id === "benefits-many"));
});

test("buildLandingPage flags a benefit that became a paragraph", () => {
  const long = Array.from({ length: 21 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildLandingPage({ ...FULL, benefits: [long, "short one", "short two"] });
  assert.ok(draft.checks.some((check) => check.id === "benefit-long" && check.message.includes("21 words")));
});
