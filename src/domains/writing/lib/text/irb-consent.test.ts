import { test } from "node:test";
import assert from "node:assert/strict";
import { CONSENT_ELEMENTS, buildConsentForm } from "./irb-consent.ts";

const FULL = {
  title: "Remote work and informal knowledge sharing",
  investigator: "Dr A. Researcher",
  institution: "Northfield University",
  purpose: "We want to understand how remote arrangements change the way teams share knowledge.",
  procedures: "complete a 15 minute questionnaire and take part in one 30 minute interview.",
  duration: "about 45 minutes in total, across one session.",
  risks: "Some questions ask about your workplace and may feel uncomfortable; the risk is no more than minimal.",
  benefits: "You will receive a summary of the findings and contribute to research on hybrid working.",
  confidentiality: "Your answers are stored under a study code, not your name.",
  contacts: "a.researcher@northfield.example or +1 555 0100.",
};

test("CONSENT_ELEMENTS lists the ten published element labels", () => {
  assert.deepEqual(CONSENT_ELEMENTS.map((element) => element.id), [
    "title",
    "purpose",
    "procedures",
    "duration",
    "risks",
    "benefits",
    "confidentiality",
    "voluntary",
    "contacts",
    "signature",
  ]);
});

test("a complete consent form passes every element check", () => {
  const form = buildConsentForm(FULL, { recording: true, futureUse: true });
  assert.deepEqual(form.checks, []);
  assert.equal(form.stats.words, 268);
  assert.equal(form.stats.sentences, 24);
  assert.equal(form.stats.longSentences, 0);
  assert.equal(form.stats.averageSentenceLength, 11.2);
  assert.equal(form.sections.some((section) => section.id === "compensation"), false);
});

test("the additional-element options change the assembled form", () => {
  const recording = buildConsentForm(FULL, { recording: true, futureUse: true });
  const confidentiality = recording.sections.find((section) => section.id === "confidentiality");
  assert.match(confidentiality?.text ?? "", /Recordings are transcribed/);
  assert.match(confidentiality?.text ?? "", /De-identified data may be kept for future research/);

  const vulnerable = buildConsentForm(FULL, { vulnerable: true });
  assert.equal(vulnerable.sections.some((section) => section.id === "vulnerable"), true);

  const waiver = buildConsentForm(FULL, { waiver: true });
  const signature = waiver.sections.find((section) => section.id === "signature");
  assert.match(signature?.text ?? "", /waiver of documentation/);
  assert.equal(signature?.text.includes("Signature of participant"), false);

  const retention = buildConsentForm(FULL, { retentionYears: 7 });
  assert.match(retention.sections.find((section) => section.id === "confidentiality")?.text ?? "", /kept for 7 years/);
});

test("a thin consent form is flagged element by element", () => {
  const form = buildConsentForm({
    title: "T",
    investigator: "I",
    purpose: "Study things",
    procedures: "do things",
    duration: "10 minutes",
    risks: "There are no risks.",
    benefits: "Participants are guaranteed a cure.",
    compensation: "You will be paid $20.",
    contacts: "ask us",
  });
  assert.deepEqual(form.checks, [
    "The purpose is missing or under ten words; state why the study is being done in plain language.",
    "Risks are called none. Use the review board's wording — no more than minimal risk — and name any discomfort.",
    "The benefits promise an outcome; consent documents describe benefits, they do not guarantee them.",
    "Payment is described but withdrawal is not addressed; say how payment is prorated if a participant stops early.",
    "The contact section has no email address or phone number a participant can actually use.",
    "1 sentence runs past 25 words; consent forms are read once and quickly, so split them.",
  ]);
});

test("an empty form names every missing element", () => {
  const form = buildConsentForm({});
  const checks = form.checks.join("\n");
  assert.match(checks, /No study title/);
  assert.match(checks, /No principal investigator/);
  assert.match(checks, /procedures are missing/);
  assert.match(checks, /No time stated/);
  assert.match(checks, /risk section is empty/);
  assert.match(checks, /No benefits stated/);
  assert.match(checks, /no email address or phone number/);
  assert.match(form.form, /Voluntary participation and withdrawal/);
});
