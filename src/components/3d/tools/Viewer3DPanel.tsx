"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Upload } from "lucide-react";
import { createViewer, loadModelFromFile, type LoadedModel } from "@/lib/3d/three-utils";

type Props = {
  accept?: string;
  onLoaded?: (model: LoadedModel, viewer: ReturnType<typeof createViewer>) => void;
  controls?: ReactNode;
  sidebar?: ReactNode;
  height?: number;
};

export function Viewer3DPanel({ accept = ".gltf,.glb,.obj,.stl,.fbx", onLoaded, controls, sidebar, height = 480 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ReturnType<typeof createViewer> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const v = createViewer(containerRef.current);
    viewerRef.current = v;
    return () => v.dispose();
  }, []);

  async function handleFile(file: File) {
    if (!viewerRef.current) return;
    setError(null);
    setLoading(true);
    setFileName(file.name);
    try {
      const model = await loadModelFromFile(file);
      viewerRef.current.setModel(model.object);
      onLoaded?.(model, viewerRef.current);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load model");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Upload className="h-4 w-4" /> Upload model
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
          {fileName && (
            <span className="text-xs text-muted-foreground truncate max-w-xs">{fileName}</span>
          )}
          <span className="text-xs text-muted-foreground">Accepts: {accept}</span>
          {controls}
        </div>
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-lg border border-border bg-gradient-to-br from-muted/30 to-primary-soft/30"
          style={{ height }}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 text-sm text-muted-foreground">
              Loading…
            </div>
          )}
        </div>
      </div>
      {sidebar && <div className="space-y-3">{sidebar}</div>}
    </div>
  );
}

export function StatBlock({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground break-all">{value}</div>
    </div>
  );
}

export function ToolEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
