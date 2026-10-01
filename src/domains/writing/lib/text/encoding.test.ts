/**
 * Unit tests for the in-house character codecs.
 *
 * Every reference vector here is a byte sequence that can be checked against
 * the Unicode standard or the WHATWG Encoding tables by hand: "é" is C3 A9 in
 * UTF-8, U+20AC is 0x80 in Windows-1252, a surrogate pair is four UTF-16
 * bytes. The lossy and replacement counters are asserted explicitly because
 * the tool's whole claim is that it reports what a conversion cannot carry.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ENCODINGS,
  countCodePoints,
  decodeBytes,
  encodeText,
  formatBytes,
  parseBytes,
  type EncodingId,
} from "./encoding.ts";

const hex = (bytes: Uint8Array): string =>
  [...bytes].map((byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join(" ");

const bytes = (...values: number[]): Uint8Array => Uint8Array.from(values);

test("encodeText: UTF-8 reference vectors", () => {
  assert.equal(hex(encodeText("A", "utf-8").bytes), "41");
  assert.equal(hex(encodeText("é", "utf-8").bytes), "C3 A9", "é is U+00E9");
  assert.equal(hex(encodeText("€", "utf-8").bytes), "E2 82 AC", "€ is U+20AC");
  assert.equal(hex(encodeText("😀", "utf-8").bytes), "F0 9F 98 80", "😀 is U+1F600, four bytes");
  assert.equal(encodeText("😀", "utf-8").lossy.length, 0);
});

test("encodeText: UTF-16 little- and big-endian", () => {
  assert.equal(hex(encodeText("A", "utf-16le").bytes), "41 00");
  assert.equal(hex(encodeText("A", "utf-16be").bytes), "00 41");
  assert.equal(hex(encodeText("é", "utf-16le").bytes), "E9 00");
  assert.equal(hex(encodeText("é", "utf-16be").bytes), "00 E9");
  // U+1F600 is D83D DE00 as a surrogate pair.
  assert.equal(hex(encodeText("😀", "utf-16le").bytes), "3D D8 00 DE");
  assert.equal(hex(encodeText("😀", "utf-16be").bytes), "D8 3D DE 00");
});

test("encodeText: UTF-32 little- and big-endian", () => {
  assert.equal(hex(encodeText("é", "utf-32le").bytes), "E9 00 00 00");
  assert.equal(hex(encodeText("é", "utf-32be").bytes), "00 00 00 E9");
  assert.equal(hex(encodeText("😀", "utf-32le").bytes), "00 F6 01 00", "U+1F600 little-endian");
  assert.equal(hex(encodeText("😀", "utf-32be").bytes), "00 01 F6 00");
});

test("encodeText: Windows-1252 high block uses the documented code points", () => {
  const cases: [string, string][] = [
    ["é", "E9"],
    ["€", "80"],
    ["\u201c", "93"], // left double quotation mark
    ["\u2014", "97"], // em dash
    ["\u2122", "99"], // trade mark sign
    ["\u0160", "8A"], // S with caron
  ];
  for (const [character, expected] of cases) {
    const result = encodeText(character, "windows-1252");
    assert.equal(hex(result.bytes), expected, `${character} should be ${expected}`);
    assert.equal(result.lossy.length, 0);
  }
});

test("encodeText: ISO-8859-1 and US-ASCII replace what they cannot carry", () => {
  const latin = encodeText("café", "iso-8859-1");
  assert.equal(hex(latin.bytes), "63 61 66 E9");
  assert.equal(latin.lossy.length, 0);

  const latinEuro = encodeText("a€b", "iso-8859-1");
  assert.equal(hex(latinEuro.bytes), "61 3F 62", "€ becomes '?' in Latin-1");
  assert.deepEqual(
    latinEuro.lossy.map((entry) => [entry.character, entry.index, entry.codePoint]),
    [["€", 1, 0x20ac]],
  );

  assert.equal(hex(encodeText("Hi", "us-ascii").bytes), "48 69");
  const ascii = encodeText("é", "us-ascii");
  assert.equal(hex(ascii.bytes), "3F");
  assert.equal(ascii.lossy.length, 1);
  assert.equal(ascii.lossy[0].character, "é");

  // One '?' per code point, not per UTF-16 unit.
  assert.equal(hex(encodeText("😀", "windows-1252").bytes), "3F");
  assert.equal(encodeText("😀", "us-ascii").lossy.length, 1);
});

test("encodeText: lone surrogates are reported where the encoding cannot carry them", () => {
  const utf8 = encodeText("\uD83D", "utf-8");
  assert.equal(hex(utf8.bytes), "EF BF BD", "a lone high surrogate becomes U+FFFD");
  assert.deepEqual(
    utf8.lossy.map((entry) => [entry.index, entry.codePoint]),
    [[0, 0xd83d]],
  );

  // UTF-16 reproduces code units exactly, so a lone surrogate is not lossy there.
  const utf16 = encodeText("\uD83D", "utf-16le");
  assert.equal(hex(utf16.bytes), "3D D8");
  assert.equal(utf16.lossy.length, 0);

  const utf32 = encodeText("\uD83D", "utf-32le");
  assert.equal(hex(utf32.bytes), "FD FF 00 00", "UTF-32 uses U+FFFD for a surrogate");
  assert.equal(utf32.lossy.length, 1);
});

test("decodeBytes: invalid input yields U+FFFD and counts replacements", () => {
  assert.equal(decodeBytes(bytes(0xff), "utf-8").text, "\uFFFD");
  assert.equal(decodeBytes(bytes(0xff), "utf-8").replacements, 1);

  // Truncated three-byte sequence: one replacement for the maximal subpart.
  const truncated = decodeBytes(bytes(0xe2, 0x82), "utf-8");
  assert.equal(truncated.text, "\uFFFD");
  assert.equal(truncated.replacements, 1);

  // Overlong lead byte, then an orphan continuation byte: two replacements.
  const overlong = decodeBytes(bytes(0xc0, 0xaf), "utf-8");
  assert.equal(overlong.text, "\uFFFD\uFFFD");
  assert.equal(overlong.replacements, 2);

  // Strict US-ASCII flags high bytes instead of silently decoding them.
  const latin = decodeBytes(bytes(0x48, 0xff), "us-ascii");
  assert.equal(latin.text, "H\uFFFD");
  assert.equal(latin.replacements, 1);

  // A surrogate that never pairs, and an odd trailing byte in UTF-16.
  assert.equal(decodeBytes(bytes(0x3d, 0xd8), "utf-16le").replacements, 1);
  assert.equal(decodeBytes(bytes(0x3d, 0xd8, 0x00), "utf-16le").replacements, 2);
  assert.equal(decodeBytes(bytes(0x3d, 0xd8, 0x00, 0xde), "utf-16le").text, "😀");

  // An out-of-range UTF-32 value and trailing bytes.
  assert.equal(decodeBytes(bytes(0x00, 0x11, 0x00, 0x00), "utf-32be").replacements, 1, "0x00110000 exceeds U+10FFFF");
  assert.equal(decodeBytes(bytes(0x41, 0x00, 0x00, 0x00, 0x42), "utf-32le").replacements, 1);
});

test("round trips: every encoding reproduces text it can represent", () => {
  const sample = "Hello, café — €10 😀";
  for (const encoding of ["utf-8", "utf-16le", "utf-16be", "utf-32le", "utf-32be"] as const) {
    const encoded = encodeText(sample, encoding);
    assert.equal(encoded.lossy.length, 0, `${encoding} is lossless for this sample`);
    const decoded = decodeBytes(encoded.bytes, encoding);
    assert.equal(decoded.text, sample, `${encoding} round trip`);
    assert.equal(decoded.replacements, 0);
  }

  const cp1252 = encodeText("Hello, café — €10", "windows-1252");
  assert.equal(decodeBytes(cp1252.bytes, "windows-1252").text, "Hello, café — €10");

  const latin = encodeText("Ça va, déjà vu?", "iso-8859-1");
  assert.equal(decodeBytes(latin.bytes, "iso-8859-1").text, "Ça va, déjà vu?");

  const ascii = encodeText("plain text 123", "us-ascii");
  assert.equal(decodeBytes(ascii.bytes, "us-ascii").text, "plain text 123");
});

test("formatBytes: hex, escaped and Base64 reference vectors", () => {
  const a = bytes(0xc3, 0xa9, 0x20);
  assert.equal(formatBytes(a, "hex"), "C3 A9 20");
  assert.equal(formatBytes(a, "escaped"), "\\xC3\\xA9\\x20");
  assert.equal(formatBytes(a, "base64"), "w6kg");

  assert.equal(formatBytes(bytes(0x41), "base64"), "QQ==");
  assert.equal(formatBytes(bytes(0x41, 0x42), "base64"), "QUI=");
  assert.equal(formatBytes(bytes(0x41, 0x42, 0x43), "base64"), "QUJD");
  assert.equal(formatBytes(bytes(), "hex"), "");
});

test("parseBytes: the three formats, with separators and without padding", () => {
  const expected = bytes(0xc3, 0xa9);

  for (const input of ["C3 A9", "c3a9", "0xC3, 0xA9", "C3\nA9"]) {
    const parsed = parseBytes(input, "hex");
    assert.ok(parsed.ok, `hex input ${JSON.stringify(input)} should parse`);
    assert.equal(hex(parsed.bytes), "C3 A9");
  }

  const escaped = parseBytes("\\xC3\\xA9", "escaped");
  assert.ok(escaped.ok);
  assert.equal(hex(escaped.bytes), "C3 A9");

  for (const input of ["w6k=", "w6k", "  w6k=  "]) {
    const parsed = parseBytes(input, "base64");
    assert.ok(parsed.ok, `base64 input ${JSON.stringify(input)} should parse`);
    assert.equal(hex(parsed.bytes), "C3 A9");
  }

  const raw = parseBytes("00 FF", "hex");
  assert.ok(raw.ok);
  assert.equal(hex(raw.bytes), "00 FF");
});

test("parseBytes: malformed input is refused with a stated reason", () => {
  assert.equal(parseBytes("ABC", "hex").ok, false, "odd number of hex digits");
  assert.equal(parseBytes("ZZ", "hex").ok, false, "not hexadecimal");
  assert.equal(parseBytes("", "hex").ok, false);
  assert.equal(parseBytes("E9", "escaped").ok, false, "escaped input needs \\x prefixes");
  assert.equal(parseBytes("!!!!", "base64").ok, false);
  assert.equal(parseBytes("A", "base64").ok, false, "a lone Base64 character cannot form a byte");
  assert.equal(parseBytes("", "base64").ok, false);

  const parsed = parseBytes("C3 A9", "hex");
  assert.ok(parsed.ok);
  const refused = parseBytes("nope", "hex");
  assert.ok(!refused.ok);
  assert.ok(refused.error.length > 10, "refusals explain themselves");
});

test("ENCODINGS lists every id exactly once, with a label and detail", () => {
  const ids = ENCODINGS.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const entry of ENCODINGS) {
    assert.ok(entry.label.length > 0);
    assert.ok(entry.detail.length > 20, `${entry.id} explains itself`);
  }
  const all: EncodingId[] = [
    "utf-8",
    "utf-16le",
    "utf-16be",
    "utf-32le",
    "utf-32be",
    "windows-1252",
    "iso-8859-1",
    "us-ascii",
  ];
  assert.deepEqual([...ids].sort(), [...all].sort());
});

test("countCodePoints counts an emoji once", () => {
  assert.equal(countCodePoints("a😀b"), 3);
  assert.equal(countCodePoints("é"), 1);
  assert.equal(countCodePoints(""), 0);
});
