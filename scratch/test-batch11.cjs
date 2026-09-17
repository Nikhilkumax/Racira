/**
 * Batch 11 verification — the REAL compiled calc.js against hand-computed
 * values.
 *
 * Recompile: npx tsc src/domains/audio/lib/calc.ts --outDir scratch/.batch11 --module commonjs --target es2020 --skipLibCheck
 * Run:       node scratch/test-batch11.cjs
 */
"use strict";
const assert = require("assert");
const {
  bpmFromMs, median, bpmFromTaps, beatMs, delayTable, reverbForBpm,
  midiToFreq, freqToMidi, parseNote, centsBetween, nearestNote, NOTE_NAMES,
} = require("./.batch11/calc.js");

let ok = 0, fail = 0;
function check(name, fn) {
  try { fn(); ok++; console.log(`  ok  ${name}`); }
  catch (e) { fail++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const close = (a, b, eps) => Math.abs(a - b) < (eps ?? 1e-9);

check("bpmFromMs: 500 ms → 120 BPM", () => {
  assert.ok(close(bpmFromMs(500), 120));
});
check("bpmFromMs: 60000/99 ms → 99 BPM exactly, 0/negative → 0", () => {
  assert.ok(close(bpmFromMs(60000 / 99), 99, 1e-9));
  assert.strictEqual(bpmFromMs(0), 0);
  assert.strictEqual(bpmFromMs(-5), 0);
});

check("median: odd, even, empty", () => {
  assert.strictEqual(median([3, 1, 2]), 2);
  assert.strictEqual(median([4, 1, 3, 2]), 2.5);
  assert.strictEqual(median([]), 0);
});

check("bpmFromTaps: perfect 500 ms taps → 120; median rejects outlier", () => {
  const taps = [0, 500, 1000, 1500, 2000];
  assert.ok(close(bpmFromTaps(taps), 120));
  const withOutlier = [0, 500, 1000, 1130, 2000, 2500]; // one 130 ms hiccup
  assert.ok(close(bpmFromTaps(withOutlier), 120, 1e-6)); // median still 500
  assert.strictEqual(bpmFromTaps([0]), 0);
  assert.strictEqual(bpmFromTaps([]), 0);
});

check("beatMs: 120 BPM → 500 ms; 0 BPM → 0", () => {
  assert.ok(close(beatMs(120), 500));
  assert.strictEqual(beatMs(0), 0);
});

check("delayTable: 120 BPM — 1/4=500, dotted=750, triplet≈333.33; 1/8=250", () => {
  const t = delayTable(120);
  const q = t.find(r => r.label === "1/4");
  const e = t.find(r => r.label === "1/8");
  const qT = t.find(r => r.label === "1/4T");
  assert.ok(close(q.ms, 500));
  assert.ok(close(q.dottedMs, 750));
  assert.ok(close(qT.ms, 333.3333333333333, 1e-6));
  assert.ok(close(e.ms, 250));
  assert.strictEqual(t.length, 12);
});

check("delayTable: 96 BPM — 1/4 = 625 ms", () => {
  const t = delayTable(96).find(r => r.label === "1/4");
  assert.ok(close(t.ms, 625));
});

check("reverbForBpm: rooms map to documented pre-delay/beat multiples", () => {
  const small = reverbForBpm(120, "small");
  const medium = reverbForBpm(120, "medium");
  const large = reverbForBpm(120, "large");
  const plate = reverbForBpm(120, "plate");
  assert.deepStrictEqual(small, { preDelayMs: 10, decayMs: 250 });
  assert.deepStrictEqual(medium, { preDelayMs: 20, decayMs: 500 });
  assert.deepStrictEqual(large, { preDelayMs: 30, decayMs: 750 });
  assert.ok(plate.preDelayMs === 8 && plate.decayMs >= 800);
  // plate floor kicks in at slow tempos
  const plateSlow = reverbForBpm(60, "plate");
  assert.ok(plateSlow.decayMs >= 800);
});

check("midiToFreq: A4=69→440, C4=60→261.6256..., A3=57→220", () => {
  assert.ok(close(midiToFreq(69), 440));
  assert.ok(close(midiToFreq(60), 261.6255653005986, 1e-6));
  assert.ok(close(midiToFreq(57), 220));
});

check("freqToMidi: 440→69, 261.63→60.0000..., 880→81", () => {
  assert.ok(close(freqToMidi(440), 69));
  assert.ok(close(freqToMidi(261.6255653005986), 60, 1e-6));
  assert.ok(close(freqToMidi(880), 81));
  assert.strictEqual(freqToMidi(-1), 0);
});

check("parseNote: A4=69, C#3, Eb2=-1 octave handled, invalid → null", () => {
  assert.strictEqual(parseNote("A4"), 69);
  assert.strictEqual(parseNote("C#3"), 49);
  assert.strictEqual(parseNote("Eb2"), 39);
  assert.strictEqual(parseNote("C4"), 60);
  assert.strictEqual(parseNote("a4"), 69); // case-insensitive letter
  assert.strictEqual(parseNote("H4"), null);
  assert.strictEqual(parseNote(""), null);
});

check("centsBetween: octave = 1200; semitone ≈ 100", () => {
  assert.ok(close(centsBetween(440, 880), 1200));
  assert.ok(close(centsBetween(440, 440 * Math.pow(2, 1 / 12)), 100, 1e-6));
  assert.ok(close(centsBetween(440, 220), -1200));
});

check("nearestNote: 440 → A4 +0.0 cents; 450 → A4 +38.9; 261.63 → C4", () => {
  const a = nearestNote(440);
  assert.strictEqual(a.name, "A4");
  assert.strictEqual(a.cents, 0);
  const b = nearestNote(450);
  assert.strictEqual(b.name, "A4");
  const expectedCents = Math.round(1200 * Math.log2(450 / 440) * 10) / 10;
  assert.ok(Math.abs(b.cents - expectedCents) < 0.1, `cents=${b.cents} expected=${expectedCents}`);
  const c = nearestNote(261.6255653005986);
  assert.strictEqual(c.name, "C4");
  assert.strictEqual(c.cents, 0);
});

check("NOTE_NAMES layout starts at C", () => {
  assert.strictEqual(NOTE_NAMES[0], "C");
  assert.strictEqual(NOTE_NAMES.length, 12);
});

console.log(`\n${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
