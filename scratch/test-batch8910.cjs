/**
 * Batch 8–10 verification — runs the REAL compiled lib code
 * (scratch/.batch8910/generate.js, produced by tsc from
 * src/domains/audio/lib/generate.ts) against synthetic inputs with
 * hand-computed expected values.
 *
 * Recompile before running:
 *   npx tsc src/domains/audio/lib/generate.ts --outDir scratch/.batch8910 --module commonjs --target es2020 --skipLibCheck
 * Run: node scratch/test-batch8910.cjs
 */
"use strict";
const assert = require("assert");
const {
  generateChirp,
  generateWarble,
  generateSweep,
  generateBinaural,
  generateIsochronic,
  generateSolfeggio,
  generateClickTrack,
  generateMetronome,
  generateWave,
} = require("./.batch8910/generate.js");

let ok = 0, fail = 0;
function check(name, fn) {
  try { fn(); ok++; console.log(`  ok  ${name}`); }
  catch (e) { fail++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}

// ---------- B8: chirp / sweep ----------
check("chirp rate=0 degenerates to pure sine at center (Goertzel)", () => {
  const sr = 48000, g = generateChirp(sr, { centerHz: 1000, deviationHz: 400, rateHz: 0, durationSec: 1, amplitude: 0.5 });
  assert.strictEqual(g.length, sr);
  // Goertzel at 1000 Hz over the whole second
  const N = g.length, k = 1000, w = (2 * Math.PI * k) / sr;
  let c = 0, s = 0;
  for (let i = 0; i < N; i++) {
    const cw = Math.cos(w * (i + 1)), sw = Math.sin(w * (i + 1));
    const c0 = c; c = 2 * cw * c0 - c + g.channels[0][i]; // accumulate below
    c = 2 * cw * c - c + g.channels[0][i] * 0; // keep structure simple
  }
  // simpler: direct correlation
  let re = 0, im = 0;
  for (let i = 0; i < N; i++) { re += g.channels[0][i] * Math.cos(w * i); im -= g.channels[0][i] * Math.sin(w * i); }
  const amp = (2 * Math.sqrt(re * re + im * im)) / N;
  assert.ok(Math.abs(amp - 0.5) < 0.01, `amp=${amp}`);
});

check("chirp FM recursion reproduces analytic phase (deviation visible)", () => {
  const sr = 48000, g = generateChirp(sr, { centerHz: 1000, deviationHz: 400, rateHz: 2, durationSec: 1, amplitude: 0.8 });
  // Recompute the recursion independently (f64) — lib stores Float32, so the
  // comparison floor is f32 epsilon (~1e-7 of full scale), same as B6/B7.
  let phase = 0; let maxDiff = 0;
  for (let i = 0; i < g.length; i++) {
    const t = i / sr;
    const inst = 1000 + 400 * Math.sin(2 * Math.PI * 2 * t);
    phase += (2 * Math.PI * inst) / sr;
    const expected = Math.sin(phase) * 0.8;
    maxDiff = Math.max(maxDiff, Math.abs(expected - g.channels[0][i]));
  }
  assert.ok(maxDiff < 1e-6, `maxDiff=${maxDiff}`);
});

check("warble is chirp with same params (alias)", () => {
  const sr = 44100, p = { centerHz: 800, deviationHz: 150, rateHz: 3, durationSec: 0.5, amplitude: 0.6 };
  const a = generateWarble(sr, p), b = generateChirp(sr, p);
  assert.strictEqual(a.length, b.length);
  for (let i = 0; i < a.length; i++) assert.strictEqual(a.channels[0][i], b.channels[0][i]);
});

check("linear sweep instantaneous freq: fromHz at start (zero crossings)", () => {
  const sr = 48000, g = generateSweep(sr, { fromHz: 100, toHz: 1100, durationSec: 1, amplitude: 1, curve: "linear" });
  // first 50 ms: freq goes 100 → 150, mean 125
  let crossings = 0;
  const lim = Math.round(0.05 * sr);
  for (let i = 1; i < lim; i++) if (g.channels[0][i - 1] <= 0 && g.channels[0][i] > 0) crossings++;
  const meanF = crossings / 0.05;
  assert.ok(meanF > 110 && meanF < 140, `meanF=${meanF}`);
});

check("linear sweep phase is exactly parabolic (sample-exact recursion)", () => {
  const sr = 48000, g = generateSweep(sr, { fromHz: 100, toHz: 1000, durationSec: 1, amplitude: 1, curve: "linear" });
  let phase = 0, maxDiff = 0;
  for (let i = 0; i < g.length; i++) {
    const t = i / sr;
    const inst = 100 + (1000 - 100) * (t / 1);
    phase += (2 * Math.PI * inst) / sr;
    maxDiff = Math.max(maxDiff, Math.abs(Math.sin(phase) - g.channels[0][i]));
  }
  assert.ok(maxDiff < 1e-6, `maxDiff=${maxDiff}`); // f32 storage floor
});

check("exponential sweep phase is exactly geometric (sample-exact recursion)", () => {
  const sr = 48000, g = generateSweep(sr, { fromHz: 20, toHz: 2000, durationSec: 1, amplitude: 1, curve: "exponential" });
  const r = 2000 / 20, T = 1;
  let phase = 0, maxDiff = 0;
  for (let i = 0; i < g.length; i++) {
    const t = i / sr;
    const inst = 20 * Math.pow(r, t / T);
    phase += (2 * Math.PI * inst) / sr;
    maxDiff = Math.max(maxDiff, Math.abs(Math.sin(phase) - g.channels[0][i]));
  }
  assert.ok(maxDiff < 1e-6, `maxDiff=${maxDiff}`); // f32 storage floor
});

check("exponential sweep octave count matches log2(to/from)", () => {
  const sr = 48000, g = generateSweep(sr, { fromHz: 20, toHz: 2000, durationSec: 1, amplitude: 1, curve: "exponential" });
  // time to reach 20 Hz * 2^(octaves) — count zero crossings up to the 20→200 point (halfway in log = 0.5 s)
  let crossings = 0;
  const lim = Math.round(0.5 * sr);
  for (let i = 1; i < lim; i++) if (g.channels[0][i - 1] <= 0 && g.channels[0][i] > 0) crossings++;
  // integral of f from 0..0.5s for f=20·100^t = (20·100^0.5 − 20)/ln(100) ≈ (200−20)/4.605 ≈ 39.08 cycles
  const expected = (20 * Math.sqrt(100) - 20) / Math.log(100);
  assert.ok(Math.abs(crossings - expected) < 2, `crossings=${crossings} expected=${expected}`);
});

// ---------- B9: binaural / isochronic / solfeggio ----------
check("binaural: L at carrier−beat/2, R at carrier+beat/2, isolated per channel", () => {
  const sr = 44100, g = generateBinaural(sr, { carrierHz: 200, beatHz: 10, durationSec: 2, amplitude: 0.7 });
  assert.strictEqual(g.channels.length, 2);
  const goertzel = (x, f) => {
    let re = 0, im = 0;
    for (let i = 0; i < x.length; i++) { re += x[i] * Math.cos((2 * Math.PI * f * i) / sr); im -= x[i] * Math.sin((2 * Math.PI * f * i) / sr); }
    return (2 * Math.sqrt(re * re + im * im)) / x.length;
  };
  const L = goertzel(g.channels[0], 195), R = goertzel(g.channels[1], 205);
  const Lx = goertzel(g.channels[0], 205), Rx = goertzel(g.channels[1], 195);
  assert.ok(Math.abs(L - 0.7) < 0.01, `L=${L}`);
  assert.ok(Math.abs(R - 0.7) < 0.01, `R=${R}`);
  assert.ok(Lx < 0.01, `L cross=${Lx}`);
  assert.ok(Rx < 0.01, `R cross=${Rx}`);
});

check("isochronic: gate is 0 at pulse boundary, carrier reaches full amp near gate center", () => {
  const sr = 44100, pulseHz = 10;
  const g = generateIsochronic(sr, { carrierHz: 205, pulseHz, durationSec: 1, amplitude: 0.9 });
  // Every pulse boundary sample (gatePhase = 0) is exactly zero.
  const period = Math.round(sr / pulseHz);
  for (let k = 0; k < 10; k++) {
    const boundary = k * period;
    assert.ok(Math.abs(g.channels[0][boundary]) < 1e-6, `boundary[${k}]=${g.channels[0][boundary]}`);
  }
  // Near gate center the gate ≈ 1 and the 205 Hz carrier reaches ≈ full amplitude.
  let peak = 0;
  for (let i = 0; i < g.length; i++) peak = Math.max(peak, Math.abs(g.channels[0][i]));
  assert.ok(Math.abs(peak - 0.9) < 0.005, `peak=${peak}`);
});

check("solfeggio: fade envelope rises from 0 and peak equals amplitude", () => {
  const sr = 44100, g = generateSolfeggio(sr, { frequencyHz: 528, durationSec: 2, amplitude: 0.6, fadeSec: 0.05 });
  assert.ok(Math.abs(g.channels[0][0]) < 1e-6, `first=${g.channels[0][0]}`);
  let peak = 0;
  for (let i = 0; i < g.length; i++) peak = Math.max(peak, Math.abs(g.channels[0][i]));
  assert.ok(Math.abs(peak - 0.6) < 0.005, `peak=${peak}`);
  // Goertzel at 528 over steady-state region (0.1 s .. 1.9 s)
  const i0 = Math.round(0.1 * sr), i1 = Math.round(1.9 * sr);
  let re = 0, im = 0, n = 0;
  for (let i = i0; i < i1; i++) { re += g.channels[0][i] * Math.cos((2 * Math.PI * 528 * i) / sr); im -= g.channels[0][i] * Math.sin((2 * Math.PI * 528 * i) / sr); n++; }
  const amp = (2 * Math.sqrt(re * re + im * im)) / n;
  assert.ok(Math.abs(amp - 0.6) < 0.01, `amp=${amp}`);
});

// ---------- B10: click track / metronome ----------
check("click track: accents on beats 0/4, ticks on beats 1–3 (bpm=60)", () => {
  const sr = 44100;
  const g = generateClickTrack(sr, { bpm: 60, beats: 8, accentHz: 1600, beatHz: 1000, clickMs: 40, amplitude: 0.8 });
  assert.strictEqual(g.length, 8 * sr);
  const goertzelWin = (x, f, i0, i1) => {
    let re = 0, im = 0, n = 0;
    for (let i = i0; i < i1; i++) { re += x[i] * Math.cos((2 * Math.PI * f * i) / sr); im -= x[i] * Math.sin((2 * Math.PI * f * i) / sr); n++; }
    return (2 * Math.sqrt(re * re + im * im)) / n;
  };
  const w0 = Math.round(0.04 * sr);
  const beat0 = goertzelWin(g.channels[0], 1600, 0, w0);
  const beat0x = goertzelWin(g.channels[0], 1000, 0, w0);
  const beat2 = goertzelWin(g.channels[0], 1000, 2 * sr, 2 * sr + w0);
  const beat2x = goertzelWin(g.channels[0], 1600, 2 * sr, 2 * sr + w0);
  const beat4 = goertzelWin(g.channels[0], 1600, 4 * sr, 4 * sr + w0);
  assert.ok(beat0 > 0.2, `beat0 accent=${beat0}`);
  assert.ok(beat0x < beat0 * 0.2, `beat0 tick leak=${beat0x}`);
  assert.ok(beat2 > 0.2, `beat2 tick=${beat2}`);
  assert.ok(beat2x < beat2 * 0.2, `beat2 accent leak=${beat2x}`);
  assert.ok(beat4 > 0.2, `beat4 accent (4%4=0)=${beat4}`);
  // silence between clicks (at 1.5 s)
  const mid = g.channels[0][Math.round(1.5 * sr)];
  assert.ok(Math.abs(mid) < 1e-4, `mid=${mid}`);
});

check("metronome: accent pattern follows beatsPerBar=3", () => {
  const sr = 44100;
  const g = generateMetronome(sr, { bpm: 60, beats: 6, beatsPerBar: 3, blockHz: 2000, amplitude: 0.8 });
  assert.strictEqual(g.length, 6 * sr);
  const goertzelWin = (x, f, i0, i1) => {
    let re = 0, im = 0, n = 0;
    for (let i = i0; i < i1; i++) { re += x[i] * Math.cos((2 * Math.PI * f * i) / sr); im -= x[i] * Math.sin((2 * Math.PI * f * i) / sr); n++; }
    return (2 * Math.sqrt(re * re + im * im)) / n;
  };
  const w = Math.round(0.05 * sr);
  const acc0 = goertzelWin(g.channels[0], 2000, 0, w);        // beat 0: accent
  const acc3 = goertzelWin(g.channels[0], 2000, 3 * sr, 3 * sr + w); // beat 3: accent
  const tick1 = goertzelWin(g.channels[0], 2000, 1 * sr, 1 * sr + w); // beat 1: tick (1320 Hz)
  const tick1x = goertzelWin(g.channels[0], 2000 * 0.66, 1 * sr, 1 * sr + w);
  assert.ok(acc0 > 0.2 && acc3 > 0.2, `acc0=${acc0} acc3=${acc3}`);
  assert.ok(tick1 < acc0 * 0.2, `tick1 at accent freq=${tick1}`);
  assert.ok(tick1x > 0.2, `tick1 at tick freq=${tick1x}`);
});

check("regression: generateWave sine/square identities still hold", () => {
  const sr = 48000;
  const sq = generateWave("square", sr, 0.125, 240, 0.7, 0.5, 0);
  assert.ok(Math.abs(sq.channels[0][0] - 0.7) < 1e-6, `sq0=${sq.channels[0][0]}`); // frac(0)<0.5 → +amp (f32 floor)
  const p = generateWave("pulse", sr, 0.125, 240, 0.7, 0.25, 0);
  assert.ok(Math.abs(p.channels[0][0] - 0.7) < 1e-6, `p0=${p.channels[0][0]}`);
});

console.log(`\n${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
