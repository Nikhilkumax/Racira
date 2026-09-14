"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Sprout } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface FertilizerResult {
  area: number;
  nPct: number;
  pPct: number;
  kPct: number;
  targetN: number;
  fertilizerLb: number;
  nDelivered: number;
  pDelivered: number;
  kDelivered: number;
  bagLb: number;
  bags: number;
  chartData: { name: string; value: number }[];
}

function calcFertilizer(area: number, nPct: number, pPct: number, kPct: number, targetN: number, bagLb: number): FertilizerResult {
  const fertilizerLb = nPct > 0 ? (targetN * (area / 1000)) / (nPct / 100) : 0;
  const nDelivered = fertilizerLb * (nPct / 100);
  const pDelivered = fertilizerLb * (pPct / 100);
  const kDelivered = fertilizerLb * (kPct / 100);
  const bags = bagLb > 0 ? Math.ceil(fertilizerLb / bagLb) : 0;
  const chartData = [
    { name: `Nitrogen (${nPct}%)`, value: Number(nDelivered.toFixed(2)) },
    { name: `Phosphorus (${pPct}%)`, value: Number(pDelivered.toFixed(2)) },
    { name: `Potassium (${kPct}%)`, value: Number(kDelivered.toFixed(2)) },
  ];
  return { area, nPct, pPct, kPct, targetN, fertilizerLb, nDelivered, pDelivered, kDelivered, bagLb, bags, chartData };
}

const DEFAULTS = { area: "5000", n: "20", p: "5", k: "10", target: "1", bag: "40" };

const faqs = [
  { question: "What do N-P-K numbers mean?", answer: "The three numbers are the percentages of nitrogen, phosphorus (as P₂O₅), and potassium (as K₂O) by weight. A 20-5-10 fertilizer is 20% nitrogen, 5% phosphorus, 10% potassium." },
  { question: "How much fertilizer do I need?", answer: "Pounds of fertilizer = (N rate per 1,000 sq ft × area ÷ 1,000) ÷ (N% ÷ 100). To apply 1 lb of N per 1,000 sq ft on 5,000 sq ft with 20% N: 5 lb ÷ 0.20 = 25 lb of product." },
  { question: "How often should I fertilize?", answer: "Cool-season lawns typically need 2–4 lb of nitrogen per 1,000 sq ft per year, split into 3–4 applications. Never exceed 1 lb of N per application — more stresses the turf and feeds runoff." },
];

