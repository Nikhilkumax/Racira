import { useState, useEffect } from "react";
import { LayoutGrid } from "lucide-react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface OrganizePagesOptionsProps {
  pageCount: number | null;
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const OrganizePagesOptions = ({ pageCount, onChange, onProcess, onReset, processing }: OrganizePagesOptionsProps) => {
  const [order, setOrder] = useState("");

  useEffect(() => {
    onChange({ organizeOrder: order });
  }, [order]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Organize Pages</h2>
          <p className="text-sm text-muted-foreground mt-1">Reorder, delete or rearrange pages.</p>
        </div>

        {pageCount !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Document has <span className="font-semibold text-foreground">{pageCount}</span> pages
          </div>
        )}

        <div className="h-px bg-border" />

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Page Order</h3>
          <input
            type="text"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={pageCount ? `e.g. ${Array.from({length: Math.min(pageCount, 4)}, (_, i) => pageCount - i).join(", ")}` : "3, 1, 2, 4"}
          />
          <p className="text-xs text-muted-foreground">Enter page numbers in the desired order, separated by commas.</p>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">💡 Tip:</span> Drag pages in the preview to reorder them visually.
          </p>
        </div>
      </div>

      <div className="p-5 border-t border-border space-y-2 shrink-0">
        <button
          onClick={onProcess}
          disabled={processing || !order.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <LayoutGrid className="h-4 w-4" />
              Organize Pages
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

export default OrganizePagesOptions;
