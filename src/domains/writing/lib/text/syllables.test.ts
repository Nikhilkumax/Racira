/**
 * Unit tests for the syllable heuristic.
 *
 * The reference list below holds dictionary syllabifications for words whose
 * count is not in dispute (Merriam-Webster style: "tel·e·phone" = 3). The
 * heuristic is documented in syllables.ts; these tests pin the behaviour so a
 * rule change that breaks common words fails the build rather than quietly
 * shifting every readability score.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  complexWordCount,
  countSyllables,
  isComplexWord,
  polysyllableCount,
  totalSyllables,
} from "./syllables.ts";

/** One-syllable words, including the endings the rules have to strip. */
const ONE_SYLLABLE: Record<string, number> = {
  the: 1,
  and: 1,
  eye: 1,
  cat: 1,
  mat: 1,
  walked: 1,
  makes: 1,
  mile: 1,
  pale: 1,
  queue: 1,
  once: 1,
  through: 1,
  strength: 1,
  taught: 1,
  bright: 1,
  eight: 1,
  one: 1,
  three: 1,
  five: 1,
  nine: 1,
  twelve: 1,
  so: 1,
  shrunk: 1,
};

/** Multi-syllable words with unambiguous counts. */
const MULTI_SYLLABLE: Record<string, number> = {
  wanted: 2,
  needed: 2,
  houses: 2,
  watches: 2,
  cities: 2,
  simple: 2,
  likely: 2,
  lonely: 2,
  table: 2,
  people: 2,
  value: 2,
  quiet: 2,
  science: 2,
  business: 2,
  english: 2,
  number: 2,
  language: 2,
  complex: 2,
  reading: 2,
  writing: 2,
  sentence: 2,
  colonel: 2,
  naked: 2,
  sacred: 2,
  final: 2,
  family: 3,
  finally: 3,
  italy: 3,
  telephone: 3,
  elephant: 3,
  butterfly: 3,
  banana: 3,
  computer: 3,
  important: 3,
  wonderful: 3,
  beautiful: 3,
  idea: 3,
  area: 3,
  variety: 4,
  interested: 3,
  interesting: 4,
  everything: 3,
  everybody: 4,
  silently: 3,
  quietly: 3,
  seriously: 4,
  dictionary: 4,
  ordinary: 4,
  average: 3,
  percentage: 3,
  clarity: 3,
  syllable: 3,
  analysis: 4,
  frequency: 3,
  document: 3,
  calculator: 4,
  paragraph: 3,
  education: 4,
  information: 4,
  university: 5,
  understand: 3,
  development: 4,
  performance: 3,
  society: 4,
  poetry: 3,
  media: 3,
  stadium: 3,
  aquarium: 4,
  biology: 4,
  biography: 4,
  geography: 4,
  geology: 4,
  geometry: 4,
  psychology: 4,
  photography: 4,
  vocabulary: 5,
  pronunciation: 5,
  responsibility: 6,
  obviously: 4,
  curious: 3,
  previous: 3,
  various: 3,
  precious: 2,
  cautious: 2,
  anxious: 2,
  conscious: 2,
  delicious: 3,
  suspicious: 3,
  religious: 3,
  gorgeous: 2,
  famous: 2,
  nervous: 2,
};

test("countSyllables: one-syllable reference words", () => {
  for (const [word, expected] of Object.entries(ONE_SYLLABLE)) {
    assert.equal(countSyllables(word), expected, `"${word}" should be ${expected}`);
  }
});

test("countSyllables: multi-syllable reference words", () => {
  for (const [word, expected] of Object.entries(MULTI_SYLLABLE)) {
    assert.equal(countSyllables(word), expected, `"${word}" should be ${expected}`);
  }
});

test("countSyllables: silent e, -ed and -es endings", () => {
  // Silent final e.
  assert.equal(countSyllables("make"), 1);
  assert.equal(countSyllables("telephone"), 3);
  assert.equal(countSyllables("sentence"), 2);
  // Consonant + "le" keeps its own syllable.
  assert.equal(countSyllables("table"), 2);
  assert.equal(countSyllables("simple"), 2);
  // "-ed" only adds a syllable after t or d.
  assert.equal(countSyllables("walked"), 1);
  assert.equal(countSyllables("wanted"), 2);
  assert.equal(countSyllables("needed"), 2);
  // "-es" is silent unless it follows a sibilant.
  assert.equal(countSyllables("makes"), 1);
  assert.equal(countSyllables("houses"), 2);
  assert.equal(countSyllables("watches"), 2);
});

