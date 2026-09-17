"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  hourlyRate: string;
  overtimeHours: string;
  newHireRate: string;
  hireCost: string;
  benefitsPct: string;
  workloadWeeks: string;
  burnoutRisk: string;
}

interface Result {
  overtimeCost: number;
  hireAnnualCost: number;
  hirePerWorkload: number;
  savings: number;
  overtimePremium: number;
  hireCostPerWeek: number;
}

const DEFAULTS: Inputs = {
  hourlyRate: "30",
  overtimeHours: "10",
  newHireRate: "28",
  hireCost: "12000",
  benefitsPct: "30",
  workloadWeeks: "26",
  burnoutRisk: "10",
};

function calculate(inputs: Inputs): Result {
  const hourlyRate = Math.max(0, parseFloat(inputs.hourlyRate) || 0);
  const overtimeHours = Math.max(0, parseFloat(inputs.overtimeHours) || 0);
  const newHireRate = Math.max(0, parseFloat(inputs.newHireRate) || 0);
  const hireCost = Math.max(0, parseFloat(inputs.hireCost) || 0);
  const benefitsPct = Math.min(100, Math.max(0, parseFloat(inputs.benefitsPct) || 0));
  const workloadWeeks = Math.max(0, parseFloat(inputs.workloadWeeks) || 0);
  const burnoutRisk = Math.min(100, Math.max(0, parseFloat(inputs.burnoutRisk) || 0));

  const overtimePremium = hourlyRate * 0.5;
  const weeklyOvertime = overtimeHours * (hourlyRate + overtimePremium);
  const overtimeCost = weeklyOvertime * workloadWeeks * (1 + burnoutRisk / 100);
  const hireAnnualCost = newHireRate * 2080 * (1 + benefitsPct / 100) + hireCost;
  const hirePerWorkload = newHireRate * 40 * workloadWeeks * (1 + benefitsPct / 100) + hireCost;
  const savings = overtimeCost - hirePerWorkload;
  const hireCostPerWeek = hirePerWorkload / Math.max(1, workloadWeeks);

  return { overtimeCost, hireAnnualCost, hirePerWorkload, savings, overtimePremium, hireCostPerWeek };
}

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

export default function OvertimeVsHiringCostComparisonCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.hourlyRate) < 0 ||
    num(inputs.overtimeHours) < 0 ||
    num(inputs.newHireRate) < 0 ||
    num(inputs.hireCost) < 0 ||
    num(inputs.benefitsPct) < 0 || num(inputs.benefitsPct) > 100 ||
    num(inputs.workloadWeeks) < 0 ||
    num(inputs.burnoutRisk) < 0 || num(inputs.burnoutRisk) > 100;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const handlePrint = () => window.print();

  const overtimeNum = result.overtimeCost;
  const hireNum = result.hirePerWorkload;
  const savingsNum = result.savings;
  const overtimeBetter = savingsNum < 0;

  const rows = [
    { label: "Overtime Hours / Week", value: fmt(num(inputs.overtimeHours)) + " hrs" },
    { label: `Overtime Premium (${fmt(result.overtimePremium)}/hr)`, value: fmtMoney(overtimeNum) },
    { label: `Burnout Risk Premium (${fmt(num(inputs.burnoutRisk), 1)}%)`, value: fmtMoney(overtimeNum * (num(inputs.burnoutRisk) / 100) / (1 + num(inputs.burnoutRisk) / 100)) },
    { label: `New Hire Rate (${fmtMoney(num(inputs.newHireRate))}/hr × 40 hrs)`, value: fmtMoney(hireNum) },
    { label: `Benefits & Taxes (${fmt(num(inputs.benefitsPct), 1)}%)`, value: fmtMoney(num(inputs.newHireRate) * 40 * num(inputs.workloadWeeks) * (num(inputs.benefitsPct) / 100)) },
    { label: "One-Time Hire Cost", value: fmtMoney(num(inputs.hireCost)) },
    { label: "Difference over Workload Period", value: fmtMoney(Math.abs(savingsNum)), total: true },
    { label: overtimeBetter ? "Overtime Is Cheaper" : "Hiring Is Cheaper", value: fmtMoney(Math.abs(savingsNum)), highlight: true },
  ];

  const summaryStats = [
    { label: "Hourly Rate", value: fmtMoney(num(inputs.hourlyRate)) + "/hr" },
    { label: "Overtime / Week", value: fmt(num(inputs.overtimeHours)) + " hrs" },
    { label: "Overtime Premium", value: fmtMoney(result.overtimePremium) + "/hr" },
    { label: "Overtime Cost (period)", value: fmtMoney(overtimeNum) },
    { label: "Burnout Risk", value: fmt(num(inputs.burnoutRisk), 1) + "%" },
    { label: "New Hire Rate", value: fmtMoney(num(inputs.newHireRate)) + "/hr" },
    { label: "One-Time Hire Cost", value: fmtMoney(num(inputs.hireCost)) },
    { label: "Hire Cost (period)", value: fmtMoney(hireNum) },
    { label: "Workload Period", value: fmt(num(inputs.workloadWeeks)) + " weeks" },
    { label: "Hire Annual Cost", value: fmtMoney(result.hireAnnualCost) },
    { label: "Hire Cost / Week", value: fmtMoney(result.hireCostPerWeek) },
    { label: overtimeBetter ? "Overtime Saves" : "Hiring Saves", value: fmtMoney(Math.abs(savingsNum)), bold: true },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Overtime vs Hiring Cost Comparison Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Overtime vs Hiring Cost Comparison Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ov-hourly" label="Current Hourly Rate" value={inputs.hourlyRate} onChange={set("hourlyRate")} prefix="$" suffix="/hr" />
              <NumInput id="ov-hours" label="Overtime Hours / Week" value={inputs.overtimeHours} onChange={set("overtimeHours")} suffix="hrs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ov-rate" label="New Hire Rate" value={inputs.newHireRate} onChange={set("newHireRate")} prefix="$" suffix="/hr" />
              <NumInput id="ov-hirecost" label="One-Time Hire Cost" value={inputs.hireCost} onChange={set("hireCost")} prefix="$" />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
            >
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Benefits & Workload</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ov-benefits" label="Benefits & Payroll Taxes" value={inputs.benefitsPct} onChange={set("benefitsPct")} suffix="%" />
                    <NumInput id="ov-weeks" label="Workload Duration" value={inputs.workloadWeeks} onChange={set("workloadWeeks")} suffix="weeks" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="ov-burnout" label="Burnout / Attrition Risk" value={inputs.burnoutRisk} onChange={set("burnoutRisk")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; percentage inputs must be between 0 and 100.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={handleReset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={resultsRef} className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{overtimeBetter ? "Overtime Is the Lower-Cost Option" : "Hiring Is the Lower-Cost Option"}</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(Math.abs(savingsNum))}</div>
              <div className="text-sm text-muted-foreground font-medium">{overtimeBetter ? "saved by overtime" : "saved by hiring"} over {fmt(num(inputs.workloadWeeks))} weeks — overtime {fmtMoney(overtimeNum)} vs hire {fmtMoney(hireNum)}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overtime Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(overtimeNum)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hire Cost (Period)</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(hireNum)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hire Annual Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.hireAnnualCost)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Comparison Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {summaryStats.map((s) => (
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
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an Overtime vs Hiring Cost Comparison Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An overtime vs hiring cost comparison calculator helps managers decide whether to cover a sustained workload increase with overtime on the existing team or by hiring a new employee. Overtime looks cheap because it is billed at a time-and-a-half premium, but it has hidden costs: sustained overtime drives burnout, errors, and attrition, and it never builds capacity, so the premium repeats every week the workload persists. Hiring looks expensive because of the recruiting cost, benefits, and payroll taxes, but those costs are one-time or fixed, and a new employee adds permanent capacity. The two options cross over at different workload durations depending on wages, benefits, and hiring costs, and this calculator finds the cheaper path for your specific numbers, comparing the overtime cost over the workload period against the fully loaded cost of a hire over the same period.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The model applies the standard federal overtime premium of time and a half, which is the 50% premium added to the base rate for hours beyond forty in a workweek, and it assumes the overtime hours repeat every week for the workload duration, which is the correct treatment for a sustained workload increase rather than a one-off surge. The burnout risk percentage is the honest adjustment: sustained mandatory overtime measurably increases error rates, safety incidents, and attrition, and applying it as a percentage add-on to the overtime cost converts that qualitative risk into a dollar figure. The new hire's cost is fully loaded with the benefits percentage and includes the one-time hiring cost, and it is computed both over the workload period and on an annual basis, because the annual figure is the commitment the company carries after the surge ends. The workload duration is the pivotal input: short surges favor overtime, while anything sustained flips the math toward hiring, and the calculator reveals exactly where that crossover sits for your numbers.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the current hourly rate, the weekly overtime hours, the new hire's hourly rate, and the one-time hiring cost. The overtime cost starts with the weekly overtime pay, which is the overtime hours multiplied by the rate plus the 50% premium, then extends it over the workload duration and adds a burnout risk premium: with the default inputs, ten hours a week at $30 an hour costs $450 weekly, or $11,700 over 26 weeks, plus a 10% risk premium for a total near $12,870. The advanced options add the benefits and payroll tax percentage applied to the hire's wages, the workload duration in weeks, and the burnout or attrition risk percentage. The hire cost over the period is the new hire's wages for a 40-hour week over the workload weeks, fully loaded with benefits, plus the one-time hiring cost, and the annual hire cost projects the same wage and benefits across a full year. The difference between the two options over the period is the savings, and the calculator labels the winner.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">If hiring wins, the savings figure is the argument for opening the requisition; if overtime wins, the burnout risk assumption is the number to scrutinize, since a 10% risk premium is conservative for sustained mandatory overtime. The workload duration is the pivotal input: overtime often wins for short spikes, while hiring wins for anything sustained, because the overtime premium accumulates while the hiring cost does not. Compare the hire cost per week against the overtime weekly cost: when the weekly overtime bill exceeds the fully loaded weekly cost of a hire, the decision answers itself. Remember that the hire's annual cost shown in the stat bar is a commitment that outlasts the workload period, so a hire justified by a temporary surge should be evaluated for redeployment once the surge ends.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="overtime-vs-hiring-cost-comparison-calculator" />
        </div>
      </div>
    </>
  );
}