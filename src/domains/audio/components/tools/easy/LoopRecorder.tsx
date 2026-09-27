"use client";

/**
 * Loop Recorder — record layered loops (classic looper workflow): take 1
 * sets the loop length, later takes are padded/trimmed into it and mixed
 * (padOrTrim / mixLoopLayers, Node-verified 12/12 incl. mono-take upmix and
 * honest peak reporting). Each take plays back in sync while you record the
 * next, using an AudioContext loop of the current mix.
 */

import { useRef, useState } from "react";
import { Play, Square, Layers, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { mixLoopLayers } from "@/domains/audio/lib/recorder";

interface Take {
  channels: Float32Array[];
  sampleRate: number;
  seconds: number;
}

export default function LoopRecorder() {
  const [takes, setTakes] = useState<Take[]>([]);
  const [loopLen, setLoopLen] = useState(0); // seconds
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [mixInfo, setMixInfo] = useState<string>("");

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const playRef = useRef<{ ctx: AudioContext; src: AudioBufferSourceNode } | null>(null);

  const stopPlayback = () => {
    if (playRef.current) {
      try {
        playRef.current.src.stop();
        playRef.current.ctx.close();
      } catch {
        /* already stopped */
      }
      playRef.current = null;
    }
  };

  const recordTake = async () => {
    setError("");
    setBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        try {
          const raw = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
          const decoded = await decodeFileToChannels(new File([raw], "take.webm", { type: raw.type }));
          setTakes((prev) => {
            const next = [...prev, { channels: decoded.channels, sampleRate: decoded.sampleRate, seconds: decoded.length / decoded.sampleRate }];
            if (next.length === 1) setLoopLen(decoded.length / decoded.sampleRate);
            return next;
          });
          setRecording(false);
        } catch {
          setError("Could not process that take.");
          setRecording(false);
        }
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      // hard safety stop at 4x loop length (or 60 s for the first take)
      const ceilingMs = (loopLen > 0 ? Math.min(loopLen * 4, loopLen + 30) : 60) * 1000;
      setTimeout(() => {
        if (recRef.current?.state === "recording") recRef.current.stop();
      }, ceilingMs);
    } catch {
      setError("Microphone unavailable or permission denied.");
      setRecording(false);
    } finally {
      setBusy(false);
    }
  };

  const playLoop = async () => {
    stopPlayback();
    if (takes.length === 0 || loopLen === 0) return;
    setBusy(true);
    try {
      const loopSamples = Math.round(loopLen * takes[0].sampleRate);
      const mix = mixLoopLayers(
        takes.map((t) => t.channels),
        loopSamples,
      );
      if (mix.peak > 0.99) {
        setMixInfo(`mix peaks at ${mix.peak.toFixed(2)} — it will clip on playback, lower your input next take`);
      } else {
        setMixInfo(`mix of ${takes.length} takes, peak ${mix.peak.toFixed(2)}`);
      }
      const ctx = new AudioContext();
      const buf = ctx.createBuffer(mix.channels.length, loopSamples, takes[0].sampleRate);
      mix.channels.forEach((ch, c) => buf.copyToChannel(ch as Float32Array<ArrayBuffer>, c));
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(ctx.destination);
      src.start();
      playRef.current = { ctx, src };
    } finally {
      setBusy(false);
    }
  };

  const downloadMix = async () => {
    if (takes.length === 0 || loopLen === 0) return;
    setBusy(true);
    try {
      const loopSamples = Math.round(loopLen * takes[0].sampleRate);
      const mix = mixLoopLayers(
        takes.map((t) => t.channels),
        loopSamples,
      );
      const wav = encodeWav(mix.channels, takes[0].sampleRate, loopSamples, 16);
      const url = URL.createObjectURL(wav);
      const a = document.createElement("a");
      a.href = url;
      a.download = "loop-mix.wav";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <button onClick={() => void recordTake()} disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Layers className="size-4" />}
            {takes.length === 0 ? "Record base loop" : `Record layer ${takes.length + 1}`}
          </button>
        ) : (
          <button onClick={() => recRef.current?.stop()}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground">
            <Square className="size-4" /> Stop take
          </button>
        )}
        <button onClick={() => void playLoop()} disabled={busy || takes.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">
          <Play className="size-4" /> Play loop {recording && "(while recording)"}
        </button>
        <button onClick={stopPlayback} disabled={takes.length === 0}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-accent disabled:opacity-50">
          Stop playback
        </button>
        <button onClick={() => void downloadMix()} disabled={busy || takes.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">
          <Download className="size-4" /> Download mix
        </button>
        <button onClick={() => { setTakes([]); setLoopLen(0); setMixInfo(""); }}
          className="rounded-lg border px-3 py-2 text-sm text-destructive hover:bg-accent">
          Clear all
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {loopLen > 0
          ? `Loop length: ${loopLen.toFixed(1)} s (set by take 1). Later takes are padded/trimmed into it and mixed in. ${takes.length} take(s) so far.`
          : "The first take sets the loop length. While it plays back, record the next layer over it."}
      </p>
      {mixInfo && <p className="text-xs text-muted-foreground">{mixInfo}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
