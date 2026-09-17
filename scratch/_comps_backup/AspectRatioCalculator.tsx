"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Monitor } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface AspectRatioInputs {
  width: string;
  height: string;
  showPixelDimensions: boolean;
  showDiagonal: boolean;
  showCommonRatios: boolean;
  precision: string;
}

interface CommonRatioMatch {
  ratio: string;
  decimal: number;
  diff: number;
}

interface AspectRatioResult {
  gcd: number;
  reducedWidth: number;
  reducedHeight: number;
  aspectRatio: string;
  decimalRatio: number;
  diagonal: number;
  closestRatio: string;
  pixelDimensions: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
  commonRatios: CommonRatioMatch[];
}

const COMMON_RATIOS: { w: number; h: number }[] = [
  { w: 1, h: 1 },
  { w: 4, h: 3 },
  { w: 16, h: 9 },
  { w: 16, h: 10 },
  { w: 21, h: 9 },
  { w: 32, h: 9 },
  { w: 3, h: 2 },
  { w: 5, h: 4 },
];

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function gcd(a: number, b: number): number {
  let x = Math.round(a);
  let y = Math.round(b);
  if (x <= 0 || y <= 0) return 1;
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function calcAspectRatio(inputs: AspectRatioInputs): AspectRatioResult {
  const precision = Math.max(0, Math.min(10, Math.floor(num(inputs.precision)) || 2));
  const width = num(inputs.width);
  const height = num(inputs.height);

  const r = (n: number) => parseFloat(n.toFixed(precision));

  const g = gcd(width, height);
  const reducedWidth = Math.round(width / g);
  const reducedHeight = Math.round(height / g);
  const aspectRatio = `${reducedWidth}:${reducedHeight}`;
  const decimalRatio = width > 0 && height > 0 ? width / height : 0;
  const diagonal = Math.sqrt(width * width + height * height);

  const matches: CommonRatioMatch[] = COMMON_RATIOS.map((cr) => {
    const dec = cr.w / cr.h;
    const diff = decimalRatio > 0 ? Math.abs(decimalRatio - dec) : 1;
    return { ratio: `${cr.w}:${cr.h}`, decimal: dec, diff };
  }).sort((a, b) => a.diff - b.diff);

  const closestRatio = decimalRatio > 0 ? matches[0].ratio : "—";

  const pixelDimensions = width > 0 && height > 0 ? `${Math.round(width)} × ${Math.round(height)} px` : "—";

  const breakdown: { label: string; value: string }[] = [
    { label: "Width", value: width > 0 ? `${Math.round(width)} px` : "—" },
    { label: "Height", value: height > 0 ? `${Math.round(height)} px` : "—" },
    { label: "Greatest Common Divisor", value: `${g}` },
    { label: "Reduced Ratio", value: aspectRatio },
    { label: "Decimal Ratio", value: decimalRatio > 0 ? r(decimalRatio).toString() : "—" },
  ];
  if (inputs.showDiagonal) {
    breakdown.push({ label: "Diagonal", value: decimalRatio > 0 ? `${r(diagonal)} px` : "—" });
  }
  if (inputs.showCommonRatios) {
    breakdown.push({ label: "Closest Standard Ratio", value: closestRatio });
  }
  if (inputs.showPixelDimensions) {
    breakdown.push({ label: "Exact Pixel Grid", value: pixelDimensions });
  }

  const summaryStats: { label: string; value: string }[] = [
    { label: "Aspect Ratio", value: aspectRatio },
    { label: "Decimal", value: decimalRatio > 0 ? r(decimalRatio).toString() : "—" },
    { label: "Closest", value: closestRatio },
  ];
  if (inputs.showDiagonal) {
    summaryStats.push({ label: "Diagonal", value: decimalRatio > 0 ? r(diagonal).toString() : "—" });
  }
  if (inputs.showPixelDimensions) {
    summaryStats.push({ label: "Pixels", value: pixelDimensions });
  }

  const chartData = [
    { name: "Width", value: r(width), fill: "#3b82f6" },
    { name: "Height", value: r(height), fill: "#10b981" },
  ];

  return {
    gcd: g,
    reducedWidth,
    reducedHeight,
    aspectRatio,
    decimalRatio,
    diagonal,
    closestRatio,
    pixelDimensions,
    breakdown,
    summaryStats,
    chartData,
    commonRatios: matches,
  };
}

const DEFAULTS: AspectRatioInputs = {
  width: "1920",
  height: "1080",
  showPixelDimensions: true,
  showDiagonal: true,
  showCommonRatios: true,
  precision: "2",
};

export default function AspectRatioCalculator() {
  const [inputs, setInputs] = useState<AspectRatioInputs>(DEFAULTS);
  const [result, setResult] = useState<AspectRatioResult>(calcAspectRatio(DEFAULTS));

  useEffect(() => {
    setResult(calcAspectRatio(inputs));
  }, []);

  const calculate = () => setResult(calcAspectRatio(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcAspectRatio(DEFAULTS));
  };

  const update = (patch: Partial<AspectRatioInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How is the aspect ratio reduced to lowest terms?", answer: "The calculator finds the greatest common divisor (GCD) of the width and height, then divides both by the GCD. For 1920 × 1080 the GCD is 120, giving the standard 16:9 ratio." },
    { question: "What does the diagonal value represent?", answer: "It is the screen diagonal in pixels, computed with the Pythagorean theorem sqrt(width² + height²). It is useful for comparing display sizes on a single scale." },
    { question: "Which standard ratios are compared?", answer: "The tool checks your dimensions against 1:1, 4:3, 16:9, 16:10, 21:9, 32:9, 3:2, and 5:4, then reports the closest match by decimal ratio." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Aspect Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Aspect Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Width</label>
                 <div className={inp}><input type="number" value={inputs.width} onChange={e => update({ width: e.target.value })} min={0} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Height</label>
                 <div className={inp}><input type="number" value={inputs.height} onChange={e => update({ height: e.target.value })} min={0} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Output Formats</div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={inputs.showPixelDimensions} onChange={e => update({ showPixelDimensions: e.target.checked })} className="h-4 w-4" />
                Show Pixel Dimensions
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={inputs.showDiagonal} onChange={e => update({ showDiagonal: e.target.checked })} className="h-4 w-4" />
                Show Diagonal
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={inputs.showCommonRatios} onChange={e => update({ showCommonRatios: e.target.checked })} className="h-4 w-4" />
                Common Ratios
              </label>
              <div className="pt-1">
                <label className="text-sm font-medium mb-1 block">Precision (decimal places)</label>
                 <div className={inp}><input type="number" value={inputs.precision} onChange={e => update({ precision: e.target.value })} min={0} max={10} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Aspect Ratio</div>
              <div className="text-4xl font-extrabold tracking-tight text-primary">{result.aspectRatio}</div>
              <div className="text-sm text-muted-foreground mt-1">Reduced from {Math.round(num(inputs.width))} × {Math.round(num(inputs.height))} using GCD {result.gcd}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Decimal", `${result.decimalRatio > 0 ? result.decimalRatio.toFixed(Math.max(0, Math.min(10, Math.floor(num(inputs.precision)) || 2))) : "—"}`], ["Closest", `${result.closestRatio}`], ["Diagonal", `${result.decimalRatio > 0 && inputs.showDiagonal ? result.diagonal.toFixed(Math.max(0, Math.min(10, Math.floor(num(inputs.precision)) || 2))) : "—"}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/5" : ""}`}>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            {inputs.showCommonRatios && (
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Closest Standard Ratios</h3>
                <table className="w-full text-base"><tbody>
                  {result.commonRatios.map((cr, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${cr.ratio === result.closestRatio ? "bg-primary/5" : ""}`}>
                      <td className="py-2.5 px-3 text-muted-foreground">{cr.ratio}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{cr.decimal.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            )}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Width vs Height</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v, "Pixels"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an Aspect Ratio Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An aspect ratio calculator finds the proportional relationship between the width and height of an image, video frame, or display, expressed as two numbers separated by a colon. The tool computes the greatest common divisor (GCD) of the width and height and divides both values by it, reducing the pair to its lowest terms — for example, 1920 × 1080 becomes the familiar 16:9. It also reports the decimal ratio (width ÷ height), the screen diagonal in pixels using the Pythagorean theorem sqrt(width² + height²), and the closest match from a list of standard ratios such as 1:1, 4:3, 16:9, 16:10, 21:9, 32:9, 3:2, and 5:4. Because empty, zero, or negative inputs are treated as zero rather than producing NaN, the result stays stable even with incomplete fields. Precise pixel dimensions let designers lock content to an exact grid, while the reduced ratio is what matters when scaling a layout to a new size.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Aspect Ratios in Photography, Display & Video</h2>
              <p className="text-muted-foreground leading-relaxed">Aspect ratios shape every visual medium. In photography, full-frame sensors use 3:2 while micro four-thirds cameras use 4:3, and choosing the right ratio before shooting avoids awkward crops later. Display design relies on established standards: monitors and televisions are overwhelmingly 16:9, older business projectors are 4:3, ultrawide monitors are 21:9, and super-ultrawide gaming panels reach 32:9. Video production must match the delivery platform — cinema is often 21:9 or 2.39:1, YouTube and most streaming is 16:9, and social vertical video is 9:16. When you export a 16:9 timeline to a 4:3 display you get letterboxing, so knowing the target ratio up front keeps your composition intact. The calculator's diagonal value helps compare physical screen sizes, and the closest-standard-ratio readout tells you which real-world format your custom dimensions emulate. Use the exact pixel grid output to set export resolutions that line up with native panel resolutions and avoid blurry upscaling.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result card shows your reduced aspect ratio (for example 16:9) with the GCD used to derive it, so you can confirm the simplification is correct. The three-stat bar gives a fast read on the decimal ratio, the closest standard ratio, and the diagonal in pixels when that option is enabled. The breakdown table lists the raw width and height, the GCD, the reduced ratio, the decimal ratio, and any optional outputs you selected in Advanced Options. The closest-standard-ratios table ranks every common format by how near its decimal value is to yours, highlighting the best match. The bar chart visualizes width against height so you can see the proportion at a glance. Summary statistics recap the key figures for quick reference. Adjust precision in Advanced Options to control decimal places, toggle pixel dimensions, diagonal, and common ratios to fit your workflow, and use Reset to restore the default 1920 × 1080 example whenever you start a new comparison.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/aspect-ratio-calculator" />
          <PopularCalculators exclude="/calculator/aspect-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
