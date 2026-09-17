/**
 * Pure math for the Easy-tier calculator tools (Batches 11–14).
 *
 * Same contract as edit.ts/analyze.ts/generate.ts: no browser APIs, no React,
 * deterministic, verified in Node against the compiled output. Components do
 * nothing but bind inputs to these functions and render their results.
 */

// ---------- tempo ----------

/** BPM from a beat interval in milliseconds. */
export function bpmFromMs(ms: number): number {
  if (ms <= 0) return 0;
  return 60000 / ms;
}

/** Median of a list (odd/even handled); empty → 0. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * BPM from tap timestamps (ms). Uses the median of consecutive inter-tap
 * intervals so a stray double-tap or missed tap can't swing the result.
 * Needs at least 2 taps; fewer → 0.
 */
export function bpmFromTaps(tapsMs: number[]): number {
  if (tapsMs.length < 2) return 0;
  const intervals: number[] = [];
  for (let i = 1; i < tapsMs.length; i++) {
    const d = tapsMs[i] - tapsMs[i - 1];
    if (d > 0) intervals.push(d);
  }
  if (intervals.length === 0) return 0;
  return bpmFromMs(median(intervals));
}

// ---------- delay times ----------

export interface DelayTimes {
  /** Note label, e.g. "1/4". */
  label: string;
  /** Full delay time in ms. */
  ms: number;
  /** Dotted delay time in ms. */
  dottedMs: number;
  /** Triplet delay time in ms. */
  tripletMs: number;
}

/** Beat length in ms at the given BPM. */
export function beatMs(bpm: number): number {
  if (bpm <= 0) return 0;
  return 60000 / bpm;
}

