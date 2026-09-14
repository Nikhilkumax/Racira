"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employeesOnLeave: string;
  weeklyWage: string;
  leaveWeeks: string;
  replacementPct: string;
  stdBenefitPct: string;
  adminPerCase: string;
  overtimePct: string;
}

interface Result {
  wageContinuation: number;
  replacementCost: number;
  stdBenefitCost: number;
  overtimeCost: number;
  adminCost: number;
  totalCost: number;
  costPerEmployee: number;
}

const DEFAULTS: Inputs = {
  employeesOnLeave: "5",
  weeklyWage: "1200",
  leaveWeeks: "12",
  replacementPct: "90",
  stdBenefitPct: "60",
  adminPerCase: "1500",
  overtimePct: "10",
};

function calculate(inputs: Inputs): Result {
  const employeesOnLeave = Math.max(0, parseFloat(inputs.employeesOnLeave) || 0);
  const weeklyWage = Math.max(0, parseFloat(inputs.weeklyWage) || 0);
  const leaveWeeks = Math.max(0, parseFloat(inputs.leaveWeeks) || 0);
  const replacementPct = Math.min(200, Math.max(0, parseFloat(inputs.replacementPct) || 0));
  const stdBenefitPct = Math.min(100, Math.max(0, parseFloat(inputs.stdBenefitPct) || 0));
  const adminPerCase = Math.max(0, parseFloat(inputs.adminPerCase) || 0);
  const overtimePct = Math.min(100, Math.max(0, parseFloat(inputs.overtimePct) || 0));

  const wageContinuation = employeesOnLeave * weeklyWage * leaveWeeks;
  const replacementCost = wageContinuation * (replacementPct / 100);
  const stdBenefitCost = wageContinuation * (stdBenefitPct / 100);
  const overtimeCost = wageContinuation * (overtimePct / 100);
  const adminCost = employeesOnLeave * adminPerCase;
  const totalCost = wageContinuation + replacementCost + stdBenefitCost + overtimeCost + adminCost;
  const costPerEmployee = employeesOnLeave > 0 ? totalCost / employeesOnLeave : 0;

  return { wageContinuation, replacementCost, stdBenefitCost, overtimeCost, adminCost, totalCost, costPerEmployee };
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

export default function DisabilityLeaveCostCalculator() {
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
    num(inputs.employeesOnLeave) < 0 ||
    num(inputs.weeklyWage) < 0 ||
    num(inputs.leaveWeeks) < 0 ||
    num(inputs.replacementPct) < 0 || num(inputs.replacementPct) > 200 ||
    num(inputs.stdBenefitPct) < 0 || num(inputs.stdBenefitPct) > 100 ||
    num(inputs.adminPerCase) < 0 ||
    num(inputs.overtimePct) < 0 || num(inputs.overtimePct) > 100;

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

  const rows = [
    { label: "Employees on Leave", value: fmt(num(inputs.employeesOnLeave)) },
    { label: "Wage Continuation", value: fmtMoney(result.wageContinuation) },
    { label: `Replacement Worker Cost (${fmt(num(inputs.replacementPct), 1)}%)`, value: fmtMoney(result.replacementCost) },
    { label: `STD Benefit Payments (${fmt(num(inputs.stdBenefitPct), 1)}%)`, value: fmtMoney(result.stdBenefitCost) },
    { label: `Overtime Premium (${fmt(num(inputs.overtimePct), 1)}%)`, value: fmtMoney(result.overtimeCost) },
    { label: "Admin & Compliance", value: fmtMoney(result.adminCost) },
    { label: "Total Leave Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Employee on Leave", value: fmtMoney(result.costPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees on Leave", value: fmt(num(inputs.employeesOnLeave)) },
    { label: "Weekly Wage", value: fmtMoney(num(inputs.weeklyWage)) },
    { label: "Leave Duration", value: fmt(num(inputs.leaveWeeks)) + " wks" },
    { label: "Wage Continuation", value: fmtMoney(result.wageContinuation) },
    { label: "Replacement Cost", value: fmtMoney(result.replacementCost) },
    { label: "STD Benefit Cost", value: fmtMoney(result.stdBenefitCost) },
    { label: "Overtime Premium", value: fmtMoney(result.overtimeCost) },
    { label: "Admin & Compliance", value: fmtMoney(result.adminCost) },
    { label: "Total Leave Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Disability Leave Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Disability Leave Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dlc-count" label="Employees on Leave" value={inputs.employeesOnLeave} onChange={set("employeesOnLeave")} suffix="employees" />
              <NumInput id="dlc-wage" label="Average Weekly Wage" value={inputs.weeklyWage} onChange={set("weeklyWage")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dlc-weeks" label="Leave Duration" value={inputs.leaveWeeks} onChange={set("leaveWeeks")} suffix="weeks" />
              <NumInput id="dlc-replacement" label="Replacement Worker Cost" value={inputs.replacementPct} onChange={set("replacementPct")} suffix="% of wage" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Benefits & Administration</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="dlc-std" label="Employer STD Benefit" value={inputs.stdBenefitPct} onChange={set("stdBenefitPct")} suffix="% of wage" />
                    <NumInput id="dlc-overtime" label="Overtime Premium" value={inputs.overtimePct} onChange={set("overtimePct")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="dlc-admin" label="Admin & Compliance per Case" value={inputs.adminPerCase} onChange={set("adminPerCase")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; replacement cost must be between 0 and 200%; benefit and overtime rates must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Disability Leave Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerEmployee)} per employee across {fmt(num(inputs.employeesOnLeave))} leave cases</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Wage Continuation</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.wageContinuation)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Replacement Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.replacementCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Employee</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerEmployee)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Leave Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Disability Leave Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A disability leave cost calculator estimates the total expense an employer carries when an employee is out of work on short-term disability leave. When an employee goes on disability leave, the employer does not simply stop paying and wait for their return; it continues paying wages or benefits, it hires or schedules replacement coverage for the work that still needs to be done, it administers the leave case, and it often pays the disability benefit itself. Each of these obligations has a real dollar cost, and together they can make a single leave case surprisingly expensive. This calculator builds the complete picture from the leave cases, the employee's wage, and the duration of the leave, then adds the replacement, benefit, overtime, and administrative costs that attach to each case. The result is a total leave cost and a cost per employee that give HR and finance the number they need for budgeting, self-insured benefit planning, and return-to-work program evaluation.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. The number of employees on leave and the average weekly wage define the scale of the cases, and the leave duration in weeks defines how long the costs run. The wage continuation cost is the employees on leave multiplied by the weekly wage and the leave duration, reflecting the pay the employer continues during the leave. The replacement worker cost is that same wage continuation multiplied by the percentage of the wage needed to cover the work with temporary staff or overtime, and it reflects the reality that the work still has to be done while the employee is out. With the default inputs, five employees at $1,200 a week on twelve-week leaves carry $72,000 of wage continuation and $64,800 of replacement cost at a 90% replacement rate.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the remaining layers. The employer STD benefit is the percentage of wages the employer pays through its short-term disability plan while the employee is out, which for self-insured employers is a direct cost. The overtime premium is the additional percentage paid when remaining staff cover the absent employee's work at overtime rates. The admin and compliance cost per case covers leave administration, coordination with the insurer, and compliance paperwork. Summing the wage continuation, replacement cost, STD benefit, overtime premium, and admin cost gives the total leave cost, and dividing by the number of cases gives the cost per employee. With the default inputs, the complete picture comes to about $194,700 for the five cases, roughly $38,940 per employee, with wage continuation, replacement coverage, and STD benefits each contributing a substantial share.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total disability leave cost, and the cost per employee on leave is the figure to use when budgeting for future leave, because it can be multiplied by expected case counts to size a reserve. The breakdown reveals where the money goes: wage continuation and replacement coverage usually dominate, which is why return-to-work programs that bring employees back in modified or part-time roles can cut leave costs dramatically, and why cross-training reduces the premium paid for replacement coverage. For self-insured employers, the STD benefit line is a direct claims cost that should be compared against the cost of insured coverage, and the admin line highlights the value of streamlined leave administration. Track the cost per case over time, because rising weekly wages and longer average leaves will show up here first. Use the calculator before finalizing disability coverage decisions, so the cost of the benefit structure is known rather than discovered after the claims arrive.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/disability-leave-cost-calculator" />
        </div>
      </div>
    </>
  );
}