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
      mk("Distraction-Free Writing Editor", "A clean, focused space for deep writing", true),
      mk("Markdown Editor", "Write and preview Markdown side by side"),
      mk("Rich Text Editor", "WYSIWYG editor with formatting controls"),
      mk("Outline Builder", "Plan documents with nested outlines"),
      mk("Draft Versioning Tool", "Track and compare draft versions"),
      mk("Writing Sprint Timer", "Time-boxed writing sessions"),
      mk("Scene & Chapter Organizer", "Organize scenes and chapters visually"),
      mk("Plot Point Mapper", "Map key plot points across your story"),
      mk("Story Beat Builder", "Design narrative beats step by step"),
      mk("Manuscript Formatter", "Standard manuscript formatting in seconds"),
      mk("Document Diff Viewer", "See changes between two documents"),
      mk("Writing Goal Tracker", "Set and track daily word goals"),
      mk("Block-Based Editor", "Notion-style block editing"),
      mk("Focus Sentence Highlighter", "Highlight the sentence you're editing"),
    ],
  },
  {
    name: "Grammar & Style",
    tools: [
      mk("Grammar Checker", "Local grammar checking, no upload required"),
      mk("Passive Voice Detector", "Spot passive constructions instantly"),
      mk("Readability Grade Scorer", "Score your text's reading level"),
      mk("Sentence Complexity Analyzer", "Find sentences that need simplifying"),
      mk("Overused Word Finder", "Find words you lean on too often"),
      mk("Cliché Detector", "Catch tired phrases before publishing"),
      mk("Redundancy Finder", "Identify repetitive phrasing"),
      mk("Wordy Phrase Simplifier", "Tighten wordy expressions"),
      mk("Sentence Variety Checker", "Vary sentence rhythm and length"),
      mk("Tone Analyzer", "Detect the tone of your writing"),
      mk("Formality Level Detector", "Measure how formal your text reads"),
      mk("Clarity Score Tool", "Score how clearly your text communicates"),
      mk("Style Guide Adherence Checker", "Check against common style guides"),
      mk("Academic Writing Tone Checker", "Match an academic register"),
    ],
  },
  {
    name: "Spelling & Proofreading",
    tools: [
      mk("Spell Checker", "Catch typos and misspellings"),
      mk("Homophone Confusion Detector", "Spot your/you're, its/it's mix-ups"),
      mk("Punctuation Checker", "Find misplaced punctuation"),
      mk("Apostrophe Error Finder", "Find apostrophe mistakes"),
      mk("Capitalization Checker", "Find capitalization issues"),
      mk("Proper Noun Checker", "Verify proper noun usage"),
      mk("Number Format Checker", "Standardize number formats"),
      mk("Consistent Spelling Checker", "UK vs US spelling consistency"),
    ],
  },
  {
    name: "Paraphrasing & Rewriting",
    tools: [
      mk("Sentence Rewriter", "Rewrite sentences locally"),
      mk("Simplify Text Tool", "Make complex text easier to read"),
      mk("Formality Adjuster", "Dial formality up or down"),
      mk("Technical to Plain Language Converter", "Translate jargon to plain English"),
      mk("Active Voice Converter", "Turn passive sentences active"),
      mk("Headline Rewriter", "Generate sharper headlines"),
      mk("Paragraph Compressor", "Compress long paragraphs"),
      mk("Email to Formal Letter Converter", "Turn casual emails into formal letters"),
      mk("Jargon Remover", "Strip industry jargon"),
      mk("Bullet to Prose Converter", "Convert bullets into flowing prose"),
    ],
  },
  {
    name: "Summarization & Extraction",
    tools: [
      mk("Text Summarizer", "Local ML-based text summarization"),
      mk("Key Points Extractor", "Pull out the key points"),
      mk("TL;DR Generator", "Generate a quick TL;DR"),
      mk("Executive Summary Builder", "Build executive-ready summaries"),
      mk("Bullet Point Extractor", "Convert prose into bullets"),
      mk("Important Sentence Highlighter", "Highlight the most important sentences"),
      mk("Abstract Generator", "Generate research abstracts"),
      mk("Meeting Summary Formatter", "Format meeting notes consistently"),
    ],
  },
  {
    name: "Research & Reference",
    tools: [
      mk("Citation Formatter", "APA, MLA, and Chicago citations"),
      mk("Bibliography Builder", "Build complete bibliographies"),
      mk("Footnote Formatter", "Format footnotes consistently"),
      mk("Endnote Manager", "Manage your endnotes"),
      mk("Reference List Generator", "Generate reference lists fast"),
      mk("In-Text Citation Builder", "Build in-text citations"),
      mk("DOI to Citation Converter", "Convert DOIs to full citations"),
      mk("ISBN Lookup & Formatter", "Look up and format book ISBNs"),
      mk("URL to Citation Tool", "Cite web pages by URL"),
      mk("Academic Journal Reference Formatter", "Format journal references"),
      mk("Legal Citation Formatter", "Format legal citations"),
      mk("Newspaper Article Citation Maker", "Cite newspaper articles"),
    ],
  },
  {
    name: "Templates & Generators",
    tools: [
      mk("Cover Letter Builder", "Build standout cover letters"),
      mk("Resume Writer", "Craft a polished resume"),
      mk("Bio Generator", "Generate short and long bios"),
      mk("About Page Builder", "Build an About page that converts"),
      mk("Author Profile Writer", "Write a strong author profile"),
      mk("Press Release Template", "Press release structure ready to go"),
      mk("Blog Post Outline Builder", "Outline blog posts quickly"),
      mk("Newsletter Template Builder", "Newsletter sections and layouts"),
      mk("Email Template Library", "Reusable email templates"),
      mk("Proposal Template", "Proposal scaffold and sections"),
      mk("RFP Response Builder", "Respond to RFPs methodically"),
      mk("Job Description Writer", "Write clear job descriptions"),
      mk("Product Description Writer", "Sell with concise product copy"),
      mk("FAQ Generator", "Generate FAQ sections"),
      mk("Terms of Service Template", "Editable ToS template"),
      mk("Privacy Policy Template", "Editable privacy policy"),
    ],
  },
  {
    name: "Creative Writing",
    tools: [
      mk("Story Idea Generator", "Spark fresh story ideas"),
      mk("Character Profile Builder", "Build deep character profiles"),
      mk("World Building Template", "Template for rich worlds"),
      mk("Plot Structure Planner", "Hero's Journey & Three-Act"),
      mk("Dialogue Practice Tool", "Practice and refine dialogue"),
      mk("Writing Prompt Generator", "Endless writing prompts"),
      mk("Poetry Form Guide", "Reference guide to poetry forms"),
      mk("Flash Fiction Timer", "Write tight flash fiction"),
      mk("Scene Description Builder", "Build vivid scene descriptions"),
      mk("Conflict & Resolution Planner", "Plan story conflicts"),
      mk("Villain Motivation Builder", "Craft compelling villains"),
      mk("Genre Blender Idea Tool", "Mash up genres for new ideas"),
      mk("First Line Generator", "Magnetic first lines"),
      mk("Ending Generator", "Try out different endings"),
    ],
  },
  {
    name: "Content & Marketing Copy",
    tools: [
      mk("Headline Analyzer", "Score and improve headlines"),
      mk("CTA Button Copy Generator", "High-converting CTA copy"),
      mk("Landing Page Copy Builder", "Build landing page copy fast"),
      mk("Value Proposition Builder", "Clarify your value prop"),
      mk("Tagline Generator", "Generate memorable taglines"),
      mk("Social Post Caption Builder", "Captions for every platform"),
      mk("Email Subject Line Tester", "Test subject line strength"),
      mk("Ad Copy Framework Builder", "AIDA, PAS, and more"),
      mk("Sales Page Copywriting Tool", "Long-form sales page structure"),
      mk("Product Launch Copy Builder", "Launch announcements that pop"),
      mk("Testimonial Formatter", "Format testimonials cleanly"),
      mk("Case Study Template", "Case study scaffold"),
      mk("Brand Voice Guide Builder", "Document your brand voice"),
      mk("Microcopy Library", "Reusable UI microcopy"),
    ],
  },
  {
    name: "Text Analysis & Statistics",
    tools: [
      mk("Word Count Tool", "Count words instantly"),
      mk("Character Count Tool", "Count characters with and without spaces"),
      mk("Reading Time Estimator", "Estimate reading time"),
      mk("Sentence Count Tool", "Count sentences in text"),
      mk("Average Word Length Calculator", "Average word length stats"),
      mk("Vocabulary Richness Scorer", "Measure vocabulary richness"),
      mk("Keyword Density Analyzer", "Analyze keyword density"),
      mk("Flesch-Kincaid Score Calculator", "Compute Flesch-Kincaid"),
      mk("Gunning Fog Index Calculator", "Compute Gunning Fog index"),
      mk("SMOG Index Calculator", "Compute SMOG readability"),
      mk("Lexical Diversity Calculator", "Lexical diversity scoring"),
      mk("Text Fingerprint Analyzer", "Fingerprint a body of text"),
    ],
  },
  {
    name: "Localization & Internationalization",
    tools: [
      mk("Language Detector", "Detect the language of text"),
      mk("Text Translation Previewer", "Preview translated text"),
      mk("Locale Date Formatter", "Format dates by locale"),
      mk("Number Locale Formatter", "Format numbers by locale"),
      mk("RTL Text Tester", "Test right-to-left text"),
      mk("Unicode Text Normalizer", "Normalize Unicode forms"),
      mk("Character Encoding Converter", "Convert character encodings"),
      mk("Bidirectional Text Tester", "Test bidirectional text"),
      mk("Locale-Aware Sort Tool", "Sort with locale awareness"),
      mk("Text Expansion Estimator", "Estimate UI text expansion"),
    ],
  },
  {
    name: "Specialized & Academic",
    tools: [
      mk("Thesis Statement Builder", "Build a clear thesis statement"),
      mk("Argument Mapping Tool", "Map arguments and warrants"),
      mk("Counterargument Generator", "Generate counterarguments"),
      mk("Logical Fallacy Detector", "Detect common logical fallacies"),
      mk("Debate Script Formatter", "Format debate scripts"),
      mk("Scientific Abstract Builder", "Structure scientific abstracts"),
      mk("IRB Consent Form Template", "IRB consent form template"),
      mk("Survey Question Builder", "Build solid survey questions"),
      mk("Literature Review Organizer", "Organize literature reviews"),
      mk("Academic Paper Section Planner", "Plan paper sections"),
      mk("Peer Review Checklist", "Peer review checklist"),
      mk("Grant Proposal Outline", "Outline grant proposals"),
      mk("Technical Report Template", "Technical report template"),
      mk("Style Consistency Enforcer", "Enforce style consistency"),
      mk("Plagiarism Self-Check Prep Tool", "Prep text for plagiarism check"),
      mk("Writing Portfolio Builder", "Build a writing portfolio"),
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
