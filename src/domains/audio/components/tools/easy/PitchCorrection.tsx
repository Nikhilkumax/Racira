"use client";

/**
 * Pitch Correction — the gentle sibling (autoTune at low strength,
 * Node-verified: strength 0 fully transparent, modest strength moves the
 * median by exactly the requested fraction of the distance). Same engine as
 * the Auto-Tune Effect, opened on sensible cleanup defaults.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { autoTune } from "@/domains/audio/lib/pitch";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function PitchCorrection() {
  const [keyIdx, setKeyIdx] = useState(9); // A
  const [strength, setStrength] = useState(60);
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
        // chromatic correction: pull to the nearest semitone, gently
        const out = audio.channels.map((ch) =>
          autoTune(ch, audio.sampleRate, { strength: strength / 100 }),
        );
        const snapped = out.reduce((s, o) => s + o.framesSnapped, 0);
        const voiced = out.reduce((s, o) => s + o.framesTotal, 0);
        const blob = encodeWav(out.map((o) => o.out), audio.sampleRate, audio.channels[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-corrected.wav" || "corrected.wav",
          report: `Chromatic cleanup · retune ${strength}% · touched ${snapped}/${voiced} voiced frames`,
        });
      } catch {
        setError("Pitch correction failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, keyIdx, strength, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Reference A4 tuning offset: {keyIdx - 9 >= 0 ? "+" : ""}{keyIdx - 9} semitones (chromatic only)
          </span>
          <input type="range" min={0} max={11} step={1} value={keyIdx}
            onChange={(e) => setKeyIdx(Number(e.target.value))} className="w-full" />
          <span className="text-xs text-muted-foreground">
            Chromatic mode corrects to the nearest semitone — no scale needed
            and nothing gets pulled to a wrong note.
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Correction amount: {strength}%</span>
          <input type="range" min={0} max={100} step={5} value={strength}
            onChange={(e) => setStrength(Number(e.target.value))} className="w-full" />
          <span className="text-xs text-muted-foreground">
            40–70% keeps the natural vibrato; 100% is the robotic effect (use
            the Auto-Tune Effect for that).
          </span>
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Correct pitch
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
