import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBrandVoice } from "./brand-voice.ts";

const GOOD = {
  brand: "Meridian",
  audience: "people who care how their tea tastes but not about gadgets",
  attributes: [
    "Precise | we give the temperature, never the adjective",
    "Plain | short sentences, kitchen words, no specification sheets",
    "Warm | the reader is a host, not a user",
  ].join("\n"),
  doSay: "at 70 degrees\nready when you are\nsecond pot",
  dontSay: "utilisation\nartisanal\nsynergy",
  sample: "Green tea wants 70 degrees. Set the dial, pour, and the second pot tastes like the first.",
};

test("a complete guide passes every check", () => {
  const guide = buildBrandVoice(GOOD);
  assert.deepEqual(guide.stats, { attributes: 3, doSay: 3, dontSay: 3, sampleWords: 17, longSentences: 0 });
  assert.deepEqual(guide.checks, []);
  assert.equal(guide.sections.map((section) => section.id).join(","), "who,attributes,say,dontsay,sample");
  assert.match(guide.output, /- Precise: we give the temperature, never the adjective/);
});

test("a sample that contradicts the guide is caught", () => {
  const guide = buildBrandVoice({
    brand: "Meridian",
    audience: "tea drinkers",
    attributes: "Precise | temperature, not adjectives\nPlain | kitchen words",
    doSay: "at 70 degrees",
    dontSay: "artisanal",
    sample:
      "Our artisanal approach leverages decades of experience in order to deliver a seamless tea experience that is designed to delight every single customer who chooses to brew with us each and every morning without exception.",
  });
  assert.deepEqual(guide.checks, [
    "2 attributes; three is the working range — enough to shape a sentence, few enough to remember.",
    "The sample paragraph uses banned phrasing (artisanal); fix the sample or the list.",
    "1 sample sentence runs past 25 words; whatever the voice, a reader holds a sentence for one breath.",
  ]);
});

test("an attribute with no practice is named with the phrase", () => {
  const guide = buildBrandVoice({ ...GOOD, attributes: "Precise | temperature\nWarm" });
  assert.ok(
    guide.checks.some(
      (check) =>
        check ===
        '1 attribute has no line on what it means in practice (Warm); "warm" means nothing until it says what a writer does differently.',
    ),
  );
});

test("a phrase on both lists is a contradiction", () => {
  const guide = buildBrandVoice({ ...GOOD, doSay: "at 70 degrees\nsecond pot", dontSay: "second pot" });
  assert.ok(guide.checks.some((check) => check === "The same phrase appears on both lists (second pot); a guide that contradicts itself will be ignored."));
});

test("an empty guide asks for every part", () => {
  const guide = buildBrandVoice({});
  assert.equal(guide.checks.length, 6);
  assert.ok(guide.checks.includes("No brand named; the guide is written for a specific one."));
  assert.ok(guide.checks.includes("No sample paragraph; writers copy an example before they follow a description."));
  assert.equal(guide.checks.some((check) => check.startsWith("The sample paragraph")), false);
});
