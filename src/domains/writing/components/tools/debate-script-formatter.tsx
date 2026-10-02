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
  TextArea,
} from "./ui";
import { DEBATE_FORMATS, formatDebateScript } from "@/domains/writing/lib/text/debate-script.ts";

const FORMAT_OPTIONS = DEBATE_FORMATS.map((format) => ({ value: format.id, label: format.label }));

/**
 * Debate script formatter: places one case line per speech into the chosen
 * speaking order, with time allocations and the round's missing pieces named.
 */
export default function DebateScriptFormatter() {
  const [format, setFormat] = useState(DEBATE_FORMATS[0].id);
  const [text, setText] = useState("");

  const script = useMemo(() => formatDebateScript(text, format), [text, format]);
  const filled = script.speeches.filter((speech) => speech.filled).length;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The round</PanelTitle>
        <div className="mb-3">
          <Select name="format" label="Format" value={format} onChange={setFormat} options={FORMAT_OPTIONS} />
        </div>
        <TextArea
          name="text"
          label="One line per speech: role | what the speech establishes"
          value={text}
          onChange={setText}
          rows={8}
          placeholder={"PM | Zoning reform is the fastest route to affordable housing because supply cannot expand.\nLO | Rent controls protect sitting tenants from displacement while new supply is built."}
          hint="PM, OG2, Prime Minister and similar labels all work."
        />
      </Panel>

      <Panel>
        <PanelTitle right={script.script ? <CopyButton text={script.script} testid="copy-script" /> : undefined}>
          Script
        </PanelTitle>
        <HeroStat label="Speaking time" value={`${script.totalMinutes} min`} testid="res-minutes" sub={script.formatLabel} />
        <StatGrid>
          <Stat label="Slots filled" value={`${filled}/${script.speeches.length}`} testid="res-filled" />
          <Stat label="Format" value={script.formatLabel.split(" ")[0]} testid="res-format" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="script" value={script.script} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={script.script} filename="debate-script.txt" testid="download-script" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {script.checks.length === 0 ? (
          <Notice>No documented problem: both sides have cases, a rebuttal is drafted and no slot is empty.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {script.checks.map((check) => (
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
          <Notice>{script.note}</Notice>
          <Notice tone="warn">
            Time allocations differ by league and by round. This page uses the common published norms; your tournament
            invitation overrides them.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
