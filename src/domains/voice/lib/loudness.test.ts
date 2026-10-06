/**
 * Unit tests for the loudness normalizer.
 *
 * The cases here are the ones the algorithm's rules exist for: a clip that is
 * nothing but silence, one too short to judge, one already loud enough, one so
 * quiet it must hit the boost cap, and one whose peaks force the lookahead
 * limiter — including the branch where the limiter would have to work harder
 * than 3 dB and the gain is lowered instead.
 *
 * Every applied case also asserts the two invariants that must hold whatever
 * the input: the peak never crosses the ceiling, and no sample reaches full
 * scale.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_BOOST_DB,
  MAX_LIMITER_REDUCTION_DB,
  PEAK_CEILING_DB,
  TARGET_SPEECH_RMS_DB,
  normalizeSpeechLoudness,
} from "./loudness.ts";

const SR = 22050;
const CEILING = 10 ** (PEAK_CEILING_DB / 20);

const toDb = (value: number) => 20 * Math.log10(value);

/**
 * A steady sine whose gated RMS is exactly `rmsDb` below full scale, and whose
 * peak is therefore 3.01 dB above that (a sine's crest factor).
 */
function sine(rmsDb: number, seconds: number, sampleRate = SR): Float32Array {
  const amp = 10 ** ((rmsDb + 3.0103) / 20);
  const out = new Float32Array(Math.round(sampleRate * seconds));
  for (let i = 0; i < out.length; i++) out[i] = amp * Math.sin((2 * Math.PI * 220 * i) / sampleRate);
  return out;
}

/** `body` with a single full-scale-ish spike in the middle. */
function withSpike(body: Float32Array, spikeValue: number): Float32Array {
  const out = Float32Array.from(body);
  out[Math.floor(out.length / 2)] = spikeValue;
  return out;
}

function peakOf(samples: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > peak) peak = a;
  }
  return peak;
}

test("returns the input untouched when there is no speech at all", () => {
  const silence = new Float32Array(SR);
  const result = normalizeSpeechLoudness(silence, SR);

  assert.equal(result.samples, silence, "the input reference is reused");
  assert.equal(result.report.applied, false);
  assert.equal(result.report.skipReason, "silence");
  assert.equal(result.report.gainDb, 0);
});

test("returns the input untouched when the clip is too short to judge", () => {
  const short = sine(-30, 0.2);
  const result = normalizeSpeechLoudness(short, SR);

  assert.equal(result.samples, short);
  assert.equal(result.report.applied, false);
  assert.equal(result.report.skipReason, "too-short");
});

test("treats a mostly-silent clip as silence rather than boosting it", () => {
  const mostlySilent = new Float32Array(SR * 2);
  mostlySilent.set(sine(-6, 0.1).subarray(0, Math.round(SR * 0.1)), 0);
  const result = normalizeSpeechLoudness(mostlySilent, SR);

  assert.equal(result.samples, mostlySilent);
  assert.equal(result.report.applied, false);
  assert.equal(result.report.skipReason, "silence");
  assert.ok(result.report.speechFraction < 0.1, "the gate found almost no speech");
});

test("leaves an already-loud clip alone", () => {
  // gated RMS -9.03 dBFS, well above target, peak -6.02 dBFS, under the ceiling.
  const loud = sine(-9.03, 1);
  const result = normalizeSpeechLoudness(loud, SR);

  assert.equal(result.samples, loud, "no new buffer is allocated");
  assert.equal(result.report.applied, false);
  assert.equal(result.report.skipReason, "already-loud");
  assert.equal(result.report.gainDb, 0);
});

test("trims only enough to satisfy the ceiling on an over-ceiling loud clip", () => {
  // gated RMS -3.46 dBFS (above target) but peak -0.45 dBFS, over the ceiling.
  const hot = sine(-3.46, 1);
  assert.ok(toDb(peakOf(hot)) > PEAK_CEILING_DB, "precondition: over the ceiling");

  const result = normalizeSpeechLoudness(hot, SR);
  assert.equal(result.report.applied, true);
  assert.ok(result.report.gainDb < 0, "the trim is a reduction");
  assert.ok(
    Math.abs(toDb(peakOf(result.samples)) - PEAK_CEILING_DB) < 1e-4,
    "the peak lands exactly on the ceiling",
  );
});

test("caps the boost at +15 dB for an extremely quiet clip", () => {
  // gated RMS -45 dBFS (above the gate, so it counts as speech); reaching -18
  // would need +27 dB, so the cap is what applies.
  const quiet = sine(-45, 1);
  const result = normalizeSpeechLoudness(quiet, SR);

  assert.equal(result.report.applied, true);
  assert.equal(result.report.gainDb, MAX_BOOST_DB);
  assert.equal(result.report.limiterReductionDb, 0, "no limiter needed at this level");
  assert.ok(toDb(peakOf(result.samples)) < PEAK_CEILING_DB);
});

