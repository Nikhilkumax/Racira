"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DEFAULTS = {
  mode: "costRevenue", // "costRevenue" | "costMargin" | "revenueMargin" | "costMarkup"
  cost: "60",
  revenue: "100",
  margin: "40",
  markup: "66.67"
};

interface MarginResult {
  cost: number;
  revenue: number;
  profit: number;
  margin: number;
  markup: number;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): MarginResult {
  let cost = 0;
  let revenue = 0;
  let profit = 0;
  let margin = 0;
  let markup = 0;

  if (v.mode === "costRevenue") {
    cost = parseFloat(v.cost) || 0;
    revenue = parseFloat(v.revenue) || 0;
    profit = revenue - cost;
    margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    markup = cost > 0 ? (profit / cost) * 100 : 0;
  } else if (v.mode === "costMargin") {
    cost = parseFloat(v.cost) || 0;
    const m = (parseFloat(v.margin) || 0) / 100;
    revenue = m < 1 ? cost / (1 - m) : 0;
    profit = revenue - cost;
    margin = parseFloat(v.margin) || 0;
    markup = cost > 0 ? (profit / cost) * 100 : 0;
  } else if (v.mode === "revenueMargin") {
    revenue = parseFloat(v.revenue) || 0;
    const m = (parseFloat(v.margin) || 0) / 100;
    cost = revenue * (1 - m);
    profit = revenue - cost;
    margin = parseFloat(v.margin) || 0;
    markup = cost > 0 ? (profit / cost) * 100 : 0;
  } else if (v.mode === "costMarkup") {
    cost = parseFloat(v.cost) || 0;
    const mu = (parseFloat(v.markup) || 0) / 100;
    profit = cost * mu;
    revenue = cost + profit;
    margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    markup = parseFloat(v.markup) || 0;
  }

  const chartData = [
    { name: "Cost", value: Math.max(0, Math.round(cost * 100) / 100), fill: "hsl(var(--muted-foreground))" },
    { name: "Gross Profit", value: Math.max(0, Math.round(profit * 100) / 100), fill: "hsl(var(--primary))" }
  ];

  return { cost, revenue, profit, margin, markup, chartData };
}

