/**
 * Debate script formatter: one case line per speech, placed into a published
 * speaking order with its time allocation and its job in the round.
 *
 * The formats carry the orders that leagues actually use — British
 * Parliamentary, Asian Parliamentary, Public Forum and Lincoln–Douglas — with
 * the common time allocations, and the page says plainly that your league's
 * rules override them. A line is `role | what the speech establishes`; the role
 * is matched against the format's abbreviations and full names, so "PM" and
 * "Prime Minister" both land on the opening government speech.
 *
 * The checks are the things that make a script unusable in a round: a side with
 * no case at all, an empty slot, a case too thin to speak to, a side with no
 * rebuttal speech drafted, and role labels the format does not contain.
 */
import { words } from "./tokenize.ts";

export type DebateSide = "pro" | "con" | "neutral";

export interface DebateSlot {
  id: string;
  /** Alternate labels accepted for the role, lowercased. */
  aliases: string[];
  label: string;
  side: DebateSide;
  minutes: number;
  purpose: string;
  /** True when the speech's job is rebutting the other side. */
  rebuttal: boolean;
}

export interface DebateFormat {
  id: string;
  label: string;
  note: string;
  slots: DebateSlot[];
}

const slot = (
  id: string,
  label: string,
  side: DebateSide,
  minutes: number,
  purpose: string,
  rebuttal = false,
  aliases: string[] = [],
): DebateSlot => ({ id, aliases: aliases.map((alias) => alias.toLowerCase()), label, side, minutes, purpose, rebuttal });

/** Four published formats with their common allocations. */
export const DEBATE_FORMATS: readonly DebateFormat[] = [
  {
    id: "bp",
    label: "British Parliamentary",
    note: "Eight speeches of seven minutes; the closing half must extend the opening half's case.",
    slots: [
      slot("pm", "Prime Minister", "pro", 7, "Open the government case: define the motion and establish the first argument.", false, ["og1", "government 1", "1st gov"]),
      slot("lo", "Leader of Opposition", "con", 7, "Answer the definition and open the opposition case.", false, ["oo1", "opposition 1", "1st opp"]),
      slot("dpm", "Deputy Prime Minister", "pro", 7, "Rebuild the government case and extend it with a second argument.", true, ["og2", "government 2", "2nd gov"]),
      slot("dlo", "Deputy Leader of Opposition", "con", 7, "Rebuild the opposition case and extend it with a second argument.", true, ["oo2", "opposition 2", "2nd opp"]),
      slot("mg", "Member of Government", "pro", 7, "Extend the government case and answer the opposition's extension.", true, ["og3", "member gov"]),
      slot("mo", "Member of Opposition", "con", 7, "Extend the opposition case and answer the government's extension.", true, ["oo3", "member opp"]),
      slot("gw", "Government Whip", "pro", 7, "Compare the benches, name the central clash and summarise the government's route to the win.", false, ["og4", "whip gov"]),
      slot("ow", "Opposition Whip", "con", 7, "Compare the benches, name the central clash and summarise the opposition's route to the win.", false, ["oo4", "whip opp"]),
    ],
  },
  {
    id: "asian",
    label: "Asian Parliamentary",
    note: "Six speeches of seven minutes; the third speaker on each side carries the rebuttal load.",
    slots: [
      slot("g1", "First Government", "pro", 7, "Open the government case with the definition and the main arguments.", false, ["gov 1", "1st gov"]),
      slot("o1", "First Opposition", "con", 7, "Answer the definition, open the opposition case and rebut.", false, ["opp 1", "1st opp"]),
      slot("g2", "Second Government", "pro", 7, "Defend the first speaker's case and add a new argument.", true, ["gov 2", "2nd gov"]),
      slot("o2", "Second Opposition", "con", 7, "Defend the first speaker's case and add a new argument.", true, ["opp 2", "2nd opp"]),
      slot("g3", "Third Government", "pro", 7, "Rebuttal in the round and a final reinforcement of the case.", true, ["gov 3", "3rd gov"]),
      slot("o3", "Third Opposition", "con", 7, "Rebuttal in the round and a final reinforcement of the case.", true, ["opp 3", "3rd opp"]),
    ],
  },
  {
    id: "public-forum",
    label: "Public Forum",
    note: "Four speeches of four minutes with two crossfires; summary and final focus are folded into the second speakers here.",
    slots: [
      slot("a1", "Team A First Speaker", "pro", 4, "Open Team A's case with the framework and the first contention.", false, ["team a", "aff 1", "a1"]),
      slot("b1", "Team B First Speaker", "con", 4, "Open Team B's case and answer Team A's first contention.", false, ["team b", "neg 1", "b1"]),
      slot("crossfire1", "Crossfire", "neutral", 3, "Both first speakers question each other on the cases as stated.", false, ["cross 1", "crossfire"]),
      slot("a2", "Team A Second Speaker", "pro", 4, "Rebuttal, then summary of the deciding issues for Team A.", true, ["aff 2", "a2"]),
      slot("b2", "Team B Second Speaker", "con", 4, "Rebuttal, then summary of the deciding issues for Team B.", true, ["neg 2", "b2"]),
      slot("crossfire2", "Grand Crossfire", "neutral", 3, "All speakers question each other; the sharpest unanswered question is the one to carry.", false, ["cross 2", "grand crossfire"]),
    ],
  },
  {
    id: "lincoln-douglas",
    label: "Lincoln–Douglas",
    note: "Value debate with cross-examinations; the rebuttals carry the weighing.",
    slots: [
      slot("ac", "Affirmative Constructive", "pro", 6, "State the value premise, the criterion and the affirmative case.", false, ["1ac", "aff constructive"]),
      slot("nc", "Negative Constructive", "con", 7, "Answer the case and establish the negative value position.", false, ["1nc", "neg constructive"]),
      slot("1ar", "First Affirmative Rebuttal", "pro", 4, "Answer the negative case and begin collapsing the affirmative to its strongest ground.", true, ["aff rebuttal", "1ar"]),
      slot("nr", "Negative Rebuttal", "con", 6, "Weigh the round and answer the affirmative's collapse.", true, ["neg rebuttal", "1nr"]),
      slot("2ar", "Second Affirmative Rebuttal", "pro", 3, "Final weighing for the affirmative; no new arguments.", false, ["aff final", "2ar"]),
      slot("2nr", "Second Negative Rebuttal", "con", 3, "Final weighing for the negative; no new arguments.", false, ["neg final", "2nr"]),
    ],
  },
];

