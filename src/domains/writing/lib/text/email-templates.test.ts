import { test } from "node:test";
import assert from "node:assert/strict";
import { EMAIL_SCENARIOS, buildEmailTemplate, emailScenarioOptions } from "./email-templates.ts";

test("EMAIL_SCENARIOS covers the six common business emails", () => {
  assert.deepEqual(
    EMAIL_SCENARIOS.map((scenario) => scenario.id).sort(),
    ["apology", "follow-up", "introduction", "reminder", "request", "thank-you"],
  );
  assert.equal(emailScenarioOptions().length, 6);
});

test("buildEmailTemplate fills every placeholder and builds the text", () => {
  const draft = buildEmailTemplate("follow-up", {
    name: "Priya",
    topic: "the launch",
    date: "Tuesday",
    note: "the deck is attached",
    deadline: "Friday",
    sender: "Ada",
  });
  assert.equal(draft.words, 37);
  assert.deepEqual(draft.placeholders, []);
  assert.deepEqual(draft.checks, []);
  assert.equal(draft.subject, "Following up on the launch");
  assert.ok(draft.text.startsWith("Subject: Following up on the launch\n\nHi Priya,"));
  assert.ok(draft.text.includes("Thanks again for your time on Tuesday."));
  assert.ok(draft.text.includes("I wanted to follow up on the launch — the deck is attached"));
  assert.ok(draft.text.includes("Could you let me know by Friday?"));
  assert.ok(draft.text.endsWith("Best,\nAda"));
});

test("buildEmailTemplate lists the placeholders left unfilled, in order", () => {
  const draft = buildEmailTemplate("follow-up");
  assert.deepEqual(draft.placeholders, ["topic", "name", "date", "note", "deadline", "sender"]);
  assert.deepEqual(draft.checks.map((check) => check.id), ["placeholders"]);
  assert.ok(draft.checks[0].message.includes("[topic], [name], [date], [note], [deadline], [sender]"));
  assert.ok(draft.text.includes("Hi [name],"));
});

test("buildEmailTemplate falls back to the first scenario for an unknown id", () => {
  const draft = buildEmailTemplate("nonexistent", { sender: "Ada" });
  assert.ok(draft.subject.startsWith("Following up on"));
});

test("buildEmailTemplate warns when the note turns the email into an essay", () => {
  const note = Array.from({ length: 200 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildEmailTemplate("follow-up", {
    name: "Priya",
    topic: "the launch",
    date: "Tuesday",
    note,
    deadline: "Friday",
    sender: "Ada",
  });
  assert.ok(draft.checks.some((check) => check.id === "long"));
});
