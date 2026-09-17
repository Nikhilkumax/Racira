/**
 * Batch 13–14 verification — the REAL compiled calc.js, new functions only
 * (B11 tests remain the regression suite for the earlier functions).
 *
 * Recompile: npx tsc src/domains/audio/lib/calc.ts --outDir scratch/.batch13 --module commonjs --target es2020 --skipLibCheck
 * Run:       node scratch/test-batch13.cjs
 */
"use strict";
const assert = require("assert");
const {
  timeSigBeatMs, barsToSeconds, secondsToBars,
  nyquistMinRate, maxCapturedFreq,
  bitDepthDynamicRange, bitsForDynamicRange,
  pcmFileSizeBytes, lossyFileSizeBytes,
  streamBandwidthKbps, monthlyTransferGB,
  centsToRatio, freqAfterCents, playbackSpeedStats,
  midiToFreq, freqToMidi, centsBetween,
} = require("./.batch13/calc.js");

let ok = 0, fail = 0;
function check(name, fn) {
  try { fn(); ok++; console.log(`  ok  ${name}`); }
  catch (e) { fail++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const close = (a, b, eps) => Math.abs(a - b) < (eps ?? 1e-9);

// ---------- B13 ----------
check("timeSig: 120 BPM 4/4 → 500 ms beat; 1 bar = 2 s; 6/8 beat = 250 ms", () => {
  assert.ok(close(timeSigBeatMs(120, 4), 500));
  assert.ok(close(barsToSeconds(120, 4, 4, 1), 2));
  assert.ok(close(barsToSeconds(120, 4, 4, 16), 32));
  assert.ok(close(timeSigBeatMs(120, 8), 250));
  assert.ok(close(barsToSeconds(120, 6, 8, 1), 1.5));
  assert.ok(close(secondsToBars(120, 4, 4, 30), 15));
});

check("nyquist: 20 kHz audio needs 40 kHz; 48 kHz captures 24 kHz", () => {
  assert.ok(close(nyquistMinRate(20000), 40000));
  assert.ok(close(maxCapturedFreq(48000), 24000));
  assert.strictEqual(nyquistMinRate(0), 0);
});

check("bit depth: 16-bit ≈ 98.08 dB, 24-bit ≈ 146.24 dB; inverse works", () => {
  assert.ok(close(bitDepthDynamicRange(16), 98.08, 1e-9));
  assert.ok(close(bitDepthDynamicRange(24), 146.24, 1e-9));
  assert.ok(close(bitsForDynamicRange(98.08), 16, 1e-6));
  assert.ok(close(bitsForDynamicRange(bitDepthDynamicRange(20)), 20, 1e-9));
});

check("file size: 3 min stereo 44.1k/16 ≈ 31.75 MB; MP3 320 ≈ 7.2 MB", () => {
  const bytes = pcmFileSizeBytes(180, 44100, 2, 16);
  assert.strictEqual(bytes, 180 * 44100 * 2 * 2);
  assert.ok(close(bytes / (1024 * 1024), 30.28, 0.01)); // MiB
  assert.strictEqual(lossyFileSizeBytes(180, 320), 7_200_000);
  assert.strictEqual(pcmFileSizeBytes(0, 44100, 2, 16), 0);
});

// ---------- B14 ----------
check("streaming: 500 listeners @128 kbps = 64 Mbps = 64,000 kbps", () => {
  assert.ok(close(streamBandwidthKbps(500, 128), 64000));
  const gb = monthlyTransferGB(500, 128, 4, 30);
  // 8000 kB/s × 4 h × 3600 s × 30 d = 3,456,000,000 kB → 3456 GB... verify:
  const expected = ((500 * 128 * 1000) / 8) * 3600 * 4 * 30 / 1e9;
  assert.ok(close(gb, expected, 1e-9));
  assert.ok(close(expected, 3456, 1e-6));
});

check("cents: 100 cents ratio = semitone; 1200 = octave; freqAfterCents", () => {
  assert.ok(close(centsToRatio(100), Math.pow(2, 1 / 12), 1e-12));
  assert.ok(close(centsToRatio(1200), 2));
  assert.ok(close(freqAfterCents(440, 1200), 880));
  assert.ok(close(freqAfterCents(440, -100), 440 / Math.pow(2, 1 / 12), 1e-9));
  assert.strictEqual(freqAfterCents(0, 100), 0);
});

check("MIDI↔freq consistency with existing functions", () => {
  assert.ok(close(midiToFreq(60), 261.6255653005986, 1e-9));
  assert.ok(close(freqToMidi(midiToFreq(72)), 72, 1e-9));
  assert.ok(close(centsBetween(261.6255653005986, 523.2511306011972), 1200, 1e-6));
});

check("playback speed: speed=2 halves duration and raises pitch +12 semitones", () => {
  const s1 = playbackSpeedStats(180, { speed: 2 });
  assert.ok(close(s1.newDurationSec, 90));
  assert.ok(close(s1.semitones, 12, 1e-9));
  const s2 = playbackSpeedStats(180, { newDurationSec: 240 });
  assert.ok(close(s2.speed, 0.75));
  assert.ok(close(s2.semitones, 12 * Math.log2(0.75), 1e-9));
  assert.strictEqual(playbackSpeedStats(0, { speed: 2 }), null);
  assert.strictEqual(playbackSpeedStats(180, {}), null);
});

console.log(`\n${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
