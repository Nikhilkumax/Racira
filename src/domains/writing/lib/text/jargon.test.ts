/**
 * Unit tests for the jargon remover.
 *
 * The lexicon is the logic, so the tests check the list itself (unique keys,
 * every entry has a note and a replacement) as well as the matching rules: a
 * known positive for the multi-word and single-word entries, and near-misses
 * that must stay silent — an inflected form, a hyphen/space difference, and a
 * word that is simply not on the list.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JARGON_TERMS, findJargon, removeJargon } from "./jargon.ts";

test("JARGON_TERMS: unique phrases, every entry explains itself and has a replacement", () => {
  assert.ok(JARGON_TERMS.length >= 100, `expected a substantial list, got ${JARGON_TERMS.length}`);
  const phrases = JARGON_TERMS.map((entry) => entry.phrase);
  assert.equal(new Set(phrases).size, phrases.length, "phrases are unique");
  for (const entry of JARGON_TERMS) {
    assert.ok(entry.phrase === entry.phrase.toLowerCase(), `${entry.phrase} is stored lowercase`);
    assert.ok(entry.note.length > 20, `${entry.phrase} explains when the replacement fits`);
    assert.ok(typeof entry.replacement === "string" && entry.replacement.length > 0, `${entry.phrase} has a replacement`);
  }
});

test("findJargon: known positives across the four sections", () => {
  const matches = findJargon("We must leverage our synergy, ideate an omnichannel plan and reach out to stakeholders.");
  const found = matches.map((match) => [match.phrase, match.replacement]);
  assert.deepEqual(found, [
    ["leverage", "use"],
    ["synergy", "cooperation"],
    ["ideate", "brainstorm"],
    ["omnichannel", "across channels"],
    ["reach out", "contact"],
    ["stakeholders", "affected people"],
  ]);
});

test("findJargon: inflections and hyphenated near-misses stay silent", () => {
  // "leveraged" is a different word; the engine matches whole phrases only.
  assert.equal(findJargon("The leveraged buyout closed.").length, 0);
  // "synergistic" is not the listed noun.
  assert.equal(findJargon("The synergistic effect was small.").length, 0);
  // The list holds the hyphenated form, not a spaced paraphrase.
  assert.equal(findJargon("a customer centric approach").length, 0);
  assert.equal(findJargon("a customer-centric approach").length, 1);
  // A listed singular does not silently cover every plural.
  assert.equal(findJargon("The workstreams overlap.").length, 0);
  assert.equal(findJargon("The workstream overlaps.").length, 1);
});

test("removeJargon: the substitution list and the output agree", () => {
  const result = removeJargon("We should leverage the platform and streamline the process.");
  assert.equal(result.replacements.length, 2);
  assert.equal(result.output, "We should use the platform and simplify the process.");
  for (const replacement of result.replacements) {
    assert.ok(replacement.note.length > 20);
    assert.equal(replacement.replacement !== "", true);
  }
});

test("removeJargon: sentence-initial replacements are capitalised", () => {
  const result = removeJargon("Leverage the data to ideate.");
  assert.equal(result.output, "Use the data to brainstorm.");
});

test("removeJargon: text without listed jargon is returned unchanged", () => {
  const text = "We must galvanise the widget before the inspectors arrive.";
  const result = removeJargon(text);
  assert.equal(result.replacements.length, 0);
  assert.equal(result.output, text);
});

test("removeJargon: unicode and empty input are handled without surprises", () => {
  assert.deepEqual(removeJargon(""), { output: "", replacements: [] });
  const result = removeJargon("Le virage — pivot — est un mot anglais. 🚀");
  assert.equal(result.replacements.length, 1);
  assert.equal(result.output, "Le virage — change direction — est un mot anglais. 🚀");
});
