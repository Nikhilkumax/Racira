/**
 * Batch 5 verification — runs the REAL compiled lib code
 * (scratch/.batch5/analyze.js, produced by tsc from
 * src/domains/audio/lib/analyze.ts) against synthetic inputs with
 * hand-computed expected values.
 *
 * Recompile before running:
 *   npx tsc src/domains/audio/lib/analyze.ts --outDir scratch/.batch5 --module commonjs --target es2020 --skipLibCheck
 * Run: node scratch/test-batch5.cjs
 */
"use strict";
const assert = require("assert");
const {
  fftRadix2,
  computeSpectrum,
  computeWaveformPeaks,
  computeRmsStats,
  computeFrequencyTimeline,
  findLoudestWindow,
  computeAverageSpectrum,
  segmentFrequencyTimeline,
} = require("./.batch5/analyze.js");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err) {
    console.error(`FAIL  ${name}`);
    console.error(err && err.stack ? err.stack.split("\n").slice(0, 4).join("\n") : err);
    process.exitCode = 1;
  }
}

// ---------- FFT identity / orthogonality ----------
check("FFT: DC constant → only bin 0 nonzero", () => {
  const n = 8;
  const re = new Float64Array(n).fill(1);
  const im = new Float64Array(n);
  fftRadix2(re, im);
  assert.strictEqual(re[0], 8);
  assert.strictEqual(im[0], 0);
  for (let k = 1; k < n; k++) {
    assert.ok(Math.abs(re[k]) < 1e-9, `re[${k}]=${re[k]}`);
    assert.ok(Math.abs(im[k]) < 1e-9, `im[${k}]=${im[k]}`);
  }
});

check("FFT: DFT matrix check at n=8 vs naive DFT", () => {
  const n = 8;
  const x = [0.5, -0.25, 0.1, 0.9, -0.7, 0.3, -0.6, 0.2];
  const re = new Float64Array(x);
  const im = new Float64Array(n);
  fftRadix2(re, im);
  for (let k = 0; k < n; k++) {
    let sr = 0, si = 0;
    for (let t = 0; t < n; t++) {
      sr += x[t] * Math.cos((2 * Math.PI * k * t) / n);
      si += x[t] * Math.sin((2 * Math.PI * k * t) / n);
    }
    assert.ok(Math.abs(re[k] - sr) < 1e-9, `re[${k}]: ${re[k]} vs ${sr}`);
    assert.ok(Math.abs(im[k] + si) < 1e-9, `im[${k}]: ${im[k]} vs ${-si}`);
  }
});

// ---------- computeSpectrum ----------
const SR = 48000;

check("spectrum: coherent 1000 Hz sine at 0.5 amp → peak 1000 Hz, amp 0.5", () => {
  const n = 4096;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 1000 * i) / SR);
  const s = computeSpectrum(ch, SR, 4096, 0);
  assert.ok(Math.abs(s.peakHz - 1000) < 1, `peakHz=${s.peakHz}`);
  // Off-bin tone (1000 Hz = 85.33 bins): dB-domain parabolic interpolation has
  // an inherent ~+0.15 dB overshoot on a Hann lobe (the lobe is not exactly
  // parabolic in dB) — documented lib behaviour; bin-centered tones are exact
  // (proven by the dedicated check below). Tolerance 0.011/0.5 ≈ 0.19 dB.
  assert.ok(Math.abs(s.peakAmplitude - 0.5) < 0.011, `amp=${s.peakAmplitude}`);
  const bin1000 = Math.round((1000 / SR) * 4096);
  assert.ok(s.amplitudes[bin1000] <= s.peakAmplitude + 1e-6);
  assert.ok(s.amplitudes[50] < 0.001, `bin50=${s.amplitudes[50]}`);
});

check("spectrum: two sines 500+3000 → both bins near their amplitudes", () => {
  const n = 8192;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    ch[i] =
      0.4 * Math.sin((2 * Math.PI * 500 * i) / SR) +
      0.2 * Math.sin((2 * Math.PI * 3000 * i) / SR);
  }
  const s = computeSpectrum(ch, SR, 8192, 0);
  assert.ok(Math.abs(s.peakHz - 500) < 1, `peakHz=${s.peakHz}`);
  assert.ok(Math.abs(s.peakAmplitude - 0.4) < 0.011, `amp=${s.peakAmplitude}`);
  // The 3000 Hz component (exact bin 512) reads directly and cleanly.
  assert.ok(Math.abs(s.amplitudes[Math.round((3000 / SR) * 8192)] - 0.2) < 0.01);
});

