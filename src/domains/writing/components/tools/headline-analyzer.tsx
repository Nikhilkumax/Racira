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
import { analyzeHeadline } from "@/domains/writing/lib/text/headline.ts";

/**
 * Headline analyzer: score a headline against a fixed rubric — length, power
 * word, number, address to the reader, shape — and read the faults found.
 */
export default function HeadlineAnalyzer() {
  const [headline, setHeadline] = useState("");

  const analysis = useMemo(() => analyzeHeadline(headline), [headline]);
  const hasText = headline.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The headline</PanelTitle>
        <TextInput
          name="headline"
          label="Headline"
          value={headline}
          onChange={setHeadline}
          placeholder="The 7-step guide that saves your team six hours a week"
        />
      </Panel>

      <Panel>
        <PanelTitle>Score</PanelTitle>
        {!hasText ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Type a headline — the score updates as you write.</p>
        ) : (
          <>
            <HeroStat label="Score" value={analysis.score} testid="res-score" sub={`${analysis.grade} · out of 100`} />
            <StatGrid>
              <Stat label="Words" value={analysis.wordCount} testid="res-words" />
              <Stat label="Power words" value={analysis.powerWords.length} testid="res-power" />
              <Stat label="Problems" value={analysis.checks.length} testid="res-problems" />
            </StatGrid>
            <ul data-testid="res-parts" className="mt-3 space-y-1">
              {analysis.parts.map((part) => (
                <li key={part.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-foreground">{part.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {part.points}/{part.max}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {!hasText || analysis.checks.length === 0 ? (
          <Notice>
            {hasText
              ? "No mechanical problems found. Whether the headline is true is still the story's job to show."
              : "Checks appear once there is a headline to check."}
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
            The score is a fixed rubric of habits, not a prediction. A headline can score 100 and still be the wrong
            headline for the piece, and a quiet one can score low and still be right for a serious story.
          </Notice>
          <Notice tone="warn">
            The analyzer cannot know your audience, your publication or the fact behind the claim. Treat every check as
            a question, not a verdict.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
