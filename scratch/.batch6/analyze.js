"use strict";
/**
 * Pure audio-analysis math for the Easy-tier analyzer/meter tools.
 *
 * Same contract as edit.ts: no browser APIs, no React, no mutation of inputs —
 * everything here is a plain function over Float32Array channels, verified in
 * Node against the compiled output (scratch/test-batch5.cjs).
 *
 * The FFT is a textbook iterative radix-2 Cooley–Tukey over Float64Arrays with
 * a Hann window and amplitude-corrected magnitudes (2·|X|/Σw), so a coherent
 * sinusoid of amplitude A reports amplitude A regardless of window shape.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fftRadix2 = fftRadix2;
exports.computeSpectrum = computeSpectrum;
exports.computeWaveformPeaks = computeWaveformPeaks;
exports.computeRmsStats = computeRmsStats;
exports.computeFrequencyTimeline = computeFrequencyTimeline;
exports.findLoudestWindow = findLoudestWindow;
exports.computeVuLevels = computeVuLevels;
exports.computePpmLevels = computePpmLevels;
exports.computeCrestLevels = computeCrestLevels;
exports.estimateFundamental = estimateFundamental;
exports.computeAverageSpectrum = computeAverageSpectrum;
exports.segmentFrequencyTimeline = segmentFrequencyTimeline;
/** In-place iterative radix-2 FFT. Length must be a power of two. */
function fftRadix2(re, im) {
    const n = re.length;
    if (n !== im.length || (n & (n - 1)) !== 0 || n < 2) {
        throw new Error("fftRadix2 requires equal power-of-two lengths >= 2");
    }
    // Bit-reversal permutation.
    for (let i = 1, j = 0; i < n; i++) {
        let bit = n >> 1;
        for (; j & bit; bit >>= 1)
            j ^= bit;
        j ^= bit;
        if (i < j) {
            const tr = re[i];
            re[i] = re[j];
            re[j] = tr;
            const ti = im[i];
            im[i] = im[j];
            im[j] = ti;
        }
    }
    // Butterflies.
    for (let len = 2; len <= n; len <<= 1) {
        const ang = (-2 * Math.PI) / len;
        const wRe = Math.cos(ang);
        const wIm = Math.sin(ang);
        for (let i = 0; i < n; i += len) {
            let curRe = 1;
            let curIm = 0;
            const half = len >> 1;
            for (let k = 0; k < half; k++) {
                const uRe = re[i + k];
                const uIm = im[i + k];
                const vRe = re[i + k + half] * curRe - im[i + k + half] * curIm;
                const vIm = re[i + k + half] * curIm + im[i + k + half] * curRe;
                re[i + k] = uRe + vRe;
                im[i + k] = uIm + vIm;
                re[i + k + half] = uRe - vRe;
                im[i + k + half] = uIm - vIm;
                const nextRe = curRe * wRe - curIm * wIm;
                curIm = curRe * wIm + curIm * wRe;
                curRe = nextRe;
            }
        }
    }
}
const DB_FLOOR = -200;
/**
 * Spectrum of one window of a mono signal, starting at `offset` samples.
 * Applies a Hann window and corrects magnitudes so a coherent sinusoid of
 * amplitude A measures A (parabolic interpolation refines the peak bin).
 */
