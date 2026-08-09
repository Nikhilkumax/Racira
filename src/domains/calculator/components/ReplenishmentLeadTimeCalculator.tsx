"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ReplenishmentResult {
  totalLeadTime: number;
  reorderPoint: number;
  safetyStock: number;
  eoq: number;
  averageDailyDemand: number;
  chartData: { name: string; days: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  avgDailyDemand: "50",
  supplyLeadTime: "7",
  internalProcTime: "2",
  inspectionTime: "1",
  safetyDays: "3",
  annualDemand: "18250",
  orderCost: "25",
  holdingCostPct: "20",
  unitCost: "10",
};

// Industry-standard supply chain formulas
// Replenishment Lead Time = Supply Lead Time + Internal Processing Time + Inspection Time
// Reorder Point (ROP) = (Avg Daily Demand × Total Lead Time) + Safety Stock
// Safety Stock = Safety Days × Avg Daily Demand
// EOQ = sqrt(2 × Annual Demand × Order Cost / Holding Cost per unit)
function calculate(
  avgDailyDemand: number, supplyLeadTime: number, internalProcTime: number,
  inspectionTime: number, safetyDays: number, annualDemand: number,
  orderCost: number, holdingCostPct: number, unitCost: number
): ReplenishmentResult | null {
  if (avgDailyDemand <= 0 || supplyLeadTime < 0) return null;

  const totalLeadTime = supplyLeadTime + internalProcTime + inspectionTime;
  const safetyStock = safetyDays * avgDailyDemand;
  const reorderPoint = (avgDailyDemand * totalLeadTime) + safetyStock;

  const holdingCostPerUnit = (holdingCostPct / 100) * unitCost;
  const eoq = holdingCostPerUnit > 0 && annualDemand > 0
    ? Math.sqrt((2 * annualDemand * orderCost) / holdingCostPerUnit)
    : 0;

  const chartData = [
    { name: "Supply Lead Time", days: supplyLeadTime },
    { name: "Internal Processing", days: internalProcTime },
    { name: "Inspection Time", days: inspectionTime },
    { name: "Safety Buffer", days: safetyDays },
  ];

  const breakdown = [
    { label: "Avg Daily Demand", value: `${avgDailyDemand.toFixed(0)} units/day` },
    { label: "Supply Lead Time", value: `${supplyLeadTime} days` },
    { label: "Internal Processing Time", value: `${internalProcTime} days` },
    { label: "Inspection Time", value: `${inspectionTime} days` },
    { label: "Total Replenishment Lead Time", value: `${totalLeadTime} days` },
    { label: "Safety Stock (buffer)", value: `${safetyStock.toFixed(0)} units` },
    { label: "Reorder Point (ROP)", value: `${reorderPoint.toFixed(0)} units` },
    { label: "Economic Order Quantity (EOQ)", value: eoq > 0 ? `${eoq.toFixed(0)} units` : "N/A" },
  ];

  const summaryStats = [
    { label: "Total Lead Time", value: `${totalLeadTime} days` },
    { label: "Reorder Point", value: `${reorderPoint.toFixed(0)} units` },
    { label: "Safety Stock", value: `${safetyStock.toFixed(0)} units` },
    { label: "EOQ", value: eoq > 0 ? `${eoq.toFixed(0)} units` : "N/A" },
    { label: "Avg Daily Demand", value: `${avgDailyDemand}/day` },
    { label: "Cover (ROP Days)", value: `${(reorderPoint / avgDailyDemand).toFixed(1)} days` },
  ];

  return { totalLeadTime, reorderPoint, safetyStock, eoq, averageDailyDemand: avgDailyDemand, chartData, breakdown, summaryStats };
}

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444"];

