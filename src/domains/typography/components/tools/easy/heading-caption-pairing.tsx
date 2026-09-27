"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

/**
 * Heading + Caption Pairing — captions are the smallest type a design uses and
 * the face that pairs with a heading is rarely the same one used for body.
 * This tool renders the classic figure unit (heading → image slot → caption)
 * and checks the two faces' x-heights and tones against each other.
 */
export default function HeadingCaptionPairing() {
  const [headingName, setHeadingName] = useState("Fraunces");
  const [captionName, setCaptionName] = useState("DM Sans");
  const [heading, setHeading] = useState("Figure 1 — Pairing a heading with a caption");
  const [caption, setCaption] = useState("Caption sits two steps below the heading in size and usually lighter in weight.");
  const [hSize, setHSize] = useState("36");
  const [cSize, setCSize] = useState("13");

  const headingFont = FONTS.find((f) => f.name === headingName) ?? FONTS[0];
  const captionFont = FONTS.find((f) => f.name === captionName) ?? FONTS[1];
  const hs = Math.min(96, Math.max(16, parseFloat(hSize) || 36));
  const cs = Math.min(24, Math.max(8, parseFloat(cSize) || 13));
  const ratio = hs / cs;

  const css = `figure h2 {
  font-family: ${headingFont.stack};
  font-size: ${(hs / 16).toFixed(4)}rem;
  line-height: 1.2;
}
figure figcaption {
  font-family: ${captionFont.stack};
  font-size: ${(cs / 16).toFixed(4)}rem;
  line-height: 1.45;
  color: var(--muted-foreground);
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Faces & sizes</PanelTitle>
        <Sel
          name="heading"
          label="Heading face"
          value={headingName}
          onChange={setHeadingName}
          options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
        />
        <div className="mt-3 space-y-3">
          <Sel
            name="caption"
            label="Caption face"
            value={captionName}
            onChange={setCaptionName}
            options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))}
          />
          <TextInput name="htext" label="Heading text" value={heading} onChange={setHeading} />
          <TextInput name="ctext" label="Caption text" value={caption} onChange={setCaption} />
          <SliderNum name="hsize" label="Heading size" unit="px" value={hSize} onChange={setHSize} min={16} max={96} step={1} />
          <SliderNum name="csize" label="Caption size" unit="px" value={cSize} onChange={setCSize} min={8} max={24} step={1} />
        </div>
        <ResBox>
          <Res name="ratio" label="Heading ÷ caption" value={`${ratio.toFixed(2)}×`} />
          <Res name="fcaption" label="Caption floor" value={cs < 11 ? "below 11px — risky on mobile" : "safe size"} />
          <Res name="same" label="Same face?" value={headingFont.name === captionFont.name ? "yes — vary weight or colour" : "different faces"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Figure composition</PanelTitle>
          <figure className="space-y-3" data-testid="figure-preview">
            <h3
              className="break-words text-foreground"
              style={{ fontFamily: headingFont.stack, fontSize: `${hs}px`, lineHeight: 1.2, fontWeight: 600 }}
            >
              {heading || "Heading"}
            </h3>
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">image / chart</span>
            </div>
            <figcaption style={{ fontFamily: captionFont.stack, fontSize: `${cs}px`, lineHeight: 1.45 }}>
              <span className="text-muted-foreground">{caption || "Caption text"}</span>
            </figcaption>
          </figure>
        </Panel>
        <CodeOut code={css} testid="figure-css" />
      </div>
    </CalcLayout>
  );
}
