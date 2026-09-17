"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  fixedCosts: string;
  varCostPerUnit: string;
  unitsProduced: string;
  unitsSold: string;
  overhead: string;
  scrapRate: string;
}

interface Result {
  totalCost: number;
  variableTotal: number;
  totalFixed: number;
  goodUnits: number;
  scrapUnits: number;
  unitCost: number;
  fixedPerUnit: number;
  costPerSoldUnit: number;
}

const DEFAULTS: Inputs = {
  fixedCosts: "120000",
  varCostPerUnit: "18.50",
  unitsProduced: "15000",
  unitsSold: "14000",
  overhead: "30000",
  scrapRate: "2",
};

function calculate(inputs: Inputs): Result {
  const fixedCosts = Math.max(0, parseFloat(inputs.fixedCosts) || 0);
  const varCostPerUnit = Math.max(0, parseFloat(inputs.varCostPerUnit) || 0);
  const unitsProduced = Math.max(0, parseFloat(inputs.unitsProduced) || 0);
  const unitsSold = Math.max(0, parseFloat(inputs.unitsSold) || 0);
  const overhead = Math.max(0, parseFloat(inputs.overhead) || 0);
  const scrapRate = Math.min(100, Math.max(0, parseFloat(inputs.scrapRate) || 0));

  const totalFixed = fixedCosts + overhead;
  const variableTotal = varCostPerUnit * unitsProduced;
  const totalCost = totalFixed + variableTotal;
  const scrapUnits = (unitsProduced * scrapRate) / 100;
  const goodUnits = unitsProduced - scrapUnits;
  const unitCost = goodUnits > 0 ? totalCost / goodUnits : 0;
  const fixedPerUnit = goodUnits > 0 ? totalFixed / goodUnits : 0;
  const costPerSoldUnit = unitsSold > 0 ? totalCost / unitsSold : 0;

  return { totalCost, variableTotal, totalFixed, goodUnits, scrapUnits, unitCost, fixedPerUnit, costPerSoldUnit };
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

export default function UnitCostCalculator() {
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
    num(inputs.fixedCosts) < 0 ||
    num(inputs.varCostPerUnit) < 0 ||
    num(inputs.unitsProduced) <= 0 ||
    num(inputs.unitsSold) < 0 ||
    num(inputs.overhead) < 0 ||
    num(inputs.scrapRate) < 0 || num(inputs.scrapRate) > 100;

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
    { label: "Fixed Production Costs", value: fmtMoney(num(inputs.fixedCosts)) },
    { label: "Marketing & Admin Overhead", value: fmtMoney(num(inputs.overhead)) },
    { label: `Variable Costs (${fmt(num(inputs.varCostPerUnit), 2)} × ${fmt(num(inputs.unitsProduced))})`, value: fmtMoney(result.variableTotal) },
    { label: "Total Production Cost", value: fmtMoney(result.totalCost), total: true },
    { label: `Scrap Units (${fmt(num(inputs.scrapRate), 1)}%)`, value: fmt(result.scrapUnits) },
    { label: "Good Units Available", value: fmt(result.goodUnits) },
    { label: "Fixed Cost per Unit", value: "$" + fmt(result.fixedPerUnit, 2) },
    { label: "Variable Cost per Unit", value: "$" + fmt(num(inputs.varCostPerUnit), 2) },
    { label: "Total Unit Cost", value: "$" + fmt(result.unitCost, 2), highlight: true },
    { label: "Cost per Sold Unit", value: "$" + fmt(result.costPerSoldUnit, 2) },
  ];

  const summaryStats = [
    { label: "Units Produced", value: fmt(num(inputs.unitsProduced)) },
    { label: "Units Sold", value: fmt(num(inputs.unitsSold)) },
    { label: "Fixed Production Costs", value: fmtMoney(num(inputs.fixedCosts)) },
    { label: "Admin Overhead", value: fmtMoney(num(inputs.overhead)) },
    { label: "Variable Cost / Unit", value: "$" + fmt(num(inputs.varCostPerUnit), 2) },
    { label: "Total Production Cost", value: fmtMoney(result.totalCost) },
    { label: "Good Units", value: fmt(result.goodUnits) },
    { label: "Fixed Cost / Unit", value: "$" + fmt(result.fixedPerUnit, 2) },
    { label: "Total Unit Cost", value: "$" + fmt(result.unitCost, 2), bold: true },
    { label: "Cost per Sold Unit", value: "$" + fmt(result.costPerSoldUnit, 2) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Unit Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Unit Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="unit-fixed" label="Total Fixed Costs" value={inputs.fixedCosts} onChange={set("fixedCosts")} prefix="$" />
              <NumInput id="unit-var" label="Variable Cost per Unit" value={inputs.varCostPerUnit} onChange={set("varCostPerUnit")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="unit-produced" label="Units Produced" value={inputs.unitsProduced} onChange={set("unitsProduced")} suffix="units" />
              <NumInput id="unit-sold" label="Units Sold" value={inputs.unitsSold} onChange={set("unitsSold")} suffix="units" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Overhead & Yield</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="unit-overhead" label="Marketing & Admin Overhead" value={inputs.overhead} onChange={set("overhead")} prefix="$" />
                    <NumInput id="unit-scrap" label="Scrap / Defect Rate" value={inputs.scrapRate} onChange={set("scrapRate")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Units produced must be greater than zero; all costs must be non-negative; scrap rate must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Unit Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">${fmt(result.unitCost, 2)}</div>
              <div className="text-sm text-muted-foreground font-medium">${fmt(result.fixedPerUnit, 2)} fixed + ${fmt(num(inputs.varCostPerUnit), 2)} variable per good unit</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Production Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.totalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fixed Cost / Unit</span>
                <span className="font-extrabold text-amber-600">${fmt(result.fixedPerUnit, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Sold Unit</span>
                <span className="font-extrabold text-red-600">${fmt(result.costPerSoldUnit, 2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Cost Structure</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Unit Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A unit cost calculator works out the true cost of producing a single unit of product by dividing total production cost by the number of units produced. Unit cost is the most fundamental number in a manufacturing business: it is the baseline against which every selling price, margin, and profitability decision is measured, and getting it wrong by even a small amount can turn a supposedly profitable product into a loss-maker. The challenge is that production cost is a mixture of fixed costs, which stay the same whether you make one unit or ten thousand, and variable costs, which rise with every unit produced. This tool separates the two, adds the overhead costs that are easy to forget, and accounts for the scrap and defects that mean not every unit you pay to produce is actually sellable. The result is a per-unit figure that reflects the real economics of the production run rather than a rough rule-of-thumb estimate.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. Total fixed costs cover the expenses that do not change with volume, such as rent, salaried staff, equipment leases, and insurance for the production period. The variable cost per unit covers materials, direct labor, and anything else that scales with each unit made. Units produced is the size of the production run, and units sold is how many of those units actually get sold in the period. The total variable cost is the variable cost per unit multiplied by the run size, and the total production cost adds the fixed costs on top. Dividing that total by the number of units produced gives the average unit cost, but with one important refinement: the Advanced Options section lets you add marketing and administrative overhead and a scrap rate, so the fixed cost is spread only over the good units that survive the production process.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The advanced inputs make the unit cost honest. Marketing and admin overhead is the share of company-wide selling, general, and administrative expense that the product must carry, and it is added to the fixed cost base. The scrap or defect rate is the percentage of units that fail quality checks and cannot be sold; the good units are the produced units minus the scrapped ones, and the total cost is divided by the good units to get the total unit cost. The fixed cost per unit is the total fixed cost divided by good units, and adding the variable cost per unit to it reproduces the total unit cost, which gives a useful cross-check. The cost per sold unit divides the total cost by the number of units actually sold, which is the figure that matters when production exceeds sales and inventory builds up. With the default inputs, a $120,000 fixed base plus $30,000 of overhead and $18.50 of variable cost on a 15,000-unit run with a 2% scrap rate produces a total unit cost of about $29.08.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total unit cost, and the single most important insight is how much of it is fixed cost per unit, because that portion falls automatically as volume rises. If the fixed cost per unit is high, the fastest way to lower unit cost is to run larger batches or consolidate production, whereas if variable cost dominates, the lever is material sourcing and labor productivity. Compare the total unit cost against your selling price to confirm the margin per unit, and against the cost per sold unit when inventory builds up, because producing more than you sell raises the effective cost of each unit that actually leaves the building. Track unit cost across production runs over time, and investigate any run where it creeps up; usually the cause is either rising material prices, falling yields, or overhead growth, and this breakdown tells you which one. Use the calculator before quoting prices on new business, because a unit cost built on good units rather than produced units is the difference between a quote that protects margin and one that quietly gives it away.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/unit-cost-calculator" />
        </div>
      </div>
    </>
  );
}