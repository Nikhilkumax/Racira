"use client";

/**
 * Crossfade Creator — join two clips with an equal-power crossfade
 * (crossfadeChannels, Node-verified: sin/cos gains keep loudness constant
 * through the blend; mono↔stereo joins pad the missing channel with silence).
 * Drop order matters: clip 1 fades out while clip 2 fades in.
 */

import { useCallback, useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav, crossfadeChannels } from "@/domains/audio/lib/edit";

interface Clip {
  name: string;
  channels: Float32Array[];
  sampleRate: number;
}

export default function CrossfadeCreator() {
  const [clipA, setClipA] = useState<Clip | null>(null);
  const [clipB, setClipB] = useState<Clip | null>(null);
  const [overlapSec, setOverlapSec] = useState(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    url: string;
    name: string;
    seconds: number;
    capped: number | null;
  } | null>(null);

  const load = useCallback(async (file: File | undefined, slot: "a" | "b") => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const decoded = await decodeFileToChannels(file);
      const clip: Clip = { name: file.name, channels: decoded.channels, sampleRate: decoded.sampleRate };
      if (slot === "a") setClipA(clip);
      else setClipB(clip);
    } catch {
      setError("Could not decode that file.");
    } finally {
      setBusy(false);
    }
  }, []);

  const run = useMemo(
    () => async () => {
      if (!clipA || !clipB || busy) return;
      setBusy(true);
      setError("");
      try {
        if (clipA.sampleRate !== clipB.sampleRate) {
          throw new Error(
            `Sample rates differ (${clipA.sampleRate} vs ${clipB.sampleRate} Hz) — convert both to the same rate first.`,
          );
        }
        // Cap the overlap at half the shorter clip so both sides always keep
        // some untouched material — an overlap longer than a clip would
        // silently consume that clip entirely.
        const aDur = clipA.channels[0].length / clipA.sampleRate;
        const bDur = clipB.channels[0].length / clipB.sampleRate;
        const maxOverlap = Math.min(aDur, bDur) / 2;
        const effective = Math.min(overlapSec, maxOverlap);
        const overlap = Math.round(effective * clipA.sampleRate);
        const out = crossfadeChannels(clipA.channels, clipB.channels, overlap);
        const blob = encodeWav(out, clipA.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: "crossfade.wav",
          seconds: out[0].length / clipA.sampleRate,
          capped: effective < overlapSec ? effective : null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Crossfade failed.");
      } finally {
        setBusy(false);
      }
    },
    [clipA, clipB, overlapSec, busy],
  );

  const slot = (clip: Clip | null, onFile: (f: File | undefined) => void, label: string) => (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-2 text-xs font-medium text-muted-foreground">{label}</div>
      {clip ? (
        <p className="truncate text-sm">
          {clip.name} · {(clip.channels[0].length / clip.sampleRate).toFixed(1)} s ·{" "}
          {clip.sampleRate} Hz
        </p>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <UploadCloud className="size-4" /> Choose a file…
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {slot(clipA, (f) => void load(f, "a"), "Clip 1 (fades out)")}
        {slot(clipB, (f) => void load(f, "b"), "Clip 2 (fades in)")}
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Crossfade length: {overlapSec} s
        </span>
        <input
          type="range"
          min={0.5}
          max={15}
          step={0.5}
          value={overlapSec}
          onChange={(e) => setOverlapSec(Number(e.target.value))}
          className="w-full"
        />
      </label>
      <button
        type="button"
        onClick={() => void run()}
        disabled={!clipA || !clipB || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        Create crossfade
      </button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {result ? (
        <div className="flex items-center gap-3 rounded-xl border border-border p-4">
          <Download className="size-4" />
          <a href={result.url} download={result.name} className="text-sm underline">
            {result.name}
          </a>
          <span className="text-xs text-muted-foreground">
            {result.seconds.toFixed(1)} s total (equal-power blend)
            {result.capped !== null
              ? ` · overlap capped to ${result.capped.toFixed(1)} s (short clips)`
              : ""}
          </span>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Equal-power (sin/cos) gains keep the blend at constant loudness — a linear
        crossfade would dip −3 dB mid-blend. Same sample rate required for both clips.
      </p>
    </div>
  );
}
