"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, SliderNum, TextArea, fmtTrim } from "../ui";

const SAMPLE = `The pull of a baseline grid is that it makes every page look decided rather than assembled. But a grid is only as good as the exceptions it allows: a figure that breaks a column, a heading that opens a new page, a paragraph whose final line carries only one word.

A single word alone on a line is the classic widow, and a first line broken off from its paragraph is an orphan. Both are corrected the same way: by adjusting the measure, the leading or the text, rather than by punishing the reader with more rules.

Typesetting software can reflow a paragraph automatically to remove them; CSS can only ask politely, with widows and orphans, and browsers honour those hints unevenly.`;

/**
 * Widow & Orphan Detector — estimates where single-word lines will fall by
 * measuring the paragraph in the real face at the real size and simulating the
 * line breaks. It reports the paragraphs at risk and the two corrections that
 * work in CSS: a slightly narrower measure, or widows/orphans set to 2 with a
 * balanced last line.
 */
export default function WidowAndOrphanDetector() {
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState("17");
  const [width, setWidth] = useState("600");
  const [leading, setLeading] = useState("1.6");
  const [family, setFamily] = useState("Source Serif 4, Georgia, serif");
  const [widows, setWidows] = useState("2");

  const px = Math.min(28, Math.max(12, parseFloat(size) || 17));
  const w = Math.min(1200, Math.max(240, parseFloat(width) || 600));
  const lh = Math.min(2.4, Math.max(1.2, parseFloat(leading) || 1.6));

  const paragraphs = text.split(/\n+/).filter((p) => p.trim());

  const measure = (s: string) => {
    if (typeof document === "undefined") return s.length * px * 0.5;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return s.length * px * 0.5;
    ctx.font = `${px}px ${family}`;
    return ctx.measureText(s).width;
  };

  const spaceW = measure(" ");

  const analysis = paragraphs.map((p) => {
    const words = p.split(/\s+/);
    let line = "";
    let lineWidth = 0;
    const lines: { words: string[]; width: number }[] = [];
    for (const word of words) {
      const wordW = measure(word);
      const next = line ? lineWidth + spaceW + wordW : wordW;
      if (next > w && line) {
        lines.push({ words: line.split(" "), width: lineWidth });
        line = word;
        lineWidth = wordW;
      } else {
        line = line ? `${line} ${word}` : word;
        lineWidth = next;
      }
    }
    if (line) lines.push({ words: line.split(" "), width: lineWidth });
    const last = lines[lines.length - 1];
    return {
      lines: lines.length,
      lastWords: last?.words.length ?? 0,
      lastLineShort: lines.length > 1 && (last?.width ?? 0) < w * 0.25,
      firstLineShort: lines.length > 1 && (lines[0]?.width ?? 0) < w * 0.25,
      fill: lines.length ? (lines.slice(0, -1).reduce((a, l) => a + l.width, 0) / ((lines.length - 1 || 1) * w)) * 100 : 0,
    };
  });

  const widowCount = analysis.filter((a) => a.lastWords === 1 && a.lines > 1).length;
  const orphanCount = analysis.filter((a) => a.firstLineShort).length;
  const shortLastLines = analysis.filter((a) => a.lastLineShort).length;

  const css = `.prose {
  font-size: ${(px / 16).toFixed(4)}rem;
  line-height: ${fmtTrim(lh, 2)};
  max-width: min(100%, ${w}px);
  widows: ${widows};      /* lines that must remain together at the start of a fragment */
  orphans: ${widows};     /* lines that must remain together at the end */
  text-wrap: pretty;      /* where supported: avoids short last lines automatically */
}

.prose p + p { margin-top: 0.9em; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Text & measure</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={28} step={1} />
          <SliderNum name="width" label="Measure (container)" unit="px" value={width} onChange={setWidth} min={240} max={1200} step={10} />
          <SliderNum name="leading" label="Line height" unit="×" value={leading} onChange={setLeading} min={1.2} max={2.4} step={0.05} />
          <SliderNum name="widows" label="widows / orphans" value={widows} onChange={setWidows} min={1} max={4} step={1} />
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Face (CSS stack)
            </span>
            <input
              type="text"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
            />
          </label>
          <TextArea name="text" label="Paragraphs (one per line break)" value={text} onChange={setText} rows={7} />
        </div>
        <ResBox>
          <Res name="paragraphs" label="Paragraphs analysed" value={String(paragraphs.length)} />
          <Res name="widows" label="Single-word last lines" value={String(widowCount)} />
          <Res name="orphans" label="Short first lines" value={String(orphanCount)} />
          <Res name="short" label="Short last lines (<25% width)" value={String(shortLastLines)} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The simulation measures each word with the Canvas API at the given size and stacks lines until they exceed the
          measure, so the line count and the stranded words are estimated from real metrics rather than character counts.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Paragraph report</PanelTitle>
          <RefTable
            cols={["#", "Lines", "Last line words", "Average fill", "Flag"]}
            rows={analysis.map((a, i) => [
              String(i + 1),
              String(a.lines),
              String(a.lastWords),
              `${fmtTrim(a.fill, 0)}%`,
              a.lastWords === 1 && a.lines > 1
                ? "widow — one word alone"
                : a.firstLineShort
                  ? "orphan — first line broken short"
                  : a.lastLineShort
                    ? "short last line (fix with text-wrap: pretty)"
                    : "clean",
            ])}
            minWidth={560}
          />
        </Panel>

        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="rounded-lg border border-border bg-background p-4">
            <div
              data-testid="widow-preview"
              style={{ fontFamily: family, fontSize: `${px}px`, lineHeight: lh, maxWidth: `${w}px` }}
              className="space-y-3 text-foreground"
            >
              {paragraphs.map((p, i) => (
                <p key={i} style={{ widows: Number(widows), orphans: Number(widows) }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Panel>

        <CodeOut code={css} title="Widow / orphan CSS" testid="widow-css" />
      </div>
    </CalcLayout>
  );
}
