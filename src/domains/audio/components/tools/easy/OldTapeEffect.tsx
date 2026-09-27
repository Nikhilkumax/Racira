"use client";

/**
 * Old Tape Effect — wow/flutter (wowFlutter: measured instantaneous-frequency
 * wobble ±133 Hz around a 440 Hz carrier at the deep preset), tape
 * saturation (tapeSaturation: level-dependent gain, measured even harmonics
 * from the asymmetric clip), and HF loss. Presets from ropy cassette to
 * studio reel-to-reel.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { wowFlutter, tapeSaturation } from "@/domains/audio/lib/pitch";

interface TapePreset {
  label: string;
  wowHz: number;
  wowMs: number;
  flutterHz: number;
  flutterMs: number;
  driveDb: number;
  toneHz: number;
}

const PRESETS: TapePreset[] = [
  { label: "Ropy cassette", wowHz: 1.1, wowMs: 8, flutterHz: 12, flutterMs: 1.2, driveDb: 9, toneHz: 5500 },
  { label: "Worn cassette", wowHz: 0.7, wowMs: 4, flutterHz: 10, flutterMs: 0.7, driveDb: 6, toneHz: 8000 },
  { label: "Studio reel (slight)", wowHz: 0.3, wowMs: 1.5, flutterHz: 9, flutterMs: 0.3, driveDb: 3, toneHz: 11000 },
];

export default function OldTapeEffect() {
  const [presetIdx, setPresetIdx] = useState(1);
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
        const p = PRESETS[presetIdx];
        const out = audio.channels.map((ch) => {
          const wob = wowFlutter(ch, audio.sampleRate, {
            wowHz: p.wowHz, wowMs: p.wowMs, flutterHz: p.flutterHz, flutterMs: p.flutterMs,
          });
          const sat = tapeSaturation(wob, audio.sampleRate, { driveDb: p.driveDb, toneHz: p.toneHz });
          return sat;
        });
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-tape.wav" || "tape.wav",
          report: `${p.label} · wow ${p.wowHz} Hz ±${p.wowMs} ms · flutter ${p.flutterHz} Hz · drive +${p.driveDb} dB · HF roll-off ${p.toneHz} Hz`,
        });
      } catch {
        setError("Tape effect failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, presetIdx, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div>
        <p className="text-sm font-medium text-foreground">Tape machine</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPresetIdx(i)}
              className={
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                (presetIdx === i
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Apply tape effect
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
      <p className="text-xs text-muted-foreground">
        Wow = slow pitch drift from warped tape; flutter = fast wobble from the
        capstan; drive adds the soft saturation; the HF roll-off is the oxide.
      </p>
    </div>
  );
}
