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
  Stat,
  StatGrid,
  TextArea,
  TextInput,
} from "./ui";
import { buildProductDescription } from "@/domains/writing/lib/text/product-description.ts";

/**
 * Product description writer: a description in the order a shopper reads, with
 * the commercial checks applied — benefit pairing, proof, price and claims.
 */
export default function ProductDescriptionWriter() {
  const [values, setValues] = useState<Record<string, string>>({});
  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));
  const product = useMemo(() => buildProductDescription(values), [values]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The product</PanelTitle>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="name" label="Name" value={values.name ?? ""} onChange={set("name")} placeholder="The Meridian Kettle" />
            <TextInput name="category" label="Category" value={values.category ?? ""} onChange={set("category")} placeholder="a variable-temperature kettle" />
          </div>
          <TextInput
            name="audience"
            label="Who it is for"
            value={values.audience ?? ""}
            onChange={set("audience")}
            placeholder="tea drinkers who weigh their leaves"
          />
          <TextArea
            name="features"
            label="Features, one per line: feature | the benefit it produces"
            value={values.features ?? ""}
            onChange={set("features")}
            rows={5}
            placeholder={"Six temperature presets | brew green tea at 70 degrees without a thermometer\n1.2 litre body | enough for four cups without a refill"}
          />
          <TextArea
            name="specs"
            label="Specs, one per line"
            value={values.specs ?? ""}
            onChange={set("specs")}
            rows={3}
            placeholder="Stainless steel, 1.2 L, 1,800 W"
          />
          <TextArea
            name="proof"
            label="Proof, one per line"
            value={values.proof ?? ""}
            onChange={set("proof")}
            rows={3}
            placeholder={"4.7 average from 210 reviews\nTwo-year guarantee"}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="offer" label="Price and offer" value={values.offer ?? ""} onChange={set("offer")} placeholder="89 with free returns for 30 days" />
            <TextInput name="cta" label="Call to action" value={values.cta ?? ""} onChange={set("cta")} placeholder="Choose your finish and add to basket." />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={product.output ? <CopyButton text={product.output} testid="copy-description" /> : undefined}>
          The description
        </PanelTitle>
        <HeroStat
          label="Benefits"
          value={product.sections.find((section) => section.id === "benefits")?.text.split("\n").filter((line) => line.startsWith("- ")).length ?? 0}
          testid="res-benefits"
          sub="feature and benefit pairs"
        />
        <StatGrid>
          <Stat label="Checks" value={product.checkCount} testid="res-checks-count" />
          <Stat label="Sections" value={product.sections.length} testid="res-sections" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="description" value={product.output} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={product.output} filename="product-description.txt" testid="download-description" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {product.checks.length === 0 ? (
          <Notice>No documented problem: every feature carries its benefit, the proof counts, the price is stated and the claims have facts beside them.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {product.checks.map((check) => (
              <li key={check}>
                <Notice tone="warn">{check}</Notice>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The description follows the order a shopper reads: hook, what it is, benefits, specs, proof, offer and one
            call to action. The checks are commercial conventions rather than rules.
          </Notice>
          <Notice tone="warn">
            The builder cannot verify a claim or a review. Everything it assembles is your text, and the accuracy of
            the numbers stays with you.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
