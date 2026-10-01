/**
 * Phrase detectors: clichés, redundancies and wordy expressions.
 *
 * Each is a curated list matched literally and case-insensitively — there is no
 * model and no scoring. The lists are the whole point, so they are published in
 * this file and the tool pages show the count they found and the reason each
 * entry is on the list. Wordiness additionally carries a suggested replacement,
 * and `simplifyWordiness` applies them to produce a tightened copy.
 *
 * Matching rules:
 *   - whole phrases only, with word boundaries, so "to" never matches "today";
 *   - longer phrases win over shorter ones at the same position;
 *   - overlapping matches are dropped, keeping the earliest;
 *   - the displayed phrase is the source text, so capitalisation is preserved.
 */

export interface PhraseEntry {
  /** Lowercase phrase as it is matched. */
  phrase: string;
  /** Why the phrase is worth a second look. */
  note: string;
  /** Concise alternative, for the wordiness list only. */
  replacement?: string;
}

export interface PhraseMatch {
  /** The source text as matched (capitalisation preserved). */
  source: string;
  /** Lowercase canonical form. */
  phrase: string;
  note: string;
  replacement?: string;
  index: number;
  end: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Longest-first so "in order to" beats "order to" at the same offset. */
function buildMatcher(entries: readonly PhraseEntry[]): RegExp | null {
  if (entries.length === 0) return null;
  const alternatives = [...entries]
    .map((entry) => entry.phrase)
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .map(escapeRegExp);
  return new RegExp(`\\b(?:${alternatives.join("|")})\\b`, "gi");
}

/** Every non-overlapping match of `entries` in `text`, in document order. */
export function findPhraseMatches(text: string, entries: readonly PhraseEntry[]): PhraseMatch[] {
  const pattern = buildMatcher(entries);
  if (!pattern || text.length === 0) return [];
  const lookup = new Map(entries.map((entry) => [entry.phrase, entry]));

  const found: PhraseMatch[] = [];
  let lastEnd = -1;
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index < lastEnd) continue; // drop overlaps
    const entry = lookup.get(match[0].toLowerCase());
    if (!entry) continue;
    found.push({
      source: match[0],
      phrase: entry.phrase,
      note: entry.note,
      replacement: entry.replacement,
      index: match.index,
      end: match.index + match[0].length,
    });
    lastEnd = match.index + match[0].length;
    if (match.index === pattern.lastIndex) pattern.lastIndex += 1; // zero-width guard
  }
  return found;
}

