"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

const DISPLAYS = FONTS.filter((f) => f.kind === "display" || f.kind === "serif");
const BODIES = FONTS.filter((f) => f.kind === "sans" || f.kind === "serif");

/**
 * Display + Body Pairing Tool — display faces are designed for a handful of
 * words at large sizes, so the pairing test is: hero line at display size,
 * then the body face at reading size directly beneath it. The ratio readout
 * keeps the display/body size jump in the 2.5–4× band where hierarchy reads
 * as deliberate rather than accidental.
 */
export default function DisplayBodyPairingTool() {
  const [displayName, setDisplayName] = useState("Bebas Neue");
  const [bodyName, setBodyName] = useState("Inter");
  const [headline, setHeadline] = useState("TYPE WITH INTENT");
  const [sub, setSub] = useState(
    "Display type carries the first impression; body type carries the argument. Keeping them in different families gives each job the design it needs.",
  );
  const [displaySize, setDisplaySize] = useState("64");
  const [bodySize, setBodySize] = useState("16");

  const display = DISPLAYS.find((f) => f.name === displayName) ?? DISPLAYS[0];
  const body = BODIES.find((f) => f.name === bodyName) ?? BODIES[0];
  const ds = Math.min(180, Math.max(24, parseFloat(displaySize) || 64));
  const bs = Math.min(40, Math.max(10, parseFloat(bodySize) || 16));
  const ratio = ds / bs;

  const css = `.hero {
  font-family: ${display.stack};
  font-size: clamp(2.5rem, 6vw, ${(ds / 16).toFixed(2)}rem);
  line-height: 1.05;
  letter-spacing: ${display.kind === "display" ? "0.01em" : "-0.01em"};
}
.hero-sub {
  font-family: ${body.stack};
  font-size: ${(bs / 16).toFixed(4)}rem;
  line-height: 1.6;
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Faces & sizes</PanelTitle>
        <Sel
          name="display"
          label="Display face"
          value={displayName}
          onChange={setDisplayName}
          options={DISPLAYS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
        />
        <div className="mt-3 space-y-3">
          <Sel
            name="body"
            label="Body face"
            value={bodyName}
            onChange={setBodyName}
            options={BODIES.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
          />
          <TextInput name="headline" label="Headline" value={headline} onChange={setHeadline} />
          <TextInput name="sub" label="Supporting copy" value={sub} onChange={setSub} />
          <SliderNum name="dsize" label="Display size" unit="px" value={displaySize} onChange={setDisplaySize} min={24} max={180} step={2} />
          <SliderNum name="bsize" label="Body size" unit="px" value={bodySize} onChange={setBodySize} min={10} max={40} step={1} />
        </div>
        <ResBox>
          <Res name="ratio" label="Display ÷ body" value={`${ratio.toFixed(2)}×`} />
          <Res
            name="verdict"
            label="Hierarchy"
            value={ratio < 2 ? "too close — increase display size" : ratio > 5 ? "extreme — check fit" : "clear and deliberate"}
          />
          <Res name="displayKind" label="Display classification" value={display.kind} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Hero composition</PanelTitle>
          <div data-testid="hero-preview" className="space-y-3">
            <h3
              className="break-words text-foreground"
              style={{ fontFamily: display.stack, fontSize: `${ds}px`, lineHeight: 1.05, fontWeight: 700 }}
            >
              {headline || "HEADLINE"}
            </h3>
            <p className="max-w-prose text-foreground/85" style={{ fontFamily: body.stack, fontSize: `${bs}px`, lineHeight: 1.6 }}>
              {sub || "Supporting copy."}
            </p>
          </div>
        </Panel>
        <CodeOut code={css} testid="hero-css" />
      </div>
    </CalcLayout>
  );
}
