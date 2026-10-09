import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { allTools } from "@/domains/writing/registry";
import { getToolSeo } from "@/domains/writing/registry/tool-seo";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { inferIcon } from "@/components/shared/icon-map";

/**
 * Curated related picks, keyed by tool slug.
 *
 * Same pattern as the colors and typography domains' related-tools rows,
 * adapted to this registry: every pick is live, never the current tool, and
 * four per row. Each SEO content batch fills in the entries for its own tools;
 * any tool without an entry falls back to same-category live tools ranked by
 * real similarity (see `functionalScore`) rather than raw registry order.
 */
const CURATED_RELATED: Record<string, string[]> = {
  "spell-checker": [
    "homophone-confusion-detector",
    "consistent-spelling-checker",
    "punctuation-checker",
    "grammar-checker",
  ],
  "homophone-confusion-detector": [
    "spell-checker",
    "apostrophe-error-finder",
    "punctuation-checker",
    "grammar-checker",
  ],
  "punctuation-checker": [
    "apostrophe-error-finder",
    "capitalization-checker",
    "grammar-checker",
    "spell-checker",
  ],
  "apostrophe-error-finder": [
    "homophone-confusion-detector",
    "punctuation-checker",
    "capitalization-checker",
    "spell-checker",
  ],
  "capitalization-checker": [
    "proper-noun-checker",
    "punctuation-checker",
    "apostrophe-error-finder",
    "spell-checker",
  ],
  "proper-noun-checker": [
    "capitalization-checker",
    "consistent-spelling-checker",
    "spell-checker",
    "number-format-checker",
  ],
  "number-format-checker": [
    "number-locale-formatter",
    "locale-date-formatter",
    "consistent-spelling-checker",
    "locale-aware-sort-tool",
  ],
  "consistent-spelling-checker": [
    "spell-checker",
    "proper-noun-checker",
    "number-format-checker",
    "capitalization-checker",
  ],
  "text-summarizer": [
    "tldr-generator",
    "key-points-extractor",
    "important-sentence-highlighter",
    "executive-summary-builder",
  ],
  "key-points-extractor": [
    "text-summarizer",
    "bullet-point-extractor",
    "tldr-generator",
    "important-sentence-highlighter",
  ],
  "tldr-generator": [
    "text-summarizer",
    "executive-summary-builder",
    "key-points-extractor",
    "important-sentence-highlighter",
  ],
  "executive-summary-builder": [
    "text-summarizer",
    "meeting-summary-formatter",
    "key-points-extractor",
    "tldr-generator",
  ],
  "bullet-point-extractor": [
    "text-summarizer",
    "key-points-extractor",
    "bullet-to-prose-converter",
    "outline-builder",
  ],
  "important-sentence-highlighter": [
    "text-summarizer",
    "focus-sentence-highlighter",
    "key-points-extractor",
    "tldr-generator",
  ],
  "abstract-generator": [
    "scientific-abstract-builder",
    "executive-summary-builder",
    "academic-writing-tone-checker",
    "text-summarizer",
  ],
  "meeting-summary-formatter": [
    "key-points-extractor",
    "executive-summary-builder",
    "text-summarizer",
    "bullet-point-extractor",
  ],
  "citation-formatter": [
    "bibliography-builder",
    "in-text-citation-builder",
    "legal-citation-formatter",
    "reference-list-generator",
  ],
  "bibliography-builder": [
    "citation-formatter",
    "reference-list-generator",
    "endnote-manager",
    "in-text-citation-builder",
  ],
  "footnote-formatter": [
    "endnote-manager",
    "citation-formatter",
    "reference-list-generator",
    "in-text-citation-builder",
  ],
  "endnote-manager": [
    "footnote-formatter",
    "bibliography-builder",
    "citation-formatter",
    "reference-list-generator",
  ],
  "reference-list-generator": [
    "bibliography-builder",
    "in-text-citation-builder",
    "citation-formatter",
    "endnote-manager",
  ],
  "in-text-citation-builder": [
    "citation-formatter",
    "reference-list-generator",
    "academic-journal-reference-formatter",
    "legal-citation-formatter",
  ],
  "academic-journal-reference-formatter": [
    "citation-formatter",
    "reference-list-generator",
    "in-text-citation-builder",
    "bibliography-builder",
  ],
  "legal-citation-formatter": [
    "citation-formatter",
    "in-text-citation-builder",
    "endnote-manager",
    "footnote-formatter",
  ],
  "newspaper-article-citation-maker": [
    "academic-journal-reference-formatter",
    "citation-formatter",
    "in-text-citation-builder",
    "reference-list-generator",
  ],
  "language-detector": [
    "rtl-text-tester",
    "bidirectional-text-tester",
    "locale-aware-sort-tool",
    "text-expansion-estimator",
  ],
  "locale-date-formatter": [
    "number-locale-formatter",
    "locale-aware-sort-tool",
    "number-format-checker",
    "language-detector",
  ],
  "number-locale-formatter": [
    "number-format-checker",
    "locale-date-formatter",
    "locale-aware-sort-tool",
    "language-detector",
  ],
  "rtl-text-tester": [
    "bidirectional-text-tester",
    "unicode-text-normalizer",
    "language-detector",
    "character-encoding-converter",
  ],
  "unicode-text-normalizer": [
    "character-encoding-converter",
    "rtl-text-tester",
    "bidirectional-text-tester",
    "locale-aware-sort-tool",
  ],
  "character-encoding-converter": [
    "unicode-text-normalizer",
    "rtl-text-tester",
    "bidirectional-text-tester",
    "locale-aware-sort-tool",
  ],
  "bidirectional-text-tester": [
    "rtl-text-tester",
    "unicode-text-normalizer",
    "character-encoding-converter",
    "language-detector",
  ],
  "locale-aware-sort-tool": [
    "locale-date-formatter",
    "number-locale-formatter",
    "unicode-text-normalizer",
    "language-detector",
  ],
  "text-expansion-estimator": [
    "language-detector",
    "number-locale-formatter",
    "locale-date-formatter",
    "consistent-spelling-checker",
  ],
  "sentence-rewriter": [
    "simplify-text-tool",
    "paragraph-compressor",
    "active-voice-converter",
    "sentence-variety-checker",
  ],
  "simplify-text-tool": [
    "sentence-rewriter",
    "paragraph-compressor",
    "jargon-remover",
    "wordy-phrase-simplifier",
  ],
  "formality-adjuster": [
    "academic-writing-tone-checker",
    "tone-analyzer",
    "jargon-remover",
    "formality-level-detector",
  ],
  "technical-to-plain-language-converter": [
    "jargon-remover",
    "simplify-text-tool",
    "formality-adjuster",
    "paragraph-compressor",
  ],
  "active-voice-converter": [
    "sentence-rewriter",
    "paragraph-compressor",
    "passive-voice-detector",
    "simplify-text-tool",
  ],
  "headline-rewriter": [
    "headline-analyzer",
    "email-subject-line-tester",
    "landing-page-copy-builder",
    "tagline-generator",
  ],
  "paragraph-compressor": [
    "simplify-text-tool",
    "sentence-rewriter",
    "jargon-remover",
    "redundancy-finder",
  ],
  "email-to-formal-letter-converter": [
    "formality-adjuster",
    "jargon-remover",
    "proposal-template",
    "cover-letter-builder",
  ],
  "jargon-remover": [
    "technical-to-plain-language-converter",
    "simplify-text-tool",
    "formality-adjuster",
    "paragraph-compressor",
  ],
  "bullet-to-prose-converter": [
    "bullet-point-extractor",
    "paragraph-compressor",
    "sentence-rewriter",
    "outline-builder",
  ],
  "word-count-tool": [
    "character-count-tool",
    "reading-time-estimator",
    "sentence-count-tool",
    "keyword-density-analyzer",
  ],
  "character-count-tool": [
    "word-count-tool",
    "reading-time-estimator",
    "keyword-density-analyzer",
    "average-word-length-calculator",
  ],
  "reading-time-estimator": [
    "word-count-tool",
    "sentence-count-tool",
    "average-word-length-calculator",
    "character-count-tool",
  ],
  "sentence-count-tool": [
    "word-count-tool",
    "reading-time-estimator",
    "average-word-length-calculator",
    "vocabulary-richness-scorer",
  ],
  "average-word-length-calculator": [
    "sentence-count-tool",
    "reading-time-estimator",
    "vocabulary-richness-scorer",
    "lexical-diversity-calculator",
  ],
  "vocabulary-richness-scorer": [
    "lexical-diversity-calculator",
    "average-word-length-calculator",
    "word-count-tool",
    "text-fingerprint-analyzer",
  ],
  "keyword-density-analyzer": [
    "word-count-tool",
    "character-count-tool",
    "lexical-diversity-calculator",
    "vocabulary-richness-scorer",
  ],
  "flesch-kincaid-score-calculator": [
    "gunning-fog-index-calculator",
    "smog-index-calculator",
    "average-word-length-calculator",
    "sentence-count-tool",
  ],
  "gunning-fog-index-calculator": [
    "flesch-kincaid-score-calculator",
    "smog-index-calculator",
    "average-word-length-calculator",
    "sentence-count-tool",
  ],
  "smog-index-calculator": [
    "flesch-kincaid-score-calculator",
    "gunning-fog-index-calculator",
    "sentence-count-tool",
    "average-word-length-calculator",
  ],
  "lexical-diversity-calculator": [
    "vocabulary-richness-scorer",
    "text-fingerprint-analyzer",
    "average-word-length-calculator",
    "word-count-tool",
  ],
  "text-fingerprint-analyzer": [
    "lexical-diversity-calculator",
    "vocabulary-richness-scorer",
    "keyword-density-analyzer",
    "word-count-tool",
  ],
  "grammar-checker": [
    "passive-voice-detector",
    "spell-checker",
    "sentence-complexity-analyzer",
    "punctuation-checker",
  ],
  "passive-voice-detector": [
    "grammar-checker",
    "sentence-complexity-analyzer",
    "clarity-score-tool",
    "readability-grade-scorer",
  ],
  "readability-grade-scorer": [
    "flesch-kincaid-score-calculator",
    "gunning-fog-index-calculator",
    "smog-index-calculator",
    "clarity-score-tool",
  ],
  "sentence-complexity-analyzer": [
    "sentence-variety-checker",
    "sentence-count-tool",
    "clarity-score-tool",
    "readability-grade-scorer",
  ],
  "overused-word-finder": [
    "word-count-tool",
    "keyword-density-analyzer",
    "vocabulary-richness-scorer",
    "redundancy-finder",
  ],
  "cliche-detector": [
    "wordy-phrase-simplifier",
    "redundancy-finder",
    "jargon-remover",
    "simplify-text-tool",
  ],
  "redundancy-finder": [
    "wordy-phrase-simplifier",
    "cliche-detector",
    "jargon-remover",
    "simplify-text-tool",
  ],
  "wordy-phrase-simplifier": [
    "redundancy-finder",
    "cliche-detector",
    "simplify-text-tool",
    "jargon-remover",
  ],
  "sentence-variety-checker": [
    "sentence-complexity-analyzer",
    "sentence-count-tool",
    "readability-grade-scorer",
    "clarity-score-tool",
  ],
  "tone-analyzer": [
    "formality-level-detector",
    "academic-writing-tone-checker",
    "clarity-score-tool",
    "style-guide-adherence-checker",
  ],
  "formality-level-detector": [
    "tone-analyzer",
    "academic-writing-tone-checker",
    "formality-adjuster",
    "style-guide-adherence-checker",
  ],
  "clarity-score-tool": [
    "readability-grade-scorer",
    "sentence-complexity-analyzer",
    "simplify-text-tool",
    "sentence-variety-checker",
  ],
  "style-guide-adherence-checker": [
    "punctuation-checker",
    "number-format-checker",
    "manuscript-formatter",
    "academic-writing-tone-checker",
  ],
  "academic-writing-tone-checker": [
    "academic-journal-reference-formatter",
    "formality-level-detector",
    "tone-analyzer",
    "style-guide-adherence-checker",
  ],
  "distraction-free-writing-editor": [
    "writing-goal-tracker",
    "writing-sprint-timer",
    "markdown-editor",
    "focus-sentence-highlighter",
  ],
  "markdown-editor": [
    "rich-text-editor",
    "block-based-editor",
    "outline-builder",
    "distraction-free-writing-editor",
  ],
  "rich-text-editor": [
    "markdown-editor",
    "block-based-editor",
    "manuscript-formatter",
    "distraction-free-writing-editor",
  ],
  "outline-builder": [
    "markdown-editor",
    "plot-point-mapper",
    "scene-and-chapter-organizer",
    "block-based-editor",
  ],
  "draft-versioning-tool": [
    "document-diff-viewer",
    "writing-goal-tracker",
    "distraction-free-writing-editor",
    "writing-sprint-timer",
  ],
  "writing-sprint-timer": [
    "writing-goal-tracker",
    "distraction-free-writing-editor",
    "word-count-tool",
    "reading-time-estimator",
  ],
  "scene-and-chapter-organizer": [
    "plot-point-mapper",
    "story-beat-builder",
    "outline-builder",
    "writing-goal-tracker",
  ],
  "plot-point-mapper": [
    "story-beat-builder",
    "scene-and-chapter-organizer",
    "outline-builder",
    "distraction-free-writing-editor",
  ],
  "story-beat-builder": [
    "plot-point-mapper",
    "scene-and-chapter-organizer",
    "outline-builder",
    "writing-goal-tracker",
  ],
  "manuscript-formatter": [
    "style-guide-adherence-checker",
    "document-diff-viewer",
    "markdown-editor",
    "rich-text-editor",
  ],
  "document-diff-viewer": [
    "draft-versioning-tool",
    "manuscript-formatter",
    "markdown-editor",
    "rich-text-editor",
  ],
  "writing-goal-tracker": [
    "writing-sprint-timer",
    "distraction-free-writing-editor",
    "word-count-tool",
    "reading-time-estimator",
  ],
  "block-based-editor": [
    "markdown-editor",
    "rich-text-editor",
    "outline-builder",
    "distraction-free-writing-editor",
  ],
  "focus-sentence-highlighter": [
    "sentence-count-tool",
    "sentence-complexity-analyzer",
    "word-count-tool",
    "reading-time-estimator",
  ],
  "story-idea-generator": [
    "plot-structure-planner",
    "genre-blender-idea-tool",
    "world-building-template",
    "first-line-generator",
  ],
  "character-profile-builder": [
    "villain-motivation-builder",
    "conflict-and-resolution-planner",
    "dialogue-practice-tool",
    "plot-structure-planner",
  ],
  "world-building-template": [
    "story-idea-generator",
    "scene-description-builder",
    "character-profile-builder",
    "plot-structure-planner",
  ],
  "plot-structure-planner": [
    "story-beat-builder",
    "plot-point-mapper",
    "story-idea-generator",
    "conflict-and-resolution-planner",
  ],
  "dialogue-practice-tool": [
    "scene-description-builder",
    "character-profile-builder",
    "conflict-and-resolution-planner",
    "writing-prompt-generator",
  ],
  "writing-prompt-generator": [
    "story-idea-generator",
    "first-line-generator",
    "flash-fiction-timer",
    "poetry-form-guide",
  ],
  "poetry-form-guide": [
    "flash-fiction-timer",
    "writing-prompt-generator",
    "word-count-tool",
    "sentence-count-tool",
  ],
  "flash-fiction-timer": [
    "writing-sprint-timer",
    "writing-prompt-generator",
    "poetry-form-guide",
    "word-count-tool",
  ],
  "scene-description-builder": [
    "dialogue-practice-tool",
    "world-building-template",
    "writing-prompt-generator",
    "character-profile-builder",
  ],
  "conflict-and-resolution-planner": [
    "plot-structure-planner",
    "villain-motivation-builder",
    "character-profile-builder",
    "story-idea-generator",
  ],
  "villain-motivation-builder": [
    "character-profile-builder",
    "conflict-and-resolution-planner",
    "story-idea-generator",
    "plot-structure-planner",
  ],
  "genre-blender-idea-tool": [
    "story-idea-generator",
    "first-line-generator",
    "writing-prompt-generator",
    "world-building-template",
  ],
  "first-line-generator": [
    "ending-generator",
    "story-idea-generator",
    "writing-prompt-generator",
    "genre-blender-idea-tool",
  ],
  "ending-generator": [
    "first-line-generator",
    "plot-structure-planner",
    "conflict-and-resolution-planner",
    "story-idea-generator",
  ],
  "headline-analyzer": [
    "email-subject-line-tester",
    "headline-rewriter",
    "cta-button-copy-generator",
    "landing-page-copy-builder",
  ],
  "cta-button-copy-generator": [
    "landing-page-copy-builder",
    "value-proposition-builder",
    "headline-analyzer",
    "product-launch-copy-builder",
  ],
  "landing-page-copy-builder": [
    "headline-analyzer",
    "cta-button-copy-generator",
    "value-proposition-builder",
    "sales-page-copywriting-tool",
  ],
  "value-proposition-builder": [
    "landing-page-copy-builder",
    "tagline-generator",
    "cta-button-copy-generator",
    "brand-voice-guide-builder",
  ],
  "tagline-generator": [
    "value-proposition-builder",
    "brand-voice-guide-builder",
    "headline-analyzer",
    "product-launch-copy-builder",
  ],
  "social-post-caption-builder": [
    "headline-analyzer",
    "email-subject-line-tester",
    "cta-button-copy-generator",
    "product-launch-copy-builder",
  ],
  "email-subject-line-tester": [
    "headline-analyzer",
    "headline-rewriter",
    "social-post-caption-builder",
    "product-launch-copy-builder",
  ],
  "ad-copy-framework-builder": [
    "cta-button-copy-generator",
    "headline-analyzer",
    "value-proposition-builder",
    "sales-page-copywriting-tool",
  ],
  "sales-page-copywriting-tool": [
    "landing-page-copy-builder",
    "case-study-template",
    "testimonial-formatter",
    "value-proposition-builder",
  ],
  "product-launch-copy-builder": [
    "landing-page-copy-builder",
    "cta-button-copy-generator",
    "email-subject-line-tester",
    "social-post-caption-builder",
  ],
  "testimonial-formatter": [
    "case-study-template",
    "sales-page-copywriting-tool",
    "landing-page-copy-builder",
    "brand-voice-guide-builder",
  ],
  "case-study-template": [
    "testimonial-formatter",
    "sales-page-copywriting-tool",
    "landing-page-copy-builder",
    "value-proposition-builder",
  ],
  "brand-voice-guide-builder": [
    "tagline-generator",
    "microcopy-library",
    "value-proposition-builder",
    "landing-page-copy-builder",
  ],
  "microcopy-library": [
    "brand-voice-guide-builder",
    "cta-button-copy-generator",
    "social-post-caption-builder",
    "product-launch-copy-builder",
  ],
  "thesis-statement-builder": [
    "argument-mapping-tool",
    "counterargument-generator",
    "outline-builder",
    "academic-writing-tone-checker",
  ],
  "argument-mapping-tool": [
    "logical-fallacy-detector",
    "counterargument-generator",
    "thesis-statement-builder",
    "clarity-score-tool",
  ],
  "counterargument-generator": [
    "argument-mapping-tool",
    "debate-script-formatter",
    "thesis-statement-builder",
    "logical-fallacy-detector",
  ],
  "logical-fallacy-detector": [
    "counterargument-generator",
    "argument-mapping-tool",
    "tone-analyzer",
    "clarity-score-tool",
  ],
  "debate-script-formatter": [
    "counterargument-generator",
    "logical-fallacy-detector",
    "argument-mapping-tool",
    "thesis-statement-builder",
  ],
  "scientific-abstract-builder": [
    "text-summarizer",
    "key-points-extractor",
    "academic-writing-tone-checker",
    "word-count-tool",
  ],
  "irb-consent-form-template": [
    "survey-question-builder",
    "readability-grade-scorer",
    "peer-review-checklist",
    "tone-analyzer",
  ],
  "survey-question-builder": [
    "readability-grade-scorer",
    "irb-consent-form-template",
    "meeting-summary-formatter",
    "tone-analyzer",
  ],
  "literature-review-organizer": [
    "key-points-extractor",
    "text-summarizer",
    "thesis-statement-builder",
    "academic-writing-tone-checker",
  ],
  "academic-paper-section-planner": [
    "word-count-tool",
    "reading-time-estimator",
    "outline-builder",
    "paragraph-compressor",
  ],
  "peer-review-checklist": [
    "readability-grade-scorer",
    "clarity-score-tool",
    "scientific-abstract-builder",
    "academic-writing-tone-checker",
  ],
  "grant-proposal-outline": [
    "executive-summary-builder",
    "key-points-extractor",
    "meeting-summary-formatter",
    "word-count-tool",
  ],
  "technical-report-template": [
    "executive-summary-builder",
    "jargon-remover",
    "word-count-tool",
    "paragraph-compressor",
  ],
  "style-consistency-enforcer": [
    "style-guide-adherence-checker",
    "manuscript-formatter",
    "punctuation-checker",
    "redundancy-finder",
  ],
  "plagiarism-self-check-prep-tool": [
    "citation-formatter",
    "bibliography-builder",
    "reference-list-generator",
    "tone-analyzer",
  ],
  "writing-portfolio-builder": [
    "manuscript-formatter",
    "reading-time-estimator",
    "text-summarizer",
    "word-count-tool",
  ],
};

