/**
 * Unit tests for the readability formulas.
 *
 * The primary assertion uses a controlled passage whose word, sentence, syllable
 * and letter counts are fixed by construction, so each published formula can be
 * evaluated by hand in the test and compared with the engine's rounded output.
 * If a constant in readability.ts changes, these tests fail.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FLESCH_BANDS,
  MIN_RELIABLE_WORDS,
  fleschBand,
  gradeLabel,
  readabilityMetrics,
  readabilityNotes,
  readabilityScores,
} from "./readability.ts";

/** Counts for `SIMPLE`, true by construction: 12 words, 2 sentences, 12 syllables. */
const SIMPLE = "The cat sat on the mat. The dog ran to the park.";
const SIMPLE_WORDS = 12;
const SIMPLE_SENTENCES = 2;
const SIMPLE_SYLLABLES = 12;
const SIMPLE_LETTERS = 35;
const SIMPLE_CHARACTERS = 48;

/** Formula constants, written here so the test states the reference it checks. */
const FLESCH_EASE = { base: 206.835, asl: 1.015, asw: 84.6 };
const FLESCH_KINCAID = { asl: 0.39, asw: 11.8, base: 15.59 };
const FOG = { factor: 0.4, per100: 100 };
const SMOG = { factor: 1.043, per30: 30, base: 3.1291 };
const COLEMAN = { letters: 0.0588, sentences: 0.296, base: 15.8 };
const ARI = { characters: 4.71, asl: 0.5, base: 21.43 };

test("readabilityMetrics: raw counts for a controlled passage", () => {
  const metrics = readabilityMetrics(SIMPLE);
  assert.equal(metrics.words, SIMPLE_WORDS);
  assert.equal(metrics.sentences, SIMPLE_SENTENCES);
  assert.equal(metrics.syllables, SIMPLE_SYLLABLES);
  assert.equal(metrics.letters, SIMPLE_LETTERS);
  assert.equal(metrics.characters, SIMPLE_CHARACTERS);
  assert.equal(metrics.polySyllables, 0);
  assert.equal(metrics.complexWords, 0);
  assert.equal(metrics.averageSentenceLength, SIMPLE_WORDS / SIMPLE_SENTENCES);
  assert.equal(metrics.averageSyllablesPerWord, 1);
  assert.equal(metrics.paragraphs, 1);
});

test("readabilityScores: every formula matches its published form", () => {
  const scores = readabilityScores(SIMPLE);
  const asl = SIMPLE_WORDS / SIMPLE_SENTENCES;
  const asw = SIMPLE_SYLLABLES / SIMPLE_WORDS;
  const lettersPer100 = (SIMPLE_LETTERS / SIMPLE_WORDS) * 100;
  const sentencesPer100 = (SIMPLE_SENTENCES / SIMPLE_WORDS) * 100;
  const expect = (value: number) => Math.round(value * 10) / 10;

  assert.equal(
    scores.fleschReadingEase,
    expect(FLESCH_EASE.base - FLESCH_EASE.asl * asl - FLESCH_EASE.asw * asw),
  );
  assert.equal(
    scores.fleschKincaidGrade,
    expect(FLESCH_KINCAID.asl * asl + FLESCH_KINCAID.asw * asw - FLESCH_KINCAID.base),
  );
  assert.equal(scores.gunningFog, expect(FOG.factor * (asl + 0)));
  assert.equal(
    scores.colemanLiau,
    expect(COLEMAN.letters * lettersPer100 - COLEMAN.sentences * sentencesPer100 - COLEMAN.base),
  );
  assert.equal(
    scores.automatedReadability,
    expect(ARI.characters * (SIMPLE_CHARACTERS / SIMPLE_WORDS) + ARI.asl * asl - ARI.base),
  );
  // SMOG with no polysyllables reduces to its published floor.
  assert.equal(scores.smog, Math.round(SMOG.base * 10) / 10);
});

