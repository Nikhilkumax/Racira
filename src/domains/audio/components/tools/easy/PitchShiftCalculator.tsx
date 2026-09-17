"use client";

/**
 * Pitch Shift Calculator — how far a speed/resample change moves pitch, and
 * which interval (semitones/cents) a frequency ratio is
 * (freqToMidi/nearestNote/centsBetween/freqAfterCents from calc.ts,
 * Node-verified). Pure math reference — it processes no audio; for actual
 * pitch-shifting see the Pitch Shifter tool.
 */

import { useState } from "react";

import { nearestNote, centsBetween, freqAfterCents } from "@/domains/audio/lib/calc";

export default function PitchShiftCalculator() {
  const [baseHz, setBaseHz] = useState(440);
  const [targetHz, setTargetHz] = useState(466.16);
  const [speedPercent, setSpeedPercent] = useState(105); // tape/resample speed

  // Interval between the two frequencies.
  const cents = centsBetween(baseHz, targetHz);
  const semis = cents / 100;

  // Tape-style: pitch scales linearly with playback speed.
  const shiftedHz = (baseHz * speedPercent) / 100;
  const shiftedCents = 1200 * Math.log2(speedPercent / 100);

  const baseNote = nearestNote(baseHz);
  const targetNote = nearestNote(targetHz);
  const shiftedNote = nearestNote(shiftedHz);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Interval between two pitches
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="number"
            value={baseHz}
            min={1}
            step={0.01}
            onChange={(e) => setBaseHz(Math.max(1, Number(e.target.value) || 1))}
            className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            aria-label="Original frequency in Hz"
          />
          <span className="text-xs text-muted-foreground">Hz →</span>
          <input
            type="number"
            value={targetHz}
            min={1}
            step={0.01}
            onChange={(e) => setTargetHz(Math.max(1, Number(e.target.value) || 1))}
            className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            aria-label="Shifted frequency in Hz"
          />
          <span className="text-xs text-muted-foreground">Hz</span>
        </div>
        <p className="mt-3 text-2xl font-bold text-foreground">
          {cents >= 0 ? "+" : ""}
          {cents.toFixed(1)} cents
        </p>
        <p className="text-xs text-muted-foreground">
          = {semis >= 0 ? "+" : ""}
          {semis.toFixed(2)} semitones
          {baseNote && targetNote && (
            <>
              {" "}
              · {baseNote.name} → {targetNote.name}
            </>
          )}
        </p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Speed change → pitch (tape / resample behaviour)
        </p>
        <label className="mt-2 block space-y-1.5">
          <span className="text-sm font-medium">
            Playback speed <span className="text-muted-foreground">({speedPercent} %)</span>
          </span>
          <input
            type="range"
            min={50}
            max={200}
            step={1}
            value={speedPercent}
            onChange={(e) => setSpeedPercent(Number(e.target.value))}
            className="w-full"
            aria-label="Playback speed percent"
          />
        </label>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {shiftedCents >= 0 ? "+" : ""}
          {shiftedCents.toFixed(1)} cents
        </p>
        <p className="text-xs text-muted-foreground">
          {baseHz} Hz → {shiftedHz.toFixed(2)} Hz
          {shiftedNote && <> · lands on {shiftedNote.name}</>} · slowing to {(100 / (speedPercent / 100)).toFixed(1)} % returns it
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Time-stretch tools change duration without touching pitch; resampling (tape-style
        speed-up) moves pitch and duration together — that coupling is exactly what this
        calculator quantifies.
      </p>
    </div>
  );
}