test("boosts normal speech onto the target with no limiting", () => {
  // Gated RMS -20.98 dBFS, peak -17.97 dBFS.
  const speech = sine(-20.98, 1);
  const result = normalizeSpeechLoudness(speech, SR);

  assert.equal(result.report.applied, true);
  assert.equal(result.report.limiterReductionDb, 0);
  assert.ok(
    Math.abs(result.report.speechRmsDbAfter - TARGET_SPEECH_RMS_DB) < 0.05,
    `landed on target (${result.report.speechRmsDbAfter.toFixed(2)} dBFS)`,
  );
  assert.ok(toDb(peakOf(result.samples)) <= PEAK_CEILING_DB + 1e-6);
});

test("bridges a 2.5 dB excess with the limiter, keeping the body at target", () => {
  // Body at -22 dBFS wants +4 dB; a 0.75 spike (-2.50 dBFS) leaves 1.50 dB of
  // headroom, so the limiter takes the remaining 2.50 dB.
  const speech = withSpike(sine(-22, 1), 0.75);
  const result = normalizeSpeechLoudness(speech, SR);

  // ~4 dB: the spike itself adds a little energy to its gate window, so the
  // measurement lands a hair under the nominal body level.
  assert.ok(Math.abs(result.report.gainDb - 4) < 0.05, `gain ${result.report.gainDb.toFixed(3)} dB`);
  assert.ok(
    Math.abs(result.report.limiterReductionDb - 2.5) < 0.05,
    `limiter took 2.5 dB (took ${result.report.limiterReductionDb.toFixed(2)})`,
  );
  assert.ok(result.report.limiterReductionDb <= MAX_LIMITER_REDUCTION_DB);
  assert.ok(Math.abs(toDb(peakOf(result.samples)) - PEAK_CEILING_DB) < 1e-5);
  // The ducked stretches (lookahead plus release) take a fraction of a dB out
  // of the body, which is the cost of holding the ceiling — well inside the
  // 1 dB the target is specified to.
  assert.ok(
    Math.abs(result.report.speechRmsDbAfter - TARGET_SPEECH_RMS_DB) < 0.3,
    `the body still lands near target (${result.report.speechRmsDbAfter.toFixed(2)} dBFS)`,
  );
  assert.ok(result.report.speechRmsDbAfter > result.report.speechRmsDbBefore, "still louder than before");
});

test("lowers the gain instead of asking the limiter for more than 3 dB", () => {
  // Body at -20.98 dBFS wants +2.98 dB; a 0.95 spike (-0.45 dBFS) is already
  // over the ceiling, and the excess (3.53 dB) is more than the limiter may take.
  const speech = withSpike(sine(-20.98, 1), 0.95);
  const result = normalizeSpeechLoudness(speech, SR);

  const wanted = TARGET_SPEECH_RMS_DB - result.report.speechRmsDbBefore;
  assert.ok(result.report.gainDb < wanted, "the gain was lowered below the target-raising value");
  assert.ok(
    Math.abs(result.report.limiterReductionDb - MAX_LIMITER_REDUCTION_DB) < 0.05,
    `the limiter took exactly its maximum (${result.report.limiterReductionDb.toFixed(2)} dB)`,
  );
  assert.ok(Math.abs(toDb(peakOf(result.samples)) - PEAK_CEILING_DB) < 1e-5);
});

test("holds the ceiling and never reaches full scale in any applied case", () => {
  const cases = [
    sine(-45, 1),
    sine(-20.98, 1),
    withSpike(sine(-22, 1), 0.75),
    withSpike(sine(-20.98, 1), 0.95),
    sine(-3.46, 1),
  ];

  for (const input of cases) {
    const { samples, report } = normalizeSpeechLoudness(input, SR);
    assert.equal(samples.length, input.length, "the length is preserved");
    const peak = peakOf(samples);
    assert.ok(toDb(peak) <= PEAK_CEILING_DB + 1e-5, `peak ${toDb(peak).toFixed(3)} dBFS stays under ceiling`);
    assert.ok(peak < 1, "no sample reaches full scale");
    if (!report.applied) assert.equal(samples, input);
  }
});

test("is deterministic: the same input produces identical output", () => {
  const input = withSpike(sine(-22, 1), 0.75);
  const first = normalizeSpeechLoudness(input, SR);
  const second = normalizeSpeechLoudness(input, SR);

  assert.deepStrictEqual(Array.from(first.samples), Array.from(second.samples));
  assert.deepStrictEqual(first.report, second.report);
});

test("decides the same gain whatever the sample rate", () => {
  // Same level, two engine rates: 16 kHz (the light tier) and 22050 Hz.
  const at16k = normalizeSpeechLoudness(sine(-20.98, 1, 16000), 16000);
  const at22k = normalizeSpeechLoudness(sine(-20.98, 1, 22050), 22050);

  assert.ok(
    Math.abs(at16k.report.gainDb - at22k.report.gainDb) < 0.01,
    `16k ${at16k.report.gainDb.toFixed(3)} dB vs 22k ${at22k.report.gainDb.toFixed(3)} dB`,
  );
});
