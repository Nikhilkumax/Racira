/**
 * Modulation & lo-fi effects family (batch 30) — chorus, flanger, phaser,
 * bitcrusher, auto-wah. Pure TypeScript so every algorithm is Node-testable
 * sample-exactly; the components are thin parameter UIs over these.
 *
 * All functions process ONE channel; components map them over channels. LFO
 * phase is derived from the sample index, so stereo channels stay coherent.
 */
import { applyBiquad, type BiquadCoeffs } from "./edit";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Linear-interpolated read at a (possibly fractional) position in the past.
 * Out-of-range samples read as silence, so position 0.5 interpolates between
 * "silence" and x[0] — the natural fade-in of a delay-line voice. (A first
 * draft returned 0 for pos ≤ 0, which wrongly silenced reads at exactly
 * position 0 — the flanger's comb test caught it: out[D] was 0 instead of
 * mix·x[0].)
 */
function readPast(data: Float32Array, pos: number): number {
  const i = Math.floor(pos);
  const frac = pos - i;
  const a = i >= 0 && i < data.length ? data[i] : 0;
  const b = i + 1 >= 0 && i + 1 < data.length ? data[i + 1] : 0;
  return a + (b - a) * frac;
}

/**
 * RBJ bandpass, constant 0 dB peak gain (cookbook "BPF" case) — the wah's
 * voice. Distinct from the lowpass/highpass/peaking set in edit.ts: this is
 * the one shape that family does not cover.
 */
export function bandpassCoeffs(sampleRate: number, freqHz: number, q: number): BiquadCoeffs {
  const w0 = (2 * Math.PI * freqHz) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const cos0 = Math.cos(w0);
  const a0 = 1 + alpha;
  return {
    b0: alpha / a0,
    b1: 0,
    b2: -alpha / a0,
    a1: (-2 * cos0) / a0,
    a2: (1 - alpha) / a0,
  };
}

/**
 * RBJ second-order allpass (cookbook "APF" case): |H| = 1 at every
 * frequency, phase sweeps −2π across the spectrum. The phaser's building
 * block. Exported for Node tests of the identity.
 */
export function allpassCoeffs(sampleRate: number, freqHz: number, q: number): BiquadCoeffs {
  const w0 = (2 * Math.PI * freqHz) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const cos0 = Math.cos(w0);
  const a0 = 1 + alpha;
  return {
    b0: (1 - alpha) / a0,
    b1: (-2 * cos0) / a0,
    b2: (1 + alpha) / a0,
    a1: (-2 * cos0) / a0,
    a2: (1 - alpha) / a0,
  };
}

// ---------------------------------------------------------------------------
// Chorus — multiple detuned-but-not-detuned voices via modulated delay
// ---------------------------------------------------------------------------

export interface ChorusOptions {
  /** LFO rate in Hz; 0 freezes the delay at baseMs. */
  rateHz: number;
  /** Average delay in ms (15–25 ms reads as "doubled", not as an echo). */
  baseMs: number;
  /** LFO swing in ms. */
  depthMs: number;
  /** Wet mix of the delayed voice (dry is always passed at full level). */
  mix: number;
}

/**
 * out[i] = x[i] + mix · x[i − (base + depth·sin(ωi))], the canonical single-
 * voice chorus. Two exact limits anchor the tests: rate 0 (constant delay —
 * an integer base makes the voice sample-exact) and mix 0 (pure dry).
 */
