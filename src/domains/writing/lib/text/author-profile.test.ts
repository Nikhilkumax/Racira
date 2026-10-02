import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAuthorProfile, parseWorks } from "./author-profile.ts";

const FULL = {
  name: "Ada Lovelace",
  genre: "literary science fiction",
  works: ["The Analyst | 2022", "Small Machines | 2025"],
  themes: ["memory and machines", "work and worth"],
  influences: "Ursula K. Le Guin; Ted Chiang",
  note: "She writes in Bristol.",
  website: "adalovelace.example",
};

test("buildAuthorProfile assembles the sections", () => {
  const draft = buildAuthorProfile(FULL);
  assert.equal(draft.words, 33);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.profile.startsWith("Ada Lovelace writes literary science fiction."));
  assert.ok(draft.profile.includes("Selected works\n- The Analyst (2022)\n- Small Machines (2025)"));
  assert.ok(draft.profile.includes("Themes\n- memory and machines\n- work and worth"));
  assert.ok(draft.profile.endsWith("adalovelace.example"));
});

test("parseWorks requires a title and a year", () => {
  const works = parseWorks(["The Analyst | 2022", "Small Machines"]);
  assert.equal(works[0].complete, true);
  assert.equal(works[1].complete, false);
});

test("buildAuthorProfile flags a work with no year and a first-person note", () => {
  const draft = buildAuthorProfile({ ...FULL, works: ["The Analyst"], note: "I write in Bristol." });
  assert.ok(draft.checks.some((check) => check.id === "work-year" && check.message.includes("The Analyst")));
  assert.ok(draft.checks.some((check) => check.id === "first-person"));
});

test("buildAuthorProfile asks for works, themes and influences", () => {
  const draft = buildAuthorProfile({ name: "", genre: "", works: [], themes: [], influences: "", note: "", website: "" });
  const ids = draft.checks.map((check) => check.id).sort();
  assert.deepEqual(ids, ["genre", "influences", "name", "note", "themes", "works"]);
});

test("buildAuthorProfile caps the theme list", () => {
  const draft = buildAuthorProfile({ ...FULL, themes: ["one", "two", "three", "four", "five", "six"] });
  assert.ok(draft.checks.some((check) => check.id === "themes-many"));
});
