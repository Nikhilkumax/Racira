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
  TextInput,
} from "./ui";
import { buildThesis, thesisChecks, thesisReport, type ThesisParts } from "@/domains/writing/lib/text/thesis.ts";

/**
 * Thesis statement builder: assemble a thesis from a topic, a position and the
 * reasons behind it, then read the mechanical checks — hedges that soften the
 * claim, vague words, and a length that has become a paragraph.
 */
export default function ThesisStatementBuilder() {
  const [topic, setTopic] = useState("");
  const [position, setPosition] = useState("");
  const [reasonsText, setReasonsText] = useState("");

  const parts = useMemo<ThesisParts>(
    () => ({ topic, position, reasons: reasonsText.split("\n").map((line) => line.trim()).filter(Boolean) }),
    [topic, position, reasonsText],
  );
  const thesis = useMemo(() => buildThesis(parts), [parts]);
  const checks = useMemo(() => thesisChecks(parts, thesis), [parts, thesis]);
  const report = useMemo(() => thesisReport(parts), [parts]);
  const hasParts = topic.trim().length > 0 || position.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The parts</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="topic" label="Topic" value={topic} onChange={setTopic} placeholder="remote work" />
          <TextInput name="position" label="Position (a verb makes it a claim)" value={position} onChange={setPosition} placeholder="should be limited" />
        </div>
        <div className="mt-3">
          <TextArea
            name="reasons"
            label="Reasons — one per line"
            value={reasonsText}
            onChange={setReasonsText}
            rows={4}
            placeholder={"it blurs the line between rest and work\nit hides the cost of an office from the budget"}
            hint="optional, but a thesis is stronger with them"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={hasParts ? <CopyButton text={thesis} testid="copy-thesis" label="Copy" /> : undefined}>
          Thesis
        </PanelTitle>
        {!hasParts ? (
          <HeroStat label="Thesis" value="—" testid="res-empty" sub="fill in a topic and a position" />
        ) : (
          <>
            <HeroStat label="Words" value={thesis.split(/\s+/).filter(Boolean).length} testid="res-words" sub="aim for one sentence" />
            <OutputBlock name="thesis" value={thesis} maxHeight={160} mono={false} />
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {checks.length === 0 ? (
          <Notice>No mechanical issues found. Whether the claim is true is still the essay&rsquo;s job to argue.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {checks.map((check) => (
              <li key={check.id} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                {check.note}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {hasParts && (
        <Panel>
          <PanelTitle right={<DownloadButton text={report} filename="thesis.txt" testid="download-report" label="Download" />}>
            Report
          </PanelTitle>
          <OutputBlock name="report" value={report} maxHeight={220} mono={false} />
        </Panel>
      )}

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The builder assembles the sentence from your parts and checks it for hedges, vague words and length. Those
            checks are about the wording, not the idea; a thesis can pass every one and still be unprovable.
          </Notice>
          <Notice tone="warn">
            It does not know your discipline&rsquo;s conventions — some fields expect a roadmap sentence and others a single
            claim — and it writes no supporting paragraph. The thesis is yours; the tool just makes its shape visible.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
