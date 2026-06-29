import { useEffect, useRef, useState, DragEvent } from "react";
import { X, GripVertical, RotateCw } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FileCardProps {
  file: File;
  index: number;
  draggable?: boolean;
  onRemove: (index: number) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: DragEvent, index: number) => void;
  onDragEnd?: () => void;
  isDropTarget?: boolean;
  /** If provided, show a rotate overlay button on hover */
  onRotate?: (index: number) => void;
  /** Current rotation in degrees for visual rotation of thumbnail */
  rotation?: number;
}

const FileCard = ({
  file,
  index,
  draggable = false,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDropTarget = false,
  onRotate,
  rotation = 0,
}: FileCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const renderThumbnail = async () => {
      if (file.type.startsWith("image/")) {
        setIsImage(true);
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          if (cancelled || !canvasRef.current) { URL.revokeObjectURL(url); return; }
          const canvas = canvasRef.current;
          const scale = 160 / Math.max(img.width, img.height);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setThumbnailReady(true);
          URL.revokeObjectURL(url);
        };
        img.src = url;
        return;
      }

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        try {
          const arrayBuf = await file.arrayBuffer();
          if (cancelled) return;
          const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
          if (!cancelled) setPageCount(pdf.numPages);
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.4 });
          const canvas = canvasRef.current;
          if (!canvas || cancelled) return;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (!cancelled) setThumbnailReady(true);
        } catch {
          // fail silently
        }
      }
    };

    renderThumbnail();
    return () => { cancelled = true; };
  }, [file]);

  const sizeMB = (file.size / 1024 / 1024).toFixed(2);
  const displayName = file.name.length > 24 ? file.name.slice(0, 21) + "…" : file.name;

  return (
    <div
      draggable={draggable}
      onDragStart={() => onDragStart?.(index)}
      onDragOver={(e: DragEvent) => { e.preventDefault(); onDragOver?.(e, index); }}
      onDragEnd={() => onDragEnd?.()}
      className={`group relative flex flex-col items-center rounded-xl border-2 bg-card p-3 transition-all w-[160px] shrink-0 ${
        isDropTarget
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/30"
      } ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(index); }}
        className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove file"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Drag handle */}
      {draggable && (
        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative w-[130px] h-[170px] flex items-center justify-center rounded-lg bg-muted/40 overflow-hidden mb-2">
        <canvas
          ref={canvasRef}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ${thumbnailReady ? "" : "hidden"}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        {!thumbnailReady && (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <div className="h-8 w-8 rounded border-2 border-muted-foreground/30 animate-pulse" />
            <span className="text-[10px]">Loading…</span>
          </div>
        )}
        {pageCount !== null && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-foreground/80 px-1.5 py-0.5 text-[10px] font-semibold text-background leading-none">
            {pageCount} {pageCount === 1 ? "page" : "pages"}
          </span>
        )}

        {/* Per-card rotate overlay */}
        {onRotate && (
          <button
            onClick={(e) => { e.stopPropagation(); onRotate(index); }}
            className="absolute inset-0 flex items-center justify-center bg-foreground/0 hover:bg-foreground/20 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
            aria-label="Rotate file"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <RotateCw className="h-5 w-5" />
            </div>
          </button>
        )}
      </div>

      {/* Rotation indicator */}
      {rotation !== 0 && (
        <span className="text-[10px] font-medium text-primary mb-0.5">{rotation}°</span>
      )}

      {/* File info */}
      <p className="text-xs font-medium text-foreground text-center truncate w-full" title={file.name}>
        {displayName}
      </p>
      <p className="text-[10px] text-muted-foreground">{sizeMB} MB</p>
    </div>
  );
};

export default FileCard;
