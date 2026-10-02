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
  TextArea,
  TextInput,
} from "./ui";
import { buildPrivacyPolicy } from "@/domains/writing/lib/text/privacy-policy.ts";

/**
 * Privacy policy template: the sections a data-protection notice is read for,
 * assembled from your parameters with the load-bearing gaps named.
 */
export default function PrivacyPolicyTemplate() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [cookies, setCookies] = useState(false);
  const [transfers, setTransfers] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [children, setChildren] = useState(false);
  const [automated, setAutomated] = useState(false);

  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));
  const notice = useMemo(
    () => buildPrivacyPolicy(values, { cookies, transfers, marketing, children, automated }),
    [values, cookies, transfers, marketing, children, automated],
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
            <TextInput name="contact" label="Contact for requests" value={values.contact ?? ""} onChange={set("contact")} placeholder="privacy@ledgerly.example" />
            <TextInput name="jurisdiction" label="Jurisdiction" value={values.jurisdiction ?? ""} onChange={set("jurisdiction")} placeholder="England" />
          </div>
          <TextInput name="effectiveDate" label="Effective date" value={values.effectiveDate ?? ""} onChange={set("effectiveDate")} placeholder="1 November 2026" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>What and why</PanelTitle>
        <div className="space-y-3">
          <TextArea
            name="categories"
            label="Categories collected, one per line"
            value={values.categories ?? ""}
            onChange={set("categories")}
            rows={4}
            placeholder={"Account details\nUsage data"}
          />
          <TextArea
            name="purposes"
            label="Purposes, one per line"
            value={values.purposes ?? ""}
            onChange={set("purposes")}
            rows={4}
            placeholder={"Provide the service\nPrevent fraud"}
          />
          <TextInput name="retention" label="Retention period" value={values.retention ?? ""} onChange={set("retention")} placeholder="24 months" />
          <TextArea
            name="thirdParties"
            label="Recipients and processors, one per line"
            value={values.thirdParties ?? ""}
            onChange={set("thirdParties")}
            rows={4}
            placeholder={"Hosting provider\nPayment processor"}
          />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Checkbox name="cookies" label="Cookies and similar technologies" checked={cookies} onChange={setCookies} />
          <Checkbox name="transfers" label="International transfers" checked={transfers} onChange={setTransfers} />
          <Checkbox name="marketing" label="Marketing" checked={marketing} onChange={setMarketing} />
          <Checkbox name="children" label="Children's data" checked={children} onChange={setChildren} />
          <Checkbox name="automated" label="Automated decisions" checked={automated} onChange={setAutomated} />
        </div>
        {children && (
          <div className="mt-3">
            <TextInput
              name="childrenAge"
              label="Minimum age"
              value={values.childrenAge ?? ""}
              onChange={set("childrenAge")}
              placeholder="13"
            />
          </div>
        )}
      </Panel>

      <Panel>
        <PanelTitle right={notice.document ? <CopyButton text={notice.document} testid="copy-notice" /> : undefined}>
          The notice
        </PanelTitle>
        <HeroStat label="Sections" value={notice.sections.length} testid="res-sections" sub="in reading order" />
        <StatGrid>
          <Stat label="Checks" value={notice.checks.length} testid="res-checks-count" />
          <Stat label="Switches on" value={[cookies, transfers, marketing, children, automated].filter(Boolean).length} testid="res-switches" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="document" value={notice.document} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={notice.document} filename="privacy-policy.txt" testid="download-notice" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {notice.checks.length === 0 ? (
          <Notice>
            No documented problem: the categories, purposes, retention, recipients, contact and jurisdiction are set and
            every selected section has what it needs.
          </Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {notice.checks.map((check) => (
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
            The sections follow the published shape of a privacy notice: who is responsible, what is collected, why, on
            what basis, who it is shared with, cookies, retention, rights, transfers, marketing, children, automated
            decisions, changes and contact.
          </Notice>
          <Notice tone="warn">
            This is a drafting template, not legal advice. Data-protection law differs by jurisdiction, and the rights,
            transfers and children&apos;s sections in particular should be reviewed by a qualified adviser before
            publication.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
