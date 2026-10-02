import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DUPLICATE_THRESHOLD,
  HEDGE_PHRASES,
  REDUNDANT_PAIRS,
  compressParagraph,
} from "./paragraph-compressor.ts";

const SAMPLE =
  "It is worth noting that advance planning is absolutely essential for the launch. It is worth noting that advance planning is absolutely essential for the launch. In order to utilise the new system we must make a decision, and the team will provide assistance to everyone at this point in time. The basic fundamentals of the plan are that the end result should be a brief summary of the future plans for the roadmap, which is the plan for the future work that the team intends to do in the coming period.";

test("the hedge and redundancy tables are published", () => {
  assert.ok(HEDGE_PHRASES.some((entry) => entry.phrase === "it is worth noting that"));
  assert.ok(REDUNDANT_PAIRS.some((entry) => entry.phrase === "advance planning" && entry.replacement === "planning"));
  assert.equal(DUPLICATE_THRESHOLD, 0.6);
});

test("compressParagraph applies the four cuts and reports the counts", () => {
  const report = compressParagraph(SAMPLE);
  assert.equal(report.beforeWords, 92);
  assert.equal(report.afterWords, 58);
  assert.equal(report.reduction, 37);
  assert.equal(report.dropped.length, 1);
  assert.equal(report.dropped[0].overlap, 1);
  assert.deepEqual(report.checks, ["1 sentence dropped as a repeat of an earlier one."]);
  assert.equal(
    report.output,
    "Planning is essential for the launch. To use the new system we must decide, and the team will help everyone now. The fundamentals of the plan are that the result should be a summary of the plans for the roadmap, which is the plan for the future work that the team intends to do in the coming period.",
  );
});

test("every change carries its kind and its replacement", () => {
  const report = compressParagraph(SAMPLE);
  const kinds = new Set(report.changes.map((change) => change.id));
  assert.deepEqual([...kinds].sort(), ["hedge", "redundant", "wordy"]);
  const hedge = report.changes.find((change) => change.from === "It is worth noting that");
  assert.equal(hedge?.to, "");
  const redundant = report.changes.find((change) => change.from === "basic fundamentals");
  assert.equal(redundant?.to, "fundamentals");
});

test("a paragraph with no known filler reports zero reduction", () => {
  const report = compressParagraph("The bridge opened in 1897. It carries two lanes of traffic.");
  assert.equal(report.reduction, 0);
  assert.equal(report.dropped.length, 0);
  assert.equal(report.changes.length, 0);
  assert.match(report.checks[0], /already carrying no filler/);
});

test("empty input is reported rather than crashed on", () => {
  const report = compressParagraph("");
  assert.equal(report.beforeWords, 0);
  assert.equal(report.reduction, 0);
  assert.deepEqual(report.changes, []);
  assert.equal(report.checks[0], "Paste a paragraph to compress.");
});
