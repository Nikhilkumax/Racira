"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  purchasePrice: string;
  annualOperating: string;
  annualMaintenance: string;
  usefulLife: string;
  discountRate: string;
  residualValue: string;
  energyCost: string;
}

interface Result {
  annualCosts: number;
  pvOperating: number;
  pvResidual: number;
  tco: number;
  tcoUndiscounted: number;
  costPerYear: number;
}

const DEFAULTS: Inputs = {
  purchasePrice: "250000",
  annualOperating: "40000",
  annualMaintenance: "12000",
  usefulLife: "5",
  discountRate: "7",
  residualValue: "50000",
  energyCost: "8000",
};

function calculate(inputs: Inputs): Result {
  const purchasePrice = Math.max(0, parseFloat(inputs.purchasePrice) || 0);
  const annualOperating = Math.max(0, parseFloat(inputs.annualOperating) || 0);
  const annualMaintenance = Math.max(0, parseFloat(inputs.annualMaintenance) || 0);
  const usefulLife = Math.max(0, parseFloat(inputs.usefulLife) || 0);
  const discountRate = Math.min(100, Math.max(0, parseFloat(inputs.discountRate) || 0));
  const residualValue = Math.max(0, parseFloat(inputs.residualValue) || 0);
  const energyCost = Math.max(0, parseFloat(inputs.energyCost) || 0);

  const annualCosts = annualOperating + annualMaintenance + energyCost;
  const r = discountRate / 100;
  const pvOperating = usefulLife > 0 && r !== 0
    ? annualCosts * ((1 - Math.pow(1 + r, -usefulLife)) / r)
    : annualCosts * usefulLife;
  const pvResidual = r !== 0 ? residualValue / Math.pow(1 + r, usefulLife) : residualValue;
  const tco = purchasePrice + pvOperating - pvResidual;
  const tcoUndiscounted = purchasePrice + annualCosts * usefulLife - residualValue;
  const costPerYear = usefulLife > 0 ? tco / usefulLife : 0;

  return { annualCosts, pvOperating, pvResidual, tco, tcoUndiscounted, costPerYear };
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

export default function TotalCostOfOwnershipSupplyChainCalculator() {
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
    num(inputs.purchasePrice) < 0 ||
    num(inputs.annualOperating) < 0 ||
    num(inputs.annualMaintenance) < 0 ||
    num(inputs.usefulLife) <= 0 ||
    num(inputs.discountRate) < 0 || num(inputs.discountRate) > 100 ||
    num(inputs.residualValue) < 0 ||
    num(inputs.energyCost) < 0;

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
    { label: "Purchase Price", value: fmtMoney(num(inputs.purchasePrice)) },
    { label: "Annual Operating Costs", value: fmtMoney(num(inputs.annualOperating)) },
    { label: "Annual Maintenance & Support", value: fmtMoney(num(inputs.annualMaintenance)) },
    { label: "Energy & Consumables", value: fmtMoney(num(inputs.energyCost)) },
    { label: "Total Annual Running Cost", value: fmtMoney(result.annualCosts) },
    { label: "PV of Running Costs over Life", value: fmtMoney(result.pvOperating) },
    { label: "PV of Residual Value", value: "(" + fmtMoney(result.pvResidual) + ")" },
    { label: "Total Cost of Ownership (discounted)", value: fmtMoney(result.tco), total: true },
    { label: "TCO without Discounting", value: fmtMoney(result.tcoUndiscounted) },
    { label: "Cost per Year of Ownership", value: fmtMoney(result.costPerYear), highlight: true },
  ];

  const summaryStats = [
    { label: "Purchase Price", value: fmtMoney(num(inputs.purchasePrice)) },
    { label: "Annual Running Costs", value: fmtMoney(result.annualCosts) },
    { label: "Useful Life", value: fmt(num(inputs.usefulLife)) + " yrs" },
    { label: "Discount Rate", value: fmt(num(inputs.discountRate), 1) + "%" },
    { label: "PV of Running Costs", value: fmtMoney(result.pvOperating) },
    { label: "PV of Residual", value: fmtMoney(result.pvResidual) },
    { label: "Total Cost of Ownership", value: fmtMoney(result.tco), bold: true },
    { label: "Undiscounted TCO", value: fmtMoney(result.tcoUndiscounted) },
    { label: "Cost per Year", value: fmtMoney(result.costPerYear) },
    { label: "Residual Value", value: fmtMoney(num(inputs.residualValue)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Total Cost of Ownership Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Total Cost of Ownership Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tco-purchase" label="Purchase Price" value={inputs.purchasePrice} onChange={set("purchasePrice")} prefix="$" />
              <NumInput id="tco-life" label="Useful Life" value={inputs.usefulLife} onChange={set("usefulLife")} suffix="years" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tco-operating" label="Annual Operating Costs" value={inputs.annualOperating} onChange={set("annualOperating")} prefix="$" />
              <NumInput id="tco-maintenance" label="Annual Maintenance & Support" value={inputs.annualMaintenance} onChange={set("annualMaintenance")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Financing & Disposal</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="tco-rate" label="Interest / Discount Rate" value={inputs.discountRate} onChange={set("discountRate")} suffix="%" />
                    <NumInput id="tco-residual" label="Residual Value" value={inputs.residualValue} onChange={set("residualValue")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="tco-energy" label="Energy & Consumables" value={inputs.energyCost} onChange={set("energyCost")} prefix="$" suffix="/yr" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Useful life must be greater than zero; all amounts must be non-negative; discount rate must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Cost of Ownership</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.tco)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerYear)} per year over {fmt(num(inputs.usefulLife))} years, discounted at {fmt(num(inputs.discountRate), 1)}%</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Running Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.annualCosts)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Undiscounted TCO</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.tcoUndiscounted)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Year</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerYear)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Ownership Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Total Cost of Ownership Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A total cost of ownership calculator measures the complete cost of acquiring, running, and disposing of an asset over its useful life, rather than just the purchase price. Total cost of ownership, often abbreviated as TCO, is the standard framework used in supply chain and procurement decisions, because the purchase price of equipment, vehicles, or production machinery is frequently a small fraction of what the asset actually costs. A machine that is cheap to buy but expensive to operate, maintain, and power can easily cost more over five years than a pricier but more efficient alternative. This tool assembles the full picture: the initial purchase price, the annual operating, maintenance, and energy costs, the financing or discount rate that reflects the time value of money, and the residual value the asset retains when its useful life ends. The output is a single discounted dollar figure that makes genuinely different options directly comparable.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. The purchase price is the initial acquisition cost. The useful life is how many years the asset will be in service, which sets the horizon of the analysis. The annual operating costs cover labor, materials, and consumables consumed by the asset, and the annual maintenance and support costs cover scheduled servicing, repairs, and any support contracts. Summing the operating, maintenance, and energy costs gives the total annual running cost, and the running cost is then converted into its present value by discounting each year's cost back to today using the discount rate, which reflects the company's cost of capital and the time value of money. The Advanced Options section adds the energy and consumables line, the discount rate, and the residual value, which is the amount the asset can be sold for at the end of its life and is discounted back to today and subtracted from the total.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The total cost of ownership is the purchase price plus the present value of all running costs minus the present value of the residual value. With the default inputs, a $250,000 asset with $60,000 of annual running costs over five years at a 7% discount rate, and a $50,000 residual value, carries a discounted TCO of roughly $460,000, about $92,000 per year. The undiscounted total is also shown for comparison, and the gap between the two figures is the time value of money: the higher the discount rate and the longer the life, the more the discounted total falls below the simple sum of costs. Comparing two bids on a discounted TCO basis rather than purchase price alone routinely changes which supplier wins the business.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the discounted total cost of ownership, the number to use when comparing competing assets or suppliers. The cost per year puts the total in annual terms, which is useful for budgeting and for comparing against the annual value the asset generates. Pay attention to the split in the breakdown: if the present value of running costs exceeds the purchase price, the decision should be dominated by operating efficiency, and a slightly more expensive asset with lower running costs will win on TCO. The discount rate deserves scrutiny too, because using a rate that is too low flatters long-lived assets with high maintenance costs, while a rate that is too high penalizes them. When the residual value is a large share of the total, verify the assumption against the actual resale market before relying on it. Re-run the calculation with a longer or shorter useful life, and the TCO per year will show the optimal replacement cycle for the asset.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/total-cost-of-ownership-supply-chain-calculator" />
        </div>
      </div>
    </>
  );
}