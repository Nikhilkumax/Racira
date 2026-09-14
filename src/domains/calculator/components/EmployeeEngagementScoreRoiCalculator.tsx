"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  employees: string;
  revenuePerEmployee: string;
  currentScore: string;
  targetScore: string;
  productivityLift: string;
  turnoverRate: string;
  turnoverReduction: string;
  costPerTurnover: string;
}

interface Result {
  scoreLift: number;
  productivityPct: number;
  productivityGain: number;
  turnoverReductionPct: number;
  newTurnoverRate: number;
  employeesRetained: number;
  turnoverSavings: number;
  totalValue: number;
}

const DEFAULTS: Inputs = {
  employees: "200",
  revenuePerEmployee: "180000",
  currentScore: "62",
  targetScore: "75",
  productivityLift: "5",
  turnoverRate: "22",
  turnoverReduction: "8",
  costPerTurnover: "25000",
};

function calculate(inputs: Inputs): Result {
  const employees = Math.max(0, parseFloat(inputs.employees) || 0);
  const revenuePerEmployee = Math.max(0, parseFloat(inputs.revenuePerEmployee) || 0);
  const currentScore = Math.min(100, Math.max(0, parseFloat(inputs.currentScore) || 0));
  const targetScore = Math.min(100, Math.max(0, parseFloat(inputs.targetScore) || 0));
  const productivityLift = Math.max(0, parseFloat(inputs.productivityLift) || 0);
  const turnoverRate = Math.min(100, Math.max(0, parseFloat(inputs.turnoverRate) || 0));
  const turnoverReduction = Math.max(0, parseFloat(inputs.turnoverReduction) || 0);
  const costPerTurnover = Math.max(0, parseFloat(inputs.costPerTurnover) || 0);

  const scoreLift = Math.max(0, targetScore - currentScore);
  const productivityPct = (scoreLift / 10) * productivityLift;
  const productivityGain = employees * revenuePerEmployee * (productivityPct / 100);
  const turnoverReductionPct = (scoreLift / 10) * turnoverReduction;
  const newTurnoverRate = Math.max(0, turnoverRate - turnoverReductionPct);
  const employeesRetained = employees * ((turnoverRate - newTurnoverRate) / 100);
  const turnoverSavings = employeesRetained * costPerTurnover;
  const totalValue = productivityGain + turnoverSavings;

  return { scoreLift, productivityPct, productivityGain, turnoverReductionPct, newTurnoverRate, employeesRetained, turnoverSavings, totalValue };
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

export default function EmployeeEngagementScoreRoiCalculator() {
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
    num(inputs.revenuePerEmployee) < 0 ||
    num(inputs.currentScore) < 0 || num(inputs.currentScore) > 100 ||
    num(inputs.targetScore) < 0 || num(inputs.targetScore) > 100 ||
    num(inputs.productivityLift) < 0 ||
    num(inputs.turnoverRate) < 0 || num(inputs.turnoverRate) > 100 ||
    num(inputs.turnoverReduction) < 0 ||
    num(inputs.costPerTurnover) < 0;

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
    { label: "Current Engagement Score", value: fmt(num(inputs.currentScore), 1) },
    { label: "Target Engagement Score", value: fmt(num(inputs.targetScore), 1) },
    { label: "Score Lift", value: fmt(result.scoreLift, 1) + " points" },
    { label: `Productivity Gain (${fmt(result.productivityPct, 1)}%)`, value: fmtMoney(result.productivityGain) },
    { label: `Turnover Reduction (${fmt(result.turnoverReductionPct, 1)} pts)`, value: fmt(result.employeesRetained) + " employees" },
    { label: "Turnover Cost Savings", value: fmtMoney(result.turnoverSavings) },
    { label: "Total Annual Value", value: fmtMoney(result.totalValue), total: true },
    { label: "New Turnover Rate", value: fmt(result.newTurnoverRate, 1) + "%", highlight: true },
  ];

  const summaryStats = [
    { label: "Employees", value: fmt(num(inputs.employees)) },
    { label: "Score Lift", value: fmt(result.scoreLift, 1) + " points" },
    { label: "Productivity Gain %", value: fmt(result.productivityPct, 1) + "%" },
    { label: "Productivity Gain $", value: fmtMoney(result.productivityGain) },
    { label: "Turnover Savings", value: fmtMoney(result.turnoverSavings) },
    { label: "Total Annual Value", value: fmtMoney(result.totalValue), bold: true },
    { label: "Old Turnover Rate", value: fmt(num(inputs.turnoverRate), 1) + "%" },
    { label: "New Turnover Rate", value: fmt(result.newTurnoverRate, 1) + "%" },
    { label: "Employees Retained", value: fmt(result.employeesRetained, 1) },
    { label: "Cost per Turnover", value: fmtMoney(num(inputs.costPerTurnover)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Employee Engagement Score ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Employee Engagement Score ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="eeroi-employees" label="Number of Employees" value={inputs.employees} onChange={set("employees")} suffix="employees" />
              <NumInput id="eeroi-revenue" label="Revenue per Employee" value={inputs.revenuePerEmployee} onChange={set("revenuePerEmployee")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="eeroi-current" label="Current Engagement Score" value={inputs.currentScore} onChange={set("currentScore")} suffix="%" />
              <NumInput id="eeroi-target" label="Target Engagement Score" value={inputs.targetScore} onChange={set("targetScore")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Cost Impact Assumptions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="eeroi-prod" label="Productivity Gain per 10-Point Lift" value={inputs.productivityLift} onChange={set("productivityLift")} suffix="%" />
                    <NumInput id="eeroi-tv" label="Current Turnover Rate" value={inputs.turnoverRate} onChange={set("turnoverRate")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="eeroi-tvred" label="Turnover Reduction per 10-Point Lift" value={inputs.turnoverReduction} onChange={set("turnoverReduction")} suffix="%" />
                    <NumInput id="eeroi-cpt" label="Cost per Turnover" value={inputs.costPerTurnover} onChange={set("costPerTurnover")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Employee count must be greater than zero; all amounts must be non-negative; scores and rates must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual Value of Engagement Lift</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalValue)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.scoreLift, 1)}-point lift: {fmtMoney(result.productivityGain)} productivity + {fmtMoney(result.turnoverSavings)} turnover savings</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Productivity Gain</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.productivityGain)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Turnover Savings</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.turnoverSavings)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Score Lift</span>
                <span className="font-extrabold text-amber-600">{fmt(result.scoreLift, 1)} pts</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Engagement Impact Analysis</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Employee Engagement Score ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An employee engagement score ROI calculator converts an improvement in employee engagement into a dollar value for the business. Engagement surveys produce a score, usually expressed as a percentage of employees who are engaged, and improving that score is an objective that leadership teams set every year. The problem is that a score is an abstract number, and it is hard to justify spending on engagement initiatives when the payoff is not expressed in dollars. Research consistently links engagement to two measurable financial outcomes: engaged employees are more productive, and they leave the company less often, and both effects are directly quantifiable. This calculator applies those relationships: an engagement score lift is translated into a productivity gain based on revenue per employee, and into a turnover reduction based on the current attrition rate and the cost of replacing an employee. The result is a total annual dollar value that turns an engagement target into a business case.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. The number of employees sets the size of the workforce affected, and the revenue per employee is the average revenue each employee generates, which is the productivity baseline. The current engagement score and the target engagement score frame the improvement being evaluated, and the difference between them is the score lift. The productivity side of the model assumes that each ten-point improvement in engagement lifts productivity by a set percentage, so the productivity gain percentage is the score lift divided by ten, multiplied by that per-ten-point rate, and the dollar gain is that percentage applied to the total revenue of the workforce. With the default inputs, a 200-employee company with $180,000 of revenue per employee lifting its engagement score from 62 to 75, a thirteen-point gain, produces a 6.5% productivity improvement worth about $2.34 million a year.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section models the retention side of the value. The current turnover rate is the annual share of employees who leave, the turnover reduction per ten-point lift is the improvement in that rate associated with engagement gains, and the cost per turnover is the fully loaded cost of replacing one employee, including recruiting, hiring, training, and lost productivity. The turnover reduction percentage is the score lift divided by ten times the per-ten-point reduction, the new turnover rate is the current rate minus that reduction, and the employees retained are the workforce size times the difference between the two rates. Multiplying the retained employees by the cost per turnover gives the turnover savings, which with the default inputs is about $520,000 a year. The total annual value sums the productivity gain and the turnover savings, giving the complete financial case for the engagement improvement.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total annual value of the engagement lift, and the breakdown shows whether productivity or retention is the bigger lever, which varies by business. For high-revenue-per-employee companies, the productivity gain dominates, and the engagement program should be judged on output metrics like throughput and quality; for high-turnover companies, retention dominates, and the program should be judged on attrition. The assumptions in the advanced section deserve the most scrutiny, because the per-ten-point rates are based on published research averages and will differ for your workforce, so it is wise to use conservative rates and validate them against your own engagement and performance data over time. Compare the annual value against the cost of the engagement initiatives, and any program that costs less than the value it unlocks is a sound investment. Use the calculator when setting engagement targets, so the target is chosen for the value it creates rather than as an arbitrary score.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/employee-engagement-score-roi-calculator" />
        </div>
      </div>
    </>
  );
}