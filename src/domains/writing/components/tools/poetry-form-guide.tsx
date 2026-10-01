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
  Select,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { POETRY_FORMS, checkForm, findForm, formReference } from "@/domains/writing/lib/text/poetry-form.ts";

const SAMPLE = ["The tide comes in slow", "and takes the day's footprints back", "leaving wet sand, cold"].join("\n");

/**
 * Poetry form guide: a reference to the common fixed forms and a checker that
 * measures a draft against the one it claims — line count, approximate
 * syllables and the rhyme scheme it actually uses.
 */
export default function PoetryFormGuide() {
  const [formId, setFormId] = useState("haiku");
  const [text, setText] = useState(SAMPLE);

  const form = useMemo(() => findForm(formId), [formId]);
  const check = useMemo(() => checkForm(text, formId), [text, formId]);
  const reference = useMemo(() => formReference(form), [form]);
  const report = useMemo(
    () =>
      [
        reference,
        "",
        `Draft: ${check.lineCount} line(s)`,
        `Syllables (approximate): ${check.syllables.join("-") || "—"}`,
        `Rhyme reads: ${check.rhymeScheme.join("") || "—"}`,
        check.notes.length > 0 ? `\n${check.notes.map((note) => `- ${note}`).join("\n")}` : "\nNo differences found.",
      ].join("\n"),
    [reference, check],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Form</PanelTitle>
        <div className="max-w-md">
          <Select
            name="form"
            label="Fixed form"
            value={formId}
            onChange={setFormId}
            options={POETRY_FORMS.map((entry) => ({ value: entry.id, label: entry.name }))}
            hint={form.lines ? `${form.lines} lines` : "open form"}
          />
        </div>
        <div className="mt-3">
          <TextArea
            name="poem"
            label="Your draft — one line per line"
            value={text}
            onChange={setText}
            rows={10}
            placeholder={"The tide comes in slow\nand takes the day's footprints back\nleaving wet sand, cold"}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>The form's rules</PanelTitle>
        <OutputBlock name="reference" value={reference} maxHeight={200} mono={false} />
        <div className="mt-3">
          <CopyButton text={reference} testid="copy-reference" label="Copy reference" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Your draft measured</PanelTitle>
        <HeroStat
          label="Lines"
          value={check.expectedLines ? `${check.lineCount}/${check.expectedLines}` : check.lineCount}
          testid="res-lines"
          sub={check.expectedLines ? "against the form's line count" : "open form — no fixed count"}
        />
        <StatGrid>
          <Stat label="Syllables" value={check.syllables.join("-") || "—"} testid="res-syllables" />
          <Stat label="Rhyme reads" value={check.rhymeScheme.join("") || "—"} testid="res-rhyme" />
        </StatGrid>
        <p className="mt-3 text-xs text-muted-foreground">
          Form check:{" "}
          <span data-testid="res-passes" className="font-mono text-foreground">
            {check.passes ? "matches the form" : "differs from the form"}
          </span>
        </p>
        {check.notes.length > 0 ? (
          <ul data-testid="res-notes" className="mt-3 space-y-1">
            {check.notes.map((note) => (
              <li key={note} className="text-xs text-amber-700 dark:text-amber-300">
                {note}
              </li>
            ))}
          </ul>
        ) : (
          <Notice>
            Line count{form.syllables ? ", syllable pattern" : ""}
            {form.rhyme ? " and rhyme" : ""} match the form as this tool measures them.
          </Notice>
        )}
        <div className="mt-3">
          <DownloadButton text={report} filename="poetry-form.txt" testid="download-report" label="Download report" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Syllables are approximate: the counter is the same one the domain&rsquo;s readability tools use, and it does
            not know a poet&rsquo;s elisions or a name&rsquo;s pronunciation. Rhyme is judged by the final sound of each
            line, so a near rhyme reads as no rhyme.
          </Notice>
          <Notice tone="warn">
            A form check is a measurement, not a verdict. Poems break forms on purpose, free verse has no rules to fail,
            and metre — the pattern of stresses — is not checked here at all. The notes say where the draft and the form
            differ, and leave the decision to you.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
