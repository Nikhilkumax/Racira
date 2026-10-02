/**
 * Terms of service template: the sections a consumer-facing agreement is read
 * for, assembled from your parameters, with the fields that cannot be left
 * blank named.
 *
 * The order is the published one: acceptance, eligibility, accounts,
 * acceptable use, user content, payments and renewals, refunds, intellectual
 * property, termination, disclaimers, limitation of liability, indemnity,
 * dispute resolution, changes and contact. The switches add the clauses a
 * service actually needs — accounts, user content, payments, refunds,
 * arbitration — and the checks catch the combinations that make an agreement
 * unenforceable or unfair in practice: payments without a renewal or refund
 * clause, arbitration without a class-action line, a privacy reference with no
 * policy address, and a jurisdiction left blank.
 *
 * This is a drafting template, not legal advice. Consumer law differs by
 * country and by state, and a qualified lawyer reviews the result.
 */

export interface TosSection {
  id: string;
  label: string;
  text: string;
}

export interface TosDraft {
  sections: TosSection[];
  document: string;
  checks: string[];
}

export interface TosOptions {
  accounts?: boolean;
  userContent?: boolean;
  payments?: boolean;
  refunds?: boolean;
  arbitration?: boolean;
  ageMinimum?: boolean;
}

export interface TosInput {
  service?: string;
  operator?: string;
  jurisdiction?: string;
  effectiveDate?: string;
  contact?: string;
  privacyUrl?: string;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Assemble the agreement and check the combinations that create gaps. */
export function buildTermsOfService(input: TosInput = {}, options: TosOptions = {}): TosDraft {
  const service = clean(input.service ?? "");
  const operator = clean(input.operator ?? "");
  const jurisdiction = clean(input.jurisdiction ?? "");
  const effectiveDate = clean(input.effectiveDate ?? "");
  const contact = clean(input.contact ?? "");
  const privacyUrl = clean(input.privacyUrl ?? "");

  const accounts = options.accounts ?? false;
  const userContent = options.userContent ?? false;
  const payments = options.payments ?? false;
  const refunds = options.refunds ?? false;
  const arbitration = options.arbitration ?? false;
  const ageMinimum = options.ageMinimum ?? false;

  const name = service || "(the service)";
  const entity = operator || "(the operator)";
  const law = jurisdiction || "(the jurisdiction)";

  const sections: TosSection[] = [];

  sections.push({
    id: "acceptance",
    label: "Acceptance of these terms",
    text: `By using ${name}, you agree to these terms. If you do not agree, do not use ${name}. These terms apply to every visit and every account, and they replace any earlier version.`,
  });

  if (ageMinimum) {
    sections.push({
      id: "eligibility",
      label: "Eligibility",
      text: `You must be at least the age of majority where you live to use ${name}. If you are under that age, you may use it only with the involvement of a parent or guardian who agrees to these terms.`,
    });
  }

  if (accounts) {
    sections.push({
      id: "accounts",
      label: "Accounts",
      text: `You are responsible for the accuracy of the information on your account, for keeping your credentials confidential, and for everything done through your account. Tell ${entity} immediately at ${contact || "(the contact address)"} if you believe your account has been used without your permission.`,
    });
  }

  sections.push({
    id: "use",
    label: "Acceptable use",
    text: `Use ${name} only for lawful purposes. Do not attempt to break, overload or reverse engineer it, do not use it to send unlawful or deceptive material, and do not use it in a way that interferes with anyone else's use.`,
  });

  if (userContent) {
    sections.push({
      id: "content",
      label: "Your content",
      text: `You keep ownership of what you post. You grant ${entity} a non-exclusive licence to host, store, reproduce and display your content so that ${name} can operate, and you confirm you have the rights needed to grant it. This licence ends when you delete the content, except where a copy must be kept to meet a legal obligation. How personal data is handled is set out in the privacy policy${privacyUrl ? ` at ${privacyUrl}` : ""}.`,
    });
  }

  if (payments) {
    sections.push({
      id: "payments",
      label: "Payments and renewals",
      text: `Paid plans are billed at the price shown at checkout. Subscriptions renew automatically at the end of each billing period unless cancelled before the renewal date, and cancelling stops the next charge rather than refunding the current period. Prices may change with notice before the next renewal.`,
    });
  }

  if (refunds) {
    sections.push({
      id: "refunds",
      label: "Refunds and cancellation",
      text: `You may cancel at any time from your account settings. Except where the law requires otherwise, payments already made are not refunded, and cancelling leaves access in place until the end of the paid period.`,
    });
  }

  sections.push({
    id: "ip",
    label: "Intellectual property",
    text: `${name}, its design and the material ${entity} provides are owned by ${entity} and are protected by copyright and other laws. Nothing in these terms transfers those rights to you.`,
  });

  sections.push({
    id: "termination",
    label: "Termination",
    text: `${entity} may suspend or end access to ${name} if these terms are broken, if the law requires it, or if the service is discontinued. You may stop using ${name} at any time. Sections that by their nature should survive termination do so.`,
  });

  sections.push({
    id: "disclaimers",
    label: "Disclaimers",
    text: `${name} is provided as it is. To the extent the law allows, ${entity} makes no warranty that it will be uninterrupted, error-free or fit for a particular purpose. Nothing here excludes a warranty or right that cannot be excluded by law.`,
  });

  sections.push({
    id: "liability",
    label: "Limitation of liability",
    text: `To the extent the law allows, ${entity} is not liable for indirect or consequential losses, and its total liability arising from ${name} is limited to the amount you paid in the twelve months before the event giving rise to the claim, or a stated nominal amount if you paid nothing.`,
  });

  sections.push({
    id: "indemnity",
    label: "Indemnity",
    text: `You agree to cover ${entity} for claims, losses or costs that arise from your use of ${name} in breach of these terms or of the law, including from content you post.`,
  });

  sections.push({
    id: "disputes",
    label: "Dispute resolution and governing law",
    text: [
      `These terms are governed by the laws of ${law}, and the courts of ${law} have jurisdiction.`,
      arbitration
        ? `Any dispute that cannot be resolved informally will be settled by binding arbitration on an individual basis; you and ${entity} each waive the right to a jury trial and to participate in a class action.`
        : "Before any formal step, both sides will try to resolve a dispute informally through the contact address below.",
    ].join(" "),
  });

  sections.push({
    id: "changes",
    label: "Changes to these terms",
    text: `These terms may change. A change that materially affects your rights will be announced before it takes effect, and continuing to use ${name} after it takes effect means you accept the change.`,
  });

  sections.push({
    id: "contact",
    label: "Contact",
    text: `Questions about these terms: ${contact || "(the contact address)"}${entity !== "(the operator)" ? `, ${entity}` : ""}${effectiveDate ? `. Effective from ${effectiveDate}.` : "."}`,
  });

  const document = sections.map((section) => `${section.label}\n${section.text}`).join("\n\n");

  const checks: string[] = [];
  if (!service) checks.push("No service name; an agreement has to say what it governs.");
  if (!operator) checks.push("No operator named; the entity that can be served with a claim has to be identified.");
  if (!jurisdiction) checks.push("No governing law; blank jurisdiction is the clause an adviser will ask about first.");
  if (!effectiveDate) checks.push("No effective date; readers and archives both need the version marker.");
  if (!contact) checks.push("No contact address for questions or notices.");
  if (payments && !refunds) {
    checks.push("Payments are described without a refund or cancellation clause; renewal and refund terms are read together.");
  }
  if (userContent && !privacyUrl) {
    checks.push("User content is collected but no privacy policy address is given; the data-handling reference needs somewhere to point.");
  }
  if (arbitration && !jurisdiction) {
    checks.push("Arbitration is selected but no governing law is named; an arbitration clause needs a seat.");
  }
  if (jurisdiction && /^(any|none|n\/a|tbd)$/i.test(jurisdiction)) {
    checks.push(`Governing law is set to "${jurisdiction}", which is not a jurisdiction.`);
  }

  return { sections, document, checks };
}
