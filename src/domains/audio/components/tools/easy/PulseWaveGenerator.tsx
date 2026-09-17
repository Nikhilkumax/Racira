"use client";

/**
 * Pulse Wave Generator — variable-duty rectangular wave. Synthesis is
 * generateWave("pulse", …, dutyCycle) (Node-verified: high for the first
 * duty fraction of each cycle, ±amp levels, exact period).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateWave, type Generated } from "@/domains/audio/lib/generate";

export default function PulseWaveGenerator() {
  const [frequency, setFrequency] = useState(100);
  const [dutyPct, setDutyPct] = useState(25);
  const [amplitudePct, setAmplitudePct] = useState(50);
  const [durationSec, setDurationSec] = useState(3);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateWave("pulse", sampleRate, durationSec, frequency, amplitudePct / 100, dutyPct / 100),
    [durationSec, frequency, dutyPct, amplitudePct],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="pulse-wave"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          pulse · {frequency.toLocaleString()} Hz · duty {dutyPct}% · peak {amplitudePct}% · {durationSec} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Frequency (Hz)</span>
          <input
            type="number"
            min={0.01}
            max={20000}
            step={0.01}
            value={frequency}
            onChange={(e) => setFrequency(Math.max(0.01, Math.min(20000, Number(e.target.value) || 100)))}
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
          <span className="text-xs font-medium text-muted-foreground">Duty cycle ({dutyPct}%)</span>
          <input
            type="range"
            min={5}
            max={95}
            value={dutyPct}
            onChange={(e) => setDutyPct(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
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
