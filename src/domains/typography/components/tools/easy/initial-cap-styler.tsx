"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Radios, Res, ResBox, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "An initial cap opens a chapter; a raised cap opens a page. The distinction is the number of lines the letter occupies — a dropped cap sinks into the text block, a raised cap sits on the first baseline and rises above it, and a small cap matches the first line's capitals without changing the line count.";

type Style = "raised" | "small" | "full" | "none";

/**
 * Initial Cap Styler — compares the four openings a chapter can have: no
 * initial, small caps, raised cap and full-size first word. The measured
 * readouts are the ones that decide the choice in production: the raised cap's
 * rise in line boxes, and whether the opening lines need a text-indent.
 */
export default function InitialCapStyler() {
  const [fontName, setFontName] = useState("Source Serif 4");
  const [text, setText] = useState(SAMPLE);
  const [style, setStyle] = useState<Style>("raised");
  const [size, setSize] = useState("16");
  const [leading, setLeading] = useState("1.6");
  const [capScale, setCapScale] = useState("1.9");
  const [tracking, setTracking] = useState("0.06");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const px = Math.max(12, parseFloat(size) || 16);
  const lh = Math.min(2.2, Math.max(1.2, parseFloat(leading) || 1.6));
  const scale = Math.min(4, Math.max(1.2, parseFloat(capScale) || 1.9));
  const tr = Math.min(0.2, Math.max(0, parseFloat(tracking) || 0.06));
  const body = text.trim() || SAMPLE;
  const firstChar = body.charAt(0);
  const rest = body.slice(1);
  const firstWord = body.split(/\s+/)[0];
  const afterWord = body.slice(firstWord.length);

  const css = `.chapter-opening { font-family: ${font.stack}; font-size: ${(px / 16).toFixed(4)}rem; line-height: ${lh}; }

${style === "raised"
      ? `.chapter-opening > .initial {
  font-size: ${fmtTrim(scale, 4)}em;
  line-height: 0.8;
  float: left;
  margin-right: ${fmtTrim(tr, 3)}em;
}`
      : style === "small"
        ? `.chapter-opening > .initial {
  font-variant: small-caps;
  font-size: 1em;
  letter-spacing: ${fmtTrim(tr, 3)}em;
}`
        : style === "full"
          ? `.chapter-opening > .opening-word {
  font-variant: small-caps;
  font-size: ${fmtTrim(scale * 0.62, 4)}em;
  letter-spacing: ${fmtTrim(tr, 3)}em;
}`
          : `/* no initial */`}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Opening style</PanelTitle>
        <div className="space-y-3">
          <Radios
            name="style"
            value={style}
            onChange={(v) => setStyle(v as Style)}
            ariaLabel="opening style"
            options={[
              { value: "raised", label: "Raised cap" },
              { value: "small", label: "Small cap" },
              { value: "full", label: "First word in caps" },
              { value: "none", label: "No initial" },
            ]}
          />
          <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <SliderNum name="size" label="Body size" unit="px" value={size} onChange={setSize} min={12} max={24} step={1} />
          <SliderNum name="leading" label="Line height" unit="×" value={leading} onChange={setLeading} min={1.2} max={2.2} step={0.05} />
          <SliderNum name="scale" label="Initial scale" unit="em" value={capScale} onChange={setCapScale} min={1.2} max={4} step={0.05} />
          <SliderNum name="track" label="Cap tracking" unit="em" value={tracking} onChange={setTracking} min={0} max={0.2} step={0.005} />
          <TextArea name="text" label="Opening paragraph" value={text} onChange={setText} rows={4} />
        </div>
        <ResBox>
          <Res name="style" label="Applied style" value={style} />
          <Res
            name="rise"
            label="Raised cap rise"
            value={style === "raised" ? `${fmtTrim(scale * px * 0.7, 1)}px above the first baseline` : "—"}
          />
          <Res name="indent" label="First-line indent" value={style === "raised" ? "none needed (float clears)" : "0"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <p className="text-foreground" style={{ fontFamily: font.stack, fontSize: `${px}px`, lineHeight: lh }} data-testid="initialcap-preview">
            {style === "raised" && (
              <span
                style={{
                  float: "left",
                  fontSize: `${scale}em`,
                  lineHeight: 0.8,
                  marginRight: `${tr}em`,
                }}
              >
                {firstChar}
              </span>
            )}
            {style === "small" && <span style={{ fontVariant: "small-caps", letterSpacing: `${tr}em` }}>{firstChar}</span>}
            {style === "full" ? (
              <>
                <span style={{ fontVariant: "small-caps", fontSize: `${scale * 0.62}em`, letterSpacing: `${tr}em` }}>{firstWord}</span>
                {afterWord}
              </>
            ) : (
              style === "small" ? rest : style === "raised" ? rest : body
            )}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            A raised cap only works when the first line has enough words to clear the float; a two-word opening line lets
            the second line slide under the ascender. Check with the real copy, not with a lorem-filled paragraph.
          </p>
        </Panel>
        <CodeOut code={css} testid="initialcap-css" />
      </div>
    </CalcLayout>
  );
}
