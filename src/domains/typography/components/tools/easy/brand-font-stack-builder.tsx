"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, TextInput } from "../ui";
import { FONTS } from "../fonts";

/**
 * Brand Font Stack Builder — a brand needs more than one face decision: a
 * display face, a text face, a UI face and a mono face, each with a fallback
 * chain. This tool collects all four slots and emits the complete set of CSS
 * custom properties a design system would consume, so the whole stack is
 * decided in one place instead of drifting across files.
 */
export default function BrandFontStackBuilder() {
  const [display, setDisplay] = useState("Fraunces");
  const [text, setText] = useState("Source Serif 4");
  const [ui, setUi] = useState("Inter");
  const [mono, setMono] = useState("JetBrains Mono");
  const [brand, setBrand] = useState("Racira");
  const [sample, setSample] = useState("Brand typography, decided once.");

  const get = (name: string, fallback: number) => FONTS.find((f) => f.name === name) ?? FONTS[fallback];
  const d = get(display, 1);
  const t = get(text, 3);
  const u = get(ui, 0);
  const m = get(mono, 10);

  const token = (slot: string) => `--font-${branch(brand)}-${slot}`;
  const css = `:root {
  ${token("display")}: ${d.stack};
  ${token("text")}: ${t.stack};
  ${token("ui")}: ${u.stack};
  ${token("mono")}: ${m.stack};
}

.display { font-family: var(${token("display")}); }
.prose   { font-family: var(${token("text")}); }
body     { font-family: var(${token("ui")}); }
code     { font-family: var(${token("mono")}); }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Four-slot brand stack</PanelTitle>
        <div className="space-y-3">
          <TextInput name="brand" label="Brand prefix" value={brand} onChange={setBrand} placeholder="racina" />
          <Sel name="display" label="Display slot" value={display} onChange={setDisplay} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <Sel name="text" label="Text slot" value={text} onChange={setText} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <Sel name="ui" label="UI slot" value={ui} onChange={setUi} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <Sel name="mono" label="Mono slot" value={mono} onChange={setMono} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <TextInput name="sample" label="Sample text" value={sample} onChange={setSample} />
        </div>
        <ResBox>
          <Res name="families" label="Distinct families" value={String(new Set([d.name, t.name, u.name, m.name]).size)} />
          <Res name="requests" label="Stylesheet requests" value="1 (this domain's shared font sheet)" />
          <Res name="fallbacks" label="Generic fallbacks named" value="4 / 4 slots" />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Slot preview</PanelTitle>
          <div className="space-y-4" data-testid="brand-preview">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">display</span>
              <p className="text-4xl leading-tight text-foreground" style={{ fontFamily: d.stack, fontWeight: 700 }}>
                {sample || "Display"}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">text</span>
              <p className="text-[15px] leading-relaxed text-foreground/90" style={{ fontFamily: t.stack }}>
                Long-form copy uses the text slot: this sentence is set in {t.name} to check its reading rhythm at body size.
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">ui</span>
              <p className="text-sm text-foreground" style={{ fontFamily: u.stack }}>
                Interface label · Button · Nav item — {u.name}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">mono</span>
              <p className="text-sm text-foreground" style={{ fontFamily: m.stack }}>
                const stack = &quot;{m.name}&quot;;
              </p>
            </div>
          </div>
        </Panel>
        <CodeOut code={css} testid="brand-stack-css" />
      </div>
    </CalcLayout>
  );
}

/** CSS custom-property-safe slug for the brand prefix. */
function branch(input: string): string {
  const s = input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return s || "brand";
}
