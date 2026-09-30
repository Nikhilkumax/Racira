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
    keywords: ["writing sprint timer", "writing sprint", "pomodoro for writers"],
    intro:
      "Time a focused writing sprint with a live countdown, a measured words-this-sprint figure and a real pace, while your draft autosaves in this browser only.",
    content: `A writing sprint timer does one simple thing well: it removes the two questions that stall a session, how long have I been going and how much have I actually written. Set a length, start the clock, and write in the box on the page. The countdown, the word count and the pace update while you type, and nothing is uploaded anywhere.\\n\\nThe length field defaults to twenty-five minutes, the interval most people know from the pomodoro technique, but any length above zero works. Short sprints of ten minutes suit a difficult paragraph; longer blocks suit drafting in flow. Pausing stops the clock and keeps the elapsed time, so an interruption does not cost you the session. Resuming continues from where it stopped, and Reset clears the clock and the starting word count.\\n\\nThe part worth trusting is how progress is measured. When you first start a sprint, the tool records how many words the draft contained at that moment and counts from there. Words written this sprint is therefore the difference between the current count and that snapshot, not a guess about your typing speed. The pace figure divides those words by the elapsed running time, and it appears only after a few seconds of running so that it is not distorted by the very first keystrokes. Pause time is excluded, because elapsed time is accumulated rather than read from the wall clock.\\n\\nWord counting uses the same Unicode-aware tokenizer as the rest of the site, so hyphenated compounds count once, apostrophes stay inside words and standalone emoji are not counted as words. If your draft contains a table, a code block or a list, those are counted the same way a word processor counts them.\\n\\nThe draft lives in this browser. It is saved to local storage shortly after you stop typing, which means a refresh, a crash or an accidental tab close does not lose it, and it also means the text never leaves your machine. A label on the panel says so. When you want the text outside the browser, the download button writes it to a plain text file, and the copy button produces a short session summary with the sprint length, elapsed time, words in the document, words this sprint and the measured pace — the numbers a writing log wants.\\n\\nTwo honest limits are worth knowing. The timer runs in the page, so closing the tab stops it, and elapsed time will be shorter than wall-clock time if the browser suspends the tab in the background. And the word count is a count, not a judgement: hits per session say nothing about whether the sentences are worth keeping, which is what the second and third drafts are for.\n\nThe default length is the pomodoro interval, which is why this tool is often described as a pomodoro for writers: roughly twenty-five minutes of writing followed by a short break, repeated through the day. Because the clock and the count are both visible, a session ends with a number you can log rather than a vague sense of having worked. Keeping a simple record of sprints per day and words per sprint says far more about a week's progress than any single draft's total does.`,
    howTo: [
      { step: "Set the sprint length in minutes. Twenty-five is the default starting point." },
      { step: "Press Start sprint. The tool records the current word count as the baseline for this session." },
      { step: "Write in the draft box. The countdown, word count and pace update as you type." },
      { step: "Pause if you are interrupted; resuming continues from the same elapsed time." },
      { step: "Copy the session summary into a writing log, or download the draft as a text file." },
    ],
    whenToUse: `Reach for it at the start of a drafting session when the goal is to produce words rather than to polish them. The {{writing-goal-tracker|Writing Goal Tracker}} answers the other question — how far through a daily target you are — and keeps a short history of recent days.\\n\\nFor a timed constraint with a word ceiling as well as a clock, the {{flash-fiction-timer|Flash Fiction Timer}} adds the word limit to the countdown and warns as soon as you pass it.`,
    faqs: [
      {
        q: "Does the word count include what I had already written?",
        a: "No. Starting a sprint takes a snapshot of the draft's word count, and words written this sprint is the increase since then. The total word count is shown separately.",
      },
      {
        q: "Does the timer keep running if I close the tab?",
        a: "No. The clock lives in the page, so closing the tab ends the session. Your draft is still saved in the browser and reappears when you return.",
      },
      {
        q: "Why does the pace show a dash when I start?",
        a: "Pace is measured, not assumed, so it stays blank for the first few seconds of running time to avoid dividing a handful of words by almost no time.",
      },
      {
        q: "Where is my draft stored?",
        a: "In this browser's local storage only. There is no account and no upload. Downloading the draft is how you keep it outside the browser.",
      },
      {
        q: "Can I change the sprint length mid-session?",
        a: "Yes. The remaining time is recalculated from the new length; if you shorten it below the time already elapsed, the sprint reads as finished.",
      },
    ],
  },

  "writing-goal-tracker": {
    keywords: ["writing goal tracker", "daily word goal", "word count goal"],
    intro:
      "Set a daily word goal, watch a measured pace and a projected finish time, and keep a short local history of the last two weeks — all stored in this browser, never uploaded.",
    content: `A daily word goal is the most effective target most writers use, and the hardest to keep honest without a number to look at. The Writing Goal Tracker shows words written against the target, the remaining count, your measured pace and a projected finish time, and it records how the last fortnight went. It is a writing goal tracker, not a coach: it reports what happened and leaves the judgement to you.\\n\\nThe pace figure is measured rather than assumed. The tool notes when your session began — the first time the draft box has content in it — and divides the words in the draft by the minutes since then. That means a pace of six hundred words an hour is a statement about this session, not a generic average from a writing advice article. The projected finish time is the remaining words divided by that same pace, so a slow start or a break moves it honestly. There is a button to restart the pace measurement if you want to begin a fresh session without clearing the draft.\\n\\nProgress is shown three ways: a headline count with the percentage of the goal, a progress bar, and the remaining word count. When the count passes the target, a notice confirms the goal for the day rather than simply stopping. The results box also states the goal itself, so a screenshot or a copied summary always carries the target it was measured against.\\n\\nThe history strip records the highest word count the draft reached on each local calendar day, and shows the last seven. Because the day boundary is taken from your own clock, the entry rolls over at local midnight rather than at a server's idea of midnight, and the stored history is capped at fourteen days. Two limits are stated rather than hidden: the figure is the count in this browser's draft box, so writing elsewhere is not included, and clearing your browser's site data removes the history along with the draft.\\n\\nEverything is local. The draft autosaves a moment after you stop typing, the goal and the history are kept in the same browser storage, and there is no account, no sync and no upload. Word counting uses the site's Unicode-aware tokenizer, so hyphenated compounds, apostrophes and punctuation behave the way a word processor would treat them. Download gives you the draft as a plain text file, and the copy button produces a summary with the goal, the count, the percentage, the remainder and the measured pace.\\n\\nThe honest caveat is the important one: a word count goal measures output, and output is a leading indicator of progress rather than progress itself. Use it to make writing happen daily, not to decide whether a chapter is finished.\n\nA few small habits make the tracker worth returning to. Decide the goal before the session rather than after it, write in the box rather than in another window, and let the history accumulate instead of resetting it; a fortnight of entries shows which days of the week actually produce words and which are habitually lost. Because everything stays in this browser, the record is a private log rather than a public streak, and nobody has to see a bad Tuesday.`,
    howTo: [
      { step: "Enter a realistic daily goal, in words. Five hundred is a fair starting point for a first session." },
      { step: "Write in the draft box below. Every count on the page updates as you type." },
      { step: "Watch the remaining figure and the projected finish time, which are based on your measured pace." },
      { step: "Use the restart button when you return after a long break so the pace reflects the new session." },
      { step: "Copy the summary or download the draft; the history updates automatically as the day's count grows." },
    ],
    whenToUse: `Use it for a sustained project — a novel, a thesis, a daily publishing habit — where the target is a number of words per day. The {{writing-sprint-timer|Writing Sprint Timer}} fits the opposite situation: a single focused block where the clock, not the daily total, is the constraint.\\n\\nWhen you want the count to match what a publisher or a submission form expects, the {{word-count-tool|Word Count Tool}} reports the same number with sentences, paragraphs and reading time beside it.`,
    faqs: [
      {
        q: "Where is my history kept?",
        a: "In this browser's local storage, capped at the last fourteen days. Nothing is sent anywhere, and clearing site data removes it.",
      },
      {
        q: "Why does the pace start blank?",
        a: "The pace is measured from the moment your session started, so it needs a little elapsed time before a rate is meaningful. The restart button resets that measurement deliberately.",
      },
      {
        q: "Does the goal reset at midnight?",
        a: "Progress is tracked against the day, and history entries are keyed to your local calendar date, so a new day begins with the current draft count as that day's starting point.",
      },
      {
        q: "Can I use it to track a book-length project?",
        a: "The history keeps fourteen days, which suits a daily habit rather than a year-long chart. Copy the summaries into a spreadsheet if you want a full project record.",
      },
      {
        q: "What counts as a word here?",
        a: "The same segments the site's Unicode-aware tokenizer counts everywhere: numbers count, hyphenated compounds count once, and apostrophes stay inside the word.",
      },
    ],
  },

  "flash-fiction-timer": {
    keywords: ["flash fiction timer", "flash fiction", "word limit timer"],
    intro:
      "Write to two constraints at once — a word ceiling and a time limit — with a live countdown, a remaining-words figure and an immediate warning if you go past the limit.",
    content: `Flash fiction is defined by its shortness, which makes it the one form where a word count and a clock belong together. The Flash Fiction Timer gives you both: a word limit and a time limit, a countdown, words remaining, and a warning the moment the draft passes the ceiling. It is a constraint tool rather than a judge — it will tell you that you are three words over, not whether the three words were earned.\\n\\nSet the limit for the market you are writing to. A hundred words is the classic drabble. Two hundred and fifty words covers many online flash outlets, and five hundred words is the upper end that most anthologies still call flash. The default combination in the tool is a hundred words in five minutes, which is a demanding but survivable start; adjust one field and the other keeps its value.\\n\\nThe timer behaves like the sprint timer: start, pause, resume and reset, with elapsed time accumulated so pausing genuinely stops the clock. The status panel shows the countdown, a progress bar, the words written, the words remaining and whether you are over the limit. If the time runs out while you are still inside the limit, the notice says exactly how many of the allowed words you used. If you cross the word ceiling first, the over-limit warning appears with the number of words to trim, which is more useful than a red border.\\n\\nThe draft box is where the piece is written, and it saves to this browser shortly after you stop typing. That means an interruption does not cost you the piece, and it also means the text never leaves your machine. A label on the panel states that plainly. Download writes the draft to a plain text file for pasting into an editor, and the copy button produces a status summary with the limits, the words written, the words remaining and the time left.\\n\\nWord counting follows the site's Unicode tokenizer, the same rule the word count tool uses, so the number this tool shows is the number a submission form will show. Two caveats are stated on the page rather than buried: the count includes any notes or headings you paste into the box, and the timer runs in the page, so a suspended tab is not counted as writing time.\\n\\nWhat the tool will not do is tell you whether the story works. A hundred words in five minutes is a writing exercise, and the editing pass that follows is where the piece is actually made. Use the countdown to force a draft into existence, then read it aloud before trimming a single word.\n\nA word limit timer is a useful exercise tool well beyond competitions. Set a hundred words and one minute less than you think you need, and the constraint forces a complete thought instead of a fragment. Writers who feel blocked often find a ceiling easier to work with than a blank page, because the piece has a shape before the first sentence exists. The tool supplies the shape and the clock; what the hundred words actually say stays your decision.`,
    howTo: [
      { step: "Set a word limit and a time limit. A hundred words in five minutes is the default." },
      { step: "Press Start challenge; the countdown begins and the words remaining figure appears." },
      { step: "Write straight into the draft box without editing as you go." },
      { step: "Watch the status panel: the over-limit warning tells you how many words to trim if you pass the ceiling." },
      { step: "Copy the status summary or download the draft when the piece is done." },
    ],
    whenToUse: `Use it when a market, a contest or a writing exercise gives you both a ceiling and a window, and you want to see both constraints at once while you draft. The {{writing-sprint-timer|Writing Sprint Timer}} is the better fit when only the clock matters and the word target is open-ended.\\n\\nOnce the draft exists, the {{word-count-tool|Word Count Tool}} confirms the final count and shows sentences, paragraphs and reading time alongside it, which is what most submissions actually ask for.`,
    faqs: [
      {
        q: "How short is flash fiction?",
        a: "The most common ceilings are a hundred words, two hundred and fifty, and a thousand, with five hundred a frequent upper bound. The tool defaults to a hundred and lets you set any limit the market specifies.",
      },
      {
        q: "Does the timer stop when I reach the word limit?",
        a: "No, the clock keeps running. Passing the ceiling raises a warning that says how many words to trim rather than ending the session, because trimming is an editing decision.",
      },
      {
        q: "What happens if the time runs out first?",
        a: "The status panel reports that time is up and how many of the allowed words you used, so you can see whether the constraint that caught you was the clock or the ceiling.",
      },
      {
        q: "Is my flash fiction draft saved?",
        a: "It is saved in this browser a moment after you stop typing. There is no upload and no account, and downloading the draft is how you preserve it outside the browser.",
      },
      {
        q: "Should I write and edit in the same session?",
        a: "The countdown rewards drafting without second-guessing. Most writers use the timed pass to get a complete draft and the untimed pass afterwards to cut it.",
      },
    ],
  },

  "focus-sentence-highlighter": {
    keywords: ["focus sentence highlighter", "sentence highlighter", "edit sentence by sentence"],
    intro:
      "Isolate one sentence at a time from a long passage, with its own word, character and reading-time figures, so you can edit sentence by sentence without losing the surrounding context.",
    content: `Most editing problems are sentence-sized, but a long document makes them hard to see. The Focus Sentence Highlighter lifts one sentence out of the text at a time, shows it in a highlighted block with its own measurements, and keeps the whole passage below so you never lose the thread. It is a sentence highlighter for revision, not a grade: it reports length and reading time and leaves the rewriting to you.\\n\\nThe list is built with the same sentence tokenizer the counting tools use, which follows Unicode sentence boundaries. Each entry can be clicked, and Previous and Next step through the passage in order. The focused sentence appears with its word count, character count, the length of its longest word and an estimated reading time at two hundred and twenty words per minute. Those figures are the ones that make a weak sentence obvious: a sentence of forty-five words with three long words is not the same shape as one of twelve, and seeing the count makes the difference concrete.\\n\\nThe optional dimming switch fades every sentence except the current one. With it on, the passage reads like a set of highlights and the structure of the paragraph becomes visible — which sentences carry the argument, which ones repeat it, and where the rhythm is uniform. With it off, the full passage stays at normal weight and you can judge the flow around the sentence you are editing.\\n\\nOne long-standing caveat of the tokenizer applies and is stated rather than hidden: abbreviations followed by a period can be segmented as their own sentence, so a sentence beginning with a title is sometimes split in two. The same rule is documented on the Sentence Count Tool, exactly as it behaves here, because accurate reporting beats a quietly patched-up count.\\n\\nThe focused sentence can be copied in one click, which is the fastest way to move it into an editor, a comment on a colleague's draft, or a list of lines to rewrite. The tool deliberately does not offer editing inside the page: there is no rich text, no saved revision and no document model. It is a reading and diagnosis surface, and the copy button is the bridge to wherever you actually work.\\n\\nNothing is stored or sent. Pasting a client document, a manuscript or an exam answer carries no upload risk, because the segmentation and the counts happen in the page and are discarded when you close the tab.\n\nThe habit that makes the measurements pay off is to edit sentence by sentence after one full read. Read the passage at normal weight first, then work through the list with dimming on, copying each sentence out and rewriting it before moving on. Long sentences announce themselves, repeated openings become obvious when they appear one after another, and a sentence that has to be read twice usually has a figure that explains why. When the pass is finished, turn dimming off and read the paragraph again as a whole, because rhythm belongs to the sequence rather than to any single line.`,
    howTo: [
      { step: "Paste a paragraph or an entire passage into the box." },
      { step: "Read the focused sentence and its word, character and reading-time figures." },
      { step: "Use Previous and Next, or click any sentence in the list, to move through the passage." },
      { step: "Toggle dimming to see the paragraph's shape without the distraction of the surrounding lines." },
      { step: "Copy the sentence you want to rewrite and edit it in your own editor." },
    ],
    whenToUse: `Use it during a revision pass on a paragraph you already know is cluttered, or when a passage reads heavily but no single sentence looks wrong. The {{sentence-count-tool|Sentence Count Tool}} gives the whole-document view of the same segmentation when you want to know how long sentences average out overall.\\n\\nIf the target is your own drafting pace rather than revision, the {{writing-sprint-timer|Writing Sprint Timer}} turns the same word counter into a clock for getting new sentences onto the page.`,
    faqs: [
      {
        q: "Why is an abbreviation counted as its own sentence?",
        a: "The tokenizer follows Unicode sentence boundaries, which treat a period after an abbreviation as a boundary. The rule is stated here and behaves identically in the sentence count tool.",
      },
      {
        q: "How is the per-sentence reading time calculated?",
        a: "Words in the focused sentence divided by two hundred and twenty words per minute, the same default the reading time estimator uses. It is an estimate for that sentence alone, not for the passage.",
      },
      {
        q: "Does the tool save my text?",
        a: "No. The passage is analysed in the page and never stored; closing the tab clears it. The copy button is the only way text leaves the tool.",
      },
      {
        q: "Can I edit inside the highlighter?",
        a: "No, by design. It is a diagnosis view with no document model, so copy the sentence into your own editor to change it.",
      },
      {
        q: "What does the dimming option change?",
        a: "Only the appearance. With dimming on, all sentences except the focused one are faded so the paragraph's shape stands out; with it off, everything stays at full weight.",
      },
    ],
  },

  "footnote-formatter": {
    keywords: ["footnote formatter", "footnote numbering", "format footnotes"],
    intro:
      "Match inline markers to a list of notes, renumber both consistently, convert between bracket, caret, parenthesis, superscript and Markdown forms, and export the result as Markdown, HTML or plain text.",
    content: `Notes accumulate messily. A draft uses square brackets in one chapter and superscripts in another, a note is added without a marker, a marker is left behind after its note was cut, and the numbering stops matching somewhere in the middle. The Footnote Formatter reads the body text and the note list together, matches markers to notes in order of first appearance, renumbers both so they agree, and reports every mismatch it found instead of quietly fixing it.\\n\\nDetection is automatic by default. The tool identifies which marker style the body uses — square brackets, carets, parentheses or symbol marks such as an asterisk or dagger — and shows which one it found in the style menu, so you can confirm it before trusting the result. If a document mixes styles, or you are converting deliberately, you can select the style by hand and the analysis follows your choice.\\n\\nFootnote numbering is separate from marker style, which is what makes the tool useful for formats that care. The numeric style gives 1, 2, 3. The alpha style gives a, b, c and continues past z to aa, the way a spreadsheet column does. The roman style gives lowercase i, ii, iii. The symbol style walks the traditional sequence of asterisk, dagger and double dagger. Body markers and the note list are rendered in the same scheme, so a document numbered in roman numerals does not end up with arabic numbers in its notes.\\n\\nMarkers in the body can be reformatted independently of the notes list. Superscript output is the usual choice for prose, square brackets suit plain-text files and Markdown, the caret form matches a common plain-text convention, and the Markdown form uses the footnote syntax an editor will convert. The list itself can be Markdown, an HTML ordered list with anchor links back to each reference, or plain text for a file that will be pasted into a form or an email.\\n\\nThe result panel reports markers found, notes matched and notes provided, which is where discrepancies surface. Markers without notes, notes without markers and duplicate references are all listed as warnings with enough context to find them, and because renumbering follows first appearance, a body that jumps from one to three with two notes comes out as one and two with the mismatch reported. The combined output — renumbered body plus formatted notes — is one click away from the clipboard or a download, with the file extension and MIME type matching the format you chose.\\n\\nEverything runs on the text you paste. No document is uploaded, nothing is stored, and the formatting is a deterministic transformation of your input rather than a guess about your style guide.\n\nConsistency is the reason to format footnotes with a tool rather than by hand. A long document is usually written in pieces, and every piece arrives with its own habit: superscript markers here, square brackets there, a note added mid-sentence with no number at all. One pass through this tool makes the numbering agree, converts the markers into the form your publisher or house style expects, and lists every discrepancy it found. The warnings are the part to read closely, because a marker without a matching note is exactly the kind of error that survives all the way to proof stage.`,
    howTo: [
      { step: "Paste the body text with its inline markers into the first box." },
      { step: "Paste the notes into the second box, one per line." },
      { step: "Confirm the detected marker style, or choose one yourself if the document mixes styles." },
      { step: "Pick the numbering scheme, the marker format for the body and the format for the note list." },
      { step: "Read the warnings, then copy or download the renumbered body with its formatted notes." },
    ],
    whenToUse: `Use it whenever a document carries notes that have been edited in pieces: a thesis chapter, a magazine feature, a report with sources, or a manuscript being converted between tools. The {{word-count-tool|Word Count Tool}} is the companion check when a submission limit excludes or includes the notes, since it can count the body and the note list separately.\\n\\nFor a document whose numbering has drifted alongside its dates and figures, the {{number-format-checker|Number Format Checker}} reports inconsistent separators in the prose while this tool keeps the notes themselves in order.`,
    faqs: [
      {
        q: "How are markers matched to notes?",
        a: "In order of first appearance in the body. The first marker becomes note one, the second becomes note two, and so on, regardless of the numbers the draft used.",
      },
      {
        q: "What happens if a marker has no note?",
        a: "It is reported as a warning with its position in the text, and it is not silently deleted or merged with another note. You decide whether to add the note or remove the marker.",
      },
      {
        q: "Can I convert superscript notes to Markdown?",
        a: "Yes. Marker form and note-list format are separate settings, so the body can use superscript while the list is written as Markdown, or the reverse, in one pass.",
      },
      {
        q: "Which numbering styles are supported?",
        a: "Numeric, lowercase alpha continuing past z, lowercase roman, and the traditional symbol sequence of asterisk, dagger and double dagger.",
      },
      {
        q: "Is my document uploaded for formatting?",
        a: "No. The analysis and the renumbering happen in the page, nothing is sent to a server, and nothing is retained after you close the tab.",
      },
    ],
  },

  "distraction-free-writing-editor": {
    keywords: ["distraction free editor", "distraction free writing", "focus mode editor"],
    intro:
      "A plain writing surface with no toolbar, no formatting and no notifications — a distraction free editor that autosaves in this browser and can expand to fill the whole screen.",
    content: `Sometimes the problem is not the sentence, it is the interface. A distraction free editor removes everything that competes with the text: no toolbar, no style panel, no word-count ticker in the corner, no formatting buttons to fiddle with. This one gives you a single surface, a live count, a focus mode and a download button, and nothing else.\\n\\nThe surface is plain text on purpose. What you type is what is stored — no hidden marks, no rich-text structure, no proprietary document format that has to be converted before another program can read it. Paste from a word processor and you get the words, not the styling, which is usually what a draft needs in its first pass. Because the file you export is plain text, it opens in every editor, survives every migration and can be diffed against later versions.\\n\\nFocus mode expands the surface to fill the entire screen and hides the surrounding interface, leaving margins sized for comfortable line lengths. It is the same editor, not a separate mode: the text stays where it is, the counts keep updating, and the exit button returns you to the page. Writers who find the browser chrome itself a distraction get the most from it.\\n\\nThe counters are deliberately quiet. Words, characters and sentences update as you type, and the reading time uses two hundred and twenty words per minute, the same default as the reading time estimator, rounding up so that a short draft is never reported as zero minutes. Nothing in the interface moves while you write; the numbers change in place rather than animating.\\n\\nAutosave is local. The draft is written to this browser's storage shortly after you stop typing, which protects it from a refresh or an accidental tab close. It also means the text is never uploaded, never synced to an account and never visible to anyone else. Download writes the draft to a plain text file, which is how you take it somewhere else, and Clear empties the editor after asking for confirmation because the action cannot be undone.\\n\\nTwo honest limits. There is no spell check beyond what the browser itself offers, no grammar analysis and no version history — this is a surface for producing a draft, and the checking tools on this site are separate. And because the draft lives in the browser, clearing site data removes it; download anything you would mind losing. If richer writing structures are what you need, that is a different tool, not a missing feature here.\n\nThe case for a plain surface is old and still holds. Distraction free writing removes the small decisions that interrupt drafting — which style to apply, where the cursor should land after a heading, whether a comment needs answering — and leaves one task in view. A focus mode editor takes the same idea further by hiding the rest of the browser as well, and the quiet counters give just enough feedback to know whether the session produced anything. What the tool gives up is deliberate: no formatting, no structure, no collaboration. Those belong to later passes, with other tools.`,
    howTo: [
      { step: "Start typing. The editor opens empty unless a previous draft is stored in this browser." },
      { step: "Read the word, character, sentence and reading-time counts below the surface as you write." },
      { step: "Use Focus mode to expand the editor to the full screen and hide the rest of the page." },
      { step: "Download the draft to a plain text file whenever you want a copy outside the browser." },
      { step: "Use Clear only when you want an empty page; the editor asks for confirmation first." },
    ],
    whenToUse: `Use it for a first draft, a morning page, a letter, or any session where the writing itself is the whole task and a feature-rich editor would get in the way. When the aim is timed output, the {{writing-sprint-timer|Writing Sprint Timer}} adds a countdown and a measured pace to the same idea.\\n\\nIf the draft needs structure rather than a blank page — notes to format, sentences to tighten — the {{footnote-formatter|Footnote Formatter}} and the {{focus-sentence-highlighter|Focus Sentence Highlighter}} are the tools that come after the words exist.`,
    faqs: [
      {
        q: "Does the editor keep the formatting when I paste text in?",
        a: "No. It is a plain-text surface, so pasted styling is dropped and only the characters remain. That is what keeps the downloaded file readable in any other program.",
      },
      {
        q: "Where is my draft kept?",
        a: "In this browser's local storage, saved shortly after you stop typing. Nothing is uploaded, and clearing your browser's site data removes it.",
      },
      {
        q: "What does focus mode do?",
        a: "It expands the writing surface to the whole screen and hides the surrounding interface, keeping comfortable margins. The text and the counters are unchanged.",
      },
      {
        q: "How is the reading time calculated?",
        a: "Words divided by two hundred and twenty per minute, rounded up so a short draft never shows zero. The reading time estimator on this site uses the same default and lets you change the rate.",
      },
      {
        q: "Can I lose work in this editor?",
        a: "Only if you clear the draft, clear your browser data, or use private browsing where storage is discarded. Downloading the draft is the safe habit for anything you care about.",
      },
    ],
  },
};
