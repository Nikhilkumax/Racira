"use client";

/**
 * Test Tone Generator — professional reference tones with continuous or
 * burst envelope. Shapes: sine, square, sawtooth, triangle, pulse. Burst
 * mode applies 10 ms fades at burst edges to avoid spectral splatter.
 * Level is set directly in dBFS.
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

export default function TestToneGenerator() {
  const [shape, setShape] = useState<WaveShape>("sine");
  const [frequencyHz, setFrequencyHz] = useState(1000);
  const [levelDbFs, setLevelDbFs] = useState(-20);
  const [durationSec, setDurationSec] = useState(5);
  const [burstOnSec, setBurstOnSec] = useState(1);
  const [burstOffSec, setBurstOffSec] = useState(1);

  const generate = useCallback(
    (sampleRate: number): Generated => {
      const amplitude = Math.pow(10, levelDbFs / 20);
      if (burstOffSec <= 0) {
        return generateWave(shape, sampleRate, durationSec, frequencyHz, amplitude, 0.5, 0);
      }
      const on = Math.max(1, Math.round(burstOnSec * sampleRate));
      const off = Math.max(0, Math.round(burstOffSec * sampleRate));
      const fade = Math.max(1, Math.round(0.01 * sampleRate));
      const base = generateWave(shape, sampleRate, durationSec, frequencyHz, amplitude, 0.5, 0);
      const out = new Float32Array(base.length);
      const period = on + off;
      for (let i = 0; i < out.length; i++) {
        const pos = i % period;
        let env = pos < on ? 1 : 0;
        if (pos < fade) env *= pos / fade;
        else if (pos > on - fade) env *= Math.max(0, (on - pos) / fade);
        out[i] = base.channels[0][i] * env;
      }
      return { channels: [out], sampleRate, length: out.length };
    },
    [shape, frequencyHz, levelDbFs, durationSec, burstOnSec, burstOffSec],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="test-tone"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {shape} · {frequencyHz.toLocaleString()} Hz · {levelDbFs} dBFS ·{" "}
          {burstOffSec > 0 ? `${burstOnSec}s on / ${burstOffSec}s off burst` : "continuous"} ·{" "}
          {durationSec} s
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
            value={frequencyHz}
            onChange={(e) => setFrequencyHz(Math.max(1, Math.min(20000, Number(e.target.value) || 1000)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Level (dBFS)</span>
          <input
            type="number"
            min={-60}
            max={0}
            value={levelDbFs}
            onChange={(e) => setLevelDbFs(Math.max(-60, Math.min(0, Number(e.target.value) || -20)))}
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
            onChange={(e) => setDurationSec(Math.max(0.1, Math.min(60, Number(e.target.value) || 5)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Burst on (s)</span>
          <input
            type="number"
            min={0.1}
            max={10}
            step={0.1}
            value={burstOnSec}
            onChange={(e) => setBurstOnSec(Math.max(0.1, Math.min(10, Number(e.target.value) || 1)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Burst off (s, 0 = continuous)
          </span>
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={burstOffSec}
            onChange={(e) => setBurstOffSec(Math.max(0, Math.min(10, Number(e.target.value) || 0)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>
      </div>
    </GeneratorToolShell>
  );
}
