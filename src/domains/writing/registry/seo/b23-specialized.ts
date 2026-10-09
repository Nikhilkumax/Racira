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
    keywords: [
      "counterargument generator",
      "counterargument",
      "claim shapes",
      "concession",
    ],
    intro:
      "The Counterargument Generator reads a claim through six published frames, drafts the objections each frame produces, and flags the absolute wording that invites them.",
    content:
      "A claim survives contact with readers only if you met the objections first, and this counterargument generator drafts them for you. Paste the claim, pick its shape — policy, universal, predictive, causal, comparative or descriptive — and the tool applies the frames that fit that shape: where the claim stops being true, the counterexample that breaks it, the cost of acting on it, the definition it leans on. Each frame returns an objection prompt and a plan slot, and the wording check flags the absolutes that make objections easy.\n\nThe claim panel takes the claim and its shape. The objections panel lists one drafted counterargument per applicable frame, each with a prompt you can answer in a sentence, and the checklist panel carries the concession moves — name the objection, grant what is true in it, answer with the reason the claim still holds. The wording check names the absolutes in the claim: all, every, always, never, only, impossible. Scope and limits says the tool drafts objections from fixed frames; it cannot know your subject's literature.\n\n- Claim shapes: policy, universal, predictive, causal, comparative and descriptive.\n- Frames: boundary, counterexample, cost, definition and the rest, applied by shape.\n- Objection plan: each objection carries a prompt to answer and a slot for the answer.\n- Concession checklist: name it, grant it, answer it — the three moves readers trust.\n- Wording check: absolutes and vagueness flagged by word.\n- Output: a plan you can paste under the claim in your draft.\n\nThe drafting is template composition: each frame holds a published prompt pattern, the applicable frames are chosen by the claim's shape, and the absolutes come from a fixed word list matched as whole words. The same claim always produces the same objections, which is the point — the frames are the objections experienced readers reach for, written down. No literature is searched and no subject knowledge is applied. Keep the strongest objection for the paragraph before the conclusion, because answering it there reads as confidence, while burying it in the middle reads as fear.\n\n- The frames are general; a specialist objection your field knows may be missing.\n- A vague claim produces weak objections, because there is nothing to push against.\n- The concession checklist is advice, not output — the answers are yours.\n- Absolutes are flagged by presence, not by whether they are earned.\n- Nothing is stored, so copy the plan before leaving the page.\n\nAnswer the objections in the slots the tool provides and the counterargument section writes itself: one objection per paragraph, the concession doing the diplomacy, the answer doing the work. Then reread the claim with the absolutes removed — most claims become more defensible when every becomes most and never becomes rarely, and the wording check shows you exactly where the exposure is. The strongest use of the tool is before drafting, not after: a claim that survives six frames in the planning stage survives review, and one that cannot produce a single honest answer to the boundary frame is a claim to restate rather than defend.\n\nThe neighbours finish the defence: the argument mapping tool structures the reasons behind the claim, the logical fallacy detector checks the finished wording for named fallacies, and the debate script formatter turns the whole exchange into timed speeches. The thesis statement builder in this domain compresses the surviving claim.",
    howTo: [
      { step: "Paste the claim and pick its shape." },
      { step: "Read the objections the applicable frames produce." },
      { step: "Answer each objection prompt in its slot." },
      { step: "Work through the wording check and copy the plan." },
    ],
    whenToUse:
      "Use the counterargument generator when a claim is drafted and the objections have not been met yet. The {{argument-mapping-tool|Argument Mapping Tool}} structures the reasons the claim rests on, and the {{debate-script-formatter|Debate Script Formatter}} turns claim and objections into timed speeches. When the claim is the paper's thesis, the {{thesis-statement-builder|Thesis Statement Builder}} holds the one-sentence version, and the logical fallacy detector in this domain audits the wording.",
    faqs: [
      {
        q: "Why does the claim's shape matter?",
        a: "Because different claims are attacked differently: a policy claim invites cost objections, a universal claim invites counterexamples, a predictive claim invites boundary cases. The shape chooses which frames apply, so the objections you get are the ones that fit.",
      },
      {
        q: "What are the six shapes?",
        a: "Policy — something should be done; universal — true of all cases or none; predictive — what will happen; causal — one thing causes another; comparative — more or less than something else; descriptive — how things are with no marked shape. The tool picks the shape by what you tell it.",
      },
      {
        q: "Why are absolutes flagged?",
        a: "Words like all, every, always, never, only and impossible make a claim easy to break with a single example, so they mark the claim's exposure. The check names them; whether the absolute is earned is your call.",
      },
      {
        q: "Does the tool write my rebuttals?",
        a: "No. It drafts the objections and gives each a slot with a prompt; the answers are yours to write. That is deliberate — a rebuttal the tool invented would be worthless in review.",
      },
      {
        q: "Is the plan saved between visits?",
        a: "No. The objections and slots are generated in the page from your claim, and the plan disappears when the tab closes unless you copied it.",
      },
    ],
  },

  "debate-script-formatter": {
    keywords: [
      "debate script formatter",
      "motion",
      "rebuttal",
      "British Parliamentary",
    ],
    intro:
      "The Debate Script Formatter turns a motion and a format into the full slate of timed speeches, with each slot's job, order and speaking time on one card.",
    content:
      "A debate is won in preparation, and this debate script formatter lays the preparation out. Give it the motion and pick a format — British Parliamentary, Asian Parliamentary, public forum or Lincoln-Douglas — and the tool produces the script skeleton: every speech in order, with its speaker, its side, its minutes and the one job the speech exists to do, from defining the motion to delivering the rebuttal and the close.\n\nThe motion panel takes the motion text and the format switch. The script panel lists the speeches as cards in speaking order, each with its time and its brief, and the notes panel explains the format's rules — the eight speeches of seven minutes in British Parliamentary, with the closing half required to extend the opening half's case rather than repeat it. Scope and limits says the formatter arranges the debate; it does not write the arguments.\n\n- Four formats: British Parliamentary, Asian Parliamentary, public forum, Lincoln-Douglas.\n- Every card: speaker, side, minutes, and the single job of that speech.\n- Order: the speaking order is the format's published one.\n- Motion: carried at the top of the script so every speech answers it.\n- Notes: the format's rules summarised beside the script.\n- Output: copyable as a whole, one card per speech.\n\nThe assembly is slot composition: each format is data — slots with id, label, side, minutes, brief and flags — and the script is the slots rendered in order with the motion attached. The briefs are the format's published expectations, so a British Parliamentary whip speech carries a different job from a Lincoln-Douglas constructive. Nothing is argued, timed or scored; the skeleton is the product. Print one card per speaker and let them time themselves against it, because a speech that has never been spoken aloud is a draft wearing a suit.\n\n- The briefs tell you what each speech must do, not what to say in it.\n- Speaking times are the format's conventions; your tournament may vary them.\n- The formatter does not judge which side the motion favours.\n- Extensions, points of information and prep time are format rules, noted but not modelled.\n- The script is not stored, so copy it into your prep doc.\n\nWork the cards as a team plan: assign the speeches, then write the rebuttal bank before the constructive material, because the rebuttal is the speech debaters under-prepare and the one judges remember. Each card's brief is a testable promise — if the closing half cannot state what it extends from the opening half, the case split is wrong, and the British Parliamentary note says so in one line. Then time one speech aloud against the card's minutes: a brief that takes nine minutes to deliver is a brief to cut, and the card's number is the honest clock. The motion at the top of the script is the anchor — every speech should be readable as an answer to it, and any card that is not is material for a different debate.\n\nThe neighbours stock the speeches: the counterargument generator drafts the objections each rebuttal needs, the logical fallacy detector checks the wording for the patterns judges penalise, and the argument mapping tool structures the case the constructive speeches deliver. The thesis statement builder in this domain writes the one-sentence version of each side's case.",
    howTo: [
      { step: "Enter the motion and pick the format." },
      { step: "Read the speech cards and each one's job." },
      { step: "Assign speeches and draft the rebuttal bank first." },
      { step: "Copy the script and time one speech against its card." },
    ],
    whenToUse:
      "Use the debate script formatter when the motion is set and the prep needs a shape. The {{counterargument-generator|Counterargument Generator}} fills the rebuttal cards, and the {{logical-fallacy-detector|Logical Fallacy Detector}} audits the wording before a judge hears it. When a case needs structure, the {{argument-mapping-tool|Argument Mapping Tool}} lays the reasons out, and the thesis statement builder in this domain compresses each side's claim.",
    faqs: [
      {
        q: "Which debate formats are supported?",
        a: "Four: British Parliamentary, Asian Parliamentary, public forum and Lincoln-Douglas. Each is a published set of slots — speaker, side, minutes and job — and the script renders the chosen format's slots in speaking order.",
      },
      {
        q: "What does each card tell me?",
        a: "The speaker, the side, the speaking time and the single job the speech exists to do, such as defining the motion, rebuilding the case or delivering the close. The briefs are the format's expectations, not scripts to read aloud.",
      },
      {
        q: "Does the tool write arguments for my side?",
        a: "No. It produces the skeleton — order, times and jobs — and leaves the argument to you and your evidence. The scope note says the formatter arranges, it does not debate.",
      },
      {
        q: "Are the speaking times exact?",
        a: "They are the formats' standard conventions, printed on each card. Tournaments vary times and prep allowances, so treat the card as the default and adjust to your circuit.",
      },
      {
        q: "Is my motion stored?",
        a: "No. The script is assembled in the page from the motion you typed, and nothing is stored or sent; copy the script before the tab closes.",
      },
    ],
  },

  "irb-consent-form-template": {
    keywords: [
      "IRB consent form template",
      "informed consent",
      "withdrawal",
      "contacts",
    ],
    intro:
      "The IRB Consent Form Template assembles the nine required sections of an informed consent form in reading-level-checked plain language, and flags the promises a consent form must never make.",
    content:
      "A consent form is a promise of honesty, and this IRB consent form template assembles yours section by section. Fill the study title, the purpose, what participation involves, the time required, the risks, the benefits, the confidentiality limits, the withdrawal terms and the contacts; the tool stacks them into the standard form, checks the reading level of the whole, and flags the three promises a consent form must never make — guaranteed outcomes, claims of no risk, and payment terms that pressure participation.\n\nThe study panel takes the nine sections. The form panel shows the assembled document with section headings in the required order, and the checks panel names the faults: contact details missing or unreadable — an email pattern and a phone pattern are tested — a promise word like guarantee or will cure, a no-risk phrase like minimal risk without qualification, and payment wording that ties compensation to completion. Scope and limits says the template assembles and flags; it is not a substitute for your IRB's review.\n\n- Nine sections: title, purpose, procedures, duration, risks, benefits, confidentiality, voluntary participation and withdrawal, contacts.\n- Contacts: an email and a phone number, both pattern-checked.\n- Promise scan: guarantee, will cure, assured, definitely, promise.\n- Risk scan: no, minimal or zero risk without a qualifier.\n- Payment scan: wording that pays only on completion or per visit.\n- Reading level: the whole form scored for sentence length and word weight.\n\nThe assembly is section composition: each section carries its heading and its text in the published order, and the checks are pattern tests — contact patterns, a promise list, a no-risk phrase, and payment terms that pressure. The reading check counts long sentences and heavy words so the form can be read by the person signing it, which is the point of informed consent. Nothing is legal advice and no section is invented.\n\n- The nine sections are the common skeleton; your board's template wins where they differ.\n- The scans are pattern lists; a promise in other words passes them.\n- The reading check measures sentence mechanics, not comprehension.\n- Consent is a process; the form is one document inside it.\n- Nothing is stored, so copy the form before leaving the page.\n\nWrite the withdrawal section first and the rest of the form levels up: the right to leave at any time without penalty is the sentence that makes every other section believable, and the payment scan exists because compensation is where that promise usually quietly dies. Then read the risks section aloud to someone outside the field — if a sentence needs a second reading, the risk is being described in the study's language rather than the participant's, and the reading check points at the long sentences first. Keep the contacts human: a named person with an email and a phone number answers more ethical questions than a paragraph of assurance, and the pattern check is there so the section cannot be left with a placeholder in it.\n\nThe neighbours test the other documents of a study: the survey question builder cleans the instrument the participants answer, the readability grade scorer shows how plain the form reads, and the peer review checklist frames the ethics review the form feeds. The tone analyzer in this domain catches the register that drifts institutional.",
    howTo: [
      { step: "Fill the nine sections with your study's facts." },
      { step: "Read the assembled form top to bottom." },
      { step: "Work through the checks — contacts, promises, risk phrases, payment terms." },
      { step: "Copy the form and take it to your board's process." },
    ],
    whenToUse:
      "Use the IRB consent form template when a study is designed and the consent paperwork is next. The {{survey-question-builder|Survey Question Builder}} cleans the instrument the form describes, and the {{readability-grade-scorer|Readability Grade Scorer}} shows how plain the finished document reads. When the study heads to review, the {{peer-review-checklist|Peer Review Checklist}} frames the ethics questions the form must answer, and the tone analyzer in this domain removes the institutional register.",
    faqs: [
      {
        q: "What are the nine required sections?",
        a: "Title and investigator, purpose, what participation involves, time required, risks, benefits, confidentiality, voluntary participation and withdrawal, and contacts. The template assembles them in that order because that is the order a reader needs.",
      },
      {
        q: "Why are payment terms flagged?",
        a: "Because compensation tied to completion — paid only if you finish, per-session rates — pressures participation and undermines the voluntary section. The scan names the patterns; your board decides what is acceptable.",
      },
      {
        q: "What does the reading check measure?",
        a: "Sentence length and word weight across the whole form, the mechanical habits that make a document hard to read aloud. It is a proxy for accessibility, not a comprehension test, and the panel says so.",
      },
      {
        q: "Does the template replace my IRB's review?",
        a: "No. It assembles the standard skeleton and flags promise, risk and payment patterns; the board's own template, process and approvals govern. The scope note states this in the tool.",
      },
      {
        q: "Is the form sent anywhere?",
        a: "No. The assembly and the checks run in the page from what you typed, and nothing is stored or transmitted; copy the form before closing the tab.",
      },
    ],
  },

  "plagiarism-self-check-prep-tool": {
    keywords: [
      "plagiarism self-check prep tool",
      "quote share",
      "citation",
      "block quote",
    ],
    intro:
      "The Plagiarism Self-Check Prep Tool audits a draft's quotes, citations and paraphrase balance before the similarity checker does, and hands you the prep checklist.",
    content:
      "A similarity report is written after submission, but its causes are visible before it, and this plagiarism self-check prep tool reads them early. Paste the draft and the tool audits the quoting: every quoted passage is found, measured and attributed or flagged; the quote share — the proportion of the draft that is quotation — is computed against the published fifteen-percent line; quotes past forty words are marked as block quotes; and citation-shaped references are counted so the draft that cites nothing cannot surprise you. The prep checklist beside the panel carries the habits that keep a similarity report boring.\n\nThe input panel takes the draft. The quotes panel lists every quoted passage with its length and its citation status — attributed, or flagged for the missing citation — and the summary panel reports the counts that matter: total quotes, attributed, unattributed, block quotes, and the quote share against the fifteen-percent limit. Scope and limits says the tool prepares; it does not compare your text against any database.\n\n- Quote detection: straight and curly quoted passages, measured in words.\n- Citation scan: author-year, bracketed numbers, footnotes and see-references counted.\n- Quote share: the draft's proportion of quotation against the fifteen-percent line.\n- Block quotes: any quote past forty words is marked for display as a block.\n- Prep checklist: the published habits — cite while writing, paraphrase with the source closed.\n- Output: a prep report to paste beside the revision pass.\n\nThe audit is parsing and counting: quoted passages are found with a quote pattern, each is measured with the shared tokenizer, citation-shaped references are matched by pattern, and the quote share is the quoted words over the total. The same draft always produces the same report, so the before-and-after of a revision is comparable — the tool is a ruler, not a judge.\n\n- Finding no quotes does not mean the draft is original; it means it quotes no one.\n- The citation scan counts shapes; a wrong citation in the right shape passes.\n- The fifteen-percent line is a convention, not your venue's rule.\n- Paraphrase quality is not measured; close paraphrase is a judgement call.\n- Nothing is stored, so copy the report before closing the page.\n\nChase the unattributed quotes first — every one is a sentence the similarity checker will find and the reviewer will remember — and mark the block quotes next, because a quote past forty words belongs on its own line with the citation beside it, not lost inside a paragraph. Then read the quote share against the fifteen-percent line with honesty: a draft that is one-third quotation is a compilation, and the fix is paraphrase with the source closed, not tighter quoting. Run the audit once more after revisions; the counts fall as the paraphrase improves, and a quote share under the line with zero unattributed quotes is the shape a similarity report rewards. Keep the prep checklist honest to the end: the habits it lists are how the numbers got good.\n\nThe neighbours fix the citations the audit counts: the citation formatter corrects the reference shapes, the bibliography builder assembles the list, and the reference list generator produces the full set. The tone analyzer in this domain catches the register that drifts when borrowed prose is patched in.",
    howTo: [
      { step: "Paste the draft into the input panel." },
      { step: "Read the quotes panel — attributed, unattributed, block quotes." },
      { step: "Check the quote share against the fifteen-percent line." },
      { step: "Work the prep checklist and re-run after revisions." },
    ],
    whenToUse:
      "Use the plagiarism self-check prep tool before submission, while the fixes are still yours to make. The {{citation-formatter|Citation Formatter}} repairs the shapes the audit counted, and the {{bibliography-builder|Bibliography Builder}} assembles the list the citations imply. When the reference set needs generating, the {{reference-list-generator|Reference List Generator}} builds it, and the tone analyzer in this domain smooths the patched paragraphs.",
    faqs: [
      {
        q: "Does this tool compare my text to a database?",
        a: "No. It audits quoting mechanics inside your draft — quotes, citations, quote share — and never uploads or compares text. The similarity score from a service like Turnitin is a different measurement, and the scope note says so.",
      },
      {
        q: "What is the quote share limit?",
        a: "Fifteen percent is the published convention this tool measures against: the proportion of the draft made of quoted words. Your venue's rules override it; the number exists so the draft has a line to stand on.",
      },
      {
        q: "What counts as a block quote?",
        a: "Any quoted passage past forty words, by the published threshold. The tool marks it so you can set it as a displayed block with its citation, rather than hiding a long quote inside a paragraph.",
      },
      {
        q: "Which citation shapes does the scan recognise?",
        a: "Author-year parentheses, bracketed numbers, the words footnote and ibid, and see-references. It counts shapes rather than verifying them — a wrong citation in the right shape still passes, which is the scan's honest limit.",
      },
      {
        q: "Why prepare if the checker runs anyway?",
        a: "Because the similarity report only tells you what matched, after the grade is at stake. The prep audit shows the same causes earlier — unattributed quotes and heavy quote share — while fixing them costs nothing but a revision.",
      },
    ],
  },

  "writing-portfolio-builder": {
    keywords: [
      "writing portfolio builder",
      "clips",
      "genres",
      "reading",
    ],
    intro:
      "The Writing Portfolio Builder turns a list of published pieces into a curated reading portfolio — grouped by genre, selected for range and recency, with a scaffold you can paste.",
    content:
      "A portfolio is a curation, not an archive, and this writing portfolio builder does the curating. Paste your pieces — one per line, each with its title, genre, outlet, year and word count — and the tool groups them by genre, counts the dated and placed pieces, flags the pieces from the last three years, and selects the reading portfolio: up to ten pieces, with a floor of six, chosen to show range across genres rather than depth in one. The scaffold beside the selection is the page's skeleton, ready to fill.\n\nThe pieces panel takes the lines. The plan panel shows the groups with their counts, the selection with the reason each piece earned its place, and the counts that matter: total pieces, genres represented, how many are dated, how many carry an outlet, and the age of the most recent. Scope and limits says the builder curates what you paste; it cannot read the pieces or judge their quality.\n\n- Pieces: title, genre, outlet, year and word count, one per line.\n- Groups: pieces clustered by genre, counts beside each.\n- Selection: up to ten pieces, minimum six, chosen for range.\n- Recency: pieces from the last three years flagged as recent.\n- Scaffold: the portfolio page's skeleton, generated from the selection.\n- Counts: total, genres, dated, placed, selected, most recent.\n\nThe curation is parsing and selection: each line is parsed into its parts, the groups form by genre, and the selection balances the genres while preferring recent, placed pieces — a published rule, not a vibe. The scaffold is the selection rendered as a page skeleton with slots for links and one-line pitches. The same list always produces the same portfolio, which makes re-runs after new publications a diff rather than a redo.\n\n- The selection favours range; a specialist portfolio may want to override it.\n- Quality is assumed; the tool counts, it does not read.\n- Pieces without a year still count, but they weaken the recency story.\n- The scaffold is a skeleton; the links and pitches are yours.\n- Nothing is stored, so copy the plan before closing the page.\n\nChoose the genre to lead with before you look at the pieces — the portfolio opens with the work you want more of, and the selection rule's range bias is a starting point, not a verdict. Then fill the recency gap the counts expose: a portfolio whose newest piece is four years old tells an editor the pipeline stopped, and one recent clip repairs more than three old ones. Write the one-line pitch per selected piece last, and make each pitch a claim about the writing rather than a summary of the piece — an editor reads ten pitches in a minute, and the pitches are where the portfolio sounds like you. Keep the total at the target of ten: a portfolio that exhausts its reader has failed as a reading experience, and the floor of six exists so a thin list does not pad itself.\n\nThe neighbours shape the page around the clips: the manuscript formatter gets a selected piece submission-ready, the word count tool verifies the pitch lengths, and the reading time estimator shows the portfolio's minutes. The text summarizer in this domain compresses an overlong piece description to its pitch.",
    howTo: [
      { step: "Paste the pieces, one per line, with title, genre, outlet, year and words." },
      { step: "Read the groups, the selection and the counts." },
      { step: "Check the recency story and the genre spread." },
      { step: "Copy the scaffold and write the one-line pitches." },
    ],
    whenToUse:
      "Use the writing portfolio builder when the clips exist and the curation is overdue. The {{manuscript-formatter|Manuscript Formatter}} prepares a selected piece for submission, and the {{reading-time-estimator|Reading Time Estimator}} shows the portfolio's cost in minutes. When a piece description runs long, the {{text-summarizer|Text Summarizer}} cuts it to pitch length, and the word count tool in this domain keeps the page honest.",
    faqs: [
      {
        q: "What format does each piece need?",
        a: "One line per piece with the title, genre, outlet, year and word count. The year may be left blank, but a portfolio without dates weakens its own recency story, and the counts panel shows the cost.",
      },
      {
        q: "Why a floor of six and a target of ten?",
        a: "Six is the minimum a reading portfolio needs to show range; ten is where a reader's attention reliably ends. The selection respects both, and a list that cannot reach six is a signal to write, not to pad.",
      },
      {
        q: "How are the selected pieces chosen?",
        a: "By a published rule: spread across genres, preferring pieces from the last three years and ones that carry an outlet. The reason each piece earned its place is shown in the plan, so the curation is visible.",
      },
      {
        q: "Does the builder judge my writing?",
        a: "No. It curates the metadata you paste — genres, dates, outlets — and reads none of the pieces. Quality is your editorial problem; range and recency are the tool's.",
      },
      {
        q: "Is my list saved?",
        a: "No. The groups, selection and scaffold are computed in the page from your lines, and nothing is stored; copy the plan before the tab closes.",
      },
    ],
  },
};
