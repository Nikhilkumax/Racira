"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RotateCw, X, GripVertical } from "lucide-react";
import type { PageThumb } from "@/features/pdf/hooks/usePdfEditor";

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
  showRotate = false,
  showDragHandle = true,
  onSelect,
  onRotate,
}: SortablePageThumbProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: thumb.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const borderColor = isRemoved
    ? "border-destructive/70"
    : isSelected
    ? selectionStyle === "remove"
      ? "border-destructive/70"
      : "border-primary"
    : "border-border";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-lg border-2 overflow-hidden bg-muted/20 cursor-pointer transition-colors ${borderColor}`}
      onClick={() => onSelect?.(visualIndex)}
    >
      {/* Drag handle */}
      {showDragHandle && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-white drop-shadow-md" />
        </div>
      )}

      {/* Page image */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb.dataUrl}
          alt={`Page ${visualIndex + 1}`}
          className={`w-full h-full object-contain transition-opacity ${isRemoved ? "opacity-30" : ""}`}
          draggable={false}
        />
        {/* Removed overlay */}
        {isRemoved && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
            <X className="h-6 w-6 text-destructive" />
          </div>
        )}
      </div>

      {/* Page number */}
      <div className="px-1 py-1 text-center">
        <span className="text-[10px] text-muted-foreground">{visualIndex + 1}</span>
      </div>

      {/* Rotate button */}
      {showRotate && (
        <button
          className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onRotate?.(visualIndex);
          }}
        >
          <RotateCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default SortablePageThumb;
