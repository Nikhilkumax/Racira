"use client";

/**
 * Waveform Visualizer — min/max peak envelope of the decoded file, drawn on
 * canvas from computeWaveformPeaks() (Node-verified bucket math).
 */

import { useEffect, useRef } from "react";
import { Activity } from "lucide-react";

import AnalyzerToolShell, { type AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import { computeWaveformPeaks, type WaveformPeaks } from "@/domains/audio/lib/analyze";
import { formatSeconds } from "@/domains/audio/components/tools/shared/EditToolShell";
import { primaryCanvasColor } from "@/domains/audio/components/tools/shared/canvasColor";

function WaveformCanvas({ peaks, input }: { peaks: WaveformPeaks; input: AnalyzerInput }) {
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
    // Center line.
    ctx.strokeStyle = "rgba(128,128,128,0.35)";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const barW = width / peaks.buckets;
    const colors = [primaryCanvasColor(), primaryCanvasColor(0.55)];
    peaks.channels.forEach((ch, c) => {
      ctx.fillStyle = colors[c % colors.length];
      for (let b = 0; b < peaks.buckets; b++) {
        const x = b * barW;
        const top = (1 - Math.min(1, Math.max(-1, ch.max[b]))) * (height / 2);
        const bottom = (1 - Math.min(1, Math.max(-1, ch.min[b]))) * (height / 2);
        ctx.fillRect(x, top, Math.max(1, barW * 0.85), Math.max(1, bottom - top));
      }
    });
  }, [peaks]);

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} className="h-40 w-full" />
      <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3.5 w-3.5" />
        {peaks.buckets} buckets · {input.channels.length === 1 ? "mono" : `${input.channels.length} channels`} ·{" "}
        {formatSeconds(input.length / input.sampleRate)}
      </p>
    </div>
  );
}

export default function WaveformVisualizer() {
  return (
    <AnalyzerToolShell<WaveformPeaks>
      analyze={(input: AnalyzerInput) => computeWaveformPeaks(input.channels, 800)}
      render={(peaks, input) => <WaveformCanvas peaks={peaks} input={input} />}
    />
  );
}
