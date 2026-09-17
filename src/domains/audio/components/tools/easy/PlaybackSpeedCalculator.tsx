"use client";

/**
 * Playback Speed Calculator — speed ↔ duration ↔ tape-style pitch shift
 * (playbackSpeedStats, Node-verified: speed=2 → half duration, +12 semitones).
 */

import { useState } from "react";

import { playbackSpeedStats } from "@/domains/audio/lib/calc";

export default function PlaybackSpeedCalculator() {
  const [originalDur, setOriginalDur] = useState(180);
  const [newDur, setNewDur] = useState(150);

  const stats = playbackSpeedStats(originalDur, { newDurationSec: newDur });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Original duration (s)</span>
          <input
            type="number"
            min={0.1}
            max={72000}
            step={0.1}
            value={originalDur}
            onChange={(e) => setOriginalDur(Math.max(0.1, Math.min(72000, Number(e.target.value) || 180)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Target duration (s)</span>
          <input
            type="number"
            min={0.1}
            max={72000}
            step={0.1}
            value={newDur}
            onChange={(e) => setNewDur(Math.max(0.1, Math.min(72000, Number(e.target.value) || 150)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        {stats ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Speed</p>
              <p className="text-2xl font-bold text-foreground">{stats.speed.toFixed(4)}×</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Pitch shift</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.semitones >= 0 ? "+" : ""}{stats.semitones.toFixed(2)} st
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">New duration</p>
              <p className="text-2xl font-bold text-foreground">{stats.newDurationSec.toFixed(1)} s</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a positive original duration.</p>
        )}
      </div>

      <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Common presets</p>
        <p className="mt-1">
          1.25× = +3.86 st · 1.5× = +7.02 st · 2× = +12 st (octave up) · 0.75× = −4.98 st · 0.5× =
          −12 st (octave down). Tape-style speed change always drags pitch with it — to change
          speed without pitch, you need time-stretch (see the Audio Speed Changer tool).
        </p>
      </div>
    </div>
  );
}
