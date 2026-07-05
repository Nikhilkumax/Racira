"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, CheckCircle2 } from "lucide-react";

const DEFAULTS = {
  unitsProduced: "10000",
  unitsSold: "8000",
  sellingPrice: "50",
  directMaterials: "10",
  directLabor: "8",
  variableOverhead: "2",
  fixedOverhead: "60000",
  
  showAdvanced: false,
  fixedSellingAdmin: "30000",
  variableSellingAdmin: "3",
  beginningInventory: "0"
};

interface ResultType {
  absorptionProfit: number;
  variableProfit: number;
  difference: number;
  fixedOverheadDeferred: number;
  endingInventory: number;
  fixedOverheadPerUnit: number;
  
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
  
  // Assuming beginning inventory has same unit cost for simplicity
  const absorptionCogs = sold * absorptionUnitCost;
  const grossMargin = revenue - absorptionCogs;
  const totalSga = fsga + (vsga * sold);
  const absorptionProfit = grossMargin - totalSga;

  // Variable Costing
  const variableUnitCost = dm + dl + voh;
  const variableCogs = sold * variableUnitCost;
  const totalVariableCosts = variableCogs + (vsga * sold);
  const contributionMargin = revenue - totalVariableCosts;
  const variableProfit = contributionMargin - foh - fsga;

  const difference = absorptionProfit - variableProfit;
  const fixedOverheadDeferred = (endingInventory - begInv) * fixedOverheadPerUnit;

  return {
    absorptionProfit,
    variableProfit,
    difference,
    fixedOverheadDeferred,
    endingInventory,
    fixedOverheadPerUnit,
    absorptionIncomeStmt: {
      revenue,
      cogs: absorptionCogs,
      grossMargin,
      sga: totalSga,
      netIncome: absorptionProfit
    },
    variableIncomeStmt: {
      revenue,
      variableCosts: totalVariableCosts,
      contributionMargin,
      fixedCosts: foh + fsga,
      netIncome: variableProfit
    }
  };
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number" }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-base font-medium mb-1.5 text-foreground">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground">{suffix}</span>}
    </div>
  </div>
);

