"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  Select,
  StackLayout,
  TextArea,
  TextInput,
  useDebouncedValue,
} from "./ui";
import {
  bidiControlList,
  bidiWrapLabel,
  bidiCounts,
  wrapBidi,
  type BidiWrapMode,
} from "@/domains/writing/lib/text/unicode.ts";

const MODES: { value: BidiWrapMode; label: string }[] = [
  { value: "fsi", label: "FSI — first-strong isolate (default choice)" },
  { value: "rli", label: "RLI — right-to-left isolate" },
  { value: "lri", label: "LRI — left-to-right isolate" },
  { value: "rle", label: "RLE — right-to-left embedding" },
  { value: "lre", label: "LRE — left-to-right embedding" },
  { value: "rlo", label: "RLO — right-to-left override" },
  { value: "lro", label: "LRO — left-to-right override" },
];

export default function BidirectionalTextTester() {
  const [raw, setRaw] = useState("");
  const [segment, setSegment] = useState("");
  const [mode, setMode] = useState<BidiWrapMode>("fsi");
  const text = useDebouncedValue(raw, 250);

  const result = useMemo(() => {
    const target = segment.length > 0 ? segment : text;
    if (target.length === 0) return { output: "", replaced: 0, appended: false };
    if (segment.length > 0 && text.includes(segment)) {
      return { output: text.replace(segment, wrapBidi(segment, mode)), replaced: 1, appended: false };
    }
    if (segment.length > 0) {
      return { output: `${text}${text ? "\n" : ""}${wrapBidi(segment, mode)}`, replaced: 0, appended: true };
    }
    return { output: wrapBidi(text, mode), replaced: 0, appended: false };
  }, [text, segment, mode]);

  const controls = useMemo(() => bidiControlList(result.output), [result.output]);
  const counts = useMemo(() => bidiCounts(text), [text]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Text and segment</PanelTitle>
        <TextArea
          name="text"
          label="Full text"
          value={raw}
          onChange={setRaw}
          rows={6}
          placeholder="Paste the paragraph that mixes directions, e.g. English with an Arabic phrase inside."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput
            name="segment"
            label="Segment to isolate (optional)"
            value={segment}
            onChange={setSegment}
            placeholder="e.g. مرحبا"
          />
          <Select
            name="mode"
            label="Control pair"
            value={mode}
            onChange={(next) => setMode(next as BidiWrapMode)}
            options={MODES}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Isolates (FSI/RLI/LRI … PDI) are the modern control; embeddings and overrides (RLE/LRE/RLO/LRO … PDF) are
          the legacy form that can leak into surrounding text. The wrapped output contains real Unicode control
          characters — {bidiWrapLabel(mode)}.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Wrapped output</PanelTitle>
        {result.output.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <pre
              data-testid="res-wrapped"
              className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm text-foreground"
            >
              {result.output}
            </pre>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={result.output} testid="copy-wrapped" label="Copy wrapped text" />
              <DownloadButton text={result.output} filename="bidi-wrapped.txt" testid="download-wrapped" label="Download" />
            </div>
            <div className="mt-4">
              <ResultBox>
                <ResultRow name="replaced" label="Segment replaced in place" value={result.replaced > 0 ? "yes" : result.appended ? "no — appended as a new line" : "wrapped the whole text"} />
                <ResultRow name="controls" label="Control characters added" value={String(controls.length)} />
                <ResultRow name="rtl-letters" label="RTL letters in source" value={counts.rtlLetters.toLocaleString("en-US")} />
                <ResultRow name="ltr-letters" label="LTR letters in source" value={counts.ltrLetters.toLocaleString("en-US")} />
              </ResultBox>
            </div>
          </>
        )}
      </Panel>

      {controls.length > 0 && (
        <Panel>
          <PanelTitle>Control characters in the output</PanelTitle>
          <ResultBox>
            {controls.map((control) => (
              <ResultRow key={`${control.index}-${control.hex}`} label={`Offset ${control.index} — ${control.label}`} value={control.hex} />
            ))}
          </ResultBox>
        </Panel>
      )}

      {text.trim().length > 0 && (
        <Panel>
          <PanelTitle>Visual comparison</PanelTitle>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Without controls</div>
              <p data-testid="preview-plain" className="text-sm text-foreground">
                {text}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">With controls</div>
              <p data-testid="preview-controlled" className="text-sm text-foreground">
                {result.output}
              </p>
            </div>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
