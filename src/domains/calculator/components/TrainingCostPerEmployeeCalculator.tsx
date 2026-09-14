"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  programCost: string;
  trainerRate: string;
  trainingDays: string;
  hourlyRate: string;
  trainingHours: string;
  travelExpenses: string;
  certFee: string;
}

interface Result {
  trainerCost: number;
  timeCost: number;
  certTotal: number;
  totalCost: number;
  costPerEmployee: number;
  hoursPerEmployee: number;
  costPerHour: number;
}

const DEFAULTS: Inputs = {
  employees: "50",
  programCost: "25000",
  trainerRate: "1500",
  trainingDays: "2",
  hourlyRate: "32",
  trainingHours: "16",
  travelExpenses: "3000",
  certFee: "150",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const programCost = Math.max(0, parseFloat(inputs.programCost) || 0);
  const trainerRate = Math.max(0, parseFloat(inputs.trainerRate) || 0);
  const trainingDays = Math.max(0, parseFloat(inputs.trainingDays) || 0);
  const hourlyRate = Math.max(0, parseFloat(inputs.hourlyRate) || 0);
  const trainingHours = Math.max(0, parseFloat(inputs.trainingHours) || 0);
  const travelExpenses = Math.max(0, parseFloat(inputs.travelExpenses) || 0);
  const certFee = Math.max(0, parseFloat(inputs.certFee) || 0);

  const trainerCost = trainerRate * trainingDays;
  const timeCost = employees * trainingHours * hourlyRate;
  const certTotal = employees * certFee;
  const totalCost = programCost + trainerCost + timeCost + travelExpenses + certTotal;
  const costPerEmployee = employees > 0 ? totalCost / employees : 0;
  const hoursPerEmployee = trainingHours;
  const costPerHour = trainingHours > 0 ? costPerEmployee / trainingHours : 0;

  return { trainerCost, timeCost, certTotal, totalCost, costPerEmployee, hoursPerEmployee, costPerHour };
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

export default function TrainingCostPerEmployeeCalculator() {
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
    num(inputs.programCost) < 0 ||
    num(inputs.trainerRate) < 0 ||
    num(inputs.trainingDays) < 0 ||
    num(inputs.hourlyRate) < 0 ||
    num(inputs.trainingHours) < 0 ||
    num(inputs.travelExpenses) < 0 ||
    num(inputs.certFee) < 0;

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
    { label: "Employees Trained", value: fmt(num(inputs.employees)) },
    { label: "Program Development & Materials", value: fmtMoney(num(inputs.programCost)) },
    { label: `Trainer Cost (${fmt(num(inputs.trainerRate))}/day × ${fmt(num(inputs.trainingDays))} days)`, value: fmtMoney(result.trainerCost) },
    { label: `Employee Time Cost (${fmt(num(inputs.trainingHours))} hrs × ${fmt(num(inputs.hourlyRate))}/hr)`, value: fmtMoney(result.timeCost) },
    { label: "Travel & Expenses", value: fmtMoney(num(inputs.travelExpenses)) },
    { label: `Certification Fees (${fmt(num(inputs.certFee))}/employee)`, value: fmtMoney(result.certTotal) },
    { label: "Total Training Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee), highlight: true },
  ];

  const summaryStats = [
    { label: "Employees Trained", value: fmt(num(inputs.employees)) },
    { label: "Program Development", value: fmtMoney(num(inputs.programCost)) },
    { label: "Trainer Cost", value: fmtMoney(result.trainerCost) },
    { label: "Employee Time Cost", value: fmtMoney(result.timeCost) },
    { label: "Travel & Expenses", value: fmtMoney(num(inputs.travelExpenses)) },
    { label: "Certification Fees", value: fmtMoney(result.certTotal) },
    { label: "Total Training Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Employee", value: fmtMoney(result.costPerEmployee) },
    { label: "Training Hours / Employee", value: fmt(result.hoursPerEmployee) },
    { label: "Cost per Training Hour", value: fmtMoney(result.costPerHour) },
    { label: "Cost / Employee / Day", value: fmtMoney(result.costPerEmployee / Math.max(1, num(inputs.trainingDays))) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Training Cost Per Employee Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Training Cost Per Employee Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tc-employees" label="Employees Trained" value={inputs.employees} onChange={set("employees")} suffix="people" />
              <NumInput id="tc-program" label="Program Development & Materials" value={inputs.programCost} onChange={set("programCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tc-trainer" label="Trainer Cost" value={inputs.trainerRate} onChange={set("trainerRate")} prefix="$" suffix="/day" />
              <NumInput id="tc-days" label="Training Duration" value={inputs.trainingDays} onChange={set("trainingDays")} suffix="days" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Time & Travel</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="tc-hourly" label="Average Hourly Rate" value={inputs.hourlyRate} onChange={set("hourlyRate")} prefix="$" />
                    <NumInput id="tc-hours" label="Training Hours / Employee" value={inputs.trainingHours} onChange={set("trainingHours")} suffix="hrs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="tc-travel" label="Travel & Expenses" value={inputs.travelExpenses} onChange={set("travelExpenses")} prefix="$" />
                    <NumInput id="tc-cert" label="Certification Fee" value={inputs.certFee} onChange={set("certFee")} prefix="$" suffix="/employee" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Training Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerEmployee)} per employee — {fmtMoney(result.costPerHour)} per training hour</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Employee</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerEmployee)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Employee Time Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.timeCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Training Hour</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerHour)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Training Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Training Cost Per Employee Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A training cost per employee calculator estimates the complete expense of a training program divided across the people who attend it. Training budgets usually list only the obvious line items, such as the course fee or the trainer's invoice, but the true cost includes the program development and materials, the trainer's time, the wages paid to employees while they sit in the classroom, travel and lodging, and certification fees. The employee time component alone frequently rivals or exceeds the direct program cost, because a classroom full of skilled workers has a large hourly value. This calculator assembles every major cost category and reports the total, the per-employee figure, and the cost per training hour, giving L&amp;D teams the numbers they need to justify programs, compare delivery methods, and benchmark against industry averages that typically land between several hundred and a few thousand dollars per employee.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The employee time cost is the component most training budgets omit, yet for skilled workforces it is frequently the single largest line, because every hour in the classroom is an hour the employee is not producing revenue or serving customers. The hourly rate input should reflect the fully loaded cost of the employee's time, including benefits and overhead, rather than the raw wage, since that is the true opportunity cost of removing the person from their role. When comparing delivery modes, note that instructor-led training carries both the trainer fee and the travel line, while virtual training typically replaces those with a lower per-seat fee but keeps the time cost unchanged. Certification fees multiply quickly across large cohorts, and employer-paid credentials are worth tracking separately because they are both a cost and a retention investment. The per-employee figure is the benchmark for budgeting, while the cost per training hour is the sharper comparison between programs of different lengths.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of employees trained, the program development and materials cost, the trainer's daily rate, and the number of training days. The trainer cost multiplies the daily rate by the training days, covering the instructor's fee but not travel, which appears separately in the advanced options. The advanced options add the average employee hourly rate and training hours per employee, whose product is the employee time cost; the travel and expenses total; and the per-employee certification fee. With the default inputs, 50 employees taking 16 hours of training at $32 an hour carry a $25,600 time cost that actually exceeds the $25,000 program development cost, while a two-day trainer engagement at $1,500 a day adds $3,000 and certification adds $7,500. The total cost is the sum of all five categories, the cost per employee divides that total by the headcount, and the cost per training hour divides the per-employee figure by the training hours. Every value updates only when you press Calculate, so you can compare an in-house program against a vendor course side by side.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The cost per employee is the headline number for benchmarking and budgeting, while the cost per training hour is the sharper comparison across programs of different lengths. If the employee time cost dominates the total, consider shortening the program, moving part of it to self-paced learning, or scheduling sessions during slower periods. The certification fee line is worth auditing: employer-paid credentials are a retention tool, but fees multiply quickly across large cohorts. Track cost per employee against measured outcomes, such as productivity gains or error-rate reductions, to compute a training ROI, and re-run the calculator whenever headcount, wages, or program design changes. Remember that these are direct costs; manager time spent preparing employees and lost production during training are real but excluded from this estimate.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="training-cost-per-employee-calculator" />
        </div>
      </div>
    </>
  );
}