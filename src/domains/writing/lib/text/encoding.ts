/**
 * Character-encoding conversion, implemented in-house so every byte the tool
 * prints can be checked by hand.
 *
 * There is no dependency here and no reliance on the platform's `TextDecoder`
 * label list, because those labels are not what they look like: the WHATWG
 * "latin1" and "ascii" labels both decode through Windows-1252 in browsers.
 * Each codec below is written out so the mapping is the one the label says:
 *
 *   utf-8        standard UTF-8, with lone surrogates replaced by U+FFFD;
 *   utf-16le/be  code units, surrogate pairs combined on decode;
 *   utf-32le/be  one 32-bit code point per character;
 *   windows-1252 the Windows code page, including the 0x80-0x9F block that
 *                carries €, the curly quotes and the em dash;
 *   iso-8859-1   true Latin-1: byte value equals code point, nothing else;
 *   us-ascii     bytes 0x00-0x7F only.
 *
 * Encoding a character a code page cannot represent is reported, never hidden:
 * the byte written is '?' (0x3F) and the character, its source index and its
 * code point are returned in `lossy`. Decoding bytes that do not form valid
 * text (a truncated UTF-8 sequence, an unpaired surrogate, an out-of-range
 * UTF-32 value) yields U+FFFD and increments `replacements`.
 *
 * No byte-order mark is added or expected: UTF-16 and UTF-32 output is bare,
 * and a BOM in the input is decoded as an ordinary character, which the page
 * states.
 */
import { codePoints } from "./tokenize.ts";

export type EncodingId =
  | "utf-8"
  | "utf-16le"
  | "utf-16be"
  | "utf-32le"
  | "utf-32be"
  | "windows-1252"
  | "iso-8859-1"
  | "us-ascii";

export interface EncodingInfo {
  id: EncodingId;
  label: string;
  /** One sentence on what the encoding represents and cannot represent. */
  detail: string;
}

/** Selectable encodings, in the order the UI lists them. */
export const ENCODINGS: readonly EncodingInfo[] = [
  {
    id: "utf-8",
    label: "UTF-8",
    detail: "1-4 bytes per code point, represents every Unicode character. The default for the web.",
  },
  {
    id: "utf-16le",
    label: "UTF-16 LE",
    detail: "2 or 4 bytes per character, little-endian, no byte-order mark.",
  },
  {
    id: "utf-16be",
    label: "UTF-16 BE",
    detail: "2 or 4 bytes per character, big-endian, no byte-order mark.",
  },
  {
    id: "utf-32le",
    label: "UTF-32 LE",
    detail: "always 4 bytes per code point, little-endian; rarely used for storage.",
  },
  {
    id: "utf-32be",
    label: "UTF-32 BE",
    detail: "always 4 bytes per code point, big-endian; rarely used for storage.",
  },
  {
    id: "windows-1252",
    label: "Windows-1252",
    detail:
      "single byte; 0x80-0x9F carry €, curly quotes and the em dash instead of control codes. Also called CP-1252.",
  },
  {
    id: "iso-8859-1",
    label: "ISO-8859-1 (Latin-1)",
    detail:
      "single byte; byte value equals code point for U+0000-U+00FF. Cannot represent €, curly quotes or any emoji.",
  },
  {
    id: "us-ascii",
    label: "US-ASCII",
    detail: "bytes 0x00-0x7F only; every accented letter, emoji or curly quote becomes '?' when encoding.",
  },
];

export interface LossyCharacter {
  /** The character as written in the source string. */
  character: string;
  /** UTF-16 index of the character in the source string. */
  index: number;
  /** Its Unicode code point. */
  codePoint: number;
}

export interface EncodeResult {
  bytes: Uint8Array;
  /** Characters the encoding cannot represent; each was written as '?'. */
  lossy: LossyCharacter[];
}

export interface DecodeResult {
  text: string;
  /** Invalid byte sequences that were replaced with U+FFFD. */
  replacements: number;
}

export type ByteFormat = "hex" | "base64" | "escaped";

