import { useRef, useCallback, type DragEvent } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { PageThumb } from "@/domains/pdf/hooks/usePdfEditor";
import SortablePageThumb from "./SortablePageThumb";

interface LivePreviewPanelProps {
  thumbs: PageThumb[];
  loading: boolean;
  removedPages?: Set<number>;
  selectedPages?: Set<number>;
  selectionStyle?: "select" | "remove";
  showRotate?: boolean;
  enableDragReorder?: boolean;
  showAddFiles?: boolean;
  acceptTypes?: string;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onSelect?: (visualIndex: number) => void;
  onRotate?: (visualIndex: number) => void;
  onAddFiles?: (files: FileList | null) => void;
}

const LivePreviewPanel = ({
  thumbs,
  loading,
  removedPages,
  selectedPages,
  selectionStyle = "select",
  showRotate = false,
  enableDragReorder = true,
  showAddFiles = false,
  acceptTypes = ".pdf",
  onReorder,
  onSelect,
  onRotate,
  onAddFiles,
}: LivePreviewPanelProps) => {
  const addMoreRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;

    const oldIndex = thumbs.findIndex(t => t.id === active.id);
    const newIndex = thumbs.findIndex(t => t.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  }, [thumbs, onReorder]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0 && onAddFiles) {
      onAddFiles(e.dataTransfer.files);
    }
  }, [onAddFiles]);

  const selectedCount = selectedPages?.size ?? 0;
  const removedCount = removedPages?.size ?? 0;

  return (
    <div
      className="relative min-h-full p-4 sm:p-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Counter */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {thumbs.length} page{thumbs.length !== 1 ? "s" : ""}
          {removedCount > 0 && (
            <span className="text-destructive ml-2">· {removedCount} removed</span>
          )}
          {selectedCount > 0 && (
            <span className="text-primary ml-2">· {selectedCount} selected</span>
          )}
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg bg-muted/60 animate-pulse border border-border" />
          ))}
        </div>
      )}

      {/* Page thumbnails with dnd-kit */}
      {!loading && thumbs.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={thumbs.map(t => t.id)}
            strategy={rectSortingStrategy}
            disabled={!enableDragReorder}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {thumbs.map((thumb, i) => (
                <SortablePageThumb
                  key={thumb.id}
                  thumb={thumb}
                  visualIndex={i}
                  isSelected={selectedPages?.has(i)}
                  isRemoved={removedPages?.has(thumb.pageIndex)}
                  selectionStyle={selectionStyle}
                  showRotate={showRotate}
                  showDragHandle={enableDragReorder}
                  onSelect={onSelect}
                  onRotate={onRotate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Files button */}
      {showAddFiles && (
        <>
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
            onChange={(e) => { if (e.target.files) onAddFiles?.(e.target.files); e.target.value = ""; }}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default LivePreviewPanel;
