"use client";

/**
 * Codec Compatibility Reference — which codecs play where, lossy vs lossless
 * at a glance, and what to pick for delivery. Pure reference matrix.
 */

interface Row {
  codec: string;
  type: "Lossy" | "Lossless";
  browsers: string;
  apple: string;
  notes: string;
}

const ROWS: Row[] = [
  {
    codec: "MP3",
    type: "Lossy",
    browsers: "Everywhere",
    apple: "Everywhere",
    notes: "The universal fallback. Big files for the quality; patent-free since 2017.",
  },
  {
    codec: "AAC (m4a)",
    type: "Lossy",
    browsers: "Everywhere",
    apple: "Native (iTunes/Apple Music)",
    notes: "Better quality than MP3 at the same bitrate; the default for Apple and YouTube.",
  },
  {
    codec: "Opus",
    type: "Lossy",
    browsers: "Chrome/Firefox/Edge",
    apple: "Safari 17+ only",
    notes: "Best quality per bit, especially speech; inside WebM and WhatsApp calls. Safari support finally landed in 2023.",
  },
  {
    codec: "Ogg Vorbis",
    type: "Lossy",
    browsers: "Chrome/Firefox/Edge",
    apple: "No native support",
    notes: "Opus's predecessor; still in game engines. Avoid for new web delivery.",
  },
  {
    codec: "FLAC",
    type: "Lossless",
    browsers: "Everywhere (incl. Safari 11+)",
    apple: "Native since iOS 11",
    notes: "Compressed lossless — archives and audiophile delivery without WAV's bulk.",
  },
  {
    codec: "ALAC (m4a)",
    type: "Lossless",
    browsers: "Safari; others via MSE",
    apple: "Native (Apple ecosystem)",
    notes: "Apple's FLAC equivalent; pick it only for iTunes/Apple Music pipelines.",
  },
  {
    codec: "WAV (PCM)",
    type: "Lossless",
    browsers: "Everywhere",
    apple: "Everywhere",
    notes: "Raw samples, no compression — huge files, zero decode cost. Production standard.",
  },
  {
    codec: "WMA",
    type: "Lossy",
    browsers: "No",
    apple: "No",
    notes: "Legacy Windows format. Convert before delivering anywhere modern.",
  },
];

export default function CodecCompatibilityReference() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Where each codec plays natively in 2026. “Delivery” advice: <strong className="text-foreground">AAC</strong>{" "}
        for maximum reach at good quality, <strong className="text-foreground">MP3</strong> when you must support
        ancient hardware, <strong className="text-foreground">Opus</strong> for the best speech quality in
        Chromium-only contexts, <strong className="text-foreground">FLAC</strong> for lossless.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Codec</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Browsers</th>
              <th className="px-3 py-2 text-left font-medium">Apple</th>
              <th className="px-3 py-2 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.codec} className="border-t border-border">
                <td className="px-3 py-2 font-semibold text-foreground">{r.codec}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      r.type === "Lossless"
                        ? "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {r.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-foreground">{r.browsers}</td>
                <td className="px-3 py-2 text-foreground">{r.apple}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
