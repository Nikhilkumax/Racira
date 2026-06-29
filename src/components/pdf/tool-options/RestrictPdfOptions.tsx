import { ShieldX } from "lucide-react";
import { useState, useEffect } from "react";
import type { ToolOptions } from "@/lib/pdf-tools";

interface RestrictPdfOptionsProps {
  onChange: (opts: ToolOptions) => void;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const RestrictPdfOptions = ({ onChange, onProcess, onReset, processing }: RestrictPdfOptionsProps) => {
  const [password, setPassword] = useState("");
  const [allowPrinting, setAllowPrinting] = useState(false);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  useEffect(() => {
    if (password.length > 0) {
      onChange({ 
        ownerPassword: password,
        permissions: {
          printing: allowPrinting ? "highResolution" : undefined,
          modifying: allowModifying,
          copying: allowCopying,
          annotating: allowModifying,
          fillingForms: allowModifying,
          contentAccessibility: allowCopying,
          documentAssembly: allowModifying,
        }
      });
    } else {
      onChange({});
    }
  }, [password, allowPrinting, allowCopying, allowModifying, onChange]);

  const isValid = password.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Restrict Permissions</h2>
          <p className="text-sm text-muted-foreground mt-1">Set an owner password and restrict what users can do with this PDF.</p>
        </div>
        
        <div className="h-px bg-border" />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Owner Password (Required)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
              placeholder="Enter owner password"
              disabled={processing}
            />
            <p className="text-xs text-muted-foreground">This password will be required to change these permissions later.</p>
          </div>

          <div className="h-px bg-border my-4" />

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Allowed Actions</h3>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allowPrinting}
                onChange={(e) => setAllowPrinting(e.target.checked)}
                disabled={processing}
                className="rounded border-input text-primary focus:ring-primary/50"
              />
              <span className="text-sm text-foreground">Allow Printing</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allowCopying}
                onChange={(e) => setAllowCopying(e.target.checked)}
                disabled={processing}
                className="rounded border-input text-primary focus:ring-primary/50"
              />
              <span className="text-sm text-foreground">Allow Copying Text/Images</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allowModifying}
                onChange={(e) => setAllowModifying(e.target.checked)}
                disabled={processing}
                className="rounded border-input text-primary focus:ring-primary/50"
              />
              <span className="text-sm text-foreground">Allow Modifying Document</span>
            </label>
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
              <ShieldX className="h-4 w-4" />
              Apply Restrictions
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

export default RestrictPdfOptions;
