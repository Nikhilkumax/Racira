"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Leaf } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const APPLICATIONS = [
  { id: "new", label: "New Lawn (5 lb / 1000 ft²)", rate: 5 },
  { id: "overseed", label: "Overseeding (3 lb / 1000 ft²)", rate: 3 },
  { id: "repair", label: "Patch Repair (1.5 lb / 1000 ft²)", rate: 1.5 },
] as const;

interface SeedResult {
  area: number;
  rate: number;
  lbNeeded: number;
  kgNeeded: number;
  bags: number;
  cost: number;
  chartData: { name: string; value: number }[];
}

function calcSeed(area: number, appId: string, bagSize: number, price: number): SeedResult {
  const app = APPLICATIONS.find((a) => a.id === appId) ?? APPLICATIONS[0];
  const lbNeeded = app.rate * (area / 1000);
  const kgNeeded = lbNeeded * 0.453592;
  const bags = bagSize > 0 ? Math.ceil(lbNeeded / bagSize) : 0;
  const cost = bags * price;
  const chartData = [
    { name: "New Lawn", value: Number((5 * area / 1000).toFixed(1)) },
    { name: "Overseed", value: Number((3 * area / 1000).toFixed(1)) },
    { name: "Repair", value: Number((1.5 * area / 1000).toFixed(1)) },
  ];
  return { area, rate: app.rate, lbNeeded, kgNeeded, bags, cost, chartData };
}

const DEFAULTS = { area: "5000", app: "new", bag: "5", price: "18" };

const faqs = [
  { question: "How much grass seed do I need?", answer: "New lawns need about 5 lb of seed per 1,000 sq ft, overseeding about 3 lb, and patch repair about 1.5 lb. A 5,000 sq ft new lawn needs 25 lb — roughly five 5 lb bags." },
  { question: "What affects the seeding rate?", answer: "Seed size and germination: fine fescue and ryegrass seed tiny and dense, so you spread fewer pounds; Kentucky bluegrass needs more. Bare soil with good prep can use the low end, while heavy clay and poor grading warrant the high end." },
  { question: "When should I overseed instead of reseed?", answer: "Overseeding (spreading seed over existing turf) thickens a thin lawn and introduces improved varieties — best in fall for cool-season grass. Reseeding from bare soil is for dead lawns, construction damage, or large bare patches." },
];

export default function GrassSeedCalculator() {
  const [area, setArea] = useState(DEFAULTS.area);
  const [app, setApp] = useState(DEFAULTS.app);
  const [bag, setBag] = useState(DEFAULTS.bag);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [result, setResult] = useState<SeedResult>(() => calcSeed(5000, "new", 5, 18));

  const handleCalculate = () => {
    const a = parseFloat(area);
    const b = parseFloat(bag);
    const p = parseFloat(price);
    if (isNaN(a) || isNaN(b) || isNaN(p) || a <= 0) return;
    setResult(calcSeed(a, app, b, p));
  };

  const reset = () => {
    setArea(DEFAULTS.area); setApp(DEFAULTS.app); setBag(DEFAULTS.bag); setPrice(DEFAULTS.price);
    setResult(calcSeed(5000, "new", 5, 18));
  };

  const breakdown = [
    { label: "Lawn Area", value: `${result.area.toLocaleString()} sq ft`, highlight: false },
    { label: "Application Type", value: `${result.rate} lb / 1000 sq ft`, highlight: false },
    { label: "Seed Needed", value: `${result.lbNeeded.toFixed(1)} lb (${result.kgNeeded.toFixed(2)} kg)`, highlight: true },
    { label: "Bags to Buy", value: `${result.bags} bag${result.bags === 1 ? "" : "s"}`, highlight: false },
    { label: "Estimated Cost", value: `$${result.cost.toFixed(2)}`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Grass Seed Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Grass Seed Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Leaf className="w-4 h-4" /> Seed Quantity Estimator
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Lawn Area (sq ft)</label>
                <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="input-calc" placeholder="5000" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Application</label>
                <select value={app} onChange={(e) => setApp(e.target.value)} className="input-calc">
                  {APPLICATIONS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Bag Size (lb)</label>
                  <input type="number" value={bag} onChange={(e) => setBag(e.target.value)} className="input-calc" placeholder="5" min={1} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Price per Bag ($)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input-calc" placeholder="18" min={0} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Leaf className="w-4 h-4 text-primary" /> SEED NEEDED
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.lbNeeded.toFixed(1)} lb</span>
                <span className="text-sm text-muted-foreground">({result.kgNeeded.toFixed(2)} kg)</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                At {result.rate} lb per 1,000 sq ft — about {result.bags} bag{result.bags === 1 ? "" : "s"} for roughly ${result.cost.toFixed(0)}.
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
              <h3 className="text-base font-bold mb-3">Seed by Application Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} lb`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Seed per sq ft", value: `${(result.rate / 1000 * 16).toFixed(2)} oz` },
                  { label: "Coverage per Bag", value: `${(parseFloat(bag) / result.rate * 1000).toFixed(0)} sq ft` },
                  { label: "Best Season", value: "Fall (cool-season) / Spring (warm-season)" },
                  { label: "Germination", value: "7–21 days with consistent moisture" },
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
            <h2 className="text-2xl font-bold mb-3">About the Grass Seed Calculator</h2>
            <p>Seeding rates are quoted per 1,000 sq ft: roughly 5 lb for a new lawn, 3 lb for overseeding, and 1.5 lb for patching. Multiply the rate by your area in thousands of square feet to get the seed weight — a 5,000 sq ft new lawn needs 25 lb. Buying full bags (typically 5–25 lb) means rounding up to the next bag, which the calculator handles automatically.</p>
            <h3>Timing and prep matter more than the rate</h3>
            <p>Seed is only as good as its bed: rake bare soil, keep it consistently moist for the first two weeks, and time the planting for the right season — fall for cool-season grasses (fescue, bluegrass, ryegrass), late spring for warm-season (bermuda, zoysia). Overseeding in fall lets new grass establish before summer stress, which is why most lawn experts call fall the single best time to seed.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/grass-seed-calculator" />
          <PopularCalculators exclude="/calculator/grass-seed-calculator" />
        </div>
      </div>
    </>
  );
}
