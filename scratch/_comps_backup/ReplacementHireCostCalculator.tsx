"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  annualSalary: string;
  recruitingCost: string;
  timeToFill: string;
  trainingWeeks: string;
  vacancyPct: string;
  rampWeeks: string;
  rampProductivity: string;
  adminCost: string;
}

interface Result {
  recruitingCost: number;
  vacancyLoss: number;
  rampUpLoss: number;
  trainingCost: number;
  adminCost: number;
  totalCost: number;
  costPerHire: number;
  weeksUntilFullProductivity: number;
}

const DEFAULTS: Inputs = {
  annualSalary: "75000",
  recruitingCost: "5000",
  timeToFill: "6",
  trainingWeeks: "4",
  vacancyPct: "50",
  rampWeeks: "12",
  rampProductivity: "60",
  adminCost: "3000",
};

function calculate(inputs: Inputs): Result {
  const annualSalary = Math.max(0, parseFloat(inputs.annualSalary) || 0);
  const recruitingCost = Math.max(0, parseFloat(inputs.recruitingCost) || 0);
  const timeToFill = Math.max(0, parseFloat(inputs.timeToFill) || 0);
  const trainingWeeks = Math.max(0, parseFloat(inputs.trainingWeeks) || 0);
  const vacancyPct = Math.min(200, Math.max(0, parseFloat(inputs.vacancyPct) || 0));
  const rampWeeks = Math.max(0, parseFloat(inputs.rampWeeks) || 0);
  const rampProductivity = Math.min(100, Math.max(0, parseFloat(inputs.rampProductivity) || 0));
  const adminCost = Math.max(0, parseFloat(inputs.adminCost) || 0);

  const weeklySalary = annualSalary / 52;
  const vacancyLoss = weeklySalary * timeToFill * (vacancyPct / 100);
  const rampUpLoss = weeklySalary * rampWeeks * (1 - rampProductivity / 100);
  const trainingCost = weeklySalary * trainingWeeks;
  const totalCost = recruitingCost + vacancyLoss + rampUpLoss + trainingCost + adminCost;
  const costPerHire = totalCost;
  const weeksUntilFullProductivity = timeToFill + rampWeeks;

  return { recruitingCost, vacancyLoss, rampUpLoss, trainingCost, adminCost, totalCost, costPerHire, weeksUntilFullProductivity };
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

export default function ReplacementHireCostCalculator() {
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
    num(inputs.annualSalary) < 0 ||
    num(inputs.recruitingCost) < 0 ||
    num(inputs.timeToFill) < 0 ||
    num(inputs.trainingWeeks) < 0 ||
    num(inputs.vacancyPct) < 0 || num(inputs.vacancyPct) > 200 ||
    num(inputs.rampWeeks) < 0 ||
    num(inputs.rampProductivity) < 0 || num(inputs.rampProductivity) > 100 ||
    num(inputs.adminCost) < 0;

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
    { label: "Recruiting & Advertising", value: fmtMoney(result.recruitingCost) },
    { label: `Lost Productivity While Vacant (${fmt(num(inputs.timeToFill))} wks @ ${fmt(num(inputs.vacancyPct), 1)}%)`, value: fmtMoney(result.vacancyLoss) },
    { label: `Ramp-Up Productivity Loss (${fmt(num(inputs.rampWeeks))} wks @ ${fmt(100 - num(inputs.rampProductivity), 1)}% gap)`, value: fmtMoney(result.rampUpLoss) },
    { label: `Training Cost (${fmt(num(inputs.trainingWeeks))} wks)`, value: fmtMoney(result.trainingCost) },
    { label: "Admin & Onboarding", value: fmtMoney(result.adminCost) },
    { label: "Total Replacement Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Weeks to Full Productivity", value: fmt(result.weeksUntilFullProductivity) + " wks", highlight: true },
  ];

  const summaryStats = [
    { label: "Annual Salary", value: fmtMoney(num(inputs.annualSalary)) },
    { label: "Recruiting & Advertising", value: fmtMoney(result.recruitingCost) },
    { label: "Time to Fill", value: fmt(num(inputs.timeToFill)) + " wks" },
    { label: "Vacant Loss", value: fmtMoney(result.vacancyLoss) },
    { label: "Ramp-Up Loss", value: fmtMoney(result.rampUpLoss) },
    { label: "Training Cost", value: fmtMoney(result.trainingCost) },
    { label: "Admin & Onboarding", value: fmtMoney(result.adminCost) },
    { label: "Weeks to Full Productivity", value: fmt(result.weeksUntilFullProductivity) + " wks" },
    { label: "Total Replacement Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Hire", value: fmtMoney(result.costPerHire) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Replacement Hire Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Replacement Hire Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rh-salary" label="Annual Salary" value={inputs.annualSalary} onChange={set("annualSalary")} prefix="$" />
              <NumInput id="rh-recruiting" label="Recruiting & Advertising" value={inputs.recruitingCost} onChange={set("recruitingCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rh-fill" label="Time to Fill" value={inputs.timeToFill} onChange={set("timeToFill")} suffix="weeks" />
              <NumInput id="rh-training" label="Training Time" value={inputs.trainingWeeks} onChange={set("trainingWeeks")} suffix="weeks" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Productivity & Coverage</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="rh-vacancy" label="Work Uncovered While Vacant" value={inputs.vacancyPct} onChange={set("vacancyPct")} suffix="%" />
                    <NumInput id="rh-ramp-weeks" label="Ramp-Up Duration" value={inputs.rampWeeks} onChange={set("rampWeeks")} suffix="weeks" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="rh-ramp-pct" label="Ramp-Up Productivity" value={inputs.rampProductivity} onChange={set("rampProductivity")} suffix="% of full" />
                    <NumInput id="rh-admin" label="Admin & Onboarding" value={inputs.adminCost} onChange={set("adminCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; vacancy coverage must be between 0 and 200%; ramp productivity must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Replacement Hire Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerHire)} per hire · {fmt(result.weeksUntilFullProductivity)} weeks to full productivity</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Recruiting</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.recruitingCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Vacant Loss</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.vacancyLoss)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ramp-Up Loss</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.rampUpLoss)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Replacement Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Replacement Hire Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A replacement hire cost calculator estimates the full expense of filling a position after an employee leaves, and it is one of the most frequently understated numbers in HR budgeting. Most organizations track the recruiting spend, and some track training, but very few account for the productivity lost while the position sits vacant and the productivity gap that persists while the new hire ramps up to full output. This calculator assembles the complete picture: the recruiting and advertising spend, the work that goes uncovered during the time to fill, the training time invested in the new employee, the productivity shortfall during the ramp-up period, and the administrative and onboarding overhead. The result is the true replacement cost per hire, along with the total time from the day the position opens until the new employee reaches full productivity. Used consistently, it turns hiring from an expense line that feels negotiable into a measurable investment with a real price tag attached to every departure.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator works from four core inputs. The annual salary anchors every cost component that scales with pay, the recruiting and advertising spend captures the direct sourcing cost, the time to fill captures how many weeks the work goes without the position being staffed, and the training time captures how many weeks of the new hire's pay is invested before they are fully productive. The lost productivity while vacant is the weekly salary multiplied by the time to fill and the percentage of the work that goes uncovered, so with the default inputs, a $75,000 role paying $1,442 a week that sits vacant for six weeks at 50% coverage carries about $4,327 in lost productivity. The training cost is simply the weekly salary multiplied by the training weeks, which adds another $5,769 with the default four-week training period.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section refines the picture with the ramp-up and coverage details. The percentage of work uncovered while vacant reflects how much of the departed employee's workload must be absorbed elsewhere or simply drops, and the ramp-up duration with its productivity level captures the gradual climb back to full output, where the cost is the weekly salary times the ramp weeks times the productivity gap. The admin and onboarding cost covers background checks, equipment, and HR processing. Adding every component together yields the total replacement cost of roughly $24,900 for the default scenario, a figure that is roughly one-third of the annual salary and entirely invisible in a budget that only tracks recruiting fees. The weeks to full productivity line shows how long the position remains a drag on output even after it is filled.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total replacement hire cost, and the breakdown table shows which components drive it so you know where to focus. Long vacancy losses point at slow recruiting pipelines or overly narrow job requirements; large ramp-up losses point at weak onboarding programs, which are among the cheapest areas to improve because structured onboarding measurably shortens time to full productivity. Compare the result with the cost of retention programs, because reducing avoidable turnover is the most direct way to cut replacement costs. Use the calculator when budgeting for the year, when an unexpected departure hits a critical role, or when evaluating an offer to a candidate where the full cost of the hire needs to be explicit. Track the results across hires to build a data set of what different roles actually cost to replace, and use the weeks to full productivity figure to set realistic expectations with managers about when a new hire will carry their own weight.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/replacement-hire-cost-calculator" />
        </div>
      </div>
    </>
  );
}