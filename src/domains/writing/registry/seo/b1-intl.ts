import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B1, internationalisation group: the date, number, direction and
 * collation tools. Keys are registry slugs; see ../tool-seo.ts for the contract
 * these entries are validated against.
 *
 * Every claim here matches what the components actually do: nothing is
 * hand-rolled, all formatting comes from `Intl`, and the caveats the tools show
 * on screen (ambiguous separators, abbreviation sentence rules, invisible
 * characters) are repeated in the copy rather than hidden.
 */
export const B1_INTL_SEO: Record<string, ToolSeo> = {
  "locale-date-formatter": {
    keywords: ["locale date formatter", "date format by locale", "format dates"],
    intro:
      "Format a date and time the way a chosen locale and time zone actually write it, with the ISO 8601 value and the UTC equivalent alongside so you can check the same instant from more than one angle.",
    content: `A date written as 09/03/2026 is March in Britain and September in the United States, and neither reader is being careless. The Locale Date Formatter removes that ambiguity by rendering one instant the way a specific locale writes it, and by showing the machine-readable ISO 8601 value next to the human one. The date format by locale is not a table someone typed by hand here: it comes from the locale data your browser ships and is read through Intl.DateTimeFormat, so the output is exactly what the platform produces rather than an approximation of it.\\n\\nThe four date presets map to the standard style names. Full writes the weekday out in words, long adds the month name in full, medium abbreviates the month, and short falls back to digits. The time presets work the same way, from a bare hour and minute up to a style that includes the time zone name, plus a No time option for dates that should never carry a clock. Changing the locale while keeping the date fixed is the fastest way to see how much the order of day, month and year really differs.\\n\\nTime zones are handled separately from the locale, which matters more than people expect. The input is a local wall clock with no zone attached to it, and the tool interprets it in the zone you select — your own by default. That is why a submission deadline entered as midnight can render as the previous day in a zone behind yours. The output panel names the zone it used and shows the offset, and a UTC row shows the same instant in the reference zone, so the shift is visible instead of surprising.\\n\\nBelow the formatted result, the tool lists the date piece by piece using formatToParts: year, month, day, weekday, hour, minute, second, the day-period marker and the zone name. That breakdown is the honest explanation of why Japanese output appears in a year-month-day order with its own unit characters, and why an English short date can drop the year entirely when the locale considers it optional. Reading the parts also makes it easy to spot a field that came out empty because the options did not ask for it.\\n\\nTwo extra rows are there for practical use. The ISO 8601 value is the same instant written in a fixed, sortable form that spreadsheets, databases and APIs accept without interpretation, which is the format to store even when the screen should show something friendlier. The UTC line is the same instant described in full prose in the reference zone, useful when two people in different countries are agreeing on a time. The copy button gathers the formatted string, the ISO value, the locale, the zone and the UTC line into one block.\\n\\nEverything is computed in the page. There is no request to a formatting service, no account, and no record of the date you entered. If you are producing content for more than one market, the practical habit is to pick one convention per document, apply it with a tool like this rather than by memory, and keep the ISO value in the metadata. Dates that appear in several formats inside one document are one of the few formatting faults a reader notices immediately.\n\nKeeping one convention is the whole exercise. When you format dates for a report, a set of invoices or a multilingual site, choose the locale and the style once and apply them the same way every time; the ISO 8601 row makes it easy to check the stored value against the displayed one, and the UTC line settles arguments about which day a deadline actually falls on.`,
    howTo: [
      { step: "Pick the date and time. The field starts at the current moment in your own time zone." },
      { step: "Choose the locale you are writing for; the formatted output updates immediately." },
      { step: "Set the display time zone, then compare the formatted line with the UTC row to see any day shift." },
      { step: "Choose a date and time style — full, long, medium, short, or no time at all." },
      { step: "Read the part-by-part breakdown to confirm every field you need is present, then copy the result." },
    ],
    whenToUse: `Reach for this tool when a date has to land correctly for a specific audience: a contract, a publication date line, an event listing or an API payload that also needs a human-readable version. When the numbers around the date need the same treatment, the {{number-locale-formatter|Number Locale Formatter}} applies the matching locale rules to figures, currencies and units.\\n\\nIf what you actually need to check is whether a whole document mixes conventions, the {{number-format-checker|Number Format Checker}} scans running text for inconsistencies rather than formatting a single value. Between the two, one tool produces the correct form and the other finds the places a draft has drifted from it.`,
    faqs: [
      {
        q: "Does changing the locale change the date I entered?",
        a: "No. The instant stays exactly the same; only the way it is written changes. The ISO 8601 row proves it, because that value stays fixed while the formatted line moves.",
      },
      {
        q: "Why does my date show a different day in another time zone?",
        a: "A wall-clock time has no zone until you give it one. Interpreted in a zone several hours behind, midnight becomes the previous evening, so the calendar day can legitimately differ.",
      },
      {
        q: "What is the difference between a style preset and a custom pattern?",
        a: "Style presets are defined by the locale data, so they read naturally in that language. The tool deliberately offers presets only: hand-assembled month and day order is how inconsistent dates get published in the first place.",
      },
      {
        q: "Which format should I store in a database?",
        a: "The ISO 8601 value. It is internationally ordered, needs no explanation, and survives a locale change. Use the formatted line for display and keep ISO for storage.",
      },
      {
        q: "Is my date sent to a server to be formatted?",
        a: "No. The formatting runs in your browser through the platform Intl APIs, there is no network call, and nothing about the date is stored.",
      },
    ],
  },

  "number-locale-formatter": {
    keywords: ["number locale formatter", "format numbers by locale", "localized number format"],
    intro:
      "See how one number is written in different locales — separators, digit grouping, currency placement, percent signs and units — using the platform's own formatting rules rather than a guess.",
    content: `A number is the same quantity everywhere, but its punctuation is not. The Number Locale Formatter takes one value and shows how the locale you choose writes it, which is the practical answer to the question a spreadsheet answer never quite settles: is 1.234 five hundred short of a thousand, or one and a bit? Every result comes from Intl.NumberFormat, so the output is the localized number format the runtime actually ships for that locale rather than a pattern somebody typed into a table.\\n\\nFour styles cover most needs. Decimal is the plain form with a grouping separator for thousands and a decimal separator for the fraction. Percent multiplies the value by one hundred and appends the locale's percent sign, so entering 0.125 gives 12.5% — that multiplication is a real behaviour of the style, not a quirk, and it is the most common surprise users report. Currency takes an ISO 4217 code and places the symbol or code where the locale puts it, including the non-breaking space some European locales insert before the symbol. Unit attaches a measurement name such as kilometer or megabyte and formats the pair the way that locale does.\\n\\nNotation controls how large the number is written. Standard shows the full value. Compact shortens it with the locale's own abbreviations, which are language-specific rather than a suffix you append yourself. Engineering and scientific express it with an exponent. For big figures — storage, populations, budgets — the compact form is often more readable than a string of digits, provided everyone understands the abbreviation the locale uses.\\n\\nFraction digit controls let you pin the precision. Setting a minimum and a maximum fixes the number of decimals a report should show; leaving both empty lets the locale choose its default, which is why decimal values sometimes appear with three places and sometimes with none. The grouping toggle turns thousands separators off entirely for cases where they would be misread, such as identifiers, years and model numbers.\\n\\nThe comparison panel is where the tool earns its place. The same value and the same options are rendered in several locales at once, so you can see grouping differ, digit order stay the same, and currency placement move from before the amount to after it. Those rows show what each locale renders in your browser, which is the rendering you would actually ship; a screenshot from another system can differ.\\n\\nNumbers you type are read with the same parser the number format checker uses, so a value entered in European punctuation is understood as the quantity you meant rather than as text. That means you can paste a figure straight out of a foreign document and see it in your own convention. Nothing is uploaded: the formatting is local, instant, and forgotten when you close the tab.\n\nTesting a translation is the other reason to keep this page open. When you format numbers by locale you are really testing the platform's locale data on the device your readers use, and the comparison panel makes that behaviour visible for every locale you support. If a figure looks right in one row and wrong in another, the difference is the locale rather than your input, which is exactly the answer a reviewer needs.`,
    howTo: [
      { step: "Type or paste the number. Both 1234567.89 and 1.234.567,89 are understood." },
      { step: "Choose the locale whose convention you want to see." },
      { step: "Select a style — decimal, percent, currency or unit — and pick a currency or unit when one is needed." },
      { step: "Set the notation and, if precision matters, the minimum and maximum fraction digits." },
      { step: "Compare the locale panel to confirm the placement of symbols and separators before you copy the result." },
    ],
    whenToUse: `Use it when a number has to be published for a specific market: a price, a statistic in a translated page, a measurement in a manual, or a figure in a report that will be read in a country that groups thousands differently. The {{locale-date-formatter|Locale Date Formatter}} does the same job for dates and times, which usually appear beside these numbers.\\n\\nWhen the question is not how to write a number but whether a document writes numbers consistently, the {{number-format-checker|Number Format Checker}} reads the whole text and reports mixed decimal separators, mixed grouping, ambiguous values such as 1.500 and mismatched currency placement instead of formatting one value at a time.`,
    faqs: [
      {
        q: "Why does percent style multiply my number by 100?",
        a: "That is what the percent style does by definition: it treats the value as a ratio. Enter 0.125 and it renders 12.5%. If you already have 12.5 and want a percent sign, use decimal style and add the sign yourself.",
      },
      {
        q: "Why does the currency symbol appear after the amount?",
        a: "Because the locale puts it there. Several European locales write the amount first and the symbol last, sometimes with a non-breaking space, and the tool follows the locale rather than an English convention.",
      },
      {
        q: "What is compact notation for?",
        a: "It shortens large values using the locale's own abbreviation, which makes storage sizes, budgets and populations easier to scan. The abbreviation itself is language-specific, so it changes with the locale.",
      },
      {
        q: "Can I force exactly two decimal places?",
        a: "Yes. Set the minimum and maximum fraction digits to the same number and the output is pinned to that precision, rounded by the platform formatter.",
      },
      {
        q: "Does the tool change the value of my number?",
        a: "No. It changes only the punctuation and the attached symbol. The compact and scientific notations are the only ones that shorten the digits, and they state the exponent or abbreviation when they do.",
      },
    ],
  },

  "rtl-text-tester": {
    keywords: ["rtl text tester", "right-to-left text", "bidi text"],
    intro:
      "Check how right-to-left text is detected and laid out: paragraph-by-paragraph direction, counts of RTL and LTR letters, and the same text rendered forced left-to-right and right-to-left side by side.",
    content: `Right-to-left text is easy to write and surprisingly easy to break. The RTL Text Tester answers two questions that come up constantly when a document, a form or an interface mixes scripts: which direction will a browser pick for this paragraph, and what does the same text look like when it is forced the other way? It reports what it finds rather than rewriting anything, and the text you paste is never altered by the analysis.\\n\\nDirection comes from the Unicode Bidirectional Algorithm's first-strong rule. The tool scans each paragraph and looks for the first character with a strong direction — a letter from an RTL script such as Arabic, Hebrew, Syriac, Thaana or NKo, or a letter from any other script. Everything before it is ignored, including digits, punctuation and emoji, because those are neutral or direction-inheriting for this purpose. A paragraph made only of numbers and punctuation has no strong letter at all, so it is honestly reported as neutral rather than guessed at.\\n\\nThe same first-strong logic is what a browser uses when text carries no explicit direction attribute, which is why the result here predicts how your text will behave in an unmarked container. Each paragraph is listed with its own detected direction, so a document that flips mid-page shows exactly which block is the cause. Counts of RTL letters, LTR letters and explicit control characters explain the mix: a paragraph that is mostly Latin letters with one Arabic word is a different layout problem from one that is mostly Arabic with a Latin brand name inside it.\\n\\nThe side-by-side preview shows the identical string rendered twice, once inside a right-to-left container and once inside a left-to-right one. Nothing about the characters changes — only the paragraph direction the browser applies — and the comparison makes punctuation drift obvious. A trailing full stop, a colon, a percentage sign or a phone number can appear to jump to the wrong end of a line in one direction and look correct in the other, which is usually the real bug behind a complaint about mixed-up text.\\n\\nTesting a translated interface is the other common use. Paste the translated string with the English product name or version number in place, and check that the paragraph reads in the expected direction and that the Latin fragment sits where a reader expects it. Because the tool reports the count of existing control characters, you can also tell at a glance whether a string that behaves strangely arrived with invisible marks already inside it — a frequent leftover from copying out of a word processor.\\n\\nThe tool is deliberately non-destructive. It does not insert control characters, reorder characters or convert scripts; when you want to wrap a fragment explicitly, the Bidirectional Text Tester does that and shows the hex values of everything it inserts. Nothing is uploaded and nothing is stored, so pasted client text, unpublished manuscripts and internal strings stay in the browser.\n\nOne more use is checking pasted bidi text before it goes into a form, a template or a test fixture. If the direction is not what you expect, the paragraph list points at the block responsible and the letter counts show whether the cause is the script mix or a stray control character that arrived with the text.`,
    howTo: [
      { step: "Paste the text you want to check. Mixed Arabic, Hebrew and Latin in one paragraph is the interesting case." },
      { step: "Read the paragraph direction: right-to-left, left-to-right, or neutral when the block has no letters at all." },
      { step: "Scan the paragraph list to find which block flips direction and why the counts look the way they do." },
      { step: "Compare the two preview columns to see which way the punctuation and numbers sit most clearly." },
      { step: "Copy the text out unchanged — the analysis never edits what you pasted." },
    ],
    whenToUse: `Use it when you are laying out mixed-direction text and need to know how a browser will decide, or when a translation review has raised a question about a paragraph that seems to read backwards. The {{bidirectional-text-tester|Bidirectional Text Tester}} takes the next step and wraps a specific fragment in Unicode controls when detection alone is not enough.\\n\\nIf text behaves oddly and you suspect the characters themselves rather than the direction, the {{unicode-text-normalizer|Unicode Text Normalizer}} lists invisible and zero-width characters by position, which is where hidden marks left over from a copy and paste usually show up.`,
    faqs: [
      {
        q: "How does the tool decide a paragraph's direction?",
        a: "By the first strong letter in the paragraph, the same rule the Unicode Bidirectional Algorithm and browsers use for unmarked text. Digits, punctuation and emoji are skipped because they carry no strong direction.",
      },
      {
        q: "What does a neutral paragraph mean?",
        a: "It contains no letters — only digits, punctuation, symbols or whitespace — so there is nothing to derive a direction from. The tool reports neutral instead of guessing.",
      },
      {
        q: "Why does a phone number look out of place in Arabic text?",
        a: "Numbers keep their own left-to-right order inside an RTL paragraph, so their visual position depends on the surrounding punctuation and any controls present. Both preview columns let you see the difference.",
      },
      {
        q: "Does the analysis change my text?",
        a: "No. It only reads and reports. The previews apply a direction attribute, which is presentational; the copy button gives you back exactly what you pasted.",
      },
      {
        q: "Is the text I paste stored anywhere?",
        a: "No. Direction detection and counting run entirely in your browser, and nothing is saved when you close the page.",
      },
    ],
  },

  "bidirectional-text-tester": {
    keywords: ["bidirectional text tester", "unicode control characters", "bidi text"],
    intro:
      "Wrap a whole text or a single fragment in Unicode bidirectional controls — isolates or the older embeddings and overrides — and see the exact code points that were inserted, so mixed-direction text renders the way you intend.",
    content: `When mixed-direction text misbehaves, the fix is usually one or two invisible characters. The Bidirectional Text Tester places Unicode control characters around a fragment or around the entire text and shows exactly what it added, by offset and code point, so the change is inspectable rather than mysterious. The controls are real characters: copy the result into a document, a database field or a template and the behaviour travels with the text.\\n\\nThe Unicode Bidirectional Algorithm decides how a paragraph of mixing scripts is displayed. It resolves most cases on its own, but a fragment with neutral characters at its edges — a number, a bracketed citation, a Latin product name inside an Arabic sentence — can be pulled into the surrounding direction and reorder visually. Wrapping that fragment in a matching pair of controls tells the algorithm where the fragment begins and ends, which is what stops punctuation and digits from drifting to the wrong side.\\n\\nIsolates are the modern form. A first-strong isolate opens with FSI and closes with PDI: the algorithm looks at the enclosed text to decide its direction, which is the safest choice when you do not know in advance whether the content is Arabic, Hebrew or Latin. The explicit right-to-left and left-to-right isolates (RLI and LRI) are for cases where you do know and want the direction pinned. Isolates are preferred because they cannot leak their effect past the closing character.\\n\\nEmbeddings and overrides are the older mechanism and are still offered because legacy systems and some publishing pipelines use them. They open with RLE, LRE, RLO or LRO and close with a pop directional formatting character. An override forces the display order to a direction regardless of the content, which is powerful and also easy to over-apply; without a matching close it can spill into the rest of the paragraph. The tool states the pair it will use in plain words before you apply it, so you always know which form you are getting.\\n\\nThe control list below the output is the part worth keeping. Every inserted character is listed with its hex value and a plain-language label, so you can see that a fix consists of, say, two code points at specific offsets. That is also how you audit text that arrived from somewhere else: an unexpected override inside a bank statement, a code comment or a review is the classic way that displayed order and actual order are made to differ, and this list makes such characters visible instead of invisible.\\n\\nNothing leaves the browser and nothing is stored. If you later want to remove the controls again — for a plain-text export, a search index or a diff — the normalization tool strips invisible and directional characters and reports how many it removed, which is the clean way back from a wrapped document.\n\nTesting a template is the most common use in practice: paste a sample of bidi text, wrap the fragment that keeps moving, and copy the result into the fixture so the same fix applies wherever that content renders. Because the output is ordinary text with real control characters, a diff shows exactly which code points were added at which offsets.`,
    howTo: [
      { step: "Paste the full text that mixes directions." },
      { step: "Type the fragment to isolate, or leave the field empty to wrap the entire text." },
      { step: "Choose the control pair. The first-strong isolate is the safe default when the fragment's language varies." },
      { step: "Check the replaced or appended row, then read the control list to confirm the code points that were added." },
      { step: "Copy or download the wrapped text and paste it into its destination." },
    ],
    whenToUse: `Reach for it when a fragment inside a paragraph keeps drifting — a Latin brand name in Arabic copy, a bracketed number at the end of a Hebrew sentence, a URL beside RTL text. The {{rtl-text-tester|RTL Text Tester}} is the diagnostic step before this one: it shows which paragraphs are currently resolving in each direction.\\n\\nIf a document arrives with controls already inside it and you need a clean plain-text version, the {{unicode-text-normalizer|Unicode Text Normalizer}} removes invisible and directional characters and reports the count, so you know the character-level state of the file.`,
    faqs: [
      {
        q: "What is the difference between an isolate and an embedding?",
        a: "An isolate (FSI, RLI, LRI) treats the enclosed text as a self-contained run and ends cleanly at its closing character. An embedding (RLE, LRE) and an override (RLO, LRO) are the older mechanism, whose effect can leak past the intended range if it is not closed properly.",
      },
      {
        q: "Which control should I use by default?",
        a: "The first-strong isolate. It inspects the enclosed text and picks the direction from the content, so it works when the wrapped fragment is not always the same language.",
      },
      {
        q: "Are the inserted characters visible?",
        a: "No. They affect layout only, which is exactly why the tool lists each one with its offset, hex value and label: invisible characters need a visible record.",
      },
      {
        q: "Can bidirectional overrides be misused?",
        a: "Yes. An override makes displayed order differ from stored order, which is why unexpected controls in source code or a statement deserve attention. This tool shows them rather than hiding them.",
      },
      {
        q: "How do I remove controls I added?",
        a: "Run the output through the Unicode Text Normalizer with the invisible-character option enabled. It strips directional and zero-width characters and tells you how many it removed.",
      },
    ],
  },

  "unicode-text-normalizer": {
    keywords: ["unicode text normalizer", "unicode normalization", "remove invisible characters"],
    intro:
      "Convert text between NFC, NFD, NFKC and NFKD, strip zero-width and directional characters, and see exactly which code points changed and how many invisible marks the text was carrying.",
    content: `Two strings can look identical on screen and still be different at the character level, which is why a search misses a name, a duplicate check fails, or a form rejects a caption that appears to be well inside its limit. The Unicode Text Normalizer converts text between the four standard normalization forms, optionally removes invisible characters, and reports what changed — in characters, code points and per-character categories.\\n\\nUnicode normalization is the process of replacing a string with one of its standard equivalents. Canonical equivalence covers sequences that mean the same character: e sharp can be stored as a single code point or as an e followed by a combining acute accent, and both render the same way. Compatibility equivalence is broader and folds characters that are merely similar in use, such as a ligature, a full-width Latin letter or a superscript digit into their plain forms.\\n\\nThe four forms follow from that. NFC composes to the shortest canonical form and is the usual choice for web content, databases and identifiers. NFD decomposes, so accents become separate combining marks — the shape older macOS file names used, and still common in paths exported from that platform. NFKC composes and also applies compatibility folding, which is useful when normalizing user input for search. NFKD decomposes and folds, which is the most aggressive reduction and should be reserved for matching rather than storage, because it discards distinctions some documents care about.\\n\\nThe stability row answers a question worth asking before changing anything: which forms is your text already stable in? If NFC is listed, running the NFC conversion will leave the text byte-for-byte identical, and you can see that instead of assuming it.\\n\\nInvisible characters are the second half of the job. Zero-width spaces, zero-width joiners, soft hyphens, a byte order mark at the start of a file, Arabic letter marks and bidi controls are all characters that occupy no visible space but change length, matching and layout. The tool lists every one it finds with its offset, its hex value and a plain-language name, and the optional removal step reports how many were deleted. This is the fastest way to explain a caption that a platform rejected at a count you could not see, or a search term that will not match the text on the page.\\n\\nEverything runs locally. Normalization is a call to the platform's own string function, the invisible-character scan is a character-by-character classification, and the download button gives you the converted text as a plain file. Two side notes the tool does not hide: canonical normalization never changes how text looks, while compatibility folding (NFKC, NFKD) can, so test with your own content before applying it in bulk.\n\nLog files, exports and pasted quotations are where the tool earns its keep. Running a sample through it to remove invisible characters takes one click, and the reported count tells you whether a file is clean or merely looks clean. Convert a whole set with the same form and the text stops shifting between applications — and whenever a normalizer run changes something you care about, the before-and-after counts and the stability row show it before you commit to the result.`,
    howTo: [
      { step: "Paste the text you want to inspect or convert." },
      { step: "Read the stability row to see which forms the input already satisfies." },
      { step: "Choose a target form: NFC for web and database storage, NFKC or NFKD when you need aggressive matching." },
      { step: "Tick the invisible-character box if the output is going into a search index, a duplicate check or a length-limited field." },
      { step: "Check the before-and-after counts, then copy or download the normalized text." },
    ],
    whenToUse: `Use it whenever text crosses a boundary: form input into a database, exported file names, copy pasted from a word processor, translated content, or anything that has to match exactly in a search or a duplicate check. The {{character-count-tool|Character Count Tool}} shows the length consequences in more detail, including UTF-8 bytes and user-perceived characters.\\n\\nWhen the text behaves strangely in layout rather than in matching, the {{bidirectional-text-tester|Bidirectional Text Tester}} identifies directional controls and shows what each one does, which is a narrower and more informative view than a full strip.`,
    faqs: [
      {
        q: "NFC or NFD: which should I use?",
        a: "NFC for storage and web content; it is the shortest canonical form and what most software expects. Use NFD when you are matching against text that was decomposed, such as file names exported from older macOS systems.",
      },
      {
        q: "What does NFKC change that NFC does not?",
        a: "Compatibility folding. It also replaces ligatures, full-width characters, superscripts and similar look-alikes with their plain equivalents, which helps matching but can alter appearance.",
      },
      {
        q: "Will normalization change how my text looks?",
        a: "Not for canonical forms. NFC and NFD render identically. Compatibility forms can change appearance, which is why the tool marks them as aggressive.",
      },
      {
        q: "Where do invisible characters come from?",
        a: "Copying out of word processors and web pages, files saved with a byte order mark, and editors that insert zero-width joiners to keep emoji intact. They are easy to copy and hard to see.",
      },
      {
        q: "Does removing them affect the word count?",
        a: "It can. Invisible characters sometimes sit between letters, so removing them can join fragments together. Check the before-and-after counts, which the tool reports for lengths and code points.",
      },
    ],
  },

  "locale-aware-sort-tool": {
    keywords: ["locale aware sort", "sort text alphabetically", "natural sort"],
    intro:
      "Sort a list the way readers of a chosen locale expect, with case and accent sensitivity, natural number ordering, optional punctuation skipping and accent-insensitive duplicate removal — and a code-point column to show why the naive sort disagrees.",
    content: `Sorting a list alphabetically looks like a solved problem until the first accented letter or the first version number appears. The Locale Aware Sort Tool sorts with Intl.Collator, the platform's locale-aware comparison, and shows a plain code-point sort beside it so the difference is visible rather than theoretical. It also handles the two chores that always accompany sorting: natural ordering of numbers, and duplicate removal.\\n\\nA code-point sort compares character codes, which puts every uppercase letter before every lowercase one and every accented letter after the basic Latin alphabet. That is why a naive sort produces Apple, Banana, Zebra, apple — and why file lists from different tools disagree. A collator instead applies the locale's collation rules, so case and accents are handled in the order a reader of that language expects, and scripts such as Swedish place their three extra letters at the end of the alphabet rather than near their unaccented cousins. Turkish is a good reminder that the rules are language-specific, not decorative: its dotted and dotless i sort differently from English expectations.\\n\\nSensitivity controls how much of that detail counts. Variant distinguishes case and accents, which is right for a list of titles. Case ignores accents, useful for names in a contact list. Accent ignores case but respects accents. Base ignores both, which groups variants of a name together. Whichever you choose, the sort is stable: lines that compare equal keep the order they had in your input, so re-sorting an already sorted list does not shuffle it.\\n\\nNatural ordering, sometimes called natural sort, treats digit runs as numbers instead of as text. Without it, item10 comes before item2 because a one is compared with a two; with it, item2 comes first and chapter10 follows chapter9. The checkbox applies numeric collation, which is the standard mechanism for exactly this, and the comparison column shows the result of sorting without it.\\n\\nDuplicate removal compares lines using a case- and accent-insensitive key derived from the chosen locale, so Resume and résumé, or an item repeated with different capitalisation, collapse to the first occurrence. The panel reports how many duplicate groups it found and lists them, which is often more useful than the deletion itself — a list with a dozen near-duplicates usually has an upstream problem. Blank lines are ignored and counted rather than silently discarded, and descending order flips the finished list rather than re-sorting it.\\n\\nEverything runs in the browser on the text you paste, with no upload and no storage. The two side-by-side panels at the bottom are the reason to keep the tool open while you work: one shows the collated order, the other the raw code-point order, and seeing where they diverge is usually the quickest way to explain why another program sorted your list differently.\n\nThe practical test is to sort text alphabetically once with the collator and once by code point. Wherever the two columns differ, the collator is following the rules of the locale while the code-point column is following raw character values, and knowing which one a downstream system uses explains most ordering surprises. The sorted list you copy carries that order with it, so a downstream tool that reads plain text preserves what you decided here.`,
    howTo: [
      { step: "Paste one item per line. Blank lines are ignored and counted." },
      { step: "Choose the locale whose alphabet order you need." },
      { step: "Set case and accent sensitivity; Variant distinguishes both, Base ignores both." },
      { step: "Turn on natural numbers if the list contains numbered items, and remove duplicates if it needs cleaning." },
      { step: "Compare the collated column with the code-point column, then copy or download the sorted list." },
    ],
    whenToUse: `Use it for indexes, glossaries, name lists, bibliographies and inventory files where the order has to match what a reader of that language expects. When the list is a set of numeric tokens or a document full of figures, the {{number-format-checker|Number Format Checker}} reports inconsistent separators and grouping instead of ordering anything.\\n\\nIf duplicates are surviving because of invisible differences rather than case or accents, the {{unicode-text-normalizer|Unicode Text Normalizer}} normalizes the text first and shows the zero-width characters that were making two identical-looking lines different.`,
    faqs: [
      {
        q: "Why is my list sorted differently in a spreadsheet?",
        a: "The spreadsheet is probably comparing character codes rather than applying locale collation, or it is using a different locale. The code-point column shows exactly what the naive order looks like for your data.",
      },
      {
        q: "What does natural sort do?",
        a: "It compares runs of digits as numbers, so item2 sorts before item10 and chapter9 before chapter10. Without it, digit sequences are compared one character at a time.",
      },
      {
        q: "Which sensitivity should I choose for a name list?",
        a: "Case sensitivity ignores accents and is often the most readable for names, while Base groups all variants of a name together. Variant is the strictest and is the right choice for titles.",
      },
      {
        q: "How does duplicate removal decide two lines match?",
        a: "It compares case- and accent-insensitive keys built with the selected locale, so Resume and résumé count as one. The first occurrence is kept and the group is listed.",
      },
      {
        q: "Are blank lines deleted from my list?",
        a: "They are excluded from the output, and the tool tells you how many were ignored rather than dropping them quietly.",
      },
    ],
  },
};
