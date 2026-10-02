/**
 * IRB consent form builder: the required elements of an informed-consent
 * document assembled from your study's own answers, with the elements that are
 * missing or overstated named.
 *
 * The element list follows the Common Rule's basic and additional elements of
 * informed consent (45 CFR 46.116) as published: purpose, procedures,
 * duration, risks, benefits, alternatives, confidentiality, compensation,
 * voluntary participation and withdrawal, contacts, and the signature block.
 * The builder does not decide whether a study is exempt or what a given IRB
 * requires; it makes sure no element is silently absent, which is the failure
 * that sends a protocol back.
 *
 * The drafting checks are the ones reviewers apply to the prose: "no risks" is
 * flagged because minimal-risk studies state the risk is no more than minimal;
 * benefits are flagged when they promise; payment is flagged when withdrawal is
 * not addressed; and long sentences are flagged because consent forms are read
 * once, quickly, by people who did not choose the wording.
 */
import { sentences, words } from "./tokenize.ts";

export interface ConsentSection {
  id: string;
  label: string;
  text: string;
}

export interface ConsentForm {
  sections: ConsentSection[];
  form: string;
  checks: string[];
  stats: { words: number; sentences: number; averageSentenceLength: number; longSentences: number };
}

export interface ConsentOptions {
  /** Audio/video/focus-group recording language is included. */
  recording?: boolean;
  /** A future-use paragraph is included. */
  futureUse?: boolean;
  /** Vulnerable-population language is included (children, cognitive impairment, prisoners). */
  vulnerable?: boolean;
  /** Waiver of documentation: no signature line, verbal consent statement instead. */
  waiver?: boolean;
  /** Institution's standard retention sentence; defaults to five years. */
  retentionYears?: number;
}

export const CONSENT_ELEMENTS: readonly { id: string; label: string }[] = [
  { id: "title", label: "Study title and investigator" },
  { id: "purpose", label: "Purpose" },
  { id: "procedures", label: "What participation involves" },
  { id: "duration", label: "Time required" },
  { id: "risks", label: "Risks" },
  { id: "benefits", label: "Benefits" },
  { id: "confidentiality", label: "Confidentiality" },
  { id: "voluntary", label: "Voluntary participation and withdrawal" },
  { id: "contacts", label: "Contacts" },
  { id: "signature", label: "Signature block" },
];

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE = /(\+?\d[\d\s().-]{6,}\d)/;
const PROMISE = /\b(guarantee|guaranteed|will cure|assured|definitely|promise)\b/i;
const NO_RISK = /\b(no|minimal|zero)\s+risk/i;
const WITHDRAWAL_PAY = /\b(prorat|pro-rat|partial payment|proportion|full amount|only if you (?:complete|finish)|per visit|per session)\b/i;

