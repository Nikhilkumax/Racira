/**
 * Batch 23 Node verification — pure functions added to audioFormats.ts:
 *   buildDecodeArgs / DECODER_TARGETS (WMA/M4B/CAF Decoder)
 *   buildAlacArgs / ALAC_TARGETS (ALAC/M4A Lossless Converter)
 *   targetExtension
 * Recompile: npx tsc src/domains/audio/lib/audioFormats.ts --outDir scratch/.batch23 --module commonjs --target es2020 --skipLibCheck --esModuleInterop
 */
const assert = require("assert");
const af = require("./.batch23/audioFormats.js");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ok - " + name);
  } catch (e) {
    console.error("  FAIL - " + name + ": " + e.message);
    process.exitCode = 1;
  }
}

check("buildDecodeArgs mp3: input, -vn, metadata preserve, lame 192k, output", () => {
  const a = af.buildDecodeArgs("mp3", "in.wma", "out.mp3");
  assert.deepStrictEqual(a, ["-i", "in.wma", "-vn", "-map_metadata", "0", "-c:a", "libmp3lame", "-b:a", "192k", "out.mp3"]);
});
check("buildDecodeArgs flac/wav use lossless codecs", () => {
  assert.ok(af.buildDecodeArgs("flac", "x", "y").includes("flac"));
  assert.ok(af.buildDecodeArgs("wav", "x", "y").includes("pcm_s16le"));
});
check("DECODER_TARGETS has exactly mp3/wav/flac", () => {
  assert.deepStrictEqual(af.DECODER_TARGETS.map((t) => t.id), ["mp3", "wav", "flac"]);
});
check("buildAlacArgs to-alac uses alac encoder; aac bitrate 256k", () => {
  assert.deepStrictEqual(af.buildAlacArgs("alac", "in.wav", "out.m4a"), ["-i", "in.wav", "-vn", "-c:a", "alac", "out.m4a"]);
  const a = af.buildAlacArgs("aac", "in", "out");
  assert.ok(a.includes("aac") && a.includes("256k"));
});
check("buildAlacArgs mp3 falls back to lame", () => {
  assert.ok(af.buildAlacArgs("mp3", "in", "out").includes("libmp3lame"));
});
check("ALAC_TARGETS ids", () => {
  assert.deepStrictEqual(af.ALAC_TARGETS.map((t) => t.id), ["alac", "wav", "flac", "aac", "mp3"]);
});
check("targetExtension: alac/aac -> m4a, others identity", () => {
  assert.strictEqual(af.targetExtension("alac"), "m4a");
  assert.strictEqual(af.targetExtension("aac"), "m4a");
  assert.strictEqual(af.targetExtension("wav"), "wav");
  assert.strictEqual(af.targetExtension("mp3"), "mp3");
  assert.strictEqual(af.targetExtension("flac"), "flac");
});
// sanity: sliceByDuration from edit.ts still Node-verified for the Splitter (spot-check re-export stability)
console.log(passed + " checks passed");
if (process.exitCode) process.exit(1);
