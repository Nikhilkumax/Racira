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
  ratio: number;
  cv: number;
  cvPct: number;
  sv: number;
  eac: number;
  etc: number;
  vac: number;
}

const DEFAULTS: Inputs = {
  earnedValue: "85000",
  actualCost: "95000",
  plannedValue: "80000",
  bac: "250000",
  physicalPct: "35",
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
  const ratio = actualCost > 0 ? ev / actualCost : 0;
  const cv = ev - actualCost;
  const cvPct = ev > 0 ? (cv / ev) * 100 : 0;
  const sv = ev - plannedValue;
  const eac = ratio > 0 ? bac / ratio : 0;
  const etc = eac - actualCost;
  const vac = bac - eac;

  return { ev, ratio, cv, cvPct, sv, eac, etc, vac };
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

export default function EarnedValueToActualCostRatioCalculator() {
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
    { label: "Planned Value (PV)", value: fmtMoney(num(inputs.plannedValue)) },
    { label: "Cost Variance (EV − AC)", value: fmtMoney(result.cv) },
    { label: "Cost Variance %", value: fmt(result.cvPct, 1) + "%" },
    { label: "Schedule Variance (EV − PV)", value: fmtMoney(result.sv) },
    { label: "Estimate at Completion (BAC ÷ ratio)", value: fmtMoney(result.eac) },
    { label: "Estimate to Complete", value: fmtMoney(result.etc) },
    { label: "Variance at Completion", value: fmtMoney(result.vac) },
    { label: "EV / AC Ratio (Cost Performance)", value: fmt(result.ratio, 2), total: true },
    { label: "Status", value: result.ratio >= 1 ? "Under or on budget" : "Over budget", highlight: true },
  ];

  const summaryStats = [
    { label: "Earned Value", value: fmtMoney(result.ev) },
    { label: "Actual Cost", value: fmtMoney(num(inputs.actualCost)) },
    { label: "Planned Value", value: fmtMoney(num(inputs.plannedValue)) },
    { label: "Budget at Completion", value: fmtMoney(num(inputs.bac)) },
    { label: "EV / AC Ratio", value: fmt(result.ratio, 2), bold: true },
    { label: "Cost Variance", value: fmtMoney(result.cv) },
    { label: "Cost Variance %", value: fmt(result.cvPct, 1) + "%" },
    { label: "Schedule Variance", value: fmtMoney(result.sv) },
    { label: "EAC", value: fmtMoney(result.eac) },
    { label: "ETC", value: fmtMoney(result.etc) },
    { label: "VAC", value: fmtMoney(result.vac) },
    { label: "Physical % Complete", value: fmt(num(inputs.physicalPct), 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Earned Value to Actual Cost Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Earned Value to Actual Cost Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="evac-ev" label="Earned Value (EV)" value={inputs.earnedValue} onChange={set("earnedValue")} prefix="$" />
              <NumInput id="evac-ac" label="Actual Cost (AC)" value={inputs.actualCost} onChange={set("actualCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="evac-pv" label="Planned Value (PV)" value={inputs.plannedValue} onChange={set("plannedValue")} prefix="$" />
              <NumInput id="evac-bac" label="Budget at Completion" value={inputs.bac} onChange={set("bac")} prefix="$" />
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
                    <NumInput id="evac-pct" label="Physical % Complete" value={inputs.physicalPct} onChange={set("physicalPct")} suffix="%" />
                  </div>
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Use % Complete for EV</div>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
                        <input type="radio" name="evac-ev-source" checked={inputs.usePhysicalEv === "no"} onChange={() => set("usePhysicalEv")("no")} className="accent-primary h-4 w-4" />
                        No — use EV input
                      </label>
                      <label className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
                        <input type="radio" name="evac-ev-source" checked={inputs.usePhysicalEv === "yes"} onChange={() => set("usePhysicalEv")("yes")} className="accent-primary h-4 w-4" />
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Earned Value / Actual Cost Ratio</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.ratio, 2)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.ratio >= 1 ? "Under or on budget" : "Over budget"} — CV {fmtMoney(result.cv)} — EAC {fmtMoney(result.eac)}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Earned Value</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.ev)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost Variance</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.cv)}</span>
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
                    <th className="py-2.5 pl-4 pr-3">Earned Value Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Earned Value to Actual Cost Ratio Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An earned value to actual cost ratio calculator measures how efficiently a project is spending its budget by comparing the value of the work actually completed against the cost actually incurred. The ratio, which earned value management practitioners call the cost performance index, divides the earned value, the budgeted cost of the work completed, by the actual cost of that work. A ratio of one means the project is earning exactly what it spends; a ratio below one means it is over budget, because the completed work is worth less than what it cost; and a ratio above one means it is under budget. Because the ratio scales across projects of any size, it is the standard way to compare cost health between projects and to forecast the final cost of a project that is already over or under budget. This calculator also derives the cost variance, schedule variance, and the full family of completion forecasts from the same inputs.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the earned value, the actual cost, the planned value, and the budget at completion. The earned value is the budgeted cost of the work completed to date, which with the default inputs is $85,000 of work earned against $95,000 actually spent, producing a ratio of 0.89 and a negative cost variance of $10,000. The cost variance is the earned value minus the actual cost, and the cost variance percentage expresses it relative to the earned value. The schedule variance subtracts the planned value from the earned value, showing whether the project is ahead of or behind its planned work. The advanced options let you compute the earned value from the physical percentage complete instead, multiplying the percentage by the budget at completion, which is the standard approach when the work can be measured physically. The estimate at completion divides the budget by the ratio, the estimate to complete subtracts the actual cost from that figure, and the variance at completion shows the projected overrun or underrun against the original budget.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The ratio is the headline number, and the status row applies the standard rule: at or above 1.0 the project is on or under budget, below 1.0 it is over budget. The variance at completion is the number that matters most for decision-making, because it converts today's inefficiency into the projected final overrun, and a VAC of negative $30,000 means the project is on track to finish $30,000 over budget at the current burn rate. The estimate at completion is the figure to report to stakeholders instead of the original budget once the project has meaningful history. Remember that the ratio assumes the current cost performance continues, which is the most common and most conservative assumption, and projects that correct course will do better than the forecast. Update the inputs monthly as earned value and actual cost figures are reported, and investigate any ratio below 0.95 promptly, since cost problems compound the longer they run.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="earned-value-to-actual-cost-ratio-calculator" />
        </div>
      </div>
    </>
  );
}