"use client";

/**
 * Tone Generator — pure synthesized tones: sine, square, sawtooth, triangle
 * and pulse, with frequency/amplitude/phase control. All synthesis is
 * generateWave() (Node-verified sample-exact at quarter periods).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateWave, type Generated, type WaveShape } from "@/domains/audio/lib/generate";

const SHAPES: { value: WaveShape; label: string }[] = [
  { value: "sine", label: "Sine" },
  { value: "square", label: "Square" },
  { value: "sawtooth", label: "Sawtooth" },
  { value: "triangle", label: "Triangle" },
  { value: "pulse", label: "Pulse" },
];

export default function ToneGenerator() {
  const [shape, setShape] = useState<WaveShape>("sine");
  const [frequency, setFrequency] = useState(440);
  const [amplitudePct, setAmplitudePct] = useState(50);
  const [durationSec, setDurationSec] = useState(3);
  const [dutyCycle, setDutyCycle] = useState(25);
  const [phaseDeg, setPhaseDeg] = useState(0);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateWave(shape, sampleRate, durationSec, frequency, amplitudePct / 100, dutyCycle / 100, phaseDeg),
    [shape, durationSec, frequency, amplitudePct, dutyCycle, phaseDeg],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="tone"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {shape} · {frequency.toLocaleString()} Hz · peak {amplitudePct}% · {durationSec} s
          {shape === "pulse" ? ` · duty ${dutyCycle}%` : ""}
          {phaseDeg !== 0 ? ` · phase ${phaseDeg}°` : ""}
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Wave shape</span>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value as WaveShape)}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            {SHAPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Frequency (Hz)</span>
          <input
            type="number"
            min={1}
            max={20000}
            value={frequency}
            onChange={(e) => setFrequency(Math.max(1, Math.min(20000, Number(e.target.value) || 1)))}
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

        {shape === "pulse" && (
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Duty cycle ({dutyCycle}%)</span>
            <input
              type="range"
              min={5}
              max={95}
              value={dutyCycle}
              onChange={(e) => setDutyCycle(Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </label>
        )}

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Phase ({phaseDeg}°)</span>
          <input
            type="range"
            min={0}
            max={359}
            value={phaseDeg}
            onChange={(e) => setPhaseDeg(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </label>
      </div>
    </GeneratorToolShell>
  );
}
