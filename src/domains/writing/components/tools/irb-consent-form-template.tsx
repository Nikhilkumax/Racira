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
import { buildConsentForm } from "@/domains/writing/lib/text/irb-consent.ts";

/**
 * IRB consent form builder: the published elements assembled from your study's
 * answers, with missing or overstated elements named.
 */
export default function IrbConsentFormTemplate() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [recording, setRecording] = useState(false);
  const [futureUse, setFutureUse] = useState(false);
  const [vulnerable, setVulnerable] = useState(false);
  const [waiver, setWaiver] = useState(false);

  const form = useMemo(
    () => buildConsentForm(values, { recording, futureUse, vulnerable, waiver }),
    [values, recording, futureUse, vulnerable, waiver],
  );
  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The study</PanelTitle>
        <div className="space-y-3">
          <TextInput
            name="title"
            label="Study title"
            value={values.title ?? ""}
            onChange={set("title")}
            placeholder="Remote work and informal knowledge sharing"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              name="investigator"
              label="Principal investigator"
              value={values.investigator ?? ""}
              onChange={set("investigator")}
              placeholder="Dr A. Researcher"
            />
            <TextInput
              name="institution"
              label="Institution"
              value={values.institution ?? ""}
              onChange={set("institution")}
              placeholder="Northfield University"
            />
          </div>
          <TextArea
            name="purpose"
            label="Purpose"
            value={values.purpose ?? ""}
            onChange={set("purpose")}
            rows={2}
            placeholder="We want to understand how remote arrangements change the way teams share knowledge."
          />
          <TextArea
            name="procedures"
            label="What participation involves"
            value={values.procedures ?? ""}
            onChange={set("procedures")}
            rows={2}
            placeholder="complete a 15 minute questionnaire and take part in one 30 minute interview."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              name="duration"
              label="Time required"
              value={values.duration ?? ""}
              onChange={set("duration")}
              placeholder="about 45 minutes in total"
            />
            <TextInput
              name="compensation"
              label="Compensation (optional)"
              value={values.compensation ?? ""}
              onChange={set("compensation")}
              placeholder="$20 per session, prorated if you stop early"
            />
          </div>
          <TextArea
            name="risks"
            label="Risks"
            value={values.risks ?? ""}
            onChange={set("risks")}
            rows={2}
            placeholder="Some questions ask about your workplace and may feel uncomfortable; the risk is no more than minimal."
          />
          <TextArea
            name="benefits"
            label="Benefits"
            value={values.benefits ?? ""}
            onChange={set("benefits")}
            rows={2}
            placeholder="You will receive a summary of the findings and contribute to research on hybrid working."
          />
          <TextArea
            name="confidentiality"
            label="Confidentiality"
            value={values.confidentiality ?? ""}
            onChange={set("confidentiality")}
            rows={2}
            placeholder="Your answers are stored under a study code, not your name."
          />
          <TextInput
            name="contacts"
            label="Contacts"
            value={values.contacts ?? ""}
            onChange={set("contacts")}
            placeholder="a.researcher@northfield.example or +1 555 0100"
          />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Checkbox name="recording" label="Audio or video recording" checked={recording} onChange={setRecording} />
          <Checkbox name="futureUse" label="Future use of de-identified data" checked={futureUse} onChange={setFutureUse} />
          <Checkbox name="vulnerable" label="Vulnerable populations" checked={vulnerable} onChange={setVulnerable} />
          <Checkbox name="waiver" label="Waiver of documentation" checked={waiver} onChange={setWaiver} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={form.form ? <CopyButton text={form.form} testid="copy-form" /> : undefined}>
          Consent form
        </PanelTitle>
        <HeroStat label="Words" value={form.stats.words} testid="res-words" sub={`${form.stats.sentences} sentences`} />
        <StatGrid>
          <Stat label="Elements" value={form.sections.length} testid="res-sections" />
          <Stat label="Checks" value={form.checks.length} testid="res-checks-count" />
          <Stat label="Avg sentence" value={`${form.stats.averageSentenceLength} words`} testid="res-average" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="form" value={form.form} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={form.form} filename="consent-form.txt" testid="download-form" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {form.checks.length === 0 ? (
          <Notice>No documented problem: every published element is present and the prose stays within reading limits.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {form.checks.map((check) => (
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
            The element list follows the Common Rule&apos;s basic and additional elements of informed consent (45 CFR
            46.116) as published: purpose, procedures, duration, risks, benefits, confidentiality, voluntary
            participation, withdrawal, contacts and the signature block.
          </Notice>
          <Notice tone="warn">
            This is a drafting aid, not IRB review and not legal advice. Exemptions, waivers and the wording your board
            requires are decided by your board, and its template overrides this one.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
