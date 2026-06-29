import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, RotateCw, GripVertical } from "lucide-react";
import type { PageThumb } from "@/hooks/pdf/usePdfEditor";

interface SortablePageThumbProps {
  thumb: PageThumb;
  visualIndex: number;
  isSelected?: boolean;
  isRemoved?: boolean;
  selectionStyle?: "select" | "remove";
  showRotate?: boolean;
  showDragHandle?: boolean;
  onSelect?: (visualIndex: number) => void;
  onRotate?: (visualIndex: number) => void;
}

const SortablePageThumb = ({
  thumb,
  visualIndex,
  isSelected,
  isRemoved,
  selectionStyle = "select",
  showRotate,
  showDragHandle = true,
  onSelect,
  onRotate,
}: SortablePageThumbProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: thumb.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const isRemoveStyle = selectionStyle === "remove";
  const highlighted = isSelected || isRemoved;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border-2 overflow-hidden transition-all duration-150 ${
        isRemoved
          ? "border-destructive ring-2 ring-destructive/20"
          : highlighted && !isRemoveStyle
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/40 bg-card"
      }`}
    >
      {/* Click target */}
      <button
        type="button"
        onClick={() => onSelect?.(visualIndex)}
        className="w-full"
      >
        <div className="aspect-[3/4] flex items-center justify-center bg-card p-1 relative">
          <img
            src={thumb.dataUrl}
            alt={`Page ${visualIndex + 1}`}
            className={`max-w-full max-h-full object-contain transition-opacity ${
              isRemoved ? "opacity-30" : ""
            }`}
          />
          {isRemoved && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <X className="h-8 w-8 text-destructive/60" />
            </div>
          )}
        </div>

        {/* Page number badge */}
        <div className={`text-center py-1 text-xs font-medium border-t ${
          isRemoved
            ? "bg-destructive/10 text-destructive border-destructive/20"
            : highlighted && !isRemoveStyle
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted/50 text-muted-foreground border-border"
        }`}>
          {visualIndex + 1}
        </div>
      </button>

      {/* Drag handle */}
      {showDragHandle && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 p-1 rounded-md bg-foreground/70 text-background opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3" />
        </div>
      )}

      {/* Rotate button */}
      {showRotate && (
        <button
          onClick={(e) => { e.stopPropagation(); onRotate?.(visualIndex); }}
          className="absolute top-1 right-1 p-1 rounded-md bg-foreground/70 text-background opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/90"
          aria-label="Rotate page"
        >
          <RotateCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default SortablePageThumb;
