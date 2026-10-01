/**
 * Poetry form guide: a reference to the common fixed forms, plus a checker that
 * measures a draft against the form it claims.
 *
 * The form data — line counts, syllable patterns and rhyme schemes — is the
 * conventional description of each form. The checker counts lines and
 * approximate syllables (through the shared syllable counter) and derives a
 * rhyme scheme from the final sounds of each line, reporting where the draft
 * parts company with the form. Approximate syllables are labelled as such: a
 * stress-aware metre check is a different and much larger problem.
 */
import { countSyllables } from "./syllables.ts";
import { wordTokens } from "./tokenize.ts";

export interface PoetryForm {
  id: string;
  name: string;
  lines?: number;
  /** Syllables per line, e.g. "5-7-5". Undefined when the form is not syllabic. */
  syllables?: string;
  rhyme?: string;
  meter?: string;
  description: string;
}

export const POETRY_FORMS: PoetryForm[] = [
  { id: "haiku", name: "Haiku", lines: 3, syllables: "5-7-5", description: "Three lines of five, seven and five syllables, usually a single image in nature." },
  { id: "tanka", name: "Tanka", lines: 5, syllables: "5-7-5-7-7", description: "The haiku's older five-line relative, adding a turn in the last two lines." },
  { id: "limerick", name: "Limerick", lines: 5, rhyme: "AABBA", meter: "anapaestic", description: "Five lines, comic, with a long-long-short-long-short shape." },
  { id: "cinquain", name: "Cinquain", lines: 5, syllables: "2-4-6-8-2", description: "Five lines growing then snapping shut, by syllable count." },
  { id: "sonnet", name: "Shakespearean sonnet", lines: 14, rhyme: "ABAB CDCD EFEF GG", meter: "iambic pentameter", description: "Fourteen lines in three quatrains and a closing couplet." },
  { id: "petrarchan-sonnet", name: "Petrarchan sonnet", lines: 14, rhyme: "ABBAABBA CDECDE", meter: "iambic pentameter", description: "An octave that poses a question and a sestet that answers it." },
  { id: "villanelle", name: "Villanelle", lines: 19, rhyme: "ABA ABA ABA ABA ABA ABAA", description: "Nineteen lines built on two refrains that repeat and finally meet." },
  { id: "sestina", name: "Sestina", lines: 39, description: "Six stanzas of six lines plus a tercet, with the end-words rotating." },
  { id: "free-verse", name: "Free verse", description: "No fixed line count or rhyme; the form is whatever the poem's own logic makes it." },
];

export function findForm(id: string): PoetryForm {
  return POETRY_FORMS.find((form) => form.id === id) ?? POETRY_FORMS[POETRY_FORMS.length - 1];
}

/** The rhyme tail of a word: its final vowel sound and everything after. */
export function rhymeKey(line: string): string {
  const tokens = wordTokens(line);
  const last = tokens[tokens.length - 1]?.text.toLowerCase().replace(/[^a-z\u00e0-\u00ff']/g, "") ?? "";
  const match = last.match(/[aeiouy][^aeiouy]*$/);
  return match ? match[0] : last.slice(-2);
}

/** A rhyme scheme as letter labels: ["A", "A", "B", "B"]. */
export function rhymeSchemeOf(text: string): string[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((line) => line.trim().length > 0);
  const keys = new Map<string, string>();
  let next = 0;
  return lines.map((line) => {
    const key = rhymeKey(line);
    if (!keys.has(key)) {
      keys.set(key, String.fromCharCode(65 + (next % 26)));
      next += 1;
    }
    return keys.get(key) as string;
  });
}

/** Approximate syllable count for each non-empty line. */
export function lineSyllables(text: string): number[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => wordTokens(line).reduce((sum, token) => sum + countSyllables(token.text), 0));
}

export interface FormCheck {
  lineCount: number;
  expectedLines?: number;
  syllables: number[];
  expectedSyllables?: number[];
  syllableMatch?: boolean;
  rhymeScheme: string[];
  expectedRhyme?: string;
  rhymeMatch?: boolean;
  passes: boolean;
  notes: string[];
}

/** Measure a draft against a form's line count, syllables and rhyme. */
export function checkForm(text: string, formId: string): FormCheck {
  const form = findForm(formId);
  const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((line) => line.trim().length > 0);
  const syllables = lineSyllables(text);
  const rhymeScheme = rhymeSchemeOf(text);
  const expectedSyllables = form.syllables ? form.syllables.split("-").map(Number) : undefined;
  const notes: string[] = [];

  const lineMatch = form.lines === undefined || form.lines === lines.length;
  if (form.lines !== undefined && !lineMatch) {
    notes.push(`${form.name} has ${form.lines} lines; this draft has ${lines.length}.`);
  }

  let syllableMatch: boolean | undefined;
  if (expectedSyllables) {
    syllableMatch = expectedSyllables.length === syllables.length && expectedSyllables.every((value, index) => value === syllables[index]);
    if (!syllableMatch) notes.push(`Syllables differ from ${form.syllables} (approximate counts: ${syllables.join("-")}).`);
  }

  let rhymeMatch: boolean | undefined;
  if (form.rhyme) {
    const expected = form.rhyme.replace(/\s+/g, "");
    const actual = rhymeScheme.join("");
    rhymeMatch = expected === actual;
    if (!rhymeMatch) notes.push(`Rhyme scheme reads ${actual || "(none)"}; the form's is ${form.rhyme}.`);
  }

  return {
    lineCount: lines.length,
    expectedLines: form.lines,
    syllables,
    expectedSyllables,
    syllableMatch,
    rhymeScheme,
    expectedRhyme: form.rhyme,
    rhymeMatch,
    passes: lineMatch && syllableMatch !== false && rhymeMatch !== false,
    notes,
  };
}

/** A copyable reference entry for one form. */
export function formReference(form: PoetryForm): string {
  return [
    form.name,
    form.lines !== undefined ? `Lines: ${form.lines}` : "Lines: open",
    form.syllables ? `Syllables: ${form.syllables}` : "",
    form.rhyme ? `Rhyme: ${form.rhyme}` : "",
    form.meter ? `Metre: ${form.meter}` : "",
    form.description,
  ]
    .filter(Boolean)
    .join("\n");
}
