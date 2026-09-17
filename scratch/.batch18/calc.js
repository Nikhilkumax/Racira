"use strict";
/**
 * Pure math for the Easy-tier calculator tools (Batches 11–14).
 *
 * Same contract as edit.ts/analyze.ts/generate.ts: no browser APIs, no React,
 * deterministic, verified in Node against the compiled output. Components do
 * nothing but bind inputs to these functions and render their results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOWEL_FORMANTS = exports.HEARING_AID_BANDS = exports.NOTE_NAMES = void 0;
exports.bpmFromMs = bpmFromMs;
exports.median = median;
exports.bpmFromTaps = bpmFromTaps;
exports.beatMs = beatMs;
exports.delayTable = delayTable;
exports.reverbForBpm = reverbForBpm;
exports.midiToFreq = midiToFreq;
exports.freqToMidi = freqToMidi;
exports.parseNote = parseNote;
exports.centsBetween = centsBetween;
exports.nearestNote = nearestNote;
exports.timeSigBeatMs = timeSigBeatMs;
exports.barsToSeconds = barsToSeconds;
exports.secondsToBars = secondsToBars;
exports.nyquistMinRate = nyquistMinRate;
exports.maxCapturedFreq = maxCapturedFreq;
exports.bitDepthDynamicRange = bitDepthDynamicRange;
exports.bitsForDynamicRange = bitsForDynamicRange;
exports.pcmFileSizeBytes = pcmFileSizeBytes;
exports.lossyFileSizeBytes = lossyFileSizeBytes;
exports.streamBandwidthKbps = streamBandwidthKbps;
exports.monthlyTransferGB = monthlyTransferGB;
exports.centsToRatio = centsToRatio;
exports.freqAfterCents = freqAfterCents;
exports.playbackSpeedStats = playbackSpeedStats;
exports.formatTimestamp = formatTimestamp;
exports.parseTimestamp = parseTimestamp;
exports.phonemeBand = phonemeBand;
exports.sensationLevelDb = sensationLevelDb;
// ---------- tempo ----------
/** BPM from a beat interval in milliseconds. */
function bpmFromMs(ms) {
    if (ms <= 0)
        return 0;
    return 60000 / ms;
}
/** Median of a list (odd/even handled); empty → 0. */
function median(values) {
    if (values.length === 0)
        return 0;
    const s = [...values].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
/**
 * BPM from tap timestamps (ms). Uses the median of consecutive inter-tap
 * intervals so a stray double-tap or missed tap can't swing the result.
 * Needs at least 2 taps; fewer → 0.
 */
function bpmFromTaps(tapsMs) {
    if (tapsMs.length < 2)
        return 0;
    const intervals = [];
    for (let i = 1; i < tapsMs.length; i++) {
        const d = tapsMs[i] - tapsMs[i - 1];
        if (d > 0)
            intervals.push(d);
    }
    if (intervals.length === 0)
        return 0;
    return bpmFromMs(median(intervals));
}
/** Beat length in ms at the given BPM. */
function beatMs(bpm) {
    if (bpm <= 0)
        return 0;
    return 60000 / bpm;
}
/** The standard delay/division table for one BPM. */
function delayTable(bpm) {
    const beat = beatMs(bpm);
    const rows = [
        { label: "1/1", beats: 4 },
        { label: "1/2", beats: 2 },
        { label: "1/2T", beats: 4 / 3 },
        { label: "3/4", beats: 1.5 },
        { label: "1/4", beats: 1 },
        { label: "1/4T", beats: 2 / 3 },
        { label: "1/8", beats: 0.5 },
        { label: "1/8T", beats: 1 / 3 },
        { label: "3/16", beats: 0.75 },
        { label: "1/16", beats: 0.25 },
        { label: "1/16T", beats: 1 / 6 },
        { label: "1/32", beats: 0.125 },
    ];
    return rows.map((r) => ({
        label: r.label,
        ms: beat * r.beats,
        dottedMs: beat * r.beats * 1.5,
        tripletMs: beat * r.beats * (2 / 3),
    }));
}
/**
 * Reverb pre-delay/decay suggestion from BPM and room character. Small rooms
 * keep transients tight; ballads wash longer. These are starting points, not
 * physics — the math ties the decay to the beat so reflections don't smear
 * the next note.
 */
function reverbForBpm(bpm, room) {
    const beat = beatMs(bpm);
    switch (room) {
        case "small":
            return { preDelayMs: 10, decayMs: Math.round(beat * 0.5) };
        case "medium":
            return { preDelayMs: 20, decayMs: Math.round(beat * 1.0) };
        case "large":
            return { preDelayMs: 30, decayMs: Math.round(beat * 1.5) };
        case "plate":
            // Plates: near-instant density, short pre-delay, independent of room size.
            return { preDelayMs: 8, decayMs: Math.round(Math.max(800, beat * 1.25)) };
    }
}
// ---------- notes & frequency ----------
exports.NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/** MIDI note number → frequency in Hz (A4 = 440). */
function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}
/** Frequency in Hz → MIDI note number (fractional, A4 = 440). */
function freqToMidi(freq) {
    if (freq <= 0)
        return 0;
    return 69 + 12 * Math.log2(freq / 440);
}
/**
 * Parse a note name like "A4", "C#3", "Eb2" (b or # accidental, optional
 * octave; no octave → octave 4). Returns the MIDI number, or null if invalid.
 * Scientific pitch notation: MIDI = (octave + 1) * 12 + pitchClass.
 */
