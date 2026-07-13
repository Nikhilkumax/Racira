"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from "recharts";

interface CyclingResult {
  caloriesBurned: number;
  caloriesPerHour: number;
  metValue: number;
  distanceMiles: number;
  speedMph: number;
  chartData: { name: string; calories: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcCycling(
  weightLbs: number, durationMins: number,
  intensity: string, terrain: string
): CyclingResult {
  const weightKg = weightLbs / 2.20462;
  
  // Base MET values for cycling based on intensity (Speed approximations)
  let met = 4.0;
  let speedMph = 10.0;

  if (intensity === "leisure") {
    met = 4.0; // < 10 mph, leisure
    speedMph = 8.5;
  } else if (intensity === "light") {
    met = 6.0; // 10-11.9 mph, light effort
    speedMph = 11.0;
  } else if (intensity === "moderate") {
    met = 8.0; // 12-13.9 mph, moderate effort
    speedMph = 13.0;
  } else if (intensity === "vigorous") {
    met = 10.0; // 14-15.9 mph, vigorous
    speedMph = 15.0;
  } else if (intensity === "racing") {
    met = 12.0; // 16-19 mph, racing
    speedMph = 17.5;
  } else if (intensity === "elite") {
    met = 16.0; // > 20 mph, elite racing
    speedMph = 21.0;
  }

  // Adjust for terrain
  if (terrain === "bmx") {
    met = 8.5; // BMX or mountain bike on dirt
    speedMph = 12.0; // speed is usually lower but effort is high
  } else if (terrain === "mountain") {
    met = 14.0; // Hard steep mountain biking
    speedMph = 10.0; // speed is lower, but wattage/MET is massive
  } else if (terrain === "stationary") {
    // Keep base METs for stationary, but slightly reduce if leisure
    if (intensity === "leisure") met = 3.5;
  }

  // Calculate calories
  // Calories/min = (MET * 3.5 * weightKg) / 200
  const calPerMin = (met * 3.5 * weightKg) / 200;
  const caloriesBurned = Math.round(calPerMin * durationMins);
  const caloriesPerHour = Math.round(calPerMin * 60);

  // Approximate distance
  const distanceMiles = Number((speedMph * (durationMins / 60)).toFixed(1));

  // Chart data (compare against other common intensities for the same duration)
  const chartData = [
    { name: "Leisure (<10mph)", calories: Math.round(((4.0 * 3.5 * weightKg) / 200) * durationMins) },
    { name: "Light (10-12mph)", calories: Math.round(((6.0 * 3.5 * weightKg) / 200) * durationMins) },
    { name: "Your Ride", calories: caloriesBurned },
    { name: "Vigorous (14-16mph)", calories: Math.round(((10.0 * 3.5 * weightKg) / 200) * durationMins) },
    { name: "Racing (16-19mph)", calories: Math.round(((12.0 * 3.5 * weightKg) / 200) * durationMins) },
  ];

  const summaryStats = [
    { label: "Est. Distance", value: `${distanceMiles} miles` },
    { label: "Est. Speed", value: `${speedMph.toFixed(1)} mph` },
    { label: "Intensity (METs)", value: met.toFixed(1) },
    { label: "Burn Rate", value: `${caloriesPerHour} kcal/hr` },
  ];

  return { caloriesBurned, caloriesPerHour, metValue: met, distanceMiles, speedMph, chartData, summaryStats };
}

export default function CyclingCaloriesCalculator() {
  const [weight, setWeight] = useState("175");
  const [duration, setDuration] = useState("45");
  const [intensity, setIntensity] = useState("moderate");
  const [terrain, setTerrain] = useState("road");

  const [result, setResult] = useState<CyclingResult | null>(null);

  const calculate = () => {
    setResult(calcCycling(
      parseInt(weight) || 175, parseInt(duration) || 45, intensity, terrain
    ));
  };

  useEffect(() => { setResult(calcCycling(175, 45, "moderate", "road")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why does cycling burn so many calories?", answer: "Cycling utilizes the largest muscle groups in your body: the quadriceps, hamstrings, and glutes. Engaging these massive muscles continuously to push against resistance (pedals/gears) requires a massive amount of oxygen and cellular energy (ATP), leading to extremely high caloric expenditure, especially at high speeds." },
    { question: "Is cycling better than running for weight loss?", answer: "Cycling offers a massive advantage for weight loss because it is low-impact. Running a 10-minute mile burns a lot of calories, but the repeated impact on your knees and ankles means most people can't run for 90 minutes. A cyclist can comfortably ride for 2 hours, burning 1,200+ calories in a single session without joint pain." },
    { question: "How does wind resistance affect calorie burn?", answer: "Aerodynamic drag increases exponentially with speed. To double your speed on a bike, you must produce roughly eight times the wattage (power). This is why moving from 12 mph (8.0 METs) to 18 mph (12.0 METs) requires drastically more calories—you are spending most of your energy simply pushing air out of the way." },
    { question: "Why is Mountain Biking rated so high?", answer: "Mountain biking (14.0 METs) requires intense bursts of anaerobic power to climb steep grades, combined with immense upper body stabilization and core control to navigate rocks and roots downhill. The physical demand is often equivalent to or higher than elite road racing." },
    { question: "Are stationary bikes just as effective?", answer: "Yes, assuming you apply the same resistance. A stationary bike set to high resistance (like a Spin class) can easily reach 10-12 METs, matching vigorous road cycling. However, because you don't have to balance or push through wind, easy pedaling on a stationary bike while watching TV (Leisure) burns significantly fewer calories than outdoor riding." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Cycling Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Cycling Calorie Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Your Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">lbs</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Ride Duration</label>
                <div className={inp}><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className={ci} /><span className="pr-3 text-sm text-muted-foreground">mins</span></div>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Gauge className="w-4 h-4" /> Ride Profile</p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Ride Intensity / Speed</label>
                  <select value={intensity} onChange={e => setIntensity(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                    <option value="leisure">Leisure (&lt; 10 mph)</option>
                    <option value="light">Light Effort (10-11.9 mph)</option>
                    <option value="moderate">Moderate Effort (12-13.9 mph)</option>
                    <option value="vigorous">Vigorous (14-15.9 mph)</option>
                    <option value="racing">Racing / Hard (16-19 mph)</option>
                    <option value="elite">Elite / Pelaton (&gt; 20 mph)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Terrain / Style</label>
                  <select value={terrain} onChange={e => setTerrain(e.target.value)} className={`${inp} w-full px-3 text-sm`}>
                    <option value="road">Road / Paved (Standard)</option>
                    <option value="stationary">Stationary Bike / Spin</option>
                    <option value="bmx">Dirt / BMX</option>
                    <option value="mountain">Mountain Biking (Steep/Technical)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setWeight("175"); setDuration("45"); setIntensity("moderate"); setTerrain("road"); setResult(calcCycling(175, 45, "moderate", "road")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 flex flex-col justify-center items-center text-center">
                <div className="text-sm font-bold uppercase tracking-wider mb-1 text-primary">Energy Expended</div>
                <div className="text-5xl font-extrabold text-foreground tracking-tight">{result.caloriesBurned} <span className="text-xl font-normal text-muted-foreground">kcal</span></div>
                <div className="text-base text-muted-foreground mt-2">
                  Burned over an estimated <span className="font-medium text-foreground">{result.distanceMiles} mile</span> ride taking <span className="font-medium text-foreground">{duration} minutes</span>.
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className={`p-4 text-center flex flex-col justify-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                    <div className="text-sm font-bold text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Burn Comparison (for a {duration}-min ride)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "var(--secondary)" }} formatter={(v: any) => [`${v} kcal`, "Burn"]} />
                    <Bar dataKey="calories" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} barSize={40}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "Your Ride" ? "#3b82f6" : "var(--border)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Weight Loss Power of Cycling</h2>
            <p>This <strong>Cycling Calorie Calculator</strong> uses the clinical METs (Metabolic Equivalent of Task) formula to estimate the energy you burn on a bike. Because cycling is a low-impact exercise, it is often considered superior to running for sustainable weight loss. While running burns massive calories, it causes joint degradation and severe CNS (Central Nervous System) fatigue, meaning you can't run for hours on end. Cyclists, however, routinely go for 2 or 3-hour rides, allowing them to burn upwards of 1,500 calories in a single, enjoyable session.</p>
            <h2 className="text-2xl font-bold mb-3">Aerodynamic Drag and Caloric Burn</h2>
            <p>If you've ever watched the Tour de France, you know aerodynamics are everything. On a flat road, roughly 70% to 90% of the resistance a cyclist must overcome is aerodynamic drag (air pushing against you). Crucially, air resistance is not linear—it increases exponentially with speed. To ride at 10 mph requires a light 6.0 METs of effort. To double that speed to 20 mph, you do not simply double your effort; you must quadruple your power output (reaching 16.0+ METs). This exponential difficulty means fast cycling is one of the most intense caloric burners possible.</p>
            <h2 className="text-2xl font-bold mb-3">Mountain Biking vs Road Cycling</h2>
            <p>You might be surprised to see Mountain Biking rated at a massive 14.0 METs, higher than many fast road cycling paces. When navigating steep, rocky terrain, a mountain biker is constantly standing on the pedals, using their upper body to lift the front wheel, and using their core to balance. This full-body anaerobic engagement spikes caloric burn even when the actual miles-per-hour speed is very low. Related tools: <a href="/calculator/calories-burned-walking">Walking Calorie Calculator</a>, <a href="/calculator/daily-calorie-burn-calculator">TDEE Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cycling-calories-calculator" />
          <PopularCalculators exclude="/calculator/cycling-calories-calculator" />
        </div>
      </div>
    </>
  );
}
