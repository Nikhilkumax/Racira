"use client";

import { useMemo } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  useDebouncedValue,
  useStoredState,
} from "./ui";
import {
  ACTION_CUES,
  DECISION_CUES,
  LABELS,
  QUESTION_CUES,
  formatMeetingSummary,
  summarizeMeeting,
  type MeetingItem,
} from "@/domains/writing/lib/text/meeting-notes.ts";

const NOTES_KEY = "racira.writing.meeting.notes";

/**
 * Meeting summary formatter: raw notes are sorted into decisions, actions and
 * open questions by a published cue list, with the cue printed beside each item
 * so a wrong placement can be spotted and overruled. The notes are kept in this
 * browser only, and the page says so.
 */
export default function MeetingSummaryFormatter() {
  const [raw, setRaw] = useStoredState(NOTES_KEY, "");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => summarizeMeeting(text), [text]);
  const report = useMemo(() => formatMeetingSummary(result), [result]);
  const hasNotes = text.trim().length > 0;

  const section = (category: MeetingItem["category"], title: string, testid: string) => {
    const items = result.items.filter((item) => item.category === category);
    return (
      <Panel key={category}>
        <PanelTitle right={<span className="font-mono text-[10px] text-muted-foreground">{items.length}</span>}>
          {title}
        </PanelTitle>
        {items.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">No {title.toLowerCase()} were matched by the cue list.</p>
        ) : (
          <ul data-testid={testid} className="space-y-3">
            {items.map((item) => (
              <li key={item.index} className="border-t border-border/60 pt-3 first:border-0 first:pt-0">
                <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5">cue: {item.cue}</span>
                  {item.owner && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">owner?: {item.owner}</span>}
                  {item.due && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">due?: {item.due}</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    );
  };

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">stored in this browser</span>}>
          Your notes
        </PanelTitle>
        <TextArea
          name="notes"
          label="Paste or type the raw notes"
          value={raw}
          onChange={setRaw}
          rows={12}
          placeholder={"One idea per sentence works best, e.g.\nDecision: we ship the beta on the fifteenth.\nAction: Sam will send the pricing deck by Friday.\nOpen question: who owns the migration?"}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasNotes ? report : ""} testid="copy-summary" label="Copy summary" />
          <DownloadButton text={hasNotes ? report : ""} filename="meeting-summary.txt" testid="download-summary" label="Download summary" />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Your notes stay in this browser and are never uploaded. There is no account and no server: clearing this
          browser&rsquo;s storage removes them.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Scan result</PanelTitle>
        {!hasNotes ? (
          <EmptyState>Paste meeting notes above — decisions, actions and questions are sorted as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Items sorted"
              value={result.items.length}
              testid="res-counts"
              sub={`of ${result.sentences} sentences · ${result.words} words`}
            />
            <StatGrid>
              <Stat label="Decisions" value={result.counts.decision} testid="res-count-decisions" />
              <Stat label="Actions" value={result.counts.action} testid="res-count-actions" />
              <Stat label="Questions" value={result.counts.question} testid="res-count-questions" />
            </StatGrid>
          </>
        )}
      </Panel>

      {hasNotes && section("decision", "Decisions", "res-decisions")}
      {hasNotes && section("action", "Actions", "res-actions")}
      {hasNotes && section("question", "Open questions", "res-questions")}

      {hasNotes && (
        <Panel>
          <PanelTitle right={<span className="font-mono text-[10px] text-muted-foreground">{result.unclassified.length}</span>}>
            Unclassified sentences
          </PanelTitle>
          {result.unclassified.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">Every sentence carried a cue.</p>
          ) : (
            <ul data-testid="res-unclassified" className="space-y-2">
              {result.unclassified.map((row) => (
                <li key={row.index} className="text-sm text-muted-foreground">
                  {row.text}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <OutputBlock name="report" value={hasNotes ? report : ""} maxHeight={260} mono={false} />
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle>What is checked, and what is assumed</PanelTitle>
        <div className="space-y-2">
          <Notice>
            {LABELS.length} explicit labels (Action:, Decision:, TBD:) are checked first, then {ACTION_CUES.length}{" "}
            action cues, {DECISION_CUES.length} decision cues and {QUESTION_CUES.length} question cues, and finally a
            trailing question mark. Owner and due date are two small patterns — <span className="font-mono">owner: X</span>{" "}
            and <span className="font-mono">X will …</span>, or <span className="font-mono">by Friday</span> — and are
            marked with a question mark because they are suggestions to confirm.
          </Notice>
          <Notice tone="warn">
            A cue list is not comprehension. An action written without a cue (&quot;Priya takes the migration&quot;)
            stays unclassified, and a sentence that merely mentions a decision word can be sorted wrongly. Every item
            shows the cue that placed it, so correcting a section is a matter of reading the cue — and the unclassified
            list is always shown, so nothing is silently discarded.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
