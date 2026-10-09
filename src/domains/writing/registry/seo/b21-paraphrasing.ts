import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B21, paraphrasing and rewriting part two: authored SEO entries for the
 * headline rewriter, the paragraph compressor, the email to formal letter
 * converter, the bullet to prose converter and the abstract generator.
 *
 * Two entries here — the letter converter and the abstract generator — assemble
 * a document rather than rephrase one, so the prose draws the same line every
 * batch does: the tool composes the writer's own words into a published shape
 * and checks the gaps, and it invents nothing. Keys are registry slugs; see
 * ../tool-seo.ts for the contract.
 */
export const B21_PARAPHRASING_SEO: Record<string, ToolSeo> = {
  "headline-rewriter": {
    keywords: [
      "headline rewriter",
      "headline angles",
      "clickbait check",
      "shouted words",
    ],
    intro:
      "The Headline Rewriter composes five published headline angles from your subject and action, and runs a clickbait check on a headline you already have, alongside length, shouted words and repetition.",
    content:
      "A headline rewriter that invents a claim is worse than no tool at all, so this one composes from the writer's own words using five fixed angles, and never adds a fact the article does not have. The second half of the tool is a check list for a headline you already wrote, which is often the more useful half.\n\n- Five published angles, offered in order: How to, Numbered list, Guide, Mistakes and Question.\n- Two fields keep the grammar sound: Action is a verb phrase for the how-to and list angles, Subject is a noun phrase for the guide, mistakes and question angles.\n- Audience is woven into the patterns where the angle calls for it, and Number sets how many variations to compose.\n- A clickbait check on your own headline, alongside length in characters and words, a trailing period, shouted words and a repeated word.\n- Each flag explains the cost rather than merely naming the habit.\n- Scope and limits printed on the page.\n\nThe angle patterns are fixed, which is what makes the output honest: the tool arranges your subject, action and audience into five shapes rather than generating a claim. The checks use published constants — 60 characters and 12 words as the length thresholds, a clickbait phrase list, and a test for words written in capitals — and each flag carries its reason, because a headline that is 64 characters long fails for a specific reason that the writer can weigh. The distinction between subject and action is the one grammar constraint the user has to respect, and it exists so the how-to pattern receives a verb phrase while the guide pattern receives a noun phrase; the page states that rather than letting the patterns produce a sentence that does not parse.\n\n- The five angles are patterns, not ideas: the tool will not find an angle your subject does not support.\n- Compose quality depends on the subject and action being the right kind of phrase, and the fields say which is which.\n- The checks flag habits, not effectiveness; a headline that passes every check can still be dull.\n- Clickbait detection is a published phrase list, so a headline that ends in a question mark and a colon has nowhere to put the article's own claim.\n- A novel bait phrase passes the check, and a legitimate question headline is not a bait headline: the list targets promises rather than shapes.\n- Length thresholds are conventions, and a venue's own limit overrides them.\n\nUse the composer when you know what the piece is about and want the shapes it could take, and use the checks on anything you are about to publish. The five angles are also a diagnostic: if none of them fits the piece, the article may not have a clear subject or action yet, which is worth knowing before the headline is chosen. Read each flag's reason before changing the headline, because the fix for a shouted word is not the fix for a clickbait phrase. The check list also works on a headline the composer produced: compose five angles, paste the one you like into the check field, and see which flags it carries. Two fields also keep the field labelled Subject and the check for a repeated word catch the case where the same noun would appear twice. A headline that scores well on length can still fail the repetition check, and both flags are worth reading before the piece is published. The composer's five headline angles are also the fastest way to see whether the piece has an action worth naming at all; if you cannot state one, the article may not have one.",
    howTo: [
      { step: "Enter the Subject as a noun phrase and the Action as a verb phrase." },
      { step: "Add the Audience and set how many variations you want." },
      { step: "Read the five angles and pick the one that fits the piece." },
      { step: "Paste a headline you already have into the check field and work through each flag's reason." },
    ],
    whenToUse:
      "Use the rewriter when a piece needs a headline and you want the shapes it can take. When the headline exists and needs scoring rather than composing, the {{headline-analyzer|Headline Analyzer}} measures length, detail, power words and faults on the same text.\n\nWhen the copy beneath the headline needs building rather than naming, the {{landing-page-copy-builder|Landing Page Copy Builder}} scaffolds the page, and for email subjects the {{email-subject-line-tester|Email Subject Line Tester}} applies the checks that matter in an inbox.",
    faqs: [
      {
        q: "Why do I need both a subject and an action?",
        a: "Because the five angles have different grammatical shapes. The how-to and list patterns need a verb phrase, while the guide, mistakes and question patterns need a noun phrase. Supplying both keeps every pattern grammatical.",
      },
      {
        q: "Does the tool invent claims about my article?",
        a: "No. The angles are fixed patterns that arrange your own subject, action and audience. Nothing is added that the piece does not contain, which is why the composer cannot produce a headline your article fails to support.",
      },
      {
        q: "What does the check list flag?",
        a: "Length in characters and words against published thresholds, a trailing period, a clickbait phrase, words written in capitals and a repeated word. Each flag explains the cost rather than just naming the habit.",
      },
      {
        q: "How are clickbait phrases detected?",
        a: "From a published phrase list. A novel bait phrase that is not on the list will pass, which is a limit of any fixed list and is stated on the page rather than glossed over.",
      },
      {
        q: "Are the length limits absolute?",
        a: "No. They are conventions — 60 characters and 12 words — and a venue's own limit overrides them. The checks exist so a headline that ignores them does so deliberately.",
      },
    ],
  },

  "paragraph-compressor": {
    keywords: [
      "paragraph compressor",
      "hedge phrases",
      "redundant pairs",
      "Jaccard overlap",
    ],
    intro:
      "The Paragraph Compressor applies four documented cuts — hedges, wordy phrases, redundant pairs and a repeated sentence — and reports the before and after counts with every change listed.",
    content:
      "Padded paragraphs are usually padded in the same four ways, and this paragraph compressor makes exactly those four cuts in a published order: hedge phrases removed, wordy phrases replaced with their plainer equivalent, redundant pairs trimmed, and a sentence that repeats an earlier one dropped.\n\n- Hedge phrases removed: openers such as it is worth noting that and as a matter of fact, which postpone the point without adding information.\n- Wordy phrases replaced from the shared table, so the substitution is the same one the Simplify Text Tool makes.\n- Redundant pairs trimmed: advance planning becomes planning, and the second half of a pair that says the same thing twice is dropped.\n- A repeated sentence is dropped only when a later sentence measures as a duplicate of an earlier one.\n- Figures: words before, words after, cuts made and words removed.\n- Every cut is listed with the text it removed and the reason, so nothing is deleted invisibly.\n\nThe fourth rule is the only one that removes a whole sentence, and it is the one the page explains most carefully. Repetition is measured by the Jaccard overlap of the two sentences' content words rather than by a guess, so the report can name both the sentence that was dropped and the one it duplicated. Nothing else is deleted, and the compressor never rewrites a sentence's structure: the first three rules remove or substitute phrases inside sentences, and the fourth removes a sentence whole. That division matters because it keeps the output checkable — every change in the list maps to one of the four documented rules, and a cut that does not appear in the list did not happen.\n\n- The hedge and wordiness lists are finite; a phrase outside them is untouched.\n- Because every cut maps to a rule, a change that is not in the list did not happen, and the report can be read as a complete account of the compression.\n- The duplicate rule fires on content-word overlap rather than on identical strings, so two sentences can be judged duplicates even when their wording differs.\n- A sentence that partly repeats an earlier one survives, because the fourth rule only fires on a measured duplicate.\n- Compression changes emphasis as well as length: a trimmed hedge was doing rhetorical work.\n- The tool does not judge whether the shorter paragraph is better, only what the four rules removed.\n- Metrics come from the shared word counter, so counts match the rest of the domain. The before and after figures are the summary a reviewer reads first: a paragraph that loses a handful of words was not padded, and one that loses a third of its length almost certainly was.\n- A paragraph with nothing to cut returns an unchanged result and a zero cut count, which is a useful confirmation when reviewing rather than writing.\n- The four rules run in a fixed order, so the same paragraph always produces the same cuts.\n\nUse it when a paragraph has grown through revision and needs to lose its padding. Read the change list before the result, because a dropped sentence is the one cut that removes content rather than words, and the paired sentences are listed so the decision can be reversed.",
    howTo: [
      { step: "Paste the padded paragraph; the four documented cuts are applied as you type." },
      { step: "Read the before and after word counts and the number of cuts made." },
      { step: "Open What was cut and check every removal against its reason." },
      { step: "Pay particular attention to any dropped sentence, which is listed with the sentence it duplicated." },
    ],
    whenToUse:
      "Use the compressor when the paragraph is padded rather than badly written. When the problem is individual long sentences, the {{simplify-text-tool|Simplify Text Tool}} splits at documented seams, and when the paragraph needs its clauses rearranged, the {{sentence-rewriter|Sentence Rewriter}} moves them.\n\nWhen the padding is jargon rather than hedging, the {{jargon-remover|Jargon Remover}} substitutes from the curated term list.",
    faqs: [
      {
        q: "What are the four cuts?",
        a: "Hedge phrases removed, wordy phrases replaced with a plainer equivalent, redundant pairs trimmed, and a sentence that repeats an earlier one dropped. Every change in the list maps to one of the four.",
      },
      {
        q: "How does it decide two sentences are duplicates?",
        a: "By the Jaccard overlap of their content words, not by a guess. The dropped sentence is reported together with the sentence it duplicated, so the decision can be checked and reversed.",
      },
      {
        q: "Does it ever rewrite a sentence's structure?",
        a: "No. The first three rules remove or substitute phrases inside sentences, and the fourth removes a sentence whole. Structure is never rebuilt, which is what keeps the output comparable to the input.",
      },
      {
        q: "Which redundant pairs does it trim?",
        a: "Published pairs where both halves say the same thing, such as advance planning. The list is finite, and a redundant pair outside it survives the compression.",
      },
      {
        q: "Can compression change my emphasis?",
        a: "Yes. A hedge that reads as padding also softens a claim, so removing it can make the paragraph blunter. That is why every cut is listed: the list is the record of what the rules removed, not a verdict on the result. The before and after counts are the summary: a paragraph that loses two words was not padded, and one that loses forty usually was. Because the rules run in a published order, the same paragraph always produces the same cuts, and a second pass on the output finds nothing left to do unless the first pass reported a cut it could not make. If a hedge or a redundant pair survives, it is because the phrase was not on the list; the tool never reports a change it did not make, and every entry in the cut list names the rule that produced it. That mapping is what makes the compressed paragraph checkable against the original: the difference between the two is exactly the union of the cuts in the list, so any change that does not appear in the list did not happen, and any change that does appear can be traced to a documented rule. Read the list beside the four rule names and every change is either accepted or reversed by hand. The compressor is a rule engine with four published cuts, not an editor with an opinion, which is the whole reason its output can be checked in a minute.",
      },
    ],
  },

  "email-to-formal-letter-converter": {
    keywords: [
      "email to formal letter converter",
      "greeting",
      "sign-off",
      "contractions",
    ],
    intro:
      "The Email to Formal Letter Converter reformats a casual message as a letter — greeting, sign-off and signature — expands contractions and replaces casual phrases, listing every substitution.",
    content:
      "An email and a letter carry the same facts in different clothes, and this email to formal letter converter changes only the clothes: the greeting is rewritten, the sign-off block is replaced with a formal valediction and a signature, contractions are expanded from a published table, and casual phrases are substituted. Every move is mechanical and every move is listed.\n\n- The greeting is rewritten, so Hi Sam, becomes Dear Sam,; if there is no greeting, one is added and flagged.\n- The sign-off block is found anywhere in the last few lines and replaced with a formal valediction plus a signature taken from the email or the sender field.\n- Contractions are expanded from a published table of 27 pairs.\n- Casual phrases are replaced from a table of 17 entries — asap becomes as soon as possible, for example.\n- First-person openers include their pronoun in the replacement, so I just wanted to cannot turn into I I am writing to.\n- Emoji and runs of exclamation marks are removed, and counted.\n- Every substitution is listed, and the notes section reports what the letter checks could not resolve.\n\nThe body is never restructured, and the page says so: a letter that needs a different argument needs a writer. The substitution tables are paired and published, which makes the conversion auditable — each change in the list names the expression it replaced. The pronoun guard on first-person openers is a small detail with a visible effect: because the replacement carries its own pronoun, a phrase such as I just wanted to ask becomes I am writing to ask rather than a doubled subject. Emoji removal is counted rather than silent, so a writer can see how much of the message was carrying tone rather than content.\n\n- The body is reformatted, not rewritten: arguments, order and claims stay exactly as they were.\n- Contraction expansion is listed per occurrence, so a contraction left untouched is one that was not in the published table.\n- The sign-off block is found anywhere in the last few lines, so a stray Thanks line in the middle of the body is not mistaken for the end of the message.\n- Tables are finite and published; a casual phrase outside them survives into the letter.\n- A missing greeting or sign-off is added and flagged rather than left out silently.\n- Removing emoji and exclamation runs strips tone markers that may have been doing real work.\n- The signature comes from the email or the sender field, and a placeholder remains if neither supplies one.\n- The letter keeps the email's paragraph breaks, so the shape of the argument survives the reformatting.\n\nUse it when a message written for a colleague has to go to a client, a committee or a records file. Read the substitution list first, then the notes, and fix by hand anything the tables could not reach — the letter is a draft with the mechanical work done, not a finished document. If the substitution list is long, that is a signal about the original rather than a failure of the conversion: a message full of contractions and casual phrases may need more than a new greeting before it goes to a committee.",
    howTo: [
      { step: "Paste the casual email; the letter is assembled as you type." },
      { step: "Add your name for the signature if the email does not contain one." },
      { step: "Read Every substitution, which lists each greeting, sign-off, contraction and casual phrase that changed." },
      { step: "Check the notes for anything the tables could not resolve, then copy the letter." },
    ],
    whenToUse:
      "Use the converter when the message's content is right and its register is wrong. When the register needs shifting in general rather than letter formatting specifically, the {{formality-adjuster|Formality Adjuster}} maps paired expressions in either direction.\n\nWhen the words themselves are jargon rather than casual, the {{jargon-remover|Jargon Remover}} substitutes from the curated list, and when the letter is a proposal rather than a reply, the {{proposal-template|Proposal Template}} scaffolds the sections a reader expects.",
    faqs: [
      {
        q: "Does it rewrite the body of my message?",
        a: "No. The body is reformatted, not rewritten: the greeting, sign-off and signature change, contractions are expanded and listed casual phrases are replaced. The argument, its order and its claims stay exactly as written.",
      },
      {
        q: "Why does I just wanted to become I am writing to rather than I I am writing to?",
        a: "Because the first-person openers in the table include their pronoun in the replacement. That guard exists so a casual opener with a subject cannot produce a doubled subject in the formal version.",
      },
      {
        q: "What happens if my email has no greeting or sign-off?",
        a: "One is added and flagged in the notes. The letter needs both, and the flag means you can see that the tool supplied something you did not write rather than discovering it later.",
      },
      {
        q: "How many substitutions are in the tables?",
        a: "27 contraction pairs and 17 casual phrases, plus the greeting, sign-off and punctuation rules. Every one is listed in the change panel with the expression it replaced.",
      },
      {
        q: "Are emoji really removed?",
        a: "Yes, along with runs of exclamation marks, and the count is reported. Removing them strips tone markers, which is the point of a formal letter and also the reason the count is shown.",
      },
    ],
  },

  "bullet-to-prose-converter": {
    keywords: [
      "bullet to prose converter",
      "connector sequence",
      "single sentence",
      "bullets that will not travel",
    ],
    intro:
      "The Bullet to Prose Converter joins a bullet list into a paragraph or a single sentence, and flags the bullets that prose will not carry — too long, really a heading, or duplicated.",
    content:
      "A list is not a paragraph with dashes removed, and this bullet to prose converter treats the difference as the whole problem. It offers two published shapes, joins the bullets with a fixed connector sequence when you ask for one, and flags the bullets that will not travel in prose rather than quietly mangling them.\n\n- One sentence per bullet: every bullet becomes its own sentence in the paragraph.\n- A single sentence: short bullets are joined with commas and and, which reads as a list inside a sentence.\n- An optional connector sequence — First, Next, Then, After that, Finally — opens the sentences, with the last connector used for every bullet after it.\n- Flags for what will not travel: a bullet past 25 words, a bullet that is really a heading, and duplicates.\n- Figures: bullets in the list, sentences produced and the shape used.\n- Scope and limits printed on the page.\n\nThe engine never invents a transition with meaning. The connectors are a fixed sequence rather than generated prose, which is why the output's joins are predictable and why the connector option can be switched off entirely. The single-sentence shape is only offered for bullets short enough to survive it, because a forty-word item inside a comma list is unreadable. The flags exist because a bullet list often contains material that is not a sentence at all: a heading, a fragment or a duplicate of the item above it. Naming those bullets is more useful than converting them, and the tool does not silently drop them either.\n\n- The connector sequence is fixed and unvaried, so long lists repeat Finally after the fifth item.\n- The flags are computed from the bullets, so fixing one in the source list removes it from the report on the next keystroke.\n- A duplicate bullet is flagged but never deleted from the list: the report names it and the converter still carries it into the paragraph.\n- The single-sentence shape is unsuitable for long bullets, which is why the tool flags them rather than joining them.\n- A heading-style bullet is reported, not converted, because prose cannot carry a label as a sentence.\n- Joining changes emphasis: a list gives every item equal weight, and a paragraph does not.\n- Nothing is reordered; the output follows the order of the list.\n- The shape choice is a suggestion with a rationale rather than a constraint, and switching shapes re-renders the same bullets without touching the source list.\n- The converter reads the list itself, so a bullet already written as a sentence needs no special treatment.\n- Because the connector sequence is fixed, the output's joins are predictable rather than a matter of taste.\n\nUse it when a document needs prose and the material arrived as a list. Try both shapes on the same list — the single sentence suits short parallel items and the paragraph suits anything with a clause in it — and fix the flagged bullets at source, because the tool is right that they will not travel. A list that converts cleanly usually had sentences in it already; a list that flags heavily is telling you the material was notes rather than prose, which is worth knowing before the paragraph is published.",
    howTo: [
      { step: "Paste the list, one item per line." },
      { step: "Choose the shape: One sentence per bullet or A single sentence." },
      { step: "Switch the connector sequence on if the sentences should be opened with First, Next and so on." },
      { step: "Read What will not travel, then copy the prose and fix the flagged bullets at source." },
    ],
    whenToUse:
      "Use the converter when a list has to become prose. When the job runs the other way and prose has to become a list, the {{bullet-point-extractor|Bullet Point Extractor}} turns one sentence into one bullet with an optional connector removal.\n\nWhen the prose that follows needs tightening, the {{paragraph-compressor|Paragraph Compressor}} applies four documented cuts, and when the sentences need their clauses rearranged, the {{sentence-rewriter|Sentence Rewriter}} moves them.",
    faqs: [
      {
        q: "What is the difference between the two shapes?",
        a: "One sentence per bullet keeps every item as its own sentence in a paragraph. A single sentence joins short bullets with commas and and, which reads as a list inside one sentence and is only suitable for short parallel items.",
      },
      {
        q: "Where do the connectors come from?",
        a: "A fixed published sequence: First, Next, Then, After that, Finally. The last connector is used for every bullet after the fifth, so a long list repeats it rather than inventing new transitions.",
      },
      {
        q: "What does the flag list mean?",
        a: "It names the bullets prose will not carry: one past 25 words, one that is really a heading, and duplicates. Those bullets are reported rather than converted or dropped, because the fix belongs in the source list.",
      },
      {
        q: "Is a heading-style bullet converted?",
        a: "It is flagged, not converted. A label such as Benefits: cannot become a sentence without inventing one, so the tool reports it and leaves the decision to you.",
      },
      {
        q: "Can I turn the connectors off?",
        a: "Yes. The connector sequence is optional; with it off, the bullets become plain sentences and the paragraph reads without the First, Next pattern.",
      },
    ],
  },

  "abstract-generator": {
    keywords: [
      "abstract generator",
      "five parts",
      "word band",
      "structured abstract",
    ],
    intro:
      "The Abstract Generator assembles five labelled parts — Background, Objective, Methods, Results and Conclusions — into a structured abstract or a single paragraph, and checks it against a published word band.",
    content:
      "An abstract is read before a paper is chosen, and this abstract generator treats it as five parts in the order readers expect: Background, Objective, Methods, Results and Conclusions. You supply every sentence; the tool supplies the order, the labels and the checks. Each part carries a hint and a live word count, and empty parts are left out of the output rather than rendered as blanks. The page shows a filled-parts count and the shape — structured or unstructured — as you work, so the distance to a complete abstract is visible.\n\n- Word band: 150-250 words for a journal abstract (the default), 100-150 for a short note, or 250-350 for a review article.\n- Label each part: on gives a structured abstract with each part labelled; off joins the parts into one unstructured paragraph.\n- Checks: a missing part, Methods under 15 words, Results with no figures, Conclusions longer than Results, and a total outside the chosen band.\n- Export: a Copy control on the assembled abstract and Download abstract.txt.\n- Empty parts are omitted from the output, so three filled parts produce a three-part abstract with no placeholders.\n\nThe parts are assembled in a fixed order and whitespace-collapsed, then checked with rules a pattern engine can genuinely test. The figures check is a digit test on the Results part, which is deliberately blunt: it can prove a number is present but not that the number is the right one. The length checks compare the parts with each other and the total with the band you selected, and the Methods threshold exists because a methods sentence shorter than 15 words rarely lets a reader picture the study. Nothing is generated, so an empty part is reported as empty rather than filled in. The structured output prefixes each non-empty part with its label and a colon, one part per line, and the word band is checked against the sum of all five parts. The length checks are the only ones a journal's own guidance can override, which is why the band is a choice rather than a constant.\n\n- It cannot write the parts; every sentence in the output is yours.\n- The figure check is a digit test, so a number can satisfy it without being a finding.\n- The thresholds are published heuristics, not a journal's submission requirements.\n- An unstructured abstract loses the labels, and some venues require one shape or the other.\n- Word counts come from the shared tokeniser and can differ from a journal's counter by a word or two.\n- The checks compare parts and totals; they cannot tell a supported claim from an overreach.\n\nFill the parts in order, clear the checks, and read the result aloud once: an abstract is the one paragraph in a paper that is read by people who have not yet decided to read the paper. Two passes are usually enough: one to fill the parts, one to cut back to the band after the checks stop complaining. A labelled abstract with every part filled and every check clear is ready to paste; anything still flagged deserves a minute of your own judgement.",
    howTo: [
      { step: "Fill the five parts; each has a hint and a live word count." },
      { step: "Choose a word band and whether to label each part." },
      { step: "Work through the checks until none are reported." },
      { step: "Copy the assembled abstract or Download abstract.txt." },
    ],
    whenToUse:
      "Use the generator when you have already written the study and need the abstract assembled and audited. The {{scientific-abstract-builder|Scientific Abstract Builder}} works from five abstract roles instead, which suits drafting before the results exist.\n\nFor the summary of a whole document rather than a paper, the {{executive-summary-builder|Executive Summary Builder}} extracts a bottom line and findings, and when the register itself is the question, the {{academic-writing-tone-checker|Academic Writing Tone Checker}} reads the text for formality and hedging.",
    faqs: [
      {
        q: "What counts as a figure in the Results part?",
        a: "Any digit. The check is a simple digit test, so it proves a number is present but not that the number matters. A p-value or a sample size satisfies it; the check is a prompt to look, not a verdict.",
      },
      {
        q: "Why is the Methods part checked for length?",
        a: "Under 15 words it is flagged, because a methods sentence that short rarely names the design, the sample and the analysis, which are the three things a reader needs to picture the study.",
      },
      {
        q: "What is the difference between structured and unstructured output?",
        a: "Structured prefixes each part with its label, so the abstract reads as Background, Objective, Methods, Results and Conclusions. Unstructured joins the same sentences into one paragraph, which some journals require.",
      },
      {
        q: "Why is Conclusions longer than Results flagged?",
        a: "Because at that point the interpretation outweighs the findings. An abstract is supposed to let the reader weigh what was found before hearing what it means, so the flagged ratio is worth a second look.",
      },
      {
        q: "Does the generator rewrite my sentences?",
        a: "No. It orders and labels your sentences and runs checks over them. Every clause in the output came from one of the five fields exactly as you typed it, with surrounding whitespace collapsed.",
      },
    ],
  },
};
