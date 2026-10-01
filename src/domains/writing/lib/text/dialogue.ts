/**
 * Dialogue analysis for the dialogue practice tool.
 *
 * It reads a passage of dialogue written either as a script (`Mara: "..."`) or
 * as prose with quoted speech, attributes each speech to a speaker where it can,
 * and reports the things writers revise by hand: who talks how much, how long
 * the speeches run, how many are questions or exclamations, and which
 * speech-attribution verbs are used. Verbs other than the plain ones are
 * "said-bookisms" — the analysis names them rather than banning them.
 */
import { wordTokens } from "./tokenize.ts";

const TAG_VERBS = [
  "said", "asked", "replied", "answered", "whispered", "shouted", "muttered", "murmured",
  "exclaimed", "yelled", "snapped", "hissed", "breathed", "laughed", "cried", "added",
  "continued", "barked", "growled", "sighed", "began",
];
const PLAIN_TAGS = new Set(["said", "asked", "replied", "answered"]);

const TAG_RE = new RegExp(`\\b(${TAG_VERBS.join("|")})\\b`, "gi");
const SPEAKER_RE = new RegExp(`\\b([A-Z][a-z]+)\\s+(?:${TAG_VERBS.join("|")})\\b`);
const ADVERB_TAG_RE = new RegExp(`\\b(?:${TAG_VERBS.filter((verb) => verb !== "began").join("|")})\\s+\\w+ly\\b`, "i");
const SCRIPT_LINE = /^\s*([A-Z][\w'’.\u2019-]*(?:\s+[A-Z][\w'’.\u2019-]*)*)\s*:\s*(.+)$/;

export interface DialogueSpeaker {
  name: string;
  lines: number;
  words: number;
}

export interface DialogueReport {
  lines: number;
  words: number;
  speakers: DialogueSpeaker[];
  narrationLines: number;
  questions: number;
  exclamations: number;
  plainTags: number;
  bookisms: { verb: string; count: number }[];
  adverbTags: number;
  longest?: { speaker: string; words: number };
  averageWords: number;
}

const stripQuotes = (value: string): string => value.trim().replace(/^["“]/, "").replace(/["”]$/, "").trim();

/** Analyse a dialogue passage into speakers, tags and speech shapes. */
export function analyzeDialogue(text: string): DialogueReport {
  const rawLines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const speakers = new Map<string, DialogueSpeaker>();
  const bookisms = new Map<string, number>();
  let narrationLines = 0;
  let questions = 0;
  let exclamations = 0;
  let plainTags = 0;
  let adverbTags = 0;
  let words = 0;
  let lineCount = 0;
  let longest: { speaker: string; words: number } | undefined;

  for (const raw of rawLines) {
    const script = raw.match(SCRIPT_LINE);
    let speaker: string | null = null;
    let speech = "";

    if (script) {
      const head = script[1].trim();
      TAG_RE.lastIndex = 0;
      const headHasTag = TAG_RE.test(head);
      TAG_RE.lastIndex = 0;
      if (!headHasTag && head.split(/\s+/).length <= 3) {
        speaker = head;
        // Prefer the quoted speech when the line also carries a tag, so the
        // narration ("she said quietly") is not counted as dialogue.
        const quoted = [...script[2].matchAll(/"([^"]*)"/g)].map((match) => match[1]);
        speech = quoted.length > 0 ? quoted.join(" ") : stripQuotes(script[2]);
      }
    }

    if (speaker === null) {
      const quoted = [...raw.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
      if (quoted.length === 0) {
        narrationLines += 1;
        continue;
      }
      speech = quoted.join(" ");
      const nameBefore = raw.match(SPEAKER_RE);
      speaker = nameBefore ? nameBefore[1] : "(unnamed)";
    }

    lineCount += 1;
    const lineWords = wordTokens(speech).length;
    words += lineWords;

    const tally = speakers.get(speaker) ?? { name: speaker, lines: 0, words: 0 };
    tally.lines += 1;
    tally.words += lineWords;
    speakers.set(speaker, tally);
    if (!longest || lineWords > longest.words) longest = { speaker, words: lineWords };

    if (/\?\s*["”]?\s*$/.test(speech)) questions += 1;
    if (/!\s*["”]?\s*$/.test(speech)) exclamations += 1;

    for (const match of raw.matchAll(TAG_RE)) {
      const verb = match[1].toLowerCase();
      if (PLAIN_TAGS.has(verb)) plainTags += 1;
      else bookisms.set(verb, (bookisms.get(verb) ?? 0) + 1);
    }
    if (ADVERB_TAG_RE.test(raw)) adverbTags += 1;
  }

  return {
    lines: lineCount,
    words,
    speakers: [...speakers.values()].sort((a, b) => b.lines - a.lines || a.name.localeCompare(b.name)),
    narrationLines,
    questions,
    exclamations,
    plainTags,
    bookisms: [...bookisms.entries()].map(([verb, count]) => ({ verb, count })).sort((a, b) => b.count - a.count || a.verb.localeCompare(b.verb)),
    adverbTags,
    longest,
    averageWords: lineCount === 0 ? 0 : Math.round(words / lineCount),
  };
}

/** A copyable report of the analysis. */
export function dialogueReport(report: DialogueReport): string {
  return [
    `Dialogue — ${report.lines} speech(es), ${report.words} words`,
    `Speakers: ${report.speakers.map((speaker) => `${speaker.name} (${speaker.lines})`).join(", ") || "(none found)"}`,
    `Questions: ${report.questions} · Exclamations: ${report.exclamations} · Adverb tags: ${report.adverbTags}`,
    `Plain tags: ${report.plainTags} · Other verbs: ${report.bookisms.map((entry) => `${entry.verb} ×${entry.count}`).join(", ") || "none"}`,
    report.longest ? `Longest speech: ${report.longest.speaker}, ${report.longest.words} words` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
