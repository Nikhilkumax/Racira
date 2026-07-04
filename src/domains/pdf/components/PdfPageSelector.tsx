import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageThumb {
  pageNum: number;
  dataUrl: string;
}

interface Props {
  file: File;
  /** "select" = user picks pages to keep/extract, "remove" = user picks pages to remove */
  mode: "select" | "remove";
  selectedPages: Set<number>;
  onSelectionChange: (pages: Set<number>) => void;
  totalPages: number | null;
  onTotalPagesLoaded: (count: number) => void;
}

const PdfPageSelector = ({
  file,
  mode,
  selectedPages,
  onSelectionChange,
  totalPages,
  onTotalPagesLoaded,
}: Props) => {
  const [thumbs, setThumbs] = useState<PageThumb[]>([]);
  const [loading, setLoading] = useState(true);
  const renderCount = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const currentRender = ++renderCount.current;

    const generateThumbs = async () => {
      setLoading(true);
      const buf = await file.arrayBuffer();
      if (cancelled || currentRender !== renderCount.current) return;

      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const numPages = pdf.numPages;
      onTotalPagesLoaded(numPages);

      const results: PageThumb[] = [];
      for (let i = 1; i <= numPages; i++) {
        if (cancelled || currentRender !== renderCount.current) return;
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        results.push({ pageNum: i, dataUrl: canvas.toDataURL() });
      }

      if (!cancelled && currentRender === renderCount.current) {
        setThumbs(results);
        setLoading(false);
      }
    };

    generateThumbs();
    return () => { cancelled = true; };
  }, [file]);

  const togglePage = (pageNum: number) => {
    const next = new Set(selectedPages);
    if (next.has(pageNum)) {
      next.delete(pageNum);
    } else {
      next.add(pageNum);
    }
    onSelectionChange(next);
  };

  const selectAll = () => {
    if (!totalPages) return;
    const all = new Set<number>();
    for (let i = 1; i <= totalPages; i++) all.add(i);
    onSelectionChange(all);
  };

  const selectNone = () => onSelectionChange(new Set());

  const isSelected = (pageNum: number) => selectedPages.has(pageNum);

  return (
    <div className="mt-6 space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {mode === "select"
            ? "Click pages to select for extraction"
            : "Click pages to mark for removal"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-primary hover:underline font-medium"
          >
            Select all
          </button>
          <span className="text-xs text-muted-foreground">·</span>
          <button
            type="button"
            onClick={selectNone}
            className="text-xs text-primary hover:underline font-medium"
          >
            Deselect all
          </button>
        </div>
      </div>

      {/* Selection count */}
      {totalPages && (
        <p className="text-xs text-muted-foreground">
          {selectedPages.size} of {totalPages} page{totalPages !== 1 ? "s" : ""} selected
          {mode === "remove" && selectedPages.size > 0 && (
            <span className="text-destructive ml-1">
              — {selectedPages.size} will be removed
            </span>
          )}
        </p>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-wrap gap-4 justify-center py-8">
          {Array.from({ length: totalPages || 4 }).map((_, i) => (
            <div
              key={i}
              className="w-[120px] h-[170px] rounded-lg bg-muted/40 animate-pulse border border-border"
            />
          ))}
        </div>
      )}

      {/* Page grid */}
      {!loading && (
        <div className="flex flex-wrap gap-4 justify-center">
          {thumbs.map((thumb) => {
            const selected = isSelected(thumb.pageNum);
            return (
              <button
                key={thumb.pageNum}
                type="button"
                onClick={() => togglePage(thumb.pageNum)}
                className={`group relative flex flex-col items-center rounded-xl border-2 p-2 transition-all w-[130px] ${
                  selected
                    ? mode === "remove"
                      ? "border-destructive bg-destructive/5"
                      : "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {/* Selection indicator */}
                <div
                  className={`absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all ${
                    selected
                      ? mode === "remove"
                        ? "bg-destructive text-destructive-foreground scale-100"
                        : "bg-primary text-primary-foreground scale-100"
                      : "bg-muted text-muted-foreground scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                  }`}
                >
                  {selected ? (
                    mode === "remove" ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Thumbnail image */}
                <div className="w-[110px] h-[150px] flex items-center justify-center rounded-lg overflow-hidden bg-muted/30 mb-1.5">
                  <img
                    src={thumb.dataUrl}
                    alt={`Page ${thumb.pageNum}`}
                    className={`max-w-full max-h-full object-contain transition-opacity ${
                      selected && mode === "remove" ? "opacity-40" : ""
                    }`}
                  />
                  {/* Strikethrough for removed pages */}
                  {selected && mode === "remove" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-0.5 bg-destructive rotate-[-20deg]" />
                    </div>
                  )}
                </div>

                {/* Page number */}
                <span className={`text-xs font-medium ${
                  selected
                    ? mode === "remove"
                      ? "text-destructive"
                      : "text-primary"
                    : "text-foreground"
                }`}>
                  {thumb.pageNum}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PdfPageSelector;
