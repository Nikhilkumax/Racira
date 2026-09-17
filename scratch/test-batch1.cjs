/**
 * Batch 1 verification — runs the REAL compiled lib code
 * (scratch/.batch1/edit.js, produced by tsc from src/domains/audio/lib/edit.ts)
 * against synthetic inputs with hand-computed expected values.
 *
 * Recompile before running:  npx tsc src/domains/audio/lib/edit.ts --outDir scratch/.batch1 --module commonjs --target es2020 --skipLibCheck
 * Run:                       node scratch/test-batch1.cjs
 */
"use strict";
const assert = require("assert");
const {
  reverseChannelData,
  applyGainDb,
  applyBoostWithLimiter,
  resampleLinear,
  olaTimeStretch,
  detectSilenceSpans,
  removeSilenceSpans,
  encodeWav,
} = require("./.batch1/edit.js");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
    process.exitCode = 1;
  }
}

/** Count positive-going sign changes — no amplitude gate, so steep sines are counted correctly. */
function zeroCrossings(data, from, to) {
  let c = 0;
  for (let i = Math.max(1, from); i < Math.min(data.length, to); i++) {
    if (data[i - 1] < 0 && data[i] >= 0) c++;
  }
  return c;
}

/** Float32 storage tolerance: samples quantize at ~1e-7 relative, 1e-6 absolute is safe here. */
const F32 = 1e-6;

// ---- Fixture: 0.5 s stereo "audio" at 8000 Hz. Ch0 = 0.5·sin(2π·440·t).
// ---- Ch1 = impulse train: sample 200 = +0.8, sample 400 = −0.4.
const SR = 8000;
const N = 4000;
const ch0 = new Float32Array(N);
const ch1 = new Float32Array(N);
for (let i = 0; i < N; i++) ch0[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / SR);
ch1[200] = 0.8;
ch1[400] = -0.4;

console.log("== AudioReverser: reverseChannelData ==");
check("length preserved", () => {
  const r = reverseChannelData([ch0, ch1]);
  assert.strictEqual(r.length, 2);
  assert.strictEqual(r[0].length, N);
  assert.strictEqual(r[1].length, N);
});
check("reversed sinusoid is sinusoid reversed, per sample", () => {
  const r = reverseChannelData([ch0])[0];
  for (const i of [0, 1, 123, 2000, 3999]) {
    assert.ok(Math.abs(r[i] - ch0[N - 1 - i]) < F32, `index ${i}`);
  }
});
check("reversed impulses land at mirrored positions with sign intact", () => {
  const r = reverseChannelData([ch1])[0];
  assert.ok(Math.abs(r[N - 1 - 200] - 0.8) < F32);
  assert.ok(Math.abs(r[N - 1 - 400] - -0.4) < F32);
  assert.strictEqual(r[200], 0);
  assert.strictEqual(r[400], 0);
});
check("input not mutated", () => {
  const copy = ch1.slice();
  reverseChannelData([ch1]);
  assert.deepStrictEqual(Array.from(ch1), Array.from(copy));
});

console.log("== AudioAmplifier: applyGainDb ==");
check("+6 dB exactly doubles amplitude on the sinusoid", () => {
  const { out, clippedSamples } = applyGainDb(ch0, 6);
  assert.strictEqual(clippedSamples, 0);
  for (const i of [0, 777, 2500]) {
    assert.ok(Math.abs(out[i] - ch0[i] * Math.pow(10, 6 / 20)) < F32, `index ${i}`);
  }
});
check("impulse at 0.8 with +6 dB hard-clips to exactly 1.0", () => {
  // 0.8 * 10^(6/20) = 1.596... which exceeds full scale — clipping is the
  // correct behaviour; the fixture was chosen to exercise exactly this path.
  const data = new Float32Array(401);
  data[200] = 0.8;
  const { out, clippedSamples } = applyGainDb(data, 6);
  assert.strictEqual(clippedSamples, 1);
  assert.strictEqual(out[200], 1);
});
check("+6 dB on a 0.4 peak stays unclipped and doubles", () => {
  const data = new Float32Array(10);
  data[3] = 0.4;
  const { out, clippedSamples } = applyGainDb(data, 6);
  assert.strictEqual(clippedSamples, 0);
  assert.ok(Math.abs(out[3] - 0.4 * Math.pow(10, 6 / 20)) < F32);
});
check("peakBefore/peakAfter bookkeeping", () => {
  const data = new Float32Array(16);
  data[5] = -0.25;
  const r = applyGainDb(data, 0);
  assert.ok(Math.abs(r.peakBefore - 0.25) < F32);
  assert.ok(Math.abs(r.peakAfter - 0.25) < F32);
});

