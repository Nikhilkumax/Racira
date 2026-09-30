import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B5, text-analysis group: authored SEO entries for the readability,
 * frequency and stylometry tools backed by the shared engine in
 * `src/domains/writing/lib/text/`. Keys are registry slugs; see ../tool-seo.ts
 * for the contract these entries are validated against.
 */
export const B5_ANALYSIS_SEO: Record<string, ToolSeo> = {
  "readability-grade-scorer": {
    keywords: ["readability grade", "reading level", "readability formula"],
    intro:
      "The Readability Grade Scorer runs every common published readability formula over your text at once and shows the counts each one was computed from, so a reading level you can check by hand replaces a number you have to trust.",
    content: `A readability grade turns a passage into a number on a school scale, and this scorer computes every common published formula at once so you can see where they agree and where they do not. Nothing is estimated. Each score is a formula applied to counts the page displays beside it, in your browser and without an upload.\\n\\nSix formulas are reported together. Flesch Reading Ease scores from 0 to 100, where higher means easier. Flesch-Kincaid Grade Level, Gunning Fog, SMOG, Coleman-Liau and the Automated Readability Index each report a US school grade. They are not rival opinions competing for the truth. They are different arithmetic over the same handful of counts — words, sentences, syllables, words of three or more syllables and Gunning complex words — and their disagreements are informative rather than a bug. Flesch Reading Ease and the syllable-based grades rise and fall with word length, while Coleman-Liau and the Automated Readability Index use letters and characters instead. That is why the letter-based pair often lands a grade or two away from the syllable-based pair on the same passage.\\n\\nA reading level is only as good as the counts behind it, so the tool prints them. You get words, sentences, paragraphs, syllables, the share of words with three or more syllables, the Gunning complex-word count and the two averages every syllable formula needs: words per sentence and syllables per word. From that table any of the six can be recomputed by hand, and a score you disagree with can be traced to the input that produced it rather than accepted on faith.\\n\\nSyllables come from a documented English heuristic rather than a pronunciation dictionary. Vowel groups are counted, a silent final e is dropped after a consonant, the -ed and -es endings are discounted unless the stem genuinely needs the syllable, and a short exception list covers hiatus words such as media, theatre and aquarium. The heuristic is right most of the time and wrong occasionally, and every score built on it inherits that error. The page says so instead of implying a dictionary was consulted.\\n\\nTwo reliability limits matter more than the choice of formula. Readability formulas are quoted for samples of roughly 100 words or more and swing widely below that, so a single sentence can produce a grade that means nothing at all. SMOG was validated on at least 30 sentences. Both thresholds are checked against your text and reported when they are not met, which is the difference between an indicative figure and a misleading one.\\n\\nWhat to aim for depends entirely on the audience. Plain-language guidance for public communication usually sits around a 7th to 9th grade score. Technical documentation written for specialists reads higher, and it should. Academic abstracts read higher still. A readability grade describes sentence and word arithmetic; it says nothing about argument, structure, tone or whether the writing is any good, and it cannot tell you that a short, clear sentence is condescending or that a long one is elegant.\\n\\nThe practical use is comparison rather than a target. Score a draft, rewrite the sentences the table flags as long or polysyllabic, then score it again. Because the formulas are deterministic and the counts are visible, the difference between the two readings is a real change in the text rather than noise. Paste the result into a submission form, keep it in the copy summary, or download it as plain text; nothing you type is stored.`,
    howTo: [
      { step: "Paste or type your text — at least a few paragraphs, since the formulas need roughly 100 words to settle." },
      { step: "Read the overall grade level, then the six individual scores in the table beneath it." },
      { step: "Check the counts panel: words, sentences, syllables and the share of long words are the inputs every formula uses." },
      { step: "Read the notes under the scores, which flag a short sample and the SMOG sentence threshold." },
      { step: "Rewrite the flagged sentences, paste back, and compare the two readings; copy or download the summary to keep it." },
    ],
    whenToUse: `Use the readability grade when you want one pass over every formula at once and need to see the underlying counts. When the question is narrow — the education-grade number alone — the {{flesch-kincaid-score-calculator|Flesch-Kincaid Score Calculator}} walks through the two Flesch formulas from the same engine, and the {{smog-index-calculator|SMOG Index Calculator}} covers the index health-literacy research prefers.\\n\\nIf the scores come out high because individual sentences are overloaded rather than because the vocabulary is difficult, the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} locates the specific sentences carrying too many clauses, which is a more actionable start than the grade itself.`,
    faqs: [
      {
        q: "Which readability formula should I use?",
        a: "For general prose, Flesch-Kincaid Grade Level is the usual default and Flesch Reading Ease is easy to read as a plain score. For health and patient material, SMOG is the common choice. When the answer matters, compare two or three; a single formula is a convention, not a measurement.",
      },
      {
        q: "Why do the six formulas disagree with each other?",
        a: "They use different inputs. The syllable-based formulas respond to word length, while Coleman-Liau and the Automated Readability Index use letters and characters. A passage with short words but long sentences therefore scores differently depending on which arithmetic is applied.",
      },
      {
        q: "Does a reading level measure how good the writing is?",
        a: "No. It measures sentence length and word length. A high score can mean dense prose or a specialist audience, and a low score can mean plain writing or a shallow one. Treat the grade as a property of the arithmetic, not a verdict.",
      },
      {
        q: "How are syllables counted without a dictionary?",
        a: "With a documented heuristic: vowel groups are counted, silent final e is dropped, -ed and -es endings are discounted unless the stem needs them, and a short exception list covers hiatus words. It is accurate most of the time and occasionally wrong, which the notes state.",
      },
      {
        q: "Why is the grade so high on a short paragraph?",
        a: "Formulas are quoted for samples of about 100 words or more. Below that, one long sentence or one polysyllabic word moves the grade several levels and a single sentence can produce any number at all. The tool flags the sample size rather than hiding it.",
      },
    ],
  },

  "sentence-complexity-analyzer": {
    keywords: ["sentence complexity", "complex sentences", "clause count"],
    intro:
      "The Sentence Complexity Analyzer estimates how many clauses each sentence carries, ranks the heaviest ones and states exactly how the clause count is derived, so you can see which sentences to split before a reader gives up on them.",
    content: `Most sentences that read badly are not badly chosen words; they carry too many ideas at once. The Sentence Complexity Analyzer estimates the clause load of every sentence in your text, then ranks the sentences that carry the most, so the rewrite can start where it matters.\\n\\nThe clause count is an estimate with the method published on the page, because a browser tool does not have a parser and pretending otherwise would be dishonest. A sentence starts at one clause. It gains one for each coordinating conjunction, each subordinating conjunction, each relative pronoun, and each semicolon or colon. Commas are displayed but never counted. That last decision is deliberate: a list of three items separated by commas is one clause, and a tool that treated every comma as a boundary would make ordinary grocery lists look unreadable.\\n\\nAlongside the clause estimate, each sentence is measured for words, characters, commas, words of three or more syllables and words of seven or more letters. Those figures are exact — they come from the same Unicode tokenizer the whole domain uses — so even when you disagree with the clause estimate you are still looking at true counts. Words per clause is the estimate divided into the sentence length, and it is the single most useful number here: a sentence of 40 words in two clauses is dense, while a sentence of 40 words in six clauses is merely busy.\\n\\nThe summary reports the average clause estimate, the average words per clause, the share of sentences that are single-clause, and the share carrying three or more clause markers. Below that sit two ranked tables: the sentences with the most clauses, and the longest sentences with their comma and long-word counts. Those tables are where an editing pass begins. A sentence that is long and multi-clausal is the usual culprit; a long sentence with one clause is often fine and simply needs no change.\\n\\nThe estimate has a known blind spot and the page names it. Without a parse it cannot tell a restrictive relative clause from an appositive, so a sentence with several that or which phrases scores higher than its meaning warrants, and a sentence built from long noun phrases scores lower than it reads. Treat the ranking as a list of sentences worth reading again, not as a verdict on each one.\\n\\nComplexity is not a fault by itself. Academic and legal writing often needs subordination to keep a qualification next to what it qualifies, and splitting such a sentence can change its meaning. The tool is most useful on prose that intends to be clear: marketing copy, documentation, essays, instructions. There, a high words-per-clause figure usually identifies a sentence that has quietly acquired three separate points and would be clearer as two or three.\n\nOne last use is diagnostic rather than corrective. If a readability score comes out high while the vocabulary is plainly simple, the cause is usually complex sentences rather than difficult words, and the ranked tables here name them without your having to guess. A single heavily subordinated sentence can raise a whole paragraph's grade, and finding it is often the entire fix.`,
    howTo: [
      { step: "Paste the text you want to examine; every sentence is measured as you type." },
      { step: "Read the average clauses per sentence and the average words per clause in the summary panel." },
      { step: "Open the table of sentences carrying the most clauses and read the top few in full." },
      { step: "Check the longest-sentences table for sentences that are long but single-clause, which often need no change." },
      { step: "Split the genuinely overloaded sentences, paste the revision back, and watch the averages fall." },
    ],
    whenToUse: `Use the complexity analyzer when individual sentences feel heavy and you need to find which ones. When the issue is the overall distribution rather than any single sentence — every sentence the same length, or a monotonous stretch — the {{sentence-variety-checker|Sentence Variety Checker}} measures the spread instead.\\n\\nIf the sentences are fine and the difficulty is in the vocabulary, the {{readability-grade-scorer|Readability Grade Scorer}} will show that in the syllable-based scores, and the {{flesch-kincaid-score-calculator|Flesch-Kincaid Score Calculator}} breaks the same reading into its two Flesch formulas.`,
    faqs: [
      {
        q: "How does the tool count clauses?",
        a: "It starts each sentence at one and adds one for every coordinating conjunction, subordinating conjunction, relative pronoun, semicolon and colon. It is a documented estimate rather than a grammatical parse, and the page lists every marker it looks for.",
      },
      {
        q: "Why are commas not treated as clause boundaries?",
        a: "Because a list of three items separated by commas is a single clause, and counting commas would make every list look like four clauses. Commas are shown per sentence so you can see them, but they never raise the estimate.",
      },
      {
        q: "What words-per-clause figure is comfortable?",
        a: "There is no universal threshold, but a figure above roughly 20 words per clause usually means a sentence is carrying more than one idea. Below about 8 it tends to read as choppy. The average and the worst offenders are both reported so you can judge in context.",
      },
      {
        q: "Does a long sentence always mean a complex one?",
        a: "No. A 35-word sentence built from one clause with long noun phrases is not multi-clausal, and the tool will not flag it as such. Length and clause load are separate columns precisely so you can tell the two cases apart.",
      },
      {
        q: "Can the clause estimate be wrong?",
        a: "Yes. Without a parser it cannot distinguish a restrictive clause from an appositive, and it does not understand ellipsis or unusual punctuation. Use it to shortlist sentences for a second look rather than as a grade.",
      },
    ],
  },

  "overused-word-finder": {
    keywords: ["overused words", "repeated words", "word repetition"],
    intro:
      "The Overused Word Finder counts which words your text leans on and, separately, which words come back within a short window — the two different things writers usually mean by repetition, reported as counts rather than as a verdict.",
    content: `Repetition is easy to feel and hard to see, and the Overused Word Finder turns it into two honest tables. The first counts how often each content word appears across the whole text. The second lists words that reappear within forty tokens of their previous use — the you just said that signal, which is usually what a writer means by an overused word.\\n\\nThe frequency table states its denominator. Every count is shown with its share of the total word count and its rate per thousand words, so a word used six times reads very differently in a 400-word note than in a 6,000-word essay. Function words such as the, and, of and that are hidden by default, because they dominate any English frequency count without telling you anything about style; a checkbox includes them when the question is whether a specific connector is doing too much work. Matching is case-insensitive, so The and the are one row, and ties are broken alphabetically so the table never reshuffles as you type.\\n\\nThe proximity table answers the other question. A word can appear ten times in a long piece and never once feel repetitive; the same word twice in a paragraph can stop a reader dead. The tool records the token distance between consecutive uses and reports every pair inside the window, with a short snippet of context so you can see what surrounded it. The default window of forty tokens is roughly two sentences of ordinary prose, and every entry shows the exact distance rather than a bare flag.\\n\\nThe threshold is yours to set. The default reports words used at least three times, which suits a paragraph or a page. A long manuscript can raise it to five or six, and a short caption can drop it to two, since in a hundred words a word appearing twice may already be a pattern.\\n\\nWhat the tool deliberately does not do is call a word overused. Repetition is a fault only in context. A technical term must be repeated exactly, not varied into a synonym that means something else, and literature repeats words for rhythm on purpose. Legal writing repeats defined terms because it has to. The output is therefore counts, distances and context: the reader decides.\\n\\nIn practice the two tables point at different fixes. A high whole-text count usually means you have a favourite word — the verb you reach for, the adjective that keeps returning — and a thesaurus pass or a rewrite of a few sentences helps. A cluster in the proximity table usually means a sentence or two needs restructuring rather than a synonym, because the word often has to stay and its neighbour is what moved. Read the flagged words in their snippets before changing anything, and use the summary to keep a record of what you found.\n\nIt helps to name the two problems separately, because they have different fixes. Overused words spread across a long piece are a vocabulary habit, while repeated words bunched within a few sentences are a structural one. Both are forms of word repetition, and the two tables here keep them apart so the response matches the cause.`,
    howTo: [
      { step: "Paste your text into the box; the counts update as you type." },
      { step: "Set the minimum number of uses you care about — three suits a page, five or six suits a manuscript." },
      { step: "Read the frequency table from the top: those are the words the text leans on hardest." },
      { step: "Check the proximity table for words that come back within forty tokens, and read the context snippets." },
      { step: "Decide each case in context: keep a repeated technical term, rewrite a repeated casual word." },
    ],
    whenToUse: `Use the overused word finder when repetition is the problem you can feel but not locate. When the concern is a search term rather than a stylistic habit, the {{keyword-density-analyzer|Keyword Density Analyzer}} reports the same counts as a share of the text and adds two-word phrases.\\n\\nIf the repetition turns out to be a thin vocabulary rather than one favourite word, the {{vocabulary-richness-scorer|Vocabulary Richness Scorer}} measures how many distinct words the draft uses at all — a different diagnosis with a different fix.`,
    faqs: [
      {
        q: "How does the tool decide a word is overused?",
        a: "It does not decide. It counts occurrences and distances, and you set the minimum. The point is to make repetition visible with its denominator attached rather than to pass a judgement the text may not deserve.",
      },
      {
        q: "Why are common words hidden by default?",
        a: "Function words such as the, of and and are the most frequent words in any English text, so they crowd out the content words you actually care about. Include them with one click when you want to check a specific connector.",
      },
      {
        q: "What does tokens apart mean?",
        a: "It is the number of word tokens between two consecutive uses of the same word. A small number means the word returned quickly. The default window is forty tokens, roughly two sentences of ordinary prose.",
      },
      {
        q: "Should I always replace a repeated word?",
        a: "No. Technical terms, defined legal terms and deliberate rhetorical repetition should stay exactly as they are. Varying them can change the meaning or weaken the rhythm. The tool shows the context so you can decide case by case.",
      },
      {
        q: "Does changing the threshold change the result?",
        a: "It changes which rows appear, not the counts themselves. Raising the minimum hides words used fewer times; the share and per-thousand figures for the words that remain are unaffected.",
      },
    ],
  },

  "sentence-variety-checker": {
    keywords: ["sentence variety", "sentence length", "rhythm"],
    intro:
      "The Sentence Variety Checker measures the distribution of sentence lengths in your text and finds the longest run of near-identical sentences, so monotony shows up as a number instead of a vague sense that something drags.",
    content: `Variety is the part of a prose style that readers hear without naming. The Sentence Variety Checker measures the length of every sentence, reports how spread out those lengths are, and identifies the stretches where the rhythm flattens into a drone. Everything it reports comes from the shared tokenizer, so the sentence lengths are exact.\\n\\nThe headline figure is the standard deviation of sentence length in words. A text whose sentences are all 15 to 18 words long has a small spread and reads as even, which is pleasant for a while and numbing after a page. A text that alternates a 6-word sentence with a 30-word one has a large spread and reads as animated. Neither extreme is correct on its own, but the number tells you which one you have.\\n\\nBelow the headline sit the mean, the median, the shortest and longest sentences, and two shares: how many sentences fall under ten words, and how many reach thirty or more. The mean and median side by side are worth more than either alone — when they diverge, a handful of very long sentences is pulling the average up, and the longest-sentence row tells you which.\\n\\nThe distribution panel groups sentences into four bands, from short to very long, and draws each band as a share of the whole. That is the fastest way to see a lopsided draft: a text where more than half the sentences land in one band has variety in name only.\\n\\nThe tool also reports the longest run of consecutive sentences whose lengths are within two words of each other. Four or five such sentences in a row is what a reader experiences as a stretch that will not end, even though each sentence is individually fine. And a single flag notes the extreme case where every sentence in the text is exactly the same length.\\n\\nTwo caveats keep the numbers honest. Length is not the only kind of variety — sentence openings, clause order and emphasis all matter, and none of them is measured here. And a high standard deviation can come from one runaway sentence rather than from healthy change, which is why the longest sentence is always shown next to the spread.\\n\\nThe usual fix is small. Break one of the long sentences in a uniform run, or merge two short ones, and recheck. A paragraph rarely needs more than one or two such edits to start breathing, and the spread figure moves immediately because the underlying measurement is exact.\n\nIt is also worth checking variety at more than one scale. A paragraph can alternate short and long sentences and still sit inside a chapter where every paragraph has the same shape, and the distribution panel is where that shows up. Read the four bands as a picture of the draft rather than as a target to fill, then make one or two adjustments and read the passage aloud. The ear resolves questions the number can only raise, and the number is most useful for showing you where to listen. If a band is empty and the prose still reads well, that is a deliberate choice rather than a fault.`,
    howTo: [
      { step: "Paste a paragraph or more; variety needs several sentences to be meaningful." },
      { step: "Read the standard deviation, then the mean and median beneath it." },
      { step: "Check the four-band distribution to see whether the lengths cluster in a single band." },
      { step: "Look at the longest uniform run and at the same-length flag if either is raised." },
      { step: "Split or merge one or two sentences in the flagged stretch and watch the spread change." },
    ],
    whenToUse: `Use the variety checker when a passage feels flat but you cannot say why, or when every sentence you write comes out the same length. When the problem is that individual sentences are overloaded rather than uniform, the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} finds the clauses responsible.\\n\\nIf the flatness comes from the words rather than the sentence shapes, the {{readability-grade-scorer|Readability Grade Scorer}} will show it in the syllable-based scores, and the {{clarity-score-tool|Clarity Score Tool}} folds sentence variety into a single composite so you can see how much it contributes.`,
    faqs: [
      {
        q: "What standard deviation counts as varied?",
        a: "No figure is universal, but a spread of roughly eight to twelve words across a paragraph is comfortably varied, a spread under five reads as even, and a spread above twenty often means one runaway sentence is skewing it. The longest sentence is always shown for that reason.",
      },
      {
        q: "What is a uniform run?",
        a: "The longest stretch of consecutive sentences whose lengths are within two words of each other. Four or five in a row is what a reader hears as a drone, even when each sentence is individually well made.",
      },
      {
        q: "Can a text be too varied?",
        a: "Yes. Whiplash between very short and very long sentences can feel jumpy, and a very large standard deviation usually means one sentence is out of proportion. Variety is a range to sit inside, not a quantity to maximise.",
      },
      {
        q: "Does this check grammar or punctuation?",
        a: "No. It measures sentence lengths and their distribution only. It will happily report a varied rhythm in a text full of errors, and a monotonous rhythm in a perfectly correct one.",
      },
      {
        q: "How many sentences do I need to measure rhythm?",
        a: "At least three or four before the spread means anything, and a full paragraph is better. The tool warns when the sample is too small to support the standard deviation.",
      },
    ],
  },

  "clarity-score-tool": {
    keywords: ["clarity score", "clear writing", "writing clarity"],
    intro:
      "The Clarity Score Tool blends four measurable properties of your text into a single 0-100 score, and shows the weight, measurement and rule behind each component so you can disagree with the total and still use the parts.",
    content: `A single number for how clear a piece of writing is sounds like a good idea and is usually a bad one, because no published index measures clarity directly. The Clarity Score Tool takes the opposite approach: it builds a transparent composite, states every weight and curve on the page, and shows the four components separately so the total never has to be taken on trust.\\n\\nThe composite blends four measurable properties. Sentence length carries the largest weight at 30 percent, scoring full marks up to a mean of 18 words per sentence, losing four points per additional word, and losing three per word when the mean drops below 12 for choppiness. The complex-word rate carries 25 percent and falls as the share of words with three or more syllables rises, reaching zero at 40 percent. Sentence variety carries another 25 percent and rises with the standard deviation of sentence length, capped at 100, so a varied rhythm scores high and a monotonous one low. The share of sentences longer than 30 words carries the final 20 percent.\\n\\nEvery component is displayed with the measurement it came from. If the variety component scores low, you see the standard deviation it was computed from and the sentence count behind it. If the long-sentence component drops, you see the percentage of sentences over thirty words. That is the difference between a score you can act on and a score you can only believe.\\n\\nThe bands describe the total in words rather than implying precision. A score in the eighties reads as very clear; the seventies as clear; the fifties as could be clearer; the forties as dense; below that as hard going. Each band carries a one-line note about what usually produces it, which doubles as the to-do list.\\n\\nBecause clarity is a composite, a high score is not automatically good writing. A text can be short-sentenced, low in syllables, varied and free of long sentences, and still say nothing worth reading. The score describes how easily the prose goes down, not whether it deserves to be read, and the page says so. Equally, a deliberately dense passage in an academic paper may score low and be exactly right for its audience.\\n\\nThe honest way to use the tool is to read the four components first and the total second. They usually point at the same two edits — split the longest sentences and replace the heaviest words — and those are ordinary editing observations rather than a hidden algorithm. If only one component is low, the fix is narrow and the total is not telling you anything the component did not already say.\n\nIt is worth saying plainly that clarity is not the same as simplicity. Clear writing can be precise, formal and long where the subject demands it, and writing clarity is judged by whether the reader follows the argument, not by how short the words are. The components here measure the mechanical half of that, because the mechanical half can be counted. The other half — whether the sentences say what they mean — needs a reader, and the score should never be offered as a substitute for one.`,
    howTo: [
      { step: "Paste your text; the four components and the total update as you type." },
      { step: "Read the headline score and its band note, then the word and sentence counts beside it." },
      { step: "Open the components panel and note which of the four is dragging the total down." },
      { step: "Apply the rule shown for that component — split long sentences, shorten heavy words, vary the rhythm." },
      { step: "Paste the revision back and compare component by component rather than only the total." },
    ],
    whenToUse: `Use the clarity score when you want one summary of several readability properties and you accept that the weights are a convention. When you need the published formulas instead of a composite, the {{readability-grade-scorer|Readability Grade Scorer}} reports Flesch, Fog, SMOG and the rest on their own scales.\\n\\nIf the score is being dragged down by monotony rather than length, the {{sentence-variety-checker|Sentence Variety Checker}} isolates the sentence-length distribution, and the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} locates the specific sentences carrying too many clauses.`,
    faqs: [
      {
        q: "Is the clarity score a published index?",
        a: "No. It is a composite built for this tool, and every weight and curve is stated on the page. Published indices such as Flesch and SMOG are reported by the readability tools instead when you need a citable number.",
      },
      {
        q: "What are the four components?",
        a: "Sentence length at 30 percent, complex-word rate at 25 percent, sentence variety at 25 percent and the share of sentences over thirty words at 20 percent. Each is shown with the measurement it came from and the rule that maps one to the other.",
      },
      {
        q: "How do I raise a low clarity score?",
        a: "The component rules tell you. Usually it means splitting the longest sentences, replacing three-syllable words where a shorter synonym survives, and varying sentence lengths so the rhythm is not flat. The band note repeats the same advice.",
      },
      {
        q: "Why is the total not a percentage of anything?",
        a: "Because clarity has no fixed maximum to divide by. The score is a weighted average of four sub-scores, each of which is itself a stated curve over a measurement, not a proportion of a real quantity.",
      },
      {
        q: "Does a high clarity score mean good writing?",
        a: "No. It means the prose is short-sentenced, light on long words and varied. That helps a reader but says nothing about argument, structure or interest, and a dense passage may be the right choice for its audience.",
      },
    ],
  },

  "vocabulary-richness-scorer": {
    keywords: ["vocabulary richness", "type-token ratio", "lexical richness"],
    intro:
      "The Vocabulary Richness Scorer measures how varied your word choice is, using a length-stable moving-average type-token ratio as the headline figure and the classic whole-text ratios beside it for comparison.",
    content: `Vocabulary richness is the simplest idea in text analysis and the one most often measured badly. Count the distinct words, divide by the total, and you have a type-token ratio — a number that falls mechanically as a text grows, because common words repeat. The Vocabulary Richness Scorer puts the length-stable measure first and the misleading one second, with the reason stated.\\n\\nThe headline figure is the moving-average type-token ratio, or MATTR. It slides a window of a fixed size across the text, computes the ratio of distinct to total words inside each window, and averages the results. Because every window is the same length, the figure does not drift downward simply because the document got longer, which makes it the only one of these measures that can compare a paragraph with an essay.\\n\\nBelow it sit the classic ratios. The whole-text type-token ratio is reported because it is what most people mean by richness, along with the Guiraud index, which divides distinct words by the square root of the total, and the share of words used exactly once. That last figure, the hapax share, is a useful second signal: a draft with a high proportion of words appearing a single time is reaching for vocabulary rather than recycling it.\\n\\nThe window size is adjustable, and the default of one hundred words is a reasonable compromise. A small window measures local variation and can be noisy on short texts; a large window approaches the whole-text ratio it is meant to correct. If your text is shorter than the window, the measure collapses to the plain ratio, which the page notes rather than disguising.\\n\\nNo band or pass-fail is attached, and that restraint is the point. Richness is genre-dependent. Legal writing repeats defined terms deliberately, scientific writing uses a controlled vocabulary on purpose, and literature repeats words for rhythm. A low ratio can mean thin vocabulary or it can mean correct terminology. The tool reports the measurement and the length caveat; the writer judges.\\n\\nThe practical reading is comparative. Measure a draft, revise a paragraph that felt flat, and measure again. Because the moving-average ratio is stable across lengths and the underlying counts are visible — words, distinct words, sentence count and syllables per word — the change you see is a real change in word choice rather than an artefact of how much you pasted.\n\nLexical richness is measured in more than one way for a reason, and the measures disagree on purpose. A short poem can score a high ratio simply because it is short, while a long novel with an enormous working vocabulary scores lower, which is why the moving-average figure is the one to compare across lengths. The hapax share and the Guiraud index are reported as second opinions rather than as alternatives to choose between: when all three agree, the reading is solid, and when they diverge the divergence is itself the finding, usually because text length is doing more of the work than word choice. Treat the panel as a set of corroborating measurements rather than as a leaderboard.`,
    howTo: [
      { step: "Paste a draft of a few hundred words; richness measures need length before they settle." },
      { step: "Read the moving-average type-token ratio first — it is the length-stable headline figure." },
      { step: "Compare it with the whole-text ratio and the Guiraud index in the table below." },
      { step: "Adjust the window size if you want a local rather than a document-wide reading." },
      { step: "Revise a flat paragraph, paste it back, and compare the two readings like for like." },
    ],
    whenToUse: `Use the richness scorer when you want to know how varied the word choice is overall. When the question is specifically how the ratios behave across different window sizes, the {{lexical-diversity-calculator|Lexical Diversity Calculator}} tabulates MATTR at four widths alongside the Herdan index.\\n\\nIf the draft's problem is not thin vocabulary but too much concentration on a few terms, the {{keyword-density-analyzer|Keyword Density Analyzer}} shows which words are taking up the most room, and the {{overused-word-finder|Overused Word Finder}} lists the words the text leans on hardest.`,
    faqs: [
      {
        q: "What is a good type-token ratio?",
        a: "There is no universal figure, because the ratio depends on text length and genre. A short note naturally scores higher than a book. Use the moving-average ratio for comparisons and treat any single number as descriptive rather than good or bad.",
      },
      {
        q: "Why does the ratio fall as I write more?",
        a: "Because common words repeat. Every new sentence reuses the, of and and, adding to the total without adding distinct words. That mechanical drift is why the moving-average ratio is reported first — it uses fixed windows and does not have this bias.",
      },
      {
        q: "What window size should I choose?",
        a: "The hundred-word default suits most drafts. A smaller window highlights local variation and is noisier; a larger window drifts toward the whole-text ratio. If your text is shorter than the window, the measure falls back to the plain ratio.",
      },
      {
        q: "What is a hapax legomenon?",
        a: "A word that appears exactly once in a text. The hapax share shown here is the proportion of tokens used a single time, which is a useful second signal of how much a draft reaches for new vocabulary rather than recycling the same words.",
      },
      {
        q: "Does richer vocabulary mean better writing?",
        a: "Not necessarily. Deliberate repetition is a technique, and controlled terminology is a requirement in technical and legal writing. Richness is one measurable property of a draft, and it should be read alongside the task the writing has to do.",
      },
    ],
  },

  "keyword-density-analyzer": {
    keywords: ["keyword density", "keyword frequency", "term frequency"],
    intro:
      "The Keyword Density Analyzer reports how much of your text each word and two-word phrase occupies, with the denominator stated and no suggested target, because no universal safe density exists.",
    content: `Density sounds like a rule you can follow and is really just a ratio. The Keyword Density Analyzer computes how much of a text each term takes up, shows the counts behind the percentage, and deliberately refuses to hand you a target figure.\\n\\nThe arithmetic is simple and is printed on the page. Density is the number of times a term appears divided by the total number of word tokens, multiplied by one hundred. The denominator includes function words, because when a reader asks what share of the text a term occupies they mean all of it, not a filtered subset. Each row also shows the per-thousand rate, which is the same information on a scale that does not shrink when the text gets shorter, and the raw count, which is what most people actually want.\\n\\nTwo tables are produced. The first counts single words, with function words hidden by default so the content words stand out. The second counts two-word phrases, and a phrase is only reported when at least one of its words is a content word, so combinations such as of the never masquerade as a keyword. Phrases often reveal what a single-word table cannot: a document about keyword density will show density high in the single-word table and also keyword density high in the phrase table, and the phrase is the more informative of the two.\\n\\nThe minimum-occurrence threshold and the number of rows are both adjustable. A short caption may need a threshold of two; a long article can raise it to four or five so only genuine patterns survive. Matching is case-insensitive, and ties are broken by first appearance so equal counts keep document order rather than shuffling as you type.\\n\\nThe tool does not propose an ideal percentage, and that is a deliberate editorial position rather than a missing feature. Density was treated as a ranking signal in the early days of search, and the folklore that a term should occupy a specific percentage of a page has been repeated ever since without evidence. Contemporary guidance is that writing naturally and covering a topic well matter more than hitting a ratio, and a tool that invented a target would be encouraging the opposite.\\n\\nWhat density is genuinely good for is diagnosis. A term near the top of both tables may be the subject of the piece, or it may be evidence that a paragraph repeats itself. A phrase that appears far more often than its words suggest can point at a stock expression. Read the top few rows, look at the counts rather than the percentages, and use the context of the piece to decide whether the concentration is earned. Nothing you paste leaves the browser.\n\nTwo names are used for the same measurement, and both appear in the wild. Keyword frequency usually means the raw count of a term, while term frequency in information retrieval means a normalised rate, which is what the density column here computes. The tool reports the count, the share and the per-thousand rate together so the two senses are never confused, and you can read whichever one your question actually needs.`,
    howTo: [
      { step: "Paste the text you want to analyse; both tables fill as you type." },
      { step: "Set the minimum occurrences and the number of rows you want to see." },
      { step: "Read the single-word table from the top, ignoring the percentages until you have seen the counts." },
      { step: "Check the two-word phrase table, which often reveals stock expressions the word list hides." },
      { step: "Decide in context whether the concentration is the subject of the piece or an accidental tic." },
    ],
    whenToUse: `Use the density analyzer when you want to know how much room specific terms take up and how often phrases repeat. When the concern is a word returning too quickly rather than too often overall, the {{overused-word-finder|Overused Word Finder}} measures the distance between occurrences instead of the total.\\n\\nIf the density is a symptom of a narrow vocabulary rather than a single overused term, the {{vocabulary-richness-scorer|Vocabulary Richness Scorer}} measures the breadth of word choice, and the {{text-fingerprint-analyzer|Text Fingerprint Analyzer}} compares two drafts on the same measurable features.`,
    faqs: [
      {
        q: "What is a safe keyword density?",
        a: "There is no such figure. Density was never a fixed threshold, and modern search guidance treats natural coverage of a topic as more important than hitting a ratio. This tool reports what is there rather than inventing a target to chase.",
      },
      {
        q: "How is density calculated here?",
        a: "The count of a term divided by the total number of word tokens, times one hundred. The denominator includes function words, because a reader asking what share of the text a term occupies means the whole text, not a filtered subset.",
      },
      {
        q: "Why are phrases filtered for content words?",
        a: "So that combinations such as of the, which occur constantly and mean nothing, are never reported as keywords. A two-word phrase must contain at least one non-function word before it appears in the phrase table.",
      },
      {
        q: "Is keyword density a Google ranking factor?",
        a: "There is no published fixed density threshold, and repeated formulas for one are folklore rather than documentation. The safer reading is that a page which answers a query well and reads naturally will outperform one that was tuned to a ratio.",
      },
      {
        q: "Should function words count in the denominator?",
        a: "Yes, for this measurement. If the denominator excluded them, the percentage would describe a share of content words rather than a share of the text, which is not what a reader asking about density is looking for.",
      },
    ],
  },

  "flesch-kincaid-score-calculator": {
    keywords: ["Flesch-Kincaid", "Flesch-Kincaid grade level", "reading ease"],
    intro:
      "The Flesch-Kincaid Score Calculator computes both Flesch formulas — Reading Ease and Grade Level — from the same syllable counts, and shows the words, sentences and syllables behind each result.",
    content: `Two scores share the name Flesch and are often confused. The Flesch Reading Ease formula reports a number from about 0 to 100 where higher is easier, and the Flesch-Kincaid Grade Level formula reports a United States school grade. Both are computed from the same two inputs — average sentence length in words and average syllables per word — so this calculator reports them side by side with the counts that produced them.\\n\\nReading Ease is 206.835 minus 1.015 times the average sentence length, minus 84.6 times the average syllables per word. Grade Level is 0.39 times the average sentence length, plus 11.8 times the average syllables per word, minus 15.59. The two look different and move together: every extra syllable per word costs about 85 points of Reading Ease and about twelve grade levels, which is why vocabulary matters so much more than sentence length in the arithmetic.\\n\\nBecause the scale runs the opposite way to expectations, Reading Ease is usually read as a band rather than a number. Scores of 90 and above read as very easy, around 5th grade. The 60s are standard newspaper and web copy, roughly 8th to 9th grade. The 30s are difficult and often signal academic prose, and below that the band is very difficult. Each band is labelled and a one-line note explains what usually produces it.\\n\\nThe grade output is converted to a plain reading level as well: a calculated grade of 7.2 is reported as 8th grade, because a reader needs the grade they are entering rather than the one just finished. Grades above twelve are reported as college or graduate level rather than pretending to a precision the scale does not have.\\n\\nSyllables come from a documented English heuristic, since counting them properly needs a pronunciation dictionary. Vowel groups are counted, a silent final e is dropped after a consonant, the -ed and -es endings are discounted unless the stem needs the syllable, and a short exception list handles hiatus words. The heuristic is accurate most of the time and occasionally wrong, and every Flesch figure inherits that error. The page states it rather than implying otherwise.\\n\\nOne limit is worth repeating. Both formulas are quoted for samples of roughly 100 words plus and become noisy below that; a single sentence can produce a grade of 5 or 15 with equal confidence. The tool flags a short sample and reports the counts so you can judge how much weight the number deserves. The formulas are also English-specific: applying them to another language produces arithmetic without meaning, because the syllable and word-length assumptions no longer hold.\n\nBecause both formulas depend so heavily on syllables, the most effective single edit is usually to replace a few polysyllabic words rather than to shorten sentences. A sentence cut in half moves the grade by one or two levels; replacing three long words with short ones can move it by more. The counts panel makes that trade visible, since average syllables per word sits beside average sentence length and you can see which one is doing the damage. Neither figure is a verdict, and the pair is more useful than either alone.`,
    howTo: [
      { step: "Paste your text — a few paragraphs, or at least a hundred words, is the useful minimum." },
      { step: "Read the Flesch-Kincaid Grade Level and the Flesch Reading Ease score together." },
      { step: "Check the reference table to read the ease score as a band from very easy to very difficult." },
      { step: "Look at the counts panel: average sentence length and syllables per word are the only inputs." },
      { step: "Rewrite the longest or heaviest sentences, paste back, and compare the two readings." },
    ],
    whenToUse: `Use this calculator when you specifically need the two Flesch formulas and the arithmetic behind them. When you want every common formula at once — Fog, SMOG, Coleman-Liau and the Automated Readability Index included — the {{readability-grade-scorer|Readability Grade Scorer}} reports the full set on one page.\\n\\nIf the grade is driven by sentence length rather than vocabulary, the average words per sentence shown here will not tell you which sentences to fix, and the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} will locate the heavy ones. The {{smog-index-calculator|SMOG Index Calculator}} is the usual alternative when a vocabulary-only formula is preferred, and the {{gunning-fog-index-calculator|Gunning Fog Index Calculator}} is the other common comparison.`,
    faqs: [
      {
        q: "What is the difference between Flesch Reading Ease and Flesch-Kincaid Grade Level?",
        a: "They use the same two inputs but different arithmetic and different scales. Reading Ease runs from about 0 to 100 with higher meaning easier. Grade Level reports a US school grade, so both rise and fall together while pointing in opposite directions.",
      },
      {
        q: "How does Flesch-Kincaid count syllables?",
        a: "With a documented English heuristic rather than a dictionary: vowel groups are counted, a silent final e is dropped, -ed and -es endings are discounted unless the stem needs them, and a short exception list covers hiatus words.",
      },
      {
        q: "What grade level should I aim for?",
        a: "For general public communication, a 7th to 9th grade score is the usual plain-language target. Specialist documentation and academic work read higher by design. The right answer depends on who is reading, not on a single recommended number.",
      },
      {
        q: "Is Flesch-Kincaid valid for languages other than English?",
        a: "No. The formulas assume English syllable structure and word length. Applied to German, Spanish or Japanese they produce arithmetic without meaning, and the grades should not be quoted. The syllable heuristic is English-only for the same reason.",
      },
      {
        q: "Why does one extra syllable move the score so much?",
        a: "Because Reading Ease multiplies syllables per word by 84.6 and Grade Level multiplies by 11.8. That is the deliberate weighting of both formulas: they treat difficult vocabulary as a larger obstacle than long sentences, which is why word choice dominates the result.",
      },
    ],
  },

  "gunning-fog-index-calculator": {
    keywords: ["Gunning Fog", "Fog index", "complex words"],
    intro:
      "The Gunning Fog Index Calculator applies the Fog formula to your text and shows exactly which words it counted as complex, so the grade can be traced back to the vocabulary that produced it.",
    content: `The Gunning Fog index answers a narrow question: how many years of schooling does a reader need to understand this passage on one reading? The Gunning Fog Index Calculator computes it and, just as importantly, shows which words the formula treated as complex, because that list is where the edits come from.\\n\\nThe arithmetic is short. Multiply 0.4 by the sum of the average sentence length in words and the percentage of complex words. Complex words are the crux. For the Fog index a complex word is one with three or more syllables, with two documented exclusions: words that reach three syllables only through an -es, -ed or -ing ending, and words that are capitalised in the source, which are presumed to be proper nouns rather than difficult vocabulary. Those exclusions are why the complex-word count here is lower than a simple three-syllable tally, and both figures are shown so the difference is visible rather than hidden.\\n\\nThe 0.4 multiplier is a calibration, not a magic number. It maps the raw sum onto a school-grade scale so that the result lands near the years of education a reader needs. That is the whole intent of the index, and it means the number should be read as a grade estimate rather than as a quantity of difficulty.\\n\\nGunning's own guidance was that a Fog score of about 17 marks writing that is hard for most readers, and around 12 or below is comfortable for a general business or news audience. The tool reports the grade label alongside the score so the number is not left to interpretation, but it attaches no pass or fail. A technical paper for specialists is expected to score high, and rewriting it down would remove precision the audience needs.\\n\\nBecause the formula rewards short sentences and short words, it responds quickly to editing. Splitting one long sentence and replacing a few three-syllable words with shorter synonyms can move the index by more than a grade, and because the complex-word list is shown, you can see which substitutions the formula would notice. That list is also the index's weakness: it counts syllables rather than difficulty, so a familiar three-syllable word is penalised as heavily as an obscure one, and a short technical term is not penalised at all.\\n\\nTwo sample caveats apply. The index is quoted for texts of roughly a hundred words or more and is unstable below that, and it is an English measure whose syllable heuristic, documented on the page, is right most of the time and occasionally wrong. The counts panel lets you check the arithmetic by hand.\n\nThe index is most sensitive to vocabulary, so it rewards a plain word list more than short sentences. That is worth knowing before rewriting: replacing three long words with short ones usually moves the Fog score further than splitting a sentence, even though splitting is the more common advice. The complex-word list shows exactly which substitutions the formula would notice, which turns the grade into a specific, finite editing task rather than a vague instruction to write more simply.`,
    howTo: [
      { step: "Paste your text; the Fog index and the counts update as you type." },
      { step: "Read the index and the grade label, then the complex-word count and the average sentence length." },
      { step: "Look at the complex-word list to see which specific words the formula penalised." },
      { step: "Split a long sentence or shorten a flagged word and watch the index move." },
      { step: "Compare against the reference bands before deciding whether the score is a problem for your audience." },
    ],
    whenToUse: `Use the Fog index when you want a grade estimate driven mainly by vocabulary and want to see the complex-word list. When a syllable-only formula is preferred — for health material or a word list that is hard to control — the {{smog-index-calculator|SMOG Index Calculator}} counts polysyllables and ignores sentence length entirely.\\n\\nFor a full comparison across Fog, Flesch, SMOG and the letter-based formulas, the {{readability-grade-scorer|Readability Grade Scorer}} reports them side by side, and the {{flesch-kincaid-score-calculator|Flesch-Kincaid Score Calculator}} breaks out the two Flesch formulas from the same engine.`,
    faqs: [
      {
        q: "What counts as a complex word in the Fog index?",
        a: "A word of three or more syllables, excluding words that only reach three through an -es, -ed or -ing ending and excluding capitalised tokens assumed to be proper nouns. Both the Fog count and the raw three-syllable count are shown so you can see the difference.",
      },
      {
        q: "Why does the formula exclude proper nouns?",
        a: "Because Gunning assumed a capitalised word is a name or a place that the reader already knows or cannot avoid, so penalising it for length would distort the grade. The exclusion follows the original definition rather than inventing a local rule.",
      },
      {
        q: "What Fog score should I aim for?",
        a: "Gunning treated scores around 17 as hard for most readers and around 12 or below as suitable for a general audience. For specialist audiences a higher score is expected. The tool reports the grade rather than declaring a target.",
      },
      {
        q: "Why is the score multiplied by 0.4?",
        a: "The factor calibrates the raw sum of sentence length and complex-word percentage onto a school-grade scale. It is a scaling constant from the original index, not a tunable weight, and the unmultiplied inputs are shown so the arithmetic can be checked.",
      },
      {
        q: "How does the Fog index differ from Flesch-Kincaid?",
        a: "Both use sentence length, but Fog counts three-syllable complex words as a percentage while Flesch-Kincaid uses average syllables per word. Fog also excludes proper nouns and some suffixed words, which is why the two grades often differ by a level or more.",
      },
    ],
  },

  "smog-index-calculator": {
    keywords: ["SMOG index", "SMOG readability", "polysyllabic words"],
    intro:
      "The SMOG Index Calculator computes the Simple Measure of Gobbledygook from your polysyllable count, shows the formula's arithmetic step by step, and warns you when the sample is smaller than the thirty sentences it was validated on.",
    content: `SMOG stands for Simple Measure of Gobbledygook, and it earns its place because it needs almost nothing: a count of words with three or more syllables and a count of sentences. The SMOG Index Calculator applies it, prints the arithmetic, and is unusually careful about the sample size, because SMOG has the strictest validation requirement of any common readability formula.\\n\\nThe formula is 1.043 times the square root of the polysyllable count multiplied by thirty divided by the sentence count, plus 3.1291. The thirty is not incidental: the index was validated on samples of thirty sentences, and the published grade table assumes that sampling. The calculator therefore uses the whole text when you paste thirty sentences or more and warns when you have fewer, because with five sentences each additional polysyllabic word swings the result by roughly half a grade.\\n\\nSMOG counts only polysyllables. It ignores sentence length altogether, which is both its strength and its blind spot. The strength is that it does not need a word list or a syllable dictionary beyond a simple three-syllable test, which is why health-literacy research adopted it for patient materials. The blind spot is that a text of long, single-syllable sentences will score easier here than it reads, since nothing in the formula notices how far the reader travels before a full stop.\\n\\nThe grade conversion is usually presented as a table rather than a formula, and this tool shows the published mapping from a SMOG value to a reading grade, running from early primary school up to college. The bands are displayed beside the score so the index can be read without a lookup.\\n\\nLike every formula here, SMOG inherits the error of a heuristic syllable count, which the page documents: vowel groups counted, silent final e dropped, -ed and -es discounted unless needed, and a short list of exceptions for hiatus words. A word the heuristic misjudges by a syllable can move a short sample noticeably, which is another reason the sample-size warning is prominent.\\n\\nThe tool attaches no target. Health and government plain-language work often aims for a SMOG value near 8 or below, and a clinical guideline for specialists will legitimately sit much higher. Read the index, read the grade, check the sentence count, and decide against the audience rather than against a number you were told to reach.\n\nSMOG readability is popular outside linguistics for a practical reason: it needs only a count of polysyllabic words and a sentence count, with no word list, no dictionary and no special software. That makes it easy to apply consistently across a large set of documents, which is how health agencies use it to check that patient information sits at a readable level. The trade is precision, because it ignores sentence length and treats every polysyllabic word as equally hard. As a result it can judge a passage of simple vocabulary in sprawling sentences as easier than it is. A sample drawn per the thirty-sentence convention will be more stable than the whole text, and the counts on the page let you check which was used. Read the index as one measure among several.`,
    howTo: [
      { step: "Paste your text, ideally thirty sentences or more so the sample matches the published validation." },
      { step: "Read the SMOG index and the grade label, then the polysyllable count and share beside them." },
      { step: "Check the arithmetic line, which shows the exact numbers substituted into the formula." },
      { step: "Read the sample-size warning if it appears, and weight the index accordingly." },
      { step: "Use the SMOG-to-grade table to place the score in a reading grade before deciding whether to revise." },
    ],
    whenToUse: `Use SMOG when you want a vocabulary-only difficulty estimate and the sample is long enough to trust it, which makes it the usual choice for patient and public information. When sentence length should also count, the {{gunning-fog-index-calculator|Gunning Fog Index Calculator}} uses a related complex-word rule but includes sentence length.\\n\\nTo see SMOG alongside Flesch, Fog and the letter-based formulas for the same passage, the {{readability-grade-scorer|Readability Grade Scorer}} puts every index on one page, backed by the same syllable counts this calculator uses.`,
    faqs: [
      {
        q: "Why does SMOG need thirty sentences?",
        a: "Because the index was validated on samples of thirty sentences and its grade table assumes that size. With fewer, each extra polysyllabic word moves the result sharply, so the tool warns and reports the sentence count rather than hiding the uncertainty.",
      },
      {
        q: "Does SMOG use sentence length?",
        a: "No. The formula counts only polysyllables and sentences; it never measures how long the sentences are. That is why a text of very long one-syllable sentences can score easier here than it actually reads.",
      },
      {
        q: "Why does SMOG often score higher than other formulas?",
        a: "Because it responds only to words of three or more syllables and treats every one as difficulty, with no exclusion for familiar vocabulary or proper nouns. A passage with ordinary sentence lengths but some specialist terms will score higher on SMOG than on Flesch.",
      },
      {
        q: "What is SMOG used for?",
        a: "Health-literacy and public-information work, where a reader may encounter a document once and needs to understand it at first reading. It is also used in research on informed consent and patient materials, which is where its validation sample comes from.",
      },
      {
        q: "Can I use SMOG on a short text?",
        a: "You can, and the tool will compute it, but the result is indicative only. Below thirty sentences each additional polysyllabic word shifts the index substantially, and the warning on the page says so rather than presenting the number as reliable.",
      },
    ],
  },

  "lexical-diversity-calculator": {
    keywords: ["lexical diversity", "MATTR", "vocabulary diversity"],
    intro:
      "The Lexical Diversity Calculator reports several length-corrected diversity measures at once — plain type-token ratio, the Guiraud and Herdan indices, and moving-average ratio at four window widths — so no single bias decides the answer.",
    content: `Every lexical diversity measure corrects for something, and each correction introduces its own distortion. The Lexical Diversity Calculator shows several at once and a table of the moving-average ratio across four window widths, on the principle that a number you can compare with its alternatives is more useful than one presented alone.\\n\\nThe vocabulary is worth fixing first. A token is a running word as it appears: the word the twice counts as two tokens. A type is a distinct word: the same two occurrences count as one type. The plain type-token ratio is types divided by tokens, and its flaw is well known. It falls as a text grows, because the same common words keep recurring, so it cannot compare a short sample with a long one.\\n\\nThe Guiraud index divides types by the square root of the token count, and the Herdan index divides the logarithm of types by the logarithm of tokens. Both damp the length effect in different ways and both are reported here with the raw ratio, so you can see how much the correction moves the figure.\\n\\nThe moving-average type-token ratio is the length-stable measure favoured in modern work. It slides a fixed-size window across the text, computes types over tokens inside each window, and averages the result. Because every window is the same size, the figure does not drift with document length. The table shows the value at windows of 50, 100, 200 and 500 tokens, which turns the choice of window from a hidden assumption into something you can read off. A window wider than the text collapses to the plain ratio, and the page notes that rather than letting the collapse look like a real measurement.\\n\\nNo single figure is labelled correct. A high value means the text keeps introducing new words; a low one means it recycles a small set. Neither is good or bad without a genre. Poetry and advertising copy often score high; legal and scientific writing often score low because a controlled vocabulary requires exact repetition of defined terms. The tool reports measurements and the length caveat, and leaves the judgement where it belongs.\\n\\nTwo practical notes. Diversity measures need a few hundred tokens before they settle, so a short sample is flagged rather than trusted. And the tool counts surface forms, not lemmas, so run and running are two types; if you need lemma-based diversity, normalise the text first. For most editing purposes the surface measure is the honest one, because a reader sees the forms, not the dictionary entries.\n\nThe letters MATTR stand for moving-average type-token ratio, and the measure exists because vocabulary diversity has to be compared fairly across texts of different lengths. A window of fifty is sensitive to local repetition, while a window of five hundred approaches the whole-text figure. Reading the table from fifty to five hundred shows how much the window choice matters for your particular text, which is information a single number cannot give. If the value falls steeply as the window widens, the vocabulary is spread thinly; if it holds steady, new words are arriving at a consistent rate.`,
    howTo: [
      { step: "Paste a draft of at least a few hundred tokens; the measures need length to stabilise." },
      { step: "Read the moving-average ratio at the reference window, then the plain type-token ratio and the two indices." },
      { step: "Check the tokens and types rows, which are the counts every ratio is built from." },
      { step: "Compare the four window widths in the table to see how sensitive the measure is to window size." },
      { step: "Read the warning if the sample is short, and treat the figures as provisional until it is longer." },
    ],
    whenToUse: `Use the lexical diversity calculator when you want several length-corrected measures and a window-sensitivity check in one place. When the question is richer vocabulary overall and you want the moving-average ratio as the headline with the classic ratios beneath it, the {{vocabulary-richness-scorer|Vocabulary Richness Scorer}} presents it that way.\\n\\nIf the low diversity is caused by a handful of terms dominating the text, the {{keyword-density-analyzer|Keyword Density Analyzer}} shows which ones, and the {{overused-word-finder|Overused Word Finder}} lists the words that recur most, including those returning within a short distance.`,
    faqs: [
      {
        q: "What is the difference between a type and a token?",
        a: "A token is each running word as it appears, so the word the twice is two tokens. A type is a distinct word, so those two occurrences are one type. Every diversity ratio here is some form of types divided by tokens.",
      },
      {
        q: "Which lexical diversity measure should I use?",
        a: "For comparing texts of different lengths, a moving-average ratio such as MATTR is the safest default. The Guiraud and Herdan indices are useful alternatives, and the plain type-token ratio is best kept for texts of similar length.",
      },
      {
        q: "What is a good MATTR value?",
        a: "There is no universal figure, because expected diversity varies by genre and by window size. Read the value against the window it was computed at, compare like with like, and treat a single number as descriptive rather than as a grade.",
      },
      {
        q: "Why do the indices give different answers?",
        a: "Each corrects for length in a different way, so they disagree on the same text. The Guiraud index uses the square root of the token count, Herdan uses logarithms of both counts, and MATTR averages over fixed windows. Showing all of them makes the disagreement visible instead of hidden.",
      },
      {
        q: "Do I need to lemmatise the text first?",
        a: "For most editing questions, no. The tool counts surface forms, which is what a reader encounters. If you need lemma-based diversity, where run and running count once, normalise the text to a base form before pasting it in.",
      },
    ],
  },

  "text-fingerprint-analyzer": {
    keywords: ["text fingerprint", "stylometry", "writing style analysis"],
    intro:
      "The Text Fingerprint Analyzer builds a measurable profile of one text — sentence lengths, word lengths, diversity, punctuation rates and function-word share — and compares it field by field with a second text.",
    content: `A style is hard to describe and reasonably easy to measure, as long as you measure the right things. The Text Fingerprint Analyzer produces a profile of a text from features that can be counted exactly, then compares two profiles field by field. It is explicit about the narrow question it answers and the questions it cannot.\\n\\nThe profile contains a dozen countable features. Sentence count, mean sentence length and the standard deviation of sentence length describe rhythm. Mean word length, the share of long words and syllables per word describe lexical weight. The type-token ratio, the Guiraud index and the share of words used once describe diversity. The share of function words describes how much of the text is made of closed-class words such as the, of, and, which a writer chooses less consciously than nouns and verbs. Punctuation rates per thousand words cover commas, semicolons, colons, dashes, question marks, exclamation marks, parentheses and quotation marks.\\n\\nComparing two texts produces a table of every feature with both values and the difference, plus a single similarity figure. That figure is the cosine similarity of the two function-word distributions, on a scale from zero to one. A high value means the two texts distribute their closed-class vocabulary in similar proportions. In practice two drafts on the same subject by the same writer score high, and so, usually, do two texts in the same genre by different writers. That is not a defect: it is what the measurement means, and the page says so in a band rather than implying certainty.\\n\\nThe tool is deliberately not a forensic instrument. It does not attempt authorship attribution, plagiarism detection or AI detection, because each of those needs calibrated reference corpora and published error rates that a browser tool cannot honestly supply. The temptation to read a similarity score as evidence of shared authorship should be resisted, and the page states the limitation next to the number.\\n\\nWhere it is genuinely useful is revision. Compare an early draft with a later one and the profile shows what changed: shorter sentences, a heavier vocabulary, fewer semicolons, more parentheses. Compare a piece you are proud of with one you are not and the differences are concrete. Compare two passages you suspect are inconsistent — a chapter written months apart, a document assembled from several sources — and the timbre of each becomes visible in the numbers.\\n\\nTwo texts are enough and no sample is required beyond each containing words. Sentence-length statistics need several sentences to be meaningful, and diversity measures need a few hundred tokens, both of which the profile reports so you can judge the weight of each line. Nothing either text contains leaves the page.\n\nNone of this requires publishing theory. Stylometry, the quantitative study of writing style, exists in academic research with careful controls and large reference corpora, and the features used here are a small, countable subset of the kind it studies. What an editor actually needs is writing style analysis that is concrete enough to act on: fewer semicolons, shorter sentences, a heavier vocabulary. That is what the profile table gives, and it is honest about the line between describing a text and claiming to identify its author.`,
    howTo: [
      { step: "Paste the first text into the reference box; its profile appears immediately." },
      { step: "Paste the second text into the compare box to unlock the field-by-field comparison." },
      { step: "Read the function-word similarity percentage and its band, then the per-feature table." },
      { step: "Look for features that differ most — sentence variation, vocabulary weight, punctuation rates — as the concrete changes." },
      { step: "Read the section on what a fingerprint is not before drawing conclusions from the similarity figure." },
    ],
    whenToUse: `Use the fingerprint analyzer when you want to compare two drafts or two passages on measurable features rather than on impression. When one text alone is the subject and you want its diversity measures explained in detail, the {{lexical-diversity-calculator|Lexical Diversity Calculator}} covers that ground.\\n\\nIf the feature you care about is the shape of individual sentences, the {{sentence-variety-checker|Sentence Variety Checker}} measures the distribution more directly, and the {{readability-grade-scorer|Readability Grade Scorer}} translates the same counts into established reading-level scores.`,
    faqs: [
      {
        q: "Can this tool tell who wrote a text?",
        a: "No. Authorship attribution needs a calibrated reference corpus and a published error rate, neither of which a browser tool can supply. The profile describes measurable features of a text; it does not identify an author, and the page says so beside the similarity figure.",
      },
      {
        q: "Can it detect text written by an AI?",
        a: "No. There is no reliable feature set for that in this tool, and pretending otherwise would be dishonest. The similarity figure compares function-word distribution, which says nothing about how a text was produced.",
      },
      {
        q: "What is function-word similarity?",
        a: "The cosine similarity of the two texts' function-word share vectors, from zero to one. Function words are closed-class items such as the, of and and. A high value means the two texts distribute them alike, which usually reflects genre and topic as much as authorship.",
      },
      {
        q: "Why do two texts by the same author sometimes score lower than expected?",
        a: "Because genre and topic move the features more than authorship does. An email and an essay by one writer differ in sentence length and punctuation, and the profile measures those differences. A similarity figure is descriptive, not identifying.",
      },
      {
        q: "Does the tool send either text to a server?",
        a: "No. Both profiles and the comparison are computed in the browser with the same tokenizer used across the domain. There is no upload, no account and no storage, and both texts are discarded when the tab closes.",
      },
    ],
  },
};
