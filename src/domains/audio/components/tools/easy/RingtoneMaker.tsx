"use client";

/**
 * Ringtone Maker — pick any span of a file, cap it at ringtone length, add
 * fade-in/out (Node-verified edit primitives) and download a WAV ready to
 * convert for your phone. Start/end are picked on the waveform-free timeline
 * with two sliders and validated so start < end always.
 */

import { useMemo, useState } from "react";

import EditToolShell, { formatSeconds } from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { trimToSpan, applyFadeIn, applyFadeOut } from "@/domains/audio/lib/edit";

const MAX_SEC = 40;

export default function RingtoneMaker() {
  const [startSec, setStartSec] = useState(0);
  const [lengthSec, setLengthSec] = useState(30);
  const [fadeSec, setFadeSec] = useState(1.5);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const dur = length / sampleRate;
        const s = Math.max(0, Math.min(startSec, dur - 0.5));
        const len = Math.min(lengthSec, MAX_SEC, dur - s);
        const span = trimToSpan(channels, sampleRate, s, s + len);
        const flat = span.channels.map((ch) => ch.slice());
        const fadeSamples = Math.round(Math.min(fadeSec, len / 4) * sampleRate);
        applyFadeIn(flat, fadeSamples, "linear");
        applyFadeOut(flat, fadeSamples, "linear");
        setReport(
          `Ringtone: ${s.toFixed(1)} s → ${(s + len).toFixed(1)} s (${len.toFixed(1)} s, ≤ ${MAX_SEC} s) · ${fadeSec} s fades`,
        );
        return { channels: flat, sampleRate, length: flat[0].length };
      },
    [startSec, lengthSec, fadeSec],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="ringtone"
      maxChannels={2}
      footer={
        report ? (
          <p className="text-xs text-muted-foreground">
            {report} · convert the WAV to M4R (iPhone) or copy to the ringtones
            folder (Android) afterwards.
          </p>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Start at: {formatSeconds(startSec)}
          </span>
          <input
            type="range"
            min={0}
            max={600}
            step={1}
            value={startSec}
            onChange={(e) => setStartSec(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Length: {lengthSec} s (max {MAX_SEC} s)
          </span>
          <input
            type="range"
            min={5}
            max={40}
            step={1}
            value={lengthSec}
            onChange={(e) => setLengthSec(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Fades: {fadeSec} s
          </span>
          <input
            type="range"
            min={0}
            max={5}
            step={0.25}
            value={fadeSec}
            onChange={(e) => setFadeSec(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Ringtones loop on the phone, so the fades double as a soft loop point.
          The start slider covers the first 10 minutes of the file.
        </p>
      </div>
    </EditToolShell>
  );
}
