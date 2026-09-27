/**
 * Pitch-family + vintage-texture DSP — pure, Node-verified.
 *
 * Batch 33 lib. Everything here is built from primitives already verified in
 * this run: estimateFundamental (analyze.ts), resampleLinear +
 * olaTimeStretch (edit.ts), and the RBJ biquads (edit.ts). No new
 * dependencies; no ML. PSOLA-class formant-preserving shifting is explicitly
 * OUT of scope — the autotune here is granular (overlap-add resample), which
 * is the classic Antares-era algorithm sketch and is honest about artifacts.
 */
import { resampleLinear, lowpassCoeffs, highpassCoeffs, applyBiquad } from "./edit";
import { fftInPlace } from "./reverb";

/** Per-frame pitch track: median-filtered f0 + confidence per hop. */
export interface PitchTrackPoint {
  /** Frame start sample. */
  start: number;
  hz: number;
  confidence: number;
}

export interface TrackOptions {
  frameMs?: number; // analysis frame (default 60 ms — long enough for 55 Hz)
  hopMs?: number; // frame stride (default 25 ms)
  minHz?: number;
  maxHz?: number;
}

/**
 * Frame-wise pitch tracking. Each frame is analyzed independently with
 * estimateFundamental (which medians across internal windows); frames below
 * the confidence floor report hz 0 (unvoiced) so the tuner can pass them
 * through untouched rather than snapping noise.
 */
export function trackPitch(
  data: Float32Array,
  sampleRate: number,
  o: TrackOptions = {},
): PitchTrackPoint[] {
  const frameMs = o.frameMs ?? 60;
  const hopMs = o.hopMs ?? 25;
  const minHz = o.minHz ?? 70;
  const maxHz = o.maxHz ?? 1000;
  const frame = Math.round((frameMs / 1000) * sampleRate);
  const hop = Math.round((hopMs / 1000) * sampleRate);
  const pts: PitchTrackPoint[] = [];
  for (let start = 0; start + frame <= data.length + hop; start += hop) {
    const end = Math.min(data.length, start + frame);
    if (end - start < frame / 2) break; // tail frame too short to trust
    let mean = 0;
    for (let i = start; i < end; i++) mean += data[i];
    mean /= end - start;
    let energy = 0;
    for (let i = start; i < end; i++) {
      const v = data[i] - mean;
      energy += v * v;
    }
    // unvoiced/silence gate: RMS below ~-46 dBFS is not a note
    const rms = Math.sqrt(energy / (end - start));
    if (rms < 0.005) {
      pts.push({ start, hz: 0, confidence: 0 });
      continue;
    }
    // Slice into a frame buffer for estimateFundamental (it windows over the
    // whole array it is given).
    const buf = new Float32Array(end - start);
    for (let i = start; i < end; i++) buf[i - start] = data[i];
    const est = estimateFrame(buf, sampleRate, minHz, maxHz);
    pts.push({ start, hz: est.confidence > 0.5 ? est.hz : 0, confidence: est.confidence });
  }
  return pts;
}

// estimateFundamental is exported from analyze.ts; importing it here would
// pull the FFT machinery into every tool that imports pitch.ts — fine, it is
// all tree-shakeable pure code. Re-export a thin wrapper so tests compile the
// module once.
import { estimateFundamental } from "./analyze";
function estimateFrame(buf: Float32Array, sr: number, minHz: number, maxHz: number) {
  return estimateFundamental(buf, sr, minHz, maxHz, 4);
}

/**
 * Granular auto-tune: per-frame target = nearest scale pitch; the frame is
 * resampled by the ratio f_target/f_measured (pitch moves, length changes),
 * then OLA-stretched back by the inverse ratio so frame timing is preserved.
 * Unvoiced/low-confidence frames pass through untouched.
 */
export interface AutoTuneOptions {
  /** Semitone offsets allowed as snap targets; empty = chromatic. */
  scale?: number[]; // e.g. [0,2,4,5,7,9,11] major
  /** Root note of the scale as MIDI number class (0-11). */
  root?: number;
  /** 0 = snap fully, 1 = no snap (retune strength inverted for UX). */
  strength?: number; // 0..1 (default 0.85)
}

