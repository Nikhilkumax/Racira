import { useEffect, useRef, useState, useCallback, type DragEvent } from "react";
import { Plus, X, RotateCw, GripVertical } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageThumb {
  pageNum: number;
  fileIndex: number;
  dataUrl: string;
  width: number;
  height: number;
}

interface FilePreviewPanelProps {
  files: File[];
  onAddFiles: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
  onReorderFiles?: (from: number, to: number) => void;
  acceptTypes?: string;
  /** Show per-file cards instead of page thumbnails */
  mode?: "files" | "pages";
  /** Pages selected (1-indexed) for tools like split/remove */
  selectedPages?: Set<number>;
  onPageSelect?: (pageNum: number, shiftKey: boolean) => void;
  /** "select" highlights in primary, "remove" highlights in destructive */
  selectionStyle?: "select" | "remove";
  /** Show rotate button on page thumbnails */
  showRotate?: boolean;
  onRotatePage?: (pageNum: number) => void;
  /** Total page count callback */
  onPageCountLoaded?: (count: number) => void;
}

const FilePreviewPanel = ({
  files,
  onAddFiles,
  onRemoveFile,
  onReorderFiles,
  acceptTypes = ".pdf",
  mode = "files",
  selectedPages,
  onPageSelect,
  selectionStyle = "select",
  showRotate,
  onRotatePage,
  onPageCountLoaded,
}: FilePreviewPanelProps) => {
  const addMoreRef = useRef<HTMLInputElement>(null);
  const [thumbs, setThumbs] = useState<PageThumb[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const renderCount = useRef(0);

  // Generate page thumbnails when in pages mode
  useEffect(() => {
    if (mode !== "pages" || files.length === 0) {
      setThumbs([]);
      return;
    }

    let cancelled = false;
    const currentRender = ++renderCount.current;

    const generate = async () => {
      setLoading(true);
      const allThumbs: PageThumb[] = [];

      for (let fi = 0; fi < files.length; fi++) {
        const file = files[fi];
        if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) continue;

        try {
          const buf = await file.arrayBuffer();
          if (cancelled || currentRender !== renderCount.current) return;
          const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            if (cancelled || currentRender !== renderCount.current) return;
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) continue;
            await page.render({ canvasContext: ctx, viewport }).promise;
            allThumbs.push({
              pageNum: allThumbs.length + 1,
              fileIndex: fi,
              dataUrl: canvas.toDataURL(),
              width: viewport.width,
              height: viewport.height,
            });
          }
        } catch {
          // skip corrupted files
        }
      }

      if (!cancelled && currentRender === renderCount.current) {
        setThumbs(allThumbs);
        setLoading(false);
        onPageCountLoaded?.(allThumbs.length);
      }
    };

    generate();
    return () => { cancelled = true; };
  }, [files, mode]);

  // Generate file-level thumbnails
  const [fileThumbs, setFileThumbs] = useState<Record<number, string>>({});
  useEffect(() => {
    if (mode !== "files") return;
    files.forEach((file, idx) => {
      if (fileThumbs[idx]) return;
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setFileThumbs(prev => ({ ...prev, [idx]: url }));
        return;
      }
      if (file.type.includes("pdf") || file.name.endsWith(".pdf")) {
        file.arrayBuffer().then(buf => {
          pdfjsLib.getDocument({ data: buf }).promise.then(pdf => {
            pdf.getPage(1).then(page => {
              const vp = page.getViewport({ scale: 0.3 });
              const canvas = document.createElement("canvas");
              canvas.width = vp.width;
              canvas.height = vp.height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              page.render({ canvasContext: ctx, viewport: vp }).promise.then(() => {
                setFileThumbs(prev => ({ ...prev, [idx]: canvas.toDataURL() }));
              });
            });
          });
        }).catch(() => {});
      }
    });
  }, [files, mode]);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDragEnd = () => {
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      onReorderFiles?.(dragIdx, dragOverIdx);
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  }, [onAddFiles]);

  const totalPages = mode === "pages" ? thumbs.length : files.length;
  const selectedCount = selectedPages?.size ?? 0;

  return (
    <div
      className="relative min-h-full p-4 sm:p-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Page counter + selection info */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {mode === "pages"
            ? `${totalPages} page${totalPages !== 1 ? "s" : ""}`
            : `${files.length} file${files.length !== 1 ? "s" : ""}`
          }
          {selectedCount > 0 && (
            <span className={selectionStyle === "remove" ? "text-destructive ml-2" : "text-primary ml-2"}>
              · {selectedCount} selected
            </span>
          )}
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && mode === "pages" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg bg-muted/60 animate-pulse border border-border" />
          ))}
        </div>
      )}

      {/* Page thumbnails grid */}
      {!loading && mode === "pages" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {thumbs.map((thumb) => {
            const selected = selectedPages?.has(thumb.pageNum);
            const isRemoveStyle = selectionStyle === "remove";
            return (
              <button
                key={thumb.pageNum}
                type="button"
                onClick={(e) => onPageSelect?.(thumb.pageNum, e.shiftKey)}
                className={`group relative rounded-lg border-2 overflow-hidden transition-all duration-150 ${
                  selected
                    ? isRemoveStyle
                      ? "border-destructive ring-2 ring-destructive/20"
                      : "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                <div className="aspect-[3/4] flex items-center justify-center bg-card p-1">
                  <img
                    src={thumb.dataUrl}
                    alt={`Page ${thumb.pageNum}`}
                    className={`max-w-full max-h-full object-contain transition-opacity ${
                      selected && isRemoveStyle ? "opacity-30" : ""
                    }`}
                  />
                  {selected && isRemoveStyle && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <X className="h-8 w-8 text-destructive/60" />
                    </div>
                  )}
                </div>

                {/* Page number badge */}
                <div className={`text-center py-1 text-xs font-medium border-t ${
                  selected
                    ? isRemoveStyle
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted/50 text-muted-foreground border-border"
                }`}>
                  {thumb.pageNum}
                </div>

                {/* Rotate button */}
                {showRotate && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRotatePage?.(thumb.pageNum); }}
                    className="absolute top-1 right-1 p-1 rounded-md bg-foreground/70 text-background opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/90"
                    aria-label="Rotate page"
                  >
                    <RotateCw className="h-3 w-3" />
                  </button>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* File cards grid */}
      {mode === "files" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {files.map((file, idx) => {
            const isDragTarget = dragOverIdx === idx && dragIdx !== null && dragIdx !== idx;
            const sizeMB = (file.size / 1024 / 1024).toFixed(1);
            const name = file.name.length > 20 ? file.name.slice(0, 17) + "…" : file.name;

            return (
              <div
                key={`${file.name}-${file.size}-${idx}`}
                draggable={!!onReorderFiles}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e as any, idx)}
                onDragEnd={handleDragEnd}
                className={`group relative rounded-lg border-2 bg-card overflow-hidden transition-all ${
                  isDragTarget ? "border-primary scale-[1.02]" : "border-border hover:border-primary/30"
                } ${onReorderFiles ? "cursor-grab active:cursor-grabbing" : ""}`}
              >
                {/* Remove button */}
                <button
                  onClick={() => onRemoveFile(idx)}
                  className="absolute top-1 right-1 z-10 p-1 rounded-full bg-destructive text-destructive-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Drag handle */}
                {onReorderFiles && (
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                    <GripVertical className="h-3.5 w-3.5" />
                  </div>
                )}

                {/* Thumbnail */}
                <div className="aspect-[3/4] flex items-center justify-center bg-muted/30 p-2">
                  {fileThumbs[idx] ? (
                    <img src={fileThumbs[idx]} alt={file.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-8 h-10 rounded border-2 border-muted-foreground/20 animate-pulse" />
                  )}
                </div>

                {/* File info */}
                <div className="p-2 border-t border-border">
                  <p className="text-xs font-medium text-foreground truncate" title={file.name}>{name}</p>
                  <p className="text-[10px] text-muted-foreground">{sizeMB} MB</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add Files button */}
      <button
        onClick={() => addMoreRef.current?.click()}
        className="fixed bottom-6 right-6 lg:absolute lg:bottom-4 lg:right-4 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
      >
        <Plus className="h-4 w-4" />
        Add files
      </button>

      <input
        ref={addMoreRef}
        type="file"
        accept={acceptTypes}
        multiple
        onChange={(e) => { if (e.target.files) onAddFiles(e.target.files); e.target.value = ""; }}
        className="hidden"
      />
    </div>
  );
};

export default FilePreviewPanel;
