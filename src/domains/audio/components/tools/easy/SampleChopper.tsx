"use client";

/**
 * Sample Chopper — slice a file into evenly spaced samples (sliceByDuration,
 * Node-verified) with per-chip downloads and optional playback. The
 * producer's "chop the break into 16 slices" workflow, one click per slice.
 */

import { useMemo, useRef, useState } from "react";
import { Download, Play, Square } from "lucide-react";

import {
  decodeFileToChannels,
  encodeWav,
  baseName,
  sliceByDuration,
} from "@/domains/audio/lib/edit";

interface Chip {
  index: number;
  startSec: number;
  endSec: number;
  blobUrl: string;
  buffer: AudioBuffer;
}

export default function SampleChopper() {
  const [fileName, setFileName] = useState("");
  const [chips, setChips] = useState<Chip[] | null>(null);
  const [segmentSec, setSegmentSec] = useState(0.5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<AudioBufferSourceNode | null>(null);

  const handleFile = useMemo(
    () => async (file: File | undefined) => {
      if (!file) return;
      setBusy(true);
      setError("");
      setChips(null);
      try {
        const decoded = await decodeFileToChannels(file);
        const spans = sliceByDuration(decoded.length, decoded.sampleRate, segmentSec);
        const out: Chip[] = spans.map((s, i) => {
          const channels = decoded.channels.map((ch) => ch.slice(s.start, s.end));
          const blob = encodeWav(channels, decoded.sampleRate, channels[0].length);
          const buffer = new AudioBuffer({
            length: channels[0].length,
            numberOfChannels: channels.length,
            sampleRate: decoded.sampleRate,
          });
          channels.forEach((ch, c) => buffer.copyToChannel(ch, c));
          return {
            index: i + 1,
            startSec: s.start / decoded.sampleRate,
            endSec: s.end / decoded.sampleRate,
            blobUrl: URL.createObjectURL(blob),
            buffer,
          };
        });
        setFileName(baseName(file.name));
        setChips(out);
      } catch {
        setError("Could not decode that file.");
      } finally {
        setBusy(false);
      }
    },
    [segmentSec],
  );

  const play = (chip: Chip) => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    srcRef.current?.stop();
    const src = ctxRef.current.createBufferSource();
    src.buffer = chip.buffer;
    src.connect(ctxRef.current.destination);
    src.onended = () => setPlaying(null);
    src.start();
    srcRef.current = src;
    setPlaying(chip.index);
  };

  const stop = () => {
    srcRef.current?.stop();
    setPlaying(null);
  };

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <Download className="size-4 rotate-180" />
        {fileName || "Drop or choose an audio file to chop…"}
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Slice length: {segmentSec} s
        </span>
        <input
          type="range"
          min={0.1}
          max={4}
          step={0.05}
          value={segmentSec}
          onChange={(e) => setSegmentSec(Number(e.target.value))}
          className="w-full"
        />
      </label>
      {busy ? <p className="text-sm text-muted-foreground">Decoding…</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {chips ? (
        <>
          <p className="text-xs text-muted-foreground">
            {chips.length} chips · click ▶ to audition, then download the ones you keep.
          </p>
          <div className="grid max-h-96 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {chips.map((chip) => (
              <div
                key={chip.index}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <span className="font-mono text-xs">
                  #{String(chip.index).padStart(2, "0")} · {chip.startSec.toFixed(2)}–{chip.endSec.toFixed(2)}s
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => (playing === chip.index ? stop() : play(chip))}
                    className="rounded p-1 hover:bg-muted"
                    aria-label={playing === chip.index ? "Stop" : "Play chip"}
                  >
                    {playing === chip.index ? <Square className="size-4" /> : <Play className="size-4" />}
                  </button>
                  <a
                    href={chip.blobUrl}
                    download={`${fileName}-chip-${String(chip.index).padStart(2, "0")}.wav`}
                    className="rounded p-1 hover:bg-muted"
                    aria-label="Download chip"
                  >
                    <Download className="size-4" />
                  </a>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
