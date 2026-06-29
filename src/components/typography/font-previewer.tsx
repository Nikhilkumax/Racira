"use client";
import { useState } from "react";

const FONTS = [
  { name: "Inter", stack: "'Inter', sans-serif" },
  { name: "Fraunces", stack: "'Fraunces', serif" },
  { name: "Playfair Display", stack: "'Playfair Display', serif" },
  { name: "Lora", stack: "'Lora', serif" },
  { name: "Source Serif 4", stack: "'Source Serif 4', serif" },
  { name: "Merriweather", stack: "'Merriweather', serif" },
  { name: "Space Grotesk", stack: "'Space Grotesk', sans-serif" },
  { name: "DM Sans", stack: "'DM Sans', sans-serif" },
  { name: "Manrope", stack: "'Manrope', sans-serif" },
  { name: "Poppins", stack: "'Poppins', sans-serif" },
  { name: "JetBrains Mono", stack: "'JetBrains Mono', monospace" },
  { name: "Bebas Neue", stack: "'Bebas Neue', sans-serif" },
  { name: "Roboto Slab", stack: "'Roboto Slab', serif" },
];

const WEIGHTS = [300, 400, 500, 600, 700];

export function FontPreviewer() {
  const [text, setText] = useState(
    "The quick brown fox jumps over the lazy dog",
  );
  const [font, setFont] = useState(FONTS[0]);
  const [size, setSize] = useState(64);
  const [weight, setWeight] = useState(600);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [italic, setItalic] = useState(false);

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-6 rounded-2xl border border-border bg-card p-6 h-fit lg:sticky lg:top-24">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Sample text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Font family
          </label>
          <select
            value={font.name}
            onChange={(e) =>
              setFont(FONTS.find((f) => f.name === e.target.value) ?? FONTS[0])
            }
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            {FONTS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <Slider
          label="Size"
          value={size}
          min={12}
          max={160}
          step={1}
          unit="px"
          onChange={setSize}
        />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Weight
          </label>
          <div className="flex flex-wrap gap-1.5">
            {WEIGHTS.map((w) => (
              <button
                key={w}
                onClick={() => setWeight(w)}
                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                  weight === w
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <Slider
          label="Line height"
          value={lineHeight}
          min={0.8}
          max={2.5}
          step={0.05}
          onChange={setLineHeight}
        />
        <Slider
          label="Letter spacing"
          value={letterSpacing}
          min={-5}
          max={20}
          step={0.5}
          unit="px"
          onChange={setLetterSpacing}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={italic}
            onChange={(e) => setItalic(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-[var(--primary)]"
          />
          Italic
        </label>
      </aside>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12 min-h-[320px] flex items-center">
          <p
            style={{
              fontFamily: font.stack,
              fontSize: `${size}px`,
              fontWeight: weight,
              lineHeight,
              letterSpacing: `${letterSpacing}px`,
              fontStyle: italic ? "italic" : "normal",
              color: "var(--foreground)",
              wordBreak: "break-word",
            }}
          >
            {text || "Type something above…"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Waterfall preview
          </h3>
          <div className="space-y-3">
            {[14, 18, 24, 32, 48, 72, 96].map((s) => (
              <div key={s} className="flex items-baseline gap-4">
                <span className="w-12 text-xs text-muted-foreground tabular-nums">
                  {s}px
                </span>
                <span
                  style={{
                    fontFamily: font.stack,
                    fontSize: `${s}px`,
                    fontWeight: weight,
                    fontStyle: italic ? "italic" : "normal",
                    letterSpacing: `${letterSpacing}px`,
                    lineHeight: 1.1,
                  }}
                  className="truncate"
                >
                  {text || "Sample text"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            CSS
          </h3>
          <pre className="overflow-x-auto rounded-md bg-foreground/5 p-4 text-xs leading-relaxed">
{`font-family: ${font.stack};
font-size: ${size}px;
font-weight: ${weight};
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}px;
font-style: ${italic ? "italic" : "normal"};`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <span className="text-xs tabular-nums text-foreground">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--primary)]"
      />
    </div>
  );
}
