/**
 * Batch 12 verification — the REAL compiled theory.js against hand-computed
 * theory facts.
 *
 * Recompile: npx tsc src/domains/audio/lib/theory.ts src/domains/audio/lib/calc.ts --outDir scratch/.batch12 --module commonjs --target es2020 --skipLibCheck
 * Run:       node scratch/test-batch12.cjs
 */
"use strict";
const assert = require("assert");
const {
  intervalBetween, buildChord, buildScale, diatonicTriads, circleOfFifths, keyFromSignature,
} = require("./.batch12/theory.js");

let ok = 0, fail = 0;
function check(name, fn) {
  try { fn(); ok++; console.log(`  ok  ${name}`); }
  catch (e) { fail++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}

check("intervals: C4→E4 = M3 (4 semis), C4→G4 = P5, B3→C4 = m2", () => {
  const m3 = intervalBetween("C4", "E4");
  assert.strictEqual(m3.name, "Major 3rd");
  assert.strictEqual(m3.semitones, 4);
  assert.ok(Math.abs(m3.ratio - Math.pow(2, 4 / 12)) < 1e-12);
  const p5 = intervalBetween("C4", "G4");
  assert.strictEqual(p5.short, "P5");
  const m2 = intervalBetween("B3", "C4"); // wraps to 1 semitone
  assert.strictEqual(m2.semitones, 1);
  assert.strictEqual(m2.name, "Minor 2nd");
  const inv = intervalBetween("C4", "C4");
  assert.strictEqual(inv.short, "P1");
  assert.strictEqual(intervalBetween("C4", "H4"), null);
});

const ascii = (names) => names.map(n => n.replace(/♯/g, "#").replace(/♭/g, "b"));

check("chords: Eb7 spells Eb G Bb Db (not D#); Am = A C E; Cmaj7 = C E G B", () => {
  const eb7 = buildChord("Eb3", "dom7");
  assert.deepStrictEqual(
    ascii(eb7.tones.map(t => t.name.replace(/\d+$/, ""))),
    ["Eb", "G", "Bb", "Db"],
  );
  assert.strictEqual(eb7.tones[0].midi, 51); // Eb3
  const am = buildChord("A3", "minor");
  assert.deepStrictEqual(ascii(am.tones.map(t => t.name.replace(/\d+$/, ""))), ["A", "C", "E"]);
  const cmaj7 = buildChord("C4", "maj7");
  assert.deepStrictEqual(ascii(cmaj7.tones.map(t => t.name.replace(/\d+$/, ""))), ["C", "E", "G", "B"]);
  const fsm7b5 = buildChord("F#3", "m7b5");
  assert.deepStrictEqual(ascii(fsm7b5.tones.map(t => t.name.replace(/\d+$/, ""))), ["F#", "A", "C", "E"]);
});

check("chord MIDI values: C4 major triad = 60, 64, 67", () => {
  const c = buildChord("C4", "major");
  assert.deepStrictEqual(c.tones.map(t => t.midi), [60, 64, 67]);
});

check("scales: F# major spells every letter once with 6 sharps", () => {
  const s = buildScale("F#4", "Major (Ionian)");
  assert.deepStrictEqual(
    ascii(s.map(n => n.name.replace(/\d+$/, ""))),
    ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  );
  assert.deepStrictEqual(s.map(n => n.midi), [66, 68, 70, 71, 73, 75, 77]);
  const cMajor = buildScale("C4", "Major (Ionian)");
  assert.deepStrictEqual(ascii(cMajor.map(n => n.name.replace(/\d+$/, ""))), ["C", "D", "E", "F", "G", "A", "B"]);
  const blues = buildScale("A3", "Blues");
  assert.deepStrictEqual(ascii(blues.map(n => n.name.replace(/\d+$/, ""))), ["A", "C", "D", "D#", "E", "G"]);
  const pent = buildScale("C4", "Major pentatonic");
  assert.strictEqual(pent.length, 5);
});

check("diatonic triads: C major = I ii iii IV V vi vii° with correct qualities", () => {
  const t = diatonicTriads("C4", "major");
  assert.deepStrictEqual(t.map(c => c.roman), ["I", "ii", "iii", "IV", "V", "vi", "vii°"]);
  assert.deepStrictEqual(t.map(c => c.root), ["C", "D", "E", "F", "G", "A", "B"]);
  assert.deepStrictEqual(t.map(c => c.quality), ["major", "minor", "minor", "major", "major", "minor", "dim"]);
  const g7root = t[4].tones.map(x => x.name.replace(/\d+$/, ""));
  assert.deepStrictEqual(g7root, ["G", "B", "D"]); // V triad
});

check("diatonic triads: A minor = i ii° III iv v VI VII", () => {
  const t = diatonicTriads("A3", "minor");
  assert.deepStrictEqual(t.map(c => c.roman), ["i", "ii°", "III", "iv", "v", "VI", "VII"]);
  assert.deepStrictEqual(t.map(c => c.quality), ["minor", "dim", "major", "minor", "minor", "major", "major"]);
});

check("circle of fifths: 12 keys, C first, G=1♯, F=1♭, relative minors", () => {
  const c = circleOfFifths();
  assert.strictEqual(c.length, 12);
  assert.deepStrictEqual([c[0].major, c[0].minor, c[0].signature], ["C", "A minor", "—"]);
  assert.deepStrictEqual([c[1].major, c[1].signature], ["G", "1♯"]);
  assert.deepStrictEqual([c[11].major, c[11].signature], ["F", "1♭"]);
  assert.strictEqual(c[3].minor, "F♯ minor");
  assert.deepStrictEqual(c.map(k => k.position), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
});

check("keyFromSignature: 3 flats → E♭ major / C minor with ordered accidentals", () => {
  const k = keyFromSignature(0, 3);
  assert.strictEqual(k.major, "E♭");
  assert.strictEqual(k.minor, "C minor");
  assert.deepStrictEqual(k.accidentals, ["B♭", "E♭", "A♭"]);
});

check("keyFromSignature: 4 sharps → E major / C♯ minor", () => {
  const k = keyFromSignature(4, 0);
  assert.strictEqual(k.major, "E");
  assert.strictEqual(k.minor, "C♯ minor");
  assert.deepStrictEqual(k.accidentals, ["F♯", "C♯", "G♯", "D♯"]);
});

check("keyFromSignature: (0,0) → C major / A minor; 2 sharps → D major", () => {
  const c = keyFromSignature(0, 0);
  assert.strictEqual(c.major, "C");
  assert.strictEqual(c.minor, "A minor");
  assert.deepStrictEqual(c.accidentals, []);
  const d = keyFromSignature(2, 0);
  assert.strictEqual(d.major, "D");
  assert.strictEqual(d.minor, "B minor");
  const gf = keyFromSignature(0, 6);
  assert.strictEqual(gf.major, "G♭");
  assert.strictEqual(gf.minor, "E♭ minor");
});

check("keyFromSignature: invalid combos → null", () => {
  assert.strictEqual(keyFromSignature(3, 2), null);
  assert.strictEqual(keyFromSignature(8, 0), null);
  assert.strictEqual(keyFromSignature(0, 9), null);
  assert.strictEqual(keyFromSignature(-1, 0), null);
});

console.log(`\n${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
