"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NumInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}

function NumInput({ label, value, onChange, min = 0, max = 999999999, step = 1, suffix, prefix }: NumInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(min);
            const n = parseFloat(raw);
            if (Number.isNaN(n)) return;
            onChange(Math.min(max, Math.max(min, n)));
          }}
          className={`input-calc ${prefix ? "pl-8" : ""} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

export default function ProfitMarginCalculator() {
  const [revenue, setRevenue] = useState(100000);
  const [cogs, setCogs] = useState(60000);
  const [opex, setOpex] = useState(15000);
  const [other, setOther] = useState(5000);
  const [tax, setTax] = useState(5000);
  const [showResults, setShowResults] = useState(false);

  const grossProfit = revenue - cogs;
  const operatingProfit = grossProfit - opex;
  const netProfit = operatingProfit - other - tax;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const operatingMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const markup = cogs > 0 ? (grossProfit / cogs) * 100 : 0;
  const revenuePerDollar = revenue > 0 ? netProfit / revenue : 0;

  const chartData = [
    { name: "COGS", value: Math.round(cogs) },
    { name: "Operating", value: Math.round(opex) },
    { name: "Other + Tax", value: Math.round(other + tax) },
    { name: "Net Profit", value: Math.round(netProfit) },
  ];

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setRevenue(100000);
    setCogs(60000);
    setOpex(15000);
    setOther(5000);
    setTax(5000);
    setShowResults(false);
  };

  const faqs = [
    { question: "What is the difference between margin and markup?", answer: "Margin is profit divided by selling price; markup is profit divided by cost. A 50% markup on a $60 cost gives a $90 price and a $30 profit — which is a 33.3% margin. Retailers price with markup but measure health with margin." },
    { question: "What is a healthy net profit margin?", answer: "It varies by industry: software companies often clear 20–30%, grocery stores run 1–3%, and restaurants average 3–10%. A 10% net margin is broadly considered solid; above 20% is strong in most sectors. Compare against your industry, not an arbitrary benchmark." },
    { question: "What is gross margin vs operating margin?", answer: "Gross margin = (revenue − COGS) ÷ revenue, measuring how efficiently you make a product. Operating margin subtracts selling and administrative costs too, capturing how efficiently you run the whole business. Net margin then removes interest, other income, and taxes." },
    { question: "Why is my margin negative?", answer: "Costs exceed revenue — the business loses money on each sale or after fixed costs. Common causes: pricing below cost, COGS creeping up without price increases, or overhead that revenue cannot cover. The verdict badge here flags loss-making results automatically." },
    { question: "What is profit per dollar of revenue?", answer: "It is net profit divided by revenue — the cents of profit earned on each dollar of sales. A 15% net margin means $0.15 per dollar. It is the same number as the margin expressed in dollars rather than percent, handy for quick mental math on large revenue figures." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Profit Margin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Profit Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Percent className="w-4 h-4" /> Gross / Operating / Net
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Revenue / Sales" value={revenue} onChange={setRevenue} min={0} max={999999999} step={1000} prefix="$" />
              <NumInput label="Cost of Goods Sold" value={cogs} onChange={setCogs} min={0} max={999999999} step={1000} prefix="$" />
              <NumInput label="Operating Expenses" value={opex} onChange={setOpex} min={0} max={999999999} step={500} prefix="$" />
              <NumInput label="Other Expenses" value={other} onChange={setOther} min={0} max={999999999} step={500} prefix="$" />
              <NumInput label="Taxes" value={tax} onChange={setTax} min={0} max={999999999} step={500} prefix="$" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Margin is profit ÷ revenue; markup is profit ÷ cost — 50% markup equals 33.3% margin.</p>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Net Profit Margin</p>
                  <p className="text-4xl font-bold text-primary mt-1">{netMargin.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(netProfit)} net profit on {fmt(revenue)} revenue · {revenuePerDollar.toFixed(2)} profit per $1 of sales
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Gross Margin</p>
                    <p className="text-2xl font-bold text-primary">{grossMargin.toFixed(1)}%</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Operating Margin</p>
                    <p className="text-2xl font-bold text-orange-500">{operatingMargin.toFixed(1)}%</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Markup on COGS</p>
                    <p className="text-2xl font-bold text-green-600">{markup.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Level</th>
                        <th className="py-2.5 px-3 font-medium text-right">Profit</th>
                        <th className="py-2.5 px-3 font-medium text-right">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Net Profit</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(netProfit)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{netMargin.toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Gross Profit</td>
                        <td className="py-2.5 px-3 text-right">{fmt(grossProfit)}</td>
                        <td className="py-2.5 px-3 text-right">{grossMargin.toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Operating Profit</td>
                        <td className="py-2.5 px-3 text-right">{fmt(operatingProfit)}</td>
                        <td className="py-2.5 px-3 text-right">{operatingMargin.toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">COGS</td>
                        <td className="py-2.5 px-3 text-right">{fmt(cogs)}</td>
                        <td className="py-2.5 px-3 text-right">—</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Operating Expenses</td>
                        <td className="py-2.5 px-3 text-right">{fmt(opex)}</td>
                        <td className="py-2.5 px-3 text-right">—</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Other + Taxes</td>
                        <td className="py-2.5 px-3 text-right">{fmt(other + tax)}</td>
                        <td className="py-2.5 px-3 text-right">—</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Markup on COGS</td>
                        <td className="py-2.5 px-3 text-right">—</td>
                        <td className="py-2.5 px-3 text-right">{markup.toFixed(1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Where Revenue Goes</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-medium">{fmt(revenue)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Net Profit</span>
                      <span className="font-medium">{fmt(netProfit)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Gross / Operating / Net</span>
                      <span className="font-medium">
                        {grossMargin.toFixed(1)}% / {operatingMargin.toFixed(1)}% / {netMargin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Markup</span>
                      <span className="font-medium">{markup.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Cost Structure</span>
                      <span className="font-medium">
                        {revenue > 0 ? (((cogs + opex + other + tax) / revenue) * 100).toFixed(1) + "% of revenue" : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Verdict</span>
                      <span className="font-medium">{netMargin >= 20 ? "Strong" : netMargin >= 10 ? "Healthy" : netMargin >= 0 ? "Thin" : "Loss-making"}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your revenue and costs, then click <strong className="text-foreground">Calculate</strong> to see gross, operating, and net margins.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Profit Margins Work</h2>
            <p>Gross profit = revenue − COGS; operating profit subtracts operating expenses; net profit subtracts everything else including taxes. Each margin divides its profit level by revenue. Markup divides gross profit by COGS instead — so a 50% markup on a $60 cost yields a $90 price, which is a 33.3% margin.</p>
            <h3>Worked Example</h3>
            <p>$100,000 of revenue with $60,000 COGS, $15,000 operating expenses, $5,000 other, and $5,000 tax: gross margin 40.0%, operating margin 25.0%, net margin 15.0%, and a 66.7% markup on COGS.</p>
            <h3>Reading the Three Margins</h3>
            <p>A healthy gross margin shows your product pricing works; a thin operating margin reveals overhead eating the gains; and the net margin is the final score. Watching all three together tells you where profit leaks — pricing, operations, or the tax line — and what to fix first.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/profit-margin-calculator" />
          <PopularCalculators exclude="/calculator/profit-margin-calculator" />
        </div>
      </div>
    </>
  );
}
