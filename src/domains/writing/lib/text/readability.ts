/**
 * Readability formulas, computed from the tokenizer and the syllable heuristic.
 *
 * Every score here is a published formula applied to counts you can inspect —
 * no score is estimated or invented. The formulas and their inputs:
 *
 *   Flesch Reading Ease      206.835 − 1.015 × ASL − 84.6 × ASW
 *   Flesch-Kincaid Grade     0.39 × ASL + 11.8 × ASW − 15.59
 *   Gunning Fog              0.4 × (ASL + 100 × complexWords / words)
 *   SMOG                     1.043 × √(polysyllables × 30 / sentences) + 3.1291
 *   Coleman-Liau             0.0588 × lettersPer100Words − 0.296 × sentencesPer100Words − 15.8
 *   Automated Readability    4.71 × charactersPerWord + 0.5 × ASL − 21.43
 *
 * where ASL is the average sentence length in words and ASW the average number
 * of syllables per word.
 *
 * "Complex words" is Gunning's definition: three or more syllables, excluding
 * words that reach three syllables only through an -es/-ed/-ing ending and
 * excluding tokens that are capitalised in the source (likely proper nouns).
 *
 * Honest limits, surfaced by the UI through `readabilityNotes`:
 *   - formulas are unstable on short samples (the usual floor is ~100 words);
 *   - SMOG was validated on at least 30 sentences;
 *   - syllable counts are heuristic (see syllables.ts), so every score carries
 *     that error;
 *   - numbers, abbreviations and non-English words are counted as written.
 */
import { textStats } from "./stats.ts";
import { wordTokens } from "./tokenize.ts";
import { complexWordCount, countSyllables } from "./syllables.ts";

/** Sample below which every formula here becomes noisy. */
export const MIN_RELIABLE_WORDS = 100;
/** Sentence count SMOG was validated against. */
export const MIN_SMOG_SENTENCES = 30;
/** Tokens of 7+ letters, used as the "long word" share in the analysis views. */
export const LONG_WORD_LETTERS = 7;

export interface ReadabilityMetrics {
  words: number;
  sentences: number;
  paragraphs: number;
  /** Letters only (no digits, punctuation or spaces). */
  letters: number;
  /** UTF-16 code units, including spaces. */
  characters: number;
  syllables: number;
  /** Tokens with three or more syllables. */
  polySyllables: number;
  /** Gunning's complex-word count (proper nouns and suffix-only thirds removed). */
  complexWords: number;
  /** Words per sentence. */
  averageSentenceLength: number;
  /** Syllables per word. */
  averageSyllablesPerWord: number;
  /** Letters per word. */
  averageLettersPerWord: number;
  /** Share of tokens with 7+ letters, 0-1. */
  longWordShare: number;
}

export interface ReadabilityScores extends ReadabilityMetrics {
  /** Flesch Reading Ease: higher is easier, usually read on a 0-100 scale. */
  fleschReadingEase: number;
  /** Flesch-Kincaid Grade Level: a US school grade. */
  fleschKincaidGrade: number;
  /** Gunning Fog Index. */
  gunningFog: number;
  /** Simple Measure of Gobbledygook, only meaningful on 30+ sentences. */
  smog: number;
  /** Coleman-Liau Index (letters-based, no syllables). */
  colemanLiau: number;
  /** Automated Readability Index (characters-based, no syllables). */
  automatedReadability: number;
  /** True when the sample is too short for the scores to be trusted. */
  shortSample: boolean;
}

/** Counts only — no formula needs more than this, so it is exposed separately. */
export function readabilityMetrics(text: string): ReadabilityMetrics {
  const stats = textStats(text);
  const tokens = wordTokens(text).map((token) => token.text);

  let syllables = 0;
  let polySyllables = 0;
  let longWords = 0;
  for (const token of tokens) {
    const count = countSyllables(token);
    syllables += count;
    if (count >= 3) polySyllables += 1;
    if (token.replace(/[^\p{L}]/gu, "").length >= LONG_WORD_LETTERS) longWords += 1;
  }

  return {
    words: stats.words,
    sentences: stats.sentences,
    paragraphs: stats.paragraphs,
    letters: stats.letters,
    characters: stats.characters,
    syllables,
    polySyllables,
    complexWords: complexWordCount(tokens),
    averageSentenceLength: stats.sentences > 0 ? stats.words / stats.sentences : 0,
    averageSyllablesPerWord: stats.words > 0 ? syllables / stats.words : 0,
    averageLettersPerWord: stats.words > 0 ? stats.letters / stats.words : 0,
    longWordShare: stats.words > 0 ? longWords / stats.words : 0,
  };
}

