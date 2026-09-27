"use client";

import { Fragment, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PRIVACY_SECURITY_BLOCK, type ToolSeo } from "./seo-types";

export type { ToolSeo, ToolSeoFaq, ToolSeoHowTo } from "./seo-types";

interface SeoContentProps {
  seo: ToolSeo;
  /** Display name used in the section headings and the HowTo schema name. */
  toolName: string;
  /**
   * Page-level H1 text. Leave undefined when the page shell already renders an
   * H1 for this route (the colors domain does) so the page never ships a second
   * heading element.
   */
  h1?: string;
  /**
   * Route prefix that `{{slug|display text}}` links resolve against, e.g.
   * `/typography`. Defaults to the colors domain, which was the first consumer
   * of this component.
   */
  basePath?: string;
}

const toParagraphs = (value: string): string[] =>
  value
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

interface ContentBlock {
  type: "p" | "ul";
  lines: string[];
}

/**
 * Splits authored `content` into render blocks. Blank lines separate blocks; a
 * block whose every line starts with `- ` (or `• `) renders as a `<ul>`, any
 * other block as a paragraph with its lines joined. Blocks stay direct children
 * of `.seo-prose` so the container's `space-y-6` rhythm is preserved.
 */
const toBlocks = (value: string): ContentBlock[] =>
  value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const isList = lines.length > 0 && lines.every((line) => /^[-•]\s+/.test(line));
      return isList
        ? { type: "ul" as const, lines: lines.map((line) => line.replace(/^[-•]\s+/, "")) }
        : { type: "p" as const, lines: [block.replace(/\s*\n\s*/g, " ")] };
    });

/**
 * Emphasis markers. Accepted so legacy/regenerated copy cannot break rendering,
 * but body copy always renders them as plain text (see `plain`) — only the FAQ
 * question line still renders them as `<strong>`.
 */
const EMPHASIS = /\*\*([^*]+)\*\*/g;

/**
 * Body copy renders at a single, plain weight: `**emphasis**` markers are
 * unwrapped instead of becoming <strong>, so paragraphs, numbered steps, list
 * items, callouts and FAQ answers all read as uniform prose. Headings and the
 * FAQ question line are the only bold elements left on the page.
 *
 * Done here — not via CSS — so regenerated content that still carries `**`
 * markers cannot reintroduce bold runs in body copy.
 */
const plain = (text: string): string => text.replace(EMPHASIS, "$1");

/**
 * Renders `**bold**` spans; used only where emphasis is still allowed — the FAQ
 * question line. Everything else goes through `plain()`.
 */
const withEmphasis = (text: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(EMPHASIS)) {
    const at = match.index ?? 0;
    if (at > cursor) nodes.push(text.slice(cursor, at));
    nodes.push(<strong key={`em-${at}`}>{match[1]}</strong>);
    cursor = at + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
};

/**
 * Inline sibling-tool link syntax for the "vs related tools" copy:
 * `{{slug|display text}}`.
 *
 * This is the ONLY markup the authored copy may carry besides `**`, and it
 * expands to a real internal `next/link` anchor — nothing else. The parser
 * deliberately has no notion of raw HTML or markdown, so a link can never
 * reintroduce emphasis into body copy: the label renders as plain text. Every
 * slug is verified against the live colors registry before generation
 * (scripts/validate-color-seo-json.mjs), and anything that does not look like a
 * colors slug degrades to plain text instead of building an href.
 */
const TOOL_LINK = /\{\{([^|{}]+)\|([^{}]+)\}\}/g;
const SAFE_SLUG = /^[a-z0-9-]+$/;

/** Splits copy into text/`<Link>` nodes; emphasis is always unwrapped. */
const renderInline = (text: string, basePath: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(TOOL_LINK)) {
    const at = match.index ?? 0;
    const [raw, slug, label] = match;
    if (at > cursor) nodes.push(plain(text.slice(cursor, at)));
    nodes.push(
      SAFE_SLUG.test(slug) ? (
        <Link key={`tool-link-${at}`} href={`${basePath}/${slug}`}>
          {plain(label)}
        </Link>
      ) : (
        plain(raw)
      ),
    );
    cursor = at + raw.length;
  }
  if (cursor < text.length) nodes.push(plain(text.slice(cursor)));
  return nodes;
};

