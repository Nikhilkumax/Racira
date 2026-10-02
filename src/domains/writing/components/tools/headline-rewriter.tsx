"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  EmptyState,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  StackLayout,
  TextArea,
  TextInput,
} from "./ui";
import { rewriteHeadline } from "@/domains/writing/lib/text/headline-rewriter.ts";

/**
 * Headline rewriter: five published angles composed from a subject and an
 * action, plus a check list for a headline the writer already has.
 */
export default function HeadlineRewriter() {
  const [subject, setSubject] = useState("");
  const [action, setAction] = useState("");
  const [audience, setAudience] = useState("");
  const [count, setCount] = useState("5");
  const [headline, setHeadline] = useState("");

  const rewrite = useMemo(
    () => rewriteHeadline({ subject, action, audience, count, headline }),
    [subject, action, audience, count, headline],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The article</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            name="subject"
            label="Subject (noun phrase)"
            value={subject}
            onChange={setSubject}
            placeholder="headline writing"
          />
          <TextInput
            name="action"
            label="Action (verb phrase)"
            value={action}
            onChange={setAction}
            placeholder="write a better headline"
          />
          <TextInput
            name="audience"
            label="Audience"
            value={audience}
            onChange={setAudience}
            placeholder="first-time bloggers"
            hint="optional"
          />
          <TextInput name="count" label="Number" value={count} onChange={setCount} placeholder="5" />
        </div>
        <div className="mt-3">
          <TextArea
            name="headline"
            label="A headline you already have (checked, not rewritten)"
            value={headline}
            onChange={setHeadline}
            rows={2}
            placeholder="How to write a better headline"
            hint="optional"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>
          Candidate headlines
        </PanelTitle>
        {rewrite.variants.length === 0 ? (
          <EmptyState>
            Fill the action to get the how-to and list angles; fill the subject for the guide, mistakes and question
            angles.
          </EmptyState>
        ) : (
          <>
            <HeroStat
              label="Angles"
              value={rewrite.variants.length}
              testid="res-variants"
              sub="composed from your words only"
            />
            <ul className="space-y-2" data-testid="res-headlines">
              {rewrite.variants.map((variant) => (
                <li
                  key={variant.id}
                  className="rounded-lg border border-border bg-card/40 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-primary">{variant.label}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{variant.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{variant.note}</p>
                    </div>
                    <CopyButton text={variant.text} testid={`copy-${variant.id}`} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks on your headline</PanelTitle>
        {!rewrite.reviewed || !headline.trim() ? (
          <EmptyState>Paste a headline above to have it checked for length, shouting, clickbait and repeats.</EmptyState>
        ) : rewrite.flags.length === 0 ? (
          <Notice>No documented problem found. Whether the headline earns the click is still the article&apos;s job.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-flags">
            {rewrite.flags.map((flag) => (
              <li
                key={flag.id}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
              >
                {flag.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The five angles are fixed patterns, and the only words in the output are the ones you supplied. The checks
            are length, a trailing period, clickbait phrases, shouted words and a repeated word.
          </Notice>
          <Notice tone="warn">
            A headline is a promise, and no rule can tell whether the article keeps it. The most accurate headline is
            usually the plainest one.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
