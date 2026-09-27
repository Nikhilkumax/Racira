"use client";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ImageDropzone({
  onFile,
  className,
}: {
  onFile: (file: File) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string>("");

  function handle(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("That file isn't an image. Choose a PNG, JPG, WebP or GIF.");
      return;
    }
    // Decode before handing the file off: a corrupt/unsupported image would
    // otherwise reject later and leave the tool silently stuck on the dropzone.
    const url = URL.createObjectURL(f);
    const probe = new Image();
    probe.onload = () => { URL.revokeObjectURL(url); setError(""); onFile(f); };
    probe.onerror = () => { URL.revokeObjectURL(url); setError("That image couldn't be read — the file may be corrupt."); };
    probe.src = url;
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card p-10 text-center transition hover:border-primary/50",
        drag && "border-primary bg-primary-soft/40",
        className,
      )}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">Drop an image here, or click to upload</p>
      <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF</p>
      {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { handle(e.target.files); e.currentTarget.value = ""; }}
      />
    </div>
  );
}
