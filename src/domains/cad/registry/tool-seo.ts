/**
 * Editorial SEO content for individual CAD tool pages.
 *
 * Structure matches the settled cross-domain standard: <h2> top-level
 * sections + <h3> for FAQ questions. Each tool's content has five movements:
 *
 *   1. What is [Tool]          — real behaviour, real formulas/standards
 *   2. How to Use [Tool]       — numbered steps against the actual UI
 *   3. Why Use [Tool]          — genuine use cases
 *   4. Privacy & Security      — identical across all tools
 *   5. Frequently Asked Questions — each question as a subHeading (h3)
 *
 * Target: 500–1000 words per tool.
 *
 * Content is authored as JSON (scratch/cad-seo-batchN.json), schema-checked
 * by scripts/validate-seo-json.ts, converted by scripts/json-to-seo.ts, and
 * assembled into per-batch modules under ./seo/ by _scripts/cad-seo-assemble.mjs.
 * Do not hand-edit ./seo/*.ts — regenerate from the JSON source.
 */
export interface SeoContentBlock {
  type: "paragraph" | "list";
  text?: string;
  items?: string[];
}

export interface SeoSection {
  heading: string;
  subHeading?: string;
  content: SeoContentBlock[];
}

export interface ToolSeo {
  sections: SeoSection[];
}

/**
 * Privacy & Security boilerplate — byte-identical to the text used across
 * the other domains. Inserted as the 4th section in every tool's content.
 */
export const PRIVACY_SECURITY_TEXT =
  "This tool runs entirely in your browser — no data ever leaves your device. There is no server round-trip, no upload, no logging, and no account required. Your input is processed locally using client-side JavaScript and is never stored, transmitted, or accessible to anyone else. When you close the tab, everything disappears.";

const seoRegistry = new Map<string, ToolSeo>();

export function registerToolSeo(slug: string, seo: ToolSeo) {
  seoRegistry.set(slug, seo);
}

export function getToolSeo(slug: string): ToolSeo | undefined {
  return seoRegistry.get(slug);
}

export function hasToolSeo(slug: string): boolean {
  return seoRegistry.has(slug);
}

// ── per-batch content modules (generated from JSON) ───────────────
import { cadSeoBatch1 } from "./seo/batch1";
import { cadSeoBatch2 } from "./seo/batch2";
import { cadSeoBatch3 } from "./seo/batch3";
import { cadSeoBatch4 } from "./seo/batch4";
import { cadSeoBatch5 } from "./seo/batch5";
import { cadSeoBatch6 } from "./seo/batch6";
import { cadSeoBatch7 } from "./seo/batch7";

for (const [slug, seo] of Object.entries(cadSeoBatch1)) {
  registerToolSeo(slug, seo);
}
for (const [slug, seo] of Object.entries(cadSeoBatch2)) {
  registerToolSeo(slug, seo);
}
for (const [slug, seo] of Object.entries(cadSeoBatch3)) {
  registerToolSeo(slug, seo);
}
for (const [slug, seo] of Object.entries(cadSeoBatch4)) {
  registerToolSeo(slug, seo);
}
for (const [slug, seo] of Object.entries(cadSeoBatch5)) {
  registerToolSeo(slug, seo);
}
for (const [slug, seo] of Object.entries(cadSeoBatch6)) {
  registerToolSeo(slug, seo);
}
for (const [slug, seo] of Object.entries(cadSeoBatch7)) {
  registerToolSeo(slug, seo);
}