function parseNote(name) {
    const m = /^([A-Ga-g])([#b]?)(-?\d+)?$/.exec(name.trim());
    if (!m)
        return null;
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let pc = base[m[1].toUpperCase()];
    if (m[2] === "#")
        pc += 1;
    if (m[2] === "b")
        pc -= 1;
    const octave = m[3] !== undefined ? parseInt(m[3], 10) : 4;
    return (octave + 1) * 12 + pc;
}
/** Cents between two frequencies (positive when f2 > f1). */
function centsBetween(f1, f2) {
    if (f1 <= 0 || f2 <= 0)
        return 0;
    return 1200 * Math.log2(f2 / f1);
}
/** Round a fractional MIDI note to the nearest note name + cents offset. */
function nearestNote(freq) {
    const midi = freqToMidi(freq);
    if (!Number.isFinite(midi))
        return null;
    const rounded = Math.round(midi);
    const name = exports.NOTE_NAMES[((rounded % 12) + 12) % 12];
    const octave = Math.floor(rounded / 12) - 1;
    return { midi: rounded, name: `${name}${octave}`, cents: Math.round(centsBetween(midiToFreq(rounded), freq) * 10) / 10 };
}
// ---------- time signatures (Batch 13) ----------
/** Beat length in ms for a bottom-number note value at the given BPM (4 = quarter). */
function timeSigBeatMs(bpm, bottom) {
    if (bpm <= 0 || bottom <= 0)
        return 0;
    return beatMs(bpm) * (4 / bottom);
}
/** Total duration in seconds for N bars of (top/bottom) at BPM. */
function barsToSeconds(bpm, top, bottom, bars) {
    if (bpm <= 0 || top <= 0 || bottom <= 0 || bars < 0)
        return 0;
    return bars * top * (timeSigBeatMs(bpm, bottom) / 1000);
}
/** Bars contained in a duration (seconds) of (top/bottom) at BPM. */
function secondsToBars(bpm, top, bottom, seconds) {
    const barSec = barsToSeconds(bpm, top, bottom, 1);
    if (barSec <= 0)
        return 0;
    return seconds / barSec;
}
// ---------- sampling (Batch 13) ----------
/** Nyquist minimum sample rate (Hz) to capture maxFreq Hz. */
function nyquistMinRate(maxFreqHz) {
    if (maxFreqHz <= 0)
        return 0;
    return 2 * maxFreqHz;
}
/** Highest frequency a given sample rate can capture (half the rate). */
function maxCapturedFreq(sampleRateHz) {
    if (sampleRateHz <= 0)
        return 0;
    return sampleRateHz / 2;
}
// ---------- bit depth (Batch 13) ----------
/**
 * Ideal quantization SNR for a bit depth: 6.02·n + 1.76 dB (the 1.76 comes
 * from a full-scale sine's RMS being 1/√2 below its peak).
 */
function bitDepthDynamicRange(bits) {
    if (bits <= 0)
        return 0;
    return 6.02 * bits + 1.76;
}
/** Bits needed for a target dynamic range in dB (ideal quantizer). */
function bitsForDynamicRange(db) {
    if (db <= 1.76)
        return 0;
    return (db - 1.76) / 6.02;
}
// ---------- file size (Batch 13) ----------
/** Uncompressed PCM size in bytes. */
function pcmFileSizeBytes(durationSec, sampleRateHz, channels, bitDepth) {
    if (durationSec < 0 || sampleRateHz <= 0 || channels <= 0 || bitDepth <= 0)
        return 0;
    return Math.round(durationSec * sampleRateHz * channels * (bitDepth / 8));
}
/** Compressed (lossy) size in bytes from a bitrate in kbps. */
function lossyFileSizeBytes(durationSec, bitrateKbps) {
    if (durationSec < 0 || bitrateKbps <= 0)
        return 0;
    return Math.round((durationSec * bitrateKbps * 1000) / 8);
}
// ---------- streaming (Batch 14) ----------
/** Total bandwidth in kbps for N simultaneous listeners at a given bitrate. */
function streamBandwidthKbps(listeners, bitrateKbps) {
    if (listeners <= 0 || bitrateKbps <= 0)
        return 0;
    return listeners * bitrateKbps;
}
/** Monthly transfer in GB for N listeners streaming hoursPerDay h/day. */
function monthlyTransferGB(listeners, bitrateKbps, hoursPerDay, days = 30) {
    if (listeners <= 0 || bitrateKbps <= 0 || hoursPerDay <= 0 || days <= 0)
        return 0;
    const bytesPerSecond = (listeners * bitrateKbps * 1000) / 8;
    return (bytesPerSecond * 3600 * hoursPerDay * days) / 1e9;
}
// ---------- cents & speed (Batch 14) ----------
/** Frequency ratio of a cents interval: 2^(c/1200). */
function centsToRatio(cents) {
    return Math.pow(2, cents / 1200);
}
/** New frequency after shifting f by cents. */
function freqAfterCents(f, cents) {
    if (f <= 0)
        return 0;
    return f * centsToRatio(cents);
}
/**
 * Playback-speed math: either pass newDurationSec (speed derived) or a known
 * speed. Tape-style resampling shifts pitch by 12·log2(speed) semitones.
 */
function playbackSpeedStats(originalDurSec, opts) {
    if (originalDurSec <= 0)
        return null;
    let speed;
    if (opts.newDurationSec !== undefined && opts.newDurationSec > 0) {
        speed = originalDurSec / opts.newDurationSec;
    }
    else if (opts.speed !== undefined && opts.speed > 0) {
        speed = opts.speed;
    }
    else {
        return null;
    }
    return {
        speed,
        newDurationSec: originalDurSec / speed,
        semitones: 12 * Math.log2(speed),
    };
}
/**
 * seconds → `[h:]mm:ss` for show notes / chapter lists (mm and ss are
 * zero-padded to 2 digits; hours only appear when nonzero).
 */
function formatTimestamp(totalSeconds, withHours = false) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0)
        return withHours ? "0:00:00" : "0:00";
    const s = Math.floor(totalSeconds);
    const ss = String(s % 60).padStart(2, "0");
    const mmTotal = Math.floor(s / 60);
    if (withHours || mmTotal >= 60) {
        const hh = Math.floor(mmTotal / 60);
        const mm = String(mmTotal % 60).padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
    }
    return `${mmTotal}:${ss}`;
}
/** mm:ss / h:mm:ss / raw seconds → seconds (inverse of formatTimestamp). */
function parseTimestamp(text) {
    const parts = text.trim().split(":").map((p) => Number(p));
    if (parts.some((p) => !Number.isFinite(p) || p < 0))
        return null;
    if (parts.length === 3)
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2)
        return parts[0] * 60 + parts[1];
    if (parts.length === 1)
        return parts[0];
    return null;
}
/**
 * The eight bands a hearing-aid fitting conversation usually revolves around,
 * with honest general-purpose content notes. Real prescriptions are
 * individual (audiogram-specific); this reference explains WHAT each band
 * carries so users can read their fitting report or talk to their audiologist.
 */