check("spectrum: frameRms of 0.5 sine = 0.5/√2", () => {
  const n = 4096;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 1000 * i) / SR);
  const s = computeSpectrum(ch, SR, 4096, 0);
  assert.ok(Math.abs(s.frameRms - 0.5 / Math.SQRT2) < 1e-3, `rms=${s.frameRms}`);
});

check("spectrum: silent window → peakAmplitude ~0, floor dB", () => {
  const ch = new Float32Array(4096);
  const s = computeSpectrum(ch, SR, 4096, 0);
  assert.ok(s.peakAmplitude < 1e-6);
  assert.ok(s.magnitudeDb.every((v) => v <= -200));
});

check("spectrum: parabolic interpolation lands between bins", () => {
  // 470 Hz is between bins at 48 kHz / 8192 (5.859 Hz/bin).
  const n = 8192;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 470.3 * i) / SR);
  const s = computeSpectrum(ch, SR, 8192, 0);
  assert.ok(Math.abs(s.peakHz - 470.3) < 1, `peakHz=${s.peakHz}`);
});

check("spectrum: bin-centered tone → amplitude exact (no interpolation error)", () => {
  // 85 bins × 48000/4096 = 996.09375 Hz — an exact bin center.
  const n = 4096;
  const f = 85 * (SR / n);
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * f * i) / SR);
  const s = computeSpectrum(ch, SR, 4096, 0);
  assert.ok(Math.abs(s.peakAmplitude - 0.5) < 0.001, `amp=${s.peakAmplitude}`);
  assert.ok(Math.abs(s.peakHz - f) < 0.5, `peakHz=${s.peakHz}`);
});

// ---------- computeWaveformPeaks ----------
check("peaks: two buckets of known min/max", () => {
  // 8 samples: [0, .5, 1, -1,  .2, -.3, .1, 0] → buckets of 4.
  const ch = new Float32Array([0, 0.5, 1, -1, 0.2, -0.3, 0.1, 0]);
  const r = computeWaveformPeaks([ch], 2);
  assert.strictEqual(r.buckets, 2);
  assert.ok(Math.abs(r.channels[0].min[0] - (-1)) < 1e-6);
  assert.ok(Math.abs(r.channels[0].max[0] - 1) < 1e-6);
  assert.ok(Math.abs(r.channels[0].min[1] - (-0.3)) < 1e-6);
  assert.ok(Math.abs(r.channels[0].max[1] - 0.2) < 1e-6);
});

check("peaks: bucket count exact at uneven edges", () => {
  const ch = new Float32Array(1000);
  ch[0] = 0.9;
  ch[999] = -0.9;
  const r = computeWaveformPeaks([ch], 7);
  assert.ok(Math.abs(r.channels[0].max[0] - 0.9) < 1e-6);
  assert.ok(Math.abs(r.channels[0].min[6] - (-0.9)) < 1e-6);
  for (let b = 1; b < 6; b++) {
    assert.strictEqual(r.channels[0].max[b], 0);
    assert.strictEqual(r.channels[0].min[b], 0);
  }
});

check("peaks: two channels tracked independently", () => {
  const l = new Float32Array(4); l[2] = 0.7;
  const r = new Float32Array(4); r[1] = -0.4;
  const out = computeWaveformPeaks([l, r], 1);
  assert.ok(Math.abs(out.channels[0].max[0] - 0.7) < 1e-6);
  assert.strictEqual(out.channels[0].min[0], 0);
  assert.ok(Math.abs(out.channels[1].min[0] - (-0.4)) < 1e-6);
  assert.strictEqual(out.channels[1].max[0], 0);
});

