/**
 * Editorial SEO content for individual Racira Fonts (/typography) tool pages.
 *
 * The content contract is the cross-domain locked structure, defined once in
 * `src/components/shared/seo-types.ts` and rendered by
 * `src/components/shared/SeoContent.tsx`:
 *
 *   1. lead paragraph (`intro`, no heading)
 *   2. What is [Tool]?          — paragraph + bullet lists + limitations
 *   3. How to use [Tool]        — 3-4 steps (`howTo`)
 *   4. When to use [Tool] vs related tools — `{{slug|display text}}` sibling links
 *   5. Privacy & Security       — the shared verbatim block, supplied by the renderer
 *   6. Frequently asked questions — 5 flat { q, a } items, collapsed accordion
 *
 * MIGRATION WINDOW: this domain was authored before the locked structure, in a
 * section-based shape (`sections: [{ heading, subHeading, content }]`) that is
 * not renderable by the shared component. Batches are being migrated category by
 * category, so an entry is currently one of two shapes and only the locked one
 * is rendered:
 *
 *   - `ToolSeo`      — the locked flat shape. Authored as JSON under ./seo/source,
 *                      generated and spliced in by scripts/typography-json-to-seo.mjs
 *                      + scripts/apply-typography-seo-batch.mjs.
 *   - `LegacyToolSeo` — the pre-migration shape, kept only so un-migrated batches
 *                      still compile. Never rendered; replaced in place, one slug
 *                      at a time, by the splice step.
 *
 * When `LEGACY_SEO_SLUGS` is empty the legacy interfaces here (and
 * ./privacy.ts, which only the legacy entries use) are deleted. The build gate
 * scripts/validate-typography-seo.mjs reports the remaining backlog and can run
 * with --strict to fail while any legacy entry survives.
 */
import type { ToolSeo as SharedToolSeo } from "@/components/shared/seo-types";

/** The locked flat shape, rendered by the shared SeoContent component. */
export type ToolSeo = SharedToolSeo;

/** Legacy section block (pre-migration only). */
export interface LegacySeoBlock {
  type: "paragraph" | "list";
  text?: string;
  items?: string[];
}

/** Legacy section (pre-migration only). */
export interface LegacySeoSection {
  heading: string;
  subHeading?: string;
  content: LegacySeoBlock[];
}

/** Legacy section-based entry (pre-migration only). */
export interface LegacyToolSeo {
  sections: LegacySeoSection[];
}

/** An entry as it can appear in the batch modules during the migration. */
export type ToolSeoEntry = ToolSeo | LegacyToolSeo;

/** True when an entry is the locked flat shape (and therefore renderable). */
export const isLockedToolSeo = (entry: ToolSeoEntry): entry is ToolSeo =>
  typeof (entry as ToolSeo).content === "string" &&
  Array.isArray((entry as ToolSeo).faqs) &&
  Array.isArray((entry as ToolSeo).keywords);

const seoRegistry = new Map<string, ToolSeoEntry>();

export function registerToolSeo(slug: string, seo: ToolSeoEntry) {
  seoRegistry.set(slug, seo);
}

/**
 * Content for a tool page. Returns undefined while a slug still carries the
 * legacy shape, so an un-migrated page renders no editorial block rather than
 * a block the locked renderer cannot express.
 */
export function getToolSeo(slug: string): ToolSeo | undefined {
  const entry = seoRegistry.get(slug);
  return entry && isLockedToolSeo(entry) ? entry : undefined;
}

export function hasToolSeo(slug: string): boolean {
  return seoRegistry.has(slug);
}

// ── per-batch content modules ────────────────────────────────────
import { typographySeoBatch1 } from "./seo/batch1";
import { typographySeoBatch2 } from "./seo/batch2";
import { typographySeoBatch3 } from "./seo/batch3";
import { typographySeoBatch4 } from "./seo/batch4";
import { typographySeoBatch5 } from "./seo/batch5";
import { typographySeoBatch6 } from "./seo/batch6";
import { typographySeoBatch7 } from "./seo/batch7";

for (const batch of [
  typographySeoBatch1,
  typographySeoBatch2,
  typographySeoBatch3,
  typographySeoBatch4,
  typographySeoBatch5,
  typographySeoBatch6,
  typographySeoBatch7,
]) {
  for (const [slug, seo] of Object.entries(batch)) {
    registerToolSeo(slug, seo as ToolSeoEntry);
  }
}

/** Every slug with an entry of either shape (used by the audit script). */
export const SEO_SLUGS: string[] = [...seoRegistry.keys()];

/**
 * Slugs still carrying the pre-migration section shape. Shrinks by one batch at
 * a time; the migration is finished when this is empty.
 */
export const LEGACY_SEO_SLUGS: string[] = [...seoRegistry.entries()]
  .filter(([, entry]) => !isLockedToolSeo(entry))
  .map(([slug]) => slug);

/** Slugs whose entry is the locked flat shape — what the pages actually render. */
export const LOCKED_SEO_SLUGS: string[] = [...seoRegistry.entries()]
  .filter(([, entry]) => isLockedToolSeo(entry))
  .map(([slug]) => slug);
