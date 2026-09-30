import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B6, Grammar & Style group: authored SEO entries for the mechanical
 * checks, phrase detectors and register tools backed by the shared engine in
 * `src/domains/writing/lib/text/`. Keys are registry slugs; see ../tool-seo.ts
 * for the contract these entries are validated against.
 */
export const B6_GRAMMAR_SEO: Record<string, ToolSeo> = {
  "grammar-checker": {
    keywords: ["grammar checker", "grammar check", "common errors"],
    intro:
      "This grammar checker publishes the exact list of rules it runs, so a clean result means \"none of these checks fired\" rather than an unqualified claim about your writing.",
    content: `A grammar checker is only as honest as the errors it claims to find, so this one publishes its rule list. Seven mechanical checks run and the page names every one of them. If none fires you see a clean result qualified as exactly that: none of these checks found anything, which is not the same as a guarantee that the text is correct.\\n\\nThe checks cover the common errors that survive a careful draft because the eye skips them. A repeated word — the the, is is — is caught wherever two identical words sit back to back. Article agreement is checked against sound rather than spelling, so a apple becomes an apple, a university stays a university, and an MRI is recognised as needing an because the letter M is read em. Seven confusion pairs are checked in context: your and you're, its and it's, then and than, to and too, loose and lose, affect and effect, and weather and whether. None is flagged on sight; each is flagged only in a construction where the wrong one has almost certainly been used, such as your going or more then enough.\\n\\nThe remaining checks are structural rather than lexical. A sentence that begins with a lowercase letter after a full stop is flagged, with abbreviations such as e.g. and single initials excluded so the rule does not misfire on ordinary academic prose. A paragraph that never ends with punctuation is flagged, because a missing full stop is easy to lose while editing a long document. Unmatched brackets, braces and quotation marks are reported with the count on each side, which is the fastest way to find a stray opening parenthesis.\\n\\nPrecision is the design goal, because a grammar check that cries wolf gets ignored. Every rule is written to fire on a clear error and stay silent on a correct sentence, which is why had had and that that are still reported but carry a note that they may be deliberate. A false positive costs trust, and trust is the entire value of a mechanical checker.\\n\\nWhat the tool cannot do matters just as much as what it can. There is no parser behind it, so it cannot judge tense consistency, subject-verb agreement across a long clause, dangling modifiers, pronoun reference or word order. It will not find a misspelling, because it carries no dictionary, and it will not comment on style. Those tasks need either a much larger grammar model or a human reader, and a tool that implied otherwise would be doing you a disservice. Fix the mechanical findings, then read the text once more yourself.\\n\\nEverything runs in the browser. Nothing is uploaded, stored or logged, and the text disappears when the tab closes, which makes the checker usable on drafts you would not paste into a web service. Copy report and Download produce a plain-text list of the findings you can keep beside the draft.\\n\\nUse it as the last mechanical pass rather than the first. Draft freely, then run the checks before sending anything that has to be clean: a report, a submission, a covering email. Clearing the flagged items takes a minute and removes the small errors that make a reader doubt the larger ones. When the report comes back empty, that is the moment to read the piece aloud, because the mistakes that remain are the ones a script cannot see.`,
    howTo: [
      { step: "Paste your draft; all seven checks run as you type and the count for each appears immediately." },
      { step: "Read the findings table from the top: each row names the check, the issue and a suggested fix." },
      { step: "Apply the mechanical fixes, starting with repeated words and the confusion pairs." },
      { step: "Re-read the paragraphs flagged for missing terminal punctuation, which are often still in progress." },
      { step: "When the report is empty, read the text aloud — the remaining mistakes are the ones no script can find." },
    ],
    whenToUse: `Use this grammar check as the mechanical pass at the end of drafting, once the wording is settled. When the issue is sentence construction rather than a mechanical slip, the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} finds the overloaded sentences, and the {{passive-voice-detector|Passive Voice Detector}} covers a construction this checker deliberately ignores.\\n\\nIf the draft is clean but reads as heavy, the {{readability-grade-scorer|Readability Grade Scorer}} reports the reading level and the counts behind it, which is a different question from correctness.`,
    faqs: [
      {
        q: "Does this tool check grammar properly?",
        a: "It runs seven specific mechanical checks and says so. It is not a parser, so it will not catch tense errors, subject-verb agreement across long clauses or dangling modifiers. Read the published rule list before relying on a clean result.",
      },
      {
        q: "Which specific checks does it run?",
        a: "Repeated words, a and an agreement by sound, seven commonly confused word pairs in context, sentence capitalisation, paragraphs without terminal punctuation, and unmatched brackets and quotation marks.",
      },
      {
        q: "Why does it flag phrases like had had or that that?",
        a: "Because the repeated-word rule cannot tell a deliberate doubling from a typo. Both can be correct, so the finding carries a note saying it may be intentional; the rule reports it and leaves the decision with you.",
      },
      {
        q: "Does it rewrite my text automatically?",
        a: "No. It never edits the draft. Each finding suggests a corrected fragment in a separate column, which you can copy by hand, so nothing changes without your knowledge.",
      },
      {
        q: "Will it find spelling mistakes?",
        a: "No. There is no dictionary in the engine, so misspellings are out of scope. The confusion pairs cover a handful of words that spell-checkers handle badly, but a real spell check is a separate job.",
      },
    ],
  },

  "passive-voice-detector": {
    keywords: ["passive voice", "passive voice detector", "active voice"],
    intro:
      "The Passive Voice Detector finds be + participle constructions across your draft, marks the ones with an expressed agent, and reports how many sentences carry one without claiming that passive voice is a fault.",
    content: `Passive voice is one of the few grammatical constructions writers are warned about by name, and the warning is usually oversimplified. This passive voice detector finds the constructions and shows where they are, so the decision to keep or rewrite each one stays with you.\\n\\nA passive construction is a form of be followed by a past participle: the report was written, the forms have been sent, the decision will be made. The detector looks for exactly that pattern, allowing a common adverb between the auxiliary and the participle, so the report was quickly written is still recognised. When a by phrase follows within a few tokens, the hit is marked strong, because an expressed agent — written by the analyst — is the clearest evidence of a true passive. Hits without one are marked as candidates.\\n\\nThe output is a count, a share and a list. The share is the proportion of sentences containing at least one candidate, which is more informative than a raw total: twenty constructions across a hundred sentences read very differently from twenty across thirty. Each hit is shown with the phrase, the participle and the sentence it came from, so a rewrite can start from real text rather than a number.\\n\\nPassive voice is not a fault. Scientific writing uses it to keep the focus on the method rather than the experimenter, procedural writing uses it when the actor is obvious or irrelevant, and sometimes the object of an action is genuinely the topic of the sentence. Formal reports often read better with a mixture. The problem arises when passive voice hides responsibility, weakens a claim, or drains the energy from instructions that should address the reader directly.\\n\\nDetection is a heuristic and the page says where it breaks. Adjectival participles look identical to passives and are flagged as well: the door is closed, she is interested, the team is committed are states rather than actions, but they match be plus participle. Get-passives such as the window got broken are not detected separately, because get is normally a main verb. And the irregular participle list is finite, so an unusual form may be missed.\\n\\nThe active voice alternative is usually shorter. She wrote the report replaces the report was written, and the actor becomes visible. Rewriting a passive sentence into the active voice also tends to reduce its length, which is why the readability tools often improve when a passive-heavy draft is revised.\\n\\nTwo ways to use the results. Scan the sentences with the most candidates first, since several passives in one sentence usually mean the sentence is carrying too much. Then look at the strong hits, where an agent was named: those are the easiest to flip, because the actor is already in the sentence waiting to become the subject.\n\nA final note on tense: a passive construction is not the same as the past tense. The report was written is passive and past; the report is being written is passive and present; the committee wrote the report is active and past. Keep the two ideas separate while revising, or the rewrite can end up changing the timeline rather than the voice.`,
    howTo: [
      { step: "Paste your draft; candidates appear as you type, each with the sentence it sits in." },
      { step: "Read the share of sentences affected — that figure is more useful than the raw total." },
      { step: "Open the sentence table and start with the sentences carrying more than one candidate." },
      { step: "Rewrite the strong hits first: the by phrase names the actor, so it can become the subject." },
      { step: "Re-check the share and decide case by case which passives were doing useful work." },
    ],
    whenToUse: `Use this detector when you want to see passive constructions rather than just reduce them. When the sentence is heavy for a different reason — several clauses piled together — the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} measures that instead, and the {{grammar-checker|Grammar Checker}} covers mechanical slips the passive rule ignores.\\n\\nIf a passive-heavy draft reads as flat, the {{sentence-variety-checker|Sentence Variety Checker}} shows whether the monotony comes from sentence length or from the constructions themselves.`,
    faqs: [
      {
        q: "Is passive voice always wrong?",
        a: "No. It is standard in scientific and procedural writing, and it is the right choice when the object of the action is the topic. It becomes a problem when it hides the actor, weakens a claim or makes instructions vague.",
      },
      {
        q: "How does the detector find passives?",
        a: "It looks for a form of be, optionally followed by a common adverb, followed by a past participle taken from an irregular list or matching the regular -ed pattern. A following by phrase raises the hit to strong confidence.",
      },
      {
        q: "Why was 'the door is closed' flagged?",
        a: "Because it matches the pattern exactly. It is arguably a description of a state rather than an action, so the detector lists it as a candidate and the page states that adjectival participles are a known false positive.",
      },
      {
        q: "What share of passive sentences is too many?",
        a: "There is no threshold. In a methods section a high share is normal; in marketing copy it usually signals weak verbs. Read the flagged sentences and judge whether each one hides the actor or weakens the point.",
      },
      {
        q: "How do I turn a passive sentence into an active one?",
        a: "Make the agent the subject. In 'the report was written by the analyst', the analyst is already named, so the active version is simply 'the analyst wrote the report' — and it is two words shorter.",
      },
    ],
  },

  "cliche-detector": {
    keywords: ["cliché detector", "clichés", "tired phrases"],
    intro:
      "The cliché detector matches your text against a curated list of tired phrases and shows why each one is on the list, so you can decide which to keep rather than being handed a style score.",
    content: `Clichés are phrases that were once vivid and have been used until they stopped meaning anything. This cliché detector works from a hand-maintained list and reports every match with the reason it is listed, which keeps the judgement with the writer instead of hiding it in a score.\\n\\nThe list holds more than sixty entries across three kinds. Idioms such as bite the bullet, under the weather and the tip of the iceberg are the traditional clichés. Corporate and marketing phrases such as low-hanging fruit, move the needle, circle back and thinking outside the box make up a second group, and they age faster than the idioms do. Stock similes and metaphors such as easy as pie, crystal clear and the calm before the storm form the third. Each entry carries a short note explaining what the phrase does instead of saying something specific.\\n\\nMatching is literal and case-insensitive. A phrase is either on the list or it is not, so the same draft always produces the same clichés, and there is no model to disagree with. Word boundaries are respected, which means the entry touch base does not fire inside touchdown or base camp. When two entries could match at the same position, the longer one wins, so the report never doubles up on the same span of text.\\n\\nThe limitation follows from the method. A list cannot know that a phrase has become tired in your particular field, and it cannot recognise a fresh cliché that has not been added yet. It also cannot tell a deliberate echo from an unconsidered habit: a headline, a speech or a piece of satire may use tired phrases on purpose, and the detector will still report them.\\n\\nKnowing where clichés cluster is still useful. A first draft written quickly tends to fall back on the same handful of phrases, and seeing them listed side by side makes the pattern obvious in a way that reading the draft does not. Writers usually find that one or two habits account for most of the matches, and replacing them with the specific thing they were standing in for sharpens the prose immediately.\\n\\nThe tool pairs naturally with a frequency check. A cliché is a phrase-level habit; the words you lean on too often are a term-level one. Run both, fix the phrases that are doing no work, and keep the ones that earn their place because the audience expects them.\n\nTwo habits make the tool more useful. Copy the match list before editing, because the phrases are easy to lose track of once you start rewriting. And read each flagged sentence aloud: a cliché that still reads smoothly has lost its force, while one that sounds awkward in your voice was probably standing in for something more specific. The goal is not a cliché-free draft, which is close to impossible in ordinary prose, but a draft in which every tired phrase is either doing real work or has been replaced with the thing it stood for. The count is a starting point, not a score to drive to zero.`,
    howTo: [
      { step: "Paste a draft; every phrase on the curated list is flagged as you type." },
      { step: "Read the matches table: each row shows the phrase and the reason it is on the list." },
      { step: "Note which clichés repeat, since a repeated phrase is usually a habit rather than a choice." },
      { step: "Replace each match with the specific thing it was standing in for, or keep it deliberately." },
      { step: "Paste the revision back and confirm the count has fallen to the ones you meant to keep." },
    ],
    whenToUse: `Use the cliché detector when a draft feels flat and you suspect the phrasing is to blame. When the habit is a single word rather than a phrase, the {{overused-word-finder|Overused Word Finder}} counts term frequency and proximity, and the {{redundancy-finder|Redundancy Finder}} catches pairs whose two halves repeat one meaning.\\n\\nIf the phrases are fine and the draft is simply wordy, the {{wordy-phrase-simplifier|Wordy Phrase Simplifier}} substitutes shorter equivalents and shows every change it makes.`,
    faqs: [
      {
        q: "How many phrases does the list contain?",
        a: "More than sixty, split between traditional idioms, corporate and marketing jargon, and stock similes. The list is published in the engine source, so you can see exactly what is matched and request additions.",
      },
      {
        q: "Why was my cliché not flagged?",
        a: "Because the list is finite. A phrase that is tired in your field but absent from the list will not be reported, and neither will a cliché that has only recently emerged. Absence of a match is not proof the phrase is fresh.",
      },
      {
        q: "Is every match an error?",
        a: "No. A cliché can be the right choice in a headline, a speech or a deliberately informal piece. The detector reports matches and their reasons; deciding whether to keep one is an editorial judgement it does not make for you.",
      },
      {
        q: "Can I use the detector for marketing copy?",
        a: "It is at its most useful there, because corporate jargon accumulates quickly. Phrases such as low-hanging fruit, move the needle and circle back are all on the list, and replacing them with the concrete claim usually improves the copy.",
      },
      {
        q: "Does the detector change my text?",
        a: "No. It only reports. Each match is listed with its reason and nothing is rewritten, so the draft is untouched and every suggested change is yours to accept or reject.",
      },
    ],
  },

  "redundancy-finder": {
    keywords: ["redundancy", "redundant phrases", "repetitive phrasing"],
    intro:
      "The Redundancy Finder flags phrases whose parts say the same thing twice, names the repetition, and leaves it to you to decide where an emphatic pair is deliberate.",
    content: `Redundancy is the quiet kind of repetition: not a word used too often, but two words doing one job. This redundancy finder matches your text against a curated list of pairs and abbreviations whose second half repeats the first, and it explains the repetition rather than simply flagging it.\\n\\nThree kinds of pair are on the list. Tautologies double a meaning — free gift, advance planning, end result, past history — where one word already contains the other. Fixed pairs such as null and void, each and every and first and foremost are legal or rhetorical formulas that say one thing twice. And expanded abbreviations such as ATM machine, PIN number and LCD display repeat a word that the abbreviation already contains. Together the list runs to nearly fifty entries, and every one carries a note explaining where the repetition lies.\\n\\nMatching is literal, case-insensitive and word-bounded, so the same draft always produces the same result. A pair is only reported when both words appear together in order, which is what separates a genuine redundancy from two words that happen to be near each other.\\n\\nThe fix is usually deletion. Cut free from free gift, planning from advance planning, machine from ATM machine, and the sentence still says what it said. That is the simplest test for redundancy: remove one half and see whether the meaning changes. If it does not, the word was not carrying weight.\\n\\nRedundancy is not always a fault, and the tool says so. Legal drafting sometimes keeps a doubled phrase because both halves have been tested in court. Emphasis can be deliberate: each and every has a rhetorical force that every alone may not. And some pairs are so embedded in idiom that removing half makes the sentence sound clipped. The detector reports the phrase and the reason; the writer decides.\\n\\nIt is worth distinguishing this from the other repetition tools. A redundancy is a single phrase that says one thing twice. An overused word is a term used too often across the draft. Wordiness is a phrase that is longer than it needs to be without repeating itself. The three overlap in practice, which is why running them together catches far more than running any one of them alone.\\n\\nRepeated phrasing is also worth checking at the sentence level. A redundancy checker will not notice that you have written the same sentence twice in slightly different words, and that is a separate reading pass. What this tool can do — reliably and in one pass — is find the small doubled phrases that survive a careful edit because they read so smoothly that the eye never stops on them.\n\nThe clearest redundant phrases are the ones where a single word already implies the other, and a pass with the tool usually removes several at once without changing a sentence's meaning. That kind of repetitive phrasing is different from repetition across a whole document, which needs a frequency check rather than a phrase list. Running both gives a fuller picture of how much the draft repeats itself.`,
    howTo: [
      { step: "Paste a draft; every redundant phrase on the list is flagged as you type." },
      { step: "Read the matches table, which names the phrase and explains where the repetition is." },
      { step: "For each match, delete one half and re-read the sentence to confirm nothing was lost." },
      { step: "Keep any pair that is deliberate emphasis, a legal formula or an established idiom." },
      { step: "Paste the revision back and confirm the count has fallen to the pairs you chose to keep." },
    ],
    whenToUse: `Use the redundancy finder when a draft reads as padded without any single sentence being long. When the padding is a whole phrase rather than a doubled word, the {{wordy-phrase-simplifier|Wordy Phrase Simplifier}} substitutes shorter equivalents.\\n\\nIf the same term keeps returning across the draft rather than inside one phrase, the {{overused-word-finder|Overused Word Finder}} measures both its frequency and how close together the occurrences sit.`,
    faqs: [
      {
        q: "What is a redundant phrase?",
        a: "A phrase whose two parts express the same idea, so one of them can be removed without changing the meaning. Free gift is the clearest case, since a gift is free by definition.",
      },
      {
        q: "Why is 'ATM machine' redundant?",
        a: "Because the M in ATM already stands for machine, so the phrase says machine machine. The same logic applies to PIN number, LCD display, HIV virus and ISBN number, all of which are on the list.",
      },
      {
        q: "Should redundancy always be removed?",
        a: "No. Legal drafting sometimes keeps tested doubled phrases, and deliberate emphasis can justify a pair such as each and every. Remove a redundancy when the second word adds nothing; keep it when it was chosen.",
      },
      {
        q: "How is this different from an overused word checker?",
        a: "This tool looks inside a single phrase, where two adjacent words repeat one meaning. An overused word check measures how often a term appears across the whole text and how close its occurrences are. Both are repetition, but they need different fixes.",
      },
      {
        q: "Does it catch repeated sentences?",
        a: "No. It matches a fixed list of redundant phrases. Two sentences that say the same thing in different words will not be flagged, and finding those needs a reading pass rather than a rule.",
      },
    ],
  },

  "wordy-phrase-simplifier": {
    keywords: ["wordy phrases", "concise writing", "wordiness"],
    intro:
      "The Wordy Phrase Simplifier replaces wordy expressions with shorter equivalents from a published table and shows every change, producing a tightened copy without paraphrasing a single word on its own initiative.",
    content: `Wordiness is the habit of using four words where two would do, and it is the easiest kind of clutter to remove because the offenders are largely the same phrases in every draft. The Wordy Phrase Simplifier substitutes a published table of shorter equivalents and shows every replacement it makes, so concise writing becomes a visible, checkable edit rather than a vague instruction.\\n\\nThe table covers about seventy expressions. Wordy conjunctions become plain ones: due to the fact that becomes because, in spite of the fact that becomes although. Wordy prepositions shorten: prior to becomes before, with regard to becomes about, in the absence of becomes without. Nominalisations unpack into verbs: make a decision becomes decide, take into consideration becomes consider, come to the conclusion becomes conclude. And several phrases carry no meaning at all, so the replacement is nothing: it is important to note that, needless to say and in my opinion are deleted along with the space they leave behind.\\n\\nThe rewrite is deterministic. The tool walks the text from left to right, replaces each matched phrase with its listed equivalent, tidies the spacing the deletion leaves, and capitalises a sentence that now begins with a lowercase word. If a phrase is not on the table, nothing happens to it. That is the whole method, and it means the result can be checked line by line against the table of changes shown beneath it.\\n\\nA worked example: in order to succeed, due to the fact that we tried becomes to succeed, because we tried. Four words disappear and no meaning is lost. Run across a whole document, the effect compounds, which is why wordiness is often the single largest source of padding in a first draft.\\n\\nThe honest caveat is that a replacement is not always right in context. In terms of is sometimes the precise phrase, and deleting a filler can remove an emphasis you wanted. A longer phrase occasionally carries a nuance its shorter cousin does not. Read the simplified text as a proposal and edit it rather than pasting it back unread; the tool's value is that it makes the choices visible, not that it makes them correctly in every case.\\n\\nThe tool reports the word count before and after, which is a useful measure of how much padding was in the draft. It also pairs well with a readability score, because both wordiness and long sentences raise a reading level. Cutting the phrases is usually the faster of the two fixes, and the one with no risk to the argument.\n\nWordy phrases cluster in particular kinds of writing. Reports, proposals and academic papers accumulate nominalisations — make a decision, give consideration to — because the house style rewards an impersonal voice, while business writing collects phrases such as going forward and with regard to because they soften a hard commitment. Neither tendency is a fault on its own, but both pad a draft, and a table-based simplifier is the fastest way to see the padding and decide phrase by phrase what to keep.`,
    howTo: [
      { step: "Paste a draft; every wordy phrase on the table is replaced in the simplified text below." },
      { step: "Read the change table, which lists each wordy phrase and its shorter equivalent." },
      { step: "Compare the word count before and after to see how much padding the draft carried." },
      { step: "Read the simplified text in full and restore any phrase whose nuance you actually wanted." },
      { step: "Copy the result or download it as plain text, then paste the edited version back to re-check." },
    ],
    whenToUse: `Use the simplifier when a draft is padded with stock constructions and you want a concrete first pass. When the problem is a single phrase whose halves repeat each other, the {{redundancy-finder|Redundancy Finder}} targets that instead.\\n\\nIf the draft also reads as difficult, the {{readability-grade-scorer|Readability Grade Scorer}} shows how sentences and vocabulary contribute, and the {{clarity-score-tool|Clarity Score Tool}} folds word heaviness and sentence length into one transparent composite.`,
    faqs: [
      {
        q: "How does the simplifier rewrite my text?",
        a: "It matches a published table of about seventy wordy phrases and substitutes the listed shorter form, working left to right. Nothing is paraphrased and no phrase outside the table is touched, so the output is fully reproducible.",
      },
      {
        q: "Is the simplified version always better?",
        a: "No. It is shorter, and shorter is usually clearer, but a longer phrase can carry a nuance that its shorter equivalent loses. Treat the output as a proposal and read it through before adopting it.",
      },
      {
        q: "Does it change my meaning?",
        a: "It changes wording, not content, because each replacement is a listed equivalent with the same sense. Where a shortened phrase could shift emphasis, the change appears in the table so you can put the original back.",
      },
      {
        q: "Why are some phrases deleted entirely?",
        a: "Because a few entries are pure filler — it is important to note that, needless to say, in my opinion — and the sentence is stronger without them. The change table shows a removal explicitly rather than hiding it.",
      },
      {
        q: "How much shorter will my text get?",
        a: "It depends on how many listed phrases the draft contains. The tool reports the word count before and after; drafts heavy with nominalisations routinely lose a noticeable share of their length with no loss of meaning.",
      },
    ],
  },

  "tone-analyzer": {
    keywords: ["tone analyzer", "tone of writing", "sentiment"],
    intro:
      "The Tone Analyzer reports five separate measured signals — polarity, energy, directness, confidence and register — instead of collapsing the tone of writing into a single number.",
    content: `Ask what tone a piece of writing has and most answers reduce to an adjective. Tone is better understood as several properties measured at once, and the Tone Analyzer reports five of them separately so that no single verdict has to stand in for the whole.\\n\\nPolarity is the first signal, and it is the most concrete. The tool counts explicit sentiment words against a finite positive and negative lexicon and reports the net figure across the text. It is honest about the method: the count is not sentiment analysis in the machine-learning sense, and a word list cannot see irony, sarcasm or negation. Not a great outcome registers as a positive hit, because the word great is on the positive list.\\n\\nEnergy is the second signal. It rises with exclamation marks, with intensifiers such as very, extremely and really, and with emphasised all-capital words. A high energy reading usually means emphatic or promotional prose; a reading of low means the writing is measured and declarative. For a report that is exactly right, and for a landing page it is often a weakness.\\n\\nDirectness is the third, and it counts second-person pronouns and question marks, both of which are how writing addresses a reader. A text that says you and asks questions reads as spoken to someone; one with no second person and no questions reads as impersonal, which is the register of policy documents and academic abstracts. Neither is better; they suit different jobs.\\n\\nConfidence is the fourth, and it counts hedges: perhaps, seems, might, tends to and the rest of a published list. Dense hedging makes a claim tentative and is entirely normal in research writing, where qualification reflects the strength of the evidence. Sparse hedging reads as assertive, which can be a strength in a recommendation and a liability in a proposal.\\n\\nRegister is the fifth, and it reports the formality band from the same composite the Formality Level Detector uses, so the two tools agree by construction. Together the five signals describe how the tone of writing is pitched rather than naming it, and the summary sentence reads them together for reference.\\n\\nThe honest limits are worth repeating. The sentiment lexicon is finite; irony, sarcasm and negation defeat it. Signal counts say nothing about whether a tone is appropriate, because that depends on the audience. Use the analyzer to check consistency across a document and to spot a section that drifted into a different register, not to certify that the tone is right.\n\nA useful routine is to compare sections rather than read the whole document at once. Paste the introduction, note the five signals, then paste the conclusion and compare. A piece of writing whose tone drifts — opening formal and closing colloquial, or beginning tentative and ending in flat assertion — usually has a structural problem underneath, such as a conclusion that claims more than the body established. The signals make that drift visible in numbers. Because every signal is a count, the comparison is reproducible from one draft to the next.`,
    howTo: [
      { step: "Paste your text; the five signals update as you type." },
      { step: "Read polarity first, remembering that it counts explicit sentiment words only." },
      { step: "Check energy and directness to see whether the prose is emphatic, addressed or impersonal." },
      { step: "Read confidence: a high hedge count makes claims tentative, which is normal in research writing." },
      { step: "Compare the register signal with the surrounding sections to catch a drift in formality." },
    ],
    whenToUse: `Use the tone analyzer when you want several measurable properties of the prose rather than a single label. When the question is purely how formal the register is, the {{formality-level-detector|Formality Level Detector}} reports that composite with its component weights.\\n\\nFor academic prose specifically, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} turns the same markers into a pass-or-warn checklist, and the {{sentence-variety-checker|Sentence Variety Checker}} covers the rhythm that a tone reading does not touch.`,
    faqs: [
      {
        q: "Can a tool really detect tone?",
        a: "It can measure countable properties of a text — sentiment words, intensifiers, pronouns, hedges, formality — and that is what this analyzer does. It cannot read intent, so treat the signals as measurements rather than a verdict on how the writing comes across.",
      },
      {
        q: "How is polarity calculated?",
        a: "By counting words from a finite positive list and a finite negative list and reporting the net figure. It is a lexicon count, not a trained model, so it misses irony and negation and should be read with that in mind.",
      },
      {
        q: "Why does my positive sentence score as negative?",
        a: "Usually because it contains a negative word used positively or in negation — 'no reason to worry' counts worry as a negative hit. Word lists cannot parse negation, and the page states this limitation rather than hiding it.",
      },
      {
        q: "What do energy and directness mean?",
        a: "Energy rises with exclamation marks, intensifiers and all-capital words. Directness counts second-person pronouns and questions, which are how text addresses a reader. High energy suits promotion; high directness suits instructions.",
      },
      {
        q: "Does it use AI?",
        a: "No. Every signal is a count over a published word or punctuation list, computed in the browser. There is no model, no training data and no external service, so the same input always produces the same signals.",
      },
    ],
  },

  "formality-level-detector": {
    keywords: ["formality", "formal writing", "register"],
    intro:
      "The Formality Level Detector scores how formal your writing reads from six countable markers, and shows the weight, measurement and rule behind each one so the score can be argued with.",
    content: `Formality is not a mystical quality of prose; it is a set of countable habits, and counting them is what this tool does. Six markers produce a score out of one hundred, and every weight and curve is printed on the page so the result can be traced rather than taken on trust.\\n\\nContractions carry a fifth of the score. Formal writing tends to write words out in full, so don't, it's and we're pull the reading down, and the component loses twenty points for every contraction per hundred words. Informal vocabulary carries a quarter: words such as really, very, stuff, things and gonna are counted against a published list, and each occurrence costs eight points per hundred words. First- and second-person pronouns carry another fifth, because formal writing prefers the impersonal or third person; I, we, you and the rest cost six points per hundred words.\\n\\nExclamations and questions carry a tenth, since formal prose is largely declarative, and the component loses thirty-five points per hundred punctuation marks. Formal connectors carry fifteen percent and are the one component that rewards presence rather than absence: therefore, thus, moreover, furthermore and their neighbours score twenty points per hundred words, capped at the maximum. Sentence length carries the final tenth, losing five points per word below fifteen for a choppy register.\\n\\nThe weighted average lands in one of five bands, from very formal through formal, neutral and informal to very informal, and each band carries a one-line note describing where it usually appears: academic or legal prose at one end, speech and chat at the other.\\n\\nTwo distinctions are worth holding on to. Formal writing is not the same as wordy writing: a densely formal sentence can be concise, and a chatty one can ramble. Formal writing is also not automatically better. Register should match the audience and the occasion, and a grant proposal, a chat message and a novel each want a different setting. The score describes which one the draft has chosen, not which one it should have.\\n\\nThe practical use is consistency. Most register problems are unintentional drift rather than a wrong choice: a report that opens formally and slides into contractions, or a lively blog post with a stiff paragraph left in from an earlier draft. Score a section, read the components that moved, and the drift becomes visible. Because the markers are listed and counted, a low score always points at specific words rather than at a vague feeling that the writing sounds casual.\n\nIt helps to know which way each marker moves the score. Contractions, informal words, pronouns and exclamatory punctuation all pull it down, while formal connectors and longer sentences push it up. Rewriting a paragraph usually means changing two or three of those categories, not all six, and the components panel shows which ones are doing the work. A draft that reads as too casual is nearly always heavy on contractions and pronouns rather than short on formal connectors, so expanding a few contractions is often the whole fix. Register is a choice, and the score only reports which one the text has made.`,
    howTo: [
      { step: "Paste your text; the score and the six components update as you type." },
      { step: "Read the band and its note to place the register against the audience you have in mind." },
      { step: "Open the components panel and find the one dragging the score down." },
      { step: "Apply the rule shown for that component — expand contractions, replace informal words, cut exclamations." },
      { step: "Score each section separately when you want to check consistency across a longer document." },
    ],
    whenToUse: `Use the formality detector when you want a single register reading with its parts exposed. When the question is broader — how the prose sounds overall — the {{tone-analyzer|Tone Analyzer}} reports five signals including this one.\\n\\nFor academic writing specifically, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} turns formal writing conventions into a per-rule checklist, and the {{style-guide-adherence-checker|Style Guide Adherence Checker}} covers the mechanical conventions a house style adds on top.`,
    faqs: [
      {
        q: "What makes writing formal?",
        a: "Fewer contractions, less informal vocabulary, fewer first- and second-person pronouns, no exclamations, more formal connectors and somewhat longer sentences. This tool counts all six and shows how each contributes to the score.",
      },
      {
        q: "How is the formality score calculated?",
        a: "As a weighted average of six counted components: contractions 20%, informal vocabulary 25%, pronouns 20%, exclamations and questions 10%, formal connectors 15% and sentence length 10%. The weight and rule for each is printed on the page.",
      },
      {
        q: "Is formal writing better than informal writing?",
        a: "No. Register should match the audience. A grant proposal, a chat message and a novel each want a different setting, and the score describes which one the draft has chosen rather than which it should have chosen.",
      },
      {
        q: "Why does my score change with sentence length?",
        a: "Sentence length is one of the six components, carrying ten percent. Very short sentences read as choppier and more conversational, so the component loses five points for each word below a mean of fifteen.",
      },
      {
        q: "What score should I aim for?",
        a: "Whatever suits the document. The useful check is consistency rather than a target: score each section and look for drift, because an unintentionally casual paragraph inside a formal report is the problem this tool catches best.",
      },
    ],
  },

  "style-guide-adherence-checker": {
    keywords: ["style guide", "AP style", "Chicago style"],
    intro:
      "The Style Guide Adherence Checker applies a documented subset of mechanical rules from AP, Chicago, Oxford and Microsoft style, and shows the preference in force for each one.",
    content: `A style guide is mostly editorial judgement, but a handful of its rules are purely mechanical, and those are the ones a script can check. This tool encodes seven of them, lets you choose the guide, and prints the preference each rule is being judged against so nothing has to be guessed.\\n\\nFour rules change with the guide. The serial comma is the clearest: AP style omits the comma before and in a list, while Chicago, Oxford and Microsoft style require it. Quotation marks differ between British and American practice, with Oxford style preferring single marks and the others double. The numbers rule sets where figures begin, spelling out below ten in AP and Microsoft style and below one hundred in Chicago and Oxford style. Em-dash spacing is the fourth, with AP and Oxford setting dashes open with spaces and Chicago and Microsoft setting them closed.\\n\\nThree rules apply to every guide. Modern style uses a single space after a full stop, so a double space is always flagged. Punctuation follows the preceding word with no space before it. And the Latin abbreviations e.g. and i.e. are followed by a comma in running text.\\n\\nEach finding names the rule, shows the text that was matched, offers a suggestion and repeats the preference it was judged against. The preference table at the bottom of the page lists all seven rules and the setting for the guide you chose, which means a disagreement can be traced to a specific decision rather than a vague style score.\\n\\nThe scope is deliberately narrow and the page says so plainly. Headings, title capitalisation, citation formats, hyphenation, abbreviation lists, number ranges, ellipsis style and every judgement call a copy editor makes are out of scope. A clean report means none of these seven rules fired; it is not a statement that the text conforms to the guide. Treat it as the mechanical pass before a human reads for style.\\n\\nThe tool is most valuable for consistency. Long documents written by several people drift: one author adds the serial comma and another drops it, one uses open em dashes and another closed. Running the whole document through the checker with a single guide selected turns that drift into a list of specific fixes, and because each rule is stated, the team can decide once which setting to adopt.\\n\\nEverything runs locally. The text is never uploaded, and the four presets are documented in the engine source, so the rules and their preferences can be read in full rather than inferred from behaviour.\n\nConsistency matters more than which preset you pick. A document that applies AP style throughout reads as edited, while one that mixes AP and Chicago style conventions — a serial comma here, none there — reads as assembled from several drafts. That is why the tool applies one guide at a time and prints its preferences rather than scoring each rule in isolation. Choose the guide the publication expects, run the whole document through it, and treat the resulting list as the mechanical part of copy-editing, with the judgement calls left to a reader.`,
    howTo: [
      { step: "Paste your document and choose the style guide you are working to." },
      { step: "Read the findings table, which names the rule, the matched text and the suggested fix." },
      { step: "Check the preference table at the bottom to confirm each rule points the way you expect." },
      { step: "Fix the findings, switching guides if the document follows a different house style." },
      { step: "Re-run until the report is empty, then hand the text to a human for the judgement calls." },
    ],
    whenToUse: `Use the checker when a document has to conform to a mechanical house style and you want the rules applied consistently. When the question is correctness rather than convention, the {{grammar-checker|Grammar Checker}} covers mechanical errors independent of any guide.\\n\\nIf the concern is how formal the prose reads rather than how it is punctuated, the {{formality-level-detector|Formality Level Detector}} scores that, and the {{redundancy-finder|Redundancy Finder}} handles phrases that repeat themselves.`,
    faqs: [
      {
        q: "Which style guides are supported?",
        a: "Four presets: AP for news writing, Chicago for books and journals, Oxford for British style, and Microsoft for technical documentation. Each sets the serial comma, quotation marks, number threshold and em-dash spacing it uses.",
      },
      {
        q: "Does it check everything in the AP Stylebook?",
        a: "No, and no script can. It checks seven mechanical rules. Headings, title capitalisation, citations, hyphenation and every judgement call are out of scope, and the page states that rather than implying full conformance.",
      },
      {
        q: "What is a serial comma?",
        a: "The comma before the final and or or in a list of three or more items: red, green, and blue rather than red, green and blue. AP style omits it; Chicago, Oxford and Microsoft style require it, and the checker follows the guide you choose.",
      },
      {
        q: "Why does the checker disagree with my editor?",
        a: "Probably because a house style differs from the preset in one of the four guide-specific rules. The preference table shows exactly which setting was applied, so the disagreement can be resolved against the guide rather than guessed at.",
      },
      {
        q: "Can I check a single paragraph?",
        a: "Yes. The checker works on whatever you paste, and the rules are all local to the text. A paragraph is enough to catch serial commas, quote style, em-dash spacing and the rest; longer documents mainly add consistency value.",
      },
    ],
  },

  "academic-writing-tone-checker": {
    keywords: ["academic writing", "academic tone", "register"],
    intro:
      "The Academic Writing Tone Checker turns academic register conventions into a per-rule checklist, counting the markers that pull prose away from an academic tone and never treating hedging as a fault.",
    content: `Academic tone is a set of conventions rather than a single quality, and conventions can be counted. This checker runs nine rules over your text, gives each a pass or warn status, and lists the offending words so the fix is specific rather than a general instruction to sound more scholarly.\\n\\nSix rules carry a curated list and warn when the list is matched. Contractions are flagged, because academic writing normally writes words out in full. Second-person pronouns are flagged, because addressing the reader as you shifts an argument into instruction. Informal vocabulary such as really, stuff, things and gonna is flagged, as are intensifiers like very and extremely, which are usually replaced by a single precise word. Vague quantifiers — a lot, big, things — are flagged in favour of a specific figure. First-person singular is counted separately, because disciplines disagree about it and the rule reports rather than condemns.\\n\\nTwo further rules cover punctuation. Exclamation marks are rare outside quotations in academic writing, and rhetorical questions are usually reserved for a genuine research question. Both are counted and flagged.\\n\\nThe ninth rule is the interesting one. Hedges — perhaps, seems, might, tends to — are counted but never flagged, because careful qualification is a normal and necessary academic move. A claim that the evidence supports should be stated with the strength the evidence has, and hedging is how that is done. Treating every hedge as weakness, which some style advice does, would push writers toward overstatement. The checker counts them so you can see how tentative the prose is, and stops there.\\n\\nRegister varies by field, and the page says so. Passive voice is standard in methods sections and increasingly discouraged in others. First person is accepted in much of the sciences and avoided in parts of the humanities. Contractions appear in some journals and never in others. The rules here encode broad conventions for academic tone; your target publication's own guidance overrides them, and the checklist is a starting point rather than a verdict.\\n\\nThe most useful way to run the checker is across a whole section. A draft often opens in a formal register and drifts as it goes, and the counts make the drift visible: three contractions in the introduction and none in the discussion, or a sudden cluster of intensifiers where the argument gets weaker. Fixing those is a matter of a few words, and the text reads as more considered immediately.\n\nThe counts also reveal how confident the prose is. A section with many hedges and few assertions may be understating what the evidence shows, and one with almost no hedging may be overstating it. Neither extreme breaks a rule, but seeing the balance helps a writer match the strength of the claims to the strength of the data, which is what academic tone is ultimately about: a register that keeps the writing honest about what it knows. That is why the checklist counts hedges without flagging them, and why the rules it does enforce sit beside those counts rather than in place of them. Read the checklist as a prompt for revision, not a grade.`,
    howTo: [
      { step: "Paste a section, an abstract or a full draft; the checklist updates as you type." },
      { step: "Read the count of flagged conventions, then work through the checks with a warning." },
      { step: "Look at the listed examples under each rule to see the exact words that triggered it." },
      { step: "Decide the first-person and passive questions against your target journal's guidance." },
      { step: "Re-run the checklist and confirm that the remaining warnings are deliberate choices." },
    ],
    whenToUse: `Use this checker when a draft needs to read as academic writing for a specific audience. When the question is register in general rather than academic convention, the {{formality-level-detector|Formality Level Detector}} scores that composite with its components exposed.\\n\\nIf the flagged issue is passive constructions, the {{passive-voice-detector|Passive Voice Detector}} lists each one with its sentence, which is more useful than a count when the decision to keep or rewrite has to be made case by case.`,
    faqs: [
      {
        q: "What is academic register?",
        a: "A set of conventions common to scholarly prose: few contractions, limited second person, precise vocabulary instead of intensifiers, and formal connectors. This checker counts the markers of that register and reports them rule by rule.",
      },
      {
        q: "Is first person allowed in academic writing?",
        a: "It depends on the discipline and the journal. Much of the sciences accepts or encourages I and we, while some humanities conventions prefer an impersonal voice. The checker reports first-person singular rather than treating it as an error.",
      },
      {
        q: "Why is hedging not flagged as a problem?",
        a: "Because qualification is a normal academic move. Claims should be stated with the strength the evidence supports, and hedging is how that is done. The tool counts hedges so you can see how tentative the prose is and leaves the judgement to you.",
      },
      {
        q: "Does it check citations or structure?",
        a: "No. It checks register markers only — vocabulary, pronouns, contractions, punctuation and hedging. Citations, referencing style, section structure and argument quality are entirely outside its scope.",
      },
      {
        q: "What if my journal allows contractions?",
        a: "Then follow the journal. The checklist encodes broad academic conventions and the page says the target publication overrides them. Treat a warning as a prompt to check your journal's guidance rather than an automatic correction.",
      },
    ],
  },
};
