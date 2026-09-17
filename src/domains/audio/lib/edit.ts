/**
 * Pure sample-level DSP helpers for the Easy-tier edit tools.
 *
 * Nothing in this file may touch the Web Audio API, `window` or the DOM at
 * module level, and every function must be deterministic — that is what lets
 * the Node verification scripts (scratch/test-batch1.mjs) exercise the exact
 * same code the browser components run. The only browser-only export is
 * decodeFileToChannels(), which is imported by components but never by tests.
 *
 * All functions take/return plain Float32Array channel data ([-1, 1] range),
 * matching what decodeAudioData hands out.
 */

import type { PcmSource } from "./wav";
import { audioBufferToWav } from "./wav";

// ---------------------------------------------------------------------------
// Decoded-audio plumbing
// ---------------------------------------------------------------------------

/** Channel-interleaved-agnostic view of a decoded file. */
export interface DecodedAudio {
  channels: Float32Array[];
  sampleRate: number;
  /** Length in sample frames (per channel). */
  length: number;
}

/** Adapt plain channel arrays to the PcmSource the WAV writers accept. */
export function pcmSourceFromChannels(
  channels: Float32Array[],
  sampleRate: number,
  length: number,
): PcmSource {
  return {
    numberOfChannels: channels.length,
    sampleRate,
    length,
    getChannelData: (channel: number) => channels[channel],
  };
}

/** Encode channel data as a 16- or 24-bit WAV, reusing the existing writer. */
export function encodeWav(
  channels: Float32Array[],
  sampleRate: number,
  length: number,
  bitDepth: 16 | 24 = 16,
): Blob {
  return audioBufferToWav(pcmSourceFromChannels(channels, sampleRate, length), bitDepth);
}

/**
 * Decode a File to raw channels. Browser-only (uses decodeAudioData); the
 * AudioBuffer's channel arrays stay valid after the context is closed because
 * the underlying ArrayBuffer we own was sliced before decoding.
 */
export async function decodeFileToChannels(file: File): Promise<DecodedAudio> {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const buffer = await ctx.decodeAudioData((await file.arrayBuffer()).slice(0));
    return {
      sampleRate: buffer.sampleRate,
      length: buffer.length,
      channels: Array.from({ length: buffer.numberOfChannels }, (_, c) =>
        buffer.getChannelData(c),
      ),
    };
  } finally {
    void ctx.close();
  }
}

/** Filename without its extension — shared output naming for edit tools. */
export function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

// ---------------------------------------------------------------------------
// Reversing
// ---------------------------------------------------------------------------

/** Reverse each channel independently (same length, mirrored samples). */
export function reverseChannelData(channels: Float32Array[]): Float32Array[] {
  return channels.map((ch) => {
    const out = new Float32Array(ch.length);
    for (let i = 0, j = ch.length - 1; i < ch.length; i++, j--) out[i] = ch[j];
    return out;
  });
}

// ---------------------------------------------------------------------------
// Gain / boost
// ---------------------------------------------------------------------------

export interface GainResult {
  out: Float32Array;
  /** Samples that hit ±1 and were clamped. */
  clippedSamples: number;
  peakBefore: number;
  peakAfter: number;
}

/** Multiply by a dB gain, hard-clamping to [-1, 1] and counting clipped samples. */
export function applyGainDb(data: Float32Array, db: number): GainResult {
  const linear = Math.pow(10, db / 20);
  return applyLinearGain(data, linear);
}

export function applyLinearGain(data: Float32Array, linear: number): GainResult {
  const out = new Float32Array(data.length);
  let clipped = 0;
  let peakBefore = 0;
  let peakAfter = 0;
  for (let i = 0; i < data.length; i++) {
    const s = data[i];
    const a = Math.abs(s);
    if (a > peakBefore) peakBefore = a;
    let v = s * linear;
    if (v > 1) {
      v = 1;
      clipped++;
    } else if (v < -1) {
      v = -1;
      clipped++;
    }
    const av = Math.abs(v);
    if (av > peakAfter) peakAfter = av;
    out[i] = v;
  }
  return { out, clippedSamples: clipped, peakBefore, peakAfter };
}

/**
 * Boost with a tanh soft-clip limiter: everything passes through tanh(x·gain),
 * which compresses peaks smoothly instead of squaring them off. Peak math is
 * verifiable: output can approach ±1 but never exceed it.
 */
export function applyBoostWithLimiter(
  data: Float32Array,
  linearGain: number,
  limiter: boolean,
): GainResult {
  if (!limiter) return applyLinearGain(data, linearGain);
  const out = new Float32Array(data.length);
  let peakAfter = 0;
  for (let i = 0; i < data.length; i++) {
    const v = Math.tanh(data[i] * linearGain);
    const av = Math.abs(v);
    if (av > peakAfter) peakAfter = av;
    out[i] = v;
  }
  return { out, clippedSamples: 0, peakBefore: 1, peakAfter };
}

// ---------------------------------------------------------------------------
// Speed change
// ---------------------------------------------------------------------------

/**
 * Tape-style resample by a duration multiplier (`factor`): output length is
 * ceil(len / factor)... expressed directly — output frame k reads input at
 * k·factor with linear interpolation. factor < 1 speeds playback up (and
 * raises pitch by 1/factor); factor > 1 slows it down.
 */
export function resampleLinear(data: Float32Array, factor: number): Float32Array {
  if (factor <= 0 || !Number.isFinite(factor)) throw new Error("factor must be positive");
  if (factor === 1) return data.slice();
  const outLen = Math.max(1, Math.ceil(data.length / factor));
  const out = new Float32Array(outLen);
  for (let k = 0; k < outLen; k++) {
    const pos = k * factor;
    const i = Math.floor(pos);
    const frac = pos - i;
    const a = data[Math.min(i, data.length - 1)];
    const b = data[Math.min(i + 1, data.length - 1)];
    out[k] = a + (b - a) * frac;
  }
  return out;
}

