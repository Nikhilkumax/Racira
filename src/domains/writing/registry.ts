import { Activity, AlarmClockCheck, AlertOctagon, AlignCenter, AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, AlignHorizontalDistributeStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignHorizontalSpaceAround, AlignHorizontalSpaceBetween, AlignJustify, AlignLeft, AlignRight, AlignStartHorizontal, AreaChart, BadgeJapaneseYen, BarChart, BarChart2, BarChart3, Book, BookA, BookOpen, BookOpenCheck, BookOpenText, BookText, Brain, Calculator, CircleGauge, Clipboard, ClipboardCheck, ClipboardCopy, ClipboardEdit, ClipboardList, ClipboardMinus, ClipboardPaste, ClipboardPen, ClipboardPenLine, ClipboardPlus, ClipboardSignature, ClipboardType, ClipboardX, CreditCard, Edit, Edit2, Edit3, Eye, FileCode, FileCode2, FileEdit, FileText, FlaskConical, FlaskConicalOff, FolderEdit, Gauge, GaugeCircle, Globe, Globe2, GlobeLock, Layout, LayoutDashboard, LayoutGrid, LayoutList, LayoutPanelLeft, LayoutPanelTop, LayoutTemplate, LetterText, List, ListCheck, ListChecks, Mail, MailCheck, Megaphone, MegaphoneOff, MessageSquareQuote, MessageSquareText, NotebookText, NotepadText, NotepadTextDashed, Quote, ReceiptText, ScanText, ScrollText, Sparkles, SpellCheck, SpellCheck2, Text, TextCursor, TextCursorInput, TextQuote, TextSearch, TextSelect, TextSelection, TrendingDown, TrendingUp, Wand, Wand2, WandSparkles, WrapText } from "lucide-react";
export type Tool = {
  name: string;
  slug: string;
  description: string;
  status?: "live" | "soon";
  icon?: any;
};

