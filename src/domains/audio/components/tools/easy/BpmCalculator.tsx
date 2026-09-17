"use client";

/**
 * BPM Calculator — BPM from a known number of beats over a measured duration
 * (e.g. 32 beats spanning 15.2 s). Math is bpmFromMs()/beatMs() from calc.ts
 * (Node-verified).
 */

import { useState } from "react";

import { beatMs } from "@/domains/audio/lib/calc";

export default function BpmCalculator() {
  const [beats, setBeats] = useState(32);
  const [seconds, setSeconds] = useState(15.2);

  const bpm = seconds > 0 && beats > 0 ? (beats / seconds) * 60 : 0;
  const beat = bpm > 0 ? beatMs(bpm) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Number of beats</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={beats}
            onChange={(e) => setBeats(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Duration (seconds)</span>
          <input
            type="number"
            min={0.01}
            max={3600}
            step={0.01}
            value={seconds}
            onChange={(e) => setSeconds(Math.max(0.01, Math.min(3600, Number(e.target.value) || 1)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        {bpm > 0 ? (
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground">
              {bpm.toFixed(2)} <span className="text-base font-medium text-muted-foreground">BPM</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {beats} beats in {seconds} s · one beat = {beat.toFixed(1)} ms · one bar (4/4) ={" "}
              {(beat * 4 / 1000).toFixed(3)} s
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a beat count and duration to compute BPM.</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: count along a whole section and enter the total — 8 bars of 4/4 = 32 beats.
      </p>
    </div>
  );
}
