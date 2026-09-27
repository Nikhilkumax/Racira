"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, RefTable, Res, ResBox, Sel, fmtTrim } from "../ui";

/**
 * Mobile Font Size Checker — viewport-aware size/measure check.
 *
 *   available width = viewport − 2 × page padding
 *   average glyph width ≈ 0.5em for a humanist sans / 0.55em serif
 *   characters per line = available width ÷ (size × factor)
 *
 * Body text wants 45–75 characters per line; inputs under 16px trigger iOS
 * Safari's auto-zoom on focus, which is why 16px is the input floor.
 */
const CHAR_FACTOR: Record<string, number> = { sans: 0.5, serif: 0.55, mono: 0.6 };

export default function MobileFontSizeChecker() {
  const [viewport, setViewport] = useState("390");
  const [padding, setPadding] = useState("16");
  const [size, setSize] = useState("16");
  const [family, setFamily] = useState("sans");
  const [role, setRole] = useState("body");

  const vw = parseFloat(viewport);
  const pad = parseFloat(padding);
  const px = parseFloat(size);
  const factor = CHAR_FACTOR[family] ?? 0.5;
  const valid = [vw, pad, px].every(Number.isFinite) && vw > 0 && px > 0;

  const available = valid ? vw - 2 * pad : NaN;
  const charsPerLine = valid ? available / (px * factor) : NaN;

  const checks: { name: string; pass: boolean; detail: string }[] = [
    {
      name: "Body text ≥ 16px",
      pass: px >= 16,
      detail: px >= 16 ? "reads comfortably without zoom" : "below the 16px mobile body floor",
    },
    {
      name: "Above absolute minimum (12px)",
      pass: px >= 12,
      detail: px >= 12 ? "above the 12px legibility floor" : "too small for sustained reading",
    },
    {
      name: role === "input" ? "Input ≥ 16px (no iOS auto-zoom)" : "iOS auto-zoom safe",
      pass: px >= 16,
      detail: px >= 16 ? "no focus zoom on iOS" : "iOS Safari zooms focused inputs under 16px",
    },
    {
      name: "Measure 45–75 characters",
      pass: valid && charsPerLine >= 45 && charsPerLine <= 75,
      detail: valid
        ? `${fmtTrim(charsPerLine, 1)} characters per line`
        : "enter a valid viewport and size",
    },
  ];
  const failures = checks.filter((c) => !c.pass).length;

  const suggested = valid ? Math.max(12, Math.round((available / 65 / factor) * 10) / 10) : NaN;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Viewport & type</PanelTitle>
        <FormGrid>
          <Num name="viewport" label="Viewport width" unit="px" value={viewport} onChange={setViewport} step={1} />
          <Num name="padding" label="Page padding (each side)" unit="px" value={padding} onChange={setPadding} step={1} />
          <Num name="size" label="Font size" unit="px" value={size} onChange={setSize} step={0.5} />
          <Sel
            name="family"
            label="Family width"
            value={family}
            onChange={setFamily}
            options={[
              { value: "sans", label: "Humanist sans (~0.50em avg)" },
              { value: "serif", label: "Serif (~0.55em avg)" },
              { value: "mono", label: "Monospace (~0.60em avg)" },
            ]}
          />
          <Sel
            name="role"
            label="Text role"
            value={role}
            onChange={setRole}
            options={[
              { value: "body", label: "Body text" },
              { value: "caption", label: "Caption / secondary" },
              { value: "input", label: "Form input" },
              { value: "heading", label: "Heading" },
            ]}
          />
        </FormGrid>
        <ResBox>
          <Res name="available" label="Available text width" value={valid ? `${fmtTrim(available, 1)}px` : "—"} />
          <Res name="cpl" label="Characters per line" value={valid ? fmtTrim(charsPerLine, 1) : "—"} />
          <Res name="suggested" label="Size for 65-character measure" value={valid ? `${fmtTrim(suggested, 1)}px` : "—"} />
          <Res name="fail" label="Failed checks" value={String(failures)} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The 0.5em/0.55em/0.6em factors are averages — re-measure with the real typeface if the design is tight.
        </p>
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
          <PanelTitle>Mobile sizing reference</PanelTitle>
          <RefTable
            cols={["Element", "Minimum", "Comfortable"]}
            rows={[
              ["Body text", "16px", "16–18px"],
              ["Secondary / caption", "12px", "14–16px"],
              ["Form input", "16px (iOS zoom)", "16–18px"],
              ["Button label", "14px", "16–18px"],
              ["Page heading", "20px", "24–32px"],
            ]}
            minWidth={360}
            note="Values are the common mobile guidance band; WCAG itself sets no absolute font-size minimum."
          />
        </Panel>
      </div>
    </CalcLayout>
  );
}
