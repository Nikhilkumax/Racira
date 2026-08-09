"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, Clock, DollarSign, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface OvertimeResult {
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  effectiveRate: number;
  weeklyOvertimeCost: number;
  monthlyOvertimeCost: number;
  annualOvertimeCost: number;
  chartData: { name: string; pay: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  hourlyRate: "25",
  regularHours: "40",
  overtimeHours: "10",
  overtimeMultiplier: "1.5",
  weeksPerMonth: "4.33",
};

const calculate = (v: typeof DEFAULTS): OvertimeResult => {
  const hourlyRate = parseFloat(v.hourlyRate) || 0;
  const regularHours = parseFloat(v.regularHours) || 0;
  const overtimeHours = parseFloat(v.overtimeHours) || 0;
  const multiplier = parseFloat(v.overtimeMultiplier) || 1.5;
  const weeksPerMonth = parseFloat(v.weeksPerMonth) || 4.33;

  const totalHours = regularHours + overtimeHours;
  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * multiplier;
  const totalPay = regularPay + overtimePay;
  const effectiveRate = totalHours > 0 ? totalPay / totalHours : 0;
  const weeklyOvertimeCost = overtimePay;
  const monthlyOvertimeCost = overtimePay * weeksPerMonth;
  const annualOvertimeCost = monthlyOvertimeCost * 12;

  const chartData = [
    { name: "Regular Pay", pay: parseFloat(regularPay.toFixed(2)), fill: "#3b82f6" },
    { name: "Overtime Pay", pay: parseFloat(overtimePay.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Total Pay", pay: parseFloat(totalPay.toFixed(2)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Hourly Rate", value: `$${hourlyRate.toFixed(2)}/hr` },
    { label: "Regular Hours", value: `${regularHours.toFixed(1)} hrs` },
    { label: "Overtime Hours", value: `${overtimeHours.toFixed(1)} hrs` },
    { label: "Total Hours", value: `${totalHours.toFixed(1)} hrs` },
    { label: "Overtime Multiplier", value: `${multiplier.toFixed(1)}x` },
    { label: "Regular Pay", value: `$${regularPay.toFixed(2)}` },
    { label: "Overtime Pay", value: `$${overtimePay.toFixed(2)}` },
    { label: "Total Weekly Pay", value: `$${totalPay.toFixed(2)}` },
    { label: "Effective Hourly Rate", value: `$${effectiveRate.toFixed(2)}/hr` },
    { label: "Weekly OT Cost", value: `$${weeklyOvertimeCost.toFixed(2)}` },
    { label: "Monthly OT Cost", value: `$${monthlyOvertimeCost.toFixed(2)}` },
    { label: "Annual OT Cost", value: `$${annualOvertimeCost.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Total Pay", value: `$${totalPay.toFixed(2)}` },
    { label: "Effective Rate", value: `$${effectiveRate.toFixed(2)}/hr` },
    { label: "OT Premium", value: `$${(overtimePay - overtimeHours * hourlyRate).toFixed(2)}` },
    { label: "Annual OT Cost", value: `$${annualOvertimeCost.toFixed(2)}` },
    { label: "OT % of Pay", value: `${totalPay > 0 ? (overtimePay / totalPay * 100).toFixed(1) : "0"}%` },
  ];

  return {
    regularHours, overtimeHours, totalHours,
    regularPay, overtimePay, totalPay, effectiveRate,
    weeklyOvertimeCost, monthlyOvertimeCost, annualOvertimeCost,
    chartData, breakdown, summaryStats,
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function OvertimeHoursCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<OvertimeResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(vals));
  };

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const updateVal = (key: keyof typeof DEFAULTS, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "How is overtime pay calculated?", answer: "Overtime pay is typically calculated at 1.5x the regular hourly rate for hours worked beyond the standard 40-hour workweek. Some jurisdictions require 2x pay for hours beyond a certain daily threshold." },
    { question: "What is the effective hourly rate?", answer: "The effective hourly rate is the total pay divided by total hours worked (regular + overtime). It is always lower than the regular hourly rate because overtime pay includes a premium." },
    { question: "How much does overtime cost annually?", answer: "The annual overtime cost is the weekly overtime pay multiplied by the number of weeks worked per year (typically 52). This calculator also shows monthly and annual costs." },
    { question: "What is the FLSA overtime rule?", answer: "Under the US Fair Labor Standards Act (FLSA), non-exempt employees must receive overtime pay at 1.5x their regular rate for hours worked over 40 in a workweek. Some states have additional overtime requirements." },
    { question: "Can overtime be calculated differently?", answer: "Yes. Some employers use daily overtime (e.g., hours over 8 per day), some use a fluctuating workweek method, and some use a weighted average of multiple rates. This calculator uses the standard weekly overtime method." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Overtime Hours Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Overtime Hours Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Work Schedule
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Hourly Rate</label>
                  <div className="relative">
                    <input type="number" value={vals.hourlyRate} onChange={(e) => updateVal("hourlyRate", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$/hr</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Regular Hours</label>
                  <input type="number" value={vals.regularHours} onChange={(e) => updateVal("regularHours", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Overtime Hours</label>
                  <input type="number" value={vals.overtimeHours} onChange={(e) => updateVal("overtimeHours", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Overtime Multiplier</label>
                  <input type="number" value={vals.overtimeMultiplier} onChange={(e) => updateVal("overtimeMultiplier", e.target.value)} className="input-calc" step="0.1" min="1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Weeks Per Month</label>
                  <input type="number" value={vals.weeksPerMonth} onChange={(e) => updateVal("weeksPerMonth", e.target.value)} className="input-calc" step="any" min="1" max="5.2" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Total Weekly Pay
                </div>
                <div className="text-4xl font-bold text-primary mb-1">${result.totalPay.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">
                  ${result.effectiveRate.toFixed(2)} effective rate · {result.totalHours.toFixed(1)} total hours
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Regular Pay</div>
                  <div className="text-lg font-bold text-foreground">${result.regularPay.toFixed(2)}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">OT Pay</div>
                  <div className="text-lg font-bold text-foreground">${result.overtimePay.toFixed(2)}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">OT Premium</div>
                  <div className="text-lg font-bold text-foreground">${(result.overtimePay - result.overtimeHours * parseFloat(vals.hourlyRate)).toFixed(2)}</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Metric</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Pay Breakdown</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="pay" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={result.chartData[i].fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Overtime Hours: Understanding Your Pay</h2>
            <p>Overtime pay is additional compensation for hours worked beyond the standard workweek. Understanding how overtime affects your pay is important for both employees and employers. This calculator helps you determine the financial impact of overtime hours on your weekly, monthly, and annual earnings.</p>

            <h3>1. How Overtime Pay Works</h3>
            <p>Under the US Fair Labor Standards Act (FLSA), non-exempt employees must receive overtime pay at a rate of 1.5 times their regular hourly rate for all hours worked over 40 in a workweek. Some states have additional overtime requirements, such as daily overtime after 8 hours. The overtime premium is the additional amount paid above the regular rate — for a 1.5x multiplier, the premium is 0.5x the regular rate.</p>

            <h3>2. The Effective Hourly Rate</h3>
            <p>When you work overtime, your effective hourly rate (total pay divided by total hours) decreases because the overtime premium is only applied to the extra hours. For example, at $25/hour with 10 overtime hours at 1.5x, the regular 40 hours pay $1,000 and the 10 overtime hours pay $375, for a total of $1,375. The effective rate is $1,375 / 50 = $27.50/hour, which is lower than the $37.50 overtime rate.</p>

            <h3>3. Annual Cost of Overtime</h3>
            <p>Overtime costs can add up significantly over time. Working 10 overtime hours per week at $25/hour with a 1.5x multiplier costs $375 per week in overtime pay alone, or $4,500 per month, or $54,000 per year. This calculator helps you understand the full financial impact of overtime on both your paycheck and your employer's labor costs.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/overtime-hours-calculator" />
          <PopularCalculators exclude="/calculator/overtime-hours-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "hsl(var(--primary))", "#10b981"];