import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B8, extractive summarisation group: authored SEO entries for the text
 * summariser, the key points extractor and the TL;DR generator. All three share
 * the same sentence-scoring engine; each page explains a different use of it.
 * Keys are registry slugs; see ../tool-seo.ts for the contract these entries are
 * validated against.
 */
export const B8_EXTRACTION_SEO: Record<string, ToolSeo> = {
  "text-summarizer": {
    keywords: [
      "text summarizer",
      "extractive summary",
      "TextRank",
      "sentence scoring",
    ],
    intro:
      "The text summarizer ranks every sentence with a published three-part score and returns the highest-ranked ones in document order, so every line of the extractive summary is a sentence you wrote. It selects, and never rewrites.",
    content:
      "Paste a draft and this text summarizer splits it into sentences, scores each one with the same method every time, and shows the ranking before you choose a length. This is an extractive summary built from sentences you wrote: nothing is generated, and joining the selected sentences reproduces your own words in the order they appear.\n\n- Length: about 10%, 20%, 30% or 40% of the sentences, defaulting to 20%, applied to the sentence count and rounded to at least one sentence.\n- Sentence scoring table: every sentence's centrality, frequency and position parts, each normalised to its best sentence, plus the weighted total and rank.\n- Key terms: up to 40 content terms, most frequent first, each with its count and its 1 + log count weight.\n- Export: Copy summary, Copy report and Download extractive-summary.txt, with compression and key-term coverage figures in the report.\n\nThe sentence scoring is TextRank, the Mihalcea-Tarau construction: a PageRank walk over a graph whose nodes are sentences and whose edges are content-word overlap, with similarity measured as shared content words divided by the log sizes of the two sentences. The iteration is deterministic — no random start, damping 0.85, 30 fixed passes. Three parts are then added with published weights: 0.55 centrality, 0.35 frequency and 0.10 position. Frequency sums each content word's 1 + log(count) weight and divides by the square root of the sentence length, so a long sentence cannot win by size. Position decays as 1 / (1 + 0.12 x index), which keeps an opening sentence in the running without letting it dominate. Stopwords, single characters and bare punctuation are excluded from the content words, and the combined score is normalised so the best sentence is 1.000. Selection keeps document order, and compression and coverage are reported so you can see how much was kept and which of the top ten terms survived.\n\n- The ranking cannot know what matters to you. A pivotal sentence with unusual wording can rank below one that repeats common terms.\n- Sentences are selected whole, so a single long sentence can dominate a short percentage.\n- Headings and list lines are treated as sentences like any other, because the splitter does not know what a heading is.\n- Key-term coverage counts the top ten terms only, so it is an indicator rather than a guarantee.\n- Nothing is generated, which is the honest limit as well as the point: a text with no clear topic has no clearly central sentences to find.\n- Stopwords are removed with a published list, so a sentence built from common words scores lower than its meaning may warrant.\n\nUse the sentence scoring table as the audit, not the summary: it shows the three parts behind each rank. Start at 20%, raise the percentage until every point you need is present, and watch coverage rather than length. The key terms panel belongs to the same audit: if a subject you expected is missing from the terms, no percentage will put it in the summary. Compression is the third figure to watch — a 40% selection of a short note is usually the right answer, while the same percentage of a long report is a different kind of document.",
    howTo: [
      { step: "Paste the text; every sentence is scored as you type and the ranked table appears." },
      { step: "Pick a length from about 10% to 40% of the sentences and watch the selected count update." },
      { step: "Read the sentence scoring table to see which sentences the ranking chose and why." },
      { step: "Check key-term coverage, then Copy summary, Copy report or Download extractive-summary.txt." },
    ],
    whenToUse:
      "Use the summariser when the result needs to read as prose and scale with the text. For a one-line gist instead, the {{tldr-generator|TL;DR Generator}} fills a character budget with the same ranking, and the {{key-points-extractor|Key Points Extractor}} returns the winners as a numbered list rather than a flowing extract.\n\nIf the reason you are summarising is an edit, the {{important-sentence-highlighter|Important Sentence Highlighter}} marks the top-ranked sentences where they sit in the draft, so you can see the load-bearing lines before you cut anything.",
    faqs: [
      {
        q: "Does the summariser write new sentences?",
        a: "No. It is extractive: every sentence in the summary appears in your text, selected by score and returned in document order. Nothing is paraphrased, merged or generated.",
      },
      {
        q: "What are the three parts of a sentence score?",
        a: "Centrality is a TextRank PageRank walk over sentence similarity, frequency sums each content word's 1 + log count weight divided by the square root of the sentence length, and position decays as 1 / (1 + 0.12 x index). They are combined at 0.55, 0.35 and 0.10.",
      },
      {
        q: "How is the percentage length turned into a number of sentences?",
        a: "The sentence count is multiplied by the percentage and rounded, with a minimum of one sentence. The selected count is shown beside the control, so a 20% choice over 30 sentences selects six.",
      },
      {
        q: "What does key-term coverage measure?",
        a: "The share of the weight of the ten most frequent content terms that the selected sentences actually contain. A low figure means a recurring subject was left out of the selection, not that the scoring failed.",
      },
      {
        q: "Why did a short sentence outrank a longer one?",
        a: "Because frequency is divided by the square root of the sentence length. The division is deliberate: without it, the longest sentence in any document would win by size alone rather than by content.",
      },
    ],
  },

  "key-points-extractor": {
    keywords: [
      "key points extractor",
      "ranked sentences",
      "key terms",
      "best first",
    ],
    intro:
      "The Key Points Extractor turns the highest-ranked sentences of a text into a numbered list, best first, with up to 20 points and the key terms behind the ranking shown beside it.",
    content:
      "Where a summary keeps the prose flowing, this key points extractor returns the same ranked sentences as a list you can work through, with no sentence merged, dropped or joined to a neighbour. Each point is one sentence from the text, shown with its rank, its score and up to four of its highest-weight terms, and the list is ordered best first.\n\n- Maximum points: 1 to 20, default 5, with a Reset to 5 points button.\n- Every point carries its rank, its score and up to four of its highest-weight terms.\n- The key terms table lists the top 12 content terms with their counts and the 1 + log(count) weight the ranking used.\n- Points as a continuous extract, plus Copy points and Download key-points.txt.\n- The continuous extract joins the same points with spaces, in document order, for pasting where a list would be wrong.\n\nThe scoring is the same published method the summariser uses: TextRank centrality over a sentence-similarity graph, weighted 0.55, plus a frequency part weighted 0.35 and a position part weighted 0.10, each normalised to its best sentence. Content words exclude stopwords, single characters and punctuation, and rank 1 is simply the highest combined score; ties fall back to document order so the result is deterministic. The key terms panel shows the same weights the frequency part used, which is why a point's terms and the term table often overlap: the terms are the evidence, and the score is the conclusion.\n\nWhen you ask for more points than a short text can support, the page says so rather than repeating itself: the extractor never returns the same sentence twice, and the count beside the control reflects what was actually extracted. Ties are broken by document order, so two equally scored sentences always appear in the order the author wrote them.\n\n- The ranking measures centrality, not importance to your argument, so a point you cannot lose may sit below one that repeats.\n- A point is a whole sentence; a verbose sentence occupies a slot a tighter one might fill better, and the engine never trims it.\n- The list is in score order, so it is a set of claims rather than an outline; sequencing them is your job.\n- A short text can return fewer points than the maximum you set, and the page shows what was extracted.\n- The engine cannot merge, split or edit sentences; every point is exactly as written.\n- Sentence scoring has no memory: each point is scored in isolation from the others, so two similar sentences can both make the list.\n\nUse the points as an outline rather than an output: read them best first, reorder them into the argument you want, and use the continuous extract when a list would be the wrong shape for the final document. If a point reads as two ideas, that is a sentence to fix in the source rather than a reason to ignore the point. A point is a starting position, not a verdict: the score says the sentence is central, and only you can say it is true.",
    howTo: [
      { step: "Paste the text; the points are ranked as you type." },
      { step: "Set Maximum points between 1 and 20, or use Reset to 5 points." },
      { step: "Read the key points best first, with each point's score and terms beside it." },
      { step: "Copy points or Download key-points.txt to use the list as an outline." },
    ],
    whenToUse:
      "Use the extractor when you want a list to work from. The {{text-summarizer|Text Summarizer}} returns the same selection as continuous prose, and the {{bullet-point-extractor|Bullet Point Extractor}} takes the other approach entirely, turning every sentence into a bullet rather than ranking them.\n\nWhen the constraint is a single line rather than a list, the {{tldr-generator|TL;DR Generator}} quotes the top-ranked sentences inside a character cap.",
    faqs: [
      {
        q: "How is this different from the Text Summarizer?",
        a: "The scoring is identical. The summariser selects a percentage and returns continuous prose in document order; this tool returns the top-ranked sentences as a list, best first, with an explicit maximum you control.",
      },
      {
        q: "What do the terms beside a point mean?",
        a: "They are up to four of the sentence's highest-weight content words, ranked by the same 1 + log(count) weight the frequency score uses. They show why the sentence ranked where it did.",
      },
      {
        q: "Can I extract more than twenty points?",
        a: "No. The Maximum points field accepts 1 to 20. Longer lists stop being key points; if you need every sentence, the Bullet Point Extractor is the right tool.",
      },
      {
        q: "Two points share the same score — how is the order decided?",
        a: "Ties are broken by document order, so the same text always produces the same list. There is no random element anywhere in the ranking.",
      },
      {
        q: "Is the key terms table the same as key-term coverage?",
        a: "No. The table lists the top 12 terms with counts and weights; coverage, shown by the summariser, measures how much of the top ten terms' weight a selection contains.",
      },
    ],
  },

  "tldr-generator": {
    keywords: [
      "TL;DR generator",
      "character cap",
      "top-ranked sentences",
      "document order",
    ],
    intro:
      "The TL;DR Generator quotes the highest-scoring sentences that fit a character cap — 220 characters by default — and never more than the sentence limit you set. If nothing fits, it says so instead of inventing a shorter line.",
    content:
      "A short gist is a budget problem, and this TL;DR generator is built around the budget: you set a character cap and a maximum sentence count, and it fills them from the top-ranked sentences, quoted exactly and returned in document order. The defaults — 220 characters and three sentences — suit a chat reply or an email opener, and both can be changed before or after pasting.\n\n- Character cap: 40 to 2000 characters, default 220.\n- Maximum sentences: default 3, within whatever the character cap can hold.\n- Budget behaviour: the best sentence is always shown; if even it exceeds the cap, the page reports that rather than dropping it silently.\n- Stats and export: characters in the gist, words, sentences used and the share of the text, plus Copy TL;DR, Copy report and Download tldr.txt.\n- The character count shown is the gist's own length after joining, not the sum of the selected sentences, so it always matches what you would paste in.\n\nThe selection runs on the shared sentence scoring: TextRank centrality weighted 0.55, term frequency weighted 0.35 and position weighted 0.10, normalised so the best sentence is 1.000, and the same input always produces the same gist. Sentences are then visited in rank order and kept while the projected length — including the joining space — stays inside the cap and the sentence limit. Nothing is paraphrased, trimmed or reordered: the chosen sentences are joined with single spaces in the order they appear in the source, so the TL;DR reads as an excerpt rather than a patchwork. The over-budget flag exists because a cap can be smaller than every sentence in the text, and a tool that pretended otherwise would be lying about what it did. The report spells out the arithmetic: characters, words, sentences used and the share of the source, with a method line naming the three weights.\n\n- A character cap is a budget, not a judgement: the last sentence that fits can be weaker than one that did not.\n- Dense text may fit only one sentence inside 220 characters, and the page shows that plainly.\n- The gist inherits the ranking's blind spots, so repetitive text can produce a repetitive gist.\n- Sentence boundaries come from the shared splitter; an abbreviation it misreads can affect which sentences fit.\n- A gist of one long sentence can read as a fragment of a thought, which is why the report shows how much of the text was used.\n- It cannot summarise ideas spread across short fragments; several short sentences can crowd out one strong one.\n- The sentence limit is applied as a stop: three strong sentences end the gist even when a fourth would still fit the character budget.\n\nUse the TL;DR as a first line, not as a summary: it is the best sentence-sized answer to what is this, and the full summariser remains the right tool when the answer needs to scale with the text. Raise the cap to about 280 characters when the gist opens an email, lower it for chat, and read the sentence table when the result feels off: it shows which sentence forced the budget. A gist that fits the cap but misses the point is a signal to raise the cap rather than to distrust the ranking.",
    howTo: [
      { step: "Paste the text; the gist is chosen as you type." },
      { step: "Set the character cap between 40 and 2000, and the maximum sentences." },
      { step: "Read the one-line gist and the sentence table showing why each sentence was used." },
      { step: "Copy TL;DR, Copy report or Download tldr.txt." },
    ],
    whenToUse:
      "Use the TL;DR when the answer has to fit a fixed slot such as a chat reply or an email opener. When the length should scale with the text instead, the {{text-summarizer|Text Summarizer}} takes a percentage, and when the output should be a list rather than a line, the {{key-points-extractor|Key Points Extractor}} is the better shape.\n\nFor a brief with a bottom line and findings, the {{executive-summary-builder|Executive Summary Builder}} arranges the same ranking around the way briefs are actually read.",
    faqs: [
      {
        q: "What happens if no sentence fits the character cap?",
        a: "The best sentence is still shown, and the page flags that it is over budget. Nothing shorter scored highly enough to replace it, and the tool reports that situation rather than truncating a sentence.",
      },
      {
        q: "Are sentences shortened to fit the cap?",
        a: "Never. Whole sentences are selected or skipped. Trimming would put words in your text that you did not write, which is exactly what an extractive tool must not do.",
      },
      {
        q: "Why is the gist in document order?",
        a: "Because an excerpt should read like the source. The sentences are chosen by rank but joined in the order they appear, so the gist scans as a passage rather than as a jump-cut between unrelated lines.",
      },
      {
        q: "What does the over-budget note mean?",
        a: "It means the highest-ranked sentence is longer than your cap. Lower the sentence limit cannot help; either raise the cap or accept that this text has no short strong sentence.",
      },
      {
        q: "Can this tool make a longer summary?",
        a: "Not directly. Raise the character cap and the sentence limit, but for a multi-paragraph result the Text Summarizer is the right tool: same scoring, length expressed as a percentage instead of a budget.",
      },
    ],
  },
};
