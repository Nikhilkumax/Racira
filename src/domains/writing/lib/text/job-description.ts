/**
 * Job description writer: a posting assembled from your lines, checked against
 * the inclusive-hiring guidance recruiters publish.
 *
 * The checks are the documented ones. Coded language — rockstar, ninja, guru,
 * dominant, work hard play hard — measurably narrows who applies, so the words
 * are listed by name. A requirements list that runs long, or where nothing is
 * marked as nice-to-have, reads as a filter rather than an invitation. Bullets
 * that open with "responsible for" hide the verb, and missing salary, location
 * or application instructions cost the candidates who were deciding quickly.
 * None of this is policy; it is the published consensus, applied to your list.
 */
import { words } from "./tokenize.ts";

export interface JobSection {
  id: string;
  label: string;
  prompt: string;
  items: string[];
  text: string;
}

export interface JobDescription {
  sections: JobSection[];
  output: string;
  counts: { responsibilities: number; requirements: number; niceToHave: number };
  checks: string[];
}

export interface JobInput {
  title?: string;
  company?: string;
  purpose?: string;
  responsibilities?: string;
  requirements?: string;
  niceToHave?: string;
  salary?: string;
  location?: string;
  apply?: string;
}

/** Coded language documented to narrow applicant pools. */
export const CODED_WORDS: readonly string[] = [
  "rockstar",
  "rock star",
  "ninja",
  "guru",
  "wizard",
  "superhero",
  "dominant",
  "aggressive",
  "competitive",
  "killer",
  "crush",
  "work hard play hard",
  "fast-paced",
  "hustle",
  "manpower",
  "chairman",
];

/** Lead-ins that hide the verb in a responsibility. */
export const WEAK_LEADINS: readonly string[] = ["responsible for", "duties include", "tasks include", "in charge of", "help with"];

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");
const lines = (value: string): string[] =>
  (value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);

/** Assemble the posting and check it against the published guidance. */
export function buildJobDescription(input: JobInput = {}): JobDescription {
  const title = clean(input.title ?? "");
  const company = clean(input.company ?? "");
  const purpose = clean(input.purpose ?? "");
  const responsibilities = lines(input.responsibilities ?? "");
  const requirements = lines(input.requirements ?? "");
  const niceToHave = lines(input.niceToHave ?? "");
  const salary = clean(input.salary ?? "");
  const location = clean(input.location ?? "");
  const apply = clean(input.apply ?? "");

  const sections: JobSection[] = [
    {
      id: "title",
      label: "Title",
      prompt: "The title a candidate would search for.",
      items: [],
      text: title ? (company ? `${title} at ${company}` : title) : "(title not set)",
    },
    {
      id: "purpose",
      label: "Why this role",
      prompt: "Two or three sentences: what the role exists to do, and what changes when it goes well.",
      items: [],
      text: purpose || "(say what the role exists to do.)",
    },
    {
      id: "responsibilities",
      label: "What you will do",
      prompt: "Five to seven bullets, each opening with a verb.",
      items: responsibilities,
      text: responsibilities.length > 0 ? responsibilities.map((item) => `- ${item}`).join("\n") : "(list the responsibilities.)",
    },
    {
      id: "requirements",
      label: "What you bring",
      prompt: "Only what the work genuinely requires; if the list is long, move the rest to nice-to-have.",
      items: requirements,
      text: requirements.length > 0 ? requirements.map((item) => `- ${item}`).join("\n") : "(list the requirements.)",
    },
    {
      id: "niceToHave",
      label: "Nice to have",
      prompt: "The parts that help but are not required.",
      items: niceToHave,
      text: niceToHave.length > 0 ? niceToHave.map((item) => `- ${item}`).join("\n") : "(nothing separated as optional yet.)",
    },
    {
      id: "terms",
      label: "Pay and location",
      prompt: "Salary or range, location and working arrangement.",
      items: [],
      text: [salary ? `Pay: ${salary}` : "Pay: (state a range.)", location ? `Location: ${location}` : "Location: (state where the work happens.)"].join("\n"),
    },
    {
      id: "apply",
      label: "How to apply",
      prompt: "One route, one contact, and what to send.",
      items: [],
      text: apply || "(say what to send and where.)",
    },
  ];

  const output = sections.map((section) => `${section.label}\n${section.text}`).join("\n\n");

  const checks: string[] = [];
  if (!title) checks.push("No title; candidates search for the role by the name you give it.");
  if (!purpose) checks.push("No purpose statement; the first paragraph is where a candidate decides whether to read on.");
  if (responsibilities.length < 3) {
    checks.push(`${responsibilities.length} responsibilit${responsibilities.length === 1 ? "y is" : "ies are"} too few to describe the role.`);
  }
  if (requirements.length > 12) {
    checks.push(`${requirements.length} requirements is a filter rather than an invitation; move everything not truly required to the nice-to-have list.`);
  }
  if (requirements.length >= 8 && niceToHave.length === 0) {
    checks.push(`Nothing is marked nice-to-have against ${requirements.length} requirements; separate the optional items so a strong candidate can see a route in.`);
  }

  const haystack = [title, purpose, ...responsibilities, ...requirements, ...niceToHave].join(" ").toLowerCase();
  const coded = CODED_WORDS.filter((word) => haystack.includes(word));
  if (coded.length > 0) {
    checks.push(`Coded language detected (${coded.join(", ")}): this wording is documented to narrow who applies.`);
  }
  const weak = responsibilities.filter((item) => WEAK_LEADINS.some((lead) => item.toLowerCase().startsWith(lead)));
  if (weak.length > 0) {
    checks.push(`${weak.length} responsibilit${weak.length === 1 ? "y opens" : "ies open"} with responsible for or similar; open with the verb — write the work, not the duty.`);
  }
  const longBullets = [...responsibilities, ...requirements].filter((item) => words(item).length > 25);
  if (longBullets.length > 0) {
    checks.push(`${longBullets.length} bullet${longBullets.length === 1 ? " runs" : "s run"} past 25 words; a bullet is a line a reader scans.`);
  }

  if (!salary) checks.push("No pay stated; postings without a range receive fewer and slower applications.");
  if (!location) checks.push("No location or working arrangement stated.");
  if (!apply) checks.push("No application instructions; say what to send and where.");

  return {
    sections,
    output,
    counts: { responsibilities: responsibilities.length, requirements: requirements.length, niceToHave: niceToHave.length },
    checks,
  };
}
