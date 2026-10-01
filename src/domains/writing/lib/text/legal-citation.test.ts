/**
 * Unit tests for the legal citation layer (signals, short forms, table of
 * authorities). The underlying Bluebook rendering is pinned by citation.test.ts;
 * these tests cover what this module adds.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { authorityReport, legalCitation, legalShortForm, tableOfAuthorities } from "./legal-citation.ts";
import type { CitationFields } from "./citation.ts";

const CASE: CitationFields = {
  sourceType: "case",
  authors: [],
  title: "Smith v. Jones",
  reporter: "F.3d",
  volume: "123",
  pages: "456",
  court: "2d Cir.",
  year: "2020",
};

const SECOND: CitationFields = {
  sourceType: "case",
  authors: [],
  title: "Adams v. Bell",
  reporter: "U.S.",
  volume: "500",
  pages: "1",
  year: "1991",
};

const STATUTE: CitationFields = {
  sourceType: "statute",
  authors: [],
  title: "Civil Rights Act",
  codeTitle: "42",
  section: "1983",
  year: "2020",
};

test("legalCitation prints the Bluebook form and prefixes the chosen signal", () => {
  assert.equal(legalCitation(CASE).citation, "Smith v. Jones, 123 F.3d 456 (2d Cir. 2020).");
  assert.equal(legalCitation(CASE, "See").citation, "See Smith v. Jones, 123 F.3d 456 (2d Cir. 2020).");
  assert.equal(legalCitation(CASE, "See").signal, "See");
  assert.equal(legalCitation(CASE, "(none)").signal, "");
});

test("legalCitation formats a statute through the code title and section", () => {
  assert.equal(legalCitation(STATUTE).citation, "42 U.S.C. § 1983 (2020).");
});

test("legalShortForm builds Id. and supra references with pinpoints", () => {
  assert.equal(legalShortForm({ ...CASE, pinpoint: "460" }, "id"), "Id. at 460.");
  assert.equal(legalShortForm(CASE, "id"), "Id.");
  assert.equal(legalShortForm({ ...CASE, pinpoint: "460" }, "supra", "4"), "Smith, supra note 4 at 460.");
  assert.equal(legalShortForm(SECOND, "supra", "2"), "Adams, supra note 2.");
});

test("tableOfAuthorities groups cases before statutes and alphabetises inside each", () => {
  const groups = tableOfAuthorities([STATUTE, CASE, SECOND]);
  assert.deepEqual(groups.map((group) => group.label), ["Cases", "Statutes and codes"]);
  assert.equal(groups[0].entries.length, 2);
  assert.ok(groups[0].entries[0].citation.startsWith("Adams"));
  assert.equal(groups[1].entries[0].citation, "42 U.S.C. § 1983 (2020).");

  const report = authorityReport([CASE, STATUTE]);
  assert.equal(report.total, 2);
  assert.ok(report.text.includes("CASES"));
  assert.ok(report.text.includes("STATUTES AND CODES"));
});
