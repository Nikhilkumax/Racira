"use client";

/**
 * RMS Normalizer — one static gain so the file's RMS lands on the target
 * (normalizeRms, Node-verified), with a peak ceiling that honestly reports
 * when it had to stop short. Measured jointly across channels so stereo
 * balance is preserved. Distinct from peak normalization (targets the loudest
 * sample) and from the LUFS tool (perceptual K-weighting + gating).
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { normalizeRms, peakOf, toDb } from "@/domains/audio/lib/dynamics";

export default function RmsNormalizer() {
  const [targetRmsDb, setTargetRmsDb] = useState(-18);
  const [ceilingDb, setCeilingDb] = useState(-1);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        // Joint measurement: combined RMS, worst-case peak.
        let sumSq = 0;
        let total = 0;
        let jointPeak = 0;
        for (const ch of channels) {
          jointPeak = Math.max(jointPeak, peakOf(ch));
          for (let i = 0; i < ch.length; i++) sumSq += ch[i] * ch[i];
          total += ch.length;
        }
        const jointRms = total ? Math.sqrt(sumSq / total) : 0;
        const beforeDb = toDb(jointRms);
        const gain = jointRms === 0 ? 1 : Math.min(Math.pow(10, targetRmsDb / 20) / jointRms, ceilingDb < 0 ? Math.pow(10, ceilingDb / 20) / Math.max(jointPeak, 1e-10) : Infinity);
        const out = channels.map((ch) => {
          const o = new Float32Array(ch.length);
          for (let i = 0; i < ch.length; i++) o[i] = ch[i] * gain;
          return o;
        });
        const achievedDb = 20 * Math.log10(Math.max(jointRms * gain, 1e-10));
        const clamped = achievedDb < targetRmsDb - 0.05;
        setReport(
          `${beforeDb.toFixed(1)} dBFS RMS → ${achievedDb.toFixed(1)} dBFS` +
            (clamped
              ? ` · limited by the ${ceilingDb} dBFS peak ceiling (wanted ${targetRmsDb} dBFS)`
              : "") +
            ` · gain ${gain >= 1 ? "+" : ""}${(20 * Math.log10(gain)).toFixed(1)} dB`,
        );
        return { channels: out, sampleRate, length };
      },
    [targetRmsDb, ceilingDb],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="rms"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Target RMS: {targetRmsDb} dBFS
          </span>
          <input
            type="range"
            min={-30}
            max={-9}
            step={1}
            value={targetRmsDb}
            onChange={(e) => setTargetRmsDb(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Peak ceiling: {ceilingDb} dBFS
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
          RMS matches average level regardless of frequency content — the classic
          broadcast-style normalize. Very peaky material may hit the ceiling before
          reaching the target; use the LUFS normalizer if you want the exact method
          streaming platforms apply.
        </p>
      </div>
    </EditToolShell>
  );
}
