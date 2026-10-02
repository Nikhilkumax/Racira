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
  TextInput,
} from "./ui";
import { generateEndings } from "@/domains/writing/lib/text/ending-generator.ts";

/**
 * Ending generator: the six verdicts an ending can deliver, each one drafted
 * against the story's own want and obstacle so the writer can compare what each
 * shape promises and what it asks of the setup.
 */
export default function EndingGenerator() {
  const [protagonist, setProtagonist] = useState("");
  const [want, setWant] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [turn, setTurn] = useState("");

  const result = useMemo(
    () => generateEndings({ protagonist, want, obstacle, turn }),
    [protagonist, want, obstacle, turn],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">drafted locally</span>}>
          The story
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            name="protagonist"
            label="Protagonist"
            value={protagonist}
            onChange={setProtagonist}
            placeholder="Mara"
          />
          <TextInput
            name="want"
            label="What they want"
            value={want}
            onChange={setWant}
            placeholder="keep the farm solvent through the winter"
          />
          <TextInput
            name="obstacle"
            label="What pushes back"
            value={obstacle}
            onChange={setObstacle}
            placeholder="the bank's new manager"
          />
          <TextInput
            name="turn"
            label="What changes by the end"
            value={turn}
            onChange={setTurn}
            placeholder="the recognition that she no longer wants the farm, only the fight"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton text={result.output} testid="copy-endings" label="Copy endings" />
              <DownloadButton text={result.output} filename="endings.txt" testid="download-endings" label="Download" />
            </div>
          }
        >
          Endings
        </PanelTitle>
        <HeroStat
          label="Shapes drafted"
          value={result.ideas.length}
          testid="res-ideas"
          sub={result.ideas.length > 0 ? "each one answers the same want and obstacle" : "name a want and an obstacle"}
        />
        {result.ideas.length > 0 && (
          <div className="space-y-2">
            {result.ideas.map((idea, index) => (
              <div key={idea.id} data-testid={`res-idea-${index}`} className="rounded-lg border border-border bg-card/40 px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  {index + 1}. {idea.name}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{idea.text}</p>
                <p className="mt-2 text-xs italic text-muted-foreground">Requires: {idea.requires}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <OutputBlock name="endings" value={result.output} mono={false} maxHeight={280} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {result.checks.length === 0 ? (
          <Notice>
            The want and the obstacle are both named, so each shape has a verdict to deliver, and the change the story
            earns is written into the shapes that turn on it.
          </Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {result.checks.map((check) => (
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
            The six shapes are the distinct verdicts available: the want won at a price, revealed as the problem,
            abandoned at the threshold, defeated by the protagonist&apos;s own method, survived, or returned to
            changed. Each idea names what the shape asks of the setup.
          </Notice>
          <Notice tone="warn">
            These are drafts to argue with, not a replacement for drafting the scene. The test of an ending is whether
            the story earned it — check that the required setup is already on the page before you commit.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
