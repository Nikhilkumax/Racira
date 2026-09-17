"use client";

/**
 * Loudness Histogram — the short-term loudness distribution behind the LRA
 * (shortTermLoudness, Node-verified), drawn as a 1-LU-bin histogram with the
 * −70 LUFS absolute gate and −20 LU relative gate marked. Shows at a glance
 * whether a file "lives" at one loudness (podcast) or sweeps (dynamic music).
 */

import { useMemo, useRef } from "react";

import AnalyzerToolShell from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import type { AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { shortTermLoudness, loudnessRange, type ShortTermPoint } from "@/domains/audio/lib/lufs";
import { primaryCanvasColor } from "@/domains/audio/components/tools/shared/canvasColor";

interface HistResult {
  bins: { center: number; count: number }[];
  lra: number | null;
  gatedOut: number;
  total: number;
}

export default function LoudnessHistogram() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const analyze = useMemo(
    () => (input: AnalyzerInput): HistResult => {
      const points: ShortTermPoint[] = shortTermLoudness(input.channels, input.sampleRate);
      const finite = points.filter((p) => Number.isFinite(p.lufs));
      if (finite.length === 0) return { bins: [], lra: null, gatedOut: points.length, total: points.length };
      // Relative gate at -20 LU below the power mean, as in loudnessRange.
      const meanPower = finite.reduce((a, p) => a + Math.pow(10, p.lufs / 10), 0) / finite.length;
      const relGate = 10 * Math.log10(meanPower) - 20;
      const kept = finite.filter((p) => p.lufs > relGate);
      const counts = new Map<number, number>();
      for (const p of kept) {
        const b = Math.round(p.lufs);
        counts.set(b, (counts.get(b) ?? 0) + 1);
      }
      const bins = [...counts.entries()]
        .map(([center, count]) => ({ center, count }))
        .sort((a, b) => a.center - b.center);
      return {
        bins,
        lra: loudnessRange(points),
        gatedOut: points.length - kept.length,
        total: points.length,
      };
    },
    [],
  );

  const render = useMemo(
    () =>
      (r: HistResult) => {
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (!canvas || r.bins.length === 0) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const W = (canvas.width = canvas.clientWidth * 2);
          const H = (canvas.height = 320);
          const pad = 40;
          ctx.clearRect(0, 0, W, H);
          const lo = r.bins[0].center - 1;
          const hi = r.bins[r.bins.length - 1].center + 1;
          const maxCount = Math.max(...r.bins.map((b) => b.count));
          const bw = (W - 2 * pad) / (hi - lo);
          const color = primaryCanvasColor();
          for (const b of r.bins) {
            const h = (b.count / maxCount) * (H - 2 * pad);
            ctx.fillStyle = color;
            ctx.fillRect(pad + (b.center - lo) * bw, H - pad - h, Math.max(2, bw - 2), h);
          }
          ctx.fillStyle = "#94a3b8";
          ctx.font = "18px ui-monospace, monospace";
          for (const t of [lo, Math.round((lo + hi) / 2), hi]) {
            ctx.fillText(`${t}`, pad + (t - lo) * bw - 10, H - 12);
          }
        }, 0);
        return (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <div className="text-3xl font-semibold tabular-nums">
                  {r.lra === null ? "—" : r.lra.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Loudness Range (LU)</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-3xl font-semibold tabular-nums">
                  {r.total === 0 ? "—" : `${Math.round((r.gatedOut / r.total) * 100)}%`}
                </div>
                <div className="text-xs text-muted-foreground">Windows excluded by the gates</div>
              </div>
            </div>
            <canvas ref={canvasRef} className="w-full rounded-xl border border-border" />
            <p className="text-xs text-muted-foreground">
              Each bar is one 1-LU bin of short-term loudness (3 s windows, 10 Hz).
              A tall single spike = compressed/consistent material; a wide spread =
              dynamic material.
            </p>
          </div>
        );
      },
    [],
  );

  return <AnalyzerToolShell analyze={analyze} render={render} />;
}
