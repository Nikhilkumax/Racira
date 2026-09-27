"use client";

/**
 * Goniometer / Vectorscope — rotated Lissajous of the stereo field
 * (goniometerPoints, Node-verified 13/13: mono = vertical line, inverted =
 * horizontal, count respects maxPoints). The canvas draws up to 4000 points
 * with additive alpha; the classic 45° reference cross is included.
 */

import { useMemo, useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

import { decodeFileToChannels } from "@/domains/audio/lib/edit";
import { goniometerPoints } from "@/domains/audio/lib/meters";

export default function GoniometerVectorscope() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const load = useMemo(
    () => async (f: File | undefined) => {
      if (!f) return;
      setBusy(true);
      setError("");
      try {
        const decoded = await decodeFileToChannels(f);
        setFile(f);
        if (decoded.channels.length < 2) {
          setError("The vectorscope needs a stereo file (this one is mono).");
          return;
        }
        const { x, y } = goniometerPoints(decoded.channels[0], decoded.channels[1], 4000);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 12;
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, W, H);
        // reference cross + circle
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
        ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 2 * Math.PI);
        ctx.stroke();
        // points (mono -> vertical by convention: y axis = (L+R)/√2)
        ctx.fillStyle = "rgba(80, 220, 120, 0.25)";
        for (let i = 0; i < x.length; i++) {
          const px = cx + x[i] * R;
          const py = cy - y[i] * R;
          ctx.fillRect(px, py, 1.5, 1.5);
        }
      } catch {
        setError("Could not decode that file.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose a stereo audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <canvas ref={canvasRef} width={480} height={480} className="mx-auto block rounded-lg border bg-black" />
      {busy && <Loader2 className="size-4 animate-spin" />}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        A vertical line means the two channels are identical (mono). A
        horizontal line means they are mirror images (polarity flipped). Real
        stereo spreads as a fountain around the vertical; the width of the
        fountain is the width of your stereo image.
      </p>
    </div>
  );
}