test("countSyllables: case, diacritics, punctuation and numbers", () => {
  assert.equal(countSyllables("PHONE"), 1);
  assert.equal(countSyllables("café"), 1, "diacritics are folded before counting");
  assert.equal(countSyllables("don't"), 1, "apostrophes stay inside the word");
  assert.equal(countSyllables("well-known"), 2, "hyphenated compounds count both halves");
  assert.equal(countSyllables("2026"), 1, "numbers count as one syllable");
  assert.equal(countSyllables("3.5"), 1);
  assert.equal(countSyllables(""), 0);
  assert.equal(countSyllables("   "), 0);
  assert.equal(countSyllables("!!!"), 0);
});

test("countSyllables: every word has at least one syllable", () => {
  for (const word of ["a", "I", "x", "sky", "rhythm", "strengths"]) {
    assert.ok(countSyllables(word) >= 1, `"${word}" must be at least 1`);
  }
});

test("totalSyllables and polysyllableCount", () => {
  const tokens = ["The", "elephant", "sat", "quietly"];
  assert.equal(totalSyllables(tokens), 1 + 3 + 1 + 3);
  assert.equal(polysyllableCount(tokens), 2);
  // Capitalised tokens are proper nouns and are excluded when asked.
  assert.equal(polysyllableCount(["Elephant"], true), 0);
  assert.equal(polysyllableCount(["elephant"], true), 1);
});

test("isComplexWord: Gunning's definition", () => {
  assert.equal(isComplexWord("cat"), false);
  assert.equal(isComplexWord("table"), false);
  assert.equal(isComplexWord("elephant"), true);
  assert.equal(isComplexWord("important"), true);
  // Three syllables only because of a suffix: not complex.
  assert.equal(isComplexWord("created"), false);
  assert.equal(isComplexWord("creating"), false);
  assert.equal(isComplexWord("houses"), false);
  // A capitalised token is treated as a proper noun and excluded.
  assert.equal(isComplexWord("Elephant", true), false);
});

test("complexWordCount counts only genuine three-syllable words", () => {
  assert.equal(complexWordCount(["cat", "elephant", "created", "table"]), 1);
  assert.equal(complexWordCount(["Understanding", "readability"]), 1, "proper nouns are dropped");
});

/**
 * Held-out sample: 60 common English words chosen after the heuristic was
 * frozen. None of them appears in the tables above or in the exceptions map,
 * and syllables.ts was not adjusted to fit them — this is an audit, not a
 * training set. Result at the time of writing: 60/60. The assertion lists any
 * word that ever regresses, so a rule change cannot trade these away quietly.
 */
const HELD_OUT: Record<string, number> = {
  water: 2,
  river: 2,
  doctor: 2,
  morning: 2,
  window: 2,
  garden: 2,
  market: 2,
  summer: 2,
  winter: 2,
  mother: 2,
  father: 2,
  sister: 2,
  brother: 2,
  teacher: 2,
  student: 2,
  letter: 2,
  paper: 2,
  moment: 2,
  minute: 2,
  second: 2,
  music: 2,
  mountain: 2,
  island: 2,
  forest: 2,
  flower: 2,
  happy: 2,
  silly: 2,
  funny: 2,
  sunny: 2,
  heavy: 2,
  angry: 2,
  hungry: 2,
  early: 2,
  easy: 2,
  lazy: 2,
  pretty: 2,
  tiny: 2,
  magic: 2,
  model: 2,
  metal: 2,
  total: 2,
  local: 2,
  apple: 2,
  orange: 2,
  lemon: 2,
  cherry: 2,
  animal: 3,
  hospital: 3,
  holiday: 3,
  energy: 3,
  history: 3,
  mystery: 3,
  industry: 3,
  memory: 3,
  company: 3,
  potato: 3,
  tomato: 3,
  camera: 3,
  umbrella: 3,
  restaurant: 3,
};

test("countSyllables: held-out 60-word sample (no tuning)", () => {
  const failures = Object.entries(HELD_OUT).filter(([word, expected]) => countSyllables(word) !== expected);
  assert.deepEqual(
    failures.map(([word, expected]) => `${word}: expected ${expected}, got ${countSyllables(word)}`),
    [],
    "held-out words must keep their dictionary counts",
  );
});
