"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Truck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface FreightResult {
  cost: number;
  units: number;
  weight: number;
  costPerUnit: number;
  costPerKg: number;
  costPerLb: number;
  chartData: { name: string; value: number }[];
}

function calcFreight(cost: number, units: number, weight: number): FreightResult {
  const costPerUnit = units > 0 ? cost / units : 0;
  const costPerKg = weight > 0 ? cost / weight : 0;
  const costPerLb = weight > 0 ? cost / (weight * 2.20462) : 0;
  const chartData = [
    { name: "Per Unit", value: Number(costPerUnit.toFixed(2)) },
    { name: "Per kg", value: Number(costPerKg.toFixed(2)) },
    { name: "Per lb", value: Number(costPerLb.toFixed(2)) },
  ];
  return { cost, units, weight, costPerUnit, costPerKg, costPerLb, chartData };
}

const DEFAULTS = { cost: "1200", units: "500", weight: "900" };

const faqs = [
  { question: "How is freight cost per unit calculated?", answer: "Divide the total freight bill by the number of units shipped: cost per unit = total freight ÷ units. If 500 units cost $1,200 to ship, each unit carries $2.40 of freight." },
  { question: "Should I allocate by weight or by unit?", answer: "Weight-based allocation (cost per kg/lb) is fairer when units vary in size; per-unit allocation is simpler for identical products. Many importers use volume or dimensional weight when bulky items displace more container space." },
  { question: "What drives freight cost per unit down?", answer: "Economies of scale: the same container fixed cost spread over more units lowers the per-unit share. Consolidation, negotiating carrier rates, and choosing slower transit (sea vs air) are the biggest levers." },
];

export default function FreightCostPerUnitCalculator() {
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [units, setUnits] = useState(DEFAULTS.units);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [result, setResult] = useState<FreightResult>(() => calcFreight(1200, 500, 900));

  const handleCalculate = () => {
    const c = parseFloat(cost);
    const u = parseFloat(units);
    const w = parseFloat(weight);
    if (isNaN(c) || isNaN(u) || isNaN(w) || u <= 0) return;
    setResult(calcFreight(c, u, w > 0 ? w : 0));
  };

  const reset = () => {
    setCost(DEFAULTS.cost); setUnits(DEFAULTS.units); setWeight(DEFAULTS.weight);
    setResult(calcFreight(1200, 500, 900));
  };

  const breakdown = [
    { label: "Total Freight Cost", value: `$${result.cost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, highlight: false },
    { label: "Units Shipped", value: `${result.units.toLocaleString()}`, highlight: false },
    { label: "Total Shipment Weight", value: result.weight > 0 ? `${result.weight.toLocaleString()} kg` : "—", highlight: false },
    { label: "Freight per Unit", value: `$${result.costPerUnit.toFixed(2)}`, highlight: true },
    { label: "Freight per kg", value: result.weight > 0 ? `$${result.costPerKg.toFixed(3)}` : "—", highlight: false },
    { label: "Freight per lb", value: result.weight > 0 ? `$${result.costPerLb.toFixed(3)}` : "—", highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Freight Cost Per Unit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Freight Cost Per Unit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Truck className="w-4 h-4" /> Freight Cost Allocation
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Total Freight Cost ($)</label>
                <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="input-calc" placeholder="1200" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Units Shipped</label>
                <input type="number" value={units} onChange={(e) => setUnits(e.target.value)} className="input-calc" placeholder="500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Total Shipment Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-calc" placeholder="900" />
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
                <Truck className="w-4 h-4 text-primary" /> FREIGHT PER UNIT
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">${result.costPerUnit.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">per unit</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {result.units > 0 ? `Spreading $${result.cost.toLocaleString()} across ${result.units.toLocaleString()} units.` : "Enter a unit count to allocate the freight."}
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
              <h3 className="text-base font-bold mb-3">Cost Allocation Comparison</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Avg Weight per Unit", value: result.units > 0 ? `${(result.weight / result.units).toFixed(2)} kg` : "—" },
                  { label: "Cost Share per Unit", value: `${((result.costPerUnit / (result.cost || 1)) * 100).toFixed(2)}%` },
                  { label: "Full-Container Saving", value: "Grows with unit count" },
                  { label: "Recommendation", value: result.costPerUnit > 10 ? "Consolidate shipments" : "Healthy allocation" },
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
            <h2 className="text-2xl font-bold mb-3">About the Freight Cost Per Unit Calculator</h2>
            <p>Knowing your landed freight cost per unit is essential for pricing: if a product's freight share is $2.40 and your margin is thin, a rate increase can flip the unit unprofitable. The basic allocation divides the total freight bill by units shipped, while weight-based measures (per kg or per lb) help when products differ in size or when carriers charge on dimensional weight.</p>
            <h3>Getting the number down</h3>
            <p>The biggest lever is volume — fixed container and handling costs spread across more units. Consolidating LCL (less-than-container-load) shipments into FCL, negotiating annual carrier contracts, choosing sea freight over air for non-urgent goods, and reducing packaging dimensions all cut the per-unit share. Track this metric monthly; a rising per-unit freight cost is often the first warning sign of a pricing problem.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/freight-cost-per-unit-calculator" />
          <PopularCalculators exclude="/calculator/freight-cost-per-unit-calculator" />
        </div>
      </div>
    </>
  );
}
