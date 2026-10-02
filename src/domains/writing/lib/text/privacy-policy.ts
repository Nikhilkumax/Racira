/**
 * Privacy policy template: the sections a data-protection notice is read for,
 * assembled from your parameters, with the gaps that regulators and readers
 * both look for named.
 *
 * The section order follows the published shape of a privacy notice: who is
 * responsible, what is collected, why, on what legal basis, who it is shared
 * with, cookies, how long it is kept, the reader's rights, transfers,
 * marketing, children, automated decisions, changes and contact. The switches
 * add the sections a service actually needs, and the checks catch the pairings
 * that make a notice incomplete in practice: collection without purposes,
 * purposes without retention, sharing without named recipients, transfers
 * without safeguards, children's data without an age, and a marketing section
 * without an opt-out. The rights section is always present, because it is the
 * part a reader uses.
 *
 * This is a drafting template, not legal advice. Data-protection law differs by
 * jurisdiction, and a qualified adviser reviews the result before it is
 * published.
 */

export interface PrivacySection {
  id: string;
  label: string;
  text: string;
}

export interface PrivacyDraft {
  sections: PrivacySection[];
  document: string;
  checks: string[];
}

export interface PrivacyInput {
  service?: string;
  operator?: string;
  contact?: string;
  jurisdiction?: string;
  effectiveDate?: string;
  categories?: string;
  purposes?: string;
  retention?: string;
  thirdParties?: string;
  childrenAge?: string;
}

