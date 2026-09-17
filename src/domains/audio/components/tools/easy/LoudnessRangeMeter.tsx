"use client";

/**
 * Loudness Range (LRA) Meter — EBU Tech 3342 loudness range from the gated
 * short-term loudness distribution (shortTermLoudness + loudnessRange,
 * Node-verified). Renders the short-term series over time plus the 10th/95th
 * percentile brackets the LRA is measured between.
 */

import { useMemo, useRef } from "react";

import AnalyzerToolShell from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import type { AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { shortTermLoudness, loudnessRange, type ShortTermPoint } from "@/domains/audio/lib/lufs";
import { primaryCanvasColor } from "@/domains/audio/components/tools/shared/canvasColor";

interface LraResult {
  points: ShortTermPoint[];
  lra: number | null;
  p10: number | null;
  p95: number | null;
}

function percentile(values: number[], q: number): number | null {
  if (values.length < 2) return null;
  const idx = (values.length - 1) * q;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return values[lo] + (values[hi] - values[lo]) * (idx - lo);
}

export default function LoudnessRangeMeter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const analyze = useMemo(
    () => (input: AnalyzerInput): LraResult => {
      const points = shortTermLoudness(input.channels, input.sampleRate);
      const finite = points.filter((p) => Number.isFinite(p.lufs)).map((p) => p.lufs).sort((a, b) => a - b);
      return {
        points,
        lra: loudnessRange(points),
        p10: percentile(finite, 0.1),
        p95: percentile(finite, 0.95),
      };
    },
    [],
  );

  const render = useMemo(
    () =>
      (r: LraResult) => {
        // Draw after commit.
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (!canvas || r.points.length === 0) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const W = (canvas.width = canvas.clientWidth * 2);
          const H = (canvas.height = 320);
          const finite = r.points.filter((p) => Number.isFinite(p.lufs));
          if (finite.length === 0) return;
          const lo = Math.min(...finite.map((p) => p.lufs)) - 2;
          const hi = Math.max(...finite.map((p) => p.lufs)) + 2;
          const t0 = r.points[0].timeSec;
          const t1 = r.points[r.points.length - 1].timeSec || 1;
          ctx.clearRect(0, 0, W, H);
          // LRA bracket band
          if (r.p10 !== null && r.p95 !== null) {
            const yA = H - ((r.p95 - lo) / (hi - lo)) * H;
            const yB = H - ((r.p10 - lo) / (hi - lo)) * H;
            ctx.fillStyle = "rgba(56,189,248,0.12)";
            ctx.fillRect(0, yA, W, yB - yA);
          }
          const stroke = primaryCanvasColor();
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 3;
          ctx.beginPath();
          let pen = false;
          for (const p of r.points) {
            const x = ((p.timeSec - t0) / Math.max(t1 - t0, 1e-6)) * W;
            if (!Number.isFinite(p.lufs)) {
              pen = false;
              continue;
            }
            const y = H - ((p.lufs - lo) / (hi - lo)) * H;
            if (!pen) {
              ctx.moveTo(x, y);
              pen = true;
            } else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.fillStyle = "#94a3b8";
          ctx.font = "20px ui-monospace, monospace";
          ctx.fillText(`${hi.toFixed(0)} LUFS`, 8, 24);
          ctx.fillText(`${lo.toFixed(0)} LUFS`, 8, H - 8);
        }, 0);
        return (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border p-4">
                <div className="text-3xl font-semibold tabular-nums">
                  {r.lra === null ? "—" : r.lra.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Loudness Range (LU)</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-2xl font-semibold tabular-nums">
                  {r.p10 === null ? "—" : r.p10.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">10th percentile (LUFS)</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-2xl font-semibold tabular-nums">
                  {r.p95 === null ? "—" : r.p95.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">95th percentile (LUFS)</div>
              </div>
            </div>
            <canvas ref={canvasRef} className="w-full rounded-xl border border-border" />
            <p className="text-xs text-muted-foreground">
              LRA describes how much the long-term loudness moves — dialogue ≈ 3–8 LU,
              produced music ≈ 4–10 LU, classical 15+ LU. The shaded band is the
              10th→95th percentile span the measurement is taken between.
            </p>
          </div>
        );
      },
    [],
  );

  return <AnalyzerToolShell analyze={analyze} render={render} />;
}
