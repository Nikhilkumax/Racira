import { ClipboardEdit, BookOpenText, BookText, Layout, Edit, Activity, BookOpen, BookOpenCheck, LayoutDashboard, LayoutGrid, AlarmClockCheck, AlertOctagon, Edit2, FileText, LucideSpellCheck, BadgeJapaneseYen, Calculator, LetterText, LucideBookOpenText, AlignCenter, Eye, LucideBookText, LucideFileText, LucideCalculator, AlignCenterHorizontal, CircleGauge, LucideMegaphone, LucideMegaphoneOff, LucideSpellCheck2, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalDistributeCenter, AlignHorizontalDistributeEnd, LayoutList, SpellCheck, LucideLetterText, LucideMessageSquareText, Megaphone, Globe, AlignHorizontalDistributeStart, Edit3, LucideNotebookText, LucideMail, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, LucideNotepadText, ClipboardList, LayoutPanelLeft, List, ListCheck, LucideNotepadTextDashed, LayoutPanelTop, ListChecks, LayoutTemplate, LucideLayout, LucideLayoutDashboard, LucideMessageSquareQuote, LucideLayoutGrid, LucideReceiptText, LucideQuote, LucideLayoutList, LucideTextQuote, LucideLayoutPanelLeft, LucideLayoutPanelTop, LucideLayoutTemplate, LucideWand, FileEdit, LucideWand2, LucideWandSparkles, FolderEdit, Wand, Wand2, WandSparkles, LucideSparkles, Sparkles, FileCode, LucideClipboardEdit, LucideCreditCard, FileCode2, LucideFileCode, LucideFileCode2, LucideEdit, LucideEdit2, LucideEdit3, LucideBookOpen, AlignHorizontalJustifyStart, LucideFileEdit, LucideBookOpenCheck, Book, LucideFolderEdit, AlignHorizontalSpaceAround, Clipboard, Brain, ClipboardCheck, ClipboardCopy, Gauge, ClipboardMinus, ClipboardPaste, ClipboardPen, ClipboardPenLine, ClipboardPlus, LucideMailCheck, ClipboardSignature, MegaphoneOff, ClipboardType, ClipboardX, LucideClipboard, LucideClipboardCheck, LucideTrendingDown, LucideScanText, GaugeCircle, LucideCircleGauge, LucideScrollText, LucideText, LucideGauge, LucideTextCursor, LucideGaugeCircle, AreaChart, BarChart, BarChart2, LucideTextCursorInput, Globe2, LucideTextSearch, LucideClipboardCopy, LucideClipboardList, LucideTextSelect, LucideTextSelection, BookA, LucideWrapText, GlobeLock, MessageSquareText, LucideClipboardMinus, AlignHorizontalSpaceBetween, BarChart3, AlignJustify, LucideClipboardPaste, LucideClipboardPen, LucideClipboardPenLine, LucideClipboardPlus, AlignLeft, LucideTrendingUp, FlaskConical, FlaskConicalOff, LucideClipboardSignature, AlignRight, AlignStartHorizontal, LucideClipboardType } from "lucide-react";
export type Tool = {
  name: string;
  slug: string;
  description: string;
  available?: boolean;
};

