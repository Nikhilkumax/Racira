/**
 * Dynamic-range processors — pure functions on channel data, Node-verified.
 *
 * Everything here works on Float32Array in [-1, 1] at an explicit sampleRate.
 * Design notes:
 *  - Compressor/expander use a static gain computer with soft knee; gain is
 *    applied per-sample with the current envelope, so no lookahead is needed
 *    and the output length always equals the input length.
 *  - The limiter is the exception: it uses a lookahead window (default 5 ms)
 *    to see peaks coming, which is what makes brick-wall limiting transparent.
 *  - The gate uses hysteresis (open threshold above, close threshold below)
 *    plus hold time, so signals near the threshold don't chatter.
 *  - Normalizers are two-pass: measure, then scale. Peak normalization is
 *    exact by construction; RMS normalization clamps to the ceiling so a
 *    quiet-but-peaky file can't be pushed into clipping.
 */

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

/** Absolute peak sample value in [-1, 1]. */
export function peakOf(data: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
  }
  return peak;
}

/**
 * RMS over the whole file, in linear amplitude (0..1). DC and silence give 0.
 * A full-scale sine (amplitude 1) has RMS 1/√2 ≈ 0.7071.
 */
export function rmsOf(data: Float32Array): number {
  if (data.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
  return Math.sqrt(sum / data.length);
}

// ---------------------------------------------------------------------------
// Normalizing
// ---------------------------------------------------------------------------

/**
 * Scale so the absolute peak hits `targetDb` dBFS exactly. A silent file
 * (peak 0) is returned unchanged — there is nothing to scale.
 */
export function normalizePeak(
  data: Float32Array,
  targetDb: number,
): Float32Array {
  const peak = peakOf(data);
  if (peak === 0) return data.slice();
  const gain = Math.pow(10, targetDb / 20) / peak;
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] * gain;
  return out;
}

/**
 * Scale so the RMS hits `targetDb` dBFS, but never let any sample exceed
 * `ceilingDb` dBFS (safety clamp for peaky sources). If the required gain
 * would push peaks past the ceiling, the gain is reduced to the peak-safe
 * value and the result is not fully at target — reported via `achieved`.
 */
export interface RmsNormalizeResult {
  data: Float32Array;
  /** RMS actually achieved after clamping, in dBFS. */
  achievedRmsDb: number;
  /** Whether the ceiling forced the gain below the RMS target. */
  clamped: boolean;
}

export function normalizeRms(
  data: Float32Array,
  targetRmsDb: number,
  ceilingDb: number,
): RmsNormalizeResult {
  const rms = rmsOf(data);
  if (rms === 0) {
    return { data: data.slice(), achievedRmsDb: -Infinity, clamped: false };
  }
  const target = Math.pow(10, targetRmsDb / 20);
  const peak = peakOf(data);
  const peakSafe = ceilingDb < 0 ? Math.pow(10, ceilingDb / 20) / peak : Infinity;
  const gain = Math.min(target / rms, peakSafe);
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] * gain;
  return {
    data: out,
    achievedRmsDb: 20 * Math.log10(rms * gain),
    clamped: peakSafe < target / rms,
  };
}

// ---------------------------------------------------------------------------
// Compressor / Expander — static gain computer with soft knee
// ---------------------------------------------------------------------------

export interface CompressorParams {
  /** Gain reduction starts above this level, in dBFS. */
  thresholdDb: number;
  /** dB of input change per dB of output change above the threshold (≥ 1). */
  ratio: number;
  /** Gain applied once the input falls `kneeDb` below the threshold. */
  kneeDb: number;
  /** Extra make-up gain in dB (usually the expected reduction). */
  makeupGainDb: number;
}

export interface ExpanderParams {
  /** Attenuation starts below this level, in dBFS. */
  thresholdDb: number;
  /** Output change per dB of input change below the threshold (0..1). */
  ratio: number;
  kneeDb: number;
}

