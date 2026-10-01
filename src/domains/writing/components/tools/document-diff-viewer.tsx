"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Select,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { diffReport, diffStats, lineDiff, unifiedDiff, wordDiff, type DiffRow } from "@/domains/writing/lib/text/doc-diff.ts";

const OLD = [
  "The committee met on Tuesday.",
  "The proposal was rejected.",
  "The next meeting is in June.",
].join("\n");

const NEW = [
  "The committee met on Tuesday morning.",
  "The proposal was accepted.",
  "Three new members joined the working group.",
  "The next meeting is in June.",
].join("\n");

/**
 * Document diff viewer: two texts, compared line by line or word by word, with a
 * stats summary and a unified patch. The comparison runs on text held in the
 * tab — nothing is uploaded, and no version history is kept.
 */
export default function DocumentDiffViewer() {
  const [oldText, setOldText] = useState(OLD);
  const [newText, setNewText] = useState(NEW);
  const [mode, setMode] = useState<"line" | "word">("line");

  const rows = useMemo<DiffRow[]>(
    () => (mode === "line" ? lineDiff(oldText, newText) : wordDiff(oldText, newText)),
    [oldText, newText, mode],
  );
  const stats = useMemo(() => diffStats(oldText, newText), [oldText, newText]);
  const patch = useMemo(() => unifiedDiff(oldText, newText), [oldText, newText]);
  const report = useMemo(() => diffReport(oldText, newText), [oldText, newText]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Two versions</PanelTitle>
        <div className="grid gap-3 lg:grid-cols-2">
          <TextArea name="old" label="Original" value={oldText} onChange={setOldText} rows={10} />
          <TextArea name="new" label="Revised" value={newText} onChange={setNewText} rows={10} />
        </div>
        <div className="mt-3 max-w-xs">
          <Select
            name="mode"
            label="Compare"
            value={mode}
            onChange={(value) => setMode(value as "line" | "word")}
            options={[
              { value: "line", label: "Line by line" },
              { value: "word", label: "Word by word" },
            ]}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Summary</PanelTitle>
        <HeroStat
          label="Unchanged"
          value={`${(stats.similarity * 100).toFixed(1)}%`}
          testid="res-similarity"
          sub={`+${stats.addedLines} / -${stats.removedLines} lines`}
        />
        <StatGrid>
          <Stat label="Lines added" value={stats.addedLines} testid="res-added" />
          <Stat label="Lines removed" value={stats.removedLines} testid="res-removed" />
          <Stat label="Words added" value={stats.addedWords} testid="res-added-words" />
          <Stat label="Words removed" value={stats.removedWords} testid="res-removed-words" />
        </StatGrid>
      </Panel>

      <Panel>
        <PanelTitle
          right={<CopyButton text={patch} testid="copy-patch" label="Copy patch" />}
        >
          {mode === "line" ? "Line diff" : "Word diff"}
        </PanelTitle>
        <div data-testid="res-diff" className="max-h-[360px] overflow-auto rounded-xl border border-border bg-background px-2 py-2 font-mono text-xs">
          {rows.map((row, index) => {
            const tone =
              row.kind === "added"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : row.kind === "removed"
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                  : "text-foreground";
            const marker = row.kind === "added" ? "+" : row.kind === "removed" ? "-" : " ";
            return (
              <div key={index} className={`whitespace-pre-wrap break-words rounded px-1 ${tone}`}>
                <span className="mr-2 text-muted-foreground">{marker}</span>
                {row.text || "\u00a0"}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={<DownloadButton text={report} filename="diff.txt" testid="download-diff" label="Download" />}>
          Unified patch
        </PanelTitle>
        <OutputBlock name="patch" value={patch} maxHeight={260} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The line view keeps the old and new line numbers of every row so you can move between two drafts; the word
            view shows the changed runs inside otherwise identical text. Both use the standard diff algorithm and are
            computed in your browser.
          </Notice>
          <Notice tone="warn">
            It compares text, not documents: there is no file upload, no history, no three-way merge and no XML or DOCX
            handling, so paste the plain text of each version. It reports what differs, not which version is better.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
