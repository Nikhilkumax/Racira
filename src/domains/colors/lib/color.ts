import {
  parse, converter, formatHex, formatRgb, formatHsl, formatCss, wcagContrast,
  random as randomColor, type Color,
} from "culori";

const toRgb = converter("rgb");
const toHsl = converter("hsl");
const toHwb = converter("hwb");
const toLab = converter("lab");
const toLch = converter("lch");
const toOklch = converter("oklch");

export type ParsedColor = Color;

export function parseColor(input: string): Color | undefined {
  if (!input) return undefined;
  try {
    return parse(input.trim());
  } catch {
    return undefined;
  }
}

export function isValidColor(input: string): boolean {
  return !!parseColor(input);
}

/**
 * The gate a hex input uses before committing what was typed.
 *
 * culori's parse() (and so isValidColor) is deliberately permissive: besides
 * full hex it accepts partial forms like "#9999" (CSS #RGBA) and bare "9999".
 * Committing those mid-edit normalizes them into a complete colour and pushes
 * it back into the field, replacing the raw text the user is typing with a
 * colour they never entered. A hex field only commits 3- or 6-digit hex.
 */
export function isCompleteHex(input: string): boolean {
  return /^#?[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(input.trim());
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const round = (n: number, p = 0) => Math.round(n * 10 ** p) / 10 ** p;

export function toHex(c: Color | string | undefined): string {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return "#000000";
  return formatHex(p) ?? "#000000";
}

export function toRgbString(c: Color | string | undefined): string {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return "rgb(0, 0, 0)";
  return formatRgb(p);
}

export function toHslString(c: Color | string | undefined): string {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return "hsl(0, 0%, 0%)";
  return formatHsl(p);
}

export function toOklchString(c: Color | string | undefined): string {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return "oklch(0 0 0)";
  return formatCss(toOklch(p)!);
}

export function toRgb255(c: Color | string | undefined) {
  const p = typeof c === "string" ? parseColor(c) : c;
  const r = p ? toRgb(p)! : { r: 0, g: 0, b: 0, alpha: 1 };
  return {
    r: Math.round(clamp01(r.r) * 255),
    g: Math.round(clamp01(r.g) * 255),
    b: Math.round(clamp01(r.b) * 255),
    a: r.alpha ?? 1,
  };
}

export function toCmyk(c: Color | string | undefined) {
  const { r, g, b } = toRgb255(c);
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const k = 1 - Math.max(rN, gN, bN);
  const denom = 1 - k || 1;
  return {
    c: round(((1 - rN - k) / denom) * 100),
    m: round(((1 - gN - k) / denom) * 100),
    y: round(((1 - bN - k) / denom) * 100),
    k: round(k * 100),
  };
}

export function toHwbObj(c: Color | string | undefined) {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return { h: 0, w: 0, b: 0 };
  const h = toHwb(p)!;
  return { h: round(h.h ?? 0, 1), w: round((h.w ?? 0) * 100, 1), b: round((h.b ?? 0) * 100, 1) };
}

export function toLabObj(c: Color | string | undefined) {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return { l: 0, a: 0, b: 0 };
  const l = toLab(p)!;
  return { l: round(l.l ?? 0, 2), a: round(l.a ?? 0, 2), b: round(l.b ?? 0, 2) };
}

export function toLchObj(c: Color | string | undefined) {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return { l: 0, c: 0, h: 0 };
  const l = toLch(p)!;
  return { l: round(l.l ?? 0, 2), c: round(l.c ?? 0, 2), h: round(l.h ?? 0, 1) };
}

export function toOklchObj(c: Color | string | undefined) {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return { l: 0, c: 0, h: 0 };
  const o = toOklch(p)!;
  return { l: round(o.l ?? 0, 4), c: round(o.c ?? 0, 4), h: round(o.h ?? 0, 1) };
}

export function toHslObj(c: Color | string | undefined) {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return { h: 0, s: 0, l: 0 };
  const h = toHsl(p)!;
  return { h: round(h.h ?? 0, 1), s: round((h.s ?? 0) * 100, 1), l: round((h.l ?? 0) * 100, 1) };
}

export function lighten(c: string, amount: number): string {
  const o = toOklchObj(c);
  return toHex(`oklch(${clamp01(o.l + amount)} ${o.c} ${o.h})`);
}

export function darken(c: string, amount: number): string {
  return lighten(c, -amount);
}

export function saturate(c: string, amount: number): string {
  const o = toOklchObj(c);
  return toHex(`oklch(${o.l} ${Math.max(0, o.c + amount)} ${o.h})`);
}

export function shiftHue(c: string, deg: number): string {
  const o = toOklchObj(c);
  return toHex(`oklch(${o.l} ${o.c} ${(o.h + deg + 360) % 360})`);
}

export function invertColor(c: string): string {
  const { r, g, b } = toRgb255(c);
  return rgbToHex(255 - r, 255 - g, 255 - b);
}

export function mix(a: string, b: string, t: number): string {
  const ra = toRgb255(a);
  const rb = toRgb255(b);
  return rgbToHex(
    Math.round(ra.r + (rb.r - ra.r) * t),
    Math.round(ra.g + (rb.g - ra.g) * t),
    Math.round(ra.b + (rb.b - ra.b) * t),
  );
}

export function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function contrastRatio(a: string, b: string): number {
  return Math.round(wcagContrast(a, b) * 100) / 100;
}

export interface WCAGResult {
  ratio: number;
  aa_normal: boolean;
  aa_large: boolean;
  aaa_normal: boolean;
  aaa_large: boolean;
}

export function wcag(a: string, b: string): WCAGResult {
  const r = contrastRatio(a, b);
  return {
    ratio: r,
    aa_normal: r >= 4.5,
    aa_large: r >= 3,
    aaa_normal: r >= 7,
    aaa_large: r >= 4.5,
  };
}

export function randomHex(): string {
  return toHex(randomColor());
}

export function shades(c: string, n = 10): string[] {
  const o = toOklchObj(c);
  return Array.from({ length: n }, (_, i) => {
    const l = o.l * (1 - (i + 1) / (n + 1));
    return toHex(`oklch(${clamp01(l)} ${o.c} ${o.h})`);
  });
}

export function tints(c: string, n = 10): string[] {
  const o = toOklchObj(c);
  return Array.from({ length: n }, (_, i) => {
    const l = o.l + (1 - o.l) * ((i + 1) / (n + 1));
    return toHex(`oklch(${clamp01(l)} ${o.c} ${o.h})`);
  });
}

export function tones(c: string, n = 10): string[] {
  const o = toOklchObj(c);
  return Array.from({ length: n }, (_, i) => {
    const sat = o.c * (1 - (i + 1) / (n + 1));
    return toHex(`oklch(${o.l} ${sat} ${o.h})`);
  });
}

export function harmonyColors(base: string, kind: string): string[] {
  const o = toOklchObj(base);
  const at = (h: number) => toHex(`oklch(${o.l} ${o.c} ${(h + 360) % 360})`);
  switch (kind) {
    case "complementary": return [base, at(o.h + 180)];
    case "analogous": return [at(o.h - 30), base, at(o.h + 30)];
    case "triadic": return [base, at(o.h + 120), at(o.h + 240)];
    case "tetradic": return [base, at(o.h + 90), at(o.h + 180), at(o.h + 270)];
    case "split": return [base, at(o.h + 150), at(o.h + 210)];
    case "mono":
      return [
        toHex(`oklch(${clamp01(o.l - 0.3)} ${o.c} ${o.h})`),
        toHex(`oklch(${clamp01(o.l - 0.15)} ${o.c} ${o.h})`),
        base,
        toHex(`oklch(${clamp01(o.l + 0.15)} ${o.c} ${o.h})`),
        toHex(`oklch(${clamp01(o.l + 0.3)} ${o.c} ${o.h})`),
      ];
    default: return [base];
  }
}

// Simple k-means in RGB space for image palette extraction
export function kmeansPalette(pixels: number[][], k: number, iters = 8): number[][] {
  if (pixels.length === 0) return [];
  const centroids: number[][] = [];
  for (let i = 0; i < k; i++) {
    centroids.push(pixels[Math.floor((i + 0.5) * pixels.length / k)] ?? pixels[0]);
  }
  for (let it = 0; it < iters; it++) {
    const buckets: number[][][] = Array.from({ length: k }, () => []);
    for (const p of pixels) {
      let best = 0, bd = Infinity;
      for (let i = 0; i < k; i++) {
        const c = centroids[i];
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < bd) { bd = d; best = i; }
      }
      buckets[best].push(p);
    }
    for (let i = 0; i < k; i++) {
      const b = buckets[i];
      if (!b.length) continue;
      centroids[i] = [
        b.reduce((s, p) => s + p[0], 0) / b.length,
        b.reduce((s, p) => s + p[1], 0) / b.length,
        b.reduce((s, p) => s + p[2], 0) / b.length,
      ];
    }
  }
  return centroids.map(c => c.map(Math.round));
}

