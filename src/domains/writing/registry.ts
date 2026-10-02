import { Activity, AlarmClockCheck, AlertOctagon, AlignCenter, AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, AlignHorizontalDistributeStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignHorizontalSpaceAround, AlignHorizontalSpaceBetween, AlignJustify, AlignLeft, AlignRight, AlignStartHorizontal, AreaChart, BadgeJapaneseYen, BarChart, BarChart2, BarChart3, Book, BookA, BookOpen, BookOpenCheck, BookOpenText, BookText, Brain, Calculator, CircleGauge, Clipboard, ClipboardCheck, ClipboardCopy, ClipboardEdit, ClipboardList, ClipboardMinus, ClipboardPaste, ClipboardPen, ClipboardPenLine, ClipboardPlus, ClipboardSignature, ClipboardType, ClipboardX, CreditCard, Edit, Edit2, Edit3, Eye, FileCode, FileCode2, FileEdit, FileText, FlaskConical, FlaskConicalOff, FolderEdit, Gauge, GaugeCircle, Globe, Globe2, GlobeLock, Layout, LayoutDashboard, LayoutGrid, LayoutList, LayoutPanelLeft, LayoutPanelTop, LayoutTemplate, LetterText, List, ListCheck, ListChecks, Mail, MailCheck, Megaphone, MegaphoneOff, MessageSquareQuote, MessageSquareText, NotebookText, NotepadText, NotepadTextDashed, Quote, ReceiptText, ScanText, ScrollText, Sparkles, SpellCheck, SpellCheck2, Text, TextCursor, TextCursorInput, TextQuote, TextSearch, TextSelect, TextSelection, TrendingDown, TrendingUp, Wand, Wand2, WandSparkles, WrapText } from "lucide-react";
export type Tool = {
  name: string;
  slug: string;
  description: string;
  status?: "live" | "soon";
  icon?: any;
  /**
   * Authored editorial SEO block, resolved per slug by
   * `src/domains/writing/registry/tool-seo.ts` and attached on the server page.
   * It is deliberately NOT imported here: this registry is part of the client
   * bundle for the /writing index, and the SEO prose (500+ words per tool)
   * belongs only in the server-rendered tool route.
   */
  seo?: ToolSeo;
};

export type ToolCategory = {
  name: string;
  tools: Tool[];
};

import type { ToolSeo } from "@/components/shared/seo-types";
import { toSlug } from "@/lib/utils/slug";
const slugify = toSlug;

const mk = (name: string, description: string, icon?: any, available = false): Tool => ({
  name,
  slug: slugify(name),
  description,
  status: available ? "live" : "soon",
  icon,
});

