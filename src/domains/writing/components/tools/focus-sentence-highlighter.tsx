"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Btn,
  Checkbox,
  CopyButton,
  EmptyState,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { wordTokens, wordLength } from "@/domains/writing/lib/text/tokenize.ts";
import { sentenceTokens } from "@/domains/writing/lib/text/tokenize.ts";
import { DEFAULT_WPM, formatDuration } from "@/domains/writing/lib/text/stats.ts";

export default function FocusSentenceHighlighter() {
  const [raw, setRaw] = useState("");
  const [focused, setFocused] = useState(0);
  const [dimOthers, setDimOthers] = useState(true);
  const text = useDebouncedValue(raw, 250);

  const sentences = useMemo(
    () => sentenceTokens(text).map((sentence) => sentence.text.trim()),
    [text],
  );

  // Keep the focus in range when the text shrinks.
  useEffect(() => {
    if (focused >= sentences.length) setFocused(0);
  }, [focused, sentences.length]);

  const current = sentences[focused] ?? "";
  const currentWords = useMemo(() => wordTokens(current), [current]);
  const currentStats = useMemo(() => {
    const words = currentWords.length;
    return {
      words,
      characters: current.length,
      longest: currentWords.reduce((best, token) => Math.max(best, wordLength(token.text)), 0),
      readingSeconds: (words / DEFAULT_WPM) * 60,
    };
  }, [current, currentWords]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Paste or type text"
          value={raw}
          onChange={setRaw}
          rows={8}
          placeholder="Paste a paragraph, then click the sentence you want to work on."
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Btn kind="ghost" testid="btn-prev" onClick={() => setFocused((index) => Math.max(0, index - 1))} disabled={sentences.length === 0}>
            Previous sentence
          </Btn>
          <Btn kind="ghost" testid="btn-next" onClick={() => setFocused((index) => Math.min(sentences.length - 1, index + 1))} disabled={sentences.length === 0}>
            Next sentence
          </Btn>
          <Checkbox name="dim" label="Dim the other sentences" checked={dimOthers} onChange={setDimOthers} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={<span className="font-mono text-[10px] text-muted-foreground">{sentences.length} sentences</span>}>
          Focused sentence
        </PanelTitle>
        {sentences.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="rounded-xl border-l-4 border-primary bg-primary/10 px-4 py-4">
              <p data-testid="res-focused" className="text-base leading-relaxed text-foreground">
                {current}
              </p>
            </div>
            <div className="mt-4">
              <ResultBox>
                <ResultRow name="index" label="Sentence number" value={`${focused + 1} of ${sentences.length}`} />
                <ResultRow name="focused-words" label="Words" value={String(currentStats.words)} />
                <ResultRow name="focused-characters" label="Characters" value={String(currentStats.characters)} />
                <ResultRow name="focused-longest" label="Longest word (characters)" value={String(currentStats.longest)} />
                <ResultRow name="focused-reading" label="Reading time" value={formatDuration(currentStats.readingSeconds)} />
              </ResultBox>
            </div>
            <div className="mt-3">
              <CopyButton text={current} testid="copy-focused" label="Copy this sentence" />
            </div>
          </>
        )}
      </Panel>

      {sentences.length > 0 && (
        <Panel>
          <PanelTitle>All sentences</PanelTitle>
          <ol className="space-y-1.5" data-testid="sentence-list">
            {sentences.map((sentence, index) => {
              const isFocused = index === focused;
              return (
                <li key={index}>
                  <button
                    type="button"
                    data-testid={`sentence-${index}`}
                    onClick={() => setFocused(index)}
                    aria-current={isFocused}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      isFocused
                        ? "border-primary bg-primary/10 text-foreground"
                        : dimOthers
                          ? "border-transparent text-muted-foreground hover:border-border hover:bg-muted/30"
                          : "border-border text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <span className="mr-2 font-mono text-xs text-muted-foreground">{index + 1}</span>
                    {sentence}
                  </button>
                </li>
              );
            })}
          </ol>
        </Panel>
      )}
    </StackLayout>
  );
}
