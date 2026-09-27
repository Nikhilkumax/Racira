/**
 * Noise cleanup DSP — pure, Node-verified.
 *
 * Five processors sharing one toolbox:
 *   spectralDenoise  — magnitude spectral subtraction with per-bin noise
 *                      profile, over-subtraction factor and spectral floor
 *                      (Boll 1979). Hann windows, 75 % overlap, WOLA
 *                      normalization. The noise profile is measured over the
 *                      QUIETEST window of the file (no noise print needed).
 *   removeClicks     — click/pop detection (median-filtered residual) with
 *                      cubic-Hermite repair — zero-tangent Hermite through
 *                      the clean neighbours, no overshoot on spikes.
 *   removePlosives   — p/b breath blasts: zero-phase lowband cut gated on
 *                      LF-dominance AND loudness burst (a steady LF tone is
 *                      not a plosive).
 *   deEss            — 5–9 kHz zero-phase band cut when that band dominates.
 *   humNotch         — comb of RBJ notches at hum fundamental + harmonics.
 *
 * Design note (measured this batch): cascaded one-sided lowpasses lag their
 * transition band by up to ~114°, so a subtractive split `low = LP²(x)`,
 * `high = x − low` puts transition-band energy in BOTH branches with
 * opposite phase — attenuating `low` then recombining can AMPLIFY the very
 * content being removed (70 Hz blast through a 110 Hz split measured
 * +39 %). Every band cut here therefore uses forward-backward (zero-phase)
 * filtering: the band is real, in phase with x, |H| ≤ 1 pointwise, so
 * `out = x − (1−g)·band` attenuates monotonically and recombines exactly
 * (g = 1 reproduces x sample-for-sample).
 *
 * Every function is mono-channel; callers loop channels (standard this run).
 * Biquads are the Node-verified RBJ set in edit.ts; FFT is the
 * Node-verified fftInPlace in reverb.ts.
 */

import { lowpassCoeffs, applyBiquad, notchCoeffs } from "./edit";
import { fftInPlace } from "./reverb";

/** Zero-phase (forward-backward) biquad filtering: |H|² magnitude, no phase lag. */
function filtfiltBiquad(x: Float32Array, c: ReturnType<typeof lowpassCoeffs>): Float32Array {
  const fwd = applyBiquad(x, c);
  const rev = fwd.slice().reverse();
  const back = applyBiquad(rev, c);
  return back.reverse();
}

export interface SpectralDenoiseOptions {
  /** Strength 0..1. 0 = passthrough, 1 = full over-subtraction. Default 0.5. */
  strength?: number;
  /** Analysis window in ms. Default 32. */
  windowMs?: number;
  /** Duration of the quietest region used to measure the noise profile. Default 0.4 s. */
  noiseFloorSec?: number;
}

export interface SpectralDenoiseResult {
  out: Float32Array;
  /** Additional per-channel results, in input order (outs[0] === out). */
  outs: Float32Array[];
  /** Mean attenuation applied over the spectrum (dB, diagnostic). */
  noiseReductionDb: number;
}

function hann(nfft: number): Float64Array {
  const w = new Float64Array(nfft);
  for (let i = 0; i < nfft; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / nfft);
  return w;
}

