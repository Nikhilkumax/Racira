"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Row, Sel, SliderNum, TextInput } from "../ui";

/**
 * Text Gradient Maker — gradient text is `background-image` + `background-clip:
 * text` + a transparent fill, and it fails in three predictable ways: no
 * background-clip support, a selection highlight that becomes invisible, and
 * contrast that varies along the ramp. The tool emits the declaration with a
 * `@supports` fallback colour and reports the worst-case contrast of the ramp
 * against a chosen background.
 */
export default function TextGradientMaker() {
  const [text, setText] = useState("Gradient headline");
  const [from, setFrom] = useState("#6366f1");
  const [via, setVia] = useState("#ec4899");
  const [to, setTo] = useState("#f59e0b");
  const [angle, setAngle] = useState("90");
  const [size, setSize] = useState("56");
  const [weight, setWeight] = useState("700");
  const [mode, setMode] = useState("linear");
  const [fallback, setFallback] = useState("#6366f1");

  const stops = mode === "three" ? [from, via, to] : [from, to];
  const gradient =
    mode === "linear"
      ? `linear-gradient(${angle}deg, ${stops.join(", ")})`
      : `linear-gradient(${angle}deg, ${stops.join(", ")})`;

  const luminance = (hex: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return 0.5;
    const n = parseInt(m[1], 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const bg = "#ffffff";
  const worst = Math.min(...stops.map((s) => ratio(s, bg)));

  const css = `.gradient-text {
  background-image: ${gradient};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  /* fallback for engines without background-clip: text */
  color: ${fallback};
}

@supports (background-clip: text) or (-webkit-background-clip: text) {
  .gradient-text { color: transparent; }
}

.gradient-text::selection { background: ${from}; color: #fff; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Gradient</PanelTitle>
        <div className="space-y-3">
          <TextInput name="text" label="Text" value={text} onChange={setText} />
          <Sel
            name="mode"
            label="Stop count"
            value={mode}
            onChange={setMode}
            options={[
              { value: "linear", label: "Two stops" },
              { value: "three", label: "Three stops (with midpoint)" },
            ]}
          />
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "From", value: from, set: setFrom },
              { label: "Via", value: via, set: setVia, disabled: mode !== "three" },
              { label: "To", value: to, set: setTo },
            ].map((c) => (
              <label key={c.label} className={`block ${c.disabled ? "opacity-40" : ""}`}>
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </span>
                <input
                  type="color"
                  value={c.value}
                  disabled={c.disabled}
                  onChange={(e) => c.set(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background"
                />
              </label>
            ))}
          </div>
          <SliderNum name="angle" label="Angle" unit="deg" value={angle} onChange={setAngle} min={0} max={360} step={5} />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={18} max={140} step={1} />
          <Row label="Fallback colour" controlWidth="sm:w-40">
            <input
              type="color"
              value={fallback}
              onChange={(e) => setFallback(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background"
            />
          </Row>
        </div>
        <ResBox>
          <Res name="gradient" label="Gradient" value={gradient} />
          <Res name="worst" label="Worst stop contrast on white" value={`${worst.toFixed(2)}:1`} />
          <Res
            name="aa"
            label="AA large text (3:1)"
            value={worst >= 3 ? "passes at every stop" : "fails at the lightest stop"}
          />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <p
            data-testid="gradient-preview"
            style={{
              backgroundImage: gradient,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              fontSize: `${parseFloat(size) || 56}px`,
              fontWeight: parseFloat(weight) || 700,
              lineHeight: 1.1,
            }}
            className="break-words"
          >
            {text || "Gradient"}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Selection colour is set explicitly above: without it, selected gradient text can become invisible because the
            fill is transparent.
          </p>
        </Panel>
        <CodeOut code={css} testid="gradient-css" />
      </div>
    </CalcLayout>
  );
}
