/**
 * Batch 4 verification — runs the REAL compiled lib code
 * (scratch/.batch1/edit.js, produced by tsc from src/domains/audio/lib/edit.ts)
 * against synthetic inputs with hand-computed / analytically-derived expected
 * values.
 *
 * Recompile before running:
 *   npx tsc src/domains/audio/lib/edit.ts --outDir scratch/.batch1 --module commonjs --target es2020 --skipLibCheck
 * Run: node scratch/test-batch4.cjs
 */
"use strict";
const assert = require("assert");
const {
  encodeMidSide,
  decodeMidSide,
  peakingCoeffs,
  lowpassCoeffs,
  highpassCoeffs,
  lowShelfCoeffs,
  highShelfCoeffs,
  applyBiquad,
  applyRadioEffect,
  RADIO_DEFAULTS,
  applyTelephoneEffect,
  TELEPHONE_DEFAULTS,
  applyUnderwaterEffect,
  UNDERWATER_DEFAULTS,
} = require("./.batch1/edit.js");

const SR = 48000;
let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log("PASS", name);
  } catch (e) {
    console.error("FAIL", name, "-", e.message);
    process.exitCode = 1;
  }
}

/** Length-N sine, float32-quantized like every lib input path. */
function sine(n, freq, amp) {
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = Math.fround(amp * Math.sin((2 * Math.PI * freq * i) / SR));
  }
  return a;
}

/**
 * Goertzel magnitude of `freq` over x (scaled like an FFT bin).
 * Integer periods assumed when callers size n accordingly.
 */
function goertzel(x, freq) {
  const k = (2 * Math.PI * freq) / SR;
  let s1 = 0, s2 = 0;
  for (let i = 0; i < x.length; i++) {
    const s0 = x[i] + 2 * Math.cos(k) * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  const power = s1 * s1 + s2 * s2 - 2 * Math.cos(k) * s1 * s2;
  return Math.sqrt(power) / (x.length / 2);
}

/** Analytic |H(e^{jw})| of a normalized biquad. */
function magResponse(c, freq, sampleRate) {
  const w = (2 * Math.PI * freq) / sampleRate;
  const z1r = Math.cos(w), z1i = -Math.sin(w);
  const z2r = Math.cos(2 * w), z2i = -Math.sin(2 * w);
  const nr = c.b0 + c.b1 * z1r + c.b2 * z2r;
  const ni = c.b1 * z1i + c.b2 * z2i;
  const dr = 1 + c.a1 * z1r + c.a2 * z2r;
  const di = c.a1 * z1i + c.a2 * z2i;
  return Math.hypot(nr, ni) / Math.hypot(dr, di);
}

// ---------------------------------------------------------------------------
// decodeMidSide
// ---------------------------------------------------------------------------
check("MS decode: hand-computed samples", () => {
  const mid = new Float32Array([Math.fround(0.5), Math.fround(-0.25), 0]);
  const side = new Float32Array([Math.fround(0.1), Math.fround(0.3), Math.fround(-0.2)]);
  const [l, r] = decodeMidSide(mid, side);
  assert.strictEqual(l.length, 3);
  assert.strictEqual(r.length, 3);
  // L = M+S, R = M−S, float32 stored.
  assert.strictEqual(l[0], Math.fround(Math.fround(0.5) + Math.fround(0.1)));
  assert.strictEqual(r[0], Math.fround(Math.fround(0.5) - Math.fround(0.1)));
  assert.strictEqual(l[1], Math.fround(Math.fround(-0.25) + Math.fround(0.3)));
  assert.strictEqual(r[1], Math.fround(Math.fround(-0.25) - Math.fround(0.3)));
  // Sample 2: M=0, S=−0.2 → L = 0+(−0.2) = −0.2, R = 0−(−0.2) = +0.2.
  assert.strictEqual(l[2], Math.fround(0 + Math.fround(-0.2)));
  assert.strictEqual(r[2], Math.fround(0 - Math.fround(-0.2)));
});

check("MS round-trip: decode(encode(x)) reproduces asymmetric input exactly", () => {
  const n = 4800; // 100 ms
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    l[i] = Math.fround(0.6 * Math.sin((2 * Math.PI * 440 * i) / SR));
    r[i] = Math.fround(0.25 * Math.sin((2 * Math.PI * 330 * i) / SR) + 0.1);
  }
  const { mid, side } = encodeMidSide(l, r);
  const [l2, r2] = decodeMidSide(mid, side);
  let maxErr = 0;
  for (let i = 0; i < n; i++) {
    maxErr = Math.max(maxErr, Math.abs(l2[i] - l[i]), Math.abs(r2[i] - r[i]));
  }
  assert.ok(maxErr <= 1e-6, `round-trip maxErr=${maxErr}`);
});