export function chorusChannel(
  data: Float32Array,
  sampleRate: number,
  o: ChorusOptions,
): Float32Array {
  const mix = clamp(o.mix, 0, 1);
  const rate = Math.max(0, o.rateHz);
  const base = Math.max(1, (o.baseMs / 1000) * sampleRate);
  const depth = Math.max(0, (o.depthMs / 1000) * sampleRate);
  const w = (2 * Math.PI * rate) / sampleRate;
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const delay = base + depth * Math.sin(w * i);
    out[i] = data[i] + mix * readPast(data, i - delay);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Flanger — very short modulated delay with feedback (resonant comb)
// ---------------------------------------------------------------------------

export interface FlangerOptions {
  rateHz: number;
  baseMs: number;
  depthMs: number;
  mix: number;
  /** Feedback of the delay line, 0..0.9 — drives the classic jet sweep. */
  feedback: number;
}

/**
 * The flanger voice z feeds back on itself:
 *   z[i] = x[i − delay(i)] + fb·z[i − delay(i)]
 *   out[i] = x[i] + mix·z[i]
 * With rate 0 and integer base delay D the impulse response is exactly the
 * feedback comb x·δ + (x∘fb) at multiples of D: impulse in → out[D] = mix,
 * out[2D] = mix·fb, out[3D] = mix·fb² — the test pins all three.
 */
export function flangerChannel(
  data: Float32Array,
  sampleRate: number,
  o: FlangerOptions,
): Float32Array {
  const mix = clamp(o.mix, 0, 1);
  const fb = clamp(o.feedback, 0, 0.9);
  const rate = Math.max(0, o.rateHz);
  const base = Math.max(1, (o.baseMs / 1000) * sampleRate);
  const depth = Math.max(0, (o.depthMs / 1000) * sampleRate);
  const w = (2 * Math.PI * rate) / sampleRate;
  const out = new Float32Array(data.length);
  const z = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const delay = base + depth * Math.sin(w * i);
    const pos = i - delay;
    z[i] = readPast(data, pos) + fb * readPast(z, pos);
    out[i] = data[i] + mix * z[i];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Phaser — chain of modulated allpasses, mixed against the dry signal
// ---------------------------------------------------------------------------

export interface PhaserOptions {
  rateHz: number;
  /** Sweep range for the allpass corner frequency (logarithmic sweep). */
  fminHz: number;
  fmaxHz: number;
  /** Number of allpass stages (1–8); notches appear where the chain's phase
   * difference from the dry path hits 180°. */
  stages: number;
  mix: number;
}

/**
 * One allpass chain with per-stage state, corner frequency sweeping
 * logarithmically fmin·(fmax/fmin)^(0.5+0.5·sin(ωi)). Mixing convention
 * out = dry − mix·chain makes the anchors exact: the RBJ APF has gain +1 at
 * DC AND at Nyquist (its phase hits −π at the corner frequency, which is
 * where the notches form when summed against dry), so both anchors settle at
 * (1 − mix)·x regardless of stage count — verified in Node.
 */
export function phaserChannel(
  data: Float32Array,
  sampleRate: number,
  o: PhaserOptions,
): Float32Array {
  const mix = clamp(o.mix, 0, 1);
  const rate = Math.max(0, o.rateHz);
  const fmin = clamp(o.fminHz, 10, sampleRate / 4);
  const fmax = clamp(o.fmaxHz, fmin, sampleRate / 2 - 10);
  const stages = Math.round(clamp(o.stages, 1, 8));
  const w = (2 * Math.PI * rate) / sampleRate;
  const out = new Float32Array(data.length);
  const x1 = new Float32Array(stages);
  const x2 = new Float32Array(stages);
  const y1 = new Float32Array(stages);
  const y2 = new Float32Array(stages);
  for (let i = 0; i < data.length; i++) {
    const norm = 0.5 + 0.5 * Math.sin(w * i);
    const f = fmin * Math.pow(fmax / fmin, norm);
    const c = allpassCoeffs(sampleRate, f, 0.7);
    let v = data[i];
    for (let s = 0; s < stages; s++) {
      const y0 = c.b0 * v + c.b1 * x1[s] + c.b2 * x2[s] - c.a1 * y1[s] - c.a2 * y2[s];
      x2[s] = x1[s]; x1[s] = v;
      y2[s] = y1[s]; y1[s] = y0;
      v = y0;
    }
    out[i] = data[i] - mix * v;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Bitcrusher — quantization + sample-and-hold downsampling
// ---------------------------------------------------------------------------

export interface BitcrushOptions {
  /** Target bit depth, 2–16. 16 is transparent. */
  bits: number;
  /** Sample-and-hold factor: each output value is held for `hold` samples. */
  hold: number;
}

/**
 * y[i] = round(x[⌊i/hold⌋·hold] · L) / L with L = 2^(bits−1) − 1 (signed-int
 * levels). Both degradations are exact: every output lies on the 1/L grid,
 * and within a hold block every sample is bit-identical to the block's first.
 */
export function bitcrushChannel(data: Float32Array, o: BitcrushOptions): Float32Array {
  const bits = Math.round(clamp(o.bits, 2, 16));
  const L = Math.pow(2, bits - 1) - 1;
  const hold = Math.max(1, Math.round(o.hold));
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const src = i - (i % hold);
    const q = Math.round(data[src] * L) / L;
    out[i] = clamp(q, -1, 1);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Auto-wah — envelope-driven bandpass sweep
// ---------------------------------------------------------------------------

export interface AutoWahOptions {
  fminHz: number;
  fmaxHz: number;
  /** Input level that fully opens the filter (0.25 means −12 dBFS opens it). */
  openAt: number;
  attackMs: number;
  releaseMs: number;
  mix: number;
}

/**
 * Envelope → frequency mapping: logarithmic interpolation between the closed
 * and open frequencies. Exposed separately because it is the wah's whole
 * character and is exactly testable (norm 0, ½, 1 → fmin, √(fmin·fmax), fmax).
 */
export function wahFreqForEnv(norm: number, fminHz: number, fmaxHz: number): number {
  const fmin = clamp(fminHz, 20, 20000);
  const fmax = clamp(fmaxHz, fmin, 20000);
  return fmin * Math.pow(fmax / fmin, clamp(norm, 0, 1));
}

/**
 * One-pole envelope on |x| (attack when rising, release when falling — same
 * ballistics as the dynamics family), mapped through wahFreqForEnv to a
 * bandpass corner. A steady sine of amplitude A settles at the mean |x|
 * (2A/π), so the settled frequency is exactly predictable and the output
 * must equal a manual bandpass at that frequency — the equivalence test.
 */
export function autoWahChannel(
  data: Float32Array,
  sampleRate: number,
  o: AutoWahOptions,
): Float32Array {
  const mix = clamp(o.mix, 0, 1);
  const openAt = Math.max(0.01, o.openAt);
  const atk = Math.exp(-1 / ((Math.max(0.1, o.attackMs) / 1000) * sampleRate));
  const rel = Math.exp(-1 / ((Math.max(1, o.releaseMs) / 1000) * sampleRate));
  const out = new Float32Array(data.length);
  let env = 0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    env = a > env ? atk * env + (1 - atk) * a : rel * env + (1 - rel) * a;
    const f = wahFreqForEnv(env / openAt, o.fminHz, o.fmaxHz);
    const c = bandpassCoeffs(sampleRate, f, 2);
    const x0 = data[i];
    const y0 = c.b0 * x0 + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
    x2 = x1; x1 = x0;
    y2 = y1; y1 = y0;
    out[i] = (1 - mix) * x0 + mix * y0;
  }
  return out;
}
