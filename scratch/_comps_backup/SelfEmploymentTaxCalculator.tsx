"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, BriefcaseBusiness } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

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

export default function SelfEmploymentTaxCalculator() {
  const [income, setIncome] = useState(75000);
  const [year, setYear] = useState("2024");
  const [showResults, setShowResults] = useState(false);

  const wageBase = year === "2024" ? 168600 : 160200;
  const taxable = income * 0.9235;
  const ssTax = Math.min(taxable, wageBase) * 0.124;
  const medicareTax = taxable * 0.029;
  const total = ssTax + medicareTax;
  const halfDeduction = total / 2;
  const effective = income > 0 ? (total / income) * 100 : 0;
  const quarterly = total / 4;
  const takeHome = income - total;

  const chartData = [
    { name: "Social Security", value: Math.round(ssTax) },
    { name: "Medicare", value: Math.round(medicareTax) },
  ];

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setIncome(75000);
    setYear("2024");
    setShowResults(false);
  };

  const faqs = [
    { question: "Why do self-employed people pay more FICA?", answer: "Employees split FICA with their employer — 6.2% each for Social Security and 1.45% each for Medicare. Self-employed people are both employer and employee, so they pay the full 15.3% (12.4% + 2.9%). Half is deductible on the 1040 to offset the employer share." },
    { question: "What is the 92.35% rule?", answer: "SE tax applies to 92.35% of net earnings, not 100%. The IRS excludes the 'employer' half of the tax from the base, mimicking how a business deducts its payroll tax before computing profit. On $75,000 of net income, the taxable base is $69,263." },
    { question: "What is the Social Security wage base?", answer: "For 2024 it is $168,600 — earnings above that pay no Social Security tax, though Medicare's 2.9% continues on all earnings. The base is adjusted annually for inflation; the 2023 base was $160,200." },
    { question: "Do I need to pay quarterly?", answer: "Yes — SE tax plus income tax is due in four estimated payments (April, June, September, January). Paying 90% of current-year liability or 100% of prior-year tax through the safe harbor avoids underpayment penalties." },
    { question: "Is the SE tax deductible?", answer: "Half of it. The employer-equivalent portion — 6.2% Social Security + 1.45% Medicare of the taxable base — is an above-the-line deduction on Schedule 1, lowering your adjusted gross income and thus your income tax." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Self-Employment Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Self-Employment Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <BriefcaseBusiness className="w-4 h-4" /> FICA for the Self-Employed
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Net Self-Employment Income" value={income} onChange={setIncome} min={0} max={5000000} step={1000} prefix="$" />
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Tax Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="input-calc"
                >
                  <option value="2024">2024 (wage base $168,600)</option>
                  <option value="2023">2023 (wage base $160,200)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Self-Employment Tax</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(total)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {effective.toFixed(1)}% effective on {fmt(income)} · {fmt(quarterly)} per estimated quarterly payment
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Taxable Earnings (92.35%)</p>
                    <p className="text-2xl font-bold text-primary">{fmt(taxable)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Social Security</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(ssTax)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Medicare</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(medicareTax)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Item</th>
                        <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Total Self-Employment Tax</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(total)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Taxable Net Earnings (× 0.9235)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(taxable)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Social Security (12.4%, capped {fmt(wageBase)})</td>
                        <td className="py-2.5 px-3 text-right">{fmt(ssTax)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Medicare (2.9%, uncapped)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(medicareTax)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">AGI Deduction (½ of SE tax)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(halfDeduction)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Income After SE Tax</td>
                        <td className="py-2.5 px-3 text-right">{fmt(takeHome)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Where the SE Tax Goes</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} label>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={["#2563eb", "#22c55e"][i]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Net Income</span>
                      <span className="font-medium">{fmt(income)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Taxable Base</span>
                      <span className="font-medium">{fmt(taxable)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Total SE Tax</span>
                      <span className="font-medium">{fmt(total)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Effective Rate</span>
                      <span className="font-medium">{effective.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Quarterly Estimate</span>
                      <span className="font-medium">{fmt(quarterly)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">AGI Deduction</span>
                      <span className="font-medium">{fmt(halfDeduction)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your net self-employment income, then click <strong className="text-foreground">Calculate</strong> to see your SE tax, quarterly payments, and AGI deduction.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Self-Employment Tax Works</h2>
            <p>SE tax is the employee + employer share of FICA: 12.4% Social Security (on the first $168,600 in 2024) plus 2.9% Medicare, applied to 92.35% of net earnings (the IRS excludes the "employer" half from the base). Half the tax is deductible on your 1040 as an above-the-line adjustment.</p>
            <h3>Worked Example</h3>
            <p>On $75,000 of net freelance income, the taxable base is $69,263; Social Security is $8,589 and Medicare is $2,009, for a total of $10,597 (14.1% effective). The $5,299 AGI deduction reduces your income tax, and quarterly payments run about $2,649 each.</p>
            <h3>Budgeting for It</h3>
            <p>Freelancers often forget SE tax when quoting rates — a 15.3% FICA load on top of income tax means a $75,000 freelance income pays about $10,600 in SE tax alone. Setting aside roughly 25–30% of every invoice for taxes avoids April surprises, and the safe-harbor quarterly payments keep penalties away.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/self-employment-tax-calculator" />
          <PopularCalculators exclude="/calculator/self-employment-tax-calculator" />
        </div>
      </div>
    </>
  );
}
