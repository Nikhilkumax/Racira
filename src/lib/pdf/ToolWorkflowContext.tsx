import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { getPageCount, processFiles, type ToolOptions, type ProgressFn } from "./pdf-tools";

export interface WorkflowResult {
  type: string; // MIME type or custom action type ('coming-soon', 'viewer')
  data?: Uint8Array;
  filename?: string;
  message?: string;
  eta?: string;
  viewerType?: string;
  pdfBytes?: Uint8Array;
}

interface ProgressState {
  current: number;
  total: number;
  message: string;
}

interface ToolWorkflowState {
  files: File[];
  pageCount: number | null;
  toolOptions: ToolOptions;
  processing: boolean;
  done: boolean;
  error: string | null;
  result: WorkflowResult | null;
  fileRotations: Record<number, number>;
  progress: ProgressState | null;

  setFiles: (files: File[]) => void;
  addFiles: (newFiles: FileList | null) => Promise<void>;
  removeFile: (index: number) => void;
  reorderFiles: (from: number, to: number) => void;
  setToolOptions: (opts: ToolOptions) => void;
  setFileRotations: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  process: (slug: string) => Promise<void>;
  reset: () => void;
  setResult: (r: WorkflowResult) => void;
  setDone: (d: boolean) => void;
}

const ToolWorkflowContext = createContext<ToolWorkflowState | null>(null);

export const useToolWorkflow = () => {
  const ctx = useContext(ToolWorkflowContext);
  if (!ctx) throw new Error("useToolWorkflow must be used within ToolWorkflowProvider");
  return ctx;
};

// Tools that accept images instead of PDFs
const IMAGE_TOOLS = ["jpg-to-pdf", "scan-to-pdf"];

export const ToolWorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFilesState] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [toolOptions, setToolOptions] = useState<ToolOptions>({});
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [fileRotations, setFileRotations] = useState<Record<number, number>>({});
  const [progress, setProgress] = useState<ProgressState | null>(null);

  const setFiles = useCallback((f: File[]) => {
    setFilesState(f);
    setDone(false);
    setError(null);
    setResult(null);
  }, []);

  const addFiles = useCallback(async (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    setFilesState((prev) => {
      const updated = [...prev, ...arr];
      // Async page count
      const first = updated[0];
      if (first && (first.type === "application/pdf" || first.name.endsWith(".pdf"))) {
        getPageCount(first).then(setPageCount).catch(() => setPageCount(null));
      } else {
        setPageCount(null);
      }
      return updated;
    });
    setDone(false);
    setError(null);
    setResult(null);

    // Also compute page count for first file if fresh
    if (arr.length > 0 && !IMAGE_TOOLS.some(t => arr[0].name.includes(t))) {
      const first = arr[0];
      if (first.type === "application/pdf" || first.name.endsWith(".pdf")) {
        try {
          const count = await getPageCount(first);
          setPageCount(count);
        } catch {
          setPageCount(null);
        }
      }
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFilesState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reorderFiles = useCallback((from: number, to: number) => {
    if (from === to) return;
    setFilesState((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const process = useCallback(async (slug: string) => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setProgress(null);
    try {
      const onProgress: ProgressFn = (current, total, message) => {
        setProgress({ current, total, message });
      };
      const res = await processFiles(slug, files, toolOptions, onProgress);
      setResult(res);
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Processing failed. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(null);
    }
  }, [files, toolOptions]);

  const reset = useCallback(() => {
    setFilesState([]);
    setDone(false);
    setProcessing(false);
    setError(null);
    setPageCount(null);
    setResult(null);
    setFileRotations({});
    setToolOptions({});
    setProgress(null);
  }, []);

  return (
    <ToolWorkflowContext.Provider
      value={{
        files, pageCount, toolOptions, processing, done, error, result, fileRotations, progress,
        setFiles, addFiles, removeFile, reorderFiles, setToolOptions,
        setFileRotations, process, reset, setResult, setDone,
      }}
    >
      {children}
    </ToolWorkflowContext.Provider>
  );
};
