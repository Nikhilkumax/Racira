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
import { buildBrandVoice } from "@/domains/writing/lib/text/brand-voice.ts";

/**
 * Brand voice guide builder: three attributes with their practice, a say /
 * do-not-say list, and a sample checked against the guide it demonstrates.
 */
export default function BrandVoiceGuideBuilder() {
  const [values, setValues] = useState<Record<string, string>>({});
  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));
  const guide = useMemo(() => buildBrandVoice(values), [values]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The brand</PanelTitle>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="brand" label="Brand" value={values.brand ?? ""} onChange={set("brand")} placeholder="Meridian" />
            <TextInput
              name="audience"
              label="Who we write for"
              value={values.audience ?? ""}
              onChange={set("audience")}
              placeholder="people who care how their tea tastes, not about gadgets"
            />
          </div>
          <TextArea
            name="attributes"
            label="Voice attributes, one per line: attribute | what it means in practice"
            value={values.attributes ?? ""}
            onChange={set("attributes")}
            rows={4}
            placeholder={"Precise | we give the temperature, never the adjective\nPlain | short sentences, kitchen words"}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextArea
              name="doSay"
              label="We say, one per line"
              value={values.doSay ?? ""}
              onChange={set("doSay")}
              rows={4}
              placeholder={"at 70 degrees\nsecond pot"}
            />
            <TextArea
              name="dontSay"
              label="We do not say, one per line"
              value={values.dontSay ?? ""}
              onChange={set("dontSay")}
              rows={4}
              placeholder={"artisanal\nsynergy"}
            />
          </div>
          <TextArea
            name="sample"
            label="A sample paragraph in the voice"
            value={values.sample ?? ""}
            onChange={set("sample")}
            rows={3}
            placeholder="Green tea wants 70 degrees. Set the dial, pour, and the second pot tastes like the first."
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={guide.output ? <CopyButton text={guide.output} testid="copy-guide" /> : undefined}>
          The guide
        </PanelTitle>
        <HeroStat
          label="Attributes"
          value={guide.stats.attributes}
          testid="res-attributes"
          sub={`${guide.stats.doSay} to reach for · ${guide.stats.dontSay} to avoid`}
        />
        <StatGrid>
          <Stat label="We say" value={guide.stats.doSay} testid="res-say" />
          <Stat label="We do not say" value={guide.stats.dontSay} testid="res-dontsay" />
          <Stat label="Checks" value={guide.checks.length} testid="res-checks-count" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="guide" value={guide.output} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={guide.output} filename="brand-voice.txt" testid="download-guide" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {guide.checks.length === 0 ? (
          <Notice>No documented problem: three attributes with practice, both lists populated, and a sample that follows them.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {guide.checks.map((check) => (
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
            The builder checks the guide&apos;s internal consistency: an attribute with no practice, a phrase on both
            lists, a sample that uses banned wording, and sentences a reader has to hold in one breath.
          </Notice>
          <Notice tone="warn">
            It cannot tell whether the voice suits the audience, and it cannot write the sample. A guide is judged by
            the copy written from it, not by the document.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