export default function FertilizerCalculator() {
  const [area, setArea] = useState(DEFAULTS.area);
  const [n, setN] = useState(DEFAULTS.n);
  const [p, setP] = useState(DEFAULTS.p);
  const [k, setK] = useState(DEFAULTS.k);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [bag, setBag] = useState(DEFAULTS.bag);
  const [result, setResult] = useState<FertilizerResult>(() => calcFertilizer(5000, 20, 5, 10, 1, 40));

  useEffect(() => {
    const a = parseFloat(area);
    const nv = parseFloat(n);
    const pv = parseFloat(p);
    const kv = parseFloat(k);
    const t = parseFloat(target);
    const b = parseFloat(bag);
    if (!isNaN(a) && !isNaN(nv) && !isNaN(pv) && !isNaN(kv) && !isNaN(t) && !isNaN(b) && a > 0 && nv > 0 && pv >= 0 && kv >= 0 && t >= 0 && b > 0) {
      setResult(calcFertilizer(a, nv, pv, kv, t, b));
    }
  }, []);

  const handleCalculate = () => {
    const a = parseFloat(area);
    const nv = parseFloat(n);
    const pv = parseFloat(p);
    const kv = parseFloat(k);
    const t = parseFloat(target);
    const b = parseFloat(bag);
    if (!isNaN(a) && !isNaN(nv) && !isNaN(pv) && !isNaN(kv) && !isNaN(t) && !isNaN(b) && a > 0 && nv > 0 && pv >= 0 && kv >= 0 && t >= 0 && b > 0) setResult(calcFertilizer(a, nv, pv, kv, t, b));
  };
  const reset = () => { setArea(DEFAULTS.area); setN(DEFAULTS.n); setP(DEFAULTS.p); setK(DEFAULTS.k); setTarget(DEFAULTS.target); setBag(DEFAULTS.bag); setResult(calcFertilizer(parseFloat(DEFAULTS.area), parseFloat(DEFAULTS.n), parseFloat(DEFAULTS.p), parseFloat(DEFAULTS.k), parseFloat(DEFAULTS.target), parseFloat(DEFAULTS.bag))); };
  const invalid = [area, n, p, k, target, bag].some(v => isNaN(parseFloat(v))) || parseFloat(area) <= 0 || parseFloat(n) <= 0 || parseFloat(p) < 0 || parseFloat(k) < 0 || parseFloat(target) < 0 || parseFloat(bag) <= 0;

  const breakdown = [
    { label: "Lawn Area", value: `${result.area.toLocaleString()} sq ft` },
    { label: "N-P-K Analysis", value: `${result.nPct}-${result.pPct}-${result.kPct}` },
    { label: "Nitrogen Target", value: `${result.targetN.toFixed(2)} lb N / 1,000 sq ft` },
    { label: "Fertilizer to Apply", value: `${result.fertilizerLb.toFixed(1)} lb`, highlight: true },
    { label: "Nitrogen Delivered", value: `${result.nDelivered.toFixed(2)} lb` },
    { label: "Phosphorus Delivered", value: `${result.pDelivered.toFixed(2)} lb` },
    { label: "Potassium Delivered", value: `${result.kDelivered.toFixed(2)} lb` },
    { label: "40 lb Bags (rounded up)", value: `${result.bags}` },
  ];

  const summaryStats = [
    { label: "Fertilizer Needed", value: `${result.fertilizerLb.toFixed(1)} lb` },
    { label: "Bags to Buy", value: `${result.bags}` },
    { label: "N Delivered", value: `${result.nDelivered.toFixed(2)} lb` },
    { label: "P Delivered", value: `${result.pDelivered.toFixed(2)} lb` },
    { label: "K Delivered", value: `${result.kDelivered.toFixed(2)} lb` },
    { label: "Area", value: `${result.area.toLocaleString()} sq ft` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Fertilizer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fertilizer Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="fz-area" className="block text-sm font-medium mb-1 text-foreground">Lawn Area (sq ft)</label>
              <input id="fz-area" type="number" min="1" step="100" value={area} onChange={(e) => setArea(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="fz-n" className="block text-sm font-medium mb-1 text-foreground">N %</label>
                <input id="fz-n" type="number" min="0.1" step="0.5" value={n} onChange={(e) => setN(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="fz-p" className="block text-sm font-medium mb-1 text-foreground">P %</label>
                <input id="fz-p" type="number" min="0" step="0.5" value={p} onChange={(e) => setP(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="fz-k" className="block text-sm font-medium mb-1 text-foreground">K %</label>
                <input id="fz-k" type="number" min="0" step="0.5" value={k} onChange={(e) => setK(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fz-target" className="block text-sm font-medium mb-1 text-foreground">N Target (lb/1,000 sq ft)</label>
                <input id="fz-target" type="number" min="0" step="0.25" value={target} onChange={(e) => setTarget(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="fz-bag" className="block text-sm font-medium mb-1 text-foreground">Bag Size (lb)</label>
                <input id="fz-bag" type="number" min="1" step="10" value={bag} onChange={(e) => setBag(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Sprout className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a positive area, N%, and bag size with non-negative P/K/target.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Fertilizer to Apply</div>
              <div className="text-4xl font-extrabold text-primary">{result.fertilizerLb.toFixed(1)} lb</div>
              <div className="text-sm text-muted-foreground mt-1">{result.bags} bag{result.bags === 1 ? "" : "s"} of {result.bagLb} lb · {result.nPct}-{result.pPct}-{result.kPct}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">N Delivered</div>
                <div className="text-lg font-bold text-primary">{result.nDelivered.toFixed(2)} lb</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">P Delivered</div>
                <div className="text-lg font-bold text-primary">{result.pDelivered.toFixed(2)} lb</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">K Delivered</div>
                <div className="text-lg font-bold text-primary">{result.kDelivered.toFixed(2)} lb</div>
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
              <h3 className="text-base font-bold mb-3">Nutrients Delivered</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)} lb`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the Fertilizer Calculator</h2>
            <p>Fertilizer math is nitrogen math: the product's N% tells you how much product delivers the target. For 1 lb of N per 1,000 sq ft over 5,000 sq ft with a 20-5-10 blend: 5 lb of N needed ÷ 0.20 = 25 lb of fertilizer, which also delivers 1.25 lb of P and 2.5 lb of K.</p>
            <h3>Reading the N-P-K</h3>
            <p>The analysis is percent by weight, so a 40 lb bag of 20-5-10 contains 8 lb of N, 2 lb of P, and 4 lb of K. Matching the analysis to the season — higher N in spring, higher K in fall for cold tolerance — is the difference between feeding the lawn and just buying fertilizer.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fertilizer-calculator" />
          <PopularCalculators exclude="/calculator/fertilizer-calculator" />
        </div>
      </div>
    </>
  );
}
