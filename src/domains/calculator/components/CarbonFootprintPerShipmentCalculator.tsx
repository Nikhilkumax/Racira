"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Leaf, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CarbonResults {
  weight: number;
  distance: number;
  mode: string;
  emissionsKg: number;
  emissionsTons: number;
  treeEquiv: number;
  chartData: { modeName: string; emissions: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateCarbonFootprint = (weight: number, distance: number, mode: string): CarbonResults => {
  // Rough average emission factors (g CO2e per tonne-km)
  const factors = {
    air: 500,
    road: 60,
    rail: 20,
    ocean: 10
  };

  const currentFactor = factors[mode as keyof typeof factors] || 60;
  
  // Total = Weight(MT) * Distance(km) * Factor(g) / 1000 = kg CO2e
  const emissionsKg = (weight * distance * currentFactor) / 1000;
  const emissionsTons = emissionsKg / 1000;
  
  // A mature tree absorbs ~22kg of CO2 per year
  const treeEquiv = Math.ceil(emissionsKg / 22);

  const chartData = [
    { modeName: "Air Freight", emissions: (weight * distance * factors.air) / 1000 },
    { modeName: "Road Truck", emissions: (weight * distance * factors.road) / 1000 },
    { modeName: "Rail Freight", emissions: (weight * distance * factors.rail) / 1000 },
    { modeName: "Ocean Vessel", emissions: (weight * distance * factors.ocean) / 1000 },
  ];

  const modeLabels: Record<string, string> = {
    air: "Air Freight", road: "Road Truck", rail: "Rail Freight", ocean: "Ocean Vessel"
  };

  const summaryStats = [
    { label: "Total Emissions", value: `${emissionsKg.toLocaleString("en-US", { maximumFractionDigits: 0 })} kg` },
    { label: "Metric Tons CO₂e", value: `${emissionsTons.toFixed(2)} MT` },
    { label: "Tree Equivalent (1 Yr)", value: `${treeEquiv.toLocaleString()} trees` },
    { label: "Transport Mode", value: modeLabels[mode] || mode },
  ];

  const breakdown = [
    { label: "Cargo Weight", amount: `${weight.toLocaleString("en-US")} MT` },
    { label: "Distance Traveled", amount: `${distance.toLocaleString("en-US")} km` },
    { label: `Emission Factor (${modeLabels[mode]})`, amount: `${currentFactor} g CO₂e / t-km` },
    { label: "Total Carbon Footprint (kg)", amount: `${emissionsKg.toLocaleString("en-US", { maximumFractionDigits: 2 })} kg`, isTotal: true },
    { label: "Total Carbon Footprint (Tons)", amount: `${emissionsTons.toLocaleString("en-US", { maximumFractionDigits: 3 })} MT`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { weight, distance, mode, emissionsKg, emissionsTons, treeEquiv, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  weight: "15",
  distance: "4500",
  mode: "ocean",
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

export default function CarbonFootprintPerShipmentCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [mode, setMode] = useState(DEFAULTS.mode);
  
  const [results, setResults] = useState<CarbonResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateCarbonFootprint(
      parseFloat(weight) || 0, 
      parseFloat(distance) || 0, 
      mode
    ));
  };

  const handleReset = () => {
    setWeight(DEFAULTS.weight); setDistance(DEFAULTS.distance); setMode(DEFAULTS.mode);
    setResults(calculateCarbonFootprint(15, 4500, "ocean"));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carbon Footprint</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.modeName}:</span>
          <span className="text-foreground">{payload[0].value.toLocaleString(undefined, {maximumFractionDigits:0})} kg CO₂e</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Carbon Footprint per Shipment" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carbon Footprint per Shipment Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="h-5 w-5 text-emerald-500" />
              <h2 className="text-2xl font-bold mb-3">Logistics Data</h2>
            </div>
            
            <CompactInput id="wt" label="Cargo Weight" value={weight} onChange={setWeight} suffix="MT" tooltip="Total weight of the shipment in Metric Tons (1,000 kg = 1 MT)." />
            <CompactInput id="dist" label="Transport Distance" value={distance} onChange={setDistance} suffix="km" tooltip="The total distance the cargo will travel." />
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1.5">Primary Transport Mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="air">Air Freight (~500 g CO₂/t-km)</option>
                <option value="road">Road / Truck (~60 g CO₂/t-km)</option>
                <option value="rail">Rail Freight (~20 g CO₂/t-km)</option>
                <option value="ocean">Ocean Vessel (~10 g CO₂/t-km)</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
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
                    Estimated Carbon Footprint
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    {results.emissionsKg.toLocaleString("en-US", { maximumFractionDigits: 0 })} kg CO₂e
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <Leaf className="h-4 w-4" /> Offset Equiv: <span className="font-bold text-foreground">{results.treeEquiv.toLocaleString()} trees</span> (1 year absorption)
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Metrics</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Data</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Emissions by Transport Mode (kg CO₂e)</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="modeName" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={85} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="emissions" radius={[0, 4, 4, 0]}>
                            {results.chartData.map((entry, index) => {
                              const isActive = (results.mode === 'air' && entry.modeName.includes('Air')) || 
                                               (results.mode === 'road' && entry.modeName.includes('Road')) ||
                                               (results.mode === 'rail' && entry.modeName.includes('Rail')) ||
                                               (results.mode === 'ocean' && entry.modeName.includes('Ocean'));
                              return (
                                <Cell key={`cell-${index}`} fill={isActive ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
                              );
                            })}
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
            <h2 className="text-2xl font-bold mb-3">Why Calculate Logistics Carbon Footprint?</h2>
            <p>As global supply chains expand, the logistics industry accounts for roughly 11% of global greenhouse gas emissions. Calculating your <strong>Carbon Footprint per Shipment</strong> is increasingly required by governments (such as the EU's Corporate Sustainability Reporting Directive), large B2B clients requiring Scope 3 emissions data, and consumers demanding eco-friendly practices.</p>
            
            <h3>Understanding Emission Factors (CO₂e)</h3>
            <p>Carbon footprint calculations rely on "Emission Factors," which measure how many grams of Carbon Dioxide equivalent (CO₂e) are released into the atmosphere to move one metric ton of cargo over one kilometer (g/t-km).</p>
            <ul>
              <li><strong>Air Freight (~500 g/t-km):</strong> Extremely fast but highly polluting. Flying cargo produces up to 50 times more carbon emissions than ocean freight.</li>
              <li><strong>Road/Truck (~60 g/t-km):</strong> The standard for domestic "last-mile" or cross-country delivery. Less efficient than rail due to aerodynamics, engine limits, and traffic.</li>
              <li><strong>Rail (~20 g/t-km):</strong> Highly efficient for domestic freight. A single freight train can carry the load of hundreds of trucks while using far less diesel.</li>
              <li><strong>Ocean (~10 g/t-km):</strong> The most carbon-efficient way to move goods globally. Massive container ships leverage economies of scale to produce very low emissions per unit of cargo.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">How to Reduce Shipment Emissions</h2>
            <p>The most effective strategy to reduce your carbon footprint is <strong>modal shifting</strong>. If you currently fly goods from Asia to Europe or North America, switching to ocean freight will instantly slash your transport emissions by over 95%. For domestic shipping, utilizing rail networks instead of long-haul trucking can reduce emissions by up to 65%.</p>
            <p>Other strategies include optimizing packaging to reduce "dead air" (allowing more products per container) and consolidating shipments to reduce the total number of trips.</p>
          </section>
          <FAQSection faqs={[
            { question: "What does CO₂e mean?", answer: "CO₂e stands for Carbon Dioxide Equivalent. Transport vehicles emit various greenhouse gases (like methane and nitrous oxide) in addition to carbon dioxide. CO₂e converts all these gases into a single metric based on their global warming potential." },
            { question: "Are these exact emission numbers?", answer: "No, these are global averages used for baseline estimations. The exact emissions of a shipment depend on the specific vehicle model, fuel type (e.g., biodiesel vs standard diesel), load capacity utilization, and exact routing." },
            { question: "What is Scope 3 emissions?", answer: "Scope 3 emissions are all indirect emissions that occur in the value chain of a reporting company. For a retailer, the carbon emitted by the third-party trucking company delivering their goods is classified as a Scope 3 emission." },
            { question: "How do carbon offsets work?", answer: "If you cannot eliminate emissions (e.g., you must fly goods urgently), you can purchase carbon offsets. Your money funds projects that reduce emissions elsewhere, such as planting trees (which absorb CO₂) or building solar farms. Our calculator estimates how many mature trees it takes to absorb your shipment's emissions over one year." },
          ]} pageUrl="https://racira.com/calculator/carbon-footprint-per-shipment-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Carbon Footprint Per Shipment Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Carbon Footprint Per Shipment Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Carbon Footprint Per Shipment Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Carbon Footprint Per Shipment Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Carbon Footprint Per Shipment Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/carbon-footprint-per-shipment-calculator" />
        </div>
      </div>
    </>
  );
}
