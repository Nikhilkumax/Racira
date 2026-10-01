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

  // ── Pre-existing tool wired into this map ───────────────────────────────
  "distraction-free-writing-editor": dynamic(() => import("./DistractionFreeEditor")),
};
