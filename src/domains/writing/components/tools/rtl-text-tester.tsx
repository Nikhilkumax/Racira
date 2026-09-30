"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  EmptyState,
  HeroStat,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  Select,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  bidiCounts,
  detectDirection,
  paragraphDirections,
} from "@/domains/writing/lib/text/unicode.ts";

const DIRECTION_LABELS: Record<string, string> = {
  rtl: "Right-to-left",
  ltr: "Left-to-right",
  neutral: "Neutral (no letters)",
};

export default function RtlTextTester() {
  const [raw, setRaw] = useState("");
  const [viewDir, setViewDir] = useState<"auto" | "rtl" | "ltr">("auto");
  const text = useDebouncedValue(raw, 250);

  const direction = useMemo(() => detectDirection(text), [text]);
  const paragraphs = useMemo(() => paragraphDirections(text), [text]);
  const counts = useMemo(() => bidiCounts(text), [text]);

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
          placeholder="Paste a mix of Arabic or Hebrew and Latin text to check how it lays out."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select
            name="viewdir"
            label="Preview direction"
            value={viewDir}
            onChange={(next) => setViewDir(next as "auto" | "rtl" | "ltr")}
            options={[
              { value: "auto", label: "Auto (per paragraph)" },
              { value: "rtl", label: "Force right-to-left" },
              { value: "ltr", label: "Force left-to-right" },
            ]}
          />
          <div className="self-end pb-1">
            <CopyButton text={text} testid="copy-text" label="Copy text" />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Detected direction</PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Paragraph direction"
              value={DIRECTION_LABELS[direction] ?? direction}
              testid="res-direction"
              sub={`${paragraphs.length} paragraph${paragraphs.length === 1 ? "" : "s"}`}
            />
            <ResultBox>
              <ResultRow name="rtl-letters" label="Right-to-left letters" value={counts.rtlLetters.toLocaleString("en-US")} />
              <ResultRow name="ltr-letters" label="Left-to-right letters" value={counts.ltrLetters.toLocaleString("en-US")} />
              <ResultRow name="controls" label="Explicit bidi controls" value={counts.bidiControls.toLocaleString("en-US")} />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Direction is the first strong letter of each paragraph (digits and punctuation are ignored), which is
              the same rule a browser uses to pick a default direction for unmarked text.
            </p>
          </>
        )}
      </Panel>

      {paragraphs.length > 0 && (
        <Panel>
          <PanelTitle>Paragraph by paragraph</PanelTitle>
          <ul className="space-y-2" data-testid="paragraph-list">
            {paragraphs.map((paragraph) => (
              <li key={paragraph.index} className="rounded-lg border border-border bg-card/40 p-3">
                <div className="mb-1 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Paragraph {paragraphs.indexOf(paragraph) + 1}</span>
                  <span className="font-mono" data-testid={`paragraph-dir-${paragraphs.indexOf(paragraph)}`}>
                    {paragraph.direction}
                  </span>
                </div>
                <p dir={viewDir === "auto" ? paragraph.direction : viewDir} className="text-sm text-foreground">
                  {paragraph.text}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {text.trim().length > 0 && (
        <Panel>
          <PanelTitle>Rendered side by side</PanelTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">dir=&quot;rtl&quot;</div>
              <p dir="rtl" data-testid="preview-rtl" className="text-sm text-foreground">
                {text}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">dir=&quot;ltr&quot;</div>
              <p dir="ltr" data-testid="preview-ltr" className="text-sm text-foreground">
                {text}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Neither column changes the text — only the direction the browser lays it out in. Copy the text, not the
            layout, into your document.
          </p>
        </Panel>
      )}
    </StackLayout>
  );
}
