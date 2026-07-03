"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Ship, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CargoResults {
  weight: number;
  volume: number;
  revenueTons: number;
  billingBasis: string;
  freightCost: number;
  portFees: number;
  totalCost: number;
  chartData: { metric: string; value: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateCargoCost = (weight: number, volume: number, freightRate: number, portFeeRate: number): CargoResults => {
  // W/M Rule: 1 Metric Ton (MT) = 1 Cubic Meter (CBM)
  // The carrier charges based on whichever is strictly greater.
  
  let billingBasis = "";
  let revenueTons = 0;
  
  if (volume > weight) {
    billingBasis = "Measure (Volume)";
    revenueTons = volume;
  } else if (weight > volume) {
    billingBasis = "Weight";
    revenueTons = weight;
  } else {
    billingBasis = "Weight/Measure (Equal)";
    revenueTons = weight;
  }

  const freightCost = revenueTons * freightRate;
  const portFees = revenueTons * portFeeRate;
  const totalCost = freightCost + portFees;

  const chartData = [
    { metric: "Weight (MT)", value: weight },
    { metric: "Volume (CBM)", value: volume },
  ];

  const summaryStats = [
    { label: "Revenue Tons (W/M)", value: `${revenueTons.toFixed(2)} RT` },
    { label: "Billing Basis", value: billingBasis },
    { label: "Ocean Freight", value: `$${freightCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Logistics Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Cargo Weight", amount: `${weight.toFixed(2)} MT` },
    { label: "Cargo Volume", amount: `${volume.toFixed(2)} CBM` },
    { label: `Chargeable Revenue Tons (${billingBasis})`, amount: `${revenueTons.toFixed(2)} RT`, colorClass: "text-blue-500 font-bold" },
    { label: `Base Freight Rate`, amount: `$${freightRate.toFixed(2)} / RT` },
    { label: "Ocean Freight Subtotal", amount: `$${freightCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true },
    { label: `Port/Stevedoring Fees ($${portFeeRate}/RT)`, amount: `$${portFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Total Estimated Cost", amount: `$${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500" },
  ];

  return { weight, volume, revenueTons, billingBasis, freightCost, portFees, totalCost, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  weight: "45",
  volume: "62",
  freightRate: "120",
  portFeeRate: "25",
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

export default function BreakBulkCargoCostCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [freightRate, setFreightRate] = useState(DEFAULTS.freightRate);
  const [portFeeRate, setPortFeeRate] = useState(DEFAULTS.portFeeRate);
  
  const [results, setResults] = useState<CargoResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateCargoCost(
      parseFloat(weight) || 0, 
      parseFloat(volume) || 0, 
      parseFloat(freightRate) || 0, 
      parseFloat(portFeeRate) || 0
    ));
  };

  const handleReset = () => {
    setWeight(DEFAULTS.weight); setVolume(DEFAULTS.volume); setFreightRate(DEFAULTS.freightRate); setPortFeeRate(DEFAULTS.portFeeRate);
    setResults(calculateCargoCost(45, 62, 120, 25));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Break-Bulk Cost Est</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.metric}:</span>
          <span className="text-foreground">{payload[0].value.toFixed(2)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Break-Bulk Cargo Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Break-Bulk Cargo Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Ship className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Cargo Specifications</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="wt" label="Total Weight" value={weight} onChange={setWeight} suffix="MT" tooltip="Total gross weight in Metric Tons (1,000 kg)." />
              <CompactInput id="vol" label="Total Volume" value={volume} onChange={setVolume} suffix="CBM" tooltip="Total gross volume in Cubic Meters." />
            </div>
            
            <hr className="border-border my-2" />
            
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Rates (Per W/M)</h2>
            </div>
            
            <CompactInput id="frate" label="Ocean Freight Rate" value={freightRate} onChange={setFreightRate} prefix="$" suffix="/ RT" tooltip="Base ocean freight rate per Revenue Ton." />
            <CompactInput id="prate" label="Port/Handling Fees" value={portFeeRate} onChange={setPortFeeRate} prefix="$" suffix="/ RT" tooltip="Stevedoring, wharfage, or handling fees per Revenue Ton." />

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
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-blue-500/10 border-blue-500/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Estimated Cost
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-blue-600`}>
                    ${results.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Chargeable Revenue Tons: <span className="font-bold text-foreground">{results.revenueTons.toFixed(2)} RT</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Cost Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[14px] py-3 px-3">{item.label}</td>
                            <td className={`text-[14px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">W/M Revenue Ton Comparison</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="metric" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.value === results.revenueTons ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      * Billed on the highest bar (Revenue Tons)
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is Break-Bulk Cargo?</h2>
            <p><strong>Break-bulk</strong> cargo refers to goods that must be loaded individually onto a ship, rather than being placed in intermodal containers (like standard 20ft or 40ft shipping containers) or transported in bulk (like oil or grain). Common examples of break-bulk include large machinery, construction equipment, steel beams, structural timber, and oversized vehicles (RO-RO).</p>
            
            <h3>Understanding the W/M (Weight or Measure) Rule</h3>
            <p>Because ocean carriers have limited space (volume) and limited buoyancy (weight capacity), they charge based on whichever factor takes up more of the ship's total capacity. This is known as the <strong>W/M (Weight or Measure) Rule</strong>.</p>
            <ul>
              <li><strong>Weight:</strong> Measured in Metric Tons (MT), where 1 MT = 1,000 kg.</li>
              <li><strong>Measure (Volume):</strong> Measured in Cubic Meters (CBM).</li>
            </ul>
            <p>For standard ocean freight, the ratio is <strong>1 MT = 1 CBM</strong>. A Revenue Ton (RT) is strictly the greater of the two numbers.</p>
            
            <h2 className="text-2xl font-bold mb-3">Example Calculation</h2>
            <p>Imagine you are shipping a large, lightweight turbine. It weighs 25 Metric Tons (MT), but it is very bulky and takes up 60 Cubic Meters (CBM) of space.</p>
            <p>If the freight rate is $120 per W/M, the carrier will look at both numbers:</p>
            <ul>
              <li>Cost based on Weight: 25 MT × $120 = $3,000</li>
              <li>Cost based on Volume: 60 CBM × $120 = $7,200</li>
            </ul>
            <p>The carrier will charge based on Volume (the larger number). The chargeable "Revenue Tons" is 60 RT, and the total freight cost is $7,200.</p>
            
            <h2 className="text-2xl font-bold mb-3">Why Are Port and Stevedoring Fees Billed by W/M?</h2>
            <p>Unlike container shipping where ports charge a flat fee per box (THC - Terminal Handling Charge), break-bulk cargo requires specialized labor and equipment to load and secure. Cranes (stevedoring) and port storage are constrained by both weight and physical dimensions, so these secondary logistics fees almost universally apply the same W/M rule to calculate your final port bill.</p>
          </article>
          <FAQSection faqs={[
            { question: "What is the difference between Break-Bulk and Bulk?", answer: "Bulk cargo is unpackaged and poured directly into the ship's hold (e.g., coal, crude oil, grain). Break-bulk is packaged, strapped, or assembled as individual pieces (e.g., pallets, drums, large generators) but not put inside standard shipping containers." },
            { question: "What is a Revenue Ton (RT)?", answer: "A Revenue Ton is the billing unit used by ocean and air carriers. In ocean freight, 1 RT is equal to either 1 Metric Ton or 1 Cubic Meter, whichever yields the higher revenue for the carrier." },
            { question: "Does air freight use the same W/M rule?", answer: "Yes, but the ratio is different. Because airplanes are much more weight-sensitive than ships, air freight typically uses a ratio where 1 CBM = 167 kg (or 1 Metric Ton = 6 CBM). Air freight is overwhelmingly billed by weight rather than volume unless the cargo is extremely light and fluffy." },
            { question: "How can I reduce break-bulk costs?", answer: "The most effective way is to reduce volume. By dismantling large machinery for shipment and packing it more densely (or even fitting it into standard open-top containers), you can significantly reduce the CBM, lowering your total Revenue Tons." },
          ]} pageUrl="https://racira.com/calculator/break-bulk-cargo-cost-calculator" />
          <PopularCalculators exclude="/calculator/break-bulk-cargo-cost-calculator" />
        </div>
      </div>
    </>
  );
}
