/**
 * Press release template: assemble a release from the dateline, the five Ws, a
 * quote, boilerplate and a contact, then check the shape.
 *
 * The engine composes the conventional structure and flags what is missing from
 * it — an unattributed quote, a headline with a closing period, no media
 * contact. It writes none of the news and takes no view of it.
 */
import { words } from "./tokenize.ts";

export interface PressReleaseInput {
  organisation: string;
  headline: string;
  city: string;
  date: string;
  what: string;
  who: string;
  when: string;
  where: string;
  why: string;
  /** Speaker | words */
  quote: string;
  boilerplate: string;
  contact: string;
}

export interface PressReleaseCheck {
  id: string;
  message: string;
}

export interface PressReleaseDraft {
  release: string;
  words: number;
  leadWords: number;
  checks: PressReleaseCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");
const endSentence = (line: string): string => (/[.!?]$/.test(line) ? line : `${line}.`);
const SMALL_WORDS = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "the", "to"]);
const titleCase = (line: string) =>
  line
    .split(" ")
    .map((word, index, parts) => {
      const lower = word.toLowerCase();
      const bare = lower.replace(/[^a-z]/g, "");
      if (index > 0 && index < parts.length - 1 && SMALL_WORDS.has(bare)) return lower;
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");

export function buildPressRelease(input: PressReleaseInput): PressReleaseDraft {
  const organisation = clean(input.organisation);
  const headline = clean(input.headline).replace(/\.$/, "");
  const city = clean(input.city);
  const date = clean(input.date);
  const what = clean(input.what);
  const who = clean(input.who);
  const when = clean(input.when);
  const where = clean(input.where);
  const why = clean(input.why);
  const boilerplate = clean(input.boilerplate);
  const contact = clean(input.contact);

  const quoteParts = clean(input.quote).split("|").map(clean);
  const speaker = quoteParts.length > 1 ? quoteParts[0] : "";
  const quoteText = quoteParts.length > 1 ? quoteParts.slice(1).join(" | ") : quoteParts[0] ?? "";

  const blocks: string[] = ["FOR IMMEDIATE RELEASE"];
  if (headline) blocks.push(titleCase(headline));
  if (what) blocks.push(`${city ? `${city.toUpperCase()}, ` : ""}${date ? `${date} — ` : ""}${endSentence(what)}`);
  if (who) blocks.push(endSentence(who));
  if (when || where) blocks.push([when, where].filter(Boolean).map(endSentence).join(" "));
  if (why) blocks.push(endSentence(why));
  if (quoteText) blocks.push(`${quoteText.startsWith('"') ? quoteText : `"${quoteText}"`}${speaker ? ` said ${speaker}.` : ""}`);
  if (organisation || boilerplate) {
    blocks.push([organisation ? `About ${organisation}` : "", boilerplate].filter(Boolean).join("\n"));
  }
  if (contact) blocks.push(`Media contact: ${contact}`);

  const release = blocks.join("\n\n");

  const checks: PressReleaseCheck[] = [];
  if (!organisation) checks.push({ id: "organisation", message: "Name the organisation issuing the release." });
  if (!headline) {
    checks.push({ id: "headline", message: "Add a headline: a short, factual phrase a news desk can reuse." });
  } else {
    const count = words(headline).length;
    if (count > 12) checks.push({ id: "headline-long", message: `The headline runs ${count} words; press headlines are usually twelve or fewer.` });
    if (/\.$/.test(clean(input.headline))) checks.push({ id: "headline-period", message: "Drop the closing period — headlines are set without one." });
  }
  if (!city || !date) checks.push({ id: "dateline", message: "Add the dateline — city and date — because editors strip releases without one." });
  if (!what) checks.push({ id: "what", message: "The lead must say what happened in one sentence." });
  if (!who) checks.push({ id: "who", message: "Say who is affected or involved." });
  if (!when || !where) checks.push({ id: "when-where", message: "Add timing and place, even briefly: they are the details a reader checks first." });
  if (!why) checks.push({ id: "why", message: "Say why it matters; a release without a reason is an announcement, not news." });
  if (!quoteText) {
    checks.push({ id: "quote", message: "Add a quote from someone who can speak for the organisation." });
  } else if (!speaker) {
    checks.push({ id: "quote-speaker", message: "Attribute the quote as speaker | words, so the reader knows who said it." });
  }
  if (!boilerplate) checks.push({ id: "boilerplate", message: "Add a short About paragraph with the details an editor reuses." });
  if (!contact) checks.push({ id: "contact", message: "Add a media contact; a release with no contact is a dead end." });

  const lead = [what, who, why].filter(Boolean).join(" ");

  return {
    release,
    words: words(release).length,
    leadWords: words(lead).length,
    checks,
  };
}
