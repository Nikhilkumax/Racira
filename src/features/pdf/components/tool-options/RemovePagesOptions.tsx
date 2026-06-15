"use client";

import { Trash2 } from "lucide-react";

interface RemovePagesOptionsProps {
  pageCount: number | null;
  selectedPages: Set<number>;
  onSelectionChange: (pages: Set<number>) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const RemovePagesOptions = ({ pageCount, selectedPages, onSelectionChange, onProcess, onReset, processing }: RemovePagesOptionsProps) => {
  const remaining = (pageCount || 0) - selectedPages.size;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Remove Pages</h2>
          <p className="text-sm text-muted-foreground mt-1">Click pages in the preview to mark them for removal.</p>
        </div>

        {pageCount !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Document has <span className="font-semibold text-foreground">{pageCount}</span> pages
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Selection summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Selection</h3>
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pages to remove</span>
              <span className="font-semibold text-destructive">{selectedPages.size}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pages remaining</span>
              <span className="font-semibold text-foreground">{Math.max(0, remaining)}</span>
            </div>
          </div>
          {selectedPages.size > 0 && (
            <button
              onClick={() => onSelectionChange(new Set())}
              className="text-xs text-primary hover:underline font-medium"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Tips */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">💡 Tip:</span> Hold Shift and click to select multiple consecutive pages.
          </p>
        </div>
      </div>

      <div className="p-5 border-t border-border space-y-2 shrink-0">
        <button
          onClick={onProcess}
          disabled={processing || selectedPages.size === 0 || remaining < 1}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive px-6 py-3.5 text-sm font-bold text-destructive-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Remove {selectedPages.size} page{selectedPages.size !== 1 ? "s" : ""}
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

export default RemovePagesOptions;
