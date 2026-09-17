"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  orderQty: string;
  varCost: string;
  incFixed: string;
  price: string;
  currentVolume: string;
  existingFixed: string;
}

interface Result {
  revenue: number;
  variableCost: number;
  totalIncrementalCost: number;
  profit: number;
  marginPct: number;
  breakevenPrice: number;
  fixedPerUnitAfter: number;
  avgCostPerUnitAfter: number;
}

const DEFAULTS: Inputs = {
  orderQty: "5000",
  varCost: "8.50",
  incFixed: "10000",
  price: "12.00",
  currentVolume: "20000",
  existingFixed: "150000",
};

function calculate(inputs: Inputs): Result {
  const orderQty = Math.max(0, parseFloat(inputs.orderQty) || 0);
  const varCost = Math.max(0, parseFloat(inputs.varCost) || 0);
  const incFixed = Math.max(0, parseFloat(inputs.incFixed) || 0);
  const price = Math.max(0, parseFloat(inputs.price) || 0);
  const currentVolume = Math.max(0, parseFloat(inputs.currentVolume) || 0);
  const existingFixed = Math.max(0, parseFloat(inputs.existingFixed) || 0);

  const revenue = orderQty * price;
  const variableCost = orderQty * varCost;
  const totalIncrementalCost = variableCost + incFixed;
  const profit = revenue - totalIncrementalCost;
  const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
  const breakevenPrice = orderQty > 0 ? totalIncrementalCost / orderQty : 0;
  const totalVolume = currentVolume + orderQty;
  const fixedPerUnitAfter = totalVolume > 0 ? (existingFixed + incFixed) / totalVolume : 0;
  const avgCostPerUnitAfter = varCost + fixedPerUnitAfter;

  return { revenue, variableCost, totalIncrementalCost, profit, marginPct, breakevenPrice, fixedPerUnitAfter, avgCostPerUnitAfter };
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

export default function IncrementalCostCalculator() {
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
    num(inputs.orderQty) <= 0 ||
    num(inputs.varCost) < 0 ||
    num(inputs.incFixed) < 0 ||
    num(inputs.price) < 0 ||
    num(inputs.currentVolume) < 0 ||
    num(inputs.existingFixed) < 0;

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
    { label: "Incremental Order Quantity", value: fmt(num(inputs.orderQty)) + " units" },
    { label: "Incremental Revenue", value: fmtMoney(result.revenue) },
    { label: "Variable Costs", value: fmtMoney(result.variableCost) },
    { label: "Incremental Fixed Costs", value: fmtMoney(num(inputs.incFixed)) },
    { label: "Total Incremental Cost", value: fmtMoney(result.totalIncrementalCost), total: true },
    { label: "Incremental Profit", value: fmtMoney(result.profit), highlight: true },
    { label: "Incremental Margin", value: result.marginPct.toFixed(1) + "%" },
    { label: "Breakeven Price per Unit", value: "$" + result.breakevenPrice.toFixed(2) },
    { label: "Fixed Cost per Unit After Order", value: "$" + result.fixedPerUnitAfter.toFixed(2) },
    { label: "New Average Cost per Unit", value: "$" + result.avgCostPerUnitAfter.toFixed(2) },
  ];

  const summaryStats = [
    { label: "Order Quantity", value: fmt(num(inputs.orderQty)) + " units" },
    { label: "Incremental Revenue", value: fmtMoney(result.revenue) },
    { label: "Variable Costs", value: fmtMoney(result.variableCost) },
    { label: "Incremental Fixed Costs", value: fmtMoney(num(inputs.incFixed)) },
    { label: "Total Incremental Cost", value: fmtMoney(result.totalIncrementalCost) },
    { label: "Incremental Profit", value: fmtMoney(result.profit), bold: true },
    { label: "Incremental Margin", value: result.marginPct.toFixed(1) + "%" },
    { label: "Breakeven Price", value: "$" + result.breakevenPrice.toFixed(2) },
    { label: "Fixed Cost / Unit After", value: "$" + result.fixedPerUnitAfter.toFixed(2) },
    { label: "Avg Cost / Unit After", value: "$" + result.avgCostPerUnitAfter.toFixed(2) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Incremental Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Incremental Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="incremental-qty" label="Incremental Order Quantity" value={inputs.orderQty} onChange={set("orderQty")} suffix="units" />
              <NumInput id="incremental-price" label="Selling Price per Unit" value={inputs.price} onChange={set("price")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="incremental-var" label="Variable Cost per Unit" value={inputs.varCost} onChange={set("varCost")} prefix="$" />
              <NumInput id="incremental-fixed" label="Incremental Fixed Costs" value={inputs.incFixed} onChange={set("incFixed")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Capacity & Existing Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="incremental-volume" label="Current Production Volume" value={inputs.currentVolume} onChange={set("currentVolume")} suffix="units" />
                    <NumInput id="incremental-existing-fixed" label="Existing Fixed Costs" value={inputs.existingFixed} onChange={set("existingFixed")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Order quantity must be greater than zero; all costs and prices must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Incremental Profit</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.profit)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.profit >= 0 ? "The order adds " + fmtMoney(result.profit) + " to profit before existing fixed costs" : "The order destroys " + fmtMoney(-result.profit) + " of profit versus not taking it"}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Incremental Revenue</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.revenue)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Incremental Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.totalIncrementalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Incremental Margin</span>
                <span className={`font-extrabold ${result.marginPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>{result.marginPct.toFixed(1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Incremental Order Analysis</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Incremental Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An incremental cost calculator determines whether an additional order or production run actually adds profit to a business. Incremental cost is the additional total cost incurred to produce one more batch of goods, and the incremental analysis compares that added cost against the added revenue the batch will bring in. The logic is different from everyday accounting because existing fixed costs, like the rent on the factory and the salaries of management, do not change whether the order is accepted or not, so they are irrelevant to the decision. What matters is only what changes: the extra materials, the extra labor, and any one-time costs like new tooling or setup, measured against the extra revenue. This tool applies that logic cleanly, showing the incremental revenue, the incremental cost, and the incremental profit of a prospective order, plus the minimum price the order must command to break even. It is the same framework used internally by manufacturers, distributors, and service businesses whenever a customer asks for a special price on a volume order.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four inputs. The incremental order quantity is the number of units in the prospective order. The variable cost per unit covers the materials and direct labor that scale with every unit produced. The incremental fixed costs are the one-time expenses the order triggers, such as setup, tooling, packaging redesign, or additional equipment rental. The selling price per unit is what the customer will pay. Incremental revenue is the quantity multiplied by the selling price, and the variable cost component is the quantity multiplied by the variable cost per unit. Adding the incremental fixed costs gives the total incremental cost, and subtracting that total from the incremental revenue gives the incremental profit, the true contribution of the order to the bottom line. The incremental margin expresses that profit as a percentage of the incremental revenue, and the breakeven price divides the total incremental cost by the order quantity to show the lowest price per unit at which the order stops losing money.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds two inputs that refine the picture when the order pushes production against capacity. The current production volume and the existing fixed costs let the calculator show how the order changes the fixed cost per unit across the whole operation. Because the order's own incremental fixed costs get spread over a larger total volume, the fixed cost per unit after the order will be lower than before, and the new average cost per unit, which is the variable cost plus the diluted fixed cost per unit, gives the true long-run cost of each unit once the operation settles at the higher volume. These figures matter when a customer's low-price order looks profitable on an incremental basis but would force the business to add permanent capacity. Compare the incremental profit against the new average cost per unit, and the decision becomes much clearer.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the incremental profit, the amount the order adds to or subtracts from net income. If it is positive, the order covers every cost it creates and improves the bottom line, so it should be accepted unless it displaces more profitable work. If it is negative, the order loses money even before any share of existing fixed costs is considered, and it should be declined or renegotiated. The breakeven price is the negotiating anchor: it is the lowest price at which the order breaks even, and any price above it contributes to profit, so it defines the absolute floor for your counteroffer. The new average cost per unit from the advanced section is the figure to watch when volume grows, because it shows whether the operation's total cost structure improves as fixed costs are spread across more units. Use the calculator with the customer's proposed price first, then re-run it with your best negotiated price, and the incremental profit figure tells you immediately how much room you have in the deal.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/incremental-cost-calculator" />
        </div>
      </div>
    </>
  );
}