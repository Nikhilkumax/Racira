"use client";

/**
 * Audio Bitrate Reference — what bitrate means, lossy vs lossless, and a
 * filterable table of common rates with honest use cases (not marketing
 * numbers). Pure reference; nothing is processed or uploaded.
 */

import { useMemo, useState } from "react";

interface Row {
  kbps: number;
  format: string;
  quality: string;
  use: string;
}

const ROWS: Row[] = [
  { kbps: 32, format: "MP3 / AAC", quality: "lowest acceptable", use: "Voice podcasts, AM-radio-like speech" },
  { kbps: 64, format: "MP3 / AAC", quality: "low", use: "Mono speech, audiobooks; audible highs lost" },
  { kbps: 96, format: "MP3", quality: "acceptable", use: "Spoken-word with music beds; casual listening" },
  { kbps: 128, format: "MP3 / AAC", quality: "decent", use: "Music for casual listening; first audible loss for critical ears" },
  { kbps: 160, format: "AAC", quality: "good", use: "AAC transparency territory for many listeners" },
  { kbps: 192, format: "MP3", quality: "good", use: "Most listeners can't distinguish from CD on MP3" },
  { kbps: 256, format: "MP3 / AAC", quality: "very good", use: "Music platforms' standard; effectively transparent" },
  { kbps: 320, format: "MP3", quality: "maximum lossy", use: "MP3's ceiling — beyond this, bits buy almost nothing" },
  { kbps: 1411, format: "WAV / CD", quality: "lossless", use: "CD audio: 16-bit × 44.1 kHz × 2 channels" },
  { kbps: 2304, format: "WAV 24/48", quality: "lossless", use: "24-bit × 48 kHz stereo — production and archiving" },
  { kbps: 4608, format: "WAV 24/96", quality: "lossless", use: "Hi-res studio masters; overkill for delivery" },
];

const FILTERS = ["All", "Speech", "Music", "Lossless"] as const;

export default function AudioBitrateReference() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const rows = useMemo(() => {
    if (filter === "All") return ROWS;
    if (filter === "Lossless") return ROWS.filter((r) => r.kbps >= 1000);
    if (filter === "Speech") return ROWS.filter((r) => r.kbps <= 96 || r.use.toLowerCase().includes("speech"));
    return ROWS.filter((r) => r.kbps >= 128);
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Bitrate</strong> is how many bits per second an audio
          stream consumes. Lossy codecs (MP3, AAC, Opus) throw away what psychoacoustics says you
          won't miss; lossless formats (WAV, FLAC, ALAC) keep everything at a fixed, much higher rate.
        </p>
        <p>
          Rule of thumb: speech is intelligible from 64 kbps, music wants 128–256 kbps, and anything
          above ~320 kbps lossy is indistinguishable from lossless for essentially all listeners and
          equipment.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-border p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                : "rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Bitrate</th>
              <th className="px-3 py-2 text-left font-medium">Format</th>
              <th className="px-3 py-2 text-left font-medium">Quality</th>
              <th className="px-3 py-2 text-left font-medium">Honest use case</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.kbps}-${r.format}`} className="border-t border-border">
                <td className="px-3 py-2 font-mono font-semibold text-foreground">
                  {r.kbps >= 1000 ? `${(r.kbps / 1000).toFixed(1)} Mbps` : `${r.kbps} kbps`}
                </td>
                <td className="px-3 py-2 text-foreground">{r.format}</td>
                <td className="px-3 py-2 text-foreground">{r.quality}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
