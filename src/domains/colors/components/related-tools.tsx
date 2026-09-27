import { TOOLS_BY_SLUG } from "@/domains/colors/registry";
import type { ToolCategory, ToolDef } from "@/domains/colors/registry/types";
import { ToolCard } from "./tool-card";

/**
 * Curated related picks for pages where a specific cross-category set is the
 * useful one. Any tool without an entry here falls back to other live tools in
 * the same category, so every tool page gets a relevant row.
 */
const CURATED_RELATED: Record<string, string[]> = {
  "10-color-palette-generator": [
    "contrast-checker",
    "palette-sorter",
    "triadic-palette-generator",
    "single-color-to-full-palette",
  ],
  "complementary-palette-generator": [
    "split-complementary-palette-generator",
    "color-complement-finder",
    "contrast-checker",
    "palette-sorter",
  ],
  "analogous-palette-generator": [
    "monochromatic-palette-generator",
    "triadic-palette-generator",
    "color-analogous-finder",
    "palette-sorter",
  ],
  "triadic-palette-generator": [
    "tetradic-palette-generator",
    "color-triadic-finder",
    "complementary-palette-generator",
    "contrast-checker",
  ],
  "tetradic-palette-generator": [
    "triadic-palette-generator",
    "square-harmony-palette",
    "complementary-palette-generator",
    "palette-sorter",
  ],
  "split-complementary-palette-generator": [
    "complementary-palette-generator",
    "color-complement-finder",
    "triadic-palette-generator",
    "contrast-checker",
  ],
  "monochromatic-palette-generator": [
    "color-shades-generator",    "color-tints-generator",
    "analogous-palette-generator",
    "contrast-checker",
  ],
  // Contrast and WCAG threshold checkers.
  "contrast-checker": [
    "contrast-ratio-calculator",
    "wcag-21-aa-checker",
    "large-text-contrast-checker",
    "text-readability-checker",
  ],
  "contrast-ratio-calculator": [
    "contrast-checker",
    "wcag-21-aaa-checker",
    "palette-accessibility-checker",
    "focus-indicator-contrast-checker",
  ],
  "wcag-21-aa-checker": [
    "wcag-21-aaa-checker",
    "large-text-contrast-checker",
    "contrast-checker",
    "ui-component-contrast-checker",
  ],
  "wcag-21-aaa-checker": [
    "wcag-21-aa-checker",
    "wcag-30-apca-checker",
    "contrast-ratio-calculator",
    "text-readability-checker",
  ],
  "wcag-30-apca-checker": [
    "wcag-21-aa-checker",
    "wcag-21-aaa-checker",
    "contrast-checker",
    "contrast-ratio-calculator",
  ],
  "large-text-contrast-checker": [
    "wcag-21-aa-checker",
    "contrast-checker",
    "text-readability-checker",
    "ui-component-contrast-checker",
  ],
  // Non-text boundaries, pair finding and palette auditing.
  "ui-component-contrast-checker": [
    "focus-indicator-contrast-checker",
    "large-text-contrast-checker",
    "wcag-21-aa-checker",
    "palette-accessibility-checker",
  ],
  "focus-indicator-contrast-checker": [
    "ui-component-contrast-checker",
    "wcag-21-aa-checker",
    "color-blindness-simulator",
    "palette-accessibility-checker",
  ],
  "text-readability-checker": [
    "contrast-checker",
    "accessible-color-pair-finder",
    "large-text-contrast-checker",
    "color-blind-friendly-color-picker",
  ],
  "accessible-color-pair-finder": [
    "minimum-contrast-auto-fixer",
    "color-blind-friendly-color-picker",
    "contrast-checker",
    "palette-accessibility-checker",
  ],
  "minimum-contrast-auto-fixer": [
    "accessible-color-pair-finder",
    "palette-accessibility-checker",
    "contrast-checker",
    "text-readability-checker",
  ],
  "palette-accessibility-checker": [
    "accessible-color-pair-finder",
    "color-blind-friendly-color-picker",
    "contrast-ratio-calculator",
    "ui-component-contrast-checker",
  ],
  // Color vision simulation and screening.
  "color-blindness-simulator": [
    "deuteranopia-simulator",
    "protanopia-simulator",
    "tritanopia-simulator",
    "achromatopsia-simulator",
  ],
  "color-blindness-test": [
    "color-blindness-simulator",
    "deuteranomaly-simulator",
    "protanomaly-simulator",
    "color-blind-friendly-color-picker",
  ],
  "deuteranopia-simulator": [
    "deuteranomaly-simulator",
    "protanopia-simulator",
    "color-blindness-simulator",
    "color-blind-friendly-color-picker",
  ],
  "protanopia-simulator": [
    "protanomaly-simulator",
    "deuteranopia-simulator",
    "color-blindness-simulator",
    "color-blind-friendly-color-picker",
  ],
  "tritanopia-simulator": [
    "color-blindness-simulator",
    "achromatopsia-simulator",
    "deuteranopia-simulator",
    "palette-accessibility-checker",
  ],
  "achromatopsia-simulator": [
    "color-blindness-simulator",
    "tritanopia-simulator",
    "palette-accessibility-checker",
    "contrast-checker",
  ],
  "deuteranomaly-simulator": [
    "deuteranopia-simulator",
    "protanomaly-simulator",
    "color-blindness-simulator",
    "color-blind-friendly-color-picker",
  ],
  "protanomaly-simulator": [
    "protanopia-simulator",
    "deuteranomaly-simulator",
    "color-blindness-simulator",
    "color-blind-friendly-color-picker",
  ],
  "color-blind-friendly-color-picker": [
    "accessible-color-pair-finder",
    "color-blindness-simulator",
    "palette-accessibility-checker",
    "contrast-checker",
  ],
  // Format and notation converters (batch 3).
  "color-format-converter": [
    "color-format-validator",
    "css-color-formatter",
    "css-hex-color-generator",
    "alpha-color-generator",
  ],
  "css-color-formatter": [
    "css-hex-color-generator",
    "css-rgb-color-generator",
    "css-hsl-color-generator",
    "color-format-converter",
  ],
  "css-hex-color-generator": [
    "css-rgb-color-generator",
    "css-hsl-color-generator",
    "color-format-converter",
    "css-color-variables-generator",
  ],
  "css-rgb-color-generator": [
    "css-hex-color-generator",
    "css-hsl-color-generator",
    "alpha-color-generator",
    "color-format-converter",
  ],
  "css-hsl-color-generator": [
    "css-rgb-color-generator",
    "css-hex-color-generator",
    "hsl-channel-adjuster",
    "color-format-converter",
  ],
  "color-format-validator": [
    "color-format-converter",
    "css-named-colors-reference",
    "contrast-checker",
    "css-color-formatter",
  ],
  "alpha-color-generator": [
    "opacity-calculator",
    "color-overlay-generator",
    "css-color-formatter",
    "color-preview-on-background",
  ],
  // Colour naming and references (batch 4).
  "color-name-lookup": [
    "nearest-named-color-finder",
    "css-named-colors-reference",
    "color-format-validator",
    "color-distance-calculator",
  ],
  "nearest-named-color-finder": [
    "color-name-lookup",
    "css-named-colors-reference",
    "color-distance-calculator",
    "color-format-validator",
  ],
  "css-named-colors-reference": [
    "color-name-lookup",
    "nearest-named-color-finder",
    "color-format-validator",
    "contrast-checker",
  ],
  "pantone-approximation-tool": [
    "pantone-to-hex-reference",
    "ral-to-hex-reference",
    "color-name-lookup",
    "color-distance-calculator",
  ],
  "pantone-to-hex-reference": [
    "pantone-approximation-tool",
    "ral-to-hex-reference",
    "palette-importer",
    "color-format-validator",
  ],
  "ral-to-hex-reference": [
    "pantone-to-hex-reference",
    "pantone-approximation-tool",
    "palette-importer",
    "color-format-validator",
  ],
  // Palette generators, rollers and brief-count pages (batch 5).
  "square-harmony-palette": [
    "rectangle-harmony-palette",
    "tetradic-palette-generator",
    "triadic-palette-generator",
    "palette-sorter",
  ],
  "rectangle-harmony-palette": [
    "square-harmony-palette",
    "tetradic-palette-generator",
    "hue-rotator",
    "palette-sorter",
  ],
  "random-palette-generator": [
    "daily-color-palette-generator",
    "palette-locker",
    "pastel-palette-generator",
    "palette-sorter",
  ],
  "palette-locker": [
    "palette-sorter",
    "palette-comparison",
    "random-palette-generator",
    "palette-importer",
  ],
  "single-color-to-full-palette": [
    "analogous-palette-generator",    "color-tints-generator",
    "color-shades-generator",
    "palette-sorter",
  ],
  "5-color-palette-generator": [
    "8-color-palette-generator",
    "10-color-palette-generator",
    "monochromatic-palette-generator",
    "color-shades-generator",
  ],
  "8-color-palette-generator": [
    "5-color-palette-generator",
    "10-color-palette-generator",    "color-tints-generator",
    "palette-balance-analyzer",
  ],
  "daily-color-palette-generator": [
    "random-palette-generator",
    "palette-importer",
    "seasonal-palette-generator",
    "palette-locker",
  ],
  "accessible-palette-generator": [
    "contrast-checker",
    "wcag-21-aaa-checker",
    "accessible-color-pair-finder",
    "palette-accessibility-checker",
  ],
  // Register and theme palettes (batch 6).
  "pastel-palette-generator": [
    "neon-palette-generator",
    "color-tints-generator",
    "accessible-palette-generator",
    "palette-locker",
  ],
  "neon-palette-generator": [
    "pastel-palette-generator",
    "dark-mode-palette-generator",
    "contrast-checker",
    "palette-locker",
  ],
  "earth-tone-palette-generator": [
    "forest-nature-palette-generator",
    "ocean-beach-palette-generator",
    "vintage-retro-palette-generator",
    "sunset-palette-generator",
  ],
  "ocean-beach-palette-generator": [
    "sunset-palette-generator",
    "earth-tone-palette-generator",
    "forest-nature-palette-generator",
    "color-shades-generator",
  ],
  "forest-nature-palette-generator": [
    "earth-tone-palette-generator",
    "dark-mode-palette-generator",
    "light-mode-palette-generator",
    "color-shades-generator",
  ],
  "sunset-palette-generator": [
    "gradient-interpolator",
    "ocean-beach-palette-generator",
    "earth-tone-palette-generator",
    "gradient-palette-mixer",
  ],
  "vintage-retro-palette-generator": [
    "wes-anderson-style-palette",
    "earth-tone-palette-generator",
    "sunset-palette-generator",
    "pastel-palette-generator",
  ],
  "wes-anderson-style-palette": [
    "vintage-retro-palette-generator",
    "sunset-palette-generator",
    "pastel-palette-generator",
    "palette-locker",
  ],
  "dark-mode-palette-generator": [
    "light-mode-palette-generator",
    "neon-palette-generator",
    "contrast-checker",
    "color-shades-generator",
  ],
  "light-mode-palette-generator": [
    "dark-mode-palette-generator",
    "css-color-variables-generator",
    "contrast-checker",
    "pastel-palette-generator",
  ],
  "corporate-palette-generator": [
    "palette-accessibility-checker",
    "color-shades-generator",
    "contrast-checker",
    "dark-mode-palette-generator",
  ],
  "seasonal-palette-generator": [
    "color-tints-generator",
    "color-shades-generator",
    "earth-tone-palette-generator",
    "forest-nature-palette-generator",
  ],
  // System, brand and palette utilities (batch 7).
  "material-palette-generator": [
    "tailwind-palette-generator",
    "color-shades-generator",
    "palette-sorter",
    "css-color-variables-generator",
  ],
  "tailwind-palette-generator": [
    "material-palette-generator",
    "color-shades-generator",
    "css-color-variables-generator",
    "palette-accessibility-checker",
  ],
  "brand-palette-generator": [
    "palette-comparison",
    "color-shades-generator",
    "palette-accessibility-checker",
    "color-tints-generator",
  ],
  "palette-importer": [
    "palette-sorter",
    "palette-comparison",
    "palette-locker",
    "css-color-variables-generator",
  ],
  "palette-sorter": [
    "palette-comparison",
    "palette-balance-analyzer",
    "palette-importer",
    "palette-locker",
  ],
  "palette-comparison": [
    "palette-balance-analyzer",
    "palette-sorter",
    "color-distance-calculator",
    "palette-accessibility-checker",
  ],
};

