/**
 * Batch 17 verification — the REAL compiled format.js/id3.js against
 * hand-constructed byte fixtures and round-trips.
 *
 * Recompile: npx tsc src/domains/audio/lib/format.ts src/domains/audio/lib/id3.ts --outDir scratch/.batch17 --module commonjs --target es2020 --skipLibCheck
 * Run:       node scratch/test-batch17.cjs
 */
"use strict";
const assert = require("assert");
const { detectFormat } = require("./.batch17/format.js");
const { readId3, buildId3Tag, replaceId3Tag } = require("./.batch17/id3.js");

let ok = 0, fail = 0;
function check(name, fn) {
  try { fn(); ok++; console.log(`  ok  ${name}`); }
  catch (e) { fail++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}

// ---------- fixtures ----------
function wavBytes({ channels = 2, sampleRate = 44100, bits = 16, frames = 100, format = 1 }) {
  const dataSize = frames * channels * (bits / 8);
  const len = 44 + dataSize;
  const b = new Uint8Array(len);
  const dv = new DataView(b.buffer);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
  w(0, "RIFF"); dv.setUint32(4, len - 8, true); w(8, "WAVE"); w(12, "fmt ");
  dv.setUint32(16, 16, true); dv.setUint16(20, format, true); dv.setUint16(22, channels, true);
  dv.setUint32(24, sampleRate, true); dv.setUint32(28, sampleRate * channels * bits / 8, true);
  dv.setUint16(32, channels * bits / 8, true); dv.setUint16(34, bits, true);
  w(36, "data"); dv.setUint32(40, dataSize, true);
  return b;
}
function mp3FrameBytes() {
  // MPEG-1 Layer III, 128 kbps, 44.1 kHz, no padding → frame length 417 bytes
  const b = new Uint8Array(417);
  b[0] = 0xff; b[1] = 0xfb; b[2] = 0x90; b[3] = 0x00;
  return b;
}

// ---------- format detection ----------
check("WAV: full header parse (rate, channels, bits, duration, PCM)", () => {
  const info = detectFormat(wavBytes({ channels: 2, sampleRate: 44100, bits: 16, frames: 44100 }));
  assert.strictEqual(info.container, "WAV (RIFF)");
  assert.strictEqual(info.codec, "PCM 16-bit");
  assert.strictEqual(info.sampleRate, 44100);
  assert.strictEqual(info.channels, 2);
  assert.strictEqual(info.bitDepth, 16);
  assert.ok(Math.abs(info.durationSec - 1) < 1e-9);
});

check("WAV: 24-bit mono 48k, float variant codec naming", () => {
  const i24 = detectFormat(wavBytes({ channels: 1, sampleRate: 48000, bits: 24 }));
  assert.strictEqual(i24.codec, "PCM 24-bit");
  assert.strictEqual(i24.channels, 1);
  const flt = detectFormat(wavBytes({ format: 3, bits: 32 }));
  assert.strictEqual(flt.codec, "IEEE float 32-bit");
});

check("MP3: frame sync parses MPEG-1 Layer III 44.1k stereo; ID3-prefixed too", () => {
  const raw = detectFormat(mp3FrameBytes());
  assert.strictEqual(raw.container, "MP3 (MPEG audio)");
  assert.strictEqual(raw.codec, "MPEG-1 Layer III");
  assert.strictEqual(raw.sampleRate, 44100);
  assert.strictEqual(raw.channels, 2);
  // with an ID3v2 header in front
  const tag = buildId3Tag({ version: 3, title: "T" });
  const withTag = new Uint8Array(tag.length + 417);
  withTag.set(tag, 0);
  withTag.set(mp3FrameBytes(), tag.length);
  const info = detectFormat(withTag);
  assert.strictEqual(info.container, "MP3 (ID3v2 + MPEG)");
  assert.strictEqual(info.sampleRate, 44100);
});

check("unknown bytes → null", () => {
  assert.strictEqual(detectFormat(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])), null);
  assert.strictEqual(detectFormat(new Uint8Array(5)), null);
});

check("OGG Vorbis identification channel/rate", () => {
  const b = new Uint8Array(64);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
  w(0, "OggS");
  w(28, "\x01vorbis");
  b[39] = 2; // channels
  new DataView(b.buffer).setUint32(40, 44100, true);
  const info = detectFormat(b);
  assert.strictEqual(info.container, "OGG");
  assert.strictEqual(info.codec, "Vorbis");
  assert.strictEqual(info.channels, 2);
  assert.strictEqual(info.sampleRate, 44100);
});

check("WebM EBML + Opus CodecID", () => {
  const head = [0x1a, 0x45, 0xdf, 0xa3];
  const rest = [..."A_OPUS..."].map((c) => c.charCodeAt(0));
  const info = detectFormat(new Uint8Array([...head, ...rest]));
  assert.strictEqual(info.container, "WebM/Matroska");
  assert.strictEqual(info.codec, "Opus");
});

