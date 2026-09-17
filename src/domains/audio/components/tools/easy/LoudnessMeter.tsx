"use client";

/**
 * Loudness Meter (LUFS) — integrated/momentary/short-term loudness per
 * ITU-R BS.1770-4 (integratedLoudness, Node-verified against the EBU Mode
 * anchors). Shows where the file sits relative to the common platform targets
 * so "why is my upload quiet(er) than everyone else's" has a number.
 */

import { useMemo } from "react";

import AnalyzerToolShell from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import type { AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { integratedLoudness, type IntegratedLoudness } from "@/domains/audio/lib/lufs";

const TARGETS: { name: string; lufs: number }[] = [
  { name: "Spotify / YouTube / Amazon / Tidal", lufs: -14 },
  { name: "Deezer", lufs: -15 },
  { name: "Apple Music (sound check)", lufs: -16 },
  { name: "Podcast standards", lufs: -16 },
  { name: "EBU R128 broadcast", lufs: -23 },
];

interface MeterResult {
  m: IntegratedLoudness;
}

function fmt(v: number): string {
  return Number.isFinite(v) ? v.toFixed(1) : "−∞";
}

export default function LoudnessMeter() {
  const analyze = useMemo(
    () => (input: AnalyzerInput): MeterResult => ({
      m: integratedLoudness(input.channels, input.sampleRate),
    }),
    [],
  );

  const render = useMemo(
    () =>
      (r: MeterResult) => (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <div className="text-3xl font-semibold tabular-nums">{fmt(r.m.lufs)}</div>
              <div className="text-xs text-muted-foreground">Integrated (LUFS)</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-3xl font-semibold tabular-nums">{fmt(r.m.momentaryMaxLufs)}</div>
              <div className="text-xs text-muted-foreground">Momentary max (400 ms)</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-3xl font-semibold tabular-nums">{fmt(r.m.shortTermMaxLufs)}</div>
              <div className="text-xs text-muted-foreground">Short-term max (3 s)</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Distance to common targets (integrated):
            </div>
            {TARGETS.map((t) => {
              const delta = Number.isFinite(r.m.lufs) ? r.m.lufs - t.lufs : null;
              return (
                <div key={t.name} className="flex items-center gap-3 text-sm">
                  <span className="w-56 shrink-0 text-muted-foreground">{t.name}</span>
                  <span className="font-mono text-xs">{t.lufs} LUFS</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${delta !== null && delta > 0.5 ? "bg-amber-500" : delta !== null && delta < -0.5 ? "bg-sky-500" : "bg-emerald-500"}`}
                      style={{
                        width: delta === null ? "0%" : `${Math.min(100, Math.abs(delta) * 5)}%`,
                      }}
                    />
                  </div>
                  <span className="w-20 text-right font-mono text-xs tabular-nums">
                    {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} LU`}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Positive = louder than the target (the platform will turn it down);
            negative = quieter (it will not be turned up on most platforms).
          </p>
        </div>
      ),
    [],
  );

  return <AnalyzerToolShell analyze={analyze} render={render} />;
}
