"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Wind, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

// 1. TypeScript interfaces
interface EmissionsResults {
  isPass: boolean;
  hcStatus: "Pass" | "Fail";
  coStatus: "Pass" | "Fail";
  noxStatus: "Pass" | "Fail";
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateEmissions = (inputs: typeof DEFAULTS): EmissionsResults => {
  const vehicleYear = parseInt(inputs.vehicleYear);
  const measuredHC = parseFloat(inputs.measuredHC);
  const measuredCO = parseFloat(inputs.measuredCO);
  const measuredNOx = parseFloat(inputs.measuredNOx);

  if (isNaN(vehicleYear) || vehicleYear < 1970 || vehicleYear > new Date().getFullYear() || 
      isNaN(measuredHC) || measuredHC < 0 || isNaN(measuredCO) || measuredCO < 0 || isNaN(measuredNOx) || measuredNOx < 0) {
    return {
      isPass: false, hcStatus: "Fail", coStatus: "Fail", noxStatus: "Fail",
      chartData: [], isError: true, errorMsg: "All inputs must be valid positive numbers, and year must be 1970 or newer."
    };
  }

  // Define limits based roughly on EPA standards over the decades
  // These are genericized for the calculator, actual limits vary wildly by state (CARB vs Federal) and exact vehicle weight class.
  let limitHC = 0; // ppm
  let limitCO = 0; // %
  let limitNOx = 0; // ppm

  if (vehicleYear >= 2008) {
    limitHC = 100;
    limitCO = 0.5;
    limitNOx = 1000;
  } else if (vehicleYear >= 1996) { // OBD2 Era
    limitHC = 150;
    limitCO = 1.0;
    limitNOx = 1500;
  } else if (vehicleYear >= 1981) { // Early computer control
    limitHC = 220;
    limitCO = 1.2;
    limitNOx = 2000;
  } else { // Carbureted, pre-cats or early cats
    limitHC = 400;
    limitCO = 3.0;
    limitNOx = 3000;
  }

  const hcStatus = measuredHC <= limitHC ? "Pass" : "Fail";
  const coStatus = measuredCO <= limitCO ? "Pass" : "Fail";
  const noxStatus = measuredNOx <= limitNOx ? "Pass" : "Fail";

  const isPass = hcStatus === "Pass" && coStatus === "Pass" && noxStatus === "Pass";

  // We need to normalize the chart data so we can display ppm and % on the same visual scale relative to their own limits.
  // We'll chart them as "Percentage of Legal Limit"
  
  const hcPercent = (measuredHC / limitHC) * 100;
  const coPercent = (measuredCO / limitCO) * 100;
  const noxPercent = (measuredNOx / limitNOx) * 100;

  const chartData = [
    {
      name: "Hydrocarbons (HC)",
      "Percent of Limit": Math.round(hcPercent),
      "Measured": measuredHC,
      "Limit": limitHC,
      "Unit": "ppm",
      fill: hcPercent > 100 ? "hsl(var(--destructive))" : "hsl(var(--primary))"
    },
    {
      name: "Carbon Monoxide (CO)",
      "Percent of Limit": Math.round(coPercent),
      "Measured": measuredCO,
      "Limit": limitCO,
      "Unit": "%",
      fill: coPercent > 100 ? "hsl(var(--destructive))" : "hsl(var(--primary))"
    },
    {
      name: "Nitrous Oxides (NOx)",
      "Percent of Limit": Math.round(noxPercent),
      "Measured": measuredNOx,
      "Limit": limitNOx,
      "Unit": "ppm",
      fill: noxPercent > 100 ? "hsl(var(--destructive))" : "hsl(var(--primary))"
    }
  ];

  return {
    isPass,
    hcStatus,
    coStatus,
    noxStatus,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  vehicleYear: "2010",
  measuredHC: "85",
  measuredCO: "0.2",
  measuredNOx: "1150" // Fails NOx
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number" }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type={type} step="any" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function EmissionsTestCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<EmissionsResults>(calculateEmissions(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateEmissions(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateEmissions(DEFAULTS));
  };

  const faqs = [
    { question: "Why did my car fail for Hydrocarbons (HC)?", answer: "Hydrocarbons are simply unburned gasoline. If your car fails for high HC, it means raw fuel is escaping the engine and going out the tailpipe without being ignited. This is almost always caused by an ignition system failure. Check for dead spark plugs, bad ignition coils, or vacuum leaks that are causing a cylinder to misfire." },
    { question: "Why did my car fail for Carbon Monoxide (CO)?", answer: "Carbon Monoxide is created when gasoline is burned without enough oxygen. If your car fails for high CO, it means the engine is running 'Rich'—it is injecting far too much fuel into the cylinders. This is usually caused by a faulty Oxygen (O2) sensor feeding bad data to the computer, a clogged air filter choking the engine, or a leaky fuel injector." },
    { question: "Why did my car fail for Nitrous Oxides (NOx)?", answer: "NOx is created when the engine's combustion temperatures become dangerously hot (above 2,500°F). When temperatures get that high, the nitrogen in the air physically bonds with oxygen, creating toxic smog. High NOx is usually caused by a broken EGR (Exhaust Gas Recirculation) valve, which is supposed to cool the combustion chamber, or an engine running 'Lean' (too much air, not enough fuel)." },
    { question: "Will a new Catalytic Converter fix my emissions?", answer: "Maybe, but usually not. The Catalytic Converter is a filter bolted to your exhaust pipe designed to clean up minor impurities. If your engine is misfiring and dumping massive amounts of raw fuel (HC) into the exhaust, it will instantly overwhelm and melt a brand-new catalytic converter. You must fix the engine problem before replacing the converter." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Emissions Test Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Emissions Test Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Simulate tailpipe sniffer test results to determine if your vehicle meets Federal emission standards based on its manufacturing year.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Vehicle Information</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="year" label="Vehicle Model Year" value={inputs.vehicleYear} onChange={(v: string) => handleChange("vehicleYear", v)} placeholder="2010" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Tailpipe Measurements (Sniffer)</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="hc" label="Hydrocarbons (HC)" value={inputs.measuredHC} onChange={(v: string) => handleChange("measuredHC", v)} suffix="ppm" placeholder="85" />
              <CompactInput id="co" label="Carbon Monoxide (CO)" value={inputs.measuredCO} onChange={(v: string) => handleChange("measuredCO", v)} suffix="%" placeholder="0.2" />
              <CompactInput id="nox" label="Nitrous Oxides (NOx)" value={inputs.measuredNOx} onChange={(v: string) => handleChange("measuredNOx", v)} suffix="ppm" placeholder="1150" />
            </div>
            
            <div className="text-[10px] text-muted-foreground mt-2">
              * Note: Modern vehicles (1996+) are typically tested via the OBD2 computer port rather than a tailpipe sniffer, but sniffer limits still technically apply.
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
            
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="grid grid-cols-1 gap-4">
                  <div className={`border-l-4 rounded-lg p-6 relative overflow-hidden shadow-sm ${results.isPass ? 'bg-primary/10 border-primary' : 'bg-destructive/10 border-destructive ring-2 ring-destructive ring-offset-2 ring-offset-background'}`}>
                    <div className={`text-xs uppercase tracking-wide mb-2 font-bold ${results.isPass ? 'text-muted-foreground' : 'text-destructive/80'}`}>
                      Overall Inspection Result
                    </div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-5xl font-black tracking-tighter uppercase ${results.isPass ? 'text-primary' : 'text-destructive'}`}>
                        {results.isPass ? "PASS" : "FAIL"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Hydrocarbons</div>
                    <div className={`text-2xl font-bold ${results.hcStatus === 'Pass' ? 'text-emerald-500' : 'text-destructive'}`}>{results.hcStatus}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Unburned Fuel</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Carbon Monoxide</div>
                    <div className={`text-2xl font-bold ${results.coStatus === 'Pass' ? 'text-emerald-500' : 'text-destructive'}`}>{results.coStatus}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Rich Fuel Mixture</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Nitrous Oxides</div>
                    <div className={`text-2xl font-bold ${results.noxStatus === 'Pass' ? 'text-emerald-500' : 'text-destructive'}`}>{results.noxStatus}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">High Cylinder Heat</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Emissions Relative to Legal Limits</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tickFormatter={(val) => `${val}%`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, (dataMax: number) => Math.max(120, dataMax)]} />
                        <YAxis dataKey="name" type="category" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} width={120} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string, props: any) => {
                            if (name === "fill" || name === "Measured" || name === "Limit" || name === "Unit") return [];
                            return [`${props.payload.Measured} ${props.payload.Unit} (Limit: ${props.payload.Limit})`, "Measured Output"];
                          }}
                          cursor={{fill: 'var(--muted)'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        
                        <Bar dataKey="Percent of Limit" radius={[0, 4, 4, 0]} maxBarSize={40}>
                          {
                            results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                        
                        <ReferenceLine x={100} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: 'top', value: 'LEGAL LIMIT (100%)', fill: 'hsl(var(--destructive))', fontSize: 10, fontWeight: 'bold' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Science of Tailpipe Emissions</h2>
            <p>An internal combustion engine burns a mixture of gasoline and oxygen to create power. In a perfect, impossible world, this combustion process would produce only three harmless things: Water (H2O), Carbon Dioxide (CO2), and Nitrogen gas. However, because engines are imperfect machines dealing with varying temperatures and fuel qualities, they inevitably produce toxic byproducts.</p>
            <p>During a state emissions test, a metal sniffer probe is placed into the tailpipe while the engine is running on a dynamometer (treadmill) to measure the exact parts-per-million (ppm) of these three specific toxic gasses.</p>

            <h2 className="text-2xl font-bold mb-3">1. Hydrocarbons (HC) - Unburned Fuel</h2>
            <p>Gasoline is a hydrocarbon. If a droplet of gasoline enters the engine cylinder but fails to ignite, it gets pushed out of the exhaust valve as raw, unburned fuel. This is what you smell when you start an old classic car in a garage. High HC readings on an emissions test mean your engine has a <strong>Misfire</strong>. This is almost always an electrical problem, such as a dead spark plug, a failing ignition coil, or a severed spark plug wire preventing the fuel from detonating.</p>

            <h2 className="text-2xl font-bold mb-3">2. Carbon Monoxide (CO) - Choked Combustion</h2>
            <p>Carbon Monoxide is a deadly, odorless gas created when the engine burns gasoline, but doesn't have enough oxygen to complete the burn cleanly. In automotive terms, this means the engine is running <strong>"Rich"</strong> (too much fuel, not enough air). This is commonly caused by a severely clogged engine air filter, a stuck-open fuel injector dumping excess gas, or a failed Oxygen (O2) sensor feeding incorrect data to the engine computer.</p>

            <h2 className="text-2xl font-bold mb-3">3. Nitrous Oxides (NOx) - Extreme Heat</h2>
            <p>The air we breathe is mostly Nitrogen. Normally, Nitrogen just passes through the engine harmlessly. However, if the combustion chamber gets too hot (above 2,500°F), the extreme heat physically forces the Nitrogen to bond with Oxygen, creating Nitrous Oxides (NOx). NOx is the primary chemical responsible for thick brown city smog. High NOx readings mean the engine is running dangerously hot, usually due to a broken EGR (Exhaust Gas Recirculation) valve or a severely leaking head gasket.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/emissions-test-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
