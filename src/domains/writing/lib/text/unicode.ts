/**
 * Unicode helpers for the Writing domain: normalization forms, invisible
 * character inspection/removal, per-paragraph direction detection and bidi
 * control wrapping.
 *
 * Direction detection approximates UAX #9 rules P2/P3 ("first strong
 * character"): a paragraph is RTL if the first strong letter belongs to an RTL
 * script, LTR if the first strong letter is from any other script, and neutral
 * when the paragraph has no letters at all (digits, punctuation, emoji only).
 * Directional formatting characters are ignored while scanning, which is what
 * the "first strong" rule does.
 */

export const NORMALIZATION_FORMS = ["NFC", "NFD", "NFKC", "NFKD"] as const;
export type NormalizationForm = (typeof NORMALIZATION_FORMS)[number];

/** Apply a named Unicode normalization form. */
export function normalize(text: string, form: NormalizationForm): string {
  return text.normalize(form);
}

/**
 * Every form in which the text is already stable, i.e. `normalize(form) === text`.
 * Most plain ASCII text is stable in all four forms.
 */
export function stableForms(text: string): NormalizationForm[] {
  return NORMALIZATION_FORMS.filter((form) => text.normalize(form) === text);
}

/** True when the text contains at least one character that changes under any form. */
export function isNormalizationSensitive(text: string): boolean {
  return stableForms(text).length < NORMALIZATION_FORMS.length;
}

export type CharKind =
  | "letter"
  | "digit"
  | "mark"
  | "punctuation"
  | "symbol"
  | "space"
  | "control"
  | "format";

const KIND_RES: { kind: CharKind; re: RegExp }[] = [
  { kind: "letter", re: /^\p{L}$/u },
  { kind: "mark", re: /^\p{M}$/u },
  { kind: "digit", re: /^\p{N}$/u },
  { kind: "punctuation", re: /^\p{P}$/u },
  { kind: "symbol", re: /^\p{S}$/u },
  { kind: "space", re: /^\s$/u },
  { kind: "control", re: /^\p{Cc}$/u },
  { kind: "format", re: /^\p{Cf}$/u },
];

/**
 * Invisible / zero-width characters that are stripped by `stripInvisible`.
 * Each entry is a range plus the name shown in the UI.
 */
export const INVISIBLE_RANGES: { from: number; to: number; name: string }[] = [
  { from: 0x00ad, to: 0x00ad, name: "Soft hyphen" },
  { from: 0x061c, to: 0x061c, name: "Arabic letter mark" },
  { from: 0x180e, to: 0x180e, name: "Mongolian vowel separator" },
  { from: 0x200b, to: 0x200f, name: "Zero-width space / joiner / LTR-RTL mark" },
  { from: 0x202a, to: 0x202e, name: "Directional embedding or override" },
  { from: 0x2060, to: 0x2064, name: "Word joiner / invisible operators" },
  { from: 0x2066, to: 0x2069, name: "Directional isolate" },
  { from: 0x206a, to: 0x206f, name: "Deprecated format character" },
  { from: 0xfeff, to: 0xfeff, name: "Byte order mark / zero-width no-break space" },
  { from: 0x1d173, to: 0x1d17a, name: "Musical symbol format character" },
  { from: 0xe0001, to: 0xe0001, name: "Language tag" },
  { from: 0xe0020, to: 0xe007f, name: "Tag character" },
];

function invisibleName(codePoint: number): string | null {
  for (const range of INVISIBLE_RANGES) {
    if (codePoint >= range.from && codePoint <= range.to) return range.name;
  }
  return null;
}

/** True when the code point is one of the invisible/zero-width characters. */
export function isInvisibleCodePoint(codePoint: number): boolean {
  return invisibleName(codePoint) !== null;
}

export interface InvisibleHit {
  index: number;
  codePoint: number;
  hex: string;
  name: string;
}

