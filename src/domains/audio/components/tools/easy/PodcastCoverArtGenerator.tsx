"use client";

/**
 * Podcast Cover Art Generator — renders a square cover (title, subtitle,
 * accent color) on a canvas at 1400/3000 px and downloads it as PNG.
 * Pure canvas drawing — no server, no assets.
 */

import { useEffect, useRef, useState } from "react";

const SIZES = [
  { label: "1400 × 1400 (Apple minimum)", px: 1400 },
  { label: "3000 × 3000 (high-res master)", px: 3000 },
] as const;

export default function PodcastCoverArtGenerator() {
  const [title, setTitle] = useState("The Racira Show");
  const [subtitle, setSubtitle] = useState("Conversations about sound");
  const [bg, setBg] = useState("#1e1b4b");
  const [accent, setAccent] = useState("#f59e0b");
  const [sizePx, setSizePx] = useState<number>(1400);
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  const draw = (canvas: HTMLCanvasElement, px: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = px;
    canvas.height = px;
    const s = px / 1000; // design in a 1000-unit space
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, px, px);
    // accent circle, cropped at the top-right
    ctx.beginPath();
    ctx.arc(820 * s, 180 * s, 420 * s, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    // darker overlay circle for depth
    ctx.beginPath();
    ctx.arc(180 * s, 860 * s, 300 * s, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();
    // title — wraps to at most 3 lines
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "top";
    const titleSize = 120 * s;
    ctx.font = `700 ${titleSize}px system-ui, sans-serif`;
    const words = title.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    const maxW = 800 * s;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const shown = lines.slice(0, 3);
    let y = 300 * s;
    for (const l of shown) {
      ctx.fillText(l, 100 * s, y);
      y += titleSize * 1.15;
    }
    // subtitle
    ctx.font = `400 ${52 * s}px system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillText(subtitle, 100 * s, y + 40 * s);
  };

  useEffect(() => {
    if (previewRef.current) draw(previewRef.current, 640);
  }, [title, subtitle, bg, accent]);

  const download = () => {
    const canvas = document.createElement("canvas");
    draw(canvas, sizePx);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "podcast-cover.png";
      a.click();
    }, "image/png");
  };

  const inputCls =
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Show title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Subtitle</label>
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Background</label>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-full rounded-md border" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Accent</label>
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-10 w-full rounded-md border" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-md border p-4">
        <canvas ref={previewRef} className="max-w-xs rounded-md shadow" />
        <div className="flex items-center gap-3">
          <select
            value={sizePx}
            onChange={(e) => setSizePx(Number(e.target.value))}
            className={inputCls + " w-auto"}
          >
            {SIZES.map((s) => (
              <option key={s.px} value={s.px}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={download}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
