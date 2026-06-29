import type { Tool } from "@/data/pdf/tools";

interface DefaultToolOptionsProps {
  tool: Tool;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

/** Fallback options panel for tools that don't have a custom panel yet */
const DefaultToolOptions = ({ tool, onProcess, onReset, processing }: DefaultToolOptionsProps) => {
  const Icon = tool.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">{tool.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
        </div>

        <div className="h-px bg-border" />

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Upload your files and click the button below to process.
          </p>
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
              <Icon className="h-4 w-4" />
              Process {tool.name}
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

export default DefaultToolOptions;