/** The row is a 4-column grid, matching the rest of the platform. */
const MAX_RELATED = 4;

interface RelatedToolsProps {
  /** Slug of the tool currently open — never suggested back to itself. */
  currentSlug: string;
  /** Category fallback when no curated list exists for `currentSlug`. */
  category: ToolCategory;
}

/**
 * Fallback ranking.
 *
 * The category fallback used to hand back the first four same-category tools in
 * raw registry order, which rewards whatever was authored first rather than what
 * is actually close to the open tool. Two cheap signals overlap far better with
 * "does the same job":
 *
 *   - a shared component reference — the same engine behind two pages, which is
 *     exactly how the CSS generators and the CSS formatter relate;
 *   - word overlap over the authored SEO keywords plus the name and description,
 *     so pages that talk about the same thing (the temperature analyzer and the
 *     warm/cool classifier both say warm and cool) rank together.
 *
 * Scores are computed per render from data already loaded by the registry, and
 * ties keep registry order, so the row is deterministic.
 */
const tokens = (text: string): Set<string> => {
  const out = new Set<string>();
  for (const word of text.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
    if (word.length > 2) out.add(word);
  }
  return out;
};

const overlap = (a: Set<string>, b: Set<string>): number => {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared++;
  return shared / (a.size + b.size - shared);
};