export type ParseResult = { ok: true; bytes: Uint8Array } | { ok: false; error: string };

const QUESTION = 0x3f;
const REPLACEMENT = 0xfffd;
const REPLACEMENT_CHAR = String.fromCharCode(REPLACEMENT);

/** Windows-1252 assignments for 0x80-0x9F (WHATWG index table). */
const WINDOWS_1252_HIGH: Record<number, number> = {
  0x80: 0x20ac, // €
  0x82: 0x201a,
  0x83: 0x0192,
  0x84: 0x201e,
  0x85: 0x2026,
  0x86: 0x2020,
  0x87: 0x2021,
  0x88: 0x02c6,
  0x89: 0x2030,
  0x8a: 0x0160,
  0x8b: 0x2039,
  0x8c: 0x0152,
  0x8e: 0x017d,
  0x91: 0x2018,
  0x92: 0x2019,
  0x93: 0x201c,
  0x94: 0x201d,
  0x95: 0x2022,
  0x96: 0x2013,
  0x97: 0x2014,
  0x98: 0x02dc,
  0x99: 0x2122,
  0x9a: 0x0161,
  0x9b: 0x203a,
  0x9c: 0x0153,
  0x9e: 0x017e,
  0x9f: 0x0178,
};

/** Byte -> code point for all 256 Windows-1252 bytes (undefined slots are C1 controls). */
const WINDOWS_1252_DECODE: number[] = (() => {
  const table: number[] = [];
  for (let byte = 0; byte < 256; byte += 1) {
    table[byte] = byte >= 0x80 && byte <= 0x9f ? (WINDOWS_1252_HIGH[byte] ?? byte) : byte;
  }
  return table;
})();

/** Code point -> byte, the inverse of the decode table. */
const WINDOWS_1252_ENCODE: Map<number, number> = (() => {
  const map = new Map<number, number>();
  for (let byte = 0; byte < 256; byte += 1) {
    const codePoint = WINDOWS_1252_DECODE[byte];
    if (!map.has(codePoint)) map.set(codePoint, byte);
  }
  return map;
})();

/** Iterate a string by code point, reporting the UTF-16 index of each. */
function forEachCodePoint(
  text: string,
  visit: (character: string, index: number, codePoint: number) => void,
): void {
  let index = 0;
  for (const character of text) {
    visit(character, index, character.codePointAt(0) ?? 0);
    index += character.length;
  }
}

function isHighSurrogate(code: number): boolean {
  return code >= 0xd800 && code <= 0xdbff;
}

function isLowSurrogate(code: number): boolean {
  return code >= 0xdc00 && code <= 0xdfff;
}

// ── UTF-8 ────────────────────────────────────────────────────────────────────
function encodeUtf8(text: string): EncodeResult {
  const bytes: number[] = [];
  const lossy: LossyCharacter[] = [];

  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);
    let codePoint: number;
    if (isHighSurrogate(unit) && index + 1 < text.length && isLowSurrogate(text.charCodeAt(index + 1))) {
      codePoint = ((unit - 0xd800) << 10) + (text.charCodeAt(index + 1) - 0xdc00) + 0x10000;
      index += 1;
    } else if (isHighSurrogate(unit) || isLowSurrogate(unit)) {
      lossy.push({ character: text[index], index, codePoint: unit });
      codePoint = REPLACEMENT;
    } else {
      codePoint = unit;
    }

    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }

  return { bytes: Uint8Array.from(bytes), lossy };
}