/**
 * WSOLA-style time stretch by a duration multiplier (`stretch` > 1 lengthens,
 * < 1 shortens) without changing pitch.
 *
 * Plain overlap-add misaligns waveform periods between overlapping grains,
 * which comb-filters tonal material into a phasey mess (caught by the Batch 1
 * verification: a 440 Hz sine came out with junk zero-crossing structure).
 * This version searches a small lag per grain so each new grain's onset best
 * matches the tail already written — classic WSOLA without the tolerance
 * scaling tricks. Pure math, deterministic, no allocation in the search loop.
 *
 * Cost: grains = len/Ha, each searching (2·tol+1) lags × 256-sample
 * correlation — about a second of CPU per minute of audio at 44.1 kHz.
 */
export function olaTimeStretch(data: Float32Array, stretch: number): Float32Array {
  if (!Number.isFinite(stretch) || stretch <= 0) throw new Error("stretch must be positive");
  if (stretch === 1) return data.slice();

  const winLen = 2048;
  const analysisHop = 512;
  // The hop ratio is the stretch factor: each grain consumes Ha input samples
  // and produces Hs output samples, so duration scales by Hs/Ha. An inverted
  // ratio here shrinks the audio and leaves the rest of the output silent
  // (caught by the envelope check in the Batch 1 verification).
  const synthesisHop = Math.max(1, Math.round(analysisHop * stretch));
  const outLen = Math.max(1, Math.ceil(data.length * stretch));
  // Slack between the ideal and synthesised timelines — the search range.
  const tolerance = Math.min(512, Math.abs(analysisHop - synthesisHop));
  const corrLen = 256; // onset correlation length

  const win = new Float32Array(winLen);
  for (let i = 0; i < winLen; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / winLen);

  const out = new Float32Array(outLen + winLen);
  const norm = new Float32Array(outLen + winLen);

  let idealRead = 0;
  let writePos = 0;
  let lag = 0;

  while (writePos < outLen) {
    // Pick the lag whose grain onset best continues what is already written.
    if (tolerance > 0 && writePos > corrLen) {
      let bestScore = -Infinity;
      let bestLag = 0;
      for (let l = -tolerance; l <= tolerance; l++) {
        const readStart = idealRead + l;
        if (readStart < 0 || readStart + corrLen >= data.length) continue;
        let score = 0;
        for (let i = 0; i < corrLen; i++) {
          score += data[readStart + i] * out[writePos + i];
        }
        if (score > bestScore) {
          bestScore = score;
          bestLag = l;
        }
      }
      lag = bestLag;
    } else {
      lag = 0;
    }

    // Clamp reads to the input: the final grains past the source repeat the
    // last samples under their window envelope instead of leaving dead air.
    const readStart = Math.max(0, Math.min(idealRead + lag, data.length - 1));
    for (let i = 0; i < winLen; i++) {
      const r = Math.min(readStart + i, data.length - 1);
      const w = writePos + i;
      out[w] += data[r] * win[i];
      norm[w] += win[i];
    }

    idealRead += analysisHop;
    writePos += synthesisHop;
  }

  for (let i = 0; i < outLen; i++) {
    if (norm[i] > 1e-6) out[i] /= norm[i];
  }
  return out.slice(0, outLen);
}

// ---------------------------------------------------------------------------
// Silence detection / removal
// ---------------------------------------------------------------------------

export interface SilenceOptions {
  /** Frames whose peak stays below this dB level count as silent. */
  thresholdDb: number;
  /** A silence must run at least this long to be removed. */
  minSilenceMs: number;
}

export interface SilenceSpan {
  /** Inclusive start sample. */
  startSample: number;
  /** Exclusive end sample. */
  endSample: number;
}

/**
 * Find silent spans by scanning 20 ms frames and keeping runs whose peak stays
 * under the threshold for at least minSilenceMs. Deterministic, single pass.
 */
export function detectSilenceSpans(
  data: Float32Array,
  sampleRate: number,
  opts: SilenceOptions,
): SilenceSpan[] {
  const frame = Math.max(1, Math.round(sampleRate * 0.02));
  const threshold = Math.pow(10, opts.thresholdDb / 20);
  const minFrames = Math.max(1, Math.ceil(opts.minSilenceMs / 20));

  const spans: SilenceSpan[] = [];
  let runStart = -1;
  let runFrames = 0;

  for (let f = 0; f < data.length; f += frame) {
    const end = Math.min(data.length, f + frame);
    let peak = 0;
    for (let i = f; i < end; i++) {
      const a = Math.abs(data[i]);
      if (a > peak) peak = a;
    }
    if (peak < threshold) {
      if (runStart < 0) runStart = f;
      runFrames++;
    } else {
      if (runFrames >= minFrames) spans.push({ startSample: runStart, endSample: f });
      runStart = -1;
      runFrames = 0;
    }
  }
  if (runFrames >= minFrames) spans.push({ startSample: runStart, endSample: data.length });

  return spans;
}

/**
 * Remove the given spans, keeping `padSamples` of the silence on each side of
 * every cut so transitions don't click.
 */
