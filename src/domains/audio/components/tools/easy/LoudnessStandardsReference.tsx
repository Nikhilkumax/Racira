"use client";

/**
 * Loudness Standards Reference — the delivery targets that actually matter
 * (streaming platforms, broadcast) and what LUFS/LRA/true peak mean. Pure
 * reference; pairs with the Loudness Meter and Normalizer tools.
 */

interface Row {
  platform: string;
  target: string;
  ceiling: string;
  notes: string;
}

const ROWS: Row[] = [
  { platform: "Spotify", target: "−14 LUFS", ceiling: "−1 dBTP", notes: "Quieter masters are left alone; louder ones are turned down — so slamming costs you dynamics for nothing." },
  { platform: "Apple Music", target: "−16 LUFS", ceiling: "−1 dBTP", notes: "Sound Check normalizes to this; stricter about True Peak overs." },
  { platform: "YouTube", target: "−14 LUFS", ceiling: "−1 dBTP", notes: "Same ballpark as Spotify; the limiting is gentle but real." },
  { platform: "Amazon Music", target: "−14 to −16 LUFS", ceiling: "−2 dBTP", notes: "Follows the pack; −2 dBTP ceiling on some tiers." },
  { platform: "Podcasts (general)", target: "−16 LUFS mono / −16 stereo", ceiling: "−1 dBTP", notes: "Apple Podcasts and most directories expect ≈−16 LUFS; speech needs it — music-only intros aside." },
  { platform: "EBU R128 (broadcast EU)", target: "−23 LUFS", ceiling: "−1 dBTP", notes: "The standard everything else is compared against; LRA 4–18." },
  { platform: "ATSC A/85 (broadcast US)", target: "−24 LKFS", ceiling: "−2 dBTP", notes: "LKFS ≡ LUFS for practical purposes (1 dB difference in anchoring)." },
];

export default function LoudnessStandardsReference() {
  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">LUFS</strong> (Loudness Units, Full Scale) measures
          perceived loudness over time, not peak level — that's why a wave that never clips can still
          be way too loud. <strong className="text-foreground">True Peak (dBTP)</strong> accounts for
          the overshoot that happens when a limited waveform is reconstructed by the DAC, which is
          why delivery ceilings sit at −1 to −2 dBTP even though the file's samples never exceed 0.
        </p>
        <p>
          Practical master: aim at the platform target, keep True Peak under the ceiling, and stop
          there — louder is not better when every platform turns you down anyway.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Platform / standard</th>
              <th className="px-3 py-2 text-left font-medium">Target</th>
              <th className="px-3 py-2 text-left font-medium">Max peak</th>
              <th className="px-3 py-2 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.platform} className="border-t border-border">
                <td className="px-3 py-2 font-semibold text-foreground">{r.platform}</td>
                <td className="px-3 py-2 font-mono text-foreground">{r.target}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{r.ceiling}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