// ---------- computeRmsStats ----------
check("rms: constant DC 0.25 → rms 0.25, crest 0 dB, window split exact", () => {
  const ch = new Float32Array(48000).fill(0.25);
  const r = computeRmsStats([ch], SR, 0.5); // 0.5 s windows
  assert.ok(Math.abs(r.overallRms - 0.25) < 1e-6, `rms=${r.overallRms}`);
  assert.ok(Math.abs(r.overallRmsDb - 20 * Math.log10(0.25)) < 1e-6);
  assert.strictEqual(r.peak, 0.25);
  assert.ok(Math.abs(r.crestFactorDb) < 1e-9, `crest=${r.crestFactorDb}`);
  assert.strictEqual(r.windowRms.length, 2);
  assert.ok(Math.abs(r.windowRms[0] - 0.25) < 1e-6);
});

check("rms: sine RMS = A/√2 and peak = A", () => {
  const n = 48000;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.8 * Math.sin((2 * Math.PI * 500 * i) / SR);
  const r = computeRmsStats([ch], SR, 1);
  assert.ok(Math.abs(r.overallRms - 0.8 / Math.SQRT2) < 1e-3);
  assert.ok(Math.abs(r.peak - 0.8) < 0.001);
  assert.ok(Math.abs(r.crestFactorDb - 3.01) < 0.05, `crest=${r.crestFactorDb}`);
});

check("rms: stereo energy-average of asymmetric channels", () => {
  const n = 24000;
  const l = new Float32Array(n).fill(0.3);
  const r = new Float32Array(n).fill(0.1);
  const st = computeRmsStats([l, r], SR, 0.5);
  const expect = Math.sqrt((0.09 + 0.01) / 2);
  assert.ok(Math.abs(st.overallRms - expect) < 1e-6, `${st.overallRms} vs ${expect}`);
});

check("rms: loud intro + quiet tail → first window louder, crest dominated by intro", () => {
  const n = 48000;
  const ch = new Float32Array(n);
  for (let i = 0; i < 24000; i++) ch[i] = 0.9 * Math.sin((2 * Math.PI * 500 * i) / SR);
  for (let i = 24000; i < n; i++) ch[i] = 0.1 * Math.sin((2 * Math.PI * 500 * i) / SR);
  const r = computeRmsStats([ch], SR, 0.5);
  assert.ok(r.windowRms[0] > 4 * r.windowRms[1]);
});

check("rms: trailing partial window measured over real length", () => {
  // 1.25 s of DC 0.2 with 0.5 s windows → 3 windows, last one 0.25 s long.
  const ch = new Float32Array(60000).fill(0.2);
  const r = computeRmsStats([ch], SR, 0.5);
  assert.strictEqual(r.windowRms.length, 3);
  assert.ok(Math.abs(r.windowRms[2] - 0.2) < 1e-6, `w2=${r.windowRms[2]}`);
});

// ---------- computeFrequencyTimeline ----------
check("freq timeline: tone then silence then tone (pitch jumps are tracked)", () => {
  const n = 96000; // 2 s
  const ch = new Float32Array(n);
  for (let i = 0; i < 32000; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / SR);
  for (let i = 32000; i < 64000; i++) ch[i] = 0; // silence middle third
  for (let i = 64000; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 880 * i) / SR);
  const frames = computeFrequencyTimeline(ch, SR, 4096, 2048, 62);
  const seg1 = frames.filter((f) => f.timeSec < 0.55 && f.frequencyHz > 0);
  const seg2 = frames.filter((f) => f.timeSec > 1.45 && f.frequencyHz > 0);
  const silent = frames.filter((f) => f.timeSec > 0.75 && f.timeSec < 1.25);
  assert.ok(seg1.length > 5, `seg1=${seg1.length}`);
  for (const f of seg1) assert.ok(Math.abs(f.frequencyHz - 440) < 12, `t=${f.timeSec} f=${f.frequencyHz}`);
  for (const f of seg2) assert.ok(Math.abs(f.frequencyHz - 880) < 24, `t=${f.timeSec} f=${f.frequencyHz}`);
  for (const f of silent) assert.strictEqual(f.frequencyHz, 0, `t=${f.timeSec} f=${f.frequencyHz}`);
  // maxFrames respected: 46 hops (2 s − 4096 samples) / 2048 → stride caps output.
  assert.ok(frames.length <= 62, `frames=${frames.length}`);
});

