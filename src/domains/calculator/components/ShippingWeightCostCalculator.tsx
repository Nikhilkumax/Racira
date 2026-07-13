"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, PackageOpen, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend } from "recharts";

interface WeightResults {
  actualWeight: number;
  length: number;
  width: number;
  height: number;
  dimFactor: number;
  ratePerUnit: number;
  baseFee: number;
  isMetric: boolean;
  
  dimWeight: number;
  billableWeight: number;
  weightUsed: "Actual" | "Dimensional";
  
  totalCost: number;
  airCostPenalty: number;
  
  chartData: { name: string; actual: number; dim: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateShippingWeight = (
  actualWeight: number, length: number, width: number, height: number, 
  dimFactor: number, ratePerUnit: number, baseFee: number, isMetric: boolean
): WeightResults => {
  
  const dimWeight = (length * width * height) / dimFactor;
  
  const billableWeight = Math.max(actualWeight, dimWeight);
  const weightUsed = dimWeight > actualWeight ? "Dimensional" : "Actual";
  
  const totalCost = baseFee + (Math.ceil(billableWeight) * ratePerUnit);
  
  // Calculate how much extra they are paying just because the box is too big
  let airCostPenalty = 0;
  if (weightUsed === "Dimensional") {
    airCostPenalty = (Math.ceil(dimWeight) - Math.ceil(actualWeight)) * ratePerUnit;
  }

  const unit = isMetric ? "kg" : "lbs";

  const chartData = [
    { name: "Weight Comparison", actual: actualWeight, dim: dimWeight },
  ];

  const summaryStats = [
    { label: "Billable Weight", value: `${Math.ceil(billableWeight)} ${unit}` },
    { label: "Pricing Method", value: weightUsed },
    { label: "Total Cost", value: `$${totalCost.toFixed(2)}` },
    { label: "Penalty for 'Empty Air'", value: `$${airCostPenalty.toFixed(2)}` },
  ];

  const breakdown = [
    { label: "Base Carrier Fee", amount: `$${baseFee.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Billable Weight (${Math.ceil(billableWeight)} ${unit} × $${ratePerUnit})`, amount: `+$${(Math.ceil(billableWeight) * ratePerUnit).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Shipping Cost", amount: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
  ];

  return { actualWeight, length, width, height, dimFactor, ratePerUnit, baseFee, isMetric, dimWeight, billableWeight, weightUsed, totalCost, airCostPenalty, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  actualWeight: "4.5",
  length: "16",
  width: "12",
  height: "10",
  dimFactor: "139", // Standard domestic UPS/FedEx
  ratePerUnit: "1.25",
  baseFee: "5.50",
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

export default function ShippingWeightCostCalculator() {
  const [actualWeight, setActualWeight] = useState(DEFAULTS.actualWeight);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [dimFactor, setDimFactor] = useState(DEFAULTS.dimFactor);
  const [ratePerUnit, setRatePerUnit] = useState(DEFAULTS.ratePerUnit);
  const [baseFee, setBaseFee] = useState(DEFAULTS.baseFee);
  const [isMetric, setIsMetric] = useState(false);
  
  const [results, setResults] = useState<WeightResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateShippingWeight(
      parseFloat(actualWeight) || 0, parseFloat(length) || 0, parseFloat(width) || 0, parseFloat(height) || 0,
      parseFloat(dimFactor) || 139, parseFloat(ratePerUnit) || 0, parseFloat(baseFee) || 0, isMetric
    ));
  };

  const handleReset = () => {
    setActualWeight(DEFAULTS.actualWeight); setLength(DEFAULTS.length); setWidth(DEFAULTS.width); setHeight(DEFAULTS.height);
    setDimFactor(DEFAULTS.dimFactor); setRatePerUnit(DEFAULTS.ratePerUnit); setBaseFee(DEFAULTS.baseFee);
    setIsMetric(false);
    setResults(calculateShippingWeight(4.5, 16, 12, 10, 139, 1.25, 5.50, false));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, [isMetric]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>DIM Weight Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const unitWeight = isMetric ? "kg" : "lbs";
  const unitLength = isMetric ? "cm" : "in";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "DIM Weight Shipping Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dimensional (DIM) Weight Shipping Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col mb-1">
              <label className="flex items-center text-sm font-semibold text-foreground mb-2">Measurement System</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setIsMetric(false)}
                  className={`h-9 rounded-md font-bold text-[13px] transition-colors border ${!isMetric ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-secondary"}`}
                >Calculate</button>
                <button 
                  onClick={() => setIsMetric(true)}
                  className={`h-9 rounded-md font-bold text-[13px] transition-colors border ${isMetric ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-secondary"}`}
                >Calculate</button>
              </div>
            </div>

            <CompactInput id="act" label="Actual Scale Weight" value={actualWeight} onChange={setActualWeight} suffix={unitWeight} tooltip="What the box actually weighs on a scale." />
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <PackageOpen className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">Box Dimensions</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <CompactInput id="len" label="Length" value={length} onChange={setLength} suffix={unitLength} />
              <CompactInput id="wid" label="Width" value={width} onChange={setWidth} suffix={unitLength} />
              <CompactInput id="hgt" label="Height" value={height} onChange={setHeight} suffix={unitLength} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="dim" label="DIM Factor (Divisor)" value={dimFactor} onChange={setDimFactor} tooltip="Carrier specific divisor. 139 is standard for UPS/FedEx domestic. 166 for older USPS." />
              <CompactInput id="rate" label={`Rate per ${unitWeight}`} value={ratePerUnit} onChange={setRatePerUnit} prefix="$" tooltip="Cost per pound or kg based on the carrier's zone table." />
            </div>

            <CompactInput id="base" label="Base / Flat Fee" value={baseFee} onChange={setBaseFee} prefix="$" tooltip="Any base cost before weight is applied." />

            <div className="p-3 mt-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p>Carriers charge based on the <strong>Billable Weight</strong>, which is whichever is higher: the actual scale weight, or the calculated Dimensional (DIM) weight.</p>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.airCostPenalty > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-primary/10 border-primary/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Shipping Cost
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.airCostPenalty > 0 ? 'text-red-600' : 'text-primary'}`}>
                    ${results.totalCost.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    {results.airCostPenalty > 0 ? (
                      <>You are paying an extra <span className="font-bold text-red-600">${results.airCostPenalty.toFixed(2)}</span> just for the empty air inside the box.</>
                    ) : (
                      <>Box is highly dense. You are paying for Actual Weight.</>
                    )}
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Weight Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        <tr>
                          <td className="text-[13px] py-3 px-3">Actual Scale Weight</td>
                          <td className="text-[13px] py-3 px-3 text-right font-medium">{results.actualWeight.toFixed(1)} {unitWeight}</td>
                        </tr>
                        <tr>
                          <td className="text-[13px] py-3 px-3">Calculated DIM Weight</td>
                          <td className="text-[13px] py-3 px-3 text-right font-medium">{results.dimWeight.toFixed(1)} {unitWeight}</td>
                        </tr>
                        <tr className="bg-secondary/20 border-t-2 border-border font-bold">
                          <td className="text-[13px] py-3 px-3">Billable Weight (Rounded Up)</td>
                          <td className="text-[13px] py-3 px-3 text-right text-primary">{Math.ceil(results.billableWeight)} {unitWeight}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Actual vs Dimensional</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" hide />
                          <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                          
                          <Bar dataKey="actual" name="Actual Weight" fill="hsl(var(--blue-500))" radius={[0, 4, 4, 0]} barSize={30} />
                          <Bar dataKey="dim" name="DIM Weight" fill="hsl(var(--amber-500))" radius={[0, 4, 4, 0]} barSize={30} />
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
            <h2 className="text-2xl font-bold mb-3">What is Dimensional (DIM) Weight?</h2>
            <p><strong>Dimensional Weight</strong> (or Volumetric Weight) is a pricing technique used by commercial freight transport companies, including USPS, FedEx, and UPS. It assumes that the cost of shipping a package should be based on the amount of space it takes up in a delivery truck, rather than strictly how much it weighs.</p>
            
            <h3>Why Do Carriers Use DIM Weight?</h3>
            <p>Imagine a delivery truck filled entirely with pillows. The truck is completely full by volume, but the actual weight is very light. If the carrier only charged by the pound, they would lose massive amounts of money because they could not fit any more packages inside.</p>
            <p>To solve this, carriers calculate a "Dimensional Weight." You are always billed for the <strong>greater</strong> of the two numbers: Actual Scale Weight or Dimensional Weight.</p>

            <h2 className="text-2xl font-bold mb-3">The Cost of Shipping Air</h2>
            <p>If you ship a 2-pound pair of shoes in a massive 20x20x20 inch box, the Dimensional Weight is 57 pounds (based on a 139 divisor). <strong>You will be charged as if the box weighs 57 pounds.</strong> You are quite literally paying an exorbitant penalty for shipping empty air.</p>
            
            <h3>How to Calculate DIM Weight</h3>
            <ul>
              <li><strong>Formula:</strong> <code>(Length × Width × Height) / DIM Divisor</code></li>
              <li>The most common domestic US DIM Divisor for UPS and FedEx is <strong>139</strong>.</li>
              <li>Always round the final billable weight up to the next whole number. A package with a DIM weight of 4.1 lbs will be billed as 5 lbs.</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "Do all shipping carriers use the same DIM factor?", answer: "No. UPS and FedEx standard domestic uses 139. International shipments often use 139 or 166. USPS uses 166 for certain zones. Always check your specific carrier contract, as large e-commerce companies negotiate custom DIM factors (like 199) to lower their costs." },
            { question: "How can I avoid paying DIM weight penalties?", answer: "The only way to avoid DIM penalties is to optimize your packaging. Use the smallest possible box that safely protects your item. Switch from rigid cardboard boxes to flexible polymailers for apparel." },
            { question: "Does DIM weight apply to USPS?", answer: "Yes. USPS applies dimensional weight pricing to Priority Mail, Priority Mail Express, and Parcel Select packages that exceed one cubic foot (1,728 cubic inches)." },
          ]} pageUrl="https://racira.com/calculator/shipping-weight-cost-calculator" />
          <PopularCalculators exclude="/calculator/shipping-weight-cost-calculator" />
        </div>
      </div>
    </>
  );
}
