"use client";

import { useState } from "react";
import { CopyBtn, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";

/**
 * Editorial Style Guide Generator — turns a set of type decisions into the
 * document a project needs: role sizes, weights, leading, tracking and spacing,
 * with the rules stated explicitly rather than left implicit in a stylesheet.
 * The output is copyable as Markdown, so it can live in the repository beside
 * the code it describes.
 */
export default function EditorialStyleGuideGenerator() {
  const [name, setName] = useState("Racira — Editorial Type Guide");
  const [display, setDisplay] = useState("Fraunces");
  const [text, setText] = useState("Source Serif 4");
  const [ui, setUi] = useState("Inter");
  const [base, setBase] = useState("17");
  const [ratio, setRatio] = useState("1.25");
  const [leading, setLeading] = useState("1.6");
  const [measure, setMeasure] = useState("68");

  const b = Math.max(12, parseFloat(base) || 17);
  const r = Math.max(1.05, parseFloat(ratio) || 1.25);
  const lh = Math.min(2.2, Math.max(1.2, parseFloat(leading) || 1.6));
  const cm = Math.max(40, parseFloat(measure) || 68);

  const roles = [
    { role: "Display", face: display, step: 4, weight: 700, lh: 1.05, use: "hero statements, covers" },
    { role: "H1", face: display, step: 3, weight: 700, lh: 1.1, use: "page title, chapter opening" },
    { role: "H2", face: display, step: 2, weight: 600, lh: 1.2, use: "section headings" },
    { role: "H3", face: text, step: 1, weight: 600, lh: 1.25, use: "sub-sections" },
    { role: "Body", face: text, step: 0, weight: 400, lh, use: "paragraph copy" },
    { role: "Caption", face: ui, step: -1, weight: 400, lh: 1.45, use: "figures, tables, notes" },
    { role: "UI", face: ui, step: -1, weight: 500, lh: 1.4, use: "labels, buttons, navigation" },
  ];

  const rows = roles.map((x) => {
    const px = b * r ** x.step;
    return [x.role, x.face, `${fmtTrim(px, 1)}px`, `${fmtTrim(px / b, 3)}rem`, String(x.weight), fmtTrim(x.lh, 2), x.use];
  });

  const markdown = `# ${name}

## Faces
- Display: **${display}** — headlines and hero statements
- Text: **${text}** — body copy and sub-headings
- UI: **${ui}** — labels, navigation, captions

## Scale
Base ${b}px · ratio ${r} — every role is a step on the same scale.

| Role | Face | Size (px) | rem | Weight | Leading |
| --- | --- | --- | --- | --- | --- |
${rows.map((r) => `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} | ${r[5]} |`).join("\n")}

## Rules
1. Body measure stays between 45 and ${fmtTrim(cm, 0)} characters; widen the container only by adding columns.
2. Headings never inherit body leading — each role carries its own line height.
3. Tracking: negative tracking above ${fmtTrim(b * 2, 0)}px, zero at body size, positive for uppercase and captions.
4. One emphasis mechanism per passage: bold, italic or colour — never two at once.
5. Figures in tables and captions are tabular; figures in prose may be proportional.
6. The UI face never appears in body copy, and the display face never appears below ${fmtTrim(b * 2, 0)}px.`;

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle>Guide inputs</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput name="name" label="Guide title" value={name} onChange={setName} />
          <TextInput name="display" label="Display face" value={display} onChange={setDisplay} />
          <TextInput name="text" label="Text face" value={text} onChange={setText} />
          <TextInput name="ui" label="UI face" value={ui} onChange={setUi} />
          <Sel
            name="ratio"
            label="Scale ratio"
            value={ratio}
            onChange={setRatio}
            options={["1.125", "1.2", "1.25", "1.333", "1.414", "1.5", "1.618"].map((v) => ({ value: v, label: v }))}
          />
          <div className="grid grid-cols-3 gap-3">
            <SliderNum name="base" label="Base" unit="px" value={base} onChange={setBase} min={14} max={22} step={1} />
            <SliderNum name="leading" label="Leading" unit="×" value={leading} onChange={setLeading} min={1.2} max={2.2} step={0.05} />
            <SliderNum name="measure" label="Max measure" unit="ch" value={measure} onChange={setMeasure} min={40} max={100} step={1} />
          </div>
        </div>
        <ResBox>
          <Res name="roles" label="Roles defined" value={String(roles.length)} />
          <Res name="range" label="Size range" value={`${fmtTrim(b * r ** -1, 1)}px – ${fmtTrim(b * r ** 4, 1)}px`} />
          <Res name="faces" label="Faces in the system" value={String(new Set([display, text, ui]).size)} />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Role table</PanelTitle>
        <RefTable cols={["Role", "Face", "px", "rem", "Weight", "Leading", "Used for"]} rows={rows} minWidth={700} />
      </Panel>

      <Panel>
        <PanelTitle>Generated guide (Markdown)</PanelTitle>
        <div className="mb-3 flex items-center gap-2">
          <CopyBtn text={markdown} label="Copy Markdown" testid="guide-copy" />
          <span className="text-xs text-muted-foreground">paste into the repository as TYPE-GUIDE.md</span>
        </div>
        <pre className="max-h-96 overflow-auto rounded-xl border border-border bg-card/40 p-4 text-xs leading-relaxed text-foreground" data-testid="guide-markdown">
          <code>{markdown}</code>
        </pre>
      </Panel>
    </div>
  );
}