export type ToolCategory = {
  name: string;
  tools: Tool[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const mk = (name: string, description: string, available = false): Tool => ({
  name,
  slug: slugify(name),
  description,
  available,
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
      mk("Grammar Checker", "Local grammar checking, no upload required", LucideSpellCheck, false),
      mk("Passive Voice Detector", "Spot passive constructions instantly", BadgeJapaneseYen, false),
      mk("Readability Grade Scorer", "Score your text's reading level", Calculator, false),
      mk("Sentence Complexity Analyzer", "Find sentences that need simplifying", LetterText, false),
      mk("Overused Word Finder", "Find words you lean on too often", LucideBookOpenText, false),
      mk("Cliché Detector", "Catch tired phrases before publishing", AlignCenter, false),
      mk("Redundancy Finder", "Identify repetitive phrasing", Eye, false),
      mk("Wordy Phrase Simplifier", "Tighten wordy expressions", LucideBookText, false),
      mk("Sentence Variety Checker", "Vary sentence rhythm and length", LucideFileText, false),
      mk("Tone Analyzer", "Detect the tone of your writing", LucideCalculator, false),
      mk("Formality Level Detector", "Measure how formal your text reads", AlignCenterHorizontal, false),
      mk("Clarity Score Tool", "Score how clearly your text communicates", CircleGauge, false),
      mk("Style Guide Adherence Checker", "Check against common style guides", LucideMegaphone, false),
      mk("Academic Writing Tone Checker", "Match an academic register", LucideMegaphoneOff, false),
    ],
  },
  {
    name: "Spelling & Proofreading",
    tools: [
      mk("Spell Checker", "Catch typos and misspellings", LucideSpellCheck2, false),
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
      mk("Sentence Rewriter", "Rewrite sentences locally", LucideLetterText, false),
      mk("Simplify Text Tool", "Make complex text easier to read", LucideMessageSquareText, false),
      mk("Formality Adjuster", "Dial formality up or down", Megaphone, false),
      mk("Technical to Plain Language Converter", "Translate jargon to plain English", Globe, false),
      mk("Active Voice Converter", "Turn passive sentences active", AlignHorizontalDistributeStart, false),
      mk("Headline Rewriter", "Generate sharper headlines", Edit3, false),
      mk("Paragraph Compressor", "Compress long paragraphs", LucideNotebookText, false),
      mk("Email to Formal Letter Converter", "Turn casual emails into formal letters", LucideMail, false),
      mk("Jargon Remover", "Strip industry jargon", AlignHorizontalJustifyCenter, false),
      mk("Bullet to Prose Converter", "Convert bullets into flowing prose", AlignHorizontalJustifyEnd, false),
    ],
  },
  {
    name: "Summarization & Extraction",
    tools: [
      mk("Text Summarizer", "Local ML-based text summarization", LucideNotepadText, false),
      mk("Key Points Extractor", "Pull out the key points", ClipboardList, false),
      mk("TL;DR Generator", "Generate a quick TL;DR", LayoutPanelLeft, false),
      mk("Executive Summary Builder", "Build executive-ready summaries", List, false),
      mk("Bullet Point Extractor", "Convert prose into bullets", ListCheck, false),
      mk("Important Sentence Highlighter", "Highlight the most important sentences", LucideNotepadTextDashed, false),
      mk("Abstract Generator", "Generate research abstracts", LayoutPanelTop, false),
      mk("Meeting Summary Formatter", "Format meeting notes consistently", ListChecks, false),
    ],
  },
  {
    name: "Research & Reference",
    tools: [
      mk("Citation Formatter", "APA, MLA, and Chicago citations", LayoutTemplate, false),
      mk("Bibliography Builder", "Build complete bibliographies", LucideLayout, false),
      mk("Footnote Formatter", "Format footnotes consistently", LucideLayoutDashboard, false),
      mk("Endnote Manager", "Manage your endnotes", LucideMessageSquareQuote, false),
      mk("Reference List Generator", "Generate reference lists fast", LucideLayoutGrid, false),
      mk("In-Text Citation Builder", "Build in-text citations", LucideReceiptText, false),
      mk("DOI to Citation Converter", "Convert DOIs to full citations", LucideQuote, false),
      mk("ISBN Lookup & Formatter", "Look up and format book ISBNs", LucideLayoutList, false),
      mk("URL to Citation Tool", "Cite web pages by URL", LucideTextQuote, false),
      mk("Academic Journal Reference Formatter", "Format journal references", LucideLayoutPanelLeft, false),
      mk("Legal Citation Formatter", "Format legal citations", LucideLayoutPanelTop, false),
      mk("Newspaper Article Citation Maker", "Cite newspaper articles", LucideLayoutTemplate, false),
    ],
  },
  {
    name: "Templates & Generators",
    tools: [
      mk("Cover Letter Builder", "Build standout cover letters", LucideWand, false),
      mk("Resume Writer", "Craft a polished resume", FileEdit, false),
      mk("Bio Generator", "Generate short and long bios", LucideWand2, false),
      mk("About Page Builder", "Build an About page that converts", LucideWandSparkles, false),
      mk("Author Profile Writer", "Write a strong author profile", FolderEdit, false),
      mk("Press Release Template", "Press release structure ready to go", Wand, false),
      mk("Blog Post Outline Builder", "Outline blog posts quickly", Wand2, false),
      mk("Newsletter Template Builder", "Newsletter sections and layouts", WandSparkles, false),
      mk("Email Template Library", "Reusable email templates", LucideSparkles, false),
      mk("Proposal Template", "Proposal scaffold and sections", Sparkles, false),
      mk("RFP Response Builder", "Respond to RFPs methodically", FileCode, false),
      mk("Job Description Writer", "Write clear job descriptions", LucideClipboardEdit, false),
      mk("Product Description Writer", "Sell with concise product copy", LucideCreditCard, false),
      mk("FAQ Generator", "Generate FAQ sections", FileCode2, false),
      mk("Terms of Service Template", "Editable ToS template", LucideFileCode, false),
      mk("Privacy Policy Template", "Editable privacy policy", LucideFileCode2, false),
    ],
  },
  {
    name: "Creative Writing",
    tools: [
      mk("Story Idea Generator", "Spark fresh story ideas", LucideEdit, false),
      mk("Character Profile Builder", "Build deep character profiles", LucideEdit2, false),
      mk("World Building Template", "Template for rich worlds", LucideEdit3, false),
      mk("Plot Structure Planner", "Hero's Journey & Three-Act", LucideBookOpen, false),
      mk("Dialogue Practice Tool", "Practice and refine dialogue", AlignHorizontalJustifyStart, false),
      mk("Writing Prompt Generator", "Endless writing prompts", LucideFileEdit, false),
      mk("Poetry Form Guide", "Reference guide to poetry forms", LucideBookOpenCheck, false),
      mk("Flash Fiction Timer", "Write tight flash fiction", Book, false),
      mk("Scene Description Builder", "Build vivid scene descriptions", LucideFolderEdit, false),
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
      mk("Email Subject Line Tester", "Test subject line strength", LucideMailCheck, false),
      mk("Ad Copy Framework Builder", "AIDA, PAS, and more", ClipboardSignature, false),
      mk("Sales Page Copywriting Tool", "Long-form sales page structure", MegaphoneOff, false),
      mk("Product Launch Copy Builder", "Launch announcements that pop", ClipboardType, false),
      mk("Testimonial Formatter", "Format testimonials cleanly", ClipboardX, false),
      mk("Case Study Template", "Case study scaffold", LucideClipboard, false),
      mk("Brand Voice Guide Builder", "Document your brand voice", LucideClipboardCheck, false),
      mk("Microcopy Library", "Reusable UI microcopy", LucideTrendingDown, false),
    ],
  },
  {
    name: "Text Analysis & Statistics",
    tools: [
      mk("Word Count Tool", "Count words instantly", LucideScanText, false),
      mk("Character Count Tool", "Count characters with and without spaces", GaugeCircle, false),
      mk("Reading Time Estimator", "Estimate reading time", LucideCircleGauge, false),
      mk("Sentence Count Tool", "Count sentences in text", LucideScrollText, false),
      mk("Average Word Length Calculator", "Average word length stats", LucideText, false),
      mk("Vocabulary Richness Scorer", "Measure vocabulary richness", LucideGauge, false),
      mk("Keyword Density Analyzer", "Analyze keyword density", LucideTextCursor, false),
      mk("Flesch-Kincaid Score Calculator", "Compute Flesch-Kincaid", LucideGaugeCircle, false),
      mk("Gunning Fog Index Calculator", "Compute Gunning Fog index", AreaChart, false),
      mk("SMOG Index Calculator", "Compute SMOG readability", BarChart, false),
      mk("Lexical Diversity Calculator", "Lexical diversity scoring", BarChart2, false),
      mk("Text Fingerprint Analyzer", "Fingerprint a body of text", LucideTextCursorInput, false),
    ],
  },
  {
    name: "Localization & Internationalization",
    tools: [
      mk("Language Detector", "Detect the language of text", Globe2, false),
      mk("Text Translation Previewer", "Preview translated text", LucideTextSearch, false),
      mk("Locale Date Formatter", "Format dates by locale", LucideClipboardCopy, false),
      mk("Number Locale Formatter", "Format numbers by locale", LucideClipboardList, false),
      mk("RTL Text Tester", "Test right-to-left text", LucideTextSelect, false),
      mk("Unicode Text Normalizer", "Normalize Unicode forms", LucideTextSelection, false),
      mk("Character Encoding Converter", "Convert character encodings", BookA, false),
      mk("Bidirectional Text Tester", "Test bidirectional text", LucideWrapText, false),
      mk("Locale-Aware Sort Tool", "Sort with locale awareness", GlobeLock, false),
      mk("Text Expansion Estimator", "Estimate UI text expansion", MessageSquareText, false),
    ],
  },
  {
    name: "Specialized & Academic",
    tools: [
      mk("Thesis Statement Builder", "Build a clear thesis statement", LucideClipboardMinus, false),
      mk("Argument Mapping Tool", "Map arguments and warrants", AlignHorizontalSpaceBetween, false),
      mk("Counterargument Generator", "Generate counterarguments", BarChart3, false),
      mk("Logical Fallacy Detector", "Detect common logical fallacies", AlignJustify, false),
      mk("Debate Script Formatter", "Format debate scripts", LucideClipboardPaste, false),
      mk("Scientific Abstract Builder", "Structure scientific abstracts", LucideClipboardPen, false),
      mk("IRB Consent Form Template", "IRB consent form template", LucideClipboardPenLine, false),
      mk("Survey Question Builder", "Build solid survey questions", LucideClipboardPlus, false),
      mk("Literature Review Organizer", "Organize literature reviews", AlignLeft, false),
      mk("Academic Paper Section Planner", "Plan paper sections", LucideTrendingUp, false),
      mk("Peer Review Checklist", "Peer review checklist", FlaskConical, false),
      mk("Grant Proposal Outline", "Outline grant proposals", FlaskConicalOff, false),
      mk("Technical Report Template", "Technical report template", LucideClipboardSignature, false),
      mk("Style Consistency Enforcer", "Enforce style consistency", AlignRight, false),
      mk("Plagiarism Self-Check Prep Tool", "Prep text for plagiarism check", AlignStartHorizontal, false),
      mk("Writing Portfolio Builder", "Build a writing portfolio", LucideClipboardType, false),
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
