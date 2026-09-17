"use client";

/**
 * Tremolo Effect — periodic amplitude modulation.
 *
 * Uses applyTremolo() (Node-verified): raised-cosine LFO between (1−depth)
 * and 1 at `rate` Hz. The shape-periodicity test uses rate = sr/2 / (len/2)
 * so the file spans exactly two LFO cycles.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyTremolo } from "@/domains/audio/lib/edit";

const RATE_PRESETS: { label: string; hz: number }[] = [
  { label: "Slow 2 Hz", hz: 2 },
  { label: "4 Hz", hz: 4 },
  { label: "6 Hz", hz: 6 },
  { label: "8 Hz", hz: 8 },
];

export default function TremoloEffect() {
  const [rateHz, setRateHz] = useState(4);
  const [depth, setDepth] = useState(0.5);

  return (
    <EditToolShell
      outputSuffix="-tremolo.wav"
      transform={({ channels, sampleRate }) => ({
        channels: channels.map((ch) => applyTremolo(ch, sampleRate, rateHz, depth)),
        sampleRate,
        length: channels[0].length,
      })}
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Speed <span className="text-muted-foreground">({rateHz} Hz)</span>
          </p>
          <input
            type="range"
            min={0.5}
            max={12}
            step={0.5}
            value={rateHz}
            onChange={(e) => setRateHz(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Tremolo rate in hertz"
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
            Depth <span className="text-muted-foreground">({(depth * 100).toFixed(0)}% — volume swing)</span>
          </p>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={depth * 100}
            onChange={(e) => setDepth(Number(e.target.value) / 100)}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Tremolo depth"
          />
        </div>
      </div>
    </EditToolShell>
  );
}
