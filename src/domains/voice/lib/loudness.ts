/**
 * Loudness normalization for the Voice domain's finished clip.
 *
 * The speech engine's own output level varies by voice and tier — measured at
 * roughly -19 to -21 dBFS gated speech RMS — which is quiet next to typical
 * spoken-word audio. This module applies one fixed gain, decided from the whole
 * joined buffer, so every voice lands at a comparable, podcast-like level.
 *
 * It runs once, on the joined samples, after the inter-chunk seams exist and
 * before either encoder sees a sample. Never per chunk: a per-chunk decision
 * would step the level at every seam, and the seam is exactly where a listener
 * is most likely to notice it.
 *
 * The design is deliberately narrow: a single constant gain, capped by
 * headroom, with a gentle lookahead limiter only when the peak would otherwise
 * cross the ceiling, and only for at most 3 dB. No compression, no EQ, no
 * dynamics beyond that limiter. A clip that is already loud is left alone.
 *
 * Pure and dependency-free: plain float math over a Float32Array, no DOM, no
 * engine, no imports. Everything is deterministic — the same input produces
 * the same output bytes.
 */

/** Analysis window for the speech gate, in seconds. */
export const GATE_WINDOW_SEC = 0.05;

/**
 * A window quieter than this counts as silence. An absolute threshold rather
 * than a relative one: the engine's output is digital-clean, so anything below
 * -50 dBFS inside speech is pause, padding or the seam gaps, not signal.
 */
export const GATE_THRESHOLD_DB = -50;

/**
 * Target gated speech loudness, in dBFS. -18 dBFS gated RMS measures as about
 * -18.5 LUFS integrated on this material, which sits inside the -16 to -19 LUFS
 * range spoken-word audio is mastered to, and leaves typical speech (crest
 * factor 15-17 dB) peaking near -2 dBFS — so the limiter stays idle on normal
 * text and only engages on unusually peaky clips.
 */
export const TARGET_SPEECH_RMS_DB = -18;

/**
 * Hard ceiling on the boost. Beyond this a clip is not quiet speech but
 * something else (a broken model, a near-silent capture), and amplifying it
 * 15 dB would only amplify the problem.
 */
export const MAX_BOOST_DB = 15;

/** The post-gain peak may not exceed this. */
export const PEAK_CEILING_DB = -1;

/**
 * The most the limiter may ever work. If reaching the target would need more
 * gain reduction than this, the gain is lowered instead — the clip ends up
 * quieter than target rather than audibly squeezed.
 */
export const MAX_LIMITER_REDUCTION_DB = 3;

/** Clips shorter than this are left untouched: not enough signal to judge. */
export const MIN_CLIP_SEC = 0.3;

/**
 * A clip whose gated speech covers less of its length than this is treated as
 * "nearly all silence" and left alone. Without it, a mostly-empty buffer would
 * be boosted 15 dB on the strength of a few speech windows.
 */
export const MIN_SPEECH_FRACTION = 0.1;

/** Lookahead for the limiter, in seconds. */
export const LOOKAHEAD_SEC = 0.005;

/** Limiter gain-reduction time constants, in seconds. */
export const LIMITER_ATTACK_SEC = 0.0005;
export const LIMITER_RELEASE_SEC = 0.08;

export interface LoudnessOptions {
  targetSpeechRmsDb?: number;
  maxBoostDb?: number;
  peakCeilingDb?: number;
  maxLimiterReductionDb?: number;
  minClipSec?: number;
  minSpeechFraction?: number;
}

export interface LoudnessReport {
  /** Whether a gain was applied. False means the input was returned as-is. */
  applied: boolean;
  /** Why nothing was done, when nothing was done. */
  skipReason: "too-short" | "silence" | "already-loud" | null;
  /** The fixed gain applied, in dB. */
  gainDb: number;
  /** Peak gain reduction the limiter applied, in dB (0 when it never engaged). */
  limiterReductionDb: number;
  /** Gated speech RMS before, in dBFS. */
  speechRmsDbBefore: number;
  /** Gated speech RMS after, in dBFS. */
  speechRmsDbAfter: number;
  /** Sample peak before, in dBFS. */
  peakDbBefore: number;
  /** Sample peak after, in dBFS. */
  peakDbAfter: number;
  /** Share of analysis windows that counted as speech, in [0, 1]. */
  speechFraction: number;
}

