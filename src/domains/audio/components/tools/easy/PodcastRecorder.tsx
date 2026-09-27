"use client";

/**
 * Podcast Recorder — mic recording with live CHAPTER MARKERS and CUE-sheet
 * export (cueText, Node-verified 12/12: MM:SS:ff stamps at 75 fps, implicit
 * track 01, quoting/escaping, time ordering). Recording lifecycle comes from
 * the shared shell; this tool adds the chapter list UI and .cue download.
 */

import { useRef, useState } from "react";
import { Flag, Download } from "lucide-react";

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";
import { cueText, formatStamp, type Chapter } from "@/domains/audio/lib/recorder";

export default function PodcastRecorder() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const startRef = useRef<number>(0);

  const addChapter = () => {
    const name = window.prompt("Chapter name:", `Chapter ${chapters.length + 1}`);
    if (name === null) return;
    const t = startRef.current === 0 ? 0 : (Date.now() - startRef.current) / 1000;
    setChapters((c) => [...c, { t, name }]);
  };

  const downloadCue = () => {
    const cue = cueText("podcast-episode.wav", chapters);
    const blob = new Blob([cue], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "podcast-episode.cue";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addChapter}
          disabled={startRef.current === 0}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-40"
        >
          <Flag className="size-4" /> Drop chapter marker
        </button>
        {chapters.length > 0 && (
          <button
            type="button"
            onClick={downloadCue}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
          >
            <Download className="size-4" /> Export .cue ({chapters.length} chapters)
          </button>
        )}
      </div>

      {chapters.length > 0 && (
        <ol className="space-y-1 text-xs text-muted-foreground">
          {chapters.map((c, i) => (
            <li key={i}>
              <span className="font-mono">{formatStamp(c.t)}</span> — {c.name}
            </li>
          ))}
        </ol>
      )}

      <RecorderToolShell
        source="mic"
        filePrefix="podcast-episode"
        hint="Start recording, then drop chapter markers as you go. The .cue file references the downloaded WAV — most players and DAWs show the chapters."
        onRecordingStart={() => {
          // chapters reset the moment recording starts; markers timestamp
          // from here (buildOutput at stop would make later-take markers
          // relative to the previous take's stop — caught in browser verify)
          startRef.current = Date.now();
          setChapters([]);
        }}
        buildOutput={async (blob) => {
          // default build (decode → 16-bit WAV) is exactly what we want:
          const { decodeFileToChannels, encodeWav } = await import("@/domains/audio/lib/edit");
          const file = new File([blob], "capture.webm", { type: blob.type || "audio/webm" });
          const decoded = await decodeFileToChannels(file);
          const wav = encodeWav(decoded.channels, decoded.sampleRate, decoded.length, 16);
          return {
            blob: wav,
            label: `${(decoded.length / decoded.sampleRate).toFixed(1)} s episode, ${decoded.channels.length === 1 ? "mono" : "stereo"}, chapters reset for the next take`,
            fileName: `podcast-episode-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.wav`,
          };
        }}
      />
    </div>
  );
}