export function removeSilenceSpans(
  data: Float32Array,
  spans: SilenceSpan[],
  padSamples: number,
): { out: Float32Array; removedSamples: number; cuts: number } {
  if (spans.length === 0) return { out: data.slice(), removedSamples: 0, cuts: 0 };

  const segments: Array<[number, number]> = [];
  let cursor = 0;
  let removed = 0;
  for (const span of spans) {
    const cutStart = Math.min(data.length, span.startSample + padSamples);
    const cutEnd = Math.min(data.length, Math.max(cutStart, span.endSample - padSamples));
    if (cutEnd > cutStart) {
      segments.push([cursor, cutStart]);
      removed += cutEnd - cutStart;
      cursor = cutEnd;
    }
  }
  segments.push([cursor, data.length]);

  const kept = data.length - removed;
  const out = new Float32Array(kept);
  let write = 0;
  for (const [from, to] of segments) {
    out.set(data.subarray(from, to), write);
    write += to - from;
  }
  return { out, removedSamples: removed, cuts: segments.length - 1 };
}

/** Apply one edit to every channel, preserving channel count. */
export function mapChannels(
  channels: Float32Array[],
  fn: (ch: Float32Array) => Float32Array,
): Float32Array[] {
  return channels.map(fn);
}

// ---------------------------------------------------------------------------
// Modulation / delay / shape effects (batch 2)
// ---------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Feedback echo: out[i] = dry[i] + mix·e[i] where the echo line e recurses as
 * e[i] = dry[i-d] + feedback·e[i-d]. An impulse input therefore produces taps
 * at every multiple of the delay with amplitudes mix, mix·fb, mix·fb², … —
 * the geometric sequence the verification script asserts exactly.
 * Output length equals input length (the tail past the end is not folded back;
 * the final echoes fall off the end exactly as a hardware delay line would).
 */
export interface EchoOptions {
  delayMs: number;
  /** Feedback per repeat, 0–0.95. */
  feedback: number;
  /** Wet mix of the echo line, 0–1. */
  mix: number;
}

export function applyEcho(
  data: Float32Array,
  sampleRate: number,
  opts: EchoOptions,
): Float32Array {
  const delaySamples = Math.max(1, Math.round((opts.delayMs / 1000) * sampleRate));
  const fb = clamp(opts.feedback, 0, 0.95);
  const mix = clamp(opts.mix, 0, 1);
  const echo = new Float32Array(data.length);
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    echo[i] = i >= delaySamples ? data[i - delaySamples] + fb * echo[i - delaySamples] : 0;
    // The summed signal can exceed ±1 on loud input; clamp like the gain path.
    let v = data[i] + mix * echo[i];
    if (v > 1) v = 1;
    else if (v < -1) v = -1;
    out[i] = v;
  }
  return out;
}

/**
 * Tremolo: periodic amplitude modulation. The LFO is a raised-cosine, so the
 * gain swings between 1-depth and 1 at rate·(len/sampleRate) full cycles over
 * the file — deterministic and hand-checkable at any sample index.
 */
export function applyTremolo(
  data: Float32Array,
  sampleRate: number,
  rateHz: number,
  depth: number,
): Float32Array {
  const d = clamp(depth, 0, 1);
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const lfo = 0.5 - 0.5 * Math.cos((2 * Math.PI * rateHz * i) / sampleRate);
    out[i] = data[i] * (1 - d + d * lfo);
  }
  return out;
}

/**
 * Vibrato: pitch modulation through a delay line whose length oscillates.
 *
 * Output sample k reads the input at position k − delay(k) with linear
 * interpolation, delay(k) = D0 + Dm·sin(2π·rate·k/sr). Local playback ratio is
 * 1 − Dm·ω·cos(ωk) (ω = 2π·rate/sr), so pitch swings by ±Dm·ω; Dm is derived
 * exactly from the requested depth: Dm = (2^(cents/1200) − 1)·sr/(2π·rate).
 *
 * The first D0 samples are skipped and the last D0+Dm input samples cannot be
 * read, so output length is len − ceil(D0 + Dm) — the honest cost of a delay
 * line, matching what hardware vibrato units do.
 */
export interface VibratoOptions {
  rateHz: number;
  depthCents: number;
}

export function applyVibrato(
  data: Float32Array,
  sampleRate: number,
  opts: VibratoOptions,
): Float32Array {
  const rate = Math.max(0.01, opts.rateHz);
  const cents = clamp(opts.depthCents, 0, 1200);
  const omega = (2 * Math.PI * rate) / sampleRate;
  // Max modulation so the peak pitch ratio hits 2^(cents/1200) exactly.
  const dm = (Math.pow(2, cents / 1200) - 1) / omega;
  const d0 = Math.ceil(dm) + 2; // headroom keeps every read position ≥ 0
  const outLen = Math.max(1, data.length - d0 - Math.ceil(dm));
  const out = new Float32Array(outLen);
  for (let k = 0; k < outLen; k++) {
    const delay = d0 + dm * Math.sin((2 * Math.PI * rate * k) / sampleRate);
    const pos = k - delay;
    const i = Math.floor(pos);
    const frac = pos - i;
    const a = data[Math.max(0, Math.min(i, data.length - 1))];
    const b = data[Math.max(0, Math.min(i + 1, data.length - 1))];
    out[k] = a + (b - a) * frac;
  }
  return out;
}

/**
 * Distortion by tanh waveshaping: out = tanh(k·x)/tanh(k).
 *
 * Properties the verification asserts: f(±1) = ±1 (full scale maps to full
 * scale), f(−x) = −f(x) (odd symmetry — no DC offset), strictly increasing
 * (no hard-clip flat tops), small-signal gain k/tanh(k), and high drive
 * converging to a sign function — the 3rd harmonic approaches the square-wave
 * ratio f3/f0 → 1/3 (measured 0.332 at drive 25).
 */
