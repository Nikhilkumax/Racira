"use client";

/**
 * Multiband Compressor — split into low/mid/high (splitThreeBand, exact
 * reconstruction, Node-verified), compress each band independently with its
 * own threshold/ratio, then re-sum. Tames a boomy bass or harsh top without
 * dulling the rest, because each band's gain moves only when its own band
 * demands it.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import {
  splitThreeBand,
  compressBandInPlace,
  rmsOf,
  toDb,
} from "@/domains/audio/lib/dynamics";

const BANDS = ["Low", "Mid", "High"] as const;

export default function MultibandCompressor() {
  const [crossover1Hz, setCrossover1Hz] = useState(250);
  const [crossover2Hz, setCrossover2Hz] = useState(2500);
  const [thresholdDb, setThresholdDb] = useState(-24);
  const [ratio, setRatio] = useState(3);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const before = channels.map((ch) => rmsOf(ch));
        const out = channels.map((ch) => {
          const s = splitThreeBand(ch, sampleRate, crossover1Hz, crossover2Hz);
          for (const band of [s.low, s.mid, s.high]) {
            compressBandInPlace(band, sampleRate, {
              thresholdDb,
              ratio,
              kneeDb: 3,
              makeupGainDb: 0,
            }, 5, 120);
          }
          const merged = new Float32Array(ch.length);
          for (let i = 0; i < ch.length; i++) merged[i] = s.low[i] + s.mid[i] + s.high[i];
          return merged;
        });
        const reduction = before.map((b, i) => toDb(rmsOf(out[i])) - toDb(b));
        setReport(
          `Bands split at ${crossover1Hz} Hz / ${crossover2Hz} Hz · RMS change: ${reduction.map((r) => r.toFixed(1)).join(" / ")} dB per channel`,
        );
        return { channels: out, sampleRate, length };
      },
    [crossover1Hz, crossover2Hz, thresholdDb, ratio],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="multiband"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Low→Mid crossover: {crossover1Hz} Hz
            </span>
            <input
              type="range"
              min={80}
              max={800}
              step={10}
              value={crossover1Hz}
              onChange={(e) => setCrossover1Hz(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Mid→High crossover: {crossover2Hz} Hz
            </span>
            <input
              type="range"
              min={1000}
              max={8000}
              step={100}
              value={crossover2Hz}
              onChange={(e) => setCrossover2Hz(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Threshold (all bands): {thresholdDb} dBFS
            </span>
            <input
              type="range"
              min={-48}
              max={-6}
              step={1}
              value={thresholdDb}
              onChange={(e) => setThresholdDb(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Ratio: {ratio}:1
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={ratio}
              onChange={(e) => setRatio(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          The crossover is mathematically complementary — at 1:1 the three bands sum
          back to the exact input — so compression is the only thing that changes the
          sound. Start with a low-band threshold a few dB above its average level to
          tame boom.
        </p>
      </div>
    </EditToolShell>
  );
}
