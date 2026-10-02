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
import { buildPressRelease } from "@/domains/writing/lib/text/press-release.ts";

/**
 * Press release template: assemble the conventional structure — dateline, the
 * five Ws, a quote, boilerplate, contact — and read the structural checks.
 */
export default function PressReleaseTemplate() {
  const [organisation, setOrganisation] = useState("");
  const [headline, setHeadline] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [what, setWhat] = useState("");
  const [who, setWho] = useState("");
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");
  const [why, setWhy] = useState("");
  const [quote, setQuote] = useState("");
  const [boilerplate, setBoilerplate] = useState("");
  const [contact, setContact] = useState("");

  const draft = useMemo(
    () =>
      buildPressRelease({
        organisation,
        headline,
        city,
        date,
        what,
        who,
        when,
        where,
        why,
        quote,
        boilerplate,
        contact,
      }),
    [organisation, headline, city, date, what, who, when, where, why, quote, boilerplate, contact],
  );
  const hasParts =
    organisation.trim().length > 0 ||
    headline.trim().length > 0 ||
    what.trim().length > 0 ||
    quote.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">who, what, when, where, why</span>}>
          The release
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="organisation" label="Organisation" value={organisation} onChange={setOrganisation} placeholder="Acme Analytics" />
          <TextInput name="headline" label="Headline" value={headline} onChange={setHeadline} placeholder="Acme Analytics opens a support hub in Bristol" />
          <TextInput name="city" label="City (dateline)" value={city} onChange={setCity} placeholder="Bristol" />
          <TextInput name="date" label="Date (dateline)" value={date} onChange={setDate} placeholder="3 March 2026" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="what"
            label="What happened — one sentence"
            value={what}
            onChange={setWhat}
            rows={2}
            placeholder="Acme Analytics has opened a support hub in Bristol."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="who" label="Who is affected" value={who} onChange={setWho} placeholder="customers across the south west" />
            <TextInput name="why" label="Why it matters" value={why} onChange={setWhy} placeholder="the region has a shortage of support roles" />
            <TextInput name="when" label="When" value={when} onChange={setWhen} placeholder="the hub opens on 1 April" />
            <TextInput name="where" label="Where" value={where} onChange={setWhere} placeholder="recruitment begins this month" />
          </div>
          <TextInput
            name="quote"
            label="Quote — speaker | words"
            value={quote}
            onChange={setQuote}
            placeholder="Priya Raman | We want support to be local"
            hint="attribution keeps it usable"
          />
          <TextArea
            name="boilerplate"
            label="About paragraph (boilerplate)"
            value={boilerplate}
            onChange={setBoilerplate}
            rows={2}
            placeholder="Acme Analytics builds support software."
          />
          <TextInput name="contact" label="Media contact" value={contact} onChange={setContact} placeholder="press@acme.example" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.release} testid="copy-release" label="Copy" />
                <DownloadButton text={draft.release} filename="press-release.txt" testid="download-release" label="Download" />
              </span>
            ) : undefined
          }
        >
          Release
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the headline and the lead — the release assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="a release a desk can skim" />
            <StatGrid>
              <Stat label="Lead words" value={draft.leadWords} testid="res-leadwords" />
              <Stat label="Blocks" value={draft.release.split("\n\n").length} testid="res-blocks" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="release" value={draft.release} maxHeight={460} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the news is worth a desk&rsquo;s attention is another question.</Notice>
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
            The template assembles the conventional structure — dateline, lead, supporting paragraphs, quote,
            boilerplate, contact — and checks what is missing. It writes no news and makes no judgement of it.
          </Notice>
          <Notice tone="warn">
            A release is only as good as its news and its list. Check the media contact and the date before sending, and
            tailor the boilerplate to the outlet rather than pasting one paragraph everywhere.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
