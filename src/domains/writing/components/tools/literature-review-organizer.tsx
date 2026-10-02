"use client";

import { useMemo, useState } from "react";
import {
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
} from "./ui";
import { SYNTHESIS_PROMPTS, organizeLiteratureReview } from "@/domains/writing/lib/text/literature-review.ts";

/**
 * Literature review organizer: one source per line, grouped by the stance its
 * finding takes, with a synthesis scaffold and the gaps in the list named.
 */
export default function LiteratureReviewOrganizer() {
  const [text, setText] = useState("");
  const plan = useMemo(() => organizeLiteratureReview(text), [text]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your sources</PanelTitle>
        <TextArea
          name="text"
          label="One source per line: citation | finding | stance"
          value={text}
          onChange={setText}
          rows={8}
          placeholder={"Smith (2021) | remote work cuts informal contact by a third | supports\nJones (2019) | no measurable effect on knowledge sharing | challenges"}
          hint="stance is optional"
        />
      </Panel>

      <Panel>
        <PanelTitle right={plan.scaffold ? <CopyButton text={plan.scaffold} testid="copy-scaffold" /> : undefined}>
          Synthesis scaffold
        </PanelTitle>
        <HeroStat
          label="Sources"
          value={plan.counts.total}
          testid="res-sources"
          sub={`${plan.counts.withYear} dated · ${plan.counts.withStance} with a stated stance`}
        />
        <StatGrid>
          <Stat label="Agree" value={plan.groups[0].sources.length} testid="res-agree" />
          <Stat label="Disagree" value={plan.groups[1].sources.length} testid="res-disagree" />
          <Stat label="Extend" value={plan.groups[2].sources.length} testid="res-extend" />
        </StatGrid>
        {plan.scaffold ? (
          <>
            <div className="mt-3">
              <OutputBlock name="scaffold" value={plan.scaffold} mono={false} />
            </div>
            <div className="mt-3">
              <DownloadButton text={plan.scaffold} filename="review-scaffold.txt" testid="download-scaffold" />
            </div>
          </>
        ) : (
          <EmptyState>Paste your sources above — the scaffold groups them as you type.</EmptyState>
        )}
      </Panel>

      <Panel>
        <PanelTitle>How to write from the scaffold</PanelTitle>
        <ul className="space-y-2" data-testid="res-prompts">
          {SYNTHESIS_PROMPTS.map((prompt) => (
            <li key={prompt}>
              <Notice>{prompt}</Notice>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle>Gaps in the list</PanelTitle>
        {plan.checks.length === 0 ? (
          <Notice>No documented gap: every source is dated, carries a finding and has a stated stance.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {plan.checks.map((check) => (
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
            The organizer parses the citation, the year, the finding and the stance, groups the sources and builds the
            scaffold. Stances fall back to keywords in the finding when the third field is left empty.
          </Notice>
          <Notice tone="warn">
            It does not read the papers. Whether a finding really supports or challenges another is your judgement, and
            the scaffold is arranged to make that judgement visible rather than to make it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
