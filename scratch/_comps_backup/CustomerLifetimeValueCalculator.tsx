"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

const NumInput = ({ id, label, value, onChange, prefix, suffix, min }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; min?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface Inputs {
  aov: string;
  freq: string;
  margin: string;
  lifespan: string;
  retention: string;
}

interface Result {
  revenueLtv: number;
  profitLtv: number;
  churnLtv: number;
  churnRate: number;
  yearlyProfit: number;
  cumulative: { year: number; value: number }[];
}

const DEFAULTS: Inputs = { aov: "100", freq: "4", margin: "40", lifespan: "3", retention: "80" };

function calculate(inputs: Inputs): Result {
  const aov = Math.max(0, parseFloat(inputs.aov) || 0);
  const freq = Math.max(0, parseFloat(inputs.freq) || 0);
  const margin = Math.min(100, Math.max(0, parseFloat(inputs.margin) || 0)) / 100;
  const lifespan = Math.max(0, parseFloat(inputs.lifespan) || 0);
  const retention = Math.min(99.9, Math.max(0, parseFloat(inputs.retention) || 0)) / 100;
  const revenueLtv = aov * freq * lifespan;
  const profitLtv = revenueLtv * margin;
  const churnLtv = margin > 0 ? (aov * freq * margin) / (1 - retention) : 0;
  const churnRate = (1 - retention) * 100;
  const yearlyProfit = aov * freq * margin;
  const years = Math.max(1, Math.min(15, Math.ceil(lifespan)));
  const cumulative = Array.from({ length: years }, (_, i) => ({ year: i + 1, value: yearlyProfit * (i + 1) }));
  return { revenueLtv, profitLtv, churnLtv, churnRate, yearlyProfit, cumulative };
}

const CustomerLifetimeValueCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.aov) <= 0 || num(inputs.freq) <= 0 || num(inputs.lifespan) <= 0 || num(inputs.margin) <= 0 || num(inputs.margin) > 100 || num(inputs.retention) >= 100;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Average Order Value", value: "$" + fmt(num(inputs.aov)) },
    { label: "Purchase Frequency (per year)", value: fmt(num(inputs.freq)) + "x" },
    { label: "Gross Profit Margin", value: fmt(num(inputs.margin)) + "%" },
    { label: "Avg Customer Lifespan", value: fmt(num(inputs.lifespan)) + " yrs" },
    { label: "Annual Retention Rate", value: fmt(num(inputs.retention)) + "%" },
    { label: "Annual Churn Rate", value: result.churnRate.toFixed(1) + "%" },
    { label: "Revenue LTV", value: fmtMoney(result.revenueLtv) },
    { label: "Profit LTV", value: fmtMoney(result.profitLtv), highlight: true },
    { label: "Churn-Adjusted LTV", value: fmtMoney(result.churnLtv), highlight: true },
  ];

  const faqs = [
    { question: "What is Customer Lifetime Value (CLV)?", answer: "Customer Lifetime Value is the total profit a customer is expected to generate during their entire relationship with your business. It tells you how much you can afford to spend acquiring each customer while staying profitable." },
    { question: "What is the difference between Revenue LTV and Profit LTV?", answer: "Revenue LTV is the total sales a customer generates, while Profit LTV multiplies that by your gross margin. Profit LTV is the number that matters — your acquisition cost (CAC) must stay well below it." },
    { question: "Why use churn-adjusted LTV?", answer: "The churn-adjusted formula (Profit per year ÷ churn rate) models an infinite customer lifetime under constant retention. For the defaults: $160 annual profit ÷ 20% churn = $800. It shows how much retention is worth — raising retention from 80% to 90% doubles churn-adjusted LTV." },
    { question: "What is a healthy LTV/CAC ratio?", answer: "An LTV/CAC ratio of 3:1 is the common benchmark — $1 of acquisition spend returning $3 of lifetime profit. Below 1:1 you lose money on every customer; above 5:1 you may be under-investing in growth." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Customer Lifetime Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Customer Lifetime Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="aov" label="Average Order Value" value={inputs.aov} onChange={set("aov")} prefix="$" />
              <NumInput id="freq" label="Purchases per Year" value={inputs.freq} onChange={set("freq")} suffix="x" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="margin" label="Gross Profit Margin" value={inputs.margin} onChange={set("margin")} suffix="%" />
              <NumInput id="lifespan" label="Avg Customer Lifespan" value={inputs.lifespan} onChange={set("lifespan")} suffix="yrs" />
            </div>
            <div>
              <NumInput id="retention" label="Annual Retention Rate" value={inputs.retention} onChange={set("retention")} suffix="%" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">AOV, frequency, lifespan and margin must be positive; margin ≤ 100%; retention &lt; 100%.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Customer Lifetime Value (Profit)</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.profitLtv)}</div>
              <div className="text-sm text-muted-foreground font-medium">Revenue LTV: <span className="font-bold text-foreground">{fmtMoney(result.revenueLtv)}</span></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Revenue LTV</span>
                <span className="font-extrabold text-primary">{fmtMoney(result.revenueLtv)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Churn-Adjusted LTV</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.churnLtv)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Churn</span>
                <span className="font-extrabold text-red-600">{result.churnRate.toFixed(1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Cumulative Profit LTV by Year</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={result.cumulative} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="ltvFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => "$" + fmt(Math.round(v))} />
                  <Tooltip formatter={(v: number) => [fmtMoney(v), "Cumulative Profit LTV"]} labelFormatter={(l: number) => "Year " + l} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#ltvFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Average Order Value", value: "$" + fmt(num(inputs.aov)) },
                  { label: "Purchases per Year", value: fmt(num(inputs.freq)) + "x" },
                  { label: "Gross Profit Margin", value: fmt(num(inputs.margin)) + "%" },
                  { label: "Customer Lifespan", value: fmt(num(inputs.lifespan)) + " yrs" },
                  { label: "Retention Rate", value: fmt(num(inputs.retention)) + "%" },
                  { label: "Churn Rate", value: result.churnRate.toFixed(1) + "%" },
                  { label: "Revenue LTV", value: fmtMoney(result.revenueLtv) },
                  { label: "Profit LTV", value: fmtMoney(result.profitLtv), bold: true },
                  { label: "Churn-Adjusted LTV", value: fmtMoney(result.churnLtv), bold: true },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Most Important Business Metric</h2>
            <p>Customer Lifetime Value is the North Star for marketing and growth teams. If you know a customer is worth $480 in profit over their lifetime (the default scenario: $100 order × 4 orders/year × 3 years × 40% margin), you can confidently spend up to that amount — and ideally far less — to acquire them. Without this number, advertising budgets are a guess.</p>
            <h2 className="text-2xl font-bold mb-3">The LTV/CAC Ratio</h2>
            <p>In e-commerce and SaaS, an LTV/CAC ratio of 3:1 is considered healthy. It means every $1 spent on marketing returns $3 in lifetime profit. Raising retention is the highest-leverage move: with an 80% annual retention rate, the churn-adjusted LTV of $800 is 1.7× the simple profit LTV. At 90% retention it would double to $1,600.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lifetime-value-calculator" />
          <PopularCalculators exclude="/calculator/lifetime-value-calculator" />
        </div>
      </div>
    </>
  );
};
export default CustomerLifetimeValueCalculator;
