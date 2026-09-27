"use client";

/**
 * Song Recorder — full-song capture for practice/export: records the mic or
 * a line-in interface in stereo at 44.1/48 kHz with a 30-minute ceiling via
 * the shared shell. The honest scope: capture only — "instrument
 * separation" is post-processing (use Vocal Isolator / stem tools after the
 * take is on disk).
 */

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

const SONG_CONSTRAINTS: MediaTrackConstraints = {
  channelCount: { ideal: 2 },
  sampleRate: { ideal: 44100 },
  echoCancellation: false,
  autoGainControl: false,
};

export default function SongRecorder() {
  return (
    <div className="space-y-4">
      <RecorderToolShell
        source="mic"
        audioConstraints={SONG_CONSTRAINTS}
        filePrefix="song-take"
        maxDurationSec={1800}
        hint="Stereo capture at 44.1 kHz with echo cancellation and auto gain off — right for a phone playing backing while you play, an interface feed, or a room take. Auto-stops at 30 min."
      />
      <p className="text-xs text-muted-foreground">
        Need the instruments separated from a finished mix? Record or import
        the song, then run Vocal Isolator — separation is a processing step,
        not part of the recording.
      </p>
    </div>
  );
}
