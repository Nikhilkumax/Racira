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
import { buildAuthorProfile } from "@/domains/writing/lib/text/author-profile.ts";

/**
 * Author profile writer: assemble a publication-facing profile from a genre, a
 * work list, themes, influences and a short note, then check the shape.
 */
export default function AuthorProfileWriter() {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [worksText, setWorksText] = useState("");
  const [themesText, setThemesText] = useState("");
  const [influences, setInfluences] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState("");

  const lines = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean);
  const draft = useMemo(
    () =>
      buildAuthorProfile({
        name,
        genre,
        works: lines(worksText),
        themes: lines(themesText),
        influences,
        note,
        website,
      }),
    [name, genre, worksText, themesText, influences, note, website],
  );
  const hasParts =
    name.trim().length > 0 ||
    genre.trim().length > 0 ||
    worksText.trim().length > 0 ||
    themesText.trim().length > 0 ||
    note.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">title | year</span>}>
          The author
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="name" label="Name" value={name} onChange={setName} placeholder="Ada Lovelace" />
          <TextInput name="genre" label="Genre or kind of writing" value={genre} onChange={setGenre} placeholder="literary science fiction" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="works"
            label="Selected works — one per line"
            value={worksText}
            onChange={setWorksText}
            rows={4}
            placeholder={"The Analyst | 2022\nSmall Machines | 2025"}
          />
          <TextArea
            name="themes"
            label="Themes — one per line"
            value={themesText}
            onChange={setThemesText}
            rows={3}
            placeholder={"memory and machines\nwork and worth"}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="influences" label="Influences" value={influences} onChange={setInfluences} placeholder="Ursula K. Le Guin; Ted Chiang" />
            <TextInput name="website" label="Website" value={website} onChange={setWebsite} placeholder="adalovelace.example" />
          </div>
          <TextArea
            name="note"
            label="A note in the third person"
            value={note}
            onChange={setNote}
            rows={2}
            placeholder="She writes in Bristol."
            hint="the only place voice enters"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.profile} testid="copy-profile" label="Copy" />
                <DownloadButton text={draft.profile} filename="author-profile.txt" testid="download-profile" label="Download" />
              </span>
            ) : undefined
          }
        >
          Profile
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the author above — the profile assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="a page-ready profile draft" />
            <StatGrid>
              <Stat label="Works" value={draft.works.length} testid="res-works" />
              <Stat
                label="Works with a year"
                value={`${draft.works.filter((work) => work.complete).length}/${draft.works.length}`}
                testid="res-dated"
              />
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
          <Notice>No structural issues found. Whether the profile captures the author is still a judgement call.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {draft.checks.map((check) => (
              <li
                key={`${check.id}-${check.message}`}
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
            The writer assembles the facts you supply into a conventional profile and checks their shape: a genre, at
            least one dated work, a theme list that stays a description. It invents no credits.
          </Notice>
          <Notice tone="warn">
            Publishers and event programmes each have their own house style for a bio, and this is a generic
            third-person draft. Keep a short and a long version of your note on hand and adapt from there.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
