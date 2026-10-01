/**
 * Shared text layer for the Writing domain.
 *
 * Tool components import engines from here (or from the individual module) —
 * never from another tool's component. Each module is pure, synchronous and
 * dependency-free so it can be unit-tested under `node --test` and reused by
 * later batches.
 */
export * from "./tokenize.ts";
export * from "./stats.ts";
export * from "./unicode.ts";
export * from "./intl.ts";
export * from "./number-format.ts";
export * from "./footnote.ts";
export * from "./stopwords.ts";
export * from "./syllables.ts";
export * from "./readability.ts";
export * from "./ngrams.ts";
export * from "./sentence-metrics.ts";
export * from "./stylometry.ts";
export * from "./clarity.ts";
export * from "./lexicons.ts";
export * from "./phrases.ts";
export * from "./passive.ts";
export * from "./grammar.ts";
export * from "./register.ts";
export * from "./style-guide.ts";
export * from "./code-likeness.ts";
export * from "./spell.ts";
export * from "./homophones.ts";
export * from "./punctuation.ts";
export * from "./apostrophes.ts";
export * from "./proper-nouns.ts";
export * from "./capitalization.ts";
export * from "./spelling-variants.ts";
export * from "./language.ts";
export * from "./encoding.ts";
export * from "./text-expansion.ts";
export * from "./jargon.ts";
export * from "./style-consistency.ts";
export * from "./summarize.ts";
export * from "./meeting-notes.ts";
export * from "./bullet-points.ts";
export * from "./citation.ts";
export * from "./reference-list.ts";
