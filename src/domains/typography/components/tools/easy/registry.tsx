import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Easy-tier Racira Fonts tool components, keyed by registry slug.
 *
 * Each entry is a next/dynamic lazy import so a tool's code ships only in its
 * own route chunk — the /typography/[slug] page never pulls in every tool at
 * once. A slug may only be marked "live" in the domain registry when it has an
 * entry here (the [slug] page enforces the same guarantee through
 * TOOL_COMPONENTS).
 */
export const EASY_TOOL_COMPONENTS: Record<string, ComponentType> = {
  // ── Font Preview & Testing ──────────────────────────────────────
  "custom-text-font-preview": dynamic(() => import("./custom-text-font-preview")),
  "pangram-font-tester": dynamic(() => import("./pangram-font-tester")),
  "font-size-preview": dynamic(() => import("./font-size-preview")),
  "font-line-height-tester": dynamic(() => import("./font-line-height-tester")),
  "font-letter-spacing-tester": dynamic(() => import("./font-letter-spacing-tester")),
  "serif-sans-pairing-tool": dynamic(() => import("./serif-sans-pairing-tool")),
  "display-body-pairing-tool": dynamic(() => import("./display-body-pairing-tool")),
  "heading-caption-pairing": dynamic(() => import("./heading-caption-pairing")),
  "monospace-pairing-tool": dynamic(() => import("./monospace-pairing-tool")),
  "web-font-tester": dynamic(() => import("./web-font-tester")),
  "font-specimen-sheet": dynamic(() => import("./font-specimen-sheet")),
  "font-rendering-preview": dynamic(() => import("./font-rendering-preview")),
  "brand-font-stack-builder": dynamic(() => import("./brand-font-stack-builder")),
  "waterfall-font-preview": dynamic(() => import("./waterfall-font-preview")),

  // ── Type Scale & Spacing ────────────────────────────────────────
  "modular-scale-calculator": dynamic(() => import("./modular-scale-calculator")),
  "type-scale-generator": dynamic(() => import("./type-scale-generator")),
  "fluid-type-scale-builder": dynamic(() => import("./fluid-type-scale-builder")),
  "baseline-grid-calculator": dynamic(() => import("./baseline-grid-calculator")),
  "line-height-optimizer": dynamic(() => import("./line-height-optimizer")),
  "letter-spacing-calculator": dynamic(() => import("./letter-spacing-calculator")),
  "css-typography-token-generator": dynamic(() => import("./css-typography-token-generator")),
  "heading-scale-visualizer": dynamic(() => import("./heading-scale-visualizer")),
  "caption-and-footnote-scale": dynamic(() => import("./caption-and-footnote-scale")),
  "vertical-rhythm-builder": dynamic(() => import("./vertical-rhythm-builder")),
  "type-hierarchy-planner": dynamic(() => import("./type-hierarchy-planner")),

  // ── Font Conversion & Export ────────────────────────────────────
  "font-base64-encoder": dynamic(() => import("./font-base64-encoder")),
  "font-css-generator": dynamic(() => import("./font-css-generator")),
  "font-face-declaration-builder": dynamic(() => import("./font-face-declaration-builder")),
  "font-face-generator": dynamic(() => import("./font-face-generator")),

  // ── Glyph & Character Tools ─────────────────────────────────────
  "character-code-converter": dynamic(() => import("./character-code-converter")),
  "unicode-character-explorer": dynamic(() => import("./unicode-character-explorer")),
  "special-character-picker": dynamic(() => import("./special-character-picker")),
  "dingbat-and-symbol-explorer": dynamic(() => import("./dingbat-and-symbol-explorer")),
  "glyph-comparison-tool": dynamic(() => import("./glyph-comparison-tool")),
  "unicode-block-explorer": dynamic(() => import("./unicode-block-explorer")),
  "emoji-unicode-mapper": dynamic(() => import("./emoji-unicode-mapper")),

  // ── Text Rendering & Layout ─────────────────────────────────────
  "text-justification-previewer": dynamic(() => import("./text-justification-previewer")),
  "running-head-previewer": dynamic(() => import("./running-head-previewer")),
  "optical-margin-alignment-preview": dynamic(() => import("./optical-margin-alignment-preview")),
  "text-column-layout-builder": dynamic(() => import("./text-column-layout-builder")),
  "hyphenation-tester": dynamic(() => import("./hyphenation-tester")),
  "drop-cap-generator": dynamic(() => import("./drop-cap-generator")),
  "pull-quote-designer": dynamic(() => import("./pull-quote-designer")),
  "initial-cap-styler": dynamic(() => import("./initial-cap-styler")),
  "text-box-shape-wrapper": dynamic(() => import("./text-box-shape-wrapper")),

  // ── Accessibility & Readability ─────────────────────────────────
  "readability-score-calculator": dynamic(() => import("./readability-score-calculator")),
  "contrast-text-checker": dynamic(() => import("./contrast-text-checker")),
  "color-on-color-text-checker": dynamic(() => import("./color-on-color-text-checker")),
  "wcag-font-size-checker": dynamic(() => import("./wcag-font-size-checker")),
  "dyslexia-font-simulator": dynamic(() => import("./dyslexia-font-simulator")),
  "mobile-font-size-checker": dynamic(() => import("./mobile-font-size-checker")),
  "low-vision-font-tester": dynamic(() => import("./low-vision-font-tester")),
  "font-for-elderly-simulator": dynamic(() => import("./font-for-elderly-simulator")),

  // ── CSS & Web Typography ────────────────────────────────────────
  "css-font-stack-builder": dynamic(() => import("./css-font-stack-builder")),
  "system-font-stack-generator": dynamic(() => import("./system-font-stack-generator")),
  "google-fonts-css-generator": dynamic(() => import("./google-fonts-css-generator")),
  "css-clamp-calculator": dynamic(() => import("./css-clamp-calculator")),
  "text-shadow-builder": dynamic(() => import("./text-shadow-builder")),
  "text-gradient-maker": dynamic(() => import("./text-gradient-maker")),
  "css-letter-spacing-tool": dynamic(() => import("./css-letter-spacing-tool")),
  "css-line-height-tool": dynamic(() => import("./css-line-height-tool")),
  "css-fluid-typography-builder": dynamic(() => import("./css-fluid-typography-builder")),

  // ── Print & Editorial Typography ────────────────────────────────
  "running-head-planner": dynamic(() => import("./running-head-planner")),
  "print-type-specification-sheet": dynamic(() => import("./print-type-specification-sheet")),
  "magazine-column-setter": dynamic(() => import("./magazine-column-setter")),
  "newspaper-typography-previewer": dynamic(() => import("./newspaper-typography-previewer")),
  "footnote-and-endnote-formatter": dynamic(() => import("./footnote-and-endnote-formatter")),
  "chapter-header-designer": dynamic(() => import("./chapter-header-designer")),
  "table-of-contents-typesetter": dynamic(() => import("./table-of-contents-typesetter")),

  // ── Decorative & Specialty Type ─────────────────────────────────
  "outlined-text-generator": dynamic(() => import("./outlined-text-generator")),
  "neon-text-previewer": dynamic(() => import("./neon-text-previewer")),
  "lettering-style-previewer": dynamic(() => import("./lettering-style-previewer")),
  "shadow-text-generator": dynamic(() => import("./shadow-text-generator")),
  "3d-text-effect-preview": dynamic(() => import("./3d-text-effect-preview")),
  "retro-type-style-maker": dynamic(() => import("./retro-type-style-maker")),
  "logo-type-tester": dynamic(() => import("./logo-type-tester")),
};