export default function AbsorptionCostingVsVariableCostingProfitComparison() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<ResultType | null>(null);

  useEffect(() => {
    setResult(calculate(vals));
  }, []);

  const handleCalculate = () => setResult(calculate(vals));
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const updateVal = (key: keyof typeof DEFAULTS, val: any) => setVals(prev => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is Absorption Costing?", answer: "Absorption costing includes all manufacturing costs (direct materials, direct labor, variable overhead, and fixed overhead) in the cost of a product. It is required by GAAP for external financial reporting." },
    { question: "What is Variable Costing?", answer: "Variable costing includes only variable manufacturing costs in the product cost. Fixed overhead is treated as a period expense and deducted in full on the income statement. It is used for internal decision-making." },
    { question: "Why do the profits differ?", answer: "Profits differ when units produced do not equal units sold. Under absorption costing, some fixed overhead is deferred in ending inventory, increasing profit. Under variable costing, all fixed overhead is expensed immediately." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Absorption vs Variable Costing" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Absorption vs Variable Costing Profit Comparison</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="prod" label="Units Produced" value={vals.unitsProduced} onChange={(v: string) => updateVal('unitsProduced', v)} />
              <CompactInput id="sold" label="Units Sold" value={vals.unitsSold} onChange={(v: string) => updateVal('unitsSold', v)} />
              <CompactInput id="price" label="Selling Price / Unit" value={vals.sellingPrice} onChange={(v: string) => updateVal('sellingPrice', v)} prefix="$" />
              <CompactInput id="dm" label="Direct Materials / Unit" value={vals.directMaterials} onChange={(v: string) => updateVal('directMaterials', v)} prefix="$" />
              <CompactInput id="dl" label="Direct Labor / Unit" value={vals.directLabor} onChange={(v: string) => updateVal('directLabor', v)} prefix="$" />
              <CompactInput id="voh" label="Variable OH / Unit" value={vals.variableOverhead} onChange={(v: string) => updateVal('variableOverhead', v)} prefix="$" />
            </div>
            <CompactInput id="foh" label="Total Fixed Mfg Overhead" value={vals.fixedOverhead} onChange={(v: string) => updateVal('fixedOverhead', v)} prefix="$" />

            <div>
              <button
                type="button"
                onClick={() => updateVal('showAdvanced', !vals.showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-3"
              >
                Professional Mode (SG&A) {vals.showAdvanced ? <ChevronDown className="h-3 w-3 rotate-180" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              
              {vals.showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="fsga" label="Fixed Selling & Admin" value={vals.fixedSellingAdmin} onChange={(v: string) => updateVal('fixedSellingAdmin', v)} prefix="$" />
                  <CompactInput id="vsga" label="Variable SG&A / Unit" value={vals.variableSellingAdmin} onChange={(v: string) => updateVal('variableSellingAdmin', v)} prefix="$" />
                  <CompactInput id="begInv" label="Beginning Inventory (Units)" value={vals.beginningInventory} onChange={(v: string) => updateVal('beginningInventory', v)} />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2">
              <button onClick={handleCalculate} className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="text-center sm:text-left">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Absorption Profit</div>
                    <div className="text-4xl font-bold text-primary my-1">${result.absorptionProfit.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                  </div>
                  <div className="h-10 w-px bg-primary/20 hidden sm:block"></div>
                  <div className="text-center sm:text-left">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Variable Profit</div>
                    <div className="text-4xl font-bold text-primary my-1">${result.variableProfit.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3 border-b border-border pb-2">Absorption Costing (GAAP)</h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span>${result.absorptionIncomeStmt.revenue.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Less: COGS</span><span>${result.absorptionIncomeStmt.cogs.toLocaleString()}</span></div>
                      <div className="flex justify-between font-bold border-t border-border/50 pt-1.5"><span className="text-foreground">Gross Margin</span><span>${result.absorptionIncomeStmt.grossMargin.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Less: SG&A</span><span>${result.absorptionIncomeStmt.sga.toLocaleString()}</span></div>
                      <div className="flex justify-between font-bold border-t border-border/50 pt-1.5 text-primary"><span className="text-foreground">Net Income</span><span>${result.absorptionIncomeStmt.netIncome.toLocaleString()}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3 border-b border-border pb-2">Variable Costing (Internal)</h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span>${result.variableIncomeStmt.revenue.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Less: Var Costs</span><span>${result.variableIncomeStmt.variableCosts.toLocaleString()}</span></div>
                      <div className="flex justify-between font-bold border-t border-border/50 pt-1.5"><span className="text-foreground">Contribution Margin</span><span>${result.variableIncomeStmt.contributionMargin.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Less: Fixed Costs</span><span>${result.variableIncomeStmt.fixedCosts.toLocaleString()}</span></div>
                      <div className="flex justify-between font-bold border-t border-border/50 pt-1.5 text-primary"><span className="text-foreground">Net Income</span><span>${result.variableIncomeStmt.netIncome.toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/40 border border-border rounded-lg p-4">
                    <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Profit Reconciliation</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        Difference in Net Income: <strong>${Math.abs(result.difference).toLocaleString()}</strong>
                    </p>
                    <div className="text-sm space-y-1 bg-background p-3 rounded border border-border">
                        <div className="flex justify-between"><span>Change in Inventory Units:</span><span>{(result.endingInventory - (parseFloat(vals.beginningInventory)||0)).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Fixed OH / Unit:</span><span>${result.fixedOverheadPerUnit.toLocaleString()}</span></div>
                        <div className="flex justify-between font-bold border-t border-border/50 pt-1"><span>Fixed OH Deferred (Released):</span><span>${result.fixedOverheadDeferred.toLocaleString()}</span></div>
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
              Absorption costing and variable costing are two distinct methods of accounting for manufacturing costs. Absorption costing, required by Generally Accepted Accounting Principles (GAAP) for external reporting, assigns all manufacturing costs—both fixed and variable—to units produced. Variable costing, often used internally for management decision-making, assigns only variable manufacturing costs to units produced, treating fixed manufacturing overhead as a period expense that is entirely deducted in the period it is incurred. This comparison is critical for managers analyzing profitability and pricing.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground leading-relaxed">
              Under absorption costing, fixed manufacturing overhead is divided by the number of units produced to determine a fixed cost per unit. This cost is added to direct materials, direct labor, and variable overhead to find the total product cost. If units remain unsold, a portion of the fixed overhead remains in ending inventory on the balance sheet. Under variable costing, only direct materials, direct labor, and variable overhead are included in the product cost. The entire fixed manufacturing overhead is deducted immediately on the income statement, regardless of inventory levels.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">
              The calculator provides a side-by-side comparison of net income under both methods. The primary result card highlights the profit difference. Below that, full income statements illustrate the structural differences: absorption costing relies on gross margin, while variable costing emphasizes contribution margin. Finally, the reconciliation section mathematically proves why the profits differ, which is directly tied to the change in inventory multiplied by the fixed overhead rate per unit.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p className="text-muted-foreground leading-relaxed">
              The fundamental driver of the profit discrepancy is the relationship between units produced and units sold. If production exceeds sales, inventory increases, and absorption costing defers some fixed overhead costs into inventory, resulting in higher reported profit. If sales exceed production, inventory decreases, and absorption costing releases previously deferred fixed overhead from inventory into the cost of goods sold, resulting in lower reported profit compared to variable costing. If production equals sales, profits are identical.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Professional Features</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Professional Mode allows for the inclusion of selling, general, and administrative (SG&A) expenses. You can separate SG&A into fixed and variable components. While these are considered period costs under both methods, variable costing deducts variable SG&A to arrive at the contribution margin, whereas absorption costing deducts all SG&A after calculating gross margin. Entering beginning inventory allows for precise reconciliation across multiple operating periods.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p className="text-muted-foreground leading-relaxed">
              Suppose a company produces ten thousand units but only sells eight thousand. Fixed manufacturing overhead is sixty thousand dollars. Under absorption costing, six dollars of fixed overhead is assigned to each unit. Since two thousand units remain in inventory, twelve thousand dollars of fixed overhead is deferred to the balance sheet. Consequently, the absorption costing net income will be exactly twelve thousand dollars higher than the variable costing net income, where the full sixty thousand dollars is expensed immediately.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p className="text-muted-foreground leading-relaxed">
              Managers should rely on variable costing for internal decision-making, such as pricing, special orders, and cost-volume-profit analysis, because it clearly separates fixed and variable costs and prevents production volume changes from artificially inflating profit. However, they must understand absorption costing to anticipate external financial reporting outcomes. Be cautious of the incentive under absorption costing to overproduce simply to defer fixed costs and inflate short-term profit.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Using an Absorption vs Variable Costing Profit Comparison tool provides total clarity on how inventory fluctuations impact the bottom line. It demystifies the complex reconciliation required by financial accounting standards and helps bridge the gap between external reporting and internal managerial reality. This tool is indispensable for accounting students, corporate financial analysts, and business owners striving to master their cost structures and financial performance metrics.
            </p>
          </div>
        </section>
        <FAQSection faqs={faqs} />
        <PopularCalculators />
      </div>
    </>
  );
}
