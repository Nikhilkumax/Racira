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
import { buildCoverLetter } from "@/domains/writing/lib/text/cover-letter.ts";

/**
 * Cover letter builder: assemble a letter from a name, a role, a company, the
 * specifics to bring and a closing line — then read the structural checks.
 */
export default function CoverLetterBuilder() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [strengthsText, setStrengthsText] = useState("");
  const [closing, setClosing] = useState("");

  const strengths = useMemo(
    () => strengthsText.split("\n").map((line) => line.trim()).filter(Boolean),
    [strengthsText],
  );
  const draft = useMemo(
    () => buildCoverLetter({ name, role, company, strengths, closing }),
    [name, role, company, strengths, closing],
  );
  const hasParts =
    name.trim().length > 0 ||
    role.trim().length > 0 ||
    company.trim().length > 0 ||
    strengths.length > 0 ||
    closing.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The parts</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput name="name" label="Your name" value={name} onChange={setName} placeholder="Ada Lovelace" />
          <TextInput name="role" label="Role you want" value={role} onChange={setRole} placeholder="support engineer" />
          <TextInput name="company" label="Company" value={company} onChange={setCompany} placeholder="Acme Analytics" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="strengths"
            label="What you would bring — one per line"
            value={strengthsText}
            onChange={setStrengthsText}
            rows={4}
            placeholder={"I ran a two-person support desk\nI cut first-response time from two days to four hours"}
            hint="specifics beat adjectives"
          />
          <TextInput
            name="closing"
            label="Closing line"
            value={closing}
            onChange={setClosing}
            placeholder="I would welcome a short call next week"
            hint="ask for the next step"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.letter} testid="copy-letter" label="Copy" />
                <DownloadButton text={draft.letter} filename="cover-letter.txt" testid="download-letter" label="Download" />
              </span>
            ) : undefined
          }
        >
          Letter
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the parts above — the letter assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat
              label="Words"
              value={draft.words}
              testid="res-words"
              sub={`${draft.paragraphs} blocks including the signature`}
            />
            <OutputBlock name="letter" value={draft.letter} maxHeight={420} mono={false} />
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the specifics land is still the reader&rsquo;s call.</Notice>
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
            The builder composes the letter from your facts and checks the structure: a named company, at least one
            specific, and a closing that asks for something. It writes no achievements and knows nothing about the job.
          </Notice>
          <Notice tone="warn">
            A cover letter is read by a person against a role the tool has never seen. Everything here is a scaffold —
            edit the wording into your own voice before sending it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
