"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  Select,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { COUNTER_FRAMES, buildCounterarguments } from "@/domains/writing/lib/text/counterargument.ts";

const LIMIT_OPTIONS = [
  { value: "10", label: "All ten moves" },
  { value: "6", label: "Six moves" },
  { value: "4", label: "Four moves" },
];

/**
 * Counterargument generator: detects the claim's shape, then orders the
 * published challenge moves so the tailored ones come first.
 */
export default function CounterargumentGenerator() {
  const [claim, setClaim] = useState("");
  const [limit, setLimit] = useState("10");

  const parsed = Number(limit);
  const plan = useMemo(
    () => buildCounterarguments(claim, { limit: Number.isFinite(parsed) && parsed > 0 ? parsed : COUNTER_FRAMES.length }),
    [claim, parsed],
  );

  const text = plan.frames.map((frame) => `${frame.label}: ${frame.prompt}`).join("\n\n");

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The claim to challenge</PanelTitle>
        <TextArea
          name="claim"
          label="Claim"
          value={claim}
          onChange={setClaim}
          rows={3}
          placeholder="Remote work always reduces informal knowledge sharing because teams are distributed."
          hint="Write it as it would be argued, not softened."
        />
        <div className="mt-3">
          <Select name="limit" label="Moves to show" value={limit} onChange={setLimit} options={LIMIT_OPTIONS} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={text ? <CopyButton text={text} testid="copy-moves" /> : undefined}>
          Challenge moves
        </PanelTitle>
        <HeroStat
          label="Moves"
          value={plan.frames.length}
          testid="res-frames-count"
          sub={`claim shape: ${plan.shapeLabel}`}
        />
        <StatGrid>
          <Stat label="Shape" value={plan.shapeLabel} testid="res-shape" />
          <Stat label="Absolutes" value={plan.absolutes.length} testid="res-absolutes" />
          <Stat label="Unquantified" value={plan.vague.length} testid="res-vague" />
        </StatGrid>
        <ul className="mt-3 space-y-2" data-testid="res-frames">
          {plan.frames.map((frame) => (
            <li key={frame.id}>
              <Notice>
                <span className="font-semibold">
                  {frame.label}
                  {frame.featured ? " · most relevant" : ""}
                </span>
                <span className="mt-1 block">{frame.prompt}</span>
              </Notice>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle>Claim checks</PanelTitle>
        {plan.checks.length === 0 ? (
          <Notice>
            No documented problem: the claim has a stated reason, no absolutes and no unquantified wording.
          </Notice>
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
        <PanelTitle>How to use an objection</PanelTitle>
        <ul className="space-y-2">
          {plan.checklist.map((item) => (
            <li key={item}>
              <Notice>{item}</Notice>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The ten moves are published argumentation patterns — boundary, counterexample, alternative cause and the
            rest — not objections about your particular subject. The tool orders them; the argument is yours.
          </Notice>
          <Notice tone="warn">
            Generating the strongest objection is only half the work. If none of the moves can be answered, the claim
            needs changing rather than defending.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
