"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Stat,
  StatGrid,
  StackLayout,
  TextArea,
} from "./ui";
import { markdownOutlineText, markdownStats, renderMarkdown } from "@/domains/writing/lib/text/markdown.ts";

const SAMPLE = [
  "# A draft in Markdown",
  "",
  "Markdown is plain text with a few marks that give it structure. Everything on this page is rendered in your",
  "browser — nothing is uploaded and nothing is stored.",
  "",
  "## Why it helps",
  "",
  "- You can read the source without a word processor.",
  "- A `diff` of two versions is readable.",
  "- The same file becomes a web page, a PDF or a README.",
  "",
  "> A markup language you can hold in your head.",
  "",
  "```js",
  "const words = draft.split(/\\s+/).length;",
  "```",
  "",
  "See the [Markdown guide](https://commonmark.org) for the full syntax.",
].join("\n");

/**
 * Markdown editor: source on the left, rendered preview and the heading outline
 * on the right. The renderer runs with raw HTML disabled, so a tag in the source
 * is shown as text rather than becoming markup — there is no sanitiser to run
 * because there is nothing unsafe to strip.
 */
export default function MarkdownEditor() {
  const [source, setSource] = useState(SAMPLE);
  // The preview is filled in after mount: the renderer's HTML is stable, but
  // keeping it out of the server pass means hydration can never disagree with
  // the static markup.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Everything derived from markdown-it is produced only after mount: the
  // library's output is stable, but keeping it out of the server pass means
  // hydration can never disagree with the static markup.
  const result = useMemo(() => (mounted ? renderMarkdown(source) : null), [mounted, source]);
  const stats = useMemo(() => (mounted ? markdownStats(source) : null), [mounted, source]);
  const outline = useMemo(() => (mounted ? markdownOutlineText(source) : ""), [mounted, source]);

  // The page shell owns the document's single `<h1>`, so a heading in the
  // preview is shifted down one level: an author's `#` renders as an `<h2>`.
  const previewHtml = useMemo(
    () => (result?.html ?? "").replace(/<(\/?)h([1-5])([ >])/g, (_, close: string, level: string, tail: string) => `<${close}h${Number(level) + 1}${tail}`),
    [result],
  );
  const headings = result?.headings ?? [];

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">rendered locally</span>}>
          Markdown source
        </PanelTitle>
        <TextArea
          name="markdown"
          label="Write Markdown"
          value={source}
          onChange={setSource}
          rows={16}
          placeholder={"# Heading\n\nSome **bold** text and a [link](https://example.com)."}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={source} testid="copy-source" label="Copy source" />
          <DownloadButton text={source} filename="draft.md" testid="download-source" label="Download .md" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Preview</PanelTitle>
        <div
          data-testid="res-preview"
          className="prose prose-sm max-w-none overflow-auto break-words rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-1 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:font-semibold [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_li]:ml-4 [&_li]:list-disc [&_pre]:my-2 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:font-mono [&_strong]:font-semibold"
          style={{ maxHeight: 420 }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </Panel>

      <Panel>
        <PanelTitle>Document</PanelTitle>
        <StatGrid>
          <Stat label="Words" value={stats?.words ?? 0} testid="res-words" />
          <Stat label="Lines" value={stats?.lines ?? 0} testid="res-lines" />
          <Stat label="Headings" value={stats?.headings ?? 0} testid="res-headings" />
          <Stat label="Links" value={stats?.links ?? 0} testid="res-links" />
          <Stat label="Code blocks" value={stats?.codeBlocks ?? 0} testid="res-code" />
          <Stat label="List items" value={stats?.listItems ?? 0} testid="res-list-items" />
        </StatGrid>
      </Panel>

      <Panel>
        <PanelTitle right={<CopyButton text={outline} testid="copy-outline" label="Copy outline" />}>
          Heading outline
        </PanelTitle>
        {headings.length === 0 ? (
          <HeroStat label="Headings" value={0} testid="res-outline-count" sub="add a # heading to build an outline" />
        ) : (
          <>
            <HeroStat label="Headings" value={headings.length} testid="res-outline-count" sub="levels 1–3 shown below" />
            <OutputBlock name="outline" value={outline} maxHeight={240} mono={false} />
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The renderer implements CommonMark plus tables, strikethrough, autolinks and task lists through markdown-it.
            Raw HTML in the source is escaped, so a pasted tag is shown as text; code blocks are printed as plain text
            rather than syntax-highlighted.
          </Notice>
          <Notice tone="warn">
            The preview is a reading aid, not a publishing pipeline: there is no Word or PDF export, no diagram or math
            rendering, and no file upload. Copy the source or download the .md file and render it wherever you publish.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
