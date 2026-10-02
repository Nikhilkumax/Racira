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
import { buildVillainProfile } from "@/domains/writing/lib/text/villain-motivation.ts";

/**
 * Villain motivation builder: the want, wound, justification, method, limit and
 * self-story that make an antagonist a person, assembled and checked.
 */
export default function VillainMotivationBuilder() {
  const [villain, setVillain] = useState("");
  const [want, setWant] = useState("");
  const [wound, setWound] = useState("");
  const [justification, setJustification] = useState("");
  const [method, setMethod] = useState("");
  const [limit, setLimit] = useState("");
  const [selfStory, setSelfStory] = useState("");

  const draft = useMemo(
    () => buildVillainProfile({ villain, want, wound, justification, method, limit, selfStory }),
    [villain, want, wound, justification, method, limit, selfStory],
  );
  const hasParts = villain.trim().length > 0 || want.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The villain</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="villain" label="Villain" value={villain} onChange={setVillain} placeholder="Councillor Voss" />
          <TextInput name="want" label="What they want" value={want} onChange={setWant} placeholder="to keep the dam closed" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea name="wound" label="The wound behind the want" value={wound} onChange={setWound} rows={2} placeholder="her town was flooded when she was nine" />
          <TextArea name="justification" label="How they justify themselves — in their own eyes" value={justification} onChange={setJustification} rows={2} placeholder="the lower town can move, the reservoir cannot" />
          <TextArea name="method" label="Their method" value={method} onChange={setMethod} rows={2} placeholder="she buys votes with grain and never threatens twice" />
          <TextArea name="limit" label="The line they will not cross" value={limit} onChange={setLimit} rows={2} placeholder="she will not flood a house she has slept in" />
          <TextArea name="self-story" label="How they see themselves" value={selfStory} onChange={setSelfStory} rows={2} placeholder="the only adult in a room of children" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.profile} testid="copy-profile" label="Copy" />
                <DownloadButton text={draft.profile} filename="villain.txt" testid="download-profile" label="Download" />
              </span>
            ) : undefined
          }
        >
          Profile
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Name the villain and what they want — the profile assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="a person, not a plot device" />
            <StatGrid>
              <Stat label="Parts filled" value={`${draft.filled}/${draft.total}`} testid="res-filled" />
              <Stat label="Problems" value={draft.checks.length} testid="res-problems" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="profile" value={draft.profile} maxHeight={420} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the villain is frightening is still the story&rsquo;s job.</Notice>
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
            The builder asks the questions a memorable antagonist answers — want, wound, justification, method, limit
            and self-image — and assembles your answers. It writes no villain.
          </Notice>
          <Notice tone="warn">
            A limit the villain never tests is decoration. The story should push them against the line they said they
            would not cross; that pressure is where character comes from.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
