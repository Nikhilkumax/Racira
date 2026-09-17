"use client";

/**
 * Time Signature Calculator — beat/bar durations for any meter and BPM
 * (timeSigBeatMs/barsToSeconds/secondsToBars, Node-verified). Handles both
 * directions: bars→seconds and seconds→bars.
 */

import { useState } from "react";

import { timeSigBeatMs, barsToSeconds, secondsToBars } from "@/domains/audio/lib/calc";

export default function TimeSignatureCalculator() {
  const [bpm, setBpm] = useState(120);
  const [top, setTop] = useState(4);
  const [bottom, setBottom] = useState(4);
  const [bars, setBars] = useState(16);
  const [seconds, setSeconds] = useState(30);

  const beatMs = timeSigBeatMs(bpm, bottom);
  const barSec = barsToSeconds(bpm, top, bottom, 1);
  const barsDur = barsToSeconds(bpm, top, bottom, bars);
  const barsIn = secondsToBars(bpm, top, bottom, seconds);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Tempo (BPM)</span>
          <input
            type="number"
            min={1}
            max={400}
            value={bpm}
            onChange={(e) => setBpm(Math.max(1, Math.min(400, Number(e.target.value) || 120)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Beats per bar</span>
          <input
            type="number"
            min={1}
            max={32}
            value={top}
            onChange={(e) => setTop(Math.max(1, Math.min(32, Number(e.target.value) || 4)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Note value (4 = quarter)</span>
          <input
            type="number"
            min={1}
            max={64}
            value={bottom}
            onChange={(e) => setBottom(Math.max(1, Math.min(64, Number(e.target.value) || 4)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Meter</p>
          <p className="text-lg font-bold text-foreground">{top}/{bottom}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Bars → duration
          </p>
          <label className="mt-2 block space-y-1">
            <span className="text-xs text-muted-foreground">Bars</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={bars}
              onChange={(e) => setBars(Math.max(1, Math.min(1000, Number(e.target.value) || 16)))}
              className="w-32 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <p className="mt-2 text-lg font-bold text-foreground">{barsDur.toFixed(2)} s</p>
          <p className="text-xs text-muted-foreground">
            one beat {beatMs.toFixed(1)} ms · one bar {barSec.toFixed(3)} s
          </p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Duration → bars
          </p>
          <label className="mt-2 block space-y-1">
            <span className="text-xs text-muted-foreground">Seconds</span>
            <input
              type="number"
              min={0.1}
              max={7200}
              step={0.1}
              value={seconds}
              onChange={(e) => setSeconds(Math.max(0.1, Math.min(7200, Number(e.target.value) || 30)))}
              className="w-32 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <p className="mt-2 text-lg font-bold text-foreground">{barsIn.toFixed(2)} bars</p>
          <p className="text-xs text-muted-foreground">
            {secondsToBars(bpm, top, bottom, seconds) * top >= 0
              ? `≈ ${(barsIn * top).toFixed(1)} beats`
              : ""}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        The bottom number names the beat unit: 4 = quarter note, 8 = eighth, 2 = half. A 6/8 bar at
        120 BPM is 1.5 s — eighth-note beats, six per bar.
      </p>
    </div>
  );
}