export const categories: ToolCategory[] = [
  {
    name: "Text Editing & Drafting",
    tools: [
      mk("Distraction-Free Writing Editor", "A clean, focused space for deep writing", ClipboardEdit, true),
      mk("Markdown Editor", "Write Markdown and read the rendered preview and outline", BookOpenText, true),
      mk("Rich Text Editor", "WYSIWYG editor with formatting controls", BookText, false),
      mk("Outline Builder", "Shape an indented outline and render it numbered", Layout, true),
      mk("Draft Versioning Tool", "Save labelled draft versions and track the word delta", Edit, true),
      mk("Writing Sprint Timer", "Time-boxed writing sessions", Activity, true),
      mk("Scene & Chapter Organizer", "Board your scenes with POV, setting and word counts", BookOpen, true),
      mk("Plot Point Mapper", "Map your events onto a named story structure", BookOpenCheck, true),
      mk("Story Beat Builder", "Track which beats of a beat sheet you have drafted", LayoutDashboard, true),
      mk("Manuscript Formatter", "Clean up quotes, dashes and scene breaks for submission", LayoutGrid, true),
      mk("Document Diff Viewer", "Compare two drafts line by line or word by word", AlarmClockCheck, true),
      mk("Writing Goal Tracker", "Set and track daily word goals", AlertOctagon, true),
      mk("Block-Based Editor", "Notion-style block editing", Edit2, false),
      mk("Focus Sentence Highlighter", "Highlight the sentence you're editing", FileText, true),
    ],
  },
  {
    name: "Grammar & Style",
    tools: [
      mk("Grammar Checker", "Check a documented set of common errors locally", SpellCheck, true),
      mk("Passive Voice Detector", "Spot passive constructions instantly", BadgeJapaneseYen, true),
      mk("Readability Grade Scorer", "Score your text's reading level", Calculator, true),
      mk("Sentence Complexity Analyzer", "Find sentences that need simplifying", LetterText, true),
      mk("Overused Word Finder", "Find words you lean on too often", BookOpenText, true),
      mk("Cliché Detector", "Catch tired phrases before publishing", AlignCenter, true),
      mk("Redundancy Finder", "Identify repetitive phrasing", Eye, true),
      mk("Wordy Phrase Simplifier", "Tighten wordy expressions", BookText, true),
      mk("Sentence Variety Checker", "Vary sentence rhythm and length", FileText, true),
      mk("Tone Analyzer", "Detect the tone of your writing", Calculator, true),
      mk("Formality Level Detector", "Measure how formal your text reads", AlignCenterHorizontal, true),
      mk("Clarity Score Tool", "Score how clearly your text communicates", CircleGauge, true),
      mk("Style Guide Adherence Checker", "Check against common style guides", Megaphone, true),
      mk("Academic Writing Tone Checker", "Match an academic register", MegaphoneOff, true),
    ],
  },
  {
    name: "Spelling & Proofreading",
    tools: [
      mk("Spell Checker", "Catch typos and misspellings", SpellCheck2, true),
      mk("Homophone Confusion Detector", "Spot your/you're, its/it's mix-ups", AlignCenterVertical, true),
      mk("Punctuation Checker", "Find misplaced punctuation", AlignEndHorizontal, true),
      mk("Apostrophe Error Finder", "Find apostrophe mistakes", AlignEndVertical, true),
      mk("Capitalization Checker", "Find capitalization issues", AlignHorizontalDistributeCenter, true),
      mk("Proper Noun Checker", "Verify proper noun usage", AlignHorizontalDistributeEnd, true),
      mk("Number Format Checker", "Standardize number formats", LayoutList, true),
      mk("Consistent Spelling Checker", "UK vs US spelling consistency", SpellCheck, true),
    ],
  },
  {
    name: "Paraphrasing & Rewriting",
    tools: [
      mk("Sentence Rewriter", "Compare four rule-based rewrites of each sentence", LetterText, true),
      mk("Simplify Text Tool", "Replace wordy phrases and split long sentences", MessageSquareText, true),
      mk("Formality Adjuster", "Shift register with a paired word table", Megaphone, true),
      mk("Technical to Plain Language Converter", "Expand acronyms and replace listed jargon", Globe, true),
      mk("Active Voice Converter", "Recast passives that name their actor", AlignHorizontalDistributeStart, true),
      mk("Headline Rewriter", "Compose five headline angles from your words", Edit3, true),
      mk("Paragraph Compressor", "Cut hedges, wordy phrases and repeated sentences", NotebookText, true),
      mk("Email to Formal Letter Converter", "Reformat an email as a letter and list each change", Mail, true),
      mk("Jargon Remover", "Replace documented jargon with plain words", AlignHorizontalJustifyCenter, true),
      mk("Bullet to Prose Converter", "Join bullet lines into a paragraph or one sentence", AlignHorizontalJustifyEnd, true),
    ],
  },
  {
    name: "Summarization & Extraction",
    tools: [
      mk("Text Summarizer", "Extract the most important sentences", NotepadText, true),
      mk("Key Points Extractor", "Rank the key points in a text", ClipboardList, true),
      mk("TL;DR Generator", "Build a short TL;DR from top sentences", LayoutPanelLeft, true),
      mk("Executive Summary Builder", "Extract a bottom line and findings", List, true),
      mk("Bullet Point Extractor", "Turn each sentence into a bullet", ListCheck, true),
      mk("Important Sentence Highlighter", "Mark the top-ranked sentences in place", NotepadTextDashed, true),
      mk("Abstract Generator", "Assemble a labelled abstract and check its parts", LayoutPanelTop, true),
      mk("Meeting Summary Formatter", "Sort notes into decisions, actions and questions", ListChecks, true),
    ],
  },
  {
    name: "Research & Reference",
    tools: [
      mk("Citation Formatter", "Format APA 7, MLA 9, Chicago or Bluebook entries", LayoutTemplate, true),
      mk("Bibliography Builder", "Build a bibliography from an editable source list", Layout, true),
      mk("Footnote Formatter", "Format footnotes consistently", LayoutDashboard, true),
      mk("Endnote Manager", "Number endnotes in the order you arrange them", MessageSquareQuote, true),
      mk("Reference List Generator", "Build a reference list with matching in-text markers", LayoutGrid, true),
      mk("In-Text Citation Builder", "See every in-text form across four styles at once", ReceiptText, true),
      mk("DOI to Citation Converter", "Convert DOIs to full citations", Quote, false),
      mk("ISBN Lookup & Formatter", "Look up and format book ISBNs", LayoutList, false),
      mk("URL to Citation Tool", "Cite web pages by URL", TextQuote, false),
      mk("Academic Journal Reference Formatter", "Format journal articles with a per-style field checklist", LayoutPanelLeft, true),
      mk("Legal Citation Formatter", "Format Bluebook cases and statutes with signals and short forms", LayoutPanelTop, true),
      mk("Newspaper Article Citation Maker", "Cite a newspaper article in APA, MLA or Chicago", LayoutTemplate, true),
    ],
  },
  {
    name: "Templates & Generators",
    tools: [
      mk("Cover Letter Builder", "Assemble a cover letter from your facts and check each section", Wand, true),
      mk("Resume Writer", "Assemble a plain-text resume and check every entry", FileEdit, true),
      mk("Bio Generator", "Turn your facts into one-line, short and long bios", Wand2, true),
      mk("About Page Builder", "Assemble six About page sections and check the reader's view", WandSparkles, true),
      mk("Author Profile Writer", "Assemble a publication-facing profile from genre, works and themes", FolderEdit, true),
      mk("Press Release Template", "Build a release with a 5W lead, quote, boilerplate and contact", Wand, true),
      mk("Blog Post Outline Builder", "Outline a post from its title, reader and points", Wand2, true),
      mk("Newsletter Template Builder", "Assemble an issue from sections, a purpose line and one next step", WandSparkles, true),
      mk("Email Template Library", "Fill six common business emails from fixed templates", Sparkles, true),
      mk("Proposal Template", "Scaffold a proposal with problem, approach, deliverables and price", Sparkles, true),
      mk("RFP Response Builder", "Build a compliance matrix over the RFP's requirements", FileCode, true),
      mk("Job Description Writer", "Assemble a posting and check the published hiring guidance", ClipboardEdit, true),
      mk("Product Description Writer", "Assemble a description in the order a shopper reads", CreditCard, true),
      mk("FAQ Generator", "Format questions and answers into a checked FAQ section", FileCode2, true),
      mk("Terms of Service Template", "Assemble the sections an agreement is read for", FileCode, true),
      mk("Privacy Policy Template", "Assemble the published notice sections and check the gaps", FileCode2, true),
    ],
  },
  {
    name: "Creative Writing",
    tools: [
      mk("Story Idea Generator", "Assemble a premise from protagonist, want, obstacle and setting", Edit, true),
      mk("Character Profile Builder", "Prompt a character's want, need, flaw and arc", Edit2, true),
      mk("World Building Template", "Answer seven questions into a world bible and see the gaps", Edit3, true),
      mk("Plot Structure Planner", "Hero's Journey & Three-Act", BookOpen, false),
      mk("Dialogue Practice Tool", "Write dialogue from a prompt and analyse the exchange", AlignHorizontalJustifyStart, true),
      mk("Writing Prompt Generator", "Cycle a fixed bank of prompts across five categories", FileEdit, true),
      mk("Poetry Form Guide", "Reference the fixed forms and measure a draft against one", BookOpenCheck, true),
      mk("Flash Fiction Timer", "Write tight flash fiction", Book, true),
      mk("Scene Description Builder", "Answer sensory prompts and check for filter words", FolderEdit, true),
      mk("Conflict & Resolution Planner", "Shape a conflict and its escalating turns", AlignHorizontalSpaceAround, true),
      mk("Villain Motivation Builder", "Assemble a villain's want, wound, method and limit", Clipboard, true),
      mk("Genre Blender Idea Tool", "Mash up genres for new ideas", Brain, false),
      mk("First Line Generator", "Compose opening lines from a character, a place and a tone", ClipboardCheck, true),
      mk("Ending Generator", "Try out different endings", ClipboardCopy, false),
    ],
  },
  {
    name: "Content & Marketing Copy",
    tools: [
      mk("Headline Analyzer", "Score a headline on length, detail, power words and faults", Gauge, true),
      mk("CTA Button Copy Generator", "Build five button-label variants from a verb, object and benefit", ClipboardMinus, true),
      mk("Landing Page Copy Builder", "Scaffold a page from hero, benefits, proof and next step", ClipboardPaste, true),
      mk("Value Proposition Builder", "Assemble audience, need, benefit, alternative and proof", ClipboardPen, true),
      mk("Tagline Generator", "Compose five tagline patterns from a brand, benefit and audience", ClipboardPenLine, true),
      mk("Social Post Caption Builder", "Render one caption for four platforms and check each limit", ClipboardPlus, true),
      mk("Email Subject Line Tester", "Score a subject line for length, trigger phrases and shouting", MailCheck, true),
      mk("Ad Copy Framework Builder", "Read one offer through the AIDA, PAS and BAB structures", ClipboardSignature, true),
      mk("Sales Page Copywriting Tool", "Assemble nine long-form blocks and check each one", MegaphoneOff, true),
      mk("Product Launch Copy Builder", "Assemble an announcement and check what is missing", ClipboardType, true),
      mk("Testimonial Formatter", "Format quotes for wall, carousel and pull quote", ClipboardX, true),
      mk("Case Study Template", "Assemble a case study and check its results for figures", Clipboard, true),
      mk("Brand Voice Guide Builder", "Document attributes, say lists and a checked sample", ClipboardCheck, true),
      mk("Microcopy Library", "Draft the twelve interface slots in three registers", TrendingDown, true),
    ],
  },
  {
    name: "Text Analysis & Statistics",
    tools: [
      mk("Word Count Tool", "Count words instantly", ScanText, true),
      mk("Character Count Tool", "Count characters with and without spaces", GaugeCircle, true),
      mk("Reading Time Estimator", "Estimate reading time", CircleGauge, true),
      mk("Sentence Count Tool", "Count sentences in text", ScrollText, true),
      mk("Average Word Length Calculator", "Average word length stats", Text, true),
      mk("Vocabulary Richness Scorer", "Measure vocabulary richness", Gauge, true),
      mk("Keyword Density Analyzer", "Analyze keyword density", TextCursor, true),
      mk("Flesch-Kincaid Score Calculator", "Compute Flesch-Kincaid", GaugeCircle, true),
      mk("Gunning Fog Index Calculator", "Compute Gunning Fog index", AreaChart, true),
      mk("SMOG Index Calculator", "Compute SMOG readability", BarChart, true),
      mk("Lexical Diversity Calculator", "Lexical diversity scoring", BarChart2, true),
      mk("Text Fingerprint Analyzer", "Fingerprint a body of text", TextCursorInput, true),
    ],
  },
  {
    name: "Localization & Internationalization",
    tools: [
      mk("Language Detector", "Detect the language of text", Globe2, true),
      mk("Text Translation Previewer", "Preview translated text", TextSearch, false),
      mk("Locale Date Formatter", "Format dates by locale", ClipboardCopy, true),
      mk("Number Locale Formatter", "Format numbers by locale", ClipboardList, true),
      mk("RTL Text Tester", "Test right-to-left text", TextSelect, true),
      mk("Unicode Text Normalizer", "Normalize Unicode forms", TextSelection, true),
      mk("Character Encoding Converter", "Convert character encodings", BookA, true),
      mk("Bidirectional Text Tester", "Test bidirectional text", WrapText, true),
      mk("Locale-Aware Sort Tool", "Sort with locale awareness", GlobeLock, true),
      mk("Text Expansion Estimator", "Estimate UI text expansion", MessageSquareText, true),
    ],
  },
  {
    name: "Specialized & Academic",
    tools: [
      mk("Thesis Statement Builder", "Assemble a thesis and check its wording", ClipboardMinus, true),
      mk("Argument Mapping Tool", "Map a claim, its reasons, evidence and warrants", AlignHorizontalSpaceBetween, true),
      mk("Counterargument Generator", "Order ten published challenge moves for a claim", BarChart3, true),
      mk("Logical Fallacy Detector", "Flag documented cue phrases for common fallacies", AlignJustify, true),
      mk("Debate Script Formatter", "Place speeches into four published speaking orders", ClipboardPaste, true),
      mk("Scientific Abstract Builder", "Assemble five abstract roles and check each one", ClipboardPen, true),
      mk("IRB Consent Form Template", "Assemble the published consent elements and check them", ClipboardPenLine, true),
      mk("Survey Question Builder", "Check questions for leading or double-barrelled wording", ClipboardPlus, true),
      mk("Literature Review Organizer", "Group sources by stance into a synthesis scaffold", AlignLeft, true),
      mk("Academic Paper Section Planner", "Split a word budget across five paper sections", TrendingUp, true),
      mk("Peer Review Checklist", "Work through a paper section by section", FlaskConical, true),
      mk("Grant Proposal Outline", "Assemble a funder framework and check its mandates", FlaskConicalOff, true),
      mk("Technical Report Template", "Assemble a numbered report and check its evidence", ClipboardSignature, true),
      mk("Style Consistency Enforcer", "Check a document for mixed conventions", AlignRight, true),
      mk("Plagiarism Self-Check Prep Tool", "Check quotation hygiene before a similarity check", AlignStartHorizontal, true),
      mk("Writing Portfolio Builder", "Group and select pieces into a portfolio outline", ClipboardType, true),
    ],
  },
];

export const allTools: Tool[] = categories.flatMap((c) =>
  c.tools.map((t) => ({ ...t, category: c.name } as Tool & { category: string })),
);

export const totalToolCount = allTools.length;

export function findTool(slug: string) {
  for (const cat of categories) {
    const t = cat.tools.find((x) => x.slug === slug);
    if (t) return { tool: t, category: (cat as any).name || (cat as any).title || (cat as any).label || '' };
  }
  return null;
}
