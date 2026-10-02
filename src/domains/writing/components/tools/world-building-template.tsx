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
  Stat,
  StatGrid,
  StackLayout,
  TextArea,
  TextInput,
} from "./ui";
import { buildWorldBible } from "@/domains/writing/lib/text/world-building.ts";

/**
 * World building template: one slot per question a story asks of its setting,
 * assembled into a world bible with the gaps named.
 */
export default function WorldBuildingTemplate() {
  const [name, setName] = useState("");
  const [premise, setPremise] = useState("");
  const [geography, setGeography] = useState("");
  const [culture, setCulture] = useState("");
  const [politics, setPolitics] = useState("");
  const [economy, setEconomy] = useState("");
  const [rules, setRules] = useState("");
  const [history, setHistory] = useState("");
  const [conflicts, setConflicts] = useState("");

  const draft = useMemo(
    () =>
      buildWorldBible({
        name,
        premise,
        geography,
        culture,
        politics,
        economy,
        rules,
        history,
        conflicts,
      }),
    [name, premise, geography, culture, politics, economy, rules, history, conflicts],
  );
  const hasParts = name.trim().length > 0 || premise.trim().length > 0 || draft.filled > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">one paragraph per question</span>}>
          The world
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="name" label="World name" value={name} onChange={setName} placeholder="Vess" />
          <TextInput name="premise" label="Premise — one line" value={premise} onChange={setPremise} placeholder="A river town that floods on the same day each year" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea name="geography" label="Geography — what the land does to the people" value={geography} onChange={setGeography} rows={2} placeholder="Built on two banks that slowly trade places." />
          <TextArea name="culture" label="Culture — what they believe, celebrate and forbid" value={culture} onChange={setCulture} rows={2} placeholder="Flood week is a festival and a reckoning." />
          <TextArea name="politics" label="Politics — who holds power, and what they fear losing" value={politics} onChange={setPolitics} rows={2} placeholder="The dam council holds every seat and every grudge." />
          <TextArea name="economy" label="Economy — what is scarce, and who profits" value={economy} onChange={setEconomy} rows={2} placeholder="Boat repair, insurance and smuggled grain." />
          <TextArea name="rules" label="Rules of magic or technology — what is possible, at what cost" value={rules} onChange={setRules} rows={2} placeholder="The flood is predictable to the hour and never to the metre." />
          <TextArea name="history" label="History — what everyone still argues about" value={history} onChange={setHistory} rows={2} placeholder="The old town is under the reservoir and still on the maps." />
          <TextArea name="conflicts" label="Conflicts — which two forces cannot both win" value={conflicts} onChange={setConflicts} rows={2} placeholder="The council needs the dam; the lower town needs it open." />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.bible} testid="copy-bible" label="Copy" />
                <DownloadButton text={draft.bible} filename="world-bible.txt" testid="download-bible" label="Download" />
              </span>
            ) : undefined
          }
        >
          World bible
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Name the world and answer a question or two — the bible assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="the bible as it stands" />
            <StatGrid>
              <Stat label="Areas filled" value={`${draft.filled}/${draft.total}`} testid="res-filled" />
              <Stat label="Problems" value={draft.checks.length} testid="res-problems" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="bible" value={draft.bible} maxHeight={460} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the world is interesting is still the writing&rsquo;s proof.</Notice>
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
            The template asks the seven questions a story will ask of its setting and assembles the answers. It invents
            no world and judges no detail.
          </Notice>
          <Notice tone="warn">
            A bible is a reference for the story, not the story. Keep each entry to a paragraph and let the draft add
            what the plot forces you to decide; details that never touch the page are worldbuilding for its own sake.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
