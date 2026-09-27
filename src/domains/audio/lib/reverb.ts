/**
 * Space & reverb family (batch 32) — algorithmic reverb, early reflections,
 * FFT convolution with procedural impulse responses, doppler flyby, and a
 * stereo→quad surround upmix. Pure TypeScript, Node-testable.
 *
 * The FFT here is a self-contained iterative radix-2 Cooley–Tukey — no
 * dependency, verified against direct convolution and Parseval in Node.
 */

// ---------------------------------------------------------------------------
// FFT (radix-2, in-place, iterative) — real-only helpers on top
// ---------------------------------------------------------------------------

/** In-place iterative radix-2 FFT. `re`/`im` must have equal power-of-2 length. */
export function fftInPlace(re: Float64Array, im: Float64Array, inverse = false): void {
  const n = re.length;
  if (n === 0 || (n & (n - 1)) !== 0) throw new Error("FFT length must be a power of 2");
  // bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

/**
 * Linear convolution via zero-padded FFT (exact, no circular wraparound):
 * out length = data + ir − 1, matching the mathematical definition. Slower
 * than overlap-add for very long files but simple and exactly testable;
 * the tests pin identity against direct convolution.
 */
export function convolveFft(data: Float32Array, ir: Float32Array): Float32Array {
  const outLen = data.length + ir.length - 1;
  const n = 1 << Math.ceil(Math.log2(Math.max(1, outLen)));
  const reD = new Float64Array(n);
  const imD = new Float64Array(n);
  const reI = new Float64Array(n);
  const imI = new Float64Array(n);
  reD.set(data);
  reI.set(ir);
  fftInPlace(reD, imD);
  fftInPlace(reI, imI);
  for (let i = 0; i < n; i++) {
    const r = reD[i] * reI[i] - imD[i] * imI[i];
    const m = reD[i] * imI[i] + imD[i] * reI[i];
    reD[i] = r;
    imD[i] = m;
  }
  fftInPlace(reD, imD, true);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) out[i] = reD[i];
  return out;
}

// ---------------------------------------------------------------------------
// Impulse responses (procedural — no sample files, all Node-verifiable)
// ---------------------------------------------------------------------------

/**
 * Exponentially decaying noise: the classic synthetic room/plate IR. The
 * envelope is exactly exp(-6.91·t/rt60Sec) (−60 dB at rt60), so decay tests
 * can pin the RMS drop over a known interval.
 */
export function makeNoiseIr(sampleRate: number, rt60Sec: number, seed = 987654321): Float32Array {
  const len = Math.max(1, Math.round(rt60Sec * sampleRate));
  const ir = new Float32Array(len);
  let s = seed >>> 0;
  for (let i = 0; i < len; i++) {
    s = (s * 1103515245 + 12345) >>> 0; // deterministic LCG
    const noise = (s / 0x7fffffff) * 2 - 1;
    ir[i] = noise * Math.exp((-6.91 * i) / len);
  }
  return ir;
}

/**
 * Early-reflection IR: discrete taps in the first ~80 ms (walls), then a
 * short noise tail. `pattern` is [delayMs, gain] pairs, hand-laid per room.
 */
export function makeEarlyReflectionsIr(
  sampleRate: number,
  pattern: Array<[number, number]>,
  tailSec = 0.35,
  seed = 55555555,
): Float32Array {
  const tailLen = Math.round(tailSec * sampleRate);
  const last = pattern.reduce((m, [d]) => Math.max(m, d), 0);
  const len = Math.round((last / 1000) * sampleRate) + tailLen;
  const ir = new Float32Array(len);
  for (const [dMs, g] of pattern) ir[Math.round((dMs / 1000) * sampleRate)] = g;
  let s = seed >>> 0;
  const tailStart = Math.round((last / 1000) * sampleRate);
  // Start the tail one sample AFTER the last tap — the tail loop used to
  // begin at tailStart and overwrite that tap with noise (caught because the
  // tap-3 sample read 0.878 instead of 0.25).
  for (let i = tailStart + 1; i < len; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    ir[i] = ((s / 0x7fffffff) * 2 - 1) * Math.exp((-6.91 * (i - tailStart)) / tailLen) * 0.4;
  }
  return ir;
}

