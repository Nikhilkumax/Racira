"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  earnedValue: string;
  actualCost: string;
  plannedValue: string;
  bac: string;
  physicalPct: string;
  usePhysicalEv: string;
}

interface Result {
  ev: number;
  cv: number;
  cvPct: number;
  cpi: number;
  sv: number;
  spi: number;
  eac: number;
  etc: number;
}

const DEFAULTS: Inputs = {
  earnedValue: "95000",
  actualCost: "110000",
  plannedValue: "90000",
  bac: "300000",
  physicalPct: "32",
  usePhysicalEv: "no",
};

function calculate(inputs: Inputs): Result {
  const earnedValue = Math.max(0, parseFloat(inputs.earnedValue) || 0);
  const actualCost = Math.max(0, parseFloat(inputs.actualCost) || 0);
  const plannedValue = Math.max(0, parseFloat(inputs.plannedValue) || 0);
  const bac = Math.max(0, parseFloat(inputs.bac) || 0);
  const physicalPct = Math.min(100, Math.max(0, parseFloat(inputs.physicalPct) || 0));
  const usePhysicalEv = inputs.usePhysicalEv === "yes";

  const ev = usePhysicalEv ? bac * (physicalPct / 100) : earnedValue;
  const cv = ev - actualCost;
  const cvPct = ev > 0 ? (cv / ev) * 100 : 0;
  const cpi = actualCost > 0 ? ev / actualCost : 0;
  const sv = ev - plannedValue;
  const spi = plannedValue > 0 ? ev / plannedValue : 0;
  const eac = cpi > 0 ? bac / cpi : 0;
  const etc = eac - actualCost;

  return { ev, cv, cvPct, cpi, sv, spi, eac, etc };
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

export default function CostVarianceCvCalculator() {
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
    num(inputs.earnedValue) < 0 ||
    num(inputs.actualCost) < 0 ||
    num(inputs.plannedValue) < 0 ||
    num(inputs.bac) < 0 ||
    num(inputs.physicalPct) < 0 || num(inputs.physicalPct) > 100;

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
    { label: "Earned Value (EV)", value: fmtMoney(result.ev) },
    { label: "Actual Cost (AC)", value: fmtMoney(num(inputs.actualCost)) },
    { label: "Cost Variance (CV = EV − AC)", value: fmtMoney(result.cv) },
    { label: "Cost Variance % (CV ÷ EV)", value: fmt(result.cvPct, 1) + "%" },
    { label: "Cost Performance Index (EV ÷ AC)", value: fmt(result.cpi, 2) },
    { label: "Schedule Variance (EV − PV)", value: fmtMoney(result.sv) },
    { label: "Schedule Performance Index (EV ÷ PV)", value: fmt(result.spi, 2) },
    { label: "Estimate at Completion (BAC ÷ CPI)", value: fmtMoney(result.eac) },
    { label: "Estimate to Complete (EAC − AC)", value: fmtMoney(result.etc) },
    { label: "Cost Variance", value: fmtMoney(result.cv), total: true },
    { label: "Status", value: result.cv >= 0 ? "Under or on budget" : "Over budget", highlight: true },
  ];

  const summaryStats = [
    { label: "Earned Value", value: fmtMoney(result.ev) },
    { label: "Actual Cost", value: fmtMoney(num(inputs.actualCost)) },
    { label: "Planned Value", value: fmtMoney(num(inputs.plannedValue)) },
    { label: "Budget at Completion", value: fmtMoney(num(inputs.bac)) },
    { label: "Cost Variance", value: fmtMoney(result.cv), bold: true },
    { label: "CV %", value: fmt(result.cvPct, 1) + "%" },
    { label: "CPI", value: fmt(result.cpi, 2) },
    { label: "Schedule Variance", value: fmtMoney(result.sv) },
    { label: "SPI", value: fmt(result.spi, 2) },
    { label: "EAC", value: fmtMoney(result.eac) },
    { label: "ETC", value: fmtMoney(result.etc) },
    { label: "Physical % Complete", value: fmt(num(inputs.physicalPct), 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cost Variance (CV) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost Variance (CV) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cv-ev" label="Earned Value (EV)" value={inputs.earnedValue} onChange={set("earnedValue")} prefix="$" />
              <NumInput id="cv-ac" label="Actual Cost (AC)" value={inputs.actualCost} onChange={set("actualCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cv-pv" label="Planned Value (PV)" value={inputs.plannedValue} onChange={set("plannedValue")} prefix="$" />
              <NumInput id="cv-bac" label="Budget at Completion" value={inputs.bac} onChange={set("bac")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Alternative EV Calculation</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="cv-pct" label="Physical % Complete" value={inputs.physicalPct} onChange={set("physicalPct")} suffix="%" />
                  </div>
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Use % Complete for EV</div>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
                        <input type="radio" name="cv-ev-source" checked={inputs.usePhysicalEv === "no"} onChange={() => set("usePhysicalEv")("no")} className="accent-primary h-4 w-4" />
                        No — use EV input
                      </label>
                      <label className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
                        <input type="radio" name="cv-ev-source" checked={inputs.usePhysicalEv === "yes"} onChange={() => set("usePhysicalEv")("yes")} className="accent-primary h-4 w-4" />
                        Yes — EV = % × BAC
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and % complete between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cost Variance</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.cv)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.cv >= 0 ? "Under or on budget" : "Over budget"} — CPI {fmt(result.cpi, 2)} — EAC {fmtMoney(result.eac)}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CV %</span>
                <span className="font-extrabold text-amber-600">{fmt(result.cvPct, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CPI</span>
                <span className="font-extrabold text-amber-600">{fmt(result.cpi, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">EAC</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.eac)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Cost Variance Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Cost Variance Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A cost variance calculator measures whether a project is on budget by comparing the value of the work actually completed against the cost actually incurred. Cost variance is one of the core metrics of earned value management, and it is computed as the earned value minus the actual cost: a positive variance means the project has delivered more value than it has spent, while a negative variance means it is over budget. Unlike comparing the budget against spending, which can be fooled by a project that is behind schedule and therefore spending less, cost variance ties the spending to the work actually performed, so it isolates cost efficiency from schedule progress. This calculator also derives the cost variance percentage, the cost performance index, the schedule variance and index, and the completion forecasts that tell you where the project is heading.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the earned value, the actual cost, the planned value, and the budget at completion. The cost variance subtracts the actual cost from the earned value: with the default inputs, $95,000 of earned value against $110,000 of actual cost produces a negative variance of $15,000. The cost variance percentage divides the variance by the earned value, expressing the overrun relative to the work performed, and the cost performance index divides the earned value by the actual cost, giving a ratio of 0.86 that shows the project is earning 86 cents for every dollar spent. The schedule variance subtracts the planned value from the earned value, and the schedule performance index divides the earned value by the planned value. The advanced options let you compute the earned value from the physical percentage complete instead, multiplying it by the budget at completion. The estimate at completion divides the budget by the cost performance index, and the estimate to complete subtracts the actual cost from it, forecasting the remaining spend at the current efficiency rate.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The cost variance is the snapshot of today's cost health, and the variance percentage is the normalized version that can be compared across projects of different sizes, with anything worse than negative 10% typically warranting intervention. The cost performance index is the number to track over time, since a consistent downward trend predicts the final cost, and the estimate at completion converts that trend into the projected total, which is the figure to report instead of the original budget once the project is over halfway done. The schedule variance answers a different question, and a project can be simultaneously over budget on cost and behind on schedule, with the two problems compounding. Investigate negative variances promptly, separating the causes into rate increases, scope growth, and inefficiency, because each requires a different corrective action. Update the inputs monthly with actual cost reports to keep the forecast current.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="cost-variance-cv-calculator" />
        </div>
      </div>
    </>
  );
}