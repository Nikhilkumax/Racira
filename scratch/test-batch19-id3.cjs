/**
 * Batch 19 (id3 supplement) Node verification — stripId3Tag.
 * Recompile: npx tsc src/domains/audio/lib/id3.ts --outDir scratch/.batch19 --module commonjs --target es2020 --skipLibCheck
 */
const assert = require("assert");
const id3 = require("./.batch19/id3.js");

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

const AUDIO = new Uint8Array([0xff, 0xfb, 0x90, 0x00, 1, 2, 3, 4, 5, 6, 7, 8]);

check("strip: removes a written tag, keeps the audio payload byte-exact", () => {
  const tagged = id3.replaceId3Tag(AUDIO, { version: 3, title: "T", artist: "A" });
  assert.ok(tagged.length > AUDIO.length);
  const stripped = id3.stripId3Tag(tagged);
  assert.strictEqual(stripped.length, AUDIO.length);
  for (let i = 0; i < AUDIO.length; i++) assert.strictEqual(stripped[i], AUDIO[i]);
});
check("strip: file without a tag comes back unchanged", () => {
  const out = id3.stripId3Tag(AUDIO);
  assert.strictEqual(out.length, AUDIO.length);
  for (let i = 0; i < AUDIO.length; i++) assert.strictEqual(out[i], AUDIO[i]);
});
check("strip result re-reads as no tag", () => {
  const tagged = id3.replaceId3Tag(AUDIO, { version: 3, title: "Hello" });
  const stripped = id3.stripId3Tag(tagged);
  assert.strictEqual(id3.readId3(stripped), null);
});

console.log(`\nbatch19-id3: ${passed} checks passed${process.exitCode ? " (with failures)" : ""}`);
