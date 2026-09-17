"use client";

/**
 * Audio Expander — downward expansion (expandChannel, Node-verified): quiet
 * passages below the threshold are pushed further down, the opposite motion of
 * a compressor. Gently tightens a noisy room recording without the hard
 * silence of a gate.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { expandChannel, rmsOf, toDb } from "@/domains/audio/lib/dynamics";

export default function AudioExpander() {
  const [thresholdDb, setThresholdDb] = useState(-35);
  const [ratio, setRatio] = useState(0.5);
  const [kneeDb, setKneeDb] = useState(6);
  const [attackMs, setAttackMs] = useState(5);
  const [releaseMs, setReleaseMs] = useState(150);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const before = rmsOf(channels[0]);
        const out = channels.map((ch) =>
          expandChannel(ch, sampleRate, { thresholdDb, ratio, kneeDb }, attackMs, releaseMs),
        );
        const after = rmsOf(out[0]);
        setReport(
          `${thresholdDb} dBFS threshold · 1:${(1 / ratio).toFixed(1)} downward · RMS ${toDb(before).toFixed(1)} → ${toDb(after).toFixed(1)} dBFS`,
        );
        return { channels: out, sampleRate, length };
      },
    [thresholdDb, ratio, kneeDb, attackMs, releaseMs],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="expanded"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Threshold: {thresholdDb} dBFS
          </span>
          <input
            type="range"
            min={-60}
            max={-12}
            step={1}
            value={thresholdDb}
            onChange={(e) => setThresholdDb(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Ratio (downward): 1:{(1 / ratio).toFixed(1)}
            </span>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.1}
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
              Attack: {attackMs} ms
            </span>
            <input
              type="range"
              min={1}
              max={50}
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
          Expansion quiets what is already quiet — set the threshold just above the
          noise floor so speech and music pass untouched while hiss and room tone
          sink. For hard silence use the gate instead.
        </p>
      </div>
    </EditToolShell>
  );
}
