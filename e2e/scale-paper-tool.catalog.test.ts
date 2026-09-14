/**
 * scale-paper-tool.catalog.test.ts — catalog-drift guard for the SEO prose.
 *
 * The scale-paper-tool prose in registry/seo/batch6.ts once claimed the
 * catalog covered "A0–A10" while the live catalog had grown well past it, and
 * later omitted JIS B and the unit count entirely. The prose numbers now live
 * in exported constants (SCALE_PAPER_*_CLAIM) that this test pins to the LIVE
 * arrays in scale-paper-tool.tsx, so any catalog change fails here until the
 * copy is updated — the drift can never ship silently again.
 *
 * Pure data test: it never opens a page, so it runs instantly even though it
 * rides in the Playwright suite.
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

import {
  PAPER_SIZES,
  PAPER_GROUPS,
  DISPLAY_UNITS,
} from "../src/domains/cad/components/tools/easy/scale-paper-tool";
import {
  SCALE_PAPER_CATALOG_CLAIM,
  SCALE_PAPER_SERIES_CLAIM,
  SCALE_PAPER_UNIT_CLAIM,
} from "../src/domains/cad/registry/seo/batch6";

/** The synthetic user-defined group — UI state, not a paper series. */
const CUSTOM_GROUP = "Custom";

/** How each catalog series is spelled in the prose's intro paragraph. */
const PROSE_NAME: Record<string, string> = {
  "ISO A": "ISO 216 A",
  "ISO B": "ISO B (B0–B13)",
  "ISO C": "ISO C envelopes",
  "Traditional / Imperial": "Traditional/Imperial",
  "ANSI/US": "ANSI/US",
  ARCH: "ARCH",
  "JIS B": "JIS B (JIS-B0–B10)",
  "Photo Sizes": "photo R-series",
  "RA Series": "RA and SRA raw formats",
  "SRA Series": "RA and SRA raw formats",
  PA: "PA and F transitional",
  "F Series": "PA and F transitional",
};

test.describe("Scale Paper Tool — SEO claims vs live catalog", () => {
  test("entry-count claim equals PAPER_SIZES.length", () => {
    expect(
      SCALE_PAPER_CATALOG_CLAIM,
      "stale catalog count in batch6.ts — update SCALE_PAPER_CATALOG_CLAIM and the prose it feeds",
    ).toBe(PAPER_SIZES.length);
  });

  test("series-count claim equals the rendered group list", () => {
    const series = PAPER_GROUPS.filter((g) => g !== CUSTOM_GROUP);
    expect(
      SCALE_PAPER_SERIES_CLAIM,
      "stale series count in batch6.ts — update SCALE_PAPER_SERIES_CLAIM and the prose it feeds",
    ).toBe(series.length);
  });

  test("unit-count claim equals DISPLAY_UNITS.length", () => {
    expect(
      SCALE_PAPER_UNIT_CLAIM,
      "stale unit count in batch6.ts — update SCALE_PAPER_UNIT_CLAIM and the prose it feeds",
    ).toBe(DISPLAY_UNITS.length);
  });

  test("every catalog series is mentioned in the prose under its prose name", () => {
    // Slice the scale_paper_toolSeo block out of batch6.ts so another tool's
    // copy can never satisfy this check.
    const src = readFileSync("src/domains/cad/registry/seo/batch6.ts", "utf8");
    const start = src.indexOf("scale_paper_toolSeo");
    expect(start, "scale_paper_toolSeo not found in batch6.ts").toBeGreaterThan(-1);
    const end = src.indexOf("cadSeoBatch6", start);
    const block = src.slice(start, end > start ? end : undefined);

    const series = PAPER_GROUPS.filter((g) => g !== CUSTOM_GROUP);
    for (const g of series) {
      const proseName = PROSE_NAME[g];
      // A new series must be added to BOTH the catalog prose and this map —
      // failing here is the reminder to write the paragraph.
      expect(proseName, `series "${g}" has no prose-name mapping — add it to PROSE_NAME and mention it in the scale-paper-tool prose`).toBeDefined();
      expect(block, `prose never mentions series "${g}" (as "${proseName}")`).toContain(proseName);
    }
  });

  test("claim constants match the numbers actually written into the prose", () => {
    // The constants exist so tests can import them — but only if the prose
    // really interpolates them. A hand-typed "141" while the constant says
    // otherwise would pass every test above, so pin the interpolation too.
    const src = readFileSync("src/domains/cad/registry/seo/batch6.ts", "utf8");
    const start = src.indexOf("scale_paper_toolSeo");
    const end = src.indexOf("cadSeoBatch6", start);
    const block = src.slice(start, end > start ? end : undefined);
    expect(block).toContain("${SCALE_PAPER_CATALOG_CLAIM}-entry");
    expect(block).toContain("${SCALE_PAPER_SERIES_CLAIM} series");
    expect(block).toContain("any of ${SCALE_PAPER_UNIT_CLAIM} options");
    // No stale hand-typed counts may remain alongside the constants.
    expect(block).not.toMatch(/\b14[01]-entry\b/);
  });
});