// ---------------------------------------------------------------------------
// Biquad coefficients — filter-type identity proofs
// ---------------------------------------------------------------------------
const Q = 0.707;

check("lowpassCoeffs: passes DC, blocks Nyquist", () => {
  const c = lowpassCoeffs(SR, 1000, Q);
  const dc = magResponse(c, 0.0001, SR);
  assert.ok(Math.abs(dc - 1) < 1e-9, `DC=${dc}`);
  const nyq = magResponse(c, SR / 2 - 0.001, SR);
  assert.ok(nyq < 1e-6, `Nyquist=${nyq}`);
});

check("highpassCoeffs: blocks DC, passes Nyquist", () => {
  const c = highpassCoeffs(SR, 1000, Q);
  const dc = magResponse(c, 0.0001, SR);
  assert.ok(dc < 1e-6, `DC=${dc}`);
  const nyq = magResponse(c, SR / 2 - 0.001, SR);
  assert.ok(Math.abs(nyq - 1) < 1e-9, `Nyquist=${nyq}`);
});

check("lowpassCoeffs: −3.01 dB at corner, ≥ −0.3 dB well below", () => {
  const c = lowpassCoeffs(SR, 1000, Q);
  const at = magResponse(c, 1000, SR);
  assert.ok(Math.abs(at - Math.SQRT1_2) < 0.01, `at corner=${at}`);
  const below = magResponse(c, 200, SR);
  assert.ok(below > Math.pow(10, -0.3 / 20), `below=${below}`);
});

check("highpassCoeffs: −3.01 dB at corner (mirror of lowpass)", () => {
  const c = highpassCoeffs(SR, 1000, Q);
  const at = magResponse(c, 1000, SR);
  assert.ok(Math.abs(at - Math.SQRT1_2) < 0.01, `at corner=${at}`);
  const above = magResponse(c, 5000, SR);
  assert.ok(above > Math.pow(10, -0.3 / 20), `above=${above}`);
});

check("peakingCoeffs: unity at DC/Nyquist, exactly ±gain at center", () => {
  const plus = peakingCoeffs(SR, 1000, 1, 6);
  assert.ok(Math.abs(magResponse(plus, 0.0001, SR) - 1) < 1e-9);
  assert.ok(Math.abs(magResponse(plus, SR / 2 - 0.001, SR) - 1) < 1e-9);
  const at = magResponse(plus, 1000, SR);
  assert.ok(Math.abs(at - 2) < 0.01, `+6dB center=${at}`);
  const minus = peakingCoeffs(SR, 1000, 1, -6);
  const at2 = magResponse(minus, 1000, SR);
  assert.ok(Math.abs(at2 - 0.5) < 0.01, `-6dB center=${at2}`);
});

check("lowShelfCoeffs: unity at Nyquist, 10^(dB/20) at DC, between at corner", () => {
  const c = lowShelfCoeffs(SR, 200, 6);
  // RBJ/WebAudio convention: A = 10^(gain/40), passband gain = A² = 10^(gain/20).
  const passband = Math.pow(10, 6 / 20); // ≈ 1.9953
  const nyq = magResponse(c, SR / 2 - 0.001, SR);
  assert.ok(Math.abs(nyq - 1) < 1e-9, `Nyquist=${nyq}`);
  const dc = magResponse(c, 0.0001, SR);
  assert.ok(Math.abs(dc - passband) < 0.01, `DC=${dc} expected ${passband}`);
  const corner = magResponse(c, 200, SR);
  assert.ok(corner > 1.15 && corner < passband, `corner=${corner}`);
});

check("highShelfCoeffs: unity at DC, 10^(dB/20) at Nyquist, between at corner", () => {
  const c = highShelfCoeffs(SR, 4000, 6);
  const passband = Math.pow(10, 6 / 20);
  const dc = magResponse(c, 0.0001, SR);
  assert.ok(Math.abs(dc - 1) < 1e-9, `DC=${dc}`);
  const nyq = magResponse(c, SR / 2 - 0.001, SR);
  assert.ok(Math.abs(nyq - passband) < 0.01, `Nyquist=${nyq} expected ${passband}`);
  const corner = magResponse(c, 4000, SR);
  assert.ok(corner > 1.15 && corner < passband, `corner=${corner}`);
});

