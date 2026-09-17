"use client";

/**
 * Audio Speed Changer — tape-style resample and/or OLA time stretch.
 *
 * Two modes, both pure and Node-verified in scratch/test-batch1.mjs:
 *  - "tape": resampleLinear(factor) — speed and pitch move together, like a
 *    tape deck. factor < 1 = faster and higher-pitched.
 *  - "preserve": olaTimeStretch(1/factor) — same speed change with roughly
 *    steady pitch, at the cost of some airy artifacts on heavy stretches.
 */

import { useState } from "react";
import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { resampleLinear, olaTimeStretch } from "@/domains/audio/lib/edit";

type SpeedMode = "tape" | "preserve";

const SPEED_PRESETS: { label: string; value: number }[] = [
  { label: "0.5×", value: 0.5 },
  { label: "0.75×", value: 0.75 },
  { label: "1.25×", value: 1.25 },
  { label: "1.5×", value: 1.5 },
  { label: "2×", value: 2 },
];

export default function AudioSpeedChanger() {
  const [mode, setMode] = useState<SpeedMode>("tape");
  const [factor, setFactor] = useState(1);

  return (
    <EditToolShell
      outputSuffix="-speed.wav"
      transform={({ channels, sampleRate }) => ({
        channels: channels.map((ch) =>
          mode === "tape" ? resampleLinear(ch, factor) : olaTimeStretch(ch, 1 / factor),
        ),
        sampleRate,
        // Both modes produce duration = original / factor; the lib functions
        // size their outputs as ceil(len / factor) and ceil(len * (1/factor))
        // respectively, which agree up to the shared Math.ceil.
        length: Math.max(1, Math.ceil(channels[0].length / factor)),
      })}
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Speed mode</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(
              [
                { value: "tape", label: "Tape style", hint: "Pitch shifts with speed" },
                { value: "preserve", label: "Keep pitch", hint: "Stretch, pitch steady" },
              ] as { value: SpeedMode; label: string; hint: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                className={
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
                  (mode === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {opt.label}
                <span className="block text-[10px] font-normal opacity-80">{opt.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            Speed <span className="text-muted-foreground">({factor.toFixed(2)}×)</span>
          </p>
          <input
            type="range"
            min={0.25}
            max={4}
            step={0.05}
            value={factor}
            onChange={(e) => setFactor(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Playback speed factor"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {SPEED_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setFactor(preset.value)}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                  (factor === preset.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {mode === "tape"
              ? "Below 1× slows down and lowers the pitch; above 1× speeds up and raises it — like a record player."
              : "Slower or faster without the pitch change, using overlap-add stretching. Very large changes can sound airy."}
          </p>
        </div>
      </div>
    </EditToolShell>
  );
}
