"use client";

import { useMemo, useState } from "react";
import {
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Stat,
  StatGrid,
  StackLayout,
  TextInput,
} from "./ui";
import { analyzeSubjectLine } from "@/domains/writing/lib/text/subject-line.ts";

/**
 * Email subject line tester: score one subject line against the mechanical
 * faults inboxes punish — length, trigger phrases, shouting, stacked bangs.
 */
export default function EmailSubjectLineTester() {
  const [subject, setSubject] = useState("");

  const analysis = useMemo(() => analyzeSubjectLine(subject), [subject]);
  const hasText = subject.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The subject line</PanelTitle>
        <TextInput
          name="subject"
          label="Subject line"
          value={subject}
          onChange={setSubject}
          placeholder="Your refund in 10 working days"
        />
      </Panel>

      <Panel>
        <PanelTitle>Score</PanelTitle>
        {!hasText ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Type a subject line — the score updates as you write.</p>
        ) : (
          <>
            <HeroStat label="Score" value={analysis.score} testid="res-score" sub={`${analysis.grade} · out of 100`} />
            <StatGrid>
              <Stat label="Characters" value={analysis.chars} testid="res-chars" />
              <Stat label="Words" value={analysis.wordCount} testid="res-words" />
              <Stat label="Trigger phrases" value={analysis.spamWords.length} testid="res-spam" />
            </StatGrid>
            <div className="mt-3">
              <ul data-testid="res-parts" className="space-y-1">
                {analysis.parts.map((part) => (
                  <li key={part.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-foreground">{part.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {part.points}/{part.max}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {!hasText || analysis.checks.length === 0 ? (
          <Notice>
            {hasText
              ? "No mechanical problems found. Whether the line earns an open depends on the list and the moment."
              : "Checks appear once there is a subject line to check."}
          </Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {analysis.checks.map((check) => (
              <li
                key={check.id}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
              >
                {check.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>How the score is built</PanelTitle>
        <OutputBlock
          name="rubric"
          value={analysis.parts.map((part) => `${part.label}: ${part.points}/${part.max}`).join("\n")}
          maxHeight={220}
        />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The rubric is fixed: length, trigger phrases, shouting, exclamation marks and one concrete hook. It
            measures the line, never the offer behind it.
          </Notice>
          <Notice tone="warn">
            Open rates depend on the sender&rsquo;s reputation, the list and the moment — none of which this tool can
            see. A 100 here is a tidy subject line, not a promise of an open.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
