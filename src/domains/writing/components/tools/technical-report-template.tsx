"use client";

import { useMemo, useState } from "react";
import {
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
import { REPORT_SECTIONS, buildTechnicalReport } from "@/domains/writing/lib/text/technical-report.ts";

/**
 * Technical report template: seven standard sections assembled into a numbered
 * report, with the sections a reader looks for first checked.
 */
export default function TechnicalReportTemplate() {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const draft = useMemo(
    () => buildTechnicalReport({ ...values, title, audience }),
    [values, title, audience],
  );
  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Front matter</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="title" label="Title" value={title} onChange={setTitle} placeholder="Review of the onboarding pipeline" />
          <TextInput
            name="audience"
            label="Prepared for"
            value={audience}
            onChange={setAudience}
            placeholder="the operations board"
          />
        </div>
        <div className="mt-3 space-y-3">
          {REPORT_SECTIONS.map((section) => (
            <TextArea
              key={section.id}
              name={section.id}
              label={`${section.label}${section.required ? "" : " (optional)"}`}
              value={values[section.id] ?? ""}
              onChange={set(section.id)}
              rows={section.id === "findings" || section.id === "recommendations" ? 3 : 2}
              placeholder={section.purpose}
            />
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={draft.output ? <CopyButton text={draft.output} testid="copy-report" /> : undefined}>
          Report
        </PanelTitle>
        <HeroStat label="Words" value={draft.words} testid="res-words" sub={`${draft.sections.length} sections`} />
        <StatGrid>
          <Stat
            label="Sections filled"
            value={`${draft.sections.filter((section) => section.status !== "empty").length}/${draft.sections.length}`}
            testid="res-filled"
          />
          <Stat label="Required missing" value={draft.missing.length} testid="res-missing-count" />
          <Stat label="Checks" value={draft.checks.length} testid="res-checks-count" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="report" value={draft.output} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={draft.output} filename="technical-report.txt" testid="download-report" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No documented problem: the required sections are filled, the findings carry evidence and the recommendations name owners.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {draft.checks.map((check) => (
              <li key={check.id}>
                <Notice tone="warn">{check.message}</Notice>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Five checks do the work: a named audience, evidence in the findings, an owner and a date on the
            recommendations, risks alongside them, and no section so thin that it is only a heading.
          </Notice>
          <Notice tone="warn">
            A report is a decision document, not a record. If the reader cannot tell what to do next after the summary,
            the structure was not the problem.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
