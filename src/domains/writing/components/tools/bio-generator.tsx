"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  TextArea,
  TextInput,
} from "./ui";
import { buildBio } from "@/domains/writing/lib/text/bio.ts";

/**
 * Bio generator: turn a name, a role, a focus and a few facts into a one-line,
 * a short paragraph and a full paragraph — all in the third person.
 */
export default function BioGenerator() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [focus, setFocus] = useState("");
  const [location, setLocation] = useState("");
  const [factsText, setFactsText] = useState("");

  const facts = useMemo(() => factsText.split("\n").map((line) => line.trim()).filter(Boolean), [factsText]);
  const bios = useMemo(() => buildBio({ name, role, focus, location, facts }), [name, role, focus, location, facts]);
  const hasParts = name.trim().length > 0 || role.trim().length > 0 || focus.trim().length > 0 || facts.length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The facts</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="name" label="Name" value={name} onChange={setName} placeholder="Ada Lovelace" />
          <TextInput name="role" label="Role or title" value={role} onChange={setRole} placeholder="support engineer" />
          <TextInput name="focus" label="What the work focuses on" value={focus} onChange={setFocus} placeholder="developer tooling" />
          <TextInput name="location" label="Based in" value={location} onChange={setLocation} placeholder="Bristol" />
        </div>
        <div className="mt-3">
          <TextArea
            name="facts"
            label="Facts — one per line, third person"
            value={factsText}
            onChange={setFactsText}
            rows={4}
            placeholder={"She has run support for a developer platform since 2021\nShe writes a monthly column on troubleshooting"}
            hint="credits, publications, firsts"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={<CopyButton text={bios.short} testid="copy-short" label="Copy" />}>One line</PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the facts above — all three bios build as you type.
          </p>
        ) : (
          <>
            <HeroStat
              label="Words — short / medium / long"
              value={`${bios.wordCounts.short} / ${bios.wordCounts.medium} / ${bios.wordCounts.long}`}
              testid="res-words"
            />
            <OutputBlock name="short" value={bios.short} maxHeight={120} mono={false} />
          </>
        )}
      </Panel>

      {hasParts && (
        <>
          <Panel>
            <PanelTitle right={<CopyButton text={bios.medium} testid="copy-medium" label="Copy" />}>Short bio</PanelTitle>
            <OutputBlock name="medium" value={bios.medium} maxHeight={180} mono={false} />
          </Panel>
          <Panel>
            <PanelTitle right={<CopyButton text={bios.long} testid="copy-long" label="Copy" />}>Long bio</PanelTitle>
            <OutputBlock name="long" value={bios.long} maxHeight={240} mono={false} />
          </Panel>
        </>
      )}

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {bios.checks.length === 0 ? (
          <Notice>No structural issues found. The facts themselves are yours to stand behind.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {bios.checks.map((check) => (
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
            The generator assembles only what you supply. The checks flag the slips that make a bio read as a template:
            no facts, first-person facts, a paragraph that has grown past its job.
          </Notice>
          <Notice tone="warn">
            Publication conventions differ — a book jacket, a conference programme and a staff page each want a
            different register. Pick the variant that fits and edit it to the house style.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
