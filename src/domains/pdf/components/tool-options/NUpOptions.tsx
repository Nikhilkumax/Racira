import { Columns } from "lucide-react";
import { useState, useEffect } from "react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface NUpOptionsProps {
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const NUpOptions = ({ onChange, onProcess, onReset, processing }: NUpOptionsProps) => {
  const [nup, setNup] = useState(2);

  useEffect(() => {
    onChange({ nup });
  }, [nup, onChange]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">N-up Pages</h2>
          <p className="text-sm text-muted-foreground mt-1">Place multiple PDF pages onto a single sheet.</p>
        </div>
        
        <div className="h-px bg-border" />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pages per sheet</label>
            <select
              value={nup}
              onChange={(e) => setNup(Number(e.target.value))}
              disabled={processing}
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
            >
              <option value={2}>2-up (2 pages per sheet)</option>
              <option value={4}>4-up (4 pages per sheet)</option>
              <option value={6}>6-up (6 pages per sheet)</option>
              <option value={9}>9-up (9 pages per sheet)</option>
              <option value={16}>16-up (16 pages per sheet)</option>
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
              <Columns className="h-4 w-4" />
              Apply N-up
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

export default NUpOptions;