/** Positions of every invisible character, for the inspector table. */
export function findInvisibleCharacters(text: string): InvisibleHit[] {
  const out: InvisibleHit[] = [];
  let offset = 0;
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    const name = invisibleName(codePoint);
    if (name) out.push({ index: offset, codePoint, hex: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`, name });
    offset += char.length;
  }
  return out;
}

/** Remove every invisible/zero-width character; reports how many were removed. */
export function stripInvisible(text: string): { text: string; removed: number } {
  let removed = 0;
  let out = "";
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (isInvisibleCodePoint(codePoint)) {
      removed += 1;
      continue;
    }
    out += char;
  }
  return { text: out, removed };
}

export interface CharInfo {
  index: number;
  char: string;
  codePoint: number;
  hex: string;
  kind: CharKind;
}

function kindOf(char: string): CharKind {
  for (const { kind, re } of KIND_RES) {
    if (re.test(char)) return kind;
  }
  return "other" as CharKind;
}

/** Per-character classification, capped by the caller for very long inputs. */
export function inspectCharacters(text: string): CharInfo[] {
  const out: CharInfo[] = [];
  let offset = 0;
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    out.push({
      index: offset,
      char,
      codePoint,
      hex: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
      kind: kindOf(char),
    });
    offset += char.length;
  }
  return out;
}

export interface KindSummary {
  letters: number;
  digits: number;
  marks: number;
  punctuation: number;
  symbols: number;
  spaces: number;
  control: number;
  format: number;
  other: number;
}

export function summarizeKinds(text: string): KindSummary {
  const summary: KindSummary = {
    letters: 0,
    digits: 0,
    marks: 0,
    punctuation: 0,
    symbols: 0,
    spaces: 0,
    control: 0,
    format: 0,
    other: 0,
  };
  for (const char of text) {
    switch (kindOf(char)) {
      case "letter":
        summary.letters += 1;
        break;
      case "digit":
        summary.digits += 1;
        break;
      case "mark":
        summary.marks += 1;
        break;
      case "punctuation":
        summary.punctuation += 1;
        break;
      case "symbol":
        summary.symbols += 1;
        break;
      case "space":
        summary.spaces += 1;
        break;
      case "control":
        summary.control += 1;
        break;
      case "format":
        summary.format += 1;
        break;
      default:
        summary.other += 1;
    }
  }
  return summary;
}

/**
 * RTL script ranges (code point ranges of scripts written right-to-left).
 * Digits and punctuation inside these ranges are not treated as strong — the
 * classifier only looks at letters.
 */
const RTL_RANGES: [number, number][] = [
  [0x0590, 0x05ff], // Hebrew
  [0x0600, 0x07bf], // Arabic, Syriac, Arabic Supplement, Thaana
  [0x07c0, 0x08ff], // NKo, Samaritan, Mandaic, Arabic Extended A/B
  [0xfb1d, 0xfdff], // Hebrew and Arabic presentation forms A
  [0xfe70, 0xfeff], // Arabic presentation forms B
  [0x10800, 0x10fff], // Cypriot, Phoenician, Kharoshthi, Avestan, Old Sogdian …
  [0x1e800, 0x1e95f], // Mende Kikakui, Adlam
  [0x1ec70, 0x1ecbf], // Indic Siyaq numbers
  [0x1ed00, 0x1ed4f], // Ottoman Siyaq numbers
  [0x1ee00, 0x1eeff], // Arabic mathematical alphabetic symbols
];

const LETTER_RE = /^\p{L}$/u;

/** True when the code point is a letter from a right-to-left script. */
export function isStrongRtl(codePoint: number): boolean {
  for (const [from, to] of RTL_RANGES) {
    if (codePoint >= from && codePoint <= to) return true;
  }
  return false;
}

/** True when the character is a strong-directional letter (L or R in UAX #9). */
export function isStrongLetter(char: string): boolean {
  return LETTER_RE.test(char);
}

export type Direction = "rtl" | "ltr" | "neutral";

/** First-strong direction of a single block of text. */
export function detectDirection(text: string): Direction {
  for (const char of text) {
    if (!isStrongLetter(char)) continue;
    return isStrongRtl(char.codePointAt(0) ?? 0) ? "rtl" : "ltr";
  }
  return "neutral";
}

export interface ParagraphDirection {
  index: number;
  text: string;
  direction: Direction;
}

/** Direction of every paragraph (blank-line separated), in document order. */
export function paragraphDirections(text: string): ParagraphDirection[] {
  const normalized = text.replace(/\r\n?/g, "\n");
  const blocks = normalized.split(/\n[ \t]*\n+/);
  const out: ParagraphDirection[] = [];
  let offset = 0;
  blocks.forEach((block) => {
    if (block.trim().length > 0) {
      out.push({ index: offset, text: block, direction: detectDirection(block) });
    }
    offset += block.length + 2; // approximates the blank-line separator length
  });
  return out;
}

export interface BidiCounts {
  rtlLetters: number;
  ltrLetters: number;
  rtlIsolatesAndMarks: number;
  bidiControls: number;
}

const BIDI_CONTROL_RANGES: [number, number][] = [
  [0x202a, 0x202e],
  [0x2066, 0x2069],
  [0x200e, 0x200f],
  [0x061c, 0x061c],
];

export function isBidiControl(codePoint: number): boolean {
  for (const [from, to] of BIDI_CONTROL_RANGES) {
    if (codePoint >= from && codePoint <= to) return true;
  }
  return false;
}

/** Counts of strong RTL/LTR letters and explicit bidi controls. */
export function bidiCounts(text: string): BidiCounts {
  const counts: BidiCounts = { rtlLetters: 0, ltrLetters: 0, rtlIsolatesAndMarks: 0, bidiControls: 0 };
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (isBidiControl(codePoint)) {
      counts.bidiControls += 1;
      continue;
    }
    if (!isStrongLetter(char)) continue;
    if (isStrongRtl(codePoint)) {
      counts.rtlLetters += 1;
      counts.rtlIsolatesAndMarks += 1;
    } else {
      counts.ltrLetters += 1;
    }
  }
  return counts;
}

export type BidiWrapMode = "fsi" | "lri" | "rli" | "rle" | "lre" | "rlo" | "lro" | "isolate-rli";

const WRAP_MARKERS: Record<BidiWrapMode, { open: string; close: string; label: string }> = {
  fsi: { open: "\u2068", close: "\u2069", label: "First-strong isolate (FSI … PDI)" },
  lri: { open: "\u2066", close: "\u2069", label: "Left-to-right isolate (LRI … PDI)" },
  rli: { open: "\u2067", close: "\u2069", label: "Right-to-left isolate (RLI … PDI)" },
  "isolate-rli": { open: "\u2067", close: "\u2069", label: "Right-to-left isolate (RLI … PDI)" },
  rle: { open: "\u202b", close: "\u202c", label: "Right-to-left embedding (RLE … PDF)" },
  lre: { open: "\u202a", close: "\u202c", label: "Left-to-right embedding (LRE … PDF)" },
  rlo: { open: "\u202e", close: "\u202c", label: "Right-to-left override (RLO … PDF)" },
  lro: { open: "\u202d", close: "\u202c", label: "Left-to-right override (LRO … PDF)" },
};

export function bidiWrapLabel(mode: BidiWrapMode): string {
  return WRAP_MARKERS[mode].label;
}

/** Wrap the selection in the given bidi control pair. */
export function wrapBidi(text: string, mode: BidiWrapMode): string {
  const markers = WRAP_MARKERS[mode];
  return `${markers.open}${text}${markers.close}`;
}

/** Hex dump of the bidi controls in a string, for the inspector table. */
export function bidiControlList(text: string): { index: number; hex: string; label: string }[] {
  const out: { index: number; hex: string; label: string }[] = [];
  let offset = 0;
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (isBidiControl(codePoint)) {
      out.push({
        index: offset,
        hex: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
        label: Object.values(WRAP_MARKERS).find(
          (marker) => marker.open === char || marker.close === char,
        )?.label ?? "Bidi control",
      });
    }
    offset += char.length;
  }
  return out;
}