export interface LoudnessResult {
  /**
   * The processed buffer. The input reference itself when no gain applies —
   * callers must not assume a fresh allocation.
   */
  samples: Float32Array;
  report: LoudnessReport;
}

function toDb(value: number): number {
  return value > 0 ? 20 * Math.log10(value) : -Infinity;
}

function fromDb(db: number): number {
  return 10 ** (db / 20);
}

interface SpeechMeasurement {
  speechRms: number;
  peak: number;
  speechFraction: number;
}

/**
 * Gated measurement of the speech portion: non-overlapping 50 ms windows, with
 * windows below the gate excluded. The peak is taken over every sample,
 * including the sub-window tail, since a single loud sample outside the gate
 * still has to fit under the ceiling.
 */
function measureSpeech(samples: Float32Array, sampleRate: number): SpeechMeasurement {
  const windowLength = Math.max(1, Math.round(sampleRate * GATE_WINDOW_SEC));
  const gate = fromDb(GATE_THRESHOLD_DB);

  let peak = 0;
  let speechEnergy = 0;
  let speechSamples = 0;
  let windows = 0;
  let speechWindows = 0;

  for (let at = 0; at + windowLength <= samples.length; at += windowLength) {
    windows++;
    let windowEnergy = 0;
    for (let i = at; i < at + windowLength; i++) {
      const value = samples[i];
      windowEnergy += value * value;
      const magnitude = value < 0 ? -value : value;
      if (magnitude > peak) peak = magnitude;
    }
    if (Math.sqrt(windowEnergy / windowLength) > gate) {
      speechEnergy += windowEnergy;
      speechSamples += windowLength;
      speechWindows++;
    }
  }

  for (let i = windows * windowLength; i < samples.length; i++) {
    const magnitude = samples[i] < 0 ? -samples[i] : samples[i];
    if (magnitude > peak) peak = magnitude;
  }

  return {
    speechRms: speechSamples > 0 ? Math.sqrt(speechEnergy / speechSamples) : 0,
    peak,
    speechFraction: windows > 0 ? speechWindows / windows : 0,
  };
}

/**
 * Apply `gain` while holding the output at or below `ceiling`, using a
 * feed-forward lookahead limiter.
 *
 * The gain-reduction envelope is the exact sliding maximum of |x| over the
 * lookahead window, smoothed with a fast attack and a slow release. Because the
 * window includes the current sample, `required` can never let a sample through
 * above the ceiling on its own, and the output takes the tighter of the two —
 * so the ceiling holds sample-exactly while the reduction still releases
 * smoothly rather than pumping.
 */
function applyGainWithLimiter(
  samples: Float32Array,
  gain: number,
  ceiling: number,
  sampleRate: number,
): { out: Float32Array; minReductionLinear: number } {
  const n = samples.length;
  const lookahead = Math.max(1, Math.round(sampleRate * LOOKAHEAD_SEC));
  const capacity = lookahead + 1;
  const out = new Float32Array(n);

  // Monotonic deque over |x|, as a ring buffer of (value, index) pairs.
  const values = new Float64Array(capacity);
  const indices = new Int32Array(capacity);
  let head = 0;
  let tail = 0;

  const attack = 1 - Math.exp(-1 / (sampleRate * LIMITER_ATTACK_SEC));
  const release = 1 - Math.exp(-1 / (sampleRate * LIMITER_RELEASE_SEC));
  let reduction = 1;
  let minReduction = 1;

  for (let i = 0; i < n; i++) {
    const magnitude = samples[i] < 0 ? -samples[i] : samples[i];

    while (head < tail && indices[head % capacity] < i - lookahead) head++;
    while (tail > head && values[(tail - 1) % capacity] <= magnitude) tail--;
    values[tail % capacity] = magnitude;
    indices[tail % capacity] = i;
    tail++;

    const envelope = values[head % capacity];
    const required = envelope > 0 ? Math.min(1, ceiling / (gain * envelope)) : 1;
    reduction += (required - reduction) * (required < reduction ? attack : release);

    const applied = reduction < required ? reduction : required;
    if (applied < minReduction) minReduction = applied;
    out[i] = samples[i] * gain * applied;
  }

  return { out, minReductionLinear: minReduction };
}

