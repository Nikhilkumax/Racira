/**
 * Character profile builder: a structured set of prompts for a character, a
 * completeness score so gaps are visible, and a few mechanical checks that flag
 * the most common thin spots — a want that is really the need, a strength with
 * no matching flaw, a character with no arc.
 *
 * The checks are prompts to think, not verdicts: the tool never says a character
 * is wrong, only that a field is empty or that two fields say the same thing.
 */

export interface CharacterProfile {
  name: string;
  role?: string;
  age?: string;
  appearance?: string;
  want?: string;
  need?: string;
  flaw?: string;
  strength?: string;
  backstory?: string;
  voice?: string;
  arc?: string;
}

export interface ProfileField {
  key: keyof CharacterProfile;
  label: string;
  prompt: string;
}

export const PROFILE_FIELDS: ProfileField[] = [
  { key: "role", label: "Role", prompt: "Protagonist, antagonist, ally, foil?" },
  { key: "age", label: "Age", prompt: "How old, and what does that age let them do or stop them doing?" },
  { key: "appearance", label: "Appearance", prompt: "One telling detail, not a full inventory." },
  { key: "want", label: "Want", prompt: "What do they pursue on the page, in concrete terms?" },
  { key: "need", label: "Need", prompt: "What do they lack that the story will make them face?" },
  { key: "flaw", label: "Flaw", prompt: "What habit or belief keeps getting them into trouble?" },
  { key: "strength", label: "Strength", prompt: "What do they do well that earns the reader's sympathy?" },
  { key: "backstory", label: "Backstory", prompt: "Which single past event explains the flaw?" },
  { key: "voice", label: "Voice", prompt: "How do they speak? One verbal tic is enough." },
  { key: "arc", label: "Arc", prompt: "How are they different by the last page?" },
];

export interface Completeness {
  filled: number;
  total: number;
  percent: number;
  missing: string[];
}

/** How many prompts are answered, and which are still open. */
export function profileCompleteness(profile: CharacterProfile): Completeness {
  const missing: string[] = [];
  let filled = 0;
  for (const field of PROFILE_FIELDS) {
    const value = (profile[field.key] ?? "").trim();
    if (value) filled += 1;
    else missing.push(field.label);
  }
  return { filled, total: PROFILE_FIELDS.length, percent: Math.round((filled / PROFILE_FIELDS.length) * 100), missing };
}

/** Mechanical prompts about the profile's shape, not its quality. */
export function profileChecks(profile: CharacterProfile): string[] {
  const checks: string[] = [];
  const want = profile.want?.trim().toLowerCase();
  const need = profile.need?.trim().toLowerCase();
  if (want && need && want === need) {
    checks.push("The want and the need are worded identically: a character usually pursues one thing and lacks another.");
  }
  if (!profile.flaw?.trim()) checks.push("No flaw named: a character without one has nothing to overcome.");
  if (!profile.arc?.trim()) checks.push("No arc named: decide how the character is different by the end.");
  if (profile.strength?.trim() && !profile.flaw?.trim()) checks.push("A strength with no flaw reads as a wish rather than a person.");
  if (!profile.want?.trim() && !profile.need?.trim()) checks.push("No want or need: the character has nothing driving them through the story.");
  return checks;
}

/** The profile as a markdown character sheet. */
export function profileMarkdown(profile: CharacterProfile): string {
  const heading = profile.name.trim() || "Unnamed character";
  const lines = [`# ${heading}`];
  for (const field of PROFILE_FIELDS) {
    const value = (profile[field.key] ?? "").trim();
    lines.push("", `## ${field.label}`, value || `_${field.prompt}_`);
  }
  return lines.join("\n");
}

/** A copyable report: the sheet, the score and the checks. */
export function profileReport(profile: CharacterProfile): string {
  const completeness = profileCompleteness(profile);
  const checks = profileChecks(profile);
  return [
    `${profile.name.trim() || "Unnamed character"} — ${completeness.filled}/${completeness.total} prompts answered (${completeness.percent}%)`,
    completeness.missing.length > 0 ? `Open: ${completeness.missing.join(", ")}` : "Every prompt answered.",
    checks.length > 0 ? `\nPrompts to think about:\n${checks.map((check) => `- ${check}`).join("\n")}` : "",
    "",
    profileMarkdown(profile),
  ]
    .filter((part) => part !== "")
    .join("\n");
}