test("readabilityScores: the controlled passage is easier than dense prose", () => {
  const easy = readabilityScores(SIMPLE);
  const dense = readabilityScores(
    "Understanding readability necessitates recognising polysyllabic terminology. " +
      "Comprehension deteriorates whenever sentences incorporate subordinate configurations, " +
      "consequently diminishing accessibility for unaccustomed readerships.",
  );
  assert.ok(dense.averageSyllablesPerWord > easy.averageSyllablesPerWord);
  assert.ok(dense.fleschReadingEase < easy.fleschReadingEase, "more syllables must lower reading ease");
  assert.ok(dense.gunningFog > easy.gunningFog, "complex words must raise the Fog index");
  assert.ok(dense.fleschKincaidGrade > easy.fleschKincaidGrade);
});

test("readabilityScores: long-word share and complex words move in step", () => {
  const scores = readabilityScores("The implementation necessitates substantial refactoring.");
  assert.equal(scores.words, 5);
  assert.ok(scores.polySyllables >= 3, "implementation, necessitates and substantial are polysyllabic");
  assert.ok(scores.complexWords >= 2);
  assert.ok(scores.longWordShare > 0);
  assert.ok(scores.longWordShare <= 1);
});

test("readabilityScores: empty input is zeroed, single-word input is flagged", () => {
  for (const text of ["", "   "]) {
    const scores = readabilityScores(text);
    assert.equal(scores.words, 0);
    assert.equal(scores.fleschReadingEase, 0);
    assert.equal(scores.gunningFog, 0);
    assert.equal(scores.smog, 0);
    assert.equal(scores.shortSample, true);
  }

  // A single word is still run through the formulas, but it is flagged rather
  // than suppressed: hiding a number the user asked for would be worse.
  const single = readabilityScores("word");
  assert.equal(single.words, 1);
  assert.equal(single.averageSentenceLength, 1);
  assert.equal(single.averageSyllablesPerWord, 1);
  assert.equal(single.gunningFog, 0.4);
  assert.equal(single.shortSample, true);
});

test("readabilityScores: shortSample flags samples below the reliable floor", () => {
  assert.equal(readabilityScores(SIMPLE).shortSample, true);
  const long = `The cat sat on the mat. The dog ran to the park. `.repeat(12);
  const scores = readabilityScores(long);
  assert.ok(scores.words > MIN_RELIABLE_WORDS);
  assert.equal(scores.shortSample, false);
});

test("fleschBand: published bands and their boundaries", () => {
  assert.equal(fleschBand(95).label, "Very easy");
  assert.equal(fleschBand(90).label, "Very easy");
  assert.equal(fleschBand(85).label, "Easy");
  assert.equal(fleschBand(75).label, "Fairly easy");
  assert.equal(fleschBand(65).label, "Standard");
  assert.equal(fleschBand(55).label, "Fairly difficult");
  assert.equal(fleschBand(40).label, "Difficult");
  assert.equal(fleschBand(10).label, "Very difficult");
  // Scores above the scale's usual top fall into the easiest band.
  assert.equal(fleschBand(116.1).label, "Very easy");
  assert.equal(FLESCH_BANDS.length, 7);
  for (const band of FLESCH_BANDS) assert.ok(band.note.length > 20, "each band explains itself");
});

test("gradeLabel: US school grades, rounded up", () => {
  assert.equal(gradeLabel(-1.5), "Below 1st grade");
  assert.equal(gradeLabel(1), "1st grade");
  assert.equal(gradeLabel(7.2), "8th grade");
  assert.equal(gradeLabel(12), "12th grade");
  assert.equal(gradeLabel(13), "College (undergraduate)");
  assert.equal(gradeLabel(16), "College (undergraduate)");
  assert.equal(gradeLabel(17.4), "Graduate / professional");
});

test("readabilityNotes: states the sample limits instead of hiding them", () => {
  const short = readabilityNotes(readabilityMetrics(SIMPLE));
  assert.ok(short.some((note) => note.includes("Short sample")));
  assert.ok(short.some((note) => note.includes("SMOG")));
  assert.ok(short.some((note) => note.includes("heuristic")));

  const empty = readabilityNotes(readabilityMetrics(""));
  assert.equal(empty.length, 1);
  assert.ok(empty[0].includes("at least one full sentence"));
});
