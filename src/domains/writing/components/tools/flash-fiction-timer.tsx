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

export default function FlashFictionTimer() {
  const [draft, setDraft] = useStoredState("racira.writing.flash.draft", "");
  const [limitInput, setLimitInput] = useStoredState("racira.writing.flash.limit", "100");
  const [minutesInput, setMinutesInput] = useStoredState("racira.writing.flash.minutes", "5");
  const [accumulated, setAccumulated] = useState(0);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const text = useDebouncedValue(draft, 250);
  const words = useMemo(() => wordTokens(text).length, [text]);

  const limit = Number.parseFloat(limitInput);
  const wordLimit = Number.isFinite(limit) && limit > 0 ? Math.round(limit) : 0;
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
  const remainingWords = Math.max(0, wordLimit - words);
  const over = wordLimit > 0 && words > wordLimit;

  const start = () => {
    setRunStartedAt(Date.now());
    setNow(Date.now());
  };
  const pause = () => {
    setAccumulated(elapsed);
    setRunStartedAt(null);
  };
  const reset = () => {
    setAccumulated(0);
    setRunStartedAt(null);
    setNow(Date.now());
  };

  const summary = useMemo(
    () =>
      [
        `Flash fiction: ${wordLimit} words in ${Number.isFinite(minutes) ? minutes : 0} minutes`,
        `Words written: ${words}`,
        `Remaining words: ${remainingWords}`,
        `Time remaining: ${formatClock(remaining)}`,
      ].join("\n"),
    [wordLimit, minutes, words, remainingWords, remaining],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Challenge</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="limit" label="Word limit" value={limitInput} onChange={setLimitInput} type="number" hint="e.g. 100" />
          <TextInput name="minutes" label="Time limit (minutes)" value={minutesInput} onChange={setMinutesInput} type="number" hint="e.g. 5" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {running ? (
            <Btn testid="btn-pause" onClick={pause}>
              Pause
            </Btn>
          ) : (
            <Btn testid="btn-start" onClick={start} disabled={durationSeconds === 0 || wordLimit === 0}>
              {accumulated > 0 ? "Resume" : "Start challenge"}
            </Btn>
          )}
          <Btn kind="ghost" testid="btn-reset" onClick={reset}>
            Reset timer
          </Btn>
        </div>
        {(durationSeconds === 0 || wordLimit === 0) && (
          <div className="mt-3">
            <Notice tone="warn">Set a word limit and a time limit above zero to start.</Notice>
          </div>
        )}
        {over && (
          <div className="mt-3">
            <Notice tone="error">
              Over the limit by {(words - wordLimit).toLocaleString("en-US")} words — trim to {wordLimit} to finish
              inside the brief.
            </Notice>
          </div>
        )}
        {finished && !over && (
          <div className="mt-3">
            <Notice tone="info">
              Time is up with {words.toLocaleString("en-US")} of {wordLimit.toLocaleString("en-US")} words used.
            </Notice>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Live status</PanelTitle>
        <HeroStat
          label={finished ? "Time up" : running ? "Time remaining" : "Ready"}
          value={formatClock(durationSeconds === 0 ? 0 : remaining)}
          testid="res-countdown"
          sub={`${formatClock(elapsed)} elapsed`}
        />
        <ProgressBar value={durationSeconds > 0 ? (elapsed / durationSeconds) * 100 : 0} />
        <div className="mt-4">
          <ResultBox>
            <ResultRow name="words" label="Words written" value={words.toLocaleString("en-US")} />
            <ResultRow name="remaining-words" label="Words remaining" value={remainingWords.toLocaleString("en-US")} />
            <ResultRow name="limit" label="Word limit" value={wordLimit > 0 ? wordLimit.toLocaleString("en-US") : "—"} />
            <ResultRow name="over" label="Over the limit" value={over ? "yes" : "no"} />
          </ResultBox>
        </div>
        <div className="mt-3">
          <CopyButton text={summary} testid="copy-summary" label="Copy status" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">stored in this browser</span>}>
          Write the piece
        </PanelTitle>
        {draft.length === 0 && <EmptyState>Start the challenge and write straight into this box.</EmptyState>}
        <TextArea
          name="draft"
          label="Flash fiction draft"
          value={draft}
          onChange={setDraft}
          rows={12}
          placeholder="Write here — one sitting, no edits, no looking back."
        />
        <div className="mt-3">
          <DownloadButton text={draft} filename="flash-fiction.txt" testid="download-draft" label="Download draft" />
        </div>
      </Panel>
    </StackLayout>
  );
}
