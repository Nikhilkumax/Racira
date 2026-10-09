import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { categories } from "@/domains/typography/registry";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { inferIcon } from "@/components/shared/icon-map";

/**
 * Curated related picks, keyed by tool slug.
 *
 * Same pattern as the colors domain's related-tools row, adapted to this
 * domain: that component is typed against the colors registry, its own ToolDef
 * and its own ToolCard, and this domain's cards are rendered inline (the
 * category grid does the same). Any tool without an entry falls back to
 * same-category live tools ranked by keyword overlap, so every tool page gets a
 * full row — curated entries are added per tool as each SEO batch is authored.
 *
 * The row renders its own card markup rather than the shared `ToolCard`: that
 * component is a client component, and a Lucide icon is a component, so passing
 * one from this server component across the client boundary throws
 * "Functions cannot be passed directly to Client Components".
 */
const CURATED_RELATED: Record<string, string[]> = {
  // ── Font Conversion & Export (batch 1) ───────────────────────────
  "font-base64-encoder": [
    "font-css-generator",
    "font-license-inspector",
    "font-face-declaration-builder",
    "font-loading-strategy-builder",
  ],
  "font-css-generator": [
    "font-face-declaration-builder",
    "font-base64-encoder",
    "font-loading-strategy-builder",
    "google-fonts-css-generator",
  ],
  "font-face-declaration-builder": [
    "font-css-generator",
    "font-loading-strategy-builder",
    "css-fluid-typography-builder",
    "font-license-inspector",
  ],
  "font-character-extractor": [
    "unicode-character-explorer",
    "unicode-block-explorer",
    "special-character-picker",
    "character-code-converter",
  ],
  "variable-font-axis-exporter": [
    "css-variable-font-builder",
    "variable-font-sliders",
    "font-css-generator",
    "font-loading-strategy-builder",
  ],
  "font-glyph-png-exporter": [
    "glyph-browser",
    "glyph-comparison-tool",
    "font-specimen-sheet",
    "missing-glyph-detector",
  ],
  "font-license-inspector": [
    "font-css-generator",
    "font-base64-encoder",
    "font-face-declaration-builder",
    "font-loading-strategy-builder",
  ],

  // ── Text Rendering & Layout (batch 2) ────────────────────────────
  "text-justification-previewer": [
    "hyphenation-tester",
    "text-column-layout-builder",
    "widow-and-orphan-detector",
    "paragraph-width-optimizer",
  ],
  "hyphenation-tester": [
    "text-justification-previewer",
    "widow-and-orphan-detector",
    "text-column-layout-builder",
    "readability-score-calculator",
  ],
  "text-column-layout-builder": [
    "text-justification-previewer",
    "hyphenation-tester",
    "magazine-column-setter",
    "newspaper-typography-previewer",
  ],
  "drop-cap-generator": [
    "initial-cap-styler",
    "pull-quote-designer",
    "chapter-header-designer",
    "text-column-layout-builder",
  ],
  "initial-cap-styler": [
    "drop-cap-generator",
    "pull-quote-designer",
    "chapter-header-designer",
    "type-hierarchy-planner",
  ],
  "pull-quote-designer": [
    "drop-cap-generator",
    "initial-cap-styler",
    "vertical-rhythm-builder",
    "text-box-shape-wrapper",
  ],
  "running-head-previewer": [
    "running-head-planner",
    "print-type-specification-sheet",
    "book-interior-layout-preview",
    "table-of-contents-typesetter",
  ],
  "text-box-shape-wrapper": [
    "text-column-layout-builder",
    "optical-margin-alignment-preview",
    "drop-cap-generator",
    "paragraph-width-optimizer",
  ],
  "optical-margin-alignment-preview": [
    "pull-quote-designer",
    "text-box-shape-wrapper",
    "text-justification-previewer",
    "paragraph-width-optimizer",
  ],
  "widow-and-orphan-detector": [
    "text-justification-previewer",
    "hyphenation-tester",
    "text-column-layout-builder",
    "paragraph-width-optimizer",
  ],

  // ── Accessibility & Readability (batch 3) ────────────────────────
  "readability-score-calculator": [
    "body-text-legibility-grader",
    "paragraph-width-optimizer",
    "line-height-optimizer",
    "font-accessibility-evaluator",
  ],
  "contrast-text-checker": [
    "color-on-color-text-checker",
    "wcag-font-size-checker",
    "contrast-pairing-checker",
    "font-accessibility-evaluator",
  ],
  "dyslexia-font-simulator": [
    "line-height-optimizer",
    "letter-spacing-calculator",
    "low-vision-font-tester",
    "mobile-font-size-checker",
  ],
  "wcag-font-size-checker": [
    "contrast-text-checker",
    "css-line-height-tool",
    "mobile-font-size-checker",
    "font-accessibility-evaluator",
  ],
  "font-accessibility-evaluator": [
    "readability-score-calculator",
    "body-text-legibility-grader",
    "paragraph-width-optimizer",
    "contrast-text-checker",
  ],
  "body-text-legibility-grader": [
    "paragraph-width-optimizer",
    "line-height-optimizer",
    "font-for-elderly-simulator",
    "font-accessibility-evaluator",
  ],
  "color-on-color-text-checker": [
    "contrast-text-checker",
    "contrast-pairing-checker",
    "font-accessibility-evaluator",
    "font-harmony-visualizer",
  ],
  "font-for-elderly-simulator": [
    "low-vision-font-tester",
    "wcag-font-size-checker",
    "line-height-optimizer",
    "mobile-font-size-checker",
  ],
  "low-vision-font-tester": [
    "font-for-elderly-simulator",
    "dyslexia-font-simulator",
    "contrast-text-checker",
    "body-text-legibility-grader",
  ],
  "mobile-font-size-checker": [
    "paragraph-width-optimizer",
    "wcag-font-size-checker",
    "css-fluid-typography-builder",
    "text-column-layout-builder",
  ],

  // ── Print & Editorial Typography (batch 5) ───────────────────────
  "print-type-specification-sheet": [
    "book-interior-layout-preview",
    "magazine-column-setter",
    "caption-and-footnote-scale",
    "running-head-planner",
  ],
  "editorial-style-guide-generator": [
    "type-scale-generator",
    "modular-scale-calculator",
    "type-hierarchy-planner",
    "css-typography-token-generator",
  ],
  "magazine-column-setter": [
    "text-column-layout-builder",
    "newspaper-typography-previewer",
    "baseline-grid-calculator",
    "print-type-specification-sheet",
  ],
  "newspaper-typography-previewer": [
    "magazine-column-setter",
    "hyphenation-tester",
    "print-type-specification-sheet",
    "pull-quote-designer",
  ],
  "book-interior-layout-preview": [
    "print-type-specification-sheet",
    "running-head-previewer",
    "widow-and-orphan-detector",
    "baseline-grid-calculator",
  ],
  "footnote-and-endnote-formatter": [
    "book-interior-layout-preview",
    "index-page-layout-preview",
    "print-type-specification-sheet",
    "table-of-contents-typesetter",
  ],
  "running-head-planner": [
    "running-head-previewer",
    "book-interior-layout-preview",
    "chapter-header-designer",
    "print-type-specification-sheet",
  ],
  "chapter-header-designer": [
    "drop-cap-generator",
    "initial-cap-styler",
    "running-head-planner",
    "type-hierarchy-planner",
  ],
  "table-of-contents-typesetter": [
    "book-interior-layout-preview",
    "index-page-layout-preview",
    "running-head-planner",
    "print-type-specification-sheet",
  ],
  "index-page-layout-preview": [
    "table-of-contents-typesetter",
    "book-interior-layout-preview",
    "footnote-and-endnote-formatter",
    "magazine-column-setter",
  ],

  // ── Decorative & Specialty Type (batch 7) ────────────────────────
  "lettering-style-previewer": [
    "monogram-letter-designer",
    "logo-type-tester",
    "retro-type-style-maker",
    "hand-lettering-guide-sheet",
  ],
  "outlined-text-generator": [
    "shadow-text-generator",
    "3d-text-effect-preview",
    "text-gradient-maker",
    "logo-type-tester",
  ],
  "shadow-text-generator": [
    "text-shadow-builder",
    "3d-text-effect-preview",
    "neon-text-previewer",
    "outlined-text-generator",
  ],
  "3d-text-effect-preview": [
    "shadow-text-generator",
    "neon-text-previewer",
    "text-gradient-maker",
    "outlined-text-generator",
  ],
  "neon-text-previewer": [
    "shadow-text-generator",
    "text-gradient-maker",
    "3d-text-effect-preview",
    "outlined-text-generator",
  ],
  "retro-type-style-maker": [
    "lettering-style-previewer",
    "hand-lettering-guide-sheet",
    "calligraphy-guideline-generator",
    "logo-type-tester",
  ],
  "hand-lettering-guide-sheet": [
    "calligraphy-guideline-generator",
    "lettering-style-previewer",
    "monogram-letter-designer",
    "retro-type-style-maker",
  ],
  "calligraphy-guideline-generator": [
    "hand-lettering-guide-sheet",
    "lettering-style-previewer",
    "monogram-letter-designer",
    "retro-type-style-maker",
  ],
  "monogram-letter-designer": [
    "logo-type-tester",
    "lettering-style-previewer",
    "hand-lettering-guide-sheet",
    "retro-type-style-maker",
  ],
  "logo-type-tester": [
    "monogram-letter-designer",
    "lettering-style-previewer",
    "retro-type-style-maker",
    "type-hierarchy-planner",
  ],

  // ── Font Preview & Testing (batches 8-10) ────────────────────────
  "font-previewer": [
    "web-font-tester",
    "custom-text-font-preview",
    "waterfall-font-preview",
    "font-specimen-sheet",
  ],
  "web-font-tester": [
    "font-loading-strategy-builder",
    "font-face-declaration-builder",
    "font-css-generator",
    "font-rendering-preview",
  ],
  "custom-text-font-preview": [
    "font-previewer",
    "font-size-preview",
    "waterfall-font-preview",
    "multi-font-comparison",
  ],
  "waterfall-font-preview": [
    "font-size-preview",
    "type-scale-generator",
    "font-previewer",
    "custom-text-font-preview",
  ],
  "pangram-font-tester": [
    "font-specimen-sheet",
    "multi-font-comparison",
    "glyph-browser",
    "font-previewer",
  ],
  "font-specimen-sheet": [
    "font-previewer",
    "multi-font-comparison",
    "pangram-font-tester",
    "waterfall-font-preview",
  ],
  "multi-font-comparison": [
    "font-previewer",
    "font-pairing-suggester",
    "font-style-contrast-analyzer",
    "brand-font-stack-builder",
  ],
  "font-size-preview": [
    "type-scale-generator",
    "waterfall-font-preview",
    "modular-scale-calculator",
    "css-clamp-calculator",
  ],
  "font-line-height-tester": [
    "line-height-optimizer",
    "css-line-height-tool",
    "vertical-rhythm-builder",
    "paragraph-width-optimizer",
  ],
  "font-letter-spacing-tester": [
    "letter-spacing-calculator",
    "css-letter-spacing-tool",
    "optical-margin-alignment-preview",
    "type-hierarchy-planner",
  ],
  "heading-caption-pairing": [
    "display-body-pairing-tool",
    "serif-sans-pairing-tool",
    "type-hierarchy-planner",
    "caption-and-footnote-scale",
  ],
  "contrast-pairing-checker": [
    "contrast-text-checker",
    "font-accessibility-evaluator",
    "color-on-color-text-checker",
    "font-harmony-visualizer",
  ],
  "font-harmony-visualizer": [
    "font-pairing-suggester",
    "serif-sans-pairing-tool",
    "multi-font-comparison",
    "font-style-contrast-analyzer",
  ],
  "brand-font-stack-builder": [
    "css-font-stack-builder",
    "system-font-stack-generator",
    "editorial-style-guide-generator",
    "font-loading-strategy-builder",
  ],
  "monospace-pairing-tool": [
    "google-fonts-pairing-picker",
    "kerning-pair-inspector",
    "font-rendering-preview",
    "brand-font-stack-builder",
  ],
  "google-fonts-pairing-picker": [
    "font-pairing-suggester",
    "serif-sans-pairing-tool",
    "google-fonts-css-generator",
    "font-loading-strategy-builder",
  ],
  "font-style-contrast-analyzer": [
    "font-harmony-visualizer",
    "contrast-pairing-checker",
    "font-pairing-suggester",
    "multi-font-comparison",
  ],
  "variable-font-sliders": [
    "css-variable-font-builder",
    "variable-font-axis-exporter",
    "font-previewer",
    "font-rendering-preview",
  ],
  "font-rendering-preview": [
    "font-previewer",
    "web-font-tester",
    "css-font-stack-builder",
    "waterfall-font-preview",
  ],
  "font-pairing-suggester": [
    "serif-sans-pairing-tool",
    "display-body-pairing-tool",
    "font-harmony-visualizer",
    "monospace-pairing-tool",
  ],
  "serif-sans-pairing-tool": [
    "font-pairing-suggester",
    "display-body-pairing-tool",
    "multi-font-comparison",
    "monospace-pairing-tool",
  ],
  "display-body-pairing-tool": [
    "serif-sans-pairing-tool",
    "heading-caption-pairing",
    "font-pairing-suggester",
    "type-hierarchy-planner",
  ],
  "type-scale-generator": [
    "modular-scale-calculator",
    "fluid-type-scale-builder",
    "type-hierarchy-planner",
    "font-size-preview",
  ],
  "modular-scale-calculator": [
    "type-scale-generator",
    "font-size-preview",
    "fluid-type-scale-builder",
    "baseline-grid-calculator",
  ],
  "fluid-type-scale-builder": [
    "css-clamp-calculator",
    "type-scale-generator",
    "modular-scale-calculator",
    "css-fluid-typography-builder",
  ],

  // ── Type Scale & Spacing (batches 14-15) ─────────────────────────
  "baseline-grid-calculator": [
    "vertical-rhythm-builder",
    "line-height-optimizer",
    "type-scale-generator",
    "css-typography-token-generator",
  ],
  "line-height-optimizer": [
    "baseline-grid-calculator",
    "paragraph-width-optimizer",
    "vertical-rhythm-builder",
    "font-line-height-tester",
  ],
  "letter-spacing-calculator": [
    "css-letter-spacing-tool",
    "font-letter-spacing-tester",
    "type-scale-generator",
    "heading-scale-visualizer",
  ],
  "paragraph-width-optimizer": [
    "line-height-optimizer",
    "css-clamp-calculator",
    "type-scale-generator",
    "text-column-layout-builder",
  ],
  "vertical-rhythm-builder": [
    "baseline-grid-calculator",
    "line-height-optimizer",
    "type-scale-generator",
    "modular-scale-calculator",
  ],
  "type-hierarchy-planner": [
    "modular-scale-calculator",
    "heading-scale-visualizer",
    "editorial-style-guide-generator",
    "vertical-rhythm-builder",
  ],
  "heading-scale-visualizer": [
    "css-typography-token-generator",
    "type-scale-generator",
    "heading-caption-pairing",
    "css-clamp-calculator",
  ],
  "caption-and-footnote-scale": [
    "type-scale-generator",
    "footnote-and-endnote-formatter",
    "line-height-optimizer",
    "css-typography-token-generator",
  ],
  "css-typography-token-generator": [
    "modular-scale-calculator",
    "type-scale-generator",
    "heading-scale-visualizer",
    "letter-spacing-calculator",
  ],

  // ── CSS & Web Typography (batches 16-17) ─────────────────────────
  "css-font-stack-builder": [
    "system-font-stack-generator",
    "css-variable-font-builder",
    "font-face-generator",
    "font-loading-strategy-builder",
  ],
  "font-face-generator": [
    "font-face-declaration-builder",
    "css-font-stack-builder",
    "font-loading-strategy-builder",
    "css-variable-font-builder",
  ],
  "css-variable-font-builder": [
    "variable-font-sliders",
    "font-face-generator",
    "variable-font-axis-exporter",
    "font-loading-strategy-builder",
  ],
  "google-fonts-css-generator": [
    "google-fonts-pairing-picker",
    "font-loading-strategy-builder",
    "font-face-generator",
    "css-font-stack-builder",
  ],
  "system-font-stack-generator": [
    "css-font-stack-builder",
    "font-loading-strategy-builder",
    "font-rendering-preview",
    "css-variable-font-builder",
  ],
  "font-loading-strategy-builder": [
    "font-face-generator",
    "css-variable-font-builder",
    "system-font-stack-generator",
    "google-fonts-css-generator",
  ],
  "css-fluid-typography-builder": [
    "fluid-type-scale-builder",
    "css-clamp-calculator",
    "type-scale-generator",
    "heading-scale-visualizer",
  ],
  "css-clamp-calculator": [
    "css-fluid-typography-builder",
    "fluid-type-scale-builder",
    "heading-scale-visualizer",
    "css-typography-token-generator",
  ],
  "text-shadow-builder": [
    "shadow-text-generator",
    "text-gradient-maker",
    "outlined-text-generator",
    "3d-text-effect-preview",
  ],
  "text-gradient-maker": [
    "outlined-text-generator",
    "text-shadow-builder",
    "neon-text-previewer",
    "3d-text-effect-preview",
  ],
  "css-letter-spacing-tool": [
    "letter-spacing-calculator",
    "font-letter-spacing-tester",
    "css-typography-token-generator",
    "type-scale-generator",
  ],
  "css-line-height-tool": [
    "line-height-optimizer",
    "baseline-grid-calculator",
    "css-typography-token-generator",
    "type-scale-generator",
  ],

  // ── Glyph & Character Tools (batches 19-20) ──────────────────────
  "glyph-browser": [
    "unicode-character-explorer",
    "glyph-comparison-tool",
    "opentype-feature-explorer",
    "font-glyph-png-exporter",
  ],
  "unicode-character-explorer": [
    "unicode-block-explorer",
    "character-code-converter",
    "emoji-unicode-mapper",
    "missing-glyph-detector",
  ],
  "special-character-picker": [
    "character-code-converter",
    "unicode-character-explorer",
    "font-character-extractor",
    "dingbat-and-symbol-explorer",
  ],
  "dingbat-and-symbol-explorer": [
    "unicode-block-explorer",
    "unicode-character-explorer",
    "emoji-unicode-mapper",
    "special-character-picker",
  ],
  "kerning-pair-inspector": [
    "opentype-feature-explorer",
    "letter-spacing-calculator",
    "glyph-comparison-tool",
    "font-previewer",
  ],
  "opentype-feature-explorer": [
    "kerning-pair-inspector",
    "glyph-browser",
    "font-specimen-sheet",
    "variable-font-sliders",
  ],
  "glyph-comparison-tool": [
    "glyph-browser",
    "multi-font-comparison",
    "font-glyph-png-exporter",
    "font-specimen-sheet",
  ],
  "missing-glyph-detector": [
    "glyph-browser",
    "unicode-block-explorer",
    "unicode-character-explorer",
    "character-code-converter",
  ],
  "character-code-converter": [
    "unicode-character-explorer",
    "emoji-unicode-mapper",
    "special-character-picker",
    "font-base64-encoder",
  ],
  "unicode-block-explorer": [
    "unicode-character-explorer",
    "emoji-unicode-mapper",
    "missing-glyph-detector",
    "dingbat-and-symbol-explorer",
  ],
  "emoji-unicode-mapper": [
    "unicode-block-explorer",
    "unicode-character-explorer",
    "character-code-converter",
    "special-character-picker",
  ],
};

