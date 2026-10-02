import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B23, specialized and academic: authored SEO entries for the
 * counterargument generator, the debate script formatter, the IRB consent form
 * template, the plagiarism self-check prep tool and the writing portfolio
 * builder.
 *
 * The shared line in this batch is honesty about the artefact: a generated
 * objection is still the writer's to defend, a consent form is a drafting aid
 * rather than review, a prep tool cannot detect plagiarism, and a portfolio
 * outline does not judge the writing. Keys are registry slugs; see
 * ../tool-seo.ts for the contract.
 */
export const B23_SPECIALIZED_SEO: Record<string, ToolSeo> = {
  "counterargument-generator": {
    keywords: ["counterargument generator", "counterargument", "counterexample", "alternative cause", "argumentation"],
    intro:
      "The counterargument generator reads the shape of a claim, orders ten published challenge moves for it, and names the wording — absolutes, vague quantities, a missing reason — that a challenger will attack first.",
    content: `The counterargument generator does not invent objections. It selects from ten moves that argumentation has used for centuries — boundary, counterexample, alternative cause, mechanism, evidence against, base rate, trade-off, timeline, measurement and definition — and orders them so the ones that answer the claim's own shape come first. That restriction is the point. An objection the tool made up would not be the writer's to defend, so every move is phrased as a question the writer answers in their own terms.

The claim's shape decides the emphasis. A causal claim, one built on because or leads to, is answered first by an alternative cause and by the mechanism question, because those are the two ways a causal claim fails. A policy claim, one that says should or must, is answered first by the boundary and the trade-off: where does the rule stop working, and who pays for it. A universal claim — all, every, always, never — is answered by a single counterexample, which is why absolutes are surfaced separately and flagged as the weakest point in the sentence.

A counterexample is only as good as its relevance, and the frames say so. The tool asks for a case where the opposite holds and, just as importantly, for the condition under which the objection holds, because an objection with no conditions is an opinion. The checklist that accompanies every plan makes the discipline explicit: state the claim in its strongest form before objecting, name the condition, say what evidence would make you withdraw the objection, and answer the strongest version rather than the weakest wording.

The wording checks are drawn from the same tradition. Unquantified words such as many, most, often and significant cannot be weighed, so they are listed and the writer is asked for a number. A claim with no stated reason is flagged for a different reason: a counterargument has nothing to aim at until the claim says why it is supposed to be true. These are the openings a practised opponent looks for, and seeing them listed before the debate is the cheapest way to close them.

What the tool cannot do is know your subject. It does not check whether the evidence exists, whether the cited mechanism operates in your case, or whether the counterexample you choose is representative. It also cannot tell you which objection is strongest — that judgement depends on the audience and the stakes, and it stays with the writer. Treat the ten moves as a rehearsal schedule: the argument you can answer fastest is the one you should expect to hear.

A habit that makes the generator more useful is to write the claim as an opponent would state it, not as you would. The strongest counterargument attaches to the strongest version, and a claim softened for the tool produces objections that bounce off the real one. If the rehearsal feels easy, the claim has probably been weakened somewhere between the page and the argument, and the wording checks are the first place to look.`,
    howTo: [
      { step: "Write the claim as it would actually be argued, not softened for the tool." },
      { step: "Read the detected shape and the wording checks before the moves." },
      { step: "Answer the featured moves first, in a sentence each, in your own terms." },
      { step: "Work the remaining moves and mark the two you cannot answer yet." },
      { step: "Use the checklist to state the condition and the falsifying evidence for each objection you keep." },
    ],
    whenToUse: `Use the counterargument generator when a claim is drafted and you expect it to be contested: a thesis, a proposal, an op-ed, a debate case. It is a rehearsal, not a verdict, so run it before the piece goes anywhere rather than after a reviewer has found the hole.
When the claim itself is still loose, the {{thesis-statement-builder|Thesis Statement Builder}} tightens it first. To map the argument your objections must survive, the {{argument-mapping-tool|Argument Mapping Tool}} lays out reasons, evidence and warrants, and the {{logical-fallacy-detector|Logical Fallacy Detector}} covers the named fallacies that a good objection should not rely on.`,
    faqs: [
      {
        q: "Does the tool write my objections?",
        a: "No. It orders ten published challenge moves and phrases each as a question. The content of every objection stays yours, because an objection you cannot defend in your own words is worse than none.",
      },
      {
        q: "Why are absolutes singled out?",
        a: "Because all, every, always, never and their relatives make a claim refutable by a single exception. A challenger knows this, so the wording check surfaces it before the debate rather than during it.",
      },
      {
        q: "What is the difference between an alternative cause and a mechanism question?",
        a: "The alternative cause asks what else changed at the same time and could have produced the effect. The mechanism question asks how the claimed cause is supposed to work, and whether the effect still appears when that mechanism is absent.",
      },
      {
        q: "What does the claim shape change?",
        a: "The ordering. Causal claims feature the alternative cause and mechanism moves, policy claims feature the boundary and the trade-off, predictions feature the timeline and the base rate, and so on. All ten moves remain available.",
      },
      {
        q: "Is a counterargument the same as a rebuttal?",
        a: "Not quite. A counterargument attacks the claim on its own terms; a rebuttal answers an argument someone has already made. The generator produces the material for both, but a rebuttal should also name the argument it is answering.",
      },
    ],
  },

  "debate-script-formatter": {
    keywords: ["debate script formatter", "speaking order", "british parliamentary", "case line", "rebuttal"],
    intro:
      "The debate script formatter places one case line per speech into a published speaking order — British Parliamentary, Asian Parliamentary, Public Forum or Lincoln–Douglas — with time allocations and the round's missing pieces named.",
    content: `The debate script formatter turns a list of case lines into a formatted round. Each line is a role and what the speech establishes, separated by a pipe, and the role is matched against the chosen format's abbreviations and full names, so PM, OG2 and Prime Minister all land on the opening government speech. The output is the script itself: numbered speeches, each with its side, its time allocation and either the case text or the cue for what that slot has to do.

The four formats carry the orders leagues actually use. British Parliamentary runs eight speeches of seven minutes, from the Prime Minister through the whips, and the page keeps the rule that the closing half must extend the opening half's case. Asian Parliamentary runs six speeches of seven minutes with the rebuttal load on the third speakers. Public Forum runs four speeches of four minutes with crossfires, and Lincoln–Douglas keeps the value structure with its constructive and rebuttal speeches. The allocations are the common published norms, and the page says plainly that a tournament invitation overrides them.

The checks are the things that make a script unusable in a round rather than merely untidy. A side with no case drafted at all is flagged first, because a one-sided script is a monologue. Empty slots are counted per side, so a half-drafted bench is visible at a glance. A side with no rebuttal speech drafted is flagged separately: a side that only repeats its case loses the exchange, however good the case is. Cases under fifteen words are called placeholders rather than arguments, crossfire slots with nothing in them are asked for their questions, and role labels the format does not contain are named rather than silently dropped.

The format also makes the shape of the round visible. Notice where the rebuttal speeches sit, and whether the line you wrote for a whip is really a summary of the clash or a third constructive speech in disguise. The whip slots are for comparing the benches and naming the central question; a whip speech that introduces a new argument is a different speech from the one the order expects.

What the tool cannot do is judge the debating. It does not know whether a case is true, whether a rebuttal answers the argument it names, or whether the extension is genuinely new. It formats the round, allocates the time and reports the gaps in the script, and the arguments remain entirely the debater's work.

A rehearsal habit worth keeping is to draft the two rebuttal speeches before the whips: the speaking order is a schedule, not a writing order. Writing the rebuttal while the case is fresh exposes the clash the round will actually turn on, and the whip speeches then have something to summarise rather than a third argument to introduce. The formatter does not enforce that way of working. It only makes the slots visible, which is usually enough to notice that a case was built before anyone read the other side's line.`,
    howTo: [
      { step: "Choose the format the round will use, since the order and times change with it." },
      { step: "Write one line per speech as role and what the speech establishes." },
      { step: "Read the numbered script and check that each case sits in its proper slot." },
      { step: "Clear the checks: both sides, a rebuttal per side, no placeholders." },
      { step: "Copy the script and keep the per slot cues for the speeches you have not drafted." },
    ],
    whenToUse: `Use the debate script formatter once the cases are drafted and the round needs assembling: a tournament prep sheet, a practice round, a classroom debate. It is most useful when you have arguments but no speaking order in mind, because the format decides which speech carries the rebuttal and which one compares the benches.
The arguments themselves are better built first. The {{argument-mapping-tool|Argument Mapping Tool}} keeps claim, reason, evidence and warrant together, and the {{counterargument-generator|Counterargument Generator}} rehearses the objections a good opposition will raise against each case.`,
    faqs: [
      {
        q: "Which speaking orders are included?",
        a: "Four: British Parliamentary with eight speeches of seven minutes, Asian Parliamentary with six of seven, Public Forum with four of four plus crossfires, and Lincoln–Douglas with its constructive and rebuttal structure.",
      },
      {
        q: "How are roles matched to slots?",
        a: "By slot name, abbreviation or a listed alias. PM, OG1, first government and Prime Minister all resolve to the opening government speech, and a label the format does not contain is reported rather than dropped.",
      },
      {
        q: "What does a rebuttal warning mean?",
        a: "That a side has cases drafted but no rebuttal speech among them. The check exists because a side that never engages the other case loses the exchange no matter how strong its own material is.",
      },
      {
        q: "Can I use the times for my league?",
        a: "Only as a starting point. The allocations are common published norms; if your tournament uses different times or adds reply speeches, follow the invitation and treat the script as a structure rather than a schedule.",
      },
      {
        q: "Why are cases under fifteen words flagged?",
        a: "Because at that length the line is a placeholder — a topic rather than an argument. The flag names the speeches concerned so they can be drafted or scheduled, instead of being discovered empty on the day.",
      },
    ],
  },

  "irb-consent-form-template": {
    keywords: ["irb consent form", "informed consent", "review board", "signature block", "voluntary participation"],
    intro:
      "The IRB consent form template assembles the published elements of informed consent from your study's own answers and flags the ones that are missing, overstated or written past a comfortable reading length.",
    content: `The irb consent form template builds the document from the published elements of informed consent rather than from a blank page. Those elements are the ones a review board checks in order: the study title and investigator, the purpose, what participation involves, the time required, the risks, the benefits, confidentiality, voluntary participation and withdrawal, the contacts, and the signature block. Each element is assembled from what you write, and an element that is empty is named rather than quietly omitted.

The drafting checks are the ones reviewers apply to the prose. A missing risk section is flagged even for minimal-risk studies, because the required statement is that the risk is no more than minimal, not that the study has none. A risk section that says there are no risks at all is flagged for the same reason: the phrase a review board accepts is a specific one, and using it is not a formality. Benefits that promise an outcome — guaranteed, will cure, assured — are flagged because the document may describe benefits but must not guarantee them.

Withdrawal gets its own attention, since it is the element participants actually rely on. The template always includes the voluntary statement, and when you describe payment it checks whether withdrawal is addressed: a study that pays twenty dollars per session should say how payment is prorated if someone stops early, because the alternative is a participant who feels fined for leaving. The contact check looks for an email address or phone number, on the reasoning that a participant with only a name has nowhere to go. Long sentences are counted as well — a consent form is read once, quickly, by someone who did not choose the wording.

The additional elements are switches. Audio or video recording adds the transcription and identifier-removal language, future use of de-identified data adds the paragraph that lets a participant ask for removal before that point, vulnerable populations add the representative signature line and the assent language, and a waiver of documentation replaces the signature block with the verbal-consent statement.

What the template cannot do is decide whether your study is exempt, whether a waiver is approvable, or what your particular board requires. Those are the board's decisions, and its own template overrides this one. Treat the page as a drafting aid that makes sure no element is silently absent, and bring the result to your board rather than past it.

The order of the elements is not arbitrary. Purpose, procedures and duration tell a participant what they are being asked to do. Risks, benefits and confidentiality tell them what it may cost and how it will be handled. Voluntary participation and withdrawal tell them they can leave. Contacts and the signature block make the agreement verifiable. A form that opens with confidentiality and never states the purpose is out of the order a participant reads in, even when every element is present. Reading your draft aloud in this order is the fastest way to find the element that is technically there but functionally buried.`,
    howTo: [
      { step: "Fill in the study identity, purpose, procedures and time first." },
      { step: "Write the risk and benefit sections in the review board's own language." },
      { step: "Set the switches for recording, future use, vulnerable populations or a waiver." },
      { step: "Clear the checks, paying attention to payment and contact details." },
      { step: "Copy or download the form and attach it to your protocol submission." },
    ],
    whenToUse: `Use the irb consent form template when a protocol is being assembled and the consent document has to be drafted. It is most useful before submission, because the checks catch the missing element or the overstated benefit while there is still time to change the protocol wording that produced it.
For the study around the form, the {{peer-review-checklist|Peer Review Checklist}} covers the paper's own sections, and the {{technical-report-template|Technical Report Template}} assembles the report a funder or committee will read alongside the protocol.`,
    faqs: [
      {
        q: "Which consent elements does the template cover?",
        a: "The basic and additional elements of the Common Rule: title and investigator, purpose, procedures, duration, risks, benefits, confidentiality, voluntary participation and withdrawal, contacts, and the signature block, plus recording, future use and vulnerable-population language.",
      },
      {
        q: "Why can I not simply say there are no risks?",
        a: "Because the accepted wording for a low-risk study is that the risk is no more than minimal. Saying there are no risks invites a reviewer to look for the discomfort you did not mention, and the check asks for the phrase your board expects.",
      },
      {
        q: "What is a waiver of documentation?",
        a: "An approved waiver means no signature is collected; consent is still obtained, usually read aloud and recorded. The template swaps the signature block for the verbal-consent statement so the form matches the approval.",
      },
      {
        q: "Why is payment tied to withdrawal?",
        a: "Because participants should know before they start how payment works if they stop. The check asks for prorating language whenever compensation is described, so leaving early does not read as forfeiting money already earned.",
      },
      {
        q: "Does the template replace review board approval?",
        a: "No. It is a drafting aid structured on the published elements. Exemptions, waivers and the exact wording your institution requires are decided by your board, whose template overrides this one.",
      },
    ],
  },

  "plagiarism-self-check-prep-tool": {
    keywords: ["plagiarism self-check", "similarity score", "quotation marks", "citation", "similarity report"],
    intro:
      "The plagiarism self-check prep tool cannot detect plagiarism, and says so; it checks the quotation hygiene and the citation placement that decide what a similarity report will actually say.",
    content: `The plagiarism self-check prep tool begins with a limitation that most tools in this space hide: it cannot detect plagiarism. Similarity detection means comparing a document against a corpus, and a corpus is a service rather than a local script. What the page does instead is the preparation that decides what a similarity report will say. Unmarked quotations and over-quoted sections are the two causes of alarming similarity scores that are not plagiarism at all, and both are visible from the draft itself.

Every quotation in the draft is found, whether it uses straight or curly quotation marks, and listed with its length, the sentence it sits in, and whether a citation appears in that sentence or the next. Citation proximity is the check that matters most in practice: a checker discounts matches that point at a source, and a quotation whose source is three sentences away discounts nothing. The tool also counts the citations in the draft, so a long piece with none is flagged as plainly as a short one with a single unsupported quote.

Quoted material is measured as a share of the whole draft. Past roughly fifteen per cent, even fully cited work is doing the writing rather than supporting it, and the check says so with the number. Quotations longer than forty words are flagged for block treatment, because that is the conventional threshold and because a long inline quote is easy to lose a citation for. Unbalanced quotation marks are reported first of all, since a single unclosed mark can swallow an entire sentence into a match.

The prep checklist covers the submission itself. Send plain text so formatting is not compared; include the reference list in the same file so cited matches can be discounted; list the sources you consulted but did not cite, because some services score against everything you submit; keep quotations marked, since the report will show the match either way but a marked and cited quote is explained in one line; and read every flagged passage against its source before changing a word.

What the page cannot do is compare your text to anything outside itself, judge whether a passage is properly attributed in a disciplinary sense, or tell you whether a similarity score is acceptable for your course or venue. A high score is a question, not a verdict, and the checklist ends by saying so.

The most common false alarm is the long quotation that is properly cited. A similarity report highlights it like any other match, and a writer who has not prepared an explanation may cut a quotation that was doing real work. The prep report is that explanation: a list of every quotation, its length and the citation beside it, ready to be compared line by line with the service's output. Keep it with the draft. When a flagged passage is on the list, the answer is one sentence; when it is not, the report shows where to look, which is the difference between revising calmly and rewriting under pressure.`,
    howTo: [
      { step: "Paste the draft as plain text, quotations included." },
      { step: "Read the quotation report: each quote's length and whether it is cited." },
      { step: "Fix unbalanced marks, uncited quotes and block-length quotations." },
      { step: "Check the quoted share and reduce it if the draft is mostly borrowed." },
      { step: "Work the preparation checklist before submitting to a similarity service." },
    ],
    whenToUse: `Use the plagiarism self-check prep tool before submitting a draft to a similarity service, especially when the draft leans on sources: an essay with long quotations, a report quoting policy documents, a thesis chapter built from prior work. Fixing the quotation hygiene first turns an alarming report into an explainable one.
When a citation is missing rather than misplaced, the {{in-text-citation-builder|In-Text Citation Builder}} writes it, and the {{reference-list-generator|Reference List Generator}} assembles the list that lets a checker discount cited matches.`,
    faqs: [
      {
        q: "Can this tool tell me whether my text is plagiarised?",
        a: "No, and no local tool can. Detecting similarity requires a corpus to compare against, which is a service. This tool prepares the draft so the report from that service is accurate and explainable, and it says so on the page.",
      },
      {
        q: "Why is fifteen per cent the quoted-share line?",
        a: "It is a working threshold rather than a rule: past roughly that share, quotations are carrying the argument instead of supporting it, even when every one is cited. The check reports the actual number so you can judge it against your context.",
      },
      {
        q: "What counts as a citation for the proximity check?",
        a: "A parenthetical source with a year, a bracketed number such as a reference marker, or a footnote cue, appearing in the quotation's own sentence or the sentence immediately after it.",
      },
      {
        q: "Why flag quotations over forty words?",
        a: "Because that is the conventional threshold for setting a quotation as a block, and a long inline quotation is where citations most often get separated from the words they cover.",
      },
      {
        q: "Should I list sources I read but did not cite?",
        a: "Some services compare against everything submitted, so an uncited source you attach can produce a match with no explanation. The checklist asks you to list them deliberately rather than by accident.",
      },
    ],
  },

  "writing-portfolio-builder": {
    keywords: ["writing portfolio", "selected clips", "portfolio outline", "genre", "about paragraph"],
    intro:
      "The writing portfolio builder groups your pieces by genre, orders them newest first, trims the selection to a readable size and names the two failures a portfolio usually has: one genre and nothing recent.",
    content: `The writing portfolio builder starts from a list rather than a template: one piece per line, with the title, genre, where it appeared and the year. Genre, outlet and year may be left empty, and the checks name what is missing instead of hiding it. The pieces are grouped into sections by genre, ordered newest first within each section, and undated pieces sit at the end of their section rather than jumping to the front, so the ordering problem stays visible until it is fixed.

The selection is capped at ten pieces, taking one from each genre first and then the most recent of the rest. Ten is not a magic number, it is the size an editor will actually read in one sitting, and a portfolio that opens with thirty links is asking for a decision that most readers will not make. The full list still appears in the outline; the cap only marks which pieces carry the first impression, and the selected count is shown beside the total.

The checks are the failures that are visible from the list alone. A portfolio of fewer than six pieces reads as a sample rather than a body of work. A single genre shows no range, however good the pieces are, and the check asks for another category or a split by audience. A piece with no year cannot be ordered, and the check names it rather than guessing. Work that stopped three years ago reads as a closed chapter, so the most recent year is compared with the current one. Pieces with no outlet are not wrong — unpublished work belongs in a portfolio — but a portfolio where nothing was ever placed needs a context line saying what each piece is.

The About scaffold is assembled from the same material: a positioning line, the genres you actually have, and a three-sentence paragraph structure that names two pieces rather than describing them. Naming is the discipline that separates an About page from a claim: an editor can follow a title, and cannot follow a description of how passionate you are about storytelling.

What the tool cannot do is judge the writing. It cannot tell whether the pieces are good, whether the outlets matter, or whether the range is the right range for the work you want next. It organises the list, applies the published conventions of portfolio size and recency, and leaves the judgement where it belongs.

The portfolio outline is the working document; the page you send is a shorter cut of it. Start from the outline, mark the selected clips, and write one sentence of context for any piece that needs it — the competition it was shortlisted for, the series it belonged to, the client it was written for. The about paragraph is assembled from the same material, so the two stay consistent: the pieces prove the positioning line rather than the other way round. When they disagree, the positioning line is the part to change. Keep the longer outline for yourself and send the trimmed version.`,
    howTo: [
      { step: "Paste one piece per line as title, genre, where it appeared and year." },
      { step: "Add the positioning line you want the portfolio to open with." },
      { step: "Read the grouped outline and check the ordering within each genre." },
      { step: "Clear the checks you can fix: years, range, recent work, context lines." },
      { step: "Copy the outline and the About scaffold into the page or document you are building." },
    ],
    whenToUse: `Use the writing portfolio builder when applying for work that asks for clips: a staff job, a freelance pitch, a residency, a course. It is most useful when the list has grown by accident, because grouping and recency checks turn an archive into a selection.
The About scaffold pairs with the {{author-profile-writer|Author Profile Writer}} when a longer biography is needed, and the {{bio-generator|Bio Generator}} covers the short version for a byline. For a platform-specific profile, the {{social-post-caption-builder|Social Post Caption Builder}} handles the posts that point at the portfolio.`,
    faqs: [
      {
        q: "How many pieces should a portfolio contain?",
        a: "Six to ten is the working range: enough to show range, short enough to be read in one sitting. The builder flags fewer than six as thin and marks a ten-piece selection from a longer list.",
      },
      {
        q: "Why does one genre get a warning?",
        a: "Because an editor reading ten pieces of the same kind learns one thing. If all your work is journalism, the check asks you to add another category or to split the portfolio by audience instead.",
      },
      {
        q: "How are pieces ordered?",
        a: "Newest first within each genre, with undated pieces at the end of their section. The years come from the lines you paste, so a missing year is reported rather than assumed.",
      },
      {
        q: "Does unpublished work belong in a portfolio?",
        a: "Yes, with context: a course, a competition, a personal project. The check only fires when nothing in the list says where any piece appeared, which leaves a reader with nothing to weigh.",
      },
      {
        q: "What is the About scaffold for?",
        a: "It structures a three-sentence paragraph: what you cover, two named pieces that show it, and where the work has appeared. Naming pieces rather than describing your interests is the part that makes it readable.",
      },
    ],
  },
};
