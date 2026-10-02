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
  Stat,
  StatGrid,
  StackLayout,
  TextArea,
  TextInput,
} from "./ui";
import { buildCaseStudy } from "@/domains/writing/lib/text/case-study.ts";

/**
 * Case study template: challenge, approach, quantified results and a client
 * quote assembled into the case study shape, with checks on credibility.
 */
export default function CaseStudyTemplate() {
  const [client, setClient] = useState("");
  const [sector, setSector] = useState("");
  const [challenge, setChallenge] = useState("");
  const [approachText, setApproachText] = useState("");
  const [resultsText, setResultsText] = useState("");
  const [quote, setQuote] = useState("");

  const lines = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean);
  const draft = useMemo(
    () =>
      buildCaseStudy({
        client,
        sector,
        challenge,
        approach: lines(approachText),
        results: lines(resultsText),
        quote,
      }),
    [client, sector, challenge, approachText, resultsText, quote],
  );
  const quantified = draft.results.filter((result) => result.quantified).length;
  const hasParts = client.trim().length > 0 || challenge.trim().length > 0 || approachText.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">metric | value</span>}>
          The study
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="client" label="Client" value={client} onChange={setClient} placeholder="Acme Analytics" />
          <TextInput name="sector" label="Sector" value={sector} onChange={setSector} placeholder="B2B software" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="challenge"
            label="Challenge, in the client's terms"
            value={challenge}
            onChange={setChallenge}
            rows={2}
            placeholder="First-response time doubled in six months."
          />
          <TextArea
            name="approach"
            label="Approach — one step per line"
            value={approachText}
            onChange={setApproachText}
            rows={4}
            placeholder={"Interviewed the support agents\nRebuilt the triage rules\nTrained the team on the new queue"}
          />
          <TextArea
            name="results"
            label="Results — one per line as metric | value"
            value={resultsText}
            onChange={setResultsText}
            rows={3}
            placeholder={"First-response time | down 40%\nTicket backlog | 620 to 90"}
          />
          <TextArea
            name="quote"
            label="The client's own words"
            value={quote}
            onChange={setQuote}
            rows={2}
            placeholder="We stopped guessing which ticket mattered most. — Priya Raman, Support Lead"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.study} testid="copy-study" label="Copy" />
                <DownloadButton text={draft.study} filename="case-study.txt" testid="download-study" label="Download" />
              </span>
            ) : undefined
          }
        >
          Case study
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Name the client and the challenge — the study assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="the story, before the polish" />
            <StatGrid>
              <Stat label="Results" value={draft.results.length} testid="res-results" />
              <Stat label="With a figure" value={`${quantified}/${draft.results.length}`} testid="res-quantified" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="study" value={draft.study} maxHeight={460} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the results are honest is still the client&rsquo;s signature.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {draft.checks.map((check) => (
              <li
                key={`${check.id}-${check.message}`}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
              >
                {check.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The template assembles the case study shape and checks what makes one credible: a named client, a stated
            challenge, at least two steps, results with figures in them and the client&rsquo;s own words.
          </Notice>
          <Notice tone="warn">
            It verifies nothing. Every figure should come from the client&rsquo;s data, and the quote should be
            cleared before anything is published.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
