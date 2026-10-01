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
    keywords: ["jargon remover", "plain language", "documented list"],
    intro:
      "The jargon remover replaces the 145 jargon terms on its documented list with a plain-language equivalent, lists every substitution with a note on when it fits, and leaves anything the list does not carry exactly as written.",
    content: `Jargon is usually not one word but a habit, and the honest way to remove a habit is a list you can read. This jargon remover ships a documented list of 145 terms drawn from four registers — workplace and corporate, technical, academic and legal, and marketing — each with a plain-language equivalent and a note explaining when the replacement fits and when the original is the better word. The list lives in the source as data, is counted on the page, and is covered by unit tests, so the claim about its size is checkable rather than rhetorical.

Matching follows the shared phrase engine, and the rules are simple enough to predict. A term is matched as a whole phrase, case-insensitively, with the longest entry winning where two could overlap, and overlapping matches dropped. That means leverage becomes use, synergy becomes cooperation, ideate becomes brainstorm, reach out becomes contact, and a term the list does not carry is never touched. Nothing is inferred: the tool does not decide that a sentence is too technical, does not measure reading level, and does not rewrite in plain language beyond substituting the entry it found. Where a substitution begins a sentence, the replacement is capitalised so the result still reads correctly.

Every change is listed before the output, with three columns: the term found, the plain alternative, and the note on when that alternative fits. That third column is the point of the tool. Robust is a precise word in statistics; idempotent is a precise word in computing; deprecated is a precise word in an API changelog; stipulate is a precise word in a contract. Each of those entries carries a note saying so, and the enforcer will happily report a substitution that you should decline. Word counts before and after are shown beside the list, so the size of the change is visible as well as its content.

Why a fixed list instead of a model? Because a fixed list can be audited. There is no training data, no network request, no probability and no drift between runs: the same input produces the same substitutions every time, and every one of them can be traced to a numbered entry in a file that ships with the tool. The trade-off is equally clear. A curated list is a snapshot of the jargon one team noticed, not a dictionary of everything a field says. Terms that arrived last year, internal project names, and vocabulary specific to your industry will pass through untouched — the tool cannot flag what it does not contain.

The other honest limitation is context. The matcher sees words, not sentences: it cannot tell that ten plays a different role in each of two paragraphs, that a phrase is inside a quotation and belongs to someone else, or that a technical audience needs the exact term. That is why the output is presented as a draft with a change log rather than as a corrected document, and why the notes tell you when to keep the original. The tool never edits your text in place; you copy what you want.

Used well, it is a fast pass over marketing copy, internal documents and anything that has accumulated vocabulary from a dozen meetings. Paste the text, read the change table from the top, accept the substitutions that improve the sentence, and keep the ones that carry a precise meaning. The full rewritten draft is available to copy or download if you want to read it as prose rather than as a diff.

Everything runs in this browser. Your text never leaves the device, nothing is stored between visits, and the list itself is loaded as part of the page.`,
    howTo: [
      { step: "Paste the text; the tool matches it against the full published list as you type." },
      { step: "Read the change table, starting with the terms that appear most often." },
      { step: "Check the note for each entry — several terms are precise in some contexts and vague in others." },
      { step: "Compare the word counts before and after to see how much the text actually shrank." },
      { step: "Copy or download the plain-language draft, then read it through before using it." },
    ],
    whenToUse: `Use this remover on drafts that have drifted into workplace or marketing vocabulary, and use its neighbours for the overlapping questions. The {{wordy-phrase-simplifier|Wordy Phrase Simplifier}} targets padding and circumlocution rather than jargon, and the {{cliche-detector|Cliché Detector}} catches stock phrases that have lost their force.\\n\\nWhen the problem is a phrase the audience will not know rather than a word you want plainer, the {{readability-grade-scorer|Readability Grade Scorer}} measures how hard the text is overall, and the {{style-guide-adherence-checker|Style Guide Adherence Checker}} tests the copy against a named guide.`,
    faqs: [
      {
        q: "How many terms does the jargon remover know?",
        a: "145, all documented in the tool's lexicon with a plain alternative and a note. The page states the count from the list itself rather than hardcoding it, and unit tests fail if two entries collide or an entry loses its note or replacement.",
      },
      {
        q: "Does the tool understand my sentence?",
        a: "No. It matches whole phrases against a fixed list, longest first, case-insensitively, and drops overlapping matches. It does not parse grammar, judge tone or measure whether the sentence became clearer — the change table and the visible notes are the whole of its reasoning.",
      },
      {
        q: "Why did it suggest replacing a word that is correct in my field?",
        a: "Because the list deliberately includes terms that are precise in one context and vague in another — robust, deprecated, idempotent, stipulate. Each of those entries says so in its note, and the substitution is a proposal you can decline. The tool never edits your text in place.",
      },
      {
        q: "Why is my industry's jargon not flagged?",
        a: "Because a curated list is a snapshot, not a dictionary. Internal project names, new coinages and field-specific vocabulary that the 145 entries do not contain will pass through untouched. The list is the tool's entire vocabulary, which is what makes every finding auditable.",
      },
      {
        q: "What happens to words the list does not contain?",
        a: "They are returned exactly as written. There is no fallback rule, no model and no generic simplification pass, so a text with no listed terms comes back byte-identical and the tool says that no listed terms were found rather than implying the writing is plain.",
      },
    ],
  },

  "style-consistency-enforcer": {
    keywords: ["style consistency enforcer", "style consistency", "mixed conventions"],
    intro:
      "The style consistency enforcer compares a document with itself across eight mechanical families — quotation marks, dashes, ellipses, serial commas, list punctuation, numbers below ten, heading case and date order — and reports mixed conventions instead of the writing.",
    content: `Consistency is a different question from correctness. A document can use straight quotation marks or curly ones and be right either way, but a document that uses both looks assembled from two sources. The style consistency enforcer exists for that question: across eight mechanical families it counts what the document does, names the dominant convention, and lists the places that depart from it, so mixed conventions show up as counts rather than impressions. It applies no style guide and states no preference — a consistent document needs no action at all, whichever convention it chose.

The families and their methods are published on the page. Double quotation marks are counted as straight against curly. Dashes are counted four ways: the em dash, the en dash, a doubled hyphen and a spaced hyphen. Ellipses are counted as three periods against the single ellipsis character. Serial commas are matched as two patterns, a comma before the conjunction in a list and a two-comma list without one. List punctuation looks at single-line bullet and numbered items and whether each ends with terminal punctuation. Numbers below ten compare bare figures 2 to 9 with the words two to nine, excluding percent, currency, units, decimals, times, years, ordinals and the ambiguous one and zero. Heading capitalisation classifies short standalone lines as sentence case, title case or all caps. Date order counts named-month and numeric dates in month-first, day-first and ISO form.

Verdicts are deliberately modest. A family with occurrences of one variant is consistent; a family with two or more is mixed; a family with no matching text is reported as having no evidence, which is not the same as passing. When two variants tie, there is no dominant convention, so every occurrence becomes a deviation rather than an arbitrary winner being chosen. Deviations are listed in document order with a context snippet, capped so a very long document does not produce an unreadable wall, and the full report includes every family's counts and method for copying or download.

The limits matter because patterns are not parses. A serial-comma pattern inside a quotation still counts, because the tool does not track quotation boundaries. List punctuation judges one line at a time, so a multi-line item is not understood. A numeric date whose day and month are both 12 or smaller cannot be assigned an order and is reported separately as ambiguous instead of being guessed. Heading detection relies on length, position and the absence of terminal punctuation, so a short standalone sentence can be mistaken for a heading. And the enforcer says nothing about spelling, grammar, US and UK variants or register — those questions belong to other tools.

In practice it fits the moment before formatting or publication. Paste the whole document rather than one section, because a convention can only drift across a boundary, read the mixed families first, then open the deviations list and decide case by case whether the departure was intentional. Re-run after editing: once a family drops to one variant it stops being mixed and leaves the report. Nothing is rewritten — the tool reports, and you choose whether the document should follow its own majority or an external style guide.

Everything runs locally in the browser. No part of the text is uploaded, no guide or dictionary is downloaded, and nothing is stored after the tab closes.`,
    howTo: [
      { step: "Paste the whole document, headings, lists and prose included — a convention can only drift across a section boundary." },
      { step: "Read the mixed-families count first; zero means nothing needs doing." },
      { step: "Open the family table to see which variants were found, how many of each, and the method used." },
      { step: "Work through the deviations list and decide case by case whether each departure was deliberate." },
      { step: "Re-run after editing, then copy or download the report for a co-author or editor." },
    ],
    whenToUse: `Use this enforcer when a document has been through several hands and needs its own conventions to agree. When the question is which convention a named guide requires, the {{style-guide-adherence-checker|Style Guide Adherence Checker}} measures the text against a published preset, and when the drift is between US and UK spellings specifically, the {{consistent-spelling-checker|Consistent Spelling Checker}} covers that family of variants with 95 documented pairs.\\n\\nFor the mechanical marks themselves, the {{punctuation-checker|Punctuation Checker}} and the {{apostrophe-error-finder|Apostrophe Error Finder}} check placement and pairing rather than consistency.`,
    faqs: [
      {
        q: "Which conventions does the enforcer compare?",
        a: "Eight families: double quotation marks (straight against curly), dashes (em, en, doubled hyphen, spaced hyphen), ellipses (three periods against the single character), serial commas, list-item punctuation, numbers below ten, heading capitalisation and date order.",
      },
      {
        q: "Does it tell me which convention is correct?",
        a: "No. It reports which convention the document uses most and where it departs from it. Both straight and curly quotation marks are correct English; the problem the tool finds is a document that uses both. No style guide is applied, and no preference is stated anywhere.",
      },
      {
        q: "What does 'no evidence' mean for a family?",
        a: "That the document contains nothing that family can compare — for example, no ellipsis at all. It is not a pass. The tool separates consistent families from empty ones so a clean-looking result cannot hide the fact that a check had nothing to work with.",
      },
      {
        q: "Why was my 03/05/2026 date not counted?",
        a: "Because neither part is above 12, so the order cannot be known from the characters alone — it could be 3 May or 5 March depending on where the writer lives. Those dates are counted separately as ambiguous rather than being forced into month-first or day-first.",
      },
      {
        q: "Can it fix the inconsistencies automatically?",
        a: "No. It lists the deviations with a snippet for each one and leaves the text untouched. Choosing between a document's own majority convention and a publication's house style is an editorial decision, and the report gives you the counts to make it with.",
      },
    ],
  },
};
