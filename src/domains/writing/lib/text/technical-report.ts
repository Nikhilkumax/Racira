/**
 * Technical report template: seven standard sections assembled into a numbered
 * report, with the sections a reader will look for first checked rather than
 * assumed.
 *
 * The checks are the parts of a report that are missing most often and cost the
 * most: a scope statement that never names an audience, findings with no
 * evidence behind them, recommendations with no owner and no date, risks absent
 * while recommendations are present, and sections so thin that they are
 * headings rather than content. Each check names the section it belongs to and
 * says what the reader loses without it.
 */
import { words } from "./tokenize.ts";

export interface ReportSectionSpec {
  id: string;
  label: string;
  purpose: string;
  required: boolean;
}

/** The seven sections, in the order they are assembled. */
export const REPORT_SECTIONS: readonly ReportSectionSpec[] = [
  { id: "summary", label: "Summary", purpose: "The finding and the recommendation in three sentences.", required: true },
  { id: "scope", label: "Scope and audience", purpose: "What was examined, what was not, and who is reading.", required: true },
  { id: "background", label: "Background", purpose: "The situation and the question the work was asked to answer.", required: false },
  { id: "findings", label: "Findings", purpose: "What was observed, with the evidence behind each point.", required: true },
  { id: "risks", label: "Risks and limitations", purpose: "What could go wrong and what the work could not establish.", required: true },
  { id: "recommendations", label: "Recommendations", purpose: "What to do next, with an owner and a date for each item.", required: true },
  { id: "appendix", label: "Appendix", purpose: "Raw data, calculations and references kept out of the body.", required: false },
];

/** Sections under this word count are headings rather than content. */
export const THIN_SECTION_WORDS = 10;

export interface ReportInput {
  title?: string;
  audience?: string;
  [section: string]: string | undefined;
}

export interface ReportSection {
  id: string;
  label: string;
  purpose: string;
  text: string;
  words: number;
  required: boolean;
  status: "empty" | "thin" | "filled";
}

export interface TechnicalReportDraft {
  output: string;
  sections: ReportSection[];
  words: number;
  missing: string[];
  checks: { id: string; message: string }[];
}

const EVIDENCE = /(\d|because|observed|measured|tested|compared|sample|log|record|data|shown|reported)/i;
const OWNER_AND_DATE = /(\bby \d{4}|\bby (january|february|march|april|may|june|july|august|september|october|november|december)|q[1-4]|owner|responsible|@|\b(month|week|quarter|day)s?\b)/i;

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Assemble the numbered report and check its load-bearing sections. */
export function buildTechnicalReport(input: ReportInput = {}): TechnicalReportDraft {
  const title = clean(input.title ?? "");
  const audience = clean(input.audience ?? "");

  const sections: ReportSection[] = REPORT_SECTIONS.map((spec) => {
    const text = clean(input[spec.id] ?? "");
    const count = words(text).length;
    const status: ReportSection["status"] = count === 0 ? "empty" : count < THIN_SECTION_WORDS ? "thin" : "filled";
    return { id: spec.id, label: spec.label, purpose: spec.purpose, text, words: count, required: spec.required, status };
  });
  const byId = new Map(sections.map((section) => [section.id, section]));
  const checks: { id: string; message: string }[] = [];

  if (!title) checks.push({ id: "title", message: "No title: a report is filed and retrieved by its title." });

  const scope = byId.get("scope");
  if (scope?.text) {
    if (!audience) {
      checks.push({ id: "scope-no-audience", message: "The scope section is written but no audience is set; say who the report is for." });
    } else {
      // Check the audience's content words rather than its first word, so
      // "the operations board" is not satisfied by the word "the".
      const AUDIENCE_STOPWORDS = new Set(["the", "and", "for", "with", "from", "this", "that", "their"]);
      const audienceWords = audience
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((word) => word.length > 3 && !AUDIENCE_STOPWORDS.has(word));
      const named = audienceWords.some((word) => scope.text.toLowerCase().includes(word));
      if (audienceWords.length > 0 && !named) {
        checks.push({ id: "scope-audience", message: `The audience is "${audience}" but the scope section never names them.` });
      }
    }
  }

  const findings = byId.get("findings");
  if (findings && findings.status !== "empty" && !EVIDENCE.test(findings.text)) {
    checks.push({
      id: "findings-no-evidence",
      message: "The findings carry no evidence markers — no figures, no observations and no sources; a reader cannot tell what was measured.",
    });
  }

  const recommendations = byId.get("recommendations");
  if (recommendations && recommendations.status !== "empty" && !OWNER_AND_DATE.test(recommendations.text)) {
    checks.push({
      id: "recommendations-unowned",
      message: "The recommendations name no owner and no date; an action with neither is a hope.",
    });
  }

  const risks = byId.get("risks");
  if (recommendations && recommendations.status !== "empty" && risks && risks.status === "empty") {
    checks.push({ id: "risks-missing", message: "Recommendations are written and the risks section is empty; every recommendation carries a risk." });
  }

  for (const section of sections) {
    if (section.required && section.status === "empty") {
      checks.push({ id: `required-${section.id}`, message: `${section.label} is required and empty. ${section.purpose}` });
    } else if (section.status === "thin") {
      checks.push({ id: `thin-${section.id}`, message: `${section.label} is ${section.words} words — a heading rather than content.` });
    }
  }

  const total = sections.reduce((sum, section) => sum + section.words, 0);
  const filled = sections.filter((section) => section.status !== "empty");
  const output = [
    title ? `Title: ${title}` : "Title: (untitled report)",
    audience ? `Prepared for: ${audience}` : "Prepared for: (audience not set)",
    "",
    ...filled.map((section, index) => `${index + 1}. ${section.label}\n${section.text}`),
    "",
    "Revision history: (add date, author and change)",
  ].join("\n");

  return {
    output,
    sections,
    words: total,
    missing: sections.filter((section) => section.required && section.status === "empty").map((section) => section.label),
    checks,
  };
}
