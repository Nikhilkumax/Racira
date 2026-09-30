/**
 * Unit tests for the Unicode helpers: normalization forms, invisible-character
 * stripping, direction detection (first-strong) and bidi wrapping.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bidiControlList,
  bidiCounts,
  bidiWrapLabel,
  detectDirection,
  findInvisibleCharacters,
  inspectCharacters,
  isBidiControl,
  isInvisibleCodePoint,
  isNormalizationSensitive,
  isStrongRtl,
  normalize,
  paragraphDirections,
  stableForms,
  stripInvisible,
  summarizeKinds,
  wrapBidi,
} from "./unicode.ts";

test("stableForms: ASCII is stable everywhere, accents are not", () => {
  assert.deepEqual(stableForms("abc"), ["NFC", "NFD", "NFKC", "NFKD"]);
  assert.equal(isNormalizationSensitive("abc"), false);
  const forms = stableForms("caf\u00e9");
  assert.ok(!forms.includes("NFD"), "NFC text is not stable under NFD");
  assert.equal(isNormalizationSensitive("caf\u00e9"), true);
});

test("normalize: canonical and compatibility mappings", () => {
  assert.equal(normalize("caf\u00e9", "NFD").length, 5);
  assert.equal(normalize("caf\u00e9", "NFC").length, 4);
  assert.equal(normalize("\uFF21\uFF22", "NFKC"), "AB");
  assert.equal(normalize("\u2160", "NFKC"), "I");
});

test("stripInvisible: removes zero-width characters and counts them", () => {
  const result = stripInvisible("a\u200bb\uFEFFc");
  assert.deepEqual(result, { text: "abc", removed: 2 });
  assert.equal(stripInvisible("plain").removed, 0);
  assert.equal(isInvisibleCodePoint(0x200b), true);
  assert.equal(isInvisibleCodePoint(0x61), false);
});

test("findInvisibleCharacters: reports offset, hex and name", () => {
  const hits = findInvisibleCharacters("a\u200bb");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].hex, "U+200B");
  assert.equal(hits[0].index, 1);
  assert.match(hits[0].name, /Zero-width space/);
});

test("detectDirection: first strong letter wins", () => {
  assert.equal(detectDirection("hello"), "ltr");
  assert.equal(detectDirection("\u05e9\u05dc\u05d5\u05dd"), "rtl"); // Hebrew
  assert.equal(detectDirection("\u0645\u0631\u062d\u0628\u0627"), "rtl"); // Arabic
  assert.equal(detectDirection("123 !? \u{1f600}"), "neutral");
  assert.equal(detectDirection("123 \u05e9\u05dc\u05d5\u05dd"), "rtl", "digits are weak, not strong LTR");
  assert.equal(detectDirection(""), "neutral");
});

test("isStrongRtl: RTL script ranges only", () => {
  assert.equal(isStrongRtl(0x05d0), true); // Hebrew alef
  assert.equal(isStrongRtl(0x0627), true); // Arabic alef
  assert.equal(isStrongRtl(0x0041), false); // Latin A
  assert.equal(isStrongRtl(0x4f60), false); // CJK
});

test("paragraphDirections: per-paragraph first-strong", () => {
  const paragraphs = paragraphDirections("hello there\n\n\u05e9\u05dc\u05d5\u05dd\n\n42");
  assert.equal(paragraphs.length, 3);
  assert.equal(paragraphs[0].direction, "ltr");
  assert.equal(paragraphs[1].direction, "rtl");
  assert.equal(paragraphs[2].direction, "neutral");
});

test("bidiCounts and controls", () => {
  assert.equal(bidiCounts("abc").ltrLetters, 3);
  assert.equal(bidiCounts("\u05e9\u05dc\u05d5\u05dd").rtlLetters, 4);
  assert.equal(bidiCounts("\u2066a\u2069").bidiControls, 2);
  assert.equal(isBidiControl(0x2066), true);
  assert.equal(isBidiControl(0x0041), false);
});

test("wrapBidi: isolates and embeddings", () => {
  assert.equal(wrapBidi("abc", "fsi"), "\u2068abc\u2069");
  assert.equal(wrapBidi("abc", "rli"), "\u2067abc\u2069");
  assert.equal(wrapBidi("abc", "rlo"), "\u202eabc\u202c");
  assert.match(bidiWrapLabel("fsi"), /First-strong/);
  const controls = bidiControlList("\u2067\u05e9\u05dc\u05d5\u05dd\u2069");
  assert.equal(controls.length, 2);
  assert.equal(controls[0].hex, "U+2067");
});

test("summarizeKinds: letters, marks, digits, spaces", () => {
  const summary = summarizeKinds("a1 \u0301");
  assert.equal(summary.letters, 1);
  assert.equal(summary.digits, 1);
  assert.equal(summary.spaces, 1);
  assert.equal(summary.marks, 1);
});

test("inspectCharacters: code point + hex per character", () => {
  const info = inspectCharacters("a");
  assert.deepEqual(info, [{ index: 0, char: "a", codePoint: 97, hex: "U+0061", kind: "letter" }]);
  const astral = inspectCharacters("\u{1f600}");
  assert.equal(astral[0].hex, "U+1F600");
  assert.equal(astral[0].codePoint, 0x1f600);
});
