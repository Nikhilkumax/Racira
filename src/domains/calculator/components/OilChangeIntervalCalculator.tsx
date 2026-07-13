"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface OilChangeResults {
  nextChangeMileage: number;
  nextChangeDate: string;
  milesRemaining: number;
  daysRemaining: number;
  recommendedIntervalMiles: number;
  recommendedIntervalMonths: number;
  recommendedOil: string;
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateOilChange = (inputs: typeof DEFAULTS): OilChangeResults => {
  const currentMileage = parseFloat(inputs.currentMileage) || 0;
  const lastChangeMileage = parseFloat(inputs.lastChangeMileage) || 0;
  const lastChangeDateStr = inputs.lastChangeDate;
  const oilType = inputs.oilType as "conventional" | "blend" | "synthetic";
  const conditions = inputs.conditions as "normal" | "severe";
  
  // Advanced
  const engineType = inputs.engineType as "standard" | "turbo" | "diesel";
  const vehicleAge = parseFloat(inputs.vehicleAge) || 0;
  const annualMiles = parseFloat(inputs.annualMiles) || 15000;

  if (currentMileage < lastChangeMileage) {
    return {
      nextChangeMileage: 0, nextChangeDate: "", milesRemaining: 0, daysRemaining: 0,
      recommendedIntervalMiles: 0, recommendedIntervalMonths: 0, recommendedOil: "",
      isError: true, errorMsg: "Current mileage cannot be less than the last oil change mileage."
    };
  }

  // Base intervals based on oil type
  let baseMiles = 5000;
  let baseMonths = 6;
  let recommendedOil = "Conventional (5W-20 / 5W-30)";

  if (oilType === "synthetic") {
    baseMiles = 10000;
    baseMonths = 12;
    recommendedOil = "Full Synthetic (0W-20 / 5W-30)";
  } else if (oilType === "blend") {
    baseMiles = 7500;
    baseMonths = 6;
    recommendedOil = "Synthetic Blend";
  }

  // Severe driving conditions penalty
  if (conditions === "severe") {
    baseMiles *= 0.6; // 40% reduction
    baseMonths = Math.max(3, Math.floor(baseMonths * 0.6));
  }

  // Advanced adjustments
  if (engineType === "turbo") {
    baseMiles *= 0.8; // Turbos cook oil faster
    if (oilType === "conventional") recommendedOil = "Upgrade to Full Synthetic heavily recommended for Turbo";
  } else if (engineType === "diesel") {
    // Diesel often has different capacity and soot, but modern diesels on synthetic often go 10k. 
    // We'll leave base alone or slight tweak.
    recommendedOil = "Heavy Duty Diesel Synthetic (15W-40 / 5W-40)";
  }

  if (vehicleAge > 10) {
    baseMiles *= 0.9; // Older engines blow by more fuel/soot into oil
    if (oilType === "conventional") recommendedOil = "High Mileage Conventional/Blend";
    else if (oilType === "synthetic") recommendedOil = "High Mileage Full Synthetic";
  }

  // Round to nearest 100
  const finalIntervalMiles = Math.floor(baseMiles / 100) * 100;

  const nextChangeMileage = lastChangeMileage + finalIntervalMiles;
  const milesRemaining = nextChangeMileage - currentMileage;

  // Calculate dates
  const lastDate = new Date(lastChangeDateStr);
  if (isNaN(lastDate.getTime())) {
    return {
      nextChangeMileage: 0, nextChangeDate: "", milesRemaining: 0, daysRemaining: 0,
      recommendedIntervalMiles: 0, recommendedIntervalMonths: 0, recommendedOil: "",
      isError: true, errorMsg: "Invalid date format."
    };
  }

  // Two ways to hit next change: Time or Mileage.
  // We calculate both and see which comes first.
  const timeLimitDate = new Date(lastDate);
  timeLimitDate.setMonth(timeLimitDate.getMonth() + baseMonths);

  // When will they hit the mileage limit?
  const milesPerDay = annualMiles / 365;
  const daysToHitMiles = milesRemaining > 0 ? (milesRemaining / milesPerDay) : 0;
  const mileageLimitDate = new Date();
  mileageLimitDate.setDate(mileageLimitDate.getDate() + daysToHitMiles);

  // The actual next date is whichever comes first
  let finalNextDate = timeLimitDate < mileageLimitDate ? timeLimitDate : mileageLimitDate;
  
  // If they are already past it
  if (milesRemaining < 0) {
    finalNextDate = new Date(); // Overdue now
  }

  const today = new Date();
  const diffTime = finalNextDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    nextChangeMileage,
    nextChangeDate: finalNextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    milesRemaining,
    daysRemaining,
    recommendedIntervalMiles: finalIntervalMiles,
    recommendedIntervalMonths: baseMonths,
    recommendedOil,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  currentMileage: "48500",
  lastChangeMileage: "45000",
  lastChangeDate: (() => { const d = new Date(); d.setMonth(d.getMonth() - 4); return d.toISOString().split('T')[0]; })(),
  oilType: "synthetic",
  conditions: "normal",
  // Advanced
  engineType: "standard",
  vehicleAge: "5",
  annualMiles: "12000"
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, tooltip, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function OilChangeIntervalCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<OilChangeResults>(calculateOilChange(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateOilChange(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateOilChange(DEFAULTS));
  };

  // For chart
  const current = parseFloat(inputs.currentMileage) || 0;
  const last = parseFloat(inputs.lastChangeMileage) || 0;
  const next = results.nextChangeMileage;
  
  // Normalize for chart display (progress bar style)
  const totalInterval = next - last;
  const milesDriven = current - last;
  const milesLeft = Math.max(0, next - current);
  const overdue = current > next ? current - next : 0;

  const barData = results.isError ? [] : [
    {
      name: "Oil Life Status",
      "Miles Driven": milesDriven - overdue,
      "Miles Remaining": milesLeft,
      "Overdue": overdue
    }
  ];

  const faqs = [
    { question: "Is the 3,000-mile rule still accurate?", answer: "No. The 3,000-mile oil change is an outdated myth heavily pushed by quick-lube shops to increase profits. Modern engines and modern synthetic oils are engineered to last 7,500 to 10,000 miles under normal driving conditions." },
    { question: "What counts as 'Severe' driving conditions?", answer: "You are likely driving in 'Severe' conditions if you frequently: idle for long periods in heavy traffic, make trips under 5 miles in cold weather (oil never gets hot enough to burn off moisture), tow heavy loads, or drive in extremely dusty/dirt environments." },
    { question: "Can I switch back to conventional after using synthetic?", answer: "Yes. It is a persistent myth that you cannot switch back and forth between synthetic and conventional oil. You can switch at any time, but remember that conventional oil will require a much shorter change interval." },
    { question: "Why is there a time limit (months) if I don't drive much?", answer: "Oil breaks down over time even if the car sits. Moisture from condensation builds up inside the crankcase, and without the engine running hot enough to evaporate it, the water mixes with the oil and creates a corrosive sludge." },
    { question: "Do turbocharged engines need special care?", answer: "Yes. Turbochargers spin at incredibly high speeds (up to 200,000 RPM) and get extremely hot. They rely entirely on engine oil for cooling and lubrication. Using full synthetic oil and strictly adhering to intervals is critical to prevent the oil from burning ('coking') inside the turbo." },
    { question: "What is High Mileage oil?", answer: "High Mileage oil is specifically formulated with seal conditioners that help rejuvenate older, hardened engine seals to prevent or slow down minor oil leaks. It is highly recommended for engines with over 75,000 miles." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Oil Change Interval Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Oil Change Interval Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Current Mileage</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <input type="number" value={inputs.currentMileage} onChange={e => handleChange("currentMileage", e.target.value)} className="w-full h-full px-4 text-xl font-bold bg-transparent outline-none border-none text-foreground" />
                <span className="pr-4 text-primary font-bold text-sm uppercase">Miles</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="last-mileage" label="Mileage at Last Change" value={inputs.lastChangeMileage} onChange={(v: string) => handleChange("lastChangeMileage", v)} suffix="mi" />
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1">Date of Last Change</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input type="date" value={inputs.lastChangeDate} onChange={(e) => handleChange("lastChangeDate", e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="oil-type" label="Oil Type Used" value={inputs.oilType} onChange={(v: string) => handleChange("oilType", v)} options={[
                { label: "Full Synthetic", value: "synthetic" },
                { label: "Synthetic Blend", value: "blend" },
                { label: "Conventional", value: "conventional" }
              ]} />
              <CompactInput id="conditions" label="Driving Conditions" value={inputs.conditions} onChange={(v: string) => handleChange("conditions", v)} options={[
                { label: "Normal / Commute", value: "normal" },
                { label: "Severe / Traffic / Towing", value: "severe" }
              ]} />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="engine-type" label="Engine Type" value={inputs.engineType} onChange={(v: string) => handleChange("engineType", v)} options={[
                    { label: "Standard / N.A.", value: "standard" },
                    { label: "Turbocharged", value: "turbo" },
                    { label: "Diesel", value: "diesel" }
                  ]} />
                  <CompactInput id="vehicle-age" label="Vehicle Age" value={inputs.vehicleAge} onChange={(v: string) => handleChange("vehicleAge", v)} suffix="years" />
                  <CompactInput id="annual-miles" label="Annual Miles Driven" value={inputs.annualMiles} onChange={(v: string) => handleChange("annualMiles", v)} suffix="mi" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
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
                {results.milesRemaining < 0 || results.daysRemaining < 0 ? (
                  <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 relative">
                    <div className="text-xs uppercase tracking-wide text-destructive mb-1 font-bold">Maintenance Overdue!</div>
                    <div className="text-4xl font-bold text-destructive mb-1">Change Oil Immediately</div>
                    <div className="text-sm text-foreground">You are past due for an oil change. Change it as soon as possible to prevent engine wear.</div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-5 relative">
                    <div className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1 font-bold">Next Recommended Oil Change</div>
                    <div className="text-4xl font-bold text-foreground mb-1">{results.nextChangeMileage.toLocaleString()} Miles</div>
                    <div className="text-sm text-muted-foreground">Or by <strong>{results.nextChangeDate}</strong>, whichever comes first.</div>
                  </div>
                )}

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Miles Remaining</div>
                    <div className={`text-lg font-bold ${results.milesRemaining < 1000 ? 'text-amber-500' : 'text-foreground'}`}>
                      {results.milesRemaining < 0 ? 0 : results.milesRemaining.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Days Remaining</div>
                    <div className={`text-lg font-bold ${results.daysRemaining < 30 ? 'text-amber-500' : 'text-foreground'}`}>
                      {results.daysRemaining < 0 ? 0 : results.daysRemaining}
                    </div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Interval Ratio</div>
                    <div className="text-lg font-bold text-primary">{results.recommendedIntervalMiles.toLocaleString()}mi / {results.recommendedIntervalMonths}mo</div>
                  </div>
                </div>

                {/* 4. Chart (Status Bar) */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Oil Life Status</h3>
                  <div className="h-[80px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide domain={[0, totalInterval]} />
                        <YAxis type="category" dataKey="name" hide />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Bar dataKey="Miles Driven" stackId="a" fill="#3b82f6" radius={[4, 0, 0, 4]} barSize={30} />
                        <Bar dataKey="Overdue" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={30} />
                        <Bar dataKey="Miles Remaining" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                    <span>{last.toLocaleString()} mi</span>
                    <span>{next.toLocaleString()} mi</span>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recommendations</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-3 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Optimal Oil Type</span>
                      <span className="font-bold text-foreground max-w-[200px] text-right">{results.recommendedOil}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Calculated Interval</span>
                      <span className="font-medium text-foreground">{results.recommendedIntervalMiles.toLocaleString()} miles</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 text-base">
                      <span className="text-muted-foreground">Severe Duty Adjustment</span>
                      <span className="font-medium text-foreground">{inputs.conditions === "severe" ? "Applied (-40%)" : "None"}</span>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Oil Change Interval Calculator?</h2>
            <p>An Oil Change Interval Calculator is a diagnostic tool designed to tell you exactly when your car is due for its next oil service. For decades, the automotive industry relentlessly pushed the "3 months or 3,000 miles" rule. Today, that rule is entirely obsolete. Thanks to advances in engine manufacturing tolerances and highly engineered synthetic oils, changing your oil too frequently is simply throwing money away. This calculator analyzes your oil type, driving habits, and engine specifics to provide a mathematically sound, customized maintenance schedule.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The calculator uses a baseline mileage based on your oil chemistry. Conventional oil defaults to 5,000 miles, synthetic blends to 7,500 miles, and full synthetic to 10,000 miles. However, the calculation does not stop there. It applies penalty modifiers based on your exact usage. If you select "Severe" driving conditions, the algorithm slashes the interval by 40%. It also factors in engine type (turbochargers degrade oil faster due to immense heat) and vehicle age (older engines allow more blow-by gasses to contaminate the oil).</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>Your <strong>Next Recommended Oil Change</strong> is provided as both a specific odometer reading and a calendar date. You must change your oil whenever you hit <em>whichever metric comes first</em>. Even if a car sits in a garage and only drives 1,000 miles a year, the oil still degrades due to condensation and chemical breakdown, making the "months remaining" metric just as important as the mileage.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>The two biggest factors in oil life are <strong>Oil Type</strong> and <strong>Driving Conditions</strong>. Full synthetic oil contains fewer impurities and highly resilient additives that withstand heat and shear forces far better than conventional crude oil. However, even the best synthetic oil will fail early under "Severe" conditions. Severe driving is defined as extensive idling (traffic jams), short trips under 5 miles where the engine never reaches operating temperature, towing heavy loads, or driving in extreme dusty/sandy environments.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>By using the Advanced Options, you can fine-tune the algorithm. <strong>Engine Type</strong> matters immensely; a turbocharged engine uses the same engine oil to lubricate a turbine spinning at 150,000 RPM. If the oil degrades, the turbo fails—a $2,000+ repair. <strong>Vehicle Age</strong> is also included; as seals shrink and piston rings wear down, fuel and exhaust gases contaminate the crankcase oil faster, necessitating slightly shorter intervals on very old engines.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1: The Highway Commuter.</strong> John drives a newer Honda Civic mostly on the highway. He uses full synthetic oil under normal conditions. His interval safely pushes to 10,000 miles or 12 months, saving him hundreds of dollars a year at the lube shop.</p>
            <p><strong>Example 2: The City Delivery Driver.</strong> Sarah drives a 10-year-old car for a food delivery app. She uses a synthetic blend. Because she drives in constant stop-and-go traffic and idles frequently (Severe Conditions), the algorithm violently cuts her interval down from 7,500 miles to just 4,500 miles to protect her aging engine from sludge buildup.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Always check your dipstick once a month. No matter what your calculated interval is, if your engine naturally burns oil (common in some modern engines) and the dipstick reads low, you must add oil immediately. Furthermore, if you are unsure what oil to use, the owner's manual is the ultimate authority. Never use a thinner oil than recommended, though upgrading from conventional to synthetic in the same weight is always a safe and beneficial move.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Using this calculator prevents two expensive mistakes: over-maintaining your car (wasting money on unnecessary oil changes) and under-maintaining your car (causing catastrophic engine failure due to sludge). It provides peace of mind by giving you a personalized, science-based schedule tailored to how you actually drive.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/oil-change-interval-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
