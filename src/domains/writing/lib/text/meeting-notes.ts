/**
 * Meeting notes: a cue-phrase scan that sorts note sentences into decisions,
 * actions and open questions.
 *
 * This is a documented list of cues, not an understanding of the meeting. A
 * sentence is placed in a category because it carries a cue phrase, because it
 * is written as an explicit label (`Action:`, `Decision:`, `TBD`), or because it
 * ends in a question mark. Anything without a cue is returned unclassified
 * rather than guessed at, and the cue lists are printed on the tool page.
 *
 * Priority, so one sentence lands in exactly one place:
 *   1. an explicit label at the start of the sentence,
 *   2. an action cue (an action is the most useful thing to surface),
 *   3. a decision cue,
 *   4. a question mark.
 * Owner and due-date extraction are two small documented patterns (`owner: X`,
 * `X will ...`) and are reported as suggestions, never as facts.
 */
import { sentenceTokens, wordTokens } from "./tokenize.ts";

export type MeetingCategory = "decision" | "action" | "question";

export interface MeetingItem {
  category: MeetingCategory;
  /** The sentence as written. */
  text: string;
  /** The cue phrase that placed it, or "question mark" / the label itself. */
  cue: string;
  index: number;
  /** Suggested owner from `owner: X` or `X will ...`, never asserted. */
  owner: string | null;
  /** Suggested due date phrase from `by ...`, `due ...` or an ISO date. */
  due: string | null;
}

export interface MeetingSummary {
  items: MeetingItem[];
  /** Sentences with no cue, in document order. */
  unclassified: { text: string; index: number }[];
  counts: Record<MeetingCategory, number>;
  sentences: number;
  words: number;
  cues: { category: MeetingCategory; label: string; cues: readonly string[] }[];
}

/** Explicit labels, matched at the start of a sentence (lowercased compare). */
export const LABELS: { category: MeetingCategory; label: string }[] = [
  { category: "action", label: "action:" },
  { category: "action", label: "action item:" },
  { category: "action", label: "next step:" },
  { category: "action", label: "todo:" },
  { category: "action", label: "to do:" },
  { category: "decision", label: "decision:" },
  { category: "decision", label: "decided:" },
  { category: "decision", label: "resolution:" },
  { category: "question", label: "question:" },
  { category: "question", label: "open question:" },
  { category: "question", label: "tbd:" },
];

export const ACTION_CUES: readonly string[] = [
  "will send",
  "will draft",
  "will schedule",
  "will review",
  "will follow up",
  "will share",
  "will update",
  "will prepare",
  "will check",
  "will book",
  "needs to",
  "need to",
  "assigned to",
  "owner:",
  "follow up",
  "follow-up",
  "take the lead",
  "to be done",
  "by end of week",
];

export const DECISION_CUES: readonly string[] = [
  "we decided",
  "we agreed",
  "it was decided",
  "we will go with",
  "we're going with",
  "we are going with",
  "approved",
  "signed off",
  "sign-off",
  "final call",
  "agreed to",
  "consensus was",
];

export const QUESTION_CUES: readonly string[] = [
  "open question",
  "to be determined",
  "tbd",
  "unclear",
  "needs input",
  "needs a decision",
];

const OWNER_LABEL = /\bowner:\s*([A-Z][\p{L}'-]*(?:\s+[A-Z][\p{L}'-]*)?)/iu;
const OWNER_WILL = /(?:^|\.\s+|:\s*)([A-Z][\p{L}'-]{1,20})\s+will\b/u;
const DUE_BY = /\b(?:by|due|before)\s+((?:the\s+)?(?:end of (?:day|week|month)|next \w+|this \w+|Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day?\b|[A-Z][a-z]+ \d{1,2}|\d{4}-\d{2}-\d{2})/u;

function findCue(lower: string, cues: readonly string[]): string | null {
  for (const cue of cues) {
    if (lower.includes(cue)) return cue;
  }
  return null;
}

function labelFor(lower: string): { category: MeetingCategory; label: string } | null {
  for (const entry of LABELS) {
    if (lower.startsWith(entry.label)) return entry;
  }
  return null;
}

/** Sort meeting-note sentences into decisions, actions, questions and the rest. */
export function summarizeMeeting(text: string, locale = "en"): MeetingSummary {
  const items: MeetingItem[] = [];
  const unclassified: { text: string; index: number }[] = [];
  const tokens = sentenceTokens(text, locale);

  tokens.forEach((token, index) => {
    const body = token.text.trim();
    if (body.length === 0) return;
    const lower = body.toLocaleLowerCase(locale);

    const label = labelFor(lower);
    const actionCue = findCue(lower, ACTION_CUES);
    const decisionCue = findCue(lower, DECISION_CUES);
    const questionCue = findCue(lower, QUESTION_CUES);
    const questionMark = body.endsWith("?");

    let category: MeetingCategory | null = null;
    let cue: string | null = null;
    if (label) {
      category = label.category;
      cue = label.label;
    } else if (actionCue) {
      category = "action";
      cue = actionCue;
    } else if (decisionCue) {
      category = "decision";
      cue = decisionCue;
    } else if (questionCue) {
      category = "question";
      cue = questionCue;
    } else if (questionMark) {
      category = "question";
      cue = "question mark";
    }

    if (!category || !cue) {
      unclassified.push({ text: body, index });
      return;
    }

    const ownerMatch = body.match(OWNER_LABEL) ?? body.match(OWNER_WILL);
    const dueMatch = body.match(DUE_BY);
    items.push({
      category,
      text: body,
      cue,
      index,
      owner: ownerMatch ? ownerMatch[1].trim() : null,
      due: dueMatch ? dueMatch[1].trim() : null,
    });
  });

  const counts: Record<MeetingCategory, number> = { decision: 0, action: 0, question: 0 };
  for (const item of items) counts[item.category] += 1;

  return {
    items,
    unclassified,
    counts,
    sentences: tokens.length,
    words: wordTokens(text, locale).length,
    cues: [
      { category: "action", label: "Action cues", cues: ACTION_CUES },
      { category: "decision", label: "Decision cues", cues: DECISION_CUES },
      { category: "question", label: "Question cues", cues: QUESTION_CUES },
    ],
  };
}

/** Plain-text report for the copy and download buttons. */
export function formatMeetingSummary(result: MeetingSummary): string {
  const section = (category: MeetingCategory, title: string) => {
    const rows = result.items.filter((item) => item.category === category);
    if (rows.length === 0) return `${title}\n  (none)\n`;
    return `${title}\n${rows
      .map((item, index) => {
        const extras = [item.owner ? `owner: ${item.owner}` : null, item.due ? `due: ${item.due}` : null]
          .filter(Boolean)
          .join(", ");
        return `  ${index + 1}. ${item.text}${extras ? `  [${extras}]` : ""}\n     cue: ${item.cue}`;
      })
      .join("\n")}\n`;
  };

  return [
    "Meeting summary (cue-phrase scan, not comprehension)",
    `${result.sentences} sentences, ${result.words} words`,
    `Decisions: ${result.counts.decision} · Actions: ${result.counts.action} · Open questions: ${result.counts.question}`,
    "",
    section("decision", "DECISIONS"),
    section("action", "ACTIONS"),
    section("question", "OPEN QUESTIONS"),
    `UNCLASSIFIED\n${result.unclassified.length === 0 ? "  (none)\n" : result.unclassified.map((row) => `  - ${row.text}`).join("\n")}`,
    "",
    "Every line above is a sentence from the notes; owner and due are pattern matches to confirm, not extracted facts.",
  ].join("\n");
}
