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
import { buildProposal } from "@/domains/writing/lib/text/proposal.ts";

/**
 * Proposal template: title, client, problem, approach, deliverables, timeline
 * and price assembled into the sections a client expects, with checks.
 */
export default function ProposalTemplate() {
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [problem, setProblem] = useState("");
  const [approachText, setApproachText] = useState("");
  const [deliverablesText, setDeliverablesText] = useState("");
  const [timeline, setTimeline] = useState("");
  const [price, setPrice] = useState("");

  const lines = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean);
  const draft = useMemo(
    () =>
      buildProposal({
        title,
        client,
        problem,
        approach: lines(approachText),
        deliverables: lines(deliverablesText),
        timeline,
        price,
      }),
    [title, client, problem, approachText, deliverablesText, timeline, price],
  );
  const hasParts =
    title.trim().length > 0 ||
    client.trim().length > 0 ||
    problem.trim().length > 0 ||
    approachText.trim().length > 0 ||
    deliverablesText.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The proposal</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="title" label="Project title" value={title} onChange={setTitle} placeholder="Support desk audit" />
          <TextInput name="client" label="Client" value={client} onChange={setClient} placeholder="Acme Analytics" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="problem"
            label="The problem, in the client's terms"
            value={problem}
            onChange={setProblem}
            rows={2}
            placeholder="First-response time doubled in six months."
          />
          <TextArea
            name="approach"
            label="Approach — one step per line"
            value={approachText}
            onChange={setApproachText}
            rows={4}
            placeholder={"Interview the four agents\nShadow a week of tickets\nShip a triage script"}
          />
          <TextArea
            name="deliverables"
            label="Deliverables — one per line"
            value={deliverablesText}
            onChange={setDeliverablesText}
            rows={4}
            placeholder={"A ticket-flow report\nA triage script\nA two-hour training session"}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="timeline" label="Timeline" value={timeline} onChange={setTimeline} placeholder="Three weeks, starting 6 April" />
            <TextInput name="price" label="Investment" value={price} onChange={setPrice} placeholder="$4,800 fixed" />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.proposal} testid="copy-proposal" label="Copy" />
                <DownloadButton text={draft.proposal} filename="proposal.txt" testid="download-proposal" label="Download" />
              </span>
            ) : undefined
          }
        >
          Proposal
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the title and the problem — the proposal assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="the scaffold, before the persuasion" />
            <StatGrid>
              <Stat label="Deliverables" value={draft.deliverables.length} testid="res-deliverables" />
              <Stat label="Sections" value={draft.proposal.split("\n\n").length} testid="res-sections" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="proposal" value={draft.proposal} maxHeight={460} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the scope is right is still the client&rsquo;s judgement and yours.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {draft.checks.map((check) => (
              <li
                key={check.id}
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
            The template assembles the conventional sections and checks their presence: a named client, a stated problem,
            two or more steps, concrete deliverables, a timeline and a figure in the investment line.
          </Notice>
          <Notice tone="warn">
            It estimates nothing and promises nothing. The numbers, the scope and the terms are yours; if the proposal
            becomes a contract, the terms belong with someone who knows the law in your jurisdiction.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
