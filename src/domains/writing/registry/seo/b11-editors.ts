import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B11, editors and organisers: the authored SEO entry for the Markdown
 * editor, outline builder and document diff viewer, plus the two citation tools
 * that finish the reference group (legal citation formatter and newspaper
 * article citation maker).
 *
 * Every entry states what is implemented and, as importantly, what is not: the
 * Markdown renderer escapes raw HTML, the diff compares text rather than
 * documents, and the Bluebook tool covers the case and statute patterns only.
 * Keys are registry slugs; see ../tool-seo.ts for the contract.
 */
export const B11_EDITORS_SEO: Record<string, ToolSeo> = {
  "markdown-editor": {
    keywords: [
      "markdown editor",
      "markdown-it",
      "heading outline",
      "code blocks",
    ],
    intro:
      "The Markdown Editor renders your source with markdown-it, escapes any raw HTML by default, and reports document stats plus a copyable heading outline.",
    content:
      "This markdown editor renders your source, counts what is in it and hands you the outline as text. The preview is produced by the markdown-it library with raw HTML disabled, so anything that looks like a tag in the source is escaped before it reaches the renderer; the component also runs a sanitiser over the result as a belt-and-braces measure. The result is a page that can render Markdown without trusting the text you paste.\n\nThe document panel reports words, lines, headings, links, code blocks and list items — counts of the source, not of the rendered HTML, which is what makes them reproducible. The outline panel lists every heading in order with its level, indented so the shape of the document is visible at a glance, and Copy outline takes it as plain text. The source itself can be copied or downloaded as a .md file, so the round trip from editor to repository is a single action.\n\n- Rendered preview: markdown-it output with raw HTML escaped at render time.\n- Document stats: words, lines, headings, links, code blocks and list items.\n- Heading outline: every heading with its level, indented, copyable as plain text.\n- Anchor slugs: GitHub-style slugs computed per heading for the outline links.\n- Copy source and Download .md for the Markdown itself.\n- Copyable outline for pasting into an issue, a README or another document.\n\nThe renderer is the project's existing markdown-it dependency configured with HTML disabled at the parser level, which means escaped output rather than sanitised output — the text never becomes markup in the first place. Counts come from the source string itself: headings from the line markers, links from the inline syntax, code blocks from fenced spans. The module is pure and synchronous, so the same source always produces the same preview, outline and stats, and nothing touches the network.\n\n- Raw HTML in the source is shown as escaped text, not rendered, by design.\n- The outline covers headings only; bold text and list items do not appear in it.\n- Stats count the source, so a link inside a code span still counts as a link in the syntax scan.\n- No collaborative editing and no version history; the source is the version.\n- Very large documents render fine but the preview re-renders on every keystroke, so huge files feel heavier.\n\nA useful rhythm is to write in source, check the outline for structure and only read the preview for flow. When the outline shows a level jump or a missing heading, the structure problem is visible before the prose review starts. Copy the outline into a review comment and the reviewer sees the document's shape without reading the whole thing — which is the part of Markdown that engineers and technical writers actually reach for. The same outline control also works as a review artefact on its own: paste a document, copy the heading list, and the reviewer sees the shape of the argument before reading a sentence of it.\n\nWhen the document needs to become formatted text rather than source, the rich text editor offers marks and block kinds without syntax, and the block-based editor builds the same structure from typed blocks. Developers working in this domain may recognise the comparison and inspection tools under other names; here they live as document-facing tools rather than command-line ones.",
    howTo: [
      { step: "Write or paste Markdown into the source panel; the preview renders as you type." },
      { step: "Read the Document panel for words, lines, headings, links, code blocks and list items." },
      { step: "Check the outline panel for the heading structure, and copy it when a review needs the shape." },
      { step: "Copy source or Download .md to move the Markdown into a repository or another editor." },
    ],
    whenToUse:
      "Use the markdown editor when the document has to exist as source — a README, an issue, a documentation page. The {{rich-text-editor|Rich Text Editor}} offers the same writing without syntax, marking text with clicks instead, and the {{block-based-editor|Block-Based Editor}} types structure directly into blocks. When the outline is the deliverable rather than the document, the {{outline-builder|Outline Builder}} renders indented text three ways, and the distraction-free editor in this domain strips even the preview away.",
    faqs: [
      {
        q: "Can I paste HTML into the editor?",
        a: "Yes, but it will be escaped and shown as text. Raw HTML is disabled in the renderer on purpose, so nothing you paste can become markup on the page.",
      },
      {
        q: "How is the heading outline built?",
        a: "Every heading line in the source becomes an entry with its level and a GitHub-style anchor slug, indented by depth. Copy outline produces the same list as plain text for a review or an issue.",
      },
      {
        q: "Do the stats count the source or the preview?",
        a: "The source. Words, lines, headings, links, code blocks and list items are counted from the Markdown you typed, which makes the figures reproducible without rendering anything.",
      },
      {
        q: "Is the rendered preview sanitised?",
        a: "The parser escapes raw HTML before rendering, and the component additionally runs a sanitiser over the output as a second layer. Two independent defences, both stated on the page.",
      },
      {
        q: "Can I download the file?",
        a: "Yes, Download .md saves the source as a Markdown file, and Copy source puts it on the clipboard. The outline has its own copy control.",
      },
    ],
  },

  "outline-builder": {
    keywords: [
      "outline builder",
      "indented outline",
      "numbered outline",
      "plain indented text",
    ],
    intro:
      "The Outline Builder reads an indented outline into a tree, reports its shape and renders it as markdown, a numbered outline or plain indented text.",
    content:
      "An outline is indented lines, and this outline builder reads that text into a tree, reports its shape and writes it back out three ways. Type or paste two spaces per level, with or without leading markdown bullets, and the parser normalises the indentation so a stray space or a pasted tab does not break the tree. Blank lines are skipped, and levels never skip: the shape it reports is the shape you authored.\n\nThe shape panel counts items, finds the deepest level and shows the population of each level, which is how a lopsided outline announces itself before anyone reads it. Rendering offers three outputs: indented markdown bullets at two spaces per level, a numbered outline in either hierarchical decimals or the classic I. A. 1. a. i. scheme, and plain indented text for a word processor. Every rendering has its own copy control, and the report combines them all.\n\n- Parsing: indented lines, optional leading bullets, tabs counted as four spaces.\n- Shape report: item count, deepest level and the population of each level.\n- Indented markdown: two spaces per level, ready to paste into a README.\n- Numbered outline: hierarchical decimals or the classic scheme, switchable.\n- Plain indented text: no bullets, the shape a word processor expects.\n- Copy and Download for each rendering, plus one combined report.\n\nThe parser walks the lines, measures each indent against the current level and pushes nodes onto a stack, which is why levels cannot skip: an indent that jumps two levels is read as the next available level rather than silently creating a gap. Renders are pure functions over the tree, so the three outputs always agree with each other and with the shape report. Everything runs in the page; the outline never leaves the browser.\n\n- The parser is indentation-based, so a genuinely skipped level is interpreted as a level rather than an error.\n- Prose attached to a line becomes a single node; there is no separate body text.\n- No reordering, dragging or collapsing — the tree comes from the text you wrote.\n- Bullets are optional and ignored in the shape, so mixing styles does not change the tree.\n- Very deep outlines render fine, but the classic scheme repeats markers past depth five. Mixed bullet styles in one document are tolerated as well, because the tree comes from indentation alone and the bullets are decoration.\n\nThe workflow is to dump the structure first and render second: write the shape quickly with rough indentation, read the population of each level to see where the outline is thin, then choose the rendering the destination wants. A numbered outline suits a review document, indented markdown suits a repository, and plain indented text suits a word processor — the same tree answers all three.\n\nThe neighbours handle the neighbouring shapes: the markdown editor extracts a heading outline from a finished document, the plot point mapper lays events over a named structure, and the scene board organises scenes with word counts. This tool is the one that starts from nothing and turns an indented outline typed in a box into a structure you can export. A population count reading ten at the first level and one at the third tells you the outline is a list with headings, and that is visible before anyone reads a node.",
    howTo: [
      { step: "Type or paste the outline, indented two spaces per level, with or without leading bullets." },
      { step: "Read the Shape panel for the item count, deepest level and population of each level." },
      { step: "Choose a rendering: indented markdown, a numbered outline in decimal or classic style, or plain indented text." },
      { step: "Copy or download the rendering you need; the combined report carries every view at once." },
    ],
    whenToUse:
      "Use the outline builder when the structure is the deliverable and it starts as indented text. The {{markdown-editor|Markdown Editor}} extracts an outline from a document that already has headings, while the {{plot-point-mapper|Plot Point Mapper}} lays story events over a named beat sheet instead of free indentation. The {{scene-and-chapter-organizer|Scene and Chapter Organizer}} adds word counts to a chapter list, and the block-based editor in this domain types structure directly as blocks.",
    faqs: [
      {
        q: "How does it decide the outline's levels?",
        a: "By indentation: two spaces per level, with tabs counted as four. Blank lines are skipped and levels never skip, so an indent that jumps two levels is read as the next available level rather than a gap.",
      },
      {
        q: "Do I need markdown bullets?",
        a: "No. Leading dashes are accepted and ignored for the tree, so you can paste either bullets or plain indented text. Mixing the two does not change the shape.",
      },
      {
        q: "What is the classic numbering scheme?",
        a: "The I. A. 1. a. i. markers by depth, alongside hierarchical decimals. Both renderings come from the same tree, so switching between them changes only the markers.",
      },
      {
        q: "Can I reorder items in the tool?",
        a: "No. The outline is edited as text and the tree follows it; there is no dragging or collapsing. Adjust the indentation and the shape report updates immediately.",
      },
      {
        q: "What does the shape report actually tell me?",
        a: "Item count, the deepest level and how many items sit at each level. A branch with ten items at level one and one at level three is a structure problem visible before you read a word.",
      },
    ],
  },

  "document-diff-viewer": {
    keywords: [
      "document diff viewer",
      "word diff",
      "unified patch",
      "lines added",
    ],
    intro:
      "The Document Diff Viewer compares two versions of a text with line, word and patch views and reports lines added, lines removed and words moved.",
    content:
      "Two drafts, one question: what changed? This document diff viewer takes an original and a revised text and answers in three views — a line-by-line diff, a word-level diff for the fine-grained read, and a unified patch in the familiar plus-and-minus form. The summary panel counts what the change actually cost: lines added, lines removed, words added and words removed, with the unchanged block named beside them. Developers will recognise the vocabulary; here it is applied to prose rather than code.\n\nThe two versions go in side-by-side panels and the compare control runs the calculation locally. Each diff row carries its own line numbers from both versions, so a change is traceable to a position rather than guessed at. The word diff shows changed runs inside otherwise identical text, which is how a single swapped adjective becomes visible instead of hiding inside a rewritten line. Copy patch and Download take the result out as text.\n\n- Two inputs: original and revised, compared on demand.\n- Line diff: every row with its old and new line numbers.\n- Word diff: changed runs inside otherwise matching lines.\n- Unified patch: context lines around each hunk, three lines by default.\n- Summary counts: lines added and removed, words added and removed, unchanged.\n- Copy patch and Download for the result as plain text.\n\nThe engine is the project's existing diff library — jsdiff — used for both the line and the word views, so the row tracking and the hunk formatting are the library's, not a home-grown approximation. Everything is computed synchronously in the page: nothing is uploaded, nothing is queued and the same pair of texts always produces the same patch. That reproducibility is the property that makes a diff trustworthy as a record of what a revision did.\n\n- Very large documents are diffed in one pass, so a whole-book comparison takes a moment on first run.\n- Line views depend on line breaks: a rewrapped paragraph reads as many changed lines even when the words barely moved.\n- Whitespace-only changes are shown rather than hidden; there is no ignore-whitespace mode.\n- The patch format is for reading and copying, not for applying to anything.\n- Encoding assumptions are the browser's: the comparison operates on JavaScript strings, not bytes.\n\nThe reading order that works is summary first, word diff second, line diff third: the summary says how big the change was, the word diff says what it did, and the line diff gives the positions. When a paragraph was rewrapped rather than rewritten, the word diff is the view that tells you so — which is the difference between a real edit and a formatting pass. Running the same comparison after every revision builds a habit as well: a diff taken before a rewrite and after it settles arguments about whether the edit actually helped.\n\nThe neighbours cover the workflow around comparison: draft versioning keeps the labelled snapshots you compare, and the manuscript formatter is the kind of pass whose output is worth diffing. For the counts behind either side of the comparison, the word count tool reports words with the frequency table included. Comparison is the only one of these views that shows change rather than state, which is why it is the one worth keeping a record of.",
    howTo: [
      { step: "Paste the original text into one panel and the revised text into the other." },
      { step: "Press Compare; the summary reports lines and words added, removed and unchanged." },
      { step: "Read the word diff for what changed inside lines, then the line diff for positions." },
      { step: "Copy patch or Download to keep the comparison as plain text." },
    ],
    whenToUse:
      "Use the document diff viewer whenever two versions of a text exist and the difference has to be shown rather than described. The {{draft-versioning-tool|Draft Versioning Tool}} keeps the labelled snapshots whose deltas feed this comparison, the {{manuscript-formatter|Manuscript Formatter}} produces the kind of formatting pass worth diffing, and the {{markdown-editor|Markdown Editor}} handles the case where one side is source. For the totals behind either side, the word count tool in this domain counts the same way the summary does.",
    faqs: [
      {
        q: "How does the word diff differ from the line diff?",
        a: "The line diff compares whole lines and numbers them from both versions; the word diff shows the changed runs inside lines that otherwise match. Use the word view when a line changed only slightly.",
      },
      {
        q: "What is in the unified patch?",
        a: "The same change in the conventional plus-and-minus form, with three context lines around each hunk by default. It is a readable record of the comparison, not a patch intended for application.",
      },
      {
        q: "Why does one rewrapped paragraph show as many changes?",
        a: "The line view depends on line breaks, so rewrapping replaces lines wholesale. The word diff is the view that shows the words barely moved — the difference between an edit and a formatting pass.",
      },
      {
        q: "Is my text uploaded for comparison?",
        a: "No. The diff library runs synchronously in the page; nothing is queued or sent. The same pair of texts always produces the same patch, which is what makes the result trustworthy as a record.",
      },
      {
        q: "Can I compare a whole book?",
        a: "Yes, in one pass, though a very large pair takes a moment on first run. Everything is computed in the browser, so the delay is processing rather than transfer.",
      },
    ],
  },

  "legal-citation-formatter": {
    keywords: [
      "legal citation formatter",
      "Bluebook 21",
      "introductory signal",
      "table of authorities",
    ],
    intro:
      "The Legal Citation Formatter formats one case or statute in Bluebook 21 with an introductory signal, the short forms a second reference needs, and a simplified table of authorities.",
    content:
      "Legal citations carry more than the source: a signal, a short form, and a place in the table of authorities. This legal citation formatter adds all three around the citation engine's Bluebook 21 output, one authority at a time, so a brief's citations can be assembled consistently. Cases and statutes take different fields, and the form changes with the type rather than showing fields the authority cannot use.\n\n- Type: court case or statute.\n- Introductory signals: 12 forms in Bluebook order, from (none) and See through See also, See e.g., Cf., Compare, But see, But cf., Contra, Accord, E.g., and See generally.\n- Short form: the second-reference form for the same authority, with a note number for a supra reference.\n- In-text: the engine's own short in-text form shown beside the full citation.\n- Table of authorities: add authorities to a grouped list, cases before statutes, and copy the table.\n- Copy citation and Download legal-citation.txt.\n- Warnings appear when the fields a signal or short form depends on are missing, so the notice arrives before the brief does.\n\nThe citation itself comes from the same Bluebook layer as the general formatter, so the case and statute patterns are identical between the two tools. What this tool adds is brief mechanics: the signal is affixed in the order the rules expect, the short forms are generated from the same fields, and the table of authorities is assembled from the authorities you have added, grouped cases-then-statutes. Signals are affixed in the order the rules expect, which is the part of Bluebook mechanics a pattern engine can get exactly right. The scope is stated on the page: Bluebook 21 here covers the case and statute patterns implemented, not signals-in-depth, jurisdictional variations or the reporter-abbreviation tables, and nothing printed is legal advice. The table of authorities is assembled from the same rows, so a citation and its entry cannot drift apart while the brief is being written.\n\n- Bluebook support covers the implemented case and statute patterns, not the whole rule set.\n- Signals-in-depth, jurisdictional variations and reporter abbreviations are out of scope.\n- Nothing here is legal advice, and no citation is verified against a reporter.\n- The table of authorities is simplified: cases grouped before statutes, without page numbers.\n- Short forms depend on the fields typed; a missing note number leaves a supra reference incomplete.\n- The same authority can be formatted again without adding it twice; the table is yours to curate.\n- Cases and statutes keep separate field sets, so a statute is never asked for a court or a reporter.\n\nUse it while assembling a brief: format each authority once, choose its signal, add it to the table, and copy both halves. Check every citation against the reporter before filing, because no lookup happens here by design. If two authorities share a signal, that is normal: the signal belongs to the sentence rather than to the source, and it is chosen per citation. The tool's value is consistency, with every citation in the brief passing through the same engine. The table and the citation are rendered from the same fields, which is how a brief's table stays correct while its citations are edited.",
    howTo: [
      { step: "Choose whether the authority is a court case or a statute." },
      { step: "Pick an introductory signal, or leave it at (none)." },
      { step: "Fill the citation fields; the full citation, in-text form and short forms update as you type." },
      { step: "Add the authority to the table of authorities, then Copy citation or Download." },
    ],
    whenToUse:
      "Use this tool for briefs, where signals and short forms matter. When the job is a bibliography or a reference list in the academic styles, the {{citation-formatter|Citation Formatter}} covers all eight source types, and its Bluebook style prints the same base citation without the brief mechanics.\n\nWhen the legal source is quoted inside a sentence and you want the in-text shape beside the full form, the {{in-text-citation-builder|In-Text Citation Builder}} shows the forms for case and statute sources, and the {{endnote-manager|Endnote Manager}} can number Bluebook notes in the order you arrange them.",
    faqs: [
      {
        q: "Which signals are offered?",
        a: "Twelve, in Bluebook order: (none), See, See also, See e.g., Cf., Compare, But see, But cf., Contra, Accord, E.g., and See generally. The chosen signal is prefixed to the citation exactly as selected.",
      },
      {
        q: "What short forms are generated?",
        a: "The second-reference forms for the authority, including a supra reference that uses the note number you enter when one is required. They are built from the same fields as the full citation.",
      },
      {
        q: "How is the table of authorities built?",
        a: "From the authorities you add to the list, grouped with cases before statutes. It is deliberately simplified — a working table rather than a page-numbered filing-ready one.",
      },
      {
        q: "Does Bluebook 21 mean every rule is implemented?",
        a: "No, and the page says so. The engine implements case and statute patterns. Signals-in-depth, jurisdictional variations and the reporter-abbreviation tables are outside its scope, so citations should be checked against the reporter.",
      },
      {
        q: "Is this legal advice?",
        a: "No. It is a formatting tool: every output is a function of the fields typed, with no lookup and no network call, and no citation is verified against any source.",
      },
    ],
  },

  "newspaper-article-citation-maker": {
    keywords: [
      "newspaper article",
      "APA 7, MLA 9 and Chicago 17",
      "publication date",
      "all three styles",
    ],
    intro:
      "The Newspaper Article Citation Maker formats one article in APA 7, MLA 9 and Chicago 17 at once and shows the fields each style expects of a newspaper entry.",
    content:
      "A newspaper entry turns on the things a book entry does not: the byline, the publication date with its day and month, the paper's own name, and whether the article was read in print or online. This newspaper article citation maker pins the source type, so the field set is always the newspaper field set and the three styles can be compared from one source. The comparison is the point: the same article reads differently in each style, and seeing the three entries together is the fastest way to choose one.\n\n- All three styles at once: APA 7, MLA 9 and Chicago 17.\n- Publication date (month and day): MLA and Chicago append the entry's year to the date, while APA keeps the year in its own field, exactly as those manuals order it.\n- Every style at a glance: the short entry, the full entry and the in-text form for each style.\n- A field table shows what each style expects of a newspaper entry, so gaps are visible before copying.\n- Copy entry and Download newspaper-citation.txt.\n- The download is deliberately multi-style, so the choice of style can be deferred until the reading list is assembled.\n- The byline is entered one author per line and parsed with the same Family, Given rule as the rest of the family.\n\nThe formatting runs through the same typed-metadata engine as the rest of the family, with the source type fixed to a newspaper article. The date is printed exactly as entered: no parsing, no locale formatting and no guessed order, because date order differs by style and the engine refuses to decide for you. Where MLA and Chicago need a year and the date field holds only the month and day, the year is appended; APA keeps its own year slot. Warnings report the fields the chosen style expects but the entry lacks, with the year and URL notes handled per style rather than as generic noise. The in-text form is generated beside the entry so the pair travels together, and the download contains every style rather than one at a time.\n\n- The date is printed as entered; no parsing or normalisation is applied.\n- It formats one article at a time.\n- Nothing is inferred from the URL: online publication details are printed from the fields you supply, not from the address.\n- Bluebook is not offered for newspaper articles here.\n- No lookup: the article is not fetched and no byline or quotation is verified.\n- Warnings name gaps; they cannot confirm a page number or a headline.\n\nUse it when an article is going into a paper or a reading list and the venue wants a specific style. Fill the byline, the date and the paper first, then the online details, and read the field table once before copying. If the article exists both in print and online, decide which copy you actually read before filling the URL: a citation describes the source you used. Headlines are printed as entered, capitalisation included, and the date is the field most often wrong, so read it once more than the others. The field table also doubles as a checklist for a reading list assembled over several days.",
    howTo: [
      { step: "Fill the newspaper article fields, including the publication date's month and day." },
      { step: "Choose APA 7, MLA 9 or Chicago 17." },
      { step: "Read the entry, the in-text form and the field table for that style." },
      { step: "Copy entry or Download newspaper-citation.txt for all three styles." },
    ],
    whenToUse:
      "Use the maker when the source is a newspaper article and you want the three styles compared before choosing one. When the source is a journal article, the {{academic-journal-reference-formatter|Academic Journal Reference Formatter}} carries the right field checklist, and when it is a book or a website the {{citation-formatter|Citation Formatter}} handles every source type in one place.\n\nWhen the article will sit inside a sentence rather than a list, the {{in-text-citation-builder|In-Text Citation Builder}} shows the parenthetical and narrative shapes side by side.",
    faqs: [
      {
        q: "Why is the year appended to my date in MLA and Chicago?",
        a: "Because those styles print the whole publication date in one place, so a month-and-day date gets the entry's year appended. APA keeps the year in its own slot and the date as entered, so its layout differs on purpose.",
      },
      {
        q: "My date looks exactly as I typed it — is that correct?",
        a: "Yes, and it is deliberate. The engine does not parse or reorder dates, because date order differs by style and locale, and a wrong guess would be worse than the text you entered.",
      },
      {
        q: "Can I format a magazine or a blog post here?",
        a: "The source type is pinned to a newspaper article, so the field set and rules assume a newspaper: paper name, byline and a print-or-online reading. For other source types, the citation formatter is the right tool.",
      },
      {
        q: "What does the field table show?",
        a: "It lists what each of APA 7, MLA 9 and Chicago 17 expects of a newspaper entry, one column per style, so the fields you have not supplied are visible before you copy anything.",
      },
      {
        q: "Is the article verified?",
        a: "No. Nothing is fetched and no byline, headline or page number is checked. The tool formats what you type, with no network call anywhere.",
      },
    ],
  },
};
