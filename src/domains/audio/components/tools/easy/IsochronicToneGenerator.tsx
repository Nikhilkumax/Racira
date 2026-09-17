"use client";

/**
 * Isochronic Tone Generator — a carrier sine amplitude-gated by a raised-cosine
 * pulse train (generateIsochronic, Node-verified gate shape). Unlike binaural
 * beats, it works on speakers — no headphones needed.
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateIsochronic, type Generated } from "@/domains/audio/lib/generate";

export default function IsochronicToneGenerator() {
  const [carrierHz, setCarrierHz] = useState(200);
  const [pulseHz, setPulseHz] = useState(10);
  const [amplitudePct, setAmplitudePct] = useState(70);
  const [durationSec, setDurationSec] = useState(60);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateIsochronic(sampleRate, {
        carrierHz,
        pulseHz,
        durationSec,
        amplitude: amplitudePct / 100,
      }),
    [carrierHz, pulseHz, amplitudePct, durationSec],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="isochronic-tone"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {carrierHz} Hz carrier · {pulseHz} Hz pulses · {durationSec} s
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Carrier (Hz)</span>
          <input
            type="number"
            min={20}
            max={1000}
            value={carrierHz}
            onChange={(e) => setCarrierHz(Math.max(20, Math.min(1000, Number(e.target.value) || 200)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Pulse rate (Hz)</span>
          <input
            type="number"
            min={0.5}
            max={40}
            step={0.5}
            value={pulseHz}
            onChange={(e) => setPulseHz(Math.max(0.5, Math.min(40, Number(e.target.value) || 10)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

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

      <p className="mt-3 text-xs text-muted-foreground">
        Headphones not required — the pulse is amplitude modulation, identical in both ears.
      </p>
    </GeneratorToolShell>
  );
}