function stftDenoiseChannel(
  x: Float32Array,
  sr: number,
  strength: number,
  windowMs: number,
  noiseFloorSec: number,
): { out: Float32Array; reductionDb: number } {
  const nfft = 1 << Math.round(Math.log2(Math.max(256, (windowMs / 1000) * sr)));
  const hop = nfft >> 2;
  const win = hann(nfft);

  // ---- pass 1: noise profile over the QUIETEST stretch of the file -------
  // Frame energies first, then the profile averages the quietest frames —
  // robust whether the quiet region is a tail, a pause, or the intro.
  const re = new Float64Array(nfft);
  const im = new Float64Array(nfft);
  const frameE: { start: number; e: number }[] = [];
  for (let start = 0; start + nfft <= x.length; start += hop) {
    let e = 0;
    for (let i = 0; i < nfft; i++) e += x[start + i] * x[start + i];
    frameE.push({ start, e });
  }
  if (frameE.length === 0) return { out: x.slice(), reductionDb: 0 };
  const want = Math.max(1, Math.min(frameE.length, Math.round((noiseFloorSec * sr) / hop)));
  const quietest = frameE.slice().sort((a, b) => a.e - b.e).slice(0, want);
  const profile = new Float64Array(nfft / 2 + 1);
  for (const f of quietest) {
    for (let i = 0; i < nfft; i++) {
      re[i] = x[f.start + i] * win[i];
      im[i] = 0;
    }
    fftInPlace(re, im, false);
    for (let k = 0; k <= nfft / 2; k++) profile[k] += Math.hypot(re[k], im[k]);
  }
  for (let k = 0; k < profile.length; k++) profile[k] /= quietest.length;

  // ---- pass 2: over-subtract, WOLA accumulate ----------------------------
  // Frames extend 3·hop BEFORE the signal so that every sample of x gets
  // full 4-frame window coverage (hann² sums to 1.5 everywhere, including
  // the edges). Without this, edge samples are covered by 1–3 frames and
  // the wsum division divides by a near-zero window: with ragged per-bin
  // gains the normalization amplifies noise at the file edges by orders of
  // magnitude (measured 34× on a 4096-sample input).
  const out = new Float32Array(x.length);
  const wsum = new Float32Array(x.length);
  let gSum = 0;
  let gCount = 0;
  for (let start = -(nfft - hop); start < x.length; start += hop) {
    for (let i = 0; i < nfft; i++) {
      const s = start + i;
      re[i] = s >= 0 && s < x.length ? x[s] * win[i] : 0;
      im[i] = 0;
    }
    fftInPlace(re, im, false);
    // gain = max(floor, 1 - strength·noise/mag) per bin (Boll over-subtraction)
    for (let k = 0; k <= nfft / 2; k++) {
      const mag = Math.hypot(re[k], im[k]);
      const g = mag > 1e-12 ? Math.max(0.08, 1 - (strength * profile[k]) / mag) : 0.08;
      re[k] *= g;
      im[k] *= g;
      if (k > 0 && k < nfft / 2) {
        re[nfft - k] *= g;
        im[nfft - k] *= g;
      }
      gSum += g;
      gCount++;
    }
    fftInPlace(re, im, true); // fftInPlace divides by N on inverse
    for (let i = 0; i < nfft; i++) {
      const s = start + i;
      if (s < x.length) {
        out[s] += re[i] * win[i];
        wsum[s] += win[i] * win[i];
      }
    }
  }
  for (let i = 0; i < out.length; i++) if (wsum[i] > 1e-9) out[i] /= wsum[i];
  const gAvg = gSum / Math.max(1, gCount);
  return { out, reductionDb: -20 * Math.log10(Math.max(1e-9, gAvg)) };
}

export function spectralDenoise(
  channels: Float32Array[],
  sampleRate: number,
  o: SpectralDenoiseOptions = {},
): SpectralDenoiseResult {
  const strength = Math.max(0, Math.min(1, o.strength ?? 0.5));
  const windowMs = o.windowMs ?? 32;
  const floorSec = o.noiseFloorSec ?? 0.4;
  let reductionDb = 0;
  const outs = channels.map((ch) => {
    const r = stftDenoiseChannel(ch, sampleRate, strength, windowMs, floorSec);
    reductionDb = r.reductionDb;
    return r.out;
  });
  return { out: outs[0], outs, noiseReductionDb: reductionDb };
}

// ---------------------------------------------------------------------------
// Click / pop removal
// ---------------------------------------------------------------------------

export interface ClickRemovalResult {
  out: Float32Array;
  clicksRepaired: number;
}

/**
 * Median-7 residual click detection with cubic-Hermite repair.
 * A click is a sample whose deviation from the 7-tap running median exceeds
 * `sensitivity` × the local (31-tap mean) residual scale — robust to both
 * the musical signal and the clicks themselves. The scale carries a floor
 * relative to the global signal level: on monotone stretches (pure tones,
 * near-silence) the median residual is ~0 and an absolute floor would flag
 * numerical dust once per period (measured: 220 spurious "repairs" on a
 * clean 220 Hz sine). Repair splices the run
 * [first−3, last+3] with a zero-tangent cubic Hermite through the clean
 * neighbours: monotone, C1, no overshoot on impulsive spikes.
 */
