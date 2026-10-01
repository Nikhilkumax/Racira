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
  TextArea,
} from "./ui";
import { QUESTION_TYPES, analyzeSurvey, surveyReport } from "@/domains/writing/lib/text/survey-question.ts";

const SAMPLE = [
  "How often do you use the tool?",
  "Don't you agree the onboarding is obviously too long?",
  "How satisfied are you with the price and the support?",
].join("\n");

/**
 * Survey question builder: check a questionnaire for the wording problems that
 * quietly ruin data — leading questions, two questions fused into one, absolutes
 * that force a position, loaded words and questions too long to read once.
 */
export default function SurveyQuestionBuilder() {
  const [text, setText] = useState(SAMPLE);

  const report = useMemo(() => analyzeSurvey(text), [text]);
  const rendered = useMemo(() => surveyReport(report), [report]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">one question per line</span>}>
          Questions
        </PanelTitle>
        <TextArea
          name="questions"
          label="Your survey questions"
          value={text}
          onChange={setText}
          rows={10}
          placeholder={"How often do you use the tool?\nDon't you agree the price is fair?"}
        />
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Question types worth deciding before you write: {QUESTION_TYPES.join(", ")}. The type shapes the answer you can
          read back, and the checks below are about the wording.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Analysis</PanelTitle>
        {report.questions === 0 ? (
          <EmptyState>Add a question above — the wording checks update as you write.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Questions"
              value={report.questions}
              testid="res-questions"
              sub={`${report.flagged} with a wording issue`}
            />
            <ul data-testid="res-rows" className="space-y-3">
              {report.rows.map((row, index) => (
                <li key={`${row.text}-${index}`} className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm text-foreground">{row.text}</p>
                  {row.issues.length === 0 ? (
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">No wording issue found.</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {row.issues.map((issue) => (
                        <li key={issue.id} className="text-xs text-amber-700 dark:text-amber-300">
                          <span className="font-semibold">{issue.label}</span> (&ldquo;{issue.cue}&rdquo;): {issue.note}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={rendered} testid="copy-report" label="Copy report" />
              <DownloadButton text={rendered} filename="survey-questions.txt" testid="download-report" label="Download" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Report</PanelTitle>
        <OutputBlock name="report" value={rendered} maxHeight={260} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Each check names the phrase it found, so the fix is obvious. A question flagged as double-barrelled asks two
            things at once; one flagged as absolute forces a position with always, never or all; a loaded word pushes the
            answer before it is given.
          </Notice>
          <Notice tone="warn">
            Wording is only part of a questionnaire. The tool does not judge sampling, question order, response scales or
            whether the question is worth asking — those are research decisions — and it cannot know that a word is
            loaded in your particular field.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
