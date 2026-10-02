import { test } from "node:test";
import assert from "node:assert/strict";
import { CODED_WORDS, WEAK_LEADINS, buildJobDescription } from "./job-description.ts";

const FULL = {
  title: "Junior data analyst",
  company: "Northfield Council",
  purpose: "This role exists to turn service data into the monthly decisions the leadership team makes.",
  responsibilities: [
    "Build the monthly service dashboard",
    "Clean and document the incoming data",
    "Answer ad hoc questions from service leads",
  ].join("\n"),
  requirements: [
    "Two years working with data",
    "Strong spreadsheet skills",
    "Experience preparing written summaries",
  ].join("\n"),
  niceToHave: "Experience with local government data",
  salary: "32,000 to 36,000",
  location: "Hybrid: two days a week in Northfield",
  apply: "Send a CV and a one page note to jobs@northfield.example by 30 October.",
};

test("the coded-language and weak-lead-in lists are the documented ones", () => {
  assert.ok(CODED_WORDS.includes("rockstar"));
  assert.ok(CODED_WORDS.includes("work hard play hard"));
  assert.ok(WEAK_LEADINS.includes("responsible for"));
});

test("a complete posting passes every check", () => {
  const job = buildJobDescription(FULL);
  assert.deepEqual(job.counts, { responsibilities: 3, requirements: 3, niceToHave: 1 });
  assert.deepEqual(job.checks, []);
  assert.match(job.output, /Junior data analyst at Northfield Council/);
  assert.match(job.output, /Pay: 32,000 to 36,000/);
});

test("coded language, weak lead-ins and missing terms are all named", () => {
  const job = buildJobDescription({
    title: "Growth rockstar",
    purpose: "Join our fast-paced team and crush the competition.",
    responsibilities: ["Responsible for growth", "Work hard play hard"].join("\n"),
    requirements: "A competitive streak",
  });
  assert.deepEqual(job.checks, [
    "2 responsibilities are too few to describe the role.",
    "Coded language detected (rockstar, competitive, crush, work hard play hard, fast-paced): this wording is documented to narrow who applies.",
    "1 responsibility opens with responsible for or similar; open with the verb — write the work, not the duty.",
    "No pay stated; postings without a range receive fewer and slower applications.",
    "No location or working arrangement stated.",
    "No application instructions; say what to send and where.",
  ]);
});

test("a long requirement list is asked to shed what is not required", () => {
  const requirements = Array.from({ length: 13 }, (_, index) => `Requirement number ${index + 1}`).join("\n");
  const job = buildJobDescription({ ...FULL, requirements, niceToHave: "" });
  assert.ok(job.checks.some((check) => check.startsWith("13 requirements is a filter rather than an invitation")));
  assert.ok(
    job.checks.some((check) =>
      check.startsWith("Nothing is marked nice-to-have against 13 requirements"),
    ),
  );
});

test("long bullets are flagged", () => {
  const long = Array.from({ length: 26 }, (_, index) => `word${index + 1}`).join(" ");
  const job = buildJobDescription({ ...FULL, responsibilities: `Build the dashboard ${long}` });
  assert.ok(job.checks.some((check) => check.startsWith("1 bullet runs past 25 words")));
});
