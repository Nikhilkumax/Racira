"use client";

/**
 * Frequency Analyzer — dominant-frequency timeline segmented into stable-pitch
 * runs (computeFrequencyTimeline + segmentFrequencyTimeline, Node-verified),
 * drawn on canvas with a segment table.
 */

import { useEffect, useRef, useState } from "react";
import { AudioWaveform } from "lucide-react";

import AnalyzerToolShell, { type AnalyzerInput } from "@/domains/audio/components/tools/shared/AnalyzerToolShell";
import {
  computeFrequencyTimeline,
  segmentFrequencyTimeline,
  type FrequencySegment,
} from "@/domains/audio/lib/analyze";
import { formatSeconds } from "@/domains/audio/components/tools/shared/EditToolShell";
import { primaryCanvasColor } from "@/domains/audio/components/tools/shared/canvasColor";

interface AnalysisResult {
  segments: FrequencySegment[];
  maxHz: number;
}function PitchCanvas({ segments, maxHz }: { segments: FrequencySegment[]; maxHz: number }) {
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

    const durationEnd = Math.max(...segments.map((s) => s.endSec), 0.001);
    const topHz = maxHz * 1.1;
    const toX = (t: number) => (t / durationEnd) * width;
    const toY = (f: number) => height - (f / topHz) * height;

    for (const s of segments) {
      const x0 = toX(s.startSec);
      const x1 = Math.max(x0 + 2, toX(s.endSec));
      const y = toY(s.meanHz);
      ctx.fillStyle = primaryCanvasColor();
      ctx.fillRect(x0, Math.max(0, y - 3), x1 - x0, 6);
    }
  }, [segments, maxHz]);

  return <canvas ref={canvasRef} className="h-40 w-full" />;
}

export default function FrequencyAnalyzer() {
  const [last, setLast] = useState<{ maxHz: number } | null>(null);

  return (
    <AnalyzerToolShell<AnalysisResult>
      analyze={(input: AnalyzerInput) => {
        const frames = computeFrequencyTimeline(
          input.channels[0],
          input.sampleRate,
          4096,
          2048,
          400,
        );
        const segments = segmentFrequencyTimeline(frames, 60, 0.05);
        const voiced = segments.filter((s) => s.meanHz > 0);
        const maxHz = voiced.length > 0 ? Math.max(...voiced.map((s) => s.meanHz)) : 1000;
        return { segments, maxHz };
      }}
      render={(result, input) => (
        <div className="space-y-3">
          <PitchCanvas segments={result.segments} maxHz={result.maxHz} />
          <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <AudioWaveform className="h-3.5 w-3.5" />
            {result.segments.length} stable-pitch segment{result.segments.length === 1 ? "" : "s"} ·{" "}
            {formatSeconds(input.length / input.sampleRate)} · first channel
          </p>
          {result.segments.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">From</th>
                    <th className="px-3 py-2">To</th>
                    <th className="px-3 py-2">Mean freq</th>
                    <th className="px-3 py-2">Amplitude</th>
                  </tr>
                </thead>
                <tbody>
                  {result.segments.slice(0, 12).map((s, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5">{s.startSec.toFixed(2)} s</td>
                      <td className="px-3 py-1.5">{s.endSec.toFixed(2)} s</td>
                      <td className="px-3 py-1.5 font-medium">{s.meanHz.toFixed(1)} Hz</td>
                      <td className="px-3 py-1.5">{s.meanAmplitude.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    />
  );
}
