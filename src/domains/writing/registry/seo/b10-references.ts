import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B10, reference group: the authored SEO entry for each of the five
 * tools built on the citation engine's reference-list layer — the bibliography
 * builder, endnote manager, reference list generator, in-text citation builder
 * and academic journal reference formatter.
 *
 * Every entry states the four editions actually implemented (APA 7, MLA 9,
 * Chicago 17, Bluebook 21 for cases and statutes), the history-free nature of
 * the tools (no lookup, no network, no account) and the limit that they format
 * the fields you supply rather than verifying them. Keys are registry slugs;
 * see ../tool-seo.ts for the contract these entries are validated against.
 */
export const B10_REFERENCES_SEO: Record<string, ToolSeo> = {
  "bibliography-builder": {
    keywords: ["bibliography builder", "bibliography", "works cited", "source list", "APA 7"],
    intro:
      "The bibliography builder keeps an editable source list in your browser and formats the whole list as one bibliography in APA 7, MLA 9 or Chicago 17 — alphabetised or numbered, exported as JSON and imported back.",
    content: `The bibliography builder is for the case where the sources are already gathered and the work is to hold the list together and print it. You add a source, fill in its fields, and the bibliography at the bottom of the page rebuilds as you type. The source list is kept in your browser, so a refresh does not lose it, and it can be exported as JSON and imported back on another machine. There is no account, no lookup service and no storage anywhere but your device.

Every source in the list is edited in the same form, so a book, a chapter, a journal article and a web page each ask for the fields their type needs and no others. Authors go in one per line as Family, Given; an organisation written without a comma is kept exactly as written, which is how a corporate author survives every style. Entries can be reordered with the arrows, duplicated when one source is cited twice under different details, and removed when they do not belong in this list.

The bibliography is produced by the same citation engine that powers the citation formatter, which means the styles are the editions actually implemented: APA 7th edition, MLA 9th edition and Chicago 17th edition notes-bibliography. Bluebook is deliberately not offered, because Bluebook has no bibliography — legal material lives in a table of authorities, and the page says so rather than printing a list the manual does not define.

Order is your choice. Alphabetical by author is the default and matches an APA reference list or a Chicago bibliography; numbered in the order entered suits a works cited that follows the prose. Neither order is stored, so switching between them never leaves a stale number behind. Missing titles are counted and called out, because every style requires a title and a silently empty slot is worse than a visible gap.

The export is plain JSON of the fields you typed, so the list moves between browsers without a server. The import validates every entry — source type, title string, author shape — and reports the first problem it finds rather than dropping an entry on the floor. A reference manager that loses data is worse than no reference manager, so the importer refuses malformed input instead of guessing at it.

What the tool does not do matters as much as what it does. It does not search for a DOI, resolve an ISBN, fetch a web page's title or check that a page range exists. It formats the values you supply in the order and punctuation the selected edition requires. Whether a source belongs in the bibliography at all, how a translator or an editor is credited, and how a work with no author is alphabetised are editorial decisions the style manual explains in prose; the page points at the manual rather than inventing a rule.

Because the output is a pure function of the fields, the same source list always prints the same bibliography, which is what makes it possible to check an entry against the manual's own worked example. Nothing is uploaded, nothing is looked up and nothing is stored beyond your browser. If you need the entry rather than the list, the citation formatter shows the bibliography, in-text and note forms of a single source side by side.`,
    howTo: [
      { step: "Add a source and pick its type; the form asks only for the fields that type needs." },
      { step: "Enter authors one per line as Family, Given; write an organisation without a comma to keep it as-is." },
      { step: "Fill the fields you have and watch the bibliography rebuild; reorder or duplicate entries as needed." },
      { step: "Choose alphabetical or numbered order and pick APA 7, MLA 9 or Chicago 17." },
      { step: "Copy or download the bibliography, or export the list as JSON to move it to another browser." },
    ],
    whenToUse: `Use the bibliography builder when several sources have to come out as one formatted list and you want the list to survive a refresh. When you need matching in-text markers as well, the {{reference-list-generator|Reference List Generator}} prints the list beside each marker, and for a single entry the {{citation-formatter|Citation Formatter}} shows every form of one source at once.

It is also the right place to assemble a works cited before you start citing. Export the JSON once the list is right, import it into any browser, and the same sources are ready whenever you write; there is no cross-device sync and the page states that rather than implying a service behind it.`,
    faqs: [
      {
        q: "Does the bibliography builder look up a DOI or an ISBN?",
        a: "No. There is no resolver and no network call anywhere in the tool. DOI, URL, publisher and page range are fields you type; the builder styles them. That is what makes the output checkable rather than merely plausible.",
      },
      {
        q: "Where is my source list stored?",
        a: "In this browser only. It is kept in local storage so a refresh does not lose it, and the JSON export and import are how it moves to another browser or machine. Nothing is uploaded and there is no account.",
      },
      {
        q: "Why is Bluebook not in the bibliography style list?",
        a: "Because Bluebook has no bibliography. Legal sources are gathered in a table of authorities, which orders and punctuates them differently, so offering Bluebook here would print a list the manual does not define. Use the citation formatter's Bluebook style for cases and statutes.",
      },
      {
        q: "What happens if a source has no title?",
        a: "The entry is printed with an empty title so the gap is visible, and the missing titles are counted above the list. A silently blank slot would hide a required field, so the builder flags it instead.",
      },
      {
        q: "Can I put the finished bibliography into a word processor?",
        a: "Yes. Copy the formatted list or download it as a plain text file, then paste it into your document. The default output is plain text, so you apply italics to the elements your style italicises, exactly as the manual directs.",
      },
    ],
  },

  "endnote-manager": {
    keywords: ["endnote manager", "endnotes", "numbered notes", "Chicago 17", "Bluebook"],
    intro:
      "The endnote manager numbers a list of sources in the order you arrange them, printing Chicago 17 and Bluebook in note form and APA 7 and MLA 9 as the reference entry those styles actually number.",
    content: `An endnote manager has to be honest about one thing above all: not every style has notes. The endnote manager keeps a list of sources, lets you reorder them, and prints each one with its number — but it uses each style's own device. Chicago 17th edition and Bluebook 21st edition have a note form, so those produce a true numbered endnote with the note's "See" signal. APA 7th edition and MLA 9th edition number references rather than notes, so with those styles each endnote is the full reference entry and the page says so in place, instead of pretending a note device that the manuals do not define.

Each source is edited in the shared entry form, so the fields match the ones the citation formatter asks for: authors one per line as Family, Given, a title in the casing your style requires, and whatever else the type needs — container, publisher, volume, issue, pages, DOI, URL, court, reporter, section. An organisation written without a comma is kept as written, which is how a corporate author is handled. Sources with neither a title nor an author are skipped in the output rather than printed as empty notes, but the list keeps them so nothing is lost while you fill them in.

Numbering follows the order on the page. Moving a note changes every number after it, which is exactly what an endnote section does when a paragraph is inserted or removed. Nothing about the numbering is stored, so it can never drift out of step with the list you can see. Copy the block or download it as a plain text file and paste it into your manuscript.

A list of numbered notes is only as useful as the order it prints, so the manager keeps the arrangement manual and transparent: the endnotes you see are the endnotes you get, and nothing is sorted behind your back the way an automated tool might reorder them. If a note belongs earlier, move it up and every number below it follows, which is the behaviour an endnote section shows when a paragraph is inserted or cut.

The tool inherits the citation engine's scope, and the page states it plainly: four editions, formatted from the fields you type, with no lookup of any kind. It does not integrate with a word processor, cannot scan a manuscript for citation points, and cannot renumber notes inside a document you did not type into it. It manages a list, and the list is yours to place.

Because the note text is a pure function of the fields and the style, the same source always prints the same note, which is what lets you check it against the manual's worked example. Bluebook support is scoped to the case and statute patterns implemented here, and nothing the manager prints is legal advice: the full rule set covers signals, short forms and tables of authorities that a note list cannot. Where a citation is unusual, the answer is in the manual, and the page says so.

Everything stays in your browser. There is no account, no upload and no storage beyond this device, and the sources exist only in the fields on screen and in whatever you copy or download. Bringing them back is as simple as retyping them, and nothing leaves the tab unless you copy it.`,
    howTo: [
      { step: "Choose the note style: Chicago 17 or Bluebook print notes, APA 7 and MLA 9 print numbered references." },
      { step: "Add a source and fill its fields; authors go one per line as Family, Given." },
      { step: "Reorder with the arrows; the numbers renumber themselves from the visible order." },
      { step: "Read the numbered block and check each note against the style manual's worked example." },
      { step: "Copy the notes or download them as plain text to place in your manuscript." },
    ],
    whenToUse: `Use the endnote manager when the same notes run through a long document and renumbering by hand has become the chore. For footnotes that sit at the bottom of a page, the {{footnote-formatter|Footnote Formatter}} handles the note layout, and when the notes draw on a source list the {{bibliography-builder|Bibliography Builder}} keeps those sources in one editable place.

Pair it with the {{citation-formatter|Citation Formatter}} when a single note is proving awkward: format that one source there, read the note form the manual applies, then bring the corrected text back into the numbered list.`,
    faqs: [
      {
        q: "Why do APA and MLA endnotes look like reference entries?",
        a: "Because those styles number references rather than notes; they have no separate note form. Forcing a note shape onto APA or MLA would invent a device the manuals do not define, so the manager prints the reference entry and labels it as such.",
      },
      {
        q: "Does it renumber notes inside my manuscript?",
        a: "No. The manager numbers the list on this page, in the order you arrange it. It cannot scan a document or renumber notes in text you did not type here. It manages the list; placing it is your step.",
      },
      {
        q: "What does the See signal in a Chicago note mean?",
        a: "Chicago's note form begins with the signal the engine prints, which mirrors the way a note introduces a source in the notes-bibliography system. It is the note text itself, not a cross-reference; each entry is independent.",
      },
      {
        q: "Are sources with no author or title dropped?",
        a: "They are skipped in the output so the numbered list never shows an empty note, but they stay in the editor with their number label, so you can fill them in later without losing them.",
      },
    ],
  },

  "reference-list-generator": {
    keywords: ["reference list generator", "reference list", "in-text markers", "APA 7", "alphabetical"],
    intro:
      "The reference list generator turns a set of journal sources into a numbered or alphabetical reference list in APA 7, MLA 9 or Chicago 17, printing each style's in-text markers beside it so list and prose stay in step.",
    content: `The reference list generator does one job and shows both halves of it. On the left you keep a list of sources, entered journal article by journal article; on the right you get the formatted reference list and, underneath it, the matching in-text markers. A reader should be able to move from a marker in the prose to the entry in the list and back, so the generator prints them together rather than making you hold the order in your head.

Every source here is treated as a journal article, which is the type where volume, issue, page range and DOI all matter. That focus is deliberate: a book is a different field set and a different punctuation pattern, so the page fixes the type instead of offering a long type menu and getting the journal case only approximately right. When you need books too, the bibliography builder covers every source type in one list.

The reference list is formatted in APA 7th edition, MLA 9th edition or Chicago 17th edition, the three editions implemented by the citation engine. You choose numbered or alphabetical order, and the numbering is recomputed from the final order rather than stored, so switching between the two never leaves a stale number behind. The in-text markers use each style's own form; for a numbered list they are shown as [1], [2] and so on, which is a house convention rather than a rule of APA or MLA, and the page says as much.

Because the markers and the reference list are produced from the same source list in the same pass, they cannot disagree: change a year and both the entry and its marker update, change the order and the markers renumber with it. A reader who follows a marker to the list always finds the same source, which is the whole point of printing the two halves on one page.

The list is only as good as the fields you enter. The generator does not verify that a DOI resolves, that a journal name is spelled correctly or that a page range exists — it places the values you supply in the order the selected style requires. It also cannot scan a manuscript for citation points, so the markers are a reference while you write rather than a check of the document you have already written.

Everything happens in your browser: no account, no upload, no DOI resolver, no storage outside this device. Your sources sit in the fields on screen and in whatever you copy or download, and closing the tab takes them with it. Paste the list and the markers into your document as plain text and apply any italics your style requires by hand.

Because formatting is a pure function of the fields, the same source list always produces the same reference list and the same markers, which is what makes the output checkable against the manual's own example. Where a source is unusual — no author, an article number instead of pages, a DOI that must be a full link — the entry shows what the selected edition does with the values you gave it, and any field the style expects but does not find is a gap you can see.`,
    howTo: [
      { step: "Add a journal source and fill its fields — container, year, volume, issue, pages or article number, DOI." },
      { step: "Pick the style: APA 7, MLA 9 or Chicago 17." },
      { step: "Choose numbered [1], [2] order or a plain alphabetical list." },
      { step: "Read the reference list and the matching in-text markers printed beneath it." },
      { step: "Copy or download the list and markers for your manuscript." },
    ],
    whenToUse: `Use the reference list generator when a paper's citations are mostly journal articles and you want the list and the in-text markers to agree. If the letter of the citation is in doubt for a particular source, the {{citation-formatter|Citation Formatter}} shows every form of one entry, and when the sources include books and chapters as well the {{bibliography-builder|Bibliography Builder}} keeps the whole collection in one list.

When several styles are in play at once — a journal submission in APA and a class paper in MLA — format the same sources here once per style and keep the two lists side by side; the {{in-text-citation-builder|In-Text Citation Builder}} is the page for comparing the marker forms directly.`,
    faqs: [
      {
        q: "Why is the source type fixed to journal article?",
        a: "Because a journal article is the type where volume, issue, pages and DOI all carry weight, and fixing the type lets the form ask only for those fields. Books and other sources belong in the bibliography builder, which handles every type in one list.",
      },
      {
        q: "How are the in-text markers numbered?",
        a: "For a numbered list they are shown as [1], [2] and so on, in the order the list prints. That bracket convention is a house style, not a rule of APA or MLA, and the page states it so nobody mistakes it for the manual.",
      },
      {
        q: "Does the generator resolve DOIs or check journals?",
        a: "No. There is no network call anywhere in the tool. It writes the DOI and journal name you supply into the pattern the selected edition requires; it cannot confirm the DOI resolves or that the journal title is correct.",
      },
      {
        q: "Can it find citation points in my existing document?",
        a: "No. It formats a source list and prints the markers that match it; it cannot scan a manuscript to locate where each source is cited. Treat the markers as a reference while you write rather than a check of what is already written.",
      },
    ],
  },

  "in-text-citation-builder": {
    keywords: ["in-text citation builder", "in-text citation", "narrative citation", "parenthetical", "MLA 9"],
    intro:
      "The in-text citation builder takes one source and shows its parenthetical, narrative and short forms in APA 7, MLA 9, Chicago 17 and Bluebook 21 side by side, so you can see how the same citation changes shape between styles.",
    content: `The in-text citation builder exists for the moment in the middle of a sentence when the citation has to be the right shape. A parenthetical citation and a narrative citation are not interchangeable everywhere, and the difference between (Smith, 2020) and Smith (2020) is exactly the thing a writer gets wrong under time pressure. Enter the source once and the page renders all four implemented styles at once, each with its parenthetical form, its narrative form and a short form for a later reference.

The four styles are the four editions the citation engine implements: APA 7th edition, MLA 9th edition, Chicago 17th edition notes-bibliography and Bluebook 21st edition for cases and statutes. They do not behave alike, and the page makes the differences visible instead of flattening them. APA puts the year in the parenthetical and drops the given names, using an ampersand between two authors and et al. from three. MLA keeps the page number in the parenthetical and uses the author's family name alone in a narrative sentence. Chicago and Bluebook are note styles: they have no parenthetical narrative form, so their note text is shown in that row and the page says plainly that the row is the note rather than a narrative.

Authors are entered one per line as Family, Given. The name that reaches a narrative citation is the family name, because that is what the manuals call for; an organisation written without a comma is kept as written. The pinpoint page you enter is carried into every form that takes one — a page in APA and MLA, the note text in Chicago and Bluebook. A later-reference row gives the short form for a second citation to the same source, where the style defines one.

A citation is often right or wrong by a single comma, so the page prints every form as copyable text rather than describing it. If you are unsure which style a course or journal is asking for, read the four panels together: seeing Smith (2020) beside (Smith, 2020) beside a Chicago note is usually enough to recognise the style in front of you and to spot the one the surrounding document already uses.

This is the mechanical construction of each form, not advice about which to use. Whether a narrative or a parenthetical citation fits a sentence, whether et al. is allowed at that point in the count, and how a source with no author is introduced are editorial decisions the style manual explains in prose. The page points at the manual rather than inventing a rule, and it does not pretend to choose for you.

Everything is computed in the browser. There is no account, no upload, no resolver and no storage beyond this tab: clearing the source or closing the page removes it. The report of all four styles can be copied in one action for reference while you draft. Because each form is a pure function of the fields and the style, the same source always yields the same three forms, which is what makes the output checkable against the manual's own worked examples.`,
    howTo: [
      { step: "Enter the source once: author or authors, title, year and a pinpoint page if you have one." },
      { step: "Read the four style panels; each shows the parenthetical form, the narrative or note form and a short form." },
      { step: "Note which styles have a narrative form and which are note styles that do not." },
      { step: "Copy the form you need, or copy the whole report to keep all four styles beside you while you write." },
      { step: "Check an unusual citation against the manual, which explains in prose what the mechanical forms cannot decide." },
    ],
    whenToUse: `Use the in-text citation builder while you are drafting and the citation, not the entry, is the question. When you need the full reference behind a marker, the {{reference-list-generator|Reference List Generator}} prints the list and its markers together, and for the entry itself in every form the {{citation-formatter|Citation Formatter}} shows the bibliography, in-text and note shapes of one source.

When the surrounding prose also has to sound academic, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} measures that register, so the sentence and its citation can be judged together rather than one at a time.`,
    faqs: [
      {
        q: "What is the difference between a parenthetical and a narrative citation?",
        a: "A parenthetical citation sits outside the sentence, as in (Smith, 2020); a narrative citation makes the author part of the sentence, as in Smith (2020). APA and MLA both allow the two, and the builder shows each so you can pick the one that reads best.",
      },
      {
        q: "Why do Chicago and Bluebook show a note instead of a narrative form?",
        a: "Because they are note styles: the notes-bibliography system and Bluebook's citation rules use numbered notes rather than a parenthetical author-date form. The row shows the note text and the page says so, rather than inventing a narrative that the manuals do not define.",
      },
      {
        q: "How many authors before et al. appears?",
        a: "It depends on the style. APA uses et al. from three authors, MLA from three as well, and Chicago lists up to three and uses et al. beyond. The builder applies each style's rule and prints the family names that result.",
      },
      {
        q: "Is the tool telling me which citation form to use?",
        a: "No. It builds the mechanical forms. Whether a narrative or parenthetical citation fits a particular sentence, and how to introduce a source with no author, are editorial calls your manual explains in prose; the page points you there.",
      },
      {
        q: "Does it store my source anywhere?",
        a: "No. The source exists in the fields on screen and in whatever you copy; there is no account, no upload and no storage. Clearing the form or closing the tab removes it.",
      },
    ],
  },

  "academic-journal-reference-formatter": {
    keywords: ["academic journal reference formatter", "journal article", "DOI", "field checklist", "APA 7"],
    intro:
      "The academic journal reference formatter builds a journal article reference in APA 7, MLA 9 or Chicago 17 and shows a per-style field checklist, so you can see which fields the target journal expects before you submit.",
    content: `A journal article is the reference type where the small fields carry the most weight, and this academic journal reference formatter is built around that one case. Enter the article's authors, title, journal name, year, volume, issue, page range or article number, DOI and URL, and the page prints the reference in APA 7th edition, MLA 9th edition or Chicago 17th edition, with the in-text form beside it. The source type is fixed to journal article on purpose: the field set for an article is not the field set for a book, and pretending one form covers both is where entries go wrong.

The thing a single-entry formatter cannot know is which journal you are submitting to, so the page shows its work instead of hiding it. A field checklist lists what each of the three styles expects of a journal entry — who is listed before et al., how the title is cased and punctuated, whether the year sits in parentheses or after the volume, how the volume and issue are written, and where the DOI goes — so you can compare the checklist against the journal's own author guidelines before you adapt the entry. Individual journals publish house styles, sometimes a modified APA or Vancouver, and no tool can infer which one an editor wants.

Article numbers are supported for online-only journals, where an article is identified by a number rather than a page range. APA prints it in the page slot as "Article N", MLA as "Art. no. N", and because Chicago prints whatever sits in the page slot, entering an article number with Chicago raises a warning that says so rather than silently dropping it. Warnings appear for any field the chosen style expects and the entry does not have, so a missing DOI link or page range is visible rather than implied.

Because a submission lives or dies on details that only make sense beside each other, the formatted reference and the field checklist sit on the same page: read the reference, then read what the style expects, and the difference between them is exactly the work left to do before you submit.

Authors go in one per line as Family, Given, and the style's own author-count rule is applied when the reference is built. The DOI is rendered as a full https://doi.org/ link where the style calls for one, and a URL is used when no DOI was given. Titles print exactly as entered, because correct casing depends on the style, the language and proper nouns, and a rule that lowercased the first letter of every word would corrupt the names of people and places.

Everything is computed locally. There is no account, no upload and no DOI resolver, so the reference is exactly the data you supplied — which is what makes it possible to check against the manual's worked example. The page is not legal, submission or publication advice, and it cannot know a specific journal's requirements; it formats the article's fields in the three editions implemented and hands you the checklist to do the rest.`,
    howTo: [
      { step: "Enter the article fields: authors one per line, title, journal, year, volume, issue, pages or article number." },
      { step: "Add the DOI or the URL; the formatter renders it as the selected style requires." },
      { step: "Choose APA 7, MLA 9 or Chicago 17 and read the formatted reference and its in-text form." },
      { step: "Read the warnings for anything the style expects and the entry lacks." },
      { step: "Compare the field checklist against the target journal's author guidelines before you submit." },
    ],
    whenToUse: `Use the academic journal reference formatter when the source is a journal article and the details matter — an online-only article with an article number, a DOI that has to be a full link, an issue that sits in parentheses in one style and after a volume in another. For every other source type in one form, the {{citation-formatter|Citation Formatter}} covers books, chapters, web pages, reports, cases and statutes, and when you are assembling a whole bibliography the {{bibliography-builder|Bibliography Builder}} keeps the list together.

It pairs naturally with the {{academic-writing-tone-checker|Academic Writing Tone Checker}}: format the reference first so the source details are right, then judge whether the sentence around the citation holds the register the journal expects.`,
    faqs: [
      {
        q: "Can the formatter match a specific journal's house style?",
        a: "No. Journals publish their own house styles, often a modified APA or Vancouver, and no tool can infer which one an editor wants. The formatter implements APA 7, MLA 9 and Chicago 17 and shows a field checklist so you can compare it against the target journal's author guidelines.",
      },
      {
        q: "How are article numbers handled?",
        a: "APA prints an article number in the page slot as Article N and MLA as Art. no. N. Chicago prints whatever sits in the page slot, so entering an article number with Chicago raises a warning rather than dropping it silently.",
      },
      {
        q: "Why are titles printed with the capitalisation I typed?",
        a: "Because correct casing depends on the style, the language and proper nouns. APA wants sentence case, MLA and Chicago want headline style, and a mechanical rule would corrupt names. Enter the title in the casing your style requires; the formatter handles order and punctuation.",
      },
      {
        q: "What do the warnings under the reference mean?",
        a: "They list fields the selected style expects of a journal entry that the current entry does not have — a missing page range, a DOI that should be a full link, an article number where a page range belongs. They are prompts to check the source, not errors in the formatting.",
      },
    ],
  },
};