function computeSpectrum(channel, sampleRate, fftSize, offset) {
    if ((fftSize & (fftSize - 1)) !== 0) {
        throw new Error("fftSize must be a power of two");
    }
    const usable = Math.max(0, Math.min(fftSize, channel.length - offset));
    const re = new Float64Array(fftSize);
    const im = new Float64Array(fftSize);
    let windowSum = 0;
    let energy = 0;
    for (let i = 0; i < usable; i++) {
        const s = channel[offset + i];
        energy += s * s;
        const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / fftSize));
        re[i] = s * w;
        windowSum += w;
    }
    for (let i = usable; i < fftSize; i++) {
        // Zero-padded tail still contributes its (zero) window weight.
        windowSum += 0.5 * (1 - Math.cos((2 * Math.PI * i) / fftSize));
    }
    fftRadix2(re, im);
    const bins = fftSize >> 1;
    const amplitudes = new Float32Array(bins + 1);
    const magnitudeDb = new Float32Array(bins + 1);
    const corr = windowSum > 0 ? 2 / windowSum : 0;
    for (let k = 0; k <= bins; k++) {
        const mag = corr * Math.hypot(re[k], im[k]);
        amplitudes[k] = mag;
        magnitudeDb[k] = Math.max(DB_FLOOR, 20 * Math.log10(Math.max(mag, 1e-10)));
    }
    // Parabolic interpolation around the strongest bin (skip DC), done in the
    // dB domain: the Hann main lobe is nearly parabolic in log magnitude, so
    // this recovers off-bin tone frequency and amplitude far more accurately
    // than interpolating linear magnitudes (worst-case scalloping for a
    // bin-straddling tone drops from ~−0.9 dB to well under 0.1 dB).
    let peakBin = 1;
    for (let k = 2; k < bins; k++) {
        if (amplitudes[k] > amplitudes[peakBin])
            peakBin = k;
    }
    let peakHz = (peakBin * sampleRate) / fftSize;
    const binHz = sampleRate / fftSize;
    let peakAmp = amplitudes[peakBin];
    if (peakBin >= 1 && peakBin <= bins - 1) {
        const a = magnitudeDb[peakBin - 1];
        const b = magnitudeDb[peakBin];
        const c = magnitudeDb[peakBin + 1];
        const denom = a - 2 * b + c;
        if (denom < 0) {
            const delta = (0.5 * (a - c)) / denom;
            if (Math.abs(delta) <= 1) {
                peakHz = (peakBin + delta) * binHz;
                const interpolatedDb = b - 0.25 * (a - c) * delta;
                peakAmp = Math.max(amplitudes[peakBin], Math.pow(10, interpolatedDb / 20));
            }
        }
    }
    return {
        binHz,
        amplitudes,
        magnitudeDb,
        peakHz,
        peakAmplitude: peakAmp,
        frameRms: Math.sqrt(energy / Math.max(1, usable)),
    };
}
/** Min/max envelope of each channel over `buckets` equal-width buckets. */
function computeWaveformPeaks(channels, buckets) {
    if (buckets < 1)
        throw new Error("buckets must be >= 1");
    const length = channels[0]?.length ?? 0;
    const out = [];
    for (const ch of channels) {
        const mins = new Float32Array(buckets);
        const maxs = new Float32Array(buckets);
        for (let b = 0; b < buckets; b++) {
            const start = Math.floor((b * length) / buckets);
            const end = Math.floor(((b + 1) * length) / buckets);
            let lo = 0;
            let hi = 0;
            for (let i = start; i < end; i++) {
                const s = ch[i];
                if (s < lo)
                    lo = s;
                if (s > hi)
                    hi = s;
            }
            mins[b] = lo;
            maxs[b] = hi;
        }
        out.push({ min: mins, max: maxs });
    }
    return { buckets, channels: out };
}
/**
 * Global RMS/peak/crest plus a windowed RMS timeline. Windows are `windowSec`
 * long; a short trailing window is measured over its real length.
 */
function computeRmsStats(channels, sampleRate, windowSec) {
    const windowSize = Math.max(1, Math.round(windowSec * sampleRate));
    const length = channels[0]?.length ?? 0;
    const windowCount = Math.max(1, Math.ceil(length / windowSize));
    const windowRms = new Float32Array(windowCount);
    let totalEnergy = 0;
    let totalSamples = 0;
    let peak = 0;
    for (let w = 0; w < windowCount; w++) {
        const start = w * windowSize;
        const end = Math.min(length, start + windowSize);
        let energy = 0;
        for (let i = start; i < end; i++) {
            for (const ch of channels) {
                const s = ch[i];
                energy += s * s;
                const abs = Math.abs(s);
                if (abs > peak)
                    peak = abs;
            }
        }
        const frames = end - start;
        const frameCount = frames * channels.length;
        windowRms[w] = frameCount > 0 ? Math.sqrt(energy / frameCount) : 0;
        totalEnergy += energy;
        totalSamples += frameCount;
    }
    const overallRms = totalSamples > 0 ? Math.sqrt(totalEnergy / totalSamples) : 0;
    const toDb = (v) => Math.max(DB_FLOOR, 20 * Math.log10(Math.max(v, 1e-10)));
    return {
        overallRms,
        overallRmsDb: toDb(overallRms),
        peak,
        peakDb: toDb(peak),
        crestFactorDb: toDb(peak / Math.max(overallRms, 1e-10)),
        windowRms,
        windowSize,
    };
}
/**
 * Dominant-frequency timeline: hop `hopSize` samples with `fftSize` windows,
 * at most `maxFrames` frames (evenly striding the hop grid if needed).
 * Frames whose window RMS is below `silenceRms` report frequencyHz = 0.
 */
