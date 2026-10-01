import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDescription, descriptionReport, filterWords } from "./scene-description.ts";

test("buildDescription composes the filled fields and names the gaps", () => {
  const result = buildDescription({ place: "the harbour", time: "dawn", light: "grey", mood: "uneasy" });
  assert.equal(result.filled, 4);
  assert.equal(result.total, 8);
  assert.equal(result.coverage, 50);
  assert.ok(result.text.startsWith("Place: the harbour"));
  assert.deepEqual(result.missing, ["Weather", "Sound", "Smell", "Texture"]);
});

test("filterWords counts the perception verbs", () => {
  const hits = filterWords("She saw the door and heard a noise, then felt cold.");
  assert.deepEqual(hits, [
    { word: "felt", count: 1 },
    { word: "heard", count: 1 },
    { word: "saw", count: 1 },
  ]);
  assert.deepEqual(filterWords("The door opened."), []);
});

test("descriptionReport combines the sheet and the filter-word check", () => {
  const report = descriptionReport({ place: "the pier" }, "I saw the boat leave.");
  assert.ok(report.includes("1/8 fields filled"));
  assert.ok(report.includes("Place: the pier"));
  assert.ok(report.includes("saw ×1"));
});
