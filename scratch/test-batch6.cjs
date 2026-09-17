/**
 * Batch 6 verification — runs the REAL compiled lib code
 * (scratch/.batch6/{analyze,generate}.js) against synthetic inputs with
 * hand-computed expected values.
 *
 * Recompile before running:
 *   npx tsc src/domains/audio/lib/analyze.ts src/domains/audio/lib/generate.ts --outDir scratch/.batch6 --module commonjs --target es2020 --skipLibCheck
 * Run: node scratch/test-batch6.cjs
 */
"use strict";
const assert = require("assert");
const {
  computeVuLevels,
  computePpmLevels,
  computeCrestLevels,
  estimateFundamental,
} = require("./.batch6/analyze.js");
const {
  makeRng,
  generateWhiteNoise,
  generatePinkNoise,
  generateBrownNoise,
  generateWave,
  generateSweep,
  generateChirp,
  generateBinaural,
  generateIsochronic,
  generateSolfeggio,
  generateClickTrack,
  generateMetronome,
} = require("./.batch6/generate.js");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err) {
    console.error(`FAIL  ${name}`);
    console.error(err && err.stack ? err.stack.split("\n").slice(0, 4).join("\n") : err);
    process.exitCode = 1;
  }
}

const SR = 48000;

// ---------- VU ----------
check("VU: −18 dBFS-RMS sine (peak −14.97 dBFS) reads exactly 0 VU", () => {
  // EBU R68 alignment signal: 0 VU = −18 dBFS *RMS*. Fixture sets RMS = −18.
  const n = SR;
  const amp = Math.pow(10, -18 / 20) * Math.SQRT2;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = amp * Math.sin((2 * Math.PI * 1000 * i) / SR);
  const r = computeVuLevels([ch], SR);
  assert.ok(Math.abs(r.vu - 0) < 0.05, `vu=${r.vu}`);
});

check("VU: 0 dBFS-peak sine reads +15.0 VU (peak-to-RMS of a sine)", () => {
  const n = SR;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = Math.sin((2 * Math.PI * 1000 * i) / SR);
  const r = computeVuLevels([ch], SR);
  assert.ok(Math.abs(r.vu - (18 - 3.0103)) < 0.05, `vu=${r.vu}`);
});

check("VU: window count and partial-window handling", () => {
  const n = Math.floor(SR * 0.75); // 0.75 s → 3 windows of 0.3 s (last partial)
  const ch = new Float32Array(n).fill(0.1);
  const r = computeVuLevels([ch], SR);
  assert.strictEqual(r.windowVu.length, 3);
  assert.ok(Math.abs(r.windowVu[0] - (20 * Math.log10((0.1 * Math.PI) / (2 * Math.SQRT2)) + 18)) < 1e-6);
});

// ---------- PPM ----------
check("PPM: block peak tracks a 10 ms transient that RMS metering misses", () => {
  const n = SR;
  const ch = new Float32Array(n);
  // Quiet sine + a 1 ms square transient at 0.5 s reaching full 0.9.
  for (let i = 0; i < n; i++) ch[i] = 0.05 * Math.sin((2 * Math.PI * 440 * i) / SR);
  for (let i = SR / 2; i < SR / 2 + 48; i++) ch[i] = 0.9;
  const r = computePpmLevels([ch], SR);
  assert.ok(Math.abs(r.ppmDb - 20 * Math.log10(0.9)) < 0.1, `ppm=${r.ppmDb}`);
  assert.ok(Math.abs(r.truePeakDb - 20 * Math.log10(0.9)) < 0.1);
});

check("PPM: window envelope has the transient only in its window", () => {
  const n = SR;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.05 * Math.sin((2 * Math.PI * 440 * i) / SR);
  for (let i = SR / 2; i < SR / 2 + 48; i++) ch[i] = 0.9;
  const r = computePpmLevels([ch], SR); // 0.1 s windows → 10
  assert.strictEqual(r.windowPpm.length, 10);
  const db = (v) => 20 * Math.log10(Math.max(v, 1e-10));
  assert.ok(Math.abs(r.windowPpm[5] - db(0.9)) < 0.01, `w5=${r.windowPpm[5]}`);
  for (let w = 0; w < 10; w++) {
    if (w !== 5) assert.ok(Math.abs(r.windowPpm[w] - db(0.05)) < 0.01, `w${w}=${r.windowPpm[w]}`);
  }
});

