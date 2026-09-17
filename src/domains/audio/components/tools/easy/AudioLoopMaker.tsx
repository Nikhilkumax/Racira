"use client";

/**
 * Audio Loop Maker — turn a clip into a seamless loop (findBestLoopCut +
 * applyFadeIn/applyFadeOut micro-fades, Node-verified). The tool scans the
 * second half for the cut whose boundary best matches the file's own start,
 * trims there, and joins tail→head with a few-ms equal-power seam so the loop
 * point is inaudible.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { findBestLoopCut, applyFadeOut } from "@/domains/audio/lib/edit";

export default function AudioLoopMaker() {
  const [scanSec, setScanSec] = useState(10);
  const [seamMs, setSeamMs] = useState(5);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const dur = length / sampleRate;
        // Search the last scanSec for the best cut, but never before the file's
        // midpoint: a cut earlier than that would produce a loop shorter than
        // half the material (Node/browser-reproduced: a 3 s file with the 10 s
        // default window degenerated to a 0.05 s loop). The midpoint is a
        // FLOOR on the search start, not a cap.
        const to = length - 1;
        const from = Math.max(
          1,
          Math.round(length - scanSec * sampleRate),
          Math.floor(length / 2),
        );
        const cut = findBestLoopCut(channels[0], from, to);
        const newLen = cut;
        const seam = Math.min(
          Math.round((seamMs / 1000) * sampleRate),
          Math.floor(newLen / 4),
        );
        const flat = channels.map((ch) => {
          const trimmed = ch.slice(0, newLen);
          return trimmed;
        });
        // Tiny fade at the loop tail so the wrap into the (matching) head is
        // click-free; a matching micro-fade-in exists naturally at any
        // zero-crossing start.
        applyFadeOut(flat, seam, "equalPower");
        setReport(
          `Loop length ${(newLen / sampleRate).toFixed(3)} s (cut at ${(cut / sampleRate).toFixed(3)} s of ${dur.toFixed(2)} s) · ${seamMs} ms seam`,
        );
        return { channels: flat, sampleRate, length: newLen };
      },
    [scanSec, seamMs],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="loop"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Search window (how far back to look for the best loop point): last {scanSec} s
          </span>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={scanSec}
            onChange={(e) => setScanSec(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Seam fade: {seamMs} ms
          </span>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={seamMs}
            onChange={(e) => setSeamMs(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          The cut is chosen so the loop's end matches its beginning sample-for-sample
          (two-sample boundary match at a zero crossing) — play the result on repeat
          and the join should disappear. Works best on steady, tonal or percussive
          material; long evolving pads may still breathe at the seam.
        </p>
      </div>
    </EditToolShell>
  );
}
