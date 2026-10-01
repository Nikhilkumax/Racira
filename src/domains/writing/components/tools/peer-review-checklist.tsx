"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  Checkbox,
  CopyButton,
  DownloadButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  ProgressBar,
  StackLayout,
} from "./ui";
import { PEER_REVIEW_CHECKLIST, reviewProgress, reviewReport } from "@/domains/writing/lib/text/peer-review.ts";

/**
 * Peer review checklist: the conventional questions a reviewer asks of a paper,
 * grouped by section, with progress and a copyable report. It organises the
 * reading; it does not assess the paper.
 */
export default function PeerReviewChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  const doneIds = useMemo(() => Object.keys(done).filter((id) => done[id]), [done]);
  const progress = useMemo(() => reviewProgress(doneIds), [doneIds]);
  const report = useMemo(() => reviewReport(doneIds), [doneIds]);

  const sections = useMemo(() => [...new Set(PEER_REVIEW_CHECKLIST.map((item) => item.section))], []);

  const toggle = (id: string, checked: boolean) => setDone((previous) => ({ ...previous, [id]: checked }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">tick as you go</span>}>
          Progress
        </PanelTitle>
        <HeroStat
          label="Items checked"
          value={`${progress.done}/${progress.total}`}
          testid="res-progress"
          sub={`${progress.percent}% of the checklist`}
        />
        <ProgressBar value={progress.percent} testid="res-bar" />
        <ul data-testid="res-sections" className="mt-3 grid gap-1 sm:grid-cols-2">
          {progress.sections.map((section) => (
            <li key={section.section} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-foreground">{section.section}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {section.done}/{section.total}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Btn kind="ghost" testid="btn-all" onClick={() => setDone(Object.fromEntries(PEER_REVIEW_CHECKLIST.map((item) => [item.id, true])))}>
            Mark all checked
          </Btn>
          <Btn kind="ghost" testid="btn-none" onClick={() => setDone({})}>
            Clear
          </Btn>
        </div>
      </Panel>

      {sections.map((section) => (
        <Panel key={section}>
          <PanelTitle>{section}</PanelTitle>
          <ul className="space-y-2">
            {PEER_REVIEW_CHECKLIST.filter((item) => item.section === section).map((item) => (
              <li key={item.id}>
                <Checkbox name={item.id} label={item.text} checked={Boolean(done[item.id])} onChange={(checked) => toggle(item.id, checked)} />
              </li>
            ))}
          </ul>
        </Panel>
      ))}

      <Panel>
        <PanelTitle
          right={
            <span className="flex items-center gap-2">
              <CopyButton text={report} testid="copy-report" label="Copy report" />
              <DownloadButton text={report} filename="peer-review.txt" testid="download-report" label="Download" />
            </span>
          }
        >
          Review report
        </PanelTitle>
        <OutputBlock name="report" value={report} maxHeight={360} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The items are the conventional questions a reviewer asks across the sections of a paper. Ticking one records
            that you read for it; the checklist does not assess the paper or decide what a good answer looks like.
          </Notice>
          <Notice tone="warn">
            This is a reading aid, not a review: it stores no submission, keeps no notes beyond the report you copy, and
            cannot know a journal&rsquo;s own reviewer form. Export the report into whichever system your review is
            submitted through.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
