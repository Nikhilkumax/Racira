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

  function handle(files: FileList | null) {
    const f = files?.[0];
    if (f && f.type.startsWith("image/")) onFile(f);
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
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  );
}
