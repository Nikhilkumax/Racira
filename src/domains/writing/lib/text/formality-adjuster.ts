/**
 * Formality adjuster: move prose toward a more formal or a more casual register
 * using one published table of paired expressions.
 *
 * Every entry is a single pair — a casual phrasing and its formal counterpart —
 * so the same table serves both directions and the two directions can never
 * disagree about what "formal" means. Matching goes through the shared phrase
 * engine (whole phrases, longest first, overlaps dropped, source spelling
 * preserved), so "get in touch" is never partially matched by "get".
 *
 * The score is a count, not a judgement: casual markers and formal markers are
 * each detected in the text, and the reported register is a band over the
 * difference. It says nothing about whether formal or casual is right for the
 * document — only about which the text currently looks like.
 */
import {
  applyPhraseReplacements,
  findPhraseMatches,
  type PhraseEntry,
  type PhraseMatch,
} from "./phrases.ts";
import { words } from "./tokenize.ts";

export interface FormalityPair {
  casual: string;
  formal: string;
}

/** One published table; both directions read from it. */
export const FORMALITY_PAIRS: readonly FormalityPair[] = [
  { casual: "a lot of", formal: "considerable" },
  { casual: "a bit", formal: "slightly" },
  { casual: "kind of", formal: "somewhat" },
  { casual: "lots of", formal: "many" },
  { casual: "big", formal: "substantial" },
  { casual: "cheap", formal: "inexpensive" },
  { casual: "boss", formal: "supervisor" },
  { casual: "job", formal: "position" },
  { casual: "money", formal: "funds" },
  { casual: "kids", formal: "children" },
  { casual: "help", formal: "assist" },
  { casual: "need", formal: "require" },
  { casual: "buy", formal: "purchase" },
  { casual: "ask", formal: "request" },
  { casual: "start", formal: "commence" },
  { casual: "end", formal: "conclude" },
  { casual: "show", formal: "demonstrate" },
  { casual: "tell", formal: "inform" },
  { casual: "give", formal: "provide" },
  { casual: "use", formal: "utilise" },
  { casual: "wrong", formal: "incorrect" },
  { casual: "enough", formal: "sufficient" },
  { casual: "about", formal: "regarding" },
  { casual: "also", formal: "additionally" },
  { casual: "besides", formal: "moreover" },
  { casual: "find out", formal: "determine" },
  { casual: "look into", formal: "investigate" },
  { casual: "set up", formal: "establish" },
  { casual: "deal with", formal: "address" },
  { casual: "go over", formal: "review" },
  { casual: "come up with", formal: "propose" },
  { casual: "figure out", formal: "determine" },
  { casual: "put off", formal: "postpone" },
  { casual: "point out", formal: "note" },
  { casual: "carry out", formal: "conduct" },
  { casual: "make sure", formal: "ensure" },
  { casual: "right away", formal: "immediately" },
  { casual: "as soon as possible", formal: "promptly" },
  { casual: "sooner or later", formal: "eventually" },
  { casual: "free of charge", formal: "complimentary" },
  { casual: "okay", formal: "acceptable" },
  { casual: "can't", formal: "cannot" },
  { casual: "don't", formal: "do not" },
  { casual: "won't", formal: "will not" },
  { casual: "isn't", formal: "is not" },
  { casual: "aren't", formal: "are not" },
  { casual: "didn't", formal: "did not" },
  { casual: "I think", formal: "I believe" },
];

/** Contractions counted as casual markers but left in place by the rewriter. */
const CASUAL_CONTRACTIONS = ["can't", "don't", "won't", "isn't", "aren't", "didn't", "it's", "i'm", "we're", "they're"];

export type FormalityDirection = "formal" | "casual";

export interface FormalityChange {
  from: string;
  to: string;
}

export interface FormalityScore {
  /** 0-100; 50 is balanced, higher is more formal. */
  score: number;
  label: "Informal" | "Neutral" | "Formal";
  casualMarkers: number;
  formalMarkers: number;
  words: number;
}

