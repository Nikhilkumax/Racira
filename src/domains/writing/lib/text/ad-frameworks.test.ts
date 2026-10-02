import { test } from "node:test";
import assert from "node:assert/strict";
import { AD_FRAMEWORKS, buildAdFramework } from "./ad-frameworks.ts";

const FULL = {
  product: "Northwind",
  audience: "support teams",
  problem: "tickets pile up overnight",
  agitate: "every hour of delay costs a renewal",
  benefit: "start the day with an empty queue",
  proof: "customers cut response time 40% in a month",
};

test("AD_FRAMEWORKS documents the three structures", () => {
  assert.deepEqual(AD_FRAMEWORKS.map((framework) => framework.id), ["aida", "pas", "bab"]);
  assert.equal(AD_FRAMEWORKS[1].slots.length, 3);
});

test("buildAdFramework assembles the PAS draft", () => {
  const draft = buildAdFramework("pas", FULL);
  assert.equal(
    draft.draft,
    "Problem: Tickets pile up overnight.\nAgitate: Every hour of delay costs a renewal.\nSolution: Northwind helps support teams start the day with an empty queue. Customers cut response time 40% in a month. Get Northwind.",
  );
  assert.equal(draft.words, 35);
  assert.deepEqual(draft.checks, []);
});

test("buildAdFramework assembles the AIDA and BAB drafts from the same fields", () => {
  const aida = buildAdFramework("aida", FULL);
  assert.ok(aida.draft.startsWith("Attention: Tickets pile up overnight."));
  assert.ok(aida.draft.includes("Interest: Northwind is built for support teams."));
  assert.ok(aida.draft.endsWith("Action: Get Northwind."));
  const bab = buildAdFramework("bab", FULL);
  assert.ok(bab.draft.includes("Before: Tickets pile up overnight."));
  assert.ok(bab.draft.includes("After: Start the day with an empty queue."));
  assert.ok(bab.draft.includes("Bridge: Northwind gets support teams there."));
});

test("buildAdFramework names every slot the framework is missing", () => {
  const draft = buildAdFramework("pas", {
    product: "Northwind",
    audience: "",
    problem: "tickets pile up overnight",
    agitate: "",
    benefit: "",
    proof: "",
  });
  assert.deepEqual(draft.checks.map((check) => check.id), [
    "missing-audience",
    "missing-agitate",
    "missing-benefit",
    "missing-proof",
  ]);
});

test("buildAdFramework flags a draft that outgrew an ad", () => {
  const long = Array.from({ length: 130 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildAdFramework("bab", { ...FULL, benefit: long });
  assert.ok(draft.checks.some((check) => check.id === "long"));
});
