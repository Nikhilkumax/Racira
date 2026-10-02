import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Batch B21, paraphrasing and rewriting part two: authored SEO entries for the
 * headline rewriter, the paragraph compressor, the email to formal letter
 * converter, the bullet to prose converter and the abstract generator.
 *
 * Two entries here — the letter converter and the abstract generator — assemble
 * a document rather than rephrase one, so the prose draws the same line every
 * batch does: the tool composes the writer's own words into a published shape
 * and checks the gaps, and it invents nothing. Keys are registry slugs; see
 * ../tool-seo.ts for the contract.
 */
export const B21_PARAPHRASING_SEO: Record<string, ToolSeo> = {
  "headline-rewriter": {
    keywords: ["headline rewriter", "headline angles", "clickbait", "headline length", "search results"],
    intro:
      "The headline rewriter composes five published headline angles from a subject and an action, then checks any headline you bring for headline length, clickbait phrasing, shouted words and repeats.",
    content: `The headline rewriter works from two fields because English headlines need two kinds of phrase. An action — write a better headline — feeds the how-to and list angles. A subject — headline writing — feeds the guide, mistakes and question angles. Splitting the input that way is what keeps the five outputs grammatical; a single free-text field would produce promises the patterns cannot keep. An optional audience is appended where the pattern takes it, and an optional number sets the count in the list and mistakes angles.

The five headline angles are deliberately different in kind rather than five wordings of one idea. How to is the plainest promise in the form. A numbered list sets a visible length, which is why it is easy to click and easy to write badly. A colon-and-noun guide signals a reference rather than a promise, which suits evergreen pages. A mistakes headline leans on fear of error, so it should be used only when the article names the mistakes plainly. A question works when the reader genuinely does not know, and fails when the answer is obvious.

The checker is the second half and the part most writers keep using. Paste a headline and it flags a character count that search results will truncate, a word count that has started explaining, a trailing period, any phrase from a published clickbait list, words in full capitals, and a word that appears twice. Each flag carries a sentence explaining the cost rather than merely naming the habit, because a rule you can argue with is a rule you can apply.

Headline length deserves its own note. Search results and social cards truncate, and the truncation point is a character count rather than a word count, which is why the check reports characters first. A headline can be short in words and still be cut, and the fix is usually to move the distinctive noun earlier rather than to delete an adjective. The check says how long the line is; only the writer can decide which words earn the front.

Nothing is uploaded and nothing is stored beyond the tab, so an unpublished title stays private. The rewriter composes from your words, the checker applies published rules, and neither knows whether the article delivers what the headline promises. That last judgement stays where it belongs.

It is worth rewriting a headline at the end of a draft rather than the start. Only then do you know which of the five angles the article actually supports, and a headline chosen after the fact tends to promise less and deliver more, which is the direction a headline should err.

Keep a file of the headlines you did not use. The five angles are generated from the same article, so the ones you rejected describe the piece you were writing when you started, and rereading them later is a quick way to see what the draft turned into. The checker is worth running over published work too: a title that still passes the length, clickbait and repeat checks months later is usually the one that earned its traffic honestly.\n\nFor subject lines in email the same discipline applies with different constraints; the {{email-subject-line-tester|Email Subject Line Tester}} scores those against their own rules.`,
    howTo: [
      { step: "Write the action as a verb phrase, e.g. write a better headline." },
      { step: "Write the subject as a noun phrase, e.g. headline writing." },
      { step: "Add an audience and a number if the angles you want use them." },
      { step: "Read the five candidate headlines and copy the one that fits the article." },
      { step: "Paste your chosen headline into the checker field and clear the flags." },
    ],
    whenToUse: `Use the headline rewriter when a draft is finished and the title is still the working one. Five angles from the same article is the fastest way to notice which promise the piece can actually keep, and the checks catch the habits that creep into a rushed title.\n\nFor email subject lines the constraints are different enough to deserve their own tool, and the {{email-subject-line-tester|Email Subject Line Tester}} scores length, trigger phrases and shouting for inboxes. When the page behind the headline is still being positioned, the {{value-proposition-builder|Value Proposition Builder}} is the better place to start.`,
    faqs: [
      {
        q: "Why are there two input fields instead of one?",
        a: "Because the five angles need different phrase types. The how-to and list angles need a verb phrase; the guide, mistakes and question angles need a noun phrase. Two fields keep every composed headline grammatical.",
      },
      {
        q: "What exactly does the checker flag?",
        a: "Characters past the truncation point, words past twelve, a trailing period, phrases from a published clickbait list, words in full capitals and a word repeated in the headline. Each flag explains the cost.",
      },
      {
        q: "Is the clickbait list a blocklist?",
        a: "It is a list of phrases that promise more than an article can easily deliver. A hit is a prompt to check the article, not a ban on the phrase.",
      },
      {
        q: "Does the rewriter write the headline for me?",
        a: "It composes five fixed patterns from your subject, action, audience and number. Every word in the output is yours; the tool supplies the shape.",
      },
      {
        q: "Is the text stored anywhere?",
        a: "No. Composition and checking run in the browser and nothing leaves the tab, so an unpublished title stays unpublished.",
      },
    ],
  },

  "paragraph-compressor": {
    keywords: ["paragraph compressor", "hedge words", "redundant pairs", "repeated sentences", "word count"],
    intro:
      "The paragraph compressor applies four documented cuts — hedge words, wordy phrases, redundant pairs and repeated sentences — and reports the word count before and after with every cut listed.",
    content: `The paragraph compressor makes four kinds of cut, and each one is published. Hedge words go first: phrases such as it is worth noting that, as a matter of fact and needless to say are removed because they postpone the point without adding information. Wordy phrases go second, using the shared table that replaces in order to with to and make a decision with decide. Redundant pairs go third, so advance planning becomes planning and basic fundamentals becomes fundamentals.

The fourth cut is the only one that removes a whole sentence, and it is measured rather than guessed. Each sentence is reduced to its content words — stop words removed — and compared with the sentences already kept using the Jaccard overlap of those word sets. When a sentence overlaps an earlier one by sixty per cent or more, it is dropped, and the report names both the sentence and the one it repeated so the deletion can be checked. That is how a repeated sentence is caught without a model deciding what the paragraph meant.

Every cut is listed with its kind, the text that was removed and what replaced it, so the compressed version is reproducible from the change list. The word count is reported before and after, together with the whole-number percentage removed, and a paragraph that yields no cuts says so plainly rather than pretending to have found something. A reduction under ten per cent comes with a note that the rest is content rather than padding.

The compressor never paraphrases a sentence or reorders an argument. It deletes hedges, applies a substitution table, trims duplicated words and drops exact repeats. That makes it safe to run on a draft whose meaning is settled and whose weight is not — which is most drafts in their third pass, after the structure has stopped moving.

The honest limit is context. A repeated sentence is sometimes deliberate, in a summary or a transition, and a hedge sometimes softens a claim that should be softened. The change list exists so those cases can be restored by hand, and the notes say so. Compression is a proposal, not an edit.

A note on repeated sentences: the overlap check runs after the earlier cuts, so hedging can push two sentences together that looked distinct before. That is deliberate — a sentence whose only distinguishing words were it is worth noting that was not carrying an argument of its own, and the drop is reported with its overlap so the judgement can be checked. When the repeated sentences are a deliberate refrain, restore them; a refrain is a device, not padding.

One more thing worth knowing: the overlap check is order sensitive, so the earlier sentence survives. If the later one is the better wording, keep the later and delete the earlier by hand.\n\nWhen a paragraph is long but has no filler to remove, the {{simplify-text-tool|Simplify Text Tool}} splits sentences at a documented seam instead, and the {{sentence-rewriter|Sentence Rewriter}} changes their shape where the rhythm is the problem.`,
    howTo: [
      { step: "Paste the paragraph you want to tighten." },
      { step: "Read the reduction figure and the before and after word counts." },
      { step: "Work down the change list and check each cut against your meaning." },
      { step: "Review the dropped sentences, which name the sentence each one repeated." },
      { step: "Copy the compressed version and keep the original beside it for a day." },
    ],
    whenToUse: `Use the paragraph compressor on a draft whose argument is settled and whose word count is not — the third pass, after structure has stopped moving. Hedges, redundant pairs and exact repeats are the cheapest weight a paragraph carries, and each cut is listed for review.\n\nWhen there is nothing to cut but the sentences are still heavy, the {{simplify-text-tool|Simplify Text Tool}} replaces wordy phrases and splits long sentences. Where the problem is a run of same-shaped sentences rather than length, the {{sentence-rewriter|Sentence Rewriter}} offers clause-order variants instead.`,
    faqs: [
      {
        q: "How does it decide two sentences say the same thing?",
        a: "Each sentence is reduced to its content words with stop words removed, then compared with the sentences already kept using the Jaccard overlap of those sets. Sixty per cent or more and the later sentence is dropped, with both sentences named.",
      },
      {
        q: "What counts as a hedge word?",
        a: "A published list of openers and qualifiers such as it is worth noting that, as a matter of fact, needless to say and for what it is worth. They postpone the point without adding information.",
      },
      {
        q: "Will it change my meaning?",
        a: "It never paraphrases or reorders a sentence. It removes listed hedges, applies a substitution table, trims documented redundant pairs and drops sentences that repeat an earlier one; every change is listed so it can be reversed.",
      },
      {
        q: "Why would a repeated sentence be deliberate?",
        a: "In a summary or a transition, repetition can be the structure. That is why the dropped sentence and the sentence it repeated are both named in the report rather than silently removed.",
      },
      {
        q: "Does it work on more than one paragraph?",
        a: "Yes. The cuts apply to the whole text and the counts are totals, though the overlap check is most useful within a paragraph. The compressed version can be copied or downloaded as plain text.",
      },
    ],
  },

  "email-to-formal-letter-converter": {
    keywords: ["email to formal letter", "salutation", "valediction", "contractions", "signature line"],
    intro:
      "The email to formal letter converter rewrites the salutation and the valediction, expands contractions, replaces listed casual phrasing and removes emoji, listing every substitution it makes.",
    content: `The email to formal letter converter turns a casual message into a letter, and it treats the three parts of a letter separately. The salutation is rewritten from whatever opened the message: Hi Sam becomes Dear Sam, and the reader's name is kept exactly as written. When no greeting line exists at all, Dear Sir or Madam is added and the writer is told to replace it.

The valediction is found rather than assumed. The sign-off can sit on the last line or one or two lines above a typed name, so the converter checks the last few non-empty lines for a closing such as Thanks, Cheers, Best or Take care, and replaces the whole block with Yours sincerely plus a signature line. The signature is taken from the typed name when there is one, from the sender field when it is filled, and left as a placeholder otherwise. A message with no sign-off gets one, and a note saying it was added.

Between the two, the body is edited mechanically. Contractions are expanded from a published table — can't to cannot, it's to it is — because a letter does not contract. Casual phrasing is replaced from a second table, and the first-person openers carry their own pronoun so I just wanted to becomes I am writing to rather than producing a doubled I. Emoji are removed and runs of exclamation marks are reduced, and both are counted in the change list.

Every substitution is listed with the source text, the replacement and a sentence explaining why the change belongs in a letter. The body itself is never restructured: no sentence is reordered, no paragraph is split and no argument is rewritten. A letter that needs a different argument needs a writer, and the notes say so instead of pretending the conversion is editorial work.

The register rules are worth stating plainly. Contractions, phrasal verbs and emoji are markers of speech, and a printed letter carries almost none of them. The converter removes the markers it can see and names the ones it cannot. What it cannot do is decide whether the letter should be formal at all — a note to a colleague may be better left as a message.

Two parts of a letter are outside the converter's reach and worth checking by hand: the date and the recipient's address block. A formal letter usually carries both, and neither can be inferred from a message. The salutation and the signature line are handled because they are the parts a reader notices first; the block above them is a convention the writer supplies.

Use it when the content is settled and only the packaging is wrong: a complaint, an application, a formal request that began life as an email. Read the result once for the salutation and the signature line, which are the parts a reader notices first, then copy or download it.\n\nWhen the letter is right but the tone is still too casual, the {{formality-adjuster|Formality Adjuster}} moves the word choice further toward the formal register. When the message is better rebuilt from a template, the {{email-template-library|Email Template Library}} starts from a fixed shape instead.`,
    howTo: [
      { step: "Paste the casual message, keeping its greeting and sign-off lines." },
      { step: "Fill the sender field so the signature line is complete." },
      { step: "Read the letter and check the salutation and the signature line first." },
      { step: "Work through the substitution list and clear the notes." },
      { step: "Copy or download the letter and read it once aloud." },
    ],
    whenToUse: `Use the email to formal letter converter when the content of a message is right and its packaging is wrong — a request, a complaint or an application that began as an email to a colleague and now has to be a letter. The salutation, the valediction and the contract-free register are handled in one pass.\n\nWhen the letter is structurally fine but the word choice still reads too casually, the {{formality-adjuster|Formality Adjuster}} moves specific expressions in one direction. When a letter has to follow a house shape instead, the {{email-template-library|Email Template Library}} starts from a fixed template with named placeholders.`,
    faqs: [
      {
        q: "How is the sign-off found?",
        a: "The last three non-empty lines are checked for a closing such as Thanks, Cheers, Best or Take care. The whole block is replaced with Yours sincerely plus a signature, and the typed name above it becomes the signature when the sender field is empty.",
      },
      {
        q: "Why does the converter expand contractions?",
        a: "Because a printed letter does not contract. Can't becomes cannot and it's becomes it is, from a published table, and each expansion is listed so it can be reviewed.",
      },
      {
        q: "Does it rewrite the body of the message?",
        a: "No. It replaces listed casual phrases and expands contractions, and it never reorders or restructures a sentence. If the argument needs changing, that is a writer's job, and the notes say so.",
      },
      {
        q: "What happens to emoji and exclamation marks?",
        a: "Emoji are removed and runs of exclamation marks are reduced to one, both counted in the change list. Single exclamation marks are left, since they are a matter of taste rather than register.",
      },
      {
        q: "What if the message has no greeting or sign-off?",
        a: "Both are added — Dear Sir or Madam and Yours sincerely with a signature line — and the notes tell you to replace the placeholder salutation with the reader's name.",
      },
    ],
  },

  "bullet-to-prose-converter": {
    keywords: ["bullet to prose", "bullet list", "connectors", "topic sentence", "scannable"],
    intro:
      "The bullet to prose converter joins a bullet list into a paragraph — or into a single sentence when the items are short — and flags the bullets prose will not carry.",
    content: `The bullet to prose converter turns a list into running text, and it offers two published shapes. One sentence per bullet is the default: each item is stripped of its marker and trailing punctuation, capitalised and given a full stop, and an optional fixed connector sequence — First, Next, Then, After that, Finally — can open the later sentences so the paragraph has direction without invented transitions. The single-sentence shape joins short items with commas and a final and, which is how a list reads inside one sentence.

The parser accepts the markers people actually type: hyphens, asterisks, round and square bullets, and numbered or lettered items with a full stop or a bracket. Markers and trailing punctuation are removed, blank lines are skipped, and each item's word count is reported. That count is what drives the flags, because prose fails in predictable ways at predictable lengths.

Three flags are published. A bullet past twenty-five words will read as a paragraph inside the paragraph, so it is flagged and the advice is to split it before converting. A bullet of two words or fewer, or one that ends with a colon, is really a heading rather than a sentence, and prose needs a verb. A duplicate bullet is dropped and named, since a list can carry a repetition that a paragraph cannot.

The honest limit is that a bullet list is not merely a paragraph in disguise. Each item is visibly equal and separately scannable, which is why procedures, options and specifications are written as lists in the first place. Converting to prose suits a discussion, a summary or a narrative where the items are related by argument rather than by position. The page says that plainly rather than presenting prose as the more finished form.

Copies are cheap: the result is a single paragraph or sentence with a copy button, and the bullet count and sentence count are reported so the shape of the conversion is visible. Nothing is uploaded and nothing is stored beyond the tab.

Keep the list when a reader has to find one item quickly; convert when a reader has to follow an argument.

The connectors are the most misused part of the tool, which is why they are off by default. A fixed sequence — First, Next, Then, After that, Finally — gives an assembled paragraph a direction, and it can also make a list of equal items sound like a process with stages it does not have. Turn them on when the bullets really are steps or a sequence of reasons, and leave them off when the items are parallel points in an argument.

The first sentence is the one place the conversion can improve on the list. If the list had a preamble — a line ending in a colon that introduced it — that line is usually the topic sentence the paragraph needs, and it is worth pasting it in front of the joined sentences by hand. The converter cannot supply it, because the preamble is a claim about the items rather than one of them.\n\nWhen the paragraph is composed and still reads heavily, the {{sentence-rewriter|Sentence Rewriter}} and the {{simplify-text-tool|Simplify Text Tool}} take the next pass, and when the items are really sections, the {{outline-builder|Outline Builder}} keeps them as structure instead.`,
    howTo: [
      { step: "Paste the bullet list, one item per line, with or without markers." },
      { step: "Choose one sentence per bullet or a single sentence." },
      { step: "Turn on the connector sequence if the paragraph needs direction." },
      { step: "Read the flags and split or rename the bullets prose will not carry." },
      { step: "Copy the paragraph and check it against the list for lost emphasis." },
    ],
    whenToUse: `Use the bullet to prose converter when a list exists because the draft was assembled rather than written — meeting notes, research notes, a feature list that now has to read as a discussion. The conversion preserves every item and reports the ones that will not survive as sentences.\n\nWhen the items are headings rather than sentences, the {{outline-builder|Outline Builder}} is the honest destination. When the paragraph that comes out is heavy, the {{simplify-text-tool|Simplify Text Tool}} and the {{sentence-rewriter|Sentence Rewriter}} take the next pass over it.`,
    faqs: [
      {
        q: "Which bullet markers are accepted?",
        a: "Hyphens, asterisks, round and square bullets, and numbered or lettered items followed by a full stop or bracket. Blank lines are ignored and trailing punctuation is removed.",
      },
      {
        q: "When should I keep the list instead?",
        a: "Whenever a reader has to find one item quickly. A list makes items visibly equal and separately scannable; prose suits a discussion where the items relate by argument rather than by position.",
      },
      {
        q: "What does the connector sequence do?",
        a: "It opens the later sentences with First, Next, Then, After that and Finally, so a paragraph assembled from notes has direction without inventing a transition that means something.",
      },
      {
        q: "What makes a bullet unsuitable for prose?",
        a: "More than twenty-five words, two words or fewer, or a trailing colon: the first reads as a paragraph inside the paragraph, and the others are headings rather than sentences because they lack a verb.",
      },
      {
        q: "Are duplicate bullets removed?",
        a: "Yes, and the duplicate is named in the report. A list can survive a repetition that a paragraph cannot, so the drop is reported rather than silent.",
      },
    ],
  },

  "abstract-generator": {
    keywords: ["abstract generator", "structured abstract", "background", "methods", "results"],
    intro:
      "The abstract generator assembles your five parts in IMRaD order — background, objective, methods, results and conclusions — and checks the abstract against a word band and a short list of structural rules.",
    content: `The abstract generator asks for five parts and assembles them in the order a reader expects: background, objective, methods, results and conclusions. Filling them in separately is the discipline the tool is really teaching. A reader who meets the objective before the methods knows what the study was for; a reader who meets the methods without an objective is reading procedure with no question attached. The parts are labels on your sentences, not prompts for new ones.

The structured and unstructured shapes come from the same five parts. Structured, each part is prefixed with its label, which is what most clinical and scientific journals ask for. Unstructured, the labels are dropped and the sentences are joined into one paragraph, which is common in the humanities and in general-interest summaries. Switching between them is one checkbox, and the word count does not change because nothing is added or removed.

The checks are the things a rule can genuinely judge. A missing part is named, since an abstract is read as a whole and a gap is noticed immediately. Methods shorter than fifteen words are flagged, because a reader needs the design, the sample and the analysis in one or two sentences. Results with no figure in them are flagged, because an abstract without a number gives the reader nothing to weigh. A conclusions part longer than the results is flagged, since the findings should be the heavier half. And the total is checked against the chosen band, which defaults to the usual one hundred and fifty to two hundred and fifty words.

Three bands are offered because abstracts are not all the same length. A short note may want one hundred to one hundred and fifty words; a review article may be allowed two hundred and fifty to three hundred and fifty. The band is a target rather than a rule, and the check reports how far the draft is from it in words rather than in judgement.

Nothing is written for you. Every sentence in the output is one you typed, reordered into a published shape with the labels applied. The generator cannot judge whether the sample is adequate or the conclusion follows, and the limits panel says so.

Write the parts at the end of the work, from the results upwards: conclusions first, then results, then methods, then the objective and background. An abstract written in that order tends to describe the study that was done rather than the one that was planned.

A structured abstract is not a longer abstract; it is the same abstract with its parts labelled. Journals ask for the labels because a reviewer reading many abstracts in a day can find the design and the sample in seconds. If your venue accepts either shape, the labelled version is usually the safer submission: it costs nothing in words and saves the reader a search.\n\nWhen the objective itself is still loose, the {{thesis-statement-builder|Thesis Statement Builder}} tightens the claim the paper makes, and the {{argument-mapping-tool|Argument Mapping Tool}} lays out the reasons and evidence behind it before the abstract is written.`,
    howTo: [
      { step: "Fill the objective and methods first — they carry the abstract's weight." },
      { step: "Add the background, then the results with their figures, then the conclusions." },
      { step: "Choose the word band your venue uses and the structured or unstructured shape." },
      { step: "Work through the checks until every part is filled and inside the band." },
      { step: "Copy the abstract into the manuscript and reread it against the paper itself." },
    ],
    whenToUse: `Use the abstract generator once the paper is drafted and its parts are settled: the five labels are the fastest way to see whether the study can be summarised at all, and the checks catch the missing figure or the oversized conclusion that reviewers notice first.\n\nWhen the central claim is still moving, start with the {{thesis-statement-builder|Thesis Statement Builder}}; when the supporting reasons need arranging, the {{argument-mapping-tool|Argument Mapping Tool}} maps them before any abstract is written.`,
    faqs: [
      {
        q: "What is the difference between a structured and an unstructured abstract?",
        a: "A structured abstract prefixes each part with its label — Background, Methods, Results and so on — which most scientific and clinical journals require. An unstructured abstract drops the labels and runs the same sentences together as one paragraph.",
      },
      {
        q: "Why does the tool flag results without numbers?",
        a: "Because an abstract is usually the only part a reader sees before deciding whether to read the paper, and a results section with no figure in it gives that reader nothing to weigh.",
      },
      {
        q: "Which word band should I choose?",
        a: "Whichever your venue specifies. The default is one hundred and fifty to two hundred and fifty words; a short note may ask for one hundred to one hundred and fifty, and a review article may allow two hundred and fifty to three hundred and fifty.",
      },
      {
        q: "Does the generator write the abstract?",
        a: "No. Every sentence is yours; the tool orders the five parts, applies the labels, counts the words and runs the structural checks. It cannot judge whether the study is sound.",
      },
      {
        q: "Why is a conclusion longer than the results a problem?",
        a: "Because the findings are the substance of an abstract and the conclusion is what follows from them. When the conclusion outweighs the results, a reader suspects the study produced less than the summary claims.",
      },
    ],
  },
};
