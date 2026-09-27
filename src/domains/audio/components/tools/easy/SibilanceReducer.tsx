"use client";

/**
 * Sibilance Reducer — de-esser (deEss, Node-verified 15/15: 6 kHz blast
 * attenuated ≥ 20 % with the voiced part byte-identical, normal speech
 * untouched, never amplifies). The band is a zero-phase split (filtfilt
 * corners), so the cut is monotone and recombines exactly.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { deEss } from "@/domains/audio/lib/cleanup";

export default function SibilanceReducer() {
  const [thresholdDb, setThresholdDb] = useState(20);
  const [maxDb, setMaxDb] = useState(6);
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
        let events = 0;
        const out = audio.channels.map((ch) => {
          const r = deEss(ch, audio.sampleRate, {
            thresholdDb: -thresholdDb,
            maxReductionDb: -maxDb,
          });
          events = Math.max(events, r.events);
          return r.out;
        });
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-deessed.wav" || "deessed.wav",
          report: `${events} sibilance event${events === 1 ? "" : "s"} softened · up to −${maxDb} dB in the ${5}–9 kHz band`,
        });
      } catch {
        setError("De-essing failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, thresholdDb, maxDb, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Sensitivity: −{thresholdDb} dB band share</span>
          <input type="range" min={10} max={30} step={1} value={thresholdDb}
            onChange={(e) => setThresholdDb(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Max reduction: −{maxDb} dB</span>
          <input type="range" min={2} max={15} step={1} value={maxDb}
            onChange={(e) => setMaxDb(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Reduce sibilance
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
        Softens harsh &ldquo;s&rdquo; and &ldquo;sh&rdquo; sounds in the 5–9 kHz band. The band is only
        ducked while it dominates the signal, so cymbals in a full mix mostly
        pass; it works best on voice recordings.
      </p>
    </div>
  );
}
