/**
 * Newsletter template builder: turn a name, an issue number, a list of sections
 * and a sign-off into the skeleton of an issue, with a purpose line under each
 * section heading.
 *
 * The engine assembles the issue's shape and checks it: too few sections, a
 * heading that is really a sentence, no next step, no sign-off. It writes none
 * of the content.
 */
import { words } from "./tokenize.ts";

export interface NewsletterInput {
  name: string;
  issue: string;
  /** One per line: Heading | one-line purpose */
  sections: string[];
  cta: string;
  signOff: string;
}

export interface NewsletterSection {
  heading: string;
  purpose: string;
}

export interface NewsletterCheck {
  id: string;
  message: string;
}

export interface NewsletterDraft {
  newsletter: string;
  words: number;
  sections: NewsletterSection[];
  checks: NewsletterCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function parseSections(lines: string[]): NewsletterSection[] {
  return lines
    .map(clean)
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map(clean);
      return { heading: parts[0] ?? "", purpose: parts[1] ?? "" };
    });
}

export function buildNewsletter(input: NewsletterInput): NewsletterDraft {
  const name = clean(input.name);
  const issue = clean(input.issue);
  const sections = parseSections(input.sections);
  const cta = clean(input.cta);
  const signOff = clean(input.signOff);

  const blocks: string[] = [];
  const masthead = [name, issue ? `Issue ${issue}` : ""].filter(Boolean).join(" — ");
  if (masthead) blocks.push(masthead);
  for (const section of sections) {
    blocks.push([section.heading, section.purpose].filter(Boolean).join("\n"));
  }
  if (cta) blocks.push(`Next step\n${cta}`);
  if (signOff) blocks.push(signOff);

  const newsletter = blocks.join("\n\n");

  const checks: NewsletterCheck[] = [];
  if (!name) checks.push({ id: "name", message: "Name the newsletter; the masthead is the first thing a reader sees." });
  if (!issue) checks.push({ id: "issue", message: "Add the issue number or date so readers can place the send." });
  if (sections.length < 3) {
    checks.push({
      id: "sections",
      message: `Only ${sections.length} section${sections.length === 1 ? "" : "s"} so far; an issue usually carries at least three.`,
    });
  }
  if (sections.length > 6) {
    checks.push({ id: "sections-many", message: `${sections.length} sections will not fit one scroll; keep the issue to six.` });
  }
  for (const section of sections) {
    const count = section.heading.split(/\s+/).filter(Boolean).length;
    if (count > 8) {
      checks.push({ id: "heading-long", message: `The heading "${section.heading}" runs ${count} words; keep headings phrases.` });
    }
  }
  for (const section of sections.filter((entry) => !entry.purpose)) {
    checks.push({ id: "purpose", message: `Add a purpose line under "${section.heading}" — one sentence on what it does for the reader.` });
  }
  if (!cta) checks.push({ id: "cta", message: "Add one next step; a newsletter with several asks gets none of them done." });
  if (!signOff) checks.push({ id: "sign-off", message: "Sign off with a name or a line that closes the issue." });

  return { newsletter, words: words(newsletter).length, sections, checks };
}