const MAX_RELATED = 4;

/**
 * Shared engine modules per tool, derived once from the components' imports of
 * `@/domains/writing/lib/` (only modules used by two or more tools are kept).
 * Two tools backed by the same engine module are functionally close even when
 * their names do not overlap — the counter family, the readability family, the
 * citation family and the summariser family all show up here.
 */
const SHARED_ENGINE: Record<string, string[]> = {
  "word-count-tool": ["text/stats", "text/tokenize"],
  "character-count-tool": ["text/stats"],
  "reading-time-estimator": ["text/stats"],
  "sentence-count-tool": ["text/tokenize"],
  "average-word-length-calculator": ["text/stats", "text/tokenize"],
  "locale-date-formatter": ["text/intl"],
  "number-locale-formatter": ["text/intl", "text/number-format"],
  "rtl-text-tester": ["text/unicode"],
  "bidirectional-text-tester": ["text/unicode"],
  "unicode-text-normalizer": ["text/unicode"],
  "locale-aware-sort-tool": ["text/intl"],
  "writing-sprint-timer": ["text/tokenize"],
  "writing-goal-tracker": ["text/tokenize"],
  "flash-fiction-timer": ["text/tokenize"],
  "focus-sentence-highlighter": ["text/stats", "text/tokenize"],
  "number-format-checker": ["text/number-format"],
  "readability-grade-scorer": ["text/readability", "text/stats"],
  "sentence-complexity-analyzer": ["text/sentence-metrics"],
  "overused-word-finder": ["text/ngrams"],
  "sentence-variety-checker": ["text/sentence-metrics"],
  "clarity-score-tool": ["text/readability"],
  "vocabulary-richness-scorer": ["text/ngrams", "text/stylometry"],
  "keyword-density-analyzer": ["text/ngrams"],
  "flesch-kincaid-score-calculator": ["text/readability"],
  "gunning-fog-index-calculator": ["text/readability", "text/tokenize"],
  "smog-index-calculator": ["text/readability"],
  "lexical-diversity-calculator": ["text/ngrams", "text/stylometry"],
  "text-fingerprint-analyzer": ["text/stylometry"],
  "cliche-detector": ["text/phrases"],
  "redundancy-finder": ["text/phrases"],
  "wordy-phrase-simplifier": ["text/phrases"],
  "tone-analyzer": ["text/register"],
  "formality-level-detector": ["text/register"],
  "academic-writing-tone-checker": ["text/register"],
  "text-summarizer": ["text/summarize"],
  "key-points-extractor": ["text/summarize"],
  "tldr-generator": ["text/summarize"],
  "executive-summary-builder": ["text/summarize"],
  "important-sentence-highlighter": ["text/summarize"],
  "citation-formatter": ["text/citation"],
  "bibliography-builder": ["text/citation", "text/reference-list"],
  "endnote-manager": ["text/citation", "text/reference-list"],
  "reference-list-generator": ["text/citation", "text/reference-list"],
  "in-text-citation-builder": ["text/citation", "text/reference-list"],
  "academic-journal-reference-formatter": ["text/citation"],
  "legal-citation-formatter": ["text/citation"],
  "newspaper-article-citation-maker": ["text/citation"],
  "plot-point-mapper": ["text/story-structure"],
  "story-beat-builder": ["text/story-structure"],
  "plot-structure-planner": ["text/story-structure"],
};

