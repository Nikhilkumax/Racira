"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  bugsFixed: string;
  avgFixHours: string;
  devRate: string;
  criticalPct: string;
  regressionPct: string;
  downtimeCost: string;
  failureRate: string;
}

interface Result {
  laborCost: number;
  regressionCost: number;
  failureCost: number;
  totalCost: number;
  costPerBug: number;
  criticalBugs: number;
  costPerCritical: number;
}

const DEFAULTS: Inputs = {
  bugsFixed: "120",
  avgFixHours: "3.5",
  devRate: "85",
  criticalPct: "15",
  regressionPct: "10",
  downtimeCost: "25000",
  failureRate: "12",
};

function calculate(inputs: Inputs): Result {
  const bugsFixed = Math.max(0, parseFloat(inputs.bugsFixed) || 0);
  const avgFixHours = Math.max(0, parseFloat(inputs.avgFixHours) || 0);
  const devRate = Math.max(0, parseFloat(inputs.devRate) || 0);
  const criticalPct = Math.min(100, Math.max(0, parseFloat(inputs.criticalPct) || 0));
  const regressionPct = Math.min(100, Math.max(0, parseFloat(inputs.regressionPct) || 0));
  const downtimeCost = Math.max(0, parseFloat(inputs.downtimeCost) || 0);
  const failureRate = Math.min(100, Math.max(0, parseFloat(inputs.failureRate) || 0));

  const laborCost = bugsFixed * avgFixHours * devRate;
  const regressionCost = laborCost * (regressionPct / 100);
  const failureCost = laborCost * (failureRate / 100);
  const totalCost = laborCost + regressionCost + failureCost + downtimeCost;
  const costPerBug = bugsFixed > 0 ? totalCost / bugsFixed : 0;
  const criticalBugs = bugsFixed * (criticalPct / 100);
  const costPerCritical = criticalBugs > 0 ? totalCost / criticalBugs : 0;

  return { laborCost, regressionCost, failureCost, totalCost, costPerBug, criticalBugs, costPerCritical };
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

export default function BugFixCostCalculator() {
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
    num(inputs.bugsFixed) < 0 ||
    num(inputs.avgFixHours) < 0 ||
    num(inputs.devRate) < 0 ||
    num(inputs.criticalPct) < 0 || num(inputs.criticalPct) > 100 ||
    num(inputs.regressionPct) < 0 || num(inputs.regressionPct) > 100 ||
    num(inputs.downtimeCost) < 0 ||
    num(inputs.failureRate) < 0 || num(inputs.failureRate) > 100;

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
    { label: "Bugs Fixed", value: fmt(num(inputs.bugsFixed)) },
    { label: `Fix Labor (${fmt(num(inputs.bugsFixed))} × ${fmt(num(inputs.avgFixHours))} hrs × ${fmtMoney(num(inputs.devRate))})`, value: fmtMoney(result.laborCost) },
    { label: `Regression Testing (${fmt(num(inputs.regressionPct), 1)}%)`, value: fmtMoney(result.regressionCost) },
    { label: `Fix Failure / Reopened (${fmt(num(inputs.failureRate), 1)}%)`, value: fmtMoney(result.failureCost) },
    { label: "Production Downtime & User Impact", value: fmtMoney(num(inputs.downtimeCost)) },
    { label: "Total Bug Fix Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Bug Fixed", value: fmtMoney(result.costPerBug), highlight: true },
  ];

  const summaryStats = [
    { label: "Bugs Fixed", value: fmt(num(inputs.bugsFixed)) },
    { label: "Avg Fix Time", value: fmt(num(inputs.avgFixHours)) + " hrs" },
    { label: "Developer Rate", value: fmtMoney(num(inputs.devRate)) + "/hr" },
    { label: "Fix Labor Cost", value: fmtMoney(result.laborCost) },
    { label: "Regression Testing", value: fmtMoney(result.regressionCost) },
    { label: "Failure Rework", value: fmtMoney(result.failureCost) },
    { label: "Downtime Cost", value: fmtMoney(num(inputs.downtimeCost)) },
    { label: "Critical Bugs", value: fmt(result.criticalBugs, 1) },
    { label: "Cost per Critical Bug", value: fmtMoney(result.costPerCritical) },
    { label: "Total Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Bug", value: fmtMoney(result.costPerBug) },
    { label: "Fix Labor Hours", value: fmt(num(inputs.bugsFixed) * num(inputs.avgFixHours)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Bug Fix Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bug Fix Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="bfc-bugs" label="Bugs Fixed" value={inputs.bugsFixed} onChange={set("bugsFixed")} suffix="bugs" />
              <NumInput id="bfc-hours" label="Average Fix Time" value={inputs.avgFixHours} onChange={set("avgFixHours")} suffix="hrs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="bfc-rate" label="Developer Hourly Rate" value={inputs.devRate} onChange={set("devRate")} prefix="$" suffix="/hr" />
              <NumInput id="bfc-critical" label="Critical / High-Severity Bugs" value={inputs.criticalPct} onChange={set("criticalPct")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Testing & Rework</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="bfc-regression" label="Regression Testing" value={inputs.regressionPct} onChange={set("regressionPct")} suffix="% of fix cost" />
                    <NumInput id="bfc-failure" label="Fix Failure Rate" value={inputs.failureRate} onChange={set("failureRate")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="bfc-downtime" label="Downtime & User Impact" value={inputs.downtimeCost} onChange={set("downtimeCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and percentage inputs between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Bug Fix Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerBug)} per bug across {fmt(num(inputs.bugsFixed))} fixes — {fmt(result.criticalBugs, 1)} critical bugs</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fix Labor</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.laborCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Bug</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerBug)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Critical Bug</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerCritical)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Bug Fix Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Bug Fix Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A bug fix cost calculator estimates the total expense of fixing software defects, including the labor of the fixes themselves and the hidden costs that surround them. The visible cost is the developer time spent reproducing, fixing, and testing each bug, but the full bill also includes the regression testing needed to make sure a fix does not break other functionality, the rework when fixes fail or bugs are reopened, and the production impact when a bug reaches users and causes downtime or lost revenue. Software engineering research consistently finds that bugs caught late in the process cost far more than bugs prevented early, which makes the cost per bug one of the most important quality metrics a team can track. This calculator assembles the fix labor, regression testing, failure rework, and downtime impact into a total, a cost per bug, and a cost per critical bug.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of bugs fixed, the average fix time per bug, the developer hourly rate, and the percentage of bugs that are critical or high severity. The fix labor cost multiplies the bugs by the fix hours and the hourly rate: with the default inputs, 120 bugs at 3.5 hours each and $85 an hour carries a $35,700 labor cost. The advanced options add the regression testing percentage, applied to the labor cost to cover the testing effort a fix requires; the fix failure rate, which adds the rework cost when fixes do not hold; and the production downtime cost, which captures user-facing impact for the critical share of bugs. The total cost sums the labor, regression, failure, and downtime components, the cost per bug divides it by the bug count, and the cost per critical bug divides it by the critical share, showing how expensive the highest-severity defects are. With the default settings the total is roughly $76,000, or about $635 per bug.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The cost per bug is the benchmark to track over time, since a rising trend signals that bugs are getting harder to fix, which usually means the codebase is accumulating complexity, while a falling trend validates quality investments. The cost per critical bug is the number to present when arguing for prevention investment, because it is typically several times the average and it captures the downtime and user impact that ordinary defects do not. The regression and failure percentages are the levers that reflect process quality: teams with strong automated testing see low regression costs, and teams with weak code review see high failure rates. Use the total cost in sprint retrospectives to quantify the technical debt being paid, and compare it against the cost of the quality practices, such as test automation and code review, that would reduce it. Re-run the calculator quarterly with actual bug data.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="bug-fix-cost-calculator" />
        </div>
      </div>
    </>
  );
}