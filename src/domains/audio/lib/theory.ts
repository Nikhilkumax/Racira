/**
 * Music-theory math for the Easy-tier theory tools (Batch 12).
 *
 * Same contract as calc.ts: no browser APIs, no React, deterministic,
 * verified in Node. Spelling is done with letter arithmetic (letter step +
 * accidental) so chords and scales spell correctly (Eb7 = Eb G Bb Db, never
 * "D#") instead of naive pitch-class lookup.
 */

import { parseNote, midiToFreq, NOTE_NAMES } from "./calc";

export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const LETTER_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

/** Spell a note from a root letter/pc plus (letterStep, semitone) interval. */
function spellFromRoot(
  rootLetterIdx: number,
  rootPc: number,
  rootOctave: number,
  letterStep: number,
  semitones: number,
): { name: string; midi: number } {
  const letterIdx = (rootLetterIdx + letterStep) % 7;
  const letterOctaveBump = rootLetterIdx + letterStep >= 7 ? 1 : 0;
  const targetPc = (rootPc + semitones) % 12;
  // Accidental needed to bring the target letter onto the target pitch class.
  const diff = (((targetPc - LETTER_SEMITONES[letterIdx]) % 12) + 12) % 12; // 0..11
  const alt = diff > 6 ? diff - 12 : diff; // -5..6, real chords land in -2..2
  const accidental =
    alt === 0 ? "" : alt === 1 ? "♯" : alt === 2 ? "♯♯" : alt === -1 ? "♭" : alt === -2 ? "♭♭" : `(${alt})`;
  const letter = LETTERS[letterIdx];
  const octave = rootOctave + letterOctaveBump;
  // MIDI from pitch class (not letter arithmetic) so spellings never drift.
  const midi = (octave + 1) * 12 + targetPc;
  return { name: `${letter}${accidental}${octave}`, midi };
}

