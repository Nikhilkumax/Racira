/**
 * Unit tests for the US/UK consistency checks.
 *
 * Worth pinning: a listed pair is reported even when the document is
 * consistent, the stem-matched families (-ize/-ise, -yze/-yse, -ll-/-l-) are
 * reported only when both shapes appear in the one document, every published
 * double-l stem really does pair (traveled / travelled), and the pairs whose
 * meanings have drifted apart (check / cheque, tire / tyre) are never touched.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DOUBLE_L_STEMS,
  VARIANT_PAIRS,
  VARIANT_PAIR_COUNT,
  analyseSpellingVariants,
  formatVariantReport,
} from "./spelling-variants.ts";

const families = (text: string) => analyseSpellingVariants(text).families;
const mixed = (text: string) => analyseSpellingVariants(text).mixedFamilies;
const totals = (text: string) => {
  const result = analyseSpellingVariants(text);
  return { us: result.usTotal, uk: result.ukTotal };
};

test("publishes one row per pair, with the two forms kept apart", () => {
  assert.equal(VARIANT_PAIR_COUNT, VARIANT_PAIRS.length);
  const us = new Set(VARIANT_PAIRS.map((pair) => pair.us));
  const uk = new Set(VARIANT_PAIRS.map((pair) => pair.uk));
  assert.ok(us.size > 90);
  assert.equal(us.size, VARIANT_PAIRS.length, "a US form must not repeat");
  assert.equal(uk.size, VARIANT_PAIRS.length, "a UK form must not repeat");
  for (const pair of VARIANT_PAIRS) {
    assert.ok(pair.us.length > 0 && pair.uk.length > 0);
    assert.notEqual(pair.us, pair.uk);
    assert.ok(!uk.has(pair.us), `${pair.us} is listed as both variants`);
    assert.ok(!us.has(pair.uk), `${pair.uk} is listed as both variants`);
  }
});

test("a listed stem is used in the double-l rule only after its own final l", () => {
  for (const stem of DOUBLE_L_STEMS) {
    assert.ok(stem.endsWith("l"), `${stem} does not end in l`);
    const result = analyseSpellingVariants(`We ${stem}ed it and then ${stem}led it.`);
    assert.equal(result.mixedFamilies.length, 1, stem);
    assert.equal(result.mixedFamilies[0].rule, "ll-l");
    assert.deepEqual(result.mixedFamilies[0].usForms, [`${stem}ed`]);
    assert.deepEqual(result.mixedFamilies[0].ukForms, [`${stem}led`]);
  }
});

test("says nothing about text with no variant words", () => {
  const result = analyseSpellingVariants("The quick brown fox jumps over the lazy dog.");
  assert.equal(result.occurrences.length, 0);
  assert.equal(result.families.length, 0);
  assert.equal(result.consistency, "no-variant-words");
  assert.equal(result.dominant, "none");
  assert.equal(result.listedPairs, VARIANT_PAIR_COUNT);
});

test("flags one document that mixes color and colour", () => {
  const result = analyseSpellingVariants("The color of the colour is odd.");
  assert.equal(result.consistency, "mixed");
  assert.equal(result.mixedFamilies.length, 1);
  assert.equal(result.mixedFamilies[0].family, "color");
  assert.equal(result.mixedFamilies[0].rule, "listed");
  assert.deepEqual(result.mixedFamilies[0].usForms, ["color"]);
  assert.deepEqual(result.mixedFamilies[0].ukForms, ["colour"]);
  assert.deepEqual(totals("The color of the colour is odd."), { us: 1, uk: 1 });
  assert.equal(result.dominant, "even");
});

test("reports a listed pair used consistently as the document's variant", () => {
  const us = analyseSpellingVariants("The color and the color of the color.");
  assert.equal(us.consistency, "consistent-us");
  assert.equal(us.dominant, "US");
  assert.equal(us.mixedFamilies.length, 0);
  assert.equal(us.families[0].usCount, 3);
  assert.equal(us.families[0].ukCount, 0);

  const uk = analyseSpellingVariants("The colour and the colour of the colour.");
  assert.equal(uk.consistency, "consistent-uk");
  assert.equal(uk.dominant, "UK");
  assert.deepEqual(uk.families[0].ukForms, ["colour"]);
});

test("matches the -ize / -ise family on the shared stem, mixed only", () => {
  const result = analyseSpellingVariants("We organize the trip and organise the files.");
  assert.equal(result.consistency, "mixed");
  assert.equal(result.mixedFamilies.length, 1);
  assert.equal(result.mixedFamilies[0].family, "organise");
  assert.equal(result.mixedFamilies[0].rule, "ize-ise");
  assert.deepEqual(result.mixedFamilies[0].usForms, ["organize"]);
  assert.deepEqual(result.mixedFamilies[0].ukForms, ["organise"]);

  // One shape on its own is not evidence about the writer, so it is dropped.
  const single = analyseSpellingVariants("We organize the trip.");
  assert.equal(single.families.length, 0);
  assert.equal(single.consistency, "no-variant-words");
});

test("matches the -yze / -yse family on the shared stem, mixed only", () => {
  const result = analyseSpellingVariants("We analyze the results and analyse the logs.");
  assert.equal(result.consistency, "mixed");
  assert.equal(result.mixedFamilies.length, 1);
  assert.equal(result.mixedFamilies[0].family, "analyse");
  assert.equal(result.mixedFamilies[0].rule, "yze-yse");

  assert.equal(analyseSpellingVariants("We analyze the results.").families.length, 0);
  assert.equal(analyseSpellingVariants("We analyse the results.").families.length, 0);
});

test("matches the -ll- / -l- family on the shared stem, mixed only", () => {
  const result = analyseSpellingVariants("We traveled north and travelled back.");
  assert.equal(result.consistency, "mixed");
  assert.equal(result.mixedFamilies.length, 1);
  assert.equal(result.mixedFamilies[0].family, "traveled");
  assert.equal(result.mixedFamilies[0].rule, "ll-l");
  assert.deepEqual(result.mixedFamilies[0].usForms, ["traveled"]);
  assert.deepEqual(result.mixedFamilies[0].ukForms, ["travelled"]);

  for (const oneSided of ["We traveled north.", "We travelled back.", "We canceled it.", "We cancelled it."]) {
    assert.equal(analyseSpellingVariants(oneSided).families.length, 0, oneSided);
  }
});

test("never pairs words that are not variants of each other", () => {
  for (const text of [
    "The file was filed and the box was filled.",
    "The tiles were tiled and the soil was tilled.",
    "I wrote a cheque for the car.",
    "The tire and the tyre are different things.",
    "We walked along the kerb and the curb.",
    "The draft and the draught came through the door.",
    "The story and the storey of the building.",
  ]) {
    const result = analyseSpellingVariants(text);
    assert.equal(result.occurrences.length, 0, text);
    assert.equal(result.consistency, "no-variant-words", text);
  }
});

test("keeps source casing in the occurrences and compares lower-case", () => {
  const result = analyseSpellingVariants("The COLOUR and the Color.");
  assert.equal(result.consistency, "mixed");
  assert.deepEqual(
    result.occurrences.map((entry) => `${entry.word}:${entry.variant}`),
    ["COLOUR:UK", "Color:US"],
  );
  assert.deepEqual(result.mixedFamilies[0].usForms, ["color"]);
  assert.deepEqual(result.mixedFamilies[0].ukForms, ["colour"]);
});

test("reports each occurrence at its true offset", () => {
  const result = analyseSpellingVariants("The colour is nice.");
  assert.equal(result.occurrences.length, 1);
  assert.equal(result.occurrences[0].start, 4);
  assert.equal(result.occurrences[0].end, 10);
  assert.equal("The colour is nice.".slice(4, 10), "colour");
});

test("keeps a possessive or plural listed form in its own family", () => {
  const result = analyseSpellingVariants("My favorite's label and my favourite's label.");
  assert.equal(result.mixedFamilies.length, 1);
  assert.deepEqual(result.mixedFamilies[0].usForms, ["favorite's"]);
  assert.deepEqual(result.mixedFamilies[0].ukForms, ["favourite's"]);
});

test("formats a report for copying and downloading", () => {
  const clean = formatVariantReport(analyseSpellingVariants("The quick brown fox."));
  assert.match(clean, /No variant spellings found\./);
  assert.match(clean, new RegExp(`${VARIANT_PAIR_COUNT} pairs checked`));

  const report = formatVariantReport(analyseSpellingVariants("The color or the colour."));
  assert.match(report, /Variant spellings: 2 \(US 1, UK 1\)/);
  assert.match(report, /Consistency: mixed/);
  assert.match(report, /Mixed families: 1/);
  assert.match(report, /Mixed in one document:/);
  assert.match(report, /color \/ colour/);
});