/** Tired expressions that have lost their force through overuse. */
export const CLICHES: readonly PhraseEntry[] = [
  { phrase: "at the end of the day", note: "Filler that usually introduces a summary you could state directly." },
  { phrase: "at this moment in time", note: "A wordy way of saying now." },
  { phrase: "avoid like the plague", note: "Stock simile; say what you actually mean about the risk." },
  { phrase: "back to square one", note: "Idiom so common it no longer lands." },
  { phrase: "ballpark figure", note: "Informal and vague; give a range instead." },
  { phrase: "beat around the bush", note: "Describes evasion instead of getting to the point." },
  { phrase: "best thing since sliced bread", note: "Hyperbole worn smooth by repetition." },
  { phrase: "bite the bullet", note: "Idiom; name the decision instead." },
  { phrase: "blessing in disguise", note: "Stock phrase for a reversal." },
  { phrase: "burn the midnight oil", note: "Idiom for working late." },
  { phrase: "by the same token", note: "Formal filler for a simple contrast." },
  { phrase: "calm before the storm", note: "Stock metaphor; describe the quiet before the event instead." },
  { phrase: "circle back", note: "Business jargon for returning to a topic." },
  { phrase: "cold feet", note: "Idiom for hesitation." },
  { phrase: "crystal clear", note: "Intensified adjective that adds nothing to clear." },
  { phrase: "cut to the chase", note: "Idiom; just make the point." },
  { phrase: "deep dive", note: "Jargon for a detailed look." },
  { phrase: "dime a dozen", note: "Idiom for something common." },
  { phrase: "each and every", note: "Doubled determiner; every is enough." },
  { phrase: "easy as pie", note: "Stock simile." },
  { phrase: "every cloud has a silver lining", note: "Proverb used as a placeholder for optimism." },
  { phrase: "few and far between", note: "Idiom for rare." },
  { phrase: "first and foremost", note: "Doubled; first carries the meaning." },
  { phrase: "for all intents and purposes", note: "Wordy qualifier; use effectively or in effect." },
  { phrase: "from the get-go", note: "Informal idiom for from the start." },
  { phrase: "game changer", note: "Overused label for a significant change." },
  { phrase: "get the ball rolling", note: "Idiom for beginning." },
  { phrase: "give 110 percent", note: "Impossible figure used as a cliché." },
  { phrase: "go the extra mile", note: "Idiom for extra effort." },
  { phrase: "going forward", note: "Corporate filler for from now on." },
  { phrase: "hit the ground running", note: "Idiom for starting quickly." },
  { phrase: "in the nick of time", note: "Idiom for just in time." },
  { phrase: "in this day and age", note: "Wordy for today." },
  { phrase: "it goes without saying", note: "Then do not say it." },
  { phrase: "last but not least", note: "Formulaic list closer." },
  { phrase: "leave no stone unturned", note: "Idiom for thoroughness." },
  { phrase: "low-hanging fruit", note: "Business metaphor for easy wins." },
  { phrase: "move the needle", note: "Business jargon for making a difference." },
  { phrase: "needle in a haystack", note: "Stock simile." },
  { phrase: "no pain no gain", note: "Proverb used as filler." },
  { phrase: "on the same page", note: "Idiom for agreement." },
  { phrase: "only time will tell", note: "Placeholder that defers the point." },
  { phrase: "out of the blue", note: "Idiom for unexpectedly." },
  { phrase: "outside the box", note: "Jargon for original thinking." },
  { phrase: "paradigm shift", note: "Overused term for a change in approach." },
  { phrase: "piece of cake", note: "Informal idiom for easy." },
  { phrase: "push the envelope", note: "Idiom for testing limits." },
  { phrase: "raise the bar", note: "Idiom for setting a higher standard." },
  { phrase: "raining cats and dogs", note: "Stock simile for heavy rain." },
  { phrase: "see eye to eye", note: "Idiom for agreeing." },
  { phrase: "state of the art", note: "Marketing phrase for current." },
  { phrase: "the bottom line is", note: "Filler that delays the point it introduces." },
  { phrase: "the elephant in the room", note: "Overused metaphor for an unspoken problem." },
  { phrase: "the fact of the matter is", note: "Four words of throat-clearing." },
  { phrase: "think outside the box", note: "The phrase itself is the box." },
  { phrase: "time and time again", note: "Emphatic filler for repeatedly." },
  { phrase: "tip of the iceberg", note: "Stock metaphor for a partial view." },
  { phrase: "touch base", note: "Business jargon for making contact." },
  { phrase: "under the weather", note: "Idiom for unwell." },
  { phrase: "value-add", note: "Jargon for a benefit." },
  { phrase: "when all is said and done", note: "Filler that precedes a summary." },
  { phrase: "when push comes to shove", note: "Idiom for in a crisis." },
  { phrase: "with that being said", note: "Filler transition; but or yet is shorter." },
  { phrase: "without a shadow of a doubt", note: "Stacked intensifiers for certainly." },
];

/** Phrases whose second word repeats the first one's meaning. */
export const REDUNDANCIES: readonly PhraseEntry[] = [
  { phrase: "absolutely essential", note: "Essential already means absolutely necessary." },
  { phrase: "added bonus", note: "A bonus is by definition added." },
  { phrase: "advance planning", note: "Planning happens in advance by definition." },
  { phrase: "advance warning", note: "A warning is given in advance." },
  { phrase: "basic fundamentals", note: "Fundamentals are basic." },
  { phrase: "brief summary", note: "A summary is brief by nature." },
  { phrase: "close proximity", note: "Proximity already means closeness." },
  { phrase: "collaborate together", note: "Collaborating is working together." },
  { phrase: "completely eliminate", note: "Eliminate is already complete." },
  { phrase: "current status", note: "Status is the current state." },
  { phrase: "empty space", note: "Space that is not empty is not space." },
  { phrase: "end result", note: "A result is at the end." },
  { phrase: "exact same", note: "Same already means exact." },
  { phrase: "false pretense", note: "A pretense is false by definition." },
  { phrase: "few in number", note: "Few already covers number." },
  { phrase: "final conclusion", note: "A conclusion is final." },
  { phrase: "final outcome", note: "An outcome is the final state." },
  { phrase: "first began", note: "Beginnings only happen once." },
  { phrase: "free gift", note: "A gift is free." },
  { phrase: "future plans", note: "Plans are about the future." },
  { phrase: "general consensus", note: "A consensus is general." },
  { phrase: "join together", note: "Joining means coming together." },
  { phrase: "knowledgeable experts", note: "Experts are knowledgeable by definition." },
  { phrase: "major breakthrough", note: "A breakthrough is already significant." },
  { phrase: "merge together", note: "Merging is joining." },
  { phrase: "mutual cooperation", note: "Cooperation is mutual." },
  { phrase: "new innovation", note: "An innovation is new by definition." },
  { phrase: "null and void", note: "Two words for the same legal state." },
  { phrase: "over and over again", note: "Again is implied by over and over." },
  { phrase: "past history", note: "History is in the past." },
  { phrase: "personal opinion", note: "An opinion is personal." },
  { phrase: "plan ahead", note: "Planning is ahead-looking." },
  { phrase: "postpone until later", note: "Postponing is deferring to later." },
  { phrase: "protest against", note: "To protest is to be against." },
  { phrase: "repeat again", note: "Repeating is doing it again." },
  { phrase: "return back", note: "Returning is coming back." },
  { phrase: "same identical", note: "Two synonyms stacked." },
  { phrase: "small in size", note: "Small already describes size." },
  { phrase: "still remains", note: "Remaining is still being there." },
  { phrase: "sudden impulse", note: "An impulse is sudden by definition." },
  { phrase: "totally unique", note: "Unique admits no degrees." },
  { phrase: "twelve noon", note: "Noon is twelve." },
  { phrase: "unexpected surprise", note: "A surprise is unexpected." },
  { phrase: "very unique", note: "Unique admits no degrees." },
  { phrase: "atm machine", note: "The M in ATM stands for machine." },
  { phrase: "hiv virus", note: "The V in HIV stands for virus." },
  { phrase: "isbn number", note: "The N in ISBN stands for number." },
  { phrase: "lcd display", note: "The D in LCD stands for display." },
  { phrase: "pin number", note: "The N in PIN stands for number." },
];

