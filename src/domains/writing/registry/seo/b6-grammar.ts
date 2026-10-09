import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B6, Grammar & Style group: authored SEO entries for the mechanical
 * checks, phrase detectors and register tools backed by the shared engine in
 * `src/domains/writing/lib/text/`. Keys are registry slugs; see ../tool-seo.ts
 * for the contract these entries are validated against.
 */
export const B6_GRAMMAR_SEO: Record<string, ToolSeo> = {
  "grammar-checker": {
    keywords: [
      "grammar checker",
      "mechanical checks",
      "commonly confused words",
      "unmatched brackets",
    ],
    intro:
      "The Grammar Checker runs six documented mechanical checks over your text and reports exactly which rule fired, where, and what to change.",
    content:
      "This grammar checker is a fixed list of mechanical rules, not a parser. It runs six documented mechanical checks over your text and reports exactly what it looked for — repeated words, a and an agreement, commonly confused words, sentence capitalisation, paragraph punctuation and unmatched brackets — so the result describes the rules rather than an editorial opinion. The list is published on the page, which is what makes a finding explainable instead of mysterious.\n\nEach finding carries the check that produced it, the issue itself, a suggested fix and a snippet of context. A summary panel counts issues by check so you can see which rule fired most often, and the what-is-checked panel lists every rule with its documented failure mode. Because every check is named, a false positive can be traced to the exact condition that caused it and judged in a second.\n\n- Repeated words: any word repeated back to back, including deliberate constructions such as had had.\n- a / an agreement: the article matched to the following sound, with exception lists for a university and an hour.\n- Commonly confused words: context rules for your and you are, its and it is, then and than, to and too, loose and lose, affect and effect, weather and whether.\n- Sentence capitalisation: a lowercase word after a full stop or question mark, with abbreviations such as e.g. excluded.\n- Paragraph punctuation: a paragraph that does not end in terminal punctuation.\n- Unmatched brackets and quotes: brackets, braces and quotation marks that do not pair up.\n\nThe checks are regular-expression rules over a Unicode token stream, each with a curated exception list. The a and an check consults two sound lists plus an acronym rule, so an MRI and a URL both come out right. The capitalisation check skips abbreviations and initials. Numbers, foreign-language text and unusual punctuation are treated literally. No model is involved, and the page says so plainly: the tool reports six checks and no more, which is what makes its output reproducible on the same text.\n\n- It is not a parser, so grammatical errors outside the six rules are not detected.\n- Deliberate repetition such as had had or a stylistic echo is flagged, and you have to judge it.\n- The confused-words rules are high precision but narrow: they cover the published pairs and nothing else.\n- Non-English text and unusual punctuation are treated literally, which can produce misses rather than errors.\n- The exception lists are finite, so a rare proper noun or a new coinage can misfire on the article check.\n\nWork through the findings table top to bottom and accept or dismiss each row: the context snippet exists so the call stays editorial. The suggested fix is a repair for the mechanical slip, not a substitute for rewriting. Copy report and Download produce the same list as plain text, which is useful for a revision note or a tracked change log.\n\nUse it as the mechanical pass before deeper edits: it clears the small slips that undermine a reader's trust — a doubled word, a stray an, it is written as its — without pretending to restructure a sentence. For the vocabulary beside those slips, reach for the tools that cover spelling and punctuation directly; for sentence-level structure, the companion analyzers in this category take over where the six rules stop.",
    howTo: [
      { step: "Paste a paragraph or a whole draft; the six checks run as you type." },
      { step: "Read the Issues by check panel to see which rules fired and how often." },
      { step: "Work through the findings table row by row — check, issue, suggested fix and context — and accept or dismiss each one." },
      { step: "Use Copy report or Download to keep the findings as plain text." },
    ],
    whenToUse:
      "Use the grammar checker as the first mechanical pass over a draft, before style-level edits. When the question is sentence construction rather than a rule, the {{passive-voice-detector|Passive Voice Detector}} finds the be plus participle patterns and the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} estimates how much each sentence carries. Words that are not in any dictionary at all belong to the {{spell-checker|Spell Checker}}, which catches the class of error this tool deliberately leaves alone.",
    faqs: [
      {
        q: "Does the grammar checker use an AI model?",
        a: "No. It applies six published mechanical checks over a Unicode token stream, each with a curated exception list, and reports only what those rules find. That is why its output is identical every time you paste the same text.",
      },
      {
        q: "Why was a deliberate repetition flagged as a repeated word?",
        a: "The repeated-word check flags any word repeated back to back, including constructions like had had that are correct English. The check cannot tell deliberate emphasis from a slip, so it reports the occurrence and leaves the judgement to you.",
      },
      {
        q: "How accurate is the a and an check?",
        a: "It matches the article to the following sound using two curated lists plus an acronym rule, so a university and an hour both come out right. Rare proper nouns or brand-new words can still be misjudged, because the lists are finite.",
      },
      {
        q: "Which confused word pairs does it cover?",
        a: "The published high-precision set: your and you're, its and it's, then and than, to and too, loose and lose, affect and effect, and weather and whether. It is not a blanket spell-check.",
      },
      {
        q: "Why did the capitalisation check skip an abbreviation at the start of a sentence?",
        a: "Sentence capitalisation ignores abbreviations such as e.g. and initials, because those boundaries are not real sentence starts. That exclusion list is finite, so an unusual abbreviation may still be flagged.",
      },
    ],
  },

  "passive-voice-detector": {
    keywords: [
      "passive voice detector",
      "passive construction",
      "past participle",
      "expressed agent",
    ],
    intro:
      "The Passive Voice Detector finds be plus past-participle constructions, marks the ones with an expressed agent as strong, and states where the heuristic is wrong.",
    content:
      "A passive construction is a form of be or get plus a past participle, and that is exactly what this passive voice detector looks for. When a by phrase follows within a few tokens the hit is marked strong, because an expressed agent is the clearest sign of a true passive; otherwise it is a candidate. The confidence column makes the difference visible instead of flattening every hit into one verdict. Adverb gaps are allowed between the verb and the participle, which is why a construction such as was carefully reviewed is found as well as the shortest possible form, and why the candidate list reads like prose rather than a pattern dump.\n\nCandidates are listed as you type, each with the phrase, the participle, its confidence and the sentence it sits in. The summary counts sentences with at least one candidate, the total candidates found, how many carry an expressed agent and how many do not, alongside the sentence and word totals. A final table ranks the sentences carrying the most candidates, which is where a passive-heavy paragraph shows up at a glance.\n\n- Candidate construction: a form of be, optionally separated from the participle by a common adverb.\n- Participle identification: an irregular participle from the shared list or a regular word ending in ed.\n- Confidence: strong when a by phrase follows within a few tokens, candidate otherwise.\n- Summary counts: sentences with candidates, total candidates, hits with and without an agent.\n- Sentence ranking: the sentences carrying the most passive constructions.\n- Copy report and Download export the candidate list as plain text.\n\nThe detector walks a Unicode token stream and checks three conditions: a be form, an optional adverb gap, and a participle from the irregular list or the regular ed pattern. It is a documented heuristic, not a parser. The irregular participle list is finite, and the tool states that an unusual participle may be missed. It also cannot know whether a flagged construction is stylistically fine — passive voice is the right choice when the actor is unknown or irrelevant, and the page says that too.\n\n- Adjectival participles look identical and are flagged as well: the door is closed is arguably a state, not an action.\n- get-passives are not detected separately, because get is usually a main verb.\n- The irregular participle list is finite, so an unusual form may be missed entirely.\n- A sentence with a passive candidate is not necessarily worse; the tool reports candidates, not errors.\n- Foreign-language text and quoted material are processed with the same English rules.\n\nUse the finding list as a review aid rather than a to-do list. Read each candidate in its sentence and ask who the actor is: if the sentence hides someone worth naming, rewrite it; if the actor is genuinely unknown or unimportant, leave it. The by-phrase count is a quick signal, because a passive with an expressed agent usually reads as avoidable.\n\nThe companion tools answer the neighbouring questions: the Grammar Checker covers the mechanical slips, the Sentence Complexity Analyzer estimates how much structure each sentence carries, and the Clarity Score Tool blends sentence length and vocabulary into a single review figure. None of them replaces reading the sentence yourself. A useful reading order is the candidate table first and the ranked sentences second: a paragraph whose top three sentences all carry candidates is the one where the voice is hiding actors, and rewriting for active voice usually names the actor and shortens the sentence at the same time, which is why editors reach for it even when no rule requires it.",
    howTo: [
      { step: "Paste a draft; candidates are listed as you type, with the sentence that contains each one." },
      { step: "Read the Passive voice panel for the candidate count, the with-agent and without-agent split, and the sentence totals." },
      { step: "Scan the candidate table — phrase, participle, confidence and sentence — and judge each hit in context." },
      { step: "Check the sentences carrying the most candidates, then copy or download the report." },
    ],
    whenToUse:
      "Use the passive voice detector when a draft feels evasive or slow and you want the be plus participle patterns in one list. The {{grammar-checker|Grammar Checker}} covers six mechanical rule checks instead of constructions, and the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} estimates how many clauses a sentence carries. When the question is the overall weight of a paragraph rather than one construction, the {{clarity-score-tool|Clarity Score Tool}} blends length, variety and vocabulary into a single figure.",
    faqs: [
      {
        q: "How does the detector decide what counts as passive?",
        a: "It looks for a form of be or get, optionally separated by a common adverb, followed by a past participle. A by phrase within a few tokens marks the hit strong; everything else is a candidate.",
      },
      {
        q: "Why was the door is closed flagged as passive?",
        a: "Adjectival participles look identical to passive constructions, so the heuristic flags them as well. The door is closed is arguably a state rather than an action, and the page says so directly.",
      },
      {
        q: "Does it detect get-passives?",
        a: "No, not separately. Get is usually a main verb, so treating every get plus participle as passive would misfire far more often than it would help; the limitation is stated on the page.",
      },
      {
        q: "Should every flagged sentence be rewritten?",
        a: "No. Passive voice is the right choice when the actor is unknown, obvious or deliberately de-emphasised. Read each candidate in context — the tool reports patterns, not errors.",
      },
      {
        q: "What does the strong confidence label mean?",
        a: "A by phrase follows within a few tokens of the participle, giving an expressed agent. That is the clearest signal of a true passive construction, so those hits are marked strong rather than candidate.",
      },
    ],
  },

  "cliche-detector": {
    keywords: [
      "cliche detector",
      "curated list",
      "tired phrases",
      "phrase matches",
    ],
    intro:
      "The Cliché Detector flags every phrase on a curated list of tired expressions and shows why each one is on it.",
    content:
      "This cliche detector matches your text against a curated list of tired phrases and shows each hit with the reason it is flagged. There is no model and no scoring anywhere in the tool: the curated list is the whole mechanism, it is published in the code, and the page reports the count it found. That makes every match explainable — you can read the list, disagree with an entry, and still know exactly why the flag appeared.\n\nMatching runs whole phrases only, with word boundaries, so a fragment never triggers a hit. Longer phrases win over shorter ones at the same position, overlapping matches are dropped in favour of the earliest, and the displayed phrase keeps its original capitalisation. The panel shows the number of clichés found; the matches table lists each phrase beside the reason it is on the list, and the scope panel states what the list can and cannot do.\n\n- Whole-phrase matching only, with word boundaries, so common words inside longer phrases never fire alone.\n- Longest-match-first ordering, so in order to beats a shorter fragment at the same position.\n- Overlap handling: the earliest match is kept and later overlaps are dropped.\n- Source capitalisation preserved in the report, so the match reads exactly as written.\n- Reason column: every one of the phrase matches carries the note explaining why it is considered tired.\n- Copy report and Download export the matches as plain text.\n\nThe detector normalises the text, then scans it once for the longest entries first, recording non-overlapping matches in document order. Because the list is literally matched and case-insensitive, the tool has no false-negative story beyond the list itself: a cliché that is not on the list will not be found, and the page says that plainly. Overlapping results are resolved deterministically, so re-running the detector on the same text cannot reorder the table, and the phrase shown in each row is the source text itself, which means an unusual capitalisation or a typo in your draft is displayed exactly as written rather than silently normalised. The curated list is finite by design — a detector that claims to find all clichés would need editorial judgement, which this tool leaves to you.\n\n- The list is finite; a tired phrase outside it is not flagged.\n- Clichés are genre-dependent: phrases that are stale in one register are jargon or idiom in another.\n- Literal matching only, so a paraphrase of a cliché passes unflagged.\n- No severity score is attached, because how much a cliché hurts depends on context.\n- Very short texts may contain none of the listed phrases and report zero matches.\n\nThe useful move is to treat the matches table as a reading list for your draft: for each hit, decide whether the phrase is doing work or standing in for thought. Replacing a cliché with the specific claim it hides is usually the fix, and the surrounding tools handle the wording side — the wordy phrase simplifier tightens expressions, the redundancy finder catches repeated meanings, and the jargon remover covers imported technical terms.\n\nNothing is uploaded. Matching runs in the browser against the published list, and the text disappears when you close the tab. Because matches are non-overlapping, a single passage is reported once and the table can be read top to bottom without meeting the same phrase twice.",
    howTo: [
      { step: "Paste a draft; every phrase on the curated list is flagged as you type." },
      { step: "Read the Clichés panel for the number of matches found." },
      { step: "Scan the matches table — phrase and why it is flagged — and decide which hits need rewriting." },
      { step: "Use Copy report or Download to keep the matches as plain text." },
    ],
    whenToUse:
      "Use the cliché detector when a draft reads as familiar and you want the tired phrases named. The {{wordy-phrase-simplifier|Wordy Phrase Simplifier}} replaces wordy expressions with shorter equivalents, the {{redundancy-finder|Redundancy Finder}} catches phrases whose parts repeat a meaning, and the {{jargon-remover|Jargon Remover}} handles imported technical vocabulary. For published copy that has to sound current, the tone and clarity tools describe the register those replacements move toward.",
    faqs: [
      {
        q: "How does the detector find clichés?",
        a: "It matches whole phrases from a curated list, case-insensitively, with word boundaries. Longer phrases win at the same position, overlaps are dropped, and the source capitalisation is preserved in the report.",
      },
      {
        q: "Why was a common phrase on the list not flagged?",
        a: "The list is finite. A phrase it does not contain cannot be found, which is why the scope panel says so: the tool detects the listed set and nothing beyond it.",
      },
      {
        q: "Are clichés always wrong?",
        a: "No. A cliché can be the clearest way to say something in casual or genre writing. The tool flags occurrences, and the judgement about whether a phrase earns its place stays with you.",
      },
      {
        q: "Does it flag phrases inside quotations?",
        a: "Yes. Matching is literal across the whole pasted text, including quoted material. The matches table shows the context so you can see where each hit sits.",
      },
      {
        q: "Can I see the whole list?",
        a: "Yes. The list is published in the engine module behind the tool, and the page states the count it checked against, so the detection set is fully inspectable.",
      },
    ],
  },

  "redundancy-finder": {
    keywords: [
      "redundancy finder",
      "redundant phrases",
      "repeated meaning",
      "phrase list",
    ],
    intro:
      "The Redundancy Finder flags phrases whose parts repeat a meaning and shows exactly which word repeats which.",
    content:
      "This redundancy finder flags redundant phrases — constructions whose second word repeats the meaning of the first — and shows the reason each pair is on the list. Like its sibling detectors, it operates from a curated phrase list matched literally, with no model and no scoring. The value is in the pairing: end result, free gift and past history all carry their repetition in plain sight once the match is marked.\n\nEach match shows the phrase and where the repetition is, so the fix is obvious without consulting a style guide. Matching runs whole phrases with word boundaries, longer phrases win at the same position, overlapping matches are dropped in favour of the earliest, and the source capitalisation is preserved. The summary counts the redundant phrases found, and the why-a-pair-is-on-the-list panel explains the inclusion rule: the second word adds no meaning the first did not already carry.\n\n- Whole-phrase matching with word boundaries, so the parts of a longer phrase never fire alone.\n- Repetition note per match: which word repeats the sense of which.\n- Longest-match-first ordering and overlap dropping, so each passage is reported once.\n- Source capitalisation preserved, so the phrase reads exactly as written.\n- Match list with phrase and reason columns, exportable with Copy report or Download.\n\nThe engine normalises the text and scans it once against the curated list, recording non-overlapping matches in document order. The list is finite and visible in the module, and the page repeats that plainly: an unflagged phrase is not a claim that it is clean, only that it is not on this list. Matching runs longest first, so the longest listed phrase at a position wins and the shorter fragments underneath are never double-reported. Each match records its offset, which is how the table stays in document order while you edit above it. Idiom complicates the picture, because some pairs are so established that they read as single words to most readers, and the tool leaves that judgement to you.\n\n- The list is finite; redundant phrases outside it are not flagged.\n- Some listed pairs are idiomatic and widely accepted in context.\n- Literal matching only, so a reworded redundancy passes unflagged.\n- No severity ranking: whether the redundancy matters depends on the sentence around it.\n- Quoted and cited material is matched like any other text.\n\nRead each match in its sentence before changing anything. Where the phrase is doing the work of a single word — free gift in casual copy — the replacement is usually the shorter half. Where it is deliberate emphasis in persuasive writing, leaving it may be the right call, and the tool is equally content with that decision. For a whole document rather than a paragraph, run the finder once over the full text: a pair repeated in every section is a habit rather than a one-off choice, and the match count gives you a before figure that a second pass can be measured against.\n\nThe phrase-level family splits the work: the Cliché Detector covers tired expressions, the Wordy Phrase Simplifier replaces wordy expressions with their shorter equivalents, and the Jargon Remover handles imported technical terms. Together they cover repeated meaning, lost force and unnecessary length — the three ways a phrase wastes a reader's time.",
    howTo: [
      { step: "Paste a draft; every phrase whose parts repeat a meaning is flagged as you type." },
      { step: "Read the Redundancies panel for the number of matches found." },
      { step: "Work through the matches table — phrase and where the repetition is — and decide on each replacement." },
      { step: "Use Copy report or Download to keep the list as plain text." },
    ],
    whenToUse:
      "Use the redundancy finder when a draft repeats meanings across word pairs and you want them listed with the reason. The {{wordy-phrase-simplifier|Wordy Phrase Simplifier}} goes after expressions that are long rather than repetitive, the {{cliche-detector|Cliché Detector}} covers phrases that have lost their force, and the {{jargon-remover|Jargon Remover}} handles vocabulary imported from specialist fields. When the repetition happens at the level of whole sentences rather than pairs, the summarization tools in this domain cover that instead.",
    faqs: [
      {
        q: "What makes a phrase redundant?",
        a: "The second word repeats a meaning the first already carries — end result, free gift, past history. Every entry on the list carries a note explaining which part repeats which.",
      },
      {
        q: "Why are some well-known phrases on the list?",
        a: "Established pairs are exactly what the list is for. Some are so idiomatic that they read as single words, which is why the tool reports the match and leaves the rewrite decision to you.",
      },
      {
        q: "Does it catch redundancies I make up?",
        a: "No. Matching is literal against a curated list, so a novel redundant construction is not flagged. The page states the list is finite rather than implying full coverage.",
      },
      {
        q: "Should every match be replaced?",
        a: "Not necessarily. In casual or persuasive copy, a redundant pair can serve rhythm or emphasis. Read each match in its sentence and keep the ones that are working.",
      },
      {
        q: "Does the finder upload my text?",
        a: "No. Matching runs in the browser against the published list, there is no account and no server call, and the text disappears when you close the tab.",
      },
    ],
  },

  "wordy-phrase-simplifier": {
    keywords: [
      "wordy phrase simplifier",
      "wordy expressions",
      "shorter equivalent",
      "simplified text",
    ],
    intro:
      "The Wordy Phrase Simplifier replaces documented wordy expressions with their shorter equivalents and lists every change it made with the reason.",
    content:
      "Wordy phrases are not mistakes; they are choices that add length without adding meaning. This wordy phrase simplifier replaces wordy expressions with a shorter equivalent from a curated list and shows every change it made, so the rewrite is a diff you can review rather than a result you have to trust. Nothing is altered outside the listed phrases, and the original stays available beside the simplified text.\n\nThe panel reports how many phrases were replaced, then shows the simplified text in full and a table of every change with three columns: the wordy phrase, the simpler replacement, and why the pair is on the list. Because each replacement carries its reason, you can see that in order to became to because the shorter form means the same thing, not because a rule dislikes the longer one. Copy report and result or Download result take the tightened copy out of the page.\n\n- Curated wordy phrases, each with a suggested shorter equivalent and a reason.\n- Phrases replaced: the count of substitutions applied to this text.\n- Simplified text: the full result with every replacement applied.\n- Every change table: wordy, simpler and why, one row per replacement.\n- Deletions: phrases with an empty replacement are removed and the surrounding spacing is tidied.\n- Copy report and result, or Download result, for the changed text.\n\nThe rewrite is produced by matching whole phrases with word boundaries, longest first, so a longer phrase wins at the same position; matches are then applied left to right over the text. When a replacement is empty the phrase is deleted and the surrounding spacing is tidied so the sentence does not grow a double space. Matching is case-insensitive and the capitalisation of the source is preserved. The same application routine is shared with the jargon remover, so both tools behave identically on deletions and sentence-initial capitalisation. Because every substitution is a lookup rather than a rewrite, the tool never changes a word that was not on the list, and two people running it on the same text get byte-identical results.\n\n- The list is finite; a wordy expression outside it is untouched.\n- A replacement chosen for general use may miss the nuance of a specialist context.\n- The tool swaps phrases only; it never restructures a sentence or splits a long one.\n- Deletion changes tone as well as length, so a removed qualifier can sharpen a claim more than you intended.\n- Matching is literal, so a reworded version of a listed phrase passes unflagged.\n\nThe habit that makes this tool safe is review rather than acceptance: read the every change table before copying the simplified text, and undo any replacement that loses meaning. The reason column is there to be argued with. Phrases that are deliberately formal — in order to in a legal clause, for instance — may be worth keeping, and the table makes it easy to spot which ones you disagree with.\n\nThe phrase family shares the same shape: the redundancy finder catches pairs whose parts repeat a meaning, the cliché detector flags tired expressions, and the jargon remover handles imported technical vocabulary. Together they cover the three ways a phrase wastes a reader's time — length, repetition and lost force — without touching the sentences those phrases sit in. The simplified text itself is plain copy, so whatever is accepted can be pasted into any editor or version-control diff without a round trip back to this page.",
    howTo: [
      { step: "Paste a draft; listed wordy expressions are replaced as you type." },
      { step: "Read the Simplification panel for the number of phrases replaced." },
      { step: "Review the every change table — wordy, simpler and why — and keep or reject each substitution." },
      { step: "Copy report and result, or Download result, to take the tightened text with you." },
    ],
    whenToUse:
      "Use the wordy phrase simplifier when sentences are longer than their meaning requires. The {{redundancy-finder|Redundancy Finder}} goes after pairs whose parts repeat a meaning, the {{cliche-detector|Cliché Detector}} catches phrases that have lost their force, and the {{simplify-text-tool|Simplify Text Tool}} applies published wordy-phrase lists alongside its other rewrites. When the problem is vocabulary rather than length, the {{jargon-remover|Jargon Remover}} replaces imported technical terms instead.",
    faqs: [
      {
        q: "Does the tool rewrite my sentences?",
        a: "No. It swaps listed phrases for shorter equivalents and leaves sentence structure alone. Anything beyond a phrase substitution is left for you to edit, which keeps the diff easy to review.",
      },
      {
        q: "Why was a phrase I wanted to keep replaced?",
        a: "The list applies to every occurrence of a listed phrase. Read the every change table to see each substitution and its reason, then keep the ones that serve your context — the original is still beside the result.",
      },
      {
        q: "What happens when a phrase has no replacement?",
        a: "It is deleted and the surrounding spacing is tidied, so removing a filler phrase does not leave a double space. That routine is shared with the jargon remover so both tools behave identically.",
      },
      {
        q: "Are all wordy expressions covered?",
        a: "No, the list is finite and published. A wordy expression outside it is left untouched, and the page says so rather than implying full coverage.",
      },
      {
        q: "Does the simplified text leave the browser?",
        a: "No. Matching and replacement run in the browser against the published list, and the text disappears when you close the tab.",
      },
    ],
  },

  "tone-analyzer": {
    keywords: [
      "tone analyzer",
      "tone signals",
      "polarity",
      "directness",
    ],
    intro:
      "The Tone Analyzer reports five measured signals — polarity, energy, directness, confidence and register — with the counts behind each.",
    content:
      "Tone is not one quantity, so this tone analyzer reports five measured signals instead of a single adjective. Polarity comes from positive and negative word lists, energy from exclamations, intensifiers and capitalised words, directness from second-person pronouns and questions, confidence from hedges, and register from the formality composite. Each signal carries the counts that produced it, so the reading can be checked rather than accepted.\n\nEvery one of the tone signals updates as you type and is stated as a rate per hundred words, which keeps samples of different lengths comparable. The what-each-signal-measures panel repeats the definition beside every row: polarity shows how many positive and negative lexicon words were found and what the net was, energy shows exclamation and intensifier counts, directness shows second-person and question counts, and confidence shows the hedge count. A summary line compresses the five readings into one sentence. The summary is a convenience rather than a sixth signal, so the five rows remain the reading and each row carries its own counts.\n\n- Polarity: positive minus negative lexicon hits, reported as Neutral, Positive or Negative.\n- Energy: exclamations, intensifiers and capitalised words per hundred words, labelled Low, Moderate or High.\n- Directness: second-person pronouns and questions, labelled Impersonal, Somewhat direct or Direct.\n- Confidence: hedges such as perhaps and might, labelled Assertive, Balanced or Tentative.\n- Register: the formality band from the shared weighted composite.\n- Copy report and Download for the five signals with their counts.\n\nAll five signals read the same counted markers — a finite lexicon of contractions, informal words, pronouns, exclamations, formal connectors, hedges and a small sentiment list — and report rates rather than verdicts. Nothing here is a trained model, and the page says so. Register is borrowed from the formality analysis so the two pages cannot disagree, and any discrepancy elsewhere would trace back to a single count rather than to two models, and each signal's reading note lists its raw counts, which is what makes the output reproducible on the same text.\n\n- The lexicons are finite, so a synonym outside the list is invisible to the signal that needed it.\n- Polarity measures explicit sentiment words only; irony and sarcasm are undetectable by counting.\n- Signals are rates, not judgements: a tentative tone is correct in an academic hedging context.\n- Short samples move sharply, because one exclamation changes the energy rate on a small denominator.\n- Genre expectations differ — a launch page and a legal memo are not aiming at the same readings.\n\nRead the signals as a set rather than one at a time. Direct and Tentative together describe persuasive writing; Neutral polarity with Low energy describes reportage. When a reading surprises you, the counts in the reading note explain why, and the usual fix is either to accept the register or to change the marker that moved it. Comparing two drafts is the natural use: paste the first version, note the five readings, then paste the revision. Signals that did not move tell you the rewrite preserved the voice, and the signal that did move names exactly what changed.\n\nThe neighbours cover single dimensions in more depth: the formality level detector opens the composite behind the register signal, the academic writing tone checker runs a checklist aimed at scholarly prose, and the Clarity Score Tool measures readability rather than tone.",
    howTo: [
      { step: "Paste a draft; the five measured signals update as you type." },
      { step: "Read the Tone signals panel for polarity, energy, directness, confidence and register." },
      { step: "Open what each signal measures to see the counts behind every reading." },
      { step: "Use Copy report or Download to keep the signals and counts as plain text." },
    ],
    whenToUse:
      "Use the tone analyzer when you want five measured readings rather than one impression of a draft's voice. The {{formality-level-detector|Formality Level Detector}} opens the weighted composite behind the register signal, and the {{academic-writing-tone-checker|Academic Writing Tone Checker}} runs a checklist aimed at scholarly prose. When tone is not the question and readability is, the {{clarity-score-tool|Clarity Score Tool}} measures the structural side, and the {{style-guide-adherence-checker|Style Guide Adherence Checker}} checks mechanical conventions instead.",
    faqs: [
      {
        q: "Does the tone analyzer use sentiment analysis or AI?",
        a: "No. It counts occurrences from finite published word lists and reports rates per hundred words. There is no model and no training, which is why the same text always produces the same signals.",
      },
      {
        q: "Why are there five signals instead of one tone score?",
        a: "Tone is not one quantity. Polarity, energy, directness, confidence and register can move independently — direct and tentative is a common persuasive combination — so a single number would hide real information.",
      },
      {
        q: "Can it detect sarcasm?",
        a: "No. Counting word occurrences cannot see irony; a sarcastic sentence reads as whatever its words literally list. The panel states that polarity measures explicit sentiment only.",
      },
      {
        q: "What does a tentative confidence reading mean?",
        a: "The text contains hedges such as perhaps, seems and might at a noticeable rate. Hedges soften claims and are normal in academic writing, so the reading is descriptive rather than a warning.",
      },
      {
        q: "Why did one exclamation mark change the energy label?",
        a: "Energy is a rate per hundred words, so on a short sample a single mark moves it. Paste a longer passage when you want a stable reading.",
      },
    ],
  },

  "formality-level-detector": {
    keywords: [
      "formality level detector",
      "formality score",
      "weighted blend",
      "formal connectors",
    ],
    intro:
      "The Formality Level Detector computes a formality score as a weighted blend of six countable markers and shows every weight and rule.",
    content:
      "Formality here is arithmetic you can audit. This formality level detector computes a formality score as a weighted blend of six countable markers, shows the weight and rule behind each component, and maps the result onto five named register bands. Nothing is hidden: every component displays its count, its score and the formula that turned one into the other.\n\nThe panel reports the formality score out of one hundred and the register band it lands in — very formal, formal, neutral, informal or very informal — with the word count beside it. The score components table lists contractions at weight twenty, informal words at twenty-five, first and second person pronouns at twenty, exclamations and questions at ten, formal connectors at fifteen and sentence length at ten. Each row states the measured count and the rule, such as one hundred minus twenty times contractions per hundred words.\n\n- Contractions (weight 20): one hundred minus twenty times contractions per hundred words.\n- Informal words (weight 25): one hundred minus eight times informal words per hundred words.\n- First and second person (weight 20): six points lost per pronoun per hundred words.\n- Exclamations and questions (weight 10): thirty-five points lost per mark per hundred words.\n- Formal connectors (weight 15): twenty points per connector per hundred words, capped at one hundred.\n- Sentence length (weight 10): full marks at fifteen words or more, five lost per word below.\n\nThe markers come from finite published lists — contractions, informal vocabulary, pronouns, connectors, hedges — counted case-insensitively over the shared tokenizer, with rates normalised per hundred words. The weighted composite is then rounded to one decimal and mapped to a band. Because every weight and curve is visible in the code and repeated on the page, a reader can disagree with the score and see precisely why it landed where it did. The weights total one hundred, so each row's contribution can be read straight off the table without arithmetic.\n\n- The lexicons are finite, so an informal synonym outside the list is not counted.\n- Register is situational: contractions are wrong in a contract and right in a support reply.\n- The weights are a documented choice, not a measurement of any style authority.\n- Short samples move the score sharply, because each rate has a small denominator.\n- Sentence length doubles as a register proxy, so a choppy formal passage may score lower than it reads.\n\nUse the score comparatively rather than absolutely: run it on a passage you know is formal, then on your draft, and compare the gap. The components table shows which marker moved the score, and changing that marker — removing a contraction, adding a connector — moves it back. The bands are labels for a register, not grades of quality; very formal is not better than neutral, it is a different audience. The components table doubles as a reading guide: contractions and informal words carry the two heaviest weights, so those are the markers that move the score furthest when a draft drifts toward conversation. A practical workflow is to paste a passage your audience already accepts, note its band and component profile, then paste your own draft and close the gap on the components that differ — usually contractions and informal words.\n\nThe register neighbours divide the work: the tone analyzer reports five signals including this one as its register row, the academic writing tone checker runs a discipline-specific checklist, and the style guide checker covers mechanical conventions that register analysis never looks at.",
    howTo: [
      { step: "Paste a draft; the score and band update as you type." },
      { step: "Read the Formality panel for the score, the register band and the word count." },
      { step: "Open the score components table to see each marker's count, weight and rule." },
      { step: "Adjust the marker that moved the score most, then copy or download the report." },
    ],
    whenToUse:
      "Use the formality level detector when a draft's register is wrong for its audience and you want the reason counted rather than guessed. The {{tone-analyzer|Tone Analyzer}} reports five signals where register is only one of them, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} runs a checklist aimed at scholarly prose, and the {{formality-adjuster|Formality Adjuster}} rewrites paired expressions to shift the register. Mechanical conventions belong to the {{style-guide-adherence-checker|Style Guide Adherence Checker}} instead.",
    faqs: [
      {
        q: "How is the formality score calculated?",
        a: "Six countable markers are scored individually, multiplied by their weights and averaged: contractions, informal words, first and second person pronouns, exclamations and questions, formal connectors and sentence length. Every weight and rule is shown on the page.",
      },
      {
        q: "What does the score measure, exactly?",
        a: "How closely the text matches the marker profile of formal register — few contractions, few pronouns, few informal words, more connectors and longer sentences. It describes register, not quality.",
      },
      {
        q: "Why do formal connectors increase the score?",
        a: "Words such as therefore, moreover and thus are characteristic of formal prose, so that component rewards their presence rather than penalising anything. The rule is stated as twenty points per connector per hundred words, capped.",
      },
      {
        q: "Can I trust the band on a short paragraph?",
        a: "Not far. Each rate has a small denominator on short samples, so the score moves sharply with one edit. The panel shows the word count so you can judge stability for yourself.",
      },
      {
        q: "Is a more formal score better?",
        a: "No. The bands name registers, and the right one depends on the audience: a support reply should not read like a contract. Compare against a passage you know fits your target instead.",
      },
    ],
  },

  "style-guide-adherence-checker": {
    keywords: [
      "style guide checker",
      "serial comma",
      "mechanical rules",
      "quotation marks",
    ],
    intro:
      "The Style Guide Adherence Checker applies four style-guide presets to a documented subset of mechanical rules and shows the preference in force.",
    content:
      "No tool can enforce a whole style guide, and pretending otherwise is the failure to avoid. This style guide checker encodes a short list of purely mechanical rules — a comma is present or it is not, a quotation mark is single or double — applies the preset you choose, and shows the preference each preset uses so a disagreement can be traced to a rule rather than an opaque style score.\n\nChoose between four presets: AP for news, Chicago for books, Oxford for British style and Microsoft for technical writing. The guide-specific rules are the serial comma, quotation marks, number spell-out thresholds and em-dash spacing. Three universal rules apply to every preset — one space after a full stop, no space before punctuation, and a comma after e.g. or i.e. The findings table lists each rule, what was found, the suggestion and the context, and the rules-checked panel shows every preference in force.\n\n- Presets: AP (news), Chicago (books), Oxford (British) and Microsoft (technical).\n- Serial comma: required by Chicago, Oxford and Microsoft; omitted by AP.\n- Quotation marks: double for AP, Chicago and Microsoft; single for Oxford.\n- Numbers: spell out under ten for AP and Microsoft, under one hundred for Chicago and Oxford.\n- Em-dash spacing: open for AP and Oxford; closed for Chicago and Microsoft.\n- Universal rules: sentence spacing, spacing before punctuation, and comma after e.g. and i.e.\n\nThe checker tokenises the text and applies each rule as a literal test over the tokens: list detection for the serial comma, quote pairing for quotation marks, numeral ranges for the number rule, spacing tests around dash characters. Nothing requires interpretation, which is why every finding can be printed with its context and the preset that produced it. List detection walks the tokens to the conjunction, quote pairing matches opening and closing marks, and numeral ranges are compared against the preset's spell-out threshold, so every row in the table is one literal test with its inputs visible. Headings, title capitalisation, citation formats and anything requiring editorial judgement are explicitly out of scope.\n\n- Only the documented subset is checked; a preset is not a full style guide.\n- Heading and title conventions are out of scope, as are citation formats.\n- Quoted material is checked like any other text, so a quotation's own style produces findings.\n- Numeral judgement is range-based, so idiomatic exceptions such as page numbers are excluded by a published context list.\n- Two presets can disagree about the same text; that is a difference of preference, not an error.\n\nPick the preset your publication or client actually uses before reading any finding, because the preset decides which side of each preference counts as a problem. Then work through the findings table: the context column shows the sentence, the suggestion shows the mechanical fix, and the scope panel reminds you what the tool never looked at.\n\nThe neighbours cover the rest of the mechanical surface: the punctuation checker finds unmatched marks and doubled punctuation, the number format checker finds decimal and grouping inconsistencies across a document, and the manuscript formatter prepares quotes, dashes and scene breaks for submission. Running the checker once per preset is also a quick way to write a style sheet: the differences between the four findings tables are exactly the preferences your publication has to choose between.",
    howTo: [
      { step: "Paste a draft and choose the style guide preset: AP, Chicago, Oxford or Microsoft." },
      { step: "Read the Findings panel for the count of rules flagged." },
      { step: "Work through the findings table — rule, found, suggestion and context — applying each mechanical fix." },
      { step: "Check the rules-checked panel to see the preference in force for every rule, then copy or download the report." },
    ],
    whenToUse:
      "Use the style guide checker when your publication follows a named guide and you want its mechanical preferences applied consistently. The {{punctuation-checker|Punctuation Checker}} finds unmatched and doubled marks directly, the {{number-format-checker|Number Format Checker}} covers decimal and grouping consistency across a document, and the {{manuscript-formatter|Manuscript Formatter}} cleans quotes, dashes and scene breaks for submission. Register rather than mechanics is the question the {{academic-writing-tone-checker|Academic Writing Tone Checker}} answers.",
    faqs: [
      {
        q: "Which style guides does the tool support?",
        a: "Four presets: AP for news, Chicago for books, Oxford for British style and Microsoft for technical writing. Each preset's preferences for the serial comma, quotation marks, numbers and em dashes are shown on the page.",
      },
      {
        q: "Why does it only check a few rules?",
        a: "Only rules that are purely mechanical can be checked honestly: a comma is present or it is not. Headings, title capitalisation, citation formats and editorial judgement are named as out of scope.",
      },
      {
        q: "Why did AP and Chicago disagree about my list?",
        a: "They differ on the serial comma by preference, not by error. The rules-checked panel shows which preference each preset applies, so the disagreement is traceable to a stated rule.",
      },
      {
        q: "Does it check quotation marks in quoted passages?",
        a: "Yes, quoted material is matched like any other text, so a quotation using its own house style will produce findings. Use the context column to decide whether the quote should be left alone.",
      },
      {
        q: "Can I check a document against two guides at once?",
        a: "The checker applies one preset at a time. Run it twice with different presets and compare the findings tables, which is itself the clearest demonstration of where the guides differ.",
      },
    ],
  },

  "academic-writing-tone-checker": {
    keywords: [
      "academic tone checker",
      "register checklist",
      "contractions",
      "first person singular",
    ],
    intro:
      "The Academic Writing Tone Checker runs a register checklist over your text and reports a pass or warn status for each convention.",
    content:
      "Scholarly register is a set of conventions, and this academic tone checker treats it as a checklist rather than a mood. Each convention on the register checklist — contractions, second person, informal vocabulary, intensifiers, vague quantifiers, first person singular, exclamation marks and hedging — is counted with a published word list, then reported as pass or warn with the matches that produced it. The panel shows how many conventions were flagged, the word and sentence totals, and the examples behind every warning.\n\nEach check carries a label, a status, a count and a message explaining the convention. The contractions check warns on forms such as do not written as don't, because academic prose normally writes the words out in full. The second-person check flags you, because scholarly writing usually prefers the impersonal or third person. The first person singular check notes that some disciplines prefer an impersonal voice while others now encourage I, and tells you to check your target journal. The examples column shows the actual matches so you can locate them.\n\n- Contractions: written out in full in academic prose.\n- Second person: addressing the reader as you is usually avoided.\n- Informal vocabulary: everyday and intensifier words read as conversational.\n- Intensifiers and vague quantifiers: prefer one precise word and a specific figure.\n- First person singular: discipline-dependent, so check the target journal's policy.\n- Exclamation marks and hedges, reported as counts with their examples.\n\nThe checker counts occurrences of finite published lists — contractions, informal words, pronouns, intensifiers, quantifiers, hedges — over the shared tokenizer, then marks a check warn whenever its count is above zero. Nothing here is a trained model, and the page repeats that. Because each check is a count with examples, the report is reproducible: the same text yields the same statuses, and every warning can be traced to the words that raised it. Because each status is a count against a published list, two readers of the same report can verify it by searching the text for the listed words.\n\n- Discipline conventions differ, so a warn on first person singular may be wrong for your field.\n- Pass means the listed markers are absent, not that the prose is clear or well argued.\n- The word lists are finite, so an informal synonym outside them passes unnoticed.\n- Hedging and qualification are normal in academic writing, so their counts are reported rather than judged.\n- One pasted paragraph is not a paper: consistency across sections is a question for a longer sample.\n\nUse the checklist as a pre-submission sweep: paste the abstract first, then the sections most likely to carry conversational register, and fix each warn in context. The discipline note matters most on the first person singular row — check your journal's policy before rewriting a field that now encourages I. Copy report keeps the statuses and examples for a revision note. The warnings are also a consistency check across a paper: the same informal phrase recurring in every section is a habit worth removing once, rather than section by section.\nThe register neighbours cover the same ground from other angles: the formality level detector opens the weighted composite behind register, the tone analyzer reports five signals including register, and the style guide checker handles the mechanical conventions that register analysis never looks at.",
    howTo: [
      { step: "Paste an abstract, a paragraph or a section; each convention is checked as you type." },
      { step: "Read the Register checklist panel for the number of conventions flagged." },
      { step: "Open each check to see its status, message and the examples that produced it." },
      { step: "Fix warnings in context — checking your journal's policy on first person first — then copy or download the report." },
    ],
    whenToUse:
      "Use the academic writing tone checker before submitting scholarly prose, when the register conventions are known and countable. The {{academic-journal-reference-formatter|Academic Journal Reference Formatter}} handles the citation side of the same submission, the {{formality-level-detector|Formality Level Detector}} opens the weighted composite behind register, and the {{tone-analyzer|Tone Analyzer}} reports five measured signals where register is only one. Mechanical conventions belong to the {{style-guide-adherence-checker|Style Guide Adherence Checker}}.",
    faqs: [
      {
        q: "Is this an AI check of my academic writing?",
        a: "No. It counts occurrences from finite published word lists and reports pass or warn per convention. Every warning lists the matches that produced it, so the result is reproducible on the same text.",
      },
      {
        q: "Why does it flag first person singular?",
        a: "Some disciplines prefer an impersonal voice while others now encourage I. The check reports the count and tells you to check your target journal rather than insisting on a rewrite.",
      },
      {
        q: "Should I remove every hedging word it counts?",
        a: "No. Hedges and qualifications are normal in academic writing, which is why their counts are reported rather than judged as pass or warn on their own.",
      },
      {
        q: "What does a pass actually mean?",
        a: "That the markers on that particular list are absent from the text. It says nothing about clarity, argument or evidence — the checklist covers register conventions only.",
      },
      {
        q: "Why is my abstract flagged but my methods section clean?",
        a: "Conversational register clusters in particular sections, and each check counts matches over the pasted sample. Paste each section separately to find where the conventions drift.",
      },
    ],
  },
};
