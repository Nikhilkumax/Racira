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
    keywords: [
      "bibliography builder",
      "alphabetical by author",
      "source list",
      "JSON",
    ],
    intro:
      "The Bibliography Builder formats an editable source list in APA 7, MLA 9 or Chicago 17, ordered Alphabetical by author or Numbered in the order entered.",
    content:
      "Sources are added once and read as a list, which is what this bibliography builder is for: enter each source's typed fields, and the bibliography renders in the chosen style with the order under your control. The order control applies to the whole list rather than to individual entries, so the bibliography stays consistent. The list is editable in place, so fixing a year does not mean re-entering the source. The rendered list updates on every keystroke, so the bibliography can be read while it is still being built. The editing rows keep the order you added them in; only the rendered bibliography is sorted.\n\n- Order: Alphabetical by author or Numbered in the order entered.\n- Styles: APA 7, MLA 9 and Chicago 17. Bluebook is deliberately not offered, because it has no bibliography as such, only a table of authorities.\n- Each source row shows its entry label and can be edited in place.\n- Import and export: copy a JSON list, or paste a JSON array to restore one. Validation checks the source type and the title and reports the first problem it finds.\n- Copy bibliography and Download bibliography.txt for the rendered list.\n- The source list is stored in this browser, and the page labels it as such.\n- Exporting the JSON list is also the backup: the browser copy can be cleared by the browser, the file cannot.\n\nAlphabetical order follows the family name exactly as entered, with organisational authors sorted under their name as written; numbered order keeps the sequence you entered and numbers the entries. The import path is deliberately strict: it validates the source type and the title, reports the first problem rather than a wall of them, and never silently drops a field it does not recognise, because a reference manager that loses data is worse than no reference manager. The bibliography is rendered by the same citation engine as the single-entry formatter, so an entry produced in one tool is exactly the entry produced in the other. Numbered mode numbers entries in the entered order and changes nothing else, which makes it the right shape for a reading pack or a thesis bibliography.\n\n- Bluebook entries are out of scope here; legal sources belong in the citation formatter's Bluebook style.\n- The import validates the source type and title only; every other field is printed as typed.\n- A typo in a family name sorts the entry under the typo, because sorting is literal.\n- The list lives in the browser, so clearing site data clears the bibliography.\n- It cannot verify that a source exists or that the fields describe it accurately.\n- Two sources by the same author are printed as two entries; the engine does not merge them.\n\nBuild the list as you read, not at the end: a source added while its details are in front of you is a source with a correct page range. When the list is complete, switch between alphabetical and numbered order to see which the venue wants, then copy the result once. Export the JSON list whenever the bibliography is more than a few sources: the file is the difference between a list and a list you would have to retype. A bibliography outlives the paper it was built for, so the export is worth taking early.",
    howTo: [
      { step: "Add each source's typed fields; the entry label and rendered bibliography update as you type." },
      { step: "Choose a citation style and whether to sort Alphabetical by author or Numbered in the order entered." },
      { step: "Edit any source in place, or paste a JSON list to restore one you exported earlier." },
      { step: "Copy bibliography or Download bibliography.txt." },
    ],
    whenToUse:
      "Use the builder when the deliverable is the list itself. For a single entry, especially a legal one, the {{citation-formatter|Citation Formatter}} is the narrower tool, and when entries need matching in-text markers the {{reference-list-generator|Reference List Generator}} keeps the two halves together.\n\nFor notes rather than a bibliography, the {{endnote-manager|Endnote Manager}} numbers sources in the order you arrange them and repeats each style's own note device.",
    faqs: [
      {
        q: "Why is Bluebook missing from the style list?",
        a: "Because Bluebook has no bibliography as such. Legal writing uses a table of authorities instead, so legal sources belong in the citation formatter's Bluebook style and, for a table, the legal citation formatter.",
      },
      {
        q: "What happens to a field the import does not recognise?",
        a: "It is never silently dropped. The import validates the source type and the title first and reports the first problem it finds, and the page states that unknown fields are kept rather than quietly discarded.",
      },
      {
        q: "How is alphabetical order decided?",
        a: "By the family name exactly as entered, with organisational authors sorted under their name as written. Sorting is literal, so a misspelled name sorts under the misspelling — worth a read before you copy the list.",
      },
      {
        q: "Is my source list saved anywhere?",
        a: "It is stored in this browser, as the panel label says, and nothing is transmitted. Clearing your browser's site data clears the bibliography, so export the JSON list before you rely on it.",
      },
      {
        q: "Do the entries match the single-entry formatter?",
        a: "Yes, exactly. Both tools render through the same citation engine, so an APA entry produced here is the same entry the citation formatter produces from the same fields.",
      },
    ],
  },

  "endnote-manager": {
    keywords: [
      "endnote manager",
      "numbered endnotes",
      "note style",
      "second reference",
    ],
    intro:
      "The Endnote Manager numbers notes in the order you arrange them and repeats each style's own device: Chicago and Bluebook use their note form, APA and MLA use the reference entry itself.",
    content:
      "Endnotes are a list first and a citation second, which is why this endnote manager keeps the order under your control: you arrange the notes, and the numbering follows the list order rather than the order the sources were entered. Each row shows the same source in the shapes a writer actually needs. The list is stored in this browser, and the numbering is recomputed on every change.\n\n- Note style: APA 7th edition (2020), MLA 9th edition (2021), Chicago 17th edition notes-bibliography (2017) or Bluebook 21st edition (2020).\n- Numbering is list order, so the numbered endnotes run 1, 2, 3 in the order you arrange, whatever each source and whenever it was added.\n- Each row carries three forms: the note text, the full reference entry, and the short form for a second reference to the same source.\n- Copy notes and Download endnotes.txt give the numbered list in the chosen style's device.\n- The notes are stored in this browser, and the page labels that.\n\nThe style differences are published rather than smoothed over. Chicago and Bluebook have a genuine note form, so their endnotes use it; APA and MLA number references rather than notes, so their endnotes are the reference entries themselves, and the page says so instead of inventing a note style those manuals do not define. That substitution is stated because a wrong note form would be worse than a documented difference. The short form is the second-reference device each style recognises, which is why arranging the list before reading it matters: the numbering is the list, and moving a note moves its number. Nothing is looked up, so every line is a function of the fields you typed. A note's text is the same entry the single-entry formatter prints for that style with the note device applied, so an endnote and its bibliography entry cannot disagree about a date or a page range. The manager never reorders by author or year: the sequence you build is the sequence it prints.\n\n- It numbers and formats; it cannot tell whether a source supports the claim it is attached to.\n- APA and MLA have no separate note form, so their endnotes are reference entries.\n- Bluebook support covers the case and statute patterns the engine implements, not the whole rule set.\n- The list is stored in the browser, so clearing site data clears the notes.\n- Changing the order renumbers every note; there are no pinned numbers.\n- A note with no source is still a note: the manager numbers it like any other, and giving it an entry stays your job.\n- The note text and the reference entry are printed for every row, so a reader can match a note number to a list entry without opening the source.\n\nDraft the notes in the order you want them read, check the three forms on each row, and reorder before you copy rather than after: the numbering is a property of the list, not of the source, and that is the whole design. The three forms on each row are also the three things a reader may see: the note in the text, the entry in the list, and the short form after a second mention.",
    howTo: [
      { step: "Choose the note style; the list re-renders in that style's device." },
      { step: "Add or arrange the notes in the order you want them numbered." },
      { step: "Check each row's note text, reference entry and short form." },
      { step: "Copy notes or Download endnotes.txt." },
    ],
    whenToUse:
      "Use the manager when notes need to be numbered and styled but the body text is elsewhere. When the body markers exist and the problem is that they no longer match the notes, the {{footnote-formatter|Footnote Formatter}} analyses both halves together.\n\nFor a bibliography rather than notes, the {{bibliography-builder|Bibliography Builder}} renders the same engine as a sorted list, and the {{citation-formatter|Citation Formatter}} remains the tool for one entry at a time.",
    faqs: [
      {
        q: "Why do APA and MLA endnotes look like reference entries?",
        a: "Because those styles number references rather than notes and define no separate note form. Rather than invent one, the manager prints the reference entry and the page states the substitution.",
      },
      {
        q: "How is the numbering decided?",
        a: "By list order: the first note in the list is 1. Reordering the list renumbers every note, so arrange the sequence before you copy the output rather than afterwards.",
      },
      {
        q: "What is the short form for?",
        a: "It is the second-reference device the chosen style recognises, for when the same source is cited again. It sits on the same row as the full entry so the two can be checked against each other.",
      },
      {
        q: "Does the manager check my sources?",
        a: "No. It formats and numbers what you type. There is no lookup and no network call, so a wrong page number is printed faithfully; the tool's promise is consistency, not correctness.",
      },
      {
        q: "Where are the notes kept?",
        a: "In this browser, as the panel label says. Nothing is transmitted, and clearing site data clears the list, so copy or download anything you need to keep before you clear your browser.",
      },
    ],
  },

  "reference-list-generator": {
    keywords: [
      "reference list generator",
      "in-text markers",
      "numbered",
      "alphabetical",
    ],
    intro:
      "The Reference List Generator builds a list from journal sources and shows the in-text markers that match each entry, numbered or alphabetical.",
    content:
      "A reference list and its in-text markers have to agree, and this reference list generator is built to keep them together: each source you add produces an entry and the marker that points at it, so the two halves of the system can be checked side by side rather than in separate documents. The list can start with a single source: the tool is shaped so that the first entry is already useful.\n\n- Citation style: APA 7, MLA 9 or Chicago 17.\n- Reference numbering: Numbered [1], [2] … or Unnumbered, alphabetical.\n- Each source row shows its entry label, and adding a source updates the list and the marker panel at once.\n- Copy list and markers, or Download reference-list.txt.\n- Sources are stored in this browser, and the page labels it.\n- Entries render as you type, so an incomplete source is visible in the list rather than hidden until it is finished.\n- A source can be added for a reference you have not read; nothing here checks that the entry matches the work.\n\nThe list is rendered by the same citation engine as the single-entry formatter, so a reference here matches the entry the formatter produces from the same fields. Numbering is a property of list order: with Numbered selected, the first source is [1] and inserting a source renumbers everything below it, which is why the markers panel exists — it shows the current marker for each entry so a changed number is visible before it reaches the manuscript. The alphabetical mode drops the numbers and orders entries the way the style expects, with the in-text forms following the style's own author-date device. Nothing is looked up. Numbered mode numbers in list order; alphabetical mode orders entries as the style expects and uses the style's own author-date marker instead of a bracketed number. The panel and the list are rendered from the same entries, so they cannot fall out of step.\n\n- It formats and pairs; it cannot verify that a source exists or that the fields are right.\n- Bluebook is out of scope for a reference list; legal sources belong in the citation formatter's Bluebook style.\n- Numbering follows list order, so inserting a source renumbers everything after it.\n- Markers follow the chosen style rather than a particular venue's house rules.\n- Storage is browser-only; export before clearing site data.\n- The marker panel is the reason the tool exists: a list without its markers is half a citation system, and the panel keeps the half that is normally forgotten in view. Every edit updates the marker beside its entry, so the current number is always one glance away.\n\nAdd sources while you read them, set the numbering early, and use the markers panel as the cross-check: every entry should have exactly one marker, and every marker should point at an entry that exists. Add sources while the manuscript is open rather than after it: the markers are the part that is easy to forget. When the numbering style changes, read the markers panel before copying, because the entries do not change but every marker does.",
    howTo: [
      { step: "Add each journal source's typed fields; the entry label appears on the row." },
      { step: "Choose a citation style and whether references are Numbered [1], [2] … or Unnumbered, alphabetical." },
      { step: "Read the In-text markers panel against the reference list." },
      { step: "Copy list and markers, or Download reference-list.txt." },
    ],
    whenToUse:
      "Use the generator when the manuscript cites by number and the list must follow. When there are no in-text markers to match, the {{bibliography-builder|Bibliography Builder}} is the simpler list, and the {{in-text-citation-builder|In-Text Citation Builder}} shows the forms a single source takes across all four styles.\n\nFor citation entries themselves, one at a time, the {{citation-formatter|Citation Formatter}} stays the narrowest tool.",
    faqs: [
      {
        q: "What happens to the numbers when I insert a source?",
        a: "Everything below the insertion is renumbered, because numbering is a property of list order. The markers panel shows each entry's current marker, so the change can be followed into the manuscript.",
      },
      {
        q: "What does unnumbered alphabetical mode produce?",
        a: "Entries ordered as the chosen style expects, with the style's own author-date in-text forms instead of bracketed numbers. The marker panel still lists one marker per entry.",
      },
      {
        q: "Can I build a legal reference list here?",
        a: "No. Bluebook has no reference-list form; the engine offers Bluebook only for case and statute entries in the citation formatter, where the note and short forms live.",
      },
      {
        q: "Are the entries the same as the formatter's?",
        a: "Yes. Both tools render through the same citation engine with the same fields, so an APA entry here is identical to the APA entry the formatter produces.",
      },
      {
        q: "Is anything uploaded?",
        a: "No. Sources are held in this browser and the formatting runs in the page. Clearing site data clears the list, so export anything you need to keep.",
      },
    ],
  },

  "in-text-citation-builder": {
    keywords: [
      "in-text citation builder",
      "all four styles",
      "parenthetical",
      "narrative",
    ],
    intro:
      "The In-Text Citation Builder renders one source in all four styles at once, showing the parenthetical and narrative forms side by side where the style defines them.",
    content:
      "In-text forms are where styles differ most, so this in-text citation builder renders one source in all four styles at once rather than making you switch between them: APA 7, MLA 9, Chicago 17 and Bluebook 21, each with the shapes that style actually defines. The source is entered once, and every panel and the report render from that single set of fields.\n\n- One source in, every form out: the parenthetical and narrative forms for each style, with the note form where the style has one.\n- Bluebook forms appear only for case and statute sources, matching the citation engine's legal scope.\n- Each style panel has its own Copy this style control, and the report copies all forms at once.\n- The Forms panel counts the styles rendered and lists their short names.\n- Nothing is looked up: every form is built from the typed fields.\n- Copy all forms produces one report listing every style with its shapes, which is convenient when a methods section has to name the citation style.\n- Every panel is rendered from the same source, so the four styles cannot disagree about the fields you entered.\n\nThe narrative form exists only where a style defines one. APA and MLA both have a narrative shape, so both are shown; Chicago and Bluebook are note styles, so their panels return the note text instead, and the page says why rather than inventing a narrative form those manuals do not define. Parenthetical forms follow each style's own bracket and punctuation rules, and author-list shortening follows the published thresholds — et al. from three authors in MLA, up to 20 in APA, up to three in Chicago before et al. The report gathers every form in one block, which is the point of the tool: the differences between styles become visible on one screen, next to each other, from the same source. That is also why the tool sits beside the full formatter: choosing a style is easier when the alternatives are in view and harder when the source has to be re-entered to see them. The panels appear in a fixed order — APA, MLA, Chicago, Bluebook — so a form's position on the page is learnable.\n\n- It shows forms; it cannot check that the source supports the claim the sentence makes.\n- Narrative forms exist for APA and MLA; the note styles return note text instead.\n- Bluebook forms cover only the case and statute patterns implemented in the engine.\n- Output follows the engine's published simplifications, not a particular venue's style sheet.\n- No lookup: the fields are printed exactly as typed.\n- An empty panel means missing fields, not a missing rule; what each style needs is laid out in the journal reference formatter.\n\nUse it when you are deciding how a source will sit inside a sentence. Read the four panels top to bottom, copy the one your venue uses, and check the label beside each shape — parenthetical and narrative are different jobs, and the tool labels which is which. If a panel builds nothing, the fields for that style are missing: the tool creates every form it can from what you supplied and never pads the gaps. Switch styles by reading down the page rather than by editing the source.",
    howTo: [
      { step: "Add the source's fields; a title or an author is enough to begin." },
      { step: "Read the four style panels; the Forms panel counts the styles rendered." },
      { step: "Compare the parenthetical and narrative shapes, and the note form where one exists." },
      { step: "Copy this style for one panel, or Copy all forms for the whole set." },
    ],
    whenToUse:
      "Use the builder when the decision is about the shape of a citation inside prose. When the entry itself is the deliverable, the {{citation-formatter|Citation Formatter}} prints it per style, and when a whole list needs markers, the {{reference-list-generator|Reference List Generator}} pairs entries with the markers that point at them.\n\nFor a journal article specifically, the {{academic-journal-reference-formatter|Academic Journal Reference Formatter}} adds a per-style field checklist around the same engine.",
    faqs: [
      {
        q: "Why do Chicago and Bluebook panels show note text instead of a narrative form?",
        a: "Because those styles define a note rather than a narrative in-text shape. Returning note text is the honest alternative; inventing a narrative form those manuals do not define would put text in your manuscript that no style guide supports.",
      },
      {
        q: "What counts as a narrative form?",
        a: "The shape where the author's name is part of the sentence and the year or page follows in brackets, as opposed to the parenthetical shape where the whole citation sits inside brackets at the end of the clause.",
      },
      {
        q: "How are author lists shortened?",
        a: "By each style's published threshold: MLA switches to et al. from three authors, APA lists up to 20 before shortening, and Chicago lists up to three before et al. The same rules the citation engine applies everywhere.",
      },
      {
        q: "Why do I not see Bluebook panels for a book?",
        a: "Because the engine implements Bluebook for case and statute sources only. A book has no Bluebook form here, so the style is not offered rather than producing an empty panel.",
      },
      {
        q: "Does it look up the source?",
        a: "No. Every form is a function of the fields you type, with no DOI or ISBN resolution and no network call anywhere in the tool.",
      },
    ],
  },

  "academic-journal-reference-formatter": {
    keywords: [
      "academic journal reference formatter",
      "journal article",
      "field checklist",
      "in-text",
    ],
    intro:
      "The Academic Journal Reference Formatter formats a journal article in APA 7, MLA 9 or Chicago 17 and shows a per-style field checklist of what the entry needs.",
    content:
      "A journal entry has more required parts than most sources, and this academic journal reference formatter makes them visible: the fields are typed once, the reference renders in the chosen style, and a per-style table shows what each of APA 7, MLA 9 and Chicago 17 expects of a journal entry. The reference is formatted as you type, so the checklist and the entry move together. Volume, issue and pages are printed as their own parts, because journal entries most often go wrong there.\n\n- Styles: APA 7, MLA 9 and Chicago 17, with Bluebook out of scope for journal articles.\n- The rendered entry carries a live word count, so its length can be judged at a glance.\n- In-text: the style's own in-text form is printed under the entry.\n- The field checklist table has one column per style and shows what each expects.\n- Warnings list the fields the chosen style expects but the entry does not have.\n- The warnings double as a revision checklist: clearing them is a smaller job than re-reading the finished entry.\n- The word count shown is the rendered entry's own length, which makes a field pasted twice easy to spot.\n- Copy reference and Download journal-reference.txt.\n- The reference and its in-text form are printed together, so the pair can be checked before either reaches a manuscript.\n- The in-text form uses the engine's published author-shortening rules, so the entry and its sentence form stay consistent.\n\nThe engine is the same typed-metadata citation formatter used across this family, with the source type pinned to a journal article so the field set is always the article field set. Authors are entered one per line as Family, Given and shortened by each style's published threshold; page ranges take the style's own dash; the DOI and URL are printed as typed because nothing is resolved. The warnings are the useful half of the tool: a journal entry fails review more often for a missing volume or an absent DOI than for a formatting slip, and the checklist shows both the expectation and the gap. The table is deliberately static: it prints each style's expectations rather than inferring them from the engine, so the implementation can be compared against the manual it claims to follow.\n\n- It cannot confirm that the article exists or that the page range is correct.\n- Warnings name expected fields; they do not judge the content of the entry.\n- Title and container capitalisation are printed as entered, in every style.\n- Bluebook's journal-citation rules are not implemented here.\n- One entry at a time; a multi-source list belongs in the Bibliography Builder.\n- The checklist describes each style's usual expectation; a specific journal's author guidelines always win.\n\nFill the article fields first, read the checklist to see what the chosen style wants, then copy the entry. If you are switching between styles for two venues, the checklist is the fastest reminder of which fields each one adds. Keep the reference and the checklist together when you file it: a year later, the checklist is what explains why the DOI sits where it does. Until the manuscript is final, keep the entry and its in-text form in one place.",
    howTo: [
      { step: "Fill the journal article fields; the reference appears as you type." },
      { step: "Choose APA 7, MLA 9 or Chicago 17." },
      { step: "Read the reference, its word count, the in-text form and the warnings." },
      { step: "Check the per-style field checklist, then Copy reference or Download." },
    ],
    whenToUse:
      "Use the formatter when the source is a journal article and you want its required parts visible. When the entry is a book or a website, the {{citation-formatter|Citation Formatter}} covers all eight source types, and when the article needs a place in a list, the {{reference-list-generator|Reference List Generator}} pairs entries with markers.\n\nTo see how the same source behaves inside a sentence across all four styles, the {{in-text-citation-builder|In-Text Citation Builder}} renders the parenthetical and narrative shapes side by side.",
    faqs: [
      {
        q: "What is the field checklist for?",
        a: "It is a per-style table showing what APA 7, MLA 9 and Chicago 17 each expect of a journal entry. It is there because most journal-entry mistakes are omissions — a missing volume, an absent DOI — rather than punctuation slips.",
      },
      {
        q: "Why is Bluebook not offered for a journal article?",
        a: "Because the engine's Bluebook layer implements case and statute patterns, not journal-article rules. Rather than producing an entry that claims to follow a rule set it does not implement, the tool leaves Bluebook out.",
      },
      {
        q: "What does the word count beside the reference mean?",
        a: "It is the rendered entry's own length in words, style included. It is a quick way to notice an entry that has grown long because a field was pasted twice, or short because something is missing.",
      },
      {
        q: "Do the warnings block anything?",
        a: "No. They list the fields the chosen style expects but the entry does not have. You can copy an entry with warnings; the point is that you saw them first.",
      },
      {
        q: "Can I format several articles at once?",
        a: "Not here — this tool formats one entry at a time. For a working list of sources, the Bibliography Builder or the Reference List Generator is the right shape.",
      },
    ],
  },
};
