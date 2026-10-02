/**
 * Case study template: assemble a challenge, an approach, results and a quote
 * into the case study shape, then check the parts that make one credible — a
 * named client, at least two steps, results with figures in them.
 *
 * The engine writes no story and verifies no result; it supplies the order and
 * the prompts.
 */
import { words } from "./tokenize.ts";

export interface CaseStudyInput {
  client: string;
  sector: string;
  challenge: string;
  /** One step per line. */
  approach: string[];
  /** One per line: Metric | Value */
  results: string[];
  quote: string;
}

export interface CaseStudyResult {
  metric: string;
  value: string;
  quantified: boolean;
}

export interface CaseStudyCheck {
  id: string;
  message: string;
}

export interface CaseStudyDraft {
  study: string;
  words: number;
  results: CaseStudyResult[];
  checks: CaseStudyCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function parseResults(lines: string[]): CaseStudyResult[] {
  return lines
    .map(clean)
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map(clean);
      const metric = parts[0] ?? "";
      const value = parts[1] ?? "";
      return { metric, value, quantified: /\d/.test(value) };
    });
}

export function buildCaseStudy(input: CaseStudyInput): CaseStudyDraft {
  const client = clean(input.client);
  const sector = clean(input.sector);
  const challenge = clean(input.challenge);
  const approach = input.approach.map(clean).filter(Boolean);
  const results = parseResults(input.results);
  const quote = clean(input.quote);

  const blocks: string[] = [];
  if (client || sector) {
    const title = client ? `Case study: ${client}` : "Case study";
    blocks.push(sector ? `${title} (${sector})` : title);
  }
  if (challenge) blocks.push(`Challenge\n${challenge}`);
  if (approach.length > 0) {
    blocks.push(`Approach\n${approach.map((step, index) => `${index + 1}. ${step}`).join("\n")}`);
  }
  if (results.length > 0) {
    blocks.push(`Results\n${results.map((result) => `- ${result.metric}${result.value ? `: ${result.value}` : ""}`).join("\n")}`);
  }
  if (quote) blocks.push(quote);

  const study = blocks.join("\n\n");

  const checks: CaseStudyCheck[] = [];
  if (!client) checks.push({ id: "client", message: "Name the client; an anonymous case study persuades no one." });
  if (!challenge) checks.push({ id: "challenge", message: "State the challenge before the solution, in the client's terms." });
  if (approach.length < 2) {
    checks.push({ id: "approach", message: "List at least two steps; one line reads as a sales claim rather than a method." });
  }
  if (results.length === 0) {
    checks.push({ id: "results", message: "Add at least two results as metric | value — outcomes are what a reader came for." });
  } else if (results.length < 2) {
    checks.push({ id: "results-few", message: "A case study wants two or three results; one figure reads as a lucky number." });
  }
  if (results.length > 6) {
    checks.push({ id: "results-many", message: `${results.length} results is a dashboard; keep the three that decide it.` });
  }
  for (const result of results.filter((entry) => !entry.quantified)) {
    checks.push({ id: "result-figure", message: `Add a figure to "${result.metric}"; a result without a number is a compliment.` });
  }
  if (!quote) checks.push({ id: "quote", message: "Add a sentence of the client's own words; the quote is the proof the story is theirs." });

  return { study, words: words(study).length, results, checks };
}
