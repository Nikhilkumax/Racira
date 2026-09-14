"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  laborHours: string;
  hourlyRate: string;
  materialsCost: string;
  equipmentCost: string;
  subcontractorCost: string;
  overheadPct: string;
  contingencyPct: string;
  profitPct: string;
}

interface Result {
  laborCost: number;
  baseCost: number;
  overheadCost: number;
  contingency: number;
  profit: number;
  totalEstimate: number;
  costPerHour: number;
}

const DEFAULTS: Inputs = {
  laborHours: "1200",
  hourlyRate: "65",
  materialsCost: "45000",
  equipmentCost: "25000",
  subcontractorCost: "60000",
  overheadPct: "15",
  contingencyPct: "10",
  profitPct: "8",
};

function calculate(inputs: Inputs): Result {
  const laborHours = Math.max(0, parseFloat(inputs.laborHours) || 0);
  const hourlyRate = Math.max(0, parseFloat(inputs.hourlyRate) || 0);
  const materialsCost = Math.max(0, parseFloat(inputs.materialsCost) || 0);
  const equipmentCost = Math.max(0, parseFloat(inputs.equipmentCost) || 0);
  const subcontractorCost = Math.max(0, parseFloat(inputs.subcontractorCost) || 0);
  const overheadPct = Math.min(200, Math.max(0, parseFloat(inputs.overheadPct) || 0));
  const contingencyPct = Math.min(200, Math.max(0, parseFloat(inputs.contingencyPct) || 0));
  const profitPct = Math.min(200, Math.max(0, parseFloat(inputs.profitPct) || 0));

  const laborCost = laborHours * hourlyRate;
  const baseCost = laborCost + materialsCost + equipmentCost + subcontractorCost;
  const overheadCost = baseCost * (overheadPct / 100);
  const subtotalWithOverhead = baseCost + overheadCost;
  const contingency = subtotalWithOverhead * (contingencyPct / 100);
  const profit = (subtotalWithOverhead + contingency) * (profitPct / 100);
  const totalEstimate = subtotalWithOverhead + contingency + profit;
  const costPerHour = laborHours > 0 ? totalEstimate / laborHours : 0;

  return { laborCost, baseCost, overheadCost, contingency, profit, totalEstimate, costPerHour };
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

export default function ProjectCostEstimateCalculator() {
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
    num(inputs.laborHours) < 0 ||
    num(inputs.hourlyRate) < 0 ||
    num(inputs.materialsCost) < 0 ||
    num(inputs.equipmentCost) < 0 ||
    num(inputs.subcontractorCost) < 0 ||
    num(inputs.overheadPct) < 0 || num(inputs.overheadPct) > 200 ||
    num(inputs.contingencyPct) < 0 || num(inputs.contingencyPct) > 200 ||
    num(inputs.profitPct) < 0 || num(inputs.profitPct) > 200;

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
    { label: `Labor (${fmt(num(inputs.laborHours))} hrs × ${fmtMoney(num(inputs.hourlyRate))})`, value: fmtMoney(result.laborCost) },
    { label: "Materials", value: fmtMoney(num(inputs.materialsCost)) },
    { label: "Equipment", value: fmtMoney(num(inputs.equipmentCost)) },
    { label: "Subcontractors", value: fmtMoney(num(inputs.subcontractorCost)) },
    { label: "Base Cost", value: fmtMoney(result.baseCost) },
    { label: `Overhead (${fmt(num(inputs.overheadPct), 1)}%)`, value: fmtMoney(result.overheadCost) },
    { label: `Contingency (${fmt(num(inputs.contingencyPct), 1)}%)`, value: fmtMoney(result.contingency) },
    { label: `Profit (${fmt(num(inputs.profitPct), 1)}%)`, value: fmtMoney(result.profit) },
    { label: "Total Project Cost Estimate", value: fmtMoney(result.totalEstimate), total: true },
    { label: "Cost per Labor Hour", value: fmtMoney(result.costPerHour), highlight: true },
  ];

  const summaryStats = [
    { label: "Labor Hours", value: fmt(num(inputs.laborHours)) },
    { label: "Hourly Rate", value: fmtMoney(num(inputs.hourlyRate)) },
    { label: "Labor Cost", value: fmtMoney(result.laborCost) },
    { label: "Materials", value: fmtMoney(num(inputs.materialsCost)) },
    { label: "Equipment", value: fmtMoney(num(inputs.equipmentCost)) },
    { label: "Subcontractors", value: fmtMoney(num(inputs.subcontractorCost)) },
    { label: "Base Cost", value: fmtMoney(result.baseCost) },
    { label: "Overhead", value: fmtMoney(result.overheadCost) },
    { label: "Contingency", value: fmtMoney(result.contingency) },
    { label: "Profit", value: fmtMoney(result.profit) },
    { label: "Total Estimate", value: fmtMoney(result.totalEstimate), bold: true },
    { label: "Cost per Labor Hour", value: fmtMoney(result.costPerHour) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Project Cost Estimate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Project Cost Estimate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pce-hours" label="Labor Hours" value={inputs.laborHours} onChange={set("laborHours")} suffix="hrs" />
              <NumInput id="pce-rate" label="Average Hourly Rate" value={inputs.hourlyRate} onChange={set("hourlyRate")} prefix="$" suffix="/hr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pce-materials" label="Materials Cost" value={inputs.materialsCost} onChange={set("materialsCost")} prefix="$" />
              <NumInput id="pce-equipment" label="Equipment Cost" value={inputs.equipmentCost} onChange={set("equipmentCost")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Subcontractors</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="pce-sub" label="Subcontractor Cost" value={inputs.subcontractorCost} onChange={set("subcontractorCost")} prefix="$" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Overhead, Risk & Profit</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="pce-overhead" label="Overhead" value={inputs.overheadPct} onChange={set("overheadPct")} suffix="%" />
                    <NumInput id="pce-contingency" label="Contingency" value={inputs.contingencyPct} onChange={set("contingencyPct")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="pce-profit" label="Profit Margin" value={inputs.profitPct} onChange={set("profitPct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and percentage inputs between 0 and 200.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Project Cost Estimate</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalEstimate)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.baseCost)} base cost — {fmtMoney(result.costPerHour)} per labor hour</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.baseCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overhead</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.overheadCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Contingency</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.contingency)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Cost Estimate Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Project Cost Estimate Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A project cost estimate calculator assembles the complete cost of a project from its direct components and the allowances that surround them, producing the total figure that belongs in a budget or a bid. Direct costs are the ones that can be traced to the project: the labor hours multiplied by the hourly rate, the materials, the equipment, and the subcontractor charges. On top of those sit the indirect and risk allowances that every professional estimate must carry: overhead to cover the supporting cost structure, contingency for the uncertainties that every project faces, and profit for the business performing the work. This calculator builds the estimate layer by layer, applying overhead, contingency, and profit in the standard sequence, and reports the base cost, each allowance, the total estimate, and the cost per labor hour that reveals the fully loaded rate of the project's labor.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the labor hours, the average hourly rate, the materials cost, and the equipment cost. The labor cost multiplies the hours by the rate, and the base cost sums the labor, materials, equipment, and subcontractor lines: with the default inputs, 1,200 hours at $65 an hour contributes $78,000 of labor to a base cost of $208,000. The advanced options add the subcontractor cost, the overhead percentage, the contingency percentage, and the profit margin. The overhead is applied to the base cost, the contingency is applied to the subtotal including overhead, and the profit is applied to the total including contingency, which is the standard layering sequence in construction and professional services estimating. With the default settings, a 15% overhead adds $31,200, a 10% contingency adds $23,920, and an 8% profit adds $21,050, bringing the total estimate to roughly $284,000. The cost per labor hour divides the total by the labor hours, showing the fully loaded hourly rate the project really consumes.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total estimate is the budget number, and the cost per labor hour is the rate to use when comparing this project against alternatives or against your billing rate, since it reveals whether the price covers the full burden. The contingency is not padding: it is the statistical allowance for the unknowns that every project contains, and estimates that omit it fail with uncomfortable regularity, while estimates that set it by guesswork are either padded or exposed. The overhead percentage should come from your actual cost records rather than an industry default, and the profit percentage is a business decision, not an estimate input. Re-run the model as scope details firm up, tightening the labor hours and materials as the design or specification matures, and keep the three percentages constant so that changes in the estimate trace to changes in scope rather than changes in assumptions.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="project-cost-estimate-calculator" />
        </div>
      </div>
    </>
  );
}