"use client";
import { useState } from "react";
import { ToolShell } from "../ui";

export function HistogramTool() {
  const [data, setData] = useState<{ r: number[]; g: number[]; b: number[]; l: number[] } | null>(null);

  const onFile = (f: File) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const c = document.createElement("canvas");
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        const r = new Array(256).fill(0);
        const g = new Array(256).fill(0);
        const b = new Array(256).fill(0);
        const l = new Array(256).fill(0);
        for (let i = 0; i < d.length; i += 4) {
          r[d[i]]++; g[d[i+1]]++; b[d[i+2]]++;
          l[Math.round(0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2])]++;
        }
        setData({ r, g, b, l });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  const Bars = ({ vals, color }: { vals: number[]; color: string }) => {
    const max = Math.max(...vals);
    return (
      <svg viewBox="0 0 256 100" className="h-32 w-full" preserveAspectRatio="none">
        {vals.map((v, i) => (
          <rect key={i} x={i} y={100 - (v / max) * 100} width={1} height={(v / max) * 100} fill={color} />
        ))}
      </svg>
    );
  };

  return (
    <ToolShell>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="block w-full cursor-pointer rounded-lg border border-dashed bg-background p-6 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
      />
      {data && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Luminance</p>
            <Bars vals={data.l} color="#1f2937" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-3"><p className="mb-1 text-[10px] font-semibold uppercase text-red-500">Red</p><Bars vals={data.r} color="#ef4444" /></div>
            <div className="rounded-lg border bg-card p-3"><p className="mb-1 text-[10px] font-semibold uppercase text-green-600">Green</p><Bars vals={data.g} color="#22c55e" /></div>
            <div className="rounded-lg border bg-card p-3"><p className="mb-1 text-[10px] font-semibold uppercase text-blue-500">Blue</p><Bars vals={data.b} color="#3b82f6" /></div>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
