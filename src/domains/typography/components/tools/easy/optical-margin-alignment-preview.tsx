"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

interface Hang {
  ch: string;
  amount: number; // em units to pull left
  label: string;
}

const HANG_CHARS: Hang[] = [
  { ch: "“", amount: 0.36, label: "opening double quote" },
  { ch: "‘", amount: 0.26, label: "opening single quote" },
  { ch: "A", amount: 0.06, label: "capital A — pointed apex" },
  { ch: "V", amount: 0.06, label: "capital V" },
  { ch: "T", amount: 0.04, label: "capital T — crossbar overhang" },
  { ch: "J", amount: 0.04, label: "capital J" },
  { ch: "1", amount: 0.08, label: "lining 1 — flag overhang" },
  { ch: "•", amount: 0.3, label: "bullet" },
  { ch: "—", amount: 0.12, label: "em dash" },
];

/**
 * Optical Margin Alignment Preview — a text block aligned on its box edge looks
 * ragged where a glyph's ink starts inside its advance width: quotes, bullets,
 * pointed capitals and the numeral 1 all open a visible notch. Hanging those
 * glyphs by their sidebearing pulls the ink edge flush, which is what
 * InDesign calls optical margin alignment and CSS does with a negative
 * text-indent or the `hanging-punctuation` property.
 */
export default function OpticalMarginAlignmentPreview() {
  const [fontName, setFontName] = useState("Fraunces");
  const [line, setLine] = useState("“Optical alignment is invisible when it is right and obvious when it is missing.”");
  const [size, setSize] = useState("22");
  const [enabled, setEnabled] = useState("on");
  const [hangingPunct, setHangingPunct] = useState("first last");
  const [hang, setHang] = useState("0.36");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.min(64, Math.max(12, parseFloat(size) || 22));
  const amount = Math.min(0.6, Math.max(0, parseFloat(hang) || 0.36));
  const on = enabled === "on";
  const first = line.trim().charAt(0);

  const css = `.optical-margin {
  font-family: ${font.stack};
  font-size: ${(px / 16).toFixed(4)}rem;
  hanging-punctuation: ${hangingPunct};   /* Safari-only; harmless elsewhere */
  /* the portable approach: measure once per glyph class and hang it */
  text-indent: -${fmtTrim(amount, 3)}em;
  padding-left: ${fmtTrim(amount, 3)}em;
}

/* per-glyph fine tuning */
.optical-margin[data-first="“"] { text-indent: -0.36em; }
.optical-margin[data-first="‘"] { text-indent: -0.26em; }
.optical-margin[data-first="A"], .optical-margin[data-first="V"] { text-indent: -0.06em; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Alignment</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="font"
            label="Font family"
            value={fontName}
            onChange={setFontName}
            options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
          />
          <TextInput name="line" label="Line (start with punctuation to see the hang)" value={line} onChange={setLine} />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={64} step={1} />
          <SliderNum name="hang" label="Hang amount" unit="em" value={hang} onChange={setHang} min={0} max={0.6} step={0.01} />
          <Sel
            name="enabled"
            label="Optical alignment"
            value={enabled}
            onChange={setEnabled}
            options={[
              { value: "on", label: "On (hang the first glyph)" },
              { value: "off", label: "Off (aligned to the box edge)" },
            ]}
          />
          <Sel
            name="hp"
            label="hanging-punctuation"
            value={hangingPunct}
            onChange={setHangingPunct}
            options={[
              { value: "first last", label: "first last" },
              { value: "first", label: "first" },
              { value: "none", label: "none" },
            ]}
          />
        </div>
        <ResBox>
          <Res name="first" label="First character" value={first ? `${first} (U+${first.codePointAt(0)!.toString(16).toUpperCase()})` : "—"} />
          <Res name="match" label="Known sidebearing" value={HANG_CHARS.find((h) => h.ch === first)?.label ?? "not in the measured table"} />
          <Res name="offset" label="Applied offset" value={on ? `-${fmtTrim(amount, 3)}em` : "0em"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Comparison</PanelTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">box edge</span>
              <p
                className="mt-1 border-l-2 border-dashed border-rose-400 pl-0 text-foreground"
                style={{ fontFamily: font.stack, fontSize: `${px}px`, lineHeight: 1.35 }}
              >
                {line || "“Alignment”"}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">optically hung</span>
              <p
                data-testid="optical-preview"
                className="mt-1 border-l-2 border-dashed border-emerald-400 text-foreground"
                style={{
                  fontFamily: font.stack,
                  fontSize: `${px}px`,
                  lineHeight: 1.35,
                  marginLeft: on ? `-${amount}em` : "0em",
                  paddingLeft: on ? `${amount}em` : "0em",
                }}
              >
                {line || "“Alignment”"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The dashed rules mark the true text edge. Hanging punctuation moves ink, not layout: the box keeps its width,
            so no reflow happens downstream.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Measured hang amounts (em)</PanelTitle>
          <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
            {HANG_CHARS.map((h) => (
              <li key={h.ch} className="flex items-center gap-2">
                <span className="w-6 font-mono text-base text-foreground">{h.ch}</span>
                <span className="font-mono">-{h.amount.toFixed(2)}em</span>
                <span className="truncate">{h.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Figures are typical sidebearing fractions; a font's actual values differ, so keep the amount adjustable per face.
          </p>
        </Panel>
        <CodeOut code={css} testid="optical-css" />
      </div>
    </CalcLayout>
  );
}
