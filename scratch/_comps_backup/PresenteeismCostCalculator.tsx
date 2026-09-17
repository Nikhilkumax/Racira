"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  avgSalary: string;
  presenteeismDays: string;
  productivityLoss: string;
  workdaysPerYear: string;
  chronicEmployees: string;
  chronicExtraDays: string;
}

interface Result {
  dailyRate: number;
  baseDays: number;
  extraDays: number;
  totalDays: number;
  totalCost: number;
  costPerEmployee: number;
  monthlyCost: number;
}

const DEFAULTS: Inputs = {
  employees: "100",
  avgSalary: "65000",
  presenteeismDays: "6",
  productivityLoss: "33",
  workdaysPerYear: "240",
  chronicEmployees: "15",
  chronicExtraDays: "3",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const avgSalary = Math.max(0, parseFloat(inputs.avgSalary) || 0);
  const presenteeismDays = Math.max(0, parseFloat(inputs.presenteeismDays) || 0);
  const productivityLoss = Math.min(100, Math.max(0, parseFloat(inputs.productivityLoss) || 0));
  const workdaysPerYear = Math.max(1, parseFloat(inputs.workdaysPerYear) || 1);
  const chronicEmployees = Math.max(0, parseFloat(inputs.chronicEmployees) || 0);
  const chronicExtraDays = Math.max(0, parseFloat(inputs.chronicExtraDays) || 0);

  const dailyRate = avgSalary / workdaysPerYear;
  const baseDays = employees * presenteeismDays;
  const extraDays = chronicEmployees * chronicExtraDays;
  const totalDays = baseDays + extraDays;
  const totalCost = totalDays * dailyRate * (productivityLoss / 100);
  const costPerEmployee = employees > 0 ? totalCost / employees : 0;
  const monthlyCost = totalCost / 12;

  return { dailyRate, baseDays, extraDays, totalDays, totalCost, costPerEmployee, monthlyCost };
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

export default function PresenteeismCostCalculator() {
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
    num(inputs.presenteeismDays) < 0 ||
    num(inputs.productivityLoss) < 0 || num(inputs.productivityLoss) > 100 ||
    num(inputs.workdaysPerYear) <= 0 ||
    num(inputs.chronicEmployees) < 0 ||
    num(inputs.chronicExtraDays) < 0;

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
    { label: "Daily Pay Rate", value: fmtMoney(result.dailyRate) },
    { label: `Base Presenteeism Days (${fmt(num(inputs.presenteeismDays))}/EE)`, value: fmt(result.baseDays) + " days" },
    { label: `Chronic Condition Extra Days`, value: "+" + fmt(result.extraDays) + " days" },
    { label: "Total Lost Productivity Days", value: fmt(result.totalDays) + " days" },
    { label: `Productivity Loss Rate (${fmt(num(inputs.productivityLoss), 1)}%)`, value: fmtMoney(result.totalCost) },
    { label: "Annual Presenteeism Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees", value: fmt(num(inputs.employees)) },
    { label: "Average Salary", value: fmtMoney(num(inputs.avgSalary)) },
    { label: "Presenteeism Days / EE", value: fmt(num(inputs.presenteeismDays)) },
    { label: "Productivity Loss", value: fmt(num(inputs.productivityLoss), 1) + "%" },
    { label: "Workdays per Year", value: fmt(num(inputs.workdaysPerYear)) },
    { label: "Daily Pay Rate", value: fmtMoney(result.dailyRate) },
    { label: "Base Days", value: fmt(result.baseDays) },
    { label: "Chronic Extra Days", value: fmt(result.extraDays) },
    { label: "Total Lost Days", value: fmt(result.totalDays) },
    { label: "Annual Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee) },
    { label: "Monthly Cost", value: fmtMoney(result.monthlyCost) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Presenteeism Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Presenteeism Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pc-employees" label="Number of Employees" value={inputs.employees} onChange={set("employees")} suffix="people" />
              <NumInput id="pc-salary" label="Average Annual Salary" value={inputs.avgSalary} onChange={set("avgSalary")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pc-days" label="Presenteeism Days / Employee" value={inputs.presenteeismDays} onChange={set("presenteeismDays")} suffix="days/yr" />
              <NumInput id="pc-loss" label="Productivity Loss While Present" value={inputs.productivityLoss} onChange={set("productivityLoss")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Work Calendar & Chronic Conditions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="pc-workdays" label="Workdays per Year" value={inputs.workdaysPerYear} onChange={set("workdaysPerYear")} suffix="days" />
                    <NumInput id="pc-chronic" label="Employees with Chronic Conditions" value={inputs.chronicEmployees} onChange={set("chronicEmployees")} suffix="people" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="pc-chronic-days" label="Extra Presenteeism Days Each" value={inputs.chronicExtraDays} onChange={set("chronicExtraDays")} suffix="days/yr" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative, workdays per year must be greater than zero, and productivity loss must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual Presenteeism Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerEmployee)} per employee — {fmt(result.totalDays)} lost productivity days across the workforce</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lost Productivity Days</span>
                <span className="font-extrabold text-amber-600">{fmt(result.totalDays)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Employee</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerEmployee)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.monthlyCost)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Presenteeism Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Presenteeism Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A presenteeism cost calculator estimates the financial loss a company absorbs when employees come to work while ill, injured, or otherwise impaired and perform below their normal level. Presenteeism is the quiet counterpart to absenteeism: the employee is present and on payroll, but physical or mental health conditions cut their output, slow their judgment, and sometimes degrade the work of teammates. Research consistently finds that presenteeism costs employers more than absenteeism, because it affects far more days per year and is nearly invisible in attendance records. The core estimation method multiplies the number of affected days by the daily pay rate and an assumed productivity loss percentage, typically in the range of 30% to 40% for employees working while unwell. This calculator applies that method across the whole workforce, adds extra days for employees managing chronic conditions, and converts the result into an annual dollar figure leadership can act on.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The productivity loss percentage is the assumption that drives the result, and research-based estimates for employees working through illness typically range from 25% to 50% depending on the condition; the default of 33% reflects the widely cited finding that employees operating while unwell function at roughly two-thirds of their normal output. Chronic conditions deserve a separate multiplier because studies consistently show that employees managing ongoing health issues lose substantially more productive days than the workforce average, which is why the advanced tier adds both a count and an extra-days figure for that group. The daily rate division uses the actual workdays per year rather than calendar days, so holidays, weekends, and planned time off do not inflate the estimate. When benchmarking your result, compare the per-employee figure against published presenteeism cost studies, which typically report values in the low thousands of dollars per employee per year.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of employees, the average annual salary, the average number of presenteeism days per employee per year, and the productivity loss percentage while present but unwell. The daily pay rate divides the average salary by the workdays per year, and the base lost days multiply the headcount by the presenteeism days per employee. With the default inputs, 100 employees at a $65,000 salary working 240 days a year earn about $271 per day, and six presenteeism days each produce 600 affected days. The annual cost is the affected days multiplied by the daily rate and the productivity loss, so 600 days at $271 with a 33% loss yields roughly $53,600 before any adjustments. The advanced options refine the model with the actual workdays per year, the number of employees managing chronic conditions, and the extra presenteeism days each of those employees carries, which research suggests is substantially higher than the workforce average. The total cost is the sum of the base and extra days, valued at the daily rate and the loss percentage, and the per-employee figure divides that total by the headcount.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The annual presenteeism cost is the number to compare against your absenteeism bill, since the pair together define the true cost of employee health. If presenteeism dwarfs absenteeism, which is the common pattern, invest in interventions that keep employees from working while impaired: paid sick leave that removes the financial incentive to come in, flexible scheduling, and mental health support. The cost-per-employee figure is the benchmark to track year over year, because headcount changes can mask real progress. The chronic-condition adjustment is a planning tool for wellness and disease-management programs, whose value can be measured as the reduction in extra presenteeism days after implementation. Re-run the calculator after policy changes to quantify the payoff, and remember that the productivity loss percentage is an assumption you can tune with manager feedback or time-use studies.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="presenteeism-cost-calculator" />
        </div>
      </div>
    </>
  );
}