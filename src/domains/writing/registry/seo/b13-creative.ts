import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B13, creative writing: authored SEO entries for the dialogue practice
 * tool, the scene description builder, the poetry form guide, the character
 * profile builder and the conflict and resolution planner.
 *
 * Each entry is careful about the line between measuring and writing: these
 * tools count, check and prompt, and none of them generates prose. The checks
 * are described as prompts, and the limits are stated. Keys are registry slugs;
 * see ../tool-seo.ts for the contract.
 */
export const B13_CREATIVE_SEO: Record<string, ToolSeo> = {
  "dialogue-practice-tool": {
    keywords: ["dialogue practice tool", "dialogue", "said-bookisms", "attribution", "questions"],
    intro:
      "The dialogue practice tool gives you a prompt to write from and measures the exchange you write: who speaks, how long each speech runs, which attribution verbs you used and how many lines are questions.",
    content: `The dialogue practice tool is built around the loop that improves dialogue fastest: write a short exchange, then look at what you actually did. It offers a prompt — two old friends at a funeral, a negotiation where both people want the same thing, a character with five words left before they leave — and a space to write the exchange, then measures the result. The measurement is deliberately plain, because a writer revising dialogue wants facts, not praise.

The first fact is who speaks. Speeches written as a script line, with the name and a colon, are attributed directly; prose dialogue with quotation marks has its speaker read from the name before an attribution verb. From that the tool counts how many speeches each character has and how many words they carry, which is the fastest way to see that one character has quietly taken over an exchange. The average speech length does the same job at a different scale: a page of one-line exchanges reads as a tennis match, and a page of long speeches reads as two essays taking turns.

The attribution verbs are the second fact. Every verb other than said, asked, replied and answered is listed as a said-bookism — hissing, barking, breathing and the rest — and a long list is a prompt to check how often a character is doing it. The tool counts adverb tags the same way, since "he said quietly" does a job the line itself could do. Neither list is a rule: a character is allowed to whisper. Counting the habits is what lets a writer decide which ones are worth keeping.

The tool also counts how many speeches end in a question and how many in an exclamation. In an exchange, a run of questions with no answers reads as an interrogation, and a page where everyone is exclaiming reads as a shouting match; seeing the shape as a number is often enough to spot the problem. Narration lines between speeches are counted separately, so a passage that is mostly narration with a little dialogue is visible as such.

Repetition across an exchange is the next thing the counts reveal. If two characters keep answering in the same sentence shape, or every speech opens with the other's name, the pattern is invisible while writing and obvious in the list. Reading the speeches back with the word counts beside them also shows where a beat is being explained rather than exchanged: a four-word line followed by a forty-word line usually means one character is talking at the other, which may be exactly right and may be the scene failing. The tool does not decide which — it puts the numbers where the decision is.

Nothing is uploaded and nothing is stored beyond the tab, and the tool never rewrites a line. It measures an exchange you wrote against habits that are easy to miss in the middle of writing, and it says plainly that said-bookisms, adverb tags and question counts are prompts to consider rather than rules to obey.`,
    howTo: [
      { step: "Read the prompt, or press next prompt for another situation." },
      { step: "Write the exchange, one speech per line as Name: \"speech\", or paste a passage." },
      { step: "Check who speaks and how the words are distributed between them." },
      { step: "Read the attribution verbs and adverb tags as prompts, not rules." },
      { step: "Note the question and exclamation counts, then revise the lines you want to change." },
    ],
    whenToUse: `Use the dialogue practice tool when an exchange is drafted and you want to see its shape before you revise it. When the problem is the room the exchange happens in rather than the lines, the {{scene-description-builder|Scene Description Builder}} prompts the sensory details, and when a character in the exchange feels flat the {{character-profile-builder|Character Profile Builder}} asks what they want and need.

If the exchange sits inside a scene you are still planning, the {{plot-point-mapper|Plot Point Mapper}} shows how the scene carries the beats around it.`,
    faqs: [
      {
        q: "What is a said-bookism?",
        a: "An attribution verb other than said, asked, replied or answered — hissed, barked, breathed and so on. The tool lists the ones it finds so you can decide which are earning their place; it does not ban them.",
      },
      {
        q: "How does it know who is speaking?",
        a: "From a script prefix, such as a name and a colon before the speech, or from a name immediately before an attribution verb in prose. A speech the tool cannot attribute is counted as unnamed rather than guessed at.",
      },
      {
        q: "Does it rewrite my dialogue?",
        a: "No. It measures the exchange and copies a report; it never edits a line. The point is to see the habits — how long speeches run, how many questions there are — so you can revise the lines yourself.",
      },
      {
        q: "Is text uploaded anywhere?",
        a: "No. There is no account and no upload, and the text lives only in the tab where you are working, so an unpublished exchange stays unpublished.",
      },
      {
        q: "Why count questions and exclamations?",
        a: "Because a run of questions with no answers reads as an interrogation and a page of exclamations reads as a shouting match. Seeing the count as a number makes both easy to spot in a passage that felt fine while writing it.",
      },
    ],
  },

  "scene-description-builder": {
    keywords: ["scene description builder", "scene description", "filter words", "sensory details", "prompts"],
    intro:
      "The scene description builder asks a set of prompts about a place — light, weather, sound, smell, texture, mood — and turns your answers into a note sheet, with a check for the filter words that hold a reader back.",
    content: `The scene description builder is a set of prompts, not a paragraph generator. It asks the questions a description answers — where the scene is, what time of day it is, where the light comes from, what the weather is doing, what can be heard and from how far off, what the air smells of, what a hand would touch, and what feeling the place should carry. You answer in short fields, and the tool assembles the answers into a note sheet in a fixed order, so the details are decided before the prose is written. That ordering is the whole method: a description drafted without the details decided tends to reach for whichever sense comes first.

The sheet also reports its own completeness, listing the prompts still unanswered. That list is not a scold — a scene rarely needs all eight — but it makes the choice deliberate. A reader notices when a place has light and sound but no smell, and the missing lines on the sheet are exactly the ones that would have supplied it. The answers stay as labelled lines rather than prose so they cannot quietly become the paragraph: they are notes for the writer, and an unfinished field is visibly unfinished.

Alongside the sheet, the builder checks a passage for filter words. Filters are the perception verbs — saw, heard, felt, noticed, watched, wondered, seemed — that narrate the act of perceiving instead of the thing perceived. "She saw the boat slip out" is one step removed from "the boat slipped out", and although a sentence sometimes needs the filter, a passage thick with them reads as a report rather than a scene. The tool lists the verbs it finds with their counts, so the habit is visible rather than invisible.

This is a mechanical check on a small, well-defined habit, and the page says so. It does not judge a sentence, does not rewrite one, and does not know that a particular "saw" is doing essential work. Combined with the prompt sheet, though, it covers the two halves of writing description that are hardest to do by feel: deciding the details, and then getting out of the reader's way when they are on the page.

A note sheet is also the fastest way to keep a setting consistent across scenes. If a harbour is described as grey and cold in chapter two, that chapter's sheet becomes the reference for chapter nine, and the notes for each place can be kept side by side. Because the sheet keeps the answers as labelled lines rather than prose, two scenes in the same place can be compared for the details they share and the ones that changed without meaning to — a quiet value of writing the answers down, since it is the setting as it holds across a whole book, not the single scene, that readers notice when it slips.

Nothing is uploaded and nothing is stored beyond the tab. The sensory details of an unpublished setting are the sort of thing a writer does not want leaving the room, and nothing does.`,
    howTo: [
      { step: "Answer the prompts: place, time, light, weather, sound, smell, texture and mood." },
      { step: "Read the note sheet, which keeps the answers in a fixed order." },
      { step: "Check the completeness line for the prompts you left open." },
      { step: "Paste the passage you wrote and read the filter-word check." },
      { step: "Copy the notes or download the report and revise the passage yourself." },
    ],
    whenToUse: `Use the scene description builder before writing a scene, when the details are still undecided, or after, when a passage feels thin and you want to see which senses are missing. When the problem is the talk in the scene rather than the setting, the {{dialogue-practice-tool|Dialogue Practice Tool}} measures the exchange, and when the scene reaches submission the {{manuscript-formatter|Manuscript Formatter}} handles the typography.

If you are assembling the passage in Markdown, the {{markdown-editor|Markdown Editor}} keeps the notes and the draft in one place.`,
    faqs: [
      {
        q: "Does it write the description for me?",
        a: "No. It asks the questions and keeps your answers as labelled notes. The prose is yours; the tool makes sure the light, sound, smell and texture were decided before you reached for the first one.",
      },
      {
        q: "What are filter words?",
        a: "Perception verbs such as saw, heard, felt and noticed that report the act of perceiving rather than the thing perceived. The tool lists them with counts so a habit of filtering every sensation is visible; a sentence that needs one is allowed to keep it.",
      },
      {
        q: "Do I have to fill every prompt?",
        a: "No, and few scenes need all of them. The completeness line simply names the ones you left open so the choice is deliberate rather than accidental.",
      },
      {
        q: "Is my passage uploaded?",
        a: "No. There is no account and no upload, and the notes and passage live only in this tab, so an unpublished setting and scene stay private.",
      },
    ],
  },

  "poetry-form-guide": {
    keywords: ["poetry form guide", "poetry", "syllables", "rhyme scheme", "fixed forms"],
    intro:
      "The poetry form guide is a reference to the common fixed forms — haiku, tanka, limerick, sonnet, villanelle and more — plus a checker that measures a draft's lines, approximate syllables and rhyme scheme against one.",
    content: `The poetry form guide does two things: it is a reference to the fixed forms, and it measures a draft against one of them. The reference lists the haiku, tanka, limerick, cinquain, both sonnets, the villanelle, the sestina and free verse, with the line count, syllable pattern, rhyme scheme and metre that conventionally define each. Poetry has a long tradition of forms with exacting rules, and having the rules in front of you — rather than half-remembered — is most of what a guide is for.

The checker takes that reference and turns it on your draft. Write a poem, choose the form, and the tool reports how many lines it has against the form's count, approximate syllables per line against the pattern, and the rhyme scheme your lines actually use. Where the draft differs, it says so in plain terms: this many lines instead of that many, syllables reading as a different pattern, a rhyme scheme of its own rather than the expected one. None of it is a verdict — poems break forms deliberately — but a difference you can see is a difference you can choose.

The rhyme scheme is derived from the final sound of each line and labelled with letters, so four lines rhyming alternately come back as ABAB. That is a useful mirror, because a rhyme scheme intended and a rhyme scheme heard can differ. The syllable counts are approximate, using the same counter the domain's readability tools use, which does not know a poet's elisions or a name's pronunciation; the page labels them approximate because they are.

What the guide does not do is check metre. Stress patterns — iambic pentameter and the rest — are a much larger problem than counting syllables, and the tool says plainly that it does not attempt it. It also does not suggest rhymes, write lines or score a poem. It reports the form's rules and then reports the gap between them and the draft, and leaves the judgement, which is where judgement belongs.

The guide is also, deliberately, a reading list. A writer who has never counted the syllables in a haiku often finds that the three lines of five, seven and five are tighter than expected, and the same is true of a limerick's anapaestic swing or a villanelle's two refrains that repeat and finally meet. Measuring a draft against the form is a way of learning what the form asks by doing it, which is how most writers come to use these structures: not as constraints to obey, but as shapes that do work a free line cannot, and that reward a little patience with a rhythmic pleasure the unmeasured line does not have.

The form data is the conventional description of each form, not a ruling on what a poem must be. A sestina's end-word rotation, a villanelle's refrains and a sonnet's turn are described as traditions describe them, and a poem that ignores every one of them is still a poem — just not a haiku, and the tool will say so without complaint.`,
    howTo: [
      { step: "Choose a fixed form: haiku, tanka, limerick, cinquain, a sonnet, villanelle, sestina or free verse." },
      { step: "Read the form's rules in the reference panel: lines, syllables, rhyme and metre." },
      { step: "Write or paste your draft, one line per line." },
      { step: "Read the measured lines, approximate syllables and the rhyme scheme your draft uses." },
      { step: "Check the notes for where the draft and the form differ, then decide what to change." },
    ],
    whenToUse: `Use the poetry form guide when you are writing in a fixed form and want the rules and a measurement of your draft rather than a memory of them. When you want to see the structure of a longer poem as a list, the {{outline-builder|Outline Builder}} numbers an outline of its parts, and for a plain count of words in a draft the {{word-count-tool|Word Count Tool}} answers quickly.

When the poem is finished and needs cleaning up for a magazine, the {{markdown-editor|Markdown Editor}} keeps the plain text tidy while you work.`,
    faqs: [
      {
        q: "Are the syllable counts exact?",
        a: "No, they are approximate. The counter is the same one the domain's readability tools use and it does not know a poet's elisions or how a proper noun is pronounced, so the page labels the counts as approximate rather than exact.",
      },
      {
        q: "Does it check metre?",
        a: "No. Metre is the pattern of stressed and unstressed syllables, which is a much larger problem than counting them, and the tool does not attempt it. It reports line counts, approximate syllables and rhyme.",
      },
      {
        q: "How is the rhyme scheme worked out?",
        a: "From the final sound of each line: lines ending in the same final vowel sound are labelled with the same letter, so alternating rhymes come back as ABAB. A near rhyme therefore reads as no rhyme, which the page notes.",
      },
      {
        q: "Which forms are included?",
        a: "Haiku, tanka, limerick, cinquain, Shakespearean and Petrarchan sonnets, villanelle, sestina and free verse, each with its line count, syllable pattern, rhyme scheme and, where relevant, its metre.",
      },
      {
        q: "Does it write or suggest anything?",
        a: "No. It is a reference and a measurer. It does not suggest rhymes, generate lines or score the poem; it tells you where the draft and the form differ and leaves the decision to you.",
      },
    ],
  },

  "character-profile-builder": {
    keywords: ["character profile builder", "character profile", "want", "flaw", "arc"],
    intro:
      "The character profile builder prompts a character's role, want, need, flaw, strength, backstory, voice and arc, scores how much of the sheet is answered and flags the thin spots mechanically.",
    content: `The character profile builder is a sheet of prompts with a score attached. It asks ten questions about a character — role, age, appearance, what they want, what they need, their flaw, their strength, the backstory behind the flaw, how they speak, and how they are different by the last page — and reports how many are answered. The score is not a grade; it is a way to see the gaps. A character profile that has a want and a flaw but no backstory is a different kind of incomplete from one with a rich history and nothing driving them, and the open-fields list makes which one you have obvious.

The checks are the second half. They are mechanical, and they notice four specific thin spots. If the want and the need are worded identically, the tool points out that a character usually pursues one thing and lacks another — the gap between the two is what a story runs on. If there is a strength but no flaw, it notes that a strength without a flaw reads as a wish rather than a person. If no arc is named, it asks how the character is different at the end. And if there is neither a want nor a need, it says the character has nothing driving them through the story.

Those checks are prompts to think, not verdicts, and the page says so. A character can be wonderfully alive with no backstory written down, and a flaw can be implied rather than stated; the tool cannot see either of those. What it can do is make sure a field is empty because you decided it should be rather than because you skipped it, which is the failure mode a profile sheet exists to prevent.

The sheet renders as a markdown document with a heading per field, so it can live beside a scene board or a beat sheet in the same folder, and the report gathers the score, the open fields, the checks and the sheet in one copyable block. Everything runs in the browser: no account, no upload, no storage beyond the tab, and nothing is generated — the prompts ask the questions, and every answer is the writer's.

A profile is most useful when it is read alongside the draft rather than instead of it. The fields answer questions a scene asks implicitly: why this character refuses an offer, what they notice in a room, which decision they cannot make. When a scene stalls, checking the profile against it usually locates the stall at a field that is empty or contradicted — a character acting against a want they were never given, or a flaw that never shows on the page. The sheet does the remembering so the draft can be read against it, and a gap the tool flags is often the exact question the next scene has to answer.

That last point is the reason the tool is a sheet rather than a generator. A character that arrives fully written by a tool is not a character the writer knows; one arrived at by answering ten questions is. The profile builder does the asking and the bookkeeping, and leaves the imagining alone.`,
    howTo: [
      { step: "Give the character a name and a role, then work through the prompts." },
      { step: "Answer what you know and leave the rest; the sheet tracks what is open." },
      { step: "Read the completeness score to see how much of the character is decided." },
      { step: "Read the checks for the thin spots: want against need, strength without flaw, no arc." },
      { step: "Copy or download the character sheet and keep it beside the draft." },
    ],
    whenToUse: `Use the character profile builder when a character needs deciding on the page and you want the questions in front of you. When the character's decisions turn into trouble, the {{conflict-and-resolution-planner|Conflict & Resolution Planner}} shapes that trouble into escalating turns, and when the character carries a plot thread the {{plot-point-mapper|Plot Point Mapper}} shows where it lands.

If you are working out how the character sounds, the {{dialogue-practice-tool|Dialogue Practice Tool}} gives you a prompt to write them into.`,
    faqs: [
      {
        q: "Does it generate a character for me?",
        a: "No. It asks ten prompts and scores your answers. Nothing is invented; every field holds what you wrote, and an empty field is left visibly empty rather than filled with a placeholder.",
      },
      {
        q: "Why is want against need so important?",
        a: "Because the gap between what a character pursues and what they actually lack is what a story runs on. When the two are worded identically the tool points it out, since it usually means only one of them has been thought through.",
      },
      {
        q: "Are the checks rules?",
        a: "No, they are prompts. A flaw can be implied and a backstory can be deliberately withheld. The checks notice empty fields and two fields saying the same thing; they do not judge whether the character works.",
      },
      {
        q: "Where is the profile kept?",
        a: "Only in this tab, and in whatever you copy or download. There is no account and no upload, so a character sheet stays private until you choose to share it.",
      },
    ],
  },

  "conflict-and-resolution-planner": {
    keywords: ["conflict planner", "conflicts", "escalation", "resolution", "stakes"],
    intro:
      "The conflict planner shapes one story conflict as a structure — who opposes whom, over what, at what cost — checks that the escalation turns actually change the situation, and asks what the resolution costs.",
    content: `The conflict and resolution planner treats a conflict as a structure to be built, not a feeling to be described. You name the conflict, its type, the parties involved, the stakes, the resolution and what the resolution costs, and then list the escalation turns — the things that happen in order, each raising the pressure toward the end. The result is a small document that makes a conflict checkable: it either has a shape that rises, or it does not, and that is visible on one page.

The escalation turns are the heart of it. A conflict that stays at one level of pressure for a whole story is not really escalating, and a reader feels the flatness even when they cannot name it. The tool asks for at least three turns and checks each one: a turn too short to describe a change is flagged, and two turns that say the same thing are flagged, because each turn should change the situation rather than repeat it. Counting turns and reading them in order is a fast way to see whether a middle section is doing its job or marking time.

The stakes and the cost are the other half. Naming what is at stake forces the conflict into concrete terms — not "their relationship" but "the ledger that clears her father" — and naming what the resolution costs is what separates a resolution from a collapse. A conflict that ends with everything simply working out has usually lost its tension before the end, and the tool says so in exactly those words rather than leaving you to discover it in a reader's notes.

The types listed are the conventional labels — person against person, self, society, nature, fate or technology — and they are a starting point rather than a taxonomy, since a story often carries several at once. The planner does not decide which type your conflict is, does not generate the turns and does not write the scene; it provides the slots, checks the shape and exports the plan as a markdown document to keep beside the draft.

Keeping the plan in one place also makes it easy to check a drafted scene against it. A conflict planner is only useful if it is consulted, so the plan exports as plain markdown and reads top to bottom: the parties, the stakes, the turns in order, the resolution and its cost. Reading a scene with those fields beside it makes a missing turn, or a resolution that arrived from nowhere, visible — which is the difference between a plan that guides a revision and one that sits unread in a folder. None of it is generated, and the planner never edits a scene.

Conflicts are the engine of a story, and the most common reason a promising one stalls is that the middle stopped escalating or the ending stopped costing anything. Making both explicit on one page is the cheapest way to catch that before a reader does, and it is all this tool claims to do.`,
    howTo: [
      { step: "Name the conflict and choose a type; then say who opposes whom." },
      { step: "Write what is at stake and what the resolution costs, in concrete terms." },
      { step: "List the escalation turns, one per line, in order — at least three." },
      { step: "Read the shape notes for turns that repeat, turns too short to change anything, or a resolution with no cost." },
      { step: "Copy or download the plan and keep it beside the draft." },
    ],
    whenToUse: `Use the conflict planner when a story's central trouble needs shaping into turns that rise, or when a middle section has gone flat. When the conflict is between characters who need deciding first, the {{character-profile-builder|Character Profile Builder}} works out what each of them wants, and when the conflict has to land at a particular point in the story the {{plot-point-mapper|Plot Point Mapper}} shows where it falls.

If the conflict is really a beat in a larger structure, the {{story-beat-builder|Story Beat Builder}} tracks progress through the sheet around it.`,
    faqs: [
      {
        q: "Why at least three escalation turns?",
        a: "Because a conflict that never rises reads as flat. Three turns is the minimum the tool asks for to show a rise, and each one should change the situation rather than restate it — the checks flag turns that repeat or are too short to describe a change.",
      },
      {
        q: "What does it mean that a resolution needs a cost?",
        a: "That a conflict whose resolution takes nothing from anyone usually reads as a collapse rather than a win. The tool asks you to name what the resolution costs, and flags a resolution where nothing is given up.",
      },
      {
        q: "Are the conflict types exhaustive?",
        a: "No. Person against person, self, society, nature, fate and technology are the conventional labels, and a story often carries several at once. They are a starting point for naming the conflict, not a complete system.",
      },
      {
        q: "Does it write the scenes?",
        a: "No. It provides the slots, checks the shape of the escalation and the cost of the resolution, and exports the plan as markdown. The turns and the resolution are yours to write.",
      },
    ],
  },
};
