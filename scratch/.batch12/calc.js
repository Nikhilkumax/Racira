"use strict";
/**
 * Pure math for the Easy-tier calculator tools (Batches 11–14).
 *
 * Same contract as edit.ts/analyze.ts/generate.ts: no browser APIs, no React,
 * deterministic, verified in Node against the compiled output. Components do
 * nothing but bind inputs to these functions and render their results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTE_NAMES = void 0;
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
