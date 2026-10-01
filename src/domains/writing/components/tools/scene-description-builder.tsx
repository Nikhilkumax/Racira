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
  TextArea,
} from "./ui";
import {
  DESCRIPTION_PROMPTS,
  buildDescription,
  descriptionReport,
  filterWords,
  type DescriptionFields,
} from "@/domains/writing/lib/text/scene-description.ts";

const EMPTY: DescriptionFields = {};

/**
 * Scene description builder: answer a set of prompts about a place — light,
 * weather, sound, smell, texture, mood — and get a consistent note sheet plus a
 * check for the perception verbs that keep a reader at arm's length.
 */
export default function SceneDescriptionBuilder() {
  const [fields, setFields] = useState<DescriptionFields>(EMPTY);
  const [passage, setPassage] = useState("");

  const result = useMemo(() => buildDescription(fields), [fields]);
  const hits = useMemo(() => filterWords(passage), [passage]);
  const report = useMemo(() => descriptionReport(fields, passage), [fields, passage]);

  const set = (key: keyof DescriptionFields) => (value: string) => setFields((previous) => ({ ...previous, [key]: value }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>What is here</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {DESCRIPTION_PROMPTS.map((prompt) => (
            <TextArea
              key={prompt.key}
              name={prompt.key}
              label={prompt.label}
              value={fields[prompt.key] ?? ""}
              onChange={set(prompt.key)}
              rows={2}
              placeholder={prompt.prompt}
            />
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Your description notes</PanelTitle>
        <HeroStat
          label="Fields filled"
          value={`${result.filled}/${result.total}`}
          testid="res-coverage"
          sub={`${result.coverage}% of the prompts answered`}
        />
        {result.missing.length > 0 && (
          <p className="mb-3 text-xs text-muted-foreground">
            Still open:{" "}
            <span data-testid="res-missing" className="font-mono text-foreground">
              {result.missing.join(", ")}
            </span>
          </p>
        )}
        <OutputBlock name="sheet" value={result.text || "(no fields filled yet)"} maxHeight={280} mono={false} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={result.text} testid="copy-sheet" label="Copy notes" />
          <DownloadButton text={report} filename="scene-description.txt" testid="download-sheet" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Filter-word check</PanelTitle>
        <TextArea
          name="passage"
          label="Paste the passage you wrote from these notes"
          value={passage}
          onChange={setPassage}
          rows={8}
          placeholder="I saw the boat slip out of the harbour and heard the gulls turn."
          hint="optional — checks for saw, heard, felt, noticed…"
        />
        <div className="mt-3">
          {hits.length === 0 ? (
            <Notice>No perception verbs found. That does not make a passage good, only free of this one habit.</Notice>
          ) : (
            <ul data-testid="res-filter" className="space-y-1 text-sm">
              {hits.map((hit) => (
                <li key={hit.word} className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-foreground">{hit.word}</span>
                  <span className="font-mono text-xs text-muted-foreground">×{hit.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The builder does not write prose. It lists what you noticed, field by field, so the details are decided
            before the paragraph is written — which is the part that is easy to skip and expensive to skip.
          </Notice>
          <Notice tone="warn">
            The filter-word check is a mechanical list of perception verbs, not a style rule: a sentence that needs
            &ldquo;saw&rdquo; is allowed to have it. Nothing is uploaded, and the notes live only in this tab.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
