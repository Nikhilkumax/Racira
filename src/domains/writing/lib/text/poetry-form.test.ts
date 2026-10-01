import { test } from "node:test";
import assert from "node:assert/strict";
import { checkForm, findForm, formReference, lineSyllables, rhymeKey, rhymeSchemeOf } from "./poetry-form.ts";

test("findForm returns the named form and falls back to free verse", () => {
  assert.equal(findForm("haiku").lines, 3);
  assert.equal(findForm("haiku").syllables, "5-7-5");
  assert.equal(findForm("sonnet").lines, 14);
  assert.equal(findForm("nope").id, "free-verse");
});

test("rhymeKey groups words by their final sound", () => {
  assert.equal(rhymeKey("cat"), rhymeKey("hat"));
  assert.equal(rhymeKey("dog"), rhymeKey("log"));
  assert.notEqual(rhymeKey("cat"), rhymeKey("dog"));
});

test("rhymeSchemeOf labels the lines by rhyme", () => {
  assert.deepEqual(rhymeSchemeOf("cat\nhat\ndog\nlog"), ["A", "A", "B", "B"]);
});

test("lineSyllables counts each non-empty line", () => {
  assert.deepEqual(lineSyllables("cat\ndog\n\n"), [1, 1]);
});

test("checkForm measures a draft against the form", () => {
  const haiku = checkForm("one\ntwo\nthree", "haiku");
  assert.equal(haiku.lineCount, 3);
  assert.equal(haiku.expectedLines, 3);
  assert.equal(haiku.syllableMatch, false);
  assert.equal(haiku.passes, false);
  assert.ok(haiku.notes.some((note) => note.includes("Syllables differ")));

  const free = checkForm("anything at all", "free-verse");
  assert.equal(free.passes, true);
});

test("formReference lists the form's rules", () => {
  const reference = formReference(findForm("limerick"));
  assert.ok(reference.includes("Limerick"));
  assert.ok(reference.includes("Lines: 5"));
  assert.ok(reference.includes("Rhyme: AABBA"));
});