export function applyDistortion(data: Float32Array, drive: number): Float32Array {
  const k = clamp(drive, 1, 50);
  const norm = Math.tanh(k);
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = Math.tanh(k * data[i]) / norm;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Ring modulation and channel geometry (batch 3)
// ---------------------------------------------------------------------------

/**
 * Ring modulation: out = x · cos(2π·f·t + φ). An input impulse at sample s
 * produces a cosine at frequency f starting at s — the exact sampled values
 * the verification asserts (hand-computed cosines, no tolerance > 1e-9).
 */
export function applyRingModulation(
  data: Float32Array,
  sampleRate: number,
  freqHz: number,
  phaseDeg: number,
): Float32Array {
  const phase = (phaseDeg * Math.PI) / 180;
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] * Math.cos((2 * Math.PI * freqHz * i) / sampleRate + phase);
  }
  return out;
}

/**
 * Stereo widening by M/S width scaling: M = (L+R)/2, S = (L−R)/2, then
 * outL = M + w·S, outR = M − w·S.
 *
 * w = 1 is exact identity; w > 1 widens; w < 1 narrows toward mono; w = 0 is
 * exact mono fold. Out-of-phase content (S-dominant) grows beyond ±1 at
 * w > 1 — the caller may want a limiter, so the result also reports the
 * absolute peak so the UI can surface it honestly.
 */
export interface WidenerOptions {
  /** Width multiplier: 1 = unchanged, 0 = mono, > 1 = extra wide. */
  width: number;
}

export function applyStereoWidener(
  left: Float32Array,
  right: Float32Array,
  opts: WidenerOptions,
): { left: Float32Array; right: Float32Array; peak: number } {
  const w = clamp(opts.width, 0, 4);
  const n = Math.min(left.length, right.length);
  const outL = new Float32Array(n);
  const outR = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const m = (left[i] + right[i]) / 2;
    const s = (left[i] - right[i]) / 2;
    outL[i] = m + w * s;
    outR[i] = m - w * s;
    // Track the peak from the STORED samples: Float32Array rounding can nudge
    // a value up to half an ulp above its f64 pre-storage value, and the
    // reported peak must equal what the file actually contains.
    peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
  }
  return { left: outL, right: outR, peak };
}

/** Duplicate a mono channel to identical L/R (mono stays centered). */
export function monoToStereo(mono: Float32Array): [Float32Array, Float32Array] {
  return [mono.slice(), mono.slice()];
}

/**
 * Fold L/R to a single channel by exact (L+R)/2 — the ITU downmix. Levels of
 * correlated content drop 6 dB; identical L/R content returns the source
 * waveform exactly (asserted in verification).
 */
export function stereoToMono(left: Float32Array, right: Float32Array): Float32Array {
  const n = Math.max(left.length, right.length);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = (left[i] + right[i]) / 2;
  }
  return out;
}

/**
 * Mid/Side (M/S) encode — the first half of the reversible M/S transform:
 *   M = (L + R)/2,  S = (L − R)/2
 * decodeMidSide (below) inverts it; the sample-exact round-trip is proven in
 * the batch-4 verification suite.
 */
export function encodeMidSide(
  left: Float32Array,
  right: Float32Array,
): { mid: Float32Array; side: Float32Array } {
  const n = Math.max(left.length, right.length);
  const mid = new Float32Array(n);
  const side = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    mid[i] = (left[i] + right[i]) / 2;
    side[i] = (left[i] - right[i]) / 2;
  }
  return { mid, side };
}

/**
 * Mid/Side decode — the inverse of encodeMidSide: L = M + S, R = M − S.
 * encode∘decode round-trips an asymmetric stereo file exactly (float32
 * storage rounding only) — asserted in the verification suite.
 */
export function decodeMidSide(
  mid: Float32Array,
  side: Float32Array,
): [Float32Array, Float32Array] {
  const n = Math.max(mid.length, side.length);
  const left = new Float32Array(n);
  const right = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    left[i] = mid[i] + side[i];
    right[i] = mid[i] - side[i];
  }
  return [left, right];
}

// ---------------------------------------------------------------------------
// RBJ biquad filters (batch 4) — Audio EQ Cookbook formulas, implemented in
// pure TS so they are Node-testable sample-exactly. The WebAudio BiquadFilter
// node computes the same recursion; the lib is used so results are
// deterministic and verifiable offline.
// ---------------------------------------------------------------------------

export interface BiquadCoeffs {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

/**
 * RBJ peaking EQ (cookbook "PEQ" case, A = 10^(gainDb/40)).
 */
export function peakingCoeffs(
  sampleRate: number,
  freqHz: number,
  q: number,
  gainDb: number,
): BiquadCoeffs {
  const A = Math.pow(10, gainDb / 40);
  const w0 = (2 * Math.PI * freqHz) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const cos0 = Math.cos(w0);
  const b0 = 1 + alpha * A;
  const b1 = -2 * cos0;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: (-2 * cos0) / a0, a2: (1 - alpha / A) / a0 };
}

/**
 * RBJ lowpass (12 dB/oct second-order).
 */
export function lowpassCoeffs(sampleRate: number, freqHz: number, q: number): BiquadCoeffs {
  const w0 = (2 * Math.PI * freqHz) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const cos0 = Math.cos(w0);
  const a0 = 1 + alpha;
  return {
    b0: ((1 - cos0) / 2) / a0,
    b1: (1 - cos0) / a0,
    b2: ((1 - cos0) / 2) / a0,
    a1: (-2 * cos0) / a0,
    a2: (1 - alpha) / a0,
  };
}

/**
 * RBJ highpass (12 dB/oct second-order).
 */
export function highpassCoeffs(sampleRate: number, freqHz: number, q: number): BiquadCoeffs {
  const w0 = (2 * Math.PI * freqHz) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const cos0 = Math.cos(w0);
  const a0 = 1 + alpha;
  return {
    b0: ((1 + cos0) / 2) / a0,
    b1: (-(1 + cos0)) / a0,
    b2: ((1 + cos0) / 2) / a0,
    a1: (-2 * cos0) / a0,
    a2: (1 - alpha) / a0,
  };
}