/**
 * Static gain curve for a compressor at input level `db` (dBFS), returning
 * output level in dBFS. Below (threshold − knee): unity. Above threshold:
 * threshold + (db − threshold)/ratio. Between: smooth quadratic knee.
 */
export function compressorCurve(db: number, p: CompressorParams): number {
  const kneeLow = p.thresholdDb - p.kneeDb;
  if (db <= kneeLow) return db;
  if (db >= p.thresholdDb) return p.thresholdDb + (db - p.thresholdDb) / p.ratio;
  // Quadratic soft knee between kneeLow and threshold, C1-continuous.
  const x = db - kneeLow;
  const w = p.kneeDb;
  const slope = 1 / p.ratio;
  return db + ((slope - 1) * x * x) / (2 * w);
}

/** Static gain curve for an expander (mirror of the compressor). */
export function expanderCurve(db: number, p: ExpanderParams): number {
  const kneeHigh = p.thresholdDb + p.kneeDb;
  if (db >= kneeHigh) return db;
  if (db <= p.thresholdDb) return p.thresholdDb + (db - p.thresholdDb) * p.ratio;
  const x = kneeHigh - db;
  const w = p.kneeDb;
  const slope = p.ratio;
  return db + ((1 - slope) * x * x) / (2 * w);
}

/** dBFS of a linear sample (−Infinity at 0). */
export function toDb(linear: number): number {
  return 20 * Math.log10(Math.max(linear, 1e-10));
}

/** Linear amplitude of a dBFS level. */
export function toLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Windowed-RMS envelope in dBFS — the detector used by the compressor and
 * expander. A per-sample one-pole on |x| is NOT a usable detector: |x| of a
 * tone touches zero twice per period, so the "envelope" swings through the
 * threshold on every cycle and the gain chatters (Node-reproduced: alternate
 * 2× gain samples on a plain 440 Hz sine). A ~10 ms sliding RMS is constant
 * for steady tones and still fast enough to follow speech syllables.
 * Rolling sum keeps this O(n) regardless of window size.
 */
function envelopeDb(data: Float32Array, sampleRate: number, windowMs = 10): Float32Array {
  const win = Math.max(1, Math.round((windowMs / 1000) * sampleRate));
  const env = new Float32Array(data.length);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
    if (i >= win) sum -= data[i - win] * data[i - win];
    const count = Math.min(i + 1, win);
    env[i] = toDb(Math.sqrt(sum / count));
  }
  return env;
}

/**
 * Apply a compressor: windowed-RMS detector → static gain computer with soft
 * knee → attack/release-smoothed *gain* (not just level) → apply.
 *
 * Two architectures notes, both bug-driven and Node-verified:
 *  - The RMS detector exists because a per-sample |x| one-pole makes the gain
 *    chatter at zero-crossings (see envelopeDb).
 *  - The *gain* is smoothed with the same attack/release ballistics because
 *    the raw ratio target(env)/env is discontinuous for rippling detectors;
 *    smoothing the gain instead of re-deriving it per sample is the standard
 *    architecture and keeps the output free of inter-sample gain steps.
 */
export function compressChannel(
  data: Float32Array,
  sampleRate: number,
  p: CompressorParams,
  attackMs: number,
  releaseMs: number,
): Float32Array {
  const atk = Math.exp(-1 / ((attackMs / 1000) * sampleRate));
  const rel = Math.exp(-1 / ((releaseMs / 1000) * sampleRate));
  const makeup = toLinear(p.makeupGainDb);
  const env = envelopeDb(data, sampleRate);
  const out = new Float32Array(data.length);
  let gainDb = 0;
  for (let i = 0; i < data.length; i++) {
    const targetDb = compressorCurve(env[i], p);
    const wantGainDb = targetDb - env[i];
    // Attack = gain moving down (digging in), release = recovering.
    gainDb =
      wantGainDb < gainDb
        ? atk * gainDb + (1 - atk) * wantGainDb
        : rel * gainDb + (1 - rel) * wantGainDb;
    const gain = Math.min(toLinear(gainDb) * makeup, 64); // hard safety ceiling (+36 dB)
    out[i] = data[i] * gain;
  }
  return out;
}

