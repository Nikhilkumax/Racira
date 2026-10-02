import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Writing tool components, keyed by registry slug.
 *
 * Each entry is a `next/dynamic` import so a tool ships only in its own route
 * chunk — `/writing/[slug]` never pulls all tools in at once. A slug may only be
 * marked `live` in the domain registry when it has an entry here; the
 * `_scripts/writing-reconcile.mjs` gate (pre-push) fails the build otherwise,
 * which is what keeps a "live" flag from pointing at a 404.
 */
export const WRITING_TOOL_COMPONENTS: Record<string, ComponentType> = {
  // ── B1: counters, timers, Intl and encoding utilities ────────────────────
  "word-count-tool": dynamic(() => import("./word-count-tool")),
  "character-count-tool": dynamic(() => import("./character-count-tool")),
  "reading-time-estimator": dynamic(() => import("./reading-time-estimator")),
  "sentence-count-tool": dynamic(() => import("./sentence-count-tool")),
  "average-word-length-calculator": dynamic(() => import("./average-word-length-calculator")),
  "locale-date-formatter": dynamic(() => import("./locale-date-formatter")),
  "number-locale-formatter": dynamic(() => import("./number-locale-formatter")),
  "rtl-text-tester": dynamic(() => import("./rtl-text-tester")),
  "bidirectional-text-tester": dynamic(() => import("./bidirectional-text-tester")),
  "unicode-text-normalizer": dynamic(() => import("./unicode-text-normalizer")),
  "locale-aware-sort-tool": dynamic(() => import("./locale-aware-sort-tool")),
  "writing-sprint-timer": dynamic(() => import("./writing-sprint-timer")),
  "writing-goal-tracker": dynamic(() => import("./writing-goal-tracker")),
  "flash-fiction-timer": dynamic(() => import("./flash-fiction-timer")),
  "focus-sentence-highlighter": dynamic(() => import("./focus-sentence-highlighter")),
  "footnote-formatter": dynamic(() => import("./footnote-formatter")),
  "number-format-checker": dynamic(() => import("./number-format-checker")),

  // ── B5: text-analysis engine — readability, n-grams, stylometry ──────────
  "readability-grade-scorer": dynamic(() => import("./readability-grade-scorer")),
  "sentence-complexity-analyzer": dynamic(() => import("./sentence-complexity-analyzer")),
  "overused-word-finder": dynamic(() => import("./overused-word-finder")),
  "sentence-variety-checker": dynamic(() => import("./sentence-variety-checker")),
  "clarity-score-tool": dynamic(() => import("./clarity-score-tool")),
  "vocabulary-richness-scorer": dynamic(() => import("./vocabulary-richness-scorer")),
  "keyword-density-analyzer": dynamic(() => import("./keyword-density-analyzer")),
  "flesch-kincaid-score-calculator": dynamic(() => import("./flesch-kincaid-score-calculator")),
  "gunning-fog-index-calculator": dynamic(() => import("./gunning-fog-index-calculator")),
  "smog-index-calculator": dynamic(() => import("./smog-index-calculator")),
  "lexical-diversity-calculator": dynamic(() => import("./lexical-diversity-calculator")),
  "text-fingerprint-analyzer": dynamic(() => import("./text-fingerprint-analyzer")),

  // ── B6: Grammar & Style (mechanical checks, phrases, register) ───────────
  "grammar-checker": dynamic(() => import("./grammar-checker")),
  "passive-voice-detector": dynamic(() => import("./passive-voice-detector")),
  "cliche-detector": dynamic(() => import("./cliche-detector")),
  "redundancy-finder": dynamic(() => import("./redundancy-finder")),
  "wordy-phrase-simplifier": dynamic(() => import("./wordy-phrase-simplifier")),
  "tone-analyzer": dynamic(() => import("./tone-analyzer")),
  "formality-level-detector": dynamic(() => import("./formality-level-detector")),
  "style-guide-adherence-checker": dynamic(() => import("./style-guide-adherence-checker")),
  "academic-writing-tone-checker": dynamic(() => import("./academic-writing-tone-checker")),

  // ── B7: Spelling & Proofreading ─────────────────────────────────────────
  "spell-checker": dynamic(() => import("./spell-checker")),
  "homophone-confusion-detector": dynamic(() => import("./homophone-confusion-detector")),
  "punctuation-checker": dynamic(() => import("./punctuation-checker")),
  "apostrophe-error-finder": dynamic(() => import("./apostrophe-error-finder")),
  "capitalization-checker": dynamic(() => import("./capitalization-checker")),
  "proper-noun-checker": dynamic(() => import("./proper-noun-checker")),
  "consistent-spelling-checker": dynamic(() => import("./consistent-spelling-checker")),

  // ── B7: language tools (detector, codec, expansion) ─────────────────────
  "language-detector": dynamic(() => import("./language-detector")),
  "character-encoding-converter": dynamic(() => import("./character-encoding-converter")),
  "text-expansion-estimator": dynamic(() => import("./text-expansion-estimator")),

  // ── B8: jargon, style consistency and extractive summarisation ──────────
  "jargon-remover": dynamic(() => import("./jargon-remover")),
  "style-consistency-enforcer": dynamic(() => import("./style-consistency-enforcer")),
  "text-summarizer": dynamic(() => import("./text-summarizer")),
  "key-points-extractor": dynamic(() => import("./key-points-extractor")),
  "tldr-generator": dynamic(() => import("./tldr-generator")),

  // ── B9: summarisation family continued, and the citation engine ─────────
  "executive-summary-builder": dynamic(() => import("./executive-summary-builder")),
  "bullet-point-extractor": dynamic(() => import("./bullet-point-extractor")),
  "important-sentence-highlighter": dynamic(() => import("./important-sentence-highlighter")),
  "meeting-summary-formatter": dynamic(() => import("./meeting-summary-formatter")),
  "citation-formatter": dynamic(() => import("./citation-formatter")),

  // ── B10: citation engine continued — reference lists and notes ──────────
  "bibliography-builder": dynamic(() => import("./bibliography-builder")),
  "endnote-manager": dynamic(() => import("./endnote-manager")),
  "reference-list-generator": dynamic(() => import("./reference-list-generator")),
  "in-text-citation-builder": dynamic(() => import("./in-text-citation-builder")),
  "academic-journal-reference-formatter": dynamic(() => import("./academic-journal-reference-formatter")),

  // ── B11: citation leftovers, editors and organisers ─────────────────────
  "legal-citation-formatter": dynamic(() => import("./legal-citation-formatter")),
  "newspaper-article-citation-maker": dynamic(() => import("./newspaper-article-citation-maker")),
  "markdown-editor": dynamic(() => import("./markdown-editor")),
  "outline-builder": dynamic(() => import("./outline-builder")),
  "document-diff-viewer": dynamic(() => import("./document-diff-viewer")),

  // ── B12: story organisers and the manuscript formatter ──────────────────
  "scene-and-chapter-organizer": dynamic(() => import("./scene-and-chapter-organizer")),
  "draft-versioning-tool": dynamic(() => import("./draft-versioning-tool")),
  "plot-point-mapper": dynamic(() => import("./plot-point-mapper")),
  "story-beat-builder": dynamic(() => import("./story-beat-builder")),
  "manuscript-formatter": dynamic(() => import("./manuscript-formatter")),

  // ── B13: creative writing — dialogue, description, forms, characters ────
  "dialogue-practice-tool": dynamic(() => import("./dialogue-practice-tool")),
  "scene-description-builder": dynamic(() => import("./scene-description-builder")),
  "poetry-form-guide": dynamic(() => import("./poetry-form-guide")),
  "character-profile-builder": dynamic(() => import("./character-profile-builder")),
  "conflict-and-resolution-planner": dynamic(() => import("./conflict-and-resolution-planner")),

  // ── B14: specialized and academic — argument, thesis, survey, review ────
  "logical-fallacy-detector": dynamic(() => import("./logical-fallacy-detector")),
  "thesis-statement-builder": dynamic(() => import("./thesis-statement-builder")),
  "argument-mapping-tool": dynamic(() => import("./argument-mapping-tool")),
  "survey-question-builder": dynamic(() => import("./survey-question-builder")),
  "peer-review-checklist": dynamic(() => import("./peer-review-checklist")),

  // ── B15: templates and generators — letters, resumes, bios, releases ────
  "cover-letter-builder": dynamic(() => import("./cover-letter-builder")),
  "resume-writer": dynamic(() => import("./resume-writer")),
  "bio-generator": dynamic(() => import("./bio-generator")),
  "author-profile-writer": dynamic(() => import("./author-profile-writer")),
  "press-release-template": dynamic(() => import("./press-release-template")),

  // ── B16: templates and generators — outlines, issues, emails, proposals ─
  "blog-post-outline-builder": dynamic(() => import("./blog-post-outline-builder")),
  "newsletter-template-builder": dynamic(() => import("./newsletter-template-builder")),
  "email-template-library": dynamic(() => import("./email-template-library")),
  "proposal-template": dynamic(() => import("./proposal-template")),
  "faq-generator": dynamic(() => import("./faq-generator")),

  // ── B17: content and marketing — headlines, CTAs, taglines, subject lines ─
  "headline-analyzer": dynamic(() => import("./headline-analyzer")),
  "cta-button-copy-generator": dynamic(() => import("./cta-button-copy-generator")),
  "tagline-generator": dynamic(() => import("./tagline-generator")),
  "email-subject-line-tester": dynamic(() => import("./email-subject-line-tester")),
  "value-proposition-builder": dynamic(() => import("./value-proposition-builder")),

  // ── B18: content and marketing — landing pages, ads, social, launches ──
  "landing-page-copy-builder": dynamic(() => import("./landing-page-copy-builder")),
  "ad-copy-framework-builder": dynamic(() => import("./ad-copy-framework-builder")),
  "social-post-caption-builder": dynamic(() => import("./social-post-caption-builder")),
  "product-launch-copy-builder": dynamic(() => import("./product-launch-copy-builder")),
  "case-study-template": dynamic(() => import("./case-study-template")),

  // ── B19: creative writing — ideas, worlds, prompts, villains, openings ──
  "story-idea-generator": dynamic(() => import("./story-idea-generator")),
  "world-building-template": dynamic(() => import("./world-building-template")),
  "writing-prompt-generator": dynamic(() => import("./writing-prompt-generator")),
  "villain-motivation-builder": dynamic(() => import("./villain-motivation-builder")),
  "first-line-generator": dynamic(() => import("./first-line-generator")),

  // ── B20: paraphrasing and rewriting — sentence moves, simplification ──────
  "sentence-rewriter": dynamic(() => import("./sentence-rewriter")),
  "simplify-text-tool": dynamic(() => import("./simplify-text-tool")),
  "formality-adjuster": dynamic(() => import("./formality-adjuster")),
  "technical-to-plain-language-converter": dynamic(() => import("./technical-to-plain-language-converter")),
  "active-voice-converter": dynamic(() => import("./active-voice-converter")),

  // ── B21: paraphrasing and rewriting — headlines, compression, letters ────
  "headline-rewriter": dynamic(() => import("./headline-rewriter")),
  "paragraph-compressor": dynamic(() => import("./paragraph-compressor")),
  "email-to-formal-letter-converter": dynamic(() => import("./email-to-formal-letter")),
  "bullet-to-prose-converter": dynamic(() => import("./bullet-to-prose")),
  "abstract-generator": dynamic(() => import("./abstract-generator")),

  // ── B22: specialized and academic — abstracts, reviews, plans, reports ──
  "scientific-abstract-builder": dynamic(() => import("./scientific-abstract-builder")),
  "literature-review-organizer": dynamic(() => import("./literature-review-organizer")),
  "academic-paper-section-planner": dynamic(() => import("./academic-paper-section-planner")),
  "grant-proposal-outline": dynamic(() => import("./grant-proposal-outline")),
  "technical-report-template": dynamic(() => import("./technical-report-template")),

  // ── B23: specialized and academic — argument, debate, consent, prep ─────
  "counterargument-generator": dynamic(() => import("./counterargument-generator")),
  "debate-script-formatter": dynamic(() => import("./debate-script-formatter")),
  "irb-consent-form-template": dynamic(() => import("./irb-consent-form-template")),
  "plagiarism-self-check-prep-tool": dynamic(() => import("./plagiarism-self-check-prep-tool")),
  "writing-portfolio-builder": dynamic(() => import("./writing-portfolio-builder")),

  // ── Pre-existing tool wired into this map ───────────────────────────────
  "distraction-free-writing-editor": dynamic(() => import("./DistractionFreeEditor")),
};
