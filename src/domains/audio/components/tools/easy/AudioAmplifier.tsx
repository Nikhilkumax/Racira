"use client";

/**
 * Audio Amplifier — dB gain with hard-clip warning.
 *
 * Uses applyGainDb() (Node-verified): multiplies by 10^(dB/20), clamps to
 * ±1 and counts clipped samples. The footer turns the clip count into an
 * explicit warning instead of silently squaring off peaks.
 */

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyGainDb } from "@/domains/audio/lib/edit";

const GAIN_PRESETS: { label: string; db: number }[] = [
  { label: "+3 dB", db: 3 },
  { label: "+6 dB", db: 6 },
  { label: "+10 dB", db: 10 },
  { label: "+20 dB", db: 20 },
];

export default function AudioAmplifier() {
  const [db, setDb] = useState(6);
  const [stats, setStats] = useState<{ clipped: number; peakBefore: number } | null>(null);

  return (
    <EditToolShell
      outputSuffix="-amplified.wav"
      transform={({ channels, sampleRate }) => {
        let clipped = 0;
        let peakBefore = 0;
        const out = channels.map((ch) => {
          const r = applyGainDb(ch, db);
          clipped += r.clippedSamples;
          peakBefore = Math.max(peakBefore, r.peakBefore);
          return r.out;
        });
        setStats({ clipped, peakBefore });
        return { channels: out, sampleRate, length: channels[0].length };
      }}
      footer={
        stats ? (
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Peak was {stats.peakBefore.toFixed(3)} (−{(20 * Math.log10(stats.peakBefore || 1)).toFixed(1)} dBFS).
            {stats.clipped > 0 ? (
              <span className="ml-1 inline-flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                {stats.clipped.toLocaleString()} samples hit the ceiling and were clipped —
                try a smaller boost or Volume Booster&apos;s limiter.
              </span>
            ) : (
              <span className="ml-1">No clipping — every sample stayed inside the range.</span>
            )}
          </div>
        ) : undefined
      }
    >
      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">
          Gain <span className="text-muted-foreground">(+{db} dB)</span>
        </p>
        <input
          type="range"
          min={1}
          max={24}
          step={1}
          value={db}
          onChange={(e) => setDb(Number(e.target.value))}
          className="mt-3 w-full accent-[hsl(var(--primary))]"
          aria-label="Gain in decibels"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {GAIN_PRESETS.map((preset) => (
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