export interface PrivacyOptions {
  cookies?: boolean;
  transfers?: boolean;
  marketing?: boolean;
  children?: boolean;
  automated?: boolean;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");
const lines = (value: string): string[] =>
  (value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);

/** Assemble the notice and check its load-bearing pairings. */
export function buildPrivacyPolicy(input: PrivacyInput = {}, options: PrivacyOptions = {}): PrivacyDraft {
  const service = clean(input.service ?? "");
  const operator = clean(input.operator ?? "");
  const contact = clean(input.contact ?? "");
  const jurisdiction = clean(input.jurisdiction ?? "");
  const effectiveDate = clean(input.effectiveDate ?? "");
  const categories = lines(input.categories ?? "");
  const purposes = lines(input.purposes ?? "");
  const retention = clean(input.retention ?? "");
  const thirdParties = lines(input.thirdParties ?? "");
  const childrenAge = clean(input.childrenAge ?? "");

  const cookies = options.cookies ?? false;
  const transfers = options.transfers ?? false;
  const marketing = options.marketing ?? false;
  const children = options.children ?? false;
  const automated = options.automated ?? false;

  const name = service || "(the service)";
  const entity = operator || "(the operator)";

  const sections: PrivacySection[] = [];

  sections.push({
    id: "who",
    label: "Who is responsible",
    text: `${entity} is responsible for the personal data described in this notice${jurisdiction ? `, and the law of ${jurisdiction} applies to it` : ""}.${contact ? ` Questions and requests go to ${contact}.` : ""}`,
  });

  sections.push({
    id: "what",
    label: "What we collect",
    text:
      categories.length > 0
        ? categories.map((line) => `- ${line}`).join("\n")
        : "(list the categories of personal data collected — account details, usage data, payment records, and so on.)",
  });

  sections.push({
    id: "why",
    label: "Why we collect it",
    text:
      purposes.length > 0
        ? purposes.map((line) => `- ${line}`).join("\n")
        : "(one purpose per line: provide the service, take payment, prevent fraud, send updates.)",
  });

  sections.push({
    id: "basis",
    label: "Our legal basis",
    text: `We rely on the performance of our contract with you for the data needed to run ${name}, on your consent for marketing and optional features, and on our legitimate interests for security and service improvement. Where consent is the basis, you can withdraw it at any time without affecting what was already done lawfully.`,
  });

  sections.push({
    id: "sharing",
    label: "Who we share it with",
    text:
      thirdParties.length > 0
        ? thirdParties.map((line) => `- ${line}`).join("\n")
        : "(name the processors and recipients — hosting, payments, analytics, support — or state plainly that personal data is not sold or shared.)",
  });

  if (cookies) {
    sections.push({
      id: "cookies",
      label: "Cookies and similar technologies",
      text: `We use cookies to keep you signed in, remember settings and measure how ${name} is used. Essential cookies are needed for the service to work; everything else is optional and can be refused without losing access to the service.`,
    });
  }

  sections.push({
    id: "retention",
    label: "How long we keep it",
    text: retention
      ? `We keep personal data for ${retention}, and then delete it or turn it into anonymous statistics. Where a legal obligation requires a longer period, the data is kept only for that purpose.`
      : "(state a retention period for each category, or the rule that decides it.)",
  });

  sections.push({
    id: "rights",
    label: "Your rights",
    text: `You can ask for a copy of your personal data, ask for it to be corrected or deleted, ask for it in a portable format, object to processing based on legitimate interests, and withdraw consent for marketing. Requests go to ${contact || "(the contact address)"} and are answered within the period the law allows. You also have the right to complain to your data-protection authority.`,
  });

  if (transfers) {
    sections.push({
      id: "transfers",
      label: "International transfers",
      text: `Some providers process data outside ${jurisdiction || "your jurisdiction"}. Where that happens, the transfer relies on the safeguards the law requires — an adequacy decision, or standard contractual clauses with the provider.`,
    });
  }

  if (marketing) {
    sections.push({
      id: "marketing",
      label: "Marketing",
      text: `We send service messages about your account as part of the service, and marketing messages only where you have opted in. Every marketing message carries an unsubscribe link, and opting out does not affect service messages.`,
    });
  }

  if (children) {
    sections.push({
      id: "children",
      label: "Children",
      text: childrenAge
        ? `${name} is not intended for children under ${childrenAge}. Where we learn that data from a younger child has been collected, we delete it.`
        : "(state the minimum age, and what happens if data from a younger child is found.)",
    });
  }

  if (automated) {
    sections.push({
      id: "automated",
      label: "Automated decisions",
      text: `Some decisions about your account are made automatically — for example, fraud checks and content recommendations. These decisions do not produce legal effects for you, and you can ask for a human review of any decision you believe is wrong.`,
    });
  }

  sections.push({
    id: "changes",
    label: "Changes to this notice",
    text: `This notice may change. A material change will be announced before it takes effect${effectiveDate ? `, and this version is effective from ${effectiveDate}` : ""}.`,
  });

  const document = sections.map((section) => `${section.label}\n${section.text}`).join("\n\n");

  const checks: string[] = [];
  if (!service) checks.push("No service named; a notice has to say what it covers.");
  if (!operator) checks.push("No operator named; a reader has to know who is responsible for the data.");
  if (!contact) checks.push("No contact address; rights requests need somewhere to arrive.");
  if (!jurisdiction) checks.push("No jurisdiction; the law that applies decides what the notice must contain.");
  if (!effectiveDate) checks.push("No effective date; readers and archives both need the version marker.");
  if (categories.length === 0) checks.push("No data categories listed; a notice that does not say what it collects cannot be meaningful.");
  if (purposes.length === 0) checks.push("No purposes stated; collection without a named purpose is the finding regulators look for first.");
  if (!retention) checks.push("No retention period; indefinite storage is the second thing a reader checks.");
  if (thirdParties.length === 0) {
    checks.push("No recipients named; name the processors and recipients, or state plainly that personal data is not sold or shared.");
  }
  if (cookies && categories.length > 0 && !categories.some((line) => /cookie|device|usage|analytics/i.test(line))) {
    checks.push("Cookies are described but no cookie or usage data appears among the categories collected.");
  }
  if (transfers && !jurisdiction) {
    checks.push("International transfers are described without a home jurisdiction; the sentence cannot say what the transfer is measured against.");
  }
  if (children && !childrenAge) {
    checks.push("Children's data is addressed without a minimum age; the section cannot apply without one.");
  }

  return { sections, document, checks };
}
