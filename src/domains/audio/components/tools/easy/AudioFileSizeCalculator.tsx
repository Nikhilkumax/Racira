"use client";

/**
 * Audio File Size Calculator — uncompressed PCM and lossy-compressed size
 * estimates (pcmFileSizeBytes/lossyFileSizeBytes, Node-verified).
 */

import { useState } from "react";

import { pcmFileSizeBytes, lossyFileSizeBytes } from "@/domains/audio/lib/calc";

const fmtBytes = (b: number) => {
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(2)} GB`;
  if (b >= 1024 ** 2) return `${(b / 1024 ** 2).toFixed(2)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
};

export default function AudioFileSizeCalculator() {
  const [minutes, setMinutes] = useState(3);
  const [sampleRate, setSampleRate] = useState(44100);
  const [channels, setChannels] = useState(2);
  const [bitDepth, setBitDepth] = useState(16);
  const [bitrateKbps, setBitrateKbps] = useState(320);

  const dur = minutes * 60;
  const pcm = pcmFileSizeBytes(dur, sampleRate, channels, bitDepth);
  const lossy = lossyFileSizeBytes(dur, bitrateKbps);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Duration (minutes)</span>
          <input
            type="number"
            min={0.1}
            max={600}
            step={0.1}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(0.1, Math.min(600, Number(e.target.value) || 3)))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Sample rate</span>
          <select
            value={sampleRate}
            onChange={(e) => setSampleRate(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            {[22050, 32000, 44100, 48000, 88200, 96000, 192000].map((r) => (
              <option key={r} value={r}>{r.toLocaleString()} Hz</option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Channels</span>
          <select
            value={channels}
            onChange={(e) => setChannels(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            <option value={1}>1 (mono)</option>
            <option value={2}>2 (stereo)</option>
            <option value={6}>6 (5.1)</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">PCM bit depth</span>
          <select
            value={bitDepth}
            onChange={(e) => setBitDepth(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            {[8, 16, 24, 32].map((d) => (
              <option key={d} value={d}>{d}-bit</option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Lossy bitrate (kbps)</span>
          <select
            value={bitrateKbps}
            onChange={(e) => setBitrateKbps(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            {[96, 128, 192, 256, 320].map((r) => (
              <option key={r} value={r}>{r} kbps</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Uncompressed (WAV/AIFF)
          </p>
          <p className="text-2xl font-bold text-foreground">{fmtBytes(pcm)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {minutes} min · {sampleRate.toLocaleString()} Hz · {channels} ch · {bitDepth}-bit
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Compressed (MP3/AAC at {bitrateKbps} kbps)
          </p>
          <p className="text-2xl font-bold text-foreground">{fmtBytes(lossy)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {(pcm / Math.max(1, lossy)).toFixed(1)}× smaller than PCM
          </p>
        </div>
      </div>
    </div>
  );
}
