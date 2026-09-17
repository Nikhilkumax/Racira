"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  avgSalary: string;
  sickDays: string;
  coveragePct: string;
  workdaysPerYear: string;
  adminPerDay: string;
  productivityRecovery: string;
}

interface Result {
  dailyRate: number;
  paidWages: number;
  coverageCost: number;
  adminCost: number;
  recoveryCost: number;
  totalCost: number;
  costPerDay: number;
}

const DEFAULTS: Inputs = {
  employees: "120",
  avgSalary: "58000",
  sickDays: "6",
  coveragePct: "70",
  workdaysPerYear: "240",
  adminPerDay: "150",
  productivityRecovery: "15",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const avgSalary = Math.max(0, parseFloat(inputs.avgSalary) || 0);
  const sickDays = Math.max(0, parseFloat(inputs.sickDays) || 0);
  const coveragePct = Math.min(200, Math.max(0, parseFloat(inputs.coveragePct) || 0));
  const workdaysPerYear = Math.max(1, parseFloat(inputs.workdaysPerYear) || 1);
  const adminPerDay = Math.max(0, parseFloat(inputs.adminPerDay) || 0);
  const productivityRecovery = Math.min(100, Math.max(0, parseFloat(inputs.productivityRecovery) || 0));

  const dailyRate = avgSalary / workdaysPerYear;
  const paidWages = employees * sickDays * dailyRate;
  const coverageCost = paidWages * (coveragePct / 100);
  const adminCost = employees * sickDays * adminPerDay;
  const recoveryCost = paidWages * (productivityRecovery / 100);
  const totalCost = paidWages + coverageCost + adminCost + recoveryCost;
  const costPerDay = employees * sickDays > 0 ? totalCost / (employees * sickDays) : 0;

  return { dailyRate, paidWages, coverageCost, adminCost, recoveryCost, totalCost, costPerDay };
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

export default function SickDayCostCalculator() {
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
    num(inputs.sickDays) < 0 ||
    num(inputs.coveragePct) < 0 || num(inputs.coveragePct) > 200 ||
    num(inputs.workdaysPerYear) <= 0 ||
    num(inputs.adminPerDay) < 0 ||
    num(inputs.productivityRecovery) < 0 || num(inputs.productivityRecovery) > 100;

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
    { label: `Sick Days / Employee / Year`, value: fmt(num(inputs.sickDays)) + " days" },
    { label: `Paid Wages (${fmtMoney(result.dailyRate)}/day)`, value: fmtMoney(result.paidWages) },
    { label: `Temporary Coverage (${fmt(num(inputs.coveragePct), 1)}%)`, value: fmtMoney(result.coverageCost) },
    { label: "Administrative Cost", value: fmtMoney(result.adminCost) },
    { label: `Return-to-Work Dip (${fmt(num(inputs.productivityRecovery), 1)}%)`, value: fmtMoney(result.recoveryCost) },
    { label: "Total Sick Day Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Sick Day", value: fmtMoney(result.costPerDay), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees", value: fmt(num(inputs.employees)) },
    { label: "Average Salary", value: fmtMoney(num(inputs.avgSalary)) },
    { label: "Sick Days / EE / Year", value: fmt(num(inputs.sickDays)) },
    { label: "Daily Rate", value: fmtMoney(result.dailyRate) },
    { label: "Paid Wages", value: fmtMoney(result.paidWages) },
    { label: "Temporary Coverage", value: fmtMoney(result.coverageCost) },
    { label: "Admin Cost", value: fmtMoney(result.adminCost) },
    { label: "Return-to-Work Dip", value: fmtMoney(result.recoveryCost) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Sick Day", value: fmtMoney(result.costPerDay) },
    { label: "Total Sick Days", value: fmt(num(inputs.employees) * num(inputs.sickDays)) },
    { label: "Cost per Employee", value: fmtMoney(result.totalCost / Math.max(1, num(inputs.employees))) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Sick Day Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sick Day Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sd-employees" label="Number of Employees" value={inputs.employees} onChange={set("employees")} suffix="people" />
              <NumInput id="sd-salary" label="Average Annual Salary" value={inputs.avgSalary} onChange={set("avgSalary")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sd-days" label="Sick Days / Employee" value={inputs.sickDays} onChange={set("sickDays")} suffix="days/yr" />
              <NumInput id="sd-coverage" label="Temporary Coverage" value={inputs.coveragePct} onChange={set("coveragePct")} suffix="% of wage" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Administration & Recovery</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="sd-workdays" label="Workdays per Year" value={inputs.workdaysPerYear} onChange={set("workdaysPerYear")} suffix="days" />
                    <NumInput id="sd-admin" label="Admin Cost per Sick Day" value={inputs.adminPerDay} onChange={set("adminPerDay")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="sd-recovery" label="Return-to-Work Productivity Dip" value={inputs.productivityRecovery} onChange={set("productivityRecovery")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; workdays must be greater than zero; percentages between 0 and 200 for coverage and 0 and 100 otherwise.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Sick Day Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerDay)} per sick day — {fmtMoney(result.totalCost / Math.max(1, num(inputs.employees)))} per employee</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Paid Wages</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.paidWages)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Coverage Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.coverageCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Day</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerDay)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Sick Day Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Sick Day Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A sick day cost calculator estimates the total expense a company carries when employees take sick leave, and it is a foundation of absence-management analysis. The most visible component is the wages paid to employees who are not producing, which most employers continue either through paid sick leave policies or state and local mandates. Beyond that, the cost includes temporary coverage for the absent work, the administrative effort of tracking and documenting absences, and the productivity dip employees often experience in the days after returning, as they catch up and recover. The average worker takes several sick days a year, and the fully loaded cost of each day is typically two to three times the daily wage. This calculator values every component and reports the total annual sick day cost, the cost per sick day, and the per-employee burden that belongs in workforce planning.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The paid wages component reflects the reality that most sick leave is paid, either through employer sick time policies or through the growing number of state and local paid sick leave mandates, so the model treats sick days as paid days and values them at the daily rate rather than assuming unpaid leave. The temporary coverage percentage captures how the work is covered, and it can exceed 100% for roles that require agency staff at premium rates, which is why the input allows values up to 200%. The return-to-work productivity dip is a component most absence models omit: employees returning from illness often operate at reduced output for a day or two as they catch up on missed work and recover fully, and applying a percentage of the paid wages to that effect keeps the estimate honest. The cost per sick day output is the number to compare against prevention programs, since each prevented sick day is worth the full daily cost to the organization.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of employees, the average annual salary, the average sick days per employee per year, and the temporary coverage percentage. The daily rate divides the salary by the workdays per year, and the paid wages multiply the daily rate by the headcount and the sick days, reflecting pay that continues while the employee is out. With the default inputs, 120 employees at a $58,000 salary taking six sick days a year carry $174,000 of paid wages at a $242 daily rate, and a 70% coverage rate adds $121,800 of temporary staffing cost. The advanced options refine the estimate with the actual workdays per year, the administrative cost per sick day for tracking and compliance, and the return-to-work productivity dip, which is applied as a percentage of the paid wages to capture the catch-up period. The total is the sum of the four components, the cost per sick day divides it by the total sick days, and the per-employee figure divides it by the headcount.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The cost per sick day is the number to compare against the cost of prevention: flu shot programs, ergonomic improvements, and mental health support all pay for themselves if they prevent even a fraction of the annual sick days. The per-employee figure is the benchmark for industry comparisons and for projecting the financial impact of a flu season or a change in sick leave policy. If temporary coverage dominates the total, cross-training within teams reduces the need for paid external coverage; if the return-to-work dip is large, structured reboarding after longer absences can shorten it. Re-run the calculator quarterly with actual absence data to track trends, and remember that the coverage and recovery percentages are assumptions you can tune to your operations.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="sick-day-cost-calculator" />
        </div>
      </div>
    </>
  );
}