import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B20, paraphrasing and rewriting: authored SEO entries for the sentence
 * rewriter, the simplify text tool, the formality adjuster, the technical to
 * plain language converter and the active voice converter.
 *
 * Every entry draws the same line: these tools apply published rules to the
 * writer's own words — moving a clause, replacing a table entry, expanding a
 * listed acronym — and none of them understands or paraphrases meaning. Keys
 * are registry slugs; see ../tool-seo.ts for the contract.
 */
export const B20_PARAPHRASING_SEO: Record<string, ToolSeo> = {
  "sentence-rewriter": {
    keywords: [
      "sentence rewriter",
      "rule-based rewrites",
      "subordinate clause",
      "intensifiers",
    ],
    intro:
      "The Sentence Rewriter applies four documented sentence-level moves — lead with the cause, lead with the action, split into two sentences, cut the intensifiers — and shows the result of each so you can pick.",
    content:
      "This sentence rewriter is deliberately not a paraphrasing model. It applies four documented rule-based rewrites at the sentence level, one sentence at a time, and shows what each move produces; the writer chooses, and nothing changes unless it is chosen. Every rewrite is a rearrangement or a deletion from a published list, so each result can be checked against the original.\n\n- Lead with the cause: a trailing subordinate clause is moved to the front of the sentence.\n- Lead with the action: a leading subordinate clause is moved to the end.\n- Split into two sentences: the break happens at a comma followed by and, but, so, yet or or, or at a semicolon, and each half gets its own full stop.\n- Cut the intensifiers: a published list of filler adverbs is dropped.\n- Each sentence is rewritten on its own, so a paragraph produces one row per sentence with its own set of offered rewrites.\n- Summary figures: sentences seen, sentences with at least one rewrite, and total rewrites offered.\n- Scope and limits are printed on the page beside the results.\n- A sentence with no applicable move is returned unchanged and counted, so the summary distinguishes the work the tool could do from the work it could not.\n\nThe engine never changes a word it was not told to change. Clause movement is driven by a published list of subordinating conjunctions — because, although, when and their relatives — matched at the start or the end of a clause, and the split rule only fires at the documented seams rather than at any comma, because a comma before a conjunction is where a sentence can be broken without inventing grammar. Word counts come from the shared Intl.Segmenter counter, so a count reported here is the same number the rest of the domain reports for the same sentence. When no documented move applies, the sentence is returned unchanged and counted among the sentences without a rewrite, which is the honest result rather than a padded list. The four moves are also independent of each other, so a sentence can offer a clause move and a split at the same time, and choosing one does not commit you to the other. Because the rewrites are produced from the original sentence rather than from each other, no rewrite inherits a change made by another.\n\n- It is not a paraphrasing engine: it moves clauses and deletes listed fillers, and it never substitutes synonyms.\n- A rewrite is offered per move, so a sentence can receive several alternatives that conflict; pick one.\n- A sentence with no subordinate clause and no documented filler gets no rewrite, and the count says so.\n- A clause move preserves every word, so the rewrite differs from the original only in order and punctuation.\n- Splitting changes rhythm, which suits some prose and not others; the tool proposes rather than applies.\n- Meaning is preserved by construction, not by understanding: a clause moved to the front keeps its words.\n\nUse it when a paragraph reads monotonously and you want to vary sentence openings without changing the content. Read the offered rewrites in order, copy the one that fits, and leave the sentences where the moves do not apply — a rewrite that changes nothing is not an improvement.",
    howTo: [
      { step: "Paste a paragraph; every sentence is rewritten on its own and appears as a row." },
      { step: "Read the rewrites offered for each sentence, labelled with the move that produced them." },
      { step: "Copy the rewrite you want, or take the original." },
      { step: "Check the summary figures to see how many sentences the documented moves did not touch." },
    ],
    whenToUse:
      "Use the rewriter when the problem is sentence structure and the words should stay. When the problem is wordiness rather than shape, the {{simplify-text-tool|Simplify Text Tool}} replaces published phrases and splits sentences past its length threshold, and when the whole paragraph is padded, the {{paragraph-compressor|Paragraph Compressor}} makes four documented cuts at once.\n\nWhen the passive voice is the issue rather than the clause order, the {{active-voice-converter|Active Voice Converter}} recasts the clauses it can prove.",
    faqs: [
      {
        q: "Is this an AI paraphrasing tool?",
        a: "No. It applies four documented moves — two clause movements, one split at a published seam, and one deletion from a list of filler adverbs. It never substitutes a synonym, so a rewrite can always be compared with the original word by word.",
      },
      {
        q: "Where does the split happen?",
        a: "At a comma followed by and, but, so, yet or or, or at a semicolon. Those are the seams where a sentence can be broken without inventing grammar, so the rule never splits at a comma that is doing something else.",
      },
      {
        q: "Why did some sentences get no rewrite?",
        a: "Because no documented move applied. A sentence with no subordinate clause, no split seam and no listed filler is returned unchanged and counted among the sentences without a rewrite rather than padded with a cosmetic alternative.",
      },
      {
        q: "Do the rewrites change the meaning?",
        a: "They preserve it by construction rather than by understanding: a clause moved to the front keeps its words, a split keeps both halves, and a deleted intensifier was adding emphasis rather than information.",
      },
      {
        q: "Which word count does the tool use?",
        a: "The shared Intl.Segmenter counter the whole domain uses, so a sentence's count here matches the count the readability and statistics tools report for the same text.",
      },
    ],
  },

  "simplify-text-tool": {
    keywords: [
      "simplify text tool",
      "wordy phrases",
      "long sentences",
      "average sentence length",
    ],
    intro:
      "The Simplify Text Tool replaces published wordy phrases with plainer equivalents and splits sentences past 25 words at documented seams, with before-and-after metrics from the shared readability engine.",
    content:
      "Simplifying prose is two different jobs, and this simplify text tool keeps them apart. Substitution is safe and mechanical: the shared wordiness table supplies a plainer equivalent for each matched phrase. Splitting changes the rhythm of a paragraph, so it is only proposed for sentences longer than 25 words, and only at a documented seam. One is applied; the other is offered, and the page says which is which. The phrase table is shared with the paragraph compressor and the jargon remover, so the same wordy phrase is replaced the same way in every tool that touches it, and a draft processed by two tools does not come out with two different plain versions.\n\n- Phrase replacement from the shared wordiness table, matched as whole phrases, longest first, so a longer match is never partly replaced by a shorter one.\n- Sentence splitting for sentences longer than 25 words, at a comma with and, but, so, yet or or, or at a semicolon.\n- Metrics before and after: phrases replaced, sentences split, average sentence length and the count of long words, all computed by the shared readability engine.\n- A sentence-by-sentence view of what changed, so each substitution can be checked against the original.\n- Scope and limits printed beside the results.\n\nMatching goes through the shared phrase engine, which works on whole phrases, prefers the longest match, drops overlapping matches and preserves the source spelling. That is why a phrase inside a longer phrase is not replaced twice, and why the sentence-by-sentence table can be read as a complete account of every change. The metrics are not re-implemented for this tool: average sentence length and the long-word count come from the same readability engine the Readability Grade Scorer uses, so a figure here and a figure there describe the same text the same way. Sentences past the threshold that contain no documented seam are reported as long rather than silently left alone.\n\n- Substitution is limited to the published table; a wordy phrase outside it is untouched.\n- Splitting changes rhythm and can flatten a deliberate long sentence, so the split is a proposal rather than an edit.\n- A long sentence with no documented seam is flagged but not split.\n- The tool does not judge whether a plainer phrase fits the register of the document.\n- Splits are proposed with their seam named, so a split you dislike can be rejected without re-reading the whole paragraph.\n- A paragraph with no wordy phrases and no long sentences produces an unchanged result, which is a useful confirmation when reviewing rather than writing.\n- Metrics describe the text you pasted, so a partial paste gives partial figures.\n\nUse it when a draft reads heavier than its subject deserves. Work through the replacements first — they are mechanical and reversible — and then decide about the splits one at a time, because rhythm is the part a rule engine cannot hear. A paragraph that has been through the tool twice behaves predictably: the second pass finds fewer wordy phrases because the first pass removed them, and any sentence still past the threshold was left alone for a reason worth reading.",
    howTo: [
      { step: "Paste a paragraph; wordy phrases are replaced and long sentences are flagged as you type." },
      { step: "Read the before-and-after metrics, including average sentence length and the long-word count." },
      { step: "Open the sentence-by-sentence view and check each replacement against the original wording." },
      { step: "Accept or discard the proposed splits, then copy the simplified text." },
    ],
    whenToUse:
      "Use the tool when the prose is wordy rather than badly structured. When the structure is the problem, the {{sentence-rewriter|Sentence Rewriter}} moves clauses instead of words, and when the paragraph is padded with hedges and repetition, the {{paragraph-compressor|Paragraph Compressor}} makes four cuts and lists each one.\n\nWhen the target is a documented jargon list rather than general wordiness, the {{jargon-remover|Jargon Remover}} substitutes from a curated table with a note on when each replacement fits.",
    faqs: [
      {
        q: "Why is splitting treated differently from replacement?",
        a: "Because the two moves differ in kind. Substitution is mechanical and reversible; splitting changes the rhythm of a paragraph. So replacement is applied, while splitting is only proposed, and only for sentences past 25 words at a documented seam.",
      },
      {
        q: "What stops a phrase from being replaced twice?",
        a: "The shared phrase engine matches whole phrases, prefers the longest match and drops overlaps. A phrase that sits inside a longer matched phrase is never partly substituted, which keeps the sentence-by-sentence table a complete account.",
      },
      {
        q: "Why did a long sentence not get split?",
        a: "Because it contains no documented seam — no comma with and, but, so, yet or or, and no semicolon. The tool reports it as long rather than breaking it at a guess.",
      },
      {
        q: "Are the metrics the same as the readability tools report?",
        a: "Yes. Average sentence length and the long-word count come from the shared readability engine, so the same text produces the same figures in this tool and in the Readability Grade Scorer.",
      },
      {
        q: "Can it simplify text that uses jargon?",
        a: "Only if the wordy phrase is in the shared table. For documented jargon — corporate, technical, academic or marketing — the Jargon Remover has the curated list and the note that explains when the plain alternative fits.",
      },
    ],
  },

  "formality-adjuster": {
    keywords: [
      "formality adjuster",
      "register",
      "paired expressions",
      "casual markers",
    ],
    intro:
      "The Formality Adjuster shifts prose toward a more formal or a more casual register with one published table of 49 paired expressions, and reports the register as a band over the marker counts.",
    content:
      "Register is not a synonym problem, and this formality adjuster treats it as a mapping problem: one published table of 49 paired expressions, where each entry is a casual phrasing and its formal counterpart. The same table serves both directions, so the two directions can never disagree about what formal means.\n\n- Direction: More formal or More casual, both driven by the same paired table.\n- Replacement goes through the shared phrase engine: whole phrases, longest first, overlaps dropped, source spelling preserved, so get in touch is never partly matched by get.\n- Formality score: casual markers and formal markers are each counted in the text, and the reported register is a band over the difference.\n- Every change is listed with the paired expression it came from, so the substitution can be judged rather than trusted.\n- Scope and limits are printed on the page.\n\nThe score is a count, not a judgement: casual markers and formal markers are detected independently, and the band between them is what the tool reports. That design has a consequence worth knowing: a text can contain both kinds of marker and still land in the middle, which is exactly what a document written in mixed register looks like. Because the table is paired, replacing in one direction and then the other returns the text to its starting point, so the move is reversible and the writer can try a register and change their mind. Nothing about whether formal or casual is right for the document is claimed; the tool reports which the text currently looks like. The band exists because register is a spectrum rather than a switch: a message that is mostly formal with one casual phrase should not be reported as casual, and the two independent counts are what make that distinction possible.\n\n- The table is finite and published: an expression outside it is untouched in both directions.\n- A marker count is not a quality measure, and the band is deliberately wide.\n- The same table serves both directions, so the two moves can never disagree about what formal means.\n- The change list names the paired expression behind every substitution, so a shift can be reviewed one entry at a time.\n- Register and tone are different questions; this tool reports formality only.\n- Replacing a phrase can shift the sentence's rhythm even when the meaning is preserved.\n- The score is computed from the text, so it changes as you edit and can be used to check your own rewrite after the fact.\n- A text with no paired expression in it produces an empty change list, which is itself the answer to the question the tool was opened with.\n- One substitution per matched phrase: the engine never chains replacements.\n\nUse it when a message has to move up or down a register without being rewritten. Make the shift, read the change list, then read the result aloud — the table fixes the words, and only you can tell whether the voice still sounds like you. If a substitution reads oddly in context, run the other direction to restore it: the paired table makes the adjustment a try-on rather than an edit.",
    howTo: [
      { step: "Paste the text and choose More formal or More casual." },
      { step: "Watch the formality band and the casual and formal marker counts." },
      { step: "Read Every change to see each paired expression that was substituted." },
      { step: "Copy the adjusted text, or reverse the direction to return to the original." },
    ],
    whenToUse:
      "Use the adjuster when the register is the problem and the content is not. When the register should match an academic expectation specifically, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} reads the text against that register, and the {{tone-analyzer|Tone Analyzer}} reports tone rather than formality.\n\nWhen the text needs its jargon replaced rather than its register shifted, the {{jargon-remover|Jargon Remover}} works from the curated term list.",
    faqs: [
      {
        q: "How many paired expressions are in the table?",
        a: "49. Each entry is one casual phrasing and its formal counterpart, so a single table serves both directions and the two directions cannot disagree about what counts as formal.",
      },
      {
        q: "What does the formality score actually measure?",
        a: "Two independent marker counts — casual markers and formal markers — with the reported register as a band over the difference. It is a count rather than a judgement, so a text with both kinds of marker lands in the middle.",
      },
      {
        q: "Can I undo the adjustment?",
        a: "Yes, by running the other direction: the table is paired, so substituting in the opposite direction restores the original expressions. That reversibility is deliberate — trying a register should not be a one-way edit.",
      },
      {
        q: "Why was a casual phrase left alone?",
        a: "Because it is not in the published table. The engine substitutes only what it can map, and a phrase outside the list is reported as untouched rather than approximated.",
      },
      {
        q: "Does it also change the tone?",
        a: "No. Register and tone are separate questions. This tool moves formality; for tone the Tone Analyzer reports a different measure, and for academic register the Academic Writing Tone Checker is the specific tool.",
      },
    ],
  },

  "technical-to-plain-language-converter": {
    keywords: [
      "technical to plain language converter",
      "acronyms",
      "jargon table",
      "leftover long words",
    ],
    intro:
      "The Technical to Plain Language Converter expands acronyms from a local table, replaces shared jargon terms, and names the long words it did not touch rather than leaving them hidden.",
    content:
      "A converter that silently leaves half the jargon behind is worse than one that names the leftovers, and this technical to plain language converter is built around that principle. It uses two published tables and adds one piece of analysis the jargon remover does not do: every finding is reported with the sentence it sits in and that sentence's length, because a technical term inside a 35-word sentence is a much harder read than the same term in a 12-word one.\n\n- The shared jargon table supplies a plainer phrase for each matched term.\n- A local abbreviation table expands acronyms such as API, CPU, RAM, SSD, CDN and DNS, with a note on when each expansion is worth making.\n- Every finding carries the sentence it appears in and that sentence's length, so a term in a long sentence is visible as the harder read it is.\n- Left untouched: the leftover long words still present in the plain version that are in neither table, listed so nothing is hidden.\n- Figures: terms rewritten, acronyms expanded, sentences seen and the count of leftovers.\n- Scope and limits printed beside the results.\n\nMatching follows the shared phrase engine, so whole phrases are matched longest first with overlaps dropped and the source spelling preserved. The abbreviation table is deliberately opinionated in a way the page explains: some acronyms should be expanded on first use and left as acronyms afterwards, and others — CPU for processor, RAM for memory — read better in plain prose as the everyday word. The leftovers panel is the tool's honesty mechanism. If a plain version still contains long, unlisted words, they are named rather than quietly passed through, so a reader can see exactly how much of the technical vocabulary the tables were able to reach.\n\n- Both tables are finite: a technical term outside them is left in place and, if long, appears among the leftovers.\n- The expansion advice is general; a domain where the acronym is the standard term should keep it.\n- Sentence lengths come from the shared tokeniser, so an abbreviation it misreads can shift one figure.\n- The leftovers list is a reading aid rather than a fault list: a long word can be exactly the right word, and naming it is not the same as condemning it.\n- Replacing a term can change a sentence's grammar in rare cases, which is why every change is listed for review.\n- Acronym expansions are offered per occurrence rather than only on first use, so a reader can decide where the boundary is.\n- The figures count expansions and replacements separately, so a paragraph heavy in acronyms is distinguishable from one heavy in jargon.\n- The tool does not judge whether the plain alternative preserves the technical meaning; the note on each entry is a guide, not a guarantee.\n\nUse it on documentation, release notes or a policy summary that has to be read by people outside the team. Work through the term list first, then read the leftovers panel, because that panel is where the remaining work is. The acronym list is worth reading twice: expanding API on first use is right, but expanding it in every later sentence makes the text longer without making it clearer, and the notes say so.",
    howTo: [
      { step: "Paste a technical paragraph; the plain version builds as you type." },
      { step: "Read the figures for terms rewritten, acronyms expanded and leftovers." },
      { step: "Open the term-by-term list and check each substitution and its sentence length." },
      { step: "Read Long words still untouched and decide what to rewrite by hand, then copy the result." },
    ],
    whenToUse:
      "Use the converter when technical vocabulary has to reach a non-technical reader and you want to see what was missed. When the text is wordy rather than technical, the {{simplify-text-tool|Simplify Text Tool}} replaces published wordy phrases, and when the vocabulary is workplace jargon rather than technical terms, the {{jargon-remover|Jargon Remover}} works from the same shared table with its own curated emphasis.\n\nWhen the goal is a plainer register overall rather than term-level substitution, the {{formality-adjuster|Formality Adjuster}} shifts the paired expressions.",
    faqs: [
      {
        q: "What are the leftovers?",
        a: "Long words still present in the plain version that appear in neither table. They are listed deliberately: a converter that leaves jargon behind without naming it gives a false sense of a finished job.",
      },
      {
        q: "Why is the sentence length shown with each finding?",
        a: "Because a technical term inside a 35-word sentence is a harder read than the same term in a 12-word sentence. Showing the length makes the difference visible and points at the sentences worth rewriting.",
      },
      {
        q: "Should every acronym be expanded?",
        a: "Not necessarily, and the table says so per entry. Some acronyms should be spelled out on first use and then used as acronyms; others, such as CPU and RAM, read better in plain prose as the everyday word.",
      },
      {
        q: "How are terms matched?",
        a: "Through the shared phrase engine: whole phrases, longest match first, overlaps dropped, case-insensitive with the source spelling preserved. That is why a longer term is never partly replaced by a shorter one.",
      },
      {
        q: "Does it guarantee the plain version keeps the technical meaning?",
        a: "No. Each entry carries a note on when the plain alternative fits, and the change list exists so a specialist can review every substitution. The tool proposes; a person who knows the domain decides.",
      },
    ],
  },

  "active-voice-converter": {
    keywords: [
      "active voice converter",
      "passive constructions",
      "named actor",
      "agentless passives",
    ],
    intro:
      "The Active Voice Converter recasts passive constructions only when the actor is named, and reports the agentless passives and unconverted clauses it cannot prove rather than guessing.",
    content:
      "A passive sentence becomes an active one only when the actor is named — otherwise there is nothing to put in the subject position. This active voice converter is built on that constraint: it finds passive constructions, recasts the ones it can recast correctly, and says plainly which ones it could not.\n\n- Finds be plus past participle where the participle ends in -ed or appears in the published irregular table.\n- Takes the actor from a following by phrase, unless that phrase is an idiom or a time — by hand, by Friday — rather than a person.\n- Rebuilds the sentence in the tense it can prove: simple past from was or were, perfect from has, have or had been.\n- Reports everything else — agentless passives, present tense, adjectival participles — as findings with no rewrite, and counts them separately.\n- Figures: clauses converted, no named actor, left as written, and the output word count.\n- A clause-by-clause list so every conversion and every refusal can be inspected.\n\nThe design is a statement about what a rule engine can honestly do. Detecting be plus participle is a pattern; deciding whether a participle is a verb or an adjective is not, so the tool reports those cases rather than converting them. The by phrase has the same problem: by hand and by Friday look exactly like by Sam until the phrase is checked against an idiom and time list, which is why that list exists. Tenses are rebuilt only where the auxiliary proves the tense, and everything else is returned as written. The result is a converter that converts less than a model would and is right about everything it does convert — the honest trade, stated on the page.\n\n- Agentless passives cannot be converted, because there is no actor to name; they are reported instead.\n- Adjectival participles such as the door was closed are reported rather than recast, because they may not be passives at all.\n- Present-tense passives are reported without a rewrite; the tense rebuild covers simple past and perfect.\n- A by phrase that is an idiom or a time is excluded, so by hand is never turned into an actor.\n- A sentence the rules do not cover is returned unchanged and counted among the unconverted, so nothing is rewritten by accident.\n- A converted clause can be longer or shorter than the original, because a by phrase moves into the subject position and is deleted from the end.\n- Because everything the engine declines is counted, the report can be read as a map of where the prose would need a writer rather than a rule.\n- A sentence with two passive clauses is reported once per clause, so a conversion in the first half of a sentence is never hidden by a refusal in the second.\n\nUse it when passive-heavy prose is the specific problem — a policy document, a procedure, a report where nobody does anything. Read the converted clauses first, then the two counts of what was left; the refusals are the part of the report that tells you where a person is needed. If the converted count is low, the document's problem is not passive voice; it is that nobody is named as the actor anywhere, and that is an editorial decision rather than a rewrite.",
    howTo: [
      { step: "Paste a paragraph; passive clauses with a named actor are recast as you type." },
      { step: "Read the converted clauses in the clause-by-clause list." },
      { step: "Check the no-named-actor and left-as-written counts to see what the engine refused." },
      { step: "Copy the converted text, or use the list to rewrite the refusals by hand." },
    ],
    whenToUse:
      "Use the converter when passive voice is the specific fault and correctness matters more than coverage. When the problem is sentence shape rather than voice, the {{sentence-rewriter|Sentence Rewriter}} moves clauses, and when the prose is padded rather than passive, the {{paragraph-compressor|Paragraph Compressor}} cuts hedges and repetition.\n\nWhen the register of the document is the question — a passive-heavy report that reads formally — the {{formality-adjuster|Formality Adjuster}} reports the register as a count rather than a rewrite.",
    faqs: [
      {
        q: "Why are some passive sentences not converted?",
        a: "Because there is no actor to name. An agentless passive such as the report was written has nothing to put in the subject position, so it is reported as a finding rather than rewritten into a sentence the tool invented.",
      },
      {
        q: "What about a sentence like the door was closed?",
        a: "It is reported rather than recast. That construction may be a passive or an adjectival description of a state, and the engine cannot tell them apart, so it declines instead of guessing.",
      },
      {
        q: "How does it avoid turning by hand into an actor?",
        a: "The by phrase is checked against an idiom and time list before it is treated as a person. By hand, by Friday and their relatives are excluded, so the actor slot is only filled when the phrase really names someone.",
      },
      {
        q: "Which tenses can it rebuild?",
        a: "The ones the auxiliary proves: simple past from was or were, and perfect from has, have or had been. A present-tense passive is reported without a rewrite because the tense rebuild does not cover it.",
      },
      {
        q: "Does it ever add a word of its own?",
        a: "No. Every converted clause is rebuilt from the words already in the sentence, moved into a different order. Nothing is inserted, and nothing is converted unless the rules cover it.",
      },
    ],
  },
};
