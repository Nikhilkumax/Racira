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
  TextInput,
} from "./ui";
import {
  PROFILE_FIELDS,
  profileChecks,
  profileCompleteness,
  profileMarkdown,
  profileReport,
  type CharacterProfile,
} from "@/domains/writing/lib/text/character-profile.ts";

/**
 * Character profile builder: a structured set of prompts for a character, a
 * completeness score so gaps are visible, and mechanical checks that flag the
 * thin spots — a want that is really the need, a strength with no flaw, a
 * character with no arc. The checks prompt thinking; they do not judge.
 */
export default function CharacterProfileBuilder() {
  const [profile, setProfile] = useState<CharacterProfile>({ name: "", role: "Protagonist" });

  const completeness = useMemo(() => profileCompleteness(profile), [profile]);
  const checks = useMemo(() => profileChecks(profile), [profile]);
  const markdown = useMemo(() => profileMarkdown(profile), [profile]);
  const report = useMemo(() => profileReport(profile), [profile]);

  const set = (key: keyof CharacterProfile) => (value: string) => setProfile((previous) => ({ ...previous, [key]: value }));

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">nothing is stored</span>}>
          Character
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="name" label="Name" value={profile.name} onChange={set("name")} placeholder="Mara" />
          <TextInput name="role" label="Role" value={profile.role ?? ""} onChange={set("role")} hint="protagonist, foil…" />
          {PROFILE_FIELDS.filter((field) => field.key !== "role").map((field) => (
            <TextInput
              key={field.key}
              name={field.key}
              label={field.label}
              value={(profile[field.key] as string | undefined) ?? ""}
              onChange={set(field.key)}
              placeholder={field.prompt}
            />
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Completeness</PanelTitle>
        <HeroStat
          label="Prompts answered"
          value={`${completeness.filled}/${completeness.total}`}
          testid="res-completeness"
          sub={`${completeness.percent}% of the sheet`}
        />
        {completeness.missing.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Still open:{" "}
            <span data-testid="res-missing" className="font-mono text-foreground">
              {completeness.missing.join(", ")}
            </span>
          </p>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Prompts to think about</PanelTitle>
        {checks.length === 0 ? (
          <Notice>No mechanical gaps found. Whether the character works is still the reader&rsquo;s question.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {checks.map((check) => (
              <li key={check} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                {check}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <span className="flex items-center gap-2">
              <CopyButton text={markdown} testid="copy-sheet" label="Copy sheet" />
              <DownloadButton text={report} filename="character-profile.md" testid="download-sheet" label="Download" />
            </span>
          }
        >
          Character sheet
        </PanelTitle>
        <OutputBlock name="sheet" value={markdown} maxHeight={320} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The checks are mechanical: they notice an empty field, a want worded identically to the need, a strength with
            no flaw, and a character with no arc. They say what is missing, not what is wrong.
          </Notice>
          <Notice tone="warn">
            This is a planning sheet, not a character generator — it writes no backstory and suggests no names. It does not
            store anything beyond this tab, so copy or download the sheet to keep it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
