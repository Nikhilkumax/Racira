"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  avgSalary: string;
  absenceDays: string;
  replacementPct: string;
  workdaysPerYear: string;
  adminPerAbsence: string;
  overtimePct: string;
}

interface Result {
  dailyRate: number;
  wageCost: number;
  replacementCost: number;
  adminCost: number;
  overtimeCost: number;
  totalCost: number;
  costPerEmployee: number;
}

const DEFAULTS: Inputs = {
  employees: "100",
  avgSalary: "60000",
  absenceDays: "5",
  replacementPct: "80",
  workdaysPerYear: "240",
  adminPerAbsence: "400",
  overtimePct: "15",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const avgSalary = Math.max(0, parseFloat(inputs.avgSalary) || 0);
  const absenceDays = Math.max(0, parseFloat(inputs.absenceDays) || 0);
  const replacementPct = Math.min(200, Math.max(0, parseFloat(inputs.replacementPct) || 0));
  const workdaysPerYear = Math.max(1, parseFloat(inputs.workdaysPerYear) || 1);
  const adminPerAbsence = Math.max(0, parseFloat(inputs.adminPerAbsence) || 0);
  const overtimePct = Math.min(100, Math.max(0, parseFloat(inputs.overtimePct) || 0));

  const dailyRate = avgSalary / workdaysPerYear;
  const wageCost = employees * absenceDays * dailyRate;
  const replacementCost = wageCost * (replacementPct / 100);
  const adminCost = employees * absenceDays * adminPerAbsence;
  const overtimeCost = wageCost * (overtimePct / 100);
  const totalCost = wageCost + replacementCost + adminCost + overtimeCost;
  const costPerEmployee = employees > 0 ? totalCost / employees : 0;

  return { dailyRate, wageCost, replacementCost, adminCost, overtimeCost, totalCost, costPerEmployee };
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

export default function AbsenteeismCostCalculator() {
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
    num(inputs.employees) < 0 ||
    num(inputs.avgSalary) < 0 ||
    num(inputs.absenceDays) < 0 ||
    num(inputs.replacementPct) < 0 || num(inputs.replacementPct) > 200 ||
    num(inputs.workdaysPerYear) <= 0 ||
    num(inputs.adminPerAbsence) < 0 ||
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
    { label: "Employees", value: fmt(num(inputs.employees)) },
    { label: `Daily Pay Rate (${fmt(num(inputs.workdaysPerYear))} workdays)`, value: fmtMoney(result.dailyRate) },
    { label: `Absence Days / Employee / Year`, value: fmt(num(inputs.absenceDays)) + " days" },
    { label: "Wages Paid While Absent", value: fmtMoney(result.wageCost) },
    { label: `Replacement Coverage (${fmt(num(inputs.replacementPct), 1)}%)`, value: fmtMoney(result.replacementCost) },
    { label: "Administrative Cost", value: fmtMoney(result.adminCost) },
    { label: `Overtime Premium (${fmt(num(inputs.overtimePct), 1)}%)`, value: fmtMoney(result.overtimeCost) },
    { label: "Total Absenteeism Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees", value: fmt(num(inputs.employees)) },
    { label: "Average Salary", value: fmtMoney(num(inputs.avgSalary)) },
    { label: "Absence Days / EE / Year", value: fmt(num(inputs.absenceDays)) },
    { label: "Daily Pay Rate", value: fmtMoney(result.dailyRate) },
    { label: "Wages While Absent", value: fmtMoney(result.wageCost) },
    { label: "Replacement Coverage", value: fmtMoney(result.replacementCost) },
    { label: "Administrative Cost", value: fmtMoney(result.adminCost) },
    { label: "Overtime Premium", value: fmtMoney(result.overtimeCost) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee) },
    { label: "Total Absence Days", value: fmt(num(inputs.employees) * num(inputs.absenceDays)) },
    { label: "Monthly Cost", value: fmtMoney(result.totalCost / 12) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Absenteeism Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Absenteeism Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ac-employees" label="Number of Employees" value={inputs.employees} onChange={set("employees")} suffix="people" />
              <NumInput id="ac-salary" label="Average Annual Salary" value={inputs.avgSalary} onChange={set("avgSalary")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ac-days" label="Absence Days / Employee" value={inputs.absenceDays} onChange={set("absenceDays")} suffix="days/yr" />
              <NumInput id="ac-replacement" label="Replacement Coverage" value={inputs.replacementPct} onChange={set("replacementPct")} suffix="% of wage" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Coverage & Administration</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ac-workdays" label="Workdays per Year" value={inputs.workdaysPerYear} onChange={set("workdaysPerYear")} suffix="days" />
                    <NumInput id="ac-admin" label="Admin Cost per Absence Day" value={inputs.adminPerAbsence} onChange={set("adminPerAbsence")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="ac-overtime" label="Overtime Premium" value={inputs.overtimePct} onChange={set("overtimePct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; workdays must be greater than zero; replacement cost must be between 0 and 200%; overtime between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Absenteeism Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerEmployee)} per employee across {fmt(num(inputs.employees) * num(inputs.absenceDays))} absence days</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Wages While Absent</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.wageCost)}</span>
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
                    <th className="py-2.5 pl-4 pr-3">Absenteeism Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Absenteeism Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An absenteeism cost calculator estimates the annual expense a business carries when employees are absent from work, whether for illness, injury, family obligations, or other reasons. The visible cost is the wages paid to employees who are not producing, but the full bill also includes the temporary replacements or agency staff needed to cover the work, the administrative effort of managing absences, and the overtime premium paid to remaining team members who pick up the slack. Absence rates of five or more days per employee per year are common, and at scale the total can reach millions of dollars. This calculator values each component: the daily pay rate multiplied by the absence days for the wage cost, a percentage of that wage cost for replacement coverage, a flat per-day administrative charge, and an overtime premium, producing a total and a per-employee figure for benchmarking and intervention planning.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The replacement coverage percentage reflects how the work actually gets covered during an absence, which varies widely by role: some positions can be left for a day with the team absorbing the load, while others require agency staff or overtime at rates approaching or exceeding the absent employee's wage, which is why the input allows values up to 200%. The administrative cost per absence day captures scheduling, documentation, compliance filings, and coordination, and it is easy to underestimate because it is spread across managers, HR, and payroll rather than a single budget line. The overtime premium captures the extra pay earned by the team covering the gap, and it compounds with the replacement cost rather than replacing it, since coverage and overtime frequently coexist. Absence patterns are rarely uniform, so segmenting the workforce by department or absence type before running the model produces a more accurate total than a single company-wide estimate.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of employees, the average annual salary, the average absence days per employee per year, and the replacement coverage percentage. The daily pay rate divides the salary by the workdays per year, and the wage cost multiplies the daily rate by the headcount and the absence days, capturing pay that continues while no work is produced. The replacement cost is the wage cost multiplied by the replacement percentage, reflecting temporary staff, agency fees, or internal coverage at the share of the wage that coverage typically costs. With the default inputs, 100 employees at a $60,000 salary with five absence days each carry a $125,000 wage cost at a $250 daily rate, and an 80% replacement rate adds $100,000. The advanced options add the actual workdays per year, the administrative cost per absence day for scheduling, documentation, and compliance, and the overtime premium percentage. The total is the sum of the four components, and the per-employee figure divides it by the headcount.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total annual cost is the figure to present when building the business case for absence-management programs such as paid sick leave, return-to-work policies, or wellness initiatives. The cost per employee is the benchmark to compare against industry surveys, which typically report per-employee absence costs in the low thousands of dollars per year. If replacement and overtime costs dominate, cross-training and flexible staffing are the highest-leverage fixes; if the wage component dominates, the absence rate itself is the target. Track the metric quarterly: a modest reduction of one absence day per employee can save tens of thousands of dollars at mid-size companies. Remember that this estimate assumes the replacement and overtime percentages you enter, so tune them to your actual coverage practices.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="absenteeism-cost-calculator" />
        </div>
      </div>
    </>
  );
}