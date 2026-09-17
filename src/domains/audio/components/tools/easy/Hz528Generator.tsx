"use client";

/**
 * 528 Hz Generator — a pure sine at the "love frequency" from the solfeggio
 * set (separate tool so it can rank on its own query). Synthesis is
 * generateWave("sine", ...) (Node-verified sample-exact).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateWave, type Generated } from "@/domains/audio/lib/generate";

export default function Hz528Generator() {
  const [amplitudePct, setAmplitudePct] = useState(70);
  const [durationSec, setDurationSec] = useState(60);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateWave("sine", sampleRate, durationSec, 528, amplitudePct / 100, 0.5, 0),
    [amplitudePct, durationSec],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="528hz-tone"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          528 Hz (solfeggio "mi") · {amplitudePct}% · {durationSec} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Duration (s)</span>
          <input
            type="number"
            min={1}
            max={600}
            step={1}
            value={durationSec}
            onChange={(e) => setDurationSec(Math.max(1, Math.min(600, Number(e.target.value) || 60)))}
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
