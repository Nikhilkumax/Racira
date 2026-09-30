/**
 * English syllable counting — the input every readability formula needs.
 *
 * There is no dictionary of syllable counts in this bundle and no network call
 * to fetch one, so this is a documented heuristic, not an oracle. The rules are
 * the standard ones used by readability tooling:
 *
 *   1. count vowel groups ("aeiouy", y included), so "beautiful" starts at four;
 *   2. a silent final "e" is removed ("make" → 1), except after a consonant + "l"
 *      ("table" → 2) and except for the "ed"/"es" endings that add no syllable
 *      ("walked" → 1, "makes" → 1, but "wanted" → 2 and "watches" → 2);
 *   3. adverbs in "-ely" lose the vowel that the y-group double-counted
 *      ("likely" → 2, not 3);
 *   4. a curated exception table repairs the words where vowel adjacency defeats
 *      rule 1 — hiatus words such as "idea" (3, not 2), "science" (2, not 1),
 *      "business" (2, not 3) and the like.
 *
 * Numbers count as one syllable, and a token with no letters at all counts as
 * zero. Words from languages other than English are still estimated by rule 1,
 * which the UI states; proper nouns, brand names and abbreviations are the main
 * sources of error and are the reason every readability readout here is labelled
 * an estimate against a stated formula.
 */

const VOWELS = "aeiouy";

/** Curated repairs for words the vowel-group rules get wrong (all English). */
const EXCEPTIONS: Record<string, number> = {
  // Hiatus: two adjacent vowels pronounced as separate syllables.
  area: 3,
  areas: 3,
  idea: 3,
  ideas: 3,
  ideal: 3,
  realize: 3,
  realizes: 3,
  create: 2,
  created: 3,
  creates: 2,
  creating: 3,
  creative: 3,
  creation: 3,
  science: 2,
  sciences: 3,
  scientific: 4,
  client: 2,
  clients: 2,
  diet: 2,
  quiet: 2,
  quietest: 3,
  radio: 3,
  video: 3,
  piano: 3,
  poem: 2,
  poems: 2,
  poet: 2,
  poetry: 3,
  being: 2,
  theory: 3,
  theories: 3,
  cereal: 3,
  // Silent letters and suffix quirks the rules cannot see.
  business: 2,
  businesses: 3,
  colonel: 2,
  queue: 1,
  queues: 1,
  language: 2,
  languages: 3,
  interest: 2,
  interested: 3,
  mileage: 3,
  silhouette: 3,
  // Vowel clusters the grouping rule counts as one syllable but speech splits.
  pronunciation: 5,
  miscellaneous: 5,
  aquarium: 4,
  media: 3,
  trivia: 3,
  stadium: 3,
  symposium: 4,
  monopoly: 4,
  // Greek roots whose "eo" is two syllables ("ge-o"). The exception table is
  // used rather than a "geo" prefix rule so "George" stays one syllable.
  geography: 4,
  geographic: 4,
  geographical: 5,
  geographer: 4,
  geology: 4,
  geological: 5,
  geologist: 4,
  geometry: 4,
  geometric: 4,
  geometrical: 5,
  // Words whose "-ed" is pronounced as its own syllable.
  naked: 2,
  sacred: 2,
  wicked: 2,
  rugged: 2,
};

/**
 * Prefixes whose syllable count the vowel-group rules get wrong: "every" looks
 * like three groups and "bio" looks like one. Both are fixed splits in English
 * ("every-thing" = 3, "bi-ol-ogy" = 4).
 */
const PREFIX_SYLLABLES: { prefix: string; syllables: number }[] = [
  { prefix: "every", syllables: 2 },
  { prefix: "bio", syllables: 2 },
];

