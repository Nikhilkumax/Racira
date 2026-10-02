/**
 * Email template library: a small set of common business emails — follow-up,
 * introduction, request, apology, reminder, thank-you — as skeletons with
 * `{{name}}`-style slots, plus a filler that substitutes the writer's values.
 *
 * The library is fixed and readable; the checks flag placeholders left unfilled
 * and an email that has outgrown a screen.
 */

export interface EmailScenario {
  id: string;
  label: string;
  subject: string;
  opening: string;
  body: string[];
  close: string;
}

export const EMAIL_SCENARIOS: EmailScenario[] = [
  {
    id: "follow-up",
    label: "Follow-up after a conversation",
    subject: "Following up on {{topic}}",
    opening: "Hi {{name}},",
    body: [
      "Thanks again for your time on {{date}}.",
      "I wanted to follow up on {{topic}} — {{note}}",
      "Could you let me know by {{deadline}}?",
    ],
    close: "Best,\n{{sender}}",
  },
  {
    id: "introduction",
    label: "Introduction between two people",
    subject: "Introduction: {{topic}}",
    opening: "Hi {{name}},",
    body: [
      "I would like to introduce you to {{topic}}.",
      "{{note}}",
      "I will leave you to take it from here.",
    ],
    close: "Best,\n{{sender}}",
  },
  {
    id: "request",
    label: "Making a request",
    subject: "Request: {{topic}}",
    opening: "Hi {{name}},",
    body: ["Could I ask for {{topic}}?", "{{note}}", "I would need it by {{deadline}} — thank you."],
    close: "Best,\n{{sender}}",
  },
  {
    id: "apology",
    label: "Apology and repair",
    subject: "Apology for {{topic}}",
    opening: "Hi {{name}},",
    body: [
      "I am sorry about {{topic}}.",
      "{{note}}",
      "Here is what I am doing to put it right: {{next}}",
    ],
    close: "Best,\n{{sender}}",
  },
  {
    id: "reminder",
    label: "Gentle reminder",
    subject: "Reminder: {{topic}}",
    opening: "Hi {{name}},",
    body: ["A quick reminder about {{topic}}.", "{{note}}", "The deadline is {{deadline}}."],
    close: "Best,\n{{sender}}",
  },
  {
    id: "thank-you",
    label: "Thank-you note",
    subject: "Thank you — {{topic}}",
    opening: "Hi {{name}},",
    body: ["Thank you for {{topic}}.", "{{note}}", "I hope we can work together again soon."],
    close: "Best,\n{{sender}}",
  },
];

export interface EmailTemplateCheck {
  id: string;
  message: string;
}

export interface EmailTemplateDraft {
  subject: string;
  body: string;
  text: string;
  words: number;
  /** Slot names still unfilled, in the order they appear. */
  placeholders: string[];
  checks: EmailTemplateCheck[];
}

const PLACEHOLDER = /\{\{(\w+)\}\}/g;

export function buildEmailTemplate(scenarioId: string, vars: Record<string, string> = {}): EmailTemplateDraft {
  const scenario = EMAIL_SCENARIOS.find((entry) => entry.id === scenarioId) ?? EMAIL_SCENARIOS[0];
  const missing: string[] = [];

  const fill = (template: string): string =>
    template.replace(PLACEHOLDER, (_match, key: string) => {
      const value = (vars[key] ?? "").trim();
      if (value) return value;
      if (!missing.includes(key)) missing.push(key);
      return `[${key}]`;
    });

  const subject = fill(scenario.subject);
  const opening = fill(scenario.opening);
  const bodyLines = scenario.body.map(fill);
  const close = fill(scenario.close);
  const body = [opening, ...bodyLines, close].join("\n\n");
  const text = `Subject: ${subject}\n\n${body}`;

  const checks: EmailTemplateCheck[] = [];
  if (missing.length > 0) {
    checks.push({
      id: "placeholders",
      message: `${missing.length} placeholder${missing.length === 1 ? "" : "s"} still to fill: ${missing.map((key) => `[${key}]`).join(", ")}.`,
    });
  }
  const count = text.split(/\s+/).filter(Boolean).length;
  if (count > 200) {
    checks.push({ id: "long", message: `The email runs ${count} words; keep it under two hundred, ideally under one hundred.` });
  }

  return { subject, body, text, words: count, placeholders: missing, checks };
}

/** The scenario labels, for the select control. */
export function emailScenarioOptions(): { value: string; label: string }[] {
  return EMAIL_SCENARIOS.map((scenario) => ({ value: scenario.id, label: scenario.label }));
}

/** The slot names a scenario uses, in the order they appear. */
export function scenarioPlaceholders(scenarioId: string): string[] {
  const scenario = EMAIL_SCENARIOS.find((entry) => entry.id === scenarioId) ?? EMAIL_SCENARIOS[0];
  const text = [scenario.subject, scenario.opening, ...scenario.body, scenario.close].join("\n");
  const keys: string[] = [];
  for (const match of text.matchAll(PLACEHOLDER)) {
    if (!keys.includes(match[1])) keys.push(match[1]);
  }
  return keys;
}
