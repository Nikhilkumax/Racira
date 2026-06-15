"use client";

import { useState, useEffect } from "react";
import { Droplets } from "lucide-react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface WatermarkOptionsProps {
  pageCount: number | null;
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const WatermarkOptions = ({ pageCount, onChange, onProcess, onReset, processing }: WatermarkOptionsProps) => {
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.15);

  useEffect(() => {
    onChange({ watermarkText: text, watermarkOpacity: opacity });
  }, [text, opacity]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Add Watermark</h2>
          <p className="text-sm text-muted-foreground mt-1">Stamp text watermarks on your PDF pages.</p>
        </div>

        {pageCount !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Document has <span className="font-semibold text-foreground">{pageCount}</span> pages
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Watermark text */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Watermark Text</h3>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="CONFIDENTIAL"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Opacity: {Math.round(opacity * 100)}%
          </h3>
          <input
            type="range"
            min={0.05}
            max={0.5}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5%</span>
            <span>50%</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Live preview */}
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <div className="aspect-[3/4] border border-dashed border-muted-foreground/30 rounded relative bg-background overflow-hidden flex items-center justify-center">
            <span
              className="text-muted-foreground font-bold text-sm -rotate-45 select-none"
              style={{ opacity }}
            >
              {text || "WATERMARK"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Preview</p>
        </div>
      </div>

      <div className="p-5 border-t border-border space-y-2 shrink-0">
        <button
          onClick={onProcess}
          disabled={processing || !text.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Droplets className="h-4 w-4" />
              Add Watermark
            </>
          )}
        </button>
        <button onClick={onReset} disabled={processing} className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Start Over
        </button>
      </div>
    </div>
  );
};

export default WatermarkOptions;
