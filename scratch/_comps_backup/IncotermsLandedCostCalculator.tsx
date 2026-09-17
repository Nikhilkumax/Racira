"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, PackageSearch, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface LandedResults {
  unitPrice: number;
  quantity: number;
  freight: number;
  insurance: number;
  duty: number;
  otherFees: number;
  totalProductCost: number;
  totalLandedCost: number;
  landedUnitCost: number;
  costMultiplier: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateLandedCost = (
  unitPrice: number, quantity: number, freight: number, 
  insurance: number, duty: number, otherFees: number
): LandedResults => {
  
  const totalProductCost = unitPrice * quantity;
  const totalLogistics = freight + insurance + duty + otherFees;
  const totalLandedCost = totalProductCost + totalLogistics;
  
  const landedUnitCost = quantity > 0 ? totalLandedCost / quantity : 0;
  const costMultiplier = unitPrice > 0 ? landedUnitCost / unitPrice : 0;

  const chartData = [
    { name: "Factory Product Cost", value: totalProductCost, color: "hsl(var(--primary))" },
    { name: "Freight & Shipping", value: freight, color: "hsl(var(--blue-500))" },
    { name: "Import Duties & Taxes", value: duty, color: "hsl(var(--destructive))" },
    { name: "Insurance & Other Fees", value: insurance + otherFees, color: "hsl(var(--amber-500))" },
  ];

  const summaryStats = [
    { label: "Landed Cost per Unit", value: `$${landedUnitCost.toFixed(2)}` },
    { label: "Factory Price per Unit", value: `$${unitPrice.toFixed(2)}` },
    { label: "Total Supply Chain Cost", value: `$${totalLandedCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Cost Multiplier", value: `${costMultiplier.toFixed(2)}x` },
  ];

  const breakdown = [
    { label: "Total Factory Product Cost", amount: `$${totalProductCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Freight & Logistics", amount: `+$${freight.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Total Import Duties & Taxes", amount: `+$${duty.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Insurance Premium", amount: `+$${insurance.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Customs Broker & Port Fees", amount: `+$${otherFees.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Total Landed Cost", amount: `$${totalLandedCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { unitPrice, quantity, freight, insurance, duty, otherFees, totalProductCost, totalLandedCost, landedUnitCost, costMultiplier, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  unitPrice: "12.50",
  quantity: "5000",
  freight: "4500",
  insurance: "250",
  duty: "6500",
  otherFees: "450"
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

export default function IncotermsLandedCostCalculator() {
  const [unitPrice, setUnitPrice] = useState(DEFAULTS.unitPrice);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [freight, setFreight] = useState(DEFAULTS.freight);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [duty, setDuty] = useState(DEFAULTS.duty);
  const [otherFees, setOtherFees] = useState(DEFAULTS.otherFees);
  
  const [results, setResults] = useState<LandedResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateLandedCost(
      parseFloat(unitPrice) || 0, 
      parseFloat(quantity) || 0,
      parseFloat(freight) || 0,
      parseFloat(insurance) || 0,
      parseFloat(duty) || 0,
      parseFloat(otherFees) || 0
    ));
  };

  const handleReset = () => {
    setUnitPrice(DEFAULTS.unitPrice); setQuantity(DEFAULTS.quantity); setFreight(DEFAULTS.freight); setInsurance(DEFAULTS.insurance); setDuty(DEFAULTS.duty); setOtherFees(DEFAULTS.otherFees);
    setResults(calculateLandedCost(12.50, 5000, 4500, 250, 6500, 450));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Total Landed Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Total Landed Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Total Landed Cost & Unit Margin Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <PackageSearch className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Purchase Order Details</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Factory Price per Unit" value={unitPrice} onChange={setUnitPrice} prefix="$" tooltip="The FOB/EXW price from your supplier." />
              <CompactInput id="qty" label="Order Quantity" value={quantity} onChange={setQuantity} suffix="units" tooltip="Total number of units in the shipment." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="fr" label="Total Freight Cost" value={freight} onChange={setFreight} prefix="$" tooltip="Total cost of ocean/air freight and inland delivery." />
              <CompactInput id="ins" label="Cargo Insurance" value={insurance} onChange={setInsurance} prefix="$" tooltip="Cost to insure the shipment." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="duty" label="Import Duties" value={duty} onChange={setDuty} prefix="$" tooltip="Total tariffs paid to customs." />
              <CompactInput id="fees" label="Other Fees (Broker/Port)" value={otherFees} onChange={setOtherFees} prefix="$" tooltip="Customs broker fees, port handling, MPF/HMF." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Calculates the true, fully-burdened cost of your inventory by spreading all supply chain expenses across every unit in the container.
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
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    True Landed Cost Per Unit
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    ${results.landedUnitCost.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    A <span className="font-bold text-foreground">{results.costMultiplier.toFixed(2)}x increase</span> over the ${results.unitPrice.toFixed(2)} factory price.
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Unit Cost Absorption</h3>
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
            <h2 className="text-2xl font-bold mb-3">What is Total Landed Cost?</h2>
            <p><strong>Total Landed Cost</strong> is the true, fully-burdened financial cost of a product once it has arrived at your warehouse door, ready to be sold to a customer. It includes the price of the goods, plus every single logistical and tax expense incurred to get it there.</p>
            
            <h3>Why Factory Price is a Dangerous Metric</h3>
            <p>A common mistake made by new e-commerce sellers or importers is pricing their products based on the factory invoice. If you buy a widget in China for $12.50, and you want a 50% margin, you might price it at $25.00.</p>
            <p>However, once you pay ocean freight, marine insurance, 25% import tariffs, customs broker fees, and local trucking, that $12.50 widget might actually cost you $21.00 to land in your warehouse. If you sell it for $25.00, your actual gross margin is catastrophically low, and you will likely lose money after marketing expenses.</p>

            <h2 className="text-2xl font-bold mb-3">The Components of Landed Cost</h2>
            <p>To accurately calculate Landed Cost, you must aggregate:</p>
            <ul>
              <li><strong>COGS (Cost of Goods Sold):</strong> The EXW or FOB price paid to the manufacturer.</li>
              <li><strong>Freight:</strong> Ocean, air, rail, or trucking costs.</li>
              <li><strong>Customs & Duties:</strong> Import tariffs, HMF, and MPF.</li>
              <li><strong>Insurance & Fees:</strong> Cargo insurance premiums, customs broker filing fees, port demurrage, and terminal handling charges.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">How to Use Landed Cost for Pricing</h2>
            <p>You should never determine your final retail price (MSRP) until you know your exact Landed Cost Per Unit. Your gross margin must be calculated against the Landed Cost, not the Factory Cost. Additionally, if you see your Landed Cost Multiplier creeping above 1.5x, you need to investigate your supply chain to see if you can optimize freight density or renegotiate tariffs.</p>
          </section>
          <FAQSection faqs={[
            { question: "Should I include domestic shipping to the customer in Landed Cost?", answer: "No. Landed Cost only covers the expenses to get the product to YOUR warehouse (Inbound Logistics). Shipping the product to the final customer is considered an Outbound Fulfillment or Shipping Expense." },
            { question: "Does Landed Cost change based on the Incoterm?", answer: "The components you pay directly will change. Under EXW, you pay the freight forwarder directly. Under CIF, the supplier pays the main freight, but they increase the unit price to compensate. Ultimately, the total Landed Cost is usually similar, but the breakdown looks different." },
            { question: "How do I calculate Landed Cost if my container has multiple different products?", answer: "This requires 'Cost Allocation'. You must take the total container freight and duty bill and divide it among the SKUs. You can allocate by Volume (CBM), by Weight (kg), or by Value ($). The most accurate method depends on whether your freight was billed by weight or volume." },
          ]} pageUrl="https://racira.com/calculator/incoterms-landed-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Incoterms Landed Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Incoterms Landed Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Incoterms Landed Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Incoterms Landed Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Incoterms Landed Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/incoterms-landed-cost-calculator" />
        </div>
      </div>
    </>
  );
}
