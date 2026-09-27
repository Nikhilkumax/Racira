"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, SliderNum, TextInput, fmtTrim } from "../ui";

/**
 * Caption & Footnote Scale — the small end of a type scale: captions,
 * footnotes, superscripts, endnotes and legal lines. All sizes derive from the
 * body size, and the readouts flag the sizes that fall below the practical
 * legibility floor (~11px for continuous reading, ~9px for reference matter).
 */
export default function CaptionAndFootnoteScale() {
  const [body, setBody] = useState("16");
  const [caption, setCaption] = useState("0.8125");
  const [footnote, setFootnote] = useState("0.75");
  const [superRatio, setSuperRatio] = useState("0.65");
  const [sample, setSample] = useState("Small type still has to be readable");

  const b = Math.max(10, parseFloat(body) || 16);
  const cap = Math.max(0.5, parseFloat(caption) || 0.8125);
  const foot = Math.max(0.5, parseFloat(footnote) || 0.75);
  const sup = Math.min(0.9, Math.max(0.5, parseFloat(superRatio) || 0.65));

  const items = [
    { name: "Body", rem: 1, lh: 1.6, use: "paragraph copy" },
    { name: "Caption", rem: cap, lh: 1.45, use: "figure captions, table notes" },
    { name: "Footnote", rem: foot, lh: 1.4, use: "footnotes, endnotes" },
    { name: "Legal / fine print", rem: foot * 0.9, lh: 1.35, use: "terms, disclaimers" },
    { name: "Superscript", rem: 1 * sup, lh: 1, use: "reference marks" },
  ];

  const rows = items.map((i) => [
    i.name,
    `${fmtTrim(i.rem, 4)}rem`,
    `${fmtTrim(i.rem * b, 2)}px`,
    fmtTrim(i.lh, 2),
    i.rem * b < 11 ? "below continuous-reading floor" : "safe",
    i.use,
  ]);

  const css = `:root {
  --text-caption: ${fmtTrim(cap, 4)}rem;   /* ${fmtTrim(cap * b, 2)}px */
  --text-footnote: ${fmtTrim(foot, 4)}rem; /* ${fmtTrim(foot * b, 2)}px */
  --text-sup: ${fmtTrim(sup, 2)}em;
}

figcaption {
  font-size: var(--text-caption);
  line-height: 1.45;
}

sup, .footnote-mark {
  font-size: var(--text-sup);
  line-height: 0;
  vertical-align: super;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Scale inputs</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="body" label="Body size" unit="px" value={body} onChange={setBody} min={12} max={28} step={1} />
          <SliderNum name="caption" label="Caption" unit="× body" value={caption} onChange={setCaption} min={0.6} max={0.95} step={0.0025} />
          <SliderNum name="footnote" label="Footnote" unit="× body" value={footnote} onChange={setFootnote} min={0.55} max={0.9} step={0.0025} />
          <SliderNum name="sup" label="Superscript" unit="× body" value={superRatio} onChange={setSuperRatio} min={0.5} max={0.9} step={0.01} />
          <TextInput name="sample" label="Sample text" value={sample} onChange={setSample} />
        </div>
        <RefTable cols={["Role", "rem", "px", "line-height", "Check", "Used for"]} rows={rows} minWidth={560} />
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Rendered roles</PanelTitle>
          <div className="space-y-3" data-testid="small-type-preview">
            {items.map((i) => (
              <div key={i.name} className="flex items-baseline gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <span className="w-32 shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {i.name}
                </span>
                <span
                  className="min-w-0 flex-1 text-foreground"
                  style={{ fontSize: `${i.rem * b}px`, lineHeight: i.lh }}
                >
                  {sample || "Small type"} — {i.use}
                  {i.name === "Superscript" && <sup style={{ fontSize: "0.65em" }}>1</sup>}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Small reference matter can go below 11px, but continuous reading text cannot — a caption that has to be read
            like a sentence should stay at or above the floor.
          </p>
        </Panel>
        <CodeOut code={css} testid="small-scale-css" />
      </div>
    </CalcLayout>
  );
}
