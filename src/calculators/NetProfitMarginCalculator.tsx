"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const DEFAULTS = {
  revenue: "1000000",
  cogs: "500000",
  opex: "200000",
  interest: "30000",
  tax: "40000"
};

interface NetMarginResult {
  grossProfit: number;
  ebit: number;
  ebt: number;
  netIncome: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): NetMarginResult {
  const rev = parseFloat(v.revenue) || 0;
  const cogsVal = parseFloat(v.cogs) || 0;
  const opexVal = parseFloat(v.opex) || 0;
  const intVal = parseFloat(v.interest) || 0;
  const taxVal = parseFloat(v.tax) || 0;

  const grossProfit = rev - cogsVal;
  const ebit = grossProfit - opexVal;
  const ebt = ebit - intVal;
  const netIncome = ebt - taxVal;

  const grossMargin = rev > 0 ? (grossProfit / rev) * 100 : 0;
  const operatingMargin = rev > 0 ? (ebit / rev) * 100 : 0;
  const netMargin = rev > 0 ? (netIncome / rev) * 100 : 0;

  const chartData = [
    { name: "Revenue", value: rev, fill: "hsl(var(--primary))" },
    { name: "COGS (-)", value: -cogsVal, fill: "#ef4444" },
    { name: "Gross Profit", value: grossProfit, fill: "#10b981" },
    { name: "OpEx (-)", value: -opexVal, fill: "#f59e0b" },
    { name: "Operating Profit", value: ebit, fill: "#8b5cf6" },
    { name: "Interest/Taxes (-)", value: -(intVal + taxVal), fill: "#f43f5e" },
    { name: "Net Income", value: netIncome, fill: "#6366f1" }
  ];

  return {
    grossProfit,
    ebit,
    ebt,
    netIncome,
    grossMargin,
    operatingMargin,
    netMargin,
    chartData
  };
}

