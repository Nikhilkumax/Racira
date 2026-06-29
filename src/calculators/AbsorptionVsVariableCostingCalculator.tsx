"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, Printer, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from "recharts";

interface CostingResults {
  unitsProduced: number;
  unitsSold: number;
  unitsInInventory: number;
  
  // Absorption
  absorptionUnitProductCost: number;
  absorptionCOGS: number;
  absorptionGrossMargin: number;
  absorptionNetIncome: number;
  absorptionEndingInventory: number;

  // Variable
  variableUnitProductCost: number;
  variableVariableCOGS: number;
  variableContributionMargin: number;
  variableNetIncome: number;
  variableEndingInventory: number;

  incomeDifference: number;
  sales: number;
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
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-base text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-base text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const calculateCosting = (
  unitsProduced: number,
  unitsSold: number,
  sellingPrice: number,
  directMaterials: number,
  directLabor: number,
  variableMOH: number,
  variableSellingAdmin: number,
  fixedMOH: number,
  fixedSellingAdmin: number
): CostingResults => {
  if (unitsProduced <= 0 || unitsSold < 0) {
    return {
      unitsProduced: 0, unitsSold: 0, unitsInInventory: 0,
      absorptionUnitProductCost: 0, absorptionCOGS: 0, absorptionGrossMargin: 0, absorptionNetIncome: 0, absorptionEndingInventory: 0,
      variableUnitProductCost: 0, variableVariableCOGS: 0, variableContributionMargin: 0, variableNetIncome: 0, variableEndingInventory: 0,
      incomeDifference: 0, sales: 0
    };
  }

  const sales = unitsSold * sellingPrice;
  const unitsInInventory = Math.max(0, unitsProduced - unitsSold);

  // Absorption Costing Math
  const fixedMOHPerUnit = fixedMOH / unitsProduced;
  const absorptionUnitProductCost = directMaterials + directLabor + variableMOH + fixedMOHPerUnit;
  const absorptionCOGS = unitsSold * absorptionUnitProductCost;
  const absorptionGrossMargin = sales - absorptionCOGS;
  const absorptionSellingAdmin = fixedSellingAdmin + (unitsSold * variableSellingAdmin);
  const absorptionNetIncome = absorptionGrossMargin - absorptionSellingAdmin;
  const absorptionEndingInventory = unitsInInventory * absorptionUnitProductCost;

  // Variable Costing Math
  const variableUnitProductCost = directMaterials + directLabor + variableMOH;
  const variableVariableCOGS = unitsSold * variableUnitProductCost;
  const variableSellingAdminTotal = unitsSold * variableSellingAdmin;
  const totalVariableCosts = variableVariableCOGS + variableSellingAdminTotal;
  const variableContributionMargin = sales - totalVariableCosts;
  const variableNetIncome = variableContributionMargin - fixedMOH - fixedSellingAdmin;
  const variableEndingInventory = unitsInInventory * variableUnitProductCost;

  return {
    unitsProduced,
    unitsSold,
    unitsInInventory,
    absorptionUnitProductCost,
    absorptionCOGS,
    absorptionGrossMargin,
    absorptionNetIncome,
    absorptionEndingInventory,
    variableUnitProductCost,
    variableVariableCOGS,
    variableContributionMargin,
    variableNetIncome,
    variableEndingInventory,
    incomeDifference: absorptionNetIncome - variableNetIncome,
    sales
  };
};

export default function AbsorptionVsVariableCostingCalculator() {
  const [unitsProduced, setUnitsProduced] = useState("10000");
  const [unitsSold, setUnitsSold] = useState("8000");
  const [sellingPrice, setSellingPrice] = useState("50");
  
  const [directMaterials, setDirectMaterials] = useState("10");
  const [directLabor, setDirectLabor] = useState("8");
  const [variableMOH, setVariableMOH] = useState("4");
  const [variableSellingAdmin, setVariableSellingAdmin] = useState("3");
  
  const [fixedMOH, setFixedMOH] = useState("60000");
  const [fixedSellingAdmin, setFixedSellingAdmin] = useState("40000");

  const [results, setResults] = useState<CostingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const res = calculateCosting(
      parseFloat(unitsProduced) || 0,
      parseFloat(unitsSold) || 0,
      parseFloat(sellingPrice) || 0,
      parseFloat(directMaterials) || 0,
      parseFloat(directLabor) || 0,
      parseFloat(variableMOH) || 0,
      parseFloat(variableSellingAdmin) || 0,
      parseFloat(fixedMOH) || 0,
      parseFloat(fixedSellingAdmin) || 0
    );
    setResults(res);
  };

