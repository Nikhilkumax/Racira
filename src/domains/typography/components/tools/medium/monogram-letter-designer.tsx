"use client";

import { useState, type ReactNode } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Radios, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

type Frame = "none" | "circle" | "square" | "shield" | "diamond";

const FRAMES: Record<Frame, (size: number, stroke: number) => ReactNode> = {
  none: () => null,
  circle: (s, sw) => <circle cx={s / 2} cy={s / 2} r={s / 2 - sw} fill="none" stroke="currentColor" strokeWidth={sw} />,
  square: (s, sw) => <rect x={sw} y={sw} width={s - sw * 2} height={s - sw * 2} rx={s * 0.06} fill="none" stroke="currentColor" strokeWidth={sw} />,
  diamond: (s, sw) => (
    <polygon
      points={`${s / 2},${sw} ${s - sw},${s / 2} ${s / 2},${s - sw} ${sw},${s / 2}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
    />
  ),
  shield: (s, sw) => (
    <path
      d={`M ${sw} ${sw} L ${s - sw} ${sw} L ${s - sw} ${s * 0.55} Q ${s - sw} ${s - sw * 1.4} ${s / 2} ${s - sw} Q ${sw} ${s - sw * 1.4} ${sw} ${s * 0.55} Z`}
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
    />
  ),
};

/**
 * Monogram Letter Designer — sets two or three initials in a frame and exports
 * them as an inline SVG. Monograms are a spacing problem before they are a
 * drawing problem: the letters have to interlock without losing legibility, the
 * frame must clear the letterforms optically rather than mathematically, and the
 * whole mark has to survive at 24px.
 */
export default function MonogramLetterDesigner() {
  const [initials, setInitials] = useState("RT");
  const [family, setFamily] = useState("Fraunces");
  const [frame, setFrame] = useState<Frame>("circle");
  const [layout, setLayout] = useState("interlocked");
  const [size, setSize] = useState("160");
  const [overlap, setOverlap] = useState("0.1");
  const [tracking, setTracking] = useState("0.02");
  const [stroke, setStroke] = useState("3");
  const [weight, setWeight] = useState("600");
  const [ink, setInk] = useState("#111827");

  const font = FONTS.find((f) => f.name === family) ?? FONTS[1];
  const s = Math.min(320, Math.max(60, parseFloat(size) || 160));
  const ov = Math.min(0.4, Math.max(0, parseFloat(overlap) || 0.1));
  const tr = Math.min(0.4, Math.max(-0.05, parseFloat(tracking) || 0.02));
  const sw = Math.min(12, Math.max(0, parseFloat(stroke) || 3));
  const w = parseFloat(weight) || 600;
  const letters = [...initials.toUpperCase()].slice(0, 3);
  const fontSize = letters.length > 2 ? s * 0.42 : s * 0.62;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" role="img" aria-label="${letters.join("")} monogram">
  <g fill="${ink}" stroke="${ink}">
    ${frame !== "none" ? `<g opacity="0.9">${`<!-- ${frame} frame -->`}</g>` : ""}
    ${letters.map((l, i) => `<text x="${(s / (letters.length + 1)) * (i + 1) + i * ov * s * 0.5}" y="${s * 0.68}" font-family="${font.stack}" font-size="${fontSize}" font-weight="${w}" letter-spacing="${tr}em" text-anchor="middle">${l}</text>`).join("\n    ")}
  </g>
</svg>`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Monogram</PanelTitle>
        <div className="space-y-3">
          <TextInput name="initials" label="Initials (max 3)" value={initials} onChange={setInitials} placeholder="RT" />
          <Sel name="font" label="Face" value={family} onChange={setFamily} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
          <Sel
            name="frame"
            label="Frame"
            value={frame}
            onChange={(v) => setFrame(v as Frame)}
            options={[
              { value: "none", label: "No frame" },
              { value: "circle", label: "Circle" },
              { value: "square", label: "Rounded square" },
              { value: "diamond", label: "Diamond" },
              { value: "shield", label: "Shield" },
            ]}
          />
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Layout</span>
            <Radios
              name="layout"
              value={layout}
              onChange={setLayout}
              ariaLabel="monogram layout"
              options={[
                { value: "interlocked", label: "Interlocked" },
                { value: "spaced", label: "Evenly spaced" },
                { value: "stacked", label: "Stacked" },
              ]}
            />
          </div>
          <SliderNum name="size" label="Size" unit="px" value={size} onChange={setSize} min={60} max={320} step={10} />
          <SliderNum name="overlap" label="Overlap" unit="× em" value={overlap} onChange={setOverlap} min={0} max={0.4} step={0.01} />
          <SliderNum name="tracking" label="Tracking" unit="em" value={tracking} onChange={setTracking} min={-0.05} max={0.4} step={0.005} />
          <SliderNum name="stroke" label="Frame stroke" unit="px" value={stroke} onChange={setStroke} min={0} max={12} step={0.5} />
          <SliderNum name="weight" label="Letter weight" value={weight} onChange={setWeight} min={300} max={800} step={100} />
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ink</span>
            <input type="color" value={ink} onChange={(e) => setInk(e.target.value)} className="h-9 w-full rounded-lg border border-border" />
          </label>
        </div>
        <ResBox>
          <Res name="letters" label="Letters set" value={`${letters.length}`} />
          <Res name="clearance" label="Frame clearance" value={`${fmtTrim(((s - fontSize * letters.length * 0.6) / 2) / s, 3)} of the box`} />
          <Res name="small" label="Legible at 24px?" value={letters.length > 2 ? "tight — consider two initials" : "yes, at this weight and size"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Preview</PanelTitle>
          <div className="flex flex-wrap items-center gap-6">
            <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} data-testid="monogram-svg" className="text-current" style={{ color: ink, maxWidth: "100%" }}>
              {FRAMES[frame](s, Math.max(1, sw))}
              {letters.map((l, i) => {
                const step = layout === "stacked" ? 0 : (s / (letters.length + 1)) * (i + 1) + i * ov * s * 0.5;
                const y = layout === "stacked" ? s * 0.45 + i * fontSize * 0.72 : s * 0.68;
                const x = layout === "stacked" ? s / 2 : step;
                return (
                  <text
                    key={`${l}-${i}`}
                    x={x}
                    y={y}
                    fontFamily={font.stack}
                    fontSize={layout === "stacked" ? fontSize * 0.72 : fontSize}
                    fontWeight={w}
                    letterSpacing={`${tr}em`}
                    textAnchor="middle"
                    fill={ink}
                  >
                    {l}
                  </text>
                );
              })}
            </svg>
            <div className="space-y-3">
              {[24, 40, 64].map((small) => (
                <div key={small} className="flex items-center gap-3">
                  <span className="w-12 font-mono text-[10px] text-muted-foreground">{small}px</span>
                  <svg width={small} height={small} viewBox={`0 0 ${s} ${s}`} style={{ color: ink }}>
                    {FRAMES[frame](s, Math.max(1, sw * (s / small) * 0.12))}
                    {letters.map((l, i) => (
                      <text
                        key={i}
                        x={layout === "stacked" ? s / 2 : (s / (letters.length + 1)) * (i + 1) + i * ov * s * 0.5}
                        y={layout === "stacked" ? s * 0.45 + i * fontSize * 0.72 : s * 0.68}
                        fontFamily={font.stack}
                        fontSize={layout === "stacked" ? fontSize * 0.72 : fontSize}
                        fontWeight={w}
                        textAnchor="middle"
                        fill={ink}
                      >
                        {l}
                      </text>
                    ))}
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Monogram rules</PanelTitle>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>· Two letters interlock easily; three need the middle letter reduced or raised, or the mark becomes a block.</li>
            <li>· The frame is sized to the letters' optical bounds, not their em box — a mathematically centred monogram looks high.</li>
            <li>· Draw it as SVG so it scales: a monogram is used from favicon size to signage.</li>
            <li>· Test the mark in a single flat colour first; if it needs two colours to read, the letterforms are the problem.</li>
          </ul>
        </Panel>

        <CodeOut code={svg} title="Inline SVG" testid="monogram-svg-code" language="svg" />
      </div>
    </CalcLayout>
  );
}
