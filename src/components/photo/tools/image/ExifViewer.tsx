"use client";
import { useState } from "react";
import { ToolShell } from "../ui";
import { parseExif } from "@/lib/photo/exif";

export function ExifViewer() {
  const [rows, setRows] = useState<Array<[string, string]> | null>(null);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const onFile = async (f: File) => {
    setErr("");
    setName(f.name);
    try {
      const buf = await f.arrayBuffer();
      const tags = parseExif(buf);
      const entries = Object.entries(tags).map(([k, v]) => [k, String(v)] as [string, string]);
      if (entries.length === 0) setErr("No EXIF data found in this image.");
      setRows(entries);
    } catch (e: any) {
      setErr(e?.message ?? "Could not parse this file.");
    }
  };

  return (
    <ToolShell note="Files are processed locally in your browser. Nothing is uploaded.">
      <input
        type="file"
        accept="image/jpeg,image/tiff,image/heic,.jpg,.jpeg,.tif,.tiff"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="block w-full cursor-pointer rounded-lg border border-dashed bg-background p-6 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
      />
      {name && <p className="mt-3 text-xs text-muted-foreground">Loaded: {name}</p>}
      {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
      {rows && rows.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b last:border-0 even:bg-muted/30">
                  <td className="w-1/3 px-4 py-2 font-medium text-foreground">{k}</td>
                  <td className="px-4 py-2 text-muted-foreground break-all">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolShell>
  );
}
