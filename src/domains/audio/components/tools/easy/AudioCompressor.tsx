"use client";

/**
 * Audio Compressor — dynamic-range compression (compressChannel, Node-verified:
 * static gain computer with soft knee + attack/release envelope). Reduces the
 * gap between loud and quiet so a mix sits at a more even level.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { compressChannel, rmsOf, toDb } from "@/domains/audio/lib/dynamics";

export default function AudioCompressor() {
  const [thresholdDb, setThresholdDb] = useState(-24);
  const [ratio, setRatio] = useState(4);
  const [kneeDb, setKneeDb] = useState(6);
  const [attackMs, setAttackMs] = useState(10);
  const [releaseMs, setReleaseMs] = useState(120);
  const [makeupGainDb, setMakeupGainDb] = useState(0);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const before = rmsOf(channels[0]);
        const out = channels.map((ch) =>
          compressChannel(
            ch,
            sampleRate,
            { thresholdDb, ratio, kneeDb, makeupGainDb },
            attackMs,
            releaseMs,
          ),
        );
        const after = rmsOf(out[0]);
        setReport(
          `${ratio}:1 above ${thresholdDb} dBFS · RMS ${toDb(before).toFixed(1)} → ${toDb(after).toFixed(1)} dBFS${makeupGainDb ? ` · make-up +${makeupGainDb} dB` : ""}`,
        );
        return { channels: out, sampleRate, length };
      },
    [thresholdDb, ratio, kneeDb, attackMs, releaseMs, makeupGainDb],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="compressed"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Threshold: {thresholdDb} dBFS
            </span>
            <input
              type="range"
              min={-48}
              max={0}
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
              max={20}
              step={0.5}
              value={ratio}
              onChange={(e) => setRatio(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Knee: {kneeDb} dB
            </span>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={kneeDb}
              onChange={(e) => setKneeDb(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Make-up gain: +{makeupGainDb} dB
            </span>
            <input
              type="range"
              min={0}
              max={18}
              step={1}
              value={makeupGainDb}
              onChange={(e) => setMakeupGainDb(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Attack: {attackMs} ms
            </span>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={attackMs}
              onChange={(e) => setAttackMs(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Release: {releaseMs} ms
            </span>
            <input
              type="range"
              min={20}
              max={600}
              step={10}
              value={releaseMs}
              onChange={(e) => setReleaseMs(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Slower attacks let transients through (punchier); faster ones catch them
          (denser, duller). Keep make-up gain modest — use the normalizer or LUFS
          tool for exact final level.
        </p>
      </div>
    </EditToolShell>
  );
}
