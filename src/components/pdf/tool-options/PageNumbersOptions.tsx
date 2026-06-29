import { useState, useEffect } from "react";
import { Hash } from "lucide-react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface PageNumbersOptionsProps {
  pageCount: number | null;
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

type Position = "bottom-center" | "bottom-right" | "bottom-left";

const PageNumbersOptions = ({ pageCount, onChange, onProcess, onReset, processing }: PageNumbersOptionsProps) => {
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNum, setStartNum] = useState(1);

  useEffect(() => {
    onChange({ pageNumberPosition: position, pageNumberStart: startNum });
  }, [position, startNum]);

  const positions: { value: Position; label: string }[] = [
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Page Numbers</h2>
          <p className="text-sm text-muted-foreground mt-1">Add page numbers to your PDF document.</p>
        </div>

        {pageCount !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Document has <span className="font-semibold text-foreground">{pageCount}</span> pages
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Position selector */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</h3>
          <div className="grid grid-cols-3 gap-2">
            {positions.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPosition(p.value)}
                className={`rounded-lg border-2 px-2 py-3 text-xs font-medium text-center transition-colors ${
                  position === p.value
                    ? "border-primary text-primary bg-primary/5"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Start number */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Starting Number</h3>
          <input
            type="number"
            min={1}
            value={startNum}
            onChange={(e) => setStartNum(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Preview */}
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <div className="aspect-[3/4] border border-dashed border-muted-foreground/30 rounded relative bg-background">
            <div className={`absolute bottom-2 text-[10px] text-muted-foreground font-medium ${
              position === "bottom-left" ? "left-2" : position === "bottom-right" ? "right-2" : "left-1/2 -translate-x-1/2"
            }`}>
              {startNum}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Preview</p>
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
              <Hash className="h-4 w-4" />
              Add Page Numbers
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

export default PageNumbersOptions;
