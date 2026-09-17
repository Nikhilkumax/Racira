"use client";

/**
 * Sample Rate Reference — what the numbers mean (Nyquist), the common rates,
 * and when each is actually required. Pure reference table.
 */

import { useState } from "react";

interface Row {
  hz: number;
  name: string;
  nyquist: string;
  use: string;
}

const ROWS: Row[] = [
  { hz: 8000, name: "8 kHz", nyquist: "4 kHz", use: "Telephony (classic landline); speech only, no music" },
  { hz: 16000, name: "16 kHz", nyquist: "8 kHz", use: "Voice-over-IP, speech codecs, smart speakers" },
  { hz: 22050, name: "22.05 kHz", nyquist: "11 kHz", use: "Legacy low-bitrate audio; half of CD rate" },
  { hz: 32000, name: "32 kHz", nyquist: "16 kHz", use: "Broadcast contribution links (radio), DAT long-play" },
  { hz: 44100, name: "44.1 kHz", nyquist: "22.05 kHz", use: "CD audio, most music delivery, default for streaming" },
  { hz: 48000, name: "48 kHz", nyquist: "24 kHz", use: "Video/film production standard, professional recording" },
  { hz: 88200, name: "88.2 kHz", nyquist: "44.1 kHz", use: "2× CD rate; some mastering workflows" },
  { hz: 96000, name: "96 kHz", nyquist: "48 kHz", use: "Hi-res music production; smoother anti-alias filters" },
  { hz: 192000, name: "192 kHz", nyquist: "96 kHz", use: "Specialist measurement/mastering; no audible benefit in delivery" },
];

const FILTERS = ["All", "Speech", "Music", "Video", "Hi-res"] as const;

export default function SampleRateReference() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const rows = ROWS.filter((r) => {
    if (filter === "All") return true;
    if (filter === "Speech") return r.hz <= 32000;
    if (filter === "Music") return r.hz === 44100 || r.hz === 48000 || r.hz >= 88200;
    if (filter === "Video") return r.hz === 48000 || r.hz === 96000;
    return r.hz >= 88200;
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Sample rate</strong> is how many times per second the
          waveform is measured. The Nyquist theorem: to capture a frequency you need to sample at
          more than twice it — so 44.1 kHz captures everything up to 22.05 kHz, which covers the
          entire range of human hearing (roughly 20 Hz – 20 kHz).
        </p>
        <p>
          Higher rates don't add audible content; they mostly relax filter design in converters.
          44.1 kHz for music delivery and 48 kHz for video are the two rates that matter.
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
              <th className="px-3 py-2 text-left font-medium">Rate</th>
              <th className="px-3 py-2 text-left font-medium">Captures up to</th>
              <th className="px-3 py-2 text-left font-medium">Where it's used</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.hz} className="border-t border-border">
                <td className="px-3 py-2 font-mono font-semibold text-foreground">{r.name}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{r.nyquist}</td>
                <td className="px-3 py-2 text-foreground">{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