const STOP_WORDS = new Set([
  "and", "the", "for", "with", "your", "you", "its", "from", "any", "own",
  "into", "out", "get", "see", "use", "test", "tests", "tool", "tools",
  "text", "write", "writing", "writer", "online", "free",
]);

const tokens = (text: string): Set<string> =>
  new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );

interface Candidate {
  slug: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  status: "live" | "soon";
  category: string;
  words: Set<string>;
  engines: Set<string>;
}

/**
 * Keyword/token profile. The authored SEO keywords join the name and
 * description, so two tools that describe the same job in different words still
 * rank together.
 */
const ALL_TOOLS: Candidate[] = allTools.map((tool) => {
  const keywords = getToolSeo(tool.slug)?.keywords ?? [];
  return {
    slug: tool.slug,
    name: tool.name,
    desc: tool.description,
    icon: tool.icon as LucideIcon,
    status: tool.status as "live" | "soon",
    category: (tool as typeof tool & { category: string }).category,
    words: tokens([tool.name, tool.description, ...keywords].join(" ")),
    engines: new Set(SHARED_ENGINE[tool.slug] ?? []),
  };
});

function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared++;
  return shared / (a.size + b.size - shared);
}

/** A shared library engine counts as much as a perfect keyword overlap. */
function functionalScore(current: Candidate, candidate: Candidate): number {
  const sameEngine = [...current.engines].some((e) => candidate.engines.has(e)) ? 1 : 0;
  return sameEngine * 2 + overlap(current.words, candidate.words);
}

