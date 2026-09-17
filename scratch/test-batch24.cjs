/**
 * Batch 24 Node verification — src/domains/audio/lib/dynamics.ts
 * Recompile: npx tsc src/domains/audio/lib/dynamics.ts --outDir scratch/.batch24 --module commonjs --target es2020 --skipLibCheck
 */
const assert = require("assert");
const d = require("./.batch24/dynamics.js");

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
/** Sine generator */
function sine(sec, amp, freq = 440) {
  const n = Math.round(sr * sec);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = amp * Math.sin((2 * Math.PI * freq * i) / sr);
  return a;
}
/** Sum of two sines at different amplitudes */
function twoTone(sec, amp1, amp2) {
  const n = Math.round(sr * sec);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = amp1 * Math.sin((2 * Math.PI * 100 * i) / sr) + amp2 * Math.sin((2 * Math.PI * 4400 * i) / sr);
  }
  return a;
}

check("peakOf: full-scale sine peak = 1", () => {
  assert.ok(Math.abs(d.peakOf(sine(0.5, 1)) - 1) < 1e-6);
});
check("peakOf: empty data = 0", () => {
  assert.strictEqual(d.peakOf(new Float32Array(0)), 0);
});
check("rmsOf: sine RMS = amp/√2", () => {
  assert.ok(Math.abs(d.rmsOf(sine(0.5, 0.5)) - 0.5 / Math.SQRT2) < 1e-6);
});
check("normalizePeak: exact target, silent stays silent", () => {
  const out = d.normalizePeak(sine(0.5, 0.25), -3);
  assert.ok(Math.abs(d.peakOf(out) - Math.pow(10, -3 / 20)) < 1e-6);
  const silent = d.normalizePeak(new Float32Array(100), -3);
  assert.strictEqual(d.peakOf(silent), 0);
});
check("normalizeRms: hits target when peaks allow", () => {
  const r = d.normalizeRms(sine(1, 0.2), -18, -1);
  assert.ok(!r.clamped);
  assert.ok(Math.abs(r.achievedRmsDb + 18) < 0.01);
});
check("normalizeRms: ceiling clamps peaky sources", () => {
  // quiet RMS but tall sparse peaks: gain needed to hit −10 RMS would push peaks past −3
  const n = sr;
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    // baseline hum at low amp + occasional full-scale burst every 0.1 s
    a[i] = 0.02 * Math.sin((2 * Math.PI * 100 * i) / sr);
    if (i % Math.round(sr * 0.1) < 40) a[i] = 0.95 * Math.sin((2 * Math.PI * 440 * i) / sr);
  }
  const r = d.normalizeRms(a, -10, -3);
  assert.ok(r.clamped, "should clamp");
  assert.ok(d.peakOf(r.data) <= Math.pow(10, -3 / 20) + 1e-9);
});
check("compressorCurve: unity below knee, ratio above threshold", () => {
  const p = { thresholdDb: -20, ratio: 4, kneeDb: 6, makeupGainDb: 0 };
  assert.ok(Math.abs(d.compressorCurve(-30, p) + 30) < 1e-9); // below knee: unity
  assert.ok(Math.abs(d.compressorCurve(0, p) - (-20 + 20 / 4)) < 1e-9); // 0 dB → −15
});
check("compressorCurve: knee continuous at both ends", () => {
  const p = { thresholdDb: -20, ratio: 4, kneeDb: 6, makeupGainDb: 0 };
  assert.ok(Math.abs(d.compressorCurve(p.thresholdDb - p.kneeDb, p) - (p.thresholdDb - p.kneeDb)) < 1e-9);
  assert.ok(Math.abs(d.compressorCurve(p.thresholdDb, p) - p.thresholdDb) < 1e-9);
});
check("expanderCurve: unity above knee, ratio below threshold", () => {
  const p = { thresholdDb: -40, ratio: 0.25, kneeDb: 6 };
  assert.ok(Math.abs(d.expanderCurve(-20, p) + 20) < 1e-9);
  assert.ok(Math.abs(d.expanderCurve(-80, p) - (-40 + (-80 + 40) * 0.25)) < 1e-9); // −70
});
check("compressChannel: loud parts reduced relative to quiet parts", () => {
  // 1 s loud, 1 s quiet; compressor at −30 dB, 4:1
  const loud = sine(1, 0.5);
  const quiet = sine(1, 0.05);
  const data = new Float32Array(loud.length + quiet.length);
  data.set(loud, 0);
  data.set(quiet, loud.length);
  const out = d.compressChannel(data, sr, { thresholdDb: -30, ratio: 4, kneeDb: 6, makeupGainDb: 0 }, 5, 150);
  const loudRms = d.rmsOf(out.slice(0, loud.length));
  const quietRms = d.rmsOf(out.slice(loud.length));
  // input ratio was 20 dB; output ratio must be smaller (compression)
  const inRatioDb = 20 * Math.log10(0.5 / 0.05);
  const outRatioDb = 20 * Math.log10(loudRms / quietRms);
  assert.ok(outRatioDb < inRatioDb - 5, `out ${outRatioDb.toFixed(1)} vs in ${inRatioDb.toFixed(1)}`);
  assert.ok(d.peakOf(out) <= 1 + 1e-9 || outRatioDb > 0);
});
check("compressChannel: makeup gain applied", () => {
  const quiet = sine(1, 0.02);
  const out = d.compressChannel(quiet, sr, { thresholdDb: -10, ratio: 3, kneeDb: 6, makeupGainDb: 12 }, 5, 100);
  assert.ok(d.rmsOf(out) > d.rmsOf(quiet) * 2); // clearly boosted
});
check("limitChannel: never exceeds ceiling (float32 tolerance)", () => {
  const hot = sine(1, 1.4); // way over full scale
  const out = d.limitChannel(hot, sr, { ceilingDb: -1, lookaheadMs: 5, releaseMs: 100 });
  assert.ok(d.peakOf(out) <= Math.pow(10, -1 / 20) + 1e-6);
});
check("limitChannel: quiet signal untouched", () => {
  const quiet = sine(1, 0.3);
  const out = d.limitChannel(quiet, sr, { ceilingDb: -1, lookaheadMs: 5, releaseMs: 100 });
  assert.ok(Math.abs(d.peakOf(out) - 0.3) < 1e-6);
});
check("limitChannel: length preserved", () => {
  const a = sine(0.7, 0.9);
  assert.strictEqual(d.limitChannel(a, sr, { ceilingDb: -1, lookaheadMs: 5, releaseMs: 50 }).length, a.length);
});
check("gateChannel: silence zeroed, signal kept", () => {
  const sig = sine(0.5, 0.5);
  const sil = new Float32Array(sr * 0.5);
  const data = new Float32Array(sig.length * 2 + sil.length * 2);
  data.set(sig, 0);
  data.set(sil, sig.length);
  data.set(sig, sig.length + sil.length);
  data.set(sil, sig.length * 2 + sil.length);
  const r = d.gateChannel(data, sr, { openThresholdDb: -40, closeThresholdDb: -50, holdMs: 100, fadeMs: 5 });
  // middle silence (0.5–1.0s) and tail (1.5–2.0s) must be ~zero
  const mid = r.data.slice(Math.round(sr * 0.6), Math.round(sr * 0.9));
  assert.ok(d.peakOf(mid) < 1e-6);
  // first signal block preserved
  const kept = r.data.slice(0, Math.round(sr * 0.4));
  assert.ok(d.rmsOf(kept) > 0.2);
});
check("gateChannel: gatedFraction reported honestly", () => {
  const sig = sine(0.5, 0.5);
  const sil = new Float32Array(sr * 0.5);
  const data = new Float32Array(sig.length + sil.length);
  data.set(sig, 0);
  data.set(sil, sig.length);
  const r = d.gateChannel(data, sr, { openThresholdDb: -40, closeThresholdDb: -50, holdMs: 50, fadeMs: 5 });
  assert.ok(r.gatedFraction > 0.3 && r.gatedFraction < 0.6, `fraction ${r.gatedFraction}`);
});
check("gateChannel: signal near threshold stays open (hysteresis+hold)", () => {
  const sig = sine(1, 0.02); // −34 dB, above open −40
  const r = d.gateChannel(sig, sr, { openThresholdDb: -40, closeThresholdDb: -50, holdMs: 100, fadeMs: 5 });
  assert.ok(r.gatedFraction < 0.1);
});
// toDb / toLinear round-trip
check("toDb/toLinear round-trip", () => {
  assert.ok(Math.abs(d.toLinear(d.toDb(0.123)) - 0.123) < 1e-9);
});
// ---- regression: expansion never boosts (warmup/onset bug) -----------------
check("expandChannel: never boosts (file-start warmup was +41x)", () => {
  const sr2 = 48000;
  const s = new Float32Array(sr2);
  for (let i = 0; i < sr2; i++) s[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / sr2);
  const out = d.expandChannel(s, sr2, { thresholdDb: -35, ratio: 0.5, kneeDb: 6 }, 5, 150);
  const outPeak = d.peakOf(out);
  assert.ok(outPeak <= d.peakOf(s) + 1e-6, `peak grew to ${d.toDb(outPeak)} dBFS`);
  // steady state untouched (above threshold+knee)
  const midRms = d.rmsOf(out.slice(Math.round(sr2 / 2)));
  assert.ok(Math.abs(d.toDb(midRms) - d.toDb(d.rmsOf(s))) < 0.3, `mid ${d.toDb(midRms)}`);
});

