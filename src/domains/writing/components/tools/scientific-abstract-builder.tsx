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
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { ABSTRACT_ROLES, buildScientificAbstract } from "@/domains/writing/lib/text/scientific-abstract.ts";

/**
 * Scientific abstract builder: five roles assembled and each one checked for
 * what it has to contain.
 */
export default function ScientificAbstractBuilder() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [labelled, setLabelled] = useState(true);

  const draft = useMemo(() => buildScientificAbstract(values), [values]);
  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));
  const text = labelled ? draft.output : draft.continuous;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The five roles</PanelTitle>
        <div className="space-y-3">
          {ABSTRACT_ROLES.map((role) => (
            <TextArea
              key={role.id}
              name={role.id}
              label={role.label}
              value={values[role.id] ?? ""}
              onChange={set(role.id)}
              rows={role.id === "results" || role.id === "implication" ? 3 : 2}
              placeholder={role.hint}
            />
          ))}
        </div>
        <div className="mt-3">
          <Checkbox name="labelled" label="Label each role" checked={labelled} onChange={setLabelled} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={text ? <CopyButton text={text} testid="copy-abstract" /> : undefined}>
          Abstract
        </PanelTitle>
        <HeroStat
          label="Words"
          value={draft.words}
          testid="res-words"
          sub={`usual band ${draft.range.min}–${draft.range.max}`}
        />
        <StatGrid>
          <Stat
            label="Roles filled"
            value={`${draft.parts.filter((part) => part.text).length}/5`}
            testid="res-filled"
          />
          <Stat label="Checks" value={draft.checks.length} testid="res-checks-count" />
          <Stat label="Shape" value={labelled ? "labelled" : "continuous"} testid="res-shape" />
        </StatGrid>
        {text ? (
          <>
            <div className="mt-3">
              <OutputBlock name="abstract" value={text} mono={false} />
            </div>
            <div className="mt-3">
              <DownloadButton text={text} filename="scientific-abstract.txt" testid="download-abstract" />
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Fill the context and the gap to see the abstract take shape.
          </p>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Role checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>
            No documented problem found: every role is filled, the gap states what is unknown, the results carry a
            figure and the implication draws a consequence.
          </Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {draft.checks.map((check) => (
              <li key={check.id}>
                <Notice tone={check.level === "warn" ? "warn" : "info"}>
                  <span className="font-semibold">{check.role}: </span>
                  {check.message}
                </Notice>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Each role is checked against a published marker list: a gap has to say what is not known, an approach has
            to name a design or sample, results have to carry a figure, and an implication has to draw a consequence.
          </Notice>
          <Notice tone="warn">
            The checks judge the sentences&apos; roles, not the study. Whether the sample is adequate and the
            conclusion follows from the results are the reviewer&apos;s questions.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