/** Round to one decimal place — the precision these indices are quoted at. */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * All six formulas for one text. Values are `0` when the text has no words or
 * no sentences, and `shortSample` flags the case where they should be read as
 * indicative only.
 */
export function readabilityScores(text: string): ReadabilityScores {
  const metrics = readabilityMetrics(text);
  const { words, sentences, syllables, polySyllables, complexWords, letters, characters } = metrics;

  if (words === 0 || sentences === 0) {
    return {
      ...metrics,
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      gunningFog: 0,
      smog: 0,
      colemanLiau: 0,
      automatedReadability: 0,
      shortSample: true,
    };
  }

  const asl = words / sentences;
  const asw = syllables / words;
  const lettersPer100 = (letters / words) * 100;
  const sentencesPer100 = (sentences / words) * 100;

  return {
    ...metrics,
    fleschReadingEase: round1(206.835 - 1.015 * asl - 84.6 * asw),
    fleschKincaidGrade: round1(0.39 * asl + 11.8 * asw - 15.59),
    gunningFog: round1(0.4 * (asl + (complexWords / words) * 100)),
    smog: round1(1.043 * Math.sqrt(polySyllables * (30 / sentences)) + 3.1291),
    colemanLiau: round1(0.0588 * lettersPer100 - 0.296 * sentencesPer100 - 15.8),
    automatedReadability: round1(4.71 * (characters / words) + 0.5 * asl - 21.43),
    shortSample: words < MIN_RELIABLE_WORDS || sentences < 3,
  };
}

export interface FleschBand {
  min: number;
  label: string;
  note: string;
}

/** The published Flesch Reading Ease bands, easiest first. */
export const FLESCH_BANDS: FleschBand[] = [
  { min: 90, label: "Very easy", note: "Plain sentences, short words — around 5th-grade reading level." },
  { min: 80, label: "Easy", note: "Conversational prose — around 6th-grade reading level." },
  { min: 70, label: "Fairly easy", note: "Comfortable for most adults — around 7th-grade reading level." },
  { min: 60, label: "Standard", note: "Typical newspaper and web copy — 8th to 9th grade." },
  { min: 50, label: "Fairly difficult", note: "Needs attention — 10th to 12th grade." },
  { min: 30, label: "Difficult", note: "College reading level; long sentences or specialist words." },
  { min: -Infinity, label: "Very difficult", note: "Dense academic or legal prose; consider splitting sentences." },
];

/** Band for a Flesch Reading Ease score (scores above 100 use the easiest band). */
export function fleschBand(score: number): FleschBand {
  return FLESCH_BANDS.find((band) => score >= band.min) ?? FLESCH_BANDS[FLESCH_BANDS.length - 1];
}

const ORDINALS = [
  "",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
];

/**
 * US school-grade label for a grade-level score (Flesch-Kincaid, Fog, SMOG or
 * Coleman-Liau all report this scale). Grades are rounded up, which is the
 * usual reading: a 7.2 means a reader needs the 8th grade.
 */
export function gradeLabel(score: number): string {
  const grade = Math.ceil(score);
  if (grade <= 0) return "Below 1st grade";
  if (grade <= 12) return `${ORDINALS[grade]} grade`;
  if (grade <= 16) return "College (undergraduate)";
  return "Graduate / professional";
}

/** Human-readable reliability caveats for the current sample. */
export function readabilityNotes(metrics: ReadabilityMetrics): string[] {
  const notes: string[] = [];
  if (metrics.words === 0 || metrics.sentences === 0) {
    notes.push("Enter some text — every score needs at least one full sentence to mean anything.");
    return notes;
  }
  if (metrics.words < MIN_RELIABLE_WORDS) {
    notes.push(
      `Short sample: ${metrics.words} words. Readability formulas are usually quoted for samples of ${MIN_RELIABLE_WORDS} words or more, and swing widely below that.`,
    );
  }
  if (metrics.sentences < MIN_SMOG_SENTENCES) {
    notes.push(
      `SMOG was validated on ${MIN_SMOG_SENTENCES} sentences or more; with ${metrics.sentences} it is indicative only.`,
    );
  }
  notes.push("Syllables come from a documented English heuristic, so every score carries that small error.");
  return notes;
}
