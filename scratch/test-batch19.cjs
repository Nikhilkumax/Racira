/**
 * Batch 19 Node verification — pure functions added to calc.ts:
 *   silenceStats (repaired tail: silence-statistics section)
 *   TUNER_PRESETS / tunerCents
 *   transposeChordSymbol
 * Recompile: npx tsc src/domains/audio/lib/calc.ts --outDir scratch/.batch19 --module commonjs --target es2020 --skipLibCheck
 */
const assert = require("assert");
const c = require("./.batch19/calc.js");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ok - " + name);
  } catch (e) {
    console.error("  FAIL - " + name + ": " + e.message);
    process.exitCode = 1;
  }
}

// ---------- silenceStats (the repaired calc.ts tail) ----------
check("silenceStats: 1s silence / 0.5s tone / 0.5s silence @8kHz mono", () => {
  const sr = 8000;
  const sig = new Float32Array(sr * 2); // 2 s: 1 s silent, 0.5 s tone, 0.5 s silent
  for (let i = sr; i < sr + sr / 2; i++) sig[i] = 0.5 * Math.sin((2 * Math.PI * 440 * i) / sr);
  const r = c.silenceStats([sig], sr);
  assert.strictEqual(r.totalDurationSec, 2);
  assert.strictEqual(r.runCount, 2); // leading 1s + trailing 0.5s (== minRunMs default)
  assert.strictEqual(r.silenceDurationSec, 1.5);
  assert.strictEqual(r.silencePercent, 75);
  assert.strictEqual(r.longestRunSec, 1);
  // sine amplitude 0.5 → RMS 0.5/√2 → ≈ −9 dBFS (frame-level)
  assert.ok(r.peakFrameDb > -11 && r.peakFrameDb < -7, "peakFrameDb ≈ -9, got " + r.peakFrameDb);
});
check("silenceStats: minRunMs filters sub-threshold wobble", () => {
  const sr = 8000;
  const sig = new Float32Array(sr); // 1 s, alternating 100ms tone/silence
  for (let k = 0; k < 5; k++) {
    for (let i = k * 1600 + 800; i < (k + 1) * 1600; i++) sig[i] = 0.5;
  }
  const r = c.silenceStats([sig], sr, { minRunMs: 200 });
  assert.strictEqual(r.runCount, 0); // every gap is exactly 100 ms < 200
  const r2 = c.silenceStats([sig], sr, { minRunMs: 50 });
  assert.strictEqual(r2.runCount, 5);
});
check("silenceStats: pure digital silence → peakFrameDb null", () => {
  const r = c.silenceStats([new Float32Array(8000)], 8000);
  assert.strictEqual(r.peakFrameDb, null);
  assert.strictEqual(r.silencePercent, 100);
});

// ---------- tuner presets ----------
check("TUNER_PRESETS: open-string hz match midiToFreq(parseNote)", () => {
  for (const [name, strings] of Object.entries(c.TUNER_PRESETS)) {
    for (const s of strings) {
      const expected = c.midiToFreq(c.parseNote(s.note));
      assert.ok(
        Math.abs(expected - s.hz) < 0.02,
        `${name} ${s.note}: table ${s.hz} vs computed ${expected.toFixed(2)}`,
      );
    }
  }
});

// ---------- tunerCents ----------
check("tunerCents: exact match → in tune, cents 0", () => {
  const r = c.tunerCents(110.0, c.TUNER_PRESETS.guitar);
  assert.strictEqual(r.targetNote, "A2");
  assert.strictEqual(r.cents, 0);
  assert.strictEqual(r.inTune, true);
  assert.strictEqual(r.direction, "in tune");
});
check("tunerCents: 200 Hz → G3, ~+35 cents sharp", () => {
  const r = c.tunerCents(200, c.TUNER_PRESETS.guitar);
  assert.strictEqual(r.targetNote, "G3");
  assert.ok(Math.abs(r.cents - 34.7) < 0.5, "cents " + r.cents);
  assert.strictEqual(r.inTune, false);
  assert.strictEqual(r.direction, "sharp");
});
check("tunerCents: flat edge — 105 Hz → A2 flat", () => {
  const r = c.tunerCents(105, c.TUNER_PRESETS.guitar);
  assert.strictEqual(r.targetNote, "A2");
  assert.ok(r.cents < 0 && r.cents > -100, "cents " + r.cents);
  assert.strictEqual(r.direction, "flat");
});
check("tunerCents: no pitch → null", () => {
  assert.strictEqual(c.tunerCents(0, c.TUNER_PRESETS.guitar), null);
  assert.strictEqual(c.tunerCents(-5, c.TUNER_PRESETS.guitar), null);
});

// ---------- transposeChordSymbol ----------
check("transpose: Am +2 → Bm", () => {
  const r = c.transposeChordSymbol("Am", 2);
  assert.strictEqual(r.transposedRoot, "B");
  assert.strictEqual(r.suffix, "m");
  assert.strictEqual(r.original, "Am");
});
check("transpose: G7 −5 → D7 (G is 7 pc; 7−5=2 → D)", () => {
  const r = c.transposeChordSymbol("G7", -5);
  assert.strictEqual(r.transposedRoot, "D");
  assert.strictEqual(r.suffix, "7");
});
check("transpose: Eb maj +1 → E (flat source keeps flat spelling where possible)", () => {
  const r = c.transposeChordSymbol("Eb", 1);
  assert.strictEqual(r.transposedRoot, "E");
  assert.strictEqual(r.suffix, "");
});
check("transpose: wraparound Bb +3 → Db (flats preserved)", () => {
  const r = c.transposeChordSymbol("Bb", 3);
  assert.strictEqual(r.transposedRoot, "Db");
});
check("transpose: negative wraparound C −1 → B", () => {
  const r = c.transposeChordSymbol("C", -1);
  assert.strictEqual(r.transposedRoot, "B");
});
check("transpose: suffixes with extensions kept verbatim", () => {
  const r = c.transposeChordSymbol("F#m7b5", 2);
  assert.strictEqual(r.transposedRoot, "G#");
  assert.strictEqual(r.suffix, "m7b5");
});
check("transpose: invalid root → null", () => {
  assert.strictEqual(c.transposeChordSymbol("Xm", 1), null);
  assert.strictEqual(c.transposeChordSymbol("", 1), null);
});

console.log(`\nbatch19: ${passed} checks passed${process.exitCode ? " (with failures)" : ""}`);
