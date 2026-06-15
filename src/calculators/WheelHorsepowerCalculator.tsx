"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Zap, RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface WHPResults {
  wheelHp: number;
  powerLost: number;
  lossPercentage: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateWHP = (inputs: typeof DEFAULTS): WHPResults => {
  const crankHp = parseFloat(inputs.crankHp);
  let lossPercentage = parseFloat(inputs.customLoss);

  if (inputs.drivetrain !== "custom") {
    if (inputs.drivetrain === "fwd") lossPercentage = 15;
    else if (inputs.drivetrain === "rwd") lossPercentage = 18;
    else if (inputs.drivetrain === "awd") lossPercentage = 25;
  }

  if (isNaN(crankHp) || crankHp <= 0) {
    return { wheelHp: 0, powerLost: 0, lossPercentage: 0, chartData: [], isError: true, errorMsg: "Engine Crank HP must be greater than zero." };
  }

  if (isNaN(lossPercentage) || lossPercentage < 0 || lossPercentage >= 100) {
    return { wheelHp: 0, powerLost: 0, lossPercentage: 0, chartData: [], isError: true, errorMsg: "Loss percentage must be between 0 and 99%." };
  }

  const powerLost = crankHp * (lossPercentage / 100);
  const wheelHp = crankHp - powerLost;

  const chartData = [
    { name: "Wheel HP (Reaches Road)", value: Math.round(wheelHp), fill: "hsl(var(--primary))" },
    { name: "Power Lost (Friction/Heat)", value: Math.round(powerLost), fill: "hsl(var(--destructive))" }
  ];

  return {
    wheelHp: Math.round(wheelHp),
    powerLost: Math.round(powerLost),
    lossPercentage,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  crankHp: "400",
  drivetrain: "rwd", // 'fwd', 'rwd', 'awd', 'custom'
  customLoss: "15"
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function WheelHorsepowerCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<WHPResults>(calculateWHP(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateWHP(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateWHP(DEFAULTS));
  };

  const faqs = [
    { question: "What is the difference between Brake HP and Wheel HP?", answer: "Brake Horsepower (BHP) is measured directly at the engine's crankshaft. This is the big number that automakers advertise in brochures because it is higher. Wheel Horsepower (WHP) is the actual power that makes it through the transmission, driveshaft, and axles to the tires. WHP is always lower than BHP due to friction." },
    { question: "Why do All-Wheel Drive (AWD) cars lose more power?", answer: "Power loss is entirely caused by mechanical friction. An AWD car has significantly more moving parts than a two-wheel drive car. The engine's power must travel through the transmission, into a transfer case, down two separate driveshafts, and through two heavy differentials before reaching the wheels. This massive amount of rotational friction consumes roughly 25% of the engine's power." },
    { question: "Can I reduce my drivetrain power loss?", answer: "Yes, but it is expensive. Power loss is caused by the physical weight (rotational mass) of the drivetrain components. By replacing heavy steel driveshafts with lightweight carbon fiber or aluminum shafts, and installing lightweight flywheels and rims, you reduce the rotational mass. This allows more engine power to reach the ground instead of being wasted spinning heavy metal parts." },
    { question: "Where does the 'lost' power go?", answer: "According to the laws of physics, energy cannot be destroyed. The horsepower 'lost' in the drivetrain is converted entirely into heat through mechanical friction. This is why transmissions and differentials require heavy synthetic gear oils to prevent them from melting under the extreme temperatures generated by this friction." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Wheel Horsepower Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wheel Horsepower Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Convert the manufacturer's advertised engine horsepower into actual power delivered to the wheels.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="crank" label="Advertised Engine HP (Crank/BHP)" value={inputs.crankHp} onChange={(v: string) => handleChange("crankHp", v)} suffix="HP" placeholder="400" />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="drive" label="Drivetrain Layout" value={inputs.drivetrain} onChange={(v: string) => handleChange("drivetrain", v)} options={[
                { label: "Front-Wheel Drive (FWD) ~15% Loss", value: "fwd" },
                { label: "Rear-Wheel Drive (RWD) ~18% Loss", value: "rwd" },
                { label: "All-Wheel Drive (AWD) ~25% Loss", value: "awd" },
                { label: "Custom Loss Percentage", value: "custom" }
              ]} />
            </div>

            {inputs.drivetrain === "custom" && (
              <div className="grid grid-cols-1 gap-4 mt-2 animate-fade-in-up">
                <CompactInput id="custom" label="Custom Drivetrain Loss" value={inputs.customLoss} onChange={(v: string) => handleChange("customLoss", v)} suffix="%" />
              </div>
            )}

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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Estimated Wheel Horsepower</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-7xl font-black text-primary tracking-tighter">{results.wheelHp}</div>
                    <div className="text-2xl font-bold text-primary mb-1">WHP</div>
                  </div>
                  <div className="text-sm font-medium mt-2 text-foreground">
                    Actual power reaching the asphalt.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Engine Crank HP</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.crankHp} BHP</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Drivetrain Loss</div>
                    <div className="text-2xl font-bold text-muted-foreground">{results.lossPercentage}%</div>
                  </div>
                  <div className="bg-destructive/5 border-2 border-destructive/20 rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-destructive uppercase font-bold mb-1">Power Lost</div>
                    <div className="text-2xl font-bold text-destructive">-{results.powerLost} HP</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Where Does The Power Go?</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Pie
                          data={results.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} HP`, 'Value']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What is Wheel Horsepower?</h2>
            <p>When you buy a car, the manufacturer advertises the engine's power output. For example, a Ford Mustang GT is advertised with 480 horsepower. However, this is <strong>Brake Horsepower (BHP)</strong>, measured directly at the engine's crankshaft in a laboratory setting with no transmission attached. Wheel Horsepower (WHP) is the amount of power that actually makes it down to the asphalt. Our Wheel Horsepower Calculator converts factory marketing numbers into realistic, road-ready figures.</p>

            <h2>Understanding Drivetrain Power Loss</h2>
            <p>Between the engine and the road sits a massive amount of heavy machinery: the transmission, the driveshaft, differentials, axles, and heavy wheels. Every time gears mesh and heavy metal shafts are forced to spin, energy is consumed by friction and rotational mass. This parasitic drag is known as "drivetrain loss."</p>

            <h2>Industry Standard Loss Percentages</h2>
            <p>Drivetrain loss is not a fixed number; it scales as a percentage of total engine output. The automotive industry generally accepts the following baseline estimates:</p>
            <ul>
              <li><strong>Front-Wheel Drive (FWD) - 15% Loss:</strong> The most efficient layout. The engine is mounted transversely directly above the drive axles. The power only has to make a short trip through the transaxle.</li>
              <li><strong>Rear-Wheel Drive (RWD) - 18% Loss:</strong> The power must be routed out the back of the transmission, travel down a heavy steel or aluminum driveshaft running the length of the car, and then take a 90-degree turn through the rear differential.</li>
              <li><strong>All-Wheel Drive (AWD) - 25% Loss:</strong> The least efficient layout. Power is sent through the transmission, into a central transfer case, down two separate driveshafts, and through two heavy differentials. The massive amount of friction easily robs a quarter of the engine's power.</li>
            </ul>

            <h2>Why Dynos Read Different Numbers</h2>
            <p>If you strap your car to a chassis dynamometer (a "dyno"), it will measure your true Wheel Horsepower. However, different brands of dynos read differently. A Mustang Dyno is notorious for reading very low ("heartbreaker dyno") because it actively loads the rollers to simulate aerodynamic drag and vehicle weight. A Dynojet is an inertia-based dyno that spins freely, resulting in much higher, more flattering WHP numbers.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wheel-horsepower-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
