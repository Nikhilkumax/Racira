"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  hires: string;
  recruitingCost: string;
  salary: string;
  rampWeeks: string;
  rampPct: string;
  trainingCost: string;
  adminHours: string;
  mgrRate: string;
  benefitsPct: string;
}

interface Result {
  rampUpCost: number;
  adminCost: number;
  benefitsCost: number;
  totalCost: number;
  costPerHire: number;
  firstYearCost: number;
  rampLossPerHire: number;
}

const DEFAULTS: Inputs = {
  hires: "10",
  recruitingCost: "35000",
  salary: "68000",
  rampWeeks: "12",
  rampPct: "50",
  trainingCost: "25000",
  adminHours: "15",
  mgrRate: "55",
  benefitsPct: "30",
};

function calculate(inputs: Inputs): Result {
  const hires = Math.max(0, parseFloat(inputs.hires) || 0);
  const recruitingCost = Math.max(0, parseFloat(inputs.recruitingCost) || 0);
  const salary = Math.max(0, parseFloat(inputs.salary) || 0);
  const rampWeeks = Math.max(0, parseFloat(inputs.rampWeeks) || 0);
  const rampPct = Math.min(100, Math.max(0, parseFloat(inputs.rampPct) || 0));
  const trainingCost = Math.max(0, parseFloat(inputs.trainingCost) || 0);
  const adminHours = Math.max(0, parseFloat(inputs.adminHours) || 0);
  const mgrRate = Math.max(0, parseFloat(inputs.mgrRate) || 0);
  const benefitsPct = Math.min(100, Math.max(0, parseFloat(inputs.benefitsPct) || 0));

  const weeklyWage = salary / 52;
  const rampUpCost = hires * rampWeeks * weeklyWage * (rampPct / 100);
  const adminCost = hires * adminHours * mgrRate;
  const benefitsCost = salary * (benefitsPct / 100) * hires;
  const totalCost = recruitingCost + rampUpCost + trainingCost + adminCost + benefitsCost;
  const costPerHire = hires > 0 ? totalCost / hires : 0;
  const firstYearCost = salary + benefitsCost / hires + costPerHire;
  const rampLossPerHire = hires > 0 ? rampUpCost / hires : 0;

  return { rampUpCost, adminCost, benefitsCost, totalCost, costPerHire, firstYearCost, rampLossPerHire };
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

export default function NewHireCostCalculator() {
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
    num(inputs.hires) < 0 ||
    num(inputs.recruitingCost) < 0 ||
    num(inputs.salary) < 0 ||
    num(inputs.rampWeeks) < 0 ||
    num(inputs.rampPct) < 0 || num(inputs.rampPct) > 100 ||
    num(inputs.trainingCost) < 0 ||
    num(inputs.adminHours) < 0 ||
    num(inputs.mgrRate) < 0 ||
    num(inputs.benefitsPct) < 0 || num(inputs.benefitsPct) > 100;

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
    { label: "Hires", value: fmt(num(inputs.hires)) },
    { label: "Recruiting & Advertising", value: fmtMoney(num(inputs.recruitingCost)) },
    { label: `Ramp-Up Productivity Loss (${fmt(num(inputs.rampWeeks))} wks at ${fmt(num(inputs.rampPct), 1)}%)`, value: fmtMoney(result.rampUpCost) },
    { label: "Onboarding & Training", value: fmtMoney(num(inputs.trainingCost)) },
    { label: "Administrative Setup", value: fmtMoney(result.adminCost) },
    { label: `Benefits (${fmt(num(inputs.benefitsPct), 1)}% of salary)`, value: fmtMoney(result.benefitsCost) },
    { label: "Total New Hire Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Hire", value: fmtMoney(result.costPerHire), highlight: true },
  ];

  const summaryStats = [
    { label: "Hires", value: fmt(num(inputs.hires)) },
    { label: "Recruiting & Advertising", value: fmtMoney(num(inputs.recruitingCost)) },
    { label: "Ramp-Up Loss", value: fmtMoney(result.rampUpCost) },
    { label: "Onboarding & Training", value: fmtMoney(num(inputs.trainingCost)) },
    { label: "Admin Setup", value: fmtMoney(result.adminCost) },
    { label: "Benefits Cost", value: fmtMoney(result.benefitsCost) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Hire", value: fmtMoney(result.costPerHire) },
    { label: "Ramp-Up Loss / Hire", value: fmtMoney(result.rampLossPerHire) },
    { label: "Salary", value: fmtMoney(num(inputs.salary)) },
    { label: "First-Year Cost / Hire", value: fmtMoney(result.firstYearCost) },
    { label: "Ramp Period", value: fmt(num(inputs.rampWeeks)) + " weeks" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "New Hire Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">New Hire Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="nh-hires" label="Number of Hires" value={inputs.hires} onChange={set("hires")} suffix="people" />
              <NumInput id="nh-recruiting" label="Recruiting & Advertising" value={inputs.recruitingCost} onChange={set("recruitingCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="nh-salary" label="Average Annual Salary" value={inputs.salary} onChange={set("salary")} prefix="$" />
              <NumInput id="nh-ramp-weeks" label="Ramp-Up Period" value={inputs.rampWeeks} onChange={set("rampWeeks")} suffix="weeks" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Productivity & Setup</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="nh-ramp-pct" label="Productivity Loss During Ramp" value={inputs.rampPct} onChange={set("rampPct")} suffix="%" />
                    <NumInput id="nh-training" label="Onboarding & Training" value={inputs.trainingCost} onChange={set("trainingCost")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="nh-admin" label="Admin Hours / Hire" value={inputs.adminHours} onChange={set("adminHours")} suffix="hrs" />
                    <NumInput id="nh-mgr" label="Manager Hourly Rate" value={inputs.mgrRate} onChange={set("mgrRate")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="nh-benefits" label="Benefits & Payroll Taxes" value={inputs.benefitsPct} onChange={set("benefitsPct")} suffix="% of salary" />
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total New Hire Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerHire)} per hire — {fmtMoney(result.firstYearCost)} first-year cost per hire</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Hire</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerHire)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ramp-Up Loss</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.rampUpCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Benefits Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.benefitsCost)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">New Hire Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a New Hire Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A new hire cost calculator estimates the full expense of bringing a new employee into the organization, beyond the salary line in the budget. The visible costs are recruiting, advertising, and training, but the largest hidden cost is the ramp-up period, when a new hire is paid full wages while producing a fraction of the output of an experienced employee. Add the administrative work of equipment, accounts, and onboarding, and the benefits and payroll taxes that begin on day one, and the true cost of a hire routinely reaches 30% to 100% of the annual salary. This calculator assembles all of those components: recruiting, ramp-up productivity loss, onboarding and training, administrative setup, and benefits, then reports the total, the cost per hire, and the true first-year cost that should inform staffing and retention decisions.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The ramp-up period and productivity loss percentage together define the productivity curve assumption: a twelve-week ramp at a 50% loss implies the new hire averages half productivity over the entire period, which is a realistic middle ground between roles that reach full output in weeks and technical roles that take a year or more. The benefits percentage is the employer's payroll tax and insurance burden applied to salary, and it should match your actual benefits load rather than a default, since it compounds across every hire. The administrative hours input captures the setup work that is invisible in most budgets, including equipment provisioning, system access, compliance paperwork, and payroll setup, valued at the manager rate because managers supervise most of it. The first-year cost output, which adds salary and benefits to the one-time cost, is the figure that belongs in headcount budgeting, because a hire is a multi-year commitment priced at its first-year total.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of hires, the total recruiting and advertising cost, the average annual salary, and the ramp-up period in weeks. The ramp-up cost multiplies the hires by the ramp weeks and the weekly wage, then applies the productivity loss percentage: with the default inputs, ten hires at a $68,000 salary ramping for twelve weeks at a 50% loss carry $78,462 of lost output. The advanced options refine the estimate with the productivity loss percentage, the onboarding and training cost, the administrative hours per hire valued at the manager hourly rate, and the benefits and payroll tax percentage applied to the salary. With the default settings, ten hires total roughly $246,000, or about $24,600 per hire, before the salary itself. The cost per hire divides the total by the headcount, and the first-year cost adds the salary and per-hire benefits to the per-hire cost, giving the figure that belongs in a full-time-equivalent budget.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The cost per hire is the benchmark to compare against industry surveys and against the cost of alternatives such as overtime, contractors, or retention bonuses for existing staff. The ramp-up loss is usually the largest hidden line, and it is the number to attack with structured onboarding, mentorship, and earlier hands-on work. The first-year cost per hire is the number to use when projecting headcount growth, since it captures what a new position truly consumes in its first twelve months. If the benefits percentage seems high, check whether it includes the employer's full payroll tax and insurance share, which are easy to understate. Re-run the calculator with different ramp assumptions to quantify how much faster onboarding saves, and track actual ramp times against the estimate.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="new-hire-cost-calculator" />
        </div>
      </div>
    </>
  );
}