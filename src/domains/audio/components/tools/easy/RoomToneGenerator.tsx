"use client";

/**
 * Room Tone Generator — the "silence" a room actually has, for laying under
 * dialogue edits so cuts don't sound digital. Synthesis is generateRoomTone()
 * from generate.ts (Batch-18 Node-verified): mains hum + harmonics, one-pole
 * lowpassed air, very-deep rumble, with a seeded random-walk level wander so
 * the tone breathes instead of looping audibly.
 */

import { useCallback, useState } from "react";

import GeneratorToolShell from "@/domains/audio/components/tools/shared/GeneratorToolShell";
import { generateRoomTone, type Generated } from "@/domains/audio/lib/generate";

const ROOMS: { value: "apartment" | "house" | "studio" | "office"; label: string; hint: string }[] = [
  { value: "apartment", label: "Apartment", hint: "Noticeable 60 Hz hum + street rumble" },
  { value: "house", label: "House", hint: "Softer hum, deeper rumble" },
  { value: "studio", label: "Studio", hint: "Nearly silent air, faint 50 Hz" },
  { value: "office", label: "Office", hint: "HVAC hiss, wide stereo air" },
];

export default function RoomToneGenerator() {
  const [room, setRoom] = useState<"apartment" | "house" | "studio" | "office">("apartment");
  const [durationSec, setDurationSec] = useState(30);
  const [amplitudePct, setAmplitudePct] = useState(25);
  const [wanderPct, setWanderPct] = useState(35);
  const [seed, setSeed] = useState(12345);

  const generate = useCallback(
    (sampleRate: number): Generated =>
      generateRoomTone(sampleRate, {
        room,
        durationSec,
        amplitude: amplitudePct / 100,
        wander: wanderPct / 100,
        seed,
      }),
    [room, durationSec, amplitudePct, wanderPct, seed],
  );

  return (
    <GeneratorToolShell
      generate={generate}
      filePrefix="room-tone"
      renderInfo={(g) => (
        <p className="text-xs text-muted-foreground">
          {room} · {durationSec} s · seed {seed} · {g.channels.length === 2 ? "stereo" : "mono"}
        </p>
      )}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Room character</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ROOMS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRoom(opt.value)}
                className={
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
                  (room === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {opt.label}
                <span className="block text-[10px] font-normal opacity-80">{opt.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Duration (s)</span>
            <input
              type="number"
              min={1}
              max={600}
              step={1}
              value={durationSec}
              onChange={(e) => setDurationSec(Math.max(1, Math.min(600, Number(e.target.value) || 30)))}
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Seed</span>
            <input
              type="number"
              min={1}
              max={999999999}
              step={1}
              value={seed}
              onChange={(e) => setSeed(Math.max(1, Math.min(999999999, Math.round(Number(e.target.value) || 12345))))}
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Level ({amplitudePct}%)</span>
            <input
              type="range"
              min={1}
              max={100}
              value={amplitudePct}
              onChange={(e) => setAmplitudePct(Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Wander ({wanderPct}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={wanderPct}
              onChange={(e) => setWanderPct(Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </label>
        </div>

        <p className="text-xs text-muted-foreground">
          Loop it under edited dialogue, or crossfade it into pauses so room edits don&apos;t
          &ldquo;duck&rdquo;. Same seed + settings = identical file.
        </p>
      </div>
    </GeneratorToolShell>
  );
}
