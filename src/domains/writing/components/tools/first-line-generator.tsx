"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  Select,
  StackLayout,
  TextArea,
  TextInput,
} from "./ui";
import { TONES, buildFirstLines, checkOpeningLine } from "@/domains/writing/lib/text/first-line.ts";

/**
 * First line generator: four opening lines composed from a character, a place
 * and a tone, plus a checker for the opener a writer brought themselves.
 */
export default function FirstLineGenerator() {
  const [character, setCharacter] = useState("");
  const [place, setPlace] = useState("");
  const [tone, setTone] = useState(TONES[0].id);
  const [ownLine, setOwnLine] = useState("");

  const draft = useMemo(() => buildFirstLines({ character, place, tone }), [character, place, tone]);
  const checks = useMemo(() => [...draft.checks, ...checkOpeningLine(ownLine)], [draft.checks, ownLine]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The opening</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput name="character" label="Character" value={character} onChange={setCharacter} placeholder="Mara" />
          <TextInput name="place" label="Place" value={place} onChange={setPlace} placeholder="Vess" />
          <Select name="tone" label="Tone" value={tone} onChange={setTone} options={TONES.map((entry) => ({ value: entry.id, label: entry.label }))} />
        </div>
        <div className="mt-3">
          <TextArea
            name="own-line"
            label="Your own opening line (checked for borrowed moves)"
            value={ownLine}
            onChange={setOwnLine}
            rows={2}
            placeholder="It was a dark and stormy night."
            hint="optional"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={draft.lines.length > 0 ? <CopyButton text={draft.lines[0]} testid="copy-first" label="Copy first" /> : undefined}>
          Candidate first lines
        </PanelTitle>
        {draft.lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Name a character and a place — four openings build as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Candidates" value={draft.lines.length} testid="res-count" sub="same scene, four openings" />
            <ul data-testid="res-lines" className="space-y-2">
              {draft.lines.map((line) => (
                <li key={line} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2">
                  <span className="text-sm text-foreground">{line}</span>
                  <CopyButton text={line} testid={`copy-line-${draft.lines.indexOf(line) + 1}`} label="Copy" />
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {checks.length === 0 ? (
          <Notice>
            {draft.lines.length > 0
              ? "No borrowed moves found. Whether the line earns its place is still the draft's test."
              : "Checks appear once there is a character, a place or a line to check."}
          </Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {checks.map((flag) => (
              <li
                key={`${flag.id}-${flag.message}`}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
              >
                {flag.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The generator composes four fixed patterns from your character, place and tone, and checks a line you
            brought for the moves that make openings sound borrowed: weather, once-upon-a-time, there-was, and length.
          </Notice>
          <Notice tone="warn">
            A striking first line is not a story. If a candidate makes a promise the next paragraph cannot keep, that is
            the line to cut, however good it sounds.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