export function autoTune(
  data: Float32Array,
  sampleRate: number,
  o: AutoTuneOptions = {},
): { out: Float32Array; framesSnapped: number; framesTotal: number; medianCentsMoved: number } {
  const scale = o.scale ?? [];
  const root = o.root ?? 0;
  const strength = Math.max(0, Math.min(1, o.strength ?? 0.85));
  const pts = trackPitch(data, sampleRate, { frameMs: 60, hopMs: 25, minHz: 70, maxHz: 1000 });

  // Rate map on the tracker's frame grid: 1.0 = pass through, 2^(cents/1200)
  // = snap towards target. Unvoiced / low-confidence frames get 1.0.
  const trackerHop = Math.round(0.025 * sampleRate);
  const rates: number[] = new Array(pts.length);
  let snapped = 0;
  let voiced = 0;
  const centsMoved: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const pt = pts[i];
    if (pt.hz <= 0 || pt.confidence < 0.5) {
      rates[i] = 1;
      continue;
    }
    voiced++;
    const midi = 69 + 12 * Math.log2(pt.hz / 440);
    const target = targetMidi(midi, scale, root);
    const applied = (target - midi) * 100 * strength;
    centsMoved.push(Math.abs(applied));
    if (Math.abs(applied) < 2) {
      rates[i] = 1;
      continue;
    }
    snapped++;
    rates[i] = Math.pow(2, applied / 1200);
  }
  // 3-point box smoothing — abrupt per-frame rate steps would surface as
  // phase discontinuities in the continuous vocoder below.
  const ratesSmooth = rates.map((_, i) => {
    let s = 0;
    let c = 0;
    for (let k = Math.max(0, i - 1); k <= Math.min(rates.length - 1, i + 1); k++) {
      s += rates[k];
      c++;
    }
    return s / c;
  });

  const out = pvShiftTimeVarying(data, sampleRate, ratesSmooth, trackerHop);
  centsMoved.sort((a, b) => a - b);
  const median = centsMoved.length ? centsMoved[Math.floor(centsMoved.length / 2)] : 0;
  return { out, framesSnapped: snapped, framesTotal: voiced, medianCentsMoved: median };
}

/**
 * Continuous phase vocoder with a TIME-VARYING rate map — the whole-file
 * architecture. Design history, because it is the interesting part:
 *
 * 1. resample+OLA per frame: OLA re-syncs grain phase to the waveform and
 *    UNDOES the resample's shift (measured byte-for-byte in Node).
 * 2. grain-resample under WOLA (no OLA): with grains cut on a fixed sample
 *    grid, grain n carries phase offset f·start·(1−r); the staircase
 *    f(1−r)·n across overlapping grains reconstructs the INPUT pitch
 *    exactly. Provable, reproduced, abandoned.
 * 3. per-frame standalone phase vocoders under WOLA: the same wall — each
 *    region restarts its phase history, so the inter-region offset
 *    ω₀·H·(1−r) per hop re-forms the staircase.
 *
 * The fix is structural: ONE vocoder over the whole file, phase history
 * never reset, rate interpolated from the snap map frame by frame. Each
 * bin's output phase advances at r(t)× the measured partial rate, so output
 * frequency = input × r(t) by construction; duration is preserved because
 * synthesis hops on the analysis grid.
 */
