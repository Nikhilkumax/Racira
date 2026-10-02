/**
 * Blog post outline builder: shape a working title, an audience, the points the
 * post must make and a call to action into a numbered outline.
 *
 * The engine supplies the skeleton — introduction, one numbered point per
 * takeaway, conclusion, CTA — and checks the shape: too few points, points that
 * have grown into paragraphs, a title that is really a sentence.
 */
import { words } from "./tokenize.ts";

export interface BlogOutlineInput {
  title: string;
  audience: string;
  takeaways: string[];
  cta: string;
}

export interface BlogOutlineCheck {
  id: string;
  message: string;
}

export interface BlogOutlineDraft {
  outline: string;
  words: number;
  sections: number;
  checks: BlogOutlineCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function buildBlogOutline(input: BlogOutlineInput): BlogOutlineDraft {
  const title = clean(input.title);
  const audience = clean(input.audience);
  const takeaways = input.takeaways.map(clean).filter(Boolean);
  const cta = clean(input.cta);

  const blocks: string[] = [];
  if (title) blocks.push(`Working title: ${title}`);
  if (audience) blocks.push(`For: ${audience}`);
  blocks.push(
    audience
      ? `Introduction — state the promise and why it matters to ${audience}.`
      : "Introduction — state the promise of the post.",
  );
  takeaways.forEach((takeaway, index) => {
    blocks.push(`${index + 1}. ${takeaway}\n   Support this point with an example, a number or a short story.`);
  });
  blocks.push("Conclusion — restate the promise and hand off to the next step.");
  if (cta) blocks.push(`CTA: ${cta}`);

  const outline = blocks.join("\n\n");

  const checks: BlogOutlineCheck[] = [];
  if (!title) {
    checks.push({ id: "title", message: "Add a working title so the outline has a promise to keep." });
  } else if (words(title).length > 12) {
    checks.push({ id: "title-long", message: `The title runs ${words(title).length} words; keep a working title under twelve.` });
  }
  if (!audience) {
    checks.push({ id: "audience", message: "Name the reader; a post written for everyone is written for no one." });
  }
  if (takeaways.length < 3) {
    checks.push({
      id: "takeaways",
      message: `Only ${takeaways.length} point${takeaways.length === 1 ? "" : "s"} so far; a useful post usually makes at least three.`,
    });
  }
  if (takeaways.length > 7) {
    checks.push({ id: "takeaways-many", message: `${takeaways.length} points is more than a post can carry; split it or cut to seven.` });
  }
  for (const takeaway of takeaways) {
    const count = words(takeaway).length;
    if (count > 20) checks.push({ id: "takeaway-long", message: `One point runs ${count} words; a heading should be a phrase, not a paragraph.` });
  }
  if (!cta) {
    checks.push({ id: "cta", message: "Add a call to action: one thing the reader should do next." });
  }

  return {
    outline,
    words: words(outline).length,
    sections: takeaways.length + 2,
    checks,
  };
}
