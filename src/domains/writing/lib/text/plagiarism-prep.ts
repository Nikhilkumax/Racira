/**
 * Plagiarism self-check prep: quote hygiene and the checklist for submitting a
 * draft to a similarity service.
 *
 * This tool cannot detect plagiarism and does not pretend to: detecting
 * similarity means comparing against a corpus, which is a service, not a local
 * script. What it can do is the preparation that decides what a similarity
 * report will say — mark every quotation, cite it close enough that a reader
 * sees the source, keep quoted material proportionate, and know which files to
 * attach. Unmarked quotations and over-quoted sections are the two causes of
 * alarming similarity scores that are not plagiarism at all.
 *
 * Every quote found is listed with its length, whether a citation sits beside
 * it, and which sentence it lives in, so the writer can fix the report the
 * checker will produce rather than guess at it.
 */
import { sentenceTokens, words } from "./tokenize.ts";

export interface QuoteFinding {
  text: string;
  wordCount: number;
  /** Sentence the quote appears in, trimmed for display. */
  sentence: string;
  cited: boolean;
}

export interface PlagiarismPrepResult {
  quotes: QuoteFinding[];
  counts: {
    words: number;
    quotedWords: number;
    /** Quoted share of the draft, 0-100. */
    quoteShare: number;
    citations: number;
    uncited: number;
    longQuotes: number;
    unbalanced: boolean;
  };
  checks: string[];
  checklist: string[];
  report: string;
}

/** Citation shapes a reader can follow: parenthetical, numeric, footnote. */
const CITATION = /\([^)]*(?:1[5-9]\d{2}|20\d{2})[^)]*\)|\[\d+(?:\s*[-,]\s*\d+)*\]|\bfootnote\b|\bibid\b|\bsee\s+\w+/i;
/** Quotes over this length are usually set as block quotations. */
export const BLOCK_QUOTE_WORDS = 40;
/** Quoted share above which even cited material dominates the draft. */
export const QUOTE_SHARE_LIMIT = 15;

export const PREP_CHECKLIST: readonly string[] = [
  "Submit the draft as plain text or PDF; formatting is not what the checker compares.",
  "Include the reference list in the same file so cited matches can be discounted.",
  "List the sources you consulted but did not end up citing; some services score against everything submitted.",
  "Keep quotations inside quotation marks: a check reports a match either way, but a marked and cited quote is explained in one line.",
  "After the report, read every flagged passage against its source before changing anything — a high score is a question, not a verdict.",
];

const QUOTE_PATTERN = /"([^"\n]{4,600})"|\u201c([^\u201d\n]{4,600})\u201d/g;

/** Find the quotes, judge their citation and proportion, and build the prep report. */
export function preparePlagiarismCheck(text: string): PlagiarismPrepResult {
  const trimmed = text.trim();
  const totalWords = words(trimmed).length;
  const sentenceList = sentenceTokens(trimmed).map((token) => token.text.trim());

  // Locate each quote's sentence by scanning the sentence list for its text.
  const sentencesWithIndex = sentenceList.map((sentence, index) => ({ sentence, index }));
  const quoteMatches = [...trimmed.matchAll(QUOTE_PATTERN)];

  const quotes: QuoteFinding[] = quoteMatches.map((match) => {
    const quoteText = (match[1] ?? match[2] ?? "").trim();
    const start = match.index ?? 0;
    const owner =
      sentencesWithIndex.find(({ sentence }) => {
        const at = trimmed.indexOf(sentence);
        return at >= 0 && at <= start && start < at + sentence.length + 2;
      })?.sentence ?? quoteText;
    const ownerIndex = sentenceList.indexOf(owner);
    const window =
      ownerIndex >= 0
        ? `${owner} ${sentenceList[ownerIndex + 1] ?? ""}`.trim()
        : owner;
    return {
      text: quoteText,
      wordCount: words(quoteText).length,
      sentence: owner,
      cited: CITATION.test(window),
    };
  });

  const quotedWords = quotes.reduce((sum, quote) => sum + quote.wordCount, 0);
  const citationCount = (trimmed.match(new RegExp(CITATION, "gi")) ?? []).length;
  const doubleQuoteCount = (trimmed.match(/"/g) ?? []).length;
  const openCurly = (trimmed.match(/\u201c/g) ?? []).length;
  const closeCurly = (trimmed.match(/\u201d/g) ?? []).length;
  const unbalanced = doubleQuoteCount % 2 !== 0 || openCurly !== closeCurly;

  const longQuotes = quotes.filter((quote) => quote.wordCount > BLOCK_QUOTE_WORDS).length;
  const uncited = quotes.filter((quote) => !quote.cited).length;
  const quoteShare = totalWords > 0 ? Math.round((quotedWords / totalWords) * 1000) / 10 : 0;

  const checks: string[] = [];
  if (unbalanced) {
    checks.push("Quotation marks do not balance; an unclosed quote can swallow a whole sentence into a match.");
  }
  if (uncited > 0) {
    checks.push(`${uncited} quotation${uncited === 1 ? " has" : "s have"} no citation in the same or the next sentence.`);
  }
  if (longQuotes > 0) {
    checks.push(`${longQuotes} quotation${longQuotes === 1 ? " runs" : "s run"} past ${BLOCK_QUOTE_WORDS} words; set it as a block quotation with its source line.`);
  }
  if (quoteShare > QUOTE_SHARE_LIMIT) {
    checks.push(
      `Quoted material is ${quoteShare}% of the draft; even cited, past roughly ${QUOTE_SHARE_LIMIT}% the quotations are doing the writing.`,
    );
  }
  if (totalWords > 50 && citationCount === 0) {
    checks.push("No citations found at all: a checker discounts matches that point at a source, and none of yours do.");
  }
  if (!trimmed) {
    checks.push("Paste the draft to check its quotations and prepare the submission.");
  }

  const report = quotes.length
    ? quotes
        .map(
          (quote, index) =>
            `${index + 1}. ${quote.wordCount} words — ${quote.cited ? "cited" : "NOT cited"}\n   “${quote.text}”`,
        )
        .join("\n")
    : "No quotation marks found in this draft.";

  return {
    quotes,
    counts: {
      words: totalWords,
      quotedWords,
      quoteShare,
      citations: citationCount,
      uncited,
      longQuotes,
      unbalanced,
    },
    checks,
    checklist: [...PREP_CHECKLIST],
    report,
  };
}
