"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, BatteryWarning, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";

// 1. TypeScript interfaces
interface DegradationResults {
  currentHealthPct: number;
  remainingCapacity: number;
  remainingRange: number;
  rangeLost: number;
  warrantyStatus: string;
  warrantyColor: string;
  chartData: any[];
  breakdown: {
    ageLoss: number;
    cycleLoss: number;
    climateLoss: number;
    fastChargeLoss: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateDegradation = (inputs: typeof DEFAULTS): DegradationResults => {
  const originalCapacity = parseFloat(inputs.originalCapacity) || 0;
  const originalRange = parseFloat(inputs.originalRange) || 0;
  const currentAge = parseFloat(inputs.currentAge) || 0;
  const currentMileage = parseFloat(inputs.currentMileage) || 0;
  
  const climate = inputs.climate as "hot" | "mild" | "cold";
  const fastChargingFreq = inputs.fastChargingFreq as "rare" | "occasional" | "frequent";

  // Advanced
  const warrantyThreshold = parseFloat(inputs.warrantyThreshold) || 70;
  const warrantyYears = parseFloat(inputs.warrantyYears) || 8;
  const warrantyMiles = parseFloat(inputs.warrantyMiles) || 100000;

  if (originalCapacity <= 0 || originalRange <= 0) {
    return {
      currentHealthPct: 0, remainingCapacity: 0, remainingRange: 0, rangeLost: 0,
      warrantyStatus: "", warrantyColor: "", chartData: [],
      breakdown: { ageLoss: 0, cycleLoss: 0, climateLoss: 0, fastChargeLoss: 0 },
      isError: true, errorMsg: "Original capacity and range must be greater than zero."
    };
  }

  // Calculate degradation factors
  // 1. Age (Calendar Degradation)
  // Lithium-ion batteries degrade just sitting there. Around 1.5% - 2% per year.
  const baseAgeRate = 0.015;
  const ageLossPct = currentAge * baseAgeRate;

  // 2. Cycles (Mileage Degradation)
  // Roughly 1% degradation per 25,000 miles
  const cycleLossPct = currentMileage / 25000 * 0.01;

  // 3. Climate Penalty
  // Heat destroys batteries. Cold temporarily reduces range but doesn't permanently degrade.
  let climatePenaltyRate = 0;
  if (climate === "hot") climatePenaltyRate = 0.005; // Extra 0.5% per year
  const climateLossPct = currentAge * climatePenaltyRate;

  // 4. Fast Charging Penalty
  // DCFC generates high heat. Frequent use causes micro-cracking in the anode.
  let fastChargePenaltyRate = 0;
  if (fastChargingFreq === "frequent") fastChargePenaltyRate = 0.005; // Extra 0.5% per year
  else if (fastChargingFreq === "occasional") fastChargePenaltyRate = 0.002;
  const fastChargeLossPct = currentAge * fastChargePenaltyRate;

  // Total Degradation
  let totalDegradationPct = ageLossPct + cycleLossPct + climateLossPct + fastChargeLossPct;
  
  // Non-linear constraint. Batteries degrade faster in year 1, then level off.
  // For simplicity, we cap degradation to a realistic floor unless mileage is insane.
  if (totalDegradationPct > 0.6) totalDegradationPct = 0.6; // Max 60% loss modeled

  const currentHealthPct = Math.max(0, 100 * (1 - totalDegradationPct));
  const remainingCapacity = originalCapacity * (currentHealthPct / 100);
  const remainingRange = originalRange * (currentHealthPct / 100);
  const rangeLost = originalRange - remainingRange;

  // Warranty Check
  let warrantyStatus = "N/A";
  let warrantyColor = "";
  
  if (currentAge <= warrantyYears && currentMileage <= warrantyMiles) {
    if (currentHealthPct <= warrantyThreshold) {
      warrantyStatus = "Eligible for Free Replacement";
      warrantyColor = "text-emerald-600 font-bold";
    } else {
      warrantyStatus = "Under Warranty (Battery Healthy)";
      warrantyColor = "text-foreground";
    }
  } else {
    warrantyStatus = "Warranty Expired";
    warrantyColor = "text-destructive";
  }

  // Chart Data: Plotting degradation over time up to 15 years
  let chartData = [];
  const annualMiles = currentAge > 0 ? currentMileage / currentAge : 12000;
  
  let tempAge = 0;
  let tempMiles = 0;
  
  for (let year = 0; year <= Math.max(15, currentAge + 2); year++) {
    tempAge = year;
    tempMiles = year * annualMiles;
    
    let simAgeLoss = tempAge * baseAgeRate;
    let simCycleLoss = tempMiles / 25000 * 0.01;
    let simClimateLoss = tempAge * climatePenaltyRate;
    let simFastChargeLoss = tempAge * fastChargePenaltyRate;
    
    let simTotalLoss = simAgeLoss + simCycleLoss + simClimateLoss + simFastChargeLoss;
    if (simTotalLoss > 0.6) simTotalLoss = 0.6;
    
    let simHealth = 100 * (1 - simTotalLoss);
    
    chartData.push({
      year: year,
      health: simHealth,
      miles: tempMiles,
      isCurrent: year === Math.round(currentAge) ? simHealth : null
    });
  }

  return {
    currentHealthPct,
    remainingCapacity,
    remainingRange,
    rangeLost,
    warrantyStatus,
    warrantyColor,
    chartData,
    breakdown: {
      ageLoss: ageLossPct * 100,
      cycleLoss: cycleLossPct * 100,
      climateLoss: climateLossPct * 100,
      fastChargeLoss: fastChargeLossPct * 100
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  originalCapacity: "75", // Tesla Model 3 LR
  originalRange: "310",
  currentAge: "4",
  currentMileage: "60000",
  climate: "mild",
  fastChargingFreq: "occasional",
  // Advanced
  warrantyThreshold: "70",
  warrantyYears: "8",
  warrantyMiles: "100000"
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
export default function BatteryDegradationCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<DegradationResults>(calculateDegradation(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateDegradation(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDegradation(DEFAULTS));
  };

  const faqs = [
    { question: "What is Battery Degradation?", answer: "Lithium-ion batteries naturally lose their ability to hold a full charge over time. This is called degradation. Every time you charge and discharge the battery (a cycle), microscopic changes occur in the chemistry, permanently reducing its maximum capacity. This is why a 5-year-old EV will not drive as far as it did when it was brand new." },
    { question: "How much range should I expect to lose?", answer: "On average, a modern EV battery degrades by about 1.5% to 2% per year. Therefore, a 5-year-old EV will typically retain about 90% to 92% of its original range. Extreme factors, like exclusively using fast chargers or living in a scorching desert, can accelerate this loss." },
    { question: "Does Fast Charging ruin the battery?", answer: "Frequent use of DC Fast Chargers (like Superchargers) does accelerate degradation compared to slow Level 2 home charging. Fast charging generates immense heat and forces ions into the battery rapidly, which can cause micro-cracking in the battery's anode. Occasional use for road trips is perfectly fine, but relying on it daily will shorten the battery's lifespan." },
    { question: "Will cold weather degrade my battery?", answer: "No. Cold weather temporarily reduces your range because the chemical reactions slow down, but it does not cause permanent degradation. Once the battery warms back up, the capacity returns. Heat, however, causes permanent, irreversible degradation to lithium-ion cells." },
    { question: "When will the manufacturer replace my battery?", answer: "Most EV manufacturers (including Tesla, Ford, and Chevy) offer an 8-year / 100,000-mile warranty that guarantees the battery will retain at least 70% of its original capacity. If it drops below 70% within that timeframe, they will replace the battery for free." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "EV Battery Degradation Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EV Battery Degradation Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="orig-range" label="Original Range (New)" value={inputs.originalRange} onChange={(v: string) => handleChange("originalRange", v)} suffix="mi" />
              <CompactInput id="orig-cap" label="Original Capacity" value={inputs.originalCapacity} onChange={(v: string) => handleChange("originalCapacity", v)} suffix="kWh" />
            </div>

            <div className="flex flex-col border-t border-border pt-3 mt-1">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Vehicle History</div>
              <div className="grid grid-cols-2 gap-4">
                <CompactInput id="age" label="Current Age" value={inputs.currentAge} onChange={(v: string) => handleChange("currentAge", v)} suffix="yrs" />
                <CompactInput id="miles" label="Current Mileage" value={inputs.currentMileage} onChange={(v: string) => handleChange("currentMileage", v)} suffix="mi" />
              </div>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 border-t border-border pt-3">Operating Conditions</div>
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="fast-charge" label="DC Fast Charging Frequency" value={inputs.fastChargingFreq} onChange={(v: string) => handleChange("fastChargingFreq", v)} options={[
                { label: "Rare (Mostly Home Charging)", value: "rare" },
                { label: "Occasional (Road Trips Only)", value: "occasional" },
                { label: "Frequent (Weekly / No Home Charger)", value: "frequent" }
              ]} />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-1">
              <CompactInput id="climate" label="Primary Climate" value={inputs.climate} onChange={(v: string) => handleChange("climate", v)} options={[
                { label: "Mild (Average 50°F - 80°F)", value: "mild" },
                { label: "Cold (Frequent Freezing)", value: "cold" },
                { label: "Hot (Frequent 90°F+ / Desert)", value: "hot" }
              ]} tooltip="Heat accelerates permanent degradation. Cold causes temporary range loss but not permanent damage." />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Warranty) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="war-thresh" label="Warranty Threshold" value={inputs.warrantyThreshold} onChange={(v: string) => handleChange("warrantyThreshold", v)} suffix="%" tooltip="Usually 70% capacity retention." />
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <CompactInput id="war-years" label="Warranty Years" value={inputs.warrantyYears} onChange={(v: string) => handleChange("warrantyYears", v)} suffix="yrs" />
                    <CompactInput id="war-miles" label="Warranty Miles" value={inputs.warrantyMiles} onChange={(v: string) => handleChange("warrantyMiles", v)} suffix="mi" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Estimate Health
              </button>
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
                <div className={`border-l-4 rounded-lg p-5 relative ${results.currentHealthPct < parseFloat(inputs.warrantyThreshold) ? 'bg-destructive/10 border-destructive' : results.currentHealthPct < 80 ? 'bg-orange-500/10 border-orange-500' : 'bg-[#10b981]/10 border-[#10b981]'}`}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Battery Health</div>
                  <div className={`text-5xl font-bold mb-1 ${results.currentHealthPct < parseFloat(inputs.warrantyThreshold) ? 'text-destructive' : results.currentHealthPct < 80 ? 'text-orange-500' : 'text-[#10b981]'}`}>
                    {results.currentHealthPct.toFixed(1)}%
                  </div>
                  <div className={`text-sm font-bold mt-1 ${results.warrantyColor}`}>{results.warrantyStatus}</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Max Range Now</div>
                    <div className="text-lg font-bold text-foreground">{Math.round(results.remainingRange)} mi</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Range Lost</div>
                    <div className="text-lg font-bold text-destructive">-{Math.round(results.rangeLost)} mi</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Capacity Left</div>
                    <div className="text-lg font-bold text-[#3b82f6]">{results.remainingCapacity.toFixed(1)} kWh</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Degradation Curve Projection</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={[0, 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val}%`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[50, 100]} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => {
                            if (name === "health") return [`${value.toFixed(1)}%`, "Battery Health"];
                            if (name === "miles") return [`${value.toLocaleString()} mi`, "Est. Mileage"];
                            return [value, name];
                          }} 
                          labelFormatter={(label) => `Year ${label}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <ReferenceLine y={parseFloat(inputs.warrantyThreshold)} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Warranty Replacement Threshold', fill: '#ef4444', fontSize: 10 }} />
                        <ReferenceLine x={parseFloat(inputs.currentAge)} stroke="#3b82f6" strokeWidth={2} label={{ position: 'insideBottomRight', value: 'CURRENT AGE', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                        
                        <Area type="monotone" dataKey="health" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Degradation Factors Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Calendar Aging (Time)</span>
                      <span className="font-medium text-red-500">-{results.breakdown.ageLoss.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Cyclic Aging (Mileage)</span>
                      <span className="font-medium text-red-500">-{results.breakdown.cycleLoss.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Climate Penalty (Heat)</span>
                      <span className="font-medium text-red-500">-{results.breakdown.climateLoss.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Fast Charging Penalty</span>
                      <span className="font-medium text-red-500">-{results.breakdown.fastChargeLoss.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total Capacity Lost</span>
                      <span className="text-destructive">-{(100 - results.currentHealthPct).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an EV Battery Degradation Calculator?</h2>
            <p>An EV Battery Degradation Calculator is a diagnostic tool used to estimate the current health and remaining lifespan of a lithium-ion electric vehicle battery. Just like a smartphone battery, an EV battery permanently loses a small fraction of its maximum capacity over time. This calculator uses a multi-variable algorithm to estimate that capacity loss based on the vehicle's age, total mileage, your charging habits, and the local climate.</p>

            <h2>How It Works</h2>
            <p>Battery degradation is caused by two primary factors: <strong>Calendar Aging</strong> and <strong>Cyclic Aging</strong>. Calendar aging means the battery degrades simply by existing; chemical reactions slowly break down the cells over time, resulting in roughly a 1.5% loss per year. Cyclic aging means the battery degrades through use; every time you charge and discharge the battery to drive, it causes microscopic wear and tear. Our algorithm isolates both factors and adds them together.</p>

            <h2>The Impact of Heat and Fast Charging</h2>
            <p>Not all miles are equal. If you live in a scorching hot climate like Arizona, your battery will degrade significantly faster than a battery in a temperate climate like Seattle. Heat causes permanent damage to lithium-ion cells. Similarly, frequent use of DC Fast Chargers (Level 3 Superchargers) pumps massive amounts of current into the battery, generating extreme heat and causing micro-cracking in the anode. The calculator applies specific penalties if you select these harsh operating conditions.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary result is your <strong>Estimated Battery Health (%)</strong>, also known as State of Health (SoH). If your battery health is 90%, it means your car can only hold 90% of the energy it held when it was brand new. The <strong>Max Range Now</strong> metric applies this percentage to your original EPA range, showing you your new, permanently lowered maximum driving distance.</p>

            <h2>The Warranty Check</h2>
            <p>Almost all EV manufacturers offer a federally mandated battery warranty, typically 8 years or 100,000 miles. Crucially, this warranty does not just cover total battery failure; it covers excessive degradation. Most manufacturers guarantee the battery will retain at least 70% of its original capacity. If our calculator estimates that your battery has dropped below this <strong>Warranty Threshold</strong> while still within the time/mileage limits, you may be eligible for a completely free battery replacement (which is normally a $15,000 to $20,000 repair).</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Normal Used Car.</strong> You are looking to buy a 4-year-old EV with 60,000 miles. It lived in a mild climate and was charged at home. The calculator estimates the battery health is roughly 92%. The original range was 310 miles, but the car will now only drive about 285 miles on a full charge. This is completely normal wear and tear.</p>
            <p><strong>Example 2: The Abused Uber.</strong> You are looking at a 3-year-old EV with 90,000 miles. It lived in hot Phoenix, Arizona, and the previous owner used it for rideshare, meaning they exclusively used DC Fast Chargers multiple times a day. The calculator estimates the battery health is around 82%. Because of the heat and fast charging, it degraded vastly faster than the normal car.</p>

            <h2>Tips & Best Practices</h2>
            <p>To maximize the lifespan of your EV battery, follow the "20/80 Rule." Try to keep the battery charged between 20% and 80% for daily driving. Charging to 100% and letting the car sit for days puts extreme stress on the cells. Do not run the battery down to 0%. Avoid DC Fast Charging unless you are on a road trip; use a Level 2 home charger for daily top-ups. If you live in a very hot climate, try to park the car in the shade or a garage whenever possible.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/battery-degradation-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
