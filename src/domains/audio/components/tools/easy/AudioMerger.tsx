"use client";

/**
 * Audio Merger — play several files AT THE SAME TIME and render the mix to
 * one WAV (mixChannels, Node-verified: 1/n sum so a full-scale mix cannot
 * clip beyond the original peak; shorter inputs pad with silence). This is
 * the layered/overdub counterpart to the Audio Joiner, which sequences
 * files back-to-back instead.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, Play, Square, UploadCloud, X } from "lucide-react";

import { baseName, decodeFileToChannels, encodeWav, mixChannels } from "@/domains/audio/lib/edit";

interface MixItem {
  id: number;
  file: File;
  name: string;
  seconds: number;
  sampleRate: number;
  channels: Float32Array[];
  length: number;
}

let nextId = 1;

export default function AudioMerger() {
  const [items, setItems] = useState<MixItem[]>([]);
  const [stage, setStage] = useState<"empty" | "busy" | "ready" | "mixed">("empty");
  const [errorMsg, setErrorMsg] = useState("");
  const [output, setOutput] = useState<{ url: string; name: string; seconds: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);
  const ctxRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(
    () => () => {
      srcRef.current?.stop();
      void ctxRef.current?.close();
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStage("busy");
    setErrorMsg("");
    try {
      const added: MixItem[] = [];
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

  const remove = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  const togglePreview = useCallback(() => {
    if (previewing) {
      srcRef.current?.stop();
      setPreviewing(false);
      return;
    }
    if (items.length === 0) return;
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;
    const width = Math.max(...items.map((i) => i.channels.length));
    const total = Math.max(...items.map((i) => i.length));
    const buffer = ctx.createBuffer(width, total, items[0].sampleRate);
    for (const item of items) {
      for (let c = 0; c < item.channels.length; c++) {
        buffer.getChannelData(c).set(item.channels[c]);
      }
    }
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(ctx.destination);
    node.onended = () => setPreviewing(false);
    node.start();
    srcRef.current = node;
    setPreviewing(true);
  }, [items, previewing]);

  const mix = useCallback(async () => {
    if (items.length < 2) return;
    setStage("busy");
    try {
      const merged = mixChannels(items.map((i) => ({ channels: i.channels, length: i.length })));
      const sampleRate = items[0].sampleRate;
      const wav = encodeWav(merged.channels, sampleRate, merged.length, 16);
      const url = URL.createObjectURL(wav);
      urlsRef.current.push(url);
      setOutput({ url, name: "merged-mix.wav", seconds: merged.length / sampleRate });
      setStage("mixed");
    } catch {
      setErrorMsg("Mixing failed.");
      setStage("ready");
    }
  }, [items]);

  const totalSeconds = Math.max(0, ...items.map((i) => i.seconds));

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
          {items.length === 0 ? "Drop two or more audio files to layer" : "Add more layers"}
        </span>
        <span className="text-xs">All files play simultaneously in the mix — order does not matter</span>
      </button>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{baseName(it.name)}</p>
                <p className="text-xs text-muted-foreground">{it.seconds.toFixed(1)} s</p>
              </div>
              <button type="button" onClick={() => remove(it.id)} className="rounded-md p-1 text-muted-foreground hover:text-destructive" aria-label={`Remove ${it.name}`}>
                <X className="size-4" />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePreview}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground"
            >
              {previewing ? <Square className="size-4" /> : <Play className="size-4" />}
              {previewing ? "Stop" : "Preview mix"}
            </button>
            <button
              type="button"
              disabled={items.length < 2 || stage === "busy"}
              onClick={() => void mix()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {stage === "busy" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Mix & download
            </button>
            <span className="text-xs text-muted-foreground">
              {items.length} layers · {totalSeconds.toFixed(1)} s longest · levels summed at 1/{items.length}
            </span>
          </div>
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
