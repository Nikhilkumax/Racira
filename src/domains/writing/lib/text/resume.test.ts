import { test } from "node:test";
import assert from "node:assert/strict";
import { buildResume, parseEducation, parseExperience } from "./resume.ts";

const FULL = {
  name: "Ada Lovelace",
  title: "Support Engineer",
  contact: "ada@example.com · Bristol",
  summary: "Support engineer with six years in B2B software.",
  experience: [
    "Support Engineer | Acme Analytics | 2021–present | Cut first-response time 40% across 2,000 tickets",
    "Support Associate | Beta Softworks | 2018–2021 | Handled a queue of 60 calls a week",
  ],
  education: ["BSc Computer Science | University of Bristol | 2018"],
  skills: ["SQL", "Zendesk", "Technical writing", "Onboarding", "Python"],
};

test("buildResume assembles the sections in order", () => {
  const draft = buildResume(FULL);
  assert.equal(draft.words, 59);
  assert.equal(draft.sections, 4);
  assert.equal(draft.quantified, 2);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.resume.includes("Support Engineer — Acme Analytics (2021–present)"));
  assert.ok(draft.resume.includes("  Cut first-response time 40% across 2,000 tickets"));
  assert.ok(draft.resume.includes("SKILLS\nSQL · Zendesk · Technical writing · Onboarding · Python"));
});

test("parseExperience marks incomplete and unquantified entries", () => {
  const entries = parseExperience(["Writer | 2019", "Editor | Press | 2020 | Edited a weekly newsletter"]);
  assert.equal(entries[0].complete, false);
  assert.equal(entries[1].complete, true);
  assert.equal(entries[1].quantified, false);
});

test("buildResume prompts for missing fields, missing sections and a long summary", () => {
  const draft = buildResume({
    name: "",
    title: "",
    contact: "",
    summary: Array.from({ length: 61 }, (_, index) => `word${index + 1}`).join(" "),
    experience: ["Writer | 2019"],
    education: [],
    skills: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen"],
  });
  const ids = draft.checks.map((check) => check.id);
  assert.ok(ids.includes("name"));
  assert.ok(ids.includes("contact"));
  assert.ok(ids.includes("summary-long"));
  assert.ok(ids.includes("entry-incomplete"));
  assert.ok(ids.includes("education"));
  assert.ok(ids.includes("skills-long"));
});

test("buildResume asks for a number in an unquantified achievement", () => {
  const draft = buildResume({
    ...FULL,
    experience: ["Support Engineer | Acme Analytics | 2021–present | Answered support tickets"],
  });
  assert.ok(draft.checks.some((check) => check.id === "entry-unquantified" && check.message.startsWith("Support Engineer: add a number")));
  assert.equal(draft.quantified, 0);
});

test("parseEducation requires a degree, an institution and a year", () => {
  const entries = parseEducation(["BSc Computer Science | University of Bristol | 2018", "MSc Data Science | University of Bath"]);
  assert.equal(entries[0].complete, true);
  assert.equal(entries[1].complete, false);
});
