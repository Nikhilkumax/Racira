/**
 * Register analysis: formality, tone signals and academic register.
 *
 * All three read the same counted markers — contractions, informal words,
 * pronouns, exclamations, formal connectors, hedges and a small sentiment
 * lexicon — and report rates rather than verdicts. The formality view is a
 * transparent weighted composite whose every weight is shown; the tone view
 * reports separate signals because "tone" is not one quantity; the academic
 * view is a checklist with a pass/warn status per rule.
 *
 * Nothing here is a trained model. The lexicon is finite and the page says so.
 */
import { wordTokens, sentenceTokens } from "./tokenize.ts";
import {
  CONTRACTIONS,
  FIRST_PERSON,
  FORMAL_MARKERS,
  HEDGES,
  INFORMAL_WORDS,
  INTENSIFIERS,
  NEGATIVE_WORDS,
  POSITIVE_WORDS,
  SECOND_PERSON,
} from "./lexicons.ts";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface TermCount {
  count: number;
  examples: string[];
}

/** Count whole-phrase occurrences of any term in `terms`, case-insensitively. */
export function countTerms(text: string, terms: readonly string[]): TermCount {
  if (terms.length === 0 || text.length === 0) return { count: 0, examples: [] };
  const alternatives = [...terms].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const pattern = new RegExp(`\\b(?:${alternatives.join("|")})\\b`, "gi");
  const examples: string[] = [];
  let count = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    count += 1;
    const found = match[0].toLowerCase();
    if (examples.length < 4 && !examples.includes(found)) examples.push(found);
    if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
  }
  return { count, examples };
}

const CONTRACTION_TERMS = [...CONTRACTIONS];
const INFORMAL_TERMS = [...INFORMAL_WORDS];
const FORMAL_TERMS = [...FORMAL_MARKERS];
const FIRST_PERSON_TERMS = [...FIRST_PERSON];
const SECOND_PERSON_TERMS = [...SECOND_PERSON];
const INTENSIFIER_TERMS = [...INTENSIFIERS];
const HEDGE_TERMS = [...HEDGES];
const POSITIVE_TERMS = [...POSITIVE_WORDS];
const NEGATIVE_TERMS = [...NEGATIVE_WORDS];
const VAGUE_TERMS = ["a lot", "lots of", "sort of", "kind of", "a bit", "things", "stuff", "big", "huge"];

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function per100(count: number, words: number): number {
  return words > 0 ? (count / words) * 100 : 0;
}

// ── Formality ────────────────────────────────────────────────────────────────

export interface RegisterComponent {
  key: string;
  label: string;
  weight: number;
  score: number;
  measured: string;
  rule: string;
}

export interface FormalityResult {
  score: number;
  band: { label: string; note: string };
  components: RegisterComponent[];
  words: number;
  counts: { contractions: number; informal: number; pronouns: number; exclamations: number; formalMarkers: number };
}