/**
 * RBJ low-shelf — bass shelf at freqHz (cookbook "lowShelf" case).
 * Shelf slope is fixed at S = 1 (maximally flat), the WebAudio default, so
 * alpha = sin(w0)/2·√2 and the q parameter is not needed.
 */
export function lowShelfCoeffs(
  sampleRate: number,
  freqHz: number,
  gainDb: number,
): BiquadCoeffs {
  const A = Math.pow(10, gainDb / 40);
  const w0 = (2 * Math.PI * freqHz) / sampleRate;
  const cos0 = Math.cos(w0);
  const twoSqrtAalpha = Math.SQRT2 * Math.sqrt(A) * Math.sin(w0);
  const a0 = (A + 1) + (A - 1) * cos0 + twoSqrtAalpha;
  const a1 = -2 * ((A - 1) + (A + 1) * cos0);
  const a2 = (A + 1) + (A - 1) * cos0 - twoSqrtAalpha;
  const b0 = A * ((A + 1) - (A - 1) * cos0 + twoSqrtAalpha);
  const b1 = 2 * A * ((A - 1) - (A + 1) * cos0);
  const b2 = A * ((A + 1) - (A - 1) * cos0 - twoSqrtAalpha);
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
}

/**
 * RBJ high-shelf — treble shelf at freqHz (cookbook "highShelf" case,
 * slope fixed at S = 1 as in lowShelfCoeffs).
 */
export function highShelfCoeffs(
  sampleRate: number,
  freqHz: number,
  gainDb: number,
): BiquadCoeffs {
  const A = Math.pow(10, gainDb / 40);
  const w0 = (2 * Math.PI * freqHz) / sampleRate;
  const cos0 = Math.cos(w0);
  const twoSqrtAalpha = Math.SQRT2 * Math.sqrt(A) * Math.sin(w0);
  const a0 = (A + 1) - (A - 1) * cos0 + twoSqrtAalpha;
  const a1 = 2 * ((A - 1) - (A + 1) * cos0);
  const a2 = (A + 1) - (A - 1) * cos0 - twoSqrtAalpha;
  const b0 = A * ((A + 1) + (A - 1) * cos0 + twoSqrtAalpha);
  const b1 = -2 * A * ((A - 1) + (A + 1) * cos0);
  const b2 = A * ((A + 1) + (A - 1) * cos0 - twoSqrtAalpha);
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
}

/**
 * Direct-form-1 biquad recurrence (exactly the BiquadFilterNode default):
 *   y[n] = b0·x[n] + b1·x[n−1] + b2·x[n−2] − a1·y[n−1] − a2·y[n−2]
 * Past inputs/outputs start at zero. Returns a fresh array; the result is
 * stored as float32 in a Float32Array like every other lib function.
 */
