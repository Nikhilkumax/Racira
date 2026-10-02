"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  EmptyState,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Select,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { bulletsToProse } from "@/domains/writing/lib/text/bullet-to-prose.ts";

const SHAPES = [
  { value: "paragraph", label: "One sentence per bullet" },
  { value: "single", label: "A single sentence" },
];

/**
 * Bullet to prose: bullets become a paragraph, or a single sentence when they
 * are short enough, with the awkward ones flagged.
 */
export default function BulletToProse() {
  const [text, setText] = useState("");
  const [shape, setShape] = useState("paragraph");
  const [connectors, setConnectors] = useState(false);

  const draft = useMemo(
    () => bulletsToProse(text, { shape: shape === "single" ? "single" : "paragraph", connectors }),
    [text, shape, connectors],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your list</PanelTitle>
        <TextArea
          name="text"
          label="Bullet list (one item per line)"
          value={text}
          onChange={setText}
          rows={7}
          placeholder={"- Draft the outline\n- Write the first section\n- Send the draft to the editor"}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select name="shape" label="Shape" value={shape} onChange={setShape} options={SHAPES} />
          <div className="flex items-end pb-2">
            <Checkbox
              name="connectors"
              label="Open the sentences with the connector sequence"
              checked={connectors}
              onChange={setConnectors}
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={draft.output ? <CopyButton text={draft.output} testid="copy-prose" /> : undefined}>
          Prose
        </PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState>Paste a bullet list — the paragraph is composed as you type.</EmptyState>
        ) : (
          <>
            <StatGrid>
              <Stat label="Bullets" value={draft.bullets.length} testid="res-bullets" />
              <Stat label="Sentences" value={draft.sentences} testid="res-sentences" />
              <Stat label="Shape" value={draft.shape === "single" ? "single sentence" : "paragraph"} testid="res-shape" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="prose" value={draft.output} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>What will not travel</PanelTitle>
        {draft.checks.length === 0 ? (
          <EmptyState>No bullet in this list is too long, too short or repeated.</EmptyState>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {draft.checks.map((check) => (
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
            Bullets are stripped of their markers and trailing punctuation, capitalised and joined. The connector
            sequence is fixed, and the single-sentence shape is offered only because short bullets survive it.
          </Notice>
          <Notice tone="warn">
            A bullet list carries emphasis that prose cannot: each item is visibly equal and separately scannable.
            Convert to prose only when the list is a draft problem rather than a reading aid.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
