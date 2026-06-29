"use client";
import { useState } from "react";
import { ToolShell } from "../ui";

export function ExifStripper() {
  const [url, setUrl] = useState<string | null>(null);
  const [name, setName] = useState("");

  const onFile = async (f: File) => {
    setName(f.name);
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) setUrl(URL.createObjectURL(blob));
        }, "image/jpeg", 0.95);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  return (
    <ToolShell note="Re-encoded through canvas — all EXIF, GPS, and metadata are removed. Image stays in your browser.">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="block w-full cursor-pointer rounded-lg border border-dashed bg-background p-6 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
      />
      {url && (
        <div className="mt-6 rounded-lg border bg-amber-soft/40 p-4 text-center">
          <p className="text-sm font-medium">Metadata stripped from <span className="text-primary">{name}</span></p>
          <a
            href={url}
            download={`clean-${name.replace(/\.[^.]+$/, "")}.jpg`}
            className="mt-3 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Download clean JPEG
          </a>
        </div>
      )}
    </ToolShell>
  );
}