export function formalityAnalysis(text: string): FormalityResult {
  const words = wordTokens(text).length;
  const sentences = sentenceTokens(text).length;

  const contractions = countTerms(text, CONTRACTION_TERMS).count;
  const informal = countTerms(text, INFORMAL_TERMS).count;
  const pronouns = countTerms(text, [...FIRST_PERSON_TERMS, ...SECOND_PERSON_TERMS]).count;
  const exclamations = (text.match(/[!?]/g) ?? []).length;
  const formalMarkers = countTerms(text, FORMAL_TERMS).count;
  const meanSentenceLength = sentences > 0 ? words / sentences : 0;

  const contractionRate = per100(contractions, words);
  const informalRate = per100(informal, words);
  const pronounRate = per100(pronouns, words);
  const exclamationRate = per100(exclamations, words);
  const formalRate = per100(formalMarkers, words);

  const components: RegisterComponent[] = [
    {
      key: "contractions",
      label: "Contractions",
      weight: 20,
      score: clamp(100 - contractionRate * 20),
      measured: `${contractions} in ${words} words`,
      rule: "100 − 20 × contractions per 100 words, so five per 100 scores zero.",
    },
    {
      key: "informal",
      label: "Informal words",
      weight: 25,
      score: clamp(100 - informalRate * 8),
      measured: `${informal} informal word${informal === 1 ? "" : "s"}`,
      rule: "100 − 8 × informal words per 100 words; rare in formal prose.",
    },
    {
      key: "pronouns",
      label: "First and second person",
      weight: 20,
      score: clamp(100 - pronounRate * 6),
      measured: `${pronouns} I / we / you tokens`,
      rule: "100 − 6 × first- and second-person pronouns per 100 words.",
    },
    {
      key: "exclamations",
      label: "Exclamations and questions",
      weight: 10,
      score: clamp(100 - exclamationRate * 35),
      measured: `${exclamations} ! or ? mark${exclamations === 1 ? "" : "s"}`,
      rule: "100 − 35 × punctuation marks per 100 words; formal prose is largely declarative.",
    },
    {
      key: "formal-markers",
      label: "Formal connectors",
      weight: 15,
      score: clamp(formalRate * 20),
      measured: `${formalMarkers} connector${formalMarkers === 1 ? "" : "s"}`,
      rule: "20 × connectors (therefore, moreover, thus …) per 100 words, capped at 100. This component rewards formality.",
    },
    {
      key: "sentence-length",
      label: "Sentence length",
      weight: 10,
      score: clamp(100 - Math.max(0, 15 - meanSentenceLength) * 5),
      measured: `${meanSentenceLength.toFixed(1)} words per sentence`,
      rule: "100 at 15 words or more; 5 points lost per word below 15 for a choppy register.",
    },
  ];

  const weighted = components.reduce((sum, component) => sum + component.score * component.weight, 0);
  const totalWeight = components.reduce((sum, component) => sum + component.weight, 0);
  const score = Math.round((weighted / totalWeight) * 10) / 10;

  return {
    score,
    band: formalityBand(score),
    components,
    words,
    counts: { contractions, informal, pronouns, exclamations, formalMarkers },
  };
}

export function formalityBand(score: number): { label: string; note: string } {
  if (score >= 80) return { label: "Very formal", note: "Academic or legal register: no contractions, few pronouns." };
  if (score >= 65) return { label: "Formal", note: "Professional register: suitable for reports and documentation." };
  if (score >= 50) return { label: "Neutral", note: "Standard prose: neither stiff nor casual." };
  if (score >= 35) return { label: "Informal", note: "Conversational register: contractions and everyday words." };
  return { label: "Very informal", note: "Casual register: chatty, direct and full of contractions." };
}

// ── Tone signals ─────────────────────────────────────────────────────────────

export interface ToneSignal {
  key: string;
  label: string;
  value: string;
  reading: string;
}

export interface ToneResult {
  signals: ToneSignal[];
  summary: string;
  words: number;
  /** Positive minus negative lexicon hits. */
  netPolarity: number;
}

export function toneAnalysis(text: string): ToneResult {
  const words = wordTokens(text).length;
  const positive = countTerms(text, POSITIVE_TERMS).count;
  const negative = countTerms(text, NEGATIVE_TERMS).count;
  const intensifiers = countTerms(text, INTENSIFIER_TERMS).count;
  const exclamations = (text.match(/!/g) ?? []).length;
  const questions = (text.match(/\?/g) ?? []).length;
  const capsWords = (text.match(/\b[A-Z]{2,}\b/g) ?? []).length;
  const secondPerson = countTerms(text, SECOND_PERSON_TERMS).count;
  const hedges = countTerms(text, HEDGE_TERMS).count;

  const net = positive - negative;
  const polarityRate = per100(Math.abs(net), words);
  const polarityLabel =
    polarityRate < 1 ? "Neutral" : net > 0 ? "Positive" : net < 0 ? "Negative" : "Neutral";

  const energyRate = per100(exclamations + intensifiers + capsWords, words);
  const energyLabel = energyRate === 0 ? "Low" : energyRate < 3 ? "Moderate" : "High";

  const directnessRate = per100(secondPerson + questions, words);
  const directnessLabel = directnessRate === 0 ? "Impersonal" : directnessRate < 3 ? "Somewhat direct" : "Direct";

  const hedgeRate = per100(hedges, words);
  const confidenceLabel = hedgeRate === 0 ? "Assertive" : hedgeRate < 2 ? "Balanced" : "Tentative";

  const formality = formalityAnalysis(text);

  const signals: ToneSignal[] = [
    {
      key: "polarity",
      label: "Polarity",
      value: polarityLabel,
      reading: `${positive} positive and ${negative} negative lexicon word${
        positive + negative === 1 ? "" : "s"
      } (net ${net >= 0 ? "+" : ""}${net}). A finite word list, so it measures explicit sentiment only.`,
    },
    {
      key: "energy",
      label: "Energy",
      value: energyLabel,
      reading: `${exclamations} exclamation${exclamations === 1 ? "" : "s"}, ${intensifiers} intensifier${
        intensifiers === 1 ? "" : "s"
      } and ${capsWords} emphasised word${capsWords === 1 ? "" : "s"}.`,
    },
    {
      key: "directness",
      label: "Directness",
      value: directnessLabel,
      reading: `${secondPerson} second-person pronoun${secondPerson === 1 ? "" : "s"} and ${questions} question${
        questions === 1 ? "" : "s"
      }; direct writing addresses the reader.`,
    },
    {
      key: "confidence",
      label: "Confidence",
      value: confidenceLabel,
      reading: `${hedges} hedge${hedges === 1 ? "" : "s"} (perhaps, seems, might …). Hedges soften claims; they are normal in academic writing.`,
    },
    {
      key: "register",
      label: "Register",
      value: formality.band.label,
      reading: `Formality score ${formality.score.toFixed(1)} of 100 from contractions, pronouns and vocabulary.`,
    },
  ];

  const summary = `Measured as ${formality.band.label.toLowerCase()} in register, ${polarityLabel.toLowerCase()} in polarity, ${energyLabel.toLowerCase()} in energy, ${directnessLabel.toLowerCase()} in directness and ${confidenceLabel.toLowerCase()} in confidence.`;

  return { signals, summary, words, netPolarity: net };
}