/** Same-category live tools, best functional match first, registry order on ties. */
function rankedSameCategory(
  current: Candidate | undefined,
  category: string,
  taken: Set<string>,
): Candidate[] {
  const candidates = ALL_TOOLS.filter(
    (tool) =>
      tool.category === category &&
      isLiveTool(tool, "writing") &&
      !taken.has(tool.slug),
  );
  if (!current) return candidates;
  return candidates
    .map((tool, index) => ({ tool, index, score: functionalScore(current, tool) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.tool);
}

interface RelatedToolsProps {
  currentSlug: string;
  category: string;
}

/**
 * "You Might Also Need" row — four related tools, placed under the tool UI and
 * above the SEO block. Every pick is live, never the current tool, and the card
 * markup mirrors the category grid's (the writing category pages render their
 * cards inline too, so no client ToolCard crosses the server boundary here).
 */
export function RelatedTools({ currentSlug, category }: RelatedToolsProps) {
  const current = ALL_TOOLS.find((tool) => tool.slug === currentSlug);

  const curated = (CURATED_RELATED[currentSlug] ?? [])
    .map((slug) => ALL_TOOLS.find((tool) => tool.slug === slug))
    .filter(
      (tool): tool is Candidate =>
        tool !== undefined && tool.slug !== currentSlug && isLiveTool(tool, "writing"),
    );

  const pool =
    curated.length >= MAX_RELATED
      ? curated
      : [
          ...curated,
          ...rankedSameCategory(
            current,
            category,
            new Set([currentSlug, ...curated.map((c) => c.slug)]),
          ),
        ];

  const related = pool.slice(0, MAX_RELATED);
  if (related.length === 0) return null;

  return (
    <section className="mt-10" data-related-tools="writing">
      <h2 className="text-lg font-bold text-foreground mb-4">You Might Also Need</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((tool) => {
          const Icon = tool.icon || inferIcon(tool.name, tool.slug);
          return (
            <Link
              key={tool.slug}
              href={`/writing/${tool.slug}`}
              className="tool-card group hover:-translate-y-[3px]"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
