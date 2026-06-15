"use client";

import { Image } from "lucide-react";

interface PdfToJpgOptionsProps {
  pageCount: number | null;
  fileCount: number;
  totalSize: number;
  onProcess: () => void;
  onReset: () => void;
  processing: boolean;
}

const PdfToJpgOptions = ({ pageCount, fileCount, totalSize, onProcess, onReset, processing }: PdfToJpgOptionsProps) => {
  const sizeMB = (totalSize / 1024 / 1024).toFixed(1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 space-y-5 overflow-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">PDF to JPG</h2>
          <p className="text-sm text-muted-foreground mt-1">Convert every page to a high-quality JPG image.</p>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">File Info</h3>
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Input size</span>
              <span className="font-semibold text-foreground">{sizeMB} MB</span>
            </div>
            {pageCount !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pages</span>
                <span className="font-semibold text-foreground">{pageCount}</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output</h3>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              {pageCount ? `${pageCount} JPG images` : "JPG images"} packaged in a ZIP file
            </p>
          </div>
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
              <Image className="h-4 w-4" />
              Convert to JPG
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

export default PdfToJpgOptions;
