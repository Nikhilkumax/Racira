"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  LEADING_CONNECTORS,
  extractBullets,
  formatBulletList,
} from "@/domains/writing/lib/text/bullet-points.ts";

/**
 * Bullet point extractor: one sentence per bullet, with an optional removal of a
 * listed leading connector. The change log is the point of the tool — every
 * bullet that differs from its source sentence shows exactly what was removed,
 * and existing list lines in the input are preserved rather than merged.
 */
export default function BulletPointExtractor() {
  const [raw, setRaw] = useState("");
  const [keepLists, setKeepLists] = useState(true);
  const [stripPeriod, setStripPeriod] = useState(false);
  const text = useDebouncedValue(raw, 250);

  const result = useMemo(
    () => extractBullets(text, { keepExistingLists: keepLists, stripTrailingPeriod: stripPeriod }),
    [text, keepLists, stripPeriod],
  );
  const bullets = useMemo(() => formatBulletList(result), [result]);
  const changes = useMemo(() => result.bullets.filter((bullet) => bullet.removedConnector !== null), [result]);
  const hasText = text.trim().length > 0;

  const report = useMemo(
    () =>
      hasText
        ? [
            "Bullet points (one sentence per bullet; connectors removed are listed)",
            "",
            bullets,
            "",
            `Bullets: ${result.bullets.length} from ${result.sentences} sentences`,
            result.existingListItems.length > 0 ? `Existing list lines preserved: ${result.existingListItems.length}` : "",
            changes.length > 0
              ? `Connectors removed: ${changes.map((bullet) => bullet.removedConnector).join(", ")}`
              : "Connectors removed: none",
          ]
            .filter(Boolean)
            .join("\n")
        : "",
    [hasText, bullets, result, changes],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your prose</PanelTitle>
        <TextArea
          name="text"
          label="Paste the prose (lists are welcome too)"
          value={raw}
          onChange={setRaw}
          rows={12}
          placeholder="Paste paragraphs. Each sentence becomes one bullet; a leading connector from the published list may be removed and is reported."
        />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Checkbox name="keep-lists" label="Preserve existing list lines" checked={keepLists} onChange={setKeepLists} />
          <Checkbox
            name="strip-period"
            label="Drop a single trailing period"
            checked={stripPeriod}
            onChange={setStripPeriod}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? bullets : ""} testid="copy-bullets" label="Copy bullets" />
          <CopyButton text={report} testid="copy-report" label="Copy report" />
          <DownloadButton text={report} filename="bullet-points.txt" testid="download-bullets" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Extraction</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <HeroStat
            label="Bullets produced"
            value={result.bullets.length}
            testid="res-count"
            sub={
              result.existingListItems.length > 0
                ? `${result.existingListItems.length} existing list line(s) preserved · ${result.words} words in`
                : `${result.words} words in`
            }
          />
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>Bullets</PanelTitle>
          <OutputBlock name="bullets" value={bullets} maxHeight={340} mono={false} />
        </Panel>
      )}

      {hasText && result.existingListItems.length > 0 && (
        <Panel>
          <PanelTitle>Existing list lines, kept verbatim</PanelTitle>
          <ul data-testid="res-existing" className="space-y-1 text-sm text-foreground">
            {result.existingListItems.map((item, index) => (
              <li key={`${item.index}-${index}`} className="font-mono text-xs">
                {item.text}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {hasText && changes.length > 0 && (
        <Panel>
          <PanelTitle>What changed, and why</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-changes" className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Source sentence</th>
                  <th className="py-2 pr-3 font-semibold">Bullet</th>
                  <th className="py-2 font-semibold">Connector removed</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((bullet, index) => (
                  <tr key={`${bullet.index}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 text-muted-foreground">{bullet.source}</td>
                    <td className="py-2 pr-3 text-foreground">{bullet.text}</td>
                    <td className="py-2 font-mono text-xs text-foreground">{bullet.removedConnector}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && changes.length === 0 && (
        <Panel>
          <PanelTitle>No rewrites were needed</PanelTitle>
          <Notice>
            No sentence began with one of the {LEADING_CONNECTORS.length} connectors on the published list, so every
            bullet is its source sentence exactly — the tool made no edit at all beyond adding the bullet marker.
          </Notice>
        </Panel>
      )}

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The only possible edit is removing a connector from the {LEADING_CONNECTORS.length}-item list at the start
            of a sentence, and each removal is shown in the change table. Sentences are otherwise untouched, including
            their punctuation and their order.
          </Notice>
          <Notice tone="warn">
            This is not a summariser: a ten-sentence paragraph produces ten bullets. Long sentences make long bullets,
            sub-clauses stay inside their bullet, and the tool cannot tell an argument from an aside. It also splits
            sentences mechanically, so an abbreviation can cut a sentence short. Edit the bullets for length and
            hierarchy by hand.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
