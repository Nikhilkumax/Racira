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
  TextArea,
  TextInput,
} from "./ui";
import { buildLaunchCopy } from "@/domains/writing/lib/text/launch-copy.ts";

/**
 * Product launch copy builder: what is new, who it is for, why it matters, the
 * date and one next step assembled into an announcement, with checks.
 */
export default function ProductLaunchCopyBuilder() {
  const [product, setProduct] = useState("");
  const [date, setDate] = useState("");
  const [audience, setAudience] = useState("");
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");
  const [cta, setCta] = useState("");

  const draft = useMemo(
    () => buildLaunchCopy({ product, date, audience, what, why, cta }),
    [product, date, audience, what, why, cta],
  );
  const hasParts = product.trim().length > 0 || what.trim().length > 0 || cta.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The launch</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="product" label="Product" value={product} onChange={setProduct} placeholder="Northwind Triage" />
          <TextInput name="date" label="Launch date" value={date} onChange={setDate} placeholder="14 April 2026" />
          <TextInput name="audience" label="Who it is for" value={audience} onChange={setAudience} placeholder="support teams of five to fifty" />
          <TextInput name="cta" label="Next step" value={cta} onChange={setCta} placeholder="Join the early-access list" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="what"
            label="What is new — one or two sentences"
            value={what}
            onChange={setWhat}
            rows={3}
            placeholder="A triage assistant that routes tickets by urgency and owner."
          />
          <TextArea
            name="why"
            label="Why it matters"
            value={why}
            onChange={setWhy}
            rows={2}
            placeholder="Response time is the number customers quote when they leave."
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.copy} testid="copy-copy" label="Copy" />
                <DownloadButton text={draft.copy} filename="launch-copy.txt" testid="download-copy" label="Download" />
              </span>
            ) : undefined
          }
        >
          Announcement
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Name the product and what is new — the announcement assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="an announcement read in a breath" />
            <OutputBlock name="copy" value={draft.copy} maxHeight={420} mono={false} />
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the news is new to anyone else is a different question.</Notice>
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
            The builder assembles the announcement&rsquo;s shape — product, date, what, who, why, next step — and checks
            that each part is present and brief. It writes no news.
          </Notice>
          <Notice tone="warn">
            Newness alone is not news to anyone but the maker. The why field is the one that decides whether the
            announcement is read; leave it thin and the rest of the draft cannot carry it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
