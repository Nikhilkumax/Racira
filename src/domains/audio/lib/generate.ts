/**
 * Pure signal synthesis for the Easy-tier generator tools.
 *
 * Same contract as edit.ts/analyze.ts: no browser APIs, no React,
 * deterministic given (params, sampleRate, durationSec), verified in Node
 * against the compiled output. The GeneratorToolShell (browser side) plays
 * and encodes whatever these functions produce.
 */

/** Deterministic LCG so noise tools are reproducible for a given seed. */
export function makeRng(seed: number): () => number {
  // LCG constants from Numerical Recipes; results in [0, 1).
  let state = (seed | 0) % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export interface Generated {
  channels: Float32Array[];
  sampleRate: number;
  length: number;
}

/** White noise: independent uniform samples, zero-mean. */
export function generateWhiteNoise(
  sampleRate: number,
  durationSec: number,
  amplitude: number,
  seed = 12345,
): Generated {
  const length = Math.max(1, Math.round(durationSec * sampleRate));
  const rng = makeRng(seed);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = (rng() * 2 - 1) * amplitude;
  return { channels: [out], sampleRate, length };
}

/**
 * Pink noise via the Paul Kellet cascade (±3 dB/oct −1 filter approximation,
 * the standard cheap implementation). Uniform white in, pink out.
 */
export function generatePinkNoise(
  sampleRate: number,
  durationSec: number,
  amplitude: number,
  seed = 12345,
): Generated {
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
export function generateBrownNoise(
  sampleRate: number,
  durationSec: number,
  amplitude: number,
  seed = 12345,
): Generated {
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
  for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(out[i]));
  const scale = peak > 1e-12 ? amplitude / peak : 0;
  for (let i = 0; i < length; i++) out[i] *= scale;
  return { channels: [out], sampleRate, length };
}

export type WaveShape = "sine" | "square" | "sawtooth" | "triangle" | "pulse";

/**
 * Naive band-limited-free oscillators (additive band-limiting is Batch 9+).
 *
 * Note: at exact cycle-wrap points the f64 product f·t can round to just
 * below the integer, placing the boundary sample on the far side of the
 * discontinuity (measured: 3 of 44100 samples at 100 Hz/44.1 kHz). This is
 * inherent to computing the phase as a product — inaudible and invisible to
 * Fourier analysis (harmonics stay exact to 4+ decimals).
 */
export function generateWave(
  shape: WaveShape,
  sampleRate: number,
  durationSec: number,
  frequencyHz: number,
  amplitude: number,
  dutyCycle = 0.5,
  phaseDeg = 0,
): Generated {
  const length = Math.max(1, Math.round(durationSec * sampleRate));
  const out = new Float32Array(length);
  const phase0 = (phaseDeg * Math.PI) / 180;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const phase = frequencyHz * t + phase0 / (2 * Math.PI);
    const frac = phase - Math.floor(phase);
    let v: number;
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

export interface SweepParams {
  /** Start frequency in Hz. */
  fromHz: number;
  /** End frequency in Hz. */
  toHz: number;
  durationSec: number;
  amplitude: number;
  /** "linear" = f(t) linear in Hz; "exponential" = geometric in Hz (fromHz>0). */
  curve: "linear" | "exponential";
}

/**
 * Frequency sweep: instantaneously integrates the instantaneous frequency so
 * a linear sweep produces a parabolic phase and an exponential sweep a
 * geometric phase — the chirp definitions.
 */
export function generateSweep(sampleRate: number, p: SweepParams): Generated {
  const length = Math.max(1, Math.round(p.durationSec * sampleRate));
  const out = new Float32Array(length);
  const f0 = Math.max(1e-6, p.fromHz);
  const f1 = Math.max(1e-6, p.toHz);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const frac = p.durationSec > 0 ? t / p.durationSec : 0;
    const inst =
      p.curve === "linear"
        ? f0 + (f1 - f0) * frac
        : f0 * Math.pow(f1 / f0, frac);
    phase += (2 * Math.PI * inst) / sampleRate;
    out[i] = Math.sin(phase) * p.amplitude;
  }
  return { channels: [out], sampleRate, length };
}

export interface ChirpParams {
  centerHz: number;
  /** Peak frequency deviation in Hz. */
  deviationHz: number;
  /** Modulation (chirp repetition) rate in Hz. */
  rateHz: number;
  durationSec: number;
  amplitude: number;
}

/** Chirp: sine with sinusoidally modulated instantaneous frequency. */
export function generateChirp(sampleRate: number, p: ChirpParams): Generated {
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

export interface WarbleParams {
  centerHz: number;
  /** Peak frequency deviation in Hz (fractional-octave style warble). */
  deviationHz: number;
  rateHz: number;
  durationSec: number;
  amplitude: number;
}

/** Warble tone: same FM structure as chirp, named for the audio use. */
export function generateWarble(sampleRate: number, p: WarbleParams): Generated {
  return generateChirp(sampleRate, p);
}

export interface BinauralParams {
  /** Carrier frequency for both ears in Hz. */
  carrierHz: number;
  /** Beat frequency: left = carrier − beat/2, right = carrier + beat/2. */
  beatHz: number;
  durationSec: number;
  amplitude: number;
}

/** Binaural beat: slightly detuned sines, one per channel. */
export function generateBinaural(sampleRate: number, p: BinauralParams): Generated {
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

export interface IsochronicParams {
  carrierHz: number;
  /** Pulse-train rate in Hz (amplitude gate). */
  pulseHz: number;
  durationSec: number;
  amplitude: number;
}

/**
 * Isochronic tone: carrier amplitude-gated by a raised-cosine pulse train —
 * smooth on/off so there is no click at gate edges.
 */
export function generateIsochronic(sampleRate: number, p: IsochronicParams): Generated {
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

export interface SolfeggioParams {
  /** One of the classic solfeggio frequencies, or any custom Hz. */
  frequencyHz: number;
  durationSec: number;
  amplitude: number;
  /** Optional gentle amplitude fade in/out to avoid clicks at boundaries. */
  fadeSec?: number;
}

/** Solfeggio tone: a pure sine at one of the solfeggio frequencies. */
export function generateSolfeggio(sampleRate: number, p: SolfeggioParams): Generated {
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

export interface ClickTrackParams {
  bpm: number;
  beats: number;
  /** Click carrier frequency (downbeat / other beats can differ). */
  accentHz: number;
  beatHz: number;
  /** Click length in ms. */
  clickMs: number;
  amplitude: number;
}

/**
 * Click track: an exponentially decaying sine per beat. Downbeats (beat 0 of
 * each bar, i.e. every 4th beat) use the accent frequency. Sample-exact:
 * each click starts at floor(beatIndex * sampleRate * 60 / bpm).
 */
export function generateClickTrack(sampleRate: number, p: ClickTrackParams): Generated {
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

export interface MetronomeParams {
  bpm: number;
  beats: number;
  /** Beats per bar for the accent pattern (default 4). */
  beatsPerBar?: number;
  amplitude: number;
  /** Wood-block style: higher pitch, shorter decay than a click track. */
  blockHz: number;
}

/** Metronome: wood-block accents on bar starts, ticks on other beats. */
export function generateMetronome(sampleRate: number, p: MetronomeParams): Generated {
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

export interface NoteSeqParams {
  /** MIDI note numbers in order (one per step). */
  midis: number[];
  /** Seconds per step (a note, a beat, ...). */
  stepSec: number;
  amplitude: number;
  /** Length of each note's sounding envelope as a fraction of stepSec (0–1]. */
  gate?: number;
  /** Fade-in/out in ms at each note edge to avoid clicks. */
  edgeFadeMs?: number;
}

/**
 * Render a monophonic MIDI sequence as decaying sine notes — the audio
 * backend for the Scale Generator and Chord Progression Builder. Notes are
 * non-overlapping steps; each note gets a short exponential decay so the
 * sequence reads musically rather than as a test tone.
 */
export function generateNoteSequence(sampleRate: number, p: NoteSeqParams): Generated {
  const stepLen = Math.max(1, Math.round(p.stepSec * sampleRate));
  const length = Math.max(1, stepLen * Math.max(1, p.midis.length));
  const out = new Float32Array(length);
  const gate = Math.min(1, Math.max(0.05, p.gate ?? 0.9));
  const noteLen = Math.max(1, Math.round(stepLen * gate));
  const fade = Math.max(1, Math.round(((p.edgeFadeMs ?? 5) / 1000) * sampleRate));
  for (let s = 0; s < p.midis.length; s++) {
    const freq = 440 * Math.pow(2, (p.midis[s] - 69) / 12);
    const start = s * stepLen;
    for (let i = 0; i < noteLen && start + i < length; i++) {
      const t = i / sampleRate;
      let env = Math.exp(-t / (p.stepSec * 0.6));
      if (i < fade) env *= i / fade;
      if (i > noteLen - fade) env *= Math.max(0, (noteLen - i) / fade);
      out[start + i] += Math.sin(2 * Math.PI * freq * t) * env * p.amplitude;
    }
  }
  return { channels: [out], sampleRate, length };
}

// ---------- room tone (Batch 18) ----------

export interface RoomToneParams {
  /** Character of the space: hum level, air color, balance. */
  room: "apartment" | "house" | "studio" | "office";
  /** Overall output level (linear, 0–1). */
  amplitude: number;
  durationSec: number;
  /** Random-walk wander speed of the tone (0–1; 0 = static). */
  wander: number;
  seed: number;
}

interface RoomToneCharacter {
  /** 50/60 Hz mains hum fundamental. */
  humHz: number;
  /** Relative hum level. */
  humLevel: number;
  /** Harmonics of the mains fundamental (2f, 3f, ...) relative levels. */
  harmonics: number[];
  /** Lowpassed-noise color: cutoff fraction of Nyquist. */
  airCutoff: number;
  /** Relative broadband air level. */
  airLevel: number;
  /** Rumble center fraction of Nyquist (very low slow noise). */
  rumbleCutoff: number;
  /** Relative rumble level. */
  rumbleLevel: number;
  /** Stereo spread of the air component. */
  stereoSpread: number;
}

/**
 * Room-tone recipes per space type. Real rooms differ in hum (apartments on
 * shared mains), air color (HVAC = broadband hiss), and rumble (traffic,
 * refrigerators). Levels are relative to the amplitude parameter.
 */
const ROOM_TONES: Record<RoomToneParams["room"], RoomToneCharacter> = {
  apartment: { humHz: 60, humLevel: 0.16, harmonics: [0.5, 0.12], airCutoff: 0.28, airLevel: 0.3, rumbleCutoff: 0.012, rumbleLevel: 0.5, stereoSpread: 0.4 },
  house: { humHz: 60, humLevel: 0.1, harmonics: [0.4, 0.08], airCutoff: 0.2, airLevel: 0.22, rumbleCutoff: 0.008, rumbleLevel: 0.6, stereoSpread: 0.6 },
  studio: { humHz: 50, humLevel: 0.03, harmonics: [0.25, 0.05], airCutoff: 0.45, airLevel: 0.18, rumbleCutoff: 0.006, rumbleLevel: 0.2, stereoSpread: 0.3 },
  office: { humHz: 60, humLevel: 0.12, harmonics: [0.45, 0.1], airCutoff: 0.55, airLevel: 0.45, rumbleCutoff: 0.01, rumbleLevel: 0.35, stereoSpread: 0.8 },
};

/** One-pole lowpass coefficient for a normalized cutoff (0–1 of Nyquist). */
function lowpassCoef(cutoffNorm: number): number {
  const omega = Math.PI * Math.min(0.999, Math.max(0.0001, cutoffNorm));
  return Math.exp(-omega); // y += k·(x − y); k=1 → passthrough, k→0 → frozen
}

/**
 * Room tone: the "silence" a room actually has — mains hum + lowpassed air
 * noise + slow rumble — for putting under dialogue edits so cuts don't sound
 * digital. Deterministic in (params, sampleRate): seeded LCG noise fed through
 * a one-pole lowpass for the air, plus random-walk slow modulation on the
 * hum and air levels so the tone breathes like a real room instead of a loop.
 *
 * Hum is exact and testable: sample i of the hum component is
 *   humLevel · Σ_h harmonics[h] · sin(2π·humHz·(h+1)·i/sr) · walk(i)
 * where walk() is the seeded random-walk envelope (asserted over exact
 * integer-cycle boundaries where sin() returns to 0). Air and rumble are
 * verified statistically (bounded peak, RMS ordering by recipe level).
 */
export function generateRoomTone(sampleRate: number, p: RoomToneParams): Generated {
  const length = Math.max(1, Math.round(p.durationSec * sampleRate));
  const c = ROOM_TONES[p.room];

  const rng = makeRng(p.seed);
  const hum = new Float32Array(length);
  const airL = new Float32Array(length);
  const airR = new Float32Array(length);
  const rumble = new Float32Array(length);

  // White noise sources (independent streams for L/R and rumble).
  for (let i = 0; i < length; i++) {
    airL[i] = rng() * 2 - 1;
    airR[i] = rng() * 2 - 1;
    rumble[i] = rng() * 2 - 1;
  }

  const wander = Math.min(1, Math.max(0, p.wander));
  // Random-walk rate: each walk step lasts ~37 ms (sampled once per this many
  // samples), linearly interpolated — slow enough to feel like a room, fast
  // enough to mask looping.
  const walkStep = Math.max(1, Math.round(sampleRate * 0.037));
  let walkHum = 1;
  let walkTargetHum = 1;
  let walkAir = 1;
  let walkTargetAir = 1;
  let idx = 0;
  let nextIdx = walkStep;
  let frac = 0;

  const kAir = lowpassCoef(c.airCutoff);
  const kRumble = lowpassCoef(c.rumbleCutoff);
  let airLState = 0, airRState = 0, rumbleState = 0;

  const humOmega = (2 * Math.PI * c.humHz) / sampleRate;

  for (let i = 0; i < length; i++) {
    // Advance the random walks.
    if (i >= nextIdx) {
      idx = i;
      nextIdx = i + walkStep;
      frac = 0;
      walkHum = walkTargetHum;
      walkAir = walkTargetAir;
      walkTargetHum = 1 + wander * (rng() * 2 - 1) * 0.5;
      walkTargetAir = 1 + wander * (rng() * 2 - 1) * 0.5;
    } else {
      frac = (i - idx) / walkStep;
    }
    const humGain = walkHum + (walkTargetHum - walkHum) * frac;
    const airGain = walkAir + (walkTargetAir - walkAir) * frac;

    // Mains hum with harmonics (h = 0 → fundamental, h = 1 → 2nd, ...).
    const humSample = c.harmonics.reduce(
      (acc, rel, h) => acc + rel * Math.sin(humOmega * (h + 1) * i),
      0,
    );

    airLState += kAir * (airL[i] - airLState);
    airRState += kAir * (airR[i] - airRState);
    rumbleState += kRumble * (rumble[i] - rumbleState);

    hum[i] = c.humLevel * humSample * humGain;
    // Stereo air: two already-independent noise streams share a mono level,
    // pulled toward center as spread shrinks (0 = mono air, 1 = wide).
    const airMono = c.airLevel * airGain;
    const airPan = c.stereoSpread * 0.5;
    airL[i] = airLState * airMono * (1 - airPan);
    airR[i] = airRState * airMono * (1 - airPan);
    rumble[i] = rumbleState * c.rumbleLevel * airGain;
  }

  // Mix down to stereo: hum+rumble centered, air spread.
  const outL = new Float32Array(length);
  const outR = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    outL[i] = (hum[i] + rumble[i] + airL[i]) * p.amplitude;
    outR[i] = (hum[i] + rumble[i] + airR[i]) * p.amplitude;
  }
  return { channels: [outL, outR], sampleRate, length };
}
