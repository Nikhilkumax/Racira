import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B17, content and marketing: authored SEO entries for the headline
 * analyzer, the CTA button copy generator, the tagline generator, the email
 * subject line tester and the value proposition builder.
 *
 * Every entry draws the same line: these tools score or compose from a fixed,
 * visible rubric, and none of them knows whether the offer is worth the click.
 * Keys are registry slugs; see ../tool-seo.ts for the contract.
 */
export const B17_MARKETING_SEO: Record<string, ToolSeo> = {
  "headline-analyzer": {
    keywords: ["headline analyzer", "headline", "power words", "score", "rubric"],
    intro:
      "The headline analyzer scores a headline against a fixed rubric of habits strong headlines share — a length a reader can take in, a power word, a concrete number, an address to the reader — and flags the habits that weaken one.",
    content: `The headline analyzer scores a headline out of one hundred against six things a headline can be checked for: a length between six and twelve words, a power word from a documented list, a concrete number, a direct address to the reader with you or your, a question or list shape, and readable capitalisation. Each element carries its own points, and the panel shows the breakdown, so the number is never a mystery: you can see which habits the headline has and which it has skipped.

The rubric exists because headline advice is usually vague. Be specific, it says, without saying what counts as specific. The analyzer answers with a working definition: a number, a named thing, a claim a reader can verify. When a headline says a guide will save your team six hours a week, the score can point at the number and the addressed reader; when it says solutions for modern teams, the score points at the empty adjectives, which is a more useful conversation than an opinion.

The checks are the second output and the more important one. They flag the faults a rubric alone would miss: a headline past fifteen words, ALL CAPS on a word longer than three letters, a closing period where display type takes none, and a word repeated inside one line. Each check explains why the habit costs attention, and every one of them is a prompt rather than a rule — a serious story may earn a quiet headline that scores below sixty, and a tabloid headline may hit a hundred while overpromising.

Because the rubric is fixed and visible, the same headline always scores the same, and the score can be argued with. That is deliberate. A model with an opinion cannot be inspected; a rubric can. Writers learn the habits by watching the points move as they edit, which is the real reason to score a headline at all — not to chase one hundred, but to notice that the number came from the same three adjectives every time.

A word on the power words list, since it is the part readers question first. The list is short and deliberately concrete: guide, proven, essential, step-by-step and their kin. What it does not contain matters as much as what it does — amazing, revolutionary and world-class are absent because they describe the writer's enthusiasm rather than the reader's situation, and a headline built on them tells the reader nothing they can picture. Adding a power word should not be a matter of sprinkling; it should be the moment the writer finds the precise term that was hiding behind three vague ones, and the score moving then is a useful signal that the revision did something.\n\nThe analyzer is faithful to its limits. It cannot know the story, the audience or the publication, and it says so on the page. A headline is a promise, and whether the piece keeps it is not something any scorer can weigh. The rubric checks the surface a reader meets first; the depth behind it remains the writing's job.

Nothing is uploaded and nothing is stored beyond the tab, so a working headline for an unpublished piece stays private. Use it as a mirror, not a judge: revise until the breakdown reflects what you meant to emphasise, then stop before the headline starts sounding scored.`,
    howTo: [
      { step: "Type the headline you are working on." },
      { step: "Read the score and the six-part breakdown to see what earned its points." },
      { step: "Work through the checks for length, shouting, punctuation and repeats." },
      { step: "Try a version with a number or a direct address and watch the score move." },
    ],
    whenToUse: `Use the headline analyzer when a title needs a second opinion that shows its work. The same rubric ideas apply one line down the page to an email, where the {{email-subject-line-tester|Email Subject Line Tester}} scores length and trigger phrases instead of power words.\n\nWhen the issue is not shape but wear, the {{cliche-detector|Cliché Detector}} finds the tired phrases a headline reaches for first, and the {{readability-grade-scorer|Readability Grade Scorer}} confirms the line reads at the level the audience expects.`,
    faqs: [
      {
        q: "What does the headline analyzer actually measure?",
        a: "Six habits: length, a power word, a concrete number, an address to the reader, a question or list shape, and capitalisation. Each carries points out of a hundred, and the breakdown is shown so you can disagree with it.",
      },
      {
        q: "Can a headline score 100 and still be bad?",
        a: "Yes. The score measures habits, not truth or fit. A high-scoring headline can overpromise, and a quiet low-scoring one can be exactly right for a serious story.",
      },
      {
        q: "What counts as a power word?",
        a: "A documented list of concrete, load-bearing words such as guide, proven, essential and step-by-step. The list is shown on the page, so the term is inspectable rather than mysterious.",
      },
      {
        q: "Why does it flag repeated words?",
        a: "A word repeated inside one short line usually shows the writer circling the same idea. The check names the repeat so it can be cut or replaced with a more specific term.",
      },
    ],
  },

  "cta-button-copy-generator": {
    keywords: ["CTA button copy generator", "button", "verb", "benefit", "variants"],
    intro:
      "The CTA button copy generator builds five short button-label variants from a verb, the thing the click gets and the benefit behind it, then checks the wording a button cannot afford.",
    content: `The CTA button copy generator takes three parts — a verb such as download, the object the click gets such as the rota template, and the benefit behind it such as start this week — and composes five label variants from the same material. Seeing the identical click phrased five ways is the point: the difference between download the template and ready to start this week? download the template is not information a writer can hold in their head, but it is obvious side by side.

The patterns are fixed and readable. The shortest is the bare verb and object; the others add the benefit, turn the label into a next step, or lead with the benefit as a question. Nothing is generated in the sense of invented: every word comes from the three fields, and the patterns are documented on the page. That means the variants can be trusted as a set, and any of them can be edited into the final label without wondering what the generator meant.

The checks cover the faults that make a button ask rather than offer. A verb like submit or send describes the reader's effort; the check points at download, start or get instead. A label past ten words has stopped being a button and become a sentence, and the check flags the offending variant by number. Click here is called out by name, because a label that describes the gesture rather than the destination wastes the one line of copy a button gets.

The benefit field deserves a moment of its own, because it is the part writers skip. A label that says download the template names the object; a label that says download the template and start this week names what the object changes. The second is not longer because it is padded — it is longer because it carries the reason to click, and the check flags an empty benefit for exactly that reason. If the benefit cannot be stated, the button is asking the reader to want something on faith.\n\nPlacement matters as much as wording, and the generator cannot see it. A button at the end of a paragraph inherits the paragraph's promise; a button floating in a header has to carry its own. When a page has one offer, one call to action and one destination, every variant above points at the same place and the choice is purely verbal. When a page has several, the shortest labels should go to the most important action, because the eye assigns importance by size and brevity.\n\nButtons are the smallest copy most pages carry and the most consequential, since every conversion routes through one. Because the tool composes deterministically, trying three different verbs is three edits, and the word counts beside each variant show how much of a breath the label takes. The choice should be the plainest variant that stays honest about what happens after the click.

Nothing is uploaded and nothing is stored beyond the tab. The generator writes no claims and knows nothing about the page the button sits on; it supplies the patterns and the prompts, and the promise remains the writer's. Keep the label honest: if the button says start, the next screen should start something.`,
    howTo: [
      { step: "Enter the verb, what the click gets and the benefit." },
      { step: "Read the five variants and their word counts." },
      { step: "Work through the checks for weak verbs and overlong labels." },
      { step: "Copy the variant that sounds least like a button and most like an offer." },
    ],
    whenToUse: `Use the CTA button copy generator once the offer is settled and the label needs to be short. The offer itself is the {{value-proposition-builder|Value Proposition Builder}}'s job, and the button should echo the benefit that builder produces.\n\nWhen the button sits under a headline, the {{headline-analyzer|Headline Analyzer}} keeps the two lines from saying the same thing twice — the headline makes the promise, the button names the step.`,
    faqs: [
      {
        q: "How many words should a button label have?",
        a: "Two to six in practice. The generator flags any variant past ten words, but the honest ceiling is lower: a label the reader takes in at a glance. The word counts are shown beside each variant.",
      },
      {
        q: "Why is submit a weak button verb?",
        a: "Because it describes what the reader does to the form, not what they receive. Verbs like download, start and get name the outcome; the check points at the difference rather than banning a word.",
      },
      {
        q: "Are the variants generated by a model?",
        a: "No. Five fixed patterns combine your three fields, and every word comes from what you typed. The patterns are visible on the page, so nothing arrives that you did not author.",
      },
      {
        q: "Should the button repeat the headline?",
        a: "No — the headline makes the promise and the button names the next step. If the two say the same words, one of them is wasted; the benefit field is where the button can pick up the headline's idea in a new phrasing.",
      },
    ],
  },

  "tagline-generator": {
    keywords: ["tagline generator", "tagline", "brand", "benefit", "audience"],
    intro:
      "The tagline generator composes five fixed patterns from a brand, one benefit and an audience, then checks the faults a tagline cannot carry — two benefits, first-person phrasing, a line that needs a second breath.",
    content: `The tagline generator composes five candidate taglines from three parts: the brand, one benefit and the audience. The patterns are fixed — the brand followed by the benefit, the benefit audited back to the audience, a for-audience framing, a verb-led sentence and a three-beat close — so a writer sees the same promise said five ways and can hear which one has the rhythm. Nothing is invented; every word comes from the three fields.

The benefit field is where the discipline lives. One benefit is the rule, and the check flags an and in the middle of it, because a tagline carrying two ideas carries neither. The check also flags first-person phrasing — we keep your inbox calm — for the same reason a value proposition does: a tagline is read from the audience's side, and a sentence about the company's effort gives the reader nothing to want.

The audience field sharpens the promise by narrowing it. Naming support teams rather than businesses tells the writer which benefit belongs in the line and which examples would fall flat; knowing who a tagline excludes is half of what it says. The length check does the rest: a tagline past ten words needs a second breath, and a phrase that needs a second breath is a sentence wearing a slogan's job.

A useful test after the first read is the radio test: say the candidate over a phone and ask the listener to repeat it back. Taglines that fail are usually the ones carrying an abstract noun; taglines that pass have a verb and a picture. The generator's first pattern — brand, then benefit — passes more often than the more elaborate ones, which is worth noticing before reaching for the clever option.\n\nIt also helps to hold the tagline against the value proposition. If the proposition says support teams are drowning in tickets and the tagline says a calmer inbox, the two lines are doing different work at different lengths; if the tagline repeats the proposition word for word, one of them is redundant. The generator shows the benefit in five arrangements so the writer can hear which arrangement matches the brand's existing voice, and voice is finally the only criterion that matters.\n\nOne practical note on the audience field: leave it empty to see the two shortest patterns alone. Some brands never name their audience in the tagline and instead let the benefit narrow it, and the generator supports that by dropping the audience patterns when the field is blank — a quick way to compare a broad promise against a targeted one without editing anything.\n\nBecause the patterns are fixed and printed on the page, the generator can be inspected and argued with, and the same inputs always produce the same set. The output is a shortlist, not a shortlist of winners — a tagline is chosen by ear and by fit with the brand's history, which no composer can supply.

Nothing is uploaded and nothing is stored beyond the tab. The tool edits nothing, claims nothing and checks no existing marks; the page reminds the writer to clear any candidate against the market's registered phrases before a launch. The promise, the choice and the clearance all stay with the writer.`,
    howTo: [
      { step: "Enter the brand, one benefit and the audience it is for." },
      { step: "Read the five patterns and say each one aloud." },
      { step: "Work through the checks for two benefits, first-person phrasing and length." },
      { step: "Copy the candidates and test them with someone who is not the writer." },
    ],
    whenToUse: `Use the tagline generator when a brand or a product needs a short promise and the first attempt sounds like every competitor. The benefit it composes from is the one the {{value-proposition-builder|Value Proposition Builder}} works out at length, so settle the pitch there first.\n\nWhen the tagline and the headline have to sit near each other, the {{headline-analyzer|Headline Analyzer}} shows what the other line is carrying, which keeps the two from repeating the same few words.`,
    faqs: [
      {
        q: "Is a tagline generated or chosen?",
        a: "Chosen. The generator composes five fixed patterns from your brand, benefit and audience, then stops. Which line is right depends on the brand's history and its ear, and no composer can supply either.",
      },
      {
        q: "Why does a tagline get only one benefit?",
        a: "Because a line carrying two ideas carries neither. The check flags an and inside the benefit field, which is almost always two benefits wearing a conjunction, and asks for the one that would survive being cut.",
      },
      {
        q: "Should a tagline name the audience?",
        a: "Often, especially in business software where the promise only makes sense to a particular role. Naming the audience narrows the benefit and tells the writer which examples to avoid.",
      },
      {
        q: "Can I use these lines at launch?",
        a: "Only after clearing them. The generator checks no trademarks and no existing marks; treat every candidate as a draft and run it past whatever clearance process your market requires.",
      },
    ],
  },

  "email-subject-line-tester": {
    keywords: ["email subject line tester", "subject line", "spam trigger", "characters", "inbox"],
    intro:
      "The email subject line tester scores a subject line against the mechanical faults inboxes punish — length past the cut, spam-trigger phrases, shouted words and stacked exclamation marks — and reports the characters and words it holds.",
    content: `The email subject line tester scores one subject line out of one hundred against the faults inboxes punish mechanically. Length is the first: a line of fifty characters or fewer scores full points, up to seventy scores half, and past that the rubbish bin on a phone cuts it. Then trigger phrases — free, act now, limited time and their relatives — which both filters and readers have learned to skip. Then shouted words, stacked exclamation marks, and one concrete hook: a number or a personalisation token such as the recipient's name.

The rubric is fixed and the breakdown is visible, which is the point. The tester cannot predict an open rate; open rates depend on the sender's reputation, the list and the moment. What it can do is catch the mechanical mistakes that sink a perfectly good offer: a line that spends forty characters before the verb, three bangs where one would do, a spam phrase that guarantees the promotions tab. Those are facts about the line, not predictions about the reader, and the page draws that line clearly.

The checks explain each deduction in words, so the score becomes a revision list. A line at fifty-five characters gets a note to move the detail into the preview text rather than a demand to cut words; a trigger phrase is named so it can be replaced rather than merely penalised. That framing matters because subject lines are often written under time pressure, and a specific question — will this survive the cut on a phone? — is easier to answer than a general one.

Two more notes on calibrating the score. The spam trigger list is deliberately short and literal, because the phrases that reliably cost a send are the obvious ones: free, guarantee, act now, limited time and a handful of relatives. Length and shouting are matters of degree, and the checks describe the degree rather than pretending to a verdict. The second note is that a low score is often a rewrite rather than a rejection: moving the concrete detail to the front of the line commonly lifts a subject from the forties into the eighties without changing the offer at all. Keep the tested line next to the preview text as you revise, since the two are read together on a phone and a subject that repeats the preview has wasted half of the impression.\n\nConcreteness is rewarded for a reason worth stating: a subject line with a number or the reader's name gives a reason to open that stands on its own. Your refund in 10 working days says what is inside and how long it takes, without a single marketing adjective. The rubric is calibrated for that kind of line, and the check asks for one concrete hook when the line has none.

Nothing is uploaded and nothing is stored beyond the tab, so a subject line for an unpublished send stays private. Read the score, read the checks, change one thing, and stop before the line starts sounding scored — the best subject line is the one that reads like a person wrote it, which no rubric can measure.`,
    howTo: [
      { step: "Paste the subject line into the field." },
      { step: "Read the score, the character count and the trigger-phrase count." },
      { step: "Work through the checks: length, triggers, shouting, bangs, concreteness." },
      { step: "Rewrite with a number or the reader's name and watch the score move." },
      { step: "Check the final line against the preview text, not in isolation." },
    ],
    whenToUse: `Use the email subject line tester on any subject line that matters — a launch, a renewal, a note from a founder. When the body behind it is one of the routine templates, the {{email-template-library|Email Template Library}} already supplies a subject line to test.\n\nThe same habits apply a page up in display type: the {{headline-analyzer|Headline Analyzer}} scores headlines on length, detail and power words, and testing both keeps the email and its landing page from overselling each other.`,
    faqs: [
      {
        q: "Does the tester predict open rates?",
        a: "No. It scores mechanical faults — length, trigger phrases, shouting, stacked bangs, concreteness. Open rates depend on sender reputation, the list and the moment, none of which the tool can see.",
      },
      {
        q: "How long should a subject line be?",
        a: "Fifty characters or fewer to survive a phone intact; sixty to seventy works on desktop but invites truncation. The tester shows the exact character count and flags the band it falls in.",
      },
      {
        q: "Why are words like free and limited time flagged?",
        a: "Because both filters and readers have learned to skip them, so the phrase costs attention without adding information. The check names each trigger so it can be replaced with the concrete offer.",
      },
      {
        q: "What counts as a concrete hook?",
        a: "A number or a personalisation token such as the recipient's name. Either gives the reader a reason to open that stands on its own; the check asks for one when the line contains neither.",
      },
    ],
  },

  "value-proposition-builder": {
    keywords: ["value proposition builder", "value proposition", "audience", "proof", "alternative"],
    intro:
      "The value proposition builder assembles the audience, the need, the category, the benefit, the alternative being replaced and the proof into the two sentences a pitch gets.",
    content: `The value proposition builder assembles a pitch from the parts that make one complete: the audience, the need they feel, the brand, the category it belongs to, the benefit written from the reader's side, the alternative they use today and the proof that the claim holds. The first sentence follows a conventional shape — for this audience who have this need, the brand is this kind of thing that does this — and the second names the alternative and the evidence. Two sentences is the whole form, and the constraints are the point.

The category field is the one writers resist and the one that matters most. Readers file a product by what it is before they judge whether it is good, so a value proposition that leaves the category blank does so at its peril; the check asks for it explicitly. The alternative field does similar work from the other side: a promise means nothing without a contrast, and naming what the audience uses now — a shared inbox, a spreadsheet, doing nothing — is what turns a feature list into a choice.

The benefit is checked for voice. A clause beginning we or our describes the company's effort, which gives the reader nothing to want; the check asks for the same claim from the reader's side. The proof then gets the hardest check: it must contain a figure. Figures are the part of a claim a reader can verify, and a proof sentence with no number in it is usually an adjective in disguise.

It helps to write the proof before the benefit. Evidence is the slow part — the figure, the study, the customer result — and a proof that exists tends to pull the whole proposition into focus: you discover which audience the evidence is really about, and which benefit it can honestly carry. A benefit written first invites the proof to be retrofitted, which is how adjectives end up where numbers should be.\n\nKeep the result in the page, not in the sentence. The proposition gets two sentences and no more; the case study, the screenshots and the long explanation belong under it, where a reader who is already interested will find them. The builder's word count enforces that discipline, and the check against first-person phrasing keeps the sentence pointed at the reader — the two habits between them are most of what distinguishes a value proposition from a product description. Revise until every clause is one you would defend out loud to a customer.\n\nBecause the builder assembles deterministically from the fields, changing one part re-renders both sentences, which makes the pitch easy to iterate. The word count keeps it to the length a visitor will actually read, and the page states plainly that the builder knows nothing about the market, so naming an alternative is not a claim that it is worse. Any comparative claim still needs the writer's checking.

Nothing is uploaded and nothing is stored beyond the tab. The builder supplies the sentence structure and the prompts; the truth of every clause — the audience, the benefit and especially the proof — remains the writer's responsibility.`,
    howTo: [
      { step: "Name the audience and the need they already feel." },
      { step: "Add the brand and the category; readers file by category first." },
      { step: "Write the benefit as what changes for the reader." },
      { step: "Name the alternative and the proof — with a figure in it." },
      { step: "Read both sentences aloud and trim anything that hedges." },
    ],
    whenToUse: `Use the value proposition builder before a landing page or a pitch deck is written, when the offer still needs saying in two sentences. The short promise that survives comes next: the {{tagline-generator|Tagline Generator}} composes the same benefit at tagline length.\n\nWhen the pitch is settled, the {{cta-button-copy-generator|CTA Button Copy Generator}} turns its benefit into a button label, so the promise and the click use the same words.`,
    faqs: [
      {
        q: "What are the parts of a value proposition?",
        a: "Audience, need, brand, category, benefit, the alternative it replaces and the proof. The builder assembles the first five into a sentence and uses the last two to form the contrast and the evidence.",
      },
      {
        q: "Why is naming the alternative so important?",
        a: "Because a promise needs a contrast to mean anything. Naming what the reader uses today — a shared inbox, a spreadsheet, nothing — turns a description of a product into a choice between two futures.",
      },
      {
        q: "Why must the proof contain a number?",
        a: "Numbers are the part of a claim a reader can check. The check flags a proof with no figure because a proofless sentence is usually an adjective in disguise, and adjectives are what value propositions are made of before revision.",
      },
      {
        q: "How long should a value proposition be?",
        a: "Two sentences, under sixty words. The builder warns past sixty and keeps the count visible; anything longer belongs in the page beneath the proposition, not in the pitch itself.",
      },
      {
        q: "Does the builder research my market?",
        a: "No. It knows nothing about the competition or the category and says so. Naming an alternative is not a comparative claim; verify anything of that kind before it ships.",
      },
    ],
  },
};
