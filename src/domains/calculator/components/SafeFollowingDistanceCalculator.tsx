"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Navigation2, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface FollowingResults {
  safeDistanceFt: number;
  safeDistanceM: number;
  carLengths: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateFollowing = (inputs: typeof DEFAULTS): FollowingResults => {
  const speedMph = parseFloat(inputs.speed);
  const secondsRule = parseFloat(inputs.secondsRule);
  const carLength = parseFloat(inputs.carLength);

  if (isNaN(speedMph) || speedMph <= 0 || isNaN(secondsRule) || secondsRule <= 0 || isNaN(carLength) || carLength <= 0) {
    return {
      safeDistanceFt: 0, safeDistanceM: 0, carLengths: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  // Convert Speed from MPH to ft/s (1 mph = 1.46667 ft/s)
  const speedFps = speedMph * 1.46667;

  // Safe Distance (ft) = Speed (ft/s) * Seconds Rule
  const safeDistanceFt = speedFps * secondsRule;
  const safeDistanceM = safeDistanceFt * 0.3048;

  // Car Lengths = Safe Distance (ft) / Car Length (ft)
  const carLengths = safeDistanceFt / carLength;

  // Generate chart data: Safe distance from 20 to 100 MPH based on the selected seconds rule
  const chartData = [];
  const schedule = [];
  
  for (let s = 20; s <= 100; s += 10) {
    const sFps = s * 1.46667;
    const dist2s = sFps * 2;
    const dist3s = sFps * 3;
    const dist4s = sFps * 4;
    
    chartData.push({
      Speed: s,
      "Safe Distance (ft)": Math.round(sFps * secondsRule)
    });

    if (s % 20 === 0) {
      schedule.push({
        speed: s,
        dist2: Math.round(dist2s),
        dist3: Math.round(dist3s),
        dist4: Math.round(dist4s)
      });
    }
  }

  return {
    safeDistanceFt: Number(safeDistanceFt.toFixed(1)),
    safeDistanceM: Number(safeDistanceM.toFixed(1)),
    carLengths: Number(carLengths.toFixed(1)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  speed: "60",
  secondsRule: "3.0", // 3-second rule is standard
  carLength: "15.0"   // Average sedan length in feet
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
export default function SafeFollowingDistanceCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<FollowingResults>(calculateFollowing(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateFollowing(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateFollowing(DEFAULTS));
  };

  const faqs = [
    { question: "What is the 3-Second Rule?", answer: "The 3-second rule is a universally recommended guideline by traffic safety organizations. It states that you should always leave at least three seconds of travel time between your vehicle and the vehicle directly in front of you. Because it is time-based, the physical distance automatically scales up as your speed increases, ensuring you always have enough room to stop safely." },
    { question: "How do I measure 3 seconds while driving?", answer: "Wait for the rear bumper of the car in front of you to pass a stationary object on the side of the road, such as a road sign, a tree, or an overpass shadow. Once they pass it, begin counting: 'One-thousand-one, one-thousand-two, one-thousand-three.' If your front bumper passes that same object before you finish counting, you are following too closely." },
    { question: "When should I increase the following distance?", answer: "The 3-second rule only applies to perfect driving conditions: dry roads, clear daylight, and an alert driver. You should increase to 4 seconds during heavy rain or when driving at night. You should increase to 6+ seconds when driving on snow or ice, or when following a massive semi-truck that blocks your forward visibility." },
    { question: "Why is tailgating so dangerous?", answer: "Tailgating physically removes your ability to react. The average driver takes 1.5 seconds just to process a hazard and move their foot to the brake pedal. If you are tailgating at 60 MPH with only a 1-second gap, and the car in front of you slams on their brakes, you will violently rear-end them before your foot ever touches the brake pedal. It is a mathematical certainty." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Safe Following Distance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Safe Following Distance Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate the exact physical distance you need to maintain behind the car in front of you to prevent a rear-end collision.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="speed" label="Vehicle Speed" value={inputs.speed} onChange={(v: string) => handleChange("speed", v)} suffix="MPH" placeholder="60" />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="rule" label="Safety Guideline" value={inputs.secondsRule} onChange={(v: string) => handleChange("secondsRule", v)} options={[
                { label: "2 Seconds (Absolute Minimum / City)", value: "2.0" },
                { label: "3 Seconds (Standard Highway Rule)", value: "3.0" },
                { label: "4 Seconds (Rain / Night / Heavy Traffic)", value: "4.0" },
                { label: "6 Seconds (Snow / Ice / Towing)", value: "6.0" }
              ]} />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="car" label="Average Car Length (For Visualizing)" value={inputs.carLength} onChange={(v: string) => handleChange("carLength", v)} suffix="ft" placeholder="15.0" />
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
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Safe Gap Distance</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.safeDistanceFt}</div>
                      <div className="text-2xl font-bold text-primary mb-1">ft</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Visual Gap Estimate</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.carLengths}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">car lengths</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Current Speed</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.speed} MPH</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Time Buffer</div>
                    <div className="text-2xl font-bold text-blue-500">{inputs.secondsRule}s</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Metric Gap</div>
                    <div className="text-2xl font-bold text-emerald-500">{results.safeDistanceM} m</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Required Gap Distance vs Speed</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Speed" tickFormatter={(val) => `${val} MPH`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} ft`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={parseFloat(inputs.speed)} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: 'hsl(var(--primary))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} ft`, 'Safe Gap']}
                          labelFormatter={(label) => `Speed: ${label} MPH`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Area type="monotone" dataKey="Safe Distance (ft)" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorDist)" strokeWidth={3} activeDot={{r: 6}} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">This shows the linear expansion of the required safety gap as your speed increases.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Safety Guideline Comparison</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Speed (MPH)</th>
                          <th className="px-4 py-3 font-semibold text-right text-orange-500">2-Second Gap</th>
                          <th className="px-4 py-3 font-semibold text-right text-primary">3-Second Gap</th>
                          <th className="px-4 py-3 font-semibold text-right text-emerald-600 dark:text-emerald-500">4-Second Gap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.speed} className={`hover:bg-muted/20 transition-colors ${row.speed == parseFloat(inputs.speed) ? 'bg-primary/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.speed} MPH</td>
                            <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-500">{row.dist2} ft</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.dist3} ft</td>
                            <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-500">{row.dist4} ft</td>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Flaw of "Car Lengths"</h2>
            <p>For decades, driving instructors taught students to leave "one car length of space for every 10 MPH of speed." While this sounds like decent advice, it is incredibly dangerous in practice for two reasons. First, human beings are terrible at judging absolute distances while moving. Estimating "six car lengths" on an empty highway is nearly impossible. Second, modern safety engineering has proven that the one-car-length rule simply does not provide enough physical space to stop at high speeds.</p>

            <h2 className="text-2xl font-bold mb-3">Why the Time-Based Rule is Superior</h2>
            <p>Instead of trying to estimate distance, traffic safety organizations universally recommend a time-based system: <strong>The 3-Second Rule</strong>. </p>
            <p>The brilliance of a time-based rule is that it automatically scales with your velocity. If you are driving 30 MPH, a 3-second gap equals roughly 130 feet of space. If you speed up to 60 MPH, the 3-second gap automatically doubles to 264 feet. You never have to do complex math in your head or try to visualize car lengths; you simply maintain a 3-second buffer at all times.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of a Rear-End Collision</h2>
            <p>To understand why 3 seconds is the magic number, we must look at the two phases of stopping: <strong>Reaction Time</strong> and <strong>Braking Time</strong>. </p>
            <p>When the car in front of you slams on its brakes, it takes the average, alert driver roughly 1.5 seconds just to process the danger and move their foot to the brake pedal. During this 1.5-second window, your car is hurtling forward completely unbraked. By leaving a 3-second gap, you dedicate half of that buffer (1.5s) to your reaction time, ensuring that by the time you press the brakes, you still have an adequate physical cushion to match the deceleration of the car in front of you.</p>

            <h2 className="text-2xl font-bold mb-3">When to Increase the Gap</h2>
            <p>The 3-second rule assumes perfect conditions: dry pavement, good brakes, and an alert driver. You must increase this gap when conditions deteriorate:</p>
            <ul>
              <li><strong>4 Seconds:</strong> Use during rain, driving at night, or when you are fatigued. Water drastically reduces tire friction, increasing the physical braking distance required.</li>
              <li><strong>6 Seconds:</strong> Use when driving on snow/ice, when towing a heavy trailer, or when following a large commercial truck. Semi-trucks block your forward visibility, meaning you cannot see hazards ahead of them. If the truck swerves to avoid a massive pothole, a 3-second gap will not give you enough time to react.</li>
            </ul>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/safe-following-distance-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Safe Following Distance Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Safe Following Distance Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Safe Following Distance Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Safe Following Distance Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Safe Following Distance Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
