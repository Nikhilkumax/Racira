"use client";

/**
 * Spectrum Analyzer — time-averaged magnitude spectrum, drawn on canvas from
 * computeAverageSpectrum() (Node-verified FFT + Hann amplitude correction),
 * with peak frequency and spectral centroid readouts.
 */

import { useEffect, useRef } from "react";
import { BarChart3 } from "lucide-react";

import AnalyzerToolShell, { type AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { computeAverageSpectrum, type AverageSpectrum } from "@/domains/audio/lib/analyze";
import { formatSeconds } from "@/domains/audio/components/tools/shared/EditToolShell";
import { primaryCanvasColor } from "@/domains/audio/components/tools/shared/canvasColor";

function SpectrumCanvas({ spectrum }: { spectrum: AverageSpectrum }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const curve = spectrum.curvesDb[0];
    const bins = curve.length;
    const dbTop = 0;
    const dbBottom = -100;
    const toY = (db: number) => ((dbTop - Math.max(dbBottom, db)) / (dbTop - dbBottom)) * height;

    // Frequency gridlines every 2 kHz up to Nyquist.
    const nyquist = (spectrum.binHz * bins) / 2;
    ctx.strokeStyle = "rgba(128,128,128,0.25)";
    ctx.fillStyle = "rgba(128,128,128,0.8)";
    ctx.font = "10px sans-serif";
    for (let f = 2000; f < nyquist; f += 2000) {
      const x = (f / nyquist) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.fillText(`${f / 1000}k`, x + 2, 10);
    }

    ctx.strokeStyle = primaryCanvasColor();
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let k = 0; k < bins; k++) {
      const x = (k / (bins - 1)) * width;
      const y = toY(curve[k]);
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [spectrum]);

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} className="h-48 w-full" />
      <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <BarChart3 className="h-3.5 w-3.5" />
        {spectrum.frames} averaged frames · {spectrum.binHz.toFixed(1)} Hz/bin · 0 dB at top, −100 dB
        at bottom
      </p>
    </div>
  );
}

export default function SpectrumAnalyzer() {
  return (
    <AnalyzerToolShell<AverageSpectrum>
      analyze={(input: AnalyzerInput) => computeAverageSpectrum(input.channels, input.sampleRate, 8192)}
      render={(spectrum, input) => (
        <div className="space-y-3">
          <SpectrumCanvas spectrum={spectrum} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Peak frequency</p>
              <p className="text-lg font-semibold text-foreground">{spectrum.peakHz.toFixed(1)} Hz</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Spectral centroid</p>
              <p className="text-lg font-semibold text-foreground">{spectrum.centroidHz.toFixed(0)} Hz</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-lg font-semibold text-foreground">
                {formatSeconds(input.length / input.sampleRate)}
              </p>
            </div>
          </div>
        </div>
      )}
    />
  );
}
