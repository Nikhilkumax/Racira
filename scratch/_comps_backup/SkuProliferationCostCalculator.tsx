"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  skuCount: string;
  avgInventory: string;
  holdingPct: string;
  avgSales: string;
  complexityPct: string;
  obsolescencePct: string;
  adminPerSku: string;
}

interface Result {
  inventoryInvestment: number;
  holdingCost: number;
  newSkuSales: number;
  complexityCost: number;
  obsolescenceCost: number;
  adminCost: number;
  totalCost: number;
  costPerSku: number;
  pctOfSales: number;
}

const DEFAULTS: Inputs = {
  skuCount: "25",
  avgInventory: "8000",
  holdingPct: "25",
  avgSales: "40000",
  complexityPct: "5",
  obsolescencePct: "3",
  adminPerSku: "350",
};

function calculate(inputs: Inputs): Result {
  const skuCount = Math.max(0, parseFloat(inputs.skuCount) || 0);
  const avgInventory = Math.max(0, parseFloat(inputs.avgInventory) || 0);
  const holdingPct = Math.min(100, Math.max(0, parseFloat(inputs.holdingPct) || 0));
  const avgSales = Math.max(0, parseFloat(inputs.avgSales) || 0);
  const complexityPct = Math.min(100, Math.max(0, parseFloat(inputs.complexityPct) || 0));
  const obsolescencePct = Math.min(100, Math.max(0, parseFloat(inputs.obsolescencePct) || 0));
  const adminPerSku = Math.max(0, parseFloat(inputs.adminPerSku) || 0);

  const inventoryInvestment = skuCount * avgInventory;
  const holdingCost = (inventoryInvestment * holdingPct) / 100;
  const newSkuSales = skuCount * avgSales;
  const complexityCost = (newSkuSales * complexityPct) / 100;
  const obsolescenceCost = (inventoryInvestment * obsolescencePct) / 100;
  const adminCost = skuCount * adminPerSku;
  const totalCost = holdingCost + complexityCost + obsolescenceCost + adminCost;
  const costPerSku = skuCount > 0 ? totalCost / skuCount : 0;
  const pctOfSales = newSkuSales > 0 ? (totalCost / newSkuSales) * 100 : 0;

  return { inventoryInvestment, holdingCost, newSkuSales, complexityCost, obsolescenceCost, adminCost, totalCost, costPerSku, pctOfSales };
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

export default function SkuProliferationCostCalculator() {
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
    num(inputs.skuCount) <= 0 ||
    num(inputs.avgInventory) < 0 ||
    num(inputs.holdingPct) < 0 || num(inputs.holdingPct) > 100 ||
    num(inputs.avgSales) < 0 ||
    num(inputs.complexityPct) < 0 || num(inputs.complexityPct) > 100 ||
    num(inputs.obsolescencePct) < 0 || num(inputs.obsolescencePct) > 100 ||
    num(inputs.adminPerSku) < 0;

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
    { label: "New SKUs Added", value: fmt(num(inputs.skuCount)) },
    { label: "New Inventory Investment", value: fmtMoney(result.inventoryInvestment) },
    { label: `Annual Holding Cost (${fmt(num(inputs.holdingPct), 1)}%)`, value: fmtMoney(result.holdingCost) },
    { label: "New SKU Sales", value: fmtMoney(result.newSkuSales) },
    { label: `Complexity & Support Cost (${fmt(num(inputs.complexityPct), 1)}% of sales)`, value: fmtMoney(result.complexityCost) },
    { label: `Obsolescence Write-Offs (${fmt(num(inputs.obsolescencePct), 1)}%)`, value: fmtMoney(result.obsolescenceCost) },
    { label: `Admin & Handling (${fmtMoney(num(inputs.adminPerSku))}/SKU)`, value: fmtMoney(result.adminCost) },
    { label: "Total Annual Proliferation Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per New SKU", value: fmtMoney(result.costPerSku), highlight: true },
    { label: "Proliferation Cost as % of New SKU Sales", value: result.pctOfSales.toFixed(1) + "%" },
  ];

  const summaryStats = [
    { label: "New SKUs Added", value: fmt(num(inputs.skuCount)) },
    { label: "Avg Inventory per SKU", value: fmtMoney(num(inputs.avgInventory)) },
    { label: "New Inventory Investment", value: fmtMoney(result.inventoryInvestment) },
    { label: "Annual Holding Cost", value: fmtMoney(result.holdingCost) },
    { label: "New SKU Sales", value: fmtMoney(result.newSkuSales) },
    { label: "Complexity & Support Cost", value: fmtMoney(result.complexityCost) },
    { label: "Obsolescence Write-Offs", value: fmtMoney(result.obsolescenceCost) },
    { label: "Admin & Handling Cost", value: fmtMoney(result.adminCost) },
    { label: "Total Annual Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per New SKU", value: fmtMoney(result.costPerSku) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "SKU Proliferation Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SKU Proliferation Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sku-count" label="Number of New SKUs" value={inputs.skuCount} onChange={set("skuCount")} suffix="SKUs" />
              <NumInput id="sku-avg-inventory" label="Average Inventory per SKU" value={inputs.avgInventory} onChange={set("avgInventory")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sku-holding" label="Annual Holding Cost" value={inputs.holdingPct} onChange={set("holdingPct")} suffix="%" />
              <NumInput id="sku-avg-sales" label="Average Annual Sales per SKU" value={inputs.avgSales} onChange={set("avgSales")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Support & Complexity</div>
                  <NumInput id="sku-complexity" label="Complexity & Support Cost" value={inputs.complexityPct} onChange={set("complexityPct")} suffix="% of sales" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Obsolescence & Administration</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="sku-obsolescence" label="Obsolescence Write-Off Rate" value={inputs.obsolescencePct} onChange={set("obsolescencePct")} suffix="%" />
                    <NumInput id="sku-admin" label="Admin Cost per SKU" value={inputs.adminPerSku} onChange={set("adminPerSku")} prefix="$" suffix="/yr" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                SKU count must be greater than zero; all amounts must be non-negative; all percentage rates must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual Cost of SKU Proliferation</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerSku)} per new SKU — {result.pctOfSales.toFixed(1)}% of new SKU sales</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Inventory Investment</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.inventoryInvestment)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Holding Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.holdingCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per New SKU</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerSku)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Proliferation Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is SKU Proliferation Cost?</h2>
              <p className="text-muted-foreground leading-relaxed">SKU proliferation cost is the hidden expense a business takes on every time it adds another stock keeping unit to its product line. A new SKU might be a new flavor, a new size, a new color, or a variation for a single retail chain, and each one carries costs far beyond the cost of the goods themselves. Every new SKU means money tied up in inventory, warehouse space occupied, picking and packing labor consumed, forecasting and purchasing effort spent, and a growing risk that the product will sit unsold and eventually be written off as obsolete. Research on retail and consumer goods consistently shows that a meaningful share of SKUs fail to earn their keep, and the costs of carrying them quietly erode margin across the entire catalog. This calculator quantifies that erosion by turning the number of new SKUs and the typical inventory and sales per SKU into a concrete annual dollar figure, so product line decisions can be made with the full cost picture in front of you rather than just the revenue opportunity.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator starts with four inputs. The number of new SKUs is the size of the line extension being evaluated. The average inventory per SKU is the typical dollar value of stock carried for one SKU at any point in time, which multiplied by the number of SKUs gives the total new inventory investment. The annual holding cost percentage is the standard industry estimate of what it costs to carry inventory for a year, including storage, insurance, taxes, and the capital tied up in stock, and is typically set between 20% and 30%. Multiplying the inventory investment by the holding percentage gives the annual holding cost. The average annual sales per SKU, multiplied by the SKU count, gives the new SKU sales, which forms the base for the complexity cost, the extra administrative and operational overhead that every additional SKU imposes on the business, modeled as a percentage of sales.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the two remaining layers of proliferation cost. The obsolescence write-off rate is the percentage of inventory value the business expects to discard each year because products become outdated, damaged, or slow-moving; it is applied to the inventory investment. The admin cost per SKU captures the annual per-SKU overhead of planning, purchasing, data maintenance, and shelf or catalog management, and is multiplied by the SKU count. The total annual proliferation cost sums the holding cost, the complexity cost, the obsolescence write-offs, and the admin cost, then divides by the number of SKUs to show the cost per new SKU and expresses the total as a percentage of new SKU sales. With the default inputs, twenty-five new SKUs carrying an average of $8,000 each in inventory, at a 25% holding cost, generate over $114,000 of annual cost before a single unit of their profit is counted.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total annual cost of the SKU proliferation, the amount of profit the new SKUs must collectively generate just to break even on the costs they create. The cost per new SKU puts that burden at the individual product level, so you can compare it directly against the gross profit each SKU is expected to contribute; any SKU that cannot clear its per-SKU cost is a candidate for elimination before it ever launches. The percentage of new SKU sales shows how efficiently the added complexity is being monetized, and it is the figure to benchmark against your existing catalog. When a category team proposes a line extension, run the numbers first: if the new SKUs cannibalize existing sales rather than add genuinely new volume, the proliferation cost is pure margin destruction. The same analysis works in reverse for SKU rationalization, where removing slow movers frees inventory investment, reduces holding and obsolescence cost, and often improves service levels on the remaining products that actually earn their place in the catalog.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/sku-proliferation-cost-calculator" />
        </div>
      </div>
    </>
  );
}