import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B22, specialized and academic: authored SEO entries for the scientific
 * abstract builder, the literature review organizer, the academic paper section
 * planner, the grant proposal outline and the technical report template.
 *
 * Every entry draws the same line: these tools assemble the writer's own
 * sentences into a published structure and check the parts a reader looks for
 * first. None of them writes the research. Keys are registry slugs; see
 * ../tool-seo.ts for the contract.
 */
export const B22_ACADEMIC_SEO: Record<string, ToolSeo> = {
  "scientific-abstract-builder": {
    keywords: [
      "scientific abstract builder",
      "word budget",
      "key results",
      "hedges",
    ],
    intro:
      "The Scientific Abstract Builder assembles the five roles of a research abstract under a word budget, and checks which roles the draft actually covers.",
    content:
      "An abstract is five jobs in a few hundred words — what is known, what is missing, what you did, what you found, what it means — and this scientific abstract builder assembles them in order. Fill the five roles: the context, the gap, the approach with its design and sample, the key results with their figures, and the implication; the tool joins them into one paragraph, counts the words against the published 200-to-300 band, and checks each role for the markers that show the job was done.\n\nThe roles panel takes one field per role. The draft panel shows the assembled paragraph with its word count against the budget band, and the checks panel names the weak roles: a gap with no gap marker — remains unclear, little is known, no study — an approach with no method words, results with no figures, a hedge like might or possibly doing the work of a finding. Scope and limits says the builder assembles and checks shape; it cannot judge whether the science is sound.\n\n- Context: what is established, in one or two sentences.\n- Gap: what is not known, phrased with an explicit gap marker.\n- Approach: the design, the sample and what was measured.\n- Key results: the findings with their figures, not their adjectives.\n- Implication: what the results suggest and for whom.\n- Budget: 200 to 300 words, counted and shown against the band.\n\nThe assembly is role composition: each field is trimmed and joined in the published order, the word count runs against the fixed band, and the role checks are marker regexes — a gap phrase for the gap, method words for the approach, digits for the results, a hedge list for the findings. The same draft always produces the same notes, and every note quotes the habit rather than scoring the science. Write the abstract last and the paper thanks you, because the five roles are only honest once the results have stopped moving and the implications have settled.\n\n- The band is the usual range for a scientific abstract, not a journal's rule.\n- The gap, method and hedge checks are marker lists; elegant wording can evade them.\n- Figures in the results are checked by presence, not correctness.\n- The builder writes no sentences; every claim is yours.\n- The draft is not stored, so copy it before closing the page.\n\nFill the results first and the abstract tightens: the figures decide which gap was worth stating, and a gap written before the results usually promises more than the study delivered. Then read the implication against the results — an implication the figures cannot carry is the sentence reviewers underline — and cut the hedges the check names, because an abstract that hedges its own findings invites the reader to hedge their interest. The word budget is a discipline, not a nuisance: at 300 words there is room for exactly one story, and the role checks show you which sentences are not part of it. When the draft is past the band, cut context before results and results before implication, in that order.\n\nThe neighbours compress and clean the rest: the text summarizer shortens a long background section, the key points extractor pulls the findings out of a results draft, and the academic writing tone checker holds the register impersonal. The word count tool in this domain does the counting the panel repeats.",
    howTo: [
      { step: "Fill the five roles: context, gap, approach, results, implication." },
      { step: "Read the assembled paragraph against the word budget." },
      { step: "Work through the role checks — gap markers, method words, figures, hedges." },
      { step: "Copy the abstract and trim to the journal's limit." },
    ],
    whenToUse:
      "Use the scientific abstract builder when a study is finished and the 250-word door is not yet built. The {{text-summarizer|Text Summarizer}} compresses a background that runs long, and the {{key-points-extractor|Key Points Extractor}} pulls candidate results from a findings draft. When the register drifts, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} pulls it back, and the word count tool in this domain verifies the final count.",
    faqs: [
      {
        q: "What are the five roles?",
        a: "Context — what is established; gap — what is not known; approach — the design, sample and measures; key results — the findings with their figures; implication — what the results suggest. The builder assembles them in that order because readers expect it.",
      },
      {
        q: "Why 200 to 300 words?",
        a: "It is the band most journals ask for and most abstracts miss on the long side. The builder counts against that published band and shows the number; your target journal's limit overrides it.",
      },
      {
        q: "What is a gap marker?",
        a: "A phrase that states the hole explicitly — remains unclear, little is known, has not been tested, no study has. The check looks for one because a gap the reader cannot point to reads as background noise.",
      },
      {
        q: "Why are hedges flagged in the results?",
        a: "Because might and possibly in the findings sentence soften a result the data already earned. Hedges belong in the implication, where uncertainty is honest; in the results they read as doubt about your own measurements.",
      },
      {
        q: "Does the builder check my figures?",
        a: "Only that the results carry digits. Whether a figure is right, significant or honest is outside the tool, and the scope note says so — the builder checks shape, not science.",
      },
    ],
  },

  "literature-review-organizer": {
    keywords: [
      "literature review organizer",
      "stance",
      "synthesis",
      "clusters",
    ],
    intro:
      "The Literature Review Organizer tags every source with a stance — supports, challenges or extends — groups them into clusters, and hands you a synthesis prompt for each group.",
    content:
      "A literature review is an argument about a field, not a list of its papers, and this literature review organizer builds the argument's skeleton. Paste your sources — one per line, each with its author, year and the one-line finding — and the tool tags each source with a stance: supports the thesis, challenges it, or extends it; groups the tagged sources into clusters by topic; marks the lines it could not classify as unstanced; and hands each cluster a synthesis prompt, because a group of sources is not a paragraph until someone says what they add up to.\n\nThe sources panel takes the lines. The plan panel shows the clusters with their stances and counts, the unstanced lines listed by name so nothing vanishes, and the synthesis prompts beside each cluster — the question the paragraph has to answer about that group. Scope and limits says the organizer structures your reading; it does not read the papers for you.\n\n- Stances: supports, challenges, extends — plus unstanced for the lines that resist.\n- Clustering: sources grouped by topic so each cluster becomes a paragraph.\n- Counts: every cluster carries its source count, so thin groups are visible.\n- Synthesis prompts: one question per cluster, written to force a claim.\n- Unstanced list: the lines to re-tag before drafting.\n- Output: a plan you can paste above the draft.\n\nThe organization is parsing and grouping: each line is split into its parts, the stance is read from your tag, the clusters form around the topic you gave, and the synthesis prompts come from a published set attached to the stance patterns. The same source list always produces the same plan, which makes the tool usable across drafts — the plan changes only when the sources do. Treat the counts as a progress meter for the reading, because a review half-tagged is a draft half-argued.\n\n- Stances are only as honest as your tagging; the tool trusts your read.\n- A cluster with two sources is a cluster; whether it earns a paragraph is your call.\n- Unstanced lines are not errors — they are the sources you have not decided about.\n- The prompts are questions, not topic sentences; the claim is yours.\n- Nothing is stored, so copy the plan before closing the page.\n\nWrite the challenges cluster first: the sources against your thesis are the review's credibility, and a paragraph that grants them their strongest form buys the space for everything else. Then answer each cluster's synthesis prompt in one sentence before writing the paragraph — the sentence is the topic sentence, and a cluster whose prompt you cannot answer is a cluster that belongs to someone else's review. Sweep the unstanced list last: every line you leave untagged is a source the draft will silently ignore, and reviewers notice omissions faster than errors. Keep the clusters few — five strong paragraphs beat twelve thin ones, and the counts panel shows you which is which.\n\nThe neighbours compress and carry: the key points extractor pulls the one-line finding from each paper's abstract, the text summarizer shortens a background that runs long, and the thesis statement builder restates the claim the stances serve. The academic writing tone checker in this domain holds the register.",
    howTo: [
      { step: "Paste the sources, one per line, with your stance tags." },
      { step: "Read the clusters, their counts and the unstanced list." },
      { step: "Answer each cluster's synthesis prompt in one sentence." },
      { step: "Copy the plan and draft the challenges cluster first." },
    ],
    whenToUse:
      "Use the literature review organizer when the sources are collected and the review refuses to become an argument. The {{key-points-extractor|Key Points Extractor}} distils each paper to its finding, and the {{text-summarizer|Text Summarizer}} compresses the background that resists shortening. When the review's claim needs one sentence, the {{thesis-statement-builder|Thesis Statement Builder}} writes it, and the academic writing tone checker in this domain keeps the register scholarly.",
    faqs: [
      {
        q: "What do the three stances mean?",
        a: "Supports — the source's findings back your thesis; challenges — they cut against it; extends — they push the thesis into new territory. The three-way split is coarse on purpose: it forces a decision per source, which is the review's real work.",
      },
      {
        q: "What is an unstanced source?",
        a: "A line the tool could not classify because no tag was given. It appears in the unstanced list rather than a cluster, so it cannot vanish silently — re-tag it or decide it does not belong in the review.",
      },
      {
        q: "What is a synthesis prompt?",
        a: "The question your paragraph has to answer about a cluster — what the group adds up to, not what each paper said. Answering it in one sentence gives you the topic sentence; skipping it is how reviews become annotated bibliographies.",
      },
      {
        q: "How many clusters should a review have?",
        a: "As many as have something to say — usually three to six. The counts panel makes thin clusters visible, and two sources with no synthesis is a sign the group needs merging or cutting.",
      },
      {
        q: "Does the organizer read the papers?",
        a: "No. It structures the lines you paste, trusting your stance tags and your one-line findings. The scope note says the tool organises reading; it does not do the reading.",
      },
    ],
  },

  "academic-paper-section-planner": {
    keywords: [
      "academic paper section planner",
      "word budget",
      "IMRaD",
      "sections",
    ],
    intro:
      "The Academic Paper Section Planner splits a target word count across the paper's sections in the IMRaD order, and shows which section carries the argument's weight.",
    content:
      "A paper is a word budget before it is a document, and this academic paper section planner spends it. Give the target — the default is six thousand words — and the tool allocates the budget across the sections in the IMRaD order: introduction, methods, results, discussion, conclusion, each with its share, its job and the prose shape that job implies; the plan is the outline you argue with before you write, when changing your mind is still free.\n\nThe input panel takes the total and any section you want to weight by hand. The plan panel lists every section with its allocated words, its share of the total and its purpose line, and the arithmetic is visible: the shares sum to the budget, and a section you weight by hand takes the difference from the others. Scope and limits says the planner allocates; it cannot know your journal's structure or your committee's taste.\n\n- Sections: introduction, methods, results, discussion, conclusion — the IMRaD spine.\n- Budget: the total split by published proportions, shown as words and percent.\n- Purpose lines: each section's job stated in one sentence.\n- Hand weighting: pin a section and the rest of the budget adjusts.\n- Output: a plan to paste above the draft and argue with.\n\nThe planning is proportional allocation: each section carries a published share of the total, the words are rounded, and the plan is recomputed whenever the total or a hand weight changes. The same budget always produces the same plan, which makes the tool useful in a writing group — two authors can argue about shares rather than vibes. Print the plan beside the outline and let the two disagree in public, because a budget nobody wrote down is a budget nobody keeps.\n\n- The shares are conventions; a results-heavy paper may need its own weights.\n- The planner does not write, outline or schedule; it splits a number.\n- Journal templates override the section list, not the discipline of budgeting.\n- A plan is a hypothesis; the draft will renegotiate it. Revisit the plan after the first full draft, because the sections that overran are telling you where the paper's real centre is, and the budget should learn from the draft.\n- Nothing is stored, so copy the plan before leaving the page.\n\nBudget the discussion first and the paper gets easier to write: it is the section reviewers read most closely and the one authors under-fund, so give it its share before the methods eats the surplus. Then check the results share against your evidence — a paper with six figures does not fit the same split as one with none, and the hand-weighting exists for exactly that argument. Read the plan top to bottom once and ask where the argument actually lives: if the discussion's share is smaller than the methods', the paper is a methods report wearing a paper's clothes, and the budget shows it. Keep the plan beside the draft and re-read it at half the word count; budgets are most useful exactly when the draft starts ignoring them.\n\nThe neighbours track the spending: the word count tool measures each section as drafted, the reading time estimator shows how long the paper holds a reader, and the outline builder turns the plan into headings. The paragraph compressor in this domain pays back words when a section runs over.",
    howTo: [
      { step: "Enter the target word count." },
      { step: "Read the section shares and their purpose lines." },
      { step: "Hand-weight any section the paper's shape demands." },
      { step: "Copy the plan and check the draft against it." },
    ],
    whenToUse:
      "Use the academic paper section planner before drafting, when the budget is still spendable. The {{word-count-tool|Word Count Tool}} measures each section as it grows, and the {{reading-time-estimator|Reading Time Estimator}} shows the paper's cost to a reader. When the plan needs headings, the {{outline-builder|Outline Builder}} builds them, and the paragraph compressor in this domain claws back a section that ran over.",
    faqs: [
      {
        q: "What is IMRaD?",
        a: "Introduction, Methods, Results and Discussion — the spine most empirical papers hang on, with the conclusion as the close. The planner uses the five-section form because it is the common denominator of journal structures.",
      },
      {
        q: "Where do the default shares come from?",
        a: "Published conventions for empirical papers: a compact introduction, a methods section that carries reproducibility, results proportional to the evidence, and a discussion that gets room to argue. They are starting proportions, not rules.",
      },
      {
        q: "Can I weight a section by hand?",
        a: "Yes. Pin the section's share and the planner redistributes the remainder across the others, keeping the sum at your target. The arithmetic stays visible in the plan.",
      },
      {
        q: "Does the planner write the outline?",
        a: "No. It allocates words and states each section's job; the headings and the prose are yours. The outline builder in this domain is the tool that turns a plan into headings.",
      },
      {
        q: "Is my target saved?",
        a: "No. The plan is computed in the page from the number you typed, and nothing is stored; copy the plan before closing the tab.",
      },
    ],
  },

  "grant-proposal-outline": {
    keywords: [
      "grant proposal outline",
      "measurable",
      "timeline",
      "sections",
    ],
    intro:
      "The Grant Proposal Outline assembles the Significance, Innovation and Approach sections against a word limit, and checks every aim for the measurability and timeline reviewers score.",
    content:
      "A grant proposal is scored section by section, and this grant proposal outline builds it that way. Pick the framework — the full Significance, Innovation, Approach structure or its three short-form variants — and fill the sections against the word limit, which defaults to twenty-five hundred; for each research aim, the tool checks the two things reviewers actually score: whether the aim is measurable, and whether it carries a timeline. The output is the outline with every section's word share and every aim's flags, ready to argue with before the deadline argues for you.\n\nThe framework panel takes the sections and the aims. The plan panel shows each section with its allocated share of the limit, and the checks panel names the weak aims: an aim with no measurable verb — increase, reduce, establish, test, measure, compare — and no figure, or an aim with no timeline words — month, quarter, a year, a named quarter. Scope and limits says the outline structures and flags; it cannot know your funder's priorities.\n\n- Frameworks: Significance, Innovation, Approach, plus the short-form variants.\n- Word limit: twenty-five hundred by default, split across the sections.\n- Measurability: every aim needs a measurable verb or a number.\n- Timeline: every aim needs month, quarter, year or a named date.\n- Section shares: the limit spent visibly, so no section starves.\n- Output: the outline with flags, ready for the rewrite pass.\n\nThe assembly is section composition with aim checks: the sections are rendered in the framework's order with their word shares, and each aim is tested against a measurable verb list and a timeline pattern. The checks are deterministic — the same aims always earn the same flags — which makes the tool usable in a writing group where someone else has to believe your aims.\n\n- A measurable verb does not make an aim achievable; it makes it scoreable.\n- The word limit is a default; your call's limit overrides it.\n- The framework list is fixed; agency-specific forms need their own mapping.\n- Budget and staffing sections are out of scope; this outline is the science.\n- Nothing is stored, so copy the outline before leaving the page.\n\nWrite the aims first and the sections fill with purpose: a proposal with three measurable, time-boxed aims is a plan, and the Significance section writes itself around why the plan matters. Then read each aim's flags honestly — the measurable check is not bureaucracy, it is the reviewer's first test of whether you will be able to tell in year three that the project worked. Spend the word budget on Approach: reviewers fund the how, and a proposal that gives its limit to Significance rhetoric while the approach starves is the outline shape the shares panel makes visible. Finish by reading the aims in sequence — each should be possible if the previous one lands, and an aim that secretly depends on aim three failing is the kind of thing the flags cannot catch and reviewers love to.\n\nThe neighbours assemble the rest of the submission: the executive summary builder compresses the pitch for the cover letter, the meeting summary formatter structures the team's planning sessions, and the key points extractor distils the preliminary data into aim-supporting bullets. The word count tool in this domain tracks the limit as sections grow.",
    howTo: [
      { step: "Pick the framework and enter the sections." },
      { step: "Write the aims and read their measurable and timeline flags." },
      { step: "Check the section shares against the word limit." },
      { step: "Copy the outline and fix the flagged aims." },
    ],
    whenToUse:
      "Use the grant proposal outline when the science is ready and the scoring structure is not. The {{executive-summary-builder|Executive Summary Builder}} writes the cover-letter pitch, and the {{key-points-extractor|Key Points Extractor}} distils the preliminary data into bullets. When the team plans, the {{meeting-summary-formatter|Meeting Summary Formatter}} structures the session, and the word count tool in this domain watches the limit.",
    faqs: [
      {
        q: "What frameworks does the outline support?",
        a: "The Significance, Innovation, Approach structure used by major federal funders, plus three short-form variants built from the same sections. Each framework is a fixed list of sections with their order and shares.",
      },
      {
        q: "What makes an aim measurable?",
        a: "A verb from the published list — increase, reduce, establish, develop, test, measure, compare, deliver, train, publish, recruit, complete — or a number in the aim. The check wants a result you could observe, not admire.",
      },
      {
        q: "Why does every aim need a timeline?",
        a: "Because reviewers read an aim without dates as a wish. The timeline pattern accepts months, quarters, years and named dates; the flag just asks when, and the answer is yours.",
      },
      {
        q: "Does the tool write the budget or staffing sections?",
        a: "No. The outline covers the scientific sections and their aims; administrative sections belong to your institution's process, and the scope note says so.",
      },
      {
        q: "Is the outline saved between edits?",
        a: "No. The plan and flags are computed in the page from your text, and nothing is stored; copy the outline before the tab closes.",
      },
    ],
  },

  "technical-report-template": {
    keywords: [
      "technical report template",
      "recommendations",
      "findings",
      "scope",
    ],
    intro:
      "The Technical Report Template assembles a report from seven fixed sections, checks each for evidence and next-step discipline, and flags the thin sections that are headings in disguise.",
    content:
      "A technical report is read by people who were not in the room, and this technical report template assembles yours for them. Fill the seven sections — summary, scope and audience, background, findings, risks and limitations, recommendations, appendix — and the tool builds the document in that order, checks each section for the discipline its job demands: findings need evidence words or a figure, recommendations need an owner and a date, and any section under ten words is flagged as a heading wearing a paragraph's clothes.\n\nThe input panel takes the seven sections. The draft panel shows the assembled report with section headings in the fixed order and a word count per section, and the checks panel names the faults: a finding with no evidence behind it — no number, no observed, no measured, no data — a recommendation with no owner-and-date pattern, a required section left empty, and the thin-section flags. Scope and limits says the template assembles and checks; it cannot verify your findings.\n\n- Seven sections: summary, scope, background, findings, risks, recommendations, appendix.\n- Required: summary, scope, findings, risks and recommendations; background and appendix optional.\n- Evidence scan: findings checked for numbers and observed facts.\n- Owner-and-date: every recommendation needs who and when.\n- Thin-section flag: under ten words is a heading, not a section.\n- Per-section word counts beside the assembled draft.\n\nThe assembly is section composition: each section is rendered under its heading in the published order, and the checks are pattern tests — an evidence list for findings, an owner-and-date pattern for recommendations, presence for the required sections, and the ten-word floor. The same input always produces the same draft, which makes the template safe to standardise on across a team. Read the assembled report once as the person who has to act on it, because the reader's first question is never what did you do but what should I do now.\n\n- The order is fixed; an organisation with its own template wins where they differ.\n- The evidence check is pattern matching; a wrong figure with a digit passes.\n- The appendix is not checked; it exists to hold what the body should not.\n- Owner and date are pattern checks; whether the plan is real is not checkable.\n- Nothing is stored, so copy the draft before leaving the page.\n\nWrite the recommendations before the findings and the report gets honest: the actions decide which findings matter, and a finding that supports no recommendation is context the appendix can hold. Then fill the risks section with the same care — what the work could not establish is the paragraph that buys the report its credibility, because a report with no named limits invites the reader to imagine them. Read the summary last and keep it to three sentences: the finding and the recommendation, in that order, since the summary is the only section everyone will read. Then sweep the thin-section flags — each one is a promise the report has not kept, and ten words is a generous floor.\n\nThe neighbours tighten the body: the executive summary builder tests the summary section against a stricter brief, the jargon remover strips the vocabulary the scope-and-audience section warns about, and the word count tool tracks each section as it grows. The paragraph compressor in this domain pays back the words a section borrowed.",
    howTo: [
      { step: "Fill the seven sections, required ones first." },
      { step: "Read the assembled draft with its per-section counts." },
      { step: "Work through the checks — evidence, owner-and-date, thin sections." },
      { step: "Copy the draft and write the summary last." },
    ],
    whenToUse:
      "Use the technical report template when the work is done and the write-up owes an audience that was not there. The {{executive-summary-builder|Executive Summary Builder}} stress-tests the summary section, and the {{jargon-remover|Jargon Remover}} strips the terms the scope section has not defined. When the report runs long, the {{word-count-tool|Word Count Tool}} shows where, and the paragraph compressor in this domain trims it back.",
    faqs: [
      {
        q: "Which sections are required?",
        a: "Summary, scope and audience, findings, risks and limitations, and recommendations. Background and appendix are optional because not every report needs them — but if they are present they are placed, not policed.",
      },
      {
        q: "Why do findings need evidence words?",
        a: "Because a finding without its evidence reads as an opinion with authority. The check looks for numbers and observed-fact words — measured, tested, compared, data — and flags the findings that assert without showing.",
      },
      {
        q: "What counts as owner-and-date on a recommendation?",
        a: "A pattern that names who and when: a month, a quarter, a year, a by-date, or an explicit owner marker. A recommendation with neither is a wish, and the report's readers know it.",
      },
      {
        q: "Why flag sections under ten words?",
        a: "Because ten words is the floor at which a section says something; under it, the section is a heading that drifted. The flag tells you which promises the draft has not kept yet.",
      },
      {
        q: "Is the report stored anywhere?",
        a: "No. The assembly and checks run in the page from your sections, and nothing is stored or sent; copy the draft before closing the tab.",
      },
    ],
  },
};
