"use client";

import { ImagePlus } from "lucide-react";

interface ImageToPdfOptionsProps {
  fileCount: number;
  totalSize: number;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const ImageToPdfOptions = ({ fileCount, totalSize, onProcess, onReset, processing }: ImageToPdfOptionsProps) => {
  const sizeMB = (totalSize / 1024 / 1024).toFixed(1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Image to PDF</h2>
          <p className="text-sm text-muted-foreground mt-1">Convert images to a single PDF document.</p>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</h3>
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Images</span>
              <span className="font-semibold text-foreground">{fileCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total size</span>
              <span className="font-semibold text-foreground">{sizeMB} MB</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">💡 Tip:</span> Drag files in the preview to reorder them. Each image becomes one page.
          </p>
        </div>
      </div>

      <div className="p-5 border-t border-border space-y-2 shrink-0">
        <button
          onClick={onProcess}
          disabled={processing || fileCount === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
        >
          {processing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Converting…
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              Convert to PDF
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

export default ImageToPdfOptions;