export function removeClicks(
  x: Float32Array,
  opts: { sensitivity?: number; maxClicks?: number } = {},
): ClickRemovalResult {
  const sensitivity = Math.max(0.5, opts.sensitivity ?? 6);
  const maxClicks = opts.maxClicks ?? 10000;
  const out = x.slice();
  const N = x.length;
  const resid = new Float64Array(N);
  const w = new Float64Array(7);
  for (let i = 3; i < N - 3; i++) {
    for (let j = -3; j <= 3; j++) w[j + 3] = x[i + j];
    for (let a = 1; a < 7; a++) {
      const v = w[a];
      let b = a - 1;
      while (b >= 0 && w[b] > v) {
        w[b + 1] = w[b];
        b--;
      }
      w[b + 1] = v;
    }
    resid[i] = x[i] - w[3];
  }
  // local scale: 31-tap running mean |resid| (residual is already robust)
  const scale = new Float64Array(N);
  let acc = 0;
  const K = 15;
  for (let i = 0; i < N; i++) {
    acc += Math.abs(resid[i]);
    if (i >= 2 * K + 1) acc -= Math.abs(resid[i - 2 * K - 1]);
    if (i >= K) scale[i - K] = Math.max(1e-9, acc / (2 * K + 1));
  }
  for (let i = Math.max(0, N - K); i < N; i++) scale[i] = scale[Math.max(0, N - K - 1)];

  let gAbs = 0;
  for (let i = 0; i < N; i++) gAbs += x[i] * x[i];
  const absFloor = 0.002 * Math.sqrt(gAbs / Math.max(1, N)) + 1e-7;
  let repaired = 0;
  let i = 3;
  while (i < N - 3 && repaired < maxClicks) {
    if (Math.abs(resid[i]) > sensitivity * Math.max(scale[i], absFloor)) {
      let e = i;
      while (
        e + 1 < N - 3 &&
        e - i < 48 &&
        Math.abs(resid[e + 1]) > sensitivity * Math.max(scale[e + 1], absFloor)
      )
        e++;
      // Hermite splice across [i-3, e+3]: y0 -> y3, zero end tangents.
      // Span count is (e+3) - (i-3) + 1 = e - i + 7 samples.
      const n = e - i + 7;
      const y0 = x[i - 3];
      const y3 = x[e + 3];
      for (let s = 0; s < n; s++) {
        const t = s / (n - 1);
        const t2 = t * t;
        const t3 = t2 * t;
        out[i - 3 + s] = (2 * t3 - 3 * t2 + 1) * y0 + (-2 * t3 + 3 * t2) * y3;
      }
      repaired++;
      i = e + 4;
    } else i++;
  }
  return { out, clicksRepaired: repaired };
}

// ---------------------------------------------------------------------------
// Plosive removal
// ---------------------------------------------------------------------------

/**
 * Plosive attenuator. A p/b blast is (a) LF-dominant and (b) a LOUDNESS
 * BURST — both conditions are required, so a steady bass line or LF hum is
 * never touched. Detection runs on a zero-phase lowband (filtfilt, |H| ≤ 1,
 * no phase lag — see the design note at the top); the cut is
 * `out = x − (1−g)·lowFb`, which attenuates monotonically and recombines
 * exactly at g = 1. 50 ms release after each blast.
 *
 * Onset behaviour: zero-phase filtering pre-rings ~2 ms before a blast's
 * attack (inherent to acausal filtering). On real plosives — 5–20 ms breath
 * onsets — the pre-ring sits far below the blast level and is
 * psychoacoustically backward-masked; the never-amplify property holds
 * everywhere except a couple of ms around a step-like onset, which does not
 * occur in speech (the tests use a 5 ms raised-cosine attack).
 */