function computeFrequencyTimeline(channel, sampleRate, fftSize, hopSize, maxFrames, silenceRms = 1e-4) {
    const length = channel.length;
    if (length < fftSize)
        return [];
    const hopCount = Math.floor((length - fftSize) / hopSize) + 1;
    const stride = Math.max(1, Math.ceil(hopCount / maxFrames));
    const frames = [];
    for (let h = 0; h < hopCount; h += stride) {
        const spec = computeSpectrum(channel, sampleRate, fftSize, h * hopSize);
        if (spec.frameRms < silenceRms) {
            frames.push({ timeSec: (h * hopSize) / sampleRate, frequencyHz: 0, amplitude: 0 });
            continue;
        }
        frames.push({
            timeSec: (h * hopSize) / sampleRate,
            frequencyHz: spec.peakHz,
            amplitude: spec.peakAmplitude,
        });
    }
    return frames;
}
/** Offset (in samples) of the loudest `windowSec` window of the first channel. */
function findLoudestWindow(channel, sampleRate, windowSec) {
    const windowSize = Math.max(1, Math.round(windowSec * sampleRate));
    const length = channel.length;
    if (length <= windowSize)
        return 0;
    // Sliding energy via prefix sums of squares.
    let running = 0;
    for (let i = 0; i < windowSize; i++)
        running += channel[i] * channel[i];
    let best = running;
    let bestStart = 0;
    for (let start = 1; start + windowSize <= length; start++) {
        running += channel[start + windowSize - 1] * channel[start + windowSize - 1];
        running -= channel[start - 1] * channel[start - 1];
        if (running > best) {
            best = running;
            bestStart = start;
        }
    }
    return bestStart;
}
/**
 * VU metering (IEC 60268-17 style): the needle integrates ~300 ms and
 * responds to the average-rectified level, scaled by π/(2√2) so a steady
 * sine reads its RMS. 0 VU is referenced to a −18 dBFS alignment sine
 * (EBU R68), so vu = rmsDb + 18. Averages under-respond to peaks — that is
 * correct, documented VU behaviour, not a bug.
 */
function computeVuLevels(channels, sampleRate, windowSec = 0.3) {
    const windowSize = Math.max(1, Math.round(windowSec * sampleRate));
    const length = channels[0]?.length ?? 0;
    const windowCount = Math.max(1, Math.ceil(length / windowSize));
    const windowVu = new Float32Array(windowCount);
    let totalRect = 0;
    let totalSamples = 0;
    for (let w = 0; w < windowCount; w++) {
        const start = w * windowSize;
        const end = Math.min(length, start + windowSize);
        let rect = 0;
        for (let i = start; i < end; i++) {
            for (const ch of channels)
                rect += Math.abs(ch[i]);
        }
        const frames = (end - start) * channels.length;
        const avgRect = frames > 0 ? rect / frames : 0;
        const rmsLike = avgRect * (Math.PI / (2 * Math.SQRT2));
        windowVu[w] = 20 * Math.log10(Math.max(rmsLike, 1e-10)) + 18;
        totalRect += rect;
        totalSamples += frames;
    }
    const overallRmsLike = (totalSamples > 0 ? totalRect / totalSamples : 0) * (Math.PI / (2 * Math.SQRT2));
    const rmsDb = 20 * Math.log10(Math.max(overallRmsLike, 1e-10));
    return { vu: rmsDb + 18, rmsDb, windowVu, windowSize };
}
/**
 * PPM metering (IEC 60268-10 Type II style): responds to peaks with a short
 * (~10 ms) integration and no overshoot on transients. Implemented as the
 * maximum absolute sample per 10 ms block, reported in dBFS with the true
 * sample peak alongside for the over-indicator.
 */
