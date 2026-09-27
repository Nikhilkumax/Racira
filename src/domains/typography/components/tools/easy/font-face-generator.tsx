"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, FormGrid, Panel, PanelTitle, Res, ResBox, Sel, TextInput } from "../ui";

/**
 * @font-face Generator — builds the declaration (local() first, url() second)
 * with the weight/style/display/unicode-range fields that actually matter for
 * performance and correctness.
 */
const FORMATS = [
  { value: "woff2", label: "woff2 (best)" },
  { value: "woff", label: "woff" },
  { value: "truetype", label: "truetype (ttf)" },
  { value: "opentype", label: "opentype (otf)" },
];

export default function FontFaceGenerator() {
  const [family, setFamily] = useState("Racira Sans");
  const [local, setLocal] = useState("Racira Sans");
  const [url, setUrl] = useState("/fonts/racira-sans.woff2");
  const [format, setFormat] = useState("woff2");
  const [weight, setWeight] = useState("400");
  const [style, setStyle] = useState("normal");
  const [display, setDisplay] = useState("swap");
  const [range, setRange] = useState("U+0000-00FF, U+0131, U+2000-206F");

  const hasUrl = url.trim().length > 0;
  const src = [local.trim() ? `local("${local.trim()}")` : null, hasUrl ? `url("${url.trim()}") format("${format}")` : null]
    .filter(Boolean)
    .join(",\n       ");

  const css = [
    "@font-face {",
    `  font-family: "${family}";`,
    `  src: ${src || "/* add a local name or file URL */"};`,
    `  font-weight: ${weight};`,
    `  font-style: ${style};`,
    `  font-display: ${display};`,
    range.trim() ? `  unicode-range: ${range};` : null,
    "}",
  ]
    .filter(Boolean)
    .join("\n");

  const usage = [
    `font-family: "${family}", sans-serif;`,
    weight !== "400" || style !== "normal" ? `/* request with the matching weight/style */\nfont-weight: ${weight};\nfont-style: ${style};` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Declare the face</PanelTitle>
        <FormGrid>
          <TextInput name="family" label="font-family" value={family} onChange={setFamily} />
          <TextInput name="local" label="local() name (optional)" value={local} onChange={setLocal} />
          <TextInput name="url" label="Font file URL" value={url} onChange={setUrl} />
          <Sel name="format" label="Format" value={format} onChange={setFormat} options={FORMATS} />
          <TextInput name="weight" label="font-weight" value={weight} onChange={setWeight} placeholder="400 or 100 900" />
          <Sel
            name="style"
            label="font-style"
            value={style}
            onChange={setStyle}
            options={[
              { value: "normal", label: "normal" },
              { value: "italic", label: "italic" },
              { value: "oblique", label: "oblique" },
            ]}
          />
          <Sel
            name="display"
            label="font-display"
            value={display}
            onChange={setDisplay}
            options={[
              { value: "swap", label: "swap — text visible immediately" },
              { value: "fallback", label: "fallback — short block period" },
              { value: "optional", label: "optional — no layout shift" },
              { value: "block", label: "block — invisible until loaded" },
              { value: "auto", label: "auto — browser decides" },
            ]}
          />
          <TextInput name="range" label="unicode-range (optional)" value={range} onChange={setRange} />
        </FormGrid>
        <ResBox>
          <Res name="sources" label="src() entries" value={String([local.trim() && 1, hasUrl && 1].filter(Boolean).length)} />
          <Res name="display" label="Loading trade-off" value={display === "swap" ? "FOUT, no blank text" : display === "block" ? "FOIT, blank text" : display === "optional" ? "no shift after first paint" : "browser default"} />
          <Res name="range" label="unicode-range" value={range.trim() ? "scoped subset" : "entire font"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <CodeOut code={css} title="@font-face" testid="font-face-css" />
        <CodeOut code={usage} title="Usage" testid="font-face-usage" />
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <p className="text-2xl text-foreground" style={{ fontFamily: `"${family}", sans-serif`, fontWeight: parseFloat(weight) || 400, fontStyle: style as never }}>
            Handgloves — Wmgybridq 0123456789
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            The preview uses a locally installed family of the same name if one exists; the declaration itself ships
            regardless.
          </p>
        </Panel>
      </div>
    </CalcLayout>
  );
}