/** Wordy expressions with a shorter, usually plainer equivalent. */
export const WORDY_PHRASES: readonly PhraseEntry[] = [
  { phrase: "a large number of", note: "Wordy quantifier.", replacement: "many" },
  { phrase: "a small number of", note: "Wordy quantifier.", replacement: "a few" },
  { phrase: "are able to", note: "Wordy modal; can is shorter and plainer.", replacement: "can" },
  { phrase: "as a matter of fact", note: "Filler phrase.", replacement: "in fact" },
  { phrase: "as a result of", note: "Wordy preposition.", replacement: "because of" },
  { phrase: "at all times", note: "Wordy adverb.", replacement: "always" },
  { phrase: "at the present time", note: "Wordy adverb.", replacement: "now" },
  { phrase: "at this point in time", note: "Wordy adverb.", replacement: "now" },
  { phrase: "by means of", note: "Wordy preposition.", replacement: "by" },
  { phrase: "come to the conclusion", note: "Wordy verb; one plainer verb says the same thing.", replacement: "conclude" },
  { phrase: "commence", note: "Formal verb with a plainer equivalent.", replacement: "start" },
  { phrase: "despite the fact that", note: "Wordy conjunction.", replacement: "although" },
  { phrase: "due to the fact that", note: "Wordy conjunction.", replacement: "because" },
  { phrase: "each and every", note: "Doubled determiner.", replacement: "every" },
  { phrase: "endeavour", note: "Formal verb with a plainer equivalent.", replacement: "try" },
  { phrase: "first and foremost", note: "Doubled adverb.", replacement: "first" },
  { phrase: "for the most part", note: "Wordy adverb.", replacement: "mostly" },
  { phrase: "for the purpose of", note: "Wordy preposition.", replacement: "for" },
  { phrase: "for the reason that", note: "Wordy conjunction.", replacement: "because" },
  { phrase: "give consideration to", note: "Wordy verb; one plainer verb says the same thing.", replacement: "consider" },
  { phrase: "has the ability to", note: "Wordy modal; can is shorter and plainer.", replacement: "can" },
  { phrase: "have a tendency to", note: "Wordy verb; one plainer verb says the same thing.", replacement: "tend to" },
  { phrase: "in excess of", note: "Wordy preposition.", replacement: "more than" },
  { phrase: "in light of the fact that", note: "Wordy conjunction.", replacement: "because" },
  { phrase: "in my opinion", note: "Filler phrase that weakens the claim it introduces.", replacement: "" },
  { phrase: "in order to", note: "Wordy infinitive marker.", replacement: "to" },
  { phrase: "in relation to", note: "Wordy preposition.", replacement: "about" },
  { phrase: "in spite of the fact that", note: "Wordy conjunction.", replacement: "although" },
  { phrase: "in terms of", note: "Often replaceable with a simpler preposition.", replacement: "" },
  { phrase: "in the absence of", note: "Wordy preposition.", replacement: "without" },
  { phrase: "in the amount of", note: "Wordy preposition.", replacement: "for" },
  { phrase: "in the case of", note: "Wordy preposition.", replacement: "for" },
  { phrase: "in the course of", note: "Wordy preposition.", replacement: "during" },
  { phrase: "in the event that", note: "Wordy conjunction.", replacement: "if" },
  { phrase: "in the first instance", note: "Wordy adverb.", replacement: "first" },
  { phrase: "in the majority of cases", note: "Wordy adverb.", replacement: "usually" },
  { phrase: "in the near future", note: "Wordy adverb.", replacement: "soon" },
  { phrase: "in the process of", note: "Wordy construction.", replacement: "currently" },
  { phrase: "in the vicinity of", note: "Wordy preposition.", replacement: "near" },
  { phrase: "in view of the fact that", note: "Wordy conjunction.", replacement: "because" },
  { phrase: "is able to", note: "Wordy modal; can is shorter and plainer.", replacement: "can" },
  { phrase: "it is important to note that", note: "Throat-clearing before the point.", replacement: "note that" },
  { phrase: "it is my belief that", note: "Wordy opinion frame.", replacement: "i believe" },
  { phrase: "it should be noted that", note: "Throat-clearing before the point.", replacement: "note that" },
  { phrase: "make a decision", note: "Wordy verb; one plainer verb says the same thing.", replacement: "decide" },
  { phrase: "make an assumption", note: "Wordy verb; one plainer verb says the same thing.", replacement: "assume" },
  { phrase: "needless to say", note: "Filler phrase.", replacement: "" },
  { phrase: "numerous", note: "Formal quantifier.", replacement: "many" },
  { phrase: "on a daily basis", note: "Wordy adverb.", replacement: "daily" },
  { phrase: "on a regular basis", note: "Wordy adverb.", replacement: "regularly" },
  { phrase: "on the grounds that", note: "Wordy conjunction.", replacement: "because" },
  { phrase: "owing to the fact that", note: "Wordy conjunction.", replacement: "because" },
  { phrase: "prior to", note: "Formal preposition.", replacement: "before" },
  { phrase: "provide assistance to", note: "Wordy verb; one plainer verb says the same thing.", replacement: "help" },
  { phrase: "subsequent to", note: "Formal preposition.", replacement: "after" },
  { phrase: "sufficient", note: "Formal determiner.", replacement: "enough" },
  { phrase: "take into consideration", note: "Wordy verb; one plainer verb says the same thing.", replacement: "consider" },
  { phrase: "terminate", note: "Formal verb with a plainer equivalent.", replacement: "end" },
  { phrase: "the vast majority of", note: "Wordy quantifier.", replacement: "most" },
  { phrase: "there is no doubt that", note: "Wordy qualifier.", replacement: "undoubtedly" },
  { phrase: "utilise", note: "Formal verb with a plainer equivalent.", replacement: "use" },
  { phrase: "utilize", note: "Formal verb with a plainer equivalent.", replacement: "use" },
  { phrase: "with regard to", note: "Wordy preposition.", replacement: "about" },
  { phrase: "with respect to", note: "Wordy preposition.", replacement: "about" },
  { phrase: "with the exception of", note: "Wordy preposition.", replacement: "except" },
];