function computePpmLevels(channels, sampleRate, integrationSec = 0.01, windowSec = 0.1) {
    const blockSize = Math.max(1, Math.round(integrationSec * sampleRate));
    const windowSize = Math.max(blockSize, Math.round(windowSec * sampleRate));
    const length = channels[0]?.length ?? 0;
    const windowCount = Math.max(1, Math.ceil(length / windowSize));
    const windowPpm = new Float32Array(windowCount);
    let overall = 0;
    let truePeak = 0;
    for (let w = 0; w < windowCount; w++) {
        const wStart = w * windowSize;
        const wEnd = Math.min(length, wStart + windowSize);
        let wMax = 0;
        for (let b = wStart; b < wEnd; b += blockSize) {
            const bEnd = Math.min(wEnd, b + blockSize);
            let bMax = 0;
            for (let i = b; i < bEnd; i++) {
                for (const ch of channels) {
                    const abs = Math.abs(ch[i]);
                    if (abs > bMax)
                        bMax = abs;
                }
            }
            if (bMax > wMax)
                wMax = bMax;
        }
        windowPpm[w] = 20 * Math.log10(Math.max(wMax, 1e-10));
        if (wMax > overall)
            overall = wMax;
    }
    for (const ch of channels) {
        for (let i = 0; i < ch.length; i++) {
            const abs = Math.abs(ch[i]);
            if (abs > truePeak)
                truePeak = abs;
        }
    }
    return {
        ppmDb: 20 * Math.log10(Math.max(overall, 1e-10)),
        truePeakDb: 20 * Math.log10(Math.max(truePeak, 1e-10)),
        windowPpm,
        windowSize,
    };
}
/**
 * Crest factor metering: peak/RMS in dB overall plus per 300 ms window, so
 * the tool can show where the material is most peak-heavy.
 */
function computeCrestLevels(channels, sampleRate, windowSec = 0.3) {
    const stats = computeRmsStats(channels, sampleRate, windowSec);
    const windowCrest = new Float32Array(stats.windowRms.length);
    let peakiest = 0;
    for (let w = 0; w < stats.windowRms.length; w++) {
        // Per-window peak: recompute over the window span.
        const start = w * stats.windowSize;
        const end = Math.min(channels[0]?.length ?? 0, start + stats.windowSize);
        let wPeak = 0;
        for (let i = start; i < end; i++) {
            for (const ch of channels) {
                const abs = Math.abs(ch[i]);
                if (abs > wPeak)
                    wPeak = abs;
            }
        }
        windowCrest[w] = 20 * Math.log10(Math.max(wPeak / Math.max(stats.windowRms[w], 1e-10), 1e-10));
        if (windowCrest[w] > windowCrest[peakiest])
            peakiest = w;
    }
    return {
        crestFactorDb: stats.crestFactorDb,
        peakDb: stats.peakDb,
        rmsDb: stats.overallRmsDb,
        windowCrest,
        windowSize: stats.windowSize,
        peakiestWindow: peakiest,
    };
}
/**
 * Fundamental-frequency estimate via normalized autocorrelation with the
 * McLeod-style "first peak above k·max" rule: the global maximum of the
 * normalized autocorrelation is found first, then the SMALLEST lag whose
 * correlation reaches 0.9 of it is chosen — this avoids both octave-halving
 * (a sub-period lag can never outrun the true period's peak) and octave-
 * doubling (2T correlates nearly as well as T, but T is smaller). The chosen
 * lag is refined parabolically. Searches `minHz`–`maxHz` over up to
 * `maxWindows` evenly spread windows of the first channel; returns the
 * median estimate across windows.
 */
