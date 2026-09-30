/**
 * Passive-voice detection: a documented heuristic, not a parser.
 *
 * A passive construction is `be` (or `get`) plus a past participle, so that is
 * what this module looks for: a form of "be", optionally separated from the
 * participle by a common adverb, followed by a token that is either an irregular
 * participle from the shared list or a regular `-ed` participle. When a `by`
 * phrase follows within a few tokens the hit is marked "strong", because an
 * expressed agent is the clearest sign of a true passive; otherwise it is a
 * "candidate".
 *
 * Known limits, stated on the tool page:
 *   - adjectival participles look identical and are flagged as well
 *     ("the door is closed" is arguably a state, not an action);
 *   - `get`-passives are not detected separately, since "get" is usually a main
 *     verb;
 *   - the irregular list is finite, so an unusual participle may be missed.
 */
import { sentenceTokens, wordTokens } from "./tokenize.ts";
import { BE_FORMS, IRREGULAR_PARTICIPLES, NON_PARTICIPLE_ED, PASSTHROUGH_ADVERBS } from "./lexicons.ts";

export interface PassiveHit {
  /** Index of the auxiliary within the whole text's token stream. */
  index: number;
  sentenceIndex: number;
  auxiliary: string;
  participle: string;
  /** "strong" when a by-agent follows, "candidate" otherwise. */
  confidence: "strong" | "candidate";
  /** The auxiliary + participle as they appear, e.g. "was written". */
  phrase: string;
  sentence: string;
}

export interface PassiveSummary {
  sentences: number;
  words: number;
  hits: PassiveHit[];
  sentencesWithPassive: number;
  /** 0-1: share of sentences containing at least one candidate. */
  shareOfSentences: number;
  strongCount: number;
  candidateCount: number;
  /** Most affected sentences, most passive hits first. */
  worst: { sentence: string; index: number; hits: number }[];
}

function isParticiple(token: string): boolean {
  const lower = token.toLowerCase();
  if (IRREGULAR_PARTICIPLES.has(lower)) return true;
  if (NON_PARTICIPLE_ED.has(lower)) return false;
  return /^[a-z]{4,}ed$/.test(lower);
}

/** Every passive candidate in the text, in document order. */
export function findPassives(text: string, locale = "en"): PassiveHit[] {
  const hits: PassiveHit[] = [];

  sentenceTokens(text, locale).forEach((sentence, sentenceIndex) => {
    const tokens = wordTokens(sentence.text, locale).map((token) => token.text);
    let index = 0;
    while (index < tokens.length) {
      const auxiliary = tokens[index].toLowerCase();
      if (!BE_FORMS.has(auxiliary)) {
        index += 1;
        continue;
      }

      // Look past common adverbs for the participle.
      let lookahead = index + 1;
      while (lookahead < tokens.length && PASSTHROUGH_ADVERBS.has(tokens[lookahead].toLowerCase())) {
        lookahead += 1;
      }
      if (lookahead >= tokens.length || !isParticiple(tokens[lookahead])) {
        index += 1;
        continue;
      }

      const participle = tokens[lookahead];
      const after = tokens.slice(lookahead + 1, lookahead + 4).map((token) => token.toLowerCase());
      const hasAgent = after.includes("by");

      hits.push({
        index,
        sentenceIndex,
        auxiliary: tokens[index],
        participle,
        confidence: hasAgent ? "strong" : "candidate",
        phrase: `${tokens[index]} ${participle}`,
        sentence: sentence.text.trim(),
      });

      index = lookahead + 1;
    }
  });

  return hits;
}

/** Totals plus the sentences carrying the most passive hits. */
export function passiveSummary(text: string, locale = "en"): PassiveSummary {
  const sentences = sentenceTokens(text, locale);
  const words = wordTokens(text, locale).length;
  const hits = findPassives(text, locale);

  const bySentence = new Map<number, number>();
  for (const hit of hits) bySentence.set(hit.sentenceIndex, (bySentence.get(hit.sentenceIndex) ?? 0) + 1);

  const worst = [...bySentence.entries()]
    .map(([index, count]) => ({ sentence: sentences[index]?.text.trim() ?? "", index, hits: count }))
    .sort((a, b) => b.hits - a.hits || a.index - b.index)
    .slice(0, 5);

  return {
    sentences: sentences.length,
    words,
    hits,
    sentencesWithPassive: bySentence.size,
    shareOfSentences: sentences.length > 0 ? bySentence.size / sentences.length : 0,
    strongCount: hits.filter((hit) => hit.confidence === "strong").length,
    candidateCount: hits.filter((hit) => hit.confidence === "candidate").length,
    worst,
  };
}
