import { test } from "node:test";
import assert from "node:assert/strict";
import { BLEND_GENRES, blendGenres } from "./genre-blender.ts";

test("two different genres produce the five fixed scaffold templates", () => {
  const blend = blendGenres({ first: "fantasy", second: "science-fiction", element: "a ledger written in two hands" });
  assert.deepEqual(blend.checks, []);
  assert.deepEqual(
    blend.ideas.map((idea) => idea.label),
    ["Collision", "Deadline", "Inversion", "Cost", "Frame"],
  );
  assert.equal(blend.ideas[0].text.includes("a ledger written in two hands"), true);
  assert.match(blend.ideas[0].text, /A fantasy story opens on a map that redraws itself; a science fiction story opens on a ship running past its rated life\./);
  assert.match(blend.output, /^Collision\nA fantasy story/);
});

test("without a required element the blend names the genre's own missing piece", () => {
  const blend = blendGenres({ first: "fantasy", second: "science-fiction" });
  assert.equal(blend.ideas.length, 5);
  assert.match(blend.ideas[0].text, /the fantasy element that refuses to fit is why nobody agrees what it is/);
  assert.ok(blend.checks.some((check) => check.startsWith("No required element;")));
});

test("the same genre twice is not a blend", () => {
  const blend = blendGenres({ first: "noir", second: "noir" });
  assert.deepEqual(blend.ideas, []);
  assert.ok(blend.checks.includes("Noir with Noir is the same genre twice; the collision needs two sets of expectations."));
});

test("one missing genre names both and generates nothing", () => {
  const blend = blendGenres({ first: "horror" });
  assert.equal(blend.first?.name, "Horror");
  assert.equal(blend.second, null);
  assert.deepEqual(blend.ideas, []);
  assert.ok(blend.checks.includes("Pick both genres; the blend is the collision between them."));
});

test("the required element is woven through the scaffolds", () => {
  const blend = blendGenres({ first: "horror", second: "romance", element: "a shared recording" });
  const frame = blend.ideas.find((idea) => idea.id === "frame");
  assert.ok(frame);
  assert.match(frame.text, /a shared recording is what the frame was built to hide\./);
  assert.match(blend.ideas[3].text, /a shared recording is the compromise; it satisfies no one\./);
});

test("every genre carries elements and conventions", () => {
  assert.equal(BLEND_GENRES.length, 10);
  for (const genre of BLEND_GENRES) {
    assert.equal(genre.elements.length, 3, genre.id);
    assert.equal(genre.conventions.length, 3, genre.id);
  }
  assert.equal(new Set(BLEND_GENRES.map((genre) => genre.id)).size, 10);
});
