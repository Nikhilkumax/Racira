/**
 * Batch 3 verification — runs the REAL compiled lib code
 * (scratch/.batch1/edit.js, produced by tsc from src/domains/audio/lib/edit.ts)
 * against synthetic inputs with hand-computed expected values.
 *
 * Recompile before running:
 *   npx tsc src/domains/audio/lib/edit.ts --outDir scratch/.batch1 --module commonjs --target es2020 --skipLibCheck
 * Run: node scratch/test-batch3.cjs
 */
"use strict";
const assert = require("assert");
const {
  applyRingModulation,
  applyStereoWidener,
  monoToStereo,
  stereoToMono,
  encodeMidSide,
  decodeMidSide,
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

// ---------------------------------------------------------------------------
// applyRingModulation
// ---------------------------------------------------------------------------
console.log("applyRingModulation");
{
  // Impulse at s=100, f=50 Hz, sr=1000 → carrier period 20 samples.
  // Every output sample must equal x[i]·cos(2π·f·i/sr) exactly.
  const sr = 1000;
  const f = 50;
  const x = new Float32Array(256);
  x[100] = 1;
  const out = applyRingModulation(x, sr, f, 0);
  check("impulse response equals the exact carrier cosine", () => {
    for (let i = 0; i < 256; i++) {
      const expected = x[i] * Math.cos((2 * Math.PI * f * i) / sr);
      assert.ok(Math.abs(out[i] - expected) < 1e-12, `sample ${i}: ${out[i]} vs ${expected}`);
    }
  });
}

{
  // Identity case: f = 0 Hz (constant 1·cos(phase)) → out = x·cos(phase).
  const x = new Float32Array([0.5, -0.25, 0.75]);
  const out = applyRingModulation(x, 44100, 0, 90);
  check("f=0 with phase 90° zeroes everything (cos(π/2)=0)", () => {
    for (let i = 0; i < x.length; i++) assert.ok(Math.abs(out[i]) < 1e-15, `sample ${i} = ${out[i]}`);
  });
}

{
  // Odd symmetry: an odd-symmetric input through a symmetric window.
  // Also: sideband check — 440 Hz tone × 440 Hz carrier → DC + 880 Hz.
  // Use a full integer cycle count so a Goertzel read is leakage-free.
  const sr = 8000;
  const n = 8000; // exactly 440 cycles of 440 Hz, 1 s
  const f0 = 440;
  const data = new Float32Array(n);
  for (let i = 0; i < n; i++) data[i] = Math.sin((2 * Math.PI * f0 * i) / sr);
  const out = applyRingModulation(data, sr, f0, 0);
  // sin·cos = ½sin(2ωt) → exactly one spectral line at 880 Hz.
  const g = (freq) => {
    const w = (2 * Math.PI * freq) / sr;
    let c = 0;
    let s = 0;
    for (let i = 0; i < n; i++) {
      c += out[i] * Math.cos(w * i);
      s += out[i] * Math.sin(w * i);
    }
    return (2 * Math.hypot(c, s)) / n;
  };
  const at880 = g(880);
  const at440 = g(440);
  check("sin(440)·cos(440) → single line at 880 Hz (½ amplitude), zero at 440", () => {
    assert.ok(Math.abs(at880 - 0.5) < 0.01, `880 Hz magnitude ${at880}`);
    assert.ok(Math.abs(at440) < 0.005, `440 Hz magnitude ${at440}`);
  });
}

// ---------------------------------------------------------------------------
// applyStereoWidener
// ---------------------------------------------------------------------------
console.log("applyStereoWidener");
{
  // M/S width algebra, exactly computable per sample:
  //   outL = M + w·S, outR = M − w·S where M = (L+R)/2, S = (L−R)/2.
  // Fixture: L = 0.8·sine, R = 0.6·sine (same phase) at 48 kHz.
  const n = 4800;
  const left = new Float32Array(n);
  const right = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    left[i] = Math.fround(0.8 * Math.sin((2 * Math.PI * 800 * i) / 48000));
    right[i] = Math.fround(0.6 * Math.sin((2 * Math.PI * 800 * i) / 48000));
  }

  // w = 1 must be exact identity.
  const id = applyStereoWidener(left, right, { width: 1 });
  check("width=1 returns exact identity", () => {
    for (let i = 0; i < n; i++) {
      assert.strictEqual(id.left[i], left[i], `L[${i}]`);
      assert.strictEqual(id.right[i], right[i], `R[${i}]`);
    }
  });

  // w = 1.4: outL = (0.7+0.7)·... per-sample against fround of the formula.
  const w = 1.4;
  const wide = applyStereoWidener(left, right, { width: w });
  check("per-sample M/S algebra exact (fround of the formula)", () => {
    for (let i = 0; i < n; i++) {
      const m = (left[i] + right[i]) / 2;
      const s = (left[i] - right[i]) / 2;
      const expL = Math.fround(m + w * s);
      const expR = Math.fround(m - w * s);
      assert.ok(Math.abs(wide.left[i] - expL) < 1e-9, `L[${i}] ${wide.left[i]} vs ${expL}`);
      assert.ok(Math.abs(wide.right[i] - expR) < 1e-9, `R[${i}] ${wide.right[i]} vs ${expR}`);
    }
  });

  // Reported peak must be the true max |sample| of the output.
  let truePeak = 0;
  for (let i = 0; i < n; i++) {
    truePeak = Math.max(truePeak, Math.abs(wide.left[i]), Math.abs(wide.right[i]));
  }
  check("reported peak equals actual output peak", () => {
    assert.ok(Math.abs(wide.peak - truePeak) < 1e-9, `peak ${wide.peak} vs ${truePeak}`);
  });

  // w = 0 folds to exact mono sum on both channels.
  const folded = applyStereoWidener(left, right, { width: 0 });
  check("width=0 folds both channels to the exact mid signal", () => {
    for (let i = 0; i < n; i++) {
      const m = Math.fround((left[i] + right[i]) / 2);
      assert.strictEqual(folded.left[i], m, `L[${i}]`);
      assert.strictEqual(folded.right[i], m, `R[${i}]`);
    }
  });

  // Pure side signal (L = −R) grows by exactly w and the peak reports it.
  const sideOnlyL = new Float32Array(1000);
  for (let i = 0; i < 1000; i++) sideOnlyL[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / 48000);
  const sideOnly = applyStereoWidener(sideOnlyL, Float32Array.from(sideOnlyL, (v) => -v), {
    width: 2,
  });
  check("pure-side content scaled exactly by w; peak reflects it", () => {
    for (let i = 0; i < 1000; i++) {
      assert.ok(Math.abs(sideOnly.left[i] - 2 * sideOnlyL[i]) < 1e-9, `L[${i}]`);
      assert.ok(Math.abs(sideOnly.right[i] + 2 * sideOnlyL[i]) < 1e-9, `R[${i}]`);
    }
    assert.ok(Math.abs(sideOnly.peak - 1.0) < 1e-6, `peak ${sideOnly.peak}`);
  });
}

