"use strict";
/**
 * Pure signal synthesis for the Easy-tier generator tools.
 *
 * Same contract as edit.ts/analyze.ts: no browser APIs, no React,
 * deterministic given (params, sampleRate, durationSec), verified in Node
 * against the compiled output. The GeneratorToolShell (browser side) plays
 * and encodes whatever these functions produce.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRng = makeRng;
exports.generateWhiteNoise = generateWhiteNoise;
exports.generatePinkNoise = generatePinkNoise;
exports.generateBrownNoise = generateBrownNoise;
exports.generateWave = generateWave;
exports.generateSweep = generateSweep;
exports.generateChirp = generateChirp;
exports.generateWarble = generateWarble;
exports.generateBinaural = generateBinaural;
exports.generateIsochronic = generateIsochronic;
exports.generateSolfeggio = generateSolfeggio;
exports.generateClickTrack = generateClickTrack;
exports.generateMetronome = generateMetronome;
/** Deterministic LCG so noise tools are reproducible for a given seed. */
function makeRng(seed) {
    // LCG constants from Numerical Recipes; results in [0, 1).
    let state = (seed | 0) % 2147483647;
    if (state <= 0)
        state += 2147483646;
    return () => {
        state = (state * 16807) % 2147483647;
        return (state - 1) / 2147483646;
    };
}
/** White noise: independent uniform samples, zero-mean. */
function generateWhiteNoise(sampleRate, durationSec, amplitude, seed = 12345) {
    const length = Math.max(1, Math.round(durationSec * sampleRate));
    const rng = makeRng(seed);
    const out = new Float32Array(length);
    for (let i = 0; i < length; i++)
        out[i] = (rng() * 2 - 1) * amplitude;
    return { channels: [out], sampleRate, length };
}
/**
 * Pink noise via the Paul Kellet cascade (±3 dB/oct −1 filter approximation,
 * the standard cheap implementation). Uniform white in, pink out.
 */
function generatePinkNoise(sampleRate, durationSec, amplitude, seed = 12345) {
    const length = Math.max(1, Math.round(durationSec * sampleRate));
    const rng = makeRng(seed);
    const out = new Float32Array(length);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
        const white = rng() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        out[i] = pink * 0.11 * amplitude;
    }
    return { channels: [out], sampleRate, length };
}
/** Brown (red) noise: integrated white, leak-dc'd, normalized to amplitude. */
function generateBrownNoise(sampleRate, durationSec, amplitude, seed = 12345) {
    const length = Math.max(1, Math.round(durationSec * sampleRate));
    const rng = makeRng(seed);
    const out = new Float32Array(length);
    let acc = 0;
    for (let i = 0; i < length; i++) {
        const white = rng() * 2 - 1;
        acc = (acc + 0.02 * white) / 1.02;
        out[i] = acc * 3.5;
    }
    // Normalize peak to the requested amplitude.
    let peak = 0;
    for (let i = 0; i < length; i++)
        peak = Math.max(peak, Math.abs(out[i]));
    const scale = peak > 1e-12 ? amplitude / peak : 0;
    for (let i = 0; i < length; i++)
        out[i] *= scale;
    return { channels: [out], sampleRate, length };
}
/** Naive band-limited-free oscillators (additive band-limiting is Batch 9+). */
function generateWave(shape, sampleRate, durationSec, frequencyHz, amplitude, dutyCycle = 0.5, phaseDeg = 0) {
    const length = Math.max(1, Math.round(durationSec * sampleRate));
    const out = new Float32Array(length);
    const phase0 = (phaseDeg * Math.PI) / 180;
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const phase = frequencyHz * t + phase0 / (2 * Math.PI);
        const frac = phase - Math.floor(phase);
        let v;
        switch (shape) {
            case "sine":
                v = Math.sin(2 * Math.PI * phase);
                break;
            case "square":
                v = frac < 0.5 ? 1 : -1;
                break;
            case "pulse":
                v = frac < dutyCycle ? 1 : -1;
                break;
            case "sawtooth":
                v = 2 * frac - 1;
                break;
            case "triangle":
                v = frac < 0.5 ? 4 * frac - 1 : 3 - 4 * frac;
                break;
        }
        out[i] = v * amplitude;
    }
    return { channels: [out], sampleRate, length };
}
/**
 * Frequency sweep: instantaneously integrates the instantaneous frequency so
 * a linear sweep produces a parabolic phase and an exponential sweep a
 * geometric phase — the chirp definitions.
 */
