"use client";

/**
 * Microphone Recorder — record from any input device into a WAV, with an
 * explicit device picker. Pinning the chosen input is what separates this
 * from Voice Recorder: devices are enumerated here and handed to the shared
 * RecorderToolShell as exact deviceId constraints. Capture itself (mic →
 * MediaRecorder → decode → 16-bit WAV) is all shell.
 */

import { useEffect, useMemo, useState } from "react";
import { Mic } from "lucide-react";

import RecorderToolShell from "@/domains/audio/components/tools/shared/RecorderToolShell";

interface MicOption {
  deviceId: string;
  label: string;
}

export default function MicrophoneRecorder() {
  const [mics, setMics] = useState<MicOption[]>([]);
  const [deviceId, setDeviceId] = useState<string>("default");

  // Enumerate inputs; labels appear after any mic permission grant.
  useEffect(() => {
    let cancelled = false;
    const list = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        setMics(
          devices
            .filter((d) => d.kind === "audioinput")
            .map((d) => ({
              deviceId: d.deviceId,
              label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`,
            })),
        );
      } catch {
        /* enumeration is best-effort; the shell surfaces real errors */
      }
    };
    void list();
    navigator.mediaDevices?.addEventListener?.("devicechange", list);
    return () => {
      cancelled = true;
      navigator.mediaDevices?.removeEventListener?.("devicechange", list);
    };
  }, []);

  const constraints = useMemo<MediaTrackConstraints | undefined>(
    () => (deviceId === "default" ? undefined : { deviceId: { exact: deviceId } }),
    [deviceId],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
        <Mic className="size-4 text-primary" />
        <label className="text-xs font-medium text-muted-foreground" htmlFor="mic-device">
          Input device
        </label>
        <select
          id="mic-device"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          className="min-w-56 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
        >
          <option value="default">System default microphone</option>
          {mics
            .filter((m) => m.deviceId !== "default")
            .map((m) => (
              <option key={m.deviceId} value={m.deviceId}>
                {m.label}
              </option>
            ))}
        </select>
      </div>

      <RecorderToolShell
        source="mic"
        audioConstraints={constraints}
        filePrefix="microphone-recording"
        hint="Pick a device above, then record. Labels appear once you grant microphone access."
      />
    </div>
  );
}
