"use client";

/**
 * Solfeggio Frequency Generator — pure sines at the classic solfeggio set
 * (396/417/528/639/741/852 Hz, plus the extended 174/285/963). Synthesis is
 * generateSolfeggio() with boundary fades (Node-verified fade envelope).
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateSolfeggio, type Generated } from "@/domains/audio/lib/generate";

const FREQUENCIES: { hz: number; label: string }[] = [
  { hz: 174, label: "174 Hz — safety" },
  { hz: 285, label: "285 Hz — restoration" },
  { hz: 396, label: "396 Hz — liberation" },
  { hz: 417, label: "417 Hz — change" },
  { hz: 528, label: "528 Hz — transformation" },
  { hz: 639, label: "639 Hz — connection" },
  { hz: 741, label: "741 Hz — expression" },
  { hz: 852, label: "852 Hz — intuition" },
  { hz: 963, label: "963 Hz — unity" },
];

export default function SolfeggioFrequencyGenerator() {
  const [frequencyHz, setFrequencyHz] = useState(528);
  const [amplitudePct, setAmplitudePct] = useState(70);
  const [durationSec, setDurationSec] = useState(60);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateSolfeggio(sampleRate, {
        frequencyHz,
        durationSec,
        amplitude: amplitudePct / 100,
        fadeSec: 0.05,
      }),
    [frequencyHz, amplitudePct, durationSec],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="solfeggio-tone"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {frequencyHz} Hz · {amplitudePct}% · {durationSec} s · 50 ms boundary fades
        </p>
      )}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Frequency</span>
          <select
            value={frequencyHz}
            onChange={(e) => setFrequencyHz(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            {FREQUENCIES.map((f) => (
              <option key={f.hz} value={f.hz}>
                {f.label}
              </option>
            ))}
          </select>
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
    </GeneratorToolShell>
  );
}
