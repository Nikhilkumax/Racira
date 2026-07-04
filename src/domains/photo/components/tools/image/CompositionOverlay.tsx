"use client";
import { useState, useRef, useEffect } from "react";
import { ToolShell } from "../ui";

type Variant = "thirds" | "golden" | "phi" | "diagonal";

export function CompositionOverlay({ variant }: { variant: Variant }) {
  const [url, setUrl] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const onFile = (f: File) => setUrl(URL.createObjectURL(f));
  const phi = 1 / 1.618;

  return (
    <ToolShell note="Upload a photo to inspect composition. Grid lines are overlaid in your browser only.">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="block w-full cursor-pointer rounded-lg border border-dashed bg-background p-6 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
      />
      {url && (
        <div ref={ref} className="relative mt-6 overflow-hidden rounded-lg border bg-black">
          <img src={url} alt="" className="block w-full" />
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            {(variant === "thirds" || variant === "phi" || variant === "golden") && (
              <>
                {[variant === "thirds" ? 1/3 : phi, variant === "thirds" ? 2/3 : 1 - phi].map((p, i) => (
                  <g key={i}>
                    <line x1={p * 100} y1={0} x2={p * 100} y2={100} stroke="#F59E0B" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
                    <line x1={0} y1={p * 100} x2={100} y2={p * 100} stroke="#F59E0B" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
                  </g>
                ))}
              </>
            )}
            {variant === "diagonal" && (
              <>
                <line x1={0} y1={0} x2={100} y2={100} stroke="#F59E0B" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
                <line x1={100} y1={0} x2={0} y2={100} stroke="#F59E0B" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
                <line x1={0} y1={0} x2={100} y2={50} stroke="#F59E0B" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
                <line x1={0} y1={100} x2={100} y2={50} stroke="#F59E0B" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
              </>
            )}
            {variant === "golden" && (
              <path
                d="M 0 100 Q 0 38.2, 38.2 38.2 Q 61.8 38.2, 61.8 61.8 Q 61.8 76.4, 76.4 76.4 Q 85.4 76.4, 85.4 70.8"
                fill="none" stroke="#F59E0B" strokeWidth="0.4" vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        </div>
      )}
    </ToolShell>
  );
}