exports.HEARING_AID_BANDS = [
    {
        hz: 250,
        speechContent: "Vowel body energy (oo, oh), environmental rumble, traffic and appliance noise",
        fittingNote: "Usually kept moderate — boosting too much makes everything sound boomy and masks consonants",
        importance: 2,
    },
    {
        hz: 500,
        speechContent: "Vowel loudness (ah, oh first formant), rhythm of speech",
        fittingNote: "Moderate gain; too much hurts clarity more than it helps loudness",
        importance: 2,
    },
    {
        hz: 1000,
        speechContent: "Core vowel intelligibility (eh, ih), the 'body' of a voice",
        fittingNote: "A reference band — fittings often anchor the overall level here",
        importance: 3,
    },
    {
        hz: 2000,
        speechContent: "Consonant clarity: n, m, k, g and the front vowels (ay)",
        fittingNote: "Usually emphasised — this is where words start separating from noise",
        importance: 4,
    },
    {
        hz: 3000,
        speechContent: "Fricatives and word endings: s, sh, f — endings that mark plurals and tenses",
        fittingNote: "Typically emphasised; losing this band makes speech sound mumbled but still audible",
        importance: 5,
    },
    {
        hz: 4000,
        speechContent: "The classic 's' region for many adult voices; f, th clarity",
        fittingNote: "Commonly the most important band for intelligibility in quiet rooms",
        importance: 5,
    },
    {
        hz: 6000,
        speechContent: "Crispness of s, t, ch; the brightness of higher voices and children",
        fittingNote: "Emphasis varies — many hearing losses dip deepest here (the '4–6 kHz notch')",
        importance: 3,
    },
    {
        hz: 8000,
        speechContent: "Air and sparkle; little speech information (birds, cymbals, keys)",
        fittingNote: "Often left modest — it adds naturalness more than understanding",
        importance: 1,
    },
];
/**
 * Which reference band covers a frequency. Band edges are the GEOMETRIC
 * MEANS of adjacent centers — √(f_k·f_{k+1}) — the same partition hearing-
 * aid fitting software uses to assign energy to bands. (A ±½-octave window
 * around each center does NOT tile this set: 2k→3k and 4k→6k are 1.5:1
 * steps, not octaves, so half-octave windows would leave gaps and overlaps.)
 * Frequencies below the first center clamp to the lowest band, above the
 * last to the highest — the extremes still deserve an answer.
 */
