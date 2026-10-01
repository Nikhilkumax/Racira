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
  TextArea,
} from "./ui";
import { findStructure, type StructureId } from "@/domains/writing/lib/text/story-structure.ts";
import {
  buildPlotMap,
  parsePlotNotes,
  plotMapMarkdown,
  structureOptions,
} from "@/domains/writing/lib/text/plot-point-mapper.ts";

const SAMPLE = ["Hook: Mara alone on the pier before dawn.", "Inciting incident: the letter from the harbour master."].join(
  "\n",
);

/**
 * Plot point mapper: choose a named structure, then attach your story's own
 * event to each beat. The map reports how much of the structure is covered and
 * which beat comes next, and exports as a markdown outline.
 */
export default function PlotPointMapper() {
  const [structureId, setStructureId] = useState<StructureId>("three-act");
  const [notes, setNotes] = useState(SAMPLE);

  const structure = useMemo(() => findStructure(structureId), [structureId]);
  const map = useMemo(() => buildPlotMap(structureId, parsePlotNotes(notes)), [structureId, notes]);
  const markdown = useMemo(() => plotMapMarkdown(map), [map]);
  const options = useMemo(() => structureOptions(), []);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Structure</PanelTitle>
        <div className="max-w-md">
          <Select
            name="structure"
            label="Beat sheet"
            value={structureId}
            onChange={(value) => setStructureId(value as StructureId)}
            options={options.map((option) => ({ value: option.id, label: `${option.name} (${option.beats} beats)` }))}
            hint={structure.blurb}
          />
        </div>
        <div className="mt-3">
          <TextArea
            name="notes"
            label="Your events, one per line: Beat name: what happens"
            value={notes}
            onChange={setNotes}
            rows={8}
            placeholder={structure.beats.slice(0, 2).map((beat) => `${beat.name}: ...`).join("\n")}
            hint="beat names match the sheet below"
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          A line whose name does not match a beat is ignored, so keep the beat names as the sheet lists them.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Coverage</PanelTitle>
        <HeroStat
          label="Beats mapped"
          value={`${map.filled}/${map.total}`}
          testid="res-coverage"
          sub={`${map.coverage}% of ${map.structureName}`}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <p className="font-mono text-xs text-foreground">
            coverage: <span data-testid="res-percent">{map.coverage}%</span>
          </p>
          <p className="font-mono text-xs text-foreground">
            next open beat:{" "}
            <span data-testid="res-next">{map.nextOpen ? map.nextOpen.name : "none — the map is complete"}</span>
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>The sheet</PanelTitle>
        <ol data-testid="res-beats" className="space-y-2 text-sm">
          {map.points.map((point) => (
            <li key={point.beat.name} className="border-t border-border/60 pt-2 first:border-0 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-foreground">
                  {point.beat.name} <span className="font-mono text-xs text-muted-foreground">({point.beat.at}%)</span>
                </span>
                <span className={`font-mono text-[11px] ${point.filled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                  {point.filled ? "mapped" : "open"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{point.note || point.beat.summary}</p>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <span className="flex items-center gap-2">
              <CopyButton text={markdown} testid="copy-map" label="Copy" />
              <DownloadButton text={markdown} filename="plot-map.md" testid="download-map" label="Download" />
            </span>
          }
        >
          Map as markdown
        </PanelTitle>
        <OutputBlock name="map" value={markdown} maxHeight={300} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The beats and their percentages are the conventional placements from the structures named — the three-act and
            four-act shapes, Save the Cat&rsquo;s fifteen beats and the hero&rsquo;s journey&rsquo;s twelve stages. They are
            guidance from those traditions, not rules.
          </Notice>
          <Notice tone="warn">
            Placement is not stored: the map reports which beats have a note, not where your drafted pages actually land.
            It does not read your manuscript or judge whether a structure suits your story; the notes are yours.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
