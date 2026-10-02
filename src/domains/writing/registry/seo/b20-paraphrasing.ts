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
    keywords: ["sentence rewriter", "rewrite sentences", "clause order", "split a sentence", "intensifiers"],
    intro:
      "The sentence rewriter applies four documented moves to each sentence — moving a subordinate clause, splitting a compound sentence and cutting filler adverbs — and shows every result side by side.",
    content: `The sentence rewriter works one sentence at a time and offers up to four rewrites of each, all of them produced by published rules rather than by a model. The first move changes clause order: a sentence that opens with a subordinate clause is re-rendered with the main clause first, and a sentence that ends with one is re-rendered with it in front. The difference is one of emphasis — a reader who meets the action before the condition holds the action longer, and a reader who meets the condition first reads the sentence as an explanation.

The second move splits a compound sentence at a comma with and, but, so, yet or or, or at a semicolon, giving each half its own full stop. The third cuts intensifiers: a published list of filler adverbs such as very, really, quite, just, basically and literally is removed, and the sentence is otherwise left untouched. The fourth move is really an observation — a sentence past thirty words is noted as long, and so is one that opens with there is or there are, because naming the actor usually reads stronger than announcing that one exists.

Because the rewrites are rule-based, they are reproducible and reviewable. The same sentence always yields the same variants, and every variant is shown with a short note explaining what the move does and what it costs. That matters for a rewriter used on real prose: a suggestion the writer cannot explain is a suggestion the writer cannot judge. Here the note is part of the output, not a tooltip.

Two of the moves are worth naming precisely. To split a sentence at its seam is to give each half its own subject and verb, which is why the split variant only appears when both halves survive as sentences. To rewrite sentences by clause order is to change which idea arrives first, which is the variant most likely to rescue a monotonous paragraph, because it changes emphasis without changing a single fact.

The engine also protects the words it does not own. When a clause moves, only a sentence starter from a fixed list of common determiners and pronouns is lowercased, so a name is never quietly flattened to lowercase. When intensifiers are cut, the note says to check that none of them was load-bearing — just before is not the same as before, and very can be doing real work in a description. Nothing is added, and no synonym is invented.

A typical pass is fast. Paste a paragraph, read the variants, keep the one or two that improve the rhythm, and copy them with the copy button beside each. The tool does not write the paragraph and cannot tell whether a rewrite is an improvement in context; it offers the sentence-level options and says plainly what each one changes. That is the whole contract, and it is enough to break a run of flat, same-shaped sentences without giving up authorship of the prose.

For a paragraph that reads heavily rather than flatly, the Simplify Text Tool satisfies a different need: it replaces published wordy phrases and splits long sentences, with before and after metrics on the same page.\\n\\nKeep the original beside the rewrite for a day before accepting it. A reordered clause often sounds better on the page and worse in the paragraph, and the ear is a better judge of that than the tool is.`,
    howTo: [
      { step: "Paste a paragraph into the text box — each sentence is handled on its own." },
      { step: "Read the original and its word count, then the variants beneath it." },
      { step: "Compare the clause-order variants: does the action or the condition matter more?" },
      { step: "Use the split variant where two ideas are competing for one full stop." },
      { step: "Copy the variants you want and paste them back into the draft." },
    ],
    whenToUse: `Use the sentence rewriter when a paragraph is technically correct but monotonous — the same shape of sentence arriving three times in a row. When the problem is wordiness rather than rhythm, the {{simplify-text-tool|Simplify Text Tool}} replaces published phrases and splits long sentences instead.\\n\\nIf the flatness comes from too many passives, the {{active-voice-converter|Active Voice Converter}} recasts the clauses that name their actor, and the two tools together cover most of what makes a draft feel heavy.`,
    faqs: [
      {
        q: "How many rewrites does each sentence get?",
        a: "Up to four, and only the moves that actually apply. A simple sentence with no subordinate clause and no filler adverb may get none, which is reported as such rather than padded with a lesser suggestion.",
      },
      {
        q: "Does the rewriter change the meaning?",
        a: "It never adds or removes a fact. It reorders clauses, splits at a documented seam and deletes listed filler adverbs, so the worst case is a sentence that reads differently rather than one that says something new.",
      },
      {
        q: "Why is a long sentence only noted, not rewritten?",
        a: "Splitting a sentence with no conjunction or semicolon means choosing where the break belongs, and that is an editorial judgement. The tool names the length and leaves the break to the writer.",
      },
      {
        q: "Is the text uploaded anywhere?",
        a: "No. The rules run in the browser and the text stays in the tab, so an unpublished draft never leaves the machine.",
      },
      {
        q: "Can I rewrite a whole document at once?",
        a: "Yes. Paste as much text as you like; the sentences are rewritten in order and the report counts how many had a variant and how many rewrites were offered in total.",
      },
    ],
  },

  "simplify-text-tool": {
    keywords: ["simplify text", "wordy phrases", "long sentences", "sentence splitting", "reading level"],
    intro:
      "The simplify text tool replaces wordy phrases from a published table, splits sentences that run past twenty-five words at a documented seam, and reports the reading metrics before and after.",
    content: `The simplify text tool has two jobs and keeps them separate. The first is substitution: a published table of wordy phrases — in order to, utilise, at this point in time, provide assistance to, due to the fact that and about sixty more — is matched whole and replaced with a plainer equivalent. Each match is listed with the source phrase and the replacement, so the change can be reviewed rather than trusted, and a phrase that is not on the table is never touched.

The second job is sentence splitting, and it is more conservative on purpose. A sentence is only split when it runs past twenty-five words and contains a documented seam — a comma followed by and, but, so, yet or or, or a semicolon. Both halves must survive the cut with something to say; if the split would leave a fragment, the sentence is left whole and the tool says nothing about it. That is the difference between a useful simplifier and one that mangles long sentences in the name of readability.

The report then shows the arithmetic. Words, sentences and average sentence length are measured before and after, using the same readability engine that powers the rest of the domain, alongside the share of long words. When the sample is a paragraph, those numbers move visibly: the worked example on this page drops from twenty-eight words per sentence to fifteen, with six phrases replaced and one sentence split.

Reading level matters most where a document will be skimmed. Instructions, policies, product copy and consent forms are read by people who did not choose the subject and have no patience for padding. Substituting a shorter equivalent for a wordy phrase is the cheapest improvement available, and splitting a thirty-word sentence at its natural seam is the second cheapest. Neither requires the writer to rethink the argument, which is why both are worth doing before a more expensive revision.

The tool is honest about the trade. Shorter is not automatically clearer, and a split changes the rhythm of a paragraph — three short sentences in a row can sound choppy where one longer one flowed. The notes say to read the simplified version in context, and the original is preserved on the page beside each rewrite so the comparison costs nothing.

A document can be pasted whole. The simplifications are produced in order, the copy button exports the simplified text entire, and the download button saves it as a plain text file beside the draft. Nothing is uploaded and nothing is stored beyond the tab, so a client document stays where it belongs. What the tool will not do is rewrite an idea: it simplifies the sentences you wrote and leaves the thinking exactly where it was.

Pair the tool with the {{sentence-rewriter|Sentence Rewriter}} when a paragraph is monotonous rather than wordy; the rewriter changes the shape of sentences while the simplifier changes their weight.\\n\\nOne habit makes the metrics useful: simplify before you revise content, not after. Wordy phrases hide missing detail, and a sentence that shrinks from forty words to twenty often shows exactly which fact was never stated.`,
    howTo: [
      { step: "Paste a paragraph or a whole document into the text box." },
      { step: "Read the phrase count and the before to after sentence-length figures." },
      { step: "Check the sentence-by-sentence list for any substitution that changed your meaning." },
      { step: "Review the split sentences in context; keep the split only where it reads better." },
      { step: "Copy or download the simplified version and compare it with the original." },
    ],
    whenToUse: `Use the simplify text tool when a draft is padded rather than wrong — where the ideas are sound and the sentences are carrying more words than they need. It is the fastest first pass on instructions, policies and product copy, because the substitutions come from a fixed table and change no meaning.\\n\\nWhere the problem is sentence shape rather than sentence length, the {{sentence-rewriter|Sentence Rewriter}} offers clause-order and splitting variants instead. And when the padding is technical vocabulary rather than wordiness, the {{technical-to-plain-language-converter|Technical to Plain Language Converter}} expands acronyms and replaces listed jargon with plain words.`,
    faqs: [
      {
        q: "What counts as a wordy phrase?",
        a: "Anything in the published table in the shared simplification engine — phrases such as in order to, prior to, make a decision and at this point in time, each with a shorter equivalent and a note explaining why the original is worth replacing.",
      },
      {
        q: "When does the tool split a sentence?",
        a: "Only past twenty-five words and only at a comma with and, but, so, yet or or, or at a semicolon, and only when both halves stand as sentences. Otherwise the long sentence is left alone.",
      },
      {
        q: "Do the before and after numbers use real formulas?",
        a: "They use the same counts and the same readability engine as the Readability Grade Scorer: words, sentences, average sentence length and long-word share, all measured on your text rather than estimated.",
      },
      {
        q: "Will simplifying change my meaning?",
        a: "The substitutions are chosen to be equivalent in ordinary prose, but every one is listed with its source phrase so you can check. A phrase that is precise in your context — a legal term, say — should be restored.",
      },
      {
        q: "Does it work on a whole document?",
        a: "Yes, and it keeps sentences in order. The output can be copied or downloaded as plain text, and the sentence-by-sentence list shows exactly what changed in each one.",
      },
    ],
  },

  "formality-adjuster": {
    keywords: ["formality adjuster", "formal writing", "casual tone", "register", "contractions"],
    intro:
      "The formality adjuster moves prose toward a more formal or a more casual register using one published table of paired expressions, and scores the text as written from the markers it counts.",
    content: `The formality adjuster is built on a single published table of paired expressions. Each row holds a casual phrasing and its formal counterpart — kids and children, figure out and determine, boss and supervisor, right away and immediately, cannot and can't — and the same table serves both directions, so the tool can never disagree with itself about what formal means. Choosing a direction matches one side of every pair in your text and replaces it with the other.

Matching goes through the shared phrase engine, which means whole phrases only, longest first, with overlaps dropped and the source spelling preserved. Get in touch is a single row and is never partially matched by get; a phrase that is not in the table is never touched. Possessive forms are handled explicitly, because an apostrophe sits outside the word boundary the matcher uses: kids' becomes children's rather than children followed by a stray apostrophe.

The score is a count, not a judgement. Casual markers and formal markers are counted in the text — the table entries plus a short list of common contractions — and the difference is banded into Informal, Neutral or Formal. A message full of contractions and phrasal verbs lands at the informal end; a paragraph built from require, sufficient and establish lands at the formal end. The number is reported with both counts so the reader can see what produced it.

Formal writing and a casual tone are both legitimate; the variable is the audience. A style guide that insists otherwise is describing its own house style, not a rule of the language.

That transparency is the point. Formality is a property of the relationship between writer and reader, and no tool can know whether a given document should read formally. A resignation letter, a policy and a message to a friend are all correct at different points on the scale, and the tool's job is to move the text and show its working. The writer decides whether the destination is right.

Vocabulary is not the only lever, and the page says so. Sentence length, contractions, the passive voice and direct address all carry register too, and this tool touches only the words in its table. When a document needs to sound more formal than a word swap can make it, the notes point at the structures rather than pretending the substitution was enough.

Practically, the adjuster is most useful in the last pass before sending something. A support reply that has drifted casual, a policy written in the voice of a chat message, a cover letter that reads like a text: each is a few substitutions away from the register it needs. Copy the adjusted version, read it once for tone, and keep the changes you agree with. Nothing is uploaded, and the original stays on the page beside the result.

For brevity rather than register, the {{simplify-text-tool|Simplify Text Tool}} is the better next step, and for prose that has lost its actor, the {{active-voice-converter|Active Voice Converter}} recasts the passives.\\n\\nA useful test after adjusting: read the result aloud. Register is heard before it is seen, and a sentence that sounds like a stranger usually still needs a substitution or two.`,
    howTo: [
      { step: "Paste the message or paragraph you want to adjust." },
      { step: "Read the formality score, its band and the casual and formal marker counts." },
      { step: "Choose More formal or More casual as the direction." },
      { step: "Review the change list — every substitution is listed with its source." },
      { step: "Copy the adjusted version and read it once for tone before sending." },
    ],
    whenToUse: `Use the formality adjuster when the content is right and only the tone is off: a support reply that reads too casually, a policy that reads like a chat message, or a covering note that needs to sound less stiff. The substitutions are listed, so nothing changes without being visible.\\n\\nFor drafts that are padded rather than misjudged, the {{simplify-text-tool|Simplify Text Tool}} replaces wordy phrases and splits long sentences. When register is fine but the prose has lost its actor, the {{active-voice-converter|Active Voice Converter}} recasts the passives that name one.`,
    faqs: [
      {
        q: "What is the formality score?",
        a: "A count-based number from 0 to 100. Casual markers matching the table and a short contraction list are counted, formal markers are counted, and the difference is banded into Informal, Neutral or Formal. It measures word choice only.",
      },
      {
        q: "Can the same table really work in both directions?",
        a: "Yes. Each row holds a casual and a formal side, so choosing a direction simply decides which side is matched and which is written. Because there is one table, the two directions can never disagree about a pair.",
      },
      {
        q: "Why are plurals left alone?",
        a: "The matcher works on whole phrases, so a plural such as supervisors does not match the singular table entry supervisor. That is deliberate: inflecting a replacement automatically is how a rewriter starts producing wrong words.",
      },
      {
        q: "Does formal always mean better?",
        a: "No. Register is a property of the relationship between writer and reader. The tool moves the text and shows the markers; whether the destination is appropriate is a decision only the writer can make.",
      },
      {
        q: "Is anything stored or sent?",
        a: "Nothing. The table runs in the browser, the text stays in the tab, and the copy button puts the adjusted version on your clipboard without a server in between.",
      },
    ],
  },

  "technical-to-plain-language-converter": {
    keywords: ["plain language", "jargon", "acronyms", "technical writing", "plain english"],
    intro:
      "The technical to plain language converter expands listed acronyms, replaces jargon from a published table, and names the long words it could not touch so they can be handled by hand.",
    content: `The technical to plain language converter does three things and reports all of them. First, it expands acronyms from a local table: API becomes application programming interface, SLA becomes service commitment, CDN becomes content delivery network, and twenty more are handled the same way. Matching is case-sensitive on purpose, so a lowercase api is not treated as the acronym and never expanded.

Second, it replaces jargon from the shared published table — leverage, microservice, onboard, latency, actionable, deliverable and the rest — with the plainer phrasing recorded beside each term. Every substitution is reported with the term, its replacement, the note explaining when the plain alternative fits and when the original is the right word, and the sentence the term was found in.

Third, and this is the part most converters skip, it names what it did not touch. Words of twelve letters or more that survive the conversion and appear in neither table are listed as leftover, with a plain statement that they were left as written. A language tool that silently leaves half the jargon behind is worse than useless, because the writer cannot tell the finished half from the unfinished one. Here the leftovers are part of the report.

Plain English is not a lower register; it is the register of a writer who has decided the reader matters more than the vocabulary. In technical writing the trade is explicit: precision belongs in the specification, and the explanation belongs wherever someone has to act on it. A reader who has to look up a term has stopped reading, and no amount of accuracy in the definition will bring them back to the sentence they abandoned.

Each finding also carries the length of its sentence. A technical term inside a twelve-word sentence is a much easier read than the same term inside a thirty-five-word one, and the pair of numbers tells the writer which problem to fix first. Expanding API in a sentence that already sprawls will not rescue the sentence; splitting the sentence will.

The rules are vocabulary-level and the page says so. Nothing is paraphrased, no definition is invented, and a term that is precise in the reader's world is left alone by the writer after review rather than by the tool automatically. In developer documentation an API is an API, and a tool that expands it everywhere is actively harmful; the change list exists so that decision stays with the author.

The usual workflow is a first pass on user-facing prose: paste a help article, a release note or a policy summary, read the plain version and the term list, restore the two or three substitutions that were wrong for the audience, and take the leftover list as a short to-do. Because everything is listed, the pass takes minutes and the result is explainable to whoever reviews the document.

Use it before a document goes to an audience that did not choose the subject — end users, applicants, patients, customers. Then let a human decide which precise terms must stay.\\n\\nFor sentence-level weight rather than vocabulary, the {{simplify-text-tool|Simplify Text Tool}} and the {{sentence-rewriter|Sentence Rewriter}} take over where this converter stops.`,
    howTo: [
      { step: "Paste the technical text into the box." },
      { step: "Read the converted version and the count of terms rewritten." },
      { step: "Check the term-by-term list, including each term's sentence length." },
      { step: "Review the leftover list and handle the long words by hand." },
      { step: "Copy or download the plain version and restore any term your audience needs exactly." },
    ],
    whenToUse: `Use the technical to plain language converter when a document written by specialists has to be read by everyone else: help articles, release notes, policy summaries, onboarding material and consent text. It expands listed acronyms, replaces listed jargon, and tells you what it left alone.\\n\\nWhen the sentences themselves are the problem, the {{simplify-text-tool|Simplify Text Tool}} replaces wordy phrases and splits long sentences, and the {{sentence-rewriter|Sentence Rewriter}} offers clause-level rewrites for prose that has gone flat.`,
    faqs: [
      {
        q: "Which acronyms are expanded?",
        a: "A published list of common ones — API, CPU, RAM, CDN, SLA, URL, SEO, KPI, UI, UX, OS, SQL, JSON and more — each with a plain expansion and a note. Matching is case-sensitive, so ordinary lowercase words are never expanded.",
      },
      {
        q: "Why does the converter list words it did not change?",
        a: "Because a tool that silently leaves half the jargon behind is worse than one that names the leftovers. Words of twelve letters or more that survive and are in neither table are listed so they can be handled by hand.",
      },
      {
        q: "What does the sentence length next to each term mean?",
        a: "It is the word count of the sentence the term appeared in. A technical term in a short sentence is readable; the same term in a thirty-five-word sentence is not, and the number shows which sentence to fix first.",
      },
      {
        q: "Will it paraphrase my meaning?",
        a: "No. Only entries in the two published tables are replaced, whole phrases only. Nothing is rephrased, no definition is invented, and every change is listed so it can be reviewed or reverted.",
      },
      {
        q: "Is the text sent to a server?",
        a: "No. Both tables are local data and the conversion runs in the browser, so unpublished or client material stays in the tab.",
      },
    ],
  },

  "active-voice-converter": {
    keywords: ["active voice", "passive voice", "passive to active", "named actor", "sentence clarity"],
    intro:
      "The active voice converter finds passive clauses, recasts the ones that name their actor and use a covered tense, and reports the rest with the reason they were left exactly as written.",
    content: `The active voice converter starts from the definition. A passive clause is a form of be plus a past participle, and it only becomes an active clause when the actor is named in a by-phrase — otherwise there is nothing to put in the subject position. So the engine finds every be-plus-participle construction, takes the actor from a following by-phrase, and rebuilds only what it can rebuild correctly.

The verb table decides the rest. Was and were plus a participle become simple past, using a published list of irregular participles: written becomes wrote, taken becomes took, made becomes made, and a regular participle such as delivered is already its own past. Has been, have been and had been become the perfect active, so the report has approved the budget reads naturally from the budget has been approved by the board.

Everything outside those rules is reported rather than forced. An agentless passive — the decision was made — is left alone with the note that a named actor is missing and that the passive may be the right choice if the actor is unknown or unimportant. A present-tense passive such as the plan is reviewed by the committee is left alone with the tense named, because the tool does not guess at third-person forms. Adjectival participles are excluded outright: she was tired by noon is a state, not an action, and recasting it would produce nonsense.

The exclusions matter as much as the conversions. A by-phrase that is really a time or an idiom — by Friday, by hand, by default, by mistake, by all means — is not an actor, and treating it as one is the classic failure of a naive converter. Names that merely start like a month are protected too, so Maya is never mistaken for May.

The page is explicit that the passive is not an error. Scientific writing, incident reports and news copy use it deliberately when the object of the sentence is the point or the actor is genuinely unknown. The tool converts the clear cases, lists the others with reasons, and leaves the judgement where it belongs. The counts on the page — converted, no named actor, left as written — tell you at a glance how much of the paragraph the rules actually reached.

The move from passive to active is a choice about emphasis rather than a rule of grammar, and sentence clarity is usually the reason to make it: a reader who knows who acted can follow the consequence without guessing.

Practically, a pass takes a minute: paste a paragraph, read the converted version, scan the amber findings for the clauses that need a human, and copy the result. Every original clause is shown beside its rewrite, so nothing is lost if a recast reads worse in context. Nothing is uploaded, and the whole conversion happens in the tab.

When a paragraph is flat for other reasons, the {{sentence-rewriter|Sentence Rewriter}} changes sentence shape and the {{simplify-text-tool|Simplify Text Tool}} trims the weight from long sentences.\\n\\nOne caution worth repeating: the passive voice is not a fault. Convert a passive only when naming the actor adds information; if it adds an accusation or a guess, the passive was doing honest work.`,
    howTo: [
      { step: "Paste a paragraph containing passive clauses." },
      { step: "Read the active version and the converted-clause count." },
      { step: "Scan the clause list for the amber findings, which carry a reason." },
      { step: "Add a named actor where one exists, then convert that clause by hand or with the tool." },
      { step: "Copy the result and check each recast clause in the context of the paragraph." },
    ],
    whenToUse: `Use the active voice converter on reports, procedures and briefings where too many clauses have lost their subject and the prose has gone grey. It recasts the clauses that name their actor and can be rebuilt safely, and it reports the ones that cannot.\\n\\nIf the paragraphs are still long and padded after conversion, the {{simplify-text-tool|Simplify Text Tool}} replaces wordy phrases and splits sentences, while the {{sentence-rewriter|Sentence Rewriter}} handles prose whose problem is shape rather than voice.`,
    faqs: [
      {
        q: "Which passives can be converted automatically?",
        a: "Those that name their actor in a by-phrase and use a covered tense: was or were with a participle, or has been, have been and had been. Irregular participles come from a published table, and regular participles are already their own past tense.",
      },
      {
        q: "Why was my sentence left unchanged?",
        a: "Each finding carries the reason. Usually the clause has no named actor, the tense is not covered (present-tense passives are left alone), or the participle is adjectival — was tired describes a state rather than an action.",
      },
      {
        q: "Is the passive voice wrong?",
        a: "No. It is a tool with real uses: when the actor is unknown, when the object is the point of the sentence, or when naming the actor would be unfair. The converter makes the choice visible rather than abolishing it.",
      },
      {
        q: "What about a by-phrase like by Friday?",
        a: "It is not an actor. Times, dates, weekdays, months and idioms such as by hand, by default and by mistake are recognised and treated as no agent, so the clause is reported rather than rewritten.",
      },
      {
        q: "Does the text leave my browser?",
        a: "No. The detection and the rewrite are local rules over the pasted text, which stays in the tab.",
      },
    ],
  },
};
