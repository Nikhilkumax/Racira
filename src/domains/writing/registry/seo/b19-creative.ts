import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B19, creative writing: authored SEO entries for the story idea
 * generator, the world building template, the writing prompt generator, the
 * villain motivation builder and the first line generator.
 *
 * Every entry draws the same line: these tools combine the writer's own parts
 * into a structure and check the gaps, and none of them invents a story. Keys
 * are registry slugs; see ../tool-seo.ts for the contract.
 */
export const B19_CREATIVE_SEO: Record<string, ToolSeo> = {
  "story-idea-generator": {
    keywords: ["story idea generator", "premise", "protagonist", "want", "obstacle"],
    intro:
      "The story idea generator assembles a premise from a protagonist, a want, an obstacle and a setting, then spins the same parts into what-if variants that test whether the idea has somewhere to go.",
    content: `The story idea generator assembles a premise from four parts: a protagonist, what they want, the obstacle in the way, and a setting with a genre. The assembled sentence follows the oldest shape a story takes — someone wants something, something stands in the way — because that shape is the one a reader can enter in a single line. Working from parts rather than from a page of notes also makes the missing piece obvious: a want with no obstacle is a wish, and an obstacle with no want is scenery.

The what-if variants are the second half and the more useful one. Four fixed questions are asked of the parts you supplied: what if the want arrives in the first act and the story is its cost; what if the obstacle is right; what if the protagonist is the obstacle; what if the setting itself is the antagonist. Each question is a way of testing whether the premise has a second act inside it, and the one that troubles you is usually the one that becomes the draft.

The generator's completeness counter is deliberately plain: four core parts — genre, protagonist, want, obstacle — with a setting as the fifth. It does not grade the idea, because no tool can. What it can do is name the parts that are missing and flag a want or an obstacle that has grown past a clause. A premise that needs a paragraph to state is usually two premises, and the checks say so gently.

Because the premise is a pure function of the fields, trying a different want or a different obstacle is a single edit, and the variants update with it. That makes the tool a good place to spend twenty minutes before a draft: cycle the same protagonist through three wants and see which one the obstacle actually resists. The friction between want and obstacle is the story, and the tool makes the friction visible.

Nothing is uploaded and nothing is stored beyond the tab, so an unpublished idea stays private. The generator invents no premise, no character and no world; every word of the idea is yours, and the tool's whole contribution is the shape and the four questions that test it.

One more use for the generator: reverse it. Take a draft you already have and write down its protagonist, want, obstacle and setting as four lines; if the four lines do not tell you what the book is about, the draft may not know either. The same exercise works for a stalled project where the want has quietly changed halfway through — the premise sentence shows the shift, and the variants help decide which version the ending belongs to. A premise is a working tool rather than a label, and revisiting it at the midpoint of a draft is one of the most reliable ways to find out why a scene feels wrong.\n\nOne more habit helps: keep the premise sentence after the draft starts. When a scene begins to drift, checking it against the want and the obstacle in one line usually shows which one the scene has forgotten — a useful compass for a first draft, and a useful test for a revision.`,
    howTo: [
      { step: "Name the protagonist and the genre." },
      { step: "State the want in a clause — what the character reaches for." },
      { step: "State the obstacle — what stands in the way." },
      { step: "Add the setting and read the assembled premise." },
      { step: "Work through the what-if variants and keep the question that troubles you." },
    ],
    whenToUse: `Use the story idea generator at the very start of a project, when the idea is a feeling rather than a shape. When the protagonist needs to become a person rather than a want, the {{character-profile-builder|Character Profile Builder}} asks the questions that fill them in.\n\nOnce the premise holds, the {{plot-point-mapper|Plot Point Mapper}} fits its events onto a structure, and when it is time to actually start writing, the {{first-line-generator|First Line Generator}} composes the opening the premise deserves.`,
    faqs: [
      {
        q: "What are the parts of a story premise?",
        a: "A protagonist, a want, an obstacle, and a setting with a genre. The generator assembles those into one sentence and flags any of the four core parts that is missing.",
      },
      {
        q: "What are the what-if variants for?",
        a: "They test whether the premise has somewhere to go. Four fixed questions — including what if the obstacle is right, and what if the protagonist is the obstacle — turn the same parts in different directions to find the second act.",
      },
      {
        q: "Does the generator write the idea for me?",
        a: "No. It combines the parts you supply and asks questions about them. The protagonist, the want, the obstacle and the setting are all yours; the tool contributes the shape and the tests.",
      },
      {
        q: "How long should a want or an obstacle be?",
        a: "A clause, not a paragraph. The checks flag either past fifteen words, because a premise that needs a paragraph to state is usually two premises competing for the same sentence.",
      },
    ],
  },

  "world-building-template": {
    keywords: ["world building template", "world bible", "geography", "culture", "conflicts"],
    intro:
      "The world building template asks the seven questions a story will ask of its setting — geography, culture, politics, economy, rules, history and conflicts — and assembles the answers into a world bible with the gaps named.",
    content: `The world building template is organised around the seven questions a story will eventually ask of its setting. Geography asks what the land does to the people who live on it; culture asks what they believe, celebrate and forbid; politics asks who holds power and what they fear losing; economy asks what is scarce and who profits; the rules entry asks what magic or technology makes possible and at what cost; history asks what happened before the story that everyone still argues about; and conflicts asks which two forces cannot both get what they want.

That last question is the one that turns a setting into a story. A world bible can be rich in detail and still have nothing to write about; the conflicts entry is where the details start to pull against each other, and the checks ask for it explicitly. The other six questions are not busywork either: a culture's festivals are what a scene can show, an economy's scarcity is what a character can want, and a history's argument is what two characters can disagree about without either being wrong.

The template's checks are about completeness and proportion. Fewer than five of the seven areas filled is flagged, because a bible whose geography is detailed and whose politics is blank will surprise the writer in act two when the plot needs a ruler. A filled area past a hundred and twenty words is flagged as a chapter; a bible entry is a reference, and references are useful in proportion to how quickly they can be skimmed.

The bible is assembled from the fields in a fixed order, so the same answers always produce the same document, and adding a detail is one edit. The copy and download buttons export the whole thing as plain text that can live beside the manuscript, and the word count keeps the bible honest about its own growth.

Nothing is uploaded and nothing is stored beyond the tab. The template invents no world and judges no detail; it asks the questions and formats the answers, and the imagination is entirely the writer's.

Keep the bible in a format you will actually reopen. Plain text is the shape most writing tools import cleanly, and the copy and download buttons produce exactly that, so the document can sit beside the manuscript in the same project folder and be searched with the same keystrokes. Update it at the end of a writing session rather than the start: the details a scene forced you to invent are the ones worth recording, and a bible updated from the draft stays smaller and more useful than one built in advance. When a detail conflicts with an earlier entry, prefer the draft and change the bible; the story is the authority, and the bible exists to keep the story consistent.\n\nA practical note on timing: fill the geography and the conflicts before writing chapter one, and leave the rest provisional. Worlds are discovered through scenes, and a bible completed before the first draft tends to lock in details the story will later need to change. Keep the contradictions that survive to the second draft; they are usually the world's most interesting features.`,
    howTo: [
      { step: "Name the world and write a one-line premise." },
      { step: "Answer geography and conflicts first — where and against what." },
      { step: "Fill culture, politics, economy, rules and history as the story needs them." },
      { step: "Read the assembled bible and the areas-filled counter." },
      { step: "Clear the checks, then copy or download the bible." },
    ],
    whenToUse: `Use the world building template when a story needs its setting worked out enough that scenes can happen without contradictions. When the world exists mainly to put pressure on one person, the {{conflict-and-resolution-planner|Conflict & Resolution Planner}} shapes that pressure into escalating turns.\n\nA world usually starts from a premise, so the {{story-idea-generator|Story Idea Generator}} is the natural first step, and once the setting is real the {{scene-and-chapter-organizer|Scene & Chapter Organizer}} keeps the scenes that use it in order.`,
    faqs: [
      {
        q: "What questions should a world bible answer?",
        a: "Seven: geography, culture, politics, economy, rules of magic or technology, history and conflicts. The template asks each as a question about what it does to the people, and flags any area left blank.",
      },
      {
        q: "Why is the conflicts entry the important one?",
        a: "Because a setting is interesting for what it denies people. Two forces that cannot both win give the plot something to happen, which is why the template asks for it explicitly even when the other areas are detailed.",
      },
      {
        q: "How long should each world bible entry be?",
        a: "A paragraph. Past about a hundred and twenty words the checks flag it as a chapter, since a bible is a reference to skim, not a document to read end to end.",
      },
      {
        q: "Should I finish the bible before writing?",
        a: "No. Fill geography and conflicts before chapter one and leave the rest provisional; worlds are discovered through scenes, and a bible finished too early locks in details the draft will need to change.",
      },
    ],
  },

  "writing-prompt-generator": {
    keywords: ["writing prompt generator", "prompts", "bank", "categories", "practice"],
    intro:
      "The writing prompt generator serves a fixed, authored bank of prompts — six each for character, setting, conflict, dialogue and opening — three at a time in a stable order, with no randomness.",
    content: `The writing prompt generator serves prompts from a fixed bank: six for character, six for setting, six for conflict, six for dialogue and six for opening. Three are shown at a time, and the next-three button advances through the bank in a fixed order, wrapping at the end. Nothing is generated and nothing is random, which is the point — a prompt that caught your attention will still be there when you come back to it, and every writer working through a category sees the same list, which makes the bank usable in a group or a class.

The categories map to the parts of craft a practice session might want to exercise. Character prompts ask for someone whose behaviour reveals a contradiction; setting prompts ask for a place that does something to its inhabitants; conflict prompts pose two wants that cannot both be satisfied; dialogue prompts set up conversations in which the real subject is not the one being discussed; opening prompts ask for a first sentence that earns a second. Any one of them can be written in ten minutes, which is the point of a prompt.

The three-at-a-time page size is deliberate. A wall of sixty prompts is a menu; three are an assignment. The category selector resets the cycle to the start, so a session can move from character work to dialogue cleanly, and the counter shows how many prompts the current bank holds.

Because the order is fixed, the generator doubles as a syllabus: working through a category end to end takes two sittings of three prompts, and the second pass is easier than the first, which is the only measure of practice that matters. The prompts are deliberately plain rather than clever — a prompt that needs to be admired is a prompt that will not be written from.

Nothing is uploaded and nothing is stored beyond the tab; there is no account and no history, so the bank is the same clean list every time it is opened. The page states plainly that the bank is finite and authored, and that a prompt is a starting point rather than an assignment: if one does not catch, skip it, because the purpose is words on a page and the words can be thrown away.

Two small disciplines make the bank go further. First, write for the full ten minutes even when the first sentence feels bad; the prompt is doing its job if a paragraph exists, and the paragraphs written under a prompt are practice rather than property. Second, keep the pages: a folder of short exercises becomes a source of scenes later, because a character met quickly in an exercise often turns out to be the one the novel needed. The bank is not a slot machine and will not reward pulling the lever repeatedly; its value comes from finishing what it starts, which is the habit prompts are best at teaching.\n\nFor a longer session, pair the prompt with the {{flash-fiction-timer|Flash Fiction Timer}} and write before the buzzer; for a bigger project, carry a prompt's premise into the {{story-idea-generator|Story Idea Generator}} and see whether it survives being stated in parts.`,
    howTo: [
      { step: "Pick the category you want to practise." },
      { step: "Read the three prompts on the page." },
      { step: "Choose the one that catches and start writing immediately." },
      { step: "Press next three to advance through the bank, or reset to the start." },
      { step: "Switch categories when a session needs a different kind of practice." },
    ],
    whenToUse: `Use the writing prompt generator when you want to write but have nothing in mind, or when a session needs to exercise one specific muscle. For timed practice, the {{flash-fiction-timer|Flash Fiction Timer}} gives the prompt a deadline and the exercise a finish line.\n\nWhen a prompt turns into something larger, carry it into the {{story-idea-generator|Story Idea Generator}} to test whether the premise holds up as parts: a protagonist, a want, an obstacle and a setting.`,
    faqs: [
      {
        q: "Are the prompts generated or fixed?",
        a: "Fixed and authored: six prompts for each of five categories. The order is stable and the next-three button simply advances through the bank, so nothing is random and nothing disappears.",
      },
      {
        q: "How many prompts are there per category?",
        a: "Six. Three are shown at a time, and two presses of the next-three button walk the whole bank before it wraps around to the start.",
      },
      {
        q: "What can I do with a prompt I like?",
        a: "Write from it immediately, in ten minutes if you can. A prompt that turns into something larger can be carried into the story idea generator to see whether it holds up as a premise.",
      },
      {
        q: "Why only three prompts at a time?",
        a: "Because a wall of options is a menu and three are an assignment. The page size keeps the decision small and the writing time large, which is the purpose of a practice bank.",
      },
    ],
  },

  "villain-motivation-builder": {
    keywords: ["villain motivation builder", "villain", "wound", "justification", "limit"],
    intro:
      "The villain motivation builder assembles the parts that make an antagonist a person — what they want, the wound behind it, how they justify themselves, their method, the line they will not cross and how they see themselves.",
    content: `The villain motivation builder asks seven questions of an antagonist: what they are called, what they want, the wound behind the want, how they justify themselves in their own eyes, the method they use, the line they will not cross, and the story they tell about themselves. Assembled, the answers form a profile that reads like a person rather than a function, and the checks name the parts most drafts skip — which is usually the wound, the limit and the self-image.

The wound matters because villains who are evil for its own sake are weather, not characters. A want that grew from an old injury is a want a reader can understand while still opposing it, and the profile keeps the wound next to the want, where the connection can be seen. The justification is the same idea from the other side: every convincing antagonist is the hero of their own account, and writing that account down forces the writer to make it coherent rather than convenient.

The limit is the check most writers thank the tool for. A villain with no line they will not cross is a plot device — they will do whatever the story needs, which is another way of saying they have no character. One prohibition, even a small one, turns the rest of their actions into choices. The self-story entry follows from the same test: a villain who sees themselves as the only adult in a room of children will behave consistently in scenes the profile never mentions.

The profile is composed deterministically from the fields, so changing the want or tightening the wound updates the whole document in one edit, and the filled counter shows how many of the seven parts are in place. A want past twenty words is flagged and asked to become a sentence, since a want that takes a paragraph to state is usually a backstory wearing a goal.

Nothing is uploaded and nothing is stored beyond the tab, so an unpublished antagonist stays private. The builder invents no villain and settles no moral question; it asks the questions a memorable one answers and assembles your answers into a reference for the draft.

Return to the profile when the plot stops working, not only when the villain is introduced. Most third-act problems are motivation problems wearing plot clothes: the antagonist does something convenient and the story loses its pressure. Reading the want, the wound and the limit again usually shows which one the scene ignored — a villain acting against their wound, or crossing a line they were built never to cross. The profile is short enough to skim between drafts, which is exactly what a working reference should be, and the checks keep the parts that make a villain a person from quietly disappearing in revision.\n\nOne practical note: test the limit in a scene. Put the villain in a situation where crossing their stated line would get them what they want, and see what they do instead. The answer is usually more interesting than the original want, and it is where the character stops being a profile and starts being a person.`,
    howTo: [
      { step: "Name the villain and state what they want." },
      { step: "Write the wound behind the want, then their justification in their own voice." },
      { step: "Describe their method — what they actually do." },
      { step: "Give them a line they will not cross." },
      { step: "Add how they see themselves, read the profile, then clear the checks." },
    ],
    whenToUse: `Use the villain motivation builder when an antagonist exists as an obstacle rather than a person. When the protagonist also needs filling in before they can meet the villain, the {{character-profile-builder|Character Profile Builder}} asks the mirror questions.\n\nOnce both are people, the {{conflict-and-resolution-planner|Conflict & Resolution Planner}} builds the escalating turns where their wants collide, and the villain's limit is what makes those turns surprising rather than mechanical.`,
    faqs: [
      {
        q: "What makes a villain feel like a person?",
        a: "A want with a wound behind it, a justification they believe, a method that reveals character, one line they will not cross and a story they tell about themselves. The builder asks for each of the seven parts and flags the missing ones.",
      },
      {
        q: "Why does the builder insist on a limit?",
        a: "Because a villain with no line they will not cross will do anything the plot needs, which means they have no character. A single prohibition turns the rest of their behaviour into choices, and the story can test it.",
      },
      {
        q: "Should the villain be sympathetic?",
        a: "Understandable is more useful than sympathetic. A reader can oppose a want completely while understanding the wound behind it, and that tension is where a memorable antagonist lives.",
      },
      {
        q: "Does the builder write the villain?",
        a: "No. It asks the seven questions and assembles your answers into a profile with checks. The villain, the wound and the moral reckoning are all yours.",
      },
    ],
  },

  "first-line-generator": {
    keywords: ["first line generator", "opening line", "tone", "character", "place"],
    intro:
      "The first line generator composes four candidate opening lines from a character, a place and a tone, and checks a line you bring for the borrowed moves — weather, once-upon-a-time, there-was and unearned length.",
    content: `The first line generator composes four candidate opening lines from three inputs: a character, a place and a tone. The tone selector chooses a register — quiet, strange, dangerous or warm — and each register has its own four fixed patterns. Quiet openings arrive without explanation; strange ones tilt a familiar detail; dangerous ones begin with a decision already made; warm ones lead with a small human gesture. Seeing four lines of the same scene is the point: the tone is easier to choose from examples than to decide in the abstract.

The patterns combine the fields rather than inventing content, so every candidate uses the character and the place named, and nothing arrives that the writer did not supply. A first line is a promise about the voice, the pace and the kind of attention the story wants, and the four candidates let a writer feel those promises side by side before committing. The copy button takes the line that catches.

The own-line checker is the second half. Paste an opening you wrote and it flags the moves that make first lines sound borrowed: opening on the weather, once upon a time, a there-was construction, and a line past thirty words. Each flag explains why the habit costs the reader rather than merely naming it, and all four are prompts rather than bans — a weather opening can be right, but it should be right on purpose.

The generator's limits are on the page. It knows nothing about the story behind the line and cannot tell whether a candidate keeps its promise; only the next paragraph can. It also stores nothing: the fields live in the tab, so an unpublished opening stays unpublished.

One more exercise the checker makes possible: compare openings across the story. Paste the first line of each scene into the own-line field and look at the flags as a set. A draft whose scenes all open on time passing, or all open with a description of the setting, has a rhythm problem the individual lines hide — the reader feels repetition long before they can name it. Varying the openings is often the cheapest fix in a revision: start one scene on an action, one on dialogue, one on a decision. The generator's four tone sets give examples of each, and the checker's four flags give you the vocabulary to talk about a habit that otherwise stays invisible. The first line is a contract; the revision work is making the rest of the page sign it. Read the four candidates aloud before choosing one; the ear hears the promise of a voice before the eye does.\n\nOne habit worth developing: read each candidate with the second sentence already imagined. An opening line is not a standalone joke; it is the first handshake of a voice that has to hold for a chapter. The line that is easiest to continue is often the one that looks least clever in the list — which is a useful thing to learn from four examples at once, and a good reason to write the next sentence immediately, before the choice hardens.`,
    howTo: [
      { step: "Name the character and the place." },
      { step: "Choose the tone the opening should carry." },
      { step: "Read the four candidates and copy the one that catches." },
      { step: "Paste your own opening into the checker to see which moves it uses." },
      { step: "Write the second sentence immediately, before deciding." },
    ],
    whenToUse: `Use the first line generator when a draft refuses to start and the first sentence keeps being rewritten. It works best once the premise is settled, so the {{story-idea-generator|Story Idea Generator}} usually comes first, and it pairs naturally with the {{scene-description-builder|Scene Description Builder}} when the opening's job is to establish a place.\n\nWhen the line is chosen, the {{dialogue-practice-tool|Dialogue Practice Tool}} is a good next exercise: the first exchange is where a voice proves the promise its opening made.`,
    faqs: [
      {
        q: "How does the tone setting work?",
        a: "Quiet, strange, dangerous and warm are four fixed sets of patterns. The tone changes how the same character and place are introduced, and switching it re-renders four new candidates instantly.",
      },
      {
        q: "Why are weather openings flagged?",
        a: "Because opening on the weather delays the person and the action the reader came for. The check is a prompt rather than a ban — a weather opening can work when it is doing a job the story needs.",
      },
      {
        q: "What other moves does the checker flag?",
        a: "Once upon a time, which signals a fairy-tale register; a there-was construction, which starts a description rather than a scene; and a line past thirty words, which has not earned its length yet.",
      },
      {
        q: "Does the generator write the opening for me?",
        a: "It composes four fixed patterns from your character, place and tone, using only the words you supplied. The choice, the voice and the next sentence are the writer's.",
      },
      {
        q: "Can I check an opening I wrote myself?",
        a: "Yes. The own-line field runs the same checker over any sentence and returns the borrowed moves it finds, with a note on why each one costs the reader.",
      },
    ],
  },
};
