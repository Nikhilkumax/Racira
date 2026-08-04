"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";

interface FreelanceInputs {
  annualIncome: number;
  hoursPerWeek: number;
  nonBillablePercent: number;
  overheadMonthly: number;
  weeksVacation: number;
  profitMargin: number;
  includeSeTax: boolean;
}

interface FreelanceResult {
  workingWeeks: number;
  totalAnnualHours: number;
  billableHours: number;
  billableWeeklyHours: number;
  grossIncomeNeeded: number;
  seTax: number;
  annualOverhead: number;
  totalCost: number;
  breakEvenRate: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  annualBilling: number;
  profitAmount: number;
  employeeEquivalent: number;
  valid: boolean;
}

const SE_TAX_RATE = 0.153;
const SE_TAXABLE_PORTION = 0.9235;

const DEFAULTS: FreelanceInputs = {
  annualIncome: 80000,
  hoursPerWeek: 40,
  nonBillablePercent: 30,
  overheadMonthly: 500,
  weeksVacation: 2,
  profitMargin: 20,
  includeSeTax: true,
};

export function calculateFreelanceRate(i: FreelanceInputs): FreelanceResult {
  const workingWeeks = Math.max(52 - i.weeksVacation, 0);
  const totalAnnualHours = i.hoursPerWeek * workingWeeks;
  const nonBillable = Math.min(Math.max(i.nonBillablePercent, 0), 99) / 100;
  const billableHours = totalAnnualHours * (1 - nonBillable);
  const margin = Math.min(Math.max(i.profitMargin, 0), 95) / 100;

  // Self-employment tax is levied on 92.35% of net earnings at 15.3%.
  // Gross up the target take-home so the rate actually covers it.
  const grossIncomeNeeded = i.includeSeTax
    ? i.annualIncome / (1 - SE_TAX_RATE * SE_TAXABLE_PORTION)
    : i.annualIncome;
  const seTax = grossIncomeNeeded - i.annualIncome;

  const annualOverhead = i.overheadMonthly * 12;
  const totalCost = grossIncomeNeeded + annualOverhead;

  const breakEvenRate = billableHours > 0 ? totalCost / billableHours : 0;
  const hourlyRate = breakEvenRate / (1 - margin);
  const annualBilling = hourlyRate * billableHours;
  const profitAmount = annualBilling - totalCost;

  return {
    workingWeeks,
    totalAnnualHours,
    billableHours,
    billableWeeklyHours: workingWeeks > 0 ? billableHours / workingWeeks : 0,
    grossIncomeNeeded,
    seTax,
    annualOverhead,
    totalCost,
    breakEvenRate,
    hourlyRate,
    dailyRate: hourlyRate * 8,
    weeklyRate: workingWeeks > 0 ? hourlyRate * (billableHours / workingWeeks) : 0,
    monthlyRate: annualBilling / 12,
    annualBilling,
    profitAmount,
    // A salaried employee works ~2,080 hours with benefits covered by the employer.
    employeeEquivalent: 2080 > 0 ? i.annualIncome / 2080 : 0,
    valid: billableHours > 0 && i.annualIncome > 0,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export default function FreelanceRateCalculator() {
  const [annualIncome, setAnnualIncome] = useState(String(DEFAULTS.annualIncome));
  const [hoursPerWeek, setHoursPerWeek] = useState(String(DEFAULTS.hoursPerWeek));
  const [nonBillablePercent, setNonBillablePercent] = useState(String(DEFAULTS.nonBillablePercent));
  const [overheadMonthly, setOverheadMonthly] = useState(String(DEFAULTS.overheadMonthly));
  const [weeksVacation, setWeeksVacation] = useState(String(DEFAULTS.weeksVacation));
  const [profitMargin, setProfitMargin] = useState(String(DEFAULTS.profitMargin));
  const [includeSeTax, setIncludeSeTax] = useState(DEFAULTS.includeSeTax);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<FreelanceResult>(calculateFreelanceRate(DEFAULTS));

  const getInputs = (): FreelanceInputs => ({
    annualIncome: parseFloat(annualIncome) || 0,
    hoursPerWeek: parseFloat(hoursPerWeek) || 0,
    nonBillablePercent: parseFloat(nonBillablePercent) || 0,
    overheadMonthly: parseFloat(overheadMonthly) || 0,
    weeksVacation: parseFloat(weeksVacation) || 0,
    profitMargin: parseFloat(profitMargin) || 0,
    includeSeTax,
  });

  useEffect(() => {
    setResults(calculateFreelanceRate(DEFAULTS));
  }, []);

  const incomeNum = parseFloat(annualIncome) || 0;
  const hoursNum = parseFloat(hoursPerWeek) || 0;
  const nonBillableNum = parseFloat(nonBillablePercent) || 0;
  const vacationNum = parseFloat(weeksVacation) || 0;
  const marginNum = parseFloat(profitMargin) || 0;

  let errorMsg = "";
  if (incomeNum <= 0) errorMsg = "Desired annual income must be greater than zero.";
  else if (hoursNum <= 0 || hoursNum > 168) errorMsg = "Hours per week must be between 1 and 168.";
  else if (nonBillableNum < 0 || nonBillableNum >= 100) errorMsg = "Non-billable time must be between 0% and 99%.";
  else if (vacationNum < 0 || vacationNum >= 52) errorMsg = "Vacation weeks must be between 0 and 51.";
  else if (marginNum < 0 || marginNum >= 100) errorMsg = "Profit margin must be between 0% and 99%.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResults(calculateFreelanceRate(getInputs()));
  };

  const reset = () => {
    setAnnualIncome(String(DEFAULTS.annualIncome));
    setHoursPerWeek(String(DEFAULTS.hoursPerWeek));
    setNonBillablePercent(String(DEFAULTS.nonBillablePercent));
    setOverheadMonthly(String(DEFAULTS.overheadMonthly));
    setWeeksVacation(String(DEFAULTS.weeksVacation));
    setProfitMargin(String(DEFAULTS.profitMargin));
    setIncludeSeTax(DEFAULTS.includeSeTax);
    setResults(calculateFreelanceRate(DEFAULTS));
  };

  const pieData = [
    { name: "Your Income", value: parseFloat(annualIncome) || 0, color: "#2563EB" },
    { name: "Self-Employment Tax", value: results.seTax, color: "#EF4444" },
    { name: "Business Overhead", value: results.annualOverhead, color: "#F59E0B" },
    { name: "Profit Margin", value: results.profitAmount, color: "#10B981" },
  ].filter(d => d.value > 0.005);

  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);
  const pieWithPct = pieData.map(d => ({ ...d, pct: pieTotal > 0 ? (d.value / pieTotal) * 100 : 0 }));

  const multiplier = results.employeeEquivalent > 0 ? results.hourlyRate / results.employeeEquivalent : 0;

  const breakdown = [
    { label: "Working Weeks Per Year", value: `${fmt(results.workingWeeks, 0)} wks` },
    { label: "Total Hours Worked", value: `${fmtInt(results.totalAnnualHours)} hrs` },
    { label: "Billable Hours", value: `${fmtInt(results.billableHours)} hrs`, highlight: true },
    { label: "Target Take-Home Income", value: `$${fmtInt(incomeNum)}` },
    { label: "Self-Employment Tax", value: `$${fmtInt(results.seTax)}` },
    { label: "Annual Business Overhead", value: `$${fmtInt(results.annualOverhead)}` },
    { label: "Total Cost to Cover", value: `$${fmtInt(results.totalCost)}` },
    { label: "Break-Even Hourly Rate", value: `$${fmt(results.breakEvenRate)}` },
    { label: "Profit Built Into Rate", value: `$${fmtInt(results.profitAmount)}` },
  ];

  const faqs = [
    { question: "How do I calculate my freelance hourly rate?", answer: "Start with your desired take-home income, gross it up for self-employment tax, add your annual business overhead, then divide by your genuinely billable hours — not total hours worked. Finally, divide by one minus your target profit margin. That final figure is the rate you quote clients." },
    { question: "Why can't I just divide my salary by 2,080 hours?", answer: "Because that assumes every working hour is billable and that you have no business costs or employer-side taxes. In reality 25% to 40% of a freelancer's time is unbillable, you pay both halves of Social Security and Medicare, and you fund your own equipment, software, and insurance. Dividing by 2,080 typically understates the rate you need by 50% or more." },
    { question: "What is the non-billable percentage?", answer: "Non-billable time covers everything a client will not pay for directly: proposals, invoicing, bookkeeping, marketing, sales calls, professional development, and administration. Most freelancers land between 25% and 40%. If you work 40 hours but only bill 28, your effective capacity is 28 hours, and your rate must reflect that." },
    { question: "How does self-employment tax affect my rate?", answer: "Self-employed individuals owe 15.3% for Social Security and Medicare — both the employee and employer halves — assessed on 92.35% of net earnings. To actually take home your target income, the rate has to be grossed up for that liability. You can toggle this in Advanced Options, though leaving it on is the realistic setting for U.S. freelancers." },
    { question: "Should freelancers charge more than employees earning the same salary?", answer: "Yes, typically 1.5 to 2 times the equivalent hourly figure. An employee's total cost to their employer is well above their salary once payroll taxes, health insurance, paid leave, retirement contributions, equipment, and office space are included. As a freelancer you carry all of those costs yourself." },
    { question: "What is a reasonable profit margin to build in?", answer: "Most freelance businesses target 15% to 25% above full cost recovery. This is not surplus income — it funds slow months, better tools, unpaid sick time, and business reserves. Treating every dollar above expenses as salary leaves nothing to absorb a bad quarter." },
    { question: "How is a day rate calculated?", answer: "A day rate is conventionally 7 to 8 times the hourly rate. Many freelancers apply a small discount for guaranteed multi-day bookings, since committed blocks reduce the sales and scheduling overhead that would otherwise be unbillable time." },
    { question: "How often should I raise my rates?", answer: "Review annually at minimum, and raise at least in line with inflation to avoid a silent real-terms pay cut. Larger increases are justified after meaningful skill gains, a stronger portfolio, or demonstrated results that let you shift from hourly billing toward value-based pricing." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Freelance Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Freelance Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="annual-income" label="Desired Annual Income ($)" value={annualIncome} onChange={setAnnualIncome} prefix="$" tooltip="Your target take-home pay, before business expenses and taxes." />
              <InputField id="hours-week" label="Hours Worked Per Week" value={hoursPerWeek} onChange={setHoursPerWeek} tooltip="Total hours you plan to work weekly, billable and non-billable combined." />
              <InputField id="non-billable" label="Non-Billable Time (%)" value={nonBillablePercent} onChange={setNonBillablePercent} suffix="%" tooltip="Share of working time spent on admin, marketing, and proposals. Typically 25-40%." />
              <InputField id="overhead" label="Monthly Overhead ($)" value={overheadMonthly} onChange={setOverheadMonthly} prefix="$" tooltip="Software, insurance, equipment, and other recurring business costs." />
            </div>

            {hasValidationErrors && (
              <div className="text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {errorMsg}
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-primary font-medium hover:bg-secondary/30 transition-colors"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="px-3 pb-3 border-t border-border pt-3 flex flex-col gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Time Off &amp; Targets</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="vacation" label="Vacation Weeks / Year" value={weeksVacation} onChange={setWeeksVacation} tooltip="Weeks off per year for holidays, sick days, and vacation." />
                      <InputField id="profit" label="Profit Margin (%)" value={profitMargin} onChange={setProfitMargin} suffix="%" tooltip="Margin above full cost recovery for reserves and growth. Typically 15-25%." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Taxes</div>
                    <label htmlFor="se-tax" className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-foreground">Include Self-Employment Tax (15.3%)</span>
                      <input
                        id="se-tax"
                        type="checkbox"
                        checked={includeSeTax}
                        onChange={e => setIncludeSeTax(e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasValidationErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Recommended Hourly Rate</div>
              <div className="text-4xl font-extrabold text-primary mb-1 tracking-tight">${fmt(results.hourlyRate)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                Break-even is ${fmt(results.breakEvenRate)}/hr — bill {fmtInt(results.billableHours)} hours to hit your target
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Day Rate</span>
                <span className="font-extrabold text-foreground">${fmtInt(results.dailyRate)}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Target</span>
                <span className="font-extrabold text-foreground">${fmtInt(results.monthlyRate)}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">vs Employee</span>
                <span className={`font-extrabold ${multiplier >= 1.5 ? "text-emerald-600" : "text-amber-600"}`}>{fmt(multiplier, 1)}×</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Rate Component</th>
                    <th className="py-2.5 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map(row => (
                    <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Recommended Hourly Rate</td>
                    <td className="py-2.5 px-3 text-right text-foreground">${fmt(results.hourlyRate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-lg border border-border bg-card">
              <div className="shrink-0">
                <div className="w-[220px] h-[220px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPie>
                      <Pie data={pieWithPct} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={2} dataKey="value">
                        {pieWithPct.map(e => <Cell key={e.name} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`$${fmtInt(v)}`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    </RPie>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Annual Billing</span>
                    <span className="text-base font-extrabold text-foreground">${fmtInt(results.annualBilling)}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2 w-full">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Where Every Billed Dollar Goes</h4>
                {pieWithPct.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-bold text-foreground">${fmtInt(item.value)} ({fmt(item.pct, 1)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Hourly Rate</span>
                  <span className="font-bold text-foreground">${fmt(results.hourlyRate)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Break-Even Rate</span>
                  <span className="font-bold text-foreground">${fmt(results.breakEvenRate)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Day Rate (8 hrs)</span>
                  <span className="font-bold text-foreground">${fmtInt(results.dailyRate)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Weekly Billing Target</span>
                  <span className="font-bold text-foreground">${fmtInt(results.weeklyRate)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Monthly Billing Target</span>
                  <span className="font-bold text-foreground">${fmtInt(results.monthlyRate)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Annual Billing</span>
                  <span className="font-bold text-foreground">${fmtInt(results.annualBilling)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Billable Hours / Year</span>
                  <span className="font-bold text-foreground">{fmtInt(results.billableHours)} hrs</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Billable Hours / Week</span>
                  <span className="font-bold text-foreground">{fmt(results.billableWeeklyHours, 1)} hrs</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Self-Employment Tax</span>
                  <span className="font-bold text-foreground">${fmtInt(results.seTax)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Annual Overhead</span>
                  <span className="font-bold text-foreground">${fmtInt(results.annualOverhead)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Employee Equivalent</span>
                  <span className="font-bold text-foreground">${fmt(results.employeeEquivalent)}/hr</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Freelance Multiplier</span>
                  <span className="font-bold text-foreground">{fmt(multiplier, 2)}×</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Setting Your Freelance Rate</h2>
            <p>Pricing is the single highest-leverage decision in a freelance business. Charge too little and you end up overworked, resentful, and unable to invest in getting better. Charge beyond what your portfolio supports and you stall out before you find traction. The goal is a rate that covers every real cost of being self-employed, absorbs the hours nobody pays you for, and still leaves a margin that makes the business durable.</p>
            <h2 className="text-2xl font-bold mb-3">The Mistake Almost Everyone Makes</h2>
            <p>The instinct is to take a target salary and divide by 2,080 hours. That calculation quietly assumes three things that are all false: that every hour you work is billable, that you have no business expenses, and that your tax burden matches an employee's. A freelancer targeting $80,000 who bills at roughly $38 per hour on that logic will finish the year well short, having worked more hours than any employee would.</p>
            <h2 className="text-2xl font-bold mb-3">Non-Billable Time Is the Largest Hidden Cost</h2>
            <p>Between 25% and 40% of a working freelancer's hours go to work that generates no invoice: writing proposals, chasing leads, onboarding calls, invoicing, bookkeeping, contract review, and keeping skills current. If you work 40 hours and bill 28 of them, your real capacity is 28 hours, and your rate has to recover a full week's costs from those 28 hours alone.</p>
            <h2 className="text-2xl font-bold mb-3">Self-Employment Tax and Business Overhead</h2>
            <p>Employees split Social Security and Medicare with their employer. Freelancers pay both halves — 15.3% assessed on 92.35% of net earnings — which is why a target take-home figure must be grossed up before it becomes a rate. On top of that sit software subscriptions, hardware, professional liability and health insurance, accounting fees, and marketing. Every one of those is funded entirely out of billable hours.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Profit Margin Is Not Optional</h2>
            <p>A margin of 15% to 25% above full cost recovery is what separates a business from a job with extra paperwork. It funds the slow month, the client who pays sixty days late, the laptop that dies, the week you are too ill to work, and the conference that wins you your next three clients. Freelancers who treat every dollar above expenses as take-home pay have no buffer when something ordinary goes wrong.</p>
            <h2 className="text-2xl font-bold mb-3">Moving Toward Value-Based Pricing</h2>
            <p>Hourly billing has a structural flaw: it penalises you for getting faster. As your expertise grows, shifting toward pricing based on the value delivered rather than the time consumed resolves that. A brand identity that takes you five hours may be worth thousands to a company whose entire market position depends on it. The rate this calculator produces remains useful even then — it becomes the floor beneath which a project is not worth accepting.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/freelance-rate-calculator" />
          <PopularCalculators exclude="/calculator/freelance-rate-calculator" />
        </div>
      </div>
    </>
  );
}
