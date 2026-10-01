/**
 * In-house language detection for Latin-script text.
 *
 * There is no language-identification model here and no network call: the text
 * is scored against curated profiles (see language-profiles.ts) on three kinds
 * of evidence, all of which can be inspected:
 *
 *   function words   closed-class words a language cannot avoid (the, der,
 *                    que, och) — two points per occurrence;
 *   distinctive      letters that belong to one orthography more than its
 *   letters          neighbours (ñ, ß, ı, ł) — 1.5 points per occurrence;
 *   word endings     a few characteristic suffixes (zione, ung, ção) — one
 *                    point per word that uses one.
 *
 * The engine never invents a result. Short input is refused with "not enough
 * text" rather than guessed at, text in another script is reported as
 * unsupported rather than forced into a Latin profile, and a close race
 * between two languages lowers the confidence instead of hiding it. The score
 * table is returned so the page can show exactly why a language won.
 *
 * Known limits, stated on the page as well: closely related languages are
 * deliberately narrowed to one profile per pair (Swedish but not Danish or
 * Norwegian, Czech but not Slovak); proper nouns, loanwords and one-word
 * input can mislead any profile scorer; and a text that switches languages
 * halfway is scored as a whole.
 */
import { wordTokens } from "./tokenize.ts";

export interface LanguageProfile {
  /** Short code used in results ("en", "de"). */
  code: string;
  /** Display name ("English"). */
  name: string;
  /** Closed-class words that are highly frequent in this language. */
  stopwords: readonly string[];
  /** Letters (or short letter sequences) distinctive to the orthography. */
  characters: readonly string[];
  /** Characteristic word endings. */
  endings: readonly string[];
}

export interface LanguageScore {
  code: string;
  name: string;
  score: number;
  stopwordHits: number;
  characterHits: number;
  endingHits: number;
}

export type DetectionStatus = "ok" | "insufficient" | "unsupported-script";
export type DetectionConfidence = "high" | "medium" | "low";

export interface LanguageDetection {
  status: DetectionStatus;
  /** Highest-scoring language when the text was long enough to decide. */
  best: LanguageScore | null;
  /** All profiles, sorted by score (highest first). */
  scores: LanguageScore[];
  confidence: DetectionConfidence;
  /** Score gap between the first and second language. */
  margin: number;
  words: number;
  /** Letters in any script. */
  letters: number;
  /** Letters in the Latin script. */
  latinLetters: number;
  /** Dominant script in the sample ("Latin", "Cyrillic", "Han", …). */
  script: string;
  notes: string[];
}

/** Minimum word count before a result is offered at all. */
export const MIN_LANGUAGE_WORDS = 5;
/** Minimum Latin letter count before a result is offered at all. */
export const MIN_LANGUAGE_LETTERS = 24;
/** Below this share of Latin letters the text is treated as another script. */
export const LATIN_SCRIPT_SHARE = 0.8;

const SCRIPT_PATTERNS: readonly { name: string; pattern: RegExp }[] = [
  { name: "Latin", pattern: /\p{Script=Latin}/gu },
  { name: "Cyrillic", pattern: /\p{Script=Cyrillic}/gu },
  { name: "Greek", pattern: /\p{Script=Greek}/gu },
  { name: "Arabic", pattern: /\p{Script=Arabic}/gu },
  { name: "Hebrew", pattern: /\p{Script=Hebrew}/gu },
  { name: "Devanagari", pattern: /\p{Script=Devanagari}/gu },
  { name: "Bengali", pattern: /\p{Script=Bengali}/gu },
  { name: "Tamil", pattern: /\p{Script=Tamil}/gu },
  { name: "Telugu", pattern: /\p{Script=Telugu}/gu },
  { name: "Thai", pattern: /\p{Script=Thai}/gu },
  { name: "Han", pattern: /\p{Script=Han}/gu },
  { name: "Hiragana", pattern: /\p{Script=Hiragana}/gu },
  { name: "Katakana", pattern: /\p{Script=Katakana}/gu },
  { name: "Hangul", pattern: /\p{Script=Hangul}/gu },
  { name: "Georgian", pattern: /\p{Script=Georgian}/gu },
  { name: "Armenian", pattern: /\p{Script=Armenian}/gu },
];

/** Dominant script and letter counts for a sample. */
export function detectScript(text: string): { script: string; letters: number; latinLetters: number } {
  let letters = 0;
  let latinLetters = 0;
  let dominant = "None";
  let dominantCount = 0;

  for (const { name, pattern } of SCRIPT_PATTERNS) {
    const count = text.match(pattern)?.length ?? 0;
    if (count === 0) continue;
    letters += count;
    if (name === "Latin") latinLetters = count;
    if (count > dominantCount) {
      dominantCount = count;
      dominant = name;
    }
  }

  return { script: dominant, letters, latinLetters };
}

const WEIGHT_STOPWORD = 2;
const WEIGHT_CHARACTER = 1.5;
const WEIGHT_ENDING = 1;

