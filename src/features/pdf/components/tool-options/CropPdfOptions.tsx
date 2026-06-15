"use client";

import { useState, useEffect } from "react";
import { Crop } from "lucide-react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface CropPdfOptionsProps {
  pageCount: number | null;
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const CropPdfOptions = ({ pageCount, onChange, onProcess, onReset, processing }: CropPdfOptionsProps) => {
  const [top, setTop] = useState(50);
  const [right, setRight] = useState(50);
  const [bottom, setBottom] = useState(50);
  const [left, setLeft] = useState(50);

  useEffect(() => {
    onChange({ cropMargins: { top, right, bottom, left } });
  }, [top, right, bottom, left]);

  const fields = [
    { label: "Top (pt)", value: top, set: setTop },
    { label: "Right (pt)", value: right, set: setRight },
    { label: "Bottom (pt)", value: bottom, set: setBottom },
    { label: "Left (pt)", value: left, set: setLeft },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Crop PDF</h2>
          <p className="text-sm text-muted-foreground mt-1">Trim PDF pages to exact dimensions.</p>
        </div>

        {pageCount !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Document has <span className="font-semibold text-foreground">{pageCount}</span> pages
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Crop margins */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Crop Margins</h3>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ label, value, set }) => (
              <div key={label}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                <input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(e) => set(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Visual preview */}
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <div className="aspect-[3/4] border border-dashed border-muted-foreground/30 rounded relative bg-background">
            <div
              className="absolute bg-primary/10 border border-primary/30 rounded-sm"
              style={{
                top: `${Math.min(top / 4, 40)}%`,
                right: `${Math.min(right / 4, 40)}%`,
                bottom: `${Math.min(bottom / 4, 40)}%`,
                left: `${Math.min(left / 4, 40)}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Crop area preview</p>
        </div>

        <button
          type="button"
          onClick={() => { setTop(0); setRight(0); setBottom(0); setLeft(0); }}
          className="text-xs text-primary hover:underline font-medium"
        >
          Reset margins
        </button>
      </div>

      <div className="p-5 border-t border-border space-y-2 shrink-0">
        <button
          onClick={onProcess}
          disabled={processing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Crop className="h-4 w-4" />
              Crop PDF
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

export default CropPdfOptions;
