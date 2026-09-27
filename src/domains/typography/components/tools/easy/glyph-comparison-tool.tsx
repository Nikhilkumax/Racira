"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, Radios, RefTable, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

const PRESETS = [
  { label: "Alphabet", value: "ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz" },
  { label: "Numerals", value: "0123456789\n1 7 4 — old-style vs lining" },
  { label: "Ambiguous", value: "O0 Il1 S5 Z2 B8 G6 rn m" },
  { label: "Punctuation", value: "“”‘’—–… • § ¶ † ‡ @ & % $ €" },
  { label: "Lowercase shapes", value: "g a y R Q t f j" },
];

/**
 * Glyph Comparison Tool — renders the same characters in several families at
 * once so design decisions are made on evidence: x-height differences, the
 * shape of g/a/y, and how numerals are drawn (lining, old-style, tabular) are
 * the usual reasons a font that looks right in isolation fails in a layout.
 */
export default function GlyphComparisonTool() {
  const [chars, setChars] = useState(PRESETS[0].value);
  const [size, setSize] = useState("40");
  const [weight, setWeight] = useState("400");
  const [layout, setLayout] = useState("grid");
  const [picked, setPicked] = useState<string[]>(FONTS.slice(0, 6).map((f) => f.name));

  const px = Math.min(160, Math.max(12, parseFloat(size) || 40));
  const w = parseFloat(weight) || 400;
  const chosen = FONTS.filter((f) => picked.includes(f.name));

  const toggle = (name: string) =>
    setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Characters & settings</PanelTitle>
        <div className="space-y-3">
          <TextInput name="chars" label="Characters (newlines allowed)" value={chars} onChange={setChars} />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setChars(p.value)}
                className="rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-accent"
              >
                {p.label}
              </button>
            ))}
          </div>
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={12} max={160} step={1} />
          <SliderNum name="weight" label="Weight" value={weight} onChange={setWeight} min={300} max={700} step={100} />
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Layout
            </span>
            <Radios
              name="layout"
              value={layout}
              onChange={setLayout}
              ariaLabel="layout"
              options={[
                { value: "grid", label: "Stacked rows" },
                { value: "columns", label: "Columns" },
              ]}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Families ({(chosen.length)} selected)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => toggle(f.name)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    picked.includes(f.name)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Comparison</PanelTitle>
          <div
            data-testid="glyph-compare"
            className={layout === "columns" ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}
          >
            {chosen.map((f) => (
              <div key={f.name} className="border-b border-border/40 pb-3 last:border-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {f.name} · {f.kind}
                </span>
                <pre
                  className="mt-1 overflow-x-auto whitespace-pre-wrap break-words text-foreground"
                  style={{ fontFamily: f.stack, fontSize: `${px}px`, fontWeight: w, lineHeight: 1.2 }}
                >
                  {chars || "Aa"}
                </pre>
              </div>
            ))}
            {chosen.length === 0 && <p className="text-sm text-muted-foreground">Select at least one family.</p>}
          </div>
        </Panel>

        <Panel>
          <PanelTitle>What to look for</PanelTitle>
          <RefTable
            cols={["Feature", "Why it decides the pairing"]}
            rows={[
              ["x-height", "Two faces with different x-heights look different at the same nominal size; set sizes by x-height, not by number."],
              ["Single vs double-storey g/a", "Changes the texture of body text and how neutral the face reads."],
              ["Numeral style", "Old-style figures sit in the text flow; lining figures align with capitals — tables usually need tabular lining."],
              ["Terminal cuts", "Horizontal terminals read technical; angled terminals read humanist."],
              ["Contrast axis", "High-contrast faces need larger sizes than low-contrast ones before they become hard to read."],
            ]}
            minWidth={540}
          />
        </Panel>
      </div>
    </CalcLayout>
  );
}