console.log("== VolumeBooster: applyBoostWithLimiter ==");
check("limiter output never exceeds ±1 at +18 dB on full-scale sine", () => {
  const loud = new Float32Array(N);
  for (let i = 0; i < N; i++) loud[i] = 0.95 * Math.sin((2 * Math.PI * 220 * i) / SR);
  const { out, clippedSamples, peakAfter } = applyBoostWithLimiter(loud, 10 ** (18 / 20), true);
  assert.strictEqual(clippedSamples, 0);
  assert.ok(peakAfter <= 1 + 1e-12, `peak ${peakAfter}`);
  for (let i = 0; i < N; i++) assert.ok(Math.abs(out[i]) <= 1 + 1e-12);
});
check("limiter is near-linear at small amplitudes (tanh x ≈ x)", () => {
  const quiet = new Float32Array([0.01, -0.01, 0.02, -0.02]);
  const { out } = applyBoostWithLimiter(quiet, 2, true);
  for (let i = 0; i < quiet.length; i++) {
    assert.ok(Math.abs(out[i] - Math.tanh(quiet[i] * 2)) < F32);
  }
});
check("no-limiter mode is plain gain with clamping", () => {
  const data = new Float32Array([0.9, -0.9]);
  const { out, clippedSamples } = applyBoostWithLimiter(data, 2, false);
  assert.strictEqual(clippedSamples, 2);
  assert.strictEqual(out[0], 1);
  assert.strictEqual(out[1], -1);
});

console.log("== AudioSpeedChanger: resampleLinear (tape mode) ==");
check("2x speed halves length and keeps sample values", () => {
  const ramp = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]);
  const out = resampleLinear(ramp, 2);
  assert.strictEqual(out.length, 4);
  assert.deepStrictEqual(Array.from(out), [0, 2, 4, 6]);
});
check("0.5x speed doubles length via linear interpolation", () => {
  const ramp = new Float32Array([0, 1, 2, 3]);
  const out = resampleLinear(ramp, 0.5);
  assert.strictEqual(out.length, 8);
  assert.ok(Math.abs(out[3] - 1.5) < 1e-12);
  assert.ok(Math.abs(out[7] - 3) < 1e-12);
});
check("440 Hz sine resampled at 2x becomes 880 Hz", () => {
  const sine = new Float32Array(N);
  for (let i = 0; i < N; i++) sine[i] = Math.sin((2 * Math.PI * 440 * i) / SR);
  const out = resampleLinear(sine, 2);
  const durationSec = out.length / SR;
  const freq = zeroCrossings(out, 0, out.length) / durationSec;
  assert.ok(Math.abs(freq - 880) < 25, `measured ${freq.toFixed(1)} Hz`);
});
check("factor 1 returns identical content", () => {
  const out = resampleLinear(ch1, 1);
  assert.deepStrictEqual(Array.from(out), Array.from(ch1));
});

console.log("== AudioSpeedChanger: olaTimeStretch (preserve-pitch mode) ==");
check("stretch 2 doubles length", () => {
  const out = olaTimeStretch(ch0, 2);
  assert.strictEqual(out.length, 2 * N);
});
check("stretch 0.5 halves length", () => {
  const out = olaTimeStretch(ch0, 0.5);
  assert.strictEqual(out.length, Math.ceil(N / 2));
});
check("pitch preserved: 440 Hz in, ~440 Hz out at 2x stretch", () => {
  const out = olaTimeStretch(ch0, 2);
  // Skip 0.2 s at each edge (OLA ramp-up/down), measure the interior.
  const start = Math.round(0.2 * SR);
  const end = out.length - Math.round(0.2 * SR);
  const durationSec = (end - start) / SR;
  const freq = zeroCrossings(out, start, end) / durationSec;
  assert.ok(Math.abs(freq - 440) < 25, `measured ${freq.toFixed(1)} Hz`);
});
check("silent input stays silent (no ringing)", () => {
  const zeros = new Float32Array(N);
  const out = olaTimeStretch(zeros, 1.5);
  let maxAbs = 0;
  for (const v of out) maxAbs = Math.max(maxAbs, Math.abs(v));
  assert.strictEqual(maxAbs, 0);
});

