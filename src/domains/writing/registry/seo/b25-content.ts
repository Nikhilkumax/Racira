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
    keywords: ["sales page", "long-form", "objections", "proof", "call to action"],
    intro:
      "The sales page copywriting tool assembles the nine blocks of a long-form sales page from your own facts and checks each one, from the promise through the answered objections to the close.",
    content: `The sales page copywriting tool starts from the structure rather than the copy, because structure is what a long-form sales page is. The nine blocks — promise, problem, mechanism, benefits, proof, offer, guarantee, objections and close — are in that order for a reason: each answers the question the previous one raises. A reader who accepts the promise wants to know why the problem exists; a reader who accepts the mechanism wants to know what changes. The builder asks for each block in turn and assembles what you write into a page.

The problem block is the one most often skipped and the one that decides the reading. A page that opens with the product asks the reader to supply the reason to care, and most will not. Writing the problem means describing the situation the reader is already in, in their words, before the product appears. The builder checks for it and says plainly what its absence costs.

The mechanism is the second structural block. Without it the page claims an outcome without saying how it happens, and a claim with no mechanism is unverifiable by construction. The mechanism does not need to be technical; it needs to be specific enough that the reader can picture the thing working. Benefits come after, three to five of them, because that is the number a reader holds in mind while scanning.

Proof is checked for a number, since a counted result is the only proof a reader can weigh. The offer and the guarantee follow: what the reader gets, at what price, and the risk reversal that answers the last hesitation. Objections come next, and the builder asks for the three common ones — price, effort, and whether it works for the reader's case — each with its answer written out. An objection left to be argued in the reader's head is argued by the reader, and the reader usually wins.

The close is measured. One action, stated once, in a dozen words or fewer; a close that has become a paragraph is asking the reader to find the instruction inside it. The whole page is checked against claiming words such as revolutionary and effortless, which are flagged when no fact anywhere on the page supports them.

What the builder cannot do is write the copy or verify a claim. It cannot tell whether the promise is true, whether the proof is representative, or whether the price is fair. It assembles your text in the order a reader reads it and names the blocks that are missing or doing less work than they should. A well-ordered page with a false promise is still a false promise, and the page says so rather than implying otherwise.

Read the assembled page aloud before publishing. Blocks that looked complete on the form often repeat themselves next to each other, and the repetition is easiest to hear. The builder keeps the order fixed so this read-through has a shape: promise, problem, mechanism, benefits, proof, offer, guarantee, objections, call to action. If a block can be removed without the next one losing its footing, the page is longer than its argument.

One more discipline: keep the language of the promise in the language of the close. A promise about time saved and a close about features sends the reader back to re-read rather than forward to act. The checks cannot match vocabulary for you, but the two blocks sit at the top and the bottom of the same page, and the comparison takes a minute.`,
    howTo: [
      { step: "Write the promise as one sentence a reader could repeat." },
      { step: "Describe the problem before the product appears, in the reader's words." },
      { step: "Explain the mechanism in plain language, then list three to five benefits." },
      { step: "Add proof with at least one number, then the offer and the guarantee." },
      { step: "Answer three objections and close with one action under a dozen words." },
    ],
    whenToUse: `Use the sales page copywriting tool when a long-form page is being drafted or rewritten and the argument needs checking block by block: a product launch, a course page, a service page that carries a high price. It is most useful before the copy is polished, because a missing block is cheap to fix and expensive to discover after publication.
The blocks pair with the {{product-description-writer|Product Description Writer}} for the catalogue version of the same facts, with the {{cta-button-copy-generator|CTA Button Copy Generator}} for the button the close points at, and with the {{landing-page-copy-builder|Landing Page Copy Builder}} when a shorter page has to carry the same argument.`,
    faqs: [
      {
        q: "Why does the problem block come before the product?",
        a: "Because a reader who does not recognise the problem has no reason to read about the solution. Describing the situation first, in the reader's words, is what earns the next paragraph.",
      },
      {
        q: "What counts as a mechanism?",
        a: "The specific way the outcome is produced: the process, the material, the method, the sequence. It does not need to be technical, but a claim with no mechanism cannot be checked by the reader and is discounted accordingly.",
      },
      {
        q: "How many objections should a sales page answer?",
        a: "Three is the working minimum, and they are predictably price, effort and whether it works for the reader's case. Answering them on the page is better than leaving a skimmer to answer them privately.",
      },
      {
        q: "Why does the close have a length limit?",
        a: "Because a close is an instruction rather than a paragraph. Past a dozen words the reader has to find the action inside the sentence, and the ones who scan will miss it entirely.",
      },
      {
        q: "Does the tool write the sales copy?",
        a: "No. Every sentence is yours. The builder asks for each block, assembles them in order, and checks the ones a skimmer reads — the promise, the proof, the offer, the guarantee and the close.",
      },
    ],
  },

  "testimonial-formatter": {
    keywords: ["testimonial", "attribution", "pull quote", "carousel", "quote"],
    intro:
      "The testimonial formatter turns a list of quotes into a wall, a carousel selection and a pull quote at once, and names the attribution, length and specificity problems that make testimonials read as decoration.",
    content: `The testimonial formatter takes one testimonial per line — quote, name and role separated by pipes — and does three jobs at once. It attributes, because a quote without a name beside it is an assertion rather than a testimonial. It measures, because a quote past fifty words stops being read and one under twenty is ready for a slide. And it grades specificity, because the phrases every business collects describe nothing a reader can weigh.

Attribution is the first check for a reason. A testimonial's power comes from the reader recognising a person and a context: a name, a role, a company. When the name is missing, the reader is asked to take the business's word for what a customer said, which is exactly what a testimonial exists to avoid. The formatter marks unattributed quotes in the wall output and counts them in the checks.

Length is the second. Long testimonials are usually two testimonials: the story and the result. The formatter keeps the whole quote in the wall and identifies the short, specific line for the carousel, because a slide has a few seconds and a sentence. A set with no quote under twenty words is flagged, since the carousel has nothing to lead with and will end up truncating mid-clause.

Specificity is the third and most useful check. Phrases such as great service and highly recommend appear in almost every collected testimonial, and they could describe any business in any industry. The formatter lists the offending quotes so the business can go back and ask for the specific before-and-after instead. A set where no testimonial names a number or a result is flagged as a whole, because one counted outcome is worth several enthusiastic sentences.

The wall output, the carousel selection and the pull quote are produced from the same parse, so the three artefacts stay consistent with each other. The pull quote is taken from the longest attributed line under the length limit — the one with enough texture to stand alone. Everything is copyable and downloadable as plain text.

What the formatter cannot do is verify that a testimonial is genuine or that the person gave permission. Testimonials are claims the business publishes, and keeping the written permission for each name is the business's job rather than the tool's. It formats, attributes and grades, and the page says so.

Ask for the specific when you ask for the testimonial, not after. A request that invites detail — what changed, what you tried before, what you would tell a friend — collects lines with a before-and-after in them, which is what the specificity check is looking for. Requests for a quick quote collect the phrase the formatter then flags.

Keep the roles short and real. A name with a role reads as a person; a paragraph of credentials reads as a press release, and the reader stops at the attribution line rather than the quote. Company and city are usually enough, and anything longer belongs in the case study the quote links to.

Finally, vary the openings. Testimonials collected over a year tend to begin the same way — with praise — and a wall of six identical openings reads as one voice even when six people are speaking. Leading with the result instead of the thanks fixes most of it.`,
    howTo: [
      { step: "Paste one testimonial per line as quote, name and role, separated by pipes." },
      { step: "Read the wall output and fix any quote marked unattributed." },
      { step: "Cut quotes over fifty words to the sentence that carries the result." },
      { step: "Use the carousel selection for the slides and the pull quote for the header." },
      { step: "Clear the specificity checks by asking customers for the before and after." },
    ],
    whenToUse: `Use the testimonial formatter when testimonials have been collected and now need to appear somewhere: a homepage wall, a carousel, a proposal, a case study. It is most useful when the quotes have grown long and vague in the inbox, because the checks make both problems visible in one pass.
The formatted set slots into the {{about-page-builder|About Page Builder}} as its proof section and into the {{case-study-template|Case Study Template}} as the customer voice. When the testimonials need names and roles verified against a contact record, that stays a manual step.`,
    faqs: [
      {
        q: "Why is attribution the first check?",
        a: "Because a quote without a name is the business vouching for itself. The reader needs a person and a context to weigh the words, and the formatter marks any line that arrives without one.",
      },
      {
        q: "What makes a quote slide-ready?",
        a: "Twenty words or fewer and a named source. A slide is read in a few seconds, and a longer quote forces a truncation that usually cuts the specific detail the slide was chosen for.",
      },
      {
        q: "Why flag phrases like highly recommend?",
        a: "Not because they are insincere, but because they could describe any business. The formatter asks for the specific before-and-after, which is the part a reader can actually weigh.",
      },
      {
        q: "How do I choose the pull quote?",
        a: "The formatter takes the longest attributed quote under the length limit, on the reasoning that the fuller line has more texture. Override it freely if another quote carries the result more clearly.",
      },
      {
        q: "Does the formatter check permission to publish?",
        a: "No. It cannot know what a customer agreed to. Keep the written permission for each name on file and remove any quote on request; the formatting is the easy part.",
      },
    ],
  },

  "brand-voice-guide-builder": {
    keywords: ["brand voice", "voice attributes", "say list", "sample paragraph", "register"],
    intro:
      "The brand voice guide builder documents three voice attributes with their practice, a say and do-not-say list, and a sample paragraph checked against the guide it is supposed to demonstrate.",
    content: `The brand voice guide builder writes a guide that a writer can actually use. Its unit is not the adjective but the attribute with its practice: "plain" becomes short sentences, kitchen words, no specification sheets. Three attributes is the working range, because a guide with eight is a mood board and a guide with one is a slogan. The builder asks for each attribute as a line with what it means in practice, and names any attribute that arrives without one.

The say list and the do-not-say list are where a guide becomes operational. The say list holds the constructions to reach for — the words the brand uses for its own things, the sentence shapes that come naturally. The do-not-say list holds the phrases that break the voice: jargon, borrowed prestige words, anything the brand has decided it is not. The builder checks the two lists against each other, because the same phrase on both is the quiet way a guide contradicts itself and gets ignored.

The sample paragraph is the test. Writers copy an example before they follow a description, so the guide asks for one paragraph in the voice and checks it against the guide it demonstrates. Banned phrasing in the sample is reported by name, and sentences past twenty-five words are counted — whatever the voice, a reader holds a sentence for one breath. A guide whose own sample fails its rules will not survive contact with a content calendar.

The register question sits underneath all of it. A voice is not a tone; the same voice can be formal in a contract summary and friendly in a launch note. What stays constant is the vocabulary, the sentence length and what the brand refuses to say. The builder keeps the guide to those constants rather than freezing a tone that will date.

The output is a one-page document: who the guide is written for, the three attributes with their practice, the two lists, and the checked sample. It is copyable and downloadable as plain text so it can live where writers actually work rather than in a slide deck nobody opens.

What the builder cannot do is tell whether the voice suits the audience or whether the sample is any good. It checks the guide's internal consistency and nothing more, and the page says so. A guide is judged by the copy written from it over the following year, not by the document itself.

Write the voice attributes where the work happens, then test them against real copy: a release note, an error message, a sales email. The guide is not finished until a writer can take an unfamiliar draft and say which attribute it breaks. If nothing breaks, the attributes are too broad to be useful, and the practice lines are the place to tighten them.

Version the guide and keep the changes visible. A voice shifts deliberately — a new audience, a new market, a change of leadership — and each shift deserves a dated line rather than a silent rewrite. When a writer asks why the old copy sounds different, the changes section answers before the conversation starts.`,
    howTo: [
      { step: "Name the brand and the reader the voice is written for." },
      { step: "Write three attributes, each with a line on what it means in practice." },
      { step: "Build the say list and the do-not-say list, checking they do not overlap." },
      { step: "Paste a sample paragraph and clear the banned-phrasing and length checks." },
      { step: "Copy the guide where writers work; the sample is the part they will copy." },
    ],
    whenToUse: `Use the brand voice guide builder when more than one person writes for the brand and the results are drifting: a small marketing team, a founder handing copy to a freelancer, an agency onboarding a client. It is most useful with a sample paragraph to hand, because the sample is what the guide is checked against.
The guide pairs with the {{email-template-library|Email Template Library}} for the recurring messages it governs and the {{social-post-caption-builder|Social Post Caption Builder}} for the channel where voice drifts fastest. When the guide has to sit inside a broader document, the {{about-page-builder|About Page Builder}} carries the public-facing version of the same facts.`,
    faqs: [
      {
        q: "How many voice attributes should a guide have?",
        a: "Three is the working range: enough to shape a sentence, few enough that a writer remembers them without the document open. More than five and the guide stops being applied.",
      },
      {
        q: "What makes an attribute usable?",
        a: "The practice line. Plain means short sentences and kitchen words; precise means the temperature rather than the adjective. An attribute with no practice line is a preference, not an instruction.",
      },
      {
        q: "Why check the sample paragraph?",
        a: "Because writers copy examples before they follow descriptions. If the sample uses a banned phrase or a sentence past twenty-five words, the guide contradicts itself in the one artefact people actually imitate.",
      },
      {
        q: "Is voice the same as tone?",
        a: "No. Tone flexes by situation — a launch note and a contract summary differ — while voice stays constant in vocabulary, sentence length and what the brand refuses to say. The guide documents the constants.",
      },
      {
        q: "Does the tool write the guide for me?",
        a: "No. It structures your attributes, lists and sample, and checks their consistency. The judgment about what the brand sounds like stays with the people who write it.",
      },
    ],
  },

  "microcopy-library": {
    keywords: ["microcopy", "button label", "empty state", "error message", "register"],
    intro:
      "The microcopy library drafts the twelve interface slots every product writes and rewrites — button labels, labels and helpers, empty states, loading, errors, confirmations and links — in the register you choose.",
    content: `The microcopy library starts from the action rather than the words. You name the product, the thing being acted on and what the reader is trying to do — create a report, book a fitting, start a trial — and the library drafts the twelve slots that cause the most support tickets: the primary button, the secondary button, the field label and its helper text, the empty state title and body, the loading state, the error message, the success message, the destructive confirmation, the link text and the permission prompt.

The register is the second input. Neutral, friendly and formal each change the vocabulary and rhythm of the drafts without changing what they say: the friendly error suggests another go, the formal one offers the support route, the neutral one simply states what happened. Drafting all twelve in one register is what makes an interface feel written rather than assembled from three people's habits. The library returns the slots as labelled lines so the whole set can be compared at a glance.

The checks apply the published guidance. A button label past four words stops being a button and becomes a sentence; the reader scans rather than reads it. The word invalid is flagged because it tells the reader they are wrong rather than what the form needs. An exclamation mark is flagged because in a confirmation it is noise and in an error it is tone-deaf. A short list of interface jargon — leverage, utilize, seamless — is checked across the output and your own wording, because at a glance every unfamiliar word costs the glance.

The empty state is treated as a slot rather than an afterthought. It names what is absent and what will appear there once the reader acts, which is the difference between an interface that feels broken and one that feels ready. The permission prompt carries the same discipline: what is being asked, and how to change it later.

The error message is the slot worth the most attention. It says what failed, avoids blaming the reader, and offers the next step — try again, check the connection, contact support — in one or two sentences. The library drafts it from the action so the message names what the reader was doing, which is what makes an error actionable rather than merely apologetic.

What the library cannot do is know your error cases, your permissions or your brand's exceptions. The drafts are starting points for a voice that a product team then owns, and the checks are published guidance rather than rules. Copy the set into your design system and edit in place.

Audit the shipped interface against the set once it exists. Collected screenshots of empty states, errors and confirmations are usually more honest than the design file, and comparing them with the library shows which slots drifted. The drift is predictable: errors written under time pressure, empty states inherited from a template, buttons renamed by feature teams.

Keep the set short enough to remember. Twelve slots are the ones that repeat across an interface; a product with a hundred screens has a hundred sentences, and the library governs the shapes rather than the vocabulary alone. When a new slot appears — a survey prompt, an inline hint — draft it in the same register and add it to the set.`,
    howTo: [
      { step: "Name the product, the object and the action the reader is trying to take." },
      { step: "Choose the register the interface is written in and keep it consistent." },
      { step: "Read the twelve slots and edit the drafts into your product's own voice." },
      { step: "Clear the checks: short button labels, no blaming wording, no jargon." },
      { step: "Copy the set into the design system next to the components it labels." },
    ],
    whenToUse: `Use the microcopy library when an interface is being built or audited and the copy has to be consistent: a first release, a settings screen that has grown by accretion, a design system that needs the twelve slots documented. It is most useful before engineering writes placeholder text that ships.
The same voice shows up in the {{email-template-library|Email Template Library}} for the messages the interface sends and in the {{faq-generator|FAQ Generator}} for the questions the interface raises. When the product needs its public explanation written, the {{about-page-builder|About Page Builder}} carries the longer version of the same claims.`,
    faqs: [
      {
        q: "What are the twelve slots?",
        a: "The primary and secondary buttons, the field label and helper text, the empty state title and body, the loading state, the error message, the success message, the destructive confirmation, the link text and the permission prompt.",
      },
      {
        q: "Why cap a button label at four words?",
        a: "Because a button is scanned rather than read. Past four words it becomes a sentence the reader has to parse, and on a phone the label wraps or truncates at the moment it matters most.",
      },
      {
        q: "Why is invalid a flagged word?",
        a: "Because it tells the reader they are wrong rather than what the form needs. Say what is required and why — enter a date after today — and the reader can fix it without guessing.",
      },
      {
        q: "What makes an empty state good?",
        a: "It names what is absent and what will appear there once the reader acts. That turns a blank panel from a dead end into the first step, and the library drafts both the title and the body.",
      },
      {
        q: "Can I mix registers across a product?",
        a: "You can, but it reads as three different authors. The library drafts all twelve slots in one register so the interface stays in character; the checks warn when a formal register slips into contractions.",
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
