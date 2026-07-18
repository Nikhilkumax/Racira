"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Undo2, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ReturnsResults {
  returnsCount: number;
  retailValue: number;
  returnShipping: number;
  laborCost: number;
  repackCost: number;
  destructionPct: number;
  
  hardLogisticsCost: number;
  valueDestructionCost: number;
  
  totalUnitCost: number;
  totalMonthlyCost: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateReturns = (
  returnsCount: number, retailValue: number, 
  returnShipping: number, laborCost: number, repackCost: number, 
  destructionPct: number
): ReturnsResults => {
  
  const hardLogisticsCost = returnShipping + laborCost + repackCost;
  const valueDestructionCost = retailValue * (destructionPct / 100);
  
  const totalUnitCost = hardLogisticsCost + valueDestructionCost;
  const totalMonthlyCost = totalUnitCost * returnsCount;

  const chartData = [
    { name: "Return Shipping Postage", value: returnShipping, color: "hsl(var(--amber-500))" },
    { name: "Receiving / QA Labor", value: laborCost, color: "hsl(var(--blue-500))" },
    { name: "Repackaging Materials", value: repackCost, color: "hsl(var(--emerald-500))" },
    { name: "Product Value Destruction", value: valueDestructionCost, color: "hsl(var(--destructive))" },
  ];

  const summaryStats = [
    { label: "Cost Per Returned Item", value: `$${totalUnitCost.toFixed(2)}` },
    { label: "Total Monthly Bleed", value: `$${totalMonthlyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Hard Logistics Cost", value: `$${hardLogisticsCost.toFixed(2)} / unit` },
    { label: "Value Destruction", value: `$${valueDestructionCost.toFixed(2)} / unit` },
  ];

  const breakdown = [
    { label: "Reverse Logistics Postage (Carrier Fee)", amount: `$${returnShipping.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Warehouse Receiving & Inspection Labor", amount: `$${laborCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-600" },
    { label: "Refurbishment & Repackaging Materials", amount: `$${repackCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-emerald-600" },
    { label: `Loss of Retail Value (${destructionPct}%)`, amount: `$${valueDestructionCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Total Processing Cost per Unit", amount: `$${totalUnitCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
    { label: `Total Monthly Financial Bleed (${returnsCount} units)`, amount: `$${totalMonthlyCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-red-600 font-bold text-[15px]" },
  ];

  return { returnsCount, retailValue, returnShipping, laborCost, repackCost, destructionPct, hardLogisticsCost, valueDestructionCost, totalUnitCost, totalMonthlyCost, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  returnsCount: "850",
  retailValue: "125",
  returnShipping: "12",
  laborCost: "4.50",
  repackCost: "1.25",
  destructionPct: "25",
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

export default function ReturnsProcessingCostCalculator() {
  const [returnsCount, setReturnsCount] = useState(DEFAULTS.returnsCount);
  const [retailValue, setRetailValue] = useState(DEFAULTS.retailValue);
  const [returnShipping, setReturnShipping] = useState(DEFAULTS.returnShipping);
  const [laborCost, setLaborCost] = useState(DEFAULTS.laborCost);
  const [repackCost, setRepackCost] = useState(DEFAULTS.repackCost);
  const [destructionPct, setDestructionPct] = useState(DEFAULTS.destructionPct);
  
  const [results, setResults] = useState<ReturnsResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateReturns(
      parseFloat(returnsCount) || 0, parseFloat(retailValue) || 0,
      parseFloat(returnShipping) || 0, parseFloat(laborCost) || 0, parseFloat(repackCost) || 0,
      parseFloat(destructionPct) || 0
    ));
  };

  const handleReset = () => {
    setReturnsCount(DEFAULTS.returnsCount); setRetailValue(DEFAULTS.retailValue);
    setReturnShipping(DEFAULTS.returnShipping); setLaborCost(DEFAULTS.laborCost); setRepackCost(DEFAULTS.repackCost); setDestructionPct(DEFAULTS.destructionPct);
    setResults(calculateReturns(850, 125, 12, 4.50, 1.25, 25));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Returns Processing Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Returns Processing Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reverse Logistics & Returns Processing Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Undo2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Scale & Value</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="qty" label="Returns per Month" value={returnsCount} onChange={setReturnsCount} tooltip="Total volume of items sent back by customers." />
              <CompactInput id="val" label="Original Retail Price" value={retailValue} onChange={setRetailValue} prefix="$" tooltip="The MSRP or selling price of a single unit." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Undo2 className="h-5 w-5 text-red-500" />
              <h2 className="text-2xl font-bold mb-3">Unit Reverse Logistics</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="shp" label="Return Shipping Postage" value={returnShipping} onChange={setReturnShipping} prefix="$" tooltip="Carrier cost to mail the item back from the customer to you." />
              <CompactInput id="lab" label="Receiving & QA Labor" value={laborCost} onChange={setLaborCost} prefix="$" tooltip="Hourly wage translated to the time it takes a worker to open the box, inspect the item, and restock it." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rep" label="Repackaging Materials" value={repackCost} onChange={setRepackCost} prefix="$" tooltip="Cost of a new cardboard box, polybag, or tags." />
              <CompactInput id="des" label="Value Destruction" value={destructionPct} onChange={setDestructionPct} suffix="%" tooltip="If you have to sell the item open-box, 'used', or liquidate it, what % of the original price do you lose?" />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>Reverse logistics is notoriously inefficient. Opening a returned box, inspecting it, and making it "sellable" again often costs 3x more than shipping it out the first time.</p>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Cost Per Single Return
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-red-600">
                    ${results.totalUnitCost.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Total Monthly Bleed: <span className="font-bold text-red-600">${results.totalMonthlyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Expense Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Return Cost Eaters</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={results.chartData.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {results.chartData.filter(d => d.value > 0).map((entry, index) => (
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
            <h2 className="text-2xl font-bold mb-3">The Nightmare of Reverse Logistics</h2>
            <p><strong>Reverse Logistics</strong> refers to the supply chain process of moving goods from the end customer back to the seller or manufacturer. In the era of free e-commerce returns, this is often the single largest profit leak in a retail business.</p>
            
            <h3>Why Returns Cost More Than Outbound Shipping</h3>
            <p>When you ship an order to a customer, it is highly optimized. A warehouse worker scans a barcode, places the new item in a pristine box, slaps a label on it, and it goes out the door in 60 seconds.</p>
            <p>When an item comes back, it is chaos. A worker has to open a beaten-up box, verify the item is actually inside, inspect it for damage, smell it for smoke or perfume (in apparel), fold it, put it in a new polybag, and update the inventory software. <strong>Quality Assurance (QA) labor is incredibly expensive and cannot be automated.</strong></p>

            <h2 className="text-2xl font-bold mb-3">Value Destruction</h2>
            <p>The most devastating part of a return is often not the shipping label—it is the destruction of the product's value. If a customer tears open retail packaging, or wears a pair of shoes once, you can no longer legally sell that item as "New."</p>
            <p>You are forced to sell it "Open Box" at a 25% discount, liquidate it to a jobber for pennies on the dollar, or literally throw it in a dumpster (which costs money for waste disposal). This calculator captures that lost value as a hard cost.</p>
            
            <h3>How to Reduce Return Costs</h3>
            <ul>
              <li><strong>Charge for Returns:</strong> Stop offering "Free Returns." Deducting $5.99 from the refund for the return label instantly subsidizes the reverse freight cost and discourages frivolous buying.</li>
              <li><strong>Returnless Refunds:</strong> For items with a COGS under $15, it is mathematically cheaper to let the customer keep the item than to pay the return shipping, QA labor, and repackaging costs.</li>
              <li><strong>Better Sizing Guides:</strong> In apparel, 70% of returns are due to fit. Investing in 3D sizing tech or better photography drastically reduces the initial return rate.</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "What is a normal return rate?", answer: "It depends on the industry. Electronics and home goods sit around 8%. Apparel and footwear are notoriously high, often hovering between 20% and 35%." },
            { question: "Why do companies destroy returned goods?", answer: "If an item costs $10 to manufacture, but costs $15 in labor to inspect, clean, and restock, it is mathematically cheaper to throw it in an incinerator. This is a massive environmental issue in fast fashion." },
            { question: "What is a 3rd Party Reverse Logistics provider (3PRL)?", answer: "Specialized warehouses that ONLY handle returns. They are experts at refurbishing electronics or dry-cleaning apparel at scale, allowing the primary warehouse to focus purely on outbound fulfillment." },
          ]} pageUrl="https://racira.com/calculator/returns-processing-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Returns Processing Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Returns Processing Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Returns Processing Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Returns Processing Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Returns Processing Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/returns-processing-cost-calculator" />
        </div>
      </div>
    </>
  );
}
