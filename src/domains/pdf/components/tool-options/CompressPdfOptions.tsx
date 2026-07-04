import { useState } from "react";
import { Minimize2 } from "lucide-react";

interface CompressPdfOptionsProps {
  fileCount: number;
  totalSize: number;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

type CompressionLevel = "extreme" | "recommended" | "high";

const CompressPdfOptions = ({ fileCount, totalSize, onProcess, onReset, processing }: CompressPdfOptionsProps) => {
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const sizeMB = (totalSize / 1024 / 1024).toFixed(1);

  const levels: { value: CompressionLevel; label: string; desc: string; estimate: string }[] = [
    { value: "extreme", label: "Extreme compression", desc: "Smallest size, lower quality", estimate: "~60% reduction" },
    { value: "recommended", label: "Recommended", desc: "Best balance of size and quality", estimate: "~40% reduction" },
    { value: "high", label: "High quality", desc: "Less compression, better quality", estimate: "~20% reduction" },
  ];

  const estimatedReduction = level === "extreme" ? 0.6 : level === "recommended" ? 0.4 : 0.2;
  const estimatedSize = (totalSize * (1 - estimatedReduction) / 1024 / 1024).toFixed(1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Compress PDF</h2>
          <p className="text-sm text-muted-foreground mt-1">Reduce file size without losing quality.</p>
        </div>

        <div className="h-px bg-border" />

        {/* Size info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">File Info</h3>
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original size</span>
              <span className="font-semibold text-foreground">{sizeMB} MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated output</span>
              <span className="font-semibold text-primary">{estimatedSize} MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated reduction</span>
              <span className="font-semibold text-primary">~{Math.round(estimatedReduction * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Compression levels */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compression Level</h3>
          {levels.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLevel(l.value)}
              className={`w-full text-left rounded-lg border-2 px-3.5 py-3 transition-all ${
                level === l.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className={`text-sm font-semibold ${level === l.value ? "text-primary" : "text-foreground"}`}>{l.label}</p>
                <span className="text-xs text-muted-foreground">{l.estimate}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
            </button>
          ))}
        </div>
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
              Compressing…
            </>
          ) : (
            <>
              <Minimize2 className="h-4 w-4" />
              Compress PDF
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

export default CompressPdfOptions;
