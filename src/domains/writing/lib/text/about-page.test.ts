import { test } from "node:test";
import assert from "node:assert/strict";
import { ABOUT_FILLER_WORDS, buildAboutPage } from "./about-page.ts";

const FULL = {
  name: "Northfield Repairs",
  offer: "We fix household appliances the same week you book.",
  audience: "Homeowners whose washing machine has stopped mid-cycle.",
  differentiator: "One technician sees the job through, and the quote is fixed before work starts.",
  proof: "1,400 repairs completed since 2019\n4.9 average rating across 380 reviews\n90 percent fixed on the first visit",
  story: "The workshop opened in 2019 after the only repair shop in the district closed.",
  cta: "Book a slot at northfield.example/book",
};

test("the filler list is the documented one", () => {
  assert.equal(ABOUT_FILLER_WORDS.length, 12);
  assert.ok(ABOUT_FILLER_WORDS.includes("passionate"));
  assert.ok(ABOUT_FILLER_WORDS.includes("world-class"));
});

test("a complete About page passes every check", () => {
  const draft = buildAboutPage(FULL);
  assert.deepEqual(draft.checks, []);
  assert.deepEqual(draft.stats, { words: 79, we: 2, you: 2 });
  assert.equal(draft.sections.map((section) => section.id).join(","), "headline,what,who,proof,story,cta");
  assert.match(draft.output, /Northfield Repairs: We fix household appliances/);
  assert.match(draft.output, /- 1,400 repairs completed since 2019/);
});

test("an adjective-heavy page is flagged for everything it lacks", () => {
  const draft = buildAboutPage({ offer: "We are a passionate and dedicated team of world-class innovators." });
  assert.deepEqual(draft.checks, [
    "No audience named: say who this is for and the situation they arrive in.",
    "No proof at all: one number, one client or one result carries more than a paragraph of adjectives.",
    "No next step: an About page that does not say what to do next wastes the attention it earned.",
    "No differentiator: the offer is stated but nothing explains why it is yours.",
    "Filler words detected (passionate, dedicated, world-class): they take the room a differentiator needs.",
  ]);
});

test("a proof line without a number is named", () => {
  const draft = buildAboutPage({ ...FULL, proof: "Happy customers across the district" });
  assert.ok(draft.checks.some((check) => check === "No proof line carries a number; results that can be counted are the ones a reader believes."));
});

test("a we-heavy page is told who it is for", () => {
  const draft = buildAboutPage({
    offer: "We fix your appliances. We quote before we start and we answer within a day.",
  });
  assert.ok(draft.checks.some((check) => check.includes("against you or your 2")));
  assert.equal(draft.stats.we, 8);
  assert.equal(draft.stats.you, 2);
});

test("a headline past twenty words is flagged", () => {
  const offer = Array.from({ length: 21 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildAboutPage({ offer });
  assert.ok(draft.checks.some((check) => check.startsWith("The headline runs 21 words")));
});
