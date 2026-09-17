"use client";

/**
 * Tempo Changer — speed material up or down while pitch stays put
 * (olaTimeStretch, Node-verified WSOLA). Enter the original and target BPM,
 * or just use the percent slider; duration changes by the ratio, pitch does not.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { olaTimeStretch } from "@/domains/audio/lib/edit";

export default function TempoChanger() {
  const [bpmMode, setBpmMode] = useState(true);
  const [originalBpm, setOriginalBpm] = useState(120);
  const [targetBpm, setTargetBpm] = useState(124);
  const [percent, setPercent] = useState(100);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        const ratio = bpmMode ? targetBpm / Math.max(originalBpm, 1) : percent / 100;
        if (!Number.isFinite(ratio) || ratio <= 0) {
          setReport("Invalid tempo ratio — using 100%.");
          return { channels, sampleRate, length };
        }
        // Faster tempo = shorter duration = stretch factor 1/ratio.
        const out = channels.map((ch) => olaTimeStretch(ch, 1 / ratio));
        const newLen = out[0]?.length ?? 0;
        setReport(
          `Tempo ×${ratio.toFixed(3)} (${bpmMode ? `${originalBpm} → ${targetBpm} BPM` : `${percent}%`}) · ${(length / sampleRate).toFixed(2)} s → ${(newLen / sampleRate).toFixed(2)} s · pitch preserved`,
        );
        return { channels: out, sampleRate, length: newLen };
      },
    [bpmMode, originalBpm, targetBpm, percent],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="tempo"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBpmMode(true)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${bpmMode ? "border-primary bg-primary/10 font-medium" : "border-border"}`}
          >
            By BPM
          </button>
          <button
            type="button"
            onClick={() => setBpmMode(false)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${!bpmMode ? "border-primary bg-primary/10 font-medium" : "border-border"}`}
          >
            By percent
          </button>
        </div>
        {bpmMode ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Original BPM</span>
              <input
                type="number"
                min={20}
                max={400}
                value={originalBpm}
                onChange={(e) => setOriginalBpm(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Target BPM</span>
              <input
                type="number"
                min={20}
                max={400}
                value={targetBpm}
                onChange={(e) => setTargetBpm(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>
        ) : (
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Speed: {percent}% ({percent > 100 ? "faster" : percent < 100 ? "slower" : "unchanged"})
            </span>
            <input
              type="range"
              min={50}
              max={200}
              step={1}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full"
            />
          </label>
        )}
        <p className="text-xs text-muted-foreground">
          WSOLA stretches time in overlapping grains while matching waveform
          continuity, so pitch and timbre survive. Works best in the ±15% range;
          extreme changes start to smear transients.
        </p>
      </div>
    </EditToolShell>
  );
}
