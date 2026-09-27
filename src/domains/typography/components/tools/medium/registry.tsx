import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Medium-tier Racira Fonts tool components, keyed by registry slug.
 *
 * Same contract as the Easy tier: one next/dynamic entry per slug, and a slug
 * may only be marked "live" in the domain registry when it appears here. The
 * Medium tier is where browser-native measurement starts doing real work —
 * canvas-measured metrics, FontFaceSet coverage checks and exported CSS.
 */
export const MEDIUM_TOOL_COMPONENTS: Record<string, ComponentType> = {
  // ── Font Preview & Testing ──────────────────────────────────────
  "multi-font-comparison": dynamic(() => import("./multi-font-comparison")),
  "variable-font-sliders": dynamic(() => import("./variable-font-sliders")),
  "contrast-pairing-checker": dynamic(() => import("./contrast-pairing-checker")),
  "font-style-contrast-analyzer": dynamic(() => import("./font-style-contrast-analyzer")),
  "font-pairing-suggester": dynamic(() => import("./font-pairing-suggester")),
  "font-harmony-visualizer": dynamic(() => import("./font-harmony-visualizer")),
  "google-fonts-pairing-picker": dynamic(() => import("./google-fonts-pairing-picker")),

  // ── Type Scale & Spacing ────────────────────────────────────────
  "paragraph-width-optimizer": dynamic(() => import("./paragraph-width-optimizer")),

  // ── Font Conversion & Export ────────────────────────────────────
  "font-character-extractor": dynamic(() => import("./font-character-extractor")),
  "font-license-inspector": dynamic(() => import("./font-license-inspector")),
  "variable-font-axis-exporter": dynamic(() => import("./variable-font-axis-exporter")),
  "font-glyph-png-exporter": dynamic(() => import("./font-glyph-png-exporter")),

  // ── Glyph & Character Tools ─────────────────────────────────────
  "glyph-browser": dynamic(() => import("./glyph-browser")),
  "kerning-pair-inspector": dynamic(() => import("./kerning-pair-inspector")),
  "missing-glyph-detector": dynamic(() => import("./missing-glyph-detector")),
  "opentype-feature-explorer": dynamic(() => import("./opentype-feature-explorer")),

  // ── Text Rendering & Layout ─────────────────────────────────────
  "widow-and-orphan-detector": dynamic(() => import("./widow-and-orphan-detector")),

  // ── Accessibility & Readability ─────────────────────────────────
  "font-accessibility-evaluator": dynamic(() => import("./font-accessibility-evaluator")),
  "body-text-legibility-grader": dynamic(() => import("./body-text-legibility-grader")),

  // ── CSS & Web Typography ────────────────────────────────────────
  "css-variable-font-builder": dynamic(() => import("./css-variable-font-builder")),
  "font-loading-strategy-builder": dynamic(() => import("./font-loading-strategy-builder")),

  // ── Print & Editorial Typography ────────────────────────────────
  "editorial-style-guide-generator": dynamic(() => import("./editorial-style-guide-generator")),
  "index-page-layout-preview": dynamic(() => import("./index-page-layout-preview")),
  "book-interior-layout-preview": dynamic(() => import("./book-interior-layout-preview")),

  // ── Decorative & Specialty Type ─────────────────────────────────
  "hand-lettering-guide-sheet": dynamic(() => import("./hand-lettering-guide-sheet")),
  "calligraphy-guideline-generator": dynamic(() => import("./calligraphy-guideline-generator")),
  "monogram-letter-designer": dynamic(() => import("./monogram-letter-designer")),
};
