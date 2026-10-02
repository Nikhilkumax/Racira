"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  DownloadButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextInput,
} from "./ui";
import { buildTermsOfService } from "@/domains/writing/lib/text/terms-of-service.ts";

/**
 * Terms of service template: the sections a consumer agreement is read for,
 * assembled from your parameters with the blank fields and unpaired clauses
 * named.
 */
export default function TermsOfServiceTemplate() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [accounts, setAccounts] = useState(true);
  const [userContent, setUserContent] = useState(false);
  const [payments, setPayments] = useState(false);
  const [refunds, setRefunds] = useState(false);
  const [arbitration, setArbitration] = useState(false);
  const [ageMinimum, setAgeMinimum] = useState(false);

  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));
  const tos = useMemo(
    () => buildTermsOfService(values, { accounts, userContent, payments, refunds, arbitration, ageMinimum }),
    [values, accounts, userContent, payments, refunds, arbitration, ageMinimum],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The service</PanelTitle>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="service" label="Service name" value={values.service ?? ""} onChange={set("service")} placeholder="Ledgerly" />
            <TextInput name="operator" label="Legal entity" value={values.operator ?? ""} onChange={set("operator")} placeholder="Ledgerly Ltd" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="jurisdiction" label="Governing law" value={values.jurisdiction ?? ""} onChange={set("jurisdiction")} placeholder="England and Wales" />
            <TextInput name="effectiveDate" label="Effective date" value={values.effectiveDate ?? ""} onChange={set("effectiveDate")} placeholder="1 November 2026" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="contact" label="Contact address" value={values.contact ?? ""} onChange={set("contact")} placeholder="legal@ledgerly.example" />
            <TextInput name="privacyUrl" label="Privacy policy address" value={values.privacyUrl ?? ""} onChange={set("privacyUrl")} placeholder="ledgerly.example/privacy" />
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Checkbox name="accounts" label="User accounts" checked={accounts} onChange={setAccounts} />
          <Checkbox name="userContent" label="User content" checked={userContent} onChange={setUserContent} />
          <Checkbox name="payments" label="Payments and subscriptions" checked={payments} onChange={setPayments} />
          <Checkbox name="refunds" label="Refunds and cancellation" checked={refunds} onChange={setRefunds} />
          <Checkbox name="arbitration" label="Binding arbitration" checked={arbitration} onChange={setArbitration} />
          <Checkbox name="ageMinimum" label="Minimum age" checked={ageMinimum} onChange={setAgeMinimum} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={tos.document ? <CopyButton text={tos.document} testid="copy-tos" /> : undefined}>
          The agreement
        </PanelTitle>
        <HeroStat label="Sections" value={tos.sections.length} testid="res-sections" sub="in reading order" />
        <StatGrid>
          <Stat label="Checks" value={tos.checks.length} testid="res-checks-count" />
          <Stat label="Switches on" value={[accounts, userContent, payments, refunds, arbitration, ageMinimum].filter(Boolean).length} testid="res-switches" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="document" value={tos.document} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={tos.document} filename="terms-of-service.txt" testid="download-tos" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {tos.checks.length === 0 ? (
          <Notice>No documented problem: the operator, the law, the date and the contact are set and every selected clause has its pair.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {tos.checks.map((check) => (
              <li key={check}>
                <Notice tone="warn">{check}</Notice>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The sections follow the published order an agreement is read for: acceptance, eligibility, accounts,
            acceptable use, user content, payments, refunds, intellectual property, termination, disclaimers,
            liability, indemnity, disputes, changes and contact.
          </Notice>
          <Notice tone="warn">
            This is a drafting template, not legal advice. Consumer law differs by country and state, and the refund,
            arbitration and liability clauses in particular should be reviewed by a qualified lawyer before use.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
