"use client";

/**
 * Square Wave Generator — 50% duty square wave. Synthesis is
 * generateWave("square") (Node-verified: starts at +amp, ±1 levels, exact
 * period). For a variable-duty version use the Pulse Wave Generator.
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateWave, type Generated } from "@/domains/audio/lib/generate";

export default function SquareWaveGenerator() {
  const [frequency, setFrequency] = useState(220);
  const [amplitudePct, setAmplitudePct] = useState(50);
  const [durationSec, setDurationSec] = useState(3);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateWave("square", sampleRate, durationSec, frequency, amplitudePct / 100),
    [durationSec, frequency, amplitudePct],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="square-wave"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          square (50% duty) · {frequency.toLocaleString()} Hz · peak {amplitudePct}% · {durationSec} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Frequency (Hz)</span>
          <input
            type="number"
            min={0.01}
            max={20000}
            step={0.01}
            value={frequency}
            onChange={(e) => setFrequency(Math.max(0.01, Math.min(20000, Number(e.target.value) || 220)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Duration (s)</span>
          <input
            type="number"
            min={0.1}
            max={60}
            step={0.1}
            value={durationSec}
            onChange={(e) => setDurationSec(Math.max(0.1, Math.min(60, Number(e.target.value) || 1)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Amplitude ({amplitudePct}%)</span>
          <input
            type="range"
            min={1}
            max={100}
            value={amplitudePct}
            onChange={(e) => setAmplitudePct(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </label>
      </div>
    </GeneratorToolShell>
  );
}
