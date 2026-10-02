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
  Select,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  TextInput,
} from "./ui";
import { DEFAULT_GRANT_LIMIT, GRANT_FRAMEWORKS, planGrantProposal } from "@/domains/writing/lib/text/grant-proposal.ts";

const FRAMEWORK_OPTIONS = GRANT_FRAMEWORKS.map((framework) => ({
  value: framework.id,
  label: framework.label,
}));

/**
 * Grant proposal outline: one of three published frameworks assembled into an
 * outline, with the mandate's weak spots named.
 */
export default function GrantProposalOutline() {
  const [framework, setFramework] = useState(GRANT_FRAMEWORKS[0].id);
  const [limit, setLimit] = useState(String(DEFAULT_GRANT_LIMIT));
  const [values, setValues] = useState<Record<string, string>>({});

  const parsedLimit = Number(limit);
  const plan = useMemo(
    () =>
      planGrantProposal(values, {
        framework,
        limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_GRANT_LIMIT,
      }),
    [values, framework, parsedLimit],
  );

  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The call</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name="framework"
            label="Framework"
            value={framework}
            onChange={setFramework}
            options={FRAMEWORK_OPTIONS}
          />
          <TextInput name="limit" label="Narrative limit (words)" value={limit} onChange={setLimit} />
        </div>
        <div className="mt-3 space-y-3">
          {plan.sections.map((section) => (
            <TextArea
              key={section.id}
              name={section.id}
              label={section.label}
              value={values[section.id] ?? ""}
              onChange={set(section.id)}
              rows={2}
              placeholder={section.prompt}
            />
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={plan.output ? <CopyButton text={plan.output} testid="copy-outline" /> : undefined}>
          Outline
        </PanelTitle>
        <HeroStat
          label="Narrative words"
          value={plan.words}
          testid="res-words"
          sub={`against a limit of ${plan.limit}`}
        />
        <StatGrid>
          <Stat
            label="Sections filled"
            value={`${plan.sections.filter((section) => section.text).length}/${plan.sections.length}`}
            testid="res-filled"
          />
          <Stat label="Checks" value={plan.checks.length} testid="res-checks-count" />
          <Stat label="Framework" value={plan.framework.split(",")[0]} testid="res-framework" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="outline" value={plan.output} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={plan.output} filename="grant-outline.txt" testid="download-outline" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {plan.checks.length === 0 ? (
          <Notice>No documented problem: every section is filled, the objectives are measurable and the length fits.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {plan.checks.map((check) => (
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
            The checks are the things reviewers reject proposals for: objectives that cannot be measured, no evaluation
            plan, no dates, no budget justification, and a narrative past the stated limit.
          </Notice>
          <Notice tone="warn">
            Funder calls differ in more ways than a framework can capture. Read the call itself; this outline is a
            starting structure, not a compliance check.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