export interface DebateSpeech {
  id: string;
  label: string;
  side: DebateSide;
  minutes: number;
  purpose: string;
  text: string;
  words: number;
  filled: boolean;
}

export interface DebateScript {
  format: string;
  formatLabel: string;
  note: string;
  speeches: DebateSpeech[];
  script: string;
  totalMinutes: number;
  checks: string[];
  extra: { role: string; text: string }[];
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Place each line into its slot, then check the round for what is missing. */
export function formatDebateScript(text: string, formatId = "bp"): DebateScript {
  const format = DEBATE_FORMATS.find((entry) => entry.id === formatId) ?? DEBATE_FORMATS[0];
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const texts = new Map<string, string>();
  const extra: { role: string; text: string }[] = [];
  const duplicates: string[] = [];
  const seen: string[] = [];

  for (const line of lines) {
    const [rawRole = "", ...rest] = line.split(/\s*[|:]\s*/);
    const role = clean(rawRole).toLowerCase();
    const body = clean(rest.join(" "));
    const hit = format.slots.find(
      (entry) => entry.id.toLowerCase() === role || entry.label.toLowerCase() === role || entry.aliases.includes(role),
    );
    if (!hit) {
      extra.push({ role: clean(rawRole), text: body });
      continue;
    }
    if (seen.includes(hit.id)) {
      duplicates.push(hit.label);
      continue;
    }
    seen.push(hit.id);
    if (body) texts.set(hit.id, body);
  }

  const speeches: DebateSpeech[] = format.slots.map((entry) => {
    const body = texts.get(entry.id) ?? "";
    return {
      id: entry.id,
      label: entry.label,
      side: entry.side,
      minutes: entry.minutes,
      purpose: entry.purpose,
      text: body,
      words: words(body).length,
      filled: body.length > 0,
    };
  });

  const script = speeches
    .map((speech, index) =>
      [
        `${index + 1}. ${speech.label} (${speech.minutes}:00, ${speech.side})`,
        speech.text ? `   ${speech.text}` : `   (not drafted) ${speech.purpose}`,
        speech.filled ? null : `   Cue: ${speech.purpose}`,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  const checks: string[] = [];
  const debateSides = format.slots.filter((entry) => entry.side !== "neutral");
  for (const side of ["pro", "con"] as const) {
    const slots = debateSides.filter((entry) => entry.side === side);
    const filled = slots.filter((entry) => texts.has(entry.id));
    if (filled.length === 0) {
      checks.push(`The ${side} side has no case drafted at all; every format needs both sides before it can be formatted.`);
    } else if (filled.length < slots.length) {
      checks.push(`${slots.length - filled.length} ${side} slot${slots.length - filled.length === 1 ? " is" : "s are"} empty.`);
    }
    const rebuttal = slots.filter((entry) => entry.rebuttal);
    if (rebuttal.length > 0 && !rebuttal.some((entry) => texts.has(entry.id))) {
      checks.push(`The ${side} side has no rebuttal speech drafted; a side that only repeats its case loses the exchange.`);
    }
  }
  const thin = speeches.filter((speech) => speech.filled && speech.words < 15);
  if (thin.length > 0) {
    checks.push(
      `${thin.length} case${thin.length === 1 ? " is" : "s are"} under fifteen words (${thin.map((speech) => speech.label).join(", ")}): a placeholder, not a case.`,
    );
  }
  if (lines.length === 0) {
    checks.push("Paste one line per speech as role | what the speech establishes.");
  }
  for (const label of duplicates) {
    checks.push(`Two lines both match ${label}; merge them into one case before debating.`);
  }
  for (const item of extra) {
    checks.push(`“${item.role || "Unlabelled line"}” matches no role in ${format.label}.`);
  }
  const cross = speeches.filter((speech) => speech.side === "neutral");
  if (cross.length > 0 && !cross.some((speech) => speech.filled)) {
    checks.push("Crossfire slots are empty; write the two or three questions each side will press.");
  }

  const totalMinutes = format.slots.reduce((sum, entry) => sum + entry.minutes, 0);

  return { format: format.id, formatLabel: format.label, note: format.note, speeches, script, totalMinutes, checks, extra };
}
