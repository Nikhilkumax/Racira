"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const DEFAULTS = { totalDebt: "850000", shareholdersEquity: "650000" };

interface DEResult {
  deRatio: number;
  debtPct: number;
  equityPct: number;
  leverageMultiplier: number;
  rating: string;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): DEResult {
  const debt = parseFloat(v.totalDebt) || 0;
  const equity = parseFloat(v.shareholdersEquity) || 0;

  // D/E = Total Debt / Shareholders' Equity
  const deRatio = equity > 0 ? debt / equity : 0;
  const total = debt + equity;
  const debtPct = total > 0 ? (debt / total) * 100 : 0;
  const equityPct = total > 0 ? (equity / total) * 100 : 0;
  const leverageMultiplier = equity > 0 ? total / equity : 0; // Assets/Equity

  let rating = deRatio > 3 ? "High Leverage — elevated risk"
    : deRatio > 2 ? "Above Average — monitor carefully"
    : deRatio > 1 ? "Moderate — typical for capital-intensive sectors"
    : deRatio > 0.5 ? "Conservative — strong equity base"
    : "Very Conservative — low leverage";

  const chartData = [
    { name: "Total Debt", value: debt, fill: "#ef4444" },
    { name: "Shareholders' Equity", value: equity, fill: "hsl(var(--primary))" },
  ];

  return { deRatio, debtPct, equityPct, leverageMultiplier, rating, chartData };
}

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function DebtToEquityCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<DEResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));
  useEffect(() => { setMounted(true); runCalc(); }, []);
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const faqs = [
    { question: "What is the Debt-to-Equity Ratio?", answer: "D/E Ratio = Total Debt ÷ Shareholders' Equity. It measures the proportion of a company's financing that comes from debt versus equity. A D/E of 1.31 means $1.31 of debt for every $1 of equity — indicating moderate leverage." },
    { question: "What is a good Debt-to-Equity Ratio?", answer: "It depends heavily on the industry. Capital-intensive industries like utilities and real estate operate with D/E of 2–5. Tech companies often have D/E below 0.5. As a general rule: D/E below 1 is conservative, 1–2 is moderate, above 2 requires scrutiny. Compare to industry peers, not universal benchmarks." },
    { question: "What counts as total debt?", answer: "Total debt typically includes: short-term borrowings, current portion of long-term debt, long-term debt, finance lease obligations, and bonds payable. Some analysts use only interest-bearing debt; others include all liabilities. Be consistent in your calculation." },
    { question: "How does D/E affect cost of capital?", answer: "Debt is cheaper than equity (interest is tax-deductible; equity requires higher returns). Increasing D/E (up to a point) lowers WACC and increases return on equity via leverage. However, excessive debt increases financial distress risk, potentially raising the cost of debt and making further borrowing expensive or impossible." },
    { question: "What is the equity multiplier?", answer: "Equity Multiplier = Total Assets ÷ Shareholders' Equity = 1 + D/E Ratio. It's used in DuPont analysis: ROE = Net Profit Margin × Asset Turnover × Equity Multiplier. Higher leverage amplifies ROE but also amplifies losses." },
    { question: "Why might a negative D/E ratio occur?", answer: "If shareholders' equity is negative (accumulated losses exceed paid-in capital), the D/E ratio becomes negative — meaningless as a leverage metric. Companies with negative equity include heavily leveraged buyouts, businesses with large pension obligations, or firms that have repurchased more stock than their retained earnings." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Debt-to-Equity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt-to-Equity Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>
            {[
              { key: "totalDebt" as const, label: "Total Debt ($)" },
              { key: "shareholdersEquity" as const, label: "Shareholders' Equity ($)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-foreground mb-1 block">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input type="number" value={vals[key]} onChange={set(key)}
                    className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" min="0" />
                </div>
              </div>
            ))}
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => runCalc()} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Debt-to-Equity Ratio</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{result.deRatio.toFixed(2)}×</div>
                  <div className="text-sm text-muted-foreground font-medium">{result.rating}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Metric</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Total Debt", value: `$${fmt(parseFloat(vals.totalDebt))}` },
                        { label: "Shareholders' Equity", value: `$${fmt(parseFloat(vals.shareholdersEquity))}` },
                        { label: "Total Capital", value: `$${fmt(parseFloat(vals.totalDebt) + parseFloat(vals.shareholdersEquity))}` },
                        { label: "Debt-to-Equity Ratio", value: `${result.deRatio.toFixed(2)}×`, bold: true },
                        { label: "Debt as % of Capital", value: `${result.debtPct.toFixed(1)}%` },
                        { label: "Equity as % of Capital", value: `${result.equityPct.toFixed(1)}%` },
                        { label: "Equity Multiplier (Assets/Equity)", value: `${result.leverageMultiplier.toFixed(2)}×` },
                      ].map((r) => (
                        <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.bold ? "bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right ${r.bold ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Capital Structure</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={result.chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}k`}>
                          {result.chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Leverage Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "D/E Ratio", value: `${result.deRatio.toFixed(2)}×` },
                      { label: "Debt %", value: `${result.debtPct.toFixed(1)}%` },
                      { label: "Equity %", value: `${result.equityPct.toFixed(1)}%` },
                      { label: "Equity Multiplier", value: `${result.leverageMultiplier.toFixed(2)}×` },
                      { label: "Total Capital", value: `$${fmt(parseFloat(vals.totalDebt) + parseFloat(vals.shareholdersEquity))}` },
                      { label: "Risk Level", value: result.deRatio > 2 ? "High" : result.deRatio > 1 ? "Moderate" : "Low", bold: true },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                        <span className={`text-base font-bold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Debt-to-Equity Ratio?</h2>
            <p>The Debt-to-Equity (D/E) Ratio is one of the most fundamental measures of financial leverage. <strong>D/E = Total Debt ÷ Shareholders' Equity.</strong> It reveals how much of a company's financing comes from creditors versus shareholders. A D/E of 1.31× (our pre-filled example: $850K debt ÷ $650K equity) means the company has $1.31 of debt for every $1.00 of equity — moderate leverage, typical for established mid-market businesses.</p>

            <h2 className="text-2xl font-bold mb-3">Industry Benchmarks</h2>
            <p>D/E ratios vary dramatically by industry. Utilities and infrastructure: 2–5× (stable cash flows support heavy debt). Real estate / REITs: 2–4×. Manufacturing: 0.5–2×. Technology: 0–0.5× (asset-light models). Financial services: 8–15× (banks are inherently leveraged). Always compare a company's D/E to its direct sector peers — a D/E of 2× in utilities is conservative; in tech, it signals excessive leverage.</p>

            <h2 className="text-2xl font-bold mb-3">Leverage and Return on Equity</h2>
            <p>Leverage amplifies returns in both directions. The DuPont formula shows: <strong>ROE = Net Margin × Asset Turnover × Equity Multiplier</strong>. The Equity Multiplier = 1 + D/E. Higher leverage boosts ROE when business performance is good, but amplifies losses during downturns. This is why highly leveraged companies (like airlines and retailers) suffer catastrophic equity destruction during recessions.</p>

            <h2 className="text-2xl font-bold mb-3">Tax Advantage of Debt</h2>
            <p>Interest on debt is tax-deductible, creating a "tax shield." At a 25% corporate tax rate, a company paying $100,000 in annual interest reduces its tax bill by $25,000 — the net cost of debt is only $75,000. This tax advantage makes debt cheaper than equity financing up to optimal leverage levels, which is why profitable companies often deliberately carry some debt even when they have cash available.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-to-equity-calculator" />
          <PopularCalculators exclude="/calculator/debt-to-equity-calculator" />
        </div>
      </div>
    </>
  );
}
