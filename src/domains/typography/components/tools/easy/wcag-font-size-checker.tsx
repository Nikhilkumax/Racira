"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, RefTable, Res, ResBox, Sel, fmtTrim } from "../ui";

/**
 * WCAG Font Size Checker — checks a text style against the success criteria
 * that actually govern size:
 *   1.4.3 Contrast (Minimum)   — 4.5:1 normal, 3:1 large
 *   1.4.6 Contrast (Enhanced)  — 7:1 / 4.5:1
 *   1.4.4 Resize Text          — readable at 200% zoom
 *   1.4.12 Text Spacing        — minimum adjustable spacing without loss
 */
export default function WcagFontSizeChecker() {
  const [size, setSize] = useState("16");
  const [weight, setWeight] = useState("400");
  const [ratio, setRatio] = useState("4.5");
  const [zoom, setZoom] = useState("200");

  const px = parseFloat(size) || 0;
  const wt = parseFloat(weight) || 400;
  const r = parseFloat(ratio);
  const z = parseFloat(zoom) || 200;

  const large = px >= 24 || (px >= 18.66 && wt >= 700);
  const aa = large ? 3 : 4.5;
  const aaa = large ? 4.5 : 7;

  const spacingRows = [
    ["Line height", "≥ 1.5 × font size", `${fmtTrim(px * 1.5, 2)}px`],
    ["Paragraph spacing", "≥ 2 × font size", `${fmtTrim(px * 2, 2)}px`],
    ["Letter spacing", "≥ 0.12em", `${fmtTrim(px * 0.12, 2)}px`],
    ["Word spacing", "≥ 0.16em", `${fmtTrim(px * 0.16, 2)}px`],
  ];

  const checks = [
    { name: "AA contrast (1.4.3)", pass: Number.isFinite(r) && r >= aa, detail: `needs ${aa}:1 — you have ${Number.isFinite(r) ? fmtTrim(r, 2) : "—"}:1` },
    { name: "AAA contrast (1.4.6)", pass: Number.isFinite(r) && r >= aaa, detail: `needs ${aaa}:1` },
    { name: "Body text size (best practice)", pass: px >= 16, detail: px >= 16 ? "16px or larger" : "below the 16px body-text norm" },
    { name: "Large-text classification", pass: true, detail: large ? "counts as large text" : "counts as normal text" },
    { name: `Resize to ${fmtTrim(z, 0)}%`, pass: z <= 200 || px >= 16, detail: "design must survive 200% zoom without loss (1.4.4)" },
  ];
  const failures = checks.filter((c) => !c.pass).length;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Text style</PanelTitle>
        <FormGrid>
          <Num name="size" label="Font size" unit="px" value={size} onChange={setSize} step={0.5} />
          <Sel
            name="weight"
            label="Font weight"
            value={weight}
            onChange={setWeight}
            options={[300, 400, 500, 600, 700, 800].map((x) => ({ value: String(x), label: String(x) }))}
          />
          <Num name="ratio" label="Contrast ratio" unit=":1" value={ratio} onChange={setRatio} step={0.1} />
          <Num name="zoom" label="Required zoom support" unit="%" value={zoom} onChange={setZoom} step={10} />
        </FormGrid>
        <ResBox>
          <Res name="size" label="Classification" value={large ? "Large text (≥24px, or ≥18.66px bold)" : "Normal text"} />
          <Res name="pt" label="Equivalent in points" value={`${fmtTrim(px * 0.75, 2)}pt`} />
          <Res name="aa" label="AA requires" value={`${aa}:1`} />
          <Res name="aaa" label="AAA requires" value={`${aaa}:1`} />
          <Res name="fail" label="Failed checks" value={String(failures)} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Checks</PanelTitle>
          <div className="space-y-2">
            {checks.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.detail}</div>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    c.pass ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {c.pass ? "PASS" : "FAIL"}
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelTitle>1.4.12 text-spacing minimums</PanelTitle>
          <RefTable
            cols={["Property", "Requirement", `At ${fmtTrim(px, 2)}px`]}
            rows={spacingRows}
            minWidth={380}
            note="Readers must be able to apply these without any loss of content or functionality — never lock line-height with fixed pixel heights."
          />
        </Panel>
      </div>
    </CalcLayout>
  );
}
