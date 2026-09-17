"use client";

/**
 * White Noise Generator — flat-spectrum noise, seeded and reproducible.
 * Synthesis is generateWhiteNoise() (Node-verified: bounded amplitude,
 * RMS ≈ amp/√3, seed determinism).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateWhiteNoise, type Generated } from "@/domains/audio/lib/generate";

export default function WhiteNoiseGenerator() {
  const [amplitudePct, setAmplitudePct] = useState(30);
  const [durationSec, setDurationSec] = useState(5);
  const [seed, setSeed] = useState(12345);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateWhiteNoise(sampleRate, durationSec, amplitudePct / 100, seed),
    [durationSec, amplitudePct, seed],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="white-noise"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          white · peak {amplitudePct}% · {g.length.toLocaleString()} samples ·{" "}
          {(g.length / g.sampleRate).toFixed(2)} s · seed {seed}
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          <span className="text-xs font-medium text-muted-foreground">Seed (reproducible)</span>
          <input
            type="number"
            min={1}
            value={seed}
            onChange={(e) => setSeed(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>
      </div>
    </GeneratorToolShell>
  );
}
