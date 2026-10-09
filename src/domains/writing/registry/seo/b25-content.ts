import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B25, content and marketing: authored SEO entries for the sales page
 * copywriting tool, the testimonial formatter, the brand voice guide builder,
 * the microcopy library and the privacy policy template.
 *
 * The shared line in this batch is that the structure is the advice. A sales
 * page is checked block by block, a testimonial by attribution and length, a
 * voice guide by its sample, microcopy by its register, a privacy notice by the
 * pairs that make it complete. Keys are registry slugs; see ../tool-seo.ts for
 * the contract.
 */
export const B25_CONTENT_SEO: Record<string, ToolSeo> = {
  "sales-page-copywriting-tool": {
    keywords: [
      "sales page copywriting tool",
      "long-form sales page",
      "guarantee",
      "objections",
    ],
    intro:
      "The Sales Page Copywriting Tool assembles the nine blocks of a long-form sales page in their settled order and checks the blocks a skimmer reads.",
    content:
      "Long-form sales copy has a settled order because each block answers the question the previous one raises, and this sales page copywriting tool assembles yours in that order. Fill the fields — promise, problem, mechanism, benefits, proof, offer, guarantee, objections and close — and the builder stacks the nine blocks, then checks the ones a skimmer reads: a proof without a figure, an offer that is not concrete, a guarantee with no terms, a close with no next step. The nine blocks are the long-form sales page shape; an argument that fits in six blocks belongs to the landing page builder instead.\n\nThe product and the promise panel holds the opening fields; the case panel takes the problem, the mechanism, the benefits and the proof; the close panel takes the offer, the guarantee, the objections and the final call. The checks panel names what is thin — a proof line without a number, fewer than three objections answered, a claiming word like revolutionary or instant standing without a fact beside it. Scope and limits states that the builder cannot verify a claim.\n\n- Nine blocks: the promise, the problem, why this works, what changes, proof, the offer, the guarantee, objections answered, the close.\n- Benefits and proof: one per line, so the blocks can be counted and joined.\n- Objections: written as objection | answer, one pair per line.\n- Claiming words: a published list — revolutionary, game-changing, world-class, best-in-class, ultimate, unbeatable, effortless, instant — flagged when they stand alone.\n- Stats: words, benefits, objections and proof lines, counted as you type.\n- Checks: the promise, the proof with a figure, the offer, the guarantee and the close.\n\nThe assembly is block composition in the published order: each field is cleaned, benefit and proof lines are stripped of their bullets, objections are split on the pipe into question and answer, and the blocks are joined with their labels. The checks are arithmetic — a count of objections, a regex for a digit in the proof — and the claiming-word scan is a fixed list. No copy is written and no claim is verified.\n\n- The nine-block order is fixed; a page that needs a different argument is out of scope.\n- The proof check looks for a figure, not for truth.\n- Objections must use the pipe separator; a prose objection is treated as one line.\n- The claiming-word list is eight entries; a hype word outside it passes.\n- Nothing is stored, so copy the page before leaving it.\n\nWrite the objections first and the rest of the page organises itself: every objection names a fear the earlier blocks have to answer, and a page with no objections answered leaves the reader to argue with the page in their own head, where the reader wins. Then read the proof block — a proof line with a number in it is doing work, and one without is decoration. The checks panel is the last pass before you read the page aloud once.\n\nThe neighbours hold the page's parts: the Value Proposition Builder writes the one-sentence pitch the promise compresses, the Case Study Template supplies the proof block with figures, and the Testimonial Formatter formats the social proof. When the page sits behind a launch, the Product Launch Copy Builder writes the announcement, and the landing page copy builder in this domain shortens the same argument.",
    howTo: [
      { step: "Fill the promise and problem, then the mechanism, benefits and proof." },
      { step: "Add the offer, the guarantee and at least three objections with answers." },
      { step: "Write the close and read the assembled page top to bottom." },
      { step: "Work through the checks and copy the page." },
    ],
    whenToUse:
      "Use the sales page copywriting tool when the argument is long and the order matters. The {{case-study-template|Case Study Template}} writes the proof block the page depends on, and the {{testimonial-formatter|Testimonial Formatter}} turns quotes into social proof. When the page is short, the {{landing-page-copy-builder|Landing Page Copy Builder}} carries the same blocks in six, and the value proposition builder in this domain writes the one-sentence version.",
    faqs: [
      {
        q: "Why does the page have nine blocks?",
        a: "Because long-form sales copy has a settled order — promise, problem, mechanism, benefits, proof, offer, guarantee, objections, close — and each block answers the question the previous one raises. The builder enforces the order rather than inventing one.",
      },
      {
        q: "How should objections be written?",
        a: "One pair per line, as objection | answer. The pipe separates the reader's fear from your response, and the builder counts the pairs and flags a page with fewer than three answered.",
      },
      {
        q: "What are claiming words?",
        a: "Eight published words — revolutionary, game-changing, world-class, best-in-class, ultimate, unbeatable, effortless and instant — that claim a result without evidence. The check flags them when they stand without a fact beside them.",
      },
      {
        q: "Does the builder verify my proof?",
        a: "No. It looks for a figure in the proof block because numbers are harder to wave away, but it cannot audit the claim. The scope panel states that the copy and its truth are the writer's.",
      },
      {
        q: "Is the sales page saved anywhere?",
        a: "No. The assembly runs in the page from the fields you typed; nothing is stored or sent, and the draft is gone when the tab closes unless you copied it.",
      },
    ],
  },

  "testimonial-formatter": {
    keywords: [
      "testimonial formatter",
      "pull quote",
      "attribution",
      "social proof",
    ],
    intro:
      "The Testimonial Formatter formats quotes for a wall, a carousel and a pull quote at once, and names the weaknesses that make social proof decorative.",
    content:
      "Social proof fails in three ways — quotes with no name, quotes with nothing specific in them, and quotes too long to finish — and this testimonial formatter addresses all three. Paste one testimonial per line in the format quote | name | role, and the tool renders three outputs at once: the formatted wall, a slide-ready set of the short quotes, and a pull quote drawn from the strongest, while checking attribution, length and specificity.\n\nThe testimonials panel takes the lines. The formatted output and the slide-ready set are copyable on their own, the pull quote has its own panel, and the checks panel names the weaknesses: a quote with no name beside it is an assertion, not a testimonial; past fifty words a quote stops being read; under twenty it is slide-ready; and the phrases every business collects — great service, highly recommend, amazing, fantastic, five stars and the rest of the published ten — describe nothing a reader can weigh. Scope and limits states that the formatter cannot verify a testimonial is real.\n\n- Line format: quote | name | role, one testimonial per line.\n- Formatted wall: the full set, attributed and ordered.\n- Slide-ready set: quotes at twenty words or fewer.\n- Pull quote: the strongest short quote, chosen for specificity.\n- Counts: total, attributed, slide-ready and with a result in them.\n- Checks: missing names, length past fifty words, and the ten vague phrases.\n- Result detection: a quote with a figure in it is marked as carrying evidence.\n\nThe engine parses each line on the pipe, cleans the parts and measures the quote with the shared tokenizer. The slide-ready threshold and the long-quote threshold are published constants, the vague-phrase list is a fixed ten, and the pull-quote choice favours a quote with a number in it. Every judgement the formatter makes is a count or a lookup, and the panel says so.\n\n- The pipe format is required; a line without it is treated as an unattributed quote.\n- The vague-phrase list is ten entries; vague copy outside it passes.\n- Result detection is a digit test, not an understanding of the outcome.\n- The pull-quote choice is a rule, not an editorial judgement; the final pick is yours.\n- Nothing is stored, so copy each output before leaving the page.\n\nCurate before formatting: a set of twenty quotes is a haystack, and the tool's counts tell you which three are doing the work — the attributed ones, under twenty words, with a number in them. Delete the rest, then format. A wall of five specific quotes outperforms a carousel of thirty generic ones, and the specificity check is what shows you which is which. A quote that names a figure and a name is worth three that say great service, which is why the counts lead the checks.\n\nThe neighbours hold the proof around the quotes: the Case Study Template builds the longer evidence block, the Sales Page Copywriting Tool places the quotes in its proof section, and the Landing Page Copy Builder uses them in the page's proof block. When the quotes speak in the brand's voice, the Brand Voice Guide Builder keeps the surrounding copy consistent, and the microcopy library in this domain covers the interface.",
    howTo: [
      { step: "Paste one testimonial per line as quote | name | role." },
      { step: "Read the formatted wall and the counts." },
      { step: "Check the slide-ready set and the pull quote." },
      { step: "Work through the checks and copy each output you need." },
    ],
    whenToUse:
      "Use the testimonial formatter when quotes exist and the question is which ones carry evidence. The {{case-study-template|Case Study Template}} writes the longer proof block, and the {{sales-page-copywriting-tool|Sales Page Copywriting Tool}} places the set in a page's proof section. When the page is short, the {{landing-page-copy-builder|Landing Page Copy Builder}} carries the quotes into its proof block, and the brand voice guide builder in this domain keeps the surrounding wording in voice.",
    faqs: [
      {
        q: "What format do the testimonials need?",
        a: "One per line as quote | name | role, with the pipe separating the parts. The name and role are optional in the parse, but a quote without a name is flagged — an unattributed quote is an assertion rather than a testimonial.",
      },
      {
        q: "Why is fifty words the long-quote threshold?",
        a: "Past fifty words a quote stops being read inline, so the check flags it and suggests cutting. The slide-ready threshold is the other end: at twenty words or fewer a quote fits a carousel slide.",
      },
      {
        q: "What makes a quote specific?",
        a: "A result — a number, a duration, a before-and-after. The formatter marks quotes with a figure in them and flags the ten vague phrases, from great service to five stars, that describe nothing a reader can weigh.",
      },
      {
        q: "How is the pull quote chosen?",
        a: "By rule: the shortest quote that carries a result and an attribution wins, with the first qualifying quote breaking ties. It is a heuristic, not an editorial judgement, and the panel says so.",
      },
      {
        q: "Are my testimonials uploaded?",
        a: "No. The parsing and formatting run in the page from the text you pasted; nothing is stored or sent, and the outputs are gone when the tab closes unless you copied them.",
      },
    ],
  },

  "brand-voice-guide-builder": {
    keywords: [
      "brand voice guide builder",
      "voice attributes",
      "say list",
      "sample",
    ],
    intro:
      "The Brand Voice Guide Builder documents a brand's voice attributes with their practice, a say and do-not-say list, and a sample paragraph checked against the guide it demonstrates.",
    content:
      "A voice guide fails in one of two ways — it is too abstract to apply, or the brand's own copy contradicts it — and this brand voice guide builder addresses both. Document the reader, the voice attributes with a practice line each, the say list, the do-not-say list and a sample paragraph; the tool assembles the guide and checks the sample against it for banned terms, sentences a reader cannot hold in one breath, and the overlap between the two lists that quietly contradicts the guide.\n\nThe brand panel holds the fields. The guide output carries five sections — who we are writing for, voice attributes, we say, we do not say, and the example in voice — and is copyable as a whole. The checks panel names the contradictions: a banned term that appears in the sample, a sentence past the long-sentence threshold, and a word that appears in both the say and do-not-say lists. Scope and limits states that the builder cannot judge whether the voice is good, only whether it is consistent.\n\n- Reader: the audience named by the situation they arrive in.\n- Attributes: one per line as attribute | practice, so every attribute carries what it means in practice.\n- Say list: words and phrases the brand uses, one per line.\n- Do-not-say list: the banned terms, one per line.\n- Sample: a paragraph in the voice, checked against the guide.\n- Stats: attributes, say entries, do-not-say entries, sample words and long sentences.\n- Checks: banned terms in the sample, long sentences, and list overlap.\n\nThe engine parses the attribute lines on the pipe, strips bullets from the lists, and splits the sample into sentences with the shared tokenizer. The checks are lookups and thresholds: a banned term is a substring test, a long sentence is a word count, and the overlap is a set intersection between the two lists. No voice is judged and no copy is written.\n\n- The guide is only as specific as the practice lines; an attribute without one is abstract.\n- The long-sentence threshold is a word count, not a readability grade.\n- The overlap check compares exact words, not stems or synonyms.\n- The sample is one paragraph; a voice that shifts between channels is out of scope.\n- Nothing is stored, so copy the guide before leaving the page.\n\nWrite the do-not-say list first and the sample last: the bans are the easiest decisions and the sample is the test of whether the guide can be applied. Then read the attributes against the sample — an attribute whose practice line the sample ignores is either the wrong attribute or the wrong sample, and the overlap check is what catches the guide arguing with itself. Keep the guide short enough to remember: three attributes and two lists fit on one page, and a guide nobody can recite is a document rather than a voice. Revisit it when the sample stops sounding like the brand, which is the signal the guide has drifted from the copy.\n\nThe neighbours keep the voice applied: the Tagline Generator writes the shortest line in the voice, the Value Proposition Builder the pitch, and the Microcopy Library the interface copy. When the voice governs a page, the Landing Page Copy Builder carries it, and the testimonial formatter in this domain keeps the social proof in the same register.",
    howTo: [
      { step: "Name the reader and the voice attributes, one per line as attribute | practice." },
      { step: "Write the say list, the do-not-say list and a sample paragraph." },
      { step: "Read the assembled guide and its stats." },
      { step: "Work through the checks — banned terms, long sentences, list overlap — then copy the guide." },
    ],
    whenToUse:
      "Use the brand voice guide builder when the voice exists in people's heads and needs to be written down. The {{microcopy-library|Microcopy Library}} applies the guide to interface slots, and the {{tagline-generator|Tagline Generator}} compresses it into a line. When the voice governs a page, the {{landing-page-copy-builder|Landing Page Copy Builder}} carries it into the structure, and the value proposition builder in this domain states it in one sentence.",
    faqs: [
      {
        q: "What does the attribute | practice format do?",
        a: "It forces every attribute to carry a definition: warm | we greet the reader before we explain. An attribute without a practice line is abstract, and an abstract attribute is one no writer can apply.",
      },
      {
        q: "How does the guide check the sample?",
        a: "Three ways: banned terms from the do-not-say list found in the sample, sentences past the long-sentence word count, and words that appear in both the say and do-not-say lists, which is the quiet way a guide contradicts itself.",
      },
      {
        q: "How many attributes should a guide have?",
        a: "Three is the working number the guide is designed around — enough to describe a voice, few enough to remember. The builder does not enforce a count, but the stats line shows how many you wrote.",
      },
      {
        q: "Can I use it for a personal brand?",
        a: "Yes. The fields are the same — reader, attributes, lists, sample — and a personal voice is documented the same way. The guide does not assume an organisation.",
      },
      {
        q: "Does the builder judge my voice?",
        a: "No. It checks consistency, not quality: whether the sample obeys the lists and whether the lists agree with each other. Whether the voice is good is an editorial judgement the tool cannot make.",
      },
    ],
  },

  "microcopy-library": {
    keywords: [
      "microcopy library",
      "interface copy",
      "empty state",
      "error message",
    ],
    intro:
      "The Microcopy Library drafts the twelve interface slots in three registers — neutral, friendly or formal — and checks them against the published UX writing guidance.",
    content:
      "Interface copy is written in twelve slots and rewritten forever, and this microcopy library drafts all twelve at once. Give it the product, the action, the object and a register — neutral, friendly or formal — and it writes the primary and secondary buttons, the field label and its helper, the empty state title and body, the loading state, the error, the success message, the destructive confirmation, the link text and the permission prompt, each specific to what you typed rather than generic.\n\nThe product's action panel holds the four inputs. The library output lists the twelve slots with the situation each is used in, and is copyable as a whole. The checks panel applies the published guidance: a button label past four words stops being a button, the word invalid blames the reader for a form's failure, an exclamation mark in an error is tone-deaf, and a formal register that uses contractions contradicts itself. Scope and limits states what the library cannot know about the product.\n\n- Twelve slots: primary button, secondary button, field label, field helper, empty state title, empty state body, loading state, error message, success message, destructive confirmation, link text, permission prompt.\n- Registers: neutral, friendly and formal, chosen once for the whole set.\n- Product, action and object: the three fields that make the drafts specific.\n- Jargon list: leverage, utilize, seamless, robust, please note, in order to and prior to are flagged.\n- Checks: long button labels, the word invalid, exclamation marks, and contractions in the formal register.\n- Each slot names when it is used, so the drafts arrive in context.\n\nThe engine drafts each slot from published patterns that place the action and the object into the register's phrasing, and the register changes the wording rather than the structure. The checks are lookups — a jargon list, a word count on button labels, a contraction regex — and the guidance behind them is the published UX writing convention rather than a house opinion. No product knowledge is applied.\n\n- The twelve slots are a fixed set; a product with different surfaces needs copy written by hand.\n- The drafts are patterns with your nouns; they are starting points, not finished copy.\n- The jargon list is seven entries and the register rules are conventions, not laws.\n- The checks cannot judge whether the tone fits the product's audience.\n- Nothing is stored, so copy the library before leaving the page.\n\nStart with the error and the empty state, because they are the slots customers meet when something has gone wrong and the ones most often left as defaults. Then read the button labels against their objects: a primary button that says Submit is a slot nobody chose. The register is the last decision — write neutral, read it aloud, and move to friendly only if the product would greet a customer that way.\n\nThe neighbours keep the surrounding copy consistent: the Brand Voice Guide Builder documents the voice these slots have to obey, the CTA Button Copy Generator builds the marketing button rather than the interface one, and the Social Post Caption Builder renders the outward-facing version of the same message. When the interface copy announces a change, the Product Launch Copy Builder frames it, and the value proposition builder in this domain states the promise the interface has to keep.",
    howTo: [
      { step: "Fill the product, the action, the object and the register." },
      { step: "Read the twelve drafts with the situation each is used in." },
      { step: "Work through the checks — jargon, button length, error tone, register contradictions." },
      { step: "Copy the slots you need and edit them to the product's voice." },
    ],
    whenToUse:
      "Use the microcopy library when an interface needs its twelve slots drafted and the copy is still boilerplate. The {{brand-voice-guide-builder|Brand Voice Guide Builder}} documents the voice the slots must obey, and the {{cta-button-copy-generator|CTA Button Copy Generator}} covers the marketing button rather than the interface one. When the message goes outward, the {{social-post-caption-builder|Social Post Caption Builder}} renders it for feeds, and the product launch copy builder in this domain frames the announcement.",
    faqs: [
      {
        q: "What are the twelve slots?",
        a: "Primary button, secondary button, field label, field helper, empty state title, empty state body, loading state, error message, success message, destructive confirmation, link text and permission prompt — the slots that generate the most support tickets when they are left as defaults.",
      },
      {
        q: "What changes between the registers?",
        a: "The wording, not the structure: neutral states, friendly greets, formal withholds contractions. The drafts come from the same patterns, and the formal register's check flags any contraction that slips in.",
      },
      {
        q: "Why is invalid flagged?",
        a: "Because it blames the reader for the form's failure. The published guidance is to say what went wrong and how to fix it — Enter a date after today rather than Invalid date — and the check names the word when it appears.",
      },
      {
        q: "Why do button labels have a word limit?",
        a: "Four words is where a label stops being a button and becomes a sentence. The check counts the primary and secondary labels and flags anything longer, because a button that needs reading is a button that gets skipped.",
      },
      {
        q: "Is my interface copy saved?",
        a: "No. The drafts are assembled in the page from the fields you typed; nothing is stored or sent, and the library is gone when the tab closes unless you copied it.",
      },
    ],
  },

  "privacy-policy-template": {
    keywords: ["privacy policy", "personal data", "retention period", "legal basis", "data categories"],
    intro:
      "The privacy policy template assembles the sections a data-protection notice is read for and checks the pairings that make one complete: collection with purposes, purposes with a retention period, sharing with named recipients.",
    content: `The privacy policy template assembles a notice in the published order: who is responsible, what is collected, why, on what legal basis, who it is shared with, cookies, how long it is kept, your rights, transfers, marketing, children, automated decisions, changes and contact. Each section is built from your parameters, and the switches add the sections a service actually needs so the notice stays proportionate to what the product does.

The checks catch the pairings that make a notice incomplete in practice. Data categories with no purposes is the first: collecting personal data without naming why is the finding a regulator looks for, and a reader cannot judge a collection they cannot connect to a reason. Purposes with no retention period is the second, because indefinite storage is the thing readers check after they check what is collected. Sharing with no named recipients is the third — the section has to list processors and recipients, or state plainly that personal data is not sold or shared. Transfers without a home jurisdiction, cookies described without cookie data among the categories, and children's data without a minimum age close the set.

The rights section is always present, because it is the part a reader actually uses. It covers access, correction, deletion, portability, objection to processing based on legitimate interests, and withdrawal of consent, and it names the contact where requests arrive. The legal basis section follows the standard three: performance of a contract for the data needed to run the service, consent for marketing and optional features, and legitimate interests for security and improvement.

The switches are deliberate. Cookies, international transfers, marketing, children's data and automated decisions are each off by default, because a notice that claims more than the service does is as wrong as one that claims less. Turning marketing on adds the opt-out language; turning children's data on adds the minimum-age field and the check that demands it be filled.

The notice is a document rather than a page: copyable and downloadable as plain text, with the sections in the order a reader moves through them. The effective date and the changes section sit at the end, which is where a returning reader looks for what changed.

What the template cannot do is practise data-protection law. The rules differ by jurisdiction, mandatory wording varies, and the transfers, rights and children's sections are the ones a qualified adviser should review before publication. Treat the page as a first draft that has already asked the obvious questions and answered none of them incorrectly.

Write the notice from the product, not from a template library. The categories, purposes and recipients sections are facts about the service, and the exercise of filling them in is itself a check on how much data the product actually collects. Teams routinely discover a tracking script or an export nobody remembered; better in the draft than in a request.

Keep the effective date and a short history. When a reader asks what changed, a dated version list answers in one line; the changes section is otherwise a promise without evidence. A previous version kept on file is also the quickest way to answer a complaint about consent given under older wording.`,
    howTo: [
      { step: "Name the service, the operator, the contact and the jurisdiction." },
      { step: "List the data categories collected and one purpose for each." },
      { step: "Set the retention period and name the recipients or processors." },
      { step: "Turn on the switches the service needs — cookies, transfers, marketing, children, automated decisions." },
      { step: "Clear the checks, then have the draft reviewed before publication." },
    ],
    whenToUse: `Use the privacy policy template when a consumer-facing service needs a notice and the structure has to be right before the wording is: a new app, a subscription product, a site that has started collecting more than it used to. It is most useful before a lawyer sees the document, because the missing pairings do not need legal judgement to fix.
The commercial counterpart is the {{terms-of-service-template|Terms of Service Template}}, which shares the operator, contact and jurisdiction facts. The notices a policy change generates go out through the {{email-template-library|Email Template Library}}, and the questions readers ask about data show up in the {{faq-generator|FAQ Generator}}.`,
    faqs: [
      {
        q: "Which sections does the template cover?",
        a: "Responsibility, data categories, purposes, legal basis, sharing, cookies, retention, rights, transfers, marketing, children, automated decisions, changes and contact — with the optional ones behind switches.",
      },
      {
        q: "Why pair data categories with purposes?",
        a: "Because collection without a named purpose is the finding regulators look for first, and readers cannot judge a collection they cannot connect to a reason. The check refuses to let one arrive without the other.",
      },
      {
        q: "What does the legal basis section say?",
        a: "The standard three: performance of a contract for running the service, consent for marketing and optional features, and legitimate interests for security and improvement. Your counsel may describe them differently.",
      },
      {
        q: "Why are the switches off by default?",
        a: "Because a notice that claims more processing than the service actually does is as inaccurate as one that claims less. Turn on only the sections that describe what happens.",
      },
      {
        q: "Is the template legal advice?",
        a: "No. It is a structured first draft following the published section order. Data-protection law differs by jurisdiction, and the rights, transfers and children's sections should be reviewed by a qualified adviser.",
      },
    ],
  },
};
