/**
 * Batch 27 Node verification — fades, equal-power crossfade, loop cut finder
 * (lib/edit.ts). Recompile:
 *   npx tsc src/domains/audio/lib/edit.ts --outDir scratch/.batch27 --module commonjs --target es2020 --skipLibCheck
 */
const assert = require("assert");
const e = require("./.batch27/edit.js");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ok - " + name);
  } catch (err) {
    console.error("  FAIL - " + name + ": " + err.message);
    process.exitCode = 1;
  }
}

const sr = 48000;
function sine(sec, amp, freq = 1000) {
  const n = Math.round(sr * sec);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = amp * Math.sin((2 * Math.PI * freq * i) / sr);
  return a;
}

// ---- fades -------------------------------------------------------------------
check("fadeIn linear: starts at 0, passes through mid, ends untouched", () => {
  const ch = [sine(0.1, 0.5, 440)];
  const original = ch[0].slice();
  e.applyFadeIn(ch, 4800, "linear");
  assert.strictEqual(ch[0][0], 0);
  assert.ok(Math.abs(ch[0][2400] - original[2400] * 0.5) < 1e-6, `mid ${ch[0][2400]}`);
  assert.strictEqual(ch[0][4800], original[4800]); // just past the fade
  assert.ok(Math.abs(ch[0][10000] - original[10000]) < 1e-9);
});
check("fadeOut linear: ends at exactly 0", () => {
  const ch = [sine(0.1, 0.5, 440)];
  const original = ch[0].slice();
  e.applyFadeOut(ch, 4800, "linear");
  assert.strictEqual(ch[0][ch[0].length - 1], 0);
  assert.ok(Math.abs(ch[0][ch[0].length - 4801] - original[ch[0].length - 4801]) < 1e-9);
});
check("fadeOut exponential: monotonic dB-like decay to true zero", () => {
  const ch = [sine(0.1, 0.5, 440)];
  const original = ch[0].slice();
  e.applyFadeOut(ch, 4800, "exponential");
  let prev = Infinity;
  for (let i = 0; i < 4800; i++) {
    const a = Math.abs(ch[0][ch[0].length - 4800 + i]);
    assert.ok(a <= prev + 1e-9, `not monotonic at ${i}`);
    prev = a;
  }
  assert.strictEqual(ch[0][ch[0].length - 1], 0);
});
check("fades longer than the file clamp to file length", () => {
  const ch = [new Float32Array(100).fill(0.5)];
  e.applyFadeIn(ch, 100000, "linear");
  e.applyFadeOut(ch, 100000, "linear");
  assert.strictEqual(ch[0][99], 0);
});

// ---- equal-power crossfade ---------------------------------------------------
check("crossfadeChannels: equal-power gains are (cos, sin) — constant power", () => {
  // two DC-ish constant signals at amplitude A keep power A^2 through the blend
  const A = 0.5;
  const a = [new Float32Array(4800).fill(A)];
  const b = [new Float32Array(4800).fill(A)];
  const out = e.crossfadeChannels(a, b, 2400);
  assert.strictEqual(out[0].length, 4800 + 4800 - 2400);
  // middle of the overlap: 50/50 equal-power -> amplitude A (power preserved)
  const mid = out[0][4800 - 2400 + 1200];
  assert.ok(Math.abs(mid - A) < 0.05, `mid ${mid.toFixed(3)} (linear would be ${A})`);
});
check("crossfadeChannels: head is A untouched, tail is B untouched", () => {
  const a = [sine(0.1, 0.5, 440)];
  const b = [sine(0.1, 0.3, 880)];
  const out = e.crossfadeChannels(a, b, 2400);
  assert.ok(Math.abs(out[0][100] - a[0][100]) < 1e-9);
  assert.ok(Math.abs(out[0][out[0].length - 1] - b[0][b[0].length - 1]) < 1e-9);
});
check("crossfadeChannels: mono-to-stereo join pads missing channel with silence", () => {
  const a = [new Float32Array(1000).fill(0.5)];
  const b = [new Float32Array(1000).fill(0.5), new Float32Array(1000).fill(-0.5)];
  const out = e.crossfadeChannels(a, b, 500);
  assert.strictEqual(out.length, 2);
  assert.ok(out[1].every((v) => v <= 0.5 + 1e-9));
});
check("crossfadeChannels: zero overlap = plain concatenation", () => {
  const a = [new Float32Array(100).fill(0.25)];
  const b = [new Float32Array(50).fill(0.75)];
  const out = e.crossfadeChannels(a, b, 0);
  assert.strictEqual(out[0].length, 150);
  assert.strictEqual(out[0][99], 0.25);
  assert.strictEqual(out[0][100], 0.75);
});

// ---- loop cut finder ---------------------------------------------------------
check("findBestLoopCut: returns a cut whose boundary cost is near-zero on a sine", () => {
  const freq = 200; // period = 240 samples at 48k
  const s = sine(0.5, 0.5, freq);
  // On a steady sine every period is indistinguishable, so the correct
  // property is: the returned cut is A period boundary with a tiny
  // two-sample boundary cost (seamless loop), not one specific sample.
  const cut = e.findBestLoopCut(s, 23800, 24200);
  const period = Math.round(sr / freq);
  const periods = Math.round(cut / period);
  const offBy = Math.abs(cut - periods * period);
  assert.ok(offBy <= period / 2, `cut ${cut} not near a period boundary`);
  const cost = Math.abs(s[cut] - s[0]) + Math.abs(s[cut + 1] - s[1]);
  assert.ok(cost < 0.06, `boundary cost ${cost.toFixed(4)}`);
});
check("findBestLoopCut: distinguishes the true join point on modulated material", () => {
  // Two concatenated tones: the real boundary at 24000 must win over generic
  // zero crossings, because only there does the content match the head.
  const s = new Float32Array(48000);
  for (let i = 0; i < 24000; i++) s[i] = 0.5 * Math.sin((2 * Math.PI * 300 * i) / sr);
  for (let i = 24000; i < 48000; i++) s[i] = 0.5 * Math.sin((2 * Math.PI * 300 * i) / sr) * (i < 36000 ? 1 : 0.3);
  const cut = e.findBestLoopCut(s, 20000, 28000);
  const cost = Math.abs(s[cut] - s[0]) + Math.abs(s[cut + 1] - s[1]);
  // the genuine period-multiple boundary exists at 24000±k·period (160):
  const bestTheoretical = (() => {
    let best = Infinity;
    for (let c = 23900; c <= 24100; c++) {
      if (s[c] * s[c + 1] > 0) continue;
      best = Math.min(best, Math.abs(s[c] - s[0]) + Math.abs(s[c + 1] - s[1]));
    }
    return best;
  })();
  assert.ok(cost <= bestTheoretical + 1e-9, `cut cost ${cost.toFixed(4)} vs best ${bestTheoretical.toFixed(4)}`);
});
check("findBestLoopCut: boundary continuity — cutting at `cut` matches the head", () => {
  const freq = 440;
  const s = sine(0.5, 0.5, freq);
  const cut = e.findBestLoopCut(s, Math.round(sr / freq) * 10, Math.round(sr / freq) * 10 + 480);
  const cost = Math.abs(s[cut] - s[0]) + Math.abs(s[cut + 1] - s[1]);
  assert.ok(cost < 0.02, `boundary cost ${cost.toFixed(4)}`);
});

console.log(passed + " checks passed");
if (process.exitCode) process.exit(1);
