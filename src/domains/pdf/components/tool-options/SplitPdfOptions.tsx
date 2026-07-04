import { useState, useEffect } from "react";
import { Scissors } from "lucide-react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface SplitPdfOptionsProps {
  pageCount: number | null;
  selectedPages: Set<number>;
  onSelectionChange: (pages: Set<number>) => void;
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

type SplitMode = "all" | "range" | "count" | "interval";

const SplitPdfOptions = ({
  pageCount,
  selectedPages,
  onSelectionChange,
  onChange,
  onProcess,
  onReset,
  processing,
}: SplitPdfOptionsProps) => {
  const [mode, setMode] = useState<SplitMode>("all");
  const [rangeStr, setRangeStr] = useState("1-3");
  const [splitCount, setSplitCount] = useState(5);
  const [mergeRanges, setMergeRanges] = useState(false);

  // Sync options to parent
  useEffect(() => {
    const opts: ToolOptions = {};
    if (mode === "all") {
      opts.splitMode = "all";
    } else if (mode === "range") {
      opts.splitMode = "range";
      if (selectedPages.size > 0) {
        // Convert set to range string
        const sorted = Array.from(selectedPages).sort((a, b) => a - b);
        const ranges: string[] = [];
        let start = sorted[0], end = sorted[0];
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] === end + 1) end = sorted[i];
          else { ranges.push(start === end ? `${start}` : `${start}-${end}`); start = end = sorted[i]; }
        }
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        opts.splitRange = ranges.join(", ");
      } else {
        opts.splitRange = rangeStr;
      }
    } else if (mode === "count" || mode === "interval") {
      // Both use range mode internally
      opts.splitMode = "range";
      if (pageCount) {
        const pages = Array.from({ length: Math.min(splitCount, pageCount) }, (_, i) => i + 1);
        opts.splitRange = pages.join(", ");
      }
    }
    onChange(opts);
  }, [mode, rangeStr, selectedPages, splitCount, pageCount]);

  const modes: { value: SplitMode; label: string; desc: string }[] = [
    { value: "all", label: "Every page", desc: "Each page as a separate PDF" },
    { value: "range", label: "Custom range", desc: "Select specific pages" },
    { value: "count", label: "By page count", desc: "Split into groups" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Split PDF</h2>
          <p className="text-sm text-muted-foreground mt-1">Separate your PDF into individual files.</p>
        </div>

        {pageCount !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Document has <span className="font-semibold text-foreground">{pageCount}</span> pages
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Mode selection */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Split Mode</h3>
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => { setMode(m.value); onSelectionChange(new Set()); }}
              className={`w-full text-left rounded-lg border-2 px-3.5 py-3 transition-all ${
                mode === m.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className={`text-sm font-semibold ${mode === m.value ? "text-primary" : "text-foreground"}`}>{m.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Range input (only for range mode) */}
        {mode === "range" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Page range <span className="text-muted-foreground font-normal">(or click pages in preview)</span>
            </label>
            <input
              type="text"
              value={selectedPages.size > 0 ? `${selectedPages.size} pages selected` : rangeStr}
              onChange={(e) => { setRangeStr(e.target.value); onSelectionChange(new Set()); }}
              disabled={selectedPages.size > 0}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="1-3, 5, 7-9"
            />
            {selectedPages.size > 0 && (
              <button
                onClick={() => onSelectionChange(new Set())}
                className="text-xs text-primary hover:underline font-medium"
              >
                Clear selection
              </button>
            )}
          </div>
        )}

        {/* Count input */}
        {mode === "count" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pages per split</label>
            <input
              type="number"
              min={1}
              max={pageCount || 999}
              value={splitCount}
              onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}
      </div>

      {/* Fixed actions */}
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
              <Scissors className="h-4 w-4" />
              Split PDF
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

export default SplitPdfOptions;
