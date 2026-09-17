"use client";

/**
 * Chirp Generator — sine with sinusoidally swept instantaneous frequency:
 * f(t) = center + deviation·sin(2π·rate·t). Synthesis is generateChirp()
 * (Node-verified: instantaneous-frequency integral, bounded within
 * [center − dev, center + dev]).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateChirp, type Generated } from "@/domains/audio/lib/generate";

export default function ChirpGenerator() {
  const [centerHz, setCenterHz] = useState(1000);
  const [deviationHz, setDeviationHz] = useState(400);
  const [rateHz, setRateHz] = useState(2);
  const [amplitudePct, setAmplitudePct] = useState(80);
  const [durationSec, setDurationSec] = useState(4);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateChirp(sampleRate, {
        centerHz,
        deviationHz,
        rateHz,
        durationSec,
        amplitude: amplitudePct / 100,
      }),
    [centerHz, deviationHz, rateHz, durationSec, amplitudePct],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="chirp"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {Math.max(1, centerHz - deviationHz).toLocaleString()}–
          {(centerHz + deviationHz).toLocaleString()} Hz sweep at {rateHz} Hz rate ·{" "}
          {amplitudePct}% · {durationSec} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Center frequency (Hz)</span>
          <input
            type="number"
            min={1}
            max={20000}
            value={centerHz}
            onChange={(e) => setCenterHz(Math.max(1, Math.min(20000, Number(e.target.value) || 1000)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Deviation (±Hz)</span>
          <input
            type="number"
            min={0}
            max={10000}
            value={deviationHz}
            onChange={(e) => setDeviationHz(Math.max(0, Math.min(10000, Number(e.target.value) || 0)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Sweep rate (Hz)</span>
          <input
            type="number"
            min={0.01}
            max={100}
            step={0.01}
            value={rateHz}
            onChange={(e) => setRateHz(Math.max(0.01, Math.min(100, Number(e.target.value) || 1)))}
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
