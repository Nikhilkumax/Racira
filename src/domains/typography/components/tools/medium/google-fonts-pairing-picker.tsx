"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

interface Pair {
  heading: string;
  body: string;
  roles: string[];
  note: string;
}

const PAIRS: Pair[] = [
  { heading: "Playfair Display", body: "Inter", roles: ["editorial", "luxury"], note: "High-contrast display serif over a neutral UI grotesque — the widest used editorial pairing." },
  { heading: "Fraunces", body: "Space Grotesk", roles: ["brand", "startup"], note: "Soft, optical-size-aware serif with a technical sans: warmth against engineering." },
  { heading: "Merriweather", body: "Manrope", roles: ["docs", "publishing"], note: "Large x-height serif for long reading, geometric sans for interface text." },
  { heading: "Roboto Slab", body: "Poppins", roles: ["marketing", "poster"], note: "Sturdy slab headings with a geometric sans body — high clarity at a distance." },
  { heading: "Lora", body: "DM Sans", roles: ["blog", "warm"], note: "Both warm and slightly rounded: harmonious rather than contrasting." },
  { heading: "Bebas Neue", body: "Source Serif 4", roles: ["magazine", "news"], note: "Condensed display caps over a documentary serif — the magazine cover formula." },
];

/**
 * Google Fonts Pairing Picker — the curated pairings from the domain's own
 * catalogue, with the exact stylesheet request each pair needs (only the
 * weights that are used), the two custom properties, and the size ratio that
 * suits the pairing's role.
 */
export default function GoogleFontsPairingPicker() {
  const [pairIdx, setPairIdx] = useState("0");
  const [heading, setHeading] = useState("A curated pairing, ready to paste");
  const [ratio, setRatio] = useState("2.2");
  const [bodySize, setBodySize] = useState("16");
  const [weights, setWeights] = useState("400;700");

  const pair = PAIRS[Number(pairIdx) % PAIRS.length];
  const h = FONTS.find((f) => f.name === pair.heading) ?? FONTS[2];
  const b = FONTS.find((f) => f.name === pair.body) ?? FONTS[0];
  const bs = Math.min(24, Math.max(12, parseFloat(bodySize) || 16));
  const r = Math.min(4, Math.max(1.2, parseFloat(ratio) || 2.2));
  const request = pair.heading
    ? `https://fonts.googleapis.com/css2?family=${pair.heading.replace(/ /g, "+")}:wght@${weights}&family=${pair.body.replace(/ /g, "+")}:wght@${weights}&display=swap`
    : "";

  const links = [
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    `<link href="${request}" rel="stylesheet" />`,
  ].join("\n");

  const css = `:root {
  --font-heading: ${h.stack};
  --font-body: ${b.stack};
  --step-heading: ${(bs * r).toFixed(2)}px;
  --step-body: ${bs}px;
}

h1, h2, h3 { font-family: var(--font-heading); font-weight: 700; line-height: 1.15; }
body { font-family: var(--font-body); font-weight: 400; line-height: 1.6; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Choose a pair</PanelTitle>
        <Sel
          name="pair"
          label="Curated pairing"
          value={pairIdx}
          onChange={setPairIdx}
          options={PAIRS.map((p, i) => ({ value: String(i), label: `${p.heading} + ${p.body}` }))}
        />
        <div className="mt-3 space-y-3">
          <TextInput name="heading" label="Heading sample" value={heading} onChange={setHeading} />
          <SliderNum name="ratio" label="Heading ÷ body" unit="×" value={ratio} onChange={setRatio} min={1.2} max={4} step={0.05} />
          <SliderNum name="body" label="Body size" unit="px" value={bodySize} onChange={setBodySize} min={12} max={24} step={1} />
          <Sel
            name="weights"
            label="Weights to request"
            value={weights}
            onChange={setWeights}
            options={[
              { value: "400;700", label: "400 + 700" },
              { value: "300;400;700", label: "300 + 400 + 700" },
              { value: "400;500;600;700", label: "400 + 500 + 600 + 700" },
              { value: "400", label: "400 only" },
            ]}
          />
        </div>
        <ResBox>
          <Res name="pair" label="Pairing" value={`${pair.heading} + ${pair.body}`} />
          <Res name="roles" label="Suits" value={pair.roles.join(", ")} />
          <Res name="headingPx" label="Heading size" value={`${(bs * r).toFixed(2)}px`} />
          <Res name="requests" label="Requests" value="1 stylesheet + 2 preconnects" />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{pair.note}</p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div data-testid="google-pair-preview">
            <h3 style={{ fontFamily: h.stack, fontSize: `${bs * r}px`, fontWeight: 700, lineHeight: 1.15 }} className="text-foreground">
              {heading || pair.heading}
            </h3>
            <p style={{ fontFamily: b.stack, fontSize: `${bs}px`, lineHeight: 1.6 }} className="mt-2 text-foreground/90">
              Body copy in {pair.body} at {bs}px with a 1.6 line height — the ratio and leading that make the pairing read as
              deliberate rather than accidental.
            </p>
          </div>
        </Panel>

        <Panel>
          <PanelTitle>All curated pairs</PanelTitle>
          <RefTable
            cols={["Heading", "Body", "Suits", "Note"]}
            rows={PAIRS.map((p, i) => [
              <button
                key="h"
                type="button"
                onClick={() => setPairIdx(String(i))}
                className="underline decoration-dotted underline-offset-2 hover:text-primary"
              >
                {p.heading}
              </button>,
              p.body,
              p.roles.join(", "),
              p.note,
            ])}
            minWidth={680}
          />
        </Panel>

        <CodeOut code={links} title="Stylesheet link" testid="google-pair-links" language="html" />
        <CodeOut code={css} title="CSS" testid="google-pair-css" />
      </div>
    </CalcLayout>
  );
}
