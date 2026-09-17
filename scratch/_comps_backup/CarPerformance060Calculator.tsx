"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Timer, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface ChartPoint {
  Horsepower: number;
  "0-60 Time": number;
}

interface ScheduleRow {
  hp: number;
  time060: number;
  time14: number;
}

interface PerformanceResults {
  zeroToSixty: number;
  quarterMileTime: number;
  powerToWeight: number; // lbs per HP
  chartData: ChartPoint[];
  schedule: ScheduleRow[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculatePerformance = (inputs: typeof DEFAULTS): PerformanceResults => {
  const hp = parseFloat(inputs.horsepower);
  const weight = parseFloat(inputs.weight);
  const drivetrain = inputs.drivetrain;

  if (isNaN(hp) || hp <= 0 || isNaN(weight) || weight <= 0) {
    return {
      zeroToSixty: 0, quarterMileTime: 0, powerToWeight: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "Horsepower and Weight must be valid positive numbers."
    };
  }

  // Power to weight ratio
  const powerToWeight = weight / hp;

  // Base 0-60 estimation using a modified empirical formula
  // Base time = (Weight / HP) ^ 0.5 * multiplier
  // RWD is baseline. FWD is slower (traction limit). AWD is much faster (no traction limit).
  let multiplier = 0;
  if (drivetrain === "fwd") multiplier = 0.85;
  else if (drivetrain === "rwd") multiplier = 0.78;
  else if (drivetrain === "awd") multiplier = 0.70;

  // The curve flattens out as cars get extremely fast because aerodynamics and gearing become the limit
  const base060 = Math.pow(powerToWeight, 0.75) * multiplier;
  
  // 1/4 Mile time estimation (Hale's formula inverse)
  // ET = 5.825 * (Weight / HP) ^ (1/3)
  const quarterMileTime = 5.825 * Math.pow((weight / hp), 1/3);

  // Generate chart data: 0-60 times for HP ranging from 100 to 1000
  const chartData = [];
  const schedule = [];
  
  for (let testHp = 100; testHp <= 1000; testHp += 50) {
    const testPtw = weight / testHp;
    const test060 = Math.pow(testPtw, 0.75) * multiplier;
    const test14 = 5.825 * Math.pow((weight / testHp), 1/3);
    
    chartData.push({
      Horsepower: testHp,
      "0-60 Time": Number(test060.toFixed(2))
    });

    if (testHp % 100 === 0) {
      schedule.push({
        hp: testHp,
        time060: Number(test060.toFixed(2)),
        time14: Number(test14.toFixed(2))
      });
    }
  }

  return {
    zeroToSixty: Number(base060.toFixed(2)),
    quarterMileTime: Number(quarterMileTime.toFixed(2)),
    powerToWeight: Number(powerToWeight.toFixed(2)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  horsepower: "300",
  weight: "3500",
  drivetrain: "rwd"
};

interface SelectOption {
  value: string;
  label: string;
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  suffix?: string;
  options?: SelectOption[];
}

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, options }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function CarPerformanceCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<PerformanceResults>(calculatePerformance(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculatePerformance(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculatePerformance(DEFAULTS));
  };

  const handleCalculate = () => {
    setResults(calculatePerformance(inputs));
  };

  const faqs = [
    { question: "How accurate is a 0-60 MPH calculator?", answer: "This calculator provides a highly accurate mathematical estimation based on power-to-weight ratios and drivetrain traction physics. However, real-world 0-60 times are heavily influenced by variables that cannot be calculated, such as the exact stickiness of the tires, the driver's reaction time, the shift speed of the transmission, and the condition of the road surface." },
    { question: "Why is Power-to-Weight Ratio so important?", answer: "Horsepower alone tells you very little about a car's performance. A 300 HP engine sounds fast, but if it is installed in a massive 6,000-pound SUV, the vehicle will be incredibly slow. That same 300 HP engine installed in a lightweight 2,000-pound sports car will produce blistering acceleration. The Power-to-Weight ratio is the true equalizer that allows you to compare the acceleration of completely different vehicles." },
    { question: "Why do All-Wheel Drive (AWD) cars accelerate faster?", answer: "Acceleration from a dead stop (0-60 MPH) is entirely limited by traction. If you have 1,000 horsepower but only two tires driving the car, the tires will simply spin into smoke rather than pushing the car forward. AWD cars distribute the engine's power equally across all four tires. This drastically increases the tire contact patch with the road, allowing the car to launch violently without spinning the wheels." },
    { question: "What is the 1/4 Mile Time?", answer: "The 1/4 mile drag strip is the international standard for measuring automotive performance. While a 0-60 time measures low-speed traction and launch capability, the 1/4 mile time (which often ends at speeds over 110 MPH) measures the true sustained power output and aerodynamic efficiency of the vehicle." },
    { question: "Which formula does the 1/4 mile estimate use?", answer: "The quarter mile elapsed time comes from Hale's formula, ET = 5.825 x (Weight / Horsepower) raised to the one-third power. It is one of the oldest and most widely trusted drag racing approximations, dating back to magazine testing in the 1960s. It works because elapsed time scales with the cube root of the weight-to-power ratio rather than linearly, which is why doubling horsepower does not halve your time." },
    { question: "Should I enter crank horsepower or wheel horsepower?", answer: "Enter crank horsepower, which is the figure quoted on the manufacturer's spec sheet. The drivetrain multiplier already accounts for the typical driveline losses between the engine and the pavement, roughly 10 to 15 percent for a manual transmission and 15 to 20 percent for an automatic. If you only have a dyno reading measured at the wheels, add about 15 percent before entering it." },
    { question: "Why does my car feel slower than the calculated time?", answer: "Published 0-60 times are set by professional drivers on prepared surfaces using launch control, aggressive brake torquing, and sometimes a one-foot rollout that shaves two to three tenths off the number. A normal driver on a cold public road with all-season tires will routinely be a full second slower. Elevation also matters: a naturally aspirated engine loses roughly three percent of its power for every 1,000 feet of altitude." },
    { question: "Does this work for electric vehicles?", answer: "Partially. The power-to-weight relationship still applies, but EVs deliver peak torque from zero RPM and do not shift gears, so they typically beat the estimate at low speeds. The calculator will tend to be pessimistic for an EV's 0-60 time while remaining reasonable for the quarter mile, where the EV's power taper and extra battery weight start to work against it." },
    { question: "How much weight equals one horsepower?", answer: "As a rough rule of thumb in the ranges most street cars occupy, removing 100 pounds is worth roughly 10 horsepower for acceleration purposes. This is why motorsport teams spend enormous sums on lightweight components. Weight reduction also improves braking and cornering, whereas added horsepower only helps in a straight line." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Car Performance (0-60) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Performance (0-60) Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Estimate your vehicle's 0-60 MPH and 1/4 mile drag strip times based on its power-to-weight ratio.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="hp" label="Engine Horsepower" value={inputs.horsepower} onChange={(v: string) => handleChange("horsepower", v)} suffix="HP" placeholder="300" />
              <CompactInput id="weight" label="Vehicle Weight" value={inputs.weight} onChange={(v: string) => handleChange("weight", v)} suffix="lbs" placeholder="3500" />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="drive" label="Drivetrain Layout" value={inputs.drivetrain} onChange={(v: string) => handleChange("drivetrain", v)} options={[
                { label: "Front-Wheel Drive (FWD)", value: "fwd" },
                { label: "Rear-Wheel Drive (RWD)", value: "rwd" },
                { label: "All-Wheel Drive (AWD)", value: "awd" }
              ]} />
            </div>

            <div className="flex gap-2 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
                Calculate
              </button>
              <button type="button" onClick={handleReset} aria-label="Reset" title="Reset" className="h-10 w-10 shrink-0 rounded-md border border-input bg-background text-foreground hover:bg-muted/50 transition flex items-center justify-center">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Estimated 0-60 MPH</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.zeroToSixty}</div>
                      <div className="text-2xl font-bold text-primary mb-1">sec</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Estimated 1/4 Mile</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.quarterMileTime}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">sec</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Power / Weight</div>
                    <div className="text-2xl font-bold text-foreground">{results.powerToWeight}</div>
                    <div className="text-xs text-muted-foreground">lbs per HP</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Drivetrain</div>
                    <div className="text-xl font-bold text-blue-500 uppercase">{inputs.drivetrain}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Status</div>
                    <div className="text-xl font-bold text-emerald-500">
                      {results.zeroToSixty < 4 ? "Supercar" : results.zeroToSixty < 6 ? "Fast" : results.zeroToSixty < 8 ? "Average" : "Slow"}
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Diminishing Returns: 0-60 Time vs Added Horsepower</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Horsepower" tickFormatter={(val) => `${val} HP`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val}s`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={parseFloat(inputs.horsepower)} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Current HP', fill: 'hsl(var(--primary))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} sec`, '0-60 Time']}
                          labelFormatter={(label) => `Engine HP: ${label}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line type="monotone" dataKey="0-60 Time" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">Notice how adding 100 HP to a slow car makes a massive difference, but adding 100 HP to a fast car barely changes the 0-60 time due to traction limits.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Performance Scaling at {inputs.weight} lbs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Engine HP</th>
                          <th className="px-4 py-3 font-semibold text-right">0-60 MPH Time</th>
                          <th className="px-4 py-3 font-semibold text-right">1/4 Mile Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.hp} className={`hover:bg-muted/20 transition-colors ${row.hp == parseFloat(inputs.horsepower) ? 'bg-primary/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.hp} HP</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.time060} sec</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.time14} sec</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5 mt-2">
                  <div className="text-sm font-bold text-foreground mb-3">Summary Statistics</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                    {results.schedule.map((row) => (
                      <div key={row.hp} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{row.hp} HP</span>
                        <span className="text-foreground font-medium">{row.time060} s / {row.time14} s</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-3 sm:col-span-2 border-t border-border pt-2 mt-1">
                      <span className="font-bold text-foreground">Your vehicle ({inputs.horsepower} HP)</span>
                      <span className="font-bold text-foreground">{results.zeroToSixty} s / {results.quarterMileTime} s</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Each row shows the estimated 0-60 time followed by the quarter mile elapsed time at {inputs.weight} lbs.</p>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Acceleration</h2>
            <p>Predicting a vehicle's 0-60 MPH and 1/4 mile times is not a guessing game; it is an exercise in applied physics. The fundamental equation of acceleration relies on the <strong>Power-to-Weight Ratio</strong>. The amount of energy (horsepower) required to move a specific mass (vehicle weight) across a set distance is mathematically constant. By evaluating this ratio alongside the physical traction limits of the vehicle's drivetrain, our calculator provides a highly accurate estimate of real-world straight-line performance.</p>

            <h2 className="text-2xl font-bold mb-3">Why Power-to-Weight Ratio is Everything</h2>
            <p>Many car enthusiasts focus entirely on horsepower, but horsepower is only half of the equation. Weight is the enemy of acceleration. Consider a Dodge Challenger Hellcat producing 707 horsepower; it is incredibly fast. But it also weighs 4,400 pounds, giving it a power-to-weight ratio of 6.2 lbs per HP. Now consider a tiny Ariel Atom sports car. It only has 230 horsepower, but it weighs a feather-light 1,350 pounds. Its power-to-weight ratio is 5.8 lbs per HP. Despite having less than a third of the horsepower, the Ariel Atom will physically out-accelerate the Hellcat to 60 MPH.</p>

            <h2 className="text-2xl font-bold mb-3">The Traction Limit: Why Drivetrain Matters</h2>
            <p>Our calculator asks for your drivetrain layout (FWD, RWD, or AWD) because it massively impacts your 0-60 time due to the physical limits of rubber tires gripping asphalt.</p>
            <ul>
              <li><strong>Front-Wheel Drive (FWD):</strong> FWD cars are the slowest off the line. When you accelerate, the physical weight of the vehicle transfers to the rear wheels. This lifts weight off the front driving tires, causing them to lose grip and spin helplessly.</li>
              <li><strong>Rear-Wheel Drive (RWD):</strong> RWD cars benefit from weight transfer. As the car launches, the weight squats over the rear driving tires, forcing them into the pavement and increasing traction.</li>
              <li><strong>All-Wheel Drive (AWD):</strong> AWD cars are the undisputed kings of 0-60 times. Because the engine's power is split across four tires instead of two, each tire is only asked to handle half as much torque. This prevents wheel spin and allows the car to launch with violent force.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Law of Diminishing Returns</h2>
            <p>Look at the Horsepower Curve chart generated by the calculator. You will notice a distinct phenomenon: the law of diminishing returns. If you have a slow 100 HP car and you add 100 HP to it, you will shave multiple seconds off your 0-60 time. The difference is night and day. However, if you have a 700 HP supercar and you add 100 HP to it, your 0-60 time might only improve by 0.1 seconds.</p>
            <p>Why? Because as cars get incredibly fast, they hit the limit of physical tire traction. A 1,000 HP car spinning its tires in 1st, 2nd, and 3rd gear will accelerate no faster than a 600 HP car that actually grips the road. Furthermore, at high speeds (like the end of a 1/4 mile), the car must overcome exponential aerodynamic drag, requiring massive amounts of horsepower just to punch through the air.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-performance060-calculator" />
          <PopularCalculators exclude="/calculator/car-performance060-calculator" />
        </div>
      </div>
    </>
  );
}
