"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Stat,
  StatGrid,
  StackLayout,
  TextInput,
} from "./ui";
import { buildStoryIdea } from "@/domains/writing/lib/text/story-idea.ts";

/**
 * Story idea generator: a premise assembled from a protagonist, a want, an
 * obstacle and a setting, then the same parts spun into what-if variants.
 */
export default function StoryIdeaGenerator() {
  const [genre, setGenre] = useState("");
  const [protagonist, setProtagonist] = useState("");
  const [want, setWant] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [setting, setSetting] = useState("");

  const draft = useMemo(
    () => buildStoryIdea({ genre, protagonist, want, obstacle, setting }),
    [genre, protagonist, want, obstacle, setting],
  );
  const hasParts = protagonist.trim().length > 0 || want.trim().length > 0 || obstacle.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The parts</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="genre" label="Genre" value={genre} onChange={setGenre} placeholder="noir" />
          <TextInput name="protagonist" label="Protagonist" value={protagonist} onChange={setProtagonist} placeholder="Mara" />
          <TextInput name="want" label="Want (continues 'wants…')" value={want} onChange={setWant} placeholder="to buy back her father's shop" />
          <TextInput name="obstacle" label="Obstacle (continues 'but…')" value={obstacle} onChange={setObstacle} placeholder="the buyer is her brother" />
          <TextInput name="setting" label="Setting" value={setting} onChange={setSetting} placeholder="a flooded river town" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={hasParts ? <CopyButton text={draft.premise} testid="copy-premise" label="Copy" /> : undefined}>
          Premise
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the protagonist and the want — the premise assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="one premise, one sentence" />
            <StatGrid>
              <Stat label="Parts" value={`${draft.completeness.done}/${draft.completeness.total}`} testid="res-completeness" />
              <Stat label="Variants" value={draft.variants.length} testid="res-variants-count" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="premise" value={draft.premise} maxHeight={160} mono={false} />
            </div>
          </>
        )}
      </Panel>

      {draft.variants.length > 0 && (
        <Panel>
          <PanelTitle>What if</PanelTitle>
          <ul data-testid="res-variants" className="space-y-2">
            {draft.variants.map((variant) => (
              <li key={variant} className="rounded-lg border border-border bg-card/40 px-3 py-2 text-sm text-foreground">
                {variant}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the idea is worth a draft is still the writer&rsquo;s instinct.</Notice>
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
            The generator combines the parts you supply into a premise and four questions about it. It invents no
            premise and knows nothing about the market for the genre.
          </Notice>
          <Notice tone="warn">
            The variants are not a promise of a story: they are ways to test whether the premise has somewhere to go.
            Keep the question that troubles you; it is usually the one that becomes the draft.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
