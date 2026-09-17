"use client";

/**
 * Audio Cutter — remove one or more time ranges from a file (cutSpans,
 * Node-verified: overlapping/unsorted spans are merged before the single
 * pass). The classic "cut out the bad bit" tool: add a span per section to
 * remove, with the removed total shown before you process.
 */

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import EditToolShell, { type EditInput, type EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { cutSpans } from "@/domains/audio/lib/edit";

interface Span {
  id: number;
  start: number;
  end: number;
}

let nextId = 1;

export default function AudioCutter() {
  const [spans, setSpans] = useState<Span[]>([{ id: 0, start: 0, end: 0 }]);

  const totalRemoved = useMemo(
    () => spans.reduce((acc, s) => acc + Math.max(0, s.end - s.start), 0),
    [spans],
  );

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const valid = spans.filter((s) => s.end > s.start);
        const r = cutSpans(
          channels,
          sampleRate,
          valid.map((s) => ({ start: s.start, end: s.end })),
        );
        return { channels: r.channels, sampleRate, length: r.length };
      },
    [spans],
  );

  const update = (id: number, patch: Partial<Span>) =>
    setSpans((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <EditToolShell transform={transform} outputSuffix="cut">
      <div className="space-y-2">
        {spans.map((s, i) => (
          <div key={s.id} className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-xs font-medium text-muted-foreground">Cut #{i + 1}</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={s.start}
              onChange={(e) => update(s.id, { start: Math.max(0, Number(e.target.value) || 0) })}
              className="w-24 rounded-lg border border-border bg-background p-2 text-sm text-foreground"
              aria-label={`Cut ${i + 1} start (seconds)`}
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={s.end}
              onChange={(e) => update(s.id, { end: Math.max(0, Number(e.target.value) || 0) })}
              className="w-24 rounded-lg border border-border bg-background p-2 text-sm text-foreground"
              aria-label={`Cut ${i + 1} end (seconds)`}
            />
            <span className="text-xs text-muted-foreground">seconds</span>
            {spans.length > 1 && (
              <button
                type="button"
                onClick={() => setSpans((ss) => ss.filter((x) => x.id !== s.id))}
                className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                aria-label={`Remove cut ${i + 1}`}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSpans((ss) => [...ss, { id: nextId++, start: 0, end: 0 }])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40"
          >
            <Plus className="size-3.5" /> Add another cut
          </button>
          <span className="text-xs text-muted-foreground">
            removes {totalRemoved.toFixed(1)} s total{spans.length > 1 && " (overlaps merged)"}
          </span>
        </div>
      </div>
    </EditToolShell>
  );
}
