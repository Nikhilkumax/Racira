"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  Checkbox,
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
import {
  BLOCK_TYPES,
  blockDocFromText,
  blockDocStats,
  blockDocToMarkdown,
  blockOutline,
  insertBlock,
  moveBlock,
  removeBlock,
  setBlockText,
  setBlockType,
  toggleBlockTodo,
  type BlockDoc,
  type BlockType,
} from "@/domains/writing/lib/text/block-based-editor.ts";

const SAMPLE = "# Field notes\n- [x] Book the hall\n- [ ] Print the signs\n1. First step\n> A remembered line";
const SAMPLE_TITLE = "Launch page";

/**
 * Block-based editor: a page made of typed blocks — headings, lists, to-dos,
 * quotes, callouts and dividers — edited in place and exported to Markdown. The
 * page is a pure data structure, so every edit goes through the engine and the
 * export always matches what is on screen.
 */
export default function BlockBasedEditor() {
  const [page, setPage] = useState<BlockDoc>(() => blockDocFromText(SAMPLE, SAMPLE_TITLE));
  const [source, setSource] = useState(SAMPLE);

  const stats = useMemo(() => blockDocStats(page), [page]);
  const markdown = useMemo(() => blockDocToMarkdown(page), [page]);
  const outline = useMemo(() => blockOutline(page), [page]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle
          right={
            <Btn
              kind="ghost"
              testid="reset-page"
              onClick={() => {
                setPage(blockDocFromText(SAMPLE, SAMPLE_TITLE));
                setSource(SAMPLE);
              }}
            >
              Reset
            </Btn>
          }
        >
          Page
        </PanelTitle>
        <TextInput name="title" label="Page title" value={page.title} onChange={(value) => setPage({ ...page, title: value })} placeholder="Launch page" />
        <div className="mt-3 space-y-2">
          {page.blocks.map((block, index) => (
            <div key={block.id} data-testid={`res-block-${index}`} className="flex items-start gap-2 rounded-lg border border-border bg-card/40 p-2">
              <div className="flex flex-col gap-1">
                <Btn kind="ghost" testid={`up-${index}`} onClick={() => setPage(moveBlock(page, index, -1))} disabled={index === 0}>
                  ↑
                </Btn>
                <Btn
                  kind="ghost"
                  testid={`down-${index}`}
                  onClick={() => setPage(moveBlock(page, index, 1))}
                  disabled={index === page.blocks.length - 1}
                >
                  ↓
                </Btn>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="sr-only">Block {index + 1} type</span>
                    <select
                      data-testid={`in-type-${index}`}
                      aria-label={`Block ${index + 1} type`}
                      value={block.type}
                      onChange={(event) => setPage(setBlockType(page, index, event.target.value as BlockType))}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                    >
                      {BLOCK_TYPES.map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {block.type === "todo" && (
                    <Checkbox name={`todo-${index}`} label="Done" checked={block.checked} onChange={() => setPage(toggleBlockTodo(page, index))} />
                  )}
                  <Btn kind="ghost" testid={`insert-${index}`} onClick={() => setPage(insertBlock(page, index + 1, "paragraph", ""))}>
                    + Below
                  </Btn>
                  <Btn kind="ghost" testid={`remove-${index}`} onClick={() => setPage(removeBlock(page, index))}>
                    Remove
                  </Btn>
                </div>
                {block.type === "divider" ? (
                  <hr className="border-border" />
                ) : (
                  <textarea
                    data-testid={`in-block-${index}`}
                    aria-label={`Block ${index + 1} text`}
                    value={block.text}
                    rows={block.type === "paragraph" || block.type === "callout" ? 2 : 1}
                    onChange={(event) => setPage(setBlockText(page, index, event.target.value))}
                    className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-primary"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">markers are recognised</span>}>
          Paste plain text
        </PanelTitle>
        <TextArea
          name="source"
          label="Text to structure"
          value={source}
          onChange={setSource}
          rows={6}
          placeholder={"# Heading\n- [ ] A to-do\n1. Numbered step\n> A quote"}
        />
        <div className="mt-3">
          <Btn kind="primary" testid="structure-it" onClick={() => setPage(blockDocFromText(source, page.title))}>
            Replace page from this text
          </Btn>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          #, ## and ### become headings; - and 1. become lists; [ ] and [x] become to-dos; &gt; becomes a quote; !
          becomes a callout and --- a divider.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Page stats</PanelTitle>
        <HeroStat
          label="Blocks"
          value={stats.blocks}
          testid="res-blocks"
          sub={`${stats.headings} heading${stats.headings === 1 ? "" : "s"} · ${stats.todos} to-do${stats.todos === 1 ? "" : "s"}`}
        />
        <StatGrid>
          <Stat label="Words" value={stats.words} testid="res-words" />
          <Stat label="To-dos done" value={`${stats.todosDone}/${stats.todos}`} testid="res-todos" />
          <Stat label="Empty blocks" value={stats.emptyBlocks} testid="res-empty" />
        </StatGrid>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton text={markdown} testid="copy-markdown" label="Copy Markdown" />
              <DownloadButton text={markdown} filename="page.md" mime="text/markdown;charset=utf-8" testid="download-markdown" label="Download .md" />
            </div>
          }
        >
          Markdown export
        </PanelTitle>
        <OutputBlock name="markdown" value={markdown} maxHeight={260} />
      </Panel>

      <Panel>
        <PanelTitle right={<CopyButton text={outline} testid="copy-outline" label="Copy outline" />}>Outline</PanelTitle>
        <OutputBlock name="outline" value={outline} maxHeight={180} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Every edit — retyping, changing a block&apos;s type, ticking a to-do, moving or removing a block — goes
            through the same model, so the Markdown export always matches the page on screen, and the page keeps at
            least one block to type in.
          </Notice>
          <Notice tone="warn">
            Blocks are flat: there is no nesting, dragging, images, columns or inline formatting, and nothing is saved
            between visits. Paste the Markdown into your own notes app to keep it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
