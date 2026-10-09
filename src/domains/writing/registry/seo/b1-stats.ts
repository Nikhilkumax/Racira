import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B1, counter group: authored SEO entries for the counting and
 * consistency tools. Keys are registry slugs; see ../tool-seo.ts for the
 * contract these entries are validated against.
 */
export const B1_STATS_SEO: Record<string, ToolSeo> = {
  "word-count-tool": {
    keywords: [
      "word count tool",
      "word counter",
      "count words",
      "unique words",
    ],
    intro:
      "The Word Count Tool counts words, characters, sentences and paragraphs in one pass, states the counting rule behind every figure, and shows which words the text repeats most.",
    content:
      "This word count tool reports the figures a submission window, an abstract limit or a caption cap actually asks for, and it explains the rule behind each one. Counting follows Unicode word boundaries, the same segmentation a browser uses when you double-click a word, so the total matches what a word processor would report rather than a rough estimate. A word counter is only useful if its rule is stated, which is why the behaviour of numbers, hyphens and abbreviations is described on the page instead of hidden in a footnote.\n\nThe headline figures sit in one panel: words, characters, sentences and paragraphs, plus the longest word, the unique words and reading and speaking times. Reading time is modelled at 220 words per minute and speaking time at 130 words per minute, the same defaults used by the Reading Time Estimator, which lets you change the rates when your material is denser or lighter than average. Every number comes from a single pass over the same token stream, so the panels can never disagree with each other.\n\n- Words, characters, sentences and paragraphs, each counted from the same token stream.\n- Unique words, counted case-insensitively, and the longest word in the text.\n- Reading time at 220 words per minute and speaking time at 130 words per minute, formatted as minutes and seconds.\n- A most-used words table with the counts behind each row.\n- A hide function words toggle that excludes the, of, and and similar closed-class words from the table.\n- Copy counts and Download counts produce a plain-text summary of every figure.\n\nThe counter is built on Intl.Segmenter, the platform Unicode text segmentation API, with a regular-expression fallback for engines that lack it. Numbers count as words, so 2026 and 10,000 each count once. Hyphenated compounds count as single words because segments joined by an intra-word hyphen are re-joined, matching word-processor behaviour. Apostrophes stay inside the word, so contractions count once. Standalone punctuation and standalone emoji are not words at all. Analysis is debounced, so a long document settles a fraction of a second after you stop typing rather than stuttering on every keystroke.\n\n- Abbreviations followed by a period start a new sentence segment, so initialled names and titles can inflate the sentence count even when a reader sees one sentence.\n- Languages without spaces between words are counted by word-like segments, which is a useful approximation rather than a dictionary word count.\n- The frequency table ignores case when grouping, so a word at the start of a sentence and the same word mid-sentence share one row.\n- Very long documents can take a moment before the figures settle, because the analysis waits for a pause in typing.\n- Counts describe the pasted text only; there is no file import, and nothing leaves the browser.\n\nTwo habits make the numbers more useful. First, decide what you are counting before you paste: a progress log wants the whole document, while a submission form usually wants a specific section, and pasting just that section gives its figures with no configuration. Second, use the frequency table as an editing tool rather than a curiosity: the most-used list makes a draft's favourite words visible, and the hide function words toggle lets you decide whether connectors deserve a place in that list.\n\nReach for the word count tool when you need to count words against a hard boundary: a submission window, an abstract limit, a manuscript on its way out, a platform that caps a caption. Copy counts when the figure has to go into a form, and Download counts when you want a record of the version you measured. For the same text expressed in characters rather than words, the companion counters in this domain break the figure down further.",
    howTo: [
      { step: "Paste or type your text into the input panel; the counts update as you type and settle after a short pause." },
      { step: "Read the Counts panel for words, characters, sentences, paragraphs, unique words and the reading and speaking times." },
      { step: "Toggle hide function words to switch the frequency table between content words and every word." },
      { step: "Use Copy counts or Download counts to export the plain-text summary of every figure." },
    ],
    whenToUse:
      "Reach for the word count tool when a number is a hard boundary: a submission window, an abstract limit, a manuscript on its way out. When the text must fit a character limit instead, the {{character-count-tool|Character Count Tool}} breaks the count down by spaces, code points and bytes, and the {{reading-time-estimator|Reading Time Estimator}} turns the same word count into minutes at a rate you can change. To see which words the count is made of, the {{keyword-density-analyzer|Keyword Density Analyzer}} ranks terms by density, while the {{sentence-count-tool|Sentence Count Tool}} shows how those words are distributed across sentences.",
    faqs: [
      {
        q: "Does the word count match Microsoft Word?",
        a: "It matches for most prose, because both count hyphenated compounds as one word and keep apostrophes inside words. Differences appear around abbreviations and around text pasted from web pages, where hidden markup can change the segments. The page states the counting rule, so any figure can be checked by hand.",
      },
      {
        q: "Are numbers counted as words?",
        a: "Yes. Any word-like segment counts, so 2026, 10,000 and 3.5 each count once. Standalone punctuation and standalone emoji do not count at all.",
      },
      {
        q: "Why do my reading and speaking times differ from another tool?",
        a: "The defaults here are 220 words per minute for silent reading and 130 for speaking aloud, and both are editable in the Reading Time Estimator. A tool using different rates will report different times even when the word count agrees.",
      },
      {
        q: "Can I count only part of a document?",
        a: "Yes. Paste just the section you need counted; the figures describe exactly the text in the box. Selecting a chapter and pasting it gives that chapter's counts without any extra configuration.",
      },
      {
        q: "Is my text uploaded anywhere?",
        a: "No. Counting runs in the browser with JavaScript, there is no account and no server call, and the text disappears when the tab closes.",
      },
    ],
  },

  "character-count-tool": {
    keywords: [
      "character count tool",
      "character counter",
      "count characters",
      "user-perceived characters",
    ],
    intro:
      "The Character Count Tool counts your text the way different systems do — code units, code points, user-perceived characters and UTF-8 bytes — and shows which platform limits it fits.",
    content:
      "A character count is never one number. A textarea length limit counts UTF-16 code units, a database column counts UTF-8 bytes, and a reader counts what they see: letters, accents and emoji. This character count tool reports all of those figures side by side, so you can match the number to the rule the destination actually applies. A character counter that shows only one total forces you to guess which one a form is enforcing. Paste text to count characters here and all the plausible rules are answered on one screen.\n\nThe main panel shows characters with spaces, characters without whitespace, user-perceived characters as grapheme clusters, Unicode code points and UTF-8 size in bytes, alongside letters, digits, punctuation, symbols, whitespace characters and paragraphs. The Fits in panel compares the same text against six real limits: an X or Twitter post at 280 characters, an SMS segment at 160, a meta description at 155, an SEO title tag at 60, an Instagram caption at 2,200 and a LinkedIn post at 3,000. Each row shows the percentage used and turns red once the text is over the limit.\n\n- Characters with spaces, counted in UTF-16 code units, the unit a textarea maxlength enforces.\n- Without whitespace, plus letters, digits, punctuation, symbols and whitespace characters counted by Unicode category.\n- User-perceived characters as grapheme clusters, where an accented letter or a skin-tone emoji counts once.\n- Unicode code points, which differ from code units only for characters outside the Basic Multilingual Plane.\n- UTF-8 size in bytes, the figure a database column or an API payload limit will enforce.\n- Platform fit checks for X posts, SMS segments, meta descriptions, SEO title tags, Instagram captions and LinkedIn posts.\n\nThe counts are computed locally with JavaScript string primitives and the TextEncoder API. Length in code units comes straight from the string; code points come from iterating the text by code point; grapheme clusters come from Intl.Segmenter, so combining accents, zero-width joiners and emoji modifiers collapse into one user-perceived character. UTF-8 bytes are measured with TextEncoder when the runtime provides it. No upload, no account and no server round trip: the analysis runs in the page and the text disappears when you close the tab.\n\n- Code-unit counts differ from what a reader perceives whenever the text contains emoji or characters outside the Basic Multilingual Plane.\n- Grapheme cluster counts depend on the platform's segmentation tables, so an uncommon emoji sequence might count differently in an older browser.\n- The platform limits are the published figures at the time of writing; a service can change them without notice.\n- Paragraph counts treat blocks separated by blank lines as separate, following word-processor convention rather than HTML conventions.\n- The tool measures pasted text and does not strip HTML or Markdown markup, so pasting formatted source counts the tags too.\n\nReach for this character counter when a limit is expressed in characters and the failure mode is a truncated post, a rejected payload or a cut-off meta description. Paste the text, read the count that matches the destination's rule — the Fits in panel names which one to use — and edit until the bar turns back to normal. When the limit is a file size rather than a field length, the UTF-8 size figure is the one to watch, because accented letters and emoji occupy more bytes than their character count suggests.\n\nCopy counts or Download counts when the measurement needs to be recorded or pasted into a form. The count pair is worth reading together with the word count: a tweet is limited by characters, an essay by words, and a page that must satisfy both is easiest to check with both tools open. For the same text measured in words, the sibling counter in this domain applies the label instead of the character rule.",
    howTo: [
      { step: "Type or paste your text; the counts update as you type, including emoji and accented characters." },
      { step: "Read the Character counts panel for code units, graphemes, code points, UTF-8 bytes and per-category counts." },
      { step: "Check the Fits in panel to see the percentage of each platform limit the text uses and whether it overflows." },
      { step: "Use Copy counts or Download counts to export the full breakdown as plain text." },
    ],
    whenToUse:
      "Use the character counter when a limit is expressed in characters and a truncated post, a rejected payload or a cut-off meta description is the failure mode; the Fits in panel names the destination rule to match. For word-level limits the {{word-count-tool|Word Count Tool}} is the right count, the {{reading-time-estimator|Reading Time Estimator}} answers how long the same text takes to read, and the {{keyword-density-analyzer|Keyword Density Analyzer}} shows repetition, which is the other reason a page gets shortened.",
    faqs: [
      {
        q: "Which character count should I use for an X or Twitter post?",
        a: "The Fits in panel uses the code-unit count, the same unit the platform composer enforces. Check the X or Twitter post row and keep the percentage under 100.",
      },
      {
        q: "Why do code points and user-perceived characters differ?",
        a: "Emoji and characters outside the Basic Multilingual Plane take two UTF-16 code units but are one code point, and a combining sequence can be several code points but one grapheme. The tool shows all three so you can match the rule you are held to.",
      },
      {
        q: "Does the tool count emoji as characters?",
        a: "Yes. An emoji counts once in user-perceived characters, once or twice in code points depending on whether it sits outside the Basic Multilingual Plane, and more in UTF-8 bytes.",
      },
      {
        q: "What is UTF-8 size and when does it matter?",
        a: "It is the byte length a database column, an SMS gateway or an API payload limit actually enforces. Accented letters and emoji take more bytes than ASCII characters, so a short message can still exceed a byte limit.",
      },
      {
        q: "Are newlines and spaces counted?",
        a: "Characters with spaces includes every code unit, line breaks included. Without whitespace removes them, and the whitespace characters figure reports how many were removed.",
      },
    ],
  },

  "reading-time-estimator": {
    keywords: [
      "reading time estimator",
      "reading time",
      "words per minute",
      "speaking time",
    ],
    intro:
      "The Reading Time Estimator turns a word count into minutes and seconds at a rate you can see and change, with a comparison table at slow, average and fast speeds.",
    content:
      "Reading time is arithmetic: word count divided by a rate. The only honest way to present it is to show both numbers, which is what this reading time estimator does. Paste a script, an article or a speech, and the estimate updates as you type, with the words per minute used to produce it always on screen. An estimate that hides its rate is a guess wearing a number; this one lets you audit the division.\n\nThe defaults are 220 words per minute for silent reading and 130 words per minute for speaking time aloud, the figures most publishing style guides quote for adult prose and a comfortable delivery pace. Both are editable inputs, so dense technical material can be timed at 150 and light prose at 300 without the tool pretending the text changed length. Under the headline times you get the inputs the estimate rests on — words, sentences and paragraphs — all from the same counting engine used across this domain, plus a table that shows the same text at three reference speeds.\n\n- Reading time at an editable words-per-minute rate, defaulting to 220.\n- Speaking time at an editable rate, defaulting to 130 words per minute for delivery aloud.\n- A comparison table at three reference rates: a slow reader at 150 words per minute, an average adult at 220 and a fast reader at 300.\n- Input figures — words, sentences and paragraphs — so the arithmetic can be checked by hand.\n- Copy times produces a plain-text summary of every figure.\n\nThe estimator divides the tokenized word count by the rate and formats the result as seconds, minutes and hours. Word segmentation goes through Intl.Segmenter with a regular-expression fallback, the same rule the Word Count Tool applies, so the word figure here always matches the one there. Times are recomputed on every keystroke after a short debounce, which keeps long documents responsive instead of re-rendering on every character. Everything runs in the browser: nothing is uploaded and nothing is logged.\n\n- Silent reading speed varies enormously between people and between texts, so any single figure is a convention rather than a measurement.\n- Pauses are not modelled: headings, figures, tables and code blocks make a real read take longer than the arithmetic suggests.\n- Speaking rates assume continuous delivery; slides, demos and audience reactions push recorded or presented time upward.\n- The reference table uses rounded published averages, not measurements of your audience.\n- Estimates describe the pasted text only, so a partial draft produces a partial time.\n\nTwo habits keep the estimate honest. Lower the rate for technical, legal or second-language material, and raise it for light prose; the editable field exists precisely so the number can match the audience rather than a generic average. And when only part of a document is finished, paste that part instead of the whole outline, because the estimate should describe text that actually exists.\n\nUse the reading time estimator when time is the constraint: promising a reading time on an article, fitting a script into a segment, planning a lesson around a passage, or checking that a speech fits its slot. A five-minute result at 220 can become over seven minutes at 150, and knowing that range is what prevents an overrun during recording or presenting. When the constraint is a word or character limit instead, the counters in this domain answer that question directly.",
    howTo: [
      { step: "Paste the text you want to time — a blog post, a script or a speech — into the input panel." },
      { step: "Adjust the reading speed and speaking speed fields if your material or audience differs from the defaults." },
      { step: "Read the Estimated time panel for the reading and speaking times and the input figures behind them." },
      { step: "Check the At other reading speeds table for the same text at 150, 220 and 300 words per minute, or copy the times." },
    ],
    whenToUse:
      "Use the reading time estimator when time is the constraint: promising a reading time on an article, fitting a script into a segment or checking that a speech fits its slot. When the constraint is words or characters, the {{word-count-tool|Word Count Tool}} and the sentence count reported by the {{sentence-count-tool|Sentence Count Tool}} answer that directly. The {{average-word-length-calculator|Average Word Length Calculator}} explains why a dense passage reads slower than its word count suggests.",
    faqs: [
      {
        q: "What reading speed does the tool assume?",
        a: "220 words per minute by default for silent reading and 130 for speaking aloud. Both are editable, and the comparison table also shows 150 and 300 as slow and fast reference paces.",
      },
      {
        q: "Should I lower the reading speed for technical content?",
        a: "Yes. Dense, unfamiliar or second-language material is read more slowly than the 220 convention, so entering 150 or 180 gives a more honest figure. The editable rate exists so the estimate can match the audience.",
      },
      {
        q: "Does the estimate include time for images or tables?",
        a: "No. The model times words only; pauses for figures, tables, code and ads are not included, so real reading time on a media-heavy page is longer than the number shown.",
      },
      {
        q: "How is the number calculated?",
        a: "Word count divided by the rate you set, formatted as minutes and seconds. The word count comes from the same Unicode tokenizer used by the Word Count Tool, so the two pages never disagree.",
      },
      {
        q: "Is speaking time the same as reading time?",
        a: "No, they use separate rates. Speaking aloud defaults to 130 words per minute because delivery is slower than silent reading, which is why scripts and speeches should be timed with the speaking figure.",
      },
    ],
  },

  "sentence-count-tool": {
    keywords: [
      "sentence count tool",
      "sentence counter",
      "count sentences",
      "average words per sentence",
    ],
    intro:
      "The Sentence Count Tool counts sentences, reports the average words per sentence, and lists each sentence with its word count so outliers stand out.",
    content:
      "Sentence length is the simplest measure of whether prose is readable, and a sentence count is where that measurement starts. This sentence count tool splits the text into sentences with Unicode sentence boundaries, and the summary reports the average words per sentence alongside the longest and shortest. The list below is the working part: every sentence appears with its own word count, so the 58-word sentence is visible in a list of 12-word ones rather than hidden inside an average.\n\nUse it to count sentences when the question is shape rather than volume. The summary panel gives total sentences, total words, the average words per sentence, and the longest and shortest sentences in the text. Average sentence length in English nonfiction usually sits between 15 and 25 words; a run well above that is a candidate for splitting, and one well below can read as choppy. The list shows the first 25 sentences with their word counts and states how many further sentences were counted but not listed, so long documents stay responsive without losing the totals.\n\n- Total sentences and total words from the same token stream.\n- Average words per sentence, the summary figure most style guides care about.\n- Longest and shortest sentence with their lengths.\n- A per-sentence list, capped at the first 25 rows, each showing that sentence's word count.\n- Copy summary produces a plain-text version of every figure.\n\nSentence segmentation goes through Intl.Segmenter, which implements the Unicode sentence-boundary rules used by browsers and word processors, with a regular-expression fallback for engines without it. That rule is deliberately mechanical: a period after an abbreviation followed by a capital is a boundary, so a name and its sentence can split into two segments. The alternative — a hand-tuned abbreviation list — would be more accurate for English and less predictable for every other language, so the tool states the rule it applies instead of hiding it.\n\n- Abbreviations followed by a period split sentences, so initials, titles and Latin abbreviations can inflate the count.\n- Only the first 25 sentences are listed; the totals still cover the whole document.\n- Very long texts settle after a short pause because the analysis is debounced.\n- The count is rule-based, not semantic: a missing full stop merges two sentences into one segment.\n- Very short segments may be headings, list items or captions rather than prose, and they still count.\n\nA sentence counter is most useful as a source of outliers. Read the list first and the total second: the average changes slowly, but one sentence twice the length of its neighbours is exactly the thing an editor would mark, and it appears in the list with its length attached. Combining that list with the whole-document totals is the pattern most style guides describe when they talk about varied sentence rhythm.\n\nPair the sentence count with a word count when judging readability, because the same 500 words in 12 sentences reads very differently from the same 500 in 30. When time rather than shape is the question, the Reading Time Estimator shares the same word count and converts it into minutes, and the word-length side of difficulty is covered by its own calculator in this domain. For a rhythm check across a whole document, note the longest sentences first and the average second, because the average hides exactly the outliers that make prose feel uneven.",
    howTo: [
      { step: "Paste your text into the input panel; the sentence and word counts update as you type." },
      { step: "Read the Counts panel for total sentences, average words per sentence, and the longest and shortest sentences." },
      { step: "Scan the sentence list, capped at the first 25 rows, to find the outliers worth splitting." },
      { step: "Use Copy summary to export the figures as plain text." },
    ],
    whenToUse:
      "Use the sentence count tool to judge shape rather than volume: finding the sentence that should have been three, or checking whether a rewrite actually shortened the prose. Pair it with the {{word-count-tool|Word Count Tool}} for the whole-document count and with the {{average-word-length-calculator|Average Word Length Calculator}}, since sentence length and word length together explain most of a text's reading difficulty. When the question is time rather than shape, the {{reading-time-estimator|Reading Time Estimator}} converts the same counts into minutes.",
    faqs: [
      {
        q: "Why does the count treat a title abbreviation as a sentence boundary?",
        a: "The tool applies Unicode sentence-boundary rules, which treat a period followed by a capital as an ending. Disabling that rule for known abbreviations would improve English and degrade every other language, so the rule is stated instead.",
      },
      {
        q: "Why are only 25 sentences listed?",
        a: "The preview is capped so long documents stay responsive. The totals, averages and extremes still cover the whole text, and the list notes how many further sentences were counted.",
      },
      {
        q: "What is a normal average words per sentence?",
        a: "English nonfiction usually averages 15 to 25 words per sentence. Above 30 is where splitting usually helps, and below 10 often reads as choppy; both are clues to look at, not rules to obey.",
      },
      {
        q: "Does the count include headings and list items?",
        a: "Yes if they end in terminal punctuation. A heading without a full stop may merge with the following sentence, which is one reason the per-sentence list is worth reading rather than trusting the total alone.",
      },
      {
        q: "Can I copy the figures?",
        a: "Yes, Copy summary produces a plain-text version of the sentence total, word total, average, and the longest and shortest sentences.",
      },
    ],
  },

  "average-word-length-calculator": {
    keywords: [
      "average word length",
      "word length calculator",
      "median word length",
      "word length distribution",
    ],
    intro:
      "The Average Word Length Calculator reports the mean and median word length and plots the distribution, so long technical vocabulary is visible rather than averaged away.",
    content:
      "Average word length sits between a plain word count and a full readability score. It answers a simple question: are the words in this text short and direct, or long and technical? This word length calculator computes the mean and the median, names the longest and shortest words, and charts the word length distribution so you can see the shape rather than trusting one number to represent it.\n\nLength is measured in user-perceived characters, so accented letters count once and an emoji counts once regardless of how many code points it uses. The mean is the arithmetic average across every word; the median word length is the middle value once the words are sorted, and it is the more robust figure when a handful of long technical terms would otherwise drag the mean upward. A mean of 5.2 with a median of 4.6 tells a different story from a mean and median that agree, which is why both are shown side by side.\n\n- Average word length in grapheme clusters, the headline figure.\n- Median word length, kept as the less sensitive twin of the mean.\n- Longest and shortest words with their lengths.\n- Total words and total letters across all words.\n- A distribution histogram in one-character buckets, with everything longer than 15 characters folded into the final column.\n\nWords come from the shared Unicode tokenizer, and length is counted in grapheme clusters through Intl.Segmenter, which is why accented letters and emoji count as single characters. The histogram counts each token once and buckets it by length; because the bucket heights are raw counts, they can be checked against the total word figure on the same panel. Everything is computed locally in the page, with no upload and no account, and the results update after a short debounce while you type.\n\n- Mean length is pulled upward by a single long term; the median is the figure to trust on short texts.\n- Distribution buckets fold every word longer than 15 characters into one column, so the tail loses detail.\n- A token that is long because two words were joined without a space is counted as one long word.\n- Non-English and transliterated vocabulary can sit outside the usual English bands.\n- The measurement describes vocabulary weight only; it is not a readability score or a quality judgement.\n\nTypical figures provide the reference points. Everyday English prose averages between four and five characters per word, academic and legal writing often lands between five and six, and marketing copy written for scanning tends to sit near four. None of these are targets, but they make an outlier obvious in either direction. The word length distribution is where the useful signal lives: a normal distribution peaks at three to four characters and tails off, while a distribution with a fat tail past ten characters is a text full of nominalisations and imported jargon.\n\nUse this calculator when vocabulary weight is the question: checking that a plain-language rewrite actually shortened the words, comparing a technical document against its simplified version, or finding the accidental concatenation that is throwing off an average. Frequency is the complementary view — the Word Count Tool shows which words repeat, while this page shows how long they are — and reading difficulty is covered by the scored indices in the same family of tools.",
    howTo: [
      { step: "Paste your text into the input panel; the length figures update as you type." },
      { step: "Read the Word length panel for the average, median, longest and shortest words, plus the word and letter totals." },
      { step: "Check the distribution histogram to see how much of the text sits in the long-word tail." },
      { step: "Use Copy summary to export the figures as plain text." },
    ],
    whenToUse:
      "Use this word length calculator when vocabulary weight is the question: checking that a plain-language rewrite shortened the words, or finding the accidental long word that is throwing off an average. It pairs with the {{sentence-count-tool|Sentence Count Tool}}, since sentence length and word length together drive readability, and with the {{reading-time-estimator|Reading Time Estimator}} when you need the time implication. For variety rather than length, the {{vocabulary-richness-scorer|Vocabulary Richness Scorer}} measures how many different words a draft uses.",
    faqs: [
      {
        q: "What is a normal average word length in English?",
        a: "Everyday prose sits around four to five characters per word, academic and legal writing around five to six, and scan-friendly copy nearer four. These are bands for comparison, not targets.",
      },
      {
        q: "Why show the median as well as the mean?",
        a: "A few very long technical terms pull the mean upward. The median is the middle word's length once all words are sorted, so it stays stable and shows what a typical word actually looks like.",
      },
      {
        q: "Are emoji and accented letters counted as one character?",
        a: "Yes. Length is counted in grapheme clusters, so an accented letter counts once and an emoji counts once, regardless of how many code points or code units the text uses.",
      },
      {
        q: "Why is my longest word longer than anything I wrote?",
        a: "Two words joined without a space, a pasted URL fragment or a hyphen removed by cleaning are the usual causes. The longest-word readout is the quickest way to find it.",
      },
      {
        q: "Does a higher average mean worse writing?",
        a: "Not by itself. Long words can be precise or simply inflated, and the distribution shows whether the long terms are a consistent style or a thin tail of jargon.",
      },
    ],
  },

  "number-format-checker": {
    keywords: [
      "number format checker",
      "thousands separator",
      "decimal separator",
      "number consistency",
    ],
    intro:
      "The Number Format Checker scans a document for numeric tokens, works out how each one is punctuated, and reports ten kinds of inconsistency — from mixed decimal separators to unit spacing — before offering a one-convention rewrite.",
    content:
      "A report that writes 1,234.56 in one paragraph and 1.234,56 in the next asks every reader to interpret two conventions at once, and an international reader may read them as different values. This number format checker scans a document, works out how each number is punctuated, and reports the genuine inconsistencies in plain language — the decimal separator, the thousands separator, and the rest of the conventions listed below — because number consistency is a property of the whole document.\n\n- Mixed decimal separators: both a comma and a full stop used as the decimal mark.\n- Mixed thousands grouping: both marks used to group digits.\n- Ambiguous values such as 1.500, which is fifteen hundred under grouping and one and a half under a decimal reading.\n- Irregular grouping: any grouping that is not the standard three-digit pattern, with Indian lakh and crore grouping labelled informational.\n- Ungrouped large numbers of five digits or more, which are hard to check at a glance.\n- Percent spacing: 50% in some places and 50 % in others.\n- Currency placement: symbols appearing both before and after amounts.\n- Mixed currencies in one document, reported so the amounts are not compared without a conversion rate.\n- Unit spacing per unit: 5kg beside 5 kg.\n- Number ranges using both a hyphen and an en dash.\n\nEach numeric token is matched by one pattern that allows a leading currency symbol or ISO code, a sign, grouping separators of comma, full stop, apostrophe, space or the narrow spaces, an optional decimal part, an optional percent sign and an optional unit from a curated list of about 55 entries covering length, mass, volume, time, screen units, temperature, data, frequency and power. The parser then tests two readings: every separator is grouping, or the last separator is decimal. When both readings are legal, as with 1.500, the token is reported as ambiguous and resolved as grouping for the value column, and the interpretation table shows the reading that was used so nothing is decided silently. Irregular grouping, ungrouped numbers, percent and currency placement, mixed currencies, unit spacing and range dashes are detected across the whole document rather than per token, so each is reported once. The rewrite walks the parsed numbers and rebuilds them in one of three conventions — US and UK with 1,234,567.89, European with 1.234.567,89, or SI and French with narrow spaces — preserving currency symbols, signs, percent signs and units exactly where the author put them. Numbers written without separators and four digits or shorter are left alone, because regrouping a year into 2,026 changes what the sentence says.\n\n- The rules are heuristic and carry no locale knowledge. The tool cannot know which convention your document intends; it reports the mixture and lets the rewrite apply the one you choose.\n- Ambiguity is reported rather than resolved. The value column picks the grouping reading for display, and the finding says both readings are legal.\n- The unit list is curated. A unit outside it is not checked for spacing consistency, and a recognised symbol can appear in a context that is not a measurement.\n- Whole-document checks report once each, so they tell you that a mixture exists rather than listing every instance.\n- The rewrite changes digit punctuation only. It never converts currencies, never regroups years or small counts, and never touches the words around a number.\n\nUse the checker before publishing anything assembled from several sources or written by someone using a different locale. Copy rewritten text or Download applies one convention to the figures while leaving every other character as the author wrote it, and the interpretation table is the audit trail if a number was read differently from how you meant it.",
    howTo: [
      { step: "Paste the document that contains numbers; the scan runs as you type." },
      { step: "Read the issues list first, since each finding names the kind of problem and quotes the context." },
      { step: "Check the interpretation table for any number marked ambiguous or irregular and confirm the value column matches what you meant." },
      { step: "Choose a convention under Rewrite numbers in, then Copy rewritten text or Download and compare it with the original." },
    ],
    whenToUse:
      "Use the checker on documents that mix sources: a report assembled from several contributors, a translation handed between teams, or a dataset description written in another locale. It is also the fastest way to audit a document for the specific ambiguity of a number such as 1.500.\n\nWhen a single value needs to be rendered correctly for one locale rather than audited across a document, the {{number-locale-formatter|Number Locale Formatter}} shares the same parsing rules, and the {{locale-date-formatter|Locale Date Formatter}} covers the equivalent conventions for dates. When the mixed convention is a spelling rather than a figure, the {{consistent-spelling-checker|Consistent Spelling Checker}} answers that question the same way.",
    faqs: [
      {
        q: "Why does the interpretation table show 1.500 as fifteen hundred?",
        a: "Because both readings are legal and the table has to pick one for its value column. The tool marks the token ambiguous and reports that a decimal reading is possible in other locales; nothing is silently corrected.",
      },
      {
        q: "Which numbers are left untouched by the rewrite?",
        a: "Numbers written without separators and four digits or shorter, such as years and small counts. Regrouping 2026 into 2,026 would change the meaning, so the rewrite leaves them exactly as written.",
      },
      {
        q: "How is Indian grouping such as 1,23,456 treated?",
        a: "It fails the standard three-digit pattern, so it is reported as irregular grouping with an informational note, because lakh and crore grouping is valid in locales that use it.",
      },
      {
        q: "Which units does the checker recognise?",
        a: "A curated list of about 55 units covering length, mass, volume, time, screen units, temperature, data, frequency and power — for example kg, mm, px, GB, °C and %. Spacing is checked per unit, so 5kg beside 5 kg is a finding.",
      },
      {
        q: "Does the checker convert between currencies?",
        a: "No. When more than one currency appears it reports that fact so the amounts are not read as directly comparable, but no exchange rate is applied and no value is converted.",
      },
    ],
  },
};
