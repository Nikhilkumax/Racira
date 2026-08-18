"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Scale } from "lucide-react";
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

function NumInput({ label, value, onChange, min = 0, max = 9999999, step = 1, suffix, prefix }: NumInputProps) {
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

const SINGLE = [
  { min: 0, max: 11600, rate: 10 },
  { min: 11601, max: 47150, rate: 12 },
  { min: 47151, max: 100525, rate: 22 },
  { min: 100526, max: 191950, rate: 24 },
  { min: 191951, max: 243725, rate: 32 },
  { min: 243726, max: 609350, rate: 35 },
  { min: 609351, max: Infinity, rate: 37 },
];
const JOINT = [
  { min: 0, max: 23200, rate: 10 },
  { min: 23201, max: 94300, rate: 12 },
  { min: 94301, max: 201050, rate: 22 },
  { min: 201051, max: 383900, rate: 24 },
  { min: 383901, max: 487450, rate: 32 },
  { min: 487451, max: 731200, rate: 35 },
  { min: 731201, max: Infinity, rate: 37 },
];

export default function TaxBracketCalculator() {
  const [income, setIncome] = useState(85000);
  const [filing, setFiling] = useState("single");
  const [year, setYear] = useState("2024");
  const [showResults, setShowResults] = useState(false);

  const stdDed = filing === "single" ? 14600 : 29200;
  const taxable = Math.max(0, income - stdDed);
  const brackets = filing === "single" ? SINGLE : JOINT;
  let total = 0;
  let marginal = 0;
  const rows = brackets.map((b) => {
    const amount = Math.max(0, Math.min(taxable, b.max) - b.min);
    const tax = amount * (b.rate / 100);
    total += tax;
    if (taxable >= b.min) marginal = b.rate;
    return { ...b, amount, tax };
  });
  const effective = income > 0 ? (total / income) * 100 : 0;
  const takeHome = income - total;

  const chartData = rows.filter((r) => r.amount > 0).map((r) => ({
    name: `${r.rate}%`,
    amount: Math.round(r.amount),
    tax: Math.round(r.tax),
  }));

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setIncome(85000);
    setFiling("single");
    setYear("2024");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is a marginal tax rate?", answer: "It is the rate applied to your last dollar of income — the highest bracket your taxable income reaches. Only the income within that bracket's range is taxed at that rate; everything below is taxed at lower rates. Earning more never pushes earlier dollars into a higher bracket." },
    { question: "What is the difference between marginal and effective rate?", answer: "The marginal rate is the top bracket you land in; the effective rate is total tax divided by gross income. Because lower brackets tax the first dollars cheaply, the effective rate is always below the marginal rate — a single filer at the 22% marginal rate often pays around 12% effective." },
    { question: "What are the 2024 federal brackets?", answer: "For single filers: 10% up to $11,600, 12% to $47,150, 22% to $100,525, 24% to $191,950, 32% to $243,725, 35% to $609,350, then 37%. Married filing jointly brackets are exactly double the 10–32% ranges, with the 35% and 37% thresholds adjusted differently." },
    { question: "How does the standard deduction work?", answer: "It is subtracted from gross income before brackets apply — $14,600 for single and $29,200 for married filing jointly in 2024. Most taxpayers take it instead of itemizing; the result is that a single filer owes zero federal income tax until income passes $14,600." },
    { question: "Does this include payroll or state taxes?", answer: "No — this calculates federal income tax only. Social Security and Medicare (7.65% employee share) and state income taxes are separate and would lower take-home pay further. Use it to understand bracket math, then combine with other calculators for a full picture." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tax Bracket Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tax Bracket Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Scale className="w-4 h-4" /> Federal Income Tax
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Total Annual Income" value={income} onChange={setIncome} min={0} max={5000000} step={1000} prefix="$" />
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Filing Status</label>
                <select
                  value={filing}
                  onChange={(e) => setFiling(e.target.value)}
                  className="input-calc"
                >
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Tax Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="input-calc"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">2024 standard deduction: {filing === "single" ? "$14,600" : "$29,200"} · {year} rates shown.</p>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Federal Tax</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(total)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {marginal}% marginal · {effective.toFixed(1)}% effective · {fmt(takeHome)} take-home
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Marginal Rate</p>
                    <p className="text-2xl font-bold text-primary">{marginal}%</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Effective Rate</p>
                    <p className="text-2xl font-bold text-orange-500">{effective.toFixed(1)}%</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Taxable Income</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(taxable)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Bracket</th>
                        <th className="py-2.5 px-3 font-medium text-right">Income in Bracket</th>
                        <th className="py-2.5 px-3 font-medium text-right">Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Total Federal Tax</td>
                        <td className="py-2.5 px-3 text-right font-semibold">—</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(total)}</td>
                      </tr>
                      {rows.map((r) => (
                        <tr className={r.amount > 0 ? "border-b" : "border-b opacity-50"} key={r.rate}>
                          <td className="py-2.5 px-3">
                            {r.rate}% {marginal === r.rate && r.amount > 0 && <span className="text-primary font-semibold">(current)</span>}
                          </td>
                          <td className="py-2.5 px-3 text-right">{r.amount > 0 ? fmt(r.amount) : "—"}</td>
                          <td className="py-2.5 px-3 text-right">{r.tax > 0 ? fmt(r.tax) : "—"}</td>
                        </tr>
                      ))}
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Standard Deduction</td>
                        <td className="py-2.5 px-3 text-right">{fmt(stdDed)}</td>
                        <td className="py-2.5 px-3 text-right">0</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Take-Home (federal only)</td>
                        <td className="py-2.5 px-3 text-right">—</td>
                        <td className="py-2.5 px-3 text-right">{fmt(takeHome)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Tax by Bracket</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Bar dataKey="amount" name="Income in Bracket" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Gross Income</span>
                      <span className="font-medium">{fmt(income)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Taxable Income</span>
                      <span className="font-medium">{fmt(taxable)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Marginal Rate</span>
                      <span className="font-medium">{marginal}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Effective Rate</span>
                      <span className="font-medium">{effective.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Total Tax</span>
                      <span className="font-medium">{fmt(total)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Take-Home</span>
                      <span className="font-medium">{fmt(takeHome)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your income and filing status, then click <strong className="text-foreground">Calculate</strong> to see your total federal tax, marginal and effective rates, and bracket-by-bracket breakdown.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Progressive Tax Brackets Work</h2>
            <p>Taxable income is gross minus the standard deduction, then each dollar is taxed at the rate of the bracket it lands in (progressive "buckets"). The marginal rate applies only to the last dollar earned; the effective rate is total tax divided by gross income, which is always lower.</p>
            <h3>Worked Example</h3>
            <p>A single filer earning $85,000 pays $10,541 in 2024 federal tax: taxable income of $70,400 spans the 10%, 12%, and 22% brackets. Marginal rate is 22%, but the effective rate is just 12.4%.</p>
            <h3>Why the Marginal Rate Matters</h3>
            <p>Raises and side income are taxed at your marginal rate, so knowing it helps you estimate the true value of extra earnings, decide between Roth and traditional retirement accounts, and avoid sticker shock on bonuses. The effective rate is what you actually pay overall — useful for budgeting your total tax burden.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tax-bracket-calculator" />
          <PopularCalculators exclude="/calculator/tax-bracket-calculator" />
        </div>
      </div>
    </>
  );
}
