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
    keywords: ["plot structure", "beat sheet", "three-act structure", "hero's journey", "stakes"],
    intro:
      "The plot structure planner maps the four facts a premise needs — protagonist, goal, conflict and stakes — onto the beats of a chosen structure, so the whole beat sheet reads in order before a draft exists.",
    content: `The plot structure planner starts from the four facts a premise cannot do without: who the story is about, what they want, what pushes back, and what it costs if they fail. You write those facts once, choose a structure, and the planner places each one on the beat where a reader expects to meet it. The result is not a form full of prompts; it is a beat sheet with your own premise already sitting at the load-bearing points, and the structure's remaining beats around it.

The anchor points are deliberate. The protagonist arrives at the opening, because a structure is a shape for someone's story. The goal lands at the inciting incident, because that is the beat where a want becomes a journey. The conflict reaches the midpoint, where the opposing force shows its full strength and the story stops being the one the reader thought they were reading. The stakes take the second turning point, where the cost of failing has to become concrete enough to carry the final act. A plot structure is a set of promises; the anchors are where those promises come due.

Between the anchors, each beat keeps its own prompt from the structure you chose: the midpoint asks for the reversal, the second plot point asks for the cost, the resolution asks for the new normal. That is what makes the output a full beat sheet rather than four labelled slots. The three-act structure runs seven beats, the four-act five, the hero's journey twelve and Save the Cat fifteen; the planner matches each of your four facts to the nearest beat that is still free, so no two facts ever land on the same one.

Switching structure is a one-click experiment. Change from a three-act structure to the hero's journey and the same four anchors re-map to that structure's beats while the new beats appear with their own prompts. Writers use this to test whether a premise is a journey or a three-act story without rewriting anything; if the facts feel wrong on a structure's beats, that is information about the premise, not a formatting problem.

The checks are the planner's own. A logline under eight words states a topic rather than a story, so it is flagged with its word count. A conflict under four words names a difficulty rather than an opposing force. A missing fact is reported as missing, with a sentence about which beat it was supposed to carry. None of the checks touch your prose; they count and they name gaps.

What the planner cannot do is invent. It will not produce subplots, characters or scenes, and the beats between your anchors remain prompts until you fill them. Stakes that never appear in the draft, a goal that changes at the midpoint, a conflict that turns out to be weather rather than a force — the planner cannot see any of that, and a plan is not a draft. Treat the output as an argument to have with the story before you write it: if the four facts cannot carry the beats they are anchored to, no amount of structure will.`,
    howTo: [
      { step: "Write the logline as one sentence you could say out loud." },
      { step: "Name the protagonist, the goal, the conflict and the stakes, one per field." },
      { step: "Choose the structure; switch it later to test whether the premise holds a different shape." },
      { step: "Read the beat sheet and fix any fact the check marks as missing or too thin." },
      { step: "Draft from the anchors first, then fill the beats between them." },
    ],
    whenToUse: `Use the plot structure planner when a premise is firm enough to have a want and an obstacle but not yet a plan: before outlining, before a first draft, and before committing to a structure that will shape months of work.
The plan hands off in two directions. Take it to the {{story-beat-builder|Story Beat Builder}} to track which beats are drafted, or to the {{plot-point-mapper|Plot Point Mapper}} when you would rather start from the events you already have and see which structure they imply. If the premise itself is still thin, start with the {{story-idea-generator|Story Idea Generator}} instead.`,
    faqs: [
      {
        q: "What are the four facts a premise needs?",
        a: "A protagonist, a goal, a conflict and stakes: who the story is about, what they want, what pushes back, and what failing costs. The planner anchors each to the beat where a reader expects it and treats anything missing as a gap rather than a detail.",
      },
      {
        q: "Why does the planner anchor the conflict to the midpoint?",
        a: "Because the midpoint is where the opposing force shows its full strength; before it, the story is still promising the conflict, and after it, the ending has to answer for it. Anchoring the conflict there is what stops a premise from staying vague about who or what pushes back.",
      },
      {
        q: "How does the planner choose beats when I change structure?",
        a: "Each fact is matched to the nearest beat that is still free in the new structure, so the four anchors stay distinct. The remaining beats come from the structure's own beat list, which is why a hero's journey plan has twelve lines and a three-act plan has seven.",
      },
      {
        q: "What does the logline check catch?",
        a: "A logline under eight words. At that length it is usually a topic or an image rather than a story with someone in it, and every beat below will have less to answer to. The check reports the word count rather than rewriting the sentence.",
      },
      {
        q: "Can the planner outline a whole novel?",
        a: "It can shape one, not fill it. The anchors and prompts are as much as a premise supports; subplots, character arcs and scene-level turns come from you. Use the plan as an argument to test the premise before drafting, not as a substitute for the draft.",
      },
    ],
  },

  "genre-blender-idea-tool": {
    keywords: ["genre blender", "mash-up", "elements", "conventions", "premise"],
    intro:
      "The genre blender idea tool collides two genres' stock elements and reader conventions into five premise scaffolds, keeping one thing from each side that a reader of either shelf would still recognise.",
    content: `The genre blender takes two genres and shows what each one brings to a mash-up. Every genre carries elements — the objects, pressures and situations its readers expect to encounter — and conventions, the kinds of scene the genre is built from. A blend only works when both sets stay recognisable, so the tool puts the two lists side by side before it generates anything, and the writer can see what a reader of each shelf will expect to survive the merge.

The five scaffolds are fixed templates, not random combinations: collision, deadline, inversion, cost and frame. Fixing them matters because they are different kinds of story rather than different flavours of the same one. A collision asks what happens when the two genres' opening objects turn out to be the same thing. A deadline imports the pressure of one genre into the timeline of the other. An inversion makes one genre's convention the force that breaks the other's. A cost makes the solution satisfy one set of expectations at the expense of the other. A frame tells one genre's story inside the other's, with the required element as the thing the frame was built to hide.

The required element is the tool's one optional input and its most useful. Left empty, each scaffold falls back to a phrase about the element that refuses to fit. Name something concrete — a ledger, a shared recording, a door that opens inward — and the element appears in all five scaffolds, including the cost scaffold where it becomes the compromise that satisfies no one. That single input is usually the difference between a premise and a prompt.

Two habits make the blend easier to test. First, write the two opening images the collision paragraph describes — one from each genre's element list — and read them back to back; if they cannot plausibly be the same object or the same room, the collision needs a different pair of elements. Second, name the blend after what it does rather than after the two shelves: a mystery with a western's obligations is a different promise from a western with a mystery's alibi, and the name is the first thing a reader uses to decide whether the friction is for them.

The checks name the three ways a blend fails before it starts. The same genre twice is not a blend, because there is no second set of expectations to collide. A missing required element leaves the collision generic. And when the two genres share their first convention, the tool says so, because the blend then needs a different point of friction than the obvious one.

What the tool cannot do is promise a market. A mash-up is read by people who already like at least one of the two genres, and the blend has to decide which convention it will break; a story that honours neither set reads as neither genre, and one that honours both without friction reads as a shelf label rather than a premise. The two conventions lists are there so that decision can be made deliberately, in the same pass as the idea.

Names, plots and characters are yours. The genre blender provides the collision and keeps the two expectation sets visible while you work on the premise; the scaffolds are starting positions for an outline, not outlines. Take the one that makes you argue with it — often the cost or the frame where the two genres genuinely disagree.`,
    howTo: [
      { step: "Pick two different genres from the list." },
      { step: "Name one required element — an object, a line or a place — that must survive the merge." },
      { step: "Read the two elements and conventions lists and note where they disagree." },
      { step: "Choose the scaffold that makes the disagreement do work, and draft the premise from it." },
      { step: "Clear the checks by naming the element and confirming the two genres differ." },
    ],
    whenToUse: `Use the genre blender idea tool when a story needs a fresh engine rather than a fresh coat of paint: a premise that feels familiar, a shelf that has been read out, or a project that has stalled because its genre expectations are too comfortably met.
Once a scaffold is chosen, the {{plot-structure-planner|Plot Structure Planner}} maps the premise's want, conflict and stakes onto beats, and the {{ending-generator|Ending Generator}} tests which verdicts that collision can pay off. If the genre pair is the real problem, start from the {{story-idea-generator|Story Idea Generator}} and blend once a single-genre premise exists.`,
    faqs: [
      {
        q: "What counts as a genre element?",
        a: "A thing or pressure the genre's readers expect to encounter: an object with a history, an obligation, a place with rules. Elements are concrete on purpose, because a collision between two concrete things produces a scene, while a collision between two moods produces a mood board.",
      },
      {
        q: "Why are there exactly five scaffolds?",
        a: "Because they are the five structurally different ways two expectation sets can meet: collision, deadline, inversion, cost and frame. More templates would repeat those shapes with different wording, and fewer would leave one of the ways untried.",
      },
      {
        q: "Why is the same genre twice not a blend?",
        a: "A blend works by friction between two sets of reader expectations. With one genre there is no second set, so the collision has nothing to collide with; the tool generates nothing and says so rather than dressing one genre up as two.",
      },
      {
        q: "How should I use the required element?",
        a: "Name something the story cannot remove: an object, a place, a line someone says. It appears in all five scaffolds, and in the cost scaffold it becomes the compromise. Writers use it to pin the blend to a specific image instead of a general vibe.",
      },
      {
        q: "Will a mash-up appeal to readers of both genres?",
        a: "Not automatically, and the tool will not claim otherwise. Readers arrive with one set of conventions in mind; the blend has to decide which convention it will break and earn the break. The two lists are there to make that choice visible before the outline hardens.",
      },
    ],
  },

  "ending-generator": {
    keywords: ["ending", "want", "obstacle", "verdict", "threshold"],
    intro:
      "The ending generator drafts the six shapes an ending can take against your story's own want and obstacle, so each verdict can be compared for what it promises and what it asks of the setup.",
    content: `The ending generator treats an ending as a verdict on the force that pushed back all story. Give it a want and an obstacle and it drafts six shapes: the want won at a price, the want revealed as the obstacle, the want abandoned at the threshold, the protagonist's own method finishing what the obstacle began, the obstacle survived rather than defeated, and the opening image returned to, changed. Each draft is written against your own words, so the comparison is between verdicts on the same story rather than between generic templates.

The want and the obstacle are the two inputs that make generation possible, and they are required for a reason. An ending that resolves nothing specific is a mood; an ending that answers no force is a coincidence. A one-word want is flagged with its word count, because endings land on concrete wants — keep the farm solvent through the winter, not hope. A missing obstacle is reported, because without the force that pushed back the closing scene has nothing to answer and the reader can feel the absence even if they cannot name it.

The turn is the third input and the one writers most often skip: what changes about the protagonist by the end. The full circle and quiet return shapes write it into the draft, and its absence is flagged separately, because a story whose protagonist ends as they began will replay its opening no matter how eventful the closing scene is. The turn is not a lesson or a moral; it is the difference the reader should be able to name in the last paragraph.

Each shape also carries what it requires of the story. The hard-won victory needs a cost the reader saw the protagonist refuse earlier, or the price reads as an accident. The inversion needs the want and the obstacle to share a root the reader can now see. The threshold needs a genuinely balanced choice, because an ambiguity that the story never set up is not ambiguity but a missing ending. The reason the drafts say this out loud is that a shape chosen without its setup is the most common way a strong ending turns into a cheat.

Read the six drafts in the order they are given before judging any of them. Full circle, hard-won victory, inversion, tragic fall, ambiguous threshold, quiet return — the order runs from the most satisfied verdict to the least, and a writer who reads only the first two is usually choosing the ending they already had in mind. The quiet return in particular is the most under-used shape in the list: it is the one for stories where the obstacle was never going to be defeated, and the change in the protagonist is the whole resolution.

The checks are deliberately narrow: a missing want, a missing obstacle, a want too short to land on, a missing turn, and a protagonist left unnamed. They do not grade your ending, and they cannot tell whether the story earned the verdict you choose. That judgement stays with you and with readers.

What the generator cannot do is write the scene. These are drafts to argue with: read all six, notice which one makes the existing story feel different, and check the setup it requires is already on the page. Where a shape needs a cost the reader has seen, that cost is a rewrite near the middle, not a line in the last chapter. Choosing between the six is the work; averaging two of them is not an ending.`,
    howTo: [
      { step: "Name the protagonist, the want and the obstacle in your own words." },
      { step: "Name the turn: what changes about the protagonist by the end." },
      { step: "Read all six drafts and mark the two that make the existing story feel different." },
      { step: "Check the setup each shape requires; if it is not on the page, plan the earlier scene that earns it." },
      { step: "Draft the chosen ending, then re-read the opening against it." },
    ],
    whenToUse: `Use the ending generator when a draft is approaching its final act, when an ending written already feels borrowed, or when a project has stalled precisely because the writer cannot decide what the story is a verdict on.
The want and the obstacle it works from are the same facts the {{plot-structure-planner|Plot Structure Planner}} anchors to beats, so the two tools can be used in either order. To check that the chosen ending is earned, take it to the {{story-beat-builder|Story Beat Builder}}; if the premise itself is still open, the {{genre-blender-idea-tool|Genre Blender Idea Tool}} can supply a collision worth ending.`,
    faqs: [
      {
        q: "Why does the generator need both a want and an obstacle?",
        a: "Because an ending is a verdict on something specific pushing back. Without a want there is nothing to resolve, and without an obstacle the resolution answers nothing. Both are required before any shape is drafted, and the checks say which one is missing.",
      },
      {
        q: "What is the difference between the inversion and the tragic ending?",
        a: "The inversion reveals that the want was doing the obstacle's work, and the protagonist gives it up knowingly; the tragic ending has the protagonist win using the obstacle's own method, and the method finishes what the obstacle began. One is a choice made clear-eyed, the other a victory that is also a defeat.",
      },
      {
        q: "Is an ambiguous ending allowed?",
        a: "Yes, when it is a choice rather than a missing answer. The threshold shape stops after an irreversible decision that the story has genuinely balanced, so the reader sees the choice and not the result. Ambiguity that the setup never earned is flagged as a missing turn, not celebrated.",
      },
      {
        q: "Why does each idea name what it requires?",
        a: "Because a shape without its setup reads as a cheat. A hard-won victory needs a cost the reader saw refused earlier, and an inversion needs the want and obstacle to share a root the reader can see. Naming the requirement turns the choice into a rewrite plan.",
      },
      {
        q: "Can I combine two of these endings?",
        a: "You can, but the result is usually a diluted version of both. The six shapes are distinct verdicts, and a story can only deliver one: read them, choose, and spend the ambiguity budget once, rather than hedging at the last paragraph.",
      },
    ],
  },

  "rich-text-editor": {
    keywords: ["rich text", "bold", "italic", "HTML preview", "selection"],
    intro:
      "The rich text editor formats a plain-text document with bold, italic, underline, strike and code plus line-level headings, quotes and bullets, and renders an escaped HTML preview that updates as you type.",
    content: `The rich text editor keeps plain text as the source of truth and stores formatting as offsets over it. Applying bold to a selection records a range, not a pair of tags, which means editing the text can never leave a half-open tag behind: ranges are clamped to the document, split at line breaks and merged whenever the model is normalised. Bold, italic, underline, strike and code all work the same way, and they nest cleanly when they overlap.

The toolbar acts on the selection. Select a word and press the bold control, or use the keyboard shortcuts the buttons name — Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X and Ctrl+E. A selection that crosses a line break is applied per line, so a mark never spans two blocks; a single cursor with no selection applies nothing, because there is no text to format. The HTML preview renders from the same model the toolbar edits, so what you see in the document is what the export contains.

Block kinds live on lines rather than marks: paragraph, heading, subheading, quote and bullet, chosen for the line the caret is on. Headings render as h2 and h3 rather than h1, because the page's own title owns the top level and a document should not introduce a second one. Bullets on consecutive lines group into a single list, and quotes render as blockquotes.

Keeping the block kinds on lines rather than on ranges is what allows the document to be edited freely. A heading is a property of the line, so merging two lines or splitting one re-reads the kinds from the text instead of trying to move a range; the mark ranges do the same work for emphasis, clamped at every edit. This is also why the stats panel can report lines, marks and formatted words without parsing anything: the model already holds them as data.

Every character in the document is escaped before it reaches the HTML preview, and the only tags that can appear are the ones in the editor's fixed tables. That is why the tool shows a live preview without a sanitiser: nothing typed is ever interpreted as markup, so a pasted tag or a stray angle bracket appears as text. It is also why the export can be pasted into a page safely, though it is a starting point rather than a styled document.

The stats panel counts words from the text and formatted words, where a word counts as formatted when a mark covers its first character. Marks are counted as ranges, so a word that is both bold and italic contributes one range to each mark. The counts are meant for a quick read of how much of the document carries emphasis, not as a writing goal.

What the editor does not have is a table, an image, a link tool, a font picker or a colour palette. The block kinds stop at paragraphs, two heading levels, quotes and bullets. The HTML export reflects exactly those elements, so nothing appears in the HTML that is not visible in the document, and nothing in the document is dropped from the export. Nothing is saved between visits either; copy the HTML or download the file to keep the work.`,
    howTo: [
      { step: "Type or paste the document text into the editor." },
      { step: "Select the words to format and press a mark control, or use its keyboard shortcut." },
      { step: "Put the caret on a line and choose its block kind: paragraph, heading, subheading, quote or bullet." },
      { step: "Watch the HTML preview and the stats as the document changes." },
      { step: "Copy the HTML or download the file to keep the result." },
    ],
    whenToUse: `Use the rich text editor when a short document needs a handful of formatting decisions and a clean HTML export: a notice, a newsletter body, a product blurb, a post that will be pasted into another system.
If the source should stay readable as plain text, the {{markdown-editor|Markdown Editor}} is the better fit and renders an outline alongside. For long documents built from named sections, the {{block-based-editor|Block-Based Editor}} keeps structure in the model, and the {{manuscript-formatter|Manuscript Formatter}} handles the punctuation and dash cleanup before submission.`,
    faqs: [
      {
        q: "Where are the formatting marks stored?",
        a: "As offset ranges over the plain text rather than tags inside it. That is what makes the document safe to edit: ranges are clamped, split at line breaks and merged, so deleting a paragraph can never leave an unclosed tag in the export.",
      },
      {
        q: "Why do headings render as h2 and h3?",
        a: "Because the page's own title owns the h1. A document rendered inside a page that already has a top-level heading should not introduce a second one, so the editor's two heading levels map to the levels below the page title.",
      },
      {
        q: "Can I paste HTML into the editor?",
        a: "You can paste it, but it will appear as text rather than markup. Every character is escaped before rendering and only the editor's own tags are emitted, so there is no sanitiser to run and no way for a pasted tag to become part of the document.",
      },
      {
        q: "What happens to marks when I delete text?",
        a: "Ranges are clamped to the new text and merged, so a mark that covered deleted characters shrinks or disappears rather than trailing empty space. Marks never cross a line break, so removing a break merges two blocks without joining their formatting.",
      },
      {
        q: "Is the document saved between visits?",
        a: "No. The editor keeps everything in memory for the session, which keeps it predictable in shared and private browsers. Copy the HTML or download the file before leaving the page if you want to keep the work.",
      },
    ],
  },

  "block-based-editor": {
    keywords: ["block-based editor", "blocks", "to-do", "Markdown", "outline"],
    intro:
      "The block-based editor builds a page from typed blocks — headings, lists, to-dos, quotes, callouts and dividers — with reordering, a paste-to-structure step and a Markdown export that always matches the page.",
    content: `The block-based editor treats a page as an ordered list of typed blocks, the way a Notion page is built. Ten types are available: paragraph, heading, subheading, minor heading, bulleted list, numbered list, to-do, quote, callout and divider. Each block carries its own text and identity, and every edit — retyping, changing a block's type, ticking a to-do, moving it or removing it — goes through the same model, so the page on screen and the export are never two different documents.

Pasting plain text is the fastest way in. The editor reads each line's marker and turns it into the matching block: # for a heading, ## and ### for the levels below, a leading dash for bullets, a number for ordered steps, brackets for to-dos, an angle bracket for quotes, an exclamation mark for callouts and three dashes for a divider. Anything unmarked becomes a paragraph. Text written in another app — meeting notes, a README, a chat log — usually arrives already structured, and the replace step keeps the page title while rebuilding the body.

To-dos are the blocks with state: each one carries a checked flag, the page counts how many are done, and the Markdown export writes them back as task list items. Blocks reorder with the up and down controls, insert below any block, and remove cleanly; identifiers are assigned by scanning the page, so a block keeps its identity across an edit and React never has to guess.

Three exports come off the same model. The Markdown export writes the title as the page's single h1, then one line per block: headings from h2 down, bullets, sequentially numbered steps, task list items, quotes, a note-style callout and a horizontal rule for dividers. The outline lists only the headings, indented by level, for navigation. The stats panel counts blocks, words, headings, empty blocks and to-do progress, with a per-type breakdown.

The outline export earns its place in longer pages. Read on its own it shows whether the headings form a sequence a reader could navigate — a page whose h2 blocks all sit under one h3, or whose headings repeat a phrase, is usually a page with a missing section rather than a wording problem. Because the outline is generated from the same blocks, editing a heading changes it immediately, and a section that has outgrown its heading shows up as a missing rung rather than a gut feeling.

Two rules keep the page whole. A page always keeps at least one block: removing the last one replaces it with an empty paragraph rather than leaving a document with nowhere to type. And a divider carries no text, so switching a block to a divider clears its content deliberately instead of hiding it behind an invisible type.

What the block-based editor leaves out is nesting. There are no sub-pages, columns, drag handles, images, tables or inline formatting inside a block, and nothing is saved between visits. That flatness is what makes the Markdown export exact and the model easy to reason about, and it is also the honest limit: a page that needs structure deeper than headings and lists needs a different tool.`,
    howTo: [
      { step: "Type a page directly, or paste plain text and press the replace control to structure it." },
      { step: "Set each block's type, or write its marker at the start of a pasted line." },
      { step: "Tick to-dos, reorder blocks and add blocks below the one you are editing." },
      { step: "Read the Markdown export and the outline, then copy or download them." },
      { step: "Use the stats panel to catch empty blocks and unfinished to-dos." },
    ],
    whenToUse: `Use the block-based editor when a document is really a page of parts that will be reused: launch checklists, meeting notes that become task lists, a section of a README, a project page whose headings will become its outline.
The {{rich-text-editor|Rich Text Editor}} is the alternative when the important thing is emphasis inside sentences rather than structure between them. For documents that are already a hierarchy of indented lines, the {{outline-builder|Outline Builder}} numbers and renders the outline directly, and the {{scene-and-chapter-organizer|Scene & Chapter Organizer}} boards the same idea for fiction.`,
    faqs: [
      {
        q: "What block types does the editor support?",
        a: "Ten: paragraph, heading, subheading, minor heading, bulleted list, numbered list, to-do, quote, callout and divider. Each has a marker that turns a pasted line into that type, and a dropdown for changing it afterwards.",
      },
      {
        q: "How do I turn pasted text into blocks?",
        a: "Paste it into the source panel and press the replace control. Each line is read for its marker — a heading hash, a list dash or number, to-do brackets, a quote angle bracket — and becomes the matching block, with the page title left alone.",
      },
      {
        q: "Why does the page keep one block when I remove the last one?",
        a: "Because a page with no blocks has nowhere to type. Removing the final block replaces it with an empty paragraph, so the document always has a cursor position and the model never represents a state the editor cannot render.",
      },
      {
        q: "What does the Markdown export look like?",
        a: "The page title as a single h1, then one line per block: headings from h2 down, dashes for bullets, sequential numbers for ordered steps, task list brackets for to-dos, quotes, a note-style callout and a horizontal rule for dividers.",
      },
      {
        q: "Can blocks be nested?",
        a: "No. Blocks are flat, which is what keeps the export exact and the model simple. Headings and lists carry all the structure the editor offers; a page needing sub-pages or columns needs a different tool.",
      },
    ],
  },
};
