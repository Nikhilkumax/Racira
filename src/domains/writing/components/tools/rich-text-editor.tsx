"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Btn,
  CopyButton,
  DownloadButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Select,
  Stat,
  StatGrid,
  StackLayout,
} from "./ui";
import {
  RICH_BLOCK_KINDS,
  RICH_MARKS,
  createRichDoc,
  markActiveAt,
  richDocStats,
  richDocToHtml,
  setLineKind,
  setRichDocText,
  toggleMarkRange,
  type InlineMark,
  type RichBlockKind,
  type RichDoc,
} from "@/domains/writing/lib/text/rich-text-editor.ts";

const SAMPLE = "Everything you type stays plain text.\nSelect any word and format it.";

/**
 * Rich text editor: a plain-text document with inline marks and per-line block
 * kinds managed by the toolbar, and a live HTML preview rendered only after
 * mount. The engine escapes every character it is given, so the preview shows
 * the writer's text as text — there is no sanitiser because there is nothing
 * unsafe to strip.
 */
export default function RichTextEditor() {
  const [doc, setDoc] = useState<RichDoc>(() => createRichDoc(SAMPLE));
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  // The preview's HTML is stable, but keeping it out of the server pass means
  // hydration can never disagree with the static markup.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stats = useMemo(() => richDocStats(doc), [doc]);
  const html = useMemo(() => richDocToHtml(doc), [doc]);
  const lineIndex = useMemo(() => doc.text.slice(0, selection.start).split("\n").length - 1, [doc.text, selection.start]);
  const kind = doc.kinds[lineIndex] ?? "paragraph";
  const selected = Math.max(0, selection.end - selection.start);

  const applyMark = (mark: InlineMark): void => {
    setDoc((current) => toggleMarkRange(current, mark, selection.start, selection.end));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (!event.ctrlKey && !event.metaKey) return;
    const key = event.key.toLowerCase();
    const spec = RICH_MARKS.find((mark) => mark.shortcut.toLowerCase().endsWith(`+${key}`));
    if (!spec) return;
    event.preventDefault();
    applyMark(spec.id);
  };

  return (
    <StackLayout>
      <Panel>
        <PanelTitle
          right={
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">
                {selected > 0 ? `${selected} selected` : "select text to format"}
              </span>
              <Btn
                kind="ghost"
                testid="reset-document"
                onClick={() => {
                  setDoc(createRichDoc(SAMPLE));
                  setSelection({ start: 0, end: 0 });
                }}
              >
                Reset
              </Btn>
            </div>
          }
        >
          Document
        </PanelTitle>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {RICH_MARKS.map((mark) => (
            <Btn
              key={mark.id}
              kind={markActiveAt(doc, mark.id, selection.start) ? "primary" : "ghost"}
              testid={`mark-${mark.id}`}
              onClick={() => applyMark(mark.id)}
            >
              {mark.label}
            </Btn>
          ))}
        </div>
        <div className="mb-3 sm:w-52">
          <Select
            name="kind"
            label="Block kind for this line"
            value={kind}
            onChange={(value) => setDoc(setLineKind(doc, lineIndex, value as RichBlockKind))}
            options={RICH_BLOCK_KINDS.map((item) => ({ value: item.id, label: item.label }))}
          />
        </div>
        <textarea
          data-testid="in-document"
          aria-label="Document text"
          value={doc.text}
          rows={14}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            const element = event.target;
            setDoc(setRichDocText(doc, element.value));
            setSelection({ start: element.selectionStart, end: element.selectionEnd });
          }}
          onSelect={(event) => setSelection({ start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd })}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-primary"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Bold, italic, underline, strike and code are applied to the selection; headings, quotes and bullets to the
          line the caret is on. Shortcuts: Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X, Ctrl+E.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Preview</PanelTitle>
        {mounted ? (
          <div
            data-testid="res-preview"
            className="overflow-auto break-words rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_h2]:mb-1 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:my-2 [&_strong]:font-semibold [&_u]:underline"
            style={{ maxHeight: 360 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">The preview renders after mount.</p>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Document stats</PanelTitle>
        <HeroStat label="Words" value={stats.words} testid="res-words" sub="counted from the text, not the markup" />
        <StatGrid>
          <Stat label="Lines" value={stats.lines} testid="res-lines" />
          <Stat label="Formatted words" value={stats.formattedWords} testid="res-formatted" />
          <Stat label="Marks" value={stats.marks} testid="res-marks" />
        </StatGrid>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton text={html} testid="copy-html" label="Copy HTML" />
              <DownloadButton text={html} filename="document.html" mime="text/html;charset=utf-8" testid="download-html" label="Download .html" />
            </div>
          }
        >
          HTML
        </PanelTitle>
        <OutputBlock name="html" value={html} maxHeight={220} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The document is plain text underneath: marks are stored as offsets, so editing the text can never leave a
            half-open tag behind, and the preview is rendered from the same model the toolbar edits.
          </Notice>
          <Notice tone="warn">
            The block kinds are paragraphs, two heading levels, quotes and bullets — there are no tables, images, links
            or font controls, and the HTML is a starting point for a page rather than a styled document.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
