"use client";

/**
 * Sweep Tone Generator — linear or exponential frequency glide from f0 to f1.
 * Synthesis is generateSweep(): instantaneous frequency integrated per sample
 * (parabolic phase for linear, geometric for exponential — the chirp
 * definitions; Node-verified start/end instantaneous frequencies).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateSweep, type Generated } from "@/domains/audio/lib/generate";

export default function SweepToneGenerator() {
  const [fromHz, setFromHz] = useState(20);
  const [toHz, setToHz] = useState(20000);
  const [curve, setCurve] = useState<"linear" | "exponential">("exponential");
  const [amplitudePct, setAmplitudePct] = useState(70);
  const [durationSec, setDurationSec] = useState(10);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateSweep(sampleRate, {
        fromHz,
        toHz,
        durationSec,
        amplitude: amplitudePct / 100,
        curve,
      }),
    [fromHz, toHz, durationSec, amplitudePct, curve],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="sweep-tone"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {fromHz.toLocaleString()} → {toHz.toLocaleString()} Hz · {curve} · {amplitudePct}% ·{" "}
          {durationSec} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Start frequency (Hz)</span>
          <input
            type="number"
            min={1}
            max={20000}
            value={fromHz}
            onChange={(e) => setFromHz(Math.max(1, Math.min(20000, Number(e.target.value) || 20)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">End frequency (Hz)</span>
          <input
            type="number"
            min={1}
            max={20000}
            value={toHz}
            onChange={(e) => setToHz(Math.max(1, Math.min(20000, Number(e.target.value) || 20000)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Curve</span>
          <select
            value={curve}
            onChange={(e) => setCurve(e.target.value === "linear" ? "linear" : "exponential")}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            <option value="exponential">Exponential (equal octave spacing)</option>
            <option value="linear">Linear (equal Hz spacing)</option>
          </select>
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
