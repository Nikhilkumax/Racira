/**
 * Resume writer: assemble a plain-text resume from a header, a summary,
 * experience and education entries and a skills line, then check each line.
 *
 * Deterministic assembly plus structural prompts: entries with missing fields,
 * achievements with no number in them, a summary that has grown into an essay.
 * The engine writes no experience and invents no metric.
 */
import { words } from "./tokenize.ts";

export interface ResumeInput {
  name: string;
  title: string;
  contact: string;
  summary: string;
  /** One per line: Role | Company | Dates | Achievement */
  experience: string[];
  /** One per line: Degree | Institution | Year */
  education: string[];
  skills: string[];
}

export interface ExperienceEntry {
  role: string;
  company: string;
  dates: string;
  achievement: string;
  /** All four fields present. */
  complete: boolean;
  /** The achievement contains a digit. */
  quantified: boolean;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  complete: boolean;
}

export interface ResumeCheck {
  id: string;
  message: string;
}

export interface ResumeDraft {
  resume: string;
  words: number;
  sections: number;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  quantified: number;
  checks: ResumeCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

function splitPipes(line: string): string[] {
  return line.split("|").map((part) => clean(part));
}

export function parseExperience(lines: string[]): ExperienceEntry[] {
  return lines
    .map(clean)
    .filter(Boolean)
    .map((line) => {
      const parts = splitPipes(line);
      const entry: ExperienceEntry = {
        role: parts[0] ?? "",
        company: parts[1] ?? "",
        dates: parts[2] ?? "",
        achievement: parts[3] ?? "",
        complete: false,
        quantified: false,
      };
      entry.complete = parts.length >= 4 && parts.slice(0, 4).every((part) => part.length > 0);
      entry.quantified = /\d/.test(entry.achievement);
      return entry;
    });
}

export function parseEducation(lines: string[]): EducationEntry[] {
  return lines
    .map(clean)
    .filter(Boolean)
    .map((line) => {
      const parts = splitPipes(line);
      const entry: EducationEntry = {
        degree: parts[0] ?? "",
        institution: parts[1] ?? "",
        year: parts[2] ?? "",
        complete: parts.length >= 3 && parts.slice(0, 3).every((part) => part.length > 0),
      };
      return entry;
    });
}

export function buildResume(input: ResumeInput): ResumeDraft {
  const name = clean(input.name);
  const title = clean(input.title);
  const contact = clean(input.contact);
  const summary = clean(input.summary);
  const experience = parseExperience(input.experience);
  const education = parseEducation(input.education);
  const skills = input.skills.map(clean).filter(Boolean);

  const blocks: string[] = [];
  const header = [name, title, contact].filter(Boolean).join("\n");
  if (header) blocks.push(header);
  if (summary) blocks.push(`SUMMARY\n${summary}`);
  if (experience.length > 0) {
    const lines = experience.map((entry) => {
      const heading = [entry.role, entry.company].filter(Boolean).join(" — ");
      const dates = entry.dates ? ` (${entry.dates})` : "";
      const achievement = entry.achievement ? `\n  ${entry.achievement}` : "";
      return `${heading}${dates}${achievement}`.trimStart();
    });
    blocks.push(`EXPERIENCE\n${lines.join("\n\n")}`);
  }
  if (education.length > 0) {
    const lines = education.map((entry) => {
      const heading = [entry.degree, entry.institution].filter(Boolean).join(" — ");
      return `${heading}${entry.year ? `, ${entry.year}` : ""}`;
    });
    blocks.push(`EDUCATION\n${lines.join("\n")}`);
  }
  if (skills.length > 0) blocks.push(`SKILLS\n${skills.join(" · ")}`);

  const resume = blocks.join("\n\n");

  const checks: ResumeCheck[] = [];
  if (!name) checks.push({ id: "name", message: "Add your name to the header." });
  if (!contact) {
    checks.push({ id: "contact", message: "Add contact details (email, phone, location) so a reader can reach you." });
  }
  if (!summary) {
    checks.push({ id: "summary", message: "Add a two-line summary; it is the only paragraph a reader is sure to finish." });
  } else if (words(summary).length > 60) {
    checks.push({ id: "summary-long", message: `The summary runs ${words(summary).length} words; keep it under sixty.` });
  }
  if (experience.length === 0) {
    checks.push({ id: "experience", message: "Add at least one experience entry: role | company | dates | achievement." });
  }
  for (const entry of experience.filter((item) => !item.complete)) {
    checks.push({
      id: "entry-incomplete",
      message: `"${entry.role || "An entry"}" is missing a field; each line needs role | company | dates | achievement.`,
    });
  }
  for (const entry of experience.filter((item) => item.complete && !item.quantified)) {
    checks.push({
      id: "entry-unquantified",
      message: `${entry.role}: add a number (people, time, percentage) so the achievement is checkable.`,
    });
  }
  if (education.length === 0) {
    checks.push({ id: "education", message: "Add education — degree | institution | year — or remove the section." });
  }
  if (skills.length === 0) {
    checks.push({ id: "skills", message: "Add a short skills line; six to ten terms that match the role." });
  }
  if (skills.length > 12) {
    checks.push({ id: "skills-long", message: `${skills.length} skills dilutes the list; keep the ones the role asks for.` });
  }

  const sections = [summary, experience.length ? "experience" : "", education.length ? "education" : "", skills.length ? "skills" : ""].filter(Boolean).length;

  return {
    resume,
    words: words(resume).length,
    sections,
    experience,
    education,
    quantified: experience.filter((entry) => entry.quantified).length,
    checks,
  };
}
