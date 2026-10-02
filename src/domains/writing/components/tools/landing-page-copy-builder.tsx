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
import { buildLandingPage } from "@/domains/writing/lib/text/landing-page.ts";

/**
 * Landing page copy builder: hero line, audience, benefits, proof and one next
 * step assembled into the skeleton of a landing page, with checks.
 */
export default function LandingPageCopyBuilder() {
  const [product, setProduct] = useState("");
  const [headline, setHeadline] = useState("");
  const [audience, setAudience] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [proof, setProof] = useState("");
  const [cta, setCta] = useState("");

  const benefits = useMemo(
    () => benefitsText.split("\n").map((line) => line.trim()).filter(Boolean),
    [benefitsText],
  );
  const draft = useMemo(
    () => buildLandingPage({ product, headline, audience, benefits, proof, cta }),
    [product, headline, audience, benefits, proof, cta],
  );
  const hasParts = headline.trim().length > 0 || benefits.length > 0 || proof.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The page</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="product" label="Product" value={product} onChange={setProduct} placeholder="Northwind" />
          <TextInput name="audience" label="Who it is for" value={audience} onChange={setAudience} placeholder="support teams" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextInput name="headline" label="Hero line" value={headline} onChange={setHeadline} placeholder="Cut first-response time in half" />
          <TextArea
            name="benefits"
            label="Benefits — one per line"
            value={benefitsText}
            onChange={setBenefitsText}
            rows={4}
            placeholder={"Route every ticket to the right person\nSee the queue before it builds\nReport on response time without spreadsheets"}
          />
          <TextInput name="proof" label="Proof" value={proof} onChange={setProof} placeholder="Teams cut response time 40% in the first month" />
          <TextInput name="cta" label="Next step" value={cta} onChange={setCta} placeholder="Start a two-week trial" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.page} testid="copy-page" label="Copy" />
                <DownloadButton text={draft.page} filename="landing-page.txt" testid="download-page" label="Download" />
              </span>
            ) : undefined
          }
        >
          Page skeleton
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in a hero line and a few benefits — the page assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="the skeleton, before the design" />
            <StatGrid>
              <Stat label="Sections" value={draft.sections} testid="res-sections" />
              <Stat label="Benefits" value={benefits.length} testid="res-benefits" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="page" value={draft.page} maxHeight={460} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the promises hold is still the product&rsquo;s job.</Notice>
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
            The builder supplies the order a page reads in and checks that every block is present: a hero promise, a
            named reader, at least three reasons, proof and one next step.
          </Notice>
          <Notice tone="warn">
            It knows nothing about the product or the market and writes no claims. Every benefit and every proof
            sentence is yours, and anything comparative needs checking before it ships.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
