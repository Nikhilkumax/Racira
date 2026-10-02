import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RICH_MARKS,
  createRichDoc,
  lineSpans,
  markActiveAt,
  normalizeRichDoc,
  richDocStats,
  richDocToHtml,
  richDocToPlainText,
  setLineKind,
  setRichDocText,
  toggleMarkRange,
} from "./rich-text-editor.ts";

test("a new document is one paragraph per line with no marks", () => {
  const doc = createRichDoc("Hello world\nSecond line");
  assert.deepEqual(doc.kinds, ["paragraph", "paragraph"]);
  assert.deepEqual(doc.marks, []);
  assert.deepEqual(lineSpans("a\n\nb"), [
    { start: 0, end: 1 },
    { start: 2, end: 2 },
    { start: 3, end: 4 },
  ]);
});

test("a mark toggles on over a selection and off again", () => {
  let doc = createRichDoc("Hello world");
  doc = toggleMarkRange(doc, "bold", 0, 5);
  assert.deepEqual(doc.marks, [{ mark: "bold", start: 0, end: 5 }]);
  assert.equal(markActiveAt(doc, "bold", 2), true);
  assert.equal(markActiveAt(doc, "bold", 6), false);
  doc = toggleMarkRange(doc, "bold", 0, 5);
  assert.deepEqual(doc.marks, []);
});

test("overlapping marks nest in a fixed order in the HTML", () => {
  let doc = createRichDoc("Hello world");
  doc = toggleMarkRange(doc, "bold", 0, 5);
  doc = toggleMarkRange(doc, "italic", 3, 8);
  assert.equal(richDocToHtml(doc), "<p><strong>Hel</strong><strong><em>lo</em></strong><em> wo</em>rld</p>");
  assert.equal(richDocToPlainText(doc), "Hello world");
});

test("a selection across lines is applied per line and never spans two blocks", () => {
  let doc = createRichDoc("Hello world\nSecond line");
  doc = toggleMarkRange(doc, "italic", 3, 16);
  assert.deepEqual(doc.marks, [
    { mark: "italic", start: 3, end: 11 },
    { mark: "italic", start: 12, end: 16 },
  ]);
  assert.match(richDocToHtml(doc), /<p>Hel<em>lo world<\/em><\/p>\n<p><em>Seco<\/em>nd line<\/p>/);
});

test("editing text clamps marks and keeps the line count honest", () => {
  let doc = createRichDoc("Hello world");
  doc = toggleMarkRange(doc, "code", 0, 11);
  doc = setRichDocText(doc, "Hello");
  assert.deepEqual(doc.marks, [{ mark: "code", start: 0, end: 5 }]);
  assert.deepEqual(doc.kinds, ["paragraph"]);
  doc = setRichDocText(doc, "Hello\nagain");
  assert.deepEqual(doc.kinds, ["paragraph", "paragraph"]);
});

test("block kinds render as the page's own heading levels, quotes and lists", () => {
  let doc = createRichDoc("Title\nSub\nQuote\nOne\nTwo\nPlain");
  doc = setLineKind(doc, 0, "heading");
  doc = setLineKind(doc, 1, "subheading");
  doc = setLineKind(doc, 2, "quote");
  doc = setLineKind(doc, 3, "bullet");
  doc = setLineKind(doc, 4, "bullet");
  assert.equal(
    richDocToHtml(doc),
    "<h2>Title</h2>\n<h3>Sub</h3>\n<blockquote>Quote</blockquote>\n<ul><li>One</li><li>Two</li></ul>\n<p>Plain</p>",
  );
});

test("text that looks like markup is escaped rather than interpreted", () => {
  let doc = createRichDoc('<img src=x onerror="alert(1)"> & more');
  doc = toggleMarkRange(doc, "bold", 0, 3);
  assert.equal(
    richDocToHtml(doc),
    '<p><strong>&lt;im</strong>g src=x onerror=&quot;alert(1)&quot;&gt; &amp; more</p>',
  );
});

test("stats count words, marks and formatted words", () => {
  let doc = createRichDoc("Hello world\nSecond line");
  doc = toggleMarkRange(doc, "bold", 0, 5);
  doc = setLineKind(doc, 1, "heading");
  assert.deepEqual(richDocStats(doc), {
    words: 4,
    characters: 23,
    lines: 2,
    formattedWords: 1,
    marks: 1,
    paragraphs: 1,
    headings: 1,
    quotes: 0,
    bullets: 0,
  });
});

test("an empty document still renders a paragraph, and marks survive normalisation", () => {
  assert.equal(richDocToHtml(createRichDoc("")), "<p><br /></p>");
  const doc = normalizeRichDoc({ text: "ab", kinds: [], marks: [{ mark: "bold", start: -4, end: 99 }] });
  assert.deepEqual(doc.marks, [{ mark: "bold", start: 0, end: 2 }]);
  assert.deepEqual(doc.kinds, ["paragraph"]);
  assert.equal(RICH_MARKS.length, 5);
});
