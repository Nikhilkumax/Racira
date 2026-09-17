"use client";

/**
 * Audio Joiner — concatenate several audio files back-to-back into one WAV
 * (concatChannels, Node-verified, with silent channel padding for mono-
 * into-stereo joins). Files are decoded up front; the join order is the
 * list order and can be rearranged before processing. Sample rates follow
 * the FIRST file (everything is resampled by the decoder's own rate match —
 * decodeAudioData resamples to the AudioContext rate, so rates are equal by
 * construction).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, Loader2, UploadCloud, X } from "lucide-react";

import { baseName, concatChannels, decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";

interface JoinItem {
  id: number;
  file: File;
  name: string;
  seconds: number;
  sampleRate: number;
  channels: Float32Array[];
  length: number;
}

let nextId = 1;

export default function AudioJoiner() {
  const [items, setItems] = useState<JoinItem[]>([]);
  const [stage, setStage] = useState<"empty" | "busy" | "ready" | "joined">("empty");
  const [errorMsg, setErrorMsg] = useState("");
  const [output, setOutput] = useState<{ url: string; name: string; seconds: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStage("busy");
    setErrorMsg("");
    try {
      const added: JoinItem[] = [];
      for (const f of Array.from(files)) {
        const decoded = await decodeFileToChannels(f);
        added.push({
          id: nextId++,
          file: f,
          name: f.name,
          seconds: decoded.length / decoded.sampleRate,
          sampleRate: decoded.sampleRate,
          channels: decoded.channels,
          length: decoded.length,
        });
      }
      setItems((prev) => [...prev, ...added]);
      setStage("ready");
    } catch {
      setErrorMsg("Could not decode one of the files — it may be corrupt or use an unsupported codec.");
      setStage("ready");
    }
  }, []);

  const move = (idx: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const remove = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  const join = useCallback(async () => {
    if (items.length < 2) return;
    setStage("busy");
    try {
      const merged = concatChannels(items.map((i) => ({ channels: i.channels, length: i.length })));
      const sampleRate = items[0].sampleRate;
      const wav = encodeWav(merged.channels, sampleRate, merged.length, 16);
      const url = URL.createObjectURL(wav);
      urlsRef.current.push(url);
      const totalSec = merged.length / sampleRate;
      setOutput({ url, name: "joined.wav", seconds: totalSec });
      setStage("joined");
    } catch {
      setErrorMsg("Joining failed.");
      setStage("ready");
    }
  }, [items]);

  const totalSeconds = items.reduce((acc, i) => acc + i.seconds, 0);

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={
          dragging
            ? "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 bg-primary/5 p-8 text-primary"
            : "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        }
      >
        <UploadCloud className="size-6" />
        <span className="text-sm font-medium">
          {items.length === 0 ? "Drop two or more audio files" : "Add more files (joined in list order)"}
        </span>
      </button>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((it, idx) => (
            <div key={it.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5">
              <div className="flex flex-col">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="text-muted-foreground disabled:opacity-30 hover:text-foreground" aria-label={`Move ${it.name} up`}>
                  <ArrowUp className="size-3.5" />
                </button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-muted-foreground disabled:opacity-30 hover:text-foreground" aria-label={`Move ${it.name} down`}>
                  <ArrowDown className="size-3.5" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{idx + 1}. {baseName(it.name)}</p>
                <p className="text-xs text-muted-foreground">{it.seconds.toFixed(1)} s · {(it.sampleRate / 1000).toFixed(1)} kHz</p>
              </div>
              <button type="button" onClick={() => remove(it.id)} className="rounded-md p-1 text-muted-foreground hover:text-destructive" aria-label={`Remove ${it.name}`}>
                <X className="size-4" />
              </button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">{items.length} files · {totalSeconds.toFixed(1)} s joined</p>
          <button
            type="button"
            disabled={items.length < 2 || stage === "busy"}
            onClick={() => void join()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {stage === "busy" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Join & download
          </button>
        </div>
      )}

      {output && (
        <a
          href={output.url}
          download={output.name}
          className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary"
        >
          <Download className="size-4" />
          {output.name} — {output.seconds.toFixed(1)} s, ready
        </a>
      )}
    </div>
  );
}
