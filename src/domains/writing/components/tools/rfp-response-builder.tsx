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
import { buildRfpResponse } from "@/domains/writing/lib/text/rfp-response.ts";

/**
 * RFP response builder: a numbered compliance matrix over the client's
 * requirements, plus the five sections an evaluator reads for.
 */
export default function RfpResponseBuilder() {
  const [values, setValues] = useState<Record<string, string>>({});
  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));
  const response = useMemo(() => buildRfpResponse(values), [values]);

  const combined = [response.matrix, response.response].filter(Boolean).join("\n\n");

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The call</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="rfp" label="RFP name" value={values.rfp ?? ""} onChange={set("rfp")} placeholder="Council digital services tender 2026" />
          <TextInput name="deadline" label="Deadline" value={values.deadline ?? ""} onChange={set("deadline")} placeholder="2030-03-01" />
        </div>
        <div className="mt-3">
          <TextArea
            name="requirements"
            label="One requirement per line: requirement | where it is answered"
            value={values.requirements ?? ""}
            onChange={set("requirements")}
            rows={6}
            placeholder={"Accessibility audit | Approach, section 2\nData migration | Past performance, section 4"}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>The five response sections</PanelTitle>
        <div className="space-y-3">
          <TextArea name="understanding" label="Understanding of the need" value={values.understanding ?? ""} onChange={set("understanding")} rows={2} placeholder="Restate the client's problem in their own terms, with the outcome they named." />
          <TextArea name="approach" label="Approach" value={values.approach ?? ""} onChange={set("approach")} rows={2} placeholder="What you will do, in what order, and what the client sees at each stage." />
          <TextArea name="team" label="Team" value={values.team ?? ""} onChange={set("team")} rows={2} placeholder="Who does the work, and what each person has done that is like this." />
          <TextArea name="past" label="Past performance" value={values.past ?? ""} onChange={set("past")} rows={2} placeholder="Two or three comparable engagements, with the result and a reference." />
          <TextArea name="pricing" label="Pricing" value={values.pricing ?? ""} onChange={set("pricing")} rows={2} placeholder="The price, what it includes, and what would change it." />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={combined ? <CopyButton text={combined} testid="copy-response" /> : undefined}>
          Compliance matrix
        </PanelTitle>
        <HeroStat
          label="Requirements"
          value={response.counts.total}
          testid="res-total"
          sub={`${response.counts.answered} answered · ${response.counts.gaps} gaps`}
        />
        <StatGrid>
          <Stat label="Answered" value={response.counts.answered} testid="res-answered" />
          <Stat label="Gaps" value={response.counts.gaps} testid="res-gaps" />
          <Stat label="Checks" value={response.checks.length} testid="res-checks-count" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="matrix" value={response.matrix} mono={false} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={response.response ? <CopyButton text={response.response} testid="copy-sections" /> : undefined}>
          Response scaffold
        </PanelTitle>
        <OutputBlock name="response" value={response.response} mono={false} />
        <div className="mt-3">
          <DownloadButton text={combined} filename="rfp-response.txt" testid="download-response" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {response.checks.length === 0 ? (
          <Notice>No documented problem: every requirement has an answer, the deadline is ahead and all five sections are written.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {response.checks.map((check) => (
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
            Evaluators score requirement by requirement, which is why the matrix leads. Each gap is a point that cannot
            be awarded, and the five sections are the ones most often found empty at review.
          </Notice>
          <Notice tone="warn">
            The builder does not write the answers and does not know the client&apos;s scoring weights. Paste the
            requirements verbatim and answer them in your own words.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
