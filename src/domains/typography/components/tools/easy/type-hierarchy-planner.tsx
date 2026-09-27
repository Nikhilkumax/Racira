"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Radios, RefTable, SliderNum, TextInput, fmtTrim } from "../ui";

interface Role {
  name: string;
  step: number;
  weight: number;
  lh: number;
  use: string;
}

/** Default role map: the arbitration of size → job that a hierarchy planner makes. */
const DEFAULT_ROLES: Role[] = [
  { name: "Display", step: 6, weight: 700, lh: 1.05, use: "hero marketing line" },
  { name: "H1", step: 5, weight: 700, lh: 1.1, use: "page title" },
  { name: "H2", step: 4, weight: 600, lh: 1.15, use: "section heading" },
  { name: "H3", step: 3, weight: 600, lh: 1.2, use: "sub-section" },
  { name: "H4", step: 2, weight: 600, lh: 1.25, use: "group label" },
  { name: "Body", step: 0, weight: 400, lh: 1.6, use: "paragraph copy" },
  { name: "Small", step: -1, weight: 400, lh: 1.45, use: "captions, metadata" },
];

/**
 * Type Hierarchy Planner — takes a modular scale and assigns every text role a
 * step on it, then renders the whole page outline so the jump between Body and
 * H4 (usually the weakest link) can be judged against the jump between H2 and
 * H1. Mid-step roles are the giveaway of a hierarchy that grew by accident.
 */
export default function TypeHierarchyPlanner() {
  const [base, setBase] = useState("16");
  const [ratio, setRatio] = useState("1.25");
  const [headWeight, setHeadWeight] = useState("600");
  const [copy, setCopy] = useState("Hierarchy is the reader's map");
  const [mode, setMode] = useState("page");

  const b = Math.max(10, parseFloat(base) || 16);
  const r = Math.max(1.05, parseFloat(ratio) || 1.25);
  const hw = parseFloat(headWeight) || 600;
  const roles = DEFAULT_ROLES.map((x) => ({ ...x, px: b * r ** x.step, weight: x.step > 0 ? hw : x.weight }));

  const rows = roles.map((x) => [
    x.name,
    `${x.step > 0 ? "+" : ""}${x.step}`,
    `${fmtTrim(x.px, 2)}px`,
    `${fmtTrim(x.px / b, 4)}× body`,
    String(x.weight),
    fmtTrim(x.lh, 2),
    x.use,
  ]);

  const css = roles
    .map((x) => `.role-${x.name.toLowerCase()} { font-size: ${(x.px / 16).toFixed(4)}rem; font-weight: ${x.weight}; line-height: ${x.lh}; }`)
    .join("\n");

  const ordered = [...roles].sort((a, c) => a.px - c.px);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Scale</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="base" label="Body size" unit="px" value={base} onChange={setBase} min={12} max={22} step={1} />
          <SliderNum name="ratio" label="Ratio" value={ratio} onChange={setRatio} min={1.05} max={1.6} step={0.005} />
          <SliderNum name="head" label="Heading weight" value={headWeight} onChange={setHeadWeight} min={400} max={800} step={100} />
          <TextInput name="copy" label="Sample copy" value={copy} onChange={setCopy} />
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Outline mode
            </span>
            <Radios
              name="mode"
              value={mode}
              onChange={setMode}
              ariaLabel="outline mode"
              options={[
                { value: "page", label: "Full page" },
                { value: "type", label: "Type only" },
              ]}
            />
          </div>
        </div>
        <RefTable cols={["Role", "Step", "px", "× body", "Weight", "Leading", "Job"]} rows={rows} minWidth={620} />
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>{mode === "page" ? "Page outline" : "Role ladder"}</PanelTitle>
          <div className="space-y-4" data-testid="hierarchy-preview">
            {[...ordered].reverse().map((x) => (
              <div key={x.name}>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {x.name} · {fmtTrim(x.px, 1)}px
                </span>
                <p
                  className="break-words text-foreground"
                  style={{ fontSize: `${x.px}px`, fontWeight: x.weight, lineHeight: x.lh }}
                >
                  {copy || x.use}
                </p>
                {mode === "page" && x.step <= 0 && (
                  <p className="mt-1 max-w-prose text-foreground/80" style={{ fontSize: `${x.px}px`, lineHeight: x.lh }}>
                    Body copy continues beneath the heading it belongs to, at the size and leading defined on this step of
                    the scale.
                  </p>
                )}
              </div>
            ))}
          </div>
        </Panel>
        <CodeOut code={css} testid="hierarchy-css" />
      </div>
    </CalcLayout>
  );
}
