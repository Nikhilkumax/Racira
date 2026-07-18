"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, PackageSearch, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CarryingCostResults {
  inventoryValue: number;
  capitalCost: number;
  storageCost: number;
  serviceCost: number;
  riskCost: number;
  totalCostPct: number;
  totalCostAmt: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; pct: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateCarryingCost = (val: number, capPct: number, storPct: number, servPct: number, riskPct: number): CarryingCostResults => {
  const totalCostPct = capPct + storPct + servPct + riskPct;
  const totalCostAmt = val * (totalCostPct / 100);

  const capitalCost = val * (capPct / 100);
  const storageCost = val * (storPct / 100);
  const serviceCost = val * (servPct / 100);
  const riskCost = val * (riskPct / 100);

  const chartData = [
    { name: "Capital Cost", value: capitalCost, color: "hsl(var(--primary))" },
    { name: "Storage/Space", value: storageCost, color: "hsl(var(--chart-2))" },
    { name: "Service (Ins/Tax)", value: serviceCost, color: "hsl(var(--chart-3))" },
    { name: "Risk (Shrinkage)", value: riskCost, color: "hsl(var(--destructive))" },
  ];

  const summaryStats = [
    { label: "Total Carrying Cost", value: `$${totalCostAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Holding Rate", value: `${totalCostPct.toFixed(1)}%` },
    { label: "Avg. Monthly Cost", value: `$${(totalCostAmt/12).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Primary Cost Driver", value: [...chartData].sort((a,b) => b.value - a.value)[0].name.split(' ')[0] },
  ];

  const breakdown = [
    { label: "Average Inventory Value", pct: "-", amount: `$${val.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Capital Cost (Financing/Opportunity)", pct: `${capPct}%`, amount: `$${capitalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Storage Space (Rent/Utilities)", pct: `${storPct}%`, amount: `$${storageCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Inventory Services (Insurance/Taxes)", pct: `${servPct}%`, amount: `$${serviceCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Inventory Risk (Shrinkage/Damage)", pct: `${riskPct}%`, amount: `$${riskCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Annual Carrying Cost", pct: `${totalCostPct.toFixed(2)}%`, amount: `$${totalCostAmt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-red-500 font-bold" },
  ];

  return { inventoryValue: val, capitalCost, storageCost, serviceCost, riskCost, totalCostPct, totalCostAmt, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  inventory: "250000",
  capPct: "8.0",
  storPct: "6.0",
  servPct: "2.5",
  riskPct: "4.5",
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

export default function CarryingCostOfInventoryCalculator() {
  const [inventory, setInventory] = useState(DEFAULTS.inventory);
  const [capPct, setCapPct] = useState(DEFAULTS.capPct);
  const [storPct, setStorPct] = useState(DEFAULTS.storPct);
  const [servPct, setServPct] = useState(DEFAULTS.servPct);
  const [riskPct, setRiskPct] = useState(DEFAULTS.riskPct);
  
  const [results, setResults] = useState<CarryingCostResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateCarryingCost(
      parseFloat(inventory) || 0, 
      parseFloat(capPct) || 0, 
      parseFloat(storPct) || 0, 
      parseFloat(servPct) || 0,
      parseFloat(riskPct) || 0
    ));
  };

  const handleReset = () => {
    setInventory(DEFAULTS.inventory); setCapPct(DEFAULTS.capPct); setStorPct(DEFAULTS.storPct); setServPct(DEFAULTS.servPct); setRiskPct(DEFAULTS.riskPct);
    setResults(calculateCarryingCost(250000, 8.0, 6.0, 2.5, 4.5));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carrying Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.name}:</span>
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Carrying Cost of Inventory" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carrying Cost of Inventory Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <PackageSearch className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Inventory Data</h2>
            </div>
            
            <CompactInput id="inv" label="Average Inventory Value" value={inventory} onChange={setInventory} prefix="$" tooltip="The average value of inventory held throughout the year." />
            
            <hr className="border-border my-2" />
            
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Cost Components (%)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="cap" label="Capital Cost" value={capPct} onChange={setCapPct} suffix="%" tooltip="Financing interest or opportunity cost of capital tied up in inventory. Usually the largest cost (6-12%)." step="0.1" />
              <CompactInput id="stor" label="Storage Cost" value={storPct} onChange={setStorPct} suffix="%" tooltip="Warehouse rent, utilities, and security. Typically 2-6%." step="0.1" />
              <CompactInput id="serv" label="Service Cost" value={servPct} onChange={setServPct} suffix="%" tooltip="Insurance, property taxes, and inventory management software. Typically 1-3%." step="0.1" />
              <CompactInput id="risk" label="Risk Cost" value={riskPct} onChange={setRiskPct} suffix="%" tooltip="Shrinkage (theft), obsolescence, and damage. Varies highly by industry (2-10%)." step="0.1" />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground text-center font-medium">
              Sum of rates should typically be between 15% and 25%.
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.totalCostPct > 25 ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Annual Carrying Cost
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.totalCostPct > 25 ? 'text-red-600' : 'text-amber-600'}`}>
                    ${results.totalCostAmt.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Implied Holding Rate: <span className="font-bold text-foreground">{results.totalCostPct.toFixed(1)}%</span> of Inventory Value
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {results.summaryStats.map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stat.label}</div>
                      <div className="text-sm font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Cost Component</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Rate</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className="text-[13px] py-3 px-3 text-right text-muted-foreground">{item.pct}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Cost Distribution</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={results.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is the Carrying Cost of Inventory?</h2>
            <p>The carrying cost of inventory (also known as holding cost) is the total amount a business spends to store and maintain unsold goods over a specific period, typically a year. It is usually expressed as a percentage of the total inventory value. For most businesses, this percentage ranges between <strong>15% and 25%</strong>.</p>
            
            <h3>The Hidden Costs of Unsold Goods</h3>
            <p>Many businesses mistakenly believe that if they buy a product for $10 and it sits in a warehouse for a year, it still only cost them $10. In reality, sitting inventory actively bleeds cash through four primary channels:</p>
            <ol>
              <li><strong>Capital Cost (Financing & Opportunity):</strong> This is usually the largest component. If you borrowed money to buy the inventory, you are paying interest. Even if you paid cash, that cash is tied up and cannot be used to earn interest or invest in marketing. This is your "opportunity cost."</li>
              <li><strong>Storage Space Cost:</strong> The physical cost of holding the goods. This includes warehouse rent, electricity, heating/cooling, and physical security.</li>
              <li><strong>Inventory Service Cost:</strong> Administrative costs such as commercial property insurance premiums, local inventory taxes, and inventory management software (WMS).</li>
              <li><strong>Inventory Risk Cost:</strong> Goods don't last forever. This covers shrinkage (employee theft or shoplifting), damage, perishability, and obsolescence (e.g., tech gadgets becoming outdated before they are sold).</li>
            </ol>
            
            <h2 className="text-2xl font-bold mb-3">Why Calculating Holding Cost Matters</h2>
            <p>If your carrying cost is 20% and you hold $1,000,000 in average inventory, you are spending $200,000 a year just to keep those items on shelves. Understanding this metric is crucial for determining the <strong>Economic Order Quantity (EOQ)</strong>.</p>
            <p>If your holding costs are high, you should order smaller batches more frequently (Just-In-Time inventory) to keep average inventory low. If holding costs are very low but ordering/shipping costs are high, you should buy in large bulk quantities.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is a normal Carrying Cost percentage?", answer: "Across most retail and manufacturing industries, a normal carrying cost is roughly 20% to 25% per year. However, high-tech goods with rapid obsolescence or perishable food items can easily exceed 30% to 40%." },
            { question: "How can I lower my inventory carrying cost?", answer: "You can lower it by improving demand forecasting to prevent overstocking, implementing Just-In-Time (JIT) ordering, liquidating obsolete 'dead stock' immediately, and optimizing warehouse layouts to reduce storage footprint." },
            { question: "Does this affect pricing strategy?", answer: "Yes. If an item sits in inventory for 6 months, its true cost basis has increased. Businesses with slow inventory turnover must mark up their products significantly higher than fast-turning businesses just to break even on the holding costs." },
            { question: "Is carrying cost tax deductible?", answer: "Many components of carrying cost (warehouse rent, insurance, loan interest) are standard deductible business expenses. However, the 'opportunity cost' of tied-up capital is an economic cost, not an accounting cost, and is not tax-deductible." },
          ]} pageUrl="https://racira.com/calculator/carrying-cost-of-inventory-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Carrying Cost Of Inventory Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Carrying Cost Of Inventory Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Carrying Cost Of Inventory Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Carrying Cost Of Inventory Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Carrying Cost Of Inventory Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/carrying-cost-of-inventory-calculator" />
        </div>
      </div>
    </>
  );
}
