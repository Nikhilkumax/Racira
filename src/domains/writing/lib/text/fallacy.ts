/**
 * Logical fallacy detector: a documented set of cue phrases for the common
 * informal fallacies.
 *
 * This is a lexical detector, not a logic engine. It flags sentences that
 * contain the phrases each fallacy usually leaves behind — "everyone knows" for
 * an appeal to popularity, "either … or" for a false dilemma — and names the
 * fallacy the phrase suggests. The page is explicit that a phrase is a prompt to
 * look, not a proof of error: a sentence can contain one of these cues and be
 * perfectly sound, and a fallacy can be committed in words that carry no cue at
 * all.
 */

export interface FallacyRule {
  id: string;
  name: string;
  description: string;
  patterns: RegExp[];
}

export const FALLACY_RULES: FallacyRule[] = [
  {
    id: "appeal-to-popularity",
    name: "Appeal to popularity",
    description: "Treats how many people believe something as evidence that it is true.",
    patterns: [/\bevery(one|body) knows\b/i, /\bmost people (agree|believe|think)\b/i, /\bno one (wants|believes)\b/i],
  },
  {
    id: "false-dilemma",
    name: "False dilemma",
    description: "Offers two options as if no others exist.",
    patterns: [/\beither\b[^.!?]*\bor\b/i, /\bthere are only two\b/i, /\byou're either\b/i, /\bonly two (choices|options|kinds)\b/i],
  },
  {
    id: "hasty-generalization",
    name: "Hasty generalisation",
    description: "Draws a sweeping conclusion from too little evidence.",
    patterns: [/\bevery single\b/i, /\ball of them\b/i, /\b(always|never)\b/i, /\bnobody ever\b/i],
  },
  {
    id: "slippery-slope",
    name: "Slippery slope",
    description: "Asserts that one step inevitably leads to an extreme outcome.",
    patterns: [/\bwill lead to\b/i, /\bnext thing you know\b/i, /\bbefore you know it\b/i, /\bslippery slope\b/i, /\bopen the door to\b/i],
  },
  {
    id: "ad-hominem",
    name: "Ad hominem",
    description: "Attacks the person instead of the argument.",
    patterns: [/\byou're just\b/i, /\bwhat do you know\b/i, /\b(idiot|stupid|incompetent)\b/i, /\byou always\b/i],
  },
  {
    id: "straw-man",
    name: "Straw man",
    description: "Restates an opponent's position in a weaker form and attacks that.",
    patterns: [/\bso you're saying\b/i, /\bwhat you're really saying\b/i, /\byou want to\b/i],
  },
  {
    id: "appeal-to-authority",
    name: "Appeal to authority",
    description: "Cites an authority without saying what they found or why it applies.",
    patterns: [/\bexperts say\b/i, /\bscientists say\b/i, /\bthe experts agree\b/i, /\bstudies show\b/i],
  },
  {
    id: "circular-reasoning",
    name: "Circular reasoning",
    description: "Uses the conclusion as its own support.",
    patterns: [/\bbecause it is\b/i, /\bthat's just how it is\b/i, /\bbecause that's what\b/i],
  },
  {
    id: "appeal-to-emotion",
    name: "Appeal to emotion",
    description: "Replaces an argument with a feeling.",
    patterns: [/\bthink of the children\b/i, /\bhow would you feel\b/i, /\bimagine if it were you\b/i],
  },
];

/** Split prose into sentences, keeping the punctuation; newlines also split. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export interface FallacyFinding {
  id: string;
  name: string;
  sentence: string;
  /** The phrase that matched. */
  cue: string;
  explanation: string;
}

/** Every cue phrase found, with the sentence it sits in. */
export function detectFallacies(text: string): FallacyFinding[] {
  const findings: FallacyFinding[] = [];
  for (const sentence of splitSentences(text)) {
    for (const rule of FALLACY_RULES) {
      for (const pattern of rule.patterns) {
        const match = sentence.match(pattern);
        if (!match) continue;
        findings.push({ id: rule.id, name: rule.name, sentence, cue: match[0], explanation: rule.description });
        break;
      }
    }
  }
  return findings;
}

/** A copyable report of the findings. */
export function fallacyReport(findings: FallacyFinding[]): string {
  if (findings.length === 0) return "No cue phrases for the documented fallacies were found.";
  return [
    `${findings.length} possible issue(s)`,
    "",
    ...findings.map((finding) => `- ${finding.name} ("${finding.cue}"): ${finding.sentence}\n  ${finding.explanation}`),
  ].join("\n");
}
