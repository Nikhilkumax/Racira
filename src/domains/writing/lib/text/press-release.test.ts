import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPressRelease } from "./press-release.ts";

const FULL = {
  organisation: "Acme Analytics",
  headline: "Acme Analytics opens a support hub in Bristol",
  city: "Bristol",
  date: "3 March 2026",
  what: "Acme Analytics has opened a support hub in Bristol",
  who: "The hub will serve customers across the south west",
  when: "The hub opens on 1 April",
  where: "Recruitment begins this month",
  why: "The region has a shortage of technical support roles",
  quote: "Priya Raman | We want support to be local",
  boilerplate: "Acme Analytics builds support software.",
  contact: "press@acme.example",
};

test("buildPressRelease assembles lead, quote, boilerplate and contact", () => {
  const draft = buildPressRelease(FULL);
  assert.equal(draft.words, 73);
  assert.equal(draft.leadWords, 27);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.release.startsWith("FOR IMMEDIATE RELEASE\n\nAcme Analytics Opens a Support Hub in Bristol"));
  assert.ok(draft.release.includes("BRISTOL, 3 March 2026 — Acme Analytics has opened a support hub in Bristol."));
  assert.ok(draft.release.includes('"We want support to be local" said Priya Raman.'));
  assert.ok(draft.release.includes("About Acme Analytics\nAcme Analytics builds support software."));
  assert.ok(draft.release.endsWith("Media contact: press@acme.example"));
});

test("buildPressRelease title-cases while keeping short words lowercase", () => {
  const draft = buildPressRelease({ ...FULL, headline: "a hub for the south west" });
  assert.ok(draft.release.includes("A Hub for the South West"));
});

test("buildPressRelease flags a headline with a closing period", () => {
  const draft = buildPressRelease({ ...FULL, headline: "Short notice." });
  assert.ok(draft.checks.some((check) => check.id === "headline-period"));
});

test("buildPressRelease flags every missing part of the bare bones", () => {
  const draft = buildPressRelease({
    organisation: "",
    headline: "",
    city: "",
    date: "",
    what: "Something happened",
    who: "",
    when: "",
    where: "",
    why: "",
    quote: "",
    boilerplate: "",
    contact: "",
  });
  const ids = draft.checks.map((check) => check.id).sort();
  assert.deepEqual(ids, ["boilerplate", "contact", "dateline", "headline", "organisation", "quote", "when-where", "who", "why"]);
});

test("buildPressRelease asks for attribution when only words are given", () => {
  const draft = buildPressRelease({ ...FULL, quote: "Some words" });
  assert.ok(draft.checks.some((check) => check.id === "quote-speaker"));
  assert.ok(draft.release.includes('"Some words"'));
});
