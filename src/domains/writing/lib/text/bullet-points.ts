/**
 * Prose to bullets: one sentence per bullet, with an optional removal of a
 * listed leading connector.
 *
 * The engine does not summarise and does not rewrite. Each bullet is one
 * sentence from the source; the only edit it can make is dropping a connector
 * from the published list at the start of a sentence ("Additionally, ",
 * "However, ") and capitalising what follows. Existing list lines in the input
 * are preserved verbatim when asked, so a half-listened document does not lose
 * the items it already had.
 *
 * The trailing-punctuation option removes a single final period so bullets can
 * follow a house style that omits it; question marks, exclamation marks and
 * semicolons are never touched.
 */
import { sentenceTokens, wordTokens } from "./tokenize.ts";

/** Connectors removed from the start of a sentence, comma included. */
export const LEADING_CONNECTORS: readonly string[] = [
  "Additionally,",
  "Also,",
  "As a result,",
  "Consequently,",
  "Finally,",
  "First,",
  "Firstly,",
  "Furthermore,",
  "However,",
  "In addition,",
  "In conclusion,",
  "Meanwhile,",
  "Moreover,",
  "Nevertheless,",
  "Overall,",
  "Second,",
  "Secondly,",
  "Similarly,",
  "That said,",
  "Therefore,",
  "Third,",
  "Thirdly,",
  "Thus,",
];

const LIST_LINE = /^[ \t]*(?:[-*•‣]|\d+[.)]|\(\d+\))\s+(.+?)\s*$/;

export interface BulletPoint {
  /** The bullet text after the optional connector removal. */
  text: string;
  /** The source sentence, untouched. */
  source: string;
  /** The connector removed, or null. */
  removedConnector: string | null;
  index: number;
}

export interface BulletResult {
  bullets: BulletPoint[];
  /** Non-empty list lines in the input, kept verbatim. */
  existingListItems: { text: string; index: number }[];
  sentences: number;
  words: number;
}

export interface BulletOptions {
  /** Keep existing bullet/numbered lines as their own items, default true. */
  keepExistingLists?: boolean;
  /** Remove one trailing period from a bullet, default false. */
  stripTrailingPeriod?: boolean;
  locale?: string;
}

function stripConnector(sentence: string): { text: string; removed: string | null } {
  const lower = sentence.toLocaleLowerCase();
  for (const connector of LEADING_CONNECTORS) {
    if (lower.startsWith(connector.toLocaleLowerCase())) {
      const rest = sentence.slice(connector.length).trimStart();
      if (rest.length === 0) return { text: sentence, removed: null };
      const capitalised = rest[0].toLocaleUpperCase() + rest.slice(1);
      return { text: capitalised, removed: connector };
    }
  }
  return { text: sentence, removed: null };
}

/** One bullet per sentence, with existing list lines preserved. */
export function extractBullets(text: string, options: BulletOptions = {}): BulletResult {
  const keepExistingLists = options.keepExistingLists ?? true;
  const stripTrailingPeriod = options.stripTrailingPeriod ?? false;
  const locale = options.locale ?? "en";

  const existingListItems: { text: string; index: number }[] = [];
  let offset = 0;
  const proseLines: string[] = [];
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const match = line.match(LIST_LINE);
    if (match && match[1].trim().length > 0) {
      existingListItems.push({ text: match[1].trim(), index: offset + (line.length - line.trimStart().length) });
    } else {
      proseLines.push(line);
    }
    offset += line.length + 1;
  }

  const prose = proseLines.join("\n");
  const tokens = sentenceTokens(prose, locale);
  const bullets: BulletPoint[] = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.text.trim().length > 0)
    .map(({ token, index }) => {
      const source = token.text.trim();
      const { text: withoutConnector, removed } = stripConnector(source);
      const finalText =
        stripTrailingPeriod && withoutConnector.endsWith(".") && !withoutConnector.endsWith("..")
          ? withoutConnector.slice(0, -1)
          : withoutConnector;
      return { text: finalText, source, removedConnector: removed, index };
    });

  return {
    bullets,
    existingListItems: keepExistingLists ? existingListItems : [],
    sentences: bullets.length,
    words: wordTokens(text, locale).length,
  };
}

/** The bullets as a Markdown-style `- ` list, existing list items included. */
export function formatBulletList(result: BulletResult): string {
  const lines: string[] = [];
  for (const item of result.existingListItems) lines.push(`- ${item.text}`);
  for (const bullet of result.bullets) lines.push(`- ${bullet.text}`);
  return lines.join("\n");
}
