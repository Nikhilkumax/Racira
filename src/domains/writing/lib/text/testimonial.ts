/**
 * Testimonial formatter: one testimonial per line, formatted for a wall, a
 * carousel and a pull quote at once, with the weaknesses named.
 *
 * The line format is `quote | name | role`, and the formatter does three jobs.
 * It attributes — a quote with no name beside it is an assertion, not a
 * testimonial. It measures — past fifty words a quote stops being read, and
 * under twenty it is slide-ready. And it checks for specificity: the phrases
 * every business collects ("great service", "highly recommend") describe
 * nothing a reader can weigh, and a set of testimonials with no number or
 * result in any of them is decoration rather than evidence.
 */
import { words } from "./tokenize.ts";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  wordCount: number;
  attributed: boolean;
  slideReady: boolean;
  hasResult: boolean;
}

export interface TestimonialSet {
  items: Testimonial[];
  formatted: string;
  slideReady: string;
  pullQuote: string;
  counts: { total: number; attributed: number; slideReady: number; withResult: number };
  checks: string[];
}

/** Phrases that describe no outcome. */
export const VAGUE_PHRASES: readonly string[] = [
  "great service",
  "highly recommend",
  "amazing",
  "fantastic",
  "best ever",
  "very helpful",
  "excellent service",
  "wonderful",
  "top notch",
  "five stars",
];

/** Longest quote a reader will finish inline. */
export const LONG_QUOTE_WORDS = 50;
/** Shortest useful slide quote. */
export const SLIDE_QUOTE_WORDS = 20;

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Parse, format and check the testimonial set. */
export function formatTestimonials(text: string): TestimonialSet {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const items: Testimonial[] = lines.map((line) => {
    const [quote = "", name = "", role = ""] = line.split(/\s*\|\s*/);
    const cleaned = clean(quote);
    const count = words(cleaned).length;
    return {
      quote: cleaned,
      name: clean(name),
      role: clean(role),
      wordCount: count,
      attributed: clean(name).length > 0,
      slideReady: count > 0 && count <= SLIDE_QUOTE_WORDS,
      hasResult: /\d/.test(cleaned),
    };
  });

  const formatted = items
    .map((item) =>
      [`"${item.quote}"`, item.attributed ? `— ${item.name}${item.role ? `, ${item.role}` : ""}` : "— (unattributed)"].join("\n"),
    )
    .join("\n\n");

  const slideReady = items
    .filter((item) => item.slideReady && item.attributed)
    .map((item) => `"${item.quote}" — ${item.name}`)
    .join("\n\n");

  const pullQuote = items
    .filter((item) => item.attributed && item.wordCount <= LONG_QUOTE_WORDS)
    .sort((a, b) => b.wordCount - a.wordCount)[0];

  const counts = {
    total: items.length,
    attributed: items.filter((item) => item.attributed).length,
    slideReady: items.filter((item) => item.slideReady && item.attributed).length,
    withResult: items.filter((item) => item.hasResult).length,
  };

  const checks: string[] = [];
  if (items.length === 0) {
    checks.push("No testimonials yet. Paste one per line as quote | name | role.");
  } else if (items.length < 3) {
    checks.push(`${items.length} testimonial${items.length === 1 ? "" : "s"}; three to six is the range that reads as a pattern rather than a favour.`);
  }
  const unattributed = items.filter((item) => !item.attributed);
  if (unattributed.length > 0) {
    checks.push(`${unattributed.length} testimonial${unattributed.length === 1 ? " has" : "s have"} no name attached; a quote without attribution is an assertion.`);
  }
  const long = items.filter((item) => item.wordCount > LONG_QUOTE_WORDS);
  if (long.length > 0) {
    checks.push(`${long.length} quote${long.length === 1 ? " runs" : "s run"} past ${LONG_QUOTE_WORDS} words; cut to the sentence that carries the result.`);
  }
  const vague = items.filter((item) =>
    VAGUE_PHRASES.some((phrase) => item.quote.toLowerCase().includes(phrase)),
  );
  if (vague.length > 0) {
    checks.push(
      `${vague.length} quote${vague.length === 1 ? "" : "s"} use${vague.length === 1 ? "s" : ""} phrasing that could describe any business ("${vague[0].quote.slice(0, 60)}${vague[0].quote.length > 60 ? "…" : ""}"); ask for the specific before-and-after instead.`,
    );
  }
  if (items.length > 0 && counts.withResult === 0) {
    checks.push("No testimonial names a number or a result; one counted outcome is worth several enthusiastic sentences.");
  }
  const openings = items.map((item) => item.quote.toLowerCase().split(/\s+/).slice(0, 3).join(" "));
  const duplicateOpenings = [...new Set(openings.filter((opening, index) => opening.length > 0 && openings.indexOf(opening) !== index))];
  if (duplicateOpenings.length > 0) {
    checks.push(`${duplicateOpenings.length} pair${duplicateOpenings.length === 1 ? "" : "s"} of testimonials open with the same words; vary the order so a wall does not read as one voice.`);
  }
  if (counts.slideReady === 0 && items.length > 0) {
    checks.push(`No quote is under ${SLIDE_QUOTE_WORDS} words; the carousel needs one short, specific line to lead with.`);
  }

  return { items, formatted, slideReady, pullQuote: pullQuote ? `"${pullQuote.quote}" — ${pullQuote.name}` : "", counts, checks };
}