  const handleReset = () => {
    setUnitsProduced("10000");
    setUnitsSold("8000");
    setSellingPrice("50");
    setDirectMaterials("10");
    setDirectLabor("8");
    setVariableMOH("4");
    setVariableSellingAdmin("3");
    setFixedMOH("60000");
    setFixedSellingAdmin("40000");
    setResults(calculateCosting(10000, 8000, 50, 10, 8, 4, 3, 60000, 40000));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Absorption vs Variable Costing Results</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const chartData = results ? [
    { name: "Net Income", Absorption: results.absorptionNetIncome, Variable: results.variableNetIncome },
    { name: "Ending Inv. Value", Absorption: results.absorptionEndingInventory, Variable: results.variableEndingInventory }
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Absorption vs Variable Costing Calculator" }]} />
      <div className="container-page py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">Absorption vs Variable Costing</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          {/* LEFT COLUMN - INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="units-produced" label="Units Produced" value={unitsProduced} onChange={setUnitsProduced} />
              <CompactInput id="units-sold" label="Units Sold" value={unitsSold} onChange={setUnitsSold} />
            </div>
            <CompactInput id="selling-price" label="Selling Price per Unit" value={sellingPrice} onChange={setSellingPrice} prefix="$" />
            
            <div className="p-4 bg-muted/30 border border-border rounded-lg flex flex-col gap-3">
              <h3 className="text-sm font-semibold mb-1">Variable Costs (Per Unit)</h3>
              <div className="grid grid-cols-2 gap-4">
                <CompactInput id="direct-materials" label="Direct Materials" value={directMaterials} onChange={setDirectMaterials} prefix="$" />
                <CompactInput id="direct-labor" label="Direct Labor" value={directLabor} onChange={setDirectLabor} prefix="$" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CompactInput id="variable-moh" label="Var. Mfg Overhead" value={variableMOH} onChange={setVariableMOH} prefix="$" />
                <CompactInput id="variable-sga" label="Var. Selling & Admin" value={variableSellingAdmin} onChange={setVariableSellingAdmin} prefix="$" />
              </div>
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded-lg flex flex-col gap-3">
              <h3 className="text-sm font-semibold mb-1">Total Fixed Costs</h3>
              <CompactInput id="fixed-moh" label="Fixed Mfg Overhead" value={fixedMOH} onChange={setFixedMOH} prefix="$" />
              <CompactInput id="fixed-sga" label="Fixed Selling & Admin" value={fixedSellingAdmin} onChange={setFixedSellingAdmin} prefix="$" />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >Calculate</button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - RESULTS */}
          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                <div className="flex justify-end hidden-print">
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-4 w-4" /> Print Results
                  </button>
                </div>

                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Difference in Net Income</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${Math.abs(results.incomeDifference).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-foreground/80 font-medium">
                    {results.incomeDifference === 0 
                      ? "Absorption and Variable Net Income are equal (Production = Sales)."
                      : results.incomeDifference > 0 
                        ? "Absorption Income is higher because production exceeded sales (inventory increased)."
                        : "Variable Income is higher because sales exceeded production (inventory decreased)."}
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 divide-x divide-border bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[10px] sm:text-[11px] uppercase text-muted-foreground mb-1">Absorption Net Income</span>
                    <span className="text-base sm:text-lg font-bold">${results.absorptionNetIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[10px] sm:text-[11px] uppercase text-muted-foreground mb-1">Variable Net Income</span>
                    <span className="text-base sm:text-lg font-bold">${results.variableNetIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex flex-col px-2 text-center">
                    <span className="text-[10px] sm:text-[11px] uppercase text-muted-foreground mb-1">Units in Ending Inv.</span>
                    <span className="text-base sm:text-lg font-bold">{results.unitsInInventory.toLocaleString("en-US")} units</span>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                  <h3 className="text-base font-semibold mb-4">Financial Comparison</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 600 }} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                          width={60}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                          cursor={{fill: 'hsl(var(--muted))'}}
                        />
                        <Legend />
                        <Bar 
                          dataKey="Absorption" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]} 
                        />
                        <Bar 
                          dataKey="Variable" 
                          fill="#8b5cf6" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Breakdown Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Absorption Statement */}
                  <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                    <h3 className="text-sm font-semibold p-3 border-b border-border bg-muted/30 text-primary">Absorption Costing</h3>
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-3 py-2 text-xs">Sales</td>
                          <td className="px-3 py-2 text-xs text-right font-medium">${results.sales.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-xs text-muted-foreground">Less: Cost of Goods Sold</td>
                          <td className="px-3 py-2 text-xs text-right font-medium text-destructive">(${results.absorptionCOGS.toLocaleString("en-US", { maximumFractionDigits: 0 })})</td>
                        </tr>
                        <tr className="bg-muted/10">
                          <td className="px-3 py-2 text-xs font-semibold">Gross Margin</td>
                          <td className="px-3 py-2 text-xs text-right font-semibold">${results.absorptionGrossMargin.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-xs text-muted-foreground">Less: Selling & Admin Exp.</td>
                          <td className="px-3 py-2 text-xs text-right font-medium text-destructive">(${(results.sales - results.absorptionCOGS - results.absorptionNetIncome).toLocaleString("en-US", { maximumFractionDigits: 0 })})</td>
                        </tr>
                        <tr className="bg-primary/5">
                          <td className="px-3 py-2 text-sm font-bold">Net Income</td>
                          <td className="px-3 py-2 text-sm text-right font-bold text-primary">${results.absorptionNetIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Variable Statement */}
                  <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                    <h3 className="text-sm font-semibold p-3 border-b border-border bg-muted/30 text-violet-600">Variable Costing</h3>
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-3 py-2 text-xs">Sales</td>
                          <td className="px-3 py-2 text-xs text-right font-medium">${results.sales.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-xs text-muted-foreground">Less: Var. Expenses (Mfg & S&A)</td>
                          <td className="px-3 py-2 text-xs text-right font-medium text-destructive">(${ (results.sales - results.variableContributionMargin).toLocaleString("en-US", { maximumFractionDigits: 0 }) })</td>
                        </tr>
                        <tr className="bg-muted/10">
                          <td className="px-3 py-2 text-xs font-semibold">Contribution Margin</td>
                          <td className="px-3 py-2 text-xs text-right font-semibold">${results.variableContributionMargin.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-xs text-muted-foreground">Less: Fixed Expenses (Mfg & S&A)</td>
                          <td className="px-3 py-2 text-xs text-right font-medium text-destructive">(${(results.variableContributionMargin - results.variableNetIncome).toLocaleString("en-US", { maximumFractionDigits: 0 })})</td>
                        </tr>
                        <tr className="bg-violet-600/5">
                          <td className="px-3 py-2 text-sm font-bold">Net Income</td>
                          <td className="px-3 py-2 text-sm text-right font-bold text-violet-600">${results.variableNetIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT SECTION */}
        <div className="max-w-[800px] mx-auto mt-16 prose prose-slate dark:prose-invert">
          <h2>Absorption Costing vs Variable Costing</h2>
          <p>
            In managerial accounting, there are two primary methods used to assign costs to inventory and calculate net income: <strong>Absorption Costing</strong> and <strong>Variable Costing</strong>. While both methods result in similar long-term financial pictures, they treat fixed manufacturing overhead very differently, which can lead to vastly different net income figures in a single period.
          </p>

          <h3>What is Absorption Costing?</h3>
          <p>
            Absorption costing (also known as full costing) assigns <em>all</em> manufacturing costs to the product. This includes direct materials, direct labor, variable manufacturing overhead, and <strong>fixed manufacturing overhead</strong>.
          </p>
          <p>
            Because fixed manufacturing overhead (like factory rent or manager salaries) is assigned to individual units, some of those fixed costs get "absorbed" into inventory. If a unit is produced but not sold, the fixed cost attached to that unit sits on the balance sheet as an asset (Inventory) rather than being expensed on the income statement as Cost of Goods Sold.
          </p>
          <p>
            <strong>GAAP Requirement:</strong> Generally Accepted Accounting Principles (GAAP) require external financial statements to be prepared using absorption costing.
          </p>

          <h3>What is Variable Costing?</h3>
          <p>
            Variable costing (also known as direct costing) assigns only <em>variable</em> manufacturing costs to the product. Direct materials, direct labor, and variable manufacturing overhead are treated as product costs.
          </p>
          <p>
            Under variable costing, <strong>fixed manufacturing overhead is treated as a period cost</strong>. This means the entire lump sum of fixed overhead is expensed on the income statement in the period it occurs, regardless of how many units were actually sold.
          </p>
          <p>
            <strong>Managerial Use:</strong> Variable costing is strictly used internally for management decision-making, cost-volume-profit (CVP) analysis, and performance evaluation, as it perfectly separates fixed and variable behaviors.
          </p>

          <h2>Why Does Net Income Differ?</h2>
          <p>
            The difference in net income between the two methods comes down to exactly one factor: <strong>changes in inventory levels</strong>. Specifically, it is the fixed manufacturing overhead deferred in (or released from) inventory under absorption costing.
          </p>
          <ul>
            <li><strong>Production &gt; Sales (Inventory Increases):</strong> Absorption costing net income will be HIGHER than variable costing. This is because some fixed overhead is "trapped" in unsold inventory on the balance sheet, deferring the expense to a future period.</li>
            <li><strong>Sales &gt; Production (Inventory Decreases):</strong> Absorption costing net income will be LOWER than variable costing. This is because previously trapped fixed overhead is finally released from inventory and expensed as COGS, alongside the current period's fixed overhead.</li>
            <li><strong>Production = Sales:</strong> Net income will be exactly the same under both methods because no fixed overhead is deferred in or released from inventory.</li>
          </ul>

          <h2>The Danger of Absorption Costing</h2>
          <p>
            While required for external reporting, absorption costing creates a dangerous incentive for managers: <strong>producing for inventory</strong>.
          </p>
          <p>
            Because producing more units spreads the fixed overhead across a larger number of units, the unit product cost decreases. This lowers the Cost of Goods Sold (COGS) and artificially inflates Net Income for the period, even if sales remain completely flat. A manager looking to secure a year-end bonus might instruct the factory to overproduce, creating massive stockpiles of inventory simply to make the income statement look better. Variable costing prevents this illusion by expensing all fixed overhead immediately.
          </p>

          <h2>Benefits of Using This Calculator</h2>
          <p>
            For accounting students and business managers, reconciling absorption and variable costing can be a mathematically tedious task. Our calculator automatically generates the distinct unit product costs, distinct income statements, and distinct ending inventory valuations for both methods simultaneously. By adjusting the "Units Produced" versus "Units Sold" inputs, you can instantly observe how inventory fluctuations directly manipulate absorption net income while leaving variable costing net income tied purely to sales performance.
          </p>
        </div>

        <FAQSection faqs={[
          { question: "Is variable costing allowed by GAAP?", answer: "No. Variable costing cannot be used for external financial reporting or tax purposes. GAAP and the IRS require absorption costing because it adheres to the matching principle (matching all costs of production against the revenue generated)." },
          { question: "How do you reconcile the difference in Net Income?", answer: "The shortcut formula to reconcile the difference is: (Units Produced - Units Sold) × Fixed Manufacturing Overhead Per Unit. This amount will exactly equal the difference between Absorption Net Income and Variable Net Income." },
          { question: "How are Selling and Administrative expenses handled?", answer: "Both methods treat Selling and Administrative (S&A) expenses the same way: as period costs. S&A expenses are never attached to the product or put into inventory under either method." },
          { question: "What is Contribution Margin vs Gross Margin?", answer: "Absorption costing calculates Gross Margin (Sales minus Cost of Goods Sold). Variable costing calculates Contribution Margin (Sales minus ALL variable expenses, including variable S&A). They serve different analytical purposes." },
          { question: "Which method is better for pricing decisions?", answer: "Variable costing is generally better for short-term pricing decisions (like special orders) because it clearly shows the incremental cost of producing one more unit. Absorption costing is needed for long-term pricing to ensure fixed costs are eventually covered." }
        ]} />

        <div className="mt-12">
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
