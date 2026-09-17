"use client";

/**
 * ID3 Tag Editor — reads the existing tag block, lets you edit the common
 * text frames, and writes a fresh v2.3 tag back into the file (full rewrite
 * via replaceId3Tag — the writer strips any old tag first, so version
 * upgrades are automatic). Includes a one-click tag stripper for clean
 * masters. All parsing/serialization is lib/id3.ts, Node-verified.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { Download, FileMusic, Loader2, Upload, X } from "lucide-react";

import { readId3, replaceId3Tag, stripId3Tag, type Id3Tags } from "@/domains/audio/lib/id3";

interface FieldDef {
  key: "title" | "artist" | "album" | "year" | "genre" | "comment";
  label: string;
}

const FIELDS: FieldDef[] = [
  { key: "title", label: "Title" },
  { key: "artist", label: "Artist" },
  { key: "album", label: "Album" },
  { key: "year", label: "Year" },
  { key: "genre", label: "Genre" },
  { key: "comment", label: "Comment" },
];

type Status = "idle" | "busy" | "done" | "error";

export default function Id3TagEditor() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [existing, setExisting] = useState<Id3Tags | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<FieldDef["key"], string>>({
    title: "", artist: "", album: "", year: "", genre: "", comment: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    fileRef.current = file;
    setFileName(file.name);
    setFileSize(file.size);
    setError(null);
    setStatus("busy");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const tags = readId3(bytes);
      setExisting(tags);
      setFields({
        title: tags?.title ?? "",
        artist: tags?.artist ?? "",
        album: tags?.album ?? "",
        year: tags?.year ?? "",
        genre: tags?.genre ?? "",
        comment: tags?.comment ?? "",
      });
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, []);

  // Revoke object URLs for the download link when replaced/unmounted.
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  useEffect(() => () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); }, [downloadUrl]);

  const build = (mode: "write" | "strip") => {
    const file = fileRef.current;
    if (!file) return;
    setStatus("busy");
    setError(null);
    try {
      void file.arrayBuffer().then((buf) => {
        const bytes = new Uint8Array(buf);
        const out =
          mode === "strip"
            ? stripId3Tag(bytes)
            : replaceId3Tag(bytes, {
                version: 3,
                title: fields.title || null,
                artist: fields.artist || null,
                album: fields.album || null,
                year: fields.year || null,
                genre: fields.genre || null,
                comment: fields.comment || null,
              });
        const blob = new Blob([out.slice().buffer as ArrayBuffer], { type: "audio/mpeg" });
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        // Auto-download with a suffixed name.
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.[^.]+$/, "") + (mode === "strip" ? " (no tags)" : " (tagged)") + ".mp3";
        a.click();
        setStatus("done");
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,.mp3"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />

      {!fileName ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Upload className="size-6" />
          <span className="text-sm font-medium">Drop or choose an MP3</span>
          <span className="text-xs">Everything runs locally — the file never leaves your machine</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <FileMusic className="size-5 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {(fileSize / 1024).toFixed(0)} KB
              {existing
                ? ` · ID3v${existing.version[0]}.${existing.version[1]}${existing.tracks.length ? ` · ${existing.tracks.length} frames` : ""}`
                : " · no existing tag"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFileName(null);
              setExisting(null);
              setDownloadUrl(null);
              fileRef.current = null;
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Choose a different file"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {existing && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Current tags</p>
          <p className="mt-1 font-mono text-xs text-foreground">
            {[existing.title, existing.artist, existing.album, existing.year].filter(Boolean).join(" · ") || "(empty)"}
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className={f.key === "comment" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
            <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
            {f.key === "comment" ? (
              <textarea
                value={fields[f.key]}
                onChange={(e) => setFields((s) => ({ ...s, [f.key]: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
              />
            ) : (
              <input
                value={fields[f.key]}
                onChange={(e) => setFields((s) => ({ ...s, [f.key]: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
              />
            )}
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!fileName || status === "busy"}
          onClick={() => build("write")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {status === "busy" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          Write tags & download
        </button>
        <button
          type="button"
          disabled={!fileName || status === "busy"}
          onClick={() => build("strip")}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50"
        >
          Strip tags & download
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlertIcon /> {error}
        </p>
      )}
    </div>
  );
}

function CircleAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
