/**
 * Batch 7 verification — runs the REAL compiled lib code
 * (scratch/.batch7/generate.js, from src/domains/audio/lib/generate.ts).
 *
 * Recompile before running:
 *   npx tsc src/domains/audio/lib/generate.ts --outDir scratch/.batch7 --module commonjs --target es2020 --skipLibCheck
 * Run: node scratch/test-batch7.cjs
 */
"use strict";
const assert = require("assert");
const {
  makeRng,
  generateWhiteNoise,
  generatePinkNoise,
  generateBrownNoise,
  generateWave,
} = require("./.batch7/generate.js");

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log("ok   -", name); }
  catch (e) { fail++; console.log("FAIL -", name, "\n      ", e.message); }
}
const f32 = Math.fround;
const close = (a, b, tol) => Math.abs(a - b) <= tol;

// ---- seed determinism (the tool advertises reproducible noise) ----
check("white noise is seed-deterministic", () => {
  const a = generateWhiteNoise(48000, 1, 0.3, 777);
  const b = generateWhiteNoise(48000, 1, 0.3, 777);
  assert.strictEqual(a.length, b.length);
  for (let i = 0; i < a.length; i++) assert.strictEqual(a.channels[0][i], b.channels[0][i]);
});
check("different seeds give different noise", () => {
  const a = generateWhiteNoise(48000, 0.5, 0.3, 1);
  const b = generateWhiteNoise(48000, 0.5, 0.3, 2);
  let diff = 0;
  for (let i = 0; i < 1000; i++) if (a.channels[0][i] !== b.channels[0][i]) diff++;
  assert.ok(diff > 900, "diff count " + diff);
});
check("makeRng stays in [0,1)", () => {
  const rng = makeRng(42);
  for (let i = 0; i < 10000; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1, "out of range " + v);
  }
});

// ---- white noise: uniform [-amp, amp) → RMS = amp/√3 ----
check("white noise amplitude bounds and RMS = amp/√3", () => {
  const amp = 0.4;
  const g = generateWhiteNoise(48000, 2, amp, 99);
  const d = g.channels[0];
  let sum2 = 0, max = 0, min = 0;
  for (let i = 0; i < d.length; i++) {
    const v = d[i];
    assert.ok(v >= -amp - 1e-6 && v <= amp + 1e-6, "bound " + v);
    sum2 += v * v;
    if (v > max) max = v;
    if (v < min) min = v;
  }
  const rms = Math.sqrt(sum2 / d.length);
  const expected = amp / Math.sqrt(3);
  assert.ok(close(rms, expected, 0.01), "rms " + rms + " vs " + expected);
  assert.ok(max > amp * 0.9, "max too small " + max);
  assert.ok(min < -amp * 0.9, "min too small " + min);
});

// ---- pink/brown: bounded, ordered spectral slope ----
check("pink noise bounded and smoother than white", () => {
  const g = generatePinkNoise(48000, 2, 0.5, 5);
  const d = g.channels[0];
  let max = 0, sum2 = 0;
  for (let i = 0; i < d.length; i++) {
    assert.ok(Math.abs(d[i]) <= 0.5 + 1e-6, "bound " + d[i]);
    sum2 += d[i] * d[i];
    if (Math.abs(d[i]) > max) max = Math.abs(d[i]);
  }
  assert.ok(max > 0.3, "too quiet, max " + max);
  const rms = Math.sqrt(sum2 / d.length);
  assert.ok(rms > 0.02 && rms < 0.45, "rms " + rms);
});
check("brown noise bounded and DC leakage < 1%", () => {
  const g = generateBrownNoise(48000, 2, 0.5, 5);
  const d = g.channels[0];
  let sum = 0, max = 0;
  for (let i = 0; i < d.length; i++) {
    assert.ok(Math.abs(d[i]) <= 0.5 + 1e-6, "bound " + d[i]);
    sum += d[i];
    if (Math.abs(d[i]) > max) max = Math.abs(d[i]);
  }
  const dc = sum / d.length;
  assert.ok(Math.abs(dc) < 0.005, "dc " + dc + " (" + (100 * Math.abs(dc) / 0.5).toFixed(2) + "% of full scale)");
  assert.ok(max > 0.2, "too quiet, max " + max);
});

// ---- sine: sample-exact at quarter periods, phase control ----
check("sine is sample-exact at f = fs/8, amp 0.7", () => {
  const sr = 48000, f = sr / 8, amp = 0.7;
  const g = generateWave("sine", sr, 1, f, amp);
  const d = g.channels[0];
  // i=6 → 0.75 cycles → sin(3π/2) = −1; i=18 → 2.25 cycles → +1
  const expect6 = f32(-amp);
  const expect18 = f32(amp);
  assert.strictEqual(f32(d[0]), 0);
  assert.strictEqual(f32(d[6]), expect6);
  // sin(3π) numerically ≈ ±2.6e-16 — zero to double precision, so use epsilon
  assert.ok(Math.abs(d[12]) < 1e-6, "d[12] " + d[12]);
  assert.strictEqual(f32(d[18]), expect18);
});
check("sine phase 90° shifts samples by quarter period", () => {
  const sr = 48000, f = 480, amp = 0.5;
  const g0 = generateWave("sine", sr, 0.1, f, amp, 0.5, 0);
  const g90 = generateWave("sine", sr, 0.1, f, amp, 0.5, 90);
  // t = 0.25/f is phase π/2: g0 should be amp there, g90 (cos-like) ≈ 0
  const idx = Math.round((0.25 / f) * sr);
  assert.ok(close(g0.channels[0][idx], amp, 1e-4), "g0 " + g0.channels[0][idx]);
  assert.ok(Math.abs(g90.channels[0][idx]) < 0.01, "g90 " + g90.channels[0][idx]);
});

// ---- square: exact shape ----
check("square wave starts at +amp, is ±amp, half-period correct", () => {
  const sr = 48000, f = 100, amp = 0.7;
  const g = generateWave("square", sr, 1, f, amp);
  const d = g.channels[0];
  assert.strictEqual(f32(d[0]), f32(amp));
  const half = Math.floor(sr / f / 2); // 240 samples
  assert.strictEqual(f32(d[half - 1]), f32(amp));
  assert.strictEqual(f32(d[half]), f32(-amp));
  for (let i = 0; i < sr; i += 37) {
    const frac = ((f * i) / sr) % 1;
    assert.strictEqual(f32(d[i]), f32(frac < 0.5 ? amp : -amp));
  }
});

console.log(`\nbatch7: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
