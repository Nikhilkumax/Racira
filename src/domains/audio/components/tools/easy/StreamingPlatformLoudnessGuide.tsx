"use client";

/**
 * Streaming Platform Loudness Guide — static reference of platform loudness
 * targets and what happens on upload. Pure content, no processing; pairs with
 * the Loudness Meter and the LUFS Normalizer.
 */

const ROWS: { platform: string; target: string; notes: string }[] = [
  {
    platform: "Spotify",
    target: "−14 LUFS",
    notes: "Louder files are turned down; quieter files are NOT turned up (default). Loudness Window: 1 min + integrated.",
  },
  {
    platform: "YouTube",
    target: "−14 LUFS",
    notes: "Turned down to −14; measured with their own gate. Peaks beyond ~−1 dBTP can trigger additional limiting.",
  },
  {
    platform: "Apple Music",
    target: "−16 LUFS",
    notes: "Sound Check applies replay gain per track; −16 LUFS is the de-facto match. Encoded to AAC, so leave true-peak headroom.",
  },
  {
    platform: "Amazon Music",
    target: "−14 LUFS",
    notes: "Positive and negative gain both applied to hit −14 (unlike Spotify's down-only default).",
  },
  {
    platform: "Tidal",
    target: "−14 LUFS",
    notes: "Down-only normalization at −14 LUFS in the default streaming quality.",
  },
  {
    platform: "Deezer",
    target: "−15 LUFS",
    notes: "Down-only. Albums are normalized per-release on some tiers.",
  },
  {
    platform: "Podcast apps (Apple/Spotify)",
    target: "−16 LUFS stereo · −19 mono",
    notes: "Apple recommends −16 LUFS stereo / −19 LUFS mono, ≤ −1 dBTP. Most podcast hosts normalize on ingest.",
  },
  {
    platform: "Broadcast (EBU R128)",
    target: "−23 LUFS",
    notes: "European TV/radio standard: −23 LUFS ±0.5 LU, max true peak −1 dBTP. US ATSC A/85 uses −24 LKFS.",
  },
  {
    platform: "Club / DJ plays",
    target: "no normalization",
    notes: "Club systems and DJ software do not normalize — masters for club use keep loudness, watch headroom instead.",
  },
];

export default function StreamingPlatformLoudnessGuide() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Where each major platform sets its loudness target, and whether quiet files
        get turned up. Measure your file with the Loudness Meter, then use the
        Loudness Normalizer to hit a target exactly.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Behavior</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.platform} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium">{r.platform}</td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{r.target}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Targets are as published by the platforms and commonly measured; they change
        occasionally — check platform documentation before a final master delivery.
      </p>
    </div>
  );
}