/** The standard delay/division table for one BPM. */
export function delayTable(bpm: number): DelayTimes[] {
  const beat = beatMs(bpm);
  const rows: { label: string; beats: number }[] = [
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

// ---------- reverb ----------

export interface ReverbSettings {
  /** Suggested pre-delay in ms (10–30 ms band, scaled to room size). */
  preDelayMs: number;
  /** Suggested decay (RT60) in ms. */
  decayMs: number;
}

/**
 * Reverb pre-delay/decay suggestion from BPM and room character. Small rooms
 * keep transients tight; ballads wash longer. These are starting points, not
 * physics — the math ties the decay to the beat so reflections don't smear
 * the next note.
 */
export function reverbForBpm(bpm: number, room: "small" | "medium" | "large" | "plate"): ReverbSettings {
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

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

/** MIDI note number → frequency in Hz (A4 = 440). */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Frequency in Hz → MIDI note number (fractional, A4 = 440). */
export function freqToMidi(freq: number): number {
  if (freq <= 0) return 0;
  return 69 + 12 * Math.log2(freq / 440);
}

/**
 * Parse a note name like "A4", "C#3", "Eb2" (b or # accidental, optional
 * octave; no octave → octave 4). Returns the MIDI number, or null if invalid.
 * Scientific pitch notation: MIDI = (octave + 1) * 12 + pitchClass.
 */
export function parseNote(name: string): number | null {
  const m = /^([A-Ga-g])([#b]?)(-?\d+)?$/.exec(name.trim());
  if (!m) return null;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let pc = base[m[1].toUpperCase()];
  if (m[2] === "#") pc += 1;
  if (m[2] === "b") pc -= 1;
  const octave = m[3] !== undefined ? parseInt(m[3], 10) : 4;
  return (octave + 1) * 12 + pc;
}

/** Cents between two frequencies (positive when f2 > f1). */
export function centsBetween(f1: number, f2: number): number {
  if (f1 <= 0 || f2 <= 0) return 0;
  return 1200 * Math.log2(f2 / f1);
}

/** Round a fractional MIDI note to the nearest note name + cents offset. */
export function nearestNote(freq: number): { midi: number; name: string; cents: number } | null {
  const midi = freqToMidi(freq);
  if (!Number.isFinite(midi)) return null;
  const rounded = Math.round(midi);
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return { midi: rounded, name: `${name}${octave}`, cents: Math.round(centsBetween(midiToFreq(rounded), freq) * 10) / 10 };
}

// ---------- time signatures (Batch 13) ----------

/** Beat length in ms for a bottom-number note value at the given BPM (4 = quarter). */
export function timeSigBeatMs(bpm: number, bottom: number): number {
  if (bpm <= 0 || bottom <= 0) return 0;
  return beatMs(bpm) * (4 / bottom);
}

/** Total duration in seconds for N bars of (top/bottom) at BPM. */
export function barsToSeconds(bpm: number, top: number, bottom: number, bars: number): number {
  if (bpm <= 0 || top <= 0 || bottom <= 0 || bars < 0) return 0;
  return bars * top * (timeSigBeatMs(bpm, bottom) / 1000);
}

/** Bars contained in a duration (seconds) of (top/bottom) at BPM. */
export function secondsToBars(bpm: number, top: number, bottom: number, seconds: number): number {
  const barSec = barsToSeconds(bpm, top, bottom, 1);
  if (barSec <= 0) return 0;
  return seconds / barSec;
}

// ---------- sampling (Batch 13) ----------

/** Nyquist minimum sample rate (Hz) to capture maxFreq Hz. */
export function nyquistMinRate(maxFreqHz: number): number {
  if (maxFreqHz <= 0) return 0;
  return 2 * maxFreqHz;
}

/** Highest frequency a given sample rate can capture (half the rate). */
export function maxCapturedFreq(sampleRateHz: number): number {
  if (sampleRateHz <= 0) return 0;
  return sampleRateHz / 2;
}

// ---------- bit depth (Batch 13) ----------

/**
 * Ideal quantization SNR for a bit depth: 6.02·n + 1.76 dB (the 1.76 comes
 * from a full-scale sine's RMS being 1/√2 below its peak).
 */
export function bitDepthDynamicRange(bits: number): number {
  if (bits <= 0) return 0;
  return 6.02 * bits + 1.76;
}

/** Bits needed for a target dynamic range in dB (ideal quantizer). */
export function bitsForDynamicRange(db: number): number {
  if (db <= 1.76) return 0;
  return (db - 1.76) / 6.02;
}

// ---------- file size (Batch 13) ----------

/** Uncompressed PCM size in bytes. */
export function pcmFileSizeBytes(durationSec: number, sampleRateHz: number, channels: number, bitDepth: number): number {
  if (durationSec < 0 || sampleRateHz <= 0 || channels <= 0 || bitDepth <= 0) return 0;
  return Math.round(durationSec * sampleRateHz * channels * (bitDepth / 8));
}

/** Compressed (lossy) size in bytes from a bitrate in kbps. */
export function lossyFileSizeBytes(durationSec: number, bitrateKbps: number): number {
  if (durationSec < 0 || bitrateKbps <= 0) return 0;
  return Math.round((durationSec * bitrateKbps * 1000) / 8);
}

// ---------- streaming (Batch 14) ----------

/** Total bandwidth in kbps for N simultaneous listeners at a given bitrate. */
export function streamBandwidthKbps(listeners: number, bitrateKbps: number): number {
  if (listeners <= 0 || bitrateKbps <= 0) return 0;
  return listeners * bitrateKbps;
}

/** Monthly transfer in GB for N listeners streaming hoursPerDay h/day. */
export function monthlyTransferGB(listeners: number, bitrateKbps: number, hoursPerDay: number, days = 30): number {
  if (listeners <= 0 || bitrateKbps <= 0 || hoursPerDay <= 0 || days <= 0) return 0;
  const bytesPerSecond = (listeners * bitrateKbps * 1000) / 8;
  return (bytesPerSecond * 3600 * hoursPerDay * days) / 1e9;
}

// ---------- cents & speed (Batch 14) ----------

/** Frequency ratio of a cents interval: 2^(c/1200). */
export function centsToRatio(cents: number): number {
  return Math.pow(2, cents / 1200);
}

/** New frequency after shifting f by cents. */
export function freqAfterCents(f: number, cents: number): number {
  if (f <= 0) return 0;
  return f * centsToRatio(cents);
}

export interface PlaybackSpeedStats {
  /** Speed multiplier (newDur = originalDur / speed). */
  speed: number;
  /** Resulting duration in seconds. */
  newDurationSec: number;
  /** Pitch shift in semitones if resampled tape-style (positive = higher). */
  semitones: number;
}

/**
 * Playback-speed math: either pass newDurationSec (speed derived) or a known
 * speed. Tape-style resampling shifts pitch by 12·log2(speed) semitones.
 */
export function playbackSpeedStats(originalDurSec: number, opts: { newDurationSec?: number; speed?: number }): PlaybackSpeedStats | null {
  if (originalDurSec <= 0) return null;
  let speed: number;
  if (opts.newDurationSec !== undefined && opts.newDurationSec > 0) {
    speed = originalDurSec / opts.newDurationSec;
  } else if (opts.speed !== undefined && opts.speed > 0) {
    speed = opts.speed;
  } else {
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
export function formatTimestamp(totalSeconds: number, withHours = false): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return withHours ? "0:00:00" : "0:00";
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
export function parseTimestamp(text: string): number | null {
  const parts = text.trim().split(":").map((p) => Number(p));
  if (parts.some((p) => !Number.isFinite(p) || p < 0)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

// ---------- hearing-aid frequency reference (Batch 18) ----------

export interface HearingAidBand {
  /** Nominal band center in Hz. */
  hz: number;
  /** What lives in this band, acoustically. */
  speechContent: string;
  /** General fitting guidance for this band (not a prescription). */
  fittingNote: string;
  /** 1–5: how critical this band typically is for speech understanding. */
  importance: number;
}

/**
 * The eight bands a hearing-aid fitting conversation usually revolves around,
 * with honest general-purpose content notes. Real prescriptions are
 * individual (audiogram-specific); this reference explains WHAT each band
 * carries so users can read their fitting report or talk to their audiologist.
 */
export const HEARING_AID_BANDS: HearingAidBand[] = [
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
export function phonemeBand(hz: number): HearingAidBand {
  if (!Number.isFinite(hz) || hz <= 0) return HEARING_AID_BANDS[0];
  const bands = HEARING_AID_BANDS;
  if (hz < bands[0].hz) return bands[0];
  for (let i = 0; i < bands.length - 1; i++) {
    if (hz < Math.sqrt(bands[i].hz * bands[i + 1].hz)) return bands[i];
  }
  return bands[bands.length - 1];
}

export interface VowelFormants {
  /** IPA-ish display label, e.g. "ah". */
  vowel: string;
  /** Example word a user can say or listen for. */
  example: string;
  /** First formant (vowel openness) in Hz. */
  f1: number;
  /** Second formant (vowel frontness) in Hz. */
  f2: number;
}

/**
 * Average adult-male vowel formants (Peterson & Barney 1952 means, the
 * standard reference): F1 = openness, F2 = frontness. The UI plots these on
 * the band chart so users can SEE which bands carry which vowel sounds.
 */
export const VOWEL_FORMANTS: VowelFormants[] = [
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
export function sensationLevelDb(presentationDbSpl: number, thresholdDb: number): number {
  if (!Number.isFinite(presentationDbSpl) || !Number.isFinite(thresholdDb)) return 0;
  return Math.max(0, presentationDbSpl - thresholdDb);
}

// ---------- technical reference data (Batch 19) ----------

export interface BitrateRow {
  bitrateKbps: number;
  /** Quality label for this codec at this rate. */
  label: string;
  note: string;
}

/**
 * Perceptual-bitrate reference per codec family. "Transparent" means
 * trained listeners in controlled tests generally cannot distinguish it from
 * the source — a moving target per codec, so each row states its evidence
 * class honestly. Ordered ascending by kbps.
 */
export const BITRATE_REFERENCE: { codec: string; rows: BitrateRow[] }[] = [
  {
    codec: "MP3",
    rows: [
      { bitrateKbps: 64, label: "Speech floor", note: "Mono speech is intelligible; music is not viable" },
      { bitrateKbps: 96, label: "Acceptable", note: "Talk content fine; music loses highs and imaging" },
      { bitrateKbps: 128, label: "OK for pop", note: "The historic default; simple material holds up" },
      { bitrateKbps: 192, label: "Good", note: "Most listeners are satisfied with most music" },
      { bitrateKbps: 256, label: "Excellent", note: "Difficult material (cymbals, strings, crowd) survives" },
      { bitrateKbps: 320, label: "Codec ceiling", note: "The format's maximum; approaching transparency" },
    ],
  },
  {
    codec: "AAC",
    rows: [
      { bitrateKbps: 32, label: "HE-AAC speech", note: "Parametric tools keep speech intelligible at 32" },
      { bitrateKbps: 96, label: "Acceptable", note: "Roughly MP3 at 128 for most content" },
      { bitrateKbps: 128, label: "Good", note: "Solid music quality for everyday listening" },
      { bitrateKbps: 192, label: "Excellent", note: "Near-transparent for most material" },
      { bitrateKbps: 256, label: "Transparent tier", note: "Controlled tests rarely separate it from source" },
    ],
  },
  {
    codec: "Opus",
    rows: [
      { bitrateKbps: 16, label: "Narrowband speech", note: "Intelligible phone-quality speech from 16" },
      { bitrateKbps: 32, label: "Good speech", note: "Wideband speech; music not viable" },
      { bitrateKbps: 64, label: "Music viable", note: "Fullband; music usable, speech transparent" },
      { bitrateKbps: 96, label: "Excellent", note: "Music very good; speech effectively transparent" },
      { bitrateKbps: 128, label: "Transparent tier", note: "The codec's own docs call 128 transparent for most music" },
    ],
  },
];

/** The tier rows for one codec, or null for an unknown codec id. */
export function bitrateRowsFor(codec: string): BitrateRow[] | null {
  return BITRATE_REFERENCE.find((c) => c.codec === codec)?.rows ?? null;
}

/**
 * Quality advice for an arbitrary rate: the highest tier at or below the
 * rate (rates above the top row read as "at least ceiling quality").
 */
export function bitrateAdvice(codec: string, kbps: number): BitrateRow | null {
  const rows = bitrateRowsFor(codec);
  if (!rows || !Number.isFinite(kbps) || kbps <= 0) return null;
  let advice = rows[0];
  for (const row of rows) if (kbps >= row.bitrateKbps) advice = row;
  return advice;
}

export interface SampleRateRow {
  hz: number;
  name: string;
  usage: string;
}

/**
 * Standard sample rates with their typical use. Nyquist is exactly half the
 * rate — the highest captureable frequency — computed, not stored.
 */
export const SAMPLE_RATE_REFERENCE: SampleRateRow[] = [
  { hz: 8000, name: "8 kHz", usage: "Telephony, vintage voice codecs" },
  { hz: 16000, name: "16 kHz", usage: "VoIP, speech recognition, dictation" },
  { hz: 22050, name: "22.05 kHz", usage: "Low-bandwidth web audio, vintage game audio" },
  { hz: 32000, name: "32 kHz", usage: "Broadcast contribution, DAT long-play" },
  { hz: 44100, name: "44.1 kHz", usage: "CD, music distribution, the universal default" },
  { hz: 48000, name: "48 kHz", usage: "Video, film, professional recording" },
  { hz: 88200, name: "88.2 kHz", usage: "Hi-res music (2× CD rate)" },
  { hz: 96000, name: "96 kHz", usage: "Hi-res production, archival mastering" },
  { hz: 192000, name: "192 kHz", usage: "Specialist archival; rarely useful delivery" },
];

/** Recommended rate for a content type — ties the table to practical advice. */
export function recommendedRateFor(
  content: "speech" | "podcast" | "music" | "video" | "archival",
): number {
  switch (content) {
    case "speech": return 16000;
    case "podcast": return 44100;
    case "music": return 44100;
    case "video": return 48000;
    case "archival": return 96000;
  }
}

export interface CodecRow {
  id: string;
  name: string;
  container: string;
  lossless: boolean;
  /** Typical compression vs 16/44.1 WAV (≈1 = none). */
  compression: string;
  browsers: string;
  note: string;
}

/** Codec compatibility matrix — the practical "what plays where" reference. */
export const CODEC_COMPATIBILITY: CodecRow[] = [
  { id: "wav", name: "WAV (PCM)", container: "RIFF", lossless: true, compression: "1.0× (none)", browsers: "All", note: "Universal editing target; huge files" },
  { id: "flac", name: "FLAC", container: "FLAC/Ogg", lossless: true, compression: "≈0.5–0.7×", browsers: "All modern", note: "Lossless archival + distribution standard" },
  { id: "aiff", name: "AIFF", container: "AIFF", lossless: true, compression: "1.0× (none)", browsers: "Partial", note: "Apple's WAV analogue; same PCM payload" },
  { id: "mp3", name: "MP3", container: "MP3", lossless: false, compression: "≈0.1×", browsers: "All", note: "The compatibility king; decoding is royalty-free now" },
  { id: "aac", name: "AAC / M4A", container: "MP4", lossless: false, compression: "≈0.08×", browsers: "All", note: "Better quality per bit than MP3; Apple default" },
  { id: "ogg", name: "Ogg Vorbis", container: "Ogg", lossless: false, compression: "≈0.09×", browsers: "Most", note: "Free codec; Safari support historically spotty" },
  { id: "opus", name: "Opus", container: "Ogg/WebM", lossless: false, compression: "≈0.07×", browsers: "All modern", note: "Best low-bitrate codec; the future default" },
  { id: "wma", name: "WMA", container: "ASF", lossless: false, compression: "≈0.1×", browsers: "Legacy", note: "Windows-era; decode support fading" },
];

export function codecRow(id: string): CodecRow | null {
  return CODEC_COMPATIBILITY.find((c) => c.id === id) ?? null;
}

export interface LoudnessStandard {
  platform: string;
  /** Integrated loudness target in LUFS. */
  targetLufs: number;
  /** True-peak ceiling in dBTP. */
  truePeakDb: number;
  note: string;
}

/**
 * Loudness normalization targets. Platforms turn playback down (never up)
 * to the target, so mastering to the target preserves your relative level.
 * Podcast targets follow the published Apple / Spotify guidance; EBU R128
 * is the European broadcast law.
 */
export const LOUDNESS_STANDARDS: LoudnessStandard[] = [
  { platform: "Spotify (music)", targetLufs: -14, truePeakDb: -1, note: "Louder masters are turned down; quieter ones play as-is" },
  { platform: "Apple Music", targetLufs: -16, truePeakDb: -1, note: "Sound Check normalizes to −16 LUFS" },
  { platform: "YouTube", targetLufs: -14, truePeakDb: -1, note: "Turned down to −14; no gain applied upward" },
  { platform: "Amazon Music", targetLufs: -14, truePeakDb: -2, note: "−2 dBTP ceiling is stricter than most" },
  { platform: "Podcasts (Apple)", targetLufs: -16, truePeakDb: -1, note: "Apple's published podcast spec" },
  { platform: "Podcasts (Spotify)", targetLufs: -16, truePeakDb: -1, note: "Matches Apple for a set-and-forget master" },
  { platform: "EBU R128 (EU broadcast)", targetLufs: -23, truePeakDb: -1, note: "The broadcast law across the EBU area" },
  { platform: "ATSC A/85 (US broadcast)", targetLufs: -24, truePeakDb: -2, note: "The US CALM-Act baseline" },
];

/**
 * How far a measured integrated loudness sits from a target, in LU
 * (positive = file is QUIETER than target by this much, negative = louder).
 * The UI uses this to say "add N LU of gain" directly.
 */
export function loudnessDelta(measuredLufs: number, targetLufs: number): number {
  if (!Number.isFinite(measuredLufs) || !Number.isFinite(targetLufs)) return 0;
  return +(targetLufs - measuredLufs).toFixed(1);
}

// ---------- silence statistics

export interface SilenceRun {
  startSec: number;
  endSec: number;
  durationSec: number;
}

export interface SilenceStatsResult {
  /** Total analyzed duration in seconds (all channels). */
  totalDurationSec: number;
  /** Sum of qualifying silent runs in seconds. */
  silenceDurationSec: number;
  /** silenceDurationSec / totalDurationSec, 0–100. */
  silencePercent: number;
  /** Qualifying silent runs, in chronological order. */
  runs: SilenceRun[];
  /** Number of qualifying runs. */
  runCount: number;
  /** Duration of the longest run (0 if none). */
  longestRunSec: number;
  /** Mean run length (0 if none). */
  meanRunSec: number;
  /** loudest 20 ms frame RMS in dBFS (null if the file is pure digital silence). */
  peakFrameDb: number | null;
  /** The threshold actually used, in dBFS. */
  thresholdDb: number;
}

export interface SilenceStatsOptions {
  /** Frame RMS below this dBFS counts as silence. Default −60. */
  thresholdDb?: number;
  /** Runs shorter than this are ignored (noise floor wobble). Default 500 ms. */
  minRunMs?: number;
  /** Analysis window. Default 20 ms. */
  frameMs?: number;
}

/**
 * Silence statistics: how much of a file is quiet, where the quiet parts are,
 * and how long they last. Useful for checking a recording has dead air to cut,
 * that a podcast's gaps between sentences feel natural, or that a "silence"
 * track actually is silent.
 */
export function silenceStats(
  channels: Float32Array[],
  sampleRate: number,
  opts: SilenceStatsOptions = {},
): SilenceStatsResult {
  const thresholdDb = opts.thresholdDb ?? -60;
  const minRunMs = opts.minRunMs ?? 500;
  const frameMs = opts.frameMs ?? 20;
  const thresholdLinear = Math.pow(10, thresholdDb / 20);

  const frames = Math.max(1, Math.floor((sampleRate * frameMs) / 1000));
  const totalSamples = channels[0]?.length ?? 0;
  const totalFrames = Math.floor(totalSamples / frames);

  const frameRmsDb: number[] = [];
  let peakDb = -Infinity;
  for (let f = 0; f < totalFrames; f++) {
    let sum = 0;
    let count = 0;
    for (const ch of channels) {
      const end = Math.min((f + 1) * frames, ch.length);
      for (let i = f * frames; i < end; i++) {
        sum += ch[i] * ch[i];
        count++;
      }
    }
    const rms = count > 0 ? Math.sqrt(sum / count) : 0;
    const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
    frameRmsDb.push(db);
    if (db > peakDb) peakDb = db;
  }

  // Group consecutive silent frames into runs, measured in samples.
  const runs: SilenceRun[] = [];
  let runStartFrame = -1;
  for (let f = 0; f <= totalFrames; f++) {
    const silent = f < totalFrames && frameRmsDb[f] < thresholdDb;
    if (silent && runStartFrame < 0) runStartFrame = f;
    if (!silent && runStartFrame >= 0) {
      const startSec = (runStartFrame * frames) / sampleRate;
      const endSec = (f * frames) / sampleRate;
      const durationSec = endSec - startSec;
      if (durationSec * 1000 >= minRunMs) {
        runs.push({ startSec, endSec, durationSec });
      }
      runStartFrame = -1;
    }
  }

  const silenceDurationSec = runs.reduce((acc, r) => acc + r.durationSec, 0);
  const totalDurationSec = totalSamples / sampleRate;
  const longestRunSec = runs.reduce((acc, r) => Math.max(acc, r.durationSec), 0);
  const meanRunSec = runs.length > 0 ? silenceDurationSec / runs.length : 0;

  return {
    totalDurationSec,
    silenceDurationSec,
    silencePercent: totalDurationSec > 0 ? +((silenceDurationSec / totalDurationSec) * 100).toFixed(1) : 0,
    runs,
    runCount: runs.length,
    longestRunSec: +longestRunSec.toFixed(3),
    meanRunSec: +meanRunSec.toFixed(3),
    peakFrameDb: Number.isFinite(peakDb) ? +peakDb.toFixed(1) : null,
    thresholdDb,
  };
}

// ---------- tuners & transposition (Batch 19) ----------

export interface TunerString {
  /** Open-string note in scientific pitch notation ("E2", "A2", …). */
  note: string;
  /** Sounding frequency of the open string in Hz. */
  hz: number;
  /** Display label (string number or instrument-specific name). */
  label: string;
}

/**
 * Standard tunings for the tuner tools. Frequencies derived from midiToFreq
 * at A4 = 440 (equal temperament) and inlined as literals so the table is a
 * stable reference — the Node test asserts them against midiToFreq().
 */
export const TUNER_PRESETS: Record<string, TunerString[]> = {
  guitar: [
    { note: "E2", hz: 82.41, label: "6th (low E)" },
    { note: "A2", hz: 110.0, label: "5th (A)" },
    { note: "D3", hz: 146.83, label: "4th (D)" },
    { note: "G3", hz: 196.0, label: "3rd (G)" },
    { note: "B3", hz: 246.94, label: "2nd (B)" },
    { note: "E4", hz: 329.63, label: "1st (high E)" },
  ],
  "bass-4": [
    { note: "E1", hz: 41.2, label: "4th (low E)" },
    { note: "A1", hz: 55.0, label: "3rd (A)" },
    { note: "D2", hz: 73.42, label: "2nd (D)" },
    { note: "G2", hz: 98.0, label: "1st (G)" },
  ],
  ukulele: [
    { note: "G4", hz: 392.0, label: "4th (G, re-entrant)" },
    { note: "C4", hz: 261.63, label: "3rd (C)" },
    { note: "E4", hz: 329.63, label: "2nd (E)" },
    { note: "A4", hz: 440.0, label: "1st (A)" },
  ],
  violin: [
    { note: "G3", hz: 196.0, label: "IV (G)" },
    { note: "D4", hz: 293.66, label: "III (D)" },
    { note: "A4", hz: 440.0, label: "II (A)" },
    { note: "E5", hz: 659.26, label: "I (E)" },
  ],
  cello: [
    { note: "C2", hz: 65.41, label: "IV (C)" },
    { note: "G2", hz: 98.0, label: "III (G)" },
    { note: "D3", hz: 146.83, label: "II (D)" },
    { note: "A3", hz: 220.0, label: "I (A)" },
  ],
};

export interface TunerReading {
  /** Detected frequency in Hz (0 when no stable pitch). */
  hz: number;
  /** Nearest open string's note name. */
  targetNote: string;
  /** Nearest open string's target frequency in Hz. */
  targetHz: number;
  /** centsBetween(targetHz, hz) rounded to 0.1 — positive = sharp. */
  cents: number;
  /** |cents| ≤ 5. */
  inTune: boolean;
  /** Diplay hint: "flat" / "sharp" / "in tune". */
  direction: "flat" | "sharp" | "in tune";
}

/**
 * Match a detected frequency to the nearest string of a preset tuning and
 * report the signed cents offset. Pure; used by both tuner tools' live
 * readouts (the detection itself is estimateFundamental in analyze.ts).
 */
export function tunerCents(hz: number, preset: TunerString[]): TunerReading | null {
  if (!(hz > 0)) return null;
  let best: TunerString | null = null;
  for (const s of preset) {
    if (!best || Math.abs(centsBetween(s.hz, hz)) < Math.abs(centsBetween(best.hz, hz))) {
      best = s;
    }
  }
  if (!best) return null;
  const cents = Math.round(centsBetween(best.hz, hz) * 10) / 10;
  return {
    hz,
    targetNote: best.note,
    targetHz: best.hz,
    cents,
    inTune: Math.abs(cents) <= 5,
    direction: Math.abs(cents) <= 5 ? "in tune" : cents < 0 ? "flat" : "sharp",
  };
}

export interface TransposedChord {
  /** Chord as typed, e.g. "Am". */
  original: string;
  /** Root after transposition. */
  transposedRoot: string;
  /** Chord quality suffix ("m", "7", "sus4", …). */
  suffix: string;
}

const PC_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/** Flat spelling per pitch class — must stay pitch-class-correct (Db=1, never "Cb"=11). */
const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const PC_LOOKUP: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

/**
 * Transpose chord symbols by ±semitones. Accepts sharps and flats as roots,
 * keeps any quality suffix verbatim ("Am7" → semitones +2 → "Bm7"), and
 * spells enharmonics as sharps (C#…) except using flats when the source root
 * was flatted. Returns null for roots it cannot parse.
 */
export function transposeChordSymbol(symbol: string, semitones: number): TransposedChord | null {
  const m = /^([A-G])([#b]?)(.*)$/.exec(symbol.trim());
  if (!m) return null;
  const baseName = m[1] + m[2];
  const pc = PC_LOOKUP[baseName];
  if (pc === undefined) return null;
  const shifted = (((pc + semitones) % 12) + 12) % 12;
  // Preserve the source's accidental preference: flat roots stay flatted.
  const name = m[2] === "b" ? FLAT_NAMES[shifted] : PC_NAMES[shifted];
  return { original: symbol.trim(), transposedRoot: name, suffix: m[3] ?? "" };
}
