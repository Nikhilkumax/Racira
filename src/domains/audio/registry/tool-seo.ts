/**
 * Editorial SEO content for individual Racira Audio (/audio) tool pages.
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
 * Content is authored as JSON under ./seo/source and generated into the per-batch
 * modules under ../seo by scripts/audio-json-to-seo.mjs, validated first by
 * scripts/validate-audio-seo-json.mjs. Nothing here is hand-written: the renderer
 * is what guarantees the styling rules (no bold in body copy, one shared privacy
 * block, collapsed FAQs, `{{slug|display text}}` links that render as plain
 * internal links). scripts/audio-seo-drift-check.mjs proves the committed modules
 * still match their JSON sources byte for byte.
 */
import type { ToolSeo as SharedToolSeo } from "@/components/shared/seo-types";

/** The locked flat shape, rendered by the shared SeoContent component. */
export type ToolSeo = SharedToolSeo;

const seoRegistry = new Map<string, ToolSeo>();

export function registerToolSeo(slug: string, seo: ToolSeo) {
  seoRegistry.set(slug, seo);
}

/** Authored content for a tool page, or undefined while a tool has no batch yet. */
export function getToolSeo(slug: string): ToolSeo | undefined {
  return seoRegistry.get(slug);
}

export function hasToolSeo(slug: string): boolean {
  return seoRegistry.has(slug);
}

// ── per-batch content modules ────────────────────────────────────
import { audioSeoBatch1 } from "../seo/batch1";
import { audioSeoBatch2 } from "../seo/batch2";
import { audioSeoBatch3 } from "../seo/batch3";
import { audioSeoBatch4 } from "../seo/batch4";
import { audioSeoBatch5 } from "../seo/batch5";
import { audioSeoBatch6 } from "../seo/batch6";
import { audioSeoBatch7 } from "../seo/batch7";
import { audioSeoBatch8 } from "../seo/batch8";
import { audioSeoBatch9 } from "../seo/batch9";
import { audioSeoBatch10 } from "../seo/batch10";
import { audioSeoBatch11 } from "../seo/batch11";
import { audioSeoBatch12 } from "../seo/batch12";
import { audioSeoBatch13 } from "../seo/batch13";
import { audioSeoBatch14 } from "../seo/batch14";
import { audioSeoBatch15 } from "../seo/batch15";
import { audioSeoBatch16 } from "../seo/batch16";
import { audioSeoBatch17 } from "../seo/batch17";
import { audioSeoBatch18 } from "../seo/batch18";

for (const batch of [
  audioSeoBatch1,
  audioSeoBatch2,
  audioSeoBatch3,
  audioSeoBatch4,
  audioSeoBatch5,
  audioSeoBatch6,
  audioSeoBatch7,
  audioSeoBatch8,
  audioSeoBatch9,
  audioSeoBatch10,
  audioSeoBatch11,
  audioSeoBatch12,
  audioSeoBatch13,
  audioSeoBatch14,
  audioSeoBatch15,
  audioSeoBatch16,
  audioSeoBatch17,
  audioSeoBatch18,
]) {
  for (const [slug, seo] of Object.entries(batch)) {
    registerToolSeo(slug, seo);
  }
}

/** Every slug with authored content — what the pages actually render. */
export const LOCKED_SEO_SLUGS: string[] = [...seoRegistry.keys()];

/** Alias kept for parity with the other domains' audit scripts. */
export const SEO_SLUGS: string[] = LOCKED_SEO_SLUGS;
