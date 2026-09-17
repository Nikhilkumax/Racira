"use client";

/**
 * Distortion Effect — tanh waveshaping drive.
 *
 * Uses applyDistortion() (Node-verified): out = tanh(k·x)/tanh(k) — odd
 * symmetric (no DC), f(±1) = ±1, strictly increasing, fold-back-free.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyDistortion } from "@/domains/audio/lib/edit";

export default function DistortionEffect() {
  const [drive, setDrive] = useState(5);

  return (
    <EditToolShell
      outputSuffix="-distorted.wav"
      transform={({ channels, sampleRate }) => ({
        channels: channels.map((ch) => applyDistortion(ch, drive)),
        sampleRate,
        length: channels[0].length,
      })}
      footer={
        <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Curve at drive {drive}: quiet parts (±0.1) lift to ±{((Math.tanh(drive * 0.1) / Math.tanh(drive)) * 100).toFixed(0)}% —
          loud parts stay at 100% and round over instead of squaring flat.
        </div>
      }
    >
      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">
          Drive <span className="text-muted-foreground">({drive} — higher is grittier)</span>
        </p>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={drive}
          onChange={(e) => setDrive(Number(e.target.value))}
          className="mt-3 w-full accent-[hsl(var(--primary))]"
          aria-label="Distortion drive"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { label: "Warm 3", value: 3 },
            { label: "Crunch 8", value: 8 },
            { label: "Heavy 15", value: 15 },
            { label: "Fuzz 25", value: 25 },
          ].map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setDrive(preset.value)}
              className={
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                (drive === preset.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
              }
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </EditToolShell>
  );
}
