"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Plane, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface AirFreightResults {
  actualWeight: number;
  volumeCm3: number;
  volumetricWeight: number;
  chargeableWeight: number;
  isVolumetric: boolean;
  estimatedCost: number;
  chartData: { name: string; Weight: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateAirFreight = (actual: number, length: number, width: number, height: number, rate: number, constant: number): AirFreightResults => {
  const volumeCm3 = length * width * height;
  
  // IATA Volumetric Weight calculation
  const volumetricWeight = volumeCm3 / constant;
  
  const chargeableWeight = Math.max(actual, volumetricWeight);
  const isVolumetric = volumetricWeight > actual;
  
  const estimatedCost = chargeableWeight * rate;

  const chartData = [
    { name: "Actual Weight", Weight: actual, fill: isVolumetric ? "hsl(var(--muted))" : "hsl(var(--primary))" },
    { name: "Volumetric Weight", Weight: volumetricWeight, fill: isVolumetric ? "hsl(var(--primary))" : "hsl(var(--muted))" },
  ];

  const summaryStats = [
    { label: "Chargeable Weight", value: `${chargeableWeight.toFixed(2)} kg` },
    { label: "Total Estimated Cost", value: `$${estimatedCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Billing Basis", value: isVolumetric ? "Volume" : "Actual Mass" },
    { label: "Volumetric Divisor", value: constant.toString() },
  ];

  const breakdown = [
    { label: "Package Volume (L × W × H)", amount: `${volumeCm3.toLocaleString()} cm³` },
    { label: "Calculated Volumetric Weight", amount: `${volumetricWeight.toFixed(2)} kg`, colorClass: isVolumetric ? "text-primary font-bold" : "text-muted-foreground" },
    { label: "Actual Physical Weight", amount: `${actual.toFixed(2)} kg`, colorClass: !isVolumetric ? "text-primary font-bold" : "text-muted-foreground" },
    { label: "Chargeable Weight (The Greater Value)", amount: `${chargeableWeight.toFixed(2)} kg`, isTotal: true },
    { label: `Rate per kg`, amount: `× $${rate.toFixed(2)}` },
    { label: "Total Estimated Air Freight Cost", amount: `$${estimatedCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { actualWeight: actual, volumeCm3, volumetricWeight, chargeableWeight, isVolumetric, estimatedCost, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  actual: "150",
  length: "120",
  width: "80",
  height: "100",
  rate: "4.50",
  constant: "6000" // 6000 is standard freight, 5000 is standard express (DHL/FedEx)
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

export default function AirFreightCostEstimator() {
  const [actual, setActual] = useState(DEFAULTS.actual);
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [constant, setConstant] = useState(DEFAULTS.constant);
  
  const [results, setResults] = useState<AirFreightResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateAirFreight(
      parseFloat(actual) || 0, 
      parseFloat(length) || 0,
      parseFloat(width) || 0,
      parseFloat(height) || 0,
      parseFloat(rate) || 0,
      parseFloat(constant) || 6000
    ));
  };

  const handleReset = () => {
    setActual(DEFAULTS.actual); setLength(DEFAULTS.length); setWidth(DEFAULTS.width); setHeight(DEFAULTS.height); setRate(DEFAULTS.rate); setConstant(DEFAULTS.constant);
    setResults(calculateAirFreight(150, 120, 80, 100, 4.50, 6000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Air Freight Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">{payload[0].value.toFixed(2)} kg</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Air Freight Cost Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Air Freight Chargeable Weight & Cost Estimator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Plane className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Shipment Details</h2>
            </div>
            
            <CompactInput id="act" label="Actual Physical Weight" value={actual} onChange={setActual} suffix="kg" tooltip="The weight of the cargo when placed on a scale." />
            
            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="len" label="Length" value={length} onChange={setLength} suffix="cm" />
              <CompactInput id="wid" label="Width" value={width} onChange={setWidth} suffix="cm" />
              <CompactInput id="hgt" label="Height" value={height} onChange={setHeight} suffix="cm" />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Freight Rate per kg" value={rate} onChange={setRate} prefix="$" tooltip="The quoted rate from the airline or freight forwarder." />
              <div className="flex flex-col">
                <label htmlFor="const" className="flex items-center text-sm font-semibold text-foreground mb-1.5">Volumetric Divisor</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                  <select id="const" value={constant} onChange={(e) => setConstant(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground appearance-none">
                    <option value="6000">6000 (Standard Air Freight)</option>
                    <option value="5000">5000 (Express / Courier)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>Airlines charge based on "Chargeable Weight"—which is whichever is greater: the actual weight, or the volumetric weight (how much space it takes up).</p>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-emerald-500/10 border-emerald-500/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-emerald-600 transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Estimated Air Freight Cost
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    ${results.estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Billed on <span className="font-bold text-foreground">{results.chargeableWeight.toFixed(2)} kg</span> Chargeable Weight.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Weight & Cost Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Value</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Actual vs Volumetric Weight</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="Weight" radius={[4, 4, 0, 0]} maxBarSize={60}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      The airline will always charge you for the <span className="font-bold text-foreground">higher</span> of these two values.
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
            <h2 className="text-2xl font-bold mb-3">What is Chargeable Weight in Air Freight?</h2>
            <p>If you ship a box of feathers and a box of lead on an airplane, the box of feathers will take up the entire cargo hold before it reaches the weight limit, while the box of lead will hit the weight limit before it fills the space. Because an airplane has limited volume AND limited weight capacity, airlines developed the concept of <strong>Chargeable Weight</strong>.</p>
            <p>Chargeable Weight dictates that you will be billed for whichever is greater: the <strong>Actual physical weight</strong> of the cargo, or the <strong>Volumetric (Dimensional) weight</strong>.</p>
            
            <h3>How to Calculate Volumetric Weight</h3>
            <p>The International Air Transport Association (IATA) has established standard mathematical constants to calculate volumetric weight based on the dimensions of the cargo.</p>
            <ul>
              <li><strong>Standard Air Freight Divisor (6000):</strong> Used for general commercial cargo moving on passenger or freighter airlines. The formula is `(Length × Width × Height in cm) / 6000`.</li>
              <li><strong>Express Courier Divisor (5000):</strong> Used by fast-parcel networks like DHL, FedEx, and UPS. The formula is `(Length × Width × Height in cm) / 5000`. Because they divide by a smaller number, express couriers charge significantly more for large, lightweight boxes.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why Your Freight Invoice May Be Higher Than Expected</h2>
            <p>A very common mistake made by new importers/exporters is budgeting based on the physical weight listed on the commercial invoice. If you are shipping something large and lightweight (like apparel, plastic components, or furniture), it is almost guaranteed that the airline will charge you based on the Volumetric Weight, which can easily be double the physical weight.</p>
            
            <h2 className="text-2xl font-bold mb-3">How to Reduce Air Freight Costs</h2>
            <p>If you are being charged based on Volumetric Weight, the only way to reduce your costs is to optimize your packaging. Eliminating empty space (voids) inside boxes, compressing apparel, and using custom-fit boxes can drastically reduce the dimensions, directly lowering the volumetric weight and your final bill.</p>
          </article>
          <FAQSection faqs={[
            { question: "What if I use inches instead of centimeters?", answer: "If you measure in inches, the divisors change. For standard air freight, the divisor is usually 366 cubic inches per kg (or 166 cubic inches per pound). This calculator uses the global metric standard (cm/kg)." },
            { question: "Are pallets included in the calculation?", answer: "Yes. If your cargo is palletized, the airline will measure the dimensions and physical weight including the wooden or plastic pallet itself. Pallets add significantly to both the physical and volumetric weight." },
            { question: "Does sea freight use volumetric weight?", answer: "Yes, but differently. Sea freight (LCL) is generally billed by the Cubic Meter (CBM) rather than kilograms. 1 CBM is treated as being equal to 1,000 kg. Air freight is much more sensitive to volume than sea freight." },
          ]} pageUrl="https://racira.com/calculator/air-freight-cost-estimator" />
          <PopularCalculators exclude="/calculator/air-freight-cost-estimator" />
        </div>
      </div>
    </>
  );
}
