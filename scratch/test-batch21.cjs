/**
 * Batch 21 Node verification — pure functions added to edit.ts:
 *   trimToSpan / cutSpans / sliceEqualSegments / sliceByDuration /
 *   concatChannels / mixChannels
 * Recompile: npx tsc src/domains/audio/lib/edit.ts --outDir scratch/.batch21 --module commonjs --target es2020 --skipLibCheck --lib es2020,dom
 */
const assert = require("assert");
const e = require("./.batch21/edit.js");

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err) {
    failed++;
    console.error(`FAIL  ${name}: ${err.message}`);
  }
}
let failed = 0;

// ---------- trimToSpan ----------
check("trim keeps [start,end)", () => {
  const ch = [new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])];
  const r = e.trimToSpan(ch, 10, 0.2, 0.5); // samples 2..5
  assert.strictEqual(r.length, 3);
  assert.deepStrictEqual([...r.channels[0]], [2, 3, 4]);
});
check("trim null end = to the end", () => {
  const ch = [new Float32Array([0, 1, 2, 3, 4])];
  const r = e.trimToSpan(ch, 10, 0.3, null);
  assert.strictEqual(r.length, 2);
  assert.deepStrictEqual([...r.channels[0]], [3, 4]);
});
check("trim clamps out-of-range times", () => {
  const ch = [new Float32Array([1, 2, 3])];
  const r = e.trimToSpan(ch, 10, -5, 99);
  assert.strictEqual(r.length, 3);
});
check("trim does not mutate input", () => {
  const ch = [new Float32Array([0, 1, 2, 3, 4])];
  e.trimToSpan(ch, 10, 0.1, 0.3);
  assert.deepStrictEqual([...ch[0]], [0, 1, 2, 3, 4]);
});

// ---------- cutSpans ----------
check("cut removes a single span", () => {
  const ch = [new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])];
  const r = e.cutSpans(ch, 10, [{ start: 0.2, end: 0.5 }]); // remove 2,3,4
  assert.strictEqual(r.length, 7);
  assert.strictEqual(r.removed, 3);
  assert.deepStrictEqual([...r.channels[0]], [0, 1, 5, 6, 7, 8, 9]);
});
check("cut merges overlapping spans", () => {
  const ch = [new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])];
  const r = e.cutSpans(ch, 10, [
    { start: 0.1, end: 0.4 },
    { start: 0.3, end: 0.6 },
  ]);
  assert.strictEqual(r.removed, 5); // 1..5 merged
  assert.deepStrictEqual([...r.channels[0]], [0, 6, 7, 8, 9]);
});
check("cut handles unsorted + reversed spans", () => {
  const ch = [new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])];
  const r = e.cutSpans(ch, 10, [
    { start: 0.8, end: 0.9 },
    { start: 0.5, end: 0.4 },
  ]);
  assert.strictEqual(r.removed, 2);
  assert.deepStrictEqual([...r.channels[0]], [0, 1, 2, 3, 5, 6, 7, 9]);
});
check("cut stereo independently", () => {
  const l = new Float32Array([1, 1, 1, 1]);
  const rr = new Float32Array([2, 2, 2, 2]);
  const r = e.cutSpans([l, rr], 10, [{ start: 0.1, end: 0.3 }]);
  assert.strictEqual(r.length, 2);
  assert.deepStrictEqual([...r.channels[0]], [1, 1]);
  assert.deepStrictEqual([...r.channels[1]], [2, 2]);
});

// ---------- slicing ----------
check("equal segments distribute remainder", () => {
  const segs = e.sliceEqualSegments(10, 3);
  assert.deepStrictEqual(segs, [
    { start: 0, end: 4 },
    { start: 4, end: 7 },
    { start: 7, end: 10 },
  ]);
});
check("equal segments n=1", () => {
  assert.deepStrictEqual(e.sliceEqualSegments(5, 1), [{ start: 0, end: 5 }]);
});
check("duration slicing has short tail", () => {
  const segs = e.sliceByDuration(25, 10, 1.0); // 2.5 s at 10 Hz
  assert.strictEqual(segs.length, 3);
  assert.deepStrictEqual(segs[2], { start: 20, end: 25 });
});
check("duration slicing guards zero segment", () => {
  assert.deepStrictEqual(e.sliceByDuration(0, 10, 1), []);
});

// ---------- concatChannels ----------
check("concat joins mono sets", () => {
  const r = e.concatChannels([
    { channels: [new Float32Array([1, 2])], length: 2 },
    { channels: [new Float32Array([3])], length: 1 },
  ]);
  assert.strictEqual(r.length, 3);
  assert.deepStrictEqual([...r.channels[0]], [1, 2, 3]);
});
check("concat pads mono into stereo", () => {
  const r = e.concatChannels([
    { channels: [new Float32Array([1, 2]), new Float32Array([9, 9])], length: 2 },
    { channels: [new Float32Array([3])], length: 1 },
  ]);
  assert.strictEqual(r.length, 3);
  assert.deepStrictEqual([...r.channels[0]], [1, 2, 3]);
  assert.deepStrictEqual([...r.channels[1]], [9, 9, 0]);
});

// ---------- mixChannels ----------
check("mix sums with 1/n gain", () => {
  const r = e.mixChannels([
    { channels: [new Float32Array([1, 1])], length: 2 },
    { channels: [new Float32Array([1, -1])], length: 2 },
  ]);
  assert.deepStrictEqual([...r.channels[0]].map((v) => +v.toFixed(6)), [1, 0]);
});
check("mix pads unequal lengths", () => {
  const r = e.mixChannels([
    { channels: [new Float32Array([1, 1, 1])], length: 3 },
    { channels: [new Float32Array([1])], length: 1 },
  ]);
  assert.strictEqual(r.length, 3);
  const expected = [(1 + 1) / 2, 0.5, 0.5];
  assert.deepStrictEqual(
    [...r.channels[0]].map((v) => +v.toFixed(6)),
    expected,
  );
});
check("mix stereo keeps separation", () => {
  const r = e.mixChannels([
    { channels: [new Float32Array([1]), new Float32Array([0])], length: 1 },
    { channels: [new Float32Array([0]), new Float32Array([1])], length: 1 },
  ]);
  assert.deepStrictEqual([...r.channels[0]].map((v) => +v.toFixed(6)), [0.5]);
  assert.deepStrictEqual([...r.channels[1]].map((v) => +v.toFixed(6)), [0.5]);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
