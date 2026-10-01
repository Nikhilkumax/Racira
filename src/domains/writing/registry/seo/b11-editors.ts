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
    keywords: ["markdown editor", "Markdown", "preview", "outline", "CommonMark"],
    intro:
      "The Markdown editor writes in plain text on one side and shows the rendered preview, the heading outline and a document summary on the other — all in your browser, with no upload.",
    content: `A Markdown editor is worth having because Markdown is legible before it is rendered. You type plain text with a few marks, and the editor shows what those marks will become while you can still read and diff the source. This markdown editor puts the source on the left and the rendered preview on the right, and adds a heading outline and a document summary below so you can see the shape of the draft as you build it.

The renderer implements CommonMark plus the extensions writers reach for: tables, strikethrough, autolinks and task lists. Raw HTML in the source is escaped rather than executed, so a pasted tag is shown as text — which means the preview needs no separate sanitising pass, because there is nothing unsafe to strip. Links are checked by the renderer's own rules, so a javascript: URL in a link destination is not turned into a live link.

The outline is the part that is easy to underrate. Headings are pulled out as a nested list with anchors, so a long document shows its own table of contents without you maintaining one by hand. The summary counts words, lines, headings, links, code blocks and list items, which is enough to tell at a glance whether a section has grown past its budget. Copy the outline or the source with one click.

Because the source is plain text, Markdown travels well. The same file that renders here can become a README, a documentation page, a note in a code review or the body of a static site, and the marks that give it structure stay readable in any plain editor. That portability is the reason to draft in Markdown at all, and the reason the editor keeps the source, the preview and the outline on one screen: you edit the text rather than a formatted document, and you can see the result without leaving the page. Reading the preview also makes a long draft's inconsistencies obvious — a heading used where emphasis was meant, a list that should have been a table — before a renderer turns them into structure.

Nothing on the page is uploaded and nothing is stored beyond the tab: the draft lives in the text area and in whatever you copy or download. There is no account and no network call, so the editor works the same offline as online. The .md file downloads as plain text and renders anywhere Markdown is understood, from a README to a static site.

What the editor does not do is as clear as what it does. It does not syntax-highlight code blocks, render diagrams or typeset mathematics; those are separate concerns with their own tools. It does not export to Word or PDF, and it does not publish anywhere. It is a writing and preview surface for Markdown, and the page says so rather than implying a full desktop editor's feature set. Because the source is plain text, any other Markdown tool can pick it up unchanged, which is the point of choosing this format in the first place.`,
    howTo: [
      { step: "Write or paste Markdown into the source pane; the preview updates as you type." },
      { step: "Use headings to build the outline; levels one to three are shown in outline form." },
      { step: "Read the summary to check words, lines, headings and links." },
      { step: "Copy the source or download the .md file; render it wherever you publish." },
    ],
    whenToUse: `Use the Markdown editor when the draft is Markdown and you want the rendered preview and structure beside the source. When you need to see what changed between two versions of a Markdown file, the {{document-diff-viewer|Document Diff Viewer}} compares them line by line, and for a plain word and character tally the {{word-count-tool|Word Count Tool}} is the lighter option.

For prose that wants no chrome at all, the {{distraction-free-writing-editor|Distraction-Free Writing Editor}} drops the preview and the panels so only the text is on screen.`,
    faqs: [
      {
        q: "Is raw HTML in my Markdown executed?",
        a: "No. The renderer runs with raw HTML disabled, so a tag you type is escaped and shown as text rather than becoming markup. That is why the preview needs no separate sanitiser: there is nothing to sanitise.",
      },
      {
        q: "Which Markdown features are supported?",
        a: "CommonMark plus tables, strikethrough, autolinks and task lists. Code blocks render as plain monospace text without syntax highlighting, and diagrams, math and footnotes-as-popovers are not part of this renderer.",
      },
      {
        q: "Does my draft leave this browser?",
        a: "No. The draft lives only in the tab where you are editing, and in whatever you copy or download. There is no account, no autosave to a server and no upload, so closing the tab discards it unless you have downloaded the file.",
      },
      {
        q: "Can I export to Word or PDF?",
        a: "Not directly. You can download the .md source and open it in any tool that converts Markdown, or copy the source into a document. The editor is a writing and preview surface, not a publishing pipeline.",
      },
      {
        q: "How is the outline built?",
        a: "Every heading becomes an entry in a nested list with an anchor, and headings at levels one to three are shown in the outline panel. It is derived from the source headings, so it stays in step as the document changes.",
      },
    ],
  },

  "outline-builder": {
    keywords: ["outline builder", "outline", "numbered outline", "indentation", "word processor"],
    intro:
      "The outline builder reads an indented outline into a tree and renders it back as indented markdown, a numbered outline (1. / 1.1 or I. / A. / 1.) and plain indented text for a word processor.",
    content: `The outline builder does the small, fiddly job of turning a loose list of headings into a clean, numbered structure. You type the outline as indented lines — a section on one line, its subsections indented beneath it — and the tool reads the indentation into a tree, reports the shape, and writes it back out three ways: as indented markdown, as a numbered outline, and as plain indented text you can paste into a word processor.

Indentation is the whole interface, and the tool is forgiving about it. Leading dashes or numbers are optional, a tab counts as one level, and the parser normalises spacing so a pasted block with inconsistent indents still resolves. Crucially, an outline can only descend one level at a time: a line indented twice as deep as the line above it becomes a grandchild, not a line that skips a level and leaves the tree full of holes. That single rule is what keeps a hurried outline usable after the fact.

Numbering comes in two schemes. Decimal numbers give the familiar 1., 1.1, 1.1.1 pattern that reads well in technical documents and specs. The classic scheme gives I., A., 1., a., i., the traditional outline form for essays and reports. In both, the numbers are computed from the tree rather than stored, so reordering or re-indenting a line renumbers everything below it with no cleanup. Level counts sit beside the numbering, so you can see how deep the deepest branch runs.

The shape summary is deliberately plain: how many items the outline holds in total, how deep it goes, and how many items sit at each level. Those three numbers catch the two common mistakes — a section that has quietly become a buried sub-sub-subsection, and a branch that has one lonely child. Copy or download the rendering you need; the plain indented form drops the bullets and numbers so your word processor can apply its own heading styles.

The reverse direction matters too. Because the tool reads indentation, you can paste a rough outline from a notes app or a chat thread and get back a clean tree with sensible numbering, rather than retyping it indent by indent. It is equally useful at the end of an outline's life: the plain indented rendering, stripped of bullets and numbers, is the form a word processor wants when you apply heading styles, and the numbered rendering is the form a spec or a report wants when readers will refer to sections by number. Either way the structure you settled in the editor is carried through unchanged.

Everything runs in the browser, with no account, no upload and no storage beyond the tab. The builder is a structural helper, not a document generator: it does not decide what your sections should be, cannot infer an outline from a paragraph of prose, and does not export to DOCX or OPML. It reads indentation, counts the tree and formats the result, and it says so on the page. Because the three renderings are pure functions of the tree, moving a line changes every number below it consistently, which is exactly the discipline a hand-numbered outline punishes you for missing.`,
    howTo: [
      { step: "Type or paste the outline with one section per line, indented by two spaces per level." },
      { step: "Pick the numbering scheme: decimal 1. / 1.1, or classic I. / A. / 1. / a." },
      { step: "Read the shape summary to check the depth and the items at each level." },
      { step: "Copy the numbered outline, the markdown, or the plain indented text." },
      { step: "Download the report and paste the outline into your word processor." },
    ],
    whenToUse: `Use the outline builder when a document's structure is the thing you are deciding and you want it numbered without hand-editing. When you need to see how the outline has moved since the last draft, the {{document-diff-viewer|Document Diff Viewer}} compares the two versions, and for a plain item tally the {{word-count-tool|Word Count Tool}} is the lighter check.

Once the outline is settled and you are drafting, the {{markdown-editor|Markdown Editor}} shows the same headings rendered with an outline of its own.`,
    faqs: [
      {
        q: "How does it decide what is nested under what?",
        a: "By indentation. A line indented one unit deeper than the line above it becomes that line's child, and a line at the same or a shallower indent closes the levels above it. Leading dashes or numbers are ignored when the depth is read.",
      },
      {
        q: "Can a line skip a level?",
        a: "No. An outline may only descend one level at a time, so a line indented far deeper than its parent becomes a grandchild rather than a level-three item with no level two. That keeps the tree valid no matter how the source was pasted.",
      },
      {
        q: "Does it export to Word or OPML?",
        a: "Not to those formats. It produces indented markdown, a numbered outline and plain indented text, any of which you can copy or download and paste into a word processor to apply your own styles.",
      },
      {
        q: "Do the numbers stay correct when I reorder items?",
        a: "Yes. Numbering is computed from the tree each time the outline changes, never stored, so moving or re-indenting a line renumbers everything below it consistently.",
      },
    ],
  },

  "document-diff-viewer": {
    keywords: ["document diff viewer", "diff", "unified patch", "line by line", "word by word"],
    intro:
      "The document diff viewer compares two drafts line by line or word by word, shows a stats summary of what changed, and writes a unified patch — all locally, with nothing uploaded.",
    content: `A document diff viewer answers one question quickly: what changed between these two versions? Two text areas take the original and the revised draft, and the comparison runs immediately, in the browser, with no upload and no history kept. The result comes in three layers — a visual diff you can read, a stats summary that quantifies the change, and a unified patch you can copy.

The line view aligns the two drafts and marks each row as unchanged, added or removed, carrying the old and new line numbers so you can move between the versions. The word view zooms in on the same change and highlights the runs of words that differ inside lines that are otherwise identical, which is what you want when a sentence has been edited rather than replaced. Switching between the two views is a single control and neither costs a round trip.

That pairing is what makes the tool useful for revision. Comparing two drafts line by line catches a paragraph that was moved, split or deleted; comparing them word by word catches the smaller edit — a reworded clause, a changed number, a softened claim — that a line view would show only as a changed line. Reading the same change both ways is often how you decide whether an edit is cosmetic or substantive. Paste the two versions, read the summary, then switch the view to confirm the specific change you care about. The two panes accept text from anywhere — a notes app, an email draft, a code editor — because the comparison runs on characters, not on a file format. Nothing is transmitted at any point, so even a sensitive draft can be compared here.

The summary is deliberately blunt. It reports how many lines were added and removed, how many words were added and removed, and a percentage of unchanged text, so a large-looking edit that only touched punctuation reads differently from a genuine rewrite. Those four numbers and the similarity figure are usually enough to decide whether a revision needs a careful read or a glance.

The unified patch is the familiar machine-readable form, with context lines and hunk headers, copyable or downloadable for a commit message, a code review or a note to a collaborator. It is generated from the same comparison, so the patch and the visual diff can never disagree. Because the whole thing is client-side, you can paste text you would not upload to a service — a private draft, a contract, a set of notes — and nothing leaves the tab.

What it does not do is as important. It compares text, not documents: there is no file upload, no DOCX or PDF parsing, no three-way merge and no stored version history, so you paste the plain text of each version. It reports what differs, never which version is better, and it cannot tell a deliberate edit from a typo. For a working draft that is exactly the right scope: the tool tells you precisely where the two texts part company and leaves the judgement to you.`,
    howTo: [
      { step: "Paste the original text into the first pane and the revised text into the second." },
      { step: "Choose line by line for wholesale changes or word by word for fine edits." },
      { step: "Read the summary: lines and words added and removed, and how much is unchanged." },
      { step: "Scan the marked rows, then copy or download the unified patch." },
    ],
    whenToUse: `Use the document diff viewer whenever two versions of the same text exist and you need to see the difference rather than read both. When the drafts are Markdown, the {{markdown-editor|Markdown Editor}} renders one of them so you can read the change in context, and for a quick count of how much longer the new version is, the {{word-count-tool|Word Count Tool}} gives the totals.

When the change you are checking is a rewrite rather than a comparison — words you lean on too often, or passages that read heavily — the {{overused-word-finder|Overused Word Finder}} looks at a single text instead of a pair.`,
    faqs: [
      {
        q: "Does it upload my documents?",
        a: "No. The comparison runs entirely in your browser against text held in the two panes. Nothing is sent anywhere, no history is kept, and closing the tab discards the text — which is what makes it safe for private drafts.",
      },
      {
        q: "What is the difference between the line and word views?",
        a: "The line view shows whole lines added or removed, with old and new line numbers, which suits structural edits. The word view highlights the changed runs of words inside otherwise identical lines, which suits sentence-level edits.",
      },
      {
        q: "Can I compare Word or PDF files?",
        a: "Not directly. It compares plain text, so copy the text out of the files and paste it in. There is no DOCX or PDF parsing and no file upload, and the two panes are text areas rather than drop zones.",
      },
      {
        q: "What is the unified patch for?",
        a: "It is the standard +/- format with context lines and hunk headers, useful in a commit message, a code review or a message to a collaborator. It is generated from the same comparison as the on-screen diff, so the two always match.",
      },
      {
        q: "Does it keep a history of versions?",
        a: "No. There is no versioning here: you supply two texts and it compares them. To track a draft over time, export each version and compare the pair you care about.",
      },
    ],
  },

  "legal-citation-formatter": {
    keywords: ["legal citation formatter", "Bluebook", "signal", "short form", "table of authorities"],
    intro:
      "The legal citation formatter writes a case or a statute in Bluebook 21 form, adds the introductory signal and the Id. and supra short forms, and groups the citations you add into a simplified table of authorities.",
    content: `Legal citation has its own book, and this legal citation formatter implements the part of it that a single entry needs. Enter a case — case name, volume, reporter, first page, court and year — or a statute — code title, section and year — and the formatter writes the Bluebook 21 citation. Around the citation it offers the two things a brief needs next: the introductory signal that tells the reader how the authority is being used, and the short forms for a later reference.

Signals carry meaning in Bluebook style, and the tool lists the common ones — See, See also, Cf., But see, Contra, Accord, E.g., See generally — so you choose rather than guess. The chosen signal is prefixed to the citation, and the page prints the signal on its own so you can see what it thinks you picked. Short forms matter just as much: Id. is for a source cited in the immediately preceding note, and a supra form names the earlier note, so the tool builds "Id. at 460." or "Smith, supra note 4 at 460." from a note number and an optional pinpoint page.

The table of authorities is the feature that turns a pile of citations into a section a reader can use. Citations you add are grouped with cases first and statutes after, alphabetised inside each group, and the whole table can be copied as plain text. It is a simplified table: real tables of authorities break out constitutional provisions, regulations and secondary authorities, and page numbers depend on the finished document, which this tool cannot know. The page states that plainly.

Keeping the authorities in one place also makes the citations consistent: change the reporter abbreviation once and the group reflects it, and the same case cannot appear two ways in one table. When a citation is long or an entry is awkward, the short-form panel builds the second-reference form so a brief does not repeat the whole string each time. Signals and short forms are the two places legal writing is most often inconsistent, and printing them beside the citation is what lets a reader — and you — check them at a glance before the document goes out.

Everything is computed from the fields you type. There is no lookup, no reporter-abbreviation table and no network call, which is exactly why the output is checkable against the current edition rather than merely plausible. The tool formats the case and statute patterns the citation engine implements; it does not cover signals in depth, jurisdiction-specific rules or the full Bluebook apparatus.

This is not legal advice and not a citation checker, and the page says so twice. Bluebook rules are detailed and change between editions, reporter abbreviations vary by jurisdiction, and a citation that looks correct can still fail a court's own requirements. Use the formatter to get the mechanical shape right and to keep a consistent table of authorities, then verify every entry against the current edition before you file. Where the rule is subtle, the answer is in the book, and the tool points you there rather than inventing a rule.`,
    howTo: [
      { step: "Choose court case or statute and fill the fields: case name or code title, reporter or section, volume, page, court and year." },
      { step: "Pick the introductory signal that matches how you are using the authority." },
      { step: "Read the formatted citation, its in-text form and the short form." },
      { step: "Add the citation to the table of authorities; cases and statutes group automatically." },
      { step: "Copy the citation or the table, and check every entry against the current edition." },
    ],
    whenToUse: `Use the legal citation formatter when the source is a case or a statute and you need the Bluebook shape, a signal and a short form. For the academic styles the {{citation-formatter|Citation Formatter}} covers APA 7, MLA 9 and Chicago 17 side by side, and when the legal citations sit in a document whose references also include articles and books, the {{bibliography-builder|Bibliography Builder}} keeps the non-legal sources in one list.

When a case or statute is already in your notes and you only need the second-reference form, the short-form panel here builds Id. and supra directly; the {{footnote-formatter|Footnote Formatter}} handles the note layout if the citations are footnotes.`,
    faqs: [
      {
        q: "Which Bluebook edition is implemented?",
        a: "The 21st edition, for the case and statute patterns the citation engine covers: case name, volume, reporter, first page, court and year; code title, section and year. Signals and the Id. and supra short forms are built around those.",
      },
      {
        q: "Is the table of authorities complete?",
        a: "No, and the page says so. It groups cases first and statutes after, alphabetised within each group. Real tables also break out constitutional provisions, regulations and secondary authorities, and their page numbers depend on the finished document.",
      },
      {
        q: "When do I use Id. instead of supra?",
        a: "Id. refers to the source cited in the immediately preceding note, so it needs no name. A supra form names the earlier note's number and works for any source cited before the last one. The tool builds both; the choice depends on where the note falls.",
      },
      {
        q: "Does it shorten reporter names automatically?",
        a: "No. There is no reporter-abbreviation table and no lookup, so you type the reporter abbreviation exactly as the rules require. That keeps the output a function of your input, which is what makes it checkable.",
      },
      {
        q: "Is this legal advice?",
        a: "No. It is a formatting tool. Bluebook rules are detailed and vary by jurisdiction, and a mechanically correct citation can still fail a court's requirements, so verify every entry against the current edition before filing.",
      },
    ],
  },

  "newspaper-article-citation-maker": {
    keywords: ["newspaper article citation maker", "newspaper article", "byline", "APA 7", "URL"],
    intro:
      "The newspaper article citation maker quotes one article in APA 7, MLA 9 and Chicago 17 at once, with a per-style field checklist and warnings for the details a newspaper entry turns on.",
    content: `A newspaper article is a citation type with its own traps: the byline may be missing, the date matters to the day, the paper's name has to be right, and it may have been read in print or online. This newspaper article citation maker fixes the source type and turns those details into a correct entry, in APA 7, MLA 9 and Chicago 17, with all three shown together so you can see how the same article reads in each style.

You enter the byline, the headline, the newspaper's name, the publication date as you would read it (for example 5 May 2026), the year, and either the print page or the article's URL. The date handling is the part that most tools get wrong: APA keeps its own year slot and takes the day and month in parentheses, while MLA and Chicago print the whole publication date, so the formatter appends the year to a day-month date for those two styles only. That means the same "May 5" and "2021" you typed produce (2021, May 5) in APA and "May 5, 2021" in MLA and Chicago, with no manual fix-up.

The per-style field checklist names what each edition expects — how the byline is inverted, whether the headline is cased and quoted, how the paper's name is styled, where the date sits, and how the location is given for print versus online. It is there so you can compare the tool's assumptions against the style manual or the target publication's own guidance, and so a missing field is visible rather than implied. Warnings appear for the fields a newspaper entry needs and the entry lacks: no newspaper name, no date to the day, no page or URL.

The at-a-glance panel is the other half of the value: writing a footnote in one style while a bibliography needs another is a common source of mismatch, so the three entries sit side by side from the same fields. Change the byline and all three update; add the URL and each style places it where its edition puts it. That keeps a paper's citations internally consistent when the same article is quoted in two documents — a news story cited in an essay and again in a report — without retyping the details for each. None of it is looked up, so what you see is exactly the data you entered, arranged three ways.

Everything is computed locally. There is no lookup: the tool does not fetch the headline, resolve the URL or confirm the paper's name, and it cannot tell whether an article you read online also appeared in print. It formats the values you supply, in three editions, and it says so rather than implying a service behind the form.

Because the three entries are pure functions of the fields, the same article always produces the same citations and the same warnings, which is what makes the output checkable. Copy the entry you need for the style you are writing in, or download all three side by side, and treat the checklist as the answer to the editor's question of whether you gave them what they asked for.`,
    howTo: [
      { step: "Enter the byline, headline and the newspaper's name." },
      { step: "Add the date as you read it, the year, and either the print page or the article's URL." },
      { step: "Choose APA 7, MLA 9 or Chicago 17 and read the entry, the in-text form and any warnings." },
      { step: "Compare the three entries in the at-a-glance panel and the field checklist below." },
      { step: "Copy the entry you need, or download all three styles." },
    ],
    whenToUse: `Use the newspaper article citation maker when the source is an article in a paper and the byline, date or print-versus-online detail is the thing to get right. When the article is on a website rather than in a paper, the {{citation-formatter|Citation Formatter}} handles the web page type, and when several articles join a longer reference list the {{reference-list-generator|Reference List Generator}} keeps the list and its markers together.

If the article is an academic one, the {{academic-journal-reference-formatter|Academic Journal Reference Formatter}} covers volume, issue, page range and DOI, which a newspaper entry does not need.`,
    faqs: [
      {
        q: "Why does the date appear differently in each style?",
        a: "APA keeps a separate year slot and puts the day and month in parentheses, while MLA and Chicago print the whole publication date. The tool appends the year to a day-month date for MLA and Chicago only, so the same input reads correctly in all three.",
      },
      {
        q: "What if the article has no byline?",
        a: "Enter the headline and leave the byline empty. The entry will start with the headline where the style allows it, and the warnings panel will note that no author was given so the missing name is visible rather than silently dropped.",
      },
      {
        q: "How do I cite a print article versus an online one?",
        a: "For print, give the newspaper's page; for online, give the article's URL. The field checklist shows where each style puts the location, and the warnings note when neither a page nor a URL is present.",
      },
      {
        q: "Does it fetch the article or check the newspaper's name?",
        a: "No. There is no lookup and no network call. The tool formats the headline, newspaper name and URL you type; it cannot confirm that a paper exists under that name or that a URL resolves.",
      },
    ],
  },
};