// ---------- ID3 round-trips ----------
check("buildId3Tag → readId3 round-trip: text fields survive byte-exactly", () => {
  const tag = buildId3Tag({ version: 3, title: "Episode 12", artist: "Racira", album: "The Show", year: "2026", genre: "Podcast", comment: "hello world" });
  const tags = readId3(tag);
  assert.strictEqual(tags.title, "Episode 12");
  assert.strictEqual(tags.artist, "Racira");
  assert.strictEqual(tags.album, "The Show");
  assert.strictEqual(tags.year, "2026");
  assert.strictEqual(tags.genre, "Podcast");
  assert.strictEqual(tags.comment, "hello world");
  assert.deepStrictEqual(tags.version, [3, 0]);
});

check("v2.4 round-trip and TDRC year frame", () => {
  const tag = buildId3Tag({ version: 4, title: "V4", year: "2026-01-02" });
  const tags = readId3(tag);
  assert.deepStrictEqual(tags.version, [4, 0]);
  assert.strictEqual(tags.title, "V4");
  assert.strictEqual(tags.year, "2026-01-02");
});

check("chapters round-trip: CHAP frames with titles and times", () => {
  const chapters = [
    { id: "chp1", title: "Intro", startMs: 0, endMs: 45000 },
    { id: "chp2", title: "Interview", startMs: 45000, endMs: 600000 },
  ];
  const tag = buildId3Tag({ version: 3, title: "Ep", chapters });
  const tags = readId3(tag);
  assert.strictEqual(tags.chapters.length, 2);
  assert.strictEqual(tags.chapters[0].title, "Intro");
  assert.strictEqual(tags.chapters[0].startMs, 0);
  assert.strictEqual(tags.chapters[0].endMs, 45000);
  assert.strictEqual(tags.chapters[1].title, "Interview");
  assert.strictEqual(tags.chapters[1].startMs, 45000);
  assert.strictEqual(tags.chapters[1].endMs, 600000);
});

check("replaceId3Tag: strips old tag, writes new one, audio payload untouched", () => {
  const mp3 = mp3FrameBytes();
  const original = new Uint8Array(10 + 300 + mp3.length); // old 310-byte ID3 + audio
  original[0] = 0x49; original[1] = 0x44; original[2] = 0x33; original[3] = 3;
  original[6] = 0; original[7] = 0; original[8] = 1; original[9] = 0x2c; // syncsafe 300
  // mark old tag body with a sentinel
  original[20] = 0xaa;
  original.set(mp3, 310);
  const out = replaceId3Tag(original, { version: 3, title: "New Title" });
  const tags = readId3(out);
  assert.strictEqual(tags.title, "New Title");
  assert.strictEqual(tags.artist, null); // old frame gone
  // audio payload byte-identical
  const audioStart = out.length - mp3.length;
  for (let i = 0; i < mp3.length; i++) {
    assert.strictEqual(out[audioStart + i], mp3[i]);
  }
});

check("no existing tag → replaceId3Tag still prepends correctly", () => {
  const mp3 = mp3FrameBytes();
  const out = replaceId3Tag(mp3, { version: 3, title: "Fresh" });
  const tags = readId3(out);
  assert.strictEqual(tags.title, "Fresh");
  assert.strictEqual(out.length - mp3.length >= 10, true);
});

check("non-ID3 input → readId3 null", () => {
  assert.strictEqual(readId3(new Uint8Array([0xff, 0xfb, 0x90, 0, 0, 0, 0, 0, 0, 0])), null);
});


// ---------- formatTimestamp / parseTimestamp (Batch 17 additions) ----------
{
  const { formatTimestamp, parseTimestamp } = require("./.batch17/calc.js");
  check("formatTimestamp basics", () => {
    assert.strictEqual(formatTimestamp(0), "0:00");
    assert.strictEqual(formatTimestamp(59.9), "0:59");
    assert.strictEqual(formatTimestamp(60), "1:00");
    assert.strictEqual(formatTimestamp(754), "12:34");
    assert.strictEqual(formatTimestamp(3600), "1:00:00");
    assert.strictEqual(formatTimestamp(754, true), "0:12:34");
  });
  check("parseTimestamp inverse", () => {
    assert.strictEqual(parseTimestamp("12:34"), 754);
    assert.strictEqual(parseTimestamp("1:00:00"), 3600);
    assert.strictEqual(parseTimestamp("45"), 45);
    assert.strictEqual(parseTimestamp("bad"), null);
    assert.strictEqual(parseTimestamp("1:2:3:4"), null);
  });
}

console.log(`
${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
