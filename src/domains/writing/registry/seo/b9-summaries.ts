import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B9, summarisation family: authored SEO entries for the executive
 * summary builder, the bullet point extractor, the important sentence
 * highlighter and the meeting summary formatter. Keys are registry slugs; see
 * ../tool-seo.ts for the contract these entries are validated against.
 */
export const B9_SUMMARIES_SEO: Record<string, ToolSeo> = {
  "executive-summary-builder": {
    keywords: ["executive summary builder", "executive summary", "bottom line"],
    intro:
      "The executive summary builder turns an extractive selection into the shape an executive reads first: one bottom line, then numbered findings in document order, with the coverage of the document's key terms reported beside them.",
    content: `An executive summary is usually written after the document by someone who has read it. This executive summary builder takes a different route and says so: it extracts. The bottom line is the highest-ranked sentence in the document, the findings are the rest of the selected sentences in the order they appear, and every line is quoted verbatim. Nothing is composed, nothing is condensed and nothing is smoothed into an executive voice.

The shape of the page is the shape of the output. A single bottom-line panel carries the highest-scoring sentence with its three score parts — centrality, frequency and position — printed underneath, so the claim that this is the most representative sentence can be checked rather than believed. The findings below are numbered in document order, each with its score, and the overview reports four figures that matter for a brief: how many sentences were selected, the document's word count, the brief's word count, and the key-term coverage, which is the share of the document's top ten content terms by weight that the selection contains.

Length is a dial rather than a guess. Short takes about 20 percent of the sentences, standard about 30 and full about 40, always rounded up to at least one sentence. The scoring is the shared extractive method used across this domain: TextRank centrality at weight 0.55, log term frequency divided by the square root of sentence length at 0.35, and a mild position decay at 0.10, normalised so the best sentence reads 1.000. Because the selection is deterministic, the same document produces the same brief on every run, in every browser.

The limits are worth reading before the brief is circulated. The ranking rewards sentences that share vocabulary with the rest of the document, which means an introduction that restates the topic can take the bottom line from a recommendation buried in the middle. Documents with one dominant term produce a brief that circles that term; short documents — under about six sentences — give the percentage dial almost nothing to work with. The scorer has no concept of a recommendation, a risk, a number or a decision: it knows term frequency and sentence connectivity, and nothing else. Headings, captions and list items are treated as sentences because the splitter is mechanical.

Used as a first pass, the tool saves the mechanical half of the work. Run it on a draft report, read the bottom line and the findings, and treat them as a shortlist of the sentences the document itself emphasises. Rewrite the bottom line in your own words if the brief is going to a reader who expects a recommendation, and check the coverage figure: a low number means the selection kept the vocabulary but may have missed a key point that appears only once.

Everything runs locally. The document is not uploaded, no model is called, nothing is stored after the tab closes, and the brief can be copied or downloaded as plain text. That combination — local, deterministic and quoted — is what makes the output auditable: any reader can find every line of the brief in the source document.`,
    howTo: [
      { step: "Paste the full document; the bottom line and findings appear as you type." },
      { step: "Choose short, standard or full to set how much of the document the brief covers." },
      { step: "Read the bottom-line sentence with its score, then the numbered findings in document order." },
      { step: "Check the key-term coverage figure to see what the selection kept and what it left behind." },
      { step: "Copy or download the brief, then edit the bottom line by hand for the audience it is going to." },
    ],
    whenToUse: `Use this builder when the output needs the bottom-line-then-findings shape. When the same selection should read as a continuous paragraph instead, the {{text-summarizer|Text Summarizer}} presents it that way, and when the brief should be a ranked list of points rather than numbered findings, the {{key-points-extractor|Key Points Extractor}} does that.\\n\\nIf the material is meeting notes rather than a document, the {{meeting-summary-formatter|Meeting Summary Formatter}} sorts decisions, actions and questions before any summary is written.`,
    faqs: [
      {
        q: "Is the bottom line written or selected?",
        a: "Selected. It is the highest-ranked sentence in the document, quoted exactly, with its centrality, frequency and position scores printed underneath. If the sentence the ranking chose is not the real bottom line, edit it by hand — the tool will not invent one.",
      },
      {
        q: "What does key-term coverage tell me?",
        a: "It is the share of the document's top ten content terms, weighted by how often they appear, that the brief's sentences contain. A high coverage figure means the brief kept the vocabulary the document leans on; a low one is a signal that the selection may have missed a point that appears rarely.",
      },
      {
        q: "Why does the bottom line sometimes come from the introduction?",
        a: "Because centrality rewards sentences that share content words with the rest of the document, and an introduction that previews the topic tends to share the most. The scoring has no idea what a recommendation is, so a document that buries the point can produce a brief that buries it too.",
      },
      {
        q: "Can I use this for a one-page brief of a long report?",
        a: "Yes, with the understanding that the brief is a quotation of the report's own sentences. Long reports with repeated terminology work best; a report that never repeats a term gives the ranking no centre and the brief becomes arbitrary. Read the coverage figure before you trust the shape.",
      },
      {
        q: "Does the document leave my browser?",
        a: "No. The scoring runs in this browser, there is no model, no upload and no storage, and the brief exists only on screen and in whatever you copy or download. Closing the tab removes it.",
      },
    ],
  },

  "bullet-point-extractor": {
    keywords: ["bullet point extractor", "prose into bullets", "bullet points"],
    intro:
      "The bullet point extractor turns each sentence of prose into one bullet, removes a leading connector only when it comes from the published list, and shows every edit it made — so a paragraph and its bullets can be compared line by line.",
    content: `Turning prose into bullets sounds like a formatting job until you have to check the result. This bullet point extractor takes the position that the only safe edit is a small one it can report: one sentence becomes one bullet, and the single rewrite it can perform is dropping a leading connector such as Additionally, However or Finally, because those words exist to link sentences that bullets no longer join. Every removal is listed with the source sentence beside the bullet, so nothing changes without a visible reason.

The connector list is short and published — 23 entries, each stored with its comma — so the tool's vocabulary is knowable. A connector without its comma (However the plan changed) is left alone, since the comma is what marks it as a linking phrase, and a connector that appears mid-sentence is never touched. Sentences that begin directly with their content come out unchanged. The engine does not sentence-shorten, does not split on dashes and does not reorder anything.

Mixed documents are handled rather than flattened. Existing bullet and numbered lines in the pasted text are detected and preserved verbatim by default, at the top of the output, because a document that already has list items — a checklist in the middle of a memo — should keep them. A checkbox turns that off, and the tool then builds bullets from prose sentences only and says which lines it ignored. Two more controls respect house style: bullets can drop a single trailing period, and the option never touches question marks, exclamation marks or ellipses.

The output is immediately usable. Bullets are returned as a Markdown-style list, ready to paste into a chat message, an issue tracker or a Markdown file, and the report adds the counts — bullets produced, source sentences, existing list lines preserved and which connectors were removed. Nothing is stored: paste, copy, leave.\n\nBullet points are a reading contract as much as a format: a reader takes each item in on its own, so a list that holds four long sentences is harder to scan than the paragraph it came from. That is why the change table matters — it shows exactly how much the reformatting did and did not do — and why the trailing-period and existing-list options are yours to set rather than a house style the tool decides for you. If the resulting bullet points need to be shorter, that is an editing pass; this extractor will not make it, and the page says so up front.

Where the tool stops is where every mechanical list-maker stops. It cannot judge length: a 40-word sentence becomes a 40-word bullet, because shortening it would require rewriting it. It cannot build hierarchy, group related bullets or notice that two bullets say the same thing. Sub-clauses stay inside their sentence, and quoted speech inside a sentence stays where it is. The sentence splitter is also mechanical, so an abbreviation can cut a sentence in two, and a bullet list with hanging sub-lines will produce bullets and unclassified text side by side.

Used honestly, that makes the tool a fast first pass for meeting notes, feature lists and study notes: the extraction is exact, the only loss is the connective tissue, and the change table tells you which sentences lost which word. Anyone who needs the shorter, rewritten version is asking for a summariser or a human editor, and the page says so rather than pretending a sentence-per-bullet pass is a summary.`,
    howTo: [
      { step: "Paste paragraphs — keep any existing bullet lines so they are detected and preserved." },
      { step: "Decide whether existing list lines should be preserved or ignored." },
      { step: "Turn on trailing-period removal if your house style writes bullets without it." },
      { step: "Read the change table: every bullet that differs from its sentence shows the connector removed." },
      { step: "Copy the bullet list and edit for length and grouping by hand." },
    ],
    whenToUse: `Use this extractor when the source is prose and the destination is a list. When you need fewer words rather than reformatted words, the {{text-summarizer|Text Summarizer}} selects sentences for a shorter document and the {{tldr-generator|TL;DR Generator}} fits a character cap.\\n\\nWhen the list is meant to be a ranked shortlist rather than a faithful reformat, the {{key-points-extractor|Key Points Extractor}} scores sentences and orders them by importance, and the {{important-sentence-highlighter|Important Sentence Highlighter}} marks the same ranking in place.`,
    faqs: [
      {
        q: "Does the tool shorten long sentences?",
        a: "No. One sentence becomes one bullet, unchanged apart from a removed leading connector. A long sentence makes a long bullet. Shortening is a rewriting job, and this tool deliberately performs no rewriting, so the change table can stay complete.",
      },
      {
        q: "Which connectors are removed?",
        a: "Twenty-three published entries, including Additionally, However, Therefore, Furthermore, Finally and In conclusion — each stored with its comma. A connector without the comma, or one in the middle of a sentence, is left exactly as written.",
      },
      {
        q: "What happens to bullet lists that are already in my text?",
        a: "They are detected and preserved verbatim, listed ahead of the new bullets. You can switch that off, in which case those lines are ignored rather than converted, and the tool reports how the output was built.",
      },
      {
        q: "Why does an abbreviation sometimes split a sentence?",
        a: "Because sentence boundaries come from the platform's segmenter, which follows character rules rather than grammar. An abbreviation or an initial can end a segment early. The bullets stay faithful to what the splitter found, and you can fix the boundary by editing the source.",
      },
      {
        q: "Can I paste the bullets straight into Markdown?",
        a: "Yes. The output is a plain Markdown-style list with hyphen markers, one bullet per line, and the copy button puts the whole list on your clipboard. Nothing is stored in the browser.",
      },
    ],
  },

  "important-sentence-highlighter": {
    keywords: ["important sentence highlighter", "highlight sentences", "sentence ranking"],
    intro:
      "The important sentence highlighter marks the top-ranked sentences where they sit, so a document keeps its context: the highlight is provably lossless, and the rank and score of every marked sentence is listed beside it.",
    content: `Most summarisers lift sentences out of a document, which loses the paragraph they belonged to. This important sentence highlighter does the opposite: it marks the highest-ranked sentences in place. The document stays intact — headings where they were, paragraphs where they were — and the marks say which sentences the scoring picked. That makes it a reading aid rather than a rewriting tool, and it is the reason the page can claim the highlight is lossless: joining the unmarked and marked segments of the page reproduces the input character for character.

Ranking uses the shared extractive engine. Each sentence is scored 0.55 for TextRank centrality, 0.35 for log term frequency divided by the square root of its length and 0.10 for a mild position decay, then normalised so the best sentence reads 1.000. Choosing three, five, eight or twelve marks the top-ranked sentences; the count is adjusted automatically when the document has fewer sentences than requested, and every mark is listed below the text with its rank, its score and its sentence number so the selection can be audited sentence by sentence.

The in-place view answers questions a summary cannot. Does the document front-load its claims, or are the marked sentences scattered through the middle? Are whole paragraphs marked, or one sentence in each? A cluster of marks around a single term shows what the document is really about; a single mark in an otherwise unmarked section is usually a sentence that borrows the document's vocabulary rather than one that carries its weight. Since nothing is removed, the reader can judge the selection against the surrounding argument in the same glance.\n\nThe same sentence ranking doubles as a revision aid. Run three marks on a first draft, then twelve on the second, and watch which sentences gain and lose a mark as the prose changes; the tool keeps no version history, so the comparison is yours, but the marks are a cheap way to see whether the key sentences are surfacing where you intended. Paired with the summariser, which uses the identical scoring, the two views can highlight sentences and then display them out of context without re-scoring the document or disagreeing about ranks.

The heuristic is the same one the rest of this family uses, and its failure modes are stated plainly. Shared vocabulary beats importance: a sentence that repeats key terms is marked even when it adds nothing, while a decisive sentence in unusual language is left plain. Headings, captions and list items are treated as sentences by the mechanical splitter, so a caption can carry a mark. Very short documents give the ranking little to work with, and a document with one dominant term will mark the sentences that repeat it.

Nothing is uploaded. The text is processed in the browser, the ranking is deterministic so the same paste produces the same marks, and no copy of the document is stored — the marks disappear with the tab. The highlighted sentences can be copied or downloaded as a plain list, which is useful when the marks are the point and the surrounding text is not.`,
    howTo: [
      { step: "Paste the document; the highest-ranked sentences are marked as you type." },
      { step: "Choose how many marks you want — three, five, eight or twelve." },
      { step: "Read the text with its context, then check the ranked list below the marks." },
      { step: "Compare the marked positions: clustering and spread both say something about the document." },
      { step: "Copy or download the list of marked sentences when you need them apart from the text." },
    ],
    whenToUse: `Use this highlighter when the document needs to be read with its context intact. When the selection should be lifted out and read as a paragraph, the {{text-summarizer|Text Summarizer}} returns it that way, and when it should become numbered points with their terms, the {{key-points-extractor|Key Points Extractor}} does that.\\n\\nWhen the goal is a bottom-line brief with findings, the {{executive-summary-builder|Executive Summary Builder}} reuses the same ranking in that shape, and the {{bullet-point-extractor|Bullet Point Extractor}} reformats prose rather than ranking it.`,
    faqs: [
      {
        q: "Is anything removed from my document?",
        a: "Nothing. The page splits the text into marked and unmarked segments and renders both; joining every segment reproduces your input exactly. The document is never rewritten, and the marks are only a visual layer.",
      },
      {
        q: "How are the sentences ranked?",
        a: "With the shared extractive score: TextRank centrality at weight 0.55, log term frequency divided by the square root of sentence length at 0.35, and a mild position decay at 0.10, normalised so the best sentence reads 1.000. The ranked list shows each marked sentence's score.",
      },
      {
        q: "Why was a caption or heading marked?",
        a: "Because the sentence splitter is mechanical and treats short standalone lines as sentences. A caption that repeats the document's key terms can therefore rank highly. Read the marked list with that in mind; the tool does not know what a heading is.",
      },
      {
        q: "Can I highlight more than twelve sentences?",
        a: "The page offers three, five, eight and twelve. Twelve is enough to survey a long document without marking most of it; if you need more sentences marked, the ranked list below the text always shows every score for the whole document.",
      },
      {
        q: "Does the highlighting change how my document copies out?",
        a: "The copy and download buttons produce the ranked list of marked sentences as plain text, not the document with markup. If you need the whole document, use your own editor; nothing here alters the source text.",
      },
    ],
  },

  "meeting-summary-formatter": {
    keywords: ["meeting summary formatter", "meeting notes", "action items"],
    intro:
      "The meeting summary formatter sorts raw meeting notes into decisions, actions and open questions using a published cue list, prints the cue that placed each sentence, and keeps the unclassified lines visible instead of discarding them.",
    content: `Meeting notes are usually a stream: what was mentioned, what was agreed, what someone promised to do. This meeting summary formatter sorts that stream into three sections — decisions, actions and open questions — using a cue list you can read, and it prints the cue beside every item so a wrong placement is obvious at a glance. Sentences that carry no cue are kept together in an unclassified section rather than being dropped, because the notes are the record, not the formatter's output.

The order of judgement is fixed and documented. Ten explicit labels are checked first (Action:, Action item:, Next step:, To do:, Decision:, Decided:, Resolution:, Question:, Open question:, TBD:), then 19 action cues, 12 decision cues and 6 question cues, and finally a sentence that simply ends in a question mark. A sentence lands in exactly one section: an action written as Action: we agreed to postpone... is an action, because the label wins. Owner and due date are extracted by two small patterns — owner: Priya, or a name directly before will — and both are tagged with a question mark in the interface, because they are suggestions to confirm rather than facts.

The report is built for pasting into a follow-up message. Decisions, actions and open questions are laid out as three labelled sections with numbered items; each action carries its suggested owner and due date when the patterns fired; and the cue for each item is printed underneath in small type. The counts appear at the top — how many sentences were read, how many decisions, actions and questions were found — and the unclassified list comes last, so nothing in the notes is invisible.

What the cue list cannot do matters as much as what it can. Actions written without a cue (Priya takes the migration) stay unclassified; a sentence that mentions the word decision without deciding anything is not sorted as a decision, but a sentence with an ambiguous cue can still be misplaced. Phrases such as needs to appear in ordinary descriptive sentences as well as in assignments. The tool has no idea who was speaking, what was quoted from someone else, or which of two competing statements was the final one. It is a sorting aid over sentences you wrote, not a minute-taker and not a comprehension system.\n\nNotes that are merely reformatted do not help anyone follow up, which is the test this tool is aimed at. Action items are lifted out with the cue beside them, so the follow-up message can be assembled from the sorted list without re-reading the whole transcript. Decisions read the same way: one recorded with a cue sits at the top of the summary, while anything ambiguous stays in the unclassified list for review. Nothing is deleted and nothing is summarised away, and the three counts give an immediate sense of whether the meeting actually decided anything.

Your notes stay in this browser. They are saved to local storage so a refresh does not lose them — the page says so, and clearing browser data removes them — and nothing is uploaded, sent or logged. There is no account and no server, and the copy and download buttons are the only way the summary leaves the page.`,
    howTo: [
      { step: "Paste the raw notes; the three sections fill in as you type." },
      { step: "Use one idea per sentence where you can — the sort works on sentences, not paragraphs." },
      { step: "Read each item's cue tag and move anything the cue list placed wrongly." },
      { step: "Check the unclassified section for actions that were written without a cue." },
      { step: "Copy or download the summary and confirm each owner and due date, which are suggestions only." },
    ],
    whenToUse: `Use this formatter when the material is notes and the output is a follow-up list. When the material is a finished document and the output is a brief, the {{executive-summary-builder|Executive Summary Builder}} extracts a bottom line and findings instead.\\n\\nWhen the notes need to become a balanced paragraph rather than a sorted list, the {{text-summarizer|Text Summarizer}} is the extractive option, and if the following session needs a timed writing block, the {{writing-sprint-timer|Writing Sprint Timer}} covers the other half of the workflow.`,
    faqs: [
      {
        q: "How does the formatter decide what is a decision?",
        a: "By cue: ten explicit labels such as Decision: and Resolution:, then twelve decision phrases including we decided, we agreed and signed off. The cue that matched is printed next to the item, so any placement can be checked and overruled by reading the note itself.",
      },
      {
        q: "Why are some of my action items left unclassified?",
        a: "Because they were written without a cue from the published list. Priya takes the migration is an action to a reader but not to a cue scan. Those sentences stay in the unclassified section rather than being guessed at, and the page shows the full cue list so you can see what would have matched.",
      },
      {
        q: "Are the owner and due date extracted reliably?",
        a: "No, and they are labelled as suggestions with a question mark. Two narrow patterns are used — owner: followed by a name, and a capitalised name directly before will — plus by/due/before for a date phrase. Confirm both before circulating the summary.",
      },
      {
        q: "Where are my meeting notes stored?",
        a: "In this browser's local storage, so a refresh does not lose them. Nothing is uploaded and no server is involved; clearing this browser's site data removes the notes. The page states this beside the editor.",
      },
      {
        q: "Can it handle notes pasted from a transcript?",
        a: "It can, with two caveats. Transcripts split into many short sentences, which suits the cue scan, but speaker labels and filler will land in the unclassified section, and a quoted speaker can make a suggestion look like a decision. Treat the output as a first sort to edit.",
      },
    ],
  },
};
