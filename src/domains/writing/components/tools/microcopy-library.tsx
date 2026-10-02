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
  TextInput,
} from "./ui";
import { MICROCOPY_TONES, buildMicrocopy } from "@/domains/writing/lib/text/microcopy.ts";

const TONE_OPTIONS = MICROCOPY_TONES.map((tone) => ({ value: tone.id, label: tone.label }));

/**
 * Microcopy library: the twelve interface slots every product writes and
 * rewrites, drafted from four inputs and checked against the published UX
 * writing guidance.
 */
export default function MicrocopyLibrary() {
  const [product, setProduct] = useState("");
  const [action, setAction] = useState("");
  const [object, setObject] = useState("");
  const [tone, setTone] = useState("neutral");

  const set = useMemo(
    () => buildMicrocopy({ product, action, object, tone }),
    [product, action, object, tone],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The product&apos;s action</PanelTitle>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="product" label="Product name" value={product} onChange={setProduct} placeholder="Meridian" />
            <TextInput name="object" label="The thing being acted on" value={object} onChange={setObject} placeholder="report" />
          </div>
          <TextInput
            name="action"
            label="What the reader is trying to do"
            value={action}
            onChange={setAction}
            placeholder="create a report"
          />
          <Select name="tone" label="Register" value={tone} onChange={setTone} options={TONE_OPTIONS} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={set.output ? <CopyButton text={set.output} testid="copy-library" /> : undefined}>
          The twelve slots
        </PanelTitle>
        <HeroStat
          label="Slots"
          value={set.slots.length}
          testid="res-slots"
          sub={`${MICROCOPY_TONES.find((entry) => entry.id === tone)?.label ?? "Neutral"} register`}
        />
        <StatGrid>
          <Stat label="Checks" value={set.checks.length} testid="res-checks-count" />
          <Stat label="Register" value={MICROCOPY_TONES.find((entry) => entry.id === tone)?.label ?? "Neutral"} testid="res-tone" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="library" value={set.output} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={set.output} filename="microcopy.txt" testid="download-library" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {set.checks.length === 0 ? (
          <Notice>No documented problem: short button labels, no jargon, no blaming wording and a register that stays in character.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {set.checks.map((check) => (
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
            Each slot is drafted from the action you name, in the register you choose, so the copy is specific rather
            than generic: the button says what it does, the empty state says what will appear, and the error says what
            failed.
          </Notice>
          <Notice tone="warn">
            The drafts are starting points, not final copy. They cannot know your error cases, your permissions or your
            brand&apos;s exceptions, and the checks are published guidance rather than rules.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
