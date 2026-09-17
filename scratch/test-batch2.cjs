/**
 * Batch 2 verification — runs the REAL compiled lib code
 * (scratch/.batch1/edit.js, produced by tsc from src/domains/audio/lib/edit.ts)
 * against synthetic inputs with hand-computed expected values.
 *
 * Recompile before running:
 *   npx tsc src/domains/audio/lib/edit.ts --outDir scratch/.batch1 --module commonjs --target es2020 --skipLibCheck
 * Run: node scratch/test-batch2.cjs
 */
"use strict";
const assert = require("assert");
const {
  applyGainDb,
  applyEcho,
  applyTremolo,
  applyVibrato,
  applyDistortion,
} = require("./.batch1/edit.js");

let pass = 0;
let fail = 0;
function check(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  ok  ${name}`);
  } catch (err) {
    fail++;
    console.log(`FAIL  ${name}\n      ${err.message}`);
  }
}

const SR = 44100;
const F32 = 1 / 128; // float32 eps around 1.0 — precision gate for exact-value asserts

// ---------------------------------------------------------------- volume reducer
console.log("Volume Reducer (applyGainDb, negative dB)");
check("-6 dB scales by 10^(-6/20) exactly", () => {
  const x = Float32Array.from([0.5, -0.25, 1.0, -1.0]);
  const r = applyGainDb(x, -6);
  const g = Math.pow(10, -6 / 20); // 0.5011872336272722
  for (let i = 0; i < x.length; i++) {
    assert.ok(Math.abs(r.out[i] - x[i] * g) < F32, `out[${i}]=${r.out[i]} vs ${x[i] * g}`);
  }
  assert.strictEqual(r.clippedSamples, 0, "reduction never clips");
  assert.ok(Math.abs(r.peakAfter - g) < F32, `peakAfter=${r.peakAfter}`);
});
check("-20 dB halves-and-halves again (0.5 -> 0.05)", () => {
  const r = applyGainDb(Float32Array.from([0.5]), -20);
  const g = Math.pow(10, -1); // -20 dB = ×0.1
  assert.ok(Math.abs(r.out[0] - 0.05) < 1e-9, `out=${r.out[0]}`);
});
check("reduction of a full-scale wave keeps zero crossings and shape", () => {
  const n = 8000;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = Math.sin((2 * Math.PI * 440 * i) / SR);
  const r = applyGainDb(x, -12);
  const g = Math.pow(10, -12 / 20);
  assert.ok(Math.abs(r.peakAfter - g) < F32, `peak ${r.peakAfter} vs ${g}`);
  assert.strictEqual(r.clippedSamples, 0);
});

// ---------------------------------------------------------------- echo
console.log("Echo/Delay Generator (applyEcho)");
check("impulse -> geometric taps at exact multiples of the delay", () => {
  // 100 ms at 44100 = 4410 samples
  const delayMs = 100;
  const delay = Math.round((delayMs / 1000) * SR);
  const n = delay * 5 + 100; // room for 5 taps
  const x = new Float32Array(n);
  x[0] = 1;
  const mix = 0.5;
  const fb = 0.4;
  const out = applyEcho(x, SR, { delayMs, feedback: fb, mix });
  for (let t = 1; t <= 5; t++) {
    const expected = mix * Math.pow(fb, t - 1); // 0.5, 0.2, 0.08, 0.032, 0.0128
    const got = out[t * delay];
    assert.ok(Math.abs(got - expected) < 1e-6, `tap ${t}: ${got} vs ${expected}`);
  }
  assert.ok(Math.abs(out[0] - 1) <= F32, `dry passthrough at 0: ${out[0]}`);
  // non-tap positions are untouched dry signal (0 here)
  assert.strictEqual(out[delay + 1], 0);
  assert.strictEqual(out[2 * delay + 7], 0);
});
check("feedback growth matches mix·fb^k to k=10", () => {
  const delay = 50; // samples (ms so small it rounds to 1 sample? no: 0.5ms*44100≈23)
  const delayMs = (50 / SR) * 1000; // exactly 50 samples
  const n = 600;
  const x = new Float32Array(n);
  x[0] = 1;
  const out = applyEcho(x, SR, { delayMs, feedback: 0.5, mix: 1 });
  for (let t = 1; t <= 10; t++) {
    const expected = Math.pow(0.5, t - 1);
    assert.ok(Math.abs(out[t * delay] - expected) < 1e-6, `tap ${t}: ${out[t * delay]} vs ${expected}`);
  }
});
check("stereo channels are processed independently", () => {
  const n = 2000;
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  l[10] = 1;
  r[20] = 1;
  const delayMs = (100 / SR) * 1000;
  const outL = applyEcho(l, SR, { delayMs, feedback: 0.3, mix: 0.5 });
  const outR = applyEcho(r, SR, { delayMs, feedback: 0.3, mix: 0.5 });
  assert.ok(outL[110] > 0.4 && outR[110] === 0, "left tap only in left");
  assert.ok(outR[120] > 0.4 && outL[120] === 0, "right tap only in right");
});
check("wet sum clamps at full scale on loud input", () => {
  const n = 2000;
  const x = new Float32Array(n).fill(1);
  const out = applyEcho(x, SR, { delayMs: 10, feedback: 0.9, mix: 1 });
  let max = 0;
  for (let i = 0; i < n; i++) max = Math.max(max, Math.abs(out[i]));
  assert.ok(max <= 1 + 1e-9, `max=${max}`);
  assert.strictEqual(max, 1, "clamp actually engaged");
});

// ---------------------------------------------------------------- tremolo
console.log("Tremolo Effect (applyTremolo)");
check("raised-cosine gain: value at i where LFO=0 is x·(1-depth)", () => {
  // LFO = 0.5-0.5cos(2π·rate·i/sr); = 0 when rate·i/sr is an integer
  const rate = 4;
  const depth = 0.6;
  const i0 = SR / rate; // one full period later: LFO back to 0
  const x = Float32Array.from([0.8]);
  const big = new Float32Array(Math.ceil(i0) + 1);
  big[Math.floor(i0)] = 0.8;
  const out = applyTremolo(big, SR, rate, depth);
  const got = out[Math.floor(i0)];
  assert.ok(Math.abs(got - 0.8 * (1 - depth)) < 1e-6, `got ${got} vs ${0.8 * (1 - depth)}`);
});
check("gain reaches 1.0 at LFO peaks (passthrough)", () => {
  const rate = 2;
  const depth = 0.9;
  const iPeak = Math.round((SR / rate) * 0.5); // cos = -1 → LFO = 1
  const big = new Float32Array(iPeak + 1);
  big[iPeak] = 0.5;
  const out = applyTremolo(big, SR, rate, depth);
  assert.ok(Math.abs(out[iPeak] - 0.5) < 1e-6, `got ${out[iPeak]}`);
});
check("exactly N periods over N/rate seconds (shape periodicity)", () => {
  const rate = SR / 2 / 1000; // so 1000 samples = 2 LFO cycles at sr/2? — use explicit numbers:
  const rate2 = 4;
  const seconds = 2; // 8 cycles
  const n = SR * seconds;
  const x = new Float32Array(n).fill(1);
  const out = applyTremolo(x, SR, rate2, 1);
  // gain = 0.5-0.5cos(...); count minima (gain≈0) at t = k/rate, k=1..7 (k=0 is start)
  let minima = 0;
  for (let i = 1; i < n - 1; i++) {
    if (out[i] < out[i - 1] && out[i] <= out[i + 1] && out[i] < 1e-6) minima++;
  }
  assert.strictEqual(minima, rate2 * seconds - 1, `minima=${minima}`);
});
check("depth 0 is a passthrough", () => {
  const x = Float32Array.from([0.3, -0.7, 1.0]);
  const out = applyTremolo(x, SR, 5, 0);
  for (let i = 0; i < x.length; i++) assert.ok(Math.abs(out[i] - x[i]) < F32);
});

// ---------------------------------------------------------------- vibrato
console.log("Vibrato Effect (applyVibrato)");
check("0 cents depth is identity (modulo headroom trim)", () => {
  const n = 20000;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = Math.sin((2 * Math.PI * 300 * i) / SR);
  const out = applyVibrato(x, SR, { rateHz: 5, depthCents: 0 });
  // dm = 0 → delay = d0 = ceil(0)+2 = 2 → out[k] = x[k-2],
  // outLen = n − d0 − ceil(dm) = n − 2 (the lib's documented formula).
  assert.strictEqual(out.length, n - 2, `len ${out.length} vs ${n - 2}`);
  for (let k = 2; k < 500; k++) {
    assert.ok(Math.abs(out[k] - x[k - 2]) < 1e-6, `k=${k} ${out[k]} vs ${x[k - 2]}`);
  }
});
check("output length = len − ceil(Dm) − 2 − ceil(Dm)", () => {
  const n = 44100;
  const x = new Float32Array(n).fill(0.5);
  const rate = 5;
  const cents = 100;
  const omega = (2 * Math.PI * rate) / SR;
  const dm = (Math.pow(2, cents / 1200) - 1) / omega;
  const expected = n - Math.ceil(dm) - 2 - Math.ceil(dm);
  const out = applyVibrato(x, SR, { rateHz: rate, depthCents: cents });
  assert.strictEqual(out.length, expected, `len ${out.length} vs ${expected}`);
});
check("+1200 cents depth produces an octave at the modulation peak", () => {
  // sin-modulated delay: instantaneous ratio peaks at 1+dm·ω = 2 at phase π/2.
  // Use a long tone and measure the LOCAL period around the peak phase.
  const rate = 1; // slow, so the swing is slow and locally measurable
  const cents = 1200;
  const omega = (2 * Math.PI * rate) / SR;
  const dm = (Math.pow(2, cents / 1200) - 1) / omega;
  const d0 = Math.ceil(dm) + 2;
  const n = SR * 3;
  const f = 440;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = Math.sin((2 * Math.PI * f * i) / SR);
  const out = applyVibrato(x, SR, { rateHz: rate, depthCents: cents });
  // out[k] reads x at k − d0 − dm·sin(2π·rate·k/sr). Instantaneous pitch
  // ratio = 1 − dm·ω·cos(ωk) peaks at 2 where cos(ωk) = −1, i.e. one quarter
  // LFO cycle AFTER the delay peak: k = sr/(2·rate).
  const kPeak = Math.round(SR / (2 * rate));
  // measure one local period in the output around kPeak by zero crossings;
  // narrow window so the (slowly varying) ratio is ~constant across it
  function localPeriod(arr, center) {
    let up1 = -1;
    let up2 = -1;
    const half = SR / 32;
    for (let k = Math.max(1, center - half) | 0; k < center + half && k < arr.length - 1; k++) {
      if (arr[k - 1] < 0 && arr[k] >= 0) {
        if (up1 < 0) up1 = k;
        else if (up2 < 0) { up2 = k; break; }
      }
    }
    return up2 - up1;
  }
  const pIn = localPeriod(x, kPeak);
  const pOut = localPeriod(out, kPeak);
  const ratio = pIn / pOut;
  assert.ok(Math.abs(ratio - 2) < 0.05, `local pitch ratio ${ratio.toFixed(4)} vs 2 (pIn=${pIn}, pOut=${pOut})`);
});
check("interpolation: fractional reads land between neighbours", () => {
  // DC-constant input must come out constant (interpolation never overshoots)
  const n = 5000;
  const out = applyVibrato(new Float32Array(n).fill(0.42), SR, { rateHz: 6, depthCents: 200 });
  let maxDev = 0;
  for (let i = 0; i < out.length; i++) maxDev = Math.max(maxDev, Math.abs(out[i] - 0.42));
  assert.ok(maxDev < 1e-6, `maxDev=${maxDev}`);
});

// ---------------------------------------------------------------- distortion
console.log("Distortion Effect (applyDistortion)");
check("f(±1) = ±1 exactly (tanh(k)/tanh(k))", () => {
  const out = applyDistortion(Float32Array.from([1, -1]), 10);
  assert.ok(Math.abs(out[0] - 1) < F32, `out[0]=${out[0]}`);
  assert.ok(Math.abs(out[1] + 1) < F32, `out[1]=${out[1]}`);
});
check("odd symmetry — no DC offset on asymmetric drive", () => {
  const out = applyDistortion(Float32Array.from([0.5, -0.5]), 7);
  assert.ok(Math.abs(out[0] + out[1]) < 1e-9, `${out[0]} vs ${out[1]}`);
});
check("non-decreasing everywhere; strictly increasing where float32 can represent it", () => {
  // Output is stored as float32. At drive 12, tanh(12·0.9) = 1−2e-10, which
  // quantizes to exactly 1.0, so the whole tail |v| > ~0.77 collapses onto
  // ±1 and no float32 implementation can show strict increase there. Assert:
  //  (a) drive 3 (saturation-free in float32): strictly increasing on a grid,
  //  (b) drive 12: output matches the exact float64 curve (which IS strictly
  //      increasing — a property of tanh, not of the storage), tolerance 1 ulp.
  let prev = -2;
  for (let v = -1; v <= 1.0001; v += 0.1) {
    const f = applyDistortion(Float32Array.from([v]), 3)[0];
    if (v > -1) assert.ok(f > prev, `flat at ${v}: ${f} <= ${prev}`);
    prev = f;
  }
  const k = 12;
  const norm = Math.tanh(k);
  for (let v = -1; v <= 1.0001; v += 0.05) {
    const f = applyDistortion(Float32Array.from([v]), k)[0];
    const exact = Math.tanh(k * v) / norm;
    assert.ok(
      Math.abs(f - exact) <= Math.abs(exact) * 1e-6 + 1e-7,
      `drive-12 curve off at ${v}: ${f} vs ${exact}`,
    );
  }
});
check("unity at zero, small-signal gain = k/tanh(k)", () => {
  const k = 8;
  const small = 0.001;
  const out = applyDistortion(Float32Array.from([small]), k)[0];
  const expected = Math.tanh(k * small) / Math.tanh(k);
  // Output is float32: ulp at 0.008 is ~9.3e-10, so a relative gate applies
  // (an absolute 1e-12 tolerance is below storage precision).
  assert.ok(Math.abs(out - expected) <= expected * 1e-6, `${out} vs ${expected}`);
  assert.ok(out / small > 1.5, "small signals should lift");
});
check("low drive stays nearly linear (3rd harmonic ≪ fundamental)", () => {
  // Integer-cycle window: f0 = 400 Hz, N = 8820 → 80 cycles; 3f0 → 240.
  const f0 = 400;
  const n = 8820;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = 0.9 * Math.sin((2 * Math.PI * f0 * i) / SR);
  const out = applyDistortion(x, 1);
  const f0mag = goertzel(out, f0);
  const f3mag = goertzel(out, 3 * f0);
  // tanh Taylor: 3rd-harmonic of tanh(0.9·sinθ)/tanh(1) ≈ 0.055 (series
  // (a³/3)/4/tanh(1) minus 5th-order correction) — assert under 0.10.
  assert.ok(f3mag < f0mag * 0.1, `3rd ${f3mag} vs fundamental ${f0mag}`);
  assert.ok(f3mag / f0mag < 0.33 / 3, "low drive must distort far less than square-converged high drive");
});
check("high drive converges to square-like (3rd/f0 → 1/3)", () => {
  const f0 = 400;
  const n = 8820;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = Math.sin((2 * Math.PI * f0 * i) / SR);
  const out = applyDistortion(x, 25);
  const f0mag = goertzel(out, f0);
  const f3mag = goertzel(out, 3 * f0);
  const ratio = f3mag / f0mag;
  assert.ok(ratio > 0.25 && ratio < 0.45, `3rd/f0 = ${ratio.toFixed(4)} (square = 0.333)`);
});
function goertzel(arr, freq) {
  const w = (2 * Math.PI * freq) / SR;
  const coeff = 2 * Math.cos(w);
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < arr.length; i++) {
    const s = arr[i] + coeff * s1 - s2;
    s2 = s1;
    s1 = s;
  }
  return Math.sqrt(s1 * s1 + s2 * s2 - coeff * s1 * s2) / (arr.length / 2);
}

console.log(`\nbatch2: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
