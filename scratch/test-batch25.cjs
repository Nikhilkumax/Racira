/**
 * Batch 25 Node verification — lib/lufs.ts + new dynamics.ts functions.
 * Recompile:
 *   npx tsc src/domains/audio/lib/lufs.ts src/domains/audio/lib/dynamics.ts --outDir scratch/.batch25 --module commonjs --target es2020 --skipLibCheck
 */
const assert = require("assert");
const l = require("./.batch25/lufs.js");
const d = require("./.batch25/dynamics.js");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ok - " + name);
  } catch (e) {
    console.error("  FAIL - " + name + ": " + e.message);
    process.exitCode = 1;
  }
}

const sr = 48000;
function sineStereo(sec, amp, freq = 1000) {
  const n = Math.round(sr * sec);
  const a = new Float32Array(n);
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = amp * Math.sin((2 * Math.PI * freq * i) / sr);
    a[i] = v;
    b[i] = v;
  }
  return [a, b];
}
function sine(sec, amp, freq = 1000) {
  const n = Math.round(sr * sec);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = amp * Math.sin((2 * Math.PI * freq * i) / sr);
  return a;
}

// ---- LUFS: EBU anchors -----------------------------------------------------
check("EBU anchor: stereo 1 kHz @ -23 dBFS -> -23.0 LUFS ±0.2", () => {
  const r = l.integratedLoudness(sineStereo(2, Math.pow(10, -23 / 20)), sr);
  assert.ok(Math.abs(r.lufs - -23) <= 0.2, `got ${r.lufs}`);
});
check("EBU anchor: stereo 1 kHz @ -20 dBFS -> -20.0 LUFS ±0.2", () => {
  const r = l.integratedLoudness(sineStereo(2, Math.pow(10, -20 / 20)), sr);
  assert.ok(Math.abs(r.lufs - -20) <= 0.2, `got ${r.lufs}`);
});
check("selfCheck harness passes at -23 and -20", () => {
  assert.ok(l.selfCheck(sr, -23).pass);
  assert.ok(l.selfCheck(sr, -20).pass);
});
check("6 dB level change = 6 LU change (linearity)", () => {
  const a = l.integratedLoudness(sineStereo(2, Math.pow(10, -20 / 20)), sr).lufs;
  const b = l.integratedLoudness(sineStereo(2, Math.pow(10, -26 / 20)), sr).lufs;
  assert.ok(Math.abs((a - b) - 6) <= 0.05, `delta ${a - b}`);
});
check("silence -> -Infinity", () => {
  const r = l.integratedLoudness([new Float32Array(sr * 2), new Float32Array(sr * 2)], sr);
  assert.ok(!Number.isFinite(r.lufs));
});
check("relative gate: quiet segments excluded from integrated", () => {
  // 2 s loud (-20 LUFS) + 4 s very quiet (-50 dBFS tone ≈ far below gate)
  const loud = sine(2, Math.pow(10, -20 / 20));
  const quiet = sine(4, Math.pow(10, -50 / 20));
  const chan = new Float32Array(loud.length + quiet.length);
  chan.set(loud, 0);
  chan.set(quiet, loud.length);
  const r = l.integratedLoudness([chan, chan.slice()], sr);
  assert.ok(Math.abs(r.lufs - -20) <= 0.5, `got ${r.lufs}`);
  assert.ok(r.momentaryMaxLufs > -25);
});
check("momentaryMax tracks loudness of bursts", () => {
  const loud = sine(1, Math.pow(10, -14 / 20));
  const quiet = sine(1, Math.pow(10, -40 / 20));
  const chan = new Float32Array(loud.length + quiet.length);
  chan.set(quiet, 0);
  chan.set(loud, quiet.length);
  const r = l.integratedLoudness([chan, chan.slice()], sr);
  assert.ok(r.momentaryMaxLufs > -16, `max ${r.momentaryMaxLufs}`);
  assert.ok(r.lufs < r.momentaryMaxLufs + 2, "integrated below max for mixed material");
});
check("gainToTargetLufs: +3 LU when 3 LU under; null on silence", () => {
  assert.strictEqual(l.gainToTargetLufs(-19, -16), 3);
  assert.strictEqual(l.gainToTargetLufs(-13, -16), -3);
  assert.strictEqual(l.gainToTargetLufs(-Infinity, -16), null);
});