/**
 * Normalize `samples` (mono, in [-1, 1]) to the target speech loudness.
 *
 * Applies one fixed gain, decided from the whole buffer, so the result is
 * level-consistent end to end. The gain never reduces an already-loud clip
 * (only a trim to satisfy the ceiling), never exceeds the boost cap, and never
 * pushes the peak above the ceiling — the limiter bridges at most 3 dB of
 * excess, and anything beyond that lowers the gain instead.
 */
export function normalizeSpeechLoudness(
  samples: Float32Array,
  sampleRate: number,
  options: LoudnessOptions = {},
): LoudnessResult {
  const targetDb = options.targetSpeechRmsDb ?? TARGET_SPEECH_RMS_DB;
  const maxBoostDb = options.maxBoostDb ?? MAX_BOOST_DB;
  const ceilingDb = options.peakCeilingDb ?? PEAK_CEILING_DB;
  const maxLimiterDb = options.maxLimiterReductionDb ?? MAX_LIMITER_REDUCTION_DB;
  const minClipSec = options.minClipSec ?? MIN_CLIP_SEC;
  const minSpeechFraction = options.minSpeechFraction ?? MIN_SPEECH_FRACTION;

  const before = measureSpeech(samples, sampleRate);
  const report: LoudnessReport = {
    applied: false,
    skipReason: null,
    gainDb: 0,
    limiterReductionDb: 0,
    speechRmsDbBefore: toDb(before.speechRms),
    speechRmsDbAfter: toDb(before.speechRms),
    peakDbBefore: toDb(before.peak),
    peakDbAfter: toDb(before.peak),
    speechFraction: before.speechFraction,
  };

  const unchanged: LoudnessResult = { samples, report };

  if (samples.length / sampleRate < minClipSec) {
    report.skipReason = "too-short";
    return unchanged;
  }
  if (before.speechRms <= 0 || before.speechFraction < minSpeechFraction) {
    report.skipReason = "silence";
    return unchanged;
  }

  const measuredDb = toDb(before.speechRms);
  const peakDb = toDb(before.peak);
  const ceiling = fromDb(ceilingDb);

  let gainDb: number;
  let limiterNeeded = false;

  if (measuredDb >= targetDb) {
    // Already at or above target: no boost, and no reduction either — except
    // the small trim that keeps an over-ceiling peak legal.
    gainDb = Math.min(0, ceilingDb - peakDb);
  } else {
    gainDb = Math.min(targetDb - measuredDb, maxBoostDb);
    const headroomDb = ceilingDb - peakDb;
    if (gainDb > headroomDb) {
      // Anything above the headroom has to be caught by the limiter, in both
      // branches below: the ceiling is what the limiter exists for, and the
      // alternative is an unclipped peak above the ceiling.
      limiterNeeded = true;
      const excessDb = gainDb - headroomDb;
      if (excessDb > maxLimiterDb) {
        // More reduction than the limiter is allowed to take: lower the gain
        // so the limiter only ever bridges the last few dB.
        gainDb = headroomDb + maxLimiterDb;
      }
    }
  }

  if (gainDb === 0 && !limiterNeeded) {
    report.skipReason = "already-loud";
    return unchanged;
  }

  const gain = fromDb(gainDb);
  let out: Float32Array;
  if (limiterNeeded) {
    const limited = applyGainWithLimiter(samples, gain, ceiling, sampleRate);
    out = limited.out;
    // The deepest dip of the gain-reduction envelope, in dB.
    report.limiterReductionDb = -toDb(limited.minReductionLinear);
  } else {
    out = new Float32Array(samples.length);
    for (let i = 0; i < samples.length; i++) out[i] = samples[i] * gain;
  }

  const after = measureSpeech(out, sampleRate);
  report.applied = true;
  report.gainDb = gainDb;
  report.speechRmsDbAfter = toDb(after.speechRms);
  report.peakDbAfter = toDb(after.peak);

  return { samples: out, report };
}
