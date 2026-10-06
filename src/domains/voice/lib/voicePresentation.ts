/**
 * How the Voice catalog is presented: labels, order, grouping and the rough
 * time estimate.
 *
 * Kept apart from voiceCatalog.ts on purpose. That file is generated from the
 * installed engine and owns the data; this one owns the presentation rules and
 * is hand-written, so a regeneration can never quietly change how a voice reads
 * in the picker. Nothing here imports React — every function is pure.
 *
 * The words a visitor reads for a quality tier or a speed tier live here and
 * nowhere else. The catalog carries the tier keys only, so a rename reaches
 * every surface at once.
 */

import { isFeaturedVoice, type VoiceOption } from "./voiceCatalog";

/** Speed tier as published in the catalog. */
export type VoiceSpeed = VoiceOption["speed"];

/**
 * The phrase shown on the speed badge. A text label rather than a colour, so
 * the signal survives a monochrome display and a colour-blind reader, and a
 * full phrase rather than a bare adjective because the badge sits beside a
 * number — "Medium generation speed" says what is medium.
 *
 * Longer than an adjective, so the badge and the estimate cannot always share a
 * line: the row wraps and the estimate drops below the badge rather than either
 * being clipped. The panel's real width is checked in the e2e spec.
 */
export const SPEED_BADGE: Record<VoiceSpeed, string> = {
  fast: "Faster generation speed",
  normal: "Medium generation speed",
  slow: "Slower generation speed",
};

/**
 * Display names for the catalog's quality tiers.
 *
 * The only place these words exist. The picker offers three quality levels, so
 * the engine's two lightest tiers share one display name — `x_low` and `low`
 * both read "Basic" — and they sort together by name rather than apart by the
 * tier they came from. The tier keys themselves never change: they are part of
 * a voice's published id, which is also the name a saved model is stored under,
 * so renaming one would orphan models already on a visitor's device. These names
 * are display-only and never reach storage.
 */
export const QUALITY_LABEL: Record<VoiceOption["quality"], string> = {
  high: "Best",
  medium: "Good",
  low: "Basic",
  x_low: "Basic",
};

/**
 * Sort order per tier, best first. Both "Basic" tiers share a rank, so they
 * sort together by name instead of being separated by the tier they used to be
 * called.
 *
 * Exhaustive by type: a tier added to the catalog is a compile error here
 * rather than a voice that silently sorts first.
 */
const QUALITY_RANK: Record<VoiceOption["quality"], number> = {
  high: 0,
  medium: 1,
  low: 2,
  x_low: 2,
};

/** How a recorded gender reads in a label. */
const GENDER_WORD: Record<"female" | "male", string> = {
  female: "Female",
  male: "Male",
};

// Sort tiers, in the order they are applied. A lower rank sorts first.
// Recommended voices lead; then women before men before a voice whose gender
// was never recorded; then quality from Best down to Basic; then the name.
const GENDER_RANK = { female: 0, male: 1, none: 2 } as const;

function genderRank(voice: VoiceOption): number {
  return voice.gender ? GENDER_RANK[voice.gender] : GENDER_RANK.none;
}

/** The picker's ordering rule, as a comparator. */
export function compareVoices(a: VoiceOption, b: VoiceOption): number {
  const recommended = Number(isRecommendedVoice(b)) - Number(isRecommendedVoice(a));
  if (recommended !== 0) return recommended;

  const gender = genderRank(a) - genderRank(b);
  if (gender !== 0) return gender;

  const quality = QUALITY_RANK[a.quality] - QUALITY_RANK[b.quality];
  if (quality !== 0) return quality;

  // The id breaks a name tie so two speakers sharing a name cannot swap
  // position between runs on `localeCompare`'s own tie-breaking.
  return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
}

/** `voices`, ordered for the picker. Does not mutate its input. */
export function sortVoices(voices: VoiceOption[]): VoiceOption[] {
  return [...voices].sort(compareVoices);
}

/** The mark shown after a recommended voice's label. */
export const RECOMMENDED_MARK = "\u2605";

/**
 * The mark's accessible name. The star is a glyph, not a word, so it is given
 * one where it is rendered — a screen reader reads "Recommended" rather than
 * skipping it or spelling out a symbol with no name in most voices.
 *
 * No visible legend accompanies it: the mark means "recommended", and the
 * accessible name is available to exactly the readers who cannot see it.
 */
export const RECOMMENDED_LABEL = "Recommended";

/** Whether a voice carries the recommended mark. */
export function isRecommendedVoice(voice: VoiceOption): boolean {
  return isFeaturedVoice(voice.id);
}

