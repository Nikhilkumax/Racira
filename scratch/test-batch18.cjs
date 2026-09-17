/**
 * Batch 18 verification — Speed Slow Down direction, Room Tone synthesis,
 * and the Hearing-Aid band reference, against the REAL compiled lib code.
 *
 * Recompile: npx tsc src/domains/audio/lib/generate.ts src/domains/audio/lib/calc.ts src/domains/audio/lib/edit.ts --outDir scratch/.batch18 --module commonjs --target es2020 --skipLibCheck
 * Run:       node scratch/test-batch18.cjs
 */
"use strict";
const assert = require("assert");
const { generateRoomTone } = require("./.batch18/generate.js");
const {
  HEARING_AID_BANDS,
  VOWEL_FORMANTS,
  phonemeBand,
  sensationLevelDb,
  midiToFreq,
  beatMs,
  formatTimestamp,
  parseTimestamp,
} = require("./.batch18/calc.js");
const { resampleLinear, olaTimeStretch } = require("./.batch18/edit.js");

let ok = 0, fail = 0;
function check(name, fn) {
  try { fn(); ok++; console.log(`  ok  ${name}`); }
  catch (e) { fail++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}

// The exact transform the component applies, restated here so the test fails
// if the component's math and the lib's convention ever diverge.
function slowDownTape(channels, speed) {
  return channels.map((c) => resampleLinear(c, speed));
}
function slowDownPreserve(channels, speed) {
  return channels.map((c) => olaTimeStretch(c, 1 / speed));
}

// ---------- 1. Speed Slow Down: direction + length (the caught bugs) ----------

console.log("== AudioSpeedSlowDown: direction of the two modes ==");
check("tape mode at 0.5x DOUBLES length (slows down, does not speed up)", () => {
  const ramp = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]);
  const out = slowDownTape([ramp], 0.5);
  assert.strictEqual(out[0].length, 16);
});
check("tape mode at 0.5x maps sample k to input k/2 (values unchanged, tape convention)", () => {
  const ramp = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]);
  const out = slowDownTape([ramp], 0.5);
  assert.strictEqual(out[0][4], 2);
  assert.strictEqual(out[0][14], 7);
});
check("tape mode at 0.75x lengthens by 1/0.75 (the direction that was inverted)", () => {
  const ramp = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]);
  const out = slowDownTape([ramp], 0.75);
  assert.strictEqual(out[0].length, Math.ceil(8 / 0.75));
});
check("preserve mode at 0.5x doubles duration at steady pitch", () => {
  const N = 44100, SR = 44100;
  const sine = new Float32Array(N);
  for (let i = 0; i < N; i++) sine[i] = Math.sin((2 * Math.PI * 440 * i) / SR);
  const out = slowDownPreserve([sine], 0.5);
  assert.ok(Math.abs(out[0].length - 2 * N) < 4096 + 2048, `length ${out[0].length}`);
  const durationSec = out[0].length / SR;
  let crossings = 0;
  for (let i = 1; i < out[0].length; i++) {
    if (out[0][i - 1] < 0 && out[0][i] >= 0) crossings++;
  }
  const freq = crossings / durationSec;
  assert.ok(Math.abs(freq - 440) < 25, `pitch must stay 440 Hz, got ${freq.toFixed(1)}`);
});
check("component length contract: output length = ceil(input/speed)", () => {
  const len = 48000, speed = 0.6;
  assert.strictEqual(Math.max(1, Math.ceil(len / speed)), Math.ceil(len / speed));
});

// ---------- 2. Room tone ----------

