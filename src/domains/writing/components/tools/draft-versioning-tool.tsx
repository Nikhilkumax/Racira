"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  CopyButton,
  EmptyState,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  TextArea,
  TextInput,
  useStoredState,
} from "./ui";
import {
  compareVersions,
  makeVersion,
  versionTimeline,
  versionsReport,
  type DraftVersion,
} from "@/domains/writing/lib/text/draft-versions.ts";

const KEY = "racira.writing.draft.versions";

/**
 * Draft versioning tool: keep labelled snapshots of a draft in this browser and
 * see how the word count moved from one to the next. Comparing two versions uses
 * the same word diff as the document diff viewer.
 */
export default function DraftVersioningTool() {
  const [versions, setVersions] = useStoredState<DraftVersion[]>(KEY, []);
  const [label, setLabel] = useState("");
  const [text, setText] = useState("");

  const timeline = useMemo(() => versionTimeline(versions), [versions]);
  const latest =
    versions.length >= 2 ? compareVersions(versions[versions.length - 2], versions[versions.length - 1]) : undefined;
  const report = useMemo(() => versionsReport(versions), [versions]);
  const currentWords = makeVersion("current", text).words;

  const save = () => {
    const next = [...versions, makeVersion(label || `Draft ${versions.length + 1}`, text)];
    setVersions(next);
    setLabel("");
  };

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">stored in this browser</span>}>
          Save a version
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            name="label"
            label="Version label"
            value={label}
            onChange={setLabel}
            placeholder="Draft 3 — after the rewrite"
            hint="blank labels are numbered"
          />
          <div className="flex items-end">
            <span className="font-mono text-xs text-muted-foreground">
              current draft: {currentWords} words
            </span>
          </div>
        </div>
        <div className="mt-3">
          <TextArea name="draft" label="Draft text" value={text} onChange={setText} rows={10} placeholder="Paste or type a draft, then save a version." />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Btn testid="btn-save" onClick={save} disabled={text.trim().length === 0}>
            Save version
          </Btn>
          <Btn kind="ghost" testid="btn-clear" onClick={() => setVersions([])}>
            Clear all versions
          </Btn>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Timeline</PanelTitle>
        {versions.length === 0 ? (
          <EmptyState>Save a version above — the timeline tracks the word count from draft to draft.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Versions saved"
              value={versions.length}
              testid="res-count"
              sub={`latest: ${versions[versions.length - 1].words} words`}
            />
            <ul data-testid="res-timeline" className="space-y-1 text-sm">
              {timeline.map((row, index) => (
                <li
                  key={`${row.label}-${index}`}
                  className="flex flex-wrap items-baseline justify-between gap-3 border-t border-border/60 pt-1 first:border-0 first:pt-0"
                >
                  <span className="text-foreground">
                    {index + 1}. {row.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {row.words} words{index > 0 ? ` (${row.delta >= 0 ? "+" : ""}${row.delta})` : ""}
                  </span>
                  <Btn
                    kind="ghost"
                    testid={`btn-load-${index + 1}`}
                    onClick={() => setText(versions[index].text)}
                  >
                    Load
                  </Btn>
                  <Btn
                    kind="ghost"
                    testid={`btn-remove-${index + 1}`}
                    onClick={() => setVersions((previous) => previous.filter((_, position) => position !== index))}
                  >
                    Remove
                  </Btn>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      {latest && (
        <Panel>
          <PanelTitle>Latest change</PanelTitle>
          <HeroStat
            label="Unchanged"
            value={`${(latest.similarity * 100).toFixed(1)}%`}
            testid="res-similarity"
            sub={`${latest.from} → ${latest.to}`}
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <p className="font-mono text-xs text-foreground">
              words: <span data-testid="res-delta">{latest.wordDelta >= 0 ? `+${latest.wordDelta}` : latest.wordDelta}</span>
            </p>
            <p className="font-mono text-xs text-foreground">added: {latest.addedWords}</p>
            <p className="font-mono text-xs text-foreground">removed: {latest.removedWords}</p>
          </div>
        </Panel>
      )}

      {versions.length > 0 && (
        <Panel>
          <PanelTitle right={<CopyButton text={report} testid="copy-report" label="Copy report" />}>
            Version report
          </PanelTitle>
          <OutputBlock name="report" value={report} maxHeight={220} mono={false} />
        </Panel>
      )}

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            A version is a label and the text you saved under it, kept in this browser. The timeline compares word counts
            in order, and the latest-change panel compares the last two versions word by word.
          </Notice>
          <Notice tone="warn">
            There is no server, no cloud history and no automatic snapshots — clear your browser data and the versions go
            with it. It stores text, not files, so paste the plain text of each draft rather than uploading a document.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
