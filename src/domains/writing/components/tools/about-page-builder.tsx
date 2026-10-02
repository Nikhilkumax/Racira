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
import { buildAboutPage } from "@/domains/writing/lib/text/about-page.ts";

/**
 * About page builder: the six sections an About page needs, assembled from
 * your own facts and checked against published conversion guidance.
 */
export default function AboutPageBuilder() {
  const [values, setValues] = useState<Record<string, string>>({});
  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));
  const draft = useMemo(() => buildAboutPage(values), [values]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your facts</PanelTitle>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="name" label="Name" value={values.name ?? ""} onChange={set("name")} placeholder="Northfield Repairs" />
            <TextInput
              name="audience"
              label="Who this is for"
              value={values.audience ?? ""}
              onChange={set("audience")}
              placeholder="Homeowners whose washing machine has stopped mid-cycle"
            />
          </div>
          <TextArea
            name="offer"
            label="The offer"
            value={values.offer ?? ""}
            onChange={set("offer")}
            rows={2}
            placeholder="We fix household appliances the same week you book."
          />
          <TextArea
            name="differentiator"
            label="Why it is yours"
            value={values.differentiator ?? ""}
            onChange={set("differentiator")}
            rows={2}
            placeholder="One technician sees the job through, and the quote is fixed before work starts."
          />
          <TextArea
            name="proof"
            label="Proof, one per line"
            value={values.proof ?? ""}
            onChange={set("proof")}
            rows={4}
            placeholder={"1,400 repairs completed since 2019\n4.9 average rating across 380 reviews"}
          />
          <TextArea
            name="story"
            label="Our story"
            value={values.story ?? ""}
            onChange={set("story")}
            rows={2}
            placeholder="The workshop opened in 2019 after the only repair shop in the district closed."
          />
          <TextInput
            name="cta"
            label="Next step"
            value={values.cta ?? ""}
            onChange={set("cta")}
            placeholder="Book a slot at northfield.example/book"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={draft.output ? <CopyButton text={draft.output} testid="copy-page" /> : undefined}>
          Assemble the page
        </PanelTitle>
        <HeroStat label="Words" value={draft.stats.words} testid="res-words" sub="across the six sections" />
        <StatGrid>
          <Stat label="We / our" value={draft.stats.we} testid="res-we" />
          <Stat label="You / your" value={draft.stats.you} testid="res-you" />
          <Stat label="Checks" value={draft.checks.length} testid="res-checks-count" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="page" value={draft.output} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={draft.output} filename="about-page.txt" testid="download-page" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No documented problem: the offer, audience, proof and next step are all present and the page speaks to the reader.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {draft.checks.map((check) => (
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
            The checks come from published conversion guidance: name the reader&apos;s problem, attach proof with a
            number, keep the we-to-you ratio in the reader&apos;s favour, and end with one action.
          </Notice>
          <Notice tone="warn">
            The builder does not invent credentials, numbers or a story, and it cannot tell whether your differentiator
            is true. It assembles your text and names what is missing.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