function scoreProfile(profile: LanguageProfile, lowerText: string, tokens: string[]): LanguageScore {
  const stopwords = new Set(profile.stopwords);
  let stopwordHits = 0;
  for (const token of tokens) {
    if (stopwords.has(token)) stopwordHits += 1;
  }

  let characterHits = 0;
  for (const character of profile.characters) {
    if (!character) continue;
    // split() counts overlapping-free occurrences of the sequence.
    characterHits += lowerText.split(character).length - 1;
  }

  let endingHits = 0;
  for (const token of tokens) {
    for (const ending of profile.endings) {
      if (token.length >= ending.length + 2 && token.endsWith(ending)) {
        endingHits += 1;
        break;
      }
    }
  }

  return {
    code: profile.code,
    name: profile.name,
    score: stopwordHits * WEIGHT_STOPWORD + characterHits * WEIGHT_CHARACTER + endingHits * WEIGHT_ENDING,
    stopwordHits,
    characterHits,
    endingHits,
  };
}

/**
 * Score a text against the supplied profiles and return the best candidate.
 * Pass `LANGUAGE_PROFILES` from language-profiles.ts; the profiles are injected
 * so this module stays free of data and can be unit-tested with fixtures.
 */
export function detectLanguage(
  text: string,
  profiles: readonly LanguageProfile[],
): LanguageDetection {
  const { script, letters, latinLetters } = detectScript(text);
  const tokens = wordTokens(text).map((token) => token.text.toLowerCase());
  const words = tokens.length;

  const base = { best: null, scores: [] as LanguageScore[], confidence: "low" as DetectionConfidence, margin: 0, words, letters, latinLetters, script };

  if (letters === 0) {
    return {
      ...base,
      status: "insufficient",
      notes: ["No letters found. Enter a sentence or two of text — numbers and punctuation carry no language."],
    };
  }

  if (latinLetters < letters * LATIN_SCRIPT_SHARE) {
    return {
      ...base,
      status: "unsupported-script",
      notes: [
        `The text is predominantly ${script} script (${letters - latinLetters} of ${letters} letters). This detector scores Latin-script languages only, so it makes no claim here.`,
      ],
    };
  }

  if (words < MIN_LANGUAGE_WORDS || latinLetters < MIN_LANGUAGE_LETTERS) {
    return {
      ...base,
      status: "insufficient",
      notes: [
        `Not enough text to decide: at least ${MIN_LANGUAGE_WORDS} words and ${MIN_LANGUAGE_LETTERS} letters are needed. This sample has ${words} word${words === 1 ? "" : "s"} and ${latinLetters} letter${latinLetters === 1 ? "" : "s"}.`,
      ],
    };
  }

  const lowerText = text.toLowerCase();
  const scores = profiles
    .map((profile) => scoreProfile(profile, lowerText, tokens))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const best = scores[0] ?? null;
  if (!best || best.score === 0) {
    return {
      ...base,
      status: "insufficient",
      scores,
      notes: [
        "No function words, distinctive letters or characteristic endings matched any profile. Try a longer sample of ordinary prose.",
      ],
    };
  }

  const second = scores[1] ?? null;
  const margin = second ? best.score - second.score : best.score;
  const ratio = best.score > 0 ? margin / best.score : 0;
  const confidence: DetectionConfidence = ratio >= 0.45 ? "high" : ratio >= 0.18 ? "medium" : "low";

  const notes = [
    `Scored ${words} words and ${latinLetters} letters against ${profiles.length} Latin-script languages using function words, distinctive letters and word endings.`,
  ];
  if (second) {
    notes.push(`Closest alternative: ${second.name} at ${second.score} points (gap of ${margin}).`);
  }
  if (confidence === "low") {
    notes.push(
      "The leading languages are too close to separate: treat this as a hint, not a verdict. A longer or more ordinary passage of prose usually settles it.",
    );
  } else if (confidence === "medium") {
    notes.push("The lead is clear but not decisive; a longer sample will firm it up.");
  }

  return { ...base, status: "ok", best, scores, confidence, margin, notes };
}

/** Plain-text report for copy/download. */
export function formatDetectionReport(detection: LanguageDetection): string {
  const lines: string[] = [];
  lines.push("Language detection report");
  lines.push("");

  if (detection.status === "ok" && detection.best) {
    lines.push(`Detected: ${detection.best.name} (${detection.best.code})`);
    lines.push(`Confidence: ${detection.confidence}`);
    lines.push(`Words: ${detection.words} | letters: ${detection.latinLetters} | script: ${detection.script}`);
    lines.push("");
    lines.push("Scores (function-word, letter and ending points):");
    for (const entry of detection.scores.slice(0, 6)) {
      lines.push(
        `  ${entry.name.padEnd(12)} ${String(entry.score).padStart(6)}  (words ${entry.stopwordHits}, letters ${entry.characterHits}, endings ${entry.endingHits})`,
      );
    }
  } else {
    lines.push(detection.status === "unsupported-script" ? "Result: unsupported script" : "Result: not enough text");
    lines.push(`Words: ${detection.words} | letters: ${detection.letters} | script: ${detection.script}`);
  }

  if (detection.notes.length > 0) {
    lines.push("");
    for (const note of detection.notes) lines.push(note);
  }
  return lines.join("\n");
}
