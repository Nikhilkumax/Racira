/**
 * Markdown rendering and inspection for the Markdown editor tool.
 *
 * This uses the project's existing markdown-it dependency with raw HTML
 * disabled, so anything that looks like a tag in the source is escaped before it
 * reaches the renderer — the editor can render to HTML without a separate
 * sanitising step for its own content, and the component still runs DOMPurify
 * over the result as a belt-and-braces measure.
 *
 * The module is pure and synchronous: given a source string it returns HTML, the
 * heading outline and a token-count summary. Nothing touches the network.
 */
import MarkdownIt from "markdown-it";
import { wordTokens } from "./tokenize.ts";

const md = new MarkdownIt({ html: false, linkify: true, typographer: false, breaks: false });

export interface MarkdownHeading {
  level: number;
  text: string;
  slug: string;
}

export interface MarkdownStats {
  words: number;
  characters: number;
  lines: number;
  headings: number;
  links: number;
  images: number;
  codeBlocks: number;
  listItems: number;
  blockquotes: number;
  tables: number;
}

export interface MarkdownResult {
  html: string;
  headings: MarkdownHeading[];
  outline: MarkdownHeading[];
  stats: MarkdownStats;
}

/** A GitHub-style anchor slug for a heading, used for the outline. */
export function headingSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** The heading text with inline markdown stripped (bold, links, code spans). */
function inlineText(token: { children?: { type: string; content: string }[] | null; content: string }): string {
  if (token.children && token.children.length > 0) {
    return token.children
      .filter((child) => child.type === "text" || child.type === "code_inline")
      .map((child) => child.content)
      .join("")
      .trim();
  }
  return token.content.trim();
}

/** Render markdown to HTML plus its outline. HTML in the source is escaped. */
export function renderMarkdown(source: string): MarkdownResult {
  const tokens = md.parse(source, {});
  const headings: MarkdownHeading[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type !== "heading_open") continue;
    const level = Number(token.tag.slice(1)) || 1;
    const inline = tokens[index + 1];
    const text = inline ? inlineText(inline) : "";
    headings.push({ level, text: text || "(untitled heading)", slug: headingSlug(text) });
  }
  return {
    html: md.render(source),
    headings,
    outline: headings.filter((heading) => heading.level <= 3),
    stats: markdownStats(source),
  };
}

/** Counts that describe the source itself, not the rendered HTML. */
export function markdownStats(source: string): MarkdownStats {
  const tokens = md.parse(source, {});
  const stats: MarkdownStats = {
    words: wordTokens(source).length,
    characters: source.length,
    lines: source ? source.replace(/\r\n?/g, "\n").split("\n").length : 0,
    headings: 0,
    links: 0,
    images: 0,
    codeBlocks: 0,
    listItems: 0,
    blockquotes: 0,
    tables: 0,
  };
  const consider = (type: string): void => {
    switch (type) {
      case "heading_open":
        stats.headings += 1;
        break;
      case "link_open":
        stats.links += 1;
        break;
      case "image":
        stats.images += 1;
        break;
      case "fence":
      case "code_block":
        stats.codeBlocks += 1;
        break;
      case "list_item_open":
        stats.listItems += 1;
        break;
      case "blockquote_open":
        stats.blockquotes += 1;
        break;
      case "table_open":
        stats.tables += 1;
        break;
      default:
        break;
    }
  };
  // Block tokens are top-level; links and images live inside an inline token's
  // children, so both levels have to be walked.
  for (const token of tokens) {
    consider(token.type);
    if (token.children) for (const child of token.children) consider(child.type);
  }
  return stats;
}

/** The source's visible text with markdown syntax removed. */
export function markdownToPlainText(source: string): string {
  const tokens = md.parse(source, {});
  const pieces: string[] = [];
  for (const token of tokens) {
    if (token.type === "inline") pieces.push(inlineText(token));
    else if (token.type === "fence" || token.type === "code_block") pieces.push(token.content);
  }
  return pieces.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** A copyable Markdown outline: every heading, indented by level. */
export function markdownOutlineText(source: string): string {
  return renderMarkdown(source)
    .headings.map((heading) => `${"  ".repeat(Math.max(0, heading.level - 1))}- ${heading.text}`)
    .join("\n");
}
