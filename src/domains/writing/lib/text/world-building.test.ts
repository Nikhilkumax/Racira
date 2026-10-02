import { test } from "node:test";
import assert from "node:assert/strict";
import { WORLD_AREAS, buildWorldBible } from "./world-building.ts";

const FULL = {
  name: "Vess",
  premise: "A river town that floods on the same day each year.",
  geography: "Built on two banks that slowly trade places.",
  culture: "Flood week is a festival and a reckoning.",
  politics: "The dam council holds every seat and every grudge.",
  economy: "Boat repair, insurance and smuggled grain.",
  rules: "The flood is predictable to the hour and never to the metre.",
  history: "The old town is under the reservoir and still on the maps.",
  conflicts: "The council needs the dam; the lower town needs it open.",
};

test("WORLD_AREAS lists the seven questions a bible answers", () => {
  assert.equal(WORLD_AREAS.length, 7);
  assert.deepEqual(WORLD_AREAS.map((area) => area.id), [
    "geography",
    "culture",
    "politics",
    "economy",
    "rules",
    "history",
    "conflicts",
  ]);
});

test("buildWorldBible assembles the entries under their labels", () => {
  const draft = buildWorldBible(FULL);
  assert.equal(draft.words, 90);
  assert.equal(draft.filled, 7);
  assert.equal(draft.total, 7);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.bible.startsWith("World: Vess\nA river town that floods on the same day each year."));
  assert.ok(draft.bible.includes("Rules of magic or technology\nThe flood is predictable to the hour"));
  assert.ok(draft.bible.endsWith("Conflicts\nThe council needs the dam; the lower town needs it open."));
});

test("buildWorldBible asks for the title, the premise and the conflict", () => {
  const draft = buildWorldBible({
    name: "",
    premise: "",
    geography: "",
    culture: "",
    politics: "",
    economy: "",
    rules: "",
    history: "",
    conflicts: "",
  });
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), ["areas", "conflicts", "name", "premise"]);
  assert.equal(draft.filled, 0);
});

test("buildWorldBible flags an entry that became a chapter", () => {
  const geography = Array.from({ length: 121 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildWorldBible({ ...FULL, geography });
  assert.ok(draft.checks.some((check) => check.id === "geography-long" && check.message.includes("121 words")));
});