function phonemeBand(hz) {
    if (!Number.isFinite(hz) || hz <= 0)
        return exports.HEARING_AID_BANDS[0];
    const bands = exports.HEARING_AID_BANDS;
    if (hz < bands[0].hz)
        return bands[0];
    for (let i = 0; i < bands.length - 1; i++) {
        if (hz < Math.sqrt(bands[i].hz * bands[i + 1].hz))
            return bands[i];
    }
    return bands[bands.length - 1];
}
/**
 * Average adult-male vowel formants (Peterson & Barney 1952 means, the
 * standard reference): F1 = openness, F2 = frontness. The UI plots these on
 * the band chart so users can SEE which bands carry which vowel sounds.
 */
exports.VOWEL_FORMANTS = [
    { vowel: "ee (iː)", example: "beet", f1: 270, f2: 2290 },
    { vowel: "ih (ɪ)", example: "bit", f1: 390, f2: 1990 },
    { vowel: "eh (ɛ)", example: "bet", f1: 530, f2: 1840 },
    { vowel: "ah (æ)", example: "bat", f1: 660, f2: 1720 },
    { vowel: "ah (ɑ)", example: "father", f1: 730, f2: 1090 },
    { vowel: "oh (ɔ)", example: "bought", f1: 570, f2: 840 },
    { vowel: "oo (ʊ)", example: "book", f1: 440, f2: 1020 },
    { vowel: "oo (uː)", example: "boot", f1: 300, f2: 870 },
];
/**
 * A rough "how audible is a pure tone here with this threshold" helper for
 * the reference's interactive slider: sensation level in dB for a tone
 * presented at 60 dB SPL, clamped at 0 when it sits at/below threshold. A
 * teaching approximation — real loudness perception is frequency-weighted
 * (equal-loudness contours), which the note in the UI says.
 */
function sensationLevelDb(presentationDbSpl, thresholdDb) {
    if (!Number.isFinite(presentationDbSpl) || !Number.isFinite(thresholdDb))
        return 0;
    return Math.max(0, presentationDbSpl - thresholdDb);
}
