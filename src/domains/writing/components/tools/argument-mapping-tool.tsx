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
  Stat,
  StatGrid,
  TextArea,
  TextInput,
} from "./ui";
import {
  argumentChecks,
  argumentCompleteness,
  argumentMarkdown,
  argumentReport,
  type ArgumentMap,
  type ArgumentReason,
} from "@/domains/writing/lib/text/argument-map.ts";

const SAMPLE = [
  "it blurs rest | two studies on recovery | rest needs separation from work",
  "it hides the cost | a survey of office use | the budget only shows what is bought",
].join("\n");

/** Parse `reason | evidence | warrant` lines into the map's reasons. */
function parseReasons(text: string): ArgumentReason[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [reason = "", evidence = "", warrant = ""] = line.split("|").map((part) => part.trim());
      return { reason, evidence, warrant };
    });
}

/**
 * Argument mapping tool: lay an argument out as a claim, the reasons behind it
 * and, for each reason, the evidence and the warrant that connects the evidence
 * to the claim. Writing the warrant is how an unstated step becomes visible.
 */
export default function ArgumentMappingTool() {
  const [claim, setClaim] = useState("");
  const [reasonsText, setReasonsText] = useState(SAMPLE);
  const [objection, setObjection] = useState("");
  const [rebuttal, setRebuttal] = useState("");

  const map = useMemo<ArgumentMap>(() => ({ claim, reasons: parseReasons(reasonsText), objection, rebuttal }), [claim, reasonsText, objection, rebuttal]);
  const completeness = useMemo(() => argumentCompleteness(map), [map]);
  const checks = useMemo(() => argumentChecks(map), [map]);
  const markdown = useMemo(() => argumentMarkdown(map), [map]);
  const report = useMemo(() => argumentReport(map), [map]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Claim</PanelTitle>
        <TextInput name="claim" label="What the argument claims" value={claim} onChange={setClaim} placeholder="Remote work should be limited" />
      </Panel>

      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">reason | evidence | warrant</span>}>
          Reasons
        </PanelTitle>
        <TextArea
          name="reasons"
          label="One reason per line, with its evidence and the warrant that links them"
          value={reasonsText}
          onChange={setReasonsText}
          rows={8}
          placeholder={"it blurs rest | two studies on recovery | rest needs separation from work"}
          hint="the warrant is the step people leave out"
        />
      </Panel>

      <Panel>
        <PanelTitle>Objection and rebuttal</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextArea name="objection" label="The strongest objection" value={objection} onChange={setObjection} rows={3} placeholder="some roles need to be in person" />
          <TextArea name="rebuttal" label="Your answer to it" value={rebuttal} onChange={setRebuttal} rows={3} placeholder="those roles are a small minority and can be named" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Shape</PanelTitle>
        <HeroStat
          label="Parts completed"
          value={`${completeness.filled}/${completeness.total}`}
          testid="res-completeness"
          sub={`${completeness.reasons} reason(s)`}
        />
        <StatGrid>
          <Stat label="With evidence" value={completeness.evidenced} testid="res-evidenced" />
          <Stat label="With a warrant" value={completeness.warranted} testid="res-warranted" />
        </StatGrid>
        {checks.length > 0 && (
          <ul data-testid="res-checks" className="mt-3 space-y-2">
            {checks.map((check) => (
              <li key={check} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                {check}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <span className="flex items-center gap-2">
              <CopyButton text={markdown} testid="copy-map" label="Copy map" />
              <DownloadButton text={report} filename="argument-map.md" testid="download-map" label="Download" />
            </span>
          }
        >
          Argument map
        </PanelTitle>
        <OutputBlock name="map" value={markdown} maxHeight={320} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The checks are structural: at least two reasons, evidence for each, a warrant for each, an objection named and
            answered. They say what is missing, not whether the reasoning is sound.
          </Notice>
          <Notice tone="warn">
            The tool does not judge an argument&rsquo;s validity — that is the work of logic, not a text field. It lays the
            parts out so the gap between a reason and a claim, usually the unstated warrant, is in front of you.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
