"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";

const INK = "#22252b";

/**
 * 3D Text Effect Preview — builds an extruded look the way CSS actually does
 * it: a stack of hard-edged text-shadows (one per depth step) plus an optional
 * perspective transform for the vanishing direction. The readout reports the
 * shadow count, which is the real cost of the effect — 40 layers is a lot of
 * paint work per frame for a hero animation.
 */
export default function ThreeDTextEffectPreview() {
  const [text, setText] = useState("EXTRUDE");
  const [size, setSize] = useState("84");
  const [depth, setDepth] = useState("14");
  const [step, setStep] = useState("1");
  const [ink, setInk] = useState(INK);
  const [angle, setAngle] = useState("135");
  const [perspective, setPerspective] = useState("none");

  const px = Math.min(180, Math.max(24, parseFloat(size) || 84));
  const d = Math.min(40, Math.max(1, parseFloat(depth) || 14));
  const s = Math.min(4, Math.max(0.5, parseFloat(step) || 1));
  const a = (parseFloat(angle) || 135) * (Math.PI / 180);
  const dx = Math.cos(a) * s;
  const dy = Math.sin(a) * s;
  const count = Math.max(1, Math.round(d / s));

  const layers: string[] = [];
  for (let i = 1; i <= count; i++) {
    const ratio = i / count;
    /* front of the extrusion is darkest, the tail fades */
    const alpha = 0.12 + 0.08 * (1 - ratio);
    layers.push(`${fmtTrim(dx * i, 3)}px ${fmtTrim(dy * i, 3)}px 0 rgba(0,0,0,${fmtTrim(0.15 + 0.05 * (1 - ratio), 3)})`);
    if (i === count) layers.push(`${fmtTrim(dx * i, 3)}px ${fmtTrim(dy * i, 3)}px 1px rgba(0,0,0,${fmtTrim(alpha * 2, 3)})`);
  }

  const css = `.extruded {
  font-size: ${(px / 16).toFixed(4)}rem;
  font-weight: 800;
  color: ${ink};
  letter-spacing: 0.01em;
  text-shadow: ${layers.join(",\n    ")};
${perspective === "none" ? "" : `  transform: perspective(${px * 6}px) rotate3d(1, 0.35, 0, ${perspective}deg);\n`}}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Extrusion</PanelTitle>
        <div className="space-y-3">
          <TextInput name="text" label="Text" value={text} onChange={setText} />
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={24} max={180} step={2} />
          <SliderNum name="depth" label="Depth" unit="px" value={depth} onChange={setDepth} min={1} max={40} step={1} />
          <SliderNum name="step" label="Step" unit="px" value={step} onChange={setStep} min={0.5} max={4} step={0.5} />
          <SliderNum name="angle" label="Direction" unit="deg" value={angle} onChange={setAngle} min={0} max={360} step={5} />
          <Sel
            name="persp"
            label="Perspective"
            value={perspective}
            onChange={setPerspective}
            options={[
              { value: "none", label: "Flat extrusion" },
              { value: "12", label: "Slight tilt (12°)" },
              { value: "24", label: "Strong tilt (24°)" },
            ]}
          />
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Face colour</span>
            <input type="color" value={ink} onChange={(e) => setInk(e.target.value)} className="h-9 w-full rounded-lg border border-border" />
          </label>
        </div>
        <ResBox>
          <Res name="layers" label="Shadow layers generated" value={String(layers.length)} />
          <Res name="cost" label="Paint cost" value={layers.length > 24 ? "high — avoid animating this element" : "moderate"} />
          <Res name="offset" label="Total offset" value={`${fmtTrim(dx * count, 1)}px, ${fmtTrim(dy * count, 1)}px`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="rounded-lg border border-border bg-white p-8">
            <p
              data-testid="extrude-preview"
              className="break-words font-extrabold"
              style={{
                fontSize: `${px}px`,
                color: ink,
                letterSpacing: "0.01em",
                lineHeight: 1.1,
                textShadow: layers.join(", "),
                transform: perspective === "none" ? undefined : `perspective(${px * 6}px) rotate3d(1, 0.35, 0, ${perspective}deg)`,
              }}
            >
              {text || "EXTRUDE"}
            </p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The tail of the extrusion is faked with stacked hard shadows: browsers rasterise each layer, so a deep effect on
            a long headline costs more than any font choice. A vector 3D text object in SVG is the alternative when the
            effect has to animate.
          </p>
        </Panel>
        <CodeOut code={css} title="Extruded text CSS" testid="extrude-css" />
      </div>
    </CalcLayout>
  );
}
