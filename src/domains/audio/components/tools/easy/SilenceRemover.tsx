"use client";

/**
 * Silence Remover — cuts silent spans with configurable threshold and
 * minimum duration, padding each cut so transitions stay click-free.
 * Detection and removal are pure (detectSilenceSpans / removeSilenceSpans,
 * Node-verified); the component only picks the parameters and reports what
 * was cut.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { detectSilenceSpans, removeSilenceSpans } from "@/domains/audio/lib/edit";

const THRESHOLDS: { label: string; db: number }[] = [
  { label: "Quiet (−50 dB)", db: -50 },
  { label: "Medium (−40 dB)", db: -40 },
  { label: "Loud room (−30 dB)", db: -30 },
];

export default function SilenceRemover() {
  const [thresholdDb, setThresholdDb] = useState(-40);
  const [minSilenceMs, setMinSilenceMs] = useState(700);
  const [result, setResult] = useState<{ cuts: number; removedSec: number } | null>(null);

  return (
    <EditToolShell
      outputSuffix="-silence-removed.wav"
      transform={({ channels, sampleRate }) => {
        const spans = detectSilenceSpans(channels[0], sampleRate, { thresholdDb, minSilenceMs });
        const padSamples = Math.round(sampleRate * 0.05);
        let cuts = 0;
        let removedSamples = 0;
        const out = channels.map((ch, i) => {
          const r = removeSilenceSpans(ch, spans, padSamples);
          if (i === 0) {
            cuts = r.cuts;
            removedSamples = r.removedSamples;
          }
          return r.out;
        });
        setResult({ cuts, removedSec: removedSamples / sampleRate });
        return { channels: out, sampleRate, length: out[0].length };
      }}
      footer={
        result ? (
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Removed {result.removedSec.toFixed(1)} s of silence in {result.cuts} cut
            {result.cuts === 1 ? "" : "s"} (threshold {thresholdDb} dB, minimum{" "}
            {minSilenceMs} ms, 50 ms padding kept at each cut edge).
          </div>
        ) : undefined
      }
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Silence threshold</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {THRESHOLDS.map((t) => (
              <button
                key={t.db}
                type="button"
                onClick={() => setThresholdDb(t.db)}
                className={
                  "rounded-lg border px-2 py-2 text-xs font-medium transition-colors " +
                  (thresholdDb === t.db
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Minimum silence length{" "}
            <span className="text-muted-foreground">({minSilenceMs} ms)</span>
          </p>
          <input
            type="range"
            min={200}
            max={2000}
            step={100}
            value={minSilenceMs}
            onChange={(e) => setMinSilenceMs(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label="Minimum silence length in milliseconds"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Shorter gaps are kept so speech and music phrasing stay natural. Detection
            runs on the first channel; every channel is cut at identical positions.
          </p>
        </div>
      </div>
    </EditToolShell>
  );
}
