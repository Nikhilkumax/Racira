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
import {
  CONFLICT_TYPES,
  conflictCompleteness,
  conflictMarkdown,
  conflictReport,
  escalationProblems,
  type ConflictPlan,
} from "@/domains/writing/lib/text/conflict-planner.ts";

const SAMPLE = [
  "Mara copies the harbour master's key.",
  "Dev changes the lock and moves the ledger.",
  "Mara breaks in anyway, with the wrong key and the truth.",
].join("\n");

/**
 * Conflict and resolution planner: shape one conflict as a structure — who
 * opposes whom, over what, at what cost — with the escalating turns that raise
 * it toward the resolution. The checks ask whether the turns change the
 * situation and whether the resolution costs something.
 */
export default function ConflictAndResolutionPlanner() {
  const [plan, setPlan] = useState<ConflictPlan>({ name: "", type: CONFLICT_TYPES[0], parties: "", stakes: "", resolution: "", cost: "" });
  const [escalation, setEscalation] = useState(SAMPLE);

  const turns = useMemo(() => escalation.split("\n").map((line) => line.trim()).filter(Boolean), [escalation]);
  const full = useMemo<ConflictPlan>(() => ({ ...plan, escalation: turns }), [plan, turns]);
  const completeness = useMemo(() => conflictCompleteness(full), [full]);
  const problems = useMemo(() => escalationProblems(full), [full]);
  const markdown = useMemo(() => conflictMarkdown(full), [full]);
  const report = useMemo(() => conflictReport(full), [full]);

  const set = (key: keyof ConflictPlan) => (value: string) => setPlan((previous) => ({ ...previous, [key]: value }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Conflict</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="name" label="Working name" value={plan.name} onChange={set("name")} placeholder="The ledger" />
          <Select
            name="type"
            label="Type"
            value={plan.type ?? CONFLICT_TYPES[0]}
            onChange={set("type")}
            options={CONFLICT_TYPES.map((type) => ({ value: type, label: type }))}
          />
          <TextInput name="parties" label="Who opposes whom" value={plan.parties ?? ""} onChange={set("parties")} placeholder="Mara and Dev" />
          <TextInput name="stakes" label="What is at stake" value={plan.stakes ?? ""} onChange={set("stakes")} placeholder="the ledger that clears her father" />
          <TextInput name="resolution" label="Resolution" value={plan.resolution ?? ""} onChange={set("resolution")} placeholder="Mara gets the ledger" />
          <TextInput name="cost" label="What it costs" value={plan.cost ?? ""} onChange={set("cost")} placeholder="Dev's trust" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">one turn per line</span>}>
          Escalation
        </PanelTitle>
        <TextArea
          name="escalation"
          label="The turns that raise the conflict, in order"
          value={escalation}
          onChange={setEscalation}
          rows={6}
          placeholder={"Mara copies the key\nDev changes the lock\nMara breaks in anyway"}
          hint="at least three"
        />
      </Panel>

      <Panel>
        <PanelTitle>Shape</PanelTitle>
        <HeroStat
          label="Parts decided"
          value={`${completeness.filled}/${completeness.total}`}
          testid="res-completeness"
          sub={`${completeness.percent}% · ${completeness.turns} turn(s)`}
        />
        <StatGrid>
          <Stat label="Turns" value={completeness.turns} testid="res-turns" />
          <Stat label="Open parts" value={completeness.missing.length} testid="res-open" />
        </StatGrid>
        {completeness.missing.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Still open:{" "}
            <span data-testid="res-missing" className="font-mono text-foreground">
              {completeness.missing.join(", ")}
            </span>
          </p>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Shape notes</PanelTitle>
        {problems.length === 0 ? (
          <Notice>Three or more distinct turns, each a change, and a resolution with a cost. That is the shape.</Notice>
        ) : (
          <ul data-testid="res-notes" className="space-y-2">
            {problems.map((problem) => (
              <li key={problem} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                {problem}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <span className="flex items-center gap-2">
              <CopyButton text={markdown} testid="copy-plan" label="Copy plan" />
              <DownloadButton text={report} filename="conflict-plan.md" testid="download-plan" label="Download" />
            </span>
          }
        >
          Plan
        </PanelTitle>
        <OutputBlock name="plan" value={markdown} maxHeight={320} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The checks are structural: at least three escalation turns, each long enough to describe a change, no two
            turns saying the same thing, and a resolution that names a cost. They ask about the shape, not the idea.
          </Notice>
          <Notice tone="warn">
            The types listed (person versus person, self, society, nature, fate, technology) are the conventional labels,
            not a complete taxonomy, and a story can carry several at once. The planner writes nothing for you and keeps
            nothing beyond this tab.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
