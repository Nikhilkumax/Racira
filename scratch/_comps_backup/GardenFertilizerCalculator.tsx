"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Sprout } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Recommended N (lb per 1000 sq ft) by use
const TARGETS = [
  { id: "lawn", label: "Lawn (1.0 lb N / 1000 ft²)", n: 1.0 },
  { id: "veggies", label: "Vegetable Garden (0.3 lb N / 1000 ft²)", n: 0.3 },
  { id: "flowers", label: "Flower Beds (0.5 lb N / 1000 ft²)", n: 0.5 },
  { id: "trees", label: "Trees & Shrubs (0.2 lb N / 1000 ft²)", n: 0.2 },
] as const;

interface FertilizerResult {
  area: number;
  targetN: number;
  npk: string;
  nPct: number;
  nNeededLb: number;
  productLb: number;
  productKg: number;
  bags25: number;
  chartData: { name: string; value: number }[];
}

function calcFertilizer(areaSqFt: number, targetId: string, npk: string): FertilizerResult {
  const target = TARGETS.find((t) => t.id === targetId) ?? TARGETS[0];
  const parts = npk.split("-").map((p) => parseFloat(p.trim()));
  const nPct = parts[0] || 0;
  const nNeededLb = target.n * (areaSqFt / 1000);
  const productLb = nPct > 0 ? nNeededLb / (nPct / 100) : 0;
  const productKg = productLb * 0.453592;
  const bags25 = Math.ceil(productLb / 25);
  const chartData = [
    { name: "N Needed", value: Number(nNeededLb.toFixed(2)) },
    { name: "Product (lb)", value: Number(productLb.toFixed(1)) },
    { name: "Bags (25 lb)", value: bags25 },
  ];
  return { area: areaSqFt, targetN: target.n, npk, nPct, nNeededLb, productLb, productKg, bags25, chartData };
}

const DEFAULTS = { area: "5000", target: "lawn", npk: "20-10-10" };

const faqs = [
  { question: "What do the N-P-K numbers mean?", answer: "N-P-K is the percentage of nitrogen, phosphorus, and potassium by weight. A 20-10-10 bag is 20% nitrogen, 10% phosphorus, 10% potassium. The higher the N, the less product you need to deliver a given nitrogen dose." },
  { question: "How much fertilizer does my lawn need?", answer: "The standard recommendation is about 1 lb of nitrogen per 1,000 sq ft per application. A 5,000 sq ft lawn needs 5 lb of N, so with a 20% N product that is 25 lb of fertilizer." },
  { question: "How do I convert square feet to my garden size?", answer: "Measure length × width for rectangles, or use 0.5 × base × height for triangles, and πr² for circles. For beds, length × width works fine — most gardens are close enough to rectangular." },
];

export default function GardenFertilizerCalculator() {
  const [area, setArea] = useState(DEFAULTS.area);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [npk, setNpk] = useState(DEFAULTS.npk);
  const [result, setResult] = useState<FertilizerResult>(() => calcFertilizer(5000, "lawn", "20-10-10"));

  const handleCalculate = () => {
    const a = parseFloat(area);
    if (isNaN(a) || a <= 0) return;
    setResult(calcFertilizer(a, target, npk));
  };

  const reset = () => {
    setArea(DEFAULTS.area); setTarget(DEFAULTS.target); setNpk(DEFAULTS.npk);
    setResult(calcFertilizer(5000, "lawn", "20-10-10"));
  };

  const breakdown = [
    { label: "Garden Area", value: `${result.area.toLocaleString()} sq ft`, highlight: false },
    { label: "Nitrogen Target", value: `${result.targetN} lb N / 1000 sq ft`, highlight: false },
    { label: "Product N Content", value: `${result.nPct}% (${result.npk})`, highlight: false },
    { label: "Nitrogen Needed", value: `${result.nNeededLb.toFixed(2)} lb`, highlight: false },
    { label: "Fertilizer Product Needed", value: `${result.productLb.toFixed(1)} lb (${result.productKg.toFixed(2)} kg)`, highlight: true },
    { label: "Bags to Buy (25 lb)", value: `${result.bags25}`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Garden Fertilizer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Garden Fertilizer Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Sprout className="w-4 h-4" /> Fertilizer Amount Estimator
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Garden Area (sq ft)</label>
                <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="input-calc" placeholder="5000" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">What Are You Growing?</label>
                <select value={target} onChange={(e) => setTarget(e.target.value)} className="input-calc">
                  {TARGETS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Product N-P-K Ratio</label>
                <input type="text" value={npk} onChange={(e) => setNpk(e.target.value)} className="input-calc" placeholder="20-10-10" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Sprout className="w-4 h-4 text-primary" /> PRODUCT NEEDED
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.productLb.toFixed(1)} lb</span>
                <span className="text-sm text-muted-foreground">({result.productKg.toFixed(2)} kg)</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                At {result.nPct}% nitrogen, delivering {result.nNeededLb.toFixed(2)} lb of N across {result.area.toLocaleString()} sq ft.
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
              <h3 className="text-base font-bold mb-3">Application Overview</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString("en-US", { maximumFractionDigits: 1 }), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Spreader Rate", value: `${(result.productLb / (result.area / 1000)).toFixed(1)} lb / 1000 sq ft` },
                  { label: "Application Frequency", value: "3–4× per growing season" },
                  { label: "Cost Estimate (20-10-10)", value: result.bags25 > 0 ? `${result.bags25} × $25 ≈ $${(result.bags25 * 25).toFixed(0)}` : "—" },
                  { label: "Tip", value: "Water in after applying" },
                ].map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Garden Fertilizer Calculator</h2>
            <p>Fertilizer labels list N-P-K percentages — the fraction of the bag that is nitrogen, phosphorus, and potassium by weight. The golden rule of fertilizing is to dose by the nitrogen requirement, not by bag weight. A lawn needs about 1 lb of actual nitrogen per 1,000 sq ft; a 20-10-10 product delivers 0.20 lb of N per pound of product, so 5,000 sq ft needs 25 lb of product.</p>
            <h3>Reading the numbers</h3>
            <p>Higher nitrogen products (like 30-0-0) deliver the same N with less material, while balanced 10-10-10 suits vegetable gardens. Always verify the first number on the bag and adjust: product needed = (target N per 1,000 ft² × area/1,000) ÷ (N% / 100). This calculator applies exactly that formula with recommended targets for lawns, vegetables, flowers, and trees.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/garden-fertilizer-calculator" />
          <PopularCalculators exclude="/calculator/garden-fertilizer-calculator" />
        </div>
      </div>
    </>
  );
}
