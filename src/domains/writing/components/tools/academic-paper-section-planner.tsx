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
import { DEFAULT_PAPER_TOTAL, planPaperSections } from "@/domains/writing/lib/text/paper-section-planner.ts";

/**
 * Academic paper section planner: a word budget split across the five standard
 * sections, with each section's required elements listed.
 */
export default function AcademicPaperSectionPlanner() {
  const [question, setQuestion] = useState("");
  const [method, setMethod] = useState("");
  const [contribution, setContribution] = useState("");
  const [total, setTotal] = useState(String(DEFAULT_PAPER_TOTAL));

  const parsed = Number(total);
  const plan = useMemo(
    () =>
      planPaperSections({
        question,
        method,
        contribution,
        total: Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAPER_TOTAL,
      }),
    [question, method, contribution, parsed],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The paper</PanelTitle>
        <div className="space-y-3">
          <TextArea
            name="question"
            label="Research question"
            value={question}
            onChange={setQuestion}
            rows={2}
            placeholder="Does remote work change informal knowledge sharing?"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              name="method"
              label="Method"
              value={method}
              onChange={setMethod}
              placeholder="Survey of 412 employees across 9 firms."
            />
            <TextInput
              name="total"
              label="Total word budget"
              value={total}
              onChange={setTotal}
              placeholder="6000"
            />
          </div>
          <TextArea
            name="contribution"
            label="Contribution"
            value={contribution}
            onChange={setContribution}
            rows={2}
            placeholder="The first estimate of informal exchange frequency by working arrangement."
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={plan.outline ? <CopyButton text={plan.outline} testid="copy-outline" /> : undefined}>
          Section budget
        </PanelTitle>
        <HeroStat label="Total budget" value={`${plan.total}`} testid="res-total" sub="words across five sections" />
        <StatGrid>
          <Stat label="Question" value={question.trim() ? "stated" : "missing"} testid="res-question" />
          <Stat label="Method" value={method.trim() ? "stated" : "missing"} testid="res-method" />
          <Stat label="Contribution" value={contribution.trim() ? "stated" : "missing"} testid="res-contribution" />
        </StatGrid>
        <ul className="mt-3 space-y-2" data-testid="res-sections">
          {plan.sections.map((section) => (
            <li key={section.id} className="rounded-lg border border-border bg-card/40 px-3 py-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{section.label}</span>
                <span className="font-mono text-sm text-foreground" data-testid={`res-${section.id}`}>
                  {section.targetWords}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{section.purpose}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                {section.elements.join(" · ")}
              </p>
              {section.note && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{section.note}</p>}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle>Plan</PanelTitle>
        <div className="mb-3">
          <OutputBlock name="outline" value={plan.outline} mono={false} />
        </div>
        <DownloadButton text={plan.outline} filename="paper-plan.txt" testid="download-outline" />
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {plan.checks.length === 0 ? (
          <Notice>No documented problem: the question, method and contribution are stated and the budget is realistic.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {plan.checks.map((check) => (
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
            The shares are published proportions: introduction 15%, methods 20%, results 30%, discussion 30%,
            conclusion 5%. Multiply your total by a share and you have a target before writing a word.
          </Notice>
          <Notice tone="warn">
            Venues differ, and a systematic review or a theoretical paper will not fit these proportions. Treat the
            targets as a starting position and adjust them with the section notes in view.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
