"use client";

/**
 * Warble Tone Generator — a carrier frequency-modulated by a slower sine
 * (the classic speaker/system-check warble). Synthesis is generateWarble()
 * (Node-verified FM recursion: phase integrates the instantaneous frequency).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateWarble, type Generated } from "@/domains/audio/lib/generate";

export default function WarbleToneGenerator() {
  const [centerHz, setCenterHz] = useState(1000);
  const [deviationHz, setDeviationHz] = useState(400);
  const [rateHz, setRateHz] = useState(2);
  const [amplitudePct, setAmplitudePct] = useState(80);
  const [durationSec, setDurationSec] = useState(3);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateWarble(sampleRate, {
        centerHz,
        deviationHz,
        rateHz,
        durationSec,
        amplitude: amplitudePct / 100,
      }),
    [centerHz, deviationHz, rateHz, amplitudePct, durationSec],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="warble-tone"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {centerHz.toLocaleString()} ±{deviationHz.toLocaleString()} Hz at {rateHz} Hz rate ·{" "}
          {amplitudePct}% · {durationSec} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Center frequency (Hz)</span>
          <input
            type="number"
            min={20}
            max={20000}
            value={centerHz}
            onChange={(e) => setCenterHz(Math.max(20, Math.min(20000, Number(e.target.value) || 1000)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Deviation (Hz)</span>
          <input
            type="number"
            min={0}
            max={5000}
            value={deviationHz}
            onChange={(e) => setDeviationHz(Math.max(0, Math.min(5000, Number(e.target.value) || 0)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Modulation rate (Hz)</span>
          <input
            type="number"
            min={0.1}
            max={50}
            step={0.1}
            value={rateHz}
            onChange={(e) => setRateHz(Math.max(0.1, Math.min(50, Number(e.target.value) || 2)))}
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
            onChange={(e) => setDurationSec(Math.max(0.1, Math.min(60, Number(e.target.value) || 3)))}
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
