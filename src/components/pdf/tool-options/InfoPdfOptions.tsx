import { Info } from "lucide-react";

interface InfoPdfOptionsProps {
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
  actionLabel?: string;
  description?: string;
}

const InfoPdfOptions = ({ onProcess, onReset, processing, actionLabel = "Analyze PDF", description = "Extract information from this PDF." }: InfoPdfOptionsProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">{actionLabel}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        
        <div className="h-px bg-border" />

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
          <p className="text-sm text-muted-foreground text-center">
            Ready to analyze. This runs entirely in your browser.
          </p>
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
              Analyzing…
            </>
          ) : (
            <>
              <Info className="h-4 w-4" />
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

export default InfoPdfOptions;