const fmtCurrency = (n: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(n);
};

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function MarginCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<MarginResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleInputChange = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setVals((prev) => {
      const updated = { ...prev, [key]: e.target.value };
      return updated;
    });
  };

  const runCalc = (v = vals) => setResult(calculate(v));

  useEffect(() => {
    setMounted(true);
    runCalc();
  }, []);

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the difference between Margin and Markup?",
      answer: "Margin (Gross Margin) represents the ratio of profit to the selling price: Margin = Profit / Revenue. Markup represents the ratio of profit to the cost price: Markup = Profit / Cost. For example, if an item costs $60 and sells for $100, the profit is $40. The margin is 40% ($40/$100), and the markup is 66.67% ($40/$60)."
    },
    {
      question: "How do you calculate selling price from cost and margin?",
      answer: "To calculate the selling price when you know the cost and the desired gross margin, use the formula: Selling Price = Cost / (1 - Margin %). For example, if your cost is $70 and you want a 30% margin, your selling price is: $70 / (1 - 0.30) = $70 / 0.70 = $100."
    },
    {
      question: "Why is gross margin important for retail businesses?",
      answer: "Gross margin indicates the percentage of sales revenue that a business retains after incurring the direct costs of producing or purchasing the goods sold (COGS). A higher margin means the business has more money left over to pay for operating expenses, interest, and taxes, and to distribute as net profit."
    },
    {
      question: "Can markup be greater than 100%?",
      answer: "Yes, markup can be higher than 100% (and often is, for luxury goods, software, or low-cost items with high retail values). However, gross margin can never exceed 100% because profit can never be higher than the selling price (assuming cost is not negative)."
    },
    {
      question: "How do I calculate markup from margin?",
      answer: "To convert a gross margin percentage to a markup percentage, use this formula: Markup = Margin / (1 - Margin). For example, a 20% margin is: 0.20 / (1 - 0.20) = 0.20 / 0.80 = 25% markup."
    },
    {
      question: "How do I convert markup back to margin?",
      answer: "To convert a markup percentage to a gross margin percentage, use the formula: Margin = Markup / (1 + Markup). For example, a 50% markup is: 0.50 / (1 + 0.50) = 0.50 / 1.50 = 33.33% margin."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Margin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs Card */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Calculation Mode</label>
              <select
                value={vals.mode}
                onChange={handleInputChange("mode")}
                className="h-10 w-full px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="costRevenue">Calculate Margin & Markup (Cost & Revenue)</option>
                <option value="costMargin">Calculate Revenue & Markup (Cost & Margin %)</option>
                <option value="revenueMargin">Calculate Cost & Markup (Revenue & Margin %)</option>
                <option value="costMarkup">Calculate Revenue & Margin (Cost & Markup %)</option>
              </select>
            </div>

            {(vals.mode === "costRevenue" || vals.mode === "costMargin" || vals.mode === "costMarkup") && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Cost ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    value={vals.cost}
                    onChange={handleInputChange("cost")}
                    className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                  />
                </div>
              </div>
            )}

            {(vals.mode === "costRevenue" || vals.mode === "revenueMargin") && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Selling Price / Revenue ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    value={vals.revenue}
                    onChange={handleInputChange("revenue")}
                    className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                  />
                </div>
              </div>
            )}

            {(vals.mode === "costMargin" || vals.mode === "revenueMargin") && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Gross Margin (%)</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  <input
                    type="number"
                    value={vals.margin}
                    onChange={handleInputChange("margin")}
                    className="h-10 w-full pl-3 pr-8 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            )}

            {vals.mode === "costMarkup" && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Markup (%)</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  <input
                    type="number"
                    value={vals.markup}
                    onChange={handleInputChange("markup")}
                    className="h-10 w-full pl-3 pr-8 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                    min="0"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => runCalc()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Results Side */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                {/* Result Dashboards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-0.5 uppercase tracking-wider">Gross Margin</div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">{fmtPct(result.margin)}</div>
                    <span className="text-[10px] text-muted-foreground">Percentage of Selling Price</span>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Markup</div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{fmtPct(result.markup)}</div>
                    <span className="text-[10px] text-muted-foreground">Percentage over Cost</span>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Gross Profit</div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{fmtCurrency(result.profit)}</div>
                    <span className="text-[10px] text-muted-foreground">Absolute Profit Amount</span>
                  </div>
                </div>

                {/* Comparative table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Item</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Product Cost</td>
                        <td className="p-2.5 pr-3 text-right text-foreground font-medium">{fmtCurrency(result.cost)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Selling Price (Revenue)</td>
                        <td className="p-2.5 pr-3 text-right text-foreground font-medium">{fmtCurrency(result.revenue)}</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-2.5 pl-3 font-bold text-foreground">Gross Profit</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-primary">{fmtCurrency(result.profit)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Recharts Pie Chart */}
                {mounted && result.cost > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-foreground mb-1 w-full text-left">Revenue Composition</h3>
                    <span className="text-xs text-muted-foreground mb-3 w-full text-left">Comparison of Product Cost vs. Profit margins.</span>
                    <div className="w-full h-48 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={result.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {result.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => fmtCurrency(value as number)} />
                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SEO Article Section */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Margin vs. Markup</h2>
            <p>
              In pricing strategies and business operations, the terms <strong>margin</strong> and <strong>markup</strong> are often used interchangeably. However, they describe two distinct viewpoints of profitability, and confusing them can lead to major pricing errors and financial deficits.
            </p>
            <ul>
              <li><strong>Gross Margin</strong> compares profit to the <em>selling price</em>. It answers: "Out of every dollar of sales, how much do we keep as profit?"</li>
              <li><strong>Markup</strong> compares profit to the <em>cost price</em>. It answers: "How much did we add to the original purchase price of the item?"</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Formulas and Conversions</h2>
            <p>
              The equations for margin and markup are:
            </p>
            <p className="bg-muted p-4 rounded-lg font-mono text-center text-sm md:text-base border border-border">
              Gross Margin (%) = [ (Selling Price - Cost) / Selling Price ] × 100
            </p>
            <p className="bg-muted p-4 rounded-lg font-mono text-center text-sm md:text-base border border-border">
              Markup (%) = [ (Selling Price - Cost) / Cost ] × 100
            </p>
            <p>
              Because selling price is always higher than cost (except in losses), the markup percentage will always be higher than the margin percentage. For example, a 50% markup is equivalent to a 33.33% gross margin.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/margin-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Margin Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Margin Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Margin Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Margin Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Margin Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/margin-calculator" />
        </div>
      </div>
    </>
  );
}
