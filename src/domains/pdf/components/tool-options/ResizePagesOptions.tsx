import { Ruler } from "lucide-react";
import { useState, useEffect } from "react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface ResizePagesOptionsProps {
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const ResizePagesOptions = ({ onChange, onProcess, onReset, processing }: ResizePagesOptionsProps) => {
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "legal" | "a3" | "a5">("a4");

  useEffect(() => {
    onChange({ pageSize });
  }, [pageSize, onChange]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Resize Pages</h2>
          <p className="text-sm text-muted-foreground mt-1">Scale all pages to a standard document size.</p>
        </div>
        
        <div className="h-px bg-border" />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Target Size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as any)}
              disabled={processing}
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
            >
              <option value="a4">A4 (210 × 297 mm)</option>
              <option value="letter">US Letter (8.5 × 11 in)</option>
              <option value="legal">US Legal (8.5 × 14 in)</option>
              <option value="a3">A3 (297 × 420 mm)</option>
              <option value="a5">A5 (148 × 210 mm)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-border space-y-2 shrink-0">
        <button
          onClick={onProcess}
          disabled={processing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Ruler className="h-4 w-4" />
              Resize Pages
            </>
          )}
        </button>
        <button
          onClick={onReset}
          disabled={processing}
          className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResizePagesOptions;
