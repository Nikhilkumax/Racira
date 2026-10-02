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
import { buildBlogOutline } from "@/domains/writing/lib/text/blog-outline.ts";

/**
 * Blog post outline builder: a working title, an audience, the points the post
 * must make and a call to action become a numbered outline with checks.
 */
export default function BlogPostOutlineBuilder() {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [takeawaysText, setTakeawaysText] = useState("");
  const [cta, setCta] = useState("");

  const takeaways = useMemo(
    () => takeawaysText.split("\n").map((line) => line.trim()).filter(Boolean),
    [takeawaysText],
  );
  const draft = useMemo(
    () => buildBlogOutline({ title, audience, takeaways, cta }),
    [title, audience, takeaways, cta],
  );
  const hasParts = title.trim().length > 0 || audience.trim().length > 0 || takeaways.length > 0 || cta.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The post</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="title" label="Working title" value={title} onChange={setTitle} placeholder="How to run a support desk without burning out" />
          <TextInput name="audience" label="Who it is for" value={audience} onChange={setAudience} placeholder="new support leads" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="takeaways"
            label="Points the post must make — one per line"
            value={takeawaysText}
            onChange={setTakeawaysText}
            rows={5}
            placeholder={"Hire for patience before speed\nRotate the on-call rota weekly\nWrite the bug report you want to receive"}
            hint="each becomes a numbered section"
          />
          <TextInput name="cta" label="Call to action" value={cta} onChange={setCta} placeholder="Download the rota template" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.outline} testid="copy-outline" label="Copy" />
                <DownloadButton text={draft.outline} filename="blog-outline.txt" testid="download-outline" label="Download" />
              </span>
            ) : undefined
          }
        >
          Outline
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the title and a few points — the outline builds as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="the outline, not the finished post" />
            <StatGrid>
              <Stat label="Sections" value={draft.sections} testid="res-sections" />
              <Stat label="Points" value={takeaways.length} testid="res-points" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="outline" value={draft.outline} maxHeight={460} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the points are worth reading is still the writing.</Notice>
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
            The builder supplies the skeleton — introduction, one numbered point per takeaway, conclusion, CTA — and
            checks the shape. It writes none of the paragraphs and researches no topic.
          </Notice>
          <Notice tone="warn">
            An outline is a promise about a draft that does not exist yet. Keep the points as headings, then write each
            section to the length it deserves rather than the outline&rsquo;s symmetry.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
