import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBio } from "./bio.ts";

const FULL = {
  name: "Ada Lovelace",
  role: "support engineer",
  focus: "developer tooling",
  location: "Bristol",
  facts: [
    "She has run support for a developer platform since 2021",
    "She writes a monthly column on troubleshooting",
  ],
};

test("buildBio produces one-line, short and long variants", () => {
  const bios = buildBio(FULL);
  assert.equal(bios.short, "Ada Lovelace is a support engineer based in Bristol.");
  assert.equal(
    bios.medium,
    "Ada Lovelace is a support engineer based in Bristol. The work focuses on developer tooling. She has run support for a developer platform since 2021.",
  );
  assert.equal(
    bios.long,
    "Ada Lovelace is a support engineer based in Bristol. The work focuses on developer tooling. She has run support for a developer platform since 2021. She writes a monthly column on troubleshooting.",
  );
  assert.deepEqual(bios.wordCounts, { short: 9, medium: 25, long: 32 });
  assert.deepEqual(bios.checks, []);
});

test("buildBio picks the right article and adds the final stop", () => {
  const bios = buildBio({ ...FULL, role: "editor", facts: ["She edits a quarterly journal"] });
  assert.ok(bios.short.startsWith("Ada Lovelace is an editor"));
  assert.ok(bios.long.endsWith("She edits a quarterly journal."));
});

test("buildBio flags first-person facts and missing parts", () => {
  const bios = buildBio({ name: "Ada", role: "", focus: "", location: "", facts: ["I write about tools"] });
  const ids = bios.checks.map((check) => check.id).sort();
  assert.deepEqual(ids, ["first-person", "focus", "role"]);
});

test("buildBio asks for facts and warns when the long bio is too long", () => {
  const noFacts = buildBio({ name: "Ada", role: "writer", focus: "essays", location: "", facts: [] });
  assert.ok(noFacts.checks.some((check) => check.id === "facts"));
  const many = buildBio({ ...FULL, facts: Array.from({ length: 7 }, (_, index) => `Fact number ${index + 1} stands here.`) });
  assert.ok(many.checks.some((check) => check.id === "facts-many"));
});
