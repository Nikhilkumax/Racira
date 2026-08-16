"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const RATIOS = [
  { id: "4:3", label: "4:3 (Source/Source 2)", w: 4, h: 3 },
  { id: "16:9", label: "16:9 (Unreal/Modern)", w: 16, h: 9 },
  { id: "1:1", label: "1:1 (Vertical Basis)", w: 1, h: 1 },
  { id: "16:10", label: "16:10 (Laptop Screens)", w: 16, h: 10 },
  { id: "21:9", label: "21:9 (Ultrawide)", w: 21, h: 9 },
] as const;

interface FovResult {
  baseFov: number;
  baseW: number;
  baseH: number;
  targetW: number;
  targetH: number;
  vFov: number;
  hFov: number;
  hFov16_9: number;
  hFov21_9: number;
  hFov32_9: number;
  chartData: { name: string; value: number }[];
}

// Source-engine FOV conversion: the base FOV is a horizontal FOV on a reference aspect ratio.
function calcFov(baseFov: number, baseW: number, baseH: number, targetW: number, targetH: number): FovResult {
  const fovRad = (baseFov * Math.PI) / 180;
  const vFovRad = 2 * Math.atan(Math.tan(fovRad / 2) * (baseH / baseW));
  const vFov = (vFovRad * 180) / Math.PI;
  const hFov = (2 * Math.atan(Math.tan(vFovRad / 2) * (targetW / targetH)) * 180) / Math.PI;
  const hFov16_9 = (2 * Math.atan(Math.tan(vFovRad / 2) * (16 / 9)) * 180) / Math.PI;
  const hFov21_9 = (2 * Math.atan(Math.tan(vFovRad / 2) * (21 / 9)) * 180) / Math.PI;
  const hFov32_9 = (2 * Math.atan(Math.tan(vFovRad / 2) * (32 / 9)) * 180) / Math.PI;
  const chartData = [
    { name: "Vertical", value: Number(vFov.toFixed(1)) },
    { name: "Your Ratio", value: Number(hFov.toFixed(1)) },
    { name: "16:9", value: Number(hFov16_9.toFixed(1)) },
    { name: "21:9", value: Number(hFov21_9.toFixed(1)) },
    { name: "32:9", value: Number(hFov32_9.toFixed(1)) },
  ];
  return { baseFov, baseW, baseH, targetW, targetH, vFov, hFov, hFov16_9, hFov21_9, hFov32_9, chartData };
}

const DEFAULTS = { fov: "90", base: "4:3", target: "16:9" };

const faqs = [
  { question: "What is Horizontal vs Vertical FOV?", answer: "Horizontal FOV (hFOV) measures how much you can see from left to right. Vertical FOV (vFOV) measures from top to bottom. Most games define FOV horizontally based on a 4:3 aspect ratio, even if you play at 16:9." },
  { question: "Does a higher FOV give me an advantage?", answer: "A higher FOV increases your peripheral vision, helping you spot enemies at the edges of your screen. However, it also makes targets in the center appear smaller and harder to hit (the 'fish-eye' effect)." },
  { question: "Why do some games feel faster with high FOV?", answer: "High FOV increases the perceived speed of peripheral motion. This makes the game feel faster and more intense, which is popular in arena shooters like Quake or Doom." },
];

