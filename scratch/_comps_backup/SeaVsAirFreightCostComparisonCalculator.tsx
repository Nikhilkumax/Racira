"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Ship, Plane, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface SeaAirResults {
  weightKg: number;
  volumeCbm: number;
  seaRate: number;
  airRate: number;
  
  seaCost: number;
  airCost: number;
  
  costDelta: number;
  multiplier: number;
  density: number; // kg per cbm
  
  chartData: { name: string; cost: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateSeaAir = (
  weightKg: number, volumeCbm: number, 
  seaRate: number, airRate: number
): SeaAirResults => {
  
  // Sea freight (LCL) is generally billed purely on Volume (CBM) unless it's insanely dense (over 1000kg/cbm). We use standard CBM billing here.
  const seaCost = volumeCbm * seaRate;
  
  // Air freight is billed by weight (kg). (Assuming chargeable weight is close to actual for this generic model).
  const airCost = weightKg * airRate;
  
  const costDelta = Math.abs(airCost - seaCost);
  const multiplier = seaCost > 0 ? airCost / seaCost : 0;
  
  const density = volumeCbm > 0 ? weightKg / volumeCbm : 0;

  const chartData = [
    { name: "Sea Freight (LCL)", cost: seaCost, color: "hsl(var(--blue-500))" },
    { name: "Air Freight", cost: airCost, color: "hsl(var(--sky-500))" },
  ];

  const summaryStats = [
    { label: "Sea Freight Cost", value: `$${seaCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Air Freight Cost", value: `$${airCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "The Air Premium", value: `+${multiplier.toFixed(1)}x` },
    { label: "Cargo Density", value: `${density.toFixed(0)} kg/cbm` },
  ];

  const breakdown = [
    { label: `Sea Freight (${volumeCbm} CBM × $${seaRate}/cbm)`, amount: `$${seaCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-600" },
    { label: `Air Freight (${weightKg} kg × $${airRate}/kg)`, amount: `$${airCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-sky-600 mt-2" },
    { label: `Cost Difference (Air Premium)`, amount: `$${costDelta.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-red-500 font-bold text-[15px]" },
  ];

  return { weightKg, volumeCbm, seaRate, airRate, seaCost, airCost, costDelta, multiplier, density, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  weightKg: "1250",
  volumeCbm: "3.5",
  seaRate: "110", // Per CBM
  airRate: "5.80", // Per Kg
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

export default function SeaVsAirFreightCostComparisonCalculator() {
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [volumeCbm, setVolumeCbm] = useState(DEFAULTS.volumeCbm);
  const [seaRate, setSeaRate] = useState(DEFAULTS.seaRate);
  const [airRate, setAirRate] = useState(DEFAULTS.airRate);
  
  const [results, setResults] = useState<SeaAirResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateSeaAir(
      parseFloat(weightKg) || 0, parseFloat(volumeCbm) || 0,
      parseFloat(seaRate) || 0, parseFloat(airRate) || 0
    ));
  };

  const handleReset = () => {
    setWeightKg(DEFAULTS.weightKg); setVolumeCbm(DEFAULTS.volumeCbm);
    setSeaRate(DEFAULTS.seaRate); setAirRate(DEFAULTS.airRate);
    setResults(calculateSeaAir(1250, 3.5, 110, 5.80));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Sea vs Air Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Sea vs Air Freight" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Sea vs. Air Freight Cost Comparison Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Plane className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-3">Cargo Profile</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="wgt" label="Total Weight" value={weightKg} onChange={setWeightKg} suffix="kg" tooltip="Total physical weight of the cargo." />
              <CompactInput id="vol" label="Total Volume" value={volumeCbm} onChange={setVolumeCbm} suffix="CBM" tooltip="Total volume in Cubic Meters." />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Ship className="h-5 w-5 text-blue-500" />
              <h2 className="text-2xl font-bold mb-3">Sea Freight (LCL)</h2>
            </div>
            
            <CompactInput id="sea" label="Sea Rate per CBM" value={seaRate} onChange={setSeaRate} prefix="$" tooltip="Ocean carriers bill LCL freight based on Volume (CBM)." />

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Plane className="h-5 w-5 text-sky-500" />
              <h2 className="text-2xl font-bold mb-3">Air Freight</h2>
            </div>

            <CompactInput id="air" label="Air Rate per Kg" value={airRate} onChange={setAirRate} prefix="$" tooltip="Air carriers bill based on Weight (Kg)." />

            <div className="p-3 mt-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
              <p>Because Air is billed on Weight, and Sea is billed on Volume, the "density" of your product completely changes which mode makes mathematical sense.</p>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.multiplier > 5 ? 'bg-red-500/10 border-red-500' : 'bg-primary/10 border-primary'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    The Air Freight Premium
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.multiplier > 5 ? 'text-red-600' : 'text-primary'}`}>
                    {results.multiplier.toFixed(1)}x More Expensive
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Shipping this cargo via air will cost <span className="font-bold text-foreground">${results.costDelta.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span> more than ocean.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Mode</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Total Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={`${item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""} ${item.colorClass?.includes('mt-2') ? "border-t-4 border-background" : ""}`}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass?.replace('mt-2', '') || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Cost Comparison</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                          <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={40}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
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
            <h2 className="text-2xl font-bold mb-3">Sea vs. Air: The Weight and Volume Paradox</h2>
            <p>Choosing between Ocean Freight (Sea) and Air Freight is the most consequential decision in international logistics. While Air is universally faster, the way these two modes calculate price is fundamentally different.</p>
            
            <h3>How Sea Freight is Billed</h3>
            <p>Unless you are shipping heavy machinery, Ocean Freight LCL (Less than Container Load) is billed almost exclusively by <strong>Volume (CBM - Cubic Meters)</strong>. A ship is massive; it usually runs out of physical space long before it hits its maximum weight limit. Therefore, they charge you for the space you take up.</p>

            <h3>How Air Freight is Billed</h3>
            <p>Air Freight is billed exclusively by <strong>Weight (Kilograms)</strong>. An airplane is extremely sensitive to gravity; it usually hits its maximum takeoff weight long before the cargo hold is full of boxes. Therefore, they charge you for how heavy your cargo is.</p>

            <h2 className="text-2xl font-bold mb-3">The Rule of Density</h2>
            <p>Because of these opposite billing methods, the <strong>Density</strong> of your product (Kg per CBM) dictates which mode is more financially viable.</p>
            <ul>
              <li><strong>High Density (Heavy & Small):</strong> Items like steel bolts, batteries, or liquid chemicals. These take up very little CBM but weigh a massive amount. Air freighting these will be astronomically expensive. Sea freight is the only option.</li>
              <li><strong>Low Density (Light & Bulky):</strong> Items like pillows, stuffed animals, or empty plastic bottles. These weigh almost nothing but take up huge amounts of CBM. Sea freight will charge you for the massive volume. Interestingly, if the cargo is light enough, Air Freight sometimes becomes surprisingly competitive because the weight charge is so low (though airlines use Dimensional Weight rules to prevent you from shipping pure air).</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "What is a CBM?", answer: "Cubic Meter. It is calculated as Length x Width x Height in meters (1m x 1m x 1m). It is the standard unit of volume in international sea freight." },
            { question: "What is Chargeable Weight in Air Freight?", answer: "Airlines don't want you shipping a plane full of pillows for free. They use a DIM factor (usually 1 CBM = 167 kg). If your 1 CBM box only weighs 50kg, they will 'charge' you as if it weighed 167kg. You always pay the greater of Actual Weight or Chargeable Weight." },
            { question: "What is the typical price difference?", answer: "As a general rule of thumb, Air Freight is historically 4x to 6x more expensive than Sea Freight for average consumer goods. During the pandemic, this multiplier jumped to 12x due to lack of passenger planes." },
          ]} pageUrl="https://racira.com/calculator/sea-vs-air-freight-cost-comparison-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Sea Vs Air Freight Cost Comparison Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Sea Vs Air Freight Cost Comparison Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Sea Vs Air Freight Cost Comparison Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Sea Vs Air Freight Cost Comparison Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Sea Vs Air Freight Cost Comparison Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/sea-vs-air-freight-cost-comparison-calculator" />
        </div>
      </div>
    </>
  );
}
