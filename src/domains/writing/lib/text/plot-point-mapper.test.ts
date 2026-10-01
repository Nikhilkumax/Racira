import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlotMap, parsePlotNotes, plotMapMarkdown, structureOptions } from "./plot-point-mapper.ts";

test("buildPlotMap reports coverage and the next open beat", () => {
  const map = buildPlotMap("three-act", { Hook: "Mara on the pier", "Inciting incident": "The letter arrives" });
  assert.equal(map.total, 7);
  assert.equal(map.filled, 2);
  assert.equal(map.coverage, 29);
  assert.equal(map.nextOpen?.name, "First plot point");
  assert.equal(map.points[0].filled, true);
  assert.equal(map.points[2].filled, false);
});

test("parsePlotNotes reads `Beat name: note` lines", () => {
  const notes = parsePlotNotes("Hook: Mara on the pier\nMidpoint");
  assert.deepEqual(notes, { Hook: "Mara on the pier", Midpoint: "" });
});

test("plotMapMarkdown writes every beat with its note or the default summary", () => {
  const markdown = plotMapMarkdown(buildPlotMap("three-act", { Hook: "Mara on the pier" }));
  assert.ok(markdown.includes("## Hook (0%)"));
  assert.ok(markdown.includes("Mara on the pier"));
  assert.ok(markdown.includes("Something happens that the character cannot ignore."));
  assert.ok(markdown.includes("1 of 7 beats mapped (14%)"));
});

test("structureOptions lists every structure for the picker", () => {
  const options = structureOptions();
  assert.equal(options.length, 4);
  assert.equal(options.find((option) => option.id === "save-the-cat")?.beats, 15);
});
