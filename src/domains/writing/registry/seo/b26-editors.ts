import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B26, story planning and structured editing: authored SEO entries for the
 * plot structure planner, the genre blender idea tool, the ending generator, the
 * rich text editor and the block-based editor.
 *
 * The shared line in this batch is that the shape is the advice. A plot is four
 * facts mapped onto beats, a blend is two expectation sets collided, an ending
 * is a verdict on a want and an obstacle, and the two editors keep the document
 * as plain data so the toolbar and the export can never disagree. Keys are
 * registry slugs; see ../tool-seo.ts for the contract.
 */
export const B26_EDITORS_SEO: Record<string, ToolSeo> = {
  "plot-structure-planner": {
    keywords: [
      "plot structure planner",
      "logline",
      "beats",
      "stakes",
    ],
    intro:
      "The Plot Structure Planner maps four premise facts onto a named structure's beats and reports which facts are anchored and which are missing.",
    content:
      "A premise has four load-bearing facts and a structure has a sequence of beats, and this plot structure planner anchors one to the other. Write the logline, the protagonist, the goal, the conflict and the stakes, choose a structure, and the plan panel maps them where a reader expects them: the protagonist at the opening, the goal at the inciting incident, the conflict at the midpoint, the stakes at the second turning point. The beats between keep their own prompts from the structure, so the output is a full beat sheet with your facts already placed.\n\nThe stats panel reports beats in the chosen structure, facts anchored, facts placed and the premise word count, and the beat-by-beat list shows every beat with its prompt or your fact where an anchor applies. Checks name what is missing in the structure's own terms: a logline under eight words says too little to plan against, a conflict under four words names a difficulty rather than an opposing force, and a missing fact is named as missing rather than left quietly to the draft.\n\n- Four premise facts: protagonist, goal, conflict and stakes, each anchored to a named beat.\n- Logline: the one-line version, checked for being long enough to plan against.\n- Structure choice: the same four structures the other story tools use.\n- Beat-by-beat list: every beat with its prompt and your anchored fact.\n- Stats: beats, facts anchored, facts placed and premise words.\n- Copy plan and Download for the finished sheet.\n\nAnchoring is a fixed table: each of the four facts declares the beat position where a reader expects it, and the plan merges that table with the chosen structure's beats. The checks are the premise's own arithmetic — word counts on the logline and conflict, presence of each fact — so a thin premise shows up as short numbers rather than vague advice. The structures come from the same shared reference module as the mapper and the beat builder, so the beats on this page cannot disagree with theirs.\n\n- Anchors assume the four facts land at conventional positions; a deliberate inversion will be placed conventionally.\n- A complete plan says the facts are present, not that the beats between them are populated.\n- The structure prompts are generic to the beat, not to your genre.\n- No draft text is stored: the plan is a document you copy.\n- The checks are word-count and presence rules; they cannot tell a dull goal from a sharp one.\n\nThe workflow is to write the logline last rather than first: the four facts are easier to state plainly once the sentence they roll up into is visible. Then read the beats where nothing is anchored — those are the turns your premise has not earned yet, and the anchored facts beside them are the four sentences any outline of this story will repeat, and the prompts on them are the questions the outline will have to answer.\n\nThe neighbouring tools cover the same material from other angles: the story idea generator assembles the four facts in the first place, the conflict planner shapes the conflict field in depth, and the ending generator drafts verdicts against the want and obstacle once the stakes are fixed.",
    howTo: [
      { step: "Write the logline and the four facts: protagonist, goal, conflict and stakes." },
      { step: "Choose a structure; the facts anchor to the beats where a reader expects them." },
      { step: "Read the beat-by-beat list, then the checks panel for short or missing facts." },
      { step: "Copy plan or Download the sheet as the outline's starting document." },
    ],
    whenToUse:
      "Use the plot structure planner when a premise exists and the outline has to start somewhere. The {{story-idea-generator|Story Idea Generator}} assembles the four facts in the first place, the {{conflict-and-resolution-planner|Conflict and Resolution Planner}} shapes the conflict field with escalating turns, and the {{ending-generator|Ending Generator}} drafts six verdicts against the want and obstacle. For the indented shape an outline takes before facts are anchored, the {{outline-builder|Outline Builder}} renders one three ways.",
    faqs: [
      {
        q: "Which facts does it anchor to the beats?",
        a: "Four: the protagonist at the opening, the goal at the inciting incident, the conflict at the midpoint and the stakes at the second turning point — the positions where a reader expects them.",
      },
      {
        q: "Why does it complain about my logline length?",
        a: "A logline under eight words says too little to plan against. The check is a word count, stated in those terms, because the plan's anchors need something specific to place.",
      },
      {
        q: "Which structures are available?",
        a: "The same four used by the other story tools — three-act, four-act, Save the Cat and the hero's journey — held in one shared reference so beats never disagree between pages.",
      },
      {
        q: "What does facts placed mean versus facts anchored?",
        a: "Anchored is where each fact belongs by convention; placed is where you actually supplied one. The gap between the two counts is the premise parts the plan is still missing.",
      },
      {
        q: "Does it write any of the draft?",
        a: "No. It maps what you give it onto beats and reports what is absent. The beat prompts between the anchors are questions for the draft, not text to paste into it.",
      },
    ],
  },

  "genre-blender-idea-tool": {
    keywords: [
      "genre blender",
      "premise scaffolds",
      "conventions",
      "required element",
    ],
    intro:
      "The Genre Blender Idea Tool collides two genres' stock elements into premise scaffolds that keep a convention from each side.",
    content:
      "A genre blend works when both genres stay recognisable, and this genre blender is built around that rule. Pick two of ten — fantasy, science fiction, mystery, romance, horror, thriller, western, historical, comedy and noir — optionally name a required element, and the tool pairs one element from each side through five fixed templates to produce premise scaffolds. The result is not a random mash-up: every scaffold keeps at least one convention from each genre, and both convention lists are shown so you can see what a reader will expect to survive the merge.\n\nThe two-genres panel holds the picks and the optional required element; what each genre promises shows the elements and conventions of both sides before any scaffold is read. The scaffolds panel lists the five templates' outputs, and the checks panel names the blend's own risks: the same genre twice is not a blend, a missing element leaves the collision generic, and a blend whose conventions cannot coexist is named rather than hidden. Copy ideas and Download take the scaffolds out as text.\n\n- Two genres chosen from ten, each contributing elements and reader expectations.\n- Required element: an optional phrase one scaffold must include.\n- Elements and conventions panels: what each genre promises before the merge.\n- Five fixed templates pairing one element from each side.\n- Checks: same genre twice, missing element, conventions that cannot coexist.\n- Copy ideas and Download for the scaffolds as plain text.\n\nThe engine pairs one element from each genre inside five published templates, and each scaffold is assembled from those parts rather than written. The convention lists are data held for all ten genres, which is what lets the checks say whether the two sides can coexist at all: a blend whose promises contradict each other is flagged instead of quietly producing a premise that breaks one of them. Everything is assembled from what you chose, and nothing is invented on your behalf.\n\n- The same genre chosen twice is flagged as not a blend rather than producing scaffolds.\n- A missing required element leaves the collision generic, which the checks name.\n- The ten genres and their stock elements are a finite reference set.\n- Scaffolds are structures for a premise, not plots; the story is still unwritten.\n- Nothing is stored, so copy the ideas before leaving the page.\n\nThe useful discipline is reading the promise panels before the scaffolds: a reader of noir expects a certain kind of ending, and a reader of romance expects another, and the premise has to honour whichever survives the merge. When a scaffold makes both lists look wrong, the fault is usually the pair rather than the template — swap one genre and the same five templates produce premises that make sense. Keep the required element short and concrete, because a long phrase forces one template to swallow the rest of the scaffold and the blend stops balancing; a single object or role is enough to tilt the collision without breaking it.\n\nThe neighbours cover the one-genre versions of the same work: the story idea generator assembles a premise from four parts, the first line generator composes an opener from a character, place and tone, and the writing prompt generator cycles an authored bank when the genre is not the constraint.\n",
    howTo: [
      { step: "Choose two different genres from the ten on offer." },
      { step: "Optionally name a required element one scaffold must include." },
      { step: "Read what each genre promises — elements and conventions — before reading the scaffolds." },
      { step: "Work through the five scaffolds and the checks, then copy the ideas worth developing." },
    ],
    whenToUse:
      "Use the genre blender when two genres have to become one premise. The {{story-idea-generator|Story Idea Generator}} assembles a premise from four named parts once a scaffold suggests them, and the {{first-line-generator|First Line Generator}} composes an opener from a character, a place and a tone. When the blend needs a starting spark instead, the {{writing-prompt-generator|Writing Prompt Generator}} cycles an authored bank, and the world building template in this domain answers what the merged world has to hold.\n",
    faqs: [
      {
        q: "How many genres can I blend?",
        a: "Two at a time, chosen from ten: fantasy, science fiction, mystery, romance, horror, thriller, western, historical, comedy and noir. Each contributes its stock elements and reader expectations.",
      },
      {
        q: "Why must both genres keep a convention?",
        a: "Because a blend works when both sides stay recognisable. Every scaffold pairs one element from each side, and the checks flag a result where the two conventions cannot coexist.",
      },
      {
        q: "What does the required element field do?",
        a: "It names a phrase one scaffold must include — a ledger written in two hands, say. The field is optional, and the checks report a missing element as making the collision generic.",
      },
      {
        q: "Is the output written by a model?",
        a: "No. Five fixed templates pair elements from published lists; every scaffold is assembled from parts you can see in the elements and conventions panels. Nothing is invented.",
      },
      {
        q: "What happens if I pick the same genre twice?",
        a: "The checks name it as not a blend rather than producing scaffolds. The point of the tool is collision between two different sets of promises.",
      },
    ],
  },

  "ending-generator": {
    keywords: [
      "ending generator",
      "ending shapes",
      "want",
      "obstacle",
    ],
    intro:
      "The Ending Generator drafts six ending shapes against your story's own want and obstacle, and names what each shape asks of the story.",
    content:
      "An ending is a verdict on the force that pushed back all story, and this ending generator drafts the six verdicts an ending can deliver. Give it the protagonist, what they want, what pushes back and what changes by the end, and each shape is drafted against those facts: the want won at a price, the want revealed as the problem, the want abandoned at the threshold, the method that defeats the protagonist, the world survived rather than fixed, and the opening returned to changed. Each draft names what the shape asks of the story, because an ending that arrives without setup reads as an accident.\n\nThe panel holds the four inputs, and the output reports how many shapes were drafted, then lists them with the cost each one extracts. The checks panel guards the premise: ideas are generated only once a want and an obstacle exist, and the checks name what is missing rather than dressing it up — a one-word want is a mood, and a story with no named change has nowhere for the last scene to land. Copy endings and Download take the set out as text.\n\n- Protagonist: who the verdict lands on.\n- What they want: the concrete goal the ending answers.\n- What pushes back: the obstacle that has been resisting all story.\n- What changes by the end: the named change the last scene lands on.\n- Six shapes, each drafted against your four facts with its cost stated.\n- Checks: the want's specificity and the presence of a named change.\n\nThe six shapes are data — each carries the verdict it delivers and what it requires of the premise — and the drafts are assembled by placing your want and obstacle into each shape's pattern. Without both fields there is nothing for an ending to answer, so the engine declines rather than inventing. The checks are arithmetic on the inputs: a want under two words and a missing change are named as such, in those terms, on the page.\n\n- Six shapes are a finite set of verdicts, not a taxonomy of every ending ever written.\n- A drafted shape is a sketch with its cost, not prose for the last page.\n- The checks read length and presence; they cannot tell a sharp want from a dull one.\n- No knowledge of your draft is applied — the inputs are all the tool knows.\n- Nothing is stored, so copy the shapes before leaving the page.\n\nThe reading order that works is what changes first, then the six ending shapes: a story with a named change can be read against every verdict, and the shape that makes the change inevitable is usually the right one. The cost column is the test — a shape whose cost the story has been paying all along reads as earned, while one whose cost appears nowhere is a twist the draft has not prepared.\n\nThe neighbouring tools cover the material the ending answers: the plot structure planner anchors the stakes at the second turning point, the conflict planner names what it costs to resolve, and the story idea generator assembles the want and obstacle these verdicts are drafted against.\n",
    howTo: [
      { step: "Fill the four inputs: protagonist, what they want, what pushes back and what changes by the end." },
      { step: "Read the six drafted shapes and the cost each one extracts." },
      { step: "Work the checks for a want too thin to end on or a missing named change." },
      { step: "Copy or download the set, then pick the shape whose cost the story has already been paying." },
    ],
    whenToUse:
      "Use the ending generator when the want and obstacle exist and the last scene needs a shape. The {{plot-structure-planner|Plot Structure Planner}} anchors the stakes at the second turning point, and the {{conflict-and-resolution-planner|Conflict and Resolution Planner}} names what the resolution costs. Assembling the want and obstacle in the first place belongs to the {{story-idea-generator|Story Idea Generator}}, and the {{first-line-generator|First Line Generator}} composes the opener that one of these endings will answer.",
    faqs: [
      {
        q: "What are the six ending shapes?",
        a: "The want won at a price, the want revealed as the problem, the want abandoned at the threshold, the method that defeats the protagonist, the world survived rather than fixed, and the opening returned to changed.",
      },
      {
        q: "Why does it need both a want and an obstacle?",
        a: "An ending is a verdict on the force that pushed back, so with neither field there is nothing to answer. The engine declines rather than inventing a premise for you.",
      },
      {
        q: "What does each shape's cost mean?",
        a: "What the verdict extracts from the story. The cost column is the test: a shape whose cost the story has already been paying reads as earned, while a new cost at the last page reads as a twist.",
      },
      {
        q: "Does it write the ending's prose?",
        a: "No. Each shape is a sketch drafted against your four facts, with what it asks of the story named. The last scene itself remains the part you write.",
      },
      {
        q: "Why did it flag my want as a mood?",
        a: "A want under two words names a feeling rather than a goal, so there is no specific thing for an ending to grant or deny. The check reports the word count in exactly those terms.",
      },
    ],
  },

  "rich-text-editor": {
    keywords: [
      "rich text editor",
      "inline marks",
      "block kinds",
      "html export",
    ],
    intro:
      "The Rich Text Editor keeps plain text as the source of truth and layers inline marks and block kinds over it, with a live preview and HTML export.",
    content:
      "This rich text editor treats text as the only source of truth. Bold, italic, underline, strikethrough and code are stored as offset ranges into that plain text, and each line carries a block kind — paragraph, heading, subheading, quote or bullet. Keeping the marks off the characters means editing the text can never leave half-open tags behind: ranges are clamped and split back to the line they belong to whenever the document is normalised.\n\nThe document panel reports words, lines, formatted words and marks, so you can see how much of the text carries formatting rather than guessing. The preview renders after mount and shows the document as it would export. Copy HTML and Download .html take the result out; the export escapes every character of the text and emits only tags from two fixed tables, so nothing you type is ever interpreted as markup.\n\n- Inline marks: bold, italic, underline, strikethrough and code, stored as offset ranges.\n- Block kinds: paragraph, heading, subheading, quote and bullet, one kind per line.\n- Document stats: words, lines, formatted words and total marks.\n- Live preview that renders after mount from the same model the export uses.\n- Copy HTML and Download .html for the escaped export.\n- Headings export as h2 and h3 because the page's own h1 belongs to the page, not the document.\n\nBecause marks are ranges rather than wrappers, normalisation is what keeps the document honest: a mark that would span a line break is split, out-of-range marks are clamped and overlapping marks merge. The HTML export walks the text once, escapes it and interleaves tags from the fixed tables, which is why the editor can show a preview without a sanitiser of its own — the source never becomes markup. Every operation is a pure function over the document model. The model is small enough to reason about: text, a list of marks and a kind per line, which is why the stats panel can say how much of the document carries formatting without walking the rendered output.\n\n- There is no undo history beyond what your browser provides for the underlying text.\n- Marks cannot span blocks: a bold run that crosses a line break is split into two.\n- Nested formatting beyond the five marks is not representable; there is no bold-inside-link.\n- The preview renders after mount, so the first paint shows the text before the styled version appears.\n- No collaboration and no comments; the document is a single local model.\n\nUse it when the deliverable is formatted text rather than Markdown: a letter, a section with mixed quotes and headings, or a draft you want to hand to someone as HTML. The block-based editor is the sibling for typed blocks and to-dos, and the markdown editor is the sibling when the output must be source. The important property shared by all three is that the underlying text is always recoverable.\n\nThe HTML export is deliberately boring: escaped text plus a fixed tag set, which means it pastes cleanly into an email client or a CMS without carrying attributes you never chose. When the document needs to survive a submission process instead, the manuscript formatter applies the mechanical substitutions that format asks for. Between the two sits this editor, whose job is to keep the text honest while the marks change around it, and whose export is deliberately free of attributes you never chose.",
    howTo: [
      { step: "Type or paste the document text; each line takes a block kind from the picker." },
      { step: "Apply inline marks — bold, italic, underline, strikethrough, code — to ranges of the text." },
      { step: "Watch the preview for the rendered result and the document panel for words, lines, marks and formatted words." },
      { step: "Copy HTML or Download .html to export the document as escaped, standards-clean markup." },
    ],
    whenToUse:
      "Use the rich text editor when you want formatting without syntax and need the output as HTML. The {{markdown-editor|Markdown Editor}} produces the same document as source instead, and the {{block-based-editor|Block-Based Editor}} builds structure from typed blocks with to-dos. When the document is going into a submission format rather than a web page, the {{manuscript-formatter|Manuscript Formatter}} applies the typographic clean-up that publishers ask for, and the distraction-free editor in this domain removes formatting entirely.",
    faqs: [
      {
        q: "How are bold and italics stored?",
        a: "As offset ranges into the plain text, not as wrappers around characters. That is why editing the text cannot leave half-open tags: ranges are clamped and split to their line whenever the document is normalised.",
      },
      {
        q: "What block kinds are available?",
        a: "Paragraph, heading, subheading, quote and bullet — one kind per line. Headings export as h2 and h3 because the page's own h1 belongs to the page rather than your document.",
      },
      {
        q: "Is the HTML export safe to paste elsewhere?",
        a: "Yes. The export escapes every character of your text and emits only tags from two fixed tables, so nothing you typed is interpreted as markup. It pastes cleanly into a CMS or mail client.",
      },
      {
        q: "Can a mark cross a line break?",
        a: "No. Marks cannot span blocks; a bold run that would cross a line break is split into two marks, one per line, when the document is normalised.",
      },
      {
        q: "Why does the preview appear after a moment?",
        a: "The preview renders after mount so the editor can paint the text first. It is a rendering choice rather than a limitation; the model is already complete when the preview appears.",
      },
    ],
  },

  "block-based-editor": {
    keywords: [
      "block-based editor",
      "typed blocks",
      "to-dos",
      "markdown export",
    ],
    intro:
      "The Block-Based Editor builds a page from typed blocks with to-dos, reports page stats and exports the whole thing back to Markdown.",
    content:
      "A block-based page is an ordered list of typed units, and this block-based editor builds one the way a Notion page is built: paragraphs, headings, subheadings, quotes, bullets, numbered items, to-dos, dividers and code. Blocks parse from plain text by their markers, which means anything typed in a plain textarea can be pasted in and become a structured page — and the same markers take it back out as Markdown, so the page survives a round trip. The page is built from typed blocks — each with its own kind and text — so structure is explicit rather than implied by formatting.\n\nThe page panel carries a title, which becomes the document's h1, and every block beneath it is editable, reorderable and changeable in kind. Page stats report blocks, words, to-dos done and empty blocks, which is how a page announces both its size and its loose ends. Copy Markdown and Download .md export the document; Copy outline extracts the heading structure for a review. The last block cannot be removed — deleting it replaces it with an empty paragraph, so the document always has somewhere to type.\n\n- Block kinds: paragraph, heading, subheading, quote, bullet, numbered item, to-do, divider and code.\n- Marker parsing: #, ##, -, 1., bracket, greater-than, exclamation and horizontal rules.\n- Page title: the document's own h1, separate from the blocks.\n- Page stats: blocks, words, to-dos done and empty blocks.\n- Reordering: move a block up or down without touching its text.\n- Copy Markdown, Download .md and Copy outline for the exports.\n\nEvery edit is a pure function over the whole document, and block ids are assigned by scanning the highest existing number, so ids stay stable across re-renders without a counter living outside the model. Toggling a to-do, changing a kind or moving a block returns a new document rather than mutating one, which is what keeps the exports consistent with what is on screen. Headings export from h2 down because the page title already holds the h1 slot.\n\n- No collaboration and no comments; the document is one local model.\n- No undo history beyond what the browser provides for the underlying input.\n- Dividers and empty blocks count in the block total, so stats can read higher than visible content.\n- Markdown export covers the fixed kind set; bespoke formatting is not representable.\n- A pasted document parses by its markers, so text without markers arrives as plain paragraphs.\n\nThe workflow is to build the page as blocks while the structure is still moving: a heading per section, to-dos under the ones that remain, quotes where the argument needs a voice. Reading page stats at the end tells you what the page is — how many blocks, how many to-dos still open — which is a different and more useful summary than a word count alone. Empty blocks count too, and they are counted on purpose: an empty block is a section started and not yet written, which is exactly what a page should surface.\n\nThe siblings split the same job by output: the markdown editor writes the same structure as source, the rich text editor marks ranges over plain text instead of types, and the outline builder starts from indented text before any of it exists.",
    howTo: [
      { step: "Set the page title, then add blocks and give each one a kind." },
      { step: "Parse existing text into blocks by pasting it — markers are recognised as they arrive." },
      { step: "Read page stats for blocks, words, to-dos done and empty blocks." },
      { step: "Copy Markdown, Download .md or Copy outline to take the page with you." },
    ],
    whenToUse:
      "Use the block-based editor when the document is a structure of typed parts rather than a stream of prose. The {{markdown-editor|Markdown Editor}} writes the same structure as source with a preview and stats, and the {{rich-text-editor|Rich Text Editor}} marks ranges over plain text instead of typing kinds. For structure before blocks exist, the {{outline-builder|Outline Builder}} renders indented text three ways, and the distraction-free editor in this domain strips the page back to prose.",
    faqs: [
      {
        q: "Which block types can I create?",
        a: "Paragraph, heading, subheading, quote, bullet, numbered item, to-do, divider and code. Each has a marker for parsing, so plain text pasted with those markers becomes structured blocks automatically.",
      },
      {
        q: "Can I reorder blocks?",
        a: "Yes, move a block up or down without touching its text. Every edit returns a new document rather than mutating one, so the exports always match what is on screen.",
      },
      {
        q: "Why can't I delete the last block?",
        a: "A page needs somewhere to type, so removing the last block replaces it with an empty paragraph. The document is never left with nowhere to go.",
      },
      {
        q: "How does Markdown export handle headings?",
        a: "Headings export from h2 down, because the page title already holds the h1 slot. Copy outline gives the same structure as a plain heading list for a review.",
      },
      {
        q: "Where is my page stored?",
        a: "The document is a local model in the page — no collaboration, no comments and no server. Copy Markdown or Download .md when the page needs to outlast the session.",
      },
    ],
  },
};
