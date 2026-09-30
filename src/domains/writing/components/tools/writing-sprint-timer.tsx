"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Btn,
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  ProgressBar,
  ResultBox,
  ResultRow,
  StackLayout,
  TextArea,
  TextInput,
  formatClock,
  useDebouncedValue,
  useStoredState,
} from "./ui";
import { wordTokens } from "@/domains/writing/lib/text/tokenize.ts";

export default function WritingSprintTimer() {
  const [draft, setDraft] = useStoredState("racira.writing.sprint.draft", "");
  const [minutesInput, setMinutesInput] = useStoredState("racira.writing.sprint.minutes", "25");
  const [accumulated, setAccumulated] = useState(0);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [startWords, setStartWords] = useState<number | null>(null);

  const text = useDebouncedValue(draft, 250);
  const words = useMemo(() => wordTokens(text).length, [text]);

  const minutes = Number.parseFloat(minutesInput);
  const durationSeconds = Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : 0;

  useEffect(() => {
    if (runStartedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [runStartedAt]);

  const elapsed = accumulated + (runStartedAt !== null ? Math.max(0, (now - runStartedAt) / 1000) : 0);
  const remaining = Math.max(0, durationSeconds - elapsed);
  const running = runStartedAt !== null;
  const finished = durationSeconds > 0 && elapsed >= durationSeconds;
  const sprintWords = startWords === null ? 0 : Math.max(0, words - startWords);
  const sprintWpm = elapsed > 5 ? (sprintWords / elapsed) * 60 : null;

  const start = () => {
    setRunStartedAt(Date.now());
    setNow(Date.now());
    if (startWords === null) setStartWords(words);
  };
  const pause = () => {
    setAccumulated(elapsed);
    setRunStartedAt(null);
  };
  const reset = () => {
    setAccumulated(0);
    setRunStartedAt(null);
    setStartWords(null);
    setNow(Date.now());
  };

  const summary = useMemo(
    () =>
      [
        `Sprint length: ${Number.isFinite(minutes) ? minutes : 0} minutes`,
        `Elapsed: ${formatClock(elapsed)}`,
        `Words in document: ${words}`,
        `Words this sprint: ${sprintWords}`,
        `Sprint pace: ${sprintWpm === null ? "—" : `${sprintWpm.toFixed(0)} words per minute`}`,
      ].join("\n"),
    [minutes, elapsed, words, sprintWords, sprintWpm],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Timer</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            name="minutes"
            label="Sprint length (minutes)"
            value={minutesInput}
            onChange={setMinutesInput}
            type="number"
            hint="25 = one pomodoro"
          />
          <div className="flex flex-wrap items-end gap-2 pb-1">
            {running ? (
              <Btn testid="btn-pause" onClick={pause}>
                Pause
              </Btn>
            ) : (
              <Btn testid="btn-start" onClick={start} disabled={durationSeconds === 0}>
                {accumulated > 0 ? "Resume" : "Start sprint"}
              </Btn>
            )}
            <Btn kind="ghost" testid="btn-reset" onClick={reset}>
              Reset
            </Btn>
          </div>
        </div>
        {durationSeconds === 0 && (
          <div className="mt-3">
            <Notice tone="warn">Enter a sprint length above zero to start the timer.</Notice>
          </div>
        )}
        {finished && (
          <div className="mt-3">
            <Notice tone="info">
              Sprint complete — you wrote {sprintWords.toLocaleString("en-US")} words in{" "}
              {formatClock(durationSeconds)}. Keep going, or start a fresh sprint.
            </Notice>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Progress</PanelTitle>
        <HeroStat
          label={finished ? "Sprint finished" : running ? "Time remaining" : "Ready"}
          value={formatClock(durationSeconds === 0 ? 0 : remaining)}
          testid="res-countdown"
          sub={`${formatClock(elapsed)} elapsed of ${formatClock(durationSeconds)}`}
        />
        <ProgressBar value={durationSeconds > 0 ? (elapsed / durationSeconds) * 100 : 0} />
        <div className="mt-4">
          <ResultBox>
            <ResultRow name="words" label="Words in the document" value={words.toLocaleString("en-US")} />
            <ResultRow name="sprint-words" label="Words written this sprint" value={startWords === null ? "—" : sprintWords.toLocaleString("en-US")} />
            <ResultRow name="wpm" label="Sprint pace" value={sprintWpm === null ? "—" : `${sprintWpm.toFixed(0)} wpm`} />
            <ResultRow name="elapsed" label="Elapsed" value={formatClock(elapsed)} />
          </ResultBox>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={summary} testid="copy-summary" label="Copy session summary" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">stored in this browser</span>}>
          Write here
        </PanelTitle>
        {draft.length === 0 && <EmptyState>Start the sprint, then write in this box — your draft autosaves locally.</EmptyState>}
        <TextArea
          name="draft"
          label="Sprint draft"
          value={draft}
          onChange={setDraft}
          rows={12}
          placeholder="Write here. Words are counted as you go; the draft stays in this browser only."
        />
        <div className="mt-3">
          <DownloadButton text={draft} filename="sprint-draft.txt" testid="download-draft" label="Download draft" />
        </div>
      </Panel>
    </StackLayout>
  );
}
