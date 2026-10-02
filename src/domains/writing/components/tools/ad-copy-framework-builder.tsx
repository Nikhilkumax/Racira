"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Select,
  StackLayout,
  TextInput,
} from "./ui";
import { AD_FRAMEWORKS, buildAdFramework } from "@/domains/writing/lib/text/ad-frameworks.ts";

/**
 * Ad copy framework builder: one offer read through AIDA, PAS or BAB, with the
 * draft assembled by slot and every missing slot named.
 */
export default function AdCopyFrameworkBuilder() {
  const [frameworkId, setFrameworkId] = useState(AD_FRAMEWORKS[0].id);
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [problem, setProblem] = useState("");
  const [agitate, setAgitate] = useState("");
  const [benefit, setBenefit] = useState("");
  const [proof, setProof] = useState("");

  const draft = useMemo(
    () => buildAdFramework(frameworkId, { product, audience, problem, agitate, benefit, proof }),
    [frameworkId, product, audience, problem, agitate, benefit, proof],
  );
  const hasParts = product.trim().length > 0 || problem.trim().length > 0 || benefit.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Framework and fields</PanelTitle>
        <Select
          name="framework"
          label="Structure"
          value={frameworkId}
          onChange={setFrameworkId}
          options={AD_FRAMEWORKS.map((framework) => ({ value: framework.id, label: framework.label }))}
        />
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {draft.framework.slots.map((slot) => (
            <li key={slot.label}>
              <span className="font-semibold text-foreground">{slot.label}</span> — {slot.hint}
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput name="product" label="Product" value={product} onChange={setProduct} placeholder="Northwind" />
          <TextInput name="audience" label="Audience" value={audience} onChange={setAudience} placeholder="support teams" />
          <TextInput name="problem" label="Problem" value={problem} onChange={setProblem} placeholder="tickets pile up overnight" />
          <TextInput name="agitate" label="Agitate (PAS only)" value={agitate} onChange={setAgitate} placeholder="every hour of delay costs a renewal" />
          <TextInput name="benefit" label="Benefit" value={benefit} onChange={setBenefit} placeholder="start the day with an empty queue" />
          <TextInput name="proof" label="Proof" value={proof} onChange={setProof} placeholder="customers cut response time 40% in a month" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={hasParts ? <CopyButton text={draft.draft} testid="copy-draft" label="Copy" /> : undefined}>
          Draft
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the product and the problem — the draft assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="one offer, read in this shape" />
            <OutputBlock name="draft" value={draft.draft} maxHeight={300} mono={false} />
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the shape suits the medium is still a judgement call.</Notice>
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
            The builder maps your fields onto the framework&rsquo;s slots and names any slot the structure needs and you
            have not filled. It writes no hooks and tests no performance.
          </Notice>
          <Notice tone="warn">
            Frameworks are scaffolds, not formulas. An ad that follows AIDA perfectly can still fail on the offer, and
            the strongest line in the draft may be one the framework did not ask for.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