/** The same copy without the emphasis markers — JSON-LD must not carry markup. */
const unmark = (text: string) => text.replace(EMPHASIS, "$1");

/**
 * Shared editorial SEO block for tool pages.
 *
 * Layout contract (matches the locked Calculator/PDF/CAD convention):
 *  - full container width — render it as a direct child of `.racira-page-container`
 *    so its left/right edges line up with the tool grid;
 *  - NO card/border/box — a plain `section.mt-10` > `.seo-prose` wrapper;
 *  - headings/paragraphs/lists must stay DIRECT children of `.seo-prose` so the
 *    container's `space-y-6` rhythm applies (sections render through `<Fragment>`,
 *    never a per-section wrapper element).
 *
 * Copy is plain prose. Any `**emphasis**` markers left in the source are
 * unwrapped in body copy (see `plain`) — only the FAQ question line may still
 * render them as `<strong>`. JSON-LD always strips the markers.
 *
 * The "vs related tools" paragraphs additionally understand the
 * `{{slug|display text}}` inline link syntax (see `renderInline`) — that is how
 * a tool names and links its siblings without hand-written hrefs. Those links
 * resolve against `basePath` (default `/colors`), so each domain points them at
 * its own route segment.
 *
 * Emits FAQPage JSON-LD from `faqs`, and HowTo JSON-LD when `howTo` is present.
 */
export default function SeoContent({ seo, toolName, h1, basePath = "/colors" }: SeoContentProps) {
  // All FAQs start collapsed; nothing is expanded until the reader clicks.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqJsonLd = seo.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: seo.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: unmark(f.a) },
        })),
      }
    : null;

  const howToJsonLd = seo.howTo?.length
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to use ${toolName}`,
        step: seo.howTo.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text: unmark(s.step),
        })),
      }
    : null;

  const contentBlocks = toBlocks(seo.content);
  const whenToUseParas = seo.whenToUse ? toParagraphs(seo.whenToUse) : [];

  return (
    <section className="mt-10" data-seo-content="tool">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}

      <div className="seo-prose">
        {h1 && <h1>{h1}</h1>}
        {seo.intro && <p>{plain(seo.intro)}</p>}

        <h2>What is {toolName}?</h2>
        {contentBlocks.map((block, i) =>
          block.type === "ul" ? (
            <ul key={`content-${i}`}>
              {block.lines.map((line, j) => (
                <li key={`item-${i}-${j}`}>{plain(line)}</li>
              ))}
            </ul>
          ) : (
            <p key={`content-${i}`}>{plain(block.lines[0])}</p>
          ),
        )}

        {seo.howTo && seo.howTo.length > 0 && (
          <Fragment>
            <h2>How to use {toolName}</h2>
            <ol>
              {seo.howTo.map((s, i) => (
                <li key={`step-${i}`}>{plain(s.step)}</li>
              ))}
            </ol>
          </Fragment>
        )}

        {whenToUseParas.length > 0 && (
          <Fragment>
            <h2>When to use {toolName} vs related tools</h2>
            {whenToUseParas.map((p, i) => (
              <p key={`when-${i}`}>{renderInline(p, basePath)}</p>
            ))}
          </Fragment>
        )}

        {/* Privacy & Security — the same verbatim block on every authored tool. */}
        <Fragment>
          <h2>Privacy &amp; Security</h2>
          <p>{PRIVACY_SECURITY_BLOCK}</p>
        </Fragment>

        {seo.faqs && seo.faqs.length > 0 && (
          <Fragment>
            <h2>Frequently asked questions about {toolName}</h2>
            <div className="not-prose space-y-3">
              {seo.faqs.map((faq, i) => (
                <div key={`faq-${i}`} className="border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    aria-expanded={openIndex === i}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left font-medium text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <span>{withEmphasis(faq.q)}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        openIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === i && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {plain(faq.a)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Fragment>
        )}
      </div>
    </section>
  );
}
