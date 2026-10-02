import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFaqSection, parseFaqItems } from "./faq.ts";

const FULL = {
  topic: "refunds",
  items: [
    { question: "How long does a refund take?", answer: "Up to ten working days." },
    { question: "Can I get a refund after 30 days?", answer: "Only if the item is faulty." },
    { question: "What do I need to send?", answer: "The order number and a photo of the item." },
  ],
};

test("buildFaqSection renders the heading and the pairs", () => {
  const draft = buildFaqSection(FULL);
  assert.equal(draft.words, 51);
  assert.equal(draft.questions, 3);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.section.startsWith("Frequently asked questions about refunds"));
  assert.ok(draft.section.includes("Q: How long does a refund take?\nA: Up to ten working days."));
});

test("buildFaqSection adds a stop to an answer that lacks one", () => {
  const draft = buildFaqSection({
    topic: "refunds",
    items: [
      { question: "How long does a refund take?", answer: "Ten days" },
      { question: "Can I send it back?", answer: "Yes" },
      { question: "Where do I start?", answer: "The order page" },
    ],
  });
  assert.ok(draft.section.includes("A: Ten days."));
  assert.deepEqual(draft.checks, []);
});

test("buildFaqSection flags duplicates and missing answers", () => {
  const draft = buildFaqSection({
    topic: "refunds",
    items: [
      { question: "How long does a refund take?", answer: "" },
      { question: "how long does a refund take", answer: "Up to ten working days." },
      { question: "Refunds take ten days.", answer: "Up to ten working days." },
    ],
  });
  const ids = draft.checks.map((check) => check.id);
  assert.deepEqual(ids, ["duplicate", "answer"]);
  assert.ok(draft.checks[0].message.includes("appears twice"));
});

test("buildFaqSection asks for a question a reader would type", () => {
  const draft = buildFaqSection({
    topic: "refunds",
    items: [
      { question: "Refunds take ten days.", answer: "That is the usual processing time." },
      { question: "Refunds need an order number.", answer: "The order number and a photo." },
      { question: "Refunds are sent to the original card.", answer: "Back to the original card." },
    ],
  });
  assert.ok(draft.checks.some((check) => check.id === "coverage"));
});

test("buildFaqSection keeps an answer to a paragraph", () => {
  const long = Array.from({ length: 81 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildFaqSection({ ...FULL, items: [{ question: "How long does a refund take?", answer: long }] });
  assert.ok(draft.checks.some((check) => check.id === "answer-long" && check.message.includes("81 words")));
});

test("parseFaqItems treats a line without a pipe as an unanswered question", () => {
  const items = parseFaqItems(["How long does a refund take? | Ten days.", "Where do I start?"]);
  assert.deepEqual(items[0], { question: "How long does a refund take?", answer: "Ten days." });
  assert.deepEqual(items[1], { question: "Where do I start?", answer: "" });
});
