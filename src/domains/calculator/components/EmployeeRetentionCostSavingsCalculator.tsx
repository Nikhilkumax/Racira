"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  turnoverRate: string;
  costPerTurnover: string;
  targetTurnover: string;
  programCost: string;
  productivityPct: string;
  avgSalary: string;
}

interface Result {
  avoidedTurnover: number;
  turnoverSavings: number;
  productivitySavings: number;
  netSavings: number;
  roiPct: number;
  savingsPerEmployee: number;
}

const DEFAULTS: Inputs = {
  employees: "200",
  turnoverRate: "18",
  costPerTurnover: "45000",
  targetTurnover: "12",
  programCost: "120000",
  productivityPct: "2",
  avgSalary: "65000",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const turnoverRate = Math.min(100, Math.max(0, parseFloat(inputs.turnoverRate) || 0));
  const costPerTurnover = Math.max(0, parseFloat(inputs.costPerTurnover) || 0);
  const targetTurnover = Math.min(100, Math.max(0, parseFloat(inputs.targetTurnover) || 0));
  const programCost = Math.max(0, parseFloat(inputs.programCost) || 0);
  const productivityPct = Math.min(50, Math.max(0, parseFloat(inputs.productivityPct) || 0));
  const avgSalary = Math.max(0, parseFloat(inputs.avgSalary) || 0);

  const currentLeavers = employees * (turnoverRate / 100);
  const targetLeavers = employees * (targetTurnover / 100);
  const avoidedTurnover = Math.max(0, currentLeavers - targetLeavers);
  const turnoverSavings = avoidedTurnover * costPerTurnover;
  const productivitySavings = employees * avgSalary * (productivityPct / 100);
  const netSavings = turnoverSavings + productivitySavings - programCost;
  const roiPct = programCost > 0 ? (netSavings / programCost) * 100 : 0;
  const savingsPerEmployee = employees > 0 ? netSavings / employees : 0;

  return { avoidedTurnover, turnoverSavings, productivitySavings, netSavings, roiPct, savingsPerEmployee };
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

export default function EmployeeRetentionCostSavingsCalculator() {
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
    num(inputs.turnoverRate) < 0 || num(inputs.turnoverRate) > 100 ||
    num(inputs.costPerTurnover) < 0 ||
    num(inputs.targetTurnover) < 0 || num(inputs.targetTurnover) > 100 ||
    num(inputs.programCost) < 0 ||
    num(inputs.productivityPct) < 0 || num(inputs.productivityPct) > 50 ||
    num(inputs.avgSalary) < 0;

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
    { label: `Current Turnover (${fmt(num(inputs.turnoverRate), 1)}%)`, value: fmt(Math.round(num(inputs.employees) * num(inputs.turnoverRate) / 100)) + " leavers" },
    { label: `Target Turnover (${fmt(num(inputs.targetTurnover), 1)}%)`, value: fmt(Math.round(num(inputs.employees) * num(inputs.targetTurnover) / 100)) + " leavers" },
    { label: "Turnover Avoided", value: fmt(result.avoidedTurnover, 1) + " leavers" },
    { label: `Cost per Turnover (${fmtMoney(num(inputs.costPerTurnover))})`, value: fmtMoney(result.turnoverSavings) },
    { label: `Productivity Gain (${fmt(num(inputs.productivityPct), 1)}% of payroll)`, value: fmtMoney(result.productivitySavings) },
    { label: "Retention Program Cost", value: "-" + fmtMoney(num(inputs.programCost)) },
    { label: "Net Annual Savings", value: fmtMoney(result.netSavings), total: true },
    { label: "Savings per Employee", value: fmtMoney(result.savingsPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees", value: fmt(num(inputs.employees)) },
    { label: "Current Turnover Rate", value: fmt(num(inputs.turnoverRate), 1) + "%" },
    { label: "Target Turnover Rate", value: fmt(num(inputs.targetTurnover), 1) + "%" },
    { label: "Turnover Avoided", value: fmt(result.avoidedTurnover, 1) },
    { label: "Cost per Turnover", value: fmtMoney(num(inputs.costPerTurnover)) },
    { label: "Turnover Savings", value: fmtMoney(result.turnoverSavings) },
    { label: "Productivity Gain", value: fmtMoney(result.productivitySavings) },
    { label: "Program Cost", value: fmtMoney(num(inputs.programCost)) },
    { label: "Net Annual Savings", value: fmtMoney(result.netSavings), bold: true },
    { label: "ROI", value: fmt(result.roiPct, 1) + "%" },
    { label: "Savings per Employee", value: fmtMoney(result.savingsPerEmployee) },
    { label: "Current Leavers", value: fmt(Math.round(num(inputs.employees) * num(inputs.turnoverRate) / 100)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Employee Retention Cost Savings Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Employee Retention Cost Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rs-employees" label="Number of Employees" value={inputs.employees} onChange={set("employees")} suffix="people" />
              <NumInput id="rs-turnover" label="Current Turnover Rate" value={inputs.turnoverRate} onChange={set("turnoverRate")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="rs-cost" label="Cost per Turnover" value={inputs.costPerTurnover} onChange={set("costPerTurnover")} prefix="$" />
              <NumInput id="rs-target" label="Target Turnover Rate" value={inputs.targetTurnover} onChange={set("targetTurnover")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Program & Productivity</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="rs-program" label="Retention Program Cost" value={inputs.programCost} onChange={set("programCost")} prefix="$" suffix="/yr" />
                    <NumInput id="rs-productivity" label="Productivity Gain" value={inputs.productivityPct} onChange={set("productivityPct")} suffix="% of payroll" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="rs-salary" label="Average Salary" value={inputs.avgSalary} onChange={set("avgSalary")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; turnover rates must be between 0 and 100; productivity gain between 0 and 50.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Net Annual Savings from Retention</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.netSavings)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.roiPct, 1)}% ROI — {fmt(result.avoidedTurnover, 1)} turnovers avoided</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Turnover Savings</span>
                <span className="font-extrabold text-green-600">{fmtMoney(result.turnoverSavings)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Productivity Gain</span>
                <span className="font-extrabold text-green-600">{fmtMoney(result.productivitySavings)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ROI</span>
                <span className="font-extrabold text-red-600">{fmt(result.roiPct, 1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Retention Savings Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Employee Retention Cost Savings Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An employee retention cost savings calculator estimates the financial benefit a company realizes when it reduces voluntary turnover through retention programs. Every departed employee carries a cost that includes recruiting, hiring, training, and lost productivity during the vacancy and ramp-up periods, and estimates of that cost typically range from 50% of annual salary for entry-level roles to 200% for specialized positions. A company with 200 employees and an 18% turnover rate is replacing dozens of people a year, and shaving even a few percentage points off that rate can save hundreds of thousands of dollars. This calculator compares your current turnover rate against a realistic target, values the turnovers avoided at your cost per turnover, adds a productivity gain from a more experienced workforce, subtracts the retention program cost, and reports the net annual savings and return on investment.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The cost per turnover input is the single most influential assumption in the model, and while the default of $45,000 reflects a mid-level professional role, the figure varies from roughly 30% of annual salary for easily replaceable positions to 200% for specialized or senior roles, so build your own number from recruiting spend, training costs, and the productivity loss during vacancy and ramp-up. The productivity gain percentage is the secondary benefit of retention: experienced employees simply produce more than the revolving cast of new hires they replace, and a 2% gain on total payroll is a conservative estimate of that effect. The target turnover rate should be grounded in your own department-level data rather than an industry ideal, since a target that is unrealistic produces savings that will never materialize. When presenting the result to leadership, pair the net savings figure with the avoided-turnover count, because decision-makers respond to both the dollars and the human scale of the problem.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of employees, the current annual turnover rate, the cost per turnover, and the target turnover rate. The current leavers are the headcount multiplied by the current rate, and the target leavers use the same calculation with the target rate; the turnovers avoided are the difference, floored at zero. With the default inputs, 200 employees at an 18% rate lose 36 people a year, and cutting the rate to 12% saves 12 turnovers, which at a $45,000 cost per turnover is $540,000 of avoided expense. The advanced options add the annual retention program cost, the productivity gain as a percentage of total payroll, and the average salary used to value that gain. The productivity gain reflects the output value of retaining experienced employees rather than cycling through new hires, and it is computed as the headcount multiplied by the average salary and the gain percentage. The net savings are the turnover savings plus the productivity gain minus the program cost, and the ROI divides the net savings by the program cost.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The net annual savings is the number to use when requesting budget for retention initiatives, and the ROI figure tells you whether the program pays for itself. A negative net savings means the program costs more than the turnover reduction it buys, a common outcome when initiatives are broad rather than targeted at the roles and reasons driving most departures. The turnovers-avoided figure is worth tracking against exit-interview data: if the avoided departures cluster in one department, the savings assumption is stronger than if they are spread thinly. The cost per turnover is the most influential assumption, so estimate it from your own recruiting, training, and productivity data rather than using a generic multiple. Re-run the calculator annually with actual turnover results to measure whether the program delivered the modeled savings.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="employee-retention-cost-savings-calculator" />
        </div>
      </div>
    </>
  );
}