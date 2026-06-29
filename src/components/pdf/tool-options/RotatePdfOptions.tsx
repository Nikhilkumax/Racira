import { useState } from "react";
import { RotateCw } from "lucide-react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface RotatePdfOptionsProps {
  pageCount: number | null;
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
  onRotateAll?: (angle: number) => void;
}

const RotatePdfOptions = ({ pageCount, onChange, onProcess, onReset, processing, onRotateAll }: RotatePdfOptionsProps) => {
  const [angle, setAngle] = useState(90);
  const [filter, setFilter] = useState<"all" | "portrait" | "landscape">("all");

  const updateOpts = (a: number, f: string) => {
    onChange({ rotateAngle: a, rotateFilter: f as any });
  };

  const rotations = [
    { value: 90, label: "RIGHT", desc: "90° clockwise", icon: "↻" },
    { value: 270, label: "LEFT", desc: "90° counter-clockwise", icon: "↺" },
    { value: 180, label: "FLIP", desc: "180° upside down", icon: "⇅" },
  ];

  const filters = [
    { value: "all", label: "All", icon: "⊞" },
    { value: "portrait", label: "Portrait", icon: "▯" },
    { value: "landscape", label: "Landscape", icon: "▭" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Rotate PDF</h2>
          <p className="text-sm text-muted-foreground mt-1">Rotate pages to any orientation.</p>
        </div>

        {pageCount !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Document has <span className="font-semibold text-foreground">{pageCount}</span> pages
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Page filter */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Pages</h3>
          <div className="grid grid-cols-3 gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => { setFilter(f.value as any); updateOpts(angle, f.value); }}
                className={`flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "border-primary text-primary bg-primary/5"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <span className="text-lg">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Rotation direction */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rotation</h3>
          {rotations.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setAngle(opt.value); updateOpts(opt.value, filter); onRotateAll?.(opt.value); }}
              className={`flex items-center gap-3 w-full rounded-lg border-2 px-4 py-3 transition-colors ${
                angle === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold ${
                angle === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {opt.icon}
              </span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${angle === opt.value ? "text-primary" : "text-foreground"}`}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
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
              <RotateCw className="h-4 w-4" />
              Rotate PDF
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

export default RotatePdfOptions;
