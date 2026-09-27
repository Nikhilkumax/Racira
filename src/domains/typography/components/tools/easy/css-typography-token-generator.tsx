"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, FormGrid, Num, Panel, PanelTitle, Res, ResBox, TextInput, fmtTrim } from "../ui";

/**
 * CSS Typography Token Generator — a design-token export of one modular
 * scale: font-size steps, paired line-heights, and the three font stacks,
 * emitted as CSS custom properties AND a JSON token object.
 *
 *   font-size token n = base × ratio^n, n = −2 … +4 by default
 *   line-height token: tightens as the step grows (headings 1.15→1.3,
 *   body 1.5, small 1.6) — the same ratio dance as the Type Scale Generator.
 */
const STEP_NAMES = ["2xs", "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];

export default function CssTypographyTokenGenerator() {
  const [prefix, setPrefix] = useState("--font");
  const [base, setBase] = useState("16");
  const [ratio, setRatio] = useState("1.25");
  const [bodyStack, setBodyStack] = useState("Inter, system-ui, sans-serif");
  const [headingStack, setHeadingStack] = useState("Fraunces, Georgia, serif");
  const [monoStack, setMonoStack] = useState("'JetBrains Mono', ui-monospace, monospace");

  const b = parseFloat(base);
  const q = parseFloat(ratio);
  const valid = Number.isFinite(b) && b > 0 && Number.isFinite(q) && q > 1;

  // 9 tokens: steps −2…+6 mapped to the STEP_NAMES list.
  const tokens = STEP_NAMES.map((name, i) => {
    const step = i - 2;
    const size = valid ? b * q ** step : NaN;
    const lh = step >= 3 ? 1.15 : step === 2 ? 1.25 : step === 1 ? 1.4 : step === 0 ? 1.5 : 1.6;
    return { name, step, size, lh };
  });

  const cssLines = valid
    ? [
        ":root {",
        ...tokens.flatMap((t) => [
          `  ${prefix}-size-${t.name}: ${fmtTrim(t.size, 3)}px;`,
          `  ${prefix}-leading-${t.name}: ${t.lh};`,
        ]),
        `  ${prefix}-family-body: ${bodyStack};`,
        `  ${prefix}-family-heading: ${headingStack};`,
        `  ${prefix}-family-mono: ${monoStack};`,
        "}",
      ]
    : [];
  const css = cssLines.join("\n");

  const json = valid
    ? JSON.stringify(
        {
          font: {
            size: Object.fromEntries(tokens.map((t) => [t.name, `${fmtTrim(t.size, 3)}px`])),
            leading: Object.fromEntries(tokens.map((t) => [t.name, t.lh])),
            family: { body: bodyStack, heading: headingStack, mono: monoStack },
          },
        },
        null,
        2,
      )
    : "";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Token source</PanelTitle>
        <FormGrid>
          <TextInput name="prefix" label="Token prefix" value={prefix} onChange={setPrefix} />
          <Num name="base" label="Base size" unit="px" value={base} onChange={setBase} step={0.5} />
          <Num name="ratio" label="Ratio" value={ratio} onChange={setRatio} step={0.001} />
        </FormGrid>
        <div className="mt-3 space-y-3">
          <TextInput name="bodyStack" label="Body stack" value={bodyStack} onChange={setBodyStack} />
          <TextInput name="headingStack" label="Heading stack" value={headingStack} onChange={setHeadingStack} />
          <TextInput name="monoStack" label="Mono stack" value={monoStack} onChange={setMonoStack} />
        </div>
        <ResBox>
          <Res name="tokens" label="Tokens emitted" value={valid ? `${tokens.length * 2 + 3}` : "—"} />
          <Res name="range" label="Size range" value={valid ? `${fmtTrim(tokens[0].size, 2)} – ${fmtTrim(tokens[tokens.length - 1].size, 2)}px` : "—"} />
          <Res
            name="span"
            label="Full scale factor"
            value={valid ? `${fmtTrim(tokens[tokens.length - 1].size / tokens[0].size, 2)}×` : "—"}
          />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Token names run 2xs → 4xl across steps −2 → +6. Line-heights pair with each step: 1.6 for small text, 1.5 for
          body, tightening to 1.15 at the top of the scale.
        </p>
      </Panel>
      <div className="space-y-4">
        <CodeOut code={css || "/* enter a valid base size and ratio */"} title="CSS tokens" testid="token-css" />
        <CodeOut code={json || "{}"} title="JSON tokens" language="json" testid="token-json" />
      </div>
    </CalcLayout>
  );
}
