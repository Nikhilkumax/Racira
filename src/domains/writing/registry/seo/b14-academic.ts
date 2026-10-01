import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B14, specialized and academic: authored SEO entries for the logical
 * fallacy detector, the thesis statement builder, the argument mapping tool, the
 * survey question builder and the peer review checklist.
 *
 * Every entry draws the same line: these tools check the shape and wording of an
 * argument or a question, and none of them judges whether a claim is true or a
 * paper is sound. Keys are registry slugs; see ../tool-seo.ts for the contract.
 */
export const B14_ACADEMIC_SEO: Record<string, ToolSeo> = {
  "logical-fallacy-detector": {
    keywords: ["logical fallacy detector", "fallacies", "cue phrases", "appeal to popularity", "false dilemma"],
    intro:
      "The logical fallacy detector scans a passage for a documented list of cue phrases and names the common fallacy each phrase usually signals — a prompt to look, not a verdict on the argument.",
    content: `The logical fallacy detector does one narrow thing and is honest about it. It holds a documented list of cue phrases for the common informal fallacies and reports where those phrases appear, naming the fallacy each one usually signals. An appeal to popularity is flagged by "everyone knows" or "most people agree"; a false dilemma by "either … or" or "only two options"; a slippery slope by "will lead to" or "next thing you know". The result is a list of sentences to look at again, each with the phrase that triggered it and a one-line explanation of the pattern.

That design is deliberate, because a logic engine is not what a writer needs at the desk. A text field cannot evaluate an argument's validity — that depends on meaning, on context and on premises the passage may not state — but it can reliably find the stock phrases that fallacies leave behind. Flagging those phrases puts the passages a reader might stumble over in one list, which is a useful first pass over a draft and, in a debate or an op-ed, a useful check before publishing.

The tool lists every rule it knows, with its cue phrases and a description, so the list is inspectable rather than mysterious. There is no hidden model and no network call: the same passage always produces the same findings, which makes the output something to reason about rather than trust blindly. A flagged sentence may be perfectly sound — "always" is sometimes the right word — and an unsound argument may carry no cue at all, and both of those limits are on the page.

Fallacies are worth knowing for more than editing. Naming the pattern — the straw man, the ad hominem, the appeal to emotion — is how you answer one, and seeing the list of cues is a compact way to learn to spot them. The detector is therefore a teaching aid as much as a proofreading pass: it shows what the phrases look like before they are pointed out to you in someone else's reply.

Nothing is uploaded and nothing is stored beyond the tab, so a passage stays private. The detection is lexical, the list is finite, and the judgement stays with the writer — which is the only honest way for a tool like this to work, and the page says so plainly.

A detector of cue phrases is not a substitute for reading closely, and it is worth saying what it is for. In an op-ed or a policy memo the phrases travel ahead of the argument: a reader spots "everyone knows" before they weigh the evidence, and the writer who removes it has to make the case instead. In a classroom the list doubles as a syllabus of the informal fallacies, since each rule names its pattern and shows the words that give it away. Either way the value is in the first pass, when a draft is long enough that the obvious weak spots are buried and a targeted list of them saves a slow, uneven read later.`,
    howTo: [
      { step: "Paste the passage, one argument per line." },
      { step: "Read the findings: each names a fallacy, the cue phrase and the sentence it sat in." },
      { step: "Check the explanation of the pattern before deciding whether the passage is really affected." },
      { step: "Copy the report, or read the full list of cues the tool knows." },
    ],
    whenToUse: `Use the logical fallacy detector as a first pass over an argument you are about to publish or submit. When you want to see the reasoning laid out rather than checked for cues, the {{argument-mapping-tool|Argument Mapping Tool}} shows the claim, its reasons and the warrants between them, and when the sentence itself needs sharpening the {{thesis-statement-builder|Thesis Statement Builder}} assembles and checks it.

If the passage is academic and the concern is register rather than logic, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} measures that instead.`,
    faqs: [
      {
        q: "Does it prove an argument is fallacious?",
        a: "No. It matches a documented list of cue phrases and names the fallacy each usually signals. A flagged sentence may be perfectly sound, and an unsound argument may contain none of the cues, so treat a finding as a place to look rather than a verdict.",
      },
      {
        q: "Which fallacies are covered?",
        a: "The common informal ones, each with its cue phrases: appeal to popularity, false dilemma, hasty generalisation, slippery slope, ad hominem, straw man, appeal to authority, circular reasoning and appeal to emotion. The full list is shown on the page.",
      },
      {
        q: "Is a language model used?",
        a: "No. There is no model and no network call. The detector is a fixed set of patterns, so the same passage always produces the same findings, and you can read exactly why each one was flagged.",
      },
      {
        q: "Is the passage uploaded?",
        a: "No. There is no account and no upload, and the text lives only in the tab where you pasted it, so unpublished work stays private.",
      },
      {
        q: "Why does the tool explain each pattern?",
        a: "Because the point is to learn to spot the pattern, not to accept a flag. Each finding carries a one-line description of what the fallacy does, so the cue and the reasoning behind it are visible together.",
      },
    ],
  },

  "thesis-statement-builder": {
    keywords: ["thesis statement builder", "thesis statement", "position", "reasons", "hedge"],
    intro:
      "The thesis statement builder assembles a thesis from a topic, a position and its reasons, then flags the wording habits that weaken it — a hedge that softens the claim, a vague word, or a length that became a paragraph.",
    content: `The thesis statement builder starts from the parts of a thesis rather than from prose. You give it a topic, a position and the reasons behind the claim, and it assembles the sentence — joining the topic and the position into a claim and attaching the reasons with "because". Working from parts keeps the two things a thesis needs separate: a subject, and something arguable said about it. A sentence that names a subject without taking a position is a topic, not a thesis, and the builder's split makes that visible.

The wording checks are the second half, and they are about shape, not truth. The tool flags a hedge — "I think", "maybe", "in my opinion" — because a hedge removes the claim the essay is supposed to defend; it flags vague words such as "things", "society" or "important", because a claim built on them cannot be argued against; and it flags a thesis that has grown past forty words, which usually means two claims have been fused into one sentence. It also asks for reasons when none are given, since a thesis that says why it is true is easier to argue and easier to read.

Those checks are prompts, and the page says so. A hedge is sometimes a deliberate signal of scope, "society" is occasionally the precise word, and a field may expect a roadmap sentence rather than a single claim. What the tool guarantees is that the shape is visible: the assembled sentence sits above the checks, so a writer can see what was built and decide what to change.

Because the thesis is a pure function of the parts you enter, the same parts always produce the same sentence, and copying it into a draft is a single action. The tool writes no supporting paragraph and knows nothing about your discipline's conventions — some expect the thesis at the end of a first paragraph and others in an abstract — so it makes the claim's shape visible and leaves the placement and the argument to the writer.

Nothing is uploaded and nothing is stored beyond the tab. It is a small, deterministic assembler with honest checks: the sentence is yours, and the tool's job is to make sure it is a sentence that can be argued with.

Working from parts also makes revision concrete. If the checks flag a hedge, the fix is one field; if they flag a vague word, the position field is where it lives; if the thesis is too long, the reasons can move into the paragraph that follows, since a reason needing a clause of its own usually belongs in the argument rather than in the claim. Because the sentence is reassembled instantly, a writer can try several positions against the same set of reasons and see which one the evidence would actually support, which is a faster route to the arguable claim than editing prose by hand and losing track of what changed. Naming the position and the reasons in separate fields also keeps a later revision honest: when the evidence changes, the sentence that must change is the one the evidence bears on, not the whole paragraph around it.`,
    howTo: [
      { step: "Enter the topic and the position; a verb in the position makes it a claim." },
      { step: "Add the reasons, one per line." },
      { step: "Read the assembled thesis and its word count." },
      { step: "Work through the checks for hedges, vague words and length." },
      { step: "Copy or download the thesis and the report." },
    ],
    whenToUse: `Use the thesis statement builder when a claim needs to be sharp before an essay is written around it. When the reasons behind the thesis need their evidence and warrants laid out, the {{argument-mapping-tool|Argument Mapping Tool}} is the next step, and when the essay's structure is the question the {{outline-builder|Outline Builder}} numbers the sections that will carry the argument.

If the concern is that the drafting has drifted into an informal register, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} measures that separately.`,
    faqs: [
      {
        q: "What makes a thesis different from a topic?",
        a: "A position. A topic names a subject; a thesis says something arguable about it. The builder keeps the two as separate fields, so a subject without a position is visible rather than hidden inside a vague sentence.",
      },
      {
        q: "Why is a hedge a problem?",
        a: "Because a thesis exists to be defended, and 'I think' or 'maybe' removes the claim before the argument starts. The check flags hedges as prompts; a deliberate qualifier may still be worth keeping.",
      },
      {
        q: "Does it write the supporting argument?",
        a: "No. It assembles the thesis sentence and checks its wording. The reasons you enter are attached to the claim; the paragraphs that argue for them are yours to write.",
      },
      {
        q: "Where does a thesis go?",
        a: "That depends on the discipline and the assignment: often at the end of the introduction, sometimes in an abstract. The tool does not decide placement or check your field's conventions, and it says so on the page.",
      },
      {
        q: "Is my thesis uploaded?",
        a: "No. There is no account and no upload, and the parts stay in the tab, so an unpublished claim stays unpublished until you choose to share it.",
      },
    ],
  },

  "argument-mapping-tool": {
    keywords: ["argument mapping tool", "argument", "claim", "evidence", "warrant"],
    intro:
      "The argument mapping tool lays an argument out as a claim, the reasons behind it and, for each reason, the evidence and the warrant that connects the evidence to the claim — the step writers most often leave out.",
    content: `The argument mapping tool is built around the oldest way to find a hole in an argument: write out the step that was left unstated. It asks for a claim, the reasons that support it, and for each reason the evidence behind it and the warrant — the assumption that makes the evidence relevant to the claim. Laying those out side by side is what turns a paragraph of confident prose into an argument you can inspect, because the warrant is exactly the part a fluent paragraph tends to skip.

The warrant is worth dwelling on. Evidence rarely supports a claim on its own; the leap is a general principle that the writer usually holds without stating it. That a study found something is evidence; that the study's population resembles the reader's is a warrant, and it is often false in interesting ways. Writing the warrant down either confirms it or reveals that the argument rests on an assumption the writer never examined — which is the entire purpose of mapping an argument rather than just reading it back.

The tool checks the structure as you build it. A reason with no evidence is an assertion, not support; a reason with no warrant has left its connecting step implicit; fewer than two reasons is usually too thin to stand on; and an argument with no objection named has probably not met its strongest counter. Those are prompts about shape, and the page says plainly that they say what is missing rather than whether the reasoning is sound.

The map exports as a markdown document with a heading per reason, so it can sit beside a draft or a set of notes, and the report gathers the counts — how many reasons have evidence, how many have a warrant — with the checks. That makes revision concrete: the list of unwarranted reasons is the list of paragraphs that need another sentence, usually the sentence that explains why the evidence matters.

Nothing is uploaded and nothing is stored beyond the tab. The tool evaluates no argument's validity, which is properly the work of logic and of a reader, and it generates none of the content. It provides the slots and the structural checks, and it leaves the thinking, which is where it belongs.

Mapping an argument also makes collaboration simpler. A reader who can see the claim, the reasons and the warrants can say exactly which step they doubt — usually a warrant — instead of disagreeing with the whole piece, and the writer can answer that one step in a sentence. The same layout works as a plan before drafting: filling the slots forces the reasons to be found before the prose is written, and a claim with two warranted reasons and a named objection is most of an essay's argumentative work already done, leaving the paragraphs to do the linking and the illustration. Used recursively, the same three slots — claim, evidence, warrant — also make a paragraph's topic sentence testable, since a topic sentence is itself a claim and the sentences beneath it are expected to earn it.`,
    howTo: [
      { step: "State the claim in one sentence." },
      { step: "Add each reason as reason | evidence | warrant, one per line." },
      { step: "Name the strongest objection and your answer to it." },
      { step: "Read the shape checks for reasons with no evidence or no warrant." },
      { step: "Copy or download the map as markdown." },
    ],
    whenToUse: `Use the argument mapping tool when a piece of persuasive writing needs its reasoning made explicit, especially the unstated warrants between evidence and claim. When the wording rather than the structure is the concern, the {{logical-fallacy-detector|Logical Fallacy Detector}} scans for the cue phrases of common fallacies, and when the central claim itself needs sharpening the {{thesis-statement-builder|Thesis Statement Builder}} assembles and checks it.

If the argument is long enough to need sections, the {{outline-builder|Outline Builder}} numbers the structure that will carry it.`,
    faqs: [
      {
        q: "What is a warrant?",
        a: "The general principle that makes a piece of evidence relevant to a claim — the unstated step between them. Writing it down either confirms the argument or reveals an assumption the writer never examined, which is why the field exists.",
      },
      {
        q: "Does it judge whether my argument is valid?",
        a: "No. It checks the structure: reasons, evidence, warrants, an objection and a rebuttal. Whether the reasoning holds is a matter of logic and of what the evidence actually shows, and the tool does not attempt it.",
      },
      {
        q: "How many reasons does an argument need?",
        a: "There is no fixed number, but the tool asks for at least two before it stops prompting, because a claim resting on a single reason is usually either too broad or not yet thought through.",
      },
      {
        q: "Why name an objection?",
        a: "Because an argument that never meets its strongest counterargument is weaker for it, and naming the objection is the step that forces you to answer it. The tool asks for the objection and the rebuttal as separate fields.",
      },
      {
        q: "Is the map stored?",
        a: "Only in the tab, plus whatever you copy or download. There is no account and no upload, so an unpublished argument stays private.",
      },
    ],
  },

  "survey-question-builder": {
    keywords: ["survey question builder", "survey questions", "leading", "double-barrelled", "loaded"],
    intro:
      "The survey question builder checks a questionnaire for the wording problems that quietly ruin data: leading questions, double-barrelled ones, absolutes, loaded words and questions too long to read once.",
    content: `The survey question builder is a wording checker for questionnaires, and wording is where a great deal of survey data goes wrong before a single response is collected. It reads your survey questions, one per line, and flags the mechanical problems each one carries, naming the exact phrase it found so the fix is obvious: a leading question that suggests its own answer, a double-barrelled one that asks two things at once, an absolute that forces a position, a loaded word that pushes the response, or a question long enough that a respondent will lose the thread before the end.

Those five checks cover the most common failures. A double-barrelled question is especially costly, because a single answer cannot be read back: "How satisfied are you with the price and the support?" mixes two dimensions, and a middling score tells you nothing about which one disappointed. An absolute such as "always" or "all" leaves no room for the ordinary case, and a loaded word — "reckless", "bureaucratic" — has already argued with the respondent before they answer. Spotting each in a list before the survey goes out is far cheaper than discovering it in unusable data afterwards.

The tool also lists the standard question types — multiple choice, single choice, rating scale, open text, yes/no and ranking — because the type shapes what an answer can mean. A rating scale produces a number that can be compared; an open question produces language that has to be coded. Deciding the type before writing the question is part of writing it well, and the page says as much rather than leaving it implicit.

It is careful about its own limits. A flagged question is a prompt, not an error: a word can be loaded in one field and neutral in another, and a short indirect question can still be leading. The tool judges wording only — not sampling, not question order, not response scales and not whether a question is worth asking, which are research decisions no wording checker can make.

Nothing is uploaded and nothing is stored beyond the tab, so draft questions stay private. And because the analysis is deterministic, the same question always produces the same list of issues, which makes the report something a research team can read and argue about rather than take on trust.

Wording checks are cheapest at the drafting stage and most expensive later. Once a survey is in the field, a double-barrelled question cannot be fixed without either discarding the responses or fielding a corrected version, and both cost far more than the few minutes the check takes. Reading the flagged list out loud is a useful habit on its own: the phrasing that pushes an answer is usually audible, and a question that cannot be read in one breath is the one most likely to be abandoned half-finished by a respondent answering on a phone in a queue. Each check also names the phrase it matched, so a disputed flag can be argued about on the wording itself rather than on the tool's opinion of the question.`,
    howTo: [
      { step: "Write each survey question on its own line." },
      { step: "Read the analysis: leading, double-barrelled, absolute and loaded wording, and length." },
      { step: "Check the named phrase in each flagged question and decide whether the wording is deliberate." },
      { step: "Note the question types listed and match each question to the answer it should produce." },
      { step: "Copy or download the report for the team." },
    ],
    whenToUse: `Use the survey question builder when a questionnaire is being drafted and the wording needs a check before it goes out. When the questions are really the evidence for an argument about people's views, the {{argument-mapping-tool|Argument Mapping Tool}} lays out how that evidence supports a claim, and when the questionnaire accompanies a paper the {{peer-review-checklist|Peer Review Checklist}} covers the manuscript's own sections.

If the questionnaire is short and the concern is only its length, the {{word-count-tool|Word Count Tool}} answers that in one step.`,
    faqs: [
      {
        q: "What is a double-barrelled question?",
        a: "One that asks two things at once, such as satisfaction with both price and support. A single answer cannot be read back to either, so a middling score tells you nothing about which part disappointed; the tool flags the joining word it found.",
      },
      {
        q: "Why flag absolutes like always and all?",
        a: "Because they force respondents into a position that may not describe them. A question that offers only 'always' and 'never' leaves out the ordinary case, which is usually where most of the answers would fall.",
      },
      {
        q: "Does it check the survey design?",
        a: "No. It checks wording only: leading, double-barrelled, absolute and loaded phrasing, and overall length. Sampling, question order, scales and whether the question is worth asking are research decisions the tool does not attempt.",
      },
      {
        q: "Can a flagged question still be right?",
        a: "Yes. A word can be loaded in one field and neutral in another, and a deliberately leading question can be a valid design choice. The finding is a prompt to look, and the page says so.",
      },
      {
        q: "Is my questionnaire uploaded?",
        a: "No. There is no account and no upload, and the questions stay in the tab, so an unreleased survey stays private.",
      },
    ],
  },

  "peer-review-checklist": {
    keywords: ["peer review checklist", "peer review", "manuscript", "sections", "limitations"],
    intro:
      "The peer review checklist walks a reviewer through the manuscript section by section — summary, introduction, methods, results, discussion and presentation — with progress and a copyable report.",
    content: `The peer review checklist is a reading aid for a reviewer, organised the way a manuscript is. It states the twelve questions a reviewer conventionally brings to a paper — does the abstract say what was actually done, is the research question answerable, could the methods be repeated from the text, do the results support the claims in the discussion, are the limitations named honestly — grouped into the sections they belong to. Working through the list in order makes a review systematic, and it makes it harder to reach the end of a paper without having noticed that, say, the ethics section or the limitations paragraph is missing.

The grouping matters as much as the items. A paper has a shape, and each section does a specific job: the introduction positions a question against the literature, the methods describe how it was answered, the results report what was found, and the discussion says what it means and what it does not. A checklist that mirrors that shape turns "review this paper" into a sequence of small, answerable questions, which is both faster and less likely to skim past a section that merely looks complete.

Progress is tracked overall and by section, so a reviewer can see at a glance which parts of the manuscript still need attention. The report marks every item checked and includes any notes you have attached, producing a structured summary that can be pasted into a review form or a decision letter and then edited in the reviewer's own words. It organises the reading and the note-taking; it does not assess the paper.

That distinction is stated on the page. The checklist cannot know a journal's own reviewer form, cannot judge whether a method is appropriate to a question, and cannot tell a strong paper from a weak one — those judgements need a reader's expertise. What it can do is make sure the reader asked each conventional question before writing the review, which is the failure mode a checklist exists to prevent.

Nothing is uploaded and nothing is stored beyond the tab: no manuscript, no notes, no identity. A reviewer can work through a confidential submission here and copy only the finished report, and the page makes clear that the checklist is a structure for the reviewer's own judgement rather than a substitute for it.

A checklist is most useful at the two ends of a review. Before reading, it sets out what to look for, so the first pass is deliberate rather than impressionistic; after reading, it is a way to check that the review answers each of the conventional questions before it is sent. Reviews that come back as a single paragraph of reaction with no mention of methods or limitations are a familiar complaint, and working through the items is a cheap guard against writing one, because an unticked item is a question the review has not yet addressed at all. The notes field is where the substance of the review accumulates as you read; the checklist only keeps each note attached to the item that prompted it.`,
    howTo: [
      { step: "Read the manuscript, ticking each item as you check for it." },
      { step: "Watch the progress by section to see which parts of the paper still need attention." },
      { step: "Note the items you cannot tick; they are the review's open questions." },
      { step: "Copy the report, which marks every item and carries your notes." },
      { step: "Paste it into your review system and rewrite it in your own words." },
    ],
    whenToUse: `Use the peer review checklist when you are reviewing a manuscript and want a systematic pass rather than a run-through. When the paper's citations need checking, the {{citation-formatter|Citation Formatter}} covers the styles the manuscript is likely to use, and when the prose register is the concern the {{academic-writing-tone-checker|Academic Writing Tone Checker}} measures that.

If you are preparing your own submission rather than reviewing someone else's, the {{manuscript-formatter|Manuscript Formatter}} handles the typography and the counts a submission form expects.`,
    faqs: [
      {
        q: "Does the checklist assess the paper?",
        a: "No. It gives the reviewer the conventional questions and tracks which ones have been answered. Whether a method is appropriate or a claim is supported needs a reader's expertise, and the tool does not attempt that judgement.",
      },
      {
        q: "Which sections are covered?",
        a: "Summary, introduction, methods, results, discussion and presentation, with twelve items spread across them — from whether the abstract states what was done to whether the references are complete and the figures legible.",
      },
      {
        q: "Can I add my own notes?",
        a: "Yes, notes attach to items and appear in the report beneath them, so the ticks and your comments travel together into whichever review system you submit through.",
      },
      {
        q: "Is the manuscript stored anywhere?",
        a: "No. Nothing is uploaded and there is no account; the checklist holds only your ticks and notes in the tab, so a confidential submission stays confidential.",
      },
      {
        q: "Does it match my journal's reviewer form?",
        a: "No. Journals have their own forms and criteria, and this is a general checklist based on the sections a paper has. Use it to structure your reading, then transfer the report into the journal's form.",
      },
    ],
  },
};
