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
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { convertPassive } from "@/domains/writing/lib/text/active-voice-converter.ts";

/**
 * Active voice converter: recast the passives that name their actor and report
 * the ones the rules cannot safely rewrite.
 */
export default function ActiveVoiceConverter() {
  const [text, setText] = useState("");
  const report = useMemo(() => convertPassive(text), [text]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Text to convert"
          value={text}
          onChange={setText}
          rows={6}
          placeholder="Paste a paragraph — passive clauses with a named actor are recast."
        />
      </Panel>

      <Panel>
        <PanelTitle right={report.output ? <CopyButton text={report.output} testid="copy-output" /> : undefined}>
          Active version
        </PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState>Paste a sentence with a passive clause — the rewrite appears as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Clauses converted"
              value={report.converted}
              testid="res-converted"
              sub={`${report.findings.length} passive clauses found`}
            />
            <StatGrid>
              <Stat label="No named actor" value={report.agentless} testid="res-agentless" />
              <Stat label="Left as written" value={report.unconverted} testid="res-unconverted" />
              <Stat label="Words" value={report.output.split(/\s+/).filter(Boolean).length} testid="res-words" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="output" value={report.output} />
            </div>
            <div className="mt-3">
              <DownloadButton text={report.output} filename="active-voice.txt" testid="download-output" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Clause by clause</PanelTitle>
        {report.findings.length === 0 ? (
          <EmptyState>
            No passive clause from the documented pattern appears in this text — or none that the rules recognise.
          </EmptyState>
        ) : (
          <ul className="space-y-2" data-testid="res-findings">
            {report.findings.map((finding, index) => (
              <li
                key={`${index}-${finding.source}`}
                className={`rounded-lg border px-3 py-2 ${
                  finding.active
                    ? "border-border bg-card/40"
                    : "border-amber-500/40 bg-amber-500/10"
                }`}
              >
                <p className="text-sm text-muted-foreground">{finding.source}</p>
                {finding.active ? (
                  <p className="mt-1 text-sm font-medium text-foreground">{finding.active}</p>
                ) : (
                  <p className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-300">{finding.reason}</p>
                )}
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {finding.verb} · {finding.tense}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            A clause is only rewritten when it names its actor in a by-phrase and uses a tense the published
            participle table covers: was/were and has/have/had been. Everything else is left exactly as written.
          </Notice>
          <Notice tone="warn">
            The passive is not an error. Scientists and reporters use it deliberately when the actor is unknown, or
            when the object of the sentence is the point. Convert only where an actor exists and matters.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
