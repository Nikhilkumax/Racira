"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  indirectCosts: string;
  directLabor: string;
  directMaterials: string;
  directOther: string;
  laborHours: string;
  bidMarkupPct: string;
  gAndA: string;
}

interface Result {
  directTotal: number;
  rateOnLabor: number;
  rateOnTotal: number;
  ratePerHour: number;
  allocatedCost: number;
  bidRate: number;
  gAndAIncluded: number;
}

const DEFAULTS: Inputs = {
  indirectCosts: "180000",
  directLabor: "600000",
  directMaterials: "250000",
  directOther: "50000",
  laborHours: "15000",
  bidMarkupPct: "10",
  gAndA: "45000",
};

function calculate(inputs: Inputs): Result {
  const indirectCosts = Math.max(0, parseFloat(inputs.indirectCosts) || 0);
  const directLabor = Math.max(0, parseFloat(inputs.directLabor) || 0);
  const directMaterials = Math.max(0, parseFloat(inputs.directMaterials) || 0);
  const directOther = Math.max(0, parseFloat(inputs.directOther) || 0);
  const laborHours = Math.max(0, parseFloat(inputs.laborHours) || 0);
  const bidMarkupPct = Math.min(100, Math.max(0, parseFloat(inputs.bidMarkupPct) || 0));
  const gAndA = Math.max(0, parseFloat(inputs.gAndA) || 0);

  const directTotal = directLabor + directMaterials + directOther;
  const rateOnLabor = directLabor > 0 ? (indirectCosts / directLabor) * 100 : 0;
  const rateOnTotal = directTotal > 0 ? (indirectCosts / directTotal) * 100 : 0;
  const ratePerHour = laborHours > 0 ? indirectCosts / laborHours : 0;
  const allocatedCost = indirectCosts + gAndA;
  const bidRate = directTotal > 0 ? ((indirectCosts + gAndA) / directTotal) * 100 : 0;

  return { directTotal, rateOnLabor, rateOnTotal, ratePerHour, allocatedCost, bidRate, gAndAIncluded: gAndA };
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

export default function IndirectCostRateCalculator() {
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
    num(inputs.indirectCosts) < 0 ||
    num(inputs.directLabor) < 0 ||
    num(inputs.directMaterials) < 0 ||
    num(inputs.directOther) < 0 ||
    num(inputs.laborHours) < 0 ||
    num(inputs.bidMarkupPct) < 0 || num(inputs.bidMarkupPct) > 100 ||
    num(inputs.gAndA) < 0;

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
    { label: "Total Indirect Costs", value: fmtMoney(num(inputs.indirectCosts)) },
    { label: "Direct Labor", value: fmtMoney(num(inputs.directLabor)) },
    { label: "Direct Materials", value: fmtMoney(num(inputs.directMaterials)) },
    { label: "Other Direct Costs", value: fmtMoney(num(inputs.directOther)) },
    { label: "Total Direct Costs", value: fmtMoney(result.directTotal) },
    { label: `Indirect Rate on Direct Labor`, value: fmt(result.rateOnLabor, 1) + "%" },
    { label: `Indirect Rate on Total Direct`, value: fmt(result.rateOnTotal, 1) + "%" },
    { label: `Indirect Rate per Labor Hour`, value: fmtMoney(result.ratePerHour) },
    { label: `G&A Allocation (${fmtMoney(num(inputs.gAndA))})`, value: fmtMoney(result.gAndAIncluded) },
    { label: "Combined Indirect + G&A Rate", value: fmt(result.bidRate, 1) + "%", total: true },
    { label: "Bid Pricing Markup", value: fmt(num(inputs.bidMarkupPct), 1) + "%", highlight: true },
  ];

  const summaryStats = [
    { label: "Indirect Costs", value: fmtMoney(num(inputs.indirectCosts)) },
    { label: "Direct Labor", value: fmtMoney(num(inputs.directLabor)) },
    { label: "Direct Materials", value: fmtMoney(num(inputs.directMaterials)) },
    { label: "Other Direct", value: fmtMoney(num(inputs.directOther)) },
    { label: "Total Direct Costs", value: fmtMoney(result.directTotal) },
    { label: "Rate on Labor", value: fmt(result.rateOnLabor, 1) + "%", bold: true },
    { label: "Rate on Total Direct", value: fmt(result.rateOnTotal, 1) + "%" },
    { label: "Rate per Labor Hour", value: fmtMoney(result.ratePerHour) },
    { label: "Direct Labor Hours", value: fmt(num(inputs.laborHours)) },
    { label: "G&A Costs", value: fmtMoney(num(inputs.gAndA)) },
    { label: "Combined Rate", value: fmt(result.bidRate, 1) + "%" },
    { label: "Bid Markup", value: fmt(num(inputs.bidMarkupPct), 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Indirect Cost Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Indirect Cost Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="icr-indirect" label="Total Indirect Costs" value={inputs.indirectCosts} onChange={set("indirectCosts")} prefix="$" />
              <NumInput id="icr-labor" label="Direct Labor Costs" value={inputs.directLabor} onChange={set("directLabor")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="icr-materials" label="Direct Materials" value={inputs.directMaterials} onChange={set("directMaterials")} prefix="$" />
              <NumInput id="icr-other" label="Other Direct Costs" value={inputs.directOther} onChange={set("directOther")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Labor Hours & Pricing</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="icr-hours" label="Direct Labor Hours" value={inputs.laborHours} onChange={set("laborHours")} suffix="hrs" />
                    <NumInput id="icr-gna" label="G&A Costs" value={inputs.gAndA} onChange={set("gAndA")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="icr-markup" label="Bid Pricing Markup" value={inputs.bidMarkupPct} onChange={set("bidMarkupPct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and markup between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Indirect Cost Rate on Direct Labor</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.rateOnLabor, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.ratePerHour)} per labor hour — {fmt(result.rateOnTotal, 1)}% on total direct costs</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Direct Costs</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.directTotal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rate / Labor Hour</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.ratePerHour)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Combined + G&A Rate</span>
                <span className="font-extrabold text-red-600">{fmt(result.bidRate, 1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Indirect Rate Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Indirect Cost Rate Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An indirect cost rate calculator estimates the rate at which overhead costs should be allocated to a company's direct work, which is essential for accurate job costing, pricing, and government contract billing. Indirect costs are the expenses that support the business but cannot be traced to a specific project or product: rent, utilities, management salaries, insurance, and administrative support. Because these costs are real but unattributable, they are assigned to work through an indirect rate, which is the indirect cost pool divided by a direct cost base such as direct labor, total direct costs, or labor hours. Government contractors and grant-funded organizations negotiate these rates with their funding agencies, and every business that prices work needs them to ensure overhead is recovered. This calculator computes the rate against the three standard bases and adds a combined rate that includes general and administrative costs.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the total indirect costs, the direct labor costs, the direct materials, and the other direct costs. The total direct costs sum the labor, materials, and other lines, and the rate on direct labor divides the indirect pool by the direct labor, producing the most commonly used rate for labor-heavy businesses: with the default inputs, $180,000 of indirect costs against $600,000 of direct labor yields a 30% rate. The rate on total direct costs divides the indirect pool by the full direct base, the rate per labor hour divides it by the direct labor hours, and the advanced options add the labor hours, the general and administrative costs, and the bid pricing markup. The combined rate adds the G&A costs to the indirect pool before dividing by the total direct costs, which is the rate used when quoting fixed-price work, and the bid markup percentage is applied on top when converting cost into a selling price. The outputs give the complete family of rates for cost allocation and pricing decisions.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The rate on direct labor is the number to use for labor-driven businesses and time-and-materials contracts, while the rate on total direct costs better suits businesses with heavy materials, and the rate per labor hour works for hourly billing. The combined rate including G&A is the one that must cover all costs for fixed-price work, and if it is materially higher than your competitors' effective rates, your overhead structure needs examination. The bid markup is the profit component, and it is applied after the combined rate so that it earns profit on the recovered costs as well. For government work, the negotiated indirect rate is binding, so track the actual indirect pool and direct base quarterly and adjust interim billing rates when the year-to-date rate diverges from the negotiated rate. Re-run the calculator whenever the cost structure changes materially.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="indirect-cost-rate-calculator" />
        </div>
      </div>
    </>
  );
}