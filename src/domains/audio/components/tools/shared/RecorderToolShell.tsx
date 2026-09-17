"use client";

/**
 * Shared scaffolding for recording tools (microphone or tab/system capture).
 *
 * Owns the whole recorder lifecycle — source request, MediaRecorder wiring,
 * elapsed timer, permission/denial error mapping, stop → build →
 * preview/download — so a recording tool is only its description and (if it
 * wants something other than a 16-bit WAV) a buildOutput hook.
 *
 * Display capture deliberately requests video as well: Chrome only offers
 * "share tab audio" when a video track is requested. The video track is
 * stopped immediately; the audio track keeps flowing.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MonitorSpeaker, Square, Loader2, Download, AlertTriangle } from "lucide-react";

import { decodeFileToChannels, encodeWav } from "@/domains/audio/lib/edit";
import { formatSeconds } from "@/domains/audio/components/tools/shared/EditToolShell";

export type RecorderSource = "mic" | "display";

export interface RecorderOutput {
  blob: Blob;
  /** One-line summary of what was produced (rendered above the player). */
  label: string;
  /** Download filename. */
  fileName: string;
}

export interface RecorderToolShellProps {
  source: RecorderSource;
  /**
   * Extra getUserMedia audio constraints for the mic path (e.g.
   * `{ deviceId: { exact: id } }` to pin a specific input). Ignored for
   * display capture. Default `{ audio: true }` picks the system default.
   */
  audioConstraints?: MediaTrackConstraints;
  /**
   * Build the deliverable from the raw recorded blob. Defaults to
   * decode → 16-bit WAV, which every recording tool here wants.
   */
  buildOutput?: (blob: Blob) => Promise<RecorderOutput>;
  /** Hint shown under the record button (e.g. what to pick in the dialog). */
  hint?: string;
  /** Download filename prefix (default "recording"). */
  filePrefix?: string;
}

type RecStage = "idle" | "requesting" | "recording" | "processing" | "done" | "error";

const defaultBuildOutput = async (
  blob: Blob,
  filePrefix: string,
): Promise<RecorderOutput> => {
  const file = new File([blob], "capture.webm", { type: blob.type || "audio/webm" });
  const decoded = await decodeFileToChannels(file);
  const wav = encodeWav(decoded.channels, decoded.sampleRate, decoded.length, 16);
  return {
    blob: wav,
    label: `${(decoded.length / decoded.sampleRate).toFixed(1)} s, ${
      decoded.channels.length === 1 ? "mono" : "stereo"
    }, ${decoded.sampleRate.toLocaleString()} Hz, converted to 16-bit WAV`,
    fileName: `${filePrefix}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.wav`,
  };
};

export default function RecorderToolShell({
  source,
  audioConstraints,
  buildOutput,
  hint,
  filePrefix = "recording",
}: RecorderToolShellProps) {
  const [stage, setStage] = useState<RecStage>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [output, setOutput] = useState<RecorderOutput | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const startRecording = useCallback(async () => {
    setStage("requesting");
    setErrorMsg("");
    try {
      const stream =
        source === "mic"
          ? await navigator.mediaDevices.getUserMedia({
              audio: audioConstraints ?? true,
            })
          : await navigator.mediaDevices.getDisplayMedia({
              audio: true,
              video: true,
            });
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach((t) => t.stop());
        setErrorMsg(
          source === "display"
            ? "No audio was shared — when the browser asks what to share, pick a tab and enable “Also share tab audio”."
            : "No audio track was available from the microphone.",
        );
        setStage("error");
        return;
      }
      if (source === "display") {
        // Free the video path immediately; audio keeps flowing on its own.
        stream.getVideoTracks().forEach((t) => t.stop());
      }
      streamRef.current = stream;

      // Record audio only, so the file never contains a stray video track.
      const audioOnly = new MediaStream(audioTracks);
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "";
      const recorder = mimeType
        ? new MediaRecorder(audioOnly, { mimeType })
        : new MediaRecorder(audioOnly);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        cleanup();
        setStage("processing");
        try {
          const raw = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          if (raw.size === 0) {
            setErrorMsg("The recording came back empty — try recording for a little longer.");
            setStage("error");
            return;
          }
          const built = await (buildOutput ?? defaultBuildOutput)(raw, filePrefix);
          if (downloadUrl) URL.revokeObjectURL(downloadUrl);
          setDownloadUrl(URL.createObjectURL(built.blob));
          setOutput(built);
          setStage("done");
        } catch (err) {
          console.error(err);
          setErrorMsg("Recording captured but could not be processed — try a shorter recording.");
          setStage("error");
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 0.1), 100);
      setStage("recording");
    } catch (err) {
      console.error(err);
      cleanup();
      const denied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "SecurityError");
      setErrorMsg(
        denied
          ? source === "mic"
            ? "Microphone permission was denied — allow mic access in the browser to record."
            : "Screen/tab capture was dismissed — pick a tab and allow audio sharing to record."
          : source === "display"
            ? "Tab audio capture is not available in this browser context."
            : "No microphone is available in this browser context.",
      );
      setStage("error");
    }
  }, [source, audioConstraints, buildOutput, filePrefix, downloadUrl, cleanup]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const busy = stage === "requesting" || stage === "processing";
  const SourceIcon = source === "mic" ? Mic : MonitorSpeaker;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {stage !== "recording" ? (
          <button
            type="button"
            onClick={() => void startRecording()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SourceIcon className="h-4 w-4" />}
            {stage === "requesting"
              ? source === "mic"
                ? "Requesting mic…"
                : "Waiting for picker…"
              : stage === "processing"
                ? "Processing…"
                : source === "mic"
                  ? "Start recording"
                  : "Pick a tab and record"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            <Square className="h-4 w-4" />
            Stop recording
          </button>
        )}
        {stage === "recording" && (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-destructive">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
            REC {formatSeconds(elapsed)}
          </span>
        )}
      </div>

      {hint && stage !== "done" && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

      {stage === "error" && (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMsg}
        </p>
      )}

      {stage === "done" && downloadUrl && output && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm text-foreground">Captured — {output.label}</p>
          <audio controls src={downloadUrl} className="w-full" />
          <a
            href={downloadUrl}
            download={output.fileName}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Everything stays on this device: the recording is captured, decoded and encoded entirely in
        your browser — nothing is uploaded anywhere.
      </p>
    </div>
  );
}
