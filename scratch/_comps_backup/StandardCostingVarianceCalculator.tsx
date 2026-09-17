"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  stdPrice: string;
  actPrice: string;
  stdQty: string;
  actQty: string;
  actHours: string;
  stdRate: string;
  actRate: string;
  stdHours: string;
}

interface Result {
  stdCost: number;
  actCost: number;
  priceVariance: number;
  qtyVariance: number;
  totalMaterialsVariance: number;
  laborRateVariance: number;
  laborEfficiencyVariance: number;
  totalLaborVariance: number;
  totalVariance: number;
}

const DEFAULTS: Inputs = {
  stdPrice: "2.50",
  actPrice: "2.75",
  stdQty: "10000",
  actQty: "9500",
  actHours: "4200",
  stdRate: "22.00",
  actRate: "23.50",
  stdHours: "4000",
};

function calculate(inputs: Inputs): Result {
  const stdPrice = Math.max(0, parseFloat(inputs.stdPrice) || 0);
  const actPrice = Math.max(0, parseFloat(inputs.actPrice) || 0);
  const stdQty = Math.max(0, parseFloat(inputs.stdQty) || 0);
  const actQty = Math.max(0, parseFloat(inputs.actQty) || 0);
  const actHours = Math.max(0, parseFloat(inputs.actHours) || 0);
  const stdRate = Math.max(0, parseFloat(inputs.stdRate) || 0);
  const actRate = Math.max(0, parseFloat(inputs.actRate) || 0);
  const stdHours = Math.max(0, parseFloat(inputs.stdHours) || 0);

  const stdCost = stdPrice * stdQty;
  const actCost = actPrice * actQty;
  const priceVariance = (actPrice - stdPrice) * actQty;
  const qtyVariance = (actQty - stdQty) * stdPrice;
  const totalMaterialsVariance = priceVariance + qtyVariance;

  const laborRateVariance = (actRate - stdRate) * actHours;
  const laborEfficiencyVariance = (actHours - stdHours) * stdRate;
  const totalLaborVariance = laborRateVariance + laborEfficiencyVariance;
  const totalVariance = totalMaterialsVariance + totalLaborVariance;

  return { stdCost, actCost, priceVariance, qtyVariance, totalMaterialsVariance, laborRateVariance, laborEfficiencyVariance, totalLaborVariance, totalVariance };
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
const fmtVar = (n: number) => (n >= 0 ? "$" + fmt(Math.round(n)) + " U" : "-$" + fmt(Math.round(-n)) + " F");

export default function StandardCostingVarianceCalculator() {
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
    num(inputs.stdPrice) < 0 || num(inputs.actPrice) < 0 ||
    num(inputs.stdQty) < 0 || num(inputs.actQty) < 0 ||
    num(inputs.actHours) < 0 || num(inputs.stdRate) < 0 ||
    num(inputs.actRate) < 0 || num(inputs.stdHours) < 0;

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
    { label: "Actual Material Cost", value: fmtMoney(result.actCost) },
    { label: "Standard Material Cost", value: fmtMoney(result.stdCost) },
    { label: "Materials Price Variance", value: fmtVar(result.priceVariance), colorClass: result.priceVariance > 0 ? "text-red-600" : "text-emerald-600" },
    { label: "Materials Quantity Variance", value: fmtVar(result.qtyVariance), colorClass: result.qtyVariance > 0 ? "text-red-600" : "text-emerald-600" },
    { label: "Total Materials Variance", value: fmtVar(result.totalMaterialsVariance), total: true, colorClass: result.totalMaterialsVariance > 0 ? "text-red-600" : "text-emerald-600" },
    { label: "Labor Rate Variance", value: fmtVar(result.laborRateVariance), colorClass: result.laborRateVariance > 0 ? "text-red-600" : "text-emerald-600" },
    { label: "Labor Efficiency Variance", value: fmtVar(result.laborEfficiencyVariance), colorClass: result.laborEfficiencyVariance > 0 ? "text-red-600" : "text-emerald-600" },
    { label: "Total Labor Variance", value: fmtVar(result.totalLaborVariance), colorClass: result.totalLaborVariance > 0 ? "text-red-600" : "text-emerald-600" },
    { label: "Total Manufacturing Variance", value: fmtVar(result.totalVariance), highlight: true, colorClass: result.totalVariance > 0 ? "text-amber-700" : "text-emerald-700" },
  ];

  const summaryStats = [
    { label: "Standard Price / Unit", value: "$" + fmt(num(inputs.stdPrice), 2) },
    { label: "Actual Price / Unit", value: "$" + fmt(num(inputs.actPrice), 2) },
    { label: "Standard Quantity", value: fmt(num(inputs.stdQty)) },
    { label: "Actual Quantity", value: fmt(num(inputs.actQty)) },
    { label: "Materials Price Variance", value: fmtVar(result.priceVariance) },
    { label: "Materials Quantity Variance", value: fmtVar(result.qtyVariance) },
    { label: "Total Materials Variance", value: fmtVar(result.totalMaterialsVariance), bold: true },
    { label: "Labor Rate Variance", value: fmtVar(result.laborRateVariance) },
    { label: "Labor Efficiency Variance", value: fmtVar(result.laborEfficiencyVariance) },
    { label: "Total Labor Variance", value: fmtVar(result.totalLaborVariance) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Standard Costing Variance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Standard Costing Variance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="variance-std-price" label="Standard Price per Unit" value={inputs.stdPrice} onChange={set("stdPrice")} prefix="$" />
              <NumInput id="variance-act-price" label="Actual Price per Unit" value={inputs.actPrice} onChange={set("actPrice")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="variance-std-qty" label="Standard Quantity" value={inputs.stdQty} onChange={set("stdQty")} suffix="units" />
              <NumInput id="variance-act-qty" label="Actual Quantity" value={inputs.actQty} onChange={set("actQty")} suffix="units" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Labor Rate & Efficiency</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="variance-act-hours" label="Actual Labor Hours" value={inputs.actHours} onChange={set("actHours")} suffix="hrs" />
                    <NumInput id="variance-std-hours" label="Standard Hours for Output" value={inputs.stdHours} onChange={set("stdHours")} suffix="hrs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="variance-std-rate" label="Standard Labor Rate" value={inputs.stdRate} onChange={set("stdRate")} prefix="$" />
                    <NumInput id="variance-act-rate" label="Actual Labor Rate" value={inputs.actRate} onChange={set("actRate")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All prices, quantities, hours, and rates must be non-negative values.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Materials Variance</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtVar(result.totalMaterialsVariance)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.totalMaterialsVariance > 0 ? "Unfavorable — actual materials cost exceeded standard by " + fmtMoney(result.totalMaterialsVariance) : "Favorable — actual materials cost beat standard by " + fmtMoney(-result.totalMaterialsVariance)}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Price Variance</span>
                <span className={`font-extrabold ${result.priceVariance > 0 ? "text-amber-600" : "text-emerald-600"}`}>{fmtVar(result.priceVariance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quantity Variance</span>
                <span className={`font-extrabold ${result.qtyVariance > 0 ? "text-amber-600" : "text-emerald-600"}`}>{fmtVar(result.qtyVariance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Variance</span>
                <span className={`font-extrabold ${result.totalVariance > 0 ? "text-red-600" : "text-emerald-600"}`}>{fmtVar(result.totalVariance)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Variance Analysis</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.colorClass || "text-foreground"}`}>{r.value}</td>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Standard Costing Variance Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A standard costing variance calculator measures the difference between what a product was expected to cost and what it actually cost to produce. Manufacturing companies set standard costs in advance, based on expected material prices, labor rates, and production quantities, and then compare actual results against those standards each period. The gap between the two is called a variance, and it is the single most useful early warning signal a production operation has: variances tell management where money is leaking out of the process, whether through rising material prices, inefficient use of materials, higher labor rates, or slower production. This tool separates the total variance into its component parts, so instead of just seeing that costs were over budget, you can see exactly how much of the overrun came from paying more for materials versus using more materials than planned. The same decomposition is applied to labor, isolating how much of the labor overrun came from wage rates versus how much came from hours worked.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The materials side of the calculator uses four inputs: the standard price per unit, the actual price per unit, the standard quantity, and the actual quantity used. The materials price variance is the difference between the actual and standard price multiplied by the actual quantity purchased, which isolates the impact of paying a different price for the materials. The materials quantity variance is the difference between the actual and standard quantity multiplied by the standard price, which isolates the impact of using more or fewer materials than planned. Because both variances are measured from the same actual cost baseline, they add up exactly to the total materials variance, which is also the difference between the actual material cost and the standard material cost. A variance above zero is unfavorable, meaning it added cost; a variance below zero is favorable, meaning it saved cost. With the default values, paying $2.75 instead of the standard $2.50 per unit on 9,500 units creates a $2,375 unfavorable price variance, while using 500 fewer units than the 10,000 standard creates a $1,250 favorable quantity variance, for a net $1,125 unfavorable total.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section extends the same framework to direct labor. The labor rate variance is the difference between the actual and standard hourly rate multiplied by the actual hours worked, and the labor efficiency variance is the difference between the actual hours worked and the standard hours allowed for the output produced, multiplied by the standard rate. Standard hours for output is the number of hours the production plan says the completed units should have required. Together with the materials variances, the labor variances roll up into a total manufacturing variance that shows the full cost impact of the period's production versus plan. Every variance is signed and labeled favorable or unfavorable, so the report can be handed straight to a production meeting without interpretation.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total materials variance, because material cost is usually the largest and most volatile component of manufacturing cost. When the price variance is unfavorable, procurement should investigate supplier pricing, contract terms, and purchasing timing; when the quantity variance is unfavorable, the production floor should investigate scrap, rework, and setup waste. The two variances frequently move in opposite directions, as when buying cheaper materials increases scrap, which is exactly why the decomposition matters more than the total. The labor variances follow the same logic: an unfavorable rate variance suggests overtime or wage inflation, while an unfavorable efficiency variance suggests training gaps, equipment downtime, or scheduling problems. Use the calculator with your actual period numbers to build a variance report, then investigate any variance large enough to move your margin. The tool accepts any standard and actual figures, so it works for weekly, monthly, or annual analysis, and the favorable and unfavorable color coding makes problem areas visible at a glance.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/standard-costing-variance-calculator" />
        </div>
      </div>
    </>
  );
}