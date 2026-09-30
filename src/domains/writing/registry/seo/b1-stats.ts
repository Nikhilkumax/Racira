import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B1, counter group: authored SEO entries for the counting and
 * consistency tools. Keys are registry slugs; see ../tool-seo.ts for the
 * contract these entries are validated against.
 */
export const B1_STATS_SEO: Record<string, ToolSeo> = {
  "word-count-tool": {
    keywords: ["word count", "word counter", "count words"],
    intro:
      "The Word Count Tool counts the words, characters, sentences and paragraphs in anything you paste, and tells you how long the text takes to read or say aloud — entirely in your browser.",
    content: `Word count is one of those numbers that quietly decides things. It decides whether a submission fits inside a window, whether an abstract is inside a journal's limit, whether a caption fits a platform, and whether an assignment meets its brief. The Word Count Tool answers that question in one pass, and — just as important — it states the counting rule it uses instead of leaving you to guess.\n\nCounting follows Unicode word boundaries, the same segmentation rule browsers use for selecting text by word. Numbers count as words, so "2026" and "10,000" each count once. Hyphenated compounds count once: "well-known" is a single word, because that is how a word processor counts it. Apostrophes stay inside the word, so "don't" is one word rather than two. Standalone punctuation and standalone emoji are not words at all. If you paste a document in Chinese or Arabic, the counter treats each word-like segment as a word, which is the closest useful approximation for languages without spaces.\n\nThe tool reports more than one number. Alongside the total word count you get the unique word count, the character count, the sentence count and the paragraph count, plus the longest word in the text. The reading and speaking estimates are explicit models rather than magic: 220 words per minute for silent reading and 130 words per minute for speaking aloud. Both rates are the ones the Reading Time Estimator uses, and that tool lets you change them when your material is denser than average.\n\nThe frequency table is where a word count becomes useful for editing. Every text leans on a handful of words, and the most-used list makes that lean visible. Function words such as the, and, of and that are hidden by default because they dominate any English count without telling you anything; one click includes them, which is useful when you are checking whether a specific connector is overused. Matching is case-insensitive, so "The" and "the" are the same row. Ties are broken alphabetically so the table never reshuffles while you type.\n\nEverything runs locally. There is no upload, no account and no server round trip: the text you paste is analysed by JavaScript in the page, and when you close the tab it is gone. That matters when the document is a client report, a manuscript under embargo or an exam answer. Copy counts and Download counts both produce a small plain-text summary you can paste into a spreadsheet or a submission form.\n\nTwo characteristics of the counting rule are worth knowing before you rely on a number. First, abbreviations followed by a period behave as their own sentence segment, so "Dr. Smith went home." is two sentences even though a reader sees one; the Sentence Count Tool shares this rule and explains it in the same way. Second, very large documents — several hundred thousand characters — still count exactly, but the results settle a fraction of a second after you stop typing because the analysis is debounced. Neither behaviour is hidden from you: the tool says so on the page.\n\nOne habit makes the numbers more useful: decide what you need to count words for before you start. A word counter that reports a total is enough for a progress log, while a submission form usually wants a specific recount of a specific section — the body without the abstract, a title without its subtitle. Because this tool names the rule it applies and shows the frequency table it derived from, you can paste just that section, read the figure and reproduce it later.`,
    howTo: [
      { step: "Paste or type your text into the box. Counting starts immediately; there is no upload step and no button to press." },
      { step: "Read the headline word count and the unique-word figure below it, then the character, sentence and paragraph counts in the cards." },
      { step: "Check the reading and speaking estimates against the rates shown; if your material needs different rates, open the Reading Time Estimator." },
      { step: "Use the frequency table to spot repeated words. Toggle function words on if you need to check connectors as well as content words." },
      { step: "Copy counts or Download counts to keep the numbers for a submission form, then clear the box — nothing is stored." },
    ],
    whenToUse: `Reach for the word count when a number is a hard boundary: a submission window, an abstract limit, a caption with a character cap, or a manuscript you are about to send. When the question is "how long does this take to read", use the {{reading-time-estimator|Reading Time Estimator}} instead, which shares the same word count but focuses on time and lets you change the reading rate.\n\nWhen you need to know how many characters are left before a platform rejects a post, the {{character-count-tool|Character Count Tool}} is the better fit, since it breaks the count down by spaces, code points and bytes. For checking whether a draft leans on the same connector, the combination of this tool's frequency table and the {{focus-sentence-highlighter|Focus Sentence Highlighter}} covers both whole-document and sentence-level review.`,
    faqs: [
      {
        q: "Does the word count include numbers?",
        a: "Yes. Numbers count as words, so 2026 counts once and 10,000 counts once. That matches the Unicode word-boundary rule the tool uses and the behaviour of most word processors.",
      },
      {
        q: "Why does a hyphenated word count as one word here?",
        a: "Because the tool re-joins segments that Unicode separates at a hyphen. The raw boundary rule splits well-known into two units; the counter merges them so the number matches what a word processor reports.",
      },
      {
        q: "Is my text uploaded anywhere?",
        a: "No. The counting runs in your browser with local JavaScript. There is no server call, no account and no logging, and the text disappears when you close the tab.",
      },
      {
        q: "Why does my sentence count look higher than I expect?",
        a: "Abbreviations followed by a period are their own sentence segment under Unicode boundary rules, so Dr. Smith went home. counts as two sentences. The rule is stated on the page rather than silently adjusted.",
      },
      {
        q: "Can I count a very long document?",
        a: "Yes. Documents of several hundred thousand characters are counted exactly; the numbers simply settle a moment after you stop typing because the analysis is debounced.",
      },
    ],
  },

  "character-count-tool": {
    keywords: ["character count", "character counter", "count characters"],
    intro:
      "Count characters with and without spaces, plus code points, bytes and grapheme clusters, so you know exactly why a platform, database or form counts your text the way it does.",
    content: `Character counts are rarely wrong, but they disagree with each other constantly — and the disagreement is the point. A text field that stops accepting input at 280 characters is counting UTF-16 code units. A database column that stores 65,535 bytes is counting UTF-8. A designer checking whether a label fits is looking at user-perceived characters. The Character Count Tool shows all of these at once, labelled, so you can stop guessing which number a limit will use.\n\nThe headline figure is characters with spaces, the same number a text field would report. Below it, characters without whitespace strips every space, tab and newline, which is the number most microcopy guidelines mean when they say "keep it under 40 characters". User-perceived characters counts grapheme clusters: a combining accent is one, an emoji with a skin-tone modifier is one, and a family emoji built from several code points is still one. Unicode code points counts the abstract characters the standard defines, which is what a linguist or a font engineer means by character.\n\nThe UTF-8 size row is the one people reach for last and need first. Emoji, accented letters, CJK characters and curly quotes all take more than one byte, so a 200-character string of English is far smaller than a 200-character string of emoji. If a field has a byte limit rather than a character limit, this row is the only one that predicts it.\n\nThe breakdown by category explains where the length is going. Letters, digits, punctuation and symbols are counted with Unicode property classes rather than an ASCII assumption, so accented letters count as letters and an emoji modifier counts as a symbol. Whitespace is reported separately, including the non-breaking space that sneaks in from copied web text — a frequent cause of a "200 character" caption being rejected at 201.\n\nThe "Fits in" panel checks the current count against real limits: a post, an SMS segment, a meta description, a title tag, an Instagram caption and a LinkedIn post. Each row shows used versus limit with a progress bar, and turns red with the exact number of characters over the limit. Those limits are the platforms' published caps, not estimates.\n\nAs with every tool on this site, nothing leaves the browser. There is no upload, no account and no logging, and the counts update as you type, roughly a quarter of a second after your last keystroke. Copy counts and Download counts give you a plain-text record. If you are counting words rather than characters, the {{word-count-tool|Word Count Tool}} shares this engine and reports sentences and paragraphs as well.\n\nThere is a reason a character counter earns its place next to a word count. Limits are set by different systems — a database column, a form field, a design that has to fit on one line — and each one counts a different unit, so the number that matters changes with the destination. The Fits in panel turns that into a checklist: paste a caption once and every limit is checked at the same time. If you need to count characters for a manuscript rather than a form field, remember that publishers mean characters with spaces, which is the headline figure. Neither number is more correct than the other; they answer different questions.`,
    howTo: [
      { step: "Paste or type the text into the box; the counts update as you type." },
      { step: "Read the headline count (with spaces) and the without-whitespace row below it." },
      { step: "Check the user-perceived characters and code points rows when the text contains emoji, accents or CJK characters." },
      { step: "Check the UTF-8 size row before pasting into a field with a byte limit." },
      { step: "Scan the Fits in panel: any row in red tells you how many characters over the platform limit you are." },
    ],
    whenToUse: `Use the character count whenever a limit is expressed in characters rather than words: social captions, meta descriptions, title tags, SMS messages, form fields with maxlength, and database columns. When the limit is expressed in words — an abstract, an assignment, a speech — the {{word-count-tool|Word Count Tool}} is the right starting point.\n\nIf the text mixes scripts and you are unsure whether a count is being distorted by combining marks or invisible characters, run it through the {{unicode-text-normalizer|Unicode Text Normalizer}} first: normalising to NFC collapses accents that were stored as two code points, which can quietly change both the character count and the byte size.`,
    faqs: [
      {
        q: "Why does one emoji add two characters?",
        a: "Because a text field counts UTF-16 code units and most emoji live outside the basic plane, which requires two units. The user-perceived characters row counts the same emoji as one.",
      },
      {
        q: "What is the difference between code points and characters?",
        a: "Characters here means UTF-16 code units, the number a browser input reports. Code points are the abstract characters defined by Unicode, which is what a font or language engineer counts.",
      },
      {
        q: "Why is my text longer in bytes than in characters?",
        a: "UTF-8 uses one byte for plain ASCII and two or more for accented letters, CJK characters, emoji and curly punctuation. The UTF-8 size row shows the real payload size.",
      },
      {
        q: "Do the platform limits in the Fits in panel get updated?",
        a: "They are the published caps at the time the tool was built. If a platform changes its limit, treat the row as a starting point and check the platform's documentation.",
      },
      {
        q: "Is my text stored anywhere?",
        a: "No. The analysis runs locally in the page and is discarded when you close the tab. There is no upload and no account.",
      },
    ],
  },

  "reading-time-estimator": {
    keywords: ["reading time", "reading time estimator", "reading speed"],
    intro:
      "Estimate how long a text takes to read silently or to deliver aloud, using your own reading and speaking rates rather than a hidden assumption.",
    content: `Reading time is arithmetic: the word count divided by a rate. The variables are how many words are in the text and how fast the reader moves, and the only honest way to present the result is to show both. The Reading Time Estimator does exactly that, and it lets you change the rates instead of locking you to a default.\n\nThe default silent reading rate is 220 words per minute, the figure most publishing style guides use for adult prose. The default speaking rate is 130 words per minute, which is a comfortable delivery pace for a script read aloud. Both are editable numbers in the page, and the result recalculates as you change them. If your audience is reading in a second language or the material is dense technical prose, entering 150 instead of 220 is more truthful than pretending the text is shorter.\n\nThe tool also shows the same text at three reference rates — 150, 220 and 300 words per minute — because the useful question is often a range rather than a point. A five-minute result at 220 can be over seven minutes at 150, and knowing the range is what stops an overrun during recording or presenting.\n\nReading time is used in places where the number is a promise. Estimated reading times on articles tell a visitor whether they have time to commit. Podcast and video scripts use speaking time to plan segments. Teachers and students use it to judge whether a passage fits a lesson. Conference organisers use it to keep a session inside its slot. In each case an error of a minute or two changes the decision, which is why the rate is visible and adjustable rather than buried.\n\nUnder the headline figure you get the inputs the estimate rests on: words, sentences, paragraphs and characters, all from the same counting engine used elsewhere in this domain. That means the number is reproducible: the reading time equals the words divided by the rate you chose, not a blend of estimates.\n\nTwo limits are worth stating. Silent reading speed varies enormously between people and between texts, so treat any single number as a convention rather than a measurement. And pauses — headings, figures, tables — are not modelled; a text with many of them takes longer than the arithmetic suggests. The tool says both on the page, because an estimate that oversells its precision is worse than no estimate. For counting the words themselves, the {{word-count-tool|Word Count Tool}} reports the same figure alongside frequency data, and the {{character-count-tool|Character Count Tool}} covers limits expressed in characters.\n\nTwo refinements make the estimate more useful in practice. A short note read by a slow reader is not the same as a dense technical paper read by a fast one, which is why the rate is editable rather than fixed: lower it for technical material, raise it for light prose, and the same word count produces a different and more honest answer. And when only part of a document is finished, pasting that part rather than the whole outline keeps the estimate tied to text that actually exists. Both habits keep the number a planning figure rather than a promise.`,
    howTo: [
      { step: "Paste the text you want to time — an article, a script, a speech or a chapter." },
      { step: "Leave the rates at 220 and 130 words per minute, or enter your own if you know how fast you read or speak." },
      { step: "Read the headline reading time and the speaking time row beneath it." },
      { step: "Check the reference table to see how the same text behaves at a slow, average and fast reading pace." },
      { step: "Copy times to keep the estimate with the document." },
    ],
    whenToUse: `Use the reading time estimator when time is the constraint: planning a script, promising a reading time on an article, or fitting a passage into a lesson or a session. When the constraint is a word or character limit, the {{word-count-tool|Word Count Tool}} and {{character-count-tool|Character Count Tool}} answer that question directly.\n\nIf you are planning a writing session rather than a reading session, the {{writing-sprint-timer|Writing Sprint Timer}} measures how many words you actually produce in a timed block, which is the writing-side counterpart to this estimate.`,
    faqs: [
      {
        q: "What reading speed does the estimate assume?",
        a: "220 words per minute for silent reading and 130 words per minute for speaking aloud. Both are editable in the page, and the result recalculates immediately when you change them.",
      },
      {
        q: "Why do different sites give different reading times for the same article?",
        a: "Because they assume different rates, and many do not say which. This tool shows the rate it used and lets you change it, so the number can be reproduced or challenged.",
      },
      {
        q: "Does the estimate account for headings, images or tables?",
        a: "No. It is words divided by rate. Texts with many visual breaks read more slowly than the arithmetic suggests, which the page states rather than hiding.",
      },
      {
        q: "Is speaking time the same as reading time?",
        a: "No. Speaking is slower: the default is 130 words per minute against 220 for silent reading. A five-minute read becomes roughly eight minutes delivered aloud.",
      },
      {
        q: "Is my text uploaded to calculate this?",
        a: "No. The word count and the arithmetic both happen in your browser and nothing is transmitted or stored.",
      },
    ],
  },

  "sentence-count-tool": {
    keywords: ["sentence count", "count sentences", "sentence counter"],
    intro:
      "Count the sentences in a text and see each one with its own word count, so you can find the sentences that are carrying too much or too little.",
    content: `Sentence length is the simplest measure of whether prose is readable, and a sentence count is where that measurement starts. The Sentence Count Tool splits your text into sentences using Unicode sentence boundaries, counts them, and then lists each sentence with its word count so you can see the distribution rather than just the total.\n\nThe summary gives you the numbers you would otherwise calculate by hand: total sentences, total words, the average words per sentence, and the longest and shortest sentences with their positions in the text. Average sentence length in English nonfiction typically sits between 15 and 25 words; a paragraph averaging over 30 is usually a candidate for splitting, and one averaging under 10 can read as choppy. The point is not to hit a number but to see where your draft sits and whether the variation is deliberate.\n\nThe sentence list is the working part of the tool. Each sentence appears with a word count beside it, so a 58-word sentence stands out immediately in a list of 12-word sentences. Writers, editors and students use this to spot the sentence that should have been three, or the run of short sentences that reads like a list rather than a paragraph. Clicking through with the {{focus-sentence-highlighter|Focus Sentence Highlighter}} is the natural next step when you want to work on one sentence at a time.\n\nSentence segmentation follows the same Unicode boundary rules used by browsers, which means abbreviations behave predictably and, importantly, honestly. "Dr. Smith went home." is reported as two sentence segments because a period after an abbreviation followed by a capital is a boundary under those rules. The tool says so on the page. The alternative — a hand-tuned abbreviation list — would be more accurate for English and less predictable for other languages, so the rule is stated instead of hidden.\n\nEverything runs locally in the browser. Nothing is uploaded, there is no account, and the analysis is debounced so that a long document does not stutter while you type. Large texts are handled exactly; the preview list is capped at the first twenty-five sentences so the page stays responsive, and the total still covers the whole document.\n\nA sentence count pairs naturally with a word count when you are judging readability: the same 500 words in 12 sentences reads differently from the same 500 words in 30. To see the whole-document numbers, use the {{word-count-tool|Word Count Tool}}; to see how long the text takes to read at that sentence length, use the {{reading-time-estimator|Reading Time Estimator}}.\n\nWorking with a sentence counter changes how a draft reads. When you count sentences rather than estimate them, a paragraph of nine short segments behaves visibly differently from three long ones carrying the same word count, and the total shows it. Because the tool lists the sentences it found, a split caused by an abbreviation is visible rather than mysterious, and the average words per sentence supplies the summary figure most style guides actually care about. If a number looks wrong, the list is where the explanation is, not a footnote.`,
    howTo: [
      { step: "Paste your text into the box." },
      { step: "Read the headline sentence count and the average words per sentence underneath." },
      { step: "Check the longest and shortest rows, which name the sentence number so you can find them quickly." },
      { step: "Scan the sentence list for outliers — long sentences show their word count beside them." },
      { step: "Copy the summary if you want to track the numbers across drafts." },
    ],
    whenToUse: `Use the sentence count when you are editing for rhythm and clarity: a draft with an average above 30 words per sentence or a long run of very short sentences needs attention. It is also the fastest way to check that a paragraph has not become one enormous sentence.\n\nWhen the question is readability in a scored sense rather than a structural one, the reading time and word count tools give the supporting numbers, and when you want to revise a specific sentence, the {{focus-sentence-highlighter|Focus Sentence Highlighter}} isolates it. If the text mixes right-to-left and left-to-right runs, the {{rtl-text-tester|RTL Text Tester}} checks that the segmentation and display direction behave as expected.`,
    faqs: [
      {
        q: "Why is Dr. counted as its own sentence?",
        a: "Because Unicode sentence boundaries treat an abbreviation followed by a period and then a capital letter as a break. The tool reports the rule it uses instead of applying a hidden English-only abbreviation list.",
      },
      {
        q: "What is a good average sentence length?",
        a: "Between 15 and 25 words is typical for readable English nonfiction. The useful signal is variation: a document where every sentence is 35 words long is harder to read than one that alternates long and short.",
      },
      {
        q: "Does the tool list every sentence?",
        a: "The summary counts every sentence in the document. The list shows the first twenty-five so the page stays responsive with very long documents, and says how many are not listed.",
      },
      {
        q: "How is a word counted inside a sentence?",
        a: "With the same Unicode word-boundary rule used across this domain: numbers count as words, hyphens join compounds, and standalone punctuation is not a word.",
      },
      {
        q: "Is the text sent anywhere?",
        a: "No. Segmentation and counting happen entirely in your browser; nothing is uploaded or stored.",
      },
    ],
  },

  "average-word-length-calculator": {
    keywords: ["average word length", "word length calculator", "median word length"],
    intro:
      "Measure how long the words in a text actually are — average, median and full distribution — to judge whether the vocabulary is doing its job.",
    content: `Average word length is a vocabulary measure that sits between a plain word count and a full readability score. It answers a simple question: are the words in this text short and direct, or long and technical? The Average Word Length Calculator computes the mean and the median word length, names the longest and shortest words, and plots the distribution so you can see the shape rather than a single number.\n\nLength is measured in user-perceived characters, so accented letters count once and emoji count once regardless of how many code points they use. That makes the figure comparable across languages and safe with pasted web text that mixes accent forms. The mean is the arithmetic average of every word's length; the median is the middle value when the words are sorted, and it is the more robust figure when a few long technical terms would otherwise drag the mean upward. Both are shown because a mean of 5.2 with a median of 4.6 tells a different story from a mean and median that agree.\n\nThe distribution is where the useful signal lives. A normal English distribution peaks at three to four characters and tails off; a distribution with a fat tail past ten characters is a text full of nominalisations, compound technical nouns and imported jargon. If your writing is meant to be read quickly, that tail is the first thing to look at. The histogram buckets fold anything longer than fifteen characters into the last column, and the column heights are counts, not estimates.\n\nTypical figures provide a reference point. Everyday English prose averages between four and five characters per word. Academic and legal writing often lands between five and six. Marketing copy written for scanning tends to sit near four. None of these are targets; they are the bands that make an outlier obvious in either direction.\n\nThe tool also reports the longest and shortest words with their lengths, which is often how you find an accidental concatenation — a word that is long because two words were joined without a space, or a URL fragment pasted into a sentence. Together with total letters across all words and the word count, that covers the arithmetic without inventing anything.\n\nAs always, the analysis is local: no upload, no account, no logging, and results update shortly after you stop typing. If you want the frequency side of vocabulary rather than the length side, the {{word-count-tool|Word Count Tool}} reports the most-used words with function words optionally hidden. For reading difficulty as a scored index, {{reading-time-estimator|Reading Time Estimator}} and the sentence-level tools in this domain are the natural companions.\n\nThe distribution is more informative than the average on its own. A document where most words are three to five characters with a thin tail of long technical terms reads differently from one whose words cluster around seven or eight, even when their averages match exactly. Sorting the same data by frequency answers a different question again: frequency shows which words the text leans on, while length surfaces the words a reader has to slow down for. Both views come from the same token stream as the counts above, so the figures always agree with each other.`,
    howTo: [
      { step: "Paste the text you want to measure." },
      { step: "Read the average and median word length at the top; the median is the more reliable of the two when the text has long technical words." },
      { step: "Check the distribution histogram: a heavy tail past ten characters signals long compounds or nominalisations." },
      { step: "Look at the longest and shortest word rows to catch accidental concatenations or stray fragments." },
      { step: "Copy the summary to compare revisions of the same draft." },
    ],
    whenToUse: `Use this tool when you need to judge vocabulary weight rather than volume: checking that a rewrite actually shortened the words, comparing a technical document against a plain-language version, or finding the accidental long word that is throwing off an average.\n\nIt pairs well with the {{word-count-tool|Word Count Tool}}, which shows which long words are being repeated, and with the {{sentence-count-tool|Sentence Count Tool}}, since sentence length and word length together explain most of a text's reading difficulty. If you edit for a locale with different conventions, the {{locale-aware-sort-tool|Locale-Aware Sort Tool}} handles accented vocabulary ordering.`,
    faqs: [
      {
        q: "Why show both the average and the median?",
        a: "A few very long words can pull the average upward while most words stay short. The median shows the typical word and the gap between the two tells you whether the mean is being skewed.",
      },
      {
        q: "Are accented letters counted as one character?",
        a: "Yes. Length is measured in grapheme clusters, so é counts once whether it was stored as one code point or as a letter plus a combining mark, and an emoji counts once.",
      },
      {
        q: "What is a normal average word length?",
        a: "Everyday English prose averages about four to five characters per word; academic and legal writing often sits between five and six. The bands are orientation, not targets.",
      },
      {
        q: "Does punctuation affect the measurement?",
        a: "No. Only word-like segments are measured, so commas and full stops never count toward a word's length.",
      },
      {
        q: "Is the text uploaded?",
        a: "No. Everything is computed in the browser; the text never leaves your device and is not stored.",
      },
    ],
  },

  "number-format-checker": {
    keywords: ["number format", "number format checker", "thousands separator"],
    intro:
      "Find the places where a document is inconsistent about numbers — mixed decimal separators, mixed thousands grouping, ambiguous values like 1.500, percent spacing and currency placement — and rewrite them in one convention.",
    content: `Number formatting is invisible until it is wrong, and then it is dangerously wrong. A report that writes 1,234.56 in one paragraph and 1.234,56 in the next is asking every reader to interpret two conventions at once, and an international reader may read them as different values. The Number Format Checker scans a document, works out how each number is punctuated, and reports the inconsistencies in plain language.\n\nDetection is rule-based and the rules are stated. Each numeric token is analysed for a decimal separator, a thousands separator, a sign, a currency symbol, a percent sign and a trailing unit. The analyser then looks for genuine problems: both a comma and a full stop used as decimal separators; both used for grouping; values such as 1.500 that are legitimately ambiguous; grouping that is not standard three-digit; large ungrouped numbers; percent signs spaced inconsistently; currency symbols appearing both before and after amounts; more than one currency in the same text; and units written both with and without a space after the number.\n\nAmbiguity is reported rather than resolved. "1.500" is fifteen hundred if the document is using a dot as a grouping separator, and one and a half if it is using a dot as a decimal separator. Both readings are legal, so the tool reports the token as ambiguous and tells you which reading it used for the value column instead of picking silently. The same honesty applies to Indian lakh and crore grouping: "1,23,456" is valid in en-IN and irregular in en-US, so the finding is labelled informational.\n\nThe interpretation table shows every number the scanner found, with the value it inferred and the separators it saw. That is the audit trail: if the analyser read something differently from how you meant it, you can see exactly which token and why, rather than arguing with a black box.\n\nFinally, the tool rewrites the whole document in one convention — US and UK style with 1,234,567.89, European style with 1.234.567,89, or SI and French style with narrow spaces — and shows the rewritten text ready to copy. Numbers the author wrote without separators and that are four digits or shorter are left alone, because regrouping a year into "2,026" changes what the sentence says. Currency symbols, signs, percent signs and units keep their original position; only the digit punctuation moves. The same interpretation engine backs the {{number-locale-formatter|Number Locale Formatter}}, which renders a single value in any locale's conventions, and mixed-script documents benefit from a pass through the {{unicode-text-normalizer|Unicode Text Normalizer}} to remove invisible characters that can hide inside pasted numbers.\n\nThe findings are ordered so a long document stays readable: whole-document structural issues first, then per-number observations in document order, each carrying the surrounding context so the line can be found. Nothing is rewritten until you ask for it, which matters when a draft combines a price list in one convention with body text in another. The checker reports the mixture and the normalizer applies your chosen convention to the numbers, leaving every other character of the sentence — including the words around the figures — exactly as the author wrote it.`,
    howTo: [
      { step: "Paste the document that contains numbers." },
      { step: "Read the consistency issues list; each finding names the kind of problem and quotes the context." },
      { step: "Check the interpretation table for any number marked ambiguous or irregular, and confirm the value column matches what you meant." },
      { step: "Choose the convention you want in the rewrite dropdown." },
      { step: "Copy the rewritten text or download it as a file, then diff it against your original before publishing." },
    ],
    whenToUse: `Use the checker before publishing anything that mixes sources: a report assembled from several contributors, a translation handed between teams, or a dataset description written by someone using a different locale. It is also the fastest way to audit a document for the specific ambiguity of numbers like 1.500.\n\nWhen you need to render one value correctly for a specific locale rather than audit a document, use the {{number-locale-formatter|Number Locale Formatter}}, which is built on the same parsing rules. When the document is predominantly about dates and times rather than amounts, the {{locale-date-formatter|Locale Date Formatter}} covers that convention family in the same way.`,
    faqs: [
      {
        q: "Is 1.500 one and a half or fifteen hundred?",
        a: "It depends on the convention the document is using, so the tool reports it as ambiguous. The interpretation table shows which reading it used for the value column so nothing is decided silently.",
      },
      {
        q: "Will the rewrite change my dates or years?",
        a: "No. Numbers written without separators and four digits or shorter are left exactly as they are, so 2026 stays 2026. Only punctuation inside longer or already-grouped numbers is normalised.",
      },
      {
        q: "Why is Indian grouping flagged as irregular?",
        a: "Because 1,23,456 does not use three-digit grouping. It is correct in locales that group by lakh and crore, so the finding is labelled informational rather than an error.",
      },
      {
        q: "Does the checker understand units?",
        a: "It recognises a curated list of common units and reports inconsistent spacing between the number and the unit — for example 5kg in one place and 10 kg in another.",
      },
      {
        q: "Is my document uploaded?",
        a: "No. The scan and the rewrite happen in your browser and the text is never transmitted or stored.",
      },
    ],
  },
};
