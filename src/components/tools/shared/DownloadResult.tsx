"use client";

import { Download, RotateCcw, CheckCircle2 } from "lucide-react";

interface DownloadResultProps {
  filename: string;
  fileSize: number;
  toolName: string;
  onDownload: () => void;
  onReset: () => void;
}

const DownloadResult = ({ filename, fileSize, toolName, onDownload, onReset }: DownloadResultProps) => {
  return (
    <div className="animate-fade-in">
      {/* Success card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4" style={{ boxShadow: "var(--card-shadow)" }}>
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10 mx-auto">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">Processing Complete!</p>
          <p className="text-sm text-muted-foreground mt-1">
            {filename} · {(fileSize / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
        <button
          onClick={onDownload}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-[15px] font-bold text-primary-foreground transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download className="h-5 w-5" />
          Download {toolName}
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-6 py-4 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4" />
          Start Over
        </button>
      </div>
    </div>
  );
};

export default DownloadResult;