function decodeUtf8(bytes: Uint8Array): DecodeResult {
  let text = "";
  let replacements = 0;
  let index = 0;

  while (index < bytes.length) {
    const first = bytes[index];
    if (first <= 0x7f) {
      text += String.fromCharCode(first);
      index += 1;
      continue;
    }

    let needed: number;
    let codePoint: number;
    let minimum: number;
    if (first >= 0xc2 && first <= 0xdf) {
      needed = 1;
      codePoint = first & 0x1f;
      minimum = 0x80;
    } else if (first >= 0xe0 && first <= 0xef) {
      needed = 2;
      codePoint = first & 0x0f;
      minimum = 0x800;
    } else if (first >= 0xf0 && first <= 0xf4) {
      needed = 3;
      codePoint = first & 0x07;
      minimum = 0x10000;
    } else {
      text += REPLACEMENT_CHAR;
      replacements += 1;
      index += 1;
      continue;
    }

    // WHATWG-style maximal subparts: a truncated sequence costs one U+FFFD
    // and consumes the bytes read so far; an invalid continuation byte costs
    // one U+FFFD and is re-examined as a possible lead byte.
    let truncated = false;
    let invalidAt = -1;
    for (let offset = 1; offset <= needed; offset += 1) {
      if (index + offset >= bytes.length) {
        truncated = true;
        break;
      }
      const continuation = bytes[index + offset];
      if (continuation < 0x80 || continuation > 0xbf) {
        invalidAt = index + offset;
        break;
      }
      codePoint = (codePoint << 6) | (continuation & 0x3f);
    }

    if (truncated) {
      text += REPLACEMENT_CHAR;
      replacements += 1;
      index = bytes.length;
      continue;
    }
    if (invalidAt >= 0) {
      text += REPLACEMENT_CHAR;
      replacements += 1;
      index = invalidAt;
      continue;
    }
    if (codePoint < minimum || codePoint > 0x10ffff || isHighSurrogate(codePoint) || isLowSurrogate(codePoint)) {
      text += REPLACEMENT_CHAR;
      replacements += 1;
      index += needed + 1;
      continue;
    }

    text += String.fromCodePoint(codePoint);
    index += needed + 1;
  }

  return { text, replacements };
}

// ── UTF-16 ───────────────────────────────────────────────────────────────────
function encodeUtf16(text: string, littleEndian: boolean): EncodeResult {
  const bytes: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);
    const low = unit & 0xff;
    const high = unit >> 8;
    if (littleEndian) bytes.push(low, high);
    else bytes.push(high, low);
  }
  // Code units are kept exactly, including unpaired surrogates: UTF-16 can
  // carry them, so nothing here is lossy.
  return { bytes: Uint8Array.from(bytes), lossy: [] };
}

function decodeUtf16(bytes: Uint8Array, littleEndian: boolean): DecodeResult {
  let text = "";
  let replacements = 0;
  let index = 0;

  while (index + 1 < bytes.length) {
    const unit = littleEndian
      ? bytes[index] | (bytes[index + 1] << 8)
      : (bytes[index] << 8) | bytes[index + 1];
    index += 2;

    if (isHighSurrogate(unit)) {
      if (index + 1 < bytes.length) {
        const next = littleEndian
          ? bytes[index] | (bytes[index + 1] << 8)
          : (bytes[index] << 8) | bytes[index + 1];
        if (isLowSurrogate(next)) {
          index += 2;
          text += String.fromCharCode(unit, next);
          continue;
        }
      }
      text += REPLACEMENT_CHAR;
      replacements += 1;
      continue;
    }
    if (isLowSurrogate(unit)) {
      text += REPLACEMENT_CHAR;
      replacements += 1;
      continue;
    }
    text += String.fromCharCode(unit);
  }

  // A trailing odd byte cannot form a code unit.
  if (index < bytes.length) {
    text += REPLACEMENT_CHAR;
    replacements += 1;
  }

  return { text, replacements };
}

