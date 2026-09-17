"use client";

/**
 * Volume Booster — loudness increase with an optional soft-clip limiter.
 *
 * Distinct from Audio Amplifier: the limiter path runs samples through
 * tanh(x·gain) (Node-verified: output approaches but never exceeds ±1, zero
 * hard-clipped samples), trading a gentle peak saturation for an honest
 * "no clipping" promise at high boosts.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyBoostWithLimiter } from "@/domains/audio/lib/edit";

const BOOST_PRESETS: { label: string; db: number }[] = [
  { label: "+3 dB", db: 3 },
  { label: "+6 dB", db: 6 },
  { label: "+12 dB", db: 12 },
];

export default function VolumeBooster() {
  const [db, setDb] = useState(6);
  const [limiter, setLimiter] = useState(true);
  const [peak, setPeak] = useState<number | null>(null);

  return (
    <EditToolShell
      outputSuffix="-boosted.wav"
      transform={({ channels, sampleRate }) => {
        const linear = Math.pow(10, db / 20);
        let peakAfter = 0;
        const out = channels.map((ch) => {
          const r = applyBoostWithLimiter(ch, linear, limiter);
          peakAfter = Math.max(peakAfter, r.peakAfter);
          return r.out;
        });
        setPeak(peakAfter);
        return { channels: out, sampleRate, length: channels[0].length };
      }}
      footer={
        peak !== null ? (
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Output peak: {peak.toFixed(3)}
            {limiter
              ? " — limited with soft saturation instead of hard clipping."
              : " — hard-clipped where the boost exceeded full scale."}
          </div>
        ) : undefined
      }
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Boost <span className="text-muted-foreground">(+{db} dB)</span>
          </p>
          <input
            type="range"
            min={1}
            max={18}
            step={1}
            value={db}
            onChange={(e) => setDb(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Boost in decibels"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {BOOST_PRESETS.map((preset) => (
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
        <div>
          <p className="text-sm font-medium text-foreground">Limiter</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLimiter(true)}
              className={
                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
                (limiter
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
              }
            >
              Soft limit
              <span className="block text-[10px] font-normal opacity-80">
                No clipping, gentle saturation
              </span>
            </button>
            <button
              type="button"
              onClick={() => setLimiter(false)}
              className={
                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
                (!limiter
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
              }
            >
              Hard clip
              <span className="block text-[10px] font-normal opacity-80">
                Raw boost, squared peaks
              </span>
            </button>
          </div>
        </div>
      </div>
    </EditToolShell>
  );
}