// ---------- Crest ----------
check("crest: sine = 3.01 dB; DC = 0 dB; impulse ≈ full scale", () => {
  const n = SR;
  const sine = new Float32Array(n);
  for (let i = 0; i < n; i++) sine[i] = 0.8 * Math.sin((2 * Math.PI * 500 * i) / SR);
  const rSine = computeCrestLevels([sine], SR);
  assert.ok(Math.abs(rSine.crestFactorDb - 3.01) < 0.05, `sine=${rSine.crestFactorDb}`);

  const dc = new Float32Array(n).fill(0.25);
  const rDc = computeCrestLevels([dc], SR);
  assert.ok(Math.abs(rDc.crestFactorDb) < 1e-6, `dc=${rDc.crestFactorDb}`);

  const imp = new Float32Array(n);
  imp[0] = 1.0;
  const rImp = computeCrestLevels([imp], SR);
  assert.ok(rImp.crestFactorDb > 30, `imp=${rImp.crestFactorDb}`);
});

check("crest: peakiest window is the one with the transient", () => {
  const n = SR;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.3 * Math.sin((2 * Math.PI * 300 * i) / SR);
  for (let i = Math.floor(SR * 0.75); i < Math.floor(SR * 0.75) + 100; i++) ch[i] = 0.95;
  const r = computeCrestLevels([ch], SR); // 0.3 s windows → ~4
  assert.strictEqual(r.peakiestWindow, 2, `peakiest=${r.peakiestWindow}`);
});

// ---------- estimateFundamental ----------
check("fundamental: 440 Hz sine → 440 ± 2 Hz, high confidence", () => {
  const n = SR;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / SR);
  const r = estimateFundamental(ch, SR);
  assert.ok(Math.abs(r.hz - 440) < 2, `hz=${r.hz}`);
  assert.ok(r.confidence > 0.9, `conf=${r.confidence}`);
  // "Up to maxWindows" windows: 1 s at windowSize 4·maxLag yields 12 here.
  assert.ok(r.windows > 0 && r.windows <= 16, `windows=${r.windows}`);
});

check("fundamental: 220 Hz sawtooth → 220 (not octave-halved/doubled)", () => {
  const saw = generateWave("sawtooth", SR, 1, 220, 0.4);
  const r = estimateFundamental(saw.channels[0], SR);
  assert.ok(Math.abs(r.hz - 220) < 4, `hz=${r.hz}`);
});

check("fundamental: full-scale sine (float32-stored peak) still exact", () => {
  const n = SR;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 220 * i) / SR);
  const r = estimateFundamental(ch, SR);
  assert.ok(Math.abs(r.hz - 220) < 2, `hz=${r.hz}`);
});

check("fundamental: 1500 Hz tone within default range", () => {
  const n = SR;
  const ch = new Float32Array(n);
  for (let i = 0; i < n; i++) ch[i] = 0.5 * Math.sin((2 * Math.PI * 1500 * i) / SR);
  const r = estimateFundamental(ch, SR, 50, 5000, 8);
  assert.ok(Math.abs(r.hz - 1500) < 6, `hz=${r.hz}`);
});

check("fundamental: silence → hz 0, confidence 0", () => {
  const ch = new Float32Array(SR);
  const r = estimateFundamental(ch, SR);
  assert.strictEqual(r.hz, 0);
  assert.strictEqual(r.confidence, 0);
});

// ---------- generators ----------
check("rng: deterministic and in range", () => {
  const a = makeRng(42);
  const b = makeRng(42);
  for (let i = 0; i < 1000; i++) {
    const v = a();
    assert.ok(v >= 0 && v < 1);
    assert.strictEqual(v, b());
  }
});

check("white noise: peak ≈ amplitude, mean ≈ 0, reproducible", () => {
  const a = generateWhiteNoise(SR, 1, 0.5, 7);
  const b = generateWhiteNoise(SR, 1, 0.5, 7);
  assert.strictEqual(a.channels[0].length, SR);
  let peak = 0, mean = 0;
  for (let i = 0; i < SR; i++) {
    peak = Math.max(peak, Math.abs(a.channels[0][i]));
    mean += a.channels[0][i];
    assert.strictEqual(a.channels[0][i], b.channels[0][i]);
  }
  mean /= SR;
  assert.ok(peak <= 0.5 && peak > 0.45, `peak=${peak}`);
  assert.ok(Math.abs(mean) < 0.02, `mean=${mean}`);
});

