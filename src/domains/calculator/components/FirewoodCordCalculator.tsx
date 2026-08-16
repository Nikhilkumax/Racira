"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CordResult {
  length: number;
  height: number;
  depth: number;
  volume: number;
  cords: number;
  faceCords: number;
  price: number;
  cost: number;
  chartData: { name: string; value: number }[];
}

function calcCord(length: number, height: number, depth: number, price: number): CordResult {
  const volume = length * height * depth;
  const cords = volume / 128;
  const faceCords = volume / 42.67;
  const cost = cords * price;
  const chartData = [
    { name: "Your Stack", value: Number(volume.toFixed(1)) },
    { name: "Full Cord (128)", value: 128 },
  ];
  return { length, height, depth, volume, cords, faceCords, price, cost, chartData };
}

const DEFAULTS = { length: "8", height: "4", depth: "1.33", price: "250" };

const faqs = [
  { question: "What is a cord of firewood?", answer: "A full cord is 128 cubic feet of tightly stacked wood: typically 8 ft long × 4 ft high × 4 ft deep. It is the legal unit for firewood sales in most states." },
  { question: "What is a face cord?", answer: "A face cord is 8 ft × 4 ft × the depth of a single log (usually 16 in). At 16 in it is exactly one-third of a full cord (~42.7 ft³) — the most common way firewood is actually sold, so compare by cubic volume, not by 'cord' label." },
  { question: "How should the stack be measured?", answer: "Measure the tightly stacked wood, not the pile. Logs should be parallel with minimal gaps. Depth is the log length: 16 in = 1.33 ft, 18 in = 1.5 ft, 24 in = 2 ft." },
];

export default function FirewoodCordCalculator() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [result, setResult] = useState<CordResult>(() => calcCord(8, 4, 1.33, 250));

  useEffect(() => {
    const l = parseFloat(length);
    const h = parseFloat(height);
    const d = parseFloat(depth);
    const p = parseFloat(price);
    if (!isNaN(l) && !isNaN(h) && !isNaN(d) && !isNaN(p) && l > 0 && h > 0 && d > 0 && p >= 0) setResult(calcCord(l, h, d, p));
  }, [length, height, depth, price]);

  const reset = () => { setLength(DEFAULTS.length); setHeight(DEFAULTS.height); setDepth(DEFAULTS.depth); setPrice(DEFAULTS.price); };
  const invalid = isNaN(parseFloat(length)) || isNaN(parseFloat(height)) || isNaN(parseFloat(depth)) || isNaN(parseFloat(price)) || parseFloat(length) <= 0 || parseFloat(height) <= 0 || parseFloat(depth) <= 0 || parseFloat(price) < 0;

  const breakdown = [
    { label: "Stack Length", value: `${result.length} ft` },
    { label: "Stack Height", value: `${result.height} ft` },
    { label: "Log Length (depth)", value: `${result.depth.toFixed(2)} ft (${(result.depth * 12).toFixed(0)} in)` },
    { label: "Stack Volume", value: `${result.volume.toFixed(1)} ft³` },
    { label: "Full Cords", value: `${result.cords.toFixed(3)}`, highlight: true },
    { label: "Face Cords (16 in)", value: `${result.faceCords.toFixed(2)}` },
    { label: "Price per Cord", value: `$${result.price.toFixed(0)}` },
    { label: "Estimated Cost", value: `$${result.cost.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Volume", value: `${result.volume.toFixed(1)} ft³` },
    { label: "Full Cords", value: `${result.cords.toFixed(3)}` },
    { label: "Face Cords", value: `${result.faceCords.toFixed(2)}` },
    { label: "Cost", value: `$${result.cost.toFixed(2)}` },
    { label: "Fraction of Cord", value: `${(result.cords * 100).toFixed(1)}%` },
    { label: "Log Length", value: `${(result.depth * 12).toFixed(0)} in` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Firewood Cord Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Firewood Cord Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fw-len" className="block text-sm font-medium mb-1 text-foreground">Stack Length (ft)</label>
                <input id="fw-len" type="number" min="0.1" step="0.5" value={length} onChange={(e) => setLength(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="fw-height" className="block text-sm font-medium mb-1 text-foreground">Stack Height (ft)</label>
                <input id="fw-height" type="number" min="0.1" step="0.5" value={height} onChange={(e) => setHeight(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="fw-depth" className="block text-sm font-medium mb-1 text-foreground">Log Length (ft)</label>
              <select id="fw-depth" value={depth} onChange={(e) => setDepth(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="1">12 in (1.00 ft)</option>
                <option value="1.33">16 in (1.33 ft)</option>
                <option value="1.5">18 in (1.50 ft)</option>
                <option value="2">24 in (2.00 ft)</option>
              </select>
            </div>
            <div>
              <label htmlFor="fw-price" className="block text-sm font-medium mb-1 text-foreground">Price per Full Cord ($)</label>
              <input id="fw-price" type="number" min="0" step="25" value={price} onChange={(e) => setPrice(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Flame className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter positive dimensions and a non-negative price.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Firewood Volume</div>
              <div className="text-4xl font-extrabold text-primary">{result.volume.toFixed(1)} ft³</div>
              <div className="text-sm text-muted-foreground mt-1">{result.cords.toFixed(3)} full cords · {result.faceCords.toFixed(2)} face cords</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Full Cords</div>
                <div className="text-lg font-bold text-primary">{result.cords.toFixed(3)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Face Cords</div>
                <div className="text-lg font-bold text-primary">{result.faceCords.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Est. Cost</div>
                <div className="text-lg font-bold text-primary">${result.cost.toFixed(2)}</div>
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
              <h3 className="text-base font-bold mb-3">Your Stack vs a Full Cord</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} ft³`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
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
            <h2 className="text-2xl font-bold mb-3">About the Firewood Cord Calculator</h2>
            <p>A full cord is 128 cubic feet (8 × 4 × 4 ft). Volume = length × height × depth, then divide by 128: an 8 × 4 ft stack of 16-inch logs holds 8 × 4 × 1.33 = 42.7 ft³ — exactly one-third of a cord, which is what most dealers sell as a 'face cord'.</p>
            <h3>Buying Wood by the Numbers</h3>
            <p>Always convert to full cords before comparing prices: a 'cord' at $250 with 24-inch logs and a 'face cord' at $100 with 16-inch logs are different volumes at different prices. Stack dimensions, not labels, determine what you are actually buying.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/firewood-cord-calculator" />
          <PopularCalculators exclude="/calculator/firewood-cord-calculator" />
        </div>
      </div>
    </>
  );
}
