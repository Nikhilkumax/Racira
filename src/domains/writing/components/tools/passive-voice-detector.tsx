"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { passiveSummary } from "@/domains/writing/lib/text/passive.ts";

/**
 * Passive constructions as be + participle, with a by-agent raising confidence.
 * Passives are not errors — they are how scientific and procedural writing keeps
 * the actor out of the way — so the tool reports counts and locations rather
 * than a pass/fail.
 */
export default function PassiveVoiceDetector() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const summary = useMemo(() => passiveSummary(text), [text]);
  const hasText = summary.words > 0;

  const share = (summary.shareOfSentences * 100).toFixed(0);
  const summaryText = useMemo(
    () =>
      [
        `Passive candidates: ${summary.hits.length} across ${summary.sentences} sentences`,
        `Sentences containing one: ${summary.sentencesWithPassive} (${share}%)`,
        `With an expressed agent "by …": ${summary.strongCount}`,
        "",
        ...summary.hits.map((hit) => `${hit.phrase} — ${hit.sentence}`),
      ].join("\n"),
    [summary, share],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Paste or type text"
          value={raw}
          onChange={setRaw}
          rows={11}
          placeholder="Paste a draft. Candidates are listed as you type, with the sentence they sit in."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="passive-voice.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Passive voice</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Sentences with a passive candidate"
              value={`${share}%`}
              testid="res-share"
              sub={`${summary.sentencesWithPassive} of ${summary.sentences} sentences`}
            />
            <ResultBox>
              <ResultRow name="hits" label="Candidates found" value={summary.hits.length.toLocaleString("en-US")} />
              <ResultRow name="strong" label="With an expressed agent (by …)" value={summary.strongCount} />
              <ResultRow name="candidate" label="Without an agent" value={summary.candidateCount} />
              <ResultRow name="sentences" label="Sentences" value={summary.sentences.toLocaleString("en-US")} />
              <ResultRow name="words" label="Words" value={summary.words.toLocaleString("en-US")} />
            </ResultBox>
          </>
        )}
      </Panel>

      {hasText && summary.hits.length > 0 && (
        <Panel>
          <PanelTitle>Candidate constructions</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-passives" className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Phrase</th>
                  <th className="py-2 pr-3 font-semibold">Participle</th>
                  <th className="py-2 pr-3 font-semibold">Confidence</th>
                  <th className="py-2 font-semibold">Sentence</th>
                </tr>
              </thead>
              <tbody>
                {summary.hits.slice(0, 50).map((hit, index) => (
                  <tr key={`${hit.index}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">{hit.phrase}</td>
                    <td className="py-2 pr-3 text-foreground">{hit.participle}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{hit.confidence}</td>
                    <td className="py-2 text-muted-foreground">{hit.sentence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && summary.worst.length > 1 && (
        <Panel>
          <PanelTitle>Sentences carrying the most</PanelTitle>
          <ResultBox>
            {summary.worst.map((entry) => (
              <ResultRow
                key={entry.index}
                label={entry.sentence.length > 70 ? `${entry.sentence.slice(0, 70)}…` : entry.sentence}
                value={`${entry.hits} passive${entry.hits === 1 ? "" : "s"}`}
              />
            ))}
          </ResultBox>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>How detection works, and where it is wrong</PanelTitle>
          <div className="space-y-2">
            <Notice>
              A candidate is a form of &quot;be&quot; — optionally separated by an adverb such as &quot;quickly&quot; or
              &quot;never&quot; — followed by a past participle. When a &quot;by&quot; phrase follows within a few
              tokens the hit is marked strong, because an expressed agent is the clearest sign of a true passive.
            </Notice>
            <Notice tone="warn">
              Adjectival participles look identical and are flagged too: &quot;the door is closed&quot; is a state, not
              an action, but it matches the pattern. Read each candidate in its sentence before rewriting; many will be
              correct.
            </Notice>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
