import { createElement, type ReactNode } from "react";

/**
 * Lightweight HTML-to-React parser for SEO content.
 * Handles the subset of HTML used in tool-seo.ts: <p>, <strong>, <em>, <br>, <a>.
 * Avoids dangerouslySetInnerHTML which causes hydration mismatches in RSC.
 */
/** Strip outer block-level wrapper tags that cause invalid nesting when rendered inside a <p>.
 * Handles nested patterns like <h2><p>...</p></h2> recursively. */
function stripBlockWrappers(html: string): string {
  let trimmed = html.trim();
  const blockTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "section", "article", "blockquote"];
  let changed = true;
  while (changed) {
    changed = false;
    for (const tag of blockTags) {
      const open = `<${tag}>`;
      const close = `</${tag}>`;
      if (trimmed.startsWith(open) && trimmed.endsWith(close)) {
        trimmed = trimmed.slice(open.length, -close.length).trim();
        changed = true;
        break;
      }
    }
  }
  return trimmed;
}

/**
 * Valid inline HTML tag names this parser supports.
 * Used to distinguish real tags from bare angle brackets in text
 * (e.g. "< becomes &lt;" in SEO content about HTML entities).
 */
const VALID_INLINE_TAGS = new Set([
  "strong", "em", "b", "i", "u", "s", "code", "pre",
  "a", "br", "sup", "sub", "small", "mark", "span",
  "ol", "ul", "li", "h3", "p",
]);

export function htmlToReact(html: string): ReactNode {
  html = stripBlockWrappers(html);
  // If no HTML tags, return as-is
  if (!html.includes("<")) return html;

  const nodes: ReactNode[] = [];
  let remaining = html;
  let key = 0;

  while (remaining.length > 0) {
    // Find next <
    const tagStart = remaining.indexOf("<");
    if (tagStart === -1) {
      // No more tags — rest is text
      if (remaining) nodes.push(remaining);
      break;
    }

    // Text before the <
    if (tagStart > 0) {
      nodes.push(remaining.slice(0, tagStart));
      remaining = remaining.slice(tagStart);
    }

    // Extract tag content between < and >
    const tagEnd = remaining.indexOf(">");
    if (tagEnd === -1) {
      nodes.push(remaining);
      break;
    }

    const tagContent = remaining.slice(1, tagEnd).trim(); // between < and >
    remaining = remaining.slice(tagEnd + 1);

    // Extract tag name
    const spaceIdx = tagContent.indexOf(" ");
    const rawName = spaceIdx === -1 ? tagContent : tagContent.slice(0, spaceIdx);
    const tagName = rawName.replace(/\//g, "").trim();

    // Validate: if this isn't a known inline tag, treat the < as literal text
    if (!VALID_INLINE_TAGS.has(tagName)) {
      nodes.push("<" + tagContent + ">" + remaining);
      remaining = "";
      continue;
    }

    // Self-closing tags
    if (tagContent.endsWith("/")) {
      if (tagName === "br") {
        nodes.push(createElement("br", { key: key++ }));
      }
      continue;
    }

    // Extract attributes for <a> tags
    const props: Record<string, string | number> = {};
    if (tagName === "a" && spaceIdx !== -1) {
      const attrs = tagContent.slice(spaceIdx + 1);
      const hrefMatch = attrs.match(/href="([^"]*)"/);
      if (hrefMatch) props.href = hrefMatch[1];
    }

    // Find matching closing tag
    const closingTag = `</${tagName}>`;
    const closingIdx = remaining.indexOf(closingTag);
    let innerContent: string;
    if (closingIdx === -1) {
      innerContent = remaining;
      remaining = "";
    } else {
      innerContent = remaining.slice(0, closingIdx);
      remaining = remaining.slice(closingIdx + closingTag.length);
    }

    // Recursively parse inner content
    const children = innerContent.includes("<")
      ? htmlToReact(innerContent)
      : innerContent;

    props.key = key++;
    nodes.push(createElement(tagName, props, children));
  }

  return nodes.length === 1 ? nodes[0] : nodes;
}
