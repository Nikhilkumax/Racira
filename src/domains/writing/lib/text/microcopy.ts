/**
 * Microcopy library: the twelve interface slots every product writes and
 * rewrites, drafted from four inputs and checked against the published UX
 * writing guidance.
 *
 * The slots are the ones that cause the most support tickets: the primary
 * button, the field label and helper, the empty state, the loading state, the
 * error, the destructive confirmation, the success message and the link. Each
 * is drafted in the chosen register — neutral, friendly or formal — from the
 * product, the action and the object, so the drafts are specific rather than
 * generic. The checks apply the published guidance: a button label past four
 * words stops being a button, "invalid" blames the reader for a form's failure,
 * an exclamation mark in an error is tone-deaf, and a formal register that uses
 * contractions contradicts itself.
 */
export interface MicrocopySlot {
  id: string;
  label: string;
  when: string;
  text: string;
}

export interface MicrocopySet {
  slots: MicrocopySlot[];
  output: string;
  checks: string[];
}

export interface MicrocopyInput {
  product?: string;
  action?: string;
  object?: string;
  tone?: string;
}

export type MicrocopyTone = "neutral" | "friendly" | "formal";

/** Registers the library writes in. */
export const MICROCOPY_TONES: readonly { id: MicrocopyTone; label: string }[] = [
  { id: "neutral", label: "Neutral" },
  { id: "friendly", label: "Friendly" },
  { id: "formal", label: "Formal" },
];

/** Published words to avoid in interface copy. */
export const MICROCOPY_JARGON: readonly string[] = [
  "leverage",
  "utilize",
  "seamless",
  "robust",
  "please note",
  "in order to",
  "prior to",
];

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");
const cap = (value: string): string => (value ? value[0].toUpperCase() + value.slice(1) : value);

/** Draft the twelve slots and check them. */
export function buildMicrocopy(input: MicrocopyInput = {}): MicrocopySet {
  const product = clean(input.product ?? "");
  const action = clean(input.action ?? "");
  const object = clean(input.object ?? "");
  const tone: MicrocopyTone = MICROCOPY_TONES.some((entry) => entry.id === input.tone)
    ? (input.tone as MicrocopyTone)
    : "neutral";

  const thing = object || "item";
  const doThing = action || `create a ${thing}`;
  const productName = product || "the product";

  const first = {
    neutral: `${cap(doThing)}`,
    friendly: `${cap(doThing)}`,
    formal: `${cap(doThing)}`,
  }[tone];

  const emptyTitle = {
    neutral: `No ${thing}s yet`,
    friendly: `Nothing here yet`,
    formal: `No ${thing}s have been created`,
  }[tone];

  const emptyBody = {
    neutral: `When you ${doThing}, it will appear here.`,
    friendly: `Anything you ${doThing} shows up here, ready to share.`,
    formal: `A ${thing} you ${doThing} will be listed here.`,
  }[tone];

  const loading = {
    neutral: "Loading…",
    friendly: "Getting things ready…",
    formal: "Loading. This may take a moment.",
  }[tone];

  const error = {
    neutral: `We could not ${doThing}. Try again in a moment.`,
    friendly: `We couldn't ${doThing}. Check your connection and give it another go.`,
    formal: `We were unable to ${doThing}. Please try again; if the problem continues, contact support.`,
  }[tone];

  const success = {
    neutral: `${cap(thing)} created.`,
    friendly: `${cap(thing)} created — nice work.`,
    formal: `The ${thing} has been created.`,
  }[tone];

  const destructive = {
    neutral: `Delete this ${thing}? This cannot be undone.`,
    friendly: `Delete this ${thing}? Once it is gone, it is gone.`,
    formal: `Deleting this ${thing} is permanent and cannot be reversed.`,
  }[tone];

  const helper = {
    neutral: `We use this to ${doThing} on your behalf.`,
    friendly: `This is where you ${doThing}. We will keep it tidy.`,
    formal: `This value is used when you ${doThing}.`,
  }[tone];

  const slots: MicrocopySlot[] = [
    {
      id: "primary",
      label: "Primary button",
      when: "The main action on the screen.",
      text: first,
    },
    {
      id: "secondary",
      label: "Secondary button",
      when: "The way out without acting.",
      text: "Cancel",
    },
    {
      id: "label",
      label: "Field label",
      when: "Above a required input.",
      text: cap(thing),
    },
    {
      id: "helper",
      label: "Field helper text",
      when: "Below the label when the value needs explaining.",
      text: helper,
    },
    { id: "empty-title", label: "Empty state title", when: "When the list has nothing in it.", text: emptyTitle },
    { id: "empty-body", label: "Empty state body", when: "Under the empty state title.", text: emptyBody },
    { id: "loading", label: "Loading state", when: "While data is arriving.", text: loading },
    {
      id: "error",
      label: "Error message",
      when: "When the action fails for a reason the reader can act on.",
      text: error,
    },
    { id: "success", label: "Success message", when: "After the action completes.", text: success },
    {
      id: "destructive",
      label: "Destructive confirmation",
      when: "Before an action that cannot be undone.",
      text: destructive,
    },
    {
      id: "link",
      label: "Link text",
      when: "For the secondary path, never click here.",
      text: `Learn more about ${thing}s`,
    },
    {
      id: "permission",
      label: "Permission prompt",
      when: "When the product needs something from the reader.",
      text: `Allow ${productName} to ${doThing}? You can change this later in settings.`,
    },
  ];

  const output = slots.map((slot) => `${slot.label}\n${slot.text}`).join("\n\n");

  const checks: string[] = [];
  if (!action) checks.push("No action given; every slot here is written around what the reader is trying to do.");
  const longLabels = slots.filter((slot) => (slot.id === "primary" || slot.id === "secondary") && slot.text.split(/\s+/).length > 4);
  if (longLabels.length > 0) {
    checks.push(`${longLabels.length} button label${longLabels.length === 1 ? "" : "s"} past four words; a button is scanned, not read — keep the verb and the object.`);
  }
  const inputText = [product, action, object].join(" ");
  const jargon = [
    ...new Set(`${output} ${inputText}`.toLowerCase().match(new RegExp(`\\b(${MICROCOPY_JARGON.join("|")})\\b`, "g")) ?? []),
  ];
  if (jargon.length > 0) {
    checks.push(`Jargon detected (${jargon.join(", ")}); interface copy is read at a glance and jargon costs that glance.`);
  }
  if (slots.some((slot) => slot.text.includes("!")) || inputText.includes("!")) {
    checks.push("An exclamation mark appears in the copy; in a confirmation it is noisy, and in an error it is tone-deaf.");
  }
  if (/\binvalid\b/i.test(inputText)) {
    checks.push("The word invalid appears in your wording; it tells the reader they are wrong rather than what the form needs.");
  }
  const contractions = /\b(don't|can't|won't|it's|you're|we're|isn't|couldn't|doesn't|hasn't)\b/i.test(output);
  if (tone === "formal" && contractions) {
    checks.push("The formal register uses contractions; pick one register and let the slots agree.");
  }
  if (tone === "friendly" && !contractions && output.length > 0) {
    checks.push("The friendly register uses no contractions anywhere; friendliness is carried by rhythm as much as vocabulary.");
  }
  if (!product) checks.push("No product name; the permission prompt and error copy are less specific without it.");

  return { slots, output, checks };
}
