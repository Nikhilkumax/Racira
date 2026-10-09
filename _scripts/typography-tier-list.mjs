#!/usr/bin/env node
/**
 * typography-tier-list.mjs — Easy / Medium / Hard classification for the
 * Racira Fonts (/typography) tools that are NOT live yet.
 *
 * Rubric (same as the Developers / CAD audits):
 *   Easy   — pure native logic, no external engine/library dependency,
 *            straightforward UI.
 *   Medium — a moderate library integration or more complex UI/state, still
 *            natively buildable with the current stack.
 *   Hard   — needs a heavy engine/WASM dependency outside the approved Phase 1
 *            stack, or substantial original rendering work (font-binary
 *            encoding, shaping engines).
 *
 * Hard entries carry a blocker flag:
 *   LICENSING/STACK — cannot be built until a library and its licence are
 *                     approved (the same open decision the PDF engine question
 *                     sits behind).
 *   EFFORT          — buildable natively, but needs substantial original work.
 *
 * Scores are 1–10 within the domain's own scale (1 = a few fields and an
 * arithmetic answer, 10 = multi-week engine work).
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const regSrc = readFileSync(resolve(ROOT, "src/domains/typography/registry.ts"), "utf-8");

const toSlug = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const catRe = /name:\s*"([^"]+)",\s*\n\s*tools:\s*mk\(\[([\s\S]*?)\n\s*\]\),/g;
const categories = [];
for (const m of regSrc.matchAll(catRe)) {
  const tools = [];
  for (const row of m[2].matchAll(/\[\s*"([^"]+)",\s*"([^"]+)",\s*([A-Za-z0-9_]+),\s*(true|false)\s*\]/g)) {
    tools.push({ name: row[1], slug: toSlug(row[1]), live: row[4] === "true" });
  }
  categories.push({ name: m[1], tools });
}
const all = categories.flatMap((c) => c.tools.map((t) => ({ ...t, category: c.name })));

// slug → [tier, score, hardBlocker?]
const TIERS = {
  // ── Font Preview & Testing ──────────────────────────────────────
  "web-font-tester": ["Easy", 3],
  "custom-text-font-preview": ["Easy", 1],
  "pangram-font-tester": ["Easy", 1],
  "font-specimen-sheet": ["Easy", 3],
  "multi-font-comparison": ["Medium", 4],
  "font-size-preview": ["Easy", 1],
  "font-line-height-tester": ["Easy", 2],
  "font-letter-spacing-tester": ["Easy", 2],
  "variable-font-sliders": ["Medium", 5],
  "font-rendering-preview": ["Easy", 3],
  "font-pairing-suggester": ["Medium", 6],
  "serif-sans-pairing-tool": ["Easy", 2],
  "display-body-pairing-tool": ["Easy", 2],
  "heading-caption-pairing": ["Easy", 2],
  "contrast-pairing-checker": ["Medium", 5],
  "font-harmony-visualizer": ["Medium", 6],
  "brand-font-stack-builder": ["Easy", 3],
  "monospace-pairing-tool": ["Easy", 2],
  "google-fonts-pairing-picker": ["Medium", 6],
  "font-style-contrast-analyzer": ["Medium", 5],

  // ── Type Scale & Spacing ────────────────────────────────────────
  "vertical-rhythm-builder": ["Easy", 3],
  "type-hierarchy-planner": ["Easy", 3],
  "heading-scale-visualizer": ["Easy", 2],
  "caption-and-footnote-scale": ["Easy", 2],
  "paragraph-width-optimizer": ["Medium", 5],

  // ── Font Conversion & Export ────────────────────────────────────
  "font-format-converter": ["Hard", 9, "LICENSING/STACK — font binary decode/encode + a WOFF2 encoder"],
  "web-font-subsetter": ["Hard", 9, "LICENSING/STACK — subsetting engine + WOFF2 encode; also per-font licence terms"],
  "font-character-extractor": ["Medium", 6],
  "font-base64-encoder": ["Easy", 2],
  "font-css-generator": ["Easy", 2],
  "font-face-declaration-builder": ["Easy", 3],
  "variable-font-axis-exporter": ["Medium", 7],
  "font-glyph-png-exporter": ["Medium", 7],
  "font-metadata-editor": ["Hard", 8, "LICENSING/STACK — writes font tables (need an approved editor lib + licence review)"],
  "font-license-inspector": ["Medium", 6],

  // ── Glyph & Character Tools ─────────────────────────────────────
  "glyph-browser": ["Medium", 7],
  "special-character-picker": ["Easy", 2],
  "dingbat-and-symbol-explorer": ["Easy", 2],
  "ligature-finder": ["Hard", 8, "LICENSING/STACK — needs a shaping engine (HarfBuzz/WASM) to be truthful"],
  "kerning-pair-inspector": ["Medium", 7],
  "opentype-feature-explorer": ["Medium", 4],
  "glyph-comparison-tool": ["Easy", 2],
  "missing-glyph-detector": ["Medium", 5],
  "unicode-block-explorer": ["Easy", 2],
  "emoji-unicode-mapper": ["Easy", 2],

  // ── Text Rendering & Layout ─────────────────────────────────────
  "text-column-layout-builder": ["Easy", 3],
  "text-justification-previewer": ["Easy", 2],
  "hyphenation-tester": ["Easy", 3],
  "widow-and-orphan-detector": ["Medium", 6],
  "drop-cap-generator": ["Easy", 3],
  "pull-quote-designer": ["Easy", 3],
  "initial-cap-styler": ["Easy", 3],
  "running-head-previewer": ["Easy", 2],
  "text-box-shape-wrapper": ["Easy", 3],
  "optical-margin-alignment-preview": ["Easy", 2],

  // ── Accessibility & Readability ─────────────────────────────────
  "font-accessibility-evaluator": ["Medium", 4],
  "body-text-legibility-grader": ["Medium", 5],
  "font-for-elderly-simulator": ["Easy", 3],
  "low-vision-font-tester": ["Easy", 2],

  // ── CSS & Web Typography ────────────────────────────────────────
  "css-variable-font-builder": ["Medium", 4],
  "font-loading-strategy-builder": ["Medium", 4],
  "css-fluid-typography-builder": ["Easy", 3],
  "css-letter-spacing-tool": ["Easy", 2],
  "css-line-height-tool": ["Easy", 2],
  "text-gradient-maker": ["Easy", 2],

  // ── Print & Editorial Typography ────────────────────────────────
  "print-type-specification-sheet": ["Easy", 3],
  "editorial-style-guide-generator": ["Medium", 4],
  "magazine-column-setter": ["Easy", 3],
  "newspaper-typography-previewer": ["Easy", 3],
  "book-interior-layout-preview": ["Medium", 5],
  "footnote-and-endnote-formatter": ["Easy", 3],
  "running-head-planner": ["Easy", 2],
  "chapter-header-designer": ["Easy", 3],
  "table-of-contents-typesetter": ["Easy", 3],
  "index-page-layout-preview": ["Medium", 4],

  // ── Decorative & Specialty Type ─────────────────────────────────
  "lettering-style-previewer": ["Easy", 2],
  "shadow-text-generator": ["Easy", 2],
  "3d-text-effect-preview": ["Easy", 3],
  "retro-type-style-maker": ["Easy", 3],
  "hand-lettering-guide-sheet": ["Medium", 5],
  "calligraphy-guideline-generator": ["Medium", 5],
  "monogram-letter-designer": ["Medium", 5],
  "logo-type-tester": ["Easy", 3],
};

const live = all.filter((t) => t.live);
const remaining = all.filter((t) => !t.live);
const unknown = remaining.filter((t) => !TIERS[t.slug]);
const byTier = { Easy: [], Medium: [], Hard: [] };
for (const t of remaining) {
  const entry = TIERS[t.slug];
  if (!entry) continue;
  byTier[entry[0]].push({ ...t, score: entry[1], blocker: entry[2] });
}

console.log("=== Racira Fonts — remaining tool tiering ===");
console.log(`Total tools: ${all.length} · live: ${live.length} · remaining: ${remaining.length}`);
console.log("");
for (const c of categories) {
  const rows = remaining.filter((t) => t.category === c.name);
  if (!rows.length) continue;
  const counts = ["Easy", "Medium", "Hard"].map((tier) => rows.filter((r) => TIERS[r.slug]?.[0] === tier).length);
  console.log(`${c.name}: ${rows.length} remaining (E ${counts[0]} / M ${counts[1]} / H ${counts[2]})`);
}
console.log("");
console.log(
  `TOTALS — Easy ${byTier.Easy.length} · Medium ${byTier.Medium.length} · Hard ${byTier.Hard.length} · (classified ${byTier.Easy.length + byTier.Medium.length + byTier.Hard.length}/${remaining.length})`,
);
console.log("");
for (const tier of ["Easy", "Medium", "Hard"]) {
  console.log(`── ${tier} (${byTier[tier].length}) ──`);
  for (const t of byTier[tier].sort((a, b) => a.score - b.score)) {
    console.log(`  ${String(t.score).padStart(2)}/10  ${t.slug}  —  ${t.category}${t.blocker ? `\n          [${t.blocker}]` : ""}`);
  }
  console.log("");
}
if (unknown.length) {
  console.log(`UNCLASSIFIED (${unknown.length}): ${unknown.map((t) => t.slug).join(", ")}`);
}