function pvShiftTimeVarying(
  data: Float32Array,
  sampleRate: number,
  ratesPerTrackerHop: number[],
  trackerHop: number,
): Float32Array {
  const N = 2048;
  const hop = N / 4;
  const out = new Float32Array(data.length);
  const win = new Float32Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const lastPhase = new Float64Array(N / 2 + 1);
  const sumPhase = new Float64Array(N / 2 + 1);
  const frameMags = new Float64Array(N / 2 + 1);
  const frameAdvs = new Float64Array(N / 2 + 1);
  const frameLocked = new Float64Array(N / 2 + 1);
  const expct = (2 * Math.PI * (hop / N)) % (2 * Math.PI);
  // rate at a PV frame: linear interpolation over the tracker's hop grid
  const rateAt = (center: number): number => {
    const idx = Math.max(0, center / trackerHop);
    const i0 = Math.floor(idx);
    const f = idx - i0;
    const a = ratesPerTrackerHop[Math.min(i0, ratesPerTrackerHop.length - 1)];
    const b = ratesPerTrackerHop[Math.min(i0 + 1, ratesPerTrackerHop.length - 1)];
    return a + (b - a) * f;
  };
  let first = true;
  let lastCovered = 0;
  for (let pos = 0; pos + N <= data.length; pos += hop) {
    const r = rateAt(pos + N / 2);
    for (let i = 0; i < N; i++) {
      re[i] = data[pos + i] * win[i];
      im[i] = 0;
    }
    fftInPlace(re, im);
    // Pass 1: magnitudes + each bin's FRACTIONAL BIN POSITION. The identity
    // (Flanagan / smbPitchShift): expected per-hop advance at bin center k is
    // 2π·k·H/N (NOT the k=1 advance — an earlier build used that, which made
    // every measurement bin-ambiguous and the shift silently wrong); the
    // wrapped deviation d = wrap(Δφ − nominal) = 2π·δ·H/N recovers the
    // fractional position δ: the partial truly lives at bin k+δ.
    const mags = frameMags;
    const binPos = frameAdvs; // reuse: measured fractional bin position
    for (let k = 0; k <= N / 2; k++) {
      // TRUE Fourier coefficient — NOT 2|X|. The '×2' convention belongs to
      // analysis displays (a real sine's |X[k]| = A·W/2); in IFFT resynthesis
      // the factor 2 comes physically from summing BOTH spectral halves, so
      // writing 2|X| on both halves double-counts: measured as a uniform 2×
      // gain (rms ratio 1.956) that three earlier 'fixes' chased around.
      mags[k] = Math.hypot(re[k], im[k]);
      const ang = Math.atan2(im[k], re[k]);
      if (first) {
        binPos[k] = k;
      } else {
        const nominal = (2 * Math.PI * k * hop) / N;
        let d = ang - lastPhase[k] - nominal;
        d = d - 2 * Math.PI * Math.round(d / (2 * Math.PI));
        binPos[k] = k + (d * N) / (2 * Math.PI * hop);
      }
      lastPhase[k] = ang;
    }
    // Per-bin scaled advance (smbPitchShift formulation). NO phase locking:
    // a locking pass was tried and REMOVED — it replaced each lobe bin's
    // true per-frame increment with the peak's, so the 4 overlapping frames
    // added incoherently (r=1 identity measured at rms ×1.96 ≈ √4). With the
    // corrected per-bin measurement, plain per-bin scaling is exact at r=1
    // and tears lobes by only (r−1) of a bin ≈ 0.02 bins for snap rates.
    for (let k = 0; k <= N / 2; k++) {
      if (first) sumPhase[k] = Math.atan2(im[k], re[k]);
      else sumPhase[k] += (2 * Math.PI * binPos[k] * r * hop) / N;
      const mag = mags[k];
      const phase = ((sumPhase[k] + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      re[k] = mag * Math.cos(phase);
      im[k] = mag * Math.sin(phase);
      if (k > 0 && k < N / 2) {
        re[N - k] = re[k];
        im[N - k] = -im[k];
      }
    }
    fftInPlace(re, im, true);
    // fftInPlace's inverse already divides by N — do NOT divide again (a
    // double normalization made the first PV build ~1200× too quiet). The
    // hann² analysis+synthesis overlap at hop N/4 sums to exactly 3/2, so
    // compensate by that constant (an earlier build skipped it and the
    // output came out 1.5× hot — caught as peak 1.498 on a 1.0-input).
    for (let i = 0; i < N; i++) {
      const w = pos + i;
      if (w < out.length) out[w] += (re[i] * 2) / 3 * win[i];
    }
    lastCovered = pos + N;
    first = false;
  }
  // Tail the vocoder never reached: pass through untouched.
  for (let i = lastCovered; i < data.length; i++) out[i] = data[i];
  return out;
}

function targetMidi(midi: number, scale: number[], root: number): number {
  if (!scale.length) return Math.round(midi); // chromatic
  const pc = ((Math.round(midi) - root) % 12 + 12) % 12;
  // nearest allowed pitch class (circular)
  let best = scale[0];
  let bestDist = 12;
  for (const s of scale) {
    const d = Math.min(Math.abs(pc - s), 12 - Math.abs(pc - s));
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  // snap to the nearest octave of root+best at or around midi
  const targetPc = (root + best) % 12;
  const oct = Math.round((midi - targetPc) / 12);
  return targetPc + 12 * oct;
}

/**
 * Tape wow & flutter: playback-speed wobble via a modulated delay line.
 * wow = slow (0.5–2 Hz, deep — tape deck mechanics), flutter = fast
 * (8–15 Hz, shallow — capstan). Reads input at a moving position with
 * linear interpolation; pitch wobbles with the speed exactly like real tape.
 */
export function wowFlutter(
  data: Float32Array,
  sampleRate: number,
  o: { wowHz?: number; wowMs?: number; flutterHz?: number; flutterMs?: number } = {},
): Float32Array {
  const wowHz = o.wowHz ?? 0.8;
  const wowMs = o.wowMs ?? 4;
  const flutterHz = o.flutterHz ?? 11;
  const flutterMs = o.flutterMs ?? 0.8;
  const out = new Float32Array(data.length);
  const maxDelay = (wowMs + flutterMs) / 1000 * sampleRate + 2;
  const readAt = (pos: number): number => {
    if (pos <= 0) return data[0] ?? 0;
    const i0 = Math.floor(pos);
    if (i0 + 1 >= data.length) return data[data.length - 1] ?? 0;
    const f = pos - i0;
    return data[i0] * (1 - f) + data[i0 + 1] * f;
  };
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const delay =
      (wowMs / 1000) * Math.sin(2 * Math.PI * wowHz * t) * sampleRate +
      (flutterMs / 1000) * Math.sin(2 * Math.PI * flutterHz * t) * sampleRate;
    // delay is signed: reading AHEAD (i − negative delay) is correct for an
    // offline transform — real-time playback can only lag, but this models a
    // whole tape pass where speed wobble integrates symmetrically. Clamping
    // to ≥0 (an earlier version) halves the modulation depth AND makes the
    // wobble asymmetric (only ever flat/slow), which a zero-crossing test
    // can measure: unclamped, instantaneous frequency dips AND rises around
    // the carrier; clamped it can only dip.
    const d = Math.max(-maxDelay, Math.min(maxDelay, delay));
    out[i] = readAt(i - d);
  }
  return out;
}

/**
 * Tape saturation: asymmetric soft clip (tanh drive + even-harmonic bias)
 * plus gentle HF loss. Node-verified by harmonic content, not waveform.
 */
export function tapeSaturation(
  data: Float32Array,
  sampleRate: number,
  o: { driveDb?: number; toneHz?: number } = {},
): Float32Array {
  const drive = Math.pow(10, (o.driveDb ?? 6) / 20);
  const toneHz = o.toneHz ?? 9000;
  const lp = lowpassCoeffs(sampleRate, toneHz, Math.SQRT1_2);
  const out = new Float32Array(data.length);
  let bias = 0;
  const biasCoef = 0.02; // slow asymmetric magnetization
  for (let i = 0; i < data.length; i++) {
    const x = data[i] * drive;
    bias += biasCoef * (x - bias);
    // asymmetric soft clip: bias makes positive/negative wings differ
    const pos = Math.tanh(x + 0.15 * bias);
    const neg = Math.tanh((x + 0.15 * bias) * 0.82) / 0.82;
    out[i] = x >= 0 ? pos : neg;
  }
  return applyBiquad(out, lp);
}

/**
 * Vinylize: surface noise (lowpassed random walk), occasional crackle
 * (decaying impulses, Poisson-distributed), and a highpass to fake the
 * "warmth" of a needle NOT reproducing deep bass cleanly.
 */
export function vinylize(
  data: Float32Array,
  sampleRate: number,
  o: { crackleRate?: number; noiseDb?: number; warmHz?: number; seed?: number } = {},
): Float32Array {
  const crackleRate = o.crackleRate ?? 1.2; // crackles per second
  const noiseAmp = Math.pow(10, (o.noiseDb ?? -42) / 20);
  const warmHz = o.warmHz ?? 40;
  let seed = (o.seed ?? 987654321) | 0;
  const rand = () => {
    // 32-bit LCG via Math.imul: the naive (seed * 1103515245) overflows
    // float64's 53-bit mantissa (seed·1.1e9 ≈ 2.4e18 > 2^53), the low bits —
    // the ones (& 0x7fffffff) keeps — go degenerate, and crackle positions
    // collapsed to a handful of duplicates (caught by the Poisson-rate test).
    seed = (Math.imul(seed, 1103515245) + 12345) | 0;
    return (seed >>> 0) / 0x100000000;
  };
  const out = new Float32Array(data.length);
  const hp = highpassCoeffs(sampleRate, warmHz, Math.SQRT1_2);
  const src = applyBiquad(data, hp);
  // surface noise: one-pole lowpassed white noise (rumble-y, not hissy)
  let noise = 0;
  const nCoef = 0.15;
  // crackles: precompute EVERY impulse and its exponential decay into a
  // plain buffer. (An earlier design wrote tails back into the schedule map;
  // scheduled + tail positions then re-emitted tails recursively — loop gain
  // Σ 0.6·e^(−j/12) ≈ 6.9 ≫ 1 — and the output exploded to Infinity at the
  // first sample where two tails overlapped. Caught by the Node suite.)
  const nCrackles = Math.round((data.length / sampleRate) * crackleRate);
  const crackleBuf = new Float32Array(data.length);
  for (let k = 0; k < nCrackles; k++) {
    const pos = Math.floor(rand() * data.length);
    const amp = (rand() * 0.5 + 0.3) * (rand() < 0.5 ? -1 : 1);
    const tail = Math.min(90, data.length - pos - 1);
    for (let j = 0; j <= tail; j++) {
      crackleBuf[pos + j] += amp * Math.exp(-j / 12) * (j === 0 ? 1 : 0.6);
    }
  }
  for (let i = 0; i < data.length; i++) {
    // Calibrate the one-pole LP'd noise to the REQUESTED floor: a one-pole
    // lowpass with coefficient c attenuates white noise by exactly
    // √(c/(2−c)) (variance ratio c/(2−c)); pre-amplify the white input by
    // the inverse so the OUTPUT floor equals noiseAmp, not noiseAmp×0.28.
    noise += nCoef * ((rand() * 2 - 1) * (noiseAmp / Math.sqrt(nCoef / (2 - nCoef))) - noise);
    out[i] = src[i] + noise + crackleBuf[i];
  }
  return out;
}
