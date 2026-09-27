"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "A measure of 45 to 75 characters is the band where the eye can return from the end of a line without losing its place. Below it the reader's rhythm breaks on every line; above it the return sweep becomes a search.";

/**
 * Paragraph Width Optimizer — measures the real measure, in characters, by
 * measuring the text with the Canvas API rather than assuming an average
 * character width. The average glyph width of "n" is a poor proxy: it varies by
 * face, weight and letter frequency, and the optimizer uses the actual sample.
 */
export default function ParagraphWidthOptimizer() {
  const [fontName, setFontName] = useState("Lora");
  const [size, setSize] = useState("18");
  const [text, setText] = useState(SAMPLE);
  const [width, setWidth] = useState("640");
  const [leading, setLeading] = useState("1.6");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[3];
  const px = Math.min(32, Math.max(12, parseFloat(size) || 18));
  const w = Math.min(1600, Math.max(240, parseFloat(width) || 640));
  const lh = Math.min(2.4, Math.max(1.1, parseFloat(leading) || 1.6));

  const measure = (sample: string) => {
    if (typeof document === "undefined") return { chars: 0, perEm: 0.5 };
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return { chars: 0, perEm: 0.5 };
    ctx.font = `${px}px ${font.stack}`;
    const full = ctx.measureText(sample).width;
    const perEm = full / Math.max(1, sample.length) / px;
    return { chars: Math.round(w / (perEm * px)), perEm };
  };

  const { chars, perEm } = measure(text || SAMPLE);
  const verdict = chars < 40 ? "too narrow — the line rhythm breaks" : chars > 80 ? "too wide — the return sweep loses the line" : "inside the 45–80 character band";
  const idealWidth = Math.round(66 * perEm * px);
  const lineCount = Math.round((text.length / Math.max(1, chars)) * 1.4) || 1;

  const css = `.measure {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  line-height: ${fmtTrim(lh, 2)};
  max-width: ${idealWidth}px;   /* ${fmtTrim(idealWidth / px, 2)}em · ≈ ${chars} characters */
  /**
   * ch is the width of "0" — close enough for a first pass, but measure the
   * real sample when the face has unusual digit widths.
   */
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Measure</PanelTitle>
        <div className="space-y-3">
          <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={32} step={1} />
          <SliderNum name="width" label="Container width" unit="px" value={width} onChange={setWidth} min={240} max={1600} step={20} />
          <SliderNum name="leading" label="Line height" unit="×" value={leading} onChange={setLeading} min={1.1} max={2.4} step={0.05} />
          <TextArea name="text" label="Real sample text" value={text} onChange={setText} rows={5} />
        </div>
        <ResBox>
          <Res name="chars" label="Characters per line" value={`${chars}`} />
          <Res name="perEm" label="Average glyph width" value={`${fmtTrim(perEm, 4)}em`} />
          <Res name="ideal" label="Ideal container (66 chars)" value={`${idealWidth}px`} />
          <Res name="lines" label="Approximate lines" value={`${lineCount} at this width`} />
          <Res name="verdict" label="Measure check" value={verdict} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Reference table</PanelTitle>
          <RefTable
            cols={["Characters", "Verdict", "Typical use"]}
            rows={[
              ["< 30", "very narrow", "mobile UI labels, sidebars; hyphenation essential"],
              ["30–44", "narrow", "mobile body copy, multi-column print"],
              ["45–75", "comfortable", "the standard reading band for body text"],
              ["76–90", "wide", "needs more leading and a shorter measure on narrow screens"],
              ["> 90", "very wide", "only for large display text, never for reading"],
            ]}
            minWidth={520}
          />
        </Panel>

        <Panel>
          <PanelTitle>Preview at the measured measure</PanelTitle>
          <div className="rounded-lg border border-border bg-background p-4">
            <p
              data-testid="measure-preview"
              className="text-foreground"
              style={{ fontFamily: font.stack, fontSize: `${px}px`, lineHeight: lh, maxWidth: `${idealWidth}px` }}
            >
              {text || SAMPLE}
            </p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="font-mono">{idealWidth}px ≈ {chars} chars</span>
              <span className="h-px flex-1 bg-border" />
              <span>measured with the Canvas API · {fmtTrim(perEm, 3)}em average glyph</span>
            </div>
          </div>
        </Panel>

        <CodeOut code={css} title="Measure CSS" testid="measure-css" />
        <Panel>
          <PanelTitle>Why not just count characters?</PanelTitle>
          <p className="text-sm leading-relaxed text-foreground">
            Counting characters assumes an average width, and the average differs by face: a condensed face fits ~25% more
            characters in the same box than a wide one at the same size. Measuring the real sample in the real face at the
            real size is the only way the number means anything — which is what this tool does.
          </p>
        </Panel>
      </div>
    </CalcLayout>
  );
}