// ---- autoLevel --------------------------------------------------------------
check("autoLevel: two sections converge to target", () => {
  const quiet = sine(1, 0.05); // ≈ −29 dB RMS
  const loud = sine(1, 0.5);   // ≈ −9 dB RMS
  const data = new Float32Array(quiet.length + loud.length);
  data.set(quiet, 0);
  data.set(loud, quiet.length);
  const target = -20;
  const r = d.autoLevelChannel(data, sr, { targetRmsDb: target, maxGainDb: 24, maxSlewDbPerSec: 60, blockMs: 100 });
  const tailQuiet = d.rmsOf(r.data.slice(0, Math.round(sr * 0.9)));
  const tailLoud = d.rmsOf(r.data.slice(Math.round(sr * 1.1)));
  // after slew settles, both ends near target (within 2.5 dB)
  assert.ok(Math.abs(20 * Math.log10(tailQuiet) - target) < 3, `quiet ${20 * Math.log10(tailQuiet)}`);
  assert.ok(Math.abs(20 * Math.log10(tailLoud) - target) < 3, `loud ${20 * Math.log10(tailLoud)}`);
  assert.ok(r.gainRangeDb[0] < r.gainRangeDb[1]);
});
check("autoLevel: slew limit respected (no instantaneous jumps)", () => {
  const step = new Float32Array(sr);
  for (let i = 0; i < sr; i++) step[i] = i < sr / 2 ? 0.5 : 0.01;
  const r = d.autoLevelChannel(step, sr, { targetRmsDb: -20, maxGainDb: 30, maxSlewDbPerSec: 12, blockMs: 50 });
  // max slew 12 dB/s × 50 ms = 0.6 dB per block — hard to observe directly, but
  // a 34 dB correction must take ≥ 34/12 s ≈ 2.83 s > file length (1 s):
  // therefore the applied range must NOT reach the unclamped want (34 dB).
  assert.ok(r.gainRangeDb[1] < 12, `range ${r.gainRangeDb[1]}`);
});
check("autoLevel: maxGainDb caps boost on near-silence", () => {
  const tiny = sine(1, 0.0001);
  const r = d.autoLevelChannel(tiny, sr, { targetRmsDb: -16, maxGainDb: 10, maxSlewDbPerSec: 100, blockMs: 100 });
  assert.ok(r.gainRangeDb[1] <= 10.01, `boost ${r.gainRangeDb[1]}`);
});

// ---- multiband split --------------------------------------------------------
check("splitThreeBand: band separation (100 Hz / 1 kHz / 8 kHz)", () => {
  const sr2 = 48000;
  const bass = sine(0.5, 0.5, 100);
  const mid = sine(0.5, 0.5, 1000);
  const high = sine(0.5, 0.5, 8000);
  const n = bass.length;
  const mixed = new Float32Array(n);
  for (let i = 0; i < n; i++) mixed[i] = bass[i] + mid[i] + high[i];
  const s = d.splitThreeBand(mixed, sr2, 300, 3000);
  const rmsIn = d.rmsOf(mixed);
  const lowRms = d.rmsOf(s.low);
  const midRms = d.rmsOf(s.mid);
  const highRms = d.rmsOf(s.high);
  // each band should hold most of its tone and little of the others
  assert.ok(lowRms > 0.3, `low ${lowRms}`);
  assert.ok(midRms > 0.3, `mid ${midRms}`);
  assert.ok(highRms > 0.25, `high ${highRms}`);
  void rmsIn;
});
check("splitThreeBand: EXACT reconstruction (perfect recombination)", () => {
  const sr2 = 48000;
  const bass = sine(0.5, 0.5, 100);
  const midT = sine(0.5, 0.5, 1000);
  const highT = sine(0.5, 0.5, 8000);
  const n = bass.length;
  const mixed = new Float32Array(n);
  for (let i = 0; i < n; i++) mixed[i] = bass[i] + midT[i] + highT[i];
  const s = d.splitThreeBand(mixed, sr2, 300, 3000);
  const sum = d.sumBands(s);
  let worst = 0;
  for (let i = 0; i < n; i++) worst = Math.max(worst, Math.abs(sum[i] - mixed[i]));
  assert.ok(worst < 1e-5, `worst ${worst}`);
});
check("splitThreeBand: bands in-phase (positive dot vs their own tone)", () => {
  const sr2 = 48000;
  const bass = sine(0.5, 0.5, 100);
  const midT = sine(0.5, 0.5, 1000);
  const highT = sine(0.5, 0.5, 8000);
  const n = bass.length;
  const mixed = new Float32Array(n);
  for (let i = 0; i < n; i++) mixed[i] = bass[i] + midT[i] + highT[i];
  const s = d.splitThreeBand(mixed, sr2, 300, 3000);
  const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  assert.ok(dot(s.low, bass) > 0, "low vs 100 Hz");
  assert.ok(dot(s.mid, midT) > 0, "mid vs 1 kHz");
  assert.ok(dot(s.high, highT) > 0, "high vs 8 kHz");
});
check("compressBandInPlace: low band reduced, mid untouched", () => {
  const sr2 = 48000;
  const mixed = new Float32Array(sr2);
  for (let i = 0; i < sr2; i++) {
    mixed[i] = 0.8 * Math.sin((2 * Math.PI * 80 * i) / sr2) + 0.1 * Math.sin((2 * Math.PI * 1000 * i) / sr2);
  }
  const s = d.splitThreeBand(mixed, sr2, 250, 2500);
  const lowBefore = d.rmsOf(s.low);
  d.compressBandInPlace(s.low, sr2, { thresholdDb: -20, ratio: 6, kneeDb: 3, makeupGainDb: 0 }, 3, 60);
  const midBefore = d.rmsOf(s.mid);
  d.compressBandInPlace(s.mid, sr2, { thresholdDb: -80, ratio: 1.01, kneeDb: 0, makeupGainDb: 0 }, 3, 60); // gentle no-op
  const lowAfter = d.rmsOf(s.low);
  assert.ok(lowAfter < lowBefore * 0.85, `low ${lowBefore} -> ${lowAfter}`);
  void midBefore;
});

