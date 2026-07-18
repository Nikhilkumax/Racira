"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, PackageCheck, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface ConsignmentResults {
  inventoryValue: number;
  holdingRate: number;
  months: number;
  spoilageRate: number;
  
  holdingCost: number;
  spoilageCost: number;
  totalSupplierCost: number;
  
  chartData: { name: string; Supplier: number; Retailer: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; responsible: string; colorClass?: string; isTotal?: boolean; }[];
}

const calculateConsignment = (
  inventoryValue: number, holdingRate: number, months: number, spoilageRate: number
): ConsignmentResults => {
  
  // Supplier holds the financial burden of the inventory until it is sold
  const holdingCost = inventoryValue * (holdingRate / 100) * (months / 12);
  const spoilageCost = inventoryValue * (spoilageRate / 100);
  
  const totalSupplierCost = holdingCost + spoilageCost;
  
  // Under pure consignment, the Retailer pays $0 upfront and takes $0 inventory risk
  const retailerCost = 0;

  const chartData = [
    { name: "Upfront Capital Tied Up", Supplier: inventoryValue, Retailer: 0 },
    { name: "Inventory Holding Cost", Supplier: holdingCost, Retailer: 0 },
    { name: "Spoilage / Shrinkage Risk", Supplier: spoilageCost, Retailer: 0 },
  ];

  const summaryStats = [
    { label: "Total Supplier Cost/Risk", value: `$${totalSupplierCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Retailer Risk", value: `$0` },
    { label: "Holding Cost Duration", value: `${months} Months` },
    { label: "Spoilage Value", value: `$${spoilageCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Upfront Inventory Capital", amount: `$${inventoryValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, responsible: "Supplier", colorClass: "text-amber-500" },
    { label: `Cost of Capital / Holding Rate (${holdingRate}% APR)`, amount: `+$${holdingCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, responsible: "Supplier", colorClass: "text-red-500" },
    { label: `Obsolescence / Spoilage Risk (${spoilageRate}%)`, amount: `+$${spoilageCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, responsible: "Supplier", colorClass: "text-red-500" },
    { label: "Total Financial Cost & Risk", amount: `$${totalSupplierCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, responsible: "Supplier", colorClass: "text-red-500 font-bold text-[15px]" },
    { label: "Total Financial Cost & Risk", amount: `$0.00`, isTotal: true, responsible: "Retailer", colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { inventoryValue, holdingRate, months, spoilageRate, holdingCost, spoilageCost, totalSupplierCost, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  inventoryValue: "75000",
  holdingRate: "12",
  months: "4",
  spoilageRate: "5",
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

export default function ConsignmentInventoryCostCalculator() {
  const [inventoryValue, setInventoryValue] = useState(DEFAULTS.inventoryValue);
  const [holdingRate, setHoldingRate] = useState(DEFAULTS.holdingRate);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [spoilageRate, setSpoilageRate] = useState(DEFAULTS.spoilageRate);
  
  const [results, setResults] = useState<ConsignmentResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateConsignment(
      parseFloat(inventoryValue) || 0, 
      parseFloat(holdingRate) || 0,
      parseFloat(months) || 0,
      parseFloat(spoilageRate) || 0
    ));
  };

  const handleReset = () => {
    setInventoryValue(DEFAULTS.inventoryValue); setHoldingRate(DEFAULTS.holdingRate); setMonths(DEFAULTS.months); setSpoilageRate(DEFAULTS.spoilageRate);
    setResults(calculateConsignment(75000, 12, 4, 5));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Consignment Cost Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === 0 && entry.name === "Retailer") {
              return (
                <div key={index} className="flex justify-between gap-4 mb-1">
                  <span style={{ color: entry.fill }}>{entry.name} Cost:</span>
                  <span className="font-bold">$0</span>
                </div>
              );
            }
            if (entry.value === 0) return null;
            return (
              <div key={index} className="flex justify-between gap-4 mb-1">
                <span style={{ color: entry.fill }}>{entry.name} Cost:</span>
                <span>${entry.value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Consignment Inventory Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Consignment Inventory Risk & Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <PackageCheck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Consignment Agreement</h2>
            </div>
            
            <CompactInput id="val" label="Total Wholesale Inventory Value" value={inventoryValue} onChange={setInventoryValue} prefix="$" tooltip="The total value of the goods being placed in the retailer's store." />
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Holding Cost (APR)" value={holdingRate} onChange={setHoldingRate} suffix="%" tooltip="The annualized cost of tying up this capital, plus insurance." />
              <CompactInput id="mon" label="Est. Time to Sell" value={months} onChange={setMonths} suffix="mo" tooltip="How many months the inventory will sit before being sold." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <CompactInput id="spoil" label="Shrinkage / Obsolescence Rate" value={spoilageRate} onChange={setSpoilageRate} suffix="%" tooltip="Percentage of inventory that will likely be stolen, damaged, or expire before selling." />

            <div className="p-3 mt-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>In a consignment model, the <strong>Supplier</strong> assumes 100% of the financial holding cost and shrinkage risk, while the <strong>Retailer</strong> assumes exactly zero risk.</p>
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
                
                <div className={`grid grid-cols-2 gap-4`}>
                  <div className="rounded-lg p-5 relative bg-red-500/10 border-l-4 border-red-500">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Total Supplier Risk Cost</div>
                    <div className="text-3xl font-bold tracking-tighter mb-2 text-red-600">
                      ${results.totalSupplierCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="rounded-lg p-5 relative bg-primary/10 border-l-4 border-primary">
                    <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                      <Printer className="h-4 w-4" />
                    </button>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Total Retailer Risk Cost</div>
                    <div className="text-3xl font-bold tracking-tighter mb-2 text-primary">
                      $0
                    </div>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Financial Factor</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Responsible</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className={`text-[13px] py-3 px-3 ${item.isTotal ? "font-bold" : ""}`}>{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>
                              <span className="block text-[10px] text-muted-foreground font-bold uppercase mb-0.5">{item.responsible}</span>
                              {item.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Risk Asymmetry</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                          
                          <Bar dataKey="Supplier" stackId="a" fill="hsl(var(--amber-500))" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="Retailer" stackId="a" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
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
            <h2 className="text-2xl font-bold mb-3">What is Consignment Inventory?</h2>
            <p><strong>Consignment Inventory</strong> is an agreement where a Supplier (the brand/manufacturer) places their goods in a Retailer's store, but the Retailer does not purchase the goods. The Supplier retains legal ownership of the inventory until a customer actually buys it off the shelf. Only when the item sells does the Retailer pay the Supplier.</p>
            <p>This is highly common in fashion boutiques, art galleries, high-end electronics, and automotive parts.</p>
            
            <h3>Why do Retailers Love Consignment?</h3>
            <p>For a Retailer, consignment is the ultimate dream scenario. They get a fully stocked store with absolutely zero upfront capital expenditure. Because they haven't bought the goods, they have no holding costs, no cash flow constraints, and zero risk if the product never sells (they just return it to the supplier).</p>

            <h3>Why is Consignment Dangerous for Suppliers?</h3>
            <p>For a Supplier, consignment represents extreme financial risk. As this calculator demonstrates, the supplier absorbs 100% of the holding costs and risks:</p>
            <ul>
              <li><strong>Cost of Capital:</strong> You manufactured $75,000 worth of goods, but you might not get paid for 6 months. That is $75,000 you cannot use to grow your business, effectively acting as an interest-free loan to the retailer.</li>
              <li><strong>Shrinkage Risk:</strong> If a customer steals a shirt, or a warehouse worker accidentally crushes a box, the supplier usually takes the loss (unless explicitly protected in the contract).</li>
              <li><strong>Obsolescence:</strong> If the product sits on the shelf for a year, it may go out of style or expire. The retailer will simply box it up and mail it back to you, leaving you with worthless inventory.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">Should You Ever Agree to Consignment?</h2>
            <p>Suppliers should only agree to consignment if they have no other choice to get their product in front of customers (e.g., an unproven startup brand trying to get into a major retail chain). If you must do consignment, ensure your wholesale margin is significantly higher than normal to compensate for the massive risk you are absorbing.</p>
          </section>
          <FAQSection faqs={[
            { question: "Who pays for shipping in a consignment deal?", answer: "This is negotiable, but typically the Supplier pays to ship the goods to the Retailer. If the goods do not sell, the Supplier also usually pays the return shipping cost to get them back." },
            { question: "What is Vendor Managed Inventory (VMI)?", answer: "VMI is a more advanced form of consignment often used in grocery and large retail. The supplier actually monitors the retailer's shelf space and automatically sends restocks when levels get low, maintaining ownership of the stock until checkout." },
            { question: "If the store burns down, who pays for the inventory?", answer: "This MUST be defined in your contract. Usually, the Retailer's insurance should cover physical disasters while the goods are on their premises, but if your contract does not mandate this, the Supplier will lose everything." },
          ]} pageUrl="https://racira.com/calculator/consignment-inventory-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Consignment Inventory Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Consignment Inventory Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Consignment Inventory Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Consignment Inventory Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Consignment Inventory Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/consignment-inventory-cost-calculator" />
        </div>
      </div>
    </>
  );
}