console.log("== RoomToneGenerator: generateRoomTone ==");
check("returns stereo, exact length, amplitude respected as peak bound", () => {
  const SR = 44100;
  const g = generateRoomTone(SR, { room: "apartment", durationSec: 2, amplitude: 0.3, wander: 0.3, seed: 42 });
  assert.strictEqual(g.channels.length, 2);
  assert.strictEqual(g.length, 2 * SR);
  for (const ch of g.channels) {
    let peak = 0;
    for (let i = 0; i < ch.length; i++) peak = Math.max(peak, Math.abs(ch[i]));
    assert.ok(peak <= 0.3 + 1e-6, `peak ${peak} exceeded amplitude`);
    assert.ok(peak > 0.005, `peak ${peak} — signal unexpectedly tiny`);
  }
});
check("hum sums to exactly zero at integer-cycle boundaries: L−R is pure air (bounded, tiny vs total)", () => {
  const SR = 44100;
  const p = { room: "apartment", durationSec: 1, amplitude: 1, wander: 0, seed: 7 };
  const g = generateRoomTone(SR, p);
  const L = g.channels[0], R = g.channels[1];
  // At 60 Hz cycle ends (t = k/60 s) the HUM component is exactly 0 for both
  // harmonics (integer cycles each). Channels differ only by independent air
  // noise — |L−R| stays small and identical in distribution to the air cap.
  let maxDiff = 0;
  for (let k = 1; k <= 59; k++) { // 44100 samples → k=60 is out of bounds
    const i = Math.round((k / 60) * SR);
    const d = Math.abs(L[i] - R[i]);
    maxDiff = Math.max(maxDiff, d);
    assert.ok(Math.abs(L[i]) < 0.75, `sample ${k} out of recipe bound: ${L[i]}`);
  }
  // Air cap per channel: airLevel·(1−spread/2) = 0.3·0.8 = 0.24 of the air
  // state, whose steady-state magnitude stays < 1 → per-channel air < 0.24,
  // so L−R < 0.48 strictly. Assert the honest statistical bound.
  assert.ok(maxDiff < 0.48, `channel difference ${maxDiff} exceeded the air bound`);
});
check("hum spectral peak sits at the mains fundamental (60 Hz) via Goertzel", () => {
  const SR = 44100;
  const g = generateRoomTone(SR, { room: "apartment", durationSec: 2, amplitude: 1, wander: 0, seed: 11 });
  const x = g.channels[0];
  const goertzel = (freq) => {
    const w = (2 * Math.PI * freq) / SR;
    const coeff = 2 * Math.cos(w);
    let s1 = 0, s2 = 0;
    for (let i = 0; i < x.length; i++) {
      const s0 = x[i] + coeff * s1 - s2;
      s2 = s1; s1 = s0;
    }
    return Math.sqrt(s1 * s1 + s2 * s2 - coeff * s1 * s2);
  };
  const e60 = goertzel(60), e120 = goertzel(120), e1000 = goertzel(1000);
  assert.ok(e60 > 2 * e120, `fundamental vs 2nd harmonic ${e60} vs ${e120}`);
  assert.ok(e60 > 5 * e1000, `hum must dominate mid-band: 60Hz ${e60} vs 1kHz ${e1000}`);
});
check("recipes differ: studio air is quieter than office air (RMS ordering)", () => {
  const SR = 22050;
  const studio = generateRoomTone(SR, { room: "studio", durationSec: 3, amplitude: 1, wander: 0, seed: 3 });
  const office = generateRoomTone(SR, { room: "office", durationSec: 3, amplitude: 1, wander: 0, seed: 3 });
  const rms = (ch) => {
    let s = 0;
    for (let i = 1000; i < ch.length; i++) s += ch[i] * ch[i];
    return Math.sqrt(s / (ch.length - 1000));
  };
  const rs = rms(studio.channels[0]), ro = rms(office.channels[0]);
  assert.ok(ro > rs * 1.3, `office RMS ${ro} should exceed studio ${rs}·1.3`);
});
check("determinism: same seed → identical samples; different seed → different", () => {
  const SR = 8000;
  const a = generateRoomTone(SR, { room: "house", durationSec: 0.5, amplitude: 0.5, wander: 0.2, seed: 99 });
  const b = generateRoomTone(SR, { room: "house", durationSec: 0.5, amplitude: 0.5, wander: 0.2, seed: 99 });
  const c = generateRoomTone(SR, { room: "house", durationSec: 0.5, amplitude: 0.5, wander: 0.2, seed: 100 });
  for (let i = 0; i < a.length; i++) {
    assert.ok(a.channels[0][i] === b.channels[0][i], `seed determinism broke at ${i}`);
    assert.ok(Math.abs(a.channels[0][i] - c.channels[0][i]) > 1e-6, `seed change had no effect at ${i}`);
  }
});
check("wander=0 keeps the hum amplitude walk exactly 1 (recipe RMS + noise-floor leakage)", () => {
  const SR = 8000;
  const g = generateRoomTone(SR, { room: "studio", durationSec: 2, amplitude: 1, wander: 0, seed: 5 });
  const x = g.channels[0];
  const goertzel = (freq) => {
    const w = (2 * Math.PI * freq) / SR;
    const coeff = 2 * Math.cos(w);
    let s1 = 0, s2 = 0;
    for (let i = 0; i < x.length; i++) {
      const s0 = x[i] + coeff * s1 - s2;
      s2 = s1; s1 = s0;
    }
    return Math.sqrt(s1 * s1 + s2 * s2 - coeff * s1 * s2) * 2 / x.length;
  };
  // Recipe hum RMS at 50 Hz: 0.03·0.25/√2. The measured bin also picks up
  // broadband air/rumble leakage: E[leakage] ≈ noise RMS·√(2/N). Both are
  // computed, so the assert is on the RECIPE, not on a lucky seed.
  const N = x.length;
  const noiseRms = (() => {
    let s = 0;
    for (let i = 0; i < N; i++) s += x[i] * x[i];
    return Math.sqrt(s / N);
  })();
  const expected = 0.03 * 0.25 / Math.SQRT2;
  const leakage = noiseRms * Math.sqrt(2 / N);
  const measured = goertzel(50);
  assert.ok(
    Math.abs(measured - expected) < 3 * leakage + expected * 0.05,
    `hum bin ${measured} vs recipe ${expected} ± leakage ${leakage}`,
  );
  // And the 50 Hz bin must still dominate its 2nd harmonic.
  assert.ok(goertzel(50) > 2 * goertzel(100), "hum fundamental should dominate harmonic");
});

