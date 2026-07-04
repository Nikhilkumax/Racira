import { useState, useEffect } from "react";
import { Type } from "lucide-react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface HeadersFootersOptionsProps {
  pageCount: number | null;
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const HeadersFootersOptions = ({ pageCount, onChange, onProcess, onReset, processing }: HeadersFootersOptionsProps) => {
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");

  useEffect(() => {
    // In a real implementation, you'd pass this to the editor or processor.
    onChange({ headerText, footerText });
  }, [headerText, footerText, onChange]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Headers & Footers</h2>
          <p className="text-sm text-muted-foreground mt-1">Add custom text to the top and bottom of your PDF pages.</p>
        </div>

        {pageCount !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Document has <span className="font-semibold text-foreground">{pageCount}</span> pages
          </div>
        )}

        <div className="h-px bg-border" />

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Header Text</h3>
            <input
              type="text"
              placeholder="e.g. Confidential Document"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Footer Text</h3>
            <input
              type="text"
              placeholder="e.g. Page 1 of 10"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-border space-y-2 shrink-0">
        <button
          onClick={onProcess}
          disabled={processing || (!headerText && !footerText)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Type className="h-4 w-4" />
              Apply to PDF
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

export default HeadersFootersOptions;
