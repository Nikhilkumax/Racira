"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Map } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface CompareInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  distance: number;
  walkSpeed: number;
  runSpeed: number;
}

interface CompareResults {
  walkCalories: number;
  runCalories: number;
  walkTimeMins: number;
  runTimeMins: number;
  
  walkMet: number;
  runMet: number;

  chartData: { name: string; calories: number; color: string }[];
}

// Helper to estimate METs based on speed
const getWalkMet = (speedMph: number): number => {
  if (speedMph <= 2.0) return 2.8;
  if (speedMph <= 2.5) return 3.0;
  if (speedMph <= 3.0) return 3.5;
  if (speedMph <= 3.5) return 4.3;
  if (speedMph <= 4.0) return 5.0;
  return 5.5; // very brisk walking
};

const getRunMet = (speedMph: number): number => {
  if (speedMph <= 5.0) return 8.3;
  if (speedMph <= 6.0) return 9.8;
  if (speedMph <= 7.0) return 11.0;
  if (speedMph <= 8.0) return 11.8;
  if (speedMph <= 9.0) return 12.8;
  if (speedMph <= 10.0) return 14.5;
  return 16.0; // very fast running
};

// 2. Pure Calculation Function
const calculateComparison = (inputs: CompareInputs): CompareResults | null => {
  const { unitSystem, weight, distance, walkSpeed, runSpeed } = inputs;
  
  if (weight <= 0 || distance <= 0 || walkSpeed <= 0 || runSpeed <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  
  // Convert all speeds/distances to Imperial for MET matching, then do the math.
  const distMiles = unitSystem === "imperial" ? distance : distance * 0.621371;
  const walkMph = unitSystem === "imperial" ? walkSpeed : walkSpeed * 0.621371;
  const runMph = unitSystem === "imperial" ? runSpeed : runSpeed * 0.621371;

  const walkMet = getWalkMet(walkMph);
  const runMet = getRunMet(runMph);

  // Time in hours = Distance / Speed
  const walkTimeHrs = distMiles / walkMph;
  const runTimeHrs = distMiles / runMph;

  // Calories = MET * weight(kg) * time(hrs)
  const walkCalories = walkMet * wKg * walkTimeHrs;
  const runCalories = runMet * wKg * runTimeHrs;

  const chartData = [
    { name: "Walking", calories: Math.round(walkCalories), color: "#3b82f6" },
    { name: "Running", calories: Math.round(runCalories), color: "#ec4899" }
  ];

  return {
    walkCalories: Math.round(walkCalories),
    runCalories: Math.round(runCalories),
    walkTimeMins: Math.round(walkTimeHrs * 60),
    runTimeMins: Math.round(runTimeHrs * 60),
    walkMet,
    runMet,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "160",
  distance: "3",
  walkSpeed: "3", // mph
  runSpeed: "6", // mph
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</p>
        <p className="text-muted-foreground"><span className="font-bold">{payload[0].value}</span> Calories Burned</p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", onEnter, ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function WalkVsRunCalorieComparisonCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [walkSpeed, setWalkSpeed] = useState(DEFAULTS.walkSpeed);
  const [runSpeed, setRunSpeed] = useState(DEFAULTS.runSpeed);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CompareResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(distance);
    const ws = parseFloat(walkSpeed);
    const rs = parseFloat(runSpeed);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid distance.");
    if (isNaN(ws) || ws <= 0) return setErrorMsg("Please enter a valid walking speed.");
    if (isNaN(rs) || rs <= 0) return setErrorMsg("Please enter a valid running speed.");

    const res = calculateComparison({ unitSystem, weight: w, distance: d, walkSpeed: ws, runSpeed: rs });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setWeight(DEFAULTS.weight);
    setDistance(DEFAULTS.distance);
    setWalkSpeed(DEFAULTS.walkSpeed);
    setRunSpeed(DEFAULTS.runSpeed);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Walk vs Run Calorie Comparison</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Do you burn the same amount of calories walking and running a mile?", answer: "No, this is a common fitness myth. Running a mile burns approximately 20% to 30% more calories than walking the exact same distance. Running is entirely different biomechanically; it requires your body to lift its entire weight off the ground with every stride (a series of continuous bounds), which requires significantly more explosive muscle power and cardiovascular effort than the continuous contact of walking." },
    { question: "Why does running burn more calories over the same distance?", answer: "Running requires a massive recruitment of fast-twitch muscle fibers and drastically elevates your heart rate, pushing your body into an anaerobic state. The sheer force required to propel your body mass into the air and absorb the impact upon landing creates a massive demand for oxygen (measured in METs), resulting in a much higher caloric burn per mile compared to walking." },
    { question: "Is walking better for 'fat burning' than running?", answer: "It depends on how you measure 'better.' Because walking is a low-intensity, aerobic activity, a higher percentage of the calories burned come from fat stores rather than muscle glycogen. However, running burns far more total calories in the same amount of time. Since fat loss is dictated entirely by total caloric deficit, running is ultimately faster for weight loss simply because you burn a massive amount of total energy." },
    { question: "What is the 'Afterburn Effect' (EPOC)?", answer: "EPOC stands for Excess Post-Exercise Oxygen Consumption, commonly known as the Afterburn Effect. High-intensity running causes micro-tears in your muscles and severely depletes oxygen and glycogen. Your body must burn additional calories for hours after the run just to repair this damage and return to baseline. Walking is so low-intensity that it generates almost zero EPOC; once you stop walking, your calorie burn drops back to normal almost immediately." },
    { question: "If running burns more, why walk?", answer: "Walking is the ultimate sustainable exercise. Running places extreme stress on the joints, ligaments, and tendons of the knees and ankles. Heavy runners, or those with existing joint issues, risk severe injury from running. Walking can be done daily with almost zero recovery time required, making it incredibly effective for long-term, sustainable weight management." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Walk vs Run Calorie Comparison Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Walk vs. Run Calorie Comparison</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs/mph)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg/kmh)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Map className="h-4 w-4" /> Distance & Physics
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact thermodynamic difference between moving your body weight across a set distance at two different intensities.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} onEnter={handleCalculate} />
              <CompactInput id="dist" label="Target Distance" value={distance} onChange={setDistance} suffix={unitSystem === "imperial" ? "miles" : "km"} onEnter={handleCalculate} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="wspeed" label="Walking Speed" value={walkSpeed} onChange={setWalkSpeed} suffix={unitSystem === "imperial" ? "mph" : "km/h"} onEnter={handleCalculate} />
              <CompactInput id="rspeed" label="Running Speed" value={runSpeed} onChange={setRunSpeed} suffix={unitSystem === "imperial" ? "mph" : "km/h"} onEnter={handleCalculate} />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                            <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Primary Result Card */}
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden shadow-sm">
                    <div className="relative z-10 flex flex-col gap-2">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Walking Outcome
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold tracking-tight text-primary">{results.walkCalories.toLocaleString()}</div>
                        <div className="text-sm font-bold text-muted-foreground">kcal</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <Timer className="h-4 w-4" /> {results.walkTimeMins} Minutes to complete
                      </div>
                    </div>
                    <Flame className="absolute -bottom-4 -right-4 h-24 w-24 opacity-5 text-primary" />
                  </div>

                  {/* Running Card */}
                  <div className="bg-card border border-border rounded-lg p-5 relative overflow-hidden shadow-sm">
                    <div className="relative z-10 flex flex-col gap-2">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Running Outcome
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold tracking-tight text-foreground">{results.runCalories.toLocaleString()}</div>
                        <div className="text-sm font-bold text-muted-foreground">kcal</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <Timer className="h-4 w-4" /> {results.runTimeMins} Minutes to complete
                      </div>
                    </div>
                    <Flame className="absolute -bottom-4 -right-4 h-24 w-24 opacity-5 text-pink-500" />
                  </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_200px] gap-4">
                  {/* Bar Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[220px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Total Caloric Burn Comparison</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[0, 4, 4, 0]} barSize={40}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Physics Panel */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 flex flex-col justify-center">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 text-center">Metabolic Equivalent (METs)</h3>
                    <div className="flex flex-col gap-3 text-center">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400">{results.walkMet.toFixed(1)}</div>
                        <div className="text-[10px] uppercase font-bold text-blue-600/70 mt-1">Walk Intensity</div>
                      </div>
                      <div className="bg-pink-500/10 border border-pink-500/20 rounded-md p-3">
                        <div className="text-xl font-black text-pink-600 dark:text-pink-400">{results.runMet.toFixed(1)}</div>
                        <div className="text-[10px] uppercase font-bold text-pink-600/70 mt-1">Run Intensity</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Map className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your weight, a target distance, and two different speeds to calculate the exact physiological difference between walking and running.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Great Debate: Walking vs. Running for Calorie Burn</h2>
            <p>One of the most pervasive myths in the fitness industry is the belief that moving a specific mass across a specific distance burns the exact same amount of energy, regardless of speed. People often say, "A mile is a mile; if you weigh 150 pounds, you'll burn 100 calories whether you walk it or run it." From a strict Newtonian physics perspective (Work = Force × Distance), this sounds logical. However, human biology does not operate like a simple machine. The <strong>Walk vs Run Calorie Comparison Calculator</strong> mathematically proves that the biomechanics and cardiovascular demands of running force your body to expend significantly more energy over the exact same distance compared to walking.</p>

            <h2 className="text-2xl font-bold mb-3">Why Running Burns More Calories Per Mile</h2>
            <p>The difference in caloric burn comes down entirely to biomechanical efficiency and metabolic demand. Walking is an incredibly efficient mode of transportation. During a walk, one foot is almost always in contact with the ground, and your center of gravity moves forward in a smooth, relatively flat plane. Your body has evolved over millions of years to make walking as metabolically cheap as possible to conserve energy.</p>
            <p>Running is the exact opposite. Biomechanically, running is a series of continuous, explosive bounds. To run, your leg muscles must generate enough vertical force to propel your entire body weight completely off the ground (the "flight phase"). Upon landing, your muscles and tendons must absorb massive shock forces—often up to 3 times your body weight. This explosive lifting and harsh landing requires massive recruitment of fast-twitch muscle fibers, which burn energy at a highly inefficient, rapid rate. Because your body has to do so much vertical "work" to move forward, running a mile burns approximately <strong>20% to 30% more calories</strong> than walking that exact same mile.</p>

            <h2 className="text-2xl font-bold mb-3">The Role of METs (Metabolic Equivalents)</h2>
            <p>To accurately calculate calorie burn, exercise physiologists use a metric called METs (Metabolic Equivalent of Task). One MET is defined as the energy you burn while sitting perfectly still at rest. </p>
            <p>A brisk walk at 3.5 miles per hour has a MET value of roughly 4.3. This means that while walking, you are burning calories at 4.3 times your resting rate. Conversely, running at a moderate pace of 6.0 miles per hour has a MET value of 9.8. You are burning energy at nearly 10 times your resting rate. The calculator uses these exact, clinically established MET values, multiplied by your specific body weight and the duration of the activity, to output a highly accurate caloric comparison.</p>

            <h2 className="text-2xl font-bold mb-3">Time Efficiency: The Ultimate Running Advantage</h2>
            <p>While the difference in calories burned <em>per mile</em> is significant (roughly a 20-30% difference), the difference in calories burned <em>per minute</em> is absolutely massive. This is where running truly shines as a weight-loss tool for busy individuals.</p>
            <p>If you only have exactly 30 minutes to exercise before work, your choice of activity dictates your results. A 160-pound person walking at 3 mph for 30 minutes will cover 1.5 miles and burn roughly 125 calories. That same person running at 6 mph for 30 minutes will cover 3.0 miles and burn over 350 calories. In the exact same 30-minute time block, running yields almost triple the caloric burn. If your primary goal is maximizing energy expenditure in a limited timeframe, running is exponentially more efficient.</p>

            <h2 className="text-2xl font-bold mb-3">The Afterburn Effect (EPOC)</h2>
            <p>The caloric gap between walking and running actually widens after the workout is completely finished due to a physiological phenomenon known as Excess Post-Exercise Oxygen Consumption (EPOC), commonly called the "Afterburn Effect."</p>
            <p>When you walk, you stay in a comfortable aerobic state. Your body consumes oxygen easily, and when you stop walking, your heart rate and metabolism return to baseline almost instantly. There is virtually zero EPOC.</p>
            <p>Running, however, pushes your cardiovascular system to its limits, causing micro-tears in your muscle fibers, depleting glycogen stores, and elevating your core temperature. To repair this massive physiological disruption and restore homeostasis, your body must rapidly consume oxygen and burn calories for hours after the run has ended. You might burn an additional 50 to 100 "bonus" calories while sitting on the couch recovering from a hard run, further cementing running's superiority for absolute caloric expenditure.</p>

            <h2 className="text-2xl font-bold mb-3">Is Walking Better for "Fat Burning"?</h2>
            <p>You may have heard that low-intensity exercise like walking puts you in the "Fat Burning Zone." This is scientifically true, but highly misleading. When you walk, the intensity is so low that your body has plenty of time to convert stored body fat into energy via oxidation. Therefore, a higher <em>percentage</em> of the calories burned while walking come from fat.</p>
            <p>When you run, the intensity is so high that your body demands instant fuel. It cannot oxidize fat fast enough, so it switches to burning stored carbohydrates (glycogen). Therefore, a higher percentage of the calories burned while running come from sugar, not fat.</p>
            <p>However, total fat loss is dictated entirely by a 24-hour caloric deficit, not the specific fuel source used during a 30-minute workout. Because running burns so many more total calories overall, it creates a much larger daily caloric deficit. Ultimately, the person running will lose more total body fat over time than the person walking, assuming their diets are identical.</p>

            <h2 className="text-2xl font-bold mb-3">The Case for Walking: Joint Health and Sustainability</h2>
            <p>If running burns more calories per mile, more calories per minute, and generates an afterburn effect, why should anyone walk? The answer lies in orthopedics and sustainability. </p>
            <p>Running is incredibly punishing on the human skeletal system. The repetitive impact can cause shin splints, stress fractures, plantar fasciitis, and severe knee cartilage degradation (runner's knee). If you weigh over 200 pounds, running can be downright dangerous for your joints. Walking, on the other hand, is a low-impact activity that causes virtually zero orthopedic trauma. You can walk 5 miles a day, every single day, without ever needing a "recovery day." For long-term, sustainable, injury-free weight management, walking is arguably the greatest exercise tool in existence. Use the calculator to balance your goals: run for time efficiency and cardiovascular power, or walk for joint health and sustainable daily volume.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/walk-vs-run-calorie-comparison-calculator" />
          <PopularCalculators exclude="/calculator/walk-vs-run-calorie-comparison-calculator" />
        </div>
      </div>
    </>
  );
}