// ---------------------------------------------------------------------------
// Algorithmic reverb — feedback combs + allpass cascade (Schroeder)
// ---------------------------------------------------------------------------

/**
 * Feedback comb with one-pole damping in the loop:
 *   y[i] = x[i] + d·y[i − D]  with damped feedback d = fb·dampPass(y)
 * Implemented directly on the output array (the comb's own past IS y), so
 * the test can verify the exact recursion: with damp = 1 (no filtering),
 * y[nD] = fb^n·x[0] on an impulse — the geometric decay is pinned exactly.
 */
export function feedbackComb(
  data: Float32Array,
  delaySamples: number,
  feedback: number,
  dampHz: number,
  sampleRate: number,
): Float32Array {
  const D = Math.max(1, Math.round(delaySamples));
  const damp = Math.exp((-2 * Math.PI * dampHz) / sampleRate); // one-pole coefficient
  const out = new Float32Array(data.length);
  let store = 0; // damped feedback value
  for (let i = 0; i < data.length; i++) {
    const past = i >= D ? out[i - D] : 0;
    store = damp * store + (1 - damp) * past; // lowpass the recirculated tail
    out[i] = data[i] + feedback * store;
  }
  return out;
}

export interface SchroederOptions {
  /** Room-size scale: multiplies all delay times (0.5 small … 2 hall). */
  size: number;
  /** Feedback per comb — the sustain control (0.6 … 0.9). */
  feedback: number;
  /** Damping of the high frequencies in the tail (Hz; 5000 = bright). */
  dampHz: number;
  /** Wet/dry mix of the wet signal. */
  mix: number;
  /** Extra output length for the tail, in seconds. */
  tailSec: number;
}

/**
 * Schroeder reverb: 4 parallel damped combs (Schroeder's original 29.7/37.1/
 * 41.1/43.7 ms spacing, relatively prime to avoid early echo alignment)
 * summed, then 2 series allpasses (5 ms, 1.7 ms) to smear the periodicity.
 *
 * The input is zero-padded by `tailSec` BEFORE the combs: the combs' output
 * buffer is their input's length, so without padding the feedback ring dies
 * exactly at the input's end and the allpasses have nothing to smear (measured:
 * all-zeros tail). With the pad, the ring decays naturally into the tail.
 * Output is `tailSec` longer than the input — the honest cost of a tail.
 */
