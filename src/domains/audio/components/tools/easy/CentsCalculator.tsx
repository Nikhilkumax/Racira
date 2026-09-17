"use client";

/**
 * Cents Calculator — the interval between two frequencies in cents, plus the
 * reverse: frequency ratio and resulting Hz for a cents figure
 * (centsBetween/freqAfterCents, Node-verified).
 */

import { useState } from "react";

import { centsBetween, freqAfterCents, centsToRatio } from "@/domains/audio/lib/calc";

export default function CentsCalculator() {
  const [f1, setF1] = useState(440);
  const [f2, setF2] = useState(450);
  const [centsInput, setCentsInput] = useState(100);
  const [baseFreq, setBaseFreq] = useState(440);

  const cents = centsBetween(f1, f2);
  const shifted = freqAfterCents(baseFreq, centsInput);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Interval between two frequencies
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={f1}
              min={0.1}
              onChange={(e) => setF1(Math.max(0.1, Number(e.target.value) || 1))}
              className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
            <span className="text-muted-foreground">→</span>
            <input
              type="number"
              value={f2}
              min={0.1}
              onChange={(e) => setF2(Math.max(0.1, Number(e.target.value) || 1))}
              className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
            <span className="text-xs text-muted-foreground">Hz</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">
            {cents >= 0 ? "+" : ""}{cents.toFixed(1)} cents
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.abs(cents) < 8 ? "effectively unison" : cents > 0 ? `${(f2 / f1).toFixed(4)}× ratio` : `${(f2 / f1).toFixed(4)}× ratio`}
          </p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Shift a frequency by cents
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={baseFreq}
              min={0.1}
              onChange={(e) => setBaseFreq(Math.max(0.1, Number(e.target.value) || 1))}
              className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
            <span className="text-xs text-muted-foreground">Hz by</span>
            <input
              type="number"
              value={centsInput}
              onChange={(e) => setCentsInput(Number(e.target.value) || 0)}
              className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
            <span className="text-xs text-muted-foreground">cents</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{shifted.toFixed(2)} Hz</p>
          <p className="text-xs text-muted-foreground">
            ratio {centsToRatio(centsInput).toFixed(4)}× (100 cents = 1 semitone)
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        A cent is 1/100 of a semitone: 1200 cents = one octave. Audible tuning drift starts around
        5–10 cents on sustained tones.
      </p>
    </div>
  );
}