const MAX_RELATED = 4;

const STOP_WORDS = new Set([
  "and", "the", "for", "with", "your", "you", "its", "from", "any", "own",
  "into", "out", "get", "see", "use", "test", "tests", "tool", "tools",
]);

const tokens = (text: string): Set<string> =>
  new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );

interface Candidate {
  slug: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  status: "live" | "soon";
  category: string;
  words: Set<string>;
}

const ALL_TOOLS: Candidate[] = categories.flatMap((cat) =>
  cat.tools.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    desc: tool.desc,
    icon: tool.icon,
    status: tool.status,
    category: cat.name,
    words: tokens(`${tool.name} ${tool.desc}`),
  })),
);

function overlap(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const word of a) if (b.has(word)) shared++;
  return shared;
}

/** Same-category live tools, best keyword match first, registry order on ties. */
function rankedSameCategory(
  current: Candidate | undefined,
  category: string,
  taken: Set<string>,
): Candidate[] {
  const candidates = ALL_TOOLS.filter(
    (tool) =>
      tool.category === category &&
      isLiveTool(tool, "typography") &&
      !taken.has(tool.slug),
  );
  if (!current) return candidates;
  return candidates
    .map((tool, index) => ({ tool, index, score: overlap(current.words, tool.words) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.tool);
}

interface RelatedToolsProps {
  currentSlug: string;
  category: string;
}

/**
 * "You Might Also Need" row — four related tools, placed under the tool UI and
 * above the SEO block. Every pick is live, never the current tool, and the card
 * markup mirrors the category grid's.
 */
export function RelatedTools({ currentSlug, category }: RelatedToolsProps) {
  const current = ALL_TOOLS.find((tool) => tool.slug === currentSlug);

  const curated = (CURATED_RELATED[currentSlug] ?? [])
    .map((slug) => ALL_TOOLS.find((tool) => tool.slug === slug))
    .filter(
      (tool): tool is Candidate =>
        tool !== undefined && tool.slug !== currentSlug && isLiveTool(tool, "typography"),
    );

  const pool =
    curated.length >= MAX_RELATED
      ? curated
      : [
          ...curated,
          ...rankedSameCategory(current, category, new Set([currentSlug, ...curated.map((c) => c.slug)])),
        ];

  const related = pool.slice(0, MAX_RELATED);
  if (related.length === 0) return null;

  return (
    <section className="mt-10" data-related-tools="typography">
      <h2 className="text-lg font-bold text-foreground mb-4">You Might Also Need</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((tool) => {
          const Icon = tool.icon || inferIcon(tool.name, tool.slug);
          return (
            <Link
              key={tool.slug}
              href={`/typography/${tool.slug}`}
              className="tool-card group hover:-translate-y-[3px]"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
