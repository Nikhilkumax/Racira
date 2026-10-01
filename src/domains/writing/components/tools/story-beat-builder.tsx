"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  Checkbox,
  CopyButton,
  DownloadButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  ProgressBar,
  Select,
  StackLayout,
} from "./ui";
import { findStructure, type StructureId } from "@/domains/writing/lib/text/story-structure.ts";
import { beatProgress, beatReport, beatRows } from "@/domains/writing/lib/text/story-beats.ts";

/**
 * Story beat builder: a progress board for a chosen structure. Tick the beats
 * you have drafted and the tool reports how far through the structure you are
 * and which beat comes next, then exports the whole sheet with its ticks.
 */
export default function StoryBeatBuilder() {
  const [structureId, setStructureId] = useState<StructureId>("three-act");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const structure = useMemo(() => findStructure(structureId), [structureId]);
  const doneNames = useMemo(
    () => structure.beats.filter((beat) => done[beat.name]).map((beat) => beat.name),
    [structure, done],
  );
  const rows = useMemo(() => beatRows(structureId, doneNames), [structureId, doneNames]);
  const progress = useMemo(() => beatProgress(rows), [rows]);
  const report = useMemo(() => beatReport(structureId, doneNames), [structureId, doneNames]);

  const toggle = (name: string, checked: boolean) => setDone((previous) => ({ ...previous, [name]: checked }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Beat sheet</PanelTitle>
        <div className="max-w-md">
          <Select
            name="structure"
            label="Structure"
            value={structureId}
            onChange={(value) => {
              setStructureId(value as StructureId);
              setDone({});
            }}
            options={[
              { value: "three-act", label: "Three-act structure (7 beats)" },
              { value: "four-act", label: "Four-act structure (5 beats)" },
              { value: "save-the-cat", label: "Save the Cat (15 beats)" },
              { value: "hero-journey", label: "Hero's journey (12 stages)" },
            ]}
            hint={structure.blurb}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Tick each beat once its scene or chapter is drafted. The tracker resets when you switch sheets, because the
          beats change with the structure.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Progress</PanelTitle>
        <HeroStat label="Beats drafted" value={`${progress.done}/${progress.total}`} testid="res-progress" sub={`${progress.percent}% of the sheet`} />
        <ProgressBar value={progress.percent} testid="res-bar" />
        <p className="mt-3 font-mono text-xs text-foreground">
          next:{" "}
          <span data-testid="res-next">{progress.next ? `${progress.next.name} (${progress.next.at}%)` : "all beats drafted"}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Btn kind="ghost" testid="btn-all" onClick={() => setDone(Object.fromEntries(structure.beats.map((beat) => [beat.name, true])))}>
            Mark all drafted
          </Btn>
          <Btn kind="ghost" testid="btn-none" onClick={() => setDone({})}>
            Clear ticks
          </Btn>
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">{structure.name}</span>}>
          Beats
        </PanelTitle>
        <ul data-testid="res-beats" className="space-y-2">
          {rows.map((row, index) => (
            <li key={row.name} className="border-t border-border/60 pt-2 first:border-0 first:pt-0">
              <Checkbox
                name={`beat-${index + 1}`}
                label={`${row.name} · ${row.at}%`}
                checked={row.done}
                onChange={(checked) => toggle(row.name, checked)}
              />
              <p className="mt-0.5 pl-5 text-xs text-muted-foreground">{row.summary}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <span className="flex items-center gap-2">
              <CopyButton text={report} testid="copy-sheet" label="Copy" />
              <DownloadButton text={report} filename="beat-sheet.txt" testid="download-sheet" label="Download" />
            </span>
          }
        >
          Drafted sheet
        </PanelTitle>
        <OutputBlock name="sheet" value={report} maxHeight={320} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Each structure carries the beats and typical placements from the tradition it names. Ticking a beat records
            your own judgement that it is drafted; the tool never infers progress from a manuscript.
          </Notice>
          <Notice tone="warn">
            Ticks are kept only in this browser and are reset when you change structure. There is no account, no upload
            and no sync between devices, so download the sheet if you want to keep it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
