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
    keywords: [
      "headline analyzer",
      "headline score",
      "power words",
      "headline length",
    ],
    intro:
      "The Headline Analyzer scores a headline against the six mechanical habits strong headlines share and names the ones it breaks.",
    content:
      "A headline has one job — earn the next second of attention — and this headline analyzer scores whether yours does the mechanical work. Paste a headline and it grades it out of a hundred across six parts: length, a power word, a concrete number, an address to the reader, a question or list shape, and readable capitalisation. The score is a documented rubric, not a prediction of traffic, and the panel says so.\n\nThe headline panel takes one line of text. The score panel breaks the total into its six parts with the points each earned, and the checks panel lists the faults — past fifteen words readers skim, fewer than four words say too little, a headline with no number or no you leaves the reader outside the sentence. ALL CAPS words are flagged as shouting, a closing period is flagged, and a repeated word is named. How the score is built shows the exact weights; Scope and limits says what the rubric cannot do. The headline length band and the headline score parts print beside one another, so a rewrite starts from the named fault rather than the total.\n\n- Length (6-12 words): 25 points inside the band, 15 between four and fifteen, nothing outside it.\n- Power word: 20 points for at least one of the published list, from proven and essential to field-tested.\n- Concrete number: 15 points for any digit in the line.\n- Addresses the reader: 10 points for you or your.\n- Question or list shape: 10 points for a question mark, colon or spaced dash.\n- Readable capitalisation: 10 points for a headline that opens like a sentence.\n- Grade: Strong, Workable or Weak from the total.\n\nThe analysis is arithmetic on the string: the tokens come from the shared tokenizer, the power words are a fixed set of eighteen, and every point is awarded by a published condition rather than a model. That is why the checks can name the same habits the score rewards, and why two writers with the same headline see the same number. The rubric measures what a headline contains; it has no opinion about the story underneath.\n\n- The score is a rubric, not a forecast: it does not predict clicks, shares or search position.\n- The power-word list is fixed at eighteen entries; a strong word outside it earns nothing.\n- Numbers are credited by presence, not usefulness — a misleading figure still scores.\n- The capitalisation check reads only the first character; it cannot judge a house style.\n- Nothing is stored, so copy the headline and the breakdown before leaving the page.\n\nRead the checks before the score: a headline that scores well and still draws three faults has the parts and misses the point. Then run the same line through the headline rewriter when the fault is vocabulary rather than shape, and compare the two readings side by side. A headline that earns its number and its power word while naming the reader is one worth testing. Keep the line honest as well: a number the story does not deliver, or a power word the piece cannot carry, scores the same as the truth and costs the reader's trust instead.\n\nThe neighbours cover the rest of the problem: the email subject line tester applies a parallel rubric to the inbox, the headline rewriter trades power words in and out, and the CTA button copy generator finishes the job the headline starts.",
    howTo: [
      { step: "Paste the headline into the headline panel." },
      { step: "Read the score and the six parts that built it." },
      { step: "Work through the checks — length, number, you, caps, period, repeats." },
      { step: "Copy the line and the breakdown, then test a variant." },
    ],
    whenToUse:
      "Use the headline analyzer when a headline exists and the question is whether its mechanics hold. The {{email-subject-line-tester|Email Subject Line Tester}} applies the same kind of rubric to inbox lines, and the {{headline-rewriter|Headline Rewriter}} trades the vocabulary once the faults are known. When the headline sits over a full page, the {{landing-page-copy-builder|Landing Page Copy Builder}} carries it into a structure, and the CTA button copy generator in this domain writes the click the headline promises.",
    faqs: [
      {
        q: "Is the headline score a prediction of performance?",
        a: "No. It is a published rubric that measures six mechanical habits — length, power word, number, address, shape, capitalisation — and grades what the line contains. Traffic depends on the audience, the placement and the promise, none of which the tool can see.",
      },
      {
        q: "What counts as a power word?",
        a: "A fixed set of eighteen: proven, ultimate, free, new, guide, essential, easy, fastest, best, complete, step-by-step, simple, practical, honest, quiet, exact, working and field-tested. A strong word outside the list scores nothing, which is the honest limit of a fixed lexicon.",
      },
      {
        q: "Why did my headline lose points for length?",
        a: "The full 25 points are reserved for six to twelve words, the band a reader can take in at a glance. Four to fifteen words earn 15 points, and anything outside that earns none — the check tells you how far past fifteen the line ran.",
      },
      {
        q: "Does the analyzer rewrite the headline?",
        a: "No. It scores and flags; the wording stays yours. The headline rewriter in this domain is the tool that trades power words and shapes once the analyzer has named the faults.",
      },
      {
        q: "Where does my headline go when I close the page?",
        a: "Nowhere. The analysis runs in the page from the text you typed, and nothing is stored or sent; closing the tab discards the line unless you copied it.",
      },
    ],
  },

  "cta-button-copy-generator": {
    keywords: [
      "cta button copy generator",
      "button label",
      "call to action",
      "weak verbs",
    ],
    intro:
      "The CTA Button Copy Generator builds five button-label variants from a verb, an object and a benefit, then checks the wording a button cannot afford.",
    content:
      "A button label is the smallest copy on a page and the only one the reader is asked to obey, and this cta button copy generator builds five candidates from three fields. Give it a verb, the object of the click and the benefit behind it; it returns the label alone, the label with the benefit, a sentence-length variant, a next-step framing and a question that hands the choice back. The wording is yours; the tool arranges it. However the variants are phrased, the label stays a call to action — the words a reader must obey to get what the page promised.\n\nThe click panel holds the three inputs. The variants panel lists the five labels with their word counts, each copyable on its own. The checks panel names what a button cannot afford: no verb, no object, no benefit, or a verb that asks for effort rather than offering a reward — submit, click, send, read, view and continue are called out by name. Scope and limits says what the generator does not know about the offer.\n\n- Verb: what the reader does — download, start, get, save.\n- Object: what the click gets — the template, the checklist, the trial.\n- Benefit: what changes after the click, in the reader's terms.\n- Five variants: label alone, label plus benefit, an em-dash sentence, a Your next step framing, and a Ready to question.\n- Word counts beside every variant, because a button that needs a second line is not a button.\n- Checks for missing parts and for the six weak verbs.\n\nThe engine is string composition against five fixed patterns, and the checks are a small vocabulary test: the weak-verb list is published, the benefit is stripped of a leading to or and so the label reads as a command rather than a fragment, and the capitalisation of the sentence variants is handled in the pattern. Nothing about your offer is inferred, and no variant is ranked — the ordering is fixed and visible.\n\n- Five variants from three fields is a small space; the right label may need a fourth idea you write yourself.\n- The weak-verb list is a fixed six; a verb that is weak for your audience but absent from the list passes.\n- No claim in the benefit is checked — the tool cannot know whether the promise is true.\n- Word counts come from the shared tokenizer; hyphenated words count as several.\n- Nothing is stored, so copy the variant you pick before leaving the page.\n\nThe useful test is reading the variants against the object: a label whose object is vague — learn more, get started — fails the check in spirit even when it passes in form. Fill the benefit last and watch the sentence variants; the moment the label can be read without the benefit, the benefit is decoration. Then check that the destination the button points at still matches the promise, which no tool on this page can do. A button is a promise with a short memory, and the page behind it has to keep the words the label chose.\n\nThe neighbours finish the click: the Landing Page Copy Builder places the button as the page's next step, the Value Proposition Builder writes the promise the label depends on, and the Headline Analyzer scores the line above it.",
    howTo: [
      { step: "Fill the verb, the object and the benefit." },
      { step: "Read the five variants and their word counts." },
      { step: "Work through the checks — missing parts and weak verbs." },
      { step: "Copy the label you pick and test it against the page's promise." },
    ],
    whenToUse:
      "Use the cta button copy generator when the click exists and only the label is undecided. The {{landing-page-copy-builder|Landing Page Copy Builder}} writes the page the button sits on, and the {{value-proposition-builder|Value Proposition Builder}} supplies the promise the label has to keep. When the click is on a product page, the {{product-launch-copy-builder|Product Launch Copy Builder}} frames the announcement around it, and the tagline generator in this domain covers the promise above the fold.",
    faqs: [
      {
        q: "Why are submit and click called weak verbs?",
        a: "They name the effort rather than the reward: submit and click describe what the reader does to the page, not what the reader gets. Download, start, get and save name the outcome, which is what the button is selling.",
      },
      {
        q: "What do the five variants change?",
        a: "Only the pattern. The first is the bare verb and object, the second adds the benefit, the third makes an em-dash sentence, the fourth frames the click as your next step, and the fifth turns the benefit into a question. The words stay yours.",
      },
      {
        q: "Which variant should I use?",
        a: "The tool does not rank them; the shortest variant that still carries the benefit is usually the safest, and the sentence-length variants are for buttons with room for a second line. Read them against the object before choosing.",
      },
      {
        q: "Can I use a verb that is not in the checks?",
        a: "Yes. The weak-verb list is six published entries, not a rule; a verb outside it passes the check even if it is weak for your audience, which is a limit the scope panel states.",
      },
      {
        q: "Does the generator save my variants?",
        a: "No. Everything runs in the page, nothing is stored, and the variants are gone when the tab closes unless you copy the one you picked.",
      },
    ],
  },

  "tagline-generator": {
    keywords: [
      "tagline generator",
      "brand promise",
      "slogan",
      "audience",
    ],
    intro:
      "The Tagline Generator composes five tagline patterns from a brand, a benefit and an audience, then checks the faults a tagline cannot carry.",
    content:
      "A tagline is one benefit said in one breath, and this tagline generator shows the same promise said five ways. Give it the brand, the benefit and the audience; it returns five patterns — the brand with the benefit as a statement, an em-dash pair, a for-audience construction, a helps construction, and a three-part sign-off — each with its word count beside it.\n\nThe promise panel holds the three fields. The taglines panel lists the five candidates, each copyable, and the checks panel names the faults a tagline cannot carry: no brand, no benefit, no audience, a candidate past ten words, and a benefit that contains and, which usually means two benefits fighting for one line. Scope and limits says what the generator does not know about the brand. Every pattern is built to carry the brand promise in one breath, because a promise that needs a second breath is a paragraph wearing a tagline's clothes.\n\n- Brand: the name the tagline has to hold, without which it is a slogan for anyone.\n- Benefit: one thing the reader gets, phrased as an outcome rather than an activity.\n- Audience: who the line is for; knowing who it excludes is half of what a tagline says.\n- Five patterns: statement, em-dash, for-audience, helps, and the three-part sign-off.\n- Word counts: a tagline that needs a second breath is a sentence.\n- Checks: missing fields, length and the and test.\n\nThe engine is fixed string composition: the benefit is stripped of its closing period, capitalised where a pattern needs it, and placed into one of five published templates. The audience is only used by the three patterns that need it, and the checks are arithmetic on the fields — presence, word count, and the word and inside the benefit. Nothing is scored or ranked, and no brand knowledge is applied.\n\n- Five patterns is a small space; a tagline that needs a different shape must be written by hand.\n- The and test is a heuristic: a benefit can contain and and still be one idea.\n- No trademark or similarity check runs — the line may echo an existing slogan.\n- The audience field is free text; the tool cannot judge whether the exclusion is deliberate.\n- Nothing is stored, so copy the candidate before leaving the page.\n\nThe discipline the patterns teach is subtraction: write the benefit as a sentence first, then cut until only the outcome is left, then read the five patterns and keep the one that survives being said out loud. A tagline that needs the audience field to make sense is usually a positioning statement wearing a slogan's clothes, and the value proposition builder is where it belongs. Test the finalists in the places the line will actually live — a signature block, a slide footer, the end of a podcast read — because a tagline that only works on the page it was written on has not been tested at all.\n\nThe neighbours work the same promise at other lengths: the Value Proposition Builder writes the paragraph the tagline compresses, the Headline Analyzer scores a headline's mechanics, and the Brand Voice Guide Builder keeps the wording in voice. When the tagline launches with a product, the Product Launch Copy Builder frames the announcement, and the CTA button copy generator in this domain writes the click beneath it.",
    howTo: [
      { step: "Fill the brand, the benefit and the audience." },
      { step: "Read the five tagline patterns and their word counts." },
      { step: "Work through the checks — missing fields, length, the and test." },
      { step: "Copy the candidate that survives being said aloud." },
    ],
    whenToUse:
      "Use the tagline generator when the promise is settled and only its shortest form is undecided. The {{value-proposition-builder|Value Proposition Builder}} writes the paragraph the tagline compresses, and the {{brand-voice-guide-builder|Brand Voice Guide Builder}} records the voice the line has to stay inside. When the line is for a launch, the {{product-launch-copy-builder|Product Launch Copy Builder}} frames the announcement, and the headline analyzer in this domain scores the longer line above it.",
    faqs: [
      {
        q: "How many taglines does the generator produce?",
        a: "Five patterns when all three fields are filled, and fewer when the audience is missing — three patterns use it and two do not. The word count beside each candidate tells you which are short enough to say.",
      },
      {
        q: "Why is and a problem in the benefit?",
        a: "Because a benefit with and is usually two benefits, and a tagline can only carry one. The check names the word rather than cutting it; the choice of which half survives is the writer's.",
      },
      {
        q: "Can a tagline be longer than ten words?",
        a: "It can, but the check flags it: past ten words the line needs a second breath and reads as a sentence. The five patterns are built to stay under the limit.",
      },
      {
        q: "Does the generator check whether my tagline already exists?",
        a: "No. There is no trademark or slogan database behind it, so a candidate that echoes an existing line passes every check. A similarity search is a separate job.",
      },
      {
        q: "Is my brand name stored?",
        a: "No. The patterns are composed in the page from the fields you typed; nothing is stored or transmitted, and closing the tab discards the candidates unless you copied them.",
      },
    ],
  },

  "email-subject-line-tester": {
    keywords: [
      "email subject line tester",
      "spam words",
      "subject line length",
      "inbox",
    ],
    intro:
      "The Email Subject Line Tester scores a subject line against the mechanical faults inboxes punish — length, spam vocabulary, shouting and stacked exclamation marks.",
    content:
      "A subject line is a headline with a harsher reader, and this email subject line tester scores yours against the faults inboxes punish. Paste a line and it grades it out of a hundred across five parts: length at fifty characters or fewer, no spam-trigger phrases, no ALL-CAPS words, at most one exclamation mark, and a number or personalisation token. The rubric is fixed and visible; it does not predict open rates, which depend on the list, the sender and the moment.\n\nThe subject line panel takes one line of text. The score panel breaks the total into the five parts with the points each earned, and the checks panel names the faults — the spam phrase that matched, the caps word that reads as shouting, the exclamation marks that stacked. How the score is built shows the exact weights; Scope and limits states what the rubric cannot know. The subject line length and the spam words that matched print beside the parts, so the rewrite starts from the named fault rather than the total.\n\n- Length: 30 points for fifty characters or fewer, 15 up to seventy, none past it.\n- No spam-trigger phrases: 25 points for a clean line, 10 for one match, none for two or more.\n- No ALL-CAPS words: 15 points, because one shouted word drags the line's tone.\n- At most one exclamation mark: 15 points.\n- Contains a number or personalisation: 15 points for a digit or a merge token.\n- Grade: Strong at 80, Workable at 55, Weak below.\n- Spam vocabulary: a published list from free and guarantee to act now and lowest price.\n\nThe analysis is arithmetic on the string: the spam list is a fixed thirteen phrases matched by substring, the caps test is a per-token uppercase comparison, and the exclamation count is a regex. The same tokenizer as the rest of the domain supplies the word count, and every point is awarded by a published condition. The score measures what the line contains, never how a list will respond to it.\n\n- The score is a rubric, not a forecast: open rates depend on the list, the sender and the moment.\n- The spam list is thirteen fixed phrases; a trigger outside it passes.\n- Personalisation is credited by token shape, not by whether the merge field will fill.\n- Length is measured in characters, not in the pixels of a preview pane.\n- Nothing is stored, so copy the line and the breakdown before leaving the page.\n\nRead the spam matches first: a line that scores 85 with one trigger phrase in it is a line that will earn the flag somewhere. Then check the length against your own inbox — fifty characters is the conservative band, and a preview that cuts at forty punishes lines the rubric passes. The number check is the quiet one: a subject line with a figure in it is specific, and specific is what survives a crowded inbox.\n\nThe neighbours split the same job: the Headline Analyzer scores the page headline with a parallel rubric, the Headline Rewriter trades the vocabulary once the faults are named, and the Social Post Caption Builder renders the same hook for social feeds. When the email announces a product, the Product Launch Copy Builder frames the announcement, and the microcopy library in this domain covers the interface copy.",
    howTo: [
      { step: "Paste the subject line into the subject line panel." },
      { step: "Read the score and the five parts that built it." },
      { step: "Work through the checks — spam matches, caps, exclamation marks." },
      { step: "Copy the line and test a variant against the same rubric." },
    ],
    whenToUse:
      "Use the email subject line tester when a subject line exists and the question is whether its mechanics hold. The {{headline-analyzer|Headline Analyzer}} applies the same kind of rubric to headlines, and the {{headline-rewriter|Headline Rewriter}} swaps the vocabulary once the faults are known. When the line carries a campaign, the {{social-post-caption-builder|Social Post Caption Builder}} renders it for feeds, and the product launch copy builder in this domain frames the announcement behind it.",
    faqs: [
      {
        q: "Which phrases does the spam check look for?",
        a: "Thirteen published phrases: free, guarantee, guaranteed, act now, limited time, risk-free, click here, urgent, winner, no obligation, buy now, lowest price and special promotion. The check matches them as substrings and names the ones that hit.",
      },
      {
        q: "Why is fifty characters the length target?",
        a: "It is the conservative band that survives the common preview pane on desktop and mobile. The rubric still gives partial credit up to seventy characters, but the check flags anything longer.",
      },
      {
        q: "Does the score predict my open rate?",
        a: "No. Open rates depend on the list, the sender, the subject and the moment; the rubric measures five mechanical habits and says nothing about response. It is a filter, not a forecast.",
      },
      {
        q: "What counts as personalisation?",
        a: "A merge token — a first name in curly braces — or any digit in the line earns the same points. The check looks at the token's shape, not at whether your platform will fill it.",
      },
      {
        q: "Where does my subject line go?",
        a: "Nowhere. The analysis runs in the page from the text you typed; nothing is stored or sent, and the line is gone when the tab closes unless you copied it.",
      },
    ],
  },

  "value-proposition-builder": {
    keywords: [
      "value proposition builder",
      "positioning statement",
      "alternative",
      "proof",
    ],
    intro:
      "The Value Proposition Builder assembles the one paragraph that names who a product is for, the need it answers, the benefit, the alternative it replaces and the proof.",
    content:
      "A value proposition is the one paragraph that says who a product is for, what it is, and what it replaces, and this value proposition builder assembles yours from seven fields. Supply the audience, the need, the brand, the category, the benefit, the alternative and the proof; the tool writes the two sentences — the positioning sentence and the contrast — and checks the shape of each part.\n\nThe pitch panel holds the seven inputs. The output is the assembled proposition with a word count, and the checks panel names what is missing or weak: no audience, no need, no category, a proof without a figure, an alternative with nothing on the other side. Scope and limits states the tool's one hard line — it assembles and checks, it cannot verify that the proof is true. What the checks can still do is push the paragraph toward a positioning statement — who it is for, what it is, what it replaces — instead of a slogan.\n\n- Audience: who the proposition is for, named by the situation they arrive in.\n- Need: what they are struggling with, phrased to attach to who.\n- Brand and category: the name and the shelf it sits on.\n- Benefit: what changes, in the reader's terms.\n- Alternative: the thing the product replaces — a competitor, a spreadsheet, a habit.\n- Proof: the evidence, ideally with a figure.\n- Checks: missing fields, thin fields and the contrast test.\n\nThe assembly is sentence composition against two published patterns: For the audience who need it, the brand is a category that benefits. Unlike the alternative, the proof. The article before the category is chosen by a vowel test, the proof is capitalised and punctuated into a sentence, and the whole proposition is joined from the parts. When the audience or the need is missing, the pattern degrades to the brand-and-benefit form rather than inventing one, and the checks say so.\n\n- The sentence patterns are fixed; a proposition that needs a different shape must be written by hand.\n- Proof is checked for a figure but never for truth — the tool cannot audit a claim.\n- The alternative is a free field; the tool has no competitor database and makes no comparisons.\n- Word count comes from the shared tokenizer and is not a length limit.\n- Nothing is stored, so copy the proposition before leaving the page.\n\nThe order that works is audience, need, alternative, proof, then the benefit last: the benefit reads as a conclusion when the first four fields are concrete, and as a slogan when they are not. Then read the proposition aloud — the positioning sentence should sound like something a customer would repeat, and the contrast sentence should name a thing the customer already knows. If the contrast is a straw man, the proof will not save it. Revisit the paragraph when the product changes: a proposition is a living sentence, and one written for last year's audience describes a product that no longer exists.\n\nThe neighbours hold the parts: the Landing Page Copy Builder carries the proposition onto a page, the Tagline Generator compresses it into a phrase, and the CTA Button Copy Generator writes the click at the end of it. When the proposition is for a launch, the Product Launch Copy Builder frames the announcement, and the brand voice guide builder in this domain keeps the wording in voice.",
    howTo: [
      { step: "Fill the seven fields: audience, need, brand, category, benefit, alternative and proof." },
      { step: "Read the assembled proposition and its word count." },
      { step: "Work through the checks — missing fields, thin proof, the contrast test." },
      { step: "Copy the proposition and read it aloud once." },
    ],
    whenToUse:
      "Use the value proposition builder when the pitch exists in fragments and needs one paragraph. The {{tagline-generator|Tagline Generator}} compresses the same promise into a phrase, and the {{landing-page-copy-builder|Landing Page Copy Builder}} expands it into a page. When the audience is a market rather than a person, the {{brand-voice-guide-builder|Brand Voice Guide Builder}} keeps the wording consistent, and the case study template in this domain supplies the proof the proposition promises.",
    faqs: [
      {
        q: "What is the alternative field for?",
        a: "It names what the product replaces — a competitor, a spreadsheet, a habit — so the proposition can say unlike this, that. A proposition with no alternative has nothing to be better than, and the check flags it.",
      },
      {
        q: "Does the proof need a number?",
        a: "The check looks for a figure because numbers are harder to wave away, but a named result or a customer count works too. What the tool cannot do is verify the claim, and the scope panel says so.",
      },
      {
        q: "Why are there two sentences?",
        a: "The first positions — for whom, what it is, what it does. The second contrasts — unlike what, proven how. Together they answer the two questions a reader asks, and the tool assembles both from the same fields.",
      },
      {
        q: "Can I use it for a service rather than a product?",
        a: "Yes. The category field takes any shelf — a consultancy, a course, a service — and the sentence pattern is unchanged. Only the alternative and proof fields change meaning.",
      },
      {
        q: "Does the builder keep my fields?",
        a: "No. The proposition is assembled in the page from what you typed; nothing is stored or sent anywhere, and the fields are gone when the tab closes.",
      },
    ],
  },
};
