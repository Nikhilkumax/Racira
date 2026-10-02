import { test } from "node:test";
import assert from "node:assert/strict";
import { TONES, buildFirstLines, checkOpeningLine } from "./first-line.ts";

test("TONES lists the four registers", () => {
  assert.deepEqual(TONES.map((tone) => tone.id), ["quiet", "strange", "dangerous", "warm"]);
});

test("buildFirstLines composes four lines from the character, place and tone", () => {
  const draft = buildFirstLines({ character: "Mara", place: "Vess", tone: "quiet" });
  assert.equal(draft.lines.length, 4);
  assert.deepEqual(draft.checks, []);
  assert.equal(draft.lines[0], "Mara arrived in Vess with a suitcase and no reason anyone believed.");
  assert.equal(draft.lines[2], "The first rule of Vess was not to ask. Mara asked.");
  const strange = buildFirstLines({ character: "Mara", place: "Vess", tone: "strange" });
  assert.equal(strange.lines[0], "The morning Mara arrived, Vess had one street fewer than the map showed.");
});

test("buildFirstLines asks for the character and the place", () => {
  const draft = buildFirstLines({ character: "", place: "", tone: "quiet" });
  assert.deepEqual(draft.lines, []);
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), ["character", "place"]);
});

test("an unknown tone falls back to quiet", () => {
  const draft = buildFirstLines({ character: "Mara", place: "Vess", tone: "nope" });
  assert.deepEqual(draft.lines, buildFirstLines({ character: "Mara", place: "Vess", tone: "quiet" }).lines);
});

test("checkOpeningLine names the borrowed moves", () => {
  assert.deepEqual(checkOpeningLine("It was a dark and stormy night.").map((flag) => flag.id), ["weather"]);
  assert.deepEqual(checkOpeningLine("There was a house at the end of the road.").map((flag) => flag.id), ["there-was"]);
  const once = checkOpeningLine("Once upon a time, a girl kept a suitcase packed.");
  assert.deepEqual(once.map((flag) => flag.id), ["once"]);
  assert.deepEqual(checkOpeningLine(""), []);
});

test("checkOpeningLine flags an opener that ran long", () => {
  const long = Array.from({ length: 31 }, (_, index) => `word${index + 1}`).join(" ");
  assert.ok(checkOpeningLine(long).some((flag) => flag.id === "long"));
});