const fmtCurrency = (n: number) => {
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(abs);
  return n < 0 ? `-${formatted}` : formatted;
};

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function NetProfitMarginCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<NetMarginResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleInputChange = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setVals((prev) => {
      const updated = { ...prev, [key]: e.target.value };
      return updated;
    });
  };

  const runCalc = (v = vals) => setResult(calculate(v));

  useEffect(() => {
    setMounted(true);
    runCalc();
  }, [vals.revenue, vals.cogs, vals.opex, vals.interest, vals.tax]);

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is Net Profit Margin?",
      answer: "Net Profit Margin (or simply Net Margin) is the percentage of revenue remaining after all operating expenses, interest expenses, taxes, and preferred stock dividends have been paid. It represents the proportion of sales dollars that turn into actual net profits available for common stock shareholders."
    },
    {
      question: "How does Net Profit Margin differ from Gross Profit Margin?",
      answer: "Gross Profit Margin only accounts for the direct costs of producing goods (COGS): Gross Margin = (Revenue - COGS) / Revenue. Net Profit Margin accounts for *all* expenses—including operating expenses (OpEx), interest charges, and income taxes. Net margin will always be lower than gross margin."
    },
    {
      question: "What is a good Net Profit Margin?",
      answer: "A 'good' net margin varies heavily by industry. Retail businesses and supermarkets typically have low net margins (2% to 5%) but make up for it with high sales volume. Technology, software-as-a-service (SaaS), and financial institutions often boast net margins of 20% or higher. Comparing margins is most effective when done against direct industry competitors."
    },
    {
      question: "Why did my net profit margin drop while sales increased?",
      answer: "This is a common issue known as 'negative operating leverage.' If sales increase but operating costs, COGS, interest rates, or tax burdens increase at a faster percentage rate, the net margin will contract even though absolute revenue is expanding."
    },
    {
      question: "How can a company improve its Net Profit Margin?",
      answer: "A firm can improve net margins by: 1) Increasing prices to boost revenue per unit, 2) Lowering unit costs (COGS) through supply negotiations, 3) Reducing overhead or operational waste (OpEx), and 4) Deleveraging (paying off debt) to reduce interest expenses."
    },
    {
      question: "Can Net Profit Margin be negative?",
      answer: "Yes. If a company's total expenses (COGS + OpEx + Interest + Taxes) exceed its total revenue, the company reports a net loss. In this scenario, the net profit margin is negative, representing the percentage loss per dollar of sales."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Net Profit Margin" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Net Profit Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* Inputs Card */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Inputs</h2>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Total Revenue ($)</label>
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

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Cost of Goods Sold (COGS) ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.cogs}
                  onChange={handleInputChange("cogs")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Operating Expenses (OpEx) ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.opex}
                  onChange={handleInputChange("opex")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Interest Expense ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.interest}
                  onChange={handleInputChange("interest")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Taxes Paid ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.tax}
                  onChange={handleInputChange("tax")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => runCalc()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                <Calculator className="h-4 w-4" /> Calculate
              </button>
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
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-0.5 uppercase tracking-wider">Net Profit Margin</div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">{fmtPct(result.netMargin)}</div>
                    <span className="text-[10px] text-muted-foreground">Final profit ratio</span>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Operating Margin</div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{fmtPct(result.operatingMargin)}</div>
                    <span className="text-[10px] text-muted-foreground">EBIT margin ratio</span>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Gross Margin</div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{fmtPct(result.grossMargin)}</div>
                    <span className="text-[10px] text-muted-foreground">Sales margin over COGS</span>
                  </div>
                </div>

                {/* Waterfall Income Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Step</th>
                        <th className="p-2.5 text-right">Value ($)</th>
                        <th className="p-2.5 pr-3 text-right">Margin (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Total Revenue</td>
                        <td className="p-2.5 text-right text-foreground font-medium">{fmtCurrency(parseFloat(vals.revenue) || 0)}</td>
                        <td className="p-2.5 pr-3 text-right text-muted-foreground">100.00%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Gross Profit</td>
                        <td className="p-2.5 text-right text-emerald-600 font-medium">{fmtCurrency(result.grossProfit)}</td>
                        <td className="p-2.5 pr-3 text-right text-emerald-600 font-medium">{fmtPct(result.grossMargin)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Operating Income (EBIT)</td>
                        <td className="p-2.5 text-right text-indigo-600 font-medium">{fmtCurrency(result.ebit)}</td>
                        <td className="p-2.5 pr-3 text-right text-indigo-600 font-medium">{fmtPct(result.operatingMargin)}</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-2.5 pl-3 font-bold text-foreground">Net Income</td>
                        <td className="p-2.5 text-right font-bold text-primary">{fmtCurrency(result.netIncome)}</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-primary">{fmtPct(result.netMargin)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Recharts Waterfall/Components Chart */}
                {mounted && result.chartData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Profit Waterfall Breakdown ($)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip formatter={(v: any) => [fmtCurrency(v)]} />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {result.chartData.map((e, i) => (
                            <Cell key={i} fill={e.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SEO Article Section */}
        <div className="max-w-[1180px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>Understanding the Net Profit Margin</h2>
            <p>
              The <strong>Net Profit Margin</strong> stands as the ultimate indicator of a firm's bottom-line profitability. While other metrics like gross profit or operating earnings tell a story about manufacturing efficiency or sales control, the net profit margin reports the percentage of revenue that remains as actual cash that can be distributed to equity owners or reinvested in corporate expansion.
            </p>
            <p>
              Calculated by dividing Net Income by Total Revenue, this ratio accounts for every single dollar of expenses. This includes direct labor and materials (COGS), selling and general overhead (OpEx), interest payments on corporate debt, and federal/state income taxes. An expanding net profit margin indicates excellent pricing power, cost control, or strong operating leverage.
            </p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-profit-margin-calculator" />
          <PopularCalculators exclude="/calculator/net-profit-margin-calculator" />
        </div>
      </div>
    </>
  );
}
