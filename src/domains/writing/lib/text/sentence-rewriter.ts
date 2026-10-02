/**
 * Sentence rewriter: rule-based rewrites of one sentence at a time.
 *
 * This is deliberately not a paraphrasing model. It applies four documented
 * sentence-level moves and shows the result of each, so the writer picks:
 *
 *   - "Lead with the cause" — move a trailing subordinate clause to the front;
 *   - "Lead with the action" — move a leading subordinate clause to the end;
 *   - "Split into two sentences" — break at a comma + and/but/so/yet/or or a
 *     semicolon, giving each half its own full stop;
 *   - "Cut the intensifiers" — drop a published list of filler adverbs.
 *
 * The engine never changes a word it was not told to change and reuses the
 * shared `Intl.Segmenter` word counter, so a reported word count is the same
 * number the rest of the domain reports for the same sentence.
 */
import { sentences, words } from "./tokenize.ts";

/** Subordinating conjunctions that can open or close a clause. */
export const SUBORDINATORS = [
  "because",
  "although",
  "though",
  "since",
  "while",
  "when",
  "if",
  "unless",
  "after",
  "before",
  "once",
  "whenever",
  "whereas",
] as const;

/** Intensifiers and qualifiers the "cut" variant removes. */
export const FILLER_WORDS = [
  "very",
  "really",
  "quite",
  "just",
  "actually",
  "basically",
  "literally",
  "simply",
  "rather",
  "somewhat",
  "totally",
  "definitely",
] as const;

/**
 * Sentence starters safe to lowercase when a clause moves in front of them.
 * Anything else is left capitalised: the engine cannot tell a common noun from
 * a proper noun, so "Vess" is never silently lowercased.
 */
const COMMON_STARTERS = new Set([
  "the",
  "a",
  "an",
  "this",
  "that",
  "these",
  "those",
  "it",
  "he",
  "she",
  "they",
  "we",
  "you",
  "my",
  "our",
  "his",
  "her",
  "their",
  "there",
  "i",
]);

export interface RewriteVariant {
  id: string;
  label: string;
  text: string;
  note: string;
}

export interface SentenceRewrite {
  /** The sentence exactly as supplied, whitespace collapsed. */
  source: string;
  /** Words in the source sentence. */
  words: number;
  variants: RewriteVariant[];
  /** Observations about the sentence that do not change it. */
  notes: string[];
}

export interface RewriteReport {
  sentences: number;
  withVariants: number;
  totalVariants: number;
  rewrites: SentenceRewrite[];
}

const LEADING = new RegExp(`^(${SUBORDINATORS.join("|")})\\b([^,.]*),\\s+(\\S.*)$`, "i");
const TRAILING = new RegExp(`^(.+?)[,;]?\\s+(${SUBORDINATORS.join("|")})\\s+([^,;]+?)[.!?]*$`, "i");
const SPLIT_AT = /(,\s+(?:and|but|so|yet|or)\s+|;\s+)/i;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function softenCase(value: string): string {
  const first = words(value)[0]?.toLowerCase() ?? "";
  return COMMON_STARTERS.has(first) ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

function stripEnd(value: string): string {
  return value.replace(/[.!?]+$/, "").trim();
}

/** Every documented rewrite of one sentence, in a fixed order. */
export function rewriteSentence(sentence: string): SentenceRewrite {
  const source = sentence.trim().replace(/\s+/g, " ");
  const variants: RewriteVariant[] = [];
  const notes: string[] = [];
  const wordCount = words(source).length;

  if (source) {
    const leading = source.match(LEADING);
    if (leading) {
      const [, conjunction, condition, main] = leading;
      variants.push({
        id: "end-clause",
        label: "Lead with the action",
        text: `${capitalize(stripEnd(main))} ${conjunction.toLowerCase()}${condition}.`,
        note: "Moves the main clause first so the sentence states its point before it qualifies it.",
      });
    }

    const trailing = source.match(TRAILING);
    if (trailing) {
      const [, main, conjunction, rest] = trailing;
      const front = `${capitalize(conjunction)} ${rest.trim()}, ${softenCase(stripEnd(main))}.`;
      if (!variants.some((variant) => variant.text === front)) {
        variants.push({
          id: "front-clause",
          label: "Lead with the cause",
          text: front,
          note: "Puts the condition before the consequence, which is the order a reader usually expects.",
        });
      }
    }

    const split = source.match(SPLIT_AT);
    if (split && split.index !== undefined) {
      const first = stripEnd(source.slice(0, split.index));
      const second = stripEnd(source.slice(split.index + split[0].length));
      if (first && second) {
        variants.push({
          id: "split",
          label: "Split into two sentences",
          text: `${capitalize(first)}. ${capitalize(second)}.`,
          note: "Each half gets its own full stop, so two ideas stop competing for one sentence.",
        });
      }
    }

    const filler = new RegExp(`\\b(?:${FILLER_WORDS.join("|")})\\s+`, "gi");
    const tightened = source.replace(filler, "").replace(/\s{2,}/g, " ").trim();
    if (tightened !== source) {
      variants.push({
        id: "tighten",
        label: "Cut the intensifiers",
        text: tightened,
        note: "Removes filler adverbs; check that none of them was carrying meaning the sentence needs.",
      });
    }

    if (wordCount > 30) {
      notes.push(`${wordCount} words — long enough that splitting it usually reads better.`);
    }
    if (/^there (?:is|are|was|were)\b/i.test(source)) {
      notes.push("Opens with an expletive (there is / there are); naming the actor reads stronger.");
    }
  }

  return { source, words: wordCount, variants, notes };
}

/** Apply `rewriteSentence` to every sentence in a document. */
export function rewriteSentences(text: string): RewriteReport {
  const rewrites = sentences(text).map(rewriteSentence);
  return {
    sentences: rewrites.length,
    withVariants: rewrites.filter((rewrite) => rewrite.variants.length > 0).length,
    totalVariants: rewrites.reduce((total, rewrite) => total + rewrite.variants.length, 0),
    rewrites,
  };
}
