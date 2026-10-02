import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B18, content and marketing continued: authored SEO entries for the
 * landing page copy builder, the ad copy framework builder, the social post
 * caption builder, the product launch copy builder and the case study template.
 *
 * Every entry draws the same line: these tools supply a structure and check the
 * blocks, and none of them writes the claims or verifies them. Keys are registry
 * slugs; see ../tool-seo.ts for the contract.
 */
export const B18_MARKETING_SEO: Record<string, ToolSeo> = {
  "landing-page-copy-builder": {
    keywords: ["landing page copy builder", "landing page", "benefits", "proof", "next step"],
    intro:
      "The landing page copy builder assembles the skeleton a page reads in — hero line, named reader, benefits, proof and one next step — and checks each block before the design begins.",
    content: `The landing page copy builder assembles the skeleton a landing page reads in: a hero line, the reader it names, three to seven benefits, a proof block and one next step. The builder supplies the order and the checks; the words are yours. Order matters here because a landing page is read top to bottom in a few seconds, and the job of each block is to earn the next one: the hero makes a promise, the audience confirms the page is for them, the benefits say what changes, the proof makes the claim credible, and the next step gives the reader something to do with the interest they just spent.

The hero line gets the first check and the tightest one: twelve words or fewer, or the reader is skimming before the promise arrives. A hero that names the benefit and the category — cut first-response time in half — does more work than one that names the company, and the builder keeps the company line down at the foot of the page where it belongs. If the hero cannot be shortened, the promise probably has two parts, and splitting them is the fix rather than straining the line.

The benefits block wants at least three entries and tolerates seven. Each benefit is a phrase, not a paragraph; the check flags anything past twenty words. The list is checked for length rather than quality because whether a benefit is true is the product's business, and whether it is readable is the page's. A reader scanning the numbered list should be able to tell, in one pass, what the page is offering and to whom.

The proof block is the one most drafts skip. A figure, a named customer, a result with a date — proof is what turns a page of claims into a page of evidence, and the builder prompts for it explicitly. The next step is checked for the same reason a call to action is checked anywhere: one ask per page is the rule, and a page with three competing asks converts on none of them.

Because the page is composed deterministically from the fields, reordering the benefits or swapping the hero is a single edit, and the word count gives the skeleton an honest size before any design work begins. The copy and download buttons take the text out cleanly for whoever writes the final pass.

A last habit helps at the review stage: read the assembled page top to bottom in one pass, out loud, and notice where attention dips. Most dips happen where the benefits repeat the hero's idea instead of advancing it, or where the proof restates a benefit as if it were evidence. The fix is usually to delete rather than add — a landing page is one of the few documents where cutting a block improves the whole, because every removed sentence gives the next one more room. Keep the blocks in order and let the page argue one promise from five angles; a visitor should be able to stop reading at any block and still know what the page wants.\n\nNothing is uploaded and nothing is stored beyond the tab. The builder writes no claims and knows nothing about the product or the market; every benefit and proof sentence remains the writer's, and any comparative claim still needs checking before it ships.`,
    howTo: [
      { step: "Write the hero line and name the reader it is for." },
      { step: "Add three to seven benefits, one phrase per line." },
      { step: "Add the proof — a figure, a name or a result." },
      { step: "Set one next step for the page." },
      { step: "Read the checks, then copy the skeleton into the page builder." },
    ],
    whenToUse: `Use the landing page copy builder once the offer is settled and before the design is chosen, so the page's promise is decided before anyone argues about the layout. The offer itself is the {{value-proposition-builder|Value Proposition Builder}}'s job, and its benefit sentence should echo in the hero.\n\nWhen the page has its button, the {{cta-button-copy-generator|CTA Button Copy Generator}} keeps the label to a phrase, and a {{headline-analyzer|Headline Analyzer}} pass confirms the hero line carries a concrete detail rather than an adjective.`,
    faqs: [
      {
        q: "How long should a landing page hero line be?",
        a: "Twelve words or fewer. The builder flags anything past that because the hero is read at a glance; if the promise needs more words, it usually contains two promises and wants splitting.",
      },
      {
        q: "How many benefits should the page list?",
        a: "Three to seven. Below three the page lacks reasons to keep reading; above seven the list stops being a decision and becomes a feature dump. Each entry should be a phrase, not a paragraph.",
      },
      {
        q: "Why does the builder insist on proof?",
        a: "Because proof is what turns claims into evidence, and it is the block most first drafts skip. A figure, a named customer or a dated result is enough; the check only asks that something specific be there.",
      },
      {
        q: "Does the builder write the page copy?",
        a: "No. It assembles the skeleton from your hero, benefits, proof and next step, and checks their shape. Every promise on the page is yours to make and to keep.",
      },
    ],
  },

  "ad-copy-framework-builder": {
    keywords: ["ad copy framework builder", "framework", "AIDA", "PAS", "structure"],
    intro:
      "The ad copy framework builder reads one offer through three classic structures — AIDA, PAS and BAB — assembling a draft by slot and naming every slot the chosen framework still needs.",
    content: `The ad copy framework builder takes one set of fields — product, audience, problem, agitate, benefit and proof — and reads them through three classic ad structures. AIDA moves attention to interest to desire to action; PAS states the problem, turns up the cost of leaving it alone, then presents the solution; BAB paints the world before, the world after, and the bridge between them. Switching frameworks re-renders the same offer in a different order, which is the fastest way to feel which shape suits a given medium.

The framework field maps your words onto labelled slots, and the draft shows the labels as it assembles. That visibility is the point: a structure is only useful if the writer can see it while writing. AIDA's attention line is the problem stated so it stings; its interest line names who the product is built for; its desire line carries the benefit and the proof; its action line makes the single ask. PAS and BAB follow the same logic with their own slots, and the agitate field belongs to PAS alone — the check says so rather than pretending every framework wants every field.

The checks are structural and honest. Each framework declares the fields it needs, and the builder names the ones that are empty — missing audience, missing proof, missing agitate — instead of assembling a draft with an invisible hole in it. A draft past 120 words is flagged as well, because an ad is read in seconds and the framework is not an excuse for length. The builder grades no copy and tests no performance; its job is the shape.

Frameworks are scaffolds, not formulas, and the page says as much. An ad can follow AIDA perfectly and still fail on the offer, and the strongest line in a draft is often one the structure did not ask for. What the frameworks do reliably is prevent the two commonest omissions: stating a problem nobody has named, and asking for action without any desire built behind it.

Because the draft is a pure function of the fields and the selected framework, trying all three structures is two clicks, and the word count stays visible while you compare. The copy button takes each draft out cleanly, so versions can sit side by side in a document while the real decision is made.

One more way to use the builder: write all three drafts from the same fields and read them in sequence, as a reader would meet them. AIDA usually surfaces the strongest single line — its attention slot forces the problem into the open — while PAS tends to produce the most persuasive arc and BAB the clearest picture of the change. Because the fields are shared, the best line from one draft can be lifted into another without leaving the page, and the word counts stay visible while you compare. The structure you ship with matters less than the comparison having happened at all.\n\nNothing is uploaded and nothing is stored beyond the tab. The builder writes no hooks, makes no claims and knows nothing about the product or the market. It supplies the structures and the prompts; the offer, the evidence and the choice of shape remain the writer's.`,
    howTo: [
      { step: "Fill in the product, audience and problem." },
      { step: "Add the agitate line if you are reading the offer through PAS." },
      { step: "Add the benefit and the proof." },
      { step: "Switch between AIDA, PAS and BAB and read the same offer in each shape." },
      { step: "Clear every missing-slot check, then copy the draft that suits the medium." },
    ],
    whenToUse: `Use the ad copy framework builder when an offer needs to be written quickly and the writer wants a structure to fill rather than a blank page. The benefit and the proof it draws on should already exist; if they do not yet, build them with the {{value-proposition-builder|Value Proposition Builder}} first.\n\nOnce the short form is working, the {{landing-page-copy-builder|Landing Page Copy Builder}} extends the same promise into a page, and the {{cta-button-copy-generator|CTA Button Copy Generator}} shrinks the action line into a label.`,
    faqs: [
      {
        q: "Which ad framework should I use?",
        a: "It depends on the medium and the audience. AIDA suits a cold reader who needs the problem named and a reason to care; PAS suits a painful, well-understood problem; BAB suits a transformation the reader already wants. Try all three.",
      },
      {
        q: "What is the agitate field for?",
        a: "It belongs to the PAS structure: one line on what the problem costs when it is left alone. AIDA and BAB do not use it, and the builder does not penalise you for filling it anyway.",
      },
      {
        q: "Does the builder score the copy?",
        a: "No. It checks structure only: whether the slots the framework needs are filled, and whether the draft has outgrown an ad's length. Quality and performance are not things a builder can measure.",
      },
      {
        q: "How long should an ad draft be?",
        a: "As short as the medium allows; the builder flags anything past 120 words. An ad is read in seconds, and the framework exists to make the few seconds count rather than to add words.",
      },
    ],
  },

  "social-post-caption-builder": {
    keywords: ["social post caption builder", "caption", "platform", "hashtags", "character limit"],
    intro:
      "The social post caption builder renders one hook, body, link and hashtag list into captions for X, LinkedIn, Instagram and Facebook, measuring each against the platform's character limit and hashtag habits.",
    content: `The social post caption builder takes one post — a hook, a body, a link and a list of hashtags — and renders it for four platforms at once. The same words produce four captions, each measured against the platform's published character limit: X at 280, LinkedIn at 3000, Instagram at 2200 and Facebook far beyond any caption worth writing. Seeing all four side by side is the point, because the caption that fits one platform comfortably can be a different post on another.

The hook is the first line and the one line every platform gives you for free before a see-more. The builder checks that a hook exists and repeats it at the top of every caption; the body follows, then the link, then the hashtags. Because the arrangement is deterministic, a change to the hook appears in all four captions at once, which keeps a cross-posted idea honest rather than letting one platform's version drift.

Hashtags get two checks, one global and one per platform. Past ten tags anywhere the builder warns that a wall of hashtags reads as spam; per platform, X and Facebook read best with three and five respectively, while Instagram tolerates more. The tags are normalised with a leading hash, so a bare word and a tagged word behave the same in the list.

The link gets its own check on Instagram, where caption links are not clickable. The builder flags the link and suggests the bio or the first comment, which is the difference between a caption that sends traffic and one that quietly strands it. That single platform quirk is exactly the kind of thing a cross-posting tool should catch and a person writing four captions usually forgets.

Each caption is shown with its exact character count against the limit, so truncation is a number rather than a surprise. The checks name the platform and the overage when a caption runs long, and the whole draft updates as the hook or body is edited, which makes trimming to fit a matter of watching numbers rather than guessing.

Two more habits worth carrying into the platforms themselves. First, keep the hook under a hundred characters: on X the whole caption is short, and on LinkedIn and Facebook the hook is what shows before the see-more, so a long first line wastes the only guaranteed impression. Second, write the body so its first sentence still makes sense when the link preview is stripped away, since previews render differently on each network and a caption that depends on them reads as broken. The builder keeps one body for all four captions, which makes both habits easy to apply at once: fix the line once and every platform receives the better version. Test the hook on a phone before posting; the fold is narrower than the editor.\n\nNothing is uploaded and nothing is stored beyond the tab, and the builder schedules nothing and posts nothing. Character limits and link behaviour change over time; the numbers here are the documented ones, worth re-checking against a platform's help pages before a campaign leans on them.`,
    howTo: [
      { step: "Write the hook — the first line readers see." },
      { step: "Add the body of the post." },
      { step: "Add hashtags, space or comma separated, and a link." },
      { step: "Read each platform's caption and its character count." },
      { step: "Clear the checks — especially the Instagram link — and copy each caption to its platform." },
    ],
    whenToUse: `Use the social post caption builder when the same idea goes to more than one network in a day and nobody has time to write it four times. When the post is part of a recurring send, the {{email-template-library|Email Template Library}} covers the inbox side of the same message.\n\nThe first line does the work of a headline, so a {{headline-analyzer|Headline Analyzer}} pass on the hook is a fair check, and a {{tagline-generator|Tagline Generator}} can supply the short brand line a profile or a pinned post needs.`,
    faqs: [
      {
        q: "Which platforms does the caption builder cover?",
        a: "X, LinkedIn, Instagram and Facebook. Each caption carries the platform's documented character limit — 280, 3000, 2200 and effectively unlimited — and its own hashtag guidance.",
      },
      {
        q: "Why is the Instagram link flagged?",
        a: "Because Instagram does not make caption links clickable. The builder suggests the bio or the first comment, which is where a link has to live if it is to send anyone anywhere.",
      },
      {
        q: "How many hashtags should I use?",
        a: "It depends on the platform: X reads best with three or fewer, LinkedIn and Facebook with about five, Instagram tolerates more. The builder warns past ten anywhere and flags each platform's own cap.",
      },
      {
        q: "Does the builder post anything?",
        a: "No. It composes and measures captions in the browser; there is no scheduling, no account connection and no posting. The copy buttons are how a caption leaves the page.",
      },
    ],
  },

  "product-launch-copy-builder": {
    keywords: ["product launch copy builder", "launch", "announcement", "what is new", "next step"],
    intro:
      "The product launch copy builder assembles an announcement — product and date, what is new, who it is for, why it matters and one next step — and checks that nothing essential is missing.",
    content: `The product launch copy builder assembles a launch announcement from its parts: the product and the date in the masthead, what is new, who it is for, why it matters and one next step. The order is the order a reader moves through an announcement — what, who, why, do — and the builder's job is to make sure each block exists before the copy is polished, because launch writing usually happens late and under pressure.

The date gets a check that looks pedantic and is not: it must contain a digit. A launch date of soon contains no date to circle, no deadline for the team and no fact for a reader to plan around. The what field is checked for length as well as presence: one or two sentences, under thirty words. An announcement that explains the architecture has stopped being an announcement and become documentation, which belongs one link deeper.

The why field is the one that decides whether the announcement is read. Newness alone is not news to anyone but the maker; why it matters is where the writer says what changes for the reader — the number that stops being a guess, the hour that comes back, the work that stops. The audience field follows the same logic from the other side: naming support teams of five to fifty tells a reader in three words whether the rest is for them.

One next step is enforced, as it is across the other builders, because an announcement that asks for a trial, a follow and a share gets none of the three. The checks list every missing block with a sentence of reasoning, so the draft's gaps are a to-do list rather than a vague sense that something is off.

Because the announcement is assembled from the fields, changing the date updates the masthead and everything else holds, which makes the copy reusable across the channels a launch always needs. The same draft serves as the email, the changelog entry and the social post with light editing, and the word count keeps it to the length a reader will actually finish.

A launch announcement also benefits from being written before launch week rather than during it. The date field alone is a useful forcing function: entering a real date makes the remaining blanks — audience, why, next step — concrete enough to fill, whereas a draft without a date tends to stay abstract. When the announcement is finished, the same text can serve as the changelog entry, the email and the pinned post with light edits, and the first sentence about what is new rarely needs to change between them. What changes by channel is the next step, and the single next step the builder enforces is the one to swap deliberately rather than paste everywhere.\n\nNothing is uploaded and nothing is stored beyond the tab. The builder writes no news and makes no claims; it supplies the announcement's shape and the prompts, and the facts, the audience and the promise remain the writer's.`,
    howTo: [
      { step: "Name the product and the launch date." },
      { step: "Say what is new in one or two sentences." },
      { step: "Name who it is for and why it matters." },
      { step: "Add the single next step." },
      { step: "Clear the checks, then copy the announcement into each channel." },
    ],
    whenToUse: `Use the product launch copy builder for the internal and customer-facing announcement that goes out on the day. When the announcement is aimed at a news desk, the {{press-release-template|Press Release Template}} adds the dateline, quote and boilerplate that editors expect.\n\nIf the launch also updates how the team introduces itself, the {{bio-generator|Bio Generator}} can refresh the about text, and the {{email-template-library|Email Template Library}} covers the follow-up notes the launch generates.`,
    faqs: [
      {
        q: "What belongs in a launch announcement?",
        a: "The product and date, what is new, who it is for, why it matters and one next step. The builder assembles those blocks in that order and flags any that are missing or still vague.",
      },
      {
        q: "Why does the builder insist the date contain a digit?",
        a: "Because a date like soon gives readers nothing to plan around and the team no deadline. The check asks for a date that can be circled — exact or approximate, but calendared.",
      },
      {
        q: "How long should the what section be?",
        a: "One or two sentences, under thirty words. Past that the announcement has become documentation, which belongs a link deeper where a reader who is already interested will find it.",
      },
      {
        q: "Is this the same as a press release?",
        a: "No. An announcement is written for readers who already know you; a press release carries a dateline, a quote and boilerplate for a news desk. The two can share their facts but not their shape.",
      },
    ],
  },

  "case-study-template": {
    keywords: ["case study template", "case study", "challenge", "results", "quote"],
    intro:
      "The case study template assembles the challenge, approach, quantified results and a client quote into the case study shape, checking the parts that make one credible.",
    content: `The case study template assembles the shape a case study is read in: a named client with its sector, the challenge in the client's terms, the approach as numbered steps, results as metric and value pairs, and a sentence of the client's own words. The template supplies the order, which is conventional for a reason — a reader wants to know who, what hurt, what was done and what changed, in that sequence — and the checks make sure no part is missing or vague.

The challenge block gets checked first, because it is the part that makes a case study a story rather than a testimonial. Stating the problem before the solution, in the client's words rather than the vendor's, is what earns the reader's trust for the results that follow. The approach needs at least two steps: a single line reads as a sales claim rather than a method, and a method is what a prospective client is actually shopping for.

The results block is the heart of the credibility and the strictest checks. Results are entered as metric | value pairs, and every value must contain a figure — a percentage, a count, a duration — because a result without a number is a compliment. The builder also caps the list at six; a dashboard of small movements dilutes the two or three figures that decide the case, and the check asks for the decisive ones.

The quote closes the study and does work no paraphrase can. A sentence from the client confirms the story is theirs, that the numbers were witnessed and that the words were approved. The check asks for a quote rather than a testimonial title, and the page notes that quotes need clearing before publication — along with every figure, which should come from the client's data rather than the vendor's estimate.

Because the study is assembled deterministically from the fields, swapping a result or adding a step is one edit, and the word count keeps the draft in the range a reader will finish. The copy and download buttons export a clean block that can be edited for a deck, a page or a proposal.

Writing the challenge before the results also protects the study from an easy failure: explaining the method in terms only the vendor understands. Read the challenge block and ask whether a reader who has never used the product would recognise the problem as theirs; if not, the words are too internal, and the results will feel like answers to a question nobody asked. The same test applies to the results block one more time before publication: each figure should be meaningful to the client, not merely large, and the quote should confirm the figure rather than decorate it. Two of three results that a client would repeat in their own meeting are worth more than six that only a dashboard can see.\n\nNothing is uploaded and nothing is stored beyond the tab. The template verifies nothing and knows no client; it supplies the shape and the prompts, and the story, the results and the permissions remain the writer's and the client's.`,
    howTo: [
      { step: "Name the client and the sector." },
      { step: "State the challenge in the client's terms." },
      { step: "List the approach as at least two steps." },
      { step: "Add results as metric | value, with a figure in every value." },
      { step: "Add the client's quote, clear the checks, then copy the study." },
    ],
    whenToUse: `Use the case study template when a result needs to be written up for a sales page, a deck or a proposal and the shape has to be credible. The offer the study supports is the {{proposal-template|Proposal Template}}'s subject, and the same result often anchors a section of it.\n\nWhen the study is being announced rather than shown, the {{press-release-template|Press Release Template}} wraps the headline result in the dateline, quote and boilerplate a news desk expects.`,
    faqs: [
      {
        q: "What makes a case study credible?",
        a: "A named client, the challenge in their words, a method with at least two steps, results with figures in them and a sentence of the client's own. The template checks for each of those and verifies none of them.",
      },
      {
        q: "Why does every result need a number?",
        a: "Because a result without a number is a compliment. The check requires a figure in each value — percentage, count or duration — so the study rests on outcomes a reader can compare rather than on adjectives.",
      },
      {
        q: "How many results should a case study include?",
        a: "Two or three decisive ones. The template warns below two and above six; a long list of small movements dilutes the figures that would otherwise carry the story.",
      },
      {
        q: "Do I need permission to publish the quotes and figures?",
        a: "Yes. The template cannot obtain it and says so. Every figure should come from the client's data, and the quote and the client's name should be cleared before anything is published.",
      },
      {
        q: "Does the template write the study?",
        a: "No. It assembles the challenge, approach, results and quote you supply, and checks their shape. The story, the numbers and the permissions are all the writer's and the client's.",
      },
    ],
  },
};