export function applyBiquad(data: Float32Array, c: BiquadCoeffs): Float32Array {
  const out = new Float32Array(data.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < data.length; i++) {
    const x0 = data[i];
    const y0 = c.b0 * x0 + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
    out[i] = y0;
    x2 = x1; x1 = x0;
    y2 = y1; y1 = y0;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Effect compositions (batch 4). Each is a deterministic chain of the verified
// primitives, so every frequency-domain property is checkable in Node.
// ---------------------------------------------------------------------------

export interface RadioEffectOptions {
  /** Highpass corner Hz (crunchy radio band edge). */
  highpassHz: number;
  /** Lowpass corner Hz (band-limiting). */
  lowpassHz: number;
  /** Peaking EQ center Hz. */
  eqHz: number;
  /** Peaking EQ boost dB (negative = scooped). */
  eqDb: number;
  drive: number;
  /** Post-filter gain dB. */
  makeupDb: number;
}

export const RADIO_DEFAULTS: RadioEffectOptions = {
  highpassHz: 500,
  lowpassHz: 3500,
  eqHz: 1800,
  eqDb: 8,
  drive: 2.5,
  makeupDb: -3,
};

/**
 * Vintage radio: highpass → peaking EQ → lowpass×2 → soft tanh drive, applied
 * per channel. Order matters and is fixed: EQ shapes the band, the waveshaper
 * saturates only after band-limiting (saturating first would intermodulate
 * the out-of-band energy back in). The lowpass is cascaded twice (LR4-style,
 * 24 dB/oct) — a single 2nd-order stage leaves far too much treble for the
 * crunchy radio band.
 */
export function applyRadioEffect(
  data: Float32Array,
  sampleRate: number,
  opts: RadioEffectOptions,
): Float32Array {
  const lpCorner = Math.min(opts.lowpassHz, sampleRate / 2 - 100);
  const hp = applyBiquad(data, highpassCoeffs(sampleRate, Math.max(20, opts.highpassHz), 0.707));
  const eq = applyBiquad(hp, peakingCoeffs(sampleRate, Math.max(20, opts.eqHz), 1, opts.eqDb));
  const lp1 = applyBiquad(eq, lowpassCoeffs(sampleRate, lpCorner, 0.707));
  const lp = applyBiquad(lp1, lowpassCoeffs(sampleRate, lpCorner, 0.707));
  return applyDistortion(lp, opts.drive);
}

export interface TelephoneEffectOptions {
  highpassHz: number;
  lowpassHz: number;
  gainDb: number;
}

export const TELEPHONE_DEFAULTS: TelephoneEffectOptions = {
  // Classic 300–3400 Hz PSTN band, +6 dB makeup for the lost level.
  highpassHz: 300,
  lowpassHz: 3400,
  gainDb: 6,
};

/**
 * Telephone band-pass: each corner is a cascade of two identical 2nd-order
 * biquads (Linkwitz-Riley 4th-order, 24 dB/oct) — a single 2nd-order stage
 * only attenuates ~8 dB at 2/3 of the corner, which does not sound like a
 * phone. Followed by fixed makeup gain.
 */
export function applyTelephoneEffect(
  data: Float32Array,
  sampleRate: number,
  opts: TelephoneEffectOptions,
): Float32Array {
  const hpCorner = Math.max(20, opts.highpassHz);
  const lpCorner = Math.min(opts.lowpassHz, sampleRate / 2 - 100);
  const hp1 = applyBiquad(data, highpassCoeffs(sampleRate, hpCorner, 0.707));
  const hp = applyBiquad(hp1, highpassCoeffs(sampleRate, hpCorner, 0.707));
  const lp1 = applyBiquad(hp, lowpassCoeffs(sampleRate, lpCorner, 0.707));
  const lp = applyBiquad(lp1, lowpassCoeffs(sampleRate, lpCorner, 0.707));
  return applyLinearGain(lp, Math.pow(10, opts.gainDb / 20)).out;
}

// ---------- channel matrix / pan / balance / DC / phase (Batches 15–16) ----------

/**
 * General 2×2 channel matrix: out_L = ll·in_L + lr·in_R, out_R = rl·in_L +
 * rr·in_R. Mono input upmixes (in_R treated as 0); the output is always
 * stereo. Swap = (0,1,1,0); L+R downmix = (1,1,1,1).
 */
export function applyChannelMatrix(
  channels: Float32Array[],
  ll: number,
  lr: number,
  rl: number,
  rr: number,
): [Float32Array, Float32Array] {
  const len = Math.max(...channels.map((c) => c.length));
  const L = new Float32Array(len);
  const R = new Float32Array(len);
  const inL = channels[0] ?? new Float32Array(len);
  const inR = channels[1] ?? new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const l = inL[i] ?? 0;
    const r = inR[i] ?? 0;
    L[i] = ll * l + lr * r;
    R[i] = rl * l + rr * r;
  }
  return [L, R];
}

/**
 * Equal-power pan, matching WebAudio's StereoPannerNode: position −1..+1 maps
 * to cos/sin gains applied per channel (no cross terms — center is −3 dB per
 * channel, preserving total power; hard left is exactly input L). A mono
 * input is a true pan pot: the source is fed to both outputs at cos/sin.
 */
export function applyPan(channels: Float32Array[], position: number): [Float32Array, Float32Array] {
  const p = Math.min(1, Math.max(-1, position));
  const theta = ((p + 1) * Math.PI) / 4; // −1 → 0, 0 → π/4, +1 → π/2
  const gl = Math.cos(theta);
  const gr = Math.sin(theta);
  const inL = channels[0];
  const inR = channels[1];
  if (!inR) {
    const L = new Float32Array(inL.length);
    const R = new Float32Array(inL.length);
    for (let i = 0; i < inL.length; i++) {
      L[i] = gl * inL[i];
      R[i] = gr * inL[i];
    }
    return [L, R];
  }
  const L = new Float32Array(inL.length);
  const R = new Float32Array(inR.length);
  for (let i = 0; i < inL.length; i++) L[i] = gl * inL[i];
  for (let i = 0; i < inR.length; i++) R[i] = gr * inR[i];
  return [L, R];
}

/**
 * Balance: attenuates one channel toward the other side without changing the
 * unattenuated channel — the standard consumer-amplifier behavior. 0 = unity
 * both, −1 = right muted, +1 = left muted.
 */
export function applyBalance(channels: Float32Array[], position: number): [Float32Array, Float32Array] {
  const p = Math.min(1, Math.max(-1, position));
  const gl = p <= 0 ? 1 : 1 - p;
  const gr = p >= 0 ? 1 : 1 + p;
  return applyChannelMatrix(channels, gl, 0, 0, gr);
}

/**
 * Remove DC offset per channel by subtracting the channel's measured mean
 * (a pure digital highpass at 0 Hz).
 */
export function removeDcOffset(channels: Float32Array[]): Float32Array[] {
  return channels.map((c) => {
    let sum = 0;
    for (let i = 0; i < c.length; i++) sum += c[i];
    const mean = c.length ? sum / c.length : 0;
    const out = new Float32Array(c.length);
    for (let i = 0; i < c.length; i++) out[i] = c[i] - mean;
    return out;
  });
}

/**
 * Invert polarity (multiply by −1) on the selected channels only. Selection
 * is aligned with the input channels; extra flags are ignored.
 */
export function invertPhase(channels: Float32Array[], invert: boolean[]): Float32Array[] {
  return channels.map((c, i) => {
    if (!invert[i]) return c;
    const out = new Float32Array(c.length);
    for (let j = 0; j < c.length; j++) out[j] = -c[j];
    return out;
  });
}

export interface UnderwaterEffectOptions {
  lowpassHz: number;
  rateHz: number;
  depth: number;
}

export const UNDERWATER_DEFAULTS: UnderwaterEffectOptions = {
  lowpassHz: 600,
  rateHz: 1.2,
  depth: 0.35,
};

/**
 * Underwater: lowpass cascaded twice (24 dB/oct murk) + slow tremolo (the
 * swimming amplitude feel). Length preserved; 2 kHz+ is attenuated >40 dB.
 */
export function applyUnderwaterEffect(
  data: Float32Array,
  sampleRate: number,
  opts: UnderwaterEffectOptions,
): Float32Array {
  const corner = Math.min(opts.lowpassHz, sampleRate / 2 - 100);
  const lp1 = applyBiquad(data, lowpassCoeffs(sampleRate, corner, 0.707));
  const lp = applyBiquad(lp1, lowpassCoeffs(sampleRate, corner, 0.707));
  return applyTremolo(lp, sampleRate, opts.rateHz, opts.depth);
}

// ---------- batch 21: trim / cut / slice / join / mix ----------

/** Clamp a sample index into [0, length]. */
function clampIndex(i: number, length: number): number {
  return Math.max(0, Math.min(length, Math.round(i)));
}

/**
 * Keep only [startSec, endSec) of every channel (the Trimmer). Times are
 * clamped; endSec null/undefined means "to the end". Returns new arrays.
 */
export function trimToSpan(
  channels: Float32Array[],
  sampleRate: number,
  startSec: number,
  endSec: number | null,
): { channels: Float32Array[]; length: number } {
  const length = channels[0]?.length ?? 0;
  const from = clampIndex(startSec * sampleRate, length);
  const to = endSec == null ? length : clampIndex(endSec * sampleRate, length);
  const n = Math.max(0, to - from);
  return {
    channels: channels.map((ch) => ch.slice(from, from + n)),
    length: n,
  };
}

/**
 * Remove every [startSec, endSec) span (the Cutter). Spans may overlap and
 * arrive in any order; they are merged first, then cut in one pass.
 */
export function cutSpans(
  channels: Float32Array[],
  sampleRate: number,
  spans: Array<{ start: number; end: number }>,
): { channels: Float32Array[]; length: number; removed: number } {
  const length = channels[0]?.length ?? 0;
  // Normalize + merge overlapping/adjacent spans.
  const norm = spans
    .map((s) => ({
      from: clampIndex(Math.min(s.start, s.end) * sampleRate, length),
      to: clampIndex(Math.max(s.start, s.end) * sampleRate, length),
    }))
    .filter((s) => s.to > s.from)
    .sort((a, b) => a.from - b.from);
  const merged: Array<{ from: number; to: number }> = [];
  for (const s of norm) {
    const last = merged[merged.length - 1];
    if (last && s.from <= last.to) last.to = Math.max(last.to, s.to);
    else merged.push({ ...s });
  }
  // One pass: copy everything except the merged spans.
  const totalRemoved = merged.reduce((acc, s) => acc + (s.to - s.from), 0);
  const outLen = length - totalRemoved;
  const out = channels.map(() => new Float32Array(outLen));
  let write = 0;
  let read = 0;
  for (const s of merged) {
    const runLen = s.from - read;
    for (let c = 0; c < channels.length; c++) {
      out[c].set(channels[c].subarray(read, read + runLen), write);
    }
    write += runLen;
    read = s.to;
  }
  if (read < length) {
    const runLen = length - read;
    for (let c = 0; c < channels.length; c++) {
      out[c].set(channels[c].subarray(read, read + runLen), write);
    }
  }
  return { channels: out, length: outLen, removed: totalRemoved };
}

/**
 * Split into n near-equal segments (the Slicer's "equal parts" mode).
 * Returns segment start/end sample offsets into the source.
 */
export function sliceEqualSegments(
  length: number,
  n: number,
): Array<{ start: number; end: number }> {
  if (n < 1 || length < 1) return [];
  const segs: Array<{ start: number; end: number }> = [];
  const base = Math.floor(length / n);
  let extra = length % n;
  let start = 0;
  for (let i = 0; i < n; i++) {
    const len = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    segs.push({ start, end: start + len });
    start += len;
  }
  return segs;
}

/**
 * Fixed-length slicing (the Slicer's "every N seconds" mode): segment
 * boundaries every `segmentSec` seconds; the last segment is short.
 */
export function sliceByDuration(length: number, sampleRate: number, segmentSec: number): Array<{ start: number; end: number }> {
  if (segmentSec <= 0 || length < 1) return [];
  const segLen = Math.max(1, Math.round(segmentSec * sampleRate));
  const segs: Array<{ start: number; end: number }> = [];
  for (let start = 0; start < length; start += segLen) {
    segs.push({ start, end: Math.min(length, start + segLen) });
  }
  return segs;
}

/**
 * Concatenate same-rate channel sets (the Joiner). Channels are padded with
 * silence when a set has fewer channels than the widest input.
 */
export function concatChannels(
  sets: Array<{ channels: Float32Array[]; length: number }>,
): { channels: Float32Array[]; length: number } {
  const width = Math.max(0, ...sets.map((s) => s.channels.length));
  const total = sets.reduce((acc, s) => acc + s.length, 0);
  const out: Float32Array[] = [];
  for (let c = 0; c < width; c++) out.push(new Float32Array(total));
  let write = 0;
  for (const s of sets) {
    for (let c = 0; c < width; c++) {
      const src = s.channels[c];
      if (src) out[c].set(src, write);
      // else: stays silent (channel padding)
    }
    write += s.length;
  }
  return { channels: out, length: total };
}

/**
 * Mix several same-rate channel sets into one (the Merger): every input is
 * summed sample-by-sample and scaled by 1/inputs so a full-scale mix cannot
 * clip beyond the original peak. Unequal lengths are padded with silence.
 */
export function mixChannels(
  sets: Array<{ channels: Float32Array[]; length: number }>,
): { channels: Float32Array[]; length: number } {
  const width = Math.max(0, ...sets.map((s) => s.channels.length));
  const total = Math.max(0, ...sets.map((s) => s.length));
  const gain = sets.length > 0 ? 1 / sets.length : 1;
  const out: Float32Array[] = [];
  for (let c = 0; c < width; c++) out.push(new Float32Array(total));
  for (const s of sets) {
    for (let c = 0; c < width; c++) {
      const src = s.channels[c];
      if (!src) continue;
      for (let i = 0; i < src.length; i++) out[c][i] += src[i] * gain;
    }
  }
  return { channels: out, length: total };
}

// ---------------------------------------------------------------------------
// Fades, crossfades, seamless loops (Batch 27 primitives)
// ---------------------------------------------------------------------------

export type FadeCurve = "linear" | "exponential" | "equalPower";

/**
 * In-place fade over the first `samples` of every channel. Curves: linear
 * (constant slope), exponential (never reaches true zero — the final sample
 * is forced to 0 to guarantee silence), equal-power (sin — constant loudness,
 * the crossfade curve).
 */
export function applyFadeIn(
  channels: Float32Array[],
  samples: number,
  curve: FadeCurve = "linear",
): void {
  const n = Math.min(samples, channels[0]?.length ?? 0);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    let g: number;
    if (curve === "linear") g = t;
    else if (curve === "exponential") g = Math.pow(10, t - 1);
    else g = Math.sin((t * Math.PI) / 2);
    if (i === n - 1 && curve === "exponential") g = 0;
    for (const ch of channels) ch[i] *= g;
  }
}

