/**
 * Integration test for the real dictionary the spell checker ships.
 *
 * This file reads the installed `dictionary-en` package (v4.0.0, MIT AND BSD —
 * the en_US Hunspell dictionary derived from SCOWL) from node_modules and runs
 * `nspell` (MIT) over it — exactly the bytes and the engine the browser gets,
 * except that the app receives the two data files through webpack's
 * `asset/source` rule instead of `node:fs`. Nothing here is a hand-written word
 * list: every expectation below is a claim about the shipped dictionary, so a
 * package upgrade that changes behaviour fails this file loudly.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import nspell from "nspell";
import { checkSpelling } from "./spell.ts";

const aff = readFileSync(new URL("../../../../../node_modules/dictionary-en/index.aff", import.meta.url), "utf8");
const dic = readFileSync(new URL("../../../../../node_modules/dictionary-en/index.dic", import.meta.url), "utf8");
const spell = nspell(aff, dic);

test("reads the shipped dictionary-en data files", () => {
  assert.ok(aff.startsWith("SET UTF-8"), "affix file declares UTF-8");
  // First line of a Hunspell .dic file is its entry count.
  assert.equal(Number(dic.split(/\r?\n/)[0]), 49568);
  assert.equal(aff.length, 3084);
  assert.equal(dic.length, 551762);
});

test("nspell accepts the files as plain strings and knows common words", () => {
  for (const word of ["the", "receive", "color", "it's", "government", "committee"]) {
    assert.equal(spell.correct(word), true, `${word} should be known`);
  }
  for (const word of ["recieve", "teh", "seperate", "occured", "accomodate"]) {
    assert.equal(spell.correct(word), false, `${word} should be unknown`);
  }
});

test("accented loanwords can be missing from the en_US list", () => {
  // Documented limitation: the dictionary is a US word list, not a lexicon of
  // every borrowed spelling, yet nspell still suggests the plain form.
  assert.equal(spell.correct("naïve"), false);
  assert.equal(spell.suggest("naïve")[0], "naive");
});

test("suggestions come from the dictionary, not a correction table", () => {
  assert.equal(spell.suggest("recieve")[0], "receive");
  assert.equal(spell.suggest("seperate")[0], "separate");
  assert.equal(spell.suggest("occured")[0], "occurred");
  assert.equal(spell.suggest("accomodate")[0], "accommodate");
  assert.equal(spell.suggest("neccessary")[0], "necessary");
  assert.equal(spell.suggest("definately")[0], "definitely");
});

test("the scanner reports the same words the dictionary rejects", () => {
  const report = checkSpelling("I recieve teh mail.", spell);
  assert.equal(report.tokens, 3); // the single letter "I" is not a token at all
  assert.equal(report.checked, 3);
  assert.equal(report.skipped, 0);
  assert.equal(report.uniqueUnknown, 2);
  assert.equal(report.totalUnknown, 2);
  assert.deepEqual(
    report.misspellings.map((entry) => [entry.word, entry.suggestions[0]]),
    [
      ["recieve", "receive"],
      ["teh", "ten"],
    ],
  );
});

test("clean prose produces no findings", () => {
  const report = checkSpelling(
    "The committee recommends that the proposal be approved. Furthermore, the evidence supports this conclusion.",
    spell,
  );
  assert.equal(report.uniqueUnknown, 0);
  assert.equal(report.totalUnknown, 0);
});

test("names, jargon and brand words are unknown — the documented limitation", () => {
  const report = checkSpelling("Racira and Kubernetes and Nikhi met in Hyderabad.", spell);
  const unknown = report.misspellings.map((entry) => entry.word).sort();
  assert.deepEqual(unknown, ["Hyderabad", "Kubernetes", "Nikhi", "Racira"]);
});

test("acronyms are skipped by default and checked on request", () => {
  const text = "The API returns JSON from the CPU.";
  assert.equal(checkSpelling(text, spell).uniqueUnknown, 0);
  const strict = checkSpelling(text, spell, { ignoreAcronyms: false });
  assert.deepEqual(
    strict.misspellings.map((entry) => entry.word).sort(),
    ["API", "CPU", "JSON"],
  );
});

test("the dictionary is en-US, so British spellings are flagged with US suggestions", () => {
  const report = checkSpelling("The colour of the organisation.", spell);
  assert.deepEqual(
    report.misspellings.map((entry) => [entry.word, entry.suggestions[0]]),
    [
      ["colour", "color"],
      ["organisation", "organization"],
    ],
  );
});
