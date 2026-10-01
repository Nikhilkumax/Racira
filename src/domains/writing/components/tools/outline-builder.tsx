"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
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
import {
  outlineReport,
  outlineStats,
  outlineToIndentedText,
  parseOutline,
  renderOutlineMarkdown,
  renderOutlineNumbered,
  type OutlineScheme,
} from "@/domains/writing/lib/text/outline.ts";

const SAMPLE = [
  "Introduction",
  "  Background",
  "    Prior work",
  "  Thesis",
  "Body",
  "  Argument one",
  "  Argument two",
  "Conclusion",
].join("\n");

/**
 * Outline builder: indented text in, a normalised outline out three ways —
 * indented markdown, a numbered outline (decimal or classic I./A./1./a.), and
 * plain indented text for a word processor. Indentation is normalised, so a
 * pasted tab or a stray space does not break the tree.
 */
export default function OutlineBuilder() {
  const [source, setSource] = useState(SAMPLE);
  const [scheme, setScheme] = useState<OutlineScheme>("decimal");

  const tree = useMemo(() => parseOutline(source), [source]);
  const stats = useMemo(() => outlineStats(tree), [tree]);
  const numbered = useMemo(() => renderOutlineNumbered(tree, scheme), [tree, scheme]);
  const markdown = useMemo(() => renderOutlineMarkdown(tree), [tree]);
  const indented = useMemo(() => outlineToIndentedText(tree), [tree]);
  const report = useMemo(() => outlineReport(tree, scheme), [tree, scheme]);
  const hasItems = stats.count > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">parsed locally</span>}>
          Outline
        </PanelTitle>
        <div className="max-w-xs">
          <Select
            name="scheme"
            label="Numbering"
            value={scheme}
            onChange={(value) => setScheme(value as OutlineScheme)}
            options={[
              { value: "decimal", label: "1. / 1.1 / 1.1.1" },
              { value: "classic", label: "I. / A. / 1. / a." },
            ]}
          />
        </div>
        <div className="mt-3">
          <TextArea
            name="outline"
            label="Indented outline (two spaces per level; leading - bullets are optional)"
            value={source}
            onChange={setSource}
            rows={14}
            placeholder={"Introduction\n  Background\n    Prior work\n  Thesis\nBody"}
            hint="Tab or spaces both work"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Shape</PanelTitle>
        {!hasItems ? (
          <EmptyState>Type an outline above — the shape and the renderings update as you write.</EmptyState>
        ) : (
          <>
            <HeroStat label="Items" value={stats.count} testid="res-count" sub={`deepest level: ${stats.maxDepth}`} />
            <StatGrid>
              {stats.byLevel.map((count, index) => (
                <Stat key={index} label={`Level ${index + 1}`} value={count} testid={`res-level-${index + 1}`} />
              ))}
            </StatGrid>
            <p className="mt-2 text-xs text-muted-foreground">
              Depth: <span data-testid="res-depth" className="font-mono text-foreground">{stats.maxDepth}</span>
            </p>
          </>
        )}
      </Panel>

      {hasItems && (
        <>
          <Panel>
            <PanelTitle right={<CopyButton text={numbered} testid="copy-numbered" label="Copy" />}>
              Numbered outline
            </PanelTitle>
            <OutputBlock name="numbered" value={numbered} maxHeight={260} mono={false} />
          </Panel>

          <Panel>
            <PanelTitle right={<CopyButton text={markdown} testid="copy-markdown" label="Copy" />}>
              Indented markdown
            </PanelTitle>
            <OutputBlock name="markdown" value={markdown} maxHeight={260} mono={false} />
          </Panel>

          <Panel>
            <PanelTitle right={<DownloadButton text={report} filename="outline.txt" testid="download-outline" label="Download" />}>
              Plain indented text
            </PanelTitle>
            <OutputBlock name="indented" value={indented} maxHeight={200} mono={false} />
          </Panel>
        </>
      )}

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Levels are read from indentation: a line indented by one unit is a child of the line above it, and an outline
            can only descend one level at a time, so a double-indented line becomes a grandchild rather than skipping to
            level three.
          </Notice>
          <Notice tone="warn">
            This is a structural helper, not a document generator: it does not decide what your sections should be and it
            does not export to DOCX or OPML. The report can be copied or downloaded as plain text; paste it into your
            word processor and apply your own styles.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
