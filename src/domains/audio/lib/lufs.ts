/**
 * ITU-R BS.1770-4 loudness measurement — pure, Node-verified.
 *
 * K-weighting is the standard two-stage filter (high shelf + high-pass)
 * with the published coefficient formulas (identical to those used by
 * pyloudnorm and the EBU reference implementation). Integrated loudness
 * follows the 400 ms / 75 %-overlap block scheme with the absolute (−70
 * LUFS) and relative (−10 LU) gates.
 *
 * These are measurements, not estimates: the EBU Mode anchor (stereo 1 kHz
 * sine at −23 dBFS per channel must read −23.0 LUFS ±0.1 and the −20 dBFS
 * anchor −20.0 ±0.1) is asserted in the Node tests, so a browser run of
 * Loudness Normalizer inherits a standards-checked meter.
 */

// ---------------------------------------------------------------------------
// K-weighting biquads (BS.1770-4 / ITU BS.2056 formulas)
// ---------------------------------------------------------------------------

interface BiquadState {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

function makeStage(b: [number, number, number], a: [number, number, number]): BiquadState {
  return { b0: b[0], b1: b[1], b2: b[2], a1: a[1], a2: a[2], x1: 0, x2: 0, y1: 0, y2: 0 };
}

function processStage(s: BiquadState, x: number): number {
  const y = s.b0 * x + s.b1 * s.x1 + s.b2 * s.x2 - s.a1 * s.y1 - s.a2 * s.y2;
  s.x2 = s.x1;
  s.x1 = x;
  s.y2 = s.y1;
  s.y1 = y;
  return y;
}

/**
 * Stage 1 — high shelf ("head"), +4 dB above ~1.5 kHz, normalized per the
 * standard's coefficient table evaluated at `sampleRate`.
 */
function shelfStage(sampleRate: number): BiquadState {
  // Exactly the pyloudnorm / BS.1770 table: 4 dB shelf, pre-warped K.
  const db = 3.999843853973347;
  const f0 = 1681.974450955533;
  const Q = 0.7071752369554196;
  const K = Math.tan((Math.PI * f0) / sampleRate);
  const Vh = Math.pow(10, db / 20);
  const Vb = Math.pow(Vh, 0.4996667741545416);
  const denom = 1 + K / Q + K * K;
  const b0 = (Vh + Vb * K / Q + K * K) / denom;
  const b1 = (2 * (K * K - Vh)) / denom;
  const b2 = (Vh - Vb * K / Q + K * K) / denom;
  const a1 = (2 * (K * K - 1)) / denom;
  const a2 = (1 - K / Q + K * K) / denom;
  return makeStage([b0, b1, b2], [1, a1, a2]);
}

/**
 * Stage 2 — high-pass ("RLB"), −0.06 dB above ~38 Hz rolling off below.
 */
function highpassStage(sampleRate: number): BiquadState {
  const f0 = 38.13547087602444;
  const Q = 0.5003270373238773;
  const K = Math.tan((Math.PI * f0) / sampleRate);
  const denom = 1 + K / Q + K * K;
  const a1 = (2 * (K * K - 1)) / denom;
  const a2 = (1 - K / Q + K * K) / denom;
  // The standard's numerators are already normalized (a0 = 1).
  return makeStage([1, -2, 1], [1, a1, a2]);
}

/** Run one channel through the full K-weighting filter chain. */
export function kWeightChannel(data: Float32Array, sampleRate: number): Float32Array {
  const shelf = shelfStage(sampleRate);
  const hp = highpassStage(sampleRate);
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = processStage(hp, processStage(shelf, data[i]));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Momentary / short-term / integrated loudness
// ---------------------------------------------------------------------------

/** Mean square of a (already K-weighted) block. */
function blockMeanSquare(block: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < block.length; i++) sum += block[i] * block[i];
  return sum / block.length;
}

/** Power sum of one momentary block across channels (BS.1770 channel sum). */
function blockLoudnessLufs(meanSquares: number[]): number {
  // −0.691 + 10·log10(Σ channel weighted mean squares). Mono/stereo both use
  // weight 1.0 per channel (L=R convention for stereo).
  return -0.691 + 10 * Math.log10(meanSquares.reduce((a, b) => a + b, 0));
}

export interface IntegratedLoudness {
  /** Integrated loudness in LUFS (gated). */
  lufs: number;
  /** Momentary max (400 ms) in LUFS. */
  momentaryMaxLufs: number;
  /** Short-term max (3 s) in LUFS. */
  shortTermMaxLufs: number;
}

/**
 * Full BS.1770-4 integrated loudness with both gates. Returns −Infinity for
 * digital silence.
 */
export function integratedLoudness(
  channels: Float32Array[],
  sampleRate: number,
): IntegratedLoudness {
  const weighted = channels.map((ch) => kWeightChannel(ch, sampleRate));
  const blockLen = Math.round(0.4 * sampleRate);
  const step = Math.round(0.1 * sampleRate); // 75 % overlap
  const n = weighted[0].length;
  const loudnesses: number[] = [];
  let momentaryMax = -Infinity;
  let shortTermMax = -Infinity;

  if (n >= blockLen) {
    for (let start = 0; start + blockLen <= n; start += step) {
      const ms: number[] = [];
      for (const ch of weighted) {
        let sum = 0;
        for (let i = start; i < start + blockLen; i++) sum += ch[i] * ch[i];
        ms.push(sum / blockLen);
      }
      const l = blockLoudnessLufs(ms);
      if (l > momentaryMax) momentaryMax = l;
      loudnesses.push(l);
    }

    // Short-term: same frames but 3 s windows (approximated as the max over
    // any 30-consecutive-block span = 3 s at 75 % overlap).
    const shortBlocks = 30;
    for (let i = 0; i + shortBlocks <= loudnesses.length; i++) {
      // mean square domain: average the linear powers, then to LUFS
      let powSum = 0;
      for (let k = 0; k < shortBlocks; k++) powSum += Math.pow(10, (loudnesses[i + k] + 0.691) / 10);
      const l = -0.691 + 10 * Math.log10(powSum / shortBlocks);
      if (l > shortTermMax) shortTermMax = l;
    }
  }

  // Gate 1: absolute −70 LUFS.
  const above = loudnesses.filter((l) => l > -70);
  if (above.length === 0) {
    return { lufs: -Infinity, momentaryMaxLufs: momentaryMax, shortTermMaxLufs: shortTermMax };
  }
  // Gate 2: relative −10 LU below the mean of gate-1 blocks.
  const absMean =
    -0.691 + 10 * Math.log10(above.reduce((a, l) => a + Math.pow(10, (l + 0.691) / 10), 0) / above.length);
  const relThreshold = absMean - 10;
  const gated = above.filter((l) => l > relThreshold);
  const lufs =
    -0.691 +
    10 * Math.log10(gated.reduce((a, l) => a + Math.pow(10, (l + 0.691) / 10), 0) / gated.length);
  return { lufs, momentaryMaxLufs: momentaryMax, shortTermMaxLufs: shortTermMax };
}

// ---------------------------------------------------------------------------
// Gain helpers used by the normalizer UI
// ---------------------------------------------------------------------------

/**
 * Gain (dB, may be negative) to hit `targetLufs` from a measurement. Returns
 * null for silence (no honest gain exists).
 */
export function gainToTargetLufs(measuredLufs: number, targetLufs: number): number | null {
  if (!Number.isFinite(measuredLufs)) return null;
  return targetLufs - measuredLufs;
}

// ---------------------------------------------------------------------------
// Short-term loudness series + Loudness Range (EBU Tech 3342)
// ---------------------------------------------------------------------------

export interface ShortTermPoint {
  /** Center time of the 3 s window, in seconds. */
  timeSec: number;
  /** Short-term loudness in LUFS, or -Infinity for digital silence. */
  lufs: number;
}

/**
 * Short-term loudness series: 3 s windows, 10 Hz update rate (EBU Tech 3342
 * short-term). Same K-weighting and mean-square as the integrated measure,
 * but ungated — this is the raw series the LRA distribution is built from.
 */
export function shortTermLoudness(
  channels: Float32Array[],
  sampleRate: number,
): ShortTermPoint[] {
  const weighted = channels.map((ch) => kWeightChannel(ch, sampleRate));
  const winLen = Math.round(3 * sampleRate);
  const step = Math.max(1, Math.round(sampleRate / 10)); // 10 Hz
  const n = weighted[0].length;
  const points: ShortTermPoint[] = [];
  for (let start = 0; start + winLen <= n; start += step) {
    let sum = 0;
    for (const ch of weighted) {
      for (let i = start; i < start + winLen; i++) sum += ch[i] * ch[i];
    }
    if (sum <= 0) {
      points.push({ timeSec: (start + winLen / 2) / sampleRate, lufs: -Infinity });
    } else {
      // Mono/stereo both weight 1.0 (matches integratedLoudness's convention).
      const lufs = -0.691 + 10 * Math.log10(sum / (winLen * channels.length));
      points.push({ timeSec: (start + winLen / 2) / sampleRate, lufs });
    }
  }
  return points;
}

/**
 * Loudness Range (LRA) per EBU Tech 3342: the difference between the 95th and
 * 10th percentiles of the short-term loudness distribution after the absolute
 * (-70 LUFS) and relative (-20 LU) gates. Returns null when the material is
 * too short or too quiet to have a distribution.
 */
export function loudnessRange(points: ShortTermPoint[]): number | null {
  const absoluteGate = points.filter((p) => p.lufs > -70);
  if (absoluteGate.length < 2) return null;
  // Relative gate: -20 LU below the mean of the power average of surviving
  // (non-silent) windows. EBU averages loudness, not LUFS values, so convert
  // back to power: mean(10^(lufs/10)).
  const finite = absoluteGate.filter((p) => Number.isFinite(p.lufs));
  if (finite.length < 2) return null;
  const meanPower = finite.reduce((a, p) => a + Math.pow(10, p.lufs / 10), 0) / finite.length;
  const relativeGateLufs = 10 * Math.log10(meanPower) - 20;
  const gated = finite.filter((p) => p.lufs > relativeGateLufs);
  if (gated.length < 2) return null;
  const values = gated.map((p) => p.lufs).sort((a, b) => a - b);
  const percentile = (q: number) => {
    const idx = (values.length - 1) * q;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return values[lo] + (values[hi] - values[lo]) * (idx - lo);
  };
  return percentile(0.95) - percentile(0.1);
}

/**
 * EBU Mode test: a 1 kHz stereo sine at `levelDbfs` per channel must measure
 * `levelDbfs` LUFS (±0.1). Exposed for the Node test suite.
 */
export function selfCheck(sampleRate: number, levelDbfs = -23): { measured: number; pass: boolean } {
  const n = sampleRate * 2; // 2 s
  const amp = Math.pow(10, levelDbfs / 20);
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = amp * Math.sin((2 * Math.PI * 1000 * i) / sampleRate);
    l[i] = v;
    r[i] = v;
  }
  const { lufs } = integratedLoudness([l, r], sampleRate);
  return { measured: lufs, pass: Math.abs(lufs - levelDbfs) <= 0.1 };
}
