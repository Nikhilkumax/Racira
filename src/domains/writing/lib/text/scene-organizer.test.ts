import { test } from "node:test";
import assert from "node:assert/strict";
import { parseScenes, parseScenesJson, sceneStats, scenesToMarkdown, serializeScenes } from "./scene-organizer.ts";

const SOURCE = [
  "The pier | Mara | Harbour | 1200",
  "The letter | Mara | Kitchen | 800",
  "The chase | Dev | Rooftops | 2000",
  "The return | Mara | Harbour",
].join("\n");

test("parseScenes reads title, POV, setting and an optional word count", () => {
  const scenes = parseScenes(SOURCE);
  assert.equal(scenes.length, 4);
  assert.deepEqual(scenes[0], { title: "The pier", pov: "Mara", setting: "Harbour", words: 1200 });
  assert.equal(scenes[3].title, "The return");
  assert.equal(scenes[3].words, undefined);
});

test("sceneStats totals words, tallies POVs and finds the outliers", () => {
  const stats = sceneStats(parseScenes(SOURCE));
  assert.equal(stats.scenes, 4);
  assert.equal(stats.words, 4000);
  assert.equal(stats.averageWords, 1000);
  assert.equal(stats.medianWords, 800);
  assert.equal(stats.settings, 3);

  const mara = stats.povs.find((pov) => pov.name === "Mara");
  assert.deepEqual(mara, { name: "Mara", scenes: 3, words: 2000 });
  assert.deepEqual(stats.longest, { title: "The chase", words: 2000 });
  assert.deepEqual(stats.shortest, { title: "The return", words: 0 });
});

test("scenesToMarkdown gives each scene a numbered heading", () => {
  const markdown = scenesToMarkdown(parseScenes(SOURCE));
  assert.ok(markdown.includes("## 1. The pier"));
  assert.ok(markdown.includes("POV: Mara · Setting: Harbour · 1200 words"));
});

test("the scene list round-trips through JSON", () => {
  const scenes = parseScenes(SOURCE);
  const parsed = parseScenesJson(serializeScenes(scenes));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(serializeScenes(parsed.scenes), serializeScenes(scenes));
});

test("parseScenesJson rejects malformed input with a reason", () => {
  assert.equal(parseScenesJson("").ok, false);
  assert.equal(parseScenesJson("{oops").ok, false);
  assert.equal(parseScenesJson('{"title":"x"}').ok, false);
  const noTitle = parseScenesJson('[{"pov":"Mara"}]');
  assert.equal(noTitle.ok, false);
  if (!noTitle.ok) assert.ok(noTitle.error.includes("no title"));
});
