import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B9, summarisation family: authored SEO entries for the executive
 * summary builder, the bullet point extractor, the important sentence
 * highlighter and the meeting summary formatter. Keys are registry slugs; see
 * ../tool-seo.ts for the contract these entries are validated against.
 */
export const B9_SUMMARIES_SEO: Record<string, ToolSeo> = {
  "executive-summary-builder": {
    keywords: [
      "executive summary builder",
      "bottom line",
      "findings in document order",
      "key-term coverage",
    ],
    intro:
      "The Executive Summary Builder separates the single highest-ranked sentence as a bottom line and lists the rest of the brief as findings in document order, so the brief reads like the document it came from.",
    content:
      "Briefs are read from the top down and often stopped after the first line, so this executive summary builder does two things at once: it lifts the strongest sentence into a bottom line, and it keeps the remaining findings in document order so the brief reads like the document rather than like a ranking. Everything in the brief is quoted from the document; the builder's contribution is the shape, not the wording.\n\n- Brief length: Short (about 20% of sentences), Standard (about 30%, the default) or Full (about 40%).\n- Bottom line: the highest-ranked sentence, shown on its own above the findings.\n- Findings in document order, each with its rank and score so the selection stays auditable.\n- Overview figures: sentences in the brief, document words, brief words and key-term coverage.\n- Export: Copy brief and Download executive-summary.txt.\n- A brief can be regenerated after an edit, and because the scoring is deterministic the differences are the document's, not the tool's.\n\nThe engine is the same published extractive scoring used across this family: TextRank centrality weighted 0.55, frequency weighted 0.35 and position weighted 0.10, normalised to the best sentence. The selection is computed by percentage and then re-sorted into document order, and the bottom line is simply rank 1, which is why the page names it rather than hiding it. Key-term coverage measures the share of the top ten terms' weight that the brief contains, so a low figure is a signal that the brief skipped a recurring subject rather than a failure of the scoring itself. Nothing is written, merged or paraphrased. The rank and score beside each finding come from the same table the summariser shows, so any finding can be traced back to the sentence that earned it. Coverage is computed over the top ten terms and shown as a percentage beside the brief's other figures. The overview lists the sentence and word counts above the bottom line, which is the fastest way to spot a brief too thin to send.\n\n- One sentence becomes the bottom line whether or not it is the one you would have chosen; the score table shows why.\n- A brief at 20% of a long document is still a set of sentences, not an argument; the connective work is yours.\n- If the document never states a conclusion, the brief cannot state one either.\n- Findings inherit repetition from the source, and a repetitious document produces a repetitious brief.\n- Coverage counts the top ten terms only, so it is a signal rather than a proof that nothing was missed.\n- The brief cannot tell a quote from an assertion; a sentence someone else is quoted as saying is selected like any other.\n\nRead the bottom line first and treat it as a claim to check, then work down the findings in document order and delete anything the bottom line already covers; that edit is where a brief stops being an extract and starts being a brief. Keep the bottom line under about 30 words where you can; a bottom line that needs a second sentence is usually a finding in disguise. If the bottom line surprises you, the score table in the summariser shows the three parts behind it.",
    howTo: [
      { step: "Paste the full document; the brief and the bottom line update as you type." },
      { step: "Choose Short, Standard or Full for the brief length." },
      { step: "Read the bottom line first, then the findings with their ranks and scores." },
      { step: "Copy brief or Download executive-summary.txt, and check key-term coverage in the overview." },
    ],
    whenToUse:
      "Use the builder when the result will be read by someone with seconds to spare and the document is longer than a page. When the reader wants continuous prose rather than a brief structure, the {{text-summarizer|Text Summarizer}} is the plainer shape, and the {{key-points-extractor|Key Points Extractor}} suits a list of claims instead.\n\nFor notes from a meeting rather than a written document, the {{meeting-summary-formatter|Meeting Summary Formatter}} sorts sentences into decisions, actions and open questions before a brief is even possible.",
    faqs: [
      {
        q: "How is the bottom line chosen?",
        a: "It is rank 1: the highest combined score on the same published TextRank, frequency and position weighting the whole family uses. The score table shows the three parts, so the choice can be audited.",
      },
      {
        q: "What do the three brief lengths mean?",
        a: "Short selects about 20% of the sentences, Standard about 30% and Full about 40%, each rounded with a minimum of one sentence. The selected count is shown beside the control.",
      },
      {
        q: "Are the findings reordered into importance?",
        a: "No, and deliberately so. The bottom line is lifted out by rank, but the findings stay in document order so the brief reads as a continuous argument rather than as a scoreboard.",
      },
      {
        q: "What is key-term coverage telling me?",
        a: "It is the share of the top ten content terms' weight that the brief contains. A brief that scores low skipped a subject the document kept returning to, which is worth checking before you send it.",
      },
      {
        q: "Can I use this on a document I did not write?",
        a: "Yes, and the bottom line is a useful first check. But the brief selects sentences out of context, so any figure or quotation it lifts should be verified against the source before it travels further.",
      },
    ],
  },

  "bullet-point-extractor": {
    keywords: [
      "bullet point extractor",
      "one sentence per bullet",
      "leading connector",
      "existing list lines",
    ],
    intro:
      "The Bullet Point Extractor turns every sentence into one bullet, with an optional removal of a leading connector from its published list of 23 and a capital letter after it.",
    content:
      "Formatting prose as bullets is a layout job, and this bullet point extractor treats it as one: the rule is one sentence per bullet, and the only edit it can make is dropping a leading connector from its published list and capitalising what follows. Because the edit is that small, it is also reversible by hand: the change table gives you the source sentence for every bullet.\n\n- One sentence per bullet, with the source sentence kept beside the bullet in a change table.\n- Leading connector removal: 23 forms such as Additionally, However, Therefore, Moreover, First, Finally and That said, matched at the start of a sentence, comma included.\n- Existing list lines are preserved verbatim as their own items by default, so a half-formatted document does not lose the items it already had.\n- Two options: Preserve existing list lines and Drop a single trailing period — one final full stop only, never a question mark, exclamation mark or semicolon.\n- Export: Copy bullets, Copy report and Download bullet-points.txt.\n- The bullet count equals the sentence count of the prose; blank lines and existing list lines do not add bullets.\n\nThe engine splits the prose with the shared sentence tokeniser and treats Markdown-style list lines separately: a line that starts with a dash, a bullet character, or a number followed by a full stop or a closing bracket is kept as an item rather than re-split. Connector matching is a case-insensitive prefix test against the published list, and the matched text, comma included, is removed before the remainder is capitalised. The trailing-period option has a guard for the ellipsis: a sentence ending in two or more dots keeps them. The output is a plain Markdown list, which is why it can be pasted into most editors without cleanup. Existing list lines are detected per line before any sentence splitting, which keeps a numbered list intact instead of turning each number into prose.\n\n- It does not summarise: a forty-sentence passage produces forty bullets.\n- A connector outside the 23-item list is left in place, and the change table will not show it.\n- Bullets keep the sentence's own shape, including clauses that would read better split on a second pass.\n- The trailing-period option removes one mark and never touches ? ! or ; because those carry meaning.\n- List lines are preserved rather than parsed, so a nested list keeps its original markers only as text.\n- A preserved list line is kept as one item even when it contains several sentences, so it can be longer than the bullets around it.\n\nRead the change table before the bullets: it lists every source sentence, every bullet and every connector removed, so a removal you disagree with can be caught in a second. Then run the result through the Key Points Extractor if the order matters, or the Bullet to Prose Converter when the formatting job runs the other way. If a bullet needs a rewrite rather than a connector removal, that is a sentence to fix at source: this tool's contract is that it never rewrites.",
    howTo: [
      { step: "Paste paragraphs, and lists too if you have them, into the source panel." },
      { step: "Decide whether to preserve existing list lines and whether to drop a single trailing period." },
      { step: "Check the What changed, and why table for every connector that was removed." },
      { step: "Copy bullets or Download bullet-points.txt." },
    ],
    whenToUse:
      "Use the extractor when the text is already written and the deliverable is a list. When the list has to be short rather than complete, the {{text-summarizer|Text Summarizer}} selects by score instead, and the {{key-points-extractor|Key Points Extractor}} ranks the sentences it keeps.\n\nWhen the formatting job runs the other way and a list has to become a paragraph, the {{bullet-to-prose-converter|Bullet to Prose Converter}} joins the items without inventing connectives.",
    faqs: [
      {
        q: "Which connectors are removed?",
        a: "A published list of 23 forms, including Additionally, Also, However, Therefore, Thus, Moreover, Furthermore, Finally, First, Second and That said, each matched with its trailing comma at the start of a sentence.",
      },
      {
        q: "Are my existing bullet lines kept?",
        a: "Yes, verbatim, when Preserve existing list lines is on, which is the default. They are shown in their own panel and included in the copied output as their own items.",
      },
      {
        q: "Will it strip a question mark from a bullet?",
        a: "No. The trailing-period option removes a single final full stop only. Question marks, exclamation marks and semicolons are never touched because they change what the sentence is doing.",
      },
      {
        q: "Why did a bullet lose its capital letter?",
        a: "It should not have. The engine only changes capitalisation when it removes a connector, and then it capitalises the next word. If a bullet looks wrong, the change table shows the source sentence for comparison.",
      },
      {
        q: "Is the output Markdown?",
        a: "Yes, a plain list with a dash and a space before each item. Preserved list lines are rendered as ordinary items too, so the copied result is uniform even when the input was mixed.",
      },
    ],
  },

  "important-sentence-highlighter": {
    keywords: [
      "important sentence highlighter",
      "in place",
      "highlighted sentences",
      "top-ranked sentences",
    ],
    intro:
      "The Important Sentence Highlighter marks the top-ranked sentences where they already sit — top 3, 5, 8 or 12 — and lists the same selection, best first, beneath the text.",
    content:
      "Pulling sentences out of a draft loses the place they held, which is why this important sentence highlighter works in place: the top-ranked sentences are marked where they sit, with their rank, and the text itself is left exactly as written. Choose how many sentences to mark and the tool re-scores the document as you type, so the marks always describe the text on screen.\n\n- How many to highlight: Top 3, Top 5 (the default), Top 8 or Top 12 sentences.\n- In-place marking, with the rank shown for each highlighted sentence.\n- A ranked list of the highlighted sentences below the text, best first.\n- The segments are built so that joining every part in order reproduces the original text exactly.\n- The in-place view and the ranked list are two views of one selection, so a sentence cannot be marked in one and missing from the other.\n- Export: Copy highlighted sentences and Download important-sentences.txt.\n- The ranked list repeats the highlighted sentences with their scores, so a mark in the text and an entry in the list can be matched by rank.\n\nThe selection uses the shared sentence scoring — TextRank centrality at 0.55, term frequency at 0.35 and position at 0.10, normalised to the best sentence — and the highlight is drawn from the sentence offsets rather than from a copy of the text, so spacing and line breaks survive untouched. The count is clamped to the number of sentences, which is why choosing Top 12 over a five-sentence note simply marks all five. Because the page returns segments rather than a rendered block, nothing can be silently reflowed: the alternation of plain and marked runs is what you copy, already in place. The offsets come from the same sentence tokeniser the summariser uses, so the highlight and any extract always agree on where a sentence starts and ends. The count is clamped to the number of sentences, and the ranked list is sorted by score rather than position, so it doubles as a reading order for a second pass.\n\n- Highlighting shows ranking, not meaning: a marked sentence can be repetitive rather than pivotal.\n- The count is fixed at 3, 5, 8 or 12; there is no percentage mode on this tool.\n- A dense paragraph can have several adjacent sentences marked, which reads as a block rather than as emphasis.\n- Nothing is extracted, so if you want the sentences alone you have to copy the ranked list.\n- Sentence boundaries come from the shared splitter, so a misread abbreviation shifts the marks around it.\n- Highlights describe one version of the text: edit and paste the draft again and the scoring re-runs, because no highlighting state is saved.\n\nUse it as a reading aid before an edit, not after: the marks show which sentences the document leans on, and the ranked list underneath is the fastest way to check that the sentences carrying the piece are the ones you intended. A mark on a sentence you would keep anyway is confirmation; a mark on one you were about to cut is the ranking telling you what its removal would cost.",
    howTo: [
      { step: "Paste the text; the highlights update as you type." },
      { step: "Choose Top 3, Top 5, Top 8 or Top 12 sentences." },
      { step: "Read the marked sentences in place, using the rank to see the order of importance." },
      { step: "Copy highlighted sentences or Download important-sentences.txt." },
    ],
    whenToUse:
      "Use the highlighter when you are editing the text itself and need to see its load-bearing sentences where they sit. When you want those sentences separated out, the {{text-summarizer|Text Summarizer}} returns them as an extract, and the {{key-points-extractor|Key Points Extractor}} returns them as a ranked list.\n\nThe {{focus-sentence-highlighter|Focus Sentence Highlighter}} answers a different question — which sentence am I editing right now — and is a working aid rather than a ranking.",
    faqs: [
      {
        q: "Why does highlighting not change the text?",
        a: "Because the result is built from segments that reproduce the source exactly. Joining every plain and highlighted run in order gives back the original characters, spacing included, so nothing can be lost or reflowed.",
      },
      {
        q: "What do the ranks mean?",
        a: "Rank 1 is the highest combined score under the shared TextRank, frequency and position weighting. The number beside a highlight tells you where that sentence stood in the ranking, not how it reads.",
      },
      {
        q: "Can I highlight more than twelve sentences?",
        a: "Not on this tool. The choices are 3, 5, 8 and 12, and the count is clamped to the number of sentences available, so a short note simply marks all of its sentences.",
      },
      {
        q: "Why are several adjacent sentences sometimes all highlighted?",
        a: "Because a topic-rich stretch shares content words, which raises both term frequency and centrality for everything in it. A block of highlights is a signal that the passage is dense, not that every sentence in it is a keeper.",
      },
      {
        q: "Is this the same as the Focus Sentence Highlighter?",
        a: "No. The Focus Sentence Highlighter marks the sentence you are currently editing so your eyes stay on it. This tool ranks sentences by score and marks the highest-ranked ones, which is an editorial question rather than a working one.",
      },
    ],
  },

  "meeting-summary-formatter": {
    keywords: [
      "meeting summary formatter",
      "cue-phrase scan",
      "decisions, actions",
      "open questions",
    ],
    intro:
      "The Meeting Summary Formatter scans raw notes for documented cue phrases and sorts each sentence into decisions, actions or open questions, with owner and due suggestions flagged as patterns to confirm.",
    content:
      "Notes arrive as a blur of sentences, and this meeting summary formatter does not pretend to understand the meeting: it is a cue-phrase scan, and a sentence lands in a bucket because it carries a listed phrase, starts with an explicit label, or ends in a question mark. The three buckets are decisions, actions and open questions, and the counts are shown before the lists. Everything else is returned unclassified rather than guessed at, and the cue lists are printed on the page.\n\n- Explicit labels: Action:, Action item:, Next step:, Todo:, To do:, Decision:, Decided:, Resolution:, Question:, Open question: and TBD.\n- Action cues: 19 phrases such as will send, will follow up, needs to, assigned to, owner: and by end of week.\n- Decision cues: 12 phrases such as we decided, we agreed, approved, signed off, final call and agreed to.\n- Question cues: 6 phrases such as open question, to be determined and needs input, plus any sentence ending in a question mark.\n- Owner and due: suggestions from owner: X or X will patterns and by, due or before phrases, reported as patterns rather than facts.\n- Counts per category, the unclassified list, and Copy summary plus Download meeting-summary.txt.\n\nOne sentence lands in exactly one bucket, by a published priority: an explicit label first, then an action cue, then a decision cue, then a question cue or a question mark. That order is a choice — an action is the most useful thing to surface — and it is why a sentence that mentions both a decision and a task is filed as a task. Owner extraction is two small documented patterns, owner: followed by a capitalised name, and a capitalised name followed by will; the due pattern recognises phrases such as by Friday, due next week or an ISO date. Neither is extracted as a fact: both are shown as suggestions, and the page says so. The counts give the shape of the meeting before you read a line, and the three cue lists and the priority order are printed on the page so every filing decision can be traced to the phrase that made it.\n\n- It does not understand the meeting; a phrasing that is not on a cue list is unclassified.\n- Owner and due matches can be wrong, which is why they are labelled suggestions rather than fields.\n- A sentence carrying two kinds of cue is filed once, by the published priority order.\n- No dates are resolved or normalised, so by Friday stays a phrase to check against your calendar.\n- The cue lists are finite and published; a team's private shorthand is invisible to the scan.\n- A sentence with no cue but a clear meaning still ends up unclassified; the fix is one of the published labels, not a smarter guess.\n\nWork through the unclassified list before the sorted buckets: those are the lines the scan could not place, and they are where a decision that nobody phrased formally usually hides. Then confirm every owner and due suggestion against the original sentence before copying the summary into the minutes.",
    howTo: [
      { step: "Paste the raw notes; one idea per sentence works best." },
      { step: "Read the scan result counts and the three sorted lists." },
      { step: "Check every owner and due suggestion against the original sentence." },
      { step: "Work through the unclassified list, then Copy summary or Download meeting-summary.txt." },
    ],
    whenToUse:
      "Use the formatter when minutes have to be produced from notes and the decisions need to be visible. When the notes are prose rather than a list of outcomes, the {{text-summarizer|Text Summarizer}} extracts the load-bearing sentences instead, and the {{key-points-extractor|Key Points Extractor}} ranks them as points.\n\nOnce the decisions are sorted, the {{executive-summary-builder|Executive Summary Builder}} can turn an accompanying document into a bottom line and findings for the people who missed the meeting.",
    faqs: [
      {
        q: "Which cue wins when a sentence contains two?",
        a: "The published priority order: an explicit label first, then an action cue, then a decision cue, then a question cue or a trailing question mark. A sentence is filed once, so no duplicate appears in two buckets.",
      },
      {
        q: "How are owners and due dates found?",
        a: "Two documented patterns — owner: followed by a capitalised name, and a capitalised name followed by will — plus by, due or before phrases such as by Friday or an ISO date. They are suggestions, never extracted facts.",
      },
      {
        q: "What does unclassified mean?",
        a: "The sentence carried no listed cue and did not end in a question mark, so it was not guessed at. The unclassified list is deliberately kept and shown, because that is where informally phrased decisions tend to sit.",
      },
      {
        q: "Does it work on notes that are already bulleted?",
        a: "Yes. The notes are split into sentences first, so a bullet that contains one sentence becomes one item, and labels such as Action: are recognised wherever they start a sentence.",
      },
      {
        q: "Are the notes uploaded anywhere?",
        a: "No. The scan runs in the page, like every tool on this site, and the notes never leave the browser. Closing the tab clears them.",
      },
    ],
  },
};
