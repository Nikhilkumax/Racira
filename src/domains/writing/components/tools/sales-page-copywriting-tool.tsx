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
import { buildSalesPage } from "@/domains/writing/lib/text/sales-page.ts";

/**
 * Sales page builder: the nine blocks of a long-form sales page assembled from
 * your own facts, with the published structural checks applied.
 */
export default function SalesPageCopywritingTool() {
  const [values, setValues] = useState<Record<string, string>>({});
  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));
  const page = useMemo(() => buildSalesPage(values), [values]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The product and the promise</PanelTitle>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="product" label="Product" value={values.product ?? ""} onChange={set("product")} placeholder="Meridian Kettle" />
            <TextInput
              name="audience"
              label="Reader"
              value={values.audience ?? ""}
              onChange={set("audience")}
              placeholder="tea drinkers who weigh their leaves"
            />
          </div>
          <TextArea
            name="promise"
            label="The promise"
            value={values.promise ?? ""}
            onChange={set("promise")}
            rows={2}
            placeholder="Brew green tea at the temperature it was grown for, without a thermometer."
          />
          <TextArea
            name="problem"
            label="The problem, in the reader's words"
            value={values.problem ?? ""}
            onChange={set("problem")}
            rows={2}
            placeholder="Most kettles boil to one temperature, so delicate tea scalds and turns bitter."
          />
          <TextArea
            name="mechanism"
            label="Why this works"
            value={values.mechanism ?? ""}
            onChange={set("mechanism")}
            rows={2}
            placeholder="Six presets hold the water at the temperature each tea needs."
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>The case</PanelTitle>
        <div className="space-y-3">
          <TextArea
            name="benefits"
            label="What changes, one per line"
            value={values.benefits ?? ""}
            onChange={set("benefits")}
            rows={4}
            placeholder={"Green tea stops tasting bitter\nFour cups without a refill"}
          />
          <TextArea
            name="proof"
            label="Proof, one per line"
            value={values.proof ?? ""}
            onChange={set("proof")}
            rows={4}
            placeholder={"4.7 average from 210 reviews\n1,200 kettles shipped since 2024"}
          />
          <TextArea
            name="objections"
            label="Objections, one per line as objection | answer"
            value={values.objections ?? ""}
            onChange={set("objections")}
            rows={4}
            placeholder={"Is it hard to clean? | The body is stainless steel and the lid lifts off."}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>The close</PanelTitle>
        <div className="space-y-3">
          <TextInput name="offer" label="Offer and price" value={values.offer ?? ""} onChange={set("offer")} placeholder="89 with free returns for 30 days." />
          <TextInput name="guarantee" label="Guarantee" value={values.guarantee ?? ""} onChange={set("guarantee")} placeholder="If the temperature drifts, we replace it within two years." />
          <TextInput name="cta" label="The call to action" value={values.cta ?? ""} onChange={set("cta")} placeholder="Choose your finish and add to basket." />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={page.output ? <CopyButton text={page.output} testid="copy-page" /> : undefined}>
          The page
        </PanelTitle>
        <HeroStat
          label="Benefits"
          value={page.stats.benefits}
          testid="res-benefits"
          sub={`${page.stats.objections} objections · ${page.stats.proofLines} proof lines`}
        />
        <StatGrid>
          <Stat label="Objections" value={page.stats.objections} testid="res-objections" />
          <Stat label="Checks" value={page.checks.length} testid="res-checks-count" />
          <Stat label="Words" value={page.stats.words} testid="res-words" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="page" value={page.output} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={page.output} filename="sales-page.txt" testid="download-page" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {page.checks.length === 0 ? (
          <Notice>
            No documented problem: the promise is backed by a problem, a mechanism, proof with numbers, an offer, a
            guarantee, three answered objections and one close.
          </Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {page.checks.map((check) => (
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
            The order is the settled long-form one — promise, problem, mechanism, benefits, proof, offer, guarantee,
            objections, close — because each block answers the question the previous one raises.
          </Notice>
          <Notice tone="warn">
            The builder cannot verify a claim, a review or a result, and it does not write the copy. Selling an
            unverifiable promise in a better order is still selling an unverifiable promise.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
