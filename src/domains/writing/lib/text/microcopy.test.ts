import { test } from "node:test";
import assert from "node:assert/strict";
import { MICROCOPY_JARGON, MICROCOPY_TONES, buildMicrocopy } from "./microcopy.ts";

test("the registers and the jargon list are fixed", () => {
  assert.deepEqual(
    MICROCOPY_TONES.map((tone) => tone.id),
    ["neutral", "friendly", "formal"],
  );
  assert.ok(MICROCOPY_JARGON.includes("leverage"));
  assert.ok(MICROCOPY_JARGON.includes("in order to"));
});

test("the twelve slots are drafted in the friendly register", () => {
  const set = buildMicrocopy({ product: "Meridian", action: "create a report", object: "report", tone: "friendly" });
  assert.equal(set.slots.length, 12);
  assert.deepEqual(
    set.slots.map((slot) => slot.id),
    [
      "primary",
      "secondary",
      "label",
      "helper",
      "empty-title",
      "empty-body",
      "loading",
      "error",
      "success",
      "destructive",
      "link",
      "permission",
    ],
  );
  assert.equal(set.slots.find((slot) => slot.id === "primary")?.text, "Create a report");
  assert.equal(set.slots.find((slot) => slot.id === "empty-title")?.text, "Nothing here yet");
  assert.equal(
    set.slots.find((slot) => slot.id === "error")?.text,
    "We couldn't create a report. Check your connection and give it another go.",
  );
  assert.equal(set.slots.find((slot) => slot.id === "success")?.text, "Report created — nice work.");
  assert.deepEqual(set.checks, []);
});

test("the neutral register is clean too", () => {
  const set = buildMicrocopy({ product: "Meridian", action: "create a report", object: "report", tone: "neutral" });
  assert.deepEqual(set.checks, []);
  assert.equal(set.slots.find((slot) => slot.id === "empty-title")?.text, "No reports yet");
  assert.equal(set.slots.find((slot) => slot.id === "destructive")?.text, "Delete this report? This cannot be undone.");
});

test("jargon, an exclamation mark and a missing product are named", () => {
  const set = buildMicrocopy({ action: "utilize the system!", object: "thing", tone: "formal" });
  assert.deepEqual(set.checks, [
    "Jargon detected (utilize); interface copy is read at a glance and jargon costs that glance.",
    "An exclamation mark appears in the copy; in a confirmation it is noisy, and in an error it is tone-deaf.",
    "No product name; the permission prompt and error copy are less specific without it.",
  ]);
});

test("a long button label and blaming wording are flagged", () => {
  const set = buildMicrocopy({
    product: "Meridian",
    action: "create a new report from scratch",
    object: "report",
    tone: "neutral",
  });
  assert.ok(set.checks.some((check) => check.startsWith("1 button label past four words")));

  const blaming = buildMicrocopy({ product: "Meridian", action: "enter invalid data", object: "record", tone: "neutral" });
  assert.ok(blaming.checks.some((check) => check === "The word invalid appears in your wording; it tells the reader they are wrong rather than what the form needs."));
});

test("an empty call asks for the action", () => {
  const set = buildMicrocopy({});
  assert.ok(set.checks.includes("No action given; every slot here is written around what the reader is trying to do."));
  assert.equal(set.slots.length, 12);
});
