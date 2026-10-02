/**
 * Tagline generator: six short patterns that combine a brand, a benefit and an
 * audience into candidate taglines, plus checks for the faults a tagline cannot
 * carry — two benefits, a sentence where a phrase belongs.
 *
 * The patterns are fixed and visible; the engine picks nothing and edits
 * nothing. It is a way to see the same promise said six ways.
 */
import { words } from "./tokenize.ts";

export interface TaglineInput {
  brand: string;
  benefit: string;
  audience: string;
}

export interface TaglineCheck {
  id: string;
  message: string;
}

export interface TaglineDraft {
  taglines: string[];
  checks: TaglineCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function buildTaglines(input: TaglineInput): TaglineDraft {
  const brand = clean(input.brand);
  const benefit = clean(input.benefit);
  const audience = clean(input.audience);
  const benefitPhrase = benefit.replace(/\.$/, "");
  const capitalised = `${benefitPhrase.charAt(0).toUpperCase()}${benefitPhrase.slice(1)}`;

  const taglines: string[] = [];
  if (brand && benefit) {
    taglines.push(`${brand}. ${capitalised}.`);
    taglines.push(`${brand} — ${benefitPhrase}.`);
    if (audience) {
      taglines.push(`For ${audience} who want ${benefitPhrase}: ${brand}.`);
      taglines.push(`${brand} helps ${audience} ${benefitPhrase}.`);
      taglines.push(`${capitalised}. For ${audience}. By ${brand}.`);
    }
  }

  const checks: TaglineCheck[] = [];
  if (!brand) checks.push({ id: "brand", message: "Add the brand; a tagline that does not name it is a slogan for anyone." });
  if (!benefit) checks.push({ id: "benefit", message: "Add one benefit — the thing the reader gets, not what you do." });
  if (!audience) {
    checks.push({ id: "audience", message: "Name the audience; knowing who it excludes is half of what a tagline says." });
  }
  for (const tagline of taglines) {
    const count = words(tagline).length;
    if (count > 10) {
      checks.push({ id: "long", message: `"${tagline}" runs ${count} words; a tagline that needs a second breath is a sentence.` });
    }
  }
  if (/\band\b/i.test(benefit)) {
    checks.push({ id: "two-benefits", message: "The benefit contains \"and\", which usually means two benefits; keep the one that would survive being cut." });
  }
  if (/\b(we|our|us)\b/i.test(benefit)) {
    checks.push({ id: "first-person", message: "The benefit speaks about you rather than to the reader; rewrite it from their side." });
  }

  return { taglines, checks };
}
