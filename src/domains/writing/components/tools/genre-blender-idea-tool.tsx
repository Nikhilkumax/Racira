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
  TextInput,
} from "./ui";
import { BLEND_GENRES, blendGenres } from "@/domains/writing/lib/text/genre-blender.ts";

const OPTIONS = BLEND_GENRES.map((genre) => ({ value: genre.id, label: genre.name }));

/**
 * Genre blender idea tool: two genres, their stock elements and their reader
 * expectations, collided into five premise scaffolds that keep at least one
 * convention from each side.
 */
export default function GenreBlenderIdeaTool() {
  const [first, setFirst] = useState("fantasy");
  const [second, setSecond] = useState("science-fiction");
  const [element, setElement] = useState("");

  const blend = useMemo(() => blendGenres({ first, second, element }), [first, second, element]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Two genres</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select name="first" label="First genre" value={first} onChange={setFirst} options={OPTIONS} />
          <Select name="second" label="Second genre" value={second} onChange={setSecond} options={OPTIONS} />
        </div>
        <div className="mt-3">
          <TextInput
            name="element"
            label="Required element (optional)"
            value={element}
            onChange={setElement}
            placeholder="a ledger written in two hands"
            hint="one object, line or place that must survive the merge"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>What each genre promises</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {[blend.first, blend.second].map((genre, index) => (
            <div key={index} data-testid={index === 0 ? "res-genre-first" : "res-genre-second"} className="rounded-lg border border-border bg-card/40 px-3 py-2">
              <p className="text-sm font-semibold text-foreground">{genre ? genre.name : "Pick a genre"}</p>
              {genre && (
                <>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Elements</p>
                  <ul className="mt-1 space-y-1 text-sm text-foreground">
                    {genre.elements.map((item) => (
                      <li key={item}>— {item}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Conventions</p>
                  <ul className="mt-1 space-y-1 text-sm text-foreground">
                    {genre.conventions.map((item) => (
                      <li key={item}>— {item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton text={blend.output} testid="copy-ideas" label="Copy ideas" />
              <DownloadButton text={blend.output} filename="genre-blend.txt" testid="download-ideas" label="Download" />
            </div>
          }
        >
          The collision
        </PanelTitle>
        <HeroStat
          label="Scaffolds"
          value={blend.ideas.length}
          testid="res-ideas"
          sub={blend.ideas.length > 0 ? "five fixed templates over the two element sets" : "pick two different genres"}
        />
        {blend.ideas.length > 0 && (
          <div className="space-y-2">
            {blend.ideas.map((idea, index) => (
              <div key={idea.id} data-testid={`res-idea-${index}`} className="rounded-lg border border-border bg-card/40 px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">{idea.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{idea.text}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <OutputBlock name="blend" value={blend.output} mono={false} maxHeight={240} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {blend.checks.length === 0 ? (
          <Notice>
            The two genres differ and the required element is named, so the collision carries an object from each side
            and something specific to argue about.
          </Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {blend.checks.map((check) => (
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
            Each scaffold pairs one element from each genre and keeps a convention from both sides, so the blend stays
            legible to a reader of either shelf. Names, plots and characters come from you.
          </Notice>
          <Notice tone="warn">
            A blend is not a promise of a market: read the two conventions lists and decide which one the story will
            break, because a mash-up that honours neither set reads as neither genre.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
