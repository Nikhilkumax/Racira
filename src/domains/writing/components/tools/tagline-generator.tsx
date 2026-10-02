"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  StackLayout,
  TextInput,
} from "./ui";
import { buildTaglines } from "@/domains/writing/lib/text/tagline.ts";

/**
 * Tagline generator: six fixed patterns combine a brand, one benefit and an
 * audience into candidate taglines, with checks for the faults a tagline can't
 * carry.
 */
export default function TaglineGenerator() {
  const [brand, setBrand] = useState("");
  const [benefit, setBenefit] = useState("");
  const [audience, setAudience] = useState("");

  const draft = useMemo(() => buildTaglines({ brand, benefit, audience }), [brand, benefit, audience]);
  const hasParts = brand.trim().length > 0 || benefit.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The promise</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput name="brand" label="Brand" value={brand} onChange={setBrand} placeholder="Northwind" />
          <TextInput name="benefit" label="One benefit" value={benefit} onChange={setBenefit} placeholder="a calmer inbox" />
          <TextInput name="audience" label="Audience" value={audience} onChange={setAudience} placeholder="support teams" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Taglines</PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Enter a brand and one benefit — the patterns fill in as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Patterns" value={draft.taglines.length} testid="res-count" sub="same promise, said differently" />
            <ul data-testid="res-taglines" className="space-y-2">
              {draft.taglines.map((tagline) => (
                <li key={tagline} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2">
                  <span className="text-sm text-foreground">{tagline}</span>
                  <CopyButton text={tagline} testid={`copy-tagline-${draft.taglines.indexOf(tagline) + 1}`} label="Copy" />
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>
            {hasParts ? "No structural issues found. Read each one aloud — a tagline lives in the ear." : "Checks appear once there is a promise to check."}
          </Notice>
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
            The patterns are fixed and visible; the generator edits nothing and picks nothing. A tagline is chosen, not
            generated — this shows the same promise six ways so the choice is easier.
          </Notice>
          <Notice tone="warn">
            None of these lines is cleared for use. Check phrases against your market&rsquo;s existing marks before a
            tagline goes anywhere near a launch.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
