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
    keywords: [
      "logical fallacy detector",
      "fallacy",
      "ad hominem",
      "false dilemma",
    ],
    intro:
      "The Logical Fallacy Detector scans a passage sentence by sentence against nine published fallacy patterns and quotes the exact words that triggered each finding.",
    content:
      "A fallacy is easier to commit than to notice, and this logical fallacy detector reads your text the way a hostile reader would. Paste the passage and it splits it into sentences, matches each one against nine published patterns — appeal to popularity, false dilemma, hasty generalisation, slippery slope, ad hominem, straw man, appeal to authority, circular reasoning and appeal to emotion — and reports every hit with the sentence quoted and the rule named, so you can judge each finding instead of trusting a score.\n\nThe input panel takes the passage. The findings panel lists one card per hit: the rule's name, the sentence that matched, and the note that explains what the pattern is. The report panel assembles the findings into a readable summary you can paste into a margin or a review note. Scope and limits states the honest boundary: pattern matching catches the wording habits fallacies travel in, not the logic underneath, and a clean pass is not a licence.\n\n- Nine rules: popularity, false dilemma, hasty generalisation, slippery slope, ad hominem, straw man, authority, circular reasoning, emotion.\n- Sentence split: each sentence is checked on its own, so findings point somewhere.\n- Quoted evidence: every finding carries the exact sentence that triggered it.\n- Report: the findings assembled into plain text you can paste.\n- Scope note: pattern matching names suspects; judgement decides guilt.\n\nThe detection is lexicon and pattern work: each rule holds a set of published phrase patterns, the passage is split into sentences with the shared tokenizer, and every match records its rule and its evidence. The same text always produces the same findings, which makes the tool usable in a workshop — two readers arguing about a finding can see the same quoted words. No logic engine runs underneath and no claim is evaluated. Run the detector on your own drafts before anyone else's, because the habits it catches are cheapest to fix in the paragraph you have not fallen in love with yet.\n\n- A finding is a suspect, not a verdict; context can make the wording innocent.\n- The nine patterns are fixed; a fallacy with different wording passes unseen.\n- Sentence splitting is mechanical; long semicolon chains read as one sentence.\n- The report ranks nothing — the order is the passage's order.\n- The passage is not stored, so copy the report before closing the page.\n\nRead each finding against its sentence rather than the count: an appeal to authority in a literature review is how the genre works, and a slippery slope in a satire may be the joke. The tool's value is that it makes you look — every finding is a place a sceptical reader will slow down, and the quoted sentence tells you whether the slowness is your problem. Then run the passage again after edits: the detector is deterministic, so the before-and-after findings are comparable, and a passage that sheds its findings without losing its force is the goal. Keep the strongest sentences and cut the ones that survive only on volume.\n\nThe neighbours finish the audit: the counterargument generator drafts the objections the passage has not met, the argument mapping tool structures the reasons underneath it, and the clarity score tool flags the sentences that stumble before they persuade. The tone analyzer in this domain catches the emotional register the appeal-to-emotion rule points at.",
    howTo: [
      { step: "Paste the passage into the input panel." },
      { step: "Read the findings with their quoted sentences." },
      { step: "Judge each finding against its context." },
      { step: "Copy the report, edit, and run the passage again." },
    ],
    whenToUse:
      "Use the logical fallacy detector when a passage must survive hostile readers — a review, a debate, an op-ed. The {{counterargument-generator|Counterargument Generator}} drafts the objections the wording invites, and the {{argument-mapping-tool|Argument Mapping Tool}} rebuilds the structure the findings point at. When the problem is register rather than logic, the tone analyzer in this domain names the drift, and the clarity score tool cleans the sentences.",
    faqs: [
      {
        q: "Which fallacies does the detector know?",
        a: "Nine published patterns: appeal to popularity, false dilemma, hasty generalisation, slippery slope, ad hominem, straw man, appeal to authority, circular reasoning and appeal to emotion. Each rule is a set of phrase patterns, and the list is fixed.",
      },
      {
        q: "It flagged my sentence — is it a fallacy?",
        a: "It is a suspect. The rule matched the wording a fallacy usually travels in, but context decides: citing an authority is normal in a literature review, and always can be literal. Read the quoted sentence and judge.",
      },
      {
        q: "Why quote the whole sentence?",
        a: "So the finding points somewhere. A score without evidence teaches nothing; the quoted sentence lets you see exactly which words tripped the rule and whether they are a problem in context.",
      },
      {
        q: "Does a clean pass mean the argument is sound?",
        a: "No. The detector matches wording patterns; an unsound argument in careful wording passes clean. The tool narrows where to look, and the scope panel states that limit plainly.",
      },
      {
        q: "Is my passage uploaded anywhere?",
        a: "No. The split, the matching and the report all run in the page from the text you pasted, and the passage is gone when the tab closes unless you copied the report.",
      },
    ],
  },

  "thesis-statement-builder": {
    keywords: [
      "thesis statement builder",
      "thesis statement",
      "research question",
      "three reasons",
    ],
    intro:
      "The Thesis Statement Builder assembles a debatable thesis from a topic, a position and up to three reasons, then checks the habits that make a thesis gradeable.",
    content:
      "A thesis statement is a position someone could reasonably dispute, and this thesis statement builder assembles yours from three parts. Name the topic, state the position the paper defends, and list up to three reasons; the tool joins them into one sentence — topic, position, because, reasons — and checks the habits that separate a thesis from a topic sentence.\n\nThe thesis panel takes the three parts. The statement panel shows the assembled sentence with its word count, and the checks panel names the habits that weaken a thesis: hedging verbs like I think or in my opinion, vague nouns like things, stuff or society, a thesis with no reasons behind it, and a statement so agreed nobody needs to read the paper. Scope and limits says the tool assembles and checks; it cannot judge whether the position is true or whether the evidence will hold.\n\n- Topic: the subject the paper is about, named once and plainly.\n- Position: what the paper claims, phrased so a reasonable reader could disagree.\n- Reasons: up to three, joined with and or commas depending on the count.\n- Output: one sentence — topic, position, because, reasons — with a word count beside it.\n- Checks: hedging, vagueness, missing reasons, and the obviousness test.\n\nThe assembly is sentence composition: the topic and position are joined and capitalised, the reasons are joined with commas or and by count, and the whole is ended with a single period. The checks are pattern lookups over a fixed hedge list and a fixed vagueness list, so the same wording always produces the same notes. Nothing about the argument is inferred; the reasons are exactly as strong as you wrote them. Read the notes as editing instructions rather than verdicts, because each one points at a habit you can fix in a single pass.\n\n- The builder does not supply a position; a thesis without a real claim is a summary.\n- The vagueness list is fixed; a vague word outside it passes the check.\n- Three reasons is the structural maximum, not a quality guarantee.\n- The word count is information, not a limit; disciplines differ on length.\n- The sentence is not saved anywhere, so copy it before closing the page.\n\nWrite the reasons before the position and the sentence nearly writes itself: what the paper can actually prove decides what it should claim. Then read the thesis against the research question the paper answers — if the question asks why, the thesis must carry reasons, and if it asks whether, the position must be falsifiable. Test the statement by arguing its opposite: if no reasonable person would argue the other side, the position is a fact wearing a thesis statement's clothes, and the paper has nothing to defend. Keep the strongest reason last, because the because clause is the part a sceptical reader reads first, and trim hedges until the sentence would survive being said out loud in a seminar.\n\nThe neighbours carry the argument forward: the argument mapping tool structures the reasons into claim, evidence and warrant, the counterargument generator drafts the objections a reader will raise, and the outline builder turns the finished statement into sections. When the wording drifts academic, the academic writing tone checker pulls the register back.",
    howTo: [
      { step: "Fill the topic, the position and up to three reasons." },
      { step: "Read the assembled statement and its word count." },
      { step: "Work through the checks — hedging, vagueness, missing reasons." },
      { step: "Copy the thesis and argue its opposite once before drafting." },
    ],
    whenToUse:
      "Use the thesis statement builder when the research question is settled and the one-sentence answer is not. The {{argument-mapping-tool|Argument Mapping Tool}} structures the reasons the thesis lists, and the {{counterargument-generator|Counterargument Generator}} drafts the objections the paper must answer. When the statement needs to become a paper, the {{outline-builder|Outline Builder}} turns it into sections, and the academic writing tone checker in this domain keeps the register honest.",
    faqs: [
      {
        q: "Why does the thesis need reasons in it?",
        a: "Because a thesis with reasons is a promise the paper can keep: each reason becomes a section, and the reader knows where the argument is going. The because clause is what separates a position from an announcement of a topic.",
      },
      {
        q: "What counts as a vague word?",
        a: "A fixed list — things, stuff, society, people, interesting, important, good, bad — matched as whole words. The list catches the nouns that most often hide an unargued claim, though a vague phrase outside it will pass.",
      },
      {
        q: "Can the tool tell me if my thesis is good?",
        a: "No. It checks mechanical habits — hedging, vagueness, structure — and says nothing about whether the position is true, original or defensible. Those are judgements for you and your reader.",
      },
      {
        q: "How long should the statement be?",
        a: "Long enough to carry the reasons and short enough to hold in one breath, which for three reasons usually lands between twenty-five and forty words. The panel prints the count; no discipline-wide limit is enforced.",
      },
      {
        q: "Is my thesis sent anywhere?",
        a: "No. The assembly and checks run in the page from the fields you typed, and the sentence disappears when the tab closes unless you copied it first.",
      },
    ],
  },

  "argument-mapping-tool": {
    keywords: [
      "argument mapping tool",
      "evidence",
      "warrant",
      "reasons",
    ],
    intro:
      "The Argument Mapping Tool structures a conclusion and its reasons into claim, evidence and warrant, then reports which links are missing.",
    content:
      "An argument is only as strong as its weakest hidden link, and this argument mapping tool makes the links explicit. Give it a conclusion, at least two reasons, and for each reason the evidence that supports it and the warrant that connects the evidence to the claim; the tool renders the map as markdown, numbers the links, and reports which parts of the structure are missing.\n\nThe map panel holds the conclusion and the reason rows. Each reason carries its own evidence and warrant fields, so a reason with no evidence behind it is visible immediately. The output panel shows the assembled map — conclusion first, then each reason with its supports and the warrant that licenses the step — and the completeness panel reports the counts: reasons supplied, evidence supplied, warrants supplied. Scope and limits says the tool checks structure, not truth.\n\n- Conclusion: the claim the whole map exists to support.\n- Reasons: at least two, because one reason is an assertion rather than an argument.\n- Evidence: what the reason rests on — a figure, a source, an observation.\n- Warrant: the principle that makes the evidence count for the reason.\n- Output: markdown you can paste into notes, slides or a paper draft.\n- Completeness: a count of every link, so gaps cannot hide.\n\nThe rendering is markdown composition: the conclusion is written as a heading, each reason becomes a numbered block, and the evidence and warrant sit under their reason with labels. The completeness check is arithmetic — counts of filled and empty fields — and the checks panel names the specific gaps rather than scoring the whole. The map never evaluates whether the evidence is real or whether the warrant is sound; it shows you the shape so you can judge. Map the argument early and again after the objections land; a structure that survives its own counterarguments is the draft that gets to keep its conclusion.\n\n- A filled map is not a sound argument; evidence can be weak and warrants wrong.\n- Two reasons is the structural minimum, not an ideal count.\n- The tool does not rank reasons or order them by strength.\n- Warrants are the part writers skip; the panel flags a missing one by name.\n- The map is not stored, so copy the markdown before leaving the page.\n\nFill the warrants last and the map will teach you something: the warrant is where weak arguments hide, because a reason that feels obvious is usually resting on a principle nobody has stated out loud. Write each warrant as a sentence a sceptic could accept — when evidence of this kind holds, the conclusion follows — and the map stops being a diagram and becomes a test. Then read the reasons against each other: two reasons that both rest on the same warrant are one reason wearing two coats, and the completeness panel cannot catch that, only you can. When a reason resists a warrant, split it or cut it, because an argument with three honest links beats one with five decorative ones.\n\nThe neighbours test the map from outside: the logical fallacy detector scans the finished wording for named fallacy patterns, the counterargument generator drafts the objections the map has not answered, and the thesis statement builder compresses the conclusion into one sentence. The clarity score tool in this domain flags the sentences a reader will stumble over.",
    howTo: [
      { step: "Write the conclusion and at least two reasons." },
      { step: "Add the evidence and the warrant for each reason." },
      { step: "Read the completeness panel and fill the named gaps." },
      { step: "Copy the markdown map into your draft or notes." },
    ],
    whenToUse:
      "Use the argument mapping tool when a position feels right but the structure behind it is fog. The {{logical-fallacy-detector|Logical Fallacy Detector}} scans the wording for named fallacies, and the {{counterargument-generator|Counterargument Generator}} drafts what an opponent would say to the map. When the conclusion needs one sentence, the {{thesis-statement-builder|Thesis Statement Builder}} compresses it, and the clarity score tool in this domain cleans up the prose.",
    faqs: [
      {
        q: "What is a warrant, exactly?",
        a: "The principle that makes the evidence count for the reason: if the evidence is this survey of two hundred users, the warrant is that two hundred users are enough to represent the group. Warrants are the links writers leave implicit, which is where bad arguments hide.",
      },
      {
        q: "Why is one reason not enough?",
        a: "A single reason makes the conclusion rest entirely on one link, so the map cannot show whether the argument has breadth. Two reasons is the minimum for a structure worth reading; the tool enforces the floor without pretending it is a virtue.",
      },
      {
        q: "Does the tool check my evidence?",
        a: "No. It records what you supply and reports whether the fields are filled. Whether the evidence is real, current or relevant is outside the tool's reach, and the scope panel says so.",
      },
      {
        q: "What format is the output?",
        a: "Markdown: the conclusion as a heading, each reason as a numbered block with labelled evidence and warrant lines. Paste it into notes, a paper draft or a slide's speaker notes and the structure survives.",
      },
      {
        q: "Is my argument kept anywhere?",
        a: "No. The map is assembled in the page from what you typed, and nothing is stored or transmitted; the markdown is gone when the tab closes unless you copied it.",
      },
    ],
  },

  "survey-question-builder": {
    keywords: [
      "survey question builder",
      "leading question",
      "double-barrelled",
      "respondent",
    ],
    intro:
      "The Survey Question Builder checks each question against the four faults that ruin response data — leading, double-barrelled, absolute and loaded wording — and reports them per question.",
    content:
      "A survey is only as honest as its worst question, and this survey question builder reads every line the way a respondent's bias would. Paste the questions — one per line — and the tool checks each against the four published faults: leading wording that suggests the answer, double-barrelled questions that ask two things at once, absolutes that force a position, and loaded words that carry an evaluation; each question also gets a word count, because a question that cannot be read in one breath cannot be answered honestly.\n\nThe questions panel takes the lines. The report panel lists every question with its issues — the rule name, the note, and the word count — so a question with two faults shows both, and the summary counts the clean questions against the rest. The answer-type guide beside the panel pairs each question with the scale it suits: frequency, agreement, or the respondent's own words. Scope and limits says the builder detects wording patterns; it cannot know your respondents.\n\n- Four rules: leading, double-barrelled, absolute, loaded.\n- Leading: don't you agree, isn't it, obviously, clearly, surely.\n- Double-barrelled: any and or or that joins two asks in one question.\n- Absolute: always, never, every, everyone, all, none, only.\n- Loaded: radical, reckless, bureaucratic, dangerous, obvious, backward.\n- Per-question word count, with long questions named.\n\nThe analysis is rule matching: each line is checked against the four pattern sets, matched as whole words, and the word count runs from the shared tokenizer. The same survey always produces the same report, which makes the tool usable in a methods seminar — students can compare their rewrites against the same faults. Sort the report by fault rather than by line, because fixing every double-barrelled question in one pass teaches the habit faster than fixing one question at a time. No sampling knowledge is applied and no question is rewritten for you. Run the set through the report after every rewrite round; the clean count rising is the instrument getting ready for the field.\n\n- The rules catch wording habits; a leading question in careful words passes.\n- The and test is strict: two genuinely single ideas joined by and are flagged anyway.\n- The word-count line is guidance, not a limit.\n- Answer types are advice beside the panel, not enforced structure.\n- Nothing is stored, so copy the report before revising.\n\nFix the double-barrelled questions first — split every and into two lines — because they corrupt the data silently: a respondent who agrees with half the question has nowhere to put the disagreement, and no statistical cleaning recovers it. Then blunt the leading questions by deleting the adverb, not rephrasing the ask: obviously and clearly are the words that do the leading, and the sentence behind them is usually fine. Absolutes come next, because always and never force respondents who mean sometimes to choose a lie. Read the finished survey as the respondent — one breath per question, one idea per line, no adjective the data cannot cash.\n\nThe neighbours clean the surrounding documents: the readability grade scorer shows how plain the instrument reads, the IRB consent form template carries the study's ethics wrapper, and the meeting summary formatter structures the findings session afterwards. The tone analyzer in this domain catches the register that drifts formal.",
    howTo: [
      { step: "Paste the questions, one per line." },
      { step: "Read each question's issues and word count." },
      { step: "Split double-barrelled lines and delete leading adverbs." },
      { step: "Re-paste the revised set until the report is clean." },
    ],
    whenToUse:
      "Use the survey question builder when an instrument exists and the fielding date is close. The {{readability-grade-scorer|Readability Grade Scorer}} shows how plain the questions read, and the {{irb-consent-form-template|IRB Consent Form Template}} builds the consent wrapper the survey ships with. When the results come back, the {{meeting-summary-formatter|Meeting Summary Formatter}} structures the readout, and the tone analyzer in this domain keeps the follow-up neutral.",
    faqs: [
      {
        q: "What are the four faults?",
        a: "Leading — wording that suggests the answer; double-barrelled — two asks joined by and or or; absolute — always, never, every and friends that force a false position; loaded — words like radical or dangerous that carry the evaluation inside the question. Each rule is a fixed word list.",
      },
      {
        q: "Why is every and flagged?",
        a: "Because the test cannot tell a true compound ask from two ideas stapled together, and the safe fix is the same either way: split the line into two questions. The rule is strict on purpose, and the note tells you which word triggered it.",
      },
      {
        q: "How long should a question be?",
        a: "Short enough to read in one breath — the report names questions past the comfortable band. Length is guidance rather than a rule, because a technical question sometimes needs its clause.",
      },
      {
        q: "Does the builder rewrite my questions?",
        a: "No. It names the fault, quotes the note and moves on; the rewrite is the researcher's job, which is where the judgement lives. The scope note states the boundary.",
      },
      {
        q: "Is my survey stored?",
        a: "No. The analysis runs in the page from the lines you pasted, and nothing is stored or sent; the report is gone when the tab closes unless you copied it.",
      },
    ],
  },

  "peer-review-checklist": {
    keywords: [
      "peer review checklist",
      "reproducible",
      "limitations",
      "reviewer",
    ],
    intro:
      "The Peer Review Checklist walks a manuscript through twelve published review questions in six sections, tracks progress, and assembles the reviewer's report from your notes.",
    content:
      "A review is a service, and this peer review checklist keeps it thorough instead of loud. The tool carries twelve questions across six sections — summary, introduction, methods, results, discussion and presentation — from whether the abstract states what was actually done to whether the references are complete and the figures legible. Tick the questions as you verify them, attach a note to any question you answered no, and the tool assembles the review report: section by section, the verified strengths, the named problems and your notes in the reviewers' usual order.\n\nThe checklist panel shows the twelve questions grouped by section, each with its tick box and its note field. The progress panel counts the answered questions by section, so the sections you have quietly skipped are visible, and the report panel assembles the finished review — the checklist's structure becomes the report's headings. Scope and limits says the checklist organises your judgement; it does not replace it.\n\n- Twelve questions: the published concerns a reviewer owes every manuscript.\n- Six sections: summary, introduction, methods, results, discussion, presentation.\n- Notes per question: the reason behind every no, captured where it was found.\n- Progress: answered counts per section, so gaps cannot hide.\n- Report: the ticks and notes assembled into a pasteable review.\n\nThe mechanics are checklist state: each question holds its tick and its note, the progress counts run per section, and the report is the state rendered in order. The questions are fixed and published — whether the methods are reproducible, whether the statistics are reported in judgeable detail, whether the limitations are named honestly, whether the conclusion follows from the evidence — so two reviewers using the tool are reviewing the same manuscript against the same floor.\n\n- The checklist is the floor of a review, not the ceiling; expertise adds the rest.\n- A ticked box records a check, not a virtue.\n- The report is plain text; your venue's form may want its own shape.\n- Anonymous or signed, the report reads the same — the tool takes no side.\n- Nothing is stored, so copy the report before closing the tab.\n\nAnswer the methods section first and the review gets fairer: reproducibility is where most manuscripts fail, and a reviewer who has verified the methods section reads the results with calibrated trust rather than inherited optimism. Write the note while the no is fresh — a note written from memory a week later defends the author's feelings instead of the manuscript — and keep every note about the work, never the author, because the checklist's flat tone is the review's best etiquette. Read the progress panel before submitting: the section with zero answers is the section your report will be asked about, and it is better asked now. Then read the assembled report once as the author would — every no with its reason, every strength named — and cut any sentence you would not sign.\n\nThe neighbours check the surface the review walks on: the readability grade scorer shows how hard the prose runs, the clarity score tool names the sentences that stumble, and the scientific abstract builder tightens the summary section the first question tests. The academic writing tone checker in this domain keeps the report's register even.",
    howTo: [
      { step: "Read the manuscript with the twelve questions open." },
      { step: "Tick each question you can verify and note every no." },
      { step: "Watch the progress panel for the sections you skipped." },
      { step: "Copy the assembled report and read it once as the author." },
    ],
    whenToUse:
      "Use the peer review checklist when a manuscript is open in one window and your duty to it in the other. The {{readability-grade-scorer|Readability Grade Scorer}} measures the prose the presentation questions ask about, and the {{clarity-score-tool|Clarity Score Tool}} names the sentences to quote in the report. When the summary question fails, the {{scientific-abstract-builder|Scientific Abstract Builder}} shows what the abstract owed, and the academic writing tone checker in this domain levels the report's tone.",
    faqs: [
      {
        q: "What are the twelve questions?",
        a: "Two on the summary, two on the introduction, three on methods including reproducibility and ethics, two on results including the statistics, two on discussion including honest limitations, and one on presentation. Each is a published concern, phrased as a checkable question.",
      },
      {
        q: "Why does section order matter in the report?",
        a: "Because it is the order editors and authors read in: summary first, presentation last. The assembled report keeps that order so the reader's first impression is the work's own structure, not the reviewer's mood.",
      },
      {
        q: "Should every no carry a note?",
        a: "Yes. A ticked no without a reason is an assertion the author cannot act on, and the note field sits beside the question precisely so the reason is captured where it was found.",
      },
      {
        q: "Does the checklist write the review for me?",
        a: "No. It structures the questions, tracks the progress and assembles your ticks and notes into report form. The judgement — and the fairness — remain entirely yours.",
      },
      {
        q: "Is the review saved between sessions?",
        a: "No. The checklist state lives in the page, so finish the session or copy the report before closing the tab; nothing is stored or transmitted.",
      },
    ],
  },
};
