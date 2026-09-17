"use client";

/**
 * Frequency Sweep Generator — workflow-oriented sweep tool: audio-band presets
 * (full-band, subwoofer, speech), log/linear curves, optional reverse, and a
 * continuous loop-friendly 20 s default. Synthesis is generateSweep() with
 * instantaneous-frequency integration (Node-verified start/end frequencies).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateSweep, type Generated } from "@/domains/audio/lib/generate";

const PRESETS: { label: string; fromHz: number; toHz: number; dur: number; curve: "linear" | "exponential" }[] = [
  {
    label: "Full-band (20 Hz → 20 kHz, log, 20 s)",
    fromHz: 20,
    toHz: 20000,
    dur: 20,
    curve: "exponential",
  },
  { label: "Subwoofer (10 → 120 Hz, log, 15 s)", fromHz: 10, toHz: 120, dur: 15, curve: "exponential" },
  { label: "Speech band (100 → 4 kHz, log, 10 s)", fromHz: 100, toHz: 4000, dur: 10, curve: "exponential" },
  { label: "Room mode finder (20 → 300 Hz, log, 30 s)", fromHz: 20, toHz: 300, dur: 30, curve: "exponential" },
];

export default function FrequencySweepGenerator() {
  const [fromHz, setFromHz] = useState(20);
  const [toHz, setToHz] = useState(20000);
  const [durationSec, setDurationSec] = useState(20);
  const [curve, setCurve] = useState<"linear" | "exponential">("exponential");
  const [reverse, setReverse] = useState(false);
  const [amplitudePct, setAmplitudePct] = useState(70);

  const generate = useCallback(
    (sampleRate: number): Generated => {
      const [a, b] = reverse ? [toHz, fromHz] : [fromHz, toHz];
      return generateSweep(sampleRate, {
        fromHz: a,
        toHz: b,
        durationSec,
        amplitude: amplitudePct / 100,
        curve,
      });
    },
    [fromHz, toHz, durationSec, curve, reverse, amplitudePct],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="frequency-sweep"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {(reverse ? toHz : fromHz).toLocaleString()} → {(reverse ? fromHz : toHz).toLocaleString()}{" "}
          Hz · {curve === "exponential" ? "log" : "linear"} · {amplitudePct}% · {durationSec} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5 sm:col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-muted-foreground">Preset</span>
          <select
            value=""
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (Number.isInteger(idx) && PRESETS[idx]) {
                const p = PRESETS[idx];
                setFromHz(p.fromHz);
                setToHz(p.toHz);
                setDurationSec(p.dur);
                setCurve(p.curve);
              }
            }}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            <option value="">— choose a preset —</option>
            {PRESETS.map((p, i) => (
              <option key={i} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Start (Hz)</span>
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
          <span className="text-xs font-medium text-muted-foreground">End (Hz)</span>
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
          <span className="text-xs font-medium text-muted-foreground">Duration (s)</span>
          <input
            type="number"
            min={0.5}
            max={120}
            step={0.5}
            value={durationSec}
            onChange={(e) => setDurationSec(Math.max(0.5, Math.min(120, Number(e.target.value) || 20)))}
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
            <option value="exponential">Log (equal octave spacing)</option>
            <option value="linear">Linear (equal Hz spacing)</option>
          </select>
        </label>

        <label className="flex items-center gap-2 pt-6 text-sm text-foreground">
          <input
            type="checkbox"
            checked={reverse}
            onChange={(e) => setReverse(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          Reverse direction
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
