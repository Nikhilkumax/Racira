"use client";

/**
 * Stereo Widener — M/S width scaling.
 *
 * Uses applyStereoWidener() (Node-verified): outL = M + w·S, outR = M − w·S.
 * Width 100% is exact identity, 0% folds to mono, >100% pushes the side
 * signal up for a wider image. The lib reports the output peak because
 * out-of-phase material can exceed full scale at high widths.
 */

import { useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import { applyStereoWidener } from "@/domains/audio/lib/edit";

const WIDTH_PRESETS = [
  { label: "Mono 0%", value: 0 },
  { label: "Narrow 70%", value: 0.7 },
  { label: "Normal 100%", value: 1 },
  { label: "Wide 140%", value: 1.4 },
  { label: "Ultra 180%", value: 1.8 },
];

export default function StereoWidener() {
  const [width, setWidth] = useState(1.4);
  const [stats, setStats] = useState<{ peak: number; sideBefore: number; sideAfter: number } | null>(
    null,
  );

  return (
    <EditToolShell
      outputSuffix="-wide.wav"
      minChannels={2}
      transform={({ channels, sampleRate }) => {
        const [left, right] = channels;
        // Side-energy share before/after: the honest measure of "wider" —
        // correlation cannot change for fully correlated content, but the
        // side-channel energy ratio scales by w² exactly.
        const sideEnergy = (l: Float32Array, r: Float32Array) => {
          let side = 0;
          let mid = 0;
          const n = Math.min(l.length, r.length);
          for (let i = 0; i < n; i++) {
            const m = (l[i] + r[i]) / 2;
            const s = (l[i] - r[i]) / 2;
            mid += m * m;
            side += s * s;
          }
          const total = mid + side;
          return total === 0 ? 0 : side / total;
        };
        const wide = applyStereoWidener(left, right, { width });
        setStats({
          peak: wide.peak,
          sideBefore: sideEnergy(left, right),
          sideAfter: sideEnergy(wide.left, wide.right),
        });
        return {
          channels: [wide.left, wide.right],
          sampleRate,
          length: wide.left.length,
        };
      }}
      footer={
        stats ? (
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Side-channel energy {((stats.sideBefore || 0) * 100).toFixed(1)}% →{" "}
            {((stats.sideAfter || 0) * 100).toFixed(1)}% of total at width{" "}
            {(width * 100).toFixed(0)}%.
            {stats.peak > 1 && (
              <span className="ml-1 font-medium text-destructive">
                Warning: output peaks at {stats.peak.toFixed(2)} (above full scale) — out-of-phase
                content grew. Use the Amplifier to bring it down.
              </span>
            )}
          </div>
        ) : undefined
      }
    >
      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">
          Stereo width <span className="text-muted-foreground">({(width * 100).toFixed(0)}%)</span>
        </p>
        <input
          type="range"
          min={0}
          max={200}
          step={5}
          value={width * 100}
          onChange={(e) => setWidth(Number(e.target.value) / 100)}
          className="mt-3 w-full accent-[hsl(var(--primary))]"
          aria-label="Stereo width percentage"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {WIDTH_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setWidth(preset.value)}
              className={
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                (width === preset.value
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
