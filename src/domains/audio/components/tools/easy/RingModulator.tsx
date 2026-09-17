"use client";

/**
 * Ring Modulator — classic x·cos(2πft) metallic effect.
 *
 * Uses applyRingModulation() (Node-verified): the carrier cosine is exact
 * (impulse response values hand-checked), so what you hear is the math.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyRingModulation } from "@/domains/audio/lib/edit";

const PRESETS = [
  { label: "Robot 30 Hz", freq: 30, phase: 0 },
  { label: "Dalek 70 Hz", freq: 70, phase: 0 },
  { label: "Sci-fi 230 Hz", freq: 230, phase: 90 },
  { label: "Metallic 640 Hz", freq: 640, phase: 0 },
];

export default function RingModulator() {
  const [freq, setFreq] = useState(70);
  const [phase, setPhase] = useState(0);

  return (
    <EditToolShell
      outputSuffix="-ringmod.wav"
      transform={({ channels, sampleRate }) => ({
        channels: channels.map((ch) => applyRingModulation(ch, sampleRate, freq, phase)),
        sampleRate,
        length: channels[0].length,
      })}
      footer={
        <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Output spectrum: f ± {freq} Hz sidebands (carrier suppressed at phase 90°). Very low
          carrier rates (&lt; 20 Hz) act as an amplitude tremolo instead of a metallic tone.
        </div>
      }
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Carrier frequency <span className="text-muted-foreground">({freq} Hz)</span>
          </p>
          <input
            type="range"
            min={1}
            max={1200}
            step={1}
            value={freq}
            onChange={(e) => setFreq(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Ring modulator carrier frequency"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.freq}
                type="button"
                onClick={() => {
                  setFreq(preset.freq);
                  setPhase(preset.phase);
                }}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                  (freq === preset.freq
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            Carrier phase <span className="text-muted-foreground">({phase}°)</span>
          </p>
          <input
            type="range"
            min={0}
            max={360}
            step={15}
            value={phase}
            onChange={(e) => setPhase(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Ring modulator carrier phase"
          />
        </div>
      </div>
    </EditToolShell>
  );
}
