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
    keywords: ["text summarizer", "extractive summary", "summarize text"],
    intro:
      "This text summarizer scores every sentence with TextRank centrality, log term frequency and position, then returns the highest-ranked sentences in their original order as an extractive summary — the sentences are taken from your text, never rewritten.",
    content: `Most summarisers on the web either call a model or quietly paraphrase. This text summarizer does neither. It was built for one job: summarize text by selecting the sentences that already say what it says, so every sentence in the output already exists in the input, in the same words and the same order. Nothing is composed, shortened or reworded, and the page labels the result an extractive summary for exactly that reason. The engine runs in the browser: no model, no training data, no network request, and nothing is uploaded.

Sentence scoring has three published parts. TextRank centrality is the first: sentences become vectors of their content words, a similarity graph is built with the classic Mihalcea-Tarau measure |Si shared with Sj| / (log |Si| + log |Sj|), and PageRank runs for 30 fixed iterations with damping 0.85. Log term frequency is the second: each content word weighs 1 + log(count), summed over the sentence and divided by the square root of its length so long sentences do not win by size alone. Position is the third: a mild 1 / (1 + 0.12 x index) decay. The final score is 0.55 x centrality + 0.35 x frequency + 0.10 x position, normalised so the best sentence reads 1.000. Every part is printed per sentence in the score table, so a ranking can be recomputed rather than trusted.

Length is a control, not a guess. Choosing about 10, 20, 30 or 40 percent sets the selection size to that share of the sentence count, rounded to at least one sentence. The tool reports how many sentences were selected, what share of the words that is, and the key-term coverage: the top ten content terms by weight, and the share of their total weight the selection contains. Coverage is the honest measure of what a summary kept, and it is more informative than a length percentage on its own.

Where the method is weak, the page says so. Repetition beats meaning: a sentence that shares vocabulary with the rest of the text outranks one that carries the single most important claim but uses unusual words. Texts with one dominant term, very short texts, and documents whose opening paragraph restates the title are the cases where the ranking is least useful. The sentence splitter is also a mechanical rule, so headings, captions and list items are treated as sentences, abbreviations such as Dr. can split a sentence in two, and negation is invisible — a summary can quote a sentence that says the opposite of the document's point if the vocabulary matches.

In practice the tool is a triage aid, not an author. Run it at 10 percent to see what the scoring thinks the text is about, then at 30 percent for a working brief, then read the original for anything the ranking missed by design. Because the output is a quotation, the seams between selected sentences show; that is information about the document, not a bug to smooth over.

The result is deterministic. The PageRank starts from a uniform vector, performs a fixed number of iterations and involves no randomness, so the same text produces the same ranking every time. Your text is processed in this browser only and is not stored; the summary disappears with the tab unless you copy or download it.

What this is not: an abstract generator, a rewriter, a translation tool or a fact checker. It cannot judge whether the extracted sentences are true or whether the document argues well, and it does not claim to understand the text — it ranks sentences by three stated signals and shows its arithmetic.`,
    howTo: [
      { step: "Paste the text you want to summarise; the sentence scores appear as you type." },
      { step: "Choose a length — 10 percent for a triage read, 30 percent for a fuller brief." },
      { step: "Read the summary, then check the key-term coverage figure to see what the selection kept." },
      { step: "Open the score table and look at the three parts of any sentence you think was misjudged." },
      { step: "Copy or download the report, and edit the selection by hand where the scoring missed your point." },
    ],
    whenToUse: `Use this summarizer when you need a shorter version of a document you already have and want to know exactly which sentences survived. When you need the result as a ranked list rather than a paragraph, the {{key-points-extractor|Key Points Extractor}} shows the same scoring as numbered points with their evidence, and when you need a single line that fits a strict character budget, the {{tldr-generator|TL;DR Generator}} is built for that.\\n\\nIf the question is how the text reads rather than what it says, the {{readability-grade-scorer|Readability Grade Scorer}} measures difficulty and the {{sentence-variety-checker|Sentence Variety Checker}} looks at rhythm.`,
    faqs: [
      {
        q: "Is the summary written by the tool or taken from my text?",
        a: "Taken from your text. The summarizer is extractive: it selects whole sentences and returns them verbatim in their original order. It never composes, shortens or paraphrases, which is why the output can read as disjointed and is always labelled extractive.",
      },
      {
        q: "What do the three scores in the sentence table mean?",
        a: "Centrality is TextRank PageRank over a sentence-similarity graph, frequency is the summed log weight of the sentence's content words divided by the square root of its length, and position is a mild decay from the start of the text. The final score weights them 0.55, 0.35 and 0.10.",
      },
      {
        q: "Why did the summarizer pick a sentence I would not have chosen?",
        a: "Because the scoring rewards vocabulary shared with the rest of the text, not importance. A sentence that repeats the document's key terms ranks above one carrying a decisive but unusual claim. The score table shows which signal raised it so you can disagree with the reason, not just the result.",
      },
      {
        q: "How is key-term coverage calculated?",
        a: "The tool takes the ten content terms with the highest weight, where a term's weight is 1 + log(count), and reports what share of their combined weight appears in the selected sentences. It is a measure of what the summary kept, not a quality judgement.",
      },
      {
        q: "Does the same text always produce the same summary?",
        a: "Yes. PageRank starts from a uniform vector and runs a fixed 30 iterations with deterministic arithmetic, so there is no randomness and no model sampling. The same input produces the same output on every run, in every browser.",
      },
    ],
  },

  "key-points-extractor": {
    keywords: ["key points extractor", "extract key points", "key point"],
    intro:
      "The key points extractor ranks the sentences of a passage and returns the top ones as numbered points, each with its score and the terms that carried it — extraction rather than generation, so every point is a verbatim sentence from your text.",
    content: `A summary reads as prose; a list of key points reads as a list, and the difference matters when the output is going into meeting notes, a revision plan or a slide. Use this tool to extract key points from a long passage and get them back as numbered items rather than a paragraph. The key points extractor uses the same sentence-scoring engine as the summariser and presents its result as ranked points. The maximum is yours to set from 1 to 20, with five as the default. Nothing is generated: each point is a sentence lifted whole from the source, so a point can be checked against the original in a second.

Scoring is identical across the extractive tools and is published on the page. Each sentence is scored 0.55 x TextRank centrality + 0.35 x log term frequency divided by the square root of its length + 0.10 x position decay, normalised so the best sentence is 1.000. The point list shows the final score, the word count and up to four of the sentence's highest-weight terms. Below it, the key-term table lists every content term the scoring used with its count and its weight, which is the evidence for why one sentence outranked another.

Rank order and document order are different things, and the tool shows both. The numbered points run from most important to least important as the scoring sees it; the continuous extract beneath joins the same sentences back in their original sequence, which is what you want when the points need to be read as a passage rather than a checklist. Stopwords are excluded from the scoring, terms are matched case-insensitively, and the counts shown are the counts used.

The limits are worth stating plainly, because a ranked list invites more trust than a paragraph does. The extractor does not cluster near-duplicate sentences, so two points can say almost the same thing and both appear; it has no idea what a decision, an action item or a speaker is, so it is not a meeting-minutes tool despite the format; it treats headings, captions and list items like any other sentence; and the sentence splitter is mechanical, so an abbreviation such as Dr. can cut one sentence into two and names with initials can merge text unexpectedly. A document that is mostly bullet lists will produce points that are themselves bullet fragments.

Used within those limits, the ranked list is a fast way through long material. Paste a report and read the top five points before deciding whether the whole thing needs reading. Paste two drafts of the same section and compare which points each one ranks first. Paste a talk transcript and build a speaking outline from the sentences that carry the most shared vocabulary. In every case the output is a shortlist to check against the source, not a substitute for reading it.

Everything runs locally in this browser. There is no model, no training data, no network call and no storage: the points exist on screen and in whatever you copy or download, and closing the tab removes them. The scoring is deterministic, so the same text with the same point limit produces the same list every time.

Use it when the shape you need is a list and the honesty you need is quotation. If you want flowing prose instead, the summariser presents the same selection as a paragraph, and if the passage needs to fit a hard character limit, the TL;DR generator is the one that enforces a budget.`,
    howTo: [
      { step: "Paste the passage; the ranked points appear as you type." },
      { step: "Set the maximum number of points, from 1 to 20 — five is the default." },
      { step: "Read the numbered points in rank order, and the terms beside each one as its evidence." },
      { step: "Use the continuous extract to check the same sentences in their original sequence." },
      { step: "Copy or download the list and verify any point you plan to quote against the source." },
    ],
    whenToUse: `Use this extractor when the result needs to be a shortlist rather than a paragraph — meeting prep, revision notes, a talk outline. When you want the same selection written as flowing text, the {{text-summarizer|Text Summarizer}} presents it that way, and when the output has to fit a strict character cap, the {{tldr-generator|TL;DR Generator}} enforces one.\\n\\nIf the points will be quoted in published work, the {{grammar-checker|Grammar Checker}} and the {{spell-checker|Spell Checker}} are the mechanical passes to run over the surrounding text first.`,
    faqs: [
      {
        q: "Are the key points written or quoted?",
        a: "Quoted. Each point is a whole sentence copied from your text, shown with the score that ranked it and the terms that carried it. The extractor never paraphrases, which is why a point can be pasted into notes without changing its wording.",
      },
      {
        q: "Why do two of my key points say nearly the same thing?",
        a: "Because the extractor does not cluster near-duplicate sentences. If a document repeats a claim in different words and both sentences score well, both are returned. Remove the one you do not need, or lower the maximum number of points.",
      },
      {
        q: "Can I use this to extract action items from meeting notes?",
        a: "No, and it does not claim to. The scoring knows term frequency and sentence centrality; it has no concept of a decision, an owner, a deadline or a speaker. A sentence containing an action item may rank well, but so may a sentence that merely repeats the topic. Treat the list as a shortlist only.",
      },
      {
        q: "What is the continuous extract for?",
        a: "It joins the same chosen sentences back into document order. Rank order answers what matters most; document order answers what comes first, which is what you need when the points will be read as a passage or used as a talk outline.",
      },
      {
        q: "Is the scoring the same as the text summariser?",
        a: "Yes — 0.55 x TextRank centrality + 0.35 x log term frequency + 0.10 x position, normalised to the best sentence. The two tools differ only in how they present the selection: as numbered points here, as a paragraph there.",
      },
    ],
  },

  "tldr-generator": {
    keywords: ["TL;DR generator", "TL;DR", "character cap"],
    intro:
      "The TL;DR generator returns the shortest honest gist of a text: the highest-scoring sentences that fit your character cap, quoted verbatim, and when even the best sentence is too long it says so instead of hiding the overrun.",
    content: `A TL;DR is a promise about length, so a TL;DR generator that ignores its own limit is useless. This one takes a character cap — 220 by default, adjustable from 40 to 2,000 — and builds the gist from whole sentences that fit inside it. The output is extractive: the sentences are quoted from your text in their original order, never written or compressed. A truncated sentence would be a misquotation, so the tool would rather return one long sentence with a visible over-budget notice than cut it in half.

Selection works from the ranked sentence list. Every sentence is scored with the shared engine — TextRank centrality at weight 0.55, log term frequency at 0.35, position decay at 0.10, normalised so the best sentence is 1.000 — and the generator takes sentences in rank order while the running character count fits the cap, up to your sentence limit of one to five. The counts shown are recomputed from the final text: characters including spaces, words, the share of the whole document, and the number of sentences used. Because the chosen sentences are re-sorted into document order before display, the gist reads in the sequence the author wrote it.

Each sentence in the result is listed with the figures that chose it: rank, final score, centrality, frequency. That list is the answer to the obvious question a one-line summary provokes — why this sentence and not another — and it makes the tool auditable in a way a one-line output usually is not. If the list looks wrong, the score table under the summariser shows the same arithmetic across every sentence in the document.

The failure modes are structural, not hidden. A document whose opening sentences restate the topic will produce a gist from those sentences, because they share the most vocabulary with the rest of the text. A document with no repeated terms has no clear centre, so the ranking is closer to arbitrary. A single-sentence document returns that sentence whether it fits or not. Dialogue, lists and captions are segmented mechanically, so a TL;DR can quote a caption as if it were a claim, and negation is invisible to the scoring.

The character cap is a hard limit on the output the tool produces, but not a cap it can always honour: if the highest-scoring sentence exceeds it, that sentence is returned with the over-budget flag set, because the alternatives — truncating it or substituting a lower-scoring sentence — would both be dishonest. The flag tells you exactly which situation you are in, and raising the cap is the one-line fix.

Use the TL;DR generator for reading triage, changelog headers, newsletter intros and anywhere a reader has a fixed budget of attention. Do not use it as an abstract: an abstract is supposed to summarise a whole argument in the author's voice, and this tool quotes instead. Do not use it where a misquote would matter without checking the sentence against the source, which is why the sentences used are always listed.

Nothing leaves the browser. The ranking is deterministic, so the same text and the same cap produce the same TL;DR every time, and nothing is stored after the tab closes.`,
    howTo: [
      { step: "Paste the text to compress; the TL;DR appears as you type." },
      { step: "Set the character cap — 220 is the default, useful for intros and headers." },
      { step: "Set the maximum number of sentences, from 1 to 5." },
      { step: "Read the sentences-used list to see the rank and score behind each quoted sentence." },
      { step: "Copy the TL;DR, or the full report when you need the figures alongside it." },
    ],
    whenToUse: `Use this generator when the output has a hard length limit — a subject line, an intro paragraph, a changelog header. When the limit is a share of the document rather than characters, the {{text-summarizer|Text Summarizer}} takes a percentage instead, and when the output should be a ranked list of points, the {{key-points-extractor|Key Points Extractor}} presents the same scoring as numbered items.\\n\\nFor a measured view of how long your text already is, the {{word-count-tool|Word Count Tool}} and the {{character-count-tool|Character Count Tool}} give the counts the cap is applied against.`,
    faqs: [
      {
        q: "What happens if my best sentence is longer than the character cap?",
        a: "It is returned anyway, with an over-budget notice. Truncating the sentence would misquote it and swapping in a lower-scoring sentence would hide the problem, so the tool reports the overrun and suggests raising the cap instead.",
      },
      {
        q: "How is the character cap counted?",
        a: "In characters, including spaces, across the joined sentences. The cap is applied while sentences are selected in rank order and recomputed once the final text is assembled, so the number shown beside the result is the real length of what you are about to copy.",
      },
      {
        q: "Is the TL;DR a paraphrase?",
        a: "No. It is an extractive gist: the sentences are quoted verbatim from your text, in their original order. The generator selects and joins; it never rewrites. That is also why the wording cannot drift from the source.",
      },
      {
        q: "Why does the TL;DR sometimes come from the first part of the text?",
        a: "Because opening sentences usually share the most vocabulary with the rest of the document, and centrality rewards shared vocabulary. A text whose introduction states the topic will therefore often supply the gist; a text with no repeated terms has no strong centre at all.",
      },
      {
        q: "Can I use this for an abstract or an executive summary?",
        a: "It is the wrong shape for both. An abstract is written in the author's voice and an executive summary carries recommendations, while this tool quotes sentences and has no idea what a recommendation is. Use it for length-bounded gists and check the quoted sentences before publishing.",
      },
    ],
  },
};
