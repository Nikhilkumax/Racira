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
    keywords: ["scientific abstract", "structured abstract", "gap statement", "key results", "word band"],
    intro:
      "The scientific abstract builder assembles five sentence roles — context, gap, approach, key results and implication — and checks each one for what it has to contain.",
    content: `The scientific abstract builder asks for five roles rather than five paragraphs, because those are the parts a reader is looking for. Context establishes what is already known. The gap statement says what is not yet known, in the voice of an absence rather than an interest. Approach names the design and the sample. Key results carry the figures. Implication draws the consequence. A scientific abstract missing any one of them reads as either a plan or a boast.

The gap statement is the role most often written badly, so it is checked against published markers. A sentence such as we did something interesting does not state a gap; a sentence such as it remains unclear whether, or has not been examined, does. The distinction matters because a gap is a claim about the state of knowledge, and a reader who cannot see it cannot judge whether the study closes it.

Key results are checked for a number and for hedging words. A results sentence with no figure in it cannot be weighed, and hedging there is a category error: appears to and may belong in the implication, where they are honest, rather than in the finding, where they are evasive. The checker flags both and explains which role the caution belongs to.

Most clinical and scientific journals ask for a structured abstract with the labels visible, and the builder produces that shape from the same five roles. The continuous version drops the labels and joins the same sentences into a paragraph for venues that prefer it. Switching between the two is one checkbox and the word count does not change, because nothing is added or removed.

The word band is the usual two hundred to three hundred, and the check reports the distance rather than the verdict. Acronyms are counted as well: more than three and a reader outside the subfield will be decoding rather than reading. Citations are flagged, since an abstract is read apart from the reference list and conventionally carries none.

Write the roles from the results upwards. Draft the key results first, then the approach that produced them, then the gap the study addressed, then the context, and finally the implication. An abstract written in that order describes the study that was actually done, which is the only study a reviewer can assess.

The builder cannot judge the research. Whether the sample is adequate, whether the analysis fits the design and whether the implication follows from the figures are the reviewer's questions, and the page says so rather than implying that a clean set of role checks means a sound paper.

A useful exercise before writing is to read the five roles aloud as a single paragraph and listen for the join between the gap and the approach. That join is where an abstract either convinces or loses a reader, because it is the move from what was missing to what was done. When the join is weak the approach usually answers a slightly different question from the one the gap raised, and the fix is in the roles rather than in the wording. Read the key results against the approach as well, since a figure the sample cannot produce is the fastest way to lose a reviewer's confidence.`,
    howTo: [
      { step: "Draft the key results first, with the figures the study actually produced." },
      { step: "Write the approach that produced them: design, sample and analysis." },
      { step: "State the gap the study addressed using an absence marker such as remains unclear." },
      { step: "Add the context above it and the implication below." },
      { step: "Clear the role checks, then copy the labelled or continuous shape your venue wants." },
    ],
    whenToUse: `Use the scientific abstract builder when the paper is drafted and the abstract has to be written in the venue's shape. Role checks catch the gap that never states a gap and the results sentence that carries no number, which are the two things reviewers notice first.
When the objective itself is still moving, the {{thesis-statement-builder|Thesis Statement Builder}} tightens the claim first. For a general abstract outside the sciences, the {{abstract-generator|Abstract Generator}} labels the same five IMRaD parts without the scientific role checks.`,
    faqs: [
      {
        q: "What is a gap statement and why is it checked?",
        a: "It is the sentence that says what is not yet known. The check looks for absence markers such as remains unclear, has not been examined or little is known, because a gap stated as an interest cannot be judged or closed.",
      },
      {
        q: "Why are hedging words flagged in the results?",
        a: "Because appears to and may belong in the implication rather than in the finding. The role check flags the hedge and says which role it belongs to, so the caution is kept without weakening the number.",
      },
      {
        q: "What is the difference between a structured and a continuous abstract?",
        a: "The structured abstract prefixes each role with its label, which most clinical and scientific journals require. The continuous version joins the same sentences into one paragraph. The word count is identical either way.",
      },
      {
        q: "Why does the tool count acronyms and flag citations?",
        a: "Abstracts are read apart from the paper and often by readers outside the subfield, so more than three acronyms forces decoding, and citations conventionally do not appear in an abstract at all.",
      },
      {
        q: "Does the builder write the abstract?",
        a: "No. Every sentence is yours; the tool orders the five roles, applies the labels, counts the words and checks each role against a published marker list so the gaps are visible.",
      },
    ],
  },

  "literature-review-organizer": {
    keywords: ["literature review organizer", "synthesis", "stance", "annotated bibliography", "themes"],
    intro:
      "The literature review organizer parses one source per line, groups the sources by the stance their findings take, and builds a synthesis scaffold that names what is agreed, contested and still open.",
    content: `The literature review organizer takes one source per line in a plain format — citation, then the finding, then the stance — and groups the result by what each finding does to the others. That grouping is the whole point. A reading list becomes a synthesis when the writer can say which sources agree, which disagree and which extend the question, and those three groups are exactly what the scaffold produces, with the sources listed under each.

The stance field is optional. When it is left empty the organizer reads the finding for markers: consistent or confirms places a source in the agreeing group, contradicts or no effect places it in the disagreeing group, and extends or builds on places it in the third. Anything it cannot place is listed as unstanced, which is a useful state rather than an error — those are the sources whose position the writer has not yet decided.

The scaffold is deliberately short. Each group opens with a sentence frame such as the evidence consistently shows or this agreement is not universal, followed by the citations with their findings. Filling the frames is the writer's work, and the prompts beside the scaffold say what each paragraph has to do: state what the agreeing sources establish together, name who found the opposite and on what sample, and finish with the question none of the sources answer.

The difference between this and an annotated bibliography is the reason the tool exists. An annotated bibliography describes sources one at a time, which is a useful preparation and not a review. A literature review is an argument about a body of work, and an argument needs the groups. When every source in the list agrees, the organizer says so plainly, because a review with no tension reads as a list no matter how well each entry is written.

The checks cover the gaps that make the writing phase harder than it needs to be: sources with no year, sources recorded as a citation with no finding, findings under four words that are too thin to synthesise, duplicate citations, and a list long enough that themes will have to be introduced before the review can be organised at all. Above twenty-five sources the advice is to group them by themes first, since no single review section can carry that many.

The scaffold, the source list and the counts can be copied or downloaded as plain text, and nothing is uploaded. The organizer does not read the papers and does not decide whether a finding really challenges another; that judgement stays with the writer, and the scaffold is arranged to make it visible rather than to make it for them.

Keep the line format in a notes file while reading. A review written from notes that recorded the stance as the paper was read is a different document from one written from a pile of PDFs two months later, and the difference is visible in the first paragraph.

The organizer is also useful in reverse. Paste a review section you have already written, one source per line as it appears, and the grouping shows which stance is over-represented and which is missing entirely. A section that only ever agrees has become a summary, and a section with no extending sources has not said what the work opened up. Both are quick to fix once they are visible as counts rather than as an impression.`,
    howTo: [
      { step: "Record one source per line as citation | finding | stance." },
      { step: "Leave the stance off where you have not decided yet; the organizer will read the finding." },
      { step: "Read the three groups and check that the disagreement group is not empty." },
      { step: "Fill the sentence frames in the scaffold, one group at a time." },
      { step: "Clear the gaps in the list, then copy the scaffold beside your draft." },
    ],
    whenToUse: `Use the literature review organizer once you have read enough sources to have opinions about them, and before you write the review section. Grouping by stance is what turns a reading list into an argument, and the scaffold gives each group a paragraph to live in.
When the sources are organised but the citations themselves need formatting, the {{academic-journal-reference-formatter|Academic Journal Reference Formatter}} and the {{bibliography-builder|Bibliography Builder}} handle the reference list. When the paper's own claim needs tightening after the review is written, the {{thesis-statement-builder|Thesis Statement Builder}} is the next step.`,
    faqs: [
      {
        q: "What line format does the organizer expect?",
        a: "One source per line as citation | finding | stance, for example Smith (2021) | remote work cuts informal contact by a third | supports. The stance is optional and is read from the finding when it is omitted.",
      },
      {
        q: "How is this different from an annotated bibliography?",
        a: "An annotated bibliography describes sources one at a time. A literature review makes an argument about the body of work, which needs the sources grouped by what their findings do to each other — agree, disagree or extend.",
      },
      {
        q: "What happens when every source agrees?",
        a: "The organizer flags it. A review with no tension reads as an annotated bibliography, so the check names the missing disagreement rather than letting a supervisor find it later.",
      },
      {
        q: "Does it read the papers or verify the findings?",
        a: "No. It parses the lines you write, groups them and reports the gaps. Whether a finding really challenges another is your judgement, and the stance field is where you record it.",
      },
      {
        q: "What should I do with more than twenty-five sources?",
        a: "Group them by themes before organising the review. No single review section can carry that many, and the check says so instead of letting the scaffold grow past usability.",
      },
    ],
  },

  "academic-paper-section-planner": {
    keywords: ["paper section planner", "word budget", "methods section", "results section", "discussion section"],
    intro:
      "The academic paper section planner splits a total word budget across the five standard sections using published proportions, and flags the shares that have drifted out of range.",
    content: `The academic paper section planner turns a total word budget into targets for the five sections of a research article. The proportions are published rather than invented: introduction fifteen per cent, methods twenty, results thirty, discussion thirty and conclusion five. Multiplying a stated total by those shares gives every section a number before writing begins, and a plan with numbers is much easier to argue with than a plan that says the discussion will be long.

The proportions encode a view about what a paper is. The results and discussion sections are the paper; everything else supports them. A methods section at five per cent of a six thousand word article is eight hundred words short of repeatable, and the planner says so as a note attached to that section rather than as a general warning. An introduction past a quarter of the paper has stopped introducing and started reviewing, and it gets its own note.

The three statements the plan has to carry are checked by name. The research question is the first: without it, the sections are containers with nothing to hold, and the planner says so. A question running past forty words gets a second check, because a question that needs a paragraph to state will not survive being answered in the conclusion. The method and the contribution are checked the same way, since a methods section budgeted but never described and a contribution never named are the two most common reasons a plan stalls in the second week.

The word budget also makes the venue limit visible. Under three thousand words the planner warns that sections may be squeezed, which is the honest way to say that a short-format article cannot carry a full results and discussion.

Targets are most useful when they are checked twice: once when the plan is made and once when a full draft exists. Compare the actual section lengths with the budget and the differences are informative in both directions. A results section far under its target usually means a finding was left in the discussion, where it reads as interpretation. A discussion far over its target usually means the comparison with prior work has grown into a second review, which belongs elsewhere. Over twelve thousand it suggests checking the venue limit before splitting the difference across sections, because most journals cap the total rather than each part.

The outline it produces is plain text and can be copied or pasted beside the draft: the question, the method, the contribution, the total, then each section with its target, its purpose and the elements a reader expects to find in it. That list of elements is the part writers use most — results expects a main finding, secondary findings, figures and tables, and uncertainty and exclusions, and a section that cannot answer for all four is not finished.

Nothing is uploaded and nothing is stored beyond the tab. The planner does not read your draft and cannot tell whether the sections were actually written to their targets; it plans the budget and names the statements the plan depends on.

Revise the plan when the paper changes shape, and expect it to change. A plan made in the first week and never revisited is usually the reason a discussion section is twice its target while the results section reports one finding.`,
    howTo: [
      { step: "State the research question in one sentence." },
      { step: "State the method and the contribution in a line each." },
      { step: "Set the total word budget the venue allows." },
      { step: "Read the five section targets and the notes attached to any that look thin." },
      { step: "Clear the checks and keep the outline beside the draft as the sections are written." },
    ],
    whenToUse: `Use the paper section planner at the start of a writing block rather than at the start of the project, when the study exists and the article has to be budgeted. Section targets make an overgrown methods section visible in week one rather than in the second review round.
When the literature the introduction has to summarise is still a pile of notes, organise it first with the {{literature-review-organizer|Literature Review Organizer}}. When the paper is drafted and the abstract has to be written, the {{scientific-abstract-builder|Scientific Abstract Builder}} takes over from there.`,
    faqs: [
      {
        q: "Where do the section proportions come from?",
        a: "They are published working proportions: introduction fifteen per cent, methods twenty, results thirty, discussion thirty and conclusion five. They fit a standard research article and are a starting position rather than a rule.",
      },
      {
        q: "What does the planner check besides the budget?",
        a: "The research question, the method and the contribution, plus the total against a realistic range. Notes are attached to sections whose targets fall below what that section needs to do its job.",
      },
      {
        q: "Why does the methods section have a minimum?",
        a: "Because a methods section has to describe the design, the sample and the analysis well enough for another researcher to repeat the study. Under about four hundred words at a six thousand word total, it usually cannot.",
      },
      {
        q: "A question longer than forty words is flagged — why that length?",
        a: "Because a research question should fit in a sentence. Past forty words it is usually several questions sharing a full stop, and a paper that answers all of them answers none of them well.",
      },
      {
        q: "Does the planner write the sections?",
        a: "No. It divides the budget, names the purpose and elements of each section and checks the three statements the plan depends on. Every word of the paper is still yours.",
      },
    ],
  },

  "grant-proposal-outline": {
    keywords: ["grant proposal outline", "objectives", "evaluation plan", "timeline", "budget justification"],
    intro:
      "The grant proposal outline assembles one of three published funder frameworks and checks the parts reviewers reject proposals for: unmeasurable objectives, a missing evaluation plan, an undated timeline and an unjustified budget.",
    content: `The grant proposal outline offers three frameworks because funders organise their calls differently. A significance, innovation and approach structure suits a scientific call. A need, objectives, methods, evaluation structure suits a programme grant. A generic outline of summary, problem, plan, outcomes, risks and budget covers everything else. Choosing a framework changes the sections and the prompts; the checks are the same in all three, because the same omissions sink a proposal wherever it is submitted.

The objectives check is the one writers act on most. An objective a reviewer cannot measure is a wish, so the check looks for a number or a measurable verb — increase, reduce, establish, develop, test, measure, recruit and the rest — and flags a set that has neither. It also counts the objectives and warns past five, which is roughly the number a reviewer can hold while reading the rest of the application.

The evaluation plan is checked by presence and by substance. Every framework in the tool has an evaluation section, and an empty one is named in the checks with its prompt, so a proposal cannot pass with outcomes claimed and no method of showing them. The same is true of the timeline: where a framework has one, a timeline without dates or periods is flagged, because milestones without a month, a quarter or a year are not milestones.

The budget justification is the section most often left to last, and the tool's prompt for it says what reviewers look for: costs tied to activities rather than to categories. Two research assistants for nine months is tied to an activity. Personnel: two is a category. The check cannot judge the numbers, but it can and does name the section as empty when nothing has been written there at all.

Length is checked against a stated limit, which defaults to two thousand five hundred words for the narrative. Over the limit is flagged plainly, because reviewers stop reading before the budget justification, which is the section that decides the award. Well under the limit is also flagged: most calls expect the narrative to use the space it has been given, and a proposal at a third of the allowance reads as unfinished.

Keep the objectives and the evaluation plan beside each other while writing, because they are the two sections a reviewer reads as a pair. Each objective should map to at least one measure in the evaluation plan, and each measure should be traceable to an objective. Where the mapping breaks, the proposal is either claiming an outcome it cannot show or collecting data it never promised to use, and reviewers look for both deliberately. The tool cannot perform that mapping, but it can make sure neither section is empty while the other carries the argument.

The whole outline can be copied or downloaded as plain text, with each section carrying its prompt where nothing has been written yet. Nothing is uploaded, and the framework and limit can be changed at any point without losing the text already typed.

Read the call itself before trusting any framework. Funder requirements change, page limits change, and a structure that fits one competition may be disqualified in another for reasons no outline tool can know.`,
    howTo: [
      { step: "Choose the framework the call is organised around." },
      { step: "Set the narrative word limit from the call." },
      { step: "Write the objectives as three to five measurable statements, one per line." },
      { step: "Fill the evaluation plan and put dates on every timeline item." },
      { step: "Clear the checks, then read the narrative against the limit before exporting it." },
    ],
    whenToUse: `Use the grant proposal outline as soon as the call is chosen, before the narrative is drafted. The frameworks give the sections their shape, and the objective and evaluation checks catch the two omissions that cost applications at first review.
When the proposal is a client-facing document rather than a funder application, the {{proposal-template|Proposal Template}} is organised around problem, approach, deliverables and price. When the narrative has to be read by non-specialists, the {{technical-to-plain-language-converter|Technical to Plain Language Converter}} expands the acronyms and replaces the jargon before submission.`,
    faqs: [
      {
        q: "Which framework should I choose?",
        a: "Whichever the call is organised around: significance, innovation and approach for a scientific call; need, objectives, methods and evaluation for a programme grant; the generic outline otherwise. The checks behave identically in all three.",
      },
      {
        q: "What makes an objective measurable?",
        a: "A number or a measurable verb — increase, reduce, establish, develop, test, measure, recruit. The check flags a set of objectives with neither, and warns when there are more than five to hold in mind.",
      },
      {
        q: "Why is an undated timeline flagged?",
        a: "Because a milestone without a month, a quarter or a year is not a milestone. The check looks for dates and periods and says plainly that the timeline carries none.",
      },
      {
        q: "What should a budget justification contain?",
        a: "Costs tied to activities rather than to categories. Two research assistants for nine months is tied to an activity; a personnel line is a category. The prompt says so, and an empty section is named in the checks.",
      },
      {
        q: "Why warn when the narrative is under the limit?",
        a: "Because most calls expect the space to be used. A narrative at a third of the allowance usually means an evaluation plan, a timeline or a budget justification has not been written properly yet.",
      },
    ],
  },

  "technical-report-template": {
    keywords: ["technical report template", "scope statement", "findings", "recommendations", "revision history"],
    intro:
      "The technical report template assembles seven standard sections into a numbered report and checks the parts a reader looks for first: the scope statement, evidence behind the findings, and recommendations with an owner and a date.",
    content: `The technical report template assembles seven sections in the order a decision-maker reads them: summary, scope and audience, background, findings, risks and limitations, recommendations, and an appendix for the material that would otherwise interrupt the body. The output is numbered, carries the title and the audience as front matter, and ends with a revision history placeholder, because a report that is revised without a record of what changed is a report nobody can rely on.

The scope statement is checked against the audience. A scope that never names who the report is for is flagged, and so is one that names a different audience from the one set in the front matter. Scope is the section that stops a report being read as more than it is: what was examined, what was not, and for whom. The check uses the audience's content words rather than its first word, so the operations board is not satisfied by the word the.

The findings section is checked for evidence markers — figures, observations, sources, comparisons — because a finding with nothing behind it is an opinion with a heading. The check names what is missing rather than arguing with the content: a reader cannot tell what was measured, and a report that cannot be verified will not be acted on.

Recommendations are checked for an owner and a date. An action with neither is a hope, and the check says so. Any recommendation also implies a risk, so when the recommendations section has content and the risks section is empty, that pairing is flagged: every recommendation carries a risk, and a report that recommends without naming one is asking to be trusted rather than read.

Sections under ten words are marked thin rather than filled. A heading with one line under it reads as an omission, and reviewers notice missing content faster than they notice extra words. Required sections that are empty are named individually, so the report cannot be exported looking complete when it is not. The word count is reported as a total, which is useful when a report has a stated limit or when a summary has grown longer than the findings it summarises.

Everything can be copied or downloaded as plain text with the numbering intact, and nothing is uploaded. The template assembles and checks; it does not write the analysis, judge the recommendations or decide whether the risks are the right ones.

Write the summary last. A summary written first is a plan, and a plan presented as a summary is the most common reason a technical report is sent back for revision.

The summary deserves its own discipline. Three sentences is the target: the finding, the consequence and the recommendation. A summary that runs to a page is a second introduction, and one that lists everything the report covers tells the reader nothing about what was concluded. Write it last, from the findings and the recommendations as they finally stand, then read it against the scope statement to be sure it does not claim more than the report established. That comparison is the first one a reviewer makes.`,
    howTo: [
      { step: "Set the title and the audience before writing any section." },
      { step: "Write the scope statement: what was examined, what was not, and for whom." },
      { step: "Put the evidence behind each finding — figures, observations or sources." },
      { step: "Give every recommendation an owner and a date, and list the risks beside it." },
      { step: "Clear the checks, write the summary last, then export the numbered report." },
    ],
    whenToUse: `Use the technical report template when the work is finished and the document has to be read and acted on by someone who was not involved: an incident review, a feasibility assessment, a handover document. The checks are aimed at the omissions that send reports back.
When the report is long enough that the prose itself needs work, the {{simplify-text-tool|Simplify Text Tool}} and the {{sentence-rewriter|Sentence Rewriter}} take the next pass. When the process being described is a proposal rather than a review, the {{proposal-template|Proposal Template}} is the better starting structure.`,
    faqs: [
      {
        q: "Why is the scope statement checked against the audience?",
        a: "Because scope only means something relative to a reader. A scope that never names who the report is for leaves the reader guessing how much authority the document has, and the check compares the audience's content words against the scope text.",
      },
      {
        q: "What counts as evidence in the findings?",
        a: "A number, an observation, a measured comparison or a source. The check looks for those markers and, when none appear, says plainly that a reader cannot tell what was measured.",
      },
      {
        q: "Why do recommendations need an owner and a date?",
        a: "Because an action with neither is a hope. The check looks for an owner, a responsible party or a date and flags recommendations where the next step is left unassigned.",
      },
      {
        q: "Why is an empty risks section flagged alongside recommendations?",
        a: "Because every recommendation carries a risk, and a report that recommends without naming one asks to be trusted rather than read. The pairing is checked automatically.",
      },
      {
        q: "What does the revision history placeholder do?",
        a: "It reserves the front or back matter where dates, authors and changes are recorded. A revised report without a change record cannot be relied on by anyone who read the earlier version.",
      },
    ],
  },
};