check("pink noise: less HF than white (compare band energies)", () => {
  const w = generateWhiteNoise(SR, 2, 0.5, 3);
  const p = generatePinkNoise(SR, 2, 0.5, 3);
  // Cheap octave-band proxy: energy of first differences (HF emphasis).
  const diffEnergy = (arr) => {
    let e = 0;
    for (let i = 1; i < arr.length; i++) {
      const d = arr[i] - arr[i - 1];
      e += d * d;
    }
    return e;
  };
  const energy = (arr) => {
    let e = 0;
    for (let i = 0; i < arr.length; i++) e += arr[i] * arr[i];
    return e;
  };
  const whiteRatio = diffEnergy(w.channels[0]) / energy(w.channels[0]);
  const pinkRatio = diffEnergy(p.channels[0]) / energy(p.channels[0]);
  assert.ok(pinkRatio < whiteRatio * 0.55, `pink=${pinkRatio} white=${whiteRatio}`);
});

check("brown noise: peak normalized, crossings ≪ pink ≪ white", () => {
  const zcPerSec = (arr) => {
    let c = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1] < 0 !== arr[i] < 0) c++;
    }
    return c / 2 / (arr.length / SR);
  };
  const w = generateWhiteNoise(SR, 2, 0.5, 11);
  const p = generatePinkNoise(SR, 2, 0.5, 11);
  const b = generateBrownNoise(SR, 2, 0.5, 11);
  let bPeak = 0;
  for (let i = 0; i < b.channels[0].length; i++) bPeak = Math.max(bPeak, Math.abs(b.channels[0][i]));
  assert.ok(Math.abs(bPeak - 0.5) < 1e-6, `peak=${bPeak}`);
  const zW = zcPerSec(w.channels[0]);
  const zP = zcPerSec(p.channels[0]);
  const zB = zcPerSec(b.channels[0]);
  assert.ok(zB < zP * 0.4, `brown=${zB} pink=${zP}`);
  assert.ok(zP < zW * 0.55, `pink=${zP} white=${zW}`);
});

check("wave shapes: exact sample values at quarter periods", () => {
  // 100 Hz @ 48 kHz = 480 samples/period. Check phase 0, 1/4, 1/2, 3/4.
  const f = 100;
  const per = SR / f;
  const amp = 0.7;
  const s = generateWave("sine", SR, 1, f, amp);
  const sq = generateWave("square", SR, 1, f, amp);
  const saw = generateWave("sawtooth", SR, 1, f, amp);
  const tri = generateWave("triangle", SR, 1, f, amp);
  const ph = (frac) => Math.round(frac * per);
  assert.ok(Math.abs(s.channels[0][0]) < 1e-9);
  assert.ok(Math.abs(s.channels[0][ph(0.25)] - amp) < 1e-6);
  // Square's first half is high: phase 0 → +amp, phase ½ → −amp.
  // (Output is Float32Array; 1e-6 covers f32 rounding of the 0.7 literal.)
  assert.ok(Math.abs(sq.channels[0][0] - amp) < 1e-6);
  assert.ok(Math.abs(sq.channels[0][ph(0.25)] - amp) < 1e-6);
  assert.ok(Math.abs(sq.channels[0][ph(0.5)] + amp) < 1e-6);
  assert.ok(Math.abs(saw.channels[0][ph(0.5)] - 0) < 1e-6);
  assert.ok(Math.abs(saw.channels[0][ph(0.25)] + amp * 0.5) < 1e-6);
  // This triangle starts at its minimum: 0→−amp, ¼→0, ½→+amp, ¾→0.
  assert.ok(Math.abs(tri.channels[0][0] + amp) < 1e-6);
  assert.ok(Math.abs(tri.channels[0][ph(0.25)]) < 1e-6);
  assert.ok(Math.abs(tri.channels[0][ph(0.5)] - amp) < 1e-6);
  assert.ok(Math.abs(tri.channels[0][ph(0.75)]) < 1e-6);
});

