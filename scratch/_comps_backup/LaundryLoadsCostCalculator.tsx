"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, Shirt, DollarSign, Calendar, Droplets } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface LaundryResult {
  loadsPerMonth: number;
  waterPerLoad: number;
  energyPerLoad: number;
  monthlyWaterCost: number;
  monthlyEnergyCost: number;
  monthlyDetergentCost: number;
  monthlyTotalCost: number;
  annualTotalCost: number;
  costPerLoad: number;
  costPerKg: number;
  chartData: { name: string; cost: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  loadsPerMonth: "12",
  waterPerLoad: "50",
  energyPerLoad: "2.5",
  waterRate: "0.005",
  energyRate: "0.15",
  detergentCost: "0.75",
  avgLoadKg: "8",
};

const calculate = (v: typeof DEFAULTS): LaundryResult => {
  const loads = parseFloat(v.loadsPerMonth) || 0;
  const waterPerLoad = parseFloat(v.waterPerLoad) || 0;
  const energyPerLoad = parseFloat(v.energyPerLoad) || 0;
  const waterRate = parseFloat(v.waterRate) || 0;
  const energyRate = parseFloat(v.energyRate) || 0;
  const detergentCost = parseFloat(v.detergentCost) || 0;
  const avgLoadKg = parseFloat(v.avgLoadKg) || 0;

  const monthlyWaterCost = loads * waterPerLoad * waterRate;
  const monthlyEnergyCost = loads * energyPerLoad * energyRate;
  const monthlyDetergentCost = loads * detergentCost;
  const monthlyTotalCost = monthlyWaterCost + monthlyEnergyCost + monthlyDetergentCost;
  const annualTotalCost = monthlyTotalCost * 12;
  const costPerLoad = loads > 0 ? monthlyTotalCost / loads : 0;
  const costPerKg = avgLoadKg > 0 ? costPerLoad / avgLoadKg : 0;

  const chartData = [
    { name: "Water", cost: parseFloat(monthlyWaterCost.toFixed(2)), fill: "#3b82f6" },
    { name: "Energy", cost: parseFloat(monthlyEnergyCost.toFixed(2)), fill: "#f59e0b" },
    { name: "Detergent", cost: parseFloat(monthlyDetergentCost.toFixed(2)), fill: "#10b981" },
    { name: "Total/Month", cost: parseFloat(monthlyTotalCost.toFixed(2)), fill: "hsl(var(--primary))" },
  ];

  const breakdown = [
    { label: "Loads Per Month", value: `${loads.toFixed(0)}` },
    { label: "Water Per Load", value: `${waterPerLoad.toFixed(0)} liters` },
    { label: "Energy Per Load", value: `${energyPerLoad.toFixed(1)} kWh` },
    { label: "Water Rate", value: `$${waterRate.toFixed(3)}/liter` },
    { label: "Energy Rate", value: `$${energyRate.toFixed(3)}/kWh` },
    { label: "Detergent Per Load", value: `$${detergentCost.toFixed(2)}` },
    { label: "Avg Load Size", value: `${avgLoadKg.toFixed(1)} kg` },
    { label: "Monthly Water Cost", value: `$${monthlyWaterCost.toFixed(2)}` },
    { label: "Monthly Energy Cost", value: `$${monthlyEnergyCost.toFixed(2)}` },
    { label: "Monthly Detergent Cost", value: `$${monthlyDetergentCost.toFixed(2)}` },
    { label: "Monthly Total", value: `$${monthlyTotalCost.toFixed(2)}` },
    { label: "Annual Total", value: `$${annualTotalCost.toFixed(2)}` },
    { label: "Cost Per Load", value: `$${costPerLoad.toFixed(2)}` },
    { label: "Cost Per Kg", value: `$${costPerKg.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Monthly Cost", value: `$${monthlyTotalCost.toFixed(2)}` },
    { label: "Annual Cost", value: `$${annualTotalCost.toFixed(2)}` },
    { label: "Cost Per Load", value: `$${costPerLoad.toFixed(2)}` },
    { label: "Cost Per Kg", value: `$${costPerKg.toFixed(2)}` },
    { label: "Water Usage", value: `${(loads * waterPerLoad).toFixed(0)} L/mo` },
    { label: "Energy Usage", value: `${(loads * energyPerLoad).toFixed(1)} kWh/mo` },
  ];

  return {
    loadsPerMonth: loads,
    waterPerLoad,
    energyPerLoad,
    monthlyWaterCost,
    monthlyEnergyCost,
    monthlyDetergentCost,
    monthlyTotalCost,
    annualTotalCost,
    costPerLoad,
    costPerKg,
    chartData,
    breakdown,
    summaryStats,
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function LaundryLoadsCostCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<LaundryResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(vals));
  };

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const updateVal = (key: keyof typeof DEFAULTS, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "How much does a laundry load cost?", answer: "A typical laundry load costs $0.50-$1.50 depending on water rates, energy costs, and detergent. The largest cost component is usually energy for heating water." },
    { question: "How can I reduce laundry costs?", answer: "Wash in cold water (saves energy), run full loads (maximizes efficiency), air-dry when possible (saves dryer energy), and use the right amount of detergent (over-dosing wastes money)." },
    { question: "What is the average number of laundry loads per month?", answer: "The average household does 8-12 loads of laundry per month. Larger families may do 15-20 loads, while single-person households may do 4-6." },
    { question: "How much water does a washing machine use?", answer: "Modern efficient washers use 15-30 liters per load. Older top-loading machines can use 40-60 liters per load. Front-loading machines are generally more water-efficient." },
    { question: "Is it cheaper to wash at home or use a laundromat?", answer: "Home washing is typically cheaper per load ($0.50-$1.50) compared to laundromats ($2-$5 per load). However, laundromats save on equipment costs and maintenance." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Laundry Loads Per Month Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Laundry Loads Per Month Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5" /> Usage
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Loads Per Month</label>
                  <input type="number" value={vals.loadsPerMonth} onChange={(e) => updateVal("loadsPerMonth", e.target.value)} className="input-calc" step="1" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Water Per Load (liters)</label>
                  <input type="number" value={vals.waterPerLoad} onChange={(e) => updateVal("waterPerLoad", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Energy Per Load (kWh)</label>
                  <input type="number" value={vals.energyPerLoad} onChange={(e) => updateVal("energyPerLoad", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Avg Load Size (kg)</label>
                  <input type="number" value={vals.avgLoadKg} onChange={(e) => updateVal("avgLoadKg", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Costs
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Water Rate ($/liter)</label>
                  <input type="number" value={vals.waterRate} onChange={(e) => updateVal("waterRate", e.target.value)} className="input-calc" step="0.001" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Energy Rate ($/kWh)</label>
                  <input type="number" value={vals.energyRate} onChange={(e) => updateVal("energyRate", e.target.value)} className="input-calc" step="0.001" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Detergent Per Load ($)</label>
                  <input type="number" value={vals.detergentCost} onChange={(e) => updateVal("detergentCost", e.target.value)} className="input-calc" step="0.01" min="0" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Monthly Cost
                </div>
                <div className="text-4xl font-bold text-primary mb-1">${result.monthlyTotalCost.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">
                  ${result.costPerLoad.toFixed(2)} per load · ${result.costPerKg.toFixed(2)} per kg
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Monthly</div>
                  <div className="text-lg font-bold text-foreground">${result.monthlyTotalCost.toFixed(2)}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Annual</div>
                  <div className="text-lg font-bold text-foreground">${result.annualTotalCost.toFixed(2)}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Per Load</div>
                  <div className="text-lg font-bold text-foreground">${result.costPerLoad.toFixed(2)}</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Component</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Monthly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Cost Breakdown</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={result.chartData[i].fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Laundry Costs: Understanding Your Monthly Expenses</h2>
            <p>Laundry is a recurring household expense that many people overlook when budgeting. Between water, energy, and detergent costs, each load adds up over time. This calculator helps you understand exactly how much your laundry habit costs per month and per year, and where you can save money.</p>

            <h3>1. Water Costs</h3>
            <p>Modern washing machines use 15-30 liters of water per load for efficient front-loaders, while older top-loading machines can use 40-60 liters. At typical water rates of $0.003-$0.01 per liter, water costs per load range from $0.05 to $0.60. While water seems cheap, it adds up over hundreds of loads per year.</p>

            <h3>2. Energy Costs</h3>
            <p>Energy is typically the largest cost component in laundry. Heating water accounts for about 90% of the energy used by a washing machine. A typical warm wash uses 2-3 kWh of electricity. At $0.15/kWh, that's $0.30-$0.45 per load just for energy. Dryers add another $0.50-$1.00 per load depending on the load size and dryer efficiency.</p>

            <h3>3. Detergent and Supplies</h3>
            <p>Detergent costs vary widely. A standard load of liquid detergent costs about $0.25-$0.75 depending on the brand and amount used. Using more detergent than recommended wastes money and can leave residue on clothes. High-efficiency (HE) detergents are formulated for modern machines and use less product per load.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/laundry-loads-per-month-cost-calculator" />
          <PopularCalculators exclude="/calculator/laundry-loads-per-month-cost-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "hsl(var(--primary))"];