interface FallbackProfile {
  words: Set<string>;
  component?: ToolDef["component"];
}

const profileCache = new Map<string, FallbackProfile>();

function profile(tool: ToolDef): FallbackProfile {
  const cached = profileCache.get(tool.slug);
  if (cached) return cached;
  const computed: FallbackProfile = {
    component: tool.component,
    words: tokens([tool.name, tool.description, ...(tool.seo?.keywords ?? [])].join(" ")),
  };
  profileCache.set(tool.slug, computed);
  return computed;
}

/** A shared engine counts as much as a perfect keyword overlap; both are additive. */
function functionalScore(current: ToolDef, candidate: ToolDef): number {
  const a = profile(current);
  const b = profile(candidate);
  const sameEngine = a.component && b.component && a.component === b.component ? 1 : 0;
  return sameEngine * 2 + overlap(a.words, b.words);
}

/** Same-category live tools, best functional match first, registry order on ties. */
function rankedSameCategory(current: ToolDef | undefined, category: ToolCategory, taken: Set<string>): ToolDef[] {
  const candidates = Object.values(TOOLS_BY_SLUG).filter(
    (tool) => tool.category === category && tool.status === "live" && !taken.has(tool.slug),
  );
  if (!current) return candidates;
  return candidates
    .map((tool, index) => ({ tool, index, score: functionalScore(current, tool) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.tool);
}

/**
 * "You Might Also Need" row — four related tools, placed under the tool UI and
 * above the SEO block.
 *
 * Reuses the domain's own `ToolCard` (the same card the category grids render)
 * so the styling matches the rest of the platform. This is a separate,
 * full-width element — it is not part of the unboxed SEO section.
 */
export function RelatedTools({ currentSlug, category }: RelatedToolsProps) {
  const curated = (CURATED_RELATED[currentSlug] ?? [])
    .map((slug) => TOOLS_BY_SLUG[slug])
    .filter((tool) => tool !== undefined && tool.slug !== currentSlug && tool.status === "live");

  const pool =
    curated.length >= MAX_RELATED
      ? curated
      : [
          ...curated,
          ...rankedSameCategory(
            TOOLS_BY_SLUG[currentSlug],
            category,
            new Set([currentSlug, ...curated.map((c) => c.slug)]),
          ),
        ];

  const related = pool.slice(0, MAX_RELATED);
  if (related.length === 0) return null;

  return (
    <section className="mt-10" data-related-tools="colors">
      <h2 className="text-lg font-bold text-foreground mb-4">You Might Also Need</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