// ── Academic register ────────────────────────────────────────────────────────

export interface AcademicCheck {
  id: string;
  label: string;
  status: "pass" | "warn";
  count: number;
  message: string;
  examples: string[];
}

export interface AcademicResult {
  checks: AcademicCheck[];
  warnings: number;
  words: number;
  sentences: number;
}

export function academicRegisterAnalysis(text: string): AcademicResult {
  const words = wordTokens(text).length;
  const sentences = sentenceTokens(text).length;

  const made = (id: string, label: string, terms: readonly string[], message: string): AcademicCheck => {
    const { count, examples } = countTerms(text, terms);
    return { id, label, status: count > 0 ? "warn" : "pass", count, message, examples };
  };

  const contractions = made(
    "contractions",
    "Contractions",
    CONTRACTION_TERMS,
    "Academic prose normally writes the words out in full (do not rather than don't).",
  );
  const secondPerson = made(
    "second-person",
    "Second person",
    SECOND_PERSON_TERMS,
    "Addressing the reader as \"you\" is usually avoided; prefer the impersonal or third person.",
  );
  const informal = made(
    "informal",
    "Informal vocabulary",
    INFORMAL_TERMS,
    "Everyday and intensifier words such as really, very and stuff read as conversational.",
  );
  const intensifiers = made(
    "intensifiers",
    "Intensifiers",
    INTENSIFIER_TERMS,
    "Intensified adjectives (very important) are usually replaced with a single precise word.",
  );
  const vague = made(
    "vague",
    "Vague quantifiers",
    VAGUE_TERMS,
    "Imprecise quantity words (a lot, things, big) invite a specific figure instead.",
  );
  const firstPersonSingular = made(
    "first-person-singular",
    "First person singular",
    ["i", "me", "my", "mine", "myself"],
    "Some disciplines prefer an impersonal voice; others now encourage \"I\". Check your target journal.",
  );

  const exclamations = (text.match(/!/g) ?? []).length;
  const questions = (text.match(/\?/g) ?? []).length;
  const hedges = countTerms(text, HEDGE_TERMS);

  const checks: AcademicCheck[] = [
    contractions,
    secondPerson,
    informal,
    intensifiers,
    vague,
    firstPersonSingular,
    {
      id: "exclamations",
      label: "Exclamation marks",
      status: exclamations > 0 ? "warn" : "pass",
      count: exclamations,
      message: "Academic writing is declarative; exclamation marks are rare outside quotations.",
      examples: [],
    },
    {
      id: "questions",
      label: "Rhetorical questions",
      status: questions > 0 ? "warn" : "pass",
      count: questions,
      message: "Questions are usually reserved for research questions, not rhetorical effect.",
      examples: [],
    },
    {
      id: "hedges",
      label: "Hedges",
      status: "pass",
      count: hedges.count,
      message:
        "Hedging is a normal academic move, not a fault. It is counted here for reference; the right amount depends on how strong the evidence is.",
      examples: hedges.examples,
    },
  ];

  return {
    checks,
    warnings: checks.filter((check) => check.status === "warn").length,
    words,
    sentences,
  };
}
