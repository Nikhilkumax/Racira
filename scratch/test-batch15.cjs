/**
 * Batch 15–16 verification — the REAL compiled edit.js channel functions
 * against hand-computed expected values.
 *
 * Recompile: npx tsc src/domains/audio/lib/edit.ts --outDir scratch/.batch15 --module commonjs --target es2020 --skipLibCheck
 * Run:       node scratch/test-batch15.cjs
 */
"use strict";
const assert = require("assert");
const {
  applyChannelMatrix, applyPan, applyBalance, removeDcOffset, invertPhase,
} = require("./.batch15/edit.js");

let ok = 0, fail = 0;
function check(name, fn) {
  try { fn(); ok++; console.log(`  ok  ${name}`); }
  catch (e) { fail++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const close = (a, b, eps) => Math.abs(a - b) < (eps ?? 1e-6);

const stereo = () => {
  const L = Float32Array.from([1, 0.5, -0.25, 0]);
  const R = Float32Array.from([0, 0.25, 0.75, -1]);
  return [L, R];
};

// ---------- B15 ----------
check("channel matrix: identity is passthrough; swap exchanges; downmix averages", () => {
  const id = applyChannelMatrix(stereo(), 1, 0, 0, 1);
  assert.deepStrictEqual([...id[0]], [1, 0.5, -0.25, 0]);
  assert.deepStrictEqual([...id[1]], [0, 0.25, 0.75, -1]);
  const swap = applyChannelMatrix(stereo(), 0, 1, 1, 0);
  assert.deepStrictEqual([...swap[0]], [0, 0.25, 0.75, -1]);
  assert.deepStrictEqual([...swap[1]], [1, 0.5, -0.25, 0]);
  const mono = applyChannelMatrix(stereo(), 0.5, 0.5, 0.5, 0.5);
  assert.ok(close(mono[0][0], 0.5));
  assert.ok(close(mono[1][0], 0.5));
  const out = applyChannelMatrix(stereo(), 1, 1, 1, 1); // L+R on both
  assert.ok(close(out[0][0], 1));
  assert.ok(close(out[1][3], -1));
});

check("mono to stereo via matrix: L to both outputs", () => {
  const m = [Float32Array.from([0.5, -0.5])];
  const s = applyChannelMatrix(m, 1, 0, 1, 0);
  assert.strictEqual(s.length, 2);
  assert.deepStrictEqual([...s[0]], [0.5, -0.5]);
  assert.deepStrictEqual([...s[1]], [0.5, -0.5]);
});

check("pan: center keeps energy, full L gives only L, equal-power law", () => {
  const sig = [Float32Array.from([1]), Float32Array.from([1])];
  const c = applyPan(sig, 0);
  assert.ok(close(c[0][0], 0.7071067811865476, 1e-6));
  assert.ok(close(c[1][0], 0.7071067811865476, 1e-6));
  const l = applyPan(sig, -1);
  assert.ok(close(l[0][0], 1, 1e-6));
  assert.ok(close(l[1][0], 0, 1e-9));
  const r = applyPan(sig, 1);
  assert.ok(close(r[0][0], 0, 1e-9));
  assert.ok(close(r[1][0], 1, 1e-6));
  // equal-power: center power = 1 (0.5+0.5)
  const p = c[0][0] ** 2 + c[1][0] ** 2;
  assert.ok(close(p, 1, 1e-6));
});

check("pan on mono upmixes to stereo", () => {
  const m = [Float32Array.from([0.5])];
  const s = applyPan(m, 0.5);
  assert.strictEqual(s.length, 2);
  assert.ok(s[1][0] > s[0][0]);
});

check("balance: center is unity; full L mutes R only (no energy change on L)", () => {
  const sig = [Float32Array.from([0.8]), Float32Array.from([0.4])];
  const c = applyBalance(sig, 0);
  assert.ok(close(c[0][0], 0.8));
  assert.ok(close(c[1][0], 0.4));
  const l = applyBalance(sig, -1);
  assert.ok(close(l[0][0], 0.8, 1e-6));
  assert.ok(close(l[1][0], 0, 1e-9));
  const r = applyBalance(sig, 1);
  assert.ok(close(r[0][0], 0, 1e-9));
  assert.ok(close(r[1][0], 0.4, 1e-6));
});

// ---------- B16 ----------
check("DC offset removal: subtracts measured mean exactly", () => {
  const x = Float32Array.from([0.5, 0.7, 0.3, 0.5]); // mean 0.5
  const y = removeDcOffset([x]);
  assert.deepStrictEqual([...y[0]].map(v => +v.toFixed(6)), [0, 0.2, -0.2, 0]);
  const stereoIn = [Float32Array.from([0.5, 0.5]), Float32Array.from([-0.25, 0.25])];
  const ys = removeDcOffset(stereoIn);
  assert.deepStrictEqual([...ys[0]].map(v => +v.toFixed(6)), [0, 0]);
  assert.deepStrictEqual([...ys[1]].map(v => +v.toFixed(6)), [-0.25, 0.25]);
});

check("phase inversion: exact negation, per-channel selection", () => {
  const s = stereo();
  const all = invertPhase(s, [true, true]);
  assert.deepStrictEqual([...all[0]].map(v => +v.toFixed(6)), [-1, -0.5, 0.25, 0]);
  assert.deepStrictEqual([...all[1]].map(v => +v.toFixed(6)), [0, -0.25, -0.75, 1]);
  const onlyL = invertPhase(s, [true, false]);
  assert.deepStrictEqual([...onlyL[0]].map(v => +v.toFixed(6)), [-1, -0.5, 0.25, 0]);
  assert.deepStrictEqual([...onlyL[1]], [0, 0.25, 0.75, -1]);
});

console.log(`\n${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
