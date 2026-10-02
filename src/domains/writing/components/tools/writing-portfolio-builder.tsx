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
import { buildPortfolio } from "@/domains/writing/lib/text/writing-portfolio.ts";

/**
 * Writing portfolio builder: pieces grouped by genre, ordered newest first,
 * trimmed to a reading selection and checked for the two failures — one genre
 * and nothing recent.
 */
export default function WritingPortfolioBuilder() {
  const [name, setName] = useState("");
  const [positioning, setPositioning] = useState("");
  const [pieces, setPieces] = useState("");

  const plan = useMemo(() => buildPortfolio({ name, positioning, pieces }), [name, positioning, pieces]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The writer</PanelTitle>
        <div className="space-y-3">
          <TextInput name="name" label="Name" value={name} onChange={setName} placeholder="Maya Chen" />
          <TextInput
            name="positioning"
            label="Positioning line"
            value={positioning}
            onChange={setPositioning}
            placeholder="I write about cities and the people who fix them."
          />
          <TextArea
            name="pieces"
            label="One piece per line: Title | Genre | Where it appeared | Year"
            value={pieces}
            onChange={setPieces}
            rows={9}
            placeholder={"The night bus network | journalism | City Weekly | 2025\nOn the ninth floor | fiction | Lit Mag | 2024"}
            hint="Genre, outlet and year may be left empty; the checks name what is missing."
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={plan.output ? <CopyButton text={plan.output} testid="copy-portfolio" /> : undefined}>
          Portfolio outline
        </PanelTitle>
        <HeroStat
          label="Pieces"
          value={plan.counts.total}
          testid="res-total"
          sub={`${plan.counts.genres} genres · ${plan.counts.dated} dated`}
        />
        <StatGrid>
          <Stat label="Genres" value={plan.counts.genres} testid="res-genres" />
          <Stat label="Placed" value={plan.counts.placed} testid="res-placed" />
          <Stat label="Selected" value={plan.counts.selected} testid="res-selected" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="portfolio" value={plan.output} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={plan.output} filename="writing-portfolio.txt" testid="download-portfolio" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={plan.scaffold ? <CopyButton text={plan.scaffold} testid="copy-scaffold" /> : undefined}>
          About scaffold
        </PanelTitle>
        <OutputBlock name="scaffold" value={plan.scaffold} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {plan.checks.length === 0 ? (
          <Notice>No documented problem: the pieces are grouped, dated and show more than one genre with recent work.</Notice>
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
            The selection is capped at ten pieces, one from each genre first; the outline groups everything you paste,
            ordered by year with undated pieces last in their section.
          </Notice>
          <Notice tone="warn">
            A portfolio is an argument about range and reliability, and the tool can only see the list. Whether the
            pieces are any good is a judgement no outline makes for you.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