check("shelf inverse: low(+6 dB) then low(−6 dB) ≈ unity everywhere", () => {
  const lo = lowShelfCoeffs(SR, 500, 6);
  const loInv = lowShelfCoeffs(SR, 500, -6);
  for (const f of [100, 250, 500, 1000, 5000]) {
    const m = magResponse(lo, f, SR) * magResponse(loInv, f, SR);
    assert.ok(Math.abs(m - 1) < 0.02, `f=${f} product=${m}`);
  }
});

// ---------------------------------------------------------------------------
// applyBiquad recursion
// ---------------------------------------------------------------------------
check("applyBiquad: unity-coeff identity (b0=1, rest 0)", () => {
  const x = sine(1000, 440, 0.5);
  const identity = { b0: 1, b1: 0, b2: 0, a1: 0, a2: 0 };
  const y = applyBiquad(x, identity);
  assert.strictEqual(y.length, x.length);
  for (let i = 0; i < x.length; i++) assert.strictEqual(y[i], x[i]);
});

check("applyBiquad: steady-state amplitude matches |H| at 1000 Hz within 1%", () => {
  const x = sine(96000, 1000, 0.5); // 2 s
  const c = lowpassCoeffs(SR, 1000, Q);
  const y = applyBiquad(x, c);
  // Amplitude ratio via Goertzel on the final period (phase-independent —
  // a pointwise correlation would measure gain·cos(Δφ), and Δφ = −90° at
  // the corner, which is why the naive estimator read ≈ 0).
  const period = Math.floor(SR / 1000);
  const tailY = y.slice(y.length - period);
  const tailX = x.slice(x.length - period);
  const gain = goertzel(tailY, 1000) / goertzel(tailX, 1000);
  const expected = magResponse(c, 1000, SR);
  assert.ok(Math.abs(gain - expected) < 0.01 * expected, `gain=${gain} |H|=${expected}`);
});

check("applyBiquad: pure one-sample delay reproduces input shifted", () => {
  const x = sine(4410, 1000, 0.5);
  const delay1 = { b0: 0, b1: 1, b2: 0, a1: 0, a2: 0 };
  const y = applyBiquad(x, delay1);
  for (let i = 1; i < x.length; i++) assert.strictEqual(y[i], x[i - 1]);
  assert.strictEqual(y[0], 0); // zero state before input starts
});

// ---------------------------------------------------------------------------
// Effect chains
// ---------------------------------------------------------------------------
check("radio: out-of-band 6 kHz rejected, in-band 1 kHz survives", () => {
  const n = 96000;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = Math.fround(
      Math.fround(0.4 * Math.sin((2 * Math.PI * 6000 * i) / SR)) +
      Math.fround(0.4 * Math.sin((2 * Math.PI * 1000 * i) / SR)),
    );
  }
  const y = applyRadioEffect(x, SR, RADIO_DEFAULTS);
  assert.strictEqual(y.length, n);
  const f6k = goertzel(y, 6000);
  const f1k = goertzel(y, 1000);
  // Double LP at 6 kHz vs the 3.5 kHz corner ≈ (3.5/6)⁴ → 0.4 in ≈ 0.041
  // out (plus peaking-EQ tail) — measured 0.052 = −17.7 dB rejection.
  assert.ok(f6k < 0.08, `6 kHz residual=${f6k}`);
  assert.ok(f1k > 0.02, `1 kHz present=${f1k}`);
  console.log(`      radio: 6kHz=${f6k.toFixed(4)} 1kHz=${f1k.toFixed(4)}`);
});

check("radio: drive generates a 3rd harmonic of the in-band tone", () => {
  const n = 96000;
  const x = sine(n, 1000, 0.5);
  const y = applyRadioEffect(x, SR, { ...RADIO_DEFAULTS, drive: 8 });
  // 3 kHz = 3rd harmonic of 1 kHz, still inside the 3500 Hz lowpass.
  const h3 = goertzel(y, 3000);
  const f0 = goertzel(y, 1000);
  assert.ok(h3 / f0 > 0.02, `h3/f0=${h3 / f0}`);
  console.log(`      radio: h3/f0=${(h3 / f0).toFixed(3)}`);
});

