/**
 * Unit tests for the footnote engine: marker detection, note pairing,
 * structural warnings, renumbering and rendering.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyzeFootnotes,
  detectMarkerStyle,
  escapeHtml,
  findMarkers,
  markerFor,
  markerStyleCounts,
  renderNotes,
  renumberBody,
  toAlpha,
  toRoman,
  toSuperscript,
  toSymbol,
} from "./footnote.ts";

test("toAlpha: spreadsheet-style sequences", () => {
  assert.equal(toAlpha(1), "a");
  assert.equal(toAlpha(26), "z");
  assert.equal(toAlpha(27), "aa");
  assert.equal(toAlpha(52), "az");
  assert.equal(toAlpha(53), "ba");
});

test("toRoman: standard numerals, with a decimal fallback above 3999", () => {
  assert.equal(toRoman(1), "i");
  assert.equal(toRoman(4), "iv");
  assert.equal(toRoman(9), "ix");
  assert.equal(toRoman(1990), "mcmxc");
  assert.equal(toRoman(3999), "mmmcmxcix");
  assert.equal(toRoman(4000), "4000");
});

test("toSymbol: the traditional footnote symbol cycle", () => {
  assert.equal(toSymbol(1), "*");
  assert.equal(toSymbol(6), "#");
  assert.equal(toSymbol(7), "**");
  assert.equal(toSymbol(8), "\u2020\u2020");
  assert.equal(toSymbol(13), "***");
});

test("markerFor and toSuperscript", () => {
  assert.equal(markerFor(3, "numeric"), "3");
  assert.equal(markerFor(3, "roman"), "iii");
  assert.equal(markerFor(3, "alpha"), "c");
  assert.equal(markerFor(3, "symbol"), "\u2021");
  assert.equal(toSuperscript("12"), "\u00b9\u00b2");
  assert.equal(toSuperscript("10"), "\u00b9\u2070");
});

test("detectMarkerStyle: picks the style the body actually uses", () => {
  assert.equal(detectMarkerStyle("a[1] b[2]"), "bracket");
  assert.equal(detectMarkerStyle("a^1 b^2"), "caret");
  assert.equal(detectMarkerStyle("text (1) more (2)"), "paren");
  assert.equal(detectMarkerStyle("no markers here"), "bracket");
  const counts = markerStyleCounts("a[1] b^2");
  assert.equal(counts.find((entry) => entry.style === "bracket")?.count, 1);
  assert.equal(counts.find((entry) => entry.style === "caret")?.count, 1);
});

test("findMarkers: offsets and labels", () => {
  const markers = findMarkers("x[1] y[10]", "bracket");
  assert.equal(markers.length, 2);
  assert.deepEqual(markers.map((marker) => marker.label), ["1", "10"]);
  assert.equal(markers[1].index, 6);
});

test("analyzeFootnotes: clean body and notes produce no warnings", () => {
  const analysis = analyzeFootnotes(
    "First claim[1] and second[2].",
    "Note one.\nNote two.",
  );
  assert.equal(analysis.style, "bracket");
  assert.equal(analysis.pairs.length, 2);
  assert.deepEqual(analysis.notes, ["Note one.", "Note two."]);
  assert.deepEqual(analysis.warnings, []);
});

test("analyzeFootnotes: a marker past the end of the note list is reported", () => {
  const analysis = analyzeFootnotes("Claim[1] and other[3].", "One.\nTwo.");
  assert.equal(analysis.pairs.length, 2);
  assert.ok(
    analysis.warnings.some((warning) => warning.includes("[3]")),
    "expected a warning naming the orphan marker",
  );
});

test("analyzeFootnotes: markers without notes and notes without markers", () => {
  const missing = analyzeFootnotes("Claim[1].", "");
  assert.ok(missing.warnings.some((warning) => warning.includes("no matching note")));

  const unused = analyzeFootnotes("Claim[1].", "One.\nTwo.");
  assert.ok(unused.warnings.some((warning) => warning.includes("never referenced")));
});

test("analyzeFootnotes: repeated marker keeps one number and is reported", () => {
  const analysis = analyzeFootnotes("x[1] y[1]", "N.");
  assert.equal(analysis.pairs.length, 1);
  assert.equal(analysis.pairs[0].references, 2);
  assert.ok(analysis.warnings.some((warning) => warning.includes("referenced 2 times")));
});

test("analyzeFootnotes: note lines may repeat their marker prefix", () => {
  const analysis = analyzeFootnotes("A[1].", "1. First note.");
  assert.deepEqual(analysis.notes, ["First note."]);
  assert.deepEqual(analysis.warnings, []);
});

test("analyzeFootnotes: a note prefix that is not in the body is reported", () => {
  const analysis = analyzeFootnotes("A[1].", "1. First\n5. Fifth");
  assert.ok(analysis.warnings.some((warning) => warning.includes('"5"')));
});

test("renumberBody: markers are renumbered in order of first appearance", () => {
  const analysis = analyzeFootnotes("x[3] y[1]", "Third.\nFirst.");
  assert.deepEqual(analysis.pairs.map((pair) => pair.number), [1, 2]);
  assert.equal(renumberBody("x[3] y[1]", analysis, "superscript"), "x\u00b9 y\u00b2");
});

test("renumberBody: every marker form renders correctly", () => {
  const body = "See[1] and[2].";
  const analysis = analyzeFootnotes(body, "One.\nTwo.");
  assert.equal(renumberBody(body, analysis, "bracket"), "See[1] and[2].");
  assert.equal(renumberBody(body, analysis, "markdown"), "See[^1] and[^2].");
  assert.equal(renumberBody(body, analysis, "caret"), "See^1 and^2.");
  assert.equal(renumberBody(body, analysis, "paren"), "See(1) and(2).");
  assert.equal(renumberBody(body, analysis, "superscript"), "See\u00b9 and\u00b2.");
});

test("renumberBody: alphabetical numbering", () => {
  const analysis = analyzeFootnotes("A[1] B[2]", "one\ntwo");
  assert.equal(renumberBody("A[1] B[2]", analysis, "bracket", "alpha"), "A[a] B[b]");
});

test("renderNotes: markdown, html and plain", () => {
  const analysis = analyzeFootnotes("A[1] B[2]", "First.\nSecond.");
  assert.equal(renderNotes(analysis.pairs, "numeric", "markdown"), "1. First.\n2. Second.");
  assert.equal(renderNotes(analysis.pairs, "numeric", "plain"), "1. First.\n2. Second.");
  const html = renderNotes(analysis.pairs, "numeric", "html");
  assert.match(html, /<ol class="footnotes">/);
  assert.match(html, /id="fn-1"/);
  assert.match(html, /id="fn-2"/);
  assert.equal(renderNotes([], "numeric", "markdown"), "");
});

test("escapeHtml: the five significant characters", () => {
  assert.equal(escapeHtml('a<b> & "c"'), "a&lt;b&gt; &amp; &quot;c&quot;");
});
