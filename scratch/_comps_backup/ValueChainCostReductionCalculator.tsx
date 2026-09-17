"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  annualRevenue: string;
  procurementPct: string;
  operationsPct: string;
  logisticsPct: string;
  marketingPct: string;
  procurementCut: string;
  operationsCut: string;
  logisticsCut: string;
  marketingCut: string;
}

interface Result {
  procurementCost: number;
  operationsCost: number;
  logisticsCost: number;
  marketingCost: number;
  totalCost: number;
  totalSavings: number;
  savingsPct: number;
  profitLiftPct: number;
}

const DEFAULTS: Inputs = {
  annualRevenue: "10000000",
  procurementPct: "45",
  operationsPct: "25",
  logisticsPct: "12",
  marketingPct: "8",
  procurementCut: "5",
  operationsCut: "4",
  logisticsCut: "6",
  marketingCut: "3",
};

function calculate(inputs: Inputs): Result {
  const annualRevenue = Math.max(0, parseFloat(inputs.annualRevenue) || 0);
  const procurementPct = Math.min(100, Math.max(0, parseFloat(inputs.procurementPct) || 0));
  const operationsPct = Math.min(100, Math.max(0, parseFloat(inputs.operationsPct) || 0));
  const logisticsPct = Math.min(100, Math.max(0, parseFloat(inputs.logisticsPct) || 0));
  const marketingPct = Math.min(100, Math.max(0, parseFloat(inputs.marketingPct) || 0));
  const procurementCut = Math.min(100, Math.max(0, parseFloat(inputs.procurementCut) || 0));
  const operationsCut = Math.min(100, Math.max(0, parseFloat(inputs.operationsCut) || 0));
  const logisticsCut = Math.min(100, Math.max(0, parseFloat(inputs.logisticsCut) || 0));
  const marketingCut = Math.min(100, Math.max(0, parseFloat(inputs.marketingCut) || 0));

  const procurementCost = annualRevenue * (procurementPct / 100);
  const operationsCost = annualRevenue * (operationsPct / 100);
  const logisticsCost = annualRevenue * (logisticsPct / 100);
  const marketingCost = annualRevenue * (marketingPct / 100);
  const totalCost = procurementCost + operationsCost + logisticsCost + marketingCost;
  const totalSavings = procurementCost * (procurementCut / 100) + operationsCost * (operationsCut / 100) + logisticsCost * (logisticsCut / 100) + marketingCost * (marketingCut / 100);
  const savingsPct = totalCost > 0 ? (totalSavings / totalCost) * 100 : 0;
  const profitLiftPct = annualRevenue > 0 ? (totalSavings / annualRevenue) * 100 : 0;

  return { procurementCost, operationsCost, logisticsCost, marketingCost, totalCost, totalSavings, savingsPct, profitLiftPct };
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

export default function ValueChainCostReductionCalculator() {
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
    num(inputs.annualRevenue) < 0 ||
    num(inputs.procurementPct) < 0 || num(inputs.procurementPct) > 100 ||
    num(inputs.operationsPct) < 0 || num(inputs.operationsPct) > 100 ||
    num(inputs.logisticsPct) < 0 || num(inputs.logisticsPct) > 100 ||
    num(inputs.marketingPct) < 0 || num(inputs.marketingPct) > 100 ||
    num(inputs.procurementCut) < 0 || num(inputs.procurementCut) > 100 ||
    num(inputs.operationsCut) < 0 || num(inputs.operationsCut) > 100 ||
    num(inputs.logisticsCut) < 0 || num(inputs.logisticsCut) > 100 ||
    num(inputs.marketingCut) < 0 || num(inputs.marketingCut) > 100;

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
    { label: `Procurement & Sourcing (${fmt(num(inputs.procurementPct), 1)}%)`, value: fmtMoney(result.procurementCost) },
    { label: `  └ Savings at ${fmt(num(inputs.procurementCut), 1)}%`, value: fmtMoney(result.procurementCost * (num(inputs.procurementCut) / 100)) },
    { label: `Operations & Production (${fmt(num(inputs.operationsPct), 1)}%)`, value: fmtMoney(result.operationsCost) },
    { label: `  └ Savings at ${fmt(num(inputs.operationsCut), 1)}%`, value: fmtMoney(result.operationsCost * (num(inputs.operationsCut) / 100)) },
    { label: `Logistics & Distribution (${fmt(num(inputs.logisticsPct), 1)}%)`, value: fmtMoney(result.logisticsCost) },
    { label: `  └ Savings at ${fmt(num(inputs.logisticsCut), 1)}%`, value: fmtMoney(result.logisticsCost * (num(inputs.logisticsCut) / 100)) },
    { label: `Marketing & Sales (${fmt(num(inputs.marketingPct), 1)}%)`, value: fmtMoney(result.marketingCost) },
    { label: `  └ Savings at ${fmt(num(inputs.marketingCut), 1)}%`, value: fmtMoney(result.marketingCost * (num(inputs.marketingCut) / 100)) },
    { label: "Total Value Chain Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Total Annual Savings", value: fmtMoney(result.totalSavings), highlight: true },
  ];

  const summaryStats = [
    { label: "Annual Revenue", value: fmtMoney(num(inputs.annualRevenue)) },
    { label: "Procurement Cost", value: fmtMoney(result.procurementCost) },
    { label: "Operations Cost", value: fmtMoney(result.operationsCost) },
    { label: "Logistics Cost", value: fmtMoney(result.logisticsCost) },
    { label: "Marketing Cost", value: fmtMoney(result.marketingCost) },
    { label: "Total Value Chain Cost", value: fmtMoney(result.totalCost) },
    { label: "Procurement Savings", value: fmtMoney(result.procurementCost * (num(inputs.procurementCut) / 100)) },
    { label: "Operations Savings", value: fmtMoney(result.operationsCost * (num(inputs.operationsCut) / 100)) },
    { label: "Logistics Savings", value: fmtMoney(result.logisticsCost * (num(inputs.logisticsCut) / 100)) },
    { label: "Marketing Savings", value: fmtMoney(result.marketingCost * (num(inputs.marketingCut) / 100)) },
    { label: "Total Annual Savings", value: fmtMoney(result.totalSavings), bold: true },
    { label: "Profit Lift", value: "+" + fmt(result.profitLiftPct, 1) + "% of revenue" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Value Chain Cost Reduction Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Value Chain Cost Reduction Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="vc-revenue" label="Annual Revenue" value={inputs.annualRevenue} onChange={set("annualRevenue")} prefix="$" />
              <NumInput id="vc-procurement" label="Procurement Cost" value={inputs.procurementPct} onChange={set("procurementPct")} suffix="% of revenue" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="vc-operations" label="Operations Cost" value={inputs.operationsPct} onChange={set("operationsPct")} suffix="% of revenue" />
              <NumInput id="vc-logistics" label="Logistics Cost" value={inputs.logisticsPct} onChange={set("logisticsPct")} suffix="% of revenue" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Marketing & Sales</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="vc-marketing" label="Marketing & Sales Cost" value={inputs.marketingPct} onChange={set("marketingPct")} suffix="% of revenue" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Reduction Targets</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="vc-cut-proc" label="Procurement Reduction" value={inputs.procurementCut} onChange={set("procurementCut")} suffix="%" />
                    <NumInput id="vc-cut-ops" label="Operations Reduction" value={inputs.operationsCut} onChange={set("operationsCut")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="vc-cut-log" label="Logistics Reduction" value={inputs.logisticsCut} onChange={set("logisticsCut")} suffix="%" />
                    <NumInput id="vc-cut-mkt" label="Marketing Reduction" value={inputs.marketingCut} onChange={set("marketingCut")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and all percentages between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual Cost Savings</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalSavings)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.savingsPct, 1)}% of value chain cost — {fmt(result.profitLiftPct, 1)}% profit lift on revenue</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Value Chain Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.totalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Savings Rate</span>
                <span className="font-extrabold text-green-600">{fmt(result.savingsPct, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Profit Lift</span>
                <span className="font-extrabold text-green-600">+{fmt(result.profitLiftPct, 1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Value Chain Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Value Chain Cost Reduction Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A value chain cost reduction calculator estimates the savings a business can capture by reducing costs across the major stages of its value chain: procurement and sourcing, operations and production, logistics and distribution, and marketing and sales. The value chain concept, popularized by Michael Porter, describes the full set of activities a business performs to create value, and each activity is a cost center that can be attacked. Cost reduction programs fail when they treat the business as a single lump and cut across the board; they succeed when each stage is measured, benchmarked, and given a realistic reduction target. This calculator maps your revenue into the four major cost pools using industry-typical percentages, applies a reduction target to each pool, and reports the total savings, the savings rate, and the profit lift, which is the increase in profitability expressed as a percentage of revenue.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The cost pool percentages should reflect your actual cost structure rather than the defaults, which are calibrated for a mid-market manufacturer, and they should be drawn from your profit and loss statement or cost accounting system so the savings figures trace back to real budget lines. The reduction targets are applied independently to each pool, which reflects how cost programs actually work: procurement savings come from supplier consolidation and renegotiation, operations savings from process improvement and automation, logistics savings from network optimization, and marketing savings from channel efficiency, and each has a different feasible range. The profit lift percentage is the strategic headline, because it converts cost savings into the same language as revenue growth: at a typical margin, a profit lift of a few percent from cost reduction is equivalent to a much larger revenue increase. The model deliberately excludes service and quality impacts, so each target should be validated against delivery, quality, and customer experience before it is locked into the plan.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the annual revenue and the cost percentages for procurement, operations, and logistics, each entered as a share of revenue. Each cost pool is the revenue multiplied by its percentage: with the default inputs, a $10 million company spending 45% on procurement carries a $4.5 million procurement cost, and the four pools together total $9 million of value chain cost. The advanced options add the marketing and sales percentage and the four reduction targets. Each pool's savings is its cost multiplied by its reduction percentage, so a 5% procurement reduction saves $225,000, a 4% operations reduction saves $100,000, a 6% logistics reduction saves $72,000, and a 3% marketing reduction saves $24,000, for a total of $421,000. The savings rate divides the total savings by the total value chain cost, and the profit lift divides the savings by the revenue, showing how much the reduction program improves the bottom line without selling a single additional unit.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total annual savings is the budget-neutral figure that flows straight to the bottom line, and the profit lift is the metric to compare against revenue growth initiatives, since a 4% profit lift from cost reduction equals the profit contribution of a 4% revenue increase at a typical margin. The breakdown table shows which pool carries the biggest prize, and it is usually procurement, which is why sourcing and supplier consolidation programs are the classic first move. The reduction targets are commitments, not wishes: benchmark each percentage against industry practice before locking it in, and stage the program so each pool's savings is verified before the next target is set. Be wary of reduction targets that would impair quality or service, since a value chain cut that increases returns or churn is not a saving. Re-run the model quarterly as revenue and cost mixes shift.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="value-chain-cost-reduction-calculator" />
        </div>
      </div>
    </>
  );
}