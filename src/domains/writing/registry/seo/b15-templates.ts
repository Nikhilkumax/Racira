import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B15, templates and generators: authored SEO entries for the cover
 * letter builder, the resume writer, the bio generator, the author profile
 * writer and the press release template.
 *
 * Every entry draws the same line: these tools assemble a document from the
 * writer's own facts and check its structure, and none of them writes the facts
 * or judges whether the document will land. Keys are registry slugs; see
 * ../tool-seo.ts for the contract.
 */
export const B15_TEMPLATES_SEO: Record<string, ToolSeo> = {
  "cover-letter-builder": {
    keywords: ["cover letter builder", "cover letter", "specifics", "closing", "hiring team"],
    intro:
      "The cover letter builder assembles a letter from your name, the role, the company, the specifics you would bring and a closing line — then checks the structure for the faults that make an application read as a mailshot.",
    content: `The cover letter builder assembles a letter from its parts: a name, the role, the company, the specifics you would bring and a closing line. Working from parts rather than from prose keeps the letter's two jobs separate — saying which role you want, and giving the reader one or two things about you worth remembering. The assembled letter puts them in order: a greeting addressed to the company's hiring team, a sentence naming the role, a sentence carrying your specifics, a closing, and a signature.

The specifics field is the part that does the work. A letter that says you are hard-working says nothing a reader can check; a letter that says you cut first-response time from two days to four hours gives them a number and a story. The builder joins the lines you enter into one sentence and keeps the letter to a handful of them, because a first read holds about five. When there are more, the checks say so and ask you to keep the strongest.

The structural checks are deliberately modest. They flag a missing company — a letter addressed to any employer reads as a mailshot — a missing role, no cover letter specifics at all, and a closing that thanks the reader instead of asking for the next step. They do not rewrite your sentences, score your experience or pretend to know what the employer wants; those are judgements a template cannot make, and the page says as much.

Because the assembled letter is a pure function of the fields, editing one line updates the whole draft. Trying a different role title or a shorter closing is one change, which makes it easy to keep one letter per opening rather than one letter for everything. The copy and download buttons take the text out cleanly so it can go into an email or an application form.

Nothing is uploaded and nothing is stored beyond the tab. The letter is composed locally from your facts, so an application in progress stays private until you send it. The tool writes no achievements and knows nothing about the job, the industry or the company; it provides the order, the join and the prompts, and the substance is yours.

It helps to draft the specifics first, away from the letter, and ask of each one whether a stranger could check it. Numbers, names and outcomes survive that test; adjectives do not. Then assemble the letter, read it once aloud for rhythm, and check that the company named is the one you are actually writing to, which is the mistake the structural prompt catches most often.

When there is genuinely no number to quote, name the thing itself: a system you kept running, a customer you kept, a document that is still in use. A named artifact is checkable too, and a letter that points at one gives the reader something to ask about, which is what an interview is for. The builder cannot tell which of your specifics is strongest, and it does not try, which keeps that judgement where it belongs.`,
    howTo: [
      { step: "Enter your name, the role and the company." },
      { step: "Add the specifics you would bring, one per line, with a number or a name in each." },
      { step: "Write a closing that asks for the next step." },
      { step: "Read the assembled letter and its word count." },
      { step: "Work through the checks, then copy or download the letter." },
    ],
    whenToUse: `Use the cover letter builder when an application needs a letter and you want the structure right before you finesse the wording. The details you name here usually come from the {{resume-writer|Resume Writer}}, so build that first if the two documents need to agree.\n\nWhen a draft reads either too stiff or too casual for the employer, the {{formality-level-detector|Formality Level Detector}} measures the register, and the {{cliche-detector|Cliché Detector}} catches the phrases every other applicant is also using.`,
    faqs: [
      {
        q: "Does the builder write the letter for me?",
        a: "It assembles the structure from your facts: the greeting, the sentence naming the role, your specifics joined into a paragraph, the closing and the signature. The facts themselves — what you did and what you would bring — are yours to supply.",
      },
      {
        q: "How many specifics should a letter carry?",
        a: "Two to five. A first read holds about five, and the checks warn when the list grows past that. One specific with a number in it beats four adjectives.",
      },
      {
        q: "What makes a closing line good?",
        a: "It asks for the next step — an interview, a short call — rather than thanking the reader for their time. The check flags a missing closing, and the wording is yours.",
      },
      {
        q: "Is the letter uploaded anywhere?",
        a: "No. There is no account and no upload; the text lives only in the tab, and the copy and download buttons are how it leaves when you choose.",
      },
      {
        q: "Can I draft several letters at once?",
        a: "The builder holds one letter at a time in the tab. Because the fields update the draft instantly, it is practical to switch the company and role and keep one tailored letter per opening.",
      },
    ],
  },

  "resume-writer": {
    keywords: ["resume writer", "resume", "experience", "achievement", "summary"],
    intro:
      "The resume writer assembles a plain-text resume from a header, a summary, dated experience and education entries and a skills line, then checks every entry for a complete field set and a number in the achievement.",
    content: `The resume writer assembles a plain-text resume from a header, a summary, dated experience and education entries and a skills line. The format it writes is deliberately plain: name, title and contact on three lines, then labelled sections. Plain text is the master copy — it pastes into any application form, any email and any layout tool — and the structure is the part a template can genuinely carry.

Each experience line has four fields: role, company, dates, achievement. The builder checks that all four are present, because the commonest resume fault is a missing date or a company that never gets named, and it then checks the achievement for a number. An achievement without one, such as "answered support tickets", is a duty rather than a result; a figure, a percentage or a timescale makes the line checkable and makes it worth its space on the page.

The summary is the one free paragraph, and the checks keep it honest: under sixty words, written as a sentence rather than a list. The education entries take degree, institution and year, and the skills line takes a short list separated by commas or newlines. More than a dozen skills dilutes the list, so the checks ask for the ones the role actually names.

Because the resume is composed deterministically from the fields, the same entries always produce the same document, and correcting a date is a single edit. The builder invents nothing: no experience, no metric, no skill. What it adds is the order and the prompts, which is exactly the part a writer staring at a blank page tends to get wrong.

Applicant tracking systems parse plain structure well, but they and recruiters have their own expectations — standard job titles, no tables, no columns — and this tool cannot see the destination. Treat the output as the master copy and retype it into the layout each application asks for. Keep dates consistent, spell out the months or leave them off, and check the contact line works.

Nothing is uploaded and nothing is stored beyond the tab, so a job hunt stays private. The checks are structural: they say what is missing, not what is impressive. Whether the experience fits the role is a judgement for the person reading it, and the page says so plainly.

The writer also keeps the document's shape visible in the word count, which matters because the reader's attention is the scarce resource. One page is the working norm for early and mid-career; a second page is earned by a decade of relevant work, not by more detail about the same roles. The check cannot tell how much space a line deserves, but it can show the number, and trimming the oldest entries to a bare title and date is the usual first cut when the count climbs. The builder writes every entry you give it, so the master copy can run longer than any single application; cut to one page from this draft rather than deleting the facts from it, and the same master will serve the next opening.`,
    howTo: [
      { step: "Fill in the header: name, title and contact." },
      { step: "Write a two-line summary in the sixty-word band." },
      { step: "Add each experience as role | company | dates | achievement." },
      { step: "Add education entries and a short skills list." },
      { step: "Read the checks for missing fields and unquantified achievements, then copy the resume." },
    ],
    whenToUse: `Use the resume writer to build the master copy of a resume that every application draws from. When the same facts need to become a letter, the {{cover-letter-builder|Cover Letter Builder}} carries the strongest of them into a sentence.\n\nBefore sending, a {{word-count-tool|Word Count Tool}} pass confirms the resume fits the length the employer asks for, and a {{redundancy-finder|Redundancy Finder}} pass catches the repeated verbs that make entries blur together.`,
    faqs: [
      {
        q: "Does the resume writer produce a formatted, designed resume?",
        a: "No. It writes a plain-text master copy with labelled sections. That pastes cleanly into application forms and into whichever layout or template the employer expects, but the visual design is not its job.",
      },
      {
        q: "Why does every achievement need a number?",
        a: "Because a number makes the claim checkable. Scale, time and percentages turn a duty into a result; the check flags entries without one so you can add a figure rather than an adjective.",
      },
      {
        q: "How many skills should I list?",
        a: "Six to ten is a working range. The checks warn past twelve, since a long list stops being a signal and starts being noise. Keep the terms the role asks for.",
      },
      {
        q: "Will it write my experience for me?",
        a: "No. It assembles and checks what you enter. Every line of experience, every date and every metric comes from you; the tool provides the order and the structural prompts.",
      },
      {
        q: "Is my resume uploaded?",
        a: "No. There is no account and no upload, and the entries live only in the tab until you copy or download the text.",
      },
    ],
  },

  "bio-generator": {
    keywords: ["bio generator", "bio", "third person", "short bio", "long bio"],
    intro:
      "The bio generator turns a name, a role, a focus and a few facts into three bios at once — a one-line, a short bio and a long bio — all in the third person and all built from the same facts.",
    content: `The bio generator turns a small set of facts into three bios at once: a one-line version for a byline or a social profile, a short bio for a conference programme or a staff page, and a long bio for a book jacket or an about page. All three are built from the same inputs, so the versions never drift apart: change a fact once and every length updates together.

The inputs are a name, a role, a focus, a location and a handful of facts. The engine writes in the third person, picks the article automatically — a support engineer, an editor — and treats each fact as a sentence with a closing stop. The one-line version is the who: name, role and base. The short bio adds the focus and the first fact. The long bio uses them all, in the order you entered them, which means the most important fact should be first.

The checks flag the slips that make a bio read as a template: no facts at all, first-person facts, a single fact that has grown past thirty words, and a long bio that runs past 150 words. They are prompts about shape, not about substance. A bio can pass every check and still overstate; only the writer can decide what belongs.

Writing in three lengths is not redundancy. Each venue has its own tolerance: a byline gives you twelve words, a programme gives you sixty, a jacket gives you a paragraph. Because the versions share their inputs, the short and long bios agree — the commonest fault in a self-written bio is a long version that quietly adds a credit the short one forgets.

Nothing is uploaded and nothing is stored beyond the tab, and the generator invents no credits, no publications and no history. It assembles what you supply and prompts for what is missing, which keeps the facts and the judgement with the writer.

In practice, the useful discipline is to list the facts before writing any variant and ask of each whether it is checkable: a platform, a year, a title, a first. Then read the long bio aloud once. If it sounds like a list, reorder the facts rather than adding adjectives, and if it sounds like a stranger, add one concrete detail — a place, a project, a number — instead of a claim.

The third-person rule deserves one more word, because it is the check writers ask about most. A bio is read as a description of you, not a message from you, and mixing the two voices — a third-person opening with a first-person aside — is the fault that makes a bio feel assembled. The generator's prompts catch the slip in your facts, but they cannot choose your pronouns; if you use they and them, write those pronouns into the fact lines rather than letting the lines default to he or she. The facts carry the pronouns you wrote, and the assembled bios keep them exactly as entered. If a venue insists on a first-person bio, convert the assembled lines rather than starting again.`,
    howTo: [
      { step: "Enter the name, role, focus and base." },
      { step: "List the facts, one per line, most important first." },
      { step: "Read the one-line and short variants and check the article and the stops." },
      { step: "Read the long variant and reorder or trim the facts." },
      { step: "Work through the checks, then copy the length each venue needs." },
    ],
    whenToUse: `Use the bio generator whenever the same person needs introducing at more than one length. If the setting is literary — a programme, a jacket, a festival page — the {{author-profile-writer|Author Profile Writer}} carries the genre, the works and the themes that a reader of fiction expects.\n\nBefore publishing, a {{word-count-tool|Word Count Tool}} pass confirms each variant fits its venue's limit, and the {{tone-analyzer|Tone Analyzer}} shows whether the long bio reads as warmly or as drily as you intended.`,
    faqs: [
      {
        q: "Why does the generator produce three bios?",
        a: "Because venues carry different lengths: a byline gives you a line, a programme a short paragraph, a jacket a full one. All three share their inputs, so they cannot drift apart.",
      },
      {
        q: "Should a bio be first person or third person?",
        a: "Third person is the default for publication and conference bios, and the generator writes that way throughout. First-person facts are flagged so you can rewrite them rather than mix the two voices.",
      },
      {
        q: "What facts belong in a bio?",
        a: "The checkable ones: a current role, a platform or publication, a first, a title, a year. Facts you can point at survive a stranger's read; claims about being passionate rarely do.",
      },
      {
        q: "Does it invent any credits?",
        a: "No. The generator assembles only what you enter and never adds a publication, a title or a history. That is also why the checks ask for facts rather than supplying them.",
      },
      {
        q: "Which length should I send where?",
        a: "A one-line for a byline or a profile, a short bio for programmes and staff pages, a long bio for jackets and about pages. When a venue states a word limit, use the word count as the guide.",
      },
    ],
  },

  "author-profile-writer": {
    keywords: ["author profile writer", "author profile", "selected works", "themes", "influences"],
    intro:
      "The author profile writer assembles a publication-facing profile from a genre, a dated work list, themes, influences and a short note, then checks that the facts a reader needs are present.",
    content: `The author profile writer assembles a publication-facing profile from the facts a reader of fiction expects: a genre, selected works with years, a handful of themes, the influences behind the writing, a short note and a link. It writes the profile as a labelled document — a lead line, a selected works list, a themes list — so an editor can lift the section they need without reformatting.

The distinction from a bio is the work. A bio introduces a person; an author profile introduces a body of writing and lets the person follow from it. That is why the engine asks for titles with years and checks that every work has one: a title alone cannot be placed, and placing it — an early book, a recent one — is what a reader does first. It also keeps the themes to a short list, because three to five themes describe a body of work while ten become a catalogue.

The checks are structural and honest. They ask for a name, a genre, at least one work, a year on each work, two or three themes, an influence or two, and a short note in the third person. They flag a first-person slip in the note because the profile is read as a description of the author, not a message from them. They do not judge whether the works are good, and they add no credits.

Because the profile is composed from the fields, the same facts always produce the same document, and updating a work list is a single edit. The copy and download buttons take the text out as a page-ready block, and nothing is stored beyond the tab.

In practice the note is the part that takes the longest and matters most: it is the only place where voice enters a document otherwise made of lists. Keep it to a sentence or two in the third person, favour a concrete detail over an adjective, and let the works list do the boasting.

When the profile is for a specific venue — a festival page, a query letter, a book jacket — read that venue's existing profiles first. The conventions are close but not identical: some want the note first and the works last, others want the reverse. The generator gives you the facts in a standard order and leaves the final arrangement to you.

One habit helps more than any other: keep a master profile of your own. The copy and download buttons produce a clean block, and that master — genre, works, themes, note — is the source for every shorter variant a festival panel, a magazine or a book page will ask for. When a new work appears, add it to the master and regenerate rather than rewriting the note from memory. Revisit the theme list once a year, too: the themes you would have named five years ago often describe work you no longer write, and a profile is a claim about the present. A dated list of works makes that drift visible, which is one more reason every title in it wants a year.`,
    howTo: [
      { step: "Enter the name and the genre or kind of writing." },
      { step: "List the selected works as title | year, one per line." },
      { step: "Add two to five themes." },
      { step: "Name the influences and write a short third-person note." },
      { step: "Read the checks, then copy or download the profile." },
    ],
    whenToUse: `Use the author profile writer when a festival, a publisher or a book page needs the writing introduced with its works and themes. When the venue wants only the person — a panel bio, a byline — the {{bio-generator|Bio Generator}} is the shorter route.\n\nA bibliography and an author profile answer different questions, so when the work list outgrows a paragraph the {{bibliography-builder|Bibliography Builder}} formats the full list, and when a new title is being announced the {{press-release-template|Press Release Template}} carries the news around it.`,
    faqs: [
      {
        q: "What belongs in an author profile?",
        a: "A genre, selected works with years, a few themes, the influences behind the writing and a short third-person note. The engine assembles exactly those and checks that none of the facts a reader needs is missing.",
      },
      {
        q: "Why does every work need a year?",
        a: "Because a reader places a book by its date — early, recent, the one after the prize — and a title alone cannot be placed. The check flags a missing year on each work in the list.",
      },
      {
        q: "How many themes should I list?",
        a: "Three to five. That range describes a body of work; more turns the profile into a catalogue, and the checks ask you to trim when the list grows past five.",
      },
      {
        q: "Is an author profile the same as a bio?",
        a: "No. A bio introduces a person at some length; a profile introduces the writing and lets the person follow from it. Use the profile when the works matter, the bio when only the person is being introduced.",
      },
      {
        q: "Can I use the profile in a query letter?",
        a: "The facts transfer, but letters have their own conventions and word limits. Build the profile for the facts, then adapt the note into the letter's voice rather than pasting the whole document.",
      },
    ],
  },

  "press-release-template": {
    keywords: ["press release template", "press release", "dateline", "boilerplate", "media contact"],
    intro:
      "The press release template assembles the conventional structure — dateline, the five Ws, a quote, boilerplate and a media contact — and checks what is missing before the release goes out.",
    content: `The press release template assembles the conventional structure a news desk expects: the words for immediate release, a headline, a dateline, a lead that answers what happened, supporting paragraphs, an attributed quote, an about paragraph and a media contact. The template's value is not the news — that is yours — but the order and the completeness, because editors drop releases that make them hunt for a date or a name.

The lead is the part the checks watch most closely. It needs the what in one sentence, the who affected and the why it matters; timing and place follow in the next paragraph. A lead built that way can be skimmed in five seconds, which is roughly the attention a release gets. The dateline — city and date — sits at the front of the lead, and the check asks for both because a release without one reads as a letter.

The quote is the human part, and the checks ask that it be attributed as speaker | words. An unattributed quote is unusable: a desk will not run a sentence nobody said. The headline is title-cased, kept under a dozen words, and stripped of a closing period, since press headlines are set without one — each of those is a prompt rather than a rewrite.

The boilerplate is the paragraph an editor reuses when covering the organisation, so the template provides the About heading and asks for the text. The media contact is last and non-optional; a release with no contact is a dead end for the one reader who wants to follow it up.

Nothing is uploaded and nothing is stored beyond the tab. The engine composes the release locally and takes no view of the news, the organisation or the audience; it writes no claims and sets no tone. What it does is make the conventional shape visible, so the missing pieces are obvious before the release leaves.

Before sending, read the release as a stranger would: does the first sentence say what happened, is the quote checkable, is the contact live. Then check the date and the place once more — the two details most often wrong in a hurried release — and let the structure do its quiet work.

The order of the release does more work than any single sentence, because a desk reads the headline first, then the lead, then the quote, and only then the boilerplate. Anything essential buried below the contact will not be seen, which is why the what belongs in the first sentence and the quote sits high. Keep each paragraph to two or three sentences: a release that looks dense is skimmed less, not more. The template cannot measure newsworthiness and does not pretend to; a release that passes every check may still be spiked, and one that breaks a rule may still run. What it guards is the structure, so the news gets its best chance. Send it as plain text in the body of an email rather than as an attachment, unless the desk has asked otherwise, since filters strip attachments first.`,
    howTo: [
      { step: "Enter the organisation and a headline of twelve words or fewer." },
      { step: "Add the dateline and the what in one sentence." },
      { step: "Fill in who is affected, when and where, and why it matters." },
      { step: "Add an attributed quote as speaker | words." },
      { step: "Add the boilerplate and a media contact, then read the checks and copy the release." },
    ],
    whenToUse: `Use the press release template when an announcement has to reach a desk and you want the conventional shape complete before it does. The about paragraph is often a trimmed version of the {{bio-generator|Bio Generator}}'s long bio, so build that first when the organisation and the person are introduced together.\n\nBefore it goes out, the {{readability-grade-scorer|Readability Grade Scorer}} confirms the lead reads at the level a busy desk wants, and the {{formality-level-detector|Formality Level Detector}} shows whether the voice sits anywhere near the register of a news release.`,
    faqs: [
      {
        q: "What is a dateline in a press release?",
        a: "The city and date at the front of the lead — BRISTOL, 3 March 2026 — which tell a desk where and when the news is from. The template asks for both because editors strip releases without one.",
      },
      {
        q: "What goes in the boilerplate?",
        a: "A short about paragraph describing the organisation in the terms an editor can reuse: what it does, where it is based, one fact that anchors it. The template provides the About heading and leaves the wording to you.",
      },
      {
        q: "How long should a press release be?",
        a: "One page is the working norm: a headline, a lead of two or three sentences, one or two supporting paragraphs, a quote, boilerplate and contact. The template keeps that order and the checks keep the pieces present.",
      },
      {
        q: "Why does the headline drop its closing period?",
        a: "Because press headlines are set as display type, and display type takes no full stop. The check flags a headline ending in a period and trims it in the assembled release.",
      },
      {
        q: "Does the template write the announcement?",
        a: "No. It assembles the structure — dateline, the five Ws, quote, boilerplate, contact — and checks what is missing. The news, the quote and the claims are yours, and the tool takes no view of them.",
      },
    ],
  },
};
