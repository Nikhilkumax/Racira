"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, TextArea } from "../ui";

/**
 * Google Fonts CSS Generator — turns a family/weight selection into a valid
 * CSS2 API URL, the <link> tags that use it, and the CSS that applies it.
 *
 * Encoding rules implemented here: spaces → "+", weights sorted ascending and
 * comma-separated, italics expressed as ital,wght tuples (0,wght / 1,wght),
 * tuples sorted by ital then wght — the exact ordering the API requires.
 */
const FAMILY_PRESETS = [
  "Inter",
  "Fraunces",
  "Playfair Display",
  "Lora",
  "Source Serif 4",
  "Merriweather",
  "Space Grotesk",
  "DM Sans",
  "Manrope",
  "Poppins",
  "JetBrains Mono",
];

const WEIGHTS = [300, 400, 500, 600, 700];

export default function GoogleFontsCssGenerator() {
  const [input, setInput] = useState("Inter\nFraunces");
  const [weights, setWeights] = useState<number[]>([400, 700]);
  const [italic, setItalic] = useState(false);
  const [display, setDisplay] = useState("swap");

  const families = input
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  // CSS2 axis tuples must be sorted by axis order (ital, then wght).
  const tuples = (italic ? weights.flatMap((w) => [`0,${w}`, `1,${w}`]) : weights.map(String))
    .slice()
    .sort((a, b) => {
      const [ai, aw] = a.split(",").map(Number);
      const [bi, bw] = b.split(",").map(Number);
      return ai - bi || aw - bw;
    });
  const familyParams = families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:${italic ? "ital,wght" : "wght"}@${tuples.join(";")}`);
  const href = familyParams.length ? `https://fonts.googleapis.com/css2?${familyParams.join("&")}&display=${display}` : "";

  const links = href
    ? [
        '<link rel="preconnect" href="https://fonts.googleapis.com" />',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
        `<link href="${href}" rel="stylesheet" />`,
      ].join("\n")
    : "";

  const usage = families.length
    ? families.map((f) => `font-family: "${f}", ${f.toLowerCase().includes("mono") ? "monospace" : "sans-serif"};`).join("\n")
    : "";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Families & weights</PanelTitle>
        <TextArea
          name="families"
          label="Family names (one per line)"
          value={input}
          onChange={setInput}
          rows={4}
          placeholder={"Inter\nFraunces"}
        />
        <div className="mt-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Weights</div>
          <div className="flex flex-wrap gap-2">
            {WEIGHTS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeights((ws) => (ws.includes(w) ? ws.filter((x) => x !== w) : [...ws, w]))}
                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                  weights.includes(w) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-accent"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={italic} onChange={(e) => setItalic(e.target.checked)} className="accent-primary" />
            Include italic styles
          </label>
          <Sel
            name="display"
            label="display"
            value={display}
            onChange={setDisplay}
            options={["swap", "fallback", "optional", "block", "auto"].map((v) => ({ value: v, label: v }))}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Suggested families: {FAMILY_PRESETS.join(" · ")}
        </p>
        <ResBox>
          <Res name="families" label="Families requested" value={String(families.length)} />
          <Res name="weights" label="Weight tuples" value={String(tuples.length)} />
          <Res name="url" label="URL length" value={href ? `${href.length} characters` : "—"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <CodeOut code={links || "<!-- add at least one family -->"} title="<link> tags" language="html" testid="gf-links" />
        <CodeOut code={usage || "/* no families selected */"} title="Usage" testid="gf-usage" />
        <Panel>
          <PanelTitle>URL</PanelTitle>
          <p className="break-all font-mono text-xs text-muted-foreground">{href || "—"}</p>
        </Panel>
      </div>
    </CalcLayout>
  );
}
