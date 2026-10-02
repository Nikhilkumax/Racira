"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Select,
  StackLayout,
  TextInput,
} from "./ui";
import {
  EMAIL_SCENARIOS,
  buildEmailTemplate,
  emailScenarioOptions,
  scenarioPlaceholders,
} from "@/domains/writing/lib/text/email-templates.ts";

/** Friendly labels for the fixed slot names the templates use. */
const SLOT_LABELS: Record<string, string> = {
  name: "Recipient's name",
  topic: "Topic",
  date: "Date of the conversation",
  note: "The detail line",
  deadline: "Deadline",
  next: "What happens next",
  sender: "Your name",
};

/**
 * Email template library: pick a scenario, fill the slots, and read the ready
 * email. The library is fixed and readable; nothing is generated.
 */
export default function EmailTemplateLibrary() {
  const [scenarioId, setScenarioId] = useState(EMAIL_SCENARIOS[0].id);
  const [vars, setVars] = useState<Record<string, string>>({});

  const placeholders = useMemo(() => scenarioPlaceholders(scenarioId), [scenarioId]);
  const draft = useMemo(() => buildEmailTemplate(scenarioId, vars), [scenarioId, vars]);

  const setVar = (key: string, value: string) => setVars((previous) => ({ ...previous, [key]: value }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The template</PanelTitle>
        <Select name="scenario" label="Scenario" value={scenarioId} onChange={setScenarioId} options={emailScenarioOptions()} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {placeholders.map((key) => (
            <TextInput
              key={`${scenarioId}-${key}`}
              name={key}
              label={SLOT_LABELS[key] ?? key}
              value={vars[key] ?? ""}
              onChange={(value) => setVar(key, value)}
              placeholder={`[${key}]`}
            />
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <span className="flex items-center gap-2">
              <CopyButton text={draft.text} testid="copy-text" label="Copy" />
            </span>
          }
        >
          Email
        </PanelTitle>
        <HeroStat
          label="Words"
          value={draft.words}
          testid="res-words"
          sub={draft.placeholders.length === 0 ? "all slots filled" : `${draft.placeholders.length} slot(s) still marked`}
        />
        <OutputBlock name="text" value={draft.text} maxHeight={420} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Read it once aloud before sending — tone is not something a template can check.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {draft.checks.map((check) => (
              <li
                key={check.id}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
              >
                {check.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The library is a fixed set of six common business emails with slots. Choosing a scenario and filling the
            slots composes the message; the words in the fixed lines are the template&rsquo;s, not yours.
          </Notice>
          <Notice tone="warn">
            Templates are for the emails nobody enjoys writing, not for the ones that matter. For anything sensitive —
            a rejection, an apology with consequences — write it yourself and use this only as a checklist of what to
            include.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
