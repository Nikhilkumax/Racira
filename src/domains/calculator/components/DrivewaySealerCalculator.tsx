"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, PaintBucket } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SealerResult {
  length: number;
  width: number;
  area: number;
  coats: number;
  coverage: number;
  gallons: number;
  pails: number;
  cost: number;
  chartData: { name: string; value: number }[];
}

function calcSealer(length: number, width: number, coats: number, coverage: number, pailPrice: number): SealerResult {
  const area = length * width;
  const gallons = (area * coats) / coverage;
  const pails = Math.ceil(gallons / 5);
  const cost = pails * pailPrice;
  const chartData = [
    { name: `Coat 1`, value: area / coverage },
    { name: `Coat 2`, value: area / coverage },
  ];
  return { length, width, area, coats, coverage, gallons, pails, cost, chartData };
}

const DEFAULTS = { length: "40", width: "20", coats: "2", price: "75" };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const faqs = [
  { question: "How much driveway sealer do I need?", answer: "One gallon covers about 100–150 sq ft per coat; most driveways need two coats. Total gallons = area × coats ÷ coverage per gallon." },
  { question: "How often should I seal my driveway?", answer: "Every 2–3 years for asphalt in good condition; new asphalt should cure 6–12 months first. Crack-fill before sealing, and seal only when the surface is dry and above ~55°F." },
  { question: "Should I buy 5-gallon pails?", answer: "Sealer is sold in 5-gallon pails (one pail ≈ 500–750 sq ft for two coats). Buyers round up to whole pails — leftover is better than running short mid-coat." },
];

export default function DrivewaySealerCalculator() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [coats, setCoats] = useState(DEFAULTS.coats);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [result, setResult] = useState<SealerResult>(() => calcSealer(40, 20, 2, 100, 75));

  useEffect(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const c = parseFloat(coats);
    const p = parseFloat(price);
    if (!isNaN(l) && !isNaN(w) && !isNaN(c) && !isNaN(p) && l > 0 && w > 0 && c >= 1 && p >= 0) setResult(calcSealer(l, w, c, 100, p));
  }, [length, width, coats, price]);

  const reset = () => { setLength(DEFAULTS.length); setWidth(DEFAULTS.width); setCoats(DEFAULTS.coats); setPrice(DEFAULTS.price); };
  const invalid = isNaN(parseFloat(length)) || isNaN(parseFloat(width)) || isNaN(parseFloat(coats)) || isNaN(parseFloat(price)) || parseFloat(length) <= 0 || parseFloat(width) <= 0 || parseFloat(coats) < 1 || parseFloat(price) < 0;

  const breakdown = [
    { label: "Driveway Area", value: `${result.area.toLocaleString()} sq ft (${result.length} × ${result.width} ft)` },
    { label: "Coats", value: `${result.coats}` },
    { label: "Coverage", value: `${result.coverage} sq ft per gallon per coat` },
    { label: "Total Sealer", value: `${result.gallons.toFixed(1)} gallons`, highlight: true },
    { label: "5-Gallon Pails", value: `${result.pails}` },
    { label: "Cost per Pail", value: `$${parseFloat(price).toFixed(0)}` },
    { label: "Estimated Cost", value: `$${result.cost.toLocaleString()}` },
  ];

  const summaryStats = [
    { label: "Sealer Needed", value: `${result.gallons.toFixed(1)} gal` },
    { label: "Pails to Buy", value: `${result.pails}` },
    { label: "Estimated Cost", value: `$${result.cost.toLocaleString()}` },
    { label: "Area", value: `${result.area.toLocaleString()} sq ft` },
    { label: "Coats", value: `${result.coats}` },
    { label: "Coverage", value: `${result.coverage} sq ft/gal` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Driveway Sealer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Driveway Sealer Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ds-len" className="block text-sm font-medium mb-1 text-foreground">Length (ft)</label>
                <input id="ds-len" type="number" min="1" step="1" value={length} onChange={(e) => setLength(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ds-wid" className="block text-sm font-medium mb-1 text-foreground">Width (ft)</label>
                <input id="ds-wid" type="number" min="1" step="1" value={width} onChange={(e) => setWidth(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ds-coats" className="block text-sm font-medium mb-1 text-foreground">Coats</label>
                <select id="ds-coats" value={coats} onChange={(e) => setCoats(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="1">1</option>
                  <option value="2">2 (recommended)</option>
                </select>
              </div>
              <div>
                <label htmlFor="ds-price" className="block text-sm font-medium mb-1 text-foreground">Price per 5-gal Pail ($)</label>
                <input id="ds-price" type="number" min="0" step="5" value={price} onChange={(e) => setPrice(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <PaintBucket className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter positive dimensions, at least 1 coat, and a non-negative price.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Sealer Needed</div>
              <div className="text-4xl font-extrabold text-primary">{result.gallons.toFixed(1)} gallons</div>
              <div className="text-sm text-muted-foreground mt-1">{result.pails} pail{result.pails === 1 ? "" : "s"} · ${result.cost.toLocaleString()} estimated</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Pails to Buy</div>
                <div className="text-lg font-bold text-primary">{result.pails}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Area</div>
                <div className="text-lg font-bold text-primary">{result.area.toLocaleString()} sq ft</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Cost</div>
                <div className="text-lg font-bold text-primary">${result.cost.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
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
              <h3 className="text-base font-bold mb-3">Sealer Used per Coat</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData.slice(0, result.coats)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {(result.coats === 2 ? result.chartData : result.chartData.slice(0, 1)).map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} gallons`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Each coat covers {result.area.toLocaleString()} sq ft ÷ {result.coverage} = {(result.area / result.coverage).toFixed(1)} gal</p>
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
            <h2 className="text-2xl font-bold mb-3">About the Driveway Sealer Calculator</h2>
            <p>Sealer consumption follows coverage math: gallons = area × coats ÷ coverage-per-gallon. At 100 sq ft per gallon per coat, a 40 × 20 ft driveway (800 sq ft) needs 16 gallons for two coats — 3.2 five-gallon pails, rounded up to 4.</p>
            <h3>Buying Advice</h3>
            <p>Sealer arrives in 5-gallon pails, so always round up to whole pails — running short mid-coat leaves a visible seam. Buy a touch more for driveways with cracks or heavy texture, which absorb more, and apply when temperatures stay above 55°F for 48 hours.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/driveway-sealer-calculator" />
          <PopularCalculators exclude="/calculator/driveway-sealer-calculator" />
        </div>
      </div>
    </>
  );
}