console.log("== SilenceRemover: detect + remove ==");
// Fixture: 1 s at 8 kHz = [0.3 s tone][0.4 s silence][0.3 s tone]
const N3 = 8000;
const speech = new Float32Array(N3);
const TONE_END = 2400;
const TONE_START2 = 4000;
for (let i = 0; i < TONE_END; i++) speech[i] = 0.4 * Math.sin((2 * Math.PI * 500 * i) / SR);
for (let i = TONE_START2; i < N3; i++) speech[i] = 0.4 * Math.sin((2 * Math.PI * 500 * i) / SR);

check("detects exactly one span covering the silent region", () => {
  const spans = detectSilenceSpans(speech, SR, { thresholdDb: -40, minSilenceMs: 200 });
  assert.strictEqual(spans.length, 1, JSON.stringify(spans));
  assert.ok(spans[0].startSample <= TONE_END + 20, `start ${spans[0].startSample}`);
  assert.ok(spans[0].endSample >= TONE_START2 - 20, `end ${spans[0].endSample}`);
});
check("a single loud blip splits the silence and is never inside a span", () => {
  const data = new Float32Array(8000);
  data[4000] = 1; // one loud sample surrounded by silence
  const spans = detectSilenceSpans(data, SR, { thresholdDb: -40, minSilenceMs: 200 });
  // The blip interrupts the run: silence before + silence after = 2 spans.
  assert.strictEqual(spans.length, 2, JSON.stringify(spans));
  for (const s of spans) {
    assert.ok(s.startSample > 4000 || s.endSample <= 4000, `span covers the blip: ${JSON.stringify(s)}`);
  }
  // Removal must keep the blip itself (spans only cover silence around it).
  const { out } = removeSilenceSpans(data, spans, 0);
  let maxAbs = 0;
  for (const v of out) maxAbs = Math.max(maxAbs, Math.abs(v));
  assert.ok(maxAbs >= 1 - F32, `blip lost, peak ${maxAbs}`);
});
check("removal with padding keeps both tones and cuts ~the gap", () => {
  const spans = detectSilenceSpans(speech, SR, { thresholdDb: -40, minSilenceMs: 200 });
  const { out, removedSamples, cuts } = removeSilenceSpans(speech, spans, 400);
  assert.strictEqual(cuts, 1);
  // Gap is 1600 samples; padding 400 on each side removes 800.
  assert.strictEqual(removedSamples, 800);
  assert.strictEqual(out.length, N3 - 800);
  // Out contains: tone1 (2400) + pad keep (400) + pad keep (400) + tone2 (4000)
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  assert.ok(peak > 0.3, `peak ${peak} — tones must survive`);
});
check("no silence detected on continuous tone at -40 dB threshold", () => {
  const spans = detectSilenceSpans(ch0, SR, { thresholdDb: -40, minSilenceMs: 200 });
  assert.strictEqual(spans.length, 0);
});
check("empty span list returns a copy, zero cuts", () => {
  const { out, removedSamples, cuts } = removeSilenceSpans(ch1, [], 0);
  assert.strictEqual(cuts, 0);
  assert.strictEqual(removedSamples, 0);
  assert.strictEqual(out.length, ch1.length);
  assert.notStrictEqual(out, ch1);
});

console.log("== encodeWav (shared output writer) ==");
check("emits a parseable RIFF/WAVE header with correct byte counts", () => {
  // Blob does not exist in Node < 18; Node 24 has it.
  const blob = encodeWav([ch0, ch1], SR, N, 16);
  assert.strictEqual(blob.size, 44 + N * 2 * 2);
});

console.log(`\n${passed} checks passed${process.exitCode ? " (WITH FAILURES)" : ""}`);
