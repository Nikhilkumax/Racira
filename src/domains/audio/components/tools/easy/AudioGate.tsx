"use client";

/**
 * Audio Gate — noise gate with hysteresis + hold (gateChannel, Node-verified:
 * windowed RMS envelope, open/close thresholds, hold time, fade edges).
 * Everything below the close threshold is faded to true silence — reported as
 * an honest "gated %" of the file.
 */

import { useMemo, useState } from "react";

import EditToolShell from "@/domains/audio/components/tools/shared/EditToolShell";
import type { EditInput, EditOutput } from "@/domains/audio/components/tools/shared/EditToolShell";
import { gateChannel, peakOf, toDb } from "@/domains/audio/lib/dynamics";

export default function AudioGate() {
  const [openThresholdDb, setOpenThresholdDb] = useState(-40);
  const [closeThresholdDb, setCloseThresholdDb] = useState(-50);
  const [holdMs, setHoldMs] = useState(150);
  const [fadeMs, setFadeMs] = useState(10);
  const [report, setReport] = useState<string | null>(null);

  const transform = useMemo(
    () =>
      ({ channels, sampleRate, length }: EditInput): EditOutput => {
        let inPeak = 0;
        for (const ch of channels) inPeak = Math.max(inPeak, peakOf(ch));
        let gatedFraction = 0;
        const out = channels.map((ch) => {
          const r = gateChannel(
            ch,
            sampleRate,
            { openThresholdDb, closeThresholdDb, holdMs, fadeMs },
          );
          gatedFraction = Math.max(gatedFraction, r.gatedFraction);
          return r.data;
        });
        setReport(
          `Gate opens above ${openThresholdDb} dBFS, closes below ${closeThresholdDb} dBFS · ${(gatedFraction * 100).toFixed(1)}% gated · peak ${toDb(inPeak).toFixed(1)} dBFS`,
        );
        return { channels: out, sampleRate, length };
      },
    [openThresholdDb, closeThresholdDb, holdMs, fadeMs],
  );

  return (
    <EditToolShell
      transform={transform}
      outputSuffix="gated"
      maxChannels={2}
      footer={report ? <p className="text-xs text-muted-foreground">{report}</p> : undefined}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Open threshold: {openThresholdDb} dBFS
            </span>
            <input
              type="range"
              min={-60}
              max={-10}
              step={1}
              value={openThresholdDb}
              onChange={(e) => {
                const v = Number(e.target.value);
                setOpenThresholdDb(v);
                if (closeThresholdDb > v) setCloseThresholdDb(v);
              }}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Close threshold: {closeThresholdDb} dBFS
            </span>
            <input
              type="range"
              min={-70}
              max={-10}
              step={1}
              value={closeThresholdDb}
              onChange={(e) => {
                const v = Number(e.target.value);
                setCloseThresholdDb(v);
                if (openThresholdDb < v) setOpenThresholdDb(v);
              }}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Hold: {holdMs} ms
            </span>
            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={holdMs}
              onChange={(e) => setHoldMs(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Edge fade: {fadeMs} ms
            </span>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={fadeMs}
              onChange={(e) => setFadeMs(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          The close threshold sits below the open one (hysteresis) so signals near
          the line do not chatter the gate open and closed. Keep the fade a few ms
          to avoid clicks; raise hold so short words between breaths are not cut.
        </p>
      </div>
    </EditToolShell>
  );
}
