import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B7, Spelling & Proofreading group: authored SEO entries for the
 * dictionary-backed spell checker and the mechanical proofreading checks
 * (homophones, punctuation, apostrophes, capitalisation, proper nouns, US/UK
 * consistency). Keys are registry slugs; see ../tool-seo.ts for the contract
 * these entries are validated against.
 */
export const B7_PROOFREADING_SEO: Record<string, ToolSeo> = {
  "spell-checker": {
    keywords: ["spell checker", "spell check", "misspellings"],
    intro:
      "This spell checker names the dictionary behind it — the en_US Hunspell word list from the dictionary-en package, read by nspell and loaded in your browser on this page alone — so its misspellings and its suggestions can be checked rather than trusted.",
    content: `A spell checker is only as good as the word list behind it, so this one names its own. The words come from the dictionary-en package, a Hunspell en_US dictionary derived from SCOWL, and the lookups are answered by nspell, which walks character edits to propose corrections. Both are open-source (MIT, and MIT AND BSD, about 41 KB and 562 KB unpacked), and both are imported lazily, so the dictionary text is fetched only by a visitor who opens this page. No word list was typed from memory into this tool.\\n\\nType or paste a draft and the scanner splits it into word-shaped tokens, decides which ones are worth looking up, and asks the dictionary about the rest. Six kinds of code-like span are skipped before any lookup: web addresses, email addresses, Markdown links, file names with a known extension, snake_case and SCREAMING_SNAKE identifiers, and anything inside backticks. Tokens shorter than two letters are ignored, and three checkboxes control the rest — ALL-CAPS acronyms, words containing digits, and camel-case brand shapes are skipped by default. The code-like spans are always skipped, because a URL is not a spelling and https is not a misspelling.\\n\\nSuggestions are generated, never hand-written. For each unknown word nspell walks single-character edits — deletions, transpositions, replacements and insertions — and keeps only the candidates that exist in the dictionary, which is why receive appears for recieve and separate for seperate. Up to six are shown, and suggestions are computed for the first 40 distinct unknown words, so a draft full of odd tokens cannot turn a millisecond into a stall. The remaining words are listed with a note that no suggestions were computed rather than being left to look mysterious.\\n\\nThe dictionary is the American English one, and the page says so because the results show it. colour, organise and centre are reported as unknown and offered color, organize and center. That is the dictionary talking, not a judgement about correctness: both spellings are English, and the tool would be lying if it pretended every reader shares one convention. If your document is British, add the handful of forms you rely on to the Words to accept field, or review the whole draft with the Consistent Spelling Checker, which treats US and UK forms as a style choice instead of an error.\\n\\nNames, jargon, brand names and code-like words are flagged as unknown, because a general dictionary has no way to hold them. Racira, Kubernetes, Nikhil and localhost are all misspellings to this tool. That is not a quirk to hide: it is the honest consequence of using a real dictionary, and the Words to accept box exists for exactly the proper nouns your work depends on. The summary separates words that were looked up from tokens that were skipped, so you can always see the size of the part the dictionary actually judged.\\n\\nWhat it cannot do is just as clear. It checks spelling and nothing else — no grammar, no punctuation, no sense of meaning — so form and from are both correct words to it, and a sentence can be spelled perfectly while saying the wrong thing. When a report is long, work through the most frequent words first, since a wrong spelling repeated is usually one habit rather than many mistakes. Nothing is uploaded: the dictionary and your text stay in the browser, and closing the tab removes both.`,
    howTo: [
      { step: "Paste your draft; the dictionary loads once for the page and lookups begin immediately after it is ready." },
      { step: "Read the unknown words table from the top — the most frequent spelling is usually the one worth fixing first." },
      { step: "Add the names, products and jargon you use to the Words to accept field so the real errors stand out." },
      { step: "Apply the suggestions you agree with, remembering they come from edit distance against a dictionary, not from meaning." },
      { step: "Download the report and keep it beside the draft while you make the changes." },
    ],
    whenToUse: `Use this spell check as the first mechanical pass over a draft, then hand the results to tools that answer different questions. When the question is which variant to use rather than whether a word exists, the {{consistent-spelling-checker|Consistent Spelling Checker}} compares US and UK forms across the whole document, and the {{homophone-confusion-detector|Homophone Confusion Detector}} covers the pairs a dictionary cannot judge at all, like their and there.\\n\\nIf a clean spell check leaves you wondering whether the prose itself works, the {{grammar-checker|Grammar Checker}} runs its published list of mechanical sentence checks next.`,
    faqs: [
      {
        q: "Which dictionary does this spell checker use?",
        a: "The en_US Hunspell dictionary shipped in the dictionary-en package, version 4.0.0, derived from SCOWL and licensed MIT AND BSD. It is read by nspell, an MIT-licensed library that also produces the suggestions.",
      },
      {
        q: "Why is my own name flagged as a misspelling?",
        a: "Because it is not in the dictionary, and no general dictionary contains every person, product and place. Add your names to the Words to accept field and they are skipped for the rest of the session, or leave them and ignore the findings.",
      },
      {
        q: "Why is colour reported when it is correct British English?",
        a: "The dictionary is the American English one, so a British spelling is simply absent from it. The tool says so on the page rather than hiding it; use the accept field for the British forms you intend, or run the US and UK consistency check.",
      },
      {
        q: "Where do the suggestions come from?",
        a: "From character edits, not a correction table. nspell generates candidates by deleting, swapping, replacing and inserting letters, then keeps only those that exist in the dictionary, so a suggestion is always a real word with a real edit from what you typed.",
      },
      {
        q: "Does the spell check upload my document?",
        a: "No. The dictionary files and your text are processed in the browser with client-side JavaScript. There is no server round-trip, nothing is stored, and closing the tab clears everything.",
      },
    ],
  },

  "homophone-confusion-detector": {
    keywords: ["homophone confusion detector", "homophones", "word confusion"],
    intro:
      "The Homophone Confusion Detector checks 44 documented pairs — your and you're, its and it's, their and there, then and than — but only where the surrounding words make one spelling implausible, which is why it can name a reason instead of just a count.",
    content: `Homophones sound alike and are spelled differently, which is exactly the kind of mistake a spelling checker cannot see: your and you're are both real words, so both pass. This homophone confusion detector looks at the words around each candidate instead of the candidate alone, and it publishes the pairs it knows so the claim is checkable rather than mystical. It is a narrow answer to a narrow problem: word confusion between two real words, which no dictionary can resolve. There are 44 pairs and 44 rules, one per pair.\\n\\nEvery rule is a construction. your going is flagged because a possessive is followed by a gerund; your book is not, because that is correct. more then enough is flagged because than is the comparison word and then is the time word, while and then we left stays clean. has past is flagged, has passed is not. Each finding carries the word as written, the spelling the context calls for, the pair it belongs to, and a one-line reason, so you can agree or overrule in a second.\\n\\nThe alternative — replacing every occurrence of than with then or vice versa — would be worse than useless. A blanket rule turns correct sentences into new errors, and the tool never does it: it reports, it never edits. That is also why the pair list is selective. Where two homophones fit the same context perfectly, no rule is written at all. I read it yesterday and I red it yesterday cannot be separated by the words around them, so no amount of rule-writing would help, and a noisy rule would train you to ignore the useful ones.\\n\\nWhat the detector cannot see is worth stating plainly. It has no idea what you meant; it knows constructions, not sentences. A deliberate pun, a quoted line of dialogue, an idiom or a regional usage can all put a flagged form in a place the rule does not expect, and a contraction inside a name or a title may be missed. The findings are questions to answer, never corrections to accept blindly.\\n\\nIn practice the tool earns its place because these errors survive every other check. A spell check passes them, a grammar check often ignores them, and the eye slides over them after the third reading, because the wrong form is a real word and looks plausible. Seeing them listed with the reason attached is usually enough to fix a habit permanently — most writers find one or two pairs account for nearly everything. A finding that repeats in the same construction is usually a phrase you type without reading, and rewriting that phrase once removes the whole family of hits.\\n\\nRun it before you run a spell check, or after, but run it on the final text rather than a first draft, because a sentence you are still restructuring may lose the construction that was flagged. Copy report gives you the list with the reasons, so the decisions can be made away from the screen, and the pair summary at the end shows which pairs actually mattered rather than leaving you with a total to interpret. Nothing is uploaded, and the text disappears with the tab.`,
    howTo: [
      { step: "Paste the draft; the 44 pair rules run across the whole text as you type." },
      { step: "Read each finding with its reason: the word found, the pair, and the spelling the surrounding words call for." },
      { step: "Check the sentence in context before changing anything — the tool reports, it never edits." },
      { step: "Keep the findings you disagree with and note the pair; repeated habits show up clearly in the pair summary." },
      { step: "Copy the report and re-run after editing, since rewriting a clause can remove the construction that fired." },
    ],
    whenToUse: `Use this detector on any draft where a wrong real word would embarrass you, and pair it with the checks that cover different word-level faults. The {{apostrophe-error-finder|Apostrophe Error Finder}} handles dropped and stray marks in contractions and possessives, including the forms this tool leaves alone on purpose, and the {{spell-checker|Spell Checker}} covers words that are not in the dictionary at all.\\n\\nWhen the confusion is a matter of sentence structure rather than a pair, the {{grammar-checker|Grammar Checker}} runs a published list of mechanical checks over the same text.`,
    faqs: [
      {
        q: "How many homophone pairs does the detector know?",
        a: "Forty-four documented pairs, each with its own context rule. They include your and you're, its and it's, their, there and they're, then and than, to, too and two, whose and who's, affect and effect, weather and whether, and lose and loose.",
      },
      {
        q: "Why does it flag your going but not your book?",
        a: "Because the rule is written around the construction, not the word. A possessive followed by a gerund is almost always meant to be you are, while your book is exactly right. Only the first pattern exists in the rule list.",
      },
      {
        q: "Will it rewrite my text?",
        a: "No. Every finding shows the word as written and the spelling the context calls for, side by side. Nothing changes in the draft unless you change it, so a finding you disagree with costs you nothing.",
      },
      {
        q: "Why are some homophones not checked at all?",
        a: "Because no context rule would be reliable. Where both spellings fit the same surroundings, a rule would fire on correct sentences, and a checker that cries wolf gets ignored. Those pairs are excluded rather than guessed at.",
      },
      {
        q: "Can it tell that a flagged word is deliberate?",
        a: "No, and it does not claim to. Dialogue, puns, idioms and quoted material can all put a flagged form where a rule does not expect it. Read each finding against the sentence and overrule it whenever the text is right.",
      },
    ],
  },

  "punctuation-checker": {
    keywords: ["punctuation checker", "punctuation mistakes", "punctuation check"],
    intro:
      "This punctuation checker runs 11 mechanical checks over the character stream — spaces in the wrong place, punctuation doubled, brackets and quotes that do not pair up, paragraphs with no full stop — and names every one of them so a clean result can be read for what it is.",
    content: `Punctuation mistakes divide into two kinds: the ones visible in the characters and the ones that depend on meaning. This punctuation checker concentrates on the first kind, because they are the ones a machine can find without pretending to understand the sentence. Eleven checks run, and all eleven are listed on the page.\\n\\nThe mechanical faults are the ones that survive a fast edit. A space before a comma or a full stop is reported as an error, and so is a missing space after one. Punctuation repeated — a double full stop, a comma after a comma — is reported as style, because a doubled mark is sometimes deliberate. An ellipsis written with two or four dots is flagged with the count, since three is the convention in both American and British practice. Brackets, braces and quotation marks are checked by type, so an unmatched opening parenthesis is named with the side that never closes. A paragraph that reaches its end without any terminal punctuation is reported, which is the fastest way to find the stroke that was never finished.\\n\\nThe last three checks are placement rather than presence: a hyphen used as a dash, a double hyphen standing in for one, and a space sitting just inside an opening or closing bracket. All three are reported as style, because all three can be house style somewhere.\\n\\nNear-misses are carved out deliberately, because a checker that fires on correct text is one you stop reading. A grouped number such as 1,000 is not a stray comma. A time such as 10:30 is not a missing space. The full stops in e.g. and i.e. and the initials in J.K. Rowling are not sentence ends, and the same abbreviation list is shared with the capitalisation checker so the two tools agree. A comma inside a closing quotation mark is accepted as written, and nothing inside a URL or an email address can fire at all. The abbreviation list is shared with the Capitalization Checker, so the same full stop cannot count as a sentence end in one tool and not in the other.\\n\\nWhat is left out is a judgement by design. A comma splice, the Oxford comma, a comma that changes the meaning of a clause, and the punctuation of dialogue all depend on what the sentence is doing. The tool says so on the page rather than guessing, and it points at the checks that do apply: a missing apostrophe belongs to the Apostrophe Error Finder, and a sentence that begins lower-case belongs to the Capitalization Checker.\\n\\nUse the counts as a map rather than a score. One rule firing eleven times is one habit; eleven rules firing once is a draft that needs a read-through. The two cases want different responses: fix the single habit first, then read the draft for the rest of the marks. Copy report and Download produce the list with a context snippet for each finding, so you can work through the fixes in one pass instead of hunting for the marks.`,
    howTo: [
      { step: "Paste your text; the 11 checks run as you type and the count for each appears in the grid." },
      { step: "Fix the error-severity findings first — spaces and unmatched marks are unambiguous." },
      { step: "Read the style findings in context: a deliberate ellipsis or dash run is yours to keep." },
      { step: "Work through the paragraphs flagged without terminal punctuation, which are often unfinished." },
      { step: "Download the report and tick off the fixes, then run the checks once more on the edited text." },
    ],
    whenToUse: `Use this as the mark-level pass, after the wording is settled and before you look at anything larger. Word-level faults that are not marks belong to the {{apostrophe-error-finder|Apostrophe Error Finder}}, and a lower-case sentence start or a stray capital belongs to the {{capitalization-checker|Capitalization Checker}}.\\n\\nWhen the marks are clean but the sentences still carry mechanical slips, the {{grammar-checker|Grammar Checker}} covers repeated words, article agreement and unmatched brackets over the same text.`,
    faqs: [
      {
        q: "Which punctuation faults does this tool actually find?",
        a: "Eleven: a space before punctuation, a missing space after it, repeated punctuation, an ellipsis that is not three dots, unmatched brackets, unbalanced quotation marks, a paragraph with no end punctuation, a spaced hyphen, a double hyphen, a space after an opening bracket, and a space before a closing one.",
      },
      {
        q: "Does it check comma usage?",
        a: "No, and that is deliberate. A comma splice, the Oxford comma and a comma that changes a clause all depend on meaning, and a pattern cannot judge them. Grouped numbers and times are excluded so the checks that do run stay quiet on correct text.",
      },
      {
        q: "Why was my ellipsis flagged?",
        a: "Because it used two or four dots instead of three. The finding is reported as style, not error — an intentional four-dot ellipsis is a legitimate convention — and the count is shown so you can decide.",
      },
      {
        q: "What does it do with quotation marks?",
        a: "It counts them by type and reports an odd number as unbalanced. An apostrophe is never counted as a quotation mark, so don't and it's do not disturb the pairing; a straight quote and a curly quote are also counted separately.",
      },
      {
        q: "Can it fix the text for me?",
        a: "It never edits the draft. Each finding carries a suggested fragment when a mechanical fix exists, and you apply it yourself. Copy report or Download gives you the full list with context.",
      },
    ],
  },

  "apostrophe-error-finder": {
    keywords: ["apostrophe error finder", "apostrophe mistakes", "missing apostrophe"],
    intro:
      "The Apostrophe Error Finder works from a published list of 27 spellings that only exist without an apostrophe — dont, isnt, couldnt — plus checks for stray marks, doubled marks, decade apostrophes and mixed straight and curly styles.",
    content: `The most common of all apostrophe mistakes is not a misplaced mark but a missing one: a missing apostrophe leaves a plausible string of letters, so the eye reads straight past it. This apostrophe error finder handles it with a closed list of 27 spellings that are only correct with the mark: dont, doesnt, didnt, isnt, arent, wasnt, werent, hasnt, havent, hadnt, couldnt, wouldnt, shouldnt, theyre, youre, whos and the rest. The list is printed in full on the tool page, so the claim is one you can check line by line.\\n\\nThree entries are real words on their own — lets, wont and im — and they are marked as needing evidence. A rule for them fires only when the next word proves the contraction: lets you and me go is reported and corrected to let's, while the plan lets you save is left alone. im followed by a verb or an adjective is treated as the contraction; the same logic applies to ive and the other ambiguous forms.\\n\\nAround that core sit four smaller checks. A decade written with an apostrophe (1990's) is flagged as style, because the modern convention is 1990s, while the possessive form the 1990's fashion is accepted. A stray apostrophe, one sitting where no contraction or possessive can be, is reported as an error; so is a doubled mark such as don''t. The last check reads the whole document for apostrophe styles: if it uses both the straight ' and the curly ’, the mix is reported as a typography issue, since switching between them is visible in print and invisible in the editor.\\n\\nThe engine deliberately stays out of the hardest cases. its and it's, whose and who's, and they're, their and there are context problems rather than apostrophe problems, so they belong to the Homophone Confusion Detector, which reads the surrounding words; a missing possessive apostrophe in the students books needs to know who owns what, which no character pattern can supply; and a plural possessive such as the dogs' toys is accepted exactly as written, never rewritten as dog's.\\n\\nWhat remains is a checker with a small, honest scope. It knows 27 spellings, three of them conditionally, and it never guesses at a word it has not been given. That is why it can be trusted on the findings it does produce, and why a clean result means the listed faults are absent rather than that every apostrophe in the draft is correct. A closed list cannot invent an apostrophe mistake, so every finding names a form that is printed on the page and can be checked by hand.\\n\\nRun it after the wording is settled, and run it on the whole document rather than paragraph by paragraph, so the mixed-style check has enough to compare. Copy report and Download produce a plain list of findings with the suggested fix, which is usually the fastest way to work through a draft that has lost its marks to copy and paste. In a repeated phrase one fix removes many findings, so start with whatever appears most often.`,
    howTo: [
      { step: "Paste the draft; the published list and the other five checks run as you type." },
      { step: "Fix the missing-apostrophe findings first, starting with the forms that repeat." },
      { step: "Check the lets, wont and im findings in context — the rule needs the next word as evidence." },
      { step: "Read the decade findings and decide whether the style choice is yours to make." },
      { step: "If mixed apostrophe styles are reported, convert the draft to one mark before publishing." },
    ],
    whenToUse: `Use this finder when the marks in a draft have been through copy and paste and need checking, and use its siblings for the faults it hands over. Contractions that need context — its and it's, whose and who's, their and there — are the {{homophone-confusion-detector|Homophone Confusion Detector}}'s job, and mark placement around brackets and quotes is the {{punctuation-checker|Punctuation Checker}}'s.\\n\\nWhen the apostrophe is right and the capitalisation around it is not, the {{capitalization-checker|Capitalization Checker}} covers sentence starts, the pronoun I and documented names.`,
    faqs: [
      {
        q: "How does the tool find a missing apostrophe without a dictionary?",
        a: "It uses a published list of 27 spellings that only exist without the mark, such as dont and isnt, plus a condition for the three that are also real words. Anything outside that list is not guessed at.",
      },
      {
        q: "Why was lets you and me go corrected but the plan lets you save not?",
        a: "Because lets is a real word. The rule waits for the following word: a pronoun or a verb in a request proves the contraction, while a subject and infinitive afterwards proves the ordinary verb, so only the first sentence is flagged.",
      },
      {
        q: "Is 1990's wrong?",
        a: "For the plural decade, the modern convention is 1990s with no apostrophe, so it is flagged as a style point rather than an error. The possessive form, as in the 1990's biggest hits, is accepted as written.",
      },
      {
        q: "Why does it not check its and it's?",
        a: "Those are homophones, not apostrophe patterns: both spellings are real, and only the surrounding words say which is meant. The Homophone Confusion Detector owns that pair, and this tool stays quiet on it rather than duplicating a worse rule.",
      },
      {
        q: "What is the mixed apostrophe styles finding?",
        a: "It fires when a document contains both the straight mark and the curly one. Both are correct alone, but a draft that switches between them shows in typeset output, so the mix is reported as a typography note.",
      },
    ],
  },

  "capitalization-checker": {
    keywords: ["capitalization checker", "capitalization errors", "sentence case"],
    intro:
      "This capitalization checker runs five published checks — lower-case sentence starts, the pronoun i, day, month, language and nationality names, ALL-CAPS words and capitals inside a word — and keeps the two style checks separate from the errors.",
    content: `Capitalization errors are quiet ones. A lower-case word after a full stop does not look wrong in a paragraph of ordinary sentence case, which is why it survives a careful read and why a mechanical scan is worth running. This capitalization checker runs five checks, publishes all five, and separates the two it treats as style from the three it treats as errors.\\n\\nThe sentence-start check looks for the error itself: a full stop, question mark or exclamation mark, then a lower-case word. Reading the pattern rather than the parsed sentences is deliberate, because the shared sentence splitter needs a capital to recognise a sentence boundary at all, and a lower-case start would be invisible to it. A lower-case first word of the text, or of a new line, counts as well. Two carve-outs keep it quiet on academic prose: abbreviations such as e.g. and i.e. do not end a sentence, and initials such as J.K. do not either. A deliberate lower-case start after an ellipsis is left alone, because that pattern is a style choice in fiction and dialogue.\\n\\nThe pronoun rule finds a lower-case i standing alone and inside its contractions — i, i'm, i've, i'll, i'd — while staying out of i.e. and other abbreviations that merely begin with the letter. The name rule holds 81 day, month, language and nationality names and reports a lower-case list of the names itself. The long weekday and month names are read from the platform's Intl data at run time rather than typed into the engine, so the rule cannot drift from the names the browser actually prints.\\n\\nThe fourth and fifth checks are style. A word in ALL CAPS is reported unless it is on the published acronym list — API, URL, JSON, PDF, SEO, CEO, USA and their relatives — because emphasis and initialisms are both legitimate and a wall of capitals is a habit rather than a fault. A capital inside a word is reported unless the word is a known brand: iPhone, macOS, YouTube, GitHub, JavaScript and eBay are never rewritten, and the tool has no opinion about a name it does not recognise beyond listing it.\\n\\nScope matters here, and the page states it. Country, continent and planet names belong to the Proper Noun Checker, because that tool also looks for a name the document writes two different ways, which is the more useful question for a repeated name. Names that are also ordinary words — march, may, august, polish — are never flagged on their own in either tool, because a sentence about a march or a polish is not a sentence about a month or a country.\\n\\nUse the counts to see which habit the draft has. A single digits-only number under one rule is one fix; a spread across the style rules usually means the draft needs a decision about emphasis rather than a tidy-up. Copy report and Download produce the findings with the suggested form for each, so the fixes can be made in one pass.`,
    howTo: [
      { step: "Paste your text; all five checks run as you type and each count appears in the grid." },
      { step: "Work through the sentence-start findings first — they usually cluster around one editing seam." },
      { step: "Check the pronoun i findings, including contractions that begin a clause." },
      { step: "Read the ALL-CAPS findings as a style question: keep the ones that are deliberate emphasis." },
      { step: "Send country, continent and planet issues to the Proper Noun Checker, which owns them." },
    ],
    whenToUse: `Use this checker on any draft that has been edited in pieces, since a lower-case sentence start is usually the scar of a rewrite. Where the capitalisation problem is a name written two ways, the {{proper-noun-checker|Proper Noun Checker}} handles it with a documented lexicon and an inconsistency check.\\n\\nWhen the capital is right but the mark beside it is not, the {{punctuation-checker|Punctuation Checker}} covers unmatched brackets, doubled marks and a paragraph with no full stop, and the {{grammar-checker|Grammar Checker}} adds its own sentence-level checks over the same text.`,
    faqs: [
      {
        q: "Why does the checker report a lower-case word after a full stop?",
        a: "Because that is the pattern of an unfinished edit. The rule looks for a terminator followed by a lower-case word and ignores abbreviations such as e.g. and initials such as J.K., so ordinary academic prose does not trip it.",
      },
      {
        q: "Why are country names not checked here?",
        a: "They are the Proper Noun Checker's responsibility by design. That tool holds the documented place-name list and also finds a name the document writes in two different forms, which a case-only rule cannot do.",
      },
      {
        q: "Is writing in all capitals a mistake?",
        a: "Not necessarily, which is why it is reported as style. Emphasis, initialisms and headings are all legitimate uses. The published acronym list keeps the everyday initialisms quiet so the remaining findings mean something.",
      },
      {
        q: "Why was the word iPhone not corrected?",
        a: "Because the internal capital is part of the brand name. A list of known brand forms — iPhone, macOS, YouTube, GitHub, JavaScript, eBay and others — is exempt from the check, so the rule never rewrites a name that is correct.",
      },
      {
        q: "Does it fix the text automatically?",
        a: "No. Each finding shows the word as written and the suggested form, and the draft is never modified. The exemption lists and the rule list are both on the page, so every silence and every finding can be accounted for.",
      },
    ],
  },

  "proper-noun-checker": {
    keywords: ["proper noun checker", "proper nouns", "name consistency"],
    intro:
      "The Proper Noun Checker holds 248 documented names — continents, planets, languages, nationalities and countries, plus the day and month names read from the platform's Intl data — and finds both lower-case forms and names your draft writes two different ways.",
    content: `Proper nouns are where a mechanical checker can be genuinely useful and genuinely dangerous, because a name the tool does not know is not a mistake. This proper noun checker draws that line clearly. It checks 248 documented names, it reports the names it does not know instead of correcting them, and it publishes the count so the scope can be judged.\\n\\nThe lexicon has two sources. The long weekday and month names are read from the platform's Intl data at run time, so they are never typed into the engine and cannot drift from the names the environment prints. The continents, planets, languages, nationalities and countries are a curated list that is shipped with the tool and counted on the page. A curated list is the honest description: this is a documented set of names, not a gazetteer, and no one should expect a town or a start-up to be in it.\\n\\nNineteen of the names are also ordinary English words, and those are never flagged on their own: turkey, may, march, august, earth, china, chile, jordan, mercury, polish, welsh and their relatives. The turkey was dry is a sentence about dinner, and the tool has no way to know better, so it waits for a capitalised context it can trust rather than firing on the word alone. That single decision removes most of the false positives a name list would otherwise produce. A clean run of the case check therefore says something narrow and checkable: none of the 248 documented names was written lower-case.\\n\\nThe second check reads your own document. If a word appears both capitalised mid-sentence and lower-case mid-sentence, the lower-case occurrences are reported and the capitalised form is shown as the documented one. A capital at the start of a sentence is never treated as evidence, because every first word of a sentence is capitalised, and neither is an ALL-CAPS heading. This is the check that catches the real-world problem: a name introduced one way in chapter one and spelled another way in chapter nine.\\n\\nSome capitalised words will inevitably fall outside the list, and the tool lists them instead of guessing. Up to twenty of the most frequent unknown capitalised words are shown, with their counts, explicitly marked as never corrected. That list is where your own characters, products and places appear, and it is also the honest measure of how much of the draft the lexicon could not see. Name consistency across a long document is the other half of the job, and it is the half only your own text can supply.\\n\\nRead the findings as two questions rather than one: is this name documented, and do I write it the same way twice? The first is answerable from the lexicon, the second from the report. Where a name appears in two forms, the majority form is usually the intended one, so start there and bring the outliers into line. Copy report and Download give you the findings, the suggested form and the unknown-name list together, which is what you need to settle a naming decision across a long document.`,
    howTo: [
      { step: "Paste your draft; documented names and repeated capitalised words are checked as you type." },
      { step: "Look at the findings first: each names the form found, the documented form and the reason." },
      { step: "Read the consistency findings carefully — they are about your own text, not the lexicon." },
      { step: "Scan the unknown capitalised words list and check the spellings by hand; the tool will not correct them." },
      { step: "Copy the report and apply one form for each name throughout the document." },
    ],
    whenToUse: `Use this checker when a document repeats its own names and needs them to agree — a report, a manuscript, a set of product pages. Case rules that are not name lists belong to the {{capitalization-checker|Capitalization Checker}}, which covers sentence starts, the pronoun I and everyday name classes.\\n\\nWhen the name is a place spelled two ways for a different reason — colour next to color, centre next to center — the {{consistent-spelling-checker|Consistent Spelling Checker}} answers that question, and the {{grammar-checker|Grammar Checker}} covers the sentence-level checks over the same text.`,
    faqs: [
      {
        q: "How many names does the proper noun checker know?",
        a: "248 documented names: continents, planets, languages, nationalities and countries, plus the long weekday and month names, which are read from the platform's Intl data at run time instead of being typed into the engine.",
      },
      {
        q: "Why is Turkey not flagged when I write about the bird?",
        a: "Because nineteen of the names are also ordinary words and are marked ambiguous. Turkey, May, March, China, Jordan, Mercury and the rest are never reported on their own; the tool would rather miss a case than invent one.",
      },
      {
        q: "How does the consistency check avoid flagging sentences that start with a word?",
        a: "It ignores any occurrence at the start of a sentence and any ALL-CAPS heading before comparing forms. The check only fires when both a capitalised and a lower-case form appear away from a sentence start, which is real evidence rather than a side effect of grammar.",
      },
      {
        q: "Why are some capitalised words listed but not corrected?",
        a: "They are names the lexicon does not contain. Nothing outside the documented list is treated as a mistake, so those words appear in a separate list of unknown capitalised forms, capped at 20 and explicitly marked as never corrected.",
      },
      {
        q: "Can I rely on it for proofreading a manuscript?",
        a: "Use it for the two questions it can answer: whether a documented name is lower-case, and whether your own draft writes a name the same way twice. It is a documented list, not a gazetteer, so treat the unknown-name list as the part you check by hand.",
      },
    ],
  },

  "consistent-spelling-checker": {
    keywords: ["consistent spelling checker", "spelling consistency", "US and UK spellings"],
    intro:
      "The Consistent Spelling Checker compares 95 published US and UK pairs across a whole document — color and colour, center and centre, defense and defence — and reports the mix rather than the spelling, because both forms are correct English.",
    content: `American and British spellings are both correct; what reads badly is a document that uses one in the heading and the other in the paragraph. This consistent spelling checker exists for that problem and not for correctness. It compares US and UK spellings as two conventions rather than right and wrong, which is why its verdict is always about the document: it leans US, it leans UK, it mixes, or it contains none of the variants it knows.\\n\\nSpelling consistency is a document-level property, so the whole text is analysed at once. Ninety-five pairs are published on the page: color and colour, center and centre, defense and defence, catalog and catalogue, gray and grey, jewelry and jewellery, analyze and analyse, traveled and travelled and the rest of the list. On top of the listed pairs, three families are matched by their shared stem so a word that was never listed is still caught. The -ize and -ise family pairs organize with organise; the -yze and -yse family pairs analyze with analyse; and sixteen stems cover the doubled-consonant group, where traveled and travelled sit side by side. Stem matching is what makes the check useful on technical prose, where a writer picks up a suffix from a house style and applies it to words no list would enumerate.\\n\\nThe exclusions matter as much as the entries. Check and cheque, tire and tyre, curb and kerb, draft and draught, and storey and story are different words now, not variants of one another, so they are not compared and a document is never told to change them on this tool's account. The doubled-consonant group is matched against a published list of stems rather than by collapsing every double letter, because a blind rule pairs words that have nothing to do with each other — filed and filled, tiled and tilled — and those are different words with different meanings.\\n\\nA rule that applies to one side alone would produce noise, so the stem-matched families are reported only when both shapes appear in the document. Using traveled throughout is not evidence of anything, because both spellings are accepted on both sides of the Atlantic; using traveled and travelled in one draft is. The listed pairs work the other way round: they are reported even when the document is consistent, because then they are evidence of which variant the writer chose, and the summary counts both sides so the lean is visible.\\n\\nFindings come with the family, the forms found, the rule that matched and a status. A family marked mixed is a seam a reader can see; a family with one variant is simply the convention the document has settled into. Copy report and Download give the whole picture, which is the useful thing to hand to a co-author or an editor when the question is which convention the publication uses.\\n\\nBoth verdicts are legitimate outcomes. If the document is consistently British, nothing needs changing; if it is consistently American, the same. The tool reports the mix because a mix is the thing a reader notices, and leaves the choice of variant where it belongs — with the writer and the publication.`,
    howTo: [
      { step: "Paste the whole document, not a paragraph: consistency is only visible across the full text." },
      { step: "Read the verdict first — a consistent result needs no changes at all." },
      { step: "If the result is mixed, open the families table and look at the rows marked mixed." },
      { step: "Choose the variant the document leans on and bring the outliers into line with it." },
      { step: "Re-check after editing, since a family can drop out of the report once only one form remains." },
    ],
    whenToUse: `Use this checker when a document has more than one author or has been through several revision passes, which is when variants drift. When the problem is a word the dictionary does not contain at all, the {{spell-checker|Spell Checker}} is the right tool, and when the question is whether the draft follows a named house style, the {{style-guide-adherence-checker|Style Guide Adherence Checker}} checks a published list of rules.\\n\\nIf a mixed result is really a punctuation or sentence-level habit, the {{grammar-checker|Grammar Checker}} runs its mechanical checks over the same text so both questions are covered in one pass.`,
    faqs: [
      {
        q: "How many US and UK pairs are compared?",
        a: "Ninety-five published pairs, from color and colour to willful and wilful. On top of those, three stem-matched families cover the -ize and -ise words, the -yze and -yse words, and sixteen doubled-consonant stems.",
      },
      {
        q: "Is a mixed result an error?",
        a: "No. Both spellings are correct English; the finding is about one document mixing them, which reads like two hands wrote it. The tool reports which variant the draft leans on and leaves the choice with the writer.",
      },
      {
        q: "Why are check and cheque not compared?",
        a: "Because they are different words rather than variants. The same goes for tire and tyre, curb and kerb, draft and draught, and storey and story. Comparing them would mean telling you to change a word that is correct in your meaning.",
      },
      {
        q: "Why is traveled alone not flagged?",
        a: "Because one form on its own is not evidence: both traveled and travelled are accepted on both sides of the Atlantic. The stem-matched families are reported only when the document uses both shapes, which is the actual inconsistency.",
      },
      {
        q: "Does it change my spelling automatically?",
        a: "No. It reports the families, the forms found and the counts, and you decide which convention to settle on. Copy report and Download give you the list to share with a co-author or editor.",
      },
    ],
  },
};
