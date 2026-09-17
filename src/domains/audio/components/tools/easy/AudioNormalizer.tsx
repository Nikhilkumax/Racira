"use client";

/**
 * Audio Normalizer — bring a file to a target level (normalizePeak /
 * normalizeRms, Node-verified). Peak mode hits the target exactly and can
 * never clip; RMS mode matches perceived loudness but clamps to a ceiling
 * when a peaky source can't reach it — the honest achieved level is shown.
 * The gain is computed across all channels jointly so stereo balance is
 * preserved exactly.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { normalizePeak, peakOf, toDb } from "@/domains/audio/lib/dynamics";

export default function AudioNormalizer() {
  const [mode, setMode] = useState<"peak" | "rms">("peak");
  const [targetDb, setTargetDb] = useState(-1);
  const [rmsTargetDb, setRmsTargetDb] = useState(-18);
  const [ceilingDb, setCeilingDb] = useState(-1);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const flat = channels.map((ch) => ch.slice());
        let clamped = false;
        let achievedRmsDb = -Infinity;
        let inPeakDb = -Infinity;
        for (const ch of flat) inPeakDb = Math.max(inPeakDb, toDb(peakOf(ch)));
        if (mode === "peak") {
          for (const ch of flat) ch.set(normalizePeak(ch, targetDb));
        } else {
          // Joint two-channel measurement: worst-case peak, combined RMS.
          let jointPeak = 0;
          let sumSq = 0;
          let total = 0;
          for (const ch of flat) {
            jointPeak = Math.max(jointPeak, peakOf(ch));
            for (let i = 0; i < ch.length; i++) sumSq += ch[i] * ch[i];
            total += ch.length;
          }
          const jointRms = total ? Math.sqrt(sumSq / total) : 0;
          const r = normalizeRmsLocal(flat, jointRms, jointPeak, rmsTargetDb, ceilingDb);
          clamped = r.clamped;
          achievedRmsDb = r.achievedRmsDb;
        }
        setReport(
          mode === "peak"
            ? `Peak: ${inPeakDb.toFixed(1)} dBFS → ${targetDb} dBFS`
            : clamped
              ? `RMS target ${rmsTargetDb} dBFS limited by ceiling — achieved ${achievedRmsDb.toFixed(1)} dBFS`
              : `RMS: ${achievedRmsDb.toFixed(1)} dBFS achieved (target ${rmsTargetDb} dBFS)`,
        );
        return { channels: flat, sampleRate, length };
      },
    [mode, targetDb, rmsTargetDb, ceilingDb],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="normalized"
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          {(
            [
              { id: "peak", label: "Peak (never clips)" },
              { id: "rms", label: "RMS (perceived loudness)" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                mode === m.id
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "peak" ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Target peak: {targetDb} dBFS
            </span>
            <input
              type="range"
              min={-12}
              max={0}
              step={0.5}
              value={targetDb}
              onChange={(e) => setTargetDb(Number(e.target.value))}
              className="w-full"
            />
          </label>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Target RMS: {rmsTargetDb} dBFS
              </span>
              <input
                type="range"
                min={-30}
                max={-9}
                step={1}
                value={rmsTargetDb}
                onChange={(e) => setRmsTargetDb(Number(e.target.value))}
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
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {mode === "peak"
            ? "Peak normalization scales the loudest sample to the target — identical to the old “maximize volume” and safe by construction."
            : "RMS normalization matches average loudness, which is what streaming platforms measure; peaky files may hit the ceiling before reaching the target."}
        </p>
      </div>
    </EditToolShell>
  );
}

/** Joint-channel RMS normalize: one gain for all channels, balance preserved. */
function normalizeRmsLocal(
  channels: Float32Array[],
  jointRms: number,
  jointPeak: number,
  targetRmsDb: number,
  ceilingDb: number,
): { clamped: boolean; achievedRmsDb: number } {
  if (jointRms === 0) return { clamped: false, achievedRmsDb: -Infinity };
  const target = Math.pow(10, targetRmsDb / 20);
  const peakSafe =
    ceilingDb < 0 && jointPeak > 0 ? Math.pow(10, ceilingDb / 20) / jointPeak : Infinity;
  const gain = Math.min(target / jointRms, peakSafe);
  for (const ch of channels) {
    for (let i = 0; i < ch.length; i++) ch[i] *= gain;
  }
  return {
    clamped: peakSafe < target / jointRms,
    achievedRmsDb: 20 * Math.log10(jointRms * gain),
  };
}
