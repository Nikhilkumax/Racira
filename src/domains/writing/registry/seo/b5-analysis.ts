import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B5, text-analysis group: authored SEO entries for the readability,
 * frequency and stylometry tools backed by the shared engine in
 * `src/domains/writing/lib/text/`. Keys are registry slugs; see ../tool-seo.ts
 * for the contract these entries are validated against.
 */
export const B5_ANALYSIS_SEO: Record<string, ToolSeo> = {
  "readability-grade-scorer": {
    keywords: [
      "readability grade scorer",
      "grade level",
      "flesch-kincaid",
      "smog index",
    ],
    intro:
      "The Readability Grade Scorer applies five published formulas to one text and shows every count they are computed from.",
    content:
      "This readability grade scorer runs the five classic indices — Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau and the Automated Readability Index — over a single text and reports each one beside an overall grade level. No index is invented and no score is estimated: each is a published formula applied to counts you can inspect on the same page.\n\nThe panel lists every score with its name, plus the inputs behind them: words, sentences, paragraphs, syllables, words of three or more syllables, Gunning complex words, average sentence length, syllables per word and words of seven or more letters. The how-to-read panel explains that the indices disagree by design — they weigh sentence length and word weight differently — and that short samples make all of them unstable. The panel under each index shows its formula, so a grade can be reproduced from the counts beside it rather than taken on trust.\n\n- Flesch-Kincaid Grade Level, from average sentence length and syllables per word.\n- Gunning Fog Index, from average sentence length and the share of complex words.\n- SMOG Index, from polysyllables and sentence count, with its 30-sentence validation caveat.\n- Coleman-Liau Index, which uses letters per 100 words instead of syllables.\n- Automated Readability Index, which uses characters and words.\n- An overall grade level summarising the set, plus the counts each formula consumed.\n\nSentence and word segmentation come from the shared Unicode tokenizer, and syllable counts come from the documented heuristic used across this domain: vowel groups with y included, silent-e handling, ed and es endings, repair for -ely adverbs and a curated exception table. The tool flags a sample below roughly 100 words as short, because every formula here becomes noisy on small inputs. Everything runs locally in the browser.\n\n- Syllable counts are heuristic, so every score carries that error; proper nouns and abbreviations are the main sources.\n- The formulas were calibrated on English prose and are not meaningful for other languages.\n- Short samples below about 100 words produce unstable scores, which the page flags.\n- The five indices can disagree by several grades on the same text, because they weight inputs differently.\n- A grade level describes the text, not the reader: background knowledge drives comprehension more than sentence length does.\n\nUse the scorer when you want one panel that shows five verdicts rather than one. Read the spread: when the indices cluster around a grade, the passage is consistently at that level, and when one runs away from the rest, the input that formula leans on — syllables, characters or letters — is the place to look. Paste a representative stretch rather than the first paragraph, because the sample determines the score more than anything else. And when the spread between indices is wide, look at the input that the outlying formula leans on: Coleman-Liau counts letters rather than syllables, and the Automated Readability Index uses characters per word, so a passage full of numbers and abbreviations pushes those two away from the syllable-based indices without any change in actual difficulty.\n\nThe individual calculators in this domain apply the same counts through a single formula each, and the tools aimed at sentence shape and clarity cover the structural side that grade levels compress into one number.",
    howTo: [
      { step: "Paste at least a few paragraphs of representative text; every score updates as you type." },
      { step: "Read the Reading level panel for the overall grade and the five named indices." },
      { step: "Check what the scores were computed from — words, sentences, syllables, complex words and ratios — to see which input drives a disagreement." },
      { step: "Copy all scores or Download the panel, and treat any result on a short sample as indicative." },
    ],
    whenToUse:
      "Use the readability grade scorer when you want the five published indices side by side, with the spread visible. The {{flesch-kincaid-score-calculator|Flesch-Kincaid Score Calculator}} zooms in on the two Flesch formulas and their arithmetic, while the {{gunning-fog-index-calculator|Gunning Fog Index Calculator}} and {{smog-index-calculator|SMOG Index Calculator}} each apply one formula in depth. When the structural side of readability matters as much as the vocabulary, the {{clarity-score-tool|Clarity Score Tool}} blends sentence length, variety and long sentences into a review figure.",
    faqs: [
      {
        q: "Why do the five indices disagree?",
        a: "Each formula weights different inputs — syllables, characters, letters or complex words — so they move apart when a text is unusual in one dimension. The spread itself is informative: a passage clustering around one grade is consistent.",
      },
      {
        q: "How much text should I paste?",
        a: "At least a few hundred words, and never less than about 100. Every formula here is noisy on short samples, which the page flags with a short-sample note.",
      },
      {
        q: "Which grade level should I trust?",
        a: "Treat the overall figure as a summary and read the individual indices underneath it. No single formula is authoritative; agreement between them is the strongest signal.",
      },
      {
        q: "Is a lower grade level always better?",
        a: "No. Grade level measures difficulty, not quality, and some material — legal, technical or literary — is legitimately dense. The question is whether the level matches the intended audience.",
      },
      {
        q: "How exact are the syllable counts behind these scores?",
        a: "No. They come from a documented heuristic with silent-e, ed, es and -ely rules plus a curated exception table, so proper nouns and unusual words can shift every score slightly.",
      },
    ],
  },

  "sentence-complexity-analyzer": {
    keywords: [
      "sentence complexity analyzer",
      "clause count",
      "subordinating conjunctions",
      "words per clause",
    ],
    intro:
      "The Sentence Complexity Analyzer estimates how many clauses each sentence carries and ranks the sentences carrying the most.",
    content:
      "This sentence complexity analyzer estimates how much structure each sentence carries. The clause count starts at one and rises by one for each coordinating conjunction, subordinating conjunction, relative pronoun, semicolon or colon in the sentence. Commas are reported but never counted, because a list of three items would otherwise look like four clauses. The estimate is deliberately called an estimate on the page: it is good at spotting sentences that carry too much and bad at fine grammatical distinctions.\n\nThe summary gives the average clauses per sentence, the average words per clause, the count of single-clause sentences, how many sentences carry three or more clauses, and the longest sentence. Two tables do the working: sentences carrying the most clauses show clauses, words and words per clause, and the longest sentences table adds the comma count so a heavy list does not get mistaken for heavy subordination. Sentences flagged in both tables are the ones to read first, because length and structure together are what actually make a sentence hard to follow.\n\n- Clause counting: one plus each coordinating conjunction, subordinating conjunction, relative pronoun, semicolon or colon.\n- Comma reporting: commas are shown per sentence but never counted as clauses.\n- Single-clause share: how many sentences carry no extra structure at all.\n- Heavy-sentence list: sentences with three or more clauses, ranked.\n- Longest-sentence table: words, clauses and commas side by side.\n- Copy analysis and Download export the per-sentence detail.\n\nThe engine walks sentences from the shared Unicode tokenizer and counts markers from three published lists — coordinating conjunctions, subordinating conjunctions and relative pronouns — plus semicolons and colons. That is a documented heuristic, not a parse: a sentence with several markers in a list context is counted as having several clauses even when the grammar says otherwise. The words per clause figure divides sentence length by the estimate, which is the number that actually predicts reading difficulty. Because the marker lists are published, the estimate is explainable rather than opaque: you can open a flagged sentence, count the conjunctions yourself and reproduce the figure. That transparency is the point of an estimate over a score, and it also explains the tool's limits — the same counting rules that make it auditable are what stop it from being a parse.\n\n- The clause count is an estimate, not a grammatical analysis; unusual constructions can be overcounted or undercounted.\n- Commas are never counted, so a long comma-heavy sentence can look simpler than it reads.\n- Lists and series inflate the marker count when they contain conjunctions.\n- Very short sentences can produce a words-per-clause figure that is not meaningful.\n- The lists are finite, so an unusual connector may be missed.\n\nRead the heavy-sentence table first and the averages second. A sentence with four or more estimated clauses and fewer than a dozen words per clause is usually the one to split; an average clauses per sentence above two across a whole document suggests the prose leans on subordination everywhere rather than in the one place that needs it. Steady counts across a document are usually a revision note for the section structure, while one outlier sentence is a sentence edit.\n\nThe sentence-shaped companions divide the work: the Sentence Variety Checker reports length rhythm rather than structure, the Sentence Count Tool gives the plain totals, and the Clarity Score Tool blends the structural signals into one review figure. None of them replaces reading the heaviest sentence aloud.",
    howTo: [
      { step: "Paste a paragraph or a whole draft; each sentence is measured as you type." },
      { step: "Read the Complexity at a glance panel for average clauses, words per clause and the heavy-sentence counts." },
      { step: "Work through the sentences carrying the most clauses, then the longest sentences with their comma counts." },
      { step: "Use Copy analysis or Download to keep the per-sentence detail." },
    ],
    whenToUse:
      "Use the sentence complexity analyzer when sentences feel heavy but you cannot see why, and the clause estimate gives you the ranking. The {{sentence-variety-checker|Sentence Variety Checker}} measures length rhythm rather than structure, the {{sentence-count-tool|Sentence Count Tool}} gives the plain sentence totals and averages, and the {{clarity-score-tool|Clarity Score Tool}} combines the structural signals into one figure. When a sentence needs rewriting rather than diagnosis, the sentence rewriter in this domain applies documented rewrites one sentence at a time.",
    faqs: [
      {
        q: "How is the clause count calculated?",
        a: "Each sentence starts at one, and the count rises by one for every coordinating conjunction, subordinating conjunction, relative pronoun, semicolon or colon. Commas are reported but never counted.",
      },
      {
        q: "Is this a grammatical parser?",
        a: "No. The clause count is a documented heuristic that identifies markers, not a parse. It is good at spotting sentences that carry too much and imprecise about fine grammatical distinctions.",
      },
      {
        q: "Why does a list inflate the clause count?",
        a: "A series joined by conjunctions contains markers, and the estimate counts markers. Commas are excluded for exactly this reason, but a three-item list with and still reads as one extra clause.",
      },
      {
        q: "What is a good average clauses per sentence?",
        a: "Most readable prose averages between one and two. Above two, subordination is spread through the document rather than concentrated in the sentences that actually need it.",
      },
      {
        q: "Why show words per clause as well as words per sentence?",
        a: "Words per clause measures how packed each unit of structure is. A 40-word sentence split into four clauses reads very differently from a 40-word sentence with one.",
      },
    ],
  },

  "overused-word-finder": {
    keywords: [
      "overused word finder",
      "repeated words",
      "frequency table",
      "tokens apart",
    ],
    intro:
      "The Overused Word Finder counts every word, ranks the repeats and lists the words that come back within a short window.",
    content:
      "This overused word finder reports repetition from the counts up: a frequency table of every word, a threshold you control, and a second list of words that return quickly — the repetitions a reader actually notices. It does not attach a verdict to any word, because repetition is a device as often as it is a flaw. The job is to make the pattern visible, and the two views do that differently. The frequency table answers which words this text leans on overall, and the window list answers which repeated words come back before the reader has moved on.\n\nSet the threshold to decide which words appear in the frequency table, and toggle whether function words are included. The panel shows the most repeated word and its count, how many words repeat within 40 tokens, and the threshold in use, so the report is reproducible. The frequency table lists word, count, share of text and occurrences per 1,000 words; the words-that-come-back-quickly list shows the word, how many tokens apart the repeats sit and the surrounding context.\n\n- Report words used at least: a threshold control, so one-off words stay out of the table.\n- Include function words: a toggle for the, and, of and similar closed-class words.\n- Frequency table: word, count, share of text and per-1,000-words rate.\n- Quick-return list: content words repeated within a 40-token window, with distance and context.\n- Summary figures: most repeated word, quick-return count and the threshold in use.\n- Copy report and Download export both tables as plain text.\n\nWord tokens come from the shared Unicode tokenizer, grouped case-insensitively; no stemming is applied, so a word and its inflections count separately. Context-window repeats are found by walking the token list and comparing each content word against the previous 40 tokens, which is why the list shows tokens apart rather than paragraph positions. The threshold and window are stated on the panel, so a colleague can reproduce the same table on the same text.\n\n- Frequency alone is not a fault: technical terms and character names repeat of necessity.\n- No stemming means run and running are counted separately, hiding some morphological repetition.\n- The 40-token window is a fixed convention, not a measured threshold of reader annoyance.\n- Function words dominate the raw table unless the toggle is off.\n- The tool reports counts, not style advice; the page says so in its what-this-does-not-say panel.\n\nRead the quick-return list first. A word that returns within a handful of tokens is the repetition a reader hears, while a high total across a whole document may just be a long text about one subject. Then check the frequency table for the words you did not expect to see near the top: those are the habits worth examining.\n\nThe vocabulary companions cover the other angles: the Word Count Tool gives the total that the share is computed against, the Keyword Density Analyzer reports two-word phrases as well as single terms, and the Vocabulary Richness Scorer measures how varied the vocabulary is overall rather than word by word. Checking both views also keeps the threshold honest: a word that tops the table at your chosen minimum but never appears in the window list is repetition spread across a long document rather than a habit inside one paragraph.",
    howTo: [
      { step: "Paste a draft; every word is counted and the tables build as you type." },
      { step: "Set the threshold for the frequency table and choose whether function words are included." },
      { step: "Read the quick-return list first — words repeated within 40 tokens — then the ranked frequency table." },
      { step: "Use Copy report or Download to keep both views as plain text." },
    ],
    whenToUse:
      "Use the overused word finder when a draft feels repetitive and you want the pattern quantified rather than guessed. The {{word-count-tool|Word Count Tool}} gives the total words that the share is measured against, the {{keyword-density-analyzer|Keyword Density Analyzer}} adds two-word phrases to the count, and the {{vocabulary-richness-scorer|Vocabulary Richness Scorer}} reports how varied the vocabulary is overall. When the repetition is a phrase rather than a word, the {{redundancy-finder|Redundancy Finder}} checks the pairs that repeat a meaning.",
    faqs: [
      {
        q: "Does a high count mean the word is overused?",
        a: "No. A long technical document repeats its terms of art of necessity. The quick-return list is the better signal, because a word that returns within a few tokens is the repetition a reader notices.",
      },
      {
        q: "Why are run and running counted separately?",
        a: "No stemming is applied, so each form is a distinct token. The trade-off keeps the table reproducible and exact at the cost of missing morphological repetition.",
      },
      {
        q: "What does the 40-token window mean?",
        a: "The quick-return list flags a content word each time it appears within 40 tokens of a previous appearance. It is a fixed, stated convention designed to surface local repetition.",
      },
      {
        q: "Why do function words dominate the frequency table?",
        a: "Words like the, of and and are the most common tokens in any English text. The include-function-words toggle exists so you can switch the table between content words and every word.",
      },
      {
        q: "Can I compare two passages?",
        a: "Paste them one at a time; the tables describe the text in the box. Comparing counts across passages of different lengths is easiest with the per-1,000-words column.",
      },
    ],
  },

  "sentence-variety-checker": {
    keywords: [
      "sentence variety checker",
      "sentence-length variation",
      "length distribution",
      "similar-length sentences",
    ],
    intro:
      "The Sentence Variety Checker measures sentence-length variation, plots the length distribution and finds the longest run of similar-length sentences.",
    content:
      "Monotone rhythm comes from sentences of the same length running together, and this sentence variety checker measures exactly that. Length measures are exact, because they come from the shared tokenizer: there is no model and no score to dispute. What the panel reports is sentence-length variation, the shape of the length distribution, and the longest run of similar-length sentences — the stretch where the rhythm actually stalls.\n\nThe Rhythm panel shows the variation figure, mean and median length, shortest and longest sentence, how many sentences sit under ten words and how many sit at thirty or more, and the longest run of sentences within two words of each other. A notice appears when every sentence is the same length. Below it, the length distribution plots each bucket, so a paragraph clustered in one bucket reads as a flat line before you have counted anything.\n\n- Sentence-length variation: the standard deviation of sentence lengths in words.\n- Mean and median length, with the shortest and longest sentences.\n- Short sentences under ten words and long sentences at thirty words or more.\n- Longest run of similar-length sentences, defined as consecutive sentences within plus or minus two words.\n- Length distribution across fixed buckets, so a clustered paragraph is visible as a shape.\n- Copy summary and Download for the figures as plain text.\n\nEvery length is measured on sentence segments from the Unicode tokenizer, and the variation is the population standard deviation of those lengths. The similar-length run is found by walking the sentences in order and tracking the longest streak whose neighbours stay within two words. The threshold is a fixed convention stated on the panel, not a measured threshold of reader boredom. The whole computation is arithmetic over counts, so the same text always produces the same summary. The buckets are fixed, so a paragraph that moves from one bucket to another as you edit shows the shift directly rather than rescaling around it.\n\n- Variation is a description, not a quality: deliberate monotony can be a rhetorical device.\n- Short texts need several sentences before the figures mean anything, which the page warns about.\n- The two-word window is a convention; a different window would produce a different run length.\n- Lists, dialogue and table fragments read as short sentences and distort the distribution.\n- Length ignores structure entirely; a short sentence can still be hard to read.\n\nUse the distribution first and the headline figure second. A paragraph clustered in one bucket is the visual signal that rhythm needs attention, and the longest run names where it starts. The usual repair is deliberate: insert a short sentence after a long one, or split one member of a run, and re-paste to see the distribution spread out. The variation figure responds to that edit immediately, which makes it a useful feedback loop: change one sentence, paste again, and watch whether the run breaks. Because every measure comes from the same tokenizer, the counts in the panel always agree with the distribution beneath them, so there is no separate bookkeeping to reconcile.\n\nThe neighbours divide the job: the Sentence Complexity Analyzer measures clause load rather than length, the Sentence Count Tool gives the plain totals and averages, and the Clarity Score Tool folds length, variety and vocabulary into one review figure.",
    howTo: [
      { step: "Paste a few paragraphs; several sentences are needed before the figures mean anything." },
      { step: "Read the Rhythm panel for variation, mean, median, and the short and long sentence counts." },
      { step: "Check the length distribution plot for clustering, then find the longest run of similar-length sentences." },
      { step: "Copy summary or Download to keep the figures, edit the run, and paste again to compare." },
    ],
    whenToUse:
      "Use the sentence variety checker when a paragraph reads as a drone and you need to know where the rhythm stalls. The {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} measures clause load rather than length, and the {{sentence-count-tool|Sentence Count Tool}} gives the plain totals and averages. When the rhythm problem should be read alongside vocabulary weight, the {{readability-grade-scorer|Readability Grade Scorer}} applies five published indices, and the {{clarity-score-tool|Clarity Score Tool}} blends variety with length into one figure.",
    faqs: [
      {
        q: "What is sentence-length variation?",
        a: "The standard deviation of sentence lengths in words. A low figure means sentences are close to one length; a high figure means the rhythm changes as you read.",
      },
      {
        q: "Why are sentences within two words flagged as similar?",
        a: "The two-word window is a fixed convention for finding runs where the rhythm does not move. It is stated on the panel; a different window would produce a different run length.",
      },
      {
        q: "Is high variation always better?",
        a: "No. Variation describes rhythm rather than quality, and deliberate monotony can be an effect. The tool reports the distribution so you can decide whether the pattern suits the passage.",
      },
      {
        q: "How much text do I need?",
        a: "Several sentences at minimum; a few paragraphs is better. On very short samples the variation figure moves with every edit, and the page warns when the sample is thin.",
      },
      {
        q: "Why do my bullet points distort the distribution?",
        a: "Lists and table fragments segment into many short sentences, which pulls the short-sentence count up. Paste the prose you want to judge rather than the surrounding list.",
      },
    ],
  },

  "clarity-score-tool": {
    keywords: [
      "clarity score",
      "clarity score tool",
      "weighted composite",
      "score components",
    ],
    intro:
      "The Clarity Score Tool blends four measured components into a 0-100 clarity score and shows every weight, curve and input.",
    content:
      "This clarity score tool computes a clarity score as a weighted composite of four measured components and shows every one of them. It is deliberately not presented as a published index — it is a composite whose components, curves and weights are visible on the page, so a reader can disagree with the score and see exactly why it landed where it did. The countable parts are sentence length, complex-word rate, sentence variety and long-sentence share. A composite is only honest when its parts are visible, which is why every row shows both the value and the weight rather than a single opaque number.\n\nThe panel reports the score out of one hundred, the band it maps to — very clear, clear, could be clearer, dense or hard going — and the words and sentences scored. The score components table then breaks the composite into its four rows with their weights: sentence length at thirty, complex-word rate at twenty-five, sentence variety at twenty-five and long-sentence share at twenty. Each row shows the value it was computed from, and the how-the-composite-is-built panel repeats the curve behind each.\n\n- Sentence length (weight 30): one hundred up to a mean of eighteen words, then four points per word to zero at forty; a mean below twelve is penalised for choppiness.\n- Complex-word rate (weight 25): one hundred minus two hundred and fifty times the share of words with three or more syllables.\n- Sentence variety (weight 25): twelve times the standard deviation of sentence lengths, capped at one hundred.\n- Long-sentence share (weight 20): one hundred minus two hundred times the share of sentences over thirty words.\n- Reliability note: samples below the shared one-hundred-word floor are flagged as short.\n- Copy result and Download for the score and components as plain text.\n\nThe inputs come from the shared tokenizer, the syllable heuristic and the sentence-length statistics the other tools in this domain use: no component is invented and none is trained. Because the four curves are plain arithmetic, a score can be traced back to the sentences responsible — the component table names the value, and the panel beside it names the weight. Everything runs locally in the browser.\n\n- It is a composite, not a published index, so quoting it as one misrepresents what it is.\n- The weights are documented choices; a different blend would produce a different number.\n- Short samples are unstable and flagged below the shared one-hundred-word floor.\n- It measures form, not content: a trivial sentence scores as clearly as an important one.\n- Vocabulary complexity rests on the syllable heuristic, so specialist terms carry the usual error.\n\nRead the components before the headline. When the score is lower than expected, the four rows show which curve dragged it: long sentences and low variety are the usual pair, and both are fixable by splitting a sentence or two. Re-paste after the edit to see the component move — the composite is only useful if you treat it as a comparison between drafts rather than an absolute.\n\nThe neighbours cover the parts in depth: the readability grade scorer applies five published indices to the same text, the sentence complexity analyzer estimates clause load, and the sentence variety checker opens the distribution behind the variety component.",
    howTo: [
      { step: "Paste a paragraph or more; the score updates as you type, with a short-sample flag under one hundred words." },
      { step: "Read the Clarity panel for the score, the band and the word and sentence totals." },
      { step: "Open the score components table to see each weighted component and the value it was computed from." },
      { step: "Fix the component that dragged the score, re-paste, and compare — then copy or download the result." },
    ],
    whenToUse:
      "Use the clarity score tool when you want one figure that blends sentence length, vocabulary weight, variety and long sentences. The {{readability-grade-scorer|Readability Grade Scorer}} applies five published indices instead of a composite, and the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} opens the clause estimate behind heavy sentences. For the variety component in isolation, the {{sentence-variety-checker|Sentence Variety Checker}} plots the whole distribution, and when the fix is wording rather than structure, the {{simplify-text-tool|Simplify Text Tool}} applies published rewrites.",
    faqs: [
      {
        q: "Is this a published readability index?",
        a: "No. It is a weighted composite of four measured components, and the page says so. Every component, curve and weight is shown, which is what lets you audit or disagree with the number.",
      },
      {
        q: "What are the four components?",
        a: "Sentence length, complex-word rate, sentence variety and long-sentence share, weighted thirty, twenty-five, twenty-five and twenty. Each row of the components table shows the value it was computed from.",
      },
      {
        q: "Why did my score drop after adding short sentences?",
        a: "The choppiness rule penalises a mean below twelve words per sentence. One very short paragraph can pull the mean down, which is why the components table shows the mean beside the score.",
      },
      {
        q: "How much text should I paste for a stable score?",
        a: "At least about one hundred words; below that the page flags the sample as short. The word and sentence totals are displayed so you can judge stability yourself.",
      },
      {
        q: "Can I compare two drafts with this score?",
        a: "Yes, that is the intended use. Treat it as a comparison between drafts rather than an absolute, and read the components to see which curve moved.",
      },
    ],
  },

  "vocabulary-richness-scorer": {
    keywords: [
      "vocabulary richness",
      "type-token ratio",
      "guiraud index",
      "moving-average type-token ratio",
    ],
    intro:
      "The Vocabulary Richness Scorer measures how varied the vocabulary is using a moving-average type-token ratio and the Guiraud index, with the length trap in plain type-token ratio stated up front.",
    content:
      "Vocabulary richness asks how many different words a text uses, but the simplest answer is also the most misleading: plain type-token ratio falls mechanically as a text grows, because common words repeat. This scorer therefore leads with a moving-average type-token ratio that stays comparable across lengths, and shows the raw ratio second so you can see why. No band or pass or fail is attached anywhere, because richness depends on genre: legal writing repeats terms on purpose, and literary prose repeats them for effect.\n\nThe headline number is the moving-average type-token ratio at a window size you choose, defaulting to 100 words. The panel also reports total words, unique words, the whole-text type-token ratio, the Guiraud index — unique words divided by the square root of the total — the words used exactly once, and syllables per word. Every figure comes from the same normalised token stream, so they can be compared without worrying about which counter produced them.\n\n- Moving-average type-token ratio at an adjustable window, the headline figure because it survives length changes.\n- Whole-text type-token ratio, shown second with a note explaining why it falls as a text grows.\n- Guiraud index, which divides unique words by the square root of the word count and stays steadier across lengths.\n- Words used exactly once — the hapax count, a direct signal of vocabulary variety.\n- Syllables per word, from the shared syllable heuristic.\n- Copy report and Download produce a plain-text summary of every figure.\n\nTokens come from the shared Unicode tokenizer, normalised to lowercase with surrounding punctuation dropped. The moving-average type-token ratio follows Covington and McFall: the ratio is computed inside fixed-size windows and averaged, so a 200-word sample and a 2,000-word essay can be compared on the same scale. A window wider than the token list falls back to the whole text's ratio. The Guiraud index and the hapax share come from the same token stream. Everything runs locally, and a warning appears while the text is short enough that the figures are still settling.\n\n- Richness measures need a few hundred words before they stabilise; below that, every figure is provisional.\n- Repetition is not automatically a fault — deliberate repetition is a device, and technical terms must repeat.\n- The moving-average ratio depends on the chosen window, so two texts should be compared at the same window size.\n- Function words inflate variety counts in the same way as content words unless a stopword filter is applied separately.\n- There is no universal rich vocabulary target; genre sets the expectation, so the tool reports measurement plus a length warning.\n\nRead the figures as one signal among several. A draft whose moving-average ratio and Guiraud index both sit high is leaning on a wide vocabulary; one whose hapax count is tiny is reusing the same words. The typical comparison is between drafts of the same genre and similar length, where a gap of several points is worth a look and a gap under a point is noise.\n\nCombine the view with the Lexical Diversity Calculator, which reports the same underlying ratios across several window sizes, and with the Word Count Tool when you want the frequency table that shows exactly where the repeats come from. The in-page note on why the whole-text ratio is listed second is worth reading once, because it explains the trap that makes most vocabulary scores misleading.",
    howTo: [
      { step: "Paste a draft into the input panel; the richness figures update as you type." },
      { step: "Set the moving-average window if you want a different comparison scale from the default of 100 words." },
      { step: "Read the Richness panel for the moving-average ratio, the whole-text ratio, the Guiraud index, hapax count and syllables per word." },
      { step: "Use Copy report or Download to export the summary, and note the length warning until the text is long enough." },
    ],
    whenToUse:
      "Reach for the vocabulary richness view when you want to know whether a draft reuses the same words, not just how many it contains. The {{lexical-diversity-calculator|Lexical Diversity Calculator}} reports the same ratios across several window sizes, the {{average-word-length-calculator|Average Word Length Calculator}} covers the length side of vocabulary, and the {{word-count-tool|Word Count Tool}} supplies the frequency table that shows exactly which words are repeating.",
    faqs: [
      {
        q: "Why is plain type-token ratio shown second?",
        a: "Because it falls mechanically as a text grows, making short samples look richer than long ones. The headline figure is the moving-average ratio, which averages inside fixed windows and stays comparable across lengths.",
      },
      {
        q: "What is a good vocabulary richness score?",
        a: "There is no universal target. Legal and technical writing repeats terms deliberately, while literary prose repeats them for effect, so the tool reports measurements and a length warning instead of a pass or fail.",
      },
      {
        q: "How long should the text be?",
        a: "A few hundred words is the practical floor. Below that the figures are provisional, and the page displays a warning until the sample is long enough to be meaningful.",
      },
      {
        q: "What is the Guiraud index?",
        a: "Unique words divided by the square root of the word count. It is an algebraic correction for the length dependence of type-token ratio, so it stays steadier when comparing texts of different sizes.",
      },
      {
        q: "What counts as a unique word?",
        a: "A token that differs from every previous token after lowercasing and stripping surrounding punctuation. No stemming is applied, so run and running count separately.",
      },
    ],
  },

  "keyword-density-analyzer": {
    keywords: [
      "keyword density",
      "keyword density analyzer",
      "two-word phrases",
      "per 1,000 words",
    ],
    intro:
      "The Keyword Density Analyzer counts single words and two-word phrases, reports density against the full word total, and avoids inventing a pass or fail score.",
    content:
      "Keyword density is a count divided by a word total, and this keyword density analyzer states the denominator so the number can be checked. Paste an article, a landing page or a draft, and the tool ranks the single words and the two-word phrases the text actually uses, with counts, percentages and a per 1,000 words figure for each. The report describes repetition; it does not grade it.\n\nTwo tables make up the report. Single words lists one term per row; two-word phrases lists consecutive word pairs, which is where phrases like content strategy or search intent appear. Matching is case-insensitive, windows are computed over the token stream, and a phrase must contain at least one non-stopword before it is reported, so a string of function words never shows up as a keyword. Controls set the minimum occurrences, the number of rows per table and whether function words are hidden from the single-word view.\n\n- A minimum-occurrences filter, defaulting to 2, so one-off words stay out of the tables.\n- A rows-per-table setting, defaulting to 15, to keep the report readable.\n- A hide function words toggle that keeps the, of and and out of the single-word table.\n- Single-word rows with term, count, density and occurrences per 1,000 words.\n- Two-word phrase rows with the same four columns, so phrase repetition is as visible as word repetition.\n- Copy report and Download export the tables as plain text.\n\nDensity is count divided by total words times 100, where the denominator is every word token including stopwords — that is what percentage of the text means to a reader. N-grams are windows of consecutive tokens joined by a space and counted case-insensitively. Entries are sorted by count and then by first appearance, so equal counts keep document order and the table does not reshuffle between keystrokes. The tool reports repetition rather than a verdict: there is no universal safe density, which is why the report shows counts and distances instead of a score.\n\n- Density varies with text length by construction; a short page will always show higher percentages for the same repetition.\n- Stemming is not applied, so run and running count as different terms.\n- Phrases longer than two words are not reported.\n- Function words are included in the denominator even when hidden from the table.\n- A high count is a signal to read the passage in context, not proof of keyword stuffing.\n\nUse the analyzer when you want to see what a page repeats: checking a draft against its target term, noticing a phrase that appears far more often than the writing can justify, or confirming that a rewrite actually reduced repetition. Read the top rows in context before changing anything, because a term repeated five times in a technical explainer may be required for clarity, while the same count in a short promotional paragraph may be doing all the work.\n\nFor length-based companions, the Word Count Tool reports total words and most-used words, while the Vocabulary Richness Scorer covers how varied the vocabulary is overall. The how-to-read-density note under the tables is worth keeping in view, because it explains why a percentage is a description of the text, not a threshold to cross.",
    howTo: [
      { step: "Paste your text into the input panel; the density tables build as you type." },
      { step: "Set the minimum occurrences and rows per table if the defaults of 2 and 15 do not fit your document." },
      { step: "Toggle hide function words to switch the single-word table between content words and every word." },
      { step: "Read the density and per-1,000-words columns for both single words and two-word phrases, then copy or download the report." },
    ],
    whenToUse:
      "Use the keyword density analyzer to see what a page repeats and whether the repetition is justified. The {{word-count-tool|Word Count Tool}} gives the total and most-used words, the {{character-count-tool|Character Count Tool}} covers limits expressed in characters, and the {{lexical-diversity-calculator|Lexical Diversity Calculator}} shows how varied the vocabulary is overall rather than term by term.",
    faqs: [
      {
        q: "What is a safe keyword density?",
        a: "There is no universal safe figure. Density depends on text length and genre, and the useful question is whether a term repeats more often than the writing can justify, which is why the tool reports counts and distances instead of a score.",
      },
      {
        q: "Why are two-word phrases included?",
        a: "Because repeated meaning usually lives in phrases. A phrase like content strategy can repeat while neither word does on its own, so the bigram table catches repetition the single-word table misses.",
      },
      {
        q: "Why does the density denominator include stopwords?",
        a: "Because percentage of the text should mean exactly that. Excluding function words would inflate every percentage and make the figure impossible to reproduce by hand, so the denominator is stated on the panel.",
      },
      {
        q: "Does the tool stem words?",
        a: "No. Run and running are separate rows, which keeps the report reproducible but means morphological repetition is not merged.",
      },
      {
        q: "Can I export the tables?",
        a: "Yes, Copy report places the ranked tables on the clipboard as plain text and Download saves the same report as a file.",
      },
    ],
  },

  "flesch-kincaid-score-calculator": {
    keywords: [
      "flesch-kincaid grade",
      "flesch reading ease",
      "grade level",
      "syllables per word",
    ],
    intro:
      "The Flesch-Kincaid Score Calculator applies the two published formulas — grade level and reading ease — and shows the sentence and syllable inputs behind them.",
    content:
      "The Flesch-Kincaid formulas turn sentence length and word weight into a school grade. This flesch-kincaid grade calculator applies both published equations to your text and then shows the inputs they were computed from, so the score can be checked by hand rather than taken on trust. A readability number whose arithmetic is visible is far more useful in an editorial discussion than one that appears from nowhere.\n\nThe grade level formula is 0.39 times average sentence length plus 11.8 times average syllables per word minus 15.59. The Flesch Reading Ease formula is 206.835 minus 1.015 times average sentence length minus 84.6 times syllables per word. The panel reports both scores, the average sentence length, syllables per word, and the total words, sentences and syllables behind them, plus a grade reference table that labels each score range from very easy through standard to very difficult.\n\n- Flesch-Kincaid grade level, the US school-grade score.\n- Flesch Reading Ease on the published 0-to-100 scale with its named bands.\n- Average sentence length in words and syllables per word, the two inputs both formulas share.\n- Word, sentence and syllable totals so the arithmetic can be reproduced.\n- A grade reference table mapping score ranges to typical material.\n- Copy result and Download export the figures and the formula used.\n\nSyllables come from a documented heuristic rather than a dictionary: vowel groups are counted with y included, a silent final e is removed except after consonant plus l and except for ed and es endings that add no syllable, adverbs in -ely are repaired, and a curated exception table fixes hiatus words. Numbers count as one syllable. Sentence and word counts come from the shared Unicode tokenizer. The tool flags a short sample below roughly 100 words, because every formula here becomes noisy on small inputs. Pasting a representative stretch of the document rather than the title and first line is the single biggest thing you can do to make the scores stable.\n\n- Syllable counts are estimates, so every score carries that error; proper nouns, brand names and abbreviations are the main sources.\n- The formulas were designed for English prose and are not meaningful for other languages.\n- Short samples below roughly 100 words produce unstable scores, which the page flags explicitly.\n- Non-English words and acronyms are counted as written, which can stretch the syllables-per-word figure.\n- A score describes the text, not the reader: background knowledge changes comprehension more than grade level does.\n\nUse the calculator when you need a defensible number rather than a feeling: checking a document against a plain-language target, comparing two drafts of the same passage, or reporting readability in a review. Read the grade level and the reading ease together, because they share inputs but move in opposite directions, and that disagreement is a useful cross-check. When a score looks wrong, the input figures are where to look first: an odd syllables-per-word value usually traces back to technical terms or abbreviations.\n\nWhen you want the same machinery expressed through other published formulas, the Gunning Fog Index and SMOG Index calculators apply their own arithmetic to the same token counts, and comparing the three is the quickest way to see whether a passage is genuinely dense or merely unusual in one dimension.",
    howTo: [
      { step: "Paste around 100 words or more of representative text; the scores update as you type." },
      { step: "Read the Score panel for the Flesch-Kincaid grade level and the Flesch Reading Ease value." },
      { step: "Check the inputs — average sentence length, syllables per word, and the word, sentence and syllable totals." },
      { step: "Use the grade reference table to interpret the score, then Copy result or Download to keep the figures." },
    ],
    whenToUse:
      "Use the Flesch-Kincaid calculator when a defensible readability number matters: plain-language targets, editorial review notes or comparing two drafts of the same passage. The {{gunning-fog-index-calculator|Gunning Fog Index Calculator}} and the {{smog-index-calculator|SMOG Index Calculator}} apply different published formulas to the same counts, so their agreement is a useful cross-check. When a formula points at word weight, the {{average-word-length-calculator|Average Word Length Calculator}} shows which words are responsible.",
    faqs: [
      {
        q: "What do the two Flesch-Kincaid numbers mean?",
        a: "The grade level is the US school grade a reader needs, and reading ease is a 0-to-100 comfort score where higher is easier. They share inputs but move in opposite directions, so reading them together is a useful check.",
      },
      {
        q: "How many words should I paste?",
        a: "At least about 100. Below that the formulas are noisy and the page flags the short sample; a few hundred words of representative prose is better still.",
      },
      {
        q: "Why does the score change when I split a sentence?",
        a: "Both formulas include average sentence length, so splitting long sentences lowers the grade and raises the ease. Replacing long words with shorter ones moves the other input.",
      },
      {
        q: "Are syllable counts exact?",
        a: "No. Syllables come from a documented heuristic with rules for silent e, ed and es endings, -ely adverbs and a curated exception list. Proper nouns and technical terms are the usual sources of error.",
      },
      {
        q: "Can I use the score for languages other than English?",
        a: "No. The formulas were calibrated on English and the syllable heuristic is English-specific, so scores for other languages are not meaningful.",
      },
    ],
  },

  "gunning-fog-index-calculator": {
    keywords: [
      "gunning fog index",
      "complex words",
      "proper nouns",
      "average sentence length",
    ],
    intro:
      "The Gunning Fog Index Calculator applies Robert Gunning's formula, counts complex words by his definition and lets you exclude capitalised proper nouns.",
    content:
      "The Gunning Fog index estimates the years of formal education a reader needs to understand a passage on first reading. This calculator applies the published formula, 0.4 times average sentence length plus 100 times complex words divided by the words total, and it counts complex words using Gunning's own definition rather than a loose approximation. The definition matters, because most disagreements about a Fog score come down to which words were classified as complex.\n\nA complex word is one with three or more syllables, excluding words that reach three syllables only through an es, ed or ing ending, and excluding tokens that are capitalised in the source because they are likely proper nouns. The checkbox for excluding capitalised words matches Gunning's original instruction. The panel reports the Fog index, the complex-word count, the share of the text they represent, the average sentence length, and the word and sentence totals behind the score, so every component of the arithmetic is visible.\n\n- The Fog index itself, rounded to one decimal place as these indices are usually quoted.\n- Complex words with three or more syllables, counted by Gunning's definition.\n- The share of the text classified as complex, so the reason behind a high score is visible.\n- Average sentence length in words, the other half of the formula.\n- An exclude capitalised words option that drops likely proper nouns from the complex-word count.\n- An arithmetic panel showing 0.4 times the sum of ASL and 100 times complex divided by words.\n\nSyllable counts come from the same documented heuristic used across this domain's readability tools: vowel groups, silent-e handling, ed and es endings, -ely repair and a curated exception table. Capitalised detection works on the source token, so a sentence-initial word counts as capitalised and is excluded when the option is on. Word segmentation is the shared Unicode tokenizer. Because both inputs are counts you can inspect, a surprising index can be traced to the exact words and sentences that produced it.\n\n- Syllable counting is heuristic, so borderline three-syllable words can be misclassified in either direction.\n- Gunning's exclusion of proper nouns is approximate: a capitalised common noun or a lowercase brand name will be treated the wrong way.\n- Short samples are unstable; most references suggest at least 100 words.\n- The index ignores vocabulary difficulty beyond length, so jargon built from short words can score easier than it reads.\n- It is a US grade-level convention, not a comprehension guarantee.\n\nReach for the Fog index when you want to show the effect of simplification in numbers: paste a draft, note the score and the complex-word list, simplify, then paste again. Comparing before and after is the real use of the tool, because a single absolute Fog value means little across genres — a legal memo and a children's story are not aiming at the same number. The same discipline applies when the score is quoted to someone else: include the sentence count and the complex-word share, because those are what the number actually means.\n\nThe Flesch-Kincaid Score and SMOG Index calculators apply the same sentence and syllable counts through different formulas, which is useful when you want to check that a revision moved all three indices in the same direction rather than gaming one of them.",
    howTo: [
      { step: "Paste the passage you want to score; the Fog index appears as you type." },
      { step: "Read the Fog index panel for the score, the complex-word count and its share of the text." },
      { step: "Toggle exclude capitalised words to apply Gunning's proper-noun rule, and check the arithmetic panel to see the formula with your figures." },
      { step: "Simplify the words and sentences the panel flags, then re-paste to compare before and after." },
    ],
    whenToUse:
      "Use the Fog index when you want to see simplification work in numbers: score a draft, simplify the complex words and sentences the panel lists, then score it again. The {{flesch-kincaid-score-calculator|Flesch-Kincaid Score Calculator}} and the {{smog-index-calculator|SMOG Index Calculator}} cover the same ground with different formulas, and the {{average-word-length-calculator|Average Word Length Calculator}} isolates the word-length half of the arithmetic when a score moves unexpectedly.",
    faqs: [
      {
        q: "What Fog score should I aim for?",
        a: "A Fog of 7 to 9 reads comfortably for a general audience; 12 and above is university level. The number to watch is the direction of travel when you revise, not the absolute value.",
      },
      {
        q: "Why are proper nouns excluded from complex words?",
        a: "Gunning's original definition excludes words that reach three syllables only as names, since a reader does not need vocabulary knowledge to read them. The checkbox applies that rule; turning it off counts them.",
      },
      {
        q: "How does Fog differ from Flesch-Kincaid?",
        a: "Both use average sentence length, but Fog weights complex words by their share of the text while Flesch-Kincaid uses syllables per word. Different formulas, same underlying counts.",
      },
      {
        q: "Why is my Fog score lower after editing?",
        a: "Splitting sentences lowers average sentence length, and replacing three-syllable words lowers the complex-word share. The panel shows both counts, so you can see which change did the work.",
      },
      {
        q: "Is the syllable count exact?",
        a: "No, it is a documented heuristic. Edge cases around silent letters, hyphenated compounds and imported words can shift a count in either direction.",
      },
    ],
  },

  "smog-index-calculator": {
    keywords: [
      "smog index",
      "polysyllabic words",
      "reading grade",
      "sample size",
    ],
    intro:
      "The SMOG Index Calculator applies the published formula, counts polysyllabic words and states the 30-sentence sample size it was validated on.",
    content:
      "The SMOG index — Simple Measure of Gobbledygook — estimates the reading grade a person needs to understand a passage. This smog index calculator applies the published formula, 1.043 times the square root of polysyllables times 30 divided by sentences, plus 3.1291, and it counts every word with three or more syllables. Like its siblings in this domain, it shows the counts the score was built from rather than dropping a number with no provenance.\n\nThe panel reports the SMOG index and its reading grade, the polysyllabic words count, the share of the text those words represent, and the sentence, word and syllable totals behind the score. A sample size line states how many sentences were analysed: SMOG was validated on at least 30 sentences, so shorter passages are flagged as provisional. A conversion table maps the index to a reading grade, which is the form most style guides quote.\n\n- The SMOG index to one decimal place.\n- The reading grade it corresponds to, on the US school-grade scale.\n- Polysyllabic words, counted as any token with three or more syllables.\n- The share of the text made up of polysyllables.\n- Sentence, word and syllable totals from the shared counters.\n- A sample size note comparing the text against the 30 sentences SMOG was validated on.\n\nThe formula depends on counting sentences and polysyllabic words, both taken from the shared Unicode tokenizer and the documented syllable heuristic. The multiplication by 30 and division by the sentence count is what makes SMOG sample-dependent: the score estimates the grade needed for a full text from a sample, which is why the tool states the sample size instead of hiding it. Two texts with identical vocabulary can receive different scores purely because one was pasted in longer form. Everything runs locally in the page; no text is uploaded and no result is stored.\n\n- Below 30 sentences SMOG is unreliable, and on very short samples it overestimates the grade.\n- The syllable heuristic can miscount polysyllables, especially proper nouns and technical terms.\n- SMOG rewards short sentences and few long words, so splitting sentences alone can lower it.\n- The index is defined for English and has no published calibration for other languages.\n- It estimates first-reading comprehension, not enjoyment or retention.\n\nUse the SMOG index when you need a conservative reading-grade estimate for health, instructional or public-facing material, where understanding matters more than pace. Any summary of the score should carry the sample size with it, which is why that line is printed beside the number rather than buried in a footnote. Because it was validated on 30-sentence samples, paste a representative stretch rather than a caption, and treat short results as indicative only. When the score matters to a decision, supply a longer sample rather than rounding a short one, because the formula's reliability depends on the sample more than on the text. The share-of-text figure is the quickest explanation for a high score: if the polysyllabic share is small but the score is high, the text's structure is doing more work than its vocabulary.\n\nThe Flesch-Kincaid and Gunning Fog calculators apply different formulas to the same counts, so running all three and looking at their spread is a fast way to judge whether a passage is genuinely dense or merely unusual in one dimension.",
    howTo: [
      { step: "Paste the whole passage into the input panel; the index appears as you type." },
      { step: "Read the SMOG index panel for the score, its reading grade and the polysyllabic-word counts." },
      { step: "Check the sample size line: with fewer than 30 sentences, treat the result as provisional." },
      { step: "Use the SMOG to grade table to interpret the score, and re-run after edits to see the movement." },
    ],
    whenToUse:
      "Use the SMOG index for public-facing material where first-reading comprehension matters most, and paste at least 30 sentences so the sample-size caveat does not apply. The {{flesch-kincaid-score-calculator|Flesch-Kincaid Score Calculator}} and the {{gunning-fog-index-calculator|Gunning Fog Index Calculator}} give alternative grades from the same counts, and the {{sentence-count-tool|Sentence Count Tool}} shows whether the long sentences behind a high score are isolated or spread through the text.",
    faqs: [
      {
        q: "How many sentences should I paste for SMOG?",
        a: "At least 30, the sample size the formula was validated on. With fewer, the tool flags the result as provisional and the estimate typically runs high.",
      },
      {
        q: "Why does SMOG rise on short texts?",
        a: "The formula scales by the square root of polysyllables times 30 divided by sentences. With few sentences the multiplier grows and the estimate inflates, which is exactly why the sample-size note exists.",
      },
      {
        q: "What counts as a polysyllabic word?",
        a: "Any token with three or more syllables by the shared syllable heuristic. Numbers count as one syllable, and no words are excluded as proper nouns.",
      },
      {
        q: "Is SMOG better than Flesch-Kincaid?",
        a: "Neither is better in general. SMOG is more conservative on health and instructional material, while the Flesch formulas read more quickly across genres; running both and comparing is the safer habit.",
      },
      {
        q: "Why do commas and hyphens not matter to SMOG?",
        a: "The formula only counts sentences and polysyllabic words, so punctuation does not enter the arithmetic. A text can be difficult by structure and still score the same as one that is difficult by vocabulary.",
      },
    ],
  },

  "lexical-diversity-calculator": {
    keywords: [
      "lexical diversity",
      "type-token ratio",
      "mattr",
      "herdan index",
    ],
    intro:
      "The Lexical Diversity Calculator reports tokens, types, type-token ratio, the Guiraud and Herdan indices and MATTR across window sizes.",
    content:
      "Lexical diversity measures how many different words a text uses relative to its length. The catch is that plain type-token ratio falls as a text grows, so a short sample looks more diverse than a long one even when the vocabulary is identical. This lexical diversity calculator shows the length-sensitive measures alongside the ones that correct for it, and the table of MATTR values across window sizes is the part that answers the comparison question fairly.\n\nThe main panel reports tokens, types, the whole-text type-token ratio, the Guiraud index — types divided by the square root of tokens — the Herdan index, which uses logarithms, and the sentence count. A table below reports MATTR, the moving-average type-token ratio, at a reference window you choose, so the same text can be examined at several window sizes on one screen. When the text is shorter than a few hundred tokens, a note warns that every measure here is provisional.\n\n- Tokens and types, the raw counts every other measure divides.\n- Type-token ratio, shown with the warning that it falls as text length grows.\n- Guiraud index, types divided by the square root of tokens, which stays steadier across lengths.\n- Herdan index, log types divided by log tokens, a compression-based alternative.\n- MATTR by window size, averaged over fixed windows so short and long samples can be compared.\n- A note explaining that none of these figures is a quality score.\n\nTokens are normalised through the shared Unicode tokenizer with case folded and surrounding punctuation dropped. MATTR follows Covington and McFall: within each window the type-token ratio is computed, then the window values are averaged, which removes most of the length dependence that makes plain type-token ratio unsuitable for comparison. The Guiraud and Herdan indices are algebraic corrections rather than empirical ones. All of the measures share one token stream, so they rise and fall together when the text changes. Comparing two drafts that differ greatly in length without a length-corrected measure is the classic mistake, and the table exists to make that comparison defensible rather than impressionistic.\n\n- Diversity measures stabilise only after several hundred tokens; short texts flatter themselves.\n- MATTR depends on window size, so comparisons must hold the window constant between texts.\n- Tokenisation rules decide what counts as the same type: case folding merges capitalised variants, and no stemming is applied.\n- Genre and purpose dominate interpretation, because technical writing repeats terms deliberately.\n- None of the measures detects vocabulary difficulty, only repetition.\n\nRead the table across window sizes rather than trusting one figure: a text whose MATTR is stable from 50 to 200 words is genuinely varied, while one that drops sharply is leaning on repetition. Compare drafts of the same genre and similar length, and treat any gap under a few points as noise rather than signal. If a gap survives that check, read the MATTR table again at the two window sizes that bound the difference, because an unstable value is the usual explanation.\n\nThe Vocabulary Richness Scorer presents the same underlying ratios around a single headline window, the Text Fingerprint Analyzer folds type-token ratio and hapax share into a wider stylometric profile, and the which-measure-to-trust note below the tables explains why several measures are shown instead of one.",
    howTo: [
      { step: "Paste a draft into the input panel; the diversity figures update as you type." },
      { step: "Set the reference window if you want a comparison scale other than the default." },
      { step: "Read the Diversity panel for tokens, types, type-token ratio, the Guiraud and Herdan indices, and the sentence count." },
      { step: "Check the MATTR table across window sizes to see whether the value is stable, then copy or download the report." },
    ],
    whenToUse:
      "Reach for the lexical diversity view when comparing drafts of different lengths, since length-corrected measures are the only fair comparison. The {{vocabulary-richness-scorer|Vocabulary Richness Scorer}} presents the same ratios around a single headline window, the {{text-fingerprint-analyzer|Text Fingerprint Analyzer}} folds diversity into a wider stylometric profile, and the {{average-word-length-calculator|Average Word Length Calculator}} adds the length dimension these measures ignore.",
    faqs: [
      {
        q: "Why is type-token ratio not enough?",
        a: "It falls as a text grows, so a short sample always looks more diverse than a long one. MATTR and the Guiraud and Herdan indices correct for length in different ways, which is why several measures are shown.",
      },
      {
        q: "Which window size should I use for MATTR?",
        a: "100 tokens is the common default and works for most texts. If you compare two texts, use the same window for both, and check the table to see whether the value is stable across sizes.",
      },
      {
        q: "How long does the text need to be?",
        a: "Several hundred tokens before the measures settle. The page displays a provisional warning below that threshold.",
      },
      {
        q: "Is high lexical diversity always good?",
        a: "No. Repetition can be deliberate — technical terms must repeat, and refrains repeat for effect. Diversity describes the vocabulary; it does not grade it.",
      },
      {
        q: "What is the Herdan index?",
        a: "The log of the number of types divided by the log of the number of tokens. It is a length-corrected diversity measure that compresses large counts, so it moves more slowly than plain type-token ratio.",
      },
    ],
  },

  "text-fingerprint-analyzer": {
    keywords: [
      "text fingerprint",
      "stylometric profile",
      "function-word similarity",
      "authorship attribution",
    ],
    intro:
      "The Text Fingerprint Analyzer profiles a text's measurable style features and compares two texts field by field — while stating plainly what it is not.",
    content:
      "A text fingerprint, as a browser tool can honestly produce one, is a set of measurable features: sentence-length distribution, word length, lexical diversity, punctuation rates and the share of function words. This analyzer computes that stylometric profile for one text and compares it with a second, showing every difference rather than a single opaque score. The honesty of the tool lies in what it refuses to claim: authorship attribution and AI detection need calibrated corpora and published error rates, and those are not available in a page.\n\nText A is the reference and Text B is the comparison. The panel reports a function-word similarity — the cosine similarity of the two closed-class share vectors, from 0 to 1 — with a plain-language band such as nearly identical profile or loosely related. Below that, the profile of text A lists sentences, mean sentence length, sentence-length variation, mean word length, type-token ratio, Guiraud index, words used once and commas per 1,000 words, and a comparison table shows each feature for both texts with the difference between them.\n\n- Two text inputs: a reference text A and a comparison text B.\n- Function-word similarity as the cosine similarity of the closed-class share vectors, with a named band.\n- Sentence features: count, mean sentence length and sentence-length variation.\n- Word features: mean word length, syllables per word and the share of words of seven or more letters.\n- Diversity features: type-token ratio, Guiraud index and the share of words used exactly once.\n- Punctuation rates per 1,000 words for commas, semicolons, colons, dashes, questions, exclamations, parentheses and quotation marks.\n\nThe profile is computed from the shared tokenizer and syllable heuristic: sentence segments yield length statistics, word tokens yield length and diversity measures, and a curated function-word list yields the closed-class shares. Similarity is cosine similarity over those share vectors, a standard vector comparison rather than a trained model. The bands run from nearly identical at 0.98 and above through very close, similar and loosely related to distinct profiles below 0.8. Everything runs in the page, and both texts are gone when you leave.\n\n- This is not authorship attribution, plagiarism detection or AI detection; those need calibrated corpora and published error rates, which a browser tool cannot supply.\n- A high similarity means the two texts distribute function words and sentence lengths alike; two drafts by the same writer often score high, and so do two texts in the same genre by different writers.\n- Punctuation features depend on formatting, because quotation styles and dash choices change the rates without changing the writing.\n- Non-English text and quoted material distort the function-word vectors.\n- Short samples produce unstable profiles; a few hundred words per text is the practical floor.\n\nUse the analyzer to compare what can be measured: whether two drafts sound like the same voice, whether a rewrite preserved the original's rhythm, or how a translation differs from its source in sentence shape. Read the field-by-field table rather than the similarity number alone, because the single figure condenses every feature, while the table shows which of them actually differ.\n\nThe Lexical Diversity Calculator and Vocabulary Richness Scorer go deeper on the vocabulary side, and the Word Count Tool supplies the raw counts behind every profile. The what-a-fingerprint-is-and-is-not note at the bottom of the page is deliberately blunt, and it is worth reading before quoting any similarity figure in an argument.",
    howTo: [
      { step: "Paste the reference text into the Text A panel and the text you want to compare into the Text B panel." },
      { step: "Read the Profile similarity panel for the function-word similarity and its named band." },
      { step: "Check the profile of text A for the sentence, word, diversity and punctuation features." },
      { step: "Scan the field-by-field comparison table for the features that differ beyond noise, then copy or download the report." },
    ],
    whenToUse:
      "Use the text fingerprint analyzer to compare measurable style: two drafts by the same author, an original and its rewrite, or a translation against its source. The {{lexical-diversity-calculator|Lexical Diversity Calculator}} goes deeper on the vocabulary ratios, the {{vocabulary-richness-scorer|Vocabulary Richness Scorer}} focuses on richness specifically, and the {{keyword-density-analyzer|Keyword Density Analyzer}} shows term repetition, which the profile's aggregate features deliberately do not capture.",
    faqs: [
      {
        q: "Can this tool tell whether two texts were written by the same person?",
        a: "No. The profile compares measurable features, and similarity is cosine similarity over function-word shares. Authorship attribution needs calibrated corpora and published error rates, which this tool does not have.",
      },
      {
        q: "Why do two texts by one writer sometimes score low?",
        a: "Different genres, formats or levels of editing change sentence length and punctuation rates. The feature table shows which dimensions differ, which is more informative than the single similarity figure.",
      },
      {
        q: "What does function-word similarity actually measure?",
        a: "How similarly the two texts distribute closed-class words like the, of and and. It is a property of style rather than topic, but it cannot identify an author on its own.",
      },
      {
        q: "How much text do I need in each box?",
        a: "A few hundred words per text for a stable profile. Shorter samples produce provisional features, especially for diversity and punctuation rates.",
      },
      {
        q: "Is either text stored or uploaded?",
        a: "No. Both texts are profiled in the browser, and they are gone when the page closes; nothing is sent to a server.",
      },
    ],
  },
};
