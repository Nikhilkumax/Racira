"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  costPerEmployee: string;
  productivityGain: string;
  trainingHours: string;
  hourlyWage: string;
  benefitYears: string;
  retentionRate: string;
  replacementCost: string;
}

interface Result {
  directCost: number;
  timeCost: number;
  totalInvestment: number;
  annualBenefit: number;
  roiPct: number;
  paybackYears: number;
  adjustedBenefit: number;
  replacementLoss: number;
  threeYearRoiPct: number;
}

const DEFAULTS: Inputs = {
  employees: "40",
  costPerEmployee: "1500",
  productivityGain: "4000",
  trainingHours: "24",
  hourlyWage: "35",
  benefitYears: "3",
  retentionRate: "80",
  replacementCost: "8000",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const costPerEmployee = Math.max(0, parseFloat(inputs.costPerEmployee) || 0);
  const productivityGain = Math.max(0, parseFloat(inputs.productivityGain) || 0);
  const trainingHours = Math.max(0, parseFloat(inputs.trainingHours) || 0);
  const hourlyWage = Math.max(0, parseFloat(inputs.hourlyWage) || 0);
  const benefitYears = Math.max(0, parseFloat(inputs.benefitYears) || 0);
  const retentionRate = Math.min(100, Math.max(0, parseFloat(inputs.retentionRate) || 0));
  const replacementCost = Math.max(0, parseFloat(inputs.replacementCost) || 0);

  const directCost = employees * costPerEmployee;
  const timeCost = employees * trainingHours * hourlyWage;
  const totalInvestment = directCost + timeCost;
  const annualBenefit = employees * productivityGain;
  const roiPct = totalInvestment > 0 ? ((annualBenefit - totalInvestment) / totalInvestment) * 100 : 0;
  const paybackYears = annualBenefit > 0 ? totalInvestment / annualBenefit : 0;
  const adjustedBenefit = annualBenefit * (retentionRate / 100) * benefitYears;
  const replacementLoss = employees * (1 - retentionRate / 100) * replacementCost;
  const threeYearRoiPct = totalInvestment > 0 ? ((adjustedBenefit - replacementLoss - totalInvestment) / totalInvestment) * 100 : 0;

  return { directCost, timeCost, totalInvestment, annualBenefit, roiPct, paybackYears, adjustedBenefit, replacementLoss, threeYearRoiPct };
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

export default function TrainingRoiCalculator() {
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
    num(inputs.employees) <= 0 ||
    num(inputs.costPerEmployee) < 0 ||
    num(inputs.productivityGain) < 0 ||
    num(inputs.trainingHours) < 0 ||
    num(inputs.hourlyWage) < 0 ||
    num(inputs.benefitYears) < 0 ||
    num(inputs.retentionRate) < 0 || num(inputs.retentionRate) > 100 ||
    num(inputs.replacementCost) < 0;

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
    { label: `Program Cost (${fmtMoney(num(inputs.costPerEmployee))}/employee)`, value: fmtMoney(result.directCost) },
    { label: `Time Cost (${fmt(num(inputs.trainingHours))} hrs × ${fmtMoney(num(inputs.hourlyWage))}/hr)`, value: fmtMoney(result.timeCost) },
    { label: "Total Training Investment", value: fmtMoney(result.totalInvestment), total: true },
    { label: "Annual Productivity Benefit", value: fmtMoney(result.annualBenefit) },
    { label: "Annual Training ROI", value: result.roiPct.toFixed(1) + "%", highlight: true },
    { label: "Payback Period", value: result.paybackYears.toFixed(1) + " years" },
    { label: "3-Year Adjusted Benefit", value: fmtMoney(result.adjustedBenefit) },
    { label: "Attrition Replacement Loss", value: fmtMoney(result.replacementLoss) },
    { label: "3-Year Net ROI", value: result.threeYearRoiPct.toFixed(1) + "%" },
  ];

  const summaryStats = [
    { label: "Employees Trained", value: fmt(num(inputs.employees)) },
    { label: "Program Cost", value: fmtMoney(result.directCost) },
    { label: "Training Time Cost", value: fmtMoney(result.timeCost) },
    { label: "Total Investment", value: fmtMoney(result.totalInvestment), bold: true },
    { label: "Annual Benefit", value: fmtMoney(result.annualBenefit) },
    { label: "Annual ROI", value: result.roiPct.toFixed(1) + "%" },
    { label: "Payback Period", value: result.paybackYears.toFixed(1) + " yrs" },
    { label: "3-Year Adjusted Benefit", value: fmtMoney(result.adjustedBenefit) },
    { label: "Replacement Loss", value: fmtMoney(result.replacementLoss) },
    { label: "3-Year Net ROI", value: result.threeYearRoiPct.toFixed(1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Training ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Training ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="troi-employees" label="Employees Trained" value={inputs.employees} onChange={set("employees")} suffix="employees" />
              <NumInput id="troi-cost" label="Training Cost per Employee" value={inputs.costPerEmployee} onChange={set("costPerEmployee")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="troi-gain" label="Productivity Gain per Employee" value={inputs.productivityGain} onChange={set("productivityGain")} prefix="$" suffix="/yr" />
              <NumInput id="troi-hours" label="Training Hours per Employee" value={inputs.trainingHours} onChange={set("trainingHours")} suffix="hours" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Retention & Long-Term Impact</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="troi-wage" label="Average Hourly Wage" value={inputs.hourlyWage} onChange={set("hourlyWage")} prefix="$" />
                    <NumInput id="troi-years" label="Benefit Duration" value={inputs.benefitYears} onChange={set("benefitYears")} suffix="years" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="troi-retention" label="Employee Retention Rate" value={inputs.retentionRate} onChange={set("retentionRate")} suffix="%" />
                    <NumInput id="troi-replacement" label="Attrition Replacement Cost" value={inputs.replacementCost} onChange={set("replacementCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Employee count must be greater than zero; all amounts must be non-negative; retention rate must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual Training ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.roiPct.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.annualBenefit)} in annual benefit on a {fmtMoney(result.totalInvestment)} investment</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Investment</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.totalInvestment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Benefit</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.annualBenefit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payback Period</span>
                <span className="font-extrabold text-primary">{result.paybackYears.toFixed(1)} yrs</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Training Investment Analysis</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Training ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A training ROI calculator measures whether the money spent on employee training earns a positive return. Training is one of the easiest budgets to cut when times are tight and one of the hardest to justify when it comes up for approval, because the costs are visible and immediate while the benefits are scattered across productivity, quality, and retention over the following years. This calculator assembles both sides of the ledger. The investment includes not only the direct program cost per employee but also the often-forgotten cost of the employees' time spent in training rather than doing their jobs. The benefit is the annual productivity gain the trained employees deliver, and the calculator also models how long the benefit lasts, how much of it survives employee turnover, and what losing trained employees costs in replacement expense. The result is an annual ROI, a payback period, and a longer-term ROI that reflects the real economics of the training decision.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. The number of employees trained sets the scale of the program. The training cost per employee covers the program fees, materials, and instructors allocated to each participant, and the productivity gain per employee per year is the dollar value of the output improvement the training is expected to produce. The training hours per employee completes the cost side of the picture, because those hours are hours not spent producing, and the value of that time belongs in the investment. The direct program cost is the employee count multiplied by the cost per employee, the time cost is the employee count multiplied by the training hours and the hourly wage, and the total investment is the sum of the two.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The annual benefit is the employee count multiplied by the productivity gain per employee, and the annual ROI is the benefit minus the investment divided by the investment, with the payback period being the investment divided by the annual benefit. The Advanced Options section adds the long-term view. The benefit duration is how many years the productivity gain persists, the retention rate is the share of trained employees who stay with the company, and the attrition replacement cost is what it costs to replace an employee who leaves. The adjusted three-year benefit applies the retention rate to the annual benefit across the benefit duration, the replacement loss charges the replacement cost against the departing employees, and the three-year net ROI compares the resulting net benefit against the original investment. With the default inputs, a 40-employee program costing $1,500 per head with 24 hours of training time at $35 an hour returns about 71% annually, with a payback under seven months.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the annual training ROI, and anything meaningfully above the company's cost of capital is a strong return for a program that also builds capability. The payback period is the number decision-makers care about most: a payback under a year makes the investment easy to approve, while a payback beyond two years means the benefit assumptions deserve scrutiny. The long-term view matters just as much, because the value of training is destroyed when trained employees leave; if the three-year net ROI is much lower than the annual ROI, the root cause is retention, not the training program, and the fix is career paths and pay, not less training. Be conservative with the productivity gain assumption, because it is the input the sales pitch for the program will exaggerate, and validate it with a pilot group before scaling. Use the calculator to compare programs against each other on the same basis, and to build the business case every training budget should carry.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/training-roi-calculator" />
        </div>
      </div>
    </>
  );
}