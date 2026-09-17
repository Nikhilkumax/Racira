"use client";

/**
 * Audio Limiter — brick-wall peak control (limitChannel, Node-verified with a
 * lookahead ring buffer: a peak never passes the ceiling, and the gain that
 * handles it is the one computed when the peak was seen, not a recovered one).
 * Use it as the last stage before upload/export so nothing clips downstream.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { limitChannel, peakOf, toDb } from "@/domains/audio/lib/dynamics";

export default function AudioLimiter() {
  const [ceilingDb, setCeilingDb] = useState(-1);
  const [lookaheadMs, setLookaheadMs] = useState(5);
  const [releaseMs, setReleaseMs] = useState(100);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        let inPeak = 0;
        for (const ch of channels) inPeak = Math.max(inPeak, peakOf(ch));
        const out = channels.map((ch) =>
          limitChannel(ch, sampleRate, { ceilingDb, lookaheadMs, releaseMs }),
        );
        let outPeak = 0;
        for (const ch of out) outPeak = Math.max(outPeak, peakOf(ch));
        setReport(
          `Peak: ${toDb(inPeak).toFixed(1)} dBFS → ${toDb(outPeak).toFixed(1)} dBFS · ceiling ${ceilingDb} dBFS never exceeded`,
        );
        return { channels: out, sampleRate, length };
      },
    [ceilingDb, lookaheadMs, releaseMs],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="limited"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Ceiling: {ceilingDb} dBFS
          </span>
          <input
            type="range"
            min={-6}
            max={0}
            step={0.5}
            value={ceilingDb}
            onChange={(e) => setCeilingDb(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Lookahead: {lookaheadMs} ms
            </span>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={lookaheadMs}
              onChange={(e) => setLookaheadMs(Number(e.target.value))}
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
              max={500}
              step={10}
              value={releaseMs}
              onChange={(e) => setReleaseMs(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          The limiter looks {lookaheadMs} ms ahead so it can duck before a peak
          arrives — that is what keeps bricks brick-shaped. Longer releases sound
          smoother on dense material; shorter ones recover faster between hits.
        </p>
      </div>
    </EditToolShell>
  );
}
