"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  DownloadButton,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  TextInput,
} from "./ui";
import { formatManuscript, manuscriptChecklist } from "@/domains/writing/lib/text/manuscript.ts";

const SAMPLE = [
  'Chapter one',
  '',
  '"Wait," she said. The harbour was quiet -- too quiet...',
  '',
  '***',
  '',
  'By morning the boat was gone.',
].join("\n");

/**
 * Manuscript formatter: the mechanical typographic clean-up a submission
 * expects — curly quotes, em dashes, an ellipsis, centred scene breaks and an
 * optional title page — plus the word, chapter and scene-break counts. It is
 * text in, text out: it never reflows the author's words.
 */
export default function ManuscriptFormatter() {
  const [source, setSource] = useState(SAMPLE);
  const [titlePage, setTitlePage] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [contact, setContact] = useState("");

  const result = useMemo(
    () => formatManuscript(source, { titlePage, title, author, contact }),
    [source, titlePage, title, author, contact],
  );
  const checklist = useMemo(() => manuscriptChecklist(), []);
  const changeRows = useMemo(
    () => [
      `${result.changes.smartQuotes} quote mark(s) curled`,
      `${result.changes.emDashes} em dash(es)`,
      `${result.changes.ellipses} ellipsis/es`,
      `${result.changes.sceneBreaks} scene break(s) normalised`,
    ],
    [result.changes],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">text in, text out</span>}>
          Manuscript
        </PanelTitle>
        <TextArea
          name="text"
          label="Paste your manuscript text"
          value={source}
          onChange={setSource}
          rows={12}
          placeholder={"Chapter one\n\nText with straight \"quotes\" and a -- dash."}
        />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Checkbox name="title-page" label="Add a title page" checked={titlePage} onChange={setTitlePage} />
        </div>
        {titlePage && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <TextInput name="title" label="Title" value={title} onChange={setTitle} />
            <TextInput name="author" label="Author" value={author} onChange={setAuthor} />
            <TextInput name="contact" label="Contact" value={contact} onChange={setContact} />
          </div>
        )}
      </Panel>

      <Panel>
        <PanelTitle right={<CopyButton text={result.text} testid="copy-manuscript" label="Copy" />}>
          Formatted manuscript
        </PanelTitle>
        <OutputBlock name="manuscript" value={result.text} maxHeight={320} mono={false} />
        <div className="mt-3">
          <DownloadButton text={result.text} filename="manuscript.txt" testid="download-manuscript" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Counts</PanelTitle>
        <StatGrid>
          <Stat label="Words" value={result.stats.words} testid="res-words" />
          <Stat label="Chapters" value={result.stats.chapters} testid="res-chapters" />
          <Stat label="Scene breaks" value={result.stats.sceneBreaks} testid="res-scene-breaks" />
          <Stat label="Paragraphs" value={result.stats.paragraphs} testid="res-paragraphs" />
          <Stat label="Sentences" value={result.stats.sentences} testid="res-sentences" />
          <Stat label="Characters" value={result.stats.characters} testid="res-characters" />
        </StatGrid>
      </Panel>

      <Panel>
        <PanelTitle>What changed</PanelTitle>
        <ul data-testid="res-changes" className="space-y-1 text-sm">
          {changeRows.map((row) => (
            <li key={row} className="flex items-baseline gap-2 text-foreground">
              <span className="text-muted-foreground">·</span>
              <span className="font-mono text-xs">{row}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle>Standard manuscript format</PanelTitle>
        <ul data-testid="res-checklist" className="space-y-2 text-sm">
          {checklist.map((row) => (
            <li key={row.item} className="border-t border-border/60 pt-2 first:border-0 first:pt-0">
              <span className="font-semibold text-foreground">{row.item}</span>
              <span className="text-muted-foreground"> — {row.note}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Every change is a substitution the tool names: straight quotes to typographic ones, a spaced double hyphen
            to an em dash, three dots to an ellipsis, and a line of asterisks or hashes to a centred break. Your wording
            is never rewritten.
          </Notice>
          <Notice tone="warn">
            This is not a .docx exporter and it does not set fonts, margins or line spacing, which your word processor
            handles with a template. It formats the text and counts the parts; the checklist above is the rest of the
            formatting job, done where you submit.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
