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
    keywords: [
      "dialogue practice tool",
      "speeches",
      "attribution verbs",
      "said-bookisms",
    ],
    intro:
      "The Dialogue Practice Tool analyses an exchange for who talks how long, how speeches are attributed and where the adverb tags pile up.",
    content:
      "Dialogue is revised by hand more than any other prose, and this dialogue practice tool reports the things a writer would otherwise count manually. Paste an exchange — as a script with names and quoted lines, or as prose with quoted speech — and the analysis attributes speeches to speakers where it can, then reports speeches, average speech length, questions, exclamations, adverb tags, plain tags and narration lines. The who-speaks panel shows the share each speaker holds, which is usually the first surprise.\n\nThe attribution verbs panel lists the verbs used to carry the speech, separating the plain ones — said, asked, replied, answered — from the rest. Verbs other than the plain ones are said-bookisms, and the analysis names them rather than banning them, because a muttered line in the right place is doing work. The input note shows the accepted script form so a pasted exchange parses cleanly, and Copy report or Download takes the whole analysis out.\n\n- Script or prose input: names with quoted speech, or quoted speech with attribution.\n- Speech statistics: count, average length, questions and exclamations.\n- Tag statistics: plain tags versus adverb tags, and narration lines.\n- Who speaks: each speaker's share of the exchange.\n- Attribution verbs: the verbs found, with the plain set separated out.\n- Copy report and Download for the analysis as plain text.\n\nParsing walks the text for quoted spans and speaker patterns: a name before a known attribution verb starts a speaker, and prose without names falls back to quoting order. Tag detection uses a published verb list with a plain subset, and adverb tags are recognised by the ly-suffixed word after the verb. The counts are exact over what the parser matched, which is why the panel states the accepted input format rather than implying a reading of your prose that it cannot perform.\n\n- Attribution is pattern-based: a speaker line without a recognised pattern may be counted as narration.\n- Unusual verbs and dialect tags are invisible to a fixed verb list.\n- Average speech length mixes comic beats and speeches; the distribution is yours to read.\n- The tool reports said-bookisms as facts, not faults — sometimes a whispered line is correct.\n- Foreign-language dialogue runs through the same English patterns.\n\nThe reading order that works: who speaks first, because an imbalance changes the scene's power; then average speech, because long speeches in an argument read as monologues; then the tag panel, because a page where every line is adverb-tagged is telling you the dialogue is not carrying the emotion. Fix the imbalance, the monologue-length speech or the pile of adverb tags — one at a time — and re-paste — the report recomputes from scratch each time, so the counts after an edit are directly comparable with the counts before it rather than being an impression of improvement.\n\nThe neighbours cover the scene around the exchange: the scene description builder checks the setting prose for filter words, the character profile builder fixes the voices those speakers are supposed to have, and the word count tool gives the paragraph totals the exchange sits inside. A second pass over the same passage is usually where the report earns its keep: fix the balance, cut one adverb tag, paste again, and compare the counts rather than your memory of them.",
    howTo: [
      { step: "Paste the exchange as script lines or prose with quoted speech." },
      { step: "Read the statistics panel for speeches, average speech, questions, exclamations and tag counts." },
      { step: "Check who speaks for the balance, then the attribution verbs for the plain and not-so-plain set." },
      { step: "Copy report or Download, revise one thing, and paste again to see the counts move." },
    ],
    whenToUse:
      "Use the dialogue practice tool when an exchange reads flat and the numbers behind it are unknown. The {{scene-description-builder|Scene Description Builder}} checks the description around the dialogue for filter words, the {{character-profile-builder|Character Profile Builder}} fixes the voices these speakers are supposed to have, and the {{story-idea-generator|Story Idea Generator}} assembles the premise the conversation is carrying. Who they are arguing for belongs to the {{villain-motivation-builder|Villain Motivation Builder}} when one of them opposes the plot.",
    faqs: [
      {
        q: "What input formats does it accept?",
        a: "Either a script — name, colon, quoted speech — or prose with quoted lines and attribution verbs. The accepted script form is shown on the page so a pasted exchange parses cleanly.",
      },
      {
        q: "What is a said-bookism?",
        a: "An attribution verb other than the plain set — said, asked, replied, answered. The tool names them rather than banning them, because a muttered line in the right place is doing real work.",
      },
      {
        q: "Why is a speaker missing from who speaks?",
        a: "Attribution is pattern-based: a line is assigned when a name sits next to a recognised verb or the script format is followed. Unrecognised speakers fall back to narration counts.",
      },
      {
        q: "What is a healthy average speech length?",
        a: "There is no target. The figure exists for comparison across the exchange: an argument whose speeches run long reads as a pair of monologues, and the average is where that shows first.",
      },
      {
        q: "Does it judge my dialogue?",
        a: "No. It counts speeches, tags and shares from patterns it states. Whether the adverb tags are wrong or the balance is deliberate is the editorial judgement the page leaves to you.",
      },
    ],
  },

  "scene-description-builder": {
    keywords: [
      "scene description builder",
      "filter words",
      "note sheet",
      "sensory prompts",
    ],
    intro:
      "The Scene Description Builder turns sensory prompts into a consistent note sheet and checks a passage for the filter words that push the reader away.",
    content:
      "Description goes wrong when the paragraph is written before the room exists, and this scene description builder inverts the order. Sensory prompts ask what is here — the details worth noticing before prose starts — and the tool assembles the answers into a note sheet, reporting how many fields are filled. The builder does not write prose; it lists what you noticed, field by field, so the details are decided before the paragraph is. A note sheet with five fields filled gives a paragraph five things to do, which is the difference between describing a place and naming it.\n\nThe filter-word check is the second half: paste the passage you wrote from the notes and the tool checks the passage for filter words — the perception verbs that narrate seeing instead of showing — saw, heard, felt, noticed. Those verbs put the reader a step away from the scene, and they are one of the most common revision notes description attracts. The report combines the sheet and the check, so one copy gives both the plan and the first edit.\n\n- Sensory prompts: the fields that ask what is here before the prose does.\n- Note sheet: the answers assembled in order, with fields filled counted.\n- Filter-word check: a mechanical list of perception verbs in a pasted passage.\n- Hit list: the verbs found, in document order, with their context.\n- Copy notes for the sheet, and Download for the whole report.\n- Scope panel: the statement that the builder lists rather than writes.\n\nThe prompts are fixed text and the sheet is assembled from whichever fields are filled; the filter check is a literal list of perception verbs matched case-insensitively over the passage. Both are published mechanisms with no model behind them, which is why the page can promise that the check finds exactly the listed verbs and nothing else. The counts come from the shared tokenizer, so the words figure agrees with the rest of the domain.\n\n- The filter list is finite: a perception verb outside it passes unflagged.\n- Some perception verbs earn their place — a story about watching is allowed to watch.\n- The prompts assume a place with texture; an interior scene may fill fewer fields honestly.\n- The note sheet is a list, not a paragraph: the prose is still yours to write.\n- Nothing is stored, so copy the notes before leaving the page.\n\nThe workflow is prompts first, prose second, check third: fill the sheet, write the paragraph from it, then paste the paragraph into the filter check and see how many of your sentences begin by reporting perception. Replacing saw with the thing seen is the whole lesson the check exists to teach. The sheet beside it is the preventive half of the same lesson: details chosen first leave fewer perception verbs to report later, and re-running it after the edit confirms the count dropped.\n\nThe neighbouring tools cover the scene's other halves: the dialogue practice tool analyses the exchange happening inside it, the world building template holds the larger setting the scene belongs to, and the character profile builder fixes the people walking through it.\n",
    howTo: [
      { step: "Answer the sensory prompts — what is here — before writing any prose." },
      { step: "Read the note sheet and the fields-filled count to see where the scene is thin." },
      { step: "Write the passage from the notes, then paste it into the filter-word check." },
      { step: "Replace the flagged perception verbs where the scene can show instead, and copy the notes for reference." },
    ],
    whenToUse:
      "Use the scene description builder when a place needs to exist before the paragraph does. The {{dialogue-practice-tool|Dialogue Practice Tool}} analyses the exchange happening inside the scene, and the {{world-building-template|World Building Template}} holds the larger setting this scene belongs to. The people walking through it are the {{character-profile-builder|Character Profile Builder}}'s subject, and the conflict they are caught in belongs to the {{conflict-and-resolution-planner|Conflict and Resolution Planner}}.",
    faqs: [
      {
        q: "What does the builder actually produce?",
        a: "A note sheet: the answers to the sensory prompts, assembled in order with a fields-filled count. It lists what you noticed rather than writing prose, which is what keeps the details yours.",
      },
      {
        q: "What are filter words?",
        a: "Verbs that narrate perception instead of the thing perceived — saw, heard, felt, noticed. They place the reader a step away from the scene, and the check counts them in a pasted passage.",
      },
      {
        q: "Are all perception verbs wrong?",
        a: "No. The check is a revision prompt, not a rule; a story about watching is allowed to watch. The list is finite, and the page says so rather than implying full coverage.",
      },
      {
        q: "Can it write the description for me?",
        a: "No. The engine assembles your answers into a sheet and counts listed verbs in your passage. The prose between those two steps is deliberately left to you.",
      },
      {
        q: "Are the notes saved?",
        a: "No, the sheet lives in the page. Copy notes or Download the report before leaving, since nothing is stored after the session.",
      },
    ],
  },

  "poetry-form-guide": {
    keywords: [
      "poetry form guide",
      "rhyme scheme",
      "syllables",
      "free verse",
    ],
    intro:
      "The Poetry Form Guide references the common fixed forms and measures a draft's lines, approximate syllables and rhyme against the form it claims.",
    content:
      "A fixed form is a set of numbers, and this poetry form guide carries them: line counts, syllable patterns and rhyme schemes for the common forms — haiku, tanka, limerick, cinquain, both sonnets, the villanelle, the sestina and free verse — plus a checker that measures your draft against the form it claims. The form's rules panel shows the reference: lines, syllable pattern, rhyme scheme and a note on what the form is for, all copyable as a reference entry.\n\nPaste the draft one line per line and the measured panel reports lines, syllables and rhyme reads: the line count against the form's, the syllable pattern line by line, and the rhyme scheme derived from the final sounds of each line as letter labels. Where the draft parts company with the form is reported directly rather than scored. Free verse appears in the guide with no fixed line count or rhyme, because a reference that pretends free verse has rules is not a reference.\n\n- Nine forms: haiku, tanka, limerick, cinquain, Shakespearean and Petrarchan sonnets, villanelle, sestina and free verse.\n- Form rules: line count, syllable pattern, rhyme scheme and a description.\n- Line check: your line count against the form's.\n- Syllable check: approximate syllables per line against the pattern.\n- Rhyme reads: a scheme derived from line-ending sounds as letter labels.\n- Copy reference and Download report for the form and the check.\n\nThe checker counts lines from the shared tokenizer's sentence segments laid out per line, counts approximate syllables through the shared syllable counter, and derives a rhyme key from each line's final vowel sound and everything after it, labelling matches with letters. Approximate syllables are labelled as such on the page: a stress-aware metre check is a different and much larger problem, and this tool does not claim it. The form data itself is the conventional description of each form, held as reference values.\n\n- Syllable counts are approximate by the shared heuristic, so near-misses on a pattern are expected.\n- Rhyme is read from final sounds, so slant rhyme and eye rhyme are reported as misses.\n- Metre and stress are not checked; the form reference names them, the checker does not verify them.\n- The end-word rotation of a sestina is reference text, not something the checker can verify.\n- A free-verse draft passes by definition, which is what free verse means.\n\nThe workflow is to pick the form first and read its rules panel before drafting, because the useful moment for a form guide is line one rather than line fourteen. Once a draft exists, paste it and read the rhyme reads before the syllables, because the scheme is the part of a fixed form a reader hears first: a scheme that is wrong at the pattern level will not be rescued by syllable counts, while syllable drift on a rhyme that works is a line edit.\n\nThe neighbours cover the surrounding craft: the flash fiction timer gives prose a clock, the word count tool reports the plain totals, and the sentence count tool applies the same counting to prose rhythm rather than poetic lines.",
    howTo: [
      { step: "Choose a fixed form and read its rules: lines, syllable pattern, rhyme scheme and note." },
      { step: "Paste your draft one line per line." },
      { step: "Read the measured panel for line count, syllables per line and the derived rhyme reads." },
      { step: "Copy the reference or download the report for the form and the check, then keep both beside the draft, then fix whichever of lines, syllables or rhyme is furthest from the form." },
    ],
    whenToUse:
      "Use the poetry form guide when a poem claims a form and the numbers have to agree. The {{flash-fiction-timer|Flash Fiction Timer}} puts a clock on prose instead, the {{word-count-tool|Word Count Tool}} reports plain totals for any text, and the {{sentence-count-tool|Sentence Count Tool}} applies the same counting to prose rhythm. For prompts when the page is blank, the {{writing-prompt-generator|Writing Prompt Generator}} cycles an authored bank across five categories.",
    faqs: [
      {
        q: "How does it check rhyme?",
        a: "Each line's ending sound becomes a key — the final vowel and everything after it — and matching keys get the same letter, producing a scheme like A, A, B, B. Slant rhyme and eye rhyme read as misses by design.",
      },
      {
        q: "Are the syllable counts exact?",
        a: "No, they are approximations from the shared syllable heuristic and are labelled as such. A stress-aware metre check is a much larger problem, and the tool does not claim to perform one.",
      },
      {
        q: "Which forms are included?",
        a: "Haiku, tanka, limerick, cinquain, the Shakespearean and Petrarchan sonnets, the villanelle, the sestina and free verse — each with line count, syllable pattern, rhyme scheme and a note on what it is for.",
      },
      {
        q: "Why is free verse in a form guide?",
        a: "Because it is a form with no fixed line count or rhyme, and a reference that pretended otherwise would be wrong. The checker reports its lines and syllables without measuring them against a pattern.",
      },
      {
        q: "Does it check metre?",
        a: "No. The form reference names the conventional metre, but the checker measures lines, approximate syllables and rhyme only. Stress patterns are outside what it claims to do.",
      },
    ],
  },

  "character-profile-builder": {
    keywords: [
      "character profile builder",
      "completeness",
      "flaw",
      "character sheet",
    ],
    intro:
      "The Character Profile Builder prompts a character's want, need, flaw and arc, scores completeness and flags the common thin spots.",
    content:
      "A character profile is a set of answers that have to agree, and this character profile builder prompts them field by field. Ten prompts cover the parts a draft leans on — role, age, a telling appearance detail, want, need, flaw, strength, the backstory event behind the flaw, voice and arc — and the completeness panel scores how many are answered and which are still open. The point is gaps: an empty field is a question the story will have to answer anyway.\n\nThe prompts to think about panel carries the mechanical checks, and they are prompts rather than verdicts: a want that is really the need, a strength with no matching flaw, a character with no arc. The tool never says a character is wrong, only that a field is empty or that two fields say the same thing. Copy sheet exports the profile as a markdown character sheet, which is the format the rest of this domain's reports also use, so a character sheet can sit beside a beat plan and a conflict plan without conversion, and Download takes the same text as a file.\n\n- Ten prompts: role, age, appearance, want, need, flaw, strength, backstory, voice and arc.\n- Completeness: prompts answered, with the open ones named.\n- Shape checks: want versus need, strength versus flaw, presence or absence of an arc.\n- Markdown export: the profile as a character sheet, copyable and downloadable.\n- Word count from the shared tokenizer, so the sheet's size is exact.\n\nEach prompt is fixed text that names what a useful answer looks like — one telling detail, not a full inventory; one verbal tic is enough — and the answers are stored as plain fields. Completeness is arithmetic over the fields, and the checks are comparisons between them: the want and need compared for sameness, the strength and flaw for balance, the arc for being non-empty. Nothing is generated and nothing is scored on quality; the engine asks the questions a memorable character answers.\n\n- The checks read structure, not prose: a thin answer passes every one of them.\n- Field matching is literal, so want and need phrased identically flag, but near-synonyms pass.\n- No archive: the profile lives in the page until you copy the sheet.\n- The prompts assume a tradition of character work; a genre with different conventions still has to fit these ten.\n- Completeness of ten out of ten says the fields are filled, not that the character works.\n\nThe habit that makes the tool earn its place is answering the flaw and the backstory together: one names a habit, the other names the event that installed it, and a profile where those two connect reads as a person rather than a list. Read the checks after that pair, because they are where the contradictions surface — want equal to need, or a strength the story never has to use.\n\nThe neighbouring builders cover the other characters and the shape around them: the villain motivation builder asks the antagonist-specific questions, the story idea generator assembles the premise the character wants inside, and the conflict planner names who opposes whom over what. A profile that passes them is not finished, but it is coherent, and coherence is what the next builder needs.",
    howTo: [
      { step: "Fill the prompts — name, role, age, appearance, want, need, flaw, strength, backstory, voice and arc." },
      { step: "Read the completeness panel for prompts answered and the ones still open." },
      { step: "Work through the prompts to think about, checking want against need and strength against flaw." },
      { step: "Copy sheet or Download to export the profile as a markdown character sheet." },
    ],
    whenToUse:
      "Use the character profile builder when a character exists in notes and needs a shape. The {{villain-motivation-builder|Villain Motivation Builder}} asks the antagonist-specific questions — wound, method, the line they will not cross — and the {{story-idea-generator|Story Idea Generator}} assembles the premise this character wants inside. Who opposes them belongs to the {{conflict-and-resolution-planner|Conflict and Resolution Planner}}, and the world they stand in is the world building template's territory.",
    faqs: [
      {
        q: "Which prompts does it ask?",
        a: "Ten: role, age, appearance, want, need, flaw, strength, backstory, voice and arc. Each prompt names what a useful answer looks like, so the field itself teaches what to put in it.",
      },
      {
        q: "What do the checks actually flag?",
        a: "Empty fields and contradictions: a want that says the same thing as the need, a strength with no matching flaw, an arc left blank. They are prompts to think, never verdicts on quality.",
      },
      {
        q: "How is completeness calculated?",
        a: "How many prompts are answered out of ten, with the open ones named. It measures coverage of the profile, not the quality of the answers inside it.",
      },
      {
        q: "Can I export the profile?",
        a: "Yes. Copy sheet produces the profile as a markdown character sheet and Download saves the same text as a file, so the character can live beside the draft.",
      },
      {
        q: "Does it judge my character?",
        a: "No. The engine asks the questions a memorable character answers and reports which are empty or duplicated. Whether the answers make a person is the part it leaves to you.",
      },
    ],
  },

  "conflict-and-resolution-planner": {
    keywords: [
      "conflict and resolution planner",
      "escalating turns",
      "resolution",
      "person vs person",
    ],
    intro:
      "The Conflict and Resolution Planner shapes one conflict — who opposes whom, over what, at what cost — and tracks the escalating turns toward the resolution.",
    content:
      "A conflict is a shape before it is a plot, and this conflict and resolution planner makes the shape explicit. Name the conflict, choose its type from person vs person through person vs technology, state who opposes whom and what is at stake, then write the resolution and what it costs. The turns field holds the escalations in order, and the shape panel reports parts decided, turns recorded and open parts — the three numbers that say whether the conflict can carry a story yet.\n\nThe shape notes carry the engine's checks as prompts rather than verdicts: a conflict needs at least three escalating turns, every turn has to change the situation rather than repeat it, and a resolution without a cost is usually a collapse rather than an ending. Copy plan or Download produces the plan as markdown, which is how the shape becomes a document the outline can be written against. A plan that has a name, a type, a cost and three turns is also the document you hand a collaborator, because every field states the same thing in the same words.\n\n- Working name: the conflict called something the draft can refer to.\n- Type: person vs person, self, society, nature, fate or technology.\n- The facts: who opposes whom, what is at stake, the resolution and what it costs.\n- Escalating turns: the ordered list of changes that raise the conflict, minimum three.\n- Shape panel: parts decided, turns and open parts.\n- Shape notes: the mechanical checks, phrased as prompts.\n\nThe engine checks the shape rather than judging the idea: completeness is arithmetic over the fields and the turn list, and the escalation checks are comparisons — turn count against the minimum of three, presence of a cost beside the resolution, turns against each other for actually changing the situation. Every rule is stated in those terms on the page, so a flagged plan can be read against the rule that flagged it. Nothing is generated; the questions and the checks are the product.\n\n- A plan with three turns and a cost is complete by the tool's rules, not guaranteed to work.\n- Escalation quality — whether a turn raises rather than rearranges — stays a judgement the tool cannot make.\n- The type list is a classic taxonomy; a story can straddle two types without either being wrong.\n- No storage: the plan lives in the page until you copy it.\n- Word counts are exact but only describe the plan, never the draft it will become.\n\nThe pass that matters is the cost field: write the resolution first, then name what it costs, because a resolution with no price is the most common structural hole and the check will name it either way. Then read the turns in order and ask whether each one changes who is winning — if two turns could swap places without anyone noticing, the escalation is decoration rather than movement.\n\nThe neighbouring tools cover the structure around the conflict: the plot structure planner anchors the premise onto a structure's beats, the villain motivation builder profiles whoever embodies the opposition, and the ending generator drafts the six verdicts an ending can deliver once the cost is fixed.\n",
    howTo: [
      { step: "Name the conflict and choose its type from the six classic categories." },
      { step: "Fill the facts: who opposes whom, what is at stake, the resolution and what it costs." },
      { step: "Write the escalating turns in order — at least three, each changing the situation." },
      { step: "Read the shape panel and notes, then copy or download the plan as markdown." },
    ],
    whenToUse:
      "Use the conflict and resolution planner when a story needs its central opposition shaped before drafting. The {{plot-structure-planner|Plot Structure Planner}} anchors the premise onto a structure's beats, the {{villain-motivation-builder|Villain Motivation Builder}} profiles whoever embodies the opposition, and the {{ending-generator|Ending Generator}} drafts verdicts against the want and obstacle once the cost is fixed. Assembling the premise itself belongs to the {{story-idea-generator|Story Idea Generator}}.",
    faqs: [
      {
        q: "How many escalating turns does it require?",
        a: "Three, as a stated minimum. The engine counts the turns you enter and flags the plan when the count is short, because two turns cannot escalate — they alternate.",
      },
      {
        q: "Why does it care that the resolution has a cost?",
        a: "A resolution without a cost is usually a collapse rather than an ending. The check reports a missing cost as a prompt, in exactly those terms, rather than judging the idea itself.",
      },
      {
        q: "Which conflict types are offered?",
        a: "Six classic categories: person vs person, self, society, nature, fate and technology. A story can straddle two of them without either being wrong — the type is a label, not a cage.",
      },
      {
        q: "Does it judge whether a turn really escalates?",
        a: "No. It checks that turns exist, are at least three and are entered in order; whether each turn raises rather than rearranges is the judgement the shape notes ask you to make.",
      },
      {
        q: "Can I export the plan?",
        a: "Yes, Copy plan produces it as markdown and Download saves the same text. Nothing is stored in the page, so export before leaving.",
      },
    ],
  },
};
