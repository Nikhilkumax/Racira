import { test } from "node:test";
import assert from "node:assert/strict";
import { beatProgress, beatReport, beatRows } from "./story-beats.ts";

test("beatRows flags the beats marked done, in structure order", () => {
  const rows = beatRows("three-act", ["Hook", "Inciting incident"]);
  assert.equal(rows.length, 7);
  assert.equal(rows[0].done, true);
  assert.equal(rows[1].done, true);
  assert.equal(rows[2].done, false);
  assert.equal(rows[0].at, 0);
});

test("beatProgress points at the next undrafted beat", () => {
  const progress = beatProgress(beatRows("three-act", ["Hook", "Inciting incident"]));
  assert.equal(progress.done, 2);
  assert.equal(progress.total, 7);
  assert.equal(progress.percent, 29);
  assert.equal(progress.next?.name, "First plot point");
});

test("beatReport marks drafted beats and names the next one", () => {
  const report = beatReport("save-the-cat", ["Opening image"]);
  assert.ok(report.includes("1/15 beats drafted"));
  assert.ok(report.includes("[x] Opening image"));
  assert.ok(report.includes("[ ] Theme stated"));
  assert.ok(report.includes("Next: Theme stated"));
});
