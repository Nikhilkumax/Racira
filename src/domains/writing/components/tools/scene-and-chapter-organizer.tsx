"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  useStoredState,
} from "./ui";
import {
  parseScenes,
  parseScenesJson,
  sceneStats,
  scenesToMarkdown,
  serializeScenes,
} from "@/domains/writing/lib/text/scene-organizer.ts";

const SAMPLE = [
  "The pier | Mara | Harbour | 1200",
  "The letter | Mara | Kitchen | 800",
  "The chase | Dev | Rooftops | 2000",
  "The return | Mara | Harbour | 1500",
].join("\n");

const KEY = "racira.writing.scenes.board";

/**
 * Scene and chapter organizer: a scene board entered as `Title | POV | Setting |
 * Words`, with the statistics a novel actually needs — how the words distribute
 * across scenes and points of view, and which scenes are the outliers. The board
 * is kept in this browser and exports to JSON.
 */
export default function SceneAndChapterOrganizer() {
  const [source, setSource] = useState(SAMPLE);
  const [board, setBoard] = useStoredState<string>(KEY, "");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const scenes = useMemo(() => (board ? parseScenes(board) : parseScenes(source)), [board, source]);
  const stats = useMemo(() => sceneStats(scenes), [scenes]);
  const markdown = useMemo(() => scenesToMarkdown(scenes), [scenes]);
  const exported = useMemo(() => serializeScenes(scenes), [scenes]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">one scene per line</span>}>
          Scene board
        </PanelTitle>
        <TextArea
          name="scenes"
          label="Title | POV | Setting | Words"
          value={source}
          onChange={setSource}
          rows={12}
          placeholder={"The pier | Mara | Harbour | 1200\nThe letter | Mara | Kitchen | 800"}
          hint="the last three fields are optional"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Btn testid="btn-save" onClick={() => setBoard(source)}>
            Save this board in the browser
          </Btn>
          <Btn kind="ghost" testid="btn-clear" onClick={() => setBoard("")}>
            Clear saved board
          </Btn>
          {board && <span className="text-xs text-muted-foreground">showing the saved board</span>}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Shape of the story</PanelTitle>
        {stats.scenes === 0 ? (
          <EmptyState>Add a scene line above — the stats update as you type.</EmptyState>
        ) : (
          <>
            <HeroStat label="Scenes" value={stats.scenes} testid="res-scenes" sub={`${stats.words} words across the board`} />
            <StatGrid>
              <Stat label="Total words" value={stats.words} testid="res-words" />
              <Stat label="Average scene" value={stats.averageWords} testid="res-average" />
              <Stat label="Median scene" value={stats.medianWords} testid="res-median" />
              <Stat label="Settings" value={stats.settings} testid="res-settings" />
            </StatGrid>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Longest</p>
                <p data-testid="res-longest" className="font-mono text-xs text-foreground">
                  {stats.longest?.title} · {stats.longest?.words} words
                </p>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Shortest</p>
                <p data-testid="res-shortest" className="font-mono text-xs text-foreground">
                  {stats.shortest?.title} · {stats.shortest?.words} words
                </p>
              </div>
            </div>
          </>
        )}
      </Panel>

      {stats.povs.length > 0 && (
        <Panel>
          <PanelTitle>Point of view</PanelTitle>
          <ul data-testid="res-povs" className="space-y-1 text-sm">
            {stats.povs.map((pov) => (
              <li key={pov.name} className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-1 first:border-0 first:pt-0">
                <span className="text-foreground">{pov.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {pov.scenes} scene{pov.scenes === 1 ? "" : "s"} · {pov.words} words
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {stats.scenes > 0 && (
        <Panel>
          <PanelTitle right={<CopyButton text={markdown} testid="copy-board" label="Copy board" />}>
            Board as markdown
          </PanelTitle>
          <OutputBlock name="board" value={markdown} maxHeight={320} mono={false} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DownloadButton text={markdown} filename="scene-board.md" testid="download-board" label="Download board" />
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle right={<CopyButton text={exported} testid="copy-export" label="Copy JSON" />}>
          Export and import
        </PanelTitle>
        <OutputBlock name="export" value={exported} maxHeight={160} />
        <div className="mt-4">
          <TextArea
            name="import"
            label="Import a JSON board"
            value={importText}
            onChange={(value) => {
              setImportText(value);
              setImportError(null);
            }}
            rows={4}
            placeholder='[{"title":"The pier","pov":"Mara","setting":"Harbour","words":1200}]'
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Btn
              testid="btn-import"
              onClick={() => {
                const parsed = parseScenesJson(importText);
                if (!parsed.ok) {
                  setImportError(parsed.error);
                  return;
                }
                setBoard(parsed.scenes.map((scene) => [scene.title, scene.pov ?? "", scene.setting ?? "", scene.words ?? ""].join(" | ")).join("\n"));
                setImportError(null);
              }}
            >
              Replace the board with this list
            </Btn>
          </div>
          {importError && (
            <p data-testid="res-import-error" className="mt-2 text-xs text-destructive">
              {importError}
            </p>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Word counts come from the numbers you enter; a scene with no count contributes zero, so fill the fourth field
            for a meaningful total. Points of view are grouped by the name you type, so spell them consistently.
          </Notice>
          <Notice tone="warn">
            This is a planning board, not a manuscript: it does not import a Scrivener project, does not read your draft
            to count scenes, and cannot detect continuity problems. The board lives in this browser and in whatever you
            copy or download.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
