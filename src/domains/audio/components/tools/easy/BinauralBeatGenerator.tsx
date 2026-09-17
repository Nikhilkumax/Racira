"use client";

/**
 * Binaural Beat Generator — a slightly different sine in each ear; the beat
 * is perceived in the brain, so headphones are required. Left channel runs
 * at carrier − beat/2, right at carrier + beat/2 (generateBinaural,
 * Node-verified exact frequencies per channel).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateBinaural, type Generated } from "@/domains/audio/lib/generate";

export default function BinauralBeatGenerator() {
  const [carrierHz, setCarrierHz] = useState(200);
  const [beatHz, setBeatHz] = useState(10);
  const [amplitudePct, setAmplitudePct] = useState(70);
  const [durationSec, setDurationSec] = useState(60);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateBinaural(sampleRate, {
        carrierHz,
        beatHz,
        durationSec,
        amplitude: amplitudePct / 100,
      }),
    [carrierHz, beatHz, amplitudePct, durationSec],
  );

  const fL = carrierHz - beatHz / 2;
  const fR = carrierHz + beatHz / 2;

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="binaural-beat"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          L {fL.toFixed(1)} Hz / R {fR.toFixed(1)} Hz · beat {beatHz} Hz · {durationSec} s · listen on
          headphones
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
          <span className="text-xs font-medium text-muted-foreground">Beat frequency (Hz)</span>
          <input
            type="number"
            min={0.5}
            max={40}
            step={0.5}
            value={beatHz}
            onChange={(e) => setBeatHz(Math.max(0.5, Math.min(40, Number(e.target.value) || 10)))}
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
        Common targets: delta 0.5–4 Hz (sleep), theta 4–8 Hz (meditation), alpha 8–13 Hz (calm focus),
        beta 13–30 Hz (alert work).
      </p>
    </GeneratorToolShell>
  );
}
