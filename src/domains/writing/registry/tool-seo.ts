import type { ToolSeo } from "@/components/shared/seo-types";
import { B1_STATS_SEO } from "./seo/b1-stats";
import { B1_INTL_SEO } from "./seo/b1-intl";
import { B1_SESSIONS_SEO } from "./seo/b1-sessions";
import { B5_ANALYSIS_SEO } from "./seo/b5-analysis";
import { B6_GRAMMAR_SEO } from "./seo/b6-grammar";
import { B7_PROOFREADING_SEO } from "./seo/b7-proofreading";
import { B7_LANGUAGE_SEO } from "./seo/b7-language";
import { B8_EXTRACTION_SEO } from "./seo/b8-extraction";
import { B8_CONSISTENCY_SEO } from "./seo/b8-consistency";
import { B9_SUMMARIES_SEO } from "./seo/b9-summaries";
import { B9_CITATION_SEO } from "./seo/b9-citation";
import { B10_REFERENCES_SEO } from "./seo/b10-references";
import { B11_EDITORS_SEO } from "./seo/b11-editors";
import { B12_ORGANIZERS_SEO } from "./seo/b12-organizers";
import { B13_CREATIVE_SEO } from "./seo/b13-creative";
import { B14_ACADEMIC_SEO } from "./seo/b14-academic";
import { B15_TEMPLATES_SEO } from "./seo/b15-templates";
import { B16_TEMPLATES_SEO } from "./seo/b16-templates";

/**
 * Authored editorial SEO content for the Writing domain, keyed by registry slug.
 *
 * This module is deliberately separate from `registry.ts`: the registry is part
 * of the client bundle for the /writing index, while this file is imported only
 * by the server-rendered tool route (`app/writing/[slug]/page.tsx`) and by
 * `scripts/validate-writing-seo.mjs`. Keeping them apart means ~9,000 words of
 * prose never ship to a browser.
 *
 * Contract enforced at build time by `scripts/validate-writing-seo.mjs`:
 *   - every slug here is a live tool in `src/domains/writing/registry.ts`;
 *   - `content` is 500-1000 words;
 *   - every keyword appears verbatim in `content`;
 *   - 4-6 unique FAQs per tool;
 *   - `whenToUse` links at least two live sibling tools via `{{slug|label}}`;
 *   - no two tools share near-identical content.
 */
const WRITING_SEO: Record<string, ToolSeo> = {
  ...B1_STATS_SEO,
  ...B1_INTL_SEO,
  ...B1_SESSIONS_SEO,
  ...B5_ANALYSIS_SEO,
  ...B6_GRAMMAR_SEO,
  ...B7_PROOFREADING_SEO,
  ...B7_LANGUAGE_SEO,
  ...B8_EXTRACTION_SEO,
  ...B8_CONSISTENCY_SEO,
  ...B9_SUMMARIES_SEO,
  ...B9_CITATION_SEO,
  ...B10_REFERENCES_SEO,
  ...B11_EDITORS_SEO,
  ...B12_ORGANIZERS_SEO,
  ...B13_CREATIVE_SEO,
  ...B14_ACADEMIC_SEO,
  ...B15_TEMPLATES_SEO,
  ...B16_TEMPLATES_SEO,
};

/**
 * Authored copy keeps its paragraph breaks as the two characters `\n` so a long
 * body stays on one source line — the convention every batch file here follows.
 * The shared renderer splits on real newlines, so the escape is converted once,
 * at this boundary: without the conversion the marker is rendered as literal
 * text and a 600-word body collapses into a single 3,000-character paragraph.
 */
const withRenderableBreaks = (seo: ToolSeo): ToolSeo => {
  const normalised: ToolSeo = { ...seo, content: seo.content.replace(/\\n/g, "\n") };
  if (seo.whenToUse) normalised.whenToUse = seo.whenToUse.replace(/\\n/g, "\n");
  return normalised;
};

export function getToolSeo(slug: string): ToolSeo | undefined {
  const entry = WRITING_SEO[slug];
  return entry ? withRenderableBreaks(entry) : undefined;
}

export const WRITING_SEO_SLUGS: string[] = Object.keys(WRITING_SEO);
