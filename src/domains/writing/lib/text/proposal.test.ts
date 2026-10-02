import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProposal } from "./proposal.ts";

const FULL = {
  title: "Support desk audit",
  client: "Acme Analytics",
  problem: "First-response time doubled in six months.",
  approach: ["Interview the four agents", "Shadow a week of tickets", "Ship a triage script"],
  deliverables: ["A ticket-flow report", "A triage script", "A two-hour training session"],
  timeline: "Three weeks, starting 6 April",
  price: "$4,800 fixed",
};

test("buildProposal assembles every section in order", () => {
  const draft = buildProposal(FULL);
  assert.equal(draft.words, 52);
  assert.equal(draft.deliverables.length, 3);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.proposal.startsWith("Proposal: Support desk audit\nPrepared for: Acme Analytics"));
  assert.ok(draft.proposal.includes("Approach\n1. Interview the four agents"));
  assert.ok(draft.proposal.includes("Deliverables\n- A ticket-flow report\n- A triage script"));
  assert.ok(draft.proposal.endsWith("Investment\n$4,800 fixed"));
});

test("buildProposal flags each missing section", () => {
  const draft = buildProposal({
    title: "",
    client: "",
    problem: "",
    approach: [],
    deliverables: [],
    timeline: "",
    price: "",
  });
  const ids = draft.checks.map((check) => check.id).sort();
  assert.deepEqual(ids, ["approach", "client", "deliverables", "price", "problem", "timeline", "title"]);
});

test("buildProposal insists on a figure in the investment line", () => {
  const draft = buildProposal({ ...FULL, price: "Competitive" });
  assert.ok(draft.checks.some((check) => check.id === "price-figure"));
});

test("buildProposal caps the deliverables list", () => {
  const draft = buildProposal({
    ...FULL,
    deliverables: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  });
  assert.ok(draft.checks.some((check) => check.id === "deliverables-many" && check.message.includes("9 deliverables")));
});
