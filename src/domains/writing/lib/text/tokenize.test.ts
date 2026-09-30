/**
 * Unit tests for the shared tokenizer.
 *
 * Reference values were captured from the runtime's own `Intl.Segmenter`
 * (V8/UAX #29) plus the documented hyphen-join rule, so a regression in either
 * the engine wiring or the merge logic fails here.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  averageWordLength,
  codePoints,
  countLines,
  countParagraphs,
  graphemes,
  sentenceTokens,
  sentences,
  wordLength,
  wordTokens,
  words,
} from "./tokenize.ts";

test("words: plain sentence", () => {
  assert.deepEqual(words("Hello world"), ["Hello", "world"]);
});

test("words: apostrophe stays inside the word", () => {
  assert.deepEqual(words("Don't stop"), ["Don't", "stop"]);
  assert.deepEqual(words("it\u2019s fine"), ["it\u2019s", "fine"]);
});

test("words: intra-word hyphen is re-joined", () => {
  assert.deepEqual(words("well-known fact"), ["well-known", "fact"]);
  assert.deepEqual(words("e-mail me"), ["e-mail", "me"]);
  assert.deepEqual(words("na\u00efve co-op"), ["na\u00efve", "co-op"]);
});

test("words: emoji and standalone punctuation are not words", () => {
  assert.deepEqual(words("emoji \u{1f600} here"), ["emoji", "here"]);
  assert.deepEqual(words("Hello, world!"), ["Hello", "world"]);
});

test("words: numbers count as words, CJK does not split", () => {
  assert.deepEqual(words("10,000 items"), ["10,000", "items"]);
  assert.deepEqual(words("3.5 stars"), ["3.5", "stars"]);
  assert.deepEqual(words("\u4f60\u597d world"), ["\u4f60\u597d", "world"]);
  assert.deepEqual(words("U.S.A. code"), ["U.S.A", "code"]);
});

test("wordTokens: offsets point at the source string", () => {
  const tokens = wordTokens("Hello world");
  assert.deepEqual(tokens, [
    { text: "Hello", index: 0 },
    { text: "world", index: 6 },
  ]);
  const hyphenated = wordTokens("a well-known word");
  assert.equal(hyphenated[1].text, "well-known");
  assert.equal(hyphenated[1].index, 2);
  assert.equal("a well-known word".slice(2, 2 + "well-known".length), "well-known");
});

test("sentences: punctuation splits, ellipsis does not", () => {
  assert.deepEqual(sentences("One. Two! Three?"), ["One.", "Two!", "Three?"]);
  assert.equal(sentences("Hello... world.").length, 1);
});

test("sentences: abbreviations split (documented limitation)", () => {
  // Intl.Segmenter treats "Dr." as its own sentence; the tool documents this.
  assert.equal(sentences("Dr. Smith went home. He slept.").length, 3);
});

test("sentences: empty and whitespace-only input yields none", () => {
  assert.deepEqual(sentences(""), []);
  assert.deepEqual(sentences("   \n  "), []);
});

test("sentenceTokens: offsets are contiguous over the source", () => {
  const text = "One. Two!";
  const tokens = sentenceTokens(text);
  assert.equal(tokens.length, 2);
  assert.equal(text.slice(tokens[0].index, tokens[0].index + tokens[0].text.length), "One. ");
  assert.equal(text.slice(tokens[1].index, tokens[1].index + tokens[1].text.length), "Two!");
});

test("graphemes: combining marks and emoji modifiers count once", () => {
  assert.equal(graphemes("a\u0301b\u{1f44d}\u{1f3fd}c").length, 4);
  assert.deepEqual(graphemes("a\u0301b\u{1f44d}\u{1f3fd}c"), ["a\u0301", "b", "\u{1f44d}\u{1f3fd}", "c"]);
  assert.equal(codePoints("a\u0301").length, 2);
});

test("wordLength and averageWordLength use grapheme counts", () => {
  assert.equal(wordLength("caf\u00e9"), 4);
  assert.equal(wordLength("\u{1f44d}\u{1f3fd}"), 1);
  assert.equal(averageWordLength(wordTokens("one three")), 4);
  assert.equal(averageWordLength([]), 0);
});

test("countParagraphs: blank lines separate, single newlines do not", () => {
  assert.equal(countParagraphs("a\n\nb"), 2);
  assert.equal(countParagraphs("a\nb"), 1);
  assert.equal(countParagraphs("one\n\ntwo\n\n\nthree"), 3);
  assert.equal(countParagraphs(""), 0);
  assert.equal(countParagraphs("   \n  "), 0);
});

test("countLines: empty is zero, trailing newline opens a line", () => {
  assert.equal(countLines(""), 0);
  assert.equal(countLines("a"), 1);
  assert.equal(countLines("a\n"), 2);
  assert.equal(countLines("a\r\nb"), 2);
});
