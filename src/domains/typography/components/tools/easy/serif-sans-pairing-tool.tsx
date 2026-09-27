"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, TextInput } from "../ui";
import { FONTS } from "../fonts";

const SERIFS = FONTS.filter((f) => f.kind === "serif");
const SANSS = FONTS.filter((f) => f.kind === "sans");

/** Classic pairings and why they work — all faces from the preview catalog. */
const COMBOS: { serif: string; sans: string; note: string }[] = [
  { serif: "Playfair Display", sans: "Inter", note: "High-contrast display serif against a neutral grotesque: maximum voice contrast." },
  { serif: "Lora", sans: "DM Sans", note: "Both have a warm, slightly rounded tone — harmonious rather than contrasting." },
  { serif: "Fraunces", sans: "Space Grotesk", note: "Quirky soft serif with a technical sans; works for editorial brands." },
  { serif: "Merriweather", sans: "Manrope", note: "Large x-height serif + geometric sans: very legible at small sizes." },
  { serif: "Source Serif 4", sans: "Poppins", note: "Documentary serif with a geometric sans — the classic report combination." },
  { serif: "Roboto Slab", sans: "Inter", note: "Slab serif headings read as sturdy; Inter keeps the body quiet." },
];

/**
 * Serif + Sans Pairing Tool — pick one of each and preview the pair on live
 * text, with the generic-family fallbacks and a copyable CSS declaration.
 */
export default function SerifSansPairingTool() {
  const [serifName, setSerifName] = useState("Playfair Display");
  const [sansName, setSansName] = useState("Inter");
  const [heading, setHeading] = useState("A headline with a serif voice");
  const [body, setBody] = useState(
    "The body copy stays in the sans face so long paragraphs remain comfortable, while the serif carries hierarchy and personality.",
  );

  const serif = SERIFS.find((f) => f.name === serifName) ?? SERIFS[0];
  const sans = SANSS.find((f) => f.name === sansName) ?? SANSS[0];

  const css = `:root {
  --font-heading: ${serif.stack};
  --font-body: ${sans.stack};
}

h1, h2, h3 { font-family: var(--font-heading); }
body { font-family: var(--font-body); }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Pair</PanelTitle>
        <Sel
          name="serif"
          label="Serif (headings)"
          value={serifName}
          onChange={setSerifName}
          options={SERIFS.map((f) => ({ value: f.name, label: f.name }))}
        />
        <div className="mt-3 space-y-3">
          <Sel
            name="sans"
            label="Sans (body)"
            value={sansName}
            onChange={setSansName}
            options={SANSS.map((f) => ({ value: f.name, label: f.name }))}
          />
          <TextInput name="heading" label="Heading text" value={heading} onChange={setHeading} />
          <TextInput name="body" label="Body text" value={body} onChange={setBody} />
        </div>
        <ResBox>
          <Res name="pair" label="Pair" value={`${serif.name} + ${sans.name}`} />
          <Res name="contrast" label="Voice contrast" value={serif.kind === sans.kind ? "low" : "serif vs sans"} />
          <Res name="bodySize" label="Suggested body size" value="16–18px, line-height 1.5–1.65" />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Live pairing</PanelTitle>
          <div data-testid="pairing-preview" className="space-y-4">
            <h3 className="text-3xl leading-tight text-foreground" style={{ fontFamily: serif.stack, fontWeight: 700 }}>
              {heading || "Heading"}
            </h3>
            <p className="text-[15px] leading-relaxed text-foreground/90" style={{ fontFamily: sans.stack }}>
              {body || "Body copy."}
            </p>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Fallback test</p>
              <p className="mt-1 text-sm text-foreground" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                If the serif webfont never arrives: {serif.name} → Georgia
              </p>
              <p className="text-sm text-foreground" style={{ fontFamily: "system-ui, 'Segoe UI', Arial, sans-serif" }}>
                If the sans webfont never arrives: {sans.name} → system UI
              </p>
            </div>
          </div>
        </Panel>
        <CodeOut code={css} testid="pairing-css" />
        <Panel>
          <PanelTitle>Curated combinations</PanelTitle>
          <RefTable
            cols={["Heading serif", "Body sans", "Why it works"]}
            rows={COMBOS.map((c) => {
              const h = FONTS.find((f) => f.name === c.serif)!;
              const b = FONTS.find((f) => f.name === c.sans)!;
              return [
                <button
                  key="h"
                  type="button"
                  onClick={() => {
                    setSerifName(h.name);
                    setSansName(b.name);
                  }}
                  className="underline decoration-dotted underline-offset-2 hover:text-primary"
                >
                  {h.name}
                </button>,
                <button
                  key="b"
                  type="button"
                  onClick={() => {
                    setSerifName(h.name);
                    setSansName(b.name);
                  }}
                  className="underline decoration-dotted underline-offset-2 hover:text-primary"
                >
                  {b.name}
                </button>,
                c.note,
              ];
            })}
            minWidth={520}
            note="Click a name to load that combination into the preview."
          />
        </Panel>
      </div>
    </CalcLayout>
  );
}
