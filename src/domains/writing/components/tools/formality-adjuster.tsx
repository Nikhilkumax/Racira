"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
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
import { adjustFormality, scoreFormality } from "@/domains/writing/lib/text/formality-adjuster.ts";

const DIRECTIONS = [
  { value: "formal", label: "More formal" },
  { value: "casual", label: "More casual" },
];

/**
 * Formality adjuster: one paired lexicon moved in either direction, with a
 * count-based register score for the text as written.
 */
export default function FormalityAdjuster() {
  const [text, setText] = useState("");
  const [direction, setDirection] = useState("formal");

  const score = useMemo(() => scoreFormality(text), [text]);
  const result = useMemo(
    () => adjustFormality(text, direction === "casual" ? "casual" : "formal"),
    [text, direction],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Text to adjust"
          value={text}
          onChange={setText}
          rows={6}
          placeholder="Paste a message — the register shifts in whichever direction you choose."
        />
        <div className="mt-3 max-w-xs">
          <Select
            name="direction"
            label="Direction"
            value={direction}
            onChange={setDirection}
            options={DIRECTIONS}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={result.output ? <CopyButton text={result.output} testid="copy-output" /> : undefined}>
          Adjusted version
        </PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState>Paste a sentence — the adjusted version builds as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Formality"
              value={score.score}
              testid="res-score"
              sub={`${score.label} · ${score.casualMarkers} casual and ${score.formalMarkers} formal markers in ${score.words} words`}
            />
            <StatGrid>
              <Stat label="Replaced" value={result.changes.length} testid="res-changes-count" />
              <Stat label="Casual markers" value={score.casualMarkers} testid="res-casual" />
              <Stat label="Formal markers" value={score.formalMarkers} testid="res-formal" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="output" value={result.output} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <DownloadButton text={result.output} filename="adjusted.txt" testid="download-output" />
              <span className="text-xs text-muted-foreground">
                {result.direction === "formal" ? "Toward a formal register" : "Toward a casual register"}
              </span>
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Every change</PanelTitle>
        {result.changes.length === 0 ? (
          <EmptyState>No paired expression in the table appears in this text.</EmptyState>
        ) : (
          <ul className="space-y-2" data-testid="res-changes">
            {result.changes.map((change, index) => (
              <li
                key={`${index}-${change.from}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs text-muted-foreground">{change.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono text-xs text-foreground">{change.to}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Only expressions in the published pair table are changed, and the score is a count of markers rather than
            a judgement of tone. A plural or inflected form of a table entry is left alone.
          </Notice>
          <Notice tone="warn">
            Formality is not correctness. A contract that reads casual and a birthday note that reads formal are both
            problems — the choice belongs to the writer and the audience.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
