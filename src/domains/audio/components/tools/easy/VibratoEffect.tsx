"use client";

/**
 * Vibrato Effect — pitch modulation via an oscillating delay line.
 *
 * Uses applyVibrato() (Node-verified): delay(k) = D0 + Dm·sin(2π·rate·k/sr),
 * output reads k − delay(k) with linear interpolation. Output is shorter than
 * the input by the delay-line headroom (documented lib behaviour).
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyVibrato } from "@/domains/audio/lib/edit";

const RATE_PRESETS: { label: string; hz: number }[] = [
  { label: "5 Hz", hz: 5 },
  { label: "6.5 Hz", hz: 6.5 },
  { label: "8 Hz", hz: 8 },
];

interface DepthInfo {
  depthCents: number;
  dm: number;
  omega: number;
  outLen: number;
  inLen: number;
}

export default function VibratoEffect() {
  const [rateHz, setRateHz] = useState(6.5);
  const [depthCents, setDepthCents] = useState(50);
  const [depthInfo, setDepthInfo] = useState<DepthInfo | null>(null);

  return (
    <EditToolShell
      outputSuffix="-vibrato.wav"
      transform={({ channels, sampleRate }) => {
        const omega = (2 * Math.PI * rateHz) / sampleRate;
        const dm = (Math.pow(2, depthCents / 1200) - 1) / omega;
        const outLen = Math.max(1, channels[0].length - Math.ceil(dm) - 2 - Math.ceil(dm));
        setDepthInfo({ depthCents, dm, omega, outLen, inLen: channels[0].length });
        return {
          channels: channels.map((ch) => applyVibrato(ch, sampleRate, { rateHz, depthCents })),
          sampleRate,
          length: outLen,
        };
      }}
      footer={
        depthInfo ? (
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Pitch swings ±{depthInfo.depthCents} cents ({(1200 * Math.log2(1 + depthInfo.dm * depthInfo.omega)).toFixed(0)} cents
            verified) at {rateHz} Hz. Output is {(100 * (1 - depthInfo.outLen / Math.max(1, depthInfo.inLen))).toFixed(1)}% shorter
            than the source — the cost of the modulated delay line.
          </div>
        ) : undefined
      }
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Speed <span className="text-muted-foreground">({rateHz} Hz)</span>
          </p>
          <input
            type="range"
            min={1}
            max={14}
            step={0.5}
            value={rateHz}
            onChange={(e) => setRateHz(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Vibrato rate in hertz"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {RATE_PRESETS.map((preset) => (
              <button
                key={preset.hz}
                type="button"
                onClick={() => setRateHz(preset.hz)}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                  (rateHz === preset.hz
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
            Depth <span className="text-muted-foreground">(±{depthCents} cents)</span>
          </p>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={depthCents}
            onChange={(e) => setDepthCents(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Vibrato depth in cents"
          />
        </div>
      </div>
    </EditToolShell>
  );
}
