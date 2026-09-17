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
  benefitsPerCase: string;
  adminPerCase: string;
  overtimePct: string;
}

interface Result {
  wageContinuation: number;
  replacementCost: number;
  benefitsCost: number;
  adminCost: number;
  overtimeCost: number;
  totalCost: number;
  costPerEmployee: number;
}

const DEFAULTS: Inputs = {
  employeesOnLeave: "4",
  weeklyWage: "1400",
  leaveWeeks: "8",
  replacementPct: "90",
  benefitsPerCase: "1600",
  adminPerCase: "1200",
  overtimePct: "10",
};

function calculate(inputs: Inputs): Result {
  const employeesOnLeave = Math.max(0, parseFloat(inputs.employeesOnLeave) || 0);
  const weeklyWage = Math.max(0, parseFloat(inputs.weeklyWage) || 0);
  const leaveWeeks = Math.max(0, parseFloat(inputs.leaveWeeks) || 0);
  const replacementPct = Math.min(200, Math.max(0, parseFloat(inputs.replacementPct) || 0));
  const benefitsPerCase = Math.max(0, parseFloat(inputs.benefitsPerCase) || 0);
  const adminPerCase = Math.max(0, parseFloat(inputs.adminPerCase) || 0);
  const overtimePct = Math.min(100, Math.max(0, parseFloat(inputs.overtimePct) || 0));

  const wageContinuation = employeesOnLeave * weeklyWage * leaveWeeks;
  const replacementCost = wageContinuation * (replacementPct / 100);
  const benefitsCost = employeesOnLeave * benefitsPerCase;
  const adminCost = employeesOnLeave * adminPerCase;
  const overtimeCost = wageContinuation * (overtimePct / 100);
  const totalCost = wageContinuation + replacementCost + benefitsCost + adminCost + overtimeCost;
  const costPerEmployee = employeesOnLeave > 0 ? totalCost / employeesOnLeave : 0;

  return { wageContinuation, replacementCost, benefitsCost, adminCost, overtimeCost, totalCost, costPerEmployee };
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

export default function FmlaLeaveCostCalculator() {
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
    num(inputs.benefitsPerCase) < 0 ||
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
    { label: "Employees on FMLA Leave", value: fmt(num(inputs.employeesOnLeave)) },
    { label: "Wage Continuation", value: fmtMoney(result.wageContinuation) },
    { label: `Replacement Worker Cost (${fmt(num(inputs.replacementPct), 1)}%)`, value: fmtMoney(result.replacementCost) },
    { label: "Benefits Continuation", value: fmtMoney(result.benefitsCost) },
    { label: "Admin & Legal Costs", value: fmtMoney(result.adminCost) },
    { label: `Overtime Premium (${fmt(num(inputs.overtimePct), 1)}%)`, value: fmtMoney(result.overtimeCost) },
    { label: "Total FMLA Leave Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Employee on Leave", value: fmtMoney(result.costPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees on Leave", value: fmt(num(inputs.employeesOnLeave)) },
    { label: "Weekly Wage", value: fmtMoney(num(inputs.weeklyWage)) },
    { label: "Leave Duration", value: fmt(num(inputs.leaveWeeks)) + " wks" },
    { label: "Wage Continuation", value: fmtMoney(result.wageContinuation) },
    { label: "Replacement Cost", value: fmtMoney(result.replacementCost) },
    { label: "Benefits Continuation", value: fmtMoney(result.benefitsCost) },
    { label: "Admin & Legal", value: fmtMoney(result.adminCost) },
    { label: "Overtime Premium", value: fmtMoney(result.overtimeCost) },
    { label: "Total Leave Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "FMLA Leave Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">FMLA Leave Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="fmla-count" label="Employees on FMLA Leave" value={inputs.employeesOnLeave} onChange={set("employeesOnLeave")} suffix="employees" />
              <NumInput id="fmla-wage" label="Average Weekly Wage" value={inputs.weeklyWage} onChange={set("weeklyWage")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="fmla-weeks" label="Leave Duration" value={inputs.leaveWeeks} onChange={set("leaveWeeks")} suffix="weeks" />
              <NumInput id="fmla-replacement" label="Replacement Worker Cost" value={inputs.replacementPct} onChange={set("replacementPct")} suffix="% of wage" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Indirect Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="fmla-benefits" label="Benefits Cost per Leave" value={inputs.benefitsPerCase} onChange={set("benefitsPerCase")} prefix="$" />
                    <NumInput id="fmla-admin" label="Admin & Legal per Case" value={inputs.adminPerCase} onChange={set("adminPerCase")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="fmla-overtime" label="Overtime Premium" value={inputs.overtimePct} onChange={set("overtimePct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; replacement cost must be between 0 and 200%; overtime must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total FMLA Leave Cost</div>
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
              <h2 className="text-2xl font-bold mb-3">What Is an FMLA Leave Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An FMLA leave cost calculator estimates the total expense an employer carries when employees take leave under the Family and Medical Leave Act. FMLA entitles eligible employees to up to twelve weeks of unpaid, job-protected leave per year for qualifying family and medical reasons, but the leave is unpaid for the employee, not free for the employer. While the employee is out, the employer continues paying the employee's share of benefits, covers the work with replacements or overtime, and manages the administrative and legal obligations of the leave. Each of these obligations costs money, and employers who treat FMLA as a zero-cost compliance matter routinely underestimate their annual leave expense. This calculator assembles the full cost of an FMLA leave event: the wages continued where policies require them, the replacement coverage for the work, the benefits that must keep running, the administrative and legal burden, and the overtime premium paid to the team covering the gap.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. The number of employees on FMLA leave and the average weekly wage define the scale of the cases, and the leave duration in weeks defines how long the costs run. The wage continuation is the employees on leave multiplied by the weekly wage and the leave duration, reflecting the pay the employer continues during the leave where company policy or state law requires it. The replacement worker cost is the wage continuation multiplied by the percentage of the wage needed to cover the work with temporary staff, and it captures the reality that the workload does not disappear when an employee does. With the default inputs, four employees at $1,400 a week on eight-week leaves carry $44,800 of wage continuation and $40,320 of replacement cost at a 90% replacement rate.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the costs that are easy to miss. The benefits cost per leave covers the employer's continued health, dental, and other benefit contributions while the employee is out. The admin and legal cost per case covers leave tracking, coordination with the insurer, and compliance with FMLA notice and certification rules. The overtime premium is the additional percentage of the wage continuation paid when remaining staff cover the absent employee's work at overtime rates. Summing all five components gives the total FMLA leave cost, and dividing by the number of cases gives the cost per employee. With the default inputs, the complete picture comes to about $100,800 for four cases, roughly $25,200 per employee, a number that is invisible in most operating budgets because it is spread across payroll, benefits, and administrative accounts.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total FMLA leave cost, and the cost per employee is the figure to multiply by your expected annual leave count to build the real FMLA line into the HR budget. The breakdown shows where the money goes and where it can be managed: cross-training reduces replacement and overtime costs, clear leave policies reduce administrative overhead, and tracking the benefit continuation line reveals how much of the cost is driven by the benefits structure rather than the leave itself. FMLA costs also follow patterns worth monitoring, because leave usage clusters in certain departments and seasons, and a calculator like this makes the cost of each pattern visible. Compare the total against the cost of leave management programs and return-to-work support, which often pay for themselves by shortening leaves. Use the calculator when planning for large leave events or when reviewing the annual HR budget, so the full cost of protected leave is explicit rather than hidden across accounts.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/fmla-leave-cost-calculator" />
        </div>
      </div>
    </>
  );
}