import { test } from "node:test";
import assert from "node:assert/strict";
import { DEBATE_FORMATS, formatDebateScript } from "./debate-script.ts";

test("DEBATE_FORMATS lists the four orders with their slot counts", () => {
  assert.deepEqual(DEBATE_FORMATS.map((format) => format.id), ["bp", "asian", "public-forum", "lincoln-douglas"]);
  assert.deepEqual(DEBATE_FORMATS.map((format) => format.slots.length), [8, 6, 6, 6]);
});

test("a partial BP script is placed in order and its empty slots are named", () => {
  const script = formatDebateScript(
    [
      "PM | Zoning reform is the fastest route to affordable housing.",
      "LO | Rent controls protect sitting tenants from displacement.",
      "DPM | New supply takes a decade to reach the renters who need it.",
    ].join("\n"),
    "bp",
  );

  assert.equal(script.formatLabel, "British Parliamentary");
  assert.equal(script.totalMinutes, 56);
  assert.deepEqual(script.speeches.filter((speech) => speech.filled).map((speech) => speech.id), [
    "pm",
    "lo",
    "dpm",
  ]);
  assert.equal(script.script.startsWith("1. Prime Minister (7:00, pro)"), true);
  assert.deepEqual(script.checks, [
    "2 pro slots are empty.",
    "3 con slots are empty.",
    "The con side has no rebuttal speech drafted; a side that only repeats its case loses the exchange.",
    "3 cases are under fifteen words (Prime Minister, Leader of Opposition, Deputy Prime Minister): a placeholder, not a case.",
  ]);
});

test("a full BP script passes with no checks", () => {
  const filler = Array.from({ length: 16 }, (_, index) => `word${index + 1}`).join(" ");
  const lines = ["pm", "lo", "dpm", "dlo", "mg", "mo", "gw", "ow"].map((role) => `${role} | ${filler}`);
  const script = formatDebateScript(lines.join("\n"), "bp");
  assert.equal(script.speeches.every((speech) => speech.filled), true);
  assert.deepEqual(script.checks, []);
});

test("full role names and aliases land on the same slot", () => {
  const script = formatDebateScript(
    ["Prime Minister | case one", "OG2 | case two", "opposition 1 | case three"].join("\n"),
    "bp",
  );
  assert.deepEqual(script.speeches.filter((speech) => speech.filled).map((speech) => speech.id), [
    "pm",
    "lo",
    "dpm",
  ]);
  assert.deepEqual(script.extra, []);
});

test("duplicate and unrecognised roles are surfaced as checks", () => {
  const script = formatDebateScript(["PM | first case", "Prime Minister | second case", "Treasurer | a case"].join("\n"), "bp");
  assert.ok(script.checks.some((check) => check === "Two lines both match Prime Minister; merge them into one case before debating."));
  assert.ok(script.checks.some((check) => check === "“Treasurer” matches no role in British Parliamentary."));
});

test("public forum asks for the crossfire questions", () => {
  const script = formatDebateScript(
    ["a1 | case for the affirmative side with sixteen words in it now ok.", "b1 | case for the negative side with sixteen words in it now ok."].join("\n"),
    "public-forum",
  );
  assert.equal(script.formatLabel, "Public Forum");
  assert.ok(script.checks.some((check) => check.includes("Crossfire slots are empty")));
});

test("an empty script asks for lines", () => {
  const script = formatDebateScript("", "bp");
  assert.equal(
    script.checks[0],
    "The pro side has no case drafted at all; every format needs both sides before it can be formatted.",
  );
  assert.ok(
    script.checks.includes(
      "The con side has no case drafted at all; every format needs both sides before it can be formatted.",
    ),
  );
  assert.ok(
    script.checks.includes(
      "The pro side has no rebuttal speech drafted; a side that only repeats its case loses the exchange.",
    ),
  );
  assert.ok(script.checks.includes("Paste one line per speech as role | what the speech establishes."));
});
