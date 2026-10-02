import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTaglines } from "./tagline.ts";

test("buildTaglines composes the five patterns from the parts", () => {
  const draft = buildTaglines({ brand: "Northwind", benefit: "a calmer inbox", audience: "support teams" });
  assert.deepEqual(draft.taglines, [
    "Northwind. A calmer inbox.",
    "Northwind — a calmer inbox.",
    "For support teams who want a calmer inbox: Northwind.",
    "Northwind helps support teams a calmer inbox.",
    "A calmer inbox. For support teams. By Northwind.",
  ]);
  assert.deepEqual(draft.checks, []);
});

test("buildTaglines drops the audience patterns when there is no audience", () => {
  const draft = buildTaglines({ brand: "Northwind", benefit: "a calmer inbox", audience: "" });
  assert.equal(draft.taglines.length, 2);
  assert.ok(draft.checks.some((check) => check.id === "audience"));
});

test("buildTaglines asks for the brand and the benefit", () => {
  const draft = buildTaglines({ brand: "", benefit: "", audience: "" });
  assert.deepEqual(draft.taglines, []);
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), ["audience", "benefit", "brand"]);
});

test("buildTaglines flags two benefits and a first-person benefit", () => {
  const two = buildTaglines({ brand: "Northwind", benefit: "a calmer inbox and fewer tickets", audience: "teams" });
  assert.ok(two.checks.some((check) => check.id === "two-benefits"));
  const first = buildTaglines({ brand: "Northwind", benefit: "we keep your inbox calm", audience: "teams" });
  assert.ok(first.checks.some((check) => check.id === "first-person"));
});

test("buildTaglines flags a tagline that needs a second breath", () => {
  const benefit = Array.from({ length: 12 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildTaglines({ brand: "Northwind", benefit, audience: "teams" });
  assert.ok(draft.checks.some((check) => check.id === "long" && check.message.includes("word1")));
});