/**
 * The single most prevalent colour in a sample of pixels.
 *
 * Each channel is quantised to 5 bits (32 levels) and pixels are counted into
 * histogram buckets; the largest bucket wins and its mean is returned. This is a
 * real dominant colour, which is not the same as the average of every pixel:
 * averaging a photo blends its extremes into a muddy mid-tone, whereas counting
 * returns the colour that actually covers the most area.
 */
export function dominantColor(pixels: number[][]): number[] | null {
  if (!pixels.length) return null;
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (const p of pixels) {
    const key = ((p[0] >> 3) << 10) | ((p[1] >> 3) << 5) | (p[2] >> 3);
    const acc = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    acc.n += 1;
    acc.r += p[0];
    acc.g += p[1];
    acc.b += p[2];
    buckets.set(key, acc);
  }
  let best: { n: number; r: number; g: number; b: number } | null = null;
  for (const acc of buckets.values()) {
    if (!best || acc.n > best.n) best = acc;
  }
  if (!best) return null;
  return [Math.round(best.r / best.n), Math.round(best.g / best.n), Math.round(best.b / best.n)];
}

export async function imageFileToPixels(file: File, sampleSize = 100): Promise<{ pixels: number[][]; width: number; height: number; canvas: HTMLCanvasElement }> {
  const img = await fileToImage(file);
  const canvas = document.createElement("canvas");
  const ratio = Math.min(1, sampleSize / Math.max(img.width, img.height));
  canvas.width = Math.max(1, Math.round(img.width * ratio));
  canvas.height = Math.max(1, Math.round(img.height * ratio));
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const pixels: number[][] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  return { pixels, width: canvas.width, height: canvas.height, canvas };
}

