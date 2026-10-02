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
export * from "./legal-citation.ts";
export * from "./newspaper-citation.ts";
export * from "./markdown.ts";
export * from "./outline.ts";
export * from "./doc-diff.ts";
export * from "./scene-organizer.ts";
export * from "./story-structure.ts";
export * from "./plot-point-mapper.ts";
export * from "./story-beats.ts";
export * from "./draft-versions.ts";
export * from "./manuscript.ts";
export * from "./dialogue.ts";
export * from "./scene-description.ts";
export * from "./poetry-form.ts";
export * from "./character-profile.ts";
export * from "./conflict-planner.ts";
export * from "./fallacy.ts";
export * from "./thesis.ts";
export * from "./argument-map.ts";
export * from "./survey-question.ts";
export * from "./peer-review.ts";
export * from "./cover-letter.ts";
export * from "./resume.ts";
export * from "./bio.ts";
export * from "./author-profile.ts";
export * from "./press-release.ts";
export * from "./blog-outline.ts";
export * from "./newsletter.ts";
export * from "./email-templates.ts";
export * from "./proposal.ts";
export * from "./faq.ts";
export * from "./headline.ts";
export * from "./cta-copy.ts";
export * from "./tagline.ts";
export * from "./subject-line.ts";
export * from "./value-prop.ts";
