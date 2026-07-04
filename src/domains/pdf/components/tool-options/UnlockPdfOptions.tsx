import { Unlock } from "lucide-react";
import { useState, useEffect } from "react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface UnlockPdfOptionsProps {
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
  actionLabel?: string;
}

const UnlockPdfOptions = ({ onChange, onProcess, onReset, processing, actionLabel = "Unlock PDF" }: UnlockPdfOptionsProps) => {
  const [password, setPassword] = useState("");

  useEffect(() => {
    onChange({ password });
  }, [password, onChange]);

  const isValid = password.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">{actionLabel}</h2>
          <p className="text-sm text-muted-foreground mt-1">Enter the current password to unlock and remove protection.</p>
        </div>
        
        <div className="h-px bg-border" />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
              placeholder="Enter password"
              disabled={processing}
            />
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-border space-y-2 shrink-0">
        <button
          onClick={onProcess}
          disabled={processing || !isValid}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              {actionLabel}
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

export default UnlockPdfOptions;