export function findCliches(text: string): PhraseMatch[] {
  return findPhraseMatches(text, CLICHES);
}

export function findRedundancies(text: string): PhraseMatch[] {
  return findPhraseMatches(text, REDUNDANCIES);
}

export function findWordiness(text: string): PhraseMatch[] {
  return findPhraseMatches(text, WORDY_PHRASES);
}

export interface SimplifyResult {
  /** The text with each wordy phrase replaced, in document order. */
  output: string;
  replacements: PhraseMatch[];
}

/**
 * Apply a set of matches left to right. A phrase with an empty replacement is
 * removed and the surrounding spacing tidied, so "in my opinion the plan"
 * becomes "the plan" rather than " the plan". Shared with the jargon remover so
 * both tools behave identically on deletions and capitalisation.
 */
export function applyPhraseReplacements(
  text: string,
  matches: readonly PhraseMatch[],
): { output: string } {
  if (matches.length === 0) return { output: text };

  let output = "";
  let cursor = 0;
  for (const match of matches) {
    const replacement = match.replacement ?? match.source;
    output += text.slice(cursor, match.index) + replacement;
    cursor = match.end;
    // A deleted phrase takes the space that followed it, so the sentence does
    // not begin with a stray gap.
    if (replacement === "") {
      while (cursor < text.length && (text[cursor] === " " || text[cursor] === "\t")) cursor += 1;
    }
  }
  output += text.slice(cursor);

  // Tidy the spacing left behind by deletions, and square the capitalisation
  // of a sentence that now begins with a lowercase replacement.
  output = output
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([,.;:!?])/g, "$1")
    .replace(/(^|[.!?]\s+)([a-z])/g, (_all, lead: string, letter: string) => lead + letter.toUpperCase());

  return { output };
}

/** Wordiness replacements applied to the text, with the list of changes. */
export function simplifyWordiness(text: string): SimplifyResult {
  const matches = findWordiness(text);
  return { output: applyPhraseReplacements(text, matches).output, replacements: matches };
}