export type ToolCategory = {
  name: string;
  tools: Tool[];
};

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
      mk("Markdown Editor", "Write and preview Markdown side by side", BookOpenText, false),
      mk("Rich Text Editor", "WYSIWYG editor with formatting controls", BookText, false),
      mk("Outline Builder", "Plan documents with nested outlines", Layout, false),
      mk("Draft Versioning Tool", "Track and compare draft versions", Edit, false),
      mk("Writing Sprint Timer", "Time-boxed writing sessions", Activity, false),
      mk("Scene & Chapter Organizer", "Organize scenes and chapters visually", BookOpen, false),
      mk("Plot Point Mapper", "Map key plot points across your story", BookOpenCheck, false),
      mk("Story Beat Builder", "Design narrative beats step by step", LayoutDashboard, false),
      mk("Manuscript Formatter", "Standard manuscript formatting in seconds", LayoutGrid, false),
      mk("Document Diff Viewer", "See changes between two documents", AlarmClockCheck, false),
      mk("Writing Goal Tracker", "Set and track daily word goals", AlertOctagon, false),
      mk("Block-Based Editor", "Notion-style block editing", Edit2, false),
      mk("Focus Sentence Highlighter", "Highlight the sentence you're editing", FileText, false),
    ],
  },
  {
    name: "Grammar & Style",
    tools: [
      mk("Grammar Checker", "Local grammar checking, no upload required", SpellCheck, false),
      mk("Passive Voice Detector", "Spot passive constructions instantly", BadgeJapaneseYen, false),
      mk("Readability Grade Scorer", "Score your text's reading level", Calculator, false),
      mk("Sentence Complexity Analyzer", "Find sentences that need simplifying", LetterText, false),
      mk("Overused Word Finder", "Find words you lean on too often", BookOpenText, false),
      mk("Cliché Detector", "Catch tired phrases before publishing", AlignCenter, false),
      mk("Redundancy Finder", "Identify repetitive phrasing", Eye, false),
      mk("Wordy Phrase Simplifier", "Tighten wordy expressions", BookText, false),
      mk("Sentence Variety Checker", "Vary sentence rhythm and length", FileText, false),
      mk("Tone Analyzer", "Detect the tone of your writing", Calculator, false),
      mk("Formality Level Detector", "Measure how formal your text reads", AlignCenterHorizontal, false),
      mk("Clarity Score Tool", "Score how clearly your text communicates", CircleGauge, false),
      mk("Style Guide Adherence Checker", "Check against common style guides", Megaphone, false),
      mk("Academic Writing Tone Checker", "Match an academic register", MegaphoneOff, false),
    ],
  },
  {
    name: "Spelling & Proofreading",
    tools: [
      mk("Spell Checker", "Catch typos and misspellings", SpellCheck2, false),
      mk("Homophone Confusion Detector", "Spot your/you're, its/it's mix-ups", AlignCenterVertical, false),
      mk("Punctuation Checker", "Find misplaced punctuation", AlignEndHorizontal, false),
      mk("Apostrophe Error Finder", "Find apostrophe mistakes", AlignEndVertical, false),
      mk("Capitalization Checker", "Find capitalization issues", AlignHorizontalDistributeCenter, false),
      mk("Proper Noun Checker", "Verify proper noun usage", AlignHorizontalDistributeEnd, false),
      mk("Number Format Checker", "Standardize number formats", LayoutList, false),
      mk("Consistent Spelling Checker", "UK vs US spelling consistency", SpellCheck, false),
    ],
  },
  {
    name: "Paraphrasing & Rewriting",
    tools: [
      mk("Sentence Rewriter", "Rewrite sentences locally", LetterText, false),
      mk("Simplify Text Tool", "Make complex text easier to read", MessageSquareText, false),
      mk("Formality Adjuster", "Dial formality up or down", Megaphone, false),
      mk("Technical to Plain Language Converter", "Translate jargon to plain English", Globe, false),
      mk("Active Voice Converter", "Turn passive sentences active", AlignHorizontalDistributeStart, false),
      mk("Headline Rewriter", "Generate sharper headlines", Edit3, false),
      mk("Paragraph Compressor", "Compress long paragraphs", NotebookText, false),
      mk("Email to Formal Letter Converter", "Turn casual emails into formal letters", Mail, false),
      mk("Jargon Remover", "Strip industry jargon", AlignHorizontalJustifyCenter, false),
      mk("Bullet to Prose Converter", "Convert bullets into flowing prose", AlignHorizontalJustifyEnd, false),
    ],
  },
  {
    name: "Summarization & Extraction",
    tools: [
      mk("Text Summarizer", "Local ML-based text summarization", NotepadText, false),
      mk("Key Points Extractor", "Pull out the key points", ClipboardList, false),
      mk("TL;DR Generator", "Generate a quick TL;DR", LayoutPanelLeft, false),
      mk("Executive Summary Builder", "Build executive-ready summaries", List, false),
      mk("Bullet Point Extractor", "Convert prose into bullets", ListCheck, false),
      mk("Important Sentence Highlighter", "Highlight the most important sentences", NotepadTextDashed, false),
      mk("Abstract Generator", "Generate research abstracts", LayoutPanelTop, false),
      mk("Meeting Summary Formatter", "Format meeting notes consistently", ListChecks, false),
    ],
  },
  {
    name: "Research & Reference",
    tools: [
      mk("Citation Formatter", "APA, MLA, and Chicago citations", LayoutTemplate, false),
      mk("Bibliography Builder", "Build complete bibliographies", Layout, false),
      mk("Footnote Formatter", "Format footnotes consistently", LayoutDashboard, false),
      mk("Endnote Manager", "Manage your endnotes", MessageSquareQuote, false),
      mk("Reference List Generator", "Generate reference lists fast", LayoutGrid, false),
      mk("In-Text Citation Builder", "Build in-text citations", ReceiptText, false),
      mk("DOI to Citation Converter", "Convert DOIs to full citations", Quote, false),
      mk("ISBN Lookup & Formatter", "Look up and format book ISBNs", LayoutList, false),
      mk("URL to Citation Tool", "Cite web pages by URL", TextQuote, false),
      mk("Academic Journal Reference Formatter", "Format journal references", LayoutPanelLeft, false),
      mk("Legal Citation Formatter", "Format legal citations", LayoutPanelTop, false),
      mk("Newspaper Article Citation Maker", "Cite newspaper articles", LayoutTemplate, false),
    ],
  },
  {
    name: "Templates & Generators",
    tools: [
      mk("Cover Letter Builder", "Build standout cover letters", Wand, false),
      mk("Resume Writer", "Craft a polished resume", FileEdit, false),
      mk("Bio Generator", "Generate short and long bios", Wand2, false),
      mk("About Page Builder", "Build an About page that converts", WandSparkles, false),
      mk("Author Profile Writer", "Write a strong author profile", FolderEdit, false),
      mk("Press Release Template", "Press release structure ready to go", Wand, false),
      mk("Blog Post Outline Builder", "Outline blog posts quickly", Wand2, false),
      mk("Newsletter Template Builder", "Newsletter sections and layouts", WandSparkles, false),
      mk("Email Template Library", "Reusable email templates", Sparkles, false),
      mk("Proposal Template", "Proposal scaffold and sections", Sparkles, false),
      mk("RFP Response Builder", "Respond to RFPs methodically", FileCode, false),
      mk("Job Description Writer", "Write clear job descriptions", ClipboardEdit, false),
      mk("Product Description Writer", "Sell with concise product copy", CreditCard, false),
      mk("FAQ Generator", "Generate FAQ sections", FileCode2, false),
      mk("Terms of Service Template", "Editable ToS template", FileCode, false),
      mk("Privacy Policy Template", "Editable privacy policy", FileCode2, false),
    ],
  },
  {
    name: "Creative Writing",
    tools: [
      mk("Story Idea Generator", "Spark fresh story ideas", Edit, false),
      mk("Character Profile Builder", "Build deep character profiles", Edit2, false),
      mk("World Building Template", "Template for rich worlds", Edit3, false),
      mk("Plot Structure Planner", "Hero's Journey & Three-Act", BookOpen, false),
      mk("Dialogue Practice Tool", "Practice and refine dialogue", AlignHorizontalJustifyStart, false),
      mk("Writing Prompt Generator", "Endless writing prompts", FileEdit, false),
      mk("Poetry Form Guide", "Reference guide to poetry forms", BookOpenCheck, false),
      mk("Flash Fiction Timer", "Write tight flash fiction", Book, false),
      mk("Scene Description Builder", "Build vivid scene descriptions", FolderEdit, false),
      mk("Conflict & Resolution Planner", "Plan story conflicts", AlignHorizontalSpaceAround, false),
      mk("Villain Motivation Builder", "Craft compelling villains", Clipboard, false),
      mk("Genre Blender Idea Tool", "Mash up genres for new ideas", Brain, false),
      mk("First Line Generator", "Magnetic first lines", ClipboardCheck, false),
      mk("Ending Generator", "Try out different endings", ClipboardCopy, false),
    ],
  },
  {
    name: "Content & Marketing Copy",
    tools: [
      mk("Headline Analyzer", "Score and improve headlines", Gauge, false),
      mk("CTA Button Copy Generator", "High-converting CTA copy", ClipboardMinus, false),
      mk("Landing Page Copy Builder", "Build landing page copy fast", ClipboardPaste, false),
      mk("Value Proposition Builder", "Clarify your value prop", ClipboardPen, false),
      mk("Tagline Generator", "Generate memorable taglines", ClipboardPenLine, false),
      mk("Social Post Caption Builder", "Captions for every platform", ClipboardPlus, false),
      mk("Email Subject Line Tester", "Test subject line strength", MailCheck, false),
      mk("Ad Copy Framework Builder", "AIDA, PAS, and more", ClipboardSignature, false),
      mk("Sales Page Copywriting Tool", "Long-form sales page structure", MegaphoneOff, false),
      mk("Product Launch Copy Builder", "Launch announcements that pop", ClipboardType, false),
      mk("Testimonial Formatter", "Format testimonials cleanly", ClipboardX, false),
      mk("Case Study Template", "Case study scaffold", Clipboard, false),
      mk("Brand Voice Guide Builder", "Document your brand voice", ClipboardCheck, false),
      mk("Microcopy Library", "Reusable UI microcopy", TrendingDown, false),
    ],
  },
  {
    name: "Text Analysis & Statistics",
    tools: [
      mk("Word Count Tool", "Count words instantly", ScanText, false),
      mk("Character Count Tool", "Count characters with and without spaces", GaugeCircle, false),
      mk("Reading Time Estimator", "Estimate reading time", CircleGauge, false),
      mk("Sentence Count Tool", "Count sentences in text", ScrollText, false),
      mk("Average Word Length Calculator", "Average word length stats", Text, false),
      mk("Vocabulary Richness Scorer", "Measure vocabulary richness", Gauge, false),
      mk("Keyword Density Analyzer", "Analyze keyword density", TextCursor, false),
      mk("Flesch-Kincaid Score Calculator", "Compute Flesch-Kincaid", GaugeCircle, false),
      mk("Gunning Fog Index Calculator", "Compute Gunning Fog index", AreaChart, false),
      mk("SMOG Index Calculator", "Compute SMOG readability", BarChart, false),
      mk("Lexical Diversity Calculator", "Lexical diversity scoring", BarChart2, false),
      mk("Text Fingerprint Analyzer", "Fingerprint a body of text", TextCursorInput, false),
    ],
  },
  {
    name: "Localization & Internationalization",
    tools: [
      mk("Language Detector", "Detect the language of text", Globe2, false),
      mk("Text Translation Previewer", "Preview translated text", TextSearch, false),
      mk("Locale Date Formatter", "Format dates by locale", ClipboardCopy, false),
      mk("Number Locale Formatter", "Format numbers by locale", ClipboardList, false),
      mk("RTL Text Tester", "Test right-to-left text", TextSelect, false),
      mk("Unicode Text Normalizer", "Normalize Unicode forms", TextSelection, false),
      mk("Character Encoding Converter", "Convert character encodings", BookA, false),
      mk("Bidirectional Text Tester", "Test bidirectional text", WrapText, false),
      mk("Locale-Aware Sort Tool", "Sort with locale awareness", GlobeLock, false),
      mk("Text Expansion Estimator", "Estimate UI text expansion", MessageSquareText, false),
    ],
  },
  {
    name: "Specialized & Academic",
    tools: [
      mk("Thesis Statement Builder", "Build a clear thesis statement", ClipboardMinus, false),
      mk("Argument Mapping Tool", "Map arguments and warrants", AlignHorizontalSpaceBetween, false),
      mk("Counterargument Generator", "Generate counterarguments", BarChart3, false),
      mk("Logical Fallacy Detector", "Detect common logical fallacies", AlignJustify, false),
      mk("Debate Script Formatter", "Format debate scripts", ClipboardPaste, false),
      mk("Scientific Abstract Builder", "Structure scientific abstracts", ClipboardPen, false),
      mk("IRB Consent Form Template", "IRB consent form template", ClipboardPenLine, false),
      mk("Survey Question Builder", "Build solid survey questions", ClipboardPlus, false),
      mk("Literature Review Organizer", "Organize literature reviews", AlignLeft, false),
      mk("Academic Paper Section Planner", "Plan paper sections", TrendingUp, false),
      mk("Peer Review Checklist", "Peer review checklist", FlaskConical, false),
      mk("Grant Proposal Outline", "Outline grant proposals", FlaskConicalOff, false),
      mk("Technical Report Template", "Technical report template", ClipboardSignature, false),
      mk("Style Consistency Enforcer", "Enforce style consistency", AlignRight, false),
      mk("Plagiarism Self-Check Prep Tool", "Prep text for plagiarism check", AlignStartHorizontal, false),
      mk("Writing Portfolio Builder", "Build a writing portfolio", ClipboardType, false),
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