function generateSweep(sampleRate, p) {
    const length = Math.max(1, Math.round(p.durationSec * sampleRate));
    const out = new Float32Array(length);
    const f0 = Math.max(1e-6, p.fromHz);
    const f1 = Math.max(1e-6, p.toHz);
    let phase = 0;
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const frac = p.durationSec > 0 ? t / p.durationSec : 0;
        const inst = p.curve === "linear"
            ? f0 + (f1 - f0) * frac
            : f0 * Math.pow(f1 / f0, frac);
        phase += (2 * Math.PI * inst) / sampleRate;
        out[i] = Math.sin(phase) * p.amplitude;
    }
    return { channels: [out], sampleRate, length };
}
/** Chirp: sine with sinusoidally modulated instantaneous frequency. */
function generateChirp(sampleRate, p) {
    const length = Math.max(1, Math.round(p.durationSec * sampleRate));
    const out = new Float32Array(length);
    let phase = 0;
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const inst = p.centerHz + p.deviationHz * Math.sin(2 * Math.PI * p.rateHz * t);
        phase += (2 * Math.PI * inst) / sampleRate;
        out[i] = Math.sin(phase) * p.amplitude;
    }
    return { channels: [out], sampleRate, length };
}
/** Warble tone: same FM structure as chirp, named for the audio use. */
function generateWarble(sampleRate, p) {
    return generateChirp(sampleRate, p);
}
/** Binaural beat: slightly detuned sines, one per channel. */
function generateBinaural(sampleRate, p) {
    const length = Math.max(1, Math.round(p.durationSec * sampleRate));
    const left = new Float32Array(length);
    const right = new Float32Array(length);
    const fL = p.carrierHz - p.beatHz / 2;
    const fR = p.carrierHz + p.beatHz / 2;
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        left[i] = Math.sin(2 * Math.PI * fL * t) * p.amplitude;
        right[i] = Math.sin(2 * Math.PI * fR * t) * p.amplitude;
    }
    return { channels: [left, right], sampleRate, length };
}
/**
 * Isochronic tone: carrier amplitude-gated by a raised-cosine pulse train —
 * smooth on/off so there is no click at gate edges.
 */
function generateIsochronic(sampleRate, p) {
    const length = Math.max(1, Math.round(p.durationSec * sampleRate));
    const out = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const gatePhase = (p.pulseHz * t) % 1;
        // Raised cosine: 0 at pulse boundary, 1 at pulse center.
        const gate = 0.5 - 0.5 * Math.cos(2 * Math.PI * gatePhase);
        out[i] = Math.sin(2 * Math.PI * p.carrierHz * t) * gate * p.amplitude;
    }
    return { channels: [out], sampleRate, length };
}
/** Solfeggio tone: a pure sine at one of the solfeggio frequencies. */
function generateSolfeggio(sampleRate, p) {
    const length = Math.max(1, Math.round(p.durationSec * sampleRate));
    const out = new Float32Array(length);
    const fade = Math.max(0, p.fadeSec ?? 0.01) * sampleRate;
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        let env = 1;
        if (fade > 0) {
            env = Math.min(1, i / fade, (length - 1 - i) / fade);
        }
        out[i] = Math.sin(2 * Math.PI * p.frequencyHz * t) * p.amplitude * env;
    }
    return { channels: [out], sampleRate, length };
}
/**
 * Click track: an exponentially decaying sine per beat. Downbeats (beat 0 of
 * each bar, i.e. every 4th beat) use the accent frequency. Sample-exact:
 * each click starts at floor(beatIndex * sampleRate * 60 / bpm).
 */
function generateClickTrack(sampleRate, p) {
    const beatSec = 60 / p.bpm;
    const length = Math.max(1, Math.round(p.beats * beatSec * sampleRate));
    const out = new Float32Array(length);
    const clickLen = Math.max(1, Math.round((p.clickMs / 1000) * sampleRate));
    for (let b = 0; b < p.beats; b++) {
        const start = Math.round(b * beatSec * sampleRate);
        const isAccent = b % 4 === 0;
        const freq = isAccent ? p.accentHz : p.beatHz;
        for (let i = 0; i < clickLen && start + i < length; i++) {
            const t = i / sampleRate;
            const env = Math.exp(-t / 0.03);
            out[start + i] += Math.sin(2 * Math.PI * freq * t) * env * p.amplitude;
        }
    }
    return { channels: [out], sampleRate, length };
}
/** Metronome: wood-block accents on bar starts, ticks on other beats. */
function generateMetronome(sampleRate, p) {
    const perBar = Math.max(1, p.beatsPerBar ?? 4);
    const beatSec = 60 / p.bpm;
    const length = Math.max(1, Math.round(p.beats * beatSec * sampleRate));
    const out = new Float32Array(length);
    const tickLen = Math.round(0.05 * sampleRate);
    for (let b = 0; b < p.beats; b++) {
        const start = Math.round(b * beatSec * sampleRate);
        const isAccent = b % perBar === 0;
        const freq = isAccent ? p.blockHz : p.blockHz * 0.66;
        const decay = isAccent ? 0.04 : 0.03;
        for (let i = 0; i < tickLen && start + i < length; i++) {
            const t = i / sampleRate;
            const env = Math.exp(-t / decay);
            out[start + i] += Math.sin(2 * Math.PI * freq * t) * env * p.amplitude;
        }
    }
    return { channels: [out], sampleRate, length };
}
