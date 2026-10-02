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
import { buildValueProposition } from "@/domains/writing/lib/text/value-prop.ts";

/**
 * Value proposition builder: assemble the audience, need, category, benefit,
 * the alternative and the proof into the two sentences a pitch gets.
 */
export default function ValuePropositionBuilder() {
  const [audience, setAudience] = useState("");
  const [need, setNeed] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [benefit, setBenefit] = useState("");
  const [alternative, setAlternative] = useState("");
  const [proof, setProof] = useState("");

  const draft = useMemo(
    () => buildValueProposition({ audience, need, brand, category, benefit, alternative, proof }),
    [audience, need, brand, category, benefit, alternative, proof],
  );
  const hasParts = brand.trim().length > 0 || benefit.trim().length > 0 || audience.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The pitch</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="audience" label="Audience" value={audience} onChange={setAudience} placeholder="support teams" />
          <TextInput name="need" label="Need (continues 'who…')" value={need} onChange={setNeed} placeholder="are drowning in tickets" />
          <TextInput name="brand" label="Brand" value={brand} onChange={setBrand} placeholder="Northwind" />
          <TextInput name="category" label="Category" value={category} onChange={setCategory} placeholder="help desk" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="benefit"
            label="Benefit (continues 'that…')"
            value={benefit}
            onChange={setBenefit}
            rows={2}
            placeholder="cuts first-response time in half"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="alternative" label="The alternative it replaces" value={alternative} onChange={setAlternative} placeholder="a shared inbox" />
            <TextInput name="proof" label="Proof (a clause starting 'it…')" value={proof} onChange={setProof} placeholder="it routes 90% of tickets to the right person" />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.proposition} testid="copy-proposition" label="Copy" />
                <DownloadButton text={draft.proposition} filename="value-proposition.txt" testid="download-proposition" label="Download" />
              </span>
            ) : undefined
          }
        >
          Proposition
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the brand and the benefit — the pitch assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="two sentences is the whole form" />
            <OutputBlock name="proposition" value={draft.proposition} maxHeight={200} mono={false} />
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the proof holds is still the reader&rsquo;s test.</Notice>
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
            The builder assembles the sentence from the parts and checks the shape — a category, a benefit written
            from the reader&rsquo;s side, a named alternative and a proof with a figure in it.
          </Notice>
          <Notice tone="warn">
            It knows nothing about the market or the competition; naming an alternative is not a claim that it is worse.
            Check any comparative claim before it ships.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