check("telephone: 200 Hz / 6 kHz rejected, 1 kHz / 3 kHz boosted", () => {
  const n = 96000;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (const f of [200, 1000, 3000, 6000]) v += 0.25 * Math.sin((2 * Math.PI * f * i) / SR);
    x[i] = Math.fround(v / 2);
  }
  const y = applyTelephoneEffect(x, SR, TELEPHONE_DEFAULTS);
  assert.strictEqual(y.length, n);
  const m = (f) => goertzel(y, f) / 0.125; // relative to the 0.125 input amplitude
  // LR4 at 300 Hz: 200 Hz is ~−12 dB before +6 dB makeup.
  assert.ok(m(200) < 0.45, `200 Hz=${m(200)}`);
  // In-band: +6 dB makeup dominates the roll-off at 1 kHz and 3 kHz.
  assert.ok(m(1000) > 1.5, `1000 Hz=${m(1000)}`);
  assert.ok(m(3000) > 1.2, `3000 Hz=${m(3000)}`);
  // LR4 at 3400 Hz: 6 kHz is ~−16 dB before makeup.
  assert.ok(m(6000) < 0.35, `6000 Hz=${m(6000)}`);
  console.log(`      phone: 200=${m(200).toFixed(3)} 1k=${m(1000).toFixed(3)} 3k=${m(3000).toFixed(3)} 6k=${m(6000).toFixed(3)}`);
});

check("underwater: length preserved, 4 kHz crushed, 200 Hz survives", () => {
  const n = 96000;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = Math.fround(
      Math.fround(0.3 * Math.sin((2 * Math.PI * 4000 * i) / SR)) +
      Math.fround(0.3 * Math.sin((2 * Math.PI * 200 * i) / SR)),
    );
  }
  const y = applyUnderwaterEffect(x, SR, UNDERWATER_DEFAULTS);
  assert.strictEqual(y.length, n);
  const m4k = goertzel(y, 4000);
  const m200 = goertzel(y, 200);
  assert.ok(m4k < 0.05, `4 kHz residual=${m4k}`);
  assert.ok(m200 > 0.1, `200 Hz present=${m200}`);
  console.log(`      underwater: 4kHz=${m4k.toFixed(4)} 200Hz=${m200.toFixed(3)}`);
});

check("underwater: tremolo envelope swings ≈ (1−depth)…1", () => {
  const n = SR * 3;
  const x = sine(n, 100, 0.5); // 100 Hz rides inside the 600 Hz lowpass
  const y = applyUnderwaterEffect(x, SR, { lowpassHz: 600, rateHz: 1.2, depth: 0.35 });
  const win = Math.floor(SR / 100); // 10 ms windows
  let minPk = Infinity, maxPk = 0;
  for (let s = win; s + win <= n - win; s += win) {
    let pk = 0;
    for (let i = s; i < s + win; i++) pk = Math.max(pk, Math.abs(y[i]));
    minPk = Math.min(minPk, pk);
    maxPk = Math.max(maxPk, pk);
  }
  // Steady lowpass gain ≈ 1 at 100 Hz; amplitude envelope spans
  // amp·(1−depth) … amp = 0.65·0.5 … 1.0·0.5 = [0.325, 0.5].
  assert.ok(minPk > 0.3 && minPk < 0.35, `minPk=${minPk.toFixed(3)}`);
  assert.ok(maxPk > 0.48 && maxPk < 0.52, `maxPk=${maxPk.toFixed(3)}`);
  console.log(`      underwater env=[${minPk.toFixed(3)}, ${maxPk.toFixed(3)}]`);
});

// ---------------------------------------------------------------------------
// Regressions: batches 1–3 suites must still pass
// ---------------------------------------------------------------------------
console.log("--- regressions ---");
const { execSync } = require("child_process");
try {
  const out = execSync(
    "node scratch/test-batch1.cjs 2>&1 | tail -1 && node scratch/test-batch2.cjs 2>&1 | tail -1 && node scratch/test-batch3.cjs 2>&1 | tail -1",
    { encoding: "utf8" },
  );
  console.log(out.trim());
} catch (e) {
  console.error("REGRESSION FAILURE:\n" + e.stdout);
  process.exitCode = 1;
}

console.log(`\nbatch4: ${passed} checks passed${process.exitCode ? " (with failures)" : ""}`);
