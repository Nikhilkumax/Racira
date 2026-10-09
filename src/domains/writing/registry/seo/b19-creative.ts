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
    keywords: [
      "story idea generator",
      "premise",
      "protagonist",
      "what if",
    ],
    intro:
      "The Story Idea Generator assembles a premise from a protagonist, a want, an obstacle and a setting, then spins the same parts into what-if variants.",
    content:
      "A premise is four facts in one sentence, and this story idea generator is built to test whether yours holds. Supply the genre, the protagonist, what they want, what stands in the way and where it happens; the tool assembles them into a premise in the voice of those parts and then spins the same parts into what-if variants. The engine combines what you supply — it invents no premise of its own, which is why the output always reads like your idea rather than a stranger's.\n\nThe parts panel holds the five inputs, each with an example placeholder so the shape of a good answer is visible before you type. The output reports words, parts filled and variants produced, and the what-if panel lists the variants: what if the want is achieved early and the story becomes its cost, what if the obstacle is right, and the rest built from whichever parts you filled. A checks panel names what is missing rather than filling it in.\n\n- Genre: the container the premise sits in, offered as a free field with an example.\n- Protagonist: who the sentence is about, in a phrase rather than a biography.\n- Want: what they pursue, phrased so the premise can continue it — wants to buy back her father's shop.\n- Obstacle: what pushes back, phrased to attach with a but — but the buyer is her brother.\n- Setting: where it happens, one image rather than a map.\n- What-if variants: the parts rearranged into questions that test the premise.\n\nThe assembly is string work, not generation: the parts are joined in fixed patterns, each variant is a template that lowers its first letter to fit, and every variant is conditional on the parts it needs — a want variant only exists if you supplied a want. That is the honest version of this tool category: the checklists are published, the templates are visible, and the output is reproducible. The counts come from the shared tokenizer, so the word figure agrees with every other counter in this domain.\n\n- The premise it builds is only as good as the parts: vague in, vague out.\n- The variants are templates, not plot — they interrogate the premise rather than extend it.\n- No knowledge of genre conventions is applied; the genre field is a label you carry.\n- There is no store: leave the page and the parts are gone unless you copy the result.\n- The checks name empty or thin fields and never judge the idea itself.\n\nThe test the variants exist for is falsifiability: run the premise past three of them and see whether it survives. A premise that collapses when the obstacle turns out to be right was leaning on surprise rather than force, and the tool has shown you that before you have written a scene. Fill every part before reading the variants — a half-filled premise produces variants about the half you left out.\n\nWhen the premise survives, the neighbouring tools take the next step: the plot structure planner maps its four facts onto a structure's beats, the character profile builder turns the protagonist into a sheet. A premise that has survived the variants and a protagonist sheet that answers the flaw and the backstory together are the two artifacts an outline can be written against, and the first line generator composes an opener from the same character and setting.",
    howTo: [
      { step: "Fill the parts: genre, protagonist, want, obstacle and setting." },
      { step: "Read the assembled premise and the counts panel for parts filled and variants produced." },
      { step: "Work through the what-if variants and note which ones the premise survives." },
      { step: "Check the checks panel for empty fields, then copy the result when the premise holds." },
    ],
    whenToUse:
      "Use the story idea generator when four facts exist and a sentence has to hold them together. The {{plot-structure-planner|Plot Structure Planner}} maps the same four facts onto a structure's beats, and the {{first-line-generator|First Line Generator}} composes an opener from the character and place. When the need is sparks rather than assembly, the {{writing-prompt-generator|Writing Prompt Generator}} serves a fixed bank of prompts, and the character profile builder in this domain turns the protagonist into a full sheet.",
    faqs: [
      {
        q: "Does the tool write the story idea for me?",
        a: "No. It assembles the parts you supply in fixed patterns and spins them into what-if variants; nothing is invented. The output reads like your idea rearranged because that is literally what it is.",
      },
      {
        q: "What are the what-if variants for?",
        a: "Testing the premise. Each one inverts or accelerates a part — what if the want is achieved early, what if the obstacle is right — and a premise that survives several of them is one worth drafting.",
      },
      {
        q: "Why is a variant missing?",
        a: "Variants are conditional on the parts they need. Fill the want and the obstacle, and their variants appear; leave a field empty and only the variants that do not depend on it are built.",
      },
      {
        q: "How long should the parts be?",
        a: "A phrase each. The premise is a sentence, so a protagonist in a clause and a want in a few words produce the readable result; long inputs are not rewritten, only placed.",
      },
      {
        q: "Is my premise saved anywhere?",
        a: "No. The parts live in the page until you copy the result. There is no store and no account, so copy anything worth keeping before you leave.",
      },
    ],
  },

  "world-building-template": {
    keywords: [
      "world building template",
      "world bible",
      "geography",
      "areas filled",
    ],
    intro:
      "The World Building Template asks seven questions of your setting, assembles a world bible and shows which areas are still empty.",
    content:
      "Every story asks its setting the same seven questions, and this world building template asks them in one place: geography, culture, politics, economy, the rules of magic or technology, history and the conflicts that cannot both win. Answer them and the tool assembles a world bible — a single document with the premise at the top and each area beneath it — plus a panel counting words, areas filled and problems found. The engine supplies the questions and formats the answers; it invents no world.\n\nEach area is a labelled field with an example answer that shows the register: a geography placeholder that says what the land does to the people rather than where the mountains are. The checks panel flags the areas left empty and the answers that are too thin to carry a scene, phrased as prompts. Copy and Download produce the bible as text, which is how the template becomes a document your draft can be checked against.\n\n- Seven areas: geography, culture, politics, economy, rules, history and conflicts.\n- A one-line premise above them, so every answer answers the same story.\n- Areas filled: the count of answered areas out of the seven.\n- Problems: the checks for empty or thin answers, shown as prompts.\n- Word count from the shared tokenizer for the assembled bible.\n- Copy and Download for the document as plain text.\n\nThe bible is assembled by fixed section order — premise first, then the seven areas in the order a reader meets them — and every section that has an answer gets its heading, so the gaps are visible as missing headings rather than silence. Checks are mechanical: an empty area is flagged, and a one-clause answer is flagged as too thin to build a scene against. Nothing is generated, and the page says so: the questions are the product, the answers are yours.\n\n- An area count of seven of seven says the fields are filled, not that the world holds together.\n- The seven questions assume a certain kind of story; a slice-of-life setting may find politics and economy genuinely empty.\n- Answers are read literally, so a thin answer that sounds atmospheric still counts as thin.\n- No map, no timeline and no cross-referencing: the bible is a document, not a database.\n- Nothing is stored, so copy the bible before leaving the page.\n\nThe workflow that makes the template useful is to answer the conflicts field last and the rules field first: what is possible constrains everything else, and what cannot both win is what the story is actually about. Then read the checks panel — an empty conflicts field on an otherwise full bible is the most common gap, and it is the one the plot will need first. The bible is also the reference a later argument is settled by: when a scene contradicts the rules field six chapters on, the document wins, and the check that named a thin answer was usually the first sign the contradiction was coming.\n\nThe neighbours cover the parts of the same world: the scene description builder turns one location into sensory notes, the character profile builder fills the people who live in it, and the genre blender collides two genre conventions into the premise this world hosts.",
    howTo: [
      { step: "Write a one-line premise, then answer the seven area prompts — geography through conflicts." },
      { step: "Read the panel for words, areas filled and the problems the checks found." },
      { step: "Copy or download the assembled world bible as a document." },
      { step: "Return to the empty or thin areas the checks name and answer them before drafting." },
    ],
    whenToUse:
      "Use the world building template when a setting exists as fragments and needs one document. The {{scene-description-builder|Scene Description Builder}} turns a single location into sensory notes with a filter-word check, and the {{character-profile-builder|Character Profile Builder}} profiles the people who live there. For the premise the world hosts, the {{story-idea-generator|Story Idea Generator}} assembles it from four parts, and the genre blender in this domain decides which genre conventions the world has to honour.",
    faqs: [
      {
        q: "Which areas does the template ask about?",
        a: "Seven: geography, culture, politics, economy, the rules of magic or technology, history and conflicts. Each is a field with an example answer showing the register it wants.",
      },
      {
        q: "Does it generate any of the world?",
        a: "No. The engine supplies the questions and formats the answers; it invents no world. The questions and their order are the product, and the answers are entirely yours.",
      },
      {
        q: "What do the checks flag?",
        a: "Areas left empty and answers too thin to build a scene against. They are phrased as prompts, because a small setting may have a genuine reason for an empty area.",
      },
      {
        q: "Why is the premise at the top?",
        a: "So every answer answers the same story. A world bible without a premise collects facts the draft will never use; with one, each area can be read against the line it serves.",
      },
      {
        q: "How do I keep the world bible?",
        a: "Copy or Download it as text. Nothing is stored in the page, so the document has to leave with you to survive the session.",
      },
    ],
  },

  "writing-prompt-generator": {
    keywords: [
      "writing prompt generator",
      "prompt bank",
      "categories",
      "three at a time",
    ],
    intro:
      "The Writing Prompt Generator cycles a fixed, authored prompt bank across five categories, serving three prompts at a time in a stable order.",
    content:
      "Nothing here is random, and that is the point of this writing prompt generator. A fixed, authored prompt bank is organised into five categories — character, setting, conflict, dialogue and opening — and served three at a time in a stable order: the next action advances through the bank deterministically, so every writer sees the same prompts in the same order and can return to one. The panel shows how many prompts are in this bank for the chosen category, and the scope panel states plainly that the bank is finite.\n\nThe category picker chooses which bank you are drawing from, and the page of three prompts updates as you cycle. Because the order is stable, a prompt you skip comes back around rather than disappearing — which is what separates a bank from a slot machine. There is no model behind the prompts and no composition step: each one is a sentence someone wrote to be answered, and the count of prompts in the bank is printed so the finitude is visible rather than implied.\n\n- Five categories: character, setting, conflict, dialogue and opening.\n- Three prompts served per page, the same three for everyone at the same position.\n- A stable cycle: the next action wraps at the end, so the list never runs out.\n- Prompts in this bank: the size of the current category's list.\n- Scope and limits: the statement that the bank is authored and finite.\n\nThe engine is a set of arrays and an offset. promptPage reads three entries starting at the current offset and wraps at the end; nextPromptOffset advances the offset. That is the whole mechanism, and the page says so, because a generator that pretends to compose prompts it does not contain is the failure mode this tool is built to avoid. Word counts on the prompts come from the shared tokenizer like everything else in the domain.\n\n- The bank is finite: a category you cycle often will start repeating, by design.\n- Prompts are generic to their category and carry no knowledge of your story.\n- No difficulty rating, no suitability filter and no way to add your own prompts.\n- The cycle position is page state, not storage: a reload starts the category again.\n- Nothing is generated, so two writers on the same page see the same three prompts.\n\nThe habit that makes a fixed bank useful is answering on paper before judging: read three, write the one that produces a sentence fastest, and only then cycle. The temptation to keep cycling is the slot-machine pull the deterministic order exists to remove — the next three are ordinary prompts too, and the one in front of you is the test. Cycle only when three answers exist on paper, and keep a note of which category produced the sentence fastest — that is data about your habits, not about the bank.\n\nThe neighbours take the prompts further: the story idea generator assembles a premise from four parts, the first line generator composes an opener from a character and a place, and the flash fiction timer gives the prompt a clock to be written against.",
    howTo: [
      { step: "Choose a category: character, setting, conflict, dialogue or opening." },
      { step: "Read the three prompts on the page — the same three everyone sees at this position." },
      { step: "Answer the one that produces a sentence fastest rather than cycling first." },
      { step: "Cycle when the three are spent; the order wraps so no prompt is lost." },
    ],
    whenToUse:
      "Use the writing prompt generator when the need is a starting point rather than an assembly. The {{story-idea-generator|Story Idea Generator}} builds a premise from four named parts once a prompt gives you something to want, and the {{first-line-generator|First Line Generator}} composes an opener from a character, a place and a tone. For writing against a clock, the {{flash-fiction-timer|Flash Fiction Timer}} adds a word and time limit, and the genre blender in this domain collides two conventions into a premise instead.",
    faqs: [
      {
        q: "Are the prompts generated randomly?",
        a: "No. The bank is authored and finite, and pages are served from a stable offset, so everyone sees the same prompts in the same order. A prompt you skip comes back around rather than vanishing.",
      },
      {
        q: "How many prompts are there?",
        a: "The panel shows how many prompts are in this bank for the chosen category. Five categories share the same serving rule of three at a time.",
      },
      {
        q: "Can I add my own prompts?",
        a: "No. The bank is fixed and published, which is what makes the cycle stable across writers. The scope panel states the limit rather than implying otherwise.",
      },
      {
        q: "Why does the order repeat when I cycle enough?",
        a: "Because the bank is finite and the offset wraps at the end. Repetition is the honest consequence of a fixed list, and it is also what lets you return to a prompt you passed.",
      },
      {
        q: "Does it know anything about my story?",
        a: "No. Prompts are generic to their category and carry no context. The story-specific work belongs to the generators that assemble from your parts once a prompt has started something.",
      },
    ],
  },

  "villain-motivation-builder": {
    keywords: [
      "villain motivation builder",
      "wound",
      "method",
      "line they will not cross",
    ],
    intro:
      "The Villain Motivation Builder assembles the parts that make an antagonist a person — want, wound, method and the line they will not cross — and checks the parts drafts skip.",
    content:
      "An antagonist is a person with a plan, and this villain motivation builder asks the questions a memorable one answers: what they want, the wound behind the want, how they justify themselves in their own eyes, their method, the line they will not cross and the story they tell about themselves. The engine writes no villain. It collects the parts that make one legible, then reports which are filled and which checks the profile raises.\n\nThe panel holds the six inputs, each with an example that shows the register — a method described as what they actually do, a self-image stated in their own voice rather than yours. Stats report words, parts filled and problems, and the checks panel names the parts most drafts skip: a want with no wound behind it, a method with no line, a self-image that only repeats the justification. Copy and Download produce the profile as text.\n\n- What they want: the concrete object of the plan, in a phrase.\n- The wound: the past event that made the want necessary.\n- Justification: how the plan looks right from inside their own eyes.\n- Method: what they actually do, the behaviour rather than the capability.\n- The line they will not cross: the limit that makes them a person rather than a force.\n- Self-image: the story they tell about themselves, in their voice.\n\nThe checks are comparisons between the fields, not a model of evil: the wound is checked for being present behind the want, the line for existing beside the method, and the self-image for differing from the justification. Each is phrased as a prompt on the page, because a villain who is simply cruel is a valid choice in some stories. The word count and parts-filled figures are there for proportion — a method detailed in eighty words beside a wound in five is telling you where the profile is lopsided. Everything is assembled from what you typed, and the word counts come from the shared tokenizer like the rest of the domain.\n\n- The checks read presence and difference, never quality: a filled profile can still be flat.\n- Six fields assume a character-driven antagonist; a force of nature has no wound to name.\n- Field comparison is literal, so a self-image restating the justification only trips when the wording matches.\n- Nothing is stored, so the profile has to be copied out to survive the page.\n- No knowledge of genre conventions is applied to the answers.\n\nThe pair that does the most work is wound and line: the wound explains why the want exists, and the line explains why the villain has not already won. Read the checks after writing those two, because a profile where the method is detailed and the line is missing usually describes a problem for the plot rather than a character who can be reasoned with.\n\nThe neighbouring builders cover the rest of the cast: the character profile builder prompts the protagonist's want, need, flaw and arc, the conflict planner shapes who opposes whom over what, and the story idea generator assembles the premise the villain is standing inside. Read the six fields as a set rather than individually: the want explains the method, the wound explains the want, and the line explains why the story is not already over.\n",
    howTo: [
      { step: "Fill the six inputs: want, wound, justification, method, the line and self-image." },
      { step: "Read the stats for words, parts filled and problems." },
      { step: "Work through the checks, especially want against wound and method against line." },
      { step: "Copy or download the profile when the parts agree." },
    ],
    whenToUse:
      "Use the villain motivation builder when the antagonist needs a plan that reads as a person's. The {{character-profile-builder|Character Profile Builder}} prompts the protagonist's want, need, flaw and arc, the {{conflict-and-resolution-planner|Conflict and Resolution Planner}} shapes who opposes whom over what, and the {{story-idea-generator|Story Idea Generator}} assembles the premise this antagonist stands inside. Their voice in the scene belongs to the {{dialogue-practice-tool|Dialogue Practice Tool}}.",
    faqs: [
      {
        q: "Which parts does it ask for?",
        a: "Six: what they want, the wound behind it, how they justify themselves, their method, the line they will not cross and how they see themselves. Each field shows an example in the register it wants.",
      },
      {
        q: "Why does a villain need a wound?",
        a: "The wound is the past event that made the want necessary. The checks prompt for it because a want with no history behind it reads as appetite rather than motivation.",
      },
      {
        q: "What does the line they will not cross do?",
        a: "It explains why the villain has not already won. A profile with a method and no line describes a problem for the plot rather than a person who can be bargained with.",
      },
      {
        q: "Does it rate how convincing the villain is?",
        a: "No. The checks report presence and difference between fields — never quality. A fully filled profile can still be flat, which is the judgement the tool leaves to you.",
      },
      {
        q: "Is the profile stored?",
        a: "No. The inputs live in the page, so Copy or Download the profile before leaving; nothing is saved after the session.",
      },
    ],
  },

  "first-line-generator": {
    keywords: [
      "first line generator",
      "opening line",
      "tone",
      "candidates",
    ],
    intro:
      "The First Line Generator composes four candidate opening lines from a character, a place and a tone, and checks your own opener for borrowed moves.",
    content:
      "An opening line has one job — make the next line necessary — and this first line generator gives you four attempts at it. Supply a character, a place and a tone from quiet, strange, dangerous or warm, and four candidate opening lines come back built from those three fields. The patterns are fixed and visible; the engine combines your parts and never supplies a story of its own, so the candidates read like openings to your book rather than openings to somebody else's.\n\nThe opening panel holds the three inputs and a separate field for your own line. The candidates panel lists the four, each copyable, and Copy first takes the one you pick. The checks panel covers your own line: the checker names the four moves that make a first line sound borrowed — the stock dark-and-stormy construction among them — so an opener you wrote yourself can be read against the patterns the generator uses.\n\n- Character: who the line is about, in a name or a phrase.\n- Place: where it starts, one image rather than a map.\n- Tone: quiet, strange, dangerous or warm — the register of the sentence.\n- Four candidates: one pattern per template, all built from your three fields.\n- Your own line: checked for the four borrowed moves.\n- Copy first and Copy for taking candidates out.\n\nThe candidates are assembled by fixed string patterns — each places the character, the place and the tone into a shape someone has used before, which is exactly why the checker can name borrowed moves in reverse. Both sides live in the same module: the generator composes from three fields, the checker decomposes an opening into flags. Counts and checks run in the page, and nothing is invented beyond the patterns that are published on it.\n\n- Four candidates share the same three inputs, so they vary by pattern rather than idea.\n- A thin input — a generic character, a generic place — produces a generic line.\n- The checker's four moves are a finite list; an opening can sound borrowed in ways it does not name.\n- Tone changes the wording, not the structure of the pattern it fills.\n- Nothing is stored, so copy the line before leaving the page.\n\nThe workflow is to write your own line first and generate second: the checker on your opener tells you which of the four borrowed moves it already contains, and the candidates then show how the same three fields sound under different patterns. Reading them side by side is the fastest way to see which move your opening is actually making — and deleting a stock construction is easier once it has a name. Keep the three fields concrete, because a line built from a vague place and a generic character collapses into the same sentence every time; a named street or a borrowed coat gives the pattern something to carry.\n\nThe neighbours cover the rest of the opening problem: the ending generator drafts the six verdicts the last line has to pay off, the story idea generator assembles the premise the line promises, and the writing prompt generator cycles an authored bank when the page is blank before line one.\n",
    howTo: [
      { step: "Fill the three inputs: character, place and tone." },
      { step: "Read the four candidates and copy the one that earns a second line." },
      { step: "Paste your own opening line into the checker field to see the borrowed moves it contains." },
      { step: "Revise against what the check names, then copy the final line into the draft." },
    ],
    whenToUse:
      "Use the first line generator when the opening exists in notes but not yet in sentences. The {{story-idea-generator|Story Idea Generator}} assembles the premise the line has to promise, and the {{ending-generator|Ending Generator}} drafts the six verdicts that last line has to pay off. When the need is sparks rather than assembly, the {{writing-prompt-generator|Writing Prompt Generator}} cycles an authored bank of prompts, and the dialogue practice tool in this domain takes over once characters start speaking.",
    faqs: [
      {
        q: "How are the candidates produced?",
        a: "Four fixed patterns place your character, place and tone into shapes that have been used before. The patterns are published on the page, and nothing beyond them is invented.",
      },
      {
        q: "What tones can I choose?",
        a: "Four: quiet, strange, dangerous and warm. The tone changes the wording of each candidate rather than the structure of the pattern filling it.",
      },
      {
        q: "What does the checker look for in my own line?",
        a: "The four moves that make an opening sound borrowed — the stock dark-and-stormy construction among them — named one by one so a revision has something specific to delete.",
      },
      {
        q: "Can it write a whole opening paragraph?",
        a: "No. It composes first lines from three fields and checks ones you bring. The second line, and everything after it, remains the part you write.",
      },
      {
        q: "Why do all four candidates feel similar?",
        a: "They share the same three inputs and differ only by pattern, so a generic character and place produce generic lines. Fill the fields with specifics and the candidates separate.",
      },
    ],
  },
};
