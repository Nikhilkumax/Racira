import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B12, story organisers: authored SEO entries for the scene and chapter
 * organizer, the draft versioning tool, the plot point mapper, the story beat
 * builder and the manuscript formatter.
 *
 * Each entry states the structure it works from, that the reference placements
 * are conventions rather than rules, and that nothing is generated — the writer
 * supplies the events and the tool arranges and counts them. Keys are registry
 * slugs; see ../tool-seo.ts for the contract.
 */
export const B12_ORGANIZERS_SEO: Record<string, ToolSeo> = {
  "scene-and-chapter-organizer": {
    keywords: [
      "scene organizer",
      "point of view",
      "scene board",
      "word count",
    ],
    intro:
      "The Scene and Chapter Organizer reads a scene board with point of view, setting and word count, and reports how the words distribute across scenes and points of view.",
    content:
      "A scene organizer for a novel is a list with opinions: one line per scene, carrying its title, point of view, setting and word count. This scene board reads that list, tallies the statistics a novelist actually uses — how the words distribute across scenes and across points of view, and which scenes are the outliers — and round-trips the whole board as JSON so it survives a refresh without a server. The trailing fields are optional, so a title-only list works and gains detail as you add it.\n\nThe shape-of-the-story panel reports scenes, total words, average scene, median scene, distinct settings, the longest scene and the shortest, plus a point-of-view tally. When a scene has no explicit word count, the summary words of its line stand in, so the numbers are never zero by accident. Each scene can be copied as markdown — one heading per scene — and the board exports as JSON and imports back with every entry validated.\n\n- Scene lines: Title, POV, Setting, Words — trailing fields optional.\n- Scene statistics: count, total words, average and median scene length.\n- Outliers: longest and shortest scenes named on the board.\n- Point-of-view tally: how many scenes and words each perspective carries.\n- Copy board as markdown, one heading per scene.\n- Export the board as JSON and import it back, validating every entry.\n\nParsing splits each line on the pipe separator and coerces the trailing word count when present; statistics are arithmetic over that list. The JSON round trip exists because a board is data: serializeScenes writes the list out and the importer validates each entry on the way back, so a corrupted paste fails with an error instead of silently corrupting the board. Nothing is uploaded — the board lives in the text box and the exported file.\n\n- The board is text, not a drag-and-drop editor: reordering means editing lines.\n- Word counts you enter are used as given; summary words are a fallback, not a correction.\n- A pipe inside a title is not supported, because the separator is literal.\n- POV analysis depends on how consistently the POV field is spelled; case is normalised, nicknames are not.\n- The median on very small boards can sit between two scenes, which is a property of medians rather than a bug. On a small board the longest and shortest rows matter for the same reason: one outlier moves the average while the median stays where the typical scene is.\n\nWork the board from the outliers: read the longest and shortest scenes first, then the point-of-view tally, because an imbalance in either is a structural note before it is a prose problem. A first draft usually reveals a scene that runs twice the median and a POV carrying eighty percent of the words — both are visible on this panel without any counting by hand. A board that starts as three lines and grows to thirty keeps the same panel, so the statistics are there from the first scene rather than only after the draft is finished.\n\nThe story neighbours share the same reference structures: the plot point mapper lays events over a named beat sheet, the story beat builder tracks drafting progress across those beats, and the outline builder shapes the structure before scenes exist.",
    howTo: [
      { step: "Enter one scene per line as Title, POV, Setting, Words — trailing fields optional." },
      { step: "Read the Shape of the story panel for scene count, total words, average, median, outliers and settings." },
      { step: "Check the point-of-view tally for balance across perspectives." },
      { step: "Copy the board as markdown, or export and re-import the JSON board to move it between sessions." },
    ],
    whenToUse:
      "Use the scene and chapter organizer when a draft has enough scenes to need a board. The {{plot-point-mapper|Plot Point Mapper}} lays those scenes over a named structure, and the {{story-beat-builder|Story Beat Builder}} tracks which beats are drafted as progress. For structure before scenes exist, the {{outline-builder|Outline Builder}} renders an indented outline three ways, and the writing goal tracker in this domain counts the daily words those scenes accumulate.",
    faqs: [
      {
        q: "What format are the scene lines in?",
        a: "Title, POV, Setting, Words separated by pipes, with the trailing fields optional. A line with only a title still counts as a scene, and its summary words stand in for a word count you have not entered.",
      },
      {
        q: "What does the point-of-view tally show?",
        a: "How many scenes and how many words each perspective carries. The field is matched case-insensitively, so Alex and alex tally together, but nicknames for the same character do not merge.",
      },
      {
        q: "How do I move a board to another session?",
        a: "Export it as JSON and import it back later. The importer validates every entry, so a truncated or corrupted file fails with an error rather than silently replacing your board.",
      },
      {
        q: "Why is the median different from the average?",
        a: "One long scene pulls the average up while the median stays near the typical scene. Both are shown because the gap between them is the quickest signal that the distribution is lopsided.",
      },
      {
        q: "Is there a drag-and-drop board view?",
        a: "No. The board is text — one line per scene — which is what makes it exportable, diffable and pastable. Reordering means editing the lines, and the statistics update as you type.",
      },
    ],
  },

  "draft-versioning-tool": {
    keywords: [
      "draft versioning",
      "version label",
      "word delta",
      "timeline",
    ],
    intro:
      "The Draft Versioning Tool saves labelled snapshots of a draft in the browser and shows the word delta between each version and the next.",
    content:
      "Draft versioning here is deliberately small: a version is a label and the text you saved under it, kept in this browser with no server behind it. Paste or type a draft, give it a version label, save, and the timeline grows. What makes the tool worth using is not the storage — a folder of files does that — but the word delta: every row shows how the count moved from the version before it, which is the number writers actually argue about.\n\nThe timeline lists each saved version with its word count and the change against the previous one, so a rewrite that cut forty words reads as minus forty at a glance. The latest change panel names what happened between the last two snapshots: unchanged, words added, words removed. The report copy carries the whole running total across every adjacent pair, which is how a week of revision sessions becomes one paragraph of numbers rather than a folder of guesses. The latest change row is the quick read and the timeline is the argument; between them, a week of saving turns into a shape — cuts, additions, and a session that changed nothing — that no single document shows on its own.\n\n- Version label: the name you save each snapshot under, shown on the timeline.\n- Draft text: the content of the snapshot, kept as typed.\n- Timeline rows: word count per version plus the change against the previous version.\n- Latest change: the delta between the most recent two snapshots.\n- Comparison: the same word-level diff the document diff viewer uses, applied to two saved versions.\n- Copy report for the running total across every adjacent pair.\n\nSnapshots are saved through the shared browser-storage hook, so they live in this browser and nowhere else. Comparison reuses the document diff engine, which means what changed between draft two and draft three is literally the same calculation the diff viewer performs — one word diff implementation behind both pages. The word counts come from the shared tokenizer, so the deltas agree with every other counter in this domain.\n\n- No history beyond this browser: another device or a cleared cache will not see the versions.\n- A version stores the text as it was saved, so later edits to the box do not rewrite it.\n- There is no diff view in this tool itself; opening two snapshots side by side belongs to the diff viewer.\n- Labels are free text and never validated, so duplicate labels are allowed and distinguished by position.\n- Very long drafts save fine, but each snapshot stores the full text rather than a patch.\n\nThe habit that makes versioning work is saving before the risky change rather than after the good result: a labelled snapshot before a structural rewrite is what lets you quantify what the rewrite cost. Save at natural boundaries — before an outline passes, after feedback, at the end of a session — and the timeline becomes a record of decisions rather than a backup.\n\nFor the substance of a change rather than its size, the document diff viewer opens two texts and shows line, word and patch views; the writing goal tracker records daily totals instead of named snapshots; and the word count tool gives the figure the delta is computed from. For a draft that already has a home elsewhere, the box is still the session's record: paste at the start, save at the end, and the timeline carries the week's shape without anyone maintaining a folder.",
    howTo: [
      { step: "Paste or type a draft, then give it a version label that names the moment — after feedback, before the rewrite." },
      { step: "Save the version; it joins the timeline with its word count." },
      { step: "Read the timeline for the word delta against the previous version and the latest change panel for what happened." },
      { step: "Copy the report for the running total across every adjacent pair of versions." },
    ],
    whenToUse:
      "Use draft versioning when you want named snapshots and the numbers between them. The {{document-diff-viewer|Document Diff Viewer}} shows what changed inside a single pair of texts, line by line and word by word, while the {{writing-goal-tracker|Writing Goal Tracker}} records daily totals instead of named versions. For a surface that stays out of the way while you produce the drafts, the {{distraction-free-writing-editor|Distraction-Free Writing Editor}} is the writing half of the same workflow.",
    faqs: [
      {
        q: "Where are my versions stored?",
        a: "In this browser, through the same local-storage hook the other writing surfaces use. There is no server and no history beyond this tab's storage, so download anything that matters.",
      },
      {
        q: "How is the word delta calculated?",
        a: "Word counts come from the shared Unicode tokenizer, and each row shows the count minus the previous version's count. Comparison between two snapshots reuses the document diff engine's word diff.",
      },
      {
        q: "Can I see the actual changes between versions?",
        a: "This tool shows size and direction, not content. Open the two texts in the document diff viewer for the line-by-line and word-level view; the comparison function behind both pages is the same.",
      },
      {
        q: "What happens if I edit a draft after saving it?",
        a: "Nothing changes in the saved version — a snapshot stores the text as it was at save time. Your edits accumulate in the box until you save the next labelled version.",
      },
      {
        q: "Can two versions share a label?",
        a: "Yes. Labels are free text and never validated; versions are distinguished by their position on the timeline, so a repeated name is a duplicate rather than an error.",
      },
    ],
  },

  "plot-point-mapper": {
    keywords: [
      "plot point mapper",
      "beat sheet",
      "beats mapped",
      "three-act",
    ],
    intro:
      "The Plot Point Mapper maps your story's own events onto a named beat sheet and reports which beats are covered and which are still blank.",
    content:
      "A beat sheet is a reference, and mapping is where a story meets one. This plot point mapper takes a named structure — three-act, four-act, Save the Cat or the hero's journey — and lays your events over its beats: one line each, in your own words, matched to a beat of the sheet. The map then reports how much of the structure is covered and which beats are still blank, which is the question a writer with a half-finished outline actually has.\n\nThe structure picker selects the sheet; the events box takes one event per line as beat name, then what happens. The coverage panel counts beats mapped out of the total, and the sheet panel lists every beat with its placement percentage and your note beside it. Copy and Download produce the map as a markdown document, one beat per line with its placement, which is how the map becomes a document rather than a session.\n\n- Structures: three-act, four-act, Save the Cat and the hero's journey.\n- Event lines: beat name, a colon, then what happens — one event per line.\n- Coverage: beats mapped out of the total the sheet defines.\n- The sheet: every beat with its conventional placement and your note.\n- Blank beats: the uncovered parts of the structure, visible on the list.\n- Copy and Download for the map as markdown.\n\nThe structures live in one reference module shared with the story beat builder, so the two tools can never disagree about where a beat lands. Each structure is a list of beats carrying the share of the story where that beat conventionally sits, and the map is an ordinary lookup: your notes are parsed into a table and matched against the beats the chosen sheet defines. Nothing here is generated — these are reference outlines, and the pages say the placements are guidance rather than rules.\n\n- Placement percentages are the conventional readings of each structure, not measurements of your story.\n- A note only appears against a beat the chosen sheet defines, so a free-form event name without a matching beat is not shown.\n- Switching structures discards the visual match, because the beats differ between sheets.\n- The mapper records intent rather than drafts; writing the scene is still your work.\n- The four sheets are a finite reference set; a structure of your own is not representable.\n\nThe useful pass is the blank-beat read: choose the structure you are actually writing in, map what you have, and look at what remains empty. Two blanks in a row usually means a missing turn rather than a missing scene, and one blank at the end usually means the resolution is unwritten. When a beat is covered but the note is thin, that is the sheet telling you where the story still needs an event. Mapping is also the cheapest way to test a structure before committing to it: if the beats cannot be named from what you have, the sheet is probably wrong for this story rather than the story being wrong.\n\nThe neighbouring tools share the same structures from the other side: the story beat builder tracks drafting progress instead of notes, the scene board adds point of view and word counts, and the outline builder shapes structure before a beat sheet is chosen. The map is a starting position, not a constraint — plenty of drafts keep it open until the second act, and the coverage panel is equally useful at ten percent as at ninety.",
    howTo: [
      { step: "Pick a structure: three-act, four-act, Save the Cat or the hero's journey." },
      { step: "Enter your events one per line as beat name, a colon, then what happens." },
      { step: "Read the coverage panel for beats mapped, then scan the sheet for the beats still blank." },
      { step: "Copy or download the map as markdown when the structure needs to become a document." },
    ],
    whenToUse:
      "Use the plot point mapper when a story has events and needs a structure to test them against. The {{story-beat-builder|Story Beat Builder}} tracks which beats are drafted rather than what happens in them, and the {{scene-and-chapter-organizer|Scene and Chapter Organizer}} adds point of view and word counts to the same draft. Before a beat sheet is chosen, the {{outline-builder|Outline Builder}} shapes an indented outline three ways, and the distraction-free editor in this domain is where the events get written.",
    faqs: [
      {
        q: "Which structures does the mapper support?",
        a: "Four: three-act, four-act, Save the Cat and the hero's journey. They are reference outlines held as data and shared with the story beat builder, so both tools show the same placements.",
      },
      {
        q: "How do I enter my events?",
        a: "One per line as beat name, a colon, then what happens. The beat name is matched against the chosen sheet, and notes for beats the sheet does not define are not displayed.",
      },
      {
        q: "Are the placement percentages rules?",
        a: "No. They are the conventional readings of each structure, reported as guidance. The pages say so explicitly, because plenty of good stories put a turn somewhere else.",
      },
      {
        q: "Why did my notes disappear when I changed structure?",
        a: "Different sheets define different beats, so notes are matched against the new sheet rather than carried over positionally. Map against the structure you are actually writing in.",
      },
      {
        q: "Can I export the map?",
        a: "Yes, Copy and Download produce the map as markdown — every beat with its placement and your note — so it can sit beside the draft in any editor.",
      },
    ],
  },

  "story-beat-builder": {
    keywords: [
      "story beat builder",
      "beat sheet",
      "beats drafted",
      "progress board",
    ],
    intro:
      "The Story Beat Builder is a progress board over a named beat sheet: mark beats done and see how far through the structure the draft has reached.",
    content:
      "The story beat builder answers one question: how far through the structure has the draft got? Choose a beat sheet — three-act, four-act, Save the Cat or the hero's journey — mark the beats you have drafted, and the progress panel reports how many beats are drafted and which beat comes next in placement order. It is a progress board rather than a planning tool: the notes belong to the mapper, and this page is about what exists.\n\nThe sheet panel lists every beat of the chosen structure in the structure's own order, each with a done control and its placement percentage. The progress panel counts beats drafted, draws the progress against the sheet and names the next beat by placement, which is the only ordering that matters when a draft is written out of sequence. Copy and Download produce a progress sheet as text, so the board can be checked against a revision plan.\n\n- Structures: three-act, four-act, Save the Cat and the hero's journey, shared with the mapper.\n- Beat rows: every beat in the structure's own order, with a done control.\n- Progress: beats drafted as a count and a bar against the sheet.\n- Next beat: the first undrafted beat in placement order, not list order.\n- Copy and Download for the progress sheet as plain text.\n\nThe beats come from the same reference module the plot point mapper uses, so the placements on both pages are literally the same data. Progress is arithmetic over the done flags: drafted count, share of the sheet, and the next undrafted beat found by walking the rows in placement order. Because the board is state in the browser rather than a document, it is a view of your progress rather than a record of it — the copy control exists so the record can be taken elsewhere. Because the beats come from shared reference data, a copied sheet is readable by anyone else working with the same structure, which makes it a usable thing to attach to a revision plan.\n\n- Done flags are state, not a document: clearing the browser clears the board.\n- Beats are the structure's, so a beat you cannot map to the sheet cannot be marked.\n- Placement order can differ from drafting order; next beat means next by placement.\n- The four sheets are a finite reference set; a custom structure is not representable.\n- Progress measures coverage of the sheet, never quality of the scenes behind it.\n\nThe board works as a weekly check rather than a writing surface: mark what exists, read the next beat, and let the placement order decide what to draft rather than what you feel like drafting. When the count stalls at the same beat across two weeks, the beat is usually the one the story is missing, and the sheet has said so before the feedback did. Read weekly, the board turns structure from an idea into a count — drafted or not — which is much harder to avoid than an intention.\n\nThe neighbouring tools cover the other views of the same structures: the plot point mapper records what happens at each beat, the scene board carries point of view and word counts, and the outline builder shapes structure before any named sheet is chosen.",
    howTo: [
      { step: "Choose a structure: three-act, four-act, Save the Cat or the hero's journey." },
      { step: "Mark each beat you have drafted on the sheet panel, in whatever order you drafted them." },
      { step: "Read the progress panel for beats drafted and the next beat in placement order." },
      { step: "Copy or download the progress sheet when the board needs to leave the browser." },
    ],
    whenToUse:
      "Use the story beat builder when the structure exists and the question is coverage rather than content. The {{plot-point-mapper|Plot Point Mapper}} records what happens at each beat instead of whether it is drafted, and the {{scene-and-chapter-organizer|Scene and Chapter Organizer}} carries the same scenes with point of view and word counts. Structure before any named sheet belongs to the {{outline-builder|Outline Builder}}, and the daily words behind the beats are what the writing goal tracker in this domain measures.",
    faqs: [
      {
        q: "How is the next beat decided?",
        a: "By placement order: the first undrafted beat whose position in the story comes earliest. A draft written out of sequence still gets the right next beat, because list order never overrides placement.",
      },
      {
        q: "How is this different from the plot point mapper?",
        a: "The mapper attaches a note to every beat — what happens. This page tracks whether each beat is drafted, so it is a progress board over the same shared structures.",
      },
      {
        q: "Are my done flags saved?",
        a: "They live in this browser as page state rather than a document, so clearing site data clears the board. Copy the progress sheet when a record needs to outlast the session.",
      },
      {
        q: "Can I use a structure of my own?",
        a: "No. The four sheets are the reference set held in code and shared with the mapper. For a custom shape, the outline builder will happily track it as indented text.",
      },
      {
        q: "Does a drafted beat mean the scene is finished?",
        a: "It means you consider the beat drafted — the board records coverage of the sheet and makes no claim about quality. That judgement stays with you and your readers.",
      },
    ],
  },

  "manuscript-formatter": {
    keywords: [
      "manuscript formatter",
      "standard manuscript format",
      "scene breaks",
      "em dash",
    ],
    intro:
      "The Manuscript Formatter applies the mechanical typographic clean-up a submission expects — curly quotes, em dashes, scene breaks — and counts what an agent asks for.",
    content:
      "Submission formats ask for the same handful of mechanical substitutions every time, and this manuscript formatter applies them in one pass: straight quotes to curly ones, a spaced double hyphen to an em dash, three dots to an ellipsis, and scene breaks normalised to a centred marker. An optional title page can be prepended with your title, name and contact details. Every change is named on the page, because text in, text out with a list of what happened is the only honest way to format someone else's prose.\n\nThe counts panel reports the numbers a submission asks for: words, chapters, scene breaks, paragraphs, sentences and characters. The what-changed panel lists each class of substitution with its count, so a pass that curly-quoted four hundred quotation marks is visible as arithmetic rather than mystery. The standard manuscript format checklist states what the format actually asks for, which is the part most rejections over formatting are really about.\n\n- Straight quotes converted to curly quotation marks.\n- Spaced double hyphen converted to an em dash.\n- Three dots converted to an ellipsis.\n- Scene breaks normalised to a centred marker.\n- Optional title page: title, author and contact.\n- Counts: words, chapters, scene breaks, paragraphs, sentences and characters.\n- Copy and Download for the formatted text, plus the what-changed report.\n\nThe substitutions are literal and ordered: each rule scans the text once, records how many replacements it made and keeps the source text's line structure intact. Counts come from the shared tokenizer and sentence segmenter, so words and sentences agree with every other counter in this domain. Crucially, the formatter never reflows your words — no rewrapping, no reparagraphing, no changes beyond the named substitutions — which is what makes the output reviewable against the input.\n\n- It does not produce a .docx file, set fonts or margins, or manage page numbers.\n- It never reflows prose: line and paragraph structure survive exactly as typed.\n- Smartening quotes is typographic, not grammatical: an apostrophe used as an omission mark is still converted by position.\n- Chapters are detected from headings, so an unconventional chapter layout may be undercounted.\n- Quoted material is formatted like the rest of the text; a quotation's own punctuation is not preserved separately.\n\nThe workflow is to format last: write and revise first, then run one pass, read the what-changed panel, and copy the result into your submission document. Running it earlier just means doing it again after the next edit. A formatted pass is also worth keeping beside the original: the what-changed panel makes the pair auditable, and the diff viewer can show the substitution-by-substitution difference if a question comes back later. The checklist is worth reading once before submitting anywhere, because most formatting rejections come from the few items it lists rather than from the prose. The counts panel covers the other half of the query — words, chapters, scene breaks, paragraphs, sentences and characters — which is the figure agents ask for alongside the sample itself.\n\nThe mechanical neighbours cover the rest: the style guide checker applies a named guide's preferences, the document diff viewer shows what a formatting pass changed between two versions, and the markdown editor takes the other direction — from clean text back into structured source. Both directions share the same property: the text you started with is still recoverable, because formatting here is substitution rather than interpretation.",
    howTo: [
      { step: "Paste your manuscript text into the input panel." },
      { step: "Toggle the title page if the submission asks for one, and fill in title, author and contact." },
      { step: "Read the what-changed panel for every substitution made, and the counts panel for the submission figures." },
      { step: "Copy or download the formatted text for your submission document." },
    ],
    whenToUse:
      "Use the manuscript formatter when a draft is finished and the submission format is the remaining obstacle. The {{style-guide-adherence-checker|Style Guide Adherence Checker}} applies a named guide's mechanical preferences instead of typographic clean-up, and the {{document-diff-viewer|Document Diff Viewer}} shows exactly what a formatting pass changed between two versions. When the document has to leave as source rather than a submission, the {{markdown-editor|Markdown Editor}} renders and counts it instead, and the rich text editor in this domain exports formatted HTML.",
    faqs: [
      {
        q: "What substitutions does the formatter make?",
        a: "Straight quotes become curly, a spaced double hyphen becomes an em dash, three dots become an ellipsis, and scene breaks are normalised to a centred marker. Each class of change is listed with its count.",
      },
      {
        q: "Does it reflow or renumber my text?",
        a: "No. The formatter never reflows prose — no rewrapping and no reparagraphing — so line and paragraph structure survive exactly as typed, and every change beyond that is named on the page.",
      },
      {
        q: "Will it create a Word document?",
        a: "No. This is text in, text out: it does not produce a .docx file or set fonts, margins and page numbers. Copy the result into your submission document after reading what changed.",
      },
      {
        q: "How does it count chapters?",
        a: "From headings in the text, alongside the shared tokenizer's counts for words, sentences and paragraphs. An unconventional chapter layout may be undercounted, which is why the counts panel shows each figure separately.",
      },
      {
        q: "Should I format before or after revising?",
        a: "After. Formatting is a final pass: run it once the prose is settled, read the what-changed panel, and copy the result out. Every later edit would simply require running it again.",
      },
    ],
  },
};
