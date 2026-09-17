/**
 * Batch 28 Node verification — apply8D spatial rotation (lib/edit.ts).
 * Recompile: npx tsc src/domains/audio/lib/edit.ts --outDir scratch/.batch28 --module commonjs --target es2020 --skipLibCheck
 */
const assert = require("assert");
const e = require("./.batch28/edit.js");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ok - " + name);
  } catch (err) {
    console.error("  FAIL - " + name + ":", err.message);
    process.exitCode = 1;
  }
}

const sr = 48000;
const sine = (sec, amp, freq) => {
  const n = Math.round(sr * sec);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = amp * Math.sin((2 * Math.PI * freq * i) / sr);
  return a;
};

check("apply8D: rotation period — gains hit cos/sin extremes on a DC source", () => {
  const rot = 4; // seconds per revolution
  const n = sr * rot;
  const dc = new Float32Array(n).fill(0.5);
  const [l, r] = e.apply8D(dc, sr, { rotationSec: rot, depth: 0 });
  const q = Math.round(0.25 * n); // p = π/2: left 0, right full
  const h = Math.round(0.5 * n); // p = π: left −full, right 0
  const t = Math.round(0.75 * n); // p = 3π/2: left 0, right −full
  assert.ok(Math.abs(l[q]) < 0.01, `left at π/2 = ${l[q].toFixed(3)}`);
  assert.ok(Math.abs(r[q] - 0.5) < 0.01, `right at π/2 = ${r[q].toFixed(3)}`);
  assert.ok(Math.abs(l[h] + 0.5) < 0.01, `left at π = ${l[h].toFixed(3)} (polarity through the back)`);
  assert.ok(Math.abs(l[t]) < 0.01, `left at 3π/2 = ${l[t].toFixed(3)}`);
  assert.ok(Math.abs(r[t] + 0.5) < 0.01, `right at 3π/2 = ${r[t].toFixed(3)}`);
});

check("apply8D: constant power — gl²+gr² = 1 at every sample", () => {
  const s = sine(0.5, 0.5, 440);
  const [l, r] = e.apply8D(s, sr, { rotationSec: 6, depth: 0 });
  // verify via a full-amplitude DC-like signal: |out|/in = gain
  const dc = new Float32Array(sr).fill(0.5);
  const [dl, dr] = e.apply8D(dc, sr, { rotationSec: 6, depth: 0 });
  let worst = 0;
  for (let i = 0; i < sr; i += 7) {
    const gl = dl[i] / 0.5;
    const gr = dr[i] / 0.5;
    worst = Math.max(worst, Math.abs(gl * gl + gr * gr - 1));
  }
  assert.ok(worst < 1e-6, `power error ${worst.toExponential(2)}`);
  void l; void r;
});

check("apply8D: ITD present at depth 1, absent at depth 0", () => {
  const rot = 6;
  // A structured source — DC cannot reveal a delay (every shift matches).
  const s = sine(rot, 0.5, 440);
  const deep = e.apply8D(s, sr, { rotationSec: rot, depth: 1 });
  const flat = e.apply8D(s, sr, { rotationSec: rot, depth: 0 });
  // At p = π (half revolution) the left gain is −1 and the full dMax delay
  // applies: left[t] = −s[t − dMax]. dMax = 0.65 ms × 48 kHz = 31 samples.
  const mid = Math.round((sr * rot) / 2);
  const dMax = Math.round((0.65 / 1000) * sr);
  const gotDelay = (() => {
    for (let d = 0; d < 64; d++) {
      if (Math.abs(deep[0][mid] + s[mid - d]) < 1e-6) return d;
    }
    return -1;
  })();
  assert.ok(gotDelay === dMax, `delay at p=π is ${gotDelay}, expected ${dMax}`);
  // depth 0: pure pan, zero delay (left[t] = −s[t] exactly).
  assert.ok(Math.abs(flat[0][mid] + s[mid]) < 1e-6, "depth 0 should be delay-free");
});

check("apply8D: output is stereo at input length", () => {
  const s = sine(0.3, 0.5, 440);
  const [l, r] = e.apply8D(s, sr, { rotationSec: 5, depth: 0.5 });
  assert.strictEqual(l.length, s.length);
  assert.strictEqual(r.length, s.length);
});

console.log(passed + " checks passed");
if (process.exitCode) process.exit(1);
