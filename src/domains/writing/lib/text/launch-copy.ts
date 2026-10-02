/**
 * Product launch copy builder: assemble the announcement skeleton — what is
 * new, who it is for, why it matters, the date and one next step — and check
 * that nothing essential is missing.
 *
 * The engine composes the announcement's shape and checks it; the news and the
 * claims are the writer's.
 */
import { words } from "./tokenize.ts";

export interface LaunchCopyInput {
  product: string;
  date: string;
  audience: string;
  what: string;
  why: string;
  cta: string;
}

export interface LaunchCopyCheck {
  id: string;
  message: string;
}

export interface LaunchCopyDraft {
  copy: string;
  words: number;
  checks: LaunchCopyCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function buildLaunchCopy(input: LaunchCopyInput): LaunchCopyDraft {
  const product = clean(input.product);
  const date = clean(input.date);
  const audience = clean(input.audience);
  const what = clean(input.what);
  const why = clean(input.why);
  const cta = clean(input.cta);

  const blocks: string[] = [];
  const masthead = [product, date ? `launching ${date}` : ""].filter(Boolean).join(" — ");
  if (masthead) blocks.push(masthead);
  if (what) blocks.push(`What is new\n${what}`);
  if (audience) blocks.push(`Who it is for\n${audience}`);
  if (why) blocks.push(`Why it matters\n${why}`);
  if (cta) blocks.push(`Next step\n${cta}`);

  const copy = blocks.join("\n\n");

  const checks: LaunchCopyCheck[] = [];
  if (!product) checks.push({ id: "product", message: "Name the product — an announcement without a subject is a rumour." });
  if (!date) checks.push({ id: "date", message: "Add the date, even a rough one; readers plan around it and writers need the deadline." });
  else if (!/\d/.test(date)) checks.push({ id: "date-vague", message: `"${date}" contains no date; write one that can be circled.` });
  if (!what) checks.push({ id: "what", message: "Say what is new in one or two sentences." });
  else if (words(what).length > 30) {
    checks.push({ id: "what-long", message: `The what runs ${words(what).length} words; keep an announcement to a breath.` });
  }
  if (!audience) checks.push({ id: "audience", message: "Name who the launch is for; it tells readers whether to keep reading." });
  if (!why) checks.push({ id: "why", message: "Say why it matters; newness alone is not news to anyone but the maker." });
  if (!cta) checks.push({ id: "cta", message: "Add one next step: try it, join the list, read the post." });

  return { copy, words: words(copy).length, checks };
}
