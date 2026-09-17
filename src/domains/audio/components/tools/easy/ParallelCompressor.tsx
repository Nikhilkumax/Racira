"use client";

/**
 * Parallel Compressor — blend a heavily compressed copy under the dry signal
 * (blendParallel, Node-verified). The compressed layer brings up detail and
 * sustain while the dry layer keeps punch: the classic "New York" drum trick,
 * also great on vocals and bus mixes.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { compressChannel, blendParallel } from "@/domains/audio/lib/dynamics";

export default function ParallelCompressor() {
  const [mix, setMix] = useState(40);
  const [thresholdDb, setThresholdDb] = useState(-28);
  const [ratio, setRatio] = useState(8);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const out = channels.map((ch) => {
          const compressed = compressChannel(
            ch,
            sampleRate,
            { thresholdDb, ratio, kneeDb: 3, makeupGainDb: 6 },
            3,
            80,
          );
          return blendParallel(ch, compressed, mix / 100);
        });
        setReport(
          `Compressed layer: ${ratio}:1 @ ${thresholdDb} dBFS · blended at ${mix}% (${(100 - mix)}% dry)`,
        );
        return { channels: out, sampleRate, length };
      },
    [mix, thresholdDb, ratio],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="parallel"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Compressed blend: {mix}% ({100 - mix}% dry)
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={mix}
            onChange={(e) => setMix(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Compressor threshold: {thresholdDb} dBFS
            </span>
            <input
              type="range"
              min={-48}
              max={-12}
              step={1}
              value={thresholdDb}
              onChange={(e) => setThresholdDb(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Compressor ratio: {ratio}:1
            </span>
            <input
              type="range"
              min={2}
              max={20}
              step={1}
              value={ratio}
              onChange={(e) => setRatio(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          The compressor itself is deliberately aggressive — its job is to be the
          dense layer under the untouched original. Blend to taste: drums usually
          want 30–50%, vocals less.
        </p>
      </div>
    </EditToolShell>
  );
}
