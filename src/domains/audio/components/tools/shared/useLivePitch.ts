"use client";

/**
 * Shared live-pitch engine for tuner tools.
 *
 * Owns the whole capture lifecycle — microphone request with music-friendly
 * constraints (all DSP: echo cancellation, noise suppression and AGC off,
 * they detune pitch), AudioContext → AnalyserNode wiring, the
 * requestAnimationFrame detection loop (estimateFundamental per frame), and
 * cleanup on stop/unmount. Consumers render from `reading` and call
 * start()/stop(); everything here is browser-only by design.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { estimateFundamental } from "@/domains/audio/lib/analyze";

export interface LivePitchState {
  /** Detected frequency in Hz; 0 while listening but no stable pitch. */
  hz: number;
  /** Detection confidence 0–1 from estimateFundamental. */
  confidence: number;
  /** true once the mic stream is live. */
  listening: boolean;
  /** Set when the mic request fails (permission denied, no device…). */
  error: string | null;
}

const INITIAL: LivePitchState = { hz: 0, confidence: 0, listening: false, error: null };

export function useLivePitch(minHz = 55, maxHz = 1000) {
  const [state, setState] = useState<LivePitchState>(INITIAL);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufRef = useRef<Float32Array | null>(null);

  const teardown = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    bufRef.current = null;
  }, []);

  useEffect(() => teardown, [teardown]);

  const stop = useCallback(() => {
    teardown();
    setState((s) => ({ ...s, listening: false, hz: 0, confidence: 0 }));
  }, [teardown]);

  const start = useCallback(async () => {
    if (ctxRef.current) return; // already running
    setState((s) => ({ ...s, error: null }));
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch {
      setState((s) => ({
        ...s,
        listening: false,
        error: "Microphone unavailable — allow mic access in the browser and make sure no other app is holding it.",
      }));
      return;
    }
    streamRef.current = stream;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const buf = new Float32Array(analyser.fftSize);
    bufRef.current = buf;
    const sampleRate = ctx.sampleRate;
    setState((s) => ({ ...s, listening: true }));

    const tick = () => {
      analyser.getFloatTimeDomainData(buf as Float32Array<ArrayBuffer>);
      // Signal floor: skip near-silent frames entirely (room noise would
      // otherwise produce wandering low-confidence readings).
      let energy = 0;
      for (let i = 0; i < buf.length; i += 4) energy += buf[i] * buf[i];
      if (energy / (buf.length / 4) > 1e-5) {
        const est = estimateFundamental(buf, sampleRate, minHz, maxHz, 1);
        if (est.confidence > 0.9) {
          setState((s) => (s.listening ? { ...s, hz: est.hz, confidence: est.confidence } : s));
        } else {
          setState((s) => (s.listening ? { ...s, hz: 0, confidence: est.confidence } : s));
        }
      } else {
        setState((s) => (s.listening ? { ...s, hz: 0, confidence: 0 } : s));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [minHz, maxHz]);

  return { ...state, start, stop };
}
