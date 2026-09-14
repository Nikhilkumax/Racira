"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  turnoverRate: string;
  avgSalary: string;
  multiplier: string;
  exitInterviews: string;
  interviewHours: string;
  mgrRate: string;
  vacancyWeeks: string;
}

interface Result {
  leavers: number;
  exitInterviewCost: number;
  vacancyCost: number;
  totalCost: number;
  costPerEmployee: number;
  annualPayroll: number;
  turnoverPctOfPayroll: number;
}

const DEFAULTS: Inputs = {
  employees: "150",
  turnoverRate: "20",
  avgSalary: "62000",
  multiplier: "1.0",
  exitInterviews: "1.5",
  interviewHours: "3",
  mgrRate: "55",
  vacancyWeeks: "4",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const turnoverRate = Math.min(200, Math.max(0, parseFloat(inputs.turnoverRate) || 0));
  const avgSalary = Math.max(0, parseFloat(inputs.avgSalary) || 0);
  const multiplier = Math.max(0, parseFloat(inputs.multiplier) || 0);
  const exitInterviews = Math.max(0, parseFloat(inputs.exitInterviews) || 0);
  const interviewHours = Math.max(0, parseFloat(inputs.interviewHours) || 0);
  const mgrRate = Math.max(0, parseFloat(inputs.mgrRate) || 0);
  const vacancyWeeks = Math.max(0, parseFloat(inputs.vacancyWeeks) || 0);

  const leavers = employees * (turnoverRate / 100);
  const exitInterviewCost = leavers * exitInterviews * interviewHours * mgrRate;
  const vacancyCost = leavers * vacancyWeeks * (avgSalary / 52);
  const totalCost = leavers * avgSalary * multiplier + exitInterviewCost + vacancyCost;
  const costPerEmployee = employees > 0 ? totalCost / employees : 0;
  const annualPayroll = employees * avgSalary;
  const turnoverPctOfPayroll = annualPayroll > 0 ? (totalCost / annualPayroll) * 100 : 0;

  return { leavers, exitInterviewCost, vacancyCost, totalCost, costPerEmployee, annualPayroll, turnoverPctOfPayroll };
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

export default function EmployeeTurnoverCostCalculator() {
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
    num(inputs.turnoverRate) < 0 || num(inputs.turnoverRate) > 200 ||
    num(inputs.avgSalary) < 0 ||
    num(inputs.multiplier) < 0 ||
    num(inputs.exitInterviews) < 0 ||
    num(inputs.interviewHours) < 0 ||
    num(inputs.mgrRate) < 0 ||
    num(inputs.vacancyWeeks) < 0;

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
    { label: `Turnover Rate (${fmt(num(inputs.turnoverRate), 1)}%)`, value: fmt(result.leavers, 1) + " leavers" },
    { label: `Core Turnover Cost (${fmt(num(inputs.multiplier), 1)}× salary)`, value: fmtMoney(result.leavers * num(inputs.avgSalary) * num(inputs.multiplier)) },
    { label: `Exit Interview Time (${fmt(num(inputs.exitInterviews))} hrs × ${fmt(num(inputs.interviewHours))} interviews)`, value: fmtMoney(result.exitInterviewCost) },
    { label: `Vacancy Cost (${fmt(num(inputs.vacancyWeeks))} wks × ${fmtMoney(num(inputs.avgSalary) / 52)}/wk)`, value: fmtMoney(result.vacancyCost) },
    { label: "Total Annual Turnover Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees", value: fmt(num(inputs.employees)) },
    { label: "Turnover Rate", value: fmt(num(inputs.turnoverRate), 1) + "%" },
    { label: "Average Salary", value: fmtMoney(num(inputs.avgSalary)) },
    { label: "Leavers per Year", value: fmt(result.leavers, 1) },
    { label: "Cost Multiplier", value: fmt(num(inputs.multiplier), 1) + "× salary" },
    { label: "Core Turnover Cost", value: fmtMoney(result.leavers * num(inputs.avgSalary) * num(inputs.multiplier)) },
    { label: "Exit Interview Cost", value: fmtMoney(result.exitInterviewCost) },
    { label: "Vacancy Cost", value: fmtMoney(result.vacancyCost) },
    { label: "Total Turnover Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee) },
    { label: "Annual Payroll", value: fmtMoney(result.annualPayroll) },
    { label: "% of Payroll", value: fmt(result.turnoverPctOfPayroll, 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Employee Turnover Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Employee Turnover Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tc-employees" label="Number of Employees" value={inputs.employees} onChange={set("employees")} suffix="people" />
              <NumInput id="tc-rate" label="Annual Turnover Rate" value={inputs.turnoverRate} onChange={set("turnoverRate")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tc-salary" label="Average Annual Salary" value={inputs.avgSalary} onChange={set("avgSalary")} prefix="$" />
              <NumInput id="tc-multiplier" label="Cost Multiplier" value={inputs.multiplier} onChange={set("multiplier")} suffix="× salary" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Exit Process</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="tc-exit-interviews" label="Exit Interviews / Leaver" value={inputs.exitInterviews} onChange={set("exitInterviews")} suffix="hrs" />
                    <NumInput id="tc-interview-hours" label="Interviewers per Exit" value={inputs.interviewHours} onChange={set("interviewHours")} suffix="people" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="tc-mgr-rate" label="Manager Hourly Rate" value={inputs.mgrRate} onChange={set("mgrRate")} prefix="$" />
                    <NumInput id="tc-vacancy" label="Average Vacancy" value={inputs.vacancyWeeks} onChange={set("vacancyWeeks")} suffix="weeks" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and turnover rate must be between 0 and 200.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual Turnover Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerEmployee)} per employee — {fmt(result.turnoverPctOfPayroll, 1)}% of payroll</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Leavers / Year</span>
                <span className="font-extrabold text-amber-600">{fmt(result.leavers, 1)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Employee</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerEmployee)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">% of Payroll</span>
                <span className="font-extrabold text-red-600">{fmt(result.turnoverPctOfPayroll, 1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Turnover Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Employee Turnover Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An employee turnover cost calculator estimates the total annual expense a company absorbs when employees leave and must be replaced. Turnover costs are broad and easy to underestimate: recruiting and advertising, screening and interviewing, onboarding and training, the productivity lost while a position sits vacant, and the reduced output of a new hire who needs months to reach full proficiency. Research commonly values turnover at between 50% and 200% of the departing employee's annual salary, with the multiple rising for specialized, senior, and hard-to-fill roles. This calculator combines a core cost based on a salary multiplier with two often-missed components: the manager time spent on exit interviews and the wages paid for work that simply does not happen during the vacancy period. The result is a total annual turnover cost, a per-employee figure, and the share of payroll the company is losing to churn.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The salary multiplier is the industry-standard shorthand for the full cost of replacing an employee, and it bundles recruiting, interviewing, onboarding, training, and the productivity gap while the role is vacant and the new hire ramps up; the default of 1.0 is a middle-ground professional-services assumption, with 0.5 appropriate for hourly roles and 1.5 to 2.0 for roles with long ramp times or scarce skills. The vacancy cost is valued separately at the weekly salary because it is real money paid for work that is not being done, and the vacancy weeks input should reflect your actual time-to-fill rather than an aspiration. The exit interview cost captures manager time that is almost never budgeted, and it is included because it is a controllable line that better processes can shrink. The percentage-of-payroll output is the metric that scales across companies of any size, making it the figure to benchmark against published turnover cost research.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of employees, the annual turnover rate, the average annual salary, and the cost multiplier applied to that salary. The number of leavers multiplies the headcount by the turnover rate, and the core turnover cost multiplies the leavers by the salary and the multiplier, capturing recruiting, hiring, training, and lost productivity in one figure. With the default inputs, 150 employees at a 20% turnover rate lose 30 people a year, and at a 1.0 multiplier on a $62,000 salary the core cost is $1,860,000. The advanced options refine the estimate with the exit-interview hours per leaver, the number of interviewers involved, and the manager hourly rate, whose product is the exit interview cost, plus the average vacancy in weeks, which is valued at the weekly salary to produce the vacancy cost. The total is the sum of the three components, the per-employee figure divides it by the headcount, and the percentage of payroll compares the total against the annual payroll of all employees.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total annual cost quantifies the prize available from retention efforts, and the percentage of payroll is the metric that scales across companies of any size, making it useful for benchmarking. The leavers-per-year figure is the operational number to attack: each leaver avoided saves the full per-leaver cost, so a 10% turnover-rate improvement at the default settings avoids 15 turnovers and roughly $930,000. The multiplier is the assumption that moves the result most, so set it from your own experience: 0.5 for easily replaceable hourly roles, 1.0 for standard professional roles, and 1.5 to 2.0 for specialized positions. Watch the vacancy assumption too, since slow hiring silently inflates cost. Re-run the calculator each quarter with actual turnover data to track whether retention programs are moving the number that matters.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="employee-turnover-cost-calculator" />
        </div>
      </div>
    </>
  );
}