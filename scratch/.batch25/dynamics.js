"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.peakOf = peakOf;
exports.rmsOf = rmsOf;
exports.normalizePeak = normalizePeak;
exports.normalizeRms = normalizeRms;
exports.compressorCurve = compressorCurve;
exports.expanderCurve = expanderCurve;
exports.toDb = toDb;
exports.toLinear = toLinear;
exports.compressChannel = compressChannel;
exports.expandChannel = expandChannel;
exports.limitChannel = limitChannel;
exports.gateChannel = gateChannel;
exports.autoLevelChannel = autoLevelChannel;
exports.splitThreeBand = splitThreeBand;
exports.sumBands = sumBands;
exports.compressBandInPlace = compressBandInPlace;
exports.blendParallel = blendParallel;
// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------
/** Absolute peak sample value in [-1, 1]. */
function peakOf(data) {
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
        const a = Math.abs(data[i]);
        if (a > peak)
            peak = a;
    }
    return peak;
}
/**
 * RMS over the whole file, in linear amplitude (0..1). DC and silence give 0.
 * A full-scale sine (amplitude 1) has RMS 1/√2 ≈ 0.7071.
 */
function rmsOf(data) {
    if (data.length === 0)
        return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i++)
        sum += data[i] * data[i];
    return Math.sqrt(sum / data.length);
}
// ---------------------------------------------------------------------------
// Normalizing
// ---------------------------------------------------------------------------
/**
 * Scale so the absolute peak hits `targetDb` dBFS exactly. A silent file
 * (peak 0) is returned unchanged — there is nothing to scale.
 */
function normalizePeak(data, targetDb) {
    const peak = peakOf(data);
    if (peak === 0)
        return data.slice();
    const gain = Math.pow(10, targetDb / 20) / peak;
    const out = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++)
        out[i] = data[i] * gain;
    return out;
}
function normalizeRms(data, targetRmsDb, ceilingDb) {
    const rms = rmsOf(data);
    if (rms === 0) {
        return { data: data.slice(), achievedRmsDb: -Infinity, clamped: false };
    }
    const target = Math.pow(10, targetRmsDb / 20);
    const peak = peakOf(data);
    const peakSafe = ceilingDb < 0 ? Math.pow(10, ceilingDb / 20) / peak : Infinity;
    const gain = Math.min(target / rms, peakSafe);
    const out = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++)
        out[i] = data[i] * gain;
    return {
        data: out,
        achievedRmsDb: 20 * Math.log10(rms * gain),
        clamped: peakSafe < target / rms,
    };
}
/**
 * Static gain curve for a compressor at input level `db` (dBFS), returning
 * output level in dBFS. Below (threshold − knee): unity. Above threshold:
 * threshold + (db − threshold)/ratio. Between: smooth quadratic knee.
 */
function compressorCurve(db, p) {
    const kneeLow = p.thresholdDb - p.kneeDb;
    if (db <= kneeLow)
        return db;
    if (db >= p.thresholdDb)
        return p.thresholdDb + (db - p.thresholdDb) / p.ratio;
    // Quadratic soft knee between kneeLow and threshold, C1-continuous.
    const x = db - kneeLow;
    const w = p.kneeDb;
    const slope = 1 / p.ratio;
    return db + ((slope - 1) * x * x) / (2 * w);
}
/** Static gain curve for an expander (mirror of the compressor). */
function expanderCurve(db, p) {
    const kneeHigh = p.thresholdDb + p.kneeDb;
    if (db >= kneeHigh)
        return db;
    if (db <= p.thresholdDb)
        return p.thresholdDb + (db - p.thresholdDb) * p.ratio;
    const x = kneeHigh - db;
    const w = p.kneeDb;
    const slope = p.ratio;
    return db + ((1 - slope) * x * x) / (2 * w);
}
/** dBFS of a linear sample (−Infinity at 0). */
function toDb(linear) {
    return 20 * Math.log10(Math.max(linear, 1e-10));
}
/** Linear amplitude of a dBFS level. */
function toLinear(db) {
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
function envelopeDb(data, sampleRate, windowMs = 10) {
    const win = Math.max(1, Math.round((windowMs / 1000) * sampleRate));
    const env = new Float32Array(data.length);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i];
        if (i >= win)
            sum -= data[i - win] * data[i - win];
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
function compressChannel(data, sampleRate, p, attackMs, releaseMs) {
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
function expandChannel(data, sampleRate, p, attackMs, releaseMs) {
    const atk = Math.exp(-1 / ((attackMs / 1000) * sampleRate));
    const rel = Math.exp(-1 / ((releaseMs / 1000) * sampleRate));
    const env = envelopeDb(data, sampleRate);
    const out = new Float32Array(data.length);
    let gainDb = 0;
    for (let i = 0; i < data.length; i++) {
        const targetDb = expanderCurve(env[i], p);
        let wantGainDb = targetDb - env[i];
        if (wantGainDb > 0)
            wantGainDb = 0; // expansion never boosts
        // Attack = gain moving down, release = recovering, as in the compressor.
        gainDb =
            wantGainDb < gainDb
                ? atk * gainDb + (1 - atk) * wantGainDb
                : rel * gainDb + (1 - rel) * wantGainDb;
        out[i] = data[i] * toLinear(gainDb);
    }
    return out;
}
/**
 * True-peak-ish brick-wall limiter. For every sample, the required gain is
 * the minimum over the lookahead window of ceiling/|sample|; the gain moves
 * down instantly (a peak must never pass) and recovers exponentially with
 * the release time. Deterministic single pass with a ring buffer.
 */
function limitChannel(data, sampleRate, p) {
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
                if (g < needed)
                    needed = g;
            }
        }
        gain = needed < gain ? needed : rel * gain + (1 - rel) * needed;
        const slot = i % look;
        if (i >= look)
            out[i] = audioBuf[slot] * gainBuf[slot];
        else
            out[i] = data[i] * gain;
        audioBuf[slot] = data[i];
        gainBuf[slot] = gain;
    }
    return out;
}
function gateChannel(data, sampleRate, p) {
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
        for (let k = wStart; k <= i; k++)
            sum += data[k] * data[k];
        const env = Math.sqrt(sum / (i - wStart + 1));
        if (!open && env >= openT) {
            open = true;
            heldFor = 0;
        }
        else if (open) {
            if (env < closeT && heldFor >= hold)
                open = false;
            else if (env < closeT)
                heldFor++;
            else
                heldFor = 0;
        }
        const target = open ? 1 : 0;
        const step = 1 / fade;
        currentGain =
            Math.abs(currentGain - target) <= step ? target : currentGain + Math.sign(target - currentGain) * step;
        out[i] = data[i] * currentGain;
        if (currentGain < 0.5)
            gated++;
    }
    return { data: out, gatedFraction: data.length ? gated / data.length : 0 };
}
/**
 * Automatic leveler: per-block RMS measured, gain computed toward the target
 * and slew-limited so the loudness moves smoothly rather than pumping. Unlike
 * a compressor this adapts the *whole* level over seconds — two speakers at
 * different distances end up matched.
 */