export default function ReplenishmentLeadTimeCalculator() {
  const [avgDailyDemand, setAvgDailyDemand] = useState(DEFAULTS.avgDailyDemand);
  const [supplyLeadTime, setSupplyLeadTime] = useState(DEFAULTS.supplyLeadTime);
  const [internalProcTime, setInternalProcTime] = useState(DEFAULTS.internalProcTime);
  const [inspectionTime, setInspectionTime] = useState(DEFAULTS.inspectionTime);
  const [safetyDays, setSafetyDays] = useState(DEFAULTS.safetyDays);
  const [annualDemand, setAnnualDemand] = useState(DEFAULTS.annualDemand);
  const [orderCost, setOrderCost] = useState(DEFAULTS.orderCost);
  const [holdingCostPct, setHoldingCostPct] = useState(DEFAULTS.holdingCostPct);
  const [unitCost, setUnitCost] = useState(DEFAULTS.unitCost);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<ReplenishmentResult | null>(null);

  const handleCalculate = () => {
    setResult(calculate(
      parseFloat(avgDailyDemand) || 0, parseFloat(supplyLeadTime) || 0,
      parseFloat(internalProcTime) || 0, parseFloat(inspectionTime) || 0,
      parseFloat(safetyDays) || 0, parseFloat(annualDemand) || 0,
      parseFloat(orderCost) || 0, parseFloat(holdingCostPct) || 0,
      parseFloat(unitCost) || 0
    ));
  };

  const handleReset = () => {
    setAvgDailyDemand(DEFAULTS.avgDailyDemand);
    setSupplyLeadTime(DEFAULTS.supplyLeadTime);
    setInternalProcTime(DEFAULTS.internalProcTime);
    setInspectionTime(DEFAULTS.inspectionTime);
    setSafetyDays(DEFAULTS.safetyDays);
    setAnnualDemand(DEFAULTS.annualDemand);
    setOrderCost(DEFAULTS.orderCost);
    setHoldingCostPct(DEFAULTS.holdingCostPct);
    setUnitCost(DEFAULTS.unitCost);
    setResult(calculate(50, 7, 2, 1, 3, 18250, 25, 20, 10));
  };

  useEffect(() => { setResult(calculate(50, 7, 2, 1, 3, 18250, 25, 20, 10)); }, []);

  const Inp = ({ id, label, value, onChange, suffix, prefix }: any) => (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
      <div className="relative flex items-center h-10 rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden">
        {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">{prefix}</span>}
        <input id={id} type="number" value={value} min={0} step="any"
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCalculate()}
          className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
        {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator/business" }, { label: "Replenishment Lead Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Replenishment Lead Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <Inp id="avgDailyDemand" label="Avg Daily Demand (units)" value={avgDailyDemand} onChange={setAvgDailyDemand} suffix="units" />
              <Inp id="supplyLeadTime" label="Supplier Lead Time" value={supplyLeadTime} onChange={setSupplyLeadTime} suffix="days" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Inp id="internalProcTime" label="Internal Processing" value={internalProcTime} onChange={setInternalProcTime} suffix="days" />
              <Inp id="inspectionTime" label="Inspection Time" value={inspectionTime} onChange={setInspectionTime} suffix="days" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus:outline-none">
                Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="mt-3 border border-border rounded-lg p-4 bg-secondary/10 grid grid-cols-2 gap-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 col-span-2 font-medium">Safety Stock & EOQ Inputs</div>
                  <Inp id="safetyDays" label="Safety Buffer (days)" value={safetyDays} onChange={setSafetyDays} suffix="days" />
                  <Inp id="annualDemand" label="Annual Demand" value={annualDemand} onChange={setAnnualDemand} suffix="units" />
                  <Inp id="orderCost" label="Cost per Order" value={orderCost} onChange={setOrderCost} prefix="$" />
                  <Inp id="holdingCostPct" label="Holding Cost" value={holdingCostPct} onChange={setHoldingCostPct} suffix="% / yr" />
                  <Inp id="unitCost" label="Unit Cost" value={unitCost} onChange={setUnitCost} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleCalculate}
                className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base transition-colors">
                Calculate
              </button>
              <button type="button" onClick={handleReset} aria-label="Reset"
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Replenishment Lead Time</div>
                <div className="text-4xl font-bold text-primary">{result.totalLeadTime} days</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Reorder at <span className="font-semibold text-foreground">{result.reorderPoint.toFixed(0)} units</span> on hand
                </div>
              </div>

              <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  { label: "Reorder Point", value: `${result.reorderPoint.toFixed(0)} units`, color: "text-primary" },
                  { label: "Safety Stock", value: `${result.safetyStock.toFixed(0)} units`, color: "text-amber-500" },
                  { label: "EOQ", value: result.eoq > 0 ? `${result.eoq.toFixed(0)} units` : "N/A", color: "" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{s.label}</div>
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Component</th>
                      <th className="text-right text-xs uppercase tracking-wide text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={r.label.includes("Total") || r.label.includes("Reorder Point") ? "font-bold bg-secondary/10 border-t-2 border-border" : ""}>
                        <td className="text-base py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="text-base py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Lead Time Components (days)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: 12 }} />
                    <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Replenishment Lead Time?</h2>
            <p className="text-muted-foreground leading-relaxed">Replenishment lead time is the total elapsed time from when a reorder is triggered to when the inventory is available for use. It encompasses three components: supplier lead time (time for the vendor to ship the goods), internal processing time (purchase order creation, approval, and receipt), and inspection time (quality control before goods enter usable inventory). Understanding total replenishment lead time is foundational to setting accurate reorder points and avoiding stockouts.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Formulas Work</h2>
            <p className="text-muted-foreground leading-relaxed">Total Replenishment Lead Time = Supplier Lead Time + Internal Processing Time + Inspection Time. Safety Stock = Safety Days × Average Daily Demand — this buffer absorbs demand spikes and supplier delays. Reorder Point (ROP) = (Average Daily Demand × Total Lead Time) + Safety Stock — place a new order when inventory falls to this level. Economic Order Quantity (EOQ) = √(2 × Annual Demand × Order Cost ÷ Holding Cost per Unit) — EOQ minimizes the combined cost of ordering and holding inventory, derived from Wilson's formula (1913), still the industry standard.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">The primary result shows total lead time in days — this is how far in advance you must trigger replenishment. The reorder point tells you the exact inventory level at which to place a new order. Safety stock is a permanent buffer held to cover variability. The EOQ (unlocked in Advanced Options) shows the mathematically optimal order quantity to minimize total inventory costs. The bar chart breaks down each lead time component, helping you identify where delays are concentrated and where process improvements would have the greatest impact.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/replenishment-lead-time-calculator" />
      </div>
    </>
  );
}
