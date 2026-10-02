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
  Stat,
  StatGrid,
  StackLayout,
  TextArea,
  TextInput,
} from "./ui";
import { planPlot } from "@/domains/writing/lib/text/plot-planner.ts";
import { STRUCTURES } from "@/domains/writing/lib/text/story-structure.ts";

/**
 * Plot structure planner: the premise's four load-bearing facts are mapped onto
 * the beats where a reader expects them, on whichever structure the writer
 * chooses, so the plan is a full beat sheet rather than a blank one.
 */
export default function PlotStructurePlanner() {
  const [logline, setLogline] = useState("");
  const [protagonist, setProtagonist] = useState("");
  const [goal, setGoal] = useState("");
  const [conflict, setConflict] = useState("");
  const [stakes, setStakes] = useState("");
  const [structure, setStructure] = useState("three-act");

  const plan = useMemo(
    () => planPlot({ logline, protagonist, goal, conflict, stakes, structure }),
    [logline, protagonist, goal, conflict, stakes, structure],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">nothing leaves this page</span>}>
          The premise
        </PanelTitle>
        <div className="space-y-3">
          <TextArea
            name="logline"
            label="Logline"
            value={logline}
            onChange={setLogline}
            rows={3}
            placeholder="A debt collector must return a house to the family she took it from before the bank sells it twice."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              name="protagonist"
              label="Protagonist"
              value={protagonist}
              onChange={setProtagonist}
              placeholder="A debt collector working the same routes for nine years."
            />
            <TextInput
              name="goal"
              label="Goal"
              value={goal}
              onChange={setGoal}
              placeholder="Return the house before the sale goes through."
            />
            <TextInput
              name="conflict"
              label="Conflict"
              value={conflict}
              onChange={setConflict}
              placeholder="The bank that pays her salary wants the sale to close."
            />
            <TextInput
              name="stakes"
              label="Stakes"
              value={stakes}
              onChange={setStakes}
              placeholder="If the sale closes, the family joins the waiting list she administers."
            />
          </div>
          <Select
            name="structure"
            label="Structure"
            value={structure}
            onChange={setStructure}
            options={STRUCTURES.map((item) => ({ value: item.id, label: `${item.name} — ${item.beats.length} beats` }))}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton text={plan.output} testid="copy-plan" label="Copy plan" />
              <DownloadButton text={plan.output} filename="plot-plan.txt" testid="download-plan" label="Download" />
            </div>
          }
        >
          The plan
        </PanelTitle>
        <HeroStat
          label="Beats"
          value={plan.stats.beats}
          testid="res-beats"
          sub={`${plan.structure.name}, with four facts placed`}
        />
        <StatGrid>
          <Stat label="Facts anchored" value={plan.stats.anchored} testid="res-anchored" />
          <Stat label="Facts placed" value={plan.stats.filled} testid="res-filled" />
          <Stat label="Premise words" value={plan.stats.words} testid="res-words" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="plan" value={plan.output} mono={false} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Beat by beat</PanelTitle>
        <div className="space-y-2">
          {plan.points.map((point) => (
            <div
              key={`${point.index}-${point.beat}`}
              data-testid={`res-beat-${point.index}`}
              className="rounded-lg border border-border bg-card/40 px-3 py-2"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {point.index + 1}. {point.beat}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{point.at}%</span>
              </div>
              {point.text ? (
                <p className="mt-1 text-sm leading-relaxed text-foreground">{point.text}</p>
              ) : (
                <p className="mt-1 text-sm italic leading-relaxed text-muted-foreground">
                  {point.anchor ? `to decide: ${point.summary}` : point.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {plan.checks.length === 0 ? (
          <Notice>
            All four facts are named and the logline is long enough to plan against; every beat below the facts keeps
            its own prompt from the structure.
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
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The four anchors are the facts a premise needs — who it is about, what they want, what pushes back and what
            it costs. Each one is matched to the nearest beat of the chosen structure so the plan reads in order.
          </Notice>
          <Notice tone="warn">
            The planner arranges what you already know; it does not invent subplots, characters or scenes. The beats
            between the anchors are prompts, and a plan is not a draft — expect the story to argue with it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
