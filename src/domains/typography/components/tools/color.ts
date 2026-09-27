/**
 * Shared color helpers for the Racira Fonts accessibility tools.
 * All maths follows WCAG 2.x: sRGB → linear → relative luminance → ratio.
 */

export function parseHex(input: string): { r: number; g: number; b: number } | null {
  const m = input.trim().replace(/^#/, "");
  const hex = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

export function toHex(rgb: { r: number; g: number; b: number }): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
}

/** WCAG relative luminance (0–1). */
export function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

/** WCAG contrast ratio (1–21). */
export function contrastRatio(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export function ratioVerdict(
  ratio: number,
  large: boolean,
): { label: string; pass: boolean }[] {
  const aa = large ? 3 : 4.5;
  const aaa = large ? 4.5 : 7;
  return [
    { label: `AA (${aa}:1)`, pass: ratio >= aa },
    { label: `AAA (${aaa}:1)`, pass: ratio >= aaa },
    { label: "AA UI components (3:1)", pass: ratio >= 3 },
  ];
}

/** "#rrggbb" normaliser that returns null for anything unparseable. */
export function normalizeHex(input: string): string | null {
  const rgb = parseHex(input);
  return rgb ? toHex(rgb) : null;
}
