import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPrivacyPolicy } from "./privacy-policy.ts";

const FULL = {
  service: "Ledgerly",
  operator: "Ledgerly Ltd",
  contact: "privacy@ledgerly.example",
  jurisdiction: "England",
  effectiveDate: "1 November 2026",
  categories: "Account details\nUsage data",
  purposes: "Provide the service\nPrevent fraud",
  retention: "24 months",
  thirdParties: "Hosting provider\nPayment processor",
  childrenAge: "13",
};

const SWITCHES = { cookies: true, transfers: true, marketing: true, children: true, automated: true };

test("a complete notice assembles the sections and passes", () => {
  const notice = buildPrivacyPolicy(FULL, SWITCHES);
  assert.deepEqual(notice.checks, []);
  assert.deepEqual(
    notice.sections.map((section) => section.id),
    ["who", "what", "why", "basis", "sharing", "cookies", "retention", "rights", "transfers", "marketing", "children", "automated", "changes"],
  );
  assert.match(notice.document, /We keep personal data for 24 months/);
  assert.match(notice.document, /unsubscribe link/);
  assert.match(notice.document, /human review/);
});

test("switches off drop their sections", () => {
  const notice = buildPrivacyPolicy(FULL, {});
  assert.deepEqual(notice.sections.map((section) => section.id), [
    "who",
    "what",
    "why",
    "basis",
    "sharing",
    "retention",
    "rights",
    "changes",
  ]);
  assert.deepEqual(notice.checks, []);
});

test("an empty notice names every blank field and pairing", () => {
  const notice = buildPrivacyPolicy({}, { cookies: true, transfers: true, children: true });
  assert.equal(notice.sections.length, 11);
  assert.deepEqual(notice.checks, [
    "No service named; a notice has to say what it covers.",
    "No operator named; a reader has to know who is responsible for the data.",
    "No contact address; rights requests need somewhere to arrive.",
    "No jurisdiction; the law that applies decides what the notice must contain.",
    "No effective date; readers and archives both need the version marker.",
    "No data categories listed; a notice that does not say what it collects cannot be meaningful.",
    "No purposes stated; collection without a named purpose is the finding regulators look for first.",
    "No retention period; indefinite storage is the second thing a reader checks.",
    "No recipients named; name the processors and recipients, or state plainly that personal data is not sold or shared.",
    "International transfers are described without a home jurisdiction; the sentence cannot say what the transfer is measured against.",
    "Children's data is addressed without a minimum age; the section cannot apply without one.",
  ]);
});

test("cookies described without cookie data in the categories are flagged", () => {
  const notice = buildPrivacyPolicy({ ...FULL, categories: "Account details" }, { cookies: true });
  assert.ok(
    notice.checks.some(
      (check) => check === "Cookies are described but no cookie or usage data appears among the categories collected.",
    ),
  );

  const withUsage = buildPrivacyPolicy({ ...FULL, categories: "Account details\nUsage data" }, { cookies: true });
  assert.equal(withUsage.checks.some((check) => check.startsWith("Cookies are described")), false);
});

test("children's data with an age passes the section check", () => {
  const notice = buildPrivacyPolicy(FULL, { children: true, cookies: false });
  assert.equal(notice.checks.some((check) => check.startsWith("Children's data")), false);
  assert.match(notice.document, /not intended for children under 13/);
});
