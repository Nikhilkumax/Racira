"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, fmtTrim } from "../ui";

/**
 * Type Scale Generator — assigns a geometric scale to the h1–h6/body/small
 * roles, previews every role at its true size, and exports CSS variables.
 * Line heights follow the standard ratio dance: tighter as sizes grow.
 */
const ROLE_KEYS = ["h1", "h2", "h3", "h4", "h5", "h6", "body", "small"] as const;
type Role = (typeof ROLE_KEYS)[number];

const RATIOS = [
  { value: "1.2", label: "1.200 — Minor third" },
  { value: "1.25", label: "1.250 — Major third" },
  { value: "1.333", label: "1.333 — Perfect fourth" },
  { value: "1.414", label: "1.414 — Augmented fourth" },
  { value: "1.5", label: "1.500 — Perfect fifth" },
  { value: "1.618", label: "1.618 — Golden ratio" },
];

const DEFAULTS: Record<Role, number> = { h1: 5, h2: 4, h3: 3, h4: 2, h5: 1, h6: 0, body: 0, small: -1 };

export default function TypeScaleGenerator() {
  const [base, setBase] = useState("16");
  const [ratioSel, setRatioSel] = useState("1.25");
  const [stepsJson, setStepsJson] = useState<Record<Role, number>>(DEFAULTS);

  const b = parseFloat(base) || 0;
  const ratio = parseFloat(ratioSel);
  const valid = b > 0 && Number.isFinite(ratio) && ratio > 1;

  const size = (step: number) => (valid ? b * ratio ** step : NaN);
  const cssName = (role: Role) => `--font-size-${role}`;

  const css = valid
    ? [
        ":root {",
        ...ROLE_KEYS.map((k) => `  ${cssName(k)}: ${fmtTrim(size(stepsJson[k]), 3)}px;`),
        "}",
      ].join("\n")
    : "";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Scale</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <SliderNum name="base" label="Base font size" unit="px" value={base} onChange={setBase} min={10} max={24} step={1} />
          <Sel name="ratio" label="Ratio" value={ratioSel} onChange={setRatioSel} options={RATIOS} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Each role is a step on the scale: step 0 = base, +5 = five ratio multiplications above it.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {ROLE_KEYS.map((role) => (
            <label key={role} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-mono text-xs text-muted-foreground">{role}</span>
              <input
                type="number"
                step={1}
                value={stepsJson[role]}
                onChange={(e) =>
                  setStepsJson((s) => ({ ...s, [role]: Math.max(-6, Math.min(10, Math.round(parseFloat(e.target.value) || 0))) }))
                }
                className="w-16 rounded-md border border-border bg-background px-2 py-1 text-right font-mono text-xs text-foreground outline-none focus:border-primary"
              />
            </label>
          ))}
        </div>
        <ResBox>
          <Res name="base-out" label="Body size" value={valid ? `${fmtTrim(size(stepsJson.body), 3)}px` : "—"} />
          <Res name="h1-out" label="H1 size" value={valid ? `${fmtTrim(size(stepsJson.h1), 3)}px` : "—"} />
          <Res name="span" label="H1 : body span" value={valid ? `${fmtTrim(size(stepsJson.h1) / size(stepsJson.body), 3)}×` : "—"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="space-y-2">
            {ROLE_KEYS.map((role) => {
              const px = size(stepsJson[role]);
              const lh = role.startsWith("h") ? Math.max(1.05, Math.min(1.4, 1.5 - px / 120)) : 1.6;
              return (
                <div key={role} className="flex items-baseline gap-3 overflow-hidden">
                  <span className="w-12 shrink-0 font-mono text-[10px] uppercase text-muted-foreground">{role}</span>
                  <span
                    className="truncate font-semibold text-foreground"
                    style={{ fontSize: valid ? `${px}px` : undefined, lineHeight: lh }}
                    title={valid ? `${fmtTrim(px, 2)}px` : undefined}
                  >
                    Type scales, exactly
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                    {valid ? `${fmtTrim(px, 2)}px` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
        <CodeOut code={css || "/* enter a valid base size and ratio */"} title="CSS variables" testid="type-scale-css" />
      </div>
    </CalcLayout>
  );
}
