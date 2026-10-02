/**
 * Literature review organizer: one source per line, grouped by the stance its
 * finding takes, with a synthesis scaffold and the gaps in the list named.
 *
 * The line format is deliberately plain — citation | finding | stance — because
 * the point of the tool is to make the writer state each source's finding and
 * where it stands, and a format that takes two minutes to learn would defeat
 * that. Citation, finding and stance are parsed from the pipes; a line with no
 * pipe is treated as a citation with no finding, which is exactly the gap the
 * checks are looking for.
 *
 * Grouping by stance is what turns a reading list into a review: sources that
 * agree, sources that disagree, and sources that extend the question. A list
 * where every source agrees has no tension, and the checks say so rather than
 * letting the writer discover it in a supervisor's comments.
 */
import { words } from "./tokenize.ts";

export interface Stance {
  id: string;
  label: string;
  prompt: string;
  /** Matched against the stance field and, failing that, the finding. */
  pattern: RegExp;
}

/** The three stances a finding can take, plus the unstanced remainder. */
export const STANCES: readonly Stance[] = [
  {
    id: "supports",
    label: "Agrees",
    prompt: "The evidence consistently shows",
    pattern: /(support|agree|consistent|confirm|corroborat|replicat|in line with)/i,
  },
  {
    id: "challenges",
    label: "Disagrees",
    prompt: "This agreement is not universal:",
    pattern: /(challeng|contradict|conflict|against|inconsistent|fails? to|no effect|did not)/i,
  },
  {
    id: "extends",
    label: "Extends",
    prompt: "Beyond this, the literature extends the question:",
    pattern: /(extend|build|expand|refine|complement|adds? to|further)/i,
  },
];

export const UNSTANCED = "unstanced";

export interface ReviewSource {
  citation: string;
  finding: string;
  stance: string;
  year: number | null;
  words: number;
}

export interface ReviewGroup {
  id: string;
  label: string;
  prompt: string;
  sources: ReviewSource[];
}

export interface LiteratureReviewPlan {
  sources: ReviewSource[];
  groups: ReviewGroup[];
  scaffold: string;
  checks: string[];
  counts: { total: number; withYear: number; withStance: number };
}

export const SYNTHESIS_PROMPTS: readonly string[] = [
  "State what the agreeing sources establish together, not one by one.",
  "Name the disagreement directly: who found the opposite, and on what sample.",
  "Say what the extending sources add that the agreeing ones cannot.",
  "End with the question none of the sources answer — that is the review's justification.",
];

function parseStance(raw: string, finding: string): string {
  const haystack = `${raw} ${finding}`;
  for (const stance of STANCES) {
    if (stance.pattern.test(haystack)) return stance.id;
  }
  return UNSTANCED;
}

/** Parse and group the sources, then build the scaffold. */
export function organizeLiteratureReview(text: string): LiteratureReviewPlan {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const sources: ReviewSource[] = lines.map((line) => {
    const [citation = "", finding = "", stanceField = ""] = line.split(/\s*\|\s*/);
    const yearMatch = citation.match(/\b(1[5-9]\d{2}|20\d{2}|19\d{2})\b/);
    return {
      citation: citation.trim(),
      finding: finding.trim(),
      stance: parseStance(stanceField.trim(), finding.trim()),
      year: yearMatch ? Number(yearMatch[1]) : null,
      words: words(finding).length,
    };
  });

  const groups: ReviewGroup[] = [
    ...STANCES.map((stance) => ({
      id: stance.id,
      label: stance.label,
      prompt: stance.prompt,
      sources: sources.filter((source) => source.stance === stance.id),
    })),
    {
      id: UNSTANCED,
      label: "Unstanced",
      prompt: "These sources have no stated position yet:",
      sources: sources.filter((source) => source.stance === UNSTANCED),
    },
  ];

  const scaffold = groups
    .filter((group) => group.sources.length > 0)
    .map((group) =>
      [
        `${group.label} — ${group.prompt}`,
        ...group.sources.map((source) => `  - ${source.citation}${source.finding ? `: ${source.finding}` : ""}`),
      ].join("\n"),
    )
    .join("\n\n");

  const checks: string[] = [];
  if (sources.length === 0) checks.push("Paste one source per line as citation | finding | stance.");

  const noYear = sources.filter((source) => source.year === null);
  if (noYear.length > 0) {
    checks.push(`${noYear.length} source${noYear.length === 1 ? " has" : "s have"} no year: ${noYear.map((source) => source.citation).join(", ")}.`);
  }
  const noFinding = sources.filter((source) => source.finding.length === 0);
  if (noFinding.length > 0) {
    checks.push(`${noFinding.length} source${noFinding.length === 1 ? " has" : "s have"} no finding recorded — the citation alone is not a review.`);
  }
  const thin = sources.filter((source) => source.finding.length > 0 && source.words < 4);
  if (thin.length > 0) {
    checks.push(`${thin.length} finding${thin.length === 1 ? " is" : "s are"} under four words: too thin to synthesise later.`);
  }
  const stances = new Set(sources.map((source) => source.stance));
  if (sources.length >= 3 && !stances.has("challenges")) {
    checks.push("No source disagrees with any other; a review with no tension reads as an annotated bibliography.");
  }
  if (sources.length >= 3 && stances.has(UNSTANCED) && stances.size === 1) {
    checks.push("No source has a stated stance; record whether each finding agrees, disagrees or extends.");
  }
  const duplicates = sources
    .map((source) => source.citation.toLowerCase().replace(/\s+/g, " "))
    .filter((citation, index, all) => citation.length > 0 && all.indexOf(citation) !== index);
  if (duplicates.length > 0) {
    checks.push(`Duplicate citation${duplicates.length === 1 ? "" : "s"}: ${[...new Set(duplicates)].join(", ")}.`);
  }
  if (sources.length > 25) {
    checks.push(`${sources.length} sources is more than one review section can carry; group them by theme first.`);
  }

  return {
    sources,
    groups,
    scaffold,
    checks,
    counts: {
      total: sources.length,
      withYear: sources.filter((source) => source.year !== null).length,
      withStance: sources.filter((source) => source.stance !== UNSTANCED).length,
    },
  };
}
