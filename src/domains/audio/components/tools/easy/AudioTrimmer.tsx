"use client";

/**
 * Audio Trimmer — keep only the [start, end] span of a file (trimToSpan,
 * Node-verified). Numeric inputs with the file duration shown so you can
 * read the bounds off any player; a "to the end" shortcut leaves end open.
 * Processing is the shared EditToolShell (drop → decode → transform → WAV).
 */

import { useMemo, useState } from "react";

import EditToolShell, { formatSeconds, type EditInput, type EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { trimToSpan } from "@/domains/audio/lib/edit";

export default function AudioTrimmer() {
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState<number | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const r = trimToSpan(channels, sampleRate, startSec, endSec);
        return { channels: r.channels, sampleRate, length: r.length };
      },
    [startSec, endSec],
  );

  return (
    <EditToolShell transform={transform} outputSuffix="trimmed">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Keep from (seconds)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={startSec}
            onChange={(e) => setStartSec(Math.max(0, Number(e.target.value) || 0))}
            className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Keep until (seconds)</span>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={0.1}
              value={endSec ?? ""}
              placeholder="end of file"
              onChange={(e) => {
                const v = e.target.value === "" ? null : Math.max(0, Number(e.target.value));
                setEndSec(v);
              }}
              className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
            />
            {endSec !== null && (
              <button type="button" onClick={() => setEndSec(null)} className="shrink-0 text-xs text-muted-foreground underline">
                to end
              </button>
            )}
          </div>
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        Keeping {formatSeconds(startSec)} → {endSec === null ? "end" : formatSeconds(endSec)}
        {endSec !== null && endSec <= startSec && (
          <span className="ml-2 text-destructive">end must be after start</span>
        )}
      </p>
    </EditToolShell>
  );
}
