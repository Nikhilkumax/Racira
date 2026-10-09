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
    keywords: [
      "landing page copy builder",
      "hero line",
      "benefits",
      "proof",
    ],
    intro:
      "The Landing Page Copy Builder assembles a hero line, an audience line, the benefits, a proof block and one next step into the skeleton of a landing page, then checks each block.",
    content:
      "A landing page is an argument in a fixed order, and this landing page copy builder assembles yours from six fields. Name the product, write the hero line, say who the page is for, list the benefits, supply the proof and the one next step; the tool stacks them in the order a reader scans — headline, audience, numbered benefits, why it holds up, next step, about the product — and checks each block against the published rules.\n\nThe page panel holds the six inputs. The output panel shows the assembled page with its word count, and the checks panel names what is missing or thin: no product name, no hero line, a hero line past twelve words, no audience, fewer than three benefits, more than seven. Scope and limits states what the builder does not verify — every claim stays the writer's.\n\n- Product: what the page is about, named once.\n- Hero line: one promise the page can keep, kept under twelve words.\n- Audience: who the page is for, named by situation rather than demographic.\n- Benefits: three to seven reasons to keep reading, numbered in the output.\n- Proof: the evidence block — a figure, a result, a name.\n- Next step: the single action the page asks for.\n- Checks: the six blocks and the two thresholds that decide them.\n\nThe assembly is block composition: each field is cleaned, the benefits are numbered in a list, and the blocks are joined in the published order with a blank line between them. The thresholds are arithmetic — a hero line over twelve words, a benefits list under three — and the checks report rather than repair. No claim is generated, no benefit is invented, and the page cannot verify that the proof is true.\n\n- The order is fixed; a page that needs a different argument order is out of scope.\n- Benefits are counted, not weighed — three weak reasons pass the check.\n- The proof block is not checked for a figure, unlike the case study and sales page tools.\n- The hero line length check is the only style rule; voice is left to the writer.\n- Nothing is stored, so copy the page before leaving it.\n\nWrite the benefits before the hero line and the hero line almost writes itself: the three or four reasons that survive the cut are the promise. Then read the page top to bottom as a skimmer would — hero, benefits, proof, next step — and check that each block answers the question the previous one raised. The checks panel is the last pass, not the first. Keep the page in one voice throughout: the hero line, the benefits and the next step should sound like the same person wrote them, because a page that changes register between blocks reads as a template.\n\nThe neighbours carry the page's parts: the Headline Analyzer scores the hero line's mechanics, the CTA Button Copy Generator writes the button the next step points at, and the Value Proposition Builder assembles the one-sentence pitch behind the page. When the page is for a launch, the Product Launch Copy Builder frames the announcement, and the case study template in this domain supplies the proof block with figures.",
    howTo: [
      { step: "Name the product and write the hero line." },
      { step: "Add the audience, three to seven benefits, the proof and the next step." },
      { step: "Read the assembled page top to bottom as a skimmer would." },
      { step: "Work through the checks and copy the page." },
    ],
    whenToUse:
      "Use the landing page copy builder when a page needs its skeleton and the words exist in fragments. The {{headline-analyzer|Headline Analyzer}} scores the hero line once it is written, and the {{cta-button-copy-generator|CTA Button Copy Generator}} builds the button for the next step. When the page sells long form, the {{sales-page-copywriting-tool|Sales Page Copywriting Tool}} extends the same argument across nine blocks, and the case study template in this domain writes the proof section.",
    faqs: [
      {
        q: "How many benefits should a landing page list?",
        a: "Three to seven. Fewer than three gives the reader no reason to keep reading, and past seven the page dilutes; the checks enforce both thresholds and report the count.",
      },
      {
        q: "Why does the hero line have a word limit?",
        a: "Twelve words is the check's band because the hero line is read at a glance; past it the line becomes a paragraph and the reader skims to the benefits. The builder flags the length rather than cutting the line.",
      },
      {
        q: "Does the builder write the page copy?",
        a: "No. Every block is assembled from what you supply; the tool supplies the order and the checks. Nothing is invented and no claim is made on your behalf.",
      },
      {
        q: "Can the blocks be reordered?",
        a: "No. The order is the published one — headline, audience, benefits, proof, next step, about — because each block answers the question the previous one raises. A different argument needs a different tool.",
      },
      {
        q: "Is the assembled page saved anywhere?",
        a: "No. The assembly runs in the page from the fields you typed; nothing is stored or sent, and closing the tab discards the draft unless you copied it.",
      },
    ],
  },

  "ad-copy-framework-builder": {
    keywords: [
      "ad copy framework builder",
      "aida",
      "pas",
      "bab",
    ],
    intro:
      "The Ad Copy Framework Builder reads one offer through the AIDA, PAS and BAB structures, assembling each from the same six fields and checking every slot the framework needs.",
    content:
      "Three ad structures have survived because each answers a different reader, and this ad copy framework builder reads your offer through all three. Fill the fields — product, audience, problem, agitate, benefit and proof — and switch between AIDA, PAS and BAB to see the same facts in each shape: attention-interest-desire-action, problem-agitate-solution, before-after-bridge.\n\nThe framework panel holds the six fields and the three-way switch. The draft panel shows the assembled copy for the chosen framework, and the checks panel names the slots the framework needs that are still empty — PAS wants the agitate line, AIDA and BAB do not. Scope and limits states the builder's line: it writes no claims and knows nothing about the offer.\n\n- AIDA: attention, interest, desire, action — needs product, audience, problem, benefit and proof.\n- PAS: problem, agitate, solution — needs all six fields including the agitate line.\n- BAB: before, after, bridge — needs product, audience, problem, benefit and proof.\n- Fields: product, audience, problem, agitate, benefit, proof.\n- Slot hints: each slot carries a prompt describing what belongs in it.\n- Checks: the framework's required fields, named slot by slot.\n\nThe engine maps your fields onto the chosen framework's slots and joins them in the structure's order, ending each line as a sentence and capitalising where the pattern needs it. The three frameworks are data — id, label, slots with hints, and the fields each needs — so the checks are a comparison between the required list and the filled fields. No line is generated and no claim is added.\n\n- Three frameworks is a finite shelf; a structure outside them is out of scope.\n- The checks test presence, not quality — a weak benefit in every slot passes.\n- The agitate line is required by PAS alone, which is why switching frameworks changes the checks.\n- No claim is verified; the builder cannot know whether the proof is true.\n- Nothing is stored, so copy each framework's draft before switching.\n\nThe useful pass is writing the fields once and reading all three drafts in sequence: PAS punishes a vague problem line because the agitate has nothing to hold, and BAB punishes a vague after because the bridge has nothing to cross. Whichever framework collapses first is the one whose field needs work. Then keep the draft whose structure matches where the reader is — problem-aware readers get PAS, unaware readers get BAB. Rewrite the fields rather than the draft: the frameworks share every field, so one improved problem line improves all three readings at once, and the weakest draft is always the honest signal of which field is still thin. A framework is a lens, not a template, and the offer underneath it stays the same offer. When one draft reads badly, the fault is usually in the field the frameworks share, not in the framework you chose.\n\nThe neighbours cover the copy around the ad: the CTA Button Copy Generator writes the button the action slot points at, the Headline Analyzer scores the attention line's mechanics, and the Value Proposition Builder assembles the pitch the ad repeats. When the ad supports a launch, the Product Launch Copy Builder frames the announcement, and the sales page copywriting tool in this domain extends the argument.",
    howTo: [
      { step: "Fill the six fields: product, audience, problem, agitate, benefit and proof." },
      { step: "Switch between AIDA, PAS and BAB and read each draft." },
      { step: "Work through the checks — the slots the chosen framework still needs." },
      { step: "Copy the draft whose structure matches the reader." },
    ],
    whenToUse:
      "Use the ad copy framework builder when one offer has to be read through more than one structure. The {{cta-button-copy-generator|CTA Button Copy Generator}} writes the action line as a button, and the {{value-proposition-builder|Value Proposition Builder}} supplies the pitch the ad compresses. When the copy runs long, the {{sales-page-copywriting-tool|Sales Page Copywriting Tool}} applies the same field discipline across nine blocks, and the headline analyzer in this domain scores the attention line.",
    faqs: [
      {
        q: "What is the difference between AIDA, PAS and BAB?",
        a: "AIDA builds attention, interest, desire and action; PAS opens on the problem, agitates it and solves it; BAB shows the world before, the world after and the bridge between. The fields are the same; the order and the emphasis change.",
      },
      {
        q: "Why does PAS need an extra field?",
        a: "Because PAS is built on the agitate step — the cost of leaving the problem alone. AIDA and BAB do not have that slot, so the checks only require the agitate line when PAS is selected.",
      },
      {
        q: "Does the builder write the claims?",
        a: "No. It places your text into the framework's slots and checks that the slots the structure needs are filled. No claim is generated, and none is verified.",
      },
      {
        q: "Can I add a fourth framework?",
        a: "Not in the tool. The three frameworks are a fixed shelf of published structures; a different one has to be written by hand, and the scope panel says so.",
      },
      {
        q: "Are my fields kept between frameworks?",
        a: "The fields stay while the page is open, so you can switch frameworks without retyping, but nothing is stored — closing the tab discards everything unless you copied the draft.",
      },
    ],
  },

  "social-post-caption-builder": {
    keywords: [
      "social post caption builder",
      "character limit",
      "hashtags",
      "caption",
    ],
    intro:
      "The Social Post Caption Builder renders one post for four platforms, checks each against its character limit and hashtag cap, and says where the caption will be cut.",
    content:
      "One post does not fit four networks, and this social post caption builder shows exactly where it breaks. Write the hook, the body, the hashtags and the link; the tool renders the same post as a caption for X, LinkedIn, Instagram and Facebook, counts every caption's characters, and flags the platform habits that punish copy-paste — the 280-character limit on X, LinkedIn's hashtag cap of five, Instagram's ten-hashtag cap and its inability to carry a working link in the caption at all.\n\nThe post panel holds the four inputs. The captions panel lists one caption per platform with its character count and an over-limit flag, and the checks panel names the platform faults: a caption past the limit, more hashtags than the platform tolerates, and a link that will not work where it was placed. Scope and limits says what the builder does not know about reach or the algorithm.\n\n- Hook: the first line, which is all most feeds show before the fold.\n- Body: the rest of the post, kept plain.\n- Hashtags: normalised to start with a hash, capped per platform.\n- Link: appended where the platform allows it — Instagram is excluded by design.\n- Four platforms: X at 280 characters and three hashtags, LinkedIn at 3,000 and five, Instagram at 2,200 and ten, Facebook at 63,206 and five.\n- Per-platform character count and over-limit flag beside every caption.\n\nThe engine holds a small platform table — id, label, character limit, hashtag cap, and whether a link works in the caption — and renders the same parts through it four times. The over flag is arithmetic on the rendered length, and the hashtag cap is enforced by the table rather than by trimming, so nothing is silently changed. Every rule in the table is published on the page.\n\n- The limits are the published ones and change when platforms change them.\n- Hashtags past the cap are counted and flagged, never trimmed.\n- Character counts treat every character as one, including emoji and links.\n- Instagram's link rule is the only cross-platform behaviour modelled; feeds, threads and alt text are out of scope.\n- Nothing is stored, so copy each caption before leaving the page.\n\nThe order that works is hook, body, hashtags, link — then read the X caption first, because it is the harshest cut and the one that shows what the hook has to carry alone. A hook that survives 280 characters is a hook; a hook that only works with the body attached is an introduction. Then trim the hashtag list to the smallest cap in play, and the same list works everywhere. Keep one caption per platform rather than one caption trimmed four times, because the platforms disagree about links, tags and tone, and the differences are exactly what the table is there to show.\n\nThe neighbours cover the copy around the post: the Headline Analyzer scores the hook's mechanics, the CTA Button Copy Generator writes the click the post asks for, and the Email Subject Line Tester applies a parallel rubric to the inbox. When the post is part of a launch, the Product Launch Copy Builder frames the announcement, and the microcopy library in this domain covers the interface slots.",
    howTo: [
      { step: "Write the hook, the body, the hashtags and the link." },
      { step: "Read each platform's caption and its character count." },
      { step: "Fix the captions flagged over-limit or over the hashtag cap." },
      { step: "Copy each platform's caption separately." },
    ],
    whenToUse:
      "Use the social post caption builder when one post has to run on several networks and the limits decide the wording. The {{headline-analyzer|Headline Analyzer}} scores the hook as a headline, and the {{email-subject-line-tester|Email Subject Line Tester}} scores the inbox version of the same idea. When the post announces a product, the {{product-launch-copy-builder|Product Launch Copy Builder}} writes the announcement, and the CTA button copy generator in this domain finishes the call to action.",
    faqs: [
      {
        q: "Why is my Instagram link flagged?",
        a: "Instagram captions do not carry working links — the platform strips them — so the builder excludes the link from that caption and names the reason. The link belongs in the bio, which no caption tool can fill.",
      },
      {
        q: "What are the hashtag caps based on?",
        a: "The published habits of each platform: three hashtags for X, five for LinkedIn, ten for Instagram, five for Facebook. Past the cap the tags stop helping and start reading as spam, so the builder flags the count.",
      },
      {
        q: "Are hashtags trimmed automatically?",
        a: "No. The builder normalises them to start with a hash and counts them against each platform's cap; nothing is removed. Trimming is your call, and the checks panel tells you how far over you are.",
      },
      {
        q: "Do emoji count toward the character limit?",
        a: "Yes. The count treats every character as one, which is the conservative reading — some platforms count an emoji as two, so a caption that just fits here may not fit there.",
      },
      {
        q: "Does the builder post anywhere?",
        a: "No. It renders captions in the page from the text you typed; nothing is stored, sent or published. Copy each caption and post it yourself.",
      },
    ],
  },

  "product-launch-copy-builder": {
    keywords: [
      "product launch copy builder",
      "announcement",
      "launch date",
      "early access",
    ],
    intro:
      "The Product Launch Copy Builder assembles the announcement skeleton — what is new, who it is for, why it matters, the date and one next step — and checks that nothing essential is missing.",
    content:
      "An announcement is five facts in a fixed order, and this product launch copy builder assembles yours from six fields. Name the product, give the date, say who it is for, what is new, why it matters and the one next step; the tool stacks them into an announcement — masthead, what is new, who it is for, why it matters, next step — and checks what is missing or vague.\n\nThe launch panel holds the six inputs. The output panel shows the assembled announcement with its word count, and the checks panel names the faults: no product, no date, a date with no digit in it, no audience, no what, a what past thirty words, and no why. Scope and limits says the builder writes no news — the announcement's facts are yours. The launch date anchors the masthead, and early access windows use the same five blocks with the date carrying the opening instead.\n\n- Product: the thing launching, named in the masthead.\n- Date: when it lands, and it must contain a digit to be circleable.\n- Audience: who the launch is for, which tells readers whether to keep reading.\n- What is new: one or two sentences, kept to a breath.\n- Why it matters: the reason a stranger should care — newness alone is not news.\n- Next step: the single action the announcement asks for.\n- Checks: the six fields, the date's digit test and the thirty-word limit on the what.\n\nThe engine composes blocks in the published order and joins them with their labels: the masthead pairs the product with a launching date, the what, audience and why blocks carry their own headings, and the next step closes. The checks are arithmetic — a digit test on the date, a word count on the what — and the fields are never invented. The same block-composition pattern as the landing page builder, applied to the announcement's shorter order.\n\n- The order is fixed and short; a launch that needs a longer argument is out of scope.\n- The date check looks for a digit, not for a real date — 32 February passes.\n- No claim about the product is verified, and none is written.\n- The audience field is free text; the tool cannot judge whether it is specific.\n- Nothing is stored, so copy the announcement before leaving the page.\n\nWrite the why before the what: a launch is only news to the maker, and the why field is where that changes — the reason a stranger should care is the only line that decides whether the announcement is read. Then make the date concrete, because readers plan around it and writers need the deadline, and keep the what to a breath so the audience line is still above the fold. Read the finished announcement as a reader who has never heard of the product: if the first two lines do not answer what this is and why it exists, the announcement is a note to the team rather than news for anyone else.\n\nThe neighbours write the copy around the announcement: the Landing Page Copy Builder turns the news into a page, the CTA Button Copy Generator writes the next step as a button, and the Email Subject Line Tester scores the line that carries it. When the announcement is long form, the Sales Page Copywriting Tool extends the argument, and the social post caption builder in this domain renders it for feeds.",
    howTo: [
      { step: "Name the product, the date and the audience." },
      { step: "Write what is new and why it matters." },
      { step: "Add the next step and read the assembled announcement." },
      { step: "Work through the checks and copy the announcement." },
    ],
    whenToUse:
      "Use the product launch copy builder when the news exists and the announcement needs its skeleton. The {{landing-page-copy-builder|Landing Page Copy Builder}} turns the announcement into a page, and the {{cta-button-copy-generator|CTA Button Copy Generator}} writes the next step. When the launch runs across channels, the {{social-post-caption-builder|Social Post Caption Builder}} renders it for feeds, and the email subject line tester in this domain scores the line that carries it.",
    faqs: [
      {
        q: "What does the announcement include?",
        a: "Five blocks: the masthead with the product and launch date, what is new, who it is for, why it matters and the next step. Each is assembled from your fields in the published order, and the checks report what is missing.",
      },
      {
        q: "Why does the date need a digit?",
        a: "A date without a number — soon, later this year — cannot be circled, and the check flags it. The digit test is deliberately loose: it cannot tell a real date from an impossible one, only a concrete one from a vague one.",
      },
      {
        q: "How long should the what section be?",
        a: "Under thirty words. The check flags anything longer, because an announcement's job is to make the reader decide whether to read more, not to replace the page it links to.",
      },
      {
        q: "Does the builder write the news?",
        a: "No. Every fact comes from your fields; the builder supplies the order, the labels and the checks. No claim is written and none is verified.",
      },
      {
        q: "Is my announcement stored?",
        a: "No. The assembly runs in the page from the fields you typed; nothing is stored or sent, and the draft is gone when the tab closes unless you copied it.",
      },
    ],
  },

  "case-study-template": {
    keywords: [
      "case study template",
      "quantified results",
      "challenge",
      "approach",
    ],
    intro:
      "The Case Study Template assembles a challenge, an approach, results and a quote into the case study shape, then checks the parts that make one credible — a named client, steps and results with figures.",
    content:
      "A case study earns its name with figures, and this case study template assembles yours and checks whether the figures are there. Supply the client, the sector, the challenge, the approach steps, the results and a quote; the tool builds the study — title, challenge, numbered approach, results, quote — and flags the parts that make one credible: an unnamed client, fewer than two approach steps, and results with no number in the value.\n\nThe case panel holds the client, the sector and the challenge. The approach is one step per line and is numbered in the output; the results field is one result per line in the format metric | value, and the tool parses each pair and marks the quantified ones. The checks panel names what is missing, and the quote closes the study. Scope and limits states that the template writes no story and verifies no result. The stats line prints how many results were read and how many are quantified results, which is the study's evidence count at a glance.\n\n- Client and sector: the title of the study and the context it sits in.\n- Challenge: the situation before, in the client's terms.\n- Approach: one step per line, at least two, numbered in the output.\n- Results: one per line as metric | value; a value with a digit in it is marked quantified.\n- Quote: the client's line, placed at the end.\n- Checks: the named client, the two-step minimum, and the quantified-results test.\n\nThe engine composes the blocks in the published order, numbers the approach steps, and parses each result line on the pipe into a metric and a value. The quantified flag is a digit test on the value, and the checks are counts and presence tests. The assembly is string work; no story is written and no figure is computed or verified.\n\n- The template writes no narrative — the challenge and approach are your sentences.\n- The quantified flag is a digit test, not an audit of the result.\n- Results must use the pipe separator; a prose result line is treated as a metric with an empty value.\n- The order is fixed; a study with a different shape is out of scope.\n- Nothing is stored, so copy the study before leaving the page.\n\nWrite the results first and the challenge second: the figures decide which situation is worth describing, and a challenge written before the results usually describes the wrong problem. Then check the approach against the results — every step should be load-bearing for a figure, and a step that no result depends on is context, not approach. The quote is the last line to write, because it should say what the figures mean rather than repeat them. A case study with one quantified result and one honest step is more convincing than a list of five metrics with no method behind them, and the checks reward exactly that shape.\n\nThe neighbours carry the evidence further: the Testimonial Formatter turns quotes into social proof, the Sales Page Copywriting Tool places the study in a proof block, and the Landing Page Copy Builder uses its figures in a page's proof section. When the study sits behind an announcement, the Product Launch Copy Builder writes the news, and the value proposition builder in this domain compresses the finding.",
    howTo: [
      { step: "Name the client and sector and write the challenge." },
      { step: "List the approach steps, one per line, and the results as metric | value." },
      { step: "Add the client quote and read the assembled study." },
      { step: "Work through the checks and copy the study." },
    ],
    whenToUse:
      "Use the case study template when a result exists and the evidence needs its shape. The {{testimonial-formatter|Testimonial Formatter}} formats the quotes that surround it, and the {{sales-page-copywriting-tool|Sales Page Copywriting Tool}} places the study in a proof block. When the finding is one sentence, the {{value-proposition-builder|Value Proposition Builder}} compresses it, and the landing page copy builder in this domain uses the figures above the fold.",
    faqs: [
      {
        q: "What result format does the template expect?",
        a: "One result per line as metric | value — for example First-response time | cut 40% in a month. The tool splits each line on the pipe and marks the value as quantified when it contains a digit.",
      },
      {
        q: "How many approach steps does a case study need?",
        a: "At least two, and the check flags fewer. The steps are numbered in the output, and the discipline the check enforces is that every step should be load-bearing for one of the results.",
      },
      {
        q: "Does the template verify my figures?",
        a: "No. It flags a result with no digit in its value, because a result without a number is a claim, but it cannot audit whether the number is true. The scope panel states that.",
      },
      {
        q: "Can I write the challenge as several paragraphs?",
        a: "Yes — the challenge field takes prose, and the template places it under its heading unchanged. The approach and results are the structured fields; the challenge is the one block written as a story.",
      },
      {
        q: "Is my case study saved?",
        a: "No. The assembly runs in the page from the fields you typed; nothing is stored or sent, and the study is gone when the tab closes unless you copied it.",
      },
    ],
  },
};