function autoLevelChannel(data, sampleRate, p) {
    const blockLen = Math.max(1, Math.round((p.blockMs / 1000) * sampleRate));
    const maxSlewPerBlock = (p.maxSlewDbPerSec * p.blockMs) / 1000;
    const out = new Float32Array(data.length);
    let gainDb = 0;
    let minGain = 0;
    let maxGain = 0;
    for (let start = 0; start < data.length; start += blockLen) {
        const end = Math.min(data.length, start + blockLen);
        let sum = 0;
        for (let i = start; i < end; i++)
            sum += data[i] * data[i];
        const blockRms = Math.sqrt(sum / (end - start));
        const wantDb = blockRms > 0 ? p.targetRmsDb - toDb(blockRms) : 0;
        const wantClamped = Math.max(-p.maxGainDb, Math.min(p.maxGainDb, wantDb));
        const step = Math.max(-maxSlewPerBlock, Math.min(maxSlewPerBlock, wantClamped - gainDb));
        gainDb += step;
        minGain = Math.min(minGain, gainDb);
        maxGain = Math.max(maxGain, gainDb);
        const gain = toLinear(gainDb);
        for (let i = start; i < end; i++)
            out[i] = data[i] * gain;
    }
    return { data: out, gainRangeDb: [minGain, maxGain] };
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
function splitThreeBand(data, sampleRate, crossover1Hz, crossover2Hz) {
    const f1 = Math.min(sampleRate * 0.45, Math.max(20, crossover1Hz));
    const f2 = Math.min(sampleRate * 0.45, Math.max(f1 + 10, crossover2Hz));
    const lp1a = butterLowpass(sampleRate, f1);
    const lp1b = butterLowpass(sampleRate, f1);
    const lp2a = butterLowpass(sampleRate, f2);
    const lp2b = butterLowpass(sampleRate, f2);
    const low = runBiquad(runBiquad(data, lp1a), lp1b);
    const rest = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++)
        rest[i] = data[i] - low[i];
    const mid = runBiquad(runBiquad(rest, lp2a), lp2b);
    const high = new Float32Array(rest.length);
    for (let i = 0; i < rest.length; i++)
        high[i] = rest[i] - mid[i];
    return { low, mid, high };
}
/**
 * Sum the three bands back together — with the subtractive split this is an
 * exact reconstruction of the input up to float rounding (see splitThreeBand).
 */
function sumBands(b) {
    const out = new Float32Array(b.low.length);
    for (let i = 0; i < out.length; i++)
        out[i] = b.low[i] + b.mid[i] + b.high[i];
    return out;
}
function butterLowpass(sampleRate, freqHz) {
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
function runBiquad(data, c) {
    const out = new Float32Array(data.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < data.length; i++) {
        const x = data[i];
        const y = c.b0 * x + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
        x2 = x1;
        x1 = x;
        y2 = y1;
        y1 = y;
        out[i] = y;
    }
    return out;
}
/**
 * Compress one band in place (compressChannel then rewrite the array).
 * Convenience used by the multiband UI.
 */
function compressBandInPlace(band, sampleRate, p, attackMs, releaseMs) {
    band.set(compressChannel(band, sampleRate, p, attackMs, releaseMs));
}
// ---------------------------------------------------------------------------
// Parallel (New York) compression
// ---------------------------------------------------------------------------
/**
 * Blend a compressed copy back under the dry signal: out = dry·(1−mix) +
 * compressed·mix. `mix` 0..1; at 1 the output is the compressed signal alone.
 */
function blendParallel(dry, compressed, mix) {
    const m = Math.max(0, Math.min(1, mix));
    const out = new Float32Array(dry.length);
    for (let i = 0; i < out.length; i++)
        out[i] = dry[i] * (1 - m) + compressed[i] * m;
    return out;
}
