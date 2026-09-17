"use client";

/**
 * Show Notes Timestamp Generator — formats a plain-text transcript into
 * timestamped show-notes lines. Paste transcript text, set the audio start
 * time and line duration (or a words-per-minute estimate), get `[mm:ss]`
 * prefixed lines ready to paste into a podcast description.
 *
 * All math is pure (calc.ts time-format helpers, Node-verified).
 */

import { useMemo, useState } from "react";

import { formatTimestamp } from "@/domains/audio/lib/calc";

type Mode = "perLine" | "wpm";

const inputCls =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring";

export default function ShowNotesTimestampGenerator() {
  const [text, setText] = useState("");
  const [startSeconds, setStartSeconds] = useState("0");
  const [mode, setMode] = useState<Mode>("perLine");
  const [secondsPerLine, setSecondsPerLine] = useState("30");
  const [wpm, setWpm] = useState("150");

  const lines = useMemo(
    () =>
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean),
    [text],
  );

  const output = useMemo(() => {
    const start = Number(startSeconds) || 0;
    const spb = Math.max(0.5, Number(secondsPerLine) || 30);
    const wordsPerMin = Math.max(60, Number(wpm) || 150);
    let t = start;
    return lines.map((line) => {
      const stamp = formatTimestamp(t, true);
      if (mode === "perLine") {
        t += spb;
      } else {
        t += (line.split(/\s+/).filter(Boolean).length / wordsPerMin) * 60;
      }
      return `[${stamp}] ${line}`;
    });
  }, [lines, startSeconds, mode, secondsPerLine, wpm]);

  const lastStamp =
    lines.length > 0 ? output[output.length - 1].slice(1, output[output.length - 1].indexOf("]")) : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Audio start time (seconds)</label>
          <input
            type="number"
            value={startSeconds}
            onChange={(e) => setStartSeconds(e.target.value)}
            min={0}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Timing mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className={inputCls}
          >
            <option value="perLine">Fixed seconds per line</option>
            <option value="wpm">Words per minute</option>
          </select>
        </div>
        <div>
          {mode === "perLine" ? (
            <>
              <label className="mb-1 block text-sm font-medium">Seconds per line</label>
              <input
                type="number"
                value={secondsPerLine}
                onChange={(e) => setSecondsPerLine(e.target.value)}
                min={0.5}
                step="0.5"
                className={inputCls}
              />
            </>
          ) : (
            <>
              <label className="mb-1 block text-sm font-medium">Words per minute</label>
              <input
                type="number"
                value={wpm}
                onChange={(e) => setWpm(e.target.value)}
                min={60}
                className={inputCls}
              />
            </>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Transcript (one paragraph/line per entry)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={"Welcome to the show, today we talk about…\nOur first guest is…"}
          className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {lines.length > 0 ? (
        <div className="rounded-md border p-3">
          <p className="mb-2 text-sm font-medium">
            Show notes — {lines.length} lines, last timestamp {lastStamp}
          </p>
          <textarea
            readOnly
            rows={Math.min(12, output.length + 1)}
            value={output.join("\n")}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="w-full rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter transcript text above to generate timestamps.
        </p>
      )}
    </div>
  );
}