// ---------------------------------------------------------------------------
// monoToStereo / stereoToMono
// ---------------------------------------------------------------------------
console.log("monoToStereo / stereoToMono");
{
  const mono = new Float32Array([0.5, -0.25, 0.1, -0.9]);
  const [l, r] = monoToStereo(mono);
  check("mono duplicated to identical L/R (copies, not aliases)", () => {
    assert.strictEqual(l.length, 4);
    assert.strictEqual(r.length, 4);
    for (let i = 0; i < 4; i++) {
      assert.strictEqual(l[i], mono[i]);
      assert.strictEqual(r[i], mono[i]);
    }
    l[0] = 99;
    assert.strictEqual(mono[0], 0.5, "mono must not be mutated (slice, not alias)");
  });
}

{
  const l = new Float32Array([0.8, -0.2, 0.5]);
  const r = new Float32Array([0.2, 0.6, -0.1]);
  const mono = stereoToMono(l, r);
  check("(L+R)/2 exact at every sample (float32 storage rounding)", () => {
    for (let i = 0; i < 3; i++) {
      const expected = Math.fround((l[i] + r[i]) / 2);
      assert.ok(Math.abs(mono[i] - expected) < 1e-15, `sample ${i}: ${mono[i]} vs ${expected}`);
    }
  });
}

{
  // Identical L/R → mono returns the source waveform exactly.
  const x = new Float32Array(1000);
  for (let i = 0; i < 1000; i++) x[i] = Math.sin((2 * Math.PI * 440 * i) / 8000);
  const mono = stereoToMono(x.slice(), x.slice());
  check("identical L/R folds back to the exact source", () => {
    for (let i = 0; i < 1000; i++) assert.ok(Math.abs(mono[i] - x[i]) < 1e-12, `sample ${i}`);
  });
}

{
  // Out-of-phase stereo cancels to silence — the property that makes
  // stereo-to-mono a real mono-compatibility probe.
  const n = 800;
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = Math.sin((2 * Math.PI * 440 * i) / 8000) * 0.9;
  const mono = stereoToMono(a, Float32Array.from(a, (v) => -v));
  check("out-of-phase L/R cancels to silence", () => {
    for (let i = 0; i < n; i++) assert.ok(Math.abs(mono[i]) < 1e-12, `sample ${i} = ${mono[i]}`);
  });
}

// ---------------------------------------------------------------------------
// encodeMidSide / decodeMidSide
// ---------------------------------------------------------------------------
console.log("encodeMidSide / decodeMidSide");
{
  // Asymmetric stereo file: L = 440 Hz sine, R = 0.3·310 Hz sine.
  const n = 16000;
  const sr = 8000;
  const left = new Float32Array(n);
  const right = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    left[i] = Math.sin((2 * Math.PI * 440 * i) / sr);
    right[i] = 0.3 * Math.sin((2 * Math.PI * 310 * i) / sr);
  }
  const { mid, side } = encodeMidSide(left, right);

  check("M/S encode values exact (float32 storage rounding)", () => {
    for (let i = 0; i < n; i++) {
      const expMid = Math.fround((left[i] + right[i]) / 2);
      const expSide = Math.fround((left[i] - right[i]) / 2);
      assert.ok(Math.abs(mid[i] - expMid) < 1e-9, `mid[${i}] ${mid[i]} vs ${expMid}`);
      assert.ok(Math.abs(side[i] - expSide) < 1e-9, `side[${i}] ${side[i]} vs ${expSide}`);
    }
  });

  check("mono content → silent side channel", () => {
    const m = new Float32Array(n);
    for (let i = 0; i < n; i++) m[i] = Math.sin((2 * Math.PI * 440 * i) / sr);
    const ms = encodeMidSide(m, m);
    for (let i = 0; i < n; i++) assert.ok(Math.abs(ms.side[i]) < 1e-12, `side[${i}]`);
  });
}

console.log(`\\nBatch 3: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
