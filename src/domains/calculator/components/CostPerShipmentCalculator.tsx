"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Box, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CPSResults {
  shipments: number;
  aov: number;
  
  carrierCostUnit: number;
  packagingCostUnit: number;
  laborCostUnit: number;
  
  totalUnitCost: number;
  fulfillmentMarginPct: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateCPS = (
  shipments: number, aov: number, 
  totalCarrier: number, totalPackaging: number, totalLabor: number
): CPSResults => {
  
  const carrierCostUnit = shipments > 0 ? totalCarrier / shipments : 0;
  const packagingCostUnit = shipments > 0 ? totalPackaging / shipments : 0;
  const laborCostUnit = shipments > 0 ? totalLabor / shipments : 0;
  
  const totalUnitCost = carrierCostUnit + packagingCostUnit + laborCostUnit;
  
  const fulfillmentMarginPct = aov > 0 ? (totalUnitCost / aov) * 100 : 0;

  const chartData = [
    { name: "Carrier Postage", value: carrierCostUnit, color: "hsl(var(--primary))" },
    { name: "Fulfillment Labor", value: laborCostUnit, color: "hsl(var(--amber-500))" },
    { name: "Packaging Materials", value: packagingCostUnit, color: "hsl(var(--blue-500))" },
  ];

  const summaryStats = [
    { label: "Total Cost Per Shipment", value: `$${totalUnitCost.toFixed(2)}` },
    { label: "Fulfillment % of AOV", value: `${fulfillmentMarginPct.toFixed(1)}%` },
    { label: "Carrier Cost/Order", value: `$${carrierCostUnit.toFixed(2)}` },
    { label: "Labor/Pack Cost", value: `$${(laborCostUnit + packagingCostUnit).toFixed(2)}` },
  ];

  const breakdown = [
    { label: "Average Carrier Postage per Order", amount: `$${carrierCostUnit.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Average Pick/Pack Labor per Order", amount: `$${laborCostUnit.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Average Packaging Material per Order", amount: `$${packagingCostUnit.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-600" },
    { label: "Fully Burdened Cost per Shipment", amount: `$${totalUnitCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
    { label: `Fulfillment as % of Revenue ($${aov.toFixed(2)} AOV)`, amount: `${fulfillmentMarginPct.toFixed(1)}%`, isTotal: true, colorClass: fulfillmentMarginPct > 20 ? "text-red-500 font-bold" : "text-emerald-500 font-bold" },
  ];

  return { shipments, aov, carrierCostUnit, packagingCostUnit, laborCostUnit, totalUnitCost, fulfillmentMarginPct, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  shipments: "8500",
  aov: "75",
  totalCarrier: "68000",
  totalPackaging: "6500",
  totalLabor: "18500",
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

export default function CostPerShipmentCalculator() {
  const [shipments, setShipments] = useState(DEFAULTS.shipments);
  const [aov, setAov] = useState(DEFAULTS.aov);
  const [totalCarrier, setTotalCarrier] = useState(DEFAULTS.totalCarrier);
  const [totalPackaging, setTotalPackaging] = useState(DEFAULTS.totalPackaging);
  const [totalLabor, setTotalLabor] = useState(DEFAULTS.totalLabor);
  
  const [results, setResults] = useState<CPSResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateCPS(
      parseFloat(shipments) || 0, 
      parseFloat(aov) || 0,
      parseFloat(totalCarrier) || 0,
      parseFloat(totalPackaging) || 0,
      parseFloat(totalLabor) || 0
    ));
  };

  const handleReset = () => {
    setShipments(DEFAULTS.shipments); setAov(DEFAULTS.aov); setTotalCarrier(DEFAULTS.totalCarrier); setTotalPackaging(DEFAULTS.totalPackaging); setTotalLabor(DEFAULTS.totalLabor);
    setResults(calculateCPS(8500, 75, 68000, 6500, 18500));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Cost Per Shipment</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cost Per Shipment" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fully Burdened Cost Per Shipment Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="shp" label="Total Monthly Shipments" value={shipments} onChange={setShipments} tooltip="Total number of individual orders shipped out this month." />
              <CompactInput id="aov" label="Average Order Value" value={aov} onChange={setAov} prefix="$" tooltip="The average amount a customer spends per order." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Box className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Monthly Expense Totals</h2>
            </div>

            <CompactInput id="car" label="Total Carrier Expenses" value={totalCarrier} onChange={setTotalCarrier} prefix="$" tooltip="Total monthly bill from FedEx, UPS, USPS, DHL, etc." />
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="lab" label="Total Fulfillment Labor" value={totalLabor} onChange={setTotalLabor} prefix="$" tooltip="Total wages paid to warehouse staff for picking and packing orders." />
              <CompactInput id="pkg" label="Total Packaging Cost" value={totalPackaging} onChange={setTotalPackaging} prefix="$" tooltip="Total spent on boxes, tape, labels, and void-fill." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>Breaks down macro monthly expenses into a micro per-unit level, revealing the true hidden cost of fulfilling a single e-commerce order.</p>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.fulfillmentMarginPct > 20 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Fully Burdened Cost Per Shipment
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.fulfillmentMarginPct > 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${results.totalUnitCost.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Fulfillment consumes <span className={`font-bold ${results.fulfillmentMarginPct > 20 ? 'text-red-600' : 'text-foreground'}`}>{results.fulfillmentMarginPct.toFixed(1)}% of Revenue</span>.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Per-Order Breakdown</th>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Fulfillment Cost Distribution</h3>
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is the Fully Burdened Cost per Shipment?</h2>
            <p>A massive mistake made by direct-to-consumer (DTC) and e-commerce companies is assuming their "Cost Per Shipment" is simply the $7.50 they pay to UPS for a shipping label. In reality, that box did not magically pack itself.</p>
            <p>The <strong>Fully Burdened Cost per Shipment</strong> measures the true logistical cost of getting a product out the door. It aggregates the carrier postage, the cost of the cardboard box, the cost of the thermal label, and the hourly wage of the warehouse worker who picked and packed the order.</p>
            
            <h3>Why Fulfillment Labor Matters</h3>
            <p>If you pay a warehouse worker $20/hour, and they can pick and pack 40 boxes an hour, your labor cost per shipment is $0.50. However, if your warehouse is disorganized, and they spend 15 minutes searching for a single item, they can only pack 4 boxes an hour. Your labor cost per shipment just skyrocketed to $5.00 per order.</p>

            <h2 className="text-2xl font-bold mb-3">Fulfillment Cost as a Percentage of AOV</h2>
            <p>Your <strong>Average Order Value (AOV)</strong> dictates whether or not your business model is sustainable. If your fully burdened cost per shipment is $10.00, and your AOV is $150, fulfillment is eating a very healthy 6.6% of your revenue. But if your AOV is only $25, that exact same $10 box is consuming a catastrophic 40% of your revenue.</p>
            
            <h3>How to Improve This Metric</h3>
            <ul>
              <li><strong>Increase AOV:</strong> Force customers to buy more by increasing your "Free Shipping" minimum threshold from $50 to $75. This allows you to spread the high fixed cost of a shipment across a larger revenue base.</li>
              <li><strong>Optimize Warehouse Layout:</strong> Implement an efficient pick-path and barcode scanning system to increase the number of orders a worker can pack per hour, driving down the unit labor cost.</li>
              <li><strong>Right-Size Packaging:</strong> Don't ship a tiny item in a huge box filled with expensive bubble wrap. It costs more in materials, and triggers higher volumetric carrier fees.</li>
            </ul>
          </article>
          <FAQSection faqs={[
            { question: "Should I include warehouse rent in this calculation?", answer: "Usually, no. Warehouse rent, electricity, and management salaries are typically tracked separately as 'Fixed Fulfillment Overheads'. This calculator focuses on the 'Variable Costs' that directly scale with every new order." },
            { question: "What is a good benchmark for Fulfillment % of AOV?", answer: "It varies heavily by industry. High-end fashion might see 5-8%. Standard e-commerce generally aims for 10-15%. Anything above 20% usually indicates a broken business model, as it leaves no room for product COGS, marketing, and profit." },
            { question: "How does this compare to a 3PL quote?", answer: "If you outsource to a Third-Party Logistics (3PL) provider, they will charge you exactly like this calculator: a fee for the carrier, a fee for the box, and a 'Pick/Pack' fee for the labor. Comparing your internal Cost Per Shipment to a 3PL quote is the only way to know if outsourcing will save you money." },
          ]} pageUrl="https://racira.com/calculator/cost-per-shipment-calculator" />
          <PopularCalculators exclude="/calculator/cost-per-shipment-calculator" />
        </div>
      </div>
    </>
  );
}
