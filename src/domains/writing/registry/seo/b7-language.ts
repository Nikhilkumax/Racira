import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B7, language group: authored SEO entries for the language detector, the
 * character encoding converter and the text expansion estimator. Keys are
 * registry slugs; see ../tool-seo.ts for the contract these entries are
 * validated against.
 */
export const B7_LANGUAGE_SEO: Record<string, ToolSeo> = {
  "language-detector": {
    keywords: [
      "language detector",
      "function words",
      "confidence",
      "Latin script",
    ],
    intro:
      "The language detector scores Latin-script text against 12 curated profiles using function words, distinctive letters and word endings, and shows the whole score table so the result can be checked rather than trusted.",
    content:
      "There is no language-identification model behind this language detector and no network call: the text is scored against curated profiles on three kinds of evidence, and every kind is printed so you can see why a language won. It is deliberately narrow, and it says so on the page rather than stretching into scripts and languages the profiles cannot cover.\n\n- Twelve curated Latin-script profiles, each carrying its own function words, distinctive letters and characteristic endings.\n- Function words — the closed-class words a language cannot avoid, such as the, der, que and och — count two points per occurrence.\n- Distinctive letters such as ñ, ß, ı and ł count one and a half points per occurrence.\n- Word endings such as zione, ung and ção count one point per word that uses one.\n- The score table lists every language with its total and its three evidence columns, so a result can be traced to the words that produced it.\n- Results carry the detected language, a confidence label, the word count and the count of Latin letters scored.\n- Copy report and Download language-detection.txt give the same table as plain text.\n- The report carries the evidence totals for the top languages, so two candidates can be compared without switching tabs.\n\nThe engine never invents a result. Short input is refused with a note that there is not enough text rather than guessed at; text in another script is reported as unsupported rather than forced into a Latin profile; and a close race between two languages lowers the confidence instead of hiding the ambiguity. The profiles are curated, which means closely related languages are deliberately narrowed to one profile per pair, and the limits are listed on the page: proper nouns, loanwords and one-word input can mislead any profile scorer, and a text that switches languages halfway through is scored as a whole. Because the scoring is a lookup against a fixed table with published weights, the same input always produces the same result, and the evidence columns mean the answer is auditable rather than merely asserted. The weights are fixed constants rather than tuned parameters, which is why the same sentence always lands in the same place in the table, and why a change in the result means a change in the text rather than in a model.\n\n- One profile per related pair: Swedish is profiled but not Danish or Norwegian, Czech but not Slovak, so a neighbouring language is often reported as its closest profile.\n- Short text is the weakest case: a handful of words can be dominated by a single loanword.\n- Non-Latin scripts are outside the profiles entirely and are reported as unsupported rather than misdetected.\n- A bilingual document is scored as one piece of text, so a translation pasted beside its source can split the score.\n- The result is a best match with a confidence label, not a claim about the writer.\n\nUse the detector as a first pass over text whose language you already suspect, not as a gate: read the evidence columns, and when two languages are close, treat the lower confidence as the honest answer. Then hand the text to the tool that needs the answer, such as the locale date formatter or the language-aware sort tool. If the top two languages share a script and a score, treat the detection as a question to answer by reading a paragraph rather than as a result to file.",
    howTo: [
      { step: "Paste or type the text; a sentence or two is enough for the detector to score it." },
      { step: "Read the detected language and the confidence label." },
      { step: "Open the score table and compare the three evidence columns across the top languages." },
      { step: "Copy report or Download language-detection.txt." },
    ],
    whenToUse:
      "Use the detector when you need a quick, inspectable read on which language Latin-script text is in. When the question is how the language will be rendered by the platform rather than what it is, the {{locale-date-formatter|Locale Date Formatter}} and the {{number-locale-formatter|Number Locale Formatter}} answer from the runtime's own locale data.\n\nWhen the text mixes directions rather than languages, the {{rtl-text-tester|RTL Text Tester}} reports what each paragraph's direction actually is.",
    faqs: [
      {
        q: "Is this a machine-learning language model?",
        a: "No. It is a scored lookup against 12 curated profiles with published weights: two points per function word, one and a half per distinctive letter and one per characteristic ending. The same input always produces the same score table.",
      },
      {
        q: "Why does it say there is not enough text?",
        a: "Because a short sample can be dominated by a single word. Rather than guess from two tokens, the detector refuses and says so, which is the more useful answer for anything you are about to publish.",
      },
      {
        q: "Why is Danish reported as Swedish?",
        a: "Because related languages are deliberately narrowed to one profile per pair. Swedish, Czech and a few others stand in for their neighbour, and the page lists the limits rather than pretending the profile set is exhaustive.",
      },
      {
        q: "What does the confidence label mean?",
        a: "It reflects the gap between the top score and the runner-up, not a probability. A close race lowers the label instead of hiding the ambiguity, so a low confidence is a genuine signal to read the table.",
      },
      {
        q: "Can it detect non-Latin scripts such as Arabic or Chinese?",
        a: "No. Those scripts are outside the curated profiles and are reported as unsupported. For direction rather than language, the RTL Text Tester and the Bidirectional Text Tester are the right tools.",
      },
    ],
  },

  "character-encoding-converter": {
    keywords: [
      "character encoding converter",
      "UTF-8",
      "code page",
      "byte offset",
    ],
    intro:
      "The character encoding converter moves text between eight encodings with in-house codecs, reporting every character a code page cannot represent instead of hiding it.",
    content:
      "Encoding bugs are quiet: a smart quote becomes a question mark, an accented letter becomes two, and nothing tells you where. This character encoding converter is written in-house precisely so that every byte it prints can be checked by hand against the label it claims. A code page is a mapping table, and the only way to be sure of a mapping is to be able to read it.\n\n- Eight encodings: UTF-8, UTF-16 little and big endian, UTF-32 little and big endian, windows-1252, iso-8859-1 and us-ascii.\n- Direction: encode text into bytes, or decode bytes back into text.\n- Byte output format and input format controls decide how the bytes are read and written.\n- Result figures: bytes produced, characters replaced, input characters and code points.\n- Lossy report: every unrepresentable character is listed with its source index, its code point and the byte offset where the question mark was written.\n- Replacement count: bytes that do not form valid text on decode become U+FFFD, and the count is shown.\n- Copy result and Download for the converted output.\n\nThe codecs are written out rather than delegated, and the reason is stated on the page: the platform's own label list is not what it looks like, because the WHATWG latin1 and ascii labels both decode through Windows-1252 in browsers. Writing each codec means iso-8859-1 really is Latin-1, where the byte value equals the code point, and us-ascii really stops at 0x7F. UTF-16 combines surrogate pairs on decode, UTF-32 reads one code point per character, windows-1252 includes the 0x80 to 0x9F block that carries the euro sign and the curly quotes, and UTF-8 replaces lone surrogates rather than emitting invalid bytes. No byte-order mark is added or expected: UTF-16 and UTF-32 output is bare, and a BOM in the input is decoded as an ordinary character, which the page states. The byte table is shown rather than summarised, with the offset column and the character counts beside it, so a mismatch can be traced to a single position in the stream.\n\n- A code page can only carry what it defines: everything else becomes a question mark and appears in the lossy report.\n- Decoding malformed bytes produces replacement characters instead of an error; the count says how many.\n- Without a byte-order mark, a UTF-16 or UTF-32 byte stream cannot be told from the other endianness by inspection alone.\n- The tool converts representations; it cannot recover information that a lossy encode already discarded.\n- Long inputs produce a long manual byte table, which is why decoding tends to be more readable than encoding for large files.\n- Byte formats are spelled out so a stream can be pasted and read, but very long inputs make the manual byte table hard to read.\n\nUse it when a file or a database field arrives with the wrong encoding: decode to find out where the damage starts, switch to the encoding that should have been used, and read the lossy report before you trust the result. The offset column is the part that turns a guess into a fix. Decode with the encoding that was wrongly assumed, read the offset, then encode with the one that should have been used.",
    howTo: [
      { step: "Choose whether you are encoding text into bytes or decoding bytes into text." },
      { step: "Choose the encoding; the input and output formats follow from that choice." },
      { step: "Paste the text or the byte sequence; the result and the lossy report update as you type." },
      { step: "Read the lossy or replacement list, then Copy result or Download." },
    ],
    whenToUse:
      "Use the converter when the problem is bytes: a file decoded as the wrong code page, a mangled import, or a stream that has to be checked byte by byte. When the bytes are fine and the problem is how text compares or stores, the {{unicode-text-normalizer|Unicode Text Normalizer}} handles normalization and invisible characters.\n\nWhen the bytes are fine but text sorts or renders oddly for a locale, the {{locale-aware-sort-tool|Locale-Aware Sort Tool}} and the {{rtl-text-tester|RTL Text Tester}} answer the layout questions instead.",
    faqs: [
      {
        q: "Why not use the browser's built-in decoders?",
        a: "Because their labels are misleading: the WHATWG latin1 and ascii labels both decode through Windows-1252 in browsers. The codecs here are written out so iso-8859-1 means Latin-1 and us-ascii means bytes up to 0x7F, exactly as labelled.",
      },
      {
        q: "What happens to a character the code page cannot represent?",
        a: "It is written as a question mark and reported in the lossy list with its source index and code point. The tool never silently drops a character, which is what makes a lossy conversion diagnosable.",
      },
      {
        q: "Why does decoding sometimes produce replacement characters?",
        a: "Because the bytes do not form valid text for that encoding — a truncated UTF-8 sequence, an unpaired surrogate or an out-of-range UTF-32 value. Each one becomes U+FFFD and the replacements are counted.",
      },
      {
        q: "Does the output include a byte-order mark?",
        a: "No, and none is expected on input. UTF-16 and UTF-32 output is bare, and a BOM you paste is decoded as an ordinary character, so it shows up in the character counts.",
      },
      {
        q: "Can I convert between two encodings directly?",
        a: "Yes, in two steps: decode the current bytes into text, then switch to the target encoding. The lossy report after the second step is the record of anything the target cannot carry.",
      },
    ],
  },

  "text-expansion-estimator": {
    keywords: [
      "text expansion estimator",
      "expansion range",
      "placeholders",
      "character budget",
    ],
    intro:
      "The text expansion estimator applies published expansion ranges to each English interface string so a layout can be planned for, with placeholders excluded and short strings flagged.",
    content:
      "Translating an interface changes how much room the strings take: German compounds run longer, Finnish agglutinates, and CJK text often shrinks. This text expansion estimator is the planning arithmetic for that problem and nothing more: each target locale carries a low and a high multiplier, the source string is measured in code points, and the estimate is reported with the range visible. Both ends of the range are printed because how much longer is a range, not a number.\n\n- One English string per line, so a whole screen's copy can be estimated at once.\n- Translate into: the target locale, each with its own published low and high expansion range and a note on why the language behaves that way.\n- Character budget per string: when set, the high estimate is checked against it and an over-budget flag is raised.\n- Estimate figures: low and high character counts for the whole set, the percentage change at each end, the over-budget count and the number of strings too short to trust.\n- Per-string detail: the row-by-row estimate for every line pasted.\n- The per-string table shows the base count and both ends of the range, so a single outlier is easy to spot.\n- Copy report and Download text-expansion.txt.\n\nThe arithmetic is deliberately simple and honest. Placeholders are never treated as translatable text: tokens such as {name}, percent-style and dollar-brace placeholders are measured separately, excluded from the base that expands, and added back unchanged, because a UI string's fixed parts should not be multiplied by a language's expansion factor. Strings shorter than ten translatable characters are flagged rather than silently trusted, since a two-letter label can grow by more than 200 percent in practice and a small absolute number hides that. The character budget turns the high estimate into an overflow flag, which is what a fixed-width button or a table column actually needs to know. What the numbers are not is equally important: they are not a translation and not a prediction for your specific copy, because real length depends on the translator, the terminology and the tone. The report keeps the range visible beside every figure for that reason: a single number would imply a precision the method does not have.\n\n- The ranges are planning guidance, wide on purpose; a specific translator can land outside them in either direction.\n- The estimate is measured in code points from the English source, not in rendered pixels, so font and weight still decide the final fit.\n- Placeholders are excluded from the expansion base, but their own length can still push a short string over a tight budget.\n- The tool estimates one source language; it cannot translate or verify a translation.\n- Very short strings are flagged, not corrected: they expand proportionally more and no multiplier fixes that.\n- The estimate assumes one line of text per string; a label that wraps is a layout problem the arithmetic cannot see.\n\nUse it before a layout is frozen: set the budget a real control allows, read the over-budget column, and treat the flagged short strings as the ones to test by hand. An estimate that arrives before the design does is worth more than an exact one that arrives after the strings are cut. Bring the over-budget list to the design review: it is the part of the report that changes a decision.",
    howTo: [
      { step: "Paste one English interface string per line." },
      { step: "Choose the target locale from the expansion list." },
      { step: "Set a character budget if the layout has a fixed width to respect." },
      { step: "Read the estimate, the over-budget and short-string counts, and the per-string detail, then copy or download the report." },
    ],
    whenToUse:
      "Use the estimator when a layout has to survive translation and the strings are not written yet. When the strings already exist in the target language and the question is their correct format rather than their length, the {{number-locale-formatter|Number Locale Formatter}} and the {{locale-date-formatter|Locale Date Formatter}} handle the embedded values.\n\nWhen a translated document's spelling conventions have drifted between variants, the {{consistent-spelling-checker|Consistent Spelling Checker}} reports the mix.",
    faqs: [
      {
        q: "Do the percentages predict my actual translation?",
        a: "No. They are published planning ranges, wide on purpose. Real length depends on the translator, the terminology and the tone, so the estimate is a design constraint rather than a forecast.",
      },
      {
        q: "Why are placeholders excluded from the count?",
        a: "Because a fixed token such as {name} is not translated and should not be multiplied by the language's expansion factor. It is measured separately, kept out of the expanding base, and added back unchanged.",
      },
      {
        q: "Why are short strings flagged?",
        a: "Because strings under ten translatable characters expand proportionally more: a two-letter label can more than double, and a small absolute number hides a large ratio. The flag says a human should check that row.",
      },
      {
        q: "What does the character budget do?",
        a: "It compares the high estimate with the limit you set and flags the strings that would overflow. That is exactly what a fixed-width button, tab label or table column needs to know before the design is final.",
      },
      {
        q: "Is the text I paste sent anywhere?",
        a: "No. The estimate is arithmetic on your input, run in the page, so a whole screen's unreleased copy can be pasted without it leaving the browser.",
      },
    ],
  },
};
