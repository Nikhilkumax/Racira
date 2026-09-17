"use client";

/**
 * Interval Calculator — the interval between two notes: name, semitones,
 * frequency ratio and cents (intervalBetween, Node-verified).
 */

import { useState } from "react";

import { intervalBetween } from "@/domains/audio/lib/theory";

export default function IntervalCalculator() {
  const [noteA, setNoteA] = useState("C4");
  const [noteB, setNoteB] = useState("G4");

  const result = intervalBetween(noteA, noteB);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">From note</span>
          <input
            type="text"
            value={noteA}
            onChange={(e) => setNoteA(e.target.value)}
            placeholder="C4"
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">To note</span>
          <input
            type="text"
            value={noteB}
            onChange={(e) => setNoteB(e.target.value)}
            placeholder="G4"
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        {result ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Interval</p>
              <p className="text-lg font-bold text-foreground">{result.name}</p>
              <p className="text-xs text-muted-foreground">{result.short}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Semitones</p>
              <p className="text-lg font-bold text-foreground">{result.semitones}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ratio</p>
              <p className="text-lg font-bold text-foreground">{result.ratio.toFixed(4)}×</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cents</p>
              <p className="text-lg font-bold text-foreground">{result.cents.toFixed(0)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Enter two notes like C4, F#3 or Bb2.</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Intervals wrap into a single octave — C4 up to E5 still reads as a major 10th spelled C–E.
      </p>
    </div>
  );
}