export function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

// Color blindness simulation matrices (Brettel/Machado approximations)
const CVD_MATRICES: Record<string, number[]> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

export function simulateCVD(hex: string, type: keyof typeof CVD_MATRICES): string {
  const m = CVD_MATRICES[type];
  if (!m) return hex;
  const { r, g, b } = toRgb255(hex);
  return rgbToHex(
    m[0] * r + m[1] * g + m[2] * b,
    m[3] * r + m[4] * g + m[5] * b,
    m[6] * r + m[7] * g + m[8] * b,
  );
}

export const CVD_TYPES = Object.keys(CVD_MATRICES) as Array<keyof typeof CVD_MATRICES>;

export function applyCVDToImageData(data: ImageData, type: keyof typeof CVD_MATRICES): ImageData {
  const m = CVD_MATRICES[type];
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    d[i] = Math.max(0, Math.min(255, m[0] * r + m[1] * g + m[2] * b));
    d[i + 1] = Math.max(0, Math.min(255, m[3] * r + m[4] * g + m[5] * b));
    d[i + 2] = Math.max(0, Math.min(255, m[6] * r + m[7] * g + m[8] * b));
  }
  return data;
}

export const CSS_NAMED_COLORS: Array<[string, string]> = [
  ["aliceblue","#F0F8FF"],["antiquewhite","#FAEBD7"],["aqua","#00FFFF"],["aquamarine","#7FFFD4"],
  ["azure","#F0FFFF"],["beige","#F5F5DC"],["bisque","#FFE4C4"],["black","#000000"],
  ["blanchedalmond","#FFEBCD"],["blue","#0000FF"],["blueviolet","#8A2BE2"],["brown","#A52A2A"],
  ["burlywood","#DEB887"],["cadetblue","#5F9EA0"],["chartreuse","#7FFF00"],["chocolate","#D2691E"],
  ["coral","#FF7F50"],["cornflowerblue","#6495ED"],["cornsilk","#FFF8DC"],["crimson","#DC143C"],
  ["cyan","#00FFFF"],["darkblue","#00008B"],["darkcyan","#008B8B"],["darkgoldenrod","#B8860B"],
  ["darkgray","#A9A9A9"],["darkgreen","#006400"],["darkkhaki","#BDB76B"],["darkmagenta","#8B008B"],
  ["darkolivegreen","#556B2F"],["darkorange","#FF8C00"],["darkorchid","#9932CC"],["darkred","#8B0000"],
  ["darksalmon","#E9967A"],["darkseagreen","#8FBC8F"],["darkslateblue","#483D8B"],["darkslategray","#2F4F4F"],
  ["darkturquoise","#00CED1"],["darkviolet","#9400D3"],["deeppink","#FF1493"],["deepskyblue","#00BFFF"],
  ["dimgray","#696969"],["dodgerblue","#1E90FF"],["firebrick","#B22222"],["floralwhite","#FFFAF0"],
  ["forestgreen","#228B22"],["fuchsia","#FF00FF"],["gainsboro","#DCDCDC"],["ghostwhite","#F8F8FF"],
  ["gold","#FFD700"],["goldenrod","#DAA520"],["gray","#808080"],["green","#008000"],
  ["greenyellow","#ADFF2F"],["honeydew","#F0FFF0"],["hotpink","#FF69B4"],["indianred","#CD5C5C"],
  ["indigo","#4B0082"],["ivory","#FFFFF0"],["khaki","#F0E68C"],["lavender","#E6E6FA"],
  ["lavenderblush","#FFF0F5"],["lawngreen","#7CFC00"],["lemonchiffon","#FFFACD"],["lightblue","#ADD8E6"],
  ["lightcoral","#F08080"],["lightcyan","#E0FFFF"],["lightgoldenrodyellow","#FAFAD2"],["lightgray","#D3D3D3"],
  ["lightgreen","#90EE90"],["lightpink","#FFB6C1"],["lightsalmon","#FFA07A"],["lightseagreen","#20B2AA"],
  ["lightskyblue","#87CEFA"],["lightslategray","#778899"],["lightsteelblue","#B0C4DE"],["lightyellow","#FFFFE0"],
  ["lime","#00FF00"],["limegreen","#32CD32"],["linen","#FAF0E6"],["magenta","#FF00FF"],
  ["maroon","#800000"],["mediumaquamarine","#66CDAA"],["mediumblue","#0000CD"],["mediumorchid","#BA55D3"],
  ["mediumpurple","#9370DB"],["mediumseagreen","#3CB371"],["mediumslateblue","#7B68EE"],["mediumspringgreen","#00FA9A"],
  ["mediumturquoise","#48D1CC"],["mediumvioletred","#C71585"],["midnightblue","#191970"],["mintcream","#F5FFFA"],
  ["mistyrose","#FFE4E1"],["moccasin","#FFE4B5"],["navajowhite","#FFDEAD"],["navy","#000080"],
  ["oldlace","#FDF5E6"],["olive","#808000"],["olivedrab","#6B8E23"],["orange","#FFA500"],
  ["orangered","#FF4500"],["orchid","#DA70D6"],["palegoldenrod","#EEE8AA"],["palegreen","#98FB98"],
  ["paleturquoise","#AFEEEE"],["palevioletred","#DB7093"],["papayawhip","#FFEFD5"],["peachpuff","#FFDAB9"],
  ["peru","#CD853F"],["pink","#FFC0CB"],["plum","#DDA0DD"],["powderblue","#B0E0E6"],
  ["purple","#800080"],["rebeccapurple","#663399"],["red","#FF0000"],["rosybrown","#BC8F8F"],
  ["royalblue","#4169E1"],["saddlebrown","#8B4513"],["salmon","#FA8072"],["sandybrown","#F4A460"],
  ["seagreen","#2E8B57"],["seashell","#FFF5EE"],["sienna","#A0522D"],["silver","#C0C0C0"],
  ["skyblue","#87CEEB"],["slateblue","#6A5ACD"],["slategray","#708090"],["snow","#FFFAFA"],
  ["springgreen","#00FF7F"],["steelblue","#4682B4"],["tan","#D2B48C"],["teal","#008080"],
  ["thistle","#D8BFD8"],["tomato","#FF6347"],["turquoise","#40E0D0"],["violet","#EE82EE"],
  ["wheat","#F5DEB3"],["white","#FFFFFF"],["whitesmoke","#F5F5F5"],["yellow","#FFFF00"],
  ["yellowgreen","#9ACD32"],
];