export function removePlosives(
  x: Float32Array,
  sr: number,
  opts: { thresholdDb?: number; maxReductionDb?: number; burstRatio?: number } = {},
): { out: Float32Array; events: number } {
  const threshold = Math.pow(10, (opts.thresholdDb ?? -10) / 20); // LF/total amplitude ratio
  const maxGain = Math.pow(10, (opts.maxReductionDb ?? -12) / 20);
  const burstRatio = opts.burstRatio ?? 3;

  const lowFb = filtfiltBiquad(x, lowpassCoeffs(sr, 110, 0.707));

  // per-window (5 ms) energies for the burst test
  const win = Math.max(8, Math.round(sr * 0.005));
  const nWin = Math.ceil(x.length / win);
  const winRms = new Float64Array(nWin);
  const winRatio = new Float64Array(nWin);
  for (let wI = 0; wI < nWin; wI++) {
    const a = wI * win;
    const b = Math.min(x.length, a + win);
    let eLow = 0;
    let eTot = 0;
    for (let j = a; j < b; j++) {
      eLow += lowFb[j] * lowFb[j];
      eTot += x[j] * x[j];
    }
    winRms[wI] = Math.sqrt(eTot / Math.max(1, b - a));
    winRatio[wI] = Math.sqrt(eLow / Math.max(1e-20, eTot));
  }
  // median window rms (robust loudness reference)
  const sorted = Array.from(winRms).sort((a, b) => a - b);
  const medianRms = sorted[Math.floor(sorted.length / 2)] || 0;

  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i];
  const release = 10; // windows
  let events = 0;
  let gated = false;
  let gateLeft = 0;
  for (let wI = 0; wI < nWin; wI++) {
    const a = wI * win;
    const b = Math.min(x.length, a + win);
    const isBurst = winRms[wI] > burstRatio * medianRms;
    const shouldGate = winRatio[wI] > threshold && isBurst;
    if (shouldGate && !gated) events++;
    gated = shouldGate;
    gateLeft = shouldGate ? release : Math.max(0, gateLeft - 1);
    let g = 1;
    if (gated) g = maxGain;
    else if (gateLeft > 0) g = maxGain + (1 - maxGain) * (1 - gateLeft / release);
    if (g < 1) {
      for (let j = a; j < b; j++) out[j] = x[j] - (1 - g) * lowFb[j];
    }
  }
  return { out, events };
}

// ---------------------------------------------------------------------------
// De-essing
// ---------------------------------------------------------------------------

/**
 * De-esser. The sibilance band is a true zero-phase band
 * `sBand = fbLP(x, highHz) − fbLP(x, lowHz)` — real, in phase with x, and
 * |H_band| ≤ 1 pointwise (both corners are monotone lowpass magnitudes with
 * highHz > lowHz), so the dynamic cut `out = x − (1−g)·sBand` attenuates
 * monotonically and recombines exactly at g = 1. Gain decision per 4 ms
 * window on the band/total ratio, one-pole smoothing.
 */
export function deEss(
  x: Float32Array,
  sr: number,
  opts: { thresholdDb?: number; maxReductionDb?: number; lowHz?: number; highHz?: number } = {},
): { out: Float32Array; events: number } {
  const lowHz = opts.lowHz ?? 5000;
  const highHz = opts.highHz ?? 9000;
  const threshold = Math.pow(10, (opts.thresholdDb ?? -20) / 20);
  const maxGain = Math.pow(10, (opts.maxReductionDb ?? -6) / 20);

  const hpSide = filtfiltBiquad(x, lowpassCoeffs(sr, highHz, 0.707));
  const lpSide = filtfiltBiquad(x, lowpassCoeffs(sr, lowHz, 0.707));
  const sBand = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) sBand[i] = hpSide[i] - lpSide[i];

  const win = Math.max(8, Math.round(sr * 0.004));
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i];
  let events = 0;
  let g = 1;
  for (let i = 0; i < x.length; i += win) {
    const end = Math.min(x.length, i + win);
    let eS = 0;
    let eT = 0;
    for (let j = i; j < end; j++) {
      eS += sBand[j] * sBand[j];
      eT += x[j] * x[j];
    }
    const ratio = Math.sqrt(eS / Math.max(1e-20, eT));
    const target = ratio > threshold ? Math.max(maxGain, threshold / ratio) : 1;
    g += (target - g) * 0.5;
    if (g < 0.98 && target < 1) events++;
    if (g < 0.9995) {
      for (let j = i; j < end; j++) out[j] = x[j] - (1 - g) * sBand[j];
    }
  }
  return { out, events };
}

// ---------------------------------------------------------------------------
// Hum notch comb
// ---------------------------------------------------------------------------

/**
 * Notch the hum fundamental and `harmonics` harmonics. notchCoeffs is the
 * Node-verified RBJ notch (exact null at center). Q=30 keeps the notch
 * surgical (~f/30 wide). Note: each notch's startup transient rings for
 * ~Q/(πf) seconds (~0.2 s per stage at 50 Hz) — measure steady-state
 * behaviour after ~0.6 s, as the tests do.
 */
export function humNotch(
  x: Float32Array,
  sr: number,
  fundamentalHz: number,
  harmonics = 5,
): Float32Array {
  let out = x;
  for (let h = 1; h <= harmonics; h++) {
    const f = fundamentalHz * h;
    if (f >= sr / 2 - 100) break;
    out = applyBiquad(out, notchCoeffs(sr, f, 30));
  }
  return out;
}
