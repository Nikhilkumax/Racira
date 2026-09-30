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
  useDebouncedValue,
  useStoredState,
} from "./ui";
import { wordTokens } from "@/domains/writing/lib/text/tokenize.ts";

const HISTORY_KEY = "racira.writing.goal.history";

/** Local YYYY-MM-DD stamp so a goal resets at local midnight. */
function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

interface HistoryEntry {
  date: string;
  words: number;
}

export default function WritingGoalTracker() {
  const [draft, setDraft] = useStoredState("racira.writing.goal.draft", "");
  const [goalInput, setGoalInput] = useStoredState("racira.writing.goal.target", "500");
  const [sessionStart, setSessionStart] = useStoredState<number | null>("racira.writing.goal.sessionStart", null);
  const [history, setHistory] = useStoredState<HistoryEntry[]>(HISTORY_KEY, []);
  const [tick, setTick] = useState(() => Date.now());

  const text = useDebouncedValue(draft, 250);
  const words = useMemo(() => wordTokens(text).length, [text]);

  const goal = Number.parseFloat(goalInput);
  const goalWords = Number.isFinite(goal) && goal > 0 ? Math.round(goal) : 0;

  // Remember when this session started so the pace is measured, not assumed.
  useEffect(() => {
    if (sessionStart === null && draft.trim().length > 0) setSessionStart(Date.now());
  }, [sessionStart, draft, setSessionStart]);

  // A minute ticker keeps the measured pace and the elapsed time moving.
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Record today's total in the history whenever it grows.
  useEffect(() => {
    if (words === 0) return;
    const date = today();
    setHistory((previous) => {
      const withoutToday = previous.filter((entry) => entry.date !== date);
      const existing = previous.find((entry) => entry.date === date);
      const best = Math.max(words, existing?.words ?? 0);
      const next = [...withoutToday, { date, words: best }];
      next.sort((a, b) => a.date.localeCompare(b.date));
      return next.slice(-14);
    });
  }, [words, setHistory]);

  const elapsedMinutes = sessionStart ? Math.max(0, (tick - sessionStart) / 60_000) : 0;
  const measuredPace = elapsedMinutes > 0.5 ? words / elapsedMinutes : null;
  const remaining = Math.max(0, goalWords - words);
  const percent = goalWords > 0 ? Math.min(100, (words / goalWords) * 100) : 0;
  const etaMinutes = measuredPace && measuredPace > 0 ? remaining / measuredPace : null;
  const hitGoal = goalWords > 0 && words >= goalWords;
  const recent = history.slice(-7);

  const summary = useMemo(
    () =>
      [
        `Goal: ${goalWords} words`,
        `Written: ${words} words`,
        `Progress: ${percent.toFixed(0)}%`,
        `Remaining: ${remaining} words`,
        `Measured pace: ${measuredPace === null ? "—" : `${measuredPace.toFixed(0)} words per minute`}`,
      ].join("\n"),
    [goalWords, words, percent, remaining, measuredPace],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Today&rsquo;s goal</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            name="goal"
            label="Daily word goal"
            value={goalInput}
            onChange={setGoalInput}
            type="number"
            hint="e.g. 500"
          />
          <div className="flex items-end pb-1">
            <Btn
              kind="ghost"
              testid="btn-new-session"
              onClick={() => {
                setSessionStart(Date.now());
                setTick(Date.now());
              }}
            >
              Restart pace measurement
            </Btn>
          </div>
        </div>
        {goalWords === 0 && (
          <div className="mt-3">
            <Notice tone="warn">Enter a goal above zero to track progress against it.</Notice>
          </div>
        )}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Your draft, goal and history stay in this browser. Nothing is uploaded and there is no account.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Progress</PanelTitle>
        {draft.trim().length === 0 ? (
          <EmptyState>Write in the box below — progress, pace and history update as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Words written"
              value={words.toLocaleString("en-US")}
              testid="res-words"
              sub={goalWords > 0 ? `${percent.toFixed(0)}% of ${goalWords.toLocaleString("en-US")} words` : undefined}
            />
            <ProgressBar value={percent} testid="progress-bar" />
            <div className="mt-4">
              <ResultBox>
                <ResultRow name="goal" label="Daily goal" value={goalWords > 0 ? `${goalWords.toLocaleString("en-US")} words` : "—"} />
                <ResultRow name="remaining" label="Remaining" value={remaining.toLocaleString("en-US")} />
                <ResultRow name="pace" label="Measured pace this session" value={measuredPace === null ? "—" : `${measuredPace.toFixed(0)} wpm`} />
                <ResultRow
                  name="eta"
                  label="Time to goal at that pace"
                  value={etaMinutes === null ? "—" : remaining === 0 ? "goal reached" : `${Math.ceil(etaMinutes)} min`}
                />
              </ResultBox>
            </div>
            {hitGoal && (
              <div className="mt-3">
                <Notice tone="info">Goal reached for today — {words.toLocaleString("en-US")} words.</Notice>
              </div>
            )}
            <div className="mt-3">
              <CopyButton text={summary} testid="copy-summary" label="Copy summary" />
            </div>
          </>
        )}
      </Panel>

      {recent.length > 0 && (
        <Panel>
          <PanelTitle right={<span className="text-[10px] text-muted-foreground">kept in this browser</span>}>
            Last {recent.length} day{recent.length === 1 ? "" : "s"}
          </PanelTitle>
          <ul className="space-y-2" data-testid="history">
            {recent.map((entry) => (
              <li key={entry.date} className="flex items-center gap-3 text-xs">
                <span className="w-24 shrink-0 font-mono text-muted-foreground">{entry.date}</span>
                <span
                  className="h-3 rounded-sm bg-primary/70"
                  style={{ width: `${goalWords > 0 ? Math.min(100, (entry.words / goalWords) * 100) : 100}%` }}
                />
                <span className="font-mono text-muted-foreground">{entry.words.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <PanelTitle>Your draft</PanelTitle>
        <TextArea
          name="draft"
          label="Today&rsquo;s writing"
          value={draft}
          onChange={setDraft}
          rows={10}
          placeholder="Write here — autosaved locally, counted as you go."
        />
        <div className="mt-3">
          <DownloadButton text={draft} filename="writing-goal-draft.txt" testid="download-draft" label="Download draft" />
        </div>
      </Panel>
    </StackLayout>
  );
}
