import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B9, citation group: the authored SEO entry for the citation formatter.
 * The entry states the four editions implemented, the fields it needs and the
 * limit that it looks nothing up. Keys are registry slugs; see ../tool-seo.ts
 * for the contract these entries are validated against.
 */
export const B9_CITATION_SEO: Record<string, ToolSeo> = {
  "citation-formatter": {
    keywords: ["citation formatter", "APA 7", "MLA 9", "Chicago", "Bluebook"],
    intro:
      "The citation formatter turns typed metadata into one formatted entry in APA 7th edition, MLA 9th edition, Chicago 17th edition notes-bibliography or Bluebook 21st edition for cases and statutes — with the in-text and note forms beside it.",
    content: `A citation formatter has one job that can be done honestly without a network: put the fields you typed into the order and punctuation a style manual specifies. This citation formatter does exactly that for four editions, named on the page so there is no doubt which rules are in force: APA 7th edition (2020), MLA 9th edition (2021), Chicago 17th edition notes-bibliography (2017) and Bluebook 21st edition (2020) for case and statute patterns. It does not search for a DOI, resolve an ISBN, or guess missing data. The bibliography entry, the in-text form and, where the style uses notes, the footnote form are each printed and can be copied separately.

Eight source types are covered: book, chapter in an edited book, journal article, newspaper article, web page, report, court case and statute. Choosing a type narrows the style list — Bluebook is the only style offered for legal material, and it is withheld for everything else, where its rules do not apply, with the reason printed in place of an entry. Authors are entered one per line as Family, Given; an organisation written without a comma is kept as written, which is how a corporate author is handled in all four styles. The author-count rules implemented are documented: APA lists the authors with an ampersand, MLA uses et al. from three authors, Chicago lists up to three and uses et al. beyond, and Bluebook case citations carry no authors at all.

The engine prints titles exactly as entered. That is deliberate. APA wants sentence case for titles, MLA and Chicago want headline style, and the correct result depends on the language, on proper nouns and on the writer's knowledge of the work — a rule that lowercased the first letter of every word would mangle names of people and places. The page tells you to supply the title in the casing your style requires, and the italic elements are left plain unless you switch on underscore markers, so the output stays copyable text.

Page ranges use each style's own dash: an en dash for APA and Chicago, a hyphen for MLA. Journal entries carry volume, issue and page ranges in the style's punctuation, with a DOI rendered as a full https://doi.org/ link or a URL if no DOI was given. Web and newspaper entries accept a full date and an accessed date, both printed as entered, because date order conventions differ by style and by locale.

Missing fields produce warnings rather than invented text: no year prints n.d. where the style has a slot for it, no publisher is flagged for the source types that require one, and a web entry without a URL is called out. Nothing is silently fabricated. Bluebook support is scoped to the case and statute forms implemented here and nothing on the page is legal advice; the full rule set has provisions for signals, short forms and tables of authorities that a single-entry formatter cannot cover.

Everything happens in the browser. There is no account, no upload, no DOI resolver, no ISBN lookup and no storage: your fields exist on screen and in whatever you copy or download, and the tab closing takes them with it. The formatted entry is a function of the fields alone, so the same input always produces the same output, which is what makes it possible to check an entry against the manual's own worked example.`,
    howTo: [
      { step: "Choose the source type and the style; the field set and the style list change with the type." },
      { step: "Enter authors one per line as Family, Given; write an organisation without a comma to keep it as-is." },
      { step: "Fill the fields you have, including edition, volume, issue, pages, DOI, URL and pinpoint page." },
      { step: "Read the bibliography entry, the in-text or note form and any warnings about missing fields." },
      { step: "Copy the entry and check it against the manual; the tool formats, it does not verify." },
    ],
    whenToUse: `Use this formatter when you have the source details in front of you and need the entry in one specific style. When the citations are footnotes in a longer document, the {{footnote-formatter|Footnote Formatter}} handles the note numbering and layout around them, and when the surrounding prose needs to sound academic, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} measures that register.\\n\\nWhen the same source has to appear in several styles, format it here once per style and keep the outputs side by side; there is no cross-style converter, and the page states that rather than implying one.`,
    faqs: [
      {
        q: "Which editions does the formatter implement?",
        a: "APA 7th edition (2020), MLA 9th edition (2021), Chicago 17th edition notes-bibliography (2017) and Bluebook 21st edition (2020). Cases and statutes offer Bluebook only: the other styles' legal rules are not implemented here, so they are withheld rather than printing an empty entry.",
      },
      {
        q: "Does it look up a DOI or an ISBN?",
        a: "No. There is no resolver and no network call anywhere in the tool. DOI and URL are fields you paste in; the formatter styles them. That means an entry is exactly the data you supplied, which is what makes the output checkable rather than merely plausible.",
      },
      {
        q: "Why does the title come out with the capitalisation I typed?",
        a: "Because the correct casing depends on the style, the language and proper nouns. APA wants sentence case, MLA and Chicago want headline style, and a mechanical rule would corrupt names. Enter the title in the casing your style requires; the formatter handles order, punctuation and italics.",
      },
      {
        q: "Can I put the italics into a document?",
        a: "The default output is plain text. An underscore option wraps exactly the elements your style italicises — book and journal titles, case names — so you can either apply italics by hand in your word processor or keep the distinction in plain text.",
      },
      {
        q: "Is the Bluebook output enough for a legal brief?",
        a: "No, and the page says so. It covers the case and statute patterns implemented here, not signals, short-form rules, tables of authorities or jurisdiction variations, and nothing it produces is legal advice. Check each citation against the current edition before filing.",
      },
    ],
  },
};