/** Assemble the consent document and check its published elements. */
export function buildConsentForm(
  input: Record<string, string>,
  options: ConsentOptions = {},
): ConsentForm {
  const get = (id: string, fallback = ""): string => clean(input[id] ?? "") || fallback;
  const recording = options.recording ?? false;
  const futureUse = options.futureUse ?? false;
  const vulnerable = options.vulnerable ?? false;
  const waiver = options.waiver ?? false;
  const retention = options.retentionYears ?? 5;

  const title = get("title");
  const investigator = get("investigator");
  const institution = get("institution");
  const purpose = get("purpose");
  const procedures = get("procedures");
  const duration = get("duration");
  const risks = get("risks");
  const benefits = get("benefits");
  const compensation = get("compensation");
  const confidentiality = get("confidentiality");
  const contact = get("contacts");

  const sections: ConsentSection[] = [];

  sections.push({
    id: "title",
    label: "Study title and investigator",
    text: [
      title || "(study title not set)",
      investigator ? `Principal investigator: ${investigator}${institution ? `, ${institution}` : ""}.` : "(principal investigator not set)",
    ].join("\n"),
  });

  sections.push({
    id: "purpose",
    label: "Purpose",
    text: `You are invited to take part in a research study. ${purpose || "(say why the study is being done, in one or two sentences.)"}`,
  });

  sections.push({
    id: "procedures",
    label: "What participation involves",
    text: `If you agree to take part, you will be asked to: ${procedures || "(describe each task, in the order it happens.)"}`,
  });

  sections.push({
    id: "duration",
    label: "Time required",
    text: `Taking part will take about ${duration || "(state the total time, including any follow-up.)"}.`,
  });

  sections.push({
    id: "risks",
    label: "Risks",
    text:
      risks ||
      "(State the risks. If there are none beyond everyday life, say the risk is no more than minimal and name anything a participant might find uncomfortable.)",
  });

  sections.push({
    id: "benefits",
    label: "Benefits",
    text: benefits || "(State the benefits to the participant or to others; do not promise an outcome.)",
  });

  if (compensation) {
    sections.push({
      id: "compensation",
      label: "Compensation",
      text: compensation,
    });
  }

  sections.push({
    id: "confidentiality",
    label: "Confidentiality",
    text: `${
      confidentiality || `Your responses will be seen only by the research team${institution ? ` at ${institution}` : ""}.`
    } Records will be kept for ${retention} years and then destroyed.${recording ? " Recordings are transcribed with identifiers removed before analysis." : ""}${
      futureUse
        ? " De-identified data may be kept for future research on the same topic; you may ask for your data to be removed before that point."
        : ""
    }`,
  });

  if (vulnerable) {
    sections.push({
      id: "vulnerable",
      label: "Participants needing additional protection",
      text: "If a participant is a minor, has a cognitive impairment, or is in custody, a parent, guardian or legally authorised representative must be present and must sign below, and assent is taken in language the participant understands.",
    });
  }

  sections.push({
    id: "voluntary",
    label: "Voluntary participation and withdrawal",
    text: `Taking part is voluntary. You may stop at any time and may decline any question, without giving a reason and with no penalty${
      compensation ? " beyond the payment for the part you did not complete" : ""
    }. Withdrawing will not affect any service you receive.`,
  });

  sections.push({
    id: "contacts",
    label: "Contacts",
    text: contact
      ? `Questions about the study: ${contact}. Questions about your rights as a participant: contact the institutional review board${institution ? ` at ${institution}` : ""}.`
      : "(Give two contacts: the researcher's email or phone, and the review board's, so a participant has somewhere to go that is not the researcher.)",
  });

  sections.push({
    id: "signature",
    label: "Signature block",
    text: waiver
      ? "Because this study uses a waiver of documentation of informed consent, no signature is collected. The researcher will read the statements above aloud and record that consent was given verbally."
      : [
          "I have read the information above, or it has been read to me. I have had the chance to ask questions, and my questions have been answered.",
          "I voluntarily agree to take part in this study.",
          "",
          "Name of participant: ______________________________   Date: ______________",
          "Signature of participant: _________________________",
          vulnerable ? "Signature of parent, guardian or representative: ______________________" : "",
          "Name of person taking consent: ______________________   Date: ______________",
        ]
          .filter((line) => line !== "")
          .join("\n"),
  });

  const form = sections.map((section) => `${section.label}\n${section.text}`).join("\n\n");

  const checks: string[] = [];
  if (!title) checks.push("No study title: the title has to match the protocol exactly, because it is what the reviewer searches for.");
  if (!investigator) checks.push("No principal investigator named.");
  if (!purpose || words(purpose).length < 10) {
    checks.push("The purpose is missing or under ten words; state why the study is being done in plain language.");
  }
  if (!procedures) checks.push("The procedures are missing; list each task in the order a participant will meet it.");
  if (!duration) checks.push("No time stated; participants weigh a study by what it will cost them in minutes.");
  if (!risks) {
    checks.push("The risk section is empty. Minimal-risk studies still state it: say the risk is no more than minimal.");
  } else if (NO_RISK.test(risks) && !/no more than minimal/i.test(risks)) {
    checks.push("Risks are called none. Use the review board's wording — no more than minimal risk — and name any discomfort.");
  }
  if (!benefits) checks.push("No benefits stated; say what the participant or others gain, without promising an outcome.");
  if (PROMISE.test(benefits)) checks.push("The benefits promise an outcome; consent documents describe benefits, they do not guarantee them.");
  if (compensation && !WITHDRAWAL_PAY.test(compensation)) {
    checks.push("Payment is described but withdrawal is not addressed; say how payment is prorated if a participant stops early.");
  }
  if (!EMAIL.test(contact) && !PHONE.test(contact)) {
    checks.push("The contact section has no email address or phone number a participant can actually use.");
  }
  if (!/voluntary/i.test(sections.find((section) => section.id === "voluntary")?.text ?? "")) {
    checks.push("The voluntary-participation statement is missing; it is a required element, not a courtesy.");
  }

  const allText = sections.map((section) => section.text).join(" ");
  const sentenceList = sentences(allText);
  const statWords = words(allText).length;
  const longSentences = sentenceList.filter((sentence) => words(sentence).length > 25).length;
  const averageSentenceLength = sentenceList.length > 0 ? Math.round((statWords / sentenceList.length) * 10) / 10 : 0;
  if (longSentences > 0) {
    checks.push(
      `${longSentences} sentence${longSentences === 1 ? " runs" : "s run"} past 25 words; consent forms are read once and quickly, so split them.`,
    );
  }

  return {
    sections,
    form,
    checks,
    stats: { words: statWords, sentences: sentenceList.length, averageSentenceLength, longSentences },
  };
}
