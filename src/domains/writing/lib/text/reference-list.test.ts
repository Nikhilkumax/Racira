/**
 * Unit tests for the reference-list layer.
 *
 * The reference entries come from the citation engine's own published examples,
 * so these tests focus on what this module adds: note numbering and the
 * style-specific note form, the narrative forms, and import/export that refuses
 * to lose data.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatEndnotes, entryLabel, inTextForms, parseEntries, referenceList, serializeEntries } from "./reference-list.ts";
import type { CitationFields } from "./citation.ts";

const BOOK: CitationFields = {
  sourceType: "book",
  authors: [{ family: "Smith", given: "John A." }],
  title: "The Craft of Writing",
  year: "2020",
  publisher: "Raven Press",
  place: "Boston",
};

const JOURNAL: CitationFields = {
  sourceType: "journal-article",
  authors: [
    { family: "Smith", given: "John A." },
    { family: "Jones", given: "Bob" },
  ],
  title: "A study of style",
  container: "Journal of Writing",
  year: "2021",
  volume: "12",
  issue: "3",
  pages: "45-67",
  doi: "10.1000/xyz",
};

test("formatEndnotes: numbered in the given order with the style's own device", () => {
  const chicago = formatEndnotes([BOOK, JOURNAL], "chicago17");
  assert.deepEqual(chicago.map((row) => row.number), [1, 2]);
  assert.ok(chicago[0].note.startsWith("See John A. Smith, The Craft of Writing"));
  assert.ok(chicago[0].bibliography.startsWith("Smith, John A."));

  // APA has no note form, so the reference entry is the note.
  const apa = formatEndnotes([BOOK], "apa7");
  assert.equal(apa[0].note, apa[0].bibliography);
  assert.equal(apa[0].note.includes("See"), false);
});

test("inTextForms: APA parenthetical and narrative differ", () => {
  const forms = inTextForms({ ...BOOK, pinpoint: "45" }, "apa7");
  assert.equal(forms.parenthetical, "(Smith, 2020, p. 45)");
  assert.equal(forms.narrative, "Smith (2020, p. 45)");
  assert.equal(forms.hasNarrative, true);

  const two = inTextForms(JOURNAL, "apa7");
  assert.equal(two.parenthetical, "(Smith & Jones, 2021)");
  assert.equal(two.narrative, "Smith & Jones (2021)");

  const three = inTextForms(
    { ...BOOK, authors: [{ family: "Smith", given: "A." }, { family: "Jones", given: "B." }, { family: "Lee", given: "C." }] },
    "apa7",
  );
  assert.equal(three.narrative, "Smith et al. (2020)");
});

test("inTextForms: MLA narrative is the author's name; note styles return the note", () => {
  const mla = inTextForms({ ...BOOK, pinpoint: "45" }, "mla9");
  assert.equal(mla.parenthetical, "(Smith 45)");
  assert.equal(mla.narrative, "Smith");
  assert.equal(mla.hasNarrative, true);

  const chicago = inTextForms(BOOK, "chicago17");
  assert.equal(chicago.hasNarrative, false, "Chicago notes-bibliography has no parenthetical narrative form");
  assert.ok(chicago.narrative.includes("John A. Smith"));
  // A note style has no narrative row, so its parenthetical and short form are
  // both the note's own in-text text; the note text lives in `narrative`.
  assert.equal(chicago.shortNote, chicago.parenthetical);
});

test("referenceList: count, numbering and the missing-title check", () => {
  const adams: CitationFields = { ...BOOK, authors: [{ family: "Adams", given: "Bo" }], title: "Apple" };
  const list = referenceList([BOOK, adams], "apa7");
  assert.equal(list.count, 2);
  assert.equal(list.numbered, false);
  assert.ok(list.text.split("\n")[0].startsWith("Adams, B."));
  assert.equal(list.missingTitle, 0);

  const numbered = referenceList([BOOK, adams], "apa7", { numbered: true });
  assert.equal(numbered.numbered, true);
  assert.ok(numbered.text.split("\n")[0].startsWith("[1] "));
});

test("serializeEntries and parseEntries round-trip without losing fields", () => {
  const json = serializeEntries([BOOK, JOURNAL]);
  const parsed = parseEntries(json);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.deepEqual(parsed.entries, [BOOK, JOURNAL]);
  // A round trip through the formatter produces the same entries.
  assert.equal(parsed.entries[1].doi, "10.1000/xyz");
});

test("parseEntries: refuses malformed, empty and unknown-type input with a reason", () => {
  assert.deepEqual(parseEntries(""), { ok: false, error: "Paste the JSON you exported first." });
  const broken = parseEntries("{not json");
  assert.equal(broken.ok, false);
  if (!broken.ok) assert.ok(broken.error.includes("not valid JSON"));

  const notArray = parseEntries('{"title":"x"}');
  assert.equal(notArray.ok, false);
  if (!notArray.ok) assert.ok(notArray.error.includes("JSON array"));

  const empty = parseEntries("[]");
  assert.equal(empty.ok, false);

  const unknownType = parseEntries('[{"sourceType":"hologram","title":"x"}]');
  assert.equal(unknownType.ok, false);
  if (!unknownType.ok) assert.ok(unknownType.error.includes("unknown sourceType"));

  const noTitle = parseEntries('[{"sourceType":"book"}]');
  assert.equal(noTitle.ok, false);
  if (!noTitle.ok) assert.ok(noTitle.error.includes("no title"));
});

test("entryLabel: author, year and type, with fallbacks", () => {
  assert.equal(entryLabel(BOOK), "Smith · 2020 · Book");
  assert.equal(entryLabel({ sourceType: "website", authors: [], title: "A page without an author" }), "A page without an author · n.d. · Web page");
  assert.equal(entryLabel({ sourceType: "book", authors: [], title: "" }), "Untitled source · n.d. · Book");
});
