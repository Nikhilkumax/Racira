"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  EmptyState,
  Notice,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { rewriteSentences } from "@/domains/writing/lib/text/sentence-rewriter.ts";

/**
 * Sentence rewriter: four documented sentence-level moves applied to each
 * sentence of a pasted paragraph, with the result of each shown side by side.
 */
export default function SentenceRewriter() {
  const [text, setText] = useState("");
  const report = useMemo(() => rewriteSentences(text), [text]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Text to rewrite"
          value={text}
          onChange={setText}
          rows={6}
          placeholder="Paste a paragraph — every sentence is rewritten on its own."
          hint={`${report.sentences} sentences`}
        />
      </Panel>

      <Panel>
        <PanelTitle>Rewrites</PanelTitle>
        {report.sentences === 0 ? (
          <EmptyState>Paste a sentence — each one is rewritten on its own.</EmptyState>
        ) : (
          <>
            <StatGrid>
              <Stat label="Sentences" value={report.sentences} testid="res-sentences" />
              <Stat label="With a rewrite" value={report.withVariants} testid="res-with-variants" />
              <Stat label="Rewrites offered" value={report.totalVariants} testid="res-variants" />
            </StatGrid>

            <div className="mt-4 space-y-3" data-testid="res-rewrites">
              {report.rewrites.map((rewrite, index) => (
                <div key={`${index}-${rewrite.source}`} className="rounded-xl border border-border bg-card/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Original · {rewrite.words} words
                  </p>
                  <p className="mt-1 text-sm text-foreground">{rewrite.source}</p>

                  {rewrite.variants.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No documented move applies; the sentence stands as written.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {rewrite.variants.map((variant) => (
                        <li
                          key={variant.id}
                          className="rounded-lg border border-border bg-background px-3 py-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                                {variant.label}
                              </p>
                              <p className="mt-1 text-sm text-foreground">{variant.text}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{variant.note}</p>
                            </div>
                            <CopyButton text={variant.text} testid={`copy-${variant.id}`} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {rewrite.notes.length > 0 && (
                    <ul className="mt-2 space-y-1" data-testid="res-notes">
                      {rewrite.notes.map((note) => (
                        <li key={note} className="text-xs text-muted-foreground">
                          {note}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The rewriter applies four published moves — move a clause, split a compound sentence, cut a filler
            adverb — and shows the result of each. It does not paraphrase meaning and it never adds a fact.
          </Notice>
          <Notice tone="warn">
            A sentence with no rewrite is not a sentence with a problem. Only the draft can say whether a rewrite is
            an improvement, so read each variant in context before keeping it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