// ── UTF-32 ───────────────────────────────────────────────────────────────────
function encodeUtf32(text: string, littleEndian: boolean): EncodeResult {
  const bytes: number[] = [];
  const lossy: LossyCharacter[] = [];
  forEachCodePoint(text, (character, index, codePoint) => {
    const value = isHighSurrogate(codePoint) || isLowSurrogate(codePoint) ? REPLACEMENT : codePoint;
    if (value !== codePoint) lossy.push({ character, index, codePoint });
    if (littleEndian) {
      bytes.push(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff);
    } else {
      bytes.push((value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff);
    }
  });
  return { bytes: Uint8Array.from(bytes), lossy };
}

function decodeUtf32(bytes: Uint8Array, littleEndian: boolean): DecodeResult {
  let text = "";
  let replacements = 0;
  const whole = bytes.length - (bytes.length % 4);

  for (let index = 0; index < whole; index += 4) {
    const value = littleEndian
      ? (bytes[index] | (bytes[index + 1] << 8) | (bytes[index + 2] << 16) | (bytes[index + 3] << 24)) >>> 0
      : ((bytes[index] << 24) | (bytes[index + 1] << 16) | (bytes[index + 2] << 8) | bytes[index + 3]) >>> 0;
    if (value > 0x10ffff || isHighSurrogate(value) || isLowSurrogate(value)) {
      text += REPLACEMENT_CHAR;
      replacements += 1;
      continue;
    }
    text += String.fromCodePoint(value);
  }

  // Trailing bytes that cannot form a code point.
  if (whole < bytes.length) {
    text += REPLACEMENT_CHAR;
    replacements += 1;
  }

  return { text, replacements };
}

// ── Single-byte code pages ───────────────────────────────────────────────────
function encodeSingleByte(
  text: string,
  encoding: "windows-1252" | "iso-8859-1" | "us-ascii",
): EncodeResult {
  const bytes: number[] = [];
  const lossy: LossyCharacter[] = [];

  forEachCodePoint(text, (character, index, codePoint) => {
    let byte: number | undefined;
    if (encoding === "us-ascii") byte = codePoint <= 0x7f ? codePoint : undefined;
    else if (encoding === "iso-8859-1") byte = codePoint <= 0xff ? codePoint : undefined;
    else byte = WINDOWS_1252_ENCODE.get(codePoint);

    if (byte === undefined) {
      bytes.push(QUESTION);
      lossy.push({ character, index, codePoint });
    } else {
      bytes.push(byte);
    }
  });

  return { bytes: Uint8Array.from(bytes), lossy };
}

function decodeSingleByte(
  bytes: Uint8Array,
  encoding: "windows-1252" | "iso-8859-1" | "us-ascii",
): DecodeResult {
  let text = "";
  let replacements = 0;

  for (const byte of bytes) {
    if (encoding === "us-ascii" && byte > 0x7f) {
      text += REPLACEMENT_CHAR;
      replacements += 1;
      continue;
    }
    text += String.fromCharCode(encoding === "windows-1252" ? WINDOWS_1252_DECODE[byte] : byte);
  }

  return { text, replacements };
}

// ── Public API ───────────────────────────────────────────────────────────────
/** Encode text in the given encoding; unrepresentable characters become '?'. */
export function encodeText(text: string, encoding: EncodingId): EncodeResult {
  switch (encoding) {
    case "utf-8":
      return encodeUtf8(text);
    case "utf-16le":
      return encodeUtf16(text, true);
    case "utf-16be":
      return encodeUtf16(text, false);
    case "utf-32le":
      return encodeUtf32(text, true);
    case "utf-32be":
      return encodeUtf32(text, false);
    default:
      return encodeSingleByte(text, encoding);
  }
}

/** Decode bytes in the given encoding; invalid sequences become U+FFFD. */
export function decodeBytes(bytes: Uint8Array, encoding: EncodingId): DecodeResult {
  switch (encoding) {
    case "utf-8":
      return decodeUtf8(bytes);
    case "utf-16le":
      return decodeUtf16(bytes, true);
    case "utf-16be":
      return decodeUtf16(bytes, false);
    case "utf-32le":
      return decodeUtf32(bytes, true);
    case "utf-32be":
      return decodeUtf32(bytes, false);
    default:
      return decodeSingleByte(bytes, encoding);
  }
}

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Human-readable byte output in one of the three copyable formats. */
export function formatBytes(bytes: Uint8Array, format: ByteFormat): string {
  if (format === "base64") {
    let out = "";
    for (let index = 0; index < bytes.length; index += 3) {
      const a = bytes[index];
      const b = index + 1 < bytes.length ? bytes[index + 1] : 0;
      const c = index + 2 < bytes.length ? bytes[index + 2] : 0;
      out += BASE64_ALPHABET[a >> 2];
      out += BASE64_ALPHABET[((a & 0x03) << 4) | (b >> 4)];
      out += index + 1 < bytes.length ? BASE64_ALPHABET[((b & 0x0f) << 2) | (c >> 6)] : "=";
      out += index + 2 < bytes.length ? BASE64_ALPHABET[c & 0x3f] : "=";
    }
    return out;
  }

  if (format === "escaped") {
    let out = "";
    for (const byte of bytes) out += `\\x${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    return out;
  }

  const pairs: string[] = [];
  for (const byte of bytes) pairs.push(byte.toString(16).toUpperCase().padStart(2, "0"));
  return pairs.join(" ");
}

/**
 * Parse byte input in the format the user chose. Hex accepts `0x`/`\x`
 * prefixes and any whitespace or comma separators; escaped input must be a run
 * of `\xNN` sequences; Base64 may be padded or bare but must use the standard
 * alphabet.
 */
export function parseBytes(input: string, format: ByteFormat): ParseResult {
  if (format === "base64") {
    const clean = input.replace(/\s+/g, "");
    if (!clean) return { ok: false, error: "Paste Base64 text first." };
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) {
      return { ok: false, error: "Base64 input contains characters outside the standard alphabet." };
    }
    const unpadded = clean.replace(/=+$/, "");
    if (unpadded.length % 4 === 1) {
      return { ok: false, error: "Base64 length is invalid: a group of four characters cannot be completed." };
    }
    const padded = unpadded + "=".repeat((4 - (unpadded.length % 4)) % 4);
    const bytes: number[] = [];
    for (let index = 0; index < padded.length; index += 4) {
      const a = BASE64_ALPHABET.indexOf(padded[index]);
      const b = BASE64_ALPHABET.indexOf(padded[index + 1]);
      const c = padded[index + 2] === "=" ? 0 : BASE64_ALPHABET.indexOf(padded[index + 2]);
      const d = padded[index + 3] === "=" ? 0 : BASE64_ALPHABET.indexOf(padded[index + 3]);
      const chunk = (a << 18) | (b << 12) | (c << 6) | d;
      bytes.push((chunk >> 16) & 0xff);
      if (padded[index + 2] !== "=") bytes.push((chunk >> 8) & 0xff);
      if (padded[index + 3] !== "=") bytes.push(chunk & 0xff);
    }
    return { ok: true, bytes: Uint8Array.from(bytes) };
  }

  if (format === "escaped") {
    const clean = input.replace(/\s+/g, "");
    if (!clean) return { ok: false, error: "Paste escaped bytes first." };
    if (!/^(?:\\x[0-9a-f]{2})+$/i.test(clean)) {
      return { ok: false, error: "Escaped input must be a run of \\xNN byte sequences (for example \\xE9\\x20)." };
    }
    const bytes: number[] = [];
    for (const match of clean.matchAll(/\\x([0-9a-f]{2})/gi)) bytes.push(parseInt(match[1], 16));
    return { ok: true, bytes: Uint8Array.from(bytes) };
  }

  const clean = input.replace(/0x/gi, " ").replace(/\\x/gi, " ").replace(/[\s,;]+/g, "");
  if (!clean) return { ok: false, error: "Paste hex bytes first." };
  if (!/^[0-9a-f]+$/i.test(clean)) {
    return { ok: false, error: "Hex input contains characters that are not hexadecimal digits." };
  }
  if (clean.length % 2 !== 0) {
    return { ok: false, error: "Hex input has an odd number of digits: each byte needs two." };
  }
  const bytes: number[] = [];
  for (let index = 0; index < clean.length; index += 2) {
    bytes.push(parseInt(clean.slice(index, index + 2), 16));
  }
  return { ok: true, bytes: Uint8Array.from(bytes) };
}

/** Code points in a string (an emoji or a combining sequence counts once). */
export function countCodePoints(text: string): number {
  return codePoints(text).length;
}
