import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B8, consistency group: authored SEO entries for the jargon remover and
 * the style consistency enforcer. Both tools compare or transform a text with
 * mechanical, published rules, and both pages state the limits of that approach.
 * Keys are registry slugs; see ../tool-seo.ts for the contract these entries are
 * validated against.
 */
export const B8_CONSISTENCY_SEO: Record<string, ToolSeo> = {
  "jargon-remover": {
    keywords: [
      "jargon remover",
      "curated term list",
      "plain equivalent",
      "when it fits",
    ],
    intro:
      "The Jargon Remover substitutes terms from a curated list of 145 workplace, technical, academic and marketing entries, each with a note on when the plain alternative fits.",
    content:
      "Some jargon is just padding and some is the correct technical term in the right context — a statistical model really is robust, an API really can be deprecated. This jargon remover works from a curated term list of 145 fixed, published entries, each with a plain equivalent, and every note says when the plain alternative fits and when the original is the right word.\n\n- 145 curated entries across workplace and corporate, technical, academic and marketing vocabulary, with a note on when it fits on every one.\n- Each entry carries a plain alternative and a note explaining when the plain word fits.\n- Matching follows the shared phrase engine: whole phrases only, longest first, overlaps dropped, case-insensitive, with the source spelling preserved.\n- The plain-language draft is shown beside the original, with a term-by-term list of every change and its reason.\n- A no-listed-terms state when nothing matched, rather than an empty table.\n- Copy report and result, or download the result.\n\nThere is no model, no meaning analysis and no network call here, which is exactly why the tool can be trusted on a document that should not leave the browser. A term that is not on the list is never touched, so the output's difference from the input is always explainable by the table. That property is worth more than coverage: a reviewer can point at any changed word and name the entry that changed it, and a word that did not change is a word the list does not contain. The note per entry is the part that respects the writer's judgement: because the same list has to serve a support article and a research abstract, every substitution carries its own caveat, and the change list puts the caveat next to the change. The remover proposes; the writer decides.\n\n- A term outside the 145 entries is left exactly as written.\n- Some listed terms are correct in their domain, which is what the notes are for.\n- Substituting a term can change a sentence's precision, so the change list is the place to review it.\n- The list mixes domains; a marketing term is unlikely to appear in a research paper, and vice versa.\n- The tool replaces terms, not arguments: a jargon-heavy paragraph stays structurally heavy.\n- Because the list is fixed, two people using the tool on the same draft get the same substitutions, which makes a review comment about jargon reproducible.\n- The reason column is the audit trail: a substitution can be justified to an editor without opening the tool again.\n- Every substitution is reversible by hand, because the change list names the term it replaced.\n- The list spans four domains, so a term common in one document type may simply never appear in another.\n\nUse it when a document has to be read outside the team that wrote it. Read the change list with its notes rather than the draft alone, keep the substitutions whose note says they fit, and leave the ones where the technical term was doing real work, because the note says when the original is the right word. The report and the result are copied together so the changes can be justified to an editor: a substitution with its reason attached is a suggestion; without one it is just a different word.",
    howTo: [
      { step: "Paste a draft; terms on the documented list are replaced with the plain equivalent as you type." },
      { step: "Read the count of listed terms replaced." },
      { step: "Work through Every change, with the reason, and check each note against the context." },
      { step: "Copy the report and result, or download the plain-language draft." },
    ],
    whenToUse:
      "Use the remover when the vocabulary is the barrier and you want each substitution justified. When the text is technical documentation with acronyms to expand as well, the {{technical-to-plain-language-converter|Technical to Plain Language Converter}} adds an abbreviation table and a leftovers panel.\n\nWhen the problem is general wordiness rather than jargon, the {{simplify-text-tool|Simplify Text Tool}} replaces published wordy phrases, and when the register itself is wrong, the {{formality-adjuster|Formality Adjuster}} shifts the paired expressions.",
    faqs: [
      {
        q: "How many terms are on the list?",
        a: "145, covering workplace and corporate vocabulary, technical terms, academic phrasing and marketing language. Each entry pairs a term with a plain alternative and a note on when that alternative fits.",
      },
      {
        q: "Why would I keep a jargon word?",
        a: "Because some of them are precise. A statistical model can genuinely be robust and an API can genuinely be deprecated; the note on each entry says when the plain word fits and when the original is the right one.",
      },
      {
        q: "Is anything analysed or uploaded?",
        a: "No. The list is fixed and published, there is no model and no network call, and the matching runs in the page. A draft that cannot leave the browser can be pasted safely.",
      },
      {
        q: "What if my text has no listed terms?",
        a: "The page says so rather than showing an empty table. A clean result means none of the 145 listed terms appeared, not that the text is jargon-free by some other standard.",
      },
      {
        q: "How are longer phrases handled?",
        a: "The shared phrase engine matches whole phrases and prefers the longest match, dropping overlaps and preserving the source spelling. A phrase inside a longer matched phrase is never partly replaced.",
      },
    ],
  },

  "style-consistency-enforcer": {
    keywords: [
      "style consistency enforcer",
      "serial comma",
      "dash style",
      "variants",
    ],
    intro:
      "The Style Consistency Enforcer reads a document for the mechanical style choices — quote marks, dashes, ellipses, the serial comma, numbers, heading case — and reports every variant it finds.",
    content:
      "A document with two styles of dash has two authors, and this style consistency enforcer finds them. Paste the text and the tool scans the mechanical choices a style sheet governs: quote marks, dash style, ellipsis style, the serial comma, list punctuation, number style, heading case and date order; each dimension is reported with the variants it found, where they occur, and a consistency verdict per dimension, so the edit list is specific instead of a mood.\n\nThe input panel takes the text. The report panel lists the dimensions with their variant counts — every dimension that appears in more than one style is named, with the count of each variant — and the summary line states the overall verdict: consistent, or the number of dimensions at war. Scope and limits says the enforcer detects variants; it does not know which style your style sheet picked.\n\n- Eight dimensions: quote marks, dashes, ellipses, serial comma, list punctuation, numbers, heading case, date order.\n- Variant counts per dimension, so the majority style is visible.\n- Locations for each variant, so the fixes point somewhere.\n- Verdict per dimension and one for the whole document.\n- Output: a report you can paste beside the edit pass.\n\nThe detection is pattern work per dimension: dash patterns distinguish the em dash, en dash and hyphen habits, the serial comma test looks at lists that end with a conjunction, the number test separates digits from spelled-out forms, and the date test reads the order of day, month and year. The same text always produces the same report, which makes the tool usable as a pre-flight before submission. Paste one chapter at a time if the document is long, because the verdict is only as meaningful as the sample it judged.\n\n- The enforcer reports variants; choosing the house style is your call.\n- Rare dimensions — one dash in a document — cannot show a majority.\n- Heading case is read from the literal headings, not your template.\n- The scan is mechanical; a style sheet's exceptions pass as variants.\n- Nothing is stored, so copy the report before closing the page.\n\nKeep the finished report beside the style sheet and mark the dimensions the sheet does not name, because those are the rules your house style has been following by accident. Fix the dimensions with a clear majority first — keep the majority style, change the outliers — because those edits are mechanical and safe. Then judge the split dimensions by hand: a document that genuinely uses both number styles may be obeying a rule the scanner cannot see, such as digits for measurements and words for counts. Run the enforcer after the edit pass as well: the verdict-per-dimension report is the receipt, and a document that passes all eight dimensions is one a copy-editor will start reading with trust instead of a red pen. Keep the report beside the style sheet — the dimensions the sheet does not mention are the ones to add, and the scanner has just written their case.\n\nThe neighbours finish the surface: the style guide adherence checker tests the deeper rules a style sheet names, the manuscript formatter shapes the document for submission, and the punctuation checker cleans the marks the scanner treats as data. The redundancy finder in this domain cuts the words no style sheet defends.",
    howTo: [
      { step: "Paste the document into the input panel." },
      { step: "Read the dimensions with their variant counts and locations." },
      { step: "Fix the majority-style outliers first." },
      { step: "Re-run the scan until every dimension passes." },
    ],
    whenToUse:
      "Use the style consistency enforcer before submission, when the document has had several hands on it. The {{style-guide-adherence-checker|Style Guide Adherence Checker}} tests the rules a written style sheet names, and the {{manuscript-formatter|Manuscript Formatter}} shapes the file for the venue. When the marks themselves need cleaning, the punctuation checker in this domain handles it, and the redundancy finder cuts the slack.",
    faqs: [
      {
        q: "What are the eight dimensions?",
        a: "Quote marks, dash style, ellipsis style, the serial comma, list punctuation, number style, heading case and date order. They are the mechanical choices a style sheet governs and multi-author documents disagree about.",
      },
      {
        q: "Why does the tool not pick the correct style?",
        a: "Because which style is correct is your style sheet's decision, not the scanner's. It reports the variants and their counts so the majority is visible and the choice is one decision instead of a hunt.",
      },
      {
        q: "What does a split dimension mean?",
        a: "That the document genuinely uses two styles for one choice — or that it obeys an exception rule the scanner cannot see, like digits for measurements and words for counts. The locations tell you which case you are in.",
      },
      {
        q: "Can it scan a whole book?",
        a: "It scans what you paste, and the patterns are cheap to run; paste per chapter if the document is large. The report is per paste, so chapter-level consistency is what it certifies.",
      },
      {
        q: "Is my document uploaded?",
        a: "No. The scan runs in the page from the text you pasted, and nothing is stored or transmitted; the report is gone when the tab closes unless you copied it.",
      },
    ],
  },
};
