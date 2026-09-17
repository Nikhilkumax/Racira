"use client";

/**
 * Loudness Normalizer — measure integrated LUFS (BS.1770-4, Node-verified
 * against the EBU Mode anchors in lib/lufs.ts), then apply one static gain so
 * the whole file lands on the target. Exactly what streaming platforms do at
 * ingest — done locally, before they do it to you. Per-channel gain is joint
 * so stereo balance is untouched; a peak ceiling protects against the one
 * loudness-true gain pushing an already-hot master over 0 dBFS.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { integratedLoudness, gainToTargetLufs } from "@/domains/audio/lib/lufs";
import { peakOf, toDb } from "@/domains/audio/lib/dynamics";

export default function LoudnessNormalizer() {
  const [targetLufs, setTargetLufs] = useState(-14);
  const [ceilingDb, setCeilingDb] = useState(-1);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const before = integratedLoudness(channels, sampleRate);
        const gainDb = gainToTargetLufs(before.lufs, targetLufs);
        if (gainDb === null) {
          setReport("File is silent — nothing to normalize.");
          return { channels, sampleRate, length };
        }
        let jointPeak = 0;
        for (const ch of channels) jointPeak = Math.max(jointPeak, peakOf(ch));
        const peakAfterDb = toDb(jointPeak) + gainDb;
        const appliedDb = Math.min(gainDb, ceilingDb - toDb(jointPeak));
        const gain = Math.pow(10, appliedDb / 20);
        const out = channels.map((ch) => {
          const o = new Float32Array(ch.length);
          for (let i = 0; i < ch.length; i++) o[i] = ch[i] * gain;
          return o;
        });
        const achieved = integratedLoudness(out, sampleRate);
        setReport(
          `${before.lufs.toFixed(1)} LUFS → ${achieved.lufs.toFixed(1)} LUFS` +
            (appliedDb < gainDb - 0.01
              ? ` · gain limited to ${appliedDb.toFixed(1)} dB to respect the ${ceilingDb} dBFS ceiling (wanted ${gainDb.toFixed(1)} dB)`
              : ` · gain ${appliedDb >= 0 ? "+" : ""}${appliedDb.toFixed(1)} dB`) +
            ` · peaks at ${peakAfterDb.toFixed(1)} dBFS`,
        );
        return { channels: out, sampleRate, length };
      },
    [targetLufs, ceilingDb],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="lufs"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { v: -16, label: "-16 (podcasts)" },
              { v: -14, label: "-14 (Spotify/YouTube)" },
              { v: -23, label: "-23 (EBU R128)" },
              { v: -24, label: "-24 (ATSC A/85)" },
            ] as const
          ).map((p) => (
            <button
              key={p.v}
              type="button"
              onClick={() => setTargetLufs(p.v)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                targetLufs === p.v
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Target loudness: {targetLufs} LUFS
          </span>
          <input
            type="range"
            min={-30}
            max={-9}
            step={1}
            value={targetLufs}
            onChange={(e) => setTargetLufs(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            True peak ceiling: {ceilingDb} dBFS
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
        <p className="text-xs text-muted-foreground">
          Loudness is measured with the ITU-R BS.1770-4 gates, the same method
          platforms use — a hot master gets turned down, a quiet mix gets turned up,
          and the gain is one constant factor so dynamics are untouched.
        </p>
      </div>
    </EditToolShell>
  );
}
