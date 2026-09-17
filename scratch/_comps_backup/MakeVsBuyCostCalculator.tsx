"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  volume: string;
  inHouseVarCost: string;
  inHouseFixed: string;
  supplierPrice: string;
  defectRate: string;
  costPerDefect: string;
  qualityProgram: string;
}

interface Result {
  makeCost: number;
  buyCost: number;
  buyDefectCost: number;
  difference: number;
  pctDifference: number;
  lowerOption: string;
}

const DEFAULTS: Inputs = {
  volume: "50000",
  inHouseVarCost: "14.00",
  inHouseFixed: "200000",
  supplierPrice: "16.50",
  defectRate: "0.5",
  costPerDefect: "25",
  qualityProgram: "15000",
};

function calculate(inputs: Inputs): Result {
  const volume = Math.max(0, parseFloat(inputs.volume) || 0);
  const inHouseVarCost = Math.max(0, parseFloat(inputs.inHouseVarCost) || 0);
  const inHouseFixed = Math.max(0, parseFloat(inputs.inHouseFixed) || 0);
  const supplierPrice = Math.max(0, parseFloat(inputs.supplierPrice) || 0);
  const defectRate = Math.min(100, Math.max(0, parseFloat(inputs.defectRate) || 0));
  const costPerDefect = Math.max(0, parseFloat(inputs.costPerDefect) || 0);
  const qualityProgram = Math.max(0, parseFloat(inputs.qualityProgram) || 0);

  const makeCost = inHouseFixed + volume * inHouseVarCost + qualityProgram;
  const buyDefectCost = volume * (defectRate / 100) * costPerDefect;
  const buyCost = volume * supplierPrice + buyDefectCost;
  const difference = Math.abs(makeCost - buyCost);
  const pctDifference = Math.max(makeCost, buyCost) > 0 ? (difference / Math.max(makeCost, buyCost)) * 100 : 0;
  const lowerOption = makeCost <= buyCost ? "Make in-house" : "Buy from supplier";

  return { makeCost, buyCost, buyDefectCost, difference, pctDifference, lowerOption };
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

export default function MakeVsBuyCostCalculator() {
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
    num(inputs.volume) < 0 ||
    num(inputs.inHouseVarCost) < 0 ||
    num(inputs.inHouseFixed) < 0 ||
    num(inputs.supplierPrice) < 0 ||
    num(inputs.defectRate) < 0 || num(inputs.defectRate) > 100 ||
    num(inputs.costPerDefect) < 0 ||
    num(inputs.qualityProgram) < 0;

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
    { label: "Annual Volume", value: fmt(num(inputs.volume)) + " units" },
    { label: `In-House Variable Costs (${fmt(num(inputs.inHouseVarCost), 2)}/unit)`, value: fmtMoney(num(inputs.volume) * num(inputs.inHouseVarCost)) },
    { label: "In-House Fixed Costs", value: fmtMoney(num(inputs.inHouseFixed)) },
    { label: "In-House Quality Program", value: fmtMoney(num(inputs.qualityProgram)) },
    { label: "Total Cost to Make", value: fmtMoney(result.makeCost), total: true },
    { label: `Supplier Purchase (${fmt(num(inputs.supplierPrice), 2)}/unit)`, value: fmtMoney(num(inputs.volume) * num(inputs.supplierPrice)) },
    { label: `Supplier Defect Costs (${fmt(num(inputs.defectRate), 1)}%)`, value: fmtMoney(result.buyDefectCost) },
    { label: "Total Cost to Buy", value: fmtMoney(result.buyCost), total: true },
    { label: "Cost Difference", value: fmtMoney(result.difference), highlight: true },
    { label: "Lower-Cost Option", value: result.lowerOption },
  ];

  const summaryStats = [
    { label: "Annual Volume", value: fmt(num(inputs.volume)) + " units" },
    { label: "In-House Var Cost / Unit", value: "$" + fmt(num(inputs.inHouseVarCost), 2) },
    { label: "Supplier Price / Unit", value: "$" + fmt(num(inputs.supplierPrice), 2) },
    { label: "Total Cost to Make", value: fmtMoney(result.makeCost) },
    { label: "Total Cost to Buy", value: fmtMoney(result.buyCost) },
    { label: "Cost Difference", value: fmtMoney(result.difference), bold: true },
    { label: "Difference (% of higher)", value: result.pctDifference.toFixed(1) + "%" },
    { label: "Lower-Cost Option", value: result.lowerOption },
    { label: "Defect Rate", value: fmt(num(inputs.defectRate), 1) + "%" },
    { label: "Quality Program Cost", value: fmtMoney(num(inputs.qualityProgram)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Make vs Buy Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Make vs Buy Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="mb-volume" label="Annual Volume" value={inputs.volume} onChange={set("volume")} suffix="units" />
              <NumInput id="mb-supplier" label="Supplier Price per Unit" value={inputs.supplierPrice} onChange={set("supplierPrice")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="mb-var" label="In-House Variable Cost per Unit" value={inputs.inHouseVarCost} onChange={set("inHouseVarCost")} prefix="$" />
              <NumInput id="mb-fixed" label="In-House Fixed Costs" value={inputs.inHouseFixed} onChange={set("inHouseFixed")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Quality & Risk</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="mb-defect" label="Supplier Defect Rate" value={inputs.defectRate} onChange={set("defectRate")} suffix="%" />
                    <NumInput id="mb-defect-cost" label="Cost per Defective Unit" value={inputs.costPerDefect} onChange={set("costPerDefect")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="mb-quality" label="In-House Quality Program" value={inputs.qualityProgram} onChange={set("qualityProgram")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; defect rate must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual Cost Difference</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.difference)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.lowerOption} is the lower-cost option ({result.pctDifference.toFixed(1)}% cheaper)</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost to Make</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.makeCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Cost to Buy</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.buyCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lower-Cost Option</span>
                <span className={`font-extrabold ${result.makeCost <= result.buyCost ? "text-emerald-600" : "text-red-600"}`}>{result.lowerOption}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Make vs Buy Comparison</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Make vs Buy Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A make vs buy cost calculator compares the total annual cost of producing a component or product internally against the cost of purchasing it from an outside supplier. The make or buy decision is one of the most recurring strategic questions in manufacturing and product businesses, and it is rarely as simple as comparing the supplier's unit price with the in-house cost of production. Producing internally means carrying fixed costs like equipment, supervision, and floor space that must be spread across volume, while buying from a supplier trades those fixed costs for a per-unit price that usually looks higher but carries no fixed commitment. The honest comparison must include both options' full costs, and it should also account for quality: a supplier's lower price can disappear quickly when defective parts create rework, returns, and lost customers. This tool builds both cost models from the same volume, then shows the annual difference and which option is cheaper.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. The annual volume is the number of units needed per year, and it is the pivot of the whole analysis, because the make option's fixed costs get cheaper per unit as volume rises while the buy option stays constant per unit. The in-house variable cost per unit covers the materials and direct labor of internal production, and the in-house fixed costs cover the equipment, supervision, space, and utilities that exist only because production happens internally. The supplier price per unit is the quoted purchase price for the outsourced component. The total cost to make is the fixed costs plus the variable cost per unit times the volume, and the total cost to buy is the supplier price times the volume, plus any quality costs the supplier's parts introduce.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section prices in quality. The supplier defect rate is the share of purchased units that arrive defective or fail in use, the cost per defect is what each defective unit costs in rework, scrap, or customer impact, and the in-house quality program is the annual cost of the inspection and quality effort the business runs when it makes the part itself. The buy option therefore carries its defect cost, and the make option carries the quality program cost. The difference between the two totals is the headline result, along with the lower-cost option and the percentage difference. With the default inputs, making 50,000 units at $14.00 variable cost with $200,000 of fixed costs and a $15,000 quality program totals $915,000, while buying at $16.50 with a 0.5% defect rate costs about $831,000, so the supplier wins by roughly $84,000 a year, a difference of just over 9%.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the annual cost difference, and the lower-cost option is named directly beneath it. The most important thing to understand is how sensitive the answer is to volume: re-run the calculator at higher volume and the make option typically improves, because its fixed costs spread thinner, while the buy option's advantage often shrinks. That volume sensitivity is the core of the strategic decision, so always model the realistic range of future volume rather than a single point. Also scrutinize the quality assumptions, because a supplier defect rate that creeps up from 0.5% to 2% can erase the entire price advantage, which is exactly why quality terms belong in the supplier contract. Beyond the numbers, consider control, lead time, capacity, and intellectual property, which this model does not price. Use the calculator to establish the cost baseline, then overlay those qualitative factors to make the final call.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/make-vs-buy-cost-calculator" />
        </div>
      </div>
    </>
  );
}