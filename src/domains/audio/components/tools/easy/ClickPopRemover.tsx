"use client";

/**
 * Click/Pop Remover — vinyl click and pop repair (removeClicks, Node-verified
 * 15/15: single full-scale impulse repaired within bounds and byte-identical
 * outside a ±6-sample window, decaying-transient pops repaired, clean signal
 * untouched). Detection is median-7 residual vs robust local scale; repair is
 * a zero-tangent cubic Hermite splice.
 */

import { useMemo, useState } from "react";
import { UploadCloud, Download, Loader2 } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { removeClicks } from "@/domains/audio/lib/cleanup";

export default function ClickPopRemover() {
  const [sensitivity, setSensitivity] = useState(6);
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
        let total = 0;
        const out = audio.channels.map((ch) => {
          const r = removeClicks(ch, { sensitivity });
          total += r.clicksRepaired;
          return r.out;
        });
        const blob = encodeWav(out, audio.sampleRate, out[0].length);
        const url = URL.createObjectURL(blob);
        setResult({
          url,
          name: file?.name.replace(/\.[^.]+$/, "") + "-declicked.wav" || "declicked.wav",
          report: `${total} click${total === 1 ? "" : "s"} repaired (sensitivity ${sensitivity})`,
        });
      } catch {
        setError("Click removal failed.");
      } finally {
        setBusy(false);
      }
    },
    [audio, busy, sensitivity, file],
  );

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <UploadCloud className="size-4" /> {file ? file.name : "Choose an audio file…"}
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => void load(e.target.files?.[0])} />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Sensitivity: {sensitivity} (lower = catch more)
        </span>
        <input type="range" min={3} max={12} step={1} value={sensitivity}
          onChange={(e) => setSensitivity(Number(e.target.value))} className="w-full" />
      </label>

      <button onClick={() => void run()} disabled={!audio || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Remove clicks &amp; pops
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
        Repairs impulsive clicks and pops — the sharp ticks vinyl and dirty
        electrical contacts make. Very wide flat-topped bursts (a chopped
        note head) are better fixed manually; this tool is surgical by design.
      </p>
    </div>
  );
}