/**
 * The visible text of a voice's label, without the recommended mark:
 * `Emma (Female) — Best`, `Amy (Female) — Good`, or `Mei — Good` when the
 * gender was never recorded.
 *
 * The mark is left to the caller because it is rendered as an element carrying
 * its own accessible name, which a plain string cannot hold.
 */
export function voiceLabelText(voice: VoiceOption): string {
  const who = voice.gender ? `${voice.name} (${GENDER_WORD[voice.gender]})` : voice.name;
  return `${who} \u2014 ${QUALITY_LABEL[voice.quality]}`;
}

/**
 * A language at least this long is shown as labelled groups rather than one
 * flat list, so a long list stays scannable.
 */
export const VOICE_GROUP_THRESHOLD = 15;

export interface VoiceGroup {
  label: string;
  voices: VoiceOption[];
}

/**
 * Split `voices` into labelled groups when the language is long enough to need
 * them, and return null when it should stay flat.
 *
 * Voices with no recorded gender are grouped rather than dropped, so no
 * selection can ever be hidden by the grouping.
 */
export function groupVoicesByGender(voices: VoiceOption[]): VoiceGroup[] | null {
  if (voices.length < VOICE_GROUP_THRESHOLD) return null;

  const groups: VoiceGroup[] = [
    { label: "Female", voices: voices.filter((voice) => voice.gender === "female") },
    { label: "Male", voices: voices.filter((voice) => voice.gender === "male") },
  ];

  const unspecified = voices.filter((voice) => voice.gender === null);
  if (unspecified.length > 0) groups.push({ label: "Other", voices: unspecified });

  return groups.filter((group) => group.voices.length > 0);
}

/**
 * The voice a language falls back to: its first recommended voice in sort
 * order, else the top of the sorted list — which is already the highest-quality
 * voice it has. Undefined only for a language with no voices.
 */
export function defaultVoiceFor(voices: VoiceOption[]): VoiceOption | undefined {
  const sorted = sortVoices(voices);
  return sorted.find((voice) => isRecommendedVoice(voice)) ?? sorted[0];
}

/**
 * Resolve the selection for `voices`: keep `current` when the language still
 * offers it, otherwise fall back. This is what stops the select holding an id
 * from a language it is no longer showing — and what makes a one-voice language
 * select that voice without any extra state.
 */
export function resolveSelection(voices: VoiceOption[], current: string): string {
  if (voices.some((voice) => voice.id === current)) return current;
  return defaultVoiceFor(voices)?.id ?? "";
}

/**
 * Rough synthesis time in seconds for `chars` characters read by `voice`.
 *
 * Uses the voice's provisional per-1000-character figure, so it is an estimate
 * in both senses: the figure is a placeholder, and the real cost depends on the
 * machine. Never present it as exact.
 */
export function estimateSeconds(chars: number, voice: VoiceOption | undefined): number {
  if (!voice || chars <= 0) return 0;
  return (chars / 1000) * voice.secondsPer1000Chars;
}

/**
 * Round an estimate for display.
 *
 * Deliberately coarse: an estimate that moves in single seconds reads as a
 * prediction, and this is not one. Below a minute it is rounded to the second
 * (or to a tenth, when the figure is small enough that a whole second would
 * round it to nothing), and above a minute to the nearest ten seconds.
 */
export function formatEstimateSeconds(seconds: number): string {
  if (seconds < 1) return "1";

  if (seconds < 10) {
    // One decimal, but not a pointless one: "7" rather than "7.0".
    const tenths = Math.round(seconds * 10) / 10;
    return Number.isInteger(tenths) ? String(tenths) : tenths.toFixed(1);
  }

  if (seconds < 60) return String(Math.round(seconds));
  return String(Math.ceil(seconds / 10) * 10);
}

/**
 * Long text read by the best-quality voice is the one combination worth warning
 * about: the wait is minutes, not seconds, and a Good voice is both quicker and
 * still clear. Keyed off the `slow` speed tier, never off the badge text, so
 * rewording the badge cannot turn the tip on or off.
 *
 * The threshold is a named constant so the copy, the test and the UI cannot
 * drift apart.
 */
export const LONG_TEXT_MIN_CHARS = 3000;

/**
 * The warning itself, in the exact words the page shows. Its two tier names are
 * the same two the labels carry for the `high` and `medium` tiers, so the pair
 * moves together; the e2e spec asserts this sentence verbatim, which is what
 * keeps it in step with QUALITY_LABEL.
 */
export const LONG_TEXT_TIP =
  "Long text with a Best-quality voice can take a while. A Good voice is faster.";
