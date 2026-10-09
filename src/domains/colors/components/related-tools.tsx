import { TOOLS_BY_SLUG } from "@/domains/colors/registry";
import type { ToolCategory, ToolDef } from "@/domains/colors/registry/types";
import { ToolCard } from "./tool-card";

/**
 * Curated related picks for pages where a specific cross-category set is the
 * useful one. Any tool without an entry here falls back to other live tools in
 * the same category, so every tool page gets a relevant row.
 */
const CURATED_RELATED: Record<string, string[]> = {

  // ── Accessibility — full-coverage curation pass ──
  "contrast-checker": [
    "contrast-ratio-calculator",
    "wcag-21-aa-checker",
    "large-text-contrast-checker",
    "text-readability-checker",
  ],
  "wcag-21-aa-checker": [
    "wcag-21-aaa-checker",
    "large-text-contrast-checker",
    "contrast-checker",
    "wcag-30-apca-checker",
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
  "accessible-color-pair-finder": [
    "minimum-contrast-auto-fixer",
    "color-blind-friendly-color-picker",
    "contrast-checker",
    "palette-accessibility-checker",
  ],
  "contrast-ratio-calculator": [
    "contrast-checker",
    "wcag-21-aaa-checker",
    "gradient-angle-calculator",
    "focus-indicator-contrast-checker",
  ],
  "minimum-contrast-auto-fixer": [
    "accessible-color-pair-finder",
    "palette-accessibility-checker",
    "contrast-checker",
    "text-readability-checker",
  ],
  "color-blindness-simulator": [
    "deuteranopia-simulator",
    "protanopia-simulator",
    "tritanopia-simulator",
    "achromatopsia-simulator",
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
  "deuteranomaly-simulator": [
    "deuteranopia-simulator",
    "protanomaly-simulator",
    "color-blindness-simulator",
    "color-blindness-test-ishihara",
  ],
  "protanomaly-simulator": [
    "protanopia-simulator",
    "deuteranomaly-simulator",
    "color-blindness-simulator",
    "color-blind-friendly-color-picker",
  ],
  "achromatopsia-simulator": [
    "color-blindness-simulator",
    "tritanopia-simulator",
    "palette-accessibility-checker",
    "contrast-checker",
  ],
  "color-blind-friendly-color-picker": [
    "accessible-color-pair-finder",
    "minimum-contrast-auto-fixer",
    "palette-accessibility-checker",
    "contrast-checker",
  ],
  "color-blindness-test": [
    "color-blindness-simulator",
    "deuteranomaly-simulator",
    "color-blindness-test-ishihara",
    "gradient-previewer",
  ],
  "text-readability-checker": [
    "contrast-checker",
    "accessible-color-pair-finder",
    "large-text-contrast-checker",
    "color-gamut-visualizer",
  ],
  "palette-accessibility-checker": [
    "accessible-color-pair-finder",
    "color-blind-friendly-color-picker",
    "color-blindness-test",
    "ui-component-contrast-checker",
  ],

  // ── Analysis — full-coverage curation pass ──
  "color-name-lookup": [
    "nearest-named-color-finder",
    "css-named-colors-reference",
    "color-format-validator",
    "color-distance-calculator",
  ],
  "nearest-named-color-finder": [
    "color-name-lookup",
    "css-named-colors-reference",
    "color-name-generator",
    "color-format-validator",
  ],
  "color-mood-analyzer": [
    "color-psychology-reference",
    "color-symbolism-reference",
    "color-rendering-index-reference",
    "color-hierarchy-analyzer",
  ],
  "color-psychology-reference": [
    "color-mood-analyzer",
    "color-symbolism-reference",
    "color-rendering-index-reference",
    "munsell-color-system-reference",
  ],
  "seasonal-color-finder": [
    "seasonal-palette-generator",
    "color-analogous-finder",
    "dominant-color-finder",
    "color-complement-finder",
  ],
  "skin-tone-color-finder": [
    "color-matching-game",
    "warm-color-generator",
    "chakra-ui-color-reference",
    "radix-color-reference",
  ],
  "relative-luminance-calculator": [
    "perceptual-lightness-calculator",
    "contrast-ratio-calculator",
    "color-distance-calculator",
    "css-rgb-color-generator",
  ],
  "perceptual-lightness-calculator": [
    "relative-luminance-calculator",
    "color-distance-calculator",
    "oklch-color-playground",
    "just-noticeable-difference-calculator",
  ],
  "color-distance-calculator": [
    "just-noticeable-difference-calculator",
    "color-comparison-tool",
    "perceptual-lightness-calculator",
    "additive-color-mixer",
  ],
  "color-gamut-checker": [
    "color-gamut-visualizer",
    "print-color-accuracy-checker",
    "palette-accessibility-checker",
    "text-readability-checker",
  ],
  "color-temperature-analyzer": [
    "warm-cool-analyzer",
    "warm-to-cool-color-shifter",
    "color-temperature-adjuster",
    "pixel-color-picker",
  ],
  "color-hierarchy-analyzer": [
    "color-mood-analyzer",
    "palette-balance-analyzer",
    "color-trend-analyzer",
    "primary-secondary-tertiary-colors",
  ],
  "color-swatch-generator": [
    "color-swatch-png-generator",
    "pastel-color-generator",
    "neon-color-generator",
    "random-color-generator",
  ],
  "color-wheel-interactive": [
    "rgb-cube-visualizer",
    "hue-circle-interactive",
    "screen-color-picker",
    "color-picker",
  ],
  "brand-color-extractor": [
    "color-palette-extractor",
    "dominant-color-finder",
    "flag-color-extractor",
    "gradient-from-image",
  ],
  "print-color-accuracy-checker": [
    "color-gamut-checker",
    "simultaneous-contrast-visualizer",
    "palette-accessibility-checker",
    "color-comparison-tool",
  ],
  "color-theory-reference-tool": [
    "color-wheel-theory-guide",
    "hue-circle-interactive",
    "primary-secondary-tertiary-colors",
    "color-analogous-finder",
  ],
  "pantone-approximation-tool": [
    "pantone-to-hex-reference",
    "ral-to-hex-reference",
    "color-name-lookup",
    "color-blending-art-tool",
  ],
  "color-naming-challenge": [
    "bootstrap-color-reference",
    "color-name-lookup",
    "random-accessible-color-generator",
    "nearest-named-color-finder",
  ],
  "color-memory-test": [
    "color-memory-game",
    "color-naming-challenge",
    "color-matching-game",
    "color-analogous-finder",
  ],
  "css-named-colors-reference": [
    "color-name-lookup",
    "nearest-named-color-finder",
    "web-safe-color-palette",
    "gradient-collection-browser",
  ],
  "color-format-validator": [
    "color-format-converter",
    "css-named-colors-reference",
    "css-gradient-to-image-exporter",
    "css-color-formatter",
  ],
  "color-histogram": [
    "color-json-generator",
    "color-name-generator",
    "birth-month-color-generator",
    "duotone-generator",
  ],
  "dominant-color-finder": [
    "color-complement-finder",
    "brand-color-extractor",
    "color-analogous-finder",
    "seasonal-color-finder",
  ],
  "palette-balance-analyzer": [
    "visual-weight-analyzer",
    "palette-comparison",
    "oklch-color-playground",
    "color-hierarchy-analyzer",
  ],
  "visual-weight-analyzer": [
    "palette-balance-analyzer",
    "palette-sorter",
    "palette-comparison",
    "random-color-generator",
  ],
  "warm-cool-analyzer": [
    "color-temperature-analyzer",
    "color-temperature-adjuster",
    "warm-to-cool-color-shifter",
    "warm-color-generator",
  ],

  // ── Css — full-coverage curation pass ──
  "css-hsl-color-generator": [
    "css-rgb-color-generator",
    "css-hex-color-generator",
    "hsl-channel-adjuster",
    "color-format-converter",
  ],
  "css-rgb-color-generator": [
    "css-hex-color-generator",
    "css-hsl-color-generator",
    "alpha-color-generator",
    "relative-luminance-calculator",
  ],
  "css-hex-color-generator": [
    "css-rgb-color-generator",
    "css-hsl-color-generator",
    "canvas-gradient-generator",
    "css-color-variables-generator",
  ],
  "css-color-formatter": [
    "css-hex-color-generator",
    "css-rgb-color-generator",
    "css-hsl-color-generator",
    "color-format-converter",
  ],
  "css-background-color-preview": [
    "css-text-color-preview",
    "color-preview-on-background",
    "color-format-validator",
    "css-color-formatter",
  ],
  "css-text-color-preview": [
    "css-background-color-preview",
    "text-readability-checker",
    "color-preview-on-background",
    "text-gradient-generator",
  ],
  "css-color-variables-generator": [
    "less-variable-generator",
    "css-custom-properties-exporter",
    "scss-variable-generator",
    "color-palette-css-exporter",
  ],
  "css-custom-properties-exporter": [
    "color-palette-css-exporter",
    "shadcn-ui-color-exporter",
    "bootstrap-color-exporter",
    "css-color-variables-generator",
  ],
  "scss-variable-generator": [
    "less-variable-generator",
    "color-array-generator",
    "random-color-generator",
    "ios-swift-color-generator",
  ],
  "less-variable-generator": [
    "scss-variable-generator",
    "color-array-generator",
    "random-color-generator",
    "ios-swift-color-generator",
  ],
  "css-in-js-color-object-generator": [
    "color-object-generator",
    "color-json-generator",
    "color-array-generator",
    "random-color-generator",
  ],
  "design-token-generator": [
    "style-dictionary-format-generator",
    "figma-token-generator",
    "color-token-generator",
    "color-palette-json-exporter",
  ],
  "figma-token-generator": [
    "design-token-generator",
    "color-token-generator",
    "shadcn-ui-color-exporter",
    "style-dictionary-format-generator",
  ],
  "style-dictionary-format-generator": [
    "design-token-generator",
    "figma-token-generator",
    "color-token-generator",
    "material-ui-color-exporter",
  ],
  "tailwind-css-color-exporter": [
    "color-palette-css-exporter",
    "color-object-generator",
    "color-array-generator",
    "tailwind-palette-generator",
  ],
  "material-ui-color-exporter": [
    "chakra-ui-color-exporter",
    "color-csv-exporter",
    "bootstrap-color-exporter",
    "color-array-generator",
  ],
  "chakra-ui-color-exporter": [
    "material-ui-color-exporter",
    "shadcn-ui-color-exporter",
    "tailwind-css-color-exporter",
    "color-csv-exporter",
  ],
  "shadcn-ui-color-exporter": [
    "color-palette-css-exporter",
    "bootstrap-color-exporter",
    "css-custom-properties-exporter",
    "chakra-ui-color-exporter",
  ],
  "bootstrap-color-exporter": [
    "color-palette-css-exporter",
    "shadcn-ui-color-exporter",
    "css-custom-properties-exporter",
    "material-ui-color-exporter",
  ],
  "android-xml-color-generator": [
    "random-color-generator",
    "color-array-generator",
    "warm-color-generator",
    "muted-color-generator",
  ],
  "ios-swift-color-generator": [
    "flutter-color-generator",
    "less-variable-generator",
    "scss-variable-generator",
    "random-color-generator",
  ],
  "flutter-color-generator": [
    "ios-swift-color-generator",
    "random-color-generator",
    "color-array-generator",
    "less-variable-generator",
  ],
  "css-border-color-generator": [
    "box-shadow-color-tool",
    "text-shadow-color-tool",
    "css-color-variables-generator",
    "color-overlay-generator",
  ],

  // ── Data — full-coverage curation pass ──
  "color-json-generator": [
    "color-object-generator",
    "color-array-generator",
    "color-token-generator",
    "css-in-js-color-object-generator",
  ],
  "color-token-generator": [
    "color-json-generator",
    "design-token-generator",
    "figma-token-generator",
    "style-dictionary-format-generator",
  ],
  "color-format-converter": [
    "color-format-validator",
    "css-color-formatter",
    "css-hex-color-generator",
    "gradient-angle-calculator",
  ],
  "color-csv-exporter": [
    "color-palette-json-exporter",
    "material-ui-color-exporter",
    "bootstrap-color-exporter",
    "chakra-ui-color-exporter",
  ],
  "color-array-generator": [
    "color-object-generator",
    "color-json-generator",
    "less-variable-generator",
    "scss-variable-generator",
  ],
  "color-object-generator": [
    "color-array-generator",
    "color-json-generator",
    "css-in-js-color-object-generator",
    "tailwind-css-color-exporter",
  ],
  "color-palette-json-exporter": [
    "color-csv-exporter",
    "color-palette-css-exporter",
    "color-palette-svg-exporter",
    "material-ui-color-exporter",
  ],
  "color-palette-css-exporter": [
    "css-custom-properties-exporter",
    "shadcn-ui-color-exporter",
    "bootstrap-color-exporter",
    "tailwind-css-color-exporter",
  ],
  "color-palette-svg-exporter": [
    "color-palette-json-exporter",
    "color-palette-css-exporter",
    "color-csv-exporter",
    "bootstrap-color-exporter",
  ],
  "color-palette-png-generator": [
    "color-swatch-png-generator",
    "color-palette-svg-exporter",
    "color-palette-css-exporter",
    "material-palette-generator",
  ],

  // ── Designsys — full-coverage curation pass ──
  "tailwind-color-reference": [
    "material-design-color-reference",
    "ant-design-color-reference",
    "chakra-ui-color-reference",
    "fluent-ui-color-reference",
  ],
  "material-design-color-reference": [
    "ant-design-color-reference",
    "tailwind-color-reference",
    "fluent-ui-color-reference",
    "chakra-ui-color-reference",
  ],
  "bootstrap-color-reference": [
    "fluent-ui-color-reference",
    "ant-design-color-reference",
    "tailwind-color-reference",
    "material-design-color-reference",
  ],
  "ant-design-color-reference": [
    "material-design-color-reference",
    "fluent-ui-color-reference",
    "chakra-ui-color-reference",
    "tailwind-color-reference",
  ],
  "fluent-ui-color-reference": [
    "ant-design-color-reference",
    "material-design-color-reference",
    "ibm-carbon-color-reference",
    "bootstrap-color-reference",
  ],
  "chakra-ui-color-reference": [
    "radix-color-reference",
    "ant-design-color-reference",
    "tailwind-color-reference",
    "material-design-color-reference",
  ],
  "radix-color-reference": [
    "chakra-ui-color-reference",
    "ant-design-color-reference",
    "tailwind-color-reference",
    "material-design-color-reference",
  ],
  "open-color-reference": [
    "tailwind-color-reference",
    "material-design-color-reference",
    "chakra-ui-color-reference",
    "hair-color-reference",
  ],
  "ibm-carbon-color-reference": [
    "fluent-ui-color-reference",
    "github-primer-color-reference",
    "ant-design-color-reference",
    "atlassian-design-color-reference",
  ],
  "adobe-spectrum-color-reference": [
    "github-primer-color-reference",
    "atlassian-design-color-reference",
    "ibm-carbon-color-reference",
    "fluent-ui-color-reference",
  ],
  "github-primer-color-reference": [
    "atlassian-design-color-reference",
    "adobe-spectrum-color-reference",
    "ibm-carbon-color-reference",
    "fluent-ui-color-reference",
  ],
  "atlassian-design-color-reference": [
    "github-primer-color-reference",
    "adobe-spectrum-color-reference",
    "ibm-carbon-color-reference",
    "fluent-ui-color-reference",
  ],
  "web-safe-color-palette": [
    "chakra-ui-color-reference",
    "bootstrap-color-reference",
    "ibm-carbon-color-reference",
    "fluent-ui-color-reference",
  ],

  // ── Effects — full-coverage curation pass ──
  "glassmorphism-generator": [
    "frosted-glass-generator",
    "css-backdrop-filter-generator",
    "neumorphism-generator",
    "box-shadow-color-tool",
  ],
  "neumorphism-generator": [
    "box-shadow-color-tool",
    "text-shadow-color-tool",
    "shadow-color-generator",
    "glassmorphism-generator",
  ],
  "shadow-color-generator": [
    "box-shadow-color-tool",
    "color-array-generator",
    "less-variable-generator",
    "text-shadow-color-tool",
  ],
  "box-shadow-color-tool": [
    "text-shadow-color-tool",
    "neumorphism-generator",
    "css-border-color-generator",
    "shadow-color-generator",
  ],
  "text-shadow-color-tool": [
    "box-shadow-color-tool",
    "css-border-color-generator",
    "shadow-color-generator",
    "neumorphism-generator",
  ],
  "overlay-color-generator": [
    "color-overlay-generator",
    "gradient-overlay-generator",
    "css-in-js-color-object-generator",
    "css-filter-generator",
  ],
  "duotone-generator": [
    "color-histogram",
    "gradient-overlay-generator",
    "color-json-generator",
    "transparent-gradient-generator",
  ],
  "color-overlay-generator": [
    "overlay-color-generator",
    "css-border-color-generator",
    "image-theme-generator",
    "gradient-overlay-generator",
  ],
  "frosted-glass-generator": [
    "glassmorphism-generator",
    "css-backdrop-filter-generator",
    "neumorphism-generator",
    "box-shadow-color-tool",
  ],
  "gradient-overlay-generator": [
    "linear-gradient-generator",
    "overlay-color-generator",
    "transparent-gradient-generator",
    "conic-gradient-generator",
  ],
  "brand-style-guide-generator": [
    "ios-swift-color-generator",
    "random-color-generator",
    "color-from-text-mood-tool",
    "color-array-generator",
  ],
  "color-swatch-png-generator": [
    "color-swatch-generator",
    "color-palette-png-generator",
    "hair-color-reference",
    "eye-color-reference",
  ],
  "css-filter-generator": [
    "css-hex-color-generator",
    "overlay-color-generator",
    "css-in-js-color-object-generator",
    "color-json-generator",
  ],
  "css-backdrop-filter-generator": [
    "glassmorphism-generator",
    "frosted-glass-generator",
    "css-filter-generator",
    "radial-gradient-generator",
  ],

  // ── Fun — full-coverage curation pass ──
  "random-color-generator": [
    "daily-color-generator",
    "neon-color-generator",
    "pastel-color-generator",
    "random-accessible-color-generator",
  ],
  "random-accessible-color-generator": [
    "accessible-palette-generator",
    "random-color-generator",
    "color-array-generator",
    "warm-color-generator",
  ],
  "lucky-color-generator": [
    "daily-color-palette-generator",
    "random-palette-generator",
    "random-color-generator",
    "daily-color-generator",
  ],
  "daily-color-generator": [
    "random-color-generator",
    "daily-color-palette-generator",
    "lucky-color-generator",
    "random-palette-generator",
  ],
  "color-of-the-year-browser": [
    "color-trend-analyzer",
    "ant-design-color-reference",
    "tailwind-color-reference",
    "material-design-color-reference",
  ],
  "color-name-generator": [
    "color-json-generator",
    "color-token-generator",
    "css-hex-color-generator",
    "color-histogram",
  ],
  "flag-color-extractor": [
    "eye-color-reference",
    "hair-color-reference",
    "brand-color-library",
    "material-design-color-reference",
  ],
  "brand-color-library": [
    "material-design-color-reference",
    "chakra-ui-color-reference",
    "open-color-reference",
    "ant-design-color-reference",
  ],
  "hair-color-reference": [
    "eye-color-reference",
    "open-color-reference",
    "tailwind-color-reference",
    "material-design-color-reference",
  ],
  "eye-color-reference": [
    "hair-color-reference",
    "open-color-reference",
    "tailwind-color-reference",
    "material-design-color-reference",
  ],
  "cultural-color-palettes": [
    "flag-color-extractor",
    "10-color-palette-generator",
    "color-from-text-mood-tool",
    "color-array-generator",
  ],
  "rgb-cube-visualizer": [
    "color-wheel-interactive",
    "color-csv-exporter",
    "color-histogram",
    "color-distance-calculator",
  ],
  "hue-circle-interactive": [
    "color-wheel-theory-guide",
    "color-theory-reference-tool",
    "color-wheel-interactive",
    "screen-color-picker",
  ],
  "color-blending-art-tool": [
    "color-blend-tool",
    "text-shadow-color-tool",
    "color-mixer-2",
    "box-shadow-color-tool",
  ],
  "color-memory-game": [
    "color-matching-game",
    "color-memory-test",
    "color-naming-challenge",
    "color-of-the-year-browser",
  ],
  "pastel-color-generator": [
    "pastel-palette-generator",
    "neon-color-generator",
    "random-color-generator",
    "color-tints-generator",
  ],
  "neon-color-generator": [
    "neon-palette-generator",
    "pastel-color-generator",
    "random-color-generator",
    "color-swatch-generator",
  ],
  "muted-color-generator": [
    "color-tones-generator",
    "random-color-generator",
    "earth-tone-color-generator",
    "vintage-retro-palette-generator",
  ],
  "warm-color-generator": [
    "earth-tone-color-generator",
    "earth-tone-palette-generator",
    "cool-color-generator",
    "random-color-generator",
  ],
  "cool-color-generator": [
    "earth-tone-palette-generator",
    "warm-color-generator",
    "random-color-generator",
    "earth-tone-color-generator",
  ],
  "earth-tone-color-generator": [
    "earth-tone-palette-generator",
    "warm-color-generator",
    "muted-color-generator",
    "cool-color-generator",
  ],
  "color-matching-game": [
    "color-memory-game",
    "skin-tone-color-finder",
    "color-memory-test",
    "birth-month-color-generator",
  ],
  "zodiac-color-generator": [
    "birth-month-color-generator",
    "css-in-js-color-object-generator",
    "emotion-color-finder",
    "color-json-generator",
  ],
  "birth-month-color-generator": [
    "zodiac-color-generator",
    "css-in-js-color-object-generator",
    "color-json-generator",
    "random-color-generator",
  ],
  "emotion-color-finder": [
    "birth-month-color-generator",
    "dark-mode-palette-generator",
    "accessible-palette-generator",
    "css-in-js-color-object-generator",
  ],
  "lucky-number-color": [
    "color-json-generator",
    "color-from-text-mood-tool",
    "gradient-palette-mixer",
    "chakra-ui-color-exporter",
  ],

  // ── Gradients — full-coverage curation pass ──
  "linear-gradient-generator": [
    "conic-gradient-generator",
    "gradient-overlay-generator",
    "radial-gradient-generator",
    "hard-stop-gradient-generator",
  ],
  "radial-gradient-generator": [
    "css-gradient-animation-generator",
    "conic-gradient-generator",
    "linear-gradient-generator",
    "mesh-gradient-generator",
  ],
  "conic-gradient-generator": [
    "linear-gradient-generator",
    "radial-gradient-generator",
    "hard-stop-gradient-generator",
    "css-gradient-animation-generator",
  ],
  "hard-stop-gradient-generator": [
    "multi-stop-gradient-builder",
    "linear-gradient-generator",
    "conic-gradient-generator",
    "radial-gradient-generator",
  ],
  "multi-stop-gradient-builder": [
    "hard-stop-gradient-generator",
    "gradient-color-stop-editor",
    "conic-gradient-generator",
    "multi-color-picker",
  ],
  "gradient-angle-adjuster": [
    "gradient-reverser",
    "vibrance-adjuster",
    "exposure-adjuster",
    "gradient-overlay-generator",
  ],
  "gradient-color-stop-editor": [
    "multi-stop-gradient-builder",
    "conic-gradient-generator",
    "multi-color-picker",
    "transparent-gradient-generator",
  ],
  "css-gradient-animation-generator": [
    "mesh-gradient-generator",
    "text-gradient-generator",
    "radial-gradient-generator",
    "hard-stop-gradient-generator",
  ],
  "mesh-gradient-generator": [
    "css-gradient-animation-generator",
    "radial-gradient-generator",
    "text-gradient-generator",
    "conic-gradient-generator",
  ],
  "svg-gradient-generator": [
    "canvas-gradient-generator",
    "radial-gradient-generator",
    "css-gradient-animation-generator",
    "noise-grain-texture-generator",
  ],
  "canvas-gradient-generator": [
    "svg-gradient-generator",
    "css-in-js-color-object-generator",
    "radial-gradient-generator",
    "color-json-generator",
  ],
  "gradient-previewer": [
    "css-text-color-preview",
    "css-background-color-preview",
    "transparent-gradient-generator",
    "gradient-from-image",
  ],
  "noise-grain-texture-generator": [
    "transparent-gradient-generator",
    "gradient-overlay-generator",
    "text-gradient-generator",
    "css-gradient-animation-generator",
  ],
  "gradient-to-css-exporter": [
    "css-gradient-to-image-exporter",
    "css-custom-properties-exporter",
    "color-palette-css-exporter",
    "color-palette-svg-exporter",
  ],
  "gradient-palette-mixer": [
    "color-array-generator",
    "gradient-interpolator",
    "less-variable-generator",
    "color-mixer-3plus",
  ],
  "gradient-collection-browser": [
    "css-gradient-animation-generator",
    "gradient-to-css-exporter",
    "mesh-gradient-generator",
    "hard-stop-gradient-generator",
  ],
  "gradient-angle-calculator": [
    "gradient-angle-adjuster",
    "gradient-reverser",
    "gradient-previewer",
    "conic-gradient-generator",
  ],
  "css-gradient-to-image-exporter": [
    "gradient-to-css-exporter",
    "color-palette-css-exporter",
    "color-palette-png-generator",
    "text-gradient-generator",
  ],
  "gradient-from-image": [
    "color-palette-extractor",
    "transparent-gradient-generator",
    "image-theme-generator",
    "brand-color-extractor",
  ],
  "image-theme-generator": [
    "color-from-text-mood-tool",
    "color-array-generator",
    "less-variable-generator",
    "color-palette-extractor",
  ],
  "gradient-interpolator": [
    "gradient-palette-mixer",
    "color-mixer-2",
    "color-blend-tool",
    "color-distance-calculator",
  ],
  "text-gradient-generator": [
    "css-gradient-animation-generator",
    "mesh-gradient-generator",
    "css-text-color-preview",
    "transparent-gradient-generator",
  ],
  "transparent-gradient-generator": [
    "gradient-overlay-generator",
    "noise-grain-texture-generator",
    "gradient-from-image",
    "conic-gradient-generator",
  ],
  "gradient-reverser": [
    "gradient-angle-adjuster",
    "svg-gradient-generator",
    "bootstrap-color-reference",
    "color-naming-challenge",
  ],

  // ── Manipulation — full-coverage curation pass ──
  "color-shades-generator": [
    "color-tints-generator",
    "css-hex-color-generator",
    "pastel-color-generator",
    "random-color-generator",
  ],
  "color-tints-generator": [
    "pastel-color-generator",
    "random-color-generator",
    "color-shades-generator",
    "color-swatch-generator",
  ],
  "color-tones-generator": [
    "muted-color-generator",
    "color-shades-generator",
    "earth-tone-color-generator",
    "vintage-retro-palette-generator",
  ],
  "color-lighten-tool": [
    "color-darken-tool",
    "color-tints-generator",
    "saturation-booster",
    "color-comparison-tool",
  ],
  "color-darken-tool": [
    "color-lighten-tool",
    "color-picker",
    "exposure-adjuster",
    "eyedropper-tool",
  ],
  "saturation-booster": [
    "saturation-reducer",
    "color-lighten-tool",
    "vibrance-adjuster",
    "exposure-adjuster",
  ],
  "saturation-reducer": [
    "saturation-booster",
    "color-lighten-tool",
    "color-tones-generator",
    "muted-color-generator",
  ],
  "vibrance-adjuster": [
    "exposure-adjuster",
    "gradient-angle-adjuster",
    "hsl-channel-adjuster",
    "saturation-booster",
  ],
  "exposure-adjuster": [
    "vibrance-adjuster",
    "color-darken-tool",
    "gradient-angle-adjuster",
    "rgb-channel-adjuster",
  ],
  "color-mixer-2": [
    "additive-color-mixer",
    "color-mixer-3plus",
    "color-blend-tool",
    "gradient-palette-mixer",
  ],
  "color-mixer-3plus": [
    "color-mixer-2",
    "gradient-palette-mixer",
    "additive-color-mixer",
    "color-blend-tool",
  ],
  "color-blend-tool": [
    "color-blending-art-tool",
    "color-mixer-2",
    "additive-color-mixer",
    "gradient-palette-mixer",
  ],
  "color-temperature-adjuster": [
    "warm-to-cool-color-shifter",
    "hue-rotator",
    "warm-cool-analyzer",
    "color-temperature-analyzer",
  ],
  "warm-to-cool-color-shifter": [
    "color-temperature-adjuster",
    "hue-rotator",
    "color-temperature-analyzer",
    "warm-cool-analyzer",
  ],
  "rgb-channel-adjuster": [
    "cmyk-channel-mixer",
    "css-rgb-color-generator",
    "hsl-channel-adjuster",
    "css-hsl-color-generator",
  ],
  "hsl-channel-adjuster": [
    "rgb-channel-adjuster",
    "vibrance-adjuster",
    "cmyk-channel-mixer",
    "exposure-adjuster",
  ],
  "hue-rotator": [
    "warm-to-cool-color-shifter",
    "color-temperature-adjuster",
    "color-shift-generator",
    "color-name-lookup",
  ],
  "opacity-calculator": [
    "opacity-layering-calculator",
    "alpha-color-generator",
    "color-blend-tool",
    "perceptual-lightness-calculator",
  ],
  "opacity-layering-calculator": [
    "opacity-calculator",
    "color-blend-tool",
    "transparent-gradient-generator",
    "color-mixer-2",
  ],
  "color-inverter": [
    "complementary-palette-generator",
    "random-color-generator",
    "lucky-color-generator",
    "color-csv-exporter",
  ],
  "color-replacer": [
    "image-recolor-tool",
    "color-picker",
    "color-palette-extractor",
    "image-color-picker",
  ],
  "color-complement-finder": [
    "complementary-palette-generator",
    "color-analogous-finder",
    "dominant-color-finder",
    "hue-circle-interactive",
  ],
  "color-analogous-finder": [
    "analogous-palette-generator",
    "color-complement-finder",
    "color-triadic-finder",
    "emotion-color-finder",
  ],
  "color-triadic-finder": [
    "triadic-palette-generator",
    "color-tetradic-finder",
    "color-monochromatic-finder",
    "color-harmony-generator",
  ],
  "color-tetradic-finder": [
    "tetradic-palette-generator",
    "square-harmony-palette",
    "rectangle-harmony-palette",
    "color-triadic-finder",
  ],
  "color-monochromatic-finder": [
    "monochromatic-palette-generator",
    "color-tetradic-finder",
    "color-triadic-finder",
    "color-harmony-generator",
  ],
  "image-recolor-tool": [
    "color-replacer",
    "color-darken-tool",
    "color-overlay-generator",
    "color-picker",
  ],
  "additive-color-mixer": [
    "color-mixer-2",
    "color-mixer-3plus",
    "subtractive-color-mixer",
    "cmyk-channel-mixer",
  ],
  "subtractive-color-mixer": [
    "color-mixer-2",
    "additive-color-mixer",
    "cmyk-channel-mixer",
    "color-blend-tool",
  ],
  "cmyk-channel-mixer": [
    "rgb-channel-adjuster",
    "additive-color-mixer",
    "subtractive-color-mixer",
    "color-mixer-2",
  ],
  "alpha-color-generator": [
    "opacity-calculator",
    "color-overlay-generator",
    "css-color-formatter",
    "flutter-color-generator",
  ],
  "color-variations-generator": [
    "color-tints-generator",
    "pastel-color-generator",
    "ocean-beach-palette-generator",
    "color-tones-generator",
  ],
  "color-shift-generator": [
    "hue-rotator",
    "8-color-palette-generator",
    "complementary-palette-generator",
    "daily-color-palette-generator",
  ],

  // ── Palettes — full-coverage curation pass ──
  "monochromatic-palette-generator": [
    "color-variations-generator",
    "color-tints-generator",
    "analogous-palette-generator",
    "color-monochromatic-finder",
  ],
  "analogous-palette-generator": [
    "monochromatic-palette-generator",
    "triadic-palette-generator",
    "color-analogous-finder",
    "gradient-color-stop-editor",
  ],
  "complementary-palette-generator": [
    "split-complementary-palette-generator",
    "color-complement-finder",
    "color-inverter",
    "color-shift-generator",
  ],
  "split-complementary-palette-generator": [
    "complementary-palette-generator",
    "color-complement-finder",
    "triadic-palette-generator",
    "contrast-checker",
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
  "square-harmony-palette": [
    "rectangle-harmony-palette",
    "tetradic-palette-generator",
    "triadic-palette-generator",
    "palette-sorter",
  ],
  "rectangle-harmony-palette": [
    "square-harmony-palette",
    "tetradic-palette-generator",
    "single-color-to-full-palette",
    "split-complementary-palette-generator",
  ],
  "random-palette-generator": [
    "daily-color-palette-generator",
    "5-color-palette-generator",
    "pastel-palette-generator",
    "duotone-generator",
  ],
  "palette-locker": [
    "palette-sorter",
    "palette-comparison",
    "random-palette-generator",
    "palette-importer",
  ],
  "single-color-to-full-palette": [
    "analogous-palette-generator",
    "color-tints-generator",
    "image-recolor-tool",
    "palette-sorter",
  ],
  "5-color-palette-generator": [
    "8-color-palette-generator",
    "10-color-palette-generator",
    "monochromatic-palette-generator",
    "brand-palette-generator",
  ],
  "8-color-palette-generator": [
    "5-color-palette-generator",
    "10-color-palette-generator",
    "color-tints-generator",
    "android-xml-color-generator",
  ],
  "10-color-palette-generator": [
    "brand-style-guide-generator",
    "cultural-color-palettes",
    "triadic-palette-generator",
    "single-color-to-full-palette",
  ],
  "pastel-palette-generator": [
    "neon-palette-generator",
    "wes-anderson-style-palette",
    "accessible-palette-generator",
    "corporate-palette-generator",
  ],
  "neon-palette-generator": [
    "pastel-palette-generator",
    "dark-mode-palette-generator",
    "corporate-palette-generator",
    "palette-locker",
  ],
  "earth-tone-palette-generator": [
    "forest-nature-palette-generator",
    "android-xml-color-generator",
    "vintage-retro-palette-generator",
    "sunset-palette-generator",
  ],
  "ocean-beach-palette-generator": [
    "sunset-palette-generator",
    "earth-tone-palette-generator",
    "forest-nature-palette-generator",
    "color-variations-generator",
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
  "dark-mode-palette-generator": [
    "light-mode-palette-generator",
    "neon-palette-generator",
    "zodiac-color-generator",
    "color-shades-generator",
  ],
  "light-mode-palette-generator": [
    "dark-mode-palette-generator",
    "css-color-variables-generator",
    "color-context-simulator",
    "pastel-palette-generator",
  ],
  "corporate-palette-generator": [
    "palette-accessibility-checker",
    "color-shades-generator",
    "contrast-checker",
    "dark-mode-palette-generator",
  ],
  "seasonal-palette-generator": [
    "seasonal-color-finder",
    "lucky-number-color",
    "earth-tone-palette-generator",
    "forest-nature-palette-generator",
  ],
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
    "lucky-number-color",
    "color-shades-generator",
    "brand-style-guide-generator",
    "color-tints-generator",
  ],
  "accessible-palette-generator": [
    "contrast-checker",
    "wcag-21-aaa-checker",
    "accessible-color-pair-finder",
    "brand-palette-generator",
  ],
  "color-palette-extractor": [
    "brand-color-extractor",
    "gradient-from-image",
    "image-theme-generator",
    "pixel-color-picker",
  ],
  "daily-color-palette-generator": [
    "random-palette-generator",
    "palette-importer",
    "seasonal-palette-generator",
    "palette-locker",
  ],
  "wes-anderson-style-palette": [
    "vintage-retro-palette-generator",
    "sunset-palette-generator",
    "pastel-palette-generator",
    "cultural-color-palettes",
  ],
  "palette-importer": [
    "palette-sorter",
    "web-safe-color-palette",
    "palette-locker",
    "color-stack-viewer",
  ],
  "palette-sorter": [
    "palette-comparison",
    "palette-balance-analyzer",
    "visual-weight-analyzer",
    "palette-locker",
  ],
  "palette-comparison": [
    "palette-balance-analyzer",
    "palette-sorter",
    "color-distance-calculator",
    "palette-accessibility-checker",
  ],

  // ── Pickers — full-coverage curation pass ──
  "color-picker": [
    "color-picker-with-history",
    "color-picker-with-favorites",
    "color-darken-tool",
    "color-wheel-interactive",
  ],
  "eyedropper-tool": [
    "screen-color-picker",
    "image-color-picker",
    "webcam-color-picker",
    "pixel-color-picker",
  ],
  "screen-color-picker": [
    "eyedropper-tool",
    "webcam-color-picker",
    "color-wheel-interactive",
    "image-color-picker",
  ],
  "pixel-color-picker": [
    "image-color-picker",
    "eyedropper-tool",
    "color-palette-extractor",
    "color-picker",
  ],
  "multi-color-picker": [
    "color-stack-viewer",
    "color-picker-with-favorites",
    "color-picker",
    "chakra-ui-color-reference",
  ],
  "color-picker-with-history": [
    "color-picker",
    "color-picker-with-favorites",
    "color-wheel-interactive",
    "webcam-color-picker",
  ],
  "color-picker-with-favorites": [
    "color-picker-with-history",
    "color-picker",
    "multi-color-picker",
    "birth-month-color-generator",
  ],
  "color-comparison-tool": [
    "color-distance-calculator",
    "just-noticeable-difference-calculator",
    "palette-comparison",
    "color-blend-tool",
  ],
  "color-stack-viewer": [
    "multi-color-picker",
    "color-of-the-year-browser",
    "css-named-colors-reference",
    "color-mixer-2",
  ],
  "image-color-picker": [
    "webcam-color-picker",
    "eyedropper-tool",
    "pixel-color-picker",
    "screen-color-picker",
  ],
  "webcam-color-picker": [
    "image-color-picker",
    "screen-color-picker",
    "eyedropper-tool",
    "color-wheel-interactive",
  ],
  "color-preview-on-background": [
    "css-background-color-preview",
    "text-readability-checker",
    "css-text-color-preview",
    "palette-accessibility-checker",
  ],

  // ── Theory — full-coverage curation pass ──
  "color-harmony-generator": [
    "10-color-palette-generator",
    "color-tetradic-finder",
    "tetradic-palette-generator",
    "color-triadic-finder",
  ],
  "color-wheel-theory-guide": [
    "hue-circle-interactive",
    "color-theory-reference-tool",
    "primary-secondary-tertiary-colors",
    "color-wheel-interactive",
  ],
  "simultaneous-contrast-visualizer": [
    "bezold-effect-visualizer",
    "color-context-simulator",
    "print-color-accuracy-checker",
    "rgb-cube-visualizer",
  ],
  "bezold-effect-visualizer": [
    "simultaneous-contrast-visualizer",
    "color-afterimage-tool",
    "rgb-cube-visualizer",
    "hue-rotator",
  ],
  "color-afterimage-tool": [
    "bezold-effect-visualizer",
    "color-inverter",
    "color-complement-finder",
    "color-hierarchy-analyzer",
  ],
  "color-context-simulator": [
    "simultaneous-contrast-visualizer",
    "color-of-the-year-browser",
    "css-named-colors-reference",
    "color-memory-game",
  ],
  "just-noticeable-difference-calculator": [
    "color-distance-calculator",
    "color-comparison-tool",
    "color-blend-tool",
    "perceptual-lightness-calculator",
  ],
  "color-rendering-index-reference": [
    "color-symbolism-reference",
    "color-psychology-reference",
    "color-mood-analyzer",
    "radix-color-reference",
  ],
  "munsell-color-system-reference": [
    "natural-color-system-reference",
    "color-naming-history-tool",
    "adobe-spectrum-color-reference",
    "github-primer-color-reference",
  ],
  "natural-color-system-reference": [
    "munsell-color-system-reference",
    "color-naming-history-tool",
    "adobe-spectrum-color-reference",
    "github-primer-color-reference",
  ],
  "pantone-to-hex-reference": [
    "pantone-approximation-tool",
    "ral-to-hex-reference",
    "palette-importer",
    "saturation-reducer",
  ],
  "ral-to-hex-reference": [
    "pantone-to-hex-reference",
    "pantone-approximation-tool",
    "palette-importer",
    "skin-tone-color-finder",
  ],
  "color-gamut-visualizer": [
    "color-gamut-checker",
    "rgb-cube-visualizer",
    "color-afterimage-tool",
    "palette-accessibility-checker",
  ],
  "color-symbolism-reference": [
    "color-psychology-reference",
    "color-mood-analyzer",
    "color-rendering-index-reference",
    "adobe-spectrum-color-reference",
  ],
  "color-naming-history-tool": [
    "natural-color-system-reference",
    "munsell-color-system-reference",
    "bootstrap-color-reference",
    "fluent-ui-color-reference",
  ],
  "color-trend-analyzer": [
    "color-of-the-year-browser",
    "color-hierarchy-analyzer",
    "color-mood-analyzer",
    "radix-color-reference",
  ],
  "color-from-text-mood-tool": [
    "color-array-generator",
    "image-theme-generator",
    "less-variable-generator",
    "scss-variable-generator",
  ],
  "color-blindness-test-ishihara": [
    "color-blindness-test",
    "color-blindness-simulator",
    "color-memory-game",
    "color-darken-tool",
  ],
  "primary-secondary-tertiary-colors": [
    "chakra-ui-color-reference",
    "ant-design-color-reference",
    "brand-color-library",
    "tailwind-color-reference",
  ],
  "oklch-color-playground": [
    "palette-sorter",
    "color-wheel-interactive",
    "perceptual-lightness-calculator",
    "palette-balance-analyzer",
  ],
};

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