/** Lowercase the word and strip everything that is not an ASCII letter. */
function toLetters(word: string): string {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

/** Count vowel groups in a letters-only string. */
function vowelGroups(letters: string): number {
  let count = 0;
  let previousWasVowel = false;
  for (const char of letters) {
    const isVowel = VOWELS.includes(char);
    if (isVowel && !previousWasVowel) count += 1;
    previousWasVowel = isVowel;
  }
  return count;
}

/** True when the final "ed" is not its own syllable ("walked", "asked"). */
function silentEd(letters: string): boolean {
  if (!letters.endsWith("ed")) return false;
  const before = letters[letters.length - 3];
  // "wanted", "needed", "landed" all pronounce the -ed; "walked" does not.
  return before !== undefined && before !== "t" && before !== "d";
}

/** True when the final "es" is not its own syllable ("makes", "hopes"). */
function silentEs(letters: string): boolean {
  if (!letters.endsWith("es")) return false;
  // "-ies" is the plural of "-y" and keeps its single syllable ("cities").
  if (letters.endsWith("ies")) return false;
  const before = letters[letters.length - 3];
  if (before === undefined) return false;
  // Sibilants keep the extra syllable: "houses", "boxes", "watches".
  if ("sxzcg".includes(before)) return false;
  if (/(?:ch|sh)es$/.test(letters)) return false;
  return true;
}

/**
 * Syllables in one word. Returns 0 for a token with no letters and no digits.
 * This is an estimate; see the module comment for the rules and the caveats.
 */
export function countSyllables(word: string): number {
  const trimmed = word.trim();
  if (!trimmed) return 0;

  // A pure number ("2026", "3.5") is one syllable by convention here.
  if (/^[\d.,]+$/.test(trimmed)) return 1;

  const letters = toLetters(trimmed);
  if (!letters) return 0;

  const known = EXCEPTIONS[letters];
  if (known !== undefined) return known;

  // Compound prefixes whose own syllables the generic rules over-count.
  for (const { prefix, syllables } of PREFIX_SYLLABLES) {
    if (letters.startsWith(prefix) && letters.length > prefix.length) {
      return syllables + countSyllables(letters.slice(prefix.length));
    }
  }

  // Three letters or fewer is one syllable in English ("the", "and", "eye").
  if (letters.length <= 3) return 1;

  // "-ly" adverbs and adjectives: the stem keeps its syllables and "ly" adds
  // one of its own ("quiet" 2 → "quietly" 3, "like" 1 → "likely" 2). The stem
  // has to end in a consonant or a silent "e" for "ly" to be a real suffix;
  // otherwise the y is the vowel of the last syllable ("Italy", "family").
  if (letters.endsWith("ly") && letters.length > 4) {
    const stem = letters.slice(0, -2);
    const stemTail = stem[stem.length - 1];
    const suffixLike = stem.length >= 2 && stemTail !== undefined && (!VOWELS.includes(stemTail) || stemTail === "e");
    if (suffixLike) return countSyllables(stem) + 1;
  }

  let count = vowelGroups(letters);

  // "-ious" is two syllables ("se-ri-ous"), unless a consonant cluster makes
  // the ending a single sound ("pre-cious", "cau-tious", "re-li-gious").
  if (/ious$/.test(letters) && !/(?:cious|tious|xious|gious)$/.test(letters)) count += 1;

  if (silentEd(letters)) count -= 1;
  if (silentEs(letters)) count -= 1;

  // "-iety" words split their vowels: "variety" is four, not three.
  if (/iety$/.test(letters)) count += 1;

  // A silent final "e" is dropped after a consonant ("telephone", "sentence",
  // "average"), except after a consonant plus "l" ("table", "simple") where it
  // is a syllable of its own. After a vowel it is not dropped: "value" is two.
  const beforeFinalE = letters[letters.length - 2];
  const finalEIsSilent =
    letters.endsWith("e") &&
    beforeFinalE !== undefined &&
    !VOWELS.includes(beforeFinalE) &&
    !/[^aeiouy]le$/.test(letters);
  if (finalEIsSilent) count -= 1;

  return Math.max(1, count);
}

/**
 * A word is "complex" for the Gunning Fog index when it has three or more
 * syllables. `capitalised` lets the caller exclude likely proper nouns, which
 * Fog's own definition drops.
 */
export function isComplexWord(word: string, capitalised = false): boolean {
  if (capitalised) return false;
  const letters = toLetters(word);
  if (!letters) return false;
  // Suffixes that create a third syllable without real complexity.
  if (/(?:es|ed|ing)$/.test(letters)) {
    const stem = letters.replace(/(?:es|ed|ing)$/, "");
    if (stem.length >= 2 && countSyllables(stem) <= 2) return false;
  }
  return countSyllables(word) >= 3;
}

/** Total syllables across a token list. */
export function totalSyllables(tokens: string[]): number {
  let total = 0;
  for (const token of tokens) total += countSyllables(token);
  return total;
}

/** How many tokens have three or more syllables (proper nouns excluded on request). */
export function polysyllableCount(tokens: string[], excludeCapitalised = false): number {
  let total = 0;
  for (const token of tokens) {
    if (excludeCapitalised && /^[A-ZÀ-Þ]/.test(token)) continue;
    if (countSyllables(token) >= 3) total += 1;
  }
  return total;
}

/** Complex-word count by the Gunning Fog definition. */
export function complexWordCount(tokens: string[]): number {
  let total = 0;
  for (const token of tokens) {
    if (isComplexWord(token, /^[A-ZÀ-Þ]/.test(token))) total += 1;
  }
  return total;
}
