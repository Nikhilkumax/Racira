"use client";

import { useState } from "react";
import { Btn, CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Row, Sel, TextInput } from "../ui";
import { FONTS } from "../fonts";

interface WeightRow {
  weight: string;
  style: "normal" | "italic";
  file: string;
}

const DEFAULT_ROWS: WeightRow[] = [
  { weight: "300", style: "normal", file: "light" },
  { weight: "400", style: "normal", file: "regular" },
  { weight: "400", style: "italic", file: "italic" },
  { weight: "500", style: "normal", file: "medium" },
  { weight: "700", style: "normal", file: "bold" },
];

/**
 * Font CSS Generator — turns a self-hosted family's file list into the full set
 * of `@font-face` rules plus a preload hint for the weight used above the fold.
 * Weights and italics must each be declared separately, and `font-display`,
 * `unicode-range` and the `local()` source order are the details that decide
 * whether the webfont is used at all.
 */
export default function FontCssGenerator() {
  const [family, setFamily] = useState("Racira Sans");
  const [slug, setSlug] = useState("racira-sans");
  const [format, setFormat] = useState("woff2");
  const [display, setDisplay] = useState("swap");
  const [rows, setRows] = useState<WeightRow[]>(DEFAULT_ROWS);
  const [preload, setPreload] = useState("400");

  const update = (i: number, patch: Partial<WeightRow>) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  const css = rows
    .map(
      (r) =>
        `@font-face {
  font-family: "${family}";
  font-style: ${r.style};
  font-weight: ${r.weight};
  font-display: ${display};
  src: url("/fonts/${slug}/${slug}-${r.file}.${format}") format("${format}");
}`,
    )
    .join("\n\n");

  const preloadTag = `<link rel="preload" href="/fonts/${slug}/${slug}-${rows.find((r) => r.weight === preload && r.style === "normal")?.file ?? "regular"}.${format}" as="font" type="font/${format}" crossorigin />`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Family</PanelTitle>
        <div className="space-y-3">
          <TextInput name="family" label="CSS font-family" value={family} onChange={setFamily} />
          <TextInput name="slug" label="Directory slug" value={slug} onChange={setSlug} />
          <Sel
            name="format"
            label="File format"
            value={format}
            onChange={setFormat}
            options={[
              { value: "woff2", label: "woff2 (best compression, all modern browsers)" },
              { value: "woff", label: "woff (legacy fallback)" },
              { value: "ttf", label: "ttf (broadest, largest)" },
            ]}
          />
          <Sel
            name="display"
            label="font-display"
            value={display}
            onChange={setDisplay}
            options={[
              { value: "swap", label: "swap — text visible immediately" },
              { value: "block", label: "block — short invisible period" },
              { value: "fallback", label: "fallback — 100ms then fallback" },
              { value: "optional", label: "optional — may skip the font" },
            ]}
          />
          <Sel
            name="preload"
            label="Preload weight"
            value={preload}
            onChange={setPreload}
            options={["300", "400", "500", "600", "700"].map((w) => ({ value: w, label: w }))}
          />
        </div>
        <ResBox>
          <Res name="faces" label="@font-face rules" value={String(rows.length)} />
          <Res name="files" label="Files referenced" value={String(new Set(rows.map((r) => r.file)).size)} />
          <Res name="dir" label="Directory" value={`/fonts/${slug}/`} />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Declared faces</PanelTitle>
        {rows.map((r, i) => (
          <Row key={i} label={`Face ${i + 1}`}>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={r.weight}
                onChange={(e) => update(i, { weight: e.target.value })}
                className="rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-xs"
              >
                {["100", "200", "300", "400", "500", "600", "700", "800", "900"].map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <select
                value={r.style}
                onChange={(e) => update(i, { style: e.target.value as WeightRow["style"] })}
                className="rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-xs"
              >
                <option value="normal">normal</option>
                <option value="italic">italic</option>
              </select>
              <input
                type="text"
                aria-label={`file suffix ${i + 1}`}
                value={r.file}
                onChange={(e) => update(i, { file: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground"
              />
            </div>
          </Row>
        ))}
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={() => setRows((r) => [...r, { weight: "600", style: "normal", file: "semibold" }])}>Add face</Btn>
          <Btn kind="ghost" onClick={() => setRows(DEFAULT_ROWS)} disabled={rows.length === DEFAULT_ROWS.length}>
            Reset
          </Btn>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Family from the preview catalog:{" "}
          {FONTS.slice(0, 6)
            .map((f) => f.name)
            .join(", ")}{" "}
          — the declaration shape is identical for any self-hosted face.
        </p>
      </Panel>

      <div className="space-y-4 lg:col-span-2">
        <CodeOut code={css} title="@font-face rules" testid="fontface-css" />
        <CodeOut code={preloadTag} title="Preload (above-the-fold weight)" testid="preload-tag" language="html" />
      </div>
    </CalcLayout>
  );
}
