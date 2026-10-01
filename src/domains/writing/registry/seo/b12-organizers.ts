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
    keywords: ["scene organizer", "point of view", "word count", "scene board", "chapters"],
    intro:
      "The scene and chapter organizer is a scene board you type as plain lines, with point of view, setting and word count, and the statistics a novel needs to see how the words distribute.",
    content: `A scene organizer earns its place when a draft has outgrown a single document and the writer needs to see the shape of it. This one is deliberately plain: each scene is a line, written as Title, point of view, setting and word count, separated by pipes. From those lines the tool builds a board, counts the words, groups them by point of view and names the longest and shortest scenes. There is no diagram to drag and no canvas to learn — the board is text, and text is what survives a copy, a paste and a diff.

That choice matters because a scene board is a working document, not an artefact. You keep it beside the draft and edit it as the story changes, and a text list is quick to edit and easy to back up. Chapters are handled the same way: a chapter is whatever grouping you choose to show in the order of the lines, and the tool reports the totals you need — total words, the average scene and the median, which is the number that tells you whether one enormous scene is skewing the book.

The point of view tally is the feature writers ask for most often, because a dual point of view novel goes wrong quietly: one narrator quietly takes over the second half and nobody notices until a reader does. Grouping the words by point of view makes that imbalance arithmetic rather than opinion. The settings count and the longest and shortest scene labels do something similar for pacing, where a stack of tiny scenes in the same location is usually a sign that a sequence wants to be one scene.

Because the board is just text, it is also the easiest way to keep chapters straight while the manuscript is in pieces. A chapter is a run of scenes, and seeing the run beside the totals tells you whether a chapter is carrying its weight or quietly holding the book back. The board exports as JSON and as a markdown document with a heading per scene, so it can live in the same folder as the draft, move between machines by copy and paste, and be read by any tool that understands text. When the draft is finished the board becomes a map of the book: a list of every scene, its narrator, its place and its length.

The board is stored in this browser and exports as JSON, so it moves between machines without a server, and it also renders as a markdown document with a heading per scene for pasting into notes. Scenes with no word count contribute zero, so the totals are only as good as the numbers you enter, and the page says as much rather than guessing. Nothing is uploaded, nothing is looked up, and no part of a manuscript is read to build the board.

What the scene organizer does not do is as clear as what it does. It does not import a Scrivener project or a Word outline, does not read your draft to count scenes, and cannot detect continuity problems between them. It is a planning board and a set of honest totals, and it is honest about being exactly that.`,
    howTo: [
      { step: "Write one scene per line as Title | Point of view | Setting | Words." },
      { step: "Leave the later fields blank when you do not know them yet; blanks count as zero." },
      { step: "Read the shape panel: total words, the average and median scene, and the settings count." },
      { step: "Check the point of view tally to see whether one narrator has taken over." },
      { step: "Copy the board as markdown or export the JSON to keep it." },
    ],
    whenToUse: `Use the scene organizer when a draft needs its shape checked rather than its prose read. When the totals you care about are the whole manuscript's rather than the board's, the {{word-count-tool|Word Count Tool}} counts a single text, and when the question is what changed between two versions of a scene, the {{document-diff-viewer|Document Diff Viewer}} compares them.

If the board is really a record of the draft's progress over time, the {{draft-versioning-tool|Draft Versioning Tool}} tracks the word count from version to version instead.`,
    faqs: [
      {
        q: "How is a scene entered?",
        a: "One scene per line, with fields separated by pipes: title, then point of view, setting and word count. Only the title is required; a blank field is simply left out of the board and the count.",
      },
      {
        q: "Why does a scene with no word count show as zero?",
        a: "Because the tool counts what you give it and refuses to invent a number. Leave the fourth field blank and the scene contributes nothing to the totals, which keeps the word count a fact rather than an estimate.",
      },
      {
        q: "Does it read my manuscript?",
        a: "No. There is no file upload and no draft is parsed. You type the board, or import a board you exported earlier as JSON, and the tool reports the numbers from that.",
      },
      {
        q: "Can I see which narrator has more words?",
        a: "Yes. Scenes are grouped by the point of view name you type, and each group shows its scene count and word total, so an imbalance between narrators is visible as a number rather than a feeling. Spell the names consistently for the grouping to work.",
      },
      {
        q: "Is the board saved anywhere?",
        a: "It is kept in this browser only, and it exports to JSON so you can move it yourself. There is no account and no upload; clearing your browser data clears the board.",
      },
    ],
  },

  "draft-versioning-tool": {
    keywords: ["draft versioning tool", "draft", "version", "word count", "timeline"],
    intro:
      "The draft versioning tool saves labelled snapshots of a draft in your browser and shows the word count moving from version to version, with a word-level comparison of the last two.",
    content: `A draft versioning tool answers a small but constant question: how did this draft get here? You save a snapshot under a label — "after the rewrite", "Draft 3 — cut the subplot" — and the tool keeps the text, counts its words and lines the versions up in a timeline that shows what each one gained or lost against the one before. It is the cheapest form of revision history, and the one a writer will actually maintain.

The timeline is the point. Watching the word count move is how cutting and padding become visible: a version that gained two thousand words without a plan usually marks the scene that ran away, and a version that lost five hundred is either a good cut or a hole. The tool does not judge either way; it shows the arithmetic and lets you draw the conclusion. It also keeps every snapshot's text, so a version can be loaded back into the editor when an earlier passage turns out to be better.

Because the versions are labelled, the history reads like a set of milestones rather than a stream of timestamps. You can see at a glance when the draft doubled, when the subplot came out and when the ending was rewritten, without opening any of the versions. That is the record a writer actually consults months later, and it costs one click per milestone to keep. Loading an old version back into the editor is part of the same idea: a cut scene can be restored, a changed paragraph compared, and the question of which version is better answered with both in front of you rather than from memory.

Comparing the last two versions uses the same word-level diff as the document diff viewer, so the newest change is reported as added and removed words and a percentage of unchanged text. That is enough to see whether a pass was a light polish or a substantial rewrite, and it keeps one comparison calculation in one place across the domain.

A version is a label and the text saved under it, held in this browser only. There is no server, no cloud history and no automatic snapshot on a timer, which is a deliberate limit as much as a limitation: a writer who saves a version when a draft reaches a milestone keeps a clean, intentional history, rather than a stream of saves produced by a background process. Clear your browser data and the versions go with it, so anything worth keeping should be exported as text.

The tool stores text, not files. It does not open a .docx, does not track changes inside a word processor and cannot merge two versions. It is a set of labelled snapshots with a word-count history and a comparison of the newest pair, and it says so plainly. For a working draft that is usually all the version control a writer wants. A snapshot costs nothing, and one saved before a bold edit is the cheapest insurance a revision has.`,
    howTo: [
      { step: "Paste or type the draft into the text area and give the version a label." },
      { step: "Save the version; it is kept in this browser with its word count." },
      { step: "Read the timeline to see how the count moved from draft to draft." },
      { step: "Check the latest change panel for the added and removed words." },
      { step: "Load an earlier version back when a passage worked better before." },
    ],
    whenToUse: `Use the draft versioning tool when a draft is moving through revisions and you want a simple record of how its length changed. When you need to read what actually differs between two saved drafts, the {{document-diff-viewer|Document Diff Viewer}} shows the change line by line, and for a single word total the {{word-count-tool|Word Count Tool}} is quicker.

If the versions being tracked are scenes rather than a whole draft, the {{scene-and-chapter-organizer|Scene and Chapter Organizer}} keeps the word counts on a board instead.`,
    faqs: [
      {
        q: "Is there an automatic save on a timer?",
        a: "No. A version is saved only when you click to save it, because an intentional milestone is more useful than a stream of background snapshots. You choose the label and the moment.",
      },
      {
        q: "Where are the versions kept?",
        a: "In this browser only. There is no server and no account, so clearing your browser data removes them. Export or copy the text of any version you want to keep outside the tool.",
      },
      {
        q: "How does it compare two versions?",
        a: "The latest-change panel compares the last two saved versions word by word, reporting added and removed words and a percentage of unchanged text — the same calculation the document diff viewer uses.",
      },
      {
        q: "Can it track changes in a Word document?",
        a: "No. It stores plain text, not files, so it does not read a .docx or follow a word processor's tracked changes. Paste the text of each version you want to snapshot and the tool stores that.",
      },
    ],
  },

  "plot-point-mapper": {
    keywords: ["plot point mapper", "plot points", "three-act structure", "hero's journey", "beat sheet"],
    intro:
      "The plot point mapper lays a named structure — three-act, four-act, Save the Cat or the hero's journey — over your story's own events and reports which beats are still open.",
    content: `A plot point mapper is useful when a structure is the thing in doubt. Choose a beat sheet — the three-act structure, the four-act structure, Save the Cat's fifteen beats or the hero's journey's twelve stages — and the tool lists that structure's plot points with the share of the story where each typically lands. You then attach your own event to each beat, one line per beat, and the map reports how much of the structure you have covered and which beat comes next.

That last number is the one that keeps a draft moving. If everything is mapped except the midpoint, the map has told you what the next writing session is for, and it does so without reading a word of the manuscript. A writer working through a beat sheet can fill the map in as a planning exercise and then watch the coverage climb as the draft takes shape, which is a more useful signal than a blank page and a feeling.

The percentages are conventions, and the tool is careful to say so. The placements come from the traditions the structures are named for — the three-act shape, Blake Snyder's fifteen beats, Campbell's stages — and none of them is a rule a story must obey. A literary novel may have no inciting incident at twenty per cent, and a short story may hit its midpoint on page two. The map reports where a beat conventionally sits, and the writer decides whether to move the scene or ignore the placement.

Working beat by beat also changes how a plan gets written. Instead of an empty document and a blank page, the mapper offers a short list of named slots, each with a description of what belongs there, and the writing becomes a matter of answering one slot at a time. The same structure is as useful for a critique as for a first draft: mapping someone else's story onto a sheet shows where one beat is doing the work of two, or where a placement is so far from the convention that the story is deliberately bending the shape.

Nothing is generated in the sense of prose. The tool does not invent plot points and does not suggest what your midpoint should be; you supply the events and it arranges them against the sheet, marking each beat mapped or open. The map exports as a markdown outline with a heading per beat, so it can sit beside the draft in the same folder as the scene board.

The mapper reads notes, not pages. It does not analyse a manuscript, cannot tell whether a plotted beat survived into the draft, and keeps nothing beyond the current session's text in the page. The structure is a lens, the events are yours, and the coverage figure is a count of how many of the sheet's beats you have written down — useful, and honestly limited. It is a planning aid for a story that is still taking shape, and it is happy to stay one.`,
    howTo: [
      { step: "Choose a beat sheet: three-act, four-act, Save the Cat or the hero's journey." },
      { step: "Read the sheet: every beat, its conventional percentage and its description." },
      { step: "Write one line per beat as Beat name: what happens in your story." },
      { step: "Watch the coverage figure and the next open beat as you fill the map." },
      { step: "Copy or download the map as a markdown outline." },
    ],
    whenToUse: `Use the plot point mapper when a named structure is the frame you want and each beat needs an event attached. When the question is how far through a beat sheet the drafting has actually reached, the {{story-beat-builder|Story Beat Builder}} is a progress board over the same structures.

For a non-fiction or essay plan rather than a story, the {{outline-builder|Outline Builder}} numbers headings instead of beats, and when the mapped events are scenes that need their own tracking, the {{scene-and-chapter-organizer|Scene and Chapter Organizer}} boards them with word counts.`,
    faqs: [
      {
        q: "Which structures are included?",
        a: "Four: the three-act structure, a four-act structure, Save the Cat's fifteen-beat sheet and the hero's journey's twelve stages. Each is listed with its beat count so you can pick the one that fits the story.",
      },
      {
        q: "Are the percentages rules?",
        a: "No. They are the conventional placements from the traditions the structures are named for. The tool reports them as guidance; your story can move a scene or ignore a placement entirely, and the map still works.",
      },
      {
        q: "Does it invent plot points for me?",
        a: "No. It does not generate prose or suggest events. You write one line per beat describing what happens in your story, and the tool arranges those lines against the sheet and counts the coverage.",
      },
      {
        q: "Can it read my manuscript?",
        a: "No. There is no upload and no file is parsed. The map works from the notes you type, so it reports which beats you have filled in, not which ones survived into the draft.",
      },
      {
        q: "What if a beat name does not match?",
        a: "A line whose name is not one of the sheet's beats is ignored, so the coverage figure stays honest. Keep the beat names as the sheet lists them and the note attaches to the right place.",
      },
    ],
  },

  "story-beat-builder": {
    keywords: ["story beat builder", "beat sheet", "Save the Cat", "beats", "drafting"],
    intro:
      "The story beat builder is a progress board over a beat sheet: tick the beats you have drafted and see how far through the structure the draft has reached, and which beat is next.",
    content: `The story beat builder is the companion to planning a story: where a mapper attaches an event to every beat, this tool tracks which beats are actually drafted. Pick a beat sheet — three-act, four-act, Save the Cat or the hero's journey — and the tool lays out its beats with their conventional placements and a checkbox each. Tick a beat once its scene or chapter exists, and the board reports the count, a percentage and the next beat in placement order.

That next-beat pointer is the whole point. A long draft can stall not because the writing is hard but because the next move is unclear, and naming the next beat with its percentage and description removes a decision from the start of a session. It is a small thing that changes how a writing day begins: instead of reopening the manuscript to find your place, you look at the board and see which beat is open.

That pointer is also a record of drafting progress rather than of planning. Ticking a beat says a scene exists, so the percentage counts work done rather than work intended, and the gap between a mapped structure and a drafted one becomes visible as the two numbers diverge. When a draft is stalled, the clearest question is often simply which beat is open, and the board answers it without opening the manuscript. The ticks are yours alone: the tool never guesses that a beat is written, so the progress figure stays a statement about the draft rather than a friendly estimate.

The beat sheets themselves are the conventional ones. Save the Cat's fifteen beats are the most granular and the most familiar to genre writers; the hero's journey's twelve stages suit mythic and epic stories; the three-act and four-act structures are the broadest. Each beat carries a short description of what it does, so the board doubles as a reference: you can read what "dark night of the soul" means without leaving the page, and the same reference underlies the plot point mapper.

Ticking a beat records your own judgement that it is drafted. The tool never infers progress from a manuscript, because it never reads one — there is no upload and no parsing, and the ticks live only in this browser. Switching beat sheets clears the ticks, since the beats change with the structure, and the whole sheet with its ticks exports as plain text for a notes app or a project file.

What it does not do is as clear as what it does. It does not generate beats or write scenes, does not score how well a draft follows a structure, and keeps no history of when a beat was ticked. It is a checklist with placements and descriptions attached — a small tool for the specific problem of knowing what to write next, and honest about being nothing more than that. Kept beside the draft, it turns a large, vague task into a short, named next step. It is deliberately small, and it does that one job well.`,
    howTo: [
      { step: "Choose a beat sheet: three-act, four-act, Save the Cat or the hero's journey." },
      { step: "Read the beats with their placements and descriptions." },
      { step: "Tick each beat once its scene or chapter is drafted." },
      { step: "Watch the progress bar and the next-beat pointer." },
      { step: "Copy or download the sheet with its ticks for your notes." },
    ],
    whenToUse: `Use the story beat builder when a beat sheet is your working plan and you want to track how much of it is drafted. When every beat needs an event attached rather than a tick, the {{plot-point-mapper|Plot Point Mapper}} maps your story onto the same structures.

For planning that is headings rather than story beats, the {{outline-builder|Outline Builder}} numbers a nested outline, and when the draft's overall length is the thing being tracked, the {{draft-versioning-tool|Draft Versioning Tool}} keeps a version timeline.`,
    faqs: [
      {
        q: "What is the difference from the plot point mapper?",
        a: "The mapper attaches your story's event to every beat and reports coverage; this builder tracks which beats are drafted with a tick and points at the next one. They share the same four structures.",
      },
      {
        q: "Why do the ticks reset when I change structure?",
        a: "Because the beats belong to the structure: Save the Cat's fifteen beats and the three-act structure's seven are different lists, so a tick against one does not mean anything in the other.",
      },
      {
        q: "Which beat sheets are included?",
        a: "The three-act and four-act structures, Blake Snyder's Save the Cat sheet of fifteen beats, and the hero's journey's twelve stages, each with placements and a short description of what the beat does.",
      },
      {
        q: "Does it score how well my story follows a structure?",
        a: "No. It records the beats you say are drafted and counts them. It does not read a manuscript, does not judge structural fit, and keeps no record of when each beat was ticked.",
      },
    ],
  },

  "manuscript-formatter": {
    keywords: ["manuscript formatter", "manuscript", "title page", "scene breaks", "word count"],
    intro:
      "The manuscript formatter applies the mechanical typographic clean-up a submission expects — curly quotes, em dashes, centred scene breaks, an optional title page — and counts the words, chapters and scene breaks.",
    content: `A manuscript formatter handles the substitutions a submission expects and nothing more. Paste your text and it converts straight quotes to typographic ones, turns a spaced double hyphen into an em dash, replaces three dots with an ellipsis, and normalises a line of asterisks or hashes into a centred scene break. It can also prepend a title page with your name and contact details. The wording is never rewritten: every change is a substitution the tool names on the page, so you can see exactly what it did.

The list of what it changes is short on purpose. Straight to curly quotes and apostrophes, a double hyphen to an em dash, three dots to an ellipsis, and scene breaks to a centred three-asterisk "* * *" on its own line. Those are the marks that betray a manuscript typed in a plain editor, and fixing them by hand across ninety thousand words is the kind of work that puts off the submission for another week. The tool does not touch spacing between sentences, does not reflow paragraphs and does not "improve" a single word.

Alongside the text it reports the counts an agent or a submission form asks for: the word count, the number of chapters, the number of scene breaks, paragraphs and sentences. The word count here is the whole manuscript's, so it can be given as the rounded figure a query letter uses. The chapter count is read from lines that begin with "chapter", and the scene-break count from the normalised lines, which means the numbers follow the conventions the tool just applied.

Keeping the counts beside the text is deliberate, because a submission form asks for the word count and a synopsis asks for the chapter count, and both are easy to lose track of while a manuscript is being tidied. Because the formatter is deterministic, running it twice on the same text produces the same output and the same counts, so the numbers do not drift between one pass and the next. That matters when a manuscript goes to two markets with slightly different requirements: format the text, note the counts, then adjust only the parts a specific market asks for.

What the manuscript formatter deliberately does not do is the rest of submission formatting. It does not produce a .docx, and it does not set a twelve-point serif font, double line spacing, one-inch margins, a running header or page numbers. Those belong in a word processor template, where they are set once and applied to every submission. The tool's job is the text and the counts; the checklist on the page names the rest of the standard format so nothing is forgotten before you send a manuscript out.

Everything happens in the browser — nothing is uploaded and no draft is stored beyond the tab. The output is plain text you can copy or download, and because the substitutions are deterministic, the same manuscript always produces the same formatted text and the same counts, which is what makes the result checkable rather than merely tidy.`,
    howTo: [
      { step: "Paste the manuscript text into the editor." },
      { step: "Turn on the title page and add your title, name and contact details if you want one." },
      { step: "Read the formatted text; each substitution is listed under what changed." },
      { step: "Check the counts: words, chapters and scene breaks." },
      { step: "Copy or download the text, then set fonts and spacing in your word processor." },
    ],
    whenToUse: `Use the manuscript formatter when a draft is finished enough to submit and the typographic details need cleaning up. When the question is how two drafts differ rather than how one is typed, the {{document-diff-viewer|Document Diff Viewer}} compares them, and for a plain word total the {{word-count-tool|Word Count Tool}} is quicker than formatting the whole file.

If you are keeping several versions of the manuscript as you tidy it, the {{draft-versioning-tool|Draft Versioning Tool}} records the word count of each so the changes are visible.`,
    faqs: [
      {
        q: "Does it produce a .docx file?",
        a: "No. It formats plain text and can be copied or downloaded as text, but it does not write a Word document. Fonts, margins and line spacing are set in your word processor's own template.",
      },
      {
        q: "What does it change in my text?",
        a: "Straight quotes and apostrophes become typographic ones, a spaced double hyphen becomes an em dash, three dots become an ellipsis, and a line of asterisks or hashes becomes a centred scene break. Your wording is untouched.",
      },
      {
        q: "How is the word count calculated?",
        a: "It counts the words in the formatted manuscript as a whole, using the same Unicode-aware tokenizer as the domain's other counters, so it is the figure you can quote in a query letter.",
      },
      {
        q: "Why is a scene break changed to * * *?",
        a: "Because a blank line between scenes can vanish in a conversion or an email, and a centred three-asterisk break is the convention that survives. Lines containing asterisks or hashes alone are normalised to it.",
      },
      {
        q: "Does it set the standard manuscript format?",
        a: "Only the text side of it. The checklist names the rest — title page, chapter openings, scene breaks, curly quotes and the word count — but fonts, spacing and margins are set in the word processor you submit from.",
      },
    ],
  },
};
