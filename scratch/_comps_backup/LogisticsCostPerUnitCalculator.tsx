"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, PackageSearch, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface UnitCostResults {
  freightCost: number;
  units: number;
  goodsValue: number;
  
  cogsPerUnit: number;
  logisticsPerUnit: number;
  landedCostPerUnit: number;
  
  logisticsPctOfCogs: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateUnitCost = (
  freightCost: number, units: number, goodsValue: number
): UnitCostResults => {
  
  const cogsPerUnit = units > 0 ? goodsValue / units : 0;
  const logisticsPerUnit = units > 0 ? freightCost / units : 0;
  
  const landedCostPerUnit = cogsPerUnit + logisticsPerUnit;
  
  const logisticsPctOfCogs = cogsPerUnit > 0 ? (logisticsPerUnit / cogsPerUnit) * 100 : 0;

  const chartData = [
    { name: "Manufacturing (COGS)", value: cogsPerUnit, color: "hsl(var(--muted-foreground))" },
    { name: "Logistics Burden", value: logisticsPerUnit, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Logistics per Unit", value: `$${logisticsPerUnit.toFixed(2)}` },
    { label: "COGS per Unit", value: `$${cogsPerUnit.toFixed(2)}` },
    { label: "Logistics % Markup", value: `${logisticsPctOfCogs.toFixed(1)}%` },
    { label: "Total Units", value: units.toLocaleString() },
  ];

  const breakdown = [
    { label: `Base Manufacturing Cost (COGS)`, amount: `$${cogsPerUnit.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Inbound Logistics Burden`, amount: `+$${logisticsPerUnit.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Fully Landed Unit Cost", amount: `$${landedCostPerUnit.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
    { label: `Logistics Markup on COGS`, amount: `${logisticsPctOfCogs.toFixed(1)}%`, isTotal: true, colorClass: logisticsPctOfCogs > 30 ? "text-red-500 font-bold" : "text-emerald-600 font-bold" },
  ];

  return { freightCost, units, goodsValue, cogsPerUnit, logisticsPerUnit, landedCostPerUnit, logisticsPctOfCogs, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  freightCost: "6500",
  units: "4500",
  goodsValue: "35000",
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

export default function LogisticsCostPerUnitCalculator() {
  const [freightCost, setFreightCost] = useState(DEFAULTS.freightCost);
  const [units, setUnits] = useState(DEFAULTS.units);
  const [goodsValue, setGoodsValue] = useState(DEFAULTS.goodsValue);
  
  const [results, setResults] = useState<UnitCostResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateUnitCost(
      parseFloat(freightCost) || 0, parseFloat(units) || 0, parseFloat(goodsValue) || 0
    ));
  };

  const handleReset = () => {
    setFreightCost(DEFAULTS.freightCost); setUnits(DEFAULTS.units); setGoodsValue(DEFAULTS.goodsValue);
    setResults(calculateUnitCost(6500, 4500, 35000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Unit Logistics Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Logistics Unit Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Logistics Cost Per Unit Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <PackageSearch className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Shipment Details</h2>
            </div>
            
            <CompactInput id="qty" label="Total Units in Shipment" value={units} onChange={setUnits} tooltip="The total number of individual items you are importing or shipping." />
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="val" label="Total Goods Value" value={goodsValue} onChange={setGoodsValue} prefix="$" tooltip="The amount paid to the factory for manufacturing these units." />
              <CompactInput id="frt" label="Total Freight Cost" value={freightCost} onChange={setFreightCost} prefix="$" tooltip="The total cost of the container, trucking, and customs." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>Translates macro freight bills (e.g., $6,500 for a container) into micro unit economics, showing exactly how much shipping adds to the cost of a single item.</p>
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
                    Landed Cost Per Unit
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.logisticsPctOfCogs > 30 ? 'text-red-600' : 'text-primary'}`}>
                    ${results.landedCostPerUnit.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Logistics added a <span className={`font-bold ${results.logisticsPctOfCogs > 30 ? 'text-red-600' : 'text-foreground'}`}>{results.logisticsPctOfCogs.toFixed(1)}% markup</span> to the factory price.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Unit Cost Stack</th>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Unit Margin Eaters</h3>
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
            <h2 className="text-2xl font-bold mb-3">What is Logistics Cost Per Unit?</h2>
            <p><strong>Logistics Cost per Unit</strong> is a critical supply chain metric that translates large macro freight bills into micro product economics. It answers the question: <em>"How much did it cost to physically move this one specific item from the factory to my warehouse?"</em></p>
            
            <h3>Why the Factory Price is a Lie</h3>
            <p>If you find a supplier on Alibaba selling a t-shirt for $4.00, it is extremely dangerous to price your retail sales based on that $4.00 number. That is just the <strong>Cost of Goods Sold (COGS)</strong> at the factory door.</p>
            <p>If it costs $4,000 to ship a container of 1,000 t-shirts, you are paying $4.00 per unit in freight. Your true <strong>Landed Cost</strong> is $8.00. Logistics just added a 100% markup to your product before you even started selling it.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of Low-Value, High-Volume Goods</h2>
            <p>The "Logistics Markup" metric in this calculator is vital for product selection. Shipping costs are based on volume (cubic meters) and weight, not value.</p>
            <ul>
              <li><strong>High-Value Density (e.g., iPhones):</strong> You can fit $1,000,000 worth of iPhones in a small pallet. If freight costs $2,000, the logistics markup is 0.2%. Freight is almost irrelevant.</li>
              <li><strong>Low-Value Density (e.g., Plastic Trash Cans):</strong> A container full of plastic trash cans is mostly empty air. The goods might only be worth $10,000, but the container still costs $8,000 to ship. Logistics just added an 80% markup to the product, making it almost impossible to sell profitably.</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "Should I include customs duties in this calculation?", answer: "Yes! A true 'Landed Cost' must include the factory price, the freight, the insurance, and the import duties. All of those should be bundled into your Total Freight Cost input." },
            { question: "How can I lower my logistics cost per unit?", answer: "The fastest way is packaging optimization. If you redesign your retail box to be 1 inch thinner, you might fit 20% more units into the exact same shipping container, instantly lowering the freight cost per unit." },
            { question: "How does air freight compare to ocean freight on a per-unit basis?", answer: "Air freight is typically 5x to 10x more expensive than ocean freight per unit. It should only be used for high-margin goods (electronics, fashion) or emergency stockouts." },
          ]} pageUrl="https://racira.com/calculator/logistics-cost-per-unit-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Logistics Cost Per Unit Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Logistics Cost Per Unit Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Logistics Cost Per Unit Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Logistics Cost Per Unit Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Logistics Cost Per Unit Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/logistics-cost-per-unit-calculator" />
        </div>
      </div>
    </>
  );
}