export default function FovCalculator() {
  const [fov, setFov] = useState(DEFAULTS.fov);
  const [base, setBase] = useState(DEFAULTS.base);
  const [target, setTarget] = useState(DEFAULTS.target);

  const baseRatio = RATIOS.find((r) => r.id === base) ?? RATIOS[0];
  const targetRatio = RATIOS.find((r) => r.id === target) ?? RATIOS[1];

  const [result, setResult] = useState<FovResult>(() => calcFov(90, 4, 3, 16, 9));

  useEffect(() => {
    const f = parseFloat(fov);
    if (isNaN(f) || f <= 0 || f >= 180) return;
    setResult(calcFov(f, baseRatio.w, baseRatio.h, targetRatio.w, targetRatio.h));
  }, [fov, base, target]);

  const reset = () => {
    setFov(DEFAULTS.fov);
    setBase(DEFAULTS.base);
    setTarget(DEFAULTS.target);
    setResult(calcFov(90, 4, 3, 16, 9));
  };

  const breakdown = [
    { label: "Game FOV Setting", value: `${result.baseFov}° (horizontal, ${result.baseW}:${result.baseH})`, highlight: false },
    { label: "Your Aspect Ratio", value: `${result.targetW}:${result.targetH}`, highlight: false },
    { label: `True hFOV at ${result.targetW}:${result.targetH}`, value: `${result.hFov.toFixed(1)}°`, highlight: true },
    { label: "Vertical FOV (vFOV)", value: `${result.vFov.toFixed(1)}°`, highlight: false },
    { label: "hFOV if you switched to 21:9", value: `${result.hFov21_9.toFixed(1)}°`, highlight: false },
    { label: "hFOV if you switched to 32:9", value: `${result.hFov32_9.toFixed(1)}°`, highlight: false },
  ];

  const summaryStats = [
    { label: "hFOV Gain vs 16:9", value: `+${(result.hFov - result.hFov16_9).toFixed(1)}°` },
    { label: "Pixel Stretch", value: `${result.hFov > result.baseFov ? "Wider view, smaller targets" : "Narrower view, larger targets"}` },
    { label: "Rule of Thumb", value: "90° @ 4:3 ≈ 106° @ 16:9" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "FOV Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">FOV (Field of View) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Eye className="w-4 h-4" /> Field of View Conversion
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">In-Game FOV Value</label>
                <input
                  type="number"
                  value={fov}
                  onChange={(e) => setFov(e.target.value)}
                  className="input-calc"
                  placeholder="e.g. 90"
                  min={1}
                  max={179}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Game FOV Basis</label>
                <select value={base} onChange={(e) => setBase(e.target.value)} className="input-calc">
                  {RATIOS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Your Aspect Ratio</label>
                <select value={target} onChange={(e) => setTarget(e.target.value)} className="input-calc">
                  {RATIOS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setResult(calcFov(parseFloat(fov) || 90, baseRatio.w, baseRatio.h, targetRatio.w, targetRatio.h))} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Eye className="w-4 h-4 text-primary" /> TRUE HORIZONTAL FOV
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.hFov.toFixed(1)}°</span>
                <span className="text-sm text-muted-foreground">at {result.targetW}:{result.targetH}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your {result.baseFov}° setting is measured on the {result.baseW}:{result.baseH} basis — the same setting is a {result.hFov.toFixed(1)}° horizontal FOV on your {result.targetW}:{result.targetH} screen.
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">FOV Across Aspect Ratios</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="°" />
                  <Tooltip formatter={(v: number) => [`${v}°`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the FOV Calculator</h2>
            <p>Most games store a single FOV number but interpret it against a fixed reference aspect ratio. The Source engine (CS, TF2, Portal) assumes 4:3, while Unreal-based games assume 16:9. If you set 90° in a Source game on a 16:9 monitor, you are actually seeing about 106° of horizontal view — the conversion is done by projecting through the vertical FOV.</p>
            <h3>The math behind the conversion</h3>
            <p>First the base horizontal FOV is converted to its vertical equivalent: vFOV = 2·atan(tan(hFOV/2) · h/w). The vertical FOV is invariant, so the true horizontal FOV for any other ratio is hFOV' = 2·atan(tan(vFOV/2) · w'/h'). Ultrawide users gain real peripheral vision (a 21:9 screen at the same setting shows roughly 13° more), while portrait-oriented setups lose it — which is why some games cap FOV on ultrawide to prevent an aiming advantage.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fov-calculator" />
          <PopularCalculators exclude="/calculator/fov-calculator" />
        </div>
      </div>
    </>
  );
}