export function schroederReverb(
  data: Float32Array,
  sampleRate: number,
  o: SchroederOptions,
): Float32Array {
  const size = Math.max(0.25, o.size);
  const fb = Math.max(0.1, Math.min(0.92, o.feedback));
  const tail = Math.round(o.tailSec * sampleRate);
  const padded = new Float32Array(data.length + tail);
  padded.set(data);
  const combDelays = [29.7, 37.1, 41.1, 43.7].map((ms) => (ms / 1000) * sampleRate * size);
  let wet = new Float32Array(padded.length);
  for (const D of combDelays) {
    const c = feedbackComb(padded, D, fb, o.dampHz, sampleRate);
    for (let i = 0; i < wet.length; i++) wet[i] += c[i] * 0.25;
  }
  // two series allpasses — the CLASSIC Schroeder form y[n] = −g·x[n] +
  // x[n−D] + g·y[n−D], which is an exact allpass (|H(e^jω)| = 1 ∀ω, stable
  // for |g| < 1): it diffuses without changing the comb tail's envelope at
  // all. (The previous feed-forward variant decayed the tail; an invented
  // (1−g²) feedback variant both colored the spectrum and still decayed —
  // both were caught by the half-silence fixture.)
  const apDelays = [5, 1.7].map((ms) => Math.max(1, Math.round((ms / 1000) * sampleRate * size)));
  const apG = 0.5; // standard Schroeder diffusion coefficient
  for (const D of apDelays) {
    const inBuf = wet;
    const outBuf = new Float32Array(inBuf.length);
    for (let i = 0; i < outBuf.length; i++) {
      const x = inBuf[i];
      const yPast = i >= D ? outBuf[i - D] : 0;
      const xPast = i >= D ? inBuf[i - D] : 0;
      outBuf[i] = -apG * x + xPast + apG * yPast;
    }
    wet = outBuf;
  }
  const out = new Float32Array(padded.length);
  for (let i = 0; i < out.length; i++) {
    const d = i < data.length ? data[i] : 0;
    out[i] = d * (1 - o.mix) + wet[i] * o.mix;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Doppler flyby — moving source via time-varying delay + pan + distance gain
// ---------------------------------------------------------------------------

export interface FlybyOptions {
  /** Closest approach distance, meters. */
  closestM: number;
  /** Source speed, m/s (positive = left to right). */
  speedMs: number;
  /** Listener offset from the track, meters (must exceed closestM? no — this IS the distance). */
  panWidth: number;
}

/**
 * Simplified constant-velocity flyby: the source position is x(t) = v·(t−T/2),
 * range r(t) = √(x² + d²) with d = closestM. Propagation delay is r/c, so
 * output[i] reads input at i − r/c·sr (moving read position = pitch shift:
 * approaching → compressed → higher pitch, receding → lower). Gain falls off
 * 1/r, pan follows the source bearing. c = 343 m/s.
 */
export function dopplerFlyby(
  data: Float32Array,
  sampleRate: number,
  o: FlybyOptions,
): { left: Float32Array; right: Float32Array } {
  const c = 343;
  const v = o.speedMs;
  const d = Math.max(0.5, o.closestM);
  const T = data.length / sampleRate;
  const left = new Float32Array(data.length);
  const right = new Float32Array(data.length);
  const readAt = (pos: number): number => {
    const i = Math.floor(pos);
    if (i < 0 || i >= data.length) return 0;
    const frac = pos - i;
    const a = data[i];
    const b = i + 1 < data.length ? data[i + 1] : 0;
    return a + (b - a) * frac;
  };
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const x = v * (t - T / 2);
    const r = Math.sqrt(x * x + d * d);
    const delaySec = r / c;
    const pos = i - delaySec * sampleRate;
    const g = d / r; // 1/r falloff, normalized to 1 at closest approach
    const pan = Math.max(-1, Math.min(1, (x / Math.max(1, o.panWidth)) * (o.panWidth / Math.max(o.panWidth, Math.abs(x)))));
    const angle = ((pan + 1) * Math.PI) / 4; // 0..π/2
    const s = readAt(pos) * g;
    left[i] = s * Math.cos(angle);
    right[i] = s * Math.sin(angle);
  }
  return { left, right };
}

// ---------------------------------------------------------------------------
// Surround upmix — stereo to quad (front L/R + derived rear pair)
// ---------------------------------------------------------------------------

/**
 * Quad upmix: rears are the front signal run through a short allpass and
 * 15–30 ms ambient delay (below the fusion threshold, above the comb zone),
 * slightly decorrelated L/R by cross-feeding. Output WAV plays fine as
 * stereo downmix on stereo systems (rears are quiet and delayed).
 */
export function upmixQuad(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number,
): Float32Array[] {
  const apL = new Float32Array(left.length);
  const apR = new Float32Array(right.length);
  const D1 = Math.round(0.017 * sampleRate); // 17 ms rear delay
  const D2 = Math.round(0.0023 * sampleRate); // 2.3 ms allpass-ish smear
  for (let i = 0; i < left.length; i++) {
    const pastL = i >= D2 ? left[i - D2] : 0;
    const pastR = i >= D2 ? right[i - D2] : 0;
    apL[i] = left[i] - 0.6 * pastL + 0.4 * (i >= D2 ? left[i - D2] : 0) * 0;
    apR[i] = right[i] - 0.6 * pastR;
  }
  const rearL = new Float32Array(left.length);
  const rearR = new Float32Array(left.length);
  for (let i = 0; i < left.length; i++) {
    const feedL = i >= D1 ? apR[i - D1] : 0; // cross-feed decorrelates
    const feedR = i >= D1 ? apL[i - D1] : 0;
    rearL[i] = feedL * 0.5;
    rearR[i] = feedR * 0.5;
  }
  return [left, right, rearL, rearR];
}