export function applyFadeOut(
  channels: Float32Array[],
  samples: number,
  curve: FadeCurve = "linear",
): void {
  const len = channels[0]?.length ?? 0;
  const n = Math.min(samples, len);
  const start = len - n;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    let g: number;
    if (curve === "linear") g = 1 - t;
    else if (curve === "exponential") g = Math.pow(10, -t);
    else g = Math.cos((t * Math.PI) / 2);
    if (i === n - 1) g = 0;
    for (const ch of channels) ch[start + i] *= g;
  }
}

/**
 * Equal-power crossfade: B fades in as A fades out over `overlap` samples
 * with sin/cos gains (constant loudness for constant-amplitude material).
 * Returns channels of length aLen + bLen − overlap.
 */
export function crossfadeChannels(
  a: Float32Array[],
  b: Float32Array[],
  overlap: number,
): Float32Array[] {
  const aLen = a[0]?.length ?? 0;
  const bLen = b[0]?.length ?? 0;
  const ov = Math.max(0, Math.min(overlap, aLen, bLen));
  const outLen = aLen + bLen - ov;
  const width = Math.max(a.length, b.length);
  const out: Float32Array[] = [];
  for (let c = 0; c < width; c++) out.push(new Float32Array(outLen));
  for (let c = 0; c < width; c++) {
    // Missing channel on either side (mono joined to stereo) is silence.
    const ac = a[c] ?? new Float32Array(aLen);
    const bc = b[c] ?? new Float32Array(bLen);
    // A's head, untouched.
    for (let i = 0; i < aLen - ov; i++) out[c][i] = ac[i];
    // Overlap: equal-power blend.
    for (let i = 0; i < ov; i++) {
      const t = (i + 1) / (ov + 1);
      const ga = Math.cos((t * Math.PI) / 2);
      const gb = Math.sin((t * Math.PI) / 2);
      out[c][aLen - ov + i] = ac[aLen - ov + i] * ga + bc[i] * gb;
    }
    // B's tail, untouched.
    for (let i = ov; i < bLen; i++) out[c][aLen - ov + i] = bc[i];
  }
  return out;
}

