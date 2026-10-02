import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CLICKBAIT_PHRASES,
  HEADLINE_ANGLES,
  MAX_HEADLINE_CHARS,
  checkHeadline,
  rewriteHeadline,
} from "./headline-rewriter.ts";

test("the five angles and the clickbait list are published", () => {
  assert.deepEqual(HEADLINE_ANGLES.map((angle) => angle.id), ["howto", "list", "guide", "mistakes", "question"]);
  assert.equal(MAX_HEADLINE_CHARS, 60);
  assert.ok(CLICKBAIT_PHRASES.includes("you won't believe"));
});

test("rewriteHeadline composes five angles from the parts", () => {
  const rewrite = rewriteHeadline({
    subject: "headline writing",
    action: "write a better headline",
    count: "5",
  });
  assert.equal(rewrite.variants.length, 5);
  assert.deepEqual(
    rewrite.variants.map((variant) => variant.text),
    [
      "How to write a better headline",
      "5 ways to write a better headline",
      "Headline writing: a practical guide",
      "Headline writing: 5 mistakes to avoid",
      "What does good headline writing look like?",
    ],
  );
  assert.equal(rewrite.flags.length, 0);
  assert.equal(rewrite.reviewed, false);
});

test("the audience is appended where the pattern takes it", () => {
  const rewrite = rewriteHeadline({
    subject: "headline writing",
    action: "write a better headline",
    audience: "first-time bloggers",
  });
  assert.equal(rewrite.variants[0].text, "How to write a better headline for first-time bloggers");
  assert.equal(rewrite.variants[2].text, "Headline writing: a practical guide for first-time bloggers");
  assert.equal(rewrite.variants[1].text, "5 ways to write a better headline");
});

test("missing parts drop their angles rather than composing nonsense", () => {
  const rewrite = rewriteHeadline({ subject: "", action: "write a better headline" });
  assert.deepEqual(rewrite.variants.map((variant) => variant.id), ["howto", "list"]);
});

test("checkHeadline passes a clean headline", () => {
  assert.deepEqual(checkHeadline("How to write a better headline"), []);
});

test("checkHeadline flags length, clickbait and shouting", () => {
  const flags = checkHeadline("10 SHOCKING Secrets About Writing Headlines That You Won't Believe!");
  assert.deepEqual(
    flags.map((flag) => flag.id),
    ["chars", "period", "clickbait-you", "clickbait-shocking", "caps"],
  );
  assert.match(flags[0].message, /^67 characters/);
});

test("checkHeadline flags a repeated word", () => {
  const flags = checkHeadline("A guide to the the best headlines in the world, explained slowly");
  assert.deepEqual(flags.map((flag) => flag.id), ["chars", "repeat"]);
});

test("an empty headline produces no flags", () => {
  assert.deepEqual(checkHeadline("   "), []);
});
