"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextArea, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const SAMPLE =
  "Wrapping text around a shape is the modern equivalent of setting type around a woodcut: the words follow the contour of the object rather than the edge of the column. CSS does this with shape-outside on a floated element, and the shape is described by a circle, an ellipse, an inset box or a polygon.";

type Shape = "circle" | "ellipse" | "inset" | "polygon" | "none";

/** Triangle-ish polygon: percent pairs, each x% y%. */
const POLYGON = "0% 0%, 100% 0%, 50% 100%";

/**
 * Text Box Shape Wrapper — builds the float + shape-outside pair that wraps
 * body copy around a shape. The two declarations that matter are the float
 * (which reserves the block) and the shape (which controls where the text may
 * enter); shape-margin gives the breathing room between them.
 */
export default function TextBoxShapeWrapper() {
  const [fontName, setFontName] = useState("Inter");
  const [text, setText] = useState(SAMPLE);
  const [shape, setShape] = useState<Shape>("circle");
  const [size, setSize] = useState("180");
  const [margin, setMargin] = useState("1.25");
  const [side, setSide] = useState("left");
  const [fontSize, setFontSize] = useState("16");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];
  const s = Math.min(420, Math.max(60, parseFloat(size) || 180));
  const m = Math.min(4, Math.max(0, parseFloat(margin) || 1.25));
  const px = Math.max(12, parseFloat(fontSize) || 16);

  const shapeValue =
    shape === "circle"
      ? "circle(50% at 50% 50%)"
      : shape === "ellipse"
        ? "ellipse(45% 55% at 50% 50%)"
        : shape === "inset"
          ? "inset(6% 8% 10% 4% round 12px)"
          : shape === "polygon"
            ? `polygon(${POLYGON})`
            : "none";

  const css = `.shape-wrap { font-family: ${font.stack}; font-size: ${(px / 16).toFixed(4)}rem; line-height: 1.6; }

.shape-wrap > .shape {
  float: ${side};
  width: ${fmtTrim(s, 0)}px;
  height: ${fmtTrim(s, 0)}px;
  shape-outside: ${shapeValue};
  shape-margin: ${fmtTrim(m, 3)}rem;
  ${side === "left" ? "margin-right: 0.5rem;" : "margin-left: 0.5rem;"}
  background: var(--muted);
}

@supports (shape-outside: circle(50%)) {
  /* shapes only exist in engines that support them; the float alone is the fallback */
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Shape</PanelTitle>
        <div className="space-y-3">
          <Sel name="font" label="Text face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <Sel
            name="shape"
            label="shape-outside"
            value={shape}
            onChange={(v) => setShape(v as Shape)}
            options={[
              { value: "circle", label: "circle(50%)" },
              { value: "ellipse", label: "ellipse(45% 55%)" },
              { value: "inset", label: "inset(6% 8% 10% 4%)" },
              { value: "polygon", label: "polygon(triangle)" },
              { value: "none", label: "none — rectangular float" },
            ]}
          />
          <Sel
            name="side"
            label="Float side"
            value={side}
            onChange={setSide}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
          />
          <SliderNum name="size" label="Float box" unit="px" value={size} onChange={setSize} min={60} max={420} step={10} />
          <SliderNum name="margin" label="shape-margin" unit="rem" value={margin} onChange={setMargin} min={0} max={4} step={0.05} />
          <SliderNum name="fs" label="Text size" unit="px" value={fontSize} onChange={setFontSize} min={12} max={22} step={1} />
          <TextArea name="text" label="Paragraph" value={text} onChange={setText} rows={4} />
        </div>
        <ResBox>
          <Res name="shape" label="Shape function" value={shapeValue} />
          <Res name="margin" label="Clearance" value={`${fmtTrim(m * 16, 1)}px beyond the shape`} />
          <Res name="fallback" label="Without shape-outside support" value="text wraps to the float's rectangular box" />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Wrapped text</PanelTitle>
          <div
            data-testid="shape-wrap-preview"
            className="text-foreground"
            style={{ fontFamily: font.stack, fontSize: `${px}px`, lineHeight: 1.6 }}
          >
            <div
              aria-hidden
              style={{
                float: side as "left",
                width: `${s}px`,
                height: `${s}px`,
                shapeOutside: shapeValue as string,
                shapeMargin: `${m}rem`,
                marginRight: side === "left" ? "0.5rem" : undefined,
                marginLeft: side === "right" ? "0.5rem" : undefined,
                background: "color-mix(in oklab, var(--muted-foreground) 18%, transparent)",
                borderRadius: shape === "circle" ? "50%" : shape === "ellipse" ? "50%" : "12px",
              }}
            />
            <p>{text || SAMPLE}</p>
            <p className="mt-3">
              shape-outside affects only the text flow — the background, border and layout of the float are unchanged, which
              is why the box can be invisible while the text still follows its contour.
            </p>
          </div>
        </Panel>
        <CodeOut code={css} testid="shape-css" />
      </div>
    </CalcLayout>
  );
}
