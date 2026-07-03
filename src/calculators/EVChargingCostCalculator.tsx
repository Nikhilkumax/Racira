"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from "recharts";

// 1. TypeScript interfaces
interface EVChargeResults {
  totalCost: number;
  costPerMile: number;
  equivalentGasCost: number;
  savingsVsGas: number;
  milesAdded: number;
  timeToChargeHours: number;
  breakdown: {
    kwhAddedRaw: number;
    kwhAddedTotal: number;
    chargingLossKwh: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateEVCharging = (inputs: typeof DEFAULTS): EVChargeResults => {
  const batteryCapacity = parseFloat(inputs.batteryCapacity) || 0;
  const startPercent = parseFloat(inputs.startPercent) || 0;
  const endPercent = parseFloat(inputs.endPercent) || 0;
  const electricityRate = parseFloat(inputs.electricityRate) || 0;
  const efficiency = parseFloat(inputs.efficiency) || 0; // mi/kWh
  
  // Advanced
  const chargingLossPct = parseFloat(inputs.chargingLoss) / 100 || 0;
  const chargerPower = parseFloat(inputs.chargerPower) || 0; // kW
  const gasPrice = parseFloat(inputs.gasPrice) || 0;
  const gasMpg = parseFloat(inputs.gasMpg) || 0;

  if (batteryCapacity <= 0 || efficiency <= 0 || chargerPower <= 0) {
    return {
      totalCost: 0, costPerMile: 0, equivalentGasCost: 0, savingsVsGas: 0, milesAdded: 0, timeToChargeHours: 0,
      breakdown: { kwhAddedRaw: 0, kwhAddedTotal: 0, chargingLossKwh: 0 },
      isError: true, errorMsg: "Battery capacity, efficiency, and charger power must be greater than zero."
    };
  }

  if (startPercent >= endPercent) {
    return {
      totalCost: 0, costPerMile: 0, equivalentGasCost: 0, savingsVsGas: 0, milesAdded: 0, timeToChargeHours: 0,
      breakdown: { kwhAddedRaw: 0, kwhAddedTotal: 0, chargingLossKwh: 0 },
      isError: true, errorMsg: "End percentage must be greater than start percentage."
    };
  }

  // Calculate raw energy needed into the battery
  const percentToFill = (endPercent - startPercent) / 100;
  const kwhAddedRaw = batteryCapacity * percentToFill;

  // Account for charging losses (heat, AC/DC conversion overhead)
  // Total energy pulled from the wall
  const kwhAddedTotal = kwhAddedRaw / (1 - chargingLossPct);
  const chargingLossKwh = kwhAddedTotal - kwhAddedRaw;

  // Cost
  const totalCost = kwhAddedTotal * electricityRate;

  // Miles added
  const milesAdded = kwhAddedRaw * efficiency;

  // Cost per mile
  const costPerMile = totalCost / milesAdded;

  // Time to charge
  // Time = Energy / Power. But charging isn't perfectly linear. We'll add 10% overhead for tapering.
  const timeToChargeHours = (kwhAddedTotal / chargerPower) * 1.1;

  // Gas Comparison
  let equivalentGasCost = 0;
  if (gasPrice > 0 && gasMpg > 0) {
    const gallonsNeeded = milesAdded / gasMpg;
    equivalentGasCost = gallonsNeeded * gasPrice;
  }
  
  const savingsVsGas = equivalentGasCost > totalCost ? equivalentGasCost - totalCost : 0;

  return {
    totalCost,
    costPerMile,
    equivalentGasCost,
    savingsVsGas,
    milesAdded,
    timeToChargeHours,
    breakdown: {
      kwhAddedRaw,
      kwhAddedTotal,
      chargingLossKwh
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  batteryCapacity: "75", // typical Tesla Model 3 Long Range
  startPercent: "20",
  endPercent: "80",
  electricityRate: "0.16", // National average home rate
  efficiency: "4.0", // 4 miles per kWh is very good
  // Advanced
  chargingLoss: "10", // 10% is standard AC charging loss
  chargerPower: "9.6", // Standard 40A Level 2 home charger
  gasPrice: "3.50",
  gasMpg: "25"
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
export default function EVChargingCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<EVChargeResults>(calculateEVCharging(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateEVCharging(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateEVCharging(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  const formatTime = (hoursRaw: number) => {
    const hrs = Math.floor(hoursRaw);
    const mins = Math.round((hoursRaw - hrs) * 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  const barData = results.isError ? [] : [
    { name: "EV Charging Cost", value: results.totalCost, color: "#10b981" },
    { name: "Gas Equivalent", value: results.equivalentGasCost, color: "#ef4444" },
  ];

  const faqs = [
    { question: "How much does it cost to charge an EV at home?", answer: "At home, you pay the residential electricity rate, which averages $0.16 per kWh in the US. Charging a typical 75 kWh battery from 20% to 80% requires about 50 kWh (factoring in charging losses). At $0.16/kWh, this costs about $8.00 and provides roughly 180 miles of range." },
    { question: "Are Superchargers more expensive?", answer: "Yes, significantly. Public DC Fast Chargers (like Tesla Superchargers or Electrify America) typically charge between $0.35 to $0.55 per kWh. Charging that same 20% to 80% at a public station could cost $20 to $28, which is nearly triple the cost of charging at home, though often still cheaper than gas." },
    { question: "What are 'Charging Losses'?", answer: "When electricity flows from the wall into your car's battery, the conversion process generates heat, and the car's computers and cooling pumps must run. This means if your battery needs 45 kWh to reach its target, it might actually pull 50 kWh from the wall. You pay for the 50 kWh. Level 2 home charging typically loses 10%." },
    { question: "What does mi/kWh mean?", answer: "Miles per kilowatt-hour (mi/kWh) is the EV equivalent of Miles Per Gallon (MPG). It measures efficiency. A large electric truck might get 2.0 mi/kWh, while an aerodynamic sedan might get 4.0 mi/kWh. Higher is better." },
    { question: "Why does charging slow down above 80%?", answer: "Lithium-ion batteries charge rapidly when empty, but as they fill up, the charging rate must be drastically slowed down to prevent heat damage and preserve battery longevity. This is why EVs advertise charge times 'from 10% to 80%'. The final 20% can take as long as the first 80%." },
    { question: "Is it really cheaper than gas?", answer: "Almost always, if you charge at home. At national average rates, driving an EV costs about $0.04 to $0.05 per mile. A 25 MPG gas car at $3.50/gallon costs $0.14 per mile. If you exclusively use expensive public fast chargers, the costs become much closer." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "EV Charging Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EV Charging Cost Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Electricity Rate</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-4 text-primary font-bold text-lg">$</span>
                <input type="number" value={inputs.electricityRate} onChange={e => handleChange("electricityRate", e.target.value)} className="w-full h-full px-2 text-xl font-bold bg-transparent outline-none border-none text-foreground" step="0.01" />
                <span className="pr-4 text-primary font-bold text-sm uppercase">/ kWh</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="start-percent" label="Starting Charge" value={inputs.startPercent} onChange={(v: string) => handleChange("startPercent", v)} suffix="%" />
              <CompactInput id="end-percent" label="Target Charge" value={inputs.endPercent} onChange={(v: string) => handleChange("endPercent", v)} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="battery-capacity" label="Battery Capacity" value={inputs.batteryCapacity} onChange={(v: string) => handleChange("batteryCapacity", v)} suffix="kWh" tooltip="Check your owner's manual. Typically 50-100 kWh." />
              <CompactInput id="efficiency" label="Vehicle Efficiency" value={inputs.efficiency} onChange={(v: string) => handleChange("efficiency", v)} suffix="mi/kWh" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Time & Gas Comp) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="charger-power" label="Charger Power" value={inputs.chargerPower} onChange={(v: string) => handleChange("chargerPower", v)} suffix="kW" tooltip="L1 Wall Outlet = 1.4kW. L2 Home = 7-11kW. Supercharger = 150-250kW" />
                  <CompactInput id="charging-loss" label="Charging Loss" value={inputs.chargingLoss} onChange={(v: string) => handleChange("chargingLoss", v)} suffix="%" tooltip="Energy lost as heat during charging (typically 10-15% for AC)" />
                  <CompactInput id="gas-price" label="Local Gas Price" value={inputs.gasPrice} onChange={(v: string) => handleChange("gasPrice", v)} prefix="$" />
                  <CompactInput id="gas-mpg" label="Compare to MPG" value={inputs.gasMpg} onChange={(v: string) => handleChange("gasMpg", v)} suffix="mpg" />
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Cost to Charge</div>
                  <div className="text-5xl font-bold text-primary mb-1">{formatCurrency(results.totalCost)}</div>
                  <div className="text-sm text-muted-foreground">This session will add <strong>{Math.round(results.milesAdded)} miles</strong> of range.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Cost Per Mile</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.costPerMile)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Est. Charge Time</div>
                    <div className="text-lg font-bold text-foreground">{formatTime(results.timeToChargeHours)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Savings vs Gas</div>
                    <div className="text-lg font-bold text-emerald-600">+{formatCurrency(results.savingsVsGas)}</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Energy Breakdown</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Energy into Battery</span>
                      <span className="font-medium text-foreground">{results.breakdown.kwhAddedRaw.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Energy Lost (Heat/Conversion)</span>
                      <span className="font-medium text-amber-500">+{results.breakdown.chargingLossKwh.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Total Billed from Grid</span>
                      <span className="font-medium text-foreground">{results.breakdown.kwhAddedTotal.toFixed(1)} kWh</span>
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Gas vs EV Cost Comparison</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tickFormatter={(val) => `$${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} width={120} />
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} cursor={{fill: 'hsl(var(--muted)/0.5)'}} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Cost to drive the exact same {Math.round(results.milesAdded)} miles.</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an EV Charging Cost Calculator?</h2>
            <p>An EV Charging Cost Calculator takes the mystery out of "fueling" an electric vehicle. Unlike gas cars, where you look at a giant sign that clearly states $3.50 per gallon, the cost to charge an EV is largely invisible. It depends on your home utility rate, the size of your car's battery, and the efficiency of the vehicle itself. This calculator converts the abstract concepts of kilowatts and electrical efficiency into concrete dollars, cents, and miles, allowing you to accurately budget your transportation costs and compare them directly against gasoline.</p>

            <h2>How It Works</h2>
            <p>The calculation is based on simple physics. We determine the amount of energy you need by looking at your battery size and your target charge percentage. For example, charging a 75 kWh battery from 20% to 80% requires filling 60% of the battery, which is 45 kWh. We then apply a <strong>Charging Loss Penalty</strong>. Because converting AC power from your house into DC power for the battery generates waste heat, you actually pull more electricity from the wall than makes it into the battery. We multiply that total grid energy by your local <strong>Electricity Rate ($/kWh)</strong> to find your total cost.</p>

            <h2>Understanding Your Results</h2>
            <p>The <strong>Total Cost to Charge</strong> is the amount added to your monthly utility bill for this single charging session. <strong>Cost Per Mile</strong> is the ultimate metric for comparing EVs to gas cars. A highly efficient EV charging on a cheap overnight rate might cost $0.03 per mile. A standard gas car often costs $0.14 per mile. The <strong>Savings vs Gas</strong> metric calculates exactly how much money you kept in your pocket during this specific charging session by avoiding the gas pump.</p>

            <h2>Key Factors</h2>
            <p>Your <strong>Electricity Rate</strong> is the most critical variable. In the US, the national average is roughly $0.16/kWh. However, in places like California, rates can spike to $0.40/kWh or more during peak hours, significantly diminishing the cost advantages of an EV. <strong>Vehicle Efficiency (mi/kWh)</strong> is the EV equivalent of MPG. An aerodynamic Tesla Model 3 might achieve 4.5 mi/kWh, while a massive electric pickup truck might only achieve 2.0 mi/kWh, meaning the truck costs twice as much to drive the exact same distance.</p>

            <h2>Advanced Features</h2>
            <p>By opening the Advanced Options, you can model charging time. <strong>Charger Power</strong> dictates speed. A standard wall outlet (Level 1) provides a trickle of 1.4 kW, which could take 40 hours to charge a car. A dedicated 240V home charger (Level 2) provides 9.6 kW, completing the charge overnight. A public Supercharger (Level 3) can provide up to 250 kW, finishing the job in 30 minutes. You can also adjust your local <strong>Gas Price</strong> to ensure the "Savings vs Gas" calculation accurately reflects your specific city.</p>

            <h2>Practical Examples</h2>
            <p><strong>Example 1: The Cheap Night Rate.</strong> Mark has a 75 kWh battery. He charges from 20% to 80%. His utility company offers a cheap overnight EV rate of $0.08/kWh. Accounting for a 10% charging loss, he pulls 50 kWh from the grid. His total cost is just $4.00, and he gains 180 miles of range. That same 180 miles in a 25 MPG gas car at $3.50/gal would cost $25.20. Mark saves $21 in a single night.</p>
            <p><strong>Example 2: The Expensive Supercharger.</strong> Sarah is on a road trip. She stops at a public fast charger that bills at a premium rate of $0.48/kWh. She charges that same 20% to 80% on her 75 kWh battery. Because she is paying a premium for speed, her charging session costs $24.00. While still slightly cheaper than gas, her cost advantage is vastly reduced compared to charging at home.</p>

            <h2>Tips & Best Practices</h2>
            <p>To maximize your savings, check if your local utility provider offers a "Time of Use" (TOU) or specific EV charging rate. These programs offer incredibly cheap electricity if you schedule your car to charge automatically at 1:00 AM when grid demand is lowest. Also, avoid using expensive public fast chargers for your daily commute; they are designed for road trips and charge massive premiums for the convenience of speed.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ev-charging-cost-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
