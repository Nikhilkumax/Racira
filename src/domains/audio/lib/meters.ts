/**
 * Metering & analysis DSP — pure, Node-verified.
 *
 *   computeSpectrogram  — STFT magnitude frames (dB) using the verified
 *                         fftInPlace + hann; hop = N/4.
 *   stereoCorrelation   — Pearson correlation of L/R (the phase meter and
 *                         correlation meter read the same truth: +1 mono,
 *                         0 decorrelated, −1 polarity-inverted).
 *   goniometerPoints    — downsampled Lissajous (L,R) points for the
 *                         vectorscope canvas (mono = 45° line, inverted =
 *                         135° anti-line).
 *   truePeakDbfs        — sample peak plus 4× linear-interpolation
 *                         oversampling for inter-sample peak estimation
 *                         (BS.1770-style, linear-phase note below).
 *
 * All functions are pure and mono/stereo-per-channel like the rest of the
 * run; FFT is the Node-verified fftInPlace in reverb.ts.
 */

import { fftInPlace } from "./reverb";

export interface SpectrogramOptions {
  /** Analysis window in ms. Default 23 (~1024 samples at 44.1 kHz). */
  windowMs?: number;
  /** Max frequency to keep in the output. Default: Nyquist. */
  maxHz?: number;
}

export interface SpectrogramResult {
  /** Frames × bins magnitudes in dBFS (0 = full scale sine, negative below). */
  frames: Float32Array[];
  /** Center frequency of each bin, Hz. */
  binHz: Float64Array;
  /** Frame hop in seconds. */
  hopSec: number;
  sampleRate: number;
}

/**
 * STFT spectrogram. Window normalization: a full-scale sine lands at 0 dBFS
 * in the peak bin (coherent gain 1 for hann after dividing by N/4).
 */
export function computeSpectrogram(
  x: Float32Array,
  sr: number,
  o: SpectrogramOptions = {},
): SpectrogramResult {
  const windowMs = o.windowMs ?? 23;
  const maxHz = o.maxHz ?? sr / 2;
  const nfft = 1 << Math.round(Math.log2(Math.max(256, (windowMs / 1000) * sr)));
  const hop = nfft >> 2;
  const win = new Float64Array(nfft);
  for (let i = 0; i < nfft; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / nfft);

  const binsBelow = Math.min(nfft / 2, Math.ceil((maxHz / (sr / 2)) * (nfft / 2)));
  const binHz = new Float64Array(binsBelow + 1);
  for (let k = 0; k <= binsBelow; k++) binHz[k] = (k * sr) / nfft;

  const frames: Float32Array[] = [];
  const re = new Float64Array(nfft);
  const im = new Float64Array(nfft);
  for (let start = 0; start + nfft <= x.length; start += hop) {
    for (let i = 0; i < nfft; i++) {
      re[i] = x[start + i] * win[i];
      im[i] = 0;
    }
    fftInPlace(re, im, false);
    const frame = new Float32Array(binsBelow + 1);
    // hann coherent gain = N/4 per bin peak (window sum / N normalization)
    for (let k = 0; k <= binsBelow; k++) {
      const mag = Math.hypot(re[k], im[k]) / (nfft / 4);
      frame[k] = 20 * Math.log10(Math.max(1e-7, mag));
    }
    frames.push(frame);
  }
  return { frames, binHz, hopSec: hop / sr, sampleRate: sr };
}

// ---------------------------------------------------------------------------
// Stereo correlation / phase
// ---------------------------------------------------------------------------

export interface CorrelationResult {
  /** Pearson correlation over the whole file: +1 mono, 0 decorrelated, −1 inverted. */
  correlation: number;
  /** Correlation computed per quarter (trend across the file). */
  trend: [number, number, number, number];
  /** L/R RMS balance in dB (L relative to R). */
  balanceDb: number;
}

/**
 * Pearson correlation between L and R. Guaranteed within [-1, 1] up to
 * float error; identical channels give exactly 1 (normalized), inverted
 * give −1.
 */
