/**
 * Unit tests for the newspaper citation layer. The styles' own patterns are
 * pinned by citation.test.ts; these tests cover the newspaper-specific handling:
 * the date normalisation, the warnings and the checklist.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { newspaperAllStyles, newspaperChecklist, newspaperCitation, newspaperWarnings } from "./newspaper-citation.ts";
import type { CitationFields } from "./citation.ts";

const ARTICLE: CitationFields = {
  sourceType: "newspaper-article",
  authors: [{ family: "Smith", given: "John A." }],
  title: "Cities brace for the storm",
  container: "The Herald",
  date: "May 5",
  year: "2021",
  url: "https://herald.example.com/storm",
};

test("newspaperCitation: APA keeps the year slot and the day-month date", () => {
  const result = newspaperCitation(ARTICLE, "apa7");
  assert.equal(
    result.entry,
    "Smith, J. A. (2021, May 5). Cities brace for the storm. The Herald. https://herald.example.com/storm",
  );
});

test("newspaperCitation: MLA and Chicago carry the full date including the year", () => {
  assert.equal(
    newspaperCitation(ARTICLE, "mla9").entry,
    'Smith, John A. "Cities brace for the storm." The Herald, May 5, 2021, https://herald.example.com/storm.',
  );
  assert.equal(
    newspaperCitation(ARTICLE, "chicago17").entry,
    'Smith, John A. "Cities brace for the storm." The Herald, May 5, 2021. https://herald.example.com/storm.',
  );
});

test("newspaperAllStyles returns one result per implemented style", () => {
  const rows = newspaperAllStyles(ARTICLE);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((row) => row.style), ["apa7", "mla9", "chicago17"]);
});

test("newspaperWarnings names each missing newspaper field", () => {
  const bare = newspaperWarnings({ sourceType: "newspaper-article", authors: [], title: "Something" });
  assert.equal(bare.length, 4);
  assert.ok(bare.some((warning) => warning.includes("newspaper name")));
  assert.ok(bare.some((warning) => warning.includes("dated")));
  assert.ok(bare.some((warning) => warning.includes("URL")));
  assert.ok(bare.some((warning) => warning.includes("page")));
  assert.deepEqual(newspaperWarnings(ARTICLE), []);
});

test("newspaperChecklist covers the fields a newspaper entry turns on", () => {
  const rows = newspaperChecklist();
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map((row) => row.field), ["Byline", "Headline", "Newspaper", "Date", "Location"]);
});