export interface FormalityAdjustment extends FormalityScore {
  direction: FormalityDirection;
  output: string;
  changes: FormalityChange[];
}

function entriesFor(direction: FormalityDirection): PhraseEntry[] {
  return FORMALITY_PAIRS.map((pair) =>
    // Phrases are matched case-insensitively, so the table's own casing only
    // matters for the replacement: "I think" must stay capitalised mid-sentence.
    direction === "formal"
      ? {
          phrase: pair.casual.toLowerCase(),
          note: `Formal alternative to "${pair.casual}".`,
          replacement: pair.formal,
        }
      : {
          phrase: pair.formal.toLowerCase(),
          note: `Plainer alternative to "${pair.formal}".`,
          replacement: pair.casual,
        },
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Possessive forms of the single-word pairs, which the shared matcher cannot
 * see because its trailing word boundary will not cross an apostrophe. English
 * uses "-'s" for a singular or irregular plural and a bare apostrophe for a
 * plural that already ends in s, so the suffix depends on the replacement.
 */
function possessiveMatches(text: string, direction: FormalityDirection): PhraseMatch[] {
  const out: PhraseMatch[] = [];
  for (const entry of entriesFor(direction)) {
    if (/\s/.test(entry.phrase) || !entry.replacement) continue;
    const pattern = new RegExp(
      `\\b${escapeRegExp(entry.phrase.toLowerCase())}(['\\u2019]s?)(?![\\p{L}\\p{N}])`,
      "giu",
    );
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const suffix = match[1];
      const curly = suffix.startsWith("\u2019");
      const possessive = entry.replacement.endsWith("s")
        ? curly
          ? "\u2019"
          : "'"
        : curly
          ? "\u2019s"
          : "'s";
      out.push({
        source: match[0],
        phrase: entry.phrase,
        note: entry.note,
        replacement: `${entry.replacement}${possessive}`,
        index: match.index,
        end: match.index + match[0].length,
      });
    }
  }
  return out;
}

function countMatches(text: string, phrases: readonly string[]): number {
  // The shared matcher looks matched text up by its lowercase phrase key, so
  // every table phrase is normalised here before the count.
  const entries: PhraseEntry[] = phrases.map((phrase) => ({ phrase: phrase.toLowerCase(), note: "" }));
  return findPhraseMatches(text, entries).length;
}

/** Count the casual and formal markers and band the difference. */
export function scoreFormality(text: string): FormalityScore {
  const casualPhrases = FORMALITY_PAIRS.map((pair) => pair.casual);
  const formalPhrases = FORMALITY_PAIRS.map((pair) => pair.formal);
  const casualMarkers =
    countMatches(text, casualPhrases) + countMatches(text, CASUAL_CONTRACTIONS);
  const formalMarkers = countMatches(text, formalPhrases);
  const wordCount = words(text).length;

  const score =
    wordCount === 0
      ? 50
      : Math.max(0, Math.min(100, Math.round(50 + ((formalMarkers - casualMarkers) / wordCount) * 240)));
  const label: FormalityScore["label"] = score >= 65 ? "Formal" : score <= 35 ? "Informal" : "Neutral";

  return { score, label, casualMarkers, formalMarkers, words: wordCount };
}

/** Rewrite the text toward one register and list every change. */
export function adjustFormality(text: string, direction: FormalityDirection): FormalityAdjustment {
  const possessives = possessiveMatches(text, direction);
  const plain = findPhraseMatches(text, entriesFor(direction)).filter(
    (match) => !possessives.some((possessive) => match.index < possessive.end && possessive.index < match.end),
  );
  const matches = [...plain, ...possessives].sort((a, b) => a.index - b.index);
  const output = applyPhraseReplacements(text, matches).output;
  const changes: FormalityChange[] = matches.map((match: PhraseMatch) => ({
    from: match.source,
    to: match.replacement ?? match.source,
  }));

  return { ...scoreFormality(text), direction, output, changes };
}
