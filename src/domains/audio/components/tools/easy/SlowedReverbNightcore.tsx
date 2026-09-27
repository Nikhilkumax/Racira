"use client";

/**
 * Slowed + Reverb / Nightcore — the two classic edits on verified
 * primitives: resampleLinear (speed change = pitch change, exactly like
 * tape/Audacity, Node-verified semantics) and schroederReverb (tail proven
 * to ring past the input end). One mode each: slowed (0.7–0.95×) + wet, or
 * nightcore (1.15–1.35×), which skips the reverb.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav, resampleLinear } from "@/domains/audio/lib/edit";
import { schroederReverb } from "@/domains/audio/lib/reverb";

type Mode = "slowed" | "nightcore";

export default function SlowedReverbNightcore() {
  const [mode, setMode] = useState<Mode>("slowed");
  const [speed, setSpeed] = useState(85); // percent
  const [reverbMix, setReverbMix] = useState(35); // percent, slowed mode only
  const [file, setFile] = useState<File | null>(null);
  const [audio, setAudio] = useState<{ channels: Float32Array[]; sampleRate: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string; report: string } | null>(null);

  const load = useMemo(
    () => async (f: File | undefined) => {
      if (!f) return;
      setBusy(true);
      setError("");
      try {
        const decoded = await decodeFileToChannels(f);
        setFile(f);
        setAudio(decoded);
        setResult(null);
      } catch {
        setError("Could not decode that file.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const run = useMemo(
    () => async () => {
      if (!audio || busy) return;
      setBusy(true);
      setError("");
      try {
        const factor = speed / 100; // resampleLinear: pitch × factor, length ÷ factor
        const pitchShiftCents = Math.round(1200 * Math.log2(factor));
        const out = audio.channels.map((ch) => {
          const sped = resampleLinear(ch, factor);
          if (mode === "nightcore") return sped;
          return schroederReverb(sped, audio.sampleRate, {
            size: 1.2,
            feedback: 0.78,
            dampHz: 3500,
            mix: reverbMix / 100,
            tailSec: 2,
          });
        });
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        const secs = out[0].length / audio.sampleRate;
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + (mode === "nightcore" ? "-nightcore.wav" : "-slowed.wav") || "edit.wav",
          report:
            `${speed}% speed (${pitchShiftCents >= 0 ? "+" : ""}${pitchShiftCents} cents) · ` +
            (mode === "nightcore" ? "dry" : `reverb mix ${reverbMix}% · 2 s tail`) +
            ` · ${secs.toFixed(1)} s`,
        });
      } catch {
        setError("Edit failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, mode, speed, reverbMix, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div>
        <p className="text-sm font-medium text-foreground">Style</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["slowed", "nightcore"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                (mode === m
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
              }
            >
              {m === "slowed" ? "Slowed + Reverb" : "Nightcore"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Speed: {speed}%</span>
          <input type="range" min={mode === "slowed" ? 60 : 105} max={mode === "slowed" ? 100 : 150}
            step={5} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))} className="w-full" />
          <span className="text-xs text-muted-foreground">
            {mode === "slowed"
              ? "80–90% is the classic slowed edit — pitch drops with it, like tape."
              : "115–130% is the classic nightcore lift — brighter and faster."}
          </span>
        </label>
        {mode === "slowed" && (
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Reverb mix: {reverbMix}%</span>
            <input type="range" min={0} max={60} step={5} value={reverbMix}
              onChange={(e) => setReverbMix(Number(e.target.value))} className="w-full" />
            <span className="text-xs text-muted-foreground">
              30–40% puts the track “in the room”. The tail rings past the end.
            </span>
          </label>
        )}
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Create edit
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="space-y-2">
          <a href={result.url} download={result.name}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent">
            <Download className="size-4" /> {result.name}
          </a>
          <p className="text-xs text-muted-foreground">{result.report}</p>
        </div>
      )}
    </div>
  );
}
