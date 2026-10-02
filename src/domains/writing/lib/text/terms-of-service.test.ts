import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTermsOfService } from "./terms-of-service.ts";

const FULL = {
  service: "Ledgerly",
  operator: "Ledgerly Ltd",
  jurisdiction: "England and Wales",
  effectiveDate: "1 November 2026",
  contact: "legal@ledgerly.example",
  privacyUrl: "ledgerly.example/privacy",
};

const SWITCHES = { accounts: true, userContent: true, payments: true, refunds: true, arbitration: true, ageMinimum: true };

test("a complete agreement assembles the fifteen sections and passes", () => {
  const tos = buildTermsOfService(FULL, SWITCHES);
  assert.deepEqual(tos.checks, []);
  assert.deepEqual(
    tos.sections.map((section) => section.id),
    [
      "acceptance",
      "eligibility",
      "accounts",
      "use",
      "content",
      "payments",
      "refunds",
      "ip",
      "termination",
      "disclaimers",
      "liability",
      "indemnity",
      "disputes",
      "changes",
      "contact",
    ],
  );
  assert.match(tos.document, /Ledgerly/);
  assert.match(tos.document, /class action/);
  assert.match(tos.document, /ledgerly\.example\/privacy/);
});

test("switches off drop their sections", () => {
  const tos = buildTermsOfService(FULL, {});
  assert.deepEqual(tos.sections.map((section) => section.id), [
    "acceptance",
    "use",
    "ip",
    "termination",
    "disclaimers",
    "liability",
    "indemnity",
    "disputes",
    "changes",
    "contact",
  ]);
  assert.deepEqual(tos.checks, []);
});

test("an empty agreement names every blank field and both pairings", () => {
  const tos = buildTermsOfService({}, { payments: true, userContent: true, arbitration: true });
  assert.equal(tos.sections.length, 12);
  assert.deepEqual(tos.checks, [
    "No service name; an agreement has to say what it governs.",
    "No operator named; the entity that can be served with a claim has to be identified.",
    "No governing law; blank jurisdiction is the clause an adviser will ask about first.",
    "No effective date; readers and archives both need the version marker.",
    "No contact address for questions or notices.",
    "Payments are described without a refund or cancellation clause; renewal and refund terms are read together.",
    "User content is collected but no privacy policy address is given; the data-handling reference needs somewhere to point.",
    "Arbitration is selected but no governing law is named; an arbitration clause needs a seat.",
  ]);
});

test("a non-jurisdiction is called out", () => {
  const tos = buildTermsOfService({ ...FULL, jurisdiction: "TBD" });
  assert.ok(tos.checks.some((check) => check.includes('Governing law is set to "TBD"')));
});
