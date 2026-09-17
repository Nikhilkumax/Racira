"use client";

/**
 * Batch File Renamer — plans and applies client-side renames for dropped
 * audio files: prefix/suffix, find&replace, zero-padded numbering, case
 * normalization, and invalid-character replacement. Nothing uploads and audio
 * content is untouched — each file re-downloads byte-for-byte under its new
 * name via an object URL of the original File.
 */

import { useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";

const AUDIO_EXT = /\.(wav|mp3|flac|ogg|oga|m4a|aac|wma|opus|aiff?|webm)$/i;

interface RenameOptions {
  prefix: string;
  suffix: string;
  find: string;
  replace: string;
  caseMode: "keep" | "lower" | "upper";
  numbering: boolean;
  numberStart: number;
  numberPad: number;
  appendTotal: boolean;
  replaceInvalidWith: string;
}

function buildRename(original: string, o: RenameOptions, index: number, total: number): string {
  const ext = original.match(AUDIO_EXT)?.[0] ?? "";
  let base = original.slice(0, original.length - ext.length);
  if (o.find) base = base.split(o.find).join(o.replace);
  base = o.caseMode === "lower" ? base.toLowerCase() : o.caseMode === "upper" ? base.toUpperCase() : base;
  let name = `${o.prefix}${base}${o.suffix}`;
  if (o.numbering) {
    const num = String(index + 1 + o.numberStart).padStart(o.numberPad, "0");
    name += `-${num}`;
    if (o.appendTotal) {
      name += `-of-${String(total + o.numberStart).padStart(o.numberPad, "0")}`;
    }
  }
  name = name.replace(/[\\/:*?"<>|]/g, o.replaceInvalidWith).trim();
  return `${name}${ext}`;
}

const DEFAULTS: RenameOptions = {
  prefix: "",
  suffix: "",
  find: "",
  replace: "",
  caseMode: "keep",
  numbering: true,
  numberStart: 0,
  numberPad: 3,
  appendTotal: false,
  replaceInvalidWith: "-",
};

export default function BatchFileRenamer() {
  const [opts, setOpts] = useState<RenameOptions>(DEFAULTS);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const set = <K extends keyof RenameOptions>(k: K, v: RenameOptions[K]) =>
    setOpts((prev) => ({ ...prev, [k]: v }));

  const takeFiles = (list: FileList | null) => {
    if (list && list.length) setFiles(Array.from(list));
  };

  const plan = useMemo(
    () => files.map((f, i) => ({ file: f, from: f.name, to: buildRename(f.name, opts, i, files.length) })),
    [files, opts],
  );

  // Static preview when nothing is dropped yet.
  const preview = useMemo(
    () =>
      ["episode-interview.wav", "BONUS TRACK.mp3", "take 12.flac"].map((n, i) => ({
        from: n,
        to: buildRename(n, opts, i, 3),
      })),
    [opts],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          takeFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={
          "cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors " +
          (dragging ? "border-primary bg-accent/40" : "border-border hover:border-primary/40")
        }
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*,.wav,.mp3,.flac,.ogg,.m4a,.aac,.opus,.aiff,.webm"
          className="hidden"
          onChange={(e) => takeFiles(e.target.files)}
        />
        <p className="text-sm font-medium text-foreground">
          Drop audio files here, or click to choose
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Multiple files welcome — files never leave your browser.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Prefix</span>
          <input
            type="text"
            value={opts.prefix}
            onChange={(e) => set("prefix", e.target.value)}
            placeholder="podcast-"
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Suffix</span>
          <input
            type="text"
            value={opts.suffix}
            onChange={(e) => set("suffix", e.target.value)}
            placeholder="-final"
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Find in name</span>
          <input
            type="text"
            value={opts.find}
            onChange={(e) => set("find", e.target.value)}
            placeholder="episode"
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Replace with</span>
          <input
            type="text"
            value={opts.replace}
            onChange={(e) => set("replace", e.target.value)}
            placeholder="ep"
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Letter case</span>
          <select
            value={opts.caseMode}
            onChange={(e) => set("caseMode", e.target.value as RenameOptions["caseMode"])}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            <option value="keep">Keep as-is</option>
            <option value="lower">lowercase</option>
            <option value="upper">UPPERCASE</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Numbering</span>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={opts.numbering}
              onChange={(e) => set("numbering", e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <input
              type="number"
              min={0}
              max={9999}
              value={opts.numberStart}
              onChange={(e) => set("numberStart", Math.max(0, Math.min(9999, Number(e.target.value) || 0)))}
              className="w-16 rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
              aria-label="Start numbering at"
            />
            <span className="text-xs text-muted-foreground">start</span>
            <input
              type="number"
              min={1}
              max={6}
              value={opts.numberPad}
              onChange={(e) => set("numberPad", Math.max(1, Math.min(6, Number(e.target.value) || 3)))}
              className="w-16 rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
              aria-label="Zero-pad digits"
            />
            <span className="text-xs text-muted-foreground">digits</span>
          </div>
        </label>
      </div>

      <div className="mt-4 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
        {files.length === 0 ? (
          <>
            <p className="font-medium text-foreground">Plan preview (example names):</p>
            <ul className="mt-1 space-y-0.5">
              {preview.map((p) => (
                <li key={p.from} className="font-mono">
                  {p.from} → {p.to}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="font-medium text-foreground">
              {files.length} file{files.length === 1 ? "" : "s"} — download each with its new name:
            </p>
            <ul className="mt-1 space-y-1">
              {plan.map(({ file, from, to }) => (
                <li key={`${from}-${file.size}`} className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono">
                    {from} → {to}
                  </span>
                  <a
                    href={URL.createObjectURL(file)}
                    download={to}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 font-sans font-medium text-foreground hover:bg-accent"
                  >
                    <Download className="h-3 w-3" /> Save
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {files.length > 0 && (
        <button
          type="button"
          onClick={() => setFiles([])}
          className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
        >
          Clear list
        </button>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Renaming happens in your browser — the saved files are byte-identical copies with new
        names. Nothing is uploaded anywhere.
      </p>
    </div>
  );
}
