"use client";

/**
 * Volume Reducer — precise dB attenuation.
 *
 * Uses applyGainDb() (Node-verified in batch 1): multiplies by 10^(dB/20).
 * Reduction never clips, so the footer reports the resulting peak and the
 * headroom it left below full scale.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyGainDb } from "@/domains/audio/lib/edit";

const REDUCE_PRESETS: { label: string; db: number }[] = [
  { label: "−3 dB", db: -3 },
  { label: "−6 dB", db: -6 },
  { label: "−10 dB", db: -10 },
  { label: "−20 dB", db: -20 },
];

export default function VolumeReducer() {
  const [db, setDb] = useState(-6);
  const [stats, setStats] = useState<{ peakAfter: number } | null>(null);

  return (
    <EditToolShell
      outputSuffix="-reduced.wav"
      transform={({ channels, sampleRate }) => {
        let peakAfter = 0;
        const out = channels.map((ch) => {
          const r = applyGainDb(ch, db);
          peakAfter = Math.max(peakAfter, r.peakAfter);
          return r.out;
        });
        setStats({ peakAfter });
        return { channels: out, sampleRate, length: channels[0].length };
      }}
      footer={
        stats ? (
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Peak is now {stats.peakAfter.toFixed(3)} ({(20 * Math.log10(stats.peakAfter || 1)).toFixed(1)} dBFS) —
            {" "}{(20 * Math.log10(1 / (stats.peakAfter || 1))).toFixed(1)} dB of headroom remains below full scale.
          </div>
        ) : undefined
      }
    >
      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">
          Reduction <span className="text-muted-foreground">({db} dB)</span>
        </p>
        <input
          type="range"
          min={-24}
          max={0}
          step={1}
          value={db}
          onChange={(e) => setDb(Number(e.target.value))}
          className="mt-3 w-full accent-[hsl(var(--primary))]"
          aria-label="Volume reduction in decibels"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {REDUCE_PRESETS.map((preset) => (
            <button
              key={preset.db}
              type="button"
              onClick={() => setDb(preset.db)}
              className={
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                (db === preset.db
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
