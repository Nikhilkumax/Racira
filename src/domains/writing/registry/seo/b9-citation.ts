import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B9, citation group: the authored SEO entry for the citation formatter.
 * The entry states the four editions implemented, the fields it needs and the
 * limit that it looks nothing up. Keys are registry slugs; see ../tool-seo.ts
 * for the contract these entries are validated against.
 */
export const B9_CITATION_SEO: Record<string, ToolSeo> = {
  "citation-formatter": {
    keywords: [
      "citation formatter",
      "APA 7",
      "MLA 9",
      "Bluebook 21",
    ],
    intro:
      "The citation formatter turns typed source metadata into APA 7, MLA 9, Chicago 17 or Bluebook 21 entries, with legal sources Bluebook-only and every simplification printed rather than hidden.",
    content:
      "This citation formatter is a typed-metadata engine: you enter the fields a source actually has — authors, year, title, container, volume, issue, pages, publisher, place, edition, DOI, URL, accessed — and it prints the entry in the style you chose. Nothing is scraped, resolved or guessed: there is no DOI lookup and no network call, so every output is a function of what you typed. The fields each style uses are the fields you fill; the ones a style ignores are ignored silently by design.\n\n- Eight source types: book, chapter in an edited book, journal article, newspaper article, web page, report, court case and statute.\n- Four styles: APA 7th edition (2020), MLA 9th edition (2021), Chicago 17th edition notes-bibliography (2017) and Bluebook 21st edition (2020).\n- Legal material is Bluebook only: the page says so rather than offering styles that would produce an empty entry, and case and statute citations carry no authors.\n- Authors are entered one per line as Family, Given; an organisational author can be marked literal so its name is printed as written with no inversion.\n- Page ranges use the style's own dash: an en dash for APA and Chicago, a hyphen for MLA.\n- An italics option wraps italicised elements in underscores for plain-text workflows; plain output is the default.\n- Fill a worked example fills every field for the selected source type, which is the fastest way to see the engine's shape before using your own material.\n- An author can be a person or an organisation: the literal flag prints a corporate name as written, which is how organisational authors avoid inversion.\n\nThe style rules are published rather than hidden. APA lists up to 20 authors; MLA switches to et al. from three; Chicago lists up to three and uses et al. beyond that; Bluebook case citations carry no authors at all. Titles are printed exactly as entered, because correct title capitalisation depends on the style, the language and proper nouns, and a machine that rewrites them would be guessing. Warnings name the fields a chosen style expects but the entry does not have, which is the honest form of help: the engine cannot know whether a source is real, but it can know which parts are missing. The same warning list is what makes the tool usable without a lookup: a missing container title is reported, while a plausible but wrong year cannot be.\n\n- No lookup: a DOI or ISBN is never resolved, so a mistyped year or page range is printed exactly as typed.\n- Title capitalisation is not adjusted in any style.\n- Bluebook support covers the case and statute patterns implemented here, not the whole rule set.\n- Warnings identify missing fields; they cannot tell a correct citation from an incorrect one.\n- Italics are markers, not rich text: the output stays plain so it can be pasted anywhere.\n\nUse the formatter when you have the source in front of you and one entry to produce. Fill the fields in the order they appear, read the warnings before copying, and check the entry against the manual's own worked example for the style you are using — that last step is what a lookup-free tool is for. If the entry and the example disagree on punctuation, trust the example: the engine's simplifications are the same ones printed on the page, and a manual is the only authority both of you answer to.",
    howTo: [
      { step: "Choose a source type; the field set changes with it, and legal types switch the style list to Bluebook." },
      { step: "Choose a citation style, or use Fill a worked example to see one first." },
      { step: "Enter authors one per line as Family, Given, then fill the remaining fields." },
      { step: "Read the warnings, then copy or download the entry." },
    ],
    whenToUse:
      "Use the formatter for one entry at a time and for legal material, where it is the only tool here that offers Bluebook 21. When the job is a whole source list in a chosen order, the {{bibliography-builder|Bibliography Builder}} renders the same engine as a sorted or numbered bibliography.\n\nWhen the question is how a source appears inside a sentence rather than in a list, the {{in-text-citation-builder|In-Text Citation Builder}} shows all four styles side by side, and for briefs the {{legal-citation-formatter|Legal Citation Formatter}} adds signals and short forms around the Bluebook output.",
    faqs: [
      {
        q: "Does the formatter look anything up?",
        a: "No. There is no DOI resolver, no ISBN lookup and no network call anywhere in the engine. Every character of the output comes from the fields you typed, which is why the page can promise that nothing leaves the browser.",
      },
      {
        q: "Which styles are available for a court case?",
        a: "Bluebook 21 only. The other styles' legal-citation rules are not implemented here, and offering them would produce an empty entry, so the style list narrows to Bluebook when you choose a case or statute.",
      },
      {
        q: "Why are my title's capital letters unchanged?",
        a: "Because correct title capitalisation depends on the style, the language and which words are proper nouns. The engine prints titles as entered rather than applying a guessed rule; the page states this rather than hiding it.",
      },
      {
        q: "How many authors does each style list?",
        a: "APA lists up to 20 before shortening, MLA uses et al. from three authors, Chicago lists up to three and uses et al. beyond that, and Bluebook case citations carry no authors. The limits are part of the published rules.",
      },
      {
        q: "What do the warnings mean?",
        a: "They name fields the chosen style expects but the entry does not have — a missing container title, for example. They are prompts to check, not verdicts: the engine cannot know whether a citation is substantively right.",
      },
    ],
  },
};
