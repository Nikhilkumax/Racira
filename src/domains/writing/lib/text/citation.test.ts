/**
 * Unit tests for the citation engine.
 *
 * Every expected string is the shape the style manual itself teaches: the APA
 * book and journal patterns from chapter 9 and 10 of the APA 7 manual, the MLA
 * core-element order from the MLA 9 handbook, the Chicago 17 notes-bibliography
 * examples, and the Bluebook case and statute forms. Titles are entered in the
 * case the style requires, because the engine prints titles as typed.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CITATION_STYLES,
  SOURCE_TYPES,
  formatAuthorInput,
  formatBibliography,
  formatCitation,
  parseAuthorsInput,
  stylesFor,
  type CitationFields,
} from "./citation.ts";

const BOOK: CitationFields = {
  sourceType: "book",
  authors: [{ family: "Smith", given: "John A." }],
  title: "The craft of writing",
  year: "2020",
  publisher: "Raven Press",
  place: "Boston",
  edition: "2nd",
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

test("CITATION_STYLES and SOURCE_TYPES are complete and uniquely keyed", () => {
  assert.equal(CITATION_STYLES.length, 4);
  assert.equal(SOURCE_TYPES.length, 8);
  assert.equal(new Set(CITATION_STYLES.map((entry) => entry.id)).size, 4);
  assert.equal(new Set(SOURCE_TYPES.map((entry) => entry.id)).size, 8);
  assert.ok(CITATION_STYLES.every((entry) => entry.label.includes("edition")));
});

test("APA 7: book and journal entries match the manual's patterns", () => {
  const book = formatCitation(BOOK, "apa7");
  assert.equal(book.bibliography, "Smith, J. A. (2020). The craft of writing (2nd ed.). Raven Press.");

  const journal = formatCitation(JOURNAL, "apa7");
  assert.equal(
    journal.bibliography,
    "Smith, J. A., & Jones, B. (2021). A study of style. Journal of Writing, 12(3), 45\u201367. https://doi.org/10.1000/xyz",
  );
});

test("APA 7: in-text forms, et al. from three authors, and n.d.", () => {
  assert.equal(formatCitation(BOOK, "apa7").inText, "(Smith, 2020)");
  assert.equal(formatCitation({ ...BOOK, pinpoint: "45" }, "apa7").inText, "(Smith, 2020, p. 45)");
  const three = formatCitation(
    {
      ...BOOK,
      authors: [
        { family: "Smith", given: "John A." },
        { family: "Jones", given: "Bob" },
        { family: "Lee", given: "Chen" },
      ],
    },
    "apa7",
  );
  assert.equal(three.inText, "(Smith et al., 2020)");
  assert.ok(three.bibliography.startsWith("Smith, J. A., Jones, B., & Lee, C. (2020)."));

  const noDate = formatCitation({ ...BOOK, year: undefined }, "apa7");
  assert.ok(noDate.bibliography.includes("(n.d.)."));
});

test("MLA 9: core elements in order with the MLA page dash", () => {
  // The title is printed as entered, so the test supplies the MLA casing.
  const book = formatCitation({ ...BOOK, title: "The Craft of Writing" }, "mla9");
  assert.equal(book.bibliography, "Smith, John A. The Craft of Writing. 2nd ed., Raven Press, 2020.");

  const journal = formatCitation(JOURNAL, "mla9");
  assert.equal(
    journal.bibliography,
    'Smith, John A., and Bob Jones. "A study of style." Journal of Writing, vol. 12, no. 3, 2021, pp. 45-67, https://doi.org/10.1000/xyz.',
  );
  assert.equal(journal.inText, "(Smith and Jones)");
  assert.equal(formatCitation({ ...JOURNAL, pinpoint: "45" }, "mla9").inText, "(Smith and Jones 45)");
});

test("Chicago 17: bibliography, note form and pinpoint", () => {
  const titleCase = { ...BOOK, title: "The Craft of Writing" };
  const book = formatCitation(titleCase, "chicago17");
  assert.equal(book.bibliography, "Smith, John A. The Craft of Writing. 2nd ed. Boston: Raven Press, 2020.");
  assert.equal(book.note, "John A. Smith, The Craft of Writing, 2nd ed. (Boston: Raven Press, 2020).");
  assert.equal(
    formatCitation({ ...titleCase, pinpoint: "45" }, "chicago17").note,
    "John A. Smith, The Craft of Writing, 2nd ed. (Boston: Raven Press, 2020), 45.",
  );

  const journal = formatCitation(JOURNAL, "chicago17");
  assert.equal(
    journal.bibliography,
    'Smith, John A., and Bob Jones. "A study of style." Journal of Writing 12, no. 3 (2021): 45\u201367. https://doi.org/10.1000/xyz.',
  );
  assert.equal(
    journal.note,
    'John A. Smith and Bob Jones, "A study of style," Journal of Writing 12, no. 3 (2021): 45\u201367, https://doi.org/10.1000/xyz.',
  );
});

test("Bluebook 21: case and statute forms, and a stated refusal elsewhere", () => {
  const legalCase: CitationFields = {
    sourceType: "case",
    authors: [],
    title: "Smith v. Jones",
    volume: "123",
    reporter: "F.3d",
    pages: "456-460",
    court: "2d Cir.",
    year: "2020",
  };
  const formatted = formatCitation(legalCase, "bluebook21");
  assert.equal(formatted.bibliography, "Smith v. Jones, 123 F.3d 456 (2d Cir. 2020).");
  assert.equal(formatCitation({ ...legalCase, pinpoint: "458" }, "bluebook21").inText, "Smith, 123 F.3d at 458.");

  const statute: CitationFields = { sourceType: "statute", authors: [], title: "Civil rights", codeTitle: "42", section: "1983", year: "2018" };
  assert.equal(formatCitation(statute, "bluebook21").bibliography, "42 U.S.C. \u00a7 1983 (2018).");

  const unsupported = formatCitation(BOOK, "bluebook21");
  assert.equal(unsupported.unsupported, true);
  assert.ok(unsupported.unsupportedReason?.includes("legal material"));
  assert.equal(unsupported.bibliography, "");
});

test("formatCitation: warnings name the missing fields", () => {
  const noPublisher = formatCitation({ ...BOOK, publisher: undefined }, "apa7");
  assert.ok(noPublisher.warnings.some((warning) => warning.includes("publisher")));
  const bare = formatCitation({ sourceType: "website", authors: [], title: "Page", url: undefined }, "mla9");
  assert.ok(bare.warnings.some((warning) => warning.includes("No author")));
  assert.ok(bare.warnings.some((warning) => warning.includes("No URL")));
  assert.ok(bare.warnings.some((warning) => warning.includes("No year")));
});

test("italic markers are opt-in and wrap only italicised elements", () => {
  const plain = formatCitation(BOOK, "apa7").bibliography;
  assert.equal(plain.includes("_"), false);
  const marked = formatCitation(BOOK, "apa7", { italicMarkers: true }).bibliography;
  assert.ok(marked.includes("_The craft of writing_"));
  assert.equal(marked.replace(/_/g, ""), plain);
});

test("parseAuthorsInput and formatAuthorInput round-trip personal and group authors", () => {
  const authors = parseAuthorsInput("Smith, John A.\nWorld Health Organization\nJones, Bob");
  assert.deepEqual(authors, [
    { family: "Smith", given: "John A." },
    { family: "World Health Organization", literal: true },
    { family: "Jones", given: "Bob" },
  ]);
  assert.equal(formatAuthorInput(authors[0]), "Smith, John A.");
  assert.equal(formatAuthorInput(authors[1]), "World Health Organization");
  assert.deepEqual(parseAuthorsInput("   \n\n"), []);
});

test("formatBibliography: alphabetises by family, and numbers on request", () => {
  const zed: CitationFields = { ...BOOK, authors: [{ family: "Zed", given: "Ann" }], title: "Zebra" };
  const adams: CitationFields = { ...BOOK, authors: [{ family: "Adams", given: "Bo" }], title: "Apple" };
  const sorted = formatBibliography([zed, adams], "apa7");
  assert.ok(sorted.entries[0].formatted.bibliography.startsWith("Adams, B."));
  assert.ok(sorted.text.split("\n")[0].startsWith("Adams, B."));
  assert.equal(sorted.note.includes("Alphabetised"), true);

  const numbered = formatBibliography([zed, adams], "apa7", { numbered: true });
  assert.ok(numbered.text.split("\n")[0].startsWith("[1] "));
});

test("formatBibliography: Bluebook groups cases before statutes", () => {
  const statute: CitationFields = { sourceType: "statute", authors: [], title: "Civil rights", codeTitle: "42", section: "1983", year: "2018" };
  const legalCase: CitationFields = {
    sourceType: "case",
    authors: [],
    title: "Young v. Day",
    volume: "9",
    reporter: "F.4th",
    pages: "10",
    court: "9th Cir.",
    year: "2021",
  };
  const result = formatBibliography([statute, legalCase], "bluebook21");
  assert.equal(result.entries[0].formatted.sourceType, "case");
  assert.equal(result.entries[1].formatted.sourceType, "statute");
  assert.ok(result.note.includes("table of authorities"));
});

test("stylesFor: Bluebook is the only style offered for legal material", () => {
  // The other styles' legal-citation rules are not implemented here, so they are
  // not offered rather than producing an empty entry.
  assert.deepEqual(stylesFor("case"), ["bluebook21"]);
  assert.deepEqual(stylesFor("statute"), ["bluebook21"]);
  assert.deepEqual(stylesFor("journal-article"), ["apa7", "mla9", "chicago17"]);
  assert.deepEqual(stylesFor("book"), ["apa7", "mla9", "chicago17"]);
});
