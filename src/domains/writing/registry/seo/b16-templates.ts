import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B16, templates and generators continued: authored SEO entries for the
 * blog post outline builder, the newsletter template builder, the email template
 * library, the proposal template and the FAQ generator.
 *
 * Every entry draws the same line: these tools supply structure and checks from
 * the writer's own material, and none of them writes the content. Keys are
 * registry slugs; see ../tool-seo.ts for the contract.
 */
export const B16_TEMPLATES_SEO: Record<string, ToolSeo> = {
  "blog-post-outline-builder": {
    keywords: ["blog post outline builder", "outline", "blog post", "takeaways", "call to action"],
    intro:
      "The blog post outline builder turns a working title, a reader, the takeaways the post must deliver and a call to action into a numbered outline with checks on its shape.",
    content: `The blog post outline builder turns the four decisions a post needs into a numbered outline: a working title, the reader it is for, the takeaways it must deliver and the call to action at the end. Working from those parts rather than from a blank page keeps the post's promise visible — a title that names a benefit, an audience that narrows the examples, and a list of points that either support the promise or belong in a different post.

The takeaways field is where the outline earns its keep. Each line becomes a numbered section with a one-line reminder to support it with an example, a number or a short story, because a heading without evidence is an opinion with a font. Three points is the working minimum and seven the practical maximum; beyond that the post needs splitting, and the checks say so rather than letting the outline grow into a table of contents.

The title is a working title on purpose. It is easier to write to a plain promise — how to run a support desk without burning out — and sharpen it into a headline later than to stall on the perfect phrase before the thinking is done. The checks flag a title that has grown past a dozen words and an audience that was left generic, since a blog post written for everyone is written for no one.

The call to action is the last line and a real decision. One ask per post is the rule the outline enforces: download the template, subscribe, reply with an answer. A post that asks for three things gets none of them done, and an outline without a CTA is a draft that ends rather than a piece that lands.

The outline exports as plain text, so it can sit beside the draft in any editor and be ticked off as the sections are written. Because it is assembled deterministically from the fields, reordering the points is a single edit, and the word count shows how much skeleton the post has before a sentence of prose exists. That number is also a warning: a skeleton of a hundred words is a promise of a piece of two thousand, and the outline should be honest about the size of the promise.

Nothing is uploaded and nothing is stored beyond the tab. The builder supplies structure and checks; the research, the examples and the sentences are yours. Keep the points as headings when you draft, and let each section find the length it needs rather than the outline's symmetry.

The outline also settles the question of what the post is not. A point that does not serve the title's promise gets parked for another post rather than squeezed in, which keeps the draft from turning into two posts arguing for attention. When the sections are numbered, the writer can also see the shape of the reader's journey: what they must believe after the introduction for point three to land, and which point is the pivot that carries the argument. Marking that pivot — usually the middle point, the one with the strongest evidence — is the difference between an outline that lists and an outline that builds.`,
    howTo: [
      { step: "Write a working title and name the reader." },
      { step: "List the takeaways, one per line — three to seven of them." },
      { step: "Add the single call to action." },
      { step: "Read the numbered outline and its word count." },
      { step: "Work through the checks, then copy the outline into your writing tool." },
    ],
    whenToUse: `Use the blog post outline builder before drafting, when a post is still a pile of notes and the argument needs an order. When the concern is whether the draft repetition is showing, the {{redundancy-finder|Redundancy Finder}} works on the prose the outline becomes.\n\nOnce the post exists, the {{keyword-density-analyzer|Keyword Density Analyzer}} checks it against the terms you meant to rank for, and the {{reading-time-estimator|Reading Time Estimator}} tells you whether the length matches the promise the title made.`,
    faqs: [
      {
        q: "How many points should a blog post outline have?",
        a: "Three is the working minimum and seven the practical maximum. Below three the post rarely earns its title; above seven it usually wants splitting into two pieces, and the builder's checks say so.",
      },
      {
        q: "Does the builder write the outline's supporting content?",
        a: "No. Each numbered point gets a one-line reminder to support it with an example, a number or a story, but the evidence, the research and the sentences come from you.",
      },
      {
        q: "What makes a good working title?",
        a: "A plain promise the post can keep, in twelve words or fewer. The checks flag a title that has become a sentence; sharpening it into a headline is easier once the draft exists.",
      },
      {
        q: "Why insist on a single call to action?",
        a: "Because a post that asks for three things gets none of them done. The builder reserves one line for one ask — the download, the subscription, the reply — and flags a missing one.",
      },
    ],
  },

  "newsletter-template-builder": {
    keywords: ["newsletter template builder", "newsletter", "sections", "purpose line", "issue"],
    intro:
      "The newsletter template builder assembles an issue skeleton from a masthead, sections with a purpose line each, one next step and a sign-off — then checks the shape of the send.",
    content: `The newsletter template builder assembles the skeleton of an issue from four parts: a masthead with the newsletter's name and issue number, a list of sections each with a one-line purpose, a single next step and a sign-off. The skeleton is not the writing; it is the agreement about what the issue is for, made before the writing starts, which is the stage at which a newsletter most often goes wrong.

Each section is entered as heading | purpose line. The purpose line is the discipline: one sentence saying what the section does for the reader. A section whose purpose cannot be stated in a sentence is usually two sections, or a sentence that has not decided what it is arguing. The builder keeps the purpose under its heading, so the skeleton reads as a plan rather than a list of labels.

The checks are about the shape a send needs to survive. Fewer than three sections rarely justifies an issue; more than six and the reader is scrolling past the point where attention runs out. A heading that has grown past eight words is flagged as a phrase that became a sentence, and a section with no purpose line is flagged so the plan cannot quietly become a list of titles.

One next step is enforced for the same reason a blog post gets one call to action: an issue asking for five clicks gets none of them. The sign-off closes the issue with a name or a line, and the masthead gives the reader the two facts they need to place the send: which newsletter, and which issue. Those small pieces of furniture are what make a recurring newsletter feel like a publication rather than a forwarded email.

The skeleton exports as plain text and can be pasted into whichever newsletter tool sends the issue. Because it is assembled from the fields, moving a section up the order is one edit, and the word count shows how much of the issue is plan rather than prose — a useful honest number before the writing begins.

Nothing is uploaded and nothing is stored beyond the tab. The builder composes and checks the skeleton; the sections, the stories and the offers are yours, and the page says so plainly.

A recurring newsletter lives or dies on two things the skeleton cannot check: whether the issue is worth opening, and whether it is worth the reader's time every time it arrives. The subject line and the sender name do the first job, and the masthead the builder assembles is the raw material for both. The second is a discipline of length: an issue that always takes four minutes gets read, and one that sometimes takes four and sometimes fifteen gets postponed until it is deleted. Keeping the section count stable from issue to issue is a quiet promise to the reader — the format says how long this will take before they start — and a stable shape is also what makes writing the next issue faster, because the planning decision has already been made.`,
    howTo: [
      { step: "Name the newsletter and set the issue number or date." },
      { step: "Add the sections as heading | one-line purpose, one per line." },
      { step: "Write the single next step." },
      { step: "Add a sign-off." },
      { step: "Read the assembled skeleton and its checks, then copy it into your sending tool." },
    ],
    whenToUse: `Use the newsletter template builder when an issue needs a plan before it needs prose. When one of the sections is an email to a single reader, the {{email-template-library|Email Template Library}} has the common business emails already drafted.\n\nThe purpose lines are the first place jargon hides, so a {{jargon-remover|Jargon Remover}} pass over them tightens the plan, and the {{word-count-tool|Word Count Tool}} gives the finished issue the length check a sending tool will not.`,
    faqs: [
      {
        q: "How many sections should one newsletter issue have?",
        a: "Three to six. Below three the issue struggles to justify the send; above six most readers never reach the end. The builder warns at both ends and keeps the structure visible.",
      },
      {
        q: "What is a purpose line on a newsletter section?",
        a: "One sentence under the heading saying what the section does for the reader. It is entered after a pipe in the sections field, and a section without one is flagged.",
      },
      {
        q: "Does the builder write the newsletter content?",
        a: "No. It assembles the masthead, headings, purpose lines, next step and sign-off, and checks the shape of the issue. Every word of content is written by you.",
      },
      {
        q: "Why only one next step?",
        a: "Because readers act on one ask at most. An issue with five links to click converts on none of them, so the skeleton reserves a single next step and flags its absence.",
      },
    ],
  },

  "email-template-library": {
    keywords: ["email template library", "email", "template", "placeholders", "subject line"],
    intro:
      "The email template library holds six common business emails — follow-up, introduction, request, apology, reminder and thank-you — with fill-in placeholders and checks for what is left unfilled.",
    content: `The email template library holds six of the business emails people write most often: a follow-up after a conversation, an introduction between two people, a request, an apology and repair, a gentle reminder and a thank-you. Each is a fixed template with a subject line, an opening, two or three body lines and a close, and each carries placeholders such as {{name}} and {{deadline}} that you fill from the fields above.

The value of a fixed library is that it is readable. There is no generation and no guessing: you can see every line before you fill it, so the email that arrives in the recipient's inbox is exactly the one on screen. That matters for the scenarios this tool is for — the routine messages that need to be right, not clever, and that most people rewrite from scratch every time.

Placeholders are the mechanism. A slot you leave empty stays visible in the assembled email as [name] or [deadline], and the check lists everything still unfilled in the order it appears. That is deliberate: an email with a bracket left in it is embarrassing, and a template that silently drops unfilled slots produces sentences missing their subject. Fill the fields, watch the braces disappear, and the message is ready.

The subject line comes from the template as well, which is useful because the routine emails are exactly where subject lines get lazy. A follow-up is titled following up on your topic, an introduction names the person being introduced, a reminder leads with the word reminder so it sorts correctly in a crowded inbox. Edit any of it afterwards — the template is a starting point, not a straitjacket.

The library also checks length. An email past two hundred words has stopped being a routine message, and the check says so. The templates themselves are short by design: two or three body lines, one clear request or one clear piece of news, and a close that leaves the thread where it should be.

Nothing is uploaded and nothing is stored beyond the tab. The templates are fixed and offline, the fields stay in the browser, and the copy button is the only way the message leaves — which is the right shape for correspondence that is nobody else's business.

Two habits make the library work better. The first is filling the slots in the order they appear, including ones the scenario leaves optional: a name-less follow-up reads as a form letter, and a deadline-less request invites silence. The second is cutting the template down rather than padding it up — the fixed lines carry the structure, and the two or three sentences you add should carry the specifics that made this message necessary. When a scenario nearly fits, copy the closest one and edit the middle line rather than assembling a message from several templates, since mixing openings and closes is how a routine email starts to read strangely. And when a message is genuinely sensitive — a complaint, a rejection, an apology with consequences — the template can only tell you which parts belong in it; the words should be yours.`,
    howTo: [
      { step: "Pick the scenario that matches the email you need." },
      { step: "Fill the fields — name, topic, dates and the detail line." },
      { step: "Check the subject line reads right for the recipient." },
      { step: "Replace any remaining [placeholders] listed in the checks." },
      { step: "Copy the email and edit the tone to your own voice before sending." },
    ],
    whenToUse: `Use the email template library for the routine messages that need to be correct rather than original. When the email is an application or an introduction of your professional self, the {{cover-letter-builder|Cover Letter Builder}} carries more of your specifics in the same structured way.\n\nIf the message is going out as part of a recurring send, the {{newsletter-template-builder|Newsletter Template Builder}} plans the issue around it, and a {{formality-level-detector|Formality Level Detector}} pass checks that the template's neutral register matches the relationship.`,
    faqs: [
      {
        q: "Are the emails generated or fixed templates?",
        a: "Fixed. The library holds six hand-written templates, and choosing a scenario shows every line before you fill it. Nothing is generated, so nothing arrives that you did not see.",
      },
      {
        q: "What happens if I leave a placeholder empty?",
        a: "It stays visible in the assembled email as [name] or [deadline], and the check lists the unfilled slots in order. That keeps a bracket from accidentally reaching a recipient.",
      },
      {
        q: "Can I edit the template after filling it?",
        a: "Yes, and you should. Copy the text, then change any line that does not sound like you — the templates are deliberately neutral so that editing is easy.",
      },
      {
        q: "Which scenarios does the library cover?",
        a: "Follow-up after a conversation, introduction between two people, request, apology and repair, gentle reminder, and thank-you. Those six cover most routine business correspondence.",
      },
      {
        q: "Is the email sent from the tool?",
        a: "No. The library composes text in the browser and copies it; there is no sending, no address book and no storage beyond the tab.",
      },
    ],
  },

  "proposal-template": {
    keywords: ["proposal template", "proposal", "deliverables", "timeline", "investment"],
    intro:
      "The proposal template scaffolds a project proposal from the problem, the approach, the deliverables, a timeline and a price, then checks that every section a client expects is present and specific.",
    content: `The proposal template scaffolds a project proposal from the sections a client expects: a titled header naming the client, the problem stated in their terms, the approach as numbered steps, the deliverables as a list, a timeline and the investment line. The order is conventional on purpose — a reader who has seen a hundred proposals can find what they need without hunting — and the task of the tool is to make sure each section is present before the writing gets polished.

The problem section comes before the approach, and the order matters. A proposal that leads with what you will do asks the reader to infer why; a proposal that leads with the problem they already recognise earns the next paragraph. The check asks for the problem in the client's terms because that is the difference between a proposal and a brochure.

The approach and deliverables are checked for concreteness. An approach with fewer than two steps reads as a promise rather than a plan, and a deliverables list with fewer than two items gives the client nothing to check off. Beyond eight deliverables the list buries the scope, so the checks ask you to group or cut. Each step and each deliverable should be a noun or a verb the client can point at: interviews, a report, a training session.

Timelines and money are the sections clients turn to first. The template asks for a timeline even a rough one, because clients price time as much as money, and it insists on a figure in the investment line — competitive is not a price. Where a price genuinely follows a discovery call, the check asks you to say so explicitly rather than leaving the line blank.

The scaffold exports as plain text and takes the shape of a proposal without pretending to be a contract. Because it is assembled from the fields, changing the scope is one edit, and the word count shows how much of the document is structure before any persuasion is written.

Nothing is uploaded and nothing is stored beyond the tab. The template writes no scope, estimates no effort and promises no outcome; it supplies the sections and the prompts, and the numbers and the terms are yours.

Two further habits keep a proposal readable. Keep the client's problem in the client's own words — if they said turnaround, do not write latency — and keep every section in the order above, because a reader comparing three proposals is reading them all the same way. The deliverables are where most proposals overreach: ten nouns read as hedging, while three concrete ones plus a sentence about what is out of scope read as confidence. Keep the timeline honest by giving a range when a range is the truth; clients routinely discount a single date and trust a range more. Finally, read the investment line aloud: a price stated without hedging is easier for a client to accept than the same number buried in qualifiers. A proposal is a promise, and a promise reads better when it is easy to check.`,
    howTo: [
      { step: "Title the proposal and name the client." },
      { step: "State the problem in the client's terms." },
      { step: "Add the approach as numbered steps, then the deliverables as a list." },
      { step: "Add the timeline and a figure in the investment line." },
      { step: "Read the checks, then copy or download the scaffold and edit the prose." },
    ],
    whenToUse: `Use the proposal template when a client has asked for a written scope and the sections need to be right before the persuasion is polished. When the project's internal logic needs its own order first, the {{outline-builder|Outline Builder}} numbers the argument the proposal will make.\n\nThe summary a client reads when they only read one paragraph is the same craft as an {{executive-summary-builder|Executive Summary Builder}}, and a {{word-count-tool|Word Count Tool}} pass confirms the proposal fits the one-or-two page expectation most clients have.`,
    faqs: [
      {
        q: "What sections should a project proposal contain?",
        a: "A titled header naming the client, the problem in their terms, the approach as steps, the deliverables as a list, a timeline and the investment line. The template assembles those and flags any that are missing.",
      },
      {
        q: "Why does the template insist on a figure in the price?",
        a: "Because words like competitive or flexible are not prices, and clients read a blank investment line as a hidden cost. Where the figure truly follows a discovery call, the check asks you to say that explicitly.",
      },
      {
        q: "How many deliverables is too many?",
        a: "Past eight the list stops being a scope and becomes a catalogue. The checks ask you to group items or keep the eight that matter, since a client cannot check off a list they cannot hold.",
      },
      {
        q: "Does the tool estimate the work or the price?",
        a: "No. It assembles the structure and checks that each section exists. Every number — the timeline, the effort and the investment — comes from you and your judgement.",
      },
    ],
  },

  "faq-generator": {
    keywords: ["FAQ generator", "FAQ section", "questions", "answers", "coverage"],
    intro:
      "The FAQ generator formats questions and answers into a reader-ready FAQ section and checks its coverage: enough questions, no duplicates, an answer under each and at least one question phrased the way a reader would type it.",
    content: `The FAQ generator formats a topic and a list of question | answer lines into a clean FAQ section headed frequently asked questions about your topic. The questions and answers are yours; the generator supplies the format, the ordering and a set of checks that catch the faults a hastily assembled FAQ almost always has.

The first check is coverage of question types. Readers arrive with questions shaped how, what, why, when, where, who, can and is, and a section made entirely of statements-with-question-marks answers nobody's actual question. If none of the questions starts with a question word a reader would type, the check says so and asks for at least one rewrite — which is usually also the most useful thing to do.

The second check is duplication. Two questions asking the same thing in different words are common when an FAQ has been assembled from support tickets, and readers notice. The generator normalises punctuation and case before comparing, so how long does a refund take and How long does a refund take? are caught as the same question, and the fix is to merge the answers.

Answers are checked for presence and for length. A missing answer becomes a visible TODO placeholder rather than a silently empty line, and an answer past eighty words is flagged as a paragraph that has outgrown an FAQ. The pattern that works: two or three sentences, the specific fact first, the exception second, and a link or a next step only when it genuinely helps.

The section is checked for size at both ends. Fewer than three questions is not yet an FAQ section, and past ten it has become a support page that wants search rather than headings. Both are prompts, not rules, and the page says as much: the checks describe the shape of a useful section, not the truth of the answers, which remains entirely yours.

Nothing is uploaded and nothing is stored beyond the tab. The generator writes no answers and knows nothing about the product or the policy behind them, so placeholder text is a reminder rather than something to publish.

A section works hardest when it is arranged in the order readers arrive. The first question should be the one support hears most often, even if it seems obvious — an FAQ that assumes knowledge is written for its authors. Group related questions together if the list grows, and put the small practical ones near the end, where someone still reading has already decided the page is for them. Keep the answers specific enough to act on: a refund that takes ten working days beats a refund that is processed promptly. When an answer depends on the reader's circumstances, name the circumstances, because a conditional answer that states its condition is worth more than a general one that covers every case badly. Above all, revisit the section when the product changes; an out-of-date FAQ costs more trust than no FAQ at all. Where an answer changes, the section should change with it, on the same schedule as the product.`,
    howTo: [
      { step: "Name the topic; it becomes the section heading." },
      { step: "Add each question and answer as one line, separated by a pipe." },
      { step: "Read the formatted section and the question count." },
      { step: "Work through the checks for duplicates, missing answers and question coverage." },
      { step: "Copy or download the section and paste it into the page." },
    ],
    whenToUse: `Use the FAQ generator when a product page, a help page or a policy page needs the questions a reader actually asks. The answers themselves benefit from the {{jargon-remover|Jargon Remover}}, since plain wording is most of what makes an FAQ answer work.\n\nThe {{readability-grade-scorer|Readability Grade Scorer}} confirms the answers read at the level the audience wants, and the {{key-points-extractor|Key Points Extractor}} is a quick way to check that each answer contains the one fact it exists to deliver.`,
    faqs: [
      {
        q: "How many questions should an FAQ section have?",
        a: "Three to ten. Below three it is not yet a section; above ten it is a support page, which wants search and categories rather than a single list. The generator checks both ends.",
      },
      {
        q: "Why does it want a question starting with how, what or why?",
        a: "Because readers arrive with questions shaped that way. A section of statements with question marks answers nothing anyone typed; the coverage check asks for at least one question in the reader's own phrasing.",
      },
      {
        q: "What happens to a question with no answer?",
        a: "It renders with a TODO placeholder so the gap is visible rather than silent, and the checks list it. The generator supplies no answer text of its own.",
      },
      {
        q: "How long should one FAQ answer be?",
        a: "Two or three sentences, with the specific fact first. Past eighty words the check flags it as a page rather than an answer; exceptions and edge cases belong in a linked article.",
      },
      {
        q: "Does it detect duplicate questions?",
        a: "Yes, ignoring case and punctuation. Questions asking the same thing in different words are flagged with both texts, and the fix is to merge them into one entry.",
      },
    ],
  },
};