// ---------- findLoudestWindow ----------
check("loudest window: 1 s of loud tone buried in quiet noise floor", () => {
  const n = 96000;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.01 * Math.sin((2 * Math.PI * 100 * i) / SR);
  for (let i = 48000; i < 96000; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 100 * i) / SR);
  const start = findLoudestWindow(ch, SR, 1);
  assert.ok(Math.abs(start - 48000) <= 48, `start=${start}`);
});

check("loudest window: whole-file shorter than window → offset 0", () => {
  const ch = new Float32Array(100).fill(0.5);
  assert.strictEqual(findLoudestWindow(ch, SR, 1), 0);
});

check("loudest window: brute-force cross-check on random data", () => {
  let seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const n = 4000;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = rnd() - 0.5;
  const w = 1000;
  const start = findLoudestWindow(ch, SR, w / SR);
  let best = -1, bestStart = -1;
  for (let s = 0; s + w <= n; s++) {
    let e = 0;
    for (let i = s; i < s + w; i++) e += ch[i] * ch[i];
    if (e > best) { best = e; bestStart = s; }
  }
  assert.strictEqual(start, bestStart);
});

// ---------- computeAverageSpectrum (added for Spectrum Analyzer) ----------
check("avg spectrum: single bin-centered tone → peak/centroid/curve exact", () => {
  const n = 8192;
  const f = 85 * (SR / n); // 498.05 Hz, exact bin 85 at fftSize 8192
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * f * i) / SR);
  const r = computeAverageSpectrum([ch], SR, 8192);
  assert.ok(Math.abs(r.peakHz - f) < 1, `peakHz=${r.peakHz}`);
  assert.ok(Math.abs(r.centroidHz - f) < 2, `centroid=${r.centroidHz}`);
  const bin = Math.round((f / SR) * 8192);
  const dbAtPeak = r.curvesDb[0][bin];
  assert.ok(Math.abs(dbAtPeak - 20 * Math.log10(0.5)) < 0.1, `db=${dbAtPeak}`);
  assert.ok(r.frames >= 1, `frames=${r.frames}`);
});

check("avg spectrum: 500 Hz + 3000 Hz → two visible lobes, peak at 500", () => {
  const n = 48000;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    ch[i] =
      0.4 * Math.sin((2 * Math.PI * 500 * i) / SR) +
      0.2 * Math.sin((2 * Math.PI * 3000 * i) / SR);
  }
  const r = computeAverageSpectrum([ch], SR, 8192);
  assert.ok(Math.abs(r.peakHz - 500) < 5, `peakHz=${r.peakHz}`);
  const bin500 = Math.round((500 / SR) * 8192);
  const bin3000 = Math.round((3000 / SR) * 8192);
  assert.ok(r.curvesDb[0][bin500] > r.curvesDb[0][bin3000] + 3, "500 must dominate 3000 (2× amplitude = 6 dB)");
});

check("avg spectrum: centroid of low+high tone mix sits between them", () => {
  const n = 48000;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    ch[i] =
      0.5 * Math.sin((2 * Math.PI * 200 * i) / SR) +
      0.5 * Math.sin((2 * Math.PI * 4000 * i) / SR);
  }
  const r = computeAverageSpectrum([ch], SR, 8192);
  assert.ok(r.centroidHz > 1000 && r.centroidHz < 3500, `centroid=${r.centroidHz}`);
});

// ---------- segmentFrequencyTimeline (added for Frequency Analyzer) ----------
check("segment: 440→880 jump splits into two segments with correct means", () => {
  const frames = [];
  for (let i = 0; i < 20; i++) frames.push({ timeSec: i * 0.1, frequencyHz: 440, amplitude: 0.5 });
  for (let i = 20; i < 40; i++) frames.push({ timeSec: i * 0.1, frequencyHz: 880, amplitude: 0.3 });
  const segs = segmentFrequencyTimeline(frames, 60, 0.05);
  assert.strictEqual(segs.length, 2);
  assert.ok(Math.abs(segs[0].meanHz - 440) < 1e-6, `${segs[0].meanHz}`);
  assert.ok(Math.abs(segs[1].meanHz - 880) < 1e-6, `${segs[1].meanHz}`);
  assert.strictEqual(segs[0].frameCount, 20);
});

