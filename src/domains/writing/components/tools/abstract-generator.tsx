"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
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
  TextArea,
} from "./ui";
import { ABSTRACT_SECTIONS, buildAbstract } from "@/domains/writing/lib/text/abstract.ts";

const BANDS = [
  { value: "150-250", label: "150–250 words (journal abstract)" },
  { value: "100-150", label: "100–150 words (short note)" },
  { value: "250-350", label: "250–350 words (review article)" },
];

/**
 * Abstract generator: five labelled parts assembled in IMRaD order, with the
 * word band and the missing-parts checks reported.
 */
export default function AbstractGenerator() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [band, setBand] = useState("150-250");
  const [structured, setStructured] = useState(true);

  const [min, max] = band.split("-").map((value) => Number(value));
  const draft = useMemo(
    () => buildAbstract(values, { structured, min, max }),
    [values, structured, min, max],
  );

  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The five parts</PanelTitle>
        <div className="space-y-3">
          {ABSTRACT_SECTIONS.map((section) => (
            <TextArea
              key={section.id}
              name={section.id}
              label={section.label}
              value={values[section.id] ?? ""}
              onChange={set(section.id)}
              rows={section.id === "methods" || section.id === "results" ? 3 : 2}
              placeholder={section.hint}
            />
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select name="band" label="Word band" value={band} onChange={setBand} options={BANDS} />
          <div className="flex items-end pb-2">
            <Checkbox
              name="structured"
              label="Label each part"
              checked={structured}
              onChange={setStructured}
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={draft.output ? <CopyButton text={draft.output} testid="copy-abstract" /> : undefined}>
          Abstract
        </PanelTitle>
        <HeroStat
          label="Words"
          value={draft.words}
          testid="res-words"
          sub={`target ${draft.range.min}–${draft.range.max}`}
        />
        <StatGrid>
          <Stat label="Parts filled" value={`${draft.sections.filter((section) => section.text).length}/5`} testid="res-filled" />
          <Stat label="Checks" value={draft.checks.length} testid="res-checks-count" />
          <Stat label="Shape" value={draft.structured ? "structured" : "unstructured"} testid="res-shape" />
        </StatGrid>
        {draft.output ? (
          <>
            <div className="mt-3">
              <OutputBlock name="abstract" value={draft.output} mono={false} />
            </div>
            <div className="mt-3">
              <DownloadButton text={draft.output} filename="abstract.txt" testid="download-abstract" />
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Fill the objective and the methods to see the abstract take shape.
          </p>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No documented problem found: every part is filled, the results carry a figure and the length is inside the band.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {draft.checks.map((check) => (
              <li key={check.id}>
                <Notice tone={check.id === "missing-background" ? "warn" : "info"}>{check.message}</Notice>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The builder orders and labels your own sentences and checks what a rule can check: missing parts, results
            without figures, a conclusion heavier than the results, short methods and the total word band.
          </Notice>
          <Notice tone="warn">
            It cannot judge whether the study is sound or the conclusion justified. Those are the reviewer&apos;s
            questions, and the abstract is where they are first asked.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
