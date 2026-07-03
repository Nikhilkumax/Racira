"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Zap, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface HorsepowerResults {
  flywheelHp: number;
  wheelHp: number;
  calculationMethod: string;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateHorsepower = (inputs: typeof DEFAULTS): HorsepowerResults => {
  const weight = parseFloat(inputs.weight);
  const et = parseFloat(inputs.et);
  const mph = parseFloat(inputs.mph);
  const method = inputs.method; // "et" or "mph"
  const drivetrain = inputs.drivetrain;

  if (isNaN(weight) || weight <= 0) {
    return { flywheelHp: 0, wheelHp: 0, calculationMethod: "", chartData: [], isError: true, errorMsg: "Vehicle weight must be greater than zero." };
  }

  let wheelHp = 0;
  let calculationMethod = "";

  if (method === "et") {
    if (isNaN(et) || et <= 0) {
      return { flywheelHp: 0, wheelHp: 0, calculationMethod: "", chartData: [], isError: true, errorMsg: "Elapsed Time must be greater than zero." };
    }
    // Hale's formula based on ET: HP = Weight / (ET / 5.825)^3
    wheelHp = weight / Math.pow((et / 5.825), 3);
    calculationMethod = "Calculated using Quarter Mile Elapsed Time (ET)";
  } else {
    if (isNaN(mph) || mph <= 0) {
      return { flywheelHp: 0, wheelHp: 0, calculationMethod: "", chartData: [], isError: true, errorMsg: "Trap Speed must be greater than zero." };
    }
    // Hale's formula based on MPH: HP = Weight * (MPH / 234)^3
    wheelHp = weight * Math.pow((mph / 234), 3);
    calculationMethod = "Calculated using Quarter Mile Trap Speed (MPH)";
  }

  // Drivetrain loss estimation to find Flywheel HP
  let lossMultiplier = 1.15; // default FWD
  if (drivetrain === "rwd") lossMultiplier = 1.18;
  if (drivetrain === "awd") lossMultiplier = 1.25;

  const flywheelHp = wheelHp * lossMultiplier;

  const chartData = [
    { name: "Wheel HP (WHP)", value: Math.round(wheelHp) },
    { name: "Flywheel HP (BHP)", value: Math.round(flywheelHp) }
  ];

  return {
    flywheelHp: Math.round(flywheelHp),
    wheelHp: Math.round(wheelHp),
    calculationMethod,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  weight: "3500",
  method: "mph", // 'et' or 'mph'
  et: "13.5",
  mph: "105",
  drivetrain: "rwd" // 'fwd', 'rwd', 'awd'
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
export default function HorsepowerCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<HorsepowerResults>(calculateHorsepower(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateHorsepower(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateHorsepower(DEFAULTS));
  };

  const faqs = [
    { question: "How does this calculator estimate horsepower?", answer: "This calculator uses the widely accepted Hale's formulas (also known as the Patrick Hale formulas), which are standard in the drag racing industry. These formulas use physics to determine how much energy (horsepower) is required to move a specific mass (vehicle weight) across a set distance (1/4 mile) in a specific amount of time or at a specific terminal velocity." },
    { question: "Is Trap Speed (MPH) or Elapsed Time (ET) more accurate?", answer: "Trap Speed (MPH) is generally considered much more accurate for estimating horsepower. Elapsed Time (ET) is heavily dependent on driver skill, tire traction, and the launch (60-foot time). A car with terrible tires will have a slow ET but will still cross the finish line at a high MPH, accurately reflecting its engine power." },
    { question: "What is the difference between Wheel HP and Flywheel HP?", answer: "Flywheel HP (or Brake Horsepower, BHP) is the power the engine makes at the crankshaft, which is the number manufacturers advertise. Wheel HP (WHP) is the actual power that makes it to the ground. A significant amount of power is lost to friction as it travels through the transmission, driveshaft, and axles. This is known as drivetrain loss." },
    { question: "How much power is lost in the drivetrain?", answer: "It varies by vehicle, but standard industry estimates are: 15% loss for Front-Wheel Drive (FWD), 18% loss for Rear-Wheel Drive (RWD), and 25% loss for All-Wheel Drive (AWD). AWD vehicles lose the most power because turning multiple differentials and transfer cases creates immense friction." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Horsepower Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Horsepower Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Estimate your vehicle's engine power using its physical weight and 1/4 mile drag strip performance data.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="w" label="Vehicle Weight (incl. Driver)" value={inputs.weight} onChange={(v: string) => handleChange("weight", v)} suffix="lbs" placeholder="3500" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Calculation Method</label>
              <div className="flex bg-muted/50 p-1 rounded-md border border-border h-10">
                <button type="button" onClick={() => handleChange("method", "mph")} className={`flex-1 text-sm font-semibold rounded ${inputs.method === "mph" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Trap Speed (MPH)</button>
                <button type="button" onClick={() => handleChange("method", "et")} className={`flex-1 text-sm font-semibold rounded ${inputs.method === "et" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Elapsed Time (ET)</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              {inputs.method === "mph" ? (
                <CompactInput id="mph" label="1/4 Mile Trap Speed" value={inputs.mph} onChange={(v: string) => handleChange("mph", v)} suffix="mph" placeholder="105" />
              ) : (
                <CompactInput id="et" label="1/4 Mile Elapsed Time" value={inputs.et} onChange={(v: string) => handleChange("et", v)} suffix="sec" placeholder="13.5" />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="drive" label="Drivetrain Type (for loss estimation)" value={inputs.drivetrain} onChange={(v: string) => handleChange("drivetrain", v)} options={[
                { label: "Front-Wheel Drive (FWD)", value: "fwd" },
                { label: "Rear-Wheel Drive (RWD)", value: "rwd" },
                { label: "All-Wheel Drive (AWD)", value: "awd" }
              ]} />
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
            
            <div className="text-xs text-muted-foreground mt-2 text-center">
              * Note: Weight must include the driver and fuel.
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Flywheel HP */}
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Estimated Flywheel HP</div>
                    <div className="flex items-end gap-3 mb-1">
                      <Zap className="h-10 w-10 text-primary mb-1" />
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.flywheelHp}</div>
                    </div>
                    <div className="text-sm font-medium mt-2 text-foreground">
                      Power at the engine crank (BHP).
                    </div>
                  </div>

                  {/* Wheel HP */}
                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Estimated Wheel HP</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.wheelHp}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">WHP</div>
                    </div>
                    <div className="text-sm font-medium mt-2 text-muted-foreground">
                      Power delivered to the asphalt.
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 border border-border rounded-lg p-4 shadow-sm text-center">
                  <div className="text-sm font-medium text-foreground">{results.calculationMethod}</div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Drivetrain Power Loss</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} width={120} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} HP`, 'Power']}
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))"} />
                          ))}
                        </Bar>
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
            <h2>How Does a Horsepower Calculator Work?</h2>
            <p>At its core, estimating a vehicle's horsepower from its track performance is a physics equation. The heavier a car is, and the faster it travels across a 1/4 mile distance, the more energy the engine must be producing. Our Horsepower Calculator uses the industry-standard Hale formulas to convert your real-world drag strip data (Weight and Trap Speed or Elapsed Time) into a highly accurate estimate of your engine's power output.</p>

            <h2>Trap Speed vs. Elapsed Time (ET)</h2>
            <p>If you have a timeslip from the drag strip, you will notice two main numbers: your Elapsed Time (e.g., 12.5 seconds) and your Trap Speed (e.g., 115 mph). When estimating horsepower, <strong>Trap Speed is significantly more accurate</strong>.</p>
            <ul>
              <li><strong>Why Trap Speed works:</strong> The speed you are traveling when you cross the finish line is a direct reflection of your power-to-weight ratio. It does not matter if you spun the tires at the starting line; your terminal velocity is almost purely dictated by engine power.</li>
              <li><strong>Why ET is flawed:</strong> Elapsed Time is heavily dependent on driver skill, tire grip, suspension setup, and reaction time. A car with 1,000 horsepower but terrible tires might run a slow 13.0-second ET, making the calculator think it only has 300 horsepower. However, it will cross the finish line at an extremely high Trap Speed, revealing its true power.</li>
            </ul>

            <h2>Wheel HP (WHP) vs. Flywheel HP (BHP)</h2>
            <p>When an automaker advertises a car as having "400 horsepower," they are measuring the power directly at the engine's crankshaft. This is known as Flywheel HP or Brake Horsepower (BHP). However, this is not the power that actually reaches the road.</p>
            <p>Before the power hits the asphalt, it must travel through the transmission, driveshaft, differentials, and axles. The friction in these mechanical components consumes a large amount of energy. The power that survives this journey is known as Wheel HP (WHP). A chassis dynamometer (dyno) measures WHP.</p>

            <h2>Understanding Drivetrain Loss</h2>
            <p>Our calculator asks for your drivetrain type so it can mathematically estimate your Flywheel HP by adding back the power lost to friction. Standard industry estimations for drivetrain power loss are:</p>
            <ul>
              <li><strong>Front-Wheel Drive (FWD):</strong> ~15% power loss. Because the engine and drive axles are compact and located in the front, the power journey is short and efficient.</li>
              <li><strong>Rear-Wheel Drive (RWD):</strong> ~18% power loss. The power must travel down the length of the vehicle through a heavy driveshaft, increasing rotational mass and friction.</li>
              <li><strong>All-Wheel Drive (AWD):</strong> ~25% power loss. AWD systems are heavy and complex. Turning multiple differentials and a transfer case creates immense friction, robbing the engine of significant power before it reaches the wheels.</li>
            </ul>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/horsepower-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
