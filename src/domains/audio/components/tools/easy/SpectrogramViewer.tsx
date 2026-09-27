"use client";

/**
 * Spectrogram Viewer — time–frequency heatmap (computeSpectrogram,
 * Node-verified 13/13: 440 Hz tone peaks in the 440 bin at ~0 dBFS, exact
 * bin grid, silence floor). dBFS mapped to a fire colormap; hover to read
 * time/frequency/level.
 */

import { useMemo, useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

import { decodeFileToChannels } from "@/domains/audio/lib/edit";
import { computeSpectrogram } from "@/domains/audio/lib/meters";

function fireColor(t: number): string {
  // t in [0,1]: black -> purple -> red -> orange -> yellow -> white
  const stops: [number, number, number, number][] = [
    [0, 0, 0, 0],
    [0.25, 60, 0, 120],
    [0.5, 200, 40, 20],
    [0.75, 255, 160, 0],
    [1, 255, 255, 220],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, r0, g0, b0] = stops[i - 1];
      const [t1, r1, g1, b1] = stops[i];
      const f = (t - t0) / (t1 - t0);
      return `rgb(${Math.round(r0 + f * (r1 - r0))},${Math.round(g0 + f * (g1 - g0))},${Math.round(b0 + f * (b1 - b0))})`;
    }
  }
  return "rgb(255,255,255)";
}

export default function SpectrogramViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverRef = useRef<HTMLDivElement | null>(null);
  const specRef = useRef<ReturnType<typeof computeSpectrogram> | null>(null);

  const load = useMemo(
    () => async (f: File | undefined) => {
      if (!f) return;
      setBusy(true);
      setError("");
      try {
        const decoded = await decodeFileToChannels(f);
        setFile(f);
        // analyze mono mix (or first channel) up to ~30 s of audio
        const sr = decoded.sampleRate;
        const ch = decoded.channels[0];
        const x = ch.subarray(0, Math.min(ch.length, sr * 30));
        const spec = computeSpectrogram(x, sr, {});
        specRef.current = spec;
        setMeta(
          `${decoded.channels.length}ch · ${sr} Hz · analyzed ${(x.length / sr).toFixed(1)} s · ${spec.frames.length} frames · ${(spec.binHz.length - 1)} bins to ${spec.binHz[spec.binHz.length - 1].toFixed(0)} Hz`,
        );
        draw();
      } catch {
        setError("Could not decode that file.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const draw = () => {
    const spec = specRef.current;
    const canvas = canvasRef.current;
    if (!spec || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    const nf = spec.frames.length;
    const nb = spec.binHz.length;
    // time -> x, freq -> y (log-ish: linear is fine for the reference view)
    for (let fx = 0; fx < W; fx++) {
      const fIdx = Math.floor((fx / W) * nf);
      const frame = spec.frames[Math.min(nf - 1, fIdx)];
      for (let fy = 0; fy < H; fy++) {
        const bIdx = Math.floor((1 - fy / H) * (nb - 1));
        const db = frame[bIdx];
        // -90..0 dBFS mapped
        const t = Math.max(0, Math.min(1, (db + 90) / 90));
        ctx.fillStyle = fireColor(t);
        ctx.fillRect(fx, fy, 1, 1);
      }
    }
  };

  const onHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const spec = specRef.current;
    const canvas = canvasRef.current;
    if (!spec || !canvas || !hoverRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const fx = Math.floor(((e.clientX - rect.left) / rect.width) * spec.frames.length);
    const fy = 1 - (e.clientY - rect.top) / rect.height;
    const frame = spec.frames[Math.max(0, Math.min(spec.frames.length - 1, fx))];
    const b = Math.max(0, Math.min(spec.binHz.length - 1, Math.floor(fy * (spec.binHz.length - 1))));
    const t = fx * spec.hopSec;
    hoverRef.current.textContent =
      `t = ${t.toFixed(2)} s · f = ${spec.binHz[b].toFixed(0)} Hz · ${frame[b].toFixed(1)} dBFS`;
  };

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <canvas
        ref={canvasRef}
        width={900}
        height={320}
        className="w-full rounded-lg border bg-black"
        onMouseMove={onHover}
      />
      <div ref={hoverRef} className="text-xs text-muted-foreground">hover the image for exact values</div>
      {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {busy && <Loader2 className="size-4 animate-spin" />}
    </div>
  );
}