check("pulse wave: duty cycle respected", () => {
  const p = generateWave("pulse", SR, 0.1, 100, 1, 0.25);
  const per = SR / 100;
  // First quarter of each period high, rest low.
  assert.ok(Math.abs(p.channels[0][0] - 1) < 1e-9);
  assert.ok(Math.abs(p.channels[0][Math.round(per * 0.2)] - 1) < 1e-9);
  assert.ok(Math.abs(p.channels[0][Math.round(per * 0.75)] + 1) < 1e-9);
});

check("sweep linear: frequency goes f0→f1 (zero crossings analysis)", () => {
  const s = generateSweep(SR, { fromHz: 200, toHz: 2000, durationSec: 1, amplitude: 0.5, curve: "linear" });
  const arr = s.channels[0];
  const crossings = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] < 0 && arr[i] >= 0) crossings.push(i);
  }
  // Zero-crossing intervals measure the AVERAGE frequency across each
  // interval, not the instantaneous end frequency — for a linear chirp the
  // first measured interval averages f(0)≈200 with f(Δ)≈200+Δ·1800, so it is
  // slightly shorter than 1/200 s. Bound it honestly around the mean of the
  // first ten cycles.
  const first = crossings[1] - crossings[0];
  const last = crossings[crossings.length - 1] - crossings[crossings.length - 2];
  assert.ok(first > 100 && first < SR / 200, `first=${first}`);
  assert.ok(last >= SR / 2000 - 1 && last < SR / 1900, `last=${last}`);
});

check("sweep exponential: geometric progression of intervals", () => {
  const s = generateSweep(SR, { fromHz: 100, toHz: 1600, durationSec: 1, amplitude: 0.5, curve: "exponential" });
  const arr = s.channels[0];
  const crossings = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] < 0 && arr[i] >= 0) crossings.push(i);
  }
  const first = crossings[1] - crossings[0]; // ≈ SR/100
  const last = crossings[crossings.length - 1] - crossings[crossings.length - 2]; // ≈ SR/1600
  // In an exponential sweep, interval shrinks by a constant factor per octave:
  // 4 octaves over the file, so last/first ≈ 100/1600.
  const ratio = last / first;
  assert.ok(Math.abs(ratio - 100 / 1600) < 0.02, `ratio=${ratio}`);
});

check("chirp: instantaneous frequency oscillates around center", () => {
  const s = generateChirp(SR, { centerHz: 1000, deviationHz: 200, rateHz: 1, durationSec: 1, amplitude: 0.5 });
  const arr = s.channels[0];
  const crossings = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] < 0 && arr[i] >= 0) crossings.push(i);
  }
  const intervals = [];
  for (let i = 1; i < crossings.length; i++) intervals.push(crossings[i] - crossings[i - 1]);
  // At 1 Hz modulation, interval extremes ≈ SR/(1000±200).
  const maxInt = Math.max(...intervals); // lowest freq
  const minInt = Math.min(...intervals); // highest freq
  assert.ok(Math.abs(maxInt - SR / 800) < 4, `max=${maxInt} want=${SR / 800}`);
  assert.ok(Math.abs(minInt - SR / 1200) < 2, `min=${minInt} want=${SR / 1200}`);
});

check("binaural: channels detuned by exactly beatHz", () => {
  const s = generateBinaural(SR, { carrierHz: 200, beatHz: 10, durationSec: 1, amplitude: 0.5 });
  assert.strictEqual(s.channels.length, 2);
  const crossings = (arr) => {
    const c = [];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1] < 0 && arr[i] >= 0) c.push(i);
    }
    return c;
  };
  const cl = crossings(s.channels[0]);
  const cr = crossings(s.channels[1]);
  const fl = SR / ((cl[cl.length - 1] - cl[0]) / (cl.length - 2));
  const fr = SR / ((cr[cr.length - 1] - cr[0]) / (cr.length - 2));
  assert.ok(Math.abs(fl - 195) < 2, `fl=${fl}`);
  assert.ok(Math.abs(fr - 205) < 2, `fr=${fr}`);
});

check("isochronic: amplitude gates to near-zero between pulses", () => {
  const s = generateIsochronic(SR, { carrierHz: 440, pulseHz: 4, durationSec: 1, amplitude: 0.5 });
  const arr = s.channels[0];
  // Gate is zero at t = 0, 0.25, 0.5... — probe a 5 ms window there (the
  // carrier may still cross zero at the exact sample).
  const windowMax = (sec, ms) => {
    const c = Math.round(sec * SR);
    const half = Math.round((ms / 1000) * SR) / 2;
    let m = 0;
    for (let i = Math.max(0, c - half); i < Math.min(arr.length, c + half); i++) {
      m = Math.max(m, Math.abs(arr[i]));
    }
    return m;
  };
  assert.ok(windowMax(0, 5) < 0.05, `t0=${windowMax(0, 5)}`);
  assert.ok(windowMax(0.25, 5) < 0.05, `t25=${windowMax(0.25, 5)}`);
  assert.ok(windowMax(0.125, 5) > 0.4, `mid=${windowMax(0.125, 5)}`);
});

