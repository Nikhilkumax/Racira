import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B24, templates and generators: authored SEO entries for the About page
 * builder, the RFP response builder, the job description writer, the product
 * description writer and the terms of service template.
 *
 * Every entry draws the same line: these tools assemble the writer's own facts
 * into a published structure and apply the checks the relevant reader would
 * apply — an About page's proof, an evaluator's compliance matrix, an
 * applicant's pay question, a shopper's benefit pairing, a reader's governing
 * law. None of them writes the content or verifies the claims. Keys are
 * registry slugs; see ../tool-seo.ts for the contract.
 */
export const B24_TEMPLATES_SEO: Record<string, ToolSeo> = {
  "about-page-builder": {
    keywords: ["about page", "differentiator", "proof", "call to action", "conversion"],
    intro:
      "The About page builder assembles the six sections an About page needs — headline, offer, audience, proof, story and call to action — and applies the conversion checks a stranger's first visit depends on.",
    content: `The About page builder starts from six sections rather than a blank page: the headline, what the offer is, who it is for, the proof, the story and the call to action. Every section is assembled from your own facts, and an empty one is named rather than quietly omitted. The order matters more than it looks. A visitor arrives with a question, and the page answers it in the same sequence a conversation would: what is this, is it for me, can I believe it, and what happens if I click.

The proof section is where most About pages fail. A paragraph of adjectives carries no weight against a single number — a count of jobs completed, a rating across a stated number of reviews, a percentage that a customer can check. The builder asks for one item per line and checks specifically for a number, because a proof section without a number is a claim with better manners. Names and results work as well, and the lines are rendered as a list so a reader can scan them.

The differentiator is the second failure point. An offer says what the reader gets; a differentiator says why it is this business rather than the one down the road. Without it the page competes on price, because nothing else is on the table. The check names the absence rather than filling it in, since the reason has to be true. Filler words such as passionate, dedicated and world-class are listed for the same reason: they occupy the space a differentiator should take, and a reader has learned to skip them.

The we-to-you ratio is measured because it is easy to drift. A page about a company naturally accumulates we and our, and the check reports the counts when the page talks about itself three times more than it talks to the reader. The headline has its own length check, since a visitor reads it in a glance and a comma clause costs that glance. The call to action is checked because an About page that ends without saying what to do has wasted the attention it earned.

What the builder cannot do is verify anything. It does not know whether the numbers are accurate, whether the story is interesting, or whether the differentiator matters to the audience you named. It assembles your text in the published order and names what the reader will look for and fail to find.

The story section is the part readers skip and writers overwrite. Two or three sentences are enough: what made the work start, and why it matters now. A founding story that runs to five paragraphs competes with the proof for the same attention, and the proof is what the reader came for. Write the story last, once the offer and the differentiator are settled, because a story that explains the differentiator is doing two jobs at once.

If your conversion matters more than your history, read the page back in the order a stranger meets it: headline, offer, audience, proof, story, call to action. Any section that answers a question already answered is a section to cut. The builder keeps the six sections fixed so the comparison is possible; it does not measure whether the page converts, because that is what analytics are for.`,
    howTo: [
      { step: "Write the offer as a sentence a customer would recognise, not an internal description." },
      { step: "Name the audience by the situation they arrive in." },
      { step: "Add proof, one item per line, with at least one number." },
      { step: "State the differentiator and keep the we-to-you ratio in the reader's favour." },
      { step: "Clear the checks and end the page with one call to action." },
    ],
    whenToUse: `Use the About page builder when a site's About page is being written or rewritten and the reader's path through it needs checking. It is most useful when the page has grown by accretion, because the six sections force a decision about what the page is for.
The same facts feed the {{bio-generator|Bio Generator}} for a short byline, and the {{landing-page-copy-builder|Landing Page Copy Builder}} when the same offer has to work on a conversion page. For an announcement rather than a profile, the {{press-release-template|Press Release Template}} carries the news in its own shape.`,
    faqs: [
      {
        q: "What makes an About page different from a landing page?",
        a: "An About page answers who you are and why you can be trusted; a landing page drives one action for a specific offer. They share the proof and the call to action, which is why the builder checks those two hardest.",
      },
      {
        q: "Why does the proof section need a number?",
        a: "Because countable proof can be checked by the reader and adjectives cannot. A count, a rating across a stated number of reviews or a percentage of outcomes all work; a sentence about caring deeply does not.",
      },
      {
        q: "What counts as a differentiator?",
        a: "The reason a reader chooses you over the nearby alternative: a method, a guarantee, a specialism, a constraint you work around. If a competitor could paste the sentence onto their own page unchanged, it is not a differentiator.",
      },
      {
        q: "Why measure the we-to-you ratio?",
        a: "Because an About page is still read by someone deciding whether it is for them. When the page says we three times more often than it says you, it has become a company history rather than an answer.",
      },
      {
        q: "Does the builder write the About page?",
        a: "No. It assembles your six sections in the published order and applies the checks — proof with a number, a differentiator, a readable headline and one call to action. Every sentence remains yours.",
      },
    ],
  },

  "rfp-response-builder": {
    keywords: ["rfp response", "compliance matrix", "requirement", "evaluator", "deadline"],
    intro:
      "The RFP response builder numbers the client's requirements into a compliance matrix, pairs each with the answer you wrote, and checks the five sections an evaluator reads for.",
    content: `The RFP response builder leads with the compliance matrix because that is how the response is scored. Each requirement becomes a numbered line with its answer beside it, or a named gap where no answer exists. Evaluators score requirement by requirement, so a gap is not a rough edge in the prose, it is a point that cannot be awarded, and the matrix makes every one visible while there is still time to write the missing answer.

The five response sections are the ones most often found empty at review: understanding of the need, approach, team, past performance and pricing. Each gets its own check with the prompt it needs, and each prompt is drawn from what evaluators say they look for. Understanding restates the client's problem in their own terms, with the outcome they named. Approach says what will be done, in what order, and what the client sees at each stage. Team names who does the work and what each person has done that is like this. Past performance gives two or three comparable engagements with the result and a reference. Pricing states the number, what it includes and what would change it.

The deadline check is deliberately blunt, because submissions are lost to dates more often than to quality. The builder reports a deadline that has passed and asks for one when the field is empty. Duplicate requirement wording is flagged as well: a matrix with the same line twice looks padded, and the pair usually means the requirement was copied from two places in the RFP.

The requirement format is plain — the requirement, a pipe, and where it is answered — so pasting the client's own wording takes a minute. That matters, because paraphrasing a requirement is the quiet way to answer something the client did not ask. The matrix keeps their words, and your answer sits beside them where the evaluator will look.

What the builder cannot do is write the answers or know the scoring weights. Some calls weight price at a third, others treat past performance as a pass or fail gate; the response that wins under one weighting is not the one that wins under another. The builder makes sure nothing is missing and nothing is unaddressed, and the strategy stays with you.

Write the matrix before the sections, not after. Requirements answered across the document are easy to overstate, and the numbered list forces each answer to be named; starting from it also shows which of the five sections carries the most requirements, which is where the evaluator will read hardest. A response where pricing answers eight requirements and past performance answers two has already told you where its weakness is.

Keep the client's numbering if the RFP has one. Evaluators often work from a scoresheet that mirrors their own list, and a matrix that renumbers makes them translate. Where a requirement is answered by an attachment rather than a sentence, name the attachment; an evaluator who has to search for the answer may score it as absent even when it exists.`,
    howTo: [
      { step: "Paste the client's requirements verbatim, one per line, with a pipe after each." },
      { step: "Write where each requirement is answered, then clear the named gaps." },
      { step: "Draft the five sections in the order the evaluator scores them." },
      { step: "Set the deadline so the builder can tell you when it has passed." },
      { step: "Copy the matrix and the sections into the submission document." },
    ],
    whenToUse: `Use the RFP response builder when a formal call has a requirement list and a scoring rubric: public tenders, framework agreements, grant calls with numbered criteria. It is most useful in the first pass, because the matrix shows how much of the response already exists and how much is still a gap.
When the response needs deeper supporting documents, the {{proposal-template|Proposal Template}} scaffolds the commercial proposal and the {{case-study-template|Case Study Template}} structures the past-performance evidence. For the reporting the client will ask for afterwards, the {{technical-report-template|Technical Report Template}} assembles the findings.`,
    faqs: [
      {
        q: "Why does the matrix come before the prose?",
        a: "Because evaluators score requirement by requirement and a gap is a point that cannot be awarded. Seeing the gaps first changes what you write in the five sections rather than discovering them on the night before submission.",
      },
      {
        q: "Should I paste the requirements exactly?",
        a: "Yes. Paraphrasing a requirement is the quiet way to answer something the client did not ask, and the matrix keeps their wording beside your answer so a reviewer can check both at once.",
      },
      {
        q: "What if a requirement is answered across two sections?",
        a: "Name both in the answer field. The matrix is a pointer rather than a copy, and an evaluator who finds the answer in either place will score it; an evaluator who finds nothing will not.",
      },
      {
        q: "Why is a deadline that has passed reported so plainly?",
        a: "Because most losses in competitive calls are administrative. The check is a final warning, not a judgement, and it costs nothing to keep the date in one visible field.",
      },
      {
        q: "Does the builder score my response?",
        a: "No. It cannot know the evaluation weights or the client's priorities. It counts answered requirements and empty sections, which are the parts that are objective.",
      },
    ],
  },

  "job-description-writer": {
    keywords: ["job description", "coded language", "nice-to-have", "requirements list", "salary"],
    intro:
      "The job description writer assembles a posting from your lines and applies the published inclusive-hiring checks: coded language, an over-long requirements list, hidden pay and missing application instructions.",
    content: `The job description writer assembles the posting in the order a candidate reads it: the title, why the role exists, what they will do, what they bring, what is optional, the pay and location, and how to apply. Each section is your text in a fixed place, and the checks are the published inclusive-hiring guidance applied to that text rather than policy invented by the tool.

Coded language is the first check because it has the most evidence behind it. Words such as rockstar, ninja, guru and dominant are documented to narrow the applicant pool without improving the hire, and phrases such as work hard play hard and fast-paced signal a culture rather than a job. The check lists the words it found by name, so the fix is a rewrite of one line rather than a rewrite of the posting.

The requirements list is the second. A list that runs past a dozen items reads as a filter, and a list where nothing is marked nice-to-have tells a strong candidate that there is no route in unless they match every line, including the ones the last holder learned on the job. The builder counts the items, flags the long list and asks for the optional pair of everything that is genuinely optional. Salary is checked because postings without a range receive fewer and slower applications, and location and application instructions are checked because they are the two facts a candidate looks for before reading the rest.

The bullet checks are about the sentences themselves. A responsibility that opens with responsible for hides its verb; the fix is to write the work rather than the duty. A bullet past twenty-five words stops being scannable. Neither check rewrites anything — the lines are yours, and the flags name the ones to revisit.

What the builder cannot do is know the job. It cannot tell which requirements are genuinely required, or whether the salary range is competitive, or whether the culture described by a phrase is accurate. Those are decisions for the person doing the hiring, and the page says so rather than implying that a clean set of checks is a good posting.

The purpose paragraph is the part candidates quote back in interviews, so write it as the outcome rather than the activity. The role exists to make something specific true: the monthly decisions have numbers behind them, the backlog stops growing, the service passes its audit. A purpose that restates the title adds nothing, and the check asks for the paragraph because its absence is the first thing an applicant notices.

Postings also fail on the date. State the closing date and the expected start, because candidates plan around both and a posting without them collects speculative applications rather than applications. The writer leaves those to the application instructions line, where the route and the date sit together; the check fires when the line is empty. A posting that says how to apply but not by when leaves the decision open until it is made elsewhere.`,
    howTo: [
      { step: "Write the title a candidate would search for and the reason the role exists." },
      { step: "List the responsibilities, each opening with a verb." },
      { step: "Split the requirements list and move everything optional into nice-to-have." },
      { step: "State the salary or range, the location and the arrangement." },
      { step: "Clear the coded-language and bullet checks before posting." },
    ],
    whenToUse: `Use the job description writer when a role is being posted and the wording will decide who applies: a first hire, a role that has been hard to fill, a posting that has produced applicants who were all alike. The checks are the published consensus rather than house style, which makes them defensible in a hiring review.
The candidate-facing pair is the {{resume-writer|Resume Writer}} for a plain-text resume and the {{cover-letter-builder|Cover Letter Builder}} for the letter that answers the posting. When the role needs a formal brief rather than an advert, the {{technical-report-template|Technical Report Template}} carries the detail.`,
    faqs: [
      {
        q: "Why is coded language a problem if it describes us?",
        a: "Because the evidence is about who applies, not about who fits. Words such as rockstar and work hard play hard are documented to narrow the pool without improving the hire, and a narrower pool is a worse shortlist.",
      },
      {
        q: "How long should a requirements list be?",
        a: "Short enough that every line is genuinely required. Past roughly a dozen items a list reads as a filter, and the check asks you to move everything optional into the nice-to-have section instead.",
      },
      {
        q: "Why does the tool care about salary?",
        a: "Because postings without a range receive fewer and slower applications, and candidates filter on pay first. Stating a range is also the cheapest signal that the posting is serious.",
      },
      {
        q: "What counts as a weak responsibility line?",
        a: "One that opens with responsible for, duties include or in charge of. The work itself is the sentence: write what the person does, opening with the verb, and the duty disappears.",
      },
      {
        q: "Does the writer produce a legal job advert?",
        a: "No. It structures the posting and applies published wording guidance. Requirements that vary by jurisdiction, such as right-to-work statements or pay-transparency rules, stay with you and your advisers.",
      },
    ],
  },

  "product-description-writer": {
    keywords: ["product description", "feature", "benefit", "proof", "call to action"],
    intro:
      "The product description writer assembles a description in the order a shopper reads — hook, what it is, benefits, specs, proof, offer and call to action — and checks that every feature carries its benefit.",
    content: `The product description writer follows the order a shopper actually reads: a hook that says what the product is and who it is for, a short statement of the category, the benefits, the specs, the proof, the price and offer, and one call to action. Each section is assembled from your facts, and the checks are the commercial conventions that decide whether the shopper finishes reading.

The benefit pairing is the central check. A feature line names what the product has; the benefit names what that means for the buyer, and the two are written on one line separated by a pipe. Six temperature presets is a feature; brewing green tea at seventy degrees without a thermometer is the benefit. A description where features stand unpaired makes the shopper do the translation, and some will not bother. The builder counts the pairs and names the unpaired lines, and it asks for three to five benefits because that is the range a shopper will read.

Proof is the second check. A review count, a rating, a guarantee or a measured result gives the shopper something to weigh; without one the description carries only the seller's word. A proof line with a number is asked for specifically, because counted results are the ones people believe. The price is checked for the opposite reason: hiding it sends the shopper to find it elsewhere, and the shopper who leaves to compare rarely comes back.

The claiming words check is the honesty one. Premium, best-in-class, revolutionary and their relatives are not forbidden, but when they appear with no fact beside them they are the words shoppers have learned to discount. The check lists what it found and asks for a number or a comparison, or for the word to be dropped. The hook has a length check of its own, because it is a scan line rather than a paragraph.

What the builder cannot do is verify a claim, a review or a spec. It cannot tell whether the product is good, whether the price is fair or whether the benefit you paired with a feature is true. It assembles your text in the order a shopper reads and names the places where the words are doing less than they should.

The specs section does a different job from the benefits: it answers the comparison question. A shopper choosing between two products scans for the measurements, the materials and the compatibility, and a description without them sends that shopper to a review site. Keep specs factual and let the benefits carry the persuasion; mixing the two makes both weaker, and a spec padded with praise reads as a benefit that failed.

Write the call to action as the button will read. Add to basket, Book a fitting, Start the trial: one verb, one object, no encouragement. The same words appear on the page and in the store, so a description that ends with a paragraph about how much the product deserves to be bought is asking the shopper to write the button themselves. A single action repeated once converts better than three suggestions competing for the same click.`,
    howTo: [
      { step: "Name the product and the category in one hook line." },
      { step: "Pair every feature with the benefit it produces, one per line." },
      { step: "Add specs and at least one proof line with a number." },
      { step: "State the price and what the offer includes." },
      { step: "Clear the checks and finish with one call to action." },
    ],
    whenToUse: `Use the product description writer when a product page or marketplace listing is being written and the copy has to survive a two-second scan: a new listing, a rewrite that is not converting, a catalogue being migrated to a new store.
For the campaign around the listing, the {{ad-copy-framework-builder|Ad Copy Framework Builder}} structures the paid variants and the {{cta-button-copy-generator|CTA Button Copy Generator}} tests the button wording. When the product is launching rather than sitting in a catalogue, the {{product-launch-copy-builder|Product Launch Copy Builder}} sequences the announcement.`,
    faqs: [
      {
        q: "What is the difference between a feature and a benefit?",
        a: "A feature is what the product has; a benefit is what that means for the buyer. Pairing them on one line keeps the description specific, and the check names any feature left without its benefit.",
      },
      {
        q: "Why does the proof need a number?",
        a: "Because countable proof can be weighed. A rating across a stated number of reviews, a percentage of outcomes or a guarantee with a term all work; a sentence about quality alone does not.",
      },
      {
        q: "Is hiding the price ever right?",
        a: "Rarely on a product page. Hidden prices send shoppers elsewhere to compare, and the ones who leave rarely return. The check asks for the number rather than judging what it should be.",
      },
      {
        q: "Why flag words like premium and best-in-class?",
        a: "Not because they are forbidden, but because used without a fact beside them they are discounted on sight. The check asks for a number or a comparison, or for the claim to be dropped.",
      },
      {
        q: "How many benefits should a description carry?",
        a: "Three to five is the working range. Fewer reads as thin, more than five is a specification wearing benefit clothing, and the shopper stops reading before the price.",
      },
    ],
  },

  "terms-of-service-template": {
    keywords: ["terms of service", "governing law", "refund", "arbitration", "liability"],
    intro:
      "The terms of service template assembles the sections a consumer agreement is read for — acceptance through contact, in order — and names the blank fields and unpaired clauses before a lawyer has to.",
    content: `The terms of service template assembles an agreement in the published order: acceptance, eligibility, accounts, acceptable use, user content, payments and renewals, refunds, intellectual property, termination, disclaimers, limitation of liability, indemnity, dispute resolution, changes and contact. The switches add the sections a service actually needs, because a template that includes every clause produces an agreement nobody reads, and one that omits a clause produces a gap at the worst moment.

The checks catch two kinds of problem. The first is a blank field: no service name, no operator, no governing law, no effective date, no contact. These are the clauses an adviser asks about first, and each is cheap to fill and embarrassing to leave. The second kind is a broken pairing. Payments described without a refund or cancellation clause is the common one, because renewal and refund terms are read together by a customer deciding whether to subscribe. User content collected without a privacy policy address is another, since the data-handling reference has nowhere to point. Arbitration selected without a governing law is the third: an arbitration clause needs a seat, and the section says so rather than leaving the reader to guess.

The section text is drafted to be edited rather than shipped. Renewal language states that cancelling stops the next charge rather than refunding the current period, the refund section mirrors it, the liability section caps at what was paid or a nominal amount, and the disclaimers keep the rights that cannot be excluded by law. The user content licence is non-exclusive, ends when content is deleted, and keeps a copy where a legal obligation requires one. Each of those choices is a common drafting position, and each is yours to change.

What the template cannot do is practise law. Consumer rights differ by country and by state, mandatory cooling-off periods exist in some jurisdictions and not others, and the arbitration and liability clauses in particular are the ones a qualified lawyer should review before the agreement is used. Treat the page as a first draft that has already asked the obvious questions, and have the final version checked by someone who can answer them.

The effective date does work beyond the archive. A reader who agreed to an earlier version is entitled to know when the new one took effect, and a support team answering a complaint about a change needs the same fact. The changes section says a material change will be announced before it takes effect; keeping the date accurate is what makes that sentence true rather than aspirational.

Read the agreement once as a customer would, from the top, looking for the answers you would want: what happens if I stop paying, what happens to what I posted, can I leave, and who do I write to. The sections exist to answer those four questions in order, and a clause that answers none of them is a clause to review with your lawyer rather than keep for completeness. Length is not diligence; a shorter agreement that answers the four questions is read more often than a longer one that buries them.`,
    howTo: [
      { step: "Name the service, the operator and the governing law." },
      { step: "Set the effective date and the contact address for notices." },
      { step: "Turn on the clauses the service actually needs, including their pairs." },
      { step: "Read the payments, refunds and liability sections against your pricing." },
      { step: "Clear the checks, then have the draft reviewed by a qualified lawyer." },
    ],
    whenToUse: `Use the terms of service template when a consumer-facing service needs a first draft: a new app, a subscription product, a marketplace being opened to the public. It is most useful before a lawyer sees the document, because the blank fields and the broken pairings are the parts that do not need legal judgement to fix.
The privacy side is a separate document with its own requirements, and the {{email-template-library|Email Template Library}} covers the notice emails that a terms update generates. When the agreement governs a commercial engagement rather than consumer use, the {{proposal-template|Proposal Template}} carries the commercial terms it will refer to.`,
    faqs: [
      {
        q: "Is this template legal advice?",
        a: "No. It is a structured first draft that follows the published section order and common drafting positions. Consumer law differs by jurisdiction, and the final version should be reviewed by a qualified lawyer.",
      },
      {
        q: "Why are payments and refunds checked together?",
        a: "Because a customer reads them as one question: what happens if I cancel. A renewal clause without a refund or cancellation clause leaves that question unanswered, and the check asks for the missing half.",
      },
      {
        q: "Does an arbitration clause need anything else?",
        a: "It needs a governing law to seat it, which is why the check pairs the two. Many also include a class-action waiver and a named arbitration body; the draft includes the waiver and leaves the body to you.",
      },
      {
        q: "What does the limitation of liability section do?",
        a: "It caps what the operator can be asked to pay, commonly at the amount paid in the previous twelve months or a nominal figure. It cannot exclude liability that the law does not allow to be excluded, and the section says so.",
      },
      {
        q: "Can I turn off the sections I do not need?",
        a: "Yes. Accounts, user content, payments, refunds, arbitration and the age minimum are switches; the rest of the order stays fixed, because a reader looks for those sections in the conventional places.",
      },
    ],
  },
};
