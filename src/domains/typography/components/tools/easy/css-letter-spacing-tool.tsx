"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, fmtTrim } from "../ui";

/**
 * CSS Letter Spacing Tool — generates the tracking values a real stylesheet
 * needs: negative tracking for large display sizes, ~0 for body text, positive
 * for small caps and uppercase, and a differing value for optical-size-driven
 * faces. Values are authored in em so one declaration holds across breakpoints,
 * with a px readout for the chosen size.
 */
export default function CssLetterSpacingTool() {
  const [base, setBase] = useState("16");
  const [display, setDisplay] = useState("48");
  const [uppercaseBump, setUppercaseBump] = useState("0.05");
  const [family, setFamily] = useState("Inter");

  const b = Math.max(10, parseFloat(base) || 16);
  const d = Math.max(20, parseFloat(display) || 48);
  const bump = Math.min(0.2, Math.max(0.01, parseFloat(uppercaseBump) || 0.05));

  const roles = [
    { role: "Display / hero", size: d, tracking: -0.02, note: "Large sizes need negative tracking; the default rhythm is too airy." },
    { role: "H1", size: d * 0.6, tracking: -0.015, note: "Or the h1 body size, scaled." },
    { role: "H2", size: b * 2, tracking: -0.01, note: "First step where tracking should tighten." },
    { role: "H3", size: b * 1.5, tracking: 0, note: "The crossover point — leave at 0." },
    { role: "Body", size: b, tracking: 0, note: "Never track body text: it fights the designer's spacing." },
    { role: "Small / caption", size: b * 0.8, tracking: 0.01, note: "A hair of positive tracking at small sizes." },
    { role: "Uppercase / caps", size: b * 0.9, tracking: bump, note: "Always track uppercase; capitals are drawn to be spaced." },
    { role: "Button label", size: b * 0.875, tracking: bump * 0.5, note: "Half the uppercase bump if the label is sentence case." },
    { role: "Numeric / tabular", size: b, tracking: 0.01, note: "Separates digits in dense tables." },
  ];

  const rows = roles.map((r) => [
    r.role,
    `${fmtTrim(r.size, 1)}px`,
    `${fmtTrim(r.tracking, 4)}em`,
    `${fmtTrim(r.tracking * r.size, 3)}px`,
    r.note,
  ]);

  const css = `:root {
${roles
  .map((r) => `  --tracking-${r.role.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}: ${fmtTrim(r.tracking, 4)}em; /* ${r.role} */`)
  .join("\n")}
}

.uppercase { letter-spacing: var(--tracking-uppercase-caps); text-transform: uppercase; }
.display { letter-spacing: var(--tracking-display-hero); }`;

  const sel = ["Inter", "Fraunces", "Space Grotesk", "JetBrains Mono", "Bebas Neue"];

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Base sizes</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="base" label="Body size" unit="px" value={base} onChange={setBase} min={12} max={22} step={1} />
          <SliderNum name="display" label="Display size" unit="px" value={display} onChange={setDisplay} min={24} max={120} step={2} />
          <SliderNum name="bump" label="Uppercase tracking" unit="em" value={uppercaseBump} onChange={setUppercaseBump} min={0.01} max={0.15} step={0.005} />
          <Sel name="family" label="Sample family" value={family} onChange={setFamily} options={sel.map((f) => ({ value: f, label: f }))} />
        </div>
        <ResBox>
          <Res name="tracking" label="Roles with tracking ≠ 0" value={`${roles.filter((r) => r.tracking !== 0).length} / ${roles.length}`} />
          <Res name="pxBody" label="Body tracking in px" value={`${fmtTrim(0 * b, 3)}px`} />
          <Res name="caps" label="Uppercase at 14px" value={`${fmtTrim(bump * 14, 3)}px`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Role table</PanelTitle>
          <RefTable cols={["Role", "Size", "Tracking", "px", "Rule"]} rows={rows} minWidth={640} />
        </Panel>
        <Panel>
          <PanelTitle>Uppercase counter-example</PanelTitle>
          <p
            className="text-foreground"
            style={{ fontFamily: family, fontSize: `${b * 0.9}px`, letterSpacing: "0em", textTransform: "uppercase" }}
          >
            Untracked uppercase crowds — {family}
          </p>
          <p
            className="mt-2 text-foreground"
            style={{ fontFamily: family, fontSize: `${b * 0.9}px`, letterSpacing: `${bump}em`, textTransform: "uppercase" }}
          >
            Tracked uppercase breathes — {family}
          </p>
        </Panel>
        <CodeOut code={css} title="Tracking tokens" testid="tracking-css" />
      </div>
    </CalcLayout>
  );
}