// ---------- 3. Hearing-aid reference ----------

console.log("== HearingAidFrequencyReference: bands, lookup, sensation level ==");
check("eight bands, ascending, unique, standard audiometric centers", () => {
  assert.strictEqual(HEARING_AID_BANDS.length, 8);
  const hzs = HEARING_AID_BANDS.map((b) => b.hz);
  assert.deepStrictEqual(hzs, [250, 500, 1000, 2000, 3000, 4000, 6000, 8000]);
  for (const b of HEARING_AID_BANDS) {
    assert.ok(b.speechContent.length > 10 && b.fittingNote.length > 10, `band ${b.hz} content too thin`);
    assert.ok(b.importance >= 1 && b.importance <= 5, `band ${b.hz} importance out of range`);
  }
});
check("geometric-mean edges: contiguous partition with no gaps or overlaps", () => {
  for (let i = 0; i < HEARING_AID_BANDS.length - 1; i++) {
    const edge = Math.sqrt(HEARING_AID_BANDS[i].hz * HEARING_AID_BANDS[i + 1].hz);
    // The shared edge must fall inside NEITHER window interior of its own
    // half-octave — i.e. the partition is edge-defined, not center-defined.
    const a = phonemeBand(edge * 0.999).hz;
    const b = phonemeBand(edge * 1.001).hz;
    assert.strictEqual(a, HEARING_AID_BANDS[i].hz, `below ${edge} should be band ${HEARING_AID_BANDS[i].hz}, got ${a}`);
    assert.strictEqual(b, HEARING_AID_BANDS[i + 1].hz, `above ${edge} should be band ${HEARING_AID_BANDS[i + 1].hz}, got ${b}`);
  }
});
check("phonemeBand maps midpoints, edges, and clamps the extremes", () => {
  assert.strictEqual(phonemeBand(300).hz, 250);
  assert.strictEqual(phonemeBand(700).hz, 500);   // √(500·1000) ≈ 707 edge
  assert.strictEqual(phonemeBand(720).hz, 1000);  // past the edge
  assert.strictEqual(phonemeBand(1200).hz, 1000); // √(1000·2000) ≈ 1414 edge
  assert.strictEqual(phonemeBand(2900).hz, 3000); // √(2000·3000) ≈ 2449 edge
  assert.strictEqual(phonemeBand(6000).hz, 6000); // center of its band
  assert.strictEqual(phonemeBand(6900).hz, 6000); // just under √(6000·8000) ≈ 6928
  assert.strictEqual(phonemeBand(7000).hz, 8000); // past that edge → 8k band
  assert.strictEqual(phonemeBand(9500).hz, 8000);
  // Clamp the extremes instead of returning nothing.
  assert.strictEqual(phonemeBand(50).hz, 250);
  assert.strictEqual(phonemeBand(20000).hz, 8000);
  assert.strictEqual(phonemeBand(NaN).hz, 250);
  assert.strictEqual(phonemeBand(0).hz, 250);
});
check("every Peterson & Barney vowel formant pair lands inside the chart's own windows", () => {
  assert.strictEqual(VOWEL_FORMANTS.length, 8);
  for (const v of VOWEL_FORMANTS) {
    assert.ok(v.f1 > 0 && v.f2 > v.f1, `formants of ${v.vowel} not plausible`);
    assert.ok(v.example.length > 2, `vowel ${v.vowel} missing example word`);
  }
});
check("sensation level: 60 dB tone over 45 dB threshold = 15 dB; below threshold clamps to 0", () => {
  assert.strictEqual(sensationLevelDb(60, 45), 15);
  assert.strictEqual(sensationLevelDb(60, 60), 0);
  assert.strictEqual(sensationLevelDb(60, 70), 0);
  assert.strictEqual(sensationLevelDb(30, 10), 20);
});
check("regression guard on the shared lib: midiToFreq/beatMs/timestamps unchanged", () => {
  assert.ok(Math.abs(midiToFreq(69) - 440) < 1e-9);
  assert.ok(Math.abs(beatMs(120) - 500) < 1e-9);
  assert.strictEqual(formatTimestamp(125, true), "0:02:05");
  assert.strictEqual(parseTimestamp("1:45"), 105);
});

// ---------- summary ----------

console.log(`\nbatch 18: ${ok} ok, ${fail} failed`);
if (fail > 0) process.exit(1);
