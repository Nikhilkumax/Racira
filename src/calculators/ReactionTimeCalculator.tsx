"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Clock, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

// 1. TypeScript interfaces
interface ReactionResults {
  distanceFt: number;
  distanceM: number;
  timeToImpactSec: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateReaction = (inputs: typeof DEFAULTS): ReactionResults => {
  const speedMph = parseFloat(inputs.speed);
  const reactionTime = parseFloat(inputs.reactionTime);

  if (isNaN(speedMph) || speedMph <= 0 || isNaN(reactionTime) || reactionTime < 0) {
    return {
      distanceFt: 0, distanceM: 0, timeToImpactSec: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "Speed and Reaction Time must be valid positive numbers."
    };
  }

  // Distance traveled during reaction time
  // Speed in ft/s = Speed in MPH * 1.46667
  const speedFps = speedMph * 1.46667;
  const distanceFt = speedFps * reactionTime;
  const distanceM = distanceFt * 0.3048;

  // Generate chart data comparing Alert (1.5s), Distracted (3.0s), and Current
  const chartData = [];
  const schedule = [];
  
  for (let s = 20; s <= 100; s += 10) {
    const fps = s * 1.46667;
    const alertDist = fps * 1.5;
    const distDist = fps * 3.0;
    const userDist = fps * reactionTime;
    
    chartData.push({
      Speed: s,
      "Alert Driver (1.5s)": Math.round(alertDist),
      "Distracted Driver (3.0s)": Math.round(distDist),
      "Your Reaction Time": Math.round(userDist)
    });

    if (s % 20 === 0) {
      schedule.push({
        speed: s,
        alert: Math.round(alertDist),
        distracted: Math.round(distDist),
        user: Math.round(userDist)
      });
    }
  }

  return {
    distanceFt: Number(distanceFt.toFixed(1)),
    distanceM: Number(distanceM.toFixed(1)),
    timeToImpactSec: reactionTime, // Essentially just the input
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  speed: "60",
  reactionTime: "1.5"
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, step }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step={step || "any"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function ReactionTimeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<ReactionResults>(calculateReaction(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateReaction(newInputs);
    if (!r.isError) setResults(r);
  };

  const handlePreset = (val: string) => {
    handleChange("reactionTime", val);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateReaction(DEFAULTS));
  };

  const faqs = [
    { question: "What is Perception-Reaction Time?", answer: "Perception-Reaction Time (PRT) is the total amount of time it takes for a driver to see a hazard, process the danger in their brain, decide to stop, and physically move their foot to the brake pedal. Traffic engineers use 1.5 seconds as the standard PRT for an alert driver, though complex situations can push this to 2.5 seconds." },
    { question: "Why is texting and driving so dangerous?", answer: "If you take your eyes off the road to look at a text message for just 3 seconds while driving 60 MPH, your vehicle will travel over 260 feet completely blind. That is nearly the length of a football field. If a car stops in front of you during those 3 seconds, a crash is physically unavoidable." },
    { question: "How does alcohol affect reaction time?", answer: "Alcohol is a central nervous system depressant. It physically slows down the rate at which your brain can process visual information and send commands to your muscles. An intoxicated driver's reaction time can easily double or triple, meaning they will travel hundreds of extra feet before even attempting to apply the brakes." },
    { question: "Is Reaction Distance the same as Stopping Distance?", answer: "No. Reaction Distance is the distance your car travels BEFORE you press the brakes. Once your foot presses the brake pedal, you enter the Braking Distance phase. Total Stopping Distance is the sum of both the Reaction Distance and the Braking Distance combined." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Reaction Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reaction Time Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate exactly how many feet your vehicle travels while your brain processes a hazard and moves your foot to the brake pedal.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="speed" label="Vehicle Speed" value={inputs.speed} onChange={(v: string) => handleChange("speed", v)} suffix="MPH" placeholder="60" />
              <CompactInput id="react" label="Reaction Time" value={inputs.reactionTime} onChange={(v: string) => handleChange("reactionTime", v)} suffix="sec" step="0.1" placeholder="1.5" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-2 border-b border-border/50 pb-1">Quick Presets</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button type="button" onClick={() => handlePreset("1.0")} className="text-xs py-2 px-3 border border-border rounded-md hover:bg-secondary transition-colors text-left font-medium">F1 Driver (1.0s)</button>
              <button type="button" onClick={() => handlePreset("1.5")} className="text-xs py-2 px-3 border border-border rounded-md hover:bg-secondary transition-colors text-left font-medium">Alert Driver (1.5s)</button>
              <button type="button" onClick={() => handlePreset("2.5")} className="text-xs py-2 px-3 border border-border rounded-md hover:bg-secondary transition-colors text-left font-medium">Tired/Complex (2.5s)</button>
              <button type="button" onClick={() => handlePreset("4.0")} className="text-xs py-2 px-3 border border-border rounded-md hover:bg-secondary transition-colors text-left font-medium">Texting (4.0s)</button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-500/10 border-l-4 border-orange-500 rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-500 mb-2 font-bold">Blind Travel Distance</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-orange-600 dark:text-orange-500 tracking-tighter">{results.distanceFt}</div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-500 mb-1">ft</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Metric Distance</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.distanceM}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">meters</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Speed</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.speed} MPH</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Reaction Time</div>
                    <div className="text-2xl font-bold text-blue-500">{inputs.reactionTime}s</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Status</div>
                    <div className={`text-xl font-bold ${parseFloat(inputs.reactionTime) <= 1.5 ? 'text-emerald-500' : 'text-destructive'}`}>
                      {parseFloat(inputs.reactionTime) <= 1.5 ? "Alert" : "Dangerous"}
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Reaction Distance Comparison</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Speed" tickFormatter={(val) => `${val} MPH`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} ft`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={parseFloat(inputs.speed)} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`${value} ft`, name]}
                          labelFormatter={(label) => `Speed: ${label} MPH`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Line type="monotone" name="Alert Driver (1.5s)" dataKey="Alert Driver (1.5s)" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                        <Line type="monotone" name="Distracted Driver (3.0s)" dataKey="Distracted Driver (3.0s)" stroke="hsl(var(--destructive))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">Notice the massive gap in distance traveled before the brakes are even applied.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Distance Matrix by Speed</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Speed (MPH)</th>
                          <th className="px-4 py-3 font-semibold text-right">Alert (1.5s)</th>
                          <th className="px-4 py-3 font-semibold text-right text-destructive">Distracted (3.0s)</th>
                          <th className="px-4 py-3 font-semibold text-right text-orange-500">Your Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.speed} className={`hover:bg-muted/20 transition-colors ${row.speed == parseFloat(inputs.speed) ? 'bg-orange-500/10 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.speed} MPH</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.alert} ft</td>
                            <td className="px-4 py-3 text-right text-destructive">{row.distracted} ft</td>
                            <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-500 font-bold">{row.user} ft</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            <h2>The Physics of Perception</h2>
            <p>We often think of cars stopping instantaneously when we press the brake pedal, but we forget the critical human element involved before the brakes even engage. When a deer jumps into the road, your vehicle does not instantly begin slowing down. A complex biological chain reaction must occur first.</p>
            <p>Traffic engineers call this <strong>Perception-Reaction Time (PRT)</strong>. First, your eyes must capture the image of the deer. Second, your brain must process that the image represents a dangerous hazard. Third, your brain must calculate a solution (stop the car). Finally, your brain sends a neurological signal down to your leg muscles, instructing them to lift off the accelerator and slam onto the brake pedal. This entire process takes the average, alert driver 1.5 seconds.</p>

            <h2>The Terrifying Reality of Speed</h2>
            <p>While 1.5 seconds sounds incredibly fast, a vehicle traveling at highway speeds covers a massive amount of physical ground in that tiny window of time. To calculate how far a vehicle travels per second, you multiply the MPH by 1.46667 to convert it into Feet Per Second (fps).</p>
            <ul>
              <li><strong>At 30 MPH:</strong> You are traveling 44 feet per second. In 1.5 seconds, you will travel 66 feet before touching the brakes.</li>
              <li><strong>At 60 MPH:</strong> You are traveling 88 feet per second. In 1.5 seconds, you will travel 132 feet. That is nearly half the length of a football field.</li>
              <li><strong>At 80 MPH:</strong> You are traveling 117 feet per second. You will travel 176 feet completely "blind" before the brake pads even begin to squeeze the rotors.</li>
            </ul>

            <h2>The Distracted Driving Multiplier</h2>
            <p>The math above assumes the driver is staring directly at the road with both hands on the wheel. If a driver takes their eyes off the road to look down at a text message, their reaction time easily doubles or triples. A 3.0-second reaction time at 60 MPH means the vehicle will travel 264 feet without slowing down. If traffic comes to a sudden stop 200 feet ahead of a texting driver, a rear-end collision is mathematically unavoidable, regardless of how good the vehicle's brakes are.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reaction-time-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
