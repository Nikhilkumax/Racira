import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B7, language group: authored SEO entries for the language detector, the
 * character encoding converter and the text expansion estimator. Keys are
 * registry slugs; see ../tool-seo.ts for the contract these entries are
 * validated against.
 */
export const B7_LANGUAGE_SEO: Record<string, ToolSeo> = {
  "language-detector": {
    keywords: ["language detector", "language detection", "detect the language"],
    intro:
      "This language detector scores a sample against twelve hand-built Latin-script profiles and shows the evidence behind the answer — which function words, distinctive letters and word endings matched, and by how much the winner led.",
    content: `A language detector usually answers with a name and nothing else. This one shows its work: paste a sample and the text is scored against twelve Latin-script profiles — English, Spanish, French, German, Italian, Portuguese, Dutch, Swedish, Polish, Czech, Turkish and Finnish — and the full table is printed with the result.\\n\\nAll of the language detection here is arithmetic on three kinds of evidence a reader can inspect. Function words are the first: closed-class words a language cannot avoid, such as the, der, que and och. Distinctive letters are the second: ñ, ß, ı and ł belong to one orthography far more than to its neighbours. Word endings are the third: zione, ung and ção carry a language's shape even in a short fragment. Each matched function word is worth two points, each distinctive letter one and a half, and each ending one.\\n\\nThe weighting matters. Function words are the strongest signal in ordinary prose, letters survive in names and one-line labels where grammar cannot show, and endings rescue samples that are too terse for either. The score table lists every candidate language with its three evidence columns, so when English wins on the, and and of, you can see exactly why rather than take it on faith. There is no model, no training data and no network call: the profiles load lazily on this page only, and your text never leaves the browser.\\n\\nWhat the tool refuses to do is as important as what it does. Fewer than five words or twenty-four letters and it answers "not enough text" instead of offering the three least-bad guesses. Text that is mostly Cyrillic, Han, Arabic or another script is reported as unsupported rather than forced into a Latin profile. When the top two languages are close, the confidence band drops to medium or low and the notes name the runner-up, so a near-tie is labelled rather than hidden.\\n\\nThe language list is deliberately narrower than a full identifier could be. Closely related pairs — Danish and Norwegian, Slovak and Czech — share most of their function words, so a profile scorer cannot separate them with the same confidence it separates German from Spanish. Rather than add profiles that would amount to a coin toss, one member of each pair is included and the limits are stated on the page. Every profile is described in the source; adding a language means curating the same three kinds of evidence for it.\\n\\nRead the limits before you rely on the result. Proper nouns, loanwords and brand names can be mistaken for the language they look like; a single word is never enough, which is why short input is refused; text that switches language midway is scored as one sample; and transliterated or heavily misspelled text confuses any profile scorer. The detector says nothing about dialect, formality or quality. It answers one narrow question — which of twelve languages does this sample most resemble — and attaches the evidence.\\n\\nIn practice that covers the cases the tool exists for: checking a pasted paragraph to detect the language, triaging mixed-language content, or confirming that a translation is really in the language it claims. Read the confidence beside the name, then the evidence table below it. Where the answer matters legally or operationally, treat a medium or low result as a prompt to find a native reader rather than as a decision.`,
    howTo: [
      { step: "Paste a sentence or two of ordinary prose — five words and twenty-four letters is the minimum for a result." },
      { step: "Read the detected language and its confidence band; medium or low names the runner-up in the notes." },
      { step: "Check the evidence table: function-word hits are the strongest column, letters and endings support it." },
      { step: "Treat refused samples as refusals, not failures — add more text if you need a verdict." },
      { step: "Copy or download the report when you need the score table alongside the text." },
    ],
    whenToUse: `Use this detector when the question is what language a sample is written in, and reach for different tools when the question is about the text itself. The {{spell-checker|Spell Checker}} checks words against a real English dictionary once you know the sample is English, and the {{character-encoding-converter|Character Encoding Converter}} answers the adjacent question of what bytes the text is made of.\\n\\nIf a sample is refused as too short, a word-count tool will not help — the detector needs prose, not statistics.`,
    faqs: [
      {
        q: "Which languages can this detector tell apart?",
        a: "Twelve Latin-script languages: English, Spanish, French, German, Italian, Portuguese, Dutch, Swedish, Polish, Czech, Turkish and Finnish. The full profile list is shown on the page, and each result lists the score of every candidate.",
      },
      {
        q: "Why does it refuse to answer on short text?",
        a: "Because a profile scorer cannot honestly separate languages from a word or two: the? could be English, the same token appears in other languages' profiles, and a wrong answer stated confidently is worse than no answer. Fewer than five words or twenty-four letters returns 'not enough text'.",
      },
      {
        q: "Why are Danish and Norwegian not supported?",
        a: "They share most function words with each other and with Swedish, so a scoring approach would often be guessing. One language per close pair is included instead, and the limitation is stated rather than papered over with profiles that cannot be told apart.",
      },
      {
        q: "Can it identify text in Cyrillic, Han or Arabic script?",
        a: "It reports the script as unsupported rather than making a guess. Only Latin-script languages are profiled, so a Cyrillic or Han sample returns an explicit unsupported-script result with the dominant script named.",
      },
      {
        q: "Is my text uploaded for detection?",
        a: "No. The profiles are a data module loaded lazily on this page, and all scoring runs in the browser with client-side JavaScript. There is no server round-trip, nothing is stored, and the text disappears when the tab closes.",
      },
    ],
  },

  "character-encoding-converter": {
    keywords: ["character encoding converter", "encoding conversion", "utf-8 bytes"],
    intro:
      "This character encoding converter turns text into bytes and bytes back into text across eight encodings — UTF-8, UTF-16, UTF-32, Windows-1252, Latin-1 and strict ASCII — and reports every character a code page cannot carry.",
    content: `Most encoding tools hide their mapping behind the platform. This character encoding converter writes every codec out in the page bundle instead, so a byte you see is a byte you can verify: UTF-8, UTF-16 in both byte orders, UTF-32, Windows-1252, true ISO-8859-1 and strict US-ASCII. Nothing is delegated to a decoder label, because browser labels are not literal — a decoder asked for "latin1" or "ascii" actually returns Windows-1252. Here the label means what it says, and every encoding conversion the tool performs can be verified byte by byte.\\n\\nThe converter works in both directions. In text-to-bytes mode you paste a string, choose an encoding and read the result as hex pairs, Base64 or escaped \\xNN sequences, with a hex-dump table showing offsets and an ASCII preview. In bytes-to-text mode you paste hex, Base64 or escaped bytes, choose the encoding they are assumed to be in, and read the decoded text together with a count of any replacement characters. The two modes share the same codec, so a round trip is a real check: encode café — €10 and decode the result, and you get back exactly what you typed as long as the encoding can hold it.\\n\\nLossy encoding is where most tools quietly damage text, so this one reports it. Windows-1252 cannot hold an emoji, ISO-8859-1 cannot hold €, and strict ASCII cannot hold é; each unrepresentable character is written as a question mark and listed with its code point and position. The substitution is deliberate and visible, which also means the original cannot be recovered from the output — the page says so rather than implying the conversion was harmless.\\n\\nDecoding reports the other failure mode. Bytes that do not form valid text — a truncated UTF-8 sequence, an unpaired UTF-16 surrogate, an out-of-range UTF-32 value, a high byte in strict ASCII — become U+FFFD and are counted, so mojibake is explained rather than displayed as mystery characters. A UTF-8 byte order mark decodes as an ordinary character, and the converter never adds one, because a tool that silently inserts a BOM into generated bytes causes its own class of bugs.\\n\\nThe numbers are checkable by hand, which is the point of writing the mappings out. The UTF-8 bytes of é are C3 A9; the UTF-8 bytes of an emoji are four; a surrogate pair is four UTF-16 bytes; Windows-1252 puts € at 0x80 and the curly quotes at 0x91-0x94; Latin-1 maps byte to code point one to one. Those are standard facts, and the unit tests against them are part of the repository, so a regression in the mapping fails the build rather than shipping.\\n\\nWhat this is not: a file inspector, an encoding detector, or a repair tool. It converts a string you paste and shows you the bytes; it cannot look inside an uploaded file, infer an unknown encoding, or recover characters that were already replaced by question marks. It is also not encryption — an encoding is a mapping, not a secret. Everything runs locally in the browser, and no data is uploaded.\\n\\nUse it when you need to see exactly what your app is sending, to produce a byte sequence for a legacy system, to confirm which characters fit inside a fixed code page before a migration, or to work out why a string arrived as mojibake. The combination of an explicit codec, a visible byte table and honest lossy reporting makes the answer something you can paste into a bug report.`,
    howTo: [
      { step: "Choose a direction: text to bytes for encoding, bytes to text for decoding." },
      { step: "Pick the encoding — UTF-8 is the default; Windows-1252 and Latin-1 behave differently and the page describes each." },
      { step: "In encode mode, read the hex, Base64 or escaped output and check any replaced-character list." },
      { step: "In decode mode, paste bytes in the matching format and read the text plus its replacement count." },
      { step: "Copy or download the result; adjust the encoding if the byte count or the flag count surprises you." },
    ],
    whenToUse: `Use this converter when you need to see or produce concrete bytes, and reach for the neighbouring tools when the question is about characters rather than codecs. The {{unicode-text-normalizer|Unicode Text Normalizer}} handles composition and compatibility forms — the same visible text can have different code points — and the {{language-detector|Language Detector}} identifies which language a sample is in when the bytes decode correctly but you are unsure what it says.\\n\\nFor counting what a string contains before encoding it, the character count tool is the simpler first stop; come here when the byte level is the problem.`,
    faqs: [
      {
        q: "Which encodings can I convert between here?",
        a: "Eight: UTF-8, UTF-16 little- and big-endian, UTF-32 little- and big-endian, Windows-1252, true ISO-8859-1 (Latin-1) and strict US-ASCII. Each codec is written out in the bundle, so the mapping is the one the label states.",
      },
      {
        q: "Why did a character become a question mark?",
        a: "Because the chosen encoding cannot represent it. A question mark (0x3F) is written in its place and the character is listed with its code point and position, so the substitution is visible. It is one-way: the original character cannot be recovered from the bytes.",
      },
      {
        q: "Why is US-ASCII treated strictly in this tool?",
        a: "Many decoders accept the label 'ascii' but actually decode as Windows-1252, which silently accepts high bytes. Here bytes above 0x7F are invalid and become U+FFFD with a count, because that is what strict ASCII means and what the label promises.",
      },
      {
        q: "Does this detect the encoding of an uploaded file?",
        a: "No. It converts a string you paste into it, in the encoding you choose. Detecting an unknown file's encoding requires heuristics this tool does not claim to have; it will show you that bytes are invalid for a given codec, which is often the clue you need.",
      },
      {
        q: "Does a byte-order mark get added or removed?",
        a: "Neither. UTF-16 and UTF-32 output is written without a BOM, and a BOM in decoded input is treated as an ordinary character rather than stripped. The page states this because silent BOM insertion is a common source of bugs.",
      },
    ],
  },

  "text-expansion-estimator": {
    keywords: ["text expansion estimator", "text expansion", "character budget"],
    intro:
      "The text expansion estimator projects how long English interface strings become in seventeen target locales, using published planning ranges and showing every per-string estimate together with the arithmetic behind it.",
    content: `Translating an interface changes how much room the strings take, and this text expansion estimator turns that into planning numbers. Paste one English string per line, choose a target locale, and every line is projected as a range: source characters multiplied by the locale's low and high multipliers, with placeholders excluded from the expanding base and added back untouched. The range is the point — actual text expansion depends on the translator, the terminology and the tone, so the tool reports a band and shows the multipliers it used.\\n\\nThe multipliers come from common localization planning guidance and are listed for every locale on the page. German runs x1.20 to x1.35 because compound nouns can double the length of a short label; Finnish runs x1.25 to x1.40 because agglutination builds meaning into endings; French and Spanish sit around x1.15 to x1.25; the Nordic languages are usually close to English at x1.05 to x1.15. Contracting targets are included too: Japanese is x0.50 to x0.70, Chinese x0.40 to x0.60 and Korean x0.50 to x0.70, because character-based writing packs more meaning into fewer characters.\\n\\nPlaceholders are handled the way a localization runtime handles them: they are not translated, so {name}, {{count}}, %s and \${value} are measured separately, removed from the base that expands, and added back at their original length. Rounding is per line, and the totals are sums of the lines you can see, so the headline number can be recomputed from the table. Counting is by code point, which means an emoji counts once rather than twice.\\n\\nAn optional character budget turns the estimate into a design check. Enter the width of a button, a tab or a table column, and any line whose high estimate exceeds it is flagged as a possible overflow; the totals report how many lines are at risk. The estimator also flags short strings — fewer than ten translatable characters — because short labels expand proportionally more than averages suggest: Edit can become Bearbeiten, a 200% jump that no planning range predicts. Those rows are marked rather than silently trusted.\\n\\nWhat the tool cannot do is just as explicit. It does not translate anything, it has no glossary of your product's terms, and it cannot see your layout: it estimates character length, not pixel width, so proportional fonts, icon spacing and line wrapping are beyond it. The multipliers assume an English source; if your source is German or Japanese, the ranges no longer apply as written. And a range is not a measurement of your actual translator's output — it is the number to design with before that output exists.\\n\\nIn a release cycle the estimator fits before design freeze and before a string freeze. Run the strings that live in fixed-width places first — buttons, tabs, table headers, tooltips — and compare them against their budget. Then run the longer copy to see whether cards and dialogs need more room. Keep the report with the design ticket: it records the range you planned against and every line that was close to overflowing, which is exactly what a reviewer needs when the German build arrives longer than the mockup.`,
    howTo: [
      { step: "Paste one English interface string per line — buttons, tabs and labels first." },
      { step: "Choose the target locale; the select shows each locale's planning range." },
      { step: "Optionally enter a character budget to flag the strings likely to overflow it." },
      { step: "Read the per-string table: estimate range, percentage change, and any overflow or short-string flags." },
      { step: "Copy or download the report and keep it with the design ticket for the translation review." },
    ],
    whenToUse: `Use this estimator when the question is how much room translated text needs, and reach for different tools when the question is what the text contains. The {{character-count-tool|Character Count Tool}} measures the English source exactly, including spaces, and the {{language-detector|Language Detector}} identifies the language of a translated sample when you are checking a delivery.\\n\\nWhen the concern is byte length rather than character length, the {{character-encoding-converter|Character Encoding Converter}} shows what the same string costs once encoded.`,
    faqs: [
      {
        q: "Where do the expansion percentages come from?",
        a: "From commonly published localization planning ranges, listed per locale on the page: German x1.20 to x1.35, Finnish x1.25 to x1.40, Japanese x0.50 to x0.70, and so on. They are planning guidance, not measurements of any particular translation.",
      },
      {
        q: "How does the character budget flag an overflow?",
        a: "Enter a budget and a line is flagged when its high estimate exceeds it — the worst case within the locale's range. The totals report how many lines are at risk, which is what a fixed-width button or column needs before a string freeze.",
      },
      {
        q: "Why are short strings flagged as unreliable?",
        a: "Because proportional expansion works differently below about ten characters. A two-letter label can grow by 200% when it becomes Bearbeiten or Guardar, far beyond any average range. Those rows are marked as a warning so they are not read as firm estimates.",
      },
      {
        q: "Does the estimator translate the strings?",
        a: "No. It performs arithmetic on character counts using each locale's planning range. It contains no translation engine, no dictionary and no network call — the output is a length band with the multipliers shown, not translated text.",
      },
      {
        q: "How are placeholders treated in the estimate?",
        a: "They are excluded from the base that expands and added back unchanged. {name}, {{count}}, %s and \${value} are detected, counted and reported, so the estimate reflects the translatable text rather than the machinery around it.",
      },
    ],
  },
};
