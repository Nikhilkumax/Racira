"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
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
import { formaliseEmail } from "@/domains/writing/lib/text/email-to-formal-letter.ts";

/**
 * Email to formal letter: greeting, sign-off, contractions and casual phrases
 * rewritten, with every substitution listed and nothing restructured.
 */
export default function EmailToFormalLetter() {
  const [text, setText] = useState("");
  const [sender, setSender] = useState("");

  const draft = useMemo(() => formaliseEmail(text, { sender }), [text, sender]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The message</PanelTitle>
        <TextArea
          name="text"
          label="Casual email"
          value={text}
          onChange={setText}
          rows={7}
          placeholder={"Hi Sam,\n\nQuick note about the budget...\n\nThanks,\nAlex"}
        />
        <div className="mt-3 max-w-sm">
          <TextInput
            name="sender"
            label="Your name for the signature"
            value={sender}
            onChange={setSender}
            placeholder="Alex Doe"
            hint="optional"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={draft.output ? <CopyButton text={draft.output} testid="copy-letter" /> : undefined}>
          Letter
        </PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState>Paste a message — the letter is assembled as you type.</EmptyState>
        ) : (
          <>
            <StatGrid>
              <Stat label="Body words" value={draft.words} testid="res-words" />
              <Stat label="Substitutions" value={draft.changes.length} testid="res-changes-count" />
              <Stat label="Notes" value={draft.checks.length} testid="res-notes-count" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="letter" value={draft.output} mono={false} />
            </div>
            <div className="mt-3">
              <DownloadButton text={draft.output} filename="letter.txt" testid="download-letter" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Every substitution</PanelTitle>
        {draft.changes.length === 0 ? (
          <EmptyState>Nothing in the published tables appears in this message.</EmptyState>
        ) : (
          <ul className="space-y-2" data-testid="res-changes">
            {draft.changes.map((change, index) => (
              <li key={`${index}-${change.from}`} className="rounded-lg border border-border bg-card/40 px-3 py-2">
                <div className="flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{change.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono text-xs text-foreground">{change.to}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{change.note}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {draft.checks.length > 0 && (
        <Panel>
          <PanelTitle>Notes</PanelTitle>
          <ul className="space-y-2" data-testid="res-notes">
            {draft.checks.map((check) => (
              <li key={check}>
                <Notice tone="warn">{check}</Notice>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The greeting, the sign-off, {""}
            contractions and the phrases in the published table are rewritten, and emoji and runs of exclamation marks
            are removed. Every change is listed.
          </Notice>
          <Notice tone="warn">
            The body is never restructured: a letter that needs a different argument needs a writer. Check the
            signature line and the reader&apos;s name before sending.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
