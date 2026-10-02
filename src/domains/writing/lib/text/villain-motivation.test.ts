import { test } from "node:test";
import assert from "node:assert/strict";
import { buildVillainProfile } from "./villain-motivation.ts";

const FULL = {
  villain: "Councillor Voss",
  want: "to keep the dam closed",
  wound: "her town was flooded when she was nine",
  justification: "the lower town can move, the reservoir cannot",
  method: "she buys votes with grain and never threatens twice",
  limit: "she will not flood a house she has slept in",
  selfStory: "the only adult in a room of children",
};

test("buildVillainProfile assembles the want and the five sections", () => {
  const draft = buildVillainProfile(FULL);
  assert.equal(draft.words, 64);
  assert.equal(draft.filled, 7);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.profile.startsWith("Villain: Councillor Voss\nWants: to keep the dam closed"));
  assert.ok(draft.profile.includes("Wound\nher town was flooded when she was nine"));
  assert.ok(draft.profile.includes("Line they will not cross\nshe will not flood a house she has slept in"));
  assert.ok(draft.profile.endsWith("How they see themselves\nthe only adult in a room of children"));
});

test("buildVillainProfile asks for every part of a thin villain", () => {
  const draft = buildVillainProfile({
    villain: "",
    want: "",
    wound: "",
    justification: "",
    method: "",
    limit: "",
    selfStory: "",
  });
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), [
    "justification",
    "limit",
    "method",
    "self-story",
    "villain",
    "want",
    "wound",
  ]);
  assert.equal(draft.filled, 0);
});

test("buildVillainProfile flags a want that became a backstory", () => {
  const want = Array.from({ length: 21 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildVillainProfile({ ...FULL, want });
  assert.ok(draft.checks.some((check) => check.id === "want-long" && check.message.includes("21 words")));
});
