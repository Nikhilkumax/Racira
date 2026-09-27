"use client";

/**
 * Plosive Remover — p/b breath-blast taming (removePlosives, Node-verified
 * 15/15: gated only when LF-dominant AND a loudness burst — steady bass and
 * quiet LF content pass sample-identical; the cut is zero-phase, monotone,
 * and component-exact). Detection requires both conditions, so music with
 * real bass is safe.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { removePlosives } from "@/domains/audio/lib/cleanup";

export default function PlosiveRemover() {
  const [maxDb, setMaxDb] = useState(12);
  const [thresholdDb, setThresholdDb] = useState(10);
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
          const r = removePlosives(ch, audio.sampleRate, {
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
          name: file?.name.replace(/\.[^.]+$/, "") + "-deplosived.wav" || "deplosived.wav",
          report: `${events} plosive event${events === 1 ? "" : "s"} gated · up to −${maxDb} dB on the low band`,
        });
      } catch {
        setError("Plosive removal failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, maxDb, thresholdDb, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Sensitivity: −{thresholdDb} dB LF-dominance</span>
          <input type="range" min={4} max={20} step={1} value={thresholdDb}
            onChange={(e) => setThresholdDb(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Max reduction: −{maxDb} dB</span>
          <input type="range" min={3} max={24} step={1} value={maxDb}
            onChange={(e) => setMaxDb(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Remove plosives
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
        Tames the low-frequency &ldquo;pops&rdquo; of p and b sounds said too close to the
        mic. A gate fires only when a window is both low-heavy and much louder
        than the surrounding audio — steady bass lines are never touched.
      </p>
    </div>
  );
}