function estimateFundamental(channel, sampleRate, minHz = 50, maxHz = 5000, maxWindows = 16) {
    const minLag = Math.max(2, Math.floor(sampleRate / maxHz));
    const maxLag = Math.min(Math.floor(sampleRate / minHz), Math.floor(sampleRate * 0.04));
    const windowSize = Math.min(channel.length, 4 * maxLag);
    if (windowSize < 4 * minLag || maxLag <= minLag + 2) {
        return { hz: 0, confidence: 0, windows: 0 };
    }
    const usableWindows = Math.floor(channel.length / windowSize);
    if (usableWindows < 1)
        return { hz: 0, confidence: 0, windows: 0 };
    const stride = Math.max(1, Math.floor(usableWindows / maxWindows));
    const estimates = [];
    let confidenceSum = 0;
    let used = 0;
    for (let w = 0; w < usableWindows; w += stride) {
        const off = w * windowSize;
        // Remove DC and compute energy once per window.
        let mean = 0;
        for (let i = 0; i < windowSize; i++)
            mean += channel[off + i];
        mean /= windowSize;
        const x = new Float64Array(windowSize);
        let energy = 0;
        for (let i = 0; i < windowSize; i++) {
            x[i] = channel[off + i] - mean;
            energy += x[i] * x[i];
        }
        if (energy < 1e-12)
            continue;
        // Pass 1: normalized autocorrelation over the whole lag range.
        const lags = maxLag - minLag + 1;
        const norm = new Float64Array(lags);
        let globalMax = 0;
        for (let lag = minLag; lag <= maxLag; lag++) {
            let sum = 0;
            for (let i = 0; i + lag < windowSize; i++)
                sum += x[i] * x[i + lag];
            norm[lag - minLag] = sum / energy;
            if (norm[lag - minLag] > globalMax)
                globalMax = norm[lag - minLag];
        }
        if (globalMax < 0.3)
            continue; // not periodic enough
        // Pass 2: first LOCAL MAXIMUM at or above 0.9 of the global max. A plain
        // threshold-crossing would land on the rising flank of the correlation
        // lobe (e.g. lag 102 for a 440 Hz sine, whose period is 109 samples),
        // biasing every pitch high; the lobe's local max is the true period.
        const threshold = 0.9 * globalMax;
        let bestIdx = -1;
        for (let k = 1; k < lags - 1; k++) {
            if (norm[k] >= threshold &&
                norm[k] >= norm[k - 1] &&
                norm[k] >= norm[k + 1]) {
                bestIdx = k;
                break;
            }
        }
        if (bestIdx < 0)
            continue;
        let refinedLag = bestIdx + minLag;
        if (bestIdx >= 1 && bestIdx <= lags - 2) {
            const a = norm[bestIdx - 1];
            const b = norm[bestIdx];
            const c = norm[bestIdx + 1];
            const denom = a - 2 * b + c;
            if (denom < 0) {
                const delta = (0.5 * (a - c)) / denom;
                if (Math.abs(delta) <= 1)
                    refinedLag = bestIdx + minLag + delta;
            }
        }
        estimates.push(sampleRate / refinedLag);
        confidenceSum += norm[bestIdx];
        used++;
    }
    if (estimates.length === 0)
        return { hz: 0, confidence: 0, windows: 0 };
    estimates.sort((a, b) => a - b);
    const median = estimates[Math.floor(estimates.length / 2)];
    return { hz: median, confidence: confidenceSum / used, windows: used };
}
/**
 * Time-averaged magnitude spectrum: up to `maxFrames` Hann-windowed frames
 * spread evenly over the file, power-averaged per bin, reported in dB per
 * channel. Deterministic overview for the Spectrum Analyzer tool.
 */
