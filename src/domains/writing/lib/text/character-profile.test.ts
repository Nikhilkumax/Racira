import { test } from "node:test";
import assert from "node:assert/strict";
import { profileChecks, profileCompleteness, profileMarkdown, profileReport } from "./character-profile.ts";

test("profileCompleteness counts the answered prompts", () => {
  const result = profileCompleteness({ name: "Mara", role: "protagonist", want: "to leave", need: "to forgive", flaw: "pride" });
  assert.equal(result.filled, 4);
  assert.equal(result.total, 10);
  assert.equal(result.percent, 40);
  assert.ok(result.missing.includes("Arc"));
});

test("profileChecks flags a want that is really the need", () => {
  const checks = profileChecks({ name: "Mara", want: "control", need: "Control" });
  assert.ok(checks.some((check) => check.includes("worded identically")));
  assert.ok(checks.some((check) => check.includes("No flaw named")));
  assert.ok(checks.some((check) => check.includes("No arc named")));
});

test("profileChecks is quiet about a complete profile", () => {
  const checks = profileChecks({
    name: "Mara",
    want: "to leave the harbour",
    need: "to forgive her father",
    flaw: "pride",
    strength: "steady nerves",
    arc: "learns that leaving is not the same as escaping",
  });
  assert.deepEqual(checks, []);
});

test("profileMarkdown and profileReport render the sheet", () => {
  const profile = { name: "Mara", role: "protagonist", want: "to leave" };
  assert.ok(profileMarkdown(profile).includes("# Mara"));
  assert.ok(profileMarkdown(profile).includes("## Want"));
  assert.ok(profileMarkdown(profile).includes("to leave"));
  assert.ok(profileReport(profile).includes("2/10 prompts answered"));
});