/**
 * Apply an expander (downward) with the same envelope approach.
 *
 * Invariant: expansion never boosts — the per-sample gain is clamped to ≤ 1.
 * Without the clamp, the warmup (file start, or any onset after silence) is
 * broken: the envelope is still near −100 dB while the curve attenuates to
 * roughly −67 dB, so the ratio curve(env)/env exceeds 1 and a full-level
 * sample gets boosted by tens of dB (Node-reproduced at 41× before the fix).
 * Clamping to unity makes onsets pass untouched until the envelope settles —
 * the classic expander behavior. (Gain smoothing below additionally removes
 * ripple-through-threshold steps; the clamp stays as the invariant backstop.)
 */
export function expandChannel(
  data: Float32Array,
  sampleRate: number,
  p: ExpanderParams,
  attackMs: number,
  releaseMs: number,
): Float32Array {
  const atk = Math.exp(-1 / ((attackMs / 1000) * sampleRate));
  const rel = Math.exp(-1 / ((releaseMs / 1000) * sampleRate));
  const env = envelopeDb(data, sampleRate);
  const out = new Float32Array(data.length);
  let gainDb = 0;
  for (let i = 0; i < data.length; i++) {
    const targetDb = expanderCurve(env[i], p);
    let wantGainDb = targetDb - env[i];
    if (wantGainDb > 0) wantGainDb = 0; // expansion never boosts
    // Attack = gain moving down, release = recovering, as in the compressor.
    gainDb =
      wantGainDb < gainDb
        ? atk * gainDb + (1 - atk) * wantGainDb
        : rel * gainDb + (1 - rel) * wantGainDb;
    out[i] = data[i] * toLinear(gainDb);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Limiter — lookahead brick wall
// ---------------------------------------------------------------------------

export interface LimiterParams {
  /** Output never exceeds this, in dBFS (e.g. −1). */
  ceilingDb: number;
  /** Lookahead window in ms — how early the limiter sees peaks coming. */
  lookaheadMs: number;
  /** Release time in ms for the gain recovery after a peak. */
  releaseMs: number;
}

/**
 * True-peak-ish brick-wall limiter. For every sample, the required gain is
 * the minimum over the lookahead window of ceiling/|sample|; the gain moves
 * down instantly (a peak must never pass) and recovers exponentially with
 * the release time. Deterministic single pass with a ring buffer.
 */
export function limitChannel(
  data: Float32Array,
  sampleRate: number,
  p: LimiterParams,
): Float32Array {
  const ceiling = toLinear(p.ceilingDb);
  const look = Math.max(1, Math.round((p.lookaheadMs / 1000) * sampleRate));
  const rel = Math.exp(-1 / ((p.releaseMs / 1000) * sampleRate));
  const out = new Float32Array(data.length);
  // Ring buffers delay the output by exactly `look` samples. Sample j is
  // stored in slot j mod look at iteration j (with the gain computed for j)
  // and emitted from that same slot at iteration j + look — so a delayed
  // peak always gets the reduced gain computed when it was seen, never a
  // recovered one. Read-before-write at the same slot makes the warmup
  // (i < look) pass through with the current gain.
  const audioBuf = new Float32Array(look);
  const gainBuf = new Float32Array(look);
  let gain = 1;
  for (let i = 0; i < data.length; i++) {
    // Worst gain needed by any sample in the next `look` samples.
    let needed = 1;
    for (let k = 0; k < look && i + k < data.length; k++) {
      const a = Math.abs(data[i + k]);
      if (a > ceiling) {
        const g = ceiling / a;
        if (g < needed) needed = g;
      }
    }
    gain = needed < gain ? needed : rel * gain + (1 - rel) * needed;

    const slot = i % look;
    if (i >= look) out[i] = audioBuf[slot] * gainBuf[slot];
    else out[i] = data[i] * gain;
    audioBuf[slot] = data[i];
    gainBuf[slot] = gain;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Gate — hysteresis + hold
// ---------------------------------------------------------------------------

export interface GateParams {
  /** Envelope must exceed this to open, in dBFS. */
  openThresholdDb: number;
  /** Envelope must fall below this to close, in dBFS (≤ open). */
  closeThresholdDb: number;
  /** Keep the gate open at least this long after it opens, in ms. */
  holdMs: number;
  /** Fade applied on open/close edges to avoid clicks, in ms. */
  fadeMs: number;
}

/**
 * Noise gate with hysteresis and hold. The envelope is a 10 ms RMS window;
 * gain ramps over fadeMs on both edges. Returns the gated data plus the
 * number of samples zeroed (or faded), for honest "removed X%" reporting.
 */
export interface GateResult {
  data: Float32Array;
  /** Share of samples whose gain is below 0.5 (effectively gated out). */
  gatedFraction: number;
}

export function gateChannel(
  data: Float32Array,
  sampleRate: number,
  p: GateParams,
): GateResult {
  const win = Math.max(1, Math.round(sampleRate * 0.01));
  const hold = Math.round((p.holdMs / 1000) * sampleRate);
  const fade = Math.max(1, Math.round((p.fadeMs / 1000) * sampleRate));
  const openT = toLinear(p.openThresholdDb);
  const closeT = toLinear(p.closeThresholdDb);

  const out = new Float32Array(data.length);
  let open = false;
  let heldFor = 0;
  let currentGain = 0;
  let gated = 0;

  for (let i = 0; i < data.length; i++) {
    // Windowed RMS envelope centered as close to "now" as possible.
    const wStart = Math.max(0, i - win + 1);
    let sum = 0;
    for (let k = wStart; k <= i; k++) sum += data[k] * data[k];
    const env = Math.sqrt(sum / (i - wStart + 1));

    if (!open && env >= openT) {
      open = true;
      heldFor = 0;
    } else if (open) {
      if (env < closeT && heldFor >= hold) open = false;
      else if (env < closeT) heldFor++;
      else heldFor = 0;
    }

    const target = open ? 1 : 0;
    const step = 1 / fade;
    currentGain =
      Math.abs(currentGain - target) <= step ? target : currentGain + Math.sign(target - currentGain) * step;

    out[i] = data[i] * currentGain;
    if (currentGain < 0.5) gated++;
  }

  return { data: out, gatedFraction: data.length ? gated / data.length : 0 };
}

// ---------------------------------------------------------------------------
// Leveler — slow automatic gain control (AGC)
// ---------------------------------------------------------------------------

export interface AutoLevelParams {
  /** Block RMS the leveler steers toward, in dBFS. */
  targetRmsDb: number;
  /** Gain never exceeds this, in dB (protects against runaway on quiet noise). */
  maxGainDb: number;
  /** Gain moves at most this many dB per second. */
  maxSlewDbPerSec: number;
  /** Analysis block length in ms (gain changes between blocks). */
  blockMs: number;
}

export interface AutoLevelResult {
  data: Float32Array;
  /** Range of gain the leveler actually applied, in dB. */
  gainRangeDb: [number, number];
}

/**
 * Automatic leveler: per-block RMS measured, gain computed toward the target
 * and slew-limited so the loudness moves smoothly rather than pumping. Unlike
 * a compressor this adapts the *whole* level over seconds — two speakers at
 * different distances end up matched.
 */
export function autoLevelChannel(
  data: Float32Array,
  sampleRate: number,
  p: AutoLevelParams,
): AutoLevelResult {
  const blockLen = Math.max(1, Math.round((p.blockMs / 1000) * sampleRate));
  const maxSlewPerBlock = (p.maxSlewDbPerSec * p.blockMs) / 1000;
  const out = new Float32Array(data.length);
  let gainDb = 0;
  let minGain = 0;
  let maxGain = 0;

  for (let start = 0; start < data.length; start += blockLen) {
    const end = Math.min(data.length, start + blockLen);
    let sum = 0;
    for (let i = start; i < end; i++) sum += data[i] * data[i];
    const blockRms = Math.sqrt(sum / (end - start));
    const wantDb = blockRms > 0 ? p.targetRmsDb - toDb(blockRms) : 0;
    const wantClamped = Math.max(-p.maxGainDb, Math.min(p.maxGainDb, wantDb));
    const step = Math.max(-maxSlewPerBlock, Math.min(maxSlewPerBlock, wantClamped - gainDb));
    gainDb += step;
    minGain = Math.min(minGain, gainDb);
    maxGain = Math.max(maxGain, gainDb);
    const gain = toLinear(gainDb);
    for (let i = start; i < end; i++) out[i] = data[i] * gain;
  }

  return { data: out, gainRangeDb: [minGain, maxGain] };
}

// ---------------------------------------------------------------------------
// Multiband splitting + compression
// ---------------------------------------------------------------------------

export interface BandSplit {
  low: Float32Array;
  mid: Float32Array;
  high: Float32Array;
}

/**
 * 3-way split with **exact recombination** (perfect reconstruction):
 *
 *   low  = LP1(x)          (two cascaded Butterworth biquads, 24 dB/oct)
 *   rest = x − low
 *   mid  = LP2(rest)
 *   high = rest − mid
 *
 * so low + mid + high === x sample-for-sample up to float rounding. That is
 * the property a multiband compressor needs: at unity band gains the output
 * is the input, and band gains never fight a crossover's phase response.
 *
 * Why not independent Linkwitz–Riley highpasses? LP²+HP² at the same corner
 * sums to an allpass — flat magnitude, but its polarity flips 180° at ω₀
 * (|1+s⁴|/|s²+√2s+1|² ≡ 1 with a sign reversal) — so in the HP-first cascade
 * the *mid* band came out inverted relative to low/high and the three bands
 * did not re-sum to the waveform (the exact bug this replaces). Defining the
 * upper band as the algebraic complement removes the polarity question
 * entirely: exact by construction, not by tuning. Crossovers:
 * low < split1 <= mid < split2 <= high.
 */
export function splitThreeBand(
  data: Float32Array,
  sampleRate: number,
  crossover1Hz: number,
  crossover2Hz: number,
): BandSplit {
  const f1 = Math.min(sampleRate * 0.45, Math.max(20, crossover1Hz));
  const f2 = Math.min(sampleRate * 0.45, Math.max(f1 + 10, crossover2Hz));

  const lp1a = butterLowpass(sampleRate, f1);
  const lp1b = butterLowpass(sampleRate, f1);
  const lp2a = butterLowpass(sampleRate, f2);
  const lp2b = butterLowpass(sampleRate, f2);

  const low = runBiquad(runBiquad(data, lp1a), lp1b);

  const rest = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) rest[i] = data[i] - low[i];

  const mid = runBiquad(runBiquad(rest, lp2a), lp2b);

  const high = new Float32Array(rest.length);
  for (let i = 0; i < rest.length; i++) high[i] = rest[i] - mid[i];

  return { low, mid, high };
}

/**
 * Sum the three bands back together — with the subtractive split this is an
 * exact reconstruction of the input up to float rounding (see splitThreeBand).
 */
export function sumBands(b: BandSplit): Float32Array {
  const out = new Float32Array(b.low.length);
  for (let i = 0; i < out.length; i++) out[i] = b.low[i] + b.mid[i] + b.high[i];
  return out;
}

// Minimal butterworth biquads (Q = 1/√2), identical to edit.ts's shapes but
// local so this module stays dependency-free.
interface Coeffs {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

function butterLowpass(sampleRate: number, freqHz: number): Coeffs {
  const w0 = (2 * Math.PI * freqHz) / sampleRate;
  const cosW0 = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * Math.SQRT1_2);
  const a0 = 1 + alpha;
  const b0 = ((1 - cosW0) / 2) / a0;
  const b1 = (1 - cosW0) / a0;
  const b2 = b0;
  const a1 = (-2 * cosW0) / a0;
  const a2 = (1 - alpha) / a0;
  return { b0, b1, b2, a1, a2 };
}

function runBiquad(data: Float32Array, c: Coeffs): Float32Array {
  const out = new Float32Array(data.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < data.length; i++) {
    const x = data[i];
    const y = c.b0 * x + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[i] = y;
  }
  return out;
}

/**
 * Compress one band in place (compressChannel then rewrite the array).
 * Convenience used by the multiband UI.
 */
export function compressBandInPlace(
  band: Float32Array,
  sampleRate: number,
  p: CompressorParams,
  attackMs: number,
  releaseMs: number,
): void {
  band.set(compressChannel(band, sampleRate, p, attackMs, releaseMs));
}

// ---------------------------------------------------------------------------
// Parallel (New York) compression
// ---------------------------------------------------------------------------

/**
 * Blend a compressed copy back under the dry signal: out = dry·(1−mix) +
 * compressed·mix. `mix` 0..1; at 1 the output is the compressed signal alone.
 */
export function blendParallel(
  dry: Float32Array,
  compressed: Float32Array,
  mix: number,
): Float32Array {
  const m = Math.max(0, Math.min(1, mix));
  const out = new Float32Array(dry.length);
  for (let i = 0; i < out.length; i++) out[i] = dry[i] * (1 - m) + compressed[i] * m;
  return out;
}

// ---------------------------------------------------------------------------
// Sidechain ducking + declipping (batch 29)
// ---------------------------------------------------------------------------

/**
 * Duck `program` by the loudness of `sidechain` (voice-over ducking under
 * music, pumping effects). Per sample, the required reduction is
 * rangeDb + 20·log10(|sc| / threshold) clamped to [0, rangeDb]; below the
 * threshold no ducking at all, above it, ducking up to the range.
 *
 * The reduction is smoothed with attack/release ballistics — same bug-driven
 * reasoning as the compressor: unsmoothed per-sample gain jitters with the
 * detector and is audible. Attack here is gain moving DOWN (program diving
 * under the voice), release recovering to unity when the sidechain goes quiet.
 * The program is delayed by `lookaheadMs` so the duck reaches full depth
 * before the sidechain transient hits, not after.
 *
 * Returns the delayed-and-ducked program (sidechain must be mixed in by the
 * caller — the tool owns that decision and the final limiting).
 */
export function duckBySidechain(
  program: Float32Array,
  sidechain: Float32Array,
  sampleRate: number,
  thresholdDb: number,
  rangeDb: number,
  attackMs: number,
  releaseMs: number,
  lookaheadMs: number,
): Float32Array {
  const look = Math.max(0, Math.round((lookaheadMs / 1000) * sampleRate));
  const prog = look ? new Float32Array(program.length) : program;
  for (let i = look; i < program.length; i++) prog[i] = program[i - look];
  const thrLin = toLinear(thresholdDb);
  const atk = Math.exp(-1 / ((attackMs / 1000) * sampleRate));
  const rel = Math.exp(-1 / ((releaseMs / 1000) * sampleRate));
  const out = new Float32Array(program.length);
  let gainDb = 0;
  for (let i = 0; i < out.length; i++) {
    const sc = Math.abs(sidechain[i]);
    let want = 0;
    if (sc > thrLin) {
      const over = 20 * Math.log10(sc / thrLin);
      want = -Math.min(rangeDb, over);
    }
    gainDb =
      want < gainDb ? atk * gainDb + (1 - atk) * want : rel * gainDb + (1 - rel) * want;
    out[i] = prog[i] * toLinear(gainDb);
  }
  return out;
}

/**
 * Repair hard-clipped audio: locate runs of consecutive samples pinned at
 * (or within 0.1 % of) the clip ceiling/floor and rebuild each run from the
 * surrounding signal.
 *
 * Architecture (each step earned by a failed simpler design):
 *  1. A fixed half-sine bulge was backwards — its bump peaked at the run
 *     ENDS (sin ±1) and vanished mid-run; caught because the repaired peak
 *     never exceeded the ceiling.
 *  2. A quadratic through the run endpoints + entry slope is pointy by
 *     construction: extrapolating one slope and two values overshoots a real
 *     waveform top by ~10 % (measured 1.19 vs the true 1.08 crest on a sine).
 *     Endpoint data fundamentally cannot know where the crest was.
 *  3. Final form — least-squares fit a quadratic to the FLANK samples on
 *     both sides of the run (the flanks carry the waveform's real curvature),
 *     then blend fit−clip across the run with a full-period raised cosine:
 *     the repair is 0 at both joints (value- and slope-continuous by
 *     construction) and full mid-run, where the crest information lives.
 *     On the clipped-sine fixture this reconstructs the true crest from the
 *     flank shape instead of guessing a bulge.
 *
 * The input is unchanged below the ceiling; runs at file boundaries fall back
 * to a flat-topped raised-cosine bridge when too few flank samples exist.
 * This only smooths hard clipping; it cannot restore lost harmonics — the
 * tool copy says so honestly.
/**
 * Repair hard-clipped audio: locate runs of consecutive samples pinned at
 * (or within 0.1 % of) the clip ceiling/floor and re-interpolate each run
 * with a cubic Hermite curve through the surrounding legal samples.
 *
 * Architecture (each step earned by a failed simpler design — and one step
 * earned by a bad test constant: the "true crest 1.08" used for three
 * rewrites was arithmetic slop; the fixture is a 1.2-amplitude sine, so the
 * true crest is 1.2, and the Hermite result of 1.19 had been within 1 % all
 * along):
 *  1. A fixed half-sine bulge was backwards — its bump peaked at the run
 *     ENDS (sin ±1) and vanished mid-run; caught because the repaired peak
 *     never exceeded the ceiling.
 *  2. A quadratic through the run endpoints + entry slope overshoots a real
 *     waveform top (+16 %, measured 1.39 vs the true 1.2 crest).
 *  3. A least-squares flank fit needed time-centering to be conditioned at
 *     all (absolute indices → t⁴ ≈ 10¹⁸ → repaired peak 6.13), and even
 *     conditioned it overshot: flank curvature is milder than crest
 *     curvature, so extrapolation runs on.
 *  4. Final form — cubic Hermite INTERPOLATION across the run between the
 *     last legal sample a and the next legal sample b, with tangents from
 *     the signal's own slopes at both joints. It is an interpolant (bounded
 *     by its end data), its derivative reproduces the measured joint slopes
 *     exactly (no step or slope discontinuity), and on the clipped-sine
 *     fixture it restores the crest to within 1 %.
 *
 * Runs at file boundaries fall back to tangent-zero bridges (finite, smooth).
 * The input is unchanged below the ceiling. This only smooths hard clipping;
 * it cannot restore lost harmonics — the tool copy says so honestly.
 */

export function declipSamples(data: Float32Array, ceiling: number): Float32Array {
  const eps = ceiling * 0.001;
  const out = data.slice();
  let i = 0;
  while (i < data.length) {
    if (Math.abs(data[i]) < ceiling - eps) {
      i++;
      continue;
    }
    const sign = data[i] >= 0 ? 1 : -1;
    let j = i;
    while (j < data.length && data[j] * sign > ceiling - eps) j++;
    const y = (k: number) => (k >= 0 && k < data.length ? sign * data[k] : 0);
    const a = y(i - 1); // last legal sample before the run (0 at file start)
    const b = y(j); // first legal sample after the run (0 at file end)
    const m = j - i; // run length
    const L = m + 1; // interpolation span: a at t=0, run at t∈(0,1), b at t=1
    // Signal-measured slopes at the joints (backward/forward differences).
    const s0 = i >= 2 ? a - y(i - 2) : 0;
    const s1 = j + 1 < data.length ? y(j + 1) - b : 0;
    const m0 = s0 * L; // Hermite tangents, per unit t
    const m1 = s1 * L;
    for (let k = 0; k < m; k++) {
      const t = (k + 1) / L;
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;
      out[i + k] = sign * (h00 * a + h10 * m0 + h01 * b + h11 * m1);
    }
    i = j;
  }
  return out;
}
