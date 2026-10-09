import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B1, session group: the timed-writing tools, the sentence-level reviewer
 * and the note formatter, plus editorial copy for the pre-existing distraction
 * free editor that this batch wired into the component map.
 *
 * Keys are registry slugs; see ../tool-seo.ts for the contract these entries are
 * validated against. The copy states plainly what is stored in the browser and
 * what is measured rather than estimated.
 */
export const B1_SESSIONS_SEO: Record<string, ToolSeo> = {
  "writing-sprint-timer": {
    keywords: [
      "writing sprint timer",
      "sprint pace",
      "words written this sprint",
      "sprint length",
    ],
    intro:
      "The Writing Sprint Timer runs a timed writing session with live word counts, a sprint pace in words per minute and a draft stored in this browser.",
    content:
      "A writing sprint is a clock and a count: choose a sprint length in minutes, start the timer and write until it stops. This writing sprint timer adds the figure that makes sprints comparable — sprint pace — by measuring words written this sprint against the elapsed time. The words in the document are counted alongside them, so a session that produced two hundred words in fifteen minutes and one that produced two hundred in eight are visibly different sessions.\n\nThe progress panel carries the countdown, a progress bar and four rows: words in the document, words written this sprint, the sprint pace in words per minute and the time elapsed. The session summary copies as plain text, which is how a week of sprints becomes a log you can keep. The draft box below counts words as you go and stores the text in this browser only, with a download control that turns the session's output into a file.\n\n- Sprint length in minutes, entered before the start.\n- Countdown with a progress bar and elapsed time.\n- Words in the document, counted with the shared Unicode tokenizer.\n- Words written this sprint, measured from the count at the moment the sprint began.\n- Sprint pace in words per minute, computed from the sprint's own word delta.\n- Copy session summary, a draft box stored in this browser, and Download draft.\n\nWord counting runs through the shared tokenizer, the same segmentation the counters in this domain use, so the pace figure agrees with the word count tool. The sprint delta is taken as the document count at start minus the count now, which means edits that delete words are visible as a lower pace rather than hidden. State is kept through the shared browser-storage hook, so the draft persists across reloads in this browser while never leaving it.\n\n- The pace counts net words: deleting while you sprint lowers the figure.\n- No account, no cloud and no sync; clearing site data loses the stored draft.\n- The timer runs against page state, so closing the tab ends the session rather than pausing it.\n- Pace assumes the whole elapsed window was writing — a break inside the sprint is counted as time.\n- The tool does not judge the words; a sprint that produced revisions rather than additions still records its delta. The draft box is there for the same reason: some sessions produce a paragraph worth keeping and a pace worth forgetting.\n\nSprints work best with a target rather than a duration alone: decide the sprint length by the section you intend to finish, then read the pace afterwards rather than during it. Watching the words-per-minute figure while writing works against the point of a sprint, because the number rewards speed over sense. The summary is for after the timer stops. A second read at the end of the week is more useful still: several pace figures side by side show whether a sprint length suits you or whether you routinely run past it.\n\nThe neighbours cover the adjacent sessions: the writing goal tracker measures a day rather than a sprint, and the distraction-free editor is the surface many writers sprint on without a clock. When the session ends and the count matters more than the pace, the word count tool reports the totals with the frequency table behind them.",
    howTo: [
      { step: "Enter a sprint length in minutes above zero to arm the timer, then start it." },
      { step: "Write in the draft box or your own editor; words are counted as you go." },
      { step: "Watch the progress panel for the countdown, words written this sprint and the sprint pace." },
      { step: "Copy the session summary when the timer stops, and download the draft if the session produced keepers." },
    ],
    whenToUse:
      "Use the writing sprint timer when a clock makes the writing happen. The {{writing-goal-tracker|Writing Goal Tracker}} measures a day's progress against a daily word goal instead of a single timed block, and the {{distraction-free-writing-editor|Distraction-Free Writing Editor}} gives the same counts with no timer attached. When the number you need afterwards is the document total rather than the pace, the {{word-count-tool|Word Count Tool}} reports words with a frequency table, and the reading time estimator converts them into minutes.",
    faqs: [
      {
        q: "How is sprint pace calculated?",
        a: "Words written this sprint divided by the elapsed time, expressed in words per minute. The sprint delta is the document's word count now minus its count when the sprint began, so deletions lower the pace honestly.",
      },
      {
        q: "Where is my sprint draft kept?",
        a: "In this browser only, through the shared local-storage hook. Nothing is uploaded, and clearing site data removes it — use Download draft when a session produces something worth keeping.",
      },
      {
        q: "What if I take a break during the sprint?",
        a: "The elapsed window keeps running, so the break is counted as time and the pace drops accordingly. The tool measures the session, not the attention inside it.",
      },
      {
        q: "Does it count words with the same rules as the Word Count Tool?",
        a: "Yes, both use the shared Unicode tokenizer, so hyphenated compounds, numbers and apostrophes are counted the same way on both pages.",
      },
      {
        q: "What happens when the timer reaches zero?",
        a: "The sprint finishes with a notice showing the words written and the duration, and you can keep writing or start a fresh sprint. The pace figure stays on the progress panel for comparison.",
      },
    ],
  },

  "writing-goal-tracker": {
    keywords: [
      "writing goal tracker",
      "daily word goal",
      "measured pace",
      "time to goal",
    ],
    intro:
      "The Writing Goal Tracker sets a daily word goal and reports words written, remaining words, the measured pace of this session and the time to goal at that pace.",
    content:
      "A daily goal is a number, and this writing goal tracker keeps the number in view: set the daily word goal, write in the box below, and the progress panel reports words written, what remains, the measured pace of this session and the time to goal at that pace. The last row is the honest one — it converts today's rate into a finish time, which is what turns a goal from a wish into a schedule.\n\nThe history panel lists previous days with their totals against the goal, each as a bar so a week's consistency reads at a glance. The draft box counts words as you go and autosaves locally through the shared storage hook, with a download control for anything worth keeping. Copy summary produces the session's figures as plain text, which is how a goal becomes a log rather than a dashboard you forget. A week of bars also answers the question a single day cannot — whether yesterday's shortfall was a one-off or the beginning of a pattern.\n\n- Daily word goal: the target the day is measured against.\n- Words written: counted from the text in the box with the shared tokenizer.\n- Remaining: the goal minus today's count, floored at zero.\n- Measured pace: this session's words per minute of writing time.\n- Time to goal: remaining words divided by that pace, shown as a duration.\n- History bars: previous days with their totals against the goal.\n- Copy summary and Download draft for the record.\n\nThe counts run through the same Unicode tokenizer the counters in this domain use, so hyphenated compounds and apostrophes are counted identically everywhere. The pace is measured from this session rather than assumed from a rate, and the time-to-goal projection is that pace applied to the remainder — which is why the projection moves the moment you type. State lives in this browser through the shared local-storage hook: the draft and the goal persist across reloads and never leave the machine.\n\n- Pace assumes the current session's rate continues, which writing rarely does.\n- A goal with a zero or tiny denominator makes time-to-goal meaningless, so the panel says so rather than guessing.\n- The history is local: another device or a cleared cache will not see it.\n- Words are counted net — deletions reduce today's total, because the goal tracks the text that exists.\n- No streaks, no reminders and no notifications; the tracker reports, it does not nag.\n\nThe useful moment is mid-afternoon: read the remaining figure and the time to goal, and decide whether the pace on offer is real. If the projection says two hours and you have forty minutes, the honest response is to lower the goal or raise the pace — both are decisions the numbers support rather than feelings to argue with. The projection is deliberately linear; life is not, and the panel would rather state a simple measured rate than model a schedule it cannot see.\n\nThe neighbours cover the adjacent units of measurement: the writing sprint timer measures a timed block rather than a day, the distraction-free editor gives the same counts with no target attached, and the word count tool reports the finished document with a frequency table behind the total.",
    howTo: [
      { step: "Enter a daily word goal above zero to arm the tracker." },
      { step: "Write in the draft box; words are counted as you go and the draft autosaves locally." },
      { step: "Read the progress panel for words written, remaining, measured pace and time to goal." },
      { step: "Copy the session summary or download the draft when the day is done." },
    ],
    whenToUse:
      "Use the writing goal tracker when the target is a day's total rather than a timed block. The {{writing-sprint-timer|Writing Sprint Timer}} measures a single sprint's words and pace, and the {{distraction-free-writing-editor|Distraction-Free Writing Editor}} provides the same surface with no target attached. When the goal's number is the whole document rather than today's share of it, the {{word-count-tool|Word Count Tool}} reports the total with its frequency table, and the reading time estimator converts the remainder into minutes.",
    faqs: [
      {
        q: "How is the measured pace calculated?",
        a: "From this session's words over this session's writing time, rather than a published rate. The time-to-goal row then applies that pace to the remaining words, so the projection moves as you type.",
      },
      {
        q: "Where is my goal and draft stored?",
        a: "In this browser, through the shared local-storage hook. Nothing is uploaded, the history is local, and clearing site data removes both the goal and the draft.",
      },
      {
        q: "Do deletions reduce today's count?",
        a: "Yes. The goal tracks the words that exist in the box now, so cuts lower the total honestly rather than hiding behind a high-water mark.",
      },
      {
        q: "Does it track streaks or send reminders?",
        a: "No. There are no streaks, reminders or notifications; the tracker reports the figures and the history bars, and the decision to write stays yours.",
      },
      {
        q: "Why is time to goal blank?",
        a: "The projection needs a pace, so an empty box or a goal already met leaves it unreported rather than guessed. Start writing, or lower the goal, and the row fills in.",
      },
    ],
  },

  "flash-fiction-timer": {
    keywords: [
      "flash fiction timer",
      "word limit",
      "time limit",
      "words remaining",
    ],
    intro:
      "The Flash Fiction Timer pairs a word limit with a time limit, counts the words remaining and holds your draft for the one sitting it took.",
    content:
      "Flash fiction is a constraint with a clock, and this flash fiction timer is both halves of it. Set a word limit and a time limit in minutes, start, and the live status reports words written, words remaining against the word limit, and how far over the limit you are once you pass it. The draft box below is the writing surface: one sitting, no edits, no looking back, with the count running as you type.\n\nThe challenge panel holds the two limits, and the live status panel carries the four figures — words written, words remaining, the word limit itself and over the limit — so the number that matters is always on screen. Copy status produces a plain-text line for the session, and Download draft takes the text with you when the timer stops. The count comes from the shared Unicode tokenizer, so words written here agrees with every other counter in this domain.\n\n- Word limit: the target the remaining figure is measured against.\n- Time limit in minutes: the clock counting down against the draft.\n- Words written: counted from the draft box with the shared tokenizer.\n- Words remaining: the limit minus the count, reported while it is still positive.\n- Over the limit: the excess once the count passes the target.\n- Copy status and Download draft for the session's record.\n\nThere is no trick behind the clock: elapsed time against the limit you set, and a word count that is a plain tokenization of the text in the box. Because the count is exact rather than estimated, the remaining figure can be trusted while you write, which is the only reason a word limit is useful mid-draft. The same is true of the time limit: an exact elapsed count against a number you chose is a different experience from a vague sense of running late. Everything runs in the page; the draft is text you can download at any point in the session.\n\n- The limit is a target, not a gate: the tool reports the excess rather than stopping you.\n- The clock measures elapsed time, so a pause inside the session counts against it.\n- No storage beyond the page: a reload loses the draft, so download anything worth keeping.\n- Word counts follow the Unicode rules, so hyphenated compounds count once.\n- No prompts and no structure: the timer constrains, it does not suggest.\n\nThe discipline flash fiction needs is subtraction, and the two numbers enforce it from opposite sides: words remaining tells you how little room is left, and the clock tells you how little time. The useful moment is the last third of the limit — cut the sentence that explains, keep the one that shows, and let the over-the-limit row be zero when the timer stops. Practically, that means deciding before the clock starts which sentences are load-bearing, because the last minutes are for cutting rather than adding.\n\nThe neighbouring tools cover the sessions around it: the writing sprint timer runs an open-length sprint with a pace figure, the writing goal tracker measures a day's total, and the writing prompt generator supplies the starting point when the page asks for one.\n",
    howTo: [
      { step: "Set a word limit and a time limit in minutes." },
      { step: "Start the clock and write in the draft box; words are counted as you go." },
      { step: "Watch the live status for words written, words remaining and any excess over the limit." },
      { step: "Copy the status line and download the draft when the timer stops." },
    ],
    whenToUse:
      "Use the flash fiction timer when the constraint is both words and minutes. The {{writing-sprint-timer|Writing Sprint Timer}} runs an open-length sprint with a pace figure instead, and the {{writing-goal-tracker|Writing Goal Tracker}} measures a day's total rather than one sitting. When the number you need afterwards is the document total, the {{word-count-tool|Word Count Tool}} reports words with a frequency table, and the {{writing-prompt-generator|Writing Prompt Generator}} supplies a starting point before the clock starts.",
    faqs: [
      {
        q: "What happens when I pass the word limit?",
        a: "The over-the-limit row reports the excess. Nothing stops you writing — the limit is a target with a visible overshoot, which is how flash writers usually want it.",
      },
      {
        q: "Does the clock pause?",
        a: "No. Elapsed time counts against the limit continuously once started, so a pause inside the session spends the same minutes a sentence does.",
      },
      {
        q: "Is my draft saved?",
        a: "The draft is text in the page for the session. Download draft before reloading, because nothing is stored beyond the box you are writing in.",
      },
      {
        q: "How are words counted?",
        a: "With the shared Unicode tokenizer used across this domain, so hyphenated compounds count once and numbers count as words. The remaining figure is therefore exact rather than estimated.",
      },
      {
        q: "Does it suggest prompts or structures?",
        a: "No. The timer constrains and counts; it does not suggest. For a starting point, the writing prompt generator cycles an authored bank across five categories.",
      },
    ],
  },

  "focus-sentence-highlighter": {
    keywords: [
      "focus sentence highlighter",
      "sentence number",
      "reading time",
      "longest word",
    ],
    intro:
      "The Focus Sentence Highlighter lets you click the sentence you are editing, dims the rest, and reports that sentence's own counts.",
    content:
      "Editing one sentence while a paragraph surrounds it is the everyday problem of revision, and the focus sentence highlighter solves it with a click: paste a paragraph, click the sentence you want to work on, and it comes forward while the rest dims. The dim control turns the contrast on or off, and the copy control takes the sentence out on its own — which is how a sentence gets worked on in a scratch buffer without losing its place in the paragraph.\n\nThe selected sentence gets its own panel: sentence number in the text, words, characters, longest word in characters and reading time at the default rate. The list below shows every sentence with its own counts, so the neighbours of the selected one are visible at the same time — a 58-word sentence between two 12-word sentences announces itself in the list before it announces itself in the prose. Because the selection and the list come from the same tokenizer, the neighbours are measured exactly like the sentence you picked. Selection is by click, and the panels follow it immediately.\n\n- Click-to-select: choose the sentence you are editing from the rendered paragraph.\n- Dim the other sentences: contrast that keeps the selected sentence foregrounded.\n- Sentence panel: sentence number, words, characters, longest word and reading time.\n- Reading time: the shared 220 words-per-minute default, formatted as minutes and seconds.\n- All sentences: every sentence with its counts, for the neighbours.\n- Copy this sentence: the selected sentence alone, ready for a scratch edit.\n\nSentences and words come from the shared Unicode tokenizer, so the sentence boundaries and counts are identical to the sentence count tool and the word count tool — clicking a sentence here selects exactly what the list there reports. Reading time reuses the shared duration formatter with the default rate, so the figure agrees with the reading time estimator. Nothing is uploaded: the paragraph, the selection and the copy all happen in the page. The panel doubles as a quick reading aid too: click the longest sentence in a paragraph and its reading time tells you which one is slowing the reader down.\n\n- Abbreviations followed by a full stop split sentences, so the selected sentence may be shorter than a reader sees.\n- The selection is index-based, so editing above it moves the highlight to a different sentence.\n- Very long paragraphs render fine, but the all-sentences list grows with them.\n- The tool highlights; it does not rewrite, grade or score the sentence.\n- Reading time assumes continuous reading at the default rate and models no pauses.\n\nThe workflow is click, copy, fix, paste: select the sentence, copy it to a scratch buffer, work on it where nothing else is visible, then paste it back. The counts beside the selection are the sanity checks — if the sentence you are cutting is twice the median in the all-sentences list, the cut is doing measurable work rather than feeling like it.\n\nThe sentence neighbours divide the labour: the sentence count tool lists every sentence with its word count for the whole document, the sentence complexity analyzer estimates clause load for the same units, and the word count tool reports the paragraph-level totals the selection sits inside.",
    howTo: [
      { step: "Paste a paragraph into the input panel." },
      { step: "Click the sentence you want to work on; it comes forward while the rest dims." },
      { step: "Read the sentence panel for number, words, characters, longest word and reading time." },
      { step: "Copy this sentence to a scratch buffer, fix it, and paste it back into the paragraph." },
    ],
    whenToUse:
      "Use the focus sentence highlighter when the unit of work is one sentence inside a paragraph. The {{sentence-count-tool|Sentence Count Tool}} lists every sentence with its word count across the whole document, and the {{sentence-complexity-analyzer|Sentence Complexity Analyzer}} estimates clause load for the same units. For the totals the sentence sits inside, the {{word-count-tool|Word Count Tool}} reports words with the frequency table, and the reading time estimator converts the same count into minutes.",
    faqs: [
      {
        q: "How do I select a sentence?",
        a: "Click it in the rendered paragraph. It comes forward while the others dim, and the sentence panel updates to its number, words, characters, longest word and reading time.",
      },
      {
        q: "Why did my selection move when I edited an earlier sentence?",
        a: "Selection is index-based, so a change above it shifts the highlight by one. Click the intended sentence again after edits above it.",
      },
      {
        q: "Are the counts the same as the Sentence Count Tool?",
        a: "Yes. Both use the shared Unicode tokenizer for sentence boundaries and words, so the sentence selected here is the same unit the list there reports.",
      },
      {
        q: "Does it split sentences at abbreviations?",
        a: "It uses the same Unicode sentence-boundary rule as the rest of this domain, so a period after an abbreviation followed by a capital starts a new segment. The rule is stated rather than hidden.",
      },
      {
        q: "Can the tool suggest a rewrite?",
        a: "No. It highlights and counts; rewriting belongs to the sentence-level tools elsewhere in this domain. The copy control exists so you can work on the sentence wherever you like.",
      },
    ],
  },

  "footnote-formatter": {
    keywords: [
      "footnote formatter",
      "marker style",
      "renumbering",
      "matched notes",
    ],
    intro:
      "The Footnote Formatter detects which marker style your body text uses, matches markers to notes in order of first appearance, renumbers them sequentially and reports the structural problems it finds.",
    content:
      "Footnotes break down in two ways: a marker with no note, or a note that no marker ever reaches. This footnote formatter finds both by treating the body text and the notes as two separate inputs, matching markers to notes in order of first appearance and renumbering so the exported list is always sequential. Both inputs are plain text and the whole analysis runs locally, so nothing is uploaded and nothing is inferred beyond the documented marker patterns.\n\n- Marker styles: square brackets, caret, parentheses or symbols, detected automatically with the count it found, or chosen by hand.\n- Numbering: 1, 2, 3; a, b, c; i, ii, iii; or the symbol sequence *, †, ‡.\n- Marker format in the body: superscript, square brackets, Markdown, caret or parentheses.\n- Notes list format: Markdown list, HTML ordered list or plain text list.\n- Result figures: markers in the body, matched notes, notes provided and the marker style used, plus the pair list and any notes never referenced.\n- Copy body + notes, or download the formatted result.\n\nThe analysis is structural and says so. Each marker style is counted in the body so the tool can name the one you actually used, and detection is a count rather than a guess. Markers are then paired with notes in order of first appearance; a marker with no note, a note never referenced, and a marker used more than once are reported as the real problems they are. When the body has more markers than notes, the pairing stops at the shorter list and the analysis says so rather than inventing a note. Renumbering rewrites the markers in place, including letter sequences that run past z in spreadsheet-column style and symbol sequences, and the notes list is rendered in the format you chose for pasting into a manuscript or a web page. Because pairing follows first appearance rather than the numbers themselves, a note list whose numbers are stale but whose order is intact still pairs correctly, and the renumbering repairs the numbers afterwards.\n\n- No meaning is read: a note attached to the wrong claim still matches perfectly.\n- When the counts differ, pairing stops at the shorter list and the analysis reports it.\n- Symbol numbering keeps its own sequence, because symbols cannot be renumbered as digits.\n- The tool formats markers and notes; it does not write, fetch or edit the note content.\n- Only the four documented marker styles are detected; anything else is left alone and said to be undetected.\n- Detection is a count, not a judgement: a body that mixes two styles is reported with the dominant one, and the other is still counted among the unmatched text.\n\nRun it before a submission, when the notes have been through several edits: the report will tell you which note lost its marker and which marker lost its note, and renumbering makes the exported list safe to paste without leaving a gap in the sequence. If the report shows a note never referenced, the note is either an orphan or its marker was lost in an edit; both are worth resolving before a deadline rather than during one.",
    howTo: [
      { step: "Paste the body text with its inline markers and the notes, one per line." },
      { step: "Confirm the detected marker style, or choose one of the four by hand." },
      { step: "Choose the numbering and the marker and notes-list formats." },
      { step: "Read the matched pairs and any structural problems, then Copy body + notes or download." },
    ],
    whenToUse:
      "Use the formatter when the notes already exist and the numbering has broken. When the notes are citations that need a style, the {{endnote-manager|Endnote Manager}} numbers them in the order you arrange them, and the {{citation-formatter|Citation Formatter}} produces the individual entries in APA 7, MLA 9, Chicago 17 or Bluebook 21.\n\nIf the list is a bibliography rather than notes, the {{reference-list-generator|Reference List Generator}} pairs each entry with the in-text marker that points at it.",
    faqs: [
      {
        q: "How does the tool decide which marker style I used?",
        a: "It counts occurrences of each documented style in the body and names the one with the most matches. You can override the detection and choose a style by hand if the count picked the wrong one.",
      },
      {
        q: "What happens when the body has more markers than notes?",
        a: "The pairing stops at the shorter list and the analysis says so. Nothing is invented to fill the gap, and the mismatch is reported as the structural problem it is.",
      },
      {
        q: "Can it renumber notes that use symbols?",
        a: "It can reformat symbol markers, but symbol numbering keeps its own sequence rather than becoming 1, 2, 3, because symbols cannot be renumbered as digits. Numeric, alphabetic and Roman numbering all renumber.",
      },
      {
        q: "Are the notes themselves edited?",
        a: "No. The tool parses markers, matches them to notes, renumbers the markers and renders the list. The note text is reproduced exactly as you pasted it.",
      },
      {
        q: "Which formats can the notes list be exported in?",
        a: "A Markdown list, an HTML ordered list or a plain text list, chosen from the Notes list format control. The body markers can separately be rendered as superscript, square brackets, Markdown, caret or parentheses.",
      },
    ],
  },

  "distraction-free-writing-editor": {
    keywords: [
      "distraction-free writing",
      "focus mode",
      "autosave",
      "reading time",
    ],
    intro:
      "The Distraction-Free Writing Editor is a plain writing surface with a focus mode, live counts and a local autosave that keeps the draft in your browser.",
    content:
      "Distraction-free writing is a subtraction: this editor gives you a text box, a word count and nothing else until you ask for it. Focus mode hides the surrounding controls so the page becomes just you and the words, and the exit control is always reachable when you want the counts back. The text is yours throughout — there is no formatting to reach for, no toolbar to browse and no account to sign into.\n\nThe panel reports words, characters, sentences and reading time as you type, each computed from the text in the box rather than estimated from a document model. Reading time uses the same two hundred and twenty words per minute default the Reading Time Estimator uses, so the figure agrees with that tool rather than contradicting it. The status line reads autosaved locally: the autosave is debounced at three hundred milliseconds after your last keystroke, so a long session does not rewrite storage on every character.\n\n- Counts: words, characters, sentences and reading time, updated as you type.\n- Focus mode: hides the chrome so the page is only the writing surface, with an always-visible exit.\n- Local autosave: the text is written to browser storage three hundred milliseconds after typing stops.\n- Restore on return: reopening the page loads the last autosaved text instead of an empty box.\n- Download: takes the plain text out as a file whenever the session needs to become a document.\n\nEverything runs in the page. The autosave uses the browser's local storage through a shared storage hook, which is the same mechanism the other writing surfaces here use, and the text is never sent anywhere. Because the surface is a plain text area, there is no rich formatting to corrupt, no half-applied markup and no version history to manage — what you type is exactly what the counts and the download see. Pasted text keeps its characters and loses nothing but the formatting it arrived with.\n\n- No storage beyond this browser: clearing site data or another device will not see the draft.\n- The word count splits on whitespace, so a hyphenated compound counts as two parts where the Unicode tokenizer would count one.\n- Reading time is a fixed-rate estimate at 220 words per minute and does not model pauses.\n- No collaboration, no comments and no track changes: the tool is deliberately single-writer.\n- Focus mode changes the view only; it does not lock the page or protect the text from anyone using the machine.\n\nThe workflow that suits this surface is a first draft: open it, enter focus mode, write until the counts say the piece is long enough, then exit and read. When the draft needs structure, move it to the outline builder or the markdown editor; when it needs a count with a frequency table, the word count tool reads the same text. The point of the tool is that the move out of it is always a copy or a download, because the text never belonged to the page in the first place.\n\nUse distraction-free writing when the problem is attention rather than features: a morning's freewrite, a section that keeps stalling, or a session where every toolbar invitation costs you momentum. The adjacent tools in this domain cover what happens next — structuring, counting and formatting — without asking this page to become them.",
    howTo: [
      { step: "Open the editor and start typing, or paste an existing draft into the text box." },
      { step: "Read the counts panel for words, characters, sentences and reading time as you write." },
      { step: "Enter focus mode to hide the chrome while drafting, and exit it whenever you want the counts back." },
      { step: "Download the draft as a text file when the session is done; the text autosaves locally in the meantime." },
    ],
    whenToUse:
      "Use distraction-free writing when you need a blank surface and a count, not a feature set. The {{writing-goal-tracker|Writing Goal Tracker}} adds a daily target against the same words-as-you-go counting, and the {{writing-sprint-timer|Writing Sprint Timer}} puts a clock and a pace next to them. When the draft is ready for structure or formatting, the {{markdown-editor|Markdown Editor}} gives it headings and an outline, and the focus sentence highlighter in this domain takes over once you are editing sentence by sentence.",
    faqs: [
      {
        q: "Where is my draft saved?",
        a: "In this browser only. The text autosaves to local storage three hundred milliseconds after you stop typing, and nothing is sent to a server. Clearing site data removes it, so download a file when a draft matters.",
      },
      {
        q: "What does focus mode do?",
        a: "It hides the surrounding controls so the page shows only the writing surface and an exit control. It changes the view, not the text — counts and autosave keep running while focus mode is on.",
      },
      {
        q: "How is reading time calculated?",
        a: "Words divided by two hundred and twenty words per minute, the default silent-reading rate used across this domain. It is a fixed estimate and does not model pauses, headings or figures.",
      },
      {
        q: "Why does my word count differ from the Word Count Tool?",
        a: "This surface splits on whitespace, so a hyphenated compound counts as two parts, while the Word Count Tool uses Unicode word boundaries that count it once. For figures you will quote, use the word count tool.",
      },
      {
        q: "Does it support bold, italics or headings?",
        a: "No. The surface is a plain text area on purpose, so nothing you type is interpreted as markup. When you need formatting, move the text to the Markdown Editor or the Rich Text Editor.",
      },
    ],
  },
};