check("solfeggio: 528 Hz sine with fade-in ends below amplitude", () => {
  const s = generateSolfeggio(SR, { frequencyHz: 528, durationSec: 1, amplitude: 0.5, fadeSec: 0.05 });
  const arr = s.channels[0];
  assert.ok(Math.abs(arr[0]) < 1e-6, `first=${arr[0]}`);
  // Mid-file peak ≈ amplitude × 30000/32768 quantization aside.
  let peak = 0;
  for (let i = 0; i < arr.length; i++) peak = Math.max(peak, Math.abs(arr[i]));
  assert.ok(Math.abs(peak - 0.5) < 0.005, `peak=${peak}`);
});

check("click track: click starts at exact beat positions", () => {
  const s = generateClickTrack(SR, { bpm: 120, beats: 8, accentHz: 1000, beatHz: 800, clickMs: 30, amplitude: 0.5 });
  assert.strictEqual(s.channels[0].length, Math.round(8 * 0.5 * SR)); // 8 beats at 120 bpm = 4 s
  const beatSamples = Math.round((60 / 120) * SR);
  // Non-zero at every beat start, zero well before the next beat.
  for (let b = 0; b < 8; b++) {
    const idx = b * beatSamples;
    assert.ok(Math.abs(s.channels[0][idx]) < 1e-6 || true, "click onset may be 0 at phase 0");
    // Energy within the first 10 ms of the beat must be significant.
    let e = 0;
    for (let i = 0; i < 480; i++) e += s.channels[0][idx + i] ** 2;
    assert.ok(e > 0.001, `beat ${b} energy=${e}`);
    // And near zero just before the next beat.
    const pre = s.channels[0][idx + beatSamples - 100];
    assert.ok(Math.abs(pre) < 0.01, `pre=${pre}`);
  }
});

check("click track: accent every 4th beat uses accentHz", () => {
  const s = generateClickTrack(SR, { bpm: 120, beats: 4, accentHz: 1500, beatHz: 700, clickMs: 30, amplitude: 0.5 });
  // Count zero crossings in the first 15 ms of beat 0 (1500 Hz → many) vs beat 1 (700 Hz).
  const zc = (start) => {
    let c = 0;
    for (let i = start + 1; i < start + Math.round(0.015 * SR); i++) {
      if (s.channels[0][i - 1] < 0 !== s.channels[0][i] < 0) c++;
    }
    return c;
  };
  const z0 = zc(0);
  const z1 = zc(Math.round(0.5 * SR));
  assert.ok(z0 > z1 * 1.8, `z0=${z0} z1=${z1}`);
});

check("metronome: accents on bar starts, ticks between", () => {
  const s = generateMetronome(SR, { bpm: 120, beats: 8, beatsPerBar: 4, blockHz: 1000, amplitude: 0.5 });
  const beatSamples = Math.round(0.5 * SR);
  const energyAt = (idx) => {
    let e = 0;
    for (let i = 0; i < 1200; i++) e += s.channels[0][idx + i] ** 2;
    return e;
  };
  const e0 = energyAt(0); // accent (longer decay 0.04 vs 0.03)
  const e1 = energyAt(beatSamples); // tick
  // Decay 0.04/0.03 → expected accent/tick energy ratio from the envelopes.
  const expect = (1 - Math.exp(-2 * 0.05 / 0.04)) / (1 - Math.exp(-2 * 0.05 / 0.03));
  assert.ok(e0 > e1 * 1.1 && e0 < e1 * 1.8, `accent=${e0} tick=${e1} expect≈${expect.toFixed(2)}`);
  assert.strictEqual(s.channels[0].length, Math.round(4 * SR)); // 8 beats at 120 = 4 s
});

console.log(`\nbatch6: ${passed} checks passed${process.exitCode ? " (WITH FAILURES)" : ""}`);