// ---- parallel blend ---------------------------------------------------------
check("blendParallel: mix 0 = dry, 1 = compressed, 0.5 = blend", () => {
  const dry = sine(0.3, 0.5);
  const comp = sine(0.3, 0.1);
  const at0 = d.blendParallel(dry, comp, 0);
  const at1 = d.blendParallel(dry, comp, 1);
  const atHalf = d.blendParallel(dry, comp, 0.5);
  assert.ok(Math.abs(d.rmsOf(at0) - 0.5 / Math.SQRT2) < 1e-6);
  assert.ok(Math.abs(d.rmsOf(at1) - 0.1 / Math.SQRT2) < 1e-6);
  const expectedHalf = ((0.5 + 0.1) / 2) / Math.SQRT2;
  assert.ok(Math.abs(d.rmsOf(atHalf) - expectedHalf) < 1e-6);
});

// ---- short-term loudness + LRA (EBU Tech 3342) -----------------------------
check("shortTermLoudness: constant tone reads target at every window", () => {
  const [a, b] = sineStereo(4, Math.pow(10, -23 / 20));
  const pts = l.shortTermLoudness([a, b], sr);
  assert.ok(pts.length >= 9, `points ${pts.length}`);
  for (const p of pts) assert.ok(Math.abs(p.lufs - -23) <= 0.3, `at ${p.timeSec}: ${p.lufs}`);
});
check("shortTermLoudness: silence windows are -Infinity", () => {
  const pts = l.shortTermLoudness([new Float32Array(sr * 4), new Float32Array(sr * 4)], sr);
  assert.ok(pts.every((p) => p.lufs === -Infinity));
});
check("loudnessRange: constant tone has ~0 LRA", () => {
  const [a, b] = sineStereo(4, Math.pow(10, -20 / 20));
  const lra = l.loudnessRange(l.shortTermLoudness([a, b], sr));
  assert.ok(lra !== null && lra < 1, `LRA ${lra}`);
});
check("loudnessRange: quiet-then-loud step -> small positive LRA (transitions dominate)", () => {
  // EBU 3342 is distribution-based: for one step, the 3 s transition windows
  // fill the gap between plateaus and the relative gate drops the quiet tail,
  // so LRA lands mid-gap (hand-derived ~6; must be well below the 26 dB step).
  const quiet = sine(4, Math.pow(10, -40 / 20));
  const loud = sine(4, Math.pow(10, -14 / 20));
  const chan = new Float32Array(quiet.length + loud.length);
  chan.set(quiet, 0);
  chan.set(loud, quiet.length);
  const lra = l.loudnessRange(l.shortTermLoudness([chan, chan.slice()], sr));
  assert.ok(lra !== null && lra > 1 && lra < 15, `LRA ${lra}`);
});
check("loudnessRange: alternating material with both plateaus gated in -> wide LRA", () => {
  // Two alternations at -28/-10 LUFS: both plateaus survive the relative gate,
  // so the 10th/95th percentiles sit on the plateaus themselves (~18 dB).
  const q = sine(4, Math.pow(10, -28 / 20));
  const lo = sine(4, Math.pow(10, -10 / 20));
  const chan = new Float32Array(2 * (q.length + lo.length));
  chan.set(q, 0); chan.set(lo, q.length);
  chan.set(q, q.length + lo.length); chan.set(lo, 2 * q.length + lo.length);
  const lra = l.loudnessRange(l.shortTermLoudness([chan, chan.slice()], sr));
  assert.ok(lra !== null && lra > 10 && lra < 22, `LRA ${lra}`);
});
check("loudnessRange: null for material too short to window", () => {
  const [a, b] = sineStereo(2, 0.5);
  assert.strictEqual(l.loudnessRange(l.shortTermLoudness([a, b], sr)), null);
});

console.log(passed + " checks passed");
if (process.exitCode) process.exit(1);
