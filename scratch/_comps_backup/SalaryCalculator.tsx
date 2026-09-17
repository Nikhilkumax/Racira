"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Wallet } from "lucide-react";
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

function NumInput({ label, value, onChange, min = 0, max = 999999, step = 1, suffix, prefix }: NumInputProps) {
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

const MONEY = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FREQUENCIES = [
  { id: "hourly", label: "Hourly", factor: 2080 },
  { id: "daily", label: "Daily", factor: 260 },
  { id: "weekly", label: "Weekly", factor: 52 },
  { id: "biweekly", label: "Bi-Weekly", factor: 26 },
  { id: "monthly", label: "Monthly", factor: 12 },
  { id: "annually", label: "Annually", factor: 1 },
];

export default function SalaryCalculator() {
  const [amount, setAmount] = useState(50000);
  const [frequency, setFrequency] = useState("annually");
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [holidays, setHolidays] = useState(10);
  const [vacation, setVacation] = useState(15);
  const [showResults, setShowResults] = useState(false);

  const freq = FREQUENCIES.find((f) => f.id === frequency) ?? FREQUENCIES[5];
  const annual = amount * freq.factor;
  const workDays = Math.max(1, 260 - holidays - vacation);
  const workHours = workDays * (hoursPerWeek / 5);
  const hourly = annual / (52 * hoursPerWeek);
  const effectiveHourly = annual / workHours;
  const daily = hourly * (hoursPerWeek / 5);
  const weekly = hourly * hoursPerWeek;
  const biweekly = weekly * 2;
  const monthly = annual / 12;
  const effectiveDaily = effectiveHourly * (hoursPerWeek / 5);
  const paidDays = holidays + vacation;

  const chartData = [
    { name: "Hourly", value: Math.round(hourly * 100) / 100 },
    { name: "Daily", value: Math.round(daily) },
    { name: "Weekly", value: Math.round(weekly) },
    { name: "Monthly", value: Math.round(monthly) },
  ];

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setAmount(50000);
    setFrequency("annually");
    setHoursPerWeek(40);
    setHolidays(10);
    setVacation(15);
    setShowResults(false);
  };

  const faqs = [
    { question: "How do I convert hourly pay to annual salary?", answer: "Multiply the hourly rate by 2,080 — 40 hours per week × 52 weeks. Working fewer or more hours changes the figure: 30 hours/week means 1,560 hours/year. This calculator uses the frequency factor for whatever period you enter." },
    { question: "What is the difference between standard and adjusted rates?", answer: "The standard rate divides annual pay by a fixed 2,080 hours. The adjusted rate divides by your actual working hours after paid holidays and vacation — so 25 paid days off raises your effective hourly rate, because you earn the same salary for fewer working hours." },
    { question: "How many working days are in a year?", answer: "52 weeks × 5 days = 260 weekdays per year, before holidays. With 10 holidays and 15 vacation days, you work 235 days. The calculator uses this to compute your effective daily and hourly pay." },
    { question: "Should I compare salaries by hourly rate?", answer: "Yes — it is the fairest comparison across jobs with different schedules, especially when one includes paid time off and another does not. Compare effective hourly rates (after days off) rather than sticker hourly rates for the truest picture." },
    { question: "Does this include taxes and benefits?", answer: "No — this converts gross pay between time periods only. Take-home pay depends on federal, state, and local taxes plus benefit premiums, which vary widely. Use it for comparing offers and budgeting, then apply a tax calculator for net pay." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Salary Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Salary Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Wallet className="w-4 h-4" /> Salary Converter
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Salary Amount" value={amount} onChange={setAmount} min={0} max={999999} step={100} prefix="$" />
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Pay Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="input-calc"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <NumInput label="Hours per Week" value={hoursPerWeek} onChange={setHoursPerWeek} min={1} max={80} step={1} suffix="hr" />
              <NumInput label="Paid Holidays / Year" value={holidays} onChange={setHolidays} min={0} max={30} step={1} suffix="days" />
              <NumInput label="Vacation Days / Year" value={vacation} onChange={setVacation} min={0} max={60} step={1} suffix="days" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Assumes 260 work days (52 weeks × 5 days) before holidays and vacation.</p>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Annual Salary</p>
                  <p className="text-4xl font-bold text-primary mt-1">{MONEY(annual)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workDays} working days · effective ${effectiveHourly.toFixed(2)}/hr after accounting for {paidDays} paid days off
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Hourly</p>
                    <p className="text-2xl font-bold text-primary">{MONEY(hourly)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Weekly</p>
                    <p className="text-2xl font-bold text-orange-500">{MONEY(weekly)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly</p>
                    <p className="text-2xl font-bold text-green-600">{MONEY(monthly)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Period</th>
                        <th className="py-2.5 px-3 font-medium text-right">Standard</th>
                        <th className="py-2.5 px-3 font-medium text-right">Adjusted for Days Off</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Annually</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{MONEY(annual)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{MONEY(annual)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Hourly</td>
                        <td className="py-2.5 px-3 text-right">{MONEY(hourly)}</td>
                        <td className="py-2.5 px-3 text-right">{MONEY(effectiveHourly)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Daily</td>
                        <td className="py-2.5 px-3 text-right">{MONEY(daily)}</td>
                        <td className="py-2.5 px-3 text-right">{MONEY(effectiveDaily)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Weekly</td>
                        <td className="py-2.5 px-3 text-right">{MONEY(weekly)}</td>
                        <td className="py-2.5 px-3 text-right">{MONEY(weekly)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Bi-Weekly</td>
                        <td className="py-2.5 px-3 text-right">{MONEY(biweekly)}</td>
                        <td className="py-2.5 px-3 text-right">{MONEY(biweekly)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Working Days / Year</td>
                        <td className="py-2.5 px-3 text-right">260</td>
                        <td className="py-2.5 px-3 text-right">{workDays}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Pay by Period</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => MONEY(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Annual Salary</span>
                      <span className="font-medium">{MONEY(annual)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Input ({freq.label})</span>
                      <span className="font-medium">{MONEY(amount)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Hours / Week</span>
                      <span className="font-medium">{hoursPerWeek} hr</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Days Off (Holiday + Vacation)</span>
                      <span className="font-medium">{paidDays} days</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Standard Hourly</span>
                      <span className="font-medium">{MONEY(hourly)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Effective Hourly</span>
                      <span className="font-medium">{MONEY(effectiveHourly)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your pay amount and schedule, then click <strong className="text-foreground">Calculate</strong> to see every time period from hourly to annual.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How to Compare Pay Across Time Periods</h2>
            <p>Your input is converted to an annual figure using its frequency factor (hourly × 2,080, daily × 260, weekly × 52, biweekly × 26, monthly × 12), then split back into every other period. The adjusted column divides annual pay by actual working days — so paid time off makes your effective hourly rate higher.</p>
            <h3>Worked Example</h3>
            <p>$50,000/year at 40 hr/week = $24.04/hr, $192.31/day, $961.54/week, and $4,166.67/month. With 10 holidays and 15 vacation days you work 235 days, raising your effective rate to $26.60/hr.</p>
            <h3>Why Effective Rate Matters</h3>
            <p>Two jobs paying the same annual salary are not equal if one gives 4 weeks of paid vacation and the other gives none. Dividing by actual working days exposes the real value of each hour you work — the number to use when comparing offers, negotiating raises, or pricing freelance work.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/salary-calculator" />
          <PopularCalculators exclude="/calculator/salary-calculator" />
        </div>
      </div>
    </>
  );
}
