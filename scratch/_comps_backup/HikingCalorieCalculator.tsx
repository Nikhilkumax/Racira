"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Mountain } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface HikingInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  packWeight: number;
  durationMins: number;
  terrain: "flat" | "moderate" | "steep";
}

interface HikingResults {
  totalCalories: number;
  metValue: number;
  terrainName: string;
  totalMassMovedKg: number;
  totalMassMovedLbs: number;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const TERRAIN_STYLES = {
  "flat": { name: "Flat / Gentle Trails", met: 5.0 },
  "moderate": { name: "Moderate Incline / Rolling Hills", met: 6.0 },
  "steep": { name: "Steep Incline / Scrambling", met: 7.3 }
};

// 2. Pure Calculation Function
const calculateHikingCalories = (inputs: HikingInputs): HikingResults | null => {
  const { unitSystem, weight, packWeight, durationMins, terrain } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  // Add pack weight to body weight for TOTAL mass moved against gravity
  const totalWeight = weight + packWeight;
  const wKg = unitSystem === "imperial" ? totalWeight * 0.453592 : totalWeight;
  const wLbs = unitSystem === "imperial" ? totalWeight : totalWeight * 2.20462;
  
  const durationHrs = durationMins / 60;
  
  const selectedTerrain = TERRAIN_STYLES[terrain];
  const totalCalories = selectedTerrain.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(TERRAIN_STYLES).map(key => {
    const s = TERRAIN_STYLES[key as keyof typeof TERRAIN_STYLES];
    return {
      name: s.name.split(" / ")[0], // Shorter name for chart
      calories: Math.round(s.met * wKg * durationHrs),
      isSelected: key === terrain
    };
  });

  return {
    totalCalories: Math.round(totalCalories),
    metValue: selectedTerrain.met,
    terrainName: selectedTerrain.name,
    totalMassMovedKg: Math.round(wKg),
    totalMassMovedLbs: Math.round(wLbs),
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "170",
  packWeight: "15",
  durationMins: "120", // 2 hours
  terrain: "moderate" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const isSelected = payload[0].payload.isSelected;
    return (
      <div className={`bg-card border p-2.5 rounded-lg shadow-md text-xs font-semibold ${isSelected ? 'border-primary' : 'border-border'}`}>
        <p className="font-bold mb-1 text-foreground">{payload[0].payload.name}</p>
        <p className="text-muted-foreground"><span className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{payload[0].value}</span> kcal</p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
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
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function HikingCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [packWeight, setPackWeight] = useState(DEFAULTS.packWeight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [terrain, setTerrain] = useState<"flat" | "moderate" | "steep">(DEFAULTS.terrain);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<HikingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const p = parseFloat(packWeight) || 0; // Pack weight can be 0
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid duration.");

    const res = calculateHikingCalories({ unitSystem, weight: w, packWeight: p, durationMins: d, terrain });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setWeight(DEFAULTS.weight);
    setPackWeight(DEFAULTS.packWeight);
    setDurationMins(DEFAULTS.durationMins);
    setTerrain(DEFAULTS.terrain);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, weight, packWeight, durationMins, terrain]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Hiking Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why does hiking burn more calories than walking?", answer: "When you walk on a paved, perfectly flat sidewalk, your body establishes a highly efficient rhythm. Your center of gravity remains perfectly level, and your momentum carries you forward. Hiking destroys this efficiency. The uneven terrain forces your stabilizer muscles, ankles, and core to constantly fire to keep you balanced. Furthermore, stepping up onto rocks and roots acts as thousands of continuous single-leg squats, drastically increasing the muscular demand and oxygen required." },
    { question: "How does my backpack affect the caloric burn?", answer: "Physics dictates that Work = Force × Distance. Your leg muscles cannot tell the difference between your body fat and a backpack; they only know the total mass they must propel upward against gravity. If you weigh 160 pounds and carry a 40-pound pack, your calves and quadriceps are doing the mechanical work of a 200-pound person. This massive increase in mechanical resistance directly translates into a much higher absolute caloric expenditure." },
    { question: "Why does elevation grade change the MET value?", answer: "Walking on flat ground requires you to move mass horizontally. Walking up a steep incline requires you to move mass both horizontally AND vertically. Lifting mass straight up against gravity requires exponentially more force (and therefore ATP energy) from your muscles. The steeper the incline, the more vertical 'work' you are performing, which pushes your heart rate higher and increases the MET multiplier from 5.0 (Flat) to 7.3 (Steep)." },
    { question: "Should I subtract calories for the hike down?", answer: "No. While hiking downhill requires less cardiovascular output (lower heart rate), it creates massive mechanical damage. Hiking downhill forces your quadriceps to perform 'eccentric' contractions—meaning the muscle is lengthening while under tension to act as a brake and prevent you from falling. Eccentric contractions cause massive micro-tearing in the muscle tissue, leading to severe soreness and requiring significant calories (EPOC) to repair over the next 48 hours." },
    { question: "Is hiking an effective way to lose belly fat?", answer: "Yes, exceptionally so. Hiking is LISS (Low-Intensity Steady State) cardio. Because your heart rate stays in a moderate zone for extended periods of time (often 2 to 4 hours), your body primarily oxidizes stored body fat for fuel rather than burning through immediate glycogen stores. If combined with a proper caloric deficit, the massive sustained caloric burn of long hikes will rapidly strip away body fat." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Hiking Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hiking Calorie Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Mountain className="h-4 w-4" /> Terrain Mechanics
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact thermodynamic cost of propelling your total load (body mass + pack weight) vertically against gravity.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="pack" label="Backpack Weight" value={packWeight} onChange={setPackWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <CompactInput id="dur" label="Total Duration on Trail" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Terrain / Elevation Profile</label>
              <select value={terrain} onChange={(e: any) => setTerrain(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="flat">Flat / Gentle Trails (Minimal elevation)</option>
                <option value="moderate">Moderate (Rolling hills, steady inclines)</option>
                <option value="steep">Steep Incline (Heavy climbing, rock scrambling)</option>
              </select>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">Calculate</button>
<button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-sm font-bold uppercase tracking-wider mb-1 text-muted-foreground">
                        Total Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight text-foreground">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-muted-foreground">kcal</div>
                      </div>
                      <div className="text-sm font-bold text-green-700 mt-2 bg-green-500/10 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" /> {results.terrainName}
                      </div>
                    </div>

                    <div className="bg-background/80 border border-border/60 rounded-lg p-4 text-center min-w-[140px]">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Mass Propelled</div>
                      <div className="text-2xl font-black text-foreground">
                        {unitSystem === "imperial" ? results.totalMassMovedLbs : results.totalMassMovedKg}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">{unitSystem === "imperial" ? "LBS" : "KG"}</div>
                    </div>
                  </div>
                  <Mountain className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10 text-green-700" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Comparative Elevation Output</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">How your selected trail grade compares to other elevation profiles over the exact same duration.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#15803d' : 'hsl(var(--muted))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Timer className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your body weight, backpack weight, time on the trail, and elevation grade to accurately calculate the massive thermodynamic demand of hiking.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Hidden Physics of Hiking</h2>
            <p>To the untrained observer, hiking appears to be nothing more than walking outdoors. From a physiological and thermodynamic perspective, however, it is an entirely different mechanical beast. Walking on a flat, paved sidewalk is a highly efficient form of transportation; hiking up a mountain with a loaded backpack is a grueling, multi-hour resistance training session that demands massive cardiovascular output. The <strong>Hiking Calorie Calculator</strong> bypasses the inaccurate generalizations of fitness trackers by utilizing clinical Metabolic Equivalent (MET) formulas. By mathematically combining your specific body mass with the dead weight of your pack, and factoring in the vertical severity of the terrain, it provides an exact measurement of the energy required to conquer the trail.</p>

            <h2 className="text-2xl font-bold mb-3">Why Hiking Obliterates Walking for Fat Loss</h2>
            <p>If you walk 3 miles on a paved road, your body establishes a perfectly efficient rhythm. Your center of gravity never changes, your feet land on perfectly level ground, and your forward momentum does most of the physical work. Your body requires very little oxygen to sustain this.</p>
            <p>Hiking destroys this efficiency entirely. First, the terrain is uneven. With every step on dirt, rocks, or mud, your ankle stabilizers, knees, and deep core muscles must forcefully fire just to keep you upright. This continuous isometric stabilization requires significant energy. Second, trails are not flat. When you step up onto a 12-inch rock, you are essentially performing a single-leg weighted squat. You are forcing your glutes and quadriceps to lift your entire body weight straight up against gravity. Doing this thousands of times over several hours creates a massive oxygen demand, drastically spiking the calories burned per minute compared to standard walking.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of the Backpack</h2>
            <p>One of the most critical variables in hiking physics is your backpack. Your leg muscles cannot differentiate between biological fat and nylon gear; they only recognize the total <strong>mass</strong> they must propel against gravity.</p>
            <p>If you weigh 150 pounds and strap on a 30-pound multi-day hiking pack, you have just forced your body to do the mechanical work of a 180-pound person. This 20% increase in mass requires a massive increase in physiological energy (ATP) to move. Every single step requires your heart to pump harder to deliver oxygen to your strained quadriceps. By strictly adding your pack weight to your body weight before applying the MET multiplier, our calculator ensures that your total load is mathematically accounted for, preventing the massive underestimations seen in standard walking calculators.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Terrain Grade and METs</h2>
            <p>Exercise physiologists measure physical effort using METs (Metabolic Equivalents). One MET is the energy you burn while sitting still. In hiking, the MET value is dictated almost entirely by the steepness of the terrain:</p>
            <ul>
              <li><strong>Flat / Gentle Trails (MET 5.0):</strong> You are hiking on relatively level dirt paths with minimal elevation gain. The uneven surface requires more energy than pavement, burning roughly 5 times your resting metabolic rate.</li>
              <li><strong>Moderate Incline (MET 6.0):</strong> You are navigating rolling hills and steady, noticeable inclines. You are breathing heavily and sweating, as your body is forced to continuously move mass vertically.</li>
              <li><strong>Steep Incline / Scrambling (MET 7.3):</strong> This is the most grueling phase of hiking. You are navigating switchbacks, steep stair-steps, or using your hands to scramble over boulders. Your heart rate is pushed into the high aerobic zone. You are burning over 7 times your resting metabolic rate—a caloric burn rate that easily rivals intense jogging, but sustained over several hours.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Downhill Trap: Eccentric Muscle Damage</h2>
            <p>Many hikers assume they stop burning calories on the hike down because their heart rate drops and they stop breathing heavily. While the immediate cardiovascular demand decreases, the mechanical damage skyrockets.</p>
            <p>Hiking downhill forces your quadriceps into "eccentric" contractions. This means the muscle is lengthening while it is under tension, acting as a brutal brake to prevent gravity from pulling you down the mountain. Eccentric contractions cause massive microscopic tearing in the muscle tissue (which is why your legs are severely sore the next day). Repairing this massive muscular trauma requires significant calories (via the Afterburn Effect, or EPOC) over the next 24 to 48 hours. Your hike continues to burn calories long after you have reached the parking lot.</p>

            <h2 className="text-2xl font-bold mb-3">Hiking as the Ultimate LISS Cardio</h2>
            <p>In the fitness world, "LISS" stands for Low-Intensity Steady State cardio. While high-intensity interval training (HIIT) burns glycogen (sugar) rapidly, LISS cardio burns fat. Because hiking keeps your heart rate elevated in a moderate, steady zone for 2 to 6 hours at a time, your body primarily oxidizes stored body fat to fuel the long, slow effort.</p>
            <p>Furthermore, hiking produces very low central nervous system fatigue compared to heavy weightlifting or sprinting. You can hike for 4 hours, burn 2,000 calories, and still function the next day. If combined with a disciplined, protein-rich diet to ensure a caloric deficit, hiking is arguably one of the most enjoyable and effective fat-loss protocols in existence.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Conquer the Mountain</h2>
            <p>A smart watch cannot accurately sense the 20-pound pack on your back, nor can it perfectly account for the uneven mud pulling at your boots. It relies entirely on heart rate, which often leads to wildly inaccurate estimations. Stop relying on generic technology. Use the Hiking Calorie Calculator to input your exact mass, load, and terrain data. Track your true energy expenditure, pack the correct amount of nutritional fuel, and conquer your next summit with mathematical precision.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hiking-calorie-calculator" />
          <PopularCalculators exclude="/calculator/hiking-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