check("segment: silence splits runs; sub-minimum multi-frame runs are dropped", () => {
  const frames = [];
  for (let i = 0; i < 10; i++) frames.push({ timeSec: i * 0.1, frequencyHz: 300, amplitude: 0.5 });
  frames.push({ timeSec: 1.0, frequencyHz: 0, amplitude: 0 });
  frames.push({ timeSec: 1.1, frequencyHz: 0, amplitude: 0 });
  // Two adjacent frames = 0.1 s span, above the 0.05 s minimum → kept.
  for (let i = 12; i < 14; i++) frames.push({ timeSec: i * 0.1, frequencyHz: 300, amplitude: 0.5 });
  const segs = segmentFrequencyTimeline(frames, 60, 0.05);
  assert.strictEqual(segs.length, 2, `segs=${segs.length}`);
  assert.ok(Math.abs(segs[0].endSec - 0.9) < 1e-6, `end0=${segs[0].endSec}`);
  assert.ok(Math.abs(segs[1].startSec - 1.2) < 1e-6, `start1=${segs[1].startSec}`);
  // A lone frame with no neighbours is still kept (single-frame rule), but a
  // multi-frame run spanning less than the minimum is dropped.
  const sparse = [
    { timeSec: 0.0, frequencyHz: 500, amplitude: 0.5 },
    { timeSec: 0.01, frequencyHz: 0, amplitude: 0 },
    { timeSec: 0.02, frequencyHz: 505, amplitude: 0.5 },
    { timeSec: 0.03, frequencyHz: 510, amplitude: 0.5 },
    { timeSec: 0.04, frequencyHz: 515, amplitude: 0.5 },
  ];
  const sparseSegs = segmentFrequencyTimeline(sparse, 60, 0.05);
  // Only the lone 500 Hz frame survives: the 3-frame 505–515 run spans just
  // 0.02 s (< 0.05 min) and is dropped.
  assert.strictEqual(sparseSegs.length, 1, `sparse=${JSON.stringify(sparseSegs)}`);
  assert.ok(Math.abs(sparseSegs[0].meanHz - 500) < 1e-6);
});

check("segment: glide stays one segment within tolerance; big glide splits", () => {
  // Slow 5% total glide: well within ±60 cents (±3.5%).
  const frames = [];
  for (let i = 0; i < 20; i++) frames.push({ timeSec: i * 0.1, frequencyHz: 440 * Math.pow(1.05, i / 19), amplitude: 0.5 });
  const one = segmentFrequencyTimeline(frames, 60, 0.05);
  assert.strictEqual(one.length, 1, `slow glide segs=${one.length}`);
  // Fast 2-octave glide: 440→1760 in 1 s splits at ±60 cents.
  const glide = [];
  for (let i = 0; i < 20; i++) glide.push({ timeSec: i * 0.05, frequencyHz: 440 * Math.pow(4, i / 19), amplitude: 0.5 });
  const many = segmentFrequencyTimeline(glide, 60, 0.05);
  assert.ok(many.length > 1, `fast glide segs=${many.length}`);
});

check("segment: frequency frame in Hz→segment roundtrip on synthetic song", () => {
  const n = 96000;
  const ch = new Float32Array(n);
  for (let i = 0; i < 32000; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / SR);
  for (let i = 64000; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 880 * i) / SR);
  const frames = computeFrequencyTimeline(ch, SR, 4096, 2048, 62);
  const segs = segmentFrequencyTimeline(frames, 60, 0.05).filter((s) => s.meanHz > 0);
  assert.ok(segs.length === 2, `segs=${segs.length}`);
  assert.ok(Math.abs(segs[0].meanHz - 440) < 6, `${segs[0].meanHz}`);
  assert.ok(Math.abs(segs[1].meanHz - 880) < 12, `${segs[1].meanHz}`);
});

console.log(`\nbatch5: ${passed} checks passed${process.exitCode ? " (WITH FAILURES)" : ""}`);
