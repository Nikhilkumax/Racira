"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Banknote } from "lucide-react";
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

// 2024 federal tax tables (computed tax on taxable income)
const SINGLE: [number, number, number][] = [
  [609350, 183647.25, 0.37],
  [243725, 58289.25, 0.35],
  [191950, 40426.75, 0.32],
  [100525, 17168.5, 0.24],
  [47150, 5426.0, 0.22],
  [11600, 1160.0, 0.12],
  [0, 0, 0.1],
];
const JOINT: [number, number, number][] = [
  [731200, 165580.5, 0.37],
  [487450, 80413.5, 0.35],
  [383900, 54793.5, 0.32],
  [201050, 22357.0, 0.24],
  [94300, 10852.0, 0.22],
  [23200, 2320.0, 0.12],
  [0, 0, 0.1],
];

function fedTax(taxable: number, table: [number, number, number][]) {
  for (const [limit, base, rate] of table) {
    if (taxable > limit) return base + (taxable - limit) * rate;
  }
  return 0;
}

export default function TakeHomeSalaryCalculator() {
  const [gross, setGross] = useState(75000);
  const [filing, setFiling] = useState("single");
  const [k401, setK401] = useState(6);
  const [health, setHealth] = useState(200);
  const [showResults, setShowResults] = useState(false);

  const kContribution = gross * (k401 / 100);
  const healthAnnual = health * 12;
  const taxable = gross - kContribution - healthAnnual;
  const fed = fedTax(taxable, filing === "single" ? SINGLE : JOINT);
  const ss = Math.min(gross, 168600) * 0.062;
  const medicare = gross * 0.0145;
  const total = fed + ss + medicare + kContribution + healthAnnual;
  const net = gross - total;
  const monthly = net / 12;
  const biweekly = net / 26;
  const weekly = net / 52;
  const effective = gross > 0 ? (fed / gross) * 100 : 0;
  const netPct = gross > 0 ? (net / gross) * 100 : 0;

  const chartData = [
    { name: "Net Pay", value: Math.round(net) },
    { name: "Fed Income Tax", value: Math.round(fed) },
    { name: "SS + Medicare", value: Math.round(ss + medicare) },
    { name: "401(k)", value: Math.round(kContribution) },
    { name: "Health Ins.", value: Math.round(healthAnnual) },
  ];

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setGross(75000);
    setFiling("single");
    setK401(6);
    setHealth(200);
    setShowResults(false);
  };

  const faqs = [
    { question: "What counts as take-home pay?", answer: "Take-home (net) pay is gross salary minus federal income tax, Social Security, Medicare, and any pre-tax deductions like 401(k) contributions and health insurance premiums. It is the amount that actually reaches your bank account each pay period." },
    { question: "Why are 401(k) contributions deducted before tax?", answer: "Pre-tax 401(k) contributions lower your taxable income, so you pay less federal income tax this year — the tax is deferred until you withdraw in retirement. This calculator treats them as pre-tax, which is why a 6% contribution shrinks your tax bill." },
    { question: "Does this include state income tax?", answer: "No — this models federal income tax and FICA only. State taxes vary widely (0% in nine states, up to 13.3% in California) and would reduce take-home further. Subtract your state's effective rate for a closer estimate." },
    { question: "What are the FICA rates?", answer: "Social Security is 6.2% of gross up to the $168,600 wage base (2024), and Medicare is 1.45% with no cap. High earners pay an additional 0.9% Medicare surcharge above $200,000 (single), which this calculator does not include." },
    { question: "How accurate is the federal tax estimate?", answer: "It uses the exact 2024 tax tables but assumes the standard deduction is folded into the taxable income you enter — this calculator subtracts only pre-tax payroll deductions, not the standard or itemized deduction. For a complete picture, pair it with a full tax estimator." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Take-Home Salary Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Take-Home Salary Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Banknote className="w-4 h-4" /> Gross to Net
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Annual Gross Salary" value={gross} onChange={setGross} min={0} max={2000000} step={1000} prefix="$" />
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
              <NumInput label="401(k) Contribution" value={k401} onChange={setK401} min={0} max={100} step={1} suffix="%" />
              <NumInput label="Health Insurance" value={health} onChange={setHealth} min={0} max={5000} step={25} prefix="$" suffix="/mo" />
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
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Annual Take-Home Pay</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(net)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(monthly)}/mo · {fmt(biweekly)} biweekly · you keep {netPct.toFixed(1)}% of gross
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Federal Tax</p>
                    <p className="text-2xl font-bold text-primary">{fmt(fed)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">FICA (SS + Medicare)</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(ss + medicare)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Retirement + Health</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(kContribution + healthAnnual)}</p>
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
                        <td className="py-2.5 px-3 font-medium">Take-Home Pay (Annual)</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(net)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Gross Salary</td>
                        <td className="py-2.5 px-3 text-right">{fmt(gross)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Federal Income Tax</td>
                        <td className="py-2.5 px-3 text-right">−{fmt(fed)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Social Security (6.2%)</td>
                        <td className="py-2.5 px-3 text-right">−{fmt(ss)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Medicare (1.45%)</td>
                        <td className="py-2.5 px-3 text-right">−{fmt(medicare)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">401(k) ({k401}%)</td>
                        <td className="py-2.5 px-3 text-right">−{fmt(kContribution)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Health Insurance</td>
                        <td className="py-2.5 px-3 text-right">−{fmt(healthAnnual)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Salary Allocation</p>
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
                      <span className="text-muted-foreground">Monthly Take-Home</span>
                      <span className="font-medium">{fmt(monthly)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Bi-Weekly Take-Home</span>
                      <span className="font-medium">{fmt(biweekly)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Effective Fed Tax Rate</span>
                      <span className="font-medium">{effective.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Net % of Gross</span>
                      <span className="font-medium">{netPct.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Taxable Income (pre-tax ded.)</span>
                      <span className="font-medium">{fmt(taxable)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Total Deductions</span>
                      <span className="font-medium">{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your gross salary, filing status, and pre-tax deductions, then click <strong className="text-foreground">Calculate</strong> to see your take-home pay by month, paycheck, and year.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">From Gross to Take-Home</h2>
            <p>Pre-tax deductions (401(k) and health insurance) lower taxable income; federal tax comes from the 2024 progressive brackets, then FICA (6.2% + 1.45%) is withheld on gross. Take-home is gross minus all five deductions, split into monthly, biweekly, and weekly figures. State taxes are not included.</p>
            <h3>Worked Example</h3>
            <p>A single filer earning $75,000 with 6% 401(k) and $200/mo health insurance has $68,100 of taxable income. Federal tax is $10,035, FICA $5,738, and retirement + health $6,900 — leaving about $52,328 take-home, or $4,361/month.</p>
            <h3>What You Can Control</h3>
            <p>Of the five deductions, only federal and FICA taxes are mandatory. Raising your 401(k) contribution or choosing a cheaper health plan directly increases take-home pay — and because 401(k) money is pre-tax, each dollar contributed saves your marginal tax rate as well as the dollar itself.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/take-home-salary-calculator" />
          <PopularCalculators exclude="/calculator/take-home-salary-calculator" />
        </div>
      </div>
    </>
  );
}
