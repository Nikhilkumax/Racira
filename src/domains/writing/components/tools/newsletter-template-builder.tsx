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
import { buildNewsletter } from "@/domains/writing/lib/text/newsletter.ts";

/**
 * Newsletter template builder: a masthead, a list of sections with a purpose
 * line each, one next step and a sign-off, assembled into the issue skeleton.
 */
export default function NewsletterTemplateBuilder() {
  const [name, setName] = useState("");
  const [issue, setIssue] = useState("");
  const [sectionsText, setSectionsText] = useState("");
  const [cta, setCta] = useState("");
  const [signOff, setSignOff] = useState("");

  const sections = useMemo(
    () => sectionsText.split("\n").map((line) => line.trim()).filter(Boolean),
    [sectionsText],
  );
  const draft = useMemo(
    () => buildNewsletter({ name, issue, sections, cta, signOff }),
    [name, issue, sections, cta, signOff],
  );
  const hasParts = name.trim().length > 0 || sections.length > 0 || cta.trim().length > 0 || signOff.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">heading | one-line purpose</span>}>
          The issue
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="name" label="Newsletter name" value={name} onChange={setName} placeholder="The Support Desk" />
          <TextInput name="issue" label="Issue number or date" value={issue} onChange={setIssue} placeholder="12" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="sections"
            label="Sections — one per line"
            value={sectionsText}
            onChange={setSectionsText}
            rows={5}
            placeholder={"What changed this month | The three fixes we shipped\nOne tool worth trying | A script that rewrites canned replies\nAsk the readers | Your worst ticket, in one sentence"}
          />
          <TextInput name="cta" label="One next step" value={cta} onChange={setCta} placeholder="Reply with your worst ticket" />
          <TextInput name="sign-off" label="Sign-off" value={signOff} onChange={setSignOff} placeholder="— Ada" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.newsletter} testid="copy-newsletter" label="Copy" />
                <DownloadButton text={draft.newsletter} filename="newsletter.txt" testid="download-newsletter" label="Download" />
              </span>
            ) : undefined
          }
        >
          Issue skeleton
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the masthead and a few sections — the issue builds as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="the skeleton, before the writing" />
            <StatGrid>
              <Stat label="Sections" value={draft.sections.length} testid="res-sections" />
              <Stat
                label="With a purpose"
                value={`${draft.sections.filter((section) => section.purpose).length}/${draft.sections.length}`}
                testid="res-purposed"
              />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="newsletter" value={draft.newsletter} maxHeight={460} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the issue is worth opening is still the writing.</Notice>
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
            The builder assembles the masthead, the section headings and the close, and checks the issue&rsquo;s shape —
            enough sections, one purpose line each, a single next step.
          </Notice>
          <Notice tone="warn">
            It writes no content and knows nothing about your list. Keep the issue to six sections at most; readers who
            scroll are rare and readers who reach the end are rarer.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