function computeAverageSpectrum(channels, sampleRate, fftSize, maxFrames = 120) {
    if ((fftSize & (fftSize - 1)) !== 0) {
        throw new Error("fftSize must be a power of two");
    }
    const length = channels[0]?.length ?? 0;
    const bins = fftSize >> 1;
    const hopCount = length >= fftSize ? Math.floor((length - fftSize) / fftSize) + 1 : 1;
    const stride = Math.max(1, Math.ceil(hopCount / maxFrames));
    const framesUsed = Math.ceil(hopCount / stride);
    const curvesDb = [];
    const powerAcc = channels.map(() => new Float64Array(bins + 1));
    const meanLinear = new Float64Array(bins + 1);
    let windowSum = 0;
    for (let i = 0; i < fftSize; i++) {
        windowSum += 0.5 * (1 - Math.cos((2 * Math.PI * i) / fftSize));
    }
    const corr = windowSum > 0 ? 2 / windowSum : 0;
    for (let h = 0; h < hopCount; h += stride) {
        const offset = h * fftSize;
        for (let c = 0; c < channels.length; c++) {
            const ch = channels[c];
            const re = new Float64Array(fftSize);
            const im = new Float64Array(fftSize);
            for (let i = 0; i < fftSize; i++) {
                const s = offset + i < ch.length ? ch[offset + i] : 0;
                re[i] = s * 0.5 * (1 - Math.cos((2 * Math.PI * i) / fftSize));
            }
            fftRadix2(re, im);
            const acc = powerAcc[c];
            for (let k = 0; k <= bins; k++) {
                const amp = corr * Math.hypot(re[k], im[k]);
                acc[k] += amp * amp;
            }
        }
    }
    let peakBin = 1;
    let peakDb = -Infinity;
    let weightedSum = 0;
    let totalSum = 0;
    const binHz = sampleRate / fftSize;
    for (let c = 0; c < channels.length; c++) {
        const db = new Float32Array(bins + 1);
        for (let k = 0; k <= bins; k++) {
            const amp = Math.sqrt(powerAcc[c][k] / framesUsed);
            db[k] = Math.max(DB_FLOOR, 20 * Math.log10(Math.max(amp, 1e-10)));
            if (c === 0) {
                // Channel-average the linear amplitudes for centroid/peak (per-channel
                // curves stay exact; the summary uses the mono average).
                let avg = 0;
                for (let cc = 0; cc < channels.length; cc++) {
                    avg += Math.sqrt(powerAcc[cc][k] / framesUsed);
                }
                avg /= channels.length;
                meanLinear[k] = avg;
                weightedSum += avg * (k * binHz);
                totalSum += avg;
                const dbAvg = Math.max(DB_FLOOR, 20 * Math.log10(Math.max(avg, 1e-10)));
                if (k >= 1 && dbAvg > peakDb) {
                    peakDb = dbAvg;
                    peakBin = k;
                }
            }
        }
        curvesDb.push(db);
    }
    let peakHz = (peakBin * sampleRate) / fftSize;
    if (peakBin >= 1 && peakBin <= bins - 1) {
        const a = Math.max(DB_FLOOR, 20 * Math.log10(Math.max(meanLinear[peakBin - 1], 1e-10)));
        const b = peakDb;
        const c2 = Math.max(DB_FLOOR, 20 * Math.log10(Math.max(meanLinear[peakBin + 1], 1e-10)));
        const denom = a - 2 * b + c2;
        if (denom < 0) {
            const delta = (0.5 * (a - c2)) / denom;
            if (Math.abs(delta) <= 1)
                peakHz = (peakBin + delta) * binHz;
        }
    }
    return {
        binHz,
        curvesDb,
        frames: framesUsed,
        peakHz,
        centroidHz: totalSum > 0 ? weightedSum / totalSum : 0,
    };
}
/**
 * Group a frequency timeline into stable-pitch segments: consecutive
 * non-silent frames whose frequencies stay within `toleranceCents` of the
 * segment mean, lasting at least `minDurationSec` (measured first-frame to
 * last-frame). Silent frames split runs. Single-frame runs are kept
 * deliberately: when maxFrames forces striding, one frame can represent a
 * full stride of real audio, and dropping it would hide genuine short notes.
 */
function segmentFrequencyTimeline(frames, toleranceCents = 60, minDurationSec = 0.05) {
    const segments = [];
    const ratioTol = Math.pow(2, toleranceCents / 1200);
    let run = [];
    const flush = () => {
        if (run.length === 0)
            return;
        const span = run[run.length - 1].timeSec - run[0].timeSec;
        if (span >= minDurationSec || run.length === 1) {
            const sumF = run.reduce((acc, f) => acc + f.frequencyHz, 0);
            const sumA = run.reduce((acc, f) => acc + f.amplitude, 0);
            segments.push({
                startSec: run[0].timeSec,
                endSec: run[run.length - 1].timeSec,
                meanHz: sumF / run.length,
                meanAmplitude: sumA / run.length,
                frameCount: run.length,
            });
        }
        run = [];
    };
    for (const f of frames) {
        if (f.frequencyHz <= 0) {
            flush();
            continue;
        }
        if (run.length > 0) {
            const anchor = run.reduce((acc, r) => acc + r.frequencyHz, 0) / run.length;
            const ratio = f.frequencyHz / anchor;
            if (ratio > ratioTol || ratio < 1 / ratioTol)
                flush();
        }
        run.push(f);
    }
    flush();
    return segments;
}
