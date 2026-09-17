"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, CheckCircle2, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

const DEFAULTS = {
  unitsProduced: "10000",
  unitsSold: "8000",
  sellingPrice: "50",
  fixedOverhead: "60000",

  showAdvanced: false,
  directMaterials: "10",
  directLabor: "8",
  variableOverhead: "2",
  fixedSellingAdmin: "30000",
  variableSellingAdmin: "3",
  beginningInventory: "0",
};

interface ResultType {
  absorptionProfit: number;
  variableProfit: number;
  difference: number;
  fixedOverheadDeferred: number;
  endingInventory: number;
  fixedOverheadPerUnit: number;
  absorptionUnitCost: number;
  variableUnitCost: number;

  absorptionIncomeStmt: {
    revenue: number;
    cogs: number;
    grossMargin: number;
    sga: number;
    netIncome: number;
  };
  variableIncomeStmt: {
    revenue: number;
    variableCosts: number;
    contributionMargin: number;
    fixedCosts: number;
    netIncome: number;
  };
  chartData: { name: string; absorption: number; variable: number }[];
}

function calculate(v: typeof DEFAULTS): ResultType {
  const produced = parseFloat(v.unitsProduced) || 0;
  const sold = parseFloat(v.unitsSold) || 0;
  const price = parseFloat(v.sellingPrice) || 0;
  const dm = parseFloat(v.directMaterials) || 0;
  const dl = parseFloat(v.directLabor) || 0;
  const voh = parseFloat(v.variableOverhead) || 0;
  const foh = parseFloat(v.fixedOverhead) || 0;

  const fsga = parseFloat(v.fixedSellingAdmin) || 0;
  const vsga = parseFloat(v.variableSellingAdmin) || 0;
  const begInv = parseFloat(v.beginningInventory) || 0;

  const endingInventory = begInv + produced - sold;

  // Absorption Costing
  const fixedOverheadPerUnit = produced > 0 ? foh / produced : 0;
  const absorptionUnitCost = dm + dl + voh + fixedOverheadPerUnit;

  const revenue = sold * price;

  const absorptionCogs = sold * absorptionUnitCost;
  const grossMargin = revenue - absorptionCogs;
  const totalSga = fsga + vsga * sold;
  const absorptionProfit = grossMargin - totalSga;

  // Variable Costing
  const variableUnitCost = dm + dl + voh;
  const variableCogs = sold * variableUnitCost;
  const totalVariableCosts = variableCogs + vsga * sold;
  const contributionMargin = revenue - totalVariableCosts;
  const variableProfit = contributionMargin - foh - fsga;

  const difference = absorptionProfit - variableProfit;
  const fixedOverheadDeferred = (endingInventory - begInv) * fixedOverheadPerUnit;

  const chartData = [
    { name: "Revenue", absorption: revenue, variable: revenue },
    { name: "COGS / Var Costs", absorption: absorptionCogs, variable: totalVariableCosts },
    { name: "Gross / Contrib Margin", absorption: grossMargin, variable: contributionMargin },
    { name: "Net Income", absorption: absorptionProfit, variable: variableProfit },
  ];

  return {
    absorptionProfit,
    variableProfit,
    difference,
    fixedOverheadDeferred,
    endingInventory,
    fixedOverheadPerUnit,
    absorptionUnitCost,
    variableUnitCost,
    absorptionIncomeStmt: {
      revenue,
      cogs: absorptionCogs,
      grossMargin,
      sga: totalSga,
      netIncome: absorptionProfit,
    },
    variableIncomeStmt: {
      revenue,
      variableCosts: totalVariableCosts,
      contributionMargin,
      fixedCosts: foh + fsga,
      netIncome: variableProfit,
    },
    chartData,
  };
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1 text-foreground">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function AbsorptionCostingVsVariableCostingProfitComparison() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<ResultType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(vals));
  }, []);

  const handleCalculate = () => setResult(calculate(vals));
  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };
  const updateVal = (key: keyof typeof DEFAULTS, val: string | boolean) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is Absorption Costing?", answer: "Absorption costing includes all manufacturing costs (direct materials, direct labor, variable overhead, and fixed overhead) in the cost of a product. It is required by GAAP for external financial reporting." },
    { question: "What is Variable Costing?", answer: "Variable costing includes only variable manufacturing costs in the product cost. Fixed overhead is treated as a period expense and deducted in full on the income statement. It is used for internal decision-making." },
    { question: "Why do the profits differ?", answer: "Profits differ when units produced do not equal units sold. Under absorption costing, some fixed overhead is deferred in ending inventory, increasing profit. Under variable costing, all fixed overhead is expensed immediately." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Absorption vs Variable Costing" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Absorption vs Variable Costing Profit Comparison</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Left Column - Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="prod" label="Units Produced" value={vals.unitsProduced} onChange={(v: string) => updateVal("unitsProduced", v)} />
              <CompactInput id="sold" label="Units Sold" value={vals.unitsSold} onChange={(v: string) => updateVal("unitsSold", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="price" label="Selling Price / Unit" value={vals.sellingPrice} onChange={(v: string) => updateVal("sellingPrice", v)} prefix="$" />
              <CompactInput id="foh" label="Fixed Mfg Overhead" value={vals.fixedOverhead} onChange={(v: string) => updateVal("fixedOverhead", v)} prefix="$" />
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => updateVal("showAdvanced", !vals.showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${vals.showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {vals.showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Per-Unit Manufacturing Costs</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="dm" label="Direct Materials / Unit" value={vals.directMaterials} onChange={(v: string) => updateVal("directMaterials", v)} prefix="$" />
                      <CompactInput id="dl" label="Direct Labor / Unit" value={vals.directLabor} onChange={(v: string) => updateVal("directLabor", v)} prefix="$" />
                      <CompactInput id="voh" label="Variable OH / Unit" value={vals.variableOverhead} onChange={(v: string) => updateVal("variableOverhead", v)} prefix="$" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Selling & Admin Expenses</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="fsga" label="Fixed SG&A" value={vals.fixedSellingAdmin} onChange={(v: string) => updateVal("fixedSellingAdmin", v)} prefix="$" />
                      <CompactInput id="vsga" label="Variable SG&A / Unit" value={vals.variableSellingAdmin} onChange={(v: string) => updateVal("variableSellingAdmin", v)} prefix="$" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Inventory</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="begInv" label="Beginning Inventory (Units)" value={vals.beginningInventory} onChange={(v: string) => updateVal("beginningInventory", v)} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                onClick={reset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                {/* Component 1: Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Profit Difference</div>
                  <div className="text-4xl font-bold text-primary my-1">
                    ${Math.abs(result.difference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.difference > 0
                      ? "Absorption costing reports higher income (inventory built up)"
                      : result.difference < 0
                        ? "Variable costing reports higher income (inventory drawn down)"
                        : "Profits are identical (production = sales)"}
                  </div>
                </div>

                {/* Component 2: 3-Stat Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Absorption Profit</div>
                    <div className="text-lg font-bold text-emerald-600">
                      ${result.absorptionProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Variable Profit</div>
                    <div className="text-lg font-bold text-blue-600">
                      ${result.variableProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Ending Inventory</div>
                    <div className="text-lg font-bold text-foreground">
                      {result.endingInventory.toLocaleString()} units
                    </div>
                  </div>
                </div>

                {/* Component 3: Breakdown Table (Income Statements) */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Line Item</th>
                        <th className="p-2.5 text-right w-[130px]">Absorption</th>
                        <th className="p-2.5 pr-3 text-right w-[130px]">Variable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="text-base py-2.5 px-3 font-medium text-foreground">Revenue</td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">${result.absorptionIncomeStmt.revenue.toLocaleString()}</td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">${result.variableIncomeStmt.revenue.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 font-medium text-muted-foreground">Less: COGS / Variable Costs</td>
                        <td className="text-base py-2.5 px-3 text-right text-muted-foreground">(${result.absorptionIncomeStmt.cogs.toLocaleString()})</td>
                        <td className="text-base py-2.5 px-3 text-right text-muted-foreground">(${result.variableIncomeStmt.variableCosts.toLocaleString()})</td>
                      </tr>
                      <tr className="bg-secondary/20 font-bold border-t border-border/50">
                        <td className="text-base py-2.5 px-3 text-foreground">Gross / Contribution Margin</td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">${result.absorptionIncomeStmt.grossMargin.toLocaleString()}</td>
                        <td className="text-base py-2.5 px-3 text-right text-foreground">${result.variableIncomeStmt.contributionMargin.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="text-base py-2.5 px-3 font-medium text-muted-foreground">Less: SG&A / Fixed Costs</td>
                        <td className="text-base py-2.5 px-3 text-right text-muted-foreground">(${result.absorptionIncomeStmt.sga.toLocaleString()})</td>
                        <td className="text-base py-2.5 px-3 text-right text-muted-foreground">(${result.variableIncomeStmt.fixedCosts.toLocaleString()})</td>
                      </tr>
                      <tr className="font-bold border-t-2 border-border">
                        <td className="text-base py-2.5 px-3 text-foreground">Net Income</td>
                        <td className="text-base py-2.5 px-3 text-right text-primary">${result.absorptionIncomeStmt.netIncome.toLocaleString()}</td>
                        <td className="text-base py-2.5 px-3 text-right text-primary">${result.variableIncomeStmt.netIncome.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Component 4: Chart */}
                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-4">Income Statement Comparison</h3>
                    <LazyView minHeight={250}>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
                          <RechartsTooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                          <Bar dataKey="absorption" name="Absorption" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="variable" name="Variable" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </LazyView>
                  </div>
                )}

                {/* Reconciliation Box */}
                <div className="bg-secondary/40 border border-border rounded-lg p-4">
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Profit Reconciliation
                  </h3>
                  <div className="text-sm space-y-1 bg-background p-3 rounded border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Change in Inventory Units:</span>
                      <span className="font-semibold text-foreground">{(result.endingInventory - (parseFloat(vals.beginningInventory) || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fixed OH / Unit:</span>
                      <span className="font-semibold text-foreground">${result.fixedOverheadPerUnit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-border/50 pt-1">
                      <span className="text-foreground">Fixed OH Deferred (Released):</span>
                      <span className="text-primary">${result.fixedOverheadDeferred.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Component 5: Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Units Produced</span>
                      <span className="text-base font-bold text-foreground">{(parseFloat(vals.unitsProduced) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Units Sold</span>
                      <span className="text-base font-bold text-foreground">{(parseFloat(vals.unitsSold) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Absorption Unit Cost</span>
                      <span className="text-base font-bold text-foreground">${result.absorptionUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Variable Unit Cost</span>
                      <span className="text-base font-bold text-foreground">${result.variableUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Absorption Net Income</span>
                      <span className="text-base font-bold text-emerald-600">${result.absorptionProfit.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Variable Net Income</span>
                      <span className="text-base font-bold text-blue-600">${result.variableProfit.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
          <AdPlaceholder />
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Absorption Costing vs Variable Costing?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Absorption costing and variable costing are two distinct methods of accounting for manufacturing costs, and understanding the difference between them is essential for any manager or accountant analyzing profitability. Absorption costing, required by Generally Accepted Accounting Principles (GAAP) for external financial reporting, assigns all manufacturing costs—both fixed and variable—to the units produced. This means each unit carries a portion of fixed overhead as part of its product cost. Variable costing, often used internally for management decision-making and cost-volume-profit analysis, assigns only variable manufacturing costs to units produced. It treats fixed manufacturing overhead as a period expense that is entirely deducted in the period it is incurred, regardless of how many units are sold. This fundamental difference in how fixed overhead is treated creates a critical distinction in reported net income, especially when production volume does not exactly match sales volume. The comparison between the two methods is critical for managers analyzing profitability, setting prices, and making production decisions.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground leading-relaxed">
              Under absorption costing, fixed manufacturing overhead is divided by the number of units produced to determine a fixed cost per unit. This per-unit fixed cost is added to direct materials, direct labor, and variable overhead to find the total absorption product cost. When units remain unsold at the end of the period, a portion of the fixed overhead remains embedded in the ending inventory on the balance sheet, effectively deferring that cost to a future period. Under variable costing, only direct materials, direct labor, and variable overhead are included in the product cost. The entire fixed manufacturing overhead is deducted immediately on the income statement as a period expense, regardless of inventory levels. When production exceeds sales, absorption costing reports higher net income because some fixed overhead is deferred in inventory. When sales exceed production, variable costing reports higher net income because fixed overhead previously deferred is released from inventory. The profit difference between the two methods is always exactly equal to the change in inventory units multiplied by the fixed overhead rate per unit.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">
              The calculator provides a side-by-side comparison of net income under both costing methods. The primary result card highlights the profit difference and explains whether inventory built up or was drawn down. Below that, full income statements illustrate the structural differences between the two approaches: absorption costing relies on gross margin, while variable costing emphasizes contribution margin. The breakdown table details every line item so you can trace exactly how each cost is classified. Finally, the reconciliation section mathematically proves why the profits differ, showing the change in inventory units multiplied by the fixed overhead rate per unit to arrive at the fixed overhead deferred or released. This reconciliation is the key to understanding the relationship between the two methods. 
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              It is important to remember that while variable costing provides unparalleled visibility into the true incremental cost of producing one additional unit, it cannot be legally used for filing corporate taxes or releasing public financial statements. Absorption costing must be utilized for these external obligations because it satisfies the matching principle, ensuring that all manufacturing costs—both direct variable costs and fixed facility overhead—are properly matched against the revenue they helped generate in the correct accounting period. By mastering both costing frameworks, financial managers can successfully navigate external compliance requirements while simultaneously executing internal pricing strategies and operational optimizations.
            </p>
          </div>
        </section>
        <FAQSection faqs={faqs} />
        <PopularCalculators />
      </div>
    </>
  );
}