// ---- regression: compressor gain is smoothed (ripple/make-up bug) ----------
check("compressChannel: no gain ripple through threshold (was 2x sample steps)", () => {
  const sr2 = 48000;
  const s = new Float32Array(sr2);
  for (let i = 0; i < sr2; i++) s[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / sr2);
  // envelope ~ -9 dBFS straddles the -28 dB threshold heavily with knee 3:
  // per-sample gain math previously jumped between 2x (make-up) and deep GR.
  const out = d.compressChannel(s, sr2, { thresholdDb: -28, ratio: 8, kneeDb: 3, makeupGainDb: 6 }, 3, 80);
  // Steady state (past the ~10 ms attack): env -9 dBFS, 8:1 above -28 ->
  // ~16.6 dB GR; with +6 dB make-up the peak must be ~0.5*2*10^(-16.6/20) ≈ 0.15.
  const steady = out.slice(Math.round(sr2 * 0.1));
  const steadyPeak = d.peakOf(steady);
  assert.ok(steadyPeak < 0.25, `steady peak ${steadyPeak.toFixed(3)} (ripple bug gives ~0.8)`);
  // Hard invariant at all times: gain ≤ 1 × make-up (2.0), so nothing exceeds
  // the input amplitude times make-up — and no sample exceeds full scale here.
  assert.ok(d.peakOf(out) <= 0.5 * d.toLinear(6) + 1e-6, `attack peak ${d.peakOf(out).toFixed(3)}`);
  // And the smoothed gain may never INCREASE above the make-up bound anywhere.
  const blend = d.blendParallel(s, out, 0.4);
  assert.ok(d.peakOf(blend) < 0.5 * 0.6 + 0.4 * d.toLinear(6) * 0.5 + 1e-6, `blend peak ${d.peakOf(blend).toFixed(3)}`);
});

console.log(passed + " checks passed");
if (process.exitCode) process.exit(1);