function parseRoot(name: string): { letterIdx: number; pc: number; octave: number; midi: number } | null {
  const midi = parseNote(name);
  if (midi === null) return null;
  const m = /^([A-Ga-g])([#b♯♭]?)/.exec(name.trim());
  if (!m) return null;
  const letterIdx = LETTERS.indexOf(m[1].toUpperCase() as (typeof LETTERS)[number]);
  let pc = LETTER_SEMITONES[letterIdx];
  if (m[2] === "#" || m[2] === "♯") pc += 1;
  if (m[2] === "b" || m[2] === "♭") pc -= 1;
  const octave = Math.floor(midi / 12) - 1;
  return { letterIdx, pc: ((pc % 12) + 12) % 12, octave, midi };
}

// ---------- intervals ----------

const INTERVAL_NAMES = [
  "Unison", "Minor 2nd", "Major 2nd", "Minor 3rd", "Major 3rd", "Perfect 4th",
  "Tritone", "Perfect 5th", "Minor 6th", "Major 6th", "Minor 7th", "Major 7th",
] as const;

export interface IntervalResult {
  /** Short name, e.g. "M3". */
  short: string;
  /** Full name, e.g. "Major 3rd". */
  name: string;
  /** Interval size in semitones (0–11, wrapped into the octave). */
  semitones: number;
  /** Frequency ratio of the interval (2^(n/12)). */
  ratio: number;
  /** Size in cents (before wrap). */
  cents: number;
}

/** Interval from note A up to note B (wrapped into a single octave). */
export function intervalBetween(noteA: string, noteB: string): IntervalResult | null {
  const a = parseNote(noteA);
  const b = parseNote(noteB);
  if (a === null || b === null) return null;
  let semis = b - a;
  semis = ((semis % 12) + 12) % 12;
  const shorts = ["P1", "m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7"];
  return {
    short: shorts[semis],
    name: INTERVAL_NAMES[semis],
    semitones: semis,
    ratio: Math.pow(2, semis / 12),
    cents: 1200 * Math.log2(Math.pow(2, semis / 12)),
  };
}

// ---------- chords ----------

/** Chord quality: [letterStep, semitones] per tone. Letter steps keep spellings diatonic. */
export const CHORD_QUALITIES: Record<string, [number, number][]> = {
  major: [[0, 0], [2, 4], [4, 7]],
  minor: [[0, 0], [2, 3], [4, 7]],
  dim: [[0, 0], [2, 3], [4, 6]],
  aug: [[0, 0], [2, 4], [4, 8]],
  sus2: [[0, 0], [1, 2], [4, 7]],
  sus4: [[0, 0], [3, 5], [4, 7]],
  maj7: [[0, 0], [2, 4], [4, 7], [6, 11]],
  min7: [[0, 0], [2, 3], [4, 7], [6, 10]],
  dom7: [[0, 0], [2, 4], [4, 7], [6, 10]],
  m7b5: [[0, 0], [2, 3], [4, 6], [6, 10]],
  dim7: [[0, 0], [2, 3], [4, 6], [6, 9]],
  maj6: [[0, 0], [2, 4], [4, 7], [5, 9]],
  min6: [[0, 0], [2, 3], [4, 7], [5, 9]],
  add9: [[0, 0], [2, 4], [4, 7], [8, 14]],
  dom9: [[0, 0], [2, 4], [4, 7], [6, 10], [8, 14]],
};

export interface ChordTone {
  name: string;
  midi: number;
  freq: number;
}

export interface Chord {
  quality: string;
  rootName: string;
  tones: ChordTone[];
}

/** Build a chord from a root note name (with octave, e.g. "Eb3") and quality. */
export function buildChord(root: string, quality: string): Chord | null {
  const spec = CHORD_QUALITIES[quality];
  const r = parseRoot(root);
  if (!spec || !r) return null;
  const tones = spec.map(([ls, semis]) => {
    const { name, midi } = spellFromRoot(r.letterIdx, r.pc, r.octave, ls, semis);
    return { name, midi, freq: midiToFreq(midi) };
  });
  return { quality, rootName: r.octave >= 0 ? `${NOTE_NAMES[r.pc]}${r.octave}` : root, tones };
}

// ---------- scales ----------

export const SCALE_MODES: Record<string, [number, number][]> = {
  "Major (Ionian)": [[0, 0], [1, 2], [2, 4], [3, 5], [4, 7], [5, 9], [6, 11]],
  "Natural minor (Aeolian)": [[0, 0], [1, 2], [2, 3], [3, 5], [4, 7], [5, 8], [6, 10]],
  "Harmonic minor": [[0, 0], [1, 2], [2, 3], [3, 5], [4, 7], [5, 8], [6, 11]],
  "Melodic minor (asc)": [[0, 0], [1, 2], [2, 3], [3, 5], [4, 7], [5, 9], [6, 11]],
  Dorian: [[0, 0], [1, 2], [2, 3], [3, 5], [4, 7], [5, 9], [6, 10]],
  Phrygian: [[0, 0], [1, 1], [2, 3], [3, 5], [4, 7], [5, 8], [6, 10]],
  Lydian: [[0, 0], [1, 2], [2, 4], [3, 6], [4, 7], [5, 9], [6, 11]],
  Mixolydian: [[0, 0], [1, 2], [2, 4], [3, 5], [4, 7], [5, 9], [6, 10]],
  Locrian: [[0, 0], [1, 1], [2, 3], [3, 5], [4, 6], [5, 8], [6, 10]],
  "Major pentatonic": [[0, 0], [1, 2], [2, 4], [4, 7], [5, 9]],
  "Minor pentatonic": [[0, 0], [2, 3], [3, 5], [4, 7], [6, 10]],
  // Blues = minor pentatonic + raised 4th (♯4). A 6-tone scale cannot spell
  // from unique 7-letter steps, so the blue note repeats the 4th degree's
  // letter: A C D D♯ E G — the standard ♯4 spelling.
  Blues: [[0, 0], [2, 3], [3, 5], [3, 6], [4, 7], [6, 10]],
};

export interface ScaleNote {
  name: string;
  midi: number;
  freq: number;
}

/** Build a scale from a root (with octave) and mode name. */
export function buildScale(root: string, mode: string): ScaleNote[] | null {
  const spec = SCALE_MODES[mode];
  const r = parseRoot(root);
  if (!spec || !r) return null;
  return spec.map(([ls, semis]) => {
    const { name, midi } = spellFromRoot(r.letterIdx, r.pc, r.octave, ls, semis);
    return { name, midi, freq: midiToFreq(midi) };
  });
}

// ---------- diatonic chord progressions ----------

const MAJOR_TRIAD_QUALITIES = ["major", "minor", "minor", "major", "major", "minor", "dim"];
const MINOR_TRIAD_QUALITIES = ["minor", "dim", "major", "minor", "minor", "major", "major"];
const ROMAN_MAJOR = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const ROMAN_MINOR = ["i", "ii°", "III", "iv", "v", "VI", "VII"];

export interface DiatonicChord {
  roman: string;
  root: string;
  quality: string;
  tones: ChordTone[];
}

/** The seven diatonic triads of a key (major or natural minor), spelled. */
export function diatonicTriads(keyRoot: string, mode: "major" | "minor"): DiatonicChord[] | null {
  const scale = buildScale(keyRoot, mode === "major" ? "Major (Ionian)" : "Natural minor (Aeolian)");
  if (!scale) return null;
  const qualities = mode === "major" ? MAJOR_TRIAD_QUALITIES : MINOR_TRIAD_QUALITIES;
  const romans = mode === "major" ? ROMAN_MAJOR : ROMAN_MINOR;
  // Strip the octave from scale spellings so chords sit in one comfortable register.
  return scale.map((deg, i) => {
    const rootName = deg.name.replace(/\d+$/, "");
    const chord = buildChord(`${rootName}4`, qualities[i]);
    return { roman: romans[i], root: rootName, quality: qualities[i], tones: chord ? chord.tones : [] };
  });
}

// ---------- circle of fifths ----------

export interface CircleKey {
  major: string;
  minor: string;
  /** Key signature, e.g. "1♯" or "3♭" or "—". */
  signature: string;
  /** Position around the circle, 0 = C at the top, ascending by fifths clockwise. */
  position: number;
}

const CIRCLE_DATA: { major: string; minor: string; sharps: number; flats: number }[] = [
  { major: "C", minor: "A minor", sharps: 0, flats: 0 },
  { major: "G", minor: "E minor", sharps: 1, flats: 0 },
  { major: "D", minor: "B minor", sharps: 2, flats: 0 },
  { major: "A", minor: "F♯ minor", sharps: 3, flats: 0 },
  { major: "E", minor: "C♯ minor", sharps: 4, flats: 0 },
  { major: "B", minor: "G♯ minor", sharps: 5, flats: 0 },
  { major: "F♯", minor: "D♯ minor", sharps: 6, flats: 0 },
  { major: "D♭", minor: "B♭ minor", sharps: 0, flats: 5 },
  { major: "A♭", minor: "F minor", sharps: 0, flats: 4 },
  { major: "E♭", minor: "C minor", sharps: 0, flats: 3 },
  { major: "B♭", minor: "G minor", sharps: 0, flats: 2 },
  { major: "F", minor: "D minor", sharps: 0, flats: 1 },
];

// ---------- key signatures ----------

export const SHARP_ORDER = ["F♯", "C♯", "G♯", "D♯", "A♯", "E♯", "B♯"] as const;
export const FLAT_ORDER = ["B♭", "E♭", "A♭", "D♭", "G♭", "C♭", "F♭"] as const;

const MAJOR_BY_SHARPS = ["C", "G", "D", "A", "E", "B", "F♯", "C♯"];
const MINOR_BY_SHARPS = ["A minor", "E minor", "B minor", "F♯ minor", "C♯ minor", "G♯ minor", "D♯ minor", "A♯ minor"];
const MAJOR_BY_FLATS = ["C", "F", "B♭", "E♭", "A♭", "D♭", "G♭", "C♭"];
const MINOR_BY_FLATS = ["A minor", "D minor", "G minor", "C minor", "F minor", "B♭ minor", "E♭ minor", "A♭ minor"];

export interface KeySignature {
  major: string;
  minor: string;
  /** The accidentals themselves, in their canonical order. */
  accidentals: string[];
}

/**
 * Key from a signature: pass the sharp count OR the flat count (0–7, not
 * both) — e.g. 3 flats → E♭ major / C minor. (0, 0) is C major / A minor.
 * Anything else (both counts set, or out of range) is null.
 */
export function keyFromSignature(sharps: number, flats: number): KeySignature | null {
  const s = Math.floor(sharps);
  const f = Math.floor(flats);
  if (s > 0 && f > 0) return null;
  if (s < 0 || f < 0 || s > 7 || f > 7) return null;
  if (s > 0) {
    return { major: MAJOR_BY_SHARPS[s], minor: MINOR_BY_SHARPS[s], accidentals: SHARP_ORDER.slice(0, s) as unknown as string[] };
  }
  if (f > 0) {
    return { major: MAJOR_BY_FLATS[f], minor: MINOR_BY_FLATS[f], accidentals: FLAT_ORDER.slice(0, f) as unknown as string[] };
  }
  return { major: "C", minor: "A minor", accidentals: [] };
}

/** The 12 keys in circle-of-fifths order (clockwise from C). */
export function circleOfFifths(): CircleKey[] {
  return CIRCLE_DATA.map((k, i) => ({
    major: k.major,
    minor: k.minor,
    signature: k.sharps === 0 && k.flats === 0 ? "—" : k.sharps > 0 ? `${k.sharps}♯` : `${k.flats}♭`,
    position: i,
  }));
}