export function stereoCorrelation(l: Float32Array, r: Float32Array): CorrelationResult {
  const n = Math.min(l.length, r.length);
  const quad = Math.max(1, Math.floor(n / 4));
  const corrRange = (a: number, b: number) => {
    let sLL = 0, sRR = 0, sLR = 0;
    for (let i = a; i < b; i++) {
      sLL += l[i] * l[i];
      sRR += r[i] * r[i];
      sLR += l[i] * r[i];
    }
    if (sLL === 0 || sRR === 0) return NaN; // silence: correlation undefined
    return sLR / Math.sqrt(sLL * sRR);
  };
  const whole = corrRange(0, n);
  const trend: [number, number, number, number] = [
    corrRange(0, quad),
    corrRange(quad, 2 * quad),
    corrRange(2 * quad, 3 * quad),
    corrRange(3 * quad, n),
  ];
  let eL = 0, eR = 0;
  for (let i = 0; i < n; i++) {
    eL += l[i] * l[i];
    eR += r[i] * r[i];
  }
  const balanceDb = eL > 0 && eR > 0 ? 10 * Math.log10(eL / eR) : NaN;
  return { correlation: whole, trend, balanceDb };
}

// ---------------------------------------------------------------------------
// Goniometer (Lissajous) points
// ---------------------------------------------------------------------------

/**
 * Downsampled (L, R) pairs rotated −45° so mono sits on the vertical axis —
 * the classic goniometer view. Rotation: [x', y'] = [(L−R)/√2, (L+R)/√2].
 * The canvas draws each point; mono = vertical line, inverted = horizontal,
 * stereo spread = ellipse/fountain.
 */
export function goniometerPoints(
  l: Float32Array,
  r: Float32Array,
  maxPoints = 4000,
): { x: Float32Array; y: Float32Array } {
  const n = Math.min(l.length, r.length);
  const step = Math.max(1, Math.floor(n / maxPoints));
  const count = Math.floor(n / step);
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const s = 1 / Math.SQRT2;
  for (let i = 0, p = 0; i + step <= n; i += step, p++) {
    x[p] = (l[i] - r[i]) * s;
    y[p] = (l[i] + r[i]) * s;
  }
  return { x, y };
}

// ---------------------------------------------------------------------------
// True peak
// ---------------------------------------------------------------------------

/** Hann-windowed sinc (band-limited interpolation kernel), 16 taps. */

/**
 * Sample peak (max |x|) and estimated true peak via 4× band-limited
 * oversampling (windowed-sinc FIR, 16 taps per phase). Linear interpolation
 * is useless here — it is a convex combination of the endpoints and can
 * never exceed the sample peak (measured this batch: identical to 0.0000 dB).
 * The sinc kernel reproduces sample values exactly at integer positions and
 * overshoots between them for near-Nyquist content, which is precisely the
 * inter-sample peak the BS.1770 meter must catch (up to ~3 dB above the
 * sample peak).
 */
const TP_TAPS = 16;
export function truePeakDbfs(x: Float32Array): { samplePeakDb: number; truePeakDb: number } {
  let peak = 0;
  for (let i = 0; i < x.length; i++) peak = Math.max(peak, Math.abs(x[i]));

  // precompute the three fractional-phase kernels (4× oversampling)
  const phases = [0.25, 0.5, 0.75];
  const kernels = phases.map((p) => {
    const k = new Float64Array(TP_TAPS);
    for (let j = 0; j < TP_TAPS; j++) {
      const t = j - (TP_TAPS / 2 - 1) - p; // distance from the fractional sample
      const s = t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t);
      // Hann window across the 16 taps
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * (j + 0.5)) / TP_TAPS);
      k[j] = s * w;
    }
    return k;
  });

  let tPeak = peak;
  const half = TP_TAPS / 2 - 1;
  for (let i = 0; i < x.length; i++) {
    for (const kern of kernels) {
      let acc = 0;
      for (let j = 0; j < TP_TAPS; j++) {
        const idx = i + j - half;
        if (idx >= 0 && idx < x.length) acc += x[idx] * kern[j];
      }
      tPeak = Math.max(tPeak, Math.abs(acc));
    }
  }
  return {
    samplePeakDb: 20 * Math.log10(Math.max(1e-9, peak)),
    truePeakDb: 20 * Math.log10(Math.max(1e-9, tPeak)),
  };
}