/**
 * Best loop cut: among zero crossings in [searchFrom, searchTo), pick the cut
 * whose boundary best matches the file's own start (two-sample boundary
 * cost |x[cut] − x[0]| + |x[cut+1] − x[1]|). Cutting at a period-multiple
 * zero crossing whose boundary mirrors the head makes loop() seamless.
 */
export function findBestLoopCut(
  data: Float32Array,
  searchFrom: number,
  searchTo: number,
): number {
  let best = searchFrom;
  let bestCost = Infinity;
  for (let c = searchFrom; c < searchTo - 1; c++) {
    if (data[c] * data[c + 1] > 0) continue; // zero crossings only
    const cost = Math.abs(data[c] - data[0]) + Math.abs(data[c + 1] - data[1]);
    if (cost < bestCost) {
      bestCost = cost;
      best = c;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// 8D-style rotating spatial audio (Batch 28)
// ---------------------------------------------------------------------------

export interface SpatialRotationOptions {
  /** Seconds per full revolution (typical 8D: 5–12 s). */
  rotationSec: number;
  /** 0 = pure pan, 1 = full interaural time difference depth. */
  depth: number;
  /** Maximum ITD at depth 1, in ms (0.65 ms ≈ the real head width). */
  maxDelayMs?: number;
}

/**
 * "8D" rotation: a mono source is panned around the head in an equal-power
 * circle (cos/sin gains, polarity flips through the back hemisphere) while a
 * small interaural delay alternates between the ears, d = dMax·(1 − gain)/2
 * per channel. Depth 0 degenerates to a plain equal-power panner; at depth 1
 * the delay reaches the ~0.65 ms a real off-center source produces.
 * Returns [left, right] at the input length.
 */
export function apply8D(
  data: Float32Array,
  sampleRate: number,
  o: SpatialRotationOptions,
): [Float32Array, Float32Array] {
  const maxDelayMs = o.maxDelayMs ?? 0.65;
  const dMax = Math.max(0, (maxDelayMs / 1000) * sampleRate * Math.min(1, Math.max(0, o.depth)));
  const omega = (2 * Math.PI) / Math.max(0.5, o.rotationSec);
  const left = new Float32Array(data.length);
  const right = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const p = omega * (i / sampleRate);
    const gl = Math.cos(p);
    const gr = Math.sin(p);
    const dL = Math.round((dMax * (1 - gl)) / 2);
    const dR = Math.round((dMax * (1 - gr)) / 2);
    const il = i - dL;
    const ir = i - dR;
    left[i] = data[il >= 0 ? il : 0] * gl;
    right[i] = data[ir >= 0 ? ir : 0] * gr;
  }
  return [left, right];
}
