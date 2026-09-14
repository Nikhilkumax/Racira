"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface GrossProfitMarginInput {
  revenue: number;
  costOfGoodsSold: number;
}

interface MarginResult {
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPct: number;
  markupPct: number;
  targetRevenue: number;
  chartData: { name: string; value: number }[];
}

export function calculateGrossProfitMargin(input: GrossProfitMarginInput): MarginResult {
  const grossProfit = input.revenue - input.costOfGoodsSold;
  const marginPct = input.revenue > 0 ? (grossProfit / input.revenue) * 100 : 0;
  const markupPct = input.costOfGoodsSold > 0 ? (grossProfit / input.costOfGoodsSold) * 100 : 0;
  const targetRevenue = input.costOfGoodsSold > 0 ? input.costOfGoodsSold / 0.6 : 0; // revenue needed for 40% margin
  const chartData = [
    { name: "Revenue", value: Number(input.revenue.toFixed(0)) },
    { name: "COGS", value: Number(input.costOfGoodsSold.toFixed(0)) },
    { name: "Gross Profit", value: Number(grossProfit.toFixed(0)) },
  ];
  return { revenue: input.revenue, cogs: input.costOfGoodsSold, grossProfit, marginPct, markupPct, targetRevenue, chartData };
}

const DEFAULTS: GrossProfitMarginInput = { revenue: 100000, costOfGoodsSold: 60000 };

const faqs = [
  { question: "What is gross profit margin?", answer: "It is the percentage of revenue kept after paying the direct cost of goods sold: (Revenue − COGS) ÷ Revenue × 100. A $100,000 revenue business with $60,000 of COGS has a 40% margin." },
  { question: "Gross margin vs markup — what's the difference?", answer: "Margin is profit as a percentage of selling price; markup is profit as a percentage of cost. A 40% margin (sell $100 on $60 cost) is a 66.7% markup. Confusing them is a classic pricing error." },
  { question: "What is a good gross margin?", answer: "It varies by industry: software 70–90%, retail 30–50%, grocery 15–25%, restaurants 60–70% (food cost only). Compare against your industry average — margin below that signals pricing or sourcing problems." },
];

export default function GrossProfitMarginCalculator() {
  const [revenue, setRevenue] = useState(`${DEFAULTS.revenue}`);
  const [cogs, setCogs] = useState(`${DEFAULTS.costOfGoodsSold}`);
  const [result, setResult] = useState<MarginResult>(() => calculateGrossProfitMargin(DEFAULTS));

  const handleCalculate = () => {
    const r = parseFloat(revenue);
    const c = parseFloat(cogs);
    if (isNaN(r) || isNaN(c) || r <= 0 || c < 0) return;
    setResult(calculateGrossProfitMargin({ revenue: r, costOfGoodsSold: c }));
  };

  const reset = () => {
    setRevenue(`${DEFAULTS.revenue}`);
    setCogs(`${DEFAULTS.costOfGoodsSold}`);
    setResult(calculateGrossProfitMargin(DEFAULTS));
  };

  const fmt = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const breakdown = [
    { label: "Revenue", value: fmt(result.revenue), highlight: false },
    { label: "Cost of Goods Sold", value: fmt(result.cogs), highlight: false },
    { label: "Gross Profit", value: fmt(result.grossProfit), highlight: false },
    { label: "Gross Margin", value: `${result.marginPct.toFixed(1)}%`, highlight: true },
    { label: "Markup on Cost", value: `${result.markupPct.toFixed(1)}%`, highlight: false },
    { label: "Revenue for 40% Margin", value: fmt(result.targetRevenue), highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Gross Profit Margin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gross Profit Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <TrendingUp className="w-4 h-4" /> Profitability Check
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Revenue ($)</label>
                <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="input-calc" placeholder="100000" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Cost of Goods Sold ($)</label>
                <input type="number" value={cogs} onChange={(e) => setCogs(e.target.value)} className="input-calc" placeholder="60000" min={0} />
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
                <TrendingUp className="w-4 h-4 text-primary" /> GROSS MARGIN
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.marginPct.toFixed(1)}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {fmt(result.grossProfit)} gross profit on {fmt(result.revenue)} revenue — a {result.markupPct.toFixed(0)}% markup over cost.
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
              <h3 className="text-base font-bold mb-3">Revenue vs COGS</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "COGS as % of Revenue", value: `${(result.cogs / result.revenue * 100).toFixed(1)}%` },
                  { label: "Every $1 of Revenue", value: `${result.marginPct.toFixed(0)}¢ is gross profit` },
                  { label: "Industry Benchmarks", value: "Software 70–90% · Retail 30–50%" },
                  { label: "Healthy Signal", value: result.marginPct >= 30 ? "Healthy margin" : "Thin — watch pricing" },
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
            <h2 className="text-2xl font-bold mb-3">About the Gross Profit Margin Calculator</h2>
            <p>Gross profit margin is the share of revenue left after paying for the goods you sold — before rent, salaries, and marketing. It is the first health check of any business model: (Revenue − COGS) ÷ Revenue. A 40% margin means every dollar of sales contributes 40 cents toward overhead and profit, which is why margin is the number investors and lenders look at first.</p>
            <h3>Margin vs markup</h3>
            <p>The most common pricing mistake is treating margin and markup as the same. Margin is profit over selling price; markup is profit over cost. A product costing $60 sold at $100 yields a 40% margin but a 66.7% markup. Retailers who price by markup alone often undercharge without realizing it — this calculator reports both so you can price with either perspective and see exactly what the other implies.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gross-profit-margin-calculator" />
          <PopularCalculators exclude="/calculator/gross-profit-margin-calculator" />
        </div>
      </div>
    </>
  );
}
