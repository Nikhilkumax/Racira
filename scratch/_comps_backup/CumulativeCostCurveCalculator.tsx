"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  totalBudget: string;
  durationMonths: string;
  monthlySpend: string;
  elapsedMonths: string;
  contingencyPct: string;
  closeoutCost: string;
  actualSpent: string;
}

interface Result {
  plannedCumulative: number;
  plannedPct: number;
  actualVariance: number;
  forecastTotal: number;
  remainingBudget: number;
  remainingMonthly: number;
  monthlyPlanned: number;
}

const DEFAULTS: Inputs = {
  totalBudget: "500000",
  durationMonths: "12",
  monthlySpend: "40000",
  elapsedMonths: "6",
  contingencyPct: "10",
  closeoutCost: "25000",
  actualSpent: "270000",
};

function calculate(inputs: Inputs): Result {
  const totalBudget = Math.max(0, parseFloat(inputs.totalBudget) || 0);
  const durationMonths = Math.max(1, parseFloat(inputs.durationMonths) || 1);
  const monthlySpend = Math.max(0, parseFloat(inputs.monthlySpend) || 0);
  const elapsedMonths = Math.min(durationMonths, Math.max(0, parseFloat(inputs.elapsedMonths) || 0));
  const contingencyPct = Math.min(100, Math.max(0, parseFloat(inputs.contingencyPct) || 0));
  const closeoutCost = Math.max(0, parseFloat(inputs.closeoutCost) || 0);
  const actualSpent = Math.max(0, parseFloat(inputs.actualSpent) || 0);

  const budgetWithContingency = totalBudget * (1 + contingencyPct / 100);
  const baseMonthly = (budgetWithContingency - closeoutCost) / durationMonths;
  const monthlyPlanned = baseMonthly;
  const plannedCumulative = Math.min(budgetWithContingency, baseMonthly * elapsedMonths);
  const plannedPct = budgetWithContingency > 0 ? (plannedCumulative / budgetWithContingency) * 100 : 0;
  const actualVariance = actualSpent - plannedCumulative;
  const forecastTotal = actualSpent + Math.max(0, budgetWithContingency - actualSpent) ;
  const remainingBudget = budgetWithContingency - actualSpent;
  const remainingMonthly = durationMonths > elapsedMonths ? remainingBudget / (durationMonths - elapsedMonths) : 0;

  return { plannedCumulative, plannedPct, actualVariance, forecastTotal, remainingBudget, remainingMonthly, monthlyPlanned };
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

export default function CumulativeCostCurveCalculator() {
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
    num(inputs.totalBudget) < 0 ||
    num(inputs.durationMonths) < 1 ||
    num(inputs.monthlySpend) < 0 ||
    num(inputs.elapsedMonths) < 0 ||
    num(inputs.contingencyPct) < 0 || num(inputs.contingencyPct) > 100 ||
    num(inputs.closeoutCost) < 0 ||
    num(inputs.actualSpent) < 0;

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
    { label: "Total Project Budget", value: fmtMoney(num(inputs.totalBudget)) },
    { label: `Contingency (${fmt(num(inputs.contingencyPct), 1)}%)`, value: fmtMoney(num(inputs.totalBudget) * (num(inputs.contingencyPct) / 100)) },
    { label: `Budget with Contingency`, value: fmtMoney(num(inputs.totalBudget) * (1 + num(inputs.contingencyPct) / 100)) },
    { label: `Closeout Cost (${fmtMoney(num(inputs.closeoutCost))})`, value: fmtMoney(num(inputs.closeoutCost)) },
    { label: `Monthly Planned Spend (${fmt(num(inputs.durationMonths))} mo)`, value: fmtMoney(result.monthlyPlanned) },
    { label: `Planned Cumulative at Month ${fmt(num(inputs.elapsedMonths))}`, value: fmtMoney(result.plannedCumulative) },
    { label: "Actual Spent to Date", value: fmtMoney(num(inputs.actualSpent)) },
    { label: "Actual vs Planned Variance", value: fmtMoney(result.actualVariance) },
    { label: "Remaining Budget", value: fmtMoney(result.remainingBudget) },
    { label: "Required Monthly Spend to Finish", value: fmtMoney(result.remainingMonthly), total: true },
    { label: "Forecast Total at Finish", value: fmtMoney(result.forecastTotal), highlight: true },
  ];

  const summaryStats = [
    { label: "Total Budget", value: fmtMoney(num(inputs.totalBudget)) },
    { label: "Duration", value: fmt(num(inputs.durationMonths)) + " months" },
    { label: "Contingency", value: fmt(num(inputs.contingencyPct), 1) + "%" },
    { label: "Budget with Contingency", value: fmtMoney(num(inputs.totalBudget) * (1 + num(inputs.contingencyPct) / 100)) },
    { label: "Monthly Planned Spend", value: fmtMoney(result.monthlyPlanned) },
    { label: "Elapsed Months", value: fmt(num(inputs.elapsedMonths)) },
    { label: "Planned Cumulative", value: fmtMoney(result.plannedCumulative) },
    { label: "Planned % of Budget", value: fmt(result.plannedPct, 1) + "%" },
    { label: "Actual Spent", value: fmtMoney(num(inputs.actualSpent)) },
    { label: "Actual vs Planned", value: fmtMoney(result.actualVariance) },
    { label: "Remaining Budget", value: fmtMoney(result.remainingBudget) },
    { label: "Remaining Monthly Rate", value: fmtMoney(result.remainingMonthly), bold: true },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cumulative Cost Curve Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cumulative Cost Curve Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ccc-budget" label="Total Project Budget" value={inputs.totalBudget} onChange={set("totalBudget")} prefix="$" />
              <NumInput id="ccc-duration" label="Project Duration" value={inputs.durationMonths} onChange={set("durationMonths")} suffix="months" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ccc-monthly" label="Monthly Spend" value={inputs.monthlySpend} onChange={set("monthlySpend")} prefix="$" suffix="/mo" />
              <NumInput id="ccc-elapsed" label="Months Elapsed" value={inputs.elapsedMonths} onChange={set("elapsedMonths")} suffix="months" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Reserves & Actuals</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ccc-contingency" label="Contingency Reserve" value={inputs.contingencyPct} onChange={set("contingencyPct")} suffix="%" />
                    <NumInput id="ccc-closeout" label="Closeout Cost" value={inputs.closeoutCost} onChange={set("closeoutCost")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="ccc-actual" label="Actual Spent to Date" value={inputs.actualSpent} onChange={set("actualSpent")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; duration must be at least 1 month; contingency between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Planned Cumulative Cost at Month {fmt(num(inputs.elapsedMonths))}</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.plannedCumulative)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.plannedPct, 1)}% of budget spent — {result.actualVariance >= 0 ? "ahead of" : "behind"} plan by {fmtMoney(Math.abs(result.actualVariance))}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Actual Spent</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(num(inputs.actualSpent))}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Variance</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.actualVariance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Remaining / Month</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.remainingMonthly)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Cost Curve Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Cumulative Cost Curve Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A cumulative cost curve calculator estimates the planned cumulative spending on a project at any point in its life, compares it against actual spending, and forecasts the rate required to finish on budget. The cumulative cost curve, often called the S-curve, is the standard tool for tracking project cost performance because it plots the total spend expected by each month, rising slowly at the start, steeply through the execution phase, and flattening at closeout. Project managers compare actual cumulative spend against the planned curve to spot overruns and underruns while there is still time to act. This calculator builds the planned curve from the budget, duration, and monthly spend, adds a contingency reserve and closeout cost, and reports the planned cumulative spend at the elapsed month, the variance against actuals, the remaining budget, and the monthly rate needed to finish on budget.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the total project budget, the project duration in months, the planned monthly spend, and the months elapsed. The model adds the contingency reserve percentage to the budget, subtracts the closeout cost, and divides the remainder across the duration to find the base monthly planned spend, then multiplies it by the elapsed months for the planned cumulative spend. With the default inputs, a $500,000 budget with a 10% contingency and a $25,000 closeout cost leaves $525,000 to spread over twelve months, or $43,750 a month, so at month six the planned cumulative spend is $262,500. The advanced options add the contingency percentage, the closeout cost, and the actual spent to date. The variance subtracts the planned cumulative from the actual, the remaining budget subtracts the actual from the budget with contingency, and the required monthly rate divides the remaining budget by the months left, showing what spending must average for the project to finish on budget.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The planned cumulative figure is the point on the S-curve the project should occupy, and the variance shows whether actual spending is running ahead of or behind the curve. A positive variance is not automatically good, because spending ahead of plan can mean work is ahead, or it can mean costs are running hot, so pair the variance with schedule progress before concluding. The required monthly rate is the forward-looking number: if it is materially above the planned monthly spend, the project must either accelerate spending, which usually means a schedule risk, or cut scope to stay within budget. The contingency reserve is a buffer for known unknowns, and spending it early is a warning sign, while finishing with it intact is a sign of accurate estimating. Update the actual spent figure monthly to keep the curve comparison honest.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="cumulative-cost-curve-calculator" />
        </div>
      </div>
    </>
  );
}