/**
 * Shared font catalog for Racira Fonts preview tools.
 *
 * These 13 families are the preview set for every font-preview/waterfall/
 * pangram tool in the domain. The actual webfonts are loaded once by the
 * /typography layout (`FONT_STYLESHEET` below) — before this existed the
 * catalog was a lie: only Inter was loaded (app/layout.tsx next/font), so 12
 * of the 13 "font family" options rendered in a generic fallback face.
 */

export interface PreviewFont {
  name: string;
  stack: string;
  kind: "sans" | "serif" | "mono" | "display";
}

export const FONTS: PreviewFont[] = [
  { name: "Inter", stack: "'Inter', sans-serif", kind: "sans" },
  { name: "Fraunces", stack: "'Fraunces', serif", kind: "serif" },
  { name: "Playfair Display", stack: "'Playfair Display', serif", kind: "serif" },
  { name: "Lora", stack: "'Lora', serif", kind: "serif" },
  { name: "Source Serif 4", stack: "'Source Serif 4', serif", kind: "serif" },
  { name: "Merriweather", stack: "'Merriweather', serif", kind: "serif" },
  { name: "Space Grotesk", stack: "'Space Grotesk', sans-serif", kind: "sans" },
  { name: "DM Sans", stack: "'DM Sans', sans-serif", kind: "sans" },
  { name: "Manrope", stack: "'Manrope', sans-serif", kind: "sans" },
  { name: "Poppins", stack: "'Poppins', sans-serif", kind: "sans" },
  { name: "JetBrains Mono", stack: "'JetBrains Mono', monospace", kind: "mono" },
  { name: "Bebas Neue", stack: "'Bebas Neue', sans-serif", kind: "display" },
  { name: "Roboto Slab", stack: "'Roboto Slab', serif", kind: "serif" },
];

export const FONT_BY_NAME = new Map(FONTS.map((f) => [f.name, f]));

export const DEFAULT_SAMPLE = "The quick brown fox jumps over the lazy dog";

export const WEIGHTS = [300, 400, 500, 600, 700];

/** One stylesheet request for every family/weight the previewers offer. */
export const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Inter:wght@300..700",
    "family=Fraunces:opsz,wght@9..144,300..700",
    "family=Playfair+Display:wght@300..700",
    "family=Lora:wght@300..700",
    "family=Source+Serif+4:opsz,wght@8..60,300..700",
    "family=Merriweather:wght@300..700",
    "family=Space+Grotesk:wght@300..700",
    "family=DM+Sans:opsz,wght@9..40,300..700",
    "family=Manrope:wght@300..700",
    "family=Poppins:wght@300;400;500;600;700",
    "family=JetBrains+Mono:wght@300..700",
    "family=Bebas+Neue",
    "family=Roboto+Slab:wght@300..700",
  ].join("&") +
  "&display=swap";

/** Classic pangrams used by the pangram tester + specimen tools. */
export const PANGRAMS: { label: string; text: string }[] = [
  { label: "Classic", text: "The quick brown fox jumps over the lazy dog." },
  { label: "Shortest — 28 letters", text: "Waltz, bad nymph, for quick jigs vex." },
  { label: "Alphabet-heavy", text: "Jackdaws love my big sphinx of quartz." },
  { label: "Punctuation", text: "Pack my box with five dozen liquor jugs — quickly!" },
  { label: "Numbers & symbols", text: "Sphinx of black quartz, judge my vow: 0123456789 @#$%&*()" },
  { label: "Mixed case", text: "How vexingly quick daft zebras JUMP! (26 letters, 5 vowels)" },
];
