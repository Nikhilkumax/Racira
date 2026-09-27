"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, Radios, RefTable, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "Justified text sets both edges flush by stretching word spaces. Without hyphenation the spaces on a narrow measure can open into rivers that pull the eye down the page; with hyphenation the same measure tightens and the texture evens out.";

type Align = "left" | "justify" | "center" | "right";

/**
 * Text Justification Previewer — renders the same paragraph under each
 * alignment and, for justified text, estimates the space stretch from the
 * line's character count. Justification is only defensible when hyphenation is
 * available and the measure is wide enough; the readout names that threshold.
 */
export default function TextJustificationPreviewer() {
  const [fontName, setFontName] = useState("Lora");
  const [text, setText] = useState(SAMPLE);
  const [align, setAlign] = useState<Align>("justify");
  const [measure, setMeasure] = useState("62");
  const [size, setSize] = useState("16");
  const [hyphens, setHyphens] = useState("auto");
  const [hyphenateLast, setHyphenateLast] = useState("no");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const cm = Math.max(28, parseFloat(measure) || 62);
  const px = Math.max(12, parseFloat(size) || 16);
  const approxChars = Math.round(cm / (px * 0.031));
  const naturalPerLine = Math.round(cm * 1.9);
  const stretch = align === "justify" ? (hyphens === "none" ? 1.18 : 1.06) : 1;

  const css = `.justified {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  line-height: 1.6;
  text-align: ${align};
  max-width: ${fmtTrim(cm, 0)}ch;
  hyphens: ${hyphens};
  hyphenate-limit-chars: 6 3 3;
  ${hyphenateLast === "no" ? "" : "hyphenate-limit-lines: 2;"}
  overflow-wrap: break-word;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Layout</PanelTitle>
        <div className="space-y-3">
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Alignment
            </span>
            <Radios
              name="align"
              value={align}
              onChange={(v) => setAlign(v as Align)}
              ariaLabel="text alignment"
              options={[
                { value: "left", label: "Ragged right" },
                { value: "justify", label: "Justified" },
                { value: "center", label: "Centred" },
                { value: "right", label: "Ragged left" },
              ]}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              hyphens
            </span>
            <Radios
              name="hyphens"
              value={hyphens}
              onChange={setHyphens}
              ariaLabel="hyphens"
              options={[
                { value: "auto", label: "auto (language-aware)" },
                { value: "manual", label: "manual (soft hyphens only)" },
                { value: "none", label: "none" },
              ]}
            />
          </div>
          <SliderNum name="measure" label="Measure" unit="ch" value={measure} onChange={setMeasure} min={28} max={110} step={1} />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={24} step={1} />
          <TextArea name="text" label="Paragraph" value={text} onChange={setText} rows={4} />
          <Radios
            name="last"
            value={hyphenateLast}
            onChange={setHyphenateLast}
            ariaLabel="hyphenate-limit-lines"
            options={[
              { value: "no", label: "No consecutive-hyphen limit" },
              { value: "yes", label: "Limit to 2 consecutive" },
            ]}
          />
        </div>
        <RefTable
          cols={["Measure", "≈ characters/line", "Space stretch", "Verdict"]}
          rows={[
            [`${fmtTrim(cm, 0)}ch`, `≈ ${approxChars}`, `${stretch.toFixed(2)}×`, cm < 45 ? "too narrow to justify" : cm > 85 ? "too wide to justify" : "workable"],
            ["Rivers", hyphens === "none" ? "likely" : "rare", "—", hyphens === "none" ? "enable hyphens: auto" : "ok"],
          ]}
          minWidth={480}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Justified text is a good fit for print and for wide measures; on the web, ragged right is the safer default at
          narrow widths. Judge it here by eye, not by theory.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Preview</PanelTitle>
        <p
          data-testid="justify-preview"
          className="text-foreground"
          style={{
            fontFamily: font.stack,
            fontSize: `${px}px`,
            lineHeight: 1.6,
            textAlign: align,
            maxWidth: `${cm}ch`,
            hyphens: hyphens as "auto",
            overflowWrap: "break-word",
          }}
        >
          {text || SAMPLE}
        </p>
      </Panel>
    </CalcLayout>
  );